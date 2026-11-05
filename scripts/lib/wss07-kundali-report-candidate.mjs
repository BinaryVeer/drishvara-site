/**
 * WSS07 data contract — offline candidate, NOT an approved Kundali display.
 * The report has no name: subscriber name is exclusively a local, optional
 * presentation/consented Nāma Rāśi factor outside astronomical computation.
 *
 * The candidate's "windows" are intervals astrologers traditionally inspect
 * for a subject based on planetary-period lords, NOT marriage/job predictions,
 * probabilities, auspicious claims or guaranteed life events.
 */
import {buildPersonContextCandidate,dailyTransitCandidate,periodTransitCandidate}
 from "./wss05-06-context-and-transits-candidate.mjs";
import {divisionalChartsCandidate} from "./wss04-varga-vimshottari-candidate.mjs";
export const WSS07_STATUS="candidate_chart_report_not_approved_for_user_prediction";
export const WSS07_RASHI_LORDS=Object.freeze([
 "Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars",
 "Jupiter","Saturn","Saturn","Jupiter"
]);
export const GRAHA_CLASSICAL_COLOUR=Object.freeze({
 Sun:{association:"dark red",source_rule:"BPHS_CH3_VERSE16_COMPLEXION"},
 Moon:{association:"pale/white",source_rule:"BPHS_CH3_VERSE16_COMPLEXION"},
 Mars:{association:"red",source_rule:"BPHS_CH3_VERSE16_COMPLEXION"},
 Mercury:{association:"grass-green",source_rule:"BPHS_CH3_VERSE16_COMPLEXION"},
 Jupiter:{association:"fair/golden",source_rule:"BPHS_CH3_VERSE17_COMPLEXION"},
 Venus:{association:"dusky",source_rule:"BPHS_CH3_VERSE17_COMPLEXION"},
 Saturn:{association:"dark/black",source_rule:"BPHS_CH3_VERSE17_COMPLEXION"}
});
function ensureObject(value) {
 if(!value||typeof value!=="object"||Array.isArray(value))
   throw new TypeError("Candidate birth input object required");
 if("name" in value||"subscriber_id" in value||"email" in value)
   throw new RangeError("Names and account identifiers must not enter astronomical computation");
}
function lordOfHouse(natal,houseNumber){
 const house=natal.whole_sign_houses?.find(h=>h.number===houseNumber);
 if(!house)return null;
 return {house:houseNumber,rashi:house.rashi,
   graha_lord:WSS07_RASHI_LORDS[house.rashi_index-1],
   source_rule:"CLASSICAL_RASHI_LORDSHIP_BPHS_CH4"};
}
function reviewWindows(periods,{referenceUtc,untilUtc,lords,domain,ruleId}){
 const start=Date.parse(referenceUtc),end=Date.parse(untilUtc);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return [];
 const result=[];
 for(const major of periods.mahadashas){
  for(const antar of major.antardashas){
   const a=Math.max(start,Date.parse(antar.start_utc));
   const b=Math.min(end,Date.parse(antar.end_exclusive_utc));
   if(!(a<b))continue;
   const matches=[];
   if(lords.includes(major.lord))matches.push("Mahadasha lord: "+major.lord);
   if(lords.includes(antar.lord))matches.push("Antardasha lord: "+antar.lord);
   if(!matches.length)continue;
   result.push({domain,review_start_utc:new Date(a).toISOString(),
     review_end_exclusive_utc:new Date(b).toISOString(),
     mahadasha:major.lord,antardasha:antar.lord,
     matched_calculated_factors:matches,
     rule_ids:[ruleId,"VIMSHOTTARI_MAHA_ANTAR_TIME_BASIS"],
     status:"traditional_review_window_not_a_forecast",
     probability:null,favorable_outcome:null,guaranteed_event:null});
  }
 }
 return result;
}
export function assembleKundaliReportCandidate(input={}) {
 ensureObject(input);
 const {birthDate,birthTime,birthTimezone,birthLatitude,birthLongitude,
   birthFold,yearConvention,timePrecisionSeconds=60,
   referenceDate,referenceTimezone,referenceLatitude,referenceLongitude,
   yearsToReview=10,includeDailyYear=false}=input;
 if(!Number.isInteger(yearsToReview)||yearsToReview<1||yearsToReview>30)
   throw new RangeError("Review-window horizon must be 1–30 years");
 const person=buildPersonContextCandidate({
   birthDate,birthTime,birthTimezone,birthLatitude,birthLongitude,
   fold:birthFold,yearConvention,birthTimePrecisionSeconds:timePrecisionSeconds
 });
 if(person.status!=="wss05_06_candidate_structured_context_not_prediction")
   return {status:"birth_basis_unavailable",reason:person.reason,
     ready_for_public_display:false};
 const transit=dailyTransitCandidate({
   referenceDate,timezone:referenceTimezone,
   latitude:referenceLatitude,longitude:referenceLongitude,
   natal:person.natal,dasha:person.dasha
 });
 if(transit.status!=="wss05_06_candidate_structured_context_not_prediction")
   return {status:"reference_date_unavailable",reason:transit.status,
     ready_for_public_display:false};
 const start=transit.utc;
 const end=new Date(Date.parse(start)+yearsToReview*365.25*86400000).toISOString();
 const house7=lordOfHouse(person.natal,7);
 const house10=lordOfHouse(person.natal,10);
 const marriageLords=[house7?.graha_lord,"Venus"].filter(Boolean);
 const professionalLords=[house10?.graha_lord].filter(Boolean);
 const classicalPlanetaryColour=GRAHA_CLASSICAL_COLOUR[transit.active_dasha?.major_lord]||null;
 return {
   status:WSS07_STATUS,
   ready_for_public_display:false,
   name_used_for_calculation:false,
   privacy:{no_persistence_performed:true,raw_inputs_not_sent_to_network:true,
     saved_profiles_unavailable_until_opt_in_security_review:true},
   basis:{
     birth_instant_utc:person.birth_instant.utc,
     birth_time_precision_seconds:timePrecisionSeconds,
     timezone:person.birth_instant.timezone,
     geographic_basis:{latitude:birthLatitude,longitude:birthLongitude},
     ref_day:referenceDate,
     source_methods:person.natal.versions,
     dasha_year_convention:person.dasha.year_convention
   },
   charts:{
     D1:{state:"candidate_chart",lagna:person.natal.lagna,
       grahas:person.natal.grahas,whole_sign_houses:person.natal.whole_sign_houses},
     D9:divisionalChartsCandidate(person.natal,{birthTimePrecisionSeconds:timePrecisionSeconds}).D9,
     D10:divisionalChartsCandidate(person.natal,{birthTimePrecisionSeconds:timePrecisionSeconds}).D10
   },
   astronomical_birth_context:{
     janma_rashi:person.natal.grahas.find(x=>x.graha==="Moon")?.rashi.rashi,
     janma_nakshatra:person.natal.moon_nakshatra.nakshatra,
     janma_nakshatra_pada:person.natal.moon_nakshatra.pada,
     dasha_balance_years:person.dasha.birth_balance_years,
     mahadashas:person.dasha.mahadashas,
     date_specific_transits:transit
   },
   life_domain_observations:person.indicators.domains,
   traditional_time_windows_for_review:{
     relationships:reviewWindows(person.dasha,{referenceUtc:start,untilUtc:end,
       lords:marriageLords,domain:"relationships",
       ruleId:"BPHS_CH48_SEVENTH_HOUSE_LORD_PERIOD_CONTEXT_PENDING_FULL_CONDITIONS"}),
     work:reviewWindows(person.dasha,{referenceUtc:start,untilUtc:end,
       lords:professionalLords,domain:"work",
       ruleId:"BPHS_CH48_TENTH_HOUSE_LORD_PERIOD_CONTEXT_PENDING_FULL_CONDITIONS"})
   },
   optional_traditional_colour_reference:classicalPlanetaryColour?
     {...classicalPlanetaryColour,planetary_period:transit.active_dasha?.major_lord,
       basis_only:"BPHS graha complexion, NOT evidence of person's preferred colour or benefit"}:null,
   unsupported_claims:[
     "Exact marriage date or marriage outcome",
     "Guaranteed employment/promotion/sector suitability",
     "Scientifically verified personal colour preference",
     "Medical, investment or life-decision certainty"
   ],
   interpretation_status:"conditional_rules_need_source_approval_before_prediction",
   month_year_status:includeDailyYear?
     "request_periodTransitCandidate_explicit_dates_no_automatic_forecast":
     "not_requested"
 };
}
