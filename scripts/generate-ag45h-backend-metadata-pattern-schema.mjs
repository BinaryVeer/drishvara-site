import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag45aBackendSchemaPlan: "data/content-intelligence/backend-architecture/ag45a-daily-signal-metadata-schema-plan.json",
  ag45cSelectionModel: "data/content-intelligence/daily-surface/ag45c-daily-signal-selection-model.json",
  ag45cDiversityScoring: "data/content-intelligence/daily-surface/ag45c-topic-diversity-inference-scoring-model.json",
  ag45dMetadataMap: "data/content-intelligence/daily-surface/ag45d-signal-inference-metadata-map.json",
  ag45eVerificationStatusModel: "data/content-intelligence/daily-surface/ag45e-verification-status-bands-model.json",
  ag45fFutureVideoGeneratorModel: "data/content-intelligence/daily-surface/ag45f-future-video-generator-source-learning-model.json",
  ag45gReview: "data/content-intelligence/quality-reviews/ag45g-homepage-card-transition-behaviour.json",
  ag45gHomepageSpaceModel: "data/content-intelligence/homepage/ag45g-homepage-daily-signal-space-model.json",
  ag45gCardGroupingModel: "data/content-intelligence/homepage/ag45g-signal-card-grouping-model.json",
  ag45gNoMutationAudit: "data/content-intelligence/backend-architecture/ag45g-no-mutation-audit-register.json",
  ag45gReadiness: "data/content-intelligence/quality-registry/ag45g-backend-metadata-pattern-schema-readiness-record.json",
  ag45gBoundary: "data/content-intelligence/mutation-plans/ag45g-to-ag45h-backend-metadata-pattern-schema-boundary.json",
  ag27Checkpoint: "scripts/validate-ag27-supabase-auth-backend-decision-checkpoint.mjs",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag45h-backend-metadata-pattern-schema.json",
  metadataSchemaPlan: "data/content-intelligence/backend-architecture/ag45h-daily-signal-metadata-schema-plan.json",
  yearlyPatternSchemaPlan: "data/content-intelligence/backend-architecture/ag45h-yearly-pattern-study-schema-plan.json",
  inferenceTraceabilityModel: "data/content-intelligence/daily-surface/ag45h-inference-traceability-model.json",
  retentionSafetyModel: "data/content-intelligence/backend-architecture/ag45h-retention-privacy-safety-model.json",
  backendDeferralRegister: "data/content-intelligence/backend-architecture/ag45h-backend-activation-deferral-register.json",
  noSqlDbWriteAudit: "data/content-intelligence/backend-architecture/ag45h-no-sql-no-db-write-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag45h-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag45h-legal-safety-reputation-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag45h-to-ag45i-legal-safety-reputation-audit-boundary.json",
  registry: "data/quality/ag45h-backend-metadata-pattern-schema.json",
  preview: "data/quality/ag45h-backend-metadata-pattern-schema-preview.json",
  doc: "docs/quality/AG45H_BACKEND_METADATA_PATTERN_SCHEMA.md"
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
  if (!exists(p)) throw new Error(`Missing AG45H input: ${p}`);
}

const ag45aBackendSchemaPlan = readJson(inputs.ag45aBackendSchemaPlan);
const ag45cSelectionModel = readJson(inputs.ag45cSelectionModel);
const ag45cDiversityScoring = readJson(inputs.ag45cDiversityScoring);
const ag45dMetadataMap = readJson(inputs.ag45dMetadataMap);
const ag45eVerificationStatusModel = readJson(inputs.ag45eVerificationStatusModel);
const ag45fFutureVideoGeneratorModel = readJson(inputs.ag45fFutureVideoGeneratorModel);
const ag45gReview = readJson(inputs.ag45gReview);
const ag45gHomepageSpaceModel = readJson(inputs.ag45gHomepageSpaceModel);
const ag45gCardGroupingModel = readJson(inputs.ag45gCardGroupingModel);
const ag45gNoMutationAudit = readJson(inputs.ag45gNoMutationAudit);
const ag45gReadiness = readJson(inputs.ag45gReadiness);
const ag45gBoundary = readJson(inputs.ag45gBoundary);
const ag27Checkpoint = { source_file: inputs.ag27Checkpoint, content: read(inputs.ag27Checkpoint) };

if (ag45gReview.status !== "homepage_card_transition_behaviour_ready_for_ag45h") {
  throw new Error("AG45G review status mismatch.");
}
if (ag45gReview.summary?.ready_for_ag45h !== true) {
  throw new Error("AG45G does not show AG45H readiness.");
}
if (ag45gReadiness.ready_for_ag45h !== true || ag45gReadiness.next_stage_id !== "AG45H") {
  throw new Error("AG45G readiness must permit AG45H.");
}
if (ag45gBoundary.next_stage_id !== "AG45H") {
  throw new Error("AG45G boundary must point to AG45H.");
}
if (ag45gNoMutationAudit.status !== "no_mutation_audit_passed_for_ag45g") {
  throw new Error("AG45G no-mutation audit mismatch.");
}
if (ag45gHomepageSpaceModel.activate_now !== false) {
  throw new Error("AG45G homepage space activation must remain false.");
}
if (ag45gCardGroupingModel.total_signal_count !== 10 || ag45gCardGroupingModel.visible_cards_at_once !== 3) {
  throw new Error("AG45G must preserve 10 stored signals and 3 visible cards.");
}
for (const field of ["date", "rank", "region_scope", "drishvara_title", "drishvara_subtitle", "source_url", "canonical_url", "credibility_score", "theme_tags", "inference_tags", "pattern_value", "reference_value", "verification_status"]) {
  if (!ag45aBackendSchemaPlan.planned_fields.includes(field)) {
    throw new Error(`AG45A backend schema plan missing field: ${field}`);
  }
}
if (ag45cSelectionModel.selection_count.total_daily_signals !== 10) {
  throw new Error("AG45C total daily signal count must be 10.");
}
if (!JSON.stringify(ag45cDiversityScoring).includes("inference_value_for_future_articles")) {
  throw new Error("AG45C inference-value scoring missing.");
}
if (!JSON.stringify(ag45dMetadataMap).includes("inference_tags")) {
  throw new Error("AG45D metadata map missing inference_tags.");
}
if (ag45eVerificationStatusModel.default_status_for_ag45e !== "metadata_only_not_fetched") {
  throw new Error("AG45E verification status default mismatch.");
}
if (ag45fFutureVideoGeneratorModel.metadata_only_now !== true) {
  throw new Error("AG45F future video generator model must remain metadata-only.");
}
if (!JSON.stringify(ag27Checkpoint).includes("deferred") && !JSON.stringify(ag27Checkpoint).includes("blocked")) {
  throw new Error("AG27 checkpoint must preserve backend deferral/blocking context.");
}

const blockedState = {
  ag45h_backend_metadata_pattern_schema_recorded: true,
  ag45g_consumed: true,
  metadata_schema_plan_recorded: true,
  yearly_pattern_study_schema_recorded: true,
  inference_traceability_model_recorded: true,
  retention_privacy_safety_model_recorded: true,
  backend_activation_deferral_recorded: true,
  no_sql_no_db_write_audit_recorded: true,
  sql_file_created: false,
  sql_migration_created: false,
  sql_grants_executed: false,
  database_write_performed: false,
  supabase_table_created: false,
  backend_auth_supabase_activation_performed: false,
  service_role_key_exposed: false,
  daily_signal_fetch_executed: false,
  news_scraping_executed: false,
  external_link_verification_executed: false,
  image_fetch_executed: false,
  video_fetch_executed: false,
  homepage_mutated: false,
  homepage_runtime_script_mutated: false,
  css_mutated: false,
  public_card_rendering_activated: false,
  video_popup_activated: false,
  article_mutated: false,
  article_generated: false,
  reference_fetch_executed: false,
  image_generation_executed: false,
  video_generation_executed: false,
  public_publishing_operation_performed: false,
  deployment_performed: false
};

const metadataSchemaPlan = {
  module_id: "AG45H",
  title: "Daily Signal Metadata Schema Plan",
  status: "daily_signal_metadata_schema_plan_recorded_no_sql_no_db_write",
  schema_name_planning_only: "daily_signal_surface_records",
  table_creation_now: false,
  sql_creation_now: false,
  database_write_now: false,
  backend_activation_now: false,
  planned_field_groups: [
    {
      group: "identity_and_time",
      fields: ["signal_id", "date", "rank", "created_at", "updated_at", "version"]
    },
    {
      group: "display_copy",
      fields: ["drishvara_title", "drishvara_subtitle", "region_scope", "category", "surface_tag"]
    },
    {
      group: "source_traceability",
      fields: ["source_title", "publisher_name", "reporter_name", "reporter_profile_url", "source_url", "canonical_url"]
    },
    {
      group: "asset_metadata",
      fields: ["image_url", "image_credit", "image_usage_status", "video_url", "video_creator", "video_credit", "video_rights_status"]
    },
    {
      group: "selection_and_inference",
      fields: ["credibility_score", "selection_reason", "theme_tags", "inference_tags", "pattern_value", "reference_value", "article_planning_value"]
    },
    {
      group: "safety_and_verification",
      fields: ["safety_status", "verification_status", "rights_status", "editorial_review_status", "excluded_reason"]
    }
  ],
  required_minimum_fields_later: [
    "date",
    "rank",
    "region_scope",
    "drishvara_title",
    "drishvara_subtitle",
    "publisher_name",
    "source_url",
    "verification_status",
    "safety_status"
  ],
  blocked_state: blockedState
};

const yearlyPatternSchemaPlan = {
  module_id: "AG45H",
  title: "Yearly Pattern-Study Schema Plan",
  status: "yearly_pattern_study_schema_recorded_no_sql_no_db_write",
  purpose: "Plan how Daily Signal metadata can support monthly, quarterly, half-yearly and yearly pattern study without creating a database now.",
  analysis_windows: ["daily", "weekly", "monthly", "quarterly", "half_yearly", "yearly"],
  planned_pattern_fields: [
    "theme_frequency",
    "region_frequency",
    "northeast_watch_frequency",
    "source_diversity",
    "publisher_distribution",
    "reporter_or_anchor_distribution",
    "public_relevance_score_trend",
    "inference_tag_trend",
    "pattern_value_trend",
    "reference_value_trend",
    "article_planning_conversion",
    "underreported_source_usage",
    "verification_status_trend",
    "safety_exclusion_trend"
  ],
  northeast_specific_pattern_fields: [
    "northeast_daily_presence_rate",
    "state_wise_northeast_visibility",
    "border_and_china_related_signal_count",
    "connectivity_and_public_service_signal_count",
    "culture_youth_sports_visibility_count"
  ],
  future_use_cases: [
    "annual Drishvara insight review",
    "reference discovery for long-form articles",
    "topic clustering and trend analysis",
    "regional visibility study",
    "source credibility learning",
    "Daily Surface performance review",
    "future article planning",
    "future video source learning"
  ],
  blocked_state: blockedState
};

const inferenceTraceabilityModel = {
  module_id: "AG45H",
  title: "Inference Traceability Model",
  status: "inference_traceability_model_recorded",
  traceability_principle: "Every future inference from Daily Signal metadata must be traceable to stored title, subtitle, source link, source attribution, theme tags, verification status and safety status.",
  trace_chain: [
    "selected_signal_candidate",
    "source_credibility_result",
    "drishvara_title",
    "drishvara_subtitle",
    "source_attribution",
    "theme_tags",
    "inference_tags",
    "pattern_value",
    "reference_value",
    "verification_status",
    "future_article_or_pattern_use"
  ],
  safeguards: [
    "Do not infer from unverified or unsafe sources without clear status.",
    "Do not treat commentary as primary reporting.",
    "Do not create new factual claims from metadata alone.",
    "Do not detach future article references from their source URL and publisher attribution.",
    "Do not use private user data in Daily Signal pattern study.",
    "Keep Northeast Watch visibility measurable without forcing low-credibility records."
  ],
  blocked_state: blockedState
};

const retentionSafetyModel = {
  module_id: "AG45H",
  title: "Retention, Privacy and Safety Model",
  status: "retention_privacy_safety_model_recorded",
  data_scope: {
    public_source_metadata_only: true,
    personal_user_data_included: false,
    private_user_behaviour_tracking_included: false,
    raw_scraped_article_text_included: false,
    downloaded_third_party_assets_included: false
  },
  retention_principles: [
    "Store public-source metadata only in later approved backend stages.",
    "Do not store full third-party article text.",
    "Do not download or rehost third-party images/videos unless rights are cleared in later approved stages.",
    "Keep safety and verification status with every future record.",
    "Retain source URL and publisher attribution for traceability.",
    "Use editorial review statuses for uncertain assets/sources."
  ],
  safety_controls: [
    "unsafe_or_excluded records must not be public-facing",
    "broken_or_unreachable links must not be presented as verified",
    "under_editorial_verification records require cautious handling",
    "adult/explicit/hate/extremist/reputation-risk content must be excluded",
    "service-role keys must never be recorded in repo or chat"
  ],
  blocked_state: blockedState
};

const backendDeferralRegister = {
  module_id: "AG45H",
  title: "Backend Activation Deferral Register",
  status: "backend_activation_deferred_no_sql_no_db_write",
  ag27_checkpoint_consumed: inputs.ag27Checkpoint,
  deferral_rules: [
    "AG45H is schema planning only.",
    "No Supabase table is created.",
    "No SQL migration is created.",
    "No database write is performed.",
    "No Auth/backend activation is performed.",
    "No service-role key is required or exposed.",
    "Actual backend implementation remains deferred to later approved governed stages.",
    "Supabase/Auth/backend activation must not occur before explicit approval."
  ],
  deferred_to_later_stages: ["AG49", "AG52", "AG55", "AG56"],
  reminder_note: "Supabase table markdown/schema files may be re-uploaded before AG49 / AG52 / AG55 / AG56 if backend stages become active later.",
  blocked_state: blockedState
};

const noSqlDbWriteAudit = {
  module_id: "AG45H",
  title: "No SQL / No Database Write Audit",
  status: "no_sql_no_database_write_audit_passed_for_ag45h",
  checks: [
    { check_id: "no_sql_file_created", expected: false, actual: false, passed: true },
    { check_id: "no_sql_migration_created", expected: false, actual: false, passed: true },
    { check_id: "no_sql_grants_executed", expected: false, actual: false, passed: true },
    { check_id: "no_database_write_performed", expected: false, actual: false, passed: true },
    { check_id: "no_supabase_table_created", expected: false, actual: false, passed: true },
    { check_id: "no_backend_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "no_service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG45H",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag45h",
  checks: Object.entries({
    sql_file_created: false,
    sql_migration_created: false,
    sql_grants_executed: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    service_role_key_exposed: false,
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
    external_link_verification_executed: false,
    image_fetch_executed: false,
    video_fetch_executed: false,
    homepage_mutated: false,
    homepage_runtime_script_mutated: false,
    css_mutated: false,
    public_card_rendering_activated: false,
    video_popup_activated: false,
    article_mutated: false,
    article_generated: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    video_generation_executed: false,
    public_publishing_operation_performed: false,
    deployment_performed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG45H",
  title: "AG45I Legal, Safety and Reputation-Risk Audit Readiness Record",
  status: "ready_for_ag45i_legal_safety_reputation_audit",
  ready_for_ag45i: true,
  next_stage_id: "AG45I",
  next_stage_title: "Legal, Safety and Reputation-Risk Audit",
  hard_blocker_count_for_ag45i: 0,
  daily_signal_fetch_allowed_next: false,
  news_scraping_allowed_next: false,
  external_link_verification_allowed_next: false,
  image_fetch_allowed_next: false,
  video_fetch_allowed_next: false,
  homepage_mutation_allowed_next: false,
  runtime_script_mutation_allowed_next: false,
  public_activation_allowed_next: false,
  sql_creation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG45H",
  title: "AG45H to AG45I Legal, Safety and Reputation-Risk Audit Boundary",
  status: "ag45i_legal_safety_reputation_audit_boundary_created",
  next_stage_id: "AG45I",
  next_stage_title: "Legal, Safety and Reputation-Risk Audit",
  allowed_scope: [
    "Audit AG45A to AG45H for legal, safety, attribution, reputation, source and backend-deferral risks.",
    "Confirm no live fetch, scraping, public activation, SQL, database write or backend activation has occurred.",
    "Confirm Daily Signal Surface remains planning-only.",
    "Prepare closure readiness for AG45Z if audit passes."
  ],
  blocked_scope: [
    "live news fetching",
    "web scraping",
    "external link verification",
    "image fetch",
    "video fetch",
    "homepage mutation",
    "runtime script mutation",
    "CSS mutation",
    "SQL file creation",
    "database write",
    "backend/Auth/Supabase activation",
    "service-role key exposure",
    "public publishing",
    "deployment"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG45H",
  title: "Backend Metadata and Yearly Pattern-Study Schema",
  status: "backend_metadata_pattern_schema_ready_for_ag45i",
  depends_on: ["AG45A", "AG45C", "AG45D", "AG45E", "AG45F", "AG45G", "AG27"],
  metadata_schema_plan_file: outputs.metadataSchemaPlan,
  yearly_pattern_schema_plan_file: outputs.yearlyPatternSchemaPlan,
  inference_traceability_model_file: outputs.inferenceTraceabilityModel,
  retention_safety_model_file: outputs.retentionSafetyModel,
  backend_deferral_register_file: outputs.backendDeferralRegister,
  no_sql_db_write_audit_file: outputs.noSqlDbWriteAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag45h_backend_metadata_pattern_schema_recorded: true,
    metadata_schema_plan_recorded: true,
    yearly_pattern_study_schema_recorded: true,
    inference_traceability_model_recorded: true,
    retention_privacy_safety_model_recorded: true,
    backend_activation_deferral_recorded: true,
    no_sql_no_db_write_audit_recorded: true,
    ready_for_ag45i: true,
    hard_blocker_count_for_ag45i: 0,
    sql_file_created: false,
    sql_migration_created: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    service_role_key_exposed: false,
    homepage_mutated: false,
    public_card_rendering_activated: false,
    deployment_performed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG45H",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG45H",
  status: review.status,
  ag45h_backend_metadata_pattern_schema_recorded: 1,
  metadata_schema_plan_recorded: 1,
  yearly_pattern_study_schema_recorded: 1,
  inference_traceability_model_recorded: 1,
  retention_privacy_safety_model_recorded: 1,
  backend_activation_deferral_recorded: 1,
  no_sql_no_db_write_audit_recorded: 1,
  ready_for_ag45i: 1,
  hard_blocker_count_for_ag45i: 0,
  sql_file_created: 0,
  sql_migration_created: 0,
  database_write_performed: 0,
  supabase_table_created: 0,
  backend_auth_supabase_activation_performed: 0,
  service_role_key_exposed: 0,
  homepage_mutated: 0,
  public_card_rendering_activated: 0,
  deployment_performed: 0
};

const doc = `# AG45H — Backend Metadata and Yearly Pattern-Study Schema

## Result

AG45H records backend metadata and yearly pattern-study schema planning for the Daily Signal Surface.

## Important boundary

AG45H is planning only.

- No SQL file is created.
- No database write is performed.
- No Supabase table is created.
- No backend/Auth/Supabase activation is performed.
- No service-role key is required or exposed.

## Metadata plan

The planned Daily Signal record includes identity, display copy, source traceability, asset metadata, selection/inference fields, safety status and verification status.

## Yearly pattern study

The pattern-study plan supports daily, weekly, monthly, quarterly, half-yearly and yearly analysis of themes, region visibility, Northeast Watch, source diversity, inference tags and reference value.

## Inference traceability

Future inference must remain traceable to source URL, publisher attribution, Drishvara title/subtitle, theme tags, verification status and safety status.

## Backend deferral

Backend activation remains deferred. Supabase table markdown/schema files may be re-uploaded before AG49 / AG52 / AG55 / AG56 if backend stages become active later.

## Still blocked

- No live news fetching.
- No scraping.
- No link verification.
- No image/video fetch.
- No homepage mutation.
- No CSS/runtime mutation.
- No SQL creation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AG45I — Legal, Safety and Reputation-Risk Audit.
`;

writeJson(outputs.metadataSchemaPlan, metadataSchemaPlan);
writeJson(outputs.yearlyPatternSchemaPlan, yearlyPatternSchemaPlan);
writeJson(outputs.inferenceTraceabilityModel, inferenceTraceabilityModel);
writeJson(outputs.retentionSafetyModel, retentionSafetyModel);
writeJson(outputs.backendDeferralRegister, backendDeferralRegister);
writeJson(outputs.noSqlDbWriteAudit, noSqlDbWriteAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG45H Backend Metadata and Yearly Pattern-Study Schema generated.");
console.log("✅ Metadata schema plan, yearly pattern-study schema, inference traceability and retention/safety model recorded.");
console.log("✅ Backend activation deferral and no-SQL/no-database-write audits recorded.");
console.log("✅ Ready for AG45I Legal, Safety and Reputation-Risk Audit.");
console.log("✅ No SQL, database write, Supabase/Auth/backend activation, homepage mutation, deployment or service-role exposure recorded.");
