import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests: POST /api/auth/google
// Cakupan: token verification, auto-registration, cookie set, conflict handling
// ─────────────────────────────────────────────────────────────────────────────

// Mock google-auth-library
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({
        email: 'google@gmail.com',
        name: 'Google User',
        picture: 'https://example.com/avatar.jpg',
        sub: 'google-sub-123',
      }),
    }),
  })),
}));

describe('POST /api/auth/google', () => {
  const baseRoute = '@/app/api/auth/google/route.js';

  // ── HAPPY PATH: Returning User ──────────────────────────────────────────────
  test('TC-GAUTH-01: logs in existing Google user and sets cookie', async () => {
    const existingUser = {
      id: 'u-google-1',
      email: 'google@gmail.com',
      name: 'Google User',
      avatarUrl: 'https://example.com/avatar.jpg',
      tier: 'FREE',
      promptLimit: 50,
      authProvider: 'GOOGLE',
      role: 'USER',
    };

    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(existingUser),
        create: jest.fn(),
      },
    };

    process.env.JWT_SECRET = 'test-jwt-secret-for-google';
    process.env.GOOGLE_CLIENT_ID = 'fake-google-client-id';

    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      jsonBody: { credentialToken: 'valid-google-credential-token' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/berhasil/i);
    expect(body.user.email).toBe('google@gmail.com');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  // ── HAPPY PATH: New User Registration ───────────────────────────────────────
  test('TC-GAUTH-02: auto-registers new Google user with correct defaults', async () => {
    const newUser = {
      id: 'u-google-new',
      email: 'google@gmail.com',
      name: 'Google User',
      avatarUrl: 'https://example.com/avatar.jpg',
      tier: 'FREE',
      promptLimit: 50,
      authProvider: 'GOOGLE',
      role: 'USER',
    };

    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(newUser),
      },
    };

    process.env.JWT_SECRET = 'test-jwt-secret-for-google';
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      jsonBody: { credentialToken: 'valid-new-user-token' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const createCall = prismaMock.user.create.mock.calls[0]?.[0];
    expect(createCall.data.authProvider).toBe('GOOGLE');
    expect(createCall.data.tier).toBe('FREE');
    expect(createCall.data.role).toBe('USER');
    expect(createCall.data.passwordHash).toBeUndefined(); // no password for OAuth
  });

  // ── INPUT VALIDATION ────────────────────────────────────────────────────────
  test('TC-GAUTH-03: returns 400 when credentialToken is missing', async () => {
    const prismaMock = { user: { findUnique: jest.fn(), create: jest.fn() } };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({ method: 'POST', jsonBody: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/token/i);
  });

  // ── SECURITY: Token Forgery ──────────────────────────────────────────────────
  test('TC-GAUTH-04: returns 401 when Google token verification fails', async () => {
    // Use jest.doMock so the mock is applied AFTER jest.resetModules() inside loadRouteWithMocks
    jest.resetModules();
    jest.doMock('google-auth-library', () => ({
      OAuth2Client: jest.fn().mockImplementation(() => ({
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Token signature mismatch')),
      })),
    }));

    const prismaMock = { user: { findUnique: jest.fn(), create: jest.fn() } };
    const { POST } = await loadRouteWithMocks(baseRoute, { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      jsonBody: { credentialToken: 'forged-or-expired-google-token' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});
