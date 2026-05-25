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
  console.error(`❌ AG25C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag25a-featured-reads-inventory-gap-audit.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json",
  "data/content-intelligence/quality-reviews/ag25b-reference-verification-strengthening.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json",
  "data/content-intelligence/quality-registry/ag25b-image-credit-attribution-completion-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25b-to-ag25c-image-credit-attribution-completion-boundary.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/quality-reviews/ag25c-image-credit-attribution-completion.json",
  "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-completion-plan.json",
  "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-worklist.json",
  "data/content-intelligence/featured-reads/ag25c-attribution-status-schema.json",
  "data/content-intelligence/featured-reads/ag25c-object-credit-priority-register.json",
  "data/content-intelligence/featured-reads/ag25c-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag25c-image-credit-attribution-completion-blocker-register.json",
  "data/content-intelligence/quality-registry/ag25c-featured-reads-layout-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25c-to-ag25d-featured-reads-layout-audit-boundary.json",
  "data/quality/ag25c-image-credit-attribution-completion.json",
  "data/quality/ag25c-image-credit-attribution-completion-preview.json",
  "docs/quality/AG25C_IMAGE_CREDIT_ATTRIBUTION_COMPLETION.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag25c-image-credit-attribution-completion.json");
const plan = readJson("data/content-intelligence/featured-reads/ag25c-image-credit-attribution-completion-plan.json");
const worklist = readJson("data/content-intelligence/featured-reads/ag25c-image-credit-attribution-worklist.json");
const schema = readJson("data/content-intelligence/featured-reads/ag25c-attribution-status-schema.json");
const priority = readJson("data/content-intelligence/featured-reads/ag25c-object-credit-priority-register.json");
const consumption = readJson("data/content-intelligence/featured-reads/ag25c-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag25c-image-credit-attribution-completion-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag25c-featured-reads-layout-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag25c-to-ag25d-featured-reads-layout-audit-boundary.json");
const registry = readJson("data/quality/ag25c-image-credit-attribution-completion.json");
const preview = readJson("data/quality/ag25c-image-credit-attribution-completion-preview.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "image_credit_attribution_completion_created_ready_for_ag25d") fail("Review status mismatch.");
if (plan.status !== "image_credit_attribution_completion_created_ready_for_ag25d") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.completion_scope.next_stage !== "AG25D") fail("Next stage must be AG25D.");
if (plan.runtime_attribution_check_allowed_in_ag25c !== false) fail("Runtime attribution check must be blocked.");
if (plan.article_file_mutation_allowed_in_ag25c !== false) fail("Article mutation must be blocked.");
if (plan.image_file_mutation_allowed_in_ag25c !== false) fail("Image mutation must be blocked.");
if (plan.image_generation_allowed_in_ag25c !== false) fail("Image generation must be blocked.");
if (plan.layout_change_allowed_in_ag25c !== false) fail("Layout change must be blocked.");
if (plan.publication_allowed_in_ag25c !== false) fail("Publication must be blocked.");
if (plan.deployment_allowed_in_ag25c !== false) fail("Deployment must be blocked.");
if (plan.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (worklist.status !== "image_credit_attribution_worklist_created_ready_for_ag25d") fail("Worklist status mismatch.");
if (worklist.total_work_items !== worklist.work_items.length) fail("Worklist item count mismatch.");
if (worklist.runtime_attribution_check_performed !== false) fail("Runtime attribution check must be false.");
if (worklist.article_mutation_performed !== false) fail("Article mutation must be false.");
if (worklist.image_mutation_performed !== false) fail("Image mutation must be false.");

if (schema.status !== "attribution_status_schema_created_no_runtime") fail("Attribution schema status mismatch.");
if (schema.runtime_attribution_check_enabled !== false) fail("Runtime attribution schema must be disabled.");
if (!schema.allowed_statuses.includes("source_unknown_under_editorial_verification")) fail("Editorial verification attribution status missing.");
if (!schema.required_future_fields.includes("credit_text")) fail("credit_text field missing.");
if (!schema.required_future_fields.includes("licence_or_usage_note")) fail("licence_or_usage_note field missing.");

if (priority.total_object_articles !== worklist.total_work_items) fail("Priority total must equal worklist total.");
if (priority.high_priority_count + priority.medium_priority_count + priority.low_priority_count !== priority.total_object_articles) fail("Priority counts mismatch.");

if (!consumption.future_consumption?.AG25D) fail("AG25D consumption note missing.");
if (!consumption.future_consumption?.AG25Z) fail("AG25Z consumption note missing.");
if (blocker.status !== "image_credit_attribution_operations_blocked_pending_ag25d") fail("Blocker status mismatch.");
if (readiness.ready_for_ag25d !== true) fail("AG25D readiness missing.");
if (boundary.next_stage_id !== "AG25D") fail("AG25D boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.image_credit_attribution_completion_created !== true) fail("Summary missing.");
if (review.summary.ready_for_ag25d !== true) fail("AG25D readiness summary missing.");
if (review.summary.runtime_attribution_check_done !== false) fail("Runtime attribution check must remain false.");
if (review.summary.article_file_mutation_done !== false) fail("Article mutation must remain false.");
if (review.summary.image_file_mutation_done !== false) fail("Image mutation must remain false.");
if (review.summary.image_generation_done !== false) fail("Image generation must remain false.");
if (review.summary.layout_change_done !== false) fail("Layout change must remain false.");
if (review.summary.public_mutation_done !== false) fail("Public mutation must remain false.");
if (review.summary.deployment_done !== false) fail("Deployment must remain false.");
if (review.summary.publishing_done !== false) fail("Publishing must remain false.");
if (review.summary.backend_activation_done !== false) fail("Backend activation must remain false.");

if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (registry.status !== "image_credit_attribution_completion_created_ready_for_ag25d") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.runtime_attribution_checks !== 0) fail("Preview must record 0 runtime attribution checks.");
if (preview.mutated_articles !== 0) fail("Preview must record 0 mutated articles.");
if (preview.mutated_images !== 0) fail("Preview must record 0 mutated images.");
if (preview.layout_changes !== 0) fail("Preview must record 0 layout changes.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json",
  "data/content-intelligence/quality-reviews/ag25b-reference-verification-strengthening.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag25c"]) fail("Missing generate:ag25c script.");
if (!pkg.scripts?.["validate:ag25c"]) fail("Missing validate:ag25c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag25c")) fail("validate:project must include validate:ag25c.");

pass("AG25C Image Credit and Attribution Completion is present.");
pass("Image/object credit worklist, attribution schema and priority register are valid.");
pass("AG25A inventory and AG25B reference strengthening records are consumed.");
pass("AG25D Featured Reads Layout Audit boundary is ready.");
pass("No article mutation, image mutation, layout change, GitHub write, deployment, publishing or backend activation is enabled.");
