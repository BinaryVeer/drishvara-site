import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG37B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag37a-dynamic-publish-dry-run-package.json",
  "data/content-intelligence/backend-architecture/ag37a-admin-publish-action-dry-run-simulation.json",
  "data/content-intelligence/backend-architecture/ag37a-publish-guard-evaluation-record.json",
  "data/content-intelligence/backend-architecture/ag37a-non-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag37a-queue-state-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag37a-to-ag37b-queue-state-dry-run-boundary.json",

  "data/content-intelligence/quality-reviews/ag37b-queue-state-dry-run.json",
  "data/content-intelligence/backend-architecture/ag37b-queue-state-dry-run-package.json",
  "data/content-intelligence/backend-architecture/ag37b-queue-state-before-after-model.json",
  "data/content-intelligence/backend-architecture/ag37b-queue-transition-dry-run-simulation.json",
  "data/content-intelligence/backend-architecture/ag37b-state-guard-evaluation-record.json",
  "data/content-intelligence/backend-architecture/ag37b-non-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag37b-queue-state-dry-run-blocker-register.json",
  "data/content-intelligence/quality-registry/ag37b-audit-log-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag37b-to-ag37c-audit-log-dry-run-boundary.json",
  "data/quality/ag37b-queue-state-dry-run.json",
  "data/quality/ag37b-queue-state-dry-run-preview.json",
  "docs/quality/AG37B_QUEUE_STATE_DRY_RUN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag37a = readJson("data/content-intelligence/backend-architecture/ag37a-dynamic-publish-dry-run-package.json");
const ag37aReadiness = readJson("data/content-intelligence/quality-registry/ag37a-queue-state-dry-run-readiness-record.json");
const ag37aBoundary = readJson("data/content-intelligence/mutation-plans/ag37a-to-ag37b-queue-state-dry-run-boundary.json");

const pkgRecord = readJson("data/content-intelligence/backend-architecture/ag37b-queue-state-dry-run-package.json");
const beforeAfter = readJson("data/content-intelligence/backend-architecture/ag37b-queue-state-before-after-model.json");
const transition = readJson("data/content-intelligence/backend-architecture/ag37b-queue-transition-dry-run-simulation.json");
const guard = readJson("data/content-intelligence/backend-architecture/ag37b-state-guard-evaluation-record.json");
const nonMutation = readJson("data/content-intelligence/backend-architecture/ag37b-non-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag37b-audit-log-dry-run-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag37b-to-ag37c-audit-log-dry-run-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag37b-queue-state-dry-run.json");
const preview = readJson("data/quality/ag37b-queue-state-dry-run-preview.json");
const pkg = readJson("package.json");

if (ag37a.status !== "dynamic_publish_dry_run_created_ready_for_ag37b") fail("AG37A source mismatch.");
if (ag37aReadiness.ready_for_ag37b !== true) fail("AG37A readiness must allow AG37B.");
if (ag37aBoundary.next_stage_id !== "AG37B") fail("AG37A boundary must point to AG37B.");

if (pkgRecord.status !== "queue_state_dry_run_created_ready_for_ag37c") fail("Package status mismatch.");
if (pkgRecord.dry_run_decision.queue_state_dry_run_created !== true) fail("Queue dry-run created missing.");
if (pkgRecord.dry_run_decision.queue_transition_simulated !== true) fail("Queue transition simulation missing.");
if (pkgRecord.dry_run_decision.proceed_to_ag37c_audit_log_dry_run !== true) fail("AG37C readiness missing.");

for (const flag of [
  "actual_queue_state_changed",
  "real_publish_executed",
  "public_article_mutated",
  "database_write_done",
  "audit_log_write_done",
  "rollback_write_done",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "service_role_key_recorded",
  "service_role_key_exposed"
]) {
  if (pkgRecord.dry_run_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (beforeAfter.dry_run_only !== true) fail("Before/after model must be dry-run only.");
if (beforeAfter.actual_after_state_written !== null) fail("Actual after state must not be written.");

if (transition.dry_run_only !== true) fail("Transition must be dry-run only.");
if (transition.actual_effects_executed.length !== 0) fail("No actual effects should execute.");

if (guard.all_state_guard_checks_passed !== true) fail("State guard checks must pass.");
for (const item of guard.guard_checks) {
  if (item.passed !== true) fail(`State guard check failed: ${item.check_id}`);
}

if (nonMutation.audit_passed !== true) fail("Non-mutation audit must pass.");
for (const check of nonMutation.checks) {
  if (check.passed !== true) fail(`Non-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag37c !== true) fail("AG37C readiness missing.");
if (readiness.next_stage_id !== "AG37C") fail("Next stage must be AG37C.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG37C") fail("Boundary must point to AG37C.");

if (review.summary.ready_for_ag37c !== true) fail("Review AG37C readiness missing.");
if (review.summary.actual_queue_state_changed !== false) fail("Review actual queue change must be false.");
if (review.summary.database_write_done !== false) fail("Review database write must be false.");
if (review.summary.audit_log_write_done !== false) fail("Review audit log write must be false.");
if (review.summary.service_role_key_exposed !== false) fail("Review service-role exposure must be false.");

if (preview.ready_for_ag37c !== 1) fail("Preview AG37C readiness missing.");
if (preview.actual_queue_state_changed !== 0) fail("Preview queue change must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.audit_log_write_done !== 0) fail("Preview audit log write must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag37b"]) fail("Missing generate:ag37b script.");
if (!pkg.scripts?.["validate:ag37b"]) fail("Missing validate:ag37b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag37b")) {
  fail("validate:project must include validate:ag37b.");
}

pass("AG37B Queue State Dry-run is present.");
pass("Queue transition is simulated without mutation.");
pass("State guard evaluation and non-mutation audit are valid.");
pass("AG37C Audit Log Dry-run readiness is valid.");
pass("No queue write, database write, public mutation, deployment, service-role key or real publish is recorded.");
