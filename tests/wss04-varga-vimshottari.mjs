import assert from "node:assert/strict";
import {calculateNatalCandidate} from "../scripts/lib/wss03-natal-candidate.mjs";
import {vargaSignCandidate,divisionalChartsCandidate,vimshottariCandidate,
 activeVimshottariPeriods,VIMSHOTTARI_LORDS} from "../scripts/lib/wss04-varga-vimshottari-candidate.mjs";

assert.equal(VIMSHOTTARI_LORDS.reduce((sum,x)=>sum+x[1],0),120);
const sign=(x,k)=>vargaSignCandidate(x,k,{errorMarginDegrees:0.001}).rashi;
assert.equal(sign(0.5,"D9"),"Mesha");
assert.equal(sign(30.5,"D9"),"Makara");
assert.equal(sign(60.5,"D9"),"Tula");
assert.equal(sign(90.5,"D9"),"Karka");
assert.equal(sign(359.5,"D9"),"Meena");
assert.equal(sign(0.5,"D10"),"Mesha");
assert.equal(sign(30.5,"D10"),"Makara");
assert.equal(sign(60.5,"D10"),"Mithuna");
assert.equal(sign(90.5,"D10"),"Meena");
assert.equal(vargaSignCandidate(30,"D9").state,"review_required_near_varga_boundary");
assert.equal(vargaSignCandidate(3.333333,"D9").state,"review_required_near_varga_boundary");
assert.equal(vargaSignCandidate(2.999,"D10").state,"review_required_near_varga_boundary");
assert.throws(()=>vargaSignCandidate(50,"D30"),RangeError);
console.log("PASS WSS04 D9/D10 BPHS chapter 6 positional fixtures");
const t="2000-01-01T00:00:00Z",d=vimshottariCandidate({
 moonSiderealLongitude:48,birthUtc:t,yearConvention:"civil_365_25"
});
assert.equal(d.ready_for_public_prediction,false);
assert.equal(d.birth_lord,"Moon");
assert.equal(d.moon_nakshatra_index,4);
assert.ok(Math.abs(d.birth_balance_years-4)<1e-9);
assert.equal(d.mahadashas[0].lord,"Moon");
assert.equal(d.mahadashas[1].lord,"Mars");
assert.equal(d.mahadashas[2].lord,"Rahu");
assert.equal(d.mahadashas.length,10);
for(const p of d.mahadashas){
 assert.equal(p.antardashas.length,9);
 const totalYears=p.antardashas.reduce((sum,a)=>sum+a.years,0);
 assert.ok(Math.abs(totalYears-p.nominal_years)<1e-10);
 assert.equal(p.antardashas[0].lord,p.lord);
 assert.equal(p.antardashas[0].start_utc,p.start_utc);
 assert.equal(p.antardashas[8].end_exclusive_utc,p.end_exclusive_utc);
}
assert.equal(d.mahadashas[0].display_start_utc,t);
assert.equal(activeVimshottariPeriods(d,t).major_lord,"Moon");
assert.equal(activeVimshottariPeriods(d,"2006-01-01T00:00:00Z").major_lord,"Mars");
assert.equal(activeVimshottariPeriods(d,"1800-01-01T00:00:00Z").state,"outside_model_window");
console.log("PASS WSS04 birth balance, 120-year cycle, 9 subperiod allocation and birth clipping");
const d360=vimshottariCandidate({moonSiderealLongitude:48,birthUtc:t,yearConvention:"savana_360"});
assert.equal(d360.days_per_year,360);
assert.ok(Date.parse(d360.mahadashas[0].end_exclusive_utc) <
  Date.parse(d.mahadashas[0].end_exclusive_utc));
assert.throws(()=>vimshottariCandidate({moonSiderealLongitude:48,birthUtc:t}),RangeError);
assert.throws(()=>vimshottariCandidate({moonSiderealLongitude:NaN,birthUtc:t,yearConvention:"savana_360"}),RangeError);
console.log("PASS WSS04 explicit year convention and invalid inputs");
const natal=calculateNatalCandidate({utc:"1991-08-17T04:35:23Z",latitude:24,longitude:83});
const chart=divisionalChartsCandidate(natal,{birthTimePrecisionSeconds:1});
assert.equal(chart.ready_for_public_chart,false);
for(const v of ["D9","D10"]){
 assert.equal(chart[v].grahas.length,9);
 assert.equal(new Set(chart[v].grahas.map(g=>g.graha)).size,9);
 assert.equal(chart[v].lagna.kind,v);
 assert.equal(chart[v].birth_time_precision_seconds,1);
 assert.equal(chart[v].state,"candidate_not_public");
}
const imprecise=divisionalChartsCandidate(natal,{birthTimePrecisionSeconds:7200});
assert.equal(imprecise.D9.lagna.state,"review_required_birth_time_precision");
assert.equal(imprecise.D10.lagna.state,"review_required_birth_time_precision");
assert.throws(()=>divisionalChartsCandidate({},{}),RangeError);
assert.throws(()=>divisionalChartsCandidate(natal,{birthTimePrecisionSeconds:0}),RangeError);
console.log("PASS WSS04 9-graha D9/D10 sensitivity and explicit non-public status");
