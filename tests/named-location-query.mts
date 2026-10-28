import fs from 'node:fs';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
const records=JSON.parse(gunzipSync(fs.readFileSync('data/location-releases/city-restoration-20261028.json.gz'))).records;
const rows=records.map(r=>({selector_value:r.selector_value,display_label:r.display_label,latitude:r.latitude,longitude:r.longitude,timezone:r.timezone,search_labels:r.search_labels,payload:r}));
let serve:any;const calls:any[]=[];
(globalThis as any).Deno={env:{get:(k:string)=>k==='SUPABASE_URL'?'https://test.supabase.co':'test-key'},serve:(fn:any)=>{serve=fn}};
globalThis.fetch=async(input:any)=>{
 const u=new URL(String(input)),table=u.pathname.split('/').at(-1);calls.push({table,filter:u.searchParams.get('selector_value'),offset:u.searchParams.get('offset')});
 if(table==='drishvara_release_manifests')return Response.json([{release_id:'test',status:'active'}]);
 if(table==='drishvara_panchang_runtime_releases')return Response.json([{release_id:'test',runtime_release_id:'test',status:'active',no_input_persistence:true,public_ui_cutover_active:true}]);
 if(table==='drishvara_panchang_locations'){
  let selected=rows;if(u.searchParams.has('selector_value'))selected=rows.filter(r=>'eq.'+r.selector_value===u.searchParams.get('selector_value'));
  const start=Number(u.searchParams.get('offset')||0);return Response.json(selected.slice(start,start+Number(u.searchParams.get('limit')||1000)));
 }
 if(table==='drishvara_panchang_daily_records'||table==='drishvara_festival_observances')return Response.json([]);
 throw Error('unexpected table '+table);
};
await import('../supabase/functions/calculate-panchang/index.ts');
async function run(body:any){calls.length=0;const res=await serve(new Request('https://runtime.test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));return {status:res.status,body:await res.json(),calls:[...calls]};}
for(const selector of ['lgd-district-525','lgd-village-254106','bhawanathpur-township-jharkhand-india','city-gn-2643743']){
 const r=await run({civil_date:'2026-10-28',selector_value:selector});assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.panchang.result.available,true);assert.equal(r.body.location_basis.selector_value,selector);
 const reads=r.calls.filter(x=>x.table==='drishvara_panchang_locations');assert.equal(reads.length,1);assert.equal(reads[0].filter,'eq.'+selector);
}
assert.equal((await run({civil_date:'2026-10-28',selector_value:'missing'})).status,422);
assert.equal((await run({civil_date:'2026-10-28',selector_value:'lgd_district_525_hq'})).status,200);
const catalog=await run({action:'locations'});assert.equal(catalog.body.record_count,719);assert.equal(catalog.calls.filter(x=>x.table==='drishvara_panchang_locations').length,2);
const free=await run({civil_date:'2026-10-28',place:'Bangalore'});assert.equal(free.status,200);assert.ok(free.calls.some(x=>x.offset==='500'));
const i=rows.findIndex(r=>r.selector_value==='lgd-village-254106');rows[i]={...rows[i],payload:{...rows[i].payload,coordinate_approved:false}};assert.equal((await run({civil_date:'2026-10-28',selector_value:'lgd-village-254106'})).status,422);
console.log('PASS: exact named reads use one query; full catalog and alias fallback retain pagination; unknown/unapproved identities rejected.');
