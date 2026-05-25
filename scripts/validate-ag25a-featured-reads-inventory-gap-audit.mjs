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
  console.error(`❌ AG25A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/quality-reviews/ag25a-featured-reads-inventory-gap-audit.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-gap-audit.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json",
  "data/content-intelligence/featured-reads/ag25a-category-card-summary-inventory.json",
  "data/content-intelligence/featured-reads/ag25a-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag25a-featured-reads-inventory-gap-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag25a-reference-verification-strengthening-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25a-to-ag25b-reference-verification-strengthening-boundary.json",
  "data/quality/ag25a-featured-reads-inventory-gap-audit.json",
  "data/quality/ag25a-featured-reads-inventory-gap-audit-preview.json",
  "docs/quality/AG25A_FEATURED_READS_INVENTORY_GAP_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag25a-featured-reads-inventory-gap-audit.json");
const audit = readJson("data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-gap-audit.json");
const inventory = readJson("data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json");
const gaps = readJson("data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json");
const categorySummary = readJson("data/content-intelligence/featured-reads/ag25a-category-card-summary-inventory.json");
const consumption = readJson("data/content-intelligence/featured-reads/ag25a-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag25a-featured-reads-inventory-gap-audit-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag25a-reference-verification-strengthening-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag25a-to-ag25b-reference-verification-strengthening-boundary.json");
const registry = readJson("data/quality/ag25a-featured-reads-inventory-gap-audit.json");
const preview = readJson("data/quality/ag25a-featured-reads-inventory-gap-audit-preview.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "featured_reads_inventory_gap_audit_created_ready_for_ag25b") fail("Review status mismatch.");
if (audit.status !== "featured_reads_inventory_gap_audit_created_ready_for_ag25b") fail("Audit status mismatch.");
if (audit.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (audit.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (audit.audit_scope.next_stage !== "AG25B") fail("Next stage must be AG25B.");
if (audit.article_file_mutation_allowed_in_ag25a !== false) fail("Article mutation must be blocked.");
if (audit.reference_verification_runtime_allowed_in_ag25a !== false) fail("Runtime reference verification must be blocked.");
if (audit.public_mutation_allowed_in_ag25a !== false) fail("Public mutation must be blocked.");
if (audit.publication_allowed_in_ag25a !== false) fail("Publication must be blocked.");
if (audit.deployment_allowed_in_ag25a !== false) fail("Deployment must be blocked.");
if (audit.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (inventory.status !== "featured_reads_inventory_created_no_mutation") fail("Inventory status mismatch.");
if (!Array.isArray(inventory.articles)) fail("Inventory articles must be an array.");
if (inventory.total_article_files_scanned !== inventory.articles.length) fail("Inventory article count mismatch.");
if (categorySummary.status !== "category_card_summary_inventory_created_no_public_mutation") fail("Category/card summary status mismatch.");
if (categorySummary.category_count !== categorySummary.categories.length) fail("Category count mismatch.");

if (gaps.status !== "featured_reads_gap_register_created_ready_for_ag25b") fail("Gap register status mismatch.");
if (gaps.total_articles_with_gaps !== gaps.gap_items.length) fail("Gap item count mismatch.");
const computedGapCount = gaps.gap_items.reduce((sum, item) => sum + item.gap_count, 0);
if (gaps.total_gap_count !== computedGapCount) fail("Total gap count mismatch.");

if (!consumption.future_consumption?.AG25B) fail("AG25B consumption note missing.");
if (!consumption.future_consumption?.AG25C) fail("AG25C consumption note missing.");
if (!consumption.future_consumption?.AG25D) fail("AG25D consumption note missing.");
if (!consumption.future_consumption?.AG25Z) fail("AG25Z consumption note missing.");
if (blocker.status !== "featured_reads_inventory_gap_operations_blocked_pending_ag25b") fail("Blocker status mismatch.");
if (readiness.ready_for_ag25b !== true) fail("AG25B readiness missing.");
if (boundary.next_stage_id !== "AG25B") fail("AG25B boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.inventory_gap_audit_created !== true) fail("Inventory audit summary missing.");
if (review.summary.ready_for_ag25b !== true) fail("AG25B readiness summary missing.");
if (review.summary.article_file_mutation_done !== false) fail("Article mutation must remain false.");
if (review.summary.public_mutation_done !== false) fail("Public mutation must remain false.");
if (review.summary.deployment_done !== false) fail("Deployment must remain false.");
if (review.summary.publishing_done !== false) fail("Publishing must remain false.");
if (review.summary.backend_activation_done !== false) fail("Backend activation must remain false.");

if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (registry.status !== "featured_reads_inventory_gap_audit_created_ready_for_ag25b") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.mutated_articles !== 0) fail("Preview must record 0 mutated articles.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/episodes/ag24z-ag24-source-chain-register.json",
  "data/content-intelligence/episodes/ag24z-ag25-featured-reads-handoff-plan.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-quality-strengthening-model.json",
  "data/content-intelligence/admin-editor/ag26-admin-editor-manual-workflow-strengthening-plan.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!audit.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Audit did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag25a"]) fail("Missing generate:ag25a script.");
if (!pkg.scripts?.["validate:ag25a"]) fail("Missing validate:ag25a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag25a")) fail("validate:project must include validate:ag25a.");

pass("AG25A Featured Reads Inventory and Gap Audit is present.");
pass("Inventory, gap register and category/card summary are valid.");
pass("AG24Z, AG25 umbrella, AG26 umbrella and AG27 backend-defer records are consumed.");
pass("AG25B Reference Verification Strengthening boundary is ready.");
pass("No article mutation, public mutation, GitHub write, deployment, publishing or backend activation is enabled.");
