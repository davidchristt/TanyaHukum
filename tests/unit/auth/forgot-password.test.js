import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests: POST /api/auth/forgot-password
// Cakupan: validasi email, rate limit, generic response (anti user enumeration),
//          token generation, email dispatch
// ─────────────────────────────────────────────────────────────────────────────

// Suppress nodemailer side-effects
jest.mock('@/lib/email', () => ({
  sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('POST /api/auth/forgot-password', () => {
  const baseRoute = '@/app/api/auth/forgot-password/route.js';

  // ── HAPPY PATH ──────────────────────────────────────────────────────────────
  test('TC-FP-01: returns 200 with generic message for registered email', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1', email: 'user@test.com' }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '10.0.0.1' },
      jsonBody: { email: 'user@test.com' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBeDefined();
  });

  // ── ANTI USER-ENUMERATION ───────────────────────────────────────────────────
  test('TC-FP-02: returns same generic message for unregistered email (no user enumeration)', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '10.0.0.2' },
      jsonBody: { email: 'ghost@test.com' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/Jika email terdaftar/i);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  // ── INPUT VALIDATION ────────────────────────────────────────────────────────
  test('TC-FP-03: returns 400 when email is missing', async () => {
    const prismaMock = { user: { findUnique: jest.fn(), update: jest.fn() } };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '10.0.0.3' },
      jsonBody: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('TC-FP-04: returns 400 for invalid email format', async () => {
    const prismaMock = { user: { findUnique: jest.fn(), update: jest.fn() } };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '10.0.0.4' },
      jsonBody: { email: 'not-valid' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email/i);
  });

  // ── RATE LIMITING ────────────────────────────────────────────────────────────
  test('TC-FP-05: returns 429 after 3 requests from same IP within 15 min window', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };

    // Load ONCE — module-level rateLimitMap persists across calls to the SAME import
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });
    const ip = '192.168.77.1'; // Unique IP to avoid bleed from other tests

    for (let i = 0; i < 3; i++) {
      const req = makeMockRequest({
        method: 'POST',
        headers: { 'x-forwarded-for': ip },
        jsonBody: { email: `user${i}@test.com` },
      });
      await POST(req);
    }

    // 4th request should be rate-limited (maxRequests = 3)
    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': ip },
      jsonBody: { email: 'overflow@test.com' },
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/terlalu banyak/i);
  });

  // ── TOKEN SECURITY ───────────────────────────────────────────────────────────
  test('TC-FP-06: saves hashed (not plain) reset token to database', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1', email: 'user@test.com' }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '10.1.1.1' },
      jsonBody: { email: 'user@test.com' },
    });
    await POST(req);

    const updateCall = prismaMock.user.update.mock.calls[0]?.[0];
    expect(updateCall).toBeDefined();
    const savedToken = updateCall.data.resetToken;
    // Hashed token should be SHA-256 hex (64 chars) — NOT raw bytes
    expect(savedToken).toMatch(/^[a-f0-9]{64}$/);
  });
});
