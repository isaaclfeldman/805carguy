'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { sanitize, capture, get } = require('../inquiry-attribution');
const script = fs.readFileSync(require.resolve('../inquiry-attribution'), 'utf8');
const origin = 'https://www.805carguy.com';

function browser(url, referrer = '', storage = new Map(), denied = false) {
  const context = {
    URL,
    location: { href: url },
    document: { referrer }
  };
  Object.defineProperty(context, 'sessionStorage', { get() {
    if (denied) throw new Error('Storage access denied');
    return {
      getItem: key => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value)
    };
  } });
  vm.runInNewContext(script, context);
  return { get: () => JSON.parse(JSON.stringify(context.InquiryAttribution.get())), context, storage };
}

test('first external visit keeps only a known landing path and the referrer origin', () => {
  const data = capture(null, {
    url: origin + '/used-car-evaluation?email=private@example.com#customer-name',
    referrer: 'https://www.google.com/search?q=private+car+details'
  });
  assert.deepEqual(data, {
    landingPage: '/used-car-evaluation', referrerSource: 'https://www.google.com',
    inquiryPage: '', source: '', medium: ''
  });
});

test('browser page loads persist first touch and the service CTA through further navigation', () => {
  const storage = new Map();
  browser(origin + '/new-car-buying-help?utm_source=google&utm_medium=cpc', 'https://www.google.com/search?q=car', storage);
  const inquiry = browser(origin + '/?from=new-car-buying-help#inquire-buy', origin + '/new-car-buying-help', storage);
  assert.deepEqual(inquiry.get(), {
    landingPage: '/new-car-buying-help', referrerSource: 'https://www.google.com',
    inquiryPage: '/new-car-buying-help', source: 'google', medium: 'cpc'
  });
  const later = browser(origin + '/', origin + '/services', storage);
  assert.deepEqual(later.get(), inquiry.get());
  const nextCta = browser(origin + '/?from=used-car-evaluation', origin + '/used-car-evaluation', storage);
  assert.equal(nextCta.get().inquiryPage, '/used-car-evaluation');
  assert.equal(nextCta.get().landingPage, '/new-car-buying-help');
});

test('from markers never masquerade as original landing pages', () => {
  const data = capture(null, { url: origin + '/?from=used-car-evaluation#inquire' });
  assert.equal(data.landingPage, '/');
  assert.equal(data.inquiryPage, '/used-car-evaluation');
});

test('internal referrers including the canonical-host redirect are not external sources', () => {
  for (const referrer of [origin + '/about?email=private@example.com', 'http://805carguy.com/services']) {
    assert.equal(capture(null, { url: origin + '/', referrer }).referrerSource, '');
  }
  assert.equal(capture(null, { url: 'http://localhost:3000/', referrer: 'http://localhost:3000/services' }).referrerSource, '');
  assert.equal(capture(null, { url: origin + '/', referrer: 'https://www.thevinhound.com/results?vin=secret' }).referrerSource, 'https://www.thevinhound.com');
});

test('unknown paths and arbitrary personal campaign data never reach storage', () => {
  const page = browser(origin + '/private@example.com?from=private@example.com&utm_source=private@example.com&utm_medium=private&utm_campaign=private-name&gclid=private-id',
    'https://user:password@referral.example/private-name?email=private@example.com');
  assert.deepEqual(page.get(), {
    landingPage: '', referrerSource: 'https://referral.example', inquiryPage: '', source: '', medium: ''
  });
  assert.doesNotMatch([...page.storage.values()].join(''), /private|password|utm_campaign|gclid|user:/);
});

test('only approved campaign categories survive and cannot replace first-touch attribution', () => {
  const first = capture(null, { url: origin + '/?utm_source=chatgpt&utm_medium=referral' });
  assert.equal(first.source, 'chatgpt');
  assert.equal(first.medium, 'referral');
  const later = capture(first, { url: origin + '/services?utm_source=facebook&utm_medium=paid' });
  assert.equal(later.source, 'chatgpt');
  assert.equal(later.medium, 'referral');
  assert.equal(later.landingPage, '/');
});

test('blocked session storage still permits current-page attribution and returns fresh copies', () => {
  const page = browser(origin + '/new-car-buying-help?utm_source=newsletter&utm_medium=email', 'https://mail.example/inbox/private', undefined, true);
  assert.equal(page.get().landingPage, '/new-car-buying-help');
  assert.equal(page.get().referrerSource, 'https://mail.example');
  page.get().source = 'changed';
  assert.equal(page.get().source, 'newsletter');
  page.context.location.href = origin + '/?from=new-car-buying-help';
  assert.equal(page.get().inquiryPage, '/new-car-buying-help');
  assert.equal(page.get().landingPage, '/new-car-buying-help');
});

test('malformed saved data recovers, while tampered fields are discarded or reduced', () => {
  const storage = new Map([['805carguy-inquiry-attribution-v1', '{invalid-json']]);
  assert.equal(browser(origin + '/services', '', storage).get().landingPage, '/services');
  storage.set('805carguy-inquiry-attribution-v1', JSON.stringify({
    landingPage: '/private-name', referrerSource: 'https://referral.example/private?secret=true',
    inquiryPage: '/private-name', source: 'private-name', medium: 'private-name', secret: 'private-name'
  }));
  const data = browser(origin + '/', '', storage).get();
  assert.deepEqual(data, { landingPage: '', referrerSource: 'https://referral.example', inquiryPage: '', source: '', medium: '' });
  assert.doesNotMatch([...storage.values()].join(''), /private|secret/);
});

test('invalid URLs and non-web referrers do not leak arbitrary text or break the helper', () => {
  for (const referrer of ['not a url', 'javascript:alert(1)', 'file:///private-name', 'mailto:private@example.com']) {
    assert.equal(capture(null, { url: origin + '/', referrer }).referrerSource, '');
  }
  assert.deepEqual(capture(null, { url: 'not a url' }), sanitize(null));
  assert.deepEqual(get(), sanitize(null));
});
