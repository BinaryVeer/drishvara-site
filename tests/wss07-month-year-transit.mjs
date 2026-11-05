import assert from "node:assert/strict";
import fs from "node:fs";
import {assembleKundaliReportCandidate} from "../scripts/lib/wss07-kundali-report-candidate.mjs";
import {computedPeriodSummaryCandidate,PERIOD_STATUS}
 from "../scripts/lib/wss07-period-transit-summary.mjs";

const report=assembleKundaliReportCandidate({
 birthDate:"1991-08-17",birthTime:"10:05:23",birthTimezone:"Asia/Kolkata",
 birthLatitude:23.3441,birthLongitude:85.3096,
 referenceDate:"2026-11-05",referenceTimezone:"Europe/London",
 referenceLatitude:51.50853,referenceLongitude:-0.12574,
 timePrecisionSeconds:1,yearConvention:"civil_365_25"
});
assert.equal(report.ready_for_public_display,false);
const base={report,referenceDate:"2026-11-05",timezone:"Europe/London",
 latitude:51.50853,longitude:-0.12574};
for(const [period,n,start,end] of [
 ["month",30,"2026-11-01","2026-11-30"],
 ["year",365,"2026-01-01","2026-12-31"]]){
 const r=computedPeriodSummaryCandidate({...base,period});
 assert.equal(r.status,PERIOD_STATUS);
 assert.equal(r.ready_for_prediction,false);
 assert.equal(r.period,period);
 assert.equal(r.sample_count,n);
 assert.equal(r.start_date,start);
 assert.equal(r.end_date,end);
 assert.equal(r.timezone,"Europe/London");
 assert.equal(r.exact_ingresses_calculated,false);
 assert.equal(r.interpretation_rule_bank_approved,false);
 assert.ok(r.sign_changes.length>=1,"At least one transit sign change expected");
 assert.ok(r.sign_changes.every(ch=>ch.exact_ingress_time==="not_computed_daily_sampling_only"));
 assert.ok(r.dasha_changes.every(ch=>ch.exact_change_time==="see WSS04 UTC period boundaries"));
 assert.ok(r.note.includes("not exact ingresses"));
 assert.ok(!Object.hasOwn(r,"name"));
 console.log("PASS WSS06 "+period+" days="+r.sample_count+
   " observed_sign_changes="+r.sign_changes.length+
   " observed_dasha_changes="+r.dasha_changes.length);
}
const leap=computedPeriodSummaryCandidate({...base,period:"year",referenceDate:"2024-06-15"});
assert.equal(leap.sample_count,366,"Leap-year daily sampling must be 366");
assert.equal(leap.end_date,"2024-12-31");
assert.throws(()=>computedPeriodSummaryCandidate({...base,period:"week"}),RangeError);
assert.throws(()=>computedPeriodSummaryCandidate({...base,referenceDate:"2026-02-30"}),RangeError);
assert.equal(computedPeriodSummaryCandidate({...base,latitude:70}).status,"unavailable_reference_geography");
assert.throws(()=>computedPeriodSummaryCandidate({...base,report:{...report,ready_for_public_display:true}}),RangeError);
const source=fs.readFileSync("scripts/lib/wss07-period-transit-summary.mjs","utf8");
assert.doesNotMatch(source,/\b(?:fetch|localStorage|sessionStorage|indexedDB|sendBeacon)\s*\(/);
assert.equal(source.includes("exact_ingresses_calculated:false"),true);
console.log("PASS WSS06 leap/calendar and no-public-prediction safeguards");
