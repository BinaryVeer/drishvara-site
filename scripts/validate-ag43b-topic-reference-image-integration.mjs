import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function read(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(msg) { console.error(`❌ AG43B validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag43a-article-intelligence-integration-entry.json",
  "data/content-intelligence/backend-architecture/ag43a-content-intelligence-consumption-map.json",
  "data/content-intelligence/backend-architecture/ag43a-topic-engine-consumption-map.json",
  "data/content-intelligence/backend-architecture/ag43a-article-quality-consumption-map.json",
  "data/content-intelligence/backend-architecture/ag43a-integration-gap-register.json",
  "data/content-intelligence/backend-architecture/ag43a-no-duplicate-audit-register.json",
  "data/content-intelligence/quality-registry/ag43a-topic-reference-image-integration-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag43a-to-ag43b-topic-reference-image-integration-boundary.json",
  "data/content-intelligence/homepage/ag23g-topic-score-fields.json",
  "data/content-intelligence/homepage/ag23g-topic-score-thresholds.json",
  "scripts/article-quality-review-preflight.js",
  "scripts/validate-ag06b-content-intelligence-schema.mjs",

  "data/content-intelligence/quality-reviews/ag43b-topic-reference-image-integration.json",
  "data/content-intelligence/backend-architecture/ag43b-topic-reference-image-governance-integration.json",
  "data/content-intelligence/backend-architecture/ag43b-topic-reference-image-readiness-matrix.json",
  "data/content-intelligence/backend-architecture/ag43b-reference-governance-integration-model.json",
  "data/content-intelligence/backend-architecture/ag43b-image-visual-governance-integration-model.json",
  "data/content-intelligence/backend-architecture/ag43b-combined-readiness-threshold-model.json",
  "data/content-intelligence/backend-architecture/ag43b-topic-reference-image-exception-register.json",
  "data/content-intelligence/backend-architecture/ag43b-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag43b-topic-reference-image-integration-blocker-register.json",
  "data/content-intelligence/quality-registry/ag43b-quality-longform-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag43b-to-ag43c-quality-longform-readiness-boundary.json",
  "data/quality/ag43b-topic-reference-image-integration.json",
  "data/quality/ag43b-topic-reference-image-integration-preview.json",
  "docs/quality/AG43B_TOPIC_REFERENCE_IMAGE_INTEGRATION.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag43a = readJson("data/content-intelligence/backend-architecture/ag43a-article-intelligence-integration-entry.json");
const ag43aNoDuplicate = readJson("data/content-intelligence/backend-architecture/ag43a-no-duplicate-audit-register.json");
const ag43aReadiness = readJson("data/content-intelligence/quality-registry/ag43a-topic-reference-image-integration-readiness-record.json");
const ag43aBoundary = readJson("data/content-intelligence/mutation-plans/ag43a-to-ag43b-topic-reference-image-integration-boundary.json");

const integration = readJson("data/content-intelligence/backend-architecture/ag43b-topic-reference-image-governance-integration.json");
const matrix = readJson("data/content-intelligence/backend-architecture/ag43b-topic-reference-image-readiness-matrix.json");
const reference = readJson("data/content-intelligence/backend-architecture/ag43b-reference-governance-integration-model.json");
const image = readJson("data/content-intelligence/backend-architecture/ag43b-image-visual-governance-integration-model.json");
const threshold = readJson("data/content-intelligence/backend-architecture/ag43b-combined-readiness-threshold-model.json");
const exceptions = readJson("data/content-intelligence/backend-architecture/ag43b-topic-reference-image-exception-register.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag43b-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag43b-quality-longform-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag43b-to-ag43c-quality-longform-readiness-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag43b-topic-reference-image-integration.json");
const preview = readJson("data/quality/ag43b-topic-reference-image-integration-preview.json");
const pkg = readJson("package.json");

const ag23gFields = readJson("data/content-intelligence/homepage/ag23g-topic-score-fields.json");
const ag23gThresholds = readJson("data/content-intelligence/homepage/ag23g-topic-score-thresholds.json");
const articleQuality = read("scripts/article-quality-review-preflight.js");
const ag06b = read("scripts/validate-ag06b-content-intelligence-schema.mjs");

const fieldText = JSON.stringify(ag23gFields).toLowerCase();
const thresholdText = JSON.stringify(ag23gThresholds).toLowerCase();

if (ag43a.status !== "article_intelligence_integration_entry_created_ready_for_ag43b_topic_reference_image_integration") fail("AG43A source mismatch.");
if (ag43aNoDuplicate.audit_passed !== true) fail("AG43A no-duplicate audit must pass.");
if (ag43aReadiness.ready_for_ag43b !== true) fail("AG43A readiness must allow AG43B.");
if (ag43aBoundary.next_stage_id !== "AG43B") fail("AG43A boundary must point to AG43B.");

for (const signal of ["reference", "visual", "sensitivity", "repetition"]) {
  if (!fieldText.includes(signal)) fail(`AG23G topic field signal missing: ${signal}`);
}
if (!thresholdText.includes("25") || !thresholdText.includes("18")) fail("AG23G 25/18 threshold bands missing.");
if (!articleQuality.includes("source_reference_status")) fail("source_reference_status logic missing.");
if (!articleQuality.includes("image_approval_status")) fail("image_approval_status logic missing.");
if (!articleQuality.includes("quality_score")) fail("quality_score logic missing.");
if (!ag06b.includes("reference") || !ag06b.includes("visual")) fail("AG06B reference/visual logic missing.");

if (integration.status !== "topic_reference_image_integration_created_ready_for_ag43c_quality_longform_readiness") fail("Integration status mismatch.");
if (integration.integration_decision.topic_reference_image_integration_created !== true) fail("Integration creation missing.");
if (integration.integration_decision.proceed_to_ag43c_quality_longform_readiness !== true) fail("AG43C readiness missing.");

for (const flag of [
  "topic_promoted_to_live_article",
  "topic_bank_mutated",
  "article_generated",
  "article_file_created_or_changed",
  "article_quality_runtime_executed",
  "reference_fetch_executed",
  "reference_url_changed",
  "image_generation_executed",
  "image_file_created_or_changed",
  "visual_registry_mutated",
  "reference_registry_mutated",
  "featured_reads_mutated",
  "homepage_mutated",
  "listing_mutated",
  "first_controlled_batch_executed",
  "batch_execution_authorized_now",
  "candidate_selected_for_execution",
  "real_publish_executed",
  "database_write_done",
  "audit_log_write_done",
  "rollback_write_done",
  "public_article_mutated",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "backend_activation_approved_now",
  "supabase_activation_approved_now",
  "auth_activation_approved_now",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "anon_access_granted",
  "sql_file_created",
  "sql_grants_executed"
]) {
  if (integration.integration_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (matrix.status !== "topic_reference_image_readiness_matrix_created") fail("Readiness matrix status mismatch.");
for (const dimension of ["topic_score_band", "reference_availability", "image_visual_readiness", "sensitivity_repetition_risk"]) {
  if (!matrix.matrix_dimensions.some((item) => item.dimension === dimension && item.runtime_mutation === false)) {
    fail(`Matrix dimension missing or mutating: ${dimension}`);
  }
}

if (reference.status !== "reference_governance_integration_model_created_no_fetch") fail("Reference model status mismatch.");
if (reference.no_live_fetch !== true) fail("Reference model must block live fetch.");
if (reference.reference_registry_mutated_in_ag43b !== false) fail("Reference registry must not mutate.");
for (const state of ["verified_available", "needs_verification", "insufficient", "editorial_verification_required"]) {
  if (!reference.reference_states.some((item) => item.state === state && item.fetch_executed_in_ag43b === false)) {
    fail(`Reference state missing or fetch allowed: ${state}`);
  }
}

if (image.status !== "image_visual_governance_integration_model_created_no_generation") fail("Image model status mismatch.");
if (image.no_image_generation !== true) fail("Image generation must be blocked.");
if (image.visual_registry_mutated_in_ag43b !== false) fail("Visual registry must not mutate.");
for (const state of ["approved_with_credit", "needs_credit", "needs_replacement", "not_required"]) {
  if (!image.image_visual_states.some((item) => item.state === state && item.image_generated_in_ag43b === false)) {
    fail(`Image state missing or generation allowed: ${state}`);
  }
}

if (threshold.status !== "combined_readiness_threshold_model_created") fail("Combined threshold model status mismatch.");
for (const level of ["strong_candidate_ready_for_quality_longform_review", "topic_bank_or_first_light_only", "hold_or_archive", "blocked_by_risk"]) {
  if (!threshold.decision_levels.some((item) => item.level === level && item.article_generation_allowed === false)) {
    fail(`Threshold level missing or article generation allowed: ${level}`);
  }
}
if (threshold.no_article_generation_in_ag43b !== true) fail("No article generation flag missing.");

if (exceptions.status !== "topic_reference_image_exception_register_created") fail("Exception register status mismatch.");
if (exceptions.hard_blocker_count_for_ag43c !== 0) fail("Hard blocker count for AG43C must be 0.");
if (!exceptions.exceptions.some((item) => item.exception_id === "ag43b_e03")) fail("Topic promotion boundary exception missing.");

if (noMutation.audit_passed !== true) fail("No-mutation audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag43c !== true) fail("AG43C readiness missing.");
if (readiness.next_stage_id !== "AG43C") fail("Next stage must be AG43C.");
if (readiness.hard_blocker_count_for_ag43c !== 0) fail("Readiness hard blocker count must be 0.");
if (readiness.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("AG56 deferral must remain.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG43C") fail("Boundary must point to AG43C.");
if (review.summary.ready_for_ag43c !== true) fail("Review AG43C readiness missing.");
if (review.summary.hard_blocker_count_for_ag43c !== 0) fail("Review hard blocker count must be 0.");
if (preview.ready_for_ag43c !== 1) fail("Preview AG43C readiness missing.");
if (preview.first_controlled_dynamic_content_loop_deferred_to_ag56 !== 1) fail("Preview AG56 deferral missing.");
if (preview.topic_promoted_to_live_article !== 0) fail("Preview topic promotion must be 0.");
if (preview.article_generated !== 0) fail("Preview article generated must be 0.");
if (preview.reference_fetch_executed !== 0) fail("Preview reference fetch must be 0.");
if (preview.image_generation_executed !== 0) fail("Preview image generation must be 0.");
if (preview.reference_registry_mutated !== 0) fail("Preview reference registry mutation must be 0.");
if (preview.visual_registry_mutated !== 0) fail("Preview visual registry mutation must be 0.");
if (preview.featured_reads_mutated !== 0) fail("Preview Featured Reads mutation must be 0.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.backend_activation_approved_now !== 0) fail("Preview backend activation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag43b"]) fail("Missing generate:ag43b script.");
if (!pkg.scripts?.["validate:ag43b"]) fail("Missing validate:ag43b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag43b")) fail("validate:project must include validate:ag43b.");

pass("AG43B Topic, Reference and Image Governance Integration is present.");
pass("Topic score, reference availability and image/visual readiness integration models are valid.");
pass("Combined readiness threshold model and exception register are valid.");
pass("No-mutation audit is valid.");
pass("AG43C Quality and Long-form Readiness Integration readiness is valid.");
pass("No article generation, reference fetch, image generation, public mutation, database write, deployment, SQL grant execution or service-role key is recorded.");
