import fs from 'node:fs';import crypto from 'node:crypto';import os from 'node:os';import path from 'node:path';import {coreHash} from './panchang-core-hash.mjs';import assert from 'node:assert/strict';import {gunzipSync} from 'node:zlib';
import {calculatePanchangDay} from '../supabase/functions/_shared/panchang-runtime.ts';
const matrix=gunzipSync(fs.readFileSync('data/quality/panchang-independent-verification/20261028/case-matrix.jsonl.gz')).toString().trim().split('\n').map(JSON.parse);
const baseline=JSON.parse(fs.readFileSync('data/quality/panchang-independent-verification/20261028/corrections/core-result-baseline.json'));assert.equal(matrix.length,baseline.cases);assert.equal(crypto.createHash('sha256').update(fs.readFileSync('data/quality/panchang-independent-verification/20261028/case-matrix.jsonl.gz')).digest('hex'),baseline.case_matrix_sha256);const hashes=[];
const output=process.argv[2]||path.join(os.tmpdir(),'drishvara-panchang-corrections-20261028');fs.mkdirSync(output,{recursive:true});fs.copyFileSync('data/quality/panchang-independent-verification/20261028/plan.json',path.join(output,'plan.json'));const file=fs.openSync(path.join(output,'production-cases.jsonl'),'w');let available=0,review=0,timestamps=0;
function exactTimestamp(s){const m=s.match(/^(.*?)([+-])(\d{2}):(\d{2})(?::(\d{2}))?$/);assert.ok(m,s);return Date.parse(m[1]+'Z')-(m[2]==='+'?1:-1)*(+m[3]*3600 + +m[4]*60 + +(m[5]||0))*1000;}
function check(event){if(!event)return;assert.ok(Math.abs(Date.parse(event.local)-Date.parse(event.utc))<1000);assert.ok(Math.abs(exactTimestamp(event.local_exact)-Date.parse(event.utc))<1000);timestamps++;}
for(let i=0;i<matrix.length;i++){
 const c=matrix[i],result=calculatePanchangDay({civil_date:c.date,latitude:c.latitude,longitude:c.longitude,timezone:c.timezone});
 hashes.push({selector:c.selector,date:c.date,sha256:coreHash(result)});
 if(result.available){available++;check(result.sunrise);check(result.sunset);
  for(const type of ['tithi','nakshatra','yoga','karana'])for(const side of ['previous','next']){const event=result.transitions[type][side];check(event);}
  for(const [uk,lk,ek] of [['start_utc','start_local','start_local_exact'],['end_utc_exclusive','end_local_exclusive','end_local_exact_exclusive']]){assert.ok(Math.abs(Date.parse(result.window[lk])-Date.parse(result.window[uk]))<1000);assert.ok(Math.abs(exactTimestamp(result.window[ek])-Date.parse(result.window[uk]))<1000);timestamps++;}
  if(result.precision.requires_review)review++;
  if(c.selector==='city-gn-344979'&&c.date==='1900-01-02')assert.ok(result.precision.affected_elements.some(x=>x.element==='nakshatra'));
 }
 fs.writeSync(file,JSON.stringify({...c,result})+'\n');
}
fs.closeSync(file);const aggregate=crypto.createHash('sha256').update(JSON.stringify(hashes)).digest('hex');assert.equal(aggregate,baseline.core_result_set_sha256);const summary={cases:matrix.length,available,unavailable:matrix.length-available,element_indices_and_angles_unchanged:true,utc_event_times_unchanged:true,timestamps_checked:timestamps,timestamp_consistency_failures:0,cases_with_explicit_precision_notice:review};fs.writeFileSync(path.join(output,'matrix-summary.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
