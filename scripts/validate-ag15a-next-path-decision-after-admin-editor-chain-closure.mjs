import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14z-admin-editor-secure-handler-chain-closure.json",
  "data/content-intelligence/closure-records/ag14z-admin-editor-secure-handler-chain-closure.json",
  "data/content-intelligence/admin-architecture/ag14z-admin-editor-chain-completion-summary.json",
  "data/content-intelligence/quality-registry/ag14z-live-implementation-blocked-register.json",
  "data/content-intelligence/quality-registry/ag14z-next-path-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14z-to-ag15a-next-path-decision-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  "data/admin-review/index/admin-review-queue-index.json",

  "data/content-intelligence/quality-reviews/ag15a-next-path-decision-after-admin-editor-chain-closure.json",
  "data/content-intelligence/content-pipeline/ag15a-next-path-decision-record.json",
  "data/content-intelligence/content-pipeline/ag15a-generated-article-admin-queue-conveyor-scope-record.json",
  "data/content-intelligence/quality-registry/ag15a-generated-article-admin-queue-integration-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag15a-to-ag15b-generated-article-admin-queue-integration-plan-boundary.json",
  "data/content-intelligence/schema/next-path-decision-after-admin-editor-chain-closure.schema.json",
  "data/content-intelligence/learning/ag15a-next-path-decision-after-admin-editor-chain-closure-learning.json",
  "data/quality/ag15a-next-path-decision-after-admin-editor-chain-closure.json",
  "data/quality/ag15a-next-path-decision-after-admin-editor-chain-closure-preview.json",
  "docs/quality/AG15A_NEXT_PATH_DECISION_AFTER_ADMIN_EDITOR_CHAIN_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG15A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag14zReview = readJson("data/content-intelligence/quality-reviews/ag14z-admin-editor-secure-handler-chain-closure.json");
const ag14zClosure = readJson("data/content-intelligence/closure-records/ag14z-admin-editor-secure-handler-chain-closure.json");
const ag14zReadiness = readJson("data/content-intelligence/quality-registry/ag14z-next-path-readiness-record.json");
const ag14zBoundary = readJson("data/content-intelligence/mutation-plans/ag14z-to-ag15a-next-path-decision-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag15a-next-path-decision-after-admin-editor-chain-closure.json");
const decision = readJson("data/content-intelligence/content-pipeline/ag15a-next-path-decision-record.json");
const conveyor = readJson("data/content-intelligence/content-pipeline/ag15a-generated-article-admin-queue-conveyor-scope-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag15a-generated-article-admin-queue-integration-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag15a-to-ag15b-generated-article-admin-queue-integration-plan-boundary.json");
const schema = readJson("data/content-intelligence/schema/next-path-decision-after-admin-editor-chain-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag15a-next-path-decision-after-admin-editor-chain-closure-learning.json");
const registry = readJson("data/quality/ag15a-next-path-decision-after-admin-editor-chain-closure.json");
const preview = readJson("data/quality/ag15a-next-path-decision-after-admin-editor-chain-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG15A_NEXT_PATH_DECISION_AFTER_ADMIN_EDITOR_CHAIN_CLOSURE.md"), "utf8");

for (const obj of [review, decision, conveyor, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG15A") fail(`module_id must be AG15A in ${obj.title || "object"}`);
}

if (ag14zReview.status !== "admin_editor_secure_handler_chain_closed_future_live_implementation_blocked") fail("AG14Z review status mismatch");
if (ag14zClosure.final_decision.ag14_chain_closed !== true) fail("AG14 chain closure missing");
if (ag14zReadiness.ready_for_ag15a !== true) fail("AG14Z readiness for AG15A missing");
if (ag14zBoundary.next_stage_id !== "AG15A") fail("AG15A boundary missing in AG14Z");

if (review.status !== "next_path_decision_completed_content_queue_integration_selected") fail("Review status mismatch");
if (decision.status !== "next_path_decision_completed_content_queue_integration_selected") fail("Decision status mismatch");
if (conveyor.status !== "generated_article_admin_queue_conveyor_scope_defined") fail("Conveyor scope status mismatch");
if (readiness.status !== "ready_for_ag15b_generated_article_admin_queue_integration_plan") fail("Readiness status mismatch");

const selectedOptions = decision.decision_options.filter((item) => item.selected === true);
if (selectedOptions.length !== 1) fail("Exactly one next path must be selected");
if (selectedOptions[0].path_id !== "content_article_queue_integration") fail("Selected path must be content_article_queue_integration");
if (decision.selected_path.next_stage_id !== "AG15B") fail("Selected next stage must be AG15B");

if (!conveyor.ag15b_planning_scope.includes("Define generated article queue record schema.")) fail("AG15B scope must include queue record schema");
if (!conveyor.ag15b_planning_scope.includes("Define batch validation checks.")) fail("AG15B scope must include batch validation checks");
if (!conveyor.not_in_ag15b_scope_yet.includes("No new article generation.")) fail("AG15B must still block new article generation at planning stage");

if (readiness.ready_for_ag15b !== true) fail("AG15B readiness missing");
if (readiness.article_generation_ready !== false) fail("Article generation must remain blocked");
if (readiness.queue_mutation_ready !== false) fail("Queue mutation must remain blocked");
if (readiness.admin_action_execution_ready !== false) fail("Admin action execution must remain blocked");
if (readiness.real_auth_ready !== false) fail("Real Auth must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag15b_boundary_created_not_started") fail("AG15B boundary status mismatch");
if (boundary.next_stage_id !== "AG15B") fail("AG15B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG15B explicit approval missing");

if (schema.status !== "schema_next_path_decision_after_ag14_closure_only") fail("Schema status mismatch");

for (const key of [
  "next_path_decision_allowed_in_ag15a",
  "content_queue_integration_selection_allowed_in_ag15a",
  "conveyor_scope_record_allowed_in_ag15a",
  "ag15b_boundary_allowed_in_ag15a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag15a",
  "article_mutation_allowed_in_ag15a",
  "queue_mutation_allowed_in_ag15a",
  "admin_action_execution_allowed_in_ag15a",
  "editor_action_execution_allowed_in_ag15a",
  "real_credential_creation_allowed_in_ag15a",
  "hardcoded_password_allowed_in_ag15a",
  "password_hash_commit_allowed_in_ag15a",
  "auth_activation_allowed_in_ag15a",
  "backend_activation_allowed_in_ag15a",
  "supabase_activation_allowed_in_ag15a",
  "database_write_allowed_in_ag15a",
  "github_token_creation_or_exposure_allowed_in_ag15a",
  "github_write_operation_allowed_in_ag15a",
  "active_action_handler_creation_allowed_in_ag15a",
  "public_visibility_switch_allowed_in_ag15a",
  "public_publishing_operation_allowed_in_ag15a",
  "deployment_trigger_allowed_in_ag15a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, decision, conveyor, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.next_path_decision_after_ag14_closure_only !== true) fail(`${obj.title || "object"} must be AG15A decision only`);
  if (obj.article_generation_performed_in_ag15a !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag15a !== false) fail(`${obj.title || "object"} must not mutate articles`);
  if (obj.queue_mutation_performed_in_ag15a !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.auth_activation_performed_in_ag15a !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.supabase_activation_performed_in_ag15a !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.public_visibility_switch_performed_in_ag15a !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_publishing_operation_performed_in_ag15a !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Decision", "Rationale", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG15A document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag15a", "validate:ag15a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag15a")) {
  fail("validate:project must include validate:ag15a");
}

pass("AG15A registry is present.");
pass("AG15A document is present.");
pass("AG15A review, decision record, conveyor scope, readiness, AG15B boundary, schema, learning and preview are present.");
pass("AG14Z closure is consumed.");
pass("Selected path: Generated Article to Admin Review Queue Integration.");
pass("AG15B planning boundary is created with explicit approval required.");
pass("Article generation, article mutation, queue mutation, Auth/backend/Supabase activation, visibility switch and publishing remain blocked.");
pass("AG15A is Next Path Decision only.");
