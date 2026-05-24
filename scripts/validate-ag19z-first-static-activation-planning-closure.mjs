import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag19a-first-static-activation-pre-apply-readiness-plan.json",
  "data/content-intelligence/quality-reviews/ag19b-pre-apply-readiness-audit.json",
  "data/content-intelligence/quality-reviews/ag19c-final-public-delta-dry-run.json",
  "data/content-intelligence/quality-reviews/ag19d-final-public-delta-dry-run-audit.json",
  "data/content-intelligence/quality-reviews/ag19e-first-static-activation-approval-package.json",
  "data/content-intelligence/quality-reviews/ag19f-first-static-activation-approval-package-audit.json",
  "data/content-intelligence/audit-records/ag19f-first-static-activation-approval-package-audit-report.json",
  "data/content-intelligence/closure-records/ag19f-first-static-activation-approval-package-audit-closure.json",
  "data/content-intelligence/quality-registry/ag19f-first-static-activation-approval-package-safety-record.json",
  "data/content-intelligence/quality-registry/ag19f-first-static-activation-planning-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19f-to-ag19z-first-static-activation-planning-closure-boundary.json",
  "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag19z-first-static-activation-planning-closure.json",
  "data/content-intelligence/closure-records/ag19z-first-static-activation-planning-closure.json",
  "data/content-intelligence/go-live/ag19z-first-static-activation-planning-summary.json",
  "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-blocked-register.json",
  "data/content-intelligence/quality-registry/ag19z-controlled-static-apply-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag19z-to-ag20a-controlled-static-apply-readiness-boundary.json",
  "data/content-intelligence/schema/first-static-activation-planning-closure.schema.json",
  "data/content-intelligence/learning/ag19z-first-static-activation-planning-closure-learning.json",
  "data/quality/ag19z-first-static-activation-planning-closure.json",
  "data/quality/ag19z-first-static-activation-planning-closure-preview.json",
  "docs/quality/AG19Z_FIRST_STATIC_ACTIVATION_PLANNING_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG19Z validation failed: ${message}`);
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

const ag19fReview = readJson("data/content-intelligence/quality-reviews/ag19f-first-static-activation-approval-package-audit.json");
const ag19fAudit = readJson("data/content-intelligence/audit-records/ag19f-first-static-activation-approval-package-audit-report.json");
const ag19fClosure = readJson("data/content-intelligence/closure-records/ag19f-first-static-activation-approval-package-audit-closure.json");
const ag19fSafety = readJson("data/content-intelligence/quality-registry/ag19f-first-static-activation-approval-package-safety-record.json");
const ag19fReadiness = readJson("data/content-intelligence/quality-registry/ag19f-first-static-activation-planning-closure-readiness-record.json");
const ag19fBoundary = readJson("data/content-intelligence/mutation-plans/ag19f-to-ag19z-first-static-activation-planning-closure-boundary.json");
const ag19eApprovalPhrase = readJson("data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag19z-first-static-activation-planning-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag19z-first-static-activation-planning-closure.json");
const summary = readJson("data/content-intelligence/go-live/ag19z-first-static-activation-planning-summary.json");
const blocked = readJson("data/content-intelligence/quality-registry/ag19z-controlled-static-apply-blocked-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag19z-controlled-static-apply-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag19z-to-ag20a-controlled-static-apply-readiness-boundary.json");
const schema = readJson("data/content-intelligence/schema/first-static-activation-planning-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag19z-first-static-activation-planning-closure-learning.json");
const registry = readJson("data/quality/ag19z-first-static-activation-planning-closure.json");
const preview = readJson("data/quality/ag19z-first-static-activation-planning-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG19Z_FIRST_STATIC_ACTIVATION_PLANNING_CLOSURE.md"), "utf8");

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG19Z") fail(`module_id must be AG19Z in ${obj.title || "object"}`);
}

if (ag19fReview.status !== "first_static_activation_approval_package_audit_passed_ready_for_ag19z_closure") fail("AG19F review status mismatch");
if (ag19fAudit.failed_checks.length !== 0) fail("AG19F failed checks must be zero");
if (ag19fClosure.closure_decision.proceed_to_ag19z_first_static_activation_planning_closure !== true) fail("AG19F closure handoff missing");
if (ag19fReadiness.ready_for_ag19z !== true) fail("AG19F readiness for AG19Z missing");
if (ag19fBoundary.next_stage_id !== "AG19Z") fail("AG19Z boundary missing in AG19F");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "first_static_activation_planning_chain_closed_ready_for_ag20a_controlled_static_apply_readiness") fail("Review status mismatch");
if (closure.status !== "first_static_activation_planning_chain_closed_ready_for_ag20a_controlled_static_apply_readiness") fail("Closure status mismatch");
if (summary.status !== "ag19_first_static_activation_planning_completed") fail("Summary status mismatch");
if (blocked.status !== "controlled_static_apply_operations_remain_blocked_pending_ag20") fail("Blocked register status mismatch");
if (readiness.status !== "ready_for_ag20a_controlled_static_apply_readiness") fail("Readiness status mismatch");

if (summary.completed_stage_count !== 6) fail("AG19Z must summarise six AG19 stages");
for (const stage of ["AG19A", "AG19B", "AG19C", "AG19D", "AG19E", "AG19F"]) {
  if (!summary.completed_stages.some((item) => item.stage_id === stage)) fail(`Missing completed stage ${stage}`);
}

if (summary.explicit_approval_phrase_required_later !== "Proceed with first controlled static apply") fail("Approval phrase mismatch in summary");
if (ag19eApprovalPhrase.exact_phrase_required_later !== "Proceed with first controlled static apply") fail("Inherited approval phrase mismatch");

const finalState = summary.final_ag19_state;
for (const key of [
  "pre_apply_readiness_planned",
  "pre_apply_readiness_audited",
  "final_public_delta_dry_run_completed",
  "final_public_delta_dry_run_audited",
  "approval_package_created",
  "approval_package_audited",
  "ready_for_ag20_controlled_static_apply_readiness"
]) {
  if (finalState[key] !== true) fail(`Final AG19 state must confirm ${key}`);
}
for (const key of [
  "explicit_user_approval_executed",
  "candidate_apply_enabled",
  "github_token_created",
  "github_token_exposed",
  "github_token_wired",
  "github_write_enabled",
  "article_mutation_enabled",
  "queue_mutation_enabled",
  "admin_editor_execution_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "deployment_trigger_enabled",
  "publishing_enabled",
  "supabase_auth_backend_enabled"
]) {
  if (finalState[key] !== false) fail(`Final AG19 state must block ${key}`);
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
  if (!blocked.blocked_items_after_ag19_closure.includes(item)) fail(`Blocked item missing: ${item}`);
}
if (blocked.supabase_auth_backend_deferred !== true) fail("Blocked register must defer Supabase/Auth/backend");

if (closure.final_decision.ag19_chain_closed !== true) fail("AG19 chain closure missing");
if (closure.final_decision.proceed_to_ag20a_controlled_static_apply_readiness !== true) fail("AG20A handoff missing");
for (const key of [
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_article_mutation",
  "proceed_to_queue_mutation",
  "proceed_to_admin_editor_execution",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (closure.final_decision[key] !== false) fail(`Closure must block ${key}`);
}

if (ag19fSafety.safety_assertions.github_write_enabled !== false) fail("AG19F safety must block GitHub write");
if (ag19fSafety.safety_assertions.public_visibility_switch_enabled !== false) fail("AG19F safety must block visibility switch");
if (ag19fSafety.safety_assertions.public_index_mutation_enabled !== false) fail("AG19F safety must block public index mutation");
if (ag19fSafety.safety_assertions.deployment_trigger_enabled !== false) fail("AG19F safety must block deployment");
if (ag19fSafety.safety_assertions.publishing_enabled !== false) fail("AG19F safety must block publishing");

if (readiness.ready_for_ag20a !== true) fail("AG20A readiness missing");
if (readiness.ag19_chain_closed !== true) fail("AG19 chain closure readiness missing");
if (readiness.recommended_next_stage !== "AG20A") fail("Recommended next stage must be AG20A");
if (readiness.exact_approval_phrase_required_later !== "Proceed with first controlled static apply") fail("Readiness approval phrase mismatch");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.candidate_apply_ready !== false) fail("Candidate apply must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment trigger must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag20a_boundary_created_not_started") fail("AG20A boundary status mismatch");
if (boundary.next_stage_id !== "AG20A") fail("AG20A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG20A explicit approval missing");
if (boundary.required_future_approval_phrase !== "Proceed with first controlled static apply") fail("AG20A boundary approval phrase mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag20a !== true) fail("AG20A must carry Supabase/Auth reminder");

if (schema.status !== "schema_first_static_activation_planning_closure_only") fail("Schema status mismatch");
for (const key of [
  "chain_closure_allowed_in_ag19z",
  "planning_summary_allowed_in_ag19z",
  "blocked_register_allowed_in_ag19z",
  "ag20a_boundary_allowed_in_ag19z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}
for (const key of [
  "article_generation_allowed_in_ag19z",
  "article_mutation_allowed_in_ag19z",
  "queue_mutation_allowed_in_ag19z",
  "admin_action_execution_allowed_in_ag19z",
  "editor_action_execution_allowed_in_ag19z",
  "auth_activation_allowed_in_ag19z",
  "backend_activation_allowed_in_ag19z",
  "supabase_activation_allowed_in_ag19z",
  "github_token_creation_or_exposure_allowed_in_ag19z",
  "github_write_operation_allowed_in_ag19z",
  "public_visibility_switch_allowed_in_ag19z",
  "public_index_mutation_allowed_in_ag19z",
  "public_publishing_operation_allowed_in_ag19z",
  "deployment_trigger_allowed_in_ag19z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.first_static_activation_planning_closure_only !== true) fail(`${obj.title || "object"} must be AG19Z closure-only`);
  if (obj.article_generation_performed_in_ag19z !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag19z !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag19z !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag19z !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag19z !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag19z !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag19z !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag19z !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag19z !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Completed Chain", "Approval Phrase", "Final Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG19Z document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag19z", "validate:ag19z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag19z")) {
  fail("validate:project must include validate:ag19z");
}

pass("AG19Z registry is present.");
pass("AG19Z document is present.");
pass("AG19Z review, closure, summary, blocked register, readiness, AG20A boundary, schema, learning and preview are present.");
pass("AG19A through AG19F chain is consumed and summarised.");
pass("First static activation planning chain is closed.");
pass("Explicit approval phrase is preserved but not executed.");
pass("Real candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
pass("Supabase/Auth/backend remains deferred and future reminder is required.");
pass("AG20A Controlled Static Apply Readiness boundary is created with explicit approval required.");
pass("AG19Z is First Static Activation Planning Closure only.");
