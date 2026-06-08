import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

const ag70l = readJson("data/content-intelligence/quality-reviews/ag70l-computed-panchang-daily-bank-internal-validation.json");
const validatedDailyBank = readJson("data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70l.status !== "ag70l_computed_panchang_daily_bank_internal_validation_completed") throw new Error("AG70L must be complete before AG70M.");
if (ag70l.summary?.ready_for_ag70m !== true) throw new Error("AG70L readiness for AG70M is missing.");
if (validatedDailyBank.status !== "panchang_daily_calculation_bank_batch_01_internally_validated_public_blocked") throw new Error("Validated Panchang daily bank must exist before AG70M.");
if (validatedDailyBank.internally_validated_record_count !== 7) throw new Error("AG70M requires 7 internally validated Batch 01 records.");
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) throw new Error("generated/word-of-day.json must remain inactive.");

const outputs = {
  ruleBank: "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank.json",
  ruleBankBatch: "data/knowledge-base/panchang-festival/production/festival-observance-rule-bank-batch-01.json",
  panchangToRuleConnector: "data/knowledge-base/panchang-festival/production/panchang-to-observance-rule-connector.json",
  ruleEligibilityMap: "data/knowledge-base/panchang-festival/production/observance-rule-eligibility-map.json",
  noEventPublicationAudit: "data/knowledge-base/panchang-festival/production/ag70m-no-observance-event-publication-audit.json",
  noExternalSourceAudit: "data/knowledge-base/panchang-festival/production/ag70m-no-external-panchang-source-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70m-festival-observance-rule-bank.json",
  readiness: "data/content-intelligence/quality-registry/ag70m-ag70n-upcoming-observance-computed-event-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70m-to-ag70n-upcoming-observance-computed-event-bank-boundary.json",
  quality: "data/quality/ag70m-festival-observance-rule-bank.json",
  preview: "data/quality/ag70m-festival-observance-rule-bank-preview.json",
  doc: "docs/quality/AG70M_FESTIVAL_OBSERVANCE_RULE_BANK.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const common = {
  approved_for_event_candidate_computation: true,
  approved_for_public_publication_now: false,
  public_claim_allowed_now: false,
  external_panchang_source_used: false,
  review_status: "rule_record_created_public_event_blocked"
};

const ruleRecords = [
  {
    rule_id: "observance_rule_ekadashi_vrata_internal_v1",
    observance_key: "ekadashi",
    display_name: "Ekadashi",
    rule_type: "tithi_based_observance_candidate",
    trigger: { tithi_indices: [11, 26], paksha_values: ["Shukla Paksha", "Krishna Paksha"] },
    required_panchang_fields: ["date_key", "location_id", "timezone", "tithi", "tithi_start_datetime_local", "tithi_end_datetime_local", "paksha"],
    event_window_basis: "tithi_window",
    sunrise_or_parana_rule_status: "deferred_to_event_computation_stage",
    source_status: "internal_rule_model_pending_traditional_source_review",
    ...common
  },
  {
    rule_id: "observance_rule_purnima_internal_v1",
    observance_key: "purnima",
    display_name: "Purnima",
    rule_type: "tithi_based_observance_candidate",
    trigger: { tithi_indices: [15], paksha_values: ["Shukla Paksha"] },
    required_panchang_fields: ["date_key", "location_id", "timezone", "tithi", "tithi_start_datetime_local", "tithi_end_datetime_local", "paksha"],
    event_window_basis: "tithi_window",
    source_status: "internal_rule_model_pending_traditional_source_review",
    ...common
  },
  {
    rule_id: "observance_rule_amavasya_internal_v1",
    observance_key: "amavasya",
    display_name: "Amavasya",
    rule_type: "tithi_based_observance_candidate",
    trigger: { tithi_indices: [30], paksha_values: ["Krishna Paksha"] },
    required_panchang_fields: ["date_key", "location_id", "timezone", "tithi", "tithi_start_datetime_local", "tithi_end_datetime_local", "paksha"],
    event_window_basis: "tithi_window",
    source_status: "internal_rule_model_pending_traditional_source_review",
    ...common
  },
  {
    rule_id: "observance_rule_trayodashi_pradosha_internal_v1",
    observance_key: "trayodashi_pradosha",
    display_name: "Trayodashi / Pradosha",
    rule_type: "trayodashi_tithi_plus_evening_window_candidate",
    trigger: { tithi_indices: [13, 28], paksha_values: ["Shukla Paksha", "Krishna Paksha"] },
    required_panchang_fields: ["date_key", "location_id", "timezone", "sunset_datetime_local", "tithi", "tithi_start_datetime_local", "tithi_end_datetime_local", "paksha"],
    event_window_basis: "trayodashi_tithi_window_intersecting_evening_pradosha_window",
    evening_window_rule_status: "deferred_to_event_computation_stage",
    source_status: "internal_rule_model_pending_traditional_source_review",
    ...common
  },
  {
    rule_id: "observance_rule_sankashti_chaturthi_internal_v1",
    observance_key: "sankashti_chaturthi",
    display_name: "Sankashti Chaturthi",
    rule_type: "krishna_paksha_tithi_based_candidate",
    trigger: { tithi_indices: [19], paksha_values: ["Krishna Paksha"] },
    required_panchang_fields: ["date_key", "location_id", "timezone", "tithi", "tithi_start_datetime_local", "tithi_end_datetime_local", "paksha"],
    event_window_basis: "tithi_window",
    moonrise_rule_status: "deferred_to_future_observance_enhancement",
    source_status: "internal_rule_model_pending_traditional_source_review",
    ...common
  },
  {
    rule_id: "observance_rule_vinayaka_chaturthi_monthly_internal_v1",
    observance_key: "vinayaka_chaturthi_monthly",
    display_name: "Vinayaka Chaturthi",
    rule_type: "shukla_paksha_tithi_based_candidate",
    trigger: { tithi_indices: [4], paksha_values: ["Shukla Paksha"] },
    required_panchang_fields: ["date_key", "location_id", "timezone", "tithi", "tithi_start_datetime_local", "tithi_end_datetime_local", "paksha"],
    event_window_basis: "tithi_window",
    source_status: "internal_rule_model_pending_traditional_source_review",
    ...common
  },
  {
    rule_id: "observance_rule_masik_shivaratri_internal_v1",
    observance_key: "masik_shivaratri",
    display_name: "Masik Shivaratri",
    rule_type: "krishna_paksha_tithi_based_candidate",
    trigger: { tithi_indices: [29], paksha_values: ["Krishna Paksha"] },
    required_panchang_fields: ["date_key", "location_id", "timezone", "tithi", "tithi_start_datetime_local", "tithi_end_datetime_local", "paksha"],
    event_window_basis: "tithi_window",
    night_window_rule_status: "deferred_to_event_computation_stage",
    source_status: "internal_rule_model_pending_traditional_source_review",
    ...common
  }
];

const ruleBank = {
  module_id: "AG70M",
  title: "Festival / Observance Rule Bank",
  status: "festival_observance_rule_bank_batch_01_created_event_publication_blocked",
  purpose: "Create internal observance-rule records that can later be applied to internally validated Panchang daily records.",
  batch_id: "ag70m_batch_01",
  rule_record_count: ruleRecords.length,
  approved_for_event_candidate_computation_count: ruleRecords.length,
  public_publication_rule_count: 0,
  external_panchang_source_count: 0,
  observance_event_records_created_now: 0,
  records: ruleRecords
};

const panchangToRuleConnector = {
  module_id: "AG70M",
  title: "Panchang to Observance Rule Connector",
  status: "panchang_to_observance_rule_connector_created_no_events",
  input_bank: "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json",
  rule_bank: outputs.ruleBank,
  connector_logic: [
    "Use internally validated daily Panchang records only.",
    "Match rule trigger.tithi_indices against record.tithi.index.",
    "Match rule trigger.paksha_values against record.paksha.",
    "Trayodashi is treated as the Tithi basis and Pradosha as its evening-window observance form.",
    "For Trayodashi / Pradosha and other window-sensitive rules, event computation is deferred to AG70N.",
    "Do not publish event dates in AG70M."
  ],
  event_records_created_now: 0,
  public_output_allowed_now: false
};

const ruleEligibilityMap = {
  module_id: "AG70M",
  title: "Observance Rule Eligibility Map",
  status: "observance_rule_eligibility_map_created_no_events",
  eligible_input_statuses: ["internally_validated_public_blocked"],
  required_daily_bank_status: "panchang_daily_calculation_bank_batch_01_internally_validated_public_blocked",
  rule_ids: ruleRecords.map((rule) => rule.rule_id),
  eligibility_rules: ruleRecords.map((rule) => ({
    rule_id: rule.rule_id,
    observance_key: rule.observance_key,
    display_name: rule.display_name,
    required_tithi_indices: rule.trigger.tithi_indices,
    required_paksha_values: rule.trigger.paksha_values,
    approved_for_event_candidate_computation: rule.approved_for_event_candidate_computation,
    approved_for_public_publication_now: false
  })),
  event_records_created_now: 0
};

const noEventPublicationAudit = {
  module_id: "AG70M",
  title: "No Observance Event Publication Audit",
  status: "no_observance_event_publication_audit_passed",
  rule_record_count: ruleRecords.length,
  observance_event_records_created_now: 0,
  published_observance_event_count: 0,
  public_panchang_output_allowed_now: false,
  context_interpretation_records_created_now: 0,
  generated_word_json_modified: false,
  ui_display_changed: false,
  supabase_activation_performed: false,
  backend_runtime_activated: false
};

const noExternalSourceAudit = {
  module_id: "AG70M",
  title: "No External Panchang Source Audit",
  status: "no_external_panchang_source_audit_passed",
  external_panchang_sites_used_as_source: false,
  external_panchang_sites_used_for_data_generation: false,
  external_panchang_sites_used_as_runtime_dependency: false,
  external_panchang_sites_used_as_production_validation_source: false,
  external_panchang_sites_used_for_public_claim: false,
  external_panchang_sites_allowed_only_for_later_manual_post_output_comparison: true,
  external_source_count: 0
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_festival_observance_rule_bank_batch_01",
  current_status: "festival_observance_rule_bank_batch_01_created_event_publication_blocked",
  ag70m_files: {
    rule_bank: outputs.ruleBank,
    rule_bank_batch: outputs.ruleBankBatch,
    panchang_to_rule_connector: outputs.panchangToRuleConnector,
    rule_eligibility_map: outputs.ruleEligibilityMap,
    no_event_publication_audit: outputs.noEventPublicationAudit,
    no_external_source_audit: outputs.noExternalSourceAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    festival_observance_rule_records: ruleRecords.length,
    approved_event_candidate_rule_records: ruleRecords.length,
    observance_events: 0,
    published_observance_events: 0,
    eclipse_events: 0,
    context_interpretation_records: 0
  },
  next_required_stage: "AG70N — Upcoming Observance Computed Event Bank Batch 01"
};

const review = {
  module_id: "AG70M",
  title: "Festival / Observance Rule Bank Batch 01",
  status: "ag70m_festival_observance_rule_bank_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70l_review: "data/content-intelligence/quality-reviews/ag70l-computed-panchang-daily-bank-internal-validation.json",
    validated_daily_bank: "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json"
  },
  generated_records: outputs,
  summary: {
    festival_observance_rule_bank_created: true,
    rule_record_count: ruleRecords.length,
    panchang_to_rule_connector_created: true,
    rule_eligibility_map_created: true,
    ekadashi_rule_created: true,
    purnima_rule_created: true,
    amavasya_rule_created: true,
    trayodashi_pradosha_rule_created: true,
    sankashti_chaturthi_rule_created: true,
    vinayaka_chaturthi_monthly_rule_created: true,
    masik_shivaratri_rule_created: true,
    observance_event_records_created_now: false,
    published_observance_event_count: 0,
    external_panchang_sites_used_as_source: false,
    external_panchang_sites_used_for_data_generation: false,
    external_panchang_sites_used_as_runtime_dependency: false,
    public_panchang_output_allowed_now: false,
    actual_eclipse_events_created_now: false,
    context_interpretation_records_created_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70n: true
  }
};

const readiness = {
  module_id: "AG70M",
  title: "AG70N Upcoming Observance Computed Event Bank Readiness Record",
  status: "ready_for_ag70n_upcoming_observance_computed_event_bank",
  ready_for_ag70n: true,
  next_stage: "AG70N — Upcoming Observance Computed Event Bank Batch 01",
  reason: "Festival/observance rule records exist and can be applied to the internally validated Panchang daily bank to compute internal event candidates with public output still blocked."
};

const boundary = {
  module_id: "AG70M",
  title: "AG70M to AG70N Upcoming Observance Computed Event Bank Boundary",
  status: "ag70n_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Apply AG70M rule records to AG70L internally validated Panchang daily records.",
    "Create internal upcoming observance candidate event records.",
    "Keep event publication/public output blocked.",
    "Keep external Panchang sites outside production data-generation and validation."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "public observance event publication",
    "actual eclipse event publication",
    "context interpretation production records",
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime Word selector activation",
    "Supabase/database writes",
    "backend/Auth activation",
    "external Panchang site as source of truth",
    "external Panchang site as data-generation input",
    "external Panchang site as runtime dependency",
    "external Panchang site as production validation source"
  ]
};

const quality = {
  module_id: "AG70M",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70M",
  status: review.status,
  rule_record_count: ruleRecords.length,
  trayodashi_pradosha_rule_created: 1,
  observance_event_records_created_now: 0,
  public_output_allowed_now: 0,
  external_source_count: 0,
  context_interpretation_records_created_now: 0,
  ready_for_ag70n: 1
};

const doc = `# AG70M — Festival / Observance Rule Bank Batch 01

AG70M creates the first internal Festival / Observance Rule Bank.

## Created rule records

- Ekadashi
- Purnima
- Amavasya
- Trayodashi / Pradosha
- Sankashti Chaturthi
- Vinayaka Chaturthi
- Masik Shivaratri

## Modelling note

Trayodashi is the Tithi basis. Pradosha is treated as the evening-window observance form linked to Trayodashi. Therefore the rule is modelled as one combined rule: Trayodashi / Pradosha.

## Boundary

These are rule records only. AG70M does not publish observance dates or create public events.

## External Panchang rule

External Panchang sites are not used as source, runtime dependency, data-generation input, production validation source, or public-claim basis.

## Not done

- No observance event records.
- No public observance publication.
- No eclipse event records.
- No context interpretation records.
- No generated Word output.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.ruleBank, ruleBank);
writeJson(outputs.ruleBankBatch, ruleBank);
writeJson(outputs.panchangToRuleConnector, panchangToRuleConnector);
writeJson(outputs.ruleEligibilityMap, ruleEligibilityMap);
writeJson(outputs.noEventPublicationAudit, noEventPublicationAudit);
writeJson(outputs.noExternalSourceAudit, noExternalSourceAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70M festival/observance rule bank generated.");
console.log(`✅ Rule records created: ${ruleRecords.length}; observance events created: 0.`);
console.log("✅ Trayodashi / Pradosha modelled as one combined rule.");
console.log("✅ External Panchang sites excluded from source/runtime/data-generation/validation.");
console.log("✅ Public output, UI, backend and Supabase remain blocked.");
