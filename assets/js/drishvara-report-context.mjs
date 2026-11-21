/** Presentation contracts only: no astrology rule, rating threshold or forecast. */
export function selectedReportContext(catalog,kind,key,language='en'){
 if(!['day','month','year'].includes(kind)||!['en','hi'].includes(language)||!Object.hasOwn(catalog[kind]||{},key))throw new RangeError('Available demo context required');
 const value=catalog[kind][key];
 if(kind==='day'){
  const snapshot=value[language];
  if(snapshot?.date!==key||!Array.isArray(snapshot.grahas))throw new RangeError('Snapshot/date mismatch');
  return {kind,key,start:key,end:key,samples:1,changeCount:null,snapshot,changes:[]};
 }
 if(value.period!==kind||value.ready_for_prediction!==false||!value.start_date.startsWith(key)||!Array.isArray(value.sign_changes))throw new RangeError('Period/date mismatch');
 return {kind,key,start:value.start_date,end:value.end_date,samples:value.sample_count,changeCount:value.sign_changes.length,changes:value.sign_changes,snapshot:null};
}
export function themeContextStatus(domain,context){
 if(!context?.key)throw new RangeError('Dated context required');
 return {theme:domain?.id??null,period:context.kind,periodKey:context.key,
  natalBasisAvailable:Boolean(domain?.houses?.length),
  requiredDivision:domain?.division??null,
  supportiveAssessment:null,adverseAssessment:null,eventWindow:null,
  state:domain?.houses?.length?'dated_factors_only_interpretation_unqualified':'withheld_natal_or_divisional_basis',
  ready_for_prediction:false};
}
