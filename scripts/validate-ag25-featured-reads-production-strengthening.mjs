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
  console.error(`❌ AG25 validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  "data/content-intelligence/episodes/ag24z-ag25-featured-reads-handoff-plan.json",
  "data/content-intelligence/quality-registry/ag24z-featured-reads-production-strengthening-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag24z-to-ag25-featured-reads-production-strengthening-boundary.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  "data/content-intelligence/quality-reviews/ag25-featured-reads-production-strengthening.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-control-model.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  "data/content-intelligence/featured-reads/ag25-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag25-featured-reads-production-strengthening-blocker-register.json",
  "data/content-intelligence/quality-registry/ag25-admin-editor-manual-workflow-strengthening-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25-to-ag26-admin-editor-manual-workflow-strengthening-boundary.json",
  "data/quality/ag25-featured-reads-production-strengthening.json",
  "data/quality/ag25-featured-reads-production-strengthening-preview.json",
  "docs/quality/AG25_FEATURED_READS_PRODUCTION_STRENGTHENING.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag25-featured-reads-production-strengthening.json");
const plan = readJson("data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json");
const sourceGate = readJson("data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json");
const production = readJson("data/content-intelligence/featured-reads/ag25-featured-reads-production-control-model.json");
const quality = readJson("data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json");
const consumption = readJson("data/content-intelligence/featured-reads/ag25-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag25-featured-reads-production-strengthening-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag25-admin-editor-manual-workflow-strengthening-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag25-to-ag26-admin-editor-manual-workflow-strengthening-boundary.json");
const registry = readJson("data/quality/ag25-featured-reads-production-strengthening.json");
const preview = readJson("data/quality/ag25-featured-reads-production-strengthening-preview.json");
const ag24z = readJson("data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json");
const ag24zReadiness = readJson("data/content-intelligence/quality-registry/ag24z-featured-reads-production-strengthening-readiness-record.json");
const pkg = readJson("package.json");

if (review.status !== "featured_reads_production_strengthening_created_ready_for_ag26") fail("Review status mismatch.");
if (plan.status !== "featured_reads_production_strengthening_created_ready_for_ag26") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.strengthening_scope.next_stage !== "AG26") fail("Next stage must be AG26.");
if (plan.featured_read_generation_allowed_in_ag25 !== false) fail("Featured Read generation must be blocked.");
if (plan.publication_allowed_in_ag25 !== false) fail("Publication must be blocked.");
if (plan.public_visibility_default !== false) fail("Public visibility default must be false.");
if (plan.publish_approved_default !== false) fail("Publish approved default must be false.");
if (plan.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (sourceGate.target_verified_references_per_featured_read !== 2) fail("Two-reference target missing.");
if (sourceGate.runtime_reference_fetch_enabled !== false) fail("Runtime reference fetch must be disabled.");
if (!sourceGate.blocked_reference_conditions.includes("invented citation")) fail("Invented citation block missing.");

if (production.generation_allowed_in_ag25 !== false) fail("Generation must be blocked.");
if (production.image_generation_allowed_in_ag25 !== false) fail("Image generation must be blocked.");
if (production.article_file_creation_allowed_in_ag25 !== false) fail("Article file creation must be blocked.");
if (production.github_write_allowed_in_ag25 !== false) fail("GitHub write must be blocked.");
if (production.deploy_allowed_in_ag25 !== false) fail("Deploy must be blocked.");
if (production.publish_allowed_in_ag25 !== false) fail("Publish must be blocked.");

if (quality.public_mutation_allowed !== false) fail("Public mutation must be blocked.");
if (!quality.quality_checks.includes("source-claim alignment")) fail("Source-claim alignment quality check missing.");
if (!quality.quality_checks.includes("cost-control gate before generation")) fail("Cost-control quality check missing.");

if (!consumption.future_consumption?.AG26) fail("AG26 consumption note missing.");
if (!consumption.future_consumption?.AG27) fail("AG27 consumption note missing.");
if (!consumption.future_consumption?.future_dynamic_site) fail("Future dynamic site note missing.");
if (blocker.status !== "featured_reads_operations_blocked_pending_ag26") fail("Blocker status mismatch.");
if (readiness.ready_for_ag26 !== true) fail("AG26 readiness missing.");
if (boundary.next_stage_id !== "AG26") fail("AG26 boundary missing.");

if (review.summary.ag24z_consumed !== true) fail("AG24Z consumption summary missing.");
if (review.summary.ready_for_ag26 !== true) fail("AG26 readiness summary missing.");
if (review.summary.featured_read_generation_done !== false) fail("Featured Read generation must remain false.");
if (review.summary.article_file_creation_done !== false) fail("Article file creation must remain false.");
if (review.summary.public_mutation_done !== false) fail("Public mutation must remain false.");
if (review.summary.backend_activation_done !== false) fail("Backend activation must remain false.");

if (ag24z.closure_decision.ready_for_ag25 !== true) fail("AG24Z must allow AG25.");
if (ag24zReadiness.ready_for_ag25 !== true) fail("AG24Z readiness must allow AG25.");
if (registry.status !== "featured_reads_production_strengthening_created_ready_for_ag26") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.generated_featured_reads !== 0) fail("Preview must record 0 generated Featured Reads.");
if (preview.generated_articles !== 0) fail("Preview must record 0 generated articles.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  "data/content-intelligence/episodes/ag24z-ag25-featured-reads-handoff-plan.json",
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  "data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag25"]) fail("Missing generate:ag25 script.");
if (!pkg.scripts?.["validate:ag25"]) fail("Missing validate:ag25 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag25")) fail("validate:project must include validate:ag25.");

pass("AG25 Featured Reads Production Strengthening is present.");
pass("Source/reference gate, production control and quality strengthening models are valid.");
pass("AG24Z closure and AG24/AG23 governance records are consumed.");
pass("AG26 Admin/Editor Manual Workflow Strengthening boundary is ready.");
pass("No Featured Read generation, article file creation, GitHub write, deployment, publishing or backend activation is enabled.");
