import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70N validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70n-upcoming-observance-computed-event-bank.mjs",
  "scripts/validate-ag70n-upcoming-observance-computed-event-bank.mjs",
  "data/knowledge-base/upcoming-observance/production/observance-event-bank.json",
  "data/knowledge-base/upcoming-observance/production/upcoming-observance-computed-event-bank-batch-01.json",
  "data/knowledge-base/panchang-festival/production/upcoming-observance-computed-event-bank-batch-01.json",
  "data/knowledge-base/panchang-festival/production/ag70n-observance-rule-application-report.json",
  "data/knowledge-base/panchang-festival/production/ag70n-trayodashi-pradosha-window-report.json",
  "data/knowledge-base/upcoming-observance/production/ag70n-no-observance-publication-audit.json",
  "data/knowledge-base/upcoming-observance/production/ag70n-no-external-panchang-source-audit.json",
  "data/content-intelligence/quality-reviews/ag70n-upcoming-observance-computed-event-bank.json",
  "data/content-intelligence/quality-registry/ag70n-ag70o-eclipse-computation-event-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70n-to-ag70o-eclipse-computation-event-bank-boundary.json",
  "data/quality/ag70n-upcoming-observance-computed-event-bank.json",
  "data/quality/ag70n-upcoming-observance-computed-event-bank-preview.json",
  "docs/quality/AG70N_UPCOMING_OBSERVANCE_COMPUTED_EVENT_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70n"]) fail("Missing generate:ag70n script.");
if (!pkg.scripts?.["validate:ag70n"]) fail("Missing validate:ag70n script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70n")) fail("validate:project must include validate:ag70n.");

const eventBank = readJson("data/knowledge-base/upcoming-observance/production/observance-event-bank.json");
if (eventBank.status !== "upcoming_observance_computed_event_bank_batch_01_created_public_blocked") fail("Event bank status mismatch.");
if (eventBank.published_event_record_count !== 0) fail("Published event count must be zero.");
if (eventBank.external_panchang_source_count !== 0) fail("External source count must be zero.");
if (eventBank.public_output_allowed_now !== false) fail("Public output must be blocked.");
if (!Array.isArray(eventBank.records)) fail("Event bank records must be an array.");

const seen = new Set();
for (const event of eventBank.records) {
  if (seen.has(event.observance_event_id)) fail(`Duplicate event id: ${event.observance_event_id}`);
  seen.add(event.observance_event_id);

  if (event.event_status !== "computed_internal_candidate_public_blocked") fail(`Event must be public-blocked candidate: ${event.observance_event_id}`);
  if (event.computed_from_internal_panchang !== true) fail(`Event must come from internal Panchang: ${event.observance_event_id}`);
  if (event.external_panchang_source_used !== false) fail(`External source must be false: ${event.observance_event_id}`);
  if (event.public_output_allowed !== false) fail(`Public output must be false: ${event.observance_event_id}`);
  if (event.publication_status !== "blocked") fail(`Publication must be blocked: ${event.observance_event_id}`);
  if (event.context_interpretation_allowed_now !== false) fail(`Context interpretation must be blocked: ${event.observance_event_id}`);
  if (!event.source_rule_id || !event.panchang_daily_record_id) fail(`Event linkage missing: ${event.observance_event_id}`);
}

const batch = readJson("data/knowledge-base/upcoming-observance/production/upcoming-observance-computed-event-bank-batch-01.json");
if (batch.status !== eventBank.status) fail("Batch event bank status mismatch.");
if (batch.computed_event_record_count !== eventBank.computed_event_record_count) fail("Batch event count mismatch.");

const mirror = readJson("data/knowledge-base/panchang-festival/production/upcoming-observance-computed-event-bank-batch-01.json");
if (mirror.status !== eventBank.status) fail("Panchang mirror status mismatch.");
if (mirror.computed_event_record_count !== eventBank.computed_event_record_count) fail("Panchang mirror event count mismatch.");

const report = readJson("data/knowledge-base/panchang-festival/production/ag70n-observance-rule-application-report.json");
if (report.status !== "observance_rule_application_report_created") fail("Rule application report status mismatch.");
if (report.daily_record_count !== 7) fail("Daily record count must be 7.");
if (report.rule_record_count !== 7) fail("Rule record count must be 7.");
if (report.rule_application_count !== 49) fail("Rule application count must be 49.");
if (report.matched_application_count !== eventBank.computed_event_record_count) fail("Matched application count mismatch.");
if (report.external_panchang_source_used !== false) fail("External source must be false in report.");

const pradosha = readJson("data/knowledge-base/panchang-festival/production/ag70n-trayodashi-pradosha-window-report.json");
if (pradosha.status !== "trayodashi_pradosha_window_report_created") fail("Trayodashi / Pradosha report status mismatch.");
if (pradosha.public_publication_allowed_now !== false) fail("Pradosha public publication must be false.");
if (!Array.isArray(pradosha.records)) fail("Pradosha records must be array.");

const noPublication = readJson("data/knowledge-base/upcoming-observance/production/ag70n-no-observance-publication-audit.json");
if (noPublication.status !== "no_observance_publication_audit_passed") fail("No-publication audit status mismatch.");
if (noPublication.computed_event_record_count !== eventBank.computed_event_record_count) fail("No-publication computed count mismatch.");
if (noPublication.published_event_record_count !== 0) fail("Published count must be zero.");
if (noPublication.public_output_allowed_now !== false) fail("Public output must be false.");
for (const key of ["generated_word_json_modified", "ui_display_changed", "supabase_activation_performed", "backend_runtime_activated"]) {
  if (noPublication[key] !== false) fail(`${key} must be false.`);
}
for (const key of ["context_interpretation_records_created_now", "eclipse_events_created_now"]) {
  if (noPublication[key] !== 0) fail(`${key} must be zero.`);
}

const noExternal = readJson("data/knowledge-base/upcoming-observance/production/ag70n-no-external-panchang-source-audit.json");
if (noExternal.status !== "no_external_panchang_source_audit_passed") fail("No-external audit status mismatch.");
for (const key of [
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_for_data_generation",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_as_production_validation_source",
  "external_panchang_sites_used_for_public_claim"
]) {
  if (noExternal[key] !== false) fail(`${key} must be false.`);
}
if (noExternal.external_source_count !== 0) fail("External source count must be zero.");

const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_upcoming_observance_computed_event_bank_batch_01",
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
  "production_bank_manifest_created_location_intelligence_foundation_closure"
];
if (!allowedPanchangManifestStatuses.includes(panchangManifest.status)) fail("Panchang manifest status mismatch.");
if (panchangManifest.current_counts.observance_events !== eventBank.computed_event_record_count) fail("Manifest observance event count mismatch.");
if (panchangManifest.current_counts.published_observance_events !== 0) fail("Published observance events must be zero.");
if (panchangManifest.current_counts.eclipse_events !== 0) fail("Eclipse events must remain zero until confirmed eclipse event stage.");
if (![0, 7].includes(panchangManifest.current_counts.context_interpretation_records)) fail("Context records must be 0 before AG70Q or 7 after AG70Q internal context-bank creation.");

const upcomingManifest = readJson("data/knowledge-base/upcoming-observance/production/production-bank-manifest.json");
if (upcomingManifest.status !== "production_bank_manifest_created_upcoming_observance_computed_event_bank_batch_01") fail("Upcoming manifest status mismatch.");
if (upcomingManifest.current_counts.computed_observance_event_records !== eventBank.computed_event_record_count) fail("Upcoming manifest event count mismatch.");
if (upcomingManifest.current_counts.published_observance_event_records !== 0) fail("Upcoming manifest published count must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70n-upcoming-observance-computed-event-bank.json");
if (review.status !== "ag70n_upcoming_observance_computed_event_bank_completed") fail("Review status mismatch.");

for (const key of [
  "upcoming_observance_event_bank_created",
  "rule_application_report_created",
  "trayodashi_pradosha_window_report_created",
  "ready_for_ag70o"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_for_data_generation",
  "external_panchang_sites_used_as_runtime_dependency",
  "external_panchang_sites_used_as_validation_source",
  "public_panchang_output_allowed_now",
  "public_observance_output_allowed_now",
  "actual_eclipse_events_created_now",
  "context_interpretation_records_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}
if (review.summary.computed_event_record_count !== eventBank.computed_event_record_count) fail("Review event count mismatch.");
if (review.summary.published_event_record_count !== 0) fail("Review published event count must be zero.");

const readiness = readJson("data/content-intelligence/quality-registry/ag70n-ag70o-eclipse-computation-event-bank-readiness-record.json");
if (readiness.ready_for_ag70o !== true) fail("AG70O readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70n-to-ag70o-eclipse-computation-event-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70O boundary must not auto-start.");
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

pass("AG70N upcoming observance computed event bank is valid.");
pass("Internal observance candidates computed from validated Panchang records and AG70M rules.");
pass("No public publication, no external source dependency, no UI/backend/Supabase activation.");
