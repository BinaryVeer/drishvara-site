import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const scaffoldFiles = [
  "internal-scaffolds/ag15e-generated-article-admin-queue-non-active/candidate-to-admin-queue.non-active.mjs",
  "internal-scaffolds/ag15e-generated-article-admin-queue-non-active/generated-article-intake.template.json",
  "internal-scaffolds/ag15e-generated-article-admin-queue-non-active/admin-review-queue-record.template.json",
  "internal-scaffolds/ag15e-generated-article-admin-queue-non-active/validation-fixture.seed-candidate.json",
  "internal-scaffolds/ag15e-generated-article-admin-queue-non-active/README.md"
];

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag15d-schema-dry-run-audit-integration-readiness.json",
  "data/content-intelligence/audit-records/ag15d-schema-dry-run-audit-report.json",
  "data/content-intelligence/content-pipeline/ag15d-integration-readiness-decision-record.json",
  "data/content-intelligence/content-pipeline/ag15d-active-integration-blocker-register.json",
  "data/content-intelligence/quality-registry/ag15d-non-active-integration-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15d-to-ag15e-non-active-admin-queue-integration-scaffold-boundary.json",

  ...scaffoldFiles,

  "data/content-intelligence/quality-reviews/ag15e-non-active-admin-queue-integration-scaffold.json",
  "data/content-intelligence/apply-records/ag15e-non-active-admin-queue-integration-scaffold-apply.json",
  "data/content-intelligence/content-pipeline/ag15e-non-active-integration-scaffold-inventory.json",
  "data/content-intelligence/content-pipeline/ag15e-candidate-to-queue-mapping-template-record.json",
  "data/content-intelligence/quality-registry/ag15e-non-active-integration-guard-record.json",
  "data/content-intelligence/quality-registry/ag15e-non-active-integration-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15e-to-ag15f-non-active-integration-scaffold-audit-boundary.json",
  "data/content-intelligence/schema/non-active-admin-queue-integration-scaffold.schema.json",
  "data/content-intelligence/learning/ag15e-non-active-admin-queue-integration-scaffold-learning.json",
  "data/quality/ag15e-non-active-admin-queue-integration-scaffold.json",
  "data/quality/ag15e-non-active-admin-queue-integration-scaffold-preview.json",
  "docs/quality/AG15E_NON_ACTIVE_ADMIN_QUEUE_INTEGRATION_SCAFFOLD.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG15E validation failed: ${message}`);
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

const ag15dReview = readJson("data/content-intelligence/quality-reviews/ag15d-schema-dry-run-audit-integration-readiness.json");
const ag15dAudit = readJson("data/content-intelligence/audit-records/ag15d-schema-dry-run-audit-report.json");
const ag15dDecision = readJson("data/content-intelligence/content-pipeline/ag15d-integration-readiness-decision-record.json");
const ag15dReadiness = readJson("data/content-intelligence/quality-registry/ag15d-non-active-integration-scaffold-readiness-record.json");
const ag15dBoundary = readJson("data/content-intelligence/mutation-plans/ag15d-to-ag15e-non-active-admin-queue-integration-scaffold-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag15e-non-active-admin-queue-integration-scaffold.json");
const apply = readJson("data/content-intelligence/apply-records/ag15e-non-active-admin-queue-integration-scaffold-apply.json");
const inventory = readJson("data/content-intelligence/content-pipeline/ag15e-non-active-integration-scaffold-inventory.json");
const mapping = readJson("data/content-intelligence/content-pipeline/ag15e-candidate-to-queue-mapping-template-record.json");
const guard = readJson("data/content-intelligence/quality-registry/ag15e-non-active-integration-guard-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag15e-non-active-integration-scaffold-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag15e-to-ag15f-non-active-integration-scaffold-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/non-active-admin-queue-integration-scaffold.schema.json");
const learning = readJson("data/content-intelligence/learning/ag15e-non-active-admin-queue-integration-scaffold-learning.json");
const registry = readJson("data/quality/ag15e-non-active-admin-queue-integration-scaffold.json");
const preview = readJson("data/quality/ag15e-non-active-admin-queue-integration-scaffold-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG15E_NON_ACTIVE_ADMIN_QUEUE_INTEGRATION_SCAFFOLD.md");

for (const obj of [review, apply, inventory, mapping, guard, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG15E") fail(`module_id must be AG15E in ${obj.title || "object"}`);
}

if (ag15dReview.status !== "schema_dry_run_audit_passed_non_active_integration_scaffold_ready") fail("AG15D review status mismatch");
if (ag15dAudit.failed_checks.length !== 0) fail("AG15D failed checks must be zero");
if (ag15dDecision.decision.proceed_to_non_active_integration_scaffold !== true) fail("AG15D must approve non-active integration scaffold");
if (ag15dDecision.decision.proceed_to_active_queue_mutation !== false) fail("AG15D must block active queue mutation");
if (ag15dReadiness.ready_for_ag15e !== true) fail("AG15D readiness for AG15E missing");
if (ag15dBoundary.next_stage_id !== "AG15E") fail("AG15E boundary missing in AG15D");

const mapperText = readText("internal-scaffolds/ag15e-generated-article-admin-queue-non-active/candidate-to-admin-queue.non-active.mjs");
if (!mapperText.includes("NON_ACTIVE_INTEGRATION_SCAFFOLD_ONLY")) fail("Mapper must declare non-active scaffold only");
if (!mapperText.includes("active_queue_write_enabled: false")) fail("Mapper must disable active queue write");
if (!mapperText.includes("queue_index_write_enabled: false")) fail("Mapper must disable queue index write");
if (!mapperText.includes("public_visibility: false")) fail("Mapper must default public_visibility false");
if (!mapperText.includes("publish_approved: false")) fail("Mapper must default publish_approved false");
if (/from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|process\.env|child_process/i.test(mapperText)) {
  fail("Mapper scaffold must not import fs, access env, call fetch, use GitHub client, or write files");
}

const intakeTemplate = readJson("internal-scaffolds/ag15e-generated-article-admin-queue-non-active/generated-article-intake.template.json");
const queueTemplate = readJson("internal-scaffolds/ag15e-generated-article-admin-queue-non-active/admin-review-queue-record.template.json");
const fixture = readJson("internal-scaffolds/ag15e-generated-article-admin-queue-non-active/validation-fixture.seed-candidate.json");

if (intakeTemplate.default_values.public_visibility !== false) fail("Intake template public_visibility must default false");
if (intakeTemplate.default_values.publish_approved !== false) fail("Intake template publish_approved must default false");
if (queueTemplate.default_values.public_visibility !== false) fail("Queue template public_visibility must default false");
if (queueTemplate.default_values.publish_approved !== false) fail("Queue template publish_approved must default false");
if (queueTemplate.active_queue_write_enabled !== false) fail("Queue template active write must be false");
if (queueTemplate.queue_index_write_enabled !== false) fail("Queue index write must be false");
if (fixture.seed_candidate.public_visibility !== false) fail("Fixture public_visibility must be false");
if (fixture.seed_candidate.publish_approved !== false) fail("Fixture publish_approved must be false");
if (fixture.mapped_queue_shape.active_queue_index_mutated !== false) fail("Fixture must not mutate queue index");

if (review.status !== "non_active_integration_scaffold_created_pending_audit") fail("Review status mismatch");
if (apply.status !== "non_active_integration_scaffold_created_pending_audit") fail("Apply status mismatch");
if (inventory.status !== "non_active_integration_scaffold_files_created") fail("Inventory status mismatch");
if (mapping.status !== "candidate_to_queue_mapping_template_created_non_active") fail("Mapping record status mismatch");
if (guard.status !== "non_active_integration_guards_confirmed") fail("Guard status mismatch");
if (readiness.status !== "ready_for_ag15f_non_active_integration_scaffold_audit") fail("Readiness status mismatch");

if (inventory.files.length !== 5) fail("Inventory must record five scaffold files");
if (inventory.handler_file_intentionally_outside_api !== true) fail("Scaffold must remain outside API");
if (inventory.no_active_queue_record_created !== true) fail("No active queue record must be created");
if (inventory.no_queue_index_mutation_performed !== true) fail("No queue index mutation must be performed");

if (mapping.mapping_contract.active_write_allowed !== false) fail("Mapping contract must block active writes");
if (mapping.mapping_contract.public_visibility_default !== false) fail("Mapping public visibility default must be false");
if (mapping.mapping_contract.publish_approved_default !== false) fail("Mapping publish approved default must be false");

if (guard.guard_assertions.active_queue_write_enabled !== false) fail("Guard must block active queue write");
if (guard.guard_assertions.queue_index_write_enabled !== false) fail("Guard must block queue index write");
if (guard.guard_assertions.public_visibility_switch_enabled !== false) fail("Guard must block visibility switch");
if (guard.guard_assertions.publish_enabled !== false) fail("Guard must block publishing");

if (readiness.ready_for_ag15f !== true) fail("AG15F readiness missing");
if (readiness.active_queue_mutation_ready !== false) fail("Active queue mutation must remain blocked");
if (readiness.article_generation_ready !== false) fail("Article generation must remain blocked");
if (readiness.queue_mutation_ready !== false) fail("Queue mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag15f_boundary_created_not_started") fail("AG15F boundary status mismatch");
if (boundary.next_stage_id !== "AG15F") fail("AG15F handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG15F explicit approval missing");

if (schema.status !== "schema_non_active_admin_queue_integration_scaffold_only") fail("Schema status mismatch");

for (const key of [
  "non_active_scaffold_file_creation_allowed_in_ag15e",
  "candidate_to_queue_mapping_template_allowed_in_ag15e",
  "no_write_queue_handoff_template_allowed_in_ag15e",
  "validation_fixture_allowed_in_ag15e",
  "ag15f_boundary_allowed_in_ag15e"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag15e",
  "article_mutation_allowed_in_ag15e",
  "queue_mutation_allowed_in_ag15e",
  "active_admin_review_queue_record_creation_allowed_in_ag15e",
  "queue_index_mutation_allowed_in_ag15e",
  "admin_action_execution_allowed_in_ag15e",
  "editor_action_execution_allowed_in_ag15e",
  "auth_activation_allowed_in_ag15e",
  "backend_activation_allowed_in_ag15e",
  "supabase_activation_allowed_in_ag15e",
  "github_write_operation_allowed_in_ag15e",
  "public_visibility_switch_allowed_in_ag15e",
  "public_publishing_operation_allowed_in_ag15e",
  "deployment_trigger_allowed_in_ag15e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, apply, inventory, mapping, guard, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.non_active_admin_queue_integration_scaffold_only !== true) fail(`${obj.title || "object"} must be AG15E non-active scaffold only`);
  if (obj.article_generation_performed_in_ag15e !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag15e !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag15e !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.active_admin_review_queue_record_created_in_ag15e !== false) fail(`${obj.title || "object"} must not create active queue record`);
  if (obj.queue_index_mutation_performed_in_ag15e !== false) fail(`${obj.title || "object"} must not mutate queue index`);
  if (obj.public_visibility_switch_performed_in_ag15e !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag15e !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Scaffold Location", "Created Scaffold Files", "Default Controls", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG15E document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag15e", "validate:ag15e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag15e")) {
  fail("validate:project must include validate:ag15e");
}

pass("AG15E registry is present.");
pass("AG15E document is present.");
pass("AG15E review, apply record, scaffold inventory, mapping record, guard record, readiness, AG15F boundary, schema, learning and preview are present.");
pass("AG15D integration readiness is consumed.");
pass("Non-active candidate-to-queue scaffold files are created outside /api.");
pass("Mapper scaffold cannot write active queue records or mutate queue index.");
pass("Templates and fixture preserve public_visibility=false and publish_approved=false.");
pass("No article generation, article mutation, active queue mutation, visibility switch or publishing is performed.");
pass("AG15F non-active integration scaffold audit boundary is created with explicit approval required.");
pass("AG15E is Generated Article Admin Queue Non-active Integration Scaffold only.");
