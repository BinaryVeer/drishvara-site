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
  console.error(`❌ AG44Z validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag44a-episodic-foundation-consumption.json",
  "data/content-intelligence/quality-reviews/ag44b-weekly-rhythm-calendar-alignment.json",
  "data/content-intelligence/quality-reviews/ag44c-episode-to-surface-mapping.json",
  "data/content-intelligence/quality-reviews/ag44d-episodic-continuity-repetition-audit.json",
  "data/content-intelligence/quality-registry/ag44d-ag44z-episodic-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag44d-to-ag44z-episodic-knowledge-engine-closure-boundary.json",
  "data/content-intelligence/quality-registry/ag44d-episodic-carry-forward-register.json",
  "data/content-intelligence/episodes/ag44d-continuity-audit.json",
  "data/content-intelligence/episodes/ag44d-repetition-risk-audit.json",
  "data/content-intelligence/episodes/ag44d-topic-depth-brand-fit-audit.json",
  "data/content-intelligence/episodes/ag44d-cadence-safety-model.json",
  "data/content-intelligence/closure-records/ag43z-article-intelligence-quality-automation-closure.json",

  "data/content-intelligence/quality-reviews/ag44z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/closure-records/ag44z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/backend-architecture/ag44z-ag44-chain-integration-audit.json",
  "data/content-intelligence/quality-registry/ag44z-carry-forward-register.json",
  "data/content-intelligence/backend-architecture/ag44z-no-duplicate-closure-audit-register.json",
  "data/content-intelligence/backend-architecture/ag44z-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag44z-next-governed-stage-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag44z-to-next-governed-stage-boundary.json",
  "data/quality/ag44z-episodic-knowledge-engine-closure.json",
  "data/quality/ag44z-episodic-knowledge-engine-closure-preview.json",
  "docs/quality/AG44Z_EPISODIC_KNOWLEDGE_ENGINE_CLOSURE.md",
  "scripts/generate-ag44z-episodic-knowledge-engine-closure.mjs",
  "scripts/validate-ag44z-episodic-knowledge-engine-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag44aReview = readJson("data/content-intelligence/quality-reviews/ag44a-episodic-foundation-consumption.json");
const ag44bReview = readJson("data/content-intelligence/quality-reviews/ag44b-weekly-rhythm-calendar-alignment.json");
const ag44cReview = readJson("data/content-intelligence/quality-reviews/ag44c-episode-to-surface-mapping.json");
const ag44dReview = readJson("data/content-intelligence/quality-reviews/ag44d-episodic-continuity-repetition-audit.json");
const ag44dReadiness = readJson("data/content-intelligence/quality-registry/ag44d-ag44z-episodic-closure-readiness-record.json");
const ag44dBoundary = readJson("data/content-intelligence/mutation-plans/ag44d-to-ag44z-episodic-knowledge-engine-closure-boundary.json");
const ag44dCarryForward = readJson("data/content-intelligence/quality-registry/ag44d-episodic-carry-forward-register.json");
const ag44dContinuityAudit = readJson("data/content-intelligence/episodes/ag44d-continuity-audit.json");
const ag44dRepetitionAudit = readJson("data/content-intelligence/episodes/ag44d-repetition-risk-audit.json");
const ag44dDepthBrandFitAudit = readJson("data/content-intelligence/episodes/ag44d-topic-depth-brand-fit-audit.json");
const ag44dCadenceSafetyModel = readJson("data/content-intelligence/episodes/ag44d-cadence-safety-model.json");

const review = readJson("data/content-intelligence/quality-reviews/ag44z-episodic-knowledge-engine-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag44z-episodic-knowledge-engine-closure.json");
const chainAudit = readJson("data/content-intelligence/backend-architecture/ag44z-ag44-chain-integration-audit.json");
const carryForward = readJson("data/content-intelligence/quality-registry/ag44z-carry-forward-register.json");
const noDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag44z-no-duplicate-closure-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag44z-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag44z-next-governed-stage-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag44z-to-next-governed-stage-boundary.json");
const preview = readJson("data/quality/ag44z-episodic-knowledge-engine-closure-preview.json");
const pkg = readJson("package.json");

if (ag44aReview.status !== "episodic_foundation_consumed_ready_for_ag44b") fail("AG44A review status mismatch.");
if (ag44bReview.status !== "weekly_rhythm_calendar_aligned_ready_for_ag44c") fail("AG44B review status mismatch.");
if (ag44cReview.status !== "episode_to_surface_mapping_ready_for_ag44d") fail("AG44C review status mismatch.");
if (ag44dReview.status !== "episodic_continuity_repetition_audit_ready_for_ag44z") fail("AG44D review status mismatch.");
if (ag44dReadiness.ready_for_ag44z !== true) fail("AG44D readiness must permit AG44Z.");
if (ag44dBoundary.next_stage_id !== "AG44Z") fail("AG44D boundary must point to AG44Z.");
if (ag44dCarryForward.hard_blocker_count_for_ag44z !== 0) fail("AG44D carry-forward blocker count must be zero.");

if (ag44dContinuityAudit.status !== "episodic_continuity_audit_passed") fail("Continuity audit status mismatch.");
if (ag44dRepetitionAudit.status !== "episodic_repetition_risk_audit_passed") fail("Repetition audit status mismatch.");
if (ag44dDepthBrandFitAudit.status !== "topic_depth_brand_fit_audit_passed") fail("Topic-depth brand-fit audit status mismatch.");
if (ag44dCadenceSafetyModel.status !== "cadence_safety_model_recorded") fail("Cadence safety model status mismatch.");
if (ag44dCadenceSafetyModel.runtime_scheduler_enabled !== false) fail("Runtime scheduler must remain disabled.");
if (ag44dCadenceSafetyModel.automation_enabled_now !== false) fail("Automation must remain disabled.");
if (ag44dCadenceSafetyModel.public_activation_now !== false) fail("Public activation must remain false.");

if (closure.status !== "ag44_episodic_knowledge_engine_closed_ready_for_next_governed_stage") fail("Closure status mismatch.");
if (!Array.isArray(closure.closed_chain) || closure.closed_chain.join(">") !== "AG44A>AG44B>AG44C>AG44D") fail("Closed chain mismatch.");
if (closure.next_stage_id !== "AG45") fail("Closure next stage must be AG45 placeholder for next governed stage.");

if (review.status !== closure.status) fail("Review status must match closure status.");
if (review.summary.ag44z_closure_completed !== true) fail("AG44Z completion flag missing.");
if (review.summary.ag44a_closed !== true) fail("AG44A closed flag missing.");
if (review.summary.ag44b_closed !== true) fail("AG44B closed flag missing.");
if (review.summary.ag44c_closed !== true) fail("AG44C closed flag missing.");
if (review.summary.ag44d_closed !== true) fail("AG44D closed flag missing.");
if (review.summary.ag56_dynamic_content_loop_still_deferred !== true) fail("AG56 deferral flag missing.");
if (review.summary.ready_for_next_governed_stage !== true) fail("Next-stage readiness missing.");
if (review.summary.hard_blocker_count_for_next_governed_stage !== 0) fail("Hard blocker count must be zero.");

if (chainAudit.status !== "ag44_episodic_knowledge_engine_chain_integrated_and_closed") fail("Chain audit status mismatch.");
if (chainAudit.closed_chain.join(">") !== "AG44A>AG44B>AG44C>AG44D") fail("Chain audit closed chain mismatch.");
if (chainAudit.failed_checks.length !== 0) fail("Chain audit failed checks must be zero.");
for (const check of chainAudit.checks) {
  if (check.passed !== true) fail(`Chain audit check failed: ${check.check_id}`);
}

if (carryForward.status !== "carry_forward_items_recorded_for_later_governed_stages") fail("Carry-forward status mismatch.");
if (carryForward.hard_blocker_count_for_next_governed_stage !== 0) fail("Carry-forward hard blocker count must be zero.");
const carryTargets = JSON.stringify(carryForward.carried_forward_to_later_stages);
for (const target of ["AG45", "AG46", "AG53", "AG56"]) {
  if (!carryTargets.includes(target)) fail(`Carry-forward target missing: ${target}`);
}

if (noDuplicateAudit.status !== "no_duplicate_closure_audit_passed_for_ag44z") fail("No-duplicate audit status mismatch.");
if (noDuplicateAudit.failed_checks.length !== 0) fail("No-duplicate failed checks must be zero.");
for (const check of noDuplicateAudit.checks) {
  if (check.passed !== true) fail(`No-duplicate check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag44z") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_next_governed_stage !== true) fail("Readiness must permit next governed stage.");
if (readiness.next_stage_id !== "AG45") fail("Readiness next stage must be AG45 placeholder.");
if (readiness.ag56_dynamic_content_loop_still_deferred !== true) fail("AG56 deferral must remain true.");
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

if (boundary.next_stage_id !== "AG45") fail("Boundary must point to AG45 placeholder.");

if (preview.ag44z_closure_completed !== 1) fail("Preview closure flag missing.");
if (preview.ready_for_next_governed_stage !== 1) fail("Preview next-stage readiness missing.");
if (preview.ag56_dynamic_content_loop_still_deferred !== 1) fail("Preview AG56 deferral missing.");
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

if (!pkg.scripts?.["generate:ag44z"]) fail("Missing package script: generate:ag44z");
if (!pkg.scripts?.["validate:ag44z"]) fail("Missing package script: validate:ag44z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag44z")) fail("validate:project must include validate:ag44z.");

pass("AG44Z Episodic Knowledge Engine Closure is present.");
pass("AG44A → AG44B → AG44C → AG44D chain is closed.");
pass("Runtime scheduler and public activation remain disabled.");
pass("Carry-forward to AG45 / AG46 / AG53 / AG56 is recorded.");
pass("No-duplicate and no-mutation closure audits are valid.");
pass("Next governed stage readiness is valid.");
pass("No episode/article generation, topic promotion, homepage/Featured Reads mutation, reference fetch, image generation, public mutation, deployment, database/backend activation or service-role exposure is recorded.");
