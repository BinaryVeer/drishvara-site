import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag15e-non-active-admin-queue-integration-scaffold.json",
  "data/content-intelligence/apply-records/ag15e-non-active-admin-queue-integration-scaffold-apply.json",
  "data/content-intelligence/content-pipeline/ag15e-non-active-integration-scaffold-inventory.json",
  "data/content-intelligence/content-pipeline/ag15e-candidate-to-queue-mapping-template-record.json",
  "data/content-intelligence/quality-registry/ag15e-non-active-integration-guard-record.json",
  "data/content-intelligence/quality-registry/ag15e-non-active-integration-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15e-to-ag15f-non-active-integration-scaffold-audit-boundary.json",

  "internal-scaffolds/ag15e-generated-article-admin-queue-non-active/candidate-to-admin-queue.non-active.mjs",
  "internal-scaffolds/ag15e-generated-article-admin-queue-non-active/generated-article-intake.template.json",
  "internal-scaffolds/ag15e-generated-article-admin-queue-non-active/admin-review-queue-record.template.json",
  "internal-scaffolds/ag15e-generated-article-admin-queue-non-active/validation-fixture.seed-candidate.json",
  "internal-scaffolds/ag15e-generated-article-admin-queue-non-active/README.md",

  "data/content-intelligence/quality-reviews/ag15f-non-active-admin-queue-integration-scaffold-audit.json",
  "data/content-intelligence/audit-records/ag15f-non-active-integration-scaffold-audit-report.json",
  "data/content-intelligence/closure-records/ag15f-non-active-admin-queue-integration-scaffold-closure.json",
  "data/content-intelligence/quality-registry/ag15f-non-active-integration-scaffold-safety-record.json",
  "data/content-intelligence/quality-registry/ag15f-generated-article-admin-queue-integration-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15f-to-ag15z-generated-article-admin-queue-integration-closure-boundary.json",
  "data/content-intelligence/schema/non-active-admin-queue-integration-scaffold-audit.schema.json",
  "data/content-intelligence/learning/ag15f-non-active-admin-queue-integration-scaffold-audit-learning.json",
  "data/quality/ag15f-non-active-admin-queue-integration-scaffold-audit.json",
  "data/quality/ag15f-non-active-admin-queue-integration-scaffold-audit-preview.json",
  "docs/quality/AG15F_NON_ACTIVE_ADMIN_QUEUE_INTEGRATION_SCAFFOLD_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG15F validation failed: ${message}`);
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

const ag15eReview = readJson("data/content-intelligence/quality-reviews/ag15e-non-active-admin-queue-integration-scaffold.json");
const ag15eApply = readJson("data/content-intelligence/apply-records/ag15e-non-active-admin-queue-integration-scaffold-apply.json");
const ag15eReadiness = readJson("data/content-intelligence/quality-registry/ag15e-non-active-integration-scaffold-audit-readiness-record.json");
const ag15eBoundary = readJson("data/content-intelligence/mutation-plans/ag15e-to-ag15f-non-active-integration-scaffold-audit-boundary.json");
const ag15eGuard = readJson("data/content-intelligence/quality-registry/ag15e-non-active-integration-guard-record.json");

const review = readJson("data/content-intelligence/quality-reviews/ag15f-non-active-admin-queue-integration-scaffold-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag15f-non-active-integration-scaffold-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag15f-non-active-admin-queue-integration-scaffold-closure.json");
const safety = readJson("data/content-intelligence/quality-registry/ag15f-non-active-integration-scaffold-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag15f-generated-article-admin-queue-integration-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag15f-to-ag15z-generated-article-admin-queue-integration-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/non-active-admin-queue-integration-scaffold-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag15f-non-active-admin-queue-integration-scaffold-audit-learning.json");
const registry = readJson("data/quality/ag15f-non-active-admin-queue-integration-scaffold-audit.json");
const preview = readJson("data/quality/ag15f-non-active-admin-queue-integration-scaffold-audit-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG15F_NON_ACTIVE_ADMIN_QUEUE_INTEGRATION_SCAFFOLD_AUDIT.md");

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG15F") fail(`module_id must be AG15F in ${obj.title || "object"}`);
}

if (ag15eReview.status !== "non_active_integration_scaffold_created_pending_audit") fail("AG15E review status mismatch");
if (ag15eApply.status !== "non_active_integration_scaffold_created_pending_audit") fail("AG15E apply status mismatch");
if (ag15eReadiness.ready_for_ag15f !== true) fail("AG15E readiness for AG15F missing");
if (ag15eBoundary.next_stage_id !== "AG15F") fail("AG15F boundary missing in AG15E");

const mapperText = readText("internal-scaffolds/ag15e-generated-article-admin-queue-non-active/candidate-to-admin-queue.non-active.mjs");
if (!mapperText.includes("NON_ACTIVE_INTEGRATION_SCAFFOLD_ONLY")) fail("Mapper must remain non-active");
if (!mapperText.includes("active_queue_write_enabled: false")) fail("Mapper must disable active queue write");
if (!mapperText.includes("queue_index_write_enabled: false")) fail("Mapper must disable queue-index write");
if (!mapperText.includes("public_visibility: false")) fail("Mapper must preserve public_visibility false");
if (!mapperText.includes("publish_approved: false")) fail("Mapper must preserve publish_approved false");
if (/from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|process\.env|child_process|createWriteStream|rmSync|unlinkSync/i.test(mapperText)) {
  fail("Mapper contains prohibited runtime text");
}

if (review.status !== "non_active_integration_scaffold_audit_passed_ready_for_ag15z_closure") fail("Review status mismatch");
if (audit.status !== "non_active_integration_scaffold_audit_passed") fail("Audit status mismatch");
if (closure.status !== "non_active_integration_scaffold_audit_passed_ready_for_ag15z_closure") fail("Closure status mismatch");
if (safety.status !== "non_active_integration_scaffold_safe_no_write_paths") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag15z_generated_article_admin_queue_integration_closure") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 13) fail("AG15F audit must include thirteen checks");
if (audit.failed_checks.length !== 0) fail("AG15F failed checks must be zero");
if (audit.decision.non_active_scaffold_safe !== true) fail("Non-active scaffold must be safe");
if (audit.decision.active_queue_write_present !== false) fail("Active queue write must be absent");
if (audit.decision.queue_index_mutation_present !== false) fail("Queue-index mutation must be absent");
if (audit.decision.public_visibility_switch_present !== false) fail("Visibility switch must be absent");
if (audit.decision.publishing_operation_present !== false) fail("Publishing must be absent");
if (audit.decision.ready_for_ag15z_closure !== true) fail("AG15Z readiness missing");

if (closure.closure_decision.close_ag15e_scaffold !== true) fail("AG15E scaffold closure must be true");
if (closure.closure_decision.proceed_to_ag15z_integration_closure !== true) fail("AG15Z closure handoff must be true");
if (closure.closure_decision.proceed_to_active_queue_mutation !== false) fail("Active queue mutation must remain blocked");
if (closure.closure_decision.proceed_to_public_visibility_switch !== false) fail("Visibility switch must remain blocked");
if (closure.closure_decision.proceed_to_publish_execution !== false) fail("Publishing must remain blocked");

if (safety.safety_assertions.scaffold_outside_api !== true) fail("Safety must confirm scaffold outside API");
if (safety.safety_assertions.active_queue_write_enabled !== false) fail("Safety must block active queue write");
if (safety.safety_assertions.queue_index_write_enabled !== false) fail("Safety must block queue-index write");
if (safety.safety_assertions.public_visibility_switch_enabled !== false) fail("Safety must block visibility switch");
if (safety.safety_assertions.publish_enabled !== false) fail("Safety must block publishing");
if (ag15eGuard.guard_assertions.active_queue_write_enabled !== false) fail("AG15E guard alignment failed");

if (readiness.ready_for_ag15z !== true) fail("AG15Z readiness missing");
if (readiness.non_active_integration_scaffold_audit_passed !== true) fail("Non-active scaffold audit must pass");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.active_queue_mutation_ready !== false) fail("Active queue mutation must remain blocked");
if (readiness.article_generation_ready !== false) fail("Article generation must remain blocked");
if (readiness.queue_mutation_ready !== false) fail("Queue mutation must remain blocked");
if (readiness.public_visibility_switch_performed_in_ag15f !== false) fail("Visibility switch must not be performed");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag15z_boundary_created_not_started") fail("AG15Z boundary status mismatch");
if (boundary.next_stage_id !== "AG15Z") fail("AG15Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG15Z explicit approval missing");

if (schema.status !== "schema_non_active_admin_queue_integration_scaffold_audit_only") fail("Schema status mismatch");

for (const key of [
  "scaffold_audit_allowed_in_ag15f",
  "closure_record_allowed_in_ag15f",
  "safety_record_allowed_in_ag15f",
  "ag15z_boundary_allowed_in_ag15f"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "scaffold_file_mutation_allowed_in_ag15f",
  "article_generation_allowed_in_ag15f",
  "article_mutation_allowed_in_ag15f",
  "queue_mutation_allowed_in_ag15f",
  "active_admin_review_queue_record_creation_allowed_in_ag15f",
  "queue_index_mutation_allowed_in_ag15f",
  "admin_action_execution_allowed_in_ag15f",
  "editor_action_execution_allowed_in_ag15f",
  "auth_activation_allowed_in_ag15f",
  "backend_activation_allowed_in_ag15f",
  "supabase_activation_allowed_in_ag15f",
  "github_write_operation_allowed_in_ag15f",
  "public_visibility_switch_allowed_in_ag15f",
  "public_publishing_operation_allowed_in_ag15f",
  "deployment_trigger_allowed_in_ag15f"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.non_active_admin_queue_integration_scaffold_audit_only !== true) fail(`${obj.title || "object"} must be AG15F audit-only`);
  if (obj.scaffold_file_mutation_performed_in_ag15f !== false) fail(`${obj.title || "object"} must not mutate scaffold files`);
  if (obj.article_generation_performed_in_ag15f !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag15f !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag15f !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.active_admin_review_queue_record_created_in_ag15f !== false) fail(`${obj.title || "object"} must not create active queue record`);
  if (obj.queue_index_mutation_performed_in_ag15f !== false) fail(`${obj.title || "object"} must not mutate queue index`);
  if (obj.public_visibility_switch_performed_in_ag15f !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag15f !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Audit Result", "Closure Decision", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG15F document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag15f", "validate:ag15f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag15f")) {
  fail("validate:project must include validate:ag15f");
}

pass("AG15F registry is present.");
pass("AG15F document is present.");
pass("AG15F review, audit report, closure, safety, readiness, AG15Z boundary, schema, learning and preview are present.");
pass("AG15E non-active integration scaffold is consumed.");
pass("Non-active integration scaffold audit passed with zero failed checks.");
pass("Scaffold remains outside /api and no active queue write path exists.");
pass("Mapper cannot write active queue records or mutate queue index.");
pass("public_visibility=false and publish_approved=false are preserved.");
pass("Active queue mutation, visibility switch and publishing remain blocked.");
pass("AG15Z generated article admin queue integration closure boundary is created with explicit approval required.");
pass("AG15F is Generated Article Admin Queue Non-active Integration Scaffold Audit only.");
