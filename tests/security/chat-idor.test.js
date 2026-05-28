import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

// ─────────────────────────────────────────────────────────────────────────────
// Security Tests: Chat IDOR — FIXED
// Sebelum fix: GET/POST bisa diakses tanpa JWT, userId dari body/query
// Setelah fix: wajib session, userId dari getSession(), ownership check
// ─────────────────────────────────────────────────────────────────────────────

describe('/api/chat authorization — IDOR FIXED', () => {
  test('SECURITY: [FIXED] GET chat list tanpa token sekarang ditolak 401', async () => {
    const prismaMock = {
      chat: { findMany: jest.fn() },
      chatHistory: { findMany: jest.fn(), count: jest.fn() },
      user: { findUnique: jest.fn() },
    };

    // authSession: null = tidak ada session (unauthenticated)
    const { GET } = await loadRouteWithMocks('@/app/api/chat/route.js', { prismaMock, authSession: null });

    const req = makeMockRequest({ url: 'http://localhost/api/chat?userId=victim&type=list' });
    const res = await GET(req);

    // Sebelum fix: 200 (IDOR). Setelah fix: 401 ✅
    expect(res.status).toBe(401);
    expect(prismaMock.chat.findMany).not.toHaveBeenCalled();
  });

  test('SECURITY: [FIXED] POST tanpa token sekarang ditolak 401', async () => {
    const prismaMock = {
      user: { findUnique: jest.fn() },
      chatHistory: { count: jest.fn(), create: jest.fn() },
      chat: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };

    // authSession: null = tidak ada session
    const { POST } = await loadRouteWithMocks('@/app/api/chat/route.js', { prismaMock, authSession: null });

    const req = makeMockRequest({
      method: 'POST',
      jsonBody: { userId: 'U1', message: 'hello' }, // userId di body diabaikan
    });

    const res = await POST(req);
    // Sebelum fix: lolos ke AI (500 karena AI down). Setelah fix: 401 ✅
    expect(res.status).toBe(401);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
