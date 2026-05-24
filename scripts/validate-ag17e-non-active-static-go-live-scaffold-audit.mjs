import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const scaffoldFiles = [
  "internal-scaffolds/ag17d-non-active-static-go-live/static-go-live-helper.non-active.mjs",
  "internal-scaffolds/ag17d-non-active-static-go-live/public-exposure-delta.template.json",
  "internal-scaffolds/ag17d-non-active-static-go-live/github-commit-payload.template.json",
  "internal-scaffolds/ag17d-non-active-static-go-live/deployment-checklist.template.json",
  "internal-scaffolds/ag17d-non-active-static-go-live/publication-state-fixture.approved-and-blocked.json",
  "internal-scaffolds/ag17d-non-active-static-go-live/README.md"
];

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag17d-non-active-static-go-live-implementation-scaffold.json",
  "data/content-intelligence/apply-records/ag17d-non-active-static-go-live-implementation-scaffold-apply.json",
  "data/content-intelligence/go-live/ag17d-non-active-static-go-live-scaffold-inventory.json",
  "data/content-intelligence/go-live/ag17d-static-go-live-helper-contract-record.json",
  "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-guard-record.json",
  "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17d-to-ag17e-non-active-static-go-live-scaffold-audit-boundary.json",
  "data/content-intelligence/quality-registry/ag17c-static-go-live-safety-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",

  ...scaffoldFiles,

  "data/content-intelligence/quality-reviews/ag17e-non-active-static-go-live-scaffold-audit.json",
  "data/content-intelligence/audit-records/ag17e-non-active-static-go-live-scaffold-audit-report.json",
  "data/content-intelligence/closure-records/ag17e-non-active-static-go-live-scaffold-closure.json",
  "data/content-intelligence/quality-registry/ag17e-non-active-static-go-live-scaffold-safety-record.json",
  "data/content-intelligence/quality-registry/ag17e-static-go-live-chain-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17e-to-ag17z-static-go-live-chain-closure-boundary.json",
  "data/content-intelligence/schema/non-active-static-go-live-scaffold-audit.schema.json",
  "data/content-intelligence/learning/ag17e-non-active-static-go-live-scaffold-audit-learning.json",
  "data/quality/ag17e-non-active-static-go-live-scaffold-audit.json",
  "data/quality/ag17e-non-active-static-go-live-scaffold-audit-preview.json",
  "docs/quality/AG17E_NON_ACTIVE_STATIC_GO_LIVE_SCAFFOLD_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG17E validation failed: ${message}`);
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

const ag17dReview = readJson("data/content-intelligence/quality-reviews/ag17d-non-active-static-go-live-implementation-scaffold.json");
const ag17dApply = readJson("data/content-intelligence/apply-records/ag17d-non-active-static-go-live-implementation-scaffold-apply.json");
const ag17dInventory = readJson("data/content-intelligence/go-live/ag17d-non-active-static-go-live-scaffold-inventory.json");
const ag17dHelperContract = readJson("data/content-intelligence/go-live/ag17d-static-go-live-helper-contract-record.json");
const ag17dGuard = readJson("data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-guard-record.json");
const ag17dReadiness = readJson("data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-scaffold-audit-readiness-record.json");
const ag17dBoundary = readJson("data/content-intelligence/mutation-plans/ag17d-to-ag17e-non-active-static-go-live-scaffold-audit-boundary.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");

const review = readJson("data/content-intelligence/quality-reviews/ag17e-non-active-static-go-live-scaffold-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag17e-non-active-static-go-live-scaffold-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag17e-non-active-static-go-live-scaffold-closure.json");
const safety = readJson("data/content-intelligence/quality-registry/ag17e-non-active-static-go-live-scaffold-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag17e-static-go-live-chain-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag17e-to-ag17z-static-go-live-chain-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/non-active-static-go-live-scaffold-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag17e-non-active-static-go-live-scaffold-audit-learning.json");
const registry = readJson("data/quality/ag17e-non-active-static-go-live-scaffold-audit.json");
const preview = readJson("data/quality/ag17e-non-active-static-go-live-scaffold-audit-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG17E_NON_ACTIVE_STATIC_GO_LIVE_SCAFFOLD_AUDIT.md");

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG17E") fail(`module_id must be AG17E in ${obj.title || "object"}`);
}

if (ag17dReview.status !== "non_active_static_go_live_scaffold_created_pending_audit") fail("AG17D review status mismatch");
if (ag17dApply.status !== "non_active_static_go_live_scaffold_created_pending_audit") fail("AG17D apply status mismatch");
if (ag17dReadiness.ready_for_ag17e !== true) fail("AG17D readiness for AG17E missing");
if (ag17dBoundary.next_stage_id !== "AG17E") fail("AG17E boundary missing in AG17D");

const helperText = readText("internal-scaffolds/ag17d-non-active-static-go-live/static-go-live-helper.non-active.mjs");
if (!helperText.includes("NON_ACTIVE_STATIC_GO_LIVE_SCAFFOLD_ONLY")) fail("Helper must remain non-active");
if (!helperText.includes("github_write_enabled: false")) fail("Helper must block GitHub write");
if (!helperText.includes("public_visibility_switch_enabled: false")) fail("Helper must block visibility switch");
if (!helperText.includes("public_index_update_enabled: false")) fail("Helper must block public index update");
if (!helperText.includes("deployment_trigger_enabled: false")) fail("Helper must block deployment");
if (!helperText.includes("publishing_enabled: false")) fail("Helper must block publishing");
if (!helperText.includes("supabase_auth_backend_enabled: false")) fail("Helper must block Supabase/Auth/backend");
if (/from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|process\.env|child_process|createWriteStream|rmSync|unlinkSync/i.test(helperText)) {
  fail("Helper contains prohibited runtime text");
}

if (review.status !== "non_active_static_go_live_scaffold_audit_passed_ready_for_ag17z_closure") fail("Review status mismatch");
if (audit.status !== "non_active_static_go_live_scaffold_audit_passed") fail("Audit status mismatch");
if (closure.status !== "non_active_static_go_live_scaffold_audit_passed_ready_for_ag17z_closure") fail("Closure status mismatch");
if (safety.status !== "non_active_static_go_live_scaffold_safe_no_live_activation_paths") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag17z_static_go_live_chain_closure") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 15) fail("AG17E audit must include fifteen checks");
if (audit.failed_checks.length !== 0) fail("AG17E failed checks must be zero");
if (audit.decision.non_active_static_go_live_scaffold_safe !== true) fail("Non-active scaffold must be safe");
if (audit.decision.active_static_go_live_endpoint_present !== false) fail("Active static go-live endpoint must be absent");
if (audit.decision.github_write_path_present !== false) fail("GitHub write path must be absent");
if (audit.decision.public_visibility_switch_present !== false) fail("Visibility switch must be absent");
if (audit.decision.public_index_mutation_present !== false) fail("Public index mutation must be absent");
if (audit.decision.deployment_trigger_present !== false) fail("Deployment trigger must be absent");
if (audit.decision.publishing_operation_present !== false) fail("Publishing operation must be absent");
if (audit.decision.supabase_auth_backend_activation_present !== false) fail("Supabase/Auth/backend activation must be absent");
if (audit.decision.ready_for_ag17z_closure !== true) fail("AG17Z readiness missing");

if (ag17dInventory.no_github_write_path_created !== true) fail("AG17D inventory must block GitHub write path");
if (ag17dInventory.no_public_index_mutation_path_created !== true) fail("AG17D inventory must block public index mutation path");
if (ag17dInventory.no_visibility_switch_created !== true) fail("AG17D inventory must block visibility switch");
if (ag17dInventory.no_deployment_trigger_created !== true) fail("AG17D inventory must block deployment trigger");
if (ag17dInventory.no_publishing_operation_created !== true) fail("AG17D inventory must block publishing");
if (ag17dInventory.supabase_auth_backend_deferred !== true) fail("AG17D inventory must defer Supabase/Auth/backend");

if (ag17dHelperContract.helper_contract.github_write_allowed !== false) fail("Helper contract must block GitHub write");
if (ag17dHelperContract.helper_contract.public_visibility_switch_allowed !== false) fail("Helper contract must block visibility switch");
if (ag17dHelperContract.helper_contract.public_index_update_allowed !== false) fail("Helper contract must block public index update");
if (ag17dHelperContract.helper_contract.deployment_trigger_allowed !== false) fail("Helper contract must block deployment trigger");
if (ag17dHelperContract.helper_contract.publish_allowed !== false) fail("Helper contract must block publishing");
if (ag17dHelperContract.helper_contract.supabase_auth_backend_allowed !== false) fail("Helper contract must block Supabase/Auth/backend");

if (ag17dGuard.guard_assertions.github_write_enabled !== false) fail("AG17D guard must block GitHub write");
if (ag17dGuard.guard_assertions.github_token_created !== false) fail("AG17D guard must not create token");
if (ag17dGuard.guard_assertions.github_token_exposed !== false) fail("AG17D guard must not expose token");
if (ag17dGuard.guard_assertions.github_token_wired !== false) fail("AG17D guard must not wire token");
if (ag17dGuard.guard_assertions.public_visibility_switch_enabled !== false) fail("AG17D guard must block visibility switch");
if (ag17dGuard.guard_assertions.public_index_update_enabled !== false) fail("AG17D guard must block public index update");
if (ag17dGuard.guard_assertions.deployment_trigger_enabled !== false) fail("AG17D guard must block deployment trigger");
if (ag17dGuard.guard_assertions.publishing_enabled !== false) fail("AG17D guard must block publishing");
if (ag17dGuard.guard_assertions.supabase_auth_backend_enabled !== false) fail("AG17D guard must block Supabase/Auth/backend");

if (closure.closure_decision.close_ag17d_scaffold !== true) fail("AG17D scaffold closure must be true");
if (closure.closure_decision.proceed_to_ag17z_static_go_live_chain_closure !== true) fail("AG17Z closure handoff must be true");
if (closure.closure_decision.proceed_to_real_github_write !== false) fail("GitHub write must remain blocked");
if (closure.closure_decision.proceed_to_public_visibility_switch !== false) fail("Visibility switch must remain blocked");
if (closure.closure_decision.proceed_to_public_index_mutation !== false) fail("Public index mutation must remain blocked");
if (closure.closure_decision.proceed_to_deployment_trigger !== false) fail("Deployment must remain blocked");
if (closure.closure_decision.proceed_to_publish_execution !== false) fail("Publishing must remain blocked");
if (closure.closure_decision.proceed_to_supabase_auth_backend_activation !== false) fail("Supabase/Auth/backend must remain blocked");

if (safety.safety_assertions.scaffold_outside_api !== true) fail("Safety must confirm scaffold outside API");
if (safety.safety_assertions.active_api_endpoint_present !== false) fail("Safety must confirm no active endpoint");
if (safety.safety_assertions.github_write_enabled !== false) fail("Safety must block GitHub write");
if (safety.safety_assertions.github_token_created !== false) fail("Safety must not create token");
if (safety.safety_assertions.public_visibility_switch_enabled !== false) fail("Safety must block visibility switch");
if (safety.safety_assertions.public_index_update_enabled !== false) fail("Safety must block public index update");
if (safety.safety_assertions.deployment_trigger_enabled !== false) fail("Safety must block deployment");
if (safety.safety_assertions.publishing_enabled !== false) fail("Safety must block publishing");
if (safety.safety_assertions.supabase_auth_backend_enabled !== false) fail("Safety must block Supabase/Auth/backend");

if (readiness.ready_for_ag17z !== true) fail("AG17Z readiness missing");
if (readiness.non_active_static_go_live_scaffold_audit_passed !== true) fail("Non-active scaffold audit must pass");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.static_github_controlled_first !== true) fail("Static/GitHub first readiness missing");
if (readiness.supabase_auth_deferred !== true) fail("Supabase/Auth deferred readiness missing");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase/Auth reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase/Auth reminder must mention backend later");

if (boundary.status !== "ag17z_boundary_created_not_started") fail("AG17Z boundary status mismatch");
if (boundary.next_stage_id !== "AG17Z") fail("AG17Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG17Z explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag17z !== true) fail("AG17Z must carry Supabase/Auth reminder");

if (schema.status !== "schema_non_active_static_go_live_scaffold_audit_only") fail("Schema status mismatch");

for (const key of [
  "scaffold_audit_allowed_in_ag17e",
  "closure_record_allowed_in_ag17e",
  "safety_record_allowed_in_ag17e",
  "ag17z_boundary_allowed_in_ag17e"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "scaffold_file_mutation_allowed_in_ag17e",
  "article_generation_allowed_in_ag17e",
  "article_mutation_allowed_in_ag17e",
  "queue_mutation_allowed_in_ag17e",
  "active_admin_review_queue_record_creation_allowed_in_ag17e",
  "queue_index_mutation_allowed_in_ag17e",
  "admin_action_execution_allowed_in_ag17e",
  "editor_action_execution_allowed_in_ag17e",
  "auth_activation_allowed_in_ag17e",
  "backend_activation_allowed_in_ag17e",
  "supabase_activation_allowed_in_ag17e",
  "github_write_operation_allowed_in_ag17e",
  "api_endpoint_creation_allowed_in_ag17e",
  "public_visibility_switch_allowed_in_ag17e",
  "public_index_mutation_allowed_in_ag17e",
  "public_publishing_operation_allowed_in_ag17e",
  "deployment_trigger_allowed_in_ag17e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.non_active_static_go_live_scaffold_audit_only !== true) fail(`${obj.title || "object"} must be AG17E audit-only`);
  if (obj.scaffold_file_mutation_performed_in_ag17e !== false) fail(`${obj.title || "object"} must not mutate scaffold files`);
  if (obj.article_generation_performed_in_ag17e !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag17e !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_write_operation_performed_in_ag17e !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.public_visibility_switch_performed_in_ag17e !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag17e !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag17e !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag17e !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag17e !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

for (const phrase of ["Purpose", "Audit Result", "Closure Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG17E document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag17e", "validate:ag17e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag17e")) {
  fail("validate:project must include validate:ag17e");
}

pass("AG17E registry is present.");
pass("AG17E document is present.");
pass("AG17E review, audit report, closure, safety, readiness, AG17Z boundary, schema, learning and preview are present.");
pass("AG17D non-active static go-live scaffold is consumed.");
pass("Non-active static go-live scaffold audit passed with zero failed checks.");
pass("Scaffold remains outside /api and no active static go-live endpoint exists.");
pass("Helper cannot write to GitHub, switch visibility, mutate public index, trigger deployment, publish, access secrets or write files.");
pass("GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG17Z static go-live chain closure boundary is created with explicit approval required.");
pass("AG17E is Non-active Static Go-live Implementation Scaffold Audit only.");
