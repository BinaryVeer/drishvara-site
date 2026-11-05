/**
 * WSS08 private bilingual report gate.
 *
 * Couples WSS07's complete candidate data with the independent input-precision
 * audit. Dates from an unqualified Vimshottari year/Moon kernel are not shown
 * at day-level precision. This is a fail-closed, in-memory view transformation.
 * No persistence, external calls or user-identifying astronomical input.
 */
import {buildBilingualCandidateView} from "./wss07-bilingual-report-presenter.mjs";
import {WSS08_PRECISION_STATE} from "./wss08-natal-precision-audit.mjs";

export const AUDITED_VIEW_STATUS="wss08_audited_private_view_not_approved_for_public_prediction";
const NOTICE=Object.freeze({
 en:{
  title:"Chart precision and release qualification",
  withheld:"This label is withheld because the recorded birth-time interval or numerical margin crosses a chart boundary.",
  provisional:"Computed positions are provisional and not individually verified chart-grade results.",
  dasha:"Daśā sequence is shown as traditional context only. Exact Daśā dates and birth balances are withheld until independent Moon and year-method verification.",
  timing:"Marriage and career timing windows are withheld: exact period boundaries and qualifying multi-factor rules have not passed release review.",
  moon:"Natal Moon basis is uncertain; Moon-relative transit and Daśā interpretation are withheld.",
  source:"The current calculation is a research candidate, not a public horoscope or a scientifically established life prediction.",
  year:"Nominal years",sample:"Birth-clock sample count",precision:"Effective clock resolution",
  noLabel:"Withheld pending precision review",
  oneHour:"A birth-time window longer than one hour is insufficient for exact Lagna-based charts.",
  update:"More precise birth time or verified historical timezone is needed."
 },
 hi:{
  title:"कुंडली की सटीकता एवं प्रकाशन-जाँच",
  withheld:"दिए गए जन्म समय के अंतराल या गणना सीमा के कारण यह निश्चित राशि अथवा लग्न नहीं दिखाया गया है।",
  provisional:"दिखाए गए ग्रह स्थान परीक्षण स्तर की गणनाएँ हैं; व्यक्तिगत कुंडली का पूर्ण सत्यापन नहीं हुआ है।",
  dasha:"दशा क्रम केवल पारम्परिक संदर्भ है। चन्द्र की सटीकता और वर्ष पद्धति की स्वतंत्र जाँच तक दशा की निश्चित तिथियाँ एवं जन्म-शेष नहीं दिखाए जाते।",
  timing:"विवाह एवं करियर की समय-अवधि रोक दी गई है; दशा की सटीक सीमा और बहु-कारक नियमों की स्वीकृति शेष है।",
  moon:"जन्म-चन्द्र आधार अनिश्चित है; चन्द्र से गोचर तथा दशा व्याख्या रोकी गई है।",
  source:"यह शोध-अवस्था की गणना है, सार्वजनिक भविष्यफल अथवा जीवन की वैज्ञानिक रूप से सिद्ध भविष्यवाणी नहीं।",
  year:"निर्धारित वर्ष",sample:"जन्म-समय के परीक्षण बिंदु",precision:"प्रभावी समय सटीकता",
  noLabel:"सटीकता जाँच शेष",oneHour:"एक घंटे से अधिक के जन्म-समय अंतराल से निश्चित लग्न आधारित कुंडली नहीं निकाली जाती।",
  update:"अधिक सटीक जन्म समय अथवा ऐतिहासिक समयक्षेत्र की पुष्टि आवश्यक है।"
 }
});
const withheld=(language,reason)=>({
 state:"withheld_due_to_wss08_precision",rows:[],lagna:null,
 notice:NOTICE[language].withheld+" ("+reason+")"
});
function assertAudit(audit){
 if(!audit||audit.status!==WSS08_PRECISION_STATE||
    audit.ready_for_public_chart!==false||
    audit.ready_for_dasha_dates!==false||
    audit.ready_for_public_predictions!==false)
    throw new RangeError("A fail-closed WSS08 precision audit is mandatory");
}
export function auditedBilingualCandidateView({
 report,precisionAudit,displayName="",language="en",
 nameSignConsent=false,confirmedSyllableKey=null
}={}){
 if(language!=="en"&&language!=="hi")throw new RangeError("Only en and hi supported");
 assertAudit(precisionAudit);
 const t=NOTICE[language];
 const base=buildBilingualCandidateView({
  report,displayName,language,nameSignConsent,confirmedSyllableKey
 });
 const view={...base,
   status:AUDITED_VIEW_STATUS,
   strings:{...base.strings,wss08:t},
   quality:{
     status:precisionAudit.status,
     effectiveBirthPrecisionSeconds:precisionAudit.birth_time_span_seconds,
     samplesChecked:precisionAudit.samples_checked,
     marginDegrees:precisionAudit.numeric_margin_degrees,
     D1:precisionAudit.D1.state,
     D9:precisionAudit.D9.state,
     D10:precisionAudit.D10.state,
     exactDashaDatesVerified:false,
     readyForPublicDisplay:false
   },
   charts:{...base.charts},
   birth:{...base.birth},
   sourceEvidence:{...base.sourceEvidence},
   limitations:[...base.limitations,t.provisional,t.dasha,t.timing,t.source],
   windows:{relationships:[],work:[]},
   privateCalculationOnly:true,
   publicOutputPermitted:false
 };
 view.birth.precisionSeconds=precisionAudit.birth_time_span_seconds;
 for(const k of ["D1","D9","D10"]){
   if(precisionAudit[k].state!=="stable_candidate")
     view.charts[k]=withheld(language,k+" "+precisionAudit[k].reason);
 }
 view.birth.lagna=view.charts.D1.lagna;
 view.birth.janmaRashi=precisionAudit.janma_rashi?base.birth.janmaRashi:null;
 view.birth.janmaNakshatra=precisionAudit.janma_nakshatra?base.birth.janmaNakshatra:null;
 view.birth.pada=precisionAudit.janma_nakshatra_pada?base.birth.pada:null;
 view.planets=base.planets.map((p,i)=>{
   const original=report.charts.D1.grahas[i];
   const evidence=precisionAudit.grahas.find(g=>g.graha===original.graha);
   if(evidence?.D1?.state==="stable_candidate")return p;
   return {...p,sign:null,degreeInSign:null,sidereal:null,
     uncertainty:t.noLabel};
 });
 const moonBasisSafe=Boolean(precisionAudit.janma_rashi&&precisionAudit.janma_nakshatra);
 view.birth.moonBasisSafe=moonBasisSafe;
 view.transit=moonBasisSafe?{...base.transit,dasha:null}:{
   ...base.transit,moonSign:null,dasha:null,grahas:[],withheldNotice:t.moon
 };
 // Retain only safe ordered Lords and nominal total years, never date stamps.
 // Exact day-level Dasha dates are misleading while lunar differences reach
 // 72.056 arcsec in WSS08 independent tests.
 view.dashas=moonBasisSafe?report.astronomical_birth_context.mahadashas.map(d=>({
   lord:language==="hi"? (base.dashas.find(x=>x.start===d.start_utc)?.lord||d.lord):
     d.lord,
   nominalYears:d.nominal_years,
   start:null,end:null,balance:null,antar:[],
   state:"dasha_lords_only_dates_unqualified"
 })):[];
 if(view.charts.D1.state!=="candidate_chart"){
   view.domains=[];
   view.sourceEvidence={
     ...base.sourceEvidence,entries:[],ready_for_prediction:false,
     notice:t.withheld+" "+t.update
   };
 }
 if(!moonBasisSafe)view.quality.moonBasis=t.moon;
 view.quality.publicationReason="independent methods, interpretive rules, tzdb and subscriber privacy release review pending";
 return view;
}
export {NOTICE as WSS08_BILINGUAL_PRECISION_COPY};
