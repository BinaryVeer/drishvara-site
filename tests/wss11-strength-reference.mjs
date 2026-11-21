import assert from 'node:assert/strict';
import reference from './fixtures/wss11-strength-reference.json' with {type:'json'};
import {calculateClassicalBala} from '../scripts/lib/wss10-classical-bala-core.mjs';
let compared=0;
function compare(actual,expected,path){
 if(typeof expected==='number'){
  assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-6,`${path}: ${actual} vs ${expected}`);compared++;
 }else if(Array.isArray(expected)){
  assert.equal(actual?.length,expected.length,path);expected.forEach((v,i)=>compare(actual[i],v,path+'.'+i));
 }else if(expected&&typeof expected==='object'){
  for(const [k,v] of Object.entries(expected)){
   compare(actual[k],v,path+'.'+k);
  }
 }else assert.equal(actual,expected,path);
}
for(const c of reference.cases){const actual=calculateClassicalBala(c.input);compare(actual,c.expected,c.name);assert.equal(actual.ready_for_prediction,false);}
assert.ok(reference.cases.length>=20);
console.log(`PASS ${reference.cases.length} full-component arithmetic cases, ${compared} independent numeric comparisons; no source or interval authorization inferred`);
const {default:source}=await import('./fixtures/wss11-raman-seven-varga-cells.json',{with:{type:'json'}});
const standard=reference.cases.find(c=>c.name==='raman_standard_declared_inputs');
const calculated=calculateClassicalBala(standard.input);
const conflicts=[];
for(const p of calculated.planets){
 assert.deepEqual(p.saptavarga_terms,source.printed_cells[p.graha]);
 const sum=source.printed_cells[p.graha].reduce((a,b)=>a+b,0);
 assert.equal(p.sthana_parts.saptavarga,sum);
 if(sum!==source.printed_totals[p.graha])conflicts.push({graha:p.graha,printed:source.printed_totals[p.graha],sum});
}
assert.deepEqual(conflicts.map(c=>c.graha),['Moon','Mercury','Venus']);
assert.equal(source.publication_approved,false);
console.log('PASS 49 visually checked Raman source cells; preserved conflicting totals',conflicts);
