/** Audit reference arithmetic only. This does not calculate Shadbala. */
const ORDER=['sthana','dig','kala','cheshta','naisargika','drik'];
const NATURAL={Sun:60,Moon:360/7,Mars:120/7,Mercury:180/7,Jupiter:240/7,Venus:300/7,Saturn:60/7};
export function auditStrengthReference(rows){
 if(!Array.isArray(rows)||rows.length!==7||new Set(rows.map(r=>r.graha)).size!==7||
    !Object.keys(NATURAL).every(g=>rows.some(r=>r.graha===g)))throw new RangeError('Seven unique classical graha rows required');
 const findings=[];
 const results=rows.map(r=>{
  if(!ORDER.every(k=>Number.isFinite(r.components?.[k]))||!Number.isFinite(r.printed_total)||!Number.isFinite(r.printed_rupas))
   throw new RangeError('Finite source components, total and rupas required');
  const sum=ORDER.reduce((a,k)=>a+r.components[k],0);
  if(Math.abs(sum-r.printed_total)>.04)findings.push({graha:r.graha,field:'total',sum:Number(sum.toFixed(4)),printed:r.printed_total});
  if(Math.abs(r.printed_total/60-r.printed_rupas)>.006)findings.push({graha:r.graha,field:'rupas',from_printed_total:Number((r.printed_total/60).toFixed(4)),printed:r.printed_rupas});
  if(Math.abs(r.components.naisargika-NATURAL[r.graha])>.015)findings.push({graha:r.graha,field:'naisargika',from_ladder:Number(NATURAL[r.graha].toFixed(4)),printed:r.components.naisargika});
  return {graha:r.graha,component_sum:Number(sum.toFixed(4)),rupas_from_components:Number((sum/60).toFixed(4))};
 });
 return {status:findings.length?'reference_arithmetic_conflict':'reference_arithmetic_consistent',
  arithmetic_consistent:findings.length===0,results,findings,
  // Arithmetic agreement alone can never authorize an astronomical benchmark.
  astronomical_benchmark_qualified:false,independent_scholarly_approval:false,public_prediction_release:false};
}
