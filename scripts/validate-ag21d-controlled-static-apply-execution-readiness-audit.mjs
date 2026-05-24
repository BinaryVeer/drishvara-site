import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag21c-controlled-static-apply-execution-readiness.json",
  "data/content-intelligence/go-live/ag21c-controlled-static-apply-execution-readiness-package.json",
  "data/content-intelligence/go-live/ag21c-approval-phrase-pre-execution-readiness-record.json",
  "data/content-intelligence/go-live/ag21c-candidate-apply-pre-execution-readiness-record.json",
  "data/content-intelligence/go-live/ag21c-github-write-pre-execution-readiness-record.json",
  "data/content-intelligence/go-live/ag21c-public-surface-pre-execution-readiness-record.json",
  "data/content-intelligence/go-live/ag21c-deployment-smoke-rollback-pre-execution-readiness-record.json",
  "data/content-intelligence/quality-registry/ag21c-controlled-static-apply-execution-readiness-blocker-register.json",
  "data/content-intelligence/quality-registry/ag21c-controlled-static-apply-execution-readiness-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag21c-to-ag21d-controlled-static-apply-execution-readiness-audit-boundary.json",
  "data/content-intelligence/go-live/ag21b-controlled-static-apply-execution-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag21b-controlled-static-apply-transition-gate-safety-record.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag21d-controlled-static-apply-execution-readiness-audit.json",
  "data/content-intelligence/audit-records/ag21d-controlled-static-apply-execution-readiness-audit-report.json",
  "data/content-intelligence/go-live/ag21d-controlled-static-apply-execution-confirmation-decision-record.json",
  "data/content-intelligence/quality-registry/ag21d-controlled-static-apply-execution-readiness-safety-record.json",
  "data/content-intelligence/quality-registry/ag21d-controlled-static-apply-execution-confirmation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag21d-to-ag21e-controlled-static-apply-execution-confirmation-boundary.json",
  "data/content-intelligence/schema/controlled-static-apply-execution-readiness-audit.schema.json",
  "data/content-intelligence/learning/ag21d-controlled-static-apply-execution-readiness-audit-learning.json",
  "data/quality/ag21d-controlled-static-apply-execution-readiness-audit.json",
  "data/quality/ag21d-controlled-static-apply-execution-readiness-audit-preview.json",
  "docs/quality/AG21D_CONTROLLED_STATIC_APPLY_EXECUTION_READINESS_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG21D validation failed: ${message}`);
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

const ag21cReview = readJson("data/content-intelligence/quality-reviews/ag21c-controlled-static-apply-execution-readiness.json");
const ag21cPackage = readJson("data/content-intelligence/go-live/ag21c-controlled-static-apply-execution-readiness-package.json");
const ag21cReadiness = readJson("data/content-intelligence/quality-registry/ag21c-controlled-static-apply-execution-readiness-audit-readiness-record.json");
const ag21cBoundary = readJson("data/content-intelligence/mutation-plans/ag21c-to-ag21d-controlled-static-apply-execution-readiness-audit-boundary.json");
const ag21bDecision = readJson("data/content-intelligence/go-live/ag21b-controlled-static-apply-execution-readiness-decision-record.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag21d-controlled-static-apply-execution-readiness-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag21d-controlled-static-apply-execution-readiness-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag21d-controlled-static-apply-execution-confirmation-decision-record.json");
const safety = readJson("data/content-intelligence/quality-registry/ag21d-controlled-static-apply-execution-readiness-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag21d-controlled-static-apply-execution-confirmation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag21d-to-ag21e-controlled-static-apply-execution-confirmation-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-execution-readiness-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag21d-controlled-static-apply-execution-readiness-audit-learning.json");
const registry = readJson("data/quality/ag21d-controlled-static-apply-execution-readiness-audit.json");
const preview = readJson("data/quality/ag21d-controlled-static-apply-execution-readiness-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG21D_CONTROLLED_STATIC_APPLY_EXECUTION_READINESS_AUDIT.md"), "utf8");

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG21D") fail(`module_id must be AG21D in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag21cReview.status !== "controlled_static_apply_execution_readiness_package_created_pending_audit") fail("AG21C review status mismatch");
if (ag21cPackage.status !== "controlled_static_apply_execution_readiness_package_created_pending_audit") fail("AG21C package status mismatch");
if (ag21cReadiness.ready_for_ag21d !== true) fail("AG21C readiness for AG21D missing");
if (ag21cBoundary.next_stage_id !== "AG21D") fail("AG21D boundary missing in AG21C");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "controlled_static_apply_execution_readiness_audit_passed_ready_for_ag21e_execution_confirmation") fail("Review status mismatch");
if (audit.status !== "controlled_static_apply_execution_readiness_audit_passed") fail("Audit status mismatch");
if (decision.status !== "controlled_static_apply_execution_readiness_audit_passed_ready_for_ag21e_execution_confirmation") fail("Decision status mismatch");
if (safety.status !== "execution_readiness_safe_for_execution_confirmation_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag21e_controlled_static_apply_execution_confirmation") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 13) fail("AG21D audit must include thirteen checks");
if (audit.failed_checks.length !== 0) fail("AG21D failed checks must be zero");
if (audit.decision.ag21c_execution_readiness_package_valid !== true) fail("AG21C package must be valid");
if (audit.decision.ready_for_controlled_static_apply_execution_confirmation !== true) fail("AG21E readiness missing");

if (ag21cPackage.seed_candidate.article_path !== articlePath) fail("AG21C candidate path mismatch");
if (ag21cPackage.seed_candidate.article_hash !== currentHash) fail("AG21C candidate hash mismatch");

for (const key of [
  "explicit_approval_phrase_executed_now",
  "controlled_static_apply_authorised_now",
  "candidate_apply_enabled_now",
  "github_token_enabled_now",
  "github_write_enabled_now",
  "visibility_switch_enabled_now",
  "public_index_mutation_enabled_now",
  "deployment_enabled_now",
  "live_smoke_test_enabled_now",
  "rollback_enabled_now",
  "publishing_enabled_now"
]) {
  if (ag21cPackage.current_decision_state[key] !== false) fail(`AG21C package must block ${key}`);
}

if (ag21bDecision.decision.proceed_to_controlled_static_apply_execution_readiness !== true) fail("AG21B decision inheritance missing");
for (const key of [
  "proceed_to_execute_approval_phrase",
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_live_smoke_test_execution",
  "proceed_to_rollback_execution",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (ag21bDecision.decision[key] !== false) fail(`AG21B decision must block ${key}`);
}

if (decision.decision.proceed_to_controlled_static_apply_execution_confirmation !== true) fail("Decision must approve AG21E execution confirmation");
for (const key of [
  "proceed_to_execute_approval_phrase",
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_live_smoke_test_execution",
  "proceed_to_rollback_execution",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (decision.decision[key] !== false) fail(`Decision must block ${key}`);
}

if (safety.safety_assertions.execution_confirmation_allowed !== true) fail("Safety must allow execution confirmation only");
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
  "live_smoke_test_enabled",
  "rollback_execution_enabled",
  "publishing_enabled",
  "admin_editor_execution_enabled"
]) {
  if (safety.safety_assertions[key] !== false) fail(`Safety must block ${key}`);
}

if (readiness.ready_for_ag21e !== true) fail("AG21E readiness missing");
if (readiness.required_future_approval_phrase !== phrase) fail("Readiness phrase mismatch");
if (readiness.controlled_static_apply_execution_readiness_audit_passed !== true) fail("Audit pass readiness missing");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
for (const key of [
  "github_token_ready",
  "github_write_ready",
  "candidate_apply_ready",
  "public_visibility_switch_ready",
  "public_index_mutation_ready",
  "deployment_trigger_ready",
  "live_smoke_test_ready",
  "rollback_ready",
  "publish_ready",
  "supabase_activation_ready"
]) {
  if (readiness[key] !== false) fail(`Readiness must block ${key}`);
}

if (boundary.status !== "ag21e_boundary_created_not_started") fail("AG21E boundary status mismatch");
if (boundary.next_stage_id !== "AG21E") fail("AG21E handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG21E explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG21E boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag21e !== true) fail("AG21E must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_execution_readiness_audit_only") fail("Schema status mismatch");
for (const key of [
  "execution_readiness_audit_allowed_in_ag21d",
  "execution_confirmation_decision_allowed_in_ag21d",
  "safety_record_allowed_in_ag21d",
  "ag21e_boundary_allowed_in_ag21d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag21d",
  "article_generation_allowed_in_ag21d",
  "article_mutation_allowed_in_ag21d",
  "queue_mutation_allowed_in_ag21d",
  "admin_action_execution_allowed_in_ag21d",
  "editor_action_execution_allowed_in_ag21d",
  "auth_activation_allowed_in_ag21d",
  "backend_activation_allowed_in_ag21d",
  "supabase_activation_allowed_in_ag21d",
  "github_token_creation_or_exposure_allowed_in_ag21d",
  "github_write_operation_allowed_in_ag21d",
  "public_visibility_switch_allowed_in_ag21d",
  "public_index_mutation_allowed_in_ag21d",
  "deployment_trigger_allowed_in_ag21d",
  "live_smoke_test_allowed_in_ag21d",
  "rollback_execution_allowed_in_ag21d",
  "public_publishing_operation_allowed_in_ag21d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_execution_readiness_audit_only !== true) fail(`${obj.title || "object"} must be AG21D audit-only`);
  if (obj.explicit_approval_phrase_executed_in_ag21d !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag21d !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag21d !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag21d !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag21d !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag21d !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag21d !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.live_smoke_test_performed_in_ag21d !== false) fail(`${obj.title || "object"} must not run live smoke-test`);
  if (obj.rollback_execution_performed_in_ag21d !== false) fail(`${obj.title || "object"} must not execute rollback`);
  if (obj.public_publishing_operation_performed_in_ag21d !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag21d !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Audit Result", "Decision", "Approval Phrase", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG21D document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag21d", "validate:ag21d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag21d")) {
  fail("validate:project must include validate:ag21d");
}

pass("AG21D registry is present.");
pass("AG21D document is present.");
pass("AG21D review, audit report, execution confirmation decision, safety, readiness, AG21E boundary, schema, learning and preview are present.");
pass("AG21C controlled static apply execution readiness package is consumed.");
pass("Controlled static apply execution readiness audit passed with zero failed checks.");
pass("Decision recorded: proceed only to AG21E execution confirmation.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG21E Controlled Static Apply Execution Confirmation boundary is created with explicit approval required.");
pass("AG21D is Controlled Static Apply Execution Readiness Audit only.");
