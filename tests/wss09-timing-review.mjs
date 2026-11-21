import assert from 'node:assert/strict';
import R from '../data/methodology/jyotisha/wss09-timing-source-register-v1.json' with {type:'json'};
import {evaluateTransitVedha,evaluateTimingReview} from '../scripts/lib/wss09-timing-review.mjs';
import {assembleKundaliReportCandidate} from '../scripts/lib/wss07-kundali-report-candidate.mjs';
import {auditNatalPrecisionCandidate} from '../scripts/lib/wss08-natal-precision-audit.mjs';
const names=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
const snapshot=positions=>({status:'wss05_06_candidate_structured_context_not_prediction',ready_for_prediction:false,sampling_policy:'local_12_00_daily_snapshot_not_full_day_event_resolution',grahas:names.map(g=>({graha:g,transit_rashi_index:positions[g]||2,longitude_sidereal_degrees:((positions[g]||2)-1)*30+15}))});
let pairs=0;
for(const rule of R.transit_rules){
 for(const [h,v] of Object.entries(rule.pairs)){
  const target=Number(h),vedha=v;
  // Isolate each pair with all other grahas outside its vedha house.
  const safe=vedha===1?2:1;
  const positions=Object.fromEntries(names.map(n=>[n,safe]));positions[rule.graha]=target;
  const check=p=>evaluateTransitVedha({snapshot:snapshot(p),natalMoonSign:1}).entries.find(e=>e.graha===rule.graha);
  assert.equal(check(positions).state,'listed_position_without_classical_vedha');
  const blocker=names.find(n=>n!==rule.graha&&!rule.exempt_blockers.includes(n)&&!['Rahu','Ketu'].includes(n));
  assert.equal(check({...positions,[blocker]:vedha}).state,'classical_vedha_present');
  for(const exempt of rule.exempt_blockers)assert.equal(check({...positions,[exempt]:vedha}).state,'listed_position_without_classical_vedha');
  assert.equal(check({...positions,Rahu:vedha}).state,'node_obstruction_lineage_review');pairs++;
 }
}
assert.equal(pairs,36);
assert.equal(R.transit_rules.find(r=>r.graha==='Mercury').pairs['11'],12);
const boundary=snapshot({});boundary.grahas[0].longitude_sidereal_degrees=30.01;
assert.equal(evaluateTransitVedha({snapshot:boundary,natalMoonSign:1}).state,'withheld_transit_sign_boundary');
assert.equal(evaluateTransitVedha({snapshot:snapshot({}),natalMoonSign:null}).entries.length,0);
const bad=snapshot({});bad.grahas[0].transit_rashi_index=3;
assert.throws(()=>evaluateTransitVedha({snapshot:bad,natalMoonSign:1}),/disagreement/);
const setup={birthDate:'1991-08-17',birthTime:'10:05:23',birthTimezone:'Asia/Kolkata',birthLatitude:23.3441,birthLongitude:85.3096,referenceDate:'2026-11-21',referenceTimezone:'Asia/Kolkata',referenceLatitude:23.3441,referenceLongitude:85.3096,timePrecisionSeconds:1,yearConvention:'civil_365_25'};
const report=assembleKundaliReportCandidate(setup),audit=auditNatalPrecisionCandidate({...setup,declaredPrecisionSeconds:1});
for(const language of ['en','hi']){
 const v=evaluateTimingReview({report,precisionAudit:audit,language});
 assert.equal(v.ready_for_public_predictions,false);assert.equal(v.independent_scholar_review,false);
 assert.equal(v.transit.entries.length,7);assert.equal(v.inception.samples,5);
 assert.equal(v.career.outcome,null);assert.equal(v.marriage.event_window,null);
 assert.ok(['partial_natal_period_and_Jupiter_factors_only','withheld_lagna_period_or_division'].includes(v.marriage.state));
 if(language==='hi')assert.match(v.notice,/विद्वत्/);
}
// A qualified synthetic seventh-lord D9 enables the full supported factor list.
const qualified=structuredClone(report),qa=structuredClone(audit);
const lords=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const h7=(report.charts.D1.lagna.rashi_index+5)%12+1,seventhLord=lords[h7-1];
Object.assign(qualified.charts.D9.grahas.find(g=>g.graha===seventhLord),{state:'candidate_numeric',rashi_index:1});
qa.grahas.find(g=>g.graha===seventhLord).D9='Mesha';
assert.ok(evaluateTimingReview({report:qualified,precisionAudit:qa}).marriage.candidates.length>=3);
// Caller envelope tampering cannot authorize an active period.
const tamper=structuredClone(report);tamper.dasha_uncertainty={status:'fake',periods:[]};
assert.deepEqual(evaluateTimingReview({report:tamper,precisionAudit:audit}).period,evaluateTimingReview({report,precisionAudit:audit}).period);
const uncertain=structuredClone(audit);uncertain.janma_nakshatra=null;
const v=evaluateTimingReview({report,precisionAudit:uncertain});
assert.equal(v.period.major_lord,null);assert.equal(v.inception.positions.length,0);assert.equal(v.marriage.candidates.length,0);
const mismatch=structuredClone(audit);mismatch.audit_basis.birth_longitude=0;
assert.throws(()=>evaluateTimingReview({report,precisionAudit:mismatch}),/does not match/);
assert.ok(R.sources[0].pages.every(p=>/^[0-9a-f]{64}$/.test(p.image_sha256)&&p.visually_checked));
assert.equal(R.publication_approved,false);
console.log(`PASS ${pairs} vedha pairs: empty, blocked, exempt and node-review cases; Mercury 11→12; boundary, inception, EN/HI and cross-birth gates`);
