'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { isProduction, isValidPhone, buildPayload, submit } = require('../inquiry-delivery');
const answers = {contact:{name:' Customer ',method:'Email me',reply:' customer@example.com ',context:'<script>plain text</script>\nBudget $25,000',location:'93401'},timing:'Within a month',reviewType:'Used-car listing'};
const offer = {title:'Find the right used car.',price:'$500',caption:'One agreed 30-day search'};
test('preview and untrusted hosts cannot enable the production send control', () => {
  for(const location of [{protocol:'http:',hostname:'localhost'},{protocol:'https:',hostname:'www.805carguy.com.example.com'},{protocol:'http:',hostname:'www.805carguy.com'},{protocol:'file:',hostname:''}]) assert.equal(isProduction(location),false);
  assert.equal(isProduction({protocol:'https:',hostname:'www.805carguy.com'}),true);
});
test('email inquiry preserves customer intent and sets a usable reply address', () => {
  const data = buildPayload(answers,offer,'805-test');
  assert.equal(data.name,'Customer');assert.equal(data.email,'customer@example.com');assert.equal(data._replyto,data.email);
  assert.equal(data.message,answers.contact.context);assert.equal(data.displayed_price,'$500');assert.equal(data.timing,'Within a month');assert.equal(data.reference,'805-test');assert.equal(data.phone,undefined);
});
test('phone preference does not create a broken email reply-to', () => {
  for(const method of ['Text me','Call me']) {
    const data = buildPayload({...answers,contact:{...answers.contact,method,reply:'805-555-0100'}},offer,'805-phone');
    assert.equal(data.contact_preference,method);assert.equal(data.phone,'805-555-0100');assert.equal(data.email,undefined);assert.equal(data._replyto,undefined);
  }
});
test('phone format preserves ordinary US and international numbers and extensions', () => {
  for (const reply of ['5550100', '805-555-0100', '805.555.0100', '805–555–0100', '+1 (805) 555-0100', '(+44) 20 7946 0958', '+33 (0)1 23 45 67 89', '030/1234567', '805-555-0100 x123', '+44 20 7946 0958 ext. 12', '805-555-0100 extension 123', '805-555-0100 #123']) {
    assert.equal(isValidPhone(reply), true, reply);
    for (const method of ['Text me', 'Call me']) {
      const data = buildPayload({...answers, contact:{...answers.contact, method, reply}}, offer, '805-phone');
      assert.equal(data.phone, reply, 'Keep the submitted formatting');
      assert.equal(data.contact_preference, method);
    }
  }
});
test('numeric emails, URLs and short main numbers cannot become phone inquiries', () => {
  for (const reply of ['buyer1234567@example.invalid', 'https://8055550100', 'call me at 8055550100', '805-555-0100 other123', '123456 ext. 1234', '123456#7890', '8055550100 ext abc', '+1+8055550100', '805+5550100', '123', '']) {
    assert.equal(isValidPhone(reply), false, reply);
    for (const method of ['Text me', 'Call me']) {
      assert.throws(() => buildPayload({...answers, contact:{...answers.contact, method, reply}}, offer, '805-phone'), /Invalid phone number|Incomplete inquiry/, reply);
    }
  }
  for (const reply of [undefined, null, 8055550100]) assert.equal(isValidPhone(reply), false);
  // The same numeric email remains valid for the email preference.
  const data = buildPayload({...answers, contact:{...answers.contact, reply:'buyer1234567@example.invalid'}}, offer, '805-email');
  assert.equal(data.email, 'buyer1234567@example.invalid');
});
test('incomplete or invalid preferences are never posted', () => {
  assert.throws(()=>buildPayload({...answers,contact:{name:' ',reply:'a',method:'Email me'}},offer,'id'));
  assert.throws(()=>buildPayload({...answers,contact:{name:'A',reply:'b',method:'Carrier pigeon'}},offer,'id'));
});
test('only explicit provider acceptance is success', async () => {
  for(const success of [true,'true']) assert.deepEqual(await submit({name:'QA'},{fetchImpl:async()=>({ok:true,json:async()=>({success})})}),{accepted:true});
  for(const result of [{success:false},{success:'false'},{message:'Please activate'},null,{}]) await assert.rejects(submit({}, {fetchImpl:async()=>({ok:true,json:async()=>result})}));
});
test('4xx, 5xx, malformed bodies and network errors do not claim success', async () => {
  for(const status of [400,403,429,500,503]) await assert.rejects(submit({}, {fetchImpl:async()=>({ok:false,status})}));
  await assert.rejects(submit({}, {fetchImpl:async()=>({ok:true,json:async()=>{throw new Error('HTML response');}})}));
  await assert.rejects(submit({}, {fetchImpl:async()=>{throw new Error('offline');}}));
});
test('slow delivery aborts instead of leaving the form stuck', async () => {
  await assert.rejects(submit({}, {timeoutMs:5,fetchImpl:(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('timeout'))))}));
});
test('request uses existing alias, sends every field, and omits credentials', async () => {
  const payload = buildPayload(answers,offer,'805-request');
  await submit(payload,{fetchImpl:async (url,request)=>{
    assert.equal(url,'https://formsubmit.co/ajax/3bee3a7c1f40b430ff307881c018db32');
    assert.equal(request.method,'POST');assert.equal(request.credentials,'omit');assert.deepEqual(JSON.parse(request.body),payload);
    return {ok:true,json:async()=>({success:'true'})};
  }});
});
test('inquiries carry distinct buyer and car locations plus sanitized attribution', () => {
  const data = buildPayload({...answers, contact: {...answers.contact, vehicleLocation:'San Luis Obispo', heardAbout:'A friend'}, attribution: {
    landingPage:'/new-car-buying-help', inquiryPage:'/new-car-buying-help',
    referrerSource:'https://www.google.com/search?q=private-query', source:'google', medium:'organic',
    campaign:'customer@example.com'
  }},offer,'805-source');
  assert.equal(data.location,'93401');
  assert.equal(data.vehicle_location,'San Luis Obispo');
  assert.equal(data.how_you_found_me,'A friend');
  assert.equal(data.landing_page,'/new-car-buying-help');
  assert.equal(data.inquiry_page,'/new-car-buying-help');
  assert.equal(data.referring_site,'https://www.google.com');
  assert.equal(data.visit_source,'google');
  assert.equal(data.visit_medium,'organic');
  assert.doesNotMatch(JSON.stringify(data), /private-query|campaign/);
});
test('unknown source paths and personal campaign values never enter the email payload', () => {
  const data = buildPayload({...answers, attribution: {landingPage:'/private/customer@example.com', inquiryPage:'/unknown', source:'customer@example.com', medium:'private', referrerSource:'javascript:alert(1)'}},offer,'805-source');
  for (const key of ['landing_page','inquiry_page','visit_source','visit_medium','referring_site']) assert.equal(data[key], '');
});


test('delivery includes each explicit buying or selling intent without changing its offer', () => {
  for (const intent of ['Buy', 'Buy new', 'Buy used', 'Sell', 'Research']) {
    const data = buildPayload({ ...answers, intent }, offer, '805-intent');
    assert.equal(data.intent, intent);
    assert.equal(data.service, offer.title);
    assert.equal(data.displayed_price, offer.price);
    assert.equal(data.scope, offer.caption);
  }
  for (const intent of [undefined, '', 'stale or unknown route']) {
    assert.equal(buildPayload({ ...answers, intent }, offer, '805-general').intent, '');
  }
});

test('purchase preference is retained only for buying inquiries and known choices', () => {
  for (const [intent, purchasePreference] of [['Buy new', 'New'], ['Buy used', 'Used'], ['Buy', 'Open to Either']]) {
    const data = buildPayload({ ...answers, intent, purchasePreference }, offer, '805-preference');
    assert.equal(data.purchase_preference, purchasePreference);
  }
  for (const purchasePreference of [undefined, '', 'unknown or stale value']) {
    assert.equal(buildPayload({ ...answers, intent: 'Buy', purchasePreference }, offer, '805-preference').purchase_preference, '');
  }
  for (const intent of ['Research', 'Sell', undefined]) {
    assert.equal(buildPayload({ ...answers, intent, purchasePreference: 'Open to Either' }, offer, '805-preference').purchase_preference, '');
  }
});
