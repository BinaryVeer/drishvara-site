/** Source-linked, in-memory timing factors. Never an event predictor. */
import REGISTER from '../../data/methodology/jyotisha/wss09-timing-source-register-v1.json' with {type:'json'};
import {evaluateSourceBoundRuleBank} from './wss05-source-bound-rule-bank.mjs';
import {dashaUncertaintyCandidate,stableDashaContext} from './wss08-dasha-uncertainty.mjs';
import {calculateNatalCandidate} from './wss03-natal-candidate.mjs';
const NAMES=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
const LORDS=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const SIGNS=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const sign=x=>Number.isInteger(x)&&x>=1&&x<=12;
const house=(s,origin)=>(s-origin+12)%12+1;
export function evaluateTransitVedha({snapshot,natalMoonSign,marginDegrees=.04}={}){
 if(!Number.isFinite(marginDegrees)||marginDegrees<.04||marginDegrees>.2)throw new RangeError('Qualifying margin required');
 if(!sign(natalMoonSign))return {state:'withheld_natal_moon',entries:[],ready_for_prediction:false};
 if(snapshot?.status!=='wss05_06_candidate_structured_context_not_prediction'||snapshot.ready_for_prediction!==false||
  snapshot.sampling_policy!=='local_12_00_daily_snapshot_not_full_day_event_resolution'||
  !Array.isArray(snapshot.grahas)||snapshot.grahas.length!==9||
  !NAMES.every(n=>snapshot.grahas.filter(g=>g.graha===n).length===1))throw new RangeError('Complete candidate noon snapshot required');
 const rows=snapshot.grahas.map(g=>{
  const l=g.longitude_sidereal_degrees;
  if(!Number.isFinite(l)||l<0||l>=360||!sign(g.transit_rashi_index)||Math.floor(l/30)+1!==g.transit_rashi_index)
   throw new RangeError('Transit longitude/sign disagreement');
  return {...g,house:house(g.transit_rashi_index,natalMoonSign),near:Math.min(l%30,30-l%30)<=marginDegrees};
 });
 if(rows.some(g=>g.near))return {state:'withheld_transit_sign_boundary',entries:[],ready_for_prediction:false};
 return {state:'noon_snapshot_factors_only',ready_for_prediction:false,entries:REGISTER.transit_rules.map(r=>{
  const current=rows.find(g=>g.graha===r.graha),vedha=r.pairs[String(current.house)]??null;
  const occupants=vedha?rows.filter(g=>g.graha!==r.graha&&g.house===vedha):[];
  const exempt=occupants.filter(g=>r.exempt_blockers.includes(g.graha)).map(g=>g.graha);
  const blockers=occupants.filter(g=>!r.exempt_blockers.includes(g.graha)&&!['Rahu','Ketu'].includes(g.graha)).map(g=>g.graha);
  const nodes=occupants.filter(g=>['Rahu','Ketu'].includes(g.graha)).map(g=>g.graha);
  return {id:r.id,graha:r.graha,source_id:r.source_id,moon_relative_house:current.house,vedha_house:vedha,
   blockers,exempt_blockers:exempt,node_review:nodes,state:!vedha?'outside_list_not_an_adverse_verdict':
    blockers.length?'classical_vedha_present':nodes.length?'node_obstruction_lineage_review':'listed_position_without_classical_vedha',
   whole_day_verdict:null,outcome:null};
 })};
}
export function evaluateTimingReview({report,precisionAudit,language='en'}={}){
 const bank=evaluateSourceBoundRuleBank({report,precisionAudit,language});
 const d1=report.charts.D1,graha=n=>d1.grahas.find(g=>g.graha===n);
 const stable=n=>precisionAudit.grahas.find(g=>g.graha===n)?.D1?.state==='stable_candidate'&&
  precisionAudit.grahas.find(g=>g.graha===n).D1.rashi===SIGNS[graha(n).rashi.rashi_index-1];
 const moonSafe=Boolean(precisionAudit.janma_rashi&&precisionAudit.janma_nakshatra&&stable('Moon'));
 const snapshot=report.astronomical_birth_context?.date_specific_transits;
 if(snapshot?.reference_local_date!==report.basis.ref_day||!Number.isFinite(Date.parse(snapshot?.utc)))
  throw new RangeError('Reference snapshot must match report date');
 const transit=evaluateTransitVedha({snapshot,natalMoonSign:moonSafe?graha('Moon').rashi.rashi_index:null});
 // Recompute from the same audited birth, never trust a caller-supplied envelope.
 const envelope=moonSafe?dashaUncertaintyCandidate({moonSiderealLongitude:graha('Moon').sidereal_degrees,
  birthUtc:report.basis.birth_instant_utc,birthPrecisionSeconds:precisionAudit.birth_time_span_seconds,
  yearConvention:report.basis.dasha_year_convention}):null;
 const period=stableDashaContext(envelope,snapshot.utc);
 const periodSafe=period.state==='stable_under_assumed_margin';
 const inception={source_id:'BPHS48',state:'withheld_period_boundary',samples:0,positions:[],outcome:null};
 if(periodSafe){
  const i=envelope.periods.findIndex(p=>p.lord===period.major_lord&&Date.parse(p.start.latest_utc)<=Date.parse(snapshot.utc)&&Date.parse(snapshot.utc)<Date.parse(p.end.earliest_utc));
  if(i===0)inception.state='withheld_birth_clipped_first_period_not_true_inception';
  else if(i>0){
   const p=envelope.periods[i],a=Date.parse(p.start.earliest_utc),b=Date.parse(p.start.latest_utc);
   try{
    const charts=[0,.25,.5,.75,1].map(t=>calculateNatalCandidate({utc:new Date(a+(b-a)*t).toISOString(),
     latitude:report.basis.geographic_basis.latitude,longitude:report.basis.geographic_basis.longitude}));
    inception.samples=charts.length;
    inception.state='inception_sampled_strength_synthesis_unqualified';
    inception.geography='birth_place_convention_for_diagnostics_only';
    inception.positions=NAMES.map(n=>{
     const longs=charts.map(c=>c.grahas.find(g=>g.graha===n).sidereal_degrees);
     const signs=longs.map(l=>Math.floor(l/30)+1);
     const stableSign=new Set(signs).size===1&&longs.every(l=>Math.min(l%30,30-l%30)>.04);
     return {graha:n,natal_sign:stable(n)?graha(n).rashi.rashi_index:null,inception_sign:stableSign?signs[0]:null};
    });
   }catch{inception.state='withheld_inception_outside_supported_ephemeris';}
  }
 }
 const houseFactor=n=>bank.entries.find(e=>e.id==='HOUSE_'+n)?.factors;
 const h7=houseFactor(7),h10=houseFactor(10);
 const career={source_id:'BPHS48',state:'withheld_lagna_or_period',pattern:false,period_match:false,outcome:null};
 if(h10&&periodSafe){
  const tenth=h10.lord;
  const associates=[5,9].map(n=>houseFactor(n)?.lord).filter(n=>n&&n!==tenth&&graha(n).rashi.rashi_index===graha(tenth).rashi.rashi_index);
  career.pattern=associates.length>0;career.period_match=period.major_lord===tenth;
  career.state='natal_association_and_major_period_factors_only';
 }
 const marriage={source_id:'PM20',state:'withheld_lagna_period_or_division',candidates:[],period_matches:[],jupiter_sign_match:null,outcome:null,event_window:null};
 if(h7&&periodSafe){
  const candidates=new Set([h7.lord,'Venus','Moon',...h7.occupants.filter(n=>!['Rahu','Ketu'].includes(n))]);
  for(const e of bank.entries.filter(e=>e.kind==='aspect'))if(e.factors?.targets.some(t=>t.sign===h7.sign))candidates.add(e.factors.graha);
  const seventh=graha(h7.lord).rashi.rashi_index;
  candidates.add(LORDS[seventh-1]);
  const d9=report.charts.D9.grahas.find(g=>g.graha===h7.lord);
  const audited=precisionAudit.grahas.find(g=>g.graha===h7.lord)?.D9;
  if(d9?.state==='candidate_numeric'&&sign(d9.rashi_index)&&audited===SIGNS[d9.rashi_index-1]){
   candidates.add(LORDS[d9.rashi_index-1]);
   marriage.state='partial_natal_period_and_Jupiter_factors_only';marriage.candidates=[...candidates];
   marriage.period_matches=[period.major_lord,period.antar_lord].filter((n,i,a)=>candidates.has(n)&&a.indexOf(n)===i);
   if(transit.entries.length){
    const j=snapshot.grahas.find(g=>g.graha==='Jupiter').transit_rashi_index;
    marriage.jupiter_sign_match=[seventh,d9.rashi_index].some(s=>[1,5,9].includes(house(j,s)));
   }
  }
 }
 return {status:'private_timing_factor_review_not_event_prediction',language,transit,period:{...period},inception,career,marriage,
  notice:language==='hi'?'गोचर-वेद तथा दशा एवं विवाह-संबंधी कारकों की समीक्षा है। ग्रह-बल का पूर्ण संश्लेषण और स्वतंत्र विद्वत् समीक्षा शेष है; कोई घटना या तिथि निश्चित नहीं की गई है।':
   'Transit vedha and period/relationship factors are reviewed. Complete strength synthesis and independent scholarly review remain outstanding; no event or date is determined.',
  ready_for_public_predictions:false,independent_scholar_review:false};
}
