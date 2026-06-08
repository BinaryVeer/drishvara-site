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

const ag70o = readJson("data/content-intelligence/quality-reviews/ag70o-eclipse-computation-event-bank.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const validatedDailyBank = readJson("data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json");
const observanceBank = readJson("data/knowledge-base/upcoming-observance/production/observance-event-bank.json");
const eclipseScreeningBank = readJson("data/knowledge-base/panchang-festival/production/eclipse-computation-screening-bank-batch-01.json");
const eclipseEventBank = readJson("data/knowledge-base/panchang-festival/production/eclipse-computation-event-bank-batch-01.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70o.status !== "ag70o_eclipse_computation_event_bank_completed") {
  throw new Error("AG70O must be complete before AG70P.");
}
if (ag70o.summary?.ready_for_ag70p !== true) {
  throw new Error("AG70O readiness for AG70P is missing.");
}
if (validatedDailyBank.internally_validated_record_count !== 7) {
  throw new Error("AG70P requires internally validated Panchang daily Batch 01.");
}
if (observanceBank.published_event_record_count !== 0) {
  throw new Error("AG70P requires observance publication to remain blocked.");
}
if (eclipseEventBank.confirmed_eclipse_event_count !== 0 || eclipseEventBank.published_eclipse_event_count !== 0) {
  throw new Error("AG70P requires eclipse confirmation/publication to remain blocked.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  verificationPolicy: "data/knowledge-base/panchang-festival/production/ag70p-panchang-computation-verification-policy.json",
  manualComparisonPolicy: "data/knowledge-base/panchang-festival/production/ag70p-manual-post-output-comparison-policy.json",
  discrepancyPolicy: "data/knowledge-base/panchang-festival/production/ag70p-discrepancy-recording-policy.json",
  verificationReadinessRegister: "data/knowledge-base/panchang-festival/production/ag70p-verification-readiness-register.json",
  contextGate: "data/knowledge-base/panchang-festival/production/ag70p-context-interpretation-gate.json",
  noExternalTruthAudit: "data/knowledge-base/panchang-festival/production/ag70p-no-external-source-of-truth-audit.json",
  noPublicOutputAudit: "data/knowledge-base/panchang-festival/production/ag70p-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70p-panchang-computation-verification-policy.json",
  readiness: "data/content-intelligence/quality-registry/ag70p-ag70q-panchang-context-interpretation-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70p-to-ag70q-panchang-context-interpretation-bank-boundary.json",
  quality: "data/quality/ag70p-panchang-computation-verification-policy.json",
  preview: "data/quality/ag70p-panchang-computation-verification-policy-preview.json",
  doc: "docs/quality/AG70P_PANCHANG_COMPUTATION_VERIFICATION_POLICY.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const verificationPolicy = {
  module_id: "AG70P",
  title: "Panchang Computation Verification Policy",
  status: "panchang_computation_verification_policy_created",
  purpose: "Lock the verification hierarchy after internal Panchang, observance and eclipse screening records have been created.",
  verification_hierarchy: [
    {
      level: 1,
      name: "internal_schema_and_presence_validation",
      description: "Every record must satisfy required schema, locked location/timezone/ayanamsa/model fields, public-blocking flags and null-safety rules.",
      source_of_truth_role: "primary"
    },
    {
      level: 2,
      name: "internal_formula_validation",
      description: "Computed Panchang values must match AG70I formulas and AG70J locked basis.",
      source_of_truth_role: "primary"
    },
    {
      level: 3,
      name: "internal_event_rule_validation",
      description: "Observance candidates must be derived from AG70M rule bank and AG70L validated daily Panchang records.",
      source_of_truth_role: "primary"
    },
    {
      level: 4,
      name: "internal_eclipse_screening_validation",
      description: "Eclipse screening may flag syzygy candidates but cannot confirm eclipse events until node-distance/contact/visibility model exists.",
      source_of_truth_role: "primary"
    },
    {
      level: 5,
      name: "manual_post_output_external_comparison",
      description: "External Panchang/eclipse references may be manually compared only after Drishvara internal output exists.",
      source_of_truth_role: "comparison_only_not_authoritative"
    }
  ],
  external_sites_as_source_of_truth_allowed: false,
  external_sites_as_runtime_dependency_allowed: false,
  external_sites_as_data_generation_input_allowed: false,
  external_sites_as_auto_correction_allowed: false,
  public_output_allowed_now: false
};

const manualComparisonPolicy = {
  module_id: "AG70P",
  title: "Manual Post-Output Comparison Policy",
  status: "manual_post_output_comparison_policy_created",
  purpose: "Define how external Panchang/eclipse references may be used after internal output is generated.",
  allowed_use: [
    "Manual comparison after Drishvara internal computed record exists.",
    "Manual discrepancy note creation.",
    "Manual reviewer comment on whether the discrepancy is calculation, convention, location, ayanamsa, observance-rule or source-format related.",
    "Manual escalation to improve internal model or rule bank if repeated discrepancy is found."
  ],
  blocked_use: [
    "No external Panchang site as production source of truth.",
    "No external Panchang site as data-generation input.",
    "No scraping or runtime dependency.",
    "No automatic overwrite of internal computed value.",
    "No public claim based only on external comparison."
  ],
  comparison_record_required_fields: [
    "comparison_record_id",
    "internal_record_id",
    "module_area",
    "comparison_reference_type",
    "comparison_performed_by",
    "comparison_date",
    "comparison_result",
    "discrepancy_type",
    "manual_note",
    "action_recommendation",
    "public_output_impact"
  ],
  comparison_status_values: [
    "not_started",
    "matched",
    "minor_difference_requires_note",
    "major_difference_requires_review",
    "not_comparable_due_to_method_difference",
    "blocked_due_to_unreliable_external_reference"
  ],
  public_output_allowed_now: false
};

const discrepancyPolicy = {
  module_id: "AG70P",
  title: "Panchang Discrepancy Recording Policy",
  status: "panchang_discrepancy_recording_policy_created",
  purpose: "Record how discrepancies are classified without automatically changing internal computed values.",
  discrepancy_classes: [
    "timezone_or_day_boundary_difference",
    "location_coordinate_difference",
    "ayanamsa_basis_difference",
    "sunrise_basis_difference",
    "tithi_boundary_difference",
    "nakshatra_boundary_difference",
    "yoga_boundary_difference",
    "karana_boundary_difference",
    "observance_rule_difference",
    "eclipse_node_or_visibility_model_missing",
    "external_reference_unreliable_or_unclear"
  ],
  correction_policy: {
    auto_correction_allowed: false,
    manual_review_required: true,
    internal_model_patch_required_for_repeated_valid_discrepancy: true,
    source_citation_required_for_public_claim: true,
    public_output_allowed_before_resolution: false
  },
  empty_discrepancy_register_created_now: true,
  discrepancy_records_created_now: 0
};

const verificationReadinessRegister = {
  module_id: "AG70P",
  title: "Verification Readiness Register",
  status: "verification_readiness_register_created",
  internal_records_available: {
    internally_validated_panchang_daily_records: validatedDailyBank.internally_validated_record_count,
    computed_observance_candidate_events: observanceBank.computed_event_record_count,
    published_observance_events: observanceBank.published_event_record_count,
    eclipse_screening_records: eclipseScreeningBank.screening_record_count,
    confirmed_eclipse_events: eclipseEventBank.confirmed_eclipse_event_count,
    published_eclipse_events: eclipseEventBank.published_eclipse_event_count
  },
  verification_readiness: {
    daily_panchang_internal_verification_ready: true,
    observance_candidate_internal_verification_ready: true,
    eclipse_screening_internal_verification_ready: true,
    eclipse_confirmation_verification_ready: false,
    reason_eclipse_confirmation_not_ready: "lunar node distance, contact times, magnitude and visibility path are not yet computed internally"
  },
  public_output_allowed_now: false
};

const contextGate = {
  module_id: "AG70P",
  title: "Panchang Context Interpretation Gate",
  status: "context_interpretation_gate_created_not_started",
  purpose: "Define readiness for AG70Q Panchang Context Interpretation Bank without starting interpretation records in AG70P.",
  ag70q_allowed_after_ag70p: true,
  ag70q_allowed_scope: [
    "Create context-signal interpretation records from validated Panchang daily records and internal observance candidates.",
    "Keep Word of the Day generation blocked until context interpretation + lexical engine data population are ready.",
    "Keep public output blocked."
  ],
  context_interpretation_records_created_now: 0,
  word_output_allowed_now: false,
  public_output_allowed_now: false
};

const noExternalTruthAudit = {
  module_id: "AG70P",
  title: "No External Source of Truth Audit",
  status: "no_external_source_of_truth_audit_passed",
  external_panchang_sites_used_as_source_of_truth: false,
  external_panchang_sites_used_for_data_generation: false,
  external_panchang_sites_used_as_runtime_dependency: false,
  external_panchang_sites_used_as_production_validation_source: false,
  external_eclipse_sites_used_as_source_of_truth: false,
  external_eclipse_sites_used_for_data_generation: false,
  external_eclipse_sites_used_as_runtime_dependency: false,
  external_eclipse_sites_used_as_production_validation_source: false,
  external_sites_allowed_only_for_manual_post_output_comparison: true,
  public_claim_based_on_external_site_now: false
};

const noPublicOutputAudit = {
  module_id: "AG70P",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_observance_output_allowed_now: false,
  public_eclipse_output_allowed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  context_interpretation_records_created_now: 0,
  supabase_activation_performed: false,
  backend_runtime_activated: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_panchang_computation_verification_policy",
  current_status: "panchang_computation_verification_policy_created_public_output_blocked",
  ag70p_files: {
    verification_policy: outputs.verificationPolicy,
    manual_comparison_policy: outputs.manualComparisonPolicy,
    discrepancy_policy: outputs.discrepancyPolicy,
    verification_readiness_register: outputs.verificationReadinessRegister,
    context_gate: outputs.contextGate,
    no_external_truth_audit: outputs.noExternalTruthAudit,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    panchang_verification_policy_records: 1,
    manual_comparison_policy_records: 1,
    discrepancy_records: 0,
    context_interpretation_records: 0,
    public_panchang_outputs: 0
  },
  next_required_stage: "AG70Q — Panchang Context Interpretation Bank Batch 01"
};

const review = {
  module_id: "AG70P",
  title: "Panchang Computation Verification and Manual Post-Output Comparison Policy",
  status: "ag70p_panchang_computation_verification_policy_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70o_review: "data/content-intelligence/quality-reviews/ag70o-eclipse-computation-event-bank.json",
    validated_daily_bank: "data/knowledge-base/panchang-festival/production/panchang-validated-daily-bank-batch-01-internal.json",
    observance_event_bank: "data/knowledge-base/upcoming-observance/production/observance-event-bank.json",
    eclipse_screening_bank: "data/knowledge-base/panchang-festival/production/eclipse-computation-screening-bank-batch-01.json"
  },
  generated_records: outputs,
  summary: {
    verification_policy_created: true,
    manual_post_output_comparison_policy_created: true,
    discrepancy_recording_policy_created: true,
    verification_readiness_register_created: true,
    context_interpretation_gate_created: true,
    internal_validation_remains_primary: true,
    external_sites_allowed_only_for_manual_post_output_comparison: true,
    external_sites_used_as_source_of_truth: false,
    external_sites_used_for_data_generation: false,
    external_sites_used_as_runtime_dependency: false,
    external_sites_used_as_production_validation_source: false,
    auto_correction_from_external_site_allowed: false,
    public_panchang_output_allowed_now: false,
    public_observance_output_allowed_now: false,
    public_eclipse_output_allowed_now: false,
    context_interpretation_records_created_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70q: true
  }
};

const readiness = {
  module_id: "AG70P",
  title: "AG70Q Panchang Context Interpretation Bank Readiness Record",
  status: "ready_for_ag70q_panchang_context_interpretation_bank",
  ready_for_ag70q: true,
  next_stage: "AG70Q — Panchang Context Interpretation Bank Batch 01",
  reason: "Panchang computation verification policy and manual comparison boundary are now locked. Context interpretation can begin using internally validated Panchang and internal observance candidates, while public output remains blocked."
};

const boundary = {
  module_id: "AG70P",
  title: "AG70P to AG70Q Panchang Context Interpretation Bank Boundary",
  status: "ag70q_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create Panchang Context Interpretation Bank Batch 01.",
    "Interpret validated daily Panchang signals and internal observance candidates.",
    "Keep Word of the Day generation blocked until lexical engine data banks are populated and validated.",
    "Keep public output blocked."
  ],
  blocked_scope_without_explicit_approval: [
    "public Panchang output",
    "public observance event publication",
    "public eclipse event publication",
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
  module_id: "AG70P",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70P",
  status: review.status,
  verification_policy_created: 1,
  manual_comparison_policy_created: 1,
  discrepancy_records_created_now: 0,
  context_interpretation_records_created_now: 0,
  external_source_of_truth_used: 0,
  public_output_allowed_now: 0,
  ready_for_ag70q: 1
};

const doc = `# AG70P — Panchang Computation Verification and Manual Post-Output Comparison Policy

AG70P locks the verification policy for Panchang, observance and eclipse computation outputs.

## Core decision

Internal Drishvara computation remains primary. External Panchang or eclipse websites are not used as source of truth, runtime dependency, data-generation input, or production validation source.

External sources may be used only after Drishvara generates its own output, and only as manual post-output comparison references.

## Discrepancy handling

Discrepancies must be recorded as review notes. They do not automatically overwrite internal computed values.

## Created

- Panchang computation verification policy.
- Manual post-output comparison policy.
- Discrepancy recording policy.
- Verification readiness register.
- Panchang context interpretation gate.
- No-external-source-of-truth audit.
- No-public-output audit.

## Not done

- No new Panchang data.
- No public Panchang output.
- No public observance event publication.
- No public eclipse event publication.
- No context interpretation records.
- No generated Word output.
- No UI/backend/Supabase activation.
`;

writeJson(outputs.verificationPolicy, verificationPolicy);
writeJson(outputs.manualComparisonPolicy, manualComparisonPolicy);
writeJson(outputs.discrepancyPolicy, discrepancyPolicy);
writeJson(outputs.verificationReadinessRegister, verificationReadinessRegister);
writeJson(outputs.contextGate, contextGate);
writeJson(outputs.noExternalTruthAudit, noExternalTruthAudit);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70P Panchang computation verification policy generated.");
console.log("✅ Manual post-output comparison policy created.");
console.log("✅ External sites remain comparison-only, not source/runtime/data-generation/validation.");
console.log("✅ Public output, UI, backend and Supabase remain blocked.");
