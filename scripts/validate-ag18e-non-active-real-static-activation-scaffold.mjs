import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const scaffoldFiles = [
  "internal-scaffolds/ag18e-non-active-real-static-activation/real-static-activation-helper.non-active.mjs",
  "internal-scaffolds/ag18e-non-active-real-static-activation/first-public-candidate-apply.template.json",
  "internal-scaffolds/ag18e-non-active-real-static-activation/public-index-delta-apply.template.json",
  "internal-scaffolds/ag18e-non-active-real-static-activation/github-write-payload.template.json",
  "internal-scaffolds/ag18e-non-active-real-static-activation/rollback-record.template.json",
  "internal-scaffolds/ag18e-non-active-real-static-activation/smoke-test-checklist.template.json",
  "internal-scaffolds/ag18e-non-active-real-static-activation/README.md"
];

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag18d-first-public-candidate-file-delta-dry-run-audit.json",
  "data/content-intelligence/audit-records/ag18d-first-public-candidate-file-delta-dry-run-audit-report.json",
  "data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag18d-file-delta-dry-run-safety-record.json",
  "data/content-intelligence/quality-registry/ag18d-non-active-real-static-activation-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18d-to-ag18e-non-active-real-static-activation-scaffold-boundary.json",
  ...scaffoldFiles,
  "data/content-intelligence/quality-reviews/ag18e-non-active-real-static-activation-scaffold.json",
  "data/content-intelligence/apply-records/ag18e-non-active-real-static-activation-scaffold-apply.json",
  "data/content-intelligence/go-live/ag18e-non-active-real-static-activation-scaffold-inventory.json",
  "data/content-intelligence/go-live/ag18e-real-static-activation-helper-contract-record.json",
  "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-guard-record.json",
  "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18e-to-ag18f-non-active-real-static-activation-scaffold-audit-boundary.json",
  "data/content-intelligence/schema/non-active-real-static-activation-scaffold.schema.json",
  "data/content-intelligence/learning/ag18e-non-active-real-static-activation-scaffold-learning.json",
  "data/quality/ag18e-non-active-real-static-activation-scaffold.json",
  "data/quality/ag18e-non-active-real-static-activation-scaffold-preview.json",
  "docs/quality/AG18E_NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG18E validation failed: ${message}`);
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

const ag18dReview = readJson("data/content-intelligence/quality-reviews/ag18d-first-public-candidate-file-delta-dry-run-audit.json");
const ag18dAudit = readJson("data/content-intelligence/audit-records/ag18d-first-public-candidate-file-delta-dry-run-audit-report.json");
const ag18dDecision = readJson("data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json");
const ag18dReadiness = readJson("data/content-intelligence/quality-registry/ag18d-non-active-real-static-activation-scaffold-readiness-record.json");
const ag18dBoundary = readJson("data/content-intelligence/mutation-plans/ag18d-to-ag18e-non-active-real-static-activation-scaffold-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag18e-non-active-real-static-activation-scaffold.json");
const apply = readJson("data/content-intelligence/apply-records/ag18e-non-active-real-static-activation-scaffold-apply.json");
const inventory = readJson("data/content-intelligence/go-live/ag18e-non-active-real-static-activation-scaffold-inventory.json");
const helperContract = readJson("data/content-intelligence/go-live/ag18e-real-static-activation-helper-contract-record.json");
const guard = readJson("data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-guard-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-scaffold-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag18e-to-ag18f-non-active-real-static-activation-scaffold-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/non-active-real-static-activation-scaffold.schema.json");
const learning = readJson("data/content-intelligence/learning/ag18e-non-active-real-static-activation-scaffold-learning.json");
const registry = readJson("data/quality/ag18e-non-active-real-static-activation-scaffold.json");
const preview = readJson("data/quality/ag18e-non-active-real-static-activation-scaffold-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG18E_NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD.md");

for (const obj of [review, apply, inventory, helperContract, guard, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG18E") fail(`module_id must be AG18E in ${obj.title || "object"}`);
}

if (ag18dReview.status !== "first_public_candidate_file_delta_dry_run_audit_passed_ready_for_ag18e_non_active_scaffold") fail("AG18D review status mismatch");
if (ag18dAudit.failed_checks.length !== 0) fail("AG18D failed checks must be zero");
if (ag18dDecision.decision.proceed_to_non_active_real_static_activation_scaffold !== true) fail("AG18D must approve AG18E non-active scaffold");
if (ag18dReadiness.ready_for_ag18e !== true) fail("AG18D readiness for AG18E missing");
if (ag18dBoundary.next_stage_id !== "AG18E") fail("AG18E boundary missing in AG18D");

const helperText = readText("internal-scaffolds/ag18e-non-active-real-static-activation/real-static-activation-helper.non-active.mjs");
if (!helperText.includes("NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD_ONLY")) fail("Helper must declare non-active scaffold only");
for (const phrase of [
  "candidate_apply_enabled: false",
  "github_token_available: false",
  "github_write_enabled: false",
  "public_visibility_switch_enabled: false",
  "public_index_update_enabled: false",
  "deployment_trigger_enabled: false",
  "publishing_enabled: false",
  "supabase_auth_backend_enabled: false"
]) {
  if (!helperText.includes(phrase)) fail(`Helper missing guard phrase: ${phrase}`);
}
if (/from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|process\.env|child_process|createWriteStream|rmSync|unlinkSync/i.test(helperText)) {
  fail("Helper scaffold must not import fs, access env, call fetch, use GitHub clients or write files");
}

const candidateTemplate = readJson("internal-scaffolds/ag18e-non-active-real-static-activation/first-public-candidate-apply.template.json");
const indexTemplate = readJson("internal-scaffolds/ag18e-non-active-real-static-activation/public-index-delta-apply.template.json");
const githubTemplate = readJson("internal-scaffolds/ag18e-non-active-real-static-activation/github-write-payload.template.json");
const rollbackTemplate = readJson("internal-scaffolds/ag18e-non-active-real-static-activation/rollback-record.template.json");
const smokeTemplate = readJson("internal-scaffolds/ag18e-non-active-real-static-activation/smoke-test-checklist.template.json");

if (candidateTemplate.candidate_apply_enabled !== false) fail("Candidate apply template must block candidate apply");
if (candidateTemplate.article_mutation_enabled !== false) fail("Candidate apply template must block article mutation");
if (candidateTemplate.queue_mutation_enabled !== false) fail("Candidate apply template must block queue mutation");
if (candidateTemplate.public_visibility_switch_enabled !== false) fail("Candidate apply template must block visibility switch");

if (indexTemplate.public_index_update_enabled !== false) fail("Public index template must block index update");
if (indexTemplate.file_mutation_enabled !== false) fail("Public index template must block file mutation");
if (!indexTemplate.target_surfaces_preview_only.every((target) => target.apply_now === false)) fail("Public index targets must not apply now");

if (githubTemplate.secrets_created_now !== false) fail("GitHub template must not create secrets");
if (githubTemplate.secrets_exposed_now !== false) fail("GitHub template must not expose secrets");
if (githubTemplate.secrets_wired_now !== false) fail("GitHub template must not wire secrets");
if (githubTemplate.secrets_committed_now !== false) fail("GitHub template must not commit secrets");
if (githubTemplate.github_write_enabled !== false) fail("GitHub template must block write");
if (githubTemplate.can_execute_write !== false) fail("GitHub template must not execute write");

if (rollbackTemplate.rollback_executed_now !== false) fail("Rollback template must not execute rollback");
if (rollbackTemplate.can_execute_rollback !== false) fail("Rollback template must not be executable");

if (smokeTemplate.deployment_trigger_enabled !== false) fail("Smoke-test template must block deployment");
if (smokeTemplate.publishing_enabled !== false) fail("Smoke-test template must block publishing");
if (smokeTemplate.smoke_test_executed_now !== false) fail("Smoke-test template must not execute");
if (!smokeTemplate.checks.every((item) => item.executed_now === false)) fail("Smoke-test checks must not execute");

if (review.status !== "non_active_real_static_activation_scaffold_created_pending_audit") fail("Review status mismatch");
if (apply.status !== "non_active_real_static_activation_scaffold_created_pending_audit") fail("Apply status mismatch");
if (inventory.status !== "non_active_real_static_activation_scaffold_files_created") fail("Inventory status mismatch");
if (helperContract.status !== "real_static_activation_helper_contract_created_non_active") fail("Helper contract status mismatch");
if (guard.status !== "non_active_real_static_activation_guards_confirmed") fail("Guard status mismatch");
if (readiness.status !== "ready_for_ag18f_non_active_real_static_activation_scaffold_audit") fail("Readiness status mismatch");

if (inventory.files.length !== 7) fail("Inventory must record seven scaffold files");
if (inventory.helper_file_intentionally_outside_api !== true) fail("Helper must be outside API");
if (inventory.no_active_endpoint_created !== true) fail("No active endpoint must be created");
if (inventory.no_github_token_path_created !== true) fail("No GitHub token path must be created");
if (inventory.no_github_write_path_created !== true) fail("No GitHub write path must be created");
if (inventory.no_article_mutation_path_created !== true) fail("No article mutation path must be created");
if (inventory.no_queue_mutation_path_created !== true) fail("No queue mutation path must be created");
if (inventory.no_public_visibility_switch_created !== true) fail("No visibility switch must be created");
if (inventory.no_public_index_mutation_path_created !== true) fail("No public index mutation path must be created");
if (inventory.no_deployment_trigger_created !== true) fail("No deployment trigger must be created");
if (inventory.no_publishing_operation_created !== true) fail("No publishing operation must be created");
if (inventory.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred");

for (const [key, expected] of Object.entries(helperContract.helper_contract)) {
  if (key.endsWith("_allowed") && expected !== false) fail(`Helper contract must block ${key}`);
}

for (const key of [
  "candidate_apply_enabled",
  "github_token_created",
  "github_token_exposed",
  "github_token_wired",
  "github_write_enabled",
  "article_mutation_enabled",
  "queue_mutation_enabled",
  "public_visibility_switch_enabled",
  "public_index_update_enabled",
  "deployment_trigger_enabled",
  "publishing_enabled",
  "admin_editor_execution_enabled",
  "supabase_auth_backend_enabled"
]) {
  if (guard.guard_assertions[key] !== false) fail(`Guard must block ${key}`);
}

if (readiness.ready_for_ag18f !== true) fail("AG18F readiness missing");
if (readiness.static_github_controlled_first !== true) fail("Static/GitHub first readiness missing");
if (readiness.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend deferred readiness missing");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag18f_boundary_created_not_started") fail("AG18F boundary status mismatch");
if (boundary.next_stage_id !== "AG18F") fail("AG18F handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG18F explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag18f !== true) fail("AG18F must carry Supabase/Auth reminder");

if (schema.status !== "schema_non_active_real_static_activation_scaffold_only") fail("Schema status mismatch");

for (const key of [
  "non_active_scaffold_file_creation_allowed_in_ag18e",
  "real_static_activation_helper_allowed_in_ag18e",
  "candidate_apply_template_allowed_in_ag18e",
  "public_index_delta_apply_template_allowed_in_ag18e",
  "github_write_payload_template_allowed_in_ag18e",
  "rollback_record_template_allowed_in_ag18e",
  "smoke_test_checklist_template_allowed_in_ag18e",
  "ag18f_boundary_allowed_in_ag18e"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag18e",
  "article_mutation_allowed_in_ag18e",
  "queue_mutation_allowed_in_ag18e",
  "active_admin_review_queue_record_creation_allowed_in_ag18e",
  "queue_index_mutation_allowed_in_ag18e",
  "admin_action_execution_allowed_in_ag18e",
  "editor_action_execution_allowed_in_ag18e",
  "auth_activation_allowed_in_ag18e",
  "backend_activation_allowed_in_ag18e",
  "supabase_activation_allowed_in_ag18e",
  "database_write_allowed_in_ag18e",
  "github_token_creation_or_exposure_allowed_in_ag18e",
  "github_write_operation_allowed_in_ag18e",
  "active_action_handler_creation_allowed_in_ag18e",
  "api_endpoint_creation_allowed_in_ag18e",
  "public_visibility_switch_allowed_in_ag18e",
  "public_index_mutation_allowed_in_ag18e",
  "public_publishing_operation_allowed_in_ag18e",
  "deployment_trigger_allowed_in_ag18e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, apply, inventory, helperContract, guard, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.non_active_real_static_activation_scaffold_only !== true) fail(`${obj.title || "object"} must be AG18E scaffold-only`);
  if (obj.article_generation_performed_in_ag18e !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag18e !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag18e !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag18e !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag18e !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag18e !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag18e !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag18e !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag18e !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

for (const phrase of ["Purpose", "Scaffold Location", "Created Scaffold Files", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG18E document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag18e", "validate:ag18e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag18e")) {
  fail("validate:project must include validate:ag18e");
}

pass("AG18E registry is present.");
pass("AG18E document is present.");
pass("AG18E review, apply record, scaffold inventory, helper contract, guard record, readiness, AG18F boundary, schema, learning and preview are present.");
pass("AG18D dry-run audit decision is consumed.");
pass("Non-active real static activation helper and templates are created outside /api.");
pass("Helper cannot create/access token, write to GitHub, apply candidate, switch visibility, mutate public index, trigger deployment, publish, access secrets or write files.");
pass("Candidate apply, public index delta, GitHub write, rollback and smoke-test templates preserve non-active controls.");
pass("Supabase/Auth/backend remains deferred and reminder is preserved.");
pass("No credentials, GitHub write, Admin/Editor execution, visibility switch, public index mutation, deployment or publishing are performed.");
pass("AG18F non-active real static activation scaffold audit boundary is created with explicit approval required.");
pass("AG18E is Non-active Real Static Activation Scaffold only.");
