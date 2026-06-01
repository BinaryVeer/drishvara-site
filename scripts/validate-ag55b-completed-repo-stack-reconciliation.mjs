import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG55B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json",
  "data/content-intelligence/release-candidate/ag55a-source-consumption-record.json",
  "data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json",
  "data/content-intelligence/release-candidate/ag55a-v01-included-module-register.json",
  "data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json",
  "data/content-intelligence/release-candidate/ag55a-ag42-to-ag54-completed-stage-digest.json",
  "data/content-intelligence/release-candidate/ag55a-full-repo-inventory-digest.json",
  "data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-boundary.json",
  "data/content-intelligence/backend-architecture/ag55a-no-controlled-dynamic-content-loop-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag55a-no-deployment-publishing-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag55a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag55a-ag55b-completed-repo-stack-reconciliation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag55a-to-ag55b-completed-repo-stack-reconciliation-boundary.json",
  "data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json",
  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag55b-completed-repo-stack-reconciliation.json",
  "data/content-intelligence/release-candidate/ag55b-source-consumption-record.json",
  "data/content-intelligence/release-candidate/ag55b-completed-stream-inventory-record.json",
  "data/content-intelligence/release-candidate/ag55b-dependency-reconciliation-record.json",
  "data/content-intelligence/release-candidate/ag55b-roadmap-conflict-resolution-register.json",
  "data/content-intelligence/release-candidate/ag55b-docs-quality-reconciliation-record.json",
  "data/content-intelligence/release-candidate/ag55b-completed-repo-stack-reconciliation-record.json",
  "data/content-intelligence/release-candidate/ag55b-completed-stack-reconciliation-boundary.json",
  "data/content-intelligence/backend-architecture/ag55b-no-controlled-dynamic-content-loop-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag55b-no-deployment-publishing-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag55b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag55b-ag55c-end-to-end-release-candidate-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag55b-to-ag55c-end-to-end-release-candidate-validation-boundary.json",
  "data/quality/ag55b-completed-repo-stack-reconciliation.json",
  "data/quality/ag55b-completed-repo-stack-reconciliation-preview.json",
  "docs/quality/AG55B_COMPLETED_REPO_STACK_RECONCILIATION.md",
  "scripts/generate-ag55b-completed-repo-stack-reconciliation.mjs",
  "scripts/validate-ag55b-completed-repo-stack-reconciliation.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag55aReview = readJson("data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json");
const ag55aSource = readJson("data/content-intelligence/release-candidate/ag55a-source-consumption-record.json");
const ag55aFreeze = readJson("data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json");
const ag55aIncluded = readJson("data/content-intelligence/release-candidate/ag55a-v01-included-module-register.json");
const ag55aDeferral = readJson("data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json");
const ag55aDigest = readJson("data/content-intelligence/release-candidate/ag55a-ag42-to-ag54-completed-stage-digest.json");
const ag55aRepoInventory = readJson("data/content-intelligence/release-candidate/ag55a-full-repo-inventory-digest.json");
const ag55aScopeBoundary = readJson("data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-boundary.json");
const ag55aReadiness = readJson("data/content-intelligence/quality-registry/ag55a-ag55b-completed-repo-stack-reconciliation-readiness-record.json");
const ag55aBoundary = readJson("data/content-intelligence/mutation-plans/ag55a-to-ag55b-completed-repo-stack-reconciliation-boundary.json");

if (ag55aReview.status !== "v01_scope_freeze_ready_for_ag55b") fail("AG55A status mismatch.");
if (ag55aReview.summary.ready_for_ag55b_completed_repo_stack_reconciliation !== true) fail("AG55A must be ready for AG55B.");
if (ag55aSource.status !== "source_consumption_recorded") fail("AG55A source consumption mismatch.");
if (ag55aFreeze.freeze_scope_status !== "v01_scope_frozen_for_reconciliation") fail("AG55A freeze status mismatch.");
if (ag55aIncluded.included_modules.length !== 13) fail("AG55A included modules must be 13.");
if (!JSON.stringify(ag55aDeferral.deferred_items).includes("controlled dynamic content-loop")) fail("AG55A dynamic-loop deferral missing.");
if (ag55aDigest.all_stage_outputs_present !== true) fail("AG55A stage digest must confirm all outputs.");
if (ag55aRepoInventory.audit_passed !== true) fail("AG55A repo inventory must pass.");
if (!ag55aScopeBoundary.boundary_rules.includes("AG55A does not activate AG56.")) fail("AG55A AG56 boundary missing.");
if (ag55aReadiness.ready_for_ag55b !== true) fail("AG55A readiness must permit AG55B.");
if (ag55aBoundary.next_stage_id !== "AG55B") fail("AG55A boundary must point to AG55B.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag55a-no-controlled-dynamic-content-loop-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag55a-no-deployment-publishing-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag55a-no-backend-auth-rls-database-runtime-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const ag54zReview = readJson("data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json");
const ag53zReview = readJson("data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json");
const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag54zReview.status !== "release_operations_closed_ready_for_ag55a") fail("AG54Z status mismatch.");
if (ag53zReview.status !== "public_quality_closed_ready_for_ag54a") fail("AG53Z status mismatch.");
if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z status mismatch.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag55b-completed-repo-stack-reconciliation.json");
const source = readJson("data/content-intelligence/release-candidate/ag55b-source-consumption-record.json");
const streamInventory = readJson("data/content-intelligence/release-candidate/ag55b-completed-stream-inventory-record.json");
const dependency = readJson("data/content-intelligence/release-candidate/ag55b-dependency-reconciliation-record.json");
const roadmap = readJson("data/content-intelligence/release-candidate/ag55b-roadmap-conflict-resolution-register.json");
const docsQuality = readJson("data/content-intelligence/release-candidate/ag55b-docs-quality-reconciliation-record.json");
const stack = readJson("data/content-intelligence/release-candidate/ag55b-completed-repo-stack-reconciliation-record.json");
const reconciliationBoundary = readJson("data/content-intelligence/release-candidate/ag55b-completed-stack-reconciliation-boundary.json");
const noDynamic = readJson("data/content-intelligence/backend-architecture/ag55b-no-controlled-dynamic-content-loop-activation-audit.json");
const noDeployment = readJson("data/content-intelligence/backend-architecture/ag55b-no-deployment-publishing-public-mutation-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag55b-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag55b-ag55c-end-to-end-release-candidate-validation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag55b-to-ag55c-end-to-end-release-candidate-validation-boundary.json");
const preview = readJson("data/quality/ag55b-completed-repo-stack-reconciliation-preview.json");
const pkg = readJson("package.json");

if (review.status !== "completed_repo_stack_reconciliation_ready_for_ag55c") fail("AG55B review status mismatch.");

for (const key of [
  "ag55b_completed_repo_stack_reconciliation_recorded",
  "ag55a_consumed",
  "completed_stream_inventory_recorded",
  "dependency_reconciliation_recorded",
  "roadmap_conflict_resolution_recorded",
  "docs_quality_reconciliation_recorded",
  "repo_stack_reconciliation_recorded",
  "completed_stack_reconciliation_boundary_recorded",
  "ready_for_ag55c_end_to_end_release_candidate_validation"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag55c !== 0) fail("AG55C blocker count must be zero.");
if (source.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");

if (streamInventory.audit_passed !== true) fail("Completed stream inventory must pass.");
if (streamInventory.ag42_to_ag54_reconciliation.length !== 13) fail("AG42–AG54 reconciliation must include 13 stages.");
for (const stage of ["AG42","AG43","AG44","AG45","AG46","AG47","AG48","AG49","AG50","AG51","AG52","AG53","AG54"]) {
  const row = streamInventory.ag42_to_ag54_reconciliation.find((item) => item.stage_id === stage);
  if (!row || row.digest_file_count <= 0) fail(`AG42–AG54 reconciliation missing ${stage}`);
}

if (dependency.audit_passed !== true) fail("Dependency reconciliation must pass.");
if (dependency.dependency_action_position !== "reconciliation_only_no_install_no_package_dependency_change") fail("Dependency reconciliation must be no-install.");
if (dependency.package_script_summary.validate_project_present !== true) fail("validate:project must be present.");
if (dependency.package_script_summary.validate_project_includes_ag55a !== true) fail("validate:project must include AG55A before AG55B.");

if (roadmap.audit_passed !== true) fail("Roadmap conflict register must pass.");
if (!JSON.stringify(roadmap.conflict_items).includes("AG41Z_TO_AG42A_POINTER")) fail("AG41Z to AG42A conflict must be registered.");
if (roadmap.active_governed_chain_position.next_stage !== "AG55C") fail("Active next stage must be AG55C.");
if (!JSON.stringify(roadmap.conflict_items).includes("historical pointer")) fail("AG41Z pointer must be resolved as historical.");

if (docsQuality.audit_passed !== true) fail("Docs quality reconciliation must pass.");
if (docsQuality.docs_quality_file_count <= 0) fail("docs/quality file count must be positive.");
if (docsQuality.quality_review_file_count <= 0) fail("quality review file count must be positive.");
if (docsQuality.quality_registry_file_count <= 0) fail("quality registry file count must be positive.");
if (docsQuality.mutation_plan_file_count <= 0) fail("mutation plan file count must be positive.");

if (stack.audit_passed !== true) fail("Repo stack reconciliation must pass.");
if (stack.reconciled_stack_summary.hard_blocker_count_for_ag55c !== 0) fail("Stack hard blockers must be zero.");
if (stack.reconciled_stack_summary.missing_required_v01_stage_outputs.length !== 0) fail("Missing required V01 outputs must be zero.");

for (const rule of [
  "AG55B does not install dependencies or mutate package dependencies.",
  "AG55B does not activate AG56.",
  "AG55B does not activate controlled dynamic content-loop.",
  "AG55B does not deploy, publish, mutate public pages or trigger live checks."
]) {
  if (!reconciliationBoundary.boundary_rules.includes(rule)) fail(`Reconciliation boundary missing: ${rule}`);
}

for (const audit of [noDynamic, noDeployment, noBackend]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag55c_end_to_end_release_candidate_validation") fail("AG55C readiness status mismatch.");
if (readiness.ready_for_ag55c !== true) fail("AG55C readiness must be true.");
if (readiness.next_stage_id !== "AG55C") fail("Readiness must point to AG55C.");
if (boundary.next_stage_id !== "AG55C") fail("Boundary must point to AG55C.");

for (const key of [
  "controlled_dynamic_content_loop_activated",
  "ag56_dynamic_test_path_activated",
  "v02_item_activated",
  "dependency_installation_performed",
  "package_mutation_beyond_ag55b_scripts",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "deployment_approved",
  "deployment_performed",
  "github_release_created",
  "live_public_check_executed",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "public_dashboard_exposed",
  "external_fetch_enabled"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag55b"]) fail("Missing package script: generate:ag55b");
if (!pkg.scripts?.["validate:ag55b"]) fail("Missing package script: validate:ag55b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag55b")) fail("validate:project must include validate:ag55b.");

pass("AG55B Completed Repo Stack and Dependency Reconciliation is present.");
pass("AG55A V01 scope freeze is consumed.");
pass("Completed stream inventory is valid.");
pass("Dependency reconciliation is valid.");
pass("Roadmap conflict register is valid.");
pass("Docs/quality reconciliation is valid.");
pass("Completed repo stack reconciliation is valid.");
pass("Completed stack reconciliation boundary is valid.");
pass("No controlled dynamic content-loop activation audit is valid.");
pass("No deployment/publishing/public mutation audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG55C end-to-end release candidate validation readiness is valid.");
