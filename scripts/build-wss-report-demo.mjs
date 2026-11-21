/** Fixed synthetic demo only. Never reads user input or changes release flags. */
import fs from 'node:fs';
import {assembleKundaliReportCandidate} from './lib/wss07-kundali-report-candidate.mjs';
import {auditNatalPrecisionCandidate} from './lib/wss08-natal-precision-audit.mjs';
import {auditedBilingualCandidateView} from './lib/wss08-audited-bilingual-view.mjs';
import {computedPeriodSummaryCandidate} from './lib/wss07-period-transit-summary.mjs';
const setup={birthDate:'1991-08-17',birthTime:'10:05:23',birthTimezone:'Asia/Kolkata',birthLatitude:23.3441,birthLongitude:85.3096,referenceDate:'2026-11-21',referenceTimezone:'Asia/Kolkata',referenceLatitude:23.3441,referenceLongitude:85.3096,timePrecisionSeconds:1,yearConvention:'civil_365_25'};
const scenarios={};
for(const [key,birthDate] of [['complete','1992-06-12'],['boundary','1991-08-17']]){
 const input={...setup,birthDate};
 const report=assembleKundaliReportCandidate(input),precisionAudit=auditNatalPrecisionCandidate({...input,declaredPrecisionSeconds:1});
 const views=Object.fromEntries(['en','hi'].map(language=>[language,((view)=>{for(const key of ['strings','sourceEvidence','dashaIntervals','limitations'])delete view[key];return view;})(auditedBilingualCandidateView({report,precisionAudit,displayName:key==='complete'?'दीपक':'किरण',language,nameSignConsent:true}))]));
 const periods=Object.fromEntries(['month','year'].map(period=>[period,computedPeriodSummaryCandidate({report,period,referenceDate:setup.referenceDate,timezone:setup.birthTimezone,latitude:setup.birthLatitude,longitude:setup.birthLongitude})]));
 const contexts={day:{},month:{},year:{}};
 for(const referenceDate of ['2026-11-21','2026-11-22']){
  const dated=assembleKundaliReportCandidate({...input,referenceDate});
  contexts.day[referenceDate]=Object.fromEntries(['en','hi'].map(language=>[language,auditedBilingualCandidateView({report:dated,precisionAudit,language}).transit]));
 }
 for(const [kind,dates]of [['month',['2026-11-01','2026-12-01']],['year',['2026-01-01','2027-01-01']]])for(const referenceDate of dates){
  const periodData=computedPeriodSummaryCandidate({report,period:kind,referenceDate,timezone:setup.birthTimezone,latitude:setup.birthLatitude,longitude:setup.birthLongitude});
  contexts[kind][referenceDate.slice(0,kind==='year'?4:7)]=periodData;
 }
 scenarios[key]={contexts,fixture:{birthDate,birthTime:setup.birthTime,place:'Ranchi, India',timezone:setup.birthTimezone,clockPrecisionSeconds:1},views,periods};
}
const demo={schema:'drishvara_synthetic_report_demo_v1',synthetic_demo_only:true,personal_report_enabled:false,reference_date:setup.referenceDate,matching:{state:'method_qualification_pending',method:null,score:null,rating:null,personal_input_enabled:false,consent_required_for_personal_use:true,profiles:['complete','boundary']},scenarios};
fs.writeFileSync('data/demo/what-stars-say-report.json',JSON.stringify(demo)+'\n');
fs.copyFileSync('scripts/lib/wss07-chart-diagram.mjs','assets/js/drishvara-chart-diagram.mjs');
console.log('Built two fixed synthetic report demos; all personal publication flags retained');
