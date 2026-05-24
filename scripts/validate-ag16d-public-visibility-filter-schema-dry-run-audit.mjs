import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag16c-public-visibility-filter-schema-dry-run.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag16c-seed-candidate-public-filter-dry-run.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag16c-public-visibility-state-matrix-dry-run.json",
  "data/content-intelligence/content-pipeline/dry-runs/ag16c-hypothetical-public-published-shape-dry-run.json",
  "data/content-intelligence/audit-records/ag16c-public-visibility-filter-schema-dry-run-validation-report.json",
  "data/content-intelligence/quality-registry/ag16c-public-visibility-filter-schema-dry-run-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16c-to-ag16d-public-visibility-filter-schema-dry-run-audit-boundary.json",
  "data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json",
  "data/content-intelligence/content-pipeline/ag16b-public-surface-exclusion-contract.json",
  "data/content-intelligence/content-pipeline/ag16b-public-visibility-filter-validation-plan.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag16d-public-visibility-filter-schema-dry-run-audit.json",
  "data/content-intelligence/audit-records/ag16d-public-visibility-filter-schema-dry-run-audit-report.json",
  "data/content-intelligence/content-pipeline/ag16d-public-filter-implementation-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag16d-public-filter-safety-record.json",
  "data/content-intelligence/quality-registry/ag16d-non-active-public-filter-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16d-to-ag16e-non-active-public-filter-implementation-scaffold-boundary.json",
  "data/content-intelligence/schema/public-visibility-filter-schema-dry-run-audit.schema.json",
  "data/content-intelligence/learning/ag16d-public-visibility-filter-schema-dry-run-audit-learning.json",
  "data/quality/ag16d-public-visibility-filter-schema-dry-run-audit.json",
  "data/quality/ag16d-public-visibility-filter-schema-dry-run-audit-preview.json",
  "docs/quality/AG16D_PUBLIC_VISIBILITY_FILTER_SCHEMA_DRY_RUN_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG16D validation failed: ${message}`);
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

const ag16cReview = readJson("data/content-intelligence/quality-reviews/ag16c-public-visibility-filter-schema-dry-run.json");
const ag16cSeed = readJson("data/content-intelligence/content-pipeline/dry-runs/ag16c-seed-candidate-public-filter-dry-run.json");
const ag16cMatrix = readJson("data/content-intelligence/content-pipeline/dry-runs/ag16c-public-visibility-state-matrix-dry-run.json");
const ag16cPublicPass = readJson("data/content-intelligence/content-pipeline/dry-runs/ag16c-hypothetical-public-published-shape-dry-run.json");
const ag16cValidation = readJson("data/content-intelligence/audit-records/ag16c-public-visibility-filter-schema-dry-run-validation-report.json");
const ag16cReadiness = readJson("data/content-intelligence/quality-registry/ag16c-public-visibility-filter-schema-dry-run-audit-readiness-record.json");
const ag16cBoundary = readJson("data/content-intelligence/mutation-plans/ag16c-to-ag16d-public-visibility-filter-schema-dry-run-audit-boundary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag16d-public-visibility-filter-schema-dry-run-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag16d-public-visibility-filter-schema-dry-run-audit-report.json");
const decision = readJson("data/content-intelligence/content-pipeline/ag16d-public-filter-implementation-readiness-decision-record.json");
const safety = readJson("data/content-intelligence/quality-registry/ag16d-public-filter-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag16d-non-active-public-filter-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag16d-to-ag16e-non-active-public-filter-implementation-scaffold-boundary.json");
const schema = readJson("data/content-intelligence/schema/public-visibility-filter-schema-dry-run-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag16d-public-visibility-filter-schema-dry-run-audit-learning.json");
const registry = readJson("data/quality/ag16d-public-visibility-filter-schema-dry-run-audit.json");
const preview = readJson("data/quality/ag16d-public-visibility-filter-schema-dry-run-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG16D_PUBLIC_VISIBILITY_FILTER_SCHEMA_DRY_RUN_AUDIT.md"), "utf8");

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG16D") fail(`module_id must be AG16D in ${obj.title || "object"}`);
}

if (ag16cReview.status !== "public_visibility_filter_schema_dry_run_passed") fail("AG16C review status mismatch");
if (ag16cValidation.failed_checks.length !== 0) fail("AG16C failed checks must be zero");
if (ag16cReadiness.ready_for_ag16d !== true) fail("AG16C readiness for AG16D missing");
if (ag16cBoundary.next_stage_id !== "AG16D") fail("AG16D boundary missing in AG16C");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");
if (ag16cSeed.record_under_test.article_hash !== currentHash) fail("Seed dry-run hash mismatch");

if (review.status !== "public_visibility_filter_schema_dry_run_audit_passed_non_active_scaffold_ready") fail("Review status mismatch");
if (audit.status !== "public_visibility_filter_schema_dry_run_audit_passed") fail("Audit status mismatch");
if (decision.status !== "public_filter_dry_run_audit_passed_non_active_scaffold_ready") fail("Decision status mismatch");
if (safety.status !== "public_filter_safety_confirmed_no_public_mutation") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag16e_non_active_public_filter_implementation_scaffold") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 12) fail("AG16D audit must include twelve checks");
if (audit.failed_checks.length !== 0) fail("AG16D failed checks must be zero");
if (audit.decision.dry_run_valid !== true) fail("Dry-run must be valid");
if (audit.decision.public_filter_contract_valid !== true) fail("Public filter contract must be valid");
if (audit.decision.ready_for_non_active_public_filter_scaffold !== true) fail("Non-active public filter scaffold readiness missing");
if (audit.decision.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (audit.decision.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (audit.decision.publish_ready !== false) fail("Publishing must remain blocked");

if (ag16cSeed.actual_public_filter_result !== false) fail("Seed candidate must fail public filter");
if (ag16cSeed.dry_run_passed !== true) fail("Seed dry-run must pass by failing public filter");
if (ag16cMatrix.failed_rows.length !== 0) fail("State matrix must have zero failed rows");
if (ag16cPublicPass.actual_public_filter_result !== true) fail("Hypothetical public pass shape must pass");

if (decision.decision.proceed_to_non_active_public_filter_scaffold !== true) fail("Decision must approve non-active public filter scaffold");
if (decision.decision.proceed_to_public_visibility_switch !== false) fail("Decision must block visibility switch");
if (decision.decision.proceed_to_public_index_mutation !== false) fail("Decision must block public index mutation");
if (decision.decision.proceed_to_publish_execution !== false) fail("Decision must block publishing");
if (decision.decision.proceed_to_article_mutation !== false) fail("Decision must block article mutation");
if (decision.recommended_next_stage !== "AG16E") fail("Recommended next stage must be AG16E");

if (safety.safety_assertions.seed_candidate_public_exposure_allowed_now !== false) fail("Seed public exposure must be false");
if (safety.safety_assertions.returned_for_correction_public_exposure_allowed !== false) fail("Returned public exposure must be false");
if (safety.safety_assertions.archived_internal_public_exposure_allowed !== false) fail("Archived public exposure must be false");
if (safety.safety_assertions.publish_approved_pending_exposure_public_exposure_allowed !== false) fail("Pending exposure must remain non-public");
if (safety.safety_assertions.public_visibility_switch_enabled !== false) fail("Visibility switch must be disabled");
if (safety.safety_assertions.public_index_mutation_enabled !== false) fail("Public index mutation must be disabled");
if (safety.safety_assertions.publishing_enabled !== false) fail("Publishing must be disabled");

if (readiness.ready_for_ag16e !== true) fail("AG16E readiness missing");
if (readiness.public_filter_dry_run_audit_passed !== true) fail("Public filter audit must pass");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.non_active_public_filter_scaffold_ready !== true) fail("Non-active public filter scaffold readiness missing");
if (readiness.active_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag16e_boundary_created_not_started") fail("AG16E boundary status mismatch");
if (boundary.next_stage_id !== "AG16E") fail("AG16E handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG16E explicit approval missing");

if (schema.status !== "schema_public_visibility_filter_schema_dry_run_audit_only") fail("Schema status mismatch");

for (const key of [
  "dry_run_audit_allowed_in_ag16d",
  "implementation_readiness_decision_allowed_in_ag16d",
  "public_filter_safety_record_allowed_in_ag16d",
  "ag16e_boundary_allowed_in_ag16d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag16d",
  "article_mutation_allowed_in_ag16d",
  "queue_mutation_allowed_in_ag16d",
  "active_admin_review_queue_record_creation_allowed_in_ag16d",
  "queue_index_mutation_allowed_in_ag16d",
  "admin_action_execution_allowed_in_ag16d",
  "editor_action_execution_allowed_in_ag16d",
  "auth_activation_allowed_in_ag16d",
  "backend_activation_allowed_in_ag16d",
  "supabase_activation_allowed_in_ag16d",
  "github_write_operation_allowed_in_ag16d",
  "public_filter_implementation_scaffold_allowed_in_ag16d",
  "public_visibility_switch_allowed_in_ag16d",
  "public_index_mutation_allowed_in_ag16d",
  "public_publishing_operation_allowed_in_ag16d",
  "deployment_trigger_allowed_in_ag16d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.public_visibility_filter_schema_dry_run_audit_only !== true) fail(`${obj.title || "object"} must be AG16D audit-only`);
  if (obj.article_generation_performed_in_ag16d !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag16d !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.queue_mutation_performed_in_ag16d !== false) fail(`${obj.title || "object"} must not mutate queues`);
  if (obj.public_filter_implementation_scaffold_created_in_ag16d !== false) fail(`${obj.title || "object"} must not create scaffold in AG16D`);
  if (obj.public_visibility_switch_performed_in_ag16d !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag16d !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.public_publishing_operation_performed_in_ag16d !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Readiness Decision", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG16D document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag16d", "validate:ag16d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag16d")) {
  fail("validate:project must include validate:ag16d");
}

pass("AG16D registry is present.");
pass("AG16D document is present.");
pass("AG16D review, audit report, decision, safety, readiness, AG16E boundary, schema, learning and preview are present.");
pass("AG16C public visibility filter schema dry-run is consumed.");
pass("Public visibility filter dry-run audit passed with zero failed checks.");
pass("Seed/pre-publication, returned, archived and pending-exposure states remain non-public.");
pass("Hypothetical public-published states pass only under strict controls.");
pass("Decision recorded: proceed only to non-active public filter scaffold.");
pass("Visibility switch, public index mutation and publishing remain blocked.");
pass("AG16E non-active public filter implementation scaffold boundary is created with explicit approval required.");
pass("AG16D is Public Visibility Filter Schema Dry-run Audit only.");
