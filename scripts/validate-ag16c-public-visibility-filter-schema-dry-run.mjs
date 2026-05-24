import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag16b-public-visibility-publish-filter-schema-plan.json",
  "data/content-intelligence/content-pipeline/ag16b-public-visibility-field-schema-plan.json",
  "data/content-intelligence/content-pipeline/ag16b-publish-control-field-schema-plan.json",
  "data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json",
  "data/content-intelligence/content-pipeline/ag16b-public-surface-exclusion-contract.json",
  "data/content-intelligence/content-pipeline/ag16b-public-visibility-filter-validation-plan.json",
  "data/content-intelligence/quality-registry/ag16b-public-visibility-filter-schema-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16b-to-ag16c-public-visibility-filter-schema-dry-run-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag16c-public-visibility-filter-schema-dry-run.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag16c-seed-candidate-public-filter-dry-run.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag16c-public-visibility-state-matrix-dry-run.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag16c-hypothetical-public-published-shape-dry-run.json",
  "data/content-intelligence/audit-records/ag16c-public-visibility-filter-schema-dry-run-validation-report.json",
  "data/content-intelligence/quality-registry/ag16c-public-visibility-filter-schema-dry-run-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16c-to-ag16d-public-visibility-filter-schema-dry-run-audit-boundary.json",
  "data/content-intelligence/schema/public-visibility-filter-schema-dry-run.schema.json",
  "data/content-intelligence/learning/ag16c-public-visibility-filter-schema-dry-run-learning.json",
  "data/quality/ag16c-public-visibility-filter-schema-dry-run.json",
  "data/quality/ag16c-public-visibility-filter-schema-dry-run-preview.json",
  "docs/quality/AG16C_PUBLIC_VISIBILITY_FILTER_SCHEMA_DRY_RUN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG16C validation failed: ${message}`);
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

const ag16bReview = readJson("data/content-intelligence/quality-reviews/ag16b-public-visibility-publish-filter-schema-plan.json");
const ag16bReadiness = readJson("data/content-intelligence/quality-registry/ag16b-public-visibility-filter-schema-dry-run-readiness-record.json");
const ag16bBoundary = readJson("data/content-intelligence/mutation-plans/ag16b-to-ag16c-public-visibility-filter-schema-dry-run-boundary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag16c-public-visibility-filter-schema-dry-run.json");
const seedDryRun = readJson("data/content-intelligence/content-pipeline/dry-runs/ag16c-seed-candidate-public-filter-dry-run.json");
const stateMatrix = readJson("data/content-intelligence/content-pipeline/dry-runs/ag16c-public-visibility-state-matrix-dry-run.json");
const publicPass = readJson("data/content-intelligence/content-pipeline/dry-runs/ag16c-hypothetical-public-published-shape-dry-run.json");
const validationReport = readJson("data/content-intelligence/audit-records/ag16c-public-visibility-filter-schema-dry-run-validation-report.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag16c-public-visibility-filter-schema-dry-run-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag16c-to-ag16d-public-visibility-filter-schema-dry-run-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/public-visibility-filter-schema-dry-run.schema.json");
const learning = readJson("data/content-intelligence/learning/ag16c-public-visibility-filter-schema-dry-run-learning.json");
const registry = readJson("data/quality/ag16c-public-visibility-filter-schema-dry-run.json");
const preview = readJson("data/quality/ag16c-public-visibility-filter-schema-dry-run-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG16C_PUBLIC_VISIBILITY_FILTER_SCHEMA_DRY_RUN.md"), "utf8");

for (const obj of [review, seedDryRun, stateMatrix, publicPass, validationReport, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG16C") fail(`module_id must be AG16C in ${obj.title || "object"}`);
}

if (ag16bReview.status !== "public_visibility_publish_filter_schema_plan_defined") fail("AG16B review status mismatch");
if (ag16bReadiness.ready_for_ag16c !== true) fail("AG16B readiness for AG16C missing");
if (ag16bBoundary.next_stage_id !== "AG16C") fail("AG16C boundary missing in AG16B");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "public_visibility_filter_schema_dry_run_passed") fail("Review status mismatch");
if (seedDryRun.status !== "seed_candidate_public_filter_dry_run_failed_as_expected") fail("Seed dry-run status mismatch");
if (stateMatrix.status !== "public_visibility_state_matrix_dry_run_passed") fail("State matrix status mismatch");
if (publicPass.status !== "hypothetical_public_published_shape_dry_run_passed") fail("Public pass shape status mismatch");
if (validationReport.status !== "public_visibility_filter_schema_dry_run_validation_passed") fail("Validation report status mismatch");
if (readiness.status !== "ready_for_ag16d_public_visibility_filter_schema_dry_run_audit") fail("Readiness status mismatch");

if (seedDryRun.expected_public_filter_result !== false) fail("Seed candidate expected public filter result must be false");
if (seedDryRun.actual_public_filter_result !== false) fail("Seed candidate actual public filter result must be false");
if (seedDryRun.dry_run_passed !== true) fail("Seed dry-run must pass by failing public filter as expected");
if (seedDryRun.record_under_test.public_visibility !== false) fail("Seed public_visibility must be false");
if (seedDryRun.record_under_test.publish_approved !== false) fail("Seed publish_approved must be false");

if (!Array.isArray(stateMatrix.matrix_rows) || stateMatrix.matrix_rows.length !== 10) fail("State matrix must include ten dry-run rows");
if (stateMatrix.failed_rows.length !== 0) fail("State matrix failed rows must be zero");

for (const label of [
  "internal_generated_fails",
  "ready_for_admin_review_fails",
  "returned_for_correction_fails",
  "archived_internal_fails",
  "publish_approved_pending_exposure_fails",
  "visibility_without_publish_approval_fails",
  "publish_approval_without_public_index_fails",
  "hash_mismatch_fails"
]) {
  const row = stateMatrix.matrix_rows.find((item) => item.label === label);
  if (!row) fail(`Missing state matrix row: ${label}`);
  if (row.expected_public_filter_result !== false) fail(`${label} expected result must be false`);
  if (row.actual_public_filter_result !== false) fail(`${label} actual result must be false`);
  if (row.dry_run_passed !== true) fail(`${label} dry-run must pass`);
}

for (const label of ["public_published_passes", "published_closed_passes"]) {
  const row = stateMatrix.matrix_rows.find((item) => item.label === label);
  if (!row) fail(`Missing state matrix row: ${label}`);
  if (row.expected_public_filter_result !== true) fail(`${label} expected result must be true`);
  if (row.actual_public_filter_result !== true) fail(`${label} actual result must be true`);
  if (row.record.public_visibility !== true) fail(`${label} requires public_visibility true`);
  if (row.record.publish_approved !== true) fail(`${label} requires publish_approved true`);
  if (row.dry_run_passed !== true) fail(`${label} dry-run must pass`);
}

if (publicPass.expected_public_filter_result !== true) fail("Hypothetical public shape expected result must be true");
if (publicPass.actual_public_filter_result !== true) fail("Hypothetical public shape actual result must be true");
if (publicPass.record_under_test.public_visibility !== true) fail("Hypothetical public shape public_visibility must be true");
if (publicPass.record_under_test.publish_approved !== true) fail("Hypothetical public shape publish_approved must be true");
if (publicPass.record_under_test.article_hash !== publicPass.record_under_test.approved_hash) fail("Hypothetical public shape hash must match approved_hash");

if (!Array.isArray(validationReport.checks) || validationReport.checks.length !== 10) fail("Validation report must include ten checks");
if (validationReport.failed_checks.length !== 0) fail("Validation report failed checks must be zero");
if (validationReport.public_visibility_switch_performed !== false) fail("Visibility switch must not be performed");
if (validationReport.public_index_mutation_performed !== false) fail("Public index mutation must not be performed");
if (validationReport.publishing_operation_performed !== false) fail("Publishing must not be performed");
if (validationReport.article_mutation_performed !== false) fail("Article mutation must not be performed");

if (readiness.ready_for_ag16d !== true) fail("AG16D readiness missing");
if (readiness.schema_dry_run_passed !== true) fail("Schema dry-run must pass");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.seed_candidate_failed_public_filter_as_expected !== true) fail("Seed failure readiness missing");
if (readiness.internal_states_failed_public_filter_as_expected !== true) fail("Internal state failure readiness missing");
if (readiness.hypothetical_public_shape_passed_as_expected !== true) fail("Hypothetical public pass readiness missing");
if (readiness.active_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag16d_boundary_created_not_started") fail("AG16D boundary status mismatch");
if (boundary.next_stage_id !== "AG16D") fail("AG16D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG16D explicit approval missing");

if (schema.status !== "schema_public_visibility_filter_schema_dry_run_only") fail("Schema status mismatch");

for (const key of [
  "seed_candidate_dry_run_allowed_in_ag16c",
  "state_matrix_dry_run_allowed_in_ag16c",
  "hypothetical_public_shape_dry_run_allowed_in_ag16c",
  "validation_report_allowed_in_ag16c",
  "ag16d_boundary_allowed_in_ag16c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag16c",
  "article_mutation_allowed_in_ag16c",
  "queue_mutation_allowed_in_ag16c",
  "active_admin_review_queue_record_creation_allowed_in_ag16c",
  "queue_index_mutation_allowed_in_ag16c",
  "admin_action_execution_allowed_in_ag16c",
  "editor_action_execution_allowed_in_ag16c",
  "auth_activation_allowed_in_ag16c",
  "backend_activation_allowed_in_ag16c",
  "supabase_activation_allowed_in_ag16c",
  "github_write_operation_allowed_in_ag16c",
  "public_visibility_switch_allowed_in_ag16c",
  "public_index_mutation_allowed_in_ag16c",
  "public_publishing_operation_allowed_in_ag16c",
  "deployment_trigger_allowed_in_ag16c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, seedDryRun, stateMatrix, publicPass, validationReport, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.public_visibility_filter_schema_dry_run_only !== true) fail(`${obj.title || "object"} must be AG16C dry-run only`);
  if (obj.article_generation_performed_in_ag16c !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag16c !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.queue_mutation_performed_in_ag16c !== false) fail(`${obj.title || "object"} must not mutate queues`);
  if (obj.public_visibility_switch_performed_in_ag16c !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag16c !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.public_publishing_operation_performed_in_ag16c !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Dry-run Result", "Validation Result", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG16C document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag16c", "validate:ag16c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag16c")) {
  fail("validate:project must include validate:ag16c");
}

pass("AG16C registry is present.");
pass("AG16C document is present.");
pass("AG16C review, seed dry-run, state matrix dry-run, hypothetical public shape dry-run, validation report, readiness, AG16D boundary, schema, learning and preview are present.");
pass("AG16B public visibility and publish-filter schema plan is consumed.");
pass("Seed/pre-publication candidate fails public filter as expected.");
pass("Returned, archived and pending-exposure states fail public filter as expected.");
pass("Hypothetical public_published and published_closed shapes pass only under strict visibility/approval/index/hash/evidence controls.");
pass("Dry-run validation passed with zero failed checks.");
pass("AG16D public visibility filter schema dry-run audit boundary is created with explicit approval required.");
pass("No article generation, article mutation, queue mutation, visibility switch, public index mutation or publishing is performed.");
pass("AG16C is Public Visibility and Publish Filter Schema Dry-run only.");
