import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag18a-controlled-real-static-activation-planning.json",
  "data/content-intelligence/go-live/ag18a-real-static-activation-sequence-plan.json",
  "data/content-intelligence/go-live/ag18a-first-public-candidate-selection-plan.json",
  "data/content-intelligence/go-live/ag18a-github-secret-governance-no-secrets-plan.json",
  "data/content-intelligence/go-live/ag18a-public-index-delta-review-plan.json",
  "data/content-intelligence/go-live/ag18a-rollback-smoke-test-plan.json",
  "data/content-intelligence/quality-registry/ag18a-real-static-activation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag18a-controlled-real-static-activation-plan-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18a-to-ag18b-controlled-real-static-activation-plan-audit-boundary.json",
  "data/content-intelligence/quality-registry/ag17z-real-static-activation-blocked-register.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag18b-controlled-real-static-activation-plan-audit.json",
  "data/content-intelligence/audit-records/ag18b-controlled-real-static-activation-plan-audit-report.json",
  "data/content-intelligence/go-live/ag18b-first-candidate-file-delta-dry-run-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag18b-real-static-activation-safety-record.json",
  "data/content-intelligence/quality-registry/ag18b-first-candidate-file-delta-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18b-to-ag18c-first-public-candidate-file-delta-dry-run-boundary.json",
  "data/content-intelligence/schema/controlled-real-static-activation-plan-audit.schema.json",
  "data/content-intelligence/learning/ag18b-controlled-real-static-activation-plan-audit-learning.json",
  "data/quality/ag18b-controlled-real-static-activation-plan-audit.json",
  "data/quality/ag18b-controlled-real-static-activation-plan-audit-preview.json",
  "docs/quality/AG18B_CONTROLLED_REAL_STATIC_ACTIVATION_PLAN_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG18B validation failed: ${message}`);
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

const ag18aReview = readJson("data/content-intelligence/quality-reviews/ag18a-controlled-real-static-activation-planning.json");
const ag18aSequence = readJson("data/content-intelligence/go-live/ag18a-real-static-activation-sequence-plan.json");
const ag18aCandidate = readJson("data/content-intelligence/go-live/ag18a-first-public-candidate-selection-plan.json");
const ag18aSecret = readJson("data/content-intelligence/go-live/ag18a-github-secret-governance-no-secrets-plan.json");
const ag18aDelta = readJson("data/content-intelligence/go-live/ag18a-public-index-delta-review-plan.json");
const ag18aRollback = readJson("data/content-intelligence/go-live/ag18a-rollback-smoke-test-plan.json");
const ag18aBlockers = readJson("data/content-intelligence/quality-registry/ag18a-real-static-activation-blocker-register.json");
const ag18aReadiness = readJson("data/content-intelligence/quality-registry/ag18a-controlled-real-static-activation-plan-audit-readiness-record.json");
const ag18aBoundary = readJson("data/content-intelligence/mutation-plans/ag18a-to-ag18b-controlled-real-static-activation-plan-audit-boundary.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag18b-controlled-real-static-activation-plan-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag18b-controlled-real-static-activation-plan-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag18b-first-candidate-file-delta-dry-run-readiness-decision-record.json");
const safety = readJson("data/content-intelligence/quality-registry/ag18b-real-static-activation-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag18b-first-candidate-file-delta-dry-run-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag18b-to-ag18c-first-public-candidate-file-delta-dry-run-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-real-static-activation-plan-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag18b-controlled-real-static-activation-plan-audit-learning.json");
const registry = readJson("data/quality/ag18b-controlled-real-static-activation-plan-audit.json");
const preview = readJson("data/quality/ag18b-controlled-real-static-activation-plan-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG18B_CONTROLLED_REAL_STATIC_ACTIVATION_PLAN_AUDIT.md"), "utf8");

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG18B") fail(`module_id must be AG18B in ${obj.title || "object"}`);
}

if (ag18aReview.status !== "controlled_real_static_activation_planning_defined_real_activation_blocked") fail("AG18A review status mismatch");
if (ag18aReadiness.ready_for_ag18b !== true) fail("AG18A readiness for AG18B missing");
if (ag18aBoundary.next_stage_id !== "AG18B") fail("AG18B boundary missing in AG18A");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "controlled_real_static_activation_plan_audit_passed_ready_for_ag18c_dry_run") fail("Review status mismatch");
if (audit.status !== "controlled_real_static_activation_plan_audit_passed") fail("Audit status mismatch");
if (decision.status !== "ag18a_plan_audit_passed_ready_for_ag18c_dry_run") fail("Decision status mismatch");
if (safety.status !== "real_static_activation_plan_safe_for_dry_run_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag18c_first_public_candidate_file_delta_dry_run") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 14) fail("AG18B audit must include fourteen checks");
if (audit.failed_checks.length !== 0) fail("AG18B failed checks must be zero");
if (audit.decision.ag18a_plan_valid !== true) fail("AG18A plan must be valid");
if (audit.decision.candidate_planned_not_applied !== true) fail("Candidate must be planned not applied");
if (audit.decision.no_github_token_created !== true) fail("No GitHub token must be created");
if (audit.decision.no_github_write_performed !== true) fail("No GitHub write must occur");
if (audit.decision.no_public_visibility_switch_performed !== true) fail("No visibility switch must occur");
if (audit.decision.no_public_index_mutation_performed !== true) fail("No public index mutation must occur");
if (audit.decision.no_deployment_triggered !== true) fail("No deployment trigger must occur");
if (audit.decision.no_publishing_performed !== true) fail("No publishing must occur");
if (audit.decision.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred");
if (audit.decision.ready_for_first_candidate_file_delta_dry_run !== true) fail("AG18C dry-run readiness missing");

if (!ag18aSequence.sequence.every((step) => step.execution_now === false)) fail("AG18A sequence must not execute");
if (!Object.values(ag18aSequence.execution_state_now).every((value) => value === false)) fail("AG18A execution state must remain false");

if (ag18aCandidate.candidate_under_consideration.hash_verified !== true) fail("Candidate hash must be verified");
if (ag18aCandidate.selection_decision_now.first_candidate_selected_for_real_apply !== false) fail("Candidate real apply must remain false");
if (ag18aCandidate.selection_decision_now.public_visibility_enabled !== false) fail("Candidate visibility must remain false");
if (ag18aCandidate.selection_decision_now.publish_approved_enabled !== false) fail("Candidate publish approval must remain false");
if (ag18aCandidate.selection_decision_now.public_index_allowed_enabled !== false) fail("Candidate public index must remain false");

if (!ag18aSecret.future_secret_placeholders.every((item) =>
  item.created_now === false &&
  item.exposed_now === false &&
  item.wired_now === false &&
  item.committed_now === false
)) fail("No secret may be created/exposed/wired/committed");

if (ag18aSecret.current_secret_state.github_token_created !== false) fail("GitHub token must not be created");
if (ag18aSecret.current_secret_state.github_token_exposed !== false) fail("GitHub token must not be exposed");
if (ag18aSecret.current_secret_state.github_token_wired !== false) fail("GitHub token must not be wired");
if (ag18aSecret.current_secret_state.github_write_enabled !== false) fail("GitHub write must not be enabled");

if (!ag18aDelta.future_delta_targets.every((item) => item.mutation_now === false)) fail("No delta target may mutate now");
if (!Object.values(ag18aDelta.mutation_state_now).every((value) => value === false)) fail("Delta mutation state must remain false");

if (!Object.values(ag18aRollback.current_execution_state).every((value) => value === false)) fail("Rollback/smoke-test state must remain false");

for (const requiredBlocker of [
  "No real GitHub token creation.",
  "No real GitHub write.",
  "No public visibility switch.",
  "No public index mutation.",
  "No deployment trigger.",
  "No publishing operation.",
  "No Supabase/Auth/backend activation."
]) {
  if (!ag18aBlockers.blockers.includes(requiredBlocker)) fail(`Missing AG18A blocker: ${requiredBlocker}`);
}

if (decision.decision.proceed_to_first_public_candidate_file_delta_dry_run !== true) fail("Decision must approve AG18C dry-run");
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
  if (decision.decision[key] !== false) fail(`Decision must block ${key}`);
}
if (decision.recommended_next_stage !== "AG18C") fail("Recommended next stage must be AG18C");

if (safety.safety_assertions.static_github_controlled_first !== true) fail("Safety must confirm static/GitHub first");
if (safety.safety_assertions.supabase_auth_backend_deferred !== true) fail("Safety must defer Supabase/Auth/backend");
if (safety.safety_assertions.github_token_created !== false) fail("Safety must not create GitHub token");
if (safety.safety_assertions.github_write_enabled !== false) fail("Safety must block GitHub write");
if (safety.safety_assertions.public_visibility_switch_enabled !== false) fail("Safety must block visibility switch");
if (safety.safety_assertions.public_index_mutation_enabled !== false) fail("Safety must block public index mutation");
if (safety.safety_assertions.deployment_trigger_enabled !== false) fail("Safety must block deployment");
if (safety.safety_assertions.publishing_enabled !== false) fail("Safety must block publishing");

if (readiness.ready_for_ag18c !== true) fail("AG18C readiness missing");
if (readiness.controlled_real_static_activation_plan_audit_passed !== true) fail("AG18B audit pass readiness missing");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.candidate_file_delta_dry_run_ready !== true) fail("Candidate/file-delta dry-run readiness missing");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag18c_boundary_created_not_started") fail("AG18C boundary status mismatch");
if (boundary.next_stage_id !== "AG18C") fail("AG18C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG18C explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag18c !== true) fail("AG18C must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_real_static_activation_plan_audit_only") fail("Schema status mismatch");

for (const key of [
  "plan_audit_allowed_in_ag18b",
  "dry_run_decision_allowed_in_ag18b",
  "safety_record_allowed_in_ag18b",
  "ag18c_boundary_allowed_in_ag18b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag18b",
  "article_mutation_allowed_in_ag18b",
  "queue_mutation_allowed_in_ag18b",
  "active_admin_review_queue_record_creation_allowed_in_ag18b",
  "queue_index_mutation_allowed_in_ag18b",
  "admin_action_execution_allowed_in_ag18b",
  "editor_action_execution_allowed_in_ag18b",
  "auth_activation_allowed_in_ag18b",
  "backend_activation_allowed_in_ag18b",
  "supabase_activation_allowed_in_ag18b",
  "github_token_creation_or_exposure_allowed_in_ag18b",
  "github_write_operation_allowed_in_ag18b",
  "public_visibility_switch_allowed_in_ag18b",
  "public_index_mutation_allowed_in_ag18b",
  "public_publishing_operation_allowed_in_ag18b",
  "deployment_trigger_allowed_in_ag18b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_real_static_activation_plan_audit_only !== true) fail(`${obj.title || "object"} must be AG18B audit-only`);
  if (obj.article_generation_performed_in_ag18b !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag18b !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag18b !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag18b !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag18b !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag18b !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag18b !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag18b !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag18b !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Audit Result", "Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG18B document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag18b", "validate:ag18b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag18b")) {
  fail("validate:project must include validate:ag18b");
}

pass("AG18B registry is present.");
pass("AG18B document is present.");
pass("AG18B review, audit report, dry-run decision, safety, readiness, AG18C boundary, schema, learning and preview are present.");
pass("AG18A controlled real static activation planning is consumed.");
pass("Controlled real static activation plan audit passed with zero failed checks.");
pass("Decision recorded: proceed only to AG18C first public candidate and file delta dry-run.");
pass("Candidate selection remains planned but not applied.");
pass("GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG18C First Public Candidate and File Delta Dry-run boundary is created with explicit approval required.");
pass("AG18B is Controlled Real Static Activation Plan Audit only.");
