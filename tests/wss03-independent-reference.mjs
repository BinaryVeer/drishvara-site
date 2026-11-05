/* Independent numeric cross-check from reference values generated using the
 * separately installed Swiss Ephemeris Moshier test fixture. Swiss code is NOT
 * linked, imported, bundled or deployed in this project.
 *
 * This script deliberately reports angular errors and retains the "candidate"
 * gate. Broad discovery bounds prevent accidental sign/ascendant gross errors,
 * but do NOT constitute chart-grade acceptance thresholds.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import {calculateNatalCandidate} from "../scripts/lib/wss03-natal-candidate.mjs";
const fixtures=JSON.parse(fs.readFileSync("data/quality/jyotisha/wss03-independent-natal-reference-20261105.json","utf8"));
assert.equal(fixtures.fixtures.length,8);
const dist=(x,y)=>Math.abs(((x-y+540)%360)-180);
const toleranceDiscovery={graha_max_degrees:0.02,ascendant_max_degrees:0.02,
  ayanamsha_max_degrees:0.002};
const results=[],failures=[];
for(const fixture of fixtures.fixtures){
  const calculated=calculateNatalCandidate(fixture);
  const errors={};
  for(const [name,reference] of Object.entries(fixture.grahas)){
    const graha=calculated.grahas.find(g=>g.graha===name);
    assert.ok(graha,"missing "+name);
    const error=dist(graha.sidereal_degrees,reference);
    errors[name]=+error.toFixed(7);
    if(error>toleranceDiscovery.graha_max_degrees)
      failures.push(fixture.utc+" "+name+" candidate diff="+error.toFixed(6)+"°");
  }
  const ascendant=calculated.lagna.longitude_degrees;
  const ascError=dist(ascendant,fixture.lagna_sidereal_degrees);
  const ayanError=dist(calculated.ayanamsha_degrees,fixture.ayanamsha_degrees);
  if(ascError>toleranceDiscovery.ascendant_max_degrees)
    failures.push(fixture.utc+" ascendant candidate diff="+ascError.toFixed(6)+"°");
  if(ayanError>toleranceDiscovery.ayanamsha_max_degrees)
    failures.push(fixture.utc+" ayanamsha candidate diff="+ayanError.toFixed(6)+"°");
  results.push({utc:fixture.utc,latitude:fixture.latitude,longitude:fixture.longitude,
    graha_errors_degrees:errors,ascendant_error_degrees:+ascError.toFixed(7),
    ayanamsha_error_degrees:+ayanError.toFixed(7)});
  console.log("WSS03_COMPARE "+JSON.stringify(results.at(-1)));
}
const flat=results.flatMap(x=>Object.values(x.graha_errors_degrees));
const maxima={graha_degrees:Math.max(...flat),
  ascendant_degrees:Math.max(...results.map(x=>x.ascendant_error_degrees)),
  ayanamsha_degrees:Math.max(...results.map(x=>x.ayanamsha_error_degrees))};
const report={
  verification_scope:"independent Moshier/Lahiri reference for 8 synthetic instants",
  numeric_reference:fixtures.fixture_id,
  status:"discovery_only_chart_publication_NOT_approved",
  comparison_to_source:"Swiss Ephemeris test-only reference numbers, no runtime dependency",
  tolerance_discovery:toleranceDiscovery,max_error:maxima,
  results,failures,source_licence_gate:"MIT astronomy-engine active; Swiss remains test-only"
};
fs.mkdirSync("wss03-qa",{recursive:true});
fs.writeFileSync("wss03-qa/independent-report.json",JSON.stringify(report,null,2)+"\n");
console.log("WSS03_INDEPENDENT_MAX "+JSON.stringify(maxima));
console.log("WSS03_INDEPENDENT_FAILURES "+failures.length);
for(const f of failures)console.error("FAIL "+f);
if(failures.length)process.exitCode=1;
