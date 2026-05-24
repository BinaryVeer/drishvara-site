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
  "data/content-intelligence/quality-reviews/ag17c-hybrid-static-go-live-plan-audit.json",
  "data/content-intelligence/audit-records/ag17c-hybrid-static-go-live-plan-audit-report.json",
  "data/content-intelligence/go-live/ag17c-non-active-static-go-live-scaffold-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag17c-static-go-live-safety-record.json",
  "data/content-intelligence/quality-registry/ag17c-non-active-static-go-live-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17c-to-ag17d-non-active-static-go-live-implementation-scaffold-boundary.json",

  ...scaffoldFiles,

  "data/content-intelligence/quality-reviews/ag17d-non-active-static-go-live-implementation-scaffold.json",
  "data/content-intelligence/apply-records/ag17d-non-active-static-go-live-implementation-scaffold-apply.json",
  "data/content-intelligence/go-live/ag17d-non-active-static-go-live-scaffold-inventory.json",
  "data/content-intelligence/go-live/ag17d-static-go-live-helper-contract-record.json",
  "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-guard-record.json",
  "data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-scaffold-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17d-to-ag17e-non-active-static-go-live-scaffold-audit-boundary.json",
  "data/content-intelligence/schema/non-active-static-go-live-implementation-scaffold.schema.json",
  "data/content-intelligence/learning/ag17d-non-active-static-go-live-implementation-scaffold-learning.json",
  "data/quality/ag17d-non-active-static-go-live-implementation-scaffold.json",
  "data/quality/ag17d-non-active-static-go-live-implementation-scaffold-preview.json",
  "docs/quality/AG17D_NON_ACTIVE_STATIC_GO_LIVE_IMPLEMENTATION_SCAFFOLD.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG17D validation failed: ${message}`);
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

const ag17cReview = readJson("data/content-intelligence/quality-reviews/ag17c-hybrid-static-go-live-plan-audit.json");
const ag17cAudit = readJson("data/content-intelligence/audit-records/ag17c-hybrid-static-go-live-plan-audit-report.json");
const ag17cDecision = readJson("data/content-intelligence/go-live/ag17c-non-active-static-go-live-scaffold-readiness-decision-record.json");
const ag17cReadiness = readJson("data/content-intelligence/quality-registry/ag17c-non-active-static-go-live-scaffold-readiness-record.json");
const ag17cBoundary = readJson("data/content-intelligence/mutation-plans/ag17c-to-ag17d-non-active-static-go-live-implementation-scaffold-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag17d-non-active-static-go-live-implementation-scaffold.json");
const apply = readJson("data/content-intelligence/apply-records/ag17d-non-active-static-go-live-implementation-scaffold-apply.json");
const inventory = readJson("data/content-intelligence/go-live/ag17d-non-active-static-go-live-scaffold-inventory.json");
const helperContract = readJson("data/content-intelligence/go-live/ag17d-static-go-live-helper-contract-record.json");
const guard = readJson("data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-guard-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag17d-non-active-static-go-live-scaffold-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag17d-to-ag17e-non-active-static-go-live-scaffold-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/non-active-static-go-live-implementation-scaffold.schema.json");
const learning = readJson("data/content-intelligence/learning/ag17d-non-active-static-go-live-implementation-scaffold-learning.json");
const registry = readJson("data/quality/ag17d-non-active-static-go-live-implementation-scaffold.json");
const preview = readJson("data/quality/ag17d-non-active-static-go-live-implementation-scaffold-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG17D_NON_ACTIVE_STATIC_GO_LIVE_IMPLEMENTATION_SCAFFOLD.md");

for (const obj of [review, apply, inventory, helperContract, guard, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG17D") fail(`module_id must be AG17D in ${obj.title || "object"}`);
}

if (ag17cReview.status !== "hybrid_static_go_live_plan_audit_passed_non_active_scaffold_ready") fail("AG17C review status mismatch");
if (ag17cAudit.failed_checks.length !== 0) fail("AG17C failed checks must be zero");
if (ag17cDecision.decision.proceed_to_non_active_static_go_live_scaffold !== true) fail("AG17C must approve non-active static scaffold");
if (ag17cDecision.decision.proceed_to_real_github_write !== false) fail("AG17C must block real GitHub write");
if (ag17cDecision.decision.proceed_to_public_visibility_switch !== false) fail("AG17C must block visibility switch");
if (ag17cDecision.decision.proceed_to_public_index_mutation !== false) fail("AG17C must block public index mutation");
if (ag17cDecision.decision.proceed_to_deployment_trigger !== false) fail("AG17C must block deployment");
if (ag17cDecision.decision.proceed_to_publish_execution !== false) fail("AG17C must block publishing");
if (ag17cDecision.decision.proceed_to_supabase_auth_backend_activation !== false) fail("AG17C must block Supabase/Auth/backend");
if (ag17cReadiness.ready_for_ag17d !== true) fail("AG17C readiness for AG17D missing");
if (ag17cBoundary.next_stage_id !== "AG17D") fail("AG17D boundary missing in AG17C");

const helperText = readText("internal-scaffolds/ag17d-non-active-static-go-live/static-go-live-helper.non-active.mjs");
if (!helperText.includes("NON_ACTIVE_STATIC_GO_LIVE_SCAFFOLD_ONLY")) fail("Helper must declare non-active scaffold only");
if (!helperText.includes("github_write_enabled: false")) fail("Helper must disable GitHub write");
if (!helperText.includes("public_visibility_switch_enabled: false")) fail("Helper must disable visibility switch");
if (!helperText.includes("public_index_update_enabled: false")) fail("Helper must disable public index update");
if (!helperText.includes("deployment_trigger_enabled: false")) fail("Helper must disable deployment");
if (!helperText.includes("publishing_enabled: false")) fail("Helper must disable publishing");
if (!helperText.includes("supabase_auth_backend_enabled: false")) fail("Helper must disable Supabase/Auth/backend");
if (/from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|process\.env|child_process|createWriteStream|rmSync|unlinkSync/i.test(helperText)) {
  fail("Helper scaffold must not import fs, access env, call fetch, use GitHub client or write files");
}

const exposureTemplate = readJson("internal-scaffolds/ag17d-non-active-static-go-live/public-exposure-delta.template.json");
const githubTemplate = readJson("internal-scaffolds/ag17d-non-active-static-go-live/github-commit-payload.template.json");
const deploymentTemplate = readJson("internal-scaffolds/ag17d-non-active-static-go-live/deployment-checklist.template.json");
const fixture = readJson("internal-scaffolds/ag17d-non-active-static-go-live/publication-state-fixture.approved-and-blocked.json");

if (exposureTemplate.public_visibility_switch_enabled !== false) fail("Exposure template must block visibility switch");
if (exposureTemplate.public_index_update_enabled !== false) fail("Exposure template must block public index update");
if (exposureTemplate.github_write_enabled !== false) fail("Exposure template must block GitHub write");
if (exposureTemplate.deployment_trigger_enabled !== false) fail("Exposure template must block deployment");
if (exposureTemplate.publishing_enabled !== false) fail("Exposure template must block publishing");

if (githubTemplate.secrets_created_now !== false) fail("GitHub template must not create secrets");
if (githubTemplate.secrets_exposed_now !== false) fail("GitHub template must not expose secrets");
if (githubTemplate.secrets_wired_now !== false) fail("GitHub template must not wire secrets");
if (githubTemplate.github_write_enabled !== false) fail("GitHub template must block write");
if (githubTemplate.can_execute_commit !== false) fail("GitHub template must not execute commit");

if (deploymentTemplate.deployment_trigger_enabled !== false) fail("Deployment template must block deployment trigger");
if (deploymentTemplate.can_trigger_deployment !== false) fail("Deployment template cannot trigger deployment");
if (deploymentTemplate.publishing_enabled !== false) fail("Deployment template must block publishing");
if (!deploymentTemplate.checklist.every((item) => item.executed_now === false)) fail("Deployment checklist items must not execute");

if (fixture.seed_candidate.expected_public_exposure_now !== false) fail("Seed candidate fixture must remain non-public");
if (fixture.blocked_case.expected_public_exposure !== false) fail("Blocked case must remain non-public");
if (fixture.approved_but_not_exposed_case.expected_public_exposure !== false) fail("Approved-but-not-exposed case must remain non-public");
if (fixture.hypothetical_public_case.expected_public_exposure !== true) fail("Hypothetical public case must pass only as hypothetical");
if (fixture.github_write_enabled !== false) fail("Fixture must block GitHub write");
if (fixture.public_visibility_switch_enabled !== false) fail("Fixture must block visibility switch");
if (fixture.public_index_update_enabled !== false) fail("Fixture must block public index update");
if (fixture.deployment_trigger_enabled !== false) fail("Fixture must block deployment");
if (fixture.publishing_enabled !== false) fail("Fixture must block publishing");

if (review.status !== "non_active_static_go_live_scaffold_created_pending_audit") fail("Review status mismatch");
if (apply.status !== "non_active_static_go_live_scaffold_created_pending_audit") fail("Apply status mismatch");
if (inventory.status !== "non_active_static_go_live_scaffold_files_created") fail("Inventory status mismatch");
if (helperContract.status !== "static_go_live_helper_contract_created_non_active") fail("Helper contract status mismatch");
if (guard.status !== "non_active_static_go_live_guards_confirmed") fail("Guard status mismatch");
if (readiness.status !== "ready_for_ag17e_non_active_static_go_live_scaffold_audit") fail("Readiness status mismatch");

if (inventory.files.length !== 6) fail("Inventory must record six scaffold files");
if (inventory.helper_file_intentionally_outside_api !== true) fail("Helper must be outside API");
if (inventory.no_active_endpoint_created !== true) fail("No active endpoint must be created");
if (inventory.no_github_write_path_created !== true) fail("No GitHub write path must be created");
if (inventory.no_public_index_mutation_path_created !== true) fail("No public index mutation path must be created");
if (inventory.no_visibility_switch_created !== true) fail("No visibility switch must be created");
if (inventory.no_deployment_trigger_created !== true) fail("No deployment trigger must be created");
if (inventory.no_publishing_operation_created !== true) fail("No publishing operation must be created");
if (inventory.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred");

if (helperContract.helper_contract.github_write_allowed !== false) fail("Helper contract must block GitHub write");
if (helperContract.helper_contract.public_visibility_switch_allowed !== false) fail("Helper contract must block visibility switch");
if (helperContract.helper_contract.public_index_update_allowed !== false) fail("Helper contract must block public index update");
if (helperContract.helper_contract.deployment_trigger_allowed !== false) fail("Helper contract must block deployment");
if (helperContract.helper_contract.publish_allowed !== false) fail("Helper contract must block publishing");
if (helperContract.helper_contract.supabase_auth_backend_allowed !== false) fail("Helper contract must block Supabase/Auth/backend");

if (guard.guard_assertions.github_write_enabled !== false) fail("Guard must block GitHub write");
if (guard.guard_assertions.github_token_created !== false) fail("Guard must not create token");
if (guard.guard_assertions.github_token_exposed !== false) fail("Guard must not expose token");
if (guard.guard_assertions.github_token_wired !== false) fail("Guard must not wire token");
if (guard.guard_assertions.public_visibility_switch_enabled !== false) fail("Guard must block visibility switch");
if (guard.guard_assertions.public_index_update_enabled !== false) fail("Guard must block public index update");
if (guard.guard_assertions.deployment_trigger_enabled !== false) fail("Guard must block deployment");
if (guard.guard_assertions.publishing_enabled !== false) fail("Guard must block publishing");
if (guard.guard_assertions.supabase_auth_backend_enabled !== false) fail("Guard must block Supabase/Auth/backend");

if (readiness.ready_for_ag17e !== true) fail("AG17E readiness missing");
if (readiness.static_github_controlled_first !== true) fail("Static/GitHub first readiness missing");
if (readiness.supabase_auth_deferred !== true) fail("Supabase/Auth deferred readiness missing");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag17e_boundary_created_not_started") fail("AG17E boundary status mismatch");
if (boundary.next_stage_id !== "AG17E") fail("AG17E handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG17E explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag17e !== true) fail("AG17E must carry Supabase/Auth reminder");

if (schema.status !== "schema_non_active_static_go_live_implementation_scaffold_only") fail("Schema status mismatch");

for (const key of [
  "non_active_scaffold_file_creation_allowed_in_ag17d",
  "static_go_live_helper_allowed_in_ag17d",
  "public_exposure_delta_template_allowed_in_ag17d",
  "github_commit_payload_template_allowed_in_ag17d",
  "deployment_checklist_template_allowed_in_ag17d",
  "publication_state_fixture_allowed_in_ag17d",
  "ag17e_boundary_allowed_in_ag17d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag17d",
  "article_mutation_allowed_in_ag17d",
  "queue_mutation_allowed_in_ag17d",
  "active_admin_review_queue_record_creation_allowed_in_ag17d",
  "queue_index_mutation_allowed_in_ag17d",
  "admin_action_execution_allowed_in_ag17d",
  "editor_action_execution_allowed_in_ag17d",
  "auth_activation_allowed_in_ag17d",
  "backend_activation_allowed_in_ag17d",
  "supabase_activation_allowed_in_ag17d",
  "github_write_operation_allowed_in_ag17d",
  "public_visibility_switch_allowed_in_ag17d",
  "public_index_mutation_allowed_in_ag17d",
  "public_publishing_operation_allowed_in_ag17d",
  "deployment_trigger_allowed_in_ag17d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, apply, inventory, helperContract, guard, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.non_active_static_go_live_implementation_scaffold_only !== true) fail(`${obj.title || "object"} must be AG17D scaffold-only`);
  if (obj.article_generation_performed_in_ag17d !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag17d !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_write_operation_performed_in_ag17d !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.public_visibility_switch_performed_in_ag17d !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag17d !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag17d !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag17d !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag17d !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

for (const phrase of ["Purpose", "Scaffold Location", "Created Scaffold Files", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG17D document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag17d", "validate:ag17d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag17d")) {
  fail("validate:project must include validate:ag17d");
}

pass("AG17D registry is present.");
pass("AG17D document is present.");
pass("AG17D review, apply record, scaffold inventory, helper contract, guard record, readiness, AG17E boundary, schema, learning and preview are present.");
pass("AG17C non-active scaffold decision is consumed.");
pass("Non-active static go-live helper and templates are created outside /api.");
pass("Helper cannot write to GitHub, switch visibility, mutate public index, trigger deployment, publish, access secrets or write files.");
pass("Templates and fixtures preserve no-write, no-deployment and no-publishing controls.");
pass("Supabase/Auth/backend remains deferred and reminder is preserved.");
pass("No credentials, GitHub write, Admin/Editor execution, visibility switch, public index mutation, deployment or publishing are performed.");
pass("AG17E non-active static go-live scaffold audit boundary is created with explicit approval required.");
pass("AG17D is Non-active Static Go-live Implementation Scaffold only.");
