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
  console.error(`❌ AG37Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag37a-dynamic-publish-dry-run-package.json",
  "data/content-intelligence/backend-architecture/ag37b-queue-state-dry-run-package.json",
  "data/content-intelligence/backend-architecture/ag37c-audit-log-dry-run-package.json",
  "data/content-intelligence/backend-architecture/ag37d-dry-run-behaviour-audit.json",
  "data/content-intelligence/quality-registry/ag37d-dynamic-publish-dry-run-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag37d-to-ag37z-dynamic-publish-dry-run-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag37z-dynamic-publish-dry-run-closure.json",
  "data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-closure.json",
  "data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-chain-register.json",
  "data/content-intelligence/backend-architecture/ag37z-dry-run-capability-record.json",
  "data/content-intelligence/backend-architecture/ag37z-post-dry-run-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag37z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag37z-dynamic-publish-dry-run-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag37z-controlled-apply-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag37z-to-ag38a-controlled-apply-decision-boundary.json",
  "data/quality/ag37z-dynamic-publish-dry-run-closure.json",
  "data/quality/ag37z-dynamic-publish-dry-run-closure-preview.json",
  "docs/quality/AG37Z_DYNAMIC_PUBLISH_DRY_RUN_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag37a = readJson("data/content-intelligence/backend-architecture/ag37a-dynamic-publish-dry-run-package.json");
const ag37b = readJson("data/content-intelligence/backend-architecture/ag37b-queue-state-dry-run-package.json");
const ag37c = readJson("data/content-intelligence/backend-architecture/ag37c-audit-log-dry-run-package.json");
const ag37d = readJson("data/content-intelligence/backend-architecture/ag37d-dry-run-behaviour-audit.json");
const ag37dReadiness = readJson("data/content-intelligence/quality-registry/ag37d-dynamic-publish-dry-run-closure-readiness-record.json");
const ag37dBoundary = readJson("data/content-intelligence/mutation-plans/ag37d-to-ag37z-dynamic-publish-dry-run-closure-boundary.json");

const closure = readJson("data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-closure.json");
const chain = readJson("data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-chain-register.json");
const capability = readJson("data/content-intelligence/backend-architecture/ag37z-dry-run-capability-record.json");
const carryForward = readJson("data/content-intelligence/backend-architecture/ag37z-post-dry-run-blocker-carry-forward.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag37z-controlled-apply-decision-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag37z-to-ag38a-controlled-apply-decision-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag37z-dynamic-publish-dry-run-closure.json");
const preview = readJson("data/quality/ag37z-dynamic-publish-dry-run-closure-preview.json");
const pkg = readJson("package.json");

if (ag37a.status !== "dynamic_publish_dry_run_created_ready_for_ag37b") fail("AG37A source mismatch.");
if (ag37b.status !== "queue_state_dry_run_created_ready_for_ag37c") fail("AG37B source mismatch.");
if (ag37c.status !== "audit_log_dry_run_created_ready_for_ag37d") fail("AG37C source mismatch.");
if (ag37d.status !== "dry_run_behaviour_audit_created_ready_for_ag37z") fail("AG37D source mismatch.");
if (ag37d.audit_decision.all_audits_passed !== true) fail("AG37D audits must pass.");
if (ag37dReadiness.ready_for_ag37z !== true) fail("AG37D readiness must allow AG37Z.");
if (ag37dBoundary.next_stage_id !== "AG37Z") fail("AG37D boundary must point to AG37Z.");

if (closure.status !== "dynamic_publish_dry_run_closure_created_ready_for_ag38a_decision") fail("Closure status mismatch.");
if (closure.closure_decision.ag37_dry_run_chain_closed !== true) fail("AG37 chain closure missing.");
if (closure.closure_decision.dynamic_publish_dry_run_capability_confirmed !== true) fail("Dry-run capability missing.");
if (closure.closure_decision.dry_run_behaviour_audit_passed !== true) fail("Dry-run audit passed missing.");
if (closure.closure_decision.proceed_to_ag38a_controlled_apply_decision_checkpoint !== true) fail("AG38A readiness missing.");

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
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (chain.chain_length !== 4) fail("AG37 chain length must be 4.");
for (const stage of ["AG37A", "AG37B", "AG37C", "AG37D"]) {
  if (!chain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}
if (chain.closed_successfully !== true) fail("Chain must close successfully.");

for (const [key, value] of Object.entries(capability.confirmed_capabilities)) {
  if (value !== true) fail(`Capability must be true: ${key}`);
}
for (const [key, value] of Object.entries(capability.not_yet_allowed_capabilities)) {
  if (value !== true) fail(`Not-yet-allowed capability marker must be true: ${key}`);
}
for (const [key, value] of Object.entries(carryForward.blocked_items)) {
  if (value !== false) fail(`Carry-forward blocker must remain false: ${key}`);
}

if (readiness.ready_for_ag38a !== true) fail("AG38A readiness missing.");
if (readiness.next_stage_id !== "AG38A") fail("Next stage must be AG38A.");
if (readiness.allowed_ag38a_mode !== "decision_checkpoint_only_no_real_publish_without_explicit_operator_approval") fail("AG38A mode mismatch.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit log write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");
if (readiness.explicit_operator_approval_required_for_any_real_apply !== true) fail("Explicit approval requirement missing.");

if (boundary.next_stage_id !== "AG38A") fail("Boundary must point to AG38A.");
if (review.summary.ready_for_ag38a_decision !== true) fail("Review AG38A readiness missing.");
if (preview.ready_for_ag38a_decision !== 1) fail("Preview AG38A readiness missing.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.audit_log_write_done !== 0) fail("Preview audit write must be 0.");
if (preview.rollback_write_done !== 0) fail("Preview rollback write must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag37z"]) fail("Missing generate:ag37z script.");
if (!pkg.scripts?.["validate:ag37z"]) fail("Missing validate:ag37z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag37z")) {
  fail("validate:project must include validate:ag37z.");
}

pass("AG37Z Dynamic Publish Dry-run Closure is present.");
pass("AG37 dynamic publish dry-run chain is closed.");
pass("Dry-run capability and blocker carry-forward records are valid.");
pass("AG38A Controlled Apply Decision Checkpoint readiness is valid.");
pass("No real publish, queue write, audit write, rollback write, database write, public mutation, deployment or service-role key is recorded.");
