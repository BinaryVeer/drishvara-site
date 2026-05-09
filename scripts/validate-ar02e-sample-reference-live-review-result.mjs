import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02e-sample-reference-live-review-result.json");
const docPath = path.join(root, "docs", "quality", "AR02E_SAMPLE_REFERENCE_LIVE_REVIEW_RESULT.md");
const resultPath = path.join(root, "data", "editorial", "ar02e-sample-reference-live-review-result.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AR02E validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const p of [registryPath, docPath, resultPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AR02E required file: ${p}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const result = JSON.parse(fs.readFileSync(resultPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const doc = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AR02E") fail("Registry module_id must be AR02E");
if (result.module_id !== "AR02E") fail("Result module_id must be AR02E");
if (result.ready_for_scale_up !== false) fail("AR02E must block scale-up");
if (result.status !== "conditional_fail_cleanup_required") fail("AR02E status must record cleanup requirement");
if (result.observations.legacy_duplicate_reference_block_observed !== true) fail("Duplicate reference block finding must be recorded");
if (registry.recommended_next_stage.module_id !== "AR02F") fail("Next stage must be AR02F");

for (const flag of [
  "article_html_mutation_enabled",
  "reference_insertion_enabled",
  "reference_cleanup_enabled",
  "external_fetch_enabled",
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
  "article_html_mutation_performed",
  "external_fetch_performed",
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
  if (result[falseField] !== false) fail(`${falseField} must be false`);
}

for (const scriptName of ["validate:ar02e", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Result", "Finding", "Decision", "Recommended Next Stage", "Explicit Exclusions"]) {
  if (!doc.includes(phrase)) fail(`AR02E document missing phrase: ${phrase}`);
}

pass("AR02E registry is present.");
pass("AR02E document is present.");
pass("AR02E result record is present.");
pass("Manual live result records cleanup required.");
pass("Scale-up is blocked until AR02F.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AR02E is manual result record only and safe to commit.");
