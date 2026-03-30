// test-upsert.js
require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");

async function test() {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.Index(process.env.PINECONE_INDEX);

  const dummyVector = new Array(3072).fill(0.001);

  console.log("Test format SDK v7: { records: [...] }");
  try {
    await index.upsert({
      records: [{
        id: "test-001",
        values: dummyVector,
        metadata: { text: "test" }
      }]
    });
    console.log("✅ BERHASIL!");
  } catch (err) {
    console.log("❌ GAGAL:", err.message);
  }
}

test();