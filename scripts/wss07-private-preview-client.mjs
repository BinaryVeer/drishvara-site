/**
 * Staging-only interactive Kundali preview — browser-only, no account/network.
 * This is a functional UX test of the WSS02–WSS07 candidate, NOT a public forecast.
 * The four-location list is a representative QA fixture, not the production 3,266-place selector.
 */
import {assembleKundaliReportCandidate} from "./lib/wss07-kundali-report-candidate.mjs";
import {buildBilingualCandidateView,languagePack} from "./lib/wss07-bilingual-report-presenter.mjs";
import {resolveName,RECORDS} from "./lib/wss07-nama-rashi-core.mjs";
import {computedPeriodSummaryCandidate} from "./lib/wss07-period-transit-summary.mjs";
import {SIGNS_EN,SIGN_HI,GRAHA_HI} from "./lib/wss07-bilingual-report-presenter.mjs";
import {auditNatalPrecisionCandidate,WSS08_PRECISION_STATE} from "./lib/wss08-natal-precision-audit.mjs";
import {auditedBilingualCandidateView} from "./lib/wss08-audited-bilingual-view.mjs";

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
let language="en",candidate=null,computedPeriods=null,precisionAudit=null,confirmedSyllableKey="";
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
   generated:"Computed candidate — not a verified personal forecast",
   pageTitle:"Private, bilingual Kundali calculation preview",
   pageSummary:"Synthetic QA / research build — not deployed to the public product.",
   pageFooter:"WSS07 staging only. Calculated astronomy is not scientifically established life prediction. No profiles are collected.",
   yearUnit:" years",secondUnit:" s",
   precisionSecond:"Known to second · 1 s",
   precisionMinute:"Known to minute · 60 s",
   precisionApproximate:"Approximate time (not yet supported)",
   civilYear:"Civil year · 365.25 days",savanaYear:"Sāvana year · 360 days",
   monthTitle:"Monthly planetary changes",yearTitle:"Yearly planetary changes",
   noonNotice:"Observed between local-noon snapshots; not exact ingress times or future-event predictions.",
   sampledDays:"Local dates sampled",observedChanges:"Observed sign changes",periodChanges:"Daśā period changes",
   noChanges:"None observed at this sampling resolution",periodUnavailable:"Computed monthly/yearly context unavailable",
   transitHeader:["Observation date","Graha","From sign","To sign"]
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
   generated:"गणना-आधारित परीक्षण — सत्यापित व्यक्तिगत भविष्यफल नहीं",
   pageTitle:"निजी द्विभाषी कुंडली गणना का पूर्वावलोकन",
   pageSummary:"काल्पनिक परीक्षण / शोध संस्करण — सार्वजनिक ऐप में प्रकाशित नहीं।",
   pageFooter:"WSS07 परीक्षण मात्र। ग्रह गणना जीवन-घटनाओं की वैज्ञानिक भविष्यवाणी नहीं है। कोई प्रोफ़ाइल सहेजी नहीं जाती।",
   yearUnit:" वर्ष",secondUnit:" सेकंड",
   precisionSecond:"सेकंड तक ज्ञात · 1 सेकंड",
   precisionMinute:"मिनट तक ज्ञात · 60 सेकंड",
   precisionApproximate:"अनुमानित समय (अभी समर्थित नहीं)",
   civilYear:"नागरिक वर्ष · 365.25 दिन",savanaYear:"सावन वर्ष · 360 दिन",
   monthTitle:"मासिक ग्रह-परिवर्तन",yearTitle:"वार्षिक ग्रह-परिवर्तन",
   noonNotice:"परिवर्तन स्थानीय दोपहर के नमूनों के बीच देखा गया है; सटीक राशि-प्रवेश या भविष्य की घटना की तिथि नहीं।",
   sampledDays:"देखी गई स्थानीय तिथियाँ",observedChanges:"राशि परिवर्तन",periodChanges:"दशा अवधि में परिवर्तन",
   noChanges:"इस नमूना-पद्धति में कोई परिवर्तन नहीं दिखा",periodUnavailable:"मासिक/वार्षिक गणना आधार उपलब्ध नहीं",
   transitHeader:["देखी गई तिथि","ग्रह","पहले की राशि","नई राशि"]
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
 $("#wss-page-title").textContent=lbl.pageTitle;
 $("#wss-page-summary").textContent=lbl.pageSummary;
 $("#wss-page-footer").textContent=lbl.pageFooter;
 document.title=lbl.pageTitle+" · Drishvara";
 $("#wss-name").placeholder=language==="hi"?"जैसे: विकास":"e.g., Vikash";
 for(const [key,value] of [["second","precisionSecond"],["minute","precisionMinute"],
   ["approximate","precisionApproximate"]]){
   $("#wss-precision").querySelector('[data-precision-choice="'+key+'"]').textContent=lbl[value];
 }
 for(const [key,value] of [["civil","civilYear"],["savana","savanaYear"]]){
   $("#wss-year-convention").querySelector('[data-year-choice="'+key+'"]').textContent=lbl[value];
 }
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
 const root=$("#review-result");root.replaceChildren();
 const lbl=labels[language];
 if(!candidate){item(root,"p",lbl.opening,"muted");return;}
 const view=auditedBilingualCandidateView({
  report:candidate,precisionAudit,displayName:$("#wss-name").value,
  language,nameSignConsent:$("#wss-nama-consent").checked,confirmedSyllableKey
 });
 const strings=view.strings;
 $("#review-result").dataset.stagedReady="false";
 const header=item(root,"header",null,"preview-header");
 item(header,"p",strings.preview,"warning");
 item(header,"h2",strings.title);
 item(header,"p",strings.intro,"muted");
 if(view.person.displayName)item(header,"h3",view.person.displayName,"name-display");
 const quality=card(root,strings.wss08.title);
 quality.id="wss-precision-audit";
 quality.dataset.publicReady="false";
 info(quality,strings.wss08.sample,view.quality.samplesChecked);
 info(quality,strings.wss08.precision,view.quality.effectiveBirthPrecisionSeconds+" "+lbl.secondUnit);
 info(quality,strings.d1,view.quality.D1==="stable_candidate"?
    strings.wss08.provisional:strings.wss08.noLabel);
 info(quality,strings.d9,view.quality.D9==="stable_candidate"?
    strings.wss08.provisional:strings.wss08.noLabel);
 info(quality,strings.d10,view.quality.D10==="stable_candidate"?
    strings.wss08.provisional:strings.wss08.noLabel);
 item(quality,"p",strings.wss08.dasha,"warning");
 const identity=card(root,strings.birth);
 info(identity,strings.birthTime,view.birth.utc);
 info(identity,strings.birthTimezone,view.birth.timezone);
 info(identity,strings.birthPrecision,String(view.birth.precisionSeconds)+lbl.secondUnit);
 info(identity,strings.birthPlace,String(view.birth.coordinates.latitude)+", "+String(view.birth.coordinates.longitude));
 info(identity,strings.lagna,view.birth.lagna??strings.notAvailable);
 info(identity,strings.janmaRashi,view.birth.janmaRashi??strings.notAvailable);
 info(identity,strings.nakshatra,view.birth.janmaNakshatra??strings.notAvailable);
 info(identity,strings.pada,view.birth.pada??strings.notAvailable);
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
 item(periods,"p",strings.wss08.dasha,"warning");
 info(periods,strings.birthBalance,strings.notAvailable);
 if(view.dashas.length){
   const tablePeriod=table(periods,[strings.lord,strings.wss08.year],
     view.dashas.map(d=>[d.lord,String(d.nominalYears)]));
   tablePeriod.className="dasha";
 }else item(periods,"p",strings.wss08.moon,"muted");
 const transit=card(root,strings.daily);
 info(transit,strings.date,view.transit.date);
 item(transit,"p",strings.calculatedAtNoon,"muted");
 if(view.transit.grahas.length){
   table(transit,[strings.planet,strings.sign,strings.houseMoon],
     view.transit.grahas.map(g=>[g.planet,g.sign,String(g.houseFromMoon)]));
 }else item(transit,"p",strings.wss08.moon,"warning");
 for(const key of ["month","year"]){
  const period=computedPeriods?.[key];
  const block=card(root,key==="month"?lbl.monthTitle:lbl.yearTitle);
  block.id=key==="month"?"wss-month-period":"wss-year-period";
  item(block,"p",lbl.noonNotice,"warning");
  if(!period||period.status!=="wss06_month_year_computed_summary_not_prediction"){
    item(block,"p",lbl.periodUnavailable,"muted");
    continue;
  }
  block.dataset.days=String(period.sample_count);
  info(block,strings.period,period.start_date+" → "+period.end_date);
  info(block,lbl.sampledDays,period.sample_count);
  info(block,lbl.observedChanges,period.sign_changes.length);
  info(block,lbl.periodChanges,strings.wss08.dasha);
  const localSign=name=>{
    const i=SIGNS_EN.indexOf(name);
    return language==="hi"&&i>=0?SIGN_HI[i]:name;
  };
  const localGraha=name=>language==="hi"?(GRAHA_HI[name]||name):name;
  if(period.sign_changes.length){
    table(block,lbl.transitHeader,period.sign_changes.map(ch=>[
      ch.observed_local_date,localGraha(ch.graha),
      localSign(ch.previous_sign),localSign(ch.new_sign)]));
  }else item(block,"p",lbl.noChanges,"muted");
  // Exact Daśā change dates are not a validated user-facing claim.
 }
 const domain=card(root,strings.domains);
 for(const d of view.domains){
  const itemDiv=item(domain,"div",null,"domain");
  item(itemDiv,"h3",d.title);
  item(itemDiv,"p",strings.observed+": "+d.houses.map(h=>
   strings.house+" "+h.number+" ("+h.rashi+"): "+(h.grahas.join(", ")||"—")).join(" · "));
  item(itemDiv,"p",strings.pending,"muted");
 }
 const evidence=card(root,strings.traditionalSources);
 evidence.id="wss-source-evidence";
 item(evidence,"p",view.sourceEvidence.notice,"warning");
 for(const entry of view.sourceEvidence.entries){
  const block=item(evidence,"div",null,"domain");
  item(block,"h3",entry.title);
  item(block,"p",entry.summary);
  item(block,"small",strings.ruleReference+": "+entry.source_rule_ids.join(", "),"muted");
  if(entry.id==="VOCATION_TENTH_THREE_BASIS"){
   table(block,[language==="hi"?"संदर्भ":"Origin",strings.sign,strings.grahas],
     entry.factors.map(f=>[f.from,f.rashi,f.grahas.join(", ")||"—"]));
  }
  if(entry.id==="HOUSE_7_10"){
   table(block,[strings.house,strings.sign,language==="hi"?"स्वामी":"Lord"],
     entry.factors.map(f=>[f.label,f.sign_local,f.ruler_local]));
  }
 }
 const timing=card(root,strings.timeWindows);
 item(timing,"p",strings.wss08.timing,"warning");
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
  candidate=null;computedPeriods=null;precisionAudit=null;render();return;
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
  precisionAudit=auditNatalPrecisionCandidate({
    birthDate:date,birthTime:time,birthTimezone:place.tz,
    birthLatitude:place.lat,birthLongitude:place.lon,
    declaredPrecisionSeconds:Number($("#wss-precision").value),language
  });
  if(precisionAudit.status!==WSS08_PRECISION_STATE)
   throw new RangeError(precisionAudit.input_state||precisionAudit.status);
  const params={report:candidate,referenceDate:refDate,
    timezone:place.tz,latitude:place.lat,longitude:place.lon};
  try {
    computedPeriods={
      month:computedPeriodSummaryCandidate({...params,period:"month"}),
      year:computedPeriodSummaryCandidate({...params,period:"year"})
    };
  }catch{computedPeriods=null;}
  $("#wss-error").textContent="";
  render();
 }catch(error){
  candidate=null;computedPeriods=null;precisionAudit=null;
  // Diagnostic state is a class name only; never log/serialize personal input.
  $("#wss-error").dataset.candidateErrorClass=error?.name||"UnknownError";
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
 candidate=null;computedPeriods=null;precisionAudit=null;confirmedSyllableKey="";
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
 $(node).addEventListener("change",()=>{candidate=null;computedPeriods=null;precisionAudit=null;render()});
}
updateLanguage();
