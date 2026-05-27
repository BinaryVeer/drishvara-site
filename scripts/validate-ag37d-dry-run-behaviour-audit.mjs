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
  console.error(`❌ AG37D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag37a-dynamic-publish-dry-run-package.json",
  "data/content-intelligence/backend-architecture/ag37b-queue-state-dry-run-package.json",
  "data/content-intelligence/backend-architecture/ag37c-audit-log-dry-run-package.json",
  "data/content-intelligence/quality-registry/ag37c-dry-run-behaviour-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag37c-to-ag37d-dry-run-behaviour-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag37d-dry-run-behaviour-audit.json",
  "data/content-intelligence/backend-architecture/ag37d-dry-run-behaviour-audit.json",
  "data/content-intelligence/backend-architecture/ag37d-dry-run-chain-audit-register.json",
  "data/content-intelligence/backend-architecture/ag37d-mutation-block-continuity-audit-register.json",
  "data/content-intelligence/backend-architecture/ag37d-guard-continuity-audit-register.json",
  "data/content-intelligence/backend-architecture/ag37d-artifact-shape-continuity-audit-register.json",
  "data/content-intelligence/quality-registry/ag37d-dry-run-behaviour-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag37d-dynamic-publish-dry-run-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag37d-to-ag37z-dynamic-publish-dry-run-closure-boundary.json",
  "data/quality/ag37d-dry-run-behaviour-audit.json",
  "data/quality/ag37d-dry-run-behaviour-audit-preview.json",
  "docs/quality/AG37D_DRY_RUN_BEHAVIOUR_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag37a = readJson("data/content-intelligence/backend-architecture/ag37a-dynamic-publish-dry-run-package.json");
const ag37b = readJson("data/content-intelligence/backend-architecture/ag37b-queue-state-dry-run-package.json");
const ag37c = readJson("data/content-intelligence/backend-architecture/ag37c-audit-log-dry-run-package.json");
const ag37cReadiness = readJson("data/content-intelligence/quality-registry/ag37c-dry-run-behaviour-audit-readiness-record.json");
const ag37cBoundary = readJson("data/content-intelligence/mutation-plans/ag37c-to-ag37d-dry-run-behaviour-audit-boundary.json");

const audit = readJson("data/content-intelligence/backend-architecture/ag37d-dry-run-behaviour-audit.json");
const chainAudit = readJson("data/content-intelligence/backend-architecture/ag37d-dry-run-chain-audit-register.json");
const mutationAudit = readJson("data/content-intelligence/backend-architecture/ag37d-mutation-block-continuity-audit-register.json");
const guardAudit = readJson("data/content-intelligence/backend-architecture/ag37d-guard-continuity-audit-register.json");
const artifactAudit = readJson("data/content-intelligence/backend-architecture/ag37d-artifact-shape-continuity-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag37d-dynamic-publish-dry-run-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag37d-to-ag37z-dynamic-publish-dry-run-closure-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag37d-dry-run-behaviour-audit.json");
const preview = readJson("data/quality/ag37d-dry-run-behaviour-audit-preview.json");
const pkg = readJson("package.json");

if (ag37a.status !== "dynamic_publish_dry_run_created_ready_for_ag37b") fail("AG37A source mismatch.");
if (ag37b.status !== "queue_state_dry_run_created_ready_for_ag37c") fail("AG37B source mismatch.");
if (ag37c.status !== "audit_log_dry_run_created_ready_for_ag37d") fail("AG37C source mismatch.");
if (ag37cReadiness.ready_for_ag37d !== true) fail("AG37C readiness must allow AG37D.");
if (ag37cBoundary.next_stage_id !== "AG37D") fail("AG37C boundary must point to AG37D.");

if (chainAudit.all_chain_items_passed !== true) fail("Chain audit must pass.");
if (chainAudit.chain_length !== 3) fail("AG37 dry-run chain length must be 3.");
for (const stage of ["AG37A", "AG37B", "AG37C"]) {
  if (!chainAudit.audited_chain.some((item) => item.stage_id === stage)) fail(`Missing audited stage ${stage}.`);
}

for (const item of [mutationAudit, guardAudit, artifactAudit]) {
  if (item.audit_passed !== true) fail(`${item.title} must pass.`);
  for (const check of item.checks) {
    if (check.passed !== true) fail(`${item.title} check failed: ${check.check_id}`);
  }
}

if (audit.status !== "dry_run_behaviour_audit_created_ready_for_ag37z") fail("Audit status mismatch.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag37z_dynamic_publish_dry_run_closure !== true) fail("AG37Z readiness missing.");

for (const flag of [
  "real_publish_executed",
  "actual_queue_state_changed",
  "audit_log_write_done",
  "rollback_write_done",
  "database_write_done",
  "public_article_mutated",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "service_role_key_recorded",
  "service_role_key_exposed"
]) {
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (readiness.ready_for_ag37z !== true) fail("AG37Z readiness missing.");
if (readiness.next_stage_id !== "AG37Z") fail("Next stage must be AG37Z.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit log write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG37Z") fail("Boundary must point to AG37Z.");
if (review.summary.ready_for_ag37z !== true) fail("Review AG37Z readiness missing.");
if (preview.ready_for_ag37z !== 1) fail("Preview AG37Z readiness missing.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.audit_log_write_done !== 0) fail("Preview audit write must be 0.");
if (preview.rollback_write_done !== 0) fail("Preview rollback write must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag37d"]) fail("Missing generate:ag37d script.");
if (!pkg.scripts?.["validate:ag37d"]) fail("Missing validate:ag37d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag37d")) {
  fail("validate:project must include validate:ag37d.");
}

pass("AG37D Dry-run Behaviour Audit is present.");
pass("AG37A-AG37C dry-run chain audit is valid.");
pass("Mutation-block, guard-continuity and artifact-shape audits are valid.");
pass("AG37Z Dynamic Publish Dry-run Closure readiness is valid.");
pass("No real publish, queue write, audit write, rollback write, database write, public mutation, deployment or service-role key is recorded.");
