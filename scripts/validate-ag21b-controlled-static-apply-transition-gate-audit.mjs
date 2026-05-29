import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag21a-controlled-static-apply-transition-gate.json",
  "data/content-intelligence/go-live/ag21a-controlled-static-apply-transition-gate-package.json",
  "data/content-intelligence/go-live/ag21a-final-precondition-lock-record.json",
  "data/content-intelligence/go-live/ag21a-approval-phrase-lock-record.json",
  "data/content-intelligence/go-live/ag21a-candidate-and-public-surface-lock-record.json",
  "data/content-intelligence/go-live/ag21a-token-write-deployment-lock-record.json",
  "data/content-intelligence/go-live/ag21a-operator-decision-matrix.json",
  "data/content-intelligence/quality-registry/ag21a-controlled-static-apply-transition-gate-blocker-register.json",
  "data/content-intelligence/quality-registry/ag21a-controlled-static-apply-transition-gate-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag21a-to-ag21b-controlled-static-apply-transition-gate-audit-boundary.json",
  "data/content-intelligence/go-live/ag20z-controlled-static-apply-planning-summary.json",
  "data/content-intelligence/closure-records/ag20z-controlled-static-apply-planning-closure.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag21b-controlled-static-apply-transition-gate-audit.json",
  "data/content-intelligence/audit-records/ag21b-controlled-static-apply-transition-gate-audit-report.json",
  "data/content-intelligence/go-live/ag21b-controlled-static-apply-execution-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag21b-controlled-static-apply-transition-gate-safety-record.json",
  "data/content-intelligence/quality-registry/ag21b-controlled-static-apply-execution-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag21b-to-ag21c-controlled-static-apply-execution-readiness-boundary.json",
  "data/content-intelligence/schema/controlled-static-apply-transition-gate-audit.schema.json",
  "data/content-intelligence/learning/ag21b-controlled-static-apply-transition-gate-audit-learning.json",
  "data/quality/ag21b-controlled-static-apply-transition-gate-audit.json",
  "data/quality/ag21b-controlled-static-apply-transition-gate-audit-preview.json",
  "docs/quality/AG21B_CONTROLLED_STATIC_APPLY_TRANSITION_GATE_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG21B validation failed: ${message}`);
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

const ag21aReview = readJson("data/content-intelligence/quality-reviews/ag21a-controlled-static-apply-transition-gate.json");
const ag21aTransitionGate = readJson("data/content-intelligence/go-live/ag21a-controlled-static-apply-transition-gate-package.json");
const ag21aFinalPreconditions = readJson("data/content-intelligence/go-live/ag21a-final-precondition-lock-record.json");
const ag21aApprovalPhraseLock = readJson("data/content-intelligence/go-live/ag21a-approval-phrase-lock-record.json");
const ag21aCandidateSurfaceLock = readJson("data/content-intelligence/go-live/ag21a-candidate-and-public-surface-lock-record.json");
const ag21aTokenWriteDeployLock = readJson("data/content-intelligence/go-live/ag21a-token-write-deployment-lock-record.json");
const ag21aOperatorMatrix = readJson("data/content-intelligence/go-live/ag21a-operator-decision-matrix.json");
const ag21aBlocker = readJson("data/content-intelligence/quality-registry/ag21a-controlled-static-apply-transition-gate-blocker-register.json");
const ag21aReadiness = readJson("data/content-intelligence/quality-registry/ag21a-controlled-static-apply-transition-gate-audit-readiness-record.json");
const ag21aBoundary = readJson("data/content-intelligence/mutation-plans/ag21a-to-ag21b-controlled-static-apply-transition-gate-audit-boundary.json");
const ag20zSummary = readJson("data/content-intelligence/go-live/ag20z-controlled-static-apply-planning-summary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag21b-controlled-static-apply-transition-gate-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag21b-controlled-static-apply-transition-gate-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag21b-controlled-static-apply-execution-readiness-decision-record.json");
const safety = readJson("data/content-intelligence/quality-registry/ag21b-controlled-static-apply-transition-gate-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag21b-controlled-static-apply-execution-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag21b-to-ag21c-controlled-static-apply-execution-readiness-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-transition-gate-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag21b-controlled-static-apply-transition-gate-audit-learning.json");
const registry = readJson("data/quality/ag21b-controlled-static-apply-transition-gate-audit.json");
const preview = readJson("data/quality/ag21b-controlled-static-apply-transition-gate-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG21B_CONTROLLED_STATIC_APPLY_TRANSITION_GATE_AUDIT.md"), "utf8");

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG21B") fail(`module_id must be AG21B in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag21aReview.status !== "controlled_static_apply_transition_gate_created_pending_audit") fail("AG21A review status mismatch");
if (ag21aTransitionGate.status !== "controlled_static_apply_transition_gate_created_pending_audit") fail("AG21A transition gate status mismatch");
if (ag21aReadiness.ready_for_ag21b !== true) fail("AG21A readiness for AG21B missing");
if (ag21aBoundary.next_stage_id !== "AG21B") fail("AG21B boundary missing in AG21A");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "controlled_static_apply_transition_gate_audit_passed_ready_for_ag21c_execution_readiness") fail("Review status mismatch");
if (audit.status !== "controlled_static_apply_transition_gate_audit_passed") fail("Audit status mismatch");
if (decision.status !== "controlled_static_apply_transition_gate_audit_passed_ready_for_ag21c_execution_readiness") fail("Decision status mismatch");
if (safety.status !== "transition_gate_safe_for_execution_readiness_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag21c_controlled_static_apply_execution_readiness") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 12) fail("AG21B audit must include twelve checks");
if (audit.failed_checks.length !== 0) fail("AG21B failed checks must be zero");
if (audit.decision.ag21a_transition_gate_valid !== true) fail("AG21A transition gate must be valid");
if (audit.decision.ready_for_controlled_static_apply_execution_readiness !== true) fail("AG21C execution readiness missing");

if (ag21aTransitionGate.transition_gate_only !== true) fail("AG21A gate must be transition-gate-only");
if (ag21aTransitionGate.seed_candidate.article_path !== articlePath) fail("AG21A gate candidate path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(ag21aTransitionGate.seed_candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("AG21A gate candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
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
  if (ag21aTransitionGate.current_decision_state[key] !== false) fail(`AG21A transition gate must block ${key}`);
}

for (const [key, value] of Object.entries(ag21aFinalPreconditions.current_lock_state)) {
  if (key === "final_preconditions_locked_for_audit") {
    if (value !== true) fail("Final preconditions must be locked for audit");
  } else if (value !== false) {
    fail(`Final precondition state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(ag21aApprovalPhraseLock.current_phrase_state)) {
  if (key === "phrase_locked" || key === "phrase_displayed_for_future_use") {
    if (value !== true) fail(`Approval phrase state must confirm ${key}`);
  } else if (value !== false) {
    fail(`Approval phrase state must remain false: ${key}`);
  }
}

if (ag21aCandidateSurfaceLock.seed_candidate.article_path !== articlePath) fail("Candidate/surface path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(ag21aCandidateSurfaceLock.seed_candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Candidate/surface hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
for (const surface of ag21aCandidateSurfaceLock.future_public_surface_candidates) {
  if (surface.mutate_now !== false) fail(`Surface must not mutate now: ${surface.surface_id}`);
}
for (const [key, value] of Object.entries(ag21aCandidateSurfaceLock.current_surface_state)) {
  if (key === "candidate_locked") {
    if (value !== true) fail("Candidate must be locked");
  } else if (value !== false) {
    fail(`Candidate/surface state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(ag21aTokenWriteDeployLock.current_execution_state)) {
  if (key === "token_write_deployment_locked") {
    if (value !== true) fail("Token/write/deployment must be locked");
  } else if (value !== false) {
    fail(`Token/write/deployment state must remain false: ${key}`);
  }
}

for (const item of ag21aOperatorMatrix.allowed_operator_decisions_now) {
  if (item.allowed_now !== true) fail(`Allowed operator decision must be true: ${item.decision}`);
}
for (const item of ag21aOperatorMatrix.blocked_operator_decisions_now) {
  if (item.allowed_now !== false) fail(`Blocked operator decision must be false: ${item.decision}`);
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
  if (!ag21aBlocker.blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (ag20zSummary.final_ag20_state.ready_for_ag21_controlled_static_apply_transition_gate !== true) fail("AG20Z transition readiness missing");
for (const key of [
  "explicit_approval_phrase_executed",
  "candidate_apply_enabled",
  "github_token_created",
  "github_write_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "deployment_trigger_enabled",
  "live_smoke_test_enabled",
  "rollback_execution_enabled",
  "publishing_enabled",
  "supabase_auth_backend_enabled"
]) {
  if (ag20zSummary.final_ag20_state[key] !== false) fail(`AG20Z final state must block ${key}`);
}

if (decision.decision.proceed_to_controlled_static_apply_execution_readiness !== true) fail("Decision must approve AG21C execution readiness");
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

if (safety.safety_assertions.execution_readiness_allowed !== true) fail("Safety must allow execution readiness only");
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

if (readiness.ready_for_ag21c !== true) fail("AG21C readiness missing");
if (readiness.required_future_approval_phrase !== phrase) fail("Readiness phrase mismatch");
if (readiness.controlled_static_apply_transition_gate_audit_passed !== true) fail("Audit pass readiness missing");
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

if (boundary.status !== "ag21c_boundary_created_not_started") fail("AG21C boundary status mismatch");
if (boundary.next_stage_id !== "AG21C") fail("AG21C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG21C explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG21C boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag21c !== true) fail("AG21C must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_transition_gate_audit_only") fail("Schema status mismatch");
for (const key of [
  "transition_gate_audit_allowed_in_ag21b",
  "execution_readiness_decision_allowed_in_ag21b",
  "safety_record_allowed_in_ag21b",
  "ag21c_boundary_allowed_in_ag21b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag21b",
  "article_generation_allowed_in_ag21b",
  "article_mutation_allowed_in_ag21b",
  "queue_mutation_allowed_in_ag21b",
  "admin_action_execution_allowed_in_ag21b",
  "editor_action_execution_allowed_in_ag21b",
  "auth_activation_allowed_in_ag21b",
  "backend_activation_allowed_in_ag21b",
  "supabase_activation_allowed_in_ag21b",
  "github_token_creation_or_exposure_allowed_in_ag21b",
  "github_write_operation_allowed_in_ag21b",
  "public_visibility_switch_allowed_in_ag21b",
  "public_index_mutation_allowed_in_ag21b",
  "deployment_trigger_allowed_in_ag21b",
  "live_smoke_test_allowed_in_ag21b",
  "rollback_execution_allowed_in_ag21b",
  "public_publishing_operation_allowed_in_ag21b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_transition_gate_audit_only !== true) fail(`${obj.title || "object"} must be AG21B audit-only`);
  if (obj.explicit_approval_phrase_executed_in_ag21b !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag21b !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag21b !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag21b !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag21b !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag21b !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag21b !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.live_smoke_test_performed_in_ag21b !== false) fail(`${obj.title || "object"} must not run live smoke-test`);
  if (obj.rollback_execution_performed_in_ag21b !== false) fail(`${obj.title || "object"} must not execute rollback`);
  if (obj.public_publishing_operation_performed_in_ag21b !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag21b !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Audit Result", "Decision", "Approval Phrase", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG21B document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag21b", "validate:ag21b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag21b")) {
  fail("validate:project must include validate:ag21b");
}

pass("AG21B registry is present.");
pass("AG21B document is present.");
pass("AG21B review, audit report, execution readiness decision, safety, readiness, AG21C boundary, schema, learning and preview are present.");
pass("AG21A controlled static apply transition gate is consumed.");
pass("Controlled static apply transition gate audit passed with zero failed checks.");
pass("Decision recorded: proceed only to AG21C execution readiness.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG21C Controlled Static Apply Execution Readiness boundary is created with explicit approval required.");
pass("AG21B is Controlled Static Apply Transition Gate Audit only.");
