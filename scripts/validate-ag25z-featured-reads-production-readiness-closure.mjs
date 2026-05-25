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
  console.error(`❌ AG25Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-gap-audit.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json",
  "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-completion-plan.json",
  "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-worklist.json",
  "data/content-intelligence/featured-reads/ag25d-featured-reads-layout-audit-plan.json",
  "data/content-intelligence/featured-reads/ag25d-layout-readiness-worklist.json",
  "data/content-intelligence/quality-registry/ag25d-featured-reads-production-readiness-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25d-to-ag25z-featured-reads-production-readiness-closure-boundary.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/quality-reviews/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  "data/content-intelligence/featured-reads/ag25z-ag25-detailed-source-chain-register.json",
  "data/content-intelligence/featured-reads/ag25z-featured-reads-readiness-matrix.json",
  "data/content-intelligence/featured-reads/ag25z-unresolved-featured-reads-work-register.json",
  "data/content-intelligence/featured-reads/ag25z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag25z-featured-reads-production-readiness-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag25z-editor-workspace-ux-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25z-to-ag26a-editor-workspace-ux-plan-boundary.json",
  "data/quality/ag25z-featured-reads-production-readiness-closure.json",
  "data/quality/ag25z-featured-reads-production-readiness-closure-preview.json",
  "docs/quality/AG25Z_FEATURED_READS_PRODUCTION_READINESS_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag25z-featured-reads-production-readiness-closure.json");
const closure = readJson("data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json");
const sourceChain = readJson("data/content-intelligence/featured-reads/ag25z-ag25-detailed-source-chain-register.json");
const readinessMatrix = readJson("data/content-intelligence/featured-reads/ag25z-featured-reads-readiness-matrix.json");
const unresolved = readJson("data/content-intelligence/featured-reads/ag25z-unresolved-featured-reads-work-register.json");
const consumption = readJson("data/content-intelligence/featured-reads/ag25z-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag25z-featured-reads-production-readiness-closure-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag25z-editor-workspace-ux-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag25z-to-ag26a-editor-workspace-ux-plan-boundary.json");
const registry = readJson("data/quality/ag25z-featured-reads-production-readiness-closure.json");
const preview = readJson("data/quality/ag25z-featured-reads-production-readiness-closure-preview.json");
const ag25dReadiness = readJson("data/content-intelligence/quality-registry/ag25d-featured-reads-production-readiness-closure-readiness-record.json");
const ag25dPlan = readJson("data/content-intelligence/featured-reads/ag25d-featured-reads-layout-audit-plan.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") fail("Review status mismatch.");
if (closure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") fail("Closure status mismatch.");
if (closure.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (closure.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (closure.closure_decision.ag25_detailed_chain_closed !== true) fail("AG25 detailed chain must be closed.");
if (closure.closure_decision.ready_for_ag26a !== true) fail("AG26A readiness missing.");
if (closure.closure_decision.next_stage_id !== "AG26A") fail("Next stage must be AG26A.");
if (closure.closure_decision.publication_ready !== false) fail("Publication readiness must be false.");
if (closure.closure_decision.deployment_ready !== false) fail("Deployment readiness must be false.");
if (closure.closure_decision.backend_activation_ready !== false) fail("Backend readiness must be false.");
if (closure.closure_decision.no_public_mutation_done !== true) fail("No public mutation closure missing.");
if (closure.closure_decision.no_runtime_activation_done !== true) fail("No runtime activation closure missing.");

if (sourceChain.chain_length !== 4) fail("AG25 detailed source chain must contain 4 stages.");
for (const stage of ["AG25A", "AG25B", "AG25C", "AG25D"]) {
  if (!sourceChain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage: ${stage}`);
}

if (readinessMatrix.closure_readiness.ready_for_editor_workspace_ux_plan !== true) fail("Editor workspace readiness missing.");
if (readinessMatrix.closure_readiness.ready_for_publication !== false) fail("Publication readiness must remain false.");
if (readinessMatrix.closure_readiness.ready_for_deployment !== false) fail("Deployment readiness must remain false.");
if (readinessMatrix.closure_readiness.ready_for_backend_activation !== false) fail("Backend readiness must remain false.");
if (readinessMatrix.references.runtime_link_check_performed !== false) fail("Runtime link check must remain false.");
if (readinessMatrix.attribution.runtime_attribution_check_performed !== false) fail("Runtime attribution check must remain false.");
if (readinessMatrix.layout.runtime_layout_check_performed !== false) fail("Runtime layout check must remain false.");

if (unresolved.status !== "unresolved_featured_reads_work_registered_for_ag26a") fail("Unresolved register status mismatch.");
if (unresolved.unresolved_publication_status !== "not_ready_for_publication") fail("Unresolved publication status must be not ready.");
if (!unresolved.carry_forward_to_ag26a.some((item) => item.includes("reference status"))) fail("Reference carry-forward missing.");
if (!unresolved.carry_forward_to_ag26a.some((item) => item.includes("image credit"))) fail("Attribution carry-forward missing.");
if (!unresolved.carry_forward_to_ag26a.some((item) => item.includes("card/summary/layout"))) fail("Layout carry-forward missing.");

if (!consumption.future_consumption?.AG26A) fail("AG26A consumption note missing.");
if (!consumption.future_consumption?.AG26B) fail("AG26B consumption note missing.");
if (!consumption.future_consumption?.AG26C) fail("AG26C consumption note missing.");
if (!consumption.future_consumption?.AG26D) fail("AG26D consumption note missing.");
if (!consumption.future_consumption?.AG26Z) fail("AG26Z consumption note missing.");

if (blocker.status !== "ag25_closed_runtime_operations_blocked_pending_ag26a") fail("Blocker status mismatch.");
if (readiness.ready_for_ag26a !== true) fail("AG26A readiness missing.");
if (boundary.next_stage_id !== "AG26A") fail("AG26A boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.featured_reads_production_readiness_closed !== true) fail("Review closure summary missing.");
if (review.summary.ag25_detailed_chain_closed !== true) fail("Detailed chain closure summary missing.");
if (review.summary.detailed_stages_closed !== 4) fail("Detailed closed stages must be 4.");
if (review.summary.ready_for_ag26a !== true) fail("AG26A readiness summary missing.");
if (review.summary.publication_ready !== false) fail("Publication readiness must remain false.");
if (review.summary.deployment_ready !== false) fail("Deployment readiness must remain false.");
if (review.summary.backend_activation_ready !== false) fail("Backend readiness must remain false.");
if (review.summary.generated_featured_reads !== false) fail("Featured Read generation must remain false.");
if (review.summary.article_file_mutation_done !== false) fail("Article mutation must remain false.");
if (review.summary.public_mutation_done !== false) fail("Public mutation must remain false.");
if (review.summary.deployment_done !== false) fail("Deployment must remain false.");
if (review.summary.publishing_done !== false) fail("Publishing must remain false.");
if (review.summary.backend_activation_done !== false) fail("Backend activation must remain false.");

if (ag25dReadiness.ready_for_ag25z !== true) fail("AG25D readiness must allow AG25Z.");
if (ag25dPlan.status !== "featured_reads_layout_audit_created_ready_for_ag25z") fail("AG25D source plan status mismatch.");
if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (registry.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.detailed_stages_closed !== 4) fail("Preview must record 4 closed stages.");
if (preview.ready_for_ag26a !== true) fail("Preview must be ready for AG26A.");
if (preview.publication_ready !== 0) fail("Preview must record 0 publication readiness.");
if (preview.deployment_ready !== 0) fail("Preview must record 0 deployment readiness.");
if (preview.generated_featured_reads !== 0) fail("Preview must record 0 generated Featured Reads.");
if (preview.mutated_articles !== 0) fail("Preview must record 0 mutated articles.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-gap-audit.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-completion-plan.json",
  "data/content-intelligence/featured-reads/ag25d-featured-reads-layout-audit-plan.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!closure.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Closure did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (k === "ag25_detailed_chain_closed") {
    if (v !== true) fail("ag25_detailed_chain_closed must be true.");
  } else if (v !== false) {
    fail(`Blocked state must remain false: ${k}`);
  }
}

if (!pkg.scripts?.["generate:ag25z"]) fail("Missing generate:ag25z script.");
if (!pkg.scripts?.["validate:ag25z"]) fail("Missing validate:ag25z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag25z")) fail("validate:project must include validate:ag25z.");

pass("AG25Z Featured Reads Production Readiness Closure is present.");
pass("AG25A-AG25D detailed chain is closed.");
pass("Readiness matrix and unresolved work register are valid.");
pass("AG26A Editor Workspace UX Plan boundary is ready.");
pass("No Featured Read generation, article mutation, public mutation, GitHub write, deployment, publishing or backend activation is enabled.");
