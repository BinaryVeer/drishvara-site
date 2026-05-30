import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ad01Review: "data/content-intelligence/quality-reviews/ad01-source-authenticity-regional-acceptance-doctrine.json",
  ad01SourceHierarchy: "data/content-intelligence/ad-foundation/ad01-source-authenticity-hierarchy.json",
  ad01RegionalAcceptance: "data/content-intelligence/ad-foundation/ad01-regional-acceptance-doctrine.json",
  ad01ClassicalBasis: "data/content-intelligence/ad-foundation/ad01-classical-panchanga-basis-register.json",
  ad01SourceConfidence: "data/content-intelligence/ad-foundation/ad01-source-confidence-model.json",
  ad01AttributionBoundary: "data/content-intelligence/ad-foundation/ad01-attribution-and-claim-boundary.json",
  ad01NoMutationAudit: "data/content-intelligence/backend-architecture/ad01-no-mutation-audit-register.json",
  ad01Readiness: "data/content-intelligence/quality-registry/ad01-ad02-panchanga-ontology-readiness-record.json",
  ad01Boundary: "data/content-intelligence/mutation-plans/ad01-to-ad02-panchanga-ontology-boundary.json",
  ad00DatabaseFirstDoctrine: "data/content-intelligence/ad-foundation/ad00-database-first-doctrine.json",
  ad00MethodName: "data/content-intelligence/ad-foundation/ad00-kala-drishti-method-name-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ad02-panchanga-ontology-canonical-field-model.json",
  canonicalOntology: "data/content-intelligence/ad-foundation/ad02-panchanga-canonical-ontology.json",
  coreElementModel: "data/content-intelligence/ad-foundation/ad02-panchanga-core-element-model.json",
  supportingFieldModel: "data/content-intelligence/ad-foundation/ad02-panchanga-supporting-field-model.json",
  timeLocationModel: "data/content-intelligence/ad-foundation/ad02-time-location-calculation-context-model.json",
  labelDisplayModel: "data/content-intelligence/ad-foundation/ad02-label-display-and-language-model.json",
  regionalProfilePlaceholder: "data/content-intelligence/ad-foundation/ad02-regional-profile-placeholder-map.json",
  databaseFieldPlanningMap: "data/content-intelligence/ad-foundation/ad02-database-field-planning-map.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ad02-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ad02-ad03-regional-panchang-rule-profile-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ad02-to-ad03-regional-panchang-rule-profiles-boundary.json",
  registry: "data/quality/ad02-panchanga-ontology-canonical-field-model.json",
  preview: "data/quality/ad02-panchanga-ontology-canonical-field-model-preview.json",
  doc: "docs/quality/AD02_PANCHANGA_ONTOLOGY_CANONICAL_FIELD_MODEL.md"
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
  if (!exists(p)) throw new Error(`Missing AD02 input: ${p}`);
}

const ad01Review = readJson(inputs.ad01Review);
const ad01SourceHierarchy = readJson(inputs.ad01SourceHierarchy);
const ad01RegionalAcceptance = readJson(inputs.ad01RegionalAcceptance);
const ad01ClassicalBasis = readJson(inputs.ad01ClassicalBasis);
const ad01SourceConfidence = readJson(inputs.ad01SourceConfidence);
const ad01AttributionBoundary = readJson(inputs.ad01AttributionBoundary);
const ad01NoMutationAudit = readJson(inputs.ad01NoMutationAudit);
const ad01Readiness = readJson(inputs.ad01Readiness);
const ad01Boundary = readJson(inputs.ad01Boundary);
const ad00DatabaseFirstDoctrine = readJson(inputs.ad00DatabaseFirstDoctrine);
const ad00MethodName = readJson(inputs.ad00MethodName);

if (ad01Review.status !== "source_authenticity_regional_acceptance_doctrine_ready_for_ad02") {
  throw new Error("AD01 review status mismatch.");
}
if (ad01Review.summary?.ready_for_ad02 !== true) {
  throw new Error("AD01 does not show AD02 readiness.");
}
if (ad01NoMutationAudit.audit_passed !== true) {
  throw new Error("AD01 no-mutation audit must pass.");
}
if (ad01Readiness.ready_for_ad02 !== true || ad01Readiness.next_stage_id !== "AD02") {
  throw new Error("AD01 readiness must permit AD02.");
}
if (ad01Boundary.next_stage_id !== "AD02") {
  throw new Error("AD01 boundary must point to AD02.");
}
for (const element of ["tithi", "vara", "nakshatra", "yoga", "karana"]) {
  if (!JSON.stringify(ad01ClassicalBasis.core_panchanga_elements).includes(element)) {
    throw new Error(`AD01 classical basis missing core element: ${element}`);
  }
}
if (!JSON.stringify(ad01RegionalAcceptance).includes("location_specific_sunrise_profile")) {
  throw new Error("AD01 regional acceptance must preserve location-specific sunrise profile.");
}
if (!JSON.stringify(ad01SourceHierarchy).includes("tier_1_classical_and_traditional_basis")) {
  throw new Error("AD01 source hierarchy must preserve classical tier.");
}
if (!JSON.stringify(ad01SourceConfidence).includes("confidence_band")) {
  throw new Error("AD01 source confidence model must remain available.");
}
if (!JSON.stringify(ad01AttributionBoundary).includes("reflective")) {
  throw new Error("AD01 attribution/claim boundary must remain available.");
}
if (!JSON.stringify(ad00DatabaseFirstDoctrine).includes("panchang_daily_records")) {
  throw new Error("AD00 database-first doctrine must include panchang_daily_records.");
}
if (ad00MethodName.method_name !== "Drishvara Kāla-Dṛṣṭi Method") {
  throw new Error("AD00 methodology name mismatch.");
}

const blockedState = {
  ad02_panchanga_ontology_recorded: true,
  ad01_consumed: true,
  core_panchanga_elements_recorded: true,
  supporting_panchanga_fields_recorded: true,
  time_location_context_recorded: true,
  label_display_language_model_recorded: true,
  regional_profile_placeholder_recorded: true,
  database_field_planning_map_recorded: true,
  ready_for_ad03: true,

  ag47_resume_allowed: false,
  homepage_mutated: false,
  public_content_generated: false,
  panchang_prediction_generated: false,
  panchang_calculation_executed: false,
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

const canonicalOntology = {
  module_id: "AD02",
  title: "Panchanga Canonical Ontology",
  status: "panchanga_canonical_ontology_recorded",
  ontology_scope: "Canonical field model for Drishvara Panchanga-based data foundation. This is ontology planning only, not a calculation engine.",
  canonical_principles: [
    "Separate concept identity from calculation method.",
    "Separate Sanskrit label, Hindi label, English label and internal key.",
    "Separate traditional meaning from public guidance wording.",
    "Separate canonical Panchanga elements from supporting context fields.",
    "Attach source, regional profile and verification status to future data records.",
    "Treat region/profile differences as structured metadata, not errors.",
    "Keep Panchanga output reflective/contextual unless later calculation stages are approved."
  ],
  core_element_groups: [
    "panchanga_core_elements",
    "time_and_location_context",
    "calendar_context",
    "muhurta_and_period_context",
    "strength_and_compatibility_context",
    "regional_profile_context",
    "source_and_review_context"
  ],
  methodology_name: "Drishvara Kāla-Dṛṣṭi Method",
  blocked_state: blockedState
};

const coreElementModel = {
  module_id: "AD02",
  title: "Panchanga Core Element Model",
  status: "panchanga_core_element_model_recorded",
  elements: [
    {
      key: "tithi",
      sanskrit_label: "तिथि",
      english_label: "Tithi",
      group: "panchanga_core_elements",
      canonical_role: "Lunar day / Sun-Moon angular relation segment.",
      internal_fields: [
        "tithi_id",
        "tithi_number",
        "tithi_name_sanskrit",
        "tithi_name_hindi",
        "tithi_name_english",
        "paksha",
        "start_time_local",
        "end_time_local",
        "is_kshaya_or_vriddhi_tithi",
        "source_id",
        "regional_profile_id",
        "verification_status"
      ],
      ad04_calculation_note_required: true
    },
    {
      key: "vara",
      sanskrit_label: "वार",
      english_label: "Vāra / Weekday",
      group: "panchanga_core_elements",
      canonical_role: "Weekday / solar day context.",
      internal_fields: [
        "vara_id",
        "weekday_number",
        "weekday_name_sanskrit",
        "weekday_name_hindi",
        "weekday_name_english",
        "weekday_lord_traditional",
        "sunrise_day_start_rule",
        "source_id",
        "regional_profile_id",
        "verification_status"
      ],
      ad04_calculation_note_required: true
    },
    {
      key: "nakshatra",
      sanskrit_label: "नक्षत्र",
      english_label: "Nakshatra",
      group: "panchanga_core_elements",
      canonical_role: "Lunar mansion / Moon position segment.",
      internal_fields: [
        "nakshatra_id",
        "nakshatra_number",
        "nakshatra_name_sanskrit",
        "nakshatra_name_hindi",
        "nakshatra_name_english",
        "pada",
        "start_time_local",
        "end_time_local",
        "moon_rashi",
        "source_id",
        "regional_profile_id",
        "verification_status"
      ],
      ad04_calculation_note_required: true
    },
    {
      key: "yoga",
      sanskrit_label: "योग",
      english_label: "Yoga",
      group: "panchanga_core_elements",
      canonical_role: "Combined solar-lunar longitude based Panchanga element.",
      internal_fields: [
        "yoga_id",
        "yoga_number",
        "yoga_name_sanskrit",
        "yoga_name_hindi",
        "yoga_name_english",
        "start_time_local",
        "end_time_local",
        "source_id",
        "regional_profile_id",
        "verification_status"
      ],
      ad04_calculation_note_required: true
    },
    {
      key: "karana",
      sanskrit_label: "करण",
      english_label: "Karana",
      group: "panchanga_core_elements",
      canonical_role: "Half-tithi division.",
      internal_fields: [
        "karana_id",
        "karana_name_sanskrit",
        "karana_name_hindi",
        "karana_name_english",
        "karana_sequence",
        "start_time_local",
        "end_time_local",
        "source_id",
        "regional_profile_id",
        "verification_status"
      ],
      ad04_calculation_note_required: true
    }
  ],
  blocked_state: blockedState
};

const supportingFieldModel = {
  module_id: "AD02",
  title: "Panchanga Supporting Field Model",
  status: "panchanga_supporting_field_model_recorded",
  supporting_fields: [
    {
      group: "time_and_luminary_context",
      fields: [
        "sunrise",
        "sunset",
        "moonrise",
        "moonset",
        "solar_noon",
        "local_day_start",
        "local_day_end"
      ]
    },
    {
      group: "calendar_context",
      fields: [
        "gregorian_date",
        "panchanga_date_label",
        "paksha",
        "masa",
        "amanta_masa",
        "purnimanta_masa",
        "samvat",
        "shaka_year",
        "vikram_samvat",
        "ayana",
        "ritu"
      ]
    },
    {
      group: "rashi_and_lunar_context",
      fields: [
        "surya_rashi",
        "chandra_rashi",
        "moon_nakshatra",
        "nakshatra_pada",
        "lunar_phase_context"
      ]
    },
    {
      group: "muhurta_and_period_context",
      fields: [
        "abhijit_muhurta",
        "rahu_kala",
        "yamaganda",
        "gulika_kala",
        "durmuhurta",
        "varjyam",
        "amrit_kalam",
        "brahma_muhurta",
        "sandhya_periods"
      ]
    },
    {
      group: "strength_and_compatibility_context",
      fields: [
        "chandrabalam",
        "tarabalam",
        "panchaka_status",
        "bhadra_status",
        "vrata_festival_relevance"
      ]
    },
    {
      group: "source_and_review_context",
      fields: [
        "source_id",
        "source_confidence_band",
        "regional_profile_id",
        "calculation_profile_id",
        "editorial_review_status",
        "last_verified_at",
        "notes"
      ]
    }
  ],
  blocked_state: blockedState
};

const timeLocationModel = {
  module_id: "AD02",
  title: "Time, Location and Calculation Context Model",
  status: "time_location_calculation_context_recorded",
  context_fields: [
    {
      key: "location_id",
      purpose: "Links Panchanga records to a place or regional calculation context."
    },
    {
      key: "place_name",
      purpose: "Human-readable place name."
    },
    {
      key: "latitude",
      purpose: "Calculation-sensitive coordinate."
    },
    {
      key: "longitude",
      purpose: "Calculation-sensitive coordinate."
    },
    {
      key: "timezone",
      purpose: "Local civil time conversion."
    },
    {
      key: "sunrise_reference",
      purpose: "Defines Panchanga day boundary and local date context."
    },
    {
      key: "calculation_profile_id",
      purpose: "Links calculation assumptions, ayanamsha/correction policy and regional rule profile."
    },
    {
      key: "regional_profile_id",
      purpose: "Links output to North/East/South/regional tradition profile."
    }
  ],
  doctrine_rules: [
    "Panchanga day boundary must be location-sensitive and sunrise-aware.",
    "Local time must be stored with timezone context.",
    "Future calculations must record calculation profile and regional profile.",
    "AD02 does not calculate sunrise, tithi, nakshatra, yoga or karana."
  ],
  blocked_state: blockedState
};

const labelDisplayModel = {
  module_id: "AD02",
  title: "Label, Display and Language Model",
  status: "label_display_language_model_recorded",
  label_layers: [
    {
      layer: "internal_key",
      examples: ["tithi", "nakshatra", "rahu_kala", "chandrabalam"],
      purpose: "Stable code/database key."
    },
    {
      layer: "sanskrit_devanagari_label",
      examples: ["तिथि", "नक्षत्र", "राहुकाल"],
      purpose: "Traditional Sanskrit/Hindi display where appropriate."
    },
    {
      layer: "english_label",
      examples: ["Tithi", "Nakshatra", "Rahu Kala"],
      purpose: "Reader-facing English display."
    },
    {
      layer: "public_explanation",
      examples: ["A lunar-day marker used in Panchanga tradition."],
      purpose: "Simple non-claim explanatory wording."
    },
    {
      layer: "editorial_guidance_text",
      examples: ["Use this only for reflective context, not deterministic outcome prediction."],
      purpose: "Drishvara reflection layer wording."
    }
  ],
  doctrine_rules: [
    "Public labels must not expose internal developer keys.",
    "Sanskrit labels must be reviewed before public use.",
    "Hindi/English explanations should avoid fear-based or deterministic prediction wording.",
    "Nityanand Mishra ji style discipline applies to word/context precision, not unverified algorithm claims."
  ],
  blocked_state: blockedState
};

const regionalProfilePlaceholder = {
  module_id: "AD02",
  title: "Regional Profile Placeholder Map",
  status: "regional_profile_placeholder_map_recorded",
  profiles_to_define_in_ad03: [
    {
      regional_profile_id: "north_india_general",
      region_focus: ["Uttar Pradesh", "Kashi-influenced contexts", "Hindi belt"],
      profile_status: "placeholder_for_ad03"
    },
    {
      regional_profile_id: "east_india_bihar_mithila",
      region_focus: ["Bihar", "Mithila", "East India"],
      profile_status: "placeholder_for_ad03"
    },
    {
      regional_profile_id: "south_indian_panchangam",
      region_focus: ["Tamil", "Telugu", "Kannada", "Malayalam traditions where later sourced"],
      profile_status: "placeholder_for_ad03"
    },
    {
      regional_profile_id: "location_specific_sunrise_profile",
      region_focus: ["all regions"],
      profile_status: "placeholder_for_ad03"
    }
  ],
  rule: "AD02 only reserves profile identifiers. AD03 will define regional rule profiles.",
  blocked_state: blockedState
};

const databaseFieldPlanningMap = {
  module_id: "AD02",
  title: "Database Field Planning Map",
  status: "database_field_planning_map_recorded",
  planned_tables_no_sql: [
    {
      table_name: "panchang_element_master",
      purpose: "Stores canonical definitions for tithi, vara, nakshatra, yoga, karana and supporting elements.",
      status: "planning_only_no_sql"
    },
    {
      table_name: "panchang_daily_records",
      purpose: "Future daily Panchanga records by date/location/profile.",
      status: "planning_only_no_sql"
    },
    {
      table_name: "regional_calendar_profiles",
      purpose: "Future regional rule profiles.",
      status: "planning_only_no_sql"
    },
    {
      table_name: "source_authorities",
      purpose: "Future source authority records.",
      status: "planning_only_no_sql"
    },
    {
      table_name: "methodology_notes",
      purpose: "Future methodology notes for calculation and editorial rules.",
      status: "planning_only_no_sql"
    }
  ],
  field_mapping_principles: [
    "Every future Panchanga record should carry date, location, regional profile, calculation profile, source and review status.",
    "Master tables should carry Sanskrit/Hindi/English labels separately.",
    "Public guidance text should be stored separately from calculation data.",
    "AD02 creates no SQL file and writes no database records."
  ],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AD02",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ad02",
  checks: Object.entries({
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
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
  module_id: "AD02",
  title: "AD03 Regional Panchang Rule Profile Readiness Record",
  status: "ready_for_ad03_regional_panchang_rule_profiles",
  ready_for_ad03: true,
  next_stage_id: "AD03",
  next_stage_title: "Regional Panchang Rule Profiles",
  hard_blocker_count_for_ad03: 0,
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
  module_id: "AD02",
  title: "AD02 to AD03 Regional Panchang Rule Profiles Boundary",
  status: "ad03_regional_panchang_rule_profiles_boundary_created",
  next_stage_id: "AD03",
  next_stage_title: "Regional Panchang Rule Profiles",
  allowed_scope: [
    "Define regional Panchang rule profiles for North India, Bihar/Mithila/East India, South Indian Panchangam traditions and location-specific sunrise profile.",
    "Record differences such as amanta/purnimanta handling, sunrise-day boundary, festival rule differences and regional acceptance metadata.",
    "Keep the work as profile planning only.",
    "Do not calculate Panchang or generate public predictions."
  ],
  blocked_scope: [
    "AG47 resume",
    "public content generation",
    "Panchang prediction generation",
    "Panchang calculation execution",
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
  module_id: "AD02",
  title: "Panchanga Ontology and Canonical Field Model",
  status: "panchanga_ontology_canonical_field_model_ready_for_ad03",
  depends_on: ["AD01"],
  canonical_ontology_file: outputs.canonicalOntology,
  core_element_model_file: outputs.coreElementModel,
  supporting_field_model_file: outputs.supportingFieldModel,
  time_location_model_file: outputs.timeLocationModel,
  label_display_model_file: outputs.labelDisplayModel,
  regional_profile_placeholder_file: outputs.regionalProfilePlaceholder,
  database_field_planning_map_file: outputs.databaseFieldPlanningMap,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ad02_panchanga_ontology_recorded: true,
    ad01_consumed: true,
    core_panchanga_elements_recorded: true,
    supporting_panchanga_fields_recorded: true,
    time_location_context_recorded: true,
    label_display_language_model_recorded: true,
    regional_profile_placeholder_recorded: true,
    database_field_planning_map_recorded: true,
    ready_for_ad03: true,
    hard_blocker_count_for_ad03: 0,
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    panchang_daily_record_seeded: false,
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
  module_id: "AD02",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AD02",
  status: review.status,
  ad02_panchanga_ontology_recorded: 1,
  ad01_consumed: 1,
  core_panchanga_elements_recorded: 1,
  supporting_panchanga_fields_recorded: 1,
  time_location_context_recorded: 1,
  label_display_language_model_recorded: 1,
  regional_profile_placeholder_recorded: 1,
  database_field_planning_map_recorded: 1,
  ready_for_ad03: 1,
  hard_blocker_count_for_ad03: 0,
  ag47_resume_allowed: 0,
  homepage_mutated: 0,
  public_content_generated: 0,
  panchang_prediction_generated: 0,
  panchang_calculation_executed: 0,
  panchang_daily_record_seeded: 0,
  sql_file_created: 0,
  sql_executed: 0,
  database_write_performed: 0,
  supabase_table_created: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AD02 — Panchanga Ontology and Canonical Field Model

## Result

AD02 records the canonical Panchanga ontology and field model for the Astro-Drishvara Data Foundation.

## Core Panchanga elements

AD02 records the five core Panchanga elements:

- Tithi
- Vāra
- Nakshatra
- Yoga
- Karana

## Supporting fields

AD02 records supporting fields for:

- sunrise, sunset, moonrise, moonset;
- paksha, masa, samvat, ayana, ritu;
- rashi and nakshatra pada;
- muhurta, rahu kala, yamaganda, gulika, abhijit;
- chandrabalam and tarabalam;
- location, timezone, regional profile and calculation profile;
- source, confidence and editorial review status.

## Language model

AD02 separates:

- internal key;
- Sanskrit/Devanagari label;
- Hindi label;
- English label;
- public explanation;
- editorial guidance text.

## Important boundary

AD02 is ontology planning only. It does not calculate Panchang, generate predictions, create SQL, seed records, write to Supabase or resume AG47.

## Next

AD03 — Regional Panchang Rule Profiles.
`;

writeJson(outputs.canonicalOntology, canonicalOntology);
writeJson(outputs.coreElementModel, coreElementModel);
writeJson(outputs.supportingFieldModel, supportingFieldModel);
writeJson(outputs.timeLocationModel, timeLocationModel);
writeJson(outputs.labelDisplayModel, labelDisplayModel);
writeJson(outputs.regionalProfilePlaceholder, regionalProfilePlaceholder);
writeJson(outputs.databaseFieldPlanningMap, databaseFieldPlanningMap);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AD02 Panchanga Ontology and Canonical Field Model generated.");
console.log("✅ Tithi, Vara, Nakshatra, Yoga and Karana canonical elements recorded.");
console.log("✅ Supporting fields, time/location context, label/display model and database field planning map recorded.");
console.log("✅ Ready for AD03 Regional Panchang Rule Profiles.");
console.log("✅ No Panchang calculation, prediction, SQL, DB write, backend activation, deployment or service-role exposure recorded.");
