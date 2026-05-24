import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag20c-controlled-static-apply-final-authorization.json",
  "data/content-intelligence/go-live/ag20c-controlled-static-apply-final-authorization-package.json",
  "data/content-intelligence/go-live/ag20c-candidate-static-apply-authorization-summary.json",
  "data/content-intelligence/go-live/ag20c-public-surface-authorization-summary.json",
  "data/content-intelligence/go-live/ag20c-github-write-authorization-no-execution-record.json",
  "data/content-intelligence/go-live/ag20c-rollback-deployment-smoke-test-authorization-summary.json",
  "data/content-intelligence/go-live/ag20c-explicit-approval-phrase-final-gate-record.json",
  "data/content-intelligence/quality-registry/ag20c-controlled-static-apply-final-authorization-blocker-register.json",
  "data/content-intelligence/quality-registry/ag20c-controlled-static-apply-final-authorization-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20c-to-ag20d-controlled-static-apply-final-authorization-audit-boundary.json",
  "data/content-intelligence/go-live/ag20b-controlled-static-apply-final-authorization-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag20b-controlled-static-apply-safety-record.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag20d-controlled-static-apply-final-authorization-audit.json",
  "data/content-intelligence/audit-records/ag20d-controlled-static-apply-final-authorization-audit-report.json",
  "data/content-intelligence/go-live/ag20d-controlled-static-apply-execution-plan-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag20d-controlled-static-apply-final-authorization-safety-record.json",
  "data/content-intelligence/quality-registry/ag20d-controlled-static-apply-execution-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20d-to-ag20e-controlled-static-apply-execution-plan-boundary.json",
  "data/content-intelligence/schema/controlled-static-apply-final-authorization-audit.schema.json",
  "data/content-intelligence/learning/ag20d-controlled-static-apply-final-authorization-audit-learning.json",
  "data/quality/ag20d-controlled-static-apply-final-authorization-audit.json",
  "data/quality/ag20d-controlled-static-apply-final-authorization-audit-preview.json",
  "docs/quality/AG20D_CONTROLLED_STATIC_APPLY_FINAL_AUTHORIZATION_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG20D validation failed: ${message}`);
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

const ag20cReview = readJson("data/content-intelligence/quality-reviews/ag20c-controlled-static-apply-final-authorization.json");
const ag20cPackage = readJson("data/content-intelligence/go-live/ag20c-controlled-static-apply-final-authorization-package.json");
const ag20cCandidate = readJson("data/content-intelligence/go-live/ag20c-candidate-static-apply-authorization-summary.json");
const ag20cSurfaces = readJson("data/content-intelligence/go-live/ag20c-public-surface-authorization-summary.json");
const ag20cGithub = readJson("data/content-intelligence/go-live/ag20c-github-write-authorization-no-execution-record.json");
const ag20cRollback = readJson("data/content-intelligence/go-live/ag20c-rollback-deployment-smoke-test-authorization-summary.json");
const ag20cApprovalGate = readJson("data/content-intelligence/go-live/ag20c-explicit-approval-phrase-final-gate-record.json");
const ag20cBlocker = readJson("data/content-intelligence/quality-registry/ag20c-controlled-static-apply-final-authorization-blocker-register.json");
const ag20cReadiness = readJson("data/content-intelligence/quality-registry/ag20c-controlled-static-apply-final-authorization-audit-readiness-record.json");
const ag20cBoundary = readJson("data/content-intelligence/mutation-plans/ag20c-to-ag20d-controlled-static-apply-final-authorization-audit-boundary.json");
const ag20bDecision = readJson("data/content-intelligence/go-live/ag20b-controlled-static-apply-final-authorization-readiness-decision-record.json");
const ag20bSafety = readJson("data/content-intelligence/quality-registry/ag20b-controlled-static-apply-safety-record.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag20d-controlled-static-apply-final-authorization-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag20d-controlled-static-apply-final-authorization-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag20d-controlled-static-apply-execution-plan-readiness-decision-record.json");
const safety = readJson("data/content-intelligence/quality-registry/ag20d-controlled-static-apply-final-authorization-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag20d-controlled-static-apply-execution-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag20d-to-ag20e-controlled-static-apply-execution-plan-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-final-authorization-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag20d-controlled-static-apply-final-authorization-audit-learning.json");
const registry = readJson("data/quality/ag20d-controlled-static-apply-final-authorization-audit.json");
const preview = readJson("data/quality/ag20d-controlled-static-apply-final-authorization-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG20D_CONTROLLED_STATIC_APPLY_FINAL_AUTHORIZATION_AUDIT.md"), "utf8");

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG20D") fail(`module_id must be AG20D in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag20cReview.status !== "controlled_static_apply_final_authorization_package_created_pending_audit") fail("AG20C review status mismatch");
if (ag20cPackage.status !== "controlled_static_apply_final_authorization_package_created_pending_audit") fail("AG20C package status mismatch");
if (ag20cReadiness.ready_for_ag20d !== true) fail("AG20C readiness for AG20D missing");
if (ag20cBoundary.next_stage_id !== "AG20D") fail("AG20D boundary missing in AG20C");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "controlled_static_apply_final_authorization_audit_passed_ready_for_ag20e_execution_plan") fail("Review status mismatch");
if (audit.status !== "controlled_static_apply_final_authorization_audit_passed") fail("Audit status mismatch");
if (decision.status !== "controlled_static_apply_final_authorization_audit_passed_ready_for_ag20e_execution_plan") fail("Decision status mismatch");
if (safety.status !== "controlled_static_apply_final_authorization_safe_for_execution_plan_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag20e_controlled_static_apply_execution_plan") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 13) fail("AG20D audit must include thirteen checks");
if (audit.failed_checks.length !== 0) fail("AG20D failed checks must be zero");
if (audit.decision.ag20c_final_authorization_package_valid !== true) fail("AG20C final authorization package must be valid");
if (audit.decision.ready_for_controlled_static_apply_execution_plan !== true) fail("AG20E execution plan readiness missing");

if (ag20cPackage.required_future_approval_phrase !== phrase) fail("AG20C package phrase mismatch");
for (const key of [
  "explicit_approval_phrase_executed_now",
  "controlled_static_apply_authorised_now",
  "candidate_apply_enabled_now",
  "github_token_enabled_now",
  "github_write_enabled_now",
  "visibility_switch_enabled_now",
  "public_index_mutation_enabled_now",
  "deployment_enabled_now",
  "publishing_enabled_now"
]) {
  if (ag20cPackage.current_decision_state[key] !== false) fail(`AG20C package must block ${key}`);
}

if (ag20cCandidate.candidate.article_path !== articlePath) fail("Candidate path mismatch");
if (ag20cCandidate.candidate.article_hash !== currentHash) fail("Candidate hash mismatch");
if (ag20cCandidate.current_candidate_state.candidate_authorization_summarised !== true) fail("Candidate authorization summary missing");
for (const key of [
  "candidate_apply_executed_now",
  "article_mutated_now",
  "public_visibility_switched_now",
  "public_index_mutated_now",
  "published_now"
]) {
  if (ag20cCandidate.current_candidate_state[key] !== false) fail(`Candidate state must block ${key}`);
}

for (const surface of ag20cSurfaces.future_authorization_surfaces) {
  if (surface.mutate_now !== false) fail(`Public surface must not mutate now: ${surface.surface_id}`);
}
for (const [key, value] of Object.entries(ag20cSurfaces.current_public_surface_state)) {
  if (value !== false) fail(`Public surface state must remain false: ${key}`);
}

if (ag20cGithub.current_github_state.github_authorization_summarised !== true) fail("GitHub authorization summary missing");
for (const key of [
  "github_token_created",
  "github_token_exposed",
  "github_token_wired",
  "github_token_committed",
  "github_write_enabled",
  "github_write_performed"
]) {
  if (ag20cGithub.current_github_state[key] !== false) fail(`GitHub state must block ${key}`);
}

if (ag20cRollback.current_execution_state.rollback_authorization_summarised !== true) fail("Rollback authorization summary missing");
for (const key of [
  "rollback_executed_now",
  "deployment_triggered_now",
  "smoke_test_executed_now",
  "published_now"
]) {
  if (ag20cRollback.current_execution_state[key] !== false) fail(`Rollback/deployment state must block ${key}`);
}

if (ag20cApprovalGate.required_future_approval_phrase !== phrase) fail("Approval gate phrase mismatch");
if (ag20cApprovalGate.current_gate_state.final_gate_defined !== true) fail("Final gate missing");
for (const key of [
  "explicit_approval_phrase_executed_now",
  "controlled_static_apply_authorised_now",
  "github_write_authorised_now",
  "visibility_switch_authorised_now",
  "public_index_mutation_authorised_now",
  "deployment_authorised_now",
  "publishing_authorised_now"
]) {
  if (ag20cApprovalGate.current_gate_state[key] !== false) fail(`Approval gate must block ${key}`);
}

for (const item of [
  "Explicit approval phrase execution.",
  "Real candidate apply.",
  "Real GitHub token creation.",
  "Real GitHub write.",
  "Real public visibility switch.",
  "Real public index mutation.",
  "Deployment trigger.",
  "Publish execution.",
  "Supabase/Auth/backend activation."
]) {
  if (!ag20cBlocker.blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (ag20bDecision.decision.proceed_to_controlled_static_apply_final_authorization !== true) fail("AG20B decision inheritance missing");
for (const key of [
  "proceed_to_execute_approval_phrase",
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (ag20bDecision.decision[key] !== false) fail(`AG20B decision must block ${key}`);
}

if (ag20bSafety.safety_assertions.final_authorization_allowed !== true) fail("AG20B safety inheritance missing");
for (const key of [
  "approval_phrase_executed",
  "candidate_real_apply_enabled",
  "github_token_created",
  "github_write_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "deployment_trigger_enabled",
  "publishing_enabled"
]) {
  if (ag20bSafety.safety_assertions[key] !== false) fail(`AG20B safety must block ${key}`);
}

if (decision.decision.proceed_to_controlled_static_apply_execution_plan !== true) fail("Decision must approve AG20E execution plan");
for (const key of [
  "proceed_to_execute_approval_phrase",
  "proceed_to_real_candidate_apply",
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

if (safety.safety_assertions.execution_plan_allowed !== true) fail("Safety must allow execution plan only");
for (const key of [
  "approval_phrase_executed",
  "candidate_real_apply_enabled",
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
  "admin_editor_execution_enabled"
]) {
  if (safety.safety_assertions[key] !== false) fail(`Safety must block ${key}`);
}

if (readiness.ready_for_ag20e !== true) fail("AG20E readiness missing");
if (readiness.required_future_approval_phrase !== phrase) fail("Readiness phrase mismatch");
if (readiness.controlled_static_apply_final_authorization_audit_passed !== true) fail("Audit pass readiness missing");
for (const key of [
  "github_token_ready",
  "github_write_ready",
  "candidate_apply_ready",
  "public_visibility_switch_ready",
  "public_index_mutation_ready",
  "deployment_trigger_ready",
  "publish_ready",
  "supabase_activation_ready"
]) {
  if (readiness[key] !== false) fail(`Readiness must block ${key}`);
}

if (boundary.status !== "ag20e_boundary_created_not_started") fail("AG20E boundary status mismatch");
if (boundary.next_stage_id !== "AG20E") fail("AG20E handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG20E explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG20E boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag20e !== true) fail("AG20E must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_final_authorization_audit_only") fail("Schema status mismatch");
for (const key of [
  "final_authorization_audit_allowed_in_ag20d",
  "execution_plan_decision_allowed_in_ag20d",
  "safety_record_allowed_in_ag20d",
  "ag20e_boundary_allowed_in_ag20d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag20d",
  "article_generation_allowed_in_ag20d",
  "article_mutation_allowed_in_ag20d",
  "queue_mutation_allowed_in_ag20d",
  "admin_action_execution_allowed_in_ag20d",
  "editor_action_execution_allowed_in_ag20d",
  "auth_activation_allowed_in_ag20d",
  "backend_activation_allowed_in_ag20d",
  "supabase_activation_allowed_in_ag20d",
  "github_token_creation_or_exposure_allowed_in_ag20d",
  "github_write_operation_allowed_in_ag20d",
  "public_visibility_switch_allowed_in_ag20d",
  "public_index_mutation_allowed_in_ag20d",
  "public_publishing_operation_allowed_in_ag20d",
  "deployment_trigger_allowed_in_ag20d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_final_authorization_audit_only !== true) fail(`${obj.title || "object"} must be AG20D audit-only`);
  if (obj.explicit_approval_phrase_executed_in_ag20d !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag20d !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag20d !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag20d !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag20d !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag20d !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag20d !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag20d !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag20d !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Audit Result", "Decision", "Approval Phrase", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG20D document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag20d", "validate:ag20d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag20d")) {
  fail("validate:project must include validate:ag20d");
}

pass("AG20D registry is present.");
pass("AG20D document is present.");
pass("AG20D review, audit report, execution plan decision, safety, readiness, AG20E boundary, schema, learning and preview are present.");
pass("AG20C controlled static apply final authorization package is consumed.");
pass("Controlled static apply final authorization audit passed with zero failed checks.");
pass("Decision recorded: proceed only to AG20E execution plan.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG20E Controlled Static Apply Execution Plan boundary is created with explicit approval required.");
pass("AG20D is Controlled Static Apply Final Authorization Audit only.");
