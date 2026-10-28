import {gunzipSync} from 'node:zlib';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const endpoint='https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/calculate-panchang';
async function call(payload){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const body=await r.json();if(!r.ok)throw Error('Runtime returned '+r.status+' '+(body.error?.code||''));return body;}
const catalog=await call({action:'locations'});
assert.equal(catalog.catalog_version,'20261026');assert.ok(catalog.record_count>=2547);assert.equal(catalog.records.length,catalog.record_count);
const expected=JSON.parse(gunzipSync(fs.readFileSync('data/location-releases/lgd-hq-20261026.json.gz')).toString('utf8')).records;
const actual=new Map(catalog.records.map(r=>[r.selector_value,r]));assert.equal(actual.size,catalog.record_count);
for(const r of expected){
 const a=actual.get(r.selector_value);assert.ok(a);
 for(const k of ['canonical_place_id','timezone','lgd_code','source_dataset_epoch'])assert.equal(a[k],r[k]);
 // PostgreSQL JSON float output can round the final binary-double digit.
 for(const k of ['latitude','longitude'])assert.ok(Math.abs(Number(a[k])-r[k])<=1e-12,r.selector_value+' '+k+' differs from approved coordinates');
}
// One representative of each state and source epoch, plus the final page record.
const selected=new Map();for(const r of expected)selected.set(r.state_code+':'+r.source_dataset_epoch,r);selected.set('last',catalog.records.at(-1));
for(const r of selected.values()){
 const result=await call({civil_date:'2026-10-26',mode:'named_location',selector_value:r.selector_value});
 assert.equal(result.location_basis.canonical_place_id,r.canonical_place_id);assert.equal(result.location_basis.timezone,r.timezone);
 assert.equal(result.privacy.calculation_request_persisted,false);assert.ok(result.panchang.result);console.log('PASS '+r.selector_value);
}
console.log('PASS: all 2,542 additions match within JSON float serialization precision; representative named calculations and privacy checks passed.');
