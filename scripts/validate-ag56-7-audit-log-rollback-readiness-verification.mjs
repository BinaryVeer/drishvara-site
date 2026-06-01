import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG56.7 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json",
  "data/content-intelligence/content-loop/ag56-6-source-consumption-record.json",
  "data/content-intelligence/content-loop/ag56-6-word-preview-smoke-test-record.json",
  "data/content-intelligence/content-loop/ag56-6-panchang-preview-smoke-test-record.json",
  "data/content-intelligence/content-loop/ag56-6-reflection-preview-smoke-test-record.json",
  "data/content-intelligence/content-loop/ag56-6-vedic-preview-smoke-test-record.json",
  "data/content-intelligence/content-loop/ag56-6-preview-module-compatibility-record.json",
  "data/content-intelligence/content-loop/ag56-6-preview-smoke-test-boundary.json",
  "data/content-intelligence/backend-architecture/ag56-6-no-live-generation-api-calculation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-6-no-deployment-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-6-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag56-6-ag56-7-audit-log-rollback-readiness-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-6-to-ag56-7-audit-log-rollback-readiness-verification-boundary.json",

  "data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json",
  "data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json",
  "data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json",
  "data/content-intelligence/content-loop/ag56-3-controlled-publish-test-artifact-record.json",
  "data/content-intelligence/content-loop/ag56-3-public-url-listing-manifest-record.json",
  "data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json",

  "data/content-intelligence/quality-reviews/ag56-7-audit-log-rollback-readiness-verification.json",
  "data/content-intelligence/content-loop/ag56-7-source-consumption-record.json",
  "data/content-intelligence/content-loop/ag56-7-audit-log-requirement-record.json",
  "data/content-intelligence/content-loop/ag56-7-rollback-readiness-record.json",
  "data/content-intelligence/content-loop/ag56-7-before-after-status-record.json",
  "data/content-intelligence/content-loop/ag56-7-ui-content-logic-carry-forward-audit.json",
  "data/content-intelligence/content-loop/ag56-7-unresolved-pre-go-live-register.json",
  "data/content-intelligence/content-loop/ag56-7-audit-log-rollback-readiness-boundary.json",
  "data/content-intelligence/backend-architecture/ag56-7-no-rollback-execution-git-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-7-no-deployment-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-7-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag56-7-ag56-8-version-01-go-live-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-7-to-ag56-8-version-01-go-live-decision-boundary.json",
  "data/quality/ag56-7-audit-log-rollback-readiness-verification.json",
  "data/quality/ag56-7-audit-log-rollback-readiness-verification-preview.json",
  "docs/quality/AG56_7_AUDIT_LOG_ROLLBACK_READINESS_VERIFICATION.md",
  "scripts/generate-ag56-7-audit-log-rollback-readiness-verification.mjs",
  "scripts/validate-ag56-7-audit-log-rollback-readiness-verification.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag56_6Review = readJson("data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json");
const ag56_6Word = readJson("data/content-intelligence/content-loop/ag56-6-word-preview-smoke-test-record.json");
const ag56_6Panchang = readJson("data/content-intelligence/content-loop/ag56-6-panchang-preview-smoke-test-record.json");
const ag56_6Reflection = readJson("data/content-intelligence/content-loop/ag56-6-reflection-preview-smoke-test-record.json");
const ag56_6Vedic = readJson("data/content-intelligence/content-loop/ag56-6-vedic-preview-smoke-test-record.json");
const ag56_6Compatibility = readJson("data/content-intelligence/content-loop/ag56-6-preview-module-compatibility-record.json");
const ag56_6Boundary = readJson("data/content-intelligence/content-loop/ag56-6-preview-smoke-test-boundary.json");
const ag56_6Readiness = readJson("data/content-intelligence/quality-registry/ag56-6-ag56-7-audit-log-rollback-readiness-verification-readiness-record.json");
const ag56_6BoundaryTo7 = readJson("data/content-intelligence/mutation-plans/ag56-6-to-ag56-7-audit-log-rollback-readiness-verification-boundary.json");

if (ag56_6Review.status !== "word_panchang_reflection_vedic_preview_smoke_test_ready_for_ag56_7") fail("AG56.6 status mismatch.");
if (ag56_6Review.summary.ready_for_ag56_7_audit_log_rollback_readiness_verification !== true) fail("AG56.6 must be ready for AG56.7.");
if (ag56_6Word.audit_passed !== true) fail("AG56.6 Word preview must pass.");
if (ag56_6Panchang.audit_passed !== true) fail("AG56.6 Panchang preview must pass.");
if (ag56_6Reflection.audit_passed !== true) fail("AG56.6 Reflection preview must pass.");
if (ag56_6Vedic.audit_passed !== true) fail("AG56.6 Vedic preview must pass.");
if (ag56_6Compatibility.audit_passed !== true) fail("AG56.6 compatibility must pass.");
if (!ag56_6Boundary.boundary_rules.includes("AG56.6 does not make a go-live decision.")) fail("AG56.6 go-live boundary missing.");
if (ag56_6Readiness.ready_for_ag56_7 !== true) fail("AG56.6 readiness must permit AG56.7.");
if (ag56_6BoundaryTo7.next_stage_id !== "AG56.7") fail("AG56.6 boundary must point to AG56.7.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag56-6-no-live-generation-api-calculation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-6-no-deployment-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag56-6-no-backend-auth-rls-database-runtime-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const ag56_5Review = readJson("data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json");
const ag56_4Review = readJson("data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json");
const ag56_3Review = readJson("data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json");
const ag54zReview = readJson("data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json");

if (ag56_5Review.status !== "homepage_module_surface_verification_ready_for_ag56_6") fail("AG56.5 status mismatch.");
if (ag56_4Review.status !== "public_url_listing_verification_ready_for_ag56_5") fail("AG56.4 status mismatch.");
if (ag56_3Review.status !== "controlled_publish_test_ready_for_ag56_4") fail("AG56.3 status mismatch.");
if (ag54zReview.status !== "release_operations_closed_ready_for_ag55a") fail("AG54Z status mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag56-7-audit-log-rollback-readiness-verification.json");
const source = readJson("data/content-intelligence/content-loop/ag56-7-source-consumption-record.json");
const auditLog = readJson("data/content-intelligence/content-loop/ag56-7-audit-log-requirement-record.json");
const rollback = readJson("data/content-intelligence/content-loop/ag56-7-rollback-readiness-record.json");
const beforeAfter = readJson("data/content-intelligence/content-loop/ag56-7-before-after-status-record.json");
const uiAudit = readJson("data/content-intelligence/content-loop/ag56-7-ui-content-logic-carry-forward-audit.json");
const unresolved = readJson("data/content-intelligence/content-loop/ag56-7-unresolved-pre-go-live-register.json");
const verificationBoundary = readJson("data/content-intelligence/content-loop/ag56-7-audit-log-rollback-readiness-boundary.json");
const noRollback = readJson("data/content-intelligence/backend-architecture/ag56-7-no-rollback-execution-git-mutation-audit.json");
const noDeploymentMutation = readJson("data/content-intelligence/backend-architecture/ag56-7-no-deployment-public-mutation-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag56-7-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag56-7-ag56-8-version-01-go-live-decision-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag56-7-to-ag56-8-version-01-go-live-decision-boundary.json");
const preview = readJson("data/quality/ag56-7-audit-log-rollback-readiness-verification-preview.json");
const pkg = readJson("package.json");

if (review.status !== "audit_log_rollback_readiness_verification_ready_for_ag56_8") fail("AG56.7 review status mismatch.");

for (const key of [
  "ag56_7_audit_log_rollback_readiness_verification_recorded",
  "ag56_6_consumed",
  "ag54_release_rollback_context_consumed",
  "ag45_daily_signal_surface_context_consumed",
  "ag46_long_form_production_context_consumed",
  "audit_log_requirement_recorded",
  "rollback_readiness_recorded",
  "before_after_status_recorded",
  "ui_content_logic_carry_forward_audit_recorded",
  "unresolved_pre_go_live_register_recorded",
  "ready_for_ag56_8_version_01_go_live_decision"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.daily_signal_default_count !== 10) fail("Daily signal default count must be 10.");
if (review.summary.daily_signal_india_count !== 6) fail("Daily signal India count must be 6.");
if (review.summary.daily_signal_international_count !== 4) fail("Daily signal International count must be 4.");
if (review.summary.homepage_doctrine !== "Discover → Read → Reflect") fail("Homepage doctrine mismatch.");

if (source.status !== "source_consumption_recorded") fail("Source consumption mismatch.");
if (source.consumed_governed_context.ag45_daily_signal_surface_and_first_light_context.length <= 0) fail("AG45 context must be consumed.");
if (source.consumed_governed_context.ag46_long_form_production_strengthening_context.length <= 0) fail("AG46 context must be consumed.");
if (source.consumed_governed_context.ag54_release_rollback_context.length <= 0) fail("AG54 context must be consumed.");

if (auditLog.audit_passed !== true) fail("Audit-log requirement must pass.");
if (auditLog.runtime_audit_log_enabled_now !== false) fail("Runtime audit logging must remain disabled.");
if (auditLog.runtime_logging_job_enabled_now !== false) fail("Runtime logging job must remain disabled.");
for (const field of ["stage_id", "candidate_id", "publish_test_id", "before_status", "after_status", "rollback_reference"]) {
  if (!auditLog.required_audit_fields.includes(field)) fail(`Required audit field missing: ${field}`);
}

if (rollback.audit_passed !== true) fail("Rollback readiness must pass.");
if (rollback.rollback_execution_allowed_now !== false) fail("Rollback execution must not be allowed now.");
if (rollback.git_revert_executed_now !== false) fail("Git revert must not execute.");
if (rollback.git_reset_executed_now !== false) fail("Git reset must not execute.");
if (rollback.rollback_reference.ag56_6_commit !== "ebd132f") fail("Rollback reference must include AG56.6 commit.");

if (beforeAfter.audit_passed !== true) fail("Before/after status must pass.");
if (beforeAfter.before_status.public_article_live !== false) fail("Before public article must be false.");
if (beforeAfter.after_status.public_article_live !== false) fail("After public article must remain false.");
if (beforeAfter.after_status.rollback_readiness_recorded !== true) fail("After rollback readiness must be recorded.");
if (beforeAfter.status_position !== "readiness_verification_only_no_mutation") fail("Before/after position mismatch.");

if (uiAudit.audit_passed !== true) fail("UI/content logic carry-forward audit must pass.");
if (uiAudit.consumed_logic.ag45_daily_signal_surface.expected_daily_signal_count !== 10) fail("AG45 daily signal count must be 10.");
if (uiAudit.consumed_logic.ag45_daily_signal_surface.expected_india_signal_count !== 6) fail("AG45 India signal count must be 6.");
if (uiAudit.consumed_logic.ag45_daily_signal_surface.expected_international_signal_count !== 4) fail("AG45 International signal count must be 4.");
if (!uiAudit.consumed_logic.ag45_daily_signal_surface.expected_homepage_movement.includes("Discover")) fail("Discover movement missing.");
if (!uiAudit.consumed_logic.ag45_daily_signal_surface.expected_homepage_movement.includes("Read")) fail("Read movement missing.");
if (!uiAudit.consumed_logic.ag45_daily_signal_surface.expected_homepage_movement.includes("Reflect")) fail("Reflect movement missing.");
if (!JSON.stringify(uiAudit.visible_ui_observations_to_carry_forward).includes("public_copy_internal_ui_step_3_integration")) fail("UI Step 3 public-copy issue must be carried forward.");
if (!JSON.stringify(uiAudit.visible_ui_observations_to_carry_forward).includes("sports_desk_loading_placeholders")) fail("Sports Desk loading issue must be carried forward.");
if (!JSON.stringify(uiAudit.visible_ui_observations_to_carry_forward).includes("daily_signal_selection_rule_visibility")) fail("Daily signal rule issue must be carried forward.");
if (!JSON.stringify(uiAudit.visible_ui_observations_to_carry_forward).includes("word_panchang_reflection_vedic_safety")) fail("Word/Panchang/Vedic safety item must be carried forward.");

if (unresolved.audit_passed !== true) fail("Unresolved pre-go-live register must pass.");
if (unresolved.open_watch_item_count !== 5) fail("Open watch item count must be 5.");
if (unresolved.hard_blocker_count_for_ag56_8_decision_record !== 0) fail("AG56.8 decision record hard blockers must be zero.");
if (!unresolved.decision_rule.includes("GO, CONDITIONAL_GO, or DEFER")) fail("Decision rule must include GO/CONDITIONAL_GO/DEFER.");

for (const rule of [
  "AG56.7 verifies audit-log and rollback readiness records only.",
  "AG56.7 records AG45/AG46 UI and content-logic carry-forward issues.",
  "AG56.7 does not execute rollback.",
  "AG56.7 does not execute git revert, git reset or branch mutation.",
  "AG56.7 does not deploy or trigger Vercel/GitHub release.",
  "AG56.7 does not make a go-live decision."
]) {
  if (!verificationBoundary.boundary_rules.includes(rule)) fail(`Verification boundary missing: ${rule}`);
}

for (const audit of [noRollback, noDeploymentMutation, noBackend]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag56_8_version_01_go_live_decision") fail("AG56.8 readiness status mismatch.");
if (readiness.ready_for_ag56_8 !== true) fail("AG56.8 readiness must be true.");
if (readiness.next_stage_id !== "AG56.8") fail("Readiness must point to AG56.8.");
if (readiness.open_watch_item_count_for_ag56_8 !== 5) fail("AG56.8 open watch count must be 5.");
if (boundary.next_stage_id !== "AG56.8") fail("Boundary must point to AG56.8.");

for (const allowed of [
  "Consume AG45 daily signal rule: 10 signals by default, 6 India and 4 International.",
  "Consume AG45 Discover → Read → Reflect homepage doctrine.",
  "Consume AG46 long-form production strengthening and reference/image-credit posture."
]) {
  if (!readiness.ag56_8_allowed_scope.includes(allowed)) fail(`AG56.8 allowed scope missing: ${allowed}`);
}

for (const key of [
  "actual_rollback_executed",
  "git_revert_executed",
  "git_reset_executed",
  "git_branch_mutated",
  "runtime_audit_log_enabled",
  "runtime_logging_job_enabled",
  "runtime_rollback_handler_enabled",
  "deployment_approved",
  "deployment_performed",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "github_release_created",
  "live_public_check_executed",
  "browser_automation_enabled",
  "external_audit_api_enabled",
  "public_page_mutation_enabled",
  "public_content_mutation_enabled",
  "content_publishing_enabled",
  "homepage_live_updated",
  "live_listing_updated",
  "public_url_live",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "runtime_publish_queue_enabled",
  "runtime_cms_enabled",
  "public_dashboard_exposed",
  "automated_external_fetch_enabled",
  "ag56_8_go_live_decision_made",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag56-7"]) fail("Missing package script: generate:ag56-7");
if (!pkg.scripts?.["validate:ag56-7"]) fail("Missing package script: validate:ag56-7");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag56-7")) fail("validate:project must include validate:ag56-7.");

pass("AG56.7 Audit-log and Rollback Readiness Verification is present.");
pass("AG56.6 preview smoke-test outputs are consumed.");
pass("AG54 release/rollback context is consumed.");
pass("AG45 daily signal and homepage doctrine are carried forward.");
pass("AG46 long-form production strengthening is carried forward.");
pass("Audit-log requirement record is valid.");
pass("Rollback readiness record is valid without executing rollback.");
pass("Before/after status record is valid.");
pass("UI/content logic carry-forward audit is valid.");
pass("Unresolved pre-go-live register is valid.");
pass("No rollback execution/git mutation audit is valid.");
pass("No deployment/public mutation audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG56.8 Version 01 go-live decision readiness is valid.");
