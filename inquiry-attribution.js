'use strict';

(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InquiryAttribution = api;
})(typeof globalThis === 'object' ? globalThis : this, function (root) {
  const storageKey = '805carguy-inquiry-attribution-v1';
  const publicPaths = new Set([
    '/', '/services', '/about', '/privacy', '/terms', '/find-my-car',
    '/new-car-buying-help', '/used-car-evaluation'
  ]);
  const inquiryPaths = new Set([
    '/services', '/about', '/find-my-car', '/new-car-buying-help', '/used-car-evaluation'
  ]);
  const sources = new Set([
    'google', 'bing', 'chatgpt', 'perplexity', 'instagram', 'facebook',
    'youtube', 'newsletter', 'referral'
  ]);
  const media = new Set(['organic', 'referral', 'email', 'social', 'paid', 'cpc']);
  const siteHosts = new Set(['805carguy.com', 'www.805carguy.com']);
  let current = null;

  function webUrl(value) {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url : null;
    } catch (_) {
      return null;
    }
  }

  function allowed(value, choices) {
    return typeof value === 'string' && choices.has(value) ? value : '';
  }

  // Only this fixed schema crosses the storage or inquiry boundary.
  function sanitize(record) {
    const data = record && typeof record === 'object' ? record : {};
    const referrer = webUrl(data.referrerSource);
    return {
      landingPage: allowed(data.landingPage, publicPaths),
      referrerSource: referrer && !siteHosts.has(referrer.hostname) ? referrer.origin : '',
      inquiryPage: allowed(data.inquiryPage, inquiryPaths),
      source: allowed(data.source, sources),
      medium: allowed(data.medium, media)
    };
  }

  function sameSite(first, second) {
    return first && second && (first.origin === second.origin ||
      (siteHosts.has(first.hostname) && siteHosts.has(second.hostname)));
  }

  // Pure first-touch capture. A CTA marker records its own page, never the landing page.
  function capture(previous, visit = {}) {
    const url = webUrl(visit.url);
    const hasPrevious = previous !== null && typeof previous === 'object' && !Array.isArray(previous);
    const data = sanitize(hasPrevious ? previous : {});
    if (!hasPrevious) {
      data.landingPage = url ? allowed(url.pathname, publicPaths) : '';
      const referrer = webUrl(visit.referrer);
      data.referrerSource = referrer && !sameSite(referrer, url) ? referrer.origin : '';
      data.source = url ? allowed(url.searchParams.get('utm_source'), sources) : '';
      data.medium = url ? allowed(url.searchParams.get('utm_medium'), media) : '';
    }
    const from = url && url.searchParams.get('from');
    const inquiryPage = from ? allowed('/' + from, inquiryPaths) : '';
    if (inquiryPage) data.inquiryPage = inquiryPage;
    return sanitize(data);
  }

  function get() {
    if (!root || !root.location || !root.document) return sanitize(current);
    if (current === null) {
      try {
        const saved = JSON.parse(root.sessionStorage.getItem(storageKey));
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) current = sanitize(saved);
      } catch (_) {
        // Storage can be blocked; attribution must never prevent an inquiry.
      }
    }
    current = capture(current, { url: root.location.href, referrer: root.document.referrer });
    try {
      root.sessionStorage.setItem(storageKey, JSON.stringify(current));
    } catch (_) {
      // Keep this page's context in memory when session storage is unavailable.
    }
    return sanitize(current);
  }

  if (root && root.location && root.document) get();
  return { get, sanitize, capture };
});
