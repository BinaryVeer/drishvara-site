import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const OUT='f3-nama-rashi-evidence';
fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync('assets/js/drishvara-nama-rashi.js','utf8');
assert.doesNotMatch(source,/\b(?:fetch|localStorage|sessionStorage|indexedDB|sendBeacon)\s*\(/,
  'Name resolver must have no networking or persistence primitives');
assert.match(fs.readFileSync('what-stars-say.html','utf8'),/drishvara-nama-rashi\.js\?v=20261105-nama-rashi/);
const fakeWindow={};
new Function('window','document',source)(fakeWindow,{readyState:'loading',addEventListener(){}});
const API=fakeWindow.DrishvaraNamaRashi;
assert.equal(API.records.length,108);
assert.equal(API.rashis.length,12);
for(let i=0;i<12;i++)assert.equal(API.records.filter(x=>x.rashiIndex===i).length,9);
function checkMatch(name,state,signs){
 const result=API.resolveName(name);
 assert.equal(result.state,state,name);
 assert.deepEqual([...new Set(result.candidates.map(x=>API.rashis[x.rashiIndex][0]))].sort(),signs.slice().sort(),name);
}
checkMatch('विकास','exact',['Vrishabha']);
checkMatch('दीपक','exact',['Meena']);
checkMatch('माया','exact',['Simha']);
checkMatch('Vikash','confirm_sound',['Vrishabha']);
checkMatch('Rahul','confirm_sound',['Tula']);
checkMatch('Tapan','confirm_sound',['Simha','Tula']);
checkMatch('Dinesh','confirm_sound',['Karka','Meena']);
checkMatch('Shreya','manual_required',[]);
checkMatch('','empty',[]);
assert.equal(API.resolveSyllable('वी').nakshatra,'Rohini');
assert.equal(API.resolveSyllable('रा').rashiIndex,6);

const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
assert.ok(chrome,'System Chromium required');
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const report={date:new Date().toISOString(),sourceRecords:108,cases:[],failures:[]};
function log(tag,detail){report.cases.push({tag,...detail});console.log('CASE '+tag+' '+JSON.stringify(detail).slice(0,1100));}
async function run(width){
 const context=await browser.newContext({viewport:{width,height:860},deviceScaleFactor:1});
 const page=await context.newPage();
 const requests=[],pageErrors=[];
 page.on('request',request=>{if(request.method()==='POST') requests.push({url:request.url(),body:request.postData()||''});});
 page.on('pageerror',error=>pageErrors.push(error.message));
 const input=page.locator('#star-reflection-name');
 const result=page.locator('#nama-rashi-result');
 const sound=page.locator('#nama-rashi-sound');
 const consent=page.locator('#nama-rashi-consent');
 const text=async()=>await result.innerText();
 const checkNoNameTransmission=()=>{
  assert.ok(!requests.some(r=>/QA Sample|Vikash|Tapan|Dinesh|Shreya|विकास|दीपक/.test(r.body)),
   'Name must not appear in POST request body');
 };
 try{
  const res=await page.goto('http://127.0.0.1:8765/what-stars-say.html',{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(res.status(),200);
  await page.locator('#nama-rashi-panel').waitFor({state:'visible',timeout:16000});
  assert.equal(await input.isVisible(),true);
  assert.equal(await input.isEnabled(),true);
  assert.equal(await consent.isChecked(),false);
  await input.fill('विकास');
  assert.equal((await text()).trim(),'','No automatic output before consent');
  await consent.check();
  assert.match(await text(),/Vrishabha/);
  assert.match(await text(),/Rohini/);
  log('deva-'+width,{sign:'Vrishabha',consent:true,initialSyllable:'वी'});
  await input.fill('Vikash');
  assert.equal((await text()).trim(),'','Roman names must require manual confirmation');
  assert.equal(await page.locator('.r-nama-confirm').isVisible(),true);
  assert.equal(await sound.locator('option').count(),2,'One candidate + empty option expected');
  await sound.selectOption('3-3');
  assert.match(await text(),/Vrishabha/);
  log('roman-confirm-'+width,{sign:'Vrishabha',firstSound:'वी'});
  await input.fill('Tapan');
  assert.equal((await text()).trim(),'','Ambiguous Roman Ta must not auto-select');
  assert.equal(await sound.locator('option').count(),3,'Two variants + empty option expected');
  await sound.selectOption('10-2'); // ṭā, Purva Phalguni, Simha
  assert.match(await text(),/Simha/);
  await input.fill('Tapan ');
  await sound.selectOption('14-4'); // tā, Swati, Tula
  assert.match(await text(),/Tula/);
  log('ambiguous-'+width,{candidates:['Simha','Tula'],blockedUntilConfirmed:true});
  await input.fill('Dinesh');
  assert.equal((await text()).trim(),'');
  assert.equal(await sound.locator('option').count(),3,'Roman Di is Karka/Meena ambiguous');
  await input.fill('Shreya');
  assert.equal((await text()).trim(),'');
  assert.equal(await sound.locator('option').count(),109,'Unmatched spelling needs all 108 options');
  await input.fill('विकास');
  assert.match(await text(),/Vrishabha/);
  await page.locator('[data-dv2-language-choice="hi"]').click();
  await page.waitForFunction(()=>document.querySelector('#nama-rashi-heading')?.textContent.includes('नाम राशि'),null,{timeout:6000});
  assert.match(await text(),/वृषभ/);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=3,'Nāma Rāśi introduced horizontal overflow: '+overflow);
  await page.screenshot({path:OUT+'/nama-rashi-'+width+'.png',fullPage:true,animations:'disabled'});
  await consent.uncheck();
  assert.equal((await text()).trim(),'','Revoking consent must remove result');
  assert.equal(await page.locator('.r-nama-confirm').isVisible(),false);
  checkNoNameTransmission();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#nama-rashi-panel').waitFor({state:'visible'});
  assert.equal(await page.locator('#star-reflection-name').inputValue(),'','Name must clear on reload');
  assert.equal(await page.locator('#nama-rashi-consent').isChecked(),false,'Consent must reset on reload');
  if(pageErrors.length)throw Error('Uncaught page errors: '+pageErrors.join(' | '));
  log('privacy-'+width,{noNameInRuntime:true,noPersistence:true,consentRevocable:true,overflowPx:overflow,jsErrors:0});
 }finally{await context.close();}
}
try{
 for(const width of [1440,390,320]){
  try{await run(width)}catch(e){report.failures.push(width+': '+String(e));console.error('FAIL '+width+' '+String(e).slice(0,700));}
 }
}finally{await browser.close();}
fs.writeFileSync(OUT+'/report.json',JSON.stringify(report,null,2));
console.log('NAMA_QA samples='+report.cases.length+' failures='+report.failures.length);
if(report.failures.length)process.exitCode=1;
