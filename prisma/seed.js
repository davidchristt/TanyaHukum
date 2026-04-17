// prisma/seed.js
import { prisma } from "../src/lib/prisma.js"; // Tetap gunakan ini
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Buat User Biasa (USER)
  await prisma.user.upsert({
    where: { email: "test@mail.com" },
    update: {},
    create: {
      email: "test@mail.com",
      passwordHash: hashedPassword,
      tier: "FREE",
      role: "USER",
      promptLimit: 10,
    },
  });

  // 2. Buat User Admin (ADMIN)
  await prisma.user.upsert({
    where: { email: "admin@mail.com" },
    update: {},
    create: {
      email: "admin@mail.com",
      passwordHash: hashedPassword,
      tier: "PRO", 
      role: "ADMIN",
      promptLimit: 999,
    },
  });

  console.log("Seeding completed: Created 1 User and 1 Admin");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
