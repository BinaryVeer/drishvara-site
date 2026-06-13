import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const moduleDir=path.dirname(fileURLToPath(import.meta.url));
const defaultRoot=path.resolve(moduleDir,'../..');
const readJson=(root,p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const norm=v=>String(v??'').trim().toLowerCase().replace(/[\s_\-/]+/g,'').replace(/[^a-z0-9]/g,'');
const validTZ=tz=>{ if(typeof tz!=='string'||!tz.trim()) return false; try{new Intl.DateTimeFormat('en-US',{timeZone:tz}).format(new Date(0));return true;}catch{return false;} };
const parseDate=v=>{ if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)) return {ok:false,status:'invalid_civil_date'}; const [y,m,d]=v.split('-').map(Number); const x=new Date(Date.UTC(y,m-1,d)); if(x.getUTCFullYear()!==y||x.getUTCMonth()+1!==m||x.getUTCDate()!==d) return {ok:false,status:'invalid_civil_date'}; if(v<'1900-01-01'||v>'2100-12-31') return {ok:false,status:'unsupported_date_range'}; return {ok:true,value:v}; };
const fail=(status,date,trace,extra={})=>({status,resolved:false,civil_date:date??null,public_output_allowed:false,computation_executed:false,...extra,trace});
export function loadAg74kResolverContext(root=defaultRoot){
 const locationsPath='data/knowledge-base/panchang-festival/production/ag74d-panchang-expanded-location-records.json';
 const aliasPath='data/knowledge-base/location-intelligence/production/ag74i-varanasi-default-location-alias-record.json';
 const profilePath='data/knowledge-base/panchang-festival/production/ag74j-drishvara-varanasi-standard-profile.json';
 const versionPath='data/knowledge-base/panchang-festival/production/ag74j-methodology-and-rule-set-version-contract.json';
 const bank=readJson(root,locationsPath), alias=readJson(root,aliasPath), profile=readJson(root,profilePath), versions=readJson(root,versionPath).versions;
 const byId=new Map(), byAlias=new Map();
 for(const r of bank.records||[]){byId.set(r.location_id,{...r,source_record_path:locationsPath});byAlias.set(norm(r.label),r.location_id);}
 for(const a of alias.aliases||[]) byAlias.set(norm(a),alias.canonical_location_id);
 byAlias.set(norm(alias.display_label),alias.canonical_location_id);
 return {byId,byAlias,profile,versions};
}
export function resolveAg74kPanchangInput(input,ctx=loadAg74kResolverContext()){
 const trace={resolver_version:'1.0.0',...ctx.versions,source_record_path:null,resolution_steps:[]};
 if(input&&Object.prototype.hasOwnProperty.call(input,'method')){trace.resolution_steps.push('method_selector_rejected');return fail('unsupported_method_selector',input.civil_date,trace);}
 const date=parseDate(input?.civil_date);trace.resolution_steps.push('strict_civil_date_validation');if(!date.ok)return fail(date.status,input?.civil_date,trace);
 if(!['named_location','coordinate_first'].includes(input?.mode)){trace.resolution_steps.push('input_mode_rejected');return fail('invalid_input_mode',date.value,trace);}
 let location;
 if(input.mode==='named_location'){
  let id=input.canonical_location_id||null; trace.resolution_steps.push(id?'canonical_id_lookup':'approved_alias_lookup'); if(!id&&input.alias)id=ctx.byAlias.get(norm(input.alias))||null;
  const r=id?ctx.byId.get(id):null; if(!r){trace.resolution_steps.push('named_location_not_found');return fail('unsupported_location',date.value,trace);}
  if(input.timezone&&input.timezone!==r.timezone){trace.source_record_path=r.source_record_path;trace.resolution_steps.push('timezone_conflict');return fail('timezone_conflict',date.value,trace,{canonical_location_id:r.location_id,expected_timezone:r.timezone,supplied_timezone:input.timezone});}
  location={resolution_type:'named_location',canonical_location_id:r.location_id,display_label:r.label,country:r.country,region:r.region,latitude:r.latitude,longitude:r.longitude,timezone:r.timezone,coordinate_precision:'approved_curated_city_coordinate',source_record_path:r.source_record_path}; trace.source_record_path=r.source_record_path; trace.resolution_steps.push('approved_named_location_resolved');
 } else {
  const lat=Number(input.latitude),lon=Number(input.longitude); trace.resolution_steps.push('coordinate_first_validation_started');
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180){trace.resolution_steps.push('coordinate_range_rejected');return fail('invalid_coordinates',date.value,trace);}
  if(!validTZ(input.timezone)){trace.resolution_steps.push('iana_timezone_rejected');return fail('unsupported_timezone',date.value,trace);}
  location={resolution_type:'coordinate_first',canonical_location_id:null,display_label:typeof input.optional_place_label==='string'&&input.optional_place_label.trim()?input.optional_place_label.trim():`Custom Coordinates (${lat}, ${lon})`,country:null,region:null,latitude:lat,longitude:lon,timezone:input.timezone,coordinate_precision:'user_supplied_unstored',source_record_path:null}; trace.resolution_steps.push('coordinate_first_resolved_without_geocoding');
 }
 trace.resolution_steps.push('ag74j_profile_attached','varanasi_annual_book_key_attached');
 return {status:'resolved',resolved:true,civil_date:date.value,location,canonical_profile:{profile_id:ctx.profile.profile_id,public_label:ctx.profile.public_label,lunar_month_convention:ctx.profile.lunar_month_convention,hindu_year_system:ctx.profile.hindu_year_system,astronomical_profile:ctx.profile.astronomical_profile,ayanamsha_profile:ctx.profile.ayanamsha_profile},annual_book_key:{civil_date:date.value,place_id:'varanasi_in',timezone:'Asia/Kolkata',instant_conversion_applied:false},public_output_allowed:false,computation_executed:false,persistence_performed:false,geocoding_performed:false,trace};
}
