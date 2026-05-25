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
  console.error(`❌ AG25D validation failed: ${msg}`);
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
  "data/content-intelligence/quality-reviews/ag25c-image-credit-attribution-completion.json",
  "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-completion-plan.json",
  "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-worklist.json",
  "data/content-intelligence/quality-registry/ag25c-featured-reads-layout-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25c-to-ag25d-featured-reads-layout-audit-boundary.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/quality-reviews/ag25d-featured-reads-layout-audit.json",
  "data/content-intelligence/featured-reads/ag25d-featured-reads-layout-audit-plan.json",
  "data/content-intelligence/featured-reads/ag25d-layout-readiness-worklist.json",
  "data/content-intelligence/featured-reads/ag25d-card-summary-layout-check-model.json",
  "data/content-intelligence/featured-reads/ag25d-mobile-article-width-audit-model.json",
  "data/content-intelligence/featured-reads/ag25d-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag25d-featured-reads-layout-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag25d-featured-reads-production-readiness-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25d-to-ag25z-featured-reads-production-readiness-closure-boundary.json",
  "data/quality/ag25d-featured-reads-layout-audit.json",
  "data/quality/ag25d-featured-reads-layout-audit-preview.json",
  "docs/quality/AG25D_FEATURED_READS_LAYOUT_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag25d-featured-reads-layout-audit.json");
const plan = readJson("data/content-intelligence/featured-reads/ag25d-featured-reads-layout-audit-plan.json");
const worklist = readJson("data/content-intelligence/featured-reads/ag25d-layout-readiness-worklist.json");
const cardModel = readJson("data/content-intelligence/featured-reads/ag25d-card-summary-layout-check-model.json");
const mobileModel = readJson("data/content-intelligence/featured-reads/ag25d-mobile-article-width-audit-model.json");
const consumption = readJson("data/content-intelligence/featured-reads/ag25d-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag25d-featured-reads-layout-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag25d-featured-reads-production-readiness-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag25d-to-ag25z-featured-reads-production-readiness-closure-boundary.json");
const registry = readJson("data/quality/ag25d-featured-reads-layout-audit.json");
const preview = readJson("data/quality/ag25d-featured-reads-layout-audit-preview.json");
const ag25aInventory = readJson("data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "featured_reads_layout_audit_created_ready_for_ag25z") fail("Review status mismatch.");
if (plan.status !== "featured_reads_layout_audit_created_ready_for_ag25z") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.audit_scope.next_stage !== "AG25Z") fail("Next stage must be AG25Z.");
if (plan.runtime_layout_check_allowed_in_ag25d !== false) fail("Runtime layout check must be blocked.");
if (plan.article_file_mutation_allowed_in_ag25d !== false) fail("Article mutation must be blocked.");
if (plan.layout_change_allowed_in_ag25d !== false) fail("Layout change must be blocked.");
if (plan.card_change_allowed_in_ag25d !== false) fail("Card change must be blocked.");
if (plan.summary_change_allowed_in_ag25d !== false) fail("Summary change must be blocked.");
if (plan.css_change_allowed_in_ag25d !== false) fail("CSS change must be blocked.");
if (plan.publication_allowed_in_ag25d !== false) fail("Publication must be blocked.");
if (plan.deployment_allowed_in_ag25d !== false) fail("Deployment must be blocked.");
if (plan.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (worklist.status !== "layout_readiness_worklist_created_ready_for_ag25z") fail("Worklist status mismatch.");
if (worklist.total_work_items !== worklist.work_items.length) fail("Worklist item count mismatch.");
if (worklist.total_work_items !== ag25aInventory.total_article_files_scanned) fail("Layout worklist must map AG25A scanned articles.");
if (worklist.runtime_layout_check_performed !== false) fail("Runtime layout check must be false.");
if (worklist.article_mutation_performed !== false) fail("Article mutation must be false.");
if (worklist.layout_mutation_performed !== false) fail("Layout mutation must be false.");

if (cardModel.status !== "card_summary_layout_check_model_created_no_card_mutation") fail("Card model status mismatch.");
if (cardModel.card_mutation_allowed !== false) fail("Card mutation must be blocked.");
if (!cardModel.required_future_card_fields.includes("summary_or_description")) fail("summary_or_description field missing.");

if (mobileModel.status !== "mobile_article_width_audit_model_created_no_layout_mutation") fail("Mobile model status mismatch.");
if (mobileModel.runtime_layout_check_enabled !== false) fail("Runtime layout check must be disabled.");
if (mobileModel.css_mutation_allowed !== false) fail("CSS mutation must be blocked.");
if (!mobileModel.future_manual_check_fields.includes("mobile_layout_status")) fail("mobile_layout_status field missing.");

if (!consumption.future_consumption?.AG25Z) fail("AG25Z consumption note missing.");
if (!consumption.future_consumption?.AG26A) fail("AG26A consumption note missing.");
if (blocker.status !== "featured_reads_layout_audit_operations_blocked_pending_ag25z") fail("Blocker status mismatch.");
if (readiness.ready_for_ag25z !== true) fail("AG25Z readiness missing.");
if (boundary.next_stage_id !== "AG25Z") fail("AG25Z boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.featured_reads_layout_audit_created !== true) fail("Summary missing.");
if (review.summary.ready_for_ag25z !== true) fail("AG25Z readiness summary missing.");
if (review.summary.runtime_layout_check_done !== false) fail("Runtime layout check must remain false.");
if (review.summary.article_file_mutation_done !== false) fail("Article mutation must remain false.");
if (review.summary.layout_change_done !== false) fail("Layout change must remain false.");
if (review.summary.card_change_done !== false) fail("Card change must remain false.");
if (review.summary.summary_change_done !== false) fail("Summary change must remain false.");
if (review.summary.css_change_done !== false) fail("CSS change must remain false.");
if (review.summary.public_mutation_done !== false) fail("Public mutation must remain false.");
if (review.summary.deployment_done !== false) fail("Deployment must remain false.");
if (review.summary.publishing_done !== false) fail("Publishing must remain false.");
if (review.summary.backend_activation_done !== false) fail("Backend activation must remain false.");

if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (registry.status !== "featured_reads_layout_audit_created_ready_for_ag25z") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.runtime_layout_checks !== 0) fail("Preview must record 0 runtime layout checks.");
if (preview.mutated_articles !== 0) fail("Preview must record 0 mutated articles.");
if (preview.layout_changes !== 0) fail("Preview must record 0 layout changes.");
if (preview.card_changes !== 0) fail("Preview must record 0 card changes.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json",
  "data/content-intelligence/featured-reads/ag25c-image-credit-attribution-worklist.json",
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

if (!pkg.scripts?.["generate:ag25d"]) fail("Missing generate:ag25d script.");
if (!pkg.scripts?.["validate:ag25d"]) fail("Missing validate:ag25d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag25d")) fail("validate:project must include validate:ag25d.");

pass("AG25D Featured Reads Layout Audit is present.");
pass("Layout readiness worklist, card model and mobile width audit model are valid.");
pass("AG25A inventory, AG25B references and AG25C attribution records are consumed.");
pass("AG25Z Featured Reads Production Readiness Closure boundary is ready.");
pass("No article mutation, layout change, card change, GitHub write, deployment, publishing or backend activation is enabled.");
