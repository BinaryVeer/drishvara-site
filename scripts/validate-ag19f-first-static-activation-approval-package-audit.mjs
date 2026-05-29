import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
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
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag19f-first-static-activation-approval-package-audit.json",
  "data/content-intelligence/audit-records/ag19f-first-static-activation-approval-package-audit-report.json",
  "data/content-intelligence/closure-records/ag19f-first-static-activation-approval-package-audit-closure.json",
  "data/content-intelligence/quality-registry/ag19f-first-static-activation-approval-package-safety-record.json",
  "data/content-intelligence/quality-registry/ag19f-first-static-activation-planning-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19f-to-ag19z-first-static-activation-planning-closure-boundary.json",
  "data/content-intelligence/schema/first-static-activation-approval-package-audit.schema.json",
  "data/content-intelligence/learning/ag19f-first-static-activation-approval-package-audit-learning.json",
  "data/quality/ag19f-first-static-activation-approval-package-audit.json",
  "data/quality/ag19f-first-static-activation-approval-package-audit-preview.json",
  "docs/quality/AG19F_FIRST_STATIC_ACTIVATION_APPROVAL_PACKAGE_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG19F validation failed: ${message}`);
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

const ag19eReview = readJson("data/content-intelligence/quality-reviews/ag19e-first-static-activation-approval-package.json");
const ag19ePackage = readJson("data/content-intelligence/go-live/ag19e-first-static-activation-approval-package.json");
const ag19eCandidate = readJson("data/content-intelligence/go-live/ag19e-candidate-evidence-approval-summary.json");
const ag19ePublicDelta = readJson("data/content-intelligence/go-live/ag19e-final-public-delta-approval-summary.json");
const ag19eRollback = readJson("data/content-intelligence/go-live/ag19e-rollback-smoke-test-approval-summary.json");
const ag19eGithub = readJson("data/content-intelligence/go-live/ag19e-github-secret-governance-approval-summary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag19eBlockers = readJson("data/content-intelligence/quality-registry/ag19e-approval-package-blocker-register.json");
const ag19eReadiness = readJson("data/content-intelligence/quality-registry/ag19e-approval-package-audit-readiness-record.json");
const ag19eBoundary = readJson("data/content-intelligence/mutation-plans/ag19e-to-ag19f-first-static-activation-approval-package-audit-boundary.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag19f-first-static-activation-approval-package-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag19f-first-static-activation-approval-package-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag19f-first-static-activation-approval-package-audit-closure.json");
const safety = readJson("data/content-intelligence/quality-registry/ag19f-first-static-activation-approval-package-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag19f-first-static-activation-planning-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag19f-to-ag19z-first-static-activation-planning-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/first-static-activation-approval-package-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag19f-first-static-activation-approval-package-audit-learning.json");
const registry = readJson("data/quality/ag19f-first-static-activation-approval-package-audit.json");
const preview = readJson("data/quality/ag19f-first-static-activation-approval-package-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG19F_FIRST_STATIC_ACTIVATION_APPROVAL_PACKAGE_AUDIT.md"), "utf8");

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG19F") fail(`module_id must be AG19F in ${obj.title || "object"}`);
}

if (ag19eReview.status !== "first_static_activation_approval_package_created_pending_audit") fail("AG19E review status mismatch");
if (ag19ePackage.status !== "first_static_activation_approval_package_created_pending_audit") fail("AG19E package status mismatch");
if (ag19eReadiness.ready_for_ag19f !== true) fail("AG19E readiness for AG19F missing");
if (ag19eBoundary.next_stage_id !== "AG19F") fail("AG19F boundary missing in AG19E");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "first_static_activation_approval_package_audit_passed_ready_for_ag19z_closure") fail("Review status mismatch");
if (audit.status !== "first_static_activation_approval_package_audit_passed") fail("Audit status mismatch");
if (closure.status !== "first_static_activation_approval_package_audit_passed_ready_for_ag19z_closure") fail("Closure status mismatch");
if (safety.status !== "approval_package_safe_for_ag19z_closure_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag19z_first_static_activation_planning_closure") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 13) fail("AG19F audit must include thirteen checks");
if (audit.failed_checks.length !== 0) fail("AG19F failed checks must be zero");
if (audit.decision.ag19e_approval_package_valid !== true) fail("Approval package must be valid");
if (audit.decision.ready_for_ag19z_closure !== true) fail("AG19Z readiness missing");

if (ag19ePackage.package_only !== true) fail("Approval package must be package-only");
if (ag19ePackage.candidate.article_path !== articlePath) fail("Approval package path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(ag19ePackage.candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Approval package hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
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
  if (ag19ePackage.current_decision_state[key] !== false) fail(`Approval package must block ${key}`);
}

if (ag19eCandidate.candidate.article_path !== articlePath) fail("Candidate summary path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(ag19eCandidate.candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Candidate summary hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");
if (!Object.values(ag19eCandidate.current_evidence_state).every((value) => value === false)) fail("Candidate evidence state must remain false");

for (const [key, value] of Object.entries(ag19ePublicDelta.summary_state)) {
  if (key === "final_delta_dry_run_completed" || key === "public_surface_preview_completed") {
    if (value !== true) fail(`Public delta summary must confirm ${key}`);
  } else if (value !== false) {
    fail(`Public delta summary state must remain false: ${key}`);
  }
}

if (!Object.values(ag19eRollback.current_state).every((value) => value === false)) fail("Rollback/smoke-test state must remain false");
if (!Object.values(ag19eGithub.current_secret_state).every((value) => value === false)) fail("GitHub secret state must remain false");
if (ag19eApprovalPhrase.exact_phrase_required_later !== "Proceed with first controlled static apply") fail("Approval phrase mismatch");
if (!Object.values(ag19eApprovalPhrase.current_approval_state).every((value) => value === false)) fail("Approval phrase current state must remain false");

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
  if (!ag19eBlockers.blocked_items.includes(requiredBlocker)) fail(`Missing blocker: ${requiredBlocker}`);
}

if (closure.closure_decision.close_ag19e_approval_package_audit !== true) fail("Closure must close AG19E audit");
if (closure.closure_decision.proceed_to_ag19z_first_static_activation_planning_closure !== true) fail("Closure must hand off to AG19Z");
for (const key of [
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (closure.closure_decision[key] !== false) fail(`Closure must block ${key}`);
}

if (safety.safety_assertions.ag19z_closure_allowed !== true) fail("Safety must allow AG19Z closure");
for (const key of [
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

if (readiness.ready_for_ag19z !== true) fail("AG19Z readiness missing");
if (readiness.first_static_activation_approval_package_audit_passed !== true) fail("Audit pass readiness missing");
if (readiness.failed_checks !== 0) fail("Failed checks must be zero");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.candidate_apply_ready !== false) fail("Candidate apply must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment trigger must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag19z_boundary_created_not_started") fail("AG19Z boundary status mismatch");
if (boundary.next_stage_id !== "AG19Z") fail("AG19Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG19Z explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag19z !== true) fail("AG19Z must carry Supabase/Auth reminder");

if (schema.status !== "schema_first_static_activation_approval_package_audit_only") fail("Schema status mismatch");
for (const key of [
  "approval_package_audit_allowed_in_ag19f",
  "audit_report_allowed_in_ag19f",
  "audit_closure_allowed_in_ag19f",
  "safety_record_allowed_in_ag19f",
  "ag19z_boundary_allowed_in_ag19f"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "article_generation_allowed_in_ag19f",
  "article_mutation_allowed_in_ag19f",
  "queue_mutation_allowed_in_ag19f",
  "admin_action_execution_allowed_in_ag19f",
  "editor_action_execution_allowed_in_ag19f",
  "auth_activation_allowed_in_ag19f",
  "backend_activation_allowed_in_ag19f",
  "supabase_activation_allowed_in_ag19f",
  "github_token_creation_or_exposure_allowed_in_ag19f",
  "github_write_operation_allowed_in_ag19f",
  "public_visibility_switch_allowed_in_ag19f",
  "public_index_mutation_allowed_in_ag19f",
  "public_publishing_operation_allowed_in_ag19f",
  "deployment_trigger_allowed_in_ag19f"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, closure, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.first_static_activation_approval_package_audit_only !== true) fail(`${obj.title || "object"} must be AG19F audit-only`);
  if (obj.article_generation_performed_in_ag19f !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag19f !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag19f !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag19f !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag19f !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag19f !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag19f !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag19f !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag19f !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Audit Result", "Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG19F document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag19f", "validate:ag19f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag19f")) {
  fail("validate:project must include validate:ag19f");
}

pass("AG19F registry is present.");
pass("AG19F document is present.");
pass("AG19F review, audit report, closure, safety, readiness, AG19Z boundary, schema, learning and preview are present.");
pass("AG19E first static activation approval package is consumed.");
pass("First static activation approval package audit passed with zero failed checks.");
pass("Explicit approval phrase remains defined but not executed.");
pass("No candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG19Z First Static Activation Planning Closure boundary is created with explicit approval required.");
pass("AG19F is First Static Activation Approval Package Audit only.");
