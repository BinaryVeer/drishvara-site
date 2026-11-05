/**
 * Staging-only interactive Kundali preview — browser-only, no account/network.
 * This is a functional UX test of the WSS02–WSS07 candidate, NOT a public forecast.
 * The four-location list is a representative QA fixture, not the production 3,266-place selector.
 */
import {assembleKundaliReportCandidate} from "./wss07-kundali-report-candidate.mjs";
import {buildBilingualCandidateView,languagePack} from "./wss07-bilingual-report-presenter.mjs";
import {resolveName,RECORDS} from "./wss07-nama-rashi-core.mjs";

const SAMPLE_PLACES=Object.freeze({
 "ranchi":{name:"Ranchi",hi:"रांची",lat:23.3441,lon:85.3096,tz:"Asia/Kolkata"},
 "bengaluru":{name:"Bengaluru",hi:"बेंगलुरु",lat:12.9716,lon:77.5946,tz:"Asia/Kolkata"},
 "london":{name:"London",hi:"लंदन",lat:51.50853,lon:-0.12574,tz:"Europe/London"},
 "sydney":{name:"Sydney",hi:"सिडनी",lat:-33.8688,lon:151.2093,tz:"Australia/Sydney"}
});
const $=selector=>document.querySelector(selector);
const make=(tag,text,cls)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined&&text!==null)node.textContent=String(text);
 return node;
};
let language="en",candidate=null,confirmedSyllableKey="";
const state={failures:0,lastPubliclyReady:false};
const labels={
 en:{
   name:"Full name / traditional name",date:"Date of birth",clock:"Birth time (24-hour)",
   place:"Birthplace (sample approved-like locations)",ref:"Reference date",precision:"Time precision",
   dasha:"Daśā year convention",consent:"I consent to local Nāma Rāśi lookup from the entered name",
   syllable:"Confirm name's traditional first syllable",button:"Calculate private research preview",
   clear:"Clear this session",opening:"Enter all four birth details. This research preview does not transmit or store them.",
   missing:"Enter a name, birth date, birth time and sample birth place.",
   failed:"Calculation is unavailable for these details. Check the date, clock and location basis.",
   status:"Private preview only · Not approved for end-user horoscope predictions",
   generated:"Computed candidate — not a verified personal forecast"
 },
 hi:{
   name:"पूरा नाम / परम्परागत नाम",date:"जन्म तिथि",clock:"जन्म समय (24-घंटे)",
   place:"जन्मस्थान (परीक्षण सूची)",ref:"गणना हेतु तिथि",precision:"समय की सटीकता",
   dasha:"दशा वर्ष पद्धति",consent:"मैं नाम से नाम राशि की स्थानीय गणना की सहमति देता/देती हूँ",
   syllable:"नाम के परम्परागत प्रथम अक्षर की पुष्टि करें",button:"निजी शोध पूर्वावलोकन की गणना करें",
   clear:"इस सत्र को साफ़ करें",opening:"नाम, जन्म तिथि, समय और स्थान भरें। इस शोध पूर्वावलोकन में कुछ भी भेजा या सहेजा नहीं जाता।",
   missing:"नाम, जन्म तिथि, समय और परीक्षण जन्मस्थान भरें।",
   failed:"इन विवरणों पर गणना उपलब्ध नहीं है। तिथि, समय और स्थान जाँचें।",
   status:"केवल निजी पूर्वावलोकन · वास्तविक भविष्यफल के लिए अनुमोदित नहीं",
   generated:"गणना-आधारित परीक्षण — सत्यापित व्यक्तिगत भविष्यफल नहीं"
 }
};
function item(parent,tag,text,cls) {const node=make(tag,text,cls);parent.append(node);return node;}
function info(parent,label,value){
 const row=item(parent,"div",null,"kv");
 item(row,"span",label,"kv-label");
 item(row,"strong",value??"—","kv-value");
 return row;
}
function card(parent,heading){
 const section=item(parent,"section",null,"panel");
 item(section,"h2",heading);return section;
}
function table(parent,headers,rows){
 const wrap=item(parent,"div",null,"table-wrap"),tbl=item(wrap,"table");
 const thead=item(tbl,"thead"),head=item(thead,"tr");
 headers.forEach(h=>item(head,"th",h));
 const body=item(tbl,"tbody");
 for(const row of rows){const tr=item(body,"tr");row.forEach(v=>item(tr,"td",v??"—"));}
 return tbl;
}
function updateLanguage(){
 const lbl=labels[language];
 document.documentElement.lang=language;
 for(const [id,key] of [
   ["wss-name-label","name"],["wss-date-label","date"],["wss-time-label","clock"],
   ["wss-place-label","place"],["wss-reference-label","ref"],["wss-precision-label","precision"],
   ["wss-dasha-label","dasha"],["wss-consent-label","consent"],["wss-sound-label","syllable"]
 ])$("#"+id).textContent=lbl[key];
 $("#wss-generate").textContent=lbl.button;
 $("#wss-clear").textContent=lbl.clear;
 $("#wss-disclaimer").textContent=lbl.status;
 for(const b of document.querySelectorAll("[data-language-choice]"))
   b.setAttribute("aria-pressed",String(b.dataset.languageChoice===language));
 for(const [key,place] of Object.entries(SAMPLE_PLACES))
   $("#wss-birth-place").querySelector('option[value="'+key+'"]').textContent=language==="hi"?place.hi:place.name;
 updateSyllable();
 render();
}
function updateSyllable(){
 const select=$("#wss-syllable"),field=$("#wss-sound-wrap"),name=$("#wss-name").value;
 const consent=$("#wss-nama-consent").checked;
 select.replaceChildren();
 select.append(new Option(language==="hi"?"प्रथम अक्षर चुनें":"Choose first syllable",""));
 const resolved=resolveName(name);
 if(!consent||!name){field.hidden=true;confirmedSyllableKey="";return;}
 const required=resolved.state!=="exact";
 field.hidden=!required;
 if(!required){confirmedSyllableKey="";return;}
 const candidates=resolved.candidates.length?resolved.candidates:RECORDS;
 for(const r of candidates){
  const opt=new Option(r.syllable+" ("+r.roman+") · "+r.nakshatra+" "+r.pada,r.key);
  select.add(opt);
 }
 if(confirmedSyllableKey&&candidates.some(r=>r.key===confirmedSyllableKey))select.value=confirmedSyllableKey;
 else {select.value="";confirmedSyllableKey="";}
}
function render(){
 const root=$("#wss-result");root.replaceChildren();
 const strings=languagePack(language),lbl=labels[language];
 if(!candidate){item(root,"p",lbl.opening,"muted");return;}
 const view=buildBilingualCandidateView({
  report:candidate,displayName:$("#wss-name").value,
  language,nameSignConsent:$("#wss-nama-consent").checked,confirmedSyllableKey
 });
 $("#wss-result").dataset.stagedReady="false";
 const header=item(root,"header",null,"preview-header");
 item(header,"p",strings.preview,"warning");
 item(header,"h2",strings.title);
 item(header,"p",strings.intro,"muted");
 if(view.person.displayName)item(header,"h3",view.person.displayName,"name-display");
 const identity=card(root,strings.birth);
 info(identity,strings.birthTime,view.birth.utc);
 info(identity,strings.birthTimezone,view.birth.timezone);
 info(identity,strings.birthPrecision,String(view.birth.precisionSeconds)+" s");
 info(identity,strings.birthPlace,String(view.birth.coordinates.latitude)+", "+String(view.birth.coordinates.longitude));
 info(identity,strings.lagna,view.birth.lagna??strings.notAvailable);
 info(identity,strings.janmaRashi,view.birth.janmaRashi);
 info(identity,strings.nakshatra,view.birth.janmaNakshatra);
 info(identity,strings.pada,view.birth.pada);
 const nama=card(root,strings.nama);
 item(nama,"p",strings.rashiSource,"muted");
 const ns=view.person.nameSign;
 if(ns.sign){
  info(nama,strings.nama,ns.sign);
  info(nama,strings.signDivision,ns.syllable+" · "+ns.nakshatra+" "+ns.pada);
  item(nama,"p",strings.separateBasis,"warning");
 }else item(nama,"p",ns.summary,"muted");
 const chartSection=card(root,strings.charts);
 for(const kind of ["D1","D9","D10"]){
  const chart=view.charts[kind];
  const holder=item(chartSection,"section",null,"chart-wrapper");
  item(holder,"h3",strings[kind.toLowerCase()]);
  if(chart.notice)item(holder,"p",chart.notice,"warning");
  if(chart.rows.length){
   const grid=item(holder,"div",null,"chart-grid");
   for(const row of chart.rows){
    const cell=item(grid,"div",null,"chart-house");
    item(cell,"small",row.label);
    item(cell,"strong",row.sign);
    item(cell,"span",row.grahas,"graha");
   }
  }else item(holder,"p",strings.notAvailable,"muted");
  if(chart.withheld?.length)item(holder,"p",chart.withheld.join(", ")+" · "+strings.notAvailable,"warning");
 }
 const planets=card(root,strings.planets);
 table(planets,[strings.planet,strings.sign,strings.sidereal,strings.motion],
  view.planets.map(g=>[g.planet,g.sign,g.sidereal,g.state]));
 const periods=card(root,strings.dasha);
 info(periods,strings.birthBalance,Number(view.dashas[0].balance??0).toFixed(3)+" years");
 const tablePeriod=table(periods,[strings.lord,strings.period],
   view.dashas.map(d=>[d.lord,d.start+" → "+d.end]));
 tablePeriod.className="dasha";
 const transit=card(root,strings.daily);
 info(transit,strings.date,view.transit.date);
 item(transit,"p",strings.calculatedAtNoon,"muted");
 table(transit,[strings.planet,strings.sign,strings.houseMoon],
  view.transit.grahas.map(g=>[g.planet,g.sign,String(g.houseFromMoon)]));
 const domain=card(root,strings.domains);
 for(const d of view.domains){
  const itemDiv=item(domain,"div",null,"domain");
  item(itemDiv,"h3",d.title);
  item(itemDiv,"p",strings.observed+": "+d.houses.map(h=>
   strings.house+" "+h.number+" ("+h.rashi+"): "+(h.grahas.join(", ")||"—")).join(" · "));
  item(itemDiv,"p",strings.pending,"muted");
 }
 const timing=card(root,strings.timeWindows);
 item(timing,"p",strings.windowNotice,"warning");
 for(const [key,periods] of Object.entries(view.windows)){
  item(timing,"h3",key==="work"?(language==="hi"?"करियर":"Career"):
   (language==="hi"?"संबंध":"Relationships"));
  table(timing,[strings.period,strings.dasha],
   periods.slice(0,8).map(p=>[p.from.slice(0,10)+" → "+p.to.slice(0,10),p.maha+" / "+p.antar]));
 }
 const limitation=card(root,strings.methodology);
 for(const warning of view.limitations)item(limitation,"p",warning,"warning");
 info(limitation,strings.ayanamsha,view.method.ayanamsha);
 info(limitation,strings.node,view.method.node);
 info(limitation,strings.yearConvention,view.method.yearConvention);
 item(limitation,"p",strings.privacyDetail,"muted");
}
function generate(){
 const name=$("#wss-name").value.trim(),date=$("#wss-birth-date").value,
  time=$("#wss-birth-time").value,place=SAMPLE_PLACES[$("#wss-birth-place").value],
  refDate=$("#wss-reference-date").value,year=$("#wss-year-convention").value;
 if(!name||!date||!time||!place||!refDate||!year) {
  $("#wss-error").textContent=labels[language].missing;
  candidate=null;render();return;
 }
 try{
  candidate=assembleKundaliReportCandidate({
   birthDate:date,birthTime:time,birthTimezone:place.tz,
   birthLatitude:place.lat,birthLongitude:place.lon,
   referenceDate:refDate,referenceTimezone:place.tz,
   referenceLatitude:place.lat,referenceLongitude:place.lon,
   timePrecisionSeconds:Number($("#wss-precision").value),
   yearConvention:year,yearsToReview:10
  });
  if(candidate.status!=="candidate_chart_report_not_approved_for_user_prediction")
   throw new RangeError(candidate.reason||"candidate input unresolved");
  $("#wss-error").textContent="";
  render();
 }catch{
  candidate=null;
  $("#wss-error").textContent=labels[language].failed;
  render();
 }
}
for(const button of document.querySelectorAll("[data-language-choice]"))button.addEventListener("click",()=>{
 language=button.dataset.languageChoice;
 updateLanguage();
});
$("#wss-generate").addEventListener("click",generate);
$("#wss-clear").addEventListener("click",()=>{
 for(const field of ["#wss-name","#wss-birth-date","#wss-birth-time","#wss-reference-date"])
  $(field).value="";
 $("#wss-birth-place").value="";
 $("#wss-nama-consent").checked=false;
 $("#wss-syllable").value="";
 candidate=null;confirmedSyllableKey="";
 $("#wss-error").textContent="";
 updateLanguage();
});
$("#wss-name").addEventListener("input",()=>{
 confirmedSyllableKey="";updateSyllable();if(candidate)render();
});
$("#wss-nama-consent").addEventListener("change",()=>{
 confirmedSyllableKey="";updateSyllable();if(candidate)render();
});
$("#wss-syllable").addEventListener("change",()=>{
 confirmedSyllableKey=$("#wss-syllable").value;if(candidate)render();
});
for(const node of ["#wss-birth-date","#wss-birth-time","#wss-birth-place",
 "#wss-reference-date","#wss-year-convention","#wss-precision"]){
 $(node).addEventListener("change",()=>{candidate=null;render()});
}
updateLanguage();
