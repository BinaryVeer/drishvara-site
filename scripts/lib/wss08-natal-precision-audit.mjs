/**
 * WSS08 — conservative input-precision audit of natal candidate labels.
 *
 * Checks all labels across the LOCAL BIRTH-CLOCK RESOLUTION interval, not just
 * at the nominal first second. This does not prove continuous stability or
 * independent ephemeris accuracy; publication remains forbidden.
 *
 * Result is an in-memory, non-public qualification overlay. No name/account
 * details enter the astronomy kernel or a network request.
 */
import {resolveBirthLocalInstant} from "./wss02-birth-local-instant.mjs";
import {calculateNatalCandidate,longitudeClassification} from "./wss03-natal-candidate.mjs";
import {vargaSignCandidate} from "./wss04-varga-vimshottari-candidate.mjs";

export const WSS08_PRECISION_STATE="wss08_offline_precision_evidence_not_public";
const norm=v=>((v%360)+360)%360;
const segmentDistance=(v,w)=>{
 const x=norm(v)%w;
 return Math.min(x,w-x);
};
const withhold=(reason,language)=>({
 state:"withheld_due_to_precision_or_boundary",reason,
 text:language==="hi"?
   "जन्म समय या गणना की सीमा के कारण निश्चित राशि, लग्न या वर्ग-फल रोका गया है।":
   "Exact sign, Lagna or divisional assignment is withheld near a birth-time or calculation boundary."
});
const stable=(angles,width,margin)=>{
 if(!angles.length||angles.some(x=>!Number.isFinite(x)))return false;
 const labels=angles.map(a=>Math.floor(norm(a)/width));
 return new Set(labels).size===1 && angles.every(x=>segmentDistance(x,width)>margin);
};
const classify=(angles,kind,margin)=>{
 const w=kind==="D9"?30/9:3;
 if(!stable(angles,w,margin))return null;
 const all=angles.map(x=>vargaSignCandidate(x,kind,{errorMarginDegrees:margin}));
 if(all.some(x=>x.state!=="candidate_numeric"))return null;
 return new Set(all.map(x=>x.rashi_index)).size===1?all[0].rashi:null;
};

export function auditNatalPrecisionCandidate({
 birthDate,birthTime,birthTimezone,birthLatitude,birthLongitude,
 fold,declaredPrecisionSeconds=60,marginDegrees=0.04,language="en"
}={}){
 if(!["en","hi"].includes(language))throw new RangeError("English and Hindi only");
 if(!Number.isInteger(declaredPrecisionSeconds)||declaredPrecisionSeconds<1||
   declaredPrecisionSeconds>86400)
   throw new RangeError("Positive seconds of time precision required");
 if(!Number.isFinite(marginDegrees)||marginDegrees<0.02||marginDegrees>=0.2)
   throw new RangeError("Candidate numeric margin must be 0.02 to 0.2 degrees");
 const birth=resolveBirthLocalInstant({
   birth_date:birthDate,birth_time:birthTime,timezone:birthTimezone,
   fold,time_precision:"known"
 });
 if(birth.state!=="birth_instant_resolved")
   return {status:"unavailable_birth_instant",input_state:birth.state,
     ready_for_public_chart:false,choices:birth.choices??null};
 const windowSeconds=Math.max(birth.precision_seconds,declaredPrecisionSeconds);
 if(windowSeconds>3600){
   return {status:WSS08_PRECISION_STATE,
     birth_time_span_seconds:windowSeconds,samples_checked:0,
     chart_state:"withheld_time_window_exceeds_one_hour",
     D1:withhold("time_precision_over_one_hour",language),
     D9:withhold("time_precision_over_one_hour",language),
     D10:withhold("time_precision_over_one_hour",language),
     janma_rashi:null,janma_nakshatra:null,janma_nakshatra_pada:null,
     dasha_birth_lord:null,
     ready_for_public_chart:false,ready_for_dasha_dates:false};
 }
 if(!Number.isFinite(birthLatitude)||!Number.isFinite(birthLongitude)||
   Math.abs(birthLatitude)>65||Math.abs(birthLongitude)>180){
   return {status:"unavailable_geography",ready_for_public_chart:false};
 }
 const start=birth.utc_epoch_ms;
 const samples=[0,.125,.25,.375,.5,.625,.75,.875,.999]
   .map(f=>start+Math.round(windowSeconds*1000*f));
 const charts=samples.map(ms=>calculateNatalCandidate({
   utc:new Date(ms).toISOString(),latitude:birthLatitude,longitude:birthLongitude
 }));
 const lagnaAngles=charts.map(c=>c.lagna?.longitude_degrees??NaN);
 const lagnaStable=stable(lagnaAngles,30,marginDegrees);
 const moon=charts.map(c=>c.grahas.find(g=>g.graha==="Moon").sidereal_degrees);
 const moonSign=stable(moon,30,marginDegrees);
 const moonNak=stable(moon,360/27,marginDegrees);
 const moonPada=stable(moon,360/108,marginDegrees);
 const baseMoon=longitudeClassification(moon[0]);
 const grahas=charts[0].grahas.map(g=>{
   const angles=charts.map(c=>c.grahas.find(x=>x.graha===g.graha).sidereal_degrees);
   const d1Stable=stable(angles,30,marginDegrees);
   return {
     graha:g.graha,
     D1:d1Stable?{state:"stable_candidate",rashi:g.rashi.rashi}:
       withhold("graha_rashi_crosses_boundary",language),
     D9:classify(angles,"D9",marginDegrees)??null,
     D10:classify(angles,"D10",marginDegrees)??null
   };
 });
 const d9Lagna=lagnaStable?classify(lagnaAngles,"D9",marginDegrees):null;
 const d10Lagna=lagnaStable?classify(lagnaAngles,"D10",marginDegrees):null;
 const safeD1=lagnaStable&&grahas.every(g=>g.D1.state==="stable_candidate");
 return {
   status:WSS08_PRECISION_STATE,
   // Basis binding is only retained in ephemeral memory and never used as
   // a profile identifier. The presenter MUST match the same natal input.
   audit_basis:{
     birth_instant_utc:birth.utc,
     birth_timezone:birth.timezone,
     birth_latitude:birthLatitude,
     birth_longitude:birthLongitude,
     birth_time_precision_seconds:windowSeconds
   },
   birth_time_span_seconds:windowSeconds,utc_start:new Date(start).toISOString(),
   utc_end_exclusive:new Date(start+windowSeconds*1000).toISOString(),
   samples_checked:samples.length,
   numeric_margin_degrees:marginDegrees,
   data_quality_basis:"9 samples in a 1-hour maximum clock window; provisional ephemeris",
   D1:safeD1?{state:"stable_candidate",lagna:charts[0].lagna.rashi}:
     withhold("lagna_or_graha_sign_sensitivity",language),
   D9:d9Lagna?{state:"stable_candidate",lagna:d9Lagna}:
     withhold("navamsa_lagna_sensitivity",language),
   D10:d10Lagna?{state:"stable_candidate",lagna:d10Lagna}:
     withhold("dasamsa_lagna_sensitivity",language),
   janma_rashi:moonSign?baseMoon.rashi:null,
   janma_nakshatra:moonNak?baseMoon.nakshatra:null,
   janma_nakshatra_pada:moonPada?baseMoon.pada:null,
   dasha_birth_lord:moonNak?"moon_nakshatra_stable_but_period_dates_not_qualified":null,
   grahas,
   warnings:[
     language==="hi"?
       "दशा की दिन/समय वाली तिथियाँ इस पद्धति से पूर्णतः सत्यापित नहीं हैं।":
       "Exact Daśā dates remain unqualified; small Moon-position errors can shift period boundaries by days.",
     language==="hi"?
       "यह परीक्षण गणना है; व्यक्तिगत भविष्यफल या सार्वजनिक कुंडली की अनुमति नहीं है।":
       "Candidate precision evidence does not authorize public Kundali or personal forecasts."
   ],
   ready_for_dasha_dates:false,
   ready_for_public_chart:false,
   ready_for_public_predictions:false
 };
}
