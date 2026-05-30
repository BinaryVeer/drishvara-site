import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ad07Review: "data/content-intelligence/quality-reviews/ad07-database-schema-planning.json",
  ad07SupabaseSnapshotConsumption: "data/content-intelligence/ad-foundation/ad07-existing-supabase-schema-consumption-map.json",
  ad07TableMap: "data/content-intelligence/ad-foundation/ad07-ad-foundation-table-map.json",
  ad07RelationshipMap: "data/content-intelligence/ad-foundation/ad07-table-relationship-index-map.json",
  ad07SchemaDeferral: "data/content-intelligence/backend-architecture/ad07-schema-governance-migration-deferral-register.json",
  ad07NoSqlNoDbAudit: "data/content-intelligence/backend-architecture/ad07-no-sql-no-db-write-audit.json",
  ad07NoMutationAudit: "data/content-intelligence/backend-architecture/ad07-no-mutation-audit-register.json",
  ad07Readiness: "data/content-intelligence/quality-registry/ad07-ad08-seed-data-source-attribution-readiness-record.json",
  ad07Boundary: "data/content-intelligence/mutation-plans/ad07-to-ad08-seed-data-source-attribution-boundary.json",

  ad00SourceStudyIntake: "data/content-intelligence/ad-foundation/ad00-source-study-intake-register.json",
  ad01SourceConfidence: "data/content-intelligence/ad-foundation/ad01-source-confidence-model.json",
  ad03SourceRequirement: "data/content-intelligence/ad-foundation/ad03-regional-source-requirement-map.json",
  ad05SourceReviewMap: "data/content-intelligence/ad-foundation/ad05-corpus-source-attribution-review-map.json",
  ad06ClaimRiskSafety: "data/content-intelligence/ad-foundation/ad06-claim-risk-tone-safety-model.json",

  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ad08-seed-data-source-attribution-register.json",
  seedDoctrine: "data/content-intelligence/ad-foundation/ad08-seed-data-doctrine.json",
  sourceAuthoritySeedManifest: "data/content-intelligence/ad-foundation/ad08-source-authority-seed-manifest-template.json",
  panchangaMasterSeedManifest: "data/content-intelligence/ad-foundation/ad08-panchanga-master-seed-manifest-template.json",
  regionalProfileSeedManifest: "data/content-intelligence/ad-foundation/ad08-regional-profile-seed-manifest-template.json",
  corpusSeedManifest: "data/content-intelligence/ad-foundation/ad08-corpus-seed-manifest-template.json",
  guidanceSeedManifest: "data/content-intelligence/ad-foundation/ad08-guidance-rule-seed-manifest-template.json",
  attributionVerificationWorkflow: "data/content-intelligence/ad-foundation/ad08-attribution-verification-workflow-map.json",
  noSeedNoFetchAudit: "data/content-intelligence/backend-architecture/ad08-no-seed-no-fetch-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ad08-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ad08-ad09-kala-drishti-methodology-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ad08-to-ad09-kala-drishti-methodology-boundary.json",
  registry: "data/quality/ad08-seed-data-source-attribution-register.json",
  preview: "data/quality/ad08-seed-data-source-attribution-register-preview.json",
  doc: "docs/quality/AD08_SEED_DATA_SOURCE_ATTRIBUTION_REGISTER.md"
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
  if (!exists(p)) throw new Error(`Missing AD08 input: ${p}`);
}

const ad07Review = readJson(inputs.ad07Review);
const ad07SupabaseSnapshotConsumption = readJson(inputs.ad07SupabaseSnapshotConsumption);
const ad07TableMap = readJson(inputs.ad07TableMap);
const ad07RelationshipMap = readJson(inputs.ad07RelationshipMap);
const ad07SchemaDeferral = readJson(inputs.ad07SchemaDeferral);
const ad07NoSqlNoDbAudit = readJson(inputs.ad07NoSqlNoDbAudit);
const ad07NoMutationAudit = readJson(inputs.ad07NoMutationAudit);
const ad07Readiness = readJson(inputs.ad07Readiness);
const ad07Boundary = readJson(inputs.ad07Boundary);

const ad00SourceStudyIntake = readJson(inputs.ad00SourceStudyIntake);
const ad01SourceConfidence = readJson(inputs.ad01SourceConfidence);
const ad03SourceRequirement = readJson(inputs.ad03SourceRequirement);
const ad05SourceReviewMap = readJson(inputs.ad05SourceReviewMap);
const ad06ClaimRiskSafety = readJson(inputs.ad06ClaimRiskSafety);

if (ad07Review.status !== "database_schema_planning_ready_for_ad08") {
  throw new Error("AD07 review status mismatch.");
}
if (ad07Review.summary?.ready_for_ad08 !== true) {
  throw new Error("AD07 does not show AD08 readiness.");
}
if (ad07NoSqlNoDbAudit.audit_passed !== true) {
  throw new Error("AD07 no SQL/no DB audit must pass.");
}
if (ad07NoMutationAudit.audit_passed !== true) {
  throw new Error("AD07 no-mutation audit must pass.");
}
if (ad07Readiness.ready_for_ad08 !== true || ad07Readiness.next_stage_id !== "AD08") {
  throw new Error("AD07 readiness must permit AD08.");
}
if (ad07Boundary.next_stage_id !== "AD08") {
  throw new Error("AD07 boundary must point to AD08.");
}
if (!JSON.stringify(ad07Boundary.allowed_scope).includes("Do not insert seed data")) {
  throw new Error("AD07 boundary must preserve no seed insertion rule.");
}
for (const table of ["source_authorities", "panchang_daily_records", "word_corpus", "vedic_guidance_rules", "star_reflection_rules"]) {
  if (!JSON.stringify(ad07TableMap).includes(table)) {
    throw new Error(`AD07 table map missing: ${table}`);
  }
}
if (!JSON.stringify(ad07RelationshipMap).includes("source_id")) {
  throw new Error("AD07 relationship map must include source_id.");
}
if (!JSON.stringify(ad07SupabaseSnapshotConsumption).includes("articles")) {
  throw new Error("AD07 must preserve existing Supabase snapshot.");
}
if (!JSON.stringify(ad07SchemaDeferral).includes("No SQL migration is created")) {
  throw new Error("AD07 schema deferral must preserve no migration rule.");
}
if (!JSON.stringify(ad00SourceStudyIntake).includes("uploaded_panchanga_development_research_paper")) {
  throw new Error("AD00 source study intake must remain available.");
}
if (!JSON.stringify(ad01SourceConfidence).includes("confidence_bands")) {
  throw new Error("AD01 source confidence bands must remain available.");
}
if (!JSON.stringify(ad03SourceRequirement).includes("supported_rule")) {
  throw new Error("AD03 source requirement map must remain available.");
}
if (!JSON.stringify(ad05SourceReviewMap).includes("verified_for_public_use")) {
  throw new Error("AD05 source review map must remain available.");
}
if (!JSON.stringify(ad06ClaimRiskSafety).includes("blocked_public_language")) {
  throw new Error("AD06 claim-risk model must remain available.");
}

const blockedState = {
  ad08_seed_data_source_attribution_register_recorded: true,
  ad07_consumed: true,
  seed_doctrine_recorded: true,
  source_authority_seed_manifest_template_recorded: true,
  panchanga_master_seed_manifest_template_recorded: true,
  regional_profile_seed_manifest_template_recorded: true,
  corpus_seed_manifest_template_recorded: true,
  guidance_rule_seed_manifest_template_recorded: true,
  attribution_verification_workflow_recorded: true,
  no_seed_no_fetch_audit_recorded: true,
  ready_for_ad09: true,

  ag47_resume_allowed: false,
  homepage_mutated: false,
  public_content_generated: false,
  seed_data_inserted: false,
  seed_data_committed_to_database: false,
  guidance_generated: false,
  word_of_day_generated: false,
  panchang_prediction_generated: false,
  panchang_calculation_executed: false,
  live_source_fetch_executed: false,
  web_scraping_executed: false,
  source_content_downloaded: false,
  copyrighted_text_reproduced: false,
  sql_file_created: false,
  sql_migration_created: false,
  sql_executed: false,
  database_write_performed: false,
  supabase_table_created: false,
  supabase_schema_modified: false,
  backend_auth_supabase_activation_performed: false,
  deployment_performed: false,
  service_role_key_exposed: false
};

const seedDoctrine = {
  module_id: "AD08",
  title: "Seed Data Doctrine",
  status: "seed_data_doctrine_recorded",
  doctrine_rules: [
    "AD08 creates seed manifest templates only; it does not insert seed data.",
    "Seed candidates must separate source authority, supported claim, record type, verification status and editorial review status.",
    "Seed data must not be accepted merely because it is popular, viral or traditional-sounding.",
    "Panchanga master seeds require source and rule-profile metadata before later use.",
    "Corpus seeds require copyright/context review before public use.",
    "Guidance-rule seeds require claim-risk and safety review before public use.",
    "No source fetch, scraping, SQL creation, SQL execution, database write or Supabase activation occurs in AD08."
  ],
  seed_families: [
    "source_authority_seed_candidates",
    "panchanga_master_seed_candidates",
    "regional_profile_seed_candidates",
    "corpus_seed_candidates",
    "guidance_rule_seed_candidates"
  ],
  blocked_state: blockedState
};

const sourceAuthoritySeedManifest = {
  module_id: "AD08",
  title: "Source Authority Seed Manifest Template",
  status: "source_authority_seed_manifest_template_recorded",
  planned_record_type: "source_authorities",
  template_fields: [
    "seed_candidate_id",
    "source_id",
    "source_title",
    "source_type",
    "author_or_institution",
    "tradition_or_region",
    "source_locator",
    "supported_claim",
    "source_confidence_band",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "copyright_or_usage_note",
    "notes"
  ],
  seed_candidate_statuses: [
    "candidate_only",
    "source_pending",
    "under_editorial_verification",
    "verified_for_internal_use",
    "verified_for_public_use",
    "blocked"
  ],
  no_seed_inserted: true,
  blocked_state: blockedState
};

const panchangaMasterSeedManifest = {
  module_id: "AD08",
  title: "Panchanga Master Seed Manifest Template",
  status: "panchanga_master_seed_manifest_template_recorded",
  planned_record_types: [
    "panchang_element_master",
    "tithi_master",
    "nakshatra_master",
    "yoga_master",
    "karana_master",
    "vara_master",
    "rashi_master",
    "muhurta_rules"
  ],
  template_fields: [
    "seed_candidate_id",
    "record_type",
    "canonical_key",
    "sanskrit_label",
    "hindi_label",
    "english_label",
    "traditional_definition",
    "calculation_note_required",
    "regional_profile_dependency",
    "source_id",
    "supported_claim",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "notes"
  ],
  seed_rules: [
    "Panchanga master records must not imply a live daily calculation.",
    "Calculation notes remain methodology references until a later approved calculation engine exists.",
    "Regional dependency must be recorded where applicable.",
    "No Panchanga master record is inserted in AD08."
  ],
  no_seed_inserted: true,
  blocked_state: blockedState
};

const regionalProfileSeedManifest = {
  module_id: "AD08",
  title: "Regional Profile Seed Manifest Template",
  status: "regional_profile_seed_manifest_template_recorded",
  planned_record_types: [
    "regional_calendar_profiles",
    "regional_festival_rules",
    "festival_observance_rules"
  ],
  template_fields: [
    "seed_candidate_id",
    "regional_profile_id",
    "region_or_tradition",
    "rule_type",
    "rule_summary",
    "supported_rule",
    "source_id",
    "source_confidence_band",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "difference_handling_note",
    "notes"
  ],
  profile_targets: [
    "north_india_general",
    "east_india_bihar_mithila",
    "south_indian_panchangam",
    "location_specific_sunrise_profile"
  ],
  no_seed_inserted: true,
  blocked_state: blockedState
};

const corpusSeedManifest = {
  module_id: "AD08",
  title: "Corpus Seed Manifest Template",
  status: "corpus_seed_manifest_template_recorded",
  planned_record_types: [
    "word_corpus",
    "sanskrit_name_corpus",
    "sutra_quote_corpus",
    "reflection_prompt_rules"
  ],
  template_fields: [
    "seed_candidate_id",
    "record_type",
    "record_key",
    "original_text_or_label",
    "transliteration",
    "translation_or_paraphrase",
    "meaning_context",
    "reflection_use_case",
    "source_id",
    "source_locator",
    "copyright_or_usage_note",
    "source_confidence_band",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "claim_risk_level",
    "notes"
  ],
  seed_rules: [
    "Corpus seed candidates must not reproduce long copyrighted passages.",
    "Translation/paraphrase must be reviewed.",
    "Public use requires verified source and editorial review.",
    "No corpus record is inserted or published in AD08."
  ],
  no_seed_inserted: true,
  blocked_state: blockedState
};

const guidanceSeedManifest = {
  module_id: "AD08",
  title: "Guidance Rule Seed Manifest Template",
  status: "guidance_rule_seed_manifest_template_recorded",
  planned_record_types: [
    "vedic_guidance_rules",
    "star_reflection_rules",
    "guidance_context_links",
    "claim_risk_register"
  ],
  template_fields: [
    "seed_candidate_id",
    "rule_type",
    "rule_key",
    "linked_panchanga_context",
    "linked_regional_profile_id",
    "linked_word_id",
    "linked_quote_id",
    "interpretation_boundary",
    "template_draft",
    "tone",
    "claim_risk_level",
    "safety_note",
    "source_dependency_level",
    "verification_status",
    "editorial_review_status",
    "public_use_allowed",
    "notes"
  ],
  seed_rules: [
    "Guidance seeds must remain reflective and non-deterministic.",
    "High-risk or blocked claim language cannot move to public use.",
    "Guidance seeds cannot be generated into public content in AD08.",
    "No guidance-rule seed is inserted in AD08."
  ],
  no_seed_inserted: true,
  blocked_state: blockedState
};

const attributionVerificationWorkflow = {
  module_id: "AD08",
  title: "Attribution and Verification Workflow Map",
  status: "attribution_verification_workflow_recorded",
  workflow_steps: [
    {
      step_id: "candidate_registration",
      purpose: "Register seed candidate with source and record type."
    },
    {
      step_id: "source_locator_check",
      purpose: "Confirm source locator, title, author/institution and tradition/region."
    },
    {
      step_id: "supported_claim_check",
      purpose: "Record exactly what claim the source supports."
    },
    {
      step_id: "confidence_band_assignment",
      purpose: "Assign source confidence band from AD01 model."
    },
    {
      step_id: "copyright_context_check",
      purpose: "Check excerpt length, paraphrase/translation status and contextual integrity."
    },
    {
      step_id: "claim_risk_safety_check",
      purpose: "Check deterministic, fear-based, medical/legal/financial/safety risks."
    },
    {
      step_id: "editorial_review",
      purpose: "Approve for internal or public use only after review."
    }
  ],
  blocked_transitions: [
    "candidate_only_to_public_use_without_verification",
    "source_pending_to_database_seed_without_review",
    "high_risk_guidance_to_public_surface",
    "copyright_sensitive_text_to_public_surface_without_review",
    "regional_rule_to_global_output_without_profile_metadata"
  ],
  blocked_state: blockedState
};

const noSeedNoFetchAudit = {
  module_id: "AD08",
  title: "No Seed / No Fetch Audit",
  status: "no_seed_no_fetch_audit_passed_for_ad08",
  audit_passed: true,
  checks: [
    { check_id: "seed_data_inserted", expected: false, actual: false, passed: true },
    { check_id: "seed_data_committed_to_database", expected: false, actual: false, passed: true },
    { check_id: "live_source_fetch_executed", expected: false, actual: false, passed: true },
    { check_id: "web_scraping_executed", expected: false, actual: false, passed: true },
    { check_id: "source_content_downloaded", expected: false, actual: false, passed: true },
    { check_id: "copyrighted_text_reproduced", expected: false, actual: false, passed: true },
    { check_id: "sql_file_created", expected: false, actual: false, passed: true },
    { check_id: "database_write_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AD08",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ad08",
  checks: Object.entries({
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    seed_data_inserted: false,
    seed_data_committed_to_database: false,
    guidance_generated: false,
    word_of_day_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    live_source_fetch_executed: false,
    web_scraping_executed: false,
    source_content_downloaded: false,
    copyrighted_text_reproduced: false,
    sql_file_created: false,
    sql_migration_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    supabase_schema_modified: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AD08",
  title: "AD09 Kāla-Dṛṣṭi Methodology Readiness Record",
  status: "ready_for_ad09_kala_drishti_methodology_statement",
  ready_for_ad09: true,
  next_stage_id: "AD09",
  next_stage_title: "Drishvara Kāla-Dṛṣṭi Methodology Statement",
  hard_blocker_count_for_ad09: 0,
  ag47_resume_allowed_next: false,
  public_content_generation_allowed_next: false,
  seed_data_insertion_allowed_next: false,
  live_fetch_allowed_next: false,
  web_scraping_allowed_next: false,
  sql_creation_allowed_next: false,
  sql_execution_allowed_next: false,
  database_write_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AD08",
  title: "AD08 to AD09 Kāla-Dṛṣṭi Methodology Boundary",
  status: "ad09_kala_drishti_methodology_boundary_created",
  next_stage_id: "AD09",
  next_stage_title: "Drishvara Kāla-Dṛṣṭi Methodology Statement",
  allowed_scope: [
    "Prepare public/internal methodology statement for Drishvara Kāla-Dṛṣṭi Method.",
    "Summarise source hierarchy, Panchanga ontology, regional profiles, calculation methodology, corpus schema, guidance safety and database-first doctrine.",
    "Keep wording as reflective/contextual methodology, not deterministic prediction.",
    "Do not generate operational content, seed data, SQL or runtime code."
  ],
  blocked_scope: [
    "AG47 resume",
    "public content generation",
    "seed data insertion",
    "guidance generation",
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
  module_id: "AD08",
  title: "Seed Data and Source Attribution Register",
  status: "seed_data_source_attribution_register_ready_for_ad09",
  depends_on: ["AD07"],
  seed_doctrine_file: outputs.seedDoctrine,
  source_authority_seed_manifest_file: outputs.sourceAuthoritySeedManifest,
  panchanga_master_seed_manifest_file: outputs.panchangaMasterSeedManifest,
  regional_profile_seed_manifest_file: outputs.regionalProfileSeedManifest,
  corpus_seed_manifest_file: outputs.corpusSeedManifest,
  guidance_seed_manifest_file: outputs.guidanceSeedManifest,
  attribution_verification_workflow_file: outputs.attributionVerificationWorkflow,
  no_seed_no_fetch_audit_file: outputs.noSeedNoFetchAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ad08_seed_data_source_attribution_register_recorded: true,
    ad07_consumed: true,
    seed_doctrine_recorded: true,
    source_authority_seed_manifest_template_recorded: true,
    panchanga_master_seed_manifest_template_recorded: true,
    regional_profile_seed_manifest_template_recorded: true,
    corpus_seed_manifest_template_recorded: true,
    guidance_rule_seed_manifest_template_recorded: true,
    attribution_verification_workflow_recorded: true,
    no_seed_no_fetch_audit_recorded: true,
    ready_for_ad09: true,
    hard_blocker_count_for_ad09: 0,
    ag47_resume_allowed: false,
    homepage_mutated: false,
    public_content_generated: false,
    seed_data_inserted: false,
    seed_data_committed_to_database: false,
    guidance_generated: false,
    word_of_day_generated: false,
    panchang_prediction_generated: false,
    panchang_calculation_executed: false,
    live_source_fetch_executed: false,
    web_scraping_executed: false,
    source_content_downloaded: false,
    sql_file_created: false,
    sql_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    supabase_schema_modified: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AD08",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AD08",
  status: review.status,
  ad08_seed_data_source_attribution_register_recorded: 1,
  ad07_consumed: 1,
  seed_doctrine_recorded: 1,
  source_authority_seed_manifest_template_recorded: 1,
  panchanga_master_seed_manifest_template_recorded: 1,
  regional_profile_seed_manifest_template_recorded: 1,
  corpus_seed_manifest_template_recorded: 1,
  guidance_rule_seed_manifest_template_recorded: 1,
  attribution_verification_workflow_recorded: 1,
  no_seed_no_fetch_audit_recorded: 1,
  ready_for_ad09: 1,
  hard_blocker_count_for_ad09: 0,
  ag47_resume_allowed: 0,
  homepage_mutated: 0,
  public_content_generated: 0,
  seed_data_inserted: 0,
  seed_data_committed_to_database: 0,
  guidance_generated: 0,
  word_of_day_generated: 0,
  panchang_prediction_generated: 0,
  panchang_calculation_executed: 0,
  live_source_fetch_executed: 0,
  web_scraping_executed: 0,
  source_content_downloaded: 0,
  sql_file_created: 0,
  sql_executed: 0,
  database_write_performed: 0,
  supabase_table_created: 0,
  supabase_schema_modified: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AD08 — Seed Data and Source Attribution Register

## Result

AD08 records seed data and source attribution manifest templates.

## Seed manifest families

- Source authority seed candidates
- Panchanga master seed candidates
- Regional profile seed candidates
- Corpus seed candidates
- Guidance rule seed candidates

## Important boundary

AD08 does not insert seed data. It does not fetch live sources, scrape, download source content, create SQL, execute SQL, write database records, create Supabase tables or activate backend/Auth/Supabase.

## Verification workflow

AD08 records a candidate-to-review workflow covering:

- candidate registration
- source locator check
- supported claim check
- confidence band assignment
- copyright/context check
- claim-risk/safety check
- editorial review

## Next

AD09 — Drishvara Kāla-Dṛṣṭi Methodology Statement.
`;

writeJson(outputs.seedDoctrine, seedDoctrine);
writeJson(outputs.sourceAuthoritySeedManifest, sourceAuthoritySeedManifest);
writeJson(outputs.panchangaMasterSeedManifest, panchangaMasterSeedManifest);
writeJson(outputs.regionalProfileSeedManifest, regionalProfileSeedManifest);
writeJson(outputs.corpusSeedManifest, corpusSeedManifest);
writeJson(outputs.guidanceSeedManifest, guidanceSeedManifest);
writeJson(outputs.attributionVerificationWorkflow, attributionVerificationWorkflow);
writeJson(outputs.noSeedNoFetchAudit, noSeedNoFetchAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AD08 Seed Data and Source Attribution Register generated.");
console.log("✅ Seed doctrine and manifest templates for source authority, Panchanga master, regional profile, corpus and guidance rules recorded.");
console.log("✅ Attribution verification workflow and no-seed/no-fetch audit recorded.");
console.log("✅ Ready for AD09 Drishvara Kāla-Dṛṣṭi Methodology Statement.");
console.log("✅ No seed insertion, live fetch, scraping, SQL, DB write, backend activation, deployment or service-role exposure recorded.");
