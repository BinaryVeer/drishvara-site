import assert from 'node:assert/strict';
import bank from '../data/methodology/jyotisha/wss-source-bound-rule-bank-v1.json' with {type:'json'};
import {assembleKundaliReportCandidate} from '../scripts/lib/wss07-kundali-report-candidate.mjs';
import {auditNatalPrecisionCandidate} from '../scripts/lib/wss08-natal-precision-audit.mjs';
import {evaluateSourceBoundRuleBank} from '../scripts/lib/wss05-source-bound-rule-bank.mjs';
const setup={birthDate:'1991-08-17',birthTime:'10:05:23',birthTimezone:'Asia/Kolkata',birthLatitude:23.3441,birthLongitude:85.3096,referenceDate:'2026-11-20',referenceTimezone:'Asia/Kolkata',referenceLatitude:23.3441,referenceLongitude:85.3096,timePrecisionSeconds:1,yearConvention:'civil_365_25'};
const report=assembleKundaliReportCandidate(setup);
const audit=auditNatalPrecisionCandidate({...setup,declaredPrecisionSeconds:1});
const run=(r=report,a=audit,language='en')=>evaluateSourceBoundRuleBank({report:r,precisionAudit:a,language});
const get=(v,id)=>v.entries.find(e=>e.id===id);
for(const language of ['en','hi']){
 const v=run(report,audit,language);
 assert.equal(v.entries.length,38);assert.equal(v.ready_for_public_predictions,false);
 assert.ok(v.entries.every(e=>e.publication_approved===false));
 assert.ok(v.entries.every(e=>!Object.hasOwn(e,'event_date')&&!Object.hasOwn(e,'probability')));
 assert.ok(v.entries.filter(e=>e.kind==='vocation').flatMap(e=>e.factors||[]).length>0);
 if(language==='hi')assert.match(v.notice,/संस्कृत/);
}
const signs=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
// Synthetic placements: these are predicate fixtures, not reference ephemerides.
let checks=0;
for(const rule of bank.rules.filter(r=>r.kind==='dignity')){
 for(let sign=1;sign<=12;sign++){
  const r=structuredClone(report),a=structuredClone(audit);
  r.charts.D1.grahas.find(g=>g.graha===rule.graha).rashi.rashi_index=sign;
  a.grahas.find(g=>g.graha===rule.graha).D1.rashi=signs[sign-1];
  const output=get(run(r,a),rule.id);
  assert.equal(output.factors.classification,sign===rule.exaltation_sign?'exaltation_sign':sign===rule.debilitation_sign?'debilitation_sign':'neither_exaltation_nor_debilitation');checks++;
 }
}
for(const [g,offsets] of Object.entries({Sun:[7],Moon:[7],Mercury:[7],Venus:[7],Mars:[4,7,8],Jupiter:[5,7,9],Saturn:[3,7,10]})){
 for(let sign=1;sign<=12;sign++){
  const r=structuredClone(report),a=structuredClone(audit);
  r.charts.D1.grahas.find(p=>p.graha===g).rashi.rashi_index=sign;
  a.grahas.find(p=>p.graha===g).D1.rashi=signs[sign-1];
  assert.deepEqual(get(run(r,a),'ASPECT_'+g.toUpperCase()).factors.targets.map(t=>t.sign),offsets.map(n=>(sign+n-2)%12+1));checks++;
 }
}
// Full tenth-lord -> D9 sign -> sign-lord chain: Mercury D9 Pisces must
// resolve to Jupiter, not Mercury or the tenth-sign occupants.
const r=structuredClone(report),a=structuredClone(audit);
r.charts.D1.lagna.rashi_index=9;a.D1.lagna=signs[8]; // Sagittarius tenth = Virgo, Mercury
const nav=r.charts.D9.grahas.find(p=>p.graha==='Mercury');
Object.assign(nav,{state:'candidate_numeric',rashi_index:12});
a.grahas.find(p=>p.graha==='Mercury').D9='Meena';
const chain=get(run(r,a),'VOCATION_JUPITER').factors.find(p=>p.origin==='Lagna');
assert.deepEqual(chain,{origin:'Lagna',origin_sign:9,tenth_sign:6,tenth_lord:'Mercury',tenth_lord_D9_sign:12,navamsa_lord:'Jupiter'});
a.grahas.find(p=>p.graha==='Mercury').D9=null;
assert.ok(!run(r,a).entries.flatMap(e=>Array.isArray(e.factors)?e.factors:[]).some(f=>f.origin==='Lagna'));
const uncertain=structuredClone(audit);
uncertain.D1.state='withheld_due_to_precision_or_boundary';
uncertain.grahas.find(g=>g.graha==='Moon').D1={state:'withheld_due_to_precision_or_boundary'};
const withheld=run(report,uncertain);
assert.ok(withheld.entries.filter(e=>e.kind==='house').every(e=>e.factors===null));
assert.equal(get(withheld,'DIGNITY_MOON').factors,null);
assert.equal(get(withheld,'ASPECT_MOON').factors,null);
assert.ok(!withheld.entries.filter(e=>e.kind==='vocation').flatMap(e=>e.factors||[]).some(f=>['Lagna','Moon'].includes(f.origin)));
assert.ok(withheld.entries.filter(e=>e.kind==='aspect').flatMap(e=>e.factors?.targets||[]).every(t=>!t.occupants.includes('Moon')));
for(const key of ['birth_instant_utc','birth_timezone','timezone_source_sha256','birth_longitude']){
 const bad=structuredClone(audit);bad.audit_basis[key]=key==='birth_longitude'?0:'wrong';
 assert.throws(()=>run(report,bad),/does not match/);
}
const duplicate=structuredClone(report);duplicate.charts.D1.grahas[0]=duplicate.charts.D1.grahas[1];
assert.throws(()=>run(duplicate),/Nine unique/);
assert.throws(()=>run(report,audit,'fr'),/Only en/);
assert.throws(()=>run(report,null),/mandatory/);
console.log(`PASS ${checks} sign predicates; bilingual coverage; full vocation chain; D9 and Moon boundaries; cross-birth audit rejection; no event or colour prescription`);
