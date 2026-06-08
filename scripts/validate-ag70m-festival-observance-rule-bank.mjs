import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70M validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70m-festival-observance-rule-bank.mjs",
  "scripts/validate-ag70m-festival-observance-rule-bank.mjs",
  "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json",
  "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank-batch-01.json",
  "data/knowledge-base/panchang-festival/production/panchang-to-observance-rule-connector.json",
  "data/knowledge-base/panchang-festival/production/observance-rule-eligibility-map.json",
  "data/knowledge-base/panchang-festival/production/ag70m-no-observance-event-publication-audit.json",
  "data/knowledge-base/panchang-festival/production/ag70m-no-external-panchang-source-audit.json",
  "data/content-intelligence/quality-reviews/ag70m-festival-observance-rule-bank.json",
  "data/content-intelligence/quality-registry/ag70m-ag70n-upcoming-observance-computed-event-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70m-to-ag70n-upcoming-observance-computed-event-bank-boundary.json",
  "data/quality/ag70m-festival-observance-rule-bank.json",
  "data/quality/ag70m-festival-observance-rule-bank-preview.json",
  "docs/quality/AG70M_FESTIVAL_OBSERVANCE_RULE_BANK.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70m"]) fail("Missing generate:ag70m script.");
if (!pkg.scripts?.["validate:ag70m"]) fail("Missing validate:ag70m script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70m")) fail("validate:project must include validate:ag70m.");

const ruleBank = readJson("data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json");
if (ruleBank.status !== "festival_observance_rule_bank_batch_01_created_event_publication_blocked") fail("Rule bank status mismatch.");
if (ruleBank.rule_record_count !== 7) fail("Rule count must be 7.");
if (ruleBank.approved_for_event_candidate_computation_count !== 7) fail("Candidate computation rule count must be 7.");
if (ruleBank.public_publication_rule_count !== 0) fail("Public publication rule count must be zero.");
if (ruleBank.external_panchang_source_count !== 0) fail("External source count must be zero.");
if (ruleBank.observance_event_records_created_now !== 0) fail("No observance events should be created.");

const requiredRules = new Set([
  "observance_rule_ekadashi_vrata_internal_v1",
  "observance_rule_purnima_internal_v1",
  "observance_rule_amavasya_internal_v1",
  "observance_rule_trayodashi_pradosha_internal_v1",
  "observance_rule_sankashti_chaturthi_internal_v1",
  "observance_rule_vinayaka_chaturthi_monthly_internal_v1",
  "observance_rule_masik_shivaratri_internal_v1"
]);

for (const rule of ruleBank.records) {
  if (!requiredRules.has(rule.rule_id)) fail(`Unexpected or missing rule id: ${rule.rule_id}`);
  if (rule.approved_for_event_candidate_computation !== true) fail(`Rule must be candidate-computation approved: ${rule.rule_id}`);
  if (rule.approved_for_public_publication_now !== false) fail(`Rule must not be public-approved: ${rule.rule_id}`);
  if (rule.public_claim_allowed_now !== false) fail(`Public claim must be blocked: ${rule.rule_id}`);
  if (rule.external_panchang_source_used !== false) fail(`External Panchang source must not be used: ${rule.rule_id}`);
  if (!Array.isArray(rule.trigger.tithi_indices) || rule.trigger.tithi_indices.length === 0) fail(`Rule trigger tithi missing: ${rule.rule_id}`);
  if (!Array.isArray(rule.required_panchang_fields) || rule.required_panchang_fields.length === 0) fail(`Required fields missing: ${rule.rule_id}`);

  if (rule.rule_id === "observance_rule_trayodashi_pradosha_internal_v1") {
    if (rule.display_name !== "Trayodashi / Pradosha") fail("Trayodashi / Pradosha display name mismatch.");
    if (rule.observance_key !== "trayodashi_pradosha") fail("Trayodashi / Pradosha key mismatch.");
    if (!rule.trigger.tithi_indices.includes(13) || !rule.trigger.tithi_indices.includes(28)) fail("Trayodashi / Pradosha must use Trayodashi tithi indices 13 and 28.");
    if (rule.event_window_basis !== "trayodashi_tithi_window_intersecting_evening_pradosha_window") fail("Trayodashi / Pradosha event window basis mismatch.");
  }
}

const connector = readJson("data/knowledge-base/panchang-festival/production/panchang-to-observance-rule-connector.json");
if (connector.status !== "panchang_to_observance_rule_connector_created_no_events") fail("Connector status mismatch.");
if (connector.event_records_created_now !== 0) fail("Connector must not create events.");
if (connector.public_output_allowed_now !== false) fail("Connector public output must be blocked.");
if (!connector.connector_logic.some((line) => line.includes("Trayodashi") && line.includes("Pradosha"))) fail("Connector must include Trayodashi / Pradosha modelling note.");

const eligibility = readJson("data/knowledge-base/panchang-festival/production/observance-rule-eligibility-map.json");
if (eligibility.status !== "observance_rule_eligibility_map_created_no_events") fail("Eligibility map status mismatch.");
if (eligibility.rule_ids.length !== 7) fail("Eligibility rule ids must be 7.");
if (!eligibility.rule_ids.includes("observance_rule_trayodashi_pradosha_internal_v1")) fail("Eligibility must include Trayodashi / Pradosha rule.");
if (eligibility.event_records_created_now !== 0) fail("Eligibility map must not create events.");

const noEvent = readJson("data/knowledge-base/panchang-festival/production/ag70m-no-observance-event-publication-audit.json");
if (noEvent.status !== "no_observance_event_publication_audit_passed") fail("No-event audit status mismatch.");
if (noEvent.observance_event_records_created_now !== 0) fail("No observance event records should be created.");
if (noEvent.published_observance_event_count !== 0) fail("Published observance count must be zero.");
if (noEvent.public_panchang_output_allowed_now !== false) fail("Public Panchang output must be false.");

const noExternal = readJson("data/knowledge-base/panchang-festival/production/ag70m-no-external-panchang-source-audit.json");
if (noExternal.status !== "no_external_panchang_source_audit_passed") fail("No external audit status mismatch.");
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
  "production_bank_manifest_created_festival_observance_rule_bank_batch_01",
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
  "production_bank_manifest_created_location_selection_resolver_test"
];
if (!allowedPanchangManifestStatuses.includes(panchangManifest.status)) fail("Panchang manifest status mismatch.");
if (panchangManifest.current_counts.festival_observance_rule_records !== 7) fail("Manifest rule count must be 7.");
if (panchangManifest.current_counts.observance_events < 0) fail("Manifest observance events cannot be negative.");
if (panchangManifest.current_counts.published_observance_events !== 0) fail("Manifest published observance events must remain zero.");
if (panchangManifest.current_counts.eclipse_events !== 0) fail("Manifest eclipse events must be zero.");
if (![0, 7].includes(panchangManifest.current_counts.context_interpretation_records)) fail("Manifest context records must be 0 before AG70Q or 7 after AG70Q.");

const review = readJson("data/content-intelligence/quality-reviews/ag70m-festival-observance-rule-bank.json");
if (review.status !== "ag70m_festival_observance_rule_bank_completed") fail("Review status mismatch.");

for (const key of [
  "festival_observance_rule_bank_created",
  "panchang_to_rule_connector_created",
  "rule_eligibility_map_created",
  "ekadashi_rule_created",
  "purnima_rule_created",
  "amavasya_rule_created",
  "trayodashi_pradosha_rule_created",
  "sankashti_chaturthi_rule_created",
  "vinayaka_chaturthi_monthly_rule_created",
  "masik_shivaratri_rule_created",
  "ready_for_ag70n"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "observance_event_records_created_now",
  "external_panchang_sites_used_as_source",
  "external_panchang_sites_used_for_data_generation",
  "external_panchang_sites_used_as_runtime_dependency",
  "public_panchang_output_allowed_now",
  "actual_eclipse_events_created_now",
  "context_interpretation_records_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}
if (review.summary.rule_record_count !== 7) fail("Review rule count must be 7.");
if (review.summary.published_observance_event_count !== 0) fail("Review published event count must be zero.");

const readiness = readJson("data/content-intelligence/quality-registry/ag70m-ag70n-upcoming-observance-computed-event-bank-readiness-record.json");
if (readiness.ready_for_ag70n !== true) fail("AG70N readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70m-to-ag70n-upcoming-observance-computed-event-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG70N boundary must not auto-start.");
for (const blocker of [
  "public Panchang output",
  "public observance event publication",
  "actual eclipse event publication",
  "context interpretation production records",
  "generated/word-of-day.json replacement",
  "external Panchang site as source of truth",
  "external Panchang site as data-generation input",
  "external Panchang site as runtime dependency",
  "external Panchang site as production validation source"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG70M festival/observance rule bank is valid.");
pass("Seven observance-rule records created with Trayodashi / Pradosha modelled as one combined rule.");
pass("No external Panchang source, no event publication, no UI/backend/Supabase activation.");
