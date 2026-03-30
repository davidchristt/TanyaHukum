// Agar Next.js tidak membuka terlalu banyak koneksi database saat development
// Maksudnya adalah:
// Mencegah   ====  Hot Reload  ====
// Menghilangkan  ====  Koneksi ke database yang menumpuk  ====
// Menghindari  ====  Database Error akibat kebanyakan koneksi  ====

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;