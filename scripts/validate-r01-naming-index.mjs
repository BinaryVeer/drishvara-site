import fs from "node:fs";
import path from "node:path";

const r01RegistryPath = path.join(process.cwd(), "data", "review", "r01-naming-consistency-consolidated-methodology-index.json");
const r01DocPath = path.join(process.cwd(), "docs", "review", "R01_NAMING_CONSISTENCY_CONSOLIDATED_METHODOLOGY_INDEX.md");
const indexDocPath = path.join(process.cwd(), "docs", "methodology", "METHODOLOGY_INDEX.md");
const indexRegistryPath = path.join(process.cwd(), "data", "methodology", "methodology-index.json");
const m10CorrectPath = path.join(process.cwd(), "docs", "methodology", "M10_METHODOLOGY_ACTIVATION_READINESS_REPORT.md");
const m10OldPath = path.join(process.cwd(), "docs", "methodology", "M10_METHODLOGY_ACTIVATION_READINESS_REPORT.md");
const r00RegistryPath = path.join(process.cwd(), "data", "review", "r00-methodology-review-refactoring-pass.json");
const m10ValidatorPath = path.join(process.cwd(), "scripts", "validate-m10-methodology-readiness.mjs");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ R01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [r01RegistryPath, r01DocPath, indexDocPath, indexRegistryPath, m10CorrectPath, r00RegistryPath, m10ValidatorPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing required R01 artifact: ${requiredPath}`);
}

if (fs.existsSync(m10OldPath)) {
  fail("Old misspelled M10 filename still exists; controlled rename incomplete.");
}

const r01 = JSON.parse(fs.readFileSync(r01RegistryPath, "utf8"));
const index = JSON.parse(fs.readFileSync(indexRegistryPath, "utf8"));
const r00 = JSON.parse(fs.readFileSync(r00RegistryPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const r01Doc = fs.readFileSync(r01DocPath, "utf8");
const indexDoc = fs.readFileSync(indexDocPath, "utf8");
const m10Validator = fs.readFileSync(m10ValidatorPath, "utf8");

if (r01.module_id !== "R01") fail("module_id must be R01");

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "subscriber_output_enabled",
  "public_output_enabled",
  "public_guidance_enabled",
  "public_panchang_enabled",
  "public_festival_dates_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "dashboard_card_runtime_enabled",
  "internal_preview_runtime_enabled",
  "automatic_activation_enabled",
  "automatic_database_mutation_enabled"
]) {
  if (r01[flag] !== false) fail(`${flag} must remain false in R01`);
  if (index[flag] !== false) fail(`${flag} must remain false in methodology index`);
}

if (!m10Validator.includes("M10_METHODOLOGY_ACTIVATION_READINESS_REPORT.md")) {
  fail("M10 validator does not reference corrected filename.");
}

if (m10Validator.includes("M10_METHODLOGY_ACTIVATION_READINESS_REPORT.md")) {
  fail("M10 validator still references misspelled filename.");
}

const r00M10 = (r00.reviewed_modules ?? []).find((x) => x.module_id === "M10");
if (!r00M10) fail("R00 registry missing M10 reviewed module entry.");
if (r00M10.document_path !== "docs/methodology/M10_METHODOLOGY_ACTIVATION_READINESS_REPORT.md") {
  fail("R00 registry does not reference corrected M10 document path.");
}

const modules = index.modules ?? [];
for (const moduleId of ["M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06", "M06A", "M07", "M08", "M09", "M10"]) {
  const entry = modules.find((x) => x.module_id === moduleId);
  if (!entry) fail(`Methodology index missing module ${moduleId}`);
  for (const field of ["document_path", "registry_path", "validator_path", "npm_script"]) {
    if (!entry[field]) fail(`Methodology index missing ${field} for ${moduleId}`);
    if (field !== "npm_script" && !fs.existsSync(path.join(process.cwd(), entry[field]))) {
      fail(`Indexed artifact does not exist for ${moduleId}: ${entry[field]}`);
    }
  }
  if (!pkg.scripts?.[entry.npm_script]) fail(`Missing npm script for indexed module ${moduleId}: ${entry.npm_script}`);
}

for (const scriptName of ["validate:m10", "validate:r00", "validate:r01", "validate:methodology"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Naming Consistency Doctrine",
  "M10 Filename Correction",
  "Consolidated Methodology Index Doctrine",
  "Explicit Exclusions",
  "Safety Doctrine",
  "R01 does not implement"
]) {
  if (!r01Doc.includes(phrase)) fail(`R01 document missing phrase: ${phrase}`);
}

for (const phrase of [
  "Drishvara Methodology Index",
  "Methodology Stack",
  "Naming Consistency Notes",
  "Runtime Posture"
]) {
  if (!indexDoc.includes(phrase)) fail(`Methodology index missing phrase: ${phrase}`);
}

pass("R01 registry is present.");
pass("R01 document is present.");
pass("M10 filename typo is corrected through controlled rename.");
pass("M10 validator and R00 registry reference the corrected filename.");
pass("Consolidated methodology index document and registry are present.");
pass("All indexed methodology artifacts and npm scripts are present.");
pass("Runtime/Auth/Supabase/payment/API/subscriber/public-output flags remain disabled.");
pass("R01 is review-only and safe to commit.");
