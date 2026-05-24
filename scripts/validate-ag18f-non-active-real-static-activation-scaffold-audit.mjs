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
  "data/content-intelligence/quality-reviews/ag18e-non-active-real-static-activation-scaffold.json",
  "data/content-intelligence/apply-records/ag18e-non-active-real-static-activation-scaffold-apply.json",
  "data/content-intelligence/go-live/ag18e-non-active-real-static-activation-scaffold-inventory.json",
  "data/content-intelligence/go-live/ag18e-real-static-activation-helper-contract-record.json",
  "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-guard-record.json",
  "data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18e-to-ag18f-non-active-real-static-activation-scaffold-audit-boundary.json",
  "data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag18d-file-delta-dry-run-safety-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ...scaffoldFiles,

  "data/content-intelligence/quality-reviews/ag18f-non-active-real-static-activation-scaffold-audit.json",
  "data/content-intelligence/audit-records/ag18f-non-active-real-static-activation-scaffold-audit-report.json",
  "data/content-intelligence/closure-records/ag18f-non-active-real-static-activation-scaffold-audit-closure.json",
  "data/content-intelligence/quality-registry/ag18f-non-active-real-static-activation-scaffold-safety-record.json",
  "data/content-intelligence/quality-registry/ag18f-controlled-real-static-activation-planning-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18f-to-ag18z-controlled-real-static-activation-planning-closure-boundary.json",
  "data/content-intelligence/schema/non-active-real-static-activation-scaffold-audit.schema.json",
  "data/content-intelligence/learning/ag18f-non-active-real-static-activation-scaffold-audit-learning.json",
  "data/quality/ag18f-non-active-real-static-activation-scaffold-audit.json",
  "data/quality/ag18f-non-active-real-static-activation-scaffold-audit-preview.json",
  "docs/quality/AG18F_NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG18F validation failed: ${message}`);
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

const ag18eReview = readJson("data/content-intelligence/quality-reviews/ag18e-non-active-real-static-activation-scaffold.json");
const ag18eApply = readJson("data/content-intelligence/apply-records/ag18e-non-active-real-static-activation-scaffold-apply.json");
const ag18eInventory = readJson("data/content-intelligence/go-live/ag18e-non-active-real-static-activation-scaffold-inventory.json");
const ag18eHelperContract = readJson("data/content-intelligence/go-live/ag18e-real-static-activation-helper-contract-record.json");
const ag18eGuard = readJson("data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-guard-record.json");
const ag18eReadiness = readJson("data/content-intelligence/quality-registry/ag18e-non-active-real-static-activation-scaffold-audit-readiness-record.json");
const ag18eBoundary = readJson("data/content-intelligence/mutation-plans/ag18e-to-ag18f-non-active-real-static-activation-scaffold-audit-boundary.json");
const ag18dDecision = readJson("data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json");
const ag18dSafety = readJson("data/content-intelligence/quality-registry/ag18d-file-delta-dry-run-safety-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");

const review = readJson("data/content-intelligence/quality-reviews/ag18f-non-active-real-static-activation-scaffold-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag18f-non-active-real-static-activation-scaffold-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag18f-non-active-real-static-activation-scaffold-audit-closure.json");
const safety = readJson("data/content-intelligence/quality-registry/ag18f-non-active-real-static-activation-scaffold-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag18f-controlled-real-static-activation-planning-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag18f-to-ag18z-controlled-real-static-activation-planning-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/non-active-real-static-activation-scaffold-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag18f-non-active-real-static-activation-scaffold-audit-learning.json");
const registry = readJson("data/quality/ag18f-non-active-real-static-activation-scaffold-audit.json");
const preview = readJson("data/quality/ag18f-non-active-real-static-activation-scaffold-audit-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG18F_NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD_AUDIT.md");

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG18F") fail(`module_id must be AG18F in ${obj.title || "object"}`);
}

if (ag18eReview.status !== "non_active_real_static_activation_scaffold_created_pending_audit") fail("AG18E review status mismatch");
if (ag18eApply.status !== "non_active_real_static_activation_scaffold_created_pending_audit") fail("AG18E apply status mismatch");
if (ag18eReadiness.ready_for_ag18f !== true) fail("AG18E readiness for AG18F missing");
if (ag18eBoundary.next_stage_id !== "AG18F") fail("AG18F boundary missing in AG18E");

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

if (review.status !== "non_active_real_static_activation_scaffold_audit_passed_ready_for_ag18z_closure") fail("Review status mismatch");
if (audit.status !== "non_active_real_static_activation_scaffold_audit_passed") fail("Audit status mismatch");
if (closure.status !== "non_active_real_static_activation_scaffold_audit_passed_ready_for_ag18z_closure") fail("Closure status mismatch");
if (safety.status !== "non_active_real_static_activation_scaffold_safe_no_live_activation_paths") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag18z_controlled_real_static_activation_planning_closure") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 16) fail("AG18F audit must include sixteen checks");
if (audit.failed_checks.length !== 0) fail("AG18F failed checks must be zero");
if (audit.decision.ag18e_scaffold_safe !== true) fail("AG18E scaffold must be safe");
if (audit.decision.active_endpoint_present !== false) fail("Active endpoint must be absent");
if (audit.decision.github_token_path_present !== false) fail("GitHub token path must be absent");
if (audit.decision.github_write_path_present !== false) fail("GitHub write path must be absent");
if (audit.decision.candidate_apply_path_present !== false) fail("Candidate apply path must be absent");
if (audit.decision.public_visibility_switch_present !== false) fail("Visibility switch must be absent");
if (audit.decision.public_index_mutation_present !== false) fail("Public index mutation must be absent");
if (audit.decision.deployment_trigger_present !== false) fail("Deployment trigger must be absent");
if (audit.decision.publishing_operation_present !== false) fail("Publishing operation must be absent");
if (audit.decision.supabase_auth_backend_activation_present !== false) fail("Supabase/Auth/backend activation must be absent");
if (audit.decision.ready_for_ag18z_closure !== true) fail("AG18Z readiness missing");

if (ag18eInventory.no_active_endpoint_created !== true) fail("AG18E inventory must block active endpoint");
if (ag18eInventory.no_github_token_path_created !== true) fail("AG18E inventory must block GitHub token path");
if (ag18eInventory.no_github_write_path_created !== true) fail("AG18E inventory must block GitHub write path");
if (ag18eInventory.no_public_visibility_switch_created !== true) fail("AG18E inventory must block visibility switch");
if (ag18eInventory.no_public_index_mutation_path_created !== true) fail("AG18E inventory must block public index mutation");
if (ag18eInventory.no_deployment_trigger_created !== true) fail("AG18E inventory must block deployment trigger");
if (ag18eInventory.no_publishing_operation_created !== true) fail("AG18E inventory must block publishing");
if (ag18eInventory.supabase_auth_backend_deferred !== true) fail("AG18E inventory must defer Supabase/Auth/backend");

for (const key of [
  "candidate_apply_allowed",
  "github_token_creation_allowed",
  "github_write_allowed",
  "article_mutation_allowed",
  "queue_mutation_allowed",
  "public_visibility_switch_allowed",
  "public_index_update_allowed",
  "deployment_trigger_allowed",
  "publish_allowed",
  "supabase_auth_backend_allowed"
]) {
  if (ag18eHelperContract.helper_contract[key] !== false) fail(`Helper contract must block ${key}`);
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
  if (ag18eGuard.guard_assertions[key] !== false) fail(`AG18E guard must block ${key}`);
}

if (ag18dDecision.decision.proceed_to_non_active_real_static_activation_scaffold !== true) fail("AG18D decision must approve non-active scaffold");
for (const key of [
  "proceed_to_real_candidate_selection_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (ag18dDecision.decision[key] !== false) fail(`AG18D decision must block ${key}`);
}
if (ag18dSafety.safety_assertions.supabase_auth_backend_deferred !== true) fail("AG18D safety must defer Supabase/Auth/backend");

if (closure.closure_decision.close_ag18e_scaffold_audit !== true) fail("Closure must close AG18E scaffold audit");
if (closure.closure_decision.proceed_to_ag18z_controlled_real_static_activation_planning_closure !== true) fail("Closure must hand off to AG18Z");
for (const key of [
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (closure.closure_decision[key] !== false) fail(`Closure must block ${key}`);
}

if (safety.safety_assertions.scaffold_outside_api !== true) fail("Safety must confirm scaffold outside API");
if (safety.safety_assertions.active_api_endpoint_present !== false) fail("Safety must confirm no active endpoint");
for (const key of [
  "candidate_apply_enabled",
  "github_token_created",
  "github_token_exposed",
  "github_token_wired",
  "github_write_enabled",
  "article_mutation_enabled",
  "queue_mutation_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "deployment_trigger_enabled",
  "publishing_enabled",
  "admin_editor_execution_enabled",
  "supabase_auth_backend_enabled"
]) {
  if (safety.safety_assertions[key] !== false) fail(`Safety must block ${key}`);
}

if (readiness.ready_for_ag18z !== true) fail("AG18Z readiness missing");
if (readiness.non_active_real_static_activation_scaffold_audit_passed !== true) fail("AG18F audit pass readiness missing");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.static_github_controlled_first !== true) fail("Static/GitHub first readiness missing");
if (readiness.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend deferred readiness missing");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.candidate_apply_ready !== false) fail("Candidate apply must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag18z_boundary_created_not_started") fail("AG18Z boundary status mismatch");
if (boundary.next_stage_id !== "AG18Z") fail("AG18Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG18Z explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag18z !== true) fail("AG18Z must carry Supabase/Auth reminder");

if (schema.status !== "schema_non_active_real_static_activation_scaffold_audit_only") fail("Schema status mismatch");

for (const key of [
  "scaffold_audit_allowed_in_ag18f",
  "audit_report_allowed_in_ag18f",
  "audit_closure_allowed_in_ag18f",
  "safety_record_allowed_in_ag18f",
  "ag18z_boundary_allowed_in_ag18f"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag18f",
  "article_mutation_allowed_in_ag18f",
  "queue_mutation_allowed_in_ag18f",
  "active_admin_review_queue_record_creation_allowed_in_ag18f",
  "queue_index_mutation_allowed_in_ag18f",
  "admin_action_execution_allowed_in_ag18f",
  "editor_action_execution_allowed_in_ag18f",
  "auth_activation_allowed_in_ag18f",
  "backend_activation_allowed_in_ag18f",
  "supabase_activation_allowed_in_ag18f",
  "github_token_creation_or_exposure_allowed_in_ag18f",
  "github_write_operation_allowed_in_ag18f",
  "public_visibility_switch_allowed_in_ag18f",
  "public_index_mutation_allowed_in_ag18f",
  "public_publishing_operation_allowed_in_ag18f",
  "deployment_trigger_allowed_in_ag18f"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.non_active_real_static_activation_scaffold_audit_only !== true) fail(`${obj.title || "object"} must be AG18F audit-only`);
  if (obj.article_generation_performed_in_ag18f !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag18f !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag18f !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag18f !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag18f !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag18f !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag18f !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag18f !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag18f !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Audit Result", "Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG18F document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag18f", "validate:ag18f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag18f")) {
  fail("validate:project must include validate:ag18f");
}

pass("AG18F registry is present.");
pass("AG18F document is present.");
pass("AG18F review, audit report, closure, safety, readiness, AG18Z boundary, schema, learning and preview are present.");
pass("AG18E non-active real static activation scaffold is consumed.");
pass("Non-active real static activation scaffold audit passed with zero failed checks.");
pass("Scaffold remains outside /api and no active endpoint exists.");
pass("Helper cannot create/access token, write to GitHub, apply candidate, switch visibility, mutate public index, trigger deployment, publish, access secrets or write files.");
pass("Candidate apply, public index delta, GitHub write, rollback and smoke-test templates remain non-active.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG18Z Controlled Real Static Activation Planning Closure boundary is created with explicit approval required.");
pass("AG18F is Non-active Real Static Activation Scaffold Audit only.");
