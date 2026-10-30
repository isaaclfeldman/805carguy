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
function fixture(hash = '#inquire', { production = false } = {}) {
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
  const triggers = {};
  for (const step of ['all', 'buyStart', 'newCar', 'usedCar', 'sell', 'research', 'openToEither']) {
    triggers[step] = add('button', 'entry-' + step);
    triggers[step].dataset.start = step;
  }
  const location = { protocol: production ? 'https:' : 'http:', hostname: production ? 'www.805carguy.com' : '127.0.0.1', hash };
  const calls = [];
  const windowListeners = {};
  const window = { location, addEventListener(name, callback) { windowListeners[name] = callback; }, InquiryDelivery: {
    ...delivery,
    // Production-host behavior is exercised only against this in-memory stub.
    submit: async payload => { calls.push(payload); return { accepted: true }; }
  }};
  vm.runInNewContext(source, { window, document, crypto, fetch() { throw new Error('Network is forbidden'); } }, { filename: 'intake.js', timeout: 1000 });
  const content = document.querySelector('#flow-content');
  return {
    document, dialog, calls, location,
    async open(step = 'all') { await triggers[step].click(); },
    async close() { await document.querySelector('#close-flow').click(); },
    async changeHash(hash) { location.hash = hash; await windowListeners.hashchange(); },
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
      await element.dispatch('input');
      await content.querySelector('form').dispatch('input');
    },
    async select(id, value) {
      const element = document.querySelector('#' + id); assert.ok(element, id);
      element.value = value;
      await element.dispatch('change');
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


async function finishDraft(ui, context = 'Synthetic draft, never sent to a provider.') {
  await ui.click('Within a month');
  await ui.fill('context', context);
  await ui.fill('name', 'Synthetic Preview');
  await ui.fill('reply', 'sample@example.invalid');
  await ui.review();
}

test('starting choices are Buy, Sell and Research, with a secondary explicit OttO handoff', async () => {
  const ui = fixture();
  const choices = ui.document.querySelector('#flow-content').querySelectorAll('button').filter(button => button.className === 'flow-option');
  assert.deepEqual(choices.map(button => button.children[0].textContent), ['Buy', 'Sell', 'Research']);
  await ui.click('Explore remote help with OttO');
  assert.equal(ui.title, 'Nationwide help is with OttO.');
  assert.equal(ui.links()[0].href, 'https://www.yourotto.com/services');
  assert.equal(ui.calls.length, 0);
});

test('new-car entry retains conversation scope and explicit intent through review and mocked delivery', async () => {
  const ui = fixture('#inquire-new-car', { production: true });
  assert.equal(ui.title, 'Let’s talk about your new car.');
  assert.match(ui.text, /Scope and fee agreed first/);
  assert.match(ui.text, /Help choosing and comparing models/);
  assert.match(ui.text, /Help understanding a dealer quote/);
  assert.match(ui.text, /agree on the scope, fee and payment timing before work begins/);
  assert.doesNotMatch(ui.text, /\$249|\$1,000|guarantee|financing/);
  await ui.click('Ask about this service');
  await finishDraft(ui);
  assert.match(ui.text, /Looking toBuy new/);
  assert.match(ui.text, /New-car guidance · start with a conversation/);
  assert.match(ui.text, /Scope and fee agreed first/);
  await ui.click('Send my inquiry');
  assert.equal(ui.calls.length, 1);
  assert.equal(ui.calls[0].intent, 'Buy new');
  assert.equal(ui.calls[0].purchase_preference, 'New');
  assert.equal(ui.calls[0].service, 'Let’s talk about your new car.');
  assert.equal(ui.calls[0].displayed_price, 'Scope and fee agreed first');
  assert.equal(ui.calls[0].scope, 'New-car guidance · start with a conversation');
});

test('used-car entry preserves each package and eligibility gate and carries its intent', async () => {
  for (const [choice, expectedTitle, expectedPrice] of [
    ['Check a car I found', 'Check the car and the deal.', '$249 total'],
    ['Help with the whole purchase', 'From choosing to the keys.', '$1,000'],
    ['Not sure yet', 'Talk with Isaac.', 'Scope agreed first']
  ]) {
    const ui = fixture('#inquire-used-car', { production: true });
    assert.equal(ui.title, 'Where are you with your used-car search?');
    await ui.click(choice);
    if (choice === 'Help with the whole purchase') {
      assert.equal(ui.title, 'Could the car come to San Luis Obispo?');
      await ui.click('Yes, that should work');
    }
    if (choice !== 'Not sure yet') await ui.click('Ask about this service');
    await finishDraft(ui);
    assert.match(ui.text, /Looking toBuy used/);
    await ui.click('Send my inquiry');
    assert.equal(ui.calls[0].intent, 'Buy used');
    assert.equal(ui.calls[0].purchase_preference, 'Used');
    assert.equal(ui.calls[0].service, expectedTitle);
    assert.equal(ui.calls[0].displayed_price, expectedPrice);
  }
});

test('selling primary entry and direct offers retain Sell intent through mocked delivery', async () => {
  for (const hash of ['#inquire-sell', '#inquire-assisted-sale', '#inquire-full-sale']) {
    const ui = fixture(hash, { production: true });
    if (hash === '#inquire-sell') await ui.click('Get it listed and screen buyers');
    await ui.click('Ask about this service');
    await finishDraft(ui);
    assert.match(ui.text, /Looking toSell/);
    await ui.click('Send my inquiry');
    assert.equal(ui.calls[0].intent, 'Sell');
    assert.ok(['$350', '5%'].includes(ui.calls[0].displayed_price));
  }
});

test('Back preserves contact draft while replacing new-car intent with used-car or general intent', async () => {
  const ui = fixture('#inquire', { production: true });
  await ui.click('Buy');
  await ui.click('New');
  await ui.click('Ask about this service');
  await ui.click('Within a month');
  await ui.fill('name', 'Draft Name');
  await ui.fill('reply', 'draft@example.invalid');
  await ui.fill('context', 'Draft context');
  for (let i = 0; i < 4; i++) await ui.click('← Back');
  assert.equal(ui.title, 'How can I help?');
  await ui.click('Buy');
  await ui.click('Used');
  await ui.click('Not sure yet');
  await ui.click('Within a month');
  assert.equal(ui.document.querySelector('#name').value, 'Draft Name');
  assert.equal(ui.document.querySelector('#context').value, 'Draft context');
  await ui.review();
  assert.match(ui.text, /Looking toBuy used/);
  assert.doesNotMatch(ui.text, /Buy new|New-car guidance/);
  for (let i = 0; i < 5; i++) await ui.click('← Back');
  assert.equal(ui.title, 'How can I help?');
  await ui.click('I’d rather just tell you');
  await finishDraft(ui);
  assert.doesNotMatch(ui.text, /Looking to|Car preference|Buy new|Buy used|New-car guidance/);
  await ui.click('Send my inquiry');
  assert.equal(ui.calls[0].intent, '');
  assert.equal(ui.calls[0].purchase_preference, '');
});

test('Buy chooser carries New, Used or Open to Either through review and mocked delivery', async () => {
  for (const [preference, intent] of [['New', 'Buy new'], ['Used', 'Buy used'], ['Open to Either', 'Buy']]) {
    const ui = fixture('#inquire-buy-start', { production: true });
    assert.equal(ui.title, 'New, used, or open to either?');
    const options = ui.document.querySelector('#flow-content').querySelectorAll('button').filter(button => button.className === 'flow-option');
    assert.deepEqual(options.map(button => button.children[0].textContent), ['New', 'Used', 'Open to Either']);
    await ui.click(preference);
    if (preference === 'New') await ui.click('Ask about this service');
    else if (preference === 'Used') await ui.click('Not sure yet');
    else {
      assert.equal(ui.title, 'You can stay open to either.');
      assert.match(ui.text, /don’t need to choose new or used/);
      assert.match(ui.text, /scope, fee and payment timing before any work begins/);
      assert.doesNotMatch(ui.text, /\$249|\$1,000|guarantee/);
      await ui.click('Continue');
    }
    await finishDraft(ui);
    assert.ok(ui.text.includes('Looking to' + intent));
    assert.ok(ui.text.includes('Car preference' + preference));
    if (preference === 'Open to Either') assert.match(ui.text, /Buying · open to new or used/);
    await ui.click('Send my inquiry');
    assert.equal(ui.calls.length, 1);
    assert.equal(ui.calls[0].intent, intent);
    assert.equal(ui.calls[0].purchase_preference, preference);
  }
});

test('Research stays an unpriced conversation through review and mocked delivery', async () => {
  const ui = fixture('#inquire-research', { production: true });
  assert.equal(ui.title, 'What are you researching?');
  assert.match(ui.text, /still gathering information/);
  assert.match(ui.text, /agree on the scope, fee and payment timing before any work begins/);
  assert.match(ui.text, /does not book a service or take payment/);
  assert.doesNotMatch(ui.text, /\$\d|guarantee|report|30-day/);
  await ui.click('Continue');
  await finishDraft(ui, 'Compare EV and hybrid ownership.');
  assert.match(ui.text, /Looking toResearch/);
  assert.match(ui.text, /Research inquiry · start with a conversation/);
  assert.match(ui.text, /Scope and fee agreed first/);
  assert.doesNotMatch(ui.text, /Car preference|Buy new|Buy used|Open to Either/);
  await ui.click('Send my inquiry');
  assert.equal(ui.calls.length, 1);
  assert.equal(ui.calls[0].intent, 'Research');
  assert.equal(ui.calls[0].purchase_preference, '');
  assert.equal(ui.calls[0].message, 'Compare EV and hybrid ownership.');
});

test('Back can replace Either with Used while keeping contact draft, then Research clears purchase selections', async () => {
  const ui = fixture('#inquire', { production: true });
  await ui.click('Buy');
  await ui.click('Open to Either');
  await ui.click('Continue');
  await ui.click('Within a month');
  await ui.fill('name', 'Still exploring');
  await ui.fill('reply', 'draft@example.invalid');
  await ui.fill('context', 'Keep my priorities while I change direction.');
  for (let i = 0; i < 3; i++) await ui.click('← Back');
  assert.equal(ui.title, 'New, used, or open to either?');
  await ui.click('Used');
  await ui.click('Not sure yet');
  await ui.click('Within a month');
  assert.equal(ui.document.querySelector('#name').value, 'Still exploring');
  await ui.review();
  assert.match(ui.text, /Car preferenceUsed/);
  assert.doesNotMatch(ui.text, /Open to Either|open to new or used/);
  for (let i = 0; i < 5; i++) await ui.click('← Back');
  assert.equal(ui.title, 'How can I help?');
  await ui.click('Research');
  await ui.click('Continue');
  await ui.click('Within a month');
  assert.equal(ui.document.querySelector('#context').value, 'Keep my priorities while I change direction.');
  await ui.review();
  assert.match(ui.text, /Looking toResearch/);
  assert.doesNotMatch(ui.text, /Car preference|Buy used|Open to Either/);
  await ui.click('Send my inquiry');
  assert.equal(ui.calls[0].intent, 'Research');
  assert.equal(ui.calls[0].purchase_preference, '');
});

test('close and reopen reset Research and Either drafts; legacy Buy location chooser remains intact', async () => {
  const ui = fixture('#inquire-open-to-either');
  await ui.click('Continue');
  await finishDraft(ui, 'Old either draft');
  await ui.close();
  await ui.open('research');
  assert.equal(ui.title, 'What are you researching?');
  await ui.click('Continue');
  await ui.click('Within a month');
  assert.equal(ui.document.querySelector('#name').value, '');
  assert.equal(ui.document.querySelector('#context').value, '');
  await ui.close();
  await ui.open('buyStart');
  assert.equal(ui.title, 'New, used, or open to either?');
  await ui.close();
  await ui.changeHash('#inquire-buy');
  assert.equal(ui.title, 'Where is the help needed?');
  await ui.click('Remote guidance or search');
  assert.equal(ui.links()[0].href, 'https://www.yourotto.com/services');
  assert.equal(ui.calls.length, 0);
});

test('reset and close/reopen do not reuse prior route intent or contact information', async () => {
  const ui = fixture('#inquire-new-car');
  await ui.click('← See all starting points');
  assert.equal(ui.title, 'How can I help?');
  await ui.click('Sell');
  await ui.click('Manage the sale with me');
  await ui.click('Ask about this service');
  await finishDraft(ui, 'Old selling draft');
  assert.match(ui.text, /Looking toSell/);
  await ui.close();
  assert.equal(ui.dialog.open, false);
  assert.equal(ui.document.body.style.overflow, '');
  await ui.open('newCar');
  assert.equal(ui.title, 'Let’s talk about your new car.');
  await ui.click('Ask about this service');
  await ui.click('Within a month');
  assert.equal(ui.document.querySelector('#name').value, '');
  assert.equal(ui.document.querySelector('#context').value, '');
  await ui.fill('name', 'Fresh draft');
  await ui.fill('reply', 'fresh@example.invalid');
  await ui.review();
  assert.match(ui.text, /Looking toBuy new/);
  assert.doesNotMatch(ui.text, /Old selling draft|Looking toSell/);
  await ui.click('Send my inquiry');
  assert.equal(ui.calls.length, 0, 'preview send stays disabled');
  await ui.close();
  await ui.changeHash('#inquire-used-car');
  assert.equal(ui.title, 'Where are you with your used-car search?');
  await ui.close();
  await ui.open('sell');
  assert.equal(ui.title, 'How much of the sale should I handle?');
  await ui.close();
  await ui.open('all');
  assert.equal(ui.title, 'How can I help?');
});

test('switching a numeric email to Text or Call blocks review without losing the draft', async () => {
  for (const method of ['Text me', 'Call me']) {
    const ui = fixture('#inquire-general', { production: true });
    await ui.click('Within a month');
    await ui.fill('name', 'Synthetic contact');
    await ui.fill('context', 'Keep my question while I correct my contact.');
    await ui.fill('reply', 'buyer1234567@example.invalid');
    await ui.select('contact-method', method);
    await ui.review();
    assert.equal(ui.title, 'Tell me what you need.');
    assert.equal(ui.document.querySelector('#reply').value, 'buyer1234567@example.invalid');
    assert.equal(ui.document.querySelector('#reply').validationMessage, 'Please enter a phone number I can reach you on.');
    assert.equal(ui.document.querySelector('#context').value, 'Keep my question while I correct my contact.');
    assert.equal(ui.calls.length, 0);
    await ui.fill('reply', '+44 20 7946 0958 ext. 12');
    assert.equal(ui.document.querySelector('#reply').validationMessage, '');
    await ui.review();
    assert.equal(ui.title, 'Your inquiry, at a glance.');
    await ui.click('← Back');
    assert.equal(ui.document.querySelector('#reply').value, '+44 20 7946 0958 ext. 12');
    assert.equal(ui.document.querySelector('#contact-method').value, method);
    assert.equal(ui.document.querySelector('#context').value, 'Keep my question while I correct my contact.');
    await ui.review();
    await ui.click('Send my inquiry');
    assert.equal(ui.calls.length, 1, 'Only the corrected contact reaches the memory-only provider');
    assert.equal(ui.calls[0].phone, '+44 20 7946 0958 ext. 12');
    assert.equal(ui.calls[0].contact_preference, method);
  }
});

test('returning to Email clears the phone error and retains the entered email', async () => {
  const ui = fixture('#inquire-general', { production: true });
  await ui.click('Within a month');
  await ui.fill('name', 'Synthetic contact');
  await ui.fill('reply', 'buyer1234567@example.invalid');
  await ui.select('contact-method', 'Text me');
  await ui.review();
  assert.equal(ui.title, 'Tell me what you need.');
  await ui.select('contact-method', 'Email me');
  assert.equal(ui.document.querySelector('#reply').validationMessage, '');
  assert.equal(ui.document.querySelector('#reply').value, 'buyer1234567@example.invalid');
  await ui.review();
  await ui.click('Send my inquiry');
  assert.equal(ui.calls.length, 1);
  assert.equal(ui.calls[0].email, 'buyer1234567@example.invalid');
  assert.equal(ui.calls[0].phone, undefined);
});
