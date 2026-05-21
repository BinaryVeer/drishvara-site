import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag09h-final-editorial-publish-approval-decision.json",
  "data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json",
  "data/content-intelligence/quality-registry/ag09h-final-editorial-readiness-record.json",
  "data/content-intelligence/closure-records/ag09h-final-editorial-publish-approval-closure.json",
  "data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json",
  "data/content-intelligence/audit-records/ag09gm-manual-mobile-layout-observation-note.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
  "data/content-intelligence/quality-reviews/ag09z-final-chain-closure-next-system-handoff.json",
  "data/content-intelligence/closure-records/ag09z-final-chain-closure-next-system-handoff.json",
  "data/content-intelligence/quality-registry/ag09z-final-public-experience-chain-readiness.json",
  "data/content-intelligence/mutation-plans/ag09z-to-ag10a-governed-object-pipeline-planning-handoff.json",
  "data/content-intelligence/schema/final-chain-closure-next-system-handoff.schema.json",
  "data/content-intelligence/learning/ag09z-final-chain-closure-next-system-handoff-learning.json",
  "data/quality/ag09z-final-chain-closure-next-system-handoff.json",
  "data/quality/ag09z-final-chain-closure-next-system-handoff-preview.json",
  "docs/quality/AG09Z_FINAL_CHAIN_CLOSURE_NEXT_SYSTEM_HANDOFF.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG09Z validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag09hReview = readJson("data/content-intelligence/quality-reviews/ag09h-final-editorial-publish-approval-decision.json");
const ag09hApproval = readJson("data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json");
const ag09hReadiness = readJson("data/content-intelligence/quality-registry/ag09h-final-editorial-readiness-record.json");
const ag09hClosure = readJson("data/content-intelligence/closure-records/ag09h-final-editorial-publish-approval-closure.json");
const ag09gAudit = readJson("data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag09z-final-chain-closure-next-system-handoff.json");
const closure = readJson("data/content-intelligence/closure-records/ag09z-final-chain-closure-next-system-handoff.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag09z-final-public-experience-chain-readiness.json");
const handoff = readJson("data/content-intelligence/mutation-plans/ag09z-to-ag10a-governed-object-pipeline-planning-handoff.json");
const schema = readJson("data/content-intelligence/schema/final-chain-closure-next-system-handoff.schema.json");
const learning = readJson("data/content-intelligence/learning/ag09z-final-chain-closure-next-system-handoff-learning.json");
const registry = readJson("data/quality/ag09z-final-chain-closure-next-system-handoff.json");
const preview = readJson("data/quality/ag09z-final-chain-closure-next-system-handoff-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG09Z_FINAL_CHAIN_CLOSURE_NEXT_SYSTEM_HANDOFF.md"), "utf8");

for (const obj of [review, closure, readiness, handoff, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG09Z") fail(`module_id must be AG09Z in ${obj.title || "object"}`);
}

if (ag09hReview.status !== "final_editorial_publish_approval_recorded") fail("AG09H review status mismatch");
if (ag09hApproval.final_editorial_publish_approved !== true) fail("AG09H final editorial approval must be true");
if (ag09hReadiness.status !== "final_editorial_static_article_approved") fail("AG09H readiness mismatch");
if (ag09hClosure.status !== "ag09_final_editorial_approval_closed_static_article") fail("AG09H closure mismatch");
if (ag09gAudit.observation_summary.failed !== 0) fail("AG09G must have zero failed observations");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) fail("Selected article hash must match AG09C post-correction hash");

if (review.status !== "ag09_chain_closed_next_system_handoff_created") fail("Review status mismatch");
if (closure.status !== "ag09_chain_closed_next_system_handoff_created") fail("Closure status mismatch");
if (registry.status !== "ag09_chain_closed_next_system_handoff_created") fail("Registry status mismatch");
if (preview.status !== "ag09_chain_closed_next_system_handoff_created") fail("Preview status mismatch");

if (closure.ag09_chain_closed !== true) fail("AG09 chain must be closed");
if (closure.final_editorial_static_article_approved !== true) fail("Static article editorial approval must be carried forward");
if (closure.public_publishing_operation_performed !== false) fail("AG09Z must not perform publishing operation");
if (closure.deployment_trigger_performed !== false) fail("AG09Z must not trigger deployment");
if (closure.backend_activation_performed !== false) fail("AG09Z must not activate backend");

for (const check of closure.closure_checks) {
  if (check.status !== "passed") fail(`Closure check failed: ${check.check_id}`);
}

if (readiness.status !== "one_article_public_experience_chain_closed") fail("Final readiness status mismatch");
if (readiness.editorially_approved_static_article !== true) fail("Final readiness must carry editorial approval");
if (readiness.ready_for_future_object_pipeline !== true) fail("Future object pipeline readiness must be true");
if (readiness.ready_for_backend_activation !== false) fail("Backend activation must remain false");
if (readiness.ready_for_supabase_activation !== false) fail("Supabase activation must remain false");
if (readiness.ready_for_database_activation !== false) fail("Database activation must remain false");
if (readiness.public_publishing_operation_performed !== false) fail("No publishing operation should be performed");

if (handoff.status !== "ag10a_handoff_created_not_started") fail("AG10A handoff status mismatch");
if (handoff.next_stage_id !== "AG10A") fail("AG10A handoff missing");
if (handoff.explicit_approval_required !== true) fail("AG10A must require explicit approval");

for (const objectType of [
  "infographic",
  "graph_or_chart",
  "table",
  "figure_or_diagram",
  "map",
  "broken_image_placeholder_audit"
]) {
  if (!handoff.ag10a_scope_candidates.some((item) => item.object_type === objectType)) {
    fail(`AG10A handoff missing object type: ${objectType}`);
  }
}

if (schema.status !== "schema_final_chain_closure_only") fail("Schema status mismatch");
if (schema.final_chain_closure_allowed_in_ag09z !== true) fail("Schema must allow final closure");
if (schema.ag10a_handoff_allowed_in_ag09z !== true) fail("Schema must allow AG10A handoff");

for (const key of [
  "article_mutation_allowed_in_ag09z",
  "homepage_mutation_allowed_in_ag09z",
  "css_js_mutation_allowed_in_ag09z",
  "reference_insertion_allowed_in_ag09z",
  "reference_url_change_allowed_in_ag09z",
  "visual_generation_allowed_in_ag09z",
  "image_asset_creation_allowed_in_ag09z",
  "image_insertion_allowed_in_ag09z",
  "infographic_generation_allowed_in_ag09z",
  "graph_generation_allowed_in_ag09z",
  "table_generation_allowed_in_ag09z",
  "figure_generation_allowed_in_ag09z",
  "map_generation_allowed_in_ag09z",
  "diagram_generation_allowed_in_ag09z",
  "live_url_fetch_allowed_in_ag09z",
  "deployment_trigger_allowed_in_ag09z",
  "production_jsonl_append_allowed_in_ag09z",
  "database_write_allowed_in_ag09z",
  "supabase_write_allowed_in_ag09z",
  "backend_auth_supabase_activation_allowed_in_ag09z",
  "rollback_execution_allowed_in_ag09z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, readiness, handoff, schema, learning, registry, preview]) {
  if (obj.final_chain_closure_only !== true) fail(`${obj.title || "object"} must be closure-only`);
  if (obj.article_mutation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.homepage_mutation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.css_mutation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.visual_generation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not generate visual`);
  if (obj.image_insertion_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.infographic_generation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not generate infographic`);
  if (obj.graph_generation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not generate graph`);
  if (obj.table_generation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not generate table`);
  if (obj.figure_generation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not generate figure`);
  if (obj.map_generation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not generate map`);
  if (obj.live_url_fetch_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not fetch live URL`);
  if (obj.deployment_trigger_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.database_write_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag09z !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
}

if (review.closure_decision.decision !== "ag09z_chain_closed_ag10a_handoff_ready") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10a_only_with_explicit_user_approval !== true) fail("AG10A must require explicit approval");

for (const scriptName of ["generate:ag09z", "validate:ag09z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag09z")) {
  fail("validate:project must include validate:ag09z");
}

for (const phrase of ["Purpose", "Closed Article", "Closure Result", "Next-System Handoff", "Boundaries"]) {
  if (!docText.includes(phrase)) fail(`AG09Z document missing phrase: ${phrase}`);
}

pass("AG09Z registry is present.");
pass("AG09Z document is present.");
pass("AG09Z review, final closure, final readiness, AG10A handoff, schema, learning record and preview are present.");
pass("AG09H final editorial approval and closure are consumed.");
pass("Selected article hash remains stable.");
pass("AG09 public-experience chain is closed.");
pass("Additional objects are deferred to AG10A governed object-pipeline planning.");
pass("Site-wide broken-image placeholder audit is handed off to AG10A.");
pass("No mutation, object generation, live fetch, deployment trigger, backend activation, rollback execution or publishing operation is performed.");
pass("AG09Z closes AG09 and prepares AG10A handoff.");
