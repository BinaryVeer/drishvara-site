import assert from 'node:assert/strict';
import fixtures from './fixtures/wss10-observation-reference.json' with {type:'json'};
import {balaObservationCandidate} from '../scripts/lib/wss10-bala-observations.mjs';
import {calculateNatalCandidate} from '../scripts/lib/wss03-natal-candidate.mjs';
const worst={mc_degrees:0,solar_event_seconds:0};
for(const c of fixtures.cases){
 const o=balaObservationCandidate(c),n=calculateNatalCandidate(c);
 const delta=Math.abs(((o.midheaven+n.ayanamsha_degrees-c.midheaven_tropical+540)%360)-180);
 worst.mc_degrees=Math.max(worst.mc_degrees,delta);
 assert.ok(delta<.0001,`MC ${c.place} ${c.utc}: ${delta}`);
 for(const [actual,key] of [['sunriseUtc','sunrise'],['sunsetUtc','sunset'],['nextSunriseUtc','next_sunrise']]){
  const seconds=Math.abs(Date.parse(o[actual])/1000-c[key+'_unix']);
  worst.solar_event_seconds=Math.max(worst.solar_event_seconds,seconds);
  // Separate 5s observation tolerance, not a strength or interpretation tolerance.
  assert.ok(seconds<5,`${key} ${c.place} ${c.utc}: ${seconds}`);
 }
}
assert.equal(fixtures.cases.length,24);
console.log('PASS independent Swiss/Moshier observations, 24 historical/global cases',worst);
