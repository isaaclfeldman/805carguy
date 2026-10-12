'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const delivery = require('../inquiry-delivery');
const source = fs.readFileSync(path.join(__dirname, '../intake.js'), 'utf8');

// Execute the complete served intake script. This DOM supports its real controls;
// no browser, network request, provider submission or source-code extraction occurs.
function fixture(hash = '#inquire') {
  let document;
  class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.listeners = {}; this.attributes = {}; this.style = {}; this.dataset = {}; this.value = ''; this._text = ''; this.disabled = false; }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this._text = ''; this.children = children; }
    addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
    async dispatch(name) { for (const callback of this.listeners[name] || []) await callback({ preventDefault() {} }); }
    async click() { if (!this.disabled) await this.dispatch('click'); }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    removeAttribute(name) { delete this.attributes[name]; }
    focus() { document.activeElement = this; }
    showModal() { this.open = true; }
    close() { this.open = false; void this.dispatch('close'); }
    setCustomValidity(value) { this.validationMessage = value; }
    reportValidity() { return !this.validationMessage; }
    querySelectorAll(selector) {
      const matches = node => {
        if (selector.startsWith('#')) return node.id === selector.slice(1);
        if (selector === '[data-start]') return Boolean(node.dataset.start);
        if (selector === '[data-start="all"]') return node.dataset.start === 'all';
        if (selector === 'label[for="reply"]') return node.tagName === 'label' && node.htmlFor === 'reply';
        return node.tagName === selector;
      };
      const descendants = node => node.children.flatMap(child => [child, ...descendants(child)]);
      return descendants(this).filter(matches);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  }
  const body = new Element('body');
  document = {
    body, activeElement: null,
    createElement: tag => new Element(tag),
    createTextNode: text => Object.assign(new Element('#text'), { textContent: text }),
    querySelector: selector => body.querySelector(selector),
    querySelectorAll: selector => body.querySelectorAll(selector)
  };
  const add = (tag, id, parent = body) => { const node = new Element(tag); node.id = id; parent.append(node); return node; };
  const dialog = add('dialog', 'intake');
  add('div', 'flow-content', dialog);
  add('button', 'close-flow', dialog);
  add('div', 'preview-banner');
  const trigger = add('button', 'entry'); trigger.dataset.start = 'all';
  const location = { protocol: 'http:', hostname: '127.0.0.1', hash };
  const calls = [];
  const window = { location, addEventListener() {}, InquiryDelivery: {
    ...delivery,
    submit: async payload => { calls.push(payload); throw new Error('No provider submission is allowed in this test'); }
  }};
  vm.runInNewContext(source, { window, document, crypto, fetch() { throw new Error('Network is forbidden'); } }, { filename: 'intake.js', timeout: 1000 });
  const content = document.querySelector('#flow-content');
  return {
    document, dialog, calls, location,
    get text() { return content.textContent; },
    get title() { return document.querySelector('#flow-title').textContent; },
    links() { return content.querySelectorAll('a'); },
    async click(prefix) {
      const matches = content.querySelectorAll('button').filter(node => node.textContent.startsWith(prefix));
      assert.equal(matches.length, 1, `one button starting with ${prefix}`);
      await matches[0].click();
    },
    async fill(id, value) {
      const element = document.querySelector('#' + id); assert.ok(element, id);
      element.value = value;
      await content.querySelector('form').dispatch('input');
    },
    async review() { await content.querySelector('form').dispatch('submit'); }
  };
}

test('legacy remote deep links offer exact OttO destinations without redirecting or sending', () => {
  const entries = [
    ['#inquire-choose', '#inquire-choose'], ['#inquire-search', '#inquire-search'],
    ['#inquire-new-review', '#inquire-evaluate'], ['#inquire-used-review', '#inquire-evaluate'],
    ['#inquire-second-opinion', '#inquire-evaluate'], ['#inquire-new-buy', null], ['#inquire-remote', null]
  ];
  for (const [hash, target] of entries) {
    const ui = fixture(hash);
    assert.equal(ui.title, 'Nationwide help is with OttO.');
    assert.equal(ui.links()[0].href, target ? 'https://www.yourotto.com/expert-help' + target : 'https://www.yourotto.com/services');
    assert.equal(ui.location.hash, hash);
    assert.match(ui.text, /No inquiry details are sent or transferred/);
    assert.equal(ui.document.querySelectorAll('form').length, 0);
    assert.equal(ui.calls.length, 0);
  }
});

test('legacy evaluation allows a local assessment or explicit remote handoff with working Back', async () => {
  const ui = fixture('#inquire-evaluate');
  assert.equal(ui.title, 'What would you like checked?');
  await ui.click('Listings or written offers remotely');
  assert.equal(ui.links()[0].href, 'https://www.yourotto.com/expert-help#inquire-evaluate');
  await ui.click('← Back');
  assert.equal(ui.title, 'What would you like checked?');
  await ui.click('A local car and the deal');
  assert.match(ui.text, /\$249 total/);
  assert.match(ui.text, /One car in SLO city/);
  assert.match(ui.text, /payment due when booking/);
  assert.match(ui.text, /pickup and transport are included, with no extra travel charge/);
  assert.match(ui.text, /Elsewhere in SLO County or beyond requires a separate quote/);
  assert.equal(ui.calls.length, 0);
});

test('complete local entry requires shop eligibility and preserves inspection and payment terms', async () => {
  const ui = fixture('#inquire-complete');
  assert.equal(ui.title, 'Could the car come to San Luis Obispo?');
  assert.match(ui.text, /Transport is not included/);
  await ui.click('Yes, that should work');
  assert.match(ui.text, /Complete local used-car purchase/);
  assert.match(ui.text, /One full used-car inspection at Certified Auto Repair/);
  assert.match(ui.text, /included in the \$1,000 price/);
  assert.match(ui.text, /at least three qualifying, seller-confirmed candidates in the agreed 30-day search/);
  assert.match(ui.text, /extension or refund/);
  assert.match(ui.text, /\$500 to start and \$500 when you purchase/);
  assert.match(ui.text, /Rejecting a car after inspection does not by itself trigger the final payment/);
  assert.equal(ui.calls.length, 0);
});

test('nonlocal car goes to OttO choice; uncertain location remains a local inquiry', async () => {
  const outside = fixture('#inquire-complete');
  await outside.click('No, the car is elsewhere');
  assert.equal(outside.title, 'Nationwide help is with OttO.');
  assert.equal(outside.links()[0].href, 'https://www.yourotto.com/services');
  const unknown = fixture('#inquire-complete');
  await unknown.click('Not sure yet');
  assert.equal(unknown.title, 'When would you like help?');
  await unknown.click('As soon as practical');
  assert.ok(unknown.document.querySelector('#vehicle-location'));
  assert.equal(outside.calls.length + unknown.calls.length, 0);
});

test('all four local offers retain direct entries and existing selling prices and periods', async () => {
  for (const [hash, title, expected] of [
    ['#inquire-local-check', 'Check the car and the deal.', /\$249 totalOne car in SLO city/],
    ['#inquire-assisted-sale', 'A stronger listing. Less legwork.', /\$350One car · 30 days · paid upfront/],
    ['#inquire-full-sale', 'Hand over the selling details.', /5%Of sale price · \$1,000 minimum · 60 days/]
  ]) {
    const ui = fixture(hash);
    assert.equal(ui.title, title); assert.match(ui.text, expected);
    await ui.click('Ask about this service');
    assert.equal(ui.title, 'When would you like help?');
    assert.equal(ui.calls.length, 0);
  }
  const legacyFound = fixture('#inquire-found-buy');
  assert.equal(legacyFound.title, 'Could the car come to San Luis Obispo?');
});

test('complete local draft reaches review with its price and details while preview sending stays disabled', async () => {
  const ui = fixture('#inquire-complete');
  await ui.click('Yes, that should work');
  await ui.click('Ask about this service');
  await ui.click('Within a month');
  await ui.fill('context', 'Synthetic no-send draft: review the local car.');
  await ui.fill('location', '93401');
  await ui.fill('vehicle-location', 'San Luis Obispo');
  await ui.fill('name', 'Synthetic Preview');
  await ui.fill('reply', 'sample@example.invalid');
  await ui.review();
  assert.equal(ui.title, 'Your inquiry, at a glance.');
  assert.match(ui.text, /From choosing to the keys. — \$1,000/);
  assert.match(ui.text, /Complete local used-car purchase/);
  assert.match(ui.text, /Synthetic no-send draft/);
  assert.match(ui.text, /sample@example.invalid/);
  assert.match(ui.text, /Release preview: sending is disabled. Your inquiry has not been sent./);
  const send = ui.document.querySelector('#flow-content').querySelectorAll('button').find(button => button.textContent.startsWith('Send my inquiry'));
  assert.equal(send.disabled, true);
  await send.click();
  assert.equal(ui.calls.length, 0);
});


test('assessment scope and booking price remain visible in review for local and out-of-city inquiries', async () => {
  for (const location of ['San Luis Obispo', 'Paso Robles', 'Not known yet']) {
    const ui = fixture('#inquire-local-check');
    await ui.click('Ask about this service');
    await ui.click('Within a month');
    await ui.fill('vehicle-location', location);
    await ui.fill('name', 'Synthetic Preview');
    await ui.fill('reply', 'sample@example.invalid');
    await ui.review();
    assert.equal(ui.title, 'Your inquiry, at a glance.');
    assert.match(ui.text, /Check the car and the deal. — \$249 total/);
    assert.match(ui.text, /One car in SLO city/);
    assert.match(ui.text, /Payment is due when booking/);
    assert.match(ui.text, /Dealership pickup, a test drive, and transport to Certified Auto Repair/);
    assert.match(ui.text, /One full used-car inspection/);
    assert.match(ui.text, /Written deal analysis/);
    assert.match(ui.text, /\$199 standalone inspection price is not added to the \$249 total/);
    assert.match(ui.text, /Elsewhere in SLO County or beyond requires a separate quote/);
    assert.match(ui.text, /Finding other cars, negotiating a purchase, repairs, and additional visits are separate/);
    assert.ok(ui.text.includes(location));
    assert.match(ui.text, /does not book the service or take payment/);
    const send = ui.document.querySelector('#flow-content').querySelectorAll('button').find(button => button.textContent.startsWith('Send my inquiry'));
    assert.equal(send.disabled, true);
    assert.equal(ui.calls.length, 0);
  }
});
