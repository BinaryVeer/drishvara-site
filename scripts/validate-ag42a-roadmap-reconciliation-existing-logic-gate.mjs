import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function read(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(msg) { console.error(`❌ AG42A validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-closure.json",
  "data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-chain-register.json",
  "data/content-intelligence/backend-architecture/ag41z-first-controlled-batch-decision-readiness-record.json",
  "data/content-intelligence/quality-registry/ag41z-first-controlled-batch-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag41z-to-ag42a-first-controlled-batch-decision-boundary.json",

  "scripts/validate-ag06b-content-intelligence-schema.mjs",
  "scripts/validate-ag23g-first-light-topic-scoring-model.mjs",
  "data/content-intelligence/homepage/ag23g-topic-score-fields.json",
  "data/content-intelligence/homepage/ag23g-topic-score-thresholds.json",
  "scripts/article-quality-review-preflight.js",
  "scripts/word-of-day-bank-preflight.js",
  "scripts/panchang-festival-source-validation-preflight.js",
  "scripts/subscriber-guidance-personalization-preflight.js",
  "scripts/validate-ag27a-backend-need-assessment.mjs",

  "data/content-intelligence/quality-reviews/ag42a-roadmap-reconciliation-existing-logic-gate.json",
  "data/content-intelligence/backend-architecture/ag42a-roadmap-reconciliation-existing-logic-gate.json",
  "data/content-intelligence/backend-architecture/ag42a-existing-logic-consumption-register.json",
  "data/content-intelligence/backend-architecture/ag42a-ag41z-boundary-supersession-record.json",
  "data/content-intelligence/backend-architecture/ag42a-no-duplicate-audit-rulebook.json",
  "data/content-intelligence/backend-architecture/ag42a-delta-hardening-entry-plan.json",
  "data/content-intelligence/quality-registry/ag42a-roadmap-reconciliation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag42a-workflow-defect-review-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag42a-to-ag42b-workflow-defect-review-boundary.json",
  "data/quality/ag42a-roadmap-reconciliation-existing-logic-gate.json",
  "data/quality/ag42a-roadmap-reconciliation-existing-logic-gate-preview.json",
  "docs/quality/AG42A_ROADMAP_RECONCILIATION_EXISTING_LOGIC_GATE.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag41z = readJson("data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-closure.json");
const ag41zChain = readJson("data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-chain-register.json");
const ag41zReady = readJson("data/content-intelligence/quality-registry/ag41z-first-controlled-batch-decision-readiness-record.json");
const ag41zBoundary = readJson("data/content-intelligence/mutation-plans/ag41z-to-ag42a-first-controlled-batch-decision-boundary.json");

const gate = readJson("data/content-intelligence/backend-architecture/ag42a-roadmap-reconciliation-existing-logic-gate.json");
const consumption = readJson("data/content-intelligence/backend-architecture/ag42a-existing-logic-consumption-register.json");
const supersession = readJson("data/content-intelligence/backend-architecture/ag42a-ag41z-boundary-supersession-record.json");
const rulebook = readJson("data/content-intelligence/backend-architecture/ag42a-no-duplicate-audit-rulebook.json");
const hardening = readJson("data/content-intelligence/backend-architecture/ag42a-delta-hardening-entry-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag42a-workflow-defect-review-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag42a-to-ag42b-workflow-defect-review-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag42a-roadmap-reconciliation-existing-logic-gate.json");
const preview = readJson("data/quality/ag42a-roadmap-reconciliation-existing-logic-gate-preview.json");
const pkg = readJson("package.json");

const ag06b = read("scripts/validate-ag06b-content-intelligence-schema.mjs");
const ag23g = read("scripts/validate-ag23g-first-light-topic-scoring-model.mjs");
const articleQuality = read("scripts/article-quality-review-preflight.js");
const wordPreflight = read("scripts/word-of-day-bank-preflight.js");
const panchangPreflight = read("scripts/panchang-festival-source-validation-preflight.js");
const subscriberPreflight = read("scripts/subscriber-guidance-personalization-preflight.js");
const ag27a = read("scripts/validate-ag27a-backend-need-assessment.mjs");

if (ag41z.status !== "dynamic_publishing_closure_created_ready_for_ag42a_first_controlled_batch_decision") fail("AG41Z source mismatch.");
if (ag41zChain.closed_successfully !== true) fail("AG41Z chain must be closed.");
if (ag41zReady.ready_for_ag42a !== true) fail("AG41Z readiness must allow AG42A.");
if (ag41zBoundary.next_stage_id !== "AG42A") fail("AG41Z boundary must point to AG42A.");

if (!ag06b.includes("content") || !ag06b.includes("reference")) fail("AG06B content/reference logic not detected.");
if (!ag23g.includes("threshold") || !ag23g.includes("blocked")) fail("AG23G threshold/blocker logic not detected.");
if (!articleQuality.includes("quality_score")) fail("Article quality score logic not detected.");
if (!articleQuality.includes("source_reference_status")) fail("Source/reference status logic not detected.");
if (!wordPreflight.includes("Word") && !wordPreflight.includes("word")) fail("Word of Day logic not detected.");
if (!panchangPreflight.includes("Panchang") && !panchangPreflight.includes("panchang")) fail("Panchang logic not detected.");
if (!subscriberPreflight.includes("Subscriber guidance remains disabled")) fail("Subscriber disabled gate not detected.");
if (!ag27a.includes("backend_activation_should_start_now")) fail("AG27A backend deferral logic not detected.");

if (gate.status !== "roadmap_reconciliation_existing_logic_gate_created_ready_for_ag42b") fail("Gate status mismatch.");
if (gate.gate_decision.ag41z_first_controlled_batch_boundary_acknowledged !== true) fail("AG41Z boundary acknowledgement missing.");
if (gate.gate_decision.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("AG56 deferral missing.");
if (gate.gate_decision.proceed_to_ag42b_workflow_defect_review !== true) fail("AG42B readiness missing.");

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
  if (gate.gate_decision[flag] !== false) fail(`${flag} must be false.`);
}

const streams = consumption.consumed_logic.map((x) => x.stream);
for (const stream of [
  "AG06B Content Intelligence Schema",
  "AG23G First Light Topic Scoring",
  "Article Quality Review Preflight",
  "D02 Word of the Day",
  "D05 Panchang/Festival Source Validation",
  "D07 Subscriber Guidance and Personalization",
  "AG27A Backend Need Assessment",
  "AG40-AG41 Dynamic Publishing Planning"
]) {
  if (!streams.includes(stream)) fail(`Missing consumption stream: ${stream}`);
}

if (supersession.status !== "ag41z_first_controlled_batch_boundary_superseded_by_ag42_hardening_plan") fail("Supersession status mismatch.");
if (supersession.supersession_decision.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("Supersession must defer to AG56.");
if (supersession.supersession_decision.ag42_reframed_as_stabilisation_and_hardening !== true) fail("AG42 reframing missing.");
if (supersession.supersession_decision.ag41z_files_not_mutated_by_this_supersession !== true) fail("AG41Z non-mutation note missing.");

if (!rulebook.rules.some((r) => r.includes("Do not recreate topic scoring"))) fail("No-duplicate topic scoring rule missing.");
if (!rulebook.rules.some((r) => r.includes("Do not recreate content-intelligence schema"))) fail("No-duplicate content-intelligence rule missing.");
if (!rulebook.rules.some((r) => r.includes("Do not move controlled dynamic live test before AG56"))) fail("AG56 deferral rule missing.");

if (hardening.next_stage_id !== "AG42B") fail("Hardening entry plan must point to AG42B.");
for (const stage of ["AG42A", "AG42B", "AG42C", "AG42D", "AG42Z"]) {
  if (!hardening.ag42_sequence.some((s) => s.stage_id === stage && s.mutation_allowed === false)) {
    fail(`AG42 sequence missing non-mutating stage ${stage}`);
  }
}

if (readiness.ready_for_ag42b !== true) fail("AG42B readiness missing.");
if (readiness.next_stage_id !== "AG42B") fail("Readiness must point to AG42B.");
if (readiness.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("Readiness must record AG56 deferral.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.backend_activation_allowed_next !== false) fail("Backend activation must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG42B") fail("Boundary must point to AG42B.");
if (review.summary.ready_for_ag42b !== true) fail("Review AG42B readiness missing.");
if (review.summary.first_controlled_dynamic_content_loop_deferred_to_ag56 !== true) fail("Review AG56 deferral missing.");
if (preview.ready_for_ag42b !== 1) fail("Preview AG42B readiness missing.");
if (preview.first_controlled_dynamic_content_loop_deferred_to_ag56 !== 1) fail("Preview AG56 deferral missing.");
if (preview.first_controlled_batch_executed !== 0) fail("Preview first controlled batch must be 0.");
if (preview.candidate_selected_for_execution !== 0) fail("Preview candidate selection must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.backend_activation_approved_now !== 0) fail("Preview backend activation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag42a"]) fail("Missing generate:ag42a script.");
if (!pkg.scripts?.["validate:ag42a"]) fail("Missing validate:ag42a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag42a")) fail("validate:project must include validate:ag42a.");

pass("AG42A Roadmap Reconciliation and Existing-Logic Consumption Gate is present.");
pass("AG41Z first-controlled-batch boundary is acknowledged and superseded by AG42 hardening roadmap.");
pass("First controlled dynamic content-loop test is deferred to AG56.");
pass("Existing repo logic consumption and no-duplicate audit rulebook are valid.");
pass("AG42B Workflow Defect Review readiness is valid.");
pass("No first controlled batch execution, public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
