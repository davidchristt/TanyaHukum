import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// 1. Import Prisma Client
import prisma from "@/lib/prisma"; 

export async function POST(req) {
  try {
    // 1. Tangkap pesan dan identitas dari Frontend
    const body = await req.json();
    // 2. Tangkap userId dari body
    const { message, userId, chatId } = body; 

    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    // 3. Verifikasi Identitas & Pengecekan Limit
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Identitas pengguna tidak ditemukan." }, { status: 401 });
    }

    // Cari data user di database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak terdaftar." }, { status: 404 });
    }

    // Hitung jumlah chat user HARI INI
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Set waktu ke 00:00:00 hari ini

    const chatsTodayCount = await prisma.chatHistory.count({
      where: {
        userId: userId,
        role: "USER", // Hanya hitung pertanyaan dari user
        createdAt: {
          gte: startOfDay, // Lebih besar atau sama dengan awal hari ini
        }
      }
    });

    // ==========================================================
    // [MODIFIKASI PENTING]: Keputusan Gatekeeper dengan Jalur VIP
    // ==========================================================
    
    // Tolak JIKA user adalah FREE dan limitnya habis.
    // Jika user adalah PRO, blok if ini otomatis dilewati (Bypass)!
    if (user.tier === "FREE" && chatsTodayCount >= user.promptLimit) {
      return NextResponse.json(
        { 
          error: "Limit pertanyaan harian Anda sudah habis. Silakan upgrade ke PRO untuk akses tanpa batas.",
          limitReached: true // Flag khusus agar Frontend tahu ini error karena limit
        }, 
        { status: 403 }
      );
    }

    // ==========================================================
    // LOGIKA RAG AI (Sama persis seperti sebelumnya)
    // ==========================================================
    
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.Index(process.env.PINECONE_INDEX_V2);

    const embeddings = new VoyageEmbeddings({
      apiKey: process.env.VOYAGEAI_API_KEY,
      inputType: "query",
      modelName: "voyage-law-2", 
    });

    const llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.5-flash",
      temperature: 0.2, 
    });

    const queryVector = await embeddings.embedQuery(message);
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 50, 
      includeMetadata: true,
    });

    const matches = queryResponse.matches || [];
    const context = matches
      .map((m, i) => `[Referensi ${i + 1}: ${m.metadata?.source || 'Dokumen'}, Hal ${m.metadata?.page || '?'}]\n${m.metadata?.text || ''}`)
      .join("\n\n---\n\n");


    // ==========================================================
    // [FITUR BARU]: Instruksi Personalisasi Bebas dari User
    // ==========================================================
    const userCustomInstructions = user.personalContext 
      ? `\n=========================================\nPROFIL / INSTRUKSI KHUSUS DARI PENGGUNA:\n"${user.personalContext}"\n(PENTING: Sesuaikan gaya bahasa dan sudut pandang jawaban Anda dengan instruksi di atas!)\n=========================================\n`
      : "";

    const systemPrompt = `Anda adalah TanyaHukum, asisten hukum Indonesia yang ahli dan terpercaya.
TUGAS ANDA: Jawab pertanyaan pengguna HANYA berdasarkan konteks hukum berikut:
${context}
${userCustomInstructions}

ATURAN WAJIB:
1. Jika jawabannya tidak ada di konteks, katakan: "Maaf, berdasarkan dokumen yang saya miliki, saya tidak menemukan informasi yang cukup untuk menjawab pertanyaan ini."
2. Wajib sebutkan sumber UU dan Pasalnya secara jelas dari referensi.
3. Gunakan bahasa Indonesia yang profesional namun mudah dipahami masyarakat umum.
4. Jangan pernah mengarang sanksi atau pasal yang tidak tertulis di konteks.`;

    let response;
    try {
      response = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(message),
      ]);
    } catch (llmError) {
      console.error("LLM Error:", llmError);
      if (llmError?.status === 429 || llmError?.message?.includes("429") || llmError?.message?.includes("quota")) {
        return NextResponse.json(
          { error: "Kuota AI hari ini telah habis. Silakan coba lagi nanti." },
          { status: 429 }
        );
      }
      throw llmError;
    }

    // ==========================================================
    // 4. Rekam Jejak ke Database (Setelah AI sukses menjawab)
    // ==========================================================
    
    // Pastikan user memiliki minimal satu chat session (Relasi Wajib)
    const chatSession = chatId 
      ? await prisma.chat.findUnique({ where: { id: chatId } })
      : await prisma.chat.create({
          data: { 
            title: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
            user: {
              connect: { id: userId }
            }
          }
        });

    if (!chatSession) {
       return NextResponse.json({ error: "Sesi chat tidak ditemukan" }, { status: 404 });
    }

    // Kita gunakan Promise.all agar penyimpanan ke DB berjalan paralel dan lebih cepat
    await Promise.all([
      // Simpan pertanyaan User
      prisma.chatHistory.create({
        data: {
          role: "USER",
          content: message,
          chat: {
            connect: { id: chatSession.id }
          },
          user: {
            connect: { id: userId }
          }
        }
      }),
      // Simpan jawaban AI
      prisma.chatHistory.create({
        data: {
          role: "AI",
          content: response.content,
          chat: {
            connect: { id: chatSession.id }
          },
          user: {
            connect: { id: userId }
          }
        }
      }),
      // Update title jika ini chat baru
      prisma.chat.update({
        where: { id: chatSession.id },
        data: { updatedAt: new Date() }
      })
    ]);

    // 5. Kembalikan respons ke Frontend
    return NextResponse.json({ answer: response.content, chatId: chatSession.id });

  } catch (error) {
    console.error("API Chat Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memproses pertanyaan hukum." }, 
      { status: 500 }
    );
  }
}

// ==========================================================
// [FITUR BARU]: GET Endpoint untuk Mengambil History Chat & List Chat
// ==========================================================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // "list" | "messages"
    const chatId = searchParams.get("chatId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // A. LIST SEMUA CHAT USER
    if (type === "list") {
      const chats = await prisma.chat.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });
      return NextResponse.json({ chats });
    }

    // B. AMBIL PESAN DALAM SATU CHAT
    if (chatId) {
      const messages = await prisma.chatHistory.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ history: messages });
    }

    // C. FALLBACK: SEMUA PESAN USER (Legacy)
    const history = await prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ history });

  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// ==========================================================
// [FITUR BARU]: PATCH Endpoint untuk Rename Chat
// ==========================================================
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { chatId, title } = body;

    if (!chatId || !title) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { title }
    });

    return NextResponse.json({ success: true, chat: updated });
  } catch (error) {
    console.error("API PATCH Error:", error);
    return NextResponse.json({ error: "Gagal merename chat" }, { status: 500 });
  }
}

// ==========================================================
// [FITUR BARU]: DELETE Endpoint untuk Hapus Chat
// ==========================================================
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "ID Chat diperlukan" }, { status: 400 });
    }

    await prisma.chat.delete({
      where: { id: chatId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus chat" }, { status: 500 });
  }
}