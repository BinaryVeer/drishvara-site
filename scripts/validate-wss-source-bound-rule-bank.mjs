import assert from 'node:assert/strict';
import bank from '../data/methodology/jyotisha/wss-source-bound-rule-bank-v1.json' with {type:'json'};
assert.equal(bank.ready_for_public_predictions,false);
assert.equal(bank.independent_sanskrit_review,false);
assert.equal(new Set(bank.rules.map(r=>r.id)).size,bank.rules.length);
const sources=new Map(bank.sources.map(s=>[s.id,s]));
for(const s of sources.values()){
 assert.ok(s.work&&s.passage&&s.edition&&s.scope&&s.checked_on);
 assert.equal(s.carriers_are_independent_editions,false);
 assert.equal(s.review_state,'digital_passage_checked_independent_recension_review_pending');
 assert.ok(new Set(s.urls).size>=2);
 for(const u of s.urls)assert.equal(new URL(u).protocol,'https:');
}
for(const r of bank.rules){
 assert.equal(r.publication_approved,false);
 assert.ok(r.source_ids.length&&r.source_ids.every(id=>sources.has(id)));
 assert.ok(r.text.en.length>40&&/[\u0900-\u097f]/.test(r.text.hi));
 assert.ok(Array.isArray(r.requires)&&r.excludes.length>=2);
 if(r.kind==='vocation')assert.ok(r.requires.includes('stable_tenth_lord_D9_sign'));
}
assert.deepEqual(Object.fromEntries(['house','vocation','dignity','aspect','symbolism'].map(k=>[k,bank.rules.filter(r=>r.kind===k).length])),
 {house:10,vocation:7,dignity:7,aspect:7,symbolism:7});
assert.equal(bank.unresolved.length,3);
console.log(`PASS ${bank.rules.length} unique bilingual source-bound rules, ${sources.size} passage groups, 3 explicit unresolved families; no publication approval`);
