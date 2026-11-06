// 805CarGuy — static public pages plus an inquiry relay. The browser sends inquiries to FormSubmit
// directly; when that fails, POST /inquiry retries delivery server-side so a lead is never lost.
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const canonicalOrigin = 'https://www.805carguy.com';
const inquiryEndpoint = 'https://formsubmit.co/ajax/3bee3a7c1f40b430ff307881c018db32';
const inquiryRecipient = 'isaac@carofslo.com';
const inquiryOrigins = new Set([canonicalOrigin, 'https://805carguy.com']);
const inquiryFields = new Map([
  ['reference', 60], ['name', 200], ['contact_preference', 20], ['contact', 200], ['email', 200], ['_replyto', 200],
  ['phone', 200], ['intent', 20], ['purchase_preference', 20], ['service', 120], ['displayed_price', 60], ['scope', 300],
  ['timing', 60], ['review_type', 60], ['local_shop_arrangements', 60], ['message', 2500], ['location', 200],
  ['vehicle_location', 200], ['how_you_found_me', 200], ['landing_page', 60], ['referring_site', 200],
  ['inquiry_page', 60], ['visit_source', 30], ['visit_medium', 30], ['inquiry_only', 80],
]);

// Only the fields the public form builds are forwarded, trimmed and bounded; nothing else is relayed.
function cleanInquiry(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (typeof body._honey === 'string' && body._honey.trim()) return null;
  const payload = { _subject: 'New lead from 805carguy.com', _template: 'table', _url: canonicalOrigin + '/' };
  for (const [field, max] of inquiryFields) {
    const value = body[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') return null;
    payload[field] = value.trim().slice(0, max);
  }
  if (!/^805-[0-9a-f-]{8,48}$/i.test(payload.reference || '')) return null;
  if (!payload.name || !payload.contact || !payload.service) return null;
  if (!['Email me', 'Text me', 'Call me'].includes(payload.contact_preference)) return null;
  return payload;
}

function formatInquiry(payload) {
  return Object.entries(payload)
    .filter(([key, value]) => !key.startsWith('_') && value)
    .map(([key, value]) => key.replace(/_/g, ' ') + ': ' + value)
    .join('\n');
}

async function fetchWithTimeout(url, init, timeoutMs, fetchImpl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Delivery order: FormSubmit (the same alias the browser uses), then Resend when RESEND_API_KEY is set.
async function deliverInquiry(payload, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const env = options.env || process.env;
  const timeoutMs = options.timeoutMs || 15000;
  const attempts = [];
  try {
    const response = await fetchWithTimeout(inquiryEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: canonicalOrigin, Referer: canonicalOrigin + '/' },
      body: JSON.stringify(payload),
    }, timeoutMs, fetchImpl);
    const result = response.ok ? await response.json().catch(() => null) : null;
    if (result && (result.success === true || result.success === 'true')) return { channel: 'formsubmit', attempts };
    throw new Error(response.ok ? 'not confirmed' : 'HTTP ' + response.status);
  } catch (error) {
    attempts.push('formsubmit: ' + error.message);
  }
  if (env.RESEND_API_KEY) {
    try {
      const response = await fetchWithTimeout('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.INQUIRY_FROM || '805CarGuy <onboarding@resend.dev>',
          to: [env.INQUIRY_TO || inquiryRecipient],
          reply_to: payload.email || undefined,
          subject: payload._subject + ' (' + payload.reference + ')',
          text: formatInquiry(payload),
        }),
      }, timeoutMs, fetchImpl);
      const result = response.ok ? await response.json().catch(() => null) : null;
      if (result && result.id) return { channel: 'resend', attempts };
      throw new Error(response.ok ? 'not confirmed' : 'HTTP ' + response.status);
    } catch (error) {
      attempts.push('resend: ' + error.message);
    }
  }
  const failure = new Error('All delivery channels failed');
  failure.attempts = attempts;
  throw failure;
}

const inquiryRate = new Map();
function withinRateLimit(key, now = Date.now()) {
  const windowMs = 60 * 60 * 1000;
  if (inquiryRate.size > 5000) inquiryRate.clear();
  const recent = (inquiryRate.get(key) || []).filter(time => now - time < windowMs);
  const allowed = recent.length < 12;
  if (allowed) recent.push(now);
  inquiryRate.set(key, recent);
  return allowed;
}
const pageAliases = new Map([
  ['/index.html', '/'],
  ['/about/', '/about'], ['/about.html', '/about'],
  ['/services/', '/services'], ['/services.html', '/services'],
  ['/pricing/', '/pricing'], ['/pricing.html', '/pricing'],
  ['/new-car-buying-help/', '/new-car-buying-help'], ['/new-car-buying-help.html', '/new-car-buying-help'],
  ['/used-car-evaluation/', '/used-car-evaluation'], ['/used-car-evaluation.html', '/used-car-evaluation'],
  ['/terms/', '/terms'], ['/terms.html', '/terms'],
  ['/privacy/', '/privacy'], ['/privacy.html', '/privacy'],
  ['/contact/', '/contact'], ['/contact.html', '/contact'],
  ['/faq/', '/faq'], ['/faq.html', '/faq'],
  ['/service-area/', '/service-area'], ['/service-area.html', '/service-area'],
]);

// Keep configuration, source notes, and dependency files outside the public site.
const publicFiles = new Map([
  ['/', 'index.html'],
  ['/about', 'about.html'],
  ['/services', 'services.html'],
  ['/pricing', 'pricing.html'],
  ['/new-car-buying-help', 'new-car-buying-help.html'],
  ['/used-car-evaluation', 'used-car-evaluation.html'],
  ['/terms', 'terms.html'],
  ['/privacy', 'privacy.html'],
  ['/contact', 'contact.html'],
  ['/faq', 'faq.html'],
  ['/service-area', 'service-area.html'],
  ['/sitemap.xml', 'sitemap.xml'],
  ['/site.webmanifest', 'site.webmanifest'],
  ['/assets/coastal-brighter-v3-1536.jpg', 'assets/coastal-brighter-v3-1536.jpg'],
  ['/assets/coastal-brighter-v3-1536.webp', 'assets/coastal-brighter-v3-1536.webp'],
  ['/assets/coastal-brighter-v3-640.jpg', 'assets/coastal-brighter-v3-640.jpg'],
  ['/assets/coastal-brighter-v3-640.webp', 'assets/coastal-brighter-v3-640.webp'],
  ['/assets/coastal-brighter-v3-960.jpg', 'assets/coastal-brighter-v3-960.jpg'],
  ['/assets/coastal-brighter-v3-960.webp', 'assets/coastal-brighter-v3-960.webp'],
  ['/assets/modern-plate-icon-v1-180.png', 'assets/modern-plate-icon-v1-180.png'],
  ['/assets/modern-plate-icon-v1-192.png', 'assets/modern-plate-icon-v1-192.png'],
  ['/assets/modern-plate-icon-v1-32.png', 'assets/modern-plate-icon-v1-32.png'],
  ['/assets/modern-plate-icon-v1-512.png', 'assets/modern-plate-icon-v1-512.png'],
  ['/assets/modern-plate-icon-v1-96.png', 'assets/modern-plate-icon-v1-96.png'],
  ['/assets/modern-plate-v1-1200.png', 'assets/modern-plate-v1-1200.png'],
  ['/assets/modern-plate-v1-1200.webp', 'assets/modern-plate-v1-1200.webp'],
  ['/assets/modern-plate-v1-400.png', 'assets/modern-plate-v1-400.png'],
  ['/assets/modern-plate-v1-400.webp', 'assets/modern-plate-v1-400.webp'],
  ['/assets/modern-plate-v1-800.png', 'assets/modern-plate-v1-800.png'],
  ['/assets/modern-plate-v1-800.webp', 'assets/modern-plate-v1-800.webp'],
  ['/styles.css', 'styles.css'],
  ['/intake.js', 'intake.js'],
  ['/inquiry-delivery.js', 'inquiry-delivery.js'],
  ['/inquiry-attribution.js', 'inquiry-attribution.js'],
  ['/contact.js', 'contact.js'],
  ['/assets/og-805carguy-v1.png', 'assets/og-805carguy-v1.png'],
  ['/assets/isaac-v2-120.jpg', 'assets/isaac-v2-120.jpg'],
  ['/assets/isaac-v2-120.webp', 'assets/isaac-v2-120.webp'],
  ['/assets/isaac-v2-480.jpg', 'assets/isaac-v2-480.jpg'],
  ['/assets/isaac-v2-480.webp', 'assets/isaac-v2-480.webp'],
  ['/assets/isaac-v2-720.jpg', 'assets/isaac-v2-720.jpg'],
  ['/assets/isaac-v2-720.webp', 'assets/isaac-v2-720.webp'],
  ['/assets/isaac.jpg', 'assets/isaac.jpg'],
  ['/assets/dashboard-original.png', 'assets/dashboard-original.png'],
  ['/assets/juan-di-nella-coastal-drive.jpg', 'assets/juan-di-nella-coastal-drive.jpg'],
  ['/assets/juan-di-nella-coastal-drive-brighter-v2.png', 'assets/juan-di-nella-coastal-drive-brighter-v2.png'],
  ['/assets/gearshift-600.jpg', 'assets/gearshift-600.jpg'],
  ['/assets/gearshift-1200.jpg', 'assets/gearshift-1200.jpg'],
  ['/assets/plate-240.png', 'assets/plate-240.png'],
  ['/assets/plate-480.png', 'assets/plate-480.png'],
  ['/assets/plate-720.png', 'assets/plate-720.png'],
  ['/assets/plate-icon-96.png', 'assets/modern-plate-icon-v1-96.png'],
  ['/assets/plate-touch-180.png', 'assets/modern-plate-icon-v1-180.png'],
  ['/isaac.jpg', 'isaac.jpg'],
  ['/brand-modern-plate.png', 'brand-modern-plate.png'],
  ['/brand-sunset-plate.png', 'brand-sunset-plate.png'],
  ['/logo.png', 'logo.png'],
  ['/logo.jpg', 'logo.jpg'],
  ['/logo-header.png', 'logo-header.png'],
  ['/og.png', 'og.png'],
  ['/apple-touch-icon.png', 'apple-touch-icon.png'],
]);

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  const productionHost = ['www.805carguy.com', '805carguy.com'].includes(req.hostname);
  // Keep local and hosted previews out of search results without blocking assets.
  if (!productionHost) res.set('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  if (req.path === '/robots.txt') {
    return res.type('text/plain').send(productionHost
      ? `User-agent: *\nAllow: /\nSitemap: ${canonicalOrigin}/sitemap.xml\n`
      : 'User-agent: *\nDisallow: /\n');
  }

  const canonicalPath = pageAliases.get(req.path);
  if (canonicalPath) return res.redirect(301, canonicalPath + req.url.slice(req.path.length));

  if (['/find-my-car', '/find-my-car.html', '/find-my-car/'].includes(req.path)) {
    return res.redirect(301, '/#inquire');
  }

  const file = publicFiles.get(req.path);
  if (!file) return next();

  // Versioned image names can be retained; documents and app code revalidate on reuse.
  const versionedImage = /^\/assets\/(?:modern-plate-(?:icon-)?v1-|coastal-brighter-v3-|isaac-v2-|og-805carguy-v1)/.test(req.path);
  res.set('Cache-Control', versionedImage ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate');
  if (file === 'site.webmanifest') res.type('application/manifest+json');
  res.sendFile(path.join(__dirname, file), { cacheControl: false }, (error) => {
    if (error) next(error);
  });
});

const notFoundPage = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found — 805CarGuy</title><link rel="icon" type="image/png" sizes="32x32" href="/assets/modern-plate-icon-v1-32.png"><link rel="stylesheet" href="/styles.css"></head><body><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="wordmark wordmark-modern" href="/" aria-label="805CarGuy home"><picture><source type="image/webp" srcset="/assets/modern-plate-v1-400.webp 400w, /assets/modern-plate-v1-800.webp 800w" sizes="(max-width:700px) 216px, 264px"><img src="/assets/modern-plate-v1-800.png" srcset="/assets/modern-plate-v1-400.png 400w, /assets/modern-plate-v1-800.png 800w" sizes="(max-width:700px) 216px, 264px" width="1774" height="887" alt="805CarGuy modern California license plate logo"></picture></a><nav aria-label="Main navigation"><a href="/services">Services</a><a href="/about">Meet Isaac</a><a class="button small" href="/#inquire">Let’s Talk</a></nav></header><main id="main" class="not-found wrap"><p class="eyebrow">Page not found</p><h1>That page isn’t here.</h1><p>The link may be old or mistyped. The useful pages are below.</p><p><a href="/">Home</a> · <a href="/services">Services</a> · <a href="/pricing">Pricing</a> · <a href="/faq">Common questions</a> · <a href="/contact">Contact Isaac</a></p><a class="button" href="/#inquire">Start an inquiry</a></main><footer class="site-footer wrap"><p>Isaac Feldman · San Luis Obispo, California</p><a href="/">Home</a><a href="/services">Services</a><a href="/pricing">Pricing</a><a href="/about">Meet Isaac</a><a href="/faq">FAQ</a><a href="/contact">Contact</a><a href="/privacy">Inquiry privacy</a><a href="/terms">Service information</a></footer></body></html>`;

app.post('/inquiry', express.json({ limit: '32kb' }), async (req, res) => {
  const origin = req.get('origin') || '';
  if (!inquiryOrigins.has(origin) && !/^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin)) {
    return res.status(403).json({ accepted: false, message: 'Inquiries are accepted from the 805CarGuy website only.' });
  }
  if (!withinRateLimit(req.ip)) {
    return res.status(429).json({ accepted: false, message: 'Too many inquiries from this connection. Please email Isaac instead.' });
  }
  const payload = cleanInquiry(req.body);
  if (!payload) return res.status(400).json({ accepted: false, message: 'The inquiry is incomplete.' });
  try {
    const { channel, attempts } = await app.locals.deliverInquiry(payload);
    console.log(JSON.stringify({ event: 'inquiry-delivered', reference: payload.reference, channel, attempts }));
    res.json({ accepted: true, channel });
  } catch (error) {
    // Keep the lead recoverable from the deployment log when every channel is down.
    console.error(JSON.stringify({ event: 'inquiry-undelivered', reference: payload.reference, attempts: error.attempts || [error.message], inquiry: payload }));
    res.status(502).json({ accepted: false, message: 'Delivery is unavailable right now. Please email Isaac directly.' });
  }
});
app.locals.deliverInquiry = deliverInquiry;

app.use((req, res) => {
  res.status(404).type('html').send(notFoundPage);
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large' || error.type === 'charset.unsupported') {
    return res.status(400).json({ accepted: false, message: 'The inquiry could not be read.' });
  }
  const status = error.status === 404 ? 404 : 500;
  res.status(status).type('text').send(status === 404 ? 'Page not found.' : 'Unable to load this page. Please try again.');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`805CarGuy running → http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.cleanInquiry = cleanInquiry;
module.exports.deliverInquiry = deliverInquiry;
module.exports.withinRateLimit = withinRateLimit;
