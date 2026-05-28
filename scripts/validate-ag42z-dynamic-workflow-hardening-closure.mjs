import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG42Z validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag42a-roadmap-reconciliation-existing-logic-gate.json",
  "data/content-intelligence/backend-architecture/ag42a-existing-logic-consumption-register.json",
  "data/content-intelligence/backend-architecture/ag42a-ag41z-boundary-supersession-record.json",
  "data/content-intelligence/backend-architecture/ag42a-no-duplicate-audit-rulebook.json",
  "data/content-intelligence/backend-architecture/ag42b-workflow-defect-review.json",
  "data/content-intelligence/backend-architecture/ag42b-no-mutation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag42c-failed-publish-rollback-dry-run.json",
  "data/content-intelligence/backend-architecture/ag42c-no-mutation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag42d-permission-audit-stress-review.json",
  "data/content-intelligence/backend-architecture/ag42d-role-boundary-exception-register.json",
  "data/content-intelligence/backend-architecture/ag42d-ag42z-closure-readiness-checklist.json",
  "data/content-intelligence/backend-architecture/ag42d-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag42d-dynamic-workflow-hardening-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag42d-to-ag42z-dynamic-workflow-hardening-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag42z-dynamic-workflow-hardening-closure.json",
  "data/content-intelligence/backend-architecture/ag42z-dynamic-workflow-hardening-closure.json",
  "data/content-intelligence/backend-architecture/ag42z-ag42-hardening-chain-register.json",
  "data/content-intelligence/backend-architecture/ag42z-hardening-summary-record.json",
  "data/content-intelligence/backend-architecture/ag42z-carry-forward-exception-register.json",
  "data/content-intelligence/backend-architecture/ag42z-ag43-entry-consumption-plan.json",
  "data/content-intelligence/backend-architecture/ag42z-no-mutation-continuity-audit-register.json",
  "data/content-intelligence/quality-registry/ag42z-dynamic-workflow-hardening-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag42z-article-intelligence-integration-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag42z-to-ag43a-article-intelligence-integration-boundary.json",
  "data/quality/ag42z-dynamic-workflow-hardening-closure.json",
  "data/quality/ag42z-dynamic-workflow-hardening-closure-preview.json",
  "docs/quality/AG42Z_DYNAMIC_WORKFLOW_HARDENING_CLOSURE.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag42a = readJson("data/content-intelligence/backend-architecture/ag42a-roadmap-reconciliation-existing-logic-gate.json");
const ag42aSupersession = readJson("data/content-intelligence/backend-architecture/ag42a-ag41z-boundary-supersession-record.json");
const ag42b = readJson("data/content-intelligence/backend-architecture/ag42b-workflow-defect-review.json");
const ag42bNoMutation = readJson("data/content-intelligence/backend-architecture/ag42b-no-mutation-audit-register.json");
const ag42c = readJson("data/content-intelligence/backend-architecture/ag42c-failed-publish-rollback-dry-run.json");
const ag42cNoMutation = readJson("data/content-intelligence/backend-architecture/ag42c-no-mutation-audit-register.json");
const ag42d = readJson("data/content-intelligence/backend-architecture/ag42d-permission-audit-stress-review.json");
const ag42dExceptions = readJson("data/content-intelligence/backend-architecture/ag42d-role-boundary-exception-register.json");
const ag42dChecklist = readJson("data/content-intelligence/backend-architecture/ag42d-ag42z-closure-readiness-checklist.json");
const ag42dNoMutation = readJson("data/content-intelligence/backend-architecture/ag42d-no-mutation-audit-register.json");
const ag42dReadiness = readJson("data/content-intelligence/quality-registry/ag42d-dynamic-workflow-hardening-closure-readiness-record.json");
const ag42dBoundary = readJson("data/content-intelligence/mutation-plans/ag42d-to-ag42z-dynamic-workflow-hardening-closure-boundary.json");

const closure = readJson("data/content-intelligence/backend-architecture/ag42z-dynamic-workflow-hardening-closure.json");
const chain = readJson("data/content-intelligence/backend-architecture/ag42z-ag42-hardening-chain-register.json");
const summary = readJson("data/content-intelligence/backend-architecture/ag42z-hardening-summary-record.json");
const carry = readJson("data/content-intelligence/backend-architecture/ag42z-carry-forward-exception-register.json");
const ag43Plan = readJson("data/content-intelligence/backend-architecture/ag42z-ag43-entry-consumption-plan.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag42z-no-mutation-continuity-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag42z-article-intelligence-integration-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag42z-to-ag43a-article-intelligence-integration-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag42z-dynamic-workflow-hardening-closure.json");
const preview = readJson("data/quality/ag42z-dynamic-workflow-hardening-closure-preview.json");
const pkg = readJson("package.json");

if (ag42a.status !== "roadmap_reconciliation_existing_logic_gate_created_ready_for_ag42b") fail("AG42A source mismatch.");
if (ag42aSupersession.supersession_decision.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("AG42A AG56 deferral missing.");
if (ag42b.status !== "workflow_defect_review_created_ready_for_ag42c_failed_publish_rollback_dry_run") fail("AG42B source mismatch.");
if (ag42bNoMutation.audit_passed !== true) fail("AG42B no-mutation audit must pass.");
if (ag42c.status !== "failed_publish_rollback_dry_run_created_ready_for_ag42d_permission_audit_stress_review") fail("AG42C source mismatch.");
if (ag42cNoMutation.audit_passed !== true) fail("AG42C no-mutation audit must pass.");
if (ag42d.status !== "permission_audit_stress_review_created_ready_for_ag42z_dynamic_workflow_hardening_closure") fail("AG42D source mismatch.");
if (ag42dExceptions.hard_blocker_count_for_ag42z !== 0) fail("AG42D hard blockers for AG42Z must be 0.");
if (ag42dChecklist.ready_for_ag42z !== true) fail("AG42D closure checklist must be ready.");
if (ag42dNoMutation.audit_passed !== true) fail("AG42D no-mutation audit must pass.");
if (ag42dReadiness.ready_for_ag42z !== true) fail("AG42D readiness must allow AG42Z.");
if (ag42dBoundary.next_stage_id !== "AG42Z") fail("AG42D boundary must point to AG42Z.");

if (closure.status !== "dynamic_workflow_hardening_closure_created_ready_for_ag43a_article_intelligence_integration") fail("Closure status mismatch.");
if (closure.closure_decision.ag42_hardening_chain_closed !== true) fail("AG42 chain closure missing.");
if (closure.closure_decision.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("AG56 deferral missing.");
if (closure.closure_decision.proceed_to_ag43a_article_intelligence_integration !== true) fail("AG43A readiness missing.");

for (const flag of [
  "first_controlled_batch_execution_approved_now",
  "first_controlled_batch_executed",
  "batch_execution_authorized_now",
  "batch_publish_executed",
  "candidate_selected_for_execution",
  "real_publish_executed",
  "database_write_done",
  "audit_log_write_done",
  "rollback_write_done",
  "public_article_mutated",
  "listing_mutated",
  "article_file_created_or_changed",
  "route_guard_runtime_modified",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "backend_activation_approved_now",
  "supabase_activation_approved_now",
  "auth_activation_approved_now",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "anon_access_granted",
  "sql_file_created",
  "sql_grants_executed"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (chain.chain_length !== 4) fail("AG42 chain length must be 4.");
for (const stage of ["AG42A", "AG42B", "AG42C", "AG42D"]) {
  if (!chain.closed_chain.some((item) => item.stage_id === stage && item.passed === true)) {
    fail(`Closed chain missing passed stage ${stage}`);
  }
}
if (chain.closed_successfully !== true) fail("AG42 chain must close successfully.");

for (const [key, value] of Object.entries(summary.summary)) {
  if (value !== true) fail(`Summary field must be true: ${key}`);
}

if (carry.hard_blocker_count_for_ag43a !== 0) fail("Carry-forward hard blocker count for AG43A must be 0.");
if (!carry.carry_forward_items.some((item) => item.item_id === "ag42z_cf05")) fail("AG56 deferral carry-forward missing.");

if (ag43Plan.next_stage_id !== "AG43A") fail("AG43 entry plan must point to AG43A.");
if (!ag43Plan.existing_logic_to_consume_next.includes("AG06B Content Intelligence Schema")) fail("AG06B consumption missing.");
if (!ag43Plan.existing_logic_to_consume_next.includes("AG23G First Light Topic Scoring")) fail("AG23G consumption missing.");
if (!ag43Plan.blocked_for_ag43a.includes("No article generation.")) fail("AG43A no article generation blocker missing.");

if (noMutation.audit_passed !== true) fail("No-mutation continuity audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag43a !== true) fail("AG43A readiness missing.");
if (readiness.next_stage_id !== "AG43A") fail("Next stage must be AG43A.");
if (readiness.hard_blocker_count_for_ag43a !== 0) fail("Readiness hard blocker count must be 0.");
if (readiness.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("AG56 deferral must remain.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG43A") fail("Boundary must point to AG43A.");
if (review.summary.ready_for_ag43a !== true) fail("Review AG43A readiness missing.");
if (review.summary.hard_blocker_count_for_ag43a !== 0) fail("Review hard blocker count must be 0.");
if (preview.ready_for_ag43a !== 1) fail("Preview AG43A readiness missing.");
if (preview.first_controlled_dynamic_content_loop_deferred_to_ag56 !== 1) fail("Preview AG56 deferral missing.");
if (preview.first_controlled_batch_executed !== 0) fail("Preview first batch execution must be 0.");
if (preview.candidate_selected_for_execution !== 0) fail("Preview candidate selection must be 0.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.public_article_mutated !== 0) fail("Preview public article mutation must be 0.");
if (preview.listing_mutated !== 0) fail("Preview listing mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.audit_log_write_done !== 0) fail("Preview audit-log write must be 0.");
if (preview.rollback_write_done !== 0) fail("Preview rollback write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.backend_activation_approved_now !== 0) fail("Preview backend activation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag42z"]) fail("Missing generate:ag42z script.");
if (!pkg.scripts?.["validate:ag42z"]) fail("Missing validate:ag42z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag42z")) fail("validate:project must include validate:ag42z.");

pass("AG42Z Dynamic Workflow Hardening Closure is present.");
pass("AG42A-AG42D hardening chain is closed.");
pass("Carry-forward exception register and AG43A entry consumption plan are valid.");
pass("No-mutation continuity audit is valid.");
pass("AG43A Article Intelligence Integration readiness is valid.");
pass("No publish, public mutation, database write, deployment, SQL grant execution or service-role key is recorded.");
