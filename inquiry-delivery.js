'use strict';

(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./inquiry-attribution') : root.InquiryAttribution);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InquiryDelivery = api;
})(typeof globalThis === 'object' ? globalThis : this, function (attribution) {
  const endpoint = 'https://formsubmit.co/ajax/3bee3a7c1f40b430ff307881c018db32';
  const productionHosts = new Set(['www.805carguy.com', '805carguy.com']);

  function isProduction(location) {
    return location.protocol === 'https:' && productionHosts.has(location.hostname);
  }

  function isValidPhone(value) {
    if (typeof value !== 'string') return false;
    // Keep the entered formatting; extensions do not make a short main number valid.
    const parts = value.trim().match(/^(.+?)(?:\s*(?:ext(?:ension)?\.?|x|#)\s*\d+)?$/i);
    if (!parts) return false;
    const main = parts[1];
    if (!/^[\d\s()+.\/\-\u2010-\u2015]+$/.test(main)) return false;
    const pluses = (main.match(/\+/g) || []).length;
    if (pluses > 1 || (pluses === 1 && !/^[\s(]*\+/.test(main))) return false;
    return main.replace(/\D/g, '').length >= 7;
  }

  function buildPayload(answers, offer, reference) {
    const contact = answers.contact || {};
    const email = contact.method === 'Email me';
    const reply = (contact.reply || '').trim();
    if (!(contact.name || '').trim() || !reply || !offer || !reference) throw new Error('Incomplete inquiry');
    if (!['Email me', 'Text me', 'Call me'].includes(contact.method)) throw new Error('Invalid contact preference');
    if (!email && !isValidPhone(reply)) throw new Error('Invalid phone number');
    const source = attribution?.sanitize(answers.attribution || {}) || {};
    const intent = ['Buy', 'Buy new', 'Buy used', 'Sell', 'Research'].includes(answers.intent) ? answers.intent : '';
    return {
      _subject: 'New lead from 805carguy.com',
      _template: 'table',
      _url: 'https://www.805carguy.com/',
      _honey: contact.website || '',
      reference,
      name: contact.name.trim(),
      contact_preference: contact.method,
      contact: reply,
      ...(email ? { email: reply, _replyto: reply } : { phone: reply }),
      intent,
      purchase_preference: ['Buy', 'Buy new', 'Buy used'].includes(intent) && ['New', 'Used', 'Open to Either'].includes(answers.purchasePreference) ? answers.purchasePreference : '',
      service: offer.title,
      displayed_price: offer.price,
      scope: offer.caption,
      timing: answers.timing || '',
      review_type: answers.reviewType || '',
      message: contact.context || '',
      location: contact.location || '',
      vehicle_location: contact.vehicleLocation || '',
      how_you_found_me: contact.heardAbout || '',
      landing_page: source.landingPage || '',
      referring_site: source.referrerSource || '',
      inquiry_page: source.inquiryPage || '',
      visit_source: source.source || '',
      visit_medium: source.medium || '',
      inquiry_only: 'No booking, payment, or service agreement.'
    };
  }

  async function submit(payload, options = {}) {
    const fetchImpl = options.fetchImpl || fetch;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || 20000);
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: 'omit'
      });
      if (!response.ok) throw new Error('Submission not accepted');
      const result = await response.json();
      if (!result || (result.success !== true && result.success !== 'true')) {
        throw new Error('Submission not confirmed');
      }
      return { accepted: true };
    } finally {
      clearTimeout(timer);
    }
  }

  return { isProduction, isValidPhone, buildPayload, submit };
});
