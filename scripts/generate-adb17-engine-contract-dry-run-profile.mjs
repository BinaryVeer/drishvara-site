import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  adb16Review: "data/content-intelligence/quality-reviews/adb16-runtime-calculation-decision-checkpoint.json",
  adb16Decision: "data/content-intelligence/runtime-engine/adb16-runtime-calculation-decision-record.json",
  adb16Plan: "data/content-intelligence/runtime-engine/adb16-adb17-to-adb20-runtime-foundation-plan.json",
  adb16EngineRoute: "data/content-intelligence/runtime-engine/adb16-calculation-engine-route-decision.json",
  adb16DryRunScope: "data/content-intelligence/runtime-engine/adb16-dry-run-scope-decision.json",
  adb16LocationAyanamsha: "data/content-intelligence/runtime-engine/adb16-location-ayanamsha-decision.json",
  adb16StorageBoundary: "data/content-intelligence/runtime-engine/adb16-runtime-storage-boundary-decision.json",
  adb16NoRuntime: "data/content-intelligence/backend-architecture/adb16-no-runtime-execution-audit.json",
  adb16NoPublic: "data/content-intelligence/backend-architecture/adb16-no-public-activation-audit.json",
  adb16Readiness: "data/content-intelligence/quality-registry/adb16-adb17-engine-contract-readiness-record.json",
  adb16Boundary: "data/content-intelligence/mutation-plans/adb16-to-adb17-engine-contract-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/adb17-engine-contract-dry-run-profile.json",
  engineContract: "data/content-intelligence/runtime-engine/adb17-calculation-engine-contract.json",
  formulaCoverageContract: "data/content-intelligence/runtime-engine/adb17-panchanga-formula-coverage-contract.json",
  dryRunProfile: "data/content-intelligence/runtime-engine/adb17-non-public-dry-run-profile.json",
  inputOutputContract: "data/content-intelligence/runtime-engine/adb17-input-output-contract.json",
  traceLogContract: "data/content-intelligence/runtime-engine/adb17-trace-log-contract.json",
  validationHandOff: "data/content-intelligence/runtime-engine/adb17-adb18-validation-handoff.json",
  noRuntimeExecutionAudit: "data/content-intelligence/backend-architecture/adb17-no-runtime-execution-audit.json",
  noPublicActivationAudit: "data/content-intelligence/backend-architecture/adb17-no-public-activation-audit.json",
  readiness: "data/content-intelligence/quality-registry/adb17-adb18-validation-protocol-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/adb17-to-adb18-validation-protocol-boundary.json",
  registry: "data/quality/adb17-engine-contract-dry-run-profile.json",
  preview: "data/quality/adb17-engine-contract-dry-run-profile-preview.json",
  doc: "docs/quality/ADB17_ENGINE_CONTRACT_DRY_RUN_PROFILE.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing ADB17 input: ${p}`);
}

const adb16Review = readJson(inputs.adb16Review);
const adb16Decision = readJson(inputs.adb16Decision);
const adb16Plan = readJson(inputs.adb16Plan);
const adb16EngineRoute = readJson(inputs.adb16EngineRoute);
const adb16DryRunScope = readJson(inputs.adb16DryRunScope);
const adb16LocationAyanamsha = readJson(inputs.adb16LocationAyanamsha);
const adb16StorageBoundary = readJson(inputs.adb16StorageBoundary);
const adb16NoRuntime = readJson(inputs.adb16NoRuntime);
const adb16NoPublic = readJson(inputs.adb16NoPublic);
const adb16Readiness = readJson(inputs.adb16Readiness);
const adb16Boundary = readJson(inputs.adb16Boundary);

if (adb16Review.status !== "runtime_engine_planning_decided_ready_for_adb17") throw new Error("ADB16 review status mismatch.");
if (adb16Review.summary?.runtime_engine_planning_approved !== true) throw new Error("ADB16 runtime engine planning not approved.");
if (adb16Review.summary?.runtime_calculation_executed !== false) throw new Error("Runtime calculation must not be executed before ADB17.");
if (adb16Decision.decision?.runtime_calculation_execution_approved_now !== false) throw new Error("ADB16 must keep runtime execution deferred.");
if (!JSON.stringify(adb16Plan.stages).includes("ADB20")) throw new Error("ADB16 compact path to ADB20 missing.");
if (adb16EngineRoute.selected_route !== "internal_calculation_engine_with_reviewed_ephemeris_and_ayanamsha_profiles") throw new Error("ADB16 engine route mismatch.");
if (adb16DryRunScope.execution_status !== "not_executed_in_adb16") throw new Error("ADB16 dry-run must not be executed.");
if (adb16LocationAyanamsha.ayanamsha_strategy?.hardcoded_final_ayanamsha !== false) throw new Error("Ayanamsha must not be final-hardcoded.");
if (adb16StorageBoundary.required_default_flags_for_future_runtime_rows?.public_use_allowed !== false) throw new Error("Future runtime rows must default public_use_allowed false.");
if (adb16NoRuntime.audit_passed !== true) throw new Error("ADB16 no-runtime audit must pass.");
if (adb16NoPublic.audit_passed !== true) throw new Error("ADB16 no-public audit must pass.");
if (adb16Readiness.ready_for_adb17 !== true || adb16Readiness.next_stage_id !== "ADB17") throw new Error("ADB16 readiness must permit ADB17.");
if (adb16Boundary.next_stage_id !== "ADB17") throw new Error("ADB16 boundary must point to ADB17.");

const blockedState = {
  adb17_engine_contract_recorded: true,
  adb16_consumed: true,
  formula_coverage_contract_recorded: true,
  dry_run_profile_recorded: true,
  input_output_contract_recorded: true,
  trace_log_contract_recorded: true,
  adb18_validation_handoff_recorded: true,
  ready_for_adb18_validation_protocol: true,

  runtime_calculation_execution_approved_now: false,
  runtime_calculation_executed: false,
  computed_panchang_rows_written: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  rls_public_policy_activation_performed: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_content_generated: false,
  ag47_resume_now: false,
  ag47_resume_allowed_after_adb20_only: true
};

const engineContract = {
  module_id: "ADB17",
  title: "Calculation Engine Contract",
  status: "calculation_engine_contract_recorded",
  engine_route: "internal_calculation_engine_with_reviewed_ephemeris_and_ayanamsha_profiles",
  contract_type: "non_public_dry_run_engine_contract",
  required_engine_inputs: [
    "date_range",
    "location_time_profile",
    "ephemeris_profile",
    "ayanamsha_profile",
    "calculation_profile",
    "regional_calendar_profile",
    "source_authority_context"
  ],
  required_engine_outputs: [
    "tithi_candidate",
    "nakshatra_candidate",
    "yoga_candidate",
    "karana_candidate",
    "vara_candidate",
    "rashi_candidate",
    "sunrise_window",
    "sunset_window",
    "moonrise_window",
    "trace_log",
    "confidence_status",
    "review_status"
  ],
  output_visibility: "internal_only",
  execution_status: "not_executed_in_adb17",
  blocked_state: blockedState
};

const formulaCoverageContract = {
  module_id: "ADB17",
  title: "Panchanga Formula Coverage Contract",
  status: "formula_coverage_contract_recorded",
  required_formula_families: [
    {
      formula_key: "tithi_from_moon_sun_angular_separation",
      output: "tithi",
      basis: "Moon-Sun angular separation divided into 12-degree bands",
      dry_run_requirement: "candidate calculation plus transition trace"
    },
    {
      formula_key: "nakshatra_from_sidereal_moon_longitude",
      output: "nakshatra",
      basis: "sidereal Moon longitude divided into 27 equal divisions",
      dry_run_requirement: "candidate calculation plus boundary trace"
    },
    {
      formula_key: "yoga_from_sun_moon_longitude_sum",
      output: "yoga",
      basis: "sum of sidereal Sun and Moon longitudes divided into 27 equal divisions",
      dry_run_requirement: "candidate calculation plus boundary trace"
    },
    {
      formula_key: "karana_from_half_tithi",
      output: "karana",
      basis: "half-tithi sequence and special karana rules",
      dry_run_requirement: "candidate calculation plus sequence trace"
    },
    {
      formula_key: "vara_from_local_sunrise_boundary",
      output: "vara",
      basis: "local sunrise day-boundary",
      dry_run_requirement: "local sunrise basis must be visible"
    },
    {
      formula_key: "rashi_from_sidereal_moon_longitude",
      output: "rashi",
      basis: "sidereal Moon longitude divided into 12 signs",
      dry_run_requirement: "candidate calculation plus ayanamsha trace"
    }
  ],
  coverage_status: "contract_only_not_executed",
  blocked_state: blockedState
};

const dryRunProfile = {
  module_id: "ADB17",
  title: "Non-public Dry-run Profile",
  status: "non_public_dry_run_profile_recorded",
  dry_run_profile_id: "ADB17-DRYRUN-7DAY-INTERNAL-001",
  dry_run_status: "planned_not_executed",
  date_window_strategy: "7_day_initial_window",
  location_strategy: {
    primary_profile: "India default review profile",
    regional_reference_candidates: ["Varanasi", "Patna/Bihar-Mithila", "Ranchi", "Itanagar"]
  },
  ayanamsha_strategy: {
    primary_candidate: "reviewed_candidate_profile_from_seed_foundation",
    comparison_required_before_public_use: true,
    hardcoded_final_ayanamsha: false
  },
  public_flags: {
    public_use_allowed: false,
    editorial_review_status: "pending_review",
    evidence_status: "calculation_dry_run",
    output_visibility: "internal_only"
  },
  blocked_state: blockedState
};

const inputOutputContract = {
  module_id: "ADB17",
  title: "Runtime Input / Output Contract",
  status: "input_output_contract_recorded",
  input_tables_or_sources: [
    "calculation_profiles",
    "ephemeris_profiles",
    "ayanamsha_profiles",
    "location_time_profiles",
    "panchanga_formula_rules",
    "regional_calendar_profiles",
    "source_authorities"
  ],
  candidate_output_tables: [
    "astronomical_input_snapshots",
    "panchanga_calculation_runs",
    "panchanga_calculation_trace_logs",
    "panchang_daily_records"
  ],
  required_output_controls: {
    public_use_allowed: false,
    editorial_review_status: "pending_review",
    runtime_run_status: "dry_run",
    trace_required: true,
    comparison_required_before_public_use: true
  },
  database_write_status_now: "not_approved_in_adb17",
  blocked_state: blockedState
};

const traceLogContract = {
  module_id: "ADB17",
  title: "Trace Log Contract",
  status: "trace_log_contract_recorded",
  required_trace_fields: [
    "calculation_run_id",
    "profile_ids_used",
    "input_date_time",
    "location_profile_id",
    "ephemeris_profile_id",
    "ayanamsha_profile_id",
    "sun_longitude",
    "moon_longitude",
    "sidereal_adjustment",
    "formula_rule_id",
    "formula_input",
    "formula_output",
    "boundary_condition_flag",
    "variance_against_reference",
    "review_status"
  ],
  purpose: "Every future dry-run value must be explainable and reviewable before public use.",
  trace_write_status_now: "not_executed_in_adb17",
  blocked_state: blockedState
};

const validationHandOff = {
  module_id: "ADB17",
  title: "ADB18 Validation Hand-off",
  status: "adb18_validation_handoff_recorded",
  handoff_to_stage: "ADB18",
  required_adb18_checks: [
    "Seed sufficiency for all required input tables",
    "Reference Panchang comparison protocol",
    "Formula coverage sufficiency",
    "Location/sunrise basis validation",
    "Ayanamsha comparison requirement",
    "Dry-run date-window selection",
    "No public activation check"
  ],
  ready_for_adb18: true,
  blocked_state: blockedState
};

const noRuntimeExecutionAudit = {
  module_id: "ADB17",
  title: "No Runtime Execution Audit",
  status: "no_runtime_execution_audit_passed_for_adb17",
  audit_passed: true,
  checks: [
    { check_id: "runtime_calculation_execution_approved_now", expected: false, actual: false, passed: true },
    { check_id: "runtime_calculation_executed", expected: false, actual: false, passed: true },
    { check_id: "computed_panchang_rows_written", expected: false, actual: false, passed: true },
    { check_id: "trace_log_rows_written", expected: false, actual: false, passed: true },
    { check_id: "public_content_generated", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noPublicActivationAudit = {
  module_id: "ADB17",
  title: "No Public Activation Audit",
  status: "no_public_activation_audit_passed_for_adb17",
  audit_passed: true,
  checks: [
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true },
    { check_id: "ag47_resume_now", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "ADB17",
  title: "ADB18 Validation Protocol Readiness Record",
  status: "ready_for_adb18_validation_protocol",
  ready_for_adb18: true,
  next_stage_id: "ADB18",
  next_stage_title: "Dry-run Validation Protocol and Seed Sufficiency Audit",
  adb18_allowed_scope: [
    "Validate seed sufficiency against the ADB17 engine contract.",
    "Define trusted Panchang comparison protocol.",
    "Define location/sunrise and ayanamsha validation checks.",
    "Define dry-run acceptance thresholds.",
    "Keep runtime execution and public activation blocked."
  ],
  adb18_blocked_scope: [
    "Runtime calculation execution",
    "Computed Panchang row write",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure in repo/chat",
    "AG47 resume before ADB20"
  ],
  hard_blocker_count_for_adb18: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "ADB17",
  title: "ADB17 to ADB18 Validation Protocol Boundary",
  status: "adb18_validation_protocol_boundary_created",
  next_stage_id: "ADB18",
  next_stage_title: "Dry-run Validation Protocol and Seed Sufficiency Audit",
  allowed_scope: readiness.adb18_allowed_scope,
  blocked_scope: readiness.adb18_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "ADB17",
  title: "Calculation Engine Contract and Dry-run Profile",
  status: "engine_contract_dry_run_profile_ready_for_adb18",
  depends_on: ["ADB16", "ADB15"],
  engine_contract_file: outputs.engineContract,
  formula_coverage_contract_file: outputs.formulaCoverageContract,
  dry_run_profile_file: outputs.dryRunProfile,
  input_output_contract_file: outputs.inputOutputContract,
  trace_log_contract_file: outputs.traceLogContract,
  validation_handoff_file: outputs.validationHandOff,
  no_runtime_execution_audit_file: outputs.noRuntimeExecutionAudit,
  no_public_activation_audit_file: outputs.noPublicActivationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    adb17_engine_contract_recorded: true,
    adb16_consumed: true,
    formula_coverage_contract_recorded: true,
    dry_run_profile_recorded: true,
    input_output_contract_recorded: true,
    trace_log_contract_recorded: true,
    adb18_validation_handoff_recorded: true,
    ready_for_adb18_validation_protocol: true,
    hard_blocker_count_for_adb18: 0,
    runtime_calculation_execution_approved_now: false,
    runtime_calculation_executed: false,
    computed_panchang_rows_written: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_content_generated: false,
    ag47_resume_now: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "ADB17",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "ADB17",
  status: review.status,
  adb17_engine_contract_recorded: 1,
  adb16_consumed: 1,
  formula_coverage_contract_recorded: 1,
  dry_run_profile_recorded: 1,
  input_output_contract_recorded: 1,
  trace_log_contract_recorded: 1,
  adb18_validation_handoff_recorded: 1,
  ready_for_adb18_validation_protocol: 1,
  hard_blocker_count_for_adb18: 0,
  runtime_calculation_execution_approved_now: 0,
  runtime_calculation_executed: 0,
  computed_panchang_rows_written: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_content_generated: 0,
  ag47_resume_now: 0
};

const doc = `# ADB17 — Calculation Engine Contract and Dry-run Profile

## Result

ADB17 records the non-public calculation-engine contract and dry-run profile.

## Contracted scope

- Tithi
- Nakshatra
- Yoga
- Karana
- Vara
- Rashi
- Sunrise/sunset/moonrise event-window basis
- Trace logging and review status

## Important

ADB17 does not execute runtime calculation and does not write computed Panchanga rows.

## Still blocked

- Runtime calculation execution
- Computed Panchanga row write
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure
- AG47 resume before ADB20

## Next

ADB18 — Dry-run Validation Protocol and Seed Sufficiency Audit.
`;

writeJson(outputs.engineContract, engineContract);
writeJson(outputs.formulaCoverageContract, formulaCoverageContract);
writeJson(outputs.dryRunProfile, dryRunProfile);
writeJson(outputs.inputOutputContract, inputOutputContract);
writeJson(outputs.traceLogContract, traceLogContract);
writeJson(outputs.validationHandOff, validationHandOff);
writeJson(outputs.noRuntimeExecutionAudit, noRuntimeExecutionAudit);
writeJson(outputs.noPublicActivationAudit, noPublicActivationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ ADB17 Calculation Engine Contract and Dry-run Profile generated.");
console.log("✅ Engine contract, formula coverage, dry-run profile, I/O contract and trace-log contract recorded.");
console.log("✅ Ready for ADB18 Dry-run Validation Protocol and Seed Sufficiency Audit.");
console.log("✅ No runtime calculation, computed row write, backend/Auth activation, deployment or service-role exposure recorded.");
