import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag04a-r1-article-visual-evidence-register.json");
const docPath = path.join(root, "docs", "quality", "AG04A_R1_ARTICLE_VISUAL_EVIDENCE_REGISTER.md");
const registerPath = path.join(root, "data", "editorial", "ag04a-r1-article-visual-evidence-register.json");
const previewPath = path.join(root, "data", "quality", "ag04a-r1-article-visual-evidence-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG04A-R1 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, registerPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG04A-R1 required file: ${p}`);
}

const config = readJson(registryPath);
const register = readJson(registerPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (config.module_id !== "AG04A-R1") fail("Registry module_id must be AG04A-R1");
if (register.module_id !== "AG04A-R1") fail("Register module_id must be AG04A-R1");
if (preview.module_id !== "AG04A-R1") fail("Preview module_id must be AG04A-R1");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (register.summary.evidence_article_count !== config.expected.article_count) fail("Evidence register must contain 72 articles");
if (register.summary.live_ag03_reference_link_count !== config.expected.ag03_reference_link_count) fail("Live AG03 reference link count must remain 144");
if (register.summary.articles_with_exactly_two_ag03_links !== config.expected.article_count) fail("Every article must retain exactly two AG03 links");
if (register.summary.ag03_integrity_preserved !== true) fail("AG03 integrity must remain preserved");
if (register.summary.audit_only_no_mutation !== true) fail("AG04A-R1 must be audit-only");
if (register.summary.ready_for_ag04a_r2_manual_review_record !== true) fail("AG04A-R1 must be ready for AG04A-R2");

if (!Array.isArray(register.entries)) fail("Register entries must be an array");
if (register.entries.length !== config.expected.article_count) fail("Register entries must contain 72 articles");
if (!Array.isArray(register.manual_review_queue)) fail("Manual review queue must be an array");

for (const entry of register.entries) {
  if (!entry.article_path || !entry.article_path.startsWith("articles/")) fail("Invalid article path in register");
  if (entry.ag03_reference_link_count !== config.expected.references_per_article) fail(`AG03 link count drift: ${entry.article_path}`);
  if (!entry.visual_evidence || typeof entry.visual_evidence !== "object") fail(`Missing visual evidence: ${entry.article_path}`);
  if (!entry.image_credit_evidence || typeof entry.image_credit_evidence !== "object") fail(`Missing credit evidence: ${entry.article_path}`);
  if (!entry.reading_surface_evidence || typeof entry.reading_surface_evidence !== "object") fail(`Missing reading evidence: ${entry.article_path}`);
  if (!entry.review_flags || typeof entry.review_flags !== "object") fail(`Missing review flags: ${entry.article_path}`);
  if (!config.review_status_values.includes(entry.manual_review_status)) fail(`Invalid manual review status: ${entry.article_path}`);
}

for (const falseField of [
  "mutation_performed",
  "article_html_mutation_performed",
  "article_text_mutation_performed",
  "article_image_mutation_performed",
  "image_credit_mutation_performed",
  "reference_url_change_performed",
  "css_mutation_performed",
  "external_fetch_performed_by_script",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_performed",
  "file_deletion_performed",
  "file_move_performed"
]) {
  if (register[falseField] !== false) fail(`${falseField} must be false`);
}

for (const flag of [
  "article_html_mutation_enabled",
  "article_text_mutation_enabled",
  "article_image_mutation_enabled",
  "image_credit_mutation_enabled",
  "reference_url_change_enabled",
  "css_mutation_enabled",
  "external_fetch_enabled_by_script",
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "backend_activation_enabled",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "credential_collection_enabled",
  "payment_enabled",
  "admin_ui_enabled",
  "subscriber_output_enabled",
  "public_dynamic_output_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "file_deletion_enabled",
  "file_move_enabled"
]) {
  if (config[flag] !== false) fail(`${flag} must remain false`);
}

for (const scriptName of ["generate:ag04a-r1", "validate:ag04a-r1", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG04A-R1 document missing phrase: ${phrase}`);
}

pass("AG04A-R1 registry is present.");
pass("AG04A-R1 document is present.");
pass("AG04A-R1 evidence register and preview outputs are present.");
pass("Exactly 72 article pages are included.");
pass("Every article retains exactly two AG03 reference links.");
pass("Visual, credit and reading-surface evidence is recorded for every article.");
pass("Manual review status is recorded for every article.");
pass("No article/page/content/image/reference/CSS mutation is performed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG04A-R2 manual review result record is identified as next.");
