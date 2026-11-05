// Read-only production smoke test for the shipped F3 Issue #9 optimization.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const out='f3-prod-smoke';
const URL='https://www.drishvara.com/panchang.html';
fs.mkdirSync(out,{recursive:true});
const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
assert.ok(chrome,'System Chromium required');
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const report={testedAt:new Date().toISOString(),url:URL,widths:[],errors:[]};

try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
  const page=await context.newPage();
  const result={width,calculationStartedMs:null,catalogueRespondedMs:null,displayedMs:null,locationCount:null,tithi:null,nakshatra:null,observance:null,requestState:null,renderStatus:null,versionedScript:null};
  const errors=[];const begin=Date.now();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{
   if(!req.url().includes('/functions/v1/calculate-panchang')||req.method()!=='POST')return;
   let body={};try{body=req.postDataJSON()||{}}catch{}
   if(body.mode==='named_location'&&result.calculationStartedMs===null)result.calculationStartedMs=Date.now()-begin;
  });
  page.on('response',res=>{
   if(!res.url().includes('/functions/v1/calculate-panchang')||res.request().method()!=='POST')return;
   let body={};try{body=res.request().postDataJSON()||{}}catch{}
   if(body.action==='locations')result.catalogueRespondedMs=Date.now()-begin;
  });
  try{
   const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:40000});
   assert.equal(response.status(),200,'Production Panchang must serve HTTP 200');
   result.versionedScript=await page.evaluate(()=>!!document.querySelector('script[src*="sup02-panchang-server-controller.js?v=20261105-parallel-startup"]'));
   assert.equal(result.versionedScript,true,'Production must serve updated startup controller query version');
   await page.waitForFunction(()=>document.getElementById('panchang-festival-card')?.getAttribute('data-sup02-result-state')==='calculated',null,{timeout:23000});
   result.displayedMs=Date.now()-begin;
   result.tithi=(await page.locator('#panchang-tithi').textContent()).trim();
   result.nakshatra=(await page.locator('#panchang-nakshatra').textContent()).trim();
   result.requestState=await page.locator('#panchang-festival-card').getAttribute('data-sup02-request-state');
   result.renderStatus=(await page.locator('#panchang-selection-status').textContent()).trim();
   assert.ok(result.calculationStartedMs!==null,'Default named-location calculation request must be sent');
   assert.ok(result.calculationStartedMs<4000,'Default calculation must begin promptly, without waiting for catalogue');
   assert.match(result.renderStatus,/Server-governed Panchang displayed|Calculated with the approved profile/i);
   assert.match(result.tithi,/\(\d+\)/);
   await page.waitForFunction(()=>document.querySelector('#panchang-place-select')?.options.length===3266,null,{timeout:26000});
   result.locationCount=await page.locator('#panchang-place-select option').count();
   assert.equal(result.locationCount,3266,'All approved locations remain available');
   assert.ok(result.catalogueRespondedMs!==null,'Approved catalog must still load');
   assert.ok(result.calculationStartedMs<result.catalogueRespondedMs,'Default calculation must precede full catalogue response');
   const book=(await page.locator('#ag74o-book-status').textContent()).trim();
   assert.ok(book.length>0&&!/unavailable|loading/i.test(book),'Approved annual book must load after daily calculation');
   assert.equal(errors.length,0,'No uncaught JavaScript errors: '+errors.join(' | '));
   await page.screenshot({path:out+'/panchang-production-'+width+'.png',fullPage:true,animations:'disabled'});
  }catch(e){report.errors.push(width+'px: '+String(e).slice(0,600));}
  finally{report.widths.push(result);await context.close();}
 }
}finally{await browser.close()}
fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));
report.widths.forEach(s=>console.log('PROD_QA '+JSON.stringify(s)));
console.log('PROD_QA failures='+report.errors.length);
report.errors.forEach(s=>console.error('FAIL '+s));
if(report.errors.length)process.exitCode=1;
