import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag16e-non-active-public-filter-implementation-scaffold.json",
  "data/content-intelligence/apply-records/ag16e-non-active-public-filter-implementation-scaffold-apply.json",
  "data/content-intelligence/content-pipeline/ag16e-non-active-public-filter-scaffold-inventory.json",
  "data/content-intelligence/content-pipeline/ag16e-public-filter-helper-contract-record.json",
  "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-guard-record.json",
  "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16e-to-ag16f-non-active-public-filter-scaffold-audit-boundary.json",

  "internal-scaffolds/ag16e-non-active-public-filter/public-surface-filter.non-active.mjs",
  "internal-scaffolds/ag16e-non-active-public-filter/public-filter-record.template.json",
  "internal-scaffolds/ag16e-non-active-public-filter/public-filter-fixture.seed-and-state-matrix.json",
  "internal-scaffolds/ag16e-non-active-public-filter/public-index-exposure.template.json",
  "internal-scaffolds/ag16e-non-active-public-filter/README.md",

  "data/content-intelligence/quality-reviews/ag16f-non-active-public-filter-scaffold-audit.json",
  "data/content-intelligence/audit-records/ag16f-non-active-public-filter-scaffold-audit-report.json",
  "data/content-intelligence/closure-records/ag16f-non-active-public-filter-scaffold-closure.json",
  "data/content-intelligence/quality-registry/ag16f-non-active-public-filter-scaffold-safety-record.json",
  "data/content-intelligence/quality-registry/ag16f-public-visibility-publish-control-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16f-to-ag16z-public-visibility-publish-control-closure-boundary.json",
  "data/content-intelligence/schema/non-active-public-filter-scaffold-audit.schema.json",
  "data/content-intelligence/learning/ag16f-non-active-public-filter-scaffold-audit-learning.json",
  "data/quality/ag16f-non-active-public-filter-scaffold-audit.json",
  "data/quality/ag16f-non-active-public-filter-scaffold-audit-preview.json",
  "docs/quality/AG16F_NON_ACTIVE_PUBLIC_FILTER_SCAFFOLD_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG16F validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag16eReview = readJson("data/content-intelligence/quality-reviews/ag16e-non-active-public-filter-implementation-scaffold.json");
const ag16eApply = readJson("data/content-intelligence/apply-records/ag16e-non-active-public-filter-implementation-scaffold-apply.json");
const ag16eInventory = readJson("data/content-intelligence/content-pipeline/ag16e-non-active-public-filter-scaffold-inventory.json");
const ag16eHelperContract = readJson("data/content-intelligence/content-pipeline/ag16e-public-filter-helper-contract-record.json");
const ag16eGuard = readJson("data/content-intelligence/quality-registry/ag16e-non-active-public-filter-guard-record.json");
const ag16eReadiness = readJson("data/content-intelligence/quality-registry/ag16e-non-active-public-filter-scaffold-audit-readiness-record.json");
const ag16eBoundary = readJson("data/content-intelligence/mutation-plans/ag16e-to-ag16f-non-active-public-filter-scaffold-audit-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag16f-non-active-public-filter-scaffold-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag16f-non-active-public-filter-scaffold-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag16f-non-active-public-filter-scaffold-closure.json");
const safety = readJson("data/content-intelligence/quality-registry/ag16f-non-active-public-filter-scaffold-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag16f-public-visibility-publish-control-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag16f-to-ag16z-public-visibility-publish-control-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/non-active-public-filter-scaffold-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag16f-non-active-public-filter-scaffold-audit-learning.json");
const registry = readJson("data/quality/ag16f-non-active-public-filter-scaffold-audit.json");
const preview = readJson("data/quality/ag16f-non-active-public-filter-scaffold-audit-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG16F_NON_ACTIVE_PUBLIC_FILTER_SCAFFOLD_AUDIT.md");

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG16F") fail(`module_id must be AG16F in ${obj.title || "object"}`);
}

if (ag16eReview.status !== "non_active_public_filter_scaffold_created_pending_audit") fail("AG16E review status mismatch");
if (ag16eApply.status !== "non_active_public_filter_scaffold_created_pending_audit") fail("AG16E apply status mismatch");
if (ag16eReadiness.ready_for_ag16f !== true) fail("AG16E readiness for AG16F missing");
if (ag16eBoundary.next_stage_id !== "AG16F") fail("AG16F boundary missing in AG16E");

const helperText = readText("internal-scaffolds/ag16e-non-active-public-filter/public-surface-filter.non-active.mjs");
if (!helperText.includes("NON_ACTIVE_PUBLIC_FILTER_SCAFFOLD_ONLY")) fail("Helper must remain non-active");
if (!helperText.includes("public_visibility_switch_enabled: false")) fail("Helper must block visibility switch");
if (!helperText.includes("public_index_update_enabled: false")) fail("Helper must block public index update");
if (!helperText.includes("publishing_enabled: false")) fail("Helper must block publishing");
if (/from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|process\.env|child_process|createWriteStream|rmSync|unlinkSync/i.test(helperText)) {
  fail("Helper contains prohibited runtime text");
}

if (review.status !== "non_active_public_filter_scaffold_audit_passed_ready_for_ag16z_closure") fail("Review status mismatch");
if (audit.status !== "non_active_public_filter_scaffold_audit_passed") fail("Audit status mismatch");
if (closure.status !== "non_active_public_filter_scaffold_audit_passed_ready_for_ag16z_closure") fail("Closure status mismatch");
if (safety.status !== "non_active_public_filter_scaffold_safe_no_public_mutation_paths") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag16z_public_visibility_publish_control_closure") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 14) fail("AG16F audit must include fourteen checks");
if (audit.failed_checks.length !== 0) fail("AG16F failed checks must be zero");
if (audit.decision.non_active_public_filter_scaffold_safe !== true) fail("Non-active scaffold must be safe");
if (audit.decision.active_public_filter_endpoint_present !== false) fail("Active public filter endpoint must be absent");
if (audit.decision.public_visibility_switch_present !== false) fail("Visibility switch must be absent");
if (audit.decision.public_index_mutation_present !== false) fail("Public index mutation must be absent");
if (audit.decision.publishing_operation_present !== false) fail("Publishing operation must be absent");
if (audit.decision.ready_for_ag16z_closure !== true) fail("AG16Z readiness missing");

if (ag16eInventory.no_public_index_mutation_path_created !== true) fail("AG16E inventory must block public index mutation path");
if (ag16eInventory.no_visibility_switch_created !== true) fail("AG16E inventory must block visibility switch");
if (ag16eInventory.no_publishing_operation_created !== true) fail("AG16E inventory must block publishing");

if (ag16eHelperContract.helper_contract.public_visibility_switch_allowed !== false) fail("Helper contract must block visibility switch");
if (ag16eHelperContract.helper_contract.public_index_update_allowed !== false) fail("Helper contract must block public index update");
if (ag16eHelperContract.helper_contract.publish_allowed !== false) fail("Helper contract must block publishing");

if (ag16eGuard.guard_assertions.public_visibility_switch_enabled !== false) fail("AG16E guard must block visibility switch");
if (ag16eGuard.guard_assertions.public_index_update_enabled !== false) fail("AG16E guard must block public index update");
if (ag16eGuard.guard_assertions.publishing_enabled !== false) fail("AG16E guard must block publishing");

if (closure.closure_decision.close_ag16e_scaffold !== true) fail("AG16E scaffold closure must be true");
if (closure.closure_decision.proceed_to_ag16z_public_visibility_publish_control_closure !== true) fail("AG16Z closure handoff must be true");
if (closure.closure_decision.proceed_to_public_visibility_switch !== false) fail("Visibility switch must remain blocked");
if (closure.closure_decision.proceed_to_public_index_mutation !== false) fail("Public index mutation must remain blocked");
if (closure.closure_decision.proceed_to_publish_execution !== false) fail("Publishing must remain blocked");

if (safety.safety_assertions.scaffold_outside_api !== true) fail("Safety must confirm scaffold outside API");
if (safety.safety_assertions.active_api_endpoint_present !== false) fail("Safety must confirm no active endpoint");
if (safety.safety_assertions.public_visibility_switch_enabled !== false) fail("Safety must block visibility switch");
if (safety.safety_assertions.public_index_update_enabled !== false) fail("Safety must block public index update");
if (safety.safety_assertions.publishing_enabled !== false) fail("Safety must block publishing");

if (readiness.ready_for_ag16z !== true) fail("AG16Z readiness missing");
if (readiness.non_active_public_filter_scaffold_audit_passed !== true) fail("Non-active scaffold audit must pass");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.active_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag16z_boundary_created_not_started") fail("AG16Z boundary status mismatch");
if (boundary.next_stage_id !== "AG16Z") fail("AG16Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG16Z explicit approval missing");

if (schema.status !== "schema_non_active_public_filter_scaffold_audit_only") fail("Schema status mismatch");

for (const key of [
  "scaffold_audit_allowed_in_ag16f",
  "closure_record_allowed_in_ag16f",
  "safety_record_allowed_in_ag16f",
  "ag16z_boundary_allowed_in_ag16f"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "scaffold_file_mutation_allowed_in_ag16f",
  "article_generation_allowed_in_ag16f",
  "article_mutation_allowed_in_ag16f",
  "queue_mutation_allowed_in_ag16f",
  "active_admin_review_queue_record_creation_allowed_in_ag16f",
  "queue_index_mutation_allowed_in_ag16f",
  "admin_action_execution_allowed_in_ag16f",
  "editor_action_execution_allowed_in_ag16f",
  "auth_activation_allowed_in_ag16f",
  "backend_activation_allowed_in_ag16f",
  "supabase_activation_allowed_in_ag16f",
  "github_write_operation_allowed_in_ag16f",
  "api_endpoint_creation_allowed_in_ag16f",
  "public_visibility_switch_allowed_in_ag16f",
  "public_index_mutation_allowed_in_ag16f",
  "public_publishing_operation_allowed_in_ag16f",
  "deployment_trigger_allowed_in_ag16f"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.non_active_public_filter_scaffold_audit_only !== true) fail(`${obj.title || "object"} must be AG16F audit-only`);
  if (obj.scaffold_file_mutation_performed_in_ag16f !== false) fail(`${obj.title || "object"} must not mutate scaffold files`);
  if (obj.article_generation_performed_in_ag16f !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag16f !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.queue_mutation_performed_in_ag16f !== false) fail(`${obj.title || "object"} must not mutate queues`);
  if (obj.public_visibility_switch_performed_in_ag16f !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag16f !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.public_publishing_operation_performed_in_ag16f !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Closure Decision", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG16F document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag16f", "validate:ag16f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag16f")) {
  fail("validate:project must include validate:ag16f");
}

pass("AG16F registry is present.");
pass("AG16F document is present.");
pass("AG16F review, audit report, closure, safety, readiness, AG16Z boundary, schema, learning and preview are present.");
pass("AG16E non-active public filter scaffold is consumed.");
pass("Non-active public filter scaffold audit passed with zero failed checks.");
pass("Scaffold remains outside /api and no active public exposure endpoint exists.");
pass("Helper cannot switch visibility, mutate public index, publish, access secrets or write files.");
pass("Visibility switch, public index mutation and publishing remain blocked.");
pass("AG16Z public visibility and publish-control closure boundary is created with explicit approval required.");
pass("AG16F is Non-active Public Filter Implementation Scaffold Audit only.");
