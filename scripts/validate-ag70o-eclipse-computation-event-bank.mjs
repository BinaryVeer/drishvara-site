import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70O validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70o-eclipse-computation-event-bank.mjs",
  "scripts/validate-ag70o-eclipse-computation-event-bank.mjs",
  "data/knowledge-base/panchang-festival/production/eclipse-computation-model.json",
  "data/knowledge-base/panchang-festival/production/eclipse-computation-screening-bank-batch-01.json",
  "data/knowledge-base/panchang-festival/production/eclipse-computation-event-bank-batch-01.json",
  "data/knowledge-base/panchang-festival/production/eclipse-event-bank.json",
  "data/knowledge-base/panchang-festival/production/ag70o-eclipse-node-requirement-record.json",
  "data/knowledge-base/panchang-festival/production/ag70o-no-eclipse-publication-audit.json",
  "data/knowledge-base/panchang-festival/production/ag70o-no-external-eclipse-source-audit.json",
  "data/content-intelligence/quality-reviews/ag70o-eclipse-computation-event-bank.json",
  "data/content-intelligence/quality-registry/ag70o-ag70p-panchang-computation-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70o-to-ag70p-panchang-computation-verification-boundary.json",
  "data/quality/ag70o-eclipse-computation-event-bank.json",
  "data/quality/ag70o-eclipse-computation-event-bank-preview.json",
  "docs/quality/AG70O_ECLIPSE_COMPUTATION_EVENT_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70o"]) fail("Missing generate:ag70o script.");
if (!pkg.scripts?.["validate:ag70o"]) fail("Missing validate:ag70o script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70o")) fail("validate:project must include validate:ag70o.");

const model = readJson("data/knowledge-base/panchang-festival/production/eclipse-computation-model.json");
if (model.status !== "eclipse_computation_model_created_node_dependency_explicit") fail("Eclipse model status mismatch.");
if (model.production_rule !== "No eclipse event may be confirmed or published without internal node-distance and visibility/contact-time computation.") fail("Eclipse production rule mismatch.");
for (const key of [
  "external_eclipse_sites_used_as_source",
  "external_eclipse_sites_used_for_data_generation",
  "external_eclipse_sites_used_as_runtime_dependency"
]) {
  if (model[key] !== false) fail(`${key} must be false.`);
}

const screening = readJson("data/knowledge-base/panchang-festival/production/eclipse-computation-screening-bank-batch-01.json");
if (screening.status !== "eclipse_computation_screening_bank_batch_01_created_public_blocked") fail("Screening bank status mismatch.");
if (screening.screening_record_count !== 7) fail("Screening record count must be 7.");
if (screening.confirmed_eclipse_event_count !== 0) fail("Confirmed eclipse event count must be zero.");
if (screening.published_eclipse_event_count !== 0) fail("Published eclipse event count must be zero.");
if (screening.external_source_count !== 0) fail("External source count must be zero.");
if (screening.public_output_allowed_now !== false) fail("Public output must be blocked.");
for (const record of screening.records) {
  if (record.computed_from_internal_panchang !== true) fail(`Screening record must be internal: ${record.eclipse_screening_record_id}`);
  if (record.external_eclipse_source_used !== false) fail(`External source must be false: ${record.eclipse_screening_record_id}`);
  if (record.public_output_allowed !== false) fail(`Public output must be blocked: ${record.eclipse_screening_record_id}`);
  if (record.eclipse_confirmed_now !== false) fail(`Eclipse must not be confirmed now: ${record.eclipse_screening_record_id}`);
}

const eventBank = readJson("data/knowledge-base/panchang-festival/production/eclipse-computation-event-bank-batch-01.json");
if (eventBank.status !== "eclipse_computation_event_bank_batch_01_created_no_confirmed_events_public_blocked") fail("Eclipse event bank status mismatch.");
if (eventBank.confirmed_eclipse_event_count !== 0) fail("Confirmed event count must be zero.");
if (eventBank.published_eclipse_event_count !== 0) fail("Published event count must be zero.");
if (eventBank.external_eclipse_source_count !== 0) fail("External source count must be zero.");
if (eventBank.public_output_allowed_now !== false) fail("Public output must be blocked.");
if (!Array.isArray(eventBank.records) || eventBank.records.length !== 0) fail("Confirmed eclipse event records must be empty.");

const mirror = readJson("data/knowledge-base/panchang-festival/production/eclipse-event-bank.json");
if (mirror.status !== eventBank.status) fail("Eclipse event bank mirror status mismatch.");
if (mirror.confirmed_eclipse_event_count !== 0) fail("Mirror confirmed count must be zero.");

const nodeReq = readJson("data/knowledge-base/panchang-festival/production/ag70o-eclipse-node-requirement-record.json");
if (nodeReq.status !== "eclipse_node_requirement_record_created") fail("Node requirement status mismatch.");
if (nodeReq.confirmed_events_blocked_until_node_model !== true) fail("Confirmed events must be blocked until node model.");
if (nodeReq.public_output_allowed_now !== false) fail("Node requirement public output must be false.");

const noPub = readJson("data/knowledge-base/panchang-festival/production/ag70o-no-eclipse-publication-audit.json");
if (noPub.status !== "no_eclipse_publication_audit_passed") fail("No-publication audit status mismatch.");
if (noPub.confirmed_eclipse_event_count !== 0) fail("No-publication confirmed count must be zero.");
if (noPub.published_eclipse_event_count !== 0) fail("No-publication published count must be zero.");
for (const key of ["public_eclipse_output_allowed_now", "public_panchang_output_allowed_now", "generated_word_json_modified", "ui_display_changed", "supabase_activation_performed", "backend_runtime_activated"]) {
  if (noPub[key] !== false) fail(`${key} must be false.`);
}
if (noPub.context_interpretation_records_created_now !== 0) fail("Context records must be zero.");

const noExt = readJson("data/knowledge-base/panchang-festival/production/ag70o-no-external-eclipse-source-audit.json");
if (noExt.status !== "no_external_eclipse_source_audit_passed") fail("No-external audit status mismatch.");
for (const key of [
  "external_panchang_sites_used_as_source",
  "external_eclipse_sites_used_as_source",
  "external_sites_used_for_data_generation",
  "external_sites_used_as_runtime_dependency",
  "external_sites_used_as_production_validation_source",
  "external_sites_used_for_public_claim"
]) {
  if (noExt[key] !== false) fail(`${key} must be false.`);
}
if (noExt.external_source_count !== 0) fail("External source count must be zero.");

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_eclipse_computation_event_bank_batch_01",
  "production_bank_manifest_created_panchang_computation_verification_policy",
  "production_bank_manifest_created_panchang_context_interpretation_bank_batch_01",
  "production_bank_manifest_created_today_panchang_context_preview_output_test",
  "production_bank_manifest_created_today_panchang_preview_manual_verification_gate",
  "production_bank_manifest_created_location_intelligence_registry_panchang_basis_normalisation",
  "production_bank_manifest_created_location_import_selection_validation",
  "production_bank_manifest_created_india_administrative_location_import_bank",
  "production_bank_manifest_created_india_cities_capitals_coordinate_bank",
  "production_bank_manifest_created_global_capitals_major_cities_coordinate_bank",
  "production_bank_manifest_created_location_selection_resolver_test",
  "production_bank_manifest_created_location_intelligence_foundation_closure",
  "production_bank_manifest_created_verified_four_location_pilot_activation",
  "production_bank_manifest_created_pilot_runtime_validation"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.eclipse_screening_records !== 7) fail("Manifest screening record count must be 7.");
if (manifest.current_counts.eclipse_events !== 0) fail("Manifest eclipse events must be zero.");
if (manifest.current_counts.confirmed_eclipse_events !== 0) fail("Manifest confirmed eclipse events must be zero.");
if (manifest.current_counts.published_eclipse_events !== 0) fail("Manifest published eclipse events must be zero.");
if (![0, 7].includes(manifest.current_counts.context_interpretation_records)) fail("Manifest context records must be 0 before AG70Q or 7 after AG70Q.");

const review = readJson("data/content-intelligence/quality-reviews/ag70o-eclipse-computation-event-bank.json");
if (review.status !== "ag70o_eclipse_computation_event_bank_completed") fail("Review status mismatch.");
for (const key of [
  "eclipse_computation_model_created",
  "eclipse_screening_bank_created",
  "eclipse_event_bank_created",
  "node_requirement_record_created",
  "confirmed_events_blocked_until_node_model",
  "ready_for_ag70p"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "external_panchang_sites_used_as_source",
  "external_eclipse_sites_used_as_source",
  "external_sites_used_for_data_generation",
  "external_sites_used_as_runtime_dependency",
  "external_sites_used_as_validation_source",
  "public_panchang_output_allowed_now",
  "public_eclipse_output_allowed_now",
  "context_interpretation_records_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}
if (review.summary.confirmed_eclipse_event_count !== 0) fail("Review confirmed eclipse count must be zero.");
if (review.summary.published_eclipse_event_count !== 0) fail("Review published eclipse count must be zero.");

const readiness = readJson("data/content-intelligence/quality-registry/ag70o-ag70p-panchang-computation-verification-readiness-record.json");
if (readiness.ready_for_ag70p !== true) fail("AG70P readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70o-to-ag70p-panchang-computation-verification-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70P boundary must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "public observance event publication",
  "public eclipse event publication",
  "context interpretation production records",
  "generated/word-of-day.json replacement",
  "external Panchang site as source of truth",
  "external Panchang site as data-generation input",
  "external Panchang site as runtime dependency",
  "external Panchang site as production validation source"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG70O eclipse computation/event bank is valid.");
pass("Eclipse screening records created with confirmed/public eclipse events blocked.");
pass("No external source dependency, no public output, no UI/backend/Supabase activation.");
