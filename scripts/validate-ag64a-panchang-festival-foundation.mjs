import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG64A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/content-intelligence/quality-reviews/ag63z-word-of-the-day-closure.json",
  "scripts/generate-ag64a-panchang-festival-foundation.mjs",
  "scripts/validate-ag64a-panchang-festival-foundation.mjs",
  "data/content-intelligence/quality-reviews/ag64a-panchang-festival-foundation.json",
  "data/content-intelligence/phase-01-modules/ag64a-panchang-festival-source-consumption-record.json",
  "data/initial-working-data/panchang-festival/ag64a-panchang-festival-initial-working-data.json",
  "data/initial-working-data/panchang-festival/ag64a-panchang-festival-source-registry.json",
  "data/methodology/panchang-festival/ag64a-location-date-basis-schema.json",
  "data/methodology/panchang-festival/ag64a-panchang-festival-methodology.json",
  "data/initial-working-data/panchang-festival/ag64a-observance-registry-safe-preview.json",
  "data/methodology/panchang-festival/ag64a-panchang-festival-ai-token-policy.json",
  "data/feedback/panchang-festival/ag64a-panchang-festival-user-feedback-schema.json",
  "data/feedback/panchang-festival/ag64a-panchang-festival-admin-review-absorption-schema.json",
  "generated/panchang-festival-working-data.json",
  "data/content-intelligence/quality-registry/ag64a-ag64b-panchang-festival-ui-wiring-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag64a-to-ag64b-panchang-festival-ui-wiring-boundary.json",
  "data/content-intelligence/backend-architecture/ag64a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag64a-no-v02-expansion-audit.json",
  "data/quality/ag64a-panchang-festival-foundation.json",
  "data/quality/ag64a-panchang-festival-foundation-preview.json",
  "docs/quality/AG64A_PANCHANG_FESTIVAL_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag64a"]) fail("Missing generate:ag64a script.");
if (!pkg.scripts?.["validate:ag64a"]) fail("Missing validate:ag64a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag64a")) fail("validate:project must include validate:ag64a.");

const indexHtml = read("index.html");
for (const snippet of [
  "panchang-place-select",
  "panchang-sunrise",
  "panchang-sunset",
  "panchang-moonrise",
  "panchang-moonset",
  "panchang-tithi",
  "panchang-nakshatra",
  "panchang-yoga",
  "panchang-paksha",
  "upcoming-observance-title",
  "upcoming-observance-name",
  "upcoming-observance-note",
  "data-drishvara-ag60i-panchang-preview-safe"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing Panchang UI target: ${snippet}`);
}

const initial = readJson("data/initial-working-data/panchang-festival/ag64a-panchang-festival-initial-working-data.json");
const registry = readJson("data/initial-working-data/panchang-festival/ag64a-panchang-festival-source-registry.json");
const basis = readJson("data/methodology/panchang-festival/ag64a-location-date-basis-schema.json");
const methodology = readJson("data/methodology/panchang-festival/ag64a-panchang-festival-methodology.json");
const observance = readJson("data/initial-working-data/panchang-festival/ag64a-observance-registry-safe-preview.json");
const aiPolicy = readJson("data/methodology/panchang-festival/ag64a-panchang-festival-ai-token-policy.json");
const feedback = readJson("data/feedback/panchang-festival/ag64a-panchang-festival-user-feedback-schema.json");
const admin = readJson("data/feedback/panchang-festival/ag64a-panchang-festival-admin-review-absorption-schema.json");
const generated = readJson("generated/panchang-festival-working-data.json");
const review = readJson("data/content-intelligence/quality-reviews/ag64a-panchang-festival-foundation.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag64a-ag64b-panchang-festival-ui-wiring-readiness-record.json");
const preview = readJson("data/quality/ag64a-panchang-festival-foundation-preview.json");

if (initial.status !== "initial_working_data_created_not_publicly_wired") fail("Initial working data status mismatch.");
if (initial.public_ui_activation_status !== "not_wired_in_ag64a") fail("Public UI must not be wired in AG64A.");
if (!Array.isArray(initial.supported_locations) || initial.supported_locations.length < 5) fail("Supported locations incomplete.");

if (registry.live_source_fetching_enabled !== false) fail("Live source fetching must be false.");
if (registry.external_api_enabled !== false) fail("External API must be false.");
if (registry.calculation_library_enabled !== false) fail("Calculation library must be false.");

if (basis.calculation_engine_active_now !== false) fail("Calculation engine must be false.");
if (methodology.status !== "methodology_created_not_runtime_active") fail("Methodology status mismatch.");
if (!methodology.principles.some((rule) => rule.includes("location-aware"))) fail("Location-aware rule missing.");
if (!methodology.principles.some((rule) => rule.includes("Sunrise basis"))) fail("Sunrise basis rule missing.");

if (observance.dynamic_observance_selection_active !== false) fail("Dynamic observance selection must be false.");
if (aiPolicy.ai_runtime_active !== false) fail("AI runtime must be false.");
if (aiPolicy.user_triggered_ai_allowed !== false) fail("User-triggered AI must be false.");
if (feedback.user_feedback_allowed_now !== false) fail("User feedback must not be active.");
if (admin.automatic_absorption_allowed !== false) fail("Automatic absorption must be false.");

if (generated.status !== "initial_panchang_festival_ready_not_publicly_wired") fail("Generated data status mismatch.");
if (generated.public_ui_ready !== false) fail("Generated data public_ui_ready must be false.");
if (generated.live_calculation_active !== false) fail("Live calculation must be false.");
if (generated.external_api_fetch_active !== false) fail("External API fetch must be false.");
if (generated.dynamic_observance_selection_active !== false) fail("Dynamic observance selection must be false.");
if (generated.ai_generation_active !== false) fail("AI generation must be false.");
if (generated.panchang.tithi !== "Withheld until verified") fail("Tithi must remain withheld.");
if (generated.panchang.nakshatra !== "Withheld until verified") fail("Nakshatra must remain withheld.");
if (generated.panchang.yoga !== "Withheld until verified") fail("Yoga must remain withheld.");
if (generated.panchang.paksha !== "Withheld until verified") fail("Paksha must remain withheld.");

for (const forbidden of [
  "06:13 AM",
  "06:54 PM",
  "02:19 AM",
  "11:49 AM",
  "Ashtami → Navami",
  "Purva Ashadha",
  "Shiva → Siddha",
  "Krishna Paksha"
]) {
  if (JSON.stringify(generated).includes(forbidden)) fail(`Forbidden exact Panchang value found in generated data: ${forbidden}`);
}

if (review.status !== "ag64a_panchang_festival_foundation_completed") fail("Review status mismatch.");
if (review.summary.initial_working_data_created !== true) fail("Initial working summary missing.");
if (review.summary.source_registry_created !== true) fail("Source registry summary missing.");
if (review.summary.location_date_schema_created !== true) fail("Location/date schema summary missing.");
if (review.summary.methodology_created !== true) fail("Methodology summary missing.");
if (review.summary.observance_registry_created !== true) fail("Observance registry summary missing.");
if (review.summary.generated_panchang_festival_data_created !== true) fail("Generated data summary missing.");
if (review.summary.ui_wired_now !== false) fail("UI wiring must be false in AG64A.");
if (review.summary.live_calculation_active !== false) fail("Live calculation must be false.");
if (review.summary.external_api_fetch_active !== false) fail("External API must be false.");
if (review.summary.ai_generation_active !== false) fail("AI generation must be false.");
if (review.summary.exact_panchang_values_published !== false) fail("Exact Panchang values must be false.");
if (review.summary.festival_date_decision_published !== false) fail("Festival date decision must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag64b !== true) fail("AG64B readiness missing.");

if (readiness.ready_for_ag64b !== true) fail("AG64B readiness must be true.");
if (preview.ready_for_ag64b !== 1) fail("Preview AG64B readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag64a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag64a-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG64A Panchang & Festival Foundation is present.");
pass("Panchang/Festival UI targets are confirmed.");
pass("Initial working data, source registry, methodology, location/date schema and observance registry are present.");
pass("generated/panchang-festival-working-data.json is created with withheld values.");
pass("No live calculation, external API, runtime AI, backend or V02 action is recorded.");
pass("AG64B Panchang & Festival UI Wiring readiness is valid.");
