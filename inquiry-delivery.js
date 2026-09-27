'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InquiryDelivery = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  const endpoint = 'https://formsubmit.co/ajax/3bee3a7c1f40b430ff307881c018db32';
  const productionHosts = new Set(['www.805carguy.com', '805carguy.com']);

  function isProduction(location) {
    return location.protocol === 'https:' && productionHosts.has(location.hostname);
  }

  function buildPayload(answers, offer, reference) {
    const contact = answers.contact || {};
    const email = contact.method === 'Email me';
    const reply = (contact.reply || '').trim();
    if (!(contact.name || '').trim() || !reply || !offer || !reference) throw new Error('Incomplete inquiry');
    if (!['Email me', 'Text me', 'Call me'].includes(contact.method)) throw new Error('Invalid contact preference');
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
      service: offer.title,
      displayed_price: offer.price,
      scope: offer.caption,
      timing: answers.timing || '',
      review_type: answers.reviewType || '',
      message: contact.context || '',
      location: contact.location || '',
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

  return { isProduction, buildPayload, submit };
});
