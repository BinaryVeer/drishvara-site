/** Source-bound factors, evaluated only with a matching precision audit.
 * Digital passage verification is not independent Sanskrit review or approval.
 * No networking, storage, name input, active-Dasha selection or event forecast.
 */
import BANK from '../../data/methodology/jyotisha/wss-source-bound-rule-bank-v1.json' with {type:'json'};
import {assertChartPrecisionAudit} from './wss08-chart-audit-contract.mjs';
const LORDS=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const SIGNS=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const signOK=s=>Number.isInteger(s)&&s>=1&&s<=12;
const nth=(s,n)=>(s+n-2)%12+1;
const lord=s=>LORDS[s-1];
export function evaluateSourceBoundRuleBank({report,precisionAudit,language='en'}={}){
 if(!['en','hi'].includes(language))throw new RangeError('Only en and hi supported');
 if(report?.status!=='candidate_chart_report_not_approved_for_user_prediction'||report.ready_for_public_display!==false)
  throw new RangeError('Non-public candidate required');
 assertChartPrecisionAudit(precisionAudit,report);
 const d1=report.charts?.D1;
 const expected=[...LORDS.filter((v,i,a)=>a.indexOf(v)===i),'Rahu','Ketu'];
 if(!Array.isArray(d1?.grahas)||d1.grahas.length!==9||
    !expected.every(g=>d1.grahas.filter(p=>p.graha===g).length===1))
  throw new RangeError('Nine unique grahas required');
 const planet=g=>d1.grahas.find(p=>p.graha===g);
 const evidence=g=>precisionAudit.grahas.find(p=>p.graha===g);
 const stable=g=>evidence(g)?.D1?.state==='stable_candidate'&&
  signOK(planet(g)?.rashi?.rashi_index)&&evidence(g).D1.rashi===SIGNS[planet(g).rashi.rashi_index-1];
 const lagnaSafe=precisionAudit.D1.state==='stable_candidate'&&signOK(d1.lagna?.rashi_index)&&
  precisionAudit.D1.lagna===SIGNS[d1.lagna.rashi_index-1]&&expected.every(stable);
 const entries=BANK.rules.map(r=>{
  const out={id:r.id,kind:r.kind,source_ids:r.source_ids,source_references:r.source_ids.map(id=>{const s=BANK.sources.find(s=>s.id===id);return {work:s.work,passage:r.passage||s.passage,urls:s.urls,edition:s.edition};}),
   requires:r.requires,excludes:r.excludes,text:r.text[language],
   state:'withheld_precision_or_missing_factor',factors:null,publication_approved:false};
  if(r.kind==='symbolism')return {...out,state:'textual_symbolism_only',factors:{graha:r.graha,descriptor:r.descriptor[language]}};
  if(r.kind==='dignity'&&stable(r.graha)){
   const sign=planet(r.graha).rashi.rashi_index;
   return {...out,state:'sign_classification_only',factors:{graha:r.graha,sign,
    classification:sign===r.exaltation_sign?'exaltation_sign':sign===r.debilitation_sign?'debilitation_sign':'neither_exaltation_nor_debilitation'}};
  }
  if(r.kind==='aspect'&&stable(r.graha)){
   const sign=planet(r.graha).rashi.rashi_index;
   return {...out,state:'sign_aspect_geometry_only',factors:{graha:r.graha,origin_sign:sign,
    targets:r.offsets.map(n=>({offset:n,sign:nth(sign,n),
     // Uncertain target assignments must not leak into an aspect list.
     occupants:d1.grahas.filter(p=>stable(p.graha)&&p.rashi.rashi_index===nth(sign,n)).map(p=>p.graha)}))}};
  }
  if(r.kind==='house'&&lagnaSafe){
   const sign=nth(d1.lagna.rashi_index,r.house);
   return {...out,state:'house_topic_only',factors:{house:r.house,sign,lord:lord(sign),
    occupants:d1.grahas.filter(p=>p.rashi.rashi_index===sign).map(p=>p.graha)}};
  }
  if(r.kind==='vocation'){
   const origins=[{origin:'Lagna',sign:lagnaSafe?d1.lagna.rashi_index:null},
    ...['Moon','Sun'].map(g=>({origin:g,sign:stable(g)?planet(g).rashi.rashi_index:null}))];
   const paths=[];
   for(const o of origins){
    if(!signOK(o.sign))continue;
    const tenth=nth(o.sign,10),tenthLord=lord(tenth);
    const navamsa=report.charts?.D9?.grahas?.find(g=>g.graha===tenthLord);
    const auditedSign=evidence(tenthLord)?.D9;
    if(!navamsa||navamsa.state!=='candidate_numeric'||!signOK(navamsa.rashi_index)||
       auditedSign!==SIGNS[navamsa.rashi_index-1])continue;
    const navamsaLord=lord(navamsa.rashi_index);
    if(navamsaLord===r.graha)paths.push({origin:o.origin,origin_sign:o.sign,tenth_sign:tenth,
     tenth_lord:tenthLord,tenth_lord_D9_sign:navamsa.rashi_index,navamsa_lord:navamsaLord});
   }
   // Non-matches are not adverse evidence, and no strongest origin is chosen.
   return {...out,state:paths.length?'traditional_vocation_chain_observed':'no_qualified_matching_vocation_chain',
    factors:paths.length?paths:null};
  }
  return out;
 });
 return {id:BANK.id,version:BANK.version,language,status:BANK.status,entries,
  unresolved:BANK.unresolved,independent_sanskrit_review:false,ready_for_public_predictions:false,
  notice:language==='hi'?'ये जाँचे गए डिजिटल पाठों से जुड़े पारम्परिक कारक हैं। स्वतंत्र संस्कृत एवं संस्करण-समीक्षा शेष है; व्यक्तिगत भविष्यफल स्वीकृत नहीं है।':
   'These traditional factors are linked to checked digital passages. Independent Sanskrit and edition review remains pending; personal predictions are not approved.'};
}
