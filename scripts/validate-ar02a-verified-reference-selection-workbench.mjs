import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02a-verified-reference-selection-workbench.json");
const docPath = path.join(root, "docs", "quality", "AR02A_VERIFIED_REFERENCE_SELECTION_WORKBENCH.md");
const ar01RegistryPath = path.join(root, "data", "editorial", "article-reference-image-credit-registry.json");
const workbenchPath = path.join(root, "data", "editorial", "verified-reference-selection-workbench.json");
const previewPath = path.join(root, "data", "quality", "ar02a-verified-reference-selection-workbench-preview.json");
const ar02bSamplePath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AR02A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const requiredPath of [registryPath, docPath, ar01RegistryPath, workbenchPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AR02A required artifact/dependency: ${requiredPath}`);
}

const registry = readJson(registryPath);
const ar01 = readJson(ar01RegistryPath);
const workbench = readJson(workbenchPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AR02A") fail("Registry module_id must be AR02A");
if (workbench.module_id !== "AR02A") fail("Workbench module_id must remain AR02A");
if (preview.module_id !== "AR02A") fail("Preview module_id must be AR02A");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (workbench.article_count !== ar01.article_count) fail("Workbench article count must match AR01 article count");
if (!Array.isArray(workbench.entries) || workbench.entries.length !== ar01.article_count) {
  fail("Workbench entries must match AR01 article count");
}

const hasAR02B = fs.existsSync(ar02bSamplePath);
const ar02bSample = hasAR02B ? readJson(ar02bSamplePath) : null;
const ar02bSamplePaths = new Set(hasAR02B ? ar02bSample.entries.map((entry) => entry.article_path) : []);

for (const entry of workbench.entries) {
  if (!Array.isArray(entry.candidate_references) || entry.candidate_references.length !== 2) {
    fail(`Article must have exactly two candidate slots: ${entry.article_path}`);
  }

  const isAR02BSample = ar02bSamplePaths.has(entry.article_path);

  if (!hasAR02B || !isAR02BSample) {
    if (entry.current_verified_reference_count !== 0) {
      fail(`Non-AR02B article must remain unverified: ${entry.article_path}`);
    }

    if (entry.final_reference_decision.ready_for_article_insertion !== false) {
      fail(`Non-AR02B article cannot be ready for insertion: ${entry.article_path}`);
    }

    for (const candidate of entry.candidate_references) {
      if (candidate.candidate_url !== null) fail(`Non-AR02B candidate URL must remain null: ${entry.article_path}`);
      if (candidate.decision.editorial_decision !== "pending") {
        fail(`Non-AR02B candidate decision must remain pending: ${entry.article_path}`);
      }
      if (candidate.decision.accepted_for_article !== false) {
        fail(`Non-AR02B candidate cannot be accepted: ${entry.article_path}`);
      }
    }
  } else {
    if (entry.current_verified_reference_count !== 2) {
      fail(`AR02B sample article must have two verified references: ${entry.article_path}`);
    }

    if (entry.final_reference_decision.ready_for_article_insertion !== true) {
      fail(`AR02B sample article must be ready for AR02C insertion: ${entry.article_path}`);
    }

    for (const candidate of entry.candidate_references) {
      if (!candidate.candidate_url || !candidate.candidate_url.startsWith("https://")) {
        fail(`AR02B sample candidate must have HTTPS URL: ${entry.article_path}`);
      }
      if (candidate.decision.editorial_decision !== "accepted") {
        fail(`AR02B sample candidate decision must be accepted: ${entry.article_path}`);
      }
      if (candidate.decision.accepted_for_article !== true) {
        fail(`AR02B sample candidate must be accepted for article: ${entry.article_path}`);
      }
    }
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
pass("Every article has exactly two candidate slots.");
if (hasAR02B) {
  pass("AR02A validator is forward-compatible with AR02B sample-populated entries.");
  pass("AR02B sample entries may be accepted while non-sample articles remain pending.");
} else {
  pass("All candidate URLs remain null before later reference-population stages.");
}
pass("Article HTML mutation remains disabled.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AR02A is verified-reference workbench structure and safe to commit.");
