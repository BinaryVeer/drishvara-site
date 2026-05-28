import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function read(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(msg) { console.error(`❌ AG43A validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag42z-dynamic-workflow-hardening-closure.json",
  "data/content-intelligence/backend-architecture/ag42z-ag42-hardening-chain-register.json",
  "data/content-intelligence/backend-architecture/ag42z-carry-forward-exception-register.json",
  "data/content-intelligence/backend-architecture/ag42z-ag43-entry-consumption-plan.json",
  "data/content-intelligence/backend-architecture/ag42z-no-mutation-continuity-audit-register.json",
  "data/content-intelligence/quality-registry/ag42z-article-intelligence-integration-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag42z-to-ag43a-article-intelligence-integration-boundary.json",
  "data/content-intelligence/backend-architecture/ag42a-existing-logic-consumption-register.json",
  "data/content-intelligence/backend-architecture/ag42a-no-duplicate-audit-rulebook.json",
  "scripts/validate-ag06b-content-intelligence-schema.mjs",
  "scripts/validate-ag23g-first-light-topic-scoring-model.mjs",
  "data/content-intelligence/homepage/ag23g-topic-score-fields.json",
  "data/content-intelligence/homepage/ag23g-topic-score-thresholds.json",
  "scripts/article-quality-review-preflight.js",

  "data/content-intelligence/quality-reviews/ag43a-article-intelligence-integration-entry.json",
  "data/content-intelligence/backend-architecture/ag43a-article-intelligence-integration-entry.json",
  "data/content-intelligence/backend-architecture/ag43a-content-intelligence-consumption-map.json",
  "data/content-intelligence/backend-architecture/ag43a-topic-engine-consumption-map.json",
  "data/content-intelligence/backend-architecture/ag43a-article-quality-consumption-map.json",
  "data/content-intelligence/backend-architecture/ag43a-integration-gap-register.json",
  "data/content-intelligence/backend-architecture/ag43a-no-duplicate-audit-register.json",
  "data/content-intelligence/quality-registry/ag43a-article-intelligence-integration-blocker-register.json",
  "data/content-intelligence/quality-registry/ag43a-topic-reference-image-integration-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag43a-to-ag43b-topic-reference-image-integration-boundary.json",
  "data/quality/ag43a-article-intelligence-integration-entry.json",
  "data/quality/ag43a-article-intelligence-integration-entry-preview.json",
  "docs/quality/AG43A_ARTICLE_INTELLIGENCE_INTEGRATION_ENTRY.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag42z = readJson("data/content-intelligence/backend-architecture/ag42z-dynamic-workflow-hardening-closure.json");
const ag42zChain = readJson("data/content-intelligence/backend-architecture/ag42z-ag42-hardening-chain-register.json");
const ag42zCarry = readJson("data/content-intelligence/backend-architecture/ag42z-carry-forward-exception-register.json");
const ag42zReadiness = readJson("data/content-intelligence/quality-registry/ag42z-article-intelligence-integration-readiness-record.json");
const ag42zBoundary = readJson("data/content-intelligence/mutation-plans/ag42z-to-ag43a-article-intelligence-integration-boundary.json");

const entry = readJson("data/content-intelligence/backend-architecture/ag43a-article-intelligence-integration-entry.json");
const contentMap = readJson("data/content-intelligence/backend-architecture/ag43a-content-intelligence-consumption-map.json");
const topicMap = readJson("data/content-intelligence/backend-architecture/ag43a-topic-engine-consumption-map.json");
const qualityMap = readJson("data/content-intelligence/backend-architecture/ag43a-article-quality-consumption-map.json");
const gaps = readJson("data/content-intelligence/backend-architecture/ag43a-integration-gap-register.json");
const noDuplicate = readJson("data/content-intelligence/backend-architecture/ag43a-no-duplicate-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag43a-topic-reference-image-integration-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag43a-to-ag43b-topic-reference-image-integration-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag43a-article-intelligence-integration-entry.json");
const preview = readJson("data/quality/ag43a-article-intelligence-integration-entry-preview.json");
const pkg = readJson("package.json");

const ag06b = read("scripts/validate-ag06b-content-intelligence-schema.mjs");
const ag23g = read("scripts/validate-ag23g-first-light-topic-scoring-model.mjs");
const ag23gFields = readJson("data/content-intelligence/homepage/ag23g-topic-score-fields.json");
const ag23gThresholds = readJson("data/content-intelligence/homepage/ag23g-topic-score-thresholds.json");
const articleQuality = read("scripts/article-quality-review-preflight.js");

if (ag42z.status !== "dynamic_workflow_hardening_closure_created_ready_for_ag43a_article_intelligence_integration") fail("AG42Z source mismatch.");
if (ag42zChain.closed_successfully !== true) fail("AG42Z chain must be closed.");
if (ag42zCarry.hard_blocker_count_for_ag43a !== 0) fail("AG42Z hard blockers for AG43A must be 0.");
if (ag42zReadiness.ready_for_ag43a !== true) fail("AG42Z readiness must allow AG43A.");
if (ag42zBoundary.next_stage_id !== "AG43A") fail("AG42Z boundary must point to AG43A.");

if (!ag06b.includes("reference") || !ag06b.includes("visual") || !ag06b.includes("quality")) fail("AG06B content-intelligence signals missing.");
if (!ag23g.includes("threshold") || !ag23g.includes("blocked")) fail("AG23G scoring guard signals missing.");
if (!JSON.stringify(ag23gFields).toLowerCase().includes("reference")) fail("AG23G reference signal missing.");
if (!JSON.stringify(ag23gThresholds).includes("25") || !JSON.stringify(ag23gThresholds).includes("18")) fail("AG23G thresholds missing.");
if (!articleQuality.includes("quality_score")) fail("Article quality score signal missing.");
if (!articleQuality.includes("source_reference_status")) fail("Article reference status signal missing.");
if (!articleQuality.includes("image_approval_status")) fail("Article image approval status signal missing.");

if (entry.status !== "article_intelligence_integration_entry_created_ready_for_ag43b_topic_reference_image_integration") fail("Entry status mismatch.");
if (entry.entry_decision.article_intelligence_integration_entry_created !== true) fail("Entry creation missing.");
if (entry.entry_decision.proceed_to_ag43b_topic_reference_image_integration !== true) fail("AG43B readiness missing.");

for (const flag of [
  "topic_promoted_to_live_article",
  "article_generated",
  "article_file_created_or_changed",
  "article_quality_runtime_executed",
  "reference_fetch_executed",
  "image_generation_executed",
  "featured_reads_mutated",
  "homepage_mutated",
  "listing_mutated",
  "first_controlled_batch_executed",
  "batch_execution_authorized_now",
  "candidate_selected_for_execution",
  "real_publish_executed",
  "database_write_done",
  "audit_log_write_done",
  "rollback_write_done",
  "public_article_mutated",
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
  if (entry.entry_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (contentMap.status !== "content_intelligence_consumption_map_created") fail("Content intelligence map status mismatch.");
for (const component of ["content packet schema", "reference registry", "visual registry", "quality review schema", "publish queue schema"]) {
  if (!contentMap.consumed_components.some((item) => item.component === component && item.recreate_in_ag43 === false)) {
    fail(`Content intelligence component missing or duplicated: ${component}`);
  }
}

if (topicMap.status !== "topic_engine_consumption_map_created") fail("Topic engine map status mismatch.");
if (topicMap.consumed_topic_logic.topic_score_fields_present !== true) fail("Topic score fields must be present.");
if (topicMap.consumed_topic_logic.threshold_bands_present !== true) fail("Threshold bands must be present.");
if (topicMap.consumed_topic_logic.reference_availability_signal_present !== true) fail("Reference signal must be present.");
if (!topicMap.do_not_duplicate.includes("topic score fields")) fail("Do-not-duplicate topic fields missing.");

if (qualityMap.status !== "article_quality_consumption_map_created") fail("Article quality map status mismatch.");
for (const signal of ["quality_score", "source_reference_status", "image_approval_status"]) {
  if (!qualityMap.consumed_quality_logic.includes(signal)) fail(`Quality signal missing: ${signal}`);
}

if (gaps.status !== "integration_gap_register_created") fail("Integration gap register status mismatch.");
if (gaps.hard_blocker_count_for_ag43b !== 0) fail("Hard blocker count for AG43B must be 0.");
if (!gaps.gaps.some((item) => item.gap_id === "ag43a_g04")) fail("No-generation boundary gap missing.");

if (noDuplicate.audit_passed !== true) fail("No-duplicate audit must pass.");
for (const check of noDuplicate.checks) {
  if (check.passed !== true) fail(`No-duplicate check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag43b !== true) fail("AG43B readiness missing.");
if (readiness.next_stage_id !== "AG43B") fail("Next stage must be AG43B.");
if (readiness.hard_blocker_count_for_ag43b !== 0) fail("Readiness hard blocker count must be 0.");
if (readiness.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("AG56 deferral must remain.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG43B") fail("Boundary must point to AG43B.");
if (review.summary.ready_for_ag43b !== true) fail("Review AG43B readiness missing.");
if (review.summary.hard_blocker_count_for_ag43b !== 0) fail("Review hard blocker count must be 0.");
if (preview.ready_for_ag43b !== 1) fail("Preview AG43B readiness missing.");
if (preview.first_controlled_dynamic_content_loop_deferred_to_ag56 !== 1) fail("Preview AG56 deferral missing.");
if (preview.article_generated !== 0) fail("Preview article generated must be 0.");
if (preview.topic_promoted_to_live_article !== 0) fail("Preview topic promotion must be 0.");
if (preview.reference_fetch_executed !== 0) fail("Preview reference fetch must be 0.");
if (preview.image_generation_executed !== 0) fail("Preview image generation must be 0.");
if (preview.featured_reads_mutated !== 0) fail("Preview Featured Reads mutation must be 0.");
if (preview.homepage_mutated !== 0) fail("Preview homepage mutation must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.backend_activation_approved_now !== 0) fail("Preview backend activation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag43a"]) fail("Missing generate:ag43a script.");
if (!pkg.scripts?.["validate:ag43a"]) fail("Missing validate:ag43a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag43a")) fail("validate:project must include validate:ag43a.");

pass("AG43A Article Intelligence Integration Entry is present.");
pass("AG06B, AG23G and article-quality logic are consumed without duplication.");
pass("Content-intelligence, topic-engine and article-quality consumption maps are valid.");
pass("No-duplicate audit is valid.");
pass("AG43B Topic, Reference and Image Governance Integration readiness is valid.");
pass("No article generation, public mutation, database write, deployment, SQL grant execution or service-role key is recorded.");
