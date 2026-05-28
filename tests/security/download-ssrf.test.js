import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

// ─────────────────────────────────────────────────────────────────────────────
// Security Tests: SSRF via Download Proxy — FIXED
// Fix: tambah validasi hostname wajib *.supabase.co sebelum fetch
// ─────────────────────────────────────────────────────────────────────────────

const baseRoute = '@/app/api/regulations/download/route.js';

global.fetch = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('SECURITY: SSRF via /api/regulations/download — FIXED', () => {
  test('S-SSRF-01: [FIXED] AWS metadata URL sekarang ditolak 400', async () => {
    const { GET } = await loadRouteWithMocks(baseRoute, {});
    const req = makeMockRequest({
      url: 'http://localhost/api/regulations/download?url=http://169.254.169.254/latest/meta-data/',
    });
    const res = await GET(req);
    // Sebelum fix: fetch dipanggil & bisa probe internal. Setelah fix: 400 ✅
    expect(res.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('S-SSRF-02: [FIXED] URL localhost internal sekarang ditolak 400', async () => {
    const { GET } = await loadRouteWithMocks(baseRoute, {});
    const internalUrls = [
      'http://localhost:5432',
      'http://127.0.0.1:6379',
      'http://192.168.1.1/admin',
    ];
    for (const url of internalUrls) {
      jest.clearAllMocks();
      const req = makeMockRequest({
        url: `http://localhost/api/regulations/download?url=${encodeURIComponent(url)}`,
      });
      const res = await GET(req);
      expect(res.status).toBe(400);
      expect(global.fetch).not.toHaveBeenCalled();
    }
  });

  test('S-SSRF-03: [FIXED] URL non-Supabase (domain acak) sekarang ditolak 400', async () => {
    const { GET } = await loadRouteWithMocks(baseRoute, {});
    const req = makeMockRequest({
      url: 'http://localhost/api/regulations/download?url=https://evil.com/malware.pdf',
    });
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('S-SSRF-04: URL Supabase valid tetap bisa didownload', async () => {
    const pdfBuf = Buffer.from('%PDF-1.4 test');
    global.fetch.mockResolvedValue({
      ok: true, status: 200,
      arrayBuffer: async () => pdfBuf.buffer,
    });

    const { GET } = await loadRouteWithMocks(baseRoute, {});
    const req = makeMockRequest({
      url: 'http://localhost/api/regulations/download?url=https://abc.supabase.co/storage/v1/object/public/docs/test.pdf&name=test.pdf',
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('supabase.co'),
      expect.anything()
    );
  });
});
