import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
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
  "data/content-intelligence/go-live/ag19z-first-static-activation-planning-summary.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag20b-controlled-static-apply-readiness-audit.json",
  "data/content-intelligence/audit-records/ag20b-controlled-static-apply-readiness-audit-report.json",
  "data/content-intelligence/go-live/ag20b-controlled-static-apply-final-authorization-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag20b-controlled-static-apply-safety-record.json",
  "data/content-intelligence/quality-registry/ag20b-controlled-static-apply-final-authorization-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20b-to-ag20c-controlled-static-apply-final-authorization-boundary.json",
  "data/content-intelligence/schema/controlled-static-apply-readiness-audit.schema.json",
  "data/content-intelligence/learning/ag20b-controlled-static-apply-readiness-audit-learning.json",
  "data/quality/ag20b-controlled-static-apply-readiness-audit.json",
  "data/quality/ag20b-controlled-static-apply-readiness-audit-preview.json",
  "docs/quality/AG20B_CONTROLLED_STATIC_APPLY_READINESS_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG20B validation failed: ${message}`);
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

function hashPairMatchesCurrentOrAg12cR1Repair(leftHash, rightHash, articlePath = null) {
  if (leftHash === rightHash) return true;

  const ag12cR1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
  if (!fs.existsSync(ag12cR1ApplyPath)) return false;

  try {
    const ag12cR1Apply = JSON.parse(fs.readFileSync(ag12cR1ApplyPath, "utf8"));

    const articlePathMatches =
      articlePath === null ||
      articlePath === undefined ||
      ag12cR1Apply.selected_article_path === articlePath;

    if (!articlePathMatches) return false;

    return (
      ag12cR1Apply.status === "public_object_label_layout_repair_applied" &&
      (
        (
          ag12cR1Apply.pre_repair_hash === leftHash &&
          ag12cR1Apply.post_repair_hash === rightHash
        ) ||
        (
          ag12cR1Apply.pre_repair_hash === rightHash &&
          ag12cR1Apply.post_repair_hash === leftHash
        )
      )
    );
  } catch {
    return false;
  }
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag20aReview = readJson("data/content-intelligence/quality-reviews/ag20a-controlled-static-apply-readiness.json");
const ag20aPackage = readJson("data/content-intelligence/go-live/ag20a-controlled-static-apply-readiness-package.json");
const ag20aCandidate = readJson("data/content-intelligence/go-live/ag20a-candidate-apply-readiness-check.json");
const ag20aGithub = readJson("data/content-intelligence/go-live/ag20a-github-token-readiness-no-secrets-check.json");
const ag20aSurfaces = readJson("data/content-intelligence/go-live/ag20a-public-surface-apply-map.json");
const ag20aRollback = readJson("data/content-intelligence/go-live/ag20a-rollback-smoke-test-readiness-check.json");
const ag20aApprovalGate = readJson("data/content-intelligence/go-live/ag20a-explicit-approval-gate-readiness-check.json");
const ag20aBlocker = readJson("data/content-intelligence/quality-registry/ag20a-controlled-static-apply-blocker-register.json");
const ag20aReadiness = readJson("data/content-intelligence/quality-registry/ag20a-controlled-static-apply-readiness-audit-readiness-record.json");
const ag20aBoundary = readJson("data/content-intelligence/mutation-plans/ag20a-to-ag20b-controlled-static-apply-readiness-audit-boundary.json");
const ag19zSummary = readJson("data/content-intelligence/go-live/ag19z-first-static-activation-planning-summary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag20b-controlled-static-apply-readiness-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag20b-controlled-static-apply-readiness-audit-report.json");
const decision = readJson("data/content-intelligence/go-live/ag20b-controlled-static-apply-final-authorization-readiness-decision-record.json");
const safety = readJson("data/content-intelligence/quality-registry/ag20b-controlled-static-apply-safety-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag20b-controlled-static-apply-final-authorization-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag20b-to-ag20c-controlled-static-apply-final-authorization-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-readiness-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag20b-controlled-static-apply-readiness-audit-learning.json");
const registry = readJson("data/quality/ag20b-controlled-static-apply-readiness-audit.json");
const preview = readJson("data/quality/ag20b-controlled-static-apply-readiness-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG20B_CONTROLLED_STATIC_APPLY_READINESS_AUDIT.md"), "utf8");

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG20B") fail(`module_id must be AG20B in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag20aReview.status !== "controlled_static_apply_readiness_package_created_pending_audit") fail("AG20A review status mismatch");
if (ag20aPackage.status !== "controlled_static_apply_readiness_package_created_pending_audit") fail("AG20A package status mismatch");
if (ag20aReadiness.ready_for_ag20b !== true) fail("AG20A readiness for AG20B missing");
if (ag20aBoundary.next_stage_id !== "AG20B") fail("AG20B boundary missing in AG20A");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1 repaired article state missing");

if (review.status !== "controlled_static_apply_readiness_audit_passed_ready_for_ag20c_final_authorization") fail("Review status mismatch");
if (audit.status !== "controlled_static_apply_readiness_audit_passed") fail("Audit status mismatch");
if (decision.status !== "controlled_static_apply_readiness_audit_passed_ready_for_ag20c_final_authorization") fail("Decision status mismatch");
if (safety.status !== "controlled_static_apply_safe_for_final_authorization_only") fail("Safety status mismatch");
if (readiness.status !== "ready_for_ag20c_controlled_static_apply_final_authorization") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 12) fail("AG20B audit must include twelve checks");
if (audit.failed_checks.length !== 0) fail("AG20B failed checks must be zero");
if (audit.decision.ag20a_readiness_package_valid !== true) fail("AG20A readiness package must be valid");
if (audit.decision.ready_for_controlled_static_apply_final_authorization !== true) fail("AG20C readiness missing");

if (ag20aPackage.required_future_approval_phrase !== phrase) fail("AG20A package phrase mismatch");
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
  if (ag20aPackage.current_decision_state[key] !== false) fail(`AG20A package must block ${key}`);
}

if (ag20aCandidate.candidate.article_path !== articlePath) fail("Candidate path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(ag20aCandidate.candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Candidate hash mismatch or AG12C-R1 repaired article state missing");
if (ag20aCandidate.current_apply_state.candidate_apply_ready_for_audit_review !== true) fail("Candidate readiness missing");
for (const key of ["candidate_apply_executed_now", "article_mutated_now", "public_visibility_switched_now", "published_now"]) {
  if (ag20aCandidate.current_apply_state[key] !== false) fail(`Candidate apply state must block ${key}`);
}

for (const [key, value] of Object.entries(ag20aGithub.current_secret_state)) {
  if (value !== false) fail(`GitHub secret state must remain false: ${key}`);
}

for (const surface of ag20aSurfaces.future_surface_map) {
  if (surface.mutated_now !== false) fail(`Surface must not mutate now: ${surface.surface_id}`);
}
for (const [key, value] of Object.entries(ag20aSurfaces.current_public_surface_state)) {
  if (value !== false) fail(`Public surface state must remain false: ${key}`);
}

if (ag20aRollback.current_execution_state.rollback_ready_for_audit_review !== true) fail("Rollback readiness missing");
if (ag20aRollback.current_execution_state.smoke_test_ready_for_audit_review !== true) fail("Smoke-test readiness missing");
for (const key of ["rollback_executed_now", "smoke_test_executed_now", "deployment_triggered_now", "published_now"]) {
  if (ag20aRollback.current_execution_state[key] !== false) fail(`Rollback/smoke state must block ${key}`);
}

if (ag20aApprovalGate.required_future_approval_phrase !== phrase) fail("Approval gate phrase mismatch");
for (const [key, value] of Object.entries(ag20aApprovalGate.current_approval_state)) {
  if (value !== false) fail(`Approval gate state must remain false: ${key}`);
}

if (ag19zSummary.final_ag19_state.ready_for_ag20_controlled_static_apply_readiness !== true) fail("AG19Z readiness inheritance missing");
for (const key of [
  "explicit_user_approval_executed",
  "candidate_apply_enabled",
  "github_token_created",
  "github_write_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "deployment_trigger_enabled",
  "publishing_enabled",
  "supabase_auth_backend_enabled"
]) {
  if (ag19zSummary.final_ag19_state[key] !== false) fail(`AG19Z final state must block ${key}`);
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
  if (!ag20aBlocker.blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}

if (decision.decision.proceed_to_controlled_static_apply_final_authorization !== true) fail("Decision must approve AG20C final authorization");
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
  if (decision.decision[key] !== false) fail(`Decision must block ${key}`);
}

if (safety.safety_assertions.final_authorization_allowed !== true) fail("Safety must allow final authorization only");
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
  "publishing_enabled",
  "admin_editor_execution_enabled"
]) {
  if (safety.safety_assertions[key] !== false) fail(`Safety must block ${key}`);
}

if (readiness.ready_for_ag20c !== true) fail("AG20C readiness missing");
if (readiness.required_future_approval_phrase !== phrase) fail("Readiness approval phrase mismatch");
if (readiness.controlled_static_apply_readiness_audit_passed !== true) fail("Readiness audit pass missing");
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

if (boundary.status !== "ag20c_boundary_created_not_started") fail("AG20C boundary status mismatch");
if (boundary.next_stage_id !== "AG20C") fail("AG20C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG20C explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG20C boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag20c !== true) fail("AG20C must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_readiness_audit_only") fail("Schema status mismatch");
for (const key of [
  "readiness_audit_allowed_in_ag20b",
  "final_authorization_decision_allowed_in_ag20b",
  "safety_record_allowed_in_ag20b",
  "ag20c_boundary_allowed_in_ag20b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag20b",
  "article_generation_allowed_in_ag20b",
  "article_mutation_allowed_in_ag20b",
  "queue_mutation_allowed_in_ag20b",
  "admin_action_execution_allowed_in_ag20b",
  "editor_action_execution_allowed_in_ag20b",
  "auth_activation_allowed_in_ag20b",
  "backend_activation_allowed_in_ag20b",
  "supabase_activation_allowed_in_ag20b",
  "github_token_creation_or_exposure_allowed_in_ag20b",
  "github_write_operation_allowed_in_ag20b",
  "public_visibility_switch_allowed_in_ag20b",
  "public_index_mutation_allowed_in_ag20b",
  "public_publishing_operation_allowed_in_ag20b",
  "deployment_trigger_allowed_in_ag20b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, decision, safety, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_readiness_audit_only !== true) fail(`${obj.title || "object"} must be AG20B audit-only`);
  if (obj.explicit_approval_phrase_executed_in_ag20b !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag20b !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag20b !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag20b !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag20b !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag20b !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag20b !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag20b !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag20b !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Audit Result", "Decision", "Approval Phrase", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG20B document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag20b", "validate:ag20b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag20b")) {
  fail("validate:project must include validate:ag20b");
}

pass("AG20B registry is present.");
pass("AG20B document is present.");
pass("AG20B review, audit report, final authorization decision, safety, readiness, AG20C boundary, schema, learning and preview are present.");
pass("AG20A controlled static apply readiness package is consumed.");
pass("Controlled static apply readiness audit passed with zero failed checks.");
pass("Decision recorded: proceed only to AG20C final authorization package.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG20C Controlled Static Apply Final Authorization boundary is created with explicit approval required.");
pass("AG20B is Controlled Static Apply Readiness Audit only.");
