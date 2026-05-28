import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

describe('/api/payment/checkout authorization (IDOR probe)', () => {
  test('returns 401 when userId missing', async () => {
    const prismaMock = { user: { findUnique: jest.fn() }, transaction: { create: jest.fn(), update: jest.fn() } };
    const { POST } = await loadRouteWithMocks('@/app/api/payment/checkout/route.js', { prismaMock });

    const req = makeMockRequest({ method: 'POST', jsonBody: {} });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  test('SECURITY: accepts userId from body without verifying session token', async () => {
    process.env.MIDTRANS_SERVER_KEY = 'SB-Mid-server-xxx';
    process.env.MIDTRANS_CLIENT_KEY = 'SB-Mid-client-xxx';

    const prismaMock = {
      user: { findUnique: jest.fn().mockResolvedValue({ email: 'victim@example.com' }) },
      transaction: {
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    jest.resetModules();
    jest.doMock('midtrans-client', () => ({
      __esModule: true,
      default: {
        Snap: class Snap {
          async createTransaction() {
            return { token: 't', redirect_url: 'http://midtrans/redirect' };
          }
        }
      }
    }));

    const { POST } = await loadRouteWithMocks('@/app/api/payment/checkout/route.js', { prismaMock });

    const req = makeMockRequest({
      method: 'POST',
      jsonBody: { userId: 'victim-user-id' },
      // no cookie token here
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.redirect_url).toMatch(/^http/);
    expect(prismaMock.transaction.create).toHaveBeenCalledTimes(1);
  });
});

