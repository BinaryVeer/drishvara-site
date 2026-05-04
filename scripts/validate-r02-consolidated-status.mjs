import fs from "node:fs";
import path from "node:path";

const r02RegistryPath = path.join(process.cwd(), "data", "review", "r02-consolidated-status-implementation-planning-gate.json");
const r02DocPath = path.join(process.cwd(), "docs", "review", "R02_CONSOLIDATED_STATUS_IMPLEMENTATION_PLANNING_GATE.md");
const statusDocPath = path.join(process.cwd(), "docs", "review", "CONSOLIDATED_METHODOLOGY_STATUS_REPORT.md");
const statusRegistryPath = path.join(process.cwd(), "data", "review", "consolidated-methodology-status-report.json");
const packagePath = path.join(process.cwd(), "package.json");

function fail(message) {
  console.error(`❌ R02 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [r02RegistryPath, r02DocPath, statusDocPath, statusRegistryPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing R02 artifact: ${requiredPath}`);
}

const r02 = JSON.parse(fs.readFileSync(r02RegistryPath, "utf8"));
const status = JSON.parse(fs.readFileSync(statusRegistryPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const r02Doc = fs.readFileSync(r02DocPath, "utf8");
const statusDoc = fs.readFileSync(statusDocPath, "utf8");

if (r02.module_id !== "R02") fail("module_id must be R02");

const requiredDeps = ["M00", "M01", "M02", "M03", "M04", "M04A", "M05", "M06", "M06A", "M07", "M08", "M09", "M10", "R00", "R01"];
for (const dep of requiredDeps) {
  if (!r02.depends_on.includes(dep)) fail(`R02 must depend on ${dep}`);
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
  if (r02[flag] !== false) fail(`${flag} must remain false in R02`);
  if (status[flag] !== false) fail(`${flag} must remain false in consolidated status report`);
}

const modules = status.modules ?? [];
if (modules.length !== 15) {
  fail(`Consolidated status report must include 15 modules: M00-M10, R00, R01. Found ${modules.length}`);
}

for (const moduleId of requiredDeps) {
  const entry = modules.find((x) => x.module_id === moduleId);
  if (!entry) fail(`Consolidated status report missing ${moduleId}`);
  if (entry.runtime_status !== "disabled") fail(`${moduleId} runtime_status must be disabled`);
  if (entry.public_output_status !== "disabled") fail(`${moduleId} public_output_status must be disabled`);
  if (!pkg.scripts?.[entry.npm_script]) fail(`Missing npm script for ${moduleId}: ${entry.npm_script}`);
}

if (r02.next_allowed_phase !== "I00") fail("R02 next allowed phase must be I00");
if (r02.runtime_allowed_in_next_phase !== false) fail("Runtime must not be allowed in next phase by R02");
if (r02.public_output_allowed_in_next_phase !== false) fail("Public output must not be allowed in next phase by R02");
if (r02.subscriber_output_allowed_in_next_phase !== false) fail("Subscriber output must not be allowed in next phase by R02");

for (const blocked of [
  "live_panchang_calculation",
  "live_festival_calculation",
  "public_panchang_output",
  "public_festival_output",
  "subscriber_login",
  "auth",
  "supabase",
  "payment",
  "external_api_fetch",
  "lucky_number_output",
  "lucky_colour_output",
  "mantra_output",
  "personalized_guidance_output",
  "premium_guidance",
  "internal_preview_runtime",
  "api_routes",
  "automatic_database_mutation",
  "public_activation"
]) {
  if (!r02.blocked_capabilities.includes(blocked)) fail(`Missing blocked capability in R02: ${blocked}`);
  if (!status.blocked_capabilities.includes(blocked)) fail(`Missing blocked capability in status report: ${blocked}`);
}

for (const focus of [
  "safe_folder_architecture",
  "server_only_boundary_planning",
  "static_methodology_registry_loading_plan",
  "future_database_schema_planning_without_database_activation",
  "feature_flag_plan",
  "deployment_safety_plan",
  "rollback_disable_policy",
  "testing_strategy"
]) {
  if (!r02.i00_allowed_focus.includes(focus)) fail(`Missing I00 allowed focus: ${focus}`);
}

for (const forbidden of [
  "auth_activation",
  "supabase_activation",
  "payment_activation",
  "external_api_fetch",
  "public_panchang_output",
  "public_festival_output",
  "subscriber_output",
  "dashboard_cards",
  "premium_guidance",
  "live_calculation",
  "internal_preview_runtime",
  "automatic_database_mutation"
]) {
  if (!r02.i00_forbidden_actions.includes(forbidden)) fail(`Missing I00 forbidden action: ${forbidden}`);
}

for (const scriptName of ["validate:r02", "validate:methodology"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing required npm script: ${scriptName}`);
}

for (const phrase of [
  "Consolidated Status Report Doctrine",
  "Implementation Planning Gate Doctrine",
  "Blocked Capability Doctrine",
  "I00 Scope Doctrine",
  "Explicit Exclusions",
  "Safety Doctrine",
  "R02 does not implement"
]) {
  if (!r02Doc.includes(phrase)) fail(`R02 document missing phrase: ${phrase}`);
}

for (const phrase of [
  "Consolidated Methodology Status Report",
  "Consolidated Status Matrix",
  "What Is Complete",
  "What Is Still Blocked",
  "Implementation Planning Gate",
  "I00 Boundary Conditions",
  "R02 does not implement runtime"
]) {
  if (!statusDoc.includes(phrase)) fail(`Status report missing phrase: ${phrase}`);
}

pass("R02 registry is present.");
pass("R02 document is present.");
pass("Consolidated methodology status report document and registry are present.");
pass("M00-M10, R00, and R01 are included in the consolidated status report.");
pass("Runtime/Auth/Supabase/payment/API/subscriber/public-output flags remain disabled.");
pass("Blocked capabilities are recorded.");
pass("I00 is declared as the only next allowed phase.");
pass("R02 is review-only and safe to commit.");
