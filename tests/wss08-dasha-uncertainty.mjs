import assert from "node:assert/strict";
import {dashaUncertaintyCandidate,stableDashaContext}
 from "../scripts/lib/wss08-dasha-uncertainty.mjs";
import {vimshottariCandidate} from "../scripts/lib/wss04-varga-vimshottari-candidate.mjs";
for(const yearConvention of ["civil_365_25","savana_360"]){
 const input={moonSiderealLongitude:153.2,birthUtc:"2000-01-01T00:00:00Z",
   birthPrecisionSeconds:60,moonMarginDegrees:.04,yearConvention};
 const e=dashaUncertaintyCandidate(input);
 assert.equal(e.periods.length,10);assert.equal(e.exact_dates_qualified,false);
 const inside=(value,range)=>assert.ok(Date.parse(range.earliest_utc)<=Date.parse(value)&&
   Date.parse(value)<=Date.parse(range.latest_utc));
 // Interior points, not just the same corner calculations used by producer.
 for(const delta of [-.03,0,.03])for(const seconds of [1,27,59]){
   const r=vimshottariCandidate({moonSiderealLongitude:153.2+delta,
    birthUtc:new Date(Date.parse(input.birthUtc)+seconds*1000).toISOString(),yearConvention});
   for(let i=0;i<10;i++){
    inside(r.mahadashas[i].start_utc,e.periods[i].start);
    inside(r.mahadashas[i].end_exclusive_utc,e.periods[i].end);
    for(let j=0;j<9;j++)inside(r.mahadashas[i].antardashas[j].start_utc,
      e.periods[i].antardashas[j].start);
   }
 }
 const p=e.periods[1];
 assert.equal(stableDashaContext(e,p.start.earliest_utc).state,"withheld_period_boundary");
 const a=p.antardashas[0];
 const middle=new Date((Date.parse(a.start.latest_utc)+Date.parse(a.end.earliest_utc))/2).toISOString();
 assert.equal(stableDashaContext(e,middle).state,"stable_under_assumed_margin");
 console.log("PASS bounded Dasha intervals, subperiod coverage and uncertain-boundary withholding",yearConvention);
}
assert.equal(dashaUncertaintyCandidate({moonSiderealLongitude:40,birthUtc:"2000-01-01Z",
 yearConvention:"civil_365_25"}).status,"withheld_lunar_nakshatra_boundary");
assert.throws(()=>dashaUncertaintyCandidate({moonSiderealLongitude:153,birthUtc:"2000-01-01Z",
 moonMarginDegrees:0,yearConvention:"civil_365_25"}),RangeError);
