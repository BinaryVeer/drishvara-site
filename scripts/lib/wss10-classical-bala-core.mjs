/** Classical-strength arithmetic, explicit BPHS/Sripathi-support profile.
 * Does not obtain observations, authorize a chart or predict life events.
 * Ancient formulae are implemented independently; no external engine code.
 */
export const BALA_PROFILE='drishvara_bphs27_raman_support_v1_candidate';
export const CLASSICAL_GRAHAS=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const LORDS=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const FRIENDS={Sun:['Moon','Mars','Jupiter'],Moon:['Sun','Mercury'],Mars:['Sun','Moon','Jupiter'],Mercury:['Sun','Venus'],Jupiter:['Sun','Moon','Mars'],Venus:['Mercury','Saturn'],Saturn:['Mercury','Venus']};
const ENEMIES={Sun:['Venus','Saturn'],Moon:[],Mars:['Mercury'],Mercury:['Moon'],Jupiter:['Mercury','Venus'],Venus:['Sun','Moon'],Saturn:['Sun','Moon','Mars']};
const EXALT={Sun:10,Moon:33,Mars:298,Mercury:165,Jupiter:95,Venus:357,Saturn:200};
const MOOLA={Sun:[4,0,20],Moon:[1,3,30],Mars:[0,0,12],Mercury:[5,15,20],Jupiter:[8,0,10],Venus:[6,0,15],Saturn:[10,0,20]};
const MINIMUM={Sun:390,Moon:360,Mars:300,Mercury:420,Jupiter:390,Venus:330,Saturn:300};
const NATURAL={Sun:60,Moon:360/7,Mars:120/7,Mercury:180/7,Jupiter:240/7,Venus:300/7,Saturn:60/7};
const DISC={Mars:9.4,Mercury:6.6,Jupiter:190.4,Venus:16.6,Saturn:158};
const WEEK=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const CHALDEAN=['Saturn','Jupiter','Mars','Sun','Venus','Mercury','Moon'];
const norm=x=>((x%360)+360)%360;
const arc=(a,b)=>Math.abs(((a-b+540)%360)-180);
const house=(s,o)=>(s-o+12)%12+1;
const sign=l=>Math.floor(norm(l)/30);
const round=x=>Math.round(x*1e8)/1e8;
const finite=(x,n)=>{if(!Number.isFinite(x))throw new RangeError('Finite '+n+' required');return x;};
export function classicalVargaSign(longitude,division){
 finite(longitude,'longitude');const l=norm(longitude),s=Math.floor(l/30),d=l%30,odd=s%2===0;
 if(division===1)return s;
 if(division===2)return d<15?(odd?4:3):(odd?3:4);
 if(division===3)return (s+4*Math.floor(d/10))%12;
 if(division===7)return (s+(odd?0:6)+Math.floor(d/(30/7)))%12;
 if(division===9)return (s+(s%3===0?0:s%3===1?8:4)+Math.floor(d/(30/9)))%12;
 if(division===12)return (s+Math.floor(d/2.5))%12;
 if(division===30){
  const segments=odd?[[5,0],[10,10],[18,8],[25,2],[30,6]]:[[5,1],[12,5],[20,11],[25,9],[30,7]];
  return segments.find(([end])=>d<end)[1];
 }
 throw new RangeError('Supported divisions: 1,2,3,7,9,12,30');
}
export function fullAspectVirupas(from,to,graha){
 const d=norm(finite(to,'target')-finite(from,'source'));
 let v=d<30||d>=300?0:d<60?(d-30)/2:d<90?d-45:d<120?(120-d)/2+30:d<150?150-d:d<180?2*(d-150):(300-d)/2;
 if(graha==='Mars'&&((d>=90&&d<120)||(d>=210&&d<240)))v+=15;
 if(graha==='Jupiter'&&((d>=120&&d<150)||(d>=240&&d<270)))v+=30;
 if(graha==='Saturn'&&((d>=60&&d<90)||(d>=270&&d<300)))v+=45;
 return v; // Sripathi additive special-aspect convention; intentionally not capped.
}
export function meanClassicalMotion(utc){
 const t=Date.parse(utc);if(!Number.isFinite(t))throw new RangeError('UTC instant required');
 // Source model: Surya-Siddhanta revolution/day ratio, Raman epoch/calibrations.
 const epoch=Date.parse('1899-12-31T18:56:00.000Z'),days=(t-epoch)/86400000;
 const year=new Date(t).getUTCFullYear()-1900,mahayugaDays=1577917828;
 const motion=revolutions=>days*revolutions/mahayugaDays*360;
 const sun=norm(257.4568+motion(4320000));
 const means={Sun:sun,Mercury:sun,Venus:sun,Mars:norm(270.22+motion(2296832)),
  Jupiter:norm(220.04+motion(364220)-3.33-.0067*year),Saturn:norm(236.74+motion(146568)+5+.001*year)};
 const apogees={Mars:sun,Jupiter:sun,Saturn:sun,
  Mercury:norm(164+motion(17937060)+6.67-.00133*year),
  Venus:norm(328.51+motion(7022376)-5-.001*year)};
 return {means,apogees,model:'surya_siddhanta_rates_raman_1900_76E_epoch_prose_corrections',days};
}
export function sripathiMidpoints(ascendant,midheaven){
 finite(ascendant,'ascendant');finite(midheaven,'midheaven');
 const a=norm(ascendant),ic=norm(midheaven+180),quadrant=norm(ic-a);
 if(quadrant<=0||quadrant>=180)throw new RangeError('Unsupported angular quadrant geometry');
 const points=[];
 for(let h=0;h<12;h++){
  const q=Math.floor(h/3),part=h%3,starts=[a,a+quadrant,a+180,a+180+quadrant];
  const width=q%2===0?quadrant:180-quadrant;
  points.push(norm(starts[q]+width*part/3));
 }
 return points;
}
export function calculateClassicalBala(input){
 if(!['clear','twilight','unresolved'].includes(input?.twilight_state))throw new RangeError('Explicit twilight state required');
 if(input?.profile!==BALA_PROFILE)throw new RangeError('Explicit strength profile required');
 const {planets,ascendant,midheaven,utc,nathaDegrees,sunriseUtc,sunsetUtc,nextSunriseUtc,dayWeekday}=input;
 if(!Array.isArray(planets)||planets.length!==7||!CLASSICAL_GRAHAS.every(n=>planets.filter(p=>p.graha===n).length===1))throw new RangeError('Seven unique visible grahas required');
 finite(ascendant,'ascendant');finite(midheaven,'midheaven');finite(nathaDegrees,'natha');
 if(nathaDegrees<0||nathaDegrees>180||!Number.isInteger(dayWeekday)||dayWeekday<0||dayWeekday>6)throw new RangeError('Invalid temporal geometry');
 const time=Date.parse(utc),rise=Date.parse(sunriseUtc),set=Date.parse(sunsetUtc),next=Date.parse(nextSunriseUtc);
 if(next-rise<20*3600000||next-rise>28*3600000)throw new RangeError('Unsupported solar-day interval');
 if(![time,rise,set,next].every(Number.isFinite)||!(rise<=time&&time<next&&rise<set&&set<next))throw new RangeError('Surrounding sunrise/day/night interval required');
 const P=Object.fromEntries(planets.map(p=>[p.graha,{...p,longitude:norm(finite(p.longitude,'sidereal longitude')),tropical:norm(finite(p.tropical,'tropical longitude'))}]));
 const motion=meanClassicalMotion(utc),ascSign=sign(ascendant),day=time<set;
 const waxing=norm(P.Moon.longitude-P.Sun.longitude)<180;
 const mercuryMalefic=['Sun','Mars','Saturn',...(!waxing?['Moon']:[])].some(n=>sign(P[n].longitude)===sign(P.Mercury.longitude));
 const benefic=n=>['Jupiter','Venus'].includes(n)||(n==='Moon'&&waxing)||(n==='Mercury'&&!mercuryMalefic);
 const temporalFriend=(a,b)=>[2,3,4,10,11,12].includes(house(sign(P[b].longitude),sign(P[a].longitude)));
 const vargaScore=(n,s,d)=>{
  const ruler=LORDS[s],m=MOOLA[n],degree=P[n].longitude%30;
  if(d===1&&sign(P[n].longitude)===m[0]&&degree>=m[1]&&degree<m[2])return 45;
  if(ruler===n)return 30;
  const relation=(FRIENDS[n].includes(ruler)?1:ENEMIES[n].includes(ruler)?-1:0)+(temporalFriend(n,ruler)?1:-1);
  return {'2':22.5,'1':15,'0':7.5,'-1':3.75,'-2':1.875}[relation];
 };
 const epoch=Date.parse('1827-05-02T00:00:00.000Z');
 // Input date is the sunrise-defined day in the declared local calendar.
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.sunriseLocalDate||''))throw new RangeError('Sunrise-local calendar date required');
 if(new Date(input.sunriseLocalDate+'T00:00:00.000Z').toISOString().slice(0,10)!==input.sunriseLocalDate||new Date(input.sunriseLocalDate+'T00:00:00.000Z').getUTCDay()!==dayWeekday)throw new RangeError('Invalid sunrise calendar/weekday');
 const ahargana=Math.floor((Date.parse(input.sunriseLocalDate+'T00:00:00.000Z')-epoch)/86400000)+1;
 const yearLord=WEEK[((3+Math.floor(ahargana/360)*3)%7+7)%7];
 const monthLord=WEEK[((3+Math.floor(ahargana/30)*2)%7+7)%7];
 const dayLord=WEEK[dayWeekday],horaLord=CHALDEAN[(CHALDEAN.indexOf(dayLord)+Math.floor((time-rise)/3600000))%7];
 const third=Math.min(2,Math.floor((day?(time-rise)/(set-rise):(time-set)/(next-set))*3));
 const thirdLord=(day?['Mercury','Sun','Saturn']:['Moon','Venus','Mars'])[third];
 const phase=arc(P.Moon.longitude,P.Sun.longitude)/3;
 const pieces={};
 for(const n of CLASSICAL_GRAHAS){
  const l=P[n].longitude,s=sign(l),nav=classicalVargaSign(l,9),h=house(s,ascSign),male=['Sun','Mars','Jupiter'].includes(n),female=['Moon','Venus'].includes(n);
  const uccha=arc(l,norm(EXALT[n]+180))/3;
  const saptavarga_terms=[1,2,3,7,9,12,30].map(d=>vargaScore(n,classicalVargaSign(l,d),d));
  const saptavarga=saptavarga_terms.reduce((sum,v)=>sum+v,0);
  const oja=15*((female?s%2===1:s%2===0)+(female?nav%2===1:nav%2===0));
  const kendra=[1,4,7,10].includes(h)?60:[2,5,8,11].includes(h)?30:15;
  const drekkana=(male&&l%30<10)||(!male&&!female&&l%30>=10&&l%30<20)||(female&&l%30>=20)?15:0;
  const weak=['Sun','Mars'].includes(n)?norm(midheaven+180):['Moon','Venus'].includes(n)?midheaven:['Mercury','Jupiter'].includes(n)?norm(ascendant+180):ascendant;
  const dig=arc(l,weak)/3;
  const nath=n==='Mercury'?60:['Moon','Mars','Saturn'].includes(n)?nathaDegrees/3:60-nathaDegrees/3;
  // BPHS literal allocation: Moon phase once here and once in Cheshta.
  const paksha=['Moon','Jupiter','Venus'].includes(n)||(n==='Mercury'&&!mercuryMalefic)?phase:60-phase;
  const tribhaga=n==='Jupiter'||n===thirdLord?60:0;
  const abda=n===yearLord?15:0,masa=n===monthLord?30:0,vara=n===dayLord?45:0,hora=n===horaLord?60:0;
  const trop=P[n].tropical,bhuja=Math.min(trop%180,180-trop%180),q=Math.min(2,Math.floor(bhuja/30));
  const khanda=[45,33,12],ayanaArc=khanda.slice(0,q).reduce((a,b)=>a+b,0)+khanda[q]*(bhuja-q*30)/30;
  const north=trop<180,add=n==='Mercury'||(['Moon','Saturn'].includes(n)?!north:north);
  const ayana=(90+(add?ayanaArc:-ayanaArc))/3;
  const midpoint=motion.means[n]===undefined?null:norm(motion.means[n]+(((l-motion.means[n]+540)%360)-180)/2);
  const cheshta=n==='Sun'?ayana:n==='Moon'?paksha:arc(motion.apogees[n],midpoint)/3;
  let drik=0;
  for(const a of CLASSICAL_GRAHAS)if(a!==n){
   const v=fullAspectVirupas(P[a].longitude,l,a);
   drik+=(benefic(a)?1:-1)*v/4;
   if(['Mercury','Jupiter'].includes(a))drik+=v; // BPHS 27.19 literal superaddition, explicitly profiled.
  }
  pieces[n]={saptavarga_terms,sthana_parts:{uccha,saptavarga,oja,kendra,drekkana},sthana:uccha+saptavarga+oja+kendra+drekkana,dig,
   kala_parts:{nath,paksha,tribhaga,abda,masa,vara,hora,ayana,yuddha:0},cheshta,naisargika:NATURAL[n],drik};
 }
 const wars=[];
 const starry=['Mars','Mercury','Jupiter','Venus','Saturn'];
 for(let i=0;i<starry.length;i++)for(let j=i+1;j<starry.length;j++)if(arc(P[starry[i]].longitude,P[starry[j]].longitude)<1)wars.push([starry[i],starry[j]]);
 if(wars.some(([a,b])=>arc(P[a].longitude,P[b].longitude)<1e-9))return {profile:BALA_PROFILE,status:'withheld_equal_longitude_war',planets:[],houses:[],ready_for_prediction:false};
 if(new Set(wars.flat()).size!==wars.flat().length)return {profile:BALA_PROFILE,status:'withheld_multiple_simultaneous_wars',planets:[],houses:[],ready_for_prediction:false};
 for(const [a,b] of wars){
  const subtotal=n=>pieces[n].sthana+pieces[n].dig+Object.entries(pieces[n].kala_parts).filter(([k])=>!['ayana','yuddha'].includes(k)).reduce((s,[,v])=>s+v,0);
  const transfer=Math.abs(subtotal(a)-subtotal(b))/Math.abs(DISC[a]-DISC[b]);
  const winner=P[a].longitude<P[b].longitude?a:b,loser=winner===a?b:a;
  pieces[winner].kala_parts.yuddha=transfer;pieces[loser].kala_parts.yuddha=-transfer;
 }
 const results=CLASSICAL_GRAHAS.map(n=>{
  const p=pieces[n],kala=Object.values(p.kala_parts).reduce((a,b)=>a+b,0),total=p.sthana+p.dig+kala+p.cheshta+p.naisargika+p.drik;
  return {graha:n,...p,kala,total:round(total),rupas:round(total/60),minimum:MINIMUM[n],meets_profile_threshold:total>=MINIMUM[n]};
 });
 const mids=sripathiMidpoints(ascendant,midheaven);
 const bhavas=input.twilight_state==='unresolved'?[]:mids.map((l,i)=>{
  const s=sign(l),local=l%30,kind=s===7?'insect':[2,5,6,10].includes(s)||(s===8&&local<15)?'human':[3,11].includes(s)||(s===9&&local>=15)?'water':'quadruped';
  const weak={insect:1,human:7,water:10,quadruped:4}[kind];
  const dig=arc(l,mids[weak-1])/3;
  let drik=0;
  for(const n of CLASSICAL_GRAHAS){const v=fullAspectVirupas(P[n].longitude,l,n);drik+=(benefic(n)?1:-1)*v/4;if(['Mercury','Jupiter'].includes(n))drik+=v;}
  const ruler=LORDS[s],lordStrength=results.find(p=>p.graha===ruler).total;
  // BPHS 27.30–31 additions are separate from the three-part base.
  const start=norm(mids[(i+11)%12]+norm(l-mids[(i+11)%12])/2),end=norm(l+norm(mids[(i+1)%12]-l)/2);
  const occupants=CLASSICAL_GRAHAS.filter(n=>norm(P[n].longitude-start)<norm(end-start));
  const occupantBonus=occupants.reduce((a,n)=>a+(['Mercury','Jupiter'].includes(n)?60:['Sun','Mars','Saturn'].includes(n)?-60:0),0);
  const headRising=[2,4,5,6,7,10].includes(s),backRising=[0,1,3,8,9].includes(s);
  const risingBonus=input.twilight_state==='twilight'?(s===11?15:0):(day&&headRising||!day&&backRising?15:0);
  return {house:i+1,midpoint:round(l),ruler,kind,lord_strength:lordStrength,dig,drik,occupant_bonus:occupantBonus,rising_bonus:risingBonus,
   total:round(lordStrength+dig+drik+occupantBonus+risingBonus)};
 });
 return {profile:BALA_PROFILE,status:'classical_strength_arithmetic_candidate',planets:results,houses:bhavas,
  calendar_lords:{year:yearLord,month:monthLord,day:dayLord,hora:horaLord},wars,
  house_method:'Sripathi strength houses; separate from existing whole-sign interpretation houses',ready_for_prediction:false,
  source_profile_limits:['Declared diagnostic synthesis, not an authenticated single-recension engine',
   'BPHS 27 literal Drik, Sun/Moon Cheshta and minimums; Raman fractional Saptavargaja scores',
   'Raman 1900/76E tabular mean-motion calibration for Cheshta; not a modern mean-orbit precision assertion',
   'Raman lesser-numeric-longitude winner and canonical discs for isolated wars',
   'Twilight rising-sign bonus not assigned without an explicit twilight definition']};
}
