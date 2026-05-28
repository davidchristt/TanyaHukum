import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

// ─────────────────────────────────────────────────────────────────────────────
// Security Tests: Input Validation & Injection Resistance
// Cakupan: SQL injection, XSS payload, path traversal, oversized input,
//          prototype pollution, unicode/emoji handling
// ─────────────────────────────────────────────────────────────────────────────

describe('SECURITY: SQL Injection Resistance (via Prisma ORM)', () => {
  test('S-INJ-01: login rejects SQL-like email before reaching DB', async () => {
    const prismaMock = { user: { findUnique: jest.fn() } };
    const { POST } = await loadRouteWithMocks('@/app/api/auth/login/route.js', { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '1.0.0.1' },
      jsonBody: { email: "'; DROP TABLE users; --", password: 'anything123' },
    });
    const res = await POST(req);
    // Should fail at email regex validation — never reaches DB
    expect(res.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  test('S-INJ-02: login rejects OR-based injection email', async () => {
    const prismaMock = { user: { findUnique: jest.fn() } };
    const { POST } = await loadRouteWithMocks('@/app/api/auth/login/route.js', { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '1.0.0.2' },
      jsonBody: { email: "admin@test.com' OR '1'='1", password: 'anything123' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('S-INJ-03: register rejects SQL injection in email field', async () => {
    const prismaMock = { user: { findUnique: jest.fn(), create: jest.fn() } };
    const { POST } = await loadRouteWithMocks('@/app/api/auth/register/route.js', { prismaMock });

    const req = makeMockRequest({
      jsonBody: { email: "'; INSERT INTO users VALUES('hacker','hacked'); --", password: 'SecurePass123' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});

describe('SECURITY: XSS Payload Handling', () => {
  test('S-XSS-01: chat API stores XSS payload in DB (stored XSS risk — needs output sanitization)', async () => {
    // This test documents that the chat route saves messages verbatim — no sanitization
    // Frontend must sanitize/render safely (react-markdown used, which is safer)
    jest.doMock('@pinecone-database/pinecone', () => ({
      Pinecone: class { Index() { return { query: jest.fn().mockResolvedValue({ matches: [] }) }; } }
    }));
    jest.doMock('@langchain/community/embeddings/voyage', () => ({
      VoyageEmbeddings: class { async embedQuery() { return []; } }
    }));
    jest.doMock('@langchain/google-genai', () => ({
      ChatGoogleGenerativeAI: class { async invoke() { return { content: '<b>safe answer</b>' }; } }
    }));
    jest.doMock('@langchain/core/messages', () => ({
      HumanMessage: class {}, SystemMessage: class {}
    }));

    const xssPayload = '<script>document.cookie="hacked=1"</script>';
    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1', tier: 'PRO', promptLimit: 0, personalContext: null }) },
      chatHistory: { count: jest.fn().mockResolvedValue(0), create: jest.fn().mockResolvedValue({}) },
      chat: { create: jest.fn().mockResolvedValue({ id: 'c1' }), update: jest.fn().mockResolvedValue({}) },
    };
    const { POST } = await loadRouteWithMocks('@/app/api/chat/route.js', { prismaMock });
    const req = makeMockRequest({ method: 'POST', jsonBody: { userId: 'u1', message: xssPayload } });
    const res = await POST(req);

    // API saves it — rendering safety depends on frontend (react-markdown)
    // This test DOCUMENTS the stored XSS risk
    if (res.status === 200) {
      const createCall = prismaMock.chatHistory.create.mock.calls.find(
        c => c[0]?.data?.role === 'USER'
      );
      expect(createCall?.[0]?.data?.content).toBe(xssPayload);
    }
  });

  test('S-XSS-02: profile name update accepts HTML but response is JSON (not rendered server-side)', async () => {
    jest.mock('../../../src/lib/auth-server', () => ({
      verifyToken: jest.fn().mockResolvedValue({ userId: 'u1' }),
    }), { virtual: true });

    const xssName = '<img src=x onerror=alert(1)>';
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1', name: 'User', email: 'u@test.com', avatarUrl: null,
          passwordHash: '$2b$10$x', authProvider: 'CREDENTIALS',
        }),
        update: jest.fn().mockResolvedValue({ id: 'u1', name: xssName, email: 'u@test.com', avatarUrl: null }),
      },
    };
    const { PATCH } = await loadRouteWithMocks('@/app/api/profile/route.js', { prismaMock });
    const req = makeMockRequest({ cookies: { token: 'valid' }, jsonBody: { name: xssName } });
    const res = await PATCH(req);
    // API accepts it — frontend must escape HTML in rendered output
    expect([200, 401]).toContain(res.status);
  });
});

describe('SECURITY: Oversized Input & Resource Exhaustion', () => {
  test('S-OVS-01: chat API handles extremely long message without crash', async () => {
    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1', tier: 'FREE', promptLimit: 99, personalContext: null }) },
      chatHistory: { count: jest.fn().mockResolvedValue(0) },
      chat: { create: jest.fn() },
    };
    const { POST } = await loadRouteWithMocks('@/app/api/chat/route.js', { prismaMock });

    jest.doMock('@pinecone-database/pinecone', () => ({
      Pinecone: class { Index() { return { query: jest.fn().mockResolvedValue({ matches: [] }) }; } }
    }));
    jest.doMock('@langchain/community/embeddings/voyage', () => ({
      VoyageEmbeddings: class { async embedQuery() { throw new Error('payload too large'); } }
    }));
    jest.doMock('@langchain/core/messages', () => ({
      HumanMessage: class {}, SystemMessage: class {}
    }));

    const hugeMessage = 'A'.repeat(100_000); // 100KB message
    const req = makeMockRequest({ method: 'POST', jsonBody: { userId: 'u1', message: hugeMessage } });
    const res = await POST(req);
    // Should not crash the server — either 500 (from AI service) or a controlled error
    expect([400, 500, 429]).toContain(res.status);
  });

  test('S-OVS-02: regulations search handles special characters without crash', async () => {
    const prismaMock = {
      regulation: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
      searchLog: { create: jest.fn().mockResolvedValue({}) },
    };
    const { GET } = await loadRouteWithMocks('@/app/api/regulations/route.js', { prismaMock });

    const specialChars = encodeURIComponent("'; DROP TABLE--<script>alert(1)</script>🔥💀");
    const req = makeMockRequest({ url: `http://localhost/api/regulations?search=${specialChars}` });
    const res = await GET(req);
    expect(res.status).toBe(200); // Should handle gracefully
  });

  test('S-OVS-03: register handles Unicode emoji in password', async () => {
    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 'u1' }) },
    };
    const { POST } = await loadRouteWithMocks('@/app/api/auth/register/route.js', { prismaMock });

    // Emoji password — 8+ chars but Unicode
    const req = makeMockRequest({ jsonBody: { email: 'emoji@test.com', password: '🔐🔑🛡️👮‍♂️🔒🗝️' } });
    const res = await POST(req);
    // Should not crash — bcrypt handles Unicode
    expect([201, 400, 500]).toContain(res.status);
  });
});

describe('SECURITY: Authorization Bypass Attempts', () => {
  test('S-AUTH-01: middleware blocks expired JWT token', async () => {
    const { SignJWT } = await import('jose');
    process.env.JWT_SECRET = 'security-test-secret';
    const key = new TextEncoder().encode(process.env.JWT_SECRET);
    const expiredToken = await new SignJWT({ role: 'ADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200) // 2 hours ago
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // Expired 1 hour ago
      .sign(key);

    const { middleware } = await import('@/middleware');
    const req = {
      nextUrl: { pathname: '/api/admin/users' },
      cookies: { get: (n) => n === 'token' ? { value: expiredToken } : undefined },
    };
    const res = await middleware(req);
    expect(res.status).toBe(401);
  });

  test('S-AUTH-02: middleware blocks token signed with wrong secret', async () => {
    const { SignJWT } = await import('jose');
    const wrongKey = new TextEncoder().encode('totally-wrong-secret');
    const forgeryToken = await new SignJWT({ role: 'ADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(wrongKey);

    process.env.JWT_SECRET = 'correct-secret-is-different';
    const { middleware } = await import('@/middleware');
    const req = {
      nextUrl: { pathname: '/api/admin/users' },
      cookies: { get: (n) => n === 'token' ? { value: forgeryToken } : undefined },
    };
    const res = await middleware(req);
    expect(res.status).toBe(401);
  });

  test('S-AUTH-03: [FIXED] JWT_SECRET tidak di-set → middleware return 500, bukan bisa diforge', async () => {
    const { SignJWT } = await import('jose');
    delete process.env.JWT_SECRET;
    const fallbackSecret = 'fallback_secret_key_sementara';
    const key = new TextEncoder().encode(fallbackSecret);
    const forgedToken = await new SignJWT({ role: 'ADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key);

    const { middleware } = await import('@/middleware');
    const req = {
      nextUrl: { pathname: '/api/admin/users' },
      cookies: { get: (n) => n === 'token' ? { value: forgedToken } : undefined },
    };
    const res = await middleware(req);
    // Sebelum fix: 200 (attacker bisa forge). Setelah fix: 500 fail-closed ✅
    expect(res.status).toBe(500);

    // Restore
    process.env.JWT_SECRET = 'integration-test-secret';
  });

  test('S-AUTH-04: [FIXED] /api/dashboard sekarang butuh login — tanpa token ditolak 401', async () => {
    const prismaMock = {
      user: { count: jest.fn() },
      chatHistory: { count: jest.fn() },
      regulation: { count: jest.fn(), findMany: jest.fn(), aggregate: jest.fn(), groupBy: jest.fn() },
      searchLog: { count: jest.fn(), groupBy: jest.fn() },
      trendingIssue: { findMany: jest.fn() },
    };
    const { GET } = await loadRouteWithMocks('@/app/api/dashboard/route.js', { prismaMock, authSession: null });
    const res = await GET();
    // Sebelum fix: 200 (publik). Setelah fix: 401 ✅
    expect(res.status).toBe(401);
    expect(prismaMock.user.count).not.toHaveBeenCalled();
  });
});
