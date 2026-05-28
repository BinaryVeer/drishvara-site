import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG41A validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag40z-dynamic-stabilisation-closure.json",
  "data/content-intelligence/backend-architecture/ag40z-live-smoke-test-chain-register.json",
  "data/content-intelligence/backend-architecture/ag40z-dynamic-publishing-sop-readiness-record.json",
  "data/content-intelligence/quality-registry/ag40z-dynamic-publishing-sop-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag40z-to-ag41a-dynamic-publishing-sop-boundary.json",

  "data/content-intelligence/quality-reviews/ag41a-dynamic-publishing-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-role-gate-model.json",
  "data/content-intelligence/backend-architecture/ag41a-publishing-workflow-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-audit-rollback-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-security-and-grant-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag41a-dynamic-publishing-sop-blocker-register.json",
  "data/content-intelligence/quality-registry/ag41a-batch-dynamic-publishing-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag41a-to-ag41b-batch-dynamic-publishing-plan-boundary.json",
  "data/quality/ag41a-dynamic-publishing-sop.json",
  "data/quality/ag41a-dynamic-publishing-sop-preview.json",
  "docs/quality/AG41A_DYNAMIC_PUBLISHING_SOP.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag40z = readJson("data/content-intelligence/backend-architecture/ag40z-dynamic-stabilisation-closure.json");
const ag40zChain = readJson("data/content-intelligence/backend-architecture/ag40z-live-smoke-test-chain-register.json");
const ag40zSop = readJson("data/content-intelligence/backend-architecture/ag40z-dynamic-publishing-sop-readiness-record.json");
const ag40zReady = readJson("data/content-intelligence/quality-registry/ag40z-dynamic-publishing-sop-readiness-record.json");
const ag40zBoundary = readJson("data/content-intelligence/mutation-plans/ag40z-to-ag41a-dynamic-publishing-sop-boundary.json");

const sop = readJson("data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json");
const roleGate = readJson("data/content-intelligence/backend-architecture/ag41a-role-gate-model.json");
const workflow = readJson("data/content-intelligence/backend-architecture/ag41a-publishing-workflow-sop.json");
const auditRollback = readJson("data/content-intelligence/backend-architecture/ag41a-audit-rollback-sop.json");
const security = readJson("data/content-intelligence/backend-architecture/ag41a-security-and-grant-sop.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag41a-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag41a-batch-dynamic-publishing-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag41a-to-ag41b-batch-dynamic-publishing-plan-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag41a-dynamic-publishing-sop.json");
const preview = readJson("data/quality/ag41a-dynamic-publishing-sop-preview.json");
const packageJson = readJson("package.json");

if (ag40z.status !== "dynamic_stabilisation_closure_created_ready_for_ag41a_sop") fail("AG40Z source mismatch.");
if (ag40zChain.closed_successfully !== true) fail("AG40 chain must be closed.");
if (ag40zSop.ready_for_ag41a !== true) fail("AG40Z SOP readiness missing.");
if (ag40zReady.ready_for_ag41a !== true) fail("AG40Z readiness must allow AG41A.");
if (ag40zBoundary.next_stage_id !== "AG41A") fail("AG40Z boundary must point to AG41A.");

if (sop.status !== "dynamic_publishing_sop_created_ready_for_ag41b_batch_plan") fail("SOP status mismatch.");
if (sop.sop_decision.dynamic_publishing_sop_created !== true) fail("SOP creation missing.");
if (sop.sop_decision.proceed_to_ag41b_batch_dynamic_publishing_plan !== true) fail("AG41B readiness missing.");

for (const flag of [
  "real_publish_executed",
  "database_write_done",
  "audit_log_write_done",
  "rollback_write_done",
  "public_article_mutated",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "anon_access_granted",
  "sql_file_created",
  "sql_grants_executed"
]) {
  if (sop.sop_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (!roleGate.role_model.admin.includes("approve publish only after checklist completion")) fail("Admin gate missing.");
if (!roleGate.role_model.editor.includes("cannot approve publish")) fail("Editor no-publish gate missing.");

if (!workflow.workflow_sequence.some((step) => step.step_id === "05_controlled_publish_execution")) fail("Controlled publish execution SOP step missing.");
for (const step of workflow.workflow_sequence) {
  if (step.mutation_allowed_in_ag41a !== false) fail(`Mutation must be false for workflow step ${step.step_id}`);
}

if (!auditRollback.audit_requirements.includes("record before and after content hash where applicable")) fail("Audit hash requirement missing.");
if (!auditRollback.rollback_requirements.includes("verify restored public state after rollback")) fail("Rollback verification requirement missing.");

if (!security.security_rules.includes("No service-role key in repo, browser, chat, public config or committed files.")) fail("Service-role key rule missing.");
if (!security.security_rules.includes("No anon grants for Admin/Editor workflow tables.")) fail("Anon grant block missing.");

if (noMutation.audit_passed !== true) fail("No-mutation audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag41b !== true) fail("AG41B readiness missing.");
if (readiness.next_stage_id !== "AG41B") fail("Next stage must be AG41B.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG41B") fail("Boundary must point to AG41B.");
if (review.summary.ready_for_ag41b !== true) fail("Review AG41B readiness missing.");
if (preview.ready_for_ag41b !== 1) fail("Preview AG41B readiness missing.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!packageJson.scripts?.["generate:ag41a"]) fail("Missing generate:ag41a script.");
if (!packageJson.scripts?.["validate:ag41a"]) fail("Missing validate:ag41a script.");
if (!packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag41a")) {
  fail("validate:project must include validate:ag41a.");
}

pass("AG41A Dynamic Publishing SOP is present.");
pass("Role gates, publishing workflow, audit/rollback and security SOP are valid.");
pass("No-mutation audit is valid.");
pass("AG41B Batch Dynamic Publishing Plan readiness is valid.");
pass("No public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
