import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag19a-first-static-activation-pre-apply-readiness-plan.json",
  "data/content-intelligence/go-live/ag19a-first-static-activation-pre-apply-checklist-plan.json",
  "data/content-intelligence/go-live/ag19a-first-candidate-evidence-requirement-plan.json",
  "data/content-intelligence/go-live/ag19a-final-public-filter-evidence-plan.json",
  "data/content-intelligence/go-live/ag19a-exact-file-delta-pre-apply-plan.json",
  "data/content-intelligence/go-live/ag19a-rollback-branch-commit-strategy-plan.json",
  "data/content-intelligence/go-live/ag19a-manual-approval-gate-plan.json",
  "data/content-intelligence/go-live/ag19a-github-secret-storage-no-secrets-plan.json",
  "data/content-intelligence/quality-registry/ag19a-pre-apply-blocker-register.json",
  "data/content-intelligence/quality-registry/ag19a-pre-apply-readiness-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19a-to-ag19b-pre-apply-readiness-audit-boundary.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag19b-pre-apply-readiness-audit.json",
  "data/content-intelligence/audit-records/ag19b-pre-apply-readiness-audit-report.json",
  "data/content-intelligence/go-live/ag19b-final-public-delta-dry-run-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag19b-pre-apply-safety-record.json",
  "data/content-intelligence/quality-registry/ag19b-final-public-delta-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19b-to-ag19c-final-public-delta-dry-run-boundary.json",
  "data/content-intelligence/schema/pre-apply-readiness-audit.schema.json",
  "data/content-intelligence/learning/ag19b-pre-apply-readiness-audit-learning.json",
  "data/quality/ag19b-pre-apply-readiness-audit.json",
  "data/quality/ag19b-pre-apply-readiness-audit-preview.json",
  "docs/quality/AG19B_PRE_APPLY_READINESS_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG19B validation failed: ${message}`);
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

const ag19aReview = readJson("data/content-intelligence/quality-reviews/ag19a-first-static-activation-pre-apply-readiness-plan.json");
const ag19aChecklist = readJson("data/content-intelligence/go-live/ag19a-first-static-activation-pre-apply-checklist-plan.json");
const ag19aCandidate = readJson("data/content-intelligence/go-live/ag19a-first-candidate-evidence-requirement-plan.json");
const ag19aPublicFilter = readJson("data/content-intelligence/go-live/ag19a-final-public-filter-evidence-plan.json");
const ag19aFileDelta = readJson("data/content-intelligence/go-live/ag19a-exact-file-delta-pre-apply-plan.json");
const ag19aRollback = readJson("data/content-intelligence/go-live/ag19a-rollback-branch-commit-strategy-plan.json");
const ag19aManual = readJson("data/content-intelligence/go-live/ag19a-manual-approval-gate-plan.json");
const ag19aGithubSecret = readJson("data/content-intelligence/go-live/ag19a-github-secret-storage-no-secrets-plan.json");
const ag19aBlockers = readJson("data/content-intelligence/quality-registry/ag19a-pre-apply-blocker-register.json");
const ag19aReadiness = readJson("data/content-intelligence/quality-registry/ag19a-pre-apply-readiness-audit-readiness-record.json");
const ag19aBoundary = readJson("data/content-intelligence/mutation-plans/ag19a-to-ag19b-pre-apply-readiness-audit-boundary.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag19b-pre-apply-readiness-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag19b-pre-apply-readiness-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag19b-final-public-delta-dry-run-readiness-decision-record.json");
const safety = readJson("data/content-intelligence/quality-registry/ag19b-pre-apply-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag19b-final-public-delta-dry-run-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag19b-to-ag19c-final-public-delta-dry-run-boundary.json");
const schema = readJson("data/content-intelligence/schema/pre-apply-readiness-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag19b-pre-apply-readiness-audit-learning.json");
const registry = readJson("data/quality/ag19b-pre-apply-readiness-audit.json");
const preview = readJson("data/quality/ag19b-pre-apply-readiness-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG19B_PRE_APPLY_READINESS_AUDIT.md"), "utf8");

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG19B") fail(`module_id must be AG19B in ${obj.title || "object"}`);
}

if (ag19aReview.status !== "first_static_activation_pre_apply_readiness_plan_defined_real_apply_blocked") fail("AG19A review status mismatch");
if (ag19aReadiness.ready_for_ag19b !== true) fail("AG19A readiness for AG19B missing");
if (ag19aBoundary.next_stage_id !== "AG19B") fail("AG19B boundary missing in AG19A");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1/AR01-R1 approved repair-chain state missing");

if (review.status !== "pre_apply_readiness_audit_passed_ready_for_ag19c_final_public_delta_dry_run") fail("Review status mismatch");
if (audit.status !== "pre_apply_readiness_audit_passed") fail("Audit status mismatch");
if (decision.status !== "pre_apply_readiness_audit_passed_ready_for_ag19c_final_public_delta_dry_run") fail("Decision status mismatch");
if (safety.status !== "pre_apply_readiness_safe_for_final_public_delta_dry_run_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag19c_final_public_delta_dry_run") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 13) fail("AG19B audit must include thirteen checks");
if (audit.failed_checks.length !== 0) fail("AG19B failed checks must be zero");
if (audit.decision.ag19a_pre_apply_plans_valid !== true) fail("AG19A pre-apply plans must be valid");
if (audit.decision.ready_for_final_public_delta_dry_run !== true) fail("AG19C readiness missing");

if (!ag19aChecklist.checklist_items.every((item) => item.completed_now === false)) fail("Checklist items must not be completed now");
if (!Object.values(ag19aChecklist.execution_state_now).every((value) => value === false)) fail("Checklist execution state must remain false");
if (!Object.values(ag19aCandidate.current_evidence_state).every((value) => value === false)) fail("Candidate evidence state must remain false");
if (ag19aPublicFilter.current_filter_state.public_exposure_allowed_now !== false) fail("Public exposure must not be allowed");
if (!ag19aFileDelta.proposed_future_delta_targets.every((target) => target.exact_file_selected_now === false && target.mutation_now === false)) fail("File delta targets must remain no-selection/no-mutation");
if (!Object.values(ag19aFileDelta.mutation_state_now).every((value) => value === false)) fail("File delta mutation state must remain false");
if (!Object.values(ag19aRollback.current_state).every((value) => value === false)) fail("Rollback state must remain false");
if (!Object.values(ag19aManual.current_approval_state).every((value) => value === false)) fail("Manual approval state must remain false");
if (!ag19aGithubSecret.future_secret_requirements.every((item) => item.created_now === false && item.exposed_now === false && item.wired_now === false && item.committed_now === false)) fail("GitHub secrets must not be created/exposed/wired/committed");
if (!Object.values(ag19aGithubSecret.current_secret_state).every((value) => value === false)) fail("GitHub secret state must remain false");

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
  if (!ag19aBlockers.blocked_items.includes(requiredBlocker)) fail(`Missing blocker: ${requiredBlocker}`);
}

if (decision.decision.proceed_to_final_public_delta_dry_run !== true) fail("Decision must approve AG19C final public delta dry-run");
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
  if (decision.decision[key] !== false) fail(`Decision must block ${key}`);
}

if (safety.safety_assertions.final_public_delta_dry_run_allowed !== true) fail("Safety must allow only final public delta dry-run");
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

if (readiness.ready_for_ag19c !== true) fail("AG19C readiness missing");
if (readiness.pre_apply_readiness_audit_passed !== true) fail("Pre-apply audit pass readiness missing");
if (readiness.final_public_delta_dry_run_ready !== true) fail("Final delta dry-run readiness missing");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.candidate_apply_ready !== false) fail("Candidate apply must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment trigger must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag19c_boundary_created_not_started") fail("AG19C boundary status mismatch");
if (boundary.next_stage_id !== "AG19C") fail("AG19C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG19C explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag19c !== true) fail("AG19C must carry Supabase/Auth reminder");

if (schema.status !== "schema_pre_apply_readiness_audit_only") fail("Schema status mismatch");
for (const key of [
  "pre_apply_audit_allowed_in_ag19b",
  "final_delta_dry_run_decision_allowed_in_ag19b",
  "safety_record_allowed_in_ag19b",
  "ag19c_boundary_allowed_in_ag19b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "article_generation_allowed_in_ag19b",
  "article_mutation_allowed_in_ag19b",
  "queue_mutation_allowed_in_ag19b",
  "admin_action_execution_allowed_in_ag19b",
  "editor_action_execution_allowed_in_ag19b",
  "auth_activation_allowed_in_ag19b",
  "backend_activation_allowed_in_ag19b",
  "supabase_activation_allowed_in_ag19b",
  "github_token_creation_or_exposure_allowed_in_ag19b",
  "github_write_operation_allowed_in_ag19b",
  "public_visibility_switch_allowed_in_ag19b",
  "public_index_mutation_allowed_in_ag19b",
  "public_publishing_operation_allowed_in_ag19b",
  "deployment_trigger_allowed_in_ag19b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.pre_apply_readiness_audit_only !== true) fail(`${obj.title || "object"} must be AG19B audit-only`);
  if (obj.article_generation_performed_in_ag19b !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag19b !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag19b !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag19b !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag19b !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag19b !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag19b !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag19b !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag19b !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Audit Result", "Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG19B document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag19b", "validate:ag19b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag19b")) {
  fail("validate:project must include validate:ag19b");
}

pass("AG19B registry is present.");
pass("AG19B document is present.");
pass("AG19B review, audit report, final delta dry-run decision, safety, readiness, AG19C boundary, schema, learning and preview are present.");
pass("AG19A pre-apply readiness plan is consumed.");
pass("Pre-apply readiness audit passed with zero failed checks.");
pass("Decision recorded: proceed only to AG19C final public delta dry-run.");
pass("No candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG19C Final Public Delta Dry-run boundary is created with explicit approval required.");
pass("AG19B is Pre-Apply Readiness Audit only.");
