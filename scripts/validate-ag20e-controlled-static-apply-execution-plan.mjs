import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag20d-controlled-static-apply-final-authorization-audit.json",
  "data/content-intelligence/audit-records/ag20d-controlled-static-apply-final-authorization-audit-report.json",
  "data/content-intelligence/go-live/ag20d-controlled-static-apply-execution-plan-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag20d-controlled-static-apply-final-authorization-safety-record.json",
  "data/content-intelligence/quality-registry/ag20d-controlled-static-apply-execution-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20d-to-ag20e-controlled-static-apply-execution-plan-boundary.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag20e-controlled-static-apply-execution-plan.json",
  "data/content-intelligence/go-live/ag20e-controlled-static-apply-execution-plan.json",
  "data/content-intelligence/go-live/ag20e-approval-phrase-execution-sequence-plan.json",
  "data/content-intelligence/go-live/ag20e-github-token-precondition-plan.json",
  "data/content-intelligence/go-live/ag20e-file-mutation-order-plan.json",
  "data/content-intelligence/go-live/ag20e-public-surface-switch-order-plan.json",
  "data/content-intelligence/go-live/ag20e-deployment-smoke-test-order-plan.json",
  "data/content-intelligence/go-live/ag20e-rollback-order-plan.json",
  "data/content-intelligence/quality-registry/ag20e-controlled-static-apply-execution-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag20e-controlled-static-apply-execution-plan-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20e-to-ag20f-controlled-static-apply-execution-plan-audit-boundary.json",
  "data/content-intelligence/schema/controlled-static-apply-execution-plan.schema.json",
  "data/content-intelligence/learning/ag20e-controlled-static-apply-execution-plan-learning.json",
  "data/quality/ag20e-controlled-static-apply-execution-plan.json",
  "data/quality/ag20e-controlled-static-apply-execution-plan-preview.json",
  "docs/quality/AG20E_CONTROLLED_STATIC_APPLY_EXECUTION_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG20E validation failed: ${message}`);
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

const ag20dReview = readJson("data/content-intelligence/quality-reviews/ag20d-controlled-static-apply-final-authorization-audit.json");
const ag20dAudit = readJson("data/content-intelligence/audit-records/ag20d-controlled-static-apply-final-authorization-audit-report.json");
const ag20dDecision = readJson("data/content-intelligence/go-live/ag20d-controlled-static-apply-execution-plan-readiness-decision-record.json");
const ag20dReadiness = readJson("data/content-intelligence/quality-registry/ag20d-controlled-static-apply-execution-plan-readiness-record.json");
const ag20dBoundary = readJson("data/content-intelligence/mutation-plans/ag20d-to-ag20e-controlled-static-apply-execution-plan-boundary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag20e-controlled-static-apply-execution-plan.json");
const executionPlan = readJson("data/content-intelligence/go-live/ag20e-controlled-static-apply-execution-plan.json");
const approvalSequence = readJson("data/content-intelligence/go-live/ag20e-approval-phrase-execution-sequence-plan.json");
const tokenPrecondition = readJson("data/content-intelligence/go-live/ag20e-github-token-precondition-plan.json");
const fileMutationOrder = readJson("data/content-intelligence/go-live/ag20e-file-mutation-order-plan.json");
const publicSurfaceOrder = readJson("data/content-intelligence/go-live/ag20e-public-surface-switch-order-plan.json");
const deploymentSmokeOrder = readJson("data/content-intelligence/go-live/ag20e-deployment-smoke-test-order-plan.json");
const rollbackOrder = readJson("data/content-intelligence/go-live/ag20e-rollback-order-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag20e-controlled-static-apply-execution-plan-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag20e-controlled-static-apply-execution-plan-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag20e-to-ag20f-controlled-static-apply-execution-plan-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-execution-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag20e-controlled-static-apply-execution-plan-learning.json");
const registry = readJson("data/quality/ag20e-controlled-static-apply-execution-plan.json");
const preview = readJson("data/quality/ag20e-controlled-static-apply-execution-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG20E_CONTROLLED_STATIC_APPLY_EXECUTION_PLAN.md"), "utf8");

for (const obj of [review, executionPlan, approvalSequence, tokenPrecondition, fileMutationOrder, publicSurfaceOrder, deploymentSmokeOrder, rollbackOrder, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG20E") fail(`module_id must be AG20E in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag20dReview.status !== "controlled_static_apply_final_authorization_audit_passed_ready_for_ag20e_execution_plan") fail("AG20D review status mismatch");
if (ag20dAudit.failed_checks.length !== 0) fail("AG20D failed checks must be zero");
if (ag20dDecision.decision.proceed_to_controlled_static_apply_execution_plan !== true) fail("AG20D must approve AG20E execution plan");
if (ag20dReadiness.ready_for_ag20e !== true) fail("AG20D readiness for AG20E missing");
if (ag20dBoundary.next_stage_id !== "AG20E") fail("AG20E boundary missing in AG20D");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "controlled_static_apply_execution_plan_created_pending_audit") fail("Review status mismatch");
if (executionPlan.status !== "controlled_static_apply_execution_plan_created_pending_audit") fail("Execution plan status mismatch");
if (approvalSequence.status !== "approval_phrase_execution_sequence_planned_not_executed") fail("Approval sequence status mismatch");
if (tokenPrecondition.status !== "github_token_precondition_planned_no_secret_created") fail("Token precondition status mismatch");
if (fileMutationOrder.status !== "file_mutation_order_planned_no_mutation") fail("File mutation order status mismatch");
if (publicSurfaceOrder.status !== "public_surface_switch_order_planned_no_switch") fail("Public surface order status mismatch");
if (deploymentSmokeOrder.status !== "deployment_smoke_test_order_planned_no_execution") fail("Deployment/smoke-test status mismatch");
if (rollbackOrder.status !== "rollback_order_planned_no_execution") fail("Rollback order status mismatch");
if (blocker.status !== "controlled_static_apply_execution_plan_operations_remain_blocked_pending_ag20f_audit") fail("Blocker status mismatch");
if (readiness.status !== "ready_for_ag20f_controlled_static_apply_execution_plan_audit") fail("Readiness status mismatch");

if (executionPlan.execution_plan_only !== true) fail("Execution plan must be execution-plan-only");
if (executionPlan.required_future_approval_phrase !== phrase) fail("Execution plan phrase mismatch");
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
  if (executionPlan.current_decision_state[key] !== false) fail(`Execution plan must block ${key}`);
}

if (approvalSequence.required_future_approval_phrase !== phrase) fail("Approval sequence phrase mismatch");
for (const key of [
  "explicit_approval_phrase_executed_now",
  "controlled_static_apply_authorised_now",
  "github_write_authorised_now",
  "visibility_switch_authorised_now",
  "public_index_mutation_authorised_now",
  "deployment_authorised_now",
  "publishing_authorised_now"
]) {
  if (approvalSequence.current_state[key] !== false) fail(`Approval sequence must block ${key}`);
}

for (const [key, value] of Object.entries(tokenPrecondition.current_secret_state)) {
  if (key === "token_precondition_defined") {
    if (value !== true) fail("Token precondition must be defined");
  } else if (value !== false) {
    fail(`Token precondition state must remain false: ${key}`);
  }
}

if (fileMutationOrder.candidate.article_path !== articlePath) fail("File mutation order path mismatch");
if (fileMutationOrder.candidate.article_hash !== currentHash) fail("File mutation order hash mismatch");
for (const step of fileMutationOrder.planned_order_for_later_apply) {
  if (step.executed_now !== false) fail(`File mutation step must not execute now: ${step.operation}`);
}
for (const [key, value] of Object.entries(fileMutationOrder.current_mutation_state)) {
  if (key === "file_mutation_order_defined") {
    if (value !== true) fail("File mutation order must be defined");
  } else if (value !== false) {
    fail(`File mutation state must remain false: ${key}`);
  }
}

for (const step of publicSurfaceOrder.planned_surface_order_for_later_apply) {
  if (step.executed_now !== false) fail(`Public surface step must not execute now: ${step.surface_id}`);
}
for (const [key, value] of Object.entries(publicSurfaceOrder.current_public_state)) {
  if (key === "surface_order_defined") {
    if (value !== true) fail("Surface order must be defined");
  } else if (value !== false) {
    fail(`Public surface state must remain false: ${key}`);
  }
}

for (const step of deploymentSmokeOrder.planned_order_for_later_apply) {
  if (step.executed_now !== false) fail(`Deployment/smoke step must not execute now: ${step.operation}`);
}
for (const [key, value] of Object.entries(deploymentSmokeOrder.current_execution_state)) {
  if (key === "deployment_smoke_test_order_defined") {
    if (value !== true) fail("Deployment smoke-test order must be defined");
  } else if (value !== false) {
    fail(`Deployment/smoke state must remain false: ${key}`);
  }
}

for (const step of rollbackOrder.planned_rollback_order_for_later_apply) {
  if (step.executed_now !== false) fail(`Rollback step must not execute now: ${step.operation}`);
}
for (const [key, value] of Object.entries(rollbackOrder.current_rollback_state)) {
  if (key === "rollback_order_defined") {
    if (value !== true) fail("Rollback order must be defined");
  } else if (value !== false) {
    fail(`Rollback state must remain false: ${key}`);
  }
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
  "Live smoke-test execution.",
  "Rollback execution.",
  "Supabase/Auth/backend activation."
]) {
  if (!blocker.blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (readiness.ready_for_ag20f !== true) fail("AG20F readiness missing");
if (readiness.required_future_approval_phrase !== phrase) fail("Readiness phrase mismatch");
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

if (boundary.status !== "ag20f_boundary_created_not_started") fail("AG20F boundary status mismatch");
if (boundary.next_stage_id !== "AG20F") fail("AG20F handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG20F explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG20F boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag20f !== true) fail("AG20F must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_execution_plan_only") fail("Schema status mismatch");
for (const key of [
  "execution_plan_allowed_in_ag20e",
  "approval_sequence_plan_allowed_in_ag20e",
  "token_precondition_plan_allowed_in_ag20e",
  "file_mutation_order_plan_allowed_in_ag20e",
  "public_surface_switch_order_plan_allowed_in_ag20e",
  "deployment_smoke_test_order_plan_allowed_in_ag20e",
  "rollback_order_plan_allowed_in_ag20e",
  "ag20f_boundary_allowed_in_ag20e"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag20e",
  "article_generation_allowed_in_ag20e",
  "article_mutation_allowed_in_ag20e",
  "queue_mutation_allowed_in_ag20e",
  "admin_action_execution_allowed_in_ag20e",
  "editor_action_execution_allowed_in_ag20e",
  "auth_activation_allowed_in_ag20e",
  "backend_activation_allowed_in_ag20e",
  "supabase_activation_allowed_in_ag20e",
  "github_token_creation_or_exposure_allowed_in_ag20e",
  "github_write_operation_allowed_in_ag20e",
  "public_visibility_switch_allowed_in_ag20e",
  "public_index_mutation_allowed_in_ag20e",
  "public_publishing_operation_allowed_in_ag20e",
  "deployment_trigger_allowed_in_ag20e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, executionPlan, approvalSequence, tokenPrecondition, fileMutationOrder, publicSurfaceOrder, deploymentSmokeOrder, rollbackOrder, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_execution_plan_only !== true) fail(`${obj.title || "object"} must be AG20E execution-plan-only`);
  if (obj.explicit_approval_phrase_executed_in_ag20e !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag20e !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag20e !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag20e !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag20e !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag20e !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag20e !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag20e !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag20e !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Execution Plan Sections", "Approval Phrase", "Decision State", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG20E document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag20e", "validate:ag20e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag20e")) {
  fail("validate:project must include validate:ag20e");
}

pass("AG20E registry is present.");
pass("AG20E document is present.");
pass("AG20E review, execution plan, approval sequence, token precondition, file mutation order, public surface order, deployment/smoke-test order, rollback order, blocker register, readiness, AG20F boundary, schema, learning and preview are present.");
pass("AG20D controlled static apply final authorization audit is consumed.");
pass("Controlled static apply execution plan is created without execution.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG20F Controlled Static Apply Execution Plan Audit boundary is created with explicit approval required.");
pass("AG20E is Controlled Static Apply Execution Plan only.");
