const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
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
    const response = await fetch(origin + route, { redirect: 'manual', ...options });
    assert.equal(response.status, status, `${options.method || 'GET'} ${route}`);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff', route);
    checks++;
    return response;
  }

  try {
    const publicRoutes = [
      '/', '/index.html', '/terms', '/terms.html', '/privacy', '/privacy.html',
      '/styles.css', '/intake.js', '/inquiry-delivery.js', '/assets/isaac.jpg',
      '/isaac.jpg', '/logo.png', '/logo.jpg', '/logo-header.png', '/og.png',
      '/apple-touch-icon.png', '/terms?ref=old-link',
    ];
    for (const route of publicRoutes) await check(route, 200);
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
    console.log(`${checks} HTTP route checks passed; legacy content and privacy checks passed.`);
  } finally {
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
