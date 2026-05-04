import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "review", "r00-methodology-review-refactoring-pass.json");
const docPath = path.join(process.cwd(), "docs", "review", "R00_METHODOLOGY_REVIEW_REFACTORING_PASS.md");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ R00 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) fail(`Missing R00 registry: ${registryPath}`);
if (!fs.existsSync(docPath)) fail(`Missing R00 document: ${docPath}`);
if (!fs.existsSync(packagePath)) fail("Missing package.json");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

if (registry.module_id !== "R00") fail("module_id must be R00");

const requiredDeps = ["M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06", "M06A", "M07", "M08", "M09", "M10"];
for (const dep of requiredDeps) {
  if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes(dep)) {
    fail(`R00 must depend on ${dep}`);
  }
}

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
  if (registry[flag] !== false) fail(`${flag} must remain false in R00`);
}

const reviewedModules = registry.reviewed_modules ?? [];
if (reviewedModules.length !== 13) {
  fail(`R00 must review 13 modules from M00 through M10 including A-modules; found ${reviewedModules.length}`);
}

for (const moduleId of requiredDeps) {
  const entry = reviewedModules.find((x) => x.module_id === moduleId);
  if (!entry) fail(`Missing reviewed module entry for ${moduleId}`);

  for (const field of ["document_path", "registry_path", "validator_path", "npm_script"]) {
    if (!entry[field]) fail(`Missing ${field} for ${moduleId}`);
  }

  for (const field of ["document_path", "registry_path", "validator_path"]) {
    const filePath = path.join(process.cwd(), entry[field]);
    if (!fs.existsSync(filePath)) {
      fail(`Missing ${moduleId} artifact: ${entry[field]}`);
    }
  }

  if (!pkg.scripts?.[entry.npm_script]) {
    fail(`Missing package script for ${moduleId}: ${entry.npm_script}`);
  }
}

for (const scriptName of registry.required_package_scripts ?? []) {
  if (!pkg.scripts?.[scriptName]) {
    fail(`Missing required package script: ${scriptName}`);
  }
}

for (const entry of reviewedModules) {
  const moduleRegistry = JSON.parse(fs.readFileSync(path.join(process.cwd(), entry.registry_path), "utf8"));

  for (const flag of registry.forbidden_enabled_flag_names ?? []) {
    if (moduleRegistry[flag] === true) {
      fail(`${entry.module_id} has forbidden enabled flag: ${flag}`);
    }
  }
}

const knownIssues = registry.known_naming_issues ?? [];
if (!knownIssues.some((x) => x.issue_id === "R00-KNI-001" && x.module_id === "M10")) {
  fail("Known M10 naming issue must be recorded");
}

for (const candidate of [
  "correct_m10_methodology_filename_typo",
  "create_shared_validator_helpers",
  "create_consolidated_methodology_index",
  "create_consolidated_status_report",
  "decide_backup_file_cleanup_policy"
]) {
  if (!registry.future_refactoring_candidates.includes(candidate)) {
    fail(`Missing future refactoring candidate: ${candidate}`);
  }
}

for (const phrase of [
  "Methodology Artifact Presence Doctrine",
  "Validation Script Coverage Doctrine",
  "Runtime Disabled Doctrine",
  "Known Naming Issue Doctrine",
  "Backup File Doctrine",
  "Refactoring Candidate Doctrine",
  "Consolidated Index Doctrine",
  "Safety Doctrine",
  "R00 does not implement"
]) {
  if (!docText.includes(phrase)) fail(`R00 document missing section/phrase: ${phrase}`);
}

pass("R00 review registry is present.");
pass("R00 review document is present.");
pass("R00 depends on and reviews M00 through M10.");
pass("All methodology documents, registries, validators, and npm scripts are present.");
pass("Runtime/Auth/Supabase/payment/API/subscriber/public-output flags remain disabled.");
pass("Known M10 naming issue is recorded without silent rename.");
pass("Future refactoring candidates are documented.");
pass("R00 is review-only and safe to commit.");
