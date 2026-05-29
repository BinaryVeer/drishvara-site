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
  console.error(`❌ AG44A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag43z-article-intelligence-quality-automation-closure.json",
  "data/content-intelligence/closure-records/ag43z-article-intelligence-quality-automation-closure.json",
  "data/content-intelligence/quality-registry/ag43z-ag44-episodic-engine-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag43z-to-ag44-episodic-knowledge-engine-boundary.json",

  "data/content-intelligence/quality-reviews/ag44a-episodic-foundation-consumption.json",
  "data/content-intelligence/episodes/ag44a-episodic-foundation-consumption-map.json",
  "data/content-intelligence/backend-architecture/ag44a-existing-episode-source-audit.json",
  "data/content-intelligence/backend-architecture/ag44a-no-duplicate-episode-audit-register.json",
  "data/content-intelligence/backend-architecture/ag44a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag44a-weekly-rhythm-calendar-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag44a-to-ag44b-weekly-rhythm-calendar-boundary.json",
  "data/quality/ag44a-episodic-foundation-consumption.json",
  "data/quality/ag44a-episodic-foundation-consumption-preview.json",
  "docs/quality/AG44A_EPISODIC_FOUNDATION_CONSUMPTION.md",
  "scripts/generate-ag44a-episodic-foundation-consumption.mjs",
  "scripts/validate-ag44a-episodic-foundation-consumption.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag43zReview = readJson("data/content-intelligence/quality-reviews/ag43z-article-intelligence-quality-automation-closure.json");
const ag43zClosure = readJson("data/content-intelligence/closure-records/ag43z-article-intelligence-quality-automation-closure.json");
const ag43zReadiness = readJson("data/content-intelligence/quality-registry/ag43z-ag44-episodic-engine-readiness-record.json");
const ag43zBoundary = readJson("data/content-intelligence/mutation-plans/ag43z-to-ag44-episodic-knowledge-engine-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag44a-episodic-foundation-consumption.json");
const foundationMap = readJson("data/content-intelligence/episodes/ag44a-episodic-foundation-consumption-map.json");
const sourceAudit = readJson("data/content-intelligence/backend-architecture/ag44a-existing-episode-source-audit.json");
const noDuplicateAudit = readJson("data/content-intelligence/backend-architecture/ag44a-no-duplicate-episode-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag44a-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag44a-weekly-rhythm-calendar-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag44a-to-ag44b-weekly-rhythm-calendar-boundary.json");
const preview = readJson("data/quality/ag44a-episodic-foundation-consumption-preview.json");
const pkg = readJson("package.json");

if (ag43zReview.status !== "ag43_article_intelligence_quality_automation_closed_ready_for_ag44") fail("AG43Z review status mismatch.");
if (ag43zClosure.next_stage_id !== "AG44") fail("AG43Z closure must point to AG44.");
if (ag43zReadiness.ready_for_ag44 !== true) fail("AG43Z readiness must allow AG44.");
if (ag43zBoundary.next_stage_id !== "AG44") fail("AG43Z boundary must point to AG44.");

if (review.status !== "episodic_foundation_consumed_ready_for_ag44b") fail("Review status mismatch.");
if (review.summary.ag44a_foundation_consumed !== true) fail("AG44A foundation consumed flag missing.");
if (review.summary.existing_ag24_episode_records_consumed !== true) fail("AG24/episode source consumption missing.");
if (review.summary.ready_for_ag44b !== true) fail("AG44B readiness missing.");
if (review.summary.hard_blocker_count_for_ag44b !== 0) fail("AG44B hard blocker count must be zero.");
if (review.summary.duplicate_episode_system_created !== false) fail("Duplicate episode system must not be created.");

if (foundationMap.status !== "episodic_foundation_consumed_ready_for_ag44b") fail("Foundation map status mismatch.");
if (foundationMap.consumed_existing_episode_sources.source_count < 3) fail("Insufficient episode source count.");
if (foundationMap.foundation_result.existing_episodic_records_available !== true) fail("Existing episodic records availability missing.");
if (foundationMap.foundation_result.can_continue_to_weekly_rhythm_mapping !== true) fail("Weekly rhythm continuation missing.");
if (foundationMap.foundation_result.duplicate_episode_system_created !== false) fail("Duplicate foundation must be false.");

if (sourceAudit.status !== "existing_episode_sources_audited") fail("Source audit status mismatch.");
if (sourceAudit.audit_result.sufficient_existing_sources_for_ag44a !== true) fail("Source audit does not confirm sufficient sources.");
if (sourceAudit.audit_result.regeneration_required !== false) fail("Regeneration must not be required.");
if (sourceAudit.audit_result.duplicate_foundation_required !== false) fail("Duplicate foundation must not be required.");

if (noDuplicateAudit.status !== "no_duplicate_episode_audit_passed_for_ag44a") fail("No-duplicate audit status mismatch.");
if (noDuplicateAudit.failed_checks.length !== 0) fail("No-duplicate failed checks must be zero.");
for (const check of noDuplicateAudit.checks) {
  if (check.passed !== true) fail(`No-duplicate check failed: ${check.check_id}`);
}

if (noMutationAudit.status !== "no_mutation_audit_passed_for_ag44a") fail("No-mutation audit status mismatch.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation audit must pass.");
if (noMutationAudit.failed_checks.length !== 0) fail("No-mutation failed checks must be zero.");
for (const check of noMutationAudit.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag44b !== true) fail("Readiness must permit AG44B.");
if (readiness.next_stage_id !== "AG44B") fail("Next stage must be AG44B.");
if (readiness.article_mutation_allowed_next !== false) fail("Article mutation must remain blocked.");
if (readiness.episode_generation_allowed_next !== false) fail("Episode generation must remain blocked.");
if (readiness.topic_promotion_allowed_next !== false) fail("Topic promotion must remain blocked.");
if (readiness.reference_fetch_allowed_next !== false) fail("Reference fetch must remain blocked.");
if (readiness.image_generation_allowed_next !== false) fail("Image generation must remain blocked.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain blocked.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain blocked.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain blocked.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain blocked.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG44B") fail("Boundary must point to AG44B.");

if (preview.ag44a_foundation_consumed !== 1) fail("Preview foundation consumed flag missing.");
if (preview.ready_for_ag44b !== 1) fail("Preview AG44B readiness missing.");
if (preview.duplicate_episode_system_created !== 0) fail("Preview duplicate system must be zero.");
if (preview.article_mutated !== 0) fail("Article mutation must be zero.");
if (preview.episode_generated !== 0) fail("Episode generation must be zero.");
if (preview.topic_promoted !== 0) fail("Topic promotion must be zero.");
if (preview.reference_fetch_executed !== 0) fail("Reference fetch must be zero.");
if (preview.image_generation_executed !== 0) fail("Image generation must be zero.");
if (preview.public_publishing_operation_performed !== 0) fail("Publishing must be zero.");
if (preview.database_write_performed !== 0) fail("Database write must be zero.");
if (preview.deployment_performed !== 0) fail("Deployment must be zero.");
if (preview.backend_auth_supabase_activation_performed !== 0) fail("Backend activation must be zero.");
if (preview.service_role_key_exposed !== 0) fail("Service-role exposure must be zero.");

if (!pkg.scripts?.["generate:ag44a"]) fail("Missing package script: generate:ag44a");
if (!pkg.scripts?.["validate:ag44a"]) fail("Missing package script: validate:ag44a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag44a")) fail("validate:project must include validate:ag44a.");

pass("AG44A Episodic Foundation Consumption is present.");
pass("AG43Z closure and existing AG24/episodic records are consumed.");
pass("Existing episode foundation is audited without duplication.");
pass("No duplicate episode system is created.");
pass("No-mutation audit is valid.");
pass("AG44B Weekly Rhythm and Calendar Alignment readiness is valid.");
pass("No episode/article generation, topic promotion, reference fetch, image generation, public mutation, deployment, database/backend activation or service-role exposure is recorded.");
