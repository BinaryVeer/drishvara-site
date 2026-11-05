/**
 * WSS05 classical-source evidence evaluator.
 *
 * Computes observed chart factors, not guaranteed marriage/job/life events.
 * Each output is bilingual and traceable to a named Sanskrit rule.
 * A complete future prediction requires house strengths, aspects, divisional
 * conditions and independent transit/Dasha validation. No name is an
 * astronomical input; the evaluator neither networks nor persists data.
 */
import {WSS07_RASHI_LORDS} from "./wss07-kundali-report-candidate.mjs";

export const WSS05_EVIDENCE_STATUS="gated_traditional_evidence_not_a_forecast";
const SIGNS_EN=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
  "Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const SIGNS_HI=["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"];
const GRAHA_HI={Sun:"सूर्य",Moon:"चन्द्र",Mercury:"बुध",Venus:"शुक्र",
  Mars:"मंगल",Jupiter:"बृहस्पति",Saturn:"शनि",Rahu:"राहु",Ketu:"केतु"};
const t=(english,hindi,lang)=>lang==="hi"?hindi:english;
const localSign=(signIndex,lang)=>lang==="hi"?SIGNS_HI[signIndex-1]:SIGNS_EN[signIndex-1];
const localPlanet=(name,lang)=>lang==="hi"?(GRAHA_HI[name]||name):name;
const tenthFrom=sign=>((sign-1+9)%12)+1;
function lordForHouse(house) {
 if(!house||!Number.isInteger(house.rashi_index))return null;
 return WSS07_RASHI_LORDS[house.rashi_index-1];
}
export function evaluateTraditionalEvidenceCandidate(report,{language="en"}={}) {
 if(language!=="en"&&language!=="hi")throw new RangeError("Only en and hi supported");
 if(!report||report.status!=="candidate_chart_report_not_approved_for_user_prediction"||
    report.ready_for_public_display!==false)
   throw new RangeError("Non-public, nine-graha Kundali candidate required");
 const natal=report.charts?.D1;
 if(!natal||!natal.lagna||natal.grahas.length!==9||
   natal.whole_sign_houses?.length!==12)
   return {status:"withheld_no_valid_natal_lagna",ready_for_prediction:false,entries:[]};
 const house=n=>natal.whole_sign_houses[n-1];
 const graha=name=>natal.grahas.find(g=>g.graha===name);
 const rashiOf=name=>graha(name)?.rashi?.rashi_index;
 const h7=house(7),h10=house(10),h5=house(5),h9=house(9);
 const lord7=lordForHouse(h7),lord10=lordForHouse(h10),lord5=lordForHouse(h5),
  lord9=lordForHouse(h9);
 const entries=[];
 entries.push({
   id:"HOUSE_7_10",source_rule_ids:["BPHS_34_4"],
   state:"house_association_observed_only",
   title:t("Seventh and tenth house basis","सप्तम एवं दशम भाव का आधार",language),
   summary:t(
     "The seventh and tenth houses are identified for traditional relationship and public-work review. Their presence alone predicts no event.",
     "परम्परागत संबंध और कर्म-विषय की समीक्षा हेतु सप्तम व दशम भाव पहचाने गए हैं। केवल इनके आधार पर किसी घटना का फलादेश नहीं किया जाता।",
     language),
   factors:[
     {house:7,sign:h7.rashi,ruler:lord7,occupants:h7.grahas},
     {house:10,sign:h10.rashi,ruler:lord10,occupants:h10.grahas}
   ].map(f=>({...f,label:t("House ","भाव ",language)+f.house,
      sign_local:localSign(natal.whole_sign_houses[f.house-1].rashi_index,language),
      ruler_local:localPlanet(f.ruler,language),
      occupants_local:f.occupants.map(g=>localPlanet(g,language))})),
   limits:["classical_house_label_only","not_marriage_or_job_forecast"]
 });
 const origins=[
   {label:t("Lagna","लग्न",language),sign:natal.lagna.rashi_index},
   {label:t("Moon","चन्द्र",language),sign:rashiOf("Moon")},
   {label:t("Sun","सूर्य",language),sign:rashiOf("Sun")}
 ];
 const vocation=origins.map(o=>{
   const target=tenthFrom(o.sign);
   return {from:o.label,sign_index:target,rashi:localSign(target,language),
     grahas:natal.grahas.filter(g=>g.rashi.rashi_index===target).map(g=>localPlanet(g.graha,language))};
 });
 entries.push({
   id:"VOCATION_TENTH_THREE_BASIS",source_rule_ids:["BJ_10_1"],
   state:"computed_three_tenths_additional_navamsa_lord_check_pending",
   title:t("Three traditional vocation reference points","व्यवसाय हेतु तीन परम्परागत संदर्भ",language),
   summary:t(
     "The tenth sign is examined separately from Lagna, Moon and Sun. The cited verse also calls for Navāṁśa lord/context, so no profession is assigned from this table alone.",
     "लग्न, चन्द्र एवं सूर्य से दशम राशि का अलग-अलग परीक्षण होता है। उद्धृत श्लोक में नवांश-अधिपति का विवेचन भी आवश्यक है; इस सूची से किसी व्यवसाय को निश्चित नहीं किया जाता।",
     language),
   factors:vocation,
   limits:["no_inferred_suitable_sector","navamsa_tenth_lord_review_pending"]
 });
 const tenthLordPosition=rashiOf(lord10);
 const candidatePartners=[{name:lord5,house:5},{name:lord9,house:9}];
 const associations=candidatePartners
   .filter(x=>x.name&&x.name!==lord10&&rashiOf(x.name)===tenthLordPosition)
   .map(x=>({with_house_lord:x.house,planet:localPlanet(x.name,language),
     same_rashi:localSign(tenthLordPosition,language)}));
 const active=report.astronomical_birth_context?.date_specific_transits?.active_dasha;
 const dashaLord=active?.major_lord||null,antarLord=active?.antar_lord||null;
 const periodHasTenthLord=[dashaLord,antarLord].includes(lord10);
 entries.push({
   id:"TENTH_LORD_WITH_TRINE_LORD",source_rule_ids:["BPHS_48_9"],
   state:associations.length?"traditional_conjunction_pattern_observed":"pattern_not_observed",
   title:t("Tenth-lord association during planetary periods","दशमेश संबंध तथा ग्रह दशाएँ",language),
   summary:associations.length?
     t("A same-sign association of the tenth lord with a fifth- or ninth-house lord is observed. Classical texts discuss such associations in relation to planetary periods; this is not proof of a promotion or professional outcome.",
       "दशमेश का पंचमेश अथवा नवमेश के साथ एक ही राशि में संबंध देखा गया है। शास्त्र में ग्रह दशाओं के संदर्भ में इसका विवेचन मिलता है; इससे पदोन्नति या व्यावसायिक परिणाम सिद्ध नहीं होता।",language):
     t("This particular tenth-lord association is not observed in D1. Its absence does not predict a career outcome.",
       "D1 में यह विशिष्ट दशमेश संबंध नहीं दिखता। इसका अभाव करियर के परिणाम का भविष्यफल नहीं है।",language),
   factors:{tenth_lord:localPlanet(lord10,language),associations,
     selected_period_lord:localPlanet(dashaLord||"—",language),
     selected_subperiod_lord:localPlanet(antarLord||"—",language),
     tenth_lord_active_dasha:periodHasTenthLord},
   limits:["same_rashi_conjunction_is_approximation","strength_and_aspects_not_computed","no_promotion_guarantee"]
 });
 entries.push({
   id:"DASHA_COMMENCEMENT_CHECK",source_rule_ids:["BPHS_48_8"],
   state:"withheld_pending_dasha_start_houses_and_strength",
   title:t("Daśā inception qualifications","दशा आरम्भ की आवश्यक जाँच",language),
   summary:t(
     "The source also compares a planet's placement at birth and the commencement of its Daśā. Those conditions are not fully qualified here, so no auspicious/adverse result is assigned.",
     "स्रोत के अनुसार ग्रह की जन्म-स्थिति तथा दशा के आरम्भ की स्थिति दोनों देखी जाती हैं। इन दशाओं का पूर्ण सत्यापन शेष होने से शुभ-अशुभ परिणाम निर्धारित नहीं किया गया है।",
     language),
   factors:{maha:localPlanet(dashaLord||"—",language),antar:localPlanet(antarLord||"—",language)},
   limits:["period_start_positions_not_independently_qualified","no_dasha_fate_assignment"]
 });
 entries.push({
   id:"RELATIONSHIP_MULTI_FACTOR",source_rule_ids:["PM_20_3","BPHS_34_4"],
   state:"incomplete_multi_factor_marriage_review",
   title:t("Relationship indicators require several checks","संबंध-फल हेतु अनेक जाँच आवश्यक",language),
   summary:t(
     "The seventh house, its ruler and Venus are visible. Classical methods also use graha associations and aspects, divisional details and timing. This module therefore does not infer a marriage date.",
     "सप्तम भाव, उसके स्वामी और शुक्र की स्थिति उपलब्ध है। शास्त्रीय पद्धति में ग्रह-संबंध, दृष्टि, वर्ग-कुंडली और दशाएँ भी देखी जाती हैं; अतः यहाँ विवाह की तिथि नहीं बताई जाती।",
     language),
   factors:{house:7,sign:localSign(h7.rashi_index,language),
     lord:localPlanet(lord7,language),venus_sign:localSign(rashiOf("Venus"),language),
     d9_lagna_state:report.charts.D9?.lagna?.state??"unavailable"},
   limits:["no_guaranteed_marriage","aspects_not_gated","D9_conditions_incomplete"]
 });
 return {
   status:WSS05_EVIDENCE_STATUS,ready_for_prediction:false,
   language,entries,
   source_ids:[...new Set(entries.flatMap(e=>e.source_rule_ids))],
   non_scientific_traditional_interpretation:true,
   notice:t(
     "These are source-linked traditional Jyotisha observations, not scientifically verified predictions of personal events.",
     "ये स्रोत-संबद्ध पारम्परिक ज्योतिषीय संकेत हैं, व्यक्तिगत घटनाओं की वैज्ञानिक रूप से प्रमाणित भविष्यवाणियाँ नहीं।",
     language)
 };
}
