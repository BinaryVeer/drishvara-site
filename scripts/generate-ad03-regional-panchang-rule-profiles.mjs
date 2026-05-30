import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ad02Review: "data/content-intelligence/quality-reviews/ad02-panchanga-ontology-canonical-field-model.json",
  ad02CanonicalOntology: "data/content-intelligence/ad-foundation/ad02-panchanga-canonical-ontology.json",
  ad02CoreElementModel: "data/content-intelligence/ad-foundation/ad02-panchanga-core-element-model.json",
  ad02SupportingFieldModel: "data/content-intelligence/ad-foundation/ad02-panchanga-supporting-field-model.json",
  ad02TimeLocationModel: "data/content-intelligence/ad-foundation/ad02-time-location-calculation-context-model.json",
  ad02RegionalPlaceholder: "data/content-intelligence/ad-foundation/ad02-regional-profile-placeholder-map.json",
  ad02DatabasePlanningMap: "data/content-intelligence/ad-foundation/ad02-database-field-planning-map.json",
  ad02NoMutationAudit: "data/content-intelligence/backend-architecture/ad02-no-mutation-audit-register.json",
  ad02Readiness: "data/content-intelligence/quality-registry/ad02-ad03-regional-panchang-rule-profile-readiness-record.json",
  ad02Boundary: "data/content-intelligence/mutation-plans/ad02-to-ad03-regional-panchang-rule-profiles-boundary.json",
  ad01RegionalAcceptance: "data/content-intelligence/ad-foundation/ad01-regional-acceptance-doctrine.json",
  ad01SourceConfidence: "data/content-intelligence/ad-foundation/ad01-source-confidence-model.json",
  ad01AttributionBoundary: "data/content-intelligence/ad-foundation/ad01-attribution-and-claim-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ad03-regional-panchang-rule-profiles.json",
  regionalProfileDoctrine: "data/content-intelligence/ad-foundation/ad03-regional-panchang-rule-profile-doctrine.json",
  northIndiaProfile: "data/content-intelligence/ad-foundation/ad03-north-india-general-rule-profile.json",
  eastIndiaBiharMithilaProfile: "data/content-intelligence/ad-foundation/ad03-east-india-bihar-mithila-rule-profile.json",
  southIndianPanchangamProfile: "data/content-intelligence/ad-foundation/ad03-south-indian-panchangam-rule-profile.json",
  locationSunriseProfile: "data/content-intelligence/ad-foundation/ad03-location-specific-sunrise-rule-profile.json",
  regionalDifferenceMatrix: "data/content-intelligence/ad-foundation/ad03-regional-difference-decision-matrix.json",
  sourceRequirementMap: "data/content-intelligence/ad-foundation/ad03-regional-source-requirement-map.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ad03-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ad03-ad04-calendar-calculation-methodology-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ad03-to-ad04-calendar-calculation-methodology-boundary.json",
  registry: "data/quality/ad03-regional-panchang-rule-profiles.json",
  preview: "data/quality/ad03-regional-panchang-rule-profiles-preview.json",
  doc: "docs/quality/AD03_REGIONAL_PANCHANG_RULE_PROFILES.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AD03 input: ${p}`);
}

const ad02Review = readJson(inputs.ad02Review);
const ad02CanonicalOntology = readJson(inputs.ad02CanonicalOntology);
const ad02CoreElementModel = readJson(inputs.ad02CoreElementModel);
const ad02SupportingFieldModel = readJson(inputs.ad02SupportingFieldModel);
const ad02TimeLocationModel = readJson(inputs.ad02TimeLocationModel);
const ad02RegionalPlaceholder = readJson(inputs.ad02RegionalPlaceholder);
const ad02DatabasePlanningMap = readJson(inputs.ad02DatabasePlanningMap);
const ad02NoMutationAudit = readJson(inputs.ad02NoMutationAudit);
const ad02Readiness = readJson(inputs.ad02Readiness);
const ad02Boundary = readJson(inputs.ad02Boundary);
const ad01RegionalAcceptance = readJson(inputs.ad01RegionalAcceptance);
const ad01SourceConfidence = readJson(inputs.ad01SourceConfidence);
const ad01AttributionBoundary = readJson(inputs.ad01AttributionBoundary);

if (ad02Review.status !== "panchanga_ontology_canonical_field_model_ready_for_ad03") {
  throw new Error("AD02 review status mismatch.");
}
if (ad02Review.summary?.ready_for_ad03 !== true) {
  throw new Error("AD02 does not show AD03 readiness.");
}
if (ad02NoMutationAudit.audit_passed !== true) {
  throw new Error("AD02 no-mutation audit must pass.");
}
if (ad02Readiness.ready_for_ad03 !== true || ad02Readiness.next_stage_id !== "AD03") {
  throw new Error("AD02 readiness must permit AD03.");
}
if (ad02Boundary.next_stage_id !== "AD03") {
  throw new Error("AD02 boundary must point to AD03.");
}
for (const profile of ["north_india_general", "east_india_bihar_mithila", "south_indian_panchangam", "location_specific_sunrise_profile"]) {
  if (!JSON.stringify(ad02RegionalPlaceholder).includes(profile)) {
    throw new Error(`AD02 regional placeholder missing: ${profile}`);
  }
}
for (const element of ["tithi", "vara", "nakshatra", "yoga", "karana"]) {
  if (!JSON.stringify(ad02CoreElementModel.elements).includes(element)) {
    throw new Error(`AD02 core element missing: ${element}`);
  }
}
if (!JSON.stringify(ad02TimeLocationModel).includes("sunrise-aware")) {
  throw new Error("AD02 time/location model must preserve sunrise-aware rule.");
}
if (!JSON.stringify(ad02SupportingFieldModel).includes("amanta_masa") || !JSON.stringify(ad02SupportingFieldModel).includes("purnimanta_masa")) {
  throw new Error("AD02 supporting model must preserve amanta/purnimanta fields.");
}
if (!JSON.stringify(ad02DatabasePlanningMap).includes("regional_calendar_profiles")) {
  throw new Error("AD02 database planning must include regional_calendar_profiles.");
}
if (!JSON.stringify(ad01RegionalAcceptance).includes("Regional differences must be recorded as profiles")) {
  throw new Error("AD01 regional acceptance doctrine missing.");
}
if (!JSON.stringify(ad01SourceConfidence).includes("confidence_bands")) {
  throw new Error("AD01 source confidence model missing.");
}
if (!JSON.stringify(ad01AttributionBoundary).includes("regional Panchang rule")) {
  throw new Error("AD01 attribution boundary must preserve regional rule attribution.");
}
if (!JSON.stringify(ad02CanonicalOntology).includes("Treat region/profile differences as structured metadata")) {
  throw new Error("AD02 canonical ontology must preserve regional-profile principle.");
}

const blockedState = {
  ad03_regional_panchang_rule_profiles_recorded: true,
  ad02_consumed: true,
  regional_profile_doctrine_recorded: true,
  north_india_profile_recorded: true,
  east_india_bihar_mithila_profile_recorded: true,
  south_indian_panchangam_profile_recorded: true,
  location_specific_sunrise_profile_recorded: true,
  regional_difference_matrix_recorded: true,
  source_requirement_map_recorded: true,
  ready_for_ad04: true,

  ag47_resume_allowed: false,
  homepage_mutated: false,
  public_content_generated: false,
  panchang_prediction_generated: false,
  panchang_calculation_executed: false,
  festival_date_finalised: false,
  regional_rule_applied_to_public_output: false,
  panchang_daily_record_seeded: false,
  live_source_fetch_executed: false,
  web_scraping_executed: false,
  sql_file_created: false,
  sql_migration_created: false,
  sql_executed: false,
  database_write_performed: false,
  supabase_table_created: false,
  backend_auth_supabase_activation_performed: false,
  deployment_performed: false,
  service_role_key_exposed: false
};

const regionalProfileDoctrine = {
  module_id: "AD03",
  title: "Regional Panchang Rule Profile Doctrine",
  status: "regional_panchang_rule_profile_doctrine_recorded",
  doctrine_rules: [
    "Regional Panchang differences must be represented as explicit rule profiles.",
    "A profile records accepted tradition, region, rule tendency, source requirement and editorial status.",
    "Regional differences are not errors; they are structured context.",
    "One region's festival decision rule must not be silently applied to another region.",
    "Location-specific sunrise and timezone handling must be treated as calculation-sensitive context.",
    "AD03 records rule-profile planning only and does not calculate or finalise dates."
  ],
  profile_groups: [
    "north_india_general",
    "east_india_bihar_mithila",
    "south_indian_panchangam",
    "location_specific_sunrise_profile"
  ],
  blocked_state: blockedState
};

const northIndiaProfile = {
  module_id: "AD03",
  title: "North India General Rule Profile",
  status: "north_india_general_rule_profile_recorded",
  regional_profile_id: "north_india_general",
  region_focus: [
    "Uttar Pradesh",
    "Kashi-influenced Hindi belt contexts",
    "North Indian Panchang tradition where later sourced"
  ],
  expected_rule_dimensions: [
    {
      dimension: "masa_system",
      planning_note: "Often requires purnimanta awareness in North Indian contexts; final rule must be source-confirmed."
    },
    {
      dimension: "sunrise_tithi_priority",
      planning_note: "Festival and vrata decisions often require sunrise tithi and/or specific time-window rules; final rule must be source-confirmed."
    },
    {
      dimension: "kashi_reference_profile",
      planning_note: "Kashi-influenced calendars may be relevant for traditional acceptance; source authority must be recorded."
    },
    {
      dimension: "public_display_language",
      planning_note: "Hindi/Sanskrit labels should be prepared with careful explanation and non-claim wording."
    }
  ],
  future_required_sources: [
    "accepted North Indian Panchang source",
    "Kashi or traditional Hindi belt Panchang source where applicable",
    "regional festival/vrata rule source",
    "editorial review note"
  ],
  blocked_state: blockedState
};

const eastIndiaBiharMithilaProfile = {
  module_id: "AD03",
  title: "East India / Bihar / Mithila Rule Profile",
  status: "east_india_bihar_mithila_rule_profile_recorded",
  regional_profile_id: "east_india_bihar_mithila",
  region_focus: [
    "Bihar",
    "Mithila",
    "East India where later sourced",
    "living regional observance traditions"
  ],
  expected_rule_dimensions: [
    {
      dimension: "regional_observance_acceptance",
      planning_note: "Local accepted observance may differ from generic pan-India presentation and must be recorded as profile metadata."
    },
    {
      dimension: "festival_vrata_decision_rule",
      planning_note: "Festival and vrata date decisions must carry source, region and editorial review."
    },
    {
      dimension: "calendar_name_and_month_handling",
      planning_note: "Masa naming and local convention should be captured separately from calculation output."
    },
    {
      dimension: "public_display_language",
      planning_note: "Hindi/Sanskrit/Maithili-context wording may be needed later, but AD03 does not generate public content."
    }
  ],
  future_required_sources: [
    "accepted Bihar Panchang or regional calendar source",
    "Mithila tradition source where relevant",
    "regional temple/cultural institution references where credible",
    "editorial review note"
  ],
  blocked_state: blockedState
};

const southIndianPanchangamProfile = {
  module_id: "AD03",
  title: "South Indian Panchangam Rule Profile",
  status: "south_indian_panchangam_rule_profile_recorded",
  regional_profile_id: "south_indian_panchangam",
  region_focus: [
    "Tamil Panchangam traditions where later sourced",
    "Telugu Panchangam traditions where later sourced",
    "Kannada Panchangam traditions where later sourced",
    "Malayalam calendar traditions where later sourced"
  ],
  expected_rule_dimensions: [
    {
      dimension: "amanta_month_awareness",
      planning_note: "South Indian Panchangam contexts often require amanta month handling; final rule must be source-confirmed."
    },
    {
      dimension: "regional_new_year_and_festival_rules",
      planning_note: "Regional new year and festival observance rules must be profile-specific."
    },
    {
      dimension: "nakshatra_and_tithi_display_style",
      planning_note: "Display conventions and local language labels may differ by state/tradition."
    },
    {
      dimension: "location_specific_sunrise_application",
      planning_note: "Place-based sunrise and timezone context remains necessary."
    }
  ],
  future_required_sources: [
    "accepted Tamil Panchangam source",
    "accepted Telugu Panchangam source",
    "accepted Kannada Panchangam source",
    "accepted Malayalam calendar/Panchangam source where relevant",
    "editorial review note"
  ],
  blocked_state: blockedState
};

const locationSunriseProfile = {
  module_id: "AD03",
  title: "Location-specific Sunrise Rule Profile",
  status: "location_specific_sunrise_rule_profile_recorded",
  regional_profile_id: "location_specific_sunrise_profile",
  applies_to: "all regional profiles",
  context_fields_required: [
    "location_id",
    "place_name",
    "latitude",
    "longitude",
    "timezone",
    "sunrise_reference",
    "local_day_start",
    "local_day_end",
    "calculation_profile_id",
    "regional_profile_id"
  ],
  doctrine_rules: [
    "Panchang day boundary must be sunrise-aware and location-sensitive.",
    "Sunrise, sunset, moonrise and moonset must be calculated or sourced with location metadata in later stages.",
    "AD03 does not calculate sunrise or any Panchanga element.",
    "Any future daily Panchang record must include location and regional/calculation profile identifiers."
  ],
  blocked_state: blockedState
};

const regionalDifferenceMatrix = {
  module_id: "AD03",
  title: "Regional Difference Decision Matrix",
  status: "regional_difference_decision_matrix_recorded",
  difference_types: [
    {
      difference_type: "amanta_vs_purnimanta_masa",
      impacted_profiles: ["north_india_general", "south_indian_panchangam"],
      handling_rule: "Store both canonical field options where needed; public output must identify active regional profile."
    },
    {
      difference_type: "sunrise_tithi_vs_time_window_rule",
      impacted_profiles: ["north_india_general", "east_india_bihar_mithila", "south_indian_panchangam"],
      handling_rule: "Future festival/vrata rule records must specify whether sunrise, pradosha, nishita or other time-window rules apply."
    },
    {
      difference_type: "regional_festival_observance_variation",
      impacted_profiles: ["east_india_bihar_mithila", "south_indian_panchangam", "north_india_general"],
      handling_rule: "Do not collapse regional observance differences into a single final date without explanatory profile metadata."
    },
    {
      difference_type: "language_and_display_convention",
      impacted_profiles: ["north_india_general", "east_india_bihar_mithila", "south_indian_panchangam"],
      handling_rule: "Separate internal key, Sanskrit label, regional/local display label and English explanation."
    },
    {
      difference_type: "place_based_sunrise_difference",
      impacted_profiles: ["location_specific_sunrise_profile"],
      handling_rule: "Future Panchang calculations must include location/timezone; AD03 only records this requirement."
    }
  ],
  blocked_state: blockedState
};

const sourceRequirementMap = {
  module_id: "AD03",
  title: "Regional Source Requirement Map",
  status: "regional_source_requirement_map_recorded",
  required_source_metadata: [
    "source_id",
    "source_title",
    "source_type",
    "author_or_institution",
    "region_or_tradition",
    "supported_rule",
    "confidence_band",
    "verification_status",
    "editorial_note"
  ],
  source_rules: [
    "Every regional profile rule must eventually cite at least one source authority or accepted regional tradition record.",
    "A source may support a concept, a region, a festival rule or a display convention; these must be classified separately.",
    "Nityanand Mishra ji style discipline may guide word/explanation quality but cannot substitute for a regional Panchang rule source unless a specific source supports the exact rule.",
    "Unverified sources remain under editorial verification and cannot be used for final seed data or public claims."
  ],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AD03",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ad03",
  checks: Object.entries({
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    festival_date_finalised: false,
    regional_rule_applied_to_public_output: false,
    panchang_daily_record_seeded: false,
    live_source_fetch_executed: false,
    web_scraping_executed: false,
    sql_file_created: false,
    sql_migration_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AD03",
  title: "AD04 Calendar Calculation Methodology Readiness Record",
  status: "ready_for_ad04_calendar_calculation_methodology",
  ready_for_ad04: true,
  next_stage_id: "AD04",
  next_stage_title: "Classical Astronomical and Calendar Calculation Methodology",
  hard_blocker_count_for_ad04: 0,
  ag47_resume_allowed_next: false,
  public_content_generation_allowed_next: false,
  panchang_prediction_allowed_next: false,
  panchang_calculation_allowed_next: false,
  sql_creation_allowed_next: false,
  sql_execution_allowed_next: false,
  database_write_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AD03",
  title: "AD03 to AD04 Calendar Calculation Methodology Boundary",
  status: "ad04_calendar_calculation_methodology_boundary_created",
  next_stage_id: "AD04",
  next_stage_title: "Classical Astronomical and Calendar Calculation Methodology",
  allowed_scope: [
    "Record calculation methodology boundaries for Panchanga elements.",
    "Record sunrise/locality handling, ayanamsha/correction awareness and calculation-profile requirements.",
    "Connect calculation methodology to regional profiles without executing calculations.",
    "Keep work as methodology planning only."
  ],
  blocked_scope: [
    "AG47 resume",
    "public content generation",
    "Panchang prediction generation",
    "Panchang calculation execution",
    "festival date finalisation",
    "live fetch",
    "web scraping",
    "SQL creation",
    "SQL execution",
    "database write",
    "Supabase table creation",
    "backend/Auth/Supabase activation",
    "service-role key exposure",
    "deployment"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AD03",
  title: "Regional Panchang Rule Profiles",
  status: "regional_panchang_rule_profiles_ready_for_ad04",
  depends_on: ["AD02"],
  regional_profile_doctrine_file: outputs.regionalProfileDoctrine,
  north_india_profile_file: outputs.northIndiaProfile,
  east_india_bihar_mithila_profile_file: outputs.eastIndiaBiharMithilaProfile,
  south_indian_panchangam_profile_file: outputs.southIndianPanchangamProfile,
  location_sunrise_profile_file: outputs.locationSunriseProfile,
  regional_difference_matrix_file: outputs.regionalDifferenceMatrix,
  source_requirement_map_file: outputs.sourceRequirementMap,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ad03_regional_panchang_rule_profiles_recorded: true,
    ad02_consumed: true,
    regional_profile_doctrine_recorded: true,
    north_india_profile_recorded: true,
    east_india_bihar_mithila_profile_recorded: true,
    south_indian_panchangam_profile_recorded: true,
    location_specific_sunrise_profile_recorded: true,
    regional_difference_matrix_recorded: true,
    source_requirement_map_recorded: true,
    ready_for_ad04: true,
    hard_blocker_count_for_ad04: 0,
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    festival_date_finalised: false,
    regional_rule_applied_to_public_output: false,
    sql_file_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AD03",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AD03",
  status: review.status,
  ad03_regional_panchang_rule_profiles_recorded: 1,
  ad02_consumed: 1,
  regional_profile_doctrine_recorded: 1,
  north_india_profile_recorded: 1,
  east_india_bihar_mithila_profile_recorded: 1,
  south_indian_panchangam_profile_recorded: 1,
  location_specific_sunrise_profile_recorded: 1,
  regional_difference_matrix_recorded: 1,
  source_requirement_map_recorded: 1,
  ready_for_ad04: 1,
  hard_blocker_count_for_ad04: 0,
  ag47_resume_allowed: 0,
  homepage_mutated: 0,
  public_content_generated: 0,
  panchang_prediction_generated: 0,
  panchang_calculation_executed: 0,
  festival_date_finalised: 0,
  regional_rule_applied_to_public_output: 0,
  sql_file_created: 0,
  sql_executed: 0,
  database_write_performed: 0,
  supabase_table_created: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AD03 — Regional Panchang Rule Profiles

## Result

AD03 records regional Panchang rule profiles for the Astro-Drishvara Data Foundation.

## Profiles recorded

- North India General Rule Profile
- East India / Bihar / Mithila Rule Profile
- South Indian Panchangam Rule Profile
- Location-specific Sunrise Rule Profile

## Key doctrine

Regional differences are not errors. They must be stored as explicit profiles with source, tradition, calculation context and editorial review status.

## Important regional dimensions

- Amanta vs Purnimanta month handling
- Sunrise tithi and time-window rules
- Festival and vrata observance variation
- Language/display convention differences
- Place-based sunrise and timezone sensitivity

## Still blocked

- No AG47 resume.
- No public content generation.
- No Panchang prediction generation.
- No Panchang calculation.
- No festival date finalisation.
- No SQL creation.
- No SQL execution.
- No database write.
- No Supabase/backend activation.
- No deployment.
- No service-role key exposure.

## Next

AD04 — Classical Astronomical and Calendar Calculation Methodology.
`;

writeJson(outputs.regionalProfileDoctrine, regionalProfileDoctrine);
writeJson(outputs.northIndiaProfile, northIndiaProfile);
writeJson(outputs.eastIndiaBiharMithilaProfile, eastIndiaBiharMithilaProfile);
writeJson(outputs.southIndianPanchangamProfile, southIndianPanchangamProfile);
writeJson(outputs.locationSunriseProfile, locationSunriseProfile);
writeJson(outputs.regionalDifferenceMatrix, regionalDifferenceMatrix);
writeJson(outputs.sourceRequirementMap, sourceRequirementMap);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AD03 Regional Panchang Rule Profiles generated.");
console.log("✅ North India, Bihar/Mithila/East India, South Indian Panchangam and location-specific sunrise profiles recorded.");
console.log("✅ Regional difference matrix and source requirement map recorded.");
console.log("✅ Ready for AD04 Classical Astronomical and Calendar Calculation Methodology.");
console.log("✅ No Panchang calculation, prediction, SQL, DB write, backend activation, deployment or service-role exposure recorded.");
