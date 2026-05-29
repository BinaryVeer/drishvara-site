import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag19d-final-public-delta-dry-run-audit.json",
  "data/content-intelligence/audit-records/ag19d-final-public-delta-dry-run-audit-report.json",
  "data/content-intelligence/go-live/ag19d-first-static-activation-approval-package-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag19d-final-public-delta-dry-run-safety-record.json",
  "data/content-intelligence/quality-registry/ag19d-first-static-activation-approval-package-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19d-to-ag19e-first-static-activation-approval-package-boundary.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag19e-first-static-activation-approval-package.json",
  "data/content-intelligence/go-live/ag19e-first-static-activation-approval-package.json",
  "data/content-intelligence/go-live/ag19e-candidate-evidence-approval-summary.json",
  "data/content-intelligence/go-live/ag19e-final-public-delta-approval-summary.json",
  "data/content-intelligence/go-live/ag19e-rollback-smoke-test-approval-summary.json",
  "data/content-intelligence/go-live/ag19e-github-secret-governance-approval-summary.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/quality-registry/ag19e-approval-package-blocker-register.json",
  "data/content-intelligence/quality-registry/ag19e-approval-package-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19e-to-ag19f-first-static-activation-approval-package-audit-boundary.json",
  "data/content-intelligence/schema/first-static-activation-approval-package.schema.json",
  "data/content-intelligence/learning/ag19e-first-static-activation-approval-package-learning.json",
  "data/quality/ag19e-first-static-activation-approval-package.json",
  "data/quality/ag19e-first-static-activation-approval-package-preview.json",
  "docs/quality/AG19E_FIRST_STATIC_ACTIVATION_APPROVAL_PACKAGE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG19E validation failed: ${message}`);
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

const ag19dReview = readJson("data/content-intelligence/quality-reviews/ag19d-final-public-delta-dry-run-audit.json");
const ag19dAudit = readJson("data/content-intelligence/audit-records/ag19d-final-public-delta-dry-run-audit-report.json");
const ag19dDecision = readJson("data/content-intelligence/go-live/ag19d-first-static-activation-approval-package-readiness-decision-record.json");
const ag19dReadiness = readJson("data/content-intelligence/quality-registry/ag19d-first-static-activation-approval-package-readiness-record.json");
const ag19dBoundary = readJson("data/content-intelligence/mutation-plans/ag19d-to-ag19e-first-static-activation-approval-package-boundary.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag19e-first-static-activation-approval-package.json");
const approvalPackage = readJson("data/content-intelligence/go-live/ag19e-first-static-activation-approval-package.json");
const candidate = readJson("data/content-intelligence/go-live/ag19e-candidate-evidence-approval-summary.json");
const publicDelta = readJson("data/content-intelligence/go-live/ag19e-final-public-delta-approval-summary.json");
const rollback = readJson("data/content-intelligence/go-live/ag19e-rollback-smoke-test-approval-summary.json");
const github = readJson("data/content-intelligence/go-live/ag19e-github-secret-governance-approval-summary.json");
const approvalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const blockers = readJson("data/content-intelligence/quality-registry/ag19e-approval-package-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag19e-approval-package-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag19e-to-ag19f-first-static-activation-approval-package-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/first-static-activation-approval-package.schema.json");
const learning = readJson("data/content-intelligence/learning/ag19e-first-static-activation-approval-package-learning.json");
const registry = readJson("data/quality/ag19e-first-static-activation-approval-package.json");
const preview = readJson("data/quality/ag19e-first-static-activation-approval-package-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG19E_FIRST_STATIC_ACTIVATION_APPROVAL_PACKAGE.md"), "utf8");

for (const obj of [review, approvalPackage, candidate, publicDelta, rollback, github, approvalPhrase, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG19E") fail(`module_id must be AG19E in ${obj.title || "object"}`);
}

if (ag19dReview.status !== "final_public_delta_dry_run_audit_passed_ready_for_ag19e_approval_package") fail("AG19D review status mismatch");
if (ag19dAudit.failed_checks.length !== 0) fail("AG19D failed checks must be zero");
if (ag19dDecision.decision.proceed_to_first_static_activation_approval_package !== true) fail("AG19D must approve AG19E approval package");
if (ag19dReadiness.ready_for_ag19e !== true) fail("AG19D readiness for AG19E missing");
if (ag19dBoundary.next_stage_id !== "AG19E") fail("AG19E boundary missing in AG19D");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "first_static_activation_approval_package_created_pending_audit") fail("Review status mismatch");
if (approvalPackage.status !== "first_static_activation_approval_package_created_pending_audit") fail("Approval package status mismatch");
if (candidate.status !== "candidate_evidence_summarised_for_approval_package_no_apply") fail("Candidate summary status mismatch");
if (publicDelta.status !== "final_public_delta_summarised_for_approval_package_no_mutation") fail("Public delta summary status mismatch");
if (rollback.status !== "rollback_smoke_test_summarised_for_approval_package_no_execution") fail("Rollback summary status mismatch");
if (github.status !== "github_secret_governance_summarised_no_secrets_created") fail("GitHub summary status mismatch");
if (approvalPhrase.status !== "explicit_approval_phrase_defined_not_executed") fail("Approval phrase status mismatch");
if (blockers.status !== "approval_package_operations_remain_blocked") fail("Blocker status mismatch");
if (readiness.status !== "ready_for_ag19f_first_static_activation_approval_package_audit") fail("Readiness status mismatch");

if (approvalPackage.candidate.article_path !== articlePath) fail("Approval package candidate path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(approvalPackage.candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Approval package candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (approvalPackage.current_decision_state.approval_package_created !== true) fail("Approval package must be created");
if (approvalPackage.current_decision_state.ready_for_ag19f_audit !== true) fail("Approval package must be ready for AG19F audit");
for (const key of [
  "explicit_user_approval_received_now",
  "real_static_apply_authorised_now",
  "candidate_apply_enabled_now",
  "github_token_enabled_now",
  "github_write_enabled_now",
  "visibility_switch_enabled_now",
  "public_index_mutation_enabled_now",
  "deployment_enabled_now",
  "publishing_enabled_now"
]) {
  if (approvalPackage.current_decision_state[key] !== false) fail(`Approval package decision state must block ${key}`);
}

if (candidate.candidate.article_path !== articlePath) fail("Candidate summary path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(candidate.candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Candidate summary hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
for (const [key, value] of Object.entries(candidate.current_evidence_state)) {
  if (value !== false) fail(`Candidate evidence state must remain false: ${key}`);
}

for (const [key, value] of Object.entries(publicDelta.summary_state)) {
  if (key === "final_delta_dry_run_completed" || key === "public_surface_preview_completed") {
    if (value !== true) fail(`Public delta summary must confirm ${key}`);
  } else if (value !== false) {
    fail(`Public delta summary state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(rollback.current_state)) {
  if (value !== false) fail(`Rollback/smoke state must remain false: ${key}`);
}

for (const [key, value] of Object.entries(github.current_secret_state)) {
  if (value !== false) fail(`GitHub secret state must remain false: ${key}`);
}

if (approvalPhrase.exact_phrase_required_later !== "Proceed with first controlled static apply") fail("Approval phrase mismatch");
for (const [key, value] of Object.entries(approvalPhrase.current_approval_state)) {
  if (value !== false) fail(`Approval phrase current state must remain false: ${key}`);
}

for (const requiredBlocker of [
  "Real candidate apply.",
  "Real GitHub token creation.",
  "Real GitHub write.",
  "Real public visibility switch.",
  "Real public index mutation.",
  "Deployment trigger.",
  "Publish execution.",
  "Supabase/Auth/backend activation."
]) {
  if (!blockers.blocked_items.includes(requiredBlocker)) fail(`Missing blocker: ${requiredBlocker}`);
}
if (blockers.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred");

if (readiness.ready_for_ag19f !== true) fail("AG19F readiness missing");
if (readiness.approval_package_created !== true) fail("Approval package created readiness missing");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.candidate_apply_ready !== false) fail("Candidate apply must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment trigger must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag19f_boundary_created_not_started") fail("AG19F boundary status mismatch");
if (boundary.next_stage_id !== "AG19F") fail("AG19F handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG19F explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag19f !== true) fail("AG19F must carry Supabase/Auth reminder");

if (schema.status !== "schema_first_static_activation_approval_package_only") fail("Schema status mismatch");
for (const key of [
  "approval_package_allowed_in_ag19e",
  "candidate_evidence_summary_allowed_in_ag19e",
  "final_public_delta_summary_allowed_in_ag19e",
  "rollback_smoke_test_summary_allowed_in_ag19e",
  "github_secret_governance_summary_allowed_in_ag19e",
  "explicit_approval_phrase_record_allowed_in_ag19e",
  "ag19f_boundary_allowed_in_ag19e"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "article_generation_allowed_in_ag19e",
  "article_mutation_allowed_in_ag19e",
  "queue_mutation_allowed_in_ag19e",
  "admin_action_execution_allowed_in_ag19e",
  "editor_action_execution_allowed_in_ag19e",
  "auth_activation_allowed_in_ag19e",
  "backend_activation_allowed_in_ag19e",
  "supabase_activation_allowed_in_ag19e",
  "github_token_creation_or_exposure_allowed_in_ag19e",
  "github_write_operation_allowed_in_ag19e",
  "public_visibility_switch_allowed_in_ag19e",
  "public_index_mutation_allowed_in_ag19e",
  "public_publishing_operation_allowed_in_ag19e",
  "deployment_trigger_allowed_in_ag19e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, approvalPackage, candidate, publicDelta, rollback, github, approvalPhrase, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.first_static_activation_approval_package_only !== true) fail(`${obj.title || "object"} must be AG19E approval-package-only`);
  if (obj.article_generation_performed_in_ag19e !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag19e !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag19e !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag19e !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag19e !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag19e !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag19e !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag19e !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag19e !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Approval Package Sections", "Approval Phrase", "Decision State", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG19E document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag19e", "validate:ag19e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag19e")) {
  fail("validate:project must include validate:ag19e");
}

pass("AG19E registry is present.");
pass("AG19E document is present.");
pass("AG19E review, approval package, candidate summary, public delta summary, rollback/smoke-test summary, GitHub governance summary, approval phrase, blocker register, readiness, AG19F boundary, schema, learning and preview are present.");
pass("AG19D final public delta dry-run audit is consumed.");
pass("First static activation approval package is created without execution.");
pass("Explicit approval phrase is defined but not executed.");
pass("No candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG19F First Static Activation Approval Package Audit boundary is created with explicit approval required.");
pass("AG19E is First Static Activation Approval Package only.");
