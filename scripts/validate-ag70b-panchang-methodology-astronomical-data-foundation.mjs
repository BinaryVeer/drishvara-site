import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70b-panchang-methodology-astronomical-data-foundation.mjs",
  "scripts/validate-ag70b-panchang-methodology-astronomical-data-foundation.mjs",
  "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  "data/knowledge-base/panchang-festival/production/astronomical-calculation-model.json",
  "data/knowledge-base/panchang-festival/production/location-coordinate-bank.json",
  "data/knowledge-base/panchang-festival/production/panchang-element-master-bank.json",
  "data/knowledge-base/panchang-festival/production/panchang-element-derivation-rules.json",
  "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json",
  "data/knowledge-base/upcoming-observance/production/upcoming-observance-schema.json",
  "data/knowledge-base/upcoming-observance/production/observance-event-bank.json",
  "data/knowledge-base/panchang-festival/production/eclipse-bank-schema.json",
  "data/knowledge-base/panchang-festival/production/eclipse-event-bank.json",
  "data/knowledge-base/panchang-festival/production/daily-panchang-calculation-bank.json",
  "data/knowledge-base/panchang-festival/production/panchang-to-word-context-connector.json",
  "data/content-intelligence/quality-reviews/ag70b-panchang-methodology-astronomical-data-foundation.json",
  "data/content-intelligence/quality-registry/ag70b-ag70c-sanskrit-lexical-engine-data-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70b-to-ag70c-sanskrit-lexical-engine-data-model-boundary.json",
  "data/quality/ag70b-panchang-methodology-astronomical-data-foundation.json",
  "data/quality/ag70b-panchang-methodology-astronomical-data-foundation-preview.json",
  "docs/quality/AG70B_PANCHANG_METHODOLOGY_ASTRONOMICAL_DATA_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70b"]) fail("Missing generate:ag70b script.");
if (!pkg.scripts?.["validate:ag70b"]) fail("Missing validate:ag70b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70b")) {
  fail("validate:project must include validate:ag70b.");
}

const master = readJson("data/knowledge-base/panchang-festival/production/panchang-element-master-bank.json");
if (master.status !== "panchang_element_master_bank_created_pending_source_attachment") fail("Master bank status mismatch.");
if (master.tithi_count !== 30) fail("Tithi count must be 30.");
if (master.nakshatra_count !== 27) fail("Nakshatra count must be 27.");
if (master.yoga_count !== 27) fail("Yoga count must be 27.");
if (master.karana_count !== 11) fail("Karana count must be 11.");
if (master.vara_count !== 7) fail("Vara count must be 7.");
if (master.paksha_count !== 2) fail("Paksha count must be 2.");
if (master.approved_for_public_output_now !== false) fail("Master bank must not be public-output approved.");

const astro = readJson("data/knowledge-base/panchang-festival/production/astronomical-calculation-model.json");
if (astro.status !== "astronomical_calculation_model_defined_not_runtime_active") fail("Astronomical model status mismatch.");
for (const field of ["sun_geocentric_longitude", "moon_geocentric_longitude", "latitude", "longitude", "sunrise_local", "sunset_local"]) {
  if (!astro.required_inputs.includes(field)) fail(`Astronomical input missing: ${field}`);
}
if (astro.calculation_runtime_active_now !== false) fail("Calculation runtime must be inactive.");

const location = readJson("data/knowledge-base/panchang-festival/production/location-coordinate-bank.json");
if (location.status !== "location_coordinate_bank_schema_created_no_public_location_selected") fail("Location bank status mismatch.");
if (!Array.isArray(location.locations) || location.locations.length !== 0) fail("Location bank must not include unreviewed location records.");
for (const field of ["latitude", "longitude", "timezone", "review_status"]) {
  if (!location.required_location_fields.includes(field)) fail(`Location field missing: ${field}`);
}

const rules = readJson("data/knowledge-base/panchang-festival/production/panchang-element-derivation-rules.json");
if (rules.status !== "panchang_element_derivation_rules_defined_not_runtime_active") fail("Derivation rules status mismatch.");
for (const id of ["tithi_derivation", "nakshatra_derivation", "yoga_derivation", "karana_derivation", "vara_derivation"]) {
  if (!rules.rules.some((r) => r.rule_id === id)) fail(`Derivation rule missing: ${id}`);
}
if (rules.runtime_calculation_active_now !== false) fail("Runtime calculation must be inactive.");

const obs = readJson("data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json");
if (obs.status !== "observance_rule_bank_schema_created_rules_pending_population") fail("Observance rule bank status mismatch.");
if (obs.rules.length !== 0) fail("Actual observance rules should not be populated in AG70B.");
for (const field of ["start_datetime_rule", "end_datetime_rule", "source_reference_ids", "review_status"]) {
  if (!obs.required_rule_fields.includes(field)) fail(`Observance rule field missing: ${field}`);
}

const upcoming = readJson("data/knowledge-base/upcoming-observance/production/upcoming-observance-schema.json");
if (upcoming.status !== "upcoming_observance_schema_created_no_events_published") fail("Upcoming schema status mismatch.");
for (const field of ["start_datetime_local", "end_datetime_local", "observance_date_local", "rule_applied"]) {
  if (!upcoming.required_fields.includes(field)) fail(`Upcoming observance field missing: ${field}`);
}

const eventBank = readJson("data/knowledge-base/upcoming-observance/production/observance-event-bank.json");
if (eventBank.event_count !== 0) fail("Observance event bank must be empty in AG70B.");

const eclipseSchema = readJson("data/knowledge-base/panchang-festival/production/eclipse-bank-schema.json");
if (eclipseSchema.status !== "eclipse_bank_schema_created_no_events_published") fail("Eclipse schema status mismatch.");
for (const field of ["eclipse_type", "start_datetime_utc", "maximum_datetime_utc", "end_datetime_utc", "visibility_region"]) {
  if (!eclipseSchema.required_fields.includes(field)) fail(`Eclipse field missing: ${field}`);
}

const eclipseBank = readJson("data/knowledge-base/panchang-festival/production/eclipse-event-bank.json");
if (eclipseBank.event_count !== 0) fail("Eclipse event bank must be empty in AG70B.");

const daily = readJson("data/knowledge-base/panchang-festival/production/daily-panchang-calculation-bank.json");
if (daily.calculation_record_count !== 0) fail("Daily Panchang calculation bank must be empty in AG70B.");
if (daily.calculation_runtime_active_now !== false) fail("Daily calculation runtime must be inactive.");

const connector = readJson("data/knowledge-base/panchang-festival/production/panchang-to-word-context-connector.json");
if (connector.status !== "panchang_to_word_context_connector_defined_not_runtime_active") fail("Panchang-to-Word connector status mismatch.");
if (connector.runtime_connector_active_now !== false) fail("Panchang-to-Word connector must be inactive.");
for (const field of ["tithi", "nakshatra", "yoga", "karana", "paksha", "vara", "festival_context"]) {
  if (!connector.input_context_fields.includes(field)) fail(`Connector input missing: ${field}`);
}
for (const downstream of ["Sanskrit Morphology Engine", "Sanskrit Etymology Engine", "Sanskrit Semantics Engine"]) {
  if (!connector.downstream_dependency.includes(downstream)) fail(`Downstream dependency missing: ${downstream}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag70b-panchang-methodology-astronomical-data-foundation.json");
if (review.status !== "ag70b_panchang_methodology_astronomical_data_foundation_completed") fail("Review status mismatch.");

for (const key of [
  "panchang_foundation_created",
  "astronomical_calculation_model_defined",
  "location_coordinate_bank_schema_created",
  "panchang_element_master_bank_created",
  "derivation_rules_defined",
  "observance_rule_bank_schema_created",
  "upcoming_observance_schema_created",
  "eclipse_bank_schema_created",
  "daily_calculation_bank_created_empty",
  "panchang_to_word_context_connector_defined",
  "ready_for_ag70c"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "actual_panchang_calculations_created_now",
  "actual_observance_events_created_now",
  "actual_eclipse_events_created_now",
  "public_panchang_output_created_now",
  "public_word_generation_allowed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70b-ag70c-sanskrit-lexical-engine-data-model-readiness-record.json");
if (readiness.ready_for_ag70c !== true) fail("AG70C readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70b-to-ag70c-sanskrit-lexical-engine-data-model-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "actual festival date publication",
  "actual eclipse date publication",
  "generated/word-of-day.json replacement",
  "runtime Panchang calculation activation",
  "AI-fabricated Sanskrit or meaning records"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) {
    fail(`Boundary blocker missing: ${blocker}`);
  }
}

pass("AG70B Panchang foundation is valid.");
pass("Astronomical model, location schema, Panchang master bank and derivation rules are valid.");
pass("Upcoming observance and eclipse schemas are valid.");
pass("Panchang-to-Word context connector is valid.");
pass("No actual Panchang calculation, festival event, eclipse event, UI/output/backend activation is recorded.");
