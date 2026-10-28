import fs from 'node:fs';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {JSDOM} from 'jsdom';
import {resolvePanchangRequest} from '../supabase/functions/_shared/location-resolution.ts';
const additions=JSON.parse(gunzipSync(fs.readFileSync('data/location-releases/lgd-hq-20261026.json.gz')).toString()).records;
const original=JSON.parse(fs.readFileSync('data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json','utf8')).records;
const cities=JSON.parse(gunzipSync(fs.readFileSync('data/location-releases/city-restoration-20261028.json.gz')).toString()).records;
const rows=[...original,...additions,...cities].map(r=>({selector_value:r.selector_value,display_label:r.display_label,latitude:r.latitude,longitude:r.longitude,timezone:r.timezone,search_labels:r.search_labels,payload:r})).sort((a,b)=>a.selector_value.localeCompare(b.selector_value));
assert.equal(rows.length,3266);
const homonyms=additions.filter(r=>r.search_labels.includes('Aurangabad'));
assert.ok(homonyms.length>1);
assert.equal(resolvePanchangRequest({civil_date:'2026-10-26',place:'Aurangabad'},rows).ok,false);
assert.equal(resolvePanchangRequest({civil_date:'2026-10-26',selector_value:'lgd-subdistrict-1484'},rows).ok,true);
let serve:any;
(globalThis as any).Deno={env:{get:(key:string)=>key==='SUPABASE_URL'?'https://test.supabase.co':'test-key'},serve:(fn:any)=>{serve=fn;}};
const offsets:number[]=[];
globalThis.fetch=async(input:any)=>{
 const u=new URL(String(input)),table=u.pathname.split('/').at(-1);
 if(table==='drishvara_release_manifests')return Response.json([{release_id:'ag74p_final_2026_06_24',status:'active'}]);
 if(table==='drishvara_panchang_runtime_releases')return Response.json([{release_id:'ag74p_final_2026_06_24',runtime_release_id:'test',status:'active',no_input_persistence:true,public_ui_cutover_active:true}]);
 if(table==='drishvara_panchang_locations'){const start=Number(u.searchParams.get('offset')||0);offsets.push(start);const matching=u.searchParams.has('selector_value')?rows.filter(r=>'eq.'+r.selector_value===u.searchParams.get('selector_value')):rows;return Response.json(matching.slice(start,start+Number(u.searchParams.get('limit')||1000)));}
 if(table==='drishvara_panchang_daily_records'||table==='drishvara_festival_observances')return Response.json([]);
 throw Error('Unexpected table '+table);
};
await import('../supabase/functions/calculate-panchang/index.ts');
async function runtime(body:any){const r=await serve(new Request('https://runtime.test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));return {status:r.status,body:await r.json()};}
const catalog=await runtime({action:'locations'});assert.equal(catalog.status,200);assert.equal(catalog.body.record_count,3266);assert.ok(offsets.includes(2500));
for(const selector of ['varanasi-uttar-pradesh-india','lgd-subdistrict-1484','lgd-subdistrict-2496',rows.at(-1)!.selector_value,...cities.slice(-5).map((r:any)=>r.selector_value),'city-gn-2988507','city-gn-5128581']){
 const r=await runtime({mode:'named_location',civil_date:'2026-10-26',selector_value:selector});
 assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.location_basis.selector_value,selector);assert.equal(r.body.panchang.result.available,true);assert.equal(r.body.privacy.personal_data_persisted,false);
 if(selector.startsWith('lgd-')){assert.ok(r.body.location_basis.lgd_code);assert.ok([2011,2017,2022].includes(r.body.location_basis.source_dataset_epoch));}
}
const bad=await runtime({mode:'named_location',civil_date:'2026-10-26',selector_value:'unknown'});assert.equal(bad.status,422);
console.log('PASS: 3,266-record paginated backend catalog; named calculations including last page; source provenance; unknown and ambiguous names rejected.');
const sources=['assets/js/drishvara-v2-location.js','assets/js/sup02-panchang-server-controller.js'];
for(const page of ['panchang.html','what-stars-say.html']){
 const dom=new JSDOM(fs.readFileSync(page,'utf8'),{url:'https://www.drishvara.com/'+page,runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window as any;
 w.AbortSignal=AbortSignal;w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=async(url:string,options:any={})=>{
  if(url.startsWith('https://pajlab')){const result=await runtime(JSON.parse(options.body||'{}'));return Response.json(result.body,{status:result.status});}
  const p=String(url).split('?')[0];if(fs.existsSync(p))return Response.json(JSON.parse(fs.readFileSync(p,'utf8')));return new Response('{}',{status:404});
 };
 for(const p of ['assets/js/sup02-panchang-server-controller.js','assets/js/drishvara-v2-shell.js','assets/js/drishvara-v2-i18n.js','assets/js/drishvara-v2-location.js','assets/js/drishvara-v2-home.js',page==='panchang.html'?'assets/js/drishvara-v2-panchang.js':'assets/js/drishvara-v2-reflect.js'])w.eval(fs.readFileSync(p,'utf8'));
 await new Promise(r=>setTimeout(r,150));
 const api=w.DrishvaraV2Location;assert.equal((await api.loadApprovedLocations()).length,3266);
 assert.throws(()=>api.normaliseApprovedLocationPayload({...catalog.body,records:catalog.body.records.slice(1)}));
 const input=w.document.getElementById(page==='panchang.html'?'panchang-place-alias':'dv2-star-location-search');assert.ok(input);
 for(const [query,selector] of [['Banglore','lgd-district-525'],['Badauliya','lgd-village-254106'],['Bhawanthpur Township','bhawanathpur-township-jharkhand-india'],['London','city-gn-2643743'],['Paris','city-gn-2988507'],['New York','city-gn-5128581']]){
  input.value=query;input.dispatchEvent(new w.Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,30));
  const options=[...w.document.querySelectorAll('#'+input.id+'-suggestions [role=option]')];assert.ok(options.length,query+' suggests results');
  const expected=rows.find(r=>r.selector_value===selector);assert.ok(options.some((o:any)=>o.textContent.includes(expected!.display_label)),query+' includes correct identity');
 }
 input.value='Kutumba';input.dispatchEvent(new w.Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,30));
 const suggestion=w.document.querySelector('#'+input.id+'-suggestions [role=option]');assert.ok(suggestion,'search suggestion');input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
 if(page==='panchang.html'){assert.equal(w.document.getElementById('panchang-place-select').value,'lgd-subdistrict-1484');}
 else {assert.equal(w.drishvaraAg75dStarReflectionState().selectedLocation.selector_value,'lgd-subdistrict-1484');assert.equal(w.document.querySelectorAll('[data-ag75d-e2-star-place-value]').length,0);
  const dob=w.document.getElementById('star-reflection-dob');dob.value='10/02/1988';dob.dispatchEvent(new w.Event('input',{bubbles:true}));
  const time=w.document.getElementById('star-reflection-birth-time');time.value='10:05';time.dispatchEvent(new w.Event('input',{bubbles:true}));
  w.document.querySelector('[data-ag71e-preview-button="star-reflection"]').click();await new Promise(r=>setTimeout(r,150));
  const panel=w.document.querySelector('[data-ag75d-e3-star-reflection-result="active"]');assert.ok(panel);assert.ok(panel.textContent.includes('Kutumba'));assert.ok(panel.textContent.includes('LGD 1484'));assert.ok(!panel.textContent.includes('runtime_unavailable'));
  // Language changes must preserve search-selected place summaries after button removal.
  const hindi=w.document.querySelector('#reflect [data-dv2-language-choice="hi"]');assert.ok(hindi);hindi.click();
  await new Promise(r=>setTimeout(r,1700));
  assert.ok(w.document.getElementById('ag75d-e2-star-place-summary').textContent.includes('Kutumba'));
 }
 console.log('PASS: '+page+' typeahead selects full-catalog location.');dom.window.close();
}
// Legacy backend rollout fallback must not expose unactivated additions.
const fallback=new JSDOM('<html><body></body></html>',{runScripts:'outside-only'});const fw=fallback.window as any;fw.AbortSignal=AbortSignal;fw.fetch=async(url:string)=>url.startsWith('https:')?new Response('{}',{status:422}):Response.json({record_count:5,records:original});fw.eval(fs.readFileSync(sources[0],'utf8'));assert.equal((await fw.DrishvaraV2Location.loadApprovedLocations()).length,5);fallback.window.close();console.log('PASS: old/unavailable backend retains the original five approved choices.');
