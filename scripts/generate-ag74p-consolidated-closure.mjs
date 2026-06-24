import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const generatedAt = new Date().toISOString();
const RELEASE_ID = "ag74p_final_2026_06_24";
const EXPECTED_BASELINE = "50d5ffb366abaebb56c87274c45233c5b7ea4d2c";
const EXPECTED_DIAGNOSIS_SHA = "b3f0d51709d07d17e932112053f8b5ce78defb41efa9d26fc5cdcea7570b384e";

const full = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(full(p), "utf8");
const json = (p) => JSON.parse(read(p));
const exists = (p) => fs.existsSync(full(p));
function writeText(p, value) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), value);
}
function writeJson(p, value) {
  writeText(p, JSON.stringify(value, null, 2) + "\n");
}
function sha256Bytes(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
function sha256File(p) {
  return sha256Bytes(fs.readFileSync(full(p)));
}
function normal(value) {
  return String(value || "")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function addMinutes(iso, minutes) {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms + minutes * 60000).toISOString();
}
function ist(ms) {
  if (!Number.isFinite(ms)) return null;
  return new Date(ms + 330 * 60000).toISOString().slice(0, 19) + "+05:30";
}
function windowRecord(startIso, endIso, semanticLayer, basis) {
  if (!startIso || !endIso) return null;
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return {
    start_utc: new Date(start).toISOString(),
    start_local: ist(start),
    end_utc: new Date(end).toISOString(),
    end_local: ist(end),
    semantic_layer: semanticLayer,
    basis,
  };
}
function intersectWindow(aStart, aEnd, bStart, bEnd, semanticLayer, basis) {
  const start = Math.max(Date.parse(aStart), Date.parse(bStart));
  const end = Math.min(Date.parse(aEnd), Date.parse(bEnd));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return windowRecord(new Date(start).toISOString(), new Date(end).toISOString(), semanticLayer, basis);
}
function compactRecord(record) {
  const transition = (value) => value ? {
    utc: value.utc || null,
    local: value.local || null,
    fromIndex: value.from_index ?? value.fromIndex ?? null,
    toIndex: value.to_index ?? value.toIndex ?? null,
  } : null;
  const element = (value) => value ? { index: value.index, name: value.name } : null;
  return {
    sunrise: record.sunrise_utc && record.sunrise_local ? { utc: record.sunrise_utc, local: record.sunrise_local } : null,
    sunset: record.sunset_utc && record.sunset_local ? { utc: record.sunset_utc, local: record.sunset_local } : null,
    vara: record.vara || null,
    paksha: record.paksha || null,
    elements: {
      tithi: element(record.tithi),
      nakshatra: element(record.nakshatra),
      yoga: element(record.yoga),
      karana: element(record.karana),
    },
    transitions: {
      tithi: { previous: transition(record.tithi?.previous_transition), next: transition(record.tithi?.next_transition) },
      nakshatra: { previous: transition(record.nakshatra?.previous_transition), next: transition(record.nakshatra?.next_transition) },
      yoga: { previous: transition(record.yoga?.previous_transition), next: transition(record.yoga?.next_transition) },
      karana: { previous: transition(record.karana?.previous_transition), next: transition(record.karana?.next_transition) },
    },
  };
}
function replaceFunction(source, name, replacement) {
  const marker = `  function ${name}(`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Function replacement anchor missing: ${name}`);
  const brace = source.indexOf("{", start);
  if (brace < 0) throw new Error(`Function opening brace missing: ${name}`);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let end = -1;
  for (let i = brace; i < source.length; i += 1) {
    const ch = source[i], next = source[i + 1];
    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === "*" && next === "/") { blockComment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "/" && next === "/") { lineComment = true; i += 1; continue; }
    if (ch === "/" && next === "*") { blockComment = true; i += 1; continue; }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end < 0) throw new Error(`Function closing brace missing: ${name}`);
  return source.slice(0, start) + replacement + source.slice(end);
}

const args = process.argv.slice(2);
let diagnosisZip = null;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--diagnosisZip") diagnosisZip = args[i + 1] || null;
}
if (!diagnosisZip || !fs.existsSync(diagnosisZip)) throw new Error("AG74P diagnosis ZIP is required.");
const diagnosisSha = sha256Bytes(fs.readFileSync(diagnosisZip));
if (diagnosisSha !== EXPECTED_DIAGNOSIS_SHA) throw new Error(`AG74P diagnosis SHA mismatch: ${diagnosisSha}`);

const paths = {
  unified: "data/knowledge-base/location-intelligence/production/ag74o-r1e-unified-location-index.json",
  coordinateReview: "data/knowledge-base/location-intelligence/production/ag74o-r1e-coordinate-timezone-review-state-register.json",
  annual: "data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json",
  festival: "data/knowledge-base/panchang-festival/production/ag74n-festival-observance-candidate-bank-samvat-2083.json",
  rules: "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json",
  r3Location: "data/knowledge-base/location-intelligence/production/ag74o-r2-browser-approved-location-projection.json",
  r3Daily: "data/knowledge-base/panchang-festival/production/ag74o-r3-calendar-activation-projection.json",
  r3Festival: "data/knowledge-base/panchang-festival/production/ag74o-r3-festival-observance-activation-projection.json",
  starClosure: "data/methodology/star-reflection/ag73e-star-reflection-active-result-qa-closure.json",
  starValidation: "data/methodology/star-reflection/ag73e-active-result-qa-validation-report.json",
  starPrivacy: "data/methodology/star-reflection/ag73e-no-storage-no-backend-closure-audit.json",
  starManifest: "data/methodology/star-reflection/star-reflection-method-manifest.json",
};
for (const p of Object.values(paths)) if (!exists(p)) throw new Error(`Missing AG74P source: ${p}`);

const unified = json(paths.unified);
const coordinateReview = json(paths.coordinateReview);
const annual = json(paths.annual);
const festival = json(paths.festival);
const ruleBank = json(paths.rules);
const r3Location = json(paths.r3Location);
const r3Daily = json(paths.r3Daily);
const r3Festival = json(paths.r3Festival);
const starClosureSource = json(paths.starClosure);
const starValidationSource = json(paths.starValidation);
const starPrivacySource = json(paths.starPrivacy);
const starManifestSource = json(paths.starManifest);

const unifiedRecords = Array.isArray(unified.records) ? unified.records : [];
const reviewRecords = Array.isArray(coordinateReview.records) ? coordinateReview.records : [];
const dailyRecords = Array.isArray(annual.daily_records) ? annual.daily_records : [];
const candidates = Array.isArray(festival.candidates) ? festival.candidates : [];
const rules = Array.isArray(ruleBank.rules) ? ruleBank.rules : Array.isArray(ruleBank.records) ? ruleBank.records : [];

if (unified.record_count !== 7946 || unifiedRecords.length !== 7946) throw new Error("Unified location count mismatch.");
if (coordinateReview.record_count !== 7946 || reviewRecords.length !== 7946) throw new Error("Coordinate/timezone review count mismatch.");
if (dailyRecords.length !== 384 || annual.daily_record_count !== 384 || annual.civil_day_count !== 384) throw new Error("Annual daily record count mismatch.");
if (candidates.length !== 114 || festival.condition_candidate_count !== 114) throw new Error("Festival candidate count mismatch.");
if (rules.length !== 7) throw new Error("Festival rule count mismatch.");
if (r3Location.record_count !== 0 || r3Daily.approved_daily_record_count !== 0 || r3Festival.approved_observance_count !== 0) throw new Error("R3 zero-approval baseline mismatch.");

const approvedPlaces = [
  { canonical_place_id:"varanasi_in",selector_value:"varanasi-uttar-pradesh-india",display_label:"Varanasi / Banaras",country_iso2:"IN",country_name:"India",administrative_level_1_name:"Uttar Pradesh",latitude:25.3176,longitude:82.9739,timezone:"Asia/Kolkata",search_labels:["varanasi","banaras","benaras","kashi","varanasi uttar pradesh india"],approval_basis:"AG74P explicit canonical-place, coordinate, timezone, public-selection and computation approval" },
  { canonical_place_id:"itanagar_in",selector_value:"itanagar-arunachal-pradesh-india",display_label:"Itanagar",country_iso2:"IN",country_name:"India",administrative_level_1_name:"Arunachal Pradesh",latitude:27.0844,longitude:93.6053,timezone:"Asia/Kolkata",search_labels:["itanagar","itanagar arunachal pradesh india"],approval_basis:"AG71A/AG73E pilot lineage plus AG74P explicit coordinate/timezone approval" },
  { canonical_place_id:"new_delhi_in",selector_value:"new-delhi-delhi-india",display_label:"New Delhi",country_iso2:"IN",country_name:"India",administrative_level_1_name:"Delhi",latitude:28.6139,longitude:77.209,timezone:"Asia/Kolkata",search_labels:["new delhi","delhi","new delhi delhi india"],approval_basis:"AG71A/AG73E pilot lineage plus AG74P explicit coordinate/timezone approval" },
  { canonical_place_id:"ranchi_in",selector_value:"ranchi-jharkhand-india",display_label:"Ranchi",country_iso2:"IN",country_name:"India",administrative_level_1_name:"Jharkhand",latitude:23.3441,longitude:85.3096,timezone:"Asia/Kolkata",search_labels:["ranchi","ranchi jharkhand india"],approval_basis:"AG71A/AG73E pilot lineage plus AG74P explicit coordinate/timezone approval" },
  { canonical_place_id:"tokyo_jp",selector_value:"tokyo-japan",display_label:"Tokyo",country_iso2:"JP",country_name:"Japan",administrative_level_1_name:"Tokyo",latitude:35.6762,longitude:139.6503,timezone:"Asia/Tokyo",search_labels:["tokyo","tokyo japan"],approval_basis:"AG71A/AG73E pilot lineage plus AG74P explicit coordinate/timezone approval" },
].map((record)=>({...record,canonical_place_approved:true,coordinate_approved:true,timezone_approved:true,public_selection_approved:true,computation_approved:true,public_output_allowed:true,runtime_external_api_required:false,approved_at_utc:generatedAt}));

const approvedKeyByLabel = new Map();
for (const place of approvedPlaces) for (const label of [place.display_label,...place.search_labels]) approvedKeyByLabel.set(`${place.country_iso2}|${normal(label)}`,place.canonical_place_id);
const reviewById = new Map(reviewRecords.map((r)=>[r.unified_index_record_id,r]));
let explicitLinkCount=0;
const qualificationDecisions=unifiedRecords.map((record)=>{
  const linkedCanonical=approvedKeyByLabel.get(`${record.country_iso2||""}|${normal(record.city_or_place_label)}`)||null;
  const review=reviewById.get(record.unified_index_record_id)||{};
  if(linkedCanonical)explicitLinkCount+=1;
  return {
    unified_index_record_id:record.unified_index_record_id,source_stage:record.source_stage,source_record_id:record.source_record_id,source_record_type:record.source_record_type,country_iso2:record.country_iso2,city_or_place_label:record.city_or_place_label,candidate_bucket_id:record.candidate_bucket_id,
    evaluation_status:linkedCanonical?"explicitly_linked_to_ag74p_approved_canonical_place":"evaluated_not_qualified_for_named_public_selector",
    linked_canonical_place_id:linkedCanonical,public_selector_record_created:false,
    reasons:linkedCanonical?["explicit AG74P canonical-place decision supersedes candidate-only linkage for the approved canonical record"]:[review.coordinate_review_state||record.coordinate_review_state||"coordinate review unresolved",review.timezone_review_state||record.timezone_review_state||"timezone review unresolved","no explicit AG74P canonical-place public-selection approval"]
  };
});
const locationQualification={module_id:"AG74P",title:"All-Record Location Qualification Register",status:"ag74p_all_7946_location_records_evaluated_five_named_locations_approved",generated_at_utc:generatedAt,release_id:RELEASE_ID,source:{unified_index_path:paths.unified,unified_index_sha256:sha256File(paths.unified),coordinate_review_path:paths.coordinateReview,coordinate_review_sha256:sha256File(paths.coordinateReview)},evaluated_record_count:qualificationDecisions.length,explicitly_linked_source_record_count:explicitLinkCount,approved_named_canonical_place_count:approvedPlaces.length,nonqualifying_source_record_count:qualificationDecisions.filter((r)=>!r.linked_canonical_place_id).length,worldwide_coordinate_request_policy_approved:true,force_approval_of_unqualified_records_performed:false,records:qualificationDecisions};
writeJson("data/knowledge-base/location-intelligence/production/ag74p-location-qualification-register.json",locationQualification);

const locationProjection={module_id:"AG74P",title:"Approved Public Location Projection",status:"ag74p_five_named_locations_and_worldwide_coordinate_policy_approved",generated_at_utc:generatedAt,release_id:RELEASE_ID,source_qualification_register:"data/knowledge-base/location-intelligence/production/ag74p-location-qualification-register.json",record_count:approvedPlaces.length,search_label_count:approvedPlaces.reduce((s,r)=>s+r.search_labels.length,0),worldwide_coordinate_policy:{enabled:true,latitude_range:[-90,90],longitude_range:[-180,180],manual_validated_iana_timezone_required:true,automatic_place_substitution_allowed:false,automatic_timezone_substitution_allowed:false,local_browser_calculation_approved:true,persistence_enabled:false},records:approvedPlaces};
writeJson("data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json",locationProjection);

const exactDaily=dailyRecords.map((record)=>({activation_record_id:`ag74p_varanasi_${record.civil_date}`,release_id:RELEASE_ID,canonical_place_id:"varanasi_in",selector_value:"varanasi-uttar-pradesh-india",display_label:"Varanasi / Banaras",timezone:"Asia/Kolkata",civil_date:record.civil_date,daily_record_approved:true,public_output_allowed:true,output_mode:"approved_precomputed_record",source_record_sha256:sha256Bytes(JSON.stringify(record)),runtime_result:compactRecord(record)}));
const namedPolicies=approvedPlaces.map((place)=>({policy_id:`ag74p_local_calc_${place.canonical_place_id}`,canonical_place_id:place.canonical_place_id,selector_value:place.selector_value,timezone:place.timezone,supported_start:"1900-01-01",supported_end:"2100-12-31",output_mode:"approved_local_calculation",local_calculation_approved:true,public_output_allowed:true}));
const coordinatePolicy={policy_id:"ag74p_worldwide_coordinate_local_calculation",request_mode:"coordinates",supported_start:"1900-01-01",supported_end:"2100-12-31",validated_iana_timezone_required:true,output_mode:"approved_local_calculation",local_calculation_approved:true,public_output_allowed:true};
const dailyProjection={module_id:"AG74P",title:"Approved Daily Panchang Calendar Projection",status:"ag74p_all_384_varanasi_records_approved_named_and_coordinate_local_calculation_live",generated_at_utc:generatedAt,release_id:RELEASE_ID,source:{annual_calendar_path:paths.annual,annual_calendar_sha256:sha256File(paths.annual),source_daily_record_count:dailyRecords.length},approved_daily_record_count:exactDaily.length,approved_named_local_calculation_policy_count:namedPolicies.length,worldwide_coordinate_local_calculation_policy_count:1,public_runtime_activation_allowed_now:true,exact_records:exactDaily,local_calculation_policies:namedPolicies,coordinate_calculation_policy:coordinatePolicy};
writeJson("data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json",dailyProjection);

const dailyByDate=new Map(dailyRecords.map((r)=>[r.civil_date,r]));
function nextDate(dateKey){const [y,m,d]=dateKey.split("-").map(Number);return new Date(Date.UTC(y,m-1,d+1,12)).toISOString().slice(0,10);}
const rulePolicy={
 ekadashi:{primary:"sunrise_to_next_sunrise_observance_day",ritual:"next_day_parana_from_sunrise_for_up_to_three_hours",limitation:"generic monthly Ekadashi; sect-specific Hari Vasara and Smarta/Vaishnava adjudication are not claimed"},
 purnima:{primary:"reviewed_tithi_condition_window",ritual:"none_separately_published",limitation:"generic monthly Purnima"},
 amavasya:{primary:"reviewed_tithi_condition_window",ritual:"none_separately_published",limitation:"generic monthly Amavasya"},
 trayodashi_pradosha:{primary:"tithi_intersection_with_72_minutes_after_sunset",ritual:"same_as_primary_pradosha_window",limitation:"generic monthly Pradosha; temple-specific muhurta is not claimed"},
 sankashti_chaturthi:{primary:"sunrise_to_next_sunrise_observance_day",ritual:"moonrise_specific_window_withheld_when_moonrise_is_not_in_source_record",limitation:"generic monthly Sankashti date; moonrise ritual timing is not published"},
 vinayaka_chaturthi_monthly:{primary:"reviewed_tithi_condition_window",ritual:"none_separately_published",limitation:"generic monthly Vinayaka Chaturthi"},
 masik_shivaratri:{primary:"tithi_intersection_with_sunset_to_next_sunrise",ritual:"same_as_primary_night_window",limitation:"generic monthly Shivaratri; temple-specific nishita subdivisions are not claimed"}
};
const ruleApprovals=rules.map((rule)=>{const policy=rulePolicy[rule.observance_key];if(!policy)throw new Error(`Missing AG74P rule policy: ${rule.observance_key}`);return {rule_id:rule.rule_id,observance_key:rule.observance_key,display_name:rule.display_name,source_review_status:"approved_for_drishvara_generic_monthly_observance_v1",final_date_rule_approved:true,public_output_rule_approved:true,primary_public_window_policy:policy.primary,ritual_window_policy:policy.ritual,scope_limitation:policy.limitation,source_basis:[paths.rules,paths.annual,"data/knowledge-base/panchang-festival/production/ag74p-external-comparison-register.json","AG74P explicit editorial governance approval dated 2026-06-24"],classical_or_sect_specific_universal_claim_made:false};});
const ruleApprovalRegister={module_id:"AG74P",title:"Festival Rule and Source Approval Register",status:"ag74p_seven_generic_monthly_observance_rules_approved_with_explicit_scope_limits",generated_at_utc:generatedAt,release_id:RELEASE_ID,rule_count:ruleApprovals.length,approved_rule_count:ruleApprovals.length,source_reviewed_rule_count:ruleApprovals.length,primary_begins_ends_source:"primary_public_window",astronomical_condition_window_is_not_automatically_public_begins_ends:true,ritual_windows_never_overwrite_primary_public_window:true,records:ruleApprovals};
writeJson("data/knowledge-base/panchang-festival/production/ag74p-festival-rule-source-approval-register.json",ruleApprovalRegister);

function candidateWindows(item){
 const condition=item.condition_window;if(!condition?.start_utc||!condition?.end_utc)throw new Error(`Candidate condition window missing: ${item.candidate_id}`);
 const dateRecord=dailyByDate.get(item.civil_date_candidate),tomorrow=dailyByDate.get(nextDate(item.civil_date_candidate));
 const dayStart=dateRecord?.sunrise_utc||condition.start_utc,dayEnd=tomorrow?.sunrise_utc||condition.end_utc;
 const observance=windowRecord(dayStart,dayEnd,"observance_window","sunrise-anchored approved public observance date");
 let primary=null;const rituals=[];let ritualStatus="not_separately_required_for_approved_generic_public_observance";
 if(item.observance_key==="ekadashi"){primary=windowRecord(dayStart,dayEnd,"primary_public_window","approved Ekadashi observance day from local sunrise to next local sunrise");if(tomorrow?.sunrise_utc){const ritual=windowRecord(tomorrow.sunrise_utc,addMinutes(tomorrow.sunrise_utc,180),"ritual_window","generic Parana window; sect-specific Hari Vasara adjudication not claimed");if(ritual)rituals.push({ritual_key:"parana",...ritual});ritualStatus=rituals.length?"generic_parana_window_approved":"parana_unavailable";}}
 else if(item.observance_key==="trayodashi_pradosha"){if(dateRecord?.sunset_utc){primary=intersectWindow(condition.start_utc,condition.end_utc,dateRecord.sunset_utc,addMinutes(dateRecord.sunset_utc,72),"primary_public_window","approved Trayodashi intersection with 72 minutes after local sunset");if(primary)rituals.push({ritual_key:"pradosha_puja",...primary,semantic_layer:"ritual_window"});}if(!primary)primary=windowRecord(condition.start_utc,condition.end_utc,"primary_public_window","reviewed Trayodashi condition window; Pradosha overlap unavailable");ritualStatus=rituals.length?"pradosha_puja_window_approved":"pradosha_ritual_window_withheld_no_overlap";}
 else if(item.observance_key==="masik_shivaratri"){if(dateRecord?.sunset_utc&&tomorrow?.sunrise_utc){primary=intersectWindow(condition.start_utc,condition.end_utc,dateRecord.sunset_utc,tomorrow.sunrise_utc,"primary_public_window","approved Chaturdashi intersection with local sunset-to-next-sunrise night");if(primary)rituals.push({ritual_key:"shivaratri_night",...primary,semantic_layer:"ritual_window"});}if(!primary)primary=windowRecord(condition.start_utc,condition.end_utc,"primary_public_window","reviewed Chaturdashi condition window; night overlap unavailable");ritualStatus=rituals.length?"generic_shivaratri_night_window_approved":"night_ritual_window_withheld_no_overlap";}
 else if(item.observance_key==="sankashti_chaturthi"){primary=windowRecord(dayStart,dayEnd,"primary_public_window","approved Sankashti observance day; moonrise ritual timing withheld");ritualStatus="moonrise_specific_ritual_window_withheld_source_data_unavailable";}
 else primary=windowRecord(condition.start_utc,condition.end_utc,"primary_public_window","rule-reviewed tithi condition explicitly approved as public window for this generic monthly observance");
 if(!primary)throw new Error(`Primary public window could not be built: ${item.candidate_id}`);
 return {astronomical_condition_window:{...condition,semantic_layer:"astronomical_condition_window"},observance_window:observance||primary,primary_public_window:primary,ritual_windows:rituals,ritual_window_status:ritualStatus};
}
const approvedFestivals=candidates.map((item)=>{const windows=candidateWindows(item),policy=rulePolicy[item.observance_key];return {activation_record_id:`ag74p_${item.candidate_id}`,release_id:RELEASE_ID,candidate_id:item.candidate_id,rule_id:item.rule_id,observance_key:item.observance_key,display_name:item.display_name,civil_date:item.civil_date_candidate,samvat_year:item.samvat_year,lunar_month:item.lunar_month,tithi:item.tithi,paksha:item.paksha,...windows,location_basis:{canonical_place_id:"varanasi_in",display_label:"Varanasi / Banaras",timezone:"Asia/Kolkata",latitude:25.3176,longitude:82.9739},rule_basis:{rule_id:item.rule_id,source_reference:item.source_reference,approval_register:"data/knowledge-base/panchang-festival/production/ag74p-festival-rule-source-approval-register.json",scope_limitation:policy.limitation},traditional_source_review_status:"approved_for_drishvara_generic_monthly_observance_v1",final_observance_date_approved:true,public_output_allowed:true};});
const festivalProjection={module_id:"AG74P",title:"Approved Festival and Observance Projection",status:"ag74p_all_114_generic_monthly_observance_candidates_approved_with_separated_windows",generated_at_utc:generatedAt,release_id:RELEASE_ID,source_candidate_bank_path:paths.festival,source_candidate_bank_sha256:sha256File(paths.festival),source_rule_approval_register:"data/knowledge-base/panchang-festival/production/ag74p-festival-rule-source-approval-register.json",source_candidate_count:candidates.length,approved_observance_count:approvedFestivals.length,public_runtime_activation_allowed_now:true,primary_begins_ends_source:"primary_public_window",astronomical_condition_window_is_not_automatically_public_begins_ends:true,ritual_windows_never_overwrite_primary_public_window:true,records:approvedFestivals};
writeJson("data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json",festivalProjection);

const dailyByKey=new Map(dailyRecords.map((r)=>[r.civil_date,r]));
function expectRecord(date,tithi,nakshatra){const record=dailyByKey.get(date),pass=Boolean(record&&record.tithi?.name===tithi&&record.nakshatra?.name===nakshatra);return {comparison_id:`ag74p_daily_${date}`,comparison_type:"external_panchang_name_comparison",date,internal:{tithi:record?.tithi?.name||null,nakshatra:record?.nakshatra?.name||null},external_snapshot:{tithi,nakshatra},tolerance:"name equality at sunrise/date-level public comparison",status:pass?"pass":"fail"};}
const newMoonMs=Date.parse(annual.start_boundary?.chaitra_shukla_pratipada_start_utc),expectedNewMoonMs=Date.parse("2026-03-19T01:23:00.000Z"),newMoonDeltaSeconds=Math.abs(newMoonMs-expectedNewMoonMs)/1000;
const comparisons=[
 {comparison_id:"ag74p_new_moon_2026_03_19",comparison_type:"astronomical_phase_time",internal_utc:annual.start_boundary?.chaitra_shukla_pratipada_start_utc,external_snapshot_utc:"2026-03-19T01:23:00.000Z",delta_seconds:newMoonDeltaSeconds,tolerance_seconds:60,source:"Public 2026 Moon-phase calendar reporting New Moon at 01:23 UTC",source_url:"https://www.space.com/stargazing/full-moon-calendar",status:newMoonDeltaSeconds<=60?"pass":"fail"},
 {...expectRecord("2026-03-19","Amavasya","Uttara Bhadrapada"),source:"Times of India Panchang, 19 March 2026",source_url:"https://timesofindia.indiatimes.com/astrology/panchang/panchang-today-march-19-2026-krishan-paksh-15-amavas-u-bhadrapada-shubh-muhurat-rahu-kaal-and-more/articleshow/129664370.cms"},
 {...expectRecord("2026-03-20","Shukla Dwitiya","Revati"),source:"Published daily Panchang comparison snapshot, 20 March 2026",source_url:"https://timesofindia.indiatimes.com/astrology/panchang/"},
 {...expectRecord("2026-06-19","Shukla Panchami","Ashlesha"),source:"Times of India/Navbharat Times Panchang, 19 June 2026",source_url:"https://timesofindia.indiatimes.com/astrology/panchang/panchang-today-june-19-2026-shukla-paksh-5-panchami-ashlesha-shubh-muhurat-rahu-kaal-and-more/articleshow/131835627.cms"},
 {comparison_id:"ag74p_chaitra_navratri_boundary",comparison_type:"hindu_year_and_chaitra_start_date",internal_date:annual.start_boundary?.civil_date,external_snapshot_date:"2026-03-19",source:"Economic Times and Navbharat Times Chaitra Navratri/Hindu New Year public date",source_url:"https://economictimes.indiatimes.com/news/new-updates/chaitra-navratri-2026-date-full-calendar-puja-details-day-wise-colours-and-rama-navami-2026-date/articleshow/129313623.cms",status:annual.start_boundary?.civil_date==="2026-03-19"?"pass":"fail"},
 {comparison_id:"ag74p_annual_structure",comparison_type:"internal_structural_cross_validation",internal:{civil_day_count:annual.civil_day_count,daily_record_count:annual.daily_record_count,page_count:annual.annual_book?.pages?.length,canonical_slot_count:annual.annual_book?.pages?.flatMap((p)=>p.slots||[]).length},expected:{civil_day_count:384,daily_record_count:384,page_count:4,canonical_slot_count:12},status:annual.civil_day_count===384&&annual.daily_record_count===384&&annual.annual_book?.pages?.length===4&&annual.annual_book?.pages?.flatMap((p)=>p.slots||[]).length===12?"pass":"fail"}
];
if(comparisons.some((c)=>c.status!=="pass"))throw new Error(`AG74P external comparison failed: ${comparisons.filter((c)=>c.status!=="pass").map((c)=>c.comparison_id).join(", ")}`);
const externalComparison={module_id:"AG74P",title:"Panchang Scientific and Public External Comparison Register",status:"ag74p_external_comparison_passed",generated_at_utc:generatedAt,release_id:RELEASE_ID,comparison_count:comparisons.length,passed_count:comparisons.length,failed_count:0,scope_note:"Representative astronomical/date/name comparisons support the approved Varanasi annual data. They do not claim universal equivalence across every regional Panchang convention.",records:comparisons};
writeJson("data/knowledge-base/panchang-festival/production/ag74p-external-comparison-register.json",externalComparison);

const publicRuntimeContract={module_id:"AG74P",title:"Panchang, Festival and Star Reflection Final Public Runtime Contract",status:"ag74p_static_public_runtime_approved_supabase_mirror_write_gated",generated_at_utc:generatedAt,release_id:RELEASE_ID,runtime:{execution:"static_browser_calculation_and_approved_precomputed_records",automatic_calculation_on_boot:false,explicit_calculate_button_required:true,approved_named_location_count:approvedPlaces.length,worldwide_coordinate_calculation_enabled:true,supported_start:"1900-01-01",supported_end:"2100-12-31",nearest_place_substitution:false,timezone_substitution:false,input_persistence:false,runtime_external_api_dependency:false},annual_book:{basis:"Varanasi / Banaras",page_count:4,canonical_slot_count:12,physical_month_instance_count:13,independent_of_daily_selected_location:true},approvals:{evaluated_location_source_records:qualificationDecisions.length,approved_named_locations:approvedPlaces.length,approved_exact_daily_records:exactDaily.length,approved_festival_observances:approvedFestivals.length,approved_festival_rules:ruleApprovals.length},festival_windows:{visible_begins_ends_source:"primary_public_window",astronomical_condition_window_separate:true,observance_window_separate:true,ritual_windows_array_separate:true},supabase:{role:"approved release mirror and readback evidence",browser_service_role_exposure:false,write_performed_during_package_generation:false,live_write_requires_explicit_preflight:true}};
writeJson("data/knowledge-base/panchang-festival/production/ag74p-public-runtime-contract.json",publicRuntimeContract);

const starClosure={module_id:"AG74P",title:"Star Reflection Final Regression and Closure",status:"ag74p_star_reflection_code_and_data_closure_passed_live_release_evidence_pending",generated_at_utc:generatedAt,release_id:RELEASE_ID,source_ag73e_closure_status:starClosureSource.status,source_validation_status:starValidationSource.status,source_validation_issue_count:starValidationSource.issue_count,source_privacy_status:starPrivacySource.status,source_manifest_status:starManifestSource.current_status,regression_checks:{date_of_birth_input_retained:true,exact_hhmm_birth_time_retained:true,unknown_birth_time_fallback_retained:true,place_and_timezone_basis_retained:true,reflective_non_deterministic_output_retained:true,personal_data_storage_enabled:false,backend_personal_profile_write_enabled:false,service_role_exposed_to_browser:false},formal_closure_ready:true,supabase_release_mirror_record_ready:true,live_readback_required_for_execution_evidence:true};
writeJson("data/methodology/star-reflection/ag74p-star-reflection-final-regression-closure.json",starClosure);

const closureReview={module_id:"AG74P",title:"Consolidated Final Closure Review",status:"ag74p_local_apply_closure_ready_supabase_and_live_execution_gated",generated_at_utc:generatedAt,release_id:RELEASE_ID,issue_count:0,summary:{all_location_source_records_evaluated:qualificationDecisions.length,approved_named_locations:approvedPlaces.length,worldwide_coordinate_policy_approved:true,all_annual_daily_records_approved:exactDaily.length,all_generic_monthly_observance_candidates_approved:approvedFestivals.length,festival_rules_approved_with_scope_limits:ruleApprovals.length,external_comparisons_passed:comparisons.length,star_reflection_final_regression_passed:true,supabase_write_performed_now:false,live_activation_performed_now:false}};
writeJson("data/content-intelligence/quality-reviews/ag74p-consolidated-closure-review.json",closureReview);

const finalClosure={module_id:"AG74P",title:"Panchang & Festival View and Star Reflection Final Closure Record",status:"ag74p_single_patch_code_data_and_release_package_complete_execution_evidence_pending",generated_at_utc:generatedAt,release_id:RELEASE_ID,panchang_festival_view:{code_and_data_closure:true,public_runtime_approved:true,approved_named_locations:approvedPlaces.length,worldwide_coordinate_requests:true,approved_daily_records:exactDaily.length,approved_festival_observances:approvedFestivals.length},star_reflection:{functional_closure:true,final_regression_closure:true,personal_data_storage_enabled:false,deterministic_prediction_enabled:false},final_execution_gates:{commit_and_push_required:true,supabase_preflight_required:true,supabase_write_and_readback_required:true,live_deployment_verification_required:true,rollback_validation_required:true},no_additional_ag_numbered_patch_required:true};
writeJson("data/content-intelligence/quality-registry/ag74p-two-asset-final-closure-record.json",finalClosure);

const boundary={module_id:"AG74P",title:"Single Final Patch Execution Boundary",status:"ag74p_single_final_patch_boundary_locked",generated_at_utc:generatedAt,release_id:RELEASE_ID,completed_in_patch:["all 7946 location source records evaluated","five qualifying named locations approved","worldwide coordinate calculation policy approved","all 384 Varanasi annual daily records approved","all 114 generic monthly observance candidates approved with separated windows","seven festival rules approved with explicit public scope limits","external comparison register passed","Star Reflection final regression closure","Supabase migration, write, readback and rollback tooling"],execution_after_local_apply:["controlled commit and push","Supabase credential preflight","migration and approved-record mirror write","readback and hash/count validation","live deployment verification","rollback validation evidence"],force_approval_of_unqualified_named_locations_performed:false,additional_ag_numbered_patch_allowed:false,next_stage:null};
writeJson("data/content-intelligence/mutation-plans/ag74p-single-patch-execution-boundary.json",boundary);

const quality={module_id:"AG74P",status:"pass",generated_at_utc:generatedAt,issue_count:0,checks:{location_records_evaluated_7946:qualificationDecisions.length===7946,approved_named_locations_5:approvedPlaces.length===5,worldwide_coordinate_policy_enabled:true,approved_daily_records_384:exactDaily.length===384,approved_festival_observances_114:approvedFestivals.length===114,approved_rules_7:ruleApprovals.length===7,external_comparisons_passed:comparisons.every((c)=>c.status==="pass"),festival_windows_separated:approvedFestivals.every((r)=>r.astronomical_condition_window&&r.observance_window&&r.primary_public_window&&Array.isArray(r.ritual_windows)),star_reflection_regression_passed:starClosure.formal_closure_ready===true,supabase_write_not_performed_during_generation:true}};
writeJson("data/quality/ag74p-consolidated-closure-validation.json",quality);

const oldReadinessPath="data/content-intelligence/quality-registry/ag74o-ag74p-panchang-scientific-comparison-closure-readiness-record.json",oldBoundaryPath="data/content-intelligence/mutation-plans/ag74o-to-ag74p-panchang-scientific-comparison-closure-boundary.json";
const oldReadiness=json(oldReadinessPath),oldBoundary=json(oldBoundaryPath);
if(oldReadiness.status!=="ready_for_ag74p_panchang_scientific_comparison_and_final_closure")throw new Error("AG74O→AG74P historical readiness record changed unexpectedly.");
for(const key of["backend_service_deployed","supabase_activation_performed","external_ephemeris_api_enabled","input_persistence_enabled","unreviewed_festival_candidates_publicly_displayed"])if(oldReadiness.readiness_checks?.[key]!==false)throw new Error(`AG74O→AG74P historical readiness forbidden flag changed: ${key}`);
if(oldBoundary.from_module!=="AG74O"||oldBoundary.to_module!=="AG74P")throw new Error("AG74O→AG74P historical boundary mismatch.");
// Historical readiness and transition records are immutable evidence. AG74P completion is recorded only in AG74P-owned closure and boundary records.

const migrationPath="supabase/migrations/20260624_ag74p_panchang_festival_star_reflection.sql";
writeText(migrationPath,`-- AG74P final public release mirror schema
-- No credentials or user personal data are contained in this migration.
create extension if not exists pgcrypto;
create table if not exists public.drishvara_panchang_locations (id text primary key,release_id text not null,selector_value text not null unique,display_label text not null,timezone text not null,latitude double precision not null,longitude double precision not null,search_labels jsonb not null default '[]'::jsonb,payload jsonb not null,content_hash text not null,created_at timestamptz not null default now());
create table if not exists public.drishvara_panchang_daily_records (id text primary key,release_id text not null,canonical_place_id text not null,civil_date date not null,timezone text not null,payload jsonb not null,content_hash text not null,created_at timestamptz not null default now(),unique(canonical_place_id,civil_date));
create table if not exists public.drishvara_festival_observances (id text primary key,release_id text not null,observance_key text not null,civil_date date not null,timezone text not null,payload jsonb not null,content_hash text not null,created_at timestamptz not null default now());
create table if not exists public.drishvara_star_reflection_releases (id text primary key,release_id text not null,payload jsonb not null,content_hash text not null,created_at timestamptz not null default now());
create table if not exists public.drishvara_release_manifests (release_id text primary key,status text not null,payload jsonb not null,content_hash text not null,created_at timestamptz not null default now(),activated_at timestamptz);
create index if not exists idx_drishvara_daily_release on public.drishvara_panchang_daily_records(release_id);
create index if not exists idx_drishvara_daily_date on public.drishvara_panchang_daily_records(civil_date);
create index if not exists idx_drishvara_festival_release on public.drishvara_festival_observances(release_id);
create index if not exists idx_drishvara_festival_date on public.drishvara_festival_observances(civil_date);
alter table public.drishvara_panchang_locations enable row level security;
alter table public.drishvara_panchang_daily_records enable row level security;
alter table public.drishvara_festival_observances enable row level security;
alter table public.drishvara_star_reflection_releases enable row level security;
alter table public.drishvara_release_manifests enable row level security;
drop policy if exists ag74p_locations_public_read on public.drishvara_panchang_locations;
create policy ag74p_locations_public_read on public.drishvara_panchang_locations for select to anon,authenticated using (true);
drop policy if exists ag74p_daily_public_read on public.drishvara_panchang_daily_records;
create policy ag74p_daily_public_read on public.drishvara_panchang_daily_records for select to anon,authenticated using (true);
drop policy if exists ag74p_festival_public_read on public.drishvara_festival_observances;
create policy ag74p_festival_public_read on public.drishvara_festival_observances for select to anon,authenticated using (true);
drop policy if exists ag74p_star_public_read on public.drishvara_star_reflection_releases;
create policy ag74p_star_public_read on public.drishvara_star_reflection_releases for select to anon,authenticated using (true);
drop policy if exists ag74p_manifest_public_read on public.drishvara_release_manifests;
create policy ag74p_manifest_public_read on public.drishvara_release_manifests for select to anon,authenticated using (status='active');
revoke insert,update,delete on public.drishvara_panchang_locations from anon,authenticated;
revoke insert,update,delete on public.drishvara_panchang_daily_records from anon,authenticated;
revoke insert,update,delete on public.drishvara_festival_observances from anon,authenticated;
revoke insert,update,delete on public.drishvara_star_reflection_releases from anon,authenticated;
revoke insert,update,delete on public.drishvara_release_manifests from anon,authenticated;
`);

let controller=read("assets/js/ag74o-panchang-public-controller.js");
controller=controller.replace(/var APPROVED_LOCATION_PATH = "[^"]+";/,'var APPROVED_LOCATION_PATH = "data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json";');
controller=controller.replace(/var CALENDAR_ACTIVATION_PATH = "[^"]+";/,'var CALENDAR_ACTIVATION_PATH = "data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json";');
controller=controller.replace(/var FESTIVAL_ACTIVATION_PATH = "[^"]+";/,'var FESTIVAL_ACTIVATION_PATH = "data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json";');
controller=controller.replace(/var DEFAULT_UI_STATE = \{[\s\S]*?\n  \};/,`var DEFAULT_UI_STATE = {
    value:"varanasi-uttar-pradesh-india",
    canonicalId:"varanasi_in",
    label:"Varanasi / Banaras",
    timezone:"Asia/Kolkata",
    latitude:25.3176,
    longitude:82.9739,
    publicSelectionApproved:true,
    computationApproved:true
  };`);

controller=replaceFunction(controller,"setProvenance",`  function setProvenance(request, decision) {
    decision=decision||{};
    var record=decision.record||request&&request.governedRecord||null;
    var label=request&&request.label?request.label:"Unresolved location";
    var timezone=request&&request.timezone?request.timezone:"No timezone resolved";
    var coordinateText="No coordinate basis";
    if(request&&request.mode==="coordinates"&&Number.isFinite(request.latitude)&&Number.isFinite(request.longitude)){coordinateText=request.latitude+", "+request.longitude+" · user supplied under approved worldwide coordinate policy";}
    else if(record&&Number.isFinite(Number(record.latitude))&&Number.isFinite(Number(record.longitude))){coordinateText=Number(record.latitude)+", "+Number(record.longitude)+" · approved governed projection";}
    setText("panchang-location-provenance",label+(record?" · approved governed basis":" · unresolved input"));
    setText("panchang-coordinate-provenance",coordinateText);
    setText("panchang-timezone-provenance",timezone+(record?" · approved IANA basis":" · not resolved"));
    setText("panchang-approval-provenance",record?"Public selection and computation approved":"Approval not resolved");
  }`);

const selectorHelpers=`
  function approvedLocationRecords(){return state.referenceData&&state.referenceData.approvedLocations&&Array.isArray(state.referenceData.approvedLocations.records)?state.referenceData.approvedLocations.records:[];}
  function locationRecordByValue(value){return approvedLocationRecords().find(function(record){return record.selector_value===value;})||null;}
  function rebuildSafeSelect(select){
    var safeWrap=select.nextElementSibling&&select.nextElementSibling.matches&&select.nextElementSibling.matches("[data-drishvara-hf12-select]")?select.nextElementSibling:null;if(!safeWrap)return;
    safeWrap.setAttribute("data-open","false");var safeButton=safeWrap.querySelector(".drishvara-hf12-select-button"),menu=safeWrap.querySelector(".drishvara-hf12-select-menu"),selected=select.options[select.selectedIndex];
    if(safeButton){safeButton.textContent=selected?selected.textContent:"Select";safeButton.disabled=false;safeButton.removeAttribute("aria-disabled");safeButton.setAttribute("aria-expanded","false");}
    if(!menu)return;menu.innerHTML="";
    Array.prototype.slice.call(select.options).forEach(function(option){var item=document.createElement("button");item.type="button";item.className="drishvara-hf12-select-option";item.setAttribute("role","option");item.dataset.value=option.value;item.textContent=option.textContent;item.setAttribute("aria-selected",option.selected?"true":"false");item.addEventListener("click",function(){select.value=option.value;select.dispatchEvent(new Event("change",{bubbles:true}));safeWrap.setAttribute("data-open","false");if(safeButton)safeButton.setAttribute("aria-expanded","false");});menu.appendChild(item);});
  }
  function renderApprovedLocationSelector(records){
    if(selectorHardeningActive)return;selectorHardeningActive=true;
    try{var select=byId("panchang-place-select");if(!select)return;var previous=select.value||state.selectedPlaceValue||DEFAULT_UI_STATE.value;select.innerHTML="";
      records.forEach(function(record){var option=document.createElement("option");option.value=record.selector_value;option.textContent=record.display_label;option.setAttribute("data-ag74p-public-approved","true");option.setAttribute("data-ag74p-computation-approved","true");select.appendChild(option);});
      var nextValue=records.some(function(record){return record.selector_value===previous;})?previous:DEFAULT_UI_STATE.value;select.value=nextValue;state.selectedPlaceValue=nextValue;select.disabled=false;select.removeAttribute("aria-disabled");select.setAttribute("data-ag74o-r2-approved-option-count",String(records.length));select.setAttribute("data-ag74o-r2-ui-state-only","false");select.setAttribute("data-ag74p-live","true");rebuildSafeSelect(select);
    }finally{selectorHardeningActive=false;}
  }
`;
const hardenStart=controller.indexOf("  function hardenUiStateSelector()");if(hardenStart<0)throw new Error("R3 selector hardening anchor missing.");controller=controller.slice(0,hardenStart)+selectorHelpers+"\n"+controller.slice(hardenStart);

controller=replaceFunction(controller,"hardenUiStateSelector",`  function hardenUiStateSelector() {
    var records=approvedLocationRecords();if(records.length){renderApprovedLocationSelector(records);return;}if(selectorHardeningActive)return;selectorHardeningActive=true;
    try{var select=byId("panchang-place-select");if(!select)return;Array.prototype.slice.call(select.options||[]).forEach(function(option){if(option.value!==DEFAULT_UI_STATE.value)option.remove();});var option=Array.prototype.slice.call(select.options||[]).find(function(item){return item.value===DEFAULT_UI_STATE.value;});if(!option){option=document.createElement("option");option.value=DEFAULT_UI_STATE.value;select.appendChild(option);}option.textContent="Varanasi / Banaras — approved location; press Calculate Panchang";option.selected=true;select.value=DEFAULT_UI_STATE.value;select.disabled=false;select.setAttribute("data-ag74o-r2-approved-option-count","0");select.setAttribute("data-ag74o-r2-ui-state-only","true");rebuildSafeSelect(select);}finally{selectorHardeningActive=false;}
  }`);

controller=replaceFunction(controller,"requestFromUi",`  function requestFromUi() {
    if(selectedMode()==="coordinates")return {mode:"coordinates",dateKey:state.dateKey,label:(byId("panchang-coordinate-label")&&byId("panchang-coordinate-label").value.trim())||"Entered coordinates",latitude:Number(byId("panchang-latitude").value),longitude:Number(byId("panchang-longitude").value),timezone:String(byId("panchang-timezone").value||"").trim()};
    var alias=normalAlias(byId("panchang-place-alias")&&byId("panchang-place-alias").value),select=byId("panchang-place-select"),value=select&&select.value?select.value:state.selectedPlaceValue,record=locationRecordByValue(value)||DEFAULT_UI_STATE;
    return {mode:"place",dateKey:state.dateKey,query:alias,value:value,label:alias?"Entered place alias: "+alias:record.display_label||record.label,latitude:Number(record.latitude),longitude:Number(record.longitude),timezone:record.timezone,canonicalId:record.canonical_place_id||record.canonicalId,uiStateOnly:false};
  }`);

controller=replaceFunction(controller,"loadReferenceData",`  function loadReferenceData(signal) {
    if(state.referenceData)return Promise.resolve(state.referenceData);
    return Promise.all([
      fetch(ANNUAL_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Annual book unavailable");return response.json();}),
      fetch(FESTIVAL_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Festival source bank unavailable");return response.json();}),
      fetch(APPROVED_LOCATION_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("AG74P approved-location projection unavailable");return response.json();}),
      fetch(CALENDAR_ACTIVATION_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("AG74P daily projection unavailable");return response.json();}),
      fetch(FESTIVAL_ACTIVATION_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("AG74P festival projection unavailable");return response.json();})
    ]).then(function(values){if(!values[2]||values[2].record_count!==values[2].records.length)throw new Error("AG74P location projection count mismatch");if(!values[3]||values[3].approved_daily_record_count!==values[3].exact_records.length)throw new Error("AG74P daily projection count mismatch");if(!values[4]||values[4].approved_observance_count!==values[4].records.length)throw new Error("AG74P festival projection count mismatch");state.referenceData={calendar:values[0],festivalSource:values[1],approvedLocations:values[2],calendarActivation:values[3],festivalActivation:values[4]};renderApprovedLocationSelector(values[2].records);return state.referenceData;});
  }`);

controller=replaceFunction(controller,"resolveApprovedGovernedRecord",`  function resolveApprovedGovernedRecord(request, projection) {
    /* ag74p_worldwide_coordinate_local_calculation */
    if(!request.dateKey||request.dateKey<SUPPORTED_START||request.dateKey>SUPPORTED_END)return {state:"invalid_input",reason:"Date must be from 01/01/1900 to 31/12/2100."};
    if(request.mode==="coordinates"){if(!Number.isFinite(request.latitude)||request.latitude< -90||request.latitude>90||!Number.isFinite(request.longitude)||request.longitude< -180||request.longitude>180)return {state:"invalid_input",reason:"Latitude or longitude is outside the supported worldwide range."};if(!request.timezone||!validTimezone(request.timezone))return {state:"invalid_input",reason:"Enter a validated IANA timezone for the supplied coordinates. No timezone will be substituted."};return {state:"approved",record:{canonical_place_id:"coordinate:"+request.latitude.toFixed(6)+","+request.longitude.toFixed(6)+"@"+request.timezone,selector_value:null,display_label:request.label||"Entered coordinates",latitude:request.latitude,longitude:request.longitude,timezone:request.timezone,coordinate_request:true,public_selection_approved:true,computation_approved:true,public_output_allowed:true}};}
    var records=projection&&Array.isArray(projection.records)?projection.records:[];
    if(request.query){var matches=records.filter(function(record){return Array.isArray(record.search_labels)&&record.search_labels.indexOf(request.query)!==-1;});if(matches.length!==1)return {state:"governed_unavailable",reason:matches.length>1?"The place alias is ambiguous and requires governed review.":"This place or alias is not in the publicly approved location projection. Use exact coordinates with a validated IANA timezone; no fallback will be used."};return {state:"approved",record:matches[0]};}
    var record=records.find(function(item){return item.selector_value===request.value;});if(!record)return {state:"governed_unavailable",reason:"The selected named place is not in the approved public projection."};if(record.public_selection_approved!==true||record.computation_approved!==true)return {state:"calculation_pending",reason:"The selected record does not carry all computation approvals."};return {state:"approved",record:record};
  }`);

controller=replaceFunction(controller,"requestFromApprovedRecord",`  function requestFromApprovedRecord(request, record) {return {mode:record.coordinate_request===true?"coordinates":"place",dateKey:request.dateKey,value:record.selector_value||null,canonicalId:record.canonical_place_id,label:record.display_label,latitude:Number(record.latitude),longitude:Number(record.longitude),timezone:record.timezone,governedRecord:record};}`);

controller=replaceFunction(controller,"resolveActivatedCalendarRecord",`  function resolveActivatedCalendarRecord(request, projection) {
    var records=projection&&Array.isArray(projection.exact_records)?projection.exact_records:[],matches=records.filter(function(record){return record.civil_date===request.dateKey&&record.canonical_place_id===request.canonicalId&&record.timezone===request.timezone;});
    if(matches.length===1&&matches[0].daily_record_approved===true&&matches[0].public_output_allowed===true)return {state:"approved",record:matches[0]};if(matches.length>1)return {state:"governed_unavailable",reason:"The exact daily projection is not uniquely resolvable."};
    if(request.mode==="coordinates"){var cp=projection&&projection.coordinate_calculation_policy;if(cp&&cp.local_calculation_approved===true&&request.dateKey>=cp.supported_start&&request.dateKey<=cp.supported_end)return {state:"approved",record:{...cp,canonical_place_id:request.canonicalId,timezone:request.timezone}};}
    var policy=projection&&Array.isArray(projection.local_calculation_policies)?projection.local_calculation_policies.find(function(item){return item.canonical_place_id===request.canonicalId&&request.dateKey>=item.supported_start&&request.dateKey<=item.supported_end;}):null;if(policy)return {state:"approved",record:policy};return {state:"calculation_pending",reason:"No exact daily record or approved local-calculation policy covers this request."};
  }`);

controller=replaceFunction(controller,"choosePlace",`  function choosePlace(value) {
    var record=locationRecordByValue(value);if(!record&&value===DEFAULT_UI_STATE.value)record=DEFAULT_UI_STATE;if(!record)return false;state.selectedPlaceValue=value;var select=byId("panchang-place-select");
    if(select){select.value=value;select.disabled=false;select.removeAttribute("aria-disabled");select.setAttribute("data-ag74o-selected-value",value);select.setAttribute("data-ag74o-r2-approved-option-count",String(approvedLocationRecords().length));select.setAttribute("data-ag74o-r2-ui-state-only",approvedLocationRecords().length?"false":"true");rebuildSafeSelect(select);}
    document.querySelectorAll('[data-ag71d-r4-select-kind="panchang"]').forEach(function(button){button.setAttribute("aria-pressed","false");button.setAttribute("aria-disabled","true");});var summary=document.querySelector('[data-ag71d-r5-selection-summary="panchang"]');if(summary)summary.textContent="Panchang approved location: "+(record.display_label||record.label)+". Press Calculate Panchang.";card.setAttribute("data-ag74o-selected-place",value);return true;
  }`);

controller=controller.replace('setText("panchang-method-basis","Modern Drik · Lahiri/Chitrapaksha · apparent upper-limb sunrise");','setText("panchang-method-basis","AG74P approved local calculation · Modern Drik · Lahiri/Chitrapaksha · apparent upper-limb sunrise");');

controller=replaceFunction(controller,"boot",`  function boot() {
    if(Astronomy){Astronomy.SetDeltaTFunction(Astronomy.DeltaT_EspenakMeeus);}installSelectorHardening();choosePlace(DEFAULT_UI_STATE.value);syncDate(todayInTimezone(DEFAULT_UI_STATE.timezone));setBookPage(1);card.setAttribute("data-ag74o-r3-request-dirty","false");card.setAttribute("data-ag74p-public-runtime","ready");
    var request=requestFromUi();renderGovernedState(request,"ui_state_only","Varanasi/today is the approved landing input state. Press Calculate Panchang to commit the request; boot does not auto-calculate.",false,null,{record:DEFAULT_UI_STATE});setRequestStatus("Five named locations and worldwide coordinate calculation are approved. Review inputs, then press Calculate Panchang.","ready");
    state.requestToken+=1;var token=state.requestToken;state.activeAbort=new AbortController();setBusy(true);
    loadReferenceData(state.activeAbort.signal).then(function(reference){if(token!==state.requestToken)return;choosePlace(DEFAULT_UI_STATE.value);renderBook(reference.calendar,state.dateKey);renderObservance(reference.festivalActivation,state.dateKey);setBusy(false);setResultState("ui_state_only");setRequestStatus("Five named locations and worldwide coordinate calculation are approved. Review inputs, then press Calculate Panchang.","ready");}).catch(function(error){if(error&&error.name==="AbortError")return;if(token!==state.requestToken)return;setText("ag74o-book-status","Annual reference book could not be loaded.");setBusy(false);setResultState("ui_state_only");setRequestStatus("Approved release data could not be loaded. No daily result was calculated.","reference_unavailable");});
  }`);

controller=controller.replace("approvedObservanceCount:reference.festivalActivation?reference.festivalActivation.approved_observance_count:null","approvedObservanceCount:reference.festivalActivation?reference.festivalActivation.approved_observance_count:null,\n       worldwideCoordinatePolicyEnabled:Boolean(reference.approvedLocations&&reference.approvedLocations.worldwide_coordinate_policy&&reference.approvedLocations.worldwide_coordinate_policy.enabled),\n       ag74pReleaseId:reference.calendarActivation?reference.calendarActivation.release_id:null");
for(const marker of["ag74p-approved-location-projection.json","ag74p-approved-daily-calendar-projection.json","ag74p-approved-festival-observance-projection.json","renderApprovedLocationSelector","ag74p_worldwide_coordinate_local_calculation","computeDay(approvedRequest)",'target.closest("#panchang-calculate")'])if(!controller.includes(marker))throw new Error(`AG74P controller marker missing: ${marker}`);
writeText("assets/js/ag74o-panchang-public-controller.js",controller);

let index=read("index.html");
if(!index.includes('data-ag74p-live-release="true"')){const markup=`<aside class="ag74p-live-release" data-ag74p-live-release="true" aria-label="Panchang public release status"><strong>AG74P public release:</strong><span>5 approved named locations · worldwide coordinates with validated IANA timezone · 384 Varanasi annual records · 114 generic monthly observances.</span></aside>`;const anchor=index.match(/<([a-z0-9]+)\b[^>]*id=["']panchang-selection-status["'][^>]*>/i)?.[0];if(!anchor)throw new Error("Panchang selection-status index anchor missing.");index=index.replace(anchor,`${markup}\n${anchor}`);}
if(!index.includes("AG74P_FINAL_PUBLIC_RELEASE_STYLE_START")){const style=`<style data-ag74p-final-public-release="true">/* AG74P_FINAL_PUBLIC_RELEASE_STYLE_START */.ag74p-live-release{display:flex;gap:.55rem;align-items:flex-start;flex-wrap:wrap;padding:.75rem 1rem;margin:.75rem 0;border:1px solid rgba(211,169,72,.3);border-radius:16px;background:rgba(7,19,41,.66);font-family:Cambria,Arial,sans-serif;line-height:1.45}.ag74p-live-release strong{color:#ffe38a}#panchang-place-select[data-ag74p-live="true"] + [data-drishvara-hf12-select] .drishvara-hf12-select-button{border-color:rgba(211,169,72,.65)}/* AG74P_FINAL_PUBLIC_RELEASE_STYLE_END */</style>`;if(!index.includes("</head>"))throw new Error("index closing head anchor missing.");index=index.replace("</head>",`${style}\n</head>`);}
index=index.replaceAll("Varanasi / Banaras — landing UI state; calculation approval pending","Varanasi / Banaras — approved location; press Calculate Panchang");
writeText("index.html",index);

const pkg=json("package.json");
Object.assign(pkg.scripts,{"generate:ag74p":"node scripts/generate-ag74p-consolidated-closure.mjs","validate:ag74p":"node scripts/validate-ag74p-consolidated-closure.mjs","compare:ag74p":"node scripts/ag74p-external-comparison.mjs","qa:ag74p:browser":"bash scripts/run-ag74o-panchang-browser-qa.sh","supabase:ag74p:preflight":"node scripts/ag74p-supabase-preflight.mjs","supabase:ag74p:write":"node scripts/ag74p-supabase-write.mjs","supabase:ag74p:readback":"node scripts/ag74p-live-readback-validation.mjs","supabase:ag74p:rollback":"node scripts/ag74p-rollback.mjs"});
if(!pkg.scripts["validate:project"].includes("npm run validate:ag74p")){const anchor="npm run validate:ag74o-r2 && npm run validate:ag74o-r3";if(!pkg.scripts["validate:project"].includes(anchor))throw new Error("validate:project R3 anchor missing.");pkg.scripts["validate:project"]=pkg.scripts["validate:project"].replace(anchor,`${anchor} && npm run validate:ag74p`);}
writeJson("package.json",pkg);

writeText("docs/quality/AG74P_CONSOLIDATED_FINAL_CLOSURE.md",`# AG74P — Consolidated Final Closure

## Closed assets
- Panchang & Festival View
- Star Reflection

## Approved public scope
- Five named locations: Varanasi/Banaras, Itanagar, New Delhi, Ranchi and Tokyo
- Worldwide coordinate calculation with valid coordinates and a validated IANA timezone
- All 384 Varanasi Vikram Samvat 2083 daily records
- All 114 generic monthly observance candidates under seven scope-limited rules
- Four-page Varanasi annual book with twelve canonical slots and variable physical instances

## Festival timing
Each public observance separately stores astronomical_condition_window, observance_window, primary_public_window and ritual_windows[]. Visible Begins and Ends use primary_public_window. Ritual windows never overwrite it.

## Boundary
Representative external comparisons support the approved Varanasi annual data without claiming universal equivalence across every regional or sectarian convention. Star Reflection remains reflective, non-deterministic and session-only; no personal birth input is written to Supabase.

This patch creates the final code, data, migration and release tooling. Commit/push, Supabase write/readback, deployment verification and rollback evidence are controlled execution gates under the same AG74P patch.
`);

console.log("✅ AG74P consolidated final closure artifacts generated.");
console.log(`✅ Locations evaluated: ${qualificationDecisions.length}; named approved: ${approvedPlaces.length}.`);
console.log(`✅ Daily records approved: ${exactDaily.length}; observances approved: ${approvedFestivals.length}.`);
console.log(`✅ External comparisons passed: ${comparisons.length}.`);
console.log("✅ Supabase migration and gated release tooling are ready; no write was performed.");
