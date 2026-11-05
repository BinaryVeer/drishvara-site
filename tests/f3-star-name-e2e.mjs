import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const out='f3-star-name-evidence';fs.mkdirSync(out,{recursive:true});
const SITE='http://127.0.0.1:8765';
const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
assert.ok(chrome,'Chrome required');
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const report={runDateUtc:new Date().toISOString(),cases:[],errors:[]};
function log(tag,info){report.cases.push({tag,...info});console.log('CASE '+tag+' '+JSON.stringify(info).slice(0,1400));}
function error(tag,e){report.errors.push(tag+': '+String(e));console.error('FAIL '+tag+': '+String(e));}

async function run(width){
 const context=await browser.newContext({viewport:{width,height:880},deviceScaleFactor:1});
 const page=await context.newPage();let calls=[],errors=[];
 page.on('request',r=>{
  if(r.url().includes('/functions/v1/calculate-panchang')&&r.method()==='POST'){
   try{calls.push(r.postDataJSON())}catch(e){errors.push('bad runtime body '+e)}
  }
 });
 page.on('pageerror',e=>errors.push(e.message));
 const input=page.locator('#star-reflection-name');
 try{
  const response=await page.goto(SITE+'/what-stars-say.html',{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>document.querySelector('#star-reflection-name')?.disabled===false);
  assert.equal(await input.isVisible(),true,'Optional name input must be visible');
  assert.equal(await input.getAttribute('autocomplete'),'off');
  assert.equal(await input.getAttribute('aria-hidden'),null);
  await input.fill('QA Example');
  assert.equal(await input.inputValue(),'QA Example');
  await page.waitForFunction(()=>document.getElementById('ag75d-e2-star-place-choice-panel')?.getAttribute('data-ag75d-e2-approved-option-count')==='3266',null,{timeout:26000});
  const search=page.locator('#dv2-star-location-search');
  await search.fill('London');
  const suggestion=page.locator('#dv2-star-location-search-suggestions [role="option"]').filter({hasText:'London — England'});
  await suggestion.first().waitFor({state:'visible',timeout:8000});
  await suggestion.first().click();
  await page.waitForFunction(()=>document.getElementById('ag75d-e2-star-place-choice-panel')?.getAttribute('data-ag75d-e2-star-selected-location')==='city-gn-2643743');
  await page.locator('#star-reflection-dob').fill('01/01/2000');
  await page.locator('#star-reflection-birth-time').fill('12:00');
  await page.locator('#star-birth-time-unknown').uncheck();
  await page.locator('[data-ag71e-preview-button="star-reflection"]').click();
  await page.waitForFunction(()=>{
   const card=document.querySelector('[data-drishvara-v2-reflect-card="true"]');
   const button=document.querySelector('[data-ag71e-preview-button="star-reflection"]');
   return card?.getAttribute('data-ag75d-e3-star-reflection-state')&&button?.getAttribute('aria-busy')!=='true';
  },null,{timeout:30000});
  const state=await page.locator('[data-drishvara-v2-reflect-card="true"]').getAttribute('data-ag75d-e3-star-reflection-state');
  assert.ok(state&&!['fail_closed','invalid_input','pending_input','runtime_error'].includes(state),'Expected governed result, found '+state);
  let salutation=await page.locator('.r-reflection-salutation').textContent();
  assert.match(salutation,/QA Example/);
  const rows=await page.locator('[data-ag71e-preview-grid="star-reflection"] .ag71e-preview-row').allTextContents();
  const requestCount=calls.length;
  assert.ok(requestCount>=1,'Expected the governed astronomical request');
  for(const body of calls){
   assert.ok(body.civil_date==='2000-01-01'||body.action==='locations');
   const raw=JSON.stringify(body);
   assert.doesNotMatch(raw,/QA Example|star-reflection-name|birth_time|birthTime|12:00/,'Name or exact birth time must not enter server request');
  }
  await input.fill('Another QA Name');
  assert.match(await page.locator('.r-reflection-salutation').textContent(),/Another QA Name/);
  assert.equal(calls.length,requestCount,'Name change must not trigger astronomical calculation');
  const rowsAfter=await page.locator('[data-ag71e-preview-grid="star-reflection"] .ag71e-preview-row').allTextContents();
  assert.deepEqual(rowsAfter,rows,'Changing name must not modify approved reflection result rows');
  const hi=page.locator('[data-dv2-language-choice="hi"]');
  if(await hi.count() && await hi.first().isVisible()){
   await hi.first().click(); await page.waitForTimeout(350);
   assert.match(await page.locator('.r-reflection-salutation').textContent(),/इनके लिए चिंतन/);
  }
  const data=await page.evaluate(()=>({name:document.getElementById('star-reflection-name')?.value,persistedName:[...Object.values(localStorage),...Object.values(sessionStorage)].some(x=>x.includes('Another QA Name')),overflow:document.documentElement.scrollWidth>innerWidth+3}));
  assert.equal(data.persistedName,false,'User-entered name must not appear in app storage');
  assert.equal(data.overflow,false,'Name field must not create horizontal overflow');
  await page.screenshot({path:out+'/named-reflection-'+width+'.png',fullPage:true,timeout:20000});
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#star-reflection-name')?.disabled===false);
  assert.equal(await input.inputValue(),'','The app must clear the name on reload');
  log('named-reflection-'+width,{state,requestCount,selected:'London',timezone:'Europe/London',nameOnlyDisplay:true,changedNameWithoutNewRuntime:true,notStored:true,noOverflow:true,clearedOnReload:true});
 }catch(e){error('named-reflection-'+width,e?.stack||e)}
 finally{if(errors.length)error('js-'+width,errors.join(' | '));await page.close();await context.close()}
}
try{for(const width of [1440,390])await run(width)}finally{await browser.close()}
report.finishedAt=new Date().toISOString();
fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));
console.log('STAR_NAME_QA failures='+report.errors.length);
if(report.errors.length)process.exitCode=1;
