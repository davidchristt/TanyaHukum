import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests: POST /api/auth/reset-password
// Cakupan: token validation, password policy, token expiry, one-time use
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/reset-password', () => {
  const baseRoute = '@/app/api/auth/reset-password/route.js';

  // ── HAPPY PATH ──────────────────────────────────────────────────────────────
  test('TC-RP-01: returns 200 and clears token on valid reset', async () => {
    const prismaMock = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'u1', passwordHash: 'old' }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      jsonBody: { token: 'valid-token-32bytes', newPassword: 'NewSecure123' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/berhasil/i);

    // Token must be cleared after use (one-time use enforcement)
    const updateCall = prismaMock.user.update.mock.calls[0]?.[0];
    expect(updateCall.data.resetToken).toBeNull();
    expect(updateCall.data.resetTokenExpiry).toBeNull();
  });

  // ── INPUT VALIDATION ────────────────────────────────────────────────────────
  test('TC-RP-02: returns 400 when token is missing', async () => {
    const prismaMock = { user: { findFirst: jest.fn(), update: jest.fn() } };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ method: 'POST', jsonBody: { newPassword: 'NewSecure123' } });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/wajib/i);
  });

  test('TC-RP-03: returns 400 when newPassword is missing', async () => {
    const prismaMock = { user: { findFirst: jest.fn(), update: jest.fn() } };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ method: 'POST', jsonBody: { token: 'some-token' } });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('TC-RP-04: returns 400 when password shorter than 8 chars', async () => {
    const prismaMock = { user: { findFirst: jest.fn(), update: jest.fn() } };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ method: 'POST', jsonBody: { token: 'some-token', newPassword: 'short' } });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/8/);
  });

  // ── TOKEN VALIDATION ────────────────────────────────────────────────────────
  test('TC-RP-05: returns 400 when token is invalid (not found in DB)', async () => {
    const prismaMock = {
      user: { findFirst: jest.fn().mockResolvedValue(null), update: jest.fn() },
    };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ method: 'POST', jsonBody: { token: 'invalid-token', newPassword: 'NewSecure123' } });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/tidak valid|kedaluwarsa/i);
  });

  test('TC-RP-06: filters token by expiry date in DB query (expired token rejected)', async () => {
    const prismaMock = {
      user: {
        // Simulate Prisma returning null because resetTokenExpiry <= now
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ method: 'POST', jsonBody: { token: 'expired-token', newPassword: 'NewSecure123' } });
    const res = await POST(req);
    expect(res.status).toBe(400);
    // Verify the query used `gt: new Date()` in the filter
    const findFirstCall = prismaMock.user.findFirst.mock.calls[0]?.[0];
    expect(findFirstCall.where.resetTokenExpiry).toBeDefined();
    expect(findFirstCall.where.resetTokenExpiry.gt).toBeDefined();
  });

  // ── PASSWORD SECURITY ────────────────────────────────────────────────────────
  test('TC-RP-07: does not store plain-text password (passwordHash must change)', async () => {
    const originalHash = '$2b$12$oldHash';
    const prismaMock = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'u1', passwordHash: originalHash }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ method: 'POST', jsonBody: { token: 'valid', newPassword: 'NewSecure123' } });
    await POST(req);

    const updateCall = prismaMock.user.update.mock.calls[0]?.[0];
    const newHash = updateCall?.data?.passwordHash;
    expect(newHash).toBeDefined();
    expect(newHash).not.toBe('NewSecure123'); // must not be plain text
    expect(newHash).not.toBe(originalHash); // must be different from old
    expect(newHash).toMatch(/^\$2[ab]\$/); // must be bcrypt hash
  });
});
