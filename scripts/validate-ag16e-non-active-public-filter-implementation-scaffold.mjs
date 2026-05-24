import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const scaffoldFiles = [
  "internal-scaffolds/ag16e-non-active-public-filter/public-surface-filter.non-active.mjs",
  "internal-scaffolds/ag16e-non-active-public-filter/public-filter-record.template.json",
  "internal-scaffolds/ag16e-non-active-public-filter/public-filter-fixture.seed-and-state-matrix.json",
  "internal-scaffolds/ag16e-non-active-public-filter/public-index-exposure.template.json",
  "internal-scaffolds/ag16e-non-active-public-filter/README.md"
];

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag16d-public-visibility-filter-schema-dry-run-audit.json",
  "data/content-intelligence/audit-records/ag16d-public-visibility-filter-schema-dry-run-audit-report.json",
  "data/content-intelligence/content-pipeline/ag16d-public-filter-implementation-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag16d-public-filter-safety-record.json",
  "data/content-intelligence/quality-registry/ag16d-non-active-public-filter-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16d-to-ag16e-non-active-public-filter-implementation-scaffold-boundary.json",

  ...scaffoldFiles,

  "data/content-intelligence/quality-reviews/ag16e-non-active-public-filter-implementation-scaffold.json",
  "data/content-intelligence/apply-records/ag16e-non-active-public-filter-implementation-scaffold-apply.json",
  "data/content-intelligence/content-pipeline/ag16e-non-active-public-filter-scaffold-inventory.json",
  "data/content-intelligence/content-pipeline/ag16e-public-filter-helper-contract-record.json",
  "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-guard-record.json",
  "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16e-to-ag16f-non-active-public-filter-scaffold-audit-boundary.json",
  "data/content-intelligence/schema/non-active-public-filter-implementation-scaffold.schema.json",
  "data/content-intelligence/learning/ag16e-non-active-public-filter-implementation-scaffold-learning.json",
  "data/quality/ag16e-non-active-public-filter-implementation-scaffold.json",
  "data/quality/ag16e-non-active-public-filter-implementation-scaffold-preview.json",
  "docs/quality/AG16E_NON_ACTIVE_PUBLIC_FILTER_IMPLEMENTATION_SCAFFOLD.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG16E validation failed: ${message}`);
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

const ag16dReview = readJson("data/content-intelligence/quality-reviews/ag16d-public-visibility-filter-schema-dry-run-audit.json");
const ag16dAudit = readJson("data/content-intelligence/audit-records/ag16d-public-visibility-filter-schema-dry-run-audit-report.json");
const ag16dDecision = readJson("data/content-intelligence/content-pipeline/ag16d-public-filter-implementation-readiness-decision-record.json");
const ag16dReadiness = readJson("data/content-intelligence/quality-registry/ag16d-non-active-public-filter-scaffold-readiness-record.json");
const ag16dBoundary = readJson("data/content-intelligence/mutation-plans/ag16d-to-ag16e-non-active-public-filter-implementation-scaffold-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag16e-non-active-public-filter-implementation-scaffold.json");
const apply = readJson("data/content-intelligence/apply-records/ag16e-non-active-public-filter-implementation-scaffold-apply.json");
const inventory = readJson("data/content-intelligence/content-pipeline/ag16e-non-active-public-filter-scaffold-inventory.json");
const helperContract = readJson("data/content-intelligence/content-pipeline/ag16e-public-filter-helper-contract-record.json");
const guard = readJson("data/content-intelligence/quality-registry/ag16e-non-active-public-filter-guard-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag16e-non-active-public-filter-scaffold-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag16e-to-ag16f-non-active-public-filter-scaffold-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/non-active-public-filter-implementation-scaffold.schema.json");
const learning = readJson("data/content-intelligence/learning/ag16e-non-active-public-filter-implementation-scaffold-learning.json");
const registry = readJson("data/quality/ag16e-non-active-public-filter-implementation-scaffold.json");
const preview = readJson("data/quality/ag16e-non-active-public-filter-implementation-scaffold-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG16E_NON_ACTIVE_PUBLIC_FILTER_IMPLEMENTATION_SCAFFOLD.md");

for (const obj of [review, apply, inventory, helperContract, guard, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG16E") fail(`module_id must be AG16E in ${obj.title || "object"}`);
}

if (ag16dReview.status !== "public_visibility_filter_schema_dry_run_audit_passed_non_active_scaffold_ready") fail("AG16D review status mismatch");
if (ag16dAudit.failed_checks.length !== 0) fail("AG16D failed checks must be zero");
if (ag16dDecision.decision.proceed_to_non_active_public_filter_scaffold !== true) fail("AG16D must approve non-active scaffold");
if (ag16dDecision.decision.proceed_to_public_visibility_switch !== false) fail("AG16D must block visibility switch");
if (ag16dDecision.decision.proceed_to_public_index_mutation !== false) fail("AG16D must block public index mutation");
if (ag16dDecision.decision.proceed_to_publish_execution !== false) fail("AG16D must block publishing");
if (ag16dReadiness.ready_for_ag16e !== true) fail("AG16D readiness for AG16E missing");
if (ag16dBoundary.next_stage_id !== "AG16E") fail("AG16E boundary missing in AG16D");

const helperText = readText("internal-scaffolds/ag16e-non-active-public-filter/public-surface-filter.non-active.mjs");
if (!helperText.includes("NON_ACTIVE_PUBLIC_FILTER_SCAFFOLD_ONLY")) fail("Helper must declare non-active scaffold only");
if (!helperText.includes("public_visibility_switch_enabled: false")) fail("Helper must disable visibility switch");
if (!helperText.includes("public_index_update_enabled: false")) fail("Helper must disable public index update");
if (!helperText.includes("publishing_enabled: false")) fail("Helper must disable publishing");
if (/from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|process\.env|child_process|createWriteStream|rmSync|unlinkSync/i.test(helperText)) {
  fail("Helper scaffold must not import fs, access env, call fetch, use GitHub client or write files");
}

const recordTemplate = readJson("internal-scaffolds/ag16e-non-active-public-filter/public-filter-record.template.json");
const fixture = readJson("internal-scaffolds/ag16e-non-active-public-filter/public-filter-fixture.seed-and-state-matrix.json");
const publicIndexTemplate = readJson("internal-scaffolds/ag16e-non-active-public-filter/public-index-exposure.template.json");

if (recordTemplate.default_values.public_visibility !== false) fail("Template public_visibility must default false");
if (recordTemplate.default_values.publish_approved !== false) fail("Template publish_approved must default false");
if (recordTemplate.default_values.public_index_allowed !== false) fail("Template public_index_allowed must default false");
if (recordTemplate.public_visibility_switch_enabled !== false) fail("Template visibility switch must be false");
if (recordTemplate.public_index_update_enabled !== false) fail("Template public index update must be false");
if (recordTemplate.publishing_enabled !== false) fail("Template publishing must be false");

if (fixture.seed_candidate_case.actual_public_filter_result !== false) fail("Seed fixture must fail public filter");
if (fixture.public_pass_case.actual_public_filter_result !== true) fail("Public pass fixture must pass only hypothetically");
if (fixture.public_visibility_switch_enabled !== false) fail("Fixture visibility switch must be false");
if (fixture.public_index_update_enabled !== false) fail("Fixture public index update must be false");
if (fixture.publishing_enabled !== false) fail("Fixture publishing must be false");

if (publicIndexTemplate.public_index_update_enabled !== false) fail("Public index template update must be false");
if (publicIndexTemplate.public_surface_update_enabled !== false) fail("Public surface update must be false");
if (publicIndexTemplate.publish_execution_enabled !== false) fail("Publish execution must be false");

if (review.status !== "non_active_public_filter_scaffold_created_pending_audit") fail("Review status mismatch");
if (apply.status !== "non_active_public_filter_scaffold_created_pending_audit") fail("Apply status mismatch");
if (inventory.status !== "non_active_public_filter_scaffold_files_created") fail("Inventory status mismatch");
if (helperContract.status !== "public_filter_helper_contract_created_non_active") fail("Helper contract status mismatch");
if (guard.status !== "non_active_public_filter_guards_confirmed") fail("Guard status mismatch");
if (readiness.status !== "ready_for_ag16f_non_active_public_filter_scaffold_audit") fail("Readiness status mismatch");

if (inventory.files.length !== 5) fail("Inventory must record five scaffold files");
if (inventory.helper_file_intentionally_outside_api !== true) fail("Helper must be outside API");
if (inventory.no_active_endpoint_created !== true) fail("No active endpoint must be created");
if (inventory.no_public_index_mutation_path_created !== true) fail("No public index mutation path must be created");
if (inventory.no_visibility_switch_created !== true) fail("No visibility switch must be created");
if (inventory.no_publishing_operation_created !== true) fail("No publishing operation must be created");

if (helperContract.helper_contract.active_public_exposure_allowed !== false) fail("Helper contract must block active public exposure");
if (helperContract.helper_contract.public_visibility_switch_allowed !== false) fail("Helper contract must block visibility switch");
if (helperContract.helper_contract.public_index_update_allowed !== false) fail("Helper contract must block public index update");
if (helperContract.helper_contract.publish_allowed !== false) fail("Helper contract must block publishing");

if (guard.guard_assertions.public_visibility_switch_enabled !== false) fail("Guard must block visibility switch");
if (guard.guard_assertions.public_index_update_enabled !== false) fail("Guard must block public index update");
if (guard.guard_assertions.publishing_enabled !== false) fail("Guard must block publishing");
if (guard.guard_assertions.article_mutation_enabled !== false) fail("Guard must block article mutation");

if (readiness.ready_for_ag16f !== true) fail("AG16F readiness missing");
if (readiness.active_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag16f_boundary_created_not_started") fail("AG16F boundary status mismatch");
if (boundary.next_stage_id !== "AG16F") fail("AG16F handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG16F explicit approval missing");

if (schema.status !== "schema_non_active_public_filter_implementation_scaffold_only") fail("Schema status mismatch");

for (const key of [
  "non_active_scaffold_file_creation_allowed_in_ag16e",
  "public_filter_helper_allowed_in_ag16e",
  "public_filter_templates_allowed_in_ag16e",
  "validation_fixture_allowed_in_ag16e",
  "ag16f_boundary_allowed_in_ag16e"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag16e",
  "article_mutation_allowed_in_ag16e",
  "queue_mutation_allowed_in_ag16e",
  "active_admin_review_queue_record_creation_allowed_in_ag16e",
  "queue_index_mutation_allowed_in_ag16e",
  "admin_action_execution_allowed_in_ag16e",
  "editor_action_execution_allowed_in_ag16e",
  "auth_activation_allowed_in_ag16e",
  "backend_activation_allowed_in_ag16e",
  "supabase_activation_allowed_in_ag16e",
  "github_write_operation_allowed_in_ag16e",
  "public_visibility_switch_allowed_in_ag16e",
  "public_index_mutation_allowed_in_ag16e",
  "public_publishing_operation_allowed_in_ag16e",
  "deployment_trigger_allowed_in_ag16e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, apply, inventory, helperContract, guard, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.non_active_public_filter_implementation_scaffold_only !== true) fail(`${obj.title || "object"} must be AG16E scaffold-only`);
  if (obj.article_generation_performed_in_ag16e !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag16e !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.queue_mutation_performed_in_ag16e !== false) fail(`${obj.title || "object"} must not mutate queues`);
  if (obj.public_visibility_switch_performed_in_ag16e !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag16e !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.public_publishing_operation_performed_in_ag16e !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Scaffold Location", "Created Scaffold Files", "Default Controls", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG16E document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag16e", "validate:ag16e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag16e")) {
  fail("validate:project must include validate:ag16e");
}

pass("AG16E registry is present.");
pass("AG16E document is present.");
pass("AG16E review, apply record, scaffold inventory, helper contract, guard record, readiness, AG16F boundary, schema, learning and preview are present.");
pass("AG16D public filter readiness is consumed.");
pass("Non-active public filter helper and templates are created outside /api.");
pass("Helper cannot switch visibility, mutate public index, publish, access secrets or write files.");
pass("Templates and fixture preserve non-public defaults and no-public-index mutation.");
pass("No article generation, article mutation, visibility switch, public index mutation or publishing is performed.");
pass("AG16F non-active public filter scaffold audit boundary is created with explicit approval required.");
pass("AG16E is Non-active Public Filter Implementation Scaffold only.");
