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
  console.error(`❌ AG37A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json",
  "data/content-intelligence/quality-registry/ag36z-dynamic-publish-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag36z-to-ag37a-dynamic-publish-dry-run-boundary.json",

  "data/content-intelligence/quality-reviews/ag37a-dynamic-publish-dry-run.json",
  "data/content-intelligence/backend-architecture/ag37a-dynamic-publish-dry-run-package.json",
  "data/content-intelligence/backend-architecture/ag37a-admin-publish-action-dry-run-simulation.json",
  "data/content-intelligence/backend-architecture/ag37a-publish-guard-evaluation-record.json",
  "data/content-intelligence/backend-architecture/ag37a-non-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag37a-dynamic-publish-dry-run-blocker-register.json",
  "data/content-intelligence/quality-registry/ag37a-queue-state-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag37a-to-ag37b-queue-state-dry-run-boundary.json",
  "data/quality/ag37a-dynamic-publish-dry-run.json",
  "data/quality/ag37a-dynamic-publish-dry-run-preview.json",
  "docs/quality/AG37A_DYNAMIC_PUBLISH_DRY_RUN.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag36z = readJson("data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json");
const ag36zReadiness = readJson("data/content-intelligence/quality-registry/ag36z-dynamic-publish-dry-run-readiness-record.json");
const ag36zBoundary = readJson("data/content-intelligence/mutation-plans/ag36z-to-ag37a-dynamic-publish-dry-run-boundary.json");

const pkgRecord = readJson("data/content-intelligence/backend-architecture/ag37a-dynamic-publish-dry-run-package.json");
const simulation = readJson("data/content-intelligence/backend-architecture/ag37a-admin-publish-action-dry-run-simulation.json");
const guard = readJson("data/content-intelligence/backend-architecture/ag37a-publish-guard-evaluation-record.json");
const nonMutation = readJson("data/content-intelligence/backend-architecture/ag37a-non-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag37a-queue-state-dry-run-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag37a-to-ag37b-queue-state-dry-run-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag37a-dynamic-publish-dry-run.json");
const preview = readJson("data/quality/ag37a-dynamic-publish-dry-run-preview.json");
const pkg = readJson("package.json");

if (ag36z.status !== "login_live_test_closure_created_ready_for_ag37a") fail("AG36Z source mismatch.");
if (ag36zReadiness.ready_for_ag37a !== true) fail("AG36Z readiness must allow AG37A.");
if (ag36zBoundary.next_stage_id !== "AG37A") fail("AG36Z boundary must point to AG37A.");

if (pkgRecord.status !== "dynamic_publish_dry_run_created_ready_for_ag37b") fail("Package status mismatch.");
if (pkgRecord.dry_run_decision.dynamic_publish_dry_run_created !== true) fail("Dry-run created missing.");
if (pkgRecord.dry_run_decision.admin_publish_action_simulated !== true) fail("Admin publish simulation missing.");
if (pkgRecord.dry_run_decision.proceed_to_ag37b_queue_state_dry_run !== true) fail("AG37B readiness missing.");

for (const flag of [
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

if (simulation.dry_run_only !== true) fail("Simulation must be dry-run only.");
if (simulation.actual_actions_executed.length !== 0) fail("No actual actions should execute.");

if (guard.all_guard_checks_passed_for_dry_run !== true) fail("Guard checks must pass for dry-run.");
for (const item of guard.guard_rules_evaluated) {
  if (item.simulated_result === false) fail(`Guard check failed: ${item.rule_id}`);
}

if (nonMutation.audit_passed !== true) fail("Non-mutation audit must pass.");
for (const check of nonMutation.checks) {
  if (check.passed !== true) fail(`Non-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag37b !== true) fail("AG37B readiness missing.");
if (readiness.next_stage_id !== "AG37B") fail("Next stage must be AG37B.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG37B") fail("Boundary must point to AG37B.");

if (review.summary.ready_for_ag37b !== true) fail("Review AG37B readiness missing.");
if (review.summary.real_publish_executed !== false) fail("Review real publish must be false.");
if (review.summary.public_article_mutated !== false) fail("Review public mutation must be false.");
if (review.summary.database_write_done !== false) fail("Review database write must be false.");
if (review.summary.service_role_key_exposed !== false) fail("Review service-role exposure must be false.");

if (preview.ready_for_ag37b !== 1) fail("Preview AG37B readiness missing.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.public_article_mutated !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag37a"]) fail("Missing generate:ag37a script.");
if (!pkg.scripts?.["validate:ag37a"]) fail("Missing validate:ag37a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag37a")) {
  fail("validate:project must include validate:ag37a.");
}

pass("AG37A Dynamic Publish Dry-run is present.");
pass("Admin publish action is simulated without mutation.");
pass("Publish guard evaluation and non-mutation audit are valid.");
pass("AG37B Queue State Dry-run readiness is valid.");
pass("No database write, public mutation, deployment, service-role key or real publish is recorded.");
