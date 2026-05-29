import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag19z-first-static-activation-planning-closure.json",
  "data/content-intelligence/closure-records/ag19z-first-static-activation-planning-closure.json",
  "data/content-intelligence/go-live/ag19z-first-static-activation-planning-summary.json",
  "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-blocked-register.json",
  "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19z-to-ag20a-controlled-static-apply-readiness-boundary.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag20a-controlled-static-apply-readiness.json",
  "data/content-intelligence/go-live/ag20a-controlled-static-apply-readiness-package.json",
  "data/content-intelligence/go-live/ag20a-candidate-apply-readiness-check.json",
  "data/content-intelligence/go-live/ag20a-github-token-readiness-no-secrets-check.json",
  "data/content-intelligence/go-live/ag20a-public-surface-apply-map.json",
  "data/content-intelligence/go-live/ag20a-rollback-smoke-test-readiness-check.json",
  "data/content-intelligence/go-live/ag20a-explicit-approval-gate-readiness-check.json",
  "data/content-intelligence/quality-registry/ag20a-controlled-static-apply-blocker-register.json",
  "data/content-intelligence/quality-registry/ag20a-controlled-static-apply-readiness-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20a-to-ag20b-controlled-static-apply-readiness-audit-boundary.json",
  "data/content-intelligence/schema/controlled-static-apply-readiness.schema.json",
  "data/content-intelligence/learning/ag20a-controlled-static-apply-readiness-learning.json",
  "data/quality/ag20a-controlled-static-apply-readiness.json",
  "data/quality/ag20a-controlled-static-apply-readiness-preview.json",
  "docs/quality/AG20A_CONTROLLED_STATIC_APPLY_READINESS.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG20A validation failed: ${message}`);
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

const ag19zReview = readJson("data/content-intelligence/quality-reviews/ag19z-first-static-activation-planning-closure.json");
const ag19zClosure = readJson("data/content-intelligence/closure-records/ag19z-first-static-activation-planning-closure.json");
const ag19zReadiness = readJson("data/content-intelligence/quality-registry/ag19z-controlled-static-apply-readiness-record.json");
const ag19zBoundary = readJson("data/content-intelligence/mutation-plans/ag19z-to-ag20a-controlled-static-apply-readiness-boundary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag20a-controlled-static-apply-readiness.json");
const readinessPackage = readJson("data/content-intelligence/go-live/ag20a-controlled-static-apply-readiness-package.json");
const candidate = readJson("data/content-intelligence/go-live/ag20a-candidate-apply-readiness-check.json");
const github = readJson("data/content-intelligence/go-live/ag20a-github-token-readiness-no-secrets-check.json");
const surfaces = readJson("data/content-intelligence/go-live/ag20a-public-surface-apply-map.json");
const rollback = readJson("data/content-intelligence/go-live/ag20a-rollback-smoke-test-readiness-check.json");
const approvalGate = readJson("data/content-intelligence/go-live/ag20a-explicit-approval-gate-readiness-check.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag20a-controlled-static-apply-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag20a-controlled-static-apply-readiness-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag20a-to-ag20b-controlled-static-apply-readiness-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-readiness.schema.json");
const learning = readJson("data/content-intelligence/learning/ag20a-controlled-static-apply-readiness-learning.json");
const registry = readJson("data/quality/ag20a-controlled-static-apply-readiness.json");
const preview = readJson("data/quality/ag20a-controlled-static-apply-readiness-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG20A_CONTROLLED_STATIC_APPLY_READINESS.md"), "utf8");

for (const obj of [review, readinessPackage, candidate, github, surfaces, rollback, approvalGate, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG20A") fail(`module_id must be AG20A in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag19zReview.status !== "first_static_activation_planning_chain_closed_ready_for_ag20a_controlled_static_apply_readiness") fail("AG19Z review status mismatch");
if (ag19zClosure.final_decision.proceed_to_ag20a_controlled_static_apply_readiness !== true) fail("AG19Z closure handoff missing");
if (ag19zReadiness.ready_for_ag20a !== true) fail("AG19Z readiness for AG20A missing");
if (ag19zBoundary.next_stage_id !== "AG20A") fail("AG20A boundary missing in AG19Z");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "controlled_static_apply_readiness_package_created_pending_audit") fail("Review status mismatch");
if (readinessPackage.status !== "controlled_static_apply_readiness_package_created_pending_audit") fail("Readiness package status mismatch");
if (candidate.status !== "candidate_apply_readiness_checked_no_apply") fail("Candidate check status mismatch");
if (github.status !== "github_token_readiness_checked_no_secrets_created") fail("GitHub token check status mismatch");
if (surfaces.status !== "public_surface_apply_map_defined_no_mutation") fail("Public surface map status mismatch");
if (rollback.status !== "rollback_smoke_test_readiness_checked_no_execution") fail("Rollback/smoke-test status mismatch");
if (approvalGate.status !== "explicit_approval_gate_ready_not_executed") fail("Approval gate status mismatch");
if (blocker.status !== "controlled_static_apply_operations_remain_blocked_pending_ag20b_audit") fail("Blocker status mismatch");
if (readiness.status !== "ready_for_ag20b_controlled_static_apply_readiness_audit") fail("Readiness status mismatch");

if (readinessPackage.required_future_approval_phrase !== phrase) fail("Readiness package phrase mismatch");
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
  if (readinessPackage.current_decision_state[key] !== false) fail(`Readiness package must block ${key}`);
}

if (candidate.candidate.article_path !== articlePath) fail("Candidate path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(candidate.candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (candidate.current_apply_state.candidate_apply_ready_for_audit_review !== true) fail("Candidate must be ready for audit review");
for (const key of ["candidate_apply_executed_now", "article_mutated_now", "public_visibility_switched_now", "published_now"]) {
  if (candidate.current_apply_state[key] !== false) fail(`Candidate apply state must block ${key}`);
}

for (const [key, value] of Object.entries(github.current_secret_state)) {
  if (value !== false) fail(`GitHub secret state must remain false: ${key}`);
}

for (const surface of surfaces.future_surface_map) {
  if (surface.mutated_now !== false) fail(`Surface must not mutate now: ${surface.surface_id}`);
}
for (const [key, value] of Object.entries(surfaces.current_public_surface_state)) {
  if (value !== false) fail(`Public surface state must remain false: ${key}`);
}

if (rollback.current_execution_state.rollback_ready_for_audit_review !== true) fail("Rollback readiness missing");
if (rollback.current_execution_state.smoke_test_ready_for_audit_review !== true) fail("Smoke-test readiness missing");
for (const key of ["rollback_executed_now", "smoke_test_executed_now", "deployment_triggered_now", "published_now"]) {
  if (rollback.current_execution_state[key] !== false) fail(`Rollback/smoke-test state must block ${key}`);
}

if (approvalGate.required_future_approval_phrase !== phrase) fail("Approval gate phrase mismatch");
for (const [key, value] of Object.entries(approvalGate.current_approval_state)) {
  if (value !== false) fail(`Approval gate state must remain false: ${key}`);
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
  if (!blocker.blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (readiness.ready_for_ag20b !== true) fail("AG20B readiness missing");
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

if (boundary.status !== "ag20b_boundary_created_not_started") fail("AG20B boundary status mismatch");
if (boundary.next_stage_id !== "AG20B") fail("AG20B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG20B explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG20B boundary phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag20b !== true) fail("AG20B must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_readiness_only") fail("Schema status mismatch");
for (const key of [
  "readiness_package_allowed_in_ag20a",
  "candidate_apply_readiness_check_allowed_in_ag20a",
  "github_token_readiness_no_secrets_check_allowed_in_ag20a",
  "public_surface_apply_map_allowed_in_ag20a",
  "rollback_smoke_test_readiness_check_allowed_in_ag20a",
  "explicit_approval_gate_readiness_check_allowed_in_ag20a",
  "ag20b_boundary_allowed_in_ag20a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag20a",
  "article_generation_allowed_in_ag20a",
  "article_mutation_allowed_in_ag20a",
  "queue_mutation_allowed_in_ag20a",
  "admin_action_execution_allowed_in_ag20a",
  "editor_action_execution_allowed_in_ag20a",
  "auth_activation_allowed_in_ag20a",
  "backend_activation_allowed_in_ag20a",
  "supabase_activation_allowed_in_ag20a",
  "github_token_creation_or_exposure_allowed_in_ag20a",
  "github_write_operation_allowed_in_ag20a",
  "public_visibility_switch_allowed_in_ag20a",
  "public_index_mutation_allowed_in_ag20a",
  "public_publishing_operation_allowed_in_ag20a",
  "deployment_trigger_allowed_in_ag20a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, readinessPackage, candidate, github, surfaces, rollback, approvalGate, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_readiness_only !== true) fail(`${obj.title || "object"} must be AG20A readiness-only`);
  if (obj.explicit_approval_phrase_executed_in_ag20a !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag20a !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag20a !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag20a !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag20a !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag20a !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag20a !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag20a !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag20a !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Readiness Package Sections", "Approval Phrase", "Decision State", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG20A document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag20a", "validate:ag20a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag20a")) {
  fail("validate:project must include validate:ag20a");
}

pass("AG20A registry is present.");
pass("AG20A document is present.");
pass("AG20A review, readiness package, candidate check, GitHub token no-secrets check, public surface map, rollback/smoke-test check, approval gate, blocker register, readiness, AG20B boundary, schema, learning and preview are present.");
pass("AG19Z first static activation planning closure is consumed.");
pass("Controlled static apply readiness package is created without execution.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG20B Controlled Static Apply Readiness Audit boundary is created with explicit approval required.");
pass("AG20A is Controlled Static Apply Readiness only.");
