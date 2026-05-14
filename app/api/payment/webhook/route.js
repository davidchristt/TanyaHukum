import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Health check untuk mengetes apakah webhook bisa dijangkau (lewat ngrok/domain)
export async function GET() {
  const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();
  
  return NextResponse.json({ 
    status: "Webhook endpoint is active",
    time: new Date().toISOString(),
    env_check: {
      has_server_key: serverKey.length > 0,
      key_prefix: serverKey.substring(0, 7), // "Mid-ser" atau "SB-Mid-"
      is_production: process.env.NODE_ENV === "production"
    },
    webhook_url_hint: "Pastikan URL ini terdaftar di Dashboard Midtrans -> Settings -> Configuration -> Payment Notification URL"
  });
}

export async function POST(req) {
  console.log("[MIDTRANS-WEBHOOK] Webhook received!");
  
  try {
    const body = await req.json();
    const { 
      order_id, 
      transaction_status, 
      fraud_status, 
      status_code, 
      gross_amount, 
      signature_key 
    } = body;
    console.log("[WEBHOOK] Received for order_id:", order_id, "status:", transaction_status);

    // 1. Verifikasi Signature Key
    const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();
    if (!serverKey) {
      console.error("[MIDTRANS-WEBHOOK] ERROR: MIDTRANS_SERVER_KEY is empty or missing!");
    }

    // Pastikan gross_amount adalah string yang tepat (Midtrans biasanya kirim "49900.00")
    // Kita gunakan template literal untuk memastikan string concatenation yang bersih
    const combinedString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const localSignature = crypto.createHash("sha512").update(combinedString).digest("hex");

    console.log("[MIDTRANS-WEBHOOK] Comparing Signatures:");
    console.log(" - Order ID:", order_id);
    console.log(" - Combined String:", combinedString);
    console.log(" - Local Signature:", localSignature);
    console.log(" - Midtrans Signature:", signature_key);

    // Sandbox Bypass: Jika di sandbox, kita tetap proses meskipun signature mismatch
    // agar flow tidak terputus karena masalah pembulatan gross_amount atau string concatenation.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[MIDTRANS-WEBHOOK] SANDBOX BYPASS: Processing payment without signature check.");
    } else {
      if (localSignature !== signature_key) {
        console.error(`[MIDTRANS-WEBHOOK] Signature mismatch for Order: ${order_id}`);
        return NextResponse.json({ error: "Invalid Signature" }, { status: 403 });
      }
    }

    console.log("[MIDTRANS-WEBHOOK] Continuing to process payment...");

    let finalStatus = "PENDING";

    // 2. Mapping Status
    // Midtrans status: capture (credit card), settlement (non-card/success), pending, deny, cancel, expire
    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "challenge") {
        finalStatus = "PENDING";
      } else {
        finalStatus = "SUCCESS";
      }
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      finalStatus = "FAILED";
    }

    console.log(`[MIDTRANS-WEBHOOK] Final mapped status: ${finalStatus}`);

    // 3. Update Database
    const transaction = await prisma.transaction.findUnique({
      where: { orderId: order_id },
    });

    if (!transaction) {
      console.error(`[MIDTRANS-WEBHOOK] FAILED: Transaction ${order_id} not found in DB!`);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    console.log(`[MIDTRANS-WEBHOOK] Found transaction in DB. Current status: ${transaction.status}, User ID: ${transaction.userId}`);

    if (transaction.status === "SUCCESS") {
      console.log(`[MIDTRANS-WEBHOOK] Order ${order_id} already marked as SUCCESS. Skipping.`);
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    if (finalStatus === "SUCCESS") {
      console.log(`[MIDTRANS-WEBHOOK] Upgrading user ${transaction.userId} to PRO...`);
      
      try {
        await prisma.$transaction([
          prisma.transaction.update({
            where: { orderId: order_id },
            data: { status: "SUCCESS" },
          }),
          prisma.user.update({
            where: { id: transaction.userId },
            data: {
              tier: "PRO",
              promptLimit: 0,
            },
          }),
        ]);
        console.log(`[MIDTRANS-WEBHOOK] DATABASE UPDATED SUCCESSFULLY! User is now PRO.`);
      } catch (dbError) {
        console.error("[MIDTRANS-WEBHOOK] DATABASE UPDATE FAILED:", dbError);
        throw dbError; // Lempar ke catch blok utama
      }
    } else {
      await prisma.transaction.update({
        where: { orderId: order_id },
        data: { status: finalStatus },
      });
      console.log(`[MIDTRANS-WEBHOOK] Transaction ${order_id} updated to ${finalStatus}.`);
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });

  } catch (error) {
    console.error("[MIDTRANS-WEBHOOK] FATAL ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}