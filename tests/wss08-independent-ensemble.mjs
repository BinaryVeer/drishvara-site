/**
 * WSS08: independent, seeded 160-case numerical candidate differential.
 * Swiss Ephemeris is a separate CI-only reference process and NOT a runtime
 * dependency. 20th/21st-century coordinates and moments are synthetic.
 * Passing these discovery tolerances is NOT authorization to publish a chart.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import {calculateNatalCandidate} from "../scripts/lib/wss03-natal-candidate.mjs";
import {vargaSignCandidate} from "../scripts/lib/wss04-varga-vimshottari-candidate.mjs";
const filename="wss08-qa/synthetic_swiss_reference.json";
const source=JSON.parse(fs.readFileSync(filename,"utf8"));
assert.equal(source.synthetic_only,true);
assert.equal(source.count,160);
assert.equal(source.fixtures.length,160);
const norm=v=>((v%360)+360)%360;
const delta=(a,b)=>Math.abs(((a-b+540)%360)-180);
const width=360/108;
const boundaryDistance=(v,segment)=>Math.min(norm(v)%segment,segment-norm(v)%segment);
const radiansToArcsec=d=>d*3600;
const discoveryTolerances={graha_degrees:0.02,lagna_degrees:0.02,ayanamsha_degrees:0.003};
const summary={
 suite:"WSS08_SEEDED_160_INDEPENDENT_REFERENCE",
 sample_count:source.count,seed:source.seed,
 discovery_limits:discoveryTolerances,
 max_errors:{graha_degrees:0,lagna_degrees:0,ayanamsha_degrees:0},
 per_body_max_degrees:{},unchecked_close_boundaries:[],
 failures:[],boundary_label_comparisons:0,non_boundary_label_disagreements:0,
 public_chart_approved:false,public_predictions_approved:false,
 caution:"Discovery-only comparison, not sufficient for all birth locations/tzdb/dasha/varga and public Kundali."
};
for(let i=0;i<source.fixtures.length;i++){
 const f=source.fixtures[i];
 const chart=calculateNatalCandidate(f);
 assert.equal(chart.ready_for_public_chart,false);
 assert.equal(chart.grahas.length,9);
 const refKetu=norm(f.grahas.Rahu+180);
 const all={...f.grahas,Ketu:refKetu};
 for(const [graha,refLon] of Object.entries(all)){
  const got=chart.grahas.find(g=>g.graha===graha);
  if(!got)throw new Error("Missing "+graha);
  const e=delta(got.sidereal_degrees,refLon);
  summary.per_body_max_degrees[graha]=Math.max(summary.per_body_max_degrees[graha]||0,e);
  summary.max_errors.graha_degrees=Math.max(summary.max_errors.graha_degrees,e);
  if(e>discoveryTolerances.graha_degrees){
   summary.failures.push({case:i,utc:f.utc,graha,difference_degrees:e});
  }
  // A classification disagreement is only meaningful when the benchmark is
  // comfortably outside the combined numerical tolerance from a boundary.
  const segments=[30,360/27,360/108];
  const classifications=[
    [got.rashi.rashi_index,Math.floor(norm(refLon)/30)+1],
    [got.rashi.nakshatra_index,Math.floor(norm(refLon)/(360/27))+1],
    [got.rashi.pada,Math.floor(norm(refLon)%(360/27)/(360/108))+1]
  ];
  for(let j=0;j<segments.length;j++){
   const distance=boundaryDistance(refLon,segments[j]);
   if(distance<=2*discoveryTolerances.graha_degrees){
    summary.unchecked_close_boundaries.push({case:i,utc:f.utc,graha,dimension:j});
    continue;
   }
   summary.boundary_label_comparisons++;
   if(classifications[j][0]!==classifications[j][1]){
    summary.non_boundary_label_disagreements++;
    summary.failures.push({case:i,utc:f.utc,graha,kind:j,got:classifications[j][0],reference:classifications[j][1]});
   }
  }
  for(const kind of ["D9","D10"]){
    const degErrorBand=2*discoveryTolerances.graha_degrees;
    const divWidth=kind==="D9"?30/9:3;
    if(boundaryDistance(refLon,divWidth)<=degErrorBand)continue;
    const ref=vargaSignCandidate(refLon,kind,{errorMarginDegrees:0});
    const computed=vargaSignCandidate(got.sidereal_degrees,kind,{errorMarginDegrees:0});
    summary.boundary_label_comparisons++;
    if(ref.rashi_index!==computed.rashi_index){
      summary.non_boundary_label_disagreements++;
      summary.failures.push({case:i,utc:f.utc,graha,kind,got:computed.rashi_index,reference:ref.rashi_index});
    }
  }
 }
 if(!chart.lagna)throw new Error("Unexpected missing Lagna: "+f.utc);
 const lagnaError=delta(chart.lagna.longitude_degrees,f.lagna_sidereal_degrees);
 const ayanError=delta(chart.ayanamsha_degrees,f.ayanamsha_degrees);
 summary.max_errors.lagna_degrees=Math.max(lagnaError,summary.max_errors.lagna_degrees);
 summary.max_errors.ayanamsha_degrees=Math.max(ayanError,summary.max_errors.ayanamsha_degrees);
 if(lagnaError>discoveryTolerances.lagna_degrees)
  summary.failures.push({case:i,utc:f.utc,kind:"lagna",difference_degrees:lagnaError});
 if(ayanError>discoveryTolerances.ayanamsha_degrees)
  summary.failures.push({case:i,utc:f.utc,kind:"ayanamsha",difference_degrees:ayanError});
 // Independent Lagna D1/Vargas, with boundary shield.
 for(const [kind,div] of [["D1",30],["D9",30/9],["D10",3]]){
  if(boundaryDistance(f.lagna_sidereal_degrees,div)<=2*discoveryTolerances.lagna_degrees)continue;
  const got=kind==="D1"?chart.lagna.rashi_index:
   vargaSignCandidate(chart.lagna.longitude_degrees,kind,{errorMarginDegrees:0}).rashi_index;
  const reference=kind==="D1"?Math.floor(norm(f.lagna_sidereal_degrees)/30)+1:
   vargaSignCandidate(f.lagna_sidereal_degrees,kind,{errorMarginDegrees:0}).rashi_index;
  summary.boundary_label_comparisons++;
  if(got!==reference){
   summary.non_boundary_label_disagreements++;
   summary.failures.push({case:i,utc:f.utc,kind:"Lagna_"+kind,got,reference});
  }
 }
}
fs.mkdirSync("wss08-qa",{recursive:true});
fs.writeFileSync("wss08-qa/independent-160-summary.json",JSON.stringify(summary,null,2)+"\n");
console.log("WSS08 independent n="+summary.sample_count+
 " comparisons="+summary.boundary_label_comparisons+
 " boundary_near_unqualified="+summary.unchecked_close_boundaries.length+
 " non_boundary_disagreements="+summary.non_boundary_label_disagreements);
console.log("WSS08 per-body maximum (arcseconds) "+JSON.stringify(
 Object.fromEntries(Object.entries(summary.per_body_max_degrees)
 .map(([key,v])=>[key,+radiansToArcsec(v).toFixed(3)]))));
console.log("WSS08 MAX "+JSON.stringify(summary.max_errors));
console.log("WSS08 TOTAL FAILURES "+summary.failures.length);
summary.failures.slice(0,20).forEach(x=>console.error("WSS08_FAILURE "+JSON.stringify(x)));
if(summary.failures.length)process.exitCode=1;
