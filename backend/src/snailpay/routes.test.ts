import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import type { SnailPayMode } from './config.js';

const validBody = {
  card_number: '1234123412341234',
  expiration_date: '12/26',
  cvv: '543',
  cardholder_name: 'Ana López',
  transaction_amount: 100,
  payer_id: 'user-1',
  payer_email: 'ana@example.com',
};

const RESPONSE_FIELDS = [
  'id',
  'status',
  'status_detail',
  'transaction_amount',
  'date_created',
  'authorization_code',
  'reference',
  'payer_id',
  'payer_email',
  'card_number',
  'cvv',
].sort();

const pay = (body: unknown, mode: SnailPayMode = 'normal', slowDelayMs = 50) =>
  request(createApp({ snailpay: { mode, slowDelayMs } }))
    .post('/snailpay/v1/payments')
    .send(body as object);

describe('POST /snailpay/v1/payments', () => {
  it('aprueba el cobro con la tarjeta de éxito', async () => {
    const res = await pay(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: 'approved',
      status_detail: 'accredited',
      transaction_amount: 100,
      payer_id: 'user-1',
      payer_email: 'ana@example.com',
    });
    expect(res.body.authorization_code).toMatch(/^AUTH\d{6}$/);
  });

  it('rechaza la tarjeta sin fondos, sin código de autorización', async () => {
    const res = await pay({ ...validBody, card_number: '4000000000000002' });
    expect(res.status).toBe(402);
    expect(res.body).toMatchObject({
      status: 'rejected',
      status_detail: 'cc_rejected_insufficient_funds',
      authorization_code: null,
    });
  });

  it('responde 422 cuando los datos tienen formato inválido', async () => {
    const res = await pay({ ...validBody, card_number: '1234' });
    expect(res.status).toBe(422);
    expect(res.body).toMatchObject({ status: 'rejected', status_detail: 'invalid_card_number' });
  });

  it('responde 400 con la forma de SnailPay cuando el JSON está mal formado', async () => {
    const res = await request(createApp({ snailpay: { mode: 'normal', slowDelayMs: 0 } }))
      .post('/snailpay/v1/payments')
      .set('Content-Type', 'application/json')
      .send('{"card_number":');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ status: 'rejected', status_detail: 'invalid_request' });
  });

  it('en modo down responde 503 y no aprueba nada, aunque los datos sean válidos', async () => {
    const res = await pay(validBody, 'down');
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({
      status: 'error',
      status_detail: 'system_unavailable',
      authorization_code: null,
    });
  });

  it('en modo slow responde correctamente pero después del retraso', async () => {
    const start = Date.now();
    const res = await pay(validBody, 'slow', 100);
    expect(Date.now() - start).toBeGreaterThanOrEqual(90);
    expect(res.status).toBe(201);
  });

  it('las tres clases de respuesta tienen exactamente los mismos campos', async () => {
    const approved = await pay(validBody);
    const rejected = await pay({ ...validBody, card_number: '4000000000000002' });
    const down = await pay(validBody, 'down');
    for (const res of [approved, rejected, down])
      expect(Object.keys(res.body).sort()).toEqual(RESPONSE_FIELDS);
  });
});