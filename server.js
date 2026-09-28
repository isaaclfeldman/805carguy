// 805CarGuy — static public pages only. Inquiries go directly to FormSubmit.
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Keep configuration, source notes, and dependency files outside the public site.
const publicFiles = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/terms', 'terms.html'],
  ['/terms.html', 'terms.html'],
  ['/privacy', 'privacy.html'],
  ['/privacy.html', 'privacy.html'],
  ['/styles.css', 'styles.css'],
  ['/intake.js', 'intake.js'],
  ['/inquiry-delivery.js', 'inquiry-delivery.js'],
  ['/assets/isaac.jpg', 'assets/isaac.jpg'],
  ['/isaac.jpg', 'isaac.jpg'],
  ['/brand-modern-plate.png', 'brand-modern-plate.png'],
  ['/logo.png', 'logo.png'],
  ['/logo.jpg', 'logo.jpg'],
  ['/logo-header.png', 'logo-header.png'],
  ['/og.png', 'og.png'],
  ['/apple-touch-icon.png', 'apple-touch-icon.png'],
]);

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  if (['/find-my-car', '/find-my-car.html', '/find-my-car/'].includes(req.path)) {
    return res.redirect(301, '/#inquire');
  }

  const file = publicFiles.get(req.path);
  if (!file) return next();

  res.sendFile(path.join(__dirname, file), (error) => {
    if (error) next(error);
  });
});

app.use((req, res) => {
  res.status(404).type('html').send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found — 805CarGuy</title><link rel="stylesheet" href="/styles.css"><main class="wrap" style="padding-block:64px"><h1>Page not found</h1><p><a href="/">Return to 805CarGuy</a> or <a href="/#inquire">start an inquiry</a>.</p></main></html>');
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status === 404 ? 404 : 500;
  res.status(status).type('text').send(status === 404 ? 'Page not found.' : 'Unable to load this page. Please try again.');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`805CarGuy running → http://localhost:${PORT}`);
  });
}

module.exports = app;
