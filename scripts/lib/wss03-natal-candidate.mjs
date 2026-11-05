/**
 * WSS03: unpublished, inspectable natal candidate.
 * Astronomy Engine 2.1.19 (MIT) geocentric apparent ecliptic-of-date positions.
 * Do NOT expose on a public chart page until independent Lahiri/Lagna/node
 * fixture qualification, source approval, and output precision gates complete.
 *
 * This module does NOT accept or transmit a person's name.
 */
import {
  Body, Ecliptic, EclipticGeoMoon, GeoVector, MakeTime, SiderealTime,
  SunPosition, e_tilt
} from "astronomy-engine";
import {resolveBirthLocalInstant} from "./wss02-birth-local-instant.mjs";

export const WSS03_ENGINE_ID="wss03_astronomy_engine_2_1_19_candidate";
export const WSS03_AYANAMSHA_ID="wss03_lahiri_linear_candidate_tt_v1_UNQUALIFIED";
export const WSS03_NODE_ID="meeus_mean_lunar_node_candidate_v1_UNQUALIFIED";
export const WSS03_STATUS="not_approved_for_public_prediction_or_kundali";
const DEG=Math.PI/180, RAD=180/Math.PI;
const NAKSHATRA_WIDTH=360/27, PADA_WIDTH=360/108;
const RASHIS=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
  "Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const NAKSHATRAS=["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
 "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
 "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula",
 "Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha",
 "Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const PLANET_BODY=[["Sun",Body.Sun],["Moon",Body.Moon],["Mercury",Body.Mercury],
 ["Venus",Body.Venus],["Mars",Body.Mars],["Jupiter",Body.Jupiter],["Saturn",Body.Saturn]];
const normalize=d=>((d%360)+360)%360;
const signedDelta=(a,b)=>((a-b+540)%360+360)%360-180;
const rounded=(n,dp=9)=>Number(n.toFixed(dp));
const getUtc=x=>{
 const date=new Date(x);
 if(!Number.isFinite(date.getTime()))throw new RangeError("Invalid UTC instant");
 if(date.toISOString()<"1900-01-01T00:00:00.000Z" ||
    date.toISOString()>"2100-12-31T23:59:59.999Z")
   throw new RangeError("WSS03 currently supports 1900–2100 UTC only");
 return date;
};

export function lahiriCandidateDegrees(time) {
 const t=MakeTime(time),years=t.tt/365.242189;
 // Explicitly provisional anchor/rate inherited from AG74L. This is NOT a
 // cross-calibrated precise Lahiri ayanamsa; do not claim chart-grade status.
 return normalize(23.85675+0.013969*years);
}
function grahaTropical(name,body,time) {
 if(name==="Sun")return normalize(SunPosition(time).elon);
 if(name==="Moon")return normalize(EclipticGeoMoon(time).lon);
 return normalize(Ecliptic(GeoVector(body,time,true)).elon);
}
function meanNodeTropical(time) {
 // Meeus mean lunar ascending node, centuries of TT from J2000.
 const T=MakeTime(time).tt/36525;
 return normalize(125.0445479-1934.1362891*T+0.0020754*T*T+
   T*T*T/467441 - Math.pow(T,4)/60616000);
}
export function longitudeClassification(longitude) {
 if(!Number.isFinite(longitude))throw new TypeError("Finite longitude required");
 const l=normalize(longitude);
 const sign=Math.floor(l/30),n=Math.floor(l/NAKSHATRA_WIDTH);
 const p=Math.min(4,1+Math.floor((l-n*NAKSHATRA_WIDTH)/PADA_WIDTH));
 const signDegree=l-sign*30;
 return {longitude_degrees:rounded(l),rashi_index:sign+1,rashi:RASHIS[sign],
   degrees_in_rashi:rounded(signDegree),nakshatra_index:n+1,
   nakshatra:NAKSHATRAS[n],pada:p};
}
export function ascendantTropicalCandidate(time,latitude,longitude) {
 if(!Number.isFinite(latitude)||!Number.isFinite(longitude) ||
    Math.abs(latitude)>65||Math.abs(longitude)>180)
   return {state:"unsupported_geography_or_high_latitude"};
 const siderealTime=SiderealTime(time); // Greenwich apparent sidereal hours
 const theta=normalize(siderealTime*15+longitude)*DEG;
 const phi=latitude*DEG;
 const tilt=e_tilt(MakeTime(time)); // true obliquity, degrees
 const epsilon=tilt.tobl*DEG;
 const A=Math.cos(phi)*Math.cos(theta);
 const B=Math.cos(phi)*Math.sin(theta)*Math.cos(epsilon)+Math.sin(phi)*Math.sin(epsilon);
 if(Math.hypot(A,B)<1e-10)return {state:"unstable_horizon_intersection"};
 let lambda=normalize(Math.atan2(-A,B)*RAD);
 const eastern=l=>{
   const r=l*DEG;
   return -Math.sin(theta)*Math.cos(r)+Math.cos(theta)*Math.cos(epsilon)*Math.sin(r);
 };
 if(eastern(lambda)<0)lambda=normalize(lambda+180);
 if(eastern(lambda)<1e-8)return {state:"unstable_horizon_intersection"};
 const residual=A*Math.cos(lambda*DEG)+B*Math.sin(lambda*DEG);
 return {state:"candidate_horizon_intersection",tropical_degrees:rounded(lambda),
   greenwich_sidereal_hours:rounded(siderealTime),
   local_sidereal_degrees:rounded(theta*RAD),
   obliquity_true_degrees:rounded(tilt.tobl),
   east_horizon_direction:eastern(lambda)>0?"rising":"unknown",
   horizon_residual:rounded(Math.abs(residual),12)};
}
export function calculateNatalCandidate({utc,latitude,longitude}={}) {
 const date=getUtc(utc);
 if(!Number.isFinite(latitude)||!Number.isFinite(longitude))
   throw new RangeError("Finite latitude/longitude required");
 const time=MakeTime(date);
 const ayan=lahiriCandidateDegrees(time);
 const grahas=[];
 for(const [name,body] of PLANET_BODY){
   const t=grahaTropical(name,body,time);
   const s=normalize(t-ayan);
   const past=grahaTropical(name,body,MakeTime(new Date(date.getTime()-3600000)));
   const future=grahaTropical(name,body,MakeTime(new Date(date.getTime()+3600000)));
   const angularVelocity=signedDelta(future,past)/2; // degrees/hour
   grahas.push({
     graha:name,tropical_degrees:rounded(t),
     sidereal_degrees:rounded(s),rashi:longitudeClassification(s),
     tropical_motion_degrees_per_hour:rounded(angularVelocity,10),
     retrograde:angularVelocity<0
   });
 }
 const rahu=normalize(meanNodeTropical(time)-ayan);
 const ketu=normalize(rahu+180);
 for(const [name,s] of [["Rahu",rahu],["Ketu",ketu]]){
   grahas.push({graha:name,sidereal_degrees:rounded(s),
     tropical_degrees:rounded(normalize(s+ayan)),rashi:longitudeClassification(s),
     retrograde:true,node_model:WSS03_NODE_ID});
 }
 const rising=ascendantTropicalCandidate(time,latitude,longitude);
 const lagna=rising.state==="candidate_horizon_intersection"?
   longitudeClassification(rising.tropical_degrees-ayan):null;
 const houses=lagna?Array.from({length:12},(_,i)=>{
   const sign=(lagna.rashi_index-1+i)%12;
   return {number:i+1,rashi_index:sign+1,rashi:RASHIS[sign],
     grahas:grahas.filter(g=>g.rashi.rashi_index===sign+1).map(g=>g.graha)};
 }):null;
 return {
   status:WSS03_STATUS,ready_for_public_chart:false,
   utc:date.toISOString(),latitude,longitude,
   versions:{astronomy:"astronomy-engine@2.1.19",engine:WSS03_ENGINE_ID,
     ayanamsha:WSS03_AYANAMSHA_ID,node:WSS03_NODE_ID,house:"whole_sign_candidate_v1"},
   ayanamsha_degrees:rounded(ayan),grahas,lagna,
   lagna_geometry:rising,whole_sign_houses:houses,
   moon_nakshatra:grahas[1].rashi,
   uncertainty:"Ayanamsha, node model and Lagna require independent numerical fixture validation.",
   interpretation_allowed:false
 };
}
export function calculateCandidateFromBirth({birth_date,birth_time,timezone,
 latitude,longitude,fold,uncertainty_seconds}={}) {
 const resolved=resolveBirthLocalInstant({
   birth_date,birth_time,timezone,fold,uncertainty_seconds,
   time_precision:"known"
 });
 if(resolved.state!=="birth_instant_resolved")
   return {status:"birth_input_not_resolved",reason:resolved.state,
     choices:resolved.choices||null,ready_for_public_chart:false};
 // Input precision can change Lagna/D9 at a boundary. This provisional
 // calculator never claims such sensitive labels are final.
 return {birth_instant:resolved,
   ...calculateNatalCandidate({utc:resolved.utc,latitude,longitude})};
}
