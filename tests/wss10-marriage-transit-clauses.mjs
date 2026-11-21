import assert from 'node:assert/strict';
import {marriageTransitClauses} from '../scripts/lib/wss10-marriage-transit-clauses.mjs';
const names=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
let checks=0;
for(let origin=1;origin<=12;origin++)for(let transit=1;transit<=12;transit++){
 const actual=marriageTransitClauses({seventhSign:origin,seventhLordSign:origin,seventhLordNavamsaSign:origin,lagnaLord:'Sun',seventhLord:'Mercury',moonSignLord:'Saturn',transits:names.map(graha=>({graha,transit_rashi_index:transit}))});
 const expected=[0,4,6,8].map(d=>(origin-1+d)%12+1).includes(transit);
 assert.equal(actual.clauses.length,10);assert.ok(actual.clauses.every(c=>c.match===expected));
 const je=[0,4,8].map(d=>(origin-1+d)%12+1).includes(transit);
 assert.ok(actual.jupiter.every(c=>c.match===je));assert.equal(actual.require_all_receivers,false);assert.equal(actual.event_window,null);checks++;
}
assert.throws(()=>marriageTransitClauses({}),/Qualified/);
console.log(`PASS ${checks} rotations of PM20.66 separate receivers/origins; no invented simultaneous match or event window`);
