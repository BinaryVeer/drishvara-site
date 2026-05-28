import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag20b-controlled-static-apply-readiness-audit.json",
  "data/content-intelligence/audit-records/ag20b-controlled-static-apply-readiness-audit-report.json",
  "data/content-intelligence/go-live/ag20b-controlled-static-apply-final-authorization-readiness-decision-record.json",
  "data/content-intelligence/quality-registry/ag20b-controlled-static-apply-safety-record.json",
  "data/content-intelligence/quality-registry/ag20b-controlled-static-apply-final-authorization-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20b-to-ag20c-controlled-static-apply-final-authorization-boundary.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag20c-controlled-static-apply-final-authorization.json",
  "data/content-intelligence/go-live/ag20c-controlled-static-apply-final-authorization-package.json",
  "data/content-intelligence/go-live/ag20c-candidate-static-apply-authorization-summary.json",
  "data/content-intelligence/go-live/ag20c-public-surface-authorization-summary.json",
  "data/content-intelligence/go-live/ag20c-github-write-authorization-no-execution-record.json",
  "data/content-intelligence/go-live/ag20c-rollback-deployment-smoke-test-authorization-summary.json",
  "data/content-intelligence/go-live/ag20c-explicit-approval-phrase-final-gate-record.json",
  "data/content-intelligence/quality-registry/ag20c-controlled-static-apply-final-authorization-blocker-register.json",
  "data/content-intelligence/quality-registry/ag20c-controlled-static-apply-final-authorization-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag20c-to-ag20d-controlled-static-apply-final-authorization-audit-boundary.json",
  "data/content-intelligence/schema/controlled-static-apply-final-authorization.schema.json",
  "data/content-intelligence/learning/ag20c-controlled-static-apply-final-authorization-learning.json",
  "data/quality/ag20c-controlled-static-apply-final-authorization.json",
  "data/quality/ag20c-controlled-static-apply-final-authorization-preview.json",
  "docs/quality/AG20C_CONTROLLED_STATIC_APPLY_FINAL_AUTHORIZATION.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG20C validation failed: ${message}`);
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

const ag20bReview = readJson("data/content-intelligence/quality-reviews/ag20b-controlled-static-apply-readiness-audit.json");
const ag20bAudit = readJson("data/content-intelligence/audit-records/ag20b-controlled-static-apply-readiness-audit-report.json");
const ag20bDecision = readJson("data/content-intelligence/go-live/ag20b-controlled-static-apply-final-authorization-readiness-decision-record.json");
const ag20bReadiness = readJson("data/content-intelligence/quality-registry/ag20b-controlled-static-apply-final-authorization-readiness-record.json");
const ag20bBoundary = readJson("data/content-intelligence/mutation-plans/ag20b-to-ag20c-controlled-static-apply-final-authorization-boundary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag20c-controlled-static-apply-final-authorization.json");
const authorizationPackage = readJson("data/content-intelligence/go-live/ag20c-controlled-static-apply-final-authorization-package.json");
const candidate = readJson("data/content-intelligence/go-live/ag20c-candidate-static-apply-authorization-summary.json");
const surfaces = readJson("data/content-intelligence/go-live/ag20c-public-surface-authorization-summary.json");
const github = readJson("data/content-intelligence/go-live/ag20c-github-write-authorization-no-execution-record.json");
const rollback = readJson("data/content-intelligence/go-live/ag20c-rollback-deployment-smoke-test-authorization-summary.json");
const approvalGate = readJson("data/content-intelligence/go-live/ag20c-explicit-approval-phrase-final-gate-record.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag20c-controlled-static-apply-final-authorization-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag20c-controlled-static-apply-final-authorization-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag20c-to-ag20d-controlled-static-apply-final-authorization-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-final-authorization.schema.json");
const learning = readJson("data/content-intelligence/learning/ag20c-controlled-static-apply-final-authorization-learning.json");
const registry = readJson("data/quality/ag20c-controlled-static-apply-final-authorization.json");
const preview = readJson("data/quality/ag20c-controlled-static-apply-final-authorization-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG20C_CONTROLLED_STATIC_APPLY_FINAL_AUTHORIZATION.md"), "utf8");

for (const obj of [review, authorizationPackage, candidate, surfaces, github, rollback, approvalGate, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG20C") fail(`module_id must be AG20C in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag20bReview.status !== "controlled_static_apply_readiness_audit_passed_ready_for_ag20c_final_authorization") fail("AG20B review status mismatch");
if (ag20bAudit.failed_checks.length !== 0) fail("AG20B failed checks must be zero");
if (ag20bDecision.decision.proceed_to_controlled_static_apply_final_authorization !== true) fail("AG20B must approve AG20C final authorization");
if (ag20bReadiness.ready_for_ag20c !== true) fail("AG20B readiness for AG20C missing");
if (ag20bBoundary.next_stage_id !== "AG20C") fail("AG20C boundary missing in AG20B");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!hashPairMatchesCurrentOrAg12cR1Repair(currentHash, ag13zCandidate.article_hash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Seed candidate hash mismatch or AG12C-R1 repaired article state missing");

if (review.status !== "controlled_static_apply_final_authorization_package_created_pending_audit") fail("Review status mismatch");
if (authorizationPackage.status !== "controlled_static_apply_final_authorization_package_created_pending_audit") fail("Authorization package status mismatch");
if (candidate.status !== "candidate_static_apply_authorization_summarised_no_apply") fail("Candidate authorization status mismatch");
if (surfaces.status !== "public_surface_authorization_summarised_no_mutation") fail("Public surface authorization status mismatch");
if (github.status !== "github_write_authorization_summarised_no_execution") fail("GitHub write authorization status mismatch");
if (rollback.status !== "rollback_deployment_smoke_test_authorization_summarised_no_execution") fail("Rollback/deployment authorization status mismatch");
if (approvalGate.status !== "explicit_approval_phrase_final_gate_defined_not_executed") fail("Approval gate status mismatch");
if (blocker.status !== "controlled_static_apply_final_authorization_operations_remain_blocked_pending_ag20d_audit") fail("Blocker status mismatch");
if (readiness.status !== "ready_for_ag20d_controlled_static_apply_final_authorization_audit") fail("Readiness status mismatch");

if (authorizationPackage.final_authorization_only !== true) fail("Authorization package must be final-authorization-only");
if (authorizationPackage.required_future_approval_phrase !== phrase) fail("Authorization package phrase mismatch");
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
  if (authorizationPackage.current_decision_state[key] !== false) fail(`Authorization package must block ${key}`);
}

if (candidate.candidate.article_path !== articlePath) fail("Candidate path mismatch");
if (!hashPairMatchesCurrentOrAg12cR1Repair(candidate.candidate.article_hash, currentHash, typeof articlePath !== "undefined" ? articlePath : null)) fail("Candidate hash mismatch or AG12C-R1 repaired article state missing");
if (candidate.current_candidate_state.candidate_authorization_summarised !== true) fail("Candidate summary missing");
for (const key of [
  "candidate_apply_executed_now",
  "article_mutated_now",
  "public_visibility_switched_now",
  "public_index_mutated_now",
  "published_now"
]) {
  if (candidate.current_candidate_state[key] !== false) fail(`Candidate state must block ${key}`);
}

for (const surface of surfaces.future_authorization_surfaces) {
  if (surface.mutate_now !== false) fail(`Surface must not mutate now: ${surface.surface_id}`);
}
for (const [key, value] of Object.entries(surfaces.current_public_surface_state)) {
  if (value !== false) fail(`Public surface state must remain false: ${key}`);
}

for (const [key, value] of Object.entries(github.current_github_state)) {
  if (key === "github_authorization_summarised") {
    if (value !== true) fail("GitHub authorization summary missing");
  } else if (value !== false) {
    fail(`GitHub state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(rollback.current_execution_state)) {
  if (key === "rollback_authorization_summarised") {
    if (value !== true) fail("Rollback authorization summary missing");
  } else if (value !== false) {
    fail(`Rollback/deployment state must remain false: ${key}`);
  }
}

if (approvalGate.required_future_approval_phrase !== phrase) fail("Approval gate phrase mismatch");
if (approvalGate.current_gate_state.final_gate_defined !== true) fail("Final gate must be defined");
for (const key of [
  "explicit_approval_phrase_executed_now",
  "controlled_static_apply_authorised_now",
  "github_write_authorised_now",
  "visibility_switch_authorised_now",
  "public_index_mutation_authorised_now",
  "deployment_authorised_now",
  "publishing_authorised_now"
]) {
  if (approvalGate.current_gate_state[key] !== false) fail(`Approval gate state must block ${key}`);
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

if (readiness.ready_for_ag20d !== true) fail("AG20D readiness missing");
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

if (boundary.status !== "ag20d_boundary_created_not_started") fail("AG20D boundary status mismatch");
if (boundary.next_stage_id !== "AG20D") fail("AG20D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG20D explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG20D boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag20d !== true) fail("AG20D must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_final_authorization_only") fail("Schema status mismatch");
for (const key of [
  "final_authorization_package_allowed_in_ag20c",
  "candidate_authorization_summary_allowed_in_ag20c",
  "public_surface_authorization_summary_allowed_in_ag20c",
  "github_write_authorization_no_execution_record_allowed_in_ag20c",
  "rollback_deployment_smoke_test_authorization_summary_allowed_in_ag20c",
  "explicit_approval_phrase_final_gate_allowed_in_ag20c",
  "ag20d_boundary_allowed_in_ag20c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag20c",
  "article_generation_allowed_in_ag20c",
  "article_mutation_allowed_in_ag20c",
  "queue_mutation_allowed_in_ag20c",
  "admin_action_execution_allowed_in_ag20c",
  "editor_action_execution_allowed_in_ag20c",
  "auth_activation_allowed_in_ag20c",
  "backend_activation_allowed_in_ag20c",
  "supabase_activation_allowed_in_ag20c",
  "github_token_creation_or_exposure_allowed_in_ag20c",
  "github_write_operation_allowed_in_ag20c",
  "public_visibility_switch_allowed_in_ag20c",
  "public_index_mutation_allowed_in_ag20c",
  "public_publishing_operation_allowed_in_ag20c",
  "deployment_trigger_allowed_in_ag20c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, authorizationPackage, candidate, surfaces, github, rollback, approvalGate, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_final_authorization_only !== true) fail(`${obj.title || "object"} must be AG20C final-authorization-only`);
  if (obj.explicit_approval_phrase_executed_in_ag20c !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag20c !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag20c !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag20c !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag20c !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag20c !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag20c !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag20c !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag20c !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Authorization Package Sections", "Approval Phrase", "Decision State", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG20C document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag20c", "validate:ag20c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag20c")) {
  fail("validate:project must include validate:ag20c");
}

pass("AG20C registry is present.");
pass("AG20C document is present.");
pass("AG20C review, final authorization package, candidate summary, public surface summary, GitHub write no-execution record, rollback/deployment/smoke-test summary, approval phrase gate, blocker register, readiness, AG20D boundary, schema, learning and preview are present.");
pass("AG20B controlled static apply readiness audit is consumed.");
pass("Controlled static apply final authorization package is created without execution.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG20D Controlled Static Apply Final Authorization Audit boundary is created with explicit approval required.");
pass("AG20C is Controlled Static Apply Final Authorization only.");
