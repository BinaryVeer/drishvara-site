import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag20z-controlled-static-apply-planning-closure.json",
  "data/content-intelligence/closure-records/ag20z-controlled-static-apply-planning-closure.json",
  "data/content-intelligence/go-live/ag20z-controlled-static-apply-planning-summary.json",
  "data/content-intelligence/quality-registry/ag20z-controlled-static-apply-blocked-register.json",
  "data/content-intelligence/quality-registry/ag20z-controlled-static-apply-transition-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20z-to-ag21a-controlled-static-apply-transition-gate-boundary.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

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
  "data/content-intelligence/schema/controlled-static-apply-transition-gate.schema.json",
  "data/content-intelligence/learning/ag21a-controlled-static-apply-transition-gate-learning.json",
  "data/quality/ag21a-controlled-static-apply-transition-gate.json",
  "data/quality/ag21a-controlled-static-apply-transition-gate-preview.json",
  "docs/quality/AG21A_CONTROLLED_STATIC_APPLY_TRANSITION_GATE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG21A validation failed: ${message}`);
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

const ag20zReview = readJson("data/content-intelligence/quality-reviews/ag20z-controlled-static-apply-planning-closure.json");
const ag20zClosure = readJson("data/content-intelligence/closure-records/ag20z-controlled-static-apply-planning-closure.json");
const ag20zSummary = readJson("data/content-intelligence/go-live/ag20z-controlled-static-apply-planning-summary.json");
const ag20zReadiness = readJson("data/content-intelligence/quality-registry/ag20z-controlled-static-apply-transition-readiness-record.json");
const ag20zBoundary = readJson("data/content-intelligence/mutation-plans/ag20z-to-ag21a-controlled-static-apply-transition-gate-boundary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag21a-controlled-static-apply-transition-gate.json");
const transitionGate = readJson("data/content-intelligence/go-live/ag21a-controlled-static-apply-transition-gate-package.json");
const finalPreconditions = readJson("data/content-intelligence/go-live/ag21a-final-precondition-lock-record.json");
const approvalPhraseLock = readJson("data/content-intelligence/go-live/ag21a-approval-phrase-lock-record.json");
const candidateSurfaceLock = readJson("data/content-intelligence/go-live/ag21a-candidate-and-public-surface-lock-record.json");
const tokenWriteDeployLock = readJson("data/content-intelligence/go-live/ag21a-token-write-deployment-lock-record.json");
const operatorMatrix = readJson("data/content-intelligence/go-live/ag21a-operator-decision-matrix.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag21a-controlled-static-apply-transition-gate-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag21a-controlled-static-apply-transition-gate-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag21a-to-ag21b-controlled-static-apply-transition-gate-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-transition-gate.schema.json");
const learning = readJson("data/content-intelligence/learning/ag21a-controlled-static-apply-transition-gate-learning.json");
const registry = readJson("data/quality/ag21a-controlled-static-apply-transition-gate.json");
const preview = readJson("data/quality/ag21a-controlled-static-apply-transition-gate-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG21A_CONTROLLED_STATIC_APPLY_TRANSITION_GATE.md"), "utf8");

for (const obj of [review, transitionGate, finalPreconditions, approvalPhraseLock, candidateSurfaceLock, tokenWriteDeployLock, operatorMatrix, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG21A") fail(`module_id must be AG21A in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag20zReview.status !== "controlled_static_apply_planning_chain_closed_ready_for_ag21a_transition_gate") fail("AG20Z review status mismatch");
if (ag20zClosure.final_decision.proceed_to_ag21a_controlled_static_apply_transition_gate !== true) fail("AG20Z closure handoff missing");
if (ag20zReadiness.ready_for_ag21a !== true) fail("AG20Z readiness for AG21A missing");
if (ag20zBoundary.next_stage_id !== "AG21A") fail("AG21A boundary missing in AG20Z");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");
if (ag20zSummary.final_ag20_state.ready_for_ag21_controlled_static_apply_transition_gate !== true) fail("AG20Z final state must be ready for AG21 transition gate");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "controlled_static_apply_transition_gate_created_pending_audit") fail("Review status mismatch");
if (transitionGate.status !== "controlled_static_apply_transition_gate_created_pending_audit") fail("Transition gate status mismatch");
if (finalPreconditions.status !== "final_preconditions_locked_for_transition_gate_no_execution") fail("Final preconditions status mismatch");
if (approvalPhraseLock.status !== "approval_phrase_locked_not_executed") fail("Approval phrase lock status mismatch");
if (candidateSurfaceLock.status !== "candidate_and_public_surfaces_locked_no_mutation") fail("Candidate/surface lock status mismatch");
if (tokenWriteDeployLock.status !== "token_write_deployment_locked_no_execution") fail("Token/write/deployment lock status mismatch");
if (operatorMatrix.status !== "operator_decision_matrix_created_no_execution") fail("Operator matrix status mismatch");
if (blocker.status !== "transition_gate_operations_remain_blocked_pending_ag21b_audit") fail("Blocker status mismatch");
if (readiness.status !== "ready_for_ag21b_controlled_static_apply_transition_gate_audit") fail("Readiness status mismatch");

if (transitionGate.transition_gate_only !== true) fail("Transition gate must be transition-gate-only");
if (transitionGate.required_future_approval_phrase !== phrase) fail("Transition gate phrase mismatch");
if (transitionGate.seed_candidate.article_path !== articlePath) fail("Transition gate candidate path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(transitionGate.seed_candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Transition gate candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

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
  if (transitionGate.current_decision_state[key] !== false) fail(`Transition gate must block ${key}`);
}

if (finalPreconditions.required_future_approval_phrase !== phrase) fail("Final preconditions phrase mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(finalPreconditions.seed_candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Final preconditions candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
for (const [key, value] of Object.entries(finalPreconditions.current_lock_state)) {
  if (key === "final_preconditions_locked_for_audit") {
    if (value !== true) fail("Final preconditions must be locked for audit");
  } else if (value !== false) {
    fail(`Final precondition state must remain false: ${key}`);
  }
}

if (approvalPhraseLock.required_future_approval_phrase !== phrase) fail("Approval phrase lock phrase mismatch");
for (const [key, value] of Object.entries(approvalPhraseLock.current_phrase_state)) {
  if (key === "phrase_locked" || key === "phrase_displayed_for_future_use") {
    if (value !== true) fail(`Approval phrase state must confirm ${key}`);
  } else if (value !== false) {
    fail(`Approval phrase state must remain false: ${key}`);
  }
}

if (candidateSurfaceLock.seed_candidate.article_path !== articlePath) fail("Candidate/surface path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(candidateSurfaceLock.seed_candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Candidate/surface hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
for (const surface of candidateSurfaceLock.future_public_surface_candidates) {
  if (surface.mutate_now !== false) fail(`Surface must not mutate now: ${surface.surface_id}`);
}
for (const [key, value] of Object.entries(candidateSurfaceLock.current_surface_state)) {
  if (key === "candidate_locked") {
    if (value !== true) fail("Candidate must be locked");
  } else if (value !== false) {
    fail(`Candidate/surface state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(tokenWriteDeployLock.current_execution_state)) {
  if (key === "token_write_deployment_locked") {
    if (value !== true) fail("Token/write/deployment must be locked");
  } else if (value !== false) {
    fail(`Token/write/deployment state must remain false: ${key}`);
  }
}

for (const item of operatorMatrix.allowed_operator_decisions_now) {
  if (item.allowed_now !== true) fail(`Allowed operator decision must be true: ${item.decision}`);
}
for (const item of operatorMatrix.blocked_operator_decisions_now) {
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
  if (!blocker.blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (readiness.ready_for_ag21b !== true) fail("AG21B readiness missing");
if (readiness.required_future_approval_phrase !== phrase) fail("Readiness phrase mismatch");
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

if (boundary.status !== "ag21b_boundary_created_not_started") fail("AG21B boundary status mismatch");
if (boundary.next_stage_id !== "AG21B") fail("AG21B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG21B explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG21B boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag21b !== true) fail("AG21B must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_transition_gate_only") fail("Schema status mismatch");
for (const key of [
  "transition_gate_package_allowed_in_ag21a",
  "final_precondition_lock_allowed_in_ag21a",
  "approval_phrase_lock_allowed_in_ag21a",
  "candidate_surface_lock_allowed_in_ag21a",
  "token_write_deployment_lock_allowed_in_ag21a",
  "operator_decision_matrix_allowed_in_ag21a",
  "ag21b_boundary_allowed_in_ag21a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag21a",
  "article_generation_allowed_in_ag21a",
  "article_mutation_allowed_in_ag21a",
  "queue_mutation_allowed_in_ag21a",
  "admin_action_execution_allowed_in_ag21a",
  "editor_action_execution_allowed_in_ag21a",
  "auth_activation_allowed_in_ag21a",
  "backend_activation_allowed_in_ag21a",
  "supabase_activation_allowed_in_ag21a",
  "github_token_creation_or_exposure_allowed_in_ag21a",
  "github_write_operation_allowed_in_ag21a",
  "public_visibility_switch_allowed_in_ag21a",
  "public_index_mutation_allowed_in_ag21a",
  "deployment_trigger_allowed_in_ag21a",
  "live_smoke_test_allowed_in_ag21a",
  "rollback_execution_allowed_in_ag21a",
  "public_publishing_operation_allowed_in_ag21a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, transitionGate, finalPreconditions, approvalPhraseLock, candidateSurfaceLock, tokenWriteDeployLock, operatorMatrix, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_transition_gate_only !== true) fail(`${obj.title || "object"} must be AG21A transition-gate-only`);
  if (obj.explicit_approval_phrase_executed_in_ag21a !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag21a !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag21a !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag21a !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag21a !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag21a !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag21a !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.live_smoke_test_performed_in_ag21a !== false) fail(`${obj.title || "object"} must not run live smoke-test`);
  if (obj.rollback_execution_performed_in_ag21a !== false) fail(`${obj.title || "object"} must not execute rollback`);
  if (obj.public_publishing_operation_performed_in_ag21a !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag21a !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Transition Gate Sections", "Approval Phrase", "Decision State", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG21A document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag21a", "validate:ag21a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag21a")) {
  fail("validate:project must include validate:ag21a");
}

pass("AG21A registry is present.");
pass("AG21A document is present.");
pass("AG21A review, transition gate, precondition lock, approval phrase lock, candidate/surface lock, token/write/deployment lock, operator matrix, blocker register, readiness, AG21B boundary, schema, learning and preview are present.");
pass("AG20Z controlled static apply planning closure is consumed.");
pass("Controlled static apply transition gate is created without execution.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG21B Controlled Static Apply Transition Gate Audit boundary is created with explicit approval required.");
pass("AG21A is Controlled Static Apply Transition Gate only.");
