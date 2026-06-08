import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70H validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70h-panchang-calculation-source-location-basis-decision.mjs",
  "scripts/validate-ag70h-panchang-calculation-source-location-basis-decision.mjs",
  "data/knowledge-base/panchang-festival/production/ag70h-panchang-calculation-source-location-basis-decision.json",
  "data/knowledge-base/panchang-festival/production/panchang-calculation-source-decision-register.json",
  "data/knowledge-base/panchang-festival/production/panchang-location-basis-policy.json",
  "data/knowledge-base/panchang-festival/production/panchang-timezone-geocoordinate-rule.json",
  "data/knowledge-base/panchang-festival/production/panchang-ayanamsa-decision-register.json",
  "data/knowledge-base/panchang-festival/production/panchang-computation-input-contract.json",
  "data/knowledge-base/panchang-festival/production/panchang-observance-dependency-map.json",
  "data/knowledge-base/panchang-festival/production/panchang-eclipse-calculation-source-decision.json",
  "data/knowledge-base/panchang-festival/production/ag70h-no-panchang-computation-audit.json",
  "data/content-intelligence/quality-reviews/ag70h-panchang-calculation-source-location-basis-decision.json",
  "data/content-intelligence/quality-registry/ag70h-ag70i-panchang-astronomical-computation-model-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70h-to-ag70i-panchang-astronomical-computation-model-boundary.json",
  "data/quality/ag70h-panchang-calculation-source-location-basis-decision.json",
  "data/quality/ag70h-panchang-calculation-source-location-basis-decision-preview.json",
  "docs/quality/AG70H_PANCHANG_CALCULATION_SOURCE_LOCATION_BASIS_DECISION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70h"]) fail("Missing generate:ag70h script.");
if (!pkg.scripts?.["validate:ag70h"]) fail("Missing validate:ag70h script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70h")) fail("validate:project must include validate:ag70h.");

const decision = readJson("data/knowledge-base/panchang-festival/production/ag70h-panchang-calculation-source-location-basis-decision.json");
if (decision.status !== "ag70h_panchang_calculation_source_location_basis_decision_completed") fail("Decision record status mismatch.");
if (decision.corrective_transition_from_ag70g !== true) fail("AG70G corrective transition must be true.");
if (decision.decision_summary.actual_panchang_computation_created_now !== false) fail("No computation should be created.");

const sourceDecision = readJson("data/knowledge-base/panchang-festival/production/panchang-calculation-source-decision-register.json");
if (sourceDecision.status !== "calculation_source_decision_register_created_runtime_source_not_selected") fail("Calculation source decision status mismatch.");
if (sourceDecision.runtime_active_now !== false) fail("Runtime calculation source must be inactive.");
for (const blocked of ["random_panchang_website_as_source_of_truth", "ai_generated_panchang_values", "manual_festival_date_guess"]) {
  if (!sourceDecision.blocked_source_classes.includes(blocked)) fail(`Blocked source class missing: ${blocked}`);
}

const locationPolicy = readJson("data/knowledge-base/panchang-festival/production/panchang-location-basis-policy.json");
if (locationPolicy.status !== "location_basis_policy_created_no_default_public_location_selected") fail("Location policy status mismatch.");
if (locationPolicy.default_public_location_selected_now !== false) fail("No public default location should be selected.");
if (locationPolicy.location_records_created_now !== 0) fail("No location records should be created.");

const ayanamsa = readJson("data/knowledge-base/panchang-festival/production/panchang-ayanamsa-decision-register.json");
if (ayanamsa.status !== "ayanamsa_decision_register_created_ayanamsa_not_selected") fail("Ayanamsa decision status mismatch.");
if (ayanamsa.ayanamsa_selected_now !== false) fail("Ayanamsa must not be selected in AG70H.");

const contract = readJson("data/knowledge-base/panchang-festival/production/panchang-computation-input-contract.json");
if (contract.status !== "panchang_computation_input_contract_created_no_calculation") fail("Computation input contract status mismatch.");
for (const field of ["date_key", "location_id", "latitude", "longitude", "timezone", "ayanamsa_id", "calculation_source_id", "sun_longitude", "moon_longitude"]) {
  if (!contract.required_inputs.includes(field)) fail(`Computation input missing: ${field}`);
}
if (contract.calculation_records_created_now !== 0) fail("No calculation records should be created.");

const dependency = readJson("data/knowledge-base/panchang-festival/production/panchang-observance-dependency-map.json");
if (dependency.status !== "observance_dependency_map_created_no_observance_events") fail("Dependency map status mismatch.");
if (dependency.observance_events_created_now !== 0) fail("No observance events should be created.");
if (dependency.context_interpretation_records_created_now !== 0) fail("No context interpretation records should be created.");

const eclipse = readJson("data/knowledge-base/panchang-festival/production/panchang-eclipse-calculation-source-decision.json");
if (eclipse.status !== "eclipse_calculation_source_decision_created_no_eclipse_events") fail("Eclipse decision status mismatch.");
if (eclipse.eclipse_source_selected_for_runtime_now !== false) fail("Eclipse runtime source must not be selected.");
if (eclipse.eclipse_events_created_now !== 0) fail("No eclipse events should be created.");

const audit = readJson("data/knowledge-base/panchang-festival/production/ag70h-no-panchang-computation-audit.json");
if (audit.status !== "no_panchang_computation_audit_passed") fail("No-computation audit status mismatch.");
for (const key of [
  "calculation_source_selected_for_runtime_now",
  "default_public_location_selected_now",
  "ayanamsa_selected_for_runtime_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (audit[key] !== false) fail(`${key} must be false.`);
}
for (const key of [
  "panchang_daily_records_created_now",
  "observance_events_created_now",
  "eclipse_events_created_now",
  "context_interpretation_records_created_now"
]) {
  if (audit[key] !== 0) fail(`${key} must be zero.`);
}

const correctedReadiness = readJson("data/content-intelligence/quality-registry/ag70g-ag70h-context-interpretation-bank-readiness-record.json");
if (correctedReadiness.status !== "ready_for_ag70h_panchang_calculation_source_location_basis_decision") fail("Corrected AG70G readiness status mismatch.");
if (!String(correctedReadiness.next_stage).includes("Panchang Calculation Source")) fail("Corrected AG70G readiness must point to Panchang stage.");

const correctedBoundary = readJson("data/content-intelligence/mutation-plans/ag70g-to-ag70h-context-interpretation-bank-boundary.json");
if (correctedBoundary.status !== "ag70h_panchang_calculation_source_location_basis_boundary_defined") fail("Corrected AG70G boundary status mismatch.");
if (!correctedBoundary.blocked_scope_without_explicit_approval.includes("context interpretation production records")) {
  fail("Corrected AG70G boundary must block context interpretation records.");
}

const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_panchang_calculation_source_location_basis_decision",
  "production_bank_manifest_created_internal_panchang_astronomical_computation_model",
  "production_bank_manifest_created_panchang_computation_basis_lock_daily_bank_batch_01",
  "production_bank_manifest_created_internal_panchang_daily_computation_engine_dry_run",
  "production_bank_manifest_created_computed_panchang_daily_bank_internal_validation",
  "production_bank_manifest_created_festival_observance_rule_bank_batch_01",
  "production_bank_manifest_created_upcoming_observance_computed_event_bank_batch_01",
  "production_bank_manifest_created_eclipse_computation_event_bank_batch_01"
];
if (!allowedPanchangManifestStatuses.includes(panchangManifest.status)) fail("Panchang manifest status mismatch.");
if (![0, 7].includes(panchangManifest.current_counts.panchang_daily_records)) fail("Panchang daily records must be 0 before AG70K or 7 after AG70K.");
if (![0, 2].includes(panchangManifest.current_counts.observance_events)) fail("Observance events must be 0 before AG70N or 2 after AG70N internal candidate generation.");
if (panchangManifest.current_counts.eclipse_events !== 0) fail("Eclipse events must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70h-panchang-calculation-source-location-basis-decision.json");
if (review.status !== "ag70h_panchang_calculation_source_location_basis_decision_completed") fail("Review status mismatch.");
for (const key of [
  "ag70g_transition_corrected",
  "panchang_calculation_source_decision_created",
  "location_basis_policy_created",
  "timezone_geocoordinate_rule_created",
  "ayanamsa_decision_register_created",
  "computation_input_contract_created",
  "observance_dependency_map_created",
  "eclipse_calculation_source_decision_created",
  "panchang_manifest_updated",
  "ready_for_ag70i"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "calculation_source_selected_for_runtime_now",
  "default_public_location_selected_now",
  "ayanamsa_selected_for_runtime_now",
  "actual_panchang_daily_records_created_now",
  "actual_observance_events_created_now",
  "actual_eclipse_events_created_now",
  "context_interpretation_records_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70h-ag70i-panchang-astronomical-computation-model-readiness-record.json");
if (readiness.ready_for_ag70i !== true) fail("AG70I readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70h-to-ag70i-panchang-astronomical-computation-model-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70I boundary must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "actual festival/observance date publication",
  "actual eclipse event publication",
  "context interpretation production records",
  "generated/word-of-day.json replacement",
  "Supabase/database writes"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG70H Panchang calculation source/location basis decision is valid.");
pass("AG70G transition is corrected to Panchang production path.");
pass("No Panchang computation, observance, eclipse, context, UI or backend activation is recorded.");
