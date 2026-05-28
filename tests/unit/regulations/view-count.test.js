import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests: viewCount increment di GET /api/regulations/[id]
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/regulations/[id] — viewCount', () => {
  const baseRoute = '@/app/api/regulations/[id]/route.js';
  const fakeRegulation = { id: 'r1', title: 'UU Test', viewCount: 42, isActive: true };

  test('TC-VIEW-01: GET detail dokumen increment viewCount (fire-and-forget)', async () => {
    const prismaMock = {
      regulation: {
        findUnique: jest.fn().mockResolvedValue(fakeRegulation),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const { GET } = await loadRouteWithMocks(baseRoute, { prismaMock });
    const req = makeMockRequest({ url: 'http://localhost/api/regulations/r1' });

    const res = await GET(req, { params: Promise.resolve({ id: 'r1' }) });
    expect(res.status).toBe(200);

    // Tunggu fire-and-forget selesai
    await new Promise(r => setTimeout(r, 50));

    expect(prismaMock.regulation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { viewCount: { increment: 1 } } })
    );
  });

  test('TC-VIEW-02: GET detail dokumen tetap return 200 meski update viewCount gagal', async () => {
    const prismaMock = {
      regulation: {
        findUnique: jest.fn().mockResolvedValue(fakeRegulation),
        update: jest.fn().mockRejectedValue(new Error('DB error')), // viewCount update gagal
      },
    };
    const { GET } = await loadRouteWithMocks(baseRoute, { prismaMock });
    const req = makeMockRequest({ url: 'http://localhost/api/regulations/r1' });

    const res = await GET(req, { params: Promise.resolve({ id: 'r1' }) });
    // Response utama tidak terpengaruh oleh kegagalan viewCount
    expect(res.status).toBe(200);
    await new Promise(r => setTimeout(r, 50));
  });

  test('TC-VIEW-03: GET dokumen tidak ada → 404, viewCount tidak diincrement', async () => {
    const prismaMock = {
      regulation: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };
    const { GET } = await loadRouteWithMocks(baseRoute, { prismaMock });
    const req = makeMockRequest({ url: 'http://localhost/api/regulations/ghost' });

    const res = await GET(req, { params: Promise.resolve({ id: 'ghost' }) });
    expect(res.status).toBe(404);
    await new Promise(r => setTimeout(r, 50));
    expect(prismaMock.regulation.update).not.toHaveBeenCalled();
  });
});
