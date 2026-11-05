import assert from "node:assert/strict";
import fs from "node:fs";
import {chromium} from "playwright-core";
import {assembleKundaliReportCandidate} from "../scripts/lib/wss07-kundali-report-candidate.mjs";
import {buildBilingualCandidateView,languagePack,SIGN_HI,GRAHA_HI} from "../scripts/lib/wss07-bilingual-report-presenter.mjs";
import {RECORDS,resolveName} from "../scripts/lib/wss07-nama-rashi-core.mjs";

const out="wss07-preview-qa";
fs.mkdirSync(out,{recursive:true});
const example=assembleKundaliReportCandidate({
 birthDate:"1991-08-17",birthTime:"10:05:23",birthTimezone:"Asia/Kolkata",
 birthLatitude:23.3441,birthLongitude:85.3096,
 referenceDate:"2026-11-05",referenceTimezone:"Asia/Kolkata",
 referenceLatitude:23.3441,referenceLongitude:85.3096,
 timePrecisionSeconds:1,yearConvention:"civil_365_25"
});
assert.equal(example.ready_for_public_display,false);
assert.equal(RECORDS.length,108);
assert.equal(SIGN_HI.length,12);
assert.equal(Object.keys(GRAHA_HI).length,9);
for(const language of ["en","hi"]){
 const view=buildBilingualCandidateView({report:example,displayName:"विकास",
  language,nameSignConsent:true});
 assert.equal(view.status,"staged_nonpublic_english_hindi_chart_report");
 assert.equal(view.internal_ready,false);
 assert.equal(view.person.displayName,"विकास");
 assert.equal(view.person.nameSign.state,"traditional_name_sign");
 assert.equal(view.person.nameSign.rashiIndex,2);
 assert.equal(view.charts.D1.rows.length,12);
 assert.equal(view.planets.length,9);
 assert.equal(view.dashas.length,10);
 assert.equal(view.transit.grahas.length,9);
 assert.equal(view.domains.length,6);
 assert.equal(view.privacy.name_sent_astronomically,false);
 assert.ok(view.limits===undefined);
 assert.ok(view.limitations.some(s=>s.length>30));
 if(language==="hi"){
  assert.equal(view.person.nameSign.sign,"वृषभ");
  assert.equal(view.strings.charts,"कुंडली चक्र");
  assert.equal(view.planets[0].planet,"सूर्य");
 }else{
  assert.equal(view.person.nameSign.sign,"Vrishabha");
  assert.equal(view.strings.charts,"Charts");
  assert.equal(view.planets[0].planet,"Sun");
 }
 const withoutConsent=buildBilingualCandidateView({report:example,displayName:"विकास",
  language,nameSignConsent:false});
 assert.equal(withoutConsent.person.nameSign.sign,null);
}
assert.equal(resolveName("Tapan").state,"confirm_sound");
const ambiguity=buildBilingualCandidateView({report:example,displayName:"Tapan",
  language:"en",nameSignConsent:true});
assert.equal(ambiguity.person.nameSign.state,"confirmation_required");
assert.equal(ambiguity.person.nameSign.candidates.length,2);
assert.equal(ambiguity.person.nameSign.sign,null);
assert.throws(()=>buildBilingualCandidateView({report:example,displayName:"NAME",language:"fr"}),RangeError);
assert.throws(()=>buildBilingualCandidateView({report:{...example,ready_for_public_display:true},displayName:"NAME"}),RangeError);
console.log("PASS WSS07 bilingual model EN/HI, 108-pada local name sign, 9 grahas and no public activation");

const chrome=["/usr/bin/google-chrome","/usr/bin/google-chrome-stable","/usr/bin/chromium"].find(p=>fs.existsSync(p));
assert.ok(chrome,"System Chrome required");
const browser=await chromium.launch({headless:true,executablePath:chrome,args:["--no-sandbox","--disable-dev-shm-usage"]});
const audit={title:"WSS07 staging bilingual private UX",created_at:new Date().toISOString(),checks:[],failures:[],errors:[]};
for(const width of [1440,390,320]){
 const ctx=await browser.newContext({viewport:{width,height:860},deviceScaleFactor:1});
 const page=await ctx.newPage();
 // Reproduce the existing approved runtime catalog contract entirely in
 // memory. No new location API or subscriber inputs leave this test.
 await page.addInitScript(()=>{
   const approvals={
     canonical_place_approved:true,coordinate_approved:true,
     timezone_approved:true,public_selection_approved:true,
     computation_approved:true,public_output_allowed:true
   };
   const make=(id,label,lat,lon,tz,aliases=[])=>({
     selectorValue:id,canonicalPlaceId:id,displayLabel:label,
     latitude:lat,longitude:lon,timezone:tz,searchLabels:aliases,
     source:{...approvals,search_labels:aliases}
   });
   const known=[
     make("ranchi-jharkhand-india","Ranchi",23.3441,85.3096,"Asia/Kolkata",["ranchi"]),
     make("lgd-district-525","Bengaluru / Bangalore — Bengaluru Urban headquarters, Karnataka, India",12.9783682911028,77.5950551098096,"Asia/Kolkata",["bangalore","bengaluru"]),
     make("lgd-village-254106","Bedauliya — village, Aurangabad, Bihar, India",24.6433423812615,84.1910320664735,"Asia/Kolkata",["badauliya","बेदौलिया"]),
     make("bhawanathpur-township-jharkhand-india","Bhawanathpur Township — Durga Mandir reference, Garhwa, Jharkhand, India",24.3912148,83.6053036,"Asia/Kolkata",["bhawanathpur"]),
     make("qa-synthetic-high-latitude","Synthetic northern reference",72.5,11.1,"Europe/Oslo")
   ];
   const entries=[...known,...Array.from({length:3266-known.length},(_,i)=>
     make("qa-place-"+i,"QA synthetic location "+i,20+(i%30)*.01,70+(i%25)*.01,"Asia/Kolkata"))];
   window.DrishvaraV2Location={loadApprovedLocations:async()=>entries};
 });
 const incoming=[];
 page.on("request",req=>incoming.push({url:req.url(),method:req.method()}));
 page.on("pageerror",e=>audit.errors.push(width+": "+e.message));
 try{
  const resp=await page.goto("http://127.0.0.1:8899/index.html",{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(resp.status(),200);
  await page.locator("#wss-generate").waitFor({state:"visible"});
  assert.equal(await page.locator("#wss-nama-consent").isChecked(),false);
  await page.locator("#wss-name").fill("विकास");
  await page.locator("#wss-birth-date").fill("1991-08-17");
  await page.locator("#wss-birth-time").fill("10:05:23");
  await page.locator('#wss-catalog-status[data-catalog-status="approved_3266"]').waitFor({state:"attached"});
  assert.equal(await page.locator("#wss-place-search").isEnabled(),true);
  await page.locator("#wss-place-search").fill("BANGALORE");
  assert.equal(await page.locator("#wss-birth-place").isEnabled(),true);
  assert.equal(await page.locator('#wss-birth-place option[value="lgd-district-525"]').count(),1);
  assert.equal(await page.locator("#wss-birth-place").inputValue(),"",
    "Alias search must never auto-select a birthplace");
  await page.locator("#wss-place-search").fill("ranchi");
  await page.locator("#wss-birth-place").selectOption("ranchi-jharkhand-india");
  await page.locator("#wss-reference-date").fill("2026-11-05");
  await page.locator("#wss-year-convention").selectOption("civil_365_25");
  await page.locator("#wss-precision").selectOption("1");
  await page.locator("#wss-generate").click();
  assert.equal(await page.locator("#wss-error").textContent(),"",
    "Private calculation must not fail silently");
  await page.locator("#review-result .chart-grid").first().waitFor({state:"visible",timeout:12000});
  assert.equal(await page.locator("#review-result").getAttribute("data-staged-ready"),"false");
  assert.equal(await page.locator("#wss-precision-audit").getAttribute("data-public-ready"),"false");
  assert.match(await page.locator("#wss-precision-audit").innerText(),/Chart precision and release qualification/);
  assert.equal(await page.locator("#review-result .chart-wrapper").count(),3);
  assert.equal(await page.locator("#wss-month-period").getAttribute("data-days"),"30");
  assert.equal(await page.locator("#wss-year-period").getAttribute("data-days"),"365");
  assert.match(await page.locator("#wss-month-period").innerText(),/Monthly planetary changes/);
  assert.match(await page.locator("#wss-year-period").innerText(),/Yearly planetary changes/);
  assert.equal(await page.locator("#wss-source-evidence .domain").count(),5);
  assert.match(await page.locator("#wss-source-evidence").innerText(),/BJ_10_1/);
  assert.equal(await page.locator("#review-result .chart-wrapper").first().locator(".chart-house").count(),12);
  assert.equal(await page.locator("#review-result table.dasha tbody tr").count(),10);
  assert.equal(await page.locator("#review-result table.dasha").innerText().then(x=>/\d{4}-\d\d-\d\dT/.test(x)),false,
    "Unqualified exact Dasha dates must not appear");
  assert.match(await page.locator("#wss-precision-audit").innerText(),/Exact Daśā dates/);
  assert.match(await page.locator("#review-result").innerText(),/Marriage and career timing windows are withheld/);
  assert.match(await page.locator("#review-result").innerText(),/Krishna|Janma|Lagna|Not approved|not yet qualified|Candidate|Mesha|Vrishabha/i);
  await page.locator("#wss-nama-consent").check();
  assert.match(await page.locator("#review-result").innerText(),/Vrishabha/);
  const widthEN=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(widthEN<=3,"English horizontal overflow "+widthEN);
  await page.screenshot({path:out+"/preview-"+width+"-en.png",fullPage:true,animations:"disabled"});
  await page.locator('[data-language-choice="hi"]').click();
  assert.equal(await page.locator("html").getAttribute("lang"),"hi");
  assert.equal(await page.locator('[data-language-choice="hi"]').getAttribute("aria-pressed"),"true");
  assert.match(await page.locator("#wss-page-title").innerText(),/द्विभाषी कुंडली/);
  assert.match(await page.locator("#wss-precision-audit").innerText(),/कुंडली की सटीकता/);
  assert.match(await page.locator("#review-result").innerText(),/दशा की निश्चित तिथियाँ/);
  assert.match(await page.locator("#wss-source-evidence").innerText(),/व्यवसाय हेतु तीन परम्परागत संदर्भ/);
  assert.match(await page.locator("#wss-month-period").innerText(),/मासिक ग्रह-परिवर्तन/);
  assert.match(await page.locator("#wss-year-period").innerText(),/वार्षिक ग्रह-परिवर्तन/);
  assert.match(await page.locator("#wss-page-footer").innerText(),/ग्रह गणना/);
  assert.match(await page.locator("#wss-year-convention").innerText(),/नागरिक वर्ष/);
  assert.match(await page.locator("#wss-precision").innerText(),/सेकंड तक ज्ञात/);
  assert.equal(await page.locator('[data-precision-choice="approximate"]').evaluate(el=>el.disabled),true);
  assert.match(await page.locator("#review-result h2").first().innerText(),/कुंडली/);
  assert.match(await page.locator("#review-result").innerText(),/वृषभ/);
  assert.match(await page.locator("#wss-name-label").innerText(),/नाम/);
  const widthHI=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(widthHI<=3,"Hindi horizontal overflow "+widthHI);
  await page.screenshot({path:out+"/preview-"+width+"-hi.png",fullPage:true,animations:"disabled"});
  await page.locator("#wss-name").fill("Tapan");
  await page.locator("#wss-sound-wrap").waitFor({state:"visible"});
  assert.equal(await page.locator("#wss-syllable option").count(),3);
  const before=await page.locator("#review-result").innerText();
  assert.doesNotMatch(before,/नाम राशि\s*\n\s*सिंह/);
  await page.locator("#wss-syllable").selectOption("10-2");
  assert.match(await page.locator("#review-result").innerText(),/सिंह/);
  await page.locator("#wss-nama-consent").uncheck();
  assert.equal(await page.locator("#wss-sound-wrap").isVisible(),false);
  const noConsent=await page.locator("#review-result").innerText();
  assert.match(noConsent,/सहमति/);
  await page.locator("#wss-clear").click();
  assert.equal(await page.locator("#wss-name").inputValue(),"");
  assert.equal(await page.locator("#wss-place-search").inputValue(),"");
  assert.equal(await page.locator("#wss-birth-place").inputValue(),"");
  assert.equal(await page.locator("#wss-nama-consent").isChecked(),false);
  assert.equal(await page.locator("#review-result .panel").count(),0);
  assert.equal(incoming.filter(r=>r.method!=="GET").length,0,"No request bodies sent");
  assert.ok(incoming.every(r=>r.url.startsWith("http://127.0.0.1:8899/")),
    "No cross-origin requests allowed from staging preview");
  audit.checks.push({viewport:width,english:true,hindi:true,namaConsent:true,
   romanAmbiguity:true,reset:true,privateNoExternalRequests:true,
   horizontalOverflowEN:widthEN,horizontalOverflowHI:widthHI});
  console.log("PASS WSS07 private browser full workflow",width,"EN/HI and confirmed Nāma");
 }catch(e){
  const state=await page.locator("#wss-error").evaluate(node=>({
    errorClass:node.dataset.candidateErrorClass||null,
    errorDetail:node.dataset.candidateErrorDetail||null,
    errorText:node.textContent
  })).catch(()=>({errorClass:"unavailable",errorText:"unavailable"}));
  const shown=(await page.locator("#review-result").innerText().catch(()=>"")).slice(0,240);
  audit.failures.push(width+": "+String(e)+" status="+JSON.stringify(state));
  console.error("FAIL WSS07 viewport",width,String(e).slice(0,500),
    "candidate="+JSON.stringify(state),"view="+JSON.stringify(shown));
 }finally{await ctx.close()}
}
await browser.close();
fs.writeFileSync(out+"/report.json",JSON.stringify(audit,null,2));
console.log("WSS07_BROWSER_QA failures="+audit.failures.length+" errors="+audit.errors.length);
audit.errors.forEach(x=>console.error("JS_ERROR "+x));
if(audit.failures.length||audit.errors.length)process.exitCode=1;
