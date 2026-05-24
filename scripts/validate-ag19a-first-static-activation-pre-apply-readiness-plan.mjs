import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag18z-controlled-real-static-activation-planning-closure.json",
  "data/content-intelligence/closure-records/ag18z-controlled-real-static-activation-planning-closure.json",
  "data/content-intelligence/go-live/ag18z-controlled-real-static-activation-planning-summary.json",
  "data/content-intelligence/quality-registry/ag18z-real-static-activation-pre-apply-blocked-register.json",
  "data/content-intelligence/quality-registry/ag18z-first-static-activation-pre-apply-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18z-to-ag19a-first-static-activation-pre-apply-readiness-plan-boundary.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

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
  "data/content-intelligence/schema/first-static-activation-pre-apply-readiness-plan.schema.json",
  "data/content-intelligence/learning/ag19a-first-static-activation-pre-apply-readiness-plan-learning.json",
  "data/quality/ag19a-first-static-activation-pre-apply-readiness-plan.json",
  "data/quality/ag19a-first-static-activation-pre-apply-readiness-plan-preview.json",
  "docs/quality/AG19A_FIRST_STATIC_ACTIVATION_PRE_APPLY_READINESS_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG19A validation failed: ${message}`);
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

const ag18zReview = readJson("data/content-intelligence/quality-reviews/ag18z-controlled-real-static-activation-planning-closure.json");
const ag18zClosure = readJson("data/content-intelligence/closure-records/ag18z-controlled-real-static-activation-planning-closure.json");
const ag18zReadiness = readJson("data/content-intelligence/quality-registry/ag18z-first-static-activation-pre-apply-readiness-record.json");
const ag18zBoundary = readJson("data/content-intelligence/mutation-plans/ag18z-to-ag19a-first-static-activation-pre-apply-readiness-plan-boundary.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag19a-first-static-activation-pre-apply-readiness-plan.json");
const checklist = readJson("data/content-intelligence/go-live/ag19a-first-static-activation-pre-apply-checklist-plan.json");
const candidate = readJson("data/content-intelligence/go-live/ag19a-first-candidate-evidence-requirement-plan.json");
const publicFilter = readJson("data/content-intelligence/go-live/ag19a-final-public-filter-evidence-plan.json");
const fileDelta = readJson("data/content-intelligence/go-live/ag19a-exact-file-delta-pre-apply-plan.json");
const rollback = readJson("data/content-intelligence/go-live/ag19a-rollback-branch-commit-strategy-plan.json");
const manual = readJson("data/content-intelligence/go-live/ag19a-manual-approval-gate-plan.json");
const githubSecret = readJson("data/content-intelligence/go-live/ag19a-github-secret-storage-no-secrets-plan.json");
const blockers = readJson("data/content-intelligence/quality-registry/ag19a-pre-apply-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag19a-pre-apply-readiness-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag19a-to-ag19b-pre-apply-readiness-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/first-static-activation-pre-apply-readiness-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag19a-first-static-activation-pre-apply-readiness-plan-learning.json");
const registry = readJson("data/quality/ag19a-first-static-activation-pre-apply-readiness-plan.json");
const preview = readJson("data/quality/ag19a-first-static-activation-pre-apply-readiness-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG19A_FIRST_STATIC_ACTIVATION_PRE_APPLY_READINESS_PLAN.md"), "utf8");

for (const obj of [review, checklist, candidate, publicFilter, fileDelta, rollback, manual, githubSecret, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG19A") fail(`module_id must be AG19A in ${obj.title || "object"}`);
}

if (ag18zReview.status !== "controlled_real_static_activation_planning_chain_closed_ready_for_ag19a_pre_apply") fail("AG18Z review status mismatch");
if (ag18zClosure.final_decision.proceed_to_ag19a_first_static_activation_pre_apply_readiness_plan !== true) fail("AG18Z closure decision missing");
if (ag18zReadiness.ready_for_ag19a !== true) fail("AG19A readiness missing from AG18Z");
if (ag18zBoundary.next_stage_id !== "AG19A") fail("AG19A boundary missing in AG18Z");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "first_static_activation_pre_apply_readiness_plan_defined_real_apply_blocked") fail("Review status mismatch");
if (checklist.status !== "first_static_activation_pre_apply_checklist_planned_no_execution") fail("Checklist status mismatch");
if (candidate.status !== "candidate_evidence_requirements_planned_no_evidence_apply") fail("Candidate evidence status mismatch");
if (publicFilter.status !== "final_public_filter_evidence_planned_no_visibility_switch") fail("Public filter status mismatch");
if (fileDelta.status !== "exact_file_delta_pre_apply_planned_no_mutation") fail("File delta status mismatch");
if (rollback.status !== "rollback_branch_commit_strategy_planned_no_execution") fail("Rollback status mismatch");
if (manual.status !== "manual_approval_gate_planned_no_approval_executed") fail("Manual approval status mismatch");
if (githubSecret.status !== "github_secret_storage_planned_no_secrets_created") fail("GitHub secret plan status mismatch");
if (blockers.status !== "pre_apply_operations_remain_blocked") fail("Blocker status mismatch");
if (readiness.status !== "ready_for_ag19b_pre_apply_readiness_audit") fail("Readiness status mismatch");

if (!checklist.checklist_items.every((item) => item.completed_now === false)) fail("Checklist items must not be completed now");
for (const [key, value] of Object.entries(checklist.execution_state_now)) {
  if (value !== false) fail(`Checklist execution state must remain false: ${key}`);
}

if (candidate.candidate.article_path !== articlePath) fail("Candidate article path mismatch");
if (candidate.candidate.article_hash !== currentHash) fail("Candidate hash mismatch");
if (candidate.current_evidence_state.ready_for_real_apply_now !== false) fail("Candidate must not be ready for real apply");
for (const [key, value] of Object.entries(candidate.current_evidence_state)) {
  if (value !== false) fail(`Candidate evidence state must remain false: ${key}`);
}

if (publicFilter.current_filter_state.public_visibility !== false) fail("Public visibility must be false");
if (publicFilter.current_filter_state.publish_approved !== false) fail("Publish approved must be false");
if (publicFilter.current_filter_state.public_index_allowed !== false) fail("Public index allowed must be false");
if (publicFilter.current_filter_state.public_exposure_allowed_now !== false) fail("Public exposure must not be allowed");

if (!fileDelta.proposed_future_delta_targets.every((target) => target.exact_file_selected_now === false && target.mutation_now === false)) {
  fail("Future delta targets must not be selected or mutated now");
}
for (const [key, value] of Object.entries(fileDelta.mutation_state_now)) {
  if (value !== false) fail(`File delta mutation state must remain false: ${key}`);
}

for (const [key, value] of Object.entries(rollback.current_state)) {
  if (value !== false) fail(`Rollback state must remain false: ${key}`);
}

if (manual.approval_required_before_future_apply !== true) fail("Manual approval must be required");
for (const [key, value] of Object.entries(manual.current_approval_state)) {
  if (value !== false) fail(`Manual approval state must remain false: ${key}`);
}

if (!githubSecret.future_secret_requirements.every((item) =>
  item.created_now === false &&
  item.exposed_now === false &&
  item.wired_now === false &&
  item.committed_now === false
)) fail("No GitHub secret requirement may create/expose/wire/commit secrets now");
for (const [key, value] of Object.entries(githubSecret.current_secret_state)) {
  if (value !== false) fail(`GitHub secret state must remain false: ${key}`);
}

for (const item of [
  "Real candidate apply.",
  "Real GitHub token creation.",
  "Real GitHub write.",
  "Real public visibility switch.",
  "Real public index mutation.",
  "Deployment trigger.",
  "Publish execution.",
  "Supabase/Auth/backend activation."
]) {
  if (!blockers.blocked_items.includes(item)) fail(`Blocked item missing: ${item}`);
}
if (blockers.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred");
if (!blockers.reminder.includes("static/GitHub-controlled go-live first")) fail("Reminder must mention static/GitHub first");

if (readiness.ready_for_ag19b !== true) fail("AG19B readiness missing");
if (readiness.first_static_activation_pre_apply_plan_defined !== true) fail("Pre-apply plan definition missing");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.candidate_apply_ready !== false) fail("Candidate apply must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag19b_boundary_created_not_started") fail("AG19B boundary status mismatch");
if (boundary.next_stage_id !== "AG19B") fail("AG19B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG19B explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag19b !== true) fail("AG19B must carry Supabase/Auth reminder");

if (schema.status !== "schema_first_static_activation_pre_apply_readiness_plan_only") fail("Schema status mismatch");

for (const key of [
  "pre_apply_checklist_plan_allowed_in_ag19a",
  "candidate_evidence_plan_allowed_in_ag19a",
  "final_public_filter_evidence_plan_allowed_in_ag19a",
  "exact_file_delta_pre_apply_plan_allowed_in_ag19a",
  "rollback_branch_commit_strategy_plan_allowed_in_ag19a",
  "manual_approval_gate_plan_allowed_in_ag19a",
  "github_secret_storage_no_secrets_plan_allowed_in_ag19a",
  "ag19b_boundary_allowed_in_ag19a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag19a",
  "article_mutation_allowed_in_ag19a",
  "queue_mutation_allowed_in_ag19a",
  "active_admin_review_queue_record_creation_allowed_in_ag19a",
  "queue_index_mutation_allowed_in_ag19a",
  "admin_action_execution_allowed_in_ag19a",
  "editor_action_execution_allowed_in_ag19a",
  "auth_activation_allowed_in_ag19a",
  "backend_activation_allowed_in_ag19a",
  "supabase_activation_allowed_in_ag19a",
  "github_token_creation_or_exposure_allowed_in_ag19a",
  "github_write_operation_allowed_in_ag19a",
  "public_visibility_switch_allowed_in_ag19a",
  "public_index_mutation_allowed_in_ag19a",
  "public_publishing_operation_allowed_in_ag19a",
  "deployment_trigger_allowed_in_ag19a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, checklist, candidate, publicFilter, fileDelta, rollback, manual, githubSecret, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.first_static_activation_pre_apply_readiness_plan_only !== true) fail(`${obj.title || "object"} must be AG19A plan-only`);
  if (obj.article_generation_performed_in_ag19a !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag19a !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag19a !== false) fail(`${obj.title || "object"} must not create/expose token`);
  if (obj.github_write_operation_performed_in_ag19a !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag19a !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag19a !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag19a !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag19a !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag19a !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Planned Outputs", "Decision State", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG19A document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag19a", "validate:ag19a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag19a")) {
  fail("validate:project must include validate:ag19a");
}

pass("AG19A registry is present.");
pass("AG19A document is present.");
pass("AG19A review, checklist plan, candidate evidence plan, public filter evidence plan, exact file delta plan, rollback strategy, manual approval gate, GitHub secret plan, blocker register, readiness, AG19B boundary, schema, learning and preview are present.");
pass("AG18Z controlled real static activation planning closure is consumed.");
pass("First static activation pre-apply readiness is planned without execution.");
pass("Candidate evidence, public filter, exact file delta, rollback, manual approval and GitHub secret storage are planned.");
pass("No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG19B Pre-Apply Readiness Audit boundary is created with explicit approval required.");
pass("AG19A is First Static Activation Pre-Apply Readiness Plan only.");
