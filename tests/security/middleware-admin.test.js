import { SignJWT } from 'jose';
import { middleware } from '@/middleware';

function makeMiddlewareRequest({ pathname, token } = {}) {
  const cookies = new Map();
  if (token) cookies.set('token', { value: token });

  return {
    nextUrl: { pathname },
    cookies: {
      get(name) {
        return cookies.get(name);
      },
    },
  };
}

describe('middleware admin protection', () => {
  test('blocks /api/admin/* without token', async () => {
    const req = makeMiddlewareRequest({ pathname: '/api/admin/users' });
    const res = await middleware(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/Unauthorized/i);
  });

  test('blocks /api/admin/* when role is not ADMIN', async () => {
    process.env.JWT_SECRET = 'secret_for_test';
    const key = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ role: 'USER' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key);

    const req = makeMiddlewareRequest({ pathname: '/api/admin/users', token });
    const res = await middleware(req);
    expect(res.status).toBe(403);
  });

  test('SECURITY: [FIXED] JWT_SECRET missing → middleware return 500 (fail-closed, token forgery tidak bisa)', async () => {
    delete process.env.JWT_SECRET;
    const fallback = 'fallback_secret_key_sementara';
    const key = new TextEncoder().encode(fallback);
    const token = await new SignJWT({ role: 'ADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key);

    const req = makeMiddlewareRequest({ pathname: '/api/admin/users', token });
    const res = await middleware(req);

    // Sebelum fix: 200 (attacker bisa masuk). Setelah fix: 500 fail-closed ✅
    expect(res.status).toBe(500);
  });
});

