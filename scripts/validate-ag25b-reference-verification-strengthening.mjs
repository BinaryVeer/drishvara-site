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
  console.error(`❌ AG25B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/quality-reviews/ag25a-featured-reads-inventory-gap-audit.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-gap-audit.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json",
  "data/content-intelligence/quality-registry/ag25a-reference-verification-strengthening-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25a-to-ag25b-reference-verification-strengthening-boundary.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  "data/content-intelligence/quality-reviews/ag25b-reference-verification-strengthening.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json",
  "data/content-intelligence/featured-reads/ag25b-reference-status-schema.json",
  "data/content-intelligence/featured-reads/ag25b-reference-priority-register.json",
  "data/content-intelligence/featured-reads/ag25b-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag25b-reference-verification-strengthening-blocker-register.json",
  "data/content-intelligence/quality-registry/ag25b-image-credit-attribution-completion-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag25b-to-ag25c-image-credit-attribution-completion-boundary.json",
  "data/quality/ag25b-reference-verification-strengthening.json",
  "data/quality/ag25b-reference-verification-strengthening-preview.json",
  "docs/quality/AG25B_REFERENCE_VERIFICATION_STRENGTHENING.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag25b-reference-verification-strengthening.json");
const plan = readJson("data/content-intelligence/featured-reads/ag25b-reference-verification-strengthening-plan.json");
const worklist = readJson("data/content-intelligence/featured-reads/ag25b-reference-verification-worklist.json");
const schema = readJson("data/content-intelligence/featured-reads/ag25b-reference-status-schema.json");
const priority = readJson("data/content-intelligence/featured-reads/ag25b-reference-priority-register.json");
const consumption = readJson("data/content-intelligence/featured-reads/ag25b-future-consumption-plan.json");
const blocker = readJson("data/content-intelligence/quality-registry/ag25b-reference-verification-strengthening-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag25b-image-credit-attribution-completion-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag25b-to-ag25c-image-credit-attribution-completion-boundary.json");
const registry = readJson("data/quality/ag25b-reference-verification-strengthening.json");
const preview = readJson("data/quality/ag25b-reference-verification-strengthening-preview.json");
const ag25aInventory = readJson("data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json");
const ag27 = readJson("data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json");
const pkg = readJson("package.json");

if (review.status !== "reference_verification_strengthening_created_ready_for_ag25c") fail("Review status mismatch.");
if (plan.status !== "reference_verification_strengthening_created_ready_for_ag25c") fail("Plan status mismatch.");
if (plan.created_by !== "vikash vaibhav") fail("created_by must be vikash vaibhav.");
if (plan.contact_email !== "dwivedi.vikash.vaibhav@gmail.com") fail("contact_email mismatch.");
if (plan.strengthening_scope.next_stage !== "AG25C") fail("Next stage must be AG25C.");
if (plan.runtime_reference_fetch_allowed_in_ag25b !== false) fail("Runtime reference fetch must be blocked.");
if (plan.external_link_check_allowed_in_ag25b !== false) fail("External link check must be blocked.");
if (plan.article_file_mutation_allowed_in_ag25b !== false) fail("Article mutation must be blocked.");
if (plan.publication_allowed_in_ag25b !== false) fail("Publication must be blocked.");
if (plan.deployment_allowed_in_ag25b !== false) fail("Deployment must be blocked.");
if (plan.supabase_auth_backend_deferred !== true) fail("Supabase/Auth/backend must remain deferred.");

if (worklist.status !== "reference_verification_worklist_created_ready_for_ag25c") fail("Worklist status mismatch.");
if (worklist.total_work_items !== worklist.work_items.length) fail("Worklist item count mismatch.");
if (worklist.total_work_items !== ag25aInventory.total_article_files_scanned) fail("Worklist must map AG25A scanned articles.");
if (worklist.runtime_link_check_performed !== false) fail("Runtime link check must be false.");
if (worklist.article_mutation_performed !== false) fail("Article mutation must be false.");

if (schema.target_verified_references_per_featured_read !== 2) fail("Reference target must be 2.");
if (schema.runtime_fetch_enabled !== false) fail("Runtime fetch must be disabled.");
if (!schema.blocked_reference_conditions.includes("invented citation")) fail("Invented citation block missing.");
if (!schema.allowed_statuses.includes("under_editorial_verification")) fail("under_editorial_verification status missing.");

if (priority.total_articles !== worklist.total_work_items) fail("Priority total must equal worklist total.");
if (priority.high_priority_count + priority.medium_priority_count + priority.low_priority_count !== priority.total_articles) fail("Priority counts mismatch.");

if (!consumption.future_consumption?.AG25C) fail("AG25C consumption note missing.");
if (!consumption.future_consumption?.AG25D) fail("AG25D consumption note missing.");
if (!consumption.future_consumption?.AG25Z) fail("AG25Z consumption note missing.");
if (blocker.status !== "reference_verification_operations_blocked_pending_ag25c") fail("Blocker status mismatch.");
if (readiness.ready_for_ag25c !== true) fail("AG25C readiness missing.");
if (boundary.next_stage_id !== "AG25C") fail("AG25C boundary missing.");
if (boundary.supabase_auth_backend_deferred !== true) fail("Boundary must keep backend deferred.");

if (review.summary.reference_verification_strengthening_created !== true) fail("Summary missing.");
if (review.summary.ready_for_ag25c !== true) fail("AG25C readiness summary missing.");
if (review.summary.runtime_reference_fetch_done !== false) fail("Runtime reference fetch must remain false.");
if (review.summary.external_link_check_done !== false) fail("External link check must remain false.");
if (review.summary.article_file_mutation_done !== false) fail("Article mutation must remain false.");
if (review.summary.public_mutation_done !== false) fail("Public mutation must remain false.");
if (review.summary.deployment_done !== false) fail("Deployment must remain false.");
if (review.summary.publishing_done !== false) fail("Publishing must remain false.");
if (review.summary.backend_activation_done !== false) fail("Backend activation must remain false.");

if (ag27.checkpoint_decision.backend_deferred !== true) fail("AG27 backend deferral must remain true.");
if (registry.status !== "reference_verification_strengthening_created_ready_for_ag25c") fail("Registry status mismatch.");
if (preview.preview_only !== true) fail("Preview must remain preview_only.");
if (preview.runtime_reference_fetches !== 0) fail("Preview must record 0 runtime reference fetches.");
if (preview.external_link_checks !== 0) fail("Preview must record 0 external link checks.");
if (preview.mutated_articles !== 0) fail("Preview must record 0 mutated articles.");
if (preview.public_items !== 0) fail("Preview must record 0 public items.");
if (preview.backend_objects !== 0) fail("Preview must record 0 backend objects.");

for (const expectedInput of [
  "data/content-intelligence/quality-reviews/ag25a-featured-reads-inventory-gap-audit.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-gap-audit.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-inventory-register.json",
  "data/content-intelligence/featured-reads/ag25a-featured-reads-gap-register.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-production-strengthening-plan.json",
  "data/content-intelligence/featured-reads/ag25-featured-reads-source-reference-gate-model.json",
  "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json"
]) {
  if (!plan.consumed_source_of_truth.includes(expectedInput)) {
    fail(`Plan did not consume expected input: ${expectedInput}`);
  }
}

for (const [k, v] of Object.entries(review.blocked_state)) {
  if (v !== false) fail(`Blocked state must remain false: ${k}`);
}

if (!pkg.scripts?.["generate:ag25b"]) fail("Missing generate:ag25b script.");
if (!pkg.scripts?.["validate:ag25b"]) fail("Missing validate:ag25b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag25b")) fail("validate:project must include validate:ag25b.");

pass("AG25B Reference Verification Strengthening is present.");
pass("Reference worklist, status schema and priority register are valid.");
pass("AG25A inventory/gap audit and AG25 source gate records are consumed.");
pass("AG25C Image Credit and Attribution Completion boundary is ready.");
pass("No runtime link fetch, article mutation, public mutation, GitHub write, deployment, publishing or backend activation is enabled.");
