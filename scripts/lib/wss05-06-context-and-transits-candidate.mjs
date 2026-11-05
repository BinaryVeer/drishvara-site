/**
 * WSS05–WSS06: computed Jyotisha context, not interpretive prediction.
 * Source-bound indicators provide inputs to a future approved, audited
 * interpretation bank. No personally identifying data is stored or sent.
 */
import {calculateNatalCandidate} from "./wss03-natal-candidate.mjs";
import {divisionalChartsCandidate,activeVimshottariPeriods,
 vimshottariCandidate} from "./wss04-varga-vimshottari-candidate.mjs";
import {resolveBirthLocalInstant} from "./wss02-birth-local-instant.mjs";

export const CONTEXT_STATUS="wss05_06_candidate_structured_context_not_prediction";
export const HOUSE_ASSOCIATION_SOURCE="BPHS_BHAVA_NAMES_AND_DASHA_ASSOCIATIONS_REQUIRES_VERSE_RULE_REVIEW";
export const DOMAIN_BASIS=Object.freeze([
 {id:"work",display:"Career and public role",houses:[10,6,2,11],varga:"D10",
  needed_rules:["10th_house_lordship","10th_house_aspects","D10_condition","Dasha_activations"]},
 {id:"relationships",display:"Marriage and relationships",houses:[7,2,4],varga:"D9",
  needed_rules:["7th_house_lordship","D9_condition","Dasha_activations","source_approved_transit"]},
 {id:"education",display:"Learning and studies",houses:[4,5,9],varga:null,
  needed_rules:["5th_house_lordship","9th_house_condition","Dasha_activations"]},
 {id:"resources",display:"Wealth and material resources",houses:[2,11,6],varga:null,
  needed_rules:["2nd_11th_house_conditions","Dasha_activations"]},
 {id:"family",display:"Home and family",houses:[4,2],varga:null,
  needed_rules:["4th_house_condition","Dasha_activations"]},
 {id:"growth",display:"Personal development",houses:[1,9,12],varga:null,
  needed_rules:["1st_house_condition","9th_house_condition","Dasha_activations"]}
]);
const dateCheck=value=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||"")))throw new RangeError("Reference date YYYY-MM-DD required");
 const dt=new Date(value+"T00:00:00.000Z");
 if(!Number.isFinite(dt.getTime())||dt.toISOString().slice(0,10)!==value)
   throw new RangeError("Invalid reference date");
 return dt;
};
export function natalDomainIndicatorsCandidate(natal,{timePrecisionSeconds=60}={}) {
 if(!natal||natal.status!=="not_approved_for_public_prediction_or_kundali"||
    !Array.isArray(natal.whole_sign_houses))
   return {status:"unavailable_natal_lagna_or_unqualified_natal"};
 const vargas=divisionalChartsCandidate(natal,{birthTimePrecisionSeconds:timePrecisionSeconds});
 const domains=DOMAIN_BASIS.map(domain=>{
   const relevant=natal.whole_sign_houses.filter(h=>domain.houses.includes(h.number));
   const varga=domain.varga?vargas[domain.varga]:null;
   return {
     domain:domain.id,label:domain.display,
     evidence_kind:"computed_natal_house_and_varga_indicator_only",
     association_source:HOUSE_ASSOCIATION_SOURCE,
     houses:relevant.map(h=>({number:h.number,rashi:h.rashi,grahas:h.grahas})),
     divisional_chart:domain.varga,
     divisional_chart_lagna_state:varga?.lagna?.state??null,
     requires_source_rules:domain.needed_rules,
     prediction_state:"unavailable_pending_validated_interpretation_rules",
     guaranteed_future_event:false
   };
 });
 return {status:CONTEXT_STATUS,ready_for_life_prediction:false,
   natal_basis_version:natal.versions,domains};
}
export function dailyTransitCandidate({
 referenceDate,timezone,latitude,longitude,natal,dasha
}={}) {
 const day=dateCheck(referenceDate);
 if(!natal||natal.status!=="not_approved_for_public_prediction_or_kundali")
   return {status:"unavailable_unqualified_natal"};
 const midday=resolveBirthLocalInstant({
   birth_date:day.toISOString().slice(0,10),birth_time:"12:00:00",
   timezone,time_precision:"known"
 });
 if(midday.state!=="birth_instant_resolved")
   return {status:"unavailable_local_reference_time",reason:midday.state};
 const transit=calculateNatalCandidate({utc:midday.utc,latitude,longitude});
 const moon=natal.grahas.find(x=>x.graha==="Moon");
 const baseMoonIndex=moon.rashi.rashi_index;
 const grahas=transit.grahas.map(g=>({
   graha:g.graha,longitude_sidereal_degrees:g.sidereal_degrees,
   rashi:g.rashi.rashi,transit_rashi_index:g.rashi.rashi_index,
   house_from_natal_moon:((g.rashi.rashi_index-baseMoonIndex+12)%12)+1,
   retrograde:g.retrograde
 }));
 const dashaAt=dasha?activeVimshottariPeriods(dasha,midday.utc):null;
 return {status:CONTEXT_STATUS,ready_for_prediction:false,
   reference_local_date:referenceDate,
   sampling_policy:"local_12_00_daily_snapshot_not_full_day_event_resolution",
   reference_timezone:midday.timezone,utc:midday.utc,
   natal_moon_rashi:moon.rashi.rashi,
   active_dasha:dashaAt,grahas,
   method:{ephemeris:transit.versions.astronomy,
     ayanamsha:transit.versions.ayanamsha,node:transit.versions.node},
   interpretation:"withheld_pending_source_approved_rules",
   traditional_prediction_not_scientific_fact:true};
}
export function periodTransitCandidate({
 startDate,endDate,timezone,latitude,longitude,natal,dasha
}={}) {
 const start=dateCheck(startDate),end=dateCheck(endDate);
 const count=Math.round((end.getTime()-start.getTime())/86400000)+1;
 if(count<1||count>366)throw new RangeError("Date range requires 1 to 366 inclusive days");
 const snapshots=[],signChanges=[],dashaChanges=[];
 let previous=null;
 for(let i=0;i<count;i++){
   const date=new Date(start.getTime()+i*86400000).toISOString().slice(0,10);
   const snapshot=dailyTransitCandidate({referenceDate:date,timezone,latitude,longitude,natal,dasha});
   if(snapshot.status!==CONTEXT_STATUS)
     return {status:"unavailable_snapshot",date,reason:snapshot.status};
   if(previous){
     for(const current of snapshot.grahas){
       const earlier=previous.grahas.find(x=>x.graha===current.graha);
       if(earlier.transit_rashi_index!==current.transit_rashi_index)
         signChanges.push({observed_local_date:date,graha:current.graha,
           previous_sign:earlier.rashi,new_sign:current.rashi,
           exact_ingress_time:"not_computed_daily_sampling_only"});
     }
     const oldLords=[previous.active_dasha?.major_lord,previous.active_dasha?.antar_lord].join("/");
     const newLords=[snapshot.active_dasha?.major_lord,snapshot.active_dasha?.antar_lord].join("/");
     if(oldLords!==newLords)dashaChanges.push({observed_local_date:date,
       from:oldLords,to:newLords,exact_change_time:"see WSS04 UTC period boundaries"});
   }
   snapshots.push(snapshot);
   previous=snapshot;
 }
 return {status:CONTEXT_STATUS,ready_for_prediction:false,
   reference_period:{startDate,endDate,dayCount:count,timezone},
   each_local_noon_snapshot:snapshots,
   observed_sign_changes:signChanges,observed_dasha_changes:dashaChanges,
   limitation:"Daily noon samples cannot establish exact planetary ingress, birth-chart compatibility or future outcomes.",
   interpretation:"withheld_pending_source_approved_rules"};
}
export function buildPersonContextCandidate({
 birthDate,birthTime,birthTimezone,birthLatitude,birthLongitude,
 fold,yearConvention,birthTimePrecisionSeconds=60
}={}) {
 const birth=resolveBirthLocalInstant({
   birth_date:birthDate,birth_time:birthTime,timezone:birthTimezone,fold,
   time_precision:"known"
 });
 if(birth.state!=="birth_instant_resolved")
   return {status:"unavailable_birth_input",reason:birth.state};
 const natal=calculateNatalCandidate({utc:birth.utc,
   latitude:birthLatitude,longitude:birthLongitude});
 const dasha=vimshottariCandidate({
   moonSiderealLongitude:natal.grahas[1].sidereal_degrees,
   birthUtc:birth.utc,yearConvention
 });
 const indicators=natalDomainIndicatorsCandidate(natal,{
   timePrecisionSeconds:birthTimePrecisionSeconds});
 return {status:CONTEXT_STATUS,ready_for_public_use:false,
   birth_instant:birth,natal,dasha,indicators,
   personal_predictions:"withheld_pending_independent_rules",
   name_not_used_as_astronomical_variable:true};
}
