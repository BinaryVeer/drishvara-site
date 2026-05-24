import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag16a-public-visibility-publish-control-preparation.json",
  "data/content-intelligence/content-pipeline/ag16a-public-visibility-state-model.json",
  "data/content-intelligence/content-pipeline/ag16a-publish-control-state-model.json",
  "data/content-intelligence/content-pipeline/ag16a-featured-reads-public-filter-plan.json",
  "data/content-intelligence/content-pipeline/ag16a-archive-internal-intelligence-plan.json",
  "data/content-intelligence/quality-registry/ag16a-public-visibility-publish-control-schema-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16a-to-ag16b-public-visibility-publish-filter-schema-plan-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag16b-public-visibility-publish-filter-schema-plan.json",
  "data/content-intelligence/content-pipeline/ag16b-public-visibility-field-schema-plan.json",
  "data/content-intelligence/content-pipeline/ag16b-publish-control-field-schema-plan.json",
  "data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json",
  "data/content-intelligence/content-pipeline/ag16b-public-surface-exclusion-contract.json",
  "data/content-intelligence/content-pipeline/ag16b-public-visibility-filter-validation-plan.json",
  "data/content-intelligence/quality-registry/ag16b-public-visibility-filter-schema-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16b-to-ag16c-public-visibility-filter-schema-dry-run-boundary.json",
  "data/content-intelligence/schema/public-visibility-publish-filter-schema-plan.schema.json",
  "data/content-intelligence/learning/ag16b-public-visibility-publish-filter-schema-plan-learning.json",
  "data/quality/ag16b-public-visibility-publish-filter-schema-plan.json",
  "data/quality/ag16b-public-visibility-publish-filter-schema-plan-preview.json",
  "docs/quality/AG16B_PUBLIC_VISIBILITY_PUBLISH_FILTER_SCHEMA_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG16B validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag16aReview = readJson("data/content-intelligence/quality-reviews/ag16a-public-visibility-publish-control-preparation.json");
const ag16aReadiness = readJson("data/content-intelligence/quality-registry/ag16a-public-visibility-publish-control-schema-readiness-record.json");
const ag16aBoundary = readJson("data/content-intelligence/mutation-plans/ag16a-to-ag16b-public-visibility-publish-filter-schema-plan-boundary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag16b-public-visibility-publish-filter-schema-plan.json");
const visibilitySchema = readJson("data/content-intelligence/content-pipeline/ag16b-public-visibility-field-schema-plan.json");
const publishSchema = readJson("data/content-intelligence/content-pipeline/ag16b-publish-control-field-schema-plan.json");
const filterContract = readJson("data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json");
const exclusionContract = readJson("data/content-intelligence/content-pipeline/ag16b-public-surface-exclusion-contract.json");
const validationPlan = readJson("data/content-intelligence/content-pipeline/ag16b-public-visibility-filter-validation-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag16b-public-visibility-filter-schema-dry-run-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag16b-to-ag16c-public-visibility-filter-schema-dry-run-boundary.json");
const schema = readJson("data/content-intelligence/schema/public-visibility-publish-filter-schema-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag16b-public-visibility-publish-filter-schema-plan-learning.json");
const registry = readJson("data/quality/ag16b-public-visibility-publish-filter-schema-plan.json");
const preview = readJson("data/quality/ag16b-public-visibility-publish-filter-schema-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG16B_PUBLIC_VISIBILITY_PUBLISH_FILTER_SCHEMA_PLAN.md"), "utf8");

for (const obj of [review, visibilitySchema, publishSchema, filterContract, exclusionContract, validationPlan, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG16B") fail(`module_id must be AG16B in ${obj.title || "object"}`);
}

if (ag16aReview.status !== "public_visibility_publish_control_preparation_defined") fail("AG16A review status mismatch");
if (ag16aReadiness.ready_for_ag16b !== true) fail("AG16A readiness for AG16B missing");
if (ag16aBoundary.next_stage_id !== "AG16B") fail("AG16B boundary missing in AG16A");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "public_visibility_publish_filter_schema_plan_defined") fail("Review status mismatch");
if (visibilitySchema.status !== "public_visibility_field_schema_plan_defined") fail("Visibility field schema status mismatch");
if (publishSchema.status !== "publish_control_field_schema_plan_defined") fail("Publish field schema status mismatch");
if (filterContract.status !== "public_surface_filter_contract_defined") fail("Filter contract status mismatch");
if (exclusionContract.status !== "public_surface_exclusion_contract_defined") fail("Exclusion contract status mismatch");
if (validationPlan.status !== "public_visibility_filter_validation_plan_defined") fail("Validation plan status mismatch");
if (readiness.status !== "ready_for_ag16c_public_visibility_filter_schema_dry_run") fail("Readiness status mismatch");

for (const field of ["public_visibility", "publish_approved", "public_index_allowed", "featured_reads_allowed", "approved_hash"]) {
  if (!visibilitySchema.required_fields.some((item) => item.field === field && item.required === true)) {
    fail(`Missing required visibility field: ${field}`);
  }
}
if (!visibilitySchema.invariant_rules.includes("public_visibility defaults to false.")) fail("public_visibility default invariant missing");
if (!visibilitySchema.invariant_rules.includes("publish_approved defaults to false.")) fail("publish_approved default invariant missing");

for (const field of ["admin_decision_status", "quality_evidence_status", "preview_status", "hash_integrity_status", "publish_approved", "publish_execution_status"]) {
  if (!publishSchema.required_fields.some((item) => item.field === field && item.required === true)) {
    fail(`Missing required publish-control field: ${field}`);
  }
}
if (publishSchema.publish_approval_rule.public_visibility_still_requires_separate_switch !== true) {
  fail("Publish approval must still require separate visibility switch");
}

for (const rule of [
  "record.public_visibility === true",
  "record.publish_approved === true",
  "record.public_index_allowed === true",
  "record.article_hash === record.approved_hash"
]) {
  if (!filterContract.include_contract.include_article_only_if_all_true.includes(rule)) fail(`Missing include rule: ${rule}`);
}
for (const rule of [
  "record.public_visibility !== true",
  "record.publish_approved !== true",
  "record.public_index_allowed !== true"
]) {
  if (!filterContract.exclude_contract.exclude_article_if_any_true.includes(rule)) fail(`Missing exclude rule: ${rule}`);
}

for (const status of ["internal_generated", "ready_for_admin_review", "returned_for_correction", "archived_internal", "publish_approved_pending_exposure"]) {
  const state = exclusionContract.excluded_states.find((item) => item.status === status);
  if (!state) fail(`Missing excluded state: ${status}`);
  if (state.public_exposure_allowed !== false) fail(`${status} must block public exposure`);
}
const pendingExposure = exclusionContract.excluded_states.find((item) => item.status === "publish_approved_pending_exposure");
if (pendingExposure.public_visibility !== false || pendingExposure.publish_approved !== true) {
  fail("publish_approved_pending_exposure must be approved but still non-public");
}

for (const check of [
  "public_visibility defaults to false.",
  "publish_approved defaults to false.",
  "Only public_published and published_closed may pass public filter.",
  "ready_for_admin_review must fail public filter.",
  "archived_internal must fail public filter.",
  "Article hash must match approved_hash before public exposure."
]) {
  if (!validationPlan.planned_validation_checks.includes(check)) fail(`Missing validation check: ${check}`);
}
if (validationPlan.dry_run_seed.expected_public_filter_result_for_seed_candidate_now !== false) {
  fail("Seed candidate must be expected to fail public filter now");
}

if (readiness.ready_for_ag16c !== true) fail("AG16C readiness missing");
if (readiness.active_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag16c_boundary_created_not_started") fail("AG16C boundary status mismatch");
if (boundary.next_stage_id !== "AG16C") fail("AG16C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG16C explicit approval missing");

if (schema.status !== "schema_public_visibility_publish_filter_schema_plan_only") fail("Schema status mismatch");

for (const key of [
  "visibility_field_schema_plan_allowed_in_ag16b",
  "publish_control_field_schema_plan_allowed_in_ag16b",
  "public_surface_filter_contract_allowed_in_ag16b",
  "public_surface_exclusion_contract_allowed_in_ag16b",
  "validation_plan_allowed_in_ag16b",
  "ag16c_boundary_allowed_in_ag16b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag16b",
  "article_mutation_allowed_in_ag16b",
  "queue_mutation_allowed_in_ag16b",
  "active_admin_review_queue_record_creation_allowed_in_ag16b",
  "queue_index_mutation_allowed_in_ag16b",
  "admin_action_execution_allowed_in_ag16b",
  "editor_action_execution_allowed_in_ag16b",
  "auth_activation_allowed_in_ag16b",
  "backend_activation_allowed_in_ag16b",
  "supabase_activation_allowed_in_ag16b",
  "github_write_operation_allowed_in_ag16b",
  "public_visibility_switch_allowed_in_ag16b",
  "public_index_mutation_allowed_in_ag16b",
  "public_publishing_operation_allowed_in_ag16b",
  "deployment_trigger_allowed_in_ag16b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, visibilitySchema, publishSchema, filterContract, exclusionContract, validationPlan, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.public_visibility_publish_filter_schema_plan_only !== true) fail(`${obj.title || "object"} must be AG16B schema-plan only`);
  if (obj.article_generation_performed_in_ag16b !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag16b !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.queue_mutation_performed_in_ag16b !== false) fail(`${obj.title || "object"} must not mutate queues`);
  if (obj.public_visibility_switch_performed_in_ag16b !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag16b !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.public_publishing_operation_performed_in_ag16b !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Public Exposure Contract", "Planned Outputs", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG16B document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag16b", "validate:ag16b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag16b")) {
  fail("validate:project must include validate:ag16b");
}

pass("AG16B registry is present.");
pass("AG16B document is present.");
pass("AG16B review, visibility field schema, publish-control field schema, public filter contract, exclusion contract, validation plan, readiness, AG16C boundary, schema, learning and preview are present.");
pass("AG16A public visibility and publish-control doctrine is consumed.");
pass("Public exposure contract requires public_visibility=true and publish_approved=true.");
pass("Pre-publication, returned, archived and pending-exposure states are excluded from public surfaces.");
pass("Seed candidate is expected to fail public filter until later approved and exposed.");
pass("AG16C public visibility filter schema dry-run boundary is created with explicit approval required.");
pass("No article generation, article mutation, queue mutation, visibility switch, public index mutation or publishing is performed.");
pass("AG16B is Public Visibility and Publish Filter Schema Plan only.");
