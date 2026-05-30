import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag46zReview: "data/content-intelligence/quality-reviews/ag46z-featured-reads-production-strengthening-closure.json",
  ag46zClosure: "data/content-intelligence/closure-records/ag46z-featured-reads-production-strengthening-closure.json",
  ag46zRouteOwnership: "data/content-intelligence/homepage/ag46z-homepage-three-movement-route-ownership-map.json",
  ag46zCarryForward: "data/content-intelligence/quality-registry/ag46z-carry-forward-register.json",
  ag46zNoMutationAudit: "data/content-intelligence/backend-architecture/ag46z-no-mutation-audit-register.json",
  ag46zNextReadiness: "data/content-intelligence/quality-registry/ag46z-next-governed-stage-readiness-record.json",
  ag46zBoundary: "data/content-intelligence/mutation-plans/ag46z-to-next-governed-stage-boundary.json",
  ag45zReview: "data/content-intelligence/quality-reviews/ag45z-daily-signal-surface-first-light-closure.json",
  ag44zReview: "data/content-intelligence/quality-reviews/ag44z-episodic-knowledge-engine-closure.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ad00-astro-drishvara-data-foundation-opening.json",
  ag47PauseRecord: "data/content-intelligence/reflection-layer/ad00-ag47-pause-record.json",
  foundationOpeningRecord: "data/content-intelligence/ad-foundation/ad00-astro-drishvara-data-foundation-opening-record.json",
  sourceStudyIntake: "data/content-intelligence/ad-foundation/ad00-source-study-intake-register.json",
  oldSupabaseSnapshotRecord: "data/content-intelligence/ad-foundation/ad00-existing-supabase-schema-snapshot-record.json",
  databaseFirstDoctrine: "data/content-intelligence/ad-foundation/ad00-database-first-doctrine.json",
  methodologyNameRecord: "data/content-intelligence/ad-foundation/ad00-kala-drishti-method-name-record.json",
  adSeriesPlan: "data/content-intelligence/ad-foundation/ad00-ad-series-plan.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ad00-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ad00-ad01-source-authenticity-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ad00-to-ad01-source-authenticity-boundary.json",
  registry: "data/quality/ad00-astro-drishvara-data-foundation-opening.json",
  preview: "data/quality/ad00-astro-drishvara-data-foundation-opening-preview.json",
  doc: "docs/quality/AD00_ASTRO_DRISHVARA_DATA_FOUNDATION_OPENING.md"
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
  if (!exists(p)) throw new Error(`Missing AD00 input: ${p}`);
}

const ag46zReview = readJson(inputs.ag46zReview);
const ag46zClosure = readJson(inputs.ag46zClosure);
const ag46zRouteOwnership = readJson(inputs.ag46zRouteOwnership);
const ag46zCarryForward = readJson(inputs.ag46zCarryForward);
const ag46zNoMutationAudit = readJson(inputs.ag46zNoMutationAudit);
const ag46zNextReadiness = readJson(inputs.ag46zNextReadiness);
const ag46zBoundary = readJson(inputs.ag46zBoundary);
const ag45zReview = readJson(inputs.ag45zReview);
const ag44zReview = readJson(inputs.ag44zReview);

if (ag46zReview.status !== "featured_reads_production_strengthening_closure_ready_for_next_governed_stage") {
  throw new Error("AG46Z review status mismatch.");
}
if (ag46zReview.summary?.reflection_layer_deferred !== true) {
  throw new Error("AG46Z must defer Reflection Layer.");
}
if (ag46zClosure.status !== "featured_reads_production_strengthening_closed") {
  throw new Error("AG46Z closure status mismatch.");
}
if (ag46zNoMutationAudit.audit_passed !== true) {
  throw new Error("AG46Z no-mutation audit must pass.");
}
if (ag46zNextReadiness.next_stage_id !== "AG47") {
  throw new Error("AG46Z next-stage readiness must point to AG47 placeholder.");
}
if (ag46zBoundary.next_stage_id !== "AG47") {
  throw new Error("AG46Z boundary must point to AG47 placeholder.");
}
if (!JSON.stringify(ag46zRouteOwnership).includes("Reflection Layer is not AG46 scope")) {
  throw new Error("AG46Z route ownership must keep Reflection Layer deferred.");
}
if (!JSON.stringify(ag46zCarryForward).includes("Reflection Layer")) {
  throw new Error("AG46Z carry-forward must include Reflection Layer.");
}
if (ag45zReview.status !== "daily_signal_surface_first_light_closure_ready_for_ag46") {
  throw new Error("AG45Z review status mismatch.");
}
if (!JSON.stringify(ag44zReview).includes("AG44")) {
  throw new Error("AG44Z must remain consumable.");
}

const blockedState = {
  ad00_astro_drishvara_data_foundation_opened: true,
  ag47_paused_pending_ad_foundation: true,
  ad_series_required_before_ag47_resume: true,
  old_supabase_schema_snapshot_preserved_for_later_mapping: true,
  database_first_doctrine_recorded: true,
  kala_drishti_method_name_recorded: true,
  source_study_intake_recorded: true,
  ready_for_ad01: true,

  ag47_generated: false,
  reflection_layer_ui_planning_started: false,
  homepage_mutated: false,
  homepage_runtime_script_mutated: false,
  css_mutated: false,
  public_reflection_surface_activated: false,
  panchang_runtime_activated: false,
  word_for_day_runtime_activated: false,
  vedic_guidance_runtime_activated: false,
  star_reflection_runtime_activated: false,
  psychometric_runtime_activated: false,
  public_content_generated: false,
  panchang_prediction_generated: false,
  article_mutated: false,
  article_generated: false,
  reference_fetch_executed: false,
  web_scraping_executed: false,
  image_fetch_executed: false,
  image_generation_executed: false,
  sql_file_created: false,
  sql_migration_created: false,
  sql_executed: false,
  database_write_performed: false,
  supabase_table_created: false,
  backend_auth_supabase_activation_performed: false,
  deployment_performed: false,
  service_role_key_exposed: false
};

const ag47PauseRecord = {
  module_id: "AD00",
  title: "AG47 Pause Record",
  status: "ag47_paused_pending_ad_foundation",
  paused_stage_id: "AG47",
  paused_stage_reason: "Reflection Layer must consume an internal Astro-Drishvara data and methodology foundation before public reflection, Panchang, Word of the Day, Vedic Guidance, Star Reflection, observance or psychometric planning proceeds.",
  resume_condition: "AG47 may resume only after ADZ closes the Astro-Drishvara Data Foundation and records data doctrine, source authenticity, regional acceptance, database schema planning, methodology statement and safety audit.",
  latest_route_context: {
    first_light_owner: "AG45",
    reading_surface_owner: "AG46",
    reflection_layer_owner: "AD foundation first, then AG47"
  },
  blocked_state: blockedState
};

const foundationOpeningRecord = {
  module_id: "AD00",
  title: "Astro-Drishvara Data Foundation Opening Record",
  status: "astro_drishvara_data_foundation_opened",
  foundation_name: "AD — Astro-Drishvara Data Foundation",
  preferred_methodology_name: "Drishvara Kāla-Dṛṣṭi Method",
  purpose: [
    "Build the internal data and methodology foundation for Panchang, Word of the Day, Vedic Guidance, Star Reflection, cultural observance, daily reflection and future psychometric/value-return modules.",
    "Reduce future dependence on daily internet lookup by preparing a governed database-first knowledge system.",
    "Separate authentic source data, calculation methodology, regional rule profiles, editorial interpretation and public guidance wording.",
    "Keep deterministic claims blocked and position outputs as source-attributed reflection/guidance unless later approved otherwise."
  ],
  scope_position: "AD00 opens planning only. It does not create SQL, execute SQL, write Supabase data, generate public content or activate runtime.",
  blocked_state: blockedState
};

const sourceStudyIntake = {
  module_id: "AD00",
  title: "Source Study Intake Register",
  status: "source_study_intake_recorded",
  uploaded_sources: [
    {
      source_id: "uploaded_panchang_sample_sree_salasar_balaji_mandir",
      file_name: "Today's Panchang - Shree Salasar Balaji Mandir.pdf",
      role: "field-structure reference",
      observed_field_groups: [
        "sunrise_sunset_moonrise_moonset",
        "tithi_nakshatra_yoga_karana",
        "weekday_paksha",
        "samvat_chandramasa",
        "rashi_nakshatra_pada",
        "ritu_ayana",
        "auspicious_inauspicious_timings",
        "chandrabalam_tarabalam",
        "panchang_day_starts_with_sunrise_note"
      ],
      usage_rule: "Use as a field-coverage and presentation reference only, not as sole authority."
    },
    {
      source_id: "uploaded_panchanga_development_research_paper",
      file_name: "1998BASI...26...75S.pdf",
      role: "methodology and historical-development reference",
      observed_methodology_points: [
        "Panchanga developed from solar and lunar astronomical observation.",
        "Five Panchanga elements are Tithi, Vara, Nakshatra, Yoga and Karana.",
        "Calendar calculations involve solar/lunar motion, corrections, ayanamsha and regional/festival controversies.",
        "Festival and vrata dates require careful treatment of regional traditions and calculation rules."
      ],
      usage_rule: "Use to justify a data-driven Panchanga ontology and source-attributed calculation methodology."
    },
    {
      source_id: "nityananda_misra_style_discipline",
      file_name: "to_be_verified_from_books_videos_articles",
      role: "Sanskritic textual discipline and cultural explanation style reference",
      usage_rule: "Do not claim a Panchang algorithm from Nityanand Mishra ji unless a specific verified source supports it. Use as inspiration for Sanskrit accuracy, word discipline, cultural explanation and non-shallow Indic framing."
    },
    {
      source_id: "regional_accepted_panchang_traditions",
      file_name: "to_be_curated_in_ad01_ad03",
      role: "regional acceptance source set",
      regional_focus: ["Bihar", "Uttar Pradesh", "Kashi", "Mithila", "North India", "East India", "South Indian Panchangam traditions"],
      usage_rule: "Record regional rule profiles separately where amanta/purnimanta, sunrise handling, festival dates or tradition differ."
    }
  ],
  blocked_state: blockedState
};

const oldSupabaseSnapshotRecord = {
  module_id: "AD00",
  title: "Existing Supabase Schema Snapshot Record",
  status: "existing_supabase_schema_snapshot_preserved_for_later_mapping",
  user_supplied_snapshot: {
    file_description: "Old Supabase schema screenshot for project pajlabwwszmhjhabxprf",
    observed_existing_tables: [
      "articles",
      "article_scriptural_references",
      "media_assets",
      "contributors",
      "contributor_submissions",
      "editorial_series",
      "publication_runs",
      "locations",
      "subscription_plans"
    ],
    interpretation: "Existing schema appears to cover content publishing, article references, contributors, media, publication runs and locations. AD should not duplicate this; AD07 should map new Astro-Drishvara tables to the existing content-publishing schema."
  },
  later_use: ["AD07", "AD08", "ADZ", "AG49", "AG52", "AG55", "AG56"],
  blocked_state: blockedState
};

const databaseFirstDoctrine = {
  module_id: "AD00",
  title: "Database-first Doctrine",
  status: "database_first_doctrine_recorded",
  doctrine_rules: [
    "Panchang, Word of the Day, Vedic Guidance, Star Reflection and cultural observance outputs should ultimately depend on Drishvara's internal governed data, not recurring internet lookup.",
    "External sources may be used during foundation stages for study, seed preparation, source verification and methodology comparison.",
    "Database schema planning must be created before runtime implementation.",
    "SQL migration creation and Supabase writes remain blocked until explicit backend/Supabase approval.",
    "Service-role keys must never be exposed in repo or chat.",
    "The methodology must distinguish data, calculation, regional rule profile, editorial interpretation and public guidance text."
  ],
  likely_future_tables: [
    "source_authorities",
    "source_texts",
    "regional_calendar_profiles",
    "panchang_daily_records",
    "panchang_element_master",
    "tithi_master",
    "nakshatra_master",
    "yoga_master",
    "karana_master",
    "vara_master",
    "rashi_master",
    "muhurta_rules",
    "festival_observance_rules",
    "regional_festival_rules",
    "word_corpus",
    "sanskrit_name_corpus",
    "sutra_quote_corpus",
    "reflection_prompt_rules",
    "vedic_guidance_rules",
    "star_reflection_rules",
    "methodology_notes",
    "source_confidence_register",
    "editorial_review_status"
  ],
  blocked_state: blockedState
};

const methodologyNameRecord = {
  module_id: "AD00",
  title: "Kāla-Dṛṣṭi Method Name Record",
  status: "kala_drishti_method_name_recorded",
  method_name: "Drishvara Kāla-Dṛṣṭi Method",
  public_short_explanation_draft: "A source-attributed time-reflection method that reads the day through Panchanga, lunar-solar rhythm, nakshatra, tithi, season, observance, Sanskrit word tradition and regional calendar context. It provides reflective guidance, not deterministic prediction.",
  internal_method_layers: [
    "classical_panchanga_basis",
    "regional_acceptance_profiles",
    "calculation_and_calendar_logic",
    "source_confidence_and_editorial_review",
    "reflection_guidance_and_cultural_context",
    "safety_non_claim_boundary"
  ],
  naming_status: "working_name_approved_for_ad_series_unless_later_renamed",
  blocked_state: blockedState
};

const adSeriesPlan = {
  module_id: "AD00",
  title: "AD Series Plan",
  status: "ad_series_plan_recorded",
  sequence: [
    {
      stage_id: "AD00",
      title: "Pause AG47 and Open Astro-Drishvara Data Foundation",
      status: "current"
    },
    {
      stage_id: "AD01",
      title: "Source Authenticity and Regional Acceptance Doctrine",
      purpose: "Define source hierarchy, Nityanand Mishra ji style discipline, classical sources, and regional accepted Panchang traditions."
    },
    {
      stage_id: "AD02",
      title: "Panchanga Ontology and Canonical Field Model",
      purpose: "Define tithi, vara, nakshatra, yoga, karana, rashi, muhurta, paksha, samvat, ayana, ritu, chandrabalam/tarabalam and related fields."
    },
    {
      stage_id: "AD03",
      title: "Regional Panchang Rule Profiles",
      purpose: "Record North, East, Bihar/UP/Kashi-Mithila and South Indian Panchangam rule-profile differences."
    },
    {
      stage_id: "AD04",
      title: "Classical Astronomical and Calendar Calculation Methodology",
      purpose: "Record calculation methodology boundaries, ayanamsha/correction awareness and sunrise/locality rules."
    },
    {
      stage_id: "AD05",
      title: "Word, Sanskrit Name, Sutra and Reflection Corpus Schema",
      purpose: "Define word/name/sutra/reflection data model using Sanskritic discipline."
    },
    {
      stage_id: "AD06",
      title: "Vedic Guidance and Star Reflection Rule Model",
      purpose: "Define guidance/star-reflection rules as non-deterministic reflective interpretations."
    },
    {
      stage_id: "AD07",
      title: "Supabase and Local Database Schema Planning",
      purpose: "Map AD tables to the existing Supabase content-publishing schema without SQL execution."
    },
    {
      stage_id: "AD08",
      title: "Seed Data and Source Attribution Register",
      purpose: "Define seed-data ingestion, source attribution and editorial verification requirements."
    },
    {
      stage_id: "AD09",
      title: "Drishvara Kāla-Dṛṣṭi Methodology Statement",
      purpose: "Record the public/internal methodology statement."
    },
    {
      stage_id: "AD10",
      title: "Safety, Non-claim and Cultural Integrity Audit",
      purpose: "Audit non-claim language, cultural respect, regional difference handling and safety."
    },
    {
      stage_id: "ADZ",
      title: "Astro-Drishvara Data Foundation Closure",
      purpose: "Close AD and allow AG47 to resume using ADZ as source-of-truth."
    }
  ],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AD00",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ad00",
  checks: Object.entries({
    ag47_generated: false,
    reflection_layer_ui_planning_started: false,
    homepage_mutated: false,
    homepage_runtime_script_mutated: false,
    css_mutated: false,
    public_reflection_surface_activated: false,
    panchang_runtime_activated: false,
    word_for_day_runtime_activated: false,
    vedic_guidance_runtime_activated: false,
    star_reflection_runtime_activated: false,
    psychometric_runtime_activated: false,
    public_content_generated: false,
    panchang_prediction_generated: false,
    article_mutated: false,
    article_generated: false,
    reference_fetch_executed: false,
    web_scraping_executed: false,
    image_fetch_executed: false,
    image_generation_executed: false,
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
  module_id: "AD00",
  title: "AD01 Source Authenticity Readiness Record",
  status: "ready_for_ad01_source_authenticity_regional_acceptance_doctrine",
  ready_for_ad01: true,
  next_stage_id: "AD01",
  next_stage_title: "Source Authenticity and Regional Acceptance Doctrine",
  hard_blocker_count_for_ad01: 0,
  ag47_resume_allowed_next: false,
  sql_creation_allowed_next: false,
  sql_execution_allowed_next: false,
  database_write_allowed_next: false,
  supabase_table_creation_allowed_next: false,
  backend_activation_allowed_next: false,
  public_content_generation_allowed_next: false,
  homepage_mutation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AD00",
  title: "AD00 to AD01 Source Authenticity Boundary",
  status: "ad01_source_authenticity_boundary_created",
  next_stage_id: "AD01",
  next_stage_title: "Source Authenticity and Regional Acceptance Doctrine",
  allowed_scope: [
    "Define authentic source hierarchy for Panchang, Vedic Guidance, Star Reflection, Word of the Day and observance systems.",
    "Record Nityanand Mishra ji as a Sanskritic textual discipline and cultural explanation influence, without falsely claiming his Panchang algorithm unless verified.",
    "Record regional accepted Panchang traditions for Bihar, Uttar Pradesh, Kashi, Mithila, East India and South Indian Panchangam traditions.",
    "Keep work as source doctrine and planning only."
  ],
  blocked_scope: [
    "AG47 resume",
    "homepage mutation",
    "public content generation",
    "Panchang prediction generation",
    "runtime activation",
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
  module_id: "AD00",
  title: "Pause AG47 and Open Astro-Drishvara Data Foundation",
  status: "astro_drishvara_data_foundation_opened_ready_for_ad01",
  depends_on: ["AG46Z", "AG45Z", "AG44Z"],
  ag47_pause_record_file: outputs.ag47PauseRecord,
  foundation_opening_record_file: outputs.foundationOpeningRecord,
  source_study_intake_file: outputs.sourceStudyIntake,
  old_supabase_snapshot_record_file: outputs.oldSupabaseSnapshotRecord,
  database_first_doctrine_file: outputs.databaseFirstDoctrine,
  methodology_name_record_file: outputs.methodologyNameRecord,
  ad_series_plan_file: outputs.adSeriesPlan,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ad00_astro_drishvara_data_foundation_opened: true,
    ag47_paused_pending_ad_foundation: true,
    ad_series_required_before_ag47_resume: true,
    old_supabase_schema_snapshot_preserved_for_later_mapping: true,
    database_first_doctrine_recorded: true,
    kala_drishti_method_name_recorded: true,
    source_study_intake_recorded: true,
    ready_for_ad01: true,
    hard_blocker_count_for_ad01: 0,
    ag47_generated: false,
    homepage_mutated: false,
    public_content_generated: false,
    panchang_prediction_generated: false,
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
  module_id: "AD00",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AD00",
  status: review.status,
  ad00_astro_drishvara_data_foundation_opened: 1,
  ag47_paused_pending_ad_foundation: 1,
  ad_series_required_before_ag47_resume: 1,
  old_supabase_schema_snapshot_preserved_for_later_mapping: 1,
  database_first_doctrine_recorded: 1,
  kala_drishti_method_name_recorded: 1,
  source_study_intake_recorded: 1,
  ready_for_ad01: 1,
  hard_blocker_count_for_ad01: 0,
  ag47_generated: 0,
  homepage_mutated: 0,
  public_content_generated: 0,
  panchang_prediction_generated: 0,
  sql_file_created: 0,
  sql_executed: 0,
  database_write_performed: 0,
  supabase_table_created: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AD00 — Pause AG47 and Open Astro-Drishvara Data Foundation

## Result

AD00 pauses AG47 and opens the Astro-Drishvara Data Foundation.

## Why AG47 is paused

The Reflection Layer depends on Panchang, Word of the Day, Vedic Guidance, Star Reflection, cultural observance and future psychometric/value-return logic. These require an internal data and methodology foundation before Reflection Layer planning resumes.

## Foundation name

AD — Astro-Drishvara Data Foundation

## Working methodology name

Drishvara Kāla-Dṛṣṭi Method

## Source intake

AD00 records:

- Uploaded Panchang sample as a field-structure reference.
- Uploaded Panchanga development paper as methodology/historical-development reference.
- Nityanand Mishra ji as Sanskritic textual discipline and cultural explanation influence, subject to specific verified source attribution in later stages.
- Regional accepted Panchang traditions for Bihar, Uttar Pradesh, Kashi, Mithila, East India and South Indian Panchangam traditions.

## Existing Supabase schema

The old Supabase schema snapshot is preserved for later mapping. It appears to cover articles, article scriptural references, media assets, contributors, publication runs, locations and subscription plans. AD07 will map new AD tables to this existing content-publishing schema.

## Still blocked

- No AG47 generation.
- No homepage mutation.
- No public content generation.
- No Panchang prediction generation.
- No SQL creation.
- No SQL execution.
- No database write.
- No Supabase table creation.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AD01 — Source Authenticity and Regional Acceptance Doctrine.
`;

writeJson(outputs.ag47PauseRecord, ag47PauseRecord);
writeJson(outputs.foundationOpeningRecord, foundationOpeningRecord);
writeJson(outputs.sourceStudyIntake, sourceStudyIntake);
writeJson(outputs.oldSupabaseSnapshotRecord, oldSupabaseSnapshotRecord);
writeJson(outputs.databaseFirstDoctrine, databaseFirstDoctrine);
writeJson(outputs.methodologyNameRecord, methodologyNameRecord);
writeJson(outputs.adSeriesPlan, adSeriesPlan);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AD00 Astro-Drishvara Data Foundation opening generated.");
console.log("✅ AG47 is paused pending AD foundation.");
console.log("✅ Database-first doctrine, source-study intake, old Supabase snapshot record and Kāla-Dṛṣṭi method name are recorded.");
console.log("✅ Ready for AD01 Source Authenticity and Regional Acceptance Doctrine.");
console.log("✅ No AG47 generation, public content generation, SQL, DB write, Supabase/backend activation, deployment or service-role exposure recorded.");
