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
  console.error(`❌ AG24I validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24g-episode-index-navigation-scaffold.json",
  "data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json",
  "data/content-intelligence/quality-reviews/ag24h-episode-production-conveyor.json",
  "data/content-intelligence/episodes/ag24h-episode-production-conveyor.json",
  "data/content-intelligence/episodes/ag24h-production-stage-registry.json",
  "data/content-intelligence/episodes/ag24h-topic-to-brief-conveyor-model.json",
  "data/content-intelligence/episodes/ag24h-editorial-review-handoff-model.json",
  "data/content-intelligence/quality-registry/ag24h-episode-quality-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24h-to-ag24i-episode-quality-audit-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/quality-reviews/ag24i-episode-quality-audit.json",
  "data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json",
  "data/content-intelligence/episodes/ag24i-quality-checklist-registry.json",
  "data/content-intelligence/episodes/ag24i-source-risk-audit-model.json",
  "data/content-intelligence/episodes/ag24i-non-public-control-audit-model.json",
  "data/content-intelligence/episodes/ag24i-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24i-episode-quality-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag24i-episodic-knowledge-engine-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24i-to-ag24z-episodic-knowledge-engine-closure-boundary.json",
  "data/quality/ag24i-episode-quality-audit.json",
  "data/quality/ag24i-episode-quality-audit-preview.json",
  "docs/quality/AG24I_EPISODE_QUALITY_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag24i-episode-quality-audit.json");
const auditPlan = readJson("data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json");
const checklist = readJson("data/content-intelligence/episodes/ag24i-quality-checklist-registry.json");
const sourceRisk = readJson("data/content-intelligence/episodes/ag24i-source-risk-audit-model.json");
const nonPublic = readJson("data/content-intelligence/episodes/ag24i-non-public-control-audit-model.json");
const consumption = readJson("data/content-intelligence/episodes/ag24i-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag24i-episode-quality-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag24i-episodic-knowledge-engine-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag24i-to-ag24z-episodic-knowledge-engine-closure-boundary.json");
const registry = readJson("data/quality/ag24i-episode-quality-audit.json");
const preview = readJson("data/quality/ag24i-episode-quality-audit-preview.json");
const ag24hReadiness = readJson("data/content-intelligence/quality-registry/ag24h-episode-quality-audit-readiness-record.json");
const ag24hConveyor = readJson("data/content-intelligence/episodes/ag24h-episode-production-conveyor.json");
const ag24hStages = readJson("data/content-intelligence/episodes/ag24h-production-stage-registry.json");
const ag24gIndex = readJson("data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json");
const pkg = readJson("package.json");

if (review.status !== "episode_quality_audit_created_ready_for_ag24z") fail("Review status mismatch.");
if (auditPlan.status !== "episode_quality_audit_created_ready_for_ag24z") fail("Audit plan status mismatch.");
if (auditPlan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (auditPlan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (auditPlan.audit_scope.audit_type !== "non_runtime_quality_audit_plan") fail("Audit type mismatch.");
if (auditPlan.audit_scope.checklist_count !== 12) fail("Audit must contain 12 checks.");
if (auditPlan.audit_scope.audit_execution_status !== "blocked") fail("Audit execution must be blocked.");
if (auditPlan.quality_audit_runtime_enabled !== false) fail("Runtime quality audit must be disabled.");
if (auditPlan.audit_execution_allowed_in_ag24i !== false) fail("Audit execution must be blocked in AG24I.");
if (auditPlan.article_generation_allowed_in_ag24i !== false) fail("Article generation must be blocked.");
if (auditPlan.publication_allowed_in_ag24i !== false) fail("Publication must be blocked.");
if (auditPlan.public_visibility_default !== false) fail("public_visibility default must be false.");
if (auditPlan.publish_approved_default !== false) fail("publish_approved default must be false.");

if (checklist.check_count !== 12) fail("Checklist registry must contain 12 checks.");
if (checklist.checklist_items.length !== 12) fail("Checklist items length must be 12.");
for (const item of checklist.checklist_items) {
  if (item.status !== "defined_not_executed") fail(`${item.check_id} must remain defined_not_executed.`);
}
if (checklist.runtime_execution_allowed !== false) fail("Checklist runtime execution must be false.");

if (sourceRisk.source_audit_rules.target_verified_references_per_episode !== 2) fail("Reference target must remain 2.");
if (sourceRisk.source_audit_rules.fake_links_blocked !== true) fail("Fake links must be blocked.");
if (sourceRisk.source_audit_rules.broken_links_blocked !== true) fail("Broken links must be blocked.");
if (sourceRisk.risk_audit_rules.unsupported_claims_blocked !== true) fail("Unsupported claims must be blocked.");
if (sourceRisk.risk_audit_rules.breaking_news_caution_required !== true) fail("Breaking-news caution must be required.");

for (const flag of ["public_visibility", "publish_approved", "article_generation_allowed", "backend_required", "supabase_required"]) {
  if (!nonPublic.required_false_flags.includes(flag)) fail(`Non-public false flag missing: ${flag}`);
}
if (nonPublic.public_mutation_allowed !== false) fail("Public mutation must be blocked.");
if (nonPublic.runtime_write_allowed !== false) fail("Runtime write must be blocked.");

if (!consumption.future_consumption?.AG24Z) fail("AG24Z consumption note missing.");
if (!consumption.future_consumption?.future_dynamic_site) fail("Future dynamic site consumption note missing.");
if (blocker.status !== "episode_quality_audit_operations_blocked_pending_ag24z") fail("Blocker register status mismatch.");
if (readiness.ready_for_ag24z !== true) fail("AG24Z readiness missing.");
if (boundary.next_stage_id !== "AG24Z") fail("AG24Z boundary missing.");

if (review.summary.prior_ag_records_consumed !== true) fail("Prior AG records must be consumed.");
if (review.summary.episode_quality_audit_created !== true) fail("Episode quality audit summary missing.");
if (review.summary.checklist_count !== 12) fail("Review must record 12 checks.");
if (review.summary.runtime_audit_enabled !== false) fail("Runtime audit must remain false.");
if (review.summary.audit_execution_done !== false) fail("Audit execution must remain false.");
if (review.summary.topic_selection_done !== false) fail("Topic selection must remain false.");
if (review.summary.brief_generated !== false) fail("Brief generation must remain false.");
if (review.summary.draft_generated !== false) fail("Draft generation must remain false.");
if (review.summary.episode_generation_done !== false) fail("Episode generation must remain false.");
if (review.summary.article_generation_done !== false) fail("Article generation must remain false.");

if (ag24hReadiness.ready_for_ag24i !== true) fail("AG24H readiness must allow AG24I.");
if (ag24hConveyor.status !== "episode_production_conveyor_created_ready_for_ag24i") fail("AG24H source conveyor status mismatch.");
if (ag24hStages.stage_count !== 8) fail("AG24H source must contain 8 stages.");
if (ag24gIndex.total_index_entries !== 36) fail("AG24G source index must contain 36 entries.");
if (registry.status !== "episode_quality_audit_created_ready_for_ag24z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.checklist_count !== 12) fail("Preview must record 12 checks.");
if (preview.runtime_audit_enabled !== 0) fail("Preview must record 0 runtime audit enabled.");
if (preview.audit_executions !== 0) fail("Preview must record 0 audit executions.");
if (preview.selected_topics !== 0) fail("Preview must record 0 selected topics.");
if (preview.generated_briefs !== 0) fail("Preview must record 0 generated briefs.");
if (preview.generated_drafts !== 0) fail("Preview must record 0 generated drafts.");
if (preview.generated_episodes !== 0) fail("Preview must record 0 generated episodes.");
if (preview.generated_articles !== 0) fail("Preview must record 0 generated articles.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24f-episode-lifecycle-status-registry.json",
  "data/content-intelligence/episodes/ag24g-episode-index-navigation-scaffold.json",
  "data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json",
  "data/content-intelligence/quality-reviews/ag24h-episode-production-conveyor.json",
  "data/content-intelligence/episodes/ag24h-episode-production-conveyor.json",
  "data/content-intelligence/episodes/ag24h-production-stage-registry.json",
  "data/content-intelligence/episodes/ag24h-topic-to-brief-conveyor-model.json",
  "data/content-intelligence/episodes/ag24h-editorial-review-handoff-model.json",
  "data/content-intelligence/episodes/ag24h-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24h-episode-quality-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24h-to-ag24i-episode-quality-audit-boundary.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json"
]) {
  if (!auditPlan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag24i"]) fail("Missing generate:ag24i script.");
if (!pkg.scripts?.["validate:ag24i"]) fail("Missing validate:ag24i script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag24i")) fail("validate:project must include validate:ag24i.");

pass("AG24I Episode Quality Audit is present.");
pass("Checklist registry, source/risk audit model and non-public control audit model are valid.");
pass("Prior AG24A/AG24B/AG24C/AG24D/AG24E/AG24F/AG24G/AG24H/AG23G/AG23F/AG23Z records are consumed.");
pass("AG24Z Episodic Knowledge Engine Closure boundary is ready.");
pass("No runtime audit, topic selection, brief/draft/article generation, GitHub write, deployment or publishing is enabled.");
