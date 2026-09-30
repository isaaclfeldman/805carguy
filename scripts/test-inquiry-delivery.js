'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { isProduction, buildPayload, submit } = require('../inquiry-delivery');
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
