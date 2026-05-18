import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File dokumen wajib diunggah" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File harus PDF" }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const bucketName = "legal-documents";

    // Pastikan bucket ada
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find((b) => b.name === bucketName);

    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}_${safeFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      return NextResponse.json({ error: "Gagal upload dokumen" }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);

    return NextResponse.json(
      {
        fileUrl: publicUrlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Gagal upload dokumen" }, { status: 500 });
  }
}
