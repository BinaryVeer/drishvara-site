import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  adb15Review: "data/content-intelligence/quality-reviews/adb15-seed-insertion-result-capture.json",
  adb15Result: "data/content-intelligence/seed-insertion/adb15-seed-insertion-result-record.json",
  adb15RowCount: "data/content-intelligence/seed-insertion/adb15-row-count-verification-result.json",
  adb15SeedStatus: "data/content-intelligence/seed-insertion/adb15-seed-foundation-status-record.json",
  adb15NoRuntime: "data/content-intelligence/backend-architecture/adb15-no-runtime-activation-audit.json",
  adb15Secret: "data/content-intelligence/backend-architecture/adb15-secret-handling-audit.json",
  adb15NoDeployment: "data/content-intelligence/backend-architecture/adb15-no-deployment-audit.json",
  adb15Readiness: "data/content-intelligence/quality-registry/adb15-adb16-runtime-decision-readiness-record.json",
  adb15Boundary: "data/content-intelligence/mutation-plans/adb15-to-adb16-runtime-decision-boundary.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/adb16-runtime-calculation-decision-checkpoint.json",
  decisionRecord: "data/content-intelligence/runtime-engine/adb16-runtime-calculation-decision-record.json",
  adb16ToAdb20Plan: "data/content-intelligence/runtime-engine/adb16-adb17-to-adb20-runtime-foundation-plan.json",
  engineRouteDecision: "data/content-intelligence/runtime-engine/adb16-calculation-engine-route-decision.json",
  dryRunScopeDecision: "data/content-intelligence/runtime-engine/adb16-dry-run-scope-decision.json",
  locationAyanamshaDecision: "data/content-intelligence/runtime-engine/adb16-location-ayanamsha-decision.json",
  storageBoundaryDecision: "data/content-intelligence/runtime-engine/adb16-runtime-storage-boundary-decision.json",
  noRuntimeExecutionAudit: "data/content-intelligence/backend-architecture/adb16-no-runtime-execution-audit.json",
  noPublicActivationAudit: "data/content-intelligence/backend-architecture/adb16-no-public-activation-audit.json",
  readiness: "data/content-intelligence/quality-registry/adb16-adb17-engine-contract-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/adb16-to-adb17-engine-contract-boundary.json",
  registry: "data/quality/adb16-runtime-calculation-decision-checkpoint.json",
  preview: "data/quality/adb16-runtime-calculation-decision-checkpoint-preview.json",
  doc: "docs/quality/ADB16_RUNTIME_CALCULATION_DECISION_CHECKPOINT.md"
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
  if (!exists(p)) throw new Error(`Missing ADB16 input: ${p}`);
}

const adb15Review = readJson(inputs.adb15Review);
const adb15Result = readJson(inputs.adb15Result);
const adb15RowCount = readJson(inputs.adb15RowCount);
const adb15SeedStatus = readJson(inputs.adb15SeedStatus);
const adb15NoRuntime = readJson(inputs.adb15NoRuntime);
const adb15Secret = readJson(inputs.adb15Secret);
const adb15NoDeployment = readJson(inputs.adb15NoDeployment);
const adb15Readiness = readJson(inputs.adb15Readiness);
const adb15Boundary = readJson(inputs.adb15Boundary);

if (adb15Review.status !== "seed_insertion_captured_ready_for_adb16_decision") throw new Error("ADB15 review status mismatch.");
if (adb15Review.summary?.total_seed_rows_verified !== 45) throw new Error("ADB15 must verify 45 seed rows.");
if (adb15Result.status !== "seed_insertion_succeeded_and_captured") throw new Error("ADB15 result record status mismatch.");
if (adb15RowCount.total_seed_rows_observed !== 45) throw new Error("ADB15 row-count verification must be 45.");
if (adb15SeedStatus.status !== "basic_seed_foundation_available") throw new Error("ADB15 seed foundation status mismatch.");
if (adb15NoRuntime.audit_passed !== true) throw new Error("ADB15 no-runtime audit must pass.");
if (adb15Secret.service_role_key_exposed !== false) throw new Error("Service-role key must not be exposed.");
if (adb15NoDeployment.deployment_performed !== false) throw new Error("Deployment must remain false.");
if (adb15Readiness.ready_for_adb16 !== true || adb15Readiness.next_stage_id !== "ADB16") throw new Error("ADB15 readiness must permit ADB16.");
if (adb15Boundary.next_stage_id !== "ADB16") throw new Error("ADB15 boundary must point to ADB16.");

const blockedState = {
  adb16_runtime_decision_recorded: true,
  adb15_consumed: true,
  runtime_engine_planning_approved: true,
  runtime_calculation_execution_approved_now: false,
  runtime_calculation_executed: false,
  adb17_engine_contract_ready: true,
  adb17_to_adb20_compact_path_recorded: true,

  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  rls_public_policy_activation_performed: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_content_generated: false,
  ag47_resume_allowed_after_adb20_only: true,
  ag47_resume_now: false
};

const decisionRecord = {
  module_id: "ADB16",
  title: "Runtime Calculation Decision Record",
  status: "runtime_engine_planning_approved_runtime_execution_deferred",
  decision: {
    runtime_engine_planning_approved: true,
    runtime_calculation_execution_approved_now: false,
    public_runtime_activation_approved_now: false,
    backend_auth_activation_approved_now: false,
    deployment_approved_now: false
  },
  rationale: [
    "ADB10 created the live Supabase schema.",
    "ADB15 verified 45 seed rows.",
    "The seed foundation is sufficient to plan the dry-run calculation engine.",
    "The seed foundation is not sufficient to publish public Panchang or guidance output.",
    "The next stages should prepare calculation-engine contracts and validation checks through ADB20 before returning to AG47."
  ],
  blocked_state: blockedState
};

const adb16ToAdb20Plan = {
  module_id: "ADB16",
  title: "ADB17 to ADB20 Runtime Foundation Plan",
  status: "compact_runtime_foundation_path_recorded",
  stages: [
    {
      stage_id: "ADB17",
      title: "Calculation Engine Contract and Dry-run Profile",
      purpose: "Define calculation-engine inputs, outputs, supported Panchanga fields, dry-run date/location/profile, and non-public execution boundaries.",
      must_not_do: ["execute runtime calculation", "write computed Panchang rows", "activate backend/Auth", "deploy"]
    },
    {
      stage_id: "ADB18",
      title: "Dry-run Validation Protocol and Seed Sufficiency Audit",
      purpose: "Define comparison checks against trusted Panchang references, source-dependency checks, location/sunrise basis checks, and seed gaps.",
      must_not_do: ["execute public runtime", "publish calculated results", "deploy"]
    },
    {
      stage_id: "ADB19",
      title: "Non-public Runtime Package Boundary",
      purpose: "Prepare a future dry-run execution package boundary and result-capture structure without public activation.",
      must_not_do: ["public API activation", "RLS public policy activation", "deployment"]
    },
    {
      stage_id: "ADB20",
      title: "ADB Runtime Foundation Closure and AG47 Return Gate",
      purpose: "Close the ADB foundation after schema, seed and runtime-planning checks; return to AG47 with runtime execution deferred.",
      must_not_do: ["resume AG47 before closure", "activate runtime without later explicit decision"]
    }
  ],
  compact_path_end_state: "ADB20 closes ADB foundation and records AG47 return gate.",
  blocked_state: blockedState
};

const engineRouteDecision = {
  module_id: "ADB16",
  title: "Calculation Engine Route Decision",
  status: "engine_route_decision_recorded",
  selected_route: "internal_calculation_engine_with_reviewed_ephemeris_and_ayanamsha_profiles",
  rejected_routes_for_now: [
    "live internet lookup for daily Panchang values",
    "unreviewed external API dependency",
    "direct public output generation",
    "manual-only Panchang entry as final system"
  ],
  first_engine_contract_scope: [
    "Tithi from Moon-Sun angular separation",
    "Nakshatra from sidereal Moon longitude",
    "Yoga from Sun+Moon longitude",
    "Karana from half-tithi logic",
    "Vara from local sunrise day-boundary",
    "Rashi from sidereal Moon longitude",
    "Sunrise/sunset/moonrise event-window basis as validation input"
  ],
  runtime_execution_status: "deferred_until_later_stage",
  blocked_state: blockedState
};

const dryRunScopeDecision = {
  module_id: "ADB16",
  title: "Dry-run Scope Decision",
  status: "dry_run_scope_decision_recorded",
  approved_for_planning_only: true,
  first_dry_run_scope_recommendation: {
    date_window: "7_day_initial_window",
    output_visibility: "internal_only",
    public_use_allowed_default: false,
    editorial_review_status_default: "pending_review",
    output_tables_candidate: [
      "astronomical_input_snapshots",
      "panchanga_calculation_runs",
      "panchanga_calculation_trace_logs",
      "panchang_daily_records"
    ]
  },
  execution_status: "not_executed_in_adb16",
  blocked_state: blockedState
};

const locationAyanamshaDecision = {
  module_id: "ADB16",
  title: "Location and Ayanamsha Decision",
  status: "location_ayanamsha_decision_recorded",
  first_location_profile_strategy: {
    primary_validation_profile: "India default review profile from seed foundation",
    regional_reference_candidates: ["Varanasi", "Patna/Bihar-Mithila", "Ranchi", "Itanagar"],
    reason: "These preserve classical/North-East/East India validation continuity without overfitting to one region."
  },
  ayanamsha_strategy: {
    first_candidate: "reviewed_candidate_profile_from_seed_foundation",
    hardcoded_final_ayanamsha: false,
    comparison_required_before_public_use: true
  },
  blocked_state: blockedState
};

const storageBoundaryDecision = {
  module_id: "ADB16",
  title: "Runtime Storage Boundary Decision",
  status: "runtime_storage_boundary_decision_recorded",
  allowed_future_internal_storage_targets: [
    "astronomical_input_snapshots",
    "panchanga_calculation_runs",
    "panchanga_calculation_trace_logs",
    "panchang_daily_records"
  ],
  required_default_flags_for_future_runtime_rows: {
    public_use_allowed: false,
    editorial_review_status: "pending_review",
    evidence_status: "calculation_dry_run",
    source_policy: "internal_calculation_trace_required"
  },
  blocked_future_outputs_without_later_approval: [
    "homepage Panchang card",
    "public daily guidance",
    "public star reflection",
    "festival/vrat public observance output",
    "backend API exposure",
    "deployment"
  ],
  blocked_state: blockedState
};

const noRuntimeExecutionAudit = {
  module_id: "ADB16",
  title: "No Runtime Execution Audit",
  status: "no_runtime_execution_audit_passed_for_adb16",
  audit_passed: true,
  checks: [
    { check_id: "runtime_calculation_execution_approved_now", expected: false, actual: false, passed: true },
    { check_id: "runtime_calculation_executed", expected: false, actual: false, passed: true },
    { check_id: "computed_panchang_rows_written", expected: false, actual: false, passed: true },
    { check_id: "public_content_generated", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noPublicActivationAudit = {
  module_id: "ADB16",
  title: "No Public Activation Audit",
  status: "no_public_activation_audit_passed_for_adb16",
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
  module_id: "ADB16",
  title: "ADB17 Engine Contract Readiness Record",
  status: "ready_for_adb17_engine_contract",
  ready_for_adb17: true,
  next_stage_id: "ADB17",
  next_stage_title: "Calculation Engine Contract and Dry-run Profile",
  adb17_allowed_scope: [
    "Define calculation-engine input/output contract.",
    "Define Panchanga formula coverage contract.",
    "Define dry-run profile and internal-only output expectations.",
    "Define validation and trace-log requirements.",
    "Keep runtime execution and public activation blocked."
  ],
  adb17_blocked_scope: [
    "Runtime calculation execution",
    "Computed Panchang row write",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure in repo/chat",
    "AG47 resume before ADB20"
  ],
  hard_blocker_count_for_adb17: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "ADB16",
  title: "ADB16 to ADB17 Engine Contract Boundary",
  status: "adb17_engine_contract_boundary_created",
  next_stage_id: "ADB17",
  next_stage_title: "Calculation Engine Contract and Dry-run Profile",
  allowed_scope: readiness.adb17_allowed_scope,
  blocked_scope: readiness.adb17_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "ADB16",
  title: "Runtime Calculation Decision Checkpoint",
  status: "runtime_engine_planning_decided_ready_for_adb17",
  depends_on: ["ADB15", "ADB14", "ADB10"],
  decision_record_file: outputs.decisionRecord,
  adb16_to_adb20_plan_file: outputs.adb16ToAdb20Plan,
  engine_route_decision_file: outputs.engineRouteDecision,
  dry_run_scope_decision_file: outputs.dryRunScopeDecision,
  location_ayanamsha_decision_file: outputs.locationAyanamshaDecision,
  storage_boundary_decision_file: outputs.storageBoundaryDecision,
  no_runtime_execution_audit_file: outputs.noRuntimeExecutionAudit,
  no_public_activation_audit_file: outputs.noPublicActivationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    adb16_runtime_decision_recorded: true,
    adb15_consumed: true,
    runtime_engine_planning_approved: true,
    runtime_calculation_execution_approved_now: false,
    runtime_calculation_executed: false,
    adb17_engine_contract_ready: true,
    adb17_to_adb20_compact_path_recorded: true,
    hard_blocker_count_for_adb17: 0,
    total_seed_rows_available: 45,
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
  module_id: "ADB16",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "ADB16",
  status: review.status,
  adb16_runtime_decision_recorded: 1,
  adb15_consumed: 1,
  runtime_engine_planning_approved: 1,
  runtime_calculation_execution_approved_now: 0,
  runtime_calculation_executed: 0,
  adb17_engine_contract_ready: 1,
  adb17_to_adb20_compact_path_recorded: 1,
  hard_blocker_count_for_adb17: 0,
  total_seed_rows_available: 45,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_content_generated: 0,
  ag47_resume_now: 0
};

const doc = `# ADB16 — Runtime Calculation Decision Checkpoint

## Result

ADB16 approves runtime calculation-engine planning, but does not approve runtime calculation execution.

## Decision

- Runtime engine planning: approved.
- Runtime execution now: not approved.
- Public output: not approved.
- Backend/Auth/Supabase runtime activation: not approved.
- Deployment: not approved.

## ADB17–ADB20 compact path

- ADB17 — Calculation Engine Contract and Dry-run Profile
- ADB18 — Dry-run Validation Protocol and Seed Sufficiency Audit
- ADB19 — Non-public Runtime Package Boundary
- ADB20 — ADB Runtime Foundation Closure and AG47 Return Gate

## Still blocked

- Runtime Panchanga calculation execution
- Computed Panchang row write
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure
- AG47 resume before ADB20

## Next

ADB17 — Calculation Engine Contract and Dry-run Profile.
`;

writeJson(outputs.decisionRecord, decisionRecord);
writeJson(outputs.adb16ToAdb20Plan, adb16ToAdb20Plan);
writeJson(outputs.engineRouteDecision, engineRouteDecision);
writeJson(outputs.dryRunScopeDecision, dryRunScopeDecision);
writeJson(outputs.locationAyanamshaDecision, locationAyanamshaDecision);
writeJson(outputs.storageBoundaryDecision, storageBoundaryDecision);
writeJson(outputs.noRuntimeExecutionAudit, noRuntimeExecutionAudit);
writeJson(outputs.noPublicActivationAudit, noPublicActivationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ ADB16 Runtime Calculation Decision Checkpoint generated.");
console.log("✅ Runtime engine planning approved; runtime execution remains deferred.");
console.log("✅ ADB17–ADB20 compact path recorded.");
console.log("✅ Ready for ADB17 Calculation Engine Contract and Dry-run Profile.");
console.log("✅ No runtime calculation, computed row write, backend/Auth activation, deployment or service-role exposure recorded.");
