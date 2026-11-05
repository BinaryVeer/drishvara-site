import assert from "node:assert/strict";
import fs from "node:fs";
import {assembleKundaliReportCandidate} from "../scripts/lib/wss07-kundali-report-candidate.mjs";
import {evaluateTraditionalEvidenceCandidate,WSS05_EVIDENCE_STATUS}
 from "../scripts/lib/wss05-classical-rule-evidence.mjs";
import {buildBilingualCandidateView} from "../scripts/lib/wss07-bilingual-report-presenter.mjs";

const sources=JSON.parse(fs.readFileSync("data/methodology/jyotisha/wss05-source-rule-gate-v1.json","utf8"));
assert.equal(sources.sources.length,5);
assert.ok(sources.approval_contract.one_house_alone_is_not_prediction);
const input={birthDate:"1991-08-17",birthTime:"10:05:23",birthTimezone:"Asia/Kolkata",
 birthLatitude:23.3441,birthLongitude:85.3096,
 referenceDate:"2026-11-05",referenceTimezone:"Asia/Kolkata",
 referenceLatitude:23.3441,referenceLongitude:85.3096,
 timePrecisionSeconds:1,yearConvention:"civil_365_25"};
const report=assembleKundaliReportCandidate(input);
assert.equal(report.ready_for_public_display,false);
for(const language of ["en","hi"]){
 const result=evaluateTraditionalEvidenceCandidate(report,{language});
 assert.equal(result.status,WSS05_EVIDENCE_STATUS);
 assert.equal(result.ready_for_prediction,false);
 assert.equal(result.non_scientific_traditional_interpretation,true);
 assert.equal(result.entries.length,5);
 assert.ok(result.notice.length>40);
 const vocation=result.entries.find(x=>x.id==="VOCATION_TENTH_THREE_BASIS");
 assert.deepEqual(vocation.source_rule_ids,["BJ_10_1"]);
 assert.equal(vocation.factors.length,3);
 assert.ok(vocation.factors.every(x=>x.sign_index>=1&&x.sign_index<=12));
 const houses=result.entries.find(x=>x.id==="HOUSE_7_10");
 assert.deepEqual(houses.factors.map(x=>x.house),[7,10]);
 const review=result.entries.find(x=>x.id==="TENTH_LORD_WITH_TRINE_LORD");
 assert.equal(review.source_rule_ids[0],"BPHS_48_9");
 assert.ok(["traditional_conjunction_pattern_observed","pattern_not_observed"].includes(review.state));
 const marriage=result.entries.find(x=>x.id==="RELATIONSHIP_MULTI_FACTOR");
 assert.equal(marriage.state,"incomplete_multi_factor_marriage_review");
 assert.ok(marriage.limits.includes("no_guaranteed_marriage"));
 assert.ok(result.entries.every(x=>x.source_rule_ids.every(id=>sources.sources.some(s=>s.id===id))));
 assert.ok(result.entries.every(x=>!x.title.toLowerCase().includes("will marry")));
 const view=buildBilingualCandidateView({report,language,displayName:"परीक्षण",nameSignConsent:false});
 assert.equal(view.sourceEvidence.status,WSS05_EVIDENCE_STATUS);
 assert.equal(view.sourceEvidence.language,language);
 if(language==="hi"){
  assert.match(vocation.title,/व्यवसाय/);
  assert.match(marriage.summary,/विवाह/);
 }else{
  assert.match(vocation.title,/vocation/);
  assert.match(marriage.summary,/marriage/);
 }
 console.log("PASS WSS05 source rules, 5 bilingual evidence entries",language);
}
assert.throws(()=>evaluateTraditionalEvidenceCandidate(report,{language:"fr"}),RangeError);
assert.throws(()=>evaluateTraditionalEvidenceCandidate({...report,ready_for_public_display:true}),RangeError);
assert.throws(()=>evaluateTraditionalEvidenceCandidate({}),RangeError);
const raw=fs.readFileSync("scripts/lib/wss05-classical-rule-evidence.mjs","utf8");
assert.doesNotMatch(raw,/\b(?:fetch|localStorage|sessionStorage|indexedDB|sendBeacon)\s*\(/);
assert.doesNotMatch(raw,/innerHTML/);
console.log("PASS WSS05 no network, no deterministic future claim and explicit publication gating");
