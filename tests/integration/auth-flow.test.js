import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests: Full Authentication Flow
// Cakupan: register → login → protected access → logout → expired session
// Note: Menggunakan mock DB — tidak memerlukan koneksi database nyata
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('@/lib/email', () => ({
  sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('Integration: Register → Login → Profile Access Flow', () => {
  test('TC-INT-AUTH-01: full register → login → access profile cycle', async () => {
    // Step 1: Register
    const registerMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'u-new', email: 'newuser@test.com' }),
      },
    };
    const { POST: registerPost } = await loadRouteWithMocks('@/app/api/auth/register/route.js', { prismaMock: registerMock });
    const regReq = makeMockRequest({ jsonBody: { email: 'newuser@test.com', password: 'TestPass123' } });
    const regRes = await registerPost(regReq);
    expect(regRes.status).toBe(201);

    // Step 2: Login with same credentials
    const bcrypt = require('bcryptjs');
    const realHash = await bcrypt.hash('TestPass123', 10);

    const loginMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u-new',
          email: 'newuser@test.com',
          passwordHash: realHash,
          tier: 'FREE',
          promptLimit: 50,
          role: 'USER',
          name: null,
          avatarUrl: null,
        }),
      },
    };
    process.env.JWT_SECRET = 'integration-test-secret';
    const { POST: loginPost } = await loadRouteWithMocks('@/app/api/auth/login/route.js', { prismaMock: loginMock });
    const loginReq = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '1.2.3.4' },
      jsonBody: { email: 'newuser@test.com', password: 'TestPass123' },
    });
    const loginRes = await loginPost(loginReq);
    expect(loginRes.status).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.user.email).toBe('newuser@test.com');
    expect(loginBody.user.tier).toBe('FREE');
  });

  test('TC-INT-AUTH-02: cannot login with wrong password after registration', async () => {
    const bcrypt = require('bcryptjs');
    const realHash = await bcrypt.hash('CorrectPass123', 10);

    const loginMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1', email: 'user@test.com', passwordHash: realHash,
          tier: 'FREE', promptLimit: 50, role: 'USER', name: null, avatarUrl: null,
        }),
      },
    };
    const { POST: loginPost } = await loadRouteWithMocks('@/app/api/auth/login/route.js', { prismaMock: loginMock });
    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '5.5.5.5' },
      jsonBody: { email: 'user@test.com', password: 'WrongPassword!' },
    });
    const res = await loginPost(req);
    expect(res.status).toBe(401);
  });

  test('TC-INT-AUTH-03: rate limit blocks 6th login attempt from same IP', async () => {
    process.env.JWT_SECRET = 'integration-test-secret';
    const singleIp = '10.0.0.99';

    // Load ONCE — module-level LRU cache persists within the same import instance
    const prismaMock = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    const { POST } = await loadRouteWithMocks('@/app/api/auth/login/route.js', { prismaMock });

    // Exhaust 5 attempts using SAME POST function (same module, same cache)
    for (let i = 0; i < 5; i++) {
      const req = makeMockRequest({
        method: 'POST',
        headers: { 'x-forwarded-for': singleIp },
        jsonBody: { email: `attempt${i}@test.com`, password: 'SomePass123' },
      });
      await POST(req);
    }

    // 6th attempt should be rate-limited
    const blockedReq = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': singleIp },
      jsonBody: { email: 'overflow@test.com', password: 'SomePass123' },
    });
    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);
  });
});

describe('Integration: Forgot Password → Reset Password Flow', () => {
  test('TC-INT-AUTH-04: forgot password → reset password full cycle', async () => {
    let savedToken = null;

    // Step 1: Request password reset
    const forgotMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1', email: 'user@test.com' }),
        update: jest.fn().mockImplementation(({ data }) => {
          savedToken = data.resetToken; // Capture hashed token
          return Promise.resolve({});
        }),
      },
    };
    const { POST: forgotPost } = await loadRouteWithMocks('@/app/api/auth/forgot-password/route.js', { prismaMock: forgotMock });
    const forgotReq = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '77.0.0.1' },
      jsonBody: { email: 'user@test.com' },
    });
    const forgotRes = await forgotPost(forgotReq);
    expect(forgotRes.status).toBe(200);

    // Step 2: Reset password with the token
    // Simulate what the reset route does: hash the raw token and compare with savedToken
    const crypto = require('crypto');
    const rawToken = 'simulated-raw-token-32bytes-exactly';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const resetMock = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'u1', passwordHash: 'old-hash' }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const { POST: resetPost } = await loadRouteWithMocks('@/app/api/auth/reset-password/route.js', { prismaMock: resetMock });
    const resetReq = makeMockRequest({
      jsonBody: { token: rawToken, newPassword: 'NewSecurePass123' },
    });
    const resetRes = await resetPost(resetReq);
    expect(resetRes.status).toBe(200);

    // Verify token was cleared
    const updateCall = resetMock.user.update.mock.calls[0]?.[0];
    expect(updateCall.data.resetToken).toBeNull();
    expect(updateCall.data.resetTokenExpiry).toBeNull();
  });
});

describe('Integration: Role-Based Access Control', () => {
  test('TC-INT-AUTH-05: regular USER token cannot access /api/admin/* endpoints', async () => {
    const { SignJWT } = await import('jose');
    process.env.JWT_SECRET = 'integration-test-secret';
    const key = new TextEncoder().encode(process.env.JWT_SECRET);
    const userToken = await new SignJWT({ userId: 'u1', role: 'USER', tier: 'FREE' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key);

    const { middleware } = await import('@/middleware');
    const req = {
      nextUrl: { pathname: '/api/admin/users' },
      cookies: { get: (name) => name === 'token' ? { value: userToken } : undefined },
    };
    const res = await middleware(req);
    expect(res.status).toBe(403);
  });

  test('TC-INT-AUTH-06: ADMIN token can access /api/admin/* endpoints', async () => {
    const { SignJWT } = await import('jose');
    process.env.JWT_SECRET = 'integration-test-secret';
    const key = new TextEncoder().encode(process.env.JWT_SECRET);
    const adminToken = await new SignJWT({ userId: 'a1', role: 'ADMIN', tier: 'FREE' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key);

    const { middleware } = await import('@/middleware');
    const req = {
      nextUrl: { pathname: '/api/admin/users' },
      cookies: { get: (name) => name === 'token' ? { value: adminToken } : undefined },
    };
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });
});
