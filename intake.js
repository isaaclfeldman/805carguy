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
    choose: {
      title: 'Figure out what fits.', price: '$49', caption: 'Introductory consultation',
      intro: 'Start with your life, your budget, and what you enjoy about driving.',
      includes: ['A 45–60 minute conversation with Isaac.', 'At least three tailored recommendations, including suggested years and trims, the tradeoffs, and what to avoid.', 'One follow-up after you consider the options or take test drives.'],
      boundary: 'This is advice about which car to buy. Searching for individual cars and handling a purchase are separate services.',
      terms: 'The $49 you pay counts once toward an applicable larger service for this same purchase.'
    },
    search: {
      title: 'Find the right used car.', price: '$500', caption: 'One agreed 30-day search',
      intro: 'Actual cars screened for your requirements, with the seller legwork already done.',
      includes: ['Clarify what fits, including model choice if needed.', 'At least three qualifying actual cars, unless you choose one sooner.', 'Contact sellers to confirm availability, specifications, and price; review available history and maintenance records.', 'A recommendation explaining which cars are worth pursuing and why.'],
      boundary: 'We agree on the budget and must-haves first. You handle the purchase; physical inspection and purchase negotiation are separate. If I cannot deliver the agreed search, we agree on an extension or refund under our written agreement.',
      terms: 'Your payment counts once toward complete purchase help for this same search. For example, $500 already paid for search leaves $500 toward the $1,000 complete local service. We confirm the credit and remaining payments in writing before added work starts.'
    },
    newBuy: {
      title: 'Buy your new car with help.', price: '$750', caption: 'Introductory purchase assistance',
      intro: 'Help with the offers, the details, and the experience of buying.',
      includes: ['Confirm your requirements and compare availability and dealer offers.', 'Negotiate and review the vehicle price, trade-in, add-ons, and financing or lease terms.', 'Coordinate the purchase—or recommend walking away when the deal does not make sense.'],
      boundary: 'Typical new-car deal shopping is included. A rare specification or unusually difficult search needs a separately agreed scope before any added fee.',
      terms: 'This covers one purchase. Before work begins, our written agreement confirms the offers and deal revisions included, timeframe, payment timing, and cancellation or refund terms. Applicable fees already paid for this purchase count once toward the total.'
    },
    foundBuy: {
      title: 'Help buying the car you found.', price: '$750', caption: 'Introductory purchase assistance',
      intro: 'You have a candidate. Get help deciding whether—and how—to move forward.',
      includes: ['Review the listing, available vehicle records, and seller answers.', 'Negotiate and review the written deal and relevant purchase terms.', 'Coordinate the next steps through purchase—or recommend walking away.'],
      boundary: 'Finding other used cars and a physical inspection are separate. Certified Auto Repair’s standalone full used-car inspection is $199—the shop’s price, not an 805CarGuy fee. We agree on any inspection or outside cost before booking.',
      terms: 'This covers one purchase. Before work begins, our written agreement confirms the candidates and deal revisions included, timeframe, payment timing, and cancellation or refund terms. Applicable fees already paid for this purchase count once toward the total.'
    },
    complete: {
      title: 'From choosing to the keys.', price: '$1,000', caption: 'Complete local used-car purchase',
      intro: 'One service for choosing, finding, checking, and buying your car.',
      includes: ['Help choosing, plus at least three qualifying, seller-confirmed candidates in the agreed 30-day search, unless you choose sooner.', 'Screening, negotiation, and purchase coordination.', 'One full used-car inspection at Certified Auto Repair in San Luis Obispo, included in the $1,000 price. There is no extra $199 inspection charge.'],
      boundary: 'The car must come to the shop, with seller permission and an available appointment. Transport is not included. Any additional inspections are separately priced and approved. If I cannot deliver the agreed search, we agree on an extension or refund under our written agreement.',
      terms: '$500 to start and $500 when you purchase, less applicable prior payments credited once. This covers one purchase. Our written agreement confirms the candidates and deal revisions covered, overall timeframe, cancellation or refund terms, and when the purchase balance is due. Rejecting a car after inspection does not by itself trigger the final payment.'
    },
    remote: {
      title: 'Let’s scope the search together.', price: 'Price agreed first', caption: 'Used-car search and purchase help',
      intro: 'The help can include finding, screening, negotiating, and coordinating the purchase.',
      includes: ['Confirm your requirements, location, and the help you want.', 'Agree on a search scope, price, and timeline before starting.', 'Arrange an appropriate inspection with its cost approved in advance.'],
      boundary: 'The $1,000 local package includes one inspection at Certified Auto Repair in San Luis Obispo. If the car cannot come to that shop—or you are not sure yet—we will confirm a suitable scope and any outside costs first.',
      terms: 'Applicable prior payments for this same purchase are credited once toward the agreed service.'
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
    evaluate: {
      title: 'A second opinion before you commit.', price: '$99', caption: 'One car or written deal',
      intro: 'Get a clear recommendation and the questions worth asking next.',
      includes: ['Review one listing and available records, or one written new-car offer.', 'A short written verdict with the relevant concerns and next steps.', 'One follow-up for seller answers or a revised offer.'],
      boundary: 'This is a remote review, not a physical inspection. It cannot establish mechanical condition. I will confirm that I can meet your deadline before accepting the job.',
      terms: 'This review is included when it is part of Search or Buy. If you start here, your $99 counts once toward an applicable larger service for this same purchase.'
    }
  };

  const questions = {
    start: { title: 'Where are you starting?', options: [
      ['Choose or find a car', 'I need to figure out what fits, or find the right one.', 'search'],
      ['Get help buying', 'I want help with the deal and the purchase.', 'buy'],
      ['Sell my car', 'I want help preparing, listing, or managing the sale.', 'sell'],
      ['Check a car or deal', 'I want a second opinion before committing.', 'evaluate']
    ]},
    search: { title: 'Do you know what car you want?', options: [
      ['Not yet—help me choose', 'Start with advice tailored to my life and budget.', 'choose'],
      ['Yes—help me find one', 'I have a model or a clear set of requirements.', 'searchType']
    ]},
    searchType: { title: 'Are you shopping new or used?', options: [
      ['Used', 'Find and compare individual cars.', 'usedHelp'],
      ['New', 'Compare availability, offers, and the buying experience.', 'newBuy'],
      ['I’m open to either', 'Help me decide which makes more sense.', 'choose']
    ]},
    usedHelp: { title: 'How much help would you like?', options: [
      ['Find the candidates', 'A verified shortlist; I handle the purchase.', 'searchResult'],
      ['Help through the purchase', 'Choosing, searching, checking, and negotiating.', 'local']
    ]},
    buy: { title: 'Are you buying new or used?', options: [
      ['New', 'Help comparing offers and handling the purchase.', 'newBuy'],
      ['Used', 'The individual car and its condition matter.', 'usedFound'],
      ['I haven’t decided', 'Start by figuring out what fits.', 'choose']
    ]},
    usedFound: { title: 'Have you found a car?', options: [
      ['Yes, I have a candidate', 'Help me check the deal and handle the purchase.', 'foundBuy'],
      ['No, I need help finding one', 'Include searching as well as purchase help.', 'local']
    ]},
    local: { title: 'Could the car come to San Luis Obispo?', lede: 'The complete local package includes one inspection at Certified Auto Repair. Seller permission and scheduling still need to be confirmed.', options: [
      ['Yes, that should work', 'Plan around an inspection at the SLO shop.', 'complete'],
      ['No, it would need another shop', 'Agree on the scope and outside inspection costs first.', 'remote'],
      ['Not sure yet', 'Confirm the location and arrangements together.', 'remote']
    ]},
    sell: { title: 'How much of the sale should I handle?', options: [
      ['Get it listed and screen buyers', 'I’ll handle the showings, negotiation, and closing.', 'assistedSell'],
      ['Manage the sale with me', 'Handle buyer contact, showings, and negotiation too.', 'fullSell']
    ]},
    evaluate: { title: 'What would you like checked?', options: [
      ['A used-car listing', 'Review the listing and any available records.', 'usedReview'],
      ['A written new-car offer', 'Review the price and the terms before I commit.', 'newReview']
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
    if (next === 'usedReview' || next === 'newReview') {
      answers.reviewType = next === 'usedReview' ? 'Used-car listing' : 'Written new-car offer';
      next = 'evaluateResult';
    }
    const key = next === 'searchResult' ? 'search' : next === 'evaluateResult' ? 'evaluate' : next;
    if (!questions[next] && packages[key]) {
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
    inputs.location = field(form, { id: 'location', label: 'City or ZIP code (optional)', value: saved.location, autocomplete: 'address-level2' });
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
      ['Location', answers.contact.location],
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
    const privacy = node('p', 'Sending shares these details with Isaac through FormSubmit so he can respond to this inquiry. ', 'input-hint');
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
        const payload = delivery.buildPayload(answers, offer, reference);
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
    if (current === 'result') renderResult();
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

  document.querySelectorAll('[data-start]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      returnFocus = trigger;
      answers = {};
      history = [];
      submitted = false;
      reference = '805-' + crypto.randomUUID();
      current = trigger.dataset.start === 'all' ? 'start' : trigger.dataset.start;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      render();
    });
  });
  document.querySelector('#close-flow').addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => { if (sending) event.preventDefault(); });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    returnFocus?.focus({ preventScroll: true });
  });
  function openInquiryLink() {
    if (window.location.hash === '#inquire' && !dialog.open) {
      document.querySelector('[data-start="all"]').click();
    }
  }
  window.addEventListener('hashchange', openInquiryLink);
  openInquiryLink();
})();
