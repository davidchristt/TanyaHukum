// lib/auth.js  ← file baru (pindahkan dari login/route.js)
// Token digital disimpan di browser user agar  tetap bisa mengakses fitur aplikasi tanpa harus login terus-menerus selama 7 hari.

import { SignJWT } from 'jose';

export async function createToken(payload) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}