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
      '/', '/about', '/services', '/pricing', '/terms', '/privacy', '/robots.txt', '/sitemap.xml',
      '/contact', '/faq', '/service-area', '/contact.js', '/assets/og-805carguy-v1.png',
      ...[120, 480, 720].flatMap(size => ['webp', 'jpg'].map(ext => `/assets/isaac-v2-${size}.${ext}`)),
      '/new-car-buying-help', '/used-car-evaluation', '/inquiry-attribution.js',
      '/styles.css', '/intake.js', '/inquiry-delivery.js', '/assets/isaac.jpg',
      '/isaac.jpg', '/logo.png', '/logo.jpg', '/logo-header.png', '/og.png',
      '/apple-touch-icon.png', '/brand-modern-plate.png', '/terms?ref=old-link',
      '/assets/plate-240.png', '/assets/plate-480.png', '/assets/plate-720.png',
      '/assets/plate-icon-96.png', '/assets/plate-touch-180.png',
      '/site.webmanifest', '/assets/modern-plate-icon-v1-32.png', '/assets/modern-plate-icon-v1-96.png',
      '/assets/modern-plate-icon-v1-180.png', '/assets/modern-plate-icon-v1-192.png', '/assets/modern-plate-icon-v1-512.png',
      ...[400, 800, 1200].flatMap(size => ['webp', 'png'].map(ext => `/assets/modern-plate-v1-${size}.${ext}`)),
      ...[640, 960, 1536].flatMap(size => ['webp', 'jpg'].map(ext => `/assets/coastal-brighter-v3-${size}.${ext}`)),
      '/assets/gearshift-600.jpg', '/assets/gearshift-1200.jpg', '/assets/dashboard-original.png',
      '/assets/juan-di-nella-coastal-drive.jpg', '/assets/juan-di-nella-coastal-drive-brighter-v2.png',
    ];
    for (const route of publicRoutes) await check(route, 200);
    for (const [route, target] of [
      ['/index.html', '/'], ['/about.html', '/about'], ['/about/', '/about'],
      ['/services.html', '/services'], ['/services/', '/services'],
      ['/pricing.html', '/pricing'], ['/pricing/', '/pricing'], ['/pricing.html?from=about', '/pricing?from=about'],
      ['/new-car-buying-help.html', '/new-car-buying-help'], ['/new-car-buying-help/', '/new-car-buying-help'],
      ['/used-car-evaluation.html', '/used-car-evaluation'], ['/used-car-evaluation/', '/used-car-evaluation'],
      ['/terms.html', '/terms'], ['/terms/', '/terms'],
      ['/privacy.html', '/privacy'], ['/privacy/', '/privacy'],
      ['/contact.html', '/contact'], ['/contact/', '/contact'],
      ['/faq.html', '/faq'], ['/faq/', '/faq'],
      ['/service-area.html', '/service-area'], ['/service-area/', '/service-area'],
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
      '/IMAGE-PROVENANCE.md', '/assets/gearshift-original.png',
      '/.git/config', '/.env', '/node_modules/express/package.json', '/work/test-routes.cjs',
      '/assets/../server.js', '/assets/%2e%2e/server.js', '/%73erver.js', '/missing',
      '/terms/missing', '/styles.css/missing', '/unknown.html',
    ]) {
      const response = await check(route, 404);
      const notFound = await response.text();
      assert.match(notFound, /Page not found/);
      assert.match(notFound, /href="\/contact"/);
    }
    for (const route of ['/terms', '/privacy', '/pricing', '/styles.css']) {
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
    assert.deepEqual(locations.map(url => new URL(url).pathname).sort(), ['/', '/about', '/contact', '/faq', '/new-car-buying-help', '/pricing', '/privacy', '/service-area', '/services', '/terms', '/used-car-evaluation']);
    for (const url of locations) {
      const page = await check(new URL(url).pathname, 200, { headers: productionHeaders });
      assert.equal(page.headers.get('x-robots-tag'), null);
      const html = await page.text();
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
      assert.ok(html.includes(`rel="canonical" href="${url}"`));
      assert.doesNotMatch(html, /<meta[^>]+name="robots"[^>]+noindex/i);
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.match(html, /rel="icon"[^>]*sizes="96x96"[^>]*href="\/assets\/modern-plate-icon-v1-96\.png"/);
      assert.match(html, /rel="apple-touch-icon"[^>]*href="\/assets\/modern-plate-icon-v1-180\.png"/);
      assert.match(html, /rel="manifest" href="\/site\.webmanifest"/);
      assert.doesNotMatch(html, /brand-sunset-plate|\/assets\/plate-(?:touch|icon)-/);
      const wordmarks = [...html.matchAll(/<a[^>]+class="wordmark wordmark-modern"[^>]*>([\s\S]*?)<\/a>/g)];
      assert.ok(wordmarks.length >= 1, url + ' has a branded home link');
      for (const [, wordmark] of wordmarks) {
        assert.match(wordmark, /src="\/assets\/modern-plate-v1-800\.png"/);
        assert.match(wordmark, /width="1774" height="887"/);
        assert.match(wordmark, /alt="805CarGuy modern California license plate logo"/);
      }
      assert.doesNotMatch(html, /<img[^>]+src="\/assets\/plate-(?:240|480|720)\.png"/);
      assert.doesNotMatch(html, /<img[^>]+src="\/brand-sunset-plate\.png"/);
      for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        const data = JSON.parse(match[1]);
        assert.equal(data['@context'], 'https://schema.org');
      }
    }
    const homepage = await (await check('/', 200)).text();
    assert.match(homepage, /href="\/services"/);
    for (const intent of ['buyStart', 'sell', 'research']) {
      assert.ok(homepage.includes('data-start="' + intent + '"'), 'Homepage offers ' + intent);
    }
    assert.match(homepage, /src="\/assets\/coastal-brighter-v3-1536\.jpg"/);
    for (const [file, budget] of [['gearshift-600.jpg', 70000], ['gearshift-1200.jpg', 200000]]) {
      assert.ok(fs.statSync(path.join(__dirname, '../assets', file)).size < budget, file + ' transfer budget');
    }
    const services = await (await check('/services', 200)).text();
    const pricing = await (await check('/pricing', 200)).text();
    assert.match(services, /one full inspection at Certified Auto Repair[^<]+included in the \$1,000 total/);
    assert.match(homepage, /href="\/pricing"/);
    assert.match(pricing, /Complete local used-car help · \$1,000 total/);
    assert.match(pricing, /\$500 to start and \$500 when you purchase/);
    assert.match(pricing, /Assisted sale · \$350 total/);
    assert.match(pricing, /Paid upfront · one car · 30 days/);
    assert.match(pricing, /Full-service sale · 5%, \$1,000 minimum/);
    assert.match(pricing, /One car · 60 days\. \$350 upfront counts toward the total, with the balance due on sale/);
    assert.match(pricing, /Transport is not included in this package/);
    assert.match(pricing, /\$199 standalone retail inspection price is not an extra 805CarGuy charge/);
    assert.match(pricing, /Scope, fee and payment timing agreed first/);
    assert.match(pricing, /No payment is taken to inquire/);
    // The published service links must all map to a real intake entry point.
    const intake = fs.readFileSync(path.join(__dirname, '../intake.js'), 'utf8');
    const serviceEntries = [...(services + pricing).matchAll(/href="\/(?:\?[^"#]*)?(#inquire-[a-z-]+)"/g)].map(match => match[1]);
    assert.ok(serviceEntries.length >= 4);
    assert.match(services, /https:\/\/www\.yourotto\.com\/services/);
    assert.match(services, /at least three qualifying, seller-confirmed cars unless you choose one sooner/);
    assert.match(services, /extension or refund/);
    assert.match(services, /\$500 to start and \$500 when you purchase/);
    assert.doesNotMatch(services + pricing + homepage + terms + intake, /\$(?:49|750)\b/);
    const evaluation = await (await check('/used-car-evaluation', 200)).text();
    for (const [name, html] of Object.entries({ homepage, services, pricing, terms, evaluation, intake })) {
      assert.match(html, /\$249 total/, name);
      assert.match(html, /(?:one|One) car in (?:SLO city|the city of San Luis Obispo)/, name);
      assert.match(html, /(?:payment|Payment) (?:is )?due when booking/, name);
      assert.match(html, /(?:Dealership|dealership) pickup/, name);
      assert.match(html, /transport to Certified Auto Repair/, name);
      assert.match(html, /full used-car inspection/, name);
      assert.match(html, /(?:written|Written) deal analysis/, name);
      assert.match(html, /(?:Elsewhere|elsewhere) in SLO County or beyond requires a separate quote/, name);
      assert.match(html, /pickup and transport are included, with no extra travel charge/, name);
      assert.doesNotMatch(html, /One agreed quote|No \$249 tier is approved|Pickup and delivery are not included/, name);
    }
    for (const fragment of serviceEntries) assert.ok(intake.includes(`['${fragment}',`), fragment);
    for (const route of ['/new-car-buying-help', '/used-car-evaluation', '/pricing', '/faq', '/contact', '/service-area']) {
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
      ['modern-plate-icon-v1-32.png', 32, 32, 2500],
      ['modern-plate-icon-v1-96.png', 96, 96, 12000],
      ['modern-plate-icon-v1-180.png', 180, 180, 30000],
      ['modern-plate-icon-v1-192.png', 192, 192, 35000],
      ['modern-plate-icon-v1-512.png', 512, 512, 150000],
    ]) {
      const png = fs.readFileSync(path.join(__dirname, '../assets', file));
      assert.equal(png.subarray(1, 4).toString(), 'PNG', file);
      assert.equal(png.readUInt32BE(16), width, file);
      assert.equal(png.readUInt32BE(20), height, file);
      assert.ok(png.length < maxBytes, `${file} is ${png.length} bytes`);
    }
    const manifestResponse = await check('/site.webmanifest', 200);
    assert.match(manifestResponse.headers.get('content-type'), /application\/manifest\+json/);
    const manifest = await manifestResponse.json();
    assert.equal(manifest.start_url, '/');
    assert.equal(manifest.display, 'browser');
    assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512']);
    for (const icon of manifest.icons) await check(icon.src, 200);
    assert.deepEqual(fs.readFileSync(path.join(__dirname, '../apple-touch-icon.png')), fs.readFileSync(path.join(__dirname, '../assets/modern-plate-icon-v1-180.png')));
    for (const asset of ['/assets/coastal-brighter-v3-1536.webp', '/assets/modern-plate-v1-800.webp', '/assets/modern-plate-icon-v1-180.png', '/assets/isaac-v2-480.webp', '/assets/og-805carguy-v1.png']) {
      const response = await check(asset, 200);
      assert.equal(response.headers.get('cache-control'), 'public, max-age=31536000, immutable');
    }
    for (const asset of ['/', '/pricing', '/styles.css', '/intake.js', '/site.webmanifest', '/apple-touch-icon.png']) {
      const response = await check(asset, 200);
      assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate');
    }
    // Cached older HTML/bookmarks requesting the legacy URLs also receive the new plate.
    for (const [legacy, modern] of [['/assets/plate-touch-180.png', 'modern-plate-icon-v1-180.png'], ['/assets/plate-icon-96.png', 'modern-plate-icon-v1-96.png']]) {
      const response = await check(legacy, 200);
      assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate');
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), fs.readFileSync(path.join(__dirname, '../assets', modern)));
    }
    const heroBytes = fs.statSync(path.join(__dirname, '../assets/coastal-brighter-v3-1536.webp')).size;
    const plateBytes = fs.statSync(path.join(__dirname, '../assets/modern-plate-v1-1200.webp')).size;
    assert.ok(heroBytes + plateBytes < 150000, 'largest new hero + logo stay below 150 KB');
    assert.match(homepage, /type="image\/webp" srcset="\/assets\/coastal-brighter/);
    assert.match(homepage, /fetchpriority="high"/);
    assert.match(pricing, /Compare the options/);
    assert.match(pricing, /5% · \$1,000 minimum/);
    for (const match of services.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      await check(match[1] || '/', 200);
    }
    console.log(`${checks} HTTP route checks passed; legacy content and privacy checks passed.`);
  } finally {
    server.closeAllConnections();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
