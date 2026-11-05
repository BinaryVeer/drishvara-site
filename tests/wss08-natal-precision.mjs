import assert from "node:assert/strict";
import fs from "node:fs";
import {calculateNatalCandidate} from "../scripts/lib/wss03-natal-candidate.mjs";
import {auditNatalPrecisionCandidate,WSS08_PRECISION_STATE}
 from "../scripts/lib/wss08-natal-precision-audit.mjs";
import {vargaSignCandidate} from "../scripts/lib/wss04-varga-vimshottari-candidate.mjs";

const standard={
 birthDate:"1991-08-17",birthTime:"10:05:23",birthTimezone:"Asia/Kolkata",
 birthLatitude:23.3441,birthLongitude:85.3096
};
const exact=auditNatalPrecisionCandidate({...standard,declaredPrecisionSeconds:1});
assert.equal(exact.status,WSS08_PRECISION_STATE);
assert.equal(exact.birth_time_span_seconds,1);
assert.equal(exact.samples_checked,9);
assert.equal(exact.ready_for_public_chart,false);
assert.equal(exact.ready_for_dasha_dates,false);
assert.equal(exact.grahas.length,9);
assert.ok(exact.janma_nakshatra);
assert.ok(exact.janma_rashi);
assert.equal(exact.grahas.every(g=>g.D1.state==="stable_candidate"),true);
console.log("PASS WSS08 known-second birth labels candidate but no chart or Dasha activation");

const minute=auditNatalPrecisionCandidate({...standard,birthTime:"10:05",declaredPrecisionSeconds:1});
assert.equal(minute.birth_time_span_seconds,60,"No hidden invented second precision for HH:mm");
assert.equal(minute.utc_start,"1991-08-17T04:35:00.000Z");
assert.equal(minute.utc_end_exclusive,"1991-08-17T04:36:00.000Z");
const declaredMinute=auditNatalPrecisionCandidate({...standard,declaredPrecisionSeconds:60});
assert.equal(declaredMinute.birth_time_span_seconds,60);
console.log("PASS WSS08 actual local clock precision overrides unjustified 1s selection");

const ambiguous=auditNatalPrecisionCandidate({
 birthDate:"2026-10-25",birthTime:"01:30",birthTimezone:"Europe/London",
 birthLatitude:51.5,birthLongitude:-0.12,declaredPrecisionSeconds:60
});
assert.equal(ambiguous.status,"unavailable_birth_instant");
assert.equal(ambiguous.input_state,"ambiguous_local_time");
assert.equal(ambiguous.choices.length,2);
const fold=auditNatalPrecisionCandidate({
 birthDate:"2026-10-25",birthTime:"01:30",birthTimezone:"Europe/London",
 birthLatitude:51.5,birthLongitude:-0.12,declaredPrecisionSeconds:60,fold:"later"
});
assert.equal(fold.status,WSS08_PRECISION_STATE);
assert.equal(fold.utc_start,"2026-10-25T01:30:00.000Z");
const missing=auditNatalPrecisionCandidate({
 birthDate:"2026-11-05",birthTimezone:"Asia/Kolkata",birthLatitude:23,
 birthLongitude:85,declaredPrecisionSeconds:60
});
assert.equal(missing.status,"unavailable_birth_instant");
assert.equal(missing.ready_for_public_chart,false);
console.log("PASS WSS08 DST fold and invalid birth clocks withheld");

const longWindow=auditNatalPrecisionCandidate({...standard,declaredPrecisionSeconds:7200});
assert.equal(longWindow.chart_state,"withheld_time_window_exceeds_one_hour");
assert.equal(longWindow.D1.state,"withheld_due_to_precision_or_boundary");
assert.equal(longWindow.janma_nakshatra,null);
const extremeLatitude=auditNatalPrecisionCandidate({...standard,birthLatitude:72});
assert.equal(extremeLatitude.status,"unavailable_geography");
assert.equal(extremeLatitude.ready_for_public_chart,false);
assert.throws(()=>auditNatalPrecisionCandidate({...standard,declaredPrecisionSeconds:0}),RangeError);
assert.throws(()=>auditNatalPrecisionCandidate({...standard,marginDegrees:0}),RangeError);
assert.throws(()=>auditNatalPrecisionCandidate({...standard,language:"fr"}),RangeError);
console.log("PASS WSS08 imprecise and unsupported inputs fail closed");

// Find an actual rising-sign boundary dynamically, rather than relying on an
// invented birth timestamp. Synthetic equatorial case, no personal input.
const origin=Date.parse("2026-11-05T00:00:00.000Z");
const candidates=[];
for(let i=0;i<=144;i++){
 const ms=origin+i*5*60*1000;
 const utc=new Date(ms).toISOString();
 const c=calculateNatalCandidate({utc,latitude:0,longitude:0});
 const nav=vargaSignCandidate(c.lagna.longitude_degrees,"D9",{errorMarginDegrees:0});
 candidates.push({ms,rashi:c.lagna.rashi_index,d9:nav.rashi_index});
}
const signCross=candidates.find((x,i)=>i<144 && x.rashi!==candidates[i+1].rashi);
assert.ok(signCross,"Need independently located Lagna Rāśi boundary");
const signClock=new Date(signCross.ms).toISOString().slice(11,19);
const signReview=auditNatalPrecisionCandidate({
 birthDate:"2026-11-05",birthTime:signClock,birthTimezone:"Etc/UTC",
 birthLatitude:0,birthLongitude:0,declaredPrecisionSeconds:300
});
assert.equal(signReview.D1.state,"withheld_due_to_precision_or_boundary");
assert.equal(signReview.ready_for_public_chart,false);
console.log("PASS WSS08 a computed rising-sign boundary is withheld, not guessed");

const d9Cross=candidates.find((x,i)=>i<144 && x.rashi===candidates[i+1].rashi && x.d9!==candidates[i+1].d9);
assert.ok(d9Cross,"Need independently located D9 Lagna boundary");
const navReview=auditNatalPrecisionCandidate({
 birthDate:"2026-11-05",birthTime:new Date(d9Cross.ms).toISOString().slice(11,19),
 birthTimezone:"Etc/UTC",birthLatitude:0,birthLongitude:0,
 declaredPrecisionSeconds:300
});
assert.equal(navReview.D9.state,"withheld_due_to_precision_or_boundary");
assert.equal(navReview.ready_for_public_chart,false);
console.log("PASS WSS08 dynamic D9 boundary correctly withheld");
const hindi=auditNatalPrecisionCandidate({...standard,language:"hi",declaredPrecisionSeconds:1});
assert.match(hindi.warnings.join(" "),/दशा/);
assert.equal(hindi.ready_for_public_predictions,false);
const source=fs.readFileSync("scripts/lib/wss08-natal-precision-audit.mjs","utf8");
assert.doesNotMatch(source,/\b(?:fetch|localStorage|sessionStorage|indexedDB|sendBeacon)\s*\(/);
assert.equal(source.includes("ready_for_public_chart:false"),true);
console.log("PASS WSS08 bilingual uncertainty and no session persistence/network, public gate locked");
