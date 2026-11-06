'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server.js');
const { cleanInquiry, deliverInquiry, withinRateLimit } = app;

const inquiry = {
  reference: '805-0f6a1c2e-1111-4222-8333-444455556666', name: ' Customer ', contact_preference: 'Email me',
  contact: 'customer@example.com', email: 'customer@example.com', _replyto: 'customer@example.com',
  service: 'Talk with Isaac.', displayed_price: 'Scope agreed first', scope: 'General inquiry', message: 'Hello',
  intent: 'Buy', landing_page: '/', inquiry_only: 'No booking, payment, or service agreement.'
};

function post(origin, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const request = http.request(origin + path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }, agent: false }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks).toString() }));
    });
    request.on('error', reject);
    request.end(data);
  });
}

test('cleanInquiry keeps only known, bounded fields and rejects bots and incomplete inquiries', () => {
  const payload = cleanInquiry({ ...inquiry, extra: 'dropped', _subject: 'spoofed', _honey: '' });
  assert.equal(payload.name, 'Customer');
  assert.equal(payload._subject, 'New lead from 805carguy.com');
  assert.equal(payload._url, 'https://www.805carguy.com/');
  assert.equal(payload.extra, undefined);
  assert.equal(cleanInquiry({ ...inquiry, message: 'x'.repeat(5000) }).message.length, 2500);
  for (const bad of [null, [], 'text', { ...inquiry, _honey: 'bot' }, { ...inquiry, name: ' ' }, { ...inquiry, contact: '' },
    { ...inquiry, contact_preference: 'Fax me' }, { ...inquiry, reference: 'other-id' }, { ...inquiry, message: { nested: true } }]) {
    assert.equal(cleanInquiry(bad), null);
  }
});

test('deliverInquiry prefers FormSubmit, then Resend when configured, and reports every attempt', async () => {
  const payload = cleanInquiry(inquiry);
  const direct = await deliverInquiry(payload, { fetchImpl: async url => {
    assert.equal(url, 'https://formsubmit.co/ajax/3bee3a7c1f40b430ff307881c018db32');
    return { ok: true, json: async () => ({ success: 'true' }) };
  } });
  assert.deepEqual(direct, { channel: 'formsubmit', attempts: [] });
  const backup = await deliverInquiry(payload, { env: { RESEND_API_KEY: 'test-key' }, fetchImpl: async (url, init) => {
    if (url.startsWith('https://formsubmit.co/')) return { ok: false, status: 522 };
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(init.headers.Authorization, 'Bearer test-key');
    const body = JSON.parse(init.body);
    assert.deepEqual(body.to, ['isaac@carofslo.com']);
    assert.equal(body.reply_to, 'customer@example.com');
    assert.match(body.text, /name: Customer/);
    assert.doesNotMatch(body.text, /_subject|spoofed/);
    return { ok: true, json: async () => ({ id: 'email-id' }) };
  } });
  assert.deepEqual(backup, { channel: 'resend', attempts: ['formsubmit: HTTP 522'] });
  await assert.rejects(deliverInquiry(payload, { env: {}, fetchImpl: async () => ({ ok: false, status: 503 }) }), error => {
    assert.deepEqual(error.attempts, ['formsubmit: HTTP 503']);
    return true;
  });
  await assert.rejects(deliverInquiry(payload, { env: { RESEND_API_KEY: 'k' }, fetchImpl: async () => { throw new Error('offline'); } }), error => {
    assert.deepEqual(error.attempts, ['formsubmit: offline', 'resend: offline']);
    return true;
  });
  await assert.rejects(deliverInquiry(payload, { env: {}, timeoutMs: 5, fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('timeout')))) }));
});

test('rate limiting allows a dozen inquiries per hour per connection', () => {
  const now = Date.now();
  for (let i = 0; i < 12; i++) assert.equal(withinRateLimit('ip-test', now + i), true);
  assert.equal(withinRateLimit('ip-test', now + 20), false);
  assert.equal(withinRateLimit('ip-test', now + 61 * 60 * 1000), true);
});

test('POST /inquiry accepts website inquiries, rejects other origins and bad input, and never claims unconfirmed delivery', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const original = app.locals.deliverInquiry;
  const delivered = [];
  app.locals.deliverInquiry = async payload => { delivered.push(payload); return { channel: 'formsubmit', attempts: [] }; };
  try {
    const noOrigin = await post(origin, '/inquiry', inquiry);
    assert.equal(noOrigin.status, 403);
    const elsewhere = await post(origin, '/inquiry', inquiry, { Origin: 'https://evil.example' });
    assert.equal(elsewhere.status, 403);
    const invalid = await post(origin, '/inquiry', { ...inquiry, name: '' }, { Origin: 'https://www.805carguy.com' });
    assert.equal(invalid.status, 400);
    const malformed = await post(origin, '/inquiry', '{not json', { Origin: 'https://www.805carguy.com' });
    assert.equal(malformed.status, 400);
    const accepted = await post(origin, '/inquiry', { ...inquiry, extra: 'dropped' }, { Origin: 'https://www.805carguy.com' });
    assert.equal(accepted.status, 200);
    assert.equal(accepted.headers['x-content-type-options'], 'nosniff');
    assert.deepEqual(JSON.parse(accepted.body), { accepted: true, channel: 'formsubmit' });
    assert.equal(delivered.length, 1);
    assert.equal(delivered[0].name, 'Customer');
    assert.equal(delivered[0].extra, undefined);
    const local = await post(origin, '/inquiry', inquiry, { Origin: 'http://localhost:3000' });
    assert.equal(local.status, 200);
    app.locals.deliverInquiry = async () => { const error = new Error('All delivery channels failed'); error.attempts = ['formsubmit: HTTP 522']; throw error; };
    const failed = await post(origin, '/inquiry', inquiry, { Origin: 'https://www.805carguy.com' });
    assert.equal(failed.status, 502);
    assert.equal(JSON.parse(failed.body).accepted, false);
    const other = await post(origin, '/', inquiry, { Origin: 'https://www.805carguy.com' });
    assert.equal(other.status, 404);
  } finally {
    app.locals.deliverInquiry = original;
    server.closeAllConnections();
    server.close();
  }
});
