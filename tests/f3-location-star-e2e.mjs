/* Read-only F3 production location & Star Reflection end-to-end investigation.
 * All birth inputs are fabricated test values; requests contain only date and location.
 * No writes to Supabase or changes to the production application.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const SITE='https://www.drishvara.com';
const API='/functions/v1/calculate-panchang';
const OUT='f3-location-star-evidence';
fs.mkdirSync(OUT,{recursive:true});
const CATALOG=[
 {selector:'lgd-district-525',query:'Banglore',label:'Bengaluru / Bangalore',tz:'Asia/Kolkata'},
 {selector:'lgd-village-254106',query:'Badauliya',label:'Bedauliya',tz:'Asia/Kolkata'},
 {selector:'bhawanathpur-township-jharkhand-india',query:'Bhawanathpur Township',label:'Bhawanathpur Township',tz:'Asia/Kolkata'},
 {selector:'lgd-village-347166',query:'Bhawnathpur',label:'Bhawnathpur — village',tz:'Asia/Kolkata'},
 {selector:'city-gn-2643743',query:'London',label:'London — England',tz:'Europe/London',date:'2026-10-25'},
 {selector:'city-gn-5128581',query:'New York City',label:'New York City',tz:'America/New_York',date:'2026-11-01'},
 {selector:'city-gn-2147714',query:'Sydney',label:'Sydney',tz:'Australia/Sydney'},
 {selector:'city-gn-292223',query:'Dubai',label:'Dubai',tz:'Asia/Dubai'}
];
const RECORD={createdAt:new Date().toISOString(),testType:'read-only production browser E2E',cases:[],failures:[],warnings:[],httpRequests:[]};
const fail=(tag,error)=>{RECORD.failures.push({case:tag,detail:String(error)});console.error('FAIL '+tag+' '+error);};
const warning=(tag,text)=>{RECORD.warnings.push({case:tag,detail:String(text)});console.log('WARN '+tag+' '+text)};
const stamp=(tag,data)=>{RECORD.cases.push({tag,...data});console.log('CASE '+JSON.stringify({tag,...data}).slice(0,1550))};
const pathChrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>fs.existsSync(p));
assert.ok(pathChrome,'Chrome not installed on runner');
const browser=await chromium.launch({executablePath:pathChrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const selectValue=r=>{try{return r.request().postDataJSON()||{}}catch{return {}}};
function watchNetwork(page,scope){
 page.on('request',request=>{
  if(!request.url().includes(API)||request.method()!=='POST')return;
  let data={};try{data=request.postDataJSON()||{}}catch{}
  RECORD.httpRequests.push({scope,body:data,urlOrigin:new URL(request.url()).origin});
  const body=JSON.stringify(data);
  if(/QA Sample|Fake Person|2000-01-01.*12:00|star-reflection-name|birth_time|birthTime|full_name|name.*Test/i.test(body))
    fail(scope,'Potential personal/test input leaked into astronomical API body: '+body);
 });
 page.on('pageerror',e=>warning(scope,'JS page error: '+String(e.message).slice(0,200)));
}
async function waitCatalog(page,tag){
 await page.waitForFunction(()=>document.querySelector('#panchang-place-select')?.options.length===3266 || document.querySelector('[data-ag75d-e2-approved-option-count="3266"]'),null,{timeout:25000});
 const api=await page.evaluate(()=>({
  approvedCount:window.DrishvaraV2Location?.loadApprovedLocations?'exposed':null,
  defaultCount:document.querySelector('#panchang-place-select')?.options?.length??null,
  starCount:document.getElementById('ag75d-e2-star-place-choice-panel')?.getAttribute('data-ag75d-e2-approved-option-count')
 }));
 stamp(tag+' catalogue',{...api});
}
async function chooseSuggestion(page,inputId,term,selector,fragment,tag){
 const input=page.locator('#'+inputId);
 await input.fill(term);
 const list=page.locator('#'+inputId+'-suggestions');
 await list.locator('[role="option"]').first().waitFor({state:'visible',timeout:10000});
 const matching=list.locator('[role="option"]').filter({hasText:fragment});
 const count=await matching.count();
 assert.ok(count>0,tag+': approved search suggestion '+fragment+' not found for '+term);
 const text=await matching.first().textContent();
 assert.match(text,/Approved/i,tag+': selected candidate must be approved');
 await matching.first().click();
 if(inputId==='panchang-place-alias'){
  await page.waitForFunction(id=>document.getElementById('panchang-place-select')?.value===id,selector,{timeout:6000});
 }else{
  await page.waitForFunction(id=>document.getElementById('ag75d-e2-star-place-choice-panel')?.getAttribute('data-ag75d-e2-star-selected-location')===id,selector,{timeout:6000});
 }
 return text.trim().slice(0,170);
}
async function runPanchang(width,tests){
 const context=await browser.newContext({viewport:{width,height:850},deviceScaleFactor:1});
 const page=await context.newPage();
 watchNetwork(page,'panchang-'+width);
 try{
  const response=await page.goto(SITE+'/panchang.html',{waitUntil:'domcontentloaded',timeout:40000});
  assert.equal(response.status(),200);
  await waitCatalog(page,'panchang-'+width);
  await page.waitForFunction(()=>document.getElementById('panchang-festival-card')?.getAttribute('data-sup02-result-state')==='calculated',null,{timeout:15000});
  const discovered=await page.locator('#panchang-place-select option').count();
  assert.equal(discovered,3266);
  // Distinct Bhawnathpur village, subdistrict and Township must be discoverable separately.
  await page.locator('#panchang-place-alias').fill('Bhawnathpur');
  const all=await page.locator('#panchang-place-alias-suggestions [role="option"]').allTextContents();
  const states={village:all.some(x=>/— village/.test(x)),subdistrict:all.some(x=>/subdistrict/.test(x)),township:all.some(x=>/Township/.test(x))};
  stamp('panchang-'+width+'-ambiguous-names',{matches:all.length,states});
  assert.ok(Object.values(states).every(Boolean),'Village, subdistrict and Township must remain disambiguated in suggestions');
  await page.locator('#panchang-place-alias').fill('');
  for(const testcase of tests){
   const tag='panchang-'+width+'-'+testcase.selector;
   try{
    if(testcase.date){
     await page.locator('#panchang-date-picker').fill(testcase.date);
     await page.locator('#panchang-date-picker').dispatchEvent('change');
    }else{
     await page.locator('#panchang-date-picker').fill('2026-11-05');
     await page.locator('#panchang-date-picker').dispatchEvent('change');
    }
    const chosen=await chooseSuggestion(page,'panchang-place-alias',testcase.query,testcase.selector,testcase.label,tag);
    // The selection controller commits a request; on any non-committing UI
    // variant the explicit Calculate button provides the documented action.
    const existing=RECORD.httpRequests.filter(x=>x.scope==='panchang-'+width&&x.body.selector_value===testcase.selector);
    if(!existing.length && await page.locator('#panchang-calculate').isEnabled())await page.locator('#panchang-calculate').click();
    await page.waitForFunction(({tz,date,label})=>{
      const card=document.getElementById('panchang-festival-card');
      const status=document.getElementById('panchang-selection-status')?.textContent||'';
      const basis=document.getElementById('panchang-timezone-provenance')?.textContent||'';
      const place=document.getElementById('panchang-location-provenance')?.textContent||'';
      return card?.getAttribute('data-sup02-result-state')==='calculated'&&status.includes('Server-governed')&&basis.includes(tz)&&place.includes(label)&&status.includes(date.slice(8,10)+'/'+date.slice(5,7)+'/'+date.slice(0,4));
    },{tz:testcase.tz,date:testcase.date||'2026-11-05',label:testcase.label.split(' — ')[0]}, {timeout:22000});
    const result=await page.evaluate(()=>({
      selected:document.getElementById('panchang-place-select')?.value,
      timezone:document.getElementById('panchang-timezone-provenance')?.textContent.trim(),
      location:document.getElementById('panchang-location-provenance')?.textContent.trim(),
      status:document.getElementById('panchang-selection-status')?.textContent.trim(),
      tithi:document.getElementById('panchang-tithi')?.textContent.trim(),
      nakshatra:document.getElementById('panchang-nakshatra')?.textContent.trim(),
      sunrise:document.getElementById('panchang-sunrise')?.textContent.trim(),
      picker:document.getElementById('panchang-date-picker')?.value,
      book:document.getElementById('ag74o-book-status')?.textContent.trim()
    }));
    assert.equal(result.selected,testcase.selector);
    assert.ok(/(\(\d+\))/.test(result.tithi||''),'Valid Tithi result expected');
    const submitted=RECORD.httpRequests.filter(x=>x.scope==='panchang-'+width&&x.body.selector_value===testcase.selector);
    assert.ok(submitted.length,tag+': network request for selected approved ID not observed');
    stamp(tag,{query:testcase.query,chosen,...result});
   }catch(e){fail(tag,e?.stack||e);}
  }
  await page.screenshot({path:OUT+'/panchang-'+width+'.png',fullPage:true,timeout:25000});
 }catch(e){fail('panchang-'+width+'-initial',e?.stack||e);}
 finally{await page.close();await context.close();}
}
async function runStar(width,cases){
 const context=await browser.newContext({viewport:{width,height:860},deviceScaleFactor:1});
 const page=await context.newPage();watchNetwork(page,'star-'+width);
 try{
  const resp=await page.goto(SITE+'/what-stars-say.html',{waitUntil:'domcontentloaded',timeout:40000});
  assert.equal(resp.status(),200);
  await waitCatalog(page,'star-'+width);
  await page.locator('#dv2-star-location-search').waitFor({state:'visible',timeout:8000});
  const input=page.locator('#dv2-star-location-search');
  await input.fill('Bangalore');
  const match=page.locator('#dv2-star-location-search-suggestions [role="option"]').filter({hasText:'Bengaluru / Bangalore'});
  assert.ok(await match.count()>0,'Star suggestions must include Bengaluru');
  const recordedCount=(await page.locator('#dv2-star-location-search-suggestions [role="option"]').count());
  stamp('star-'+width+'-place-discovery',{query:'Bangalore',suggestions:recordedCount});
  await input.fill('');
  for(const c of cases){
   const tag='star-'+width+'-'+c.id;
   try{
    if(c.selector)await chooseSuggestion(page,'dv2-star-location-search',c.query,c.selector,c.label,tag);
    if(c.coordinates){
      await page.locator('input[name="ag71c-star-location-mode"][value="coordinates"]').check();
      for(const [field,value] of Object.entries(c.coordinates))await page.locator('#'+field).fill(value);
    }else{
      await page.locator('input[name="ag71c-star-location-mode"][value="place"]').check();
    }
    await page.locator('#star-reflection-name').fill('QA Sample');
    await page.locator('#star-reflection-dob').fill(c.dob||'01/01/2000');
    if(c.unknown){
      // Some clients disable the exact-time input as soon as unknown is checked.
      // Clear while enabled, then mark time unknown; do not try to fill a disabled field.
      await page.locator('#star-birth-time-unknown').uncheck();
      await page.locator('#star-reflection-birth-time').fill('');
      await page.locator('#star-birth-time-unknown').check();
    }else{
      await page.locator('#star-birth-time-unknown').uncheck();
      await page.locator('#star-reflection-birth-time').fill(c.birth||'12:00');
    }
    const before=RECORD.httpRequests.filter(x=>x.scope==='star-'+width&&x.body.civil_date==='2000-01-01').length;
    await page.locator('[data-ag71e-preview-button="star-reflection"]').click();
    await page.waitForFunction(()=>{
       const b=document.querySelector('[data-ag71e-preview-button="star-reflection"]');
       const p=document.querySelector('[data-ag71e-preview-panel="star-reflection"]');
       const s=document.querySelector('[data-drishvara-v2-reflect-card="true"]')?.getAttribute('data-ag75d-e3-star-reflection-state');
       return !!p&&!p.hidden&&b?.getAttribute('aria-busy')!=='true'&&s&&s!=='loading';
    },null,{timeout:28000});
    const result=await page.evaluate(()=>({
     state:document.querySelector('[data-drishvara-v2-reflect-card="true"]')?.getAttribute('data-ag75d-e3-star-reflection-state'),
     heading:document.querySelector('[data-ag71e-preview-panel="star-reflection"] h3')?.textContent.trim(),
     rows:Array.from(document.querySelectorAll('[data-ag71e-preview-grid="star-reflection"] .ag71e-preview-row')).map(r=>({label:r.querySelector('strong')?.textContent.trim(),value:r.querySelector('span')?.textContent.trim()})),
     selectedLocation:document.getElementById('ag75d-e2-star-place-choice-panel')?.getAttribute('data-ag75d-e2-star-selected-location'),
     selectedTimezone:document.getElementById('ag75d-e2-star-place-choice-panel')?.getAttribute('data-ag75d-e2-star-selected-timezone')
    }));
    const after=RECORD.httpRequests.filter(x=>x.scope==='star-'+width&&x.body.civil_date==='2000-01-01').length;
    if(c.wantNoRuntime)assert.equal(after,before,'Invalid local input must not call the astronomy API');
    assert.ok(c.allowed.includes(result.state),tag+': unexpected governed state '+result.state);
    if(c.unknown)assert.ok(!result.rows.some(x=>x.label==='Exact birth Nakshatra'),tag+': unknown time must not fabricate exact Nakshatra');
    if(c.selector)assert.equal(result.selectedLocation,c.selector);
    stamp(tag,{input:{dob:c.dob||'01/01/2000',birthTime:c.unknown?'unknown':c.birth||'12:00',selector:c.selector,coordinateMode:Boolean(c.coordinates)},...result,astrologyApiCalls:after-before});
   }catch(e){fail(tag,e?.stack||e);}
  }
  await page.screenshot({path:OUT+'/star-'+width+'.png',fullPage:true,timeout:25000});
 }catch(e){fail('star-'+width+'-initial',e?.stack||e)}
 finally{await page.close();await context.close()}
}
try{
 await runPanchang(1440,CATALOG);
 await runPanchang(390,[CATALOG[0],CATALOG[1],CATALOG[2],CATALOG[4],CATALOG[6]]);
 await runStar(1440,[
  {id:'unknown-bangalore',selector:'lgd-district-525',query:'Bangalore',label:'Bengaluru / Bangalore',unknown:true,allowed:['unknown_day_context','boundary_review_required']},
  {id:'exact-london',selector:'city-gn-2643743',query:'London',label:'London — England',birth:'12:00',allowed:['exact_window_resolved','boundary_review_required','missing_transition_metadata','exact_outside_single_transition_window']},
  {id:'invalid-date',dob:'31/02/2000',birth:'12:00',allowed:['invalid_input'],wantNoRuntime:true},
  {id:'invalid-time',dob:'01/01/2000',birth:'25:99',allowed:['invalid_input'],wantNoRuntime:true},
  {id:'unknown-coordinates',coordinates:{'star-birth-latitude':'51.50853','star-birth-longitude':'-0.12574','star-birth-timezone':'Europe/London','star-birth-coordinate-label':'QA London'},unknown:true,allowed:['unknown_day_context','boundary_review_required']}
 ]);
 await runStar(390,[
  {id:'unknown-township',selector:'bhawanathpur-township-jharkhand-india',query:'Bhawanathpur Township',label:'Bhawanathpur Township',unknown:true,allowed:['unknown_day_context','boundary_review_required']},
  {id:'exact-sydney',selector:'city-gn-2147714',query:'Sydney',label:'Sydney',birth:'12:00',allowed:['exact_window_resolved','boundary_review_required','missing_transition_metadata','exact_outside_single_transition_window']}
 ]);
}finally{await browser.close()}
RECORD.finishedAt=new Date().toISOString();
fs.writeFileSync(OUT+'/report.json',JSON.stringify(RECORD,null,2));
console.log('FINAL location-Star QA cases='+RECORD.cases.length+' failures='+RECORD.failures.length+' warnings='+RECORD.warnings.length);
for(const f of RECORD.failures)console.error('QA_FAILURE '+f.case+': '+f.detail.slice(0,200));
if(RECORD.failures.length)process.exitCode=1;
