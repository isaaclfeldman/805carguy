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
    localAssessment: {
      title: 'Check the car and the deal.', price: 'One agreed quote', caption: 'Complete local car-and-deal assessment',
      intro: 'For a car near San Luis Obispo, whether you live nearby or are considering it from farther away.',
      includes: ['Agree on the assessment the car needs and what can be checked.', 'Discuss seeing and test-driving the car and coordinating its shop inspection.', 'A written assessment of the agreed checks, available records, the deal, material unknowns, and what I recommend next.'],
      boundary: 'We confirm the vehicle location, seller permission, inspection arrangements, travel, timing, and one total quote before work starts. Pickup and delivery are not included; no fixed coverage area or availability is promised. I co-own Certified Auto Repair. You do not need to buy a remote review first.',
      terms: 'The quote covers the agreed assessment. Finding other cars, negotiating a purchase, repairs, and additional visits are separate unless expressly included. No booking or payment is made by sending this inquiry.'
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
    start: { title: 'What local help do you need?', lede: '805CarGuy handles hands-on work near San Luis Obispo. Nationwide remote guidance and search are with OttO.', options: [
      ['Check a local car', 'Discuss seeing the car, a test drive and its shop inspection.', 'localAssessment'],
      ['Complete local buying help', '$1,000 used-car service, including one shop inspection.', 'local'],
      ['Help me sell', 'Preparing a listing or getting help with the local sale.', 'sell'],
      ['I need remote help', 'Explore nationwide guidance and search with OttO.', 'remote']
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
      ['Get it listed and screen buyers', 'I’ll handle the showings, negotiation, and closing.', 'assistedSell'],
      ['Manage the sale with me', 'Handle buyer contact, showings, and negotiation too.', 'fullSell']
    ]},
    evaluate: { title: 'What would you like checked?', options: [
      ['A local car and the deal', 'Discuss an in-person assessment near San Luis Obispo, with one agreed quote.', 'localAssessment'],
      ['Listings or written offers remotely', 'Ask OttO about a written second opinion.', 'evaluateResult']
    ]}
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

  function go(next) {
    history.push({ step: current, answers: { ...answers } });
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
    // Keep a human-readable path, without recording anything outside this page.
    answers[current] = label;
    if (next === 'inquiry') {
      answers.package = 'inquiry';
      go('timing');
      return;
    }
    if (remoteEntries[next]) {
      answers.remoteEntry = next;
      go('remoteHandoff');
      return;
    }
    const key = next;
    if (!questions[next] && packages[key]) {
      if (key !== 'evaluate') delete answers.reviewType;
      answers.package = key;
      go('result');
    } else go(next);
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
    if (current === 'start') content.append(button('I’d rather just tell you what I need', () => pick('General inquiry', 'inquiry'), 'text-button'));
  }

  function renderResult() {
    const offer = packages[answers.package];
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
    const selling = ['assistedSell', 'fullSell'].includes(answers.package);
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
      ['Interested in', offer.title + ' — ' + offer.price],
      ['Scope and pricing', offer.caption],
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
    answers = {};
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
