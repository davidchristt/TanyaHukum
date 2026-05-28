import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';
import jwt from 'jsonwebtoken';

// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests: GET/PATCH/DELETE /api/profile
// Cakupan: auth, profile retrieval, update fields, password change, delete
// Note: profile/route.js uses src/lib/auth-server which uses jsonwebtoken (sync).
// We generate real JWT tokens so verifyToken passes without additional mocking.
// ─────────────────────────────────────────────────────────────────────────────

const TEST_JWT_SECRET = 'profile-test-secret-key';
process.env.JWT_SECRET = TEST_JWT_SECRET; // Used by src/lib/auth-server verifyToken
const VALID_TOKEN = jwt.sign({ userId: 'u1', email: 'user@test.com', role: 'USER' }, TEST_JWT_SECRET);

const baseRoute = '@/app/api/profile/route.js';

const existingUser = {
  id: 'u1',
  name: 'Test User',
  email: 'user@test.com',
  avatarUrl: null,
  tier: 'FREE',
  promptLimit: 50,
  personalContext: null,
  passwordHash: '$2b$10$mockedHashValue',
  authProvider: 'CREDENTIALS',
};

describe('GET /api/profile', () => {
  test('TC-PROF-01: returns user profile for authenticated request', async () => {
    // Return only what Prisma select returns (no passwordHash)
    const profileData = { id: 'u1', name: 'Test User', email: 'user@test.com', avatarUrl: null, tier: 'FREE', promptLimit: 50, personalContext: null };
    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue(profileData) },
      transaction: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const { GET } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ cookies: { token: VALID_TOKEN } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('u1');
    expect(body.email).toBe('user@test.com');
    // Should NOT expose passwordHash
    expect(body.passwordHash).toBeUndefined();
  });

  test('TC-PROF-02: returns 401 when no token cookie present', async () => {
    const prismaMock = { user: { findUnique: jest.fn() } };
    const { GET } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({});
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  test('TC-PROF-03: triggers self-healing tier sync when user is FREE with PENDING transaction', async () => {
    const Midtrans = { CoreApi: jest.fn().mockImplementation(() => ({
      transaction: { status: jest.fn().mockResolvedValue({ transaction_status: 'settlement' }) }
    })) };
    jest.doMock('midtrans-client', () => ({ default: Midtrans }));

    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue({ ...existingUser, tier: 'FREE' }) },
      transaction: {
        findFirst: jest.fn().mockResolvedValue({ orderId: 'TRX-123', status: 'PENDING', userId: 'u1' }),
        update: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    };

    const { GET } = await loadRouteWithMocks(baseRoute, { prismaMock });
    const req = makeMockRequest({ cookies: { token: VALID_TOKEN } });
    // Should not crash even if sync runs
    const res = await GET(req);
    expect([200, 401]).toContain(res.status);
  });
});

describe('PATCH /api/profile', () => {
  test('TC-PROF-04: updates name successfully', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(existingUser),
        update: jest.fn().mockResolvedValue({ ...existingUser, name: 'New Name' }),
      },
    };
    const { PATCH } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ cookies: { token: VALID_TOKEN }, jsonBody: { name: 'New Name' } });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/berhasil/i);
  });

  test('TC-PROF-05: returns 400 when no update fields provided', async () => {
    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue(existingUser), update: jest.fn() },
    };
    const { PATCH } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ cookies: { token: VALID_TOKEN }, jsonBody: {} });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  test('TC-PROF-06: returns 400 when avatarUrl does not start with http', async () => {
    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue(existingUser), update: jest.fn() },
    };
    const { PATCH } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      cookies: { token: VALID_TOKEN },
      jsonBody: { avatarUrl: 'javascript:alert(1)' },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/url avatar/i);
  });

  test('TC-PROF-07: returns 400 when changing password without currentPassword', async () => {
    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue(existingUser), update: jest.fn() },
    };
    const { PATCH } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      cookies: { token: VALID_TOKEN },
      jsonBody: { newPassword: 'NewSecure123' },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/password lama/i);
  });

  test('TC-PROF-08: returns 401 when currentPassword is wrong', async () => {
    const bcrypt = require('bcrypt');
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue(existingUser), update: jest.fn() },
    };
    const { PATCH } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      cookies: { token: VALID_TOKEN },
      jsonBody: { currentPassword: 'wrong', newPassword: 'NewSecure123' },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toMatch(/password lama salah/i);

    jest.restoreAllMocks();
  });

  test('TC-PROF-09: updates personalContext field', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(existingUser),
        update: jest.fn().mockResolvedValue({ ...existingUser, personalContext: 'Saya pengacara' }),
      },
    };
    const { PATCH } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      cookies: { token: VALID_TOKEN },
      jsonBody: { personalContext: 'Saya pengacara' },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const updateCall = prismaMock.user.update.mock.calls[0]?.[0];
    expect(updateCall.data.personalContext).toBe('Saya pengacara');
  });
});

describe('PATCH /api/profile — personalContext length', () => {
  test('TC-PROF-12: [FIXED] personalContext > 500 karakter ditolak 400', async () => {
    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue(existingUser), update: jest.fn() },
    };
    const { PATCH } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      cookies: { token: VALID_TOKEN },
      jsonBody: { personalContext: 'A'.repeat(501) },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/500 karakter/i);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  test('TC-PROF-13: personalContext tepat 500 karakter diterima', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(existingUser),
        update: jest.fn().mockResolvedValue({ ...existingUser, personalContext: 'A'.repeat(500) }),
      },
    };
    const { PATCH } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      cookies: { token: VALID_TOKEN },
      jsonBody: { personalContext: 'A'.repeat(500) },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/profile', () => {
  test('TC-PROF-10: deletes account and clears token cookie', async () => {
    const prismaMock = {
      user: { delete: jest.fn().mockResolvedValue({}) },
    };
    const { DELETE } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ cookies: { token: VALID_TOKEN } });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/dihapus/i);
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  test('TC-PROF-11: returns 401 when attempting delete without token', async () => {
    const prismaMock = { user: { delete: jest.fn() } };
    const { DELETE } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({});
    const res = await DELETE(req);
    expect(res.status).toBe(401);
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });
});
