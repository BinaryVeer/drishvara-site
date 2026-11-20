import fs from "node:fs";
import assert from "node:assert/strict";
import {calculateNatalCandidate} from "../scripts/lib/wss03-natal-candidate.mjs";
import {vargaSignCandidate,vimshottariCandidate} from "../scripts/lib/wss04-varga-vimshottari-candidate.mjs";
import {dashaUncertaintyCandidate} from "../scripts/lib/wss08-dasha-uncertainty.mjs";
const source=JSON.parse(fs.readFileSync("wss08-qa/varga-dasha-reference.json","utf8"));
assert.equal(source.synthetic_only,true);assert.equal(source.fixtures.length,160);
let arithmeticChecks=0,envelopeChecks=0,vargaChecks=0,boundaryReviews=0,maxDashaErrorMs=0;
for(const f of source.fixtures){
 const chart=calculateNatalCandidate(f);
 const bodies=[...chart.grahas.map(g=>[g.graha,g.sidereal_degrees]),["Lagna",chart.lagna.longitude_degrees]];
 for(const [name,angle] of bodies)for(const kind of ["D9","D10"]){
  const got=vargaSignCandidate(angle,kind,{errorMarginDegrees:.04});
  if(got.state!=="candidate_numeric"){boundaryReviews++;continue;}
  assert.equal(got.rashi_index,f.vargas[name][kind],f.utc+" "+name+" "+kind);vargaChecks++;
 }
 for(const convention of ["civil_365_25","savana_360"]){
  // First isolate arithmetic using the SAME reference Moon, independently
  // implemented in Python; allow only millisecond rounding noise.
  const r=vimshottariCandidate({moonSiderealLongitude:f.moon,birthUtc:f.utc,yearConvention:convention});
  const moon=chart.grahas.find(g=>g.graha==="Moon").sidereal_degrees;
  const envelope=dashaUncertaintyCandidate({moonSiderealLongitude:moon,birthUtc:f.utc,
    birthPrecisionSeconds:1,yearConvention:convention});
  for(let i=0;i<10;i++){
   const p=r.mahadashas[i],ref=f.periods[convention][i];
   assert.equal(p.lord,ref.lord);
   for(const [key,stamp] of [["start_utc","start_ms"],["end_exclusive_utc","end_ms"]]){
    const error=Math.abs(Date.parse(p[key])-ref[stamp]);maxDashaErrorMs=Math.max(maxDashaErrorMs,error);
    assert.ok(error<=2,"Independent Dasha arithmetic drift");arithmeticChecks++;
   }
   for(let j=0;j<9;j++){
    assert.equal(p.antardashas[j].lord,ref.antar[j].lord);
    assert.ok(Math.abs(Date.parse(p.antardashas[j].start_utc)-ref.antar[j].start_ms)<=2);
    assert.ok(Math.abs(Date.parse(p.antardashas[j].end_exclusive_utc)-ref.antar[j].end_ms)<=2);arithmeticChecks+=2;
   }
   // Then test the REAL production Moon against the independent Moon's
   // period dates. A close Nakshatra boundary must withhold its envelope.
   if(envelope.status==="withheld_lunar_nakshatra_boundary")continue;
   const e=envelope.periods[i];
   assert.equal(e.lord,ref.lord);
   for(const [range,stamp] of [[e.start,ref.start_ms],[e.end,ref.end_ms]]){
    assert.ok(Date.parse(range.earliest_utc)<=stamp&&stamp<=Date.parse(range.latest_utc));envelopeChecks++;
   }
  }
 }
}
const result={synthetic_cases:160,arithmetic_checks:arithmeticChecks,
 independent_varga_checks:vargaChecks,boundary_reviews:boundaryReviews,
 dasha_envelope_checks:envelopeChecks,max_arithmetic_rounding_error_ms:maxDashaErrorMs,
 public_prediction_approved:false,exact_event_dates_approved:false};
fs.mkdirSync("wss08-release-qa",{recursive:true});
fs.writeFileSync("wss08-release-qa/varga-dasha-summary.json",JSON.stringify(result,null,2)+"\n");
console.log("PASS independent Python Varga/Dasha "+JSON.stringify(result));
