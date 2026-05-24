import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag21d-controlled-static-apply-execution-readiness-audit.json",
  "data/content-intelligence/audit-records/ag21d-controlled-static-apply-execution-readiness-audit-report.json",
  "data/content-intelligence/go-live/ag21d-controlled-static-apply-execution-confirmation-decision-record.json",
  "data/content-intelligence/quality-registry/ag21d-controlled-static-apply-execution-readiness-safety-record.json",
  "data/content-intelligence/quality-registry/ag21d-controlled-static-apply-execution-confirmation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag21d-to-ag21e-controlled-static-apply-execution-confirmation-boundary.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag21e-controlled-static-apply-execution-confirmation.json",
  "data/content-intelligence/go-live/ag21e-controlled-static-apply-execution-confirmation-package.json",
  "data/content-intelligence/go-live/ag21e-approval-phrase-final-confirmation-record.json",
  "data/content-intelligence/go-live/ag21e-candidate-final-confirmation-record.json",
  "data/content-intelligence/go-live/ag21e-github-write-final-confirmation-record.json",
  "data/content-intelligence/go-live/ag21e-public-surface-final-confirmation-record.json",
  "data/content-intelligence/go-live/ag21e-deployment-smoke-rollback-final-confirmation-record.json",
  "data/content-intelligence/quality-registry/ag21e-controlled-static-apply-execution-confirmation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag21e-controlled-static-apply-execution-confirmation-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag21e-to-ag21f-controlled-static-apply-execution-confirmation-audit-boundary.json",
  "data/content-intelligence/schema/controlled-static-apply-execution-confirmation.schema.json",
  "data/content-intelligence/learning/ag21e-controlled-static-apply-execution-confirmation-learning.json",
  "data/quality/ag21e-controlled-static-apply-execution-confirmation.json",
  "data/quality/ag21e-controlled-static-apply-execution-confirmation-preview.json",
  "docs/quality/AG21E_CONTROLLED_STATIC_APPLY_EXECUTION_CONFIRMATION.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG21E validation failed: ${message}`);
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

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag21dReview = readJson("data/content-intelligence/quality-reviews/ag21d-controlled-static-apply-execution-readiness-audit.json");
const ag21dAudit = readJson("data/content-intelligence/audit-records/ag21d-controlled-static-apply-execution-readiness-audit-report.json");
const ag21dDecision = readJson("data/content-intelligence/go-live/ag21d-controlled-static-apply-execution-confirmation-decision-record.json");
const ag21dReadiness = readJson("data/content-intelligence/quality-registry/ag21d-controlled-static-apply-execution-confirmation-readiness-record.json");
const ag21dBoundary = readJson("data/content-intelligence/mutation-plans/ag21d-to-ag21e-controlled-static-apply-execution-confirmation-boundary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag21e-controlled-static-apply-execution-confirmation.json");
const confirmationPackage = readJson("data/content-intelligence/go-live/ag21e-controlled-static-apply-execution-confirmation-package.json");
const approvalConfirmation = readJson("data/content-intelligence/go-live/ag21e-approval-phrase-final-confirmation-record.json");
const candidateConfirmation = readJson("data/content-intelligence/go-live/ag21e-candidate-final-confirmation-record.json");
const githubConfirmation = readJson("data/content-intelligence/go-live/ag21e-github-write-final-confirmation-record.json");
const publicSurfaceConfirmation = readJson("data/content-intelligence/go-live/ag21e-public-surface-final-confirmation-record.json");
const deployConfirmation = readJson("data/content-intelligence/go-live/ag21e-deployment-smoke-rollback-final-confirmation-record.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag21e-controlled-static-apply-execution-confirmation-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag21e-controlled-static-apply-execution-confirmation-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag21e-to-ag21f-controlled-static-apply-execution-confirmation-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-static-apply-execution-confirmation.schema.json");
const learning = readJson("data/content-intelligence/learning/ag21e-controlled-static-apply-execution-confirmation-learning.json");
const registry = readJson("data/quality/ag21e-controlled-static-apply-execution-confirmation.json");
const preview = readJson("data/quality/ag21e-controlled-static-apply-execution-confirmation-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG21E_CONTROLLED_STATIC_APPLY_EXECUTION_CONFIRMATION.md"), "utf8");

for (const obj of [review, confirmationPackage, approvalConfirmation, candidateConfirmation, githubConfirmation, publicSurfaceConfirmation, deployConfirmation, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG21E") fail(`module_id must be AG21E in ${obj.title || "object"}`);
}

const phrase = "Proceed with first controlled static apply";

if (ag21dReview.status !== "controlled_static_apply_execution_readiness_audit_passed_ready_for_ag21e_execution_confirmation") fail("AG21D review status mismatch");
if (ag21dAudit.failed_checks.length !== 0) fail("AG21D failed checks must be zero");
if (ag21dDecision.decision.proceed_to_controlled_static_apply_execution_confirmation !== true) fail("AG21D must approve AG21E execution confirmation");
if (ag21dReadiness.ready_for_ag21e !== true) fail("AG21D readiness for AG21E missing");
if (ag21dBoundary.next_stage_id !== "AG21E") fail("AG21E boundary missing in AG21D");
if (ag19eApprovalPhrase.exact_phrase_required_later !== phrase) fail("Approval phrase mismatch");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "controlled_static_apply_execution_confirmation_package_created_pending_audit") fail("Review status mismatch");
if (confirmationPackage.status !== "controlled_static_apply_execution_confirmation_package_created_pending_audit") fail("Confirmation package status mismatch");
if (approvalConfirmation.status !== "approval_phrase_final_confirmation_created_not_executed") fail("Approval confirmation status mismatch");
if (candidateConfirmation.status !== "candidate_final_confirmation_created_no_apply") fail("Candidate confirmation status mismatch");
if (githubConfirmation.status !== "github_write_final_confirmation_created_no_token_no_write") fail("GitHub confirmation status mismatch");
if (publicSurfaceConfirmation.status !== "public_surface_final_confirmation_created_no_mutation") fail("Public surface confirmation status mismatch");
if (deployConfirmation.status !== "deployment_smoke_rollback_final_confirmation_created_no_execution") fail("Deployment/smoke/rollback confirmation status mismatch");
if (blocker.status !== "execution_confirmation_operations_remain_blocked_pending_ag21f_audit") fail("Blocker status mismatch");
if (readiness.status !== "ready_for_ag21f_controlled_static_apply_execution_confirmation_audit") fail("Readiness status mismatch");

if (confirmationPackage.execution_confirmation_only !== true) fail("Confirmation package must be execution-confirmation-only");
if (confirmationPackage.required_future_approval_phrase !== phrase) fail("Confirmation package phrase mismatch");
if (confirmationPackage.seed_candidate.article_path !== articlePath) fail("Confirmation package candidate path mismatch");
if (confirmationPackage.seed_candidate.article_hash !== currentHash) fail("Confirmation package candidate hash mismatch");

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
  if (confirmationPackage.current_decision_state[key] !== false) fail(`Confirmation package must block ${key}`);
}

for (const [key, value] of Object.entries(approvalConfirmation.current_state)) {
  if (key === "final_confirmation_created") {
    if (value !== true) fail("Approval final confirmation must be created");
  } else if (value !== false) {
    fail(`Approval confirmation state must remain false: ${key}`);
  }
}

if (candidateConfirmation.seed_candidate.article_path !== articlePath) fail("Candidate confirmation path mismatch");
if (candidateConfirmation.seed_candidate.article_hash !== currentHash) fail("Candidate confirmation hash mismatch");
for (const [key, value] of Object.entries(candidateConfirmation.current_state)) {
  if (key === "final_confirmation_created") {
    if (value !== true) fail("Candidate final confirmation must be created");
  } else if (value !== false) {
    fail(`Candidate confirmation state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(githubConfirmation.current_state)) {
  if (key === "final_confirmation_created") {
    if (value !== true) fail("GitHub final confirmation must be created");
  } else if (value !== false) {
    fail(`GitHub confirmation state must remain false: ${key}`);
  }
}

for (const surface of publicSurfaceConfirmation.future_surface_confirmation) {
  if (surface.mutate_now !== false) fail(`Public surface must not mutate now: ${surface.surface_id}`);
}
for (const [key, value] of Object.entries(publicSurfaceConfirmation.current_state)) {
  if (key === "final_confirmation_created") {
    if (value !== true) fail("Public surface final confirmation must be created");
  } else if (value !== false) {
    fail(`Public surface confirmation state must remain false: ${key}`);
  }
}

for (const [key, value] of Object.entries(deployConfirmation.current_state)) {
  if (key === "final_confirmation_created") {
    if (value !== true) fail("Deployment/smoke/rollback final confirmation must be created");
  } else if (value !== false) {
    fail(`Deployment/smoke/rollback confirmation state must remain false: ${key}`);
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

if (readiness.ready_for_ag21f !== true) fail("AG21F readiness missing");
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

if (boundary.status !== "ag21f_boundary_created_not_started") fail("AG21F boundary status mismatch");
if (boundary.next_stage_id !== "AG21F") fail("AG21F handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG21F explicit approval missing");
if (boundary.required_future_approval_phrase !== phrase) fail("AG21F boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag21f !== true) fail("AG21F must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_static_apply_execution_confirmation_only") fail("Schema status mismatch");
for (const key of [
  "execution_confirmation_package_allowed_in_ag21e",
  "approval_phrase_final_confirmation_allowed_in_ag21e",
  "candidate_final_confirmation_allowed_in_ag21e",
  "github_write_final_confirmation_allowed_in_ag21e",
  "public_surface_final_confirmation_allowed_in_ag21e",
  "deployment_smoke_rollback_final_confirmation_allowed_in_ag21e",
  "ag21f_boundary_allowed_in_ag21e"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "explicit_approval_phrase_execution_allowed_in_ag21e",
  "article_generation_allowed_in_ag21e",
  "article_mutation_allowed_in_ag21e",
  "queue_mutation_allowed_in_ag21e",
  "admin_action_execution_allowed_in_ag21e",
  "editor_action_execution_allowed_in_ag21e",
  "auth_activation_allowed_in_ag21e",
  "backend_activation_allowed_in_ag21e",
  "supabase_activation_allowed_in_ag21e",
  "github_token_creation_or_exposure_allowed_in_ag21e",
  "github_write_operation_allowed_in_ag21e",
  "public_visibility_switch_allowed_in_ag21e",
  "public_index_mutation_allowed_in_ag21e",
  "deployment_trigger_allowed_in_ag21e",
  "live_smoke_test_allowed_in_ag21e",
  "rollback_execution_allowed_in_ag21e",
  "public_publishing_operation_allowed_in_ag21e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, confirmationPackage, approvalConfirmation, candidateConfirmation, githubConfirmation, publicSurfaceConfirmation, deployConfirmation, blocker, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_static_apply_execution_confirmation_only !== true) fail(`${obj.title || "object"} must be AG21E execution-confirmation-only`);
  if (obj.explicit_approval_phrase_executed_in_ag21e !== false) fail(`${obj.title || "object"} must not execute approval phrase`);
  if (obj.article_mutation_performed_in_ag21e !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag21e !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag21e !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag21e !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag21e !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag21e !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.live_smoke_test_performed_in_ag21e !== false) fail(`${obj.title || "object"} must not run live smoke-test`);
  if (obj.rollback_execution_performed_in_ag21e !== false) fail(`${obj.title || "object"} must not execute rollback`);
  if (obj.public_publishing_operation_performed_in_ag21e !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag21e !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrasePart of ["Purpose", "Execution Confirmation Sections", "Approval Phrase", "Decision State", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrasePart)) fail(`AG21E document missing phrase: ${phrasePart}`);
}

for (const scriptName of ["generate:ag21e", "validate:ag21e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag21e")) {
  fail("validate:project must include validate:ag21e");
}

pass("AG21E registry is present.");
pass("AG21E document is present.");
pass("AG21E review, execution confirmation package, approval confirmation, candidate confirmation, GitHub confirmation, public surface confirmation, deployment/smoke/rollback confirmation, blocker register, readiness, AG21F boundary, schema, learning and preview are present.");
pass("AG21D controlled static apply execution readiness audit is consumed.");
pass("Controlled static apply execution confirmation package is created without execution.");
pass("Explicit approval phrase remains required but not executed.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG21F Controlled Static Apply Execution Confirmation Audit boundary is created with explicit approval required.");
pass("AG21E is Controlled Static Apply Execution Confirmation only.");
