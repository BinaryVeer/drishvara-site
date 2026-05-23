import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag10l-post-generated-image-insertion-audit.json",
  "data/content-intelligence/audit-records/ag10l-post-generated-image-insertion-audit-report.json",
  "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-readiness-record.json",
  "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-rollback-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag10l-to-ag10m-generated-image-insertion-closure-reuse-handoff-boundary.json",
  "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json",
  "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json",
  "data/content-intelligence/quality-registry/ag10j-generated-image-cost-reuse-record.json",
  "data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json",
  "data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json",

  "data/content-intelligence/quality-reviews/ag10m-generated-image-insertion-closure-reuse-handoff.json",
  "data/content-intelligence/closure-records/ag10m-generated-image-insertion-closure-reuse-handoff.json",
  "data/content-intelligence/object-registry/ag10m-generated-image-reuse-handoff-record.json",
  "data/content-intelligence/quality-registry/ag10m-generated-image-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag10m-to-ag10z-governed-object-pipeline-closure-boundary.json",
  "data/content-intelligence/schema/generated-image-insertion-closure-reuse-handoff.schema.json",
  "data/content-intelligence/learning/ag10m-generated-image-insertion-closure-reuse-handoff-learning.json",
  "data/quality/ag10m-generated-image-insertion-closure-reuse-handoff.json",
  "data/quality/ag10m-generated-image-insertion-closure-reuse-handoff-preview.json",
  "docs/quality/AG10M_GENERATED_IMAGE_INSERTION_CLOSURE_REUSE_HANDOFF.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10M validation failed: ${message}`);
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

const ag10lReview = readJson("data/content-intelligence/quality-reviews/ag10l-post-generated-image-insertion-audit.json");
const ag10lAudit = readJson("data/content-intelligence/audit-records/ag10l-post-generated-image-insertion-audit-report.json");
const ag10lReadiness = readJson("data/content-intelligence/quality-registry/ag10l-generated-image-insertion-readiness-record.json");
const ag10lRollback = readJson("data/content-intelligence/quality-registry/ag10l-generated-image-insertion-rollback-readiness-record.json");
const ag10lBoundary = readJson("data/content-intelligence/mutation-plans/ag10l-to-ag10m-generated-image-insertion-closure-reuse-handoff-boundary.json");
const ag10kApply = readJson("data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");
const ag10jAsset = readJson("data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json");
const ag10iConcept = readJson("data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json");
const ag10iPrompt = readJson("data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10m-generated-image-insertion-closure-reuse-handoff.json");
const closure = readJson("data/content-intelligence/closure-records/ag10m-generated-image-insertion-closure-reuse-handoff.json");
const reuse = readJson("data/content-intelligence/object-registry/ag10m-generated-image-reuse-handoff-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10m-generated-image-final-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10m-to-ag10z-governed-object-pipeline-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/generated-image-insertion-closure-reuse-handoff.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10m-generated-image-insertion-closure-reuse-handoff-learning.json");
const registry = readJson("data/quality/ag10m-generated-image-insertion-closure-reuse-handoff.json");
const preview = readJson("data/quality/ag10m-generated-image-insertion-closure-reuse-handoff-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10M_GENERATED_IMAGE_INSERTION_CLOSURE_REUSE_HANDOFF.md"), "utf8");

for (const obj of [review, closure, reuse, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10M") fail(`module_id must be AG10M in ${obj.title || "object"}`);
}

if (ag10lReview.status !== "post_generated_image_insertion_audit_passed") fail("AG10L review must be passed");
if (ag10lAudit.status !== "post_generated_image_insertion_audit_passed") fail("AG10L audit must be passed");
if (ag10lAudit.failed_checks.length !== 0) fail("AG10L failed checks must be zero");
if (ag10lReadiness.ready_for_ag10m !== true) fail("AG10L readiness for AG10M missing");
if (ag10lRollback.rollback_ready !== true) fail("AG10L rollback readiness missing");
if (ag10lBoundary.next_stage_id !== "AG10M") fail("AG10L boundary must hand off to AG10M");

const articlePath = ag10kApply.selected_article_path;
const assetPath = ag10kApply.asset_path;
const backupPath = ag10kApply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, assetPath))) fail(`Asset missing: ${assetPath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
const assetHash = sha256(fs.readFileSync(path.join(root, assetPath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

if (articleHash !== ag10kApply.post_insertion_hash) fail("Article hash must remain AG10K post-insertion hash");
if (assetHash !== ag10jAsset.asset_hash_sha256) fail("Asset hash must match AG10J asset record");
if (backupHash !== ag10kApply.pre_insertion_hash) fail("Backup hash must match AG10K pre-insertion hash");

for (const obj of [review, closure, registry, preview]) {
  if (obj.status !== "generated_image_insertion_chain_closed_reuse_handoff_recorded") {
    fail(`${obj.title || "object"} status mismatch`);
  }
}

if (reuse.status !== "generated_image_reuse_handoff_recorded") fail("Reuse handoff status mismatch");
if (readiness.status !== "ag10_generated_image_chain_closed_pending_ag10z") fail("Final readiness status mismatch");
if (schema.status !== "schema_generated_image_insertion_closure_reuse_handoff_only") fail("Schema status mismatch");

if (closure.closure_decision.generated_image_insertion_chain_closed !== true) fail("Closure decision must close chain");
if (closure.closure_decision.reuse_handoff_recorded !== true) fail("Closure decision must record reuse handoff");
if (closure.closure_decision.rollback_readiness_carried_forward !== true) fail("Closure must carry rollback readiness");
if (closure.closure_decision.publishing_ready !== false) fail("Publishing readiness must remain false");
if (closure.closure_decision.backend_activation_ready !== false) fail("Backend readiness must remain false");

if (reuse.asset_id !== ag10jAsset.asset_id) fail("Reuse handoff asset ID mismatch");
if (reuse.asset_hash_sha256 !== assetHash) fail("Reuse handoff asset hash mismatch");
if (reuse.concept_template_candidate_id !== ag10iConcept.concept_template_candidate_id) fail("Reuse concept ID mismatch");
if (reuse.prompt_record_id !== ag10iPrompt.prompt_record_id) fail("Reuse prompt ID mismatch");
if (!Array.isArray(reuse.reuse_gate_questions) || reuse.reuse_gate_questions.length !== 5) fail("Reuse gate must contain five questions");

if (readiness.ag10l_audit_passed !== true) fail("Final readiness must carry AG10L pass");
if (readiness.generated_image_insertion_chain_closed !== true) fail("Final readiness must close chain");
if (readiness.reuse_handoff_recorded !== true) fail("Final readiness must record reuse handoff");
if (readiness.rollback_ready !== true) fail("Final readiness must carry rollback readiness");
if (readiness.ready_for_ag10z !== true) fail("Final readiness must be ready for AG10Z");
if (readiness.publishing_ready !== false) fail("Final readiness must keep publishing blocked");
if (readiness.backend_activation_ready !== false) fail("Final readiness must keep backend blocked");

if (boundary.status !== "ag10z_boundary_created_not_started") fail("AG10Z boundary status mismatch");
if (boundary.next_stage_id !== "AG10Z") fail("AG10Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10Z must require explicit approval");

for (const key of [
  "closure_allowed_in_ag10m",
  "reuse_handoff_allowed_in_ag10m",
  "final_readiness_allowed_in_ag10m",
  "ag10z_boundary_allowed_in_ag10m"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10m",
  "object_insertion_allowed_in_ag10m",
  "image_generation_allowed_in_ag10m",
  "external_image_api_call_allowed_in_ag10m",
  "new_asset_creation_allowed_in_ag10m",
  "reference_insertion_allowed_in_ag10m",
  "reference_url_change_allowed_in_ag10m",
  "homepage_mutation_allowed_in_ag10m",
  "css_js_mutation_allowed_in_ag10m",
  "backend_auth_supabase_activation_allowed_in_ag10m",
  "public_publishing_operation_allowed_in_ag10m"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, reuse, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.generated_image_insertion_closure_reuse_handoff_only !== true) fail(`${obj.title || "object"} must be AG10M-only`);
  if (obj.article_mutation_performed_in_ag10m !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_insertion_performed_in_ag10m !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.image_generation_performed_in_ag10m !== false) fail(`${obj.title || "object"} must not generate image`);
  if (obj.new_asset_creation_performed_in_ag10m !== false) fail(`${obj.title || "object"} must not create asset`);
  if (obj.reference_url_change_performed_in_ag10m !== false) fail(`${obj.title || "object"} must not change reference URL`);
  if (obj.css_file_mutation_performed_in_ag10m !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag10m !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10m !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10m !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Closure Result", "Reuse Handoff", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10M document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag10m", "validate:ag10m"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10m")) {
  fail("validate:project must include validate:ag10m");
}

pass("AG10M registry is present.");
pass("AG10M document is present.");
pass("AG10M review, closure, reuse handoff, final readiness, AG10Z boundary, schema, learning record and preview are present.");
pass("AG10L audit, readiness and rollback evidence are consumed.");
pass("AG10K apply and AG10J asset evidence are consumed.");
pass("Article, asset and backup hashes remain stable.");
pass("Generated image insertion chain is closed.");
pass("Reusable rendered asset, concept template, prompt pattern and caption/alt/credit pattern are recorded.");
pass("Five-question reuse gate is carried forward.");
pass("Rollback readiness is carried forward.");
pass("Publishing and backend/Supabase activation remain blocked.");
pass("No article mutation, object insertion, image generation, new asset creation, backend activation or publishing operation is performed.");
pass("AG10Z governed object pipeline closure boundary is created with explicit approval required.");
pass("AG10M is Generated Image Insertion Closure and Reuse Handoff only.");
