import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(req) {
  try {
    // 1. Tangkap pesan JSON dari Frontend
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    // 2. Setup Database Pinecone
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.Index(process.env.PINECONE_INDEX_V2);

    // 3. Setup Voyage AI (Si Pencari Hukum yang presisi)
    const embeddings = new VoyageEmbeddings({
      apiKey: process.env.VOYAGEAI_API_KEY,
      inputType: "query",
      modelName: "voyage-law-2", 
    });

    // 4. Setup Gemini LLM (Si Juru Bicara)
    const llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.5-flash",
      temperature: 0.2, // Sangat rendah agar tetap faktual
    });

    // 5. Proses Pencarian (Retrieval) - Cari 30 potongan terbaik
    const queryVector = await embeddings.embedQuery(message);
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 50, 
      includeMetadata: true,
    });

    // 6. Rangkai teks referensi untuk dibaca Gemini
    const matches = queryResponse.matches || [];
    const context = matches
      .map((m, i) => `[Referensi ${i + 1}: ${m.metadata?.source || 'Dokumen'}, Hal ${m.metadata?.page || '?'}]\n${m.metadata?.text || ''}`)
      .join("\n\n---\n\n");

    // 7. System Prompt Anti-Halusinasi
    const systemPrompt = `Anda adalah TanyaHukum, asisten hukum Indonesia yang ahli dan terpercaya.
TUGAS ANDA: Jawab pertanyaan pengguna HANYA berdasarkan konteks hukum berikut:
${context}

ATURAN WAJIB:
1. Jika jawabannya tidak ada di konteks, katakan: "Maaf, berdasarkan dokumen yang saya miliki, saya tidak menemukan informasi yang cukup untuk menjawab pertanyaan ini."
2. Wajib sebutkan sumber UU dan Pasalnya secara jelas dari referensi.
3. Gunakan bahasa Indonesia yang profesional namun mudah dipahami masyarakat umum.
4. Jangan pernah mengarang sanksi atau pasal yang tidak tertulis di konteks.`;

    // 8. Generate Jawaban Akhir
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(message),
    ]);

    // 9. Kembalikan respons ke Frontend dalam format JSON
    return NextResponse.json({ answer: response.content });

  } catch (error) {
    console.error("API Chat Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memproses pertanyaan hukum." }, 
      { status: 500 }
    );
  }
}