/** Local-only observation adapter. No names, networking or persistence. */
import {Body,Observer,SearchRiseSet,Equator,Horizon,SiderealTime,MakeTime,e_tilt} from 'astronomy-engine';
import {calculateNatalCandidate} from './wss03-natal-candidate.mjs';
import {pinnedLocalFields} from './wss-pinned-zone-provider.mjs';
import {BALA_PROFILE,CLASSICAL_GRAHAS,calculateClassicalBala} from './wss10-classical-bala-core.mjs';
import {assertChartPrecisionAudit} from './wss08-chart-audit-contract.mjs';
const norm=x=>((x%360)+360)%360;
export function balaObservationCandidate({utc,latitude,longitude,timezone}){
 const ms=Date.parse(utc),observer=new Observer(latitude,longitude,0);
 if(!Number.isFinite(ms)||Math.abs(latitude)>65||Math.abs(longitude)>180)throw new RangeError('Supported birth observations required');
 const natal=calculateNatalCandidate({utc,latitude,longitude});
 if(!natal.lagna)throw new RangeError('No qualified rising geometry');
 const riseList=[];let start=new Date(ms-2*86400000);
 for(let i=0;i<5;i++){
  const found=SearchRiseSet(Body.Sun,observer,1,start,2);
  if(!found)break;riseList.push(found.date.getTime());start=new Date(found.date.getTime()+1000);
 }
 const rise=riseList.filter(t=>t<=ms).at(-1),next=riseList.find(t=>t>ms);
 if(!Number.isFinite(rise)||!Number.isFinite(next))throw new RangeError('Sunrise unavailable');
 const sunset=SearchRiseSet(Body.Sun,observer,-1,new Date(rise+1000),2)?.date.getTime();
 if(!(rise<sunset&&sunset<next))throw new RangeError('Continuous solar day/night unavailable');
 const time=MakeTime(new Date(ms)),theta=norm(SiderealTime(time)*15+longitude);
 const solar=Equator(Body.Sun,time,observer,true,true);
 const natha=Math.abs(((theta-solar.ra*15+540)%360)-180);
 const eps=e_tilt(time).tobl*Math.PI/180,ra=theta*Math.PI/180;
 const mc=norm(Math.atan2(Math.sin(ra),Math.cos(ra)*Math.cos(eps))*180/Math.PI-natal.ayanamsha_degrees);
 const local=pinnedLocalFields(rise,timezone);
 const date=[String(local.year).padStart(4,'0'),String(local.month).padStart(2,'0'),String(local.day).padStart(2,'0')].join('-');
 return {profile:BALA_PROFILE,utc:new Date(ms).toISOString(),ascendant:natal.lagna.longitude_degrees,midheaven:mc,nathaDegrees:natha,
  sunriseUtc:new Date(rise).toISOString(),sunsetUtc:new Date(sunset).toISOString(),nextSunriseUtc:new Date(next).toISOString(),
  sunriseLocalDate:date,dayWeekday:new Date(date+'T00:00:00.000Z').getUTCDay(),
  planets:natal.grahas.filter(p=>CLASSICAL_GRAHAS.includes(p.graha)).map(p=>({graha:p.graha,longitude:p.sidereal_degrees,tropical:p.tropical_degrees})),
  twilight_state:Math.abs(Horizon(time,observer,solar.ra,solar.dec,'normal').altitude)>18?'clear':'unresolved',
  // Unspecified traditional twilight duration cannot silently award a bonus.
  twilight_clearance_seconds:Math.min(Math.abs(ms-rise),Math.abs(ms-sunset),Math.abs(ms-next))/1000,
  observations:{latitude,longitude,timezone,solar_horizon:'Astronomy Engine rise/set, sea-level observer',mean_motion:'declared classical mean model'}};
}
export function auditedClassicalStrengthCandidate({report,precisionAudit}){
 assertChartPrecisionAudit(precisionAudit,report);
 const duration=precisionAudit.birth_time_span_seconds;
 if(duration>3600)return {state:'withheld_clock_precision',planets:[],houses:[],ready_for_prediction:false};
 const start=Date.parse(report.basis.birth_instant_utc),geo=report.basis.geographic_basis;
 try{
  const fractions=[0,.125,.25,.375,.5,.625,.75,.875,.999];
  const samples=fractions.map(f=>calculateClassicalBala(balaObservationCandidate({utc:new Date(start+Math.round(f*duration*1000)).toISOString(),latitude:geo.latitude,longitude:geo.longitude,timezone:report.basis.timezone})));
  if(samples.some(s=>s.planets.length!==7))return {state:'withheld_war_configuration',reason:samples.find(s=>s.planets.length!==7)?.status,planets:[],houses:[],ready_for_prediction:false};
  return {state:'sampled_classical_strength_candidate',profile:BALA_PROFILE,samples_checked:samples.length,
   planets:samples[0].planets.map(p=>{const values=samples.map(s=>s.planets.find(x=>x.graha===p.graha).total);return {...p,sampled_total_min:Math.min(...values),sampled_total_max:Math.max(...values),
    // Sampling alone must not authorize a continuous stability/forecast claim.
    continuous_stability_qualified:false};}),houses:samples.every(s=>s.houses.length===12)?samples[0].houses.map(h=>({...h,sampled_total_min:Math.min(...samples.map(s=>s.houses[h.house-1].total)),sampled_total_max:Math.max(...samples.map(s=>s.houses[h.house-1].total)),continuous_stability_qualified:false})):[],
   ready_for_prediction:false,source_approval:false,
   limits:['Nine samples are not a continuous strength-bound proof','Sripathi strength houses are separate from the existing whole-sign factor houses','No source profile or published-table arithmetic is silently mixed or repaired']};
 }catch(error){return {state:'withheld_strength_observations',reason:String(error.message),planets:[],houses:[],ready_for_prediction:false};}
}
