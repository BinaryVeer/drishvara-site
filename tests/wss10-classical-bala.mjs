import assert from 'node:assert/strict';
import fixtures from './fixtures/wss10-bala-arithmetic-reference.json' with {type:'json'};
import {BALA_PROFILE,CLASSICAL_GRAHAS,calculateClassicalBala,classicalVargaSign,fullAspectVirupas,meanClassicalMotion,sripathiMidpoints} from '../scripts/lib/wss10-classical-bala-core.mjs';
import {balaObservationCandidate,auditedClassicalStrengthCandidate} from '../scripts/lib/wss10-bala-observations.mjs';
import {assembleKundaliReportCandidate} from '../scripts/lib/wss07-kundali-report-candidate.mjs';
import {auditNatalPrecisionCandidate} from '../scripts/lib/wss08-natal-precision-audit.mjs';
const near=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<=e,`${a} vs ${b}`);
let count=0;
for(const c of fixtures.cases){for(const [d,v] of Object.entries(c.vargas)){assert.equal(classicalVargaSign(c.longitude,+d),v);count++;}for(const [g,v] of Object.entries(c.aspects)){near(fullAspectVirupas(0,c.longitude,g),v);count++;}}
const lon=[180+53/60+55/3600,311+17/60+19/3600,229+30/60+34/3600,181+31/60+34/3600,84+49/3600,171+9/60+56/3600,124+22/60+41/3600];
const input={profile:BALA_PROFILE,twilight_state:'clear',utc:'1918-10-16T08:55:56Z',ascendant:298.45,midheaven:216.6,nathaDegrees:35,sunriseUtc:'1918-10-16T00:44:00Z',sunsetUtc:'1918-10-16T12:28:00Z',nextSunriseUtc:'1918-10-17T00:44:00Z',sunriseLocalDate:'1918-10-16',dayWeekday:3,planets:CLASSICAL_GRAHAS.map((graha,i)=>({graha,longitude:lon[i],tropical:(lon[i]+21+16/60)%360}))};
const b=calculateClassicalBala(input),sun=b.planets.find(p=>p.graha==='Sun');
assert.equal(b.planets.length,7);assert.equal(b.houses.length,12);
assert.deepEqual(b.calendar_lords,{year:'Saturn',month:'Mercury',day:'Mercury',hora:'Moon'});
assert.equal(sun.sthana_parts.saptavarga,90);near(sun.dig,(180+53/60+55/3600-36.6)/3);
for(const p of b.planets){
 near(p.sthana,Object.values(p.sthana_parts).reduce((a,b)=>a+b,0));
 near(p.kala,Object.values(p.kala_parts).reduce((a,b)=>a+b,0));
 near(p.total,p.sthana+p.dig+p.kala+p.cheshta+p.naisargika+p.drik);
 near(p.rupas,p.total/60);assert.equal(p.meets_profile_threshold,p.total>=p.minimum);
}
near(sun.cheshta,sun.kala_parts.ayana);
const moon=b.planets.find(p=>p.graha==='Moon');near(moon.cheshta,moon.kala_parts.paksha);
near(b.planets.find(p=>p.graha==='Saturn').naisargika,60/7);
assert.equal(sun.minimum,390);
assert.ok(b.houses.every(h=>Number.isFinite(h.total)&&h.ruler));
// Unequal quadrants: zodiac-arc distance, not ten virupas per house step.
for(const h of b.houses){
 const weak={insect:1,human:7,water:10,quadruped:4}[h.kind];
 const origin=sripathiMidpoints(input.ascendant,input.midheaven)[weak-1];
 const distance=Math.abs(((h.midpoint-origin+540)%360)-180);
 near(h.dig,distance/3,1e-7);
}
near(sripathiMidpoints(298.45,216.6)[3],36.6);
const unknown=calculateClassicalBala({...input,twilight_state:'unresolved'});assert.equal(unknown.houses.length,0);assert.equal(unknown.planets.length,7);
const war=structuredClone(input);war.planets.find(p=>p.graha==='Mars').longitude=210;war.planets.find(p=>p.graha==='Mercury').longitude=210.4;
const fought=calculateClassicalBala(war);assert.equal(fought.wars.length,1);
const m=fought.planets.find(p=>p.graha==='Mars'),mer=fought.planets.find(p=>p.graha==='Mercury');
near(m.kala_parts.yuddha,-mer.kala_parts.yuddha);assert.ok(m.kala_parts.yuddha>=0);
war.planets.find(p=>p.graha==='Mercury').longitude=210;assert.equal(calculateClassicalBala(war).status,'withheld_equal_longitude_war');
assert.throws(()=>calculateClassicalBala({...input,dayWeekday:2}),/calendar/);
assert.throws(()=>calculateClassicalBala({...input,profile:'unknown'}),/profile/);
assert.throws(()=>calculateClassicalBala({...input,planets:input.planets.slice(1)}),/Seven/);
const setup={birthDate:'1991-08-17',birthTime:'10:05:23',birthTimezone:'Asia/Kolkata',birthLatitude:23.3441,birthLongitude:85.3096,referenceDate:'2026-11-21',referenceTimezone:'Asia/Kolkata',referenceLatitude:23.3441,referenceLongitude:85.3096,timePrecisionSeconds:1,yearConvention:'civil_365_25'};
const report=assembleKundaliReportCandidate(setup),audit=auditNatalPrecisionCandidate({...setup,declaredPrecisionSeconds:1});
const actual=auditedClassicalStrengthCandidate({report,precisionAudit:audit});assert.equal(actual.planets.length,7);assert.equal(actual.samples_checked,9);assert.equal(actual.ready_for_prediction,false);
assert.ok(actual.planets.every(p=>p.continuous_stability_qualified===false));
const wrong=structuredClone(audit);wrong.audit_basis.birth_latitude=0;
assert.throws(()=>auditedClassicalStrengthCandidate({report,precisionAudit:wrong}),/does not match/);
assert.ok(meanClassicalMotion(input.utc).means.Sun>=0);
console.log(`PASS ${count} independent formula values; all six planetary components, 12 house strengths, named-profile arithmetic, war, twilight and matching-audit guards`);
