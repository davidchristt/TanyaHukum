import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests: GET /api/regulations/download
// Cakupan: proxy download, missing URL, upstream failure, filename sanitization
// SECURITY: SSRF potential — proxy fetches arbitrary URL from user input
// ─────────────────────────────────────────────────────────────────────────────

const baseRoute = '@/app/api/regulations/download/route.js';

global.fetch = jest.fn();

describe('GET /api/regulations/download', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── HAPPY PATH ──────────────────────────────────────────────────────────────
  test('TC-DL-01: returns PDF buffer with correct headers for valid Supabase URL', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 fake content');
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: async () => pdfBuffer.buffer,
    });

    const { GET } = await loadRouteWithMocks(baseRoute, {});
    const req = makeMockRequest({
      url: 'http://localhost/api/regulations/download?url=https://supabase.co/storage/doc.pdf&name=UU-Test.pdf',
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('attachment');
    expect(res.headers.get('Content-Disposition')).toContain('UU-Test.pdf');
  });

  // ── INPUT VALIDATION ────────────────────────────────────────────────────────
  test('TC-DL-02: returns 400 when url param is missing', async () => {
    const { GET } = await loadRouteWithMocks(baseRoute, {});
    const req = makeMockRequest({ url: 'http://localhost/api/regulations/download' });
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/url/i);
  });

  // ── UPSTREAM FAILURE ────────────────────────────────────────────────────────
  test('TC-DL-03: returns upstream status code when Supabase file not found (404)', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404 });

    const { GET } = await loadRouteWithMocks(baseRoute, {});
    const req = makeMockRequest({
      url: 'http://localhost/api/regulations/download?url=https://supabase.co/storage/missing.pdf',
    });
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  test('TC-DL-04: returns 500 when fetch throws (network error)', async () => {
    global.fetch.mockRejectedValue(new Error('Network unreachable'));

    const { GET } = await loadRouteWithMocks(baseRoute, {});
    const req = makeMockRequest({
      url: 'http://localhost/api/regulations/download?url=https://supabase.co/storage/doc.pdf',
    });
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  // ── FILENAME SANITIZATION ───────────────────────────────────────────────────
  test('TC-DL-05: sanitizes filename — replaces path traversal slashes and special chars', async () => {
    const pdfBuffer = Buffer.from('%PDF-fake');
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: async () => pdfBuffer.buffer,
    });

    const { GET } = await loadRouteWithMocks(baseRoute, {});
    const req = makeMockRequest({
      url: 'http://localhost/api/regulations/download?url=https://supabase.co/doc.pdf&name=../../../etc/passwd',
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const disposition = res.headers.get('Content-Disposition');
    // The regex replaces '/' with '_', converting '../../../etc/passwd' to '.._.._.._etc_passwd'
    // Path traversal sequences are broken: no '/' means no OS path traversal via Content-Disposition
    expect(disposition).not.toContain('/');
    // Verify the slash was replaced (demonstrates sanitization ran)
    expect(disposition).toMatch(/\.\._\.\._/); // '../' becomes '.._ '
  });

  // ── SECURITY: SSRF — FIXED ────────────────────────────────────────────────
  test('TC-DL-06: [FIXED] URL non-Supabase ditolak 400 — SSRF sudah diblok', async () => {
    const { GET } = await loadRouteWithMocks(baseRoute, {});

    const req = makeMockRequest({
      url: 'http://localhost/api/regulations/download?url=http://169.254.169.254/latest/meta-data/',
    });
    const res = await GET(req);
    // Sebelum fix: fetch dipanggil (SSRF). Setelah fix: 400 langsung ✅
    expect(res.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
