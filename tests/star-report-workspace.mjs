import assert from 'node:assert/strict';
import fs from 'node:fs';
import demo from '../data/demo/what-stars-say-report.json' with {type:'json'};
assert.equal(demo.synthetic_demo_only,true);assert.equal(demo.personal_report_enabled,false);
for(const s of Object.values(demo.scenarios))for(const v of Object.values(s.views)){
 assert.equal(v.publicOutputPermitted,false);assert.equal(v.quality.readyForPublicDisplay,false);
 assert.equal(v.planets.length,9);assert.equal(v.strength.planets.length,7);assert.equal(v.ruleBank.entries.length,38);
 assert.equal(v.dashas.every(d=>d.start===null&&d.end===null),true);
 assert.deepEqual(v.windows,{relationships:[],work:[]});
}
assert.equal(demo.scenarios.complete.views.en.charts.D9.rows.length,12);
assert.equal(demo.scenarios.boundary.views.en.charts.D9.rows.length,0);
assert.equal(fs.readFileSync('assets/js/drishvara-chart-diagram.mjs','utf8'),fs.readFileSync('scripts/lib/wss07-chart-diagram.mjs','utf8'));
const client=fs.readFileSync('assets/js/drishvara-report-workspace.mjs','utf8');
assert.doesNotMatch(client,/star-reflection-name|star-reflection-dob|localStorage|sessionStorage|calculate-panchang/);
console.log('PASS fixed synthetic scenarios, retained publication gates, boundary withholding, canonical diagram and user-input separation');

const {selectedReportContext,themeContextStatus}=await import('../assets/js/drishvara-report-context.mjs');
assert.equal(demo.matching.method,null);assert.equal(demo.matching.score,null);assert.equal(demo.matching.rating,null);
assert.equal(demo.matching.personal_input_enabled,false);assert.equal(demo.matching.consent_required_for_personal_use,true);
assert.equal(demo.matching.profiles.length,2);
for(const sample of Object.values(demo.scenarios)){
 for(const language of ['en','hi'])for(const key of ['2026-11-21','2026-11-22']){
  const day=selectedReportContext(sample.contexts,'day',key,language);
  assert.equal(day.start,key);assert.equal(day.changeCount,null);assert.equal(day.snapshot.dasha,null);
 }
 for(const kind of ['month','year'])for(const key of Object.keys(sample.contexts[kind])){
  const c=selectedReportContext(sample.contexts,kind,key);
  assert.ok(c.start.startsWith(key));assert.ok(c.samples>=28);
  assert.equal(sample.contexts[kind][key].ready_for_prediction,false);
  assert.equal(sample.contexts[kind][key].exact_ingresses_calculated,false);
 }
 const c=selectedReportContext(sample.contexts,'year','2027');
 const status=themeContextStatus(sample.views.en.domains.find(d=>d.id==='work'),c);
 assert.equal(status.periodKey,'2027');assert.equal(status.supportiveAssessment,null);assert.equal(status.eventWindow,null);assert.equal(status.ready_for_prediction,false);
 assert.equal(themeContextStatus(null,c).state,'withheld_natal_or_divisional_basis');
 assert.throws(()=>selectedReportContext(sample.contexts,'year','2028'),/Available/);
 assert.notDeepEqual(sample.contexts.day['2026-11-21'].en.grahas,sample.contexts.day['2026-11-22'].en.grahas);
}
console.log('PASS unassigned matching score and two-person consent contract; dated contexts and withheld support assessments');
