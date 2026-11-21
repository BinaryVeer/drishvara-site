/** PM20.66 individual sign clauses; never an event or a conjunction of all receivers. */
const house=(s,o)=>(s-o+12)%12+1;
const valid=s=>Number.isInteger(s)&&s>=1&&s<=12;
const visible=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
export function marriageTransitClauses({seventhSign,seventhLordSign,seventhLordNavamsaSign,lagnaLord,seventhLord,moonSignLord,transits}){
 if(![seventhSign,seventhLordSign,seventhLordNavamsaSign].every(valid)||![lagnaLord,seventhLord,moonSignLord].every(g=>visible.includes(g)))throw new RangeError('Qualified natal sign clauses required');
 if(!Array.isArray(transits)||!visible.every(g=>transits.filter(p=>p.graha===g&&valid(p.transit_rashi_index)).length===1))throw new RangeError('Seven unique visible transit receivers required');
 const origins=[{basis:'seventh_house',sign:seventhSign},{basis:'seventh_lord_natal_sign',sign:seventhLordSign}];
 const receivers=[...new Set(['Venus','Mars',lagnaLord,seventhLord,moonSignLord])];
 const clauses=receivers.flatMap(g=>origins.map(o=>{
  const s=transits.find(p=>p.graha===g).transit_rashi_index,relative=house(s,o.sign);
  return {source_id:'PM20.66a',receiver:g,origin:o.basis,origin_sign:o.sign,transit_sign:s,relative_house:relative,match:[1,5,7,9].includes(relative)};
 }));
 const j=transits.find(p=>p.graha==='Jupiter').transit_rashi_index;
 const jupiter=[{basis:'seventh_lord_natal_sign',sign:seventhLordSign},{basis:'seventh_lord_navamsa_sign',sign:seventhLordNavamsaSign}].map(o=>({source_id:'PM20.66b',receiver:'Jupiter',origin:o.basis,origin_sign:o.sign,transit_sign:j,relative_house:house(j,o.sign),match:[1,5,9].includes(house(j,o.sign))}));
 return {state:'separate_noon_sign_clauses_not_event_timing',clauses,jupiter,require_all_receivers:false,event_window:null,ready_for_prediction:false};
}
