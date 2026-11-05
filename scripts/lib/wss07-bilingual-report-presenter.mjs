/**
 * WSS07: private, bilingual EN/HI view model for the non-public Kundali candidate.
 * Does not calculate planetary positions, save identity or contact a server.
 * Birth astronomical input is deliberately separate from displayName/Nāma Rāśi.
 */
import {RASHIS,RECORDS,resolveName} from "./wss07-nama-rashi-core.mjs";

export const REPORT_VIEW_STATUS="staged_nonpublic_english_hindi_chart_report";
const SIGN_HI=["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"];
const SIGNS_EN=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const GRAHA_HI={Sun:"सूर्य",Moon:"चन्द्र",Mercury:"बुध",Venus:"शुक्र",Mars:"मंगल",
 Jupiter:"बृहस्पति",Saturn:"शनि",Rahu:"राहु",Ketu:"केतु"};
const NAKSHATRA_HI=["अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशिरा","आर्द्रा","पुनर्वसु","पुष्य","आश्लेषा",
 "मघा","पूर्वाफाल्गुनी","उत्तराफाल्गुनी","हस्त","चित्रा","स्वाती","विशाखा","अनुराधा",
 "ज्येष्ठा","मूल","पूर्वाषाढ़ा","उत्तराषाढ़ा","श्रवण","धनिष्ठा","शतभिषा",
 "पूर्वाभाद्रपदा","उत्तराभाद्रपदा","रेवती"];
const DOMAIN_HI={work:"करियर एवं व्यवसाय",relationships:"विवाह एवं संबंध",
 education:"शिक्षा एवं अध्ययन",resources:"आर्थिक संसाधन",family:"गृह एवं परिवार",
 growth:"व्यक्तिगत विकास"};
const EN={
 title:"Personal Kundali · Calculation Preview",subtitle:"Computed chart basis and traditional source context",
 preview:"Research preview — not yet qualified for public predictions",
 name:"Name",nameBasis:"Name used for display and separately consented name-sign only; not a planetary input",
 birth:"Birth details",birthTime:"UTC birth instant",birthTimezone:"Birth timezone",
 birthPrecision:"Birth-clock precision",birthPlace:"Coordinates (birth place)",
 lagna:"Lagna",janmaRashi:"Janma Rāśi",nakshatra:"Birth Nakshatra",pada:"Pada",
 nama:"Nāma Rāśi (name-derived)",notConsent:"Not calculated — separate name-based consent not provided",
 soundConfirm:"Confirm the traditional first syllable; the Roman spelling alone is insufficient",
 nameUnsupported:"Initial syllable requires clarification",separateBasis:"Name sign is not the birth Moon sign",
 charts:"Charts",d1:"D1 · Rāśi / Lagna",d9:"D9 · Navāṁśa",d10:"D10 · Daśāṁśa",
 house:"House",sign:"Rāśi",grahas:"Grahas",signDivision:"Divisional assignment",notAvailable:"Unavailable pending precision review",
 planets:"Nine grahas",planet:"Graha",sidereal:"Sidereal longitude",degree:"Degree",motion:"Motion",
 retrograde:"Retrograde",direct:"Direct",dasha:"Vimśottarī Daśā",lord:"Lord",
 period:"Period (UTC)",subperiods:"Antardaśā periods",birthBalance:"Balance at birth",
 date:"Selected reference date",daily:"Daily transit basis",months:"Monthly guidance",years:"Yearly guidance",
 calculatedAtNoon:"Sidereal positions sampled at local noon; exact ingress times are not inferred",
 houseMoon:"House from birth Moon",interpretation:"Interpretation",
 pending:"Personal traditional interpretations are pending source and accuracy review",
 domains:"Life-domain evidence",observed:"Observed houses / graha placements (not a forecast)",
 timeWindows:"Traditional periods for review",windowNotice:"These are timing contexts, not predicted marriage or employment dates",
 colour:"Traditional planetary colour association",colourNotice:"Symbolic graha description, not evidence of your preferred or beneficial colour",
 methodology:"Method, precision and sources",model:"Model",ayanamsha:"Ayanāṁśa",node:"Lunar-node method",
 yearConvention:"Daśā year convention",privacy:"Privacy",privacyDetail:"Only in-memory presentation. No name or birth profile is stored by this candidate.",
 boundary:"Near a chart boundary — precise label withheld",
 noPredictions:"No guaranteed marriage date, job outcome, financial gain or medical advice",
 future:"The full dated forecast awaits independently approved interpretation rules",
 status:"Readiness",chartNotReady:"Candidate only: publication not approved",
 intro:"Calculated figures are test-stage astronomical candidates. Traditional Jyotisha interpretations are not scientifically proven to predict life events.",
 example:"Synthetic demonstration only — do not use for personal decisions",
 notSaved:"No profile is saved",unknown:"Not established",timeConfidence:"Birth-time precision",
 rashiSource:"Nāma Rāśi is a traditional syllable association",
 clarification:"Name pronunciation must be confirmed before the name sign is assigned",
 locations:"Birth coordinate basis",none:"None"
};
const HI={
 title:"व्यक्तिगत कुंडली · गणना पूर्वावलोकन",subtitle:"गणनात्मक कुंडली आधार और पारम्परिक स्रोत",
 preview:"शोध पूर्वावलोकन — सार्वजनिक भविष्यफल हेतु अभी अनुमोदित नहीं",
 name:"नाम",nameBasis:"नाम केवल संबोधन और अलग सहमति वाली नाम राशि के लिए; ग्रह गणना में नहीं",
 birth:"जन्म विवरण",birthTime:"जन्म क्षण (UTC)",birthTimezone:"जन्म समयक्षेत्र",
 birthPrecision:"जन्म समय की सटीकता",birthPlace:"जन्मस्थान के निर्देशांक",
 lagna:"लग्न",janmaRashi:"जन्म राशि",nakshatra:"जन्म नक्षत्र",pada:"चरण",
 nama:"नाम राशि",notConsent:"नाम राशि हेतु अलग सहमति नहीं दी गई",
 soundConfirm:"पहले अक्षर की ध्वनि की पुष्टि करें; केवल रोमन वर्तनी पर्याप्त नहीं",
 nameUnsupported:"प्रारम्भिक अक्षर की पुष्टि आवश्यक",separateBasis:"नाम राशि, जन्म चन्द्र राशि नहीं है",
 charts:"कुंडली चक्र",d1:"D1 · राशि / लग्न",d9:"D9 · नवांश",d10:"D10 · दशांश",
 house:"भाव",sign:"राशि",grahas:"ग्रह",signDivision:"वर्ग में राशि",notAvailable:"सटीकता की जाँच शेष होने से उपलब्ध नहीं",
 planets:"नवग्रह",planet:"ग्रह",sidereal:"निरयण देशांतर",degree:"अंश",motion:"गति",
 retrograde:"वक्री",direct:"मार्गी",dasha:"विंशोत्तरी दशा",lord:"स्वामी",
 period:"अवधि (UTC)",subperiods:"अंतर्दशा अवधियाँ",birthBalance:"जन्म समय दशा शेष",
 date:"चयनित तिथि",daily:"दैनिक गोचर आधार",months:"मासिक मार्गदर्शन",years:"वार्षिक मार्गदर्शन",
 calculatedAtNoon:"स्थानीय दोपहर के ग्रह स्थान; सटीक राशि प्रवेश समय नहीं निकाला गया",
 houseMoon:"जन्म चन्द्र से भाव",interpretation:"व्याख्या",
 pending:"व्यक्तिगत पारम्परिक व्याख्या का स्रोत और गणना सत्यापन शेष है",
 domains:"जीवन-विषयक आधार",observed:"देखे गए भाव और ग्रह (निश्चित फलादेश नहीं)",
 timeWindows:"पारम्परिक समीक्षा-अवधि",windowNotice:"ये कालगत संकेत हैं, विवाह या नौकरी की निश्चित तिथियाँ नहीं",
 colour:"ग्रहों से जुड़ा पारम्परिक रंग",colourNotice:"प्रतीकात्मक ग्रह-वर्णन, आपका पसंदीदा या लाभकारी रंग सिद्ध नहीं",
 methodology:"पद्धति, सटीकता और स्रोत",model:"मॉडल",ayanamsha:"अयनांश",node:"चन्द्रपात पद्धति",
 yearConvention:"दशा वर्ष पद्धति",privacy:"गोपनीयता",privacyDetail:"नाम और जन्म जानकारी का केवल अस्थायी स्क्रीन पर उपयोग; यहाँ सहेजी नहीं जाती",
 boundary:"वर्ग-सीमा के निकट — निश्चित राशि रोकी गई",
 noPredictions:"विवाह तिथि, नौकरी, धनलाभ या स्वास्थ्य के परिणाम की गारंटी नहीं",
 future:"विस्तृत तिथि-आधारित फलादेश के नियमों का स्वतंत्र सत्यापन शेष है",
 status:"स्थिति",chartNotReady:"केवल परीक्षण गणना; सार्वजनिक उपयोग अनुमोदित नहीं",
 intro:"दिखाए गए अंक परीक्षण अवस्था की खगोलीय गणनाएँ हैं। पारम्परिक ज्योतिषीय कथन जीवन घटनाओं की वैज्ञानिक भविष्यवाणी नहीं हैं।",
 example:"केवल काल्पनिक उदाहरण — व्यक्तिगत निर्णय के लिए उपयोग न करें",
 notSaved:"कोई प्रोफ़ाइल सहेजी नहीं जाती",unknown:"प्रमाणित नहीं",timeConfidence:"जन्म समय की निश्चितता",
 rashiSource:"नाम राशि पारम्परिक नामाक्षर संबंध है",
 clarification:"नाम राशि तय करने से पहले उच्चारण की पुष्टि आवश्यक है",
 locations:"जन्म स्थान आधार",none:"कोई नहीं"
};
const DEFS=Object.freeze({en:Object.freeze(EN),hi:Object.freeze(HI)});
export function languagePack(lang="en") {
 if(lang!=="en"&&lang!=="hi")throw new RangeError("Supported languages: en, hi only");
 return DEFS[lang];
}
const safeName=value=>{
 const name=String(value??"").trim().replace(/\s+/gu," ");
 if(name.length>80)throw new RangeError("Name exceeds session-only 80-character limit");
 return name;
};
const localSign=(sign,lang)=>{
 if(!sign)return null;
 const index=SIGNS_EN.indexOf(String(sign));
 return index>=0&&lang==="hi"?SIGN_HI[index]:String(sign);
};
const localGraha=(graha,lang)=>lang==="hi"?(GRAHA_HI[graha]||graha):graha;
function localNakshatra(nakshatra,lang) {
 if(lang!=="hi")return nakshatra||"";
 const keys=["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
 "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
 "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula",
 "Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha",
 "Purva Bhadrapada","Uttara Bhadrapada","Revati"];
 const index=keys.indexOf(nakshatra);
 return index>=0?NAKSHATRA_HI[index]:nakshatra;
}
const degrees=value=>Number.isFinite(value)?Number(value).toFixed(5)+"°":"—";
function nameSignModel(name,consent,selectedKey,lang,t){
 if(!consent)return {state:"consent_needed",summary:t.notConsent,sign:null};
 if(!name)return {state:"name_missing",summary:t.nameUnsupported,sign:null};
 const resolved=resolveName(name);
 const automatic=resolved.state==="exact"&&resolved.script==="devanagari"?
    resolved.candidates[0]:null;
 const confirmed=selectedKey?RECORDS.find(r=>r.key===selectedKey):null;
 const validConfirmed=confirmed&&(resolved.candidates.some(r=>r.key===confirmed.key)||
   (resolved.state==="manual_required"&&!resolved.candidates.length));
 const record=validConfirmed?confirmed:automatic;
 if(!record)return {state:resolved.state==="confirm_sound"?"confirmation_required":"clarification_required",
  summary:resolved.state==="confirm_sound"?t.soundConfirm:t.clarification,
  candidates:resolved.candidates.map(r=>({
    key:r.key,syllable:r.syllable,nakshatra:localNakshatra(r.nakshatra,lang),
    pada:r.pada,rashi:localSign(SIGNS_EN[r.rashiIndex],lang)
  })),sign:null};
 return {state:"traditional_name_sign",sign:localSign(SIGNS_EN[record.rashiIndex],lang),
  rashiIndex:record.rashiIndex+1,syllable:record.syllable,
  nakshatra:localNakshatra(record.nakshatra,lang),pada:record.pada,
  rule:"AVAKAHADA_27x4_NAKSHATRA_PADAS",summary:t.separateBasis};
}
function chartModel(chart,lang,t){
 if(!chart)return {state:"unavailable",rows:[]};
 if(chart.whole_sign_houses) {
  return {state:chart.state,lagna:chart.lagna?.rashi?localSign(chart.lagna.rashi,lang):null,
   rows:chart.whole_sign_houses.map(h=>({
     label:t.house+" "+h.number,sign:localSign(h.rashi,lang),
     grahas:h.grahas.map(g=>localGraha(g,lang)).join(", ")||"—"
   }))};
 }
 const lagna=chart.lagna?.rashi_index;
 if(!lagna)return {state:"uncertain_divisional_lagna",rows:[],notice:t.notAvailable};
 const rows=Array.from({length:12},(_,i)=>{
   const signIndex=(lagna-1+i)%12+1;
   return {label:t.house+" "+(i+1),sign:localSign(SIGNS_EN[signIndex-1],lang),
     grahas:chart.grahas.filter(g=>g.rashi_index===signIndex&&g.state==="candidate_numeric")
       .map(g=>localGraha(g.graha,lang)).join(", ")||"—"}
 });
 const withheld=chart.grahas.filter(g=>g.state!=="candidate_numeric").map(g=>localGraha(g.graha,lang));
 return {state:chart.state,lagna:localSign(SIGNS_EN[lagna-1],lang),rows,
   withheld,notice:withheld.length?t.boundary:null};
}
const textScope=value=>String(value||"").slice(0,400);
export function buildBilingualCandidateView({
 report,displayName="",language="en",nameSignConsent=false,confirmedSyllableKey=null
}={}) {
 const t=languagePack(language),name=safeName(displayName);
 if(!report||report.status!=="candidate_chart_report_not_approved_for_user_prediction"||
    report.ready_for_public_display!==false)
    throw new RangeError("Requires gated WSS07 non-public candidate report");
 const natal=report.astronomical_birth_context,transit=natal.date_specific_transits;
 const basis=report.basis;
 const charts=Object.fromEntries(["D1","D9","D10"].map(kind=>[kind,
   chartModel(report.charts[kind],language,t)]));
 const planets=report.charts.D1.grahas.map(g=>({
   planet:localGraha(g.graha,language),sign:localSign(g.rashi.rashi,language),
   sidereal:degrees(g.sidereal_degrees),
   state:g.retrograde?t.retrograde:t.direct,degreeInSign:degrees(g.rashi.degrees_in_rashi)
 }));
 const dashas=natal.mahadashas.map(d=>({
   lord:localGraha(d.lord,language),start:d.start_utc,end:d.end_exclusive_utc,
   balance:d.birth_period_balance_years,antar:d.antardashas.map(a=>({
     lord:localGraha(a.lord,language),start:a.start_utc,end:a.end_exclusive_utc,
     visible:a.visible_after_birth
   }))
 }));
 const domains=report.life_domain_observations.map(d=>({
   id:d.domain,title:language==="hi"?DOMAIN_HI[d.domain]||d.label:d.label,
   houses:d.houses.map(h=>({number:h.number,rashi:localSign(h.rashi,language),
    grahas:h.grahas.map(g=>localGraha(g,language))})),
   division:d.divisional_chart||null,
   prediction:t.pending,
   ruleIds:d.requires_source_rules.slice()
 }));
 const windows=Object.fromEntries(Object.entries(report.traditional_time_windows_for_review)
  .map(([domain,periods])=>[domain,periods.map(p=>({
     from:p.review_start_utc,to:p.review_end_exclusive_utc,
     maha:localGraha(p.mahadasha,language),antar:localGraha(p.antardasha,language),
     status:t.windowNotice,ruleIds:p.rule_ids.slice()
   }))]));
 return {
   status:REPORT_VIEW_STATUS,language,strings:t,
   internal_ready:false,privacy:{name_persisted:false,birth_details_persisted:false,
     name_sent_astronomically:false},
   person:{displayName:name||null,nameSign:nameSignModel(name,!!nameSignConsent,confirmedSyllableKey,language,t)},
   birth:{utc:basis.birth_instant_utc,timezone:basis.timezone,
     precisionSeconds:basis.birth_time_precision_seconds,
     coordinates:{...basis.geographic_basis},
     lagna:charts.D1.lagna,
     janmaRashi:localSign(natal.janma_rashi,language),
     janmaNakshatra:localNakshatra(natal.janma_nakshatra,language),
     pada:natal.janma_nakshatra_pada},
   charts,planets,dashas,
   transit:{date:basis.ref_day,utc:transit.utc,moonSign:localSign(transit.natal_moon_rashi,language),
     dasha:transit.active_dasha,grahas:transit.grahas.map(g=>({
       planet:localGraha(g.graha,language),sign:localSign(g.rashi,language),
       longitude:degrees(g.longitude_sidereal_degrees),houseFromMoon:g.house_from_natal_moon
     }))},
   domains,windows,
   colour:report.optional_traditional_colour_reference?
     {periodGraha:localGraha(report.optional_traditional_colour_reference.planetary_period,language),
       association:textScope(report.optional_traditional_colour_reference.association),
       rule:report.optional_traditional_colour_reference.source_rule,disclaimer:t.colourNotice}:null,
   method:{...basis.source_methods,yearConvention:basis.dasha_year_convention},
   limitations:[t.preview,t.intro,t.noPredictions,t.future],
   viewOnly:true
 };
}
export {SIGN_HI,SIGNS_EN,GRAHA_HI,NAKSHATRA_HI};
