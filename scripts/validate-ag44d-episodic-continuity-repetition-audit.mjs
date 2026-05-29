import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function fail(message) {
  console.error(`❌ AG44D validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag44c-episode-to-surface-mapping.json",
  "data/content-intelligence/episodes/ag44c-episode-to-surface-mapping-model.json",
  "data/content-intelligence/homepage/ag44c-homepage-surface-consumption-map.json",
  "data/content-intelligence/episodes/ag44c-featured-reads-surface-consumption-map.json",
  "data/content-intelligence/episodes/ag44c-badge-navigation-timing-plan.json",
  "data/content-intelligence/backend-architecture/ag44c-no-duplicate-surface-mapping-audit-register.json",
  "data/content-intelligence/backend-architecture/ag44c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag44c-episodic-continuity-repetition-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag44c-to-ag44d-continuity-repetition-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag44d-episodic-continuity-repetition-audit.json",
  "data/content-intelligence/episodes/ag44d-continuity-audit.json",
  "data/content-intelligence/episodes/ag44d-repetition-risk-audit.json",
  "data/content-intelligence/episodes/ag44d-topic-depth-brand-fit-audit.json",
  "data/content-intelligence/episodes/ag44d-cadence-safety-model.json",
  "data/content-intelligence/quality-registry/ag44d-episodic-carry-forward-register.json",
  "data/content-intelligence/backend-architecture/ag44d-no-duplicate-continuity-audit-register.json",
  "data/content-intelligence/backend-architecture/ag44d-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag44d-ag44z-episodic-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag44d-to-ag44z-episodic-knowledge-engine-closure-boundary.json",
  "data/quality/ag44d-episodic-continuity-repetition-audit.json",
  "data/quality/ag44d-episodic-continuity-repetition-audit-preview.json",
  "docs/quality/AG44D_EPISODIC_CONTINUITY_REPETITION_AUDIT.md",
  "scripts/generate-ag44d-episodic-continuity-repetition-audit.mjs",
  "scripts/validate-ag44d-episodic-continuity-repetition-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag44cReview = readJson("data/content-intelligence/quality-reviews/ag44c-episode-to-surface-mapping.json");
const ag44cSurfaceMap = readJson("data/content-intelligence/episodes/ag44c-episode-to-surface-mapping-model.json");
const ag44cHomepageConsumption = readJson("data/content-intelligence/homepage/ag44c-homepage-surface-consumption-map.json");
const ag44cFeaturedReadsConsumption = readJson("data/content-intelligence/episodes/ag44c-featured-reads-surface-consumption-map.json");
const ag44cBadgeNavigationPlan = readJson("data/content-intelligence/episodes/ag44c-badge-navigation-timing-plan.json");
const ag44cNoDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag44c-no-duplicate-surface-mapping-audit-register.json");
const ag44cNoMutationAudit = readJson("data/content-intelligence/backend-architecture/ag44c-no-mutation-audit-register.json");
const ag44cReadiness = readJson("data/content-intelligence/quality-registry/ag44c-episodic-continuity-repetition-audit-readiness-record.json");
const ag44cBoundary = readJson("data/content-intelligence/mutation-plans/ag44c-to-ag44d-continuity-repetition-audit-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag44d-episodic-continuity-repetition-audit.json");
const continuityAudit = readJson("data/content-intelligence/episodes/ag44d-continuity-audit.json");
const repetitionAudit = readJson("data/content-intelligence/episodes/ag44d-repetition-risk-audit.json");
const depthBrandFitAudit = readJson("data/content-intelligence/episodes/ag44d-topic-depth-brand-fit-audit.json");
const cadenceSafetyModel = readJson("data/content-intelligence/episodes/ag44d-cadence-safety-model.json");
const carryForward = readJson("data/content-intelligence/quality-registry/ag44d-episodic-carry-forward-register.json");
const noDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag44d-no-duplicate-continuity-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag44d-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag44d-ag44z-episodic-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag44d-to-ag44z-episodic-knowledge-engine-closure-boundary.json");
const preview = readJson("data/quality/ag44d-episodic-continuity-repetition-audit-preview.json");
const pkg = readJson("package.json");

if (ag44cReview.status !== "episode_to_surface_mapping_ready_for_ag44d") fail("AG44C review status mismatch.");
if (ag44cReview.summary.ready_for_ag44d !== true) fail("AG44C readiness summary missing.");
if (ag44cSurfaceMap.result.episode_surface_mapping_recorded !== true) fail("AG44C surface mapping missing.");
if (ag44cHomepageConsumption.homepage_mapping_result.homepage_mutated !== false) fail("Homepage mutation must remain false.");
if (ag44cFeaturedReadsConsumption.featured_reads_mapping_result.listing_mutated !== false) fail("Featured Reads/listing mutation must remain false.");
if (ag44cBadgeNavigationPlan.mutation_now !== false) fail("Badge navigation mutation must remain false.");
if (ag44cNoDuplicateAudit.status !== "no_duplicate_surface_mapping_audit_passed_for_ag44c") fail("AG44C no-duplicate audit mismatch.");
if (ag44cNoMutationAudit.status !== "no_mutation_audit_passed_for_ag44c") fail("AG44C no-mutation audit mismatch.");
if (ag44cReadiness.ready_for_ag44d !== true) fail("AG44C readiness must permit AG44D.");
if (ag44cBoundary.next_stage_id !== "AG44D") fail("AG44C boundary must point to AG44D.");

if (review.status !== "episodic_continuity_repetition_audit_ready_for_ag44z") fail("Review status mismatch.");
if (review.summary.ag44d_continuity_repetition_audit_completed !== true) fail("AG44D completion flag missing.");
if (review.summary.ag44c_consumed !== true) fail("AG44C consumption flag missing.");
if (review.summary.ag23g_topic_repetition_sources_consumed_where_available !== true) fail("AG23G consumption flag missing.");
if (review.summary.ag43_quality_sources_consumed !== true) fail("AG43 quality consumption flag missing.");
if (review.summary.ready_for_ag44z !== true) fail("AG44Z readiness missing.");
if (review.summary.hard_blocker_count_for_ag44z !== 0) fail("AG44Z hard blocker count must be zero.");
if (review.summary.duplicate_episode_audit_system_created !== false) fail("Duplicate audit system must be false.");

if (continuityAudit.status !== "episodic_continuity_audit_passed") fail("Continuity audit status mismatch.");
if (continuityAudit.failed_checks.length !== 0) fail("Continuity failed checks must be zero.");
for (const check of continuityAudit.continuity_checks) {
  if (check.passed !== true) fail(`Continuity check failed: ${check.check_id}`);
}

if (repetitionAudit.status !== "episodic_repetition_risk_audit_passed") fail("Repetition audit status mismatch.");
if (repetitionAudit.audit_result.repetition_guard_recorded !== true) fail("Repetition guard missing.");
if (repetitionAudit.audit_result.no_episode_generation_required !== true) fail("No episode generation guard missing.");
if (repetitionAudit.audit_result.hard_blocker_count_for_ag44z !== 0) fail("Repetition audit blocker count must be zero.");

if (depthBrandFitAudit.status !== "topic_depth_brand_fit_audit_passed") fail("Depth/brand audit status mismatch.");
if (depthBrandFitAudit.audit_result.brand_fit_guard_recorded !== true) fail("Brand-fit guard missing.");
if (depthBrandFitAudit.audit_result.topic_depth_guard_recorded !== true) fail("Topic-depth guard missing.");
if (depthBrandFitAudit.audit_result.no_public_surface_activation_now !== true) fail("No public activation guard missing.");

if (cadenceSafetyModel.status !== "cadence_safety_model_recorded") fail("Cadence safety model status mismatch.");
if (cadenceSafetyModel.runtime_scheduler_enabled !== false) fail("Runtime scheduler must remain disabled.");
if (cadenceSafetyModel.automation_enabled_now !== false) fail("Automation must remain disabled.");
if (cadenceSafetyModel.public_activation_now !== false) fail("Public activation must remain false.");

if (carryForward.status !== "carry_forward_items_recorded_for_ag44z_and_later") fail("Carry-forward status mismatch.");
if (carryForward.hard_blocker_count_for_ag44z !== 0) fail("Carry-forward blocker count must be zero.");
const carry = JSON.stringify(carryForward.carried_forward_items);
for (const target of ["AG44Z", "AG46", "AG53", "AG56"]) {
  if (!carry.includes(target)) fail(`Carry-forward target missing: ${target}`);
}

if (noDuplicateAudit.status !== "no_duplicate_continuity_audit_passed_for_ag44d") fail("No-duplicate audit status mismatch.");
if (noDuplicateAudit.failed_checks.length !== 0) fail("No-duplicate failed checks must be zero.");
for (const check of noDuplicateAudit.checks) {
  if (check.passed !== true) fail(`No-duplicate check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag44d") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag44z !== true) fail("Readiness must permit AG44Z.");
if (readiness.next_stage_id !== "AG44Z") fail("Next stage must be AG44Z.");
if (readiness.article_mutation_allowed_next !== false) fail("Article mutation must remain blocked.");
if (readiness.episode_generation_allowed_next !== false) fail("Episode generation must remain blocked.");
if (readiness.topic_promotion_allowed_next !== false) fail("Topic promotion must remain blocked.");
if (readiness.homepage_mutation_allowed_next !== false) fail("Homepage mutation must remain blocked.");
if (readiness.featured_reads_mutation_allowed_next !== false) fail("Featured Reads mutation must remain blocked.");
if (readiness.reference_fetch_allowed_next !== false) fail("Reference fetch must remain blocked.");
if (readiness.image_generation_allowed_next !== false) fail("Image generation must remain blocked.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG44Z") fail("Boundary must point to AG44Z.");

if (preview.ag44d_continuity_repetition_audit_completed !== 1) fail("Preview completion flag missing.");
if (preview.ready_for_ag44z !== 1) fail("Preview AG44Z readiness missing.");
if (preview.duplicate_episode_audit_system_created !== 0) fail("Preview duplicate audit system must be zero.");
if (preview.article_mutated !== 0) fail("Article mutation must be zero.");
if (preview.episode_generated !== 0) fail("Episode generation must be zero.");
if (preview.topic_promoted !== 0) fail("Topic promotion must be zero.");
if (preview.homepage_mutated !== 0) fail("Homepage mutation must be zero.");
if (preview.featured_reads_mutated !== 0) fail("Featured Reads mutation must be zero.");
if (preview.reference_fetch_executed !== 0) fail("Reference fetch must be zero.");
if (preview.image_generation_executed !== 0) fail("Image generation must be zero.");
if (preview.public_publishing_operation_performed !== 0) fail("Publishing must be zero.");
if (preview.database_write_performed !== 0) fail("Database write must be zero.");
if (preview.deployment_performed !== 0) fail("Deployment must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Backend activation must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag44d"]) fail("Missing package script: generate:ag44d");
if (!pkg.scripts?.["validate:ag44d"]) fail("Missing package script: validate:ag44d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag44d")) fail("validate:project must include validate:ag44d.");

pass("AG44D Episodic Continuity and Repetition Audit is present.");
pass("AG44C and available AG23G/AG43 quality signals are consumed.");
pass("Continuity, repetition-risk, topic-depth and brand-fit audits are valid.");
pass("Cadence safety model is recorded without runtime automation.");
pass("Carry-forward to AG44Z / AG46 / AG53 / AG56 is recorded.");
pass("No duplicate episode audit system is created.");
pass("No-mutation audit is valid.");
pass("AG44Z Episodic Knowledge Engine Closure readiness is valid.");
pass("No episode/article generation, topic promotion, homepage/Featured Reads mutation, reference fetch, image generation, public mutation, deployment, database/backend activation or service-role exposure is recorded.");
