import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag21b-controlled-static-apply-transition-gate-audit.json",
  "data/content-intelligence/audit-records/ag21b-controlled-static-apply-transition-gate-audit-report.json",
  "data/content-intelligence/go-live/ag21b-controlled-static-apply-execution-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag21b-controlled-static-apply-transition-gate-safety-record.json",
  "data/content-intelligence/quality-registry/ag21b-controlled-static-apply-execution-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag21b-to-ag21c-controlled-static-apply-execution-readiness-boundary.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

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
  "data/content-intelligence/schema/controlled-static-apply-execution-readiness.schema.json",
  "data/content-intelligence/learning/ag21c-controlled-static-apply-execution-readiness-learning.json",
  "data/quality/ag21c-controlled-static-apply-execution-readiness.json",
  "data/quality/ag21c-controlled-static-apply-execution-readiness-preview.json",
  "docs/quality/AG21C_CONTROLLED_STATIC_APPLY_EXECUTION_READINESS.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG21C validation failed: ${message}`);
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

const ag21bReview = readJson("data/content-intelligence/quality-reviews/ag21b-controlled-static-apply-transition-gate-audit.json");
const ag21bAudit = readJson("data/content-intelligence/audit-records/ag21b-controlled-static-apply-transition-gate-audit-report.json");
const ag21bDecision = readJson("data/content-intelligence/go-live/ag21b-controlled-static-apply-execution-readiness-decision-record.json");
const ag21bReadiness = readJson("data/content-intelligence/quality-registry/ag21b-controlled-static-apply-execution-readiness-record.json");
const ag21bBoundary = readJson("data/content-intelligence/mutation-plans/ag21b-to-ag21c-controlled-static-apply-execution-readiness-boundary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag21c-controlled-static-apply-execution-readiness.json");
const readinessPackage = readJson("data/content-intelligence/go-live/ag21c-controlled-static-apply-execution-readiness-package.json");
const approvalReadiness = readJson("data/content-intelligence/go-live/ag21c-approval-phrase-pre-execution-readiness-record.json");
const candidateReadiness = readJson("data/content-intelligence/go-live/ag21c-candidate-apply-pre-execution-readiness-record.json");
const githubReadiness = readJson("data/content-intelligence/go-live/ag21c-github-write-pre-execution-readiness-record.json");
const publicSurfaceReadiness = readJson("data/content-intelligence/go-live/ag21c-public-surface-pre-execution-readiness-record.json");
const deploySmokeRollbackReadiness = readJson("data/content-intelligence/go-live/ag21c-deployment-smoke-rollback-pre-execution-readiness-record.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag21c-controlled-static-apply-execution-readiness-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag21c-controlled-static-apply-execution-readiness-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag21c-to-ag21d-controlled-static-apply-execution-readiness-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-execution-readiness.schema.json");
const learning = readJson("data/content-intelligence/learning/ag21c-controlled-static-apply-execution-readiness-learning.json");
const registry = readJson("data/quality/ag21c-controlled-static-apply-execution-readiness.json");
const preview = readJson("data/quality/ag21c-controlled-static-apply-execution-readiness-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG21C_CONTROLLED_STATIC_APPLY_EXECUTION_READINESS.md"), "utf8");

for (const obj of [review, readinessPackage, approvalReadiness, candidateReadiness, githubReadiness, publicSurfaceReadiness, deploySmokeRollbackReadiness, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG21C") fail(`module_id must be AG21C in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag21bReview.status !== "controlled_static_apply_transition_gate_audit_passed_ready_for_ag21c_execution_readiness") fail("AG21B review status mismatch");
if (ag21bAudit.failed_checks.length !== 0) fail("AG21B failed checks must be zero");
if (ag21bDecision.decision.proceed_to_controlled_static_apply_execution_readiness !== true) fail("AG21B must approve AG21C execution readiness");
if (ag21bReadiness.ready_for_ag21c !== true) fail("AG21B readiness for AG21C missing");
if (ag21bBoundary.next_stage_id !== "AG21C") fail("AG21C boundary missing in AG21B");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "controlled_static_apply_execution_readiness_package_created_pending_audit") fail("Review status mismatch");
if (readinessPackage.status !== "controlled_static_apply_execution_readiness_package_created_pending_audit") fail("Readiness package status mismatch");
if (approvalReadiness.status !== "approval_phrase_pre_execution_readiness_created_not_executed") fail("Approval readiness status mismatch");
if (candidateReadiness.status !== "candidate_apply_pre_execution_readiness_created_no_apply") fail("Candidate readiness status mismatch");
if (githubReadiness.status !== "github_write_pre_execution_readiness_created_no_token_no_write") fail("GitHub readiness status mismatch");
if (publicSurfaceReadiness.status !== "public_surface_pre_execution_readiness_created_no_mutation") fail("Public surface readiness status mismatch");
if (deploySmokeRollbackReadiness.status !== "deployment_smoke_rollback_pre_execution_readiness_created_no_execution") fail("Deploy/smoke/rollback readiness status mismatch");
if (blocker.status !== "execution_readiness_operations_remain_blocked_pending_ag21d_audit") fail("Blocker status mismatch");
if (readiness.status !== "ready_for_ag21d_controlled_static_apply_execution_readiness_audit") fail("Readiness status mismatch");

if (readinessPackage.execution_readiness_only !== true) fail("Readiness package must be execution-readiness-only");
if (readinessPackage.required_future_approval_phrase !== phrase) fail("Readiness package phrase mismatch");
if (readinessPackage.seed_candidate.article_path !== articlePath) fail("Readiness package candidate path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(readinessPackage.seed_candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Readiness package candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

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
  if (readinessPackage.current_decision_state[key] !== false) fail(`Readiness package must block ${key}`);
}

for (const [key, value] of Object.entries(approvalReadiness.current_state)) {
  if (key === "approval_phrase_readiness_created") {
    if (value !== true) fail("Approval phrase readiness must be created");
  } else if (value !== false) {
    fail(`Approval readiness state must remain false: ${key}`);
  }
}

if (candidateReadiness.seed_candidate.article_path !== articlePath) fail("Candidate readiness path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(candidateReadiness.seed_candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Candidate readiness hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
for (const [key, value] of Object.entries(candidateReadiness.current_state)) {
  if (key === "candidate_readiness_created") {
    if (value !== true) fail("Candidate readiness must be created");
  } else if (value !== false) {
    fail(`Candidate readiness state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(githubReadiness.current_state)) {
  if (key === "github_write_readiness_created") {
    if (value !== true) fail("GitHub readiness must be created");
  } else if (value !== false) {
    fail(`GitHub readiness state must remain false: ${key}`);
  }
}

for (const surface of publicSurfaceReadiness.future_surface_readiness) {
  if (surface.mutate_now !== false) fail(`Public surface must not mutate now: ${surface.surface_id}`);
}
for (const [key, value] of Object.entries(publicSurfaceReadiness.current_state)) {
  if (key === "public_surface_readiness_created") {
    if (value !== true) fail("Public surface readiness must be created");
  } else if (value !== false) {
    fail(`Public surface readiness state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(deploySmokeRollbackReadiness.current_state)) {
  if (key === "deployment_smoke_rollback_readiness_created") {
    if (value !== true) fail("Deployment/smoke/rollback readiness must be created");
  } else if (value !== false) {
    fail(`Deployment/smoke/rollback state must remain false: ${key}`);
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
  "Live smoke-test execution.",
  "Rollback execution.",
  "Publish execution.",
  "Supabase/Auth/backend activation."
]) {
  if (!blocker.blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (readiness.ready_for_ag21d !== true) fail("AG21D readiness missing");
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

if (boundary.status !== "ag21d_boundary_created_not_started") fail("AG21D boundary status mismatch");
if (boundary.next_stage_id !== "AG21D") fail("AG21D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG21D explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG21D boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag21d !== true) fail("AG21D must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_execution_readiness_only") fail("Schema status mismatch");
for (const key of [
  "execution_readiness_package_allowed_in_ag21c",
  "approval_phrase_pre_execution_readiness_allowed_in_ag21c",
  "candidate_apply_pre_execution_readiness_allowed_in_ag21c",
  "github_write_pre_execution_readiness_allowed_in_ag21c",
  "public_surface_pre_execution_readiness_allowed_in_ag21c",
  "deployment_smoke_rollback_pre_execution_readiness_allowed_in_ag21c",
  "ag21d_boundary_allowed_in_ag21c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag21c",
  "article_generation_allowed_in_ag21c",
  "article_mutation_allowed_in_ag21c",
  "queue_mutation_allowed_in_ag21c",
  "admin_action_execution_allowed_in_ag21c",
  "editor_action_execution_allowed_in_ag21c",
  "auth_activation_allowed_in_ag21c",
  "backend_activation_allowed_in_ag21c",
  "supabase_activation_allowed_in_ag21c",
  "github_token_creation_or_exposure_allowed_in_ag21c",
  "github_write_operation_allowed_in_ag21c",
  "public_visibility_switch_allowed_in_ag21c",
  "public_index_mutation_allowed_in_ag21c",
  "deployment_trigger_allowed_in_ag21c",
  "live_smoke_test_allowed_in_ag21c",
  "rollback_execution_allowed_in_ag21c",
  "public_publishing_operation_allowed_in_ag21c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, readinessPackage, approvalReadiness, candidateReadiness, githubReadiness, publicSurfaceReadiness, deploySmokeRollbackReadiness, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_execution_readiness_only !== true) fail(`${obj.title || "object"} must be AG21C execution-readiness-only`);
  if (obj.explicit_approval_phrase_executed_in_ag21c !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag21c !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag21c !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag21c !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag21c !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag21c !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag21c !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.live_smoke_test_performed_in_ag21c !== false) fail(`${obj.title || "object"} must not run live smoke-test`);
  if (obj.rollback_execution_performed_in_ag21c !== false) fail(`${obj.title || "object"} must not execute rollback`);
  if (obj.public_publishing_operation_performed_in_ag21c !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag21c !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Execution Readiness Sections", "Approval Phrase", "Decision State", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG21C document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag21c", "validate:ag21c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag21c")) {
  fail("validate:project must include validate:ag21c");
}

pass("AG21C registry is present.");
pass("AG21C document is present.");
pass("AG21C review, execution readiness package, approval phrase readiness, candidate readiness, GitHub readiness, public surface readiness, deployment/smoke/rollback readiness, blocker register, readiness, AG21D boundary, schema, learning and preview are present.");
pass("AG21B controlled static apply transition gate audit is consumed.");
pass("Controlled static apply execution readiness package is created without execution.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG21D Controlled Static Apply Execution Readiness Audit boundary is created with explicit approval required.");
pass("AG21C is Controlled Static Apply Execution Readiness only.");
