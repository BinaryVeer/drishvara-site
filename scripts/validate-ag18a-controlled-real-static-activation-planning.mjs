import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag17z-static-go-live-preparation-chain-closure.json",
  "data/content-intelligence/closure-records/ag17z-static-go-live-preparation-chain-closure.json",
  "data/content-intelligence/go-live/ag17z-static-go-live-preparation-summary.json",
  "data/content-intelligence/quality-registry/ag17z-real-static-activation-blocked-register.json",
  "data/content-intelligence/quality-registry/ag17z-next-path-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17z-to-ag18a-controlled-real-static-activation-planning-boundary.json",
  "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag18a-controlled-real-static-activation-planning.json",
  "data/content-intelligence/go-live/ag18a-real-static-activation-sequence-plan.json",
  "data/content-intelligence/go-live/ag18a-first-public-candidate-selection-plan.json",
  "data/content-intelligence/go-live/ag18a-github-secret-governance-no-secrets-plan.json",
  "data/content-intelligence/go-live/ag18a-public-index-delta-review-plan.json",
  "data/content-intelligence/go-live/ag18a-rollback-smoke-test-plan.json",
  "data/content-intelligence/quality-registry/ag18a-real-static-activation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag18a-controlled-real-static-activation-plan-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag18a-to-ag18b-controlled-real-static-activation-plan-audit-boundary.json",
  "data/content-intelligence/schema/controlled-real-static-activation-planning.schema.json",
  "data/content-intelligence/learning/ag18a-controlled-real-static-activation-planning-learning.json",
  "data/quality/ag18a-controlled-real-static-activation-planning.json",
  "data/quality/ag18a-controlled-real-static-activation-planning-preview.json",
  "docs/quality/AG18A_CONTROLLED_REAL_STATIC_ACTIVATION_PLANNING.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG18A validation failed: ${message}`);
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

const ag17zReview = readJson("data/content-intelligence/quality-reviews/ag17z-static-go-live-preparation-chain-closure.json");
const ag17zClosure = readJson("data/content-intelligence/closure-records/ag17z-static-go-live-preparation-chain-closure.json");
const ag17zReadiness = readJson("data/content-intelligence/quality-registry/ag17z-next-path-readiness-record.json");
const ag17zBoundary = readJson("data/content-intelligence/mutation-plans/ag17z-to-ag18a-controlled-real-static-activation-planning-boundary.json");
const ag17aDecision = readJson("data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag18a-controlled-real-static-activation-planning.json");
const sequence = readJson("data/content-intelligence/go-live/ag18a-real-static-activation-sequence-plan.json");
const candidate = readJson("data/content-intelligence/go-live/ag18a-first-public-candidate-selection-plan.json");
const secret = readJson("data/content-intelligence/go-live/ag18a-github-secret-governance-no-secrets-plan.json");
const delta = readJson("data/content-intelligence/go-live/ag18a-public-index-delta-review-plan.json");
const rollback = readJson("data/content-intelligence/go-live/ag18a-rollback-smoke-test-plan.json");
const blockers = readJson("data/content-intelligence/quality-registry/ag18a-real-static-activation-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag18a-controlled-real-static-activation-plan-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag18a-to-ag18b-controlled-real-static-activation-plan-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-real-static-activation-planning.schema.json");
const learning = readJson("data/content-intelligence/learning/ag18a-controlled-real-static-activation-planning-learning.json");
const registry = readJson("data/quality/ag18a-controlled-real-static-activation-planning.json");
const preview = readJson("data/quality/ag18a-controlled-real-static-activation-planning-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG18A_CONTROLLED_REAL_STATIC_ACTIVATION_PLANNING.md"), "utf8");

for (const obj of [review, sequence, candidate, secret, delta, rollback, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG18A") fail(`module_id must be AG18A in ${obj.title || "object"}`);
}

if (ag17zReview.status !== "static_go_live_preparation_chain_closed_real_activation_blocked") fail("AG17Z review status mismatch");
if (ag17zClosure.final_decision.ag17_chain_closed !== true) fail("AG17 chain closure missing");
if (ag17zReadiness.ready_for_ag18a !== true) fail("AG18A readiness missing from AG17Z");
if (ag17zBoundary.next_stage_id !== "AG18A") fail("AG18A boundary missing in AG17Z");
if (ag17aDecision.selected_path !== "hybrid_staged_path") fail("Hybrid staged path decision missing");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate article hash mismatch");

if (review.status !== "controlled_real_static_activation_planning_defined_real_activation_blocked") fail("Review status mismatch");
if (sequence.status !== "real_static_activation_sequence_planned_no_execution") fail("Sequence plan status mismatch");
if (candidate.status !== "first_public_candidate_selection_planned_no_selection_apply") fail("Candidate plan status mismatch");
if (secret.status !== "github_secret_governance_planned_no_secrets_created") fail("Secret plan status mismatch");
if (delta.status !== "public_index_delta_review_planned_no_mutation") fail("Delta plan status mismatch");
if (rollback.status !== "rollback_smoke_test_planned_no_execution") fail("Rollback plan status mismatch");
if (blockers.status !== "real_static_activation_blockers_reconfirmed") fail("Blocker register status mismatch");
if (readiness.status !== "ready_for_ag18b_controlled_real_static_activation_plan_audit") fail("Readiness status mismatch");

if (!sequence.sequence.every((step) => step.execution_now === false)) fail("Sequence steps must not execute now");
for (const [key, value] of Object.entries(sequence.execution_state_now)) {
  if (value !== false) fail(`Sequence execution state must remain false: ${key}`);
}

if (candidate.candidate_under_consideration.hash_verified !== true) fail("Candidate hash must be verified");
if (candidate.selection_decision_now.first_candidate_selected_for_real_apply !== false) fail("Candidate must not be selected for real apply");
if (candidate.selection_decision_now.public_visibility_enabled !== false) fail("Candidate must not enable public visibility");
if (candidate.selection_decision_now.publish_approved_enabled !== false) fail("Candidate must not enable publish approved");
if (candidate.selection_decision_now.public_index_allowed_enabled !== false) fail("Candidate must not enable public index allowed");

if (!secret.future_secret_placeholders.every((item) =>
  item.created_now === false &&
  item.exposed_now === false &&
  item.wired_now === false &&
  item.committed_now === false
)) fail("No secret placeholder may be created, exposed, wired or committed");

if (secret.current_secret_state.github_token_created !== false) fail("GitHub token must not be created");
if (secret.current_secret_state.github_token_exposed !== false) fail("GitHub token must not be exposed");
if (secret.current_secret_state.github_token_wired !== false) fail("GitHub token must not be wired");
if (secret.current_secret_state.github_write_enabled !== false) fail("GitHub write must not be enabled");

if (!delta.future_delta_targets.every((item) => item.mutation_now === false)) fail("No future delta target may mutate now");
for (const [key, value] of Object.entries(delta.mutation_state_now)) {
  if (value !== false) fail(`Delta mutation state must remain false: ${key}`);
}

for (const [key, value] of Object.entries(rollback.current_execution_state)) {
  if (value !== false) fail(`Rollback/smoke execution state must remain false: ${key}`);
}

for (const requiredBlocker of [
  "No real GitHub token creation.",
  "No real GitHub write.",
  "No public visibility switch.",
  "No public index mutation.",
  "No deployment trigger.",
  "No publishing operation.",
  "No Supabase/Auth/backend activation."
]) {
  if (!blockers.blockers.includes(requiredBlocker)) fail(`Missing blocker: ${requiredBlocker}`);
}

if (blockers.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred");
if (!blockers.reminder.includes("static/GitHub-controlled go-live first")) fail("Reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Reminder must mention Supabase/Auth/backend later");

if (readiness.ready_for_ag18b !== true) fail("AG18B readiness missing");
if (readiness.static_github_controlled_first !== true) fail("Static/GitHub first readiness missing");
if (readiness.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend deferred readiness missing");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (boundary.status !== "ag18b_boundary_created_not_started") fail("AG18B boundary status mismatch");
if (boundary.next_stage_id !== "AG18B") fail("AG18B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG18B explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag18b !== true) fail("AG18B must carry Supabase/Auth reminder");

if (schema.status !== "schema_controlled_real_static_activation_planning_only") fail("Schema status mismatch");

for (const key of [
  "real_static_activation_sequence_plan_allowed_in_ag18a",
  "first_public_candidate_selection_plan_allowed_in_ag18a",
  "github_secret_governance_no_secrets_plan_allowed_in_ag18a",
  "public_index_delta_review_plan_allowed_in_ag18a",
  "rollback_smoke_test_plan_allowed_in_ag18a",
  "blocker_register_allowed_in_ag18a",
  "ag18b_boundary_allowed_in_ag18a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag18a",
  "article_mutation_allowed_in_ag18a",
  "queue_mutation_allowed_in_ag18a",
  "active_admin_review_queue_record_creation_allowed_in_ag18a",
  "queue_index_mutation_allowed_in_ag18a",
  "admin_action_execution_allowed_in_ag18a",
  "editor_action_execution_allowed_in_ag18a",
  "auth_activation_allowed_in_ag18a",
  "backend_activation_allowed_in_ag18a",
  "supabase_activation_allowed_in_ag18a",
  "database_write_allowed_in_ag18a",
  "github_token_creation_or_exposure_allowed_in_ag18a",
  "github_write_operation_allowed_in_ag18a",
  "active_action_handler_creation_allowed_in_ag18a",
  "public_visibility_switch_allowed_in_ag18a",
  "public_index_mutation_allowed_in_ag18a",
  "public_publishing_operation_allowed_in_ag18a",
  "deployment_trigger_allowed_in_ag18a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, sequence, candidate, secret, delta, rollback, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_real_static_activation_planning_only !== true) fail(`${obj.title || "object"} must be AG18A planning-only`);
  if (obj.article_generation_performed_in_ag18a !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag18a !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.github_token_created_or_exposed_in_ag18a !== false) fail(`${obj.title || "object"} must not create/expose GitHub token`);
  if (obj.github_write_operation_performed_in_ag18a !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.public_visibility_switch_performed_in_ag18a !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag18a !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag18a !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag18a !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag18a !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

for (const phrase of ["Purpose", "Selected Path", "Planned Outputs", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG18A document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag18a", "validate:ag18a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag18a")) {
  fail("validate:project must include validate:ag18a");
}

pass("AG18A registry is present.");
pass("AG18A document is present.");
pass("AG18A review, sequence plan, candidate plan, GitHub secret governance, public delta review, rollback/smoke-test plan, blocker register, readiness, AG18B boundary, schema, learning and preview are present.");
pass("AG17Z static go-live preparation closure is consumed.");
pass("Controlled real static activation planning is defined.");
pass("Candidate selection is planned but not applied.");
pass("GitHub secret governance is defined with no secrets created, exposed, wired or committed.");
pass("Public index delta review and rollback/smoke-test plans are defined without mutation or execution.");
pass("GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
pass("Supabase/Auth/backend remains deferred and reminder is carried forward.");
pass("AG18B Controlled Real Static Activation Plan Audit boundary is created with explicit approval required.");
pass("AG18A is Controlled Real Static Activation Planning only.");
