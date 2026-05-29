import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag20a-controlled-static-apply-readiness.json",
  "data/content-intelligence/quality-reviews/ag20b-controlled-static-apply-readiness-audit.json",
  "data/content-intelligence/quality-reviews/ag20c-controlled-static-apply-final-authorization.json",
  "data/content-intelligence/quality-reviews/ag20d-controlled-static-apply-final-authorization-audit.json",
  "data/content-intelligence/quality-reviews/ag20e-controlled-static-apply-execution-plan.json",
  "data/content-intelligence/quality-reviews/ag20f-controlled-static-apply-execution-plan-audit.json",
  "data/content-intelligence/audit-records/ag20f-controlled-static-apply-execution-plan-audit-report.json",
  "data/content-intelligence/closure-records/ag20f-controlled-static-apply-execution-plan-audit-closure.json",
  "data/content-intelligence/quality-registry/ag20f-controlled-static-apply-execution-plan-safety-record.json",
  "data/content-intelligence/quality-registry/ag20f-controlled-static-apply-planning-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20f-to-ag20z-controlled-static-apply-planning-closure-boundary.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag20z-controlled-static-apply-planning-closure.json",
  "data/content-intelligence/closure-records/ag20z-controlled-static-apply-planning-closure.json",
  "data/content-intelligence/go-live/ag20z-controlled-static-apply-planning-summary.json",
  "data/content-intelligence/quality-registry/ag20z-controlled-static-apply-blocked-register.json",
  "data/content-intelligence/quality-registry/ag20z-controlled-static-apply-transition-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20z-to-ag21a-controlled-static-apply-transition-gate-boundary.json",
  "data/content-intelligence/schema/controlled-static-apply-planning-closure.schema.json",
  "data/content-intelligence/learning/ag20z-controlled-static-apply-planning-closure-learning.json",
  "data/quality/ag20z-controlled-static-apply-planning-closure.json",
  "data/quality/ag20z-controlled-static-apply-planning-closure-preview.json",
  "docs/quality/AG20Z_CONTROLLED_STATIC_APPLY_PLANNING_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG20Z validation failed: ${message}`);
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

const ag20fReview = readJson("data/content-intelligence/quality-reviews/ag20f-controlled-static-apply-execution-plan-audit.json");
const ag20fAudit = readJson("data/content-intelligence/audit-records/ag20f-controlled-static-apply-execution-plan-audit-report.json");
const ag20fClosure = readJson("data/content-intelligence/closure-records/ag20f-controlled-static-apply-execution-plan-audit-closure.json");
const ag20fSafety = readJson("data/content-intelligence/quality-registry/ag20f-controlled-static-apply-execution-plan-safety-record.json");
const ag20fReadiness = readJson("data/content-intelligence/quality-registry/ag20f-controlled-static-apply-planning-closure-readiness-record.json");
const ag20fBoundary = readJson("data/content-intelligence/mutation-plans/ag20f-to-ag20z-controlled-static-apply-planning-closure-boundary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag20z-controlled-static-apply-planning-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag20z-controlled-static-apply-planning-closure.json");
const summary = readJson("data/content-intelligence/go-live/ag20z-controlled-static-apply-planning-summary.json");
const blocked = readJson("data/content-intelligence/quality-registry/ag20z-controlled-static-apply-blocked-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag20z-controlled-static-apply-transition-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag20z-to-ag21a-controlled-static-apply-transition-gate-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-planning-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag20z-controlled-static-apply-planning-closure-learning.json");
const registry = readJson("data/quality/ag20z-controlled-static-apply-planning-closure.json");
const preview = readJson("data/quality/ag20z-controlled-static-apply-planning-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG20Z_CONTROLLED_STATIC_APPLY_PLANNING_CLOSURE.md"), "utf8");

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG20Z") fail(`module_id must be AG20Z in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag20fReview.status !== "controlled_static_apply_execution_plan_audit_passed_ready_for_ag20z_closure") fail("AG20F review status mismatch");
if (ag20fAudit.failed_checks.length !== 0) fail("AG20F failed checks must be zero");
if (ag20fClosure.closure_decision.proceed_to_ag20z_controlled_static_apply_planning_closure !== true) fail("AG20F closure handoff missing");
if (ag20fReadiness.ready_for_ag20z !== true) fail("AG20F readiness for AG20Z missing");
if (ag20fBoundary.next_stage_id !== "AG20Z") fail("AG20Z boundary missing in AG20F");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "controlled_static_apply_planning_chain_closed_ready_for_ag21a_transition_gate") fail("Review status mismatch");
if (closure.status !== "controlled_static_apply_planning_chain_closed_ready_for_ag21a_transition_gate") fail("Closure status mismatch");
if (summary.status !== "ag20_controlled_static_apply_planning_completed") fail("Summary status mismatch");
if (blocked.status !== "controlled_static_apply_operations_remain_blocked_pending_ag21_transition") fail("Blocked register status mismatch");
if (readiness.status !== "ready_for_ag21a_controlled_static_apply_transition_gate") fail("Readiness status mismatch");

if (summary.completed_stage_count !== 6) fail("AG20Z must summarise six AG20 stages");
for (const stage of ["AG20A", "AG20B", "AG20C", "AG20D", "AG20E", "AG20F"]) {
  if (!summary.completed_stages.some((item) => item.stage_id === stage)) fail(`Missing completed stage ${stage}`);
}

if (summary.required_future_approval_phrase !== phrase) fail("Summary approval phrase mismatch");
if (summary.seed_candidate.article_path !== articlePath) fail("Summary candidate path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(summary.seed_candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Summary candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

const finalState = summary.final_ag20_state;
for (const key of [
  "readiness_package_created",
  "readiness_audited",
  "final_authorization_package_created",
  "final_authorization_audited",
  "execution_plan_created",
  "execution_plan_audited",
  "ready_for_ag21_controlled_static_apply_transition_gate"
]) {
  if (finalState[key] !== true) fail(`Final AG20 state must confirm ${key}`);
}
for (const key of [
  "explicit_approval_phrase_executed",
  "candidate_apply_enabled",
  "github_token_created",
  "github_token_exposed",
  "github_token_wired",
  "github_write_enabled",
  "article_mutation_enabled",
  "queue_mutation_enabled",
  "admin_editor_execution_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "deployment_trigger_enabled",
  "live_smoke_test_enabled",
  "rollback_execution_enabled",
  "publishing_enabled",
  "supabase_auth_backend_enabled"
]) {
  if (finalState[key] !== false) fail(`Final AG20 state must block ${key}`);
}

for (const item of [
  "Explicit approval phrase execution.",
  "Real candidate apply.",
  "Real GitHub token creation.",
  "Real GitHub write.",
  "Real public visibility switch.",
  "Real public index mutation.",
  "Deployment trigger.",
  "Live smoke-test execution.",
  "Rollback execution.",
  "Publish execution.",
  "Supabase/Auth/backend activation."
]) {
  if (!blocked.blocked_items_after_ag20_closure.includes(item)) fail(`Blocked item missing: ${item}`);
}
if (blocked.supabase_auth_backend_deferred !== true) fail("Blocked register must defer Supabase/Auth/backend");

if (closure.final_decision.ag20_chain_closed !== true) fail("AG20 chain closure missing");
if (closure.final_decision.proceed_to_ag21a_controlled_static_apply_transition_gate !== true) fail("AG21A handoff missing");
if (closure.final_decision.required_future_approval_phrase !== phrase) fail("Closure approval phrase mismatch");
for (const key of [
  "proceed_to_execute_approval_phrase",
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_article_mutation",
  "proceed_to_queue_mutation",
  "proceed_to_admin_editor_execution",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_live_smoke_test_execution",
  "proceed_to_rollback_execution",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (closure.final_decision[key] !== false) fail(`Closure must block ${key}`);
}

if (ag20fSafety.safety_assertions.ag20z_closure_allowed !== true) fail("AG20F safety must allow AG20Z closure");
for (const key of [
  "approval_phrase_executed",
  "candidate_real_apply_enabled",
  "github_token_created",
  "github_write_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "deployment_trigger_enabled",
  "live_smoke_test_enabled",
  "rollback_execution_enabled",
  "publishing_enabled"
]) {
  if (ag20fSafety.safety_assertions[key] !== false) fail(`AG20F safety must block ${key}`);
}

if (readiness.ready_for_ag21a !== true) fail("AG21A readiness missing");
if (readiness.ag20_chain_closed !== true) fail("AG20 chain closure readiness missing");
if (readiness.recommended_next_stage !== "AG21A") fail("Recommended next stage must be AG21A");
if (readiness.required_future_approval_phrase !== phrase) fail("Readiness approval phrase mismatch");
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

if (boundary.status !== "ag21a_boundary_created_not_started") fail("AG21A boundary status mismatch");
if (boundary.next_stage_id !== "AG21A") fail("AG21A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG21A explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG21A boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag21a !== true) fail("AG21A must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_planning_closure_only") fail("Schema status mismatch");
for (const key of [
  "chain_closure_allowed_in_ag20z",
  "planning_summary_allowed_in_ag20z",
  "blocked_register_allowed_in_ag20z",
  "ag21a_boundary_allowed_in_ag20z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag20z",
  "article_generation_allowed_in_ag20z",
  "article_mutation_allowed_in_ag20z",
  "queue_mutation_allowed_in_ag20z",
  "admin_action_execution_allowed_in_ag20z",
  "editor_action_execution_allowed_in_ag20z",
  "auth_activation_allowed_in_ag20z",
  "backend_activation_allowed_in_ag20z",
  "supabase_activation_allowed_in_ag20z",
  "github_token_creation_or_exposure_allowed_in_ag20z",
  "github_write_operation_allowed_in_ag20z",
  "public_visibility_switch_allowed_in_ag20z",
  "public_index_mutation_allowed_in_ag20z",
  "deployment_trigger_allowed_in_ag20z",
  "live_smoke_test_allowed_in_ag20z",
  "rollback_execution_allowed_in_ag20z",
  "public_publishing_operation_allowed_in_ag20z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_planning_closure_only !== true) fail(`${obj.title || "object"} must be AG20Z closure-only`);
  if (obj.explicit_approval_phrase_executed_in_ag20z !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag20z !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag20z !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag20z !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag20z !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag20z !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag20z !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.live_smoke_test_performed_in_ag20z !== false) fail(`${obj.title || "object"} must not run live smoke-test`);
  if (obj.rollback_execution_performed_in_ag20z !== false) fail(`${obj.title || "object"} must not execute rollback`);
  if (obj.public_publishing_operation_performed_in_ag20z !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag20z !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Completed Chain", "Approval Phrase", "Final Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG20Z document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag20z", "validate:ag20z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag20z")) {
  fail("validate:project must include validate:ag20z");
}

pass("AG20Z registry is present.");
pass("AG20Z document is present.");
pass("AG20Z review, closure, summary, blocked register, readiness, AG21A boundary, schema, learning and preview are present.");
pass("AG20A through AG20F chain is consumed and summarised.");
pass("Controlled static apply planning chain is closed.");
pass("Explicit approval phrase is preserved but not executed.");
pass("Real candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback and publishing remain blocked.");
pass("Supabase/Auth/backend remains deferred and future reminder is required.");
pass("AG21A Controlled Static Apply Transition Gate boundary is created with explicit approval required.");
pass("AG20Z is Controlled Static Apply Planning Closure only.");
