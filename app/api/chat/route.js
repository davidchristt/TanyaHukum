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
    const { message, userId } = body; 

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

    const systemPrompt = `Anda adalah TanyaHukum, asisten hukum Indonesia yang ahli dan terpercaya.
TUGAS ANDA: Jawab pertanyaan pengguna HANYA berdasarkan konteks hukum berikut:
${context}

ATURAN WAJIB:
1. Jika jawabannya tidak ada di konteks, katakan: "Maaf, berdasarkan dokumen yang saya miliki, saya tidak menemukan informasi yang cukup untuk menjawab pertanyaan ini."
2. Wajib sebutkan sumber UU dan Pasalnya secara jelas dari referensi.
3. Gunakan bahasa Indonesia yang profesional namun mudah dipahami masyarakat umum.
4. Jangan pernah mengarang sanksi atau pasal yang tidak tertulis di konteks.`;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(message),
    ]);

    // ==========================================================
    // 4. Rekam Jejak ke Database (Setelah AI sukses menjawab)
    // ==========================================================
    
    // Kita gunakan Promise.all agar penyimpanan ke DB berjalan paralel dan lebih cepat
    await Promise.all([
      // Simpan pertanyaan User
      prisma.chatHistory.create({
        data: {
          userId: userId,
          role: "USER",
          content: message
        }
      }),
      // Simpan jawaban AI
      prisma.chatHistory.create({
        data: {
          userId: userId,
          role: "AI",
          content: response.content
        }
      })
    ]);

    // 5. Kembalikan respons ke Frontend
    return NextResponse.json({ answer: response.content });

  } catch (error) {
    console.error("API Chat Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memproses pertanyaan hukum." }, 
      { status: 500 }
    );
  }
}