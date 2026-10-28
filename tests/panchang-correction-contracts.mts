import fs from 'node:fs';import {gunzipSync} from 'node:zlib';import assert from 'node:assert/strict';
import {calculatePanchangDay,decoratePanchangResult} from '../supabase/functions/_shared/panchang-runtime.ts';
const catalog=({record_count:3266,records:[...JSON.parse(fs.readFileSync('data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json')).records,...JSON.parse(gunzipSync(fs.readFileSync('data/location-releases/lgd-hq-20261026.json.gz'))).records,...JSON.parse(gunzipSync(fs.readFileSync('data/location-releases/city-restoration-20261028.json.gz'))).records]});
const varanasi=catalog.records.find((r:any)=>r.selector_value==='varanasi-uttar-pradesh-india');
let stored:any=JSON.parse(fs.readFileSync('data/quality/panchang-independent-verification/20261028/varanasi-live.json','utf8')).panchang.result;
let serve:any,locations=catalog.records;
(globalThis as any).Deno={env:{get:(k:string)=>k==='SUPABASE_URL'?'https://test.supabase.co':'test-key'},serve:(fn:any)=>{serve=fn;}};
globalThis.fetch=async(input:any)=>{
 const u=new URL(String(input)),table=u.pathname.split('/').at(-1);
 if(table==='drishvara_release_manifests')return Response.json([{release_id:'test',status:'active'}]);
 if(table==='drishvara_panchang_runtime_releases')return Response.json([{release_id:'test',runtime_release_id:'test',status:'active',no_input_persistence:true,public_ui_cutover_active:true}]);
 if(table==='drishvara_panchang_locations'){let records=locations.filter((r:any)=>!u.searchParams.has('selector_value')||'eq.'+r.selector_value===u.searchParams.get('selector_value'));const start=Number(u.searchParams.get('offset')||0);return Response.json(records.slice(start,start+Number(u.searchParams.get('limit')||500)).map((r:any)=>({...r,payload:r})));}
 if(table==='drishvara_panchang_daily_records')return Response.json([{payload:{runtime_result:stored},content_hash:'approved-bank-hash'}]);
 if(table==='drishvara_festival_observances')return Response.json([]);
 throw Error('Unexpected read '+table);
};
await import('../supabase/functions/calculate-panchang/index.ts');
async function call(body:any={}){const res=await serve(new Request('https://runtime.test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({civil_date:'2026-10-28',selector_value:varanasi.selector_value,...body})}));return {status:res.status,body:await res.json()};}
const unchanged=JSON.stringify(stored),first=await call();assert.equal(first.status,200);assert.equal(first.body.panchang.source,'approved_server_calculation');assert.equal(first.body.panchang.precomputed_fallback.content_hash,'approved-bank-hash');assert.equal(JSON.stringify(stored),unchanged);
for(const type of ['tithi','nakshatra','yoga','karana'])for(const side of ['previous','next'])assert.ok(first.body.panchang.result.transitions[type][side].utc);
stored=first.body.panchang.result;const complete=await call();assert.equal(complete.body.panchang.source,'approved_precomputed_record');assert.equal(complete.body.panchang.precomputed_fallback,null);
stored={available:false,reason:'governed_unavailable'};const withheld=await call();assert.equal(withheld.body.panchang.source,'approved_precomputed_record');assert.equal(withheld.body.panchang.result.available,false);
assert.equal((await call({selector_value:'unknown'})).status,422);
locations=locations.map((r:any)=>r.selector_value===varanasi.selector_value?{...r,coordinate_approved:false}:r);assert.equal((await call()).status,422);
const edge:any=calculatePanchangDay({civil_date:'1900-01-02',latitude:9.02497,longitude:38.74689,timezone:'Africa/Addis_Ababa'});assert.equal(edge.precision.requires_review,true);assert.ok(edge.precision.affected_elements.some((x:any)=>x.element==='nakshatra'));assert.equal(edge.elements.nakshatra.index,21);
for(const seconds of [59.999,60,60.001]){const fixture=structuredClone(edge);fixture.transitions={nakshatra:{previous:{utc:new Date(Date.parse(edge.sunrise.utc)-seconds*1000).toISOString()}}};const decorated:any=decoratePanchangResult(fixture,'Africa/Addis_Ababa');assert.equal(decorated.precision.requires_review,seconds<=60);}
for(const pair of Object.values(edge.transitions) as any[])for(const ev of Object.values(pair) as any[]){assert.ok(Math.abs(Date.parse(ev.local)-Date.parse(ev.utc))<1000);assert.match(ev.local_exact,/\+02:27:16$/);assert.equal(ev.utc_offset_seconds,8836);}
console.log('PASS: incomplete approved records use governed calculator; complete/unavailable records retained; no bank mutation; approval/unknown guards preserved; exact historical stamps and review thresholds pass.');
