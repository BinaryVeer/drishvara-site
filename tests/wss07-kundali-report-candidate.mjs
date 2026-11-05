import assert from "node:assert/strict";
import {assembleKundaliReportCandidate,WSS07_STATUS,WSS07_RASHI_LORDS}
 from "../scripts/lib/wss07-kundali-report-candidate.mjs";
const input={
 birthDate:"1991-08-17",birthTime:"10:05:23",birthTimezone:"Asia/Kolkata",
 birthLatitude:24,birthLongitude:83,yearConvention:"civil_365_25",
 timePrecisionSeconds:1,referenceDate:"2026-11-05",
 referenceTimezone:"Europe/London",referenceLatitude:51.5,
 referenceLongitude:-0.12,yearsToReview:10
};
const report=assembleKundaliReportCandidate(input);
assert.equal(report.status,WSS07_STATUS);
assert.equal(report.ready_for_public_display,false);
assert.equal(report.name_used_for_calculation,false);
assert.equal(report.privacy.no_persistence_performed,true);
assert.equal(report.privacy.raw_inputs_not_sent_to_network,true);
assert.equal(report.charts.D1.grahas.length,9);
assert.equal(report.charts.D1.whole_sign_houses.length,12);
assert.equal(report.charts.D9.grahas.length,9);
assert.equal(report.charts.D10.grahas.length,9);
assert.equal(report.astronomical_birth_context.mahadashas.length,10);
assert.equal(report.astronomical_birth_context.date_specific_transits.grahas.length,9);
assert.equal(report.life_domain_observations.length,6);
assert.equal(WSS07_RASHI_LORDS.length,12);
assert.ok(report.traditional_time_windows_for_review.relationships.length>0);
assert.ok(report.traditional_time_windows_for_review.work.length>0);
for(const windows of Object.values(report.traditional_time_windows_for_review)){
 for(const w of windows){
  assert.equal(w.status,"traditional_review_window_not_a_forecast");
  assert.equal(w.probability,null);
  assert.equal(w.guaranteed_event,null);
  assert.equal(w.favorable_outcome,null);
  assert.ok(w.rule_ids.length>=2);
  assert.ok(Date.parse(w.review_end_exclusive_utc)>Date.parse(w.review_start_utc));
  assert.ok(Date.parse(w.review_start_utc)>=Date.parse(report.astronomical_birth_context.date_specific_transits.utc));
 }
}
assert.ok(report.unsupported_claims.some(x=>x.includes("marriage")));
assert.ok(report.interpretation_status.includes("source_approval"));
assert.ok(!Object.hasOwn(report,"name"));
console.log("PASS WSS07 full nonpublic D1/D9/D10 + 9-graha/Dasha/transit report");
console.log("PASS WSS07 traditionally reviewed windows",
 JSON.stringify(Object.fromEntries(Object.entries(report.traditional_time_windows_for_review).map(([k,v])=>[k,v.length]))));
assert.throws(()=>assembleKundaliReportCandidate({...input,name:"Synthetic Person"}),RangeError);
assert.throws(()=>assembleKundaliReportCandidate({...input,email:"test@example.com"}),RangeError);
assert.throws(()=>assembleKundaliReportCandidate({...input,yearConvention:undefined}),RangeError);
assert.throws(()=>assembleKundaliReportCandidate({...input,yearsToReview:31}),RangeError);
const invalid=assembleKundaliReportCandidate({...input,birthDate:"2026-02-30"});
assert.equal(invalid.status,"birth_basis_unavailable");
assert.equal(invalid.ready_for_public_display,false);
const fold=assembleKundaliReportCandidate({...input,birthDate:"2026-10-25",
 birthTime:"01:30",birthTimezone:"Europe/London",birthLatitude:51.5,
 birthLongitude:-0.1,birthFold:undefined});
assert.equal(fold.status,"birth_basis_unavailable");
assert.equal(fold.reason,"ambiguous_local_time");
console.log("PASS WSS07 no-name astronomy, invalid birth / DST and conventional year guards");
