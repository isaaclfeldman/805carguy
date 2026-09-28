const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const app = require('../server.js');
const server = app.listen(0, '127.0.0.1');

(async () => {
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let checks = 0;
  async function check(route, status, options = {}) {
    // Consume every response and send a literal Host for virtual-host checks.
    const response = await new Promise((resolve, reject) => {
      const request = http.request(origin + route, { ...options, agent: false }, result => {
        const chunks = [];
        result.on('data', chunk => chunks.push(chunk));
        result.on('end', () => resolve(new Response(Buffer.concat(chunks), {
          status: result.statusCode, headers: result.headers,
        })));
        result.on('error', reject);
      });
      request.setTimeout(5000, () => request.destroy(new Error('Local HTTP check timed out')));
      request.on('error', reject);
      request.end();
    });
    assert.equal(response.status, status, `${options.method || 'GET'} ${route}`);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff', route);
    checks++;
    return response;
  }

  try {
    const publicRoutes = [
      '/', '/about', '/services', '/terms', '/privacy', '/robots.txt', '/sitemap.xml',
      '/styles.css', '/intake.js', '/inquiry-delivery.js', '/assets/isaac.jpg',
      '/isaac.jpg', '/logo.png', '/logo.jpg', '/logo-header.png', '/og.png',
      '/apple-touch-icon.png', '/terms?ref=old-link',
    ];
    for (const route of publicRoutes) await check(route, 200);
    for (const [route, target] of [
      ['/index.html', '/'], ['/about.html', '/about'], ['/about/', '/about'],
      ['/services.html', '/services'], ['/services/', '/services'],
      ['/terms.html', '/terms'], ['/terms/', '/terms'],
      ['/privacy.html', '/privacy'], ['/privacy/', '/privacy'],
      ['/services.html?ref=old-link', '/services?ref=old-link'],
    ]) {
      const response = await check(route, 301);
      assert.equal(response.headers.get('location'), target);
    }
    for (const route of ['/find-my-car', '/find-my-car.html', '/find-my-car/', '/find-my-car?sent=1']) {
      const response = await check(route, 301);
      assert.equal(response.headers.get('location'), '/#inquire');
    }
    for (const route of [
      '/server.js', '/package.json', '/package-lock.json', '/CLAUDE.md', '/README.md',
      '/.git/config', '/.env', '/node_modules/express/package.json', '/work/test-routes.cjs',
      '/assets/../server.js', '/assets/%2e%2e/server.js', '/%73erver.js', '/missing',
      '/terms/missing', '/styles.css/missing', '/unknown.html',
    ]) {
      const response = await check(route, 404);
      assert.match(await response.text(), /Page not found/);
    }
    for (const route of ['/terms', '/privacy', '/styles.css']) {
      const response = await check(route, 200, { method: 'HEAD' });
      assert.equal(await response.text(), '');
    }
    await check('/', 404, { method: 'POST' });
    const terms = await (await check('/terms', 200)).text();
    const privacy = await (await check('/privacy', 200)).text();
    assert.doesNotMatch(terms, /savings guarantee|The Works|The Remote|liability|governing law|CCPA|CPRA/i);
    assert.match(terms, /Service information/);
    assert.match(privacy, /https:\/\/formsubmit.co\/privacy.pdf/);
    assert.match(privacy, /does not keep a database/);
    assert.match(fs.readFileSync(path.join(__dirname, '../find-my-car.html'), 'utf8'), /url=\/#inquire/);

    // Real HTTP crawl checks: discoverable pages, consistent canonicals, and preview isolation.
    const productionHeaders = { Host: 'www.805carguy.com' };
    const robots = await check('/robots.txt', 200, { headers: productionHeaders });
    assert.match(robots.headers.get('content-type'), /text\/plain/);
    assert.equal(robots.headers.get('x-robots-tag'), null);
    assert.match(await robots.text(), /^User-agent: \*\nAllow: \/\nSitemap: https:\/\/www\.805carguy\.com\/sitemap\.xml\n$/);
    const preview = await check('/robots.txt', 200);
    assert.match(await preview.text(), /Disallow: \//);
    assert.match(preview.headers.get('x-robots-tag'), /noindex/);
    const sitemap = await check('/sitemap.xml', 200, { headers: productionHeaders });
    assert.match(sitemap.headers.get('content-type'), /xml/);
    const locations = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
    assert.equal(new Set(locations).size, locations.length);
    assert.deepEqual(locations.map(url => new URL(url).pathname).sort(), ['/', '/about', '/privacy', '/services', '/terms']);
    for (const url of locations) {
      const page = await check(new URL(url).pathname, 200, { headers: productionHeaders });
      assert.equal(page.headers.get('x-robots-tag'), null);
      const html = await page.text();
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
      assert.ok(html.includes(`rel="canonical" href="${url}"`));
      assert.doesNotMatch(html, /<meta[^>]+name="robots"[^>]+noindex/i);
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        const data = JSON.parse(match[1]);
        assert.equal(data['@context'], 'https://schema.org');
      }
    }
    const homepage = await (await check('/', 200)).text();
    assert.match(homepage, /href="\/services"/);
    const services = await (await check('/services', 200)).text();
    assert.match(services, /one full inspection at Certified Auto Repair[^<]+included in the \$1,000 total/);
    for (const match of services.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      await check(match[1] || '/', 200);
    }
    console.log(`${checks} HTTP route checks passed; legacy content and privacy checks passed.`);
  } finally {
    server.closeAllConnections();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
