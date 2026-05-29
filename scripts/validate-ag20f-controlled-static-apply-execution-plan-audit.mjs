import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
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
  "data/content-intelligence/go-live/ag20d-controlled-static-apply-execution-plan-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag20d-controlled-static-apply-final-authorization-safety-record.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag20f-controlled-static-apply-execution-plan-audit.json",
  "data/content-intelligence/audit-records/ag20f-controlled-static-apply-execution-plan-audit-report.json",
  "data/content-intelligence/closure-records/ag20f-controlled-static-apply-execution-plan-audit-closure.json",
  "data/content-intelligence/quality-registry/ag20f-controlled-static-apply-execution-plan-safety-record.json",
  "data/content-intelligence/quality-registry/ag20f-controlled-static-apply-planning-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20f-to-ag20z-controlled-static-apply-planning-closure-boundary.json",
  "data/content-intelligence/schema/controlled-static-apply-execution-plan-audit.schema.json",
  "data/content-intelligence/learning/ag20f-controlled-static-apply-execution-plan-audit-learning.json",
  "data/quality/ag20f-controlled-static-apply-execution-plan-audit.json",
  "data/quality/ag20f-controlled-static-apply-execution-plan-audit-preview.json",
  "docs/quality/AG20F_CONTROLLED_STATIC_APPLY_EXECUTION_PLAN_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG20F validation failed: ${message}`);
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

function articleHashAcceptedByRepairChain(recordedHash, currentHash, articlePath = null) {
  if (recordedHash === currentHash) return true;

  const repairRecords = [
    {
      path: "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
      status: "public_object_label_layout_repair_applied"
    },
    {
      path: "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",
      status: "credit_reference_surface_cleanup_applied"
    }
  ];

  const edges = [];

  for (const repairRecord of repairRecords) {
    const fullRepairPath = path.join(root, repairRecord.path);
    if (!fs.existsSync(fullRepairPath)) continue;

    try {
      const record = JSON.parse(fs.readFileSync(fullRepairPath, "utf8"));
      const articlePathMatches =
        articlePath === null ||
        articlePath === undefined ||
        record.selected_article_path === articlePath;

      if (
        record.status === repairRecord.status &&
        articlePathMatches &&
        record.pre_repair_hash &&
        record.post_repair_hash
      ) {
        edges.push([record.pre_repair_hash, record.post_repair_hash]);
      }
    } catch {}
  }

  function canReach(start, target) {
    if (!start || !target) return false;

    let current = start;
    const seen = new Set([current]);

    for (let i = 0; i < edges.length + 3; i += 1) {
      if (current === target) return true;

      const edge = edges.find(([from]) => from === current);
      if (!edge) return false;

      current = edge[1];
      if (seen.has(current)) return false;
      seen.add(current);
    }

    return current === target;
  }

  return canReach(recordedHash, currentHash) || canReach(currentHash, recordedHash);
}

function hashPairMatchesCurrentOrAg12cR1Repair(leftHash, rightHash, articlePath = null) {
  return articleHashAcceptedByRepairChain(leftHash, rightHash, articlePath);
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag20eReview = readJson("data/content-intelligence/quality-reviews/ag20e-controlled-static-apply-execution-plan.json");
const ag20ePlan = readJson("data/content-intelligence/go-live/ag20e-controlled-static-apply-execution-plan.json");
const ag20eApprovalSequence = readJson("data/content-intelligence/go-live/ag20e-approval-phrase-execution-sequence-plan.json");
const ag20eTokenPrecondition = readJson("data/content-intelligence/go-live/ag20e-github-token-precondition-plan.json");
const ag20eFileMutationOrder = readJson("data/content-intelligence/go-live/ag20e-file-mutation-order-plan.json");
const ag20ePublicSurfaceOrder = readJson("data/content-intelligence/go-live/ag20e-public-surface-switch-order-plan.json");
const ag20eDeploymentSmokeOrder = readJson("data/content-intelligence/go-live/ag20e-deployment-smoke-test-order-plan.json");
const ag20eRollbackOrder = readJson("data/content-intelligence/go-live/ag20e-rollback-order-plan.json");
const ag20eBlocker = readJson("data/content-intelligence/quality-registry/ag20e-controlled-static-apply-execution-plan-blocker-register.json");
const ag20eReadiness = readJson("data/content-intelligence/quality-registry/ag20e-controlled-static-apply-execution-plan-audit-readiness-record.json");
const ag20eBoundary = readJson("data/content-intelligence/mutation-plans/ag20e-to-ag20f-controlled-static-apply-execution-plan-audit-boundary.json");
const ag20dDecision = readJson("data/content-intelligence/go-live/ag20d-controlled-static-apply-execution-plan-readiness-decision-record.json");
const ag20dSafety = readJson("data/content-intelligence/quality-registry/ag20d-controlled-static-apply-final-authorization-safety-record.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag20f-controlled-static-apply-execution-plan-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag20f-controlled-static-apply-execution-plan-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag20f-controlled-static-apply-execution-plan-audit-closure.json");
const safety = readJson("data/content-intelligence/quality-registry/ag20f-controlled-static-apply-execution-plan-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag20f-controlled-static-apply-planning-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag20f-to-ag20z-controlled-static-apply-planning-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-execution-plan-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag20f-controlled-static-apply-execution-plan-audit-learning.json");
const registry = readJson("data/quality/ag20f-controlled-static-apply-execution-plan-audit.json");
const preview = readJson("data/quality/ag20f-controlled-static-apply-execution-plan-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG20F_CONTROLLED_STATIC_APPLY_EXECUTION_PLAN_AUDIT.md"), "utf8");

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG20F") fail(`module_id must be AG20F in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag20eReview.status !== "controlled_static_apply_execution_plan_created_pending_audit") fail("AG20E review status mismatch");
if (ag20ePlan.status !== "controlled_static_apply_execution_plan_created_pending_audit") fail("AG20E plan status mismatch");
if (ag20eReadiness.ready_for_ag20f !== true) fail("AG20E readiness for AG20F missing");
if (ag20eBoundary.next_stage_id !== "AG20F") fail("AG20F boundary missing in AG20E");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "controlled_static_apply_execution_plan_audit_passed_ready_for_ag20z_closure") fail("Review status mismatch");
if (audit.status !== "controlled_static_apply_execution_plan_audit_passed") fail("Audit status mismatch");
if (closure.status !== "controlled_static_apply_execution_plan_audit_passed_ready_for_ag20z_closure") fail("Closure status mismatch");
if (safety.status !== "execution_plan_safe_for_ag20z_closure_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag20z_controlled_static_apply_planning_closure") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 14) fail("AG20F audit must include fourteen checks");
if (audit.failed_checks.length !== 0) fail("AG20F failed checks must be zero");
if (audit.decision.ag20e_execution_plan_valid !== true) fail("AG20E execution plan must be valid");
if (audit.decision.ready_for_ag20z_closure !== true) fail("AG20Z closure readiness missing");

if (ag20ePlan.execution_plan_only !== true) fail("AG20E plan must be execution-plan-only");
if (ag20ePlan.candidate.article_path !== articlePath) fail("Execution plan candidate path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(ag20ePlan.candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Execution plan candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
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
  if (ag20ePlan.current_decision_state[key] !== false) fail(`Execution plan must block ${key}`);
}

if (ag20eApprovalSequence.required_future_approval_phrase !== phrase) fail("Approval sequence phrase mismatch");
for (const [key, value] of Object.entries(ag20eApprovalSequence.current_state)) {
  if (key === "sequence_defined") {
    if (value !== true) fail("Approval sequence must be defined");
  } else if (value !== false) {
    fail(`Approval sequence state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(ag20eTokenPrecondition.current_secret_state)) {
  if (key === "token_precondition_defined") {
    if (value !== true) fail("Token precondition must be defined");
  } else if (value !== false) {
    fail(`Token state must remain false: ${key}`);
  }
}

if (ag20eFileMutationOrder.candidate.article_path !== articlePath) fail("File mutation path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(ag20eFileMutationOrder.candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("File mutation hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (!ag20eFileMutationOrder.planned_order_for_later_apply.every((step) => step.executed_now === false)) fail("File mutation steps must not execute");
for (const [key, value] of Object.entries(ag20eFileMutationOrder.current_mutation_state)) {
  if (key === "file_mutation_order_defined") {
    if (value !== true) fail("File mutation order must be defined");
  } else if (value !== false) {
    fail(`File mutation state must remain false: ${key}`);
  }
}

if (!ag20ePublicSurfaceOrder.planned_surface_order_for_later_apply.every((step) => step.executed_now === false)) fail("Public surface steps must not execute");
for (const [key, value] of Object.entries(ag20ePublicSurfaceOrder.current_public_state)) {
  if (key === "surface_order_defined") {
    if (value !== true) fail("Surface order must be defined");
  } else if (value !== false) {
    fail(`Public surface state must remain false: ${key}`);
  }
}

if (!ag20eDeploymentSmokeOrder.planned_order_for_later_apply.every((step) => step.executed_now === false)) fail("Deployment/smoke steps must not execute");
for (const [key, value] of Object.entries(ag20eDeploymentSmokeOrder.current_execution_state)) {
  if (key === "deployment_smoke_test_order_defined") {
    if (value !== true) fail("Deployment/smoke order must be defined");
  } else if (value !== false) {
    fail(`Deployment/smoke state must remain false: ${key}`);
  }
}

if (!ag20eRollbackOrder.planned_rollback_order_for_later_apply.every((step) => step.executed_now === false)) fail("Rollback steps must not execute");
for (const [key, value] of Object.entries(ag20eRollbackOrder.current_rollback_state)) {
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
  if (!ag20eBlocker.blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (ag20dDecision.decision.proceed_to_controlled_static_apply_execution_plan !== true) fail("AG20D decision inheritance missing");
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
  if (ag20dDecision.decision[key] !== false) fail(`AG20D decision must block ${key}`);
}

if (ag20dSafety.safety_assertions.execution_plan_allowed !== true) fail("AG20D safety inheritance missing");
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
  if (ag20dSafety.safety_assertions[key] !== false) fail(`AG20D safety must block ${key}`);
}

if (closure.closure_decision.close_ag20e_execution_plan_audit !== true) fail("Closure must close AG20E audit");
if (closure.closure_decision.proceed_to_ag20z_controlled_static_apply_planning_closure !== true) fail("Closure must hand off to AG20Z");
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
  if (closure.closure_decision[key] !== false) fail(`Closure must block ${key}`);
}

if (safety.safety_assertions.ag20z_closure_allowed !== true) fail("Safety must allow AG20Z closure");
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

if (readiness.ready_for_ag20z !== true) fail("AG20Z readiness missing");
if (readiness.required_future_approval_phrase !== phrase) fail("Readiness phrase mismatch");
if (readiness.controlled_static_apply_execution_plan_audit_passed !== true) fail("Audit pass readiness missing");
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

if (boundary.status !== "ag20z_boundary_created_not_started") fail("AG20Z boundary status mismatch");
if (boundary.next_stage_id !== "AG20Z") fail("AG20Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG20Z explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG20Z boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag20z !== true) fail("AG20Z must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_execution_plan_audit_only") fail("Schema status mismatch");
for (const key of [
  "execution_plan_audit_allowed_in_ag20f",
  "audit_report_allowed_in_ag20f",
  "audit_closure_allowed_in_ag20f",
  "safety_record_allowed_in_ag20f",
  "ag20z_boundary_allowed_in_ag20f"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag20f",
  "article_generation_allowed_in_ag20f",
  "article_mutation_allowed_in_ag20f",
  "queue_mutation_allowed_in_ag20f",
  "admin_action_execution_allowed_in_ag20f",
  "editor_action_execution_allowed_in_ag20f",
  "auth_activation_allowed_in_ag20f",
  "backend_activation_allowed_in_ag20f",
  "supabase_activation_allowed_in_ag20f",
  "github_token_creation_or_exposure_allowed_in_ag20f",
  "github_write_operation_allowed_in_ag20f",
  "public_visibility_switch_allowed_in_ag20f",
  "public_index_mutation_allowed_in_ag20f",
  "deployment_trigger_allowed_in_ag20f",
  "live_smoke_test_allowed_in_ag20f",
  "rollback_execution_allowed_in_ag20f",
  "public_publishing_operation_allowed_in_ag20f"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_execution_plan_audit_only !== true) fail(`${obj.title || "object"} must be AG20F audit-only`);
  if (obj.explicit_approval_phrase_executed_in_ag20f !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag20f !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag20f !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag20f !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag20f !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag20f !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag20f !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.live_smoke_test_performed_in_ag20f !== false) fail(`${obj.title || "object"} must not run live smoke-test`);
  if (obj.rollback_execution_performed_in_ag20f !== false) fail(`${obj.title || "object"} must not execute rollback`);
  if (obj.public_publishing_operation_performed_in_ag20f !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag20f !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Audit Result", "Decision", "Approval Phrase", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG20F document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag20f", "validate:ag20f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag20f")) {
  fail("validate:project must include validate:ag20f");
}

pass("AG20F registry is present.");
pass("AG20F document is present.");
pass("AG20F review, audit report, closure, safety, readiness, AG20Z boundary, schema, learning and preview are present.");
pass("AG20E controlled static apply execution plan is consumed.");
pass("Controlled static apply execution plan audit passed with zero failed checks.");
pass("Decision recorded: proceed only to AG20Z planning closure.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG20Z Controlled Static Apply Planning Closure boundary is created with explicit approval required.");
pass("AG20F is Controlled Static Apply Execution Plan Audit only.");
