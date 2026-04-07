import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      email: "test@mail.com",
      passwordHash: hashedPassword,
      tier: "FREE",
      promptLimit: 10,
    },
  });

  console.log("User created");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });