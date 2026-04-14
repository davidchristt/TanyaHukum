// lib/auth.js  ← file baru (pindahkan dari login/route.js)
// Token digital disimpan di browser user agar  tetap bisa mengakses fitur aplikasi tanpa harus login terus-menerus selama 7 hari.

import { SignJWT } from 'jose';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function createToken(payload) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function getSession() {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    return null;
  }
}