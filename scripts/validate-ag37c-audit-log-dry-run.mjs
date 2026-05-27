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
  console.error(`❌ AG37C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag37b-queue-state-dry-run-package.json",
  "data/content-intelligence/backend-architecture/ag37b-queue-state-before-after-model.json",
  "data/content-intelligence/backend-architecture/ag37b-queue-transition-dry-run-simulation.json",
  "data/content-intelligence/backend-architecture/ag37b-state-guard-evaluation-record.json",
  "data/content-intelligence/backend-architecture/ag37b-non-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag37b-audit-log-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag37b-to-ag37c-audit-log-dry-run-boundary.json",

  "data/content-intelligence/quality-reviews/ag37c-audit-log-dry-run.json",
  "data/content-intelligence/backend-architecture/ag37c-audit-log-dry-run-package.json",
  "data/content-intelligence/backend-architecture/ag37c-audit-event-shape-dry-run.json",
  "data/content-intelligence/backend-architecture/ag37c-rollback-reference-shape-dry-run.json",
  "data/content-intelligence/backend-architecture/ag37c-before-after-hash-preview-record.json",
  "data/content-intelligence/backend-architecture/ag37c-audit-write-guard-evaluation-record.json",
  "data/content-intelligence/backend-architecture/ag37c-non-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag37c-audit-log-dry-run-blocker-register.json",
  "data/content-intelligence/quality-registry/ag37c-dry-run-behaviour-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag37c-to-ag37d-dry-run-behaviour-audit-boundary.json",
  "data/quality/ag37c-audit-log-dry-run.json",
  "data/quality/ag37c-audit-log-dry-run-preview.json",
  "docs/quality/AG37C_AUDIT_LOG_DRY_RUN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag37b = readJson("data/content-intelligence/backend-architecture/ag37b-queue-state-dry-run-package.json");
const ag37bReadiness = readJson("data/content-intelligence/quality-registry/ag37b-audit-log-dry-run-readiness-record.json");
const ag37bBoundary = readJson("data/content-intelligence/mutation-plans/ag37b-to-ag37c-audit-log-dry-run-boundary.json");
const ag37bNonMutation = readJson("data/content-intelligence/backend-architecture/ag37b-non-mutation-audit-register.json");

const pkgRecord = readJson("data/content-intelligence/backend-architecture/ag37c-audit-log-dry-run-package.json");
const auditEvent = readJson("data/content-intelligence/backend-architecture/ag37c-audit-event-shape-dry-run.json");
const rollback = readJson("data/content-intelligence/backend-architecture/ag37c-rollback-reference-shape-dry-run.json");
const hashPreview = readJson("data/content-intelligence/backend-architecture/ag37c-before-after-hash-preview-record.json");
const guard = readJson("data/content-intelligence/backend-architecture/ag37c-audit-write-guard-evaluation-record.json");
const nonMutation = readJson("data/content-intelligence/backend-architecture/ag37c-non-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag37c-dry-run-behaviour-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag37c-to-ag37d-dry-run-behaviour-audit-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag37c-audit-log-dry-run.json");
const preview = readJson("data/quality/ag37c-audit-log-dry-run-preview.json");
const pkg = readJson("package.json");

if (ag37b.status !== "queue_state_dry_run_created_ready_for_ag37c") fail("AG37B source mismatch.");
if (ag37bReadiness.ready_for_ag37c !== true) fail("AG37B readiness must allow AG37C.");
if (ag37bBoundary.next_stage_id !== "AG37C") fail("AG37B boundary must point to AG37C.");
if (ag37bNonMutation.audit_passed !== true) fail("AG37B non-mutation audit must pass.");

if (pkgRecord.status !== "audit_log_dry_run_created_ready_for_ag37d") fail("Package status mismatch.");
if (pkgRecord.dry_run_decision.audit_log_dry_run_created !== true) fail("Audit dry-run created missing.");
if (pkgRecord.dry_run_decision.audit_event_shape_created !== true) fail("Audit event shape missing.");
if (pkgRecord.dry_run_decision.rollback_reference_shape_created !== true) fail("Rollback shape missing.");
if (pkgRecord.dry_run_decision.proceed_to_ag37d_dry_run_behaviour_audit !== true) fail("AG37D readiness missing.");

for (const flag of [
  "audit_log_write_done",
  "rollback_write_done",
  "actual_queue_state_changed",
  "real_publish_executed",
  "public_article_mutated",
  "database_write_done",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "service_role_key_recorded",
  "service_role_key_exposed"
]) {
  if (pkgRecord.dry_run_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (auditEvent.dry_run_only !== true) fail("Audit event must be dry-run only.");
if (auditEvent.actual_audit_log_written !== false) fail("Audit log must not be written.");
if (rollback.dry_run_only !== true) fail("Rollback must be dry-run only.");
if (rollback.actual_rollback_ref_written !== false) fail("Rollback reference must not be written.");
if (hashPreview.dry_run_only !== true) fail("Hash preview must be dry-run only.");
if (hashPreview.hash_preview.hash_persisted !== false) fail("Hash must not be persisted.");

if (guard.all_audit_guard_checks_passed !== true) fail("Audit guard checks must pass.");
for (const item of guard.guard_checks) {
  if (item.passed !== true) fail(`Audit guard check failed: ${item.check_id}`);
}

if (nonMutation.audit_passed !== true) fail("Non-mutation audit must pass.");
for (const check of nonMutation.checks) {
  if (check.passed !== true) fail(`Non-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag37d !== true) fail("AG37D readiness missing.");
if (readiness.next_stage_id !== "AG37D") fail("Next stage must be AG37D.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit log write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG37D") fail("Boundary must point to AG37D.");

if (review.summary.ready_for_ag37d !== true) fail("Review AG37D readiness missing.");
if (review.summary.audit_log_write_done !== false) fail("Review audit write must be false.");
if (review.summary.rollback_write_done !== false) fail("Review rollback write must be false.");
if (review.summary.database_write_done !== false) fail("Review database write must be false.");
if (review.summary.service_role_key_exposed !== false) fail("Review service-role exposure must be false.");

if (preview.ready_for_ag37d !== 1) fail("Preview AG37D readiness missing.");
if (preview.audit_log_write_done !== 0) fail("Preview audit write must be 0.");
if (preview.rollback_write_done !== 0) fail("Preview rollback write must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag37c"]) fail("Missing generate:ag37c script.");
if (!pkg.scripts?.["validate:ag37c"]) fail("Missing validate:ag37c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag37c")) {
  fail("validate:project must include validate:ag37c.");
}

pass("AG37C Audit Log Dry-run is present.");
pass("Audit event, rollback reference and hash previews are simulated without writes.");
pass("Audit guard evaluation and non-mutation audit are valid.");
pass("AG37D Dry-run Behaviour Audit readiness is valid.");
pass("No audit write, rollback write, database write, public mutation, deployment or service-role key is recorded.");
