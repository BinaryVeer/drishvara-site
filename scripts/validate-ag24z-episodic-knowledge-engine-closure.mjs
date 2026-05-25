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
  console.error(`❌ AG24Z validation failed: ${msg}`);
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
  "data/content-intelligence/episodes/ag24h-episode-production-conveyor.json",
  "data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json",
  "data/content-intelligence/quality-registry/ag24i-episodic-knowledge-engine-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24i-to-ag24z-episodic-knowledge-engine-closure-boundary.json",
  "data/content-intelligence/quality-reviews/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  "data/content-intelligence/episodes/ag24z-non-activation-closure-register.json",
  "data/content-intelligence/episodes/ag24z-ag25-featured-reads-handoff-plan.json",
  "data/content-intelligence/episodes/ag24z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag24z-episodic-knowledge-engine-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag24z-featured-reads-production-strengthening-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24z-to-ag25-featured-reads-production-strengthening-boundary.json",
  "data/quality/ag24z-episodic-knowledge-engine-closure.json",
  "data/quality/ag24z-episodic-knowledge-engine-closure-preview.json",
  "docs/quality/AG24Z_EPISODIC_KNOWLEDGE_ENGINE_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag24z-episodic-knowledge-engine-closure.json");
const closure = readJson("data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json");
const sourceChain = readJson("data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json");
const nonActivation = readJson("data/content-intelligence/episodes/ag24z-non-activation-closure-register.json");
const handoff = readJson("data/content-intelligence/episodes/ag24z-ag25-featured-reads-handoff-plan.json");
const consumption = readJson("data/content-intelligence/episodes/ag24z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag24z-episodic-knowledge-engine-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag24z-featured-reads-production-strengthening-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag24z-to-ag25-featured-reads-production-strengthening-boundary.json");
const registry = readJson("data/quality/ag24z-episodic-knowledge-engine-closure.json");
const preview = readJson("data/quality/ag24z-episodic-knowledge-engine-closure-preview.json");
const ag24iReadiness = readJson("data/content-intelligence/quality-registry/ag24i-episodic-knowledge-engine-closure-readiness-record.json");
const ag24iAudit = readJson("data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json");
const pkg = readJson("package.json");

if (review.status !== "episodic_knowledge_engine_closed_ready_for_ag25") fail("Review status mismatch.");
if (closure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (closure.closure_decision.ag24_closed !== true) fail("AG24 must be closed.");
if (closure.closure_decision.ready_for_ag25 !== true) fail("AG25 readiness missing.");
if (closure.closure_decision.next_stage_id !== "AG25") fail("Next stage must be AG25.");
if (closure.closure_decision.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");
if (closure.closure_decision.no_public_mutation_done !== true) fail("No-public-mutation closure missing.");
if (closure.closure_summary.stages_closed !== 9) fail("Closure must cover 9 AG24 stages.");
if (closure.closure_summary.topic_selection_done !== false) fail("Topic selection must remain false.");
if (closure.closure_summary.episode_generation_done !== false) fail("Episode generation must remain false.");
if (closure.closure_summary.article_generation_done !== false) fail("Article generation must remain false.");
if (closure.closure_summary.public_publish_done !== false) fail("Public publish must remain false.");
if (closure.closure_summary.backend_activation_done !== false) fail("Backend activation must remain false.");

if (sourceChain.chain_length !== 9) fail("Source chain must contain 9 stages.");
for (const stage of ["AG24A","AG24B","AG24C","AG24D","AG24E","AG24F","AG24G","AG24H","AG24I"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage: ${stage}`);
}

for (const [k, v] of Object.entries(nonActivation.closure_guards)) {
  if (v !== true) fail(`Non-activation closure guard must be true: ${k}`);
}

if (handoff.next_stage_id !== "AG25") fail("Handoff must point to AG25.");
if (!handoff.handoff_constraints.some((item) => item.includes("must not ignore AG24"))) fail("AG25 handoff must require AG24 source consumption.");
if (!consumption.future_consumption?.AG25) fail("AG25 consumption note missing.");
if (!consumption.future_consumption?.AG27) fail("AG27 Supabase checkpoint note missing.");
if (!consumption.future_consumption?.future_dynamic_site) fail("Future dynamic site note missing.");
if (blocker.status !== "ag24_closed_runtime_operations_blocked_pending_ag25") fail("Blocker status mismatch.");
if (readiness.ready_for_ag25 !== true) fail("AG25 readiness missing.");
if (boundary.next_stage_id !== "AG25") fail("AG25 boundary missing.");
if (ag24iReadiness.ready_for_ag24z !== true) fail("AG24I readiness must allow AG24Z.");
if (ag24iAudit.status !== "episode_quality_audit_created_ready_for_ag24z") fail("AG24I source audit status mismatch.");
if (registry.status !== "episodic_knowledge_engine_closed_ready_for_ag25") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.stages_closed !== 9) fail("Preview must record 9 closed stages.");
if (preview.ready_for_ag25 !== true) fail("Preview must be ready for AG25.");
if (preview.topic_selection_done !== 0) fail("Preview must record 0 topic selection.");
if (preview.generated_episodes !== 0) fail("Preview must record 0 generated episodes.");
if (preview.generated_articles !== 0) fail("Preview must record 0 generated articles.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedStage of ["AG24A","AG24B","AG24C","AG24D","AG24E","AG24F","AG24G","AG24H","AG24I"]) {
  if (!review.depends_on.includes(expectedStage)) fail(`Review dependency missing: ${expectedStage}`);
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "ag24_chain_closed") {
    if (v !== true) fail("ag24_chain_closed must be true.");
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag24z"]) fail("Missing generate:ag24z script.");
if (!pkg.scripts?.["validate:ag24z"]) fail("Missing validate:ag24z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag24z")) fail("validate:project must include validate:ag24z.");

pass("AG24Z Episodic Knowledge Engine Closure is present.");
pass("AG24A-AG24I source chain is closed.");
pass("Non-activation closure and no-publish/no-backend guards are valid.");
pass("AG25 Featured Reads Production Strengthening handoff is ready.");
pass("No topic selection, generation, GitHub write, deployment, publishing or backend activation is enabled.");
