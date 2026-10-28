import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const endpoint='https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/calculate-panchang';
async function call(body){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json();assert.equal(r.status,200);return j;}
const expected=JSON.parse(gunzipSync(fs.readFileSync('data/location-releases/city-restoration-20261028.json.gz'))).records;
const catalog=await call({action:'locations'});assert.equal(catalog.record_count,3266);assert.equal(catalog.records.length,3266);
const actual=new Map(catalog.records.map(r=>[r.selector_value,r]));assert.equal(actual.size,3266);
for(const r of expected){const a=actual.get(r.selector_value);assert.ok(a);for(const k of ['canonical_place_id','timezone','coordinate_basis','coordinate_source_authority_type'])assert.equal(a[k],r[k]);for(const k of ['latitude','longitude'])assert.ok(Math.abs(Number(a[k])-r[k])<=1e-12);}
for(const selector of ['lgd-district-525','lgd-village-254106','lgd-village-347166','bhawanathpur-township-jharkhand-india','city-gn-2643743','city-gn-2988507','city-gn-5128581','city-gn-1880252','city-gn-2147714']){
 const r=await call({mode:'named_location',selector_value:selector,civil_date:'2026-10-28'});assert.equal(r.location_basis.selector_value,selector);assert.equal(r.privacy.calculation_request_persisted,false);assert.ok(r.panchang.result);console.log('PASS '+selector);
}
console.log('PASS: 719 additions match live; total 3266; named calculations and privacy checks passed.');
