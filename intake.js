'use strict';

(() => {
  const dialog = document.querySelector('#intake');
  const content = document.querySelector('#flow-content');
  let answers = {};
  let history = [];
  let current = 'start';
  let returnFocus;
  let sending = false;
  let submitted = false;
  let reference;
  const delivery = window.InquiryDelivery;
  const canSend = delivery.isProduction(window.location);
  document.querySelector('#preview-banner').hidden = canSend;

  const packages = {
    inquiry: {
      title: 'Talk with Isaac.', price: 'Scope agreed first', caption: 'General inquiry · no commitment'
    },
    openToEither: {
      title: 'You can stay open to either.', price: 'Scope and fee agreed first', caption: 'Buying · open to new or used', conversation: true,
      intro: 'You don’t need to choose new or used before reaching out. Tell me what matters to you and what you’re considering.',
      boundary: 'We’ll discuss what you need and agree on the scope, fee and payment timing before any work begins.',
      terms: 'Sending this inquiry does not book a service or take payment.'
    },
    research: {
      title: 'What are you researching?', price: 'Scope and fee agreed first', caption: 'Research inquiry · start with a conversation', conversation: true,
      intro: 'Tell me the car question you’re exploring. It’s fine if you’re still gathering information.',
      boundary: 'We’ll discuss what you need and agree on the scope, fee and payment timing before any work begins.',
      terms: 'Sending this inquiry does not book a service or take payment.'
    },
    newCar: {
      title: 'Let’s talk about your new car.', price: 'Scope and fee agreed first', caption: 'New-car guidance · start with a conversation',
      intro: 'Tell me what you’re considering and where you could use a hand.',
      includes: ['Help choosing and comparing models.', 'Help understanding a dealer quote and your options.', 'Help deciding on your next step.'],
      boundary: 'We’ll talk about what you need and agree on the scope, fee and payment timing before work begins.',
      terms: 'Sending this inquiry does not book a service or take payment.'
    },
    localAssessment: {
      title: 'Check the car and the deal.', price: '$249 total', caption: 'One car in SLO city · payment due when booking · elsewhere in SLO County or beyond: separate quote',
      intro: 'For one car in the city of San Luis Obispo, whether you live nearby or are buying from farther away.',
      includes: ['Dealership pickup, a test drive, and transport to Certified Auto Repair in San Luis Obispo.', 'One full used-car inspection at Certified Auto Repair, included in the $249 total.', 'Written deal analysis: the available records, inspection findings, price, material unknowns, and what I recommend next.'],
      boundary: 'Ordinary SLO-city pickup and transport are included, with no extra travel charge. Elsewhere in SLO County or beyond requires a separate quote. We confirm the car’s location, seller permission, access and scheduling before booking. I co-own Certified Auto Repair; a remote review is not required first.',
      terms: 'Payment is due when booking. The shop’s $199 standalone inspection price is not added to the $249 total. Finding other cars, negotiating a purchase, repairs, and additional visits are separate unless expressly included. Sending this inquiry does not book the service or take payment.'
    },
    complete: {
      title: 'From choosing to the keys.', price: '$1,000', caption: 'Complete local used-car purchase',
      intro: 'One service for choosing, finding, checking, and buying your car.',
      includes: ['Help choosing, plus at least three qualifying, seller-confirmed candidates in the agreed 30-day search, unless you choose sooner.', 'Screening, negotiation, and purchase coordination; any agreed personal visit or test drive depends on seller permission, access, travel and scheduling.', 'One full used-car inspection at Certified Auto Repair in San Luis Obispo, included in the $1,000 price. There is no extra $199 inspection charge.'],
      boundary: 'The car must come to the shop, with seller permission and an available appointment. Transport is not included. Any additional inspections are separately priced and approved. If I cannot deliver the agreed search, we agree on an extension or refund under our written agreement.',
      terms: '$500 to start and $500 when you purchase, less applicable prior payments credited once. This covers one purchase. Our written agreement confirms the candidates and deal revisions covered, overall timeframe, cancellation or refund terms, and when the purchase balance is due. Rejecting a car after inspection does not by itself trigger the final payment.'
    },
    assistedSell: {
      title: 'A stronger listing. Less legwork.', price: '$350', caption: 'One car · 30 days · paid upfront',
      intro: 'I help get the car ready to market and screen the initial buyer inquiries.',
      includes: ['Pricing guidance, photos, and a listing.', 'Initial buyer screening and introductions.', 'You handle showings, negotiations, and closing.'],
      boundary: 'The car stays with you. Detailing, repairs, smog, paid advertising, and transport are separate costs approved in advance. A sale is not guaranteed.',
      terms: 'If you upgrade to full service for this same sale, the $350 already paid counts once toward the total.'
    },
    fullSell: {
      title: 'Hand over the selling details.', price: '5%', caption: 'Of sale price · $1,000 minimum · 60 days',
      intro: 'Help managing the sale of one car, from preparation to closing.',
      includes: ['Pricing, photos, listing preparation, and buyer communication.', 'Coordinate and handle showings and negotiation.', 'Coordinate closing when you accept an offer.'],
      boundary: 'The car stays with you by default; drop-off is by arrangement when space is available. Detailing, repairs, smog, paid advertising, and transport are separately approved costs. For a lower-value car, the $350 assisted sale may make more sense if you can handle showings, negotiation, and closing.',
      terms: '$350 upfront, credited once toward the total, with the balance due on sale. The upfront payment covers completed preparation even if the car does not sell. A $10,000 or $20,000 sale has a $1,000 total fee; after the $350 upfront, $650 remains. A $30,000 sale has a $1,500 total fee.'
    },
  };

  const remoteEntries = {
    choose: ['Help choosing a car', 'https://www.yourotto.com/expert-help#inquire-choose'],
    search: ['A nationwide used-car search', 'https://www.yourotto.com/expert-help#inquire-search'],
    searchResult: ['A nationwide used-car search', 'https://www.yourotto.com/expert-help#inquire-search'],
    newBuy: ['Nationwide remote car-buying guidance', 'https://www.yourotto.com/services'],
    newReview: ['A written second opinion', 'https://www.yourotto.com/expert-help#inquire-evaluate'],
    usedReview: ['A written second opinion', 'https://www.yourotto.com/expert-help#inquire-evaluate'],
    evaluateResult: ['A written second opinion', 'https://www.yourotto.com/expert-help#inquire-evaluate'],
    remote: ['Nationwide remote guidance and search', 'https://www.yourotto.com/services']
  };

  const questions = {
    start: { title: 'How can I help?', lede: 'Choose a starting point. We’ll work out the details together.', options: [
      ['Buy', 'New, used, or open to either.', 'buyStart'],
      ['Sell', 'Help with the listing or with managing the sale.', 'sell'],
      ['Research', 'Start with a question, even if you’re not ready to buy or sell.', 'research']
    ]},
    buyStart: { title: 'New, used, or open to either?', lede: 'You don’t need to decide before asking for help.', options: [
      ['New', 'Choosing a model, understanding a dealer quote, or deciding what comes next.', 'newCar'],
      ['Used', 'Check a car you found or get help with the whole purchase.', 'usedCar'],
      ['Open to Either', 'Keep both possibilities open and tell me what matters to you.', 'openToEither']
    ]},
    usedCar: { title: 'Where are you with your used-car search?', options: [
      ['Check a car I found', '$249 total in SLO city: pickup, test drive, transport, full inspection and deal analysis.', 'localAssessment'],
      ['Help with the whole purchase', '$1,000 local used-car service, including one shop inspection.', 'local'],
      ['Not sure yet', 'Let’s talk about what you need and agree on a next step.', 'inquiry']
    ]},
    buy: { title: 'Where is the help needed?', options: [
      ['Complete local used-car help', 'Choosing through purchase, with one SLO shop inspection.', 'local'],
      ['Remote guidance or search', 'Continue with OttO’s nationwide services.', 'remote']
    ]},
    local: { title: 'Could the car come to San Luis Obispo?', lede: 'The $1,000 complete local package includes one inspection at Certified Auto Repair. Seller permission, access, travel and scheduling still need to be confirmed. Transport is not included.', options: [
      ['Yes, that should work', 'Plan around an inspection at the SLO shop.', 'complete'],
      ['No, the car is elsewhere', 'Explore remote guidance through OttO.', 'remote'],
      ['Not sure yet', 'Ask about the location and local arrangements first.', 'inquiry']
    ]},
    sell: { title: 'How much of the sale should I handle?', options: [
      ['Get it listed and screen buyers', '$350 upfront · one car, 30 days. You handle showings, negotiation and closing.', 'assistedSell'],
      ['Manage the sale with me', '5%, $1,000 minimum · one car, 60 days. $350 upfront counts toward the total.', 'fullSell']
    ]},
    evaluate: { title: 'What would you like checked?', options: [
      ['A local car and the deal', '$249 total for one car in SLO city; elsewhere requires a separate quote.', 'localAssessment'],
      ['Listings or written offers remotely', 'Ask OttO about a written second opinion.', 'evaluateResult']
    ]}
  };

  const intents = {
    buyStart: 'Buy', openToEither: 'Buy', research: 'Research',
    newCar: 'Buy new', usedCar: 'Buy used', local: 'Buy used',
    localAssessment: 'Buy used', complete: 'Buy used',
    sell: 'Sell', assistedSell: 'Sell', fullSell: 'Sell'
  };
  const purchasePreferences = {
    newCar: 'New', usedCar: 'Used', local: 'Used',
    localAssessment: 'Used', complete: 'Used', openToEither: 'Open to Either'
  };

  function node(tag, text, className) {
    const item = document.createElement(tag);
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
  }

  function button(text, action, className = 'button') {
    const item = node('button', text, className);
    item.type = 'button';
    item.addEventListener('click', action);
    return item;
  }

  function heading(title, lede) {
    const titleNode = node('h2', title);
    titleNode.id = 'flow-title';
    titleNode.tabIndex = -1;
    content.append(titleNode);
    if (lede) content.append(node('p', lede, 'flow-lede'));
  }

  function go(next, selection = {}) {
    history.push({ step: current, answers: { ...answers } });
    answers = { ...answers, ...selection };
    current = next;
    render();
  }

  function back() {
    const previous = history.pop();
    if (!previous) return;
    // Preserve entered contact details; restore route selections from the previous step.
    const draft = answers.contact;
    answers = { ...previous.answers, contact: draft };
    current = previous.step;
    render();
  }

  function pick(label, next) {
    // Snapshot the previous route before changing it, so Back restores its intent.
    const selection = { [current]: label };
    if (intents[next]) selection.intent = intents[next];
    if (purchasePreferences[next]) selection.purchasePreference = purchasePreferences[next];
    if (next === 'inquiry') {
      go('timing', { ...selection, package: 'inquiry' });
      return;
    }
    if (remoteEntries[next]) {
      go('remoteHandoff', { ...selection, remoteEntry: next });
      return;
    }
    if (!questions[next] && packages[next]) {
      go('result', { ...selection, package: next });
    } else go(next, selection);
  }

  function renderQuestion() {
    const question = questions[current];
    heading(question.title, question.lede);
    const options = node('div', undefined, 'flow-options');
    question.options.forEach(([label, detail, next]) => {
      const option = button('', () => pick(label, next), 'flow-option');
      option.append(node('strong', label), node('small', detail));
      options.append(option);
    });
    content.append(options);
    if (current === 'start') {
      content.append(button('I’d rather just tell you what I need', () => pick('General inquiry', 'inquiry'), 'text-button'));
      content.append(button('Explore remote help with OttO →', () => pick('Remote help with OttO', 'remote'), 'text-button'));
    }
  }

  function renderResult() {
    const offer = packages[answers.package];
    if (offer.conversation) {
      heading(offer.title, offer.intro);
      content.append(node('p', offer.boundary, 'result-boundary'));
      content.append(button('Continue →', () => go('timing')));
      content.append(node('p', offer.terms, 'input-hint'));
      return;
    }
    content.append(node('p', 'Your starting point', 'result-kicker'));
    heading(offer.title, offer.intro);
    content.append(node('p', offer.price, 'result-price'), node('p', offer.caption, 'flow-lede'));
    const includes = node('ul', undefined, 'result-includes');
    offer.includes.forEach(line => includes.append(node('li', line)));
    content.append(includes, node('p', offer.boundary, 'result-boundary'), node('p', offer.terms, 'result-terms'));
    content.append(button('Ask about this service →', () => go('timing')));
    content.append(node('p', 'No payment or commitment to send an inquiry. We’ll confirm what you need before any work begins.', 'input-hint'));
  }

  function renderRemoteHandoff() {
    const [label, url] = remoteEntries[answers.remoteEntry] || remoteEntries.remote;
    heading('Nationwide help is with OttO.', label + ' from the 805CarGuy team.');
    content.append(node('p', '805CarGuy is for local hands-on work. OttO handles remote guidance and search, with the scope and price agreed before work starts.', 'flow-lede'));
    const link = node('a', 'Continue to OttO →', 'button');
    link.href = url;
    content.append(link);
    content.append(node('p', 'This opens OttO. No inquiry details are sent or transferred by this link.', 'input-hint'));
    content.append(button('Ask about local arrangements instead', () => pick('Local arrangements inquiry', 'inquiry'), 'text-button'));
  }

  function renderTiming() {
    heading('When would you like help?', answers.package === 'evaluate' ? 'I’ll confirm that I can meet your deadline before accepting a review.' : 'This helps set a realistic next step.');
    const options = node('div', undefined, 'flow-options');
    const times = answers.package === 'evaluate' ? ['Today, if possible', 'Within a few days', 'No firm deadline'] : ['As soon as practical', 'Within a month', 'Later / just planning'];
    times.forEach(time => options.append(button(time, () => {
      answers.timing = time;
      go('details');
    }, 'flow-option')));
    content.append(options);
  }

  function field(form, { id, label, type = 'text', value = '', required = false, hint, autocomplete }) {
    const labelNode = node('label', label, 'flow-label');
    labelNode.htmlFor = id;
    const input = node(type === 'textarea' ? 'textarea' : 'input', undefined, 'flow-input');
    input.id = id;
    input.name = id;
    if (type !== 'textarea') input.type = type;
    input.value = value;
    input.required = required;
    input.maxLength = type === 'textarea' ? 2500 : 200;
    if (autocomplete) input.autocomplete = autocomplete;
    form.append(labelNode, input);
    if (hint) {
      const hintNode = node('p', hint, 'input-hint');
      hintNode.id = id + '-hint';
      input.setAttribute('aria-describedby', hintNode.id);
      form.append(hintNode);
    }
    return input;
  }

  function renderDetails() {
    heading('Tell me what you need.', 'A few details and a way to reach you. You don’t need to have it all figured out.');
    const form = node('form');
    const saved = answers.contact || {};
    const inputs = {};
    const selling = answers.intent === 'Sell';
    inputs.context = field(form, { id: 'context', label: selling ? 'What are you selling? (optional)' : answers.package === 'evaluate' ? 'The listing, offer, or question (optional)' : 'What should I know? (optional)', type: 'textarea', value: saved.context, hint: selling ? 'Year, make, model, mileage, condition, and anything else useful.' : 'Your priorities, budget, a listing link, or any deadline. “Not sure yet” is fine.' });
    inputs.location = field(form, { id: 'location', label: 'Your city or ZIP code (optional)', value: saved.location, autocomplete: 'address-level2' });
    inputs.vehicleLocation = field(form, { id: 'vehicle-location', label: 'Where is the car? (optional)', value: saved.vehicleLocation, hint: 'City or ZIP code, if known. You can live elsewhere and ask about a car near San Luis Obispo.' });
    inputs.heardAbout = field(form, { id: 'heard-about', label: 'How did you hear about me? (optional)', value: saved.heardAbout, hint: 'A search, a person, OttO, social media, or somewhere else.' });
    inputs.name = field(form, { id: 'name', label: 'Your name', value: saved.name, required: true, autocomplete: 'name' });
    const methodLabel = node('label', 'How should I reach you?', 'flow-label');
    methodLabel.htmlFor = 'contact-method';
    inputs.method = node('select', undefined, 'flow-input');
    inputs.method.id = 'contact-method';
    inputs.method.name = 'contact-method';
    ['Email me', 'Text me', 'Call me'].forEach(method => {
      const option = node('option', method);
      option.value = method;
      inputs.method.append(option);
    });
    inputs.method.value = saved.method || 'Email me';
    form.append(methodLabel, inputs.method);
    inputs.reply = field(form, { id: 'reply', label: 'Email', type: 'text', value: saved.reply, required: true, hint: 'Isaac will use this to reply about your inquiry. Please don’t include payment details or sensitive documents.' });
    const honey = node('div', undefined, 'form-honey');
    honey.setAttribute('aria-hidden', 'true');
    inputs.website = field(honey, { id: 'website', label: 'Leave this field empty', value: saved.website });
    inputs.website.tabIndex = -1;
    inputs.website.autocomplete = 'off';
    form.append(honey);
    const updateReply = () => {
      const useEmail = inputs.method.value === 'Email me';
      inputs.reply.type = useEmail ? 'email' : 'tel';
      inputs.reply.autocomplete = useEmail ? 'email' : 'tel';
      inputs.reply.setCustomValidity('');
      form.querySelector('label[for="reply"]').textContent = useEmail ? 'Email' : 'Phone number';
    };
    updateReply();
    const save = () => { answers.contact = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value.trim()])); };
    form.addEventListener('input', save);
    inputs.method.addEventListener('change', () => { updateReply(); save(); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (!inputs.name.value.trim()) {
        inputs.name.setCustomValidity('Please enter a name.');
        inputs.name.reportValidity();
        return;
      }
      if (inputs.method.value !== 'Email me' && inputs.reply.value.replace(/\D/g, '').length < 7) {
        inputs.reply.setCustomValidity('Please enter a phone number I can reach you on.');
        inputs.reply.reportValidity();
        return;
      }
      save();
      go('summary');
    });
    inputs.name.addEventListener('input', () => inputs.name.setCustomValidity(''));
    inputs.reply.addEventListener('input', () => inputs.reply.setCustomValidity(''));
    const submit = node('button', 'Review my inquiry →', 'button');
    submit.type = 'submit';
    form.append(submit);
    content.append(form);
  }

  function renderSummary() {
    const offer = packages[answers.package];
    heading('Your inquiry, at a glance.', 'Asking about a service does not book it or commit you to paying.');
    const list = node('ul', undefined, 'review-list');
    const rows = [
      ['Looking to', answers.intent],
      ['Car preference', answers.purchasePreference],
      ['Interested in', offer.title + ' — ' + offer.price],
      ['Scope and pricing', offer.caption],
      ['Included', offer.includes?.join(' ')],
      ['Arrangements and extras', offer.boundary],
      ['Payment and terms', offer.terms],
      ['Timing', answers.timing],
      ['Review type', answers.reviewType],
      ['Details', answers.contact.context],
      ['Your location', answers.contact.location],
      ['Vehicle location', answers.contact.vehicleLocation],
      ['How you found me', answers.contact.heardAbout],
      ['Name', answers.contact.name],
      ['Preferred reply', answers.contact.method],
      [answers.contact.method === 'Email me' ? 'Email' : 'Phone', answers.contact.reply]
    ];
    rows.filter(([, value]) => value).forEach(([label, value]) => {
      const li = node('li');
      li.append(node('span', label), document.createTextNode(value));
      list.append(li);
    });
    content.append(list);
    const privacy = node('p', 'Sending shares these details and basic visit-source information with Isaac through FormSubmit so he can respond and understand how you found the service. ', 'input-hint');
    const privacyLink = node('a', 'Inquiry privacy');
    privacyLink.href = '/privacy';
    privacyLink.target = '_blank';
    privacyLink.rel = 'noopener';
    privacy.append(privacyLink);
    content.append(privacy);
    const status = node('p', '', 'send-status');
    status.setAttribute('role', 'status');
    const send = button('Send my inquiry →', async () => {
      if (sending || submitted || !canSend) return;
      if (answers.contact.website) {
        status.textContent = 'Please leave the extra website field empty, then try again.';
        return;
      }
      sending = true;
      content.setAttribute('aria-busy', 'true');
      content.querySelectorAll('button').forEach(item => { item.disabled = true; });
      document.querySelector('#close-flow').disabled = true;
      send.textContent = 'Sending…';
      status.textContent = 'Sending your inquiry. Please keep this page open.';
      try {
        const payload = delivery.buildPayload({ ...answers, attribution: window.InquiryAttribution?.get() }, offer, reference);
        await delivery.submit(payload);
        submitted = true;
        current = 'sent';
        history = [];
        render();
      } catch {
        send.textContent = 'Try sending again';
        status.className = 'send-status error';
        status.textContent = 'We couldn’t confirm that your inquiry was sent. Your details are still here. Retrying may send a duplicate; you can also email or message Isaac below.';
        content.querySelectorAll('button').forEach(item => { item.disabled = false; });
      } finally {
        sending = false;
        content.removeAttribute('aria-busy');
        document.querySelector('#close-flow').disabled = false;
      }
    });
    send.disabled = !canSend;
    if (!canSend) status.textContent = 'Release preview: sending is disabled. Your inquiry has not been sent.';
    content.append(send, status);
    appendContactFallback();
  }

  function appendContactFallback() {
    const fallback = node('p', 'Prefer another way? ', 'input-hint');
    const email = node('a', 'Email Isaac');
    email.href = 'mailto:isaac@carofslo.com';
    const instagram = node('a', 'Message on Instagram');
    instagram.href = 'https://ig.me/m/805carguy';
    instagram.target = '_blank';
    instagram.rel = 'noopener noreferrer';
    fallback.append(email, document.createTextNode(' · '), instagram);
    content.append(fallback);
  }

  function renderSent() {
    heading('Your inquiry is on its way.', 'The form service accepted your inquiry for delivery to Isaac.');
    content.append(node('p', 'Isaac will use your chosen contact method to discuss fit, timing, and next steps. This does not book a service or take payment.', 'flow-lede'));
    content.append(node('p', 'Inquiry reference: ' + reference, 'input-hint'));
    content.append(button('Back to the site', () => dialog.close()));
    appendContactFallback();
    answers = {};
  }

  function render() {
    content.replaceChildren();
    if (current === 'remoteHandoff') renderRemoteHandoff();
    else if (current === 'result') renderResult();
    else if (current === 'timing') renderTiming();
    else if (current === 'details') renderDetails();
    else if (current === 'summary') renderSummary();
    else if (current === 'sent') renderSent();
    else renderQuestion();
    if (history.length) content.append(button('← Back', back, 'back-button'));
    else if (current !== 'start' && current !== 'sent') content.append(button('← See all starting points', () => {
      answers = {}; history = []; current = 'start'; render();
    }, 'back-button'));
    dialog.scrollTop = 0;
    content.querySelector('#flow-title').focus({ preventScroll: true });
  }

  function startInquiry(step, trigger) {
    returnFocus = trigger;
    answers = intents[step] ? { intent: intents[step] } : {};
    if (purchasePreferences[step]) answers.purchasePreference = purchasePreferences[step];
    history = [];
    submitted = false;
    reference = '805-' + crypto.randomUUID();
    if (remoteEntries[step]) {
      answers.remoteEntry = step;
      current = 'remoteHandoff';
    } else if (step === 'inquiry') {
      answers.package = 'inquiry';
      current = 'timing';
    } else {
      const packageKey = step;
      if (!questions[step] && packages[packageKey]) {
        answers.package = packageKey;
        current = 'result';
      } else current = step === 'all' ? 'start' : step;
    }
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    render();
  }
  document.querySelectorAll('[data-start]').forEach(trigger => {
    trigger.addEventListener('click', () => startInquiry(trigger.dataset.start, trigger));
  });
  document.querySelector('#close-flow').addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => { if (sending) event.preventDefault(); });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    returnFocus?.focus({ preventScroll: true });
  });
  const inquiryLinks = new Map([
    ['#inquire', 'all'],
    ['#inquire-general', 'inquiry'],
    ['#inquire-buy-start', 'buyStart'],
    ['#inquire-open-to-either', 'openToEither'],
    ['#inquire-research', 'research'],
    ['#inquire-new-car', 'newCar'],
    ['#inquire-used-car', 'usedCar'],
    ['#inquire-sell', 'sell'],
    ['#inquire-local-check', 'localAssessment'],
    ['#inquire-new-buy', 'newBuy'],
    ['#inquire-found-buy', 'local'],
    ['#inquire-remote', 'remote'],
    ['#inquire-second-opinion', 'evaluateResult'],
    ['#inquire-new-review', 'newReview'],
    ['#inquire-used-review', 'usedReview'],
    ['#inquire-choose', 'choose'],
    ['#inquire-evaluate', 'evaluate'],
    ['#inquire-search', 'searchResult'],
    ['#inquire-buy', 'buy'],
    ['#inquire-complete', 'local'],
    ['#inquire-assisted-sale', 'assistedSell'],
    ['#inquire-full-sale', 'fullSell'],
  ]);
  function openInquiryLink() {
    const step = inquiryLinks.get(window.location.hash);
    if (step && !dialog.open) startInquiry(step, document.querySelector('[data-start="all"]'));
  }
  window.addEventListener('hashchange', openInquiryLink);
  openInquiryLink();
})();
