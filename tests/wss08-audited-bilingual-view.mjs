import assert from "node:assert/strict";
import fs from "node:fs";
import {assembleKundaliReportCandidate} from "../scripts/lib/wss07-kundali-report-candidate.mjs";
import {calculateNatalCandidate} from "../scripts/lib/wss03-natal-candidate.mjs";
import {auditNatalPrecisionCandidate} from "../scripts/lib/wss08-natal-precision-audit.mjs";
import {auditedBilingualCandidateView,AUDITED_VIEW_STATUS}
 from "../scripts/lib/wss08-audited-bilingual-view.mjs";

const setup={
 birthDate:"1991-08-17",birthTime:"10:05:23",birthTimezone:"Asia/Kolkata",
 birthLatitude:23.3441,birthLongitude:85.3096,
 referenceDate:"2026-11-05",referenceTimezone:"Asia/Kolkata",
 referenceLatitude:23.3441,referenceLongitude:85.3096,
 timePrecisionSeconds:1,yearConvention:"civil_365_25"
};
const report=assembleKundaliReportCandidate(setup);
const audit=auditNatalPrecisionCandidate({...setup,declaredPrecisionSeconds:1});
assert.equal(audit.status,"wss08_offline_precision_evidence_not_public");
for(const language of ["en","hi"]){
 const view=auditedBilingualCandidateView({report,precisionAudit:audit,
   language,displayName:"विकास",nameSignConsent:true});
 assert.equal(view.status,AUDITED_VIEW_STATUS);
 assert.equal(view.publicOutputPermitted,false);
 assert.equal(view.quality.exactDashaDatesVerified,false);
 assert.equal(view.quality.readyForPublicDisplay,false);
 assert.equal(view.person.displayName,"विकास");
 assert.equal(view.person.nameSign.state,"traditional_name_sign");
 assert.ok(view.quality.samplesChecked>=9);
 assert.equal(view.birth.precisionSeconds,1);
 assert.equal(view.windows.work.length,0);
 assert.equal(view.windows.relationships.length,0);
 assert.ok(view.limitations.some(x=>x.length>25));
 assert.equal(view.transit.dasha,null);
 assert.equal(view.dashas.length,10);
 assert.ok(view.dashas.every(d=>d.start===null&&d.end===null&&d.balance===null&&d.antar.length===0));
 assert.equal(view.charts.D1.rows.length,12);
 assert.equal(view.quality.D1,"stable_candidate");
 assert.equal(view.sourceEvidence.entries.length,5);
 assert.equal(view.person.nameSign.rashiIndex,2);
 if(language==="hi"){
   assert.equal(view.person.nameSign.sign,"वृषभ");
   assert.match(view.strings.wss08.dasha,/दशा/);
 }else{
   assert.equal(view.person.nameSign.sign,"Vrishabha");
   assert.match(view.strings.wss08.dasha,/Exact Daśā dates/);
 }
 console.log("PASS WSS08 audited bilingual private view",language);
}
const minuteSetup={...setup,birthTime:"10:05"};
const minuteReport=assembleKundaliReportCandidate(minuteSetup);
const minute=auditNatalPrecisionCandidate({...minuteSetup,declaredPrecisionSeconds:1});
const minuteView=auditedBilingualCandidateView({report:minuteReport,precisionAudit:minute});
assert.equal(minuteView.birth.precisionSeconds,60);
assert.equal(minuteView.quality.effectiveBirthPrecisionSeconds,60);
assert.throws(()=>auditedBilingualCandidateView({report,precisionAudit:minute}),
 /Precision audit does not match/, "Minute clock must not qualify a different second-precision birth");
console.log("PASS WSS08 minute entry cannot masquerade as second resolution");

const ms0=Date.parse("2026-11-05T00:00:00Z");
let boundary=null;
for(let i=0;i<144;i++){
 const a=calculateNatalCandidate({utc:new Date(ms0+i*300000).toISOString(),latitude:0,longitude:0});
 const b=calculateNatalCandidate({utc:new Date(ms0+(i+1)*300000).toISOString(),latitude:0,longitude:0});
 if(a.lagna.rashi_index!==b.lagna.rashi_index){boundary=new Date(ms0+i*300000).toISOString().slice(11,19);break;}
}
assert.ok(boundary,"A genuine rising-sign boundary is required");
const edgeInput={birthDate:"2026-11-05",birthTime:boundary,birthTimezone:"Etc/UTC",
 birthLatitude:0,birthLongitude:0,
 referenceDate:"2026-11-05",referenceTimezone:"Etc/UTC",
 referenceLatitude:0,referenceLongitude:0,
 timePrecisionSeconds:300,yearConvention:"civil_365_25"};
const uncertainReport=assembleKundaliReportCandidate(edgeInput);
const edge=auditNatalPrecisionCandidate({...edgeInput,declaredPrecisionSeconds:300});
assert.equal(edge.D1.state,"withheld_due_to_precision_or_boundary");
const uncertain=auditedBilingualCandidateView({
 report:uncertainReport,precisionAudit:edge,language:"en",
 displayName:"Synthetic Test",nameSignConsent:false
});
assert.equal(uncertain.charts.D1.rows.length,0);
assert.equal(uncertain.birth.lagna,null);
assert.equal(uncertain.sourceEvidence.entries.length,0);
assert.equal(uncertain.publicOutputPermitted,false);
assert.equal(uncertain.person.displayName,"Synthetic Test");
console.log("PASS WSS08 rising-sign uncertainty hides D1 and unsupported life-domain interpretation");
assert.throws(()=>auditedBilingualCandidateView({report}),RangeError);
assert.throws(()=>auditedBilingualCandidateView({report,precisionAudit:{...audit,ready_for_public_chart:true}}),RangeError);
assert.throws(()=>auditedBilingualCandidateView({report,precisionAudit:audit,language:"fr"}),RangeError);
const changedPlace=assembleKundaliReportCandidate({...setup,
 birthLatitude:26.21,birthLongitude:91.73});
assert.throws(()=>auditedBilingualCandidateView({report:changedPlace,precisionAudit:audit}),
 /Precision audit does not match/,"Different birthplace cannot reuse an unrelated audit");
const changedTime=assembleKundaliReportCandidate({...setup,birthTime:"10:06:23"});
assert.throws(()=>auditedBilingualCandidateView({report:changedTime,precisionAudit:audit}),
 /Precision audit does not match/,"Different birth moment cannot reuse an unrelated audit");
assert.throws(()=>auditedBilingualCandidateView({
 report,precisionAudit:{...audit,audit_basis:null}
}),/Precision audit does not match/,"A missing provenance cannot qualify a chart");
assert.throws(()=>auditedBilingualCandidateView({
 report,precisionAudit:{...audit,audit_basis:{...audit.audit_basis,birth_timezone:"Etc/UTC"}}
}),/Precision audit does not match/,"Runtime timezone drift cannot be quietly accepted");
console.log("PASS WSS08 audit/report bind to birth UTC, timezone, coordinate and declared precision");
const source=fs.readFileSync("scripts/lib/wss08-audited-bilingual-view.mjs","utf8");
assert.doesNotMatch(source,/\b(?:fetch|localStorage|sessionStorage|indexedDB|sendBeacon)\s*\(/);
console.log("PASS WSS08 mandatory audit, privacy and no exact dasha/date-window leakage");
