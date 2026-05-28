import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

describe('POST /api/auth/login', () => {
  test('returns 400 on invalid body (non-json)', async () => {
    const prismaMock = {
      user: { findUnique: jest.fn() },
    };
    const { POST } = await loadRouteWithMocks('@/app/api/auth/login/route.js', { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '1.1.1.1' },
      jsonBody: new Error('invalid json'),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Request body tidak valid' });
  });

  test('returns 400 on invalid email format', async () => {
    const prismaMock = {
      user: { findUnique: jest.fn() },
    };
    const { POST } = await loadRouteWithMocks('@/app/api/auth/login/route.js', { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '2.2.2.2' },
      jsonBody: { email: 'not-an-email', password: '12345678' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email/i);
  });

  test('returns 401 when user not found', async () => {
    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const { POST } = await loadRouteWithMocks('@/app/api/auth/login/route.js', { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '3.3.3.3' },
      jsonBody: { email: 'user@example.com', password: '12345678' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Email atau password salah' });
  });
});

