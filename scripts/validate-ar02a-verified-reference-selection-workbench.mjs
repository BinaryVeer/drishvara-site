import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02a-verified-reference-selection-workbench.json");
const docPath = path.join(root, "docs", "quality", "AR02A_VERIFIED_REFERENCE_SELECTION_WORKBENCH.md");
const ar01RegistryPath = path.join(root, "data", "editorial", "article-reference-image-credit-registry.json");
const workbenchPath = path.join(root, "data", "editorial", "verified-reference-selection-workbench.json");
const previewPath = path.join(root, "data", "quality", "ar02a-verified-reference-selection-workbench-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AR02A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, ar01RegistryPath, workbenchPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AR02A required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const ar01 = JSON.parse(fs.readFileSync(ar01RegistryPath, "utf8"));
const workbench = JSON.parse(fs.readFileSync(workbenchPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AR02A") fail("Registry module_id must be AR02A");
if (workbench.module_id !== "AR02A") fail("Workbench module_id must be AR02A");
if (preview.module_id !== "AR02A") fail("Preview module_id must be AR02A");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (workbench.article_count !== ar01.article_count) fail("Workbench article count must match AR01 article count");
if (!preview.summary.article_count_matches_ar01) fail("Preview must confirm article count match");
if (!preview.summary.all_entries_have_two_candidate_slots) fail("Every entry must have two candidate slots");
if (!preview.summary.all_candidate_urls_null) fail("All candidate URLs must remain null in AR02A");
if (!preview.summary.all_decisions_pending) fail("All decisions must remain pending in AR02A");
if (!preview.summary.no_article_html_mutation) fail("AR02A must not mutate article HTML");

for (const entry of workbench.entries) {
  if (!Array.isArray(entry.candidate_references) || entry.candidate_references.length !== 2) {
    fail(`Article must have exactly two candidate slots: ${entry.article_path}`);
  }

  if (entry.final_reference_decision.ready_for_article_insertion !== false) {
    fail(`Article cannot be ready for insertion in AR02A: ${entry.article_path}`);
  }

  for (const candidate of entry.candidate_references) {
    if (candidate.candidate_url !== null) fail(`Candidate URL must remain null: ${entry.article_path}`);
    if (candidate.decision.editorial_decision !== "pending") fail(`Candidate decision must remain pending: ${entry.article_path}`);
    if (candidate.decision.accepted_for_article !== false) fail(`Candidate cannot be accepted in AR02A: ${entry.article_path}`);
  }
}

for (const flag of [
  "article_html_mutation_enabled",
  "external_link_verification_performed",
  "external_fetch_enabled",
  "unverified_external_link_insertion_enabled",
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
  if (registry[flag] !== false) fail(`${flag} must remain false`);
}

for (const falseField of [
  "external_link_verification_performed",
  "unverified_external_links_inserted",
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
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

for (const scriptName of ["generate:ar02a", "validate:ar02a", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Verification Dimensions", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AR02A document missing phrase: ${phrase}`);
}

pass("AR02A registry is present.");
pass("AR02A document is present.");
pass("AR02A workbench and preview are present.");
pass("Workbench article count matches AR01.");
pass("Every article has exactly two pending candidate slots.");
pass("No candidate URL is inserted in AR02A.");
pass("Article HTML mutation remains disabled.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AR02A is verified-reference workbench structure and safe to commit.");
