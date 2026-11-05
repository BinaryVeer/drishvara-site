// F3 Issue #9 — paired, read-only public-browser startup regression.
// Compares production baseline with candidate localhost, under an identical
// approved location catalog and a deterministic six-second catalogue hold.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';
const BASE = 'https://www.drishvara.com/panchang.html';
const CANDIDATE = 'http://127.0.0.1:8765/panchang.html';
const API = 'https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/calculate-panchang';
const OUT = 'f3-startup-evidence';
fs.mkdirSync(OUT,{recursive:true});
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
const prefetch = await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'locations'})});
assert.equal(prefetch.status,200,'Active governed location catalogue must respond successfully');
const catalogue = await prefetch.json();
assert.equal(catalogue.catalog_version,'20261026');
assert.equal(catalogue.record_count,catalogue.records.length);
assert.equal(catalogue.record_count,3266,'Guard the complete active 3,266-place catalogue');
const catalogBody=JSON.stringify(catalogue);
const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>fs.existsSync(p));
assert.ok(executablePath,'Chromium available on GitHub runner');
const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const evidence={runAt:new Date().toISOString(),catalogueCount:catalogue.record_count,catalogueDelayMs:6000,scenarios:[],failures:[]};

async function evaluatePage(url,tag,width) {
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
 const page=await context.newPage();
 const state={tag,width,url,started:Date.now(),catalogRequestAt:null,catalogDeliveredAt:null,calcRequestAt:null,calcResponseAt:null,renderAt:null,date:null,tithi:null,nakshatra:null,error:null,activeLocations:null,annualStatus:null};
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/functions/v1/calculate-panchang',async route=>{
  let body={};try{body=route.request().postDataJSON()||{}}catch{}
  if(body.action==='locations'){
   state.catalogRequestAt=Date.now();
   await delay(6000);
   state.catalogDeliveredAt=Date.now();
   try{await route.fulfill({status:200,contentType:'application/json',body:catalogBody,headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'}});}
   catch(e){errors.push('Catalog route: '+String(e));}
  }else{
   if(body.mode==='named_location')state.calcRequestAt=Date.now();
   await route.continue();
  }
 });
 page.on('response',res=>{
  if(res.url().includes('/functions/v1/calculate-panchang')&&res.request().method()==='POST') {
   let body={};try{body=res.request().postDataJSON()||{}}catch{}
   if(body.mode==='named_location')state.calcResponseAt=Date.now();
  }
 });
 try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  assert.ok(response&&response.ok(),tag+': HTML delivered');
  await page.waitForFunction(()=>document.querySelector('#panchang-festival-card')?.getAttribute('data-sup02-result-state')==='calculated',{timeout:30000});
  state.renderAt=Date.now();
  state.date=await page.locator('#panchang-date-picker').inputValue();
  state.tithi=(await page.locator('#panchang-tithi').textContent()).trim();
  state.nakshatra=(await page.locator('#panchang-nakshatra').textContent()).trim();
  // Reference assets are allowed to arrive after a daily result, but must
  // still populate the complete governed selection and the four-page book.
  await page.waitForFunction(()=>document.getElementById('panchang-place-select')?.options.length===3266,{timeout:30000});
  state.activeLocations=await page.locator('#panchang-place-select option').count();
  state.annualStatus=(await page.locator('#ag74o-book-status').textContent()).trim();
  assert.equal(state.activeLocations,3266);
  const presence=await page.evaluate(()=>{
   const values=Array.from(document.querySelectorAll('#panchang-place-select option')).map(o=>o.textContent.toLowerCase());
   return ['bengaluru','london','bedauliya','bhawanathpur township'].map(q=>values.some(v=>v.includes(q)));
  });
  assert.ok(presence.every(Boolean),'Searchable catalogue must preserve key Indian and international locations: '+JSON.stringify(presence));
  assert.match(state.tithi, /\(.+\)/);
  assert.equal(errors.length,0,tag+' browser errors: '+errors.join(' | '));
  await page.screenshot({path:OUT+'/'+tag+'-'+width+'.png',fullPage:true,animations:'disabled'});
 }catch(error){state.error=String(error);evidence.failures.push(tag+'-'+width+': '+String(error));}
 finally{state.durationMs=state.renderAt===null?null:state.renderAt-state.started;evidence.scenarios.push(state);await context.close();}
 return state;
}
try {
 for(const width of [1440,390]){
  const baseline=await evaluatePage(BASE,'baseline',width);
  const candidate=await evaluatePage(CANDIDATE,'candidate',width);
  if(baseline.error||candidate.error)continue;
  if(!(baseline.calcRequestAt>=baseline.catalogDeliveredAt))
   evidence.failures.push('Baseline did not exhibit serial catalogue dependency at '+width+'px');
  if(!(candidate.calcRequestAt<candidate.catalogDeliveredAt))
   evidence.failures.push('Candidate failed to start calculation before catalogue completion at '+width+'px');
  if(!(candidate.renderAt<candidate.catalogDeliveredAt))
   evidence.failures.push('Candidate did not render before full catalogue arrived at '+width+'px');
  if(!(candidate.renderAt<baseline.renderAt || candidate.durationMs<baseline.durationMs))
   evidence.failures.push('Candidate not faster than baseline at '+width+'px');
  if(candidate.date!==baseline.date||candidate.tithi!==baseline.tithi||candidate.nakshatra!==baseline.nakshatra)
   evidence.failures.push('Astronomical daily output disagrees with baseline at '+width+'px');
 }
}finally{await browser.close()}
evidence.finishedAt=new Date().toISOString();
fs.writeFileSync(OUT+'/report.json',JSON.stringify(evidence,null,2));
for(const x of evidence.scenarios)console.log(JSON.stringify({page:x.tag,width:x.width,msToResult:x.durationMs,msToCatalog:(x.catalogDeliveredAt||0)-x.started,msToCalc:(x.calcRequestAt||0)-x.started,locations:x.activeLocations,tithi:x.tithi,error:x.error}));
console.log('STARTUP QA failures='+evidence.failures.length);
for(const msg of evidence.failures)console.error('FAIL '+msg);
if(evidence.failures.length)process.exitCode=1;
