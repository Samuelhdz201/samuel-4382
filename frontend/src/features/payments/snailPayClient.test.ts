import { afterEach, describe, expect, it, vi } from 'vitest';
import { chargeCard } from './snailPayClient';
import type { PaymentRequest, PaymentResponse } from './types';

const request: PaymentRequest = {
  card_number: '1234123412341234',
  expiration_date: '12/26',
  cvv: '543',
  cardholder_name: 'Ana López',
  transaction_amount: 100,
  payer_id: 'u1',
  payer_email: 'ana@example.com',
};

const payment: PaymentResponse = {
  id: 'p1',
  status: 'approved',
  status_detail: 'accredited',
  transaction_amount: 100,
  date_created: '2026-09-29T12:00:00.000Z',
  authorization_code: 'AUTH123456',
  reference: 'SP-ABCD1234',
  payer_id: 'u1',
  payer_email: 'ana@example.com',
  card_number: '1234123412341234',
  cvv: '543',
};

const respondWith = (status: number, body: unknown) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status })),
  );

afterEach(() => vi.unstubAllGlobals());

describe('chargeCard', () => {
  it('clasifica 201 + approved como aprobado', async () => {
    respondWith(201, payment);
    expect(await chargeCard(request)).toEqual({ kind: 'approved', payment });
  });

  it('no cuenta como aprobado un 201 cuyo cuerpo dice otra cosa', async () => {
    respondWith(201, { ...payment, status: 'rejected' });
    expect((await chargeCard(request)).kind).toBe('system_error');
  });

  it('clasifica un 402 rejected como rechazado', async () => {
    const rejected = { ...payment, status: 'rejected', status_detail: 'cc_rejected_other_reason' };
    respondWith(402, rejected);
    expect(await chargeCard(request)).toEqual({ kind: 'rejected', payment: rejected });
  });

  it('clasifica un 503 como error del sistema', async () => {
    respondWith(503, { ...payment, status: 'error', status_detail: 'system_unavailable' });
    expect((await chargeCard(request)).kind).toBe('system_error');
  });

  it('trata un cuerpo que no es JSON como error del sistema', async () => {
    respondWith(502, '<html>Bad Gateway</html>');
    expect(await chargeCard(request)).toEqual({ kind: 'system_error', payment: null });
  });

  it('devuelve network_error si no hay conexión', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    expect(await chargeCard(request)).toEqual({ kind: 'network_error' });
  });

  it('devuelve timeout si SnailPay no responde a tiempo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );
    expect(await chargeCard(request, 20)).toEqual({ kind: 'timeout' });
  });
});