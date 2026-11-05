/**
 * WSS04 — non-public Parāśarī D9/D10 and Vimśottarī arithmetic candidate.
 * Sources: BPHS ch.6 verses 12 (D9), 13–14 (D10); standard nine-lord
 * Vimśottarī allocation. Year convention is REQUIRED, never implicit.
 *
 * Input graha longitudes must originate from a separately verified sidereal
 * ephemeris. This module does not calculate or predict life events.
 */
import {calculateNatalCandidate,longitudeClassification} from "./wss03-natal-candidate.mjs";
export const WSS04_STATUS="candidate_only_no_subscriber_results";
export const WSS04_D9_RULE="BPHS_6_12_NAVAMSA_MOVABLE_FIXED_DUAL";
export const WSS04_D10_RULE="BPHS_6_13_14_DASAMSA_ODD_EVEN";
export const WSS04_DASHA_RULE="VIMSHOTTARI_LUNAR_NAKSHATRA_120_YEAR_CYCLE";
export const VIMSHOTTARI_LORDS=Object.freeze([
 ["Ketu",7],["Venus",20],["Sun",6],["Moon",10],["Mars",7],
 ["Rahu",18],["Jupiter",16],["Saturn",19],["Mercury",17]
]);
const RASHIS=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
 "Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const DAY_MS=86400000, WIDTH=360/27;
const normalize=v=>((v%360)+360)%360;
const safeDate=v=>{
 const t=new Date(v).getTime();
 if(!Number.isFinite(t))throw new RangeError("Birth instant required");
 return t;
};
const dateISO=ms=>new Date(Math.round(ms)).toISOString();
function rashiFromIndex(index){
 const i=((index%12)+12)%12;
 return {rashi_index:i+1,rashi:RASHIS[i]};
}
export function vargaSignCandidate(longitude,kind,{errorMarginDegrees=0.02}={}) {
 if(!Number.isFinite(longitude)||!Number.isFinite(errorMarginDegrees)||
   errorMarginDegrees<0||errorMarginDegrees>=0.25)
   throw new RangeError("Finite sidereal longitude and qualifying error margin required");
 if(kind!=="D9"&&kind!=="D10")throw new RangeError("Only D9 and D10 governed");
 const l=normalize(longitude),sign=Math.floor(l/30),local=l%30;
 const n=kind==="D9"?9:10;
 const width=30/n,part=Math.min(n-1,Math.floor(local/width));
 const distance=Math.min(local%width,width-local%width);
 let resultSign;
 if(kind==="D9"){
   // Movable signs start in themselves; fixed in ninth; dual in fifth.
   const movable=sign%3===0,fixed=sign%3===1;
   const start=movable?sign:fixed?(sign+8)%12:(sign+4)%12;
   resultSign=(start+part)%12;
 }else{
   // In the 1-based zodiac, odd signs start from themselves, even from ninth.
   const start=sign%2===0?sign:(sign+8)%12;
   resultSign=(start+part)%12;
 }
 const nearBoundary=distance<=errorMarginDegrees+1e-10;
 return {
   kind,source_rule:kind==="D9"?WSS04_D9_RULE:WSS04_D10_RULE,
   division_index:part+1,divisions_per_rashi:n,
   error_margin_degrees:errorMarginDegrees,
   distance_to_boundary_degrees:Number(distance.toFixed(9)),
   state:nearBoundary?"review_required_near_varga_boundary":"candidate_numeric",
   ...(!nearBoundary?rashiFromIndex(resultSign):{}),
   never_publicly_qualified:true
 };
}
export function divisionalChartsCandidate(natal,{
 birthTimePrecisionSeconds=60,errorMarginDegrees=0.02
}={}) {
 if(!natal||natal.status!=="not_approved_for_public_prediction_or_kundali"||
   !Array.isArray(natal.grahas)||natal.grahas.length!==9)
   throw new RangeError("A WSS03 nine-graha natal candidate is required");
 if(!Number.isInteger(birthTimePrecisionSeconds)||birthTimePrecisionSeconds<1)
   throw new RangeError("Birth-time precision must be explicit");
 const sensitivity= birthTimePrecisionSeconds<=3600?
   calculateNatalCandidate({utc:new Date(Date.parse(natal.utc)+birthTimePrecisionSeconds*1000).toISOString(),
     latitude:natal.latitude,longitude:natal.longitude}):null;
 const outputs={};
 for(const kind of ["D9","D10"]){
   const rows=[];
   for(const graha of natal.grahas){
     const current=vargaSignCandidate(graha.sidereal_degrees,kind,{errorMarginDegrees});
     const future=sensitivity?.grahas.find(x=>x.graha===graha.graha);
     const changed=future && current.state==="candidate_numeric" &&
       vargaSignCandidate(future.sidereal_degrees,kind,{errorMarginDegrees}).rashi_index!==current.rashi_index;
     rows.push({graha:graha.graha,...(changed?{
       ...current,state:"review_required_birth_time_precision",rashi:null,rashi_index:null
     }:current)});
   }
   let lagna=vargaSignCandidate(natal.lagna.longitude_degrees,kind,{errorMarginDegrees});
   const futureLagna=sensitivity?.lagna;
   if(birthTimePrecisionSeconds>3600 || !futureLagna ||
      (lagna.state==="candidate_numeric"&&
       vargaSignCandidate(futureLagna.longitude_degrees,kind,{errorMarginDegrees}).rashi_index!==lagna.rashi_index)){
     lagna={...lagna,state:"review_required_birth_time_precision",rashi:null,rashi_index:null};
   }
   outputs[kind]={state:"candidate_not_public",source_rule:kind==="D9"?WSS04_D9_RULE:WSS04_D10_RULE,
     birth_time_precision_seconds:birthTimePrecisionSeconds,lagna,grahas:rows,
     rashi_assignment_unverified:rows.some(x=>x.state!=="candidate_numeric")||lagna.state!=="candidate_numeric"};
 }
 return {status:WSS04_STATUS,ready_for_public_chart:false,...outputs};
}
export function vimshottariCandidate({
 moonSiderealLongitude,birthUtc,yearConvention
}={}) {
 if(!Number.isFinite(moonSiderealLongitude))throw new RangeError("Moon sidereal longitude required");
 const daysByConvention={civil_365_25:365.25,savana_360:360};
 if(!Object.hasOwn(daysByConvention,yearConvention))
   throw new RangeError("Explicit governed dasha year convention required");
 const birthMs=safeDate(birthUtc);
 const moon=normalize(moonSiderealLongitude);
 const index=Math.floor(moon/WIDTH),progress=(moon-index*WIDTH)/WIDTH;
 const startingLord=index%9;
 const lordYears=VIMSHOTTARI_LORDS[startingLord][1];
 const yearDays=daysByConvention[yearConvention];
 const start=birthMs-progress*lordYears*yearDays*DAY_MS;
 const mahadashas=[];
 let cursor=start;
 for(let k=0;k<10;k++){
   const lordIndex=(startingLord+k)%9;
   const [lord,years]=VIMSHOTTARI_LORDS[lordIndex];
   const end=cursor+years*yearDays*DAY_MS;
   const antardashas=[];
   let subStart=cursor;
   for(let j=0;j<9;j++){
     const [antarLord,antarYears]=VIMSHOTTARI_LORDS[(lordIndex+j)%9];
     const subEnd=j===8?end:subStart+years*yearDays*DAY_MS*antarYears/120;
     antardashas.push({
       lord:antarLord,start_utc:dateISO(subStart),end_exclusive_utc:dateISO(subEnd),
       display_start_utc:dateISO(Math.max(subStart,birthMs)),
       visible_after_birth:subEnd>birthMs,
       years:years*antarYears/120
     });
     subStart=subEnd;
   }
   mahadashas.push({lord,nominal_years:years,start_utc:dateISO(cursor),
     end_exclusive_utc:dateISO(end),
     display_start_utc:dateISO(Math.max(cursor,birthMs)),
     birth_period_balance_years:k===0?(1-progress)*years:null,
     antardashas});
   cursor=end;
 }
 return {
   status:WSS04_STATUS,ready_for_public_prediction:false,
   rule_id:WSS04_DASHA_RULE,year_convention:yearConvention,
   days_per_year:yearDays,birth_utc:dateISO(birthMs),
   moon_nakshatra_index:index+1,birth_nakshatra_progress:progress,
   birth_lord:VIMSHOTTARI_LORDS[startingLord][0],
   birth_balance_years:(1-progress)*lordYears,
   mahadashas,
   important_limitation:"Dasha periods are an arithmetic candidate, not a reliable predictor of life events; birth Moon, year convention and boundary accuracy must be verified."
 };
}
export function activeVimshottariPeriods(candidate,utc){
 if(!candidate||candidate.status!==WSS04_STATUS)
   throw new RangeError("WSS04 candidate required");
 const timestamp=safeDate(utc);
 const major=candidate.mahadashas.find(x=>Date.parse(x.start_utc)<=timestamp&&timestamp<Date.parse(x.end_exclusive_utc));
 if(!major)return {state:"outside_model_window"};
 const antar=major.antardashas.find(x=>Date.parse(x.start_utc)<=timestamp&&timestamp<Date.parse(x.end_exclusive_utc));
 return {state:antar?"candidate_period":"gap_requires_review",
   major_lord:major.lord,antar_lord:antar?.lord??null,
   major_start_utc:major.start_utc,antar_start_utc:antar?.start_utc??null,
   year_convention:candidate.year_convention,
   interpretation_allowed:false};
}
