import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag17a-controlled-go-live-implementation-path-decision.json",
  "data/content-intelligence/quality-reviews/ag17b-hybrid-static-go-live-implementation-plan.json",
  "data/content-intelligence/quality-reviews/ag17c-hybrid-static-go-live-plan-audit.json",
  "data/content-intelligence/quality-reviews/ag17d-non-active-static-go-live-implementation-scaffold.json",
  "data/content-intelligence/quality-reviews/ag17e-non-active-static-go-live-scaffold-audit.json",
  "data/content-intelligence/audit-records/ag17e-non-active-static-go-live-scaffold-audit-report.json",
  "data/content-intelligence/closure-records/ag17e-non-active-static-go-live-scaffold-closure.json",
  "data/content-intelligence/quality-registry/ag17e-non-active-static-go-live-scaffold-safety-record.json",
  "data/content-intelligence/quality-registry/ag17e-static-go-live-chain-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17e-to-ag17z-static-go-live-chain-closure-boundary.json",
  "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json",
  "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag17z-static-go-live-preparation-chain-closure.json",
  "data/content-intelligence/closure-records/ag17z-static-go-live-preparation-chain-closure.json",
  "data/content-intelligence/go-live/ag17z-static-go-live-preparation-summary.json",
  "data/content-intelligence/quality-registry/ag17z-real-static-activation-blocked-register.json",
  "data/content-intelligence/quality-registry/ag17z-next-path-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17z-to-ag18a-controlled-real-static-activation-planning-boundary.json",
  "data/content-intelligence/schema/static-go-live-preparation-chain-closure.schema.json",
  "data/content-intelligence/learning/ag17z-static-go-live-preparation-chain-closure-learning.json",
  "data/quality/ag17z-static-go-live-preparation-chain-closure.json",
  "data/quality/ag17z-static-go-live-preparation-chain-closure-preview.json",
  "docs/quality/AG17Z_STATIC_GO_LIVE_PREPARATION_CHAIN_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG17Z validation failed: ${message}`);
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

const ag17eReview = readJson("data/content-intelligence/quality-reviews/ag17e-non-active-static-go-live-scaffold-audit.json");
const ag17eAudit = readJson("data/content-intelligence/audit-records/ag17e-non-active-static-go-live-scaffold-audit-report.json");
const ag17eReadiness = readJson("data/content-intelligence/quality-registry/ag17e-static-go-live-chain-closure-readiness-record.json");
const ag17eBoundary = readJson("data/content-intelligence/mutation-plans/ag17e-to-ag17z-static-go-live-chain-closure-boundary.json");
const ag17aDecision = readJson("data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json");
const ag17bReminder = readJson("data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag17z-static-go-live-preparation-chain-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag17z-static-go-live-preparation-chain-closure.json");
const summary = readJson("data/content-intelligence/go-live/ag17z-static-go-live-preparation-summary.json");
const blocked = readJson("data/content-intelligence/quality-registry/ag17z-real-static-activation-blocked-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag17z-next-path-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag17z-to-ag18a-controlled-real-static-activation-planning-boundary.json");
const schema = readJson("data/content-intelligence/schema/static-go-live-preparation-chain-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag17z-static-go-live-preparation-chain-closure-learning.json");
const registry = readJson("data/quality/ag17z-static-go-live-preparation-chain-closure.json");
const preview = readJson("data/quality/ag17z-static-go-live-preparation-chain-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG17Z_STATIC_GO_LIVE_PREPARATION_CHAIN_CLOSURE.md"), "utf8");

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG17Z") fail(`module_id must be AG17Z in ${obj.title || "object"}`);
}

if (ag17eReview.status !== "non_active_static_go_live_scaffold_audit_passed_ready_for_ag17z_closure") fail("AG17E review status mismatch");
if (ag17eAudit.failed_checks.length !== 0) fail("AG17E failed checks must be zero");
if (ag17eReadiness.ready_for_ag17z !== true) fail("AG17E readiness missing");
if (ag17eBoundary.next_stage_id !== "AG17Z") fail("AG17Z boundary missing in AG17E");
if (ag17aDecision.selected_path !== "hybrid_staged_path") fail("Hybrid staged path decision missing");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "static_go_live_preparation_chain_closed_real_activation_blocked") fail("Review status mismatch");
if (closure.status !== "static_go_live_preparation_chain_closed_real_activation_blocked") fail("Closure status mismatch");
if (summary.status !== "ag17_static_go_live_preparation_chain_completed") fail("Summary status mismatch");
if (blocked.status !== "real_static_activation_operations_remain_blocked") fail("Blocked register status mismatch");
if (readiness.status !== "ready_for_ag18a_controlled_real_static_activation_planning") fail("Readiness status mismatch");

if (summary.completed_stage_count !== 5) fail("AG17Z must summarise five AG17 stages");
for (const stage of ["AG17A", "AG17B", "AG17C", "AG17D", "AG17E"]) {
  if (!summary.completed_stages.some((item) => item.stage_id === stage)) fail(`Missing completed stage ${stage}`);
}
if (summary.selected_path !== "hybrid_staged_path") fail("Summary selected path mismatch");
if (summary.static_github_controlled_first !== true) fail("Static/GitHub first must be true");
if (summary.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must be deferred");
if (summary.supabase_auth_reminder_required_in_future !== true) fail("Supabase/Auth reminder must be required");

const state = summary.final_static_go_live_preparation_state;
for (const key of [
  "path_decision_completed",
  "static_architecture_planned",
  "public_exposure_sequence_planned",
  "github_secret_requirements_planned_no_secrets",
  "admin_editor_static_action_readiness_planned",
  "rollback_audit_plan_defined",
  "non_active_static_go_live_scaffold_created",
  "non_active_static_go_live_scaffold_audited"
]) {
  if (state[key] !== true) fail(`Summary final state must confirm ${key}`);
}
for (const key of [
  "github_write_enabled",
  "github_token_created",
  "github_token_exposed",
  "github_token_wired",
  "admin_editor_execution_enabled",
  "public_visibility_switch_enabled",
  "public_index_mutation_enabled",
  "deployment_trigger_enabled",
  "publishing_enabled",
  "supabase_auth_backend_enabled"
]) {
  if (state[key] !== false) fail(`Summary final state must block ${key}`);
}

for (const item of [
  "Real GitHub write token creation.",
  "Real GitHub content write.",
  "Real public visibility switch.",
  "Real public index mutation.",
  "Deployment trigger.",
  "Publish execution.",
  "Supabase/Auth/backend activation."
]) {
  if (!blocked.blocked_items_after_ag17_closure.includes(item)) fail(`Blocked item missing: ${item}`);
}
if (blocked.supabase_auth_backend_deferred !== true) fail("Blocked register must defer Supabase/Auth/backend");
if (!blocked.reminder.includes("static/GitHub-controlled go-live first")) fail("Blocked register reminder must mention static/GitHub first");
if (!blocked.reminder.includes("Supabase/Auth/backend later")) fail("Blocked register reminder must mention Supabase/Auth/backend later");

if (readiness.ready_for_ag18a !== true) fail("AG18A readiness missing");
if (readiness.ag17_chain_closed !== true) fail("AG17 chain closure missing");
if (readiness.selected_path !== "hybrid_staged_path") fail("Readiness selected path mismatch");
if (readiness.static_github_controlled_first !== true) fail("Static/GitHub first readiness missing");
if (readiness.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend deferred readiness missing");
if (readiness.recommended_next_stage !== "AG18A") fail("Recommended next stage must be AG18A");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.github_token_ready !== false) fail("GitHub token must remain blocked");
if (readiness.public_visibility_switch_ready !== false) fail("Visibility switch must remain blocked");
if (readiness.public_index_mutation_ready !== false) fail("Public index mutation must remain blocked");
if (readiness.deployment_trigger_ready !== false) fail("Deployment trigger must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (closure.final_decision.ag17_chain_closed !== true) fail("AG17 chain closure missing");
if (closure.final_decision.static_github_controlled_first_confirmed !== true) fail("Static/GitHub first closure missing");
if (closure.final_decision.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend deferred closure missing");
if (closure.final_decision.proceed_to_ag18a_controlled_real_static_activation_planning !== true) fail("AG18A handoff missing");
for (const key of [
  "proceed_to_real_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (closure.final_decision[key] !== false) fail(`Closure must block ${key}`);
}

if (boundary.status !== "ag18a_boundary_created_not_started") fail("AG18A boundary status mismatch");
if (boundary.next_stage_id !== "AG18A") fail("AG18A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG18A explicit approval missing");
if (boundary.supabase_auth_defer_reminder_required_in_ag18a !== true) fail("AG18A must carry Supabase/Auth reminder");

if (schema.status !== "schema_static_go_live_preparation_chain_closure_only") fail("Schema status mismatch");

for (const key of [
  "chain_closure_allowed_in_ag17z",
  "preparation_summary_allowed_in_ag17z",
  "blocked_register_allowed_in_ag17z",
  "next_path_boundary_allowed_in_ag17z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag17z",
  "article_mutation_allowed_in_ag17z",
  "queue_mutation_allowed_in_ag17z",
  "active_admin_review_queue_record_creation_allowed_in_ag17z",
  "queue_index_mutation_allowed_in_ag17z",
  "admin_action_execution_allowed_in_ag17z",
  "editor_action_execution_allowed_in_ag17z",
  "auth_activation_allowed_in_ag17z",
  "backend_activation_allowed_in_ag17z",
  "supabase_activation_allowed_in_ag17z",
  "github_write_operation_allowed_in_ag17z",
  "public_visibility_switch_allowed_in_ag17z",
  "public_index_mutation_allowed_in_ag17z",
  "public_publishing_operation_allowed_in_ag17z",
  "deployment_trigger_allowed_in_ag17z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, summary, blocked, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.static_go_live_preparation_chain_closure_only !== true) fail(`${obj.title || "object"} must be AG17Z closure-only`);
  if (obj.article_generation_performed_in_ag17z !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag17z !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag17z !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.github_write_operation_performed_in_ag17z !== false) fail(`${obj.title || "object"} must not write to GitHub`);
  if (obj.public_visibility_switch_performed_in_ag17z !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag17z !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.deployment_trigger_performed_in_ag17z !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.public_publishing_operation_performed_in_ag17z !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.supabase_activation_performed_in_ag17z !== false) fail(`${obj.title || "object"} must not activate Supabase`);
}

if (!ag17bReminder.reminder.includes("static/GitHub-controlled go-live first")) fail("Supabase reminder must mention static/GitHub first");
if (!ag17bReminder.reminder.includes("Supabase/Auth/backend later")) fail("Supabase reminder must mention Supabase/Auth/backend later");

for (const phrase of ["Purpose", "Completed Chain", "Final Decision", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG17Z document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag17z", "validate:ag17z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag17z")) {
  fail("validate:project must include validate:ag17z");
}

pass("AG17Z registry is present.");
pass("AG17Z document is present.");
pass("AG17Z review, closure, summary, blocked register, readiness, AG18A boundary, schema, learning and preview are present.");
pass("AG17A through AG17E chain is consumed and summarised.");
pass("Static-first go-live preparation chain is closed.");
pass("Hybrid staged path remains confirmed: static/GitHub-controlled first, Supabase/Auth/backend later.");
pass("Real static activation remains blocked.");
pass("GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
pass("Supabase/Auth/backend remains deferred and future reminder is required.");
pass("AG18A Controlled Real Static Activation Planning boundary is created with explicit approval required.");
pass("AG17Z is Static Go-live Preparation Chain Closure only.");
