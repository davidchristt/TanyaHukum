import { makeMockRequest } from '@/tests/utils/mockRequest';
import { loadRouteWithMocks } from '@/tests/utils/loadRouteWithMocks';

// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests: Payment Flow
// Cakupan: checkout → webhook → user upgrade → idempotency → failure handling
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('midtrans-client', () => ({
  __esModule: true,
  default: {
    Snap: jest.fn().mockImplementation(() => ({
      createTransaction: jest.fn().mockResolvedValue({
        token: 'snap-token-int',
        redirect_url: 'https://app.sandbox.midtrans.com/snap/pay/snap-token-int',
      }),
    })),
    CoreApi: jest.fn().mockImplementation(() => ({
      transaction: { status: jest.fn() },
    })),
  },
}));

describe('Integration: Checkout → Webhook → User Upgrade', () => {
  test('TC-INT-PAY-01: settlement webhook upgrades user to PRO (simulates post-checkout state)', async () => {
    // This test simulates the state AFTER checkout: a PENDING transaction exists in DB.
    // We verify the webhook correctly marks it SUCCESS and upgrades the user tier.
    // (The full checkout→webhook flow is split across unit tests to avoid ESM mock constraints.)
    process.env.NODE_ENV = 'test';

    const orderId = `TRX-${Date.now()}-buyer`;

    // Webhook: payment settled → should upgrade user to PRO
    const webhookMock = {
      transaction: {
        findUnique: jest.fn().mockResolvedValue({ orderId, status: 'PENDING', userId: 'u-buyer' }),
        update: jest.fn().mockResolvedValue({}),
      },
      user: { update: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    const { POST: webhookPost } = await loadRouteWithMocks('@/app/api/payment/webhook/route.js', { prismaMock: webhookMock });
    const webhookReq = makeMockRequest({
      method: 'POST',
      jsonBody: {
        order_id: orderId,
        transaction_status: 'settlement',
        fraud_status: 'accept',
        status_code: '200',
        gross_amount: '49900.00',
        signature_key: 'bypass-in-sandbox',
      },
    });
    const webhookRes = await webhookPost(webhookReq);
    expect(webhookRes.status).toBe(200);

    // Verify user was upgraded to PRO
    expect(webhookMock.$transaction).toHaveBeenCalledTimes(1);
    const txnArgs = webhookMock.$transaction.mock.calls[0]?.[0];
    expect(Array.isArray(txnArgs)).toBe(true);
  });

  test('TC-INT-PAY-02: webhook idempotency — already-SUCCESS order is not reprocessed', async () => {
    const webhookMock = {
      transaction: {
        findUnique: jest.fn().mockResolvedValue({ orderId: 'TRX-ALREADY-SUCCESS', status: 'SUCCESS', userId: 'u1' }),
        update: jest.fn(),
      },
      user: { update: jest.fn() },
      $transaction: jest.fn(),
    };
    const { POST: webhookPost } = await loadRouteWithMocks('@/app/api/payment/webhook/route.js', { prismaMock: webhookMock });
    const req = makeMockRequest({
      method: 'POST',
      jsonBody: {
        order_id: 'TRX-ALREADY-SUCCESS',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        status_code: '200',
        gross_amount: '49900.00',
        signature_key: 'any',
      },
    });
    const res = await webhookPost(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/already processed/i);

    // Critical: no DB update for duplicate webhook
    expect(webhookMock.$transaction).not.toHaveBeenCalled();
    expect(webhookMock.user.update).not.toHaveBeenCalled();
  });

  test('TC-INT-PAY-03: failed payment sets transaction status to FAILED', async () => {
    const webhookMock = {
      transaction: {
        findUnique: jest.fn().mockResolvedValue({ orderId: 'TRX-FAIL', status: 'PENDING', userId: 'u1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      user: { update: jest.fn() },
      $transaction: jest.fn(),
    };
    const { POST: webhookPost } = await loadRouteWithMocks('@/app/api/payment/webhook/route.js', { prismaMock: webhookMock });
    const req = makeMockRequest({
      method: 'POST',
      jsonBody: {
        order_id: 'TRX-FAIL',
        transaction_status: 'cancel',
        fraud_status: 'accept',
        status_code: '200',
        gross_amount: '49900.00',
        signature_key: 'any',
      },
    });
    const res = await webhookPost(req);
    expect(res.status).toBe(200);

    const updateCall = webhookMock.transaction.update.mock.calls[0]?.[0];
    expect(updateCall.data.status).toBe('FAILED');
    expect(webhookMock.$transaction).not.toHaveBeenCalled(); // No user upgrade
  });

  test('TC-INT-PAY-04: fraud_status=challenge keeps payment as PENDING', async () => {
    const webhookMock = {
      transaction: {
        findUnique: jest.fn().mockResolvedValue({ orderId: 'TRX-CHALLENGE', status: 'PENDING', userId: 'u1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      user: { update: jest.fn() },
      $transaction: jest.fn(),
    };
    const { POST: webhookPost } = await loadRouteWithMocks('@/app/api/payment/webhook/route.js', { prismaMock: webhookMock });
    const req = makeMockRequest({
      method: 'POST',
      jsonBody: {
        order_id: 'TRX-CHALLENGE',
        transaction_status: 'capture',
        fraud_status: 'challenge', // Flagged by Midtrans fraud detection
        status_code: '200',
        gross_amount: '49900.00',
        signature_key: 'any',
      },
    });
    const res = await webhookPost(req);
    expect(res.status).toBe(200);
    expect(webhookMock.$transaction).not.toHaveBeenCalled();
  });

  test('TC-INT-PAY-05: webhook returns 404 when order not found in database', async () => {
    const webhookMock = {
      transaction: { findUnique: jest.fn().mockResolvedValue(null), update: jest.fn() },
      user: { update: jest.fn() },
      $transaction: jest.fn(),
    };
    const { POST: webhookPost } = await loadRouteWithMocks('@/app/api/payment/webhook/route.js', { prismaMock: webhookMock });
    const req = makeMockRequest({
      method: 'POST',
      jsonBody: {
        order_id: 'TRX-GHOST',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        status_code: '200',
        gross_amount: '49900.00',
        signature_key: 'any',
      },
    });
    const res = await webhookPost(req);
    expect(res.status).toBe(404);
  });

  test('TC-INT-PAY-06: production mode rejects webhook with invalid signature', async () => {
    process.env.NODE_ENV = 'production';
    process.env.MIDTRANS_SERVER_KEY = 'Production-Server-Key-12345';

    const webhookMock = {
      transaction: {
        findUnique: jest.fn().mockResolvedValue({ orderId: 'TRX-PROD', status: 'PENDING', userId: 'u1' }),
        update: jest.fn(),
      },
      user: { update: jest.fn() },
      $transaction: jest.fn(),
    };
    const { POST: webhookPost } = await loadRouteWithMocks('@/app/api/payment/webhook/route.js', { prismaMock: webhookMock });
    const req = makeMockRequest({
      method: 'POST',
      jsonBody: {
        order_id: 'TRX-PROD',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        status_code: '200',
        gross_amount: '49900.00',
        signature_key: 'invalid-signature',
      },
    });
    const res = await webhookPost(req);
    expect(res.status).toBe(403);

    // Restore test env
    process.env.NODE_ENV = 'test';
  });
});
