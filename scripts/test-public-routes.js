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
      '/new-car-buying-help', '/used-car-evaluation', '/inquiry-attribution.js',
      '/styles.css', '/intake.js', '/inquiry-delivery.js', '/assets/isaac.jpg',
      '/isaac.jpg', '/logo.png', '/logo.jpg', '/logo-header.png', '/og.png',
      '/apple-touch-icon.png', '/terms?ref=old-link',
      '/assets/plate-240.png', '/assets/plate-480.png', '/assets/plate-720.png',
      '/assets/plate-icon-96.png', '/assets/plate-touch-180.png',
    ];
    for (const route of publicRoutes) await check(route, 200);
    for (const [route, target] of [
      ['/index.html', '/'], ['/about.html', '/about'], ['/about/', '/about'],
      ['/services.html', '/services'], ['/services/', '/services'],
      ['/new-car-buying-help.html', '/new-car-buying-help'], ['/new-car-buying-help/', '/new-car-buying-help'],
      ['/used-car-evaluation.html', '/used-car-evaluation'], ['/used-car-evaluation/', '/used-car-evaluation'],
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
    assert.deepEqual(locations.map(url => new URL(url).pathname).sort(), ['/', '/about', '/new-car-buying-help', '/privacy', '/services', '/terms', '/used-car-evaluation']);
    for (const url of locations) {
      const page = await check(new URL(url).pathname, 200, { headers: productionHeaders });
      assert.equal(page.headers.get('x-robots-tag'), null);
      const html = await page.text();
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
      assert.ok(html.includes(`rel="canonical" href="${url}"`));
      assert.doesNotMatch(html, /<meta[^>]+name="robots"[^>]+noindex/i);
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.match(html, /rel="icon"[^>]*sizes="96x96"[^>]*href="\/assets\/plate-icon-96\.png"/);
      assert.match(html, /src="\/assets\/plate-240\.png"[^>]+srcset="\/assets\/plate-480\.png 2x, \/assets\/plate-720\.png 3x"/);
      assert.doesNotMatch(html, /<img[^>]+src="\/brand-sunset-plate\.png"/);
      for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        const data = JSON.parse(match[1]);
        assert.equal(data['@context'], 'https://schema.org');
      }
    }
    const homepage = await (await check('/', 200)).text();
    assert.match(homepage, /href="\/services"/);
    const services = await (await check('/services', 200)).text();
    assert.match(services, /one full inspection at Certified Auto Repair[^<]+included in the \$1,000 total/);
    // The published service links must all map to a real intake entry point.
    const intake = fs.readFileSync(path.join(__dirname, '../intake.js'), 'utf8');
    const serviceEntries = [...services.matchAll(/href="\/(?:\?[^"#]*)?(#inquire-[a-z-]+)"/g)].map(match => match[1]);
    assert.ok(serviceEntries.length >= 7);
    for (const fragment of serviceEntries) assert.ok(intake.includes(`['${fragment}',`), fragment);
    for (const route of ['/new-car-buying-help', '/used-car-evaluation']) {
      const html = await (await check(route, 200)).text();
      for (const link of html.matchAll(/href="(\/[^\"]*)"/g)) {
        const url = new URL(link[1], origin);
        await check(url.pathname + url.search, 200);
        if (url.hash.startsWith('#inquire')) assert.ok(intake.includes(`['${url.hash}',`), `${route} -> ${url.hash}`);
      }
      assert.match(html, /inquiry-attribution\.js/);
    }
    // Confirm real PNG dimensions and a bounded transfer budget, not just filenames.
    for (const [file, width, height, maxBytes] of [
      ['plate-240.png', 240, 120, 50000], ['plate-480.png', 480, 240, 160000],
      ['plate-720.png', 720, 360, 330000], ['plate-icon-96.png', 96, 96, 15000],
      ['plate-touch-180.png', 180, 180, 35000],
    ]) {
      const png = fs.readFileSync(path.join(__dirname, '../assets', file));
      assert.equal(png.subarray(1, 4).toString(), 'PNG', file);
      assert.equal(png.readUInt32BE(16), width, file);
      assert.equal(png.readUInt32BE(20), height, file);
      assert.ok(png.length < maxBytes, `${file} is ${png.length} bytes`);
    }
    for (const match of services.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      await check(match[1] || '/', 200);
    }
    console.log(`${checks} HTTP route checks passed; legacy content and privacy checks passed.`);
  } finally {
    server.closeAllConnections();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
