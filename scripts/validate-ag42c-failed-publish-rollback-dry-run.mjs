import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG42C validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag42b-workflow-defect-review.json",
  "data/content-intelligence/backend-architecture/ag42b-workflow-hardening-backlog.json",
  "data/content-intelligence/backend-architecture/ag42b-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag42b-failed-publish-rollback-dry-run-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag42b-to-ag42c-failed-publish-rollback-dry-run-boundary.json",
  "data/content-intelligence/backend-architecture/ag41a-audit-rollback-sop.json",

  "data/content-intelligence/quality-reviews/ag42c-failed-publish-rollback-dry-run.json",
  "data/content-intelligence/backend-architecture/ag42c-failed-publish-rollback-dry-run.json",
  "data/content-intelligence/backend-architecture/ag42c-failed-publish-dry-run-model.json",
  "data/content-intelligence/backend-architecture/ag42c-rollback-dry-run-model.json",
  "data/content-intelligence/backend-architecture/ag42c-public-listing-failure-model.json",
  "data/content-intelligence/backend-architecture/ag42c-recovery-action-checklist.json",
  "data/content-intelligence/backend-architecture/ag42c-failed-publish-rollback-risk-register.json",
  "data/content-intelligence/backend-architecture/ag42c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag42c-failed-publish-rollback-dry-run-blocker-register.json",
  "data/content-intelligence/quality-registry/ag42c-permission-audit-stress-review-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag42c-to-ag42d-permission-audit-stress-review-boundary.json",
  "data/quality/ag42c-failed-publish-rollback-dry-run.json",
  "data/quality/ag42c-failed-publish-rollback-dry-run-preview.json",
  "docs/quality/AG42C_FAILED_PUBLISH_ROLLBACK_DRY_RUN.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag42b = readJson("data/content-intelligence/backend-architecture/ag42b-workflow-defect-review.json");
const ag42bBacklog = readJson("data/content-intelligence/backend-architecture/ag42b-workflow-hardening-backlog.json");
const ag42bNoMutation = readJson("data/content-intelligence/backend-architecture/ag42b-no-mutation-audit-register.json");
const ag42bReadiness = readJson("data/content-intelligence/quality-registry/ag42b-failed-publish-rollback-dry-run-readiness-record.json");
const ag42bBoundary = readJson("data/content-intelligence/mutation-plans/ag42b-to-ag42c-failed-publish-rollback-dry-run-boundary.json");
const ag41aAuditRollback = readJson("data/content-intelligence/backend-architecture/ag41a-audit-rollback-sop.json");

const dryRun = readJson("data/content-intelligence/backend-architecture/ag42c-failed-publish-rollback-dry-run.json");
const failedPublish = readJson("data/content-intelligence/backend-architecture/ag42c-failed-publish-dry-run-model.json");
const rollback = readJson("data/content-intelligence/backend-architecture/ag42c-rollback-dry-run-model.json");
const listing = readJson("data/content-intelligence/backend-architecture/ag42c-public-listing-failure-model.json");
const recovery = readJson("data/content-intelligence/backend-architecture/ag42c-recovery-action-checklist.json");
const risk = readJson("data/content-intelligence/backend-architecture/ag42c-failed-publish-rollback-risk-register.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag42c-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag42c-permission-audit-stress-review-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag42c-to-ag42d-permission-audit-stress-review-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag42c-failed-publish-rollback-dry-run.json");
const preview = readJson("data/quality/ag42c-failed-publish-rollback-dry-run-preview.json");
const pkg = readJson("package.json");

if (ag42b.status !== "workflow_defect_review_created_ready_for_ag42c_failed_publish_rollback_dry_run") fail("AG42B source mismatch.");
if (ag42bNoMutation.audit_passed !== true) fail("AG42B no-mutation audit must pass.");
if (ag42bReadiness.ready_for_ag42c !== true) fail("AG42B readiness must allow AG42C.");
if (ag42bBoundary.next_stage_id !== "AG42C") fail("AG42B boundary must point to AG42C.");
if (!ag42bBacklog.ag42c_candidate_items.includes("ag42b_h01")) fail("AG42B failed publish backlog item missing.");
if (!ag42bBacklog.ag42c_candidate_items.includes("ag42b_h02")) fail("AG42B rollback backlog item missing.");
if (!ag41aAuditRollback.rollback_requirements.includes("verify restored public state after rollback")) fail("Rollback verification requirement missing.");

if (dryRun.status !== "failed_publish_rollback_dry_run_created_ready_for_ag42d_permission_audit_stress_review") fail("Dry-run status mismatch.");
if (dryRun.dry_run_decision.failed_publish_rollback_dry_run_created !== true) fail("Dry-run creation missing.");
if (dryRun.dry_run_decision.proceed_to_ag42d_permission_audit_stress_review !== true) fail("AG42D readiness missing.");

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
  if (dryRun.dry_run_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (failedPublish.status !== "failed_publish_dry_run_model_created_no_publish_executed") fail("Failed publish model status mismatch.");
if (failedPublish.publish_executed_in_ag42c !== false) fail("Publish must not execute.");
if (failedPublish.dry_run_scenarios.length < 4) fail("At least four failed publish scenarios expected.");
for (const scenario of failedPublish.dry_run_scenarios) {
  if (scenario.write_executed_in_ag42c !== false) fail(`Scenario write must be false: ${scenario.scenario_id}`);
}

if (rollback.status !== "rollback_dry_run_model_created_no_rollback_write") fail("Rollback model status mismatch.");
if (rollback.rollback_write_executed_in_ag42c !== false) fail("Rollback write must not execute.");
if (!rollback.rollback_prerequisites.includes("previous article status captured")) fail("Rollback prerequisite missing.");
for (const scenario of rollback.rollback_scenarios) {
  if (scenario.write_executed_in_ag42c !== false) fail(`Rollback scenario write must be false: ${scenario.scenario_id}`);
}

if (listing.status !== "public_listing_failure_model_created_no_listing_mutation") fail("Listing failure model status mismatch.");
if (listing.listing_mutated_in_ag42c !== false) fail("Listing must not mutate.");
if (!listing.listing_surfaces_to_verify_in_future.includes("Featured Reads listing")) fail("Featured Reads listing verification missing.");

if (recovery.status !== "recovery_action_checklist_created") fail("Recovery checklist status mismatch.");
if (recovery.recovery_action_executed_in_ag42c !== false) fail("Recovery action must not execute.");
if (!recovery.minimum_evidence_required_before_future_publish.includes("rollback reference readiness")) fail("Rollback evidence requirement missing.");

if (risk.status !== "failed_publish_rollback_risk_register_created") fail("Risk register status mismatch.");
if (risk.hard_blocker_count_for_ag42d !== 0) fail("Hard blocker count for AG42D must be 0.");
if (!risk.risks.some((item) => item.risk_id === "ag42c_r04")) fail("Rollback reference risk missing.");

if (noMutation.audit_passed !== true) fail("No-mutation audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag42d !== true) fail("AG42D readiness missing.");
if (readiness.next_stage_id !== "AG42D") fail("Next stage must be AG42D.");
if (readiness.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("AG56 deferral must remain.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG42D") fail("Boundary must point to AG42D.");
if (review.summary.ready_for_ag42d !== true) fail("Review AG42D readiness missing.");
if (review.summary.hard_blocker_count_for_ag42d !== 0) fail("Review hard blocker count must be 0.");
if (preview.ready_for_ag42d !== 1) fail("Preview AG42D readiness missing.");
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

if (!pkg.scripts?.["generate:ag42c"]) fail("Missing generate:ag42c script.");
if (!pkg.scripts?.["validate:ag42c"]) fail("Missing validate:ag42c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag42c")) fail("validate:project must include validate:ag42c.");

pass("AG42C Failed Publish and Rollback Dry-run is present.");
pass("Failed publish, rollback, listing failure and recovery models are valid.");
pass("No-mutation audit is valid.");
pass("AG42D Permission and Audit Stress Review readiness is valid.");
pass("No publish, rollback write, public mutation, database write, deployment, SQL grant execution or service-role key is recorded.");
