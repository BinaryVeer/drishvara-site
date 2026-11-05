import assert from "node:assert/strict";
import {astronomicalPrimitiveState} from "../scripts/lib/ag74l-astronomical-engine.mjs";
import {calculateNatalCandidate,calculateCandidateFromBirth,longitudeClassification,
 ascendantTropicalCandidate,lahiriCandidateDegrees} from "../scripts/lib/wss03-natal-candidate.mjs";

const close=(a,b,tol=1e-6)=>assert.ok(Math.abs(a-b)<=tol,String(a)+" vs "+String(b)+" tolerance "+String(tol));
assert.equal(longitudeClassification(0).rashi,"Mesha");
assert.equal(longitudeClassification(29.999).rashi,"Mesha");
assert.equal(longitudeClassification(30).rashi,"Vrishabha");
assert.equal(longitudeClassification(359.999).nakshatra,"Revati");
assert.equal(longitudeClassification(13.33333).pada,4);
assert.equal(longitudeClassification(13.33334).nakshatra,"Bharani");
assert.equal(longitudeClassification(-10).rashi,"Meena");
const cases=[
 {utc:"2000-01-01T12:00:00Z",latitude:0,longitude:0},
 {utc:"1991-08-17T04:35:23Z",latitude:24.0,longitude:83.0},
 {utc:"2026-11-05T04:35:23Z",latitude:27.08,longitude:93.60},
 {utc:"2026-11-05T18:30:00Z",latitude:51.5,longitude:-0.12},
 {utc:"2026-11-05T18:30:00Z",latitude:-33.86,longitude:151.20},
 {utc:"1900-01-01T00:38:50Z",latitude:22.6,longitude:88.3},
 {utc:"2050-07-01T14:00:00Z",latitude:40.7,longitude:-74.0},
 {utc:"2026-04-01T12:00:00Z",latitude:-12.04,longitude:-77.04}
];
let executed=0;
for(const arg of cases){
 const r=calculateNatalCandidate(arg);
 assert.equal(r.ready_for_public_chart,false);
 assert.equal(r.interpretation_allowed,false);
 assert.equal(r.grahas.length,9);
 assert.equal(new Set(r.grahas.map(x=>x.graha)).size,9);
 assert.ok(r.lagna);
 assert.equal(r.lagna_geometry.east_horizon_direction,"rising");
 assert.ok(r.lagna_geometry.horizon_residual<1e-9);
 assert.equal(r.whole_sign_houses.length,12);
 assert.deepEqual(r.whole_sign_houses.map(x=>x.number),Array.from({length:12},(_,i)=>i+1));
 assert.equal(r.whole_sign_houses.reduce((v,x)=>v+x.grahas.length,0),9);
 for(const g of r.grahas){
   assert.ok(g.sidereal_degrees>=0&&g.sidereal_degrees<360);
   assert.ok(g.rashi.rashi_index>=1&&g.rashi.rashi_index<=12);
   assert.ok(g.rashi.nakshatra_index>=1&&g.rashi.nakshatra_index<=27);
   assert.ok(g.rashi.pada>=1&&g.rashi.pada<=4);
   const assigned=r.whole_sign_houses.filter(h=>h.grahas.includes(g.graha));
   assert.equal(assigned.length,1,g.graha+" assigned exactly once");
 }
 const node1=r.grahas.find(x=>x.graha==="Rahu").sidereal_degrees;
 const node2=r.grahas.find(x=>x.graha==="Ketu").sidereal_degrees;
 close((node2-node1+360)%360,180,2e-6);
 const primitive=astronomicalPrimitiveState(arg.utc);
 close(r.grahas[0].sidereal_degrees,primitive.sun_longitude_sidereal,1e-7);
 close(r.grahas[1].sidereal_degrees,primitive.moon_longitude_sidereal,1e-7);
 close(lahiriCandidateDegrees(new Date(arg.utc)),primitive.ayanamsha_degrees,1e-7);
 executed++;
 console.log("PASS WSS03 candidate",arg.utc,"Lagna",r.lagna.rashi,
  "Moon",r.moon_nakshatra.nakshatra,"grahas",r.grahas.length);
}
const timeFold=calculateCandidateFromBirth({birth_date:"2026-10-25",birth_time:"01:30",
 timezone:"Europe/London",latitude:51.5,longitude:-0.1});
assert.equal(timeFold.reason,"ambiguous_local_time");
const birth=calculateCandidateFromBirth({birth_date:"1991-08-17",birth_time:"10:05:23",
 timezone:"Asia/Kolkata",latitude:24.0,longitude:83.0});
assert.equal(birth.status,"not_approved_for_public_prediction_or_kundali");
assert.equal(birth.birth_instant.utc,"1991-08-17T04:35:23.000Z");
assert.equal(birth.ready_for_public_chart,false);
assert.equal(ascendantTropicalCandidate(new Date(),70,0).state,
 "unsupported_geography_or_high_latitude");
assert.throws(()=>calculateNatalCandidate({utc:"2026-11-05",latitude:NaN,longitude:5}),RangeError);
assert.throws(()=>calculateNatalCandidate({utc:"1800-01-01T00:00:00Z",latitude:0,longitude:0}),RangeError);
console.log("PASS WSS03",executed,"geographies/dates plus guards; NOT independently chart qualified.");
