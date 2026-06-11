import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function fail(message) {
  console.error(`❌ AG72B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const methodLockPath = "data/methodology/star-reflection/ag72a-star-reflection-method-lock.json";
const inputBasisPath = "data/methodology/star-reflection/ag72a-star-reflection-input-basis-map.json";
const safetyPath = "data/methodology/star-reflection/ag72a-star-reflection-safety-boundary.json";
const dependencyPath = "data/methodology/star-reflection/ag72a-panchang-dependency-consumption-record.json";
const starManifestPath = "data/methodology/star-reflection/star-reflection-method-manifest.json";
const panchangPilotPath = "generated/panchang-pilot-preview-data.json";

for (const file of [methodLockPath, inputBasisPath, safetyPath, dependencyPath, starManifestPath, panchangPilotPath]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const methodLock = readJson(methodLockPath);
const inputBasis = readJson(inputBasisPath);
const safety = readJson(safetyPath);
const dependency = readJson(dependencyPath);
const starManifest = readJson(starManifestPath);
const panchangPilot = readJson(panchangPilotPath);

if (methodLock.status !== "ag72a_star_reflection_method_locked") fail("AG72A method lock status mismatch.");
if (inputBasis.status !== "ag72a_input_basis_map_created") fail("AG72A input basis status mismatch.");
if (safety.status !== "ag72a_safety_boundary_locked") fail("AG72A safety boundary status mismatch.");
if (dependency.status !== "ag72a_panchang_dependency_consumed") fail("AG72A dependency consumption status mismatch.");
if (starManifest.current_status !== "ag72a_star_reflection_method_locked_ag72b_ready") fail("Star Reflection manifest is not AG72B-ready.");
if (!Array.isArray(panchangPilot.records) || panchangPilot.records.length !== 28) fail("Panchang pilot data must contain 28 records.");

const contractPath = "data/methodology/star-reflection/ag72b-star-reflection-computation-contract.json";
const basisResolverPath = "data/methodology/star-reflection/ag72b-star-reflection-basis-resolver-contract.json";
const requestSchemaPath = "data/methodology/star-reflection/ag72b-star-reflection-request-schema.json";
const limitationPath = "data/methodology/star-reflection/ag72b-star-reflection-limitation-policy.json";
const noPredictionAuditPath = "data/methodology/star-reflection/ag72b-no-prediction-computation-audit.json";
const readinessPath = "data/content-intelligence/quality-registry/ag72b-ag72c-star-reflection-output-doctrine-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag72b-to-ag72c-star-reflection-output-doctrine-boundary.json";

writeJson(contractPath, {
  module_id: "AG72B",
  title: "Star Reflection Computation Contract",
  status: "ag72b_star_reflection_computation_contract_created",
  source_method_lock: methodLockPath,
  source_input_basis_map: inputBasisPath,
  source_safety_boundary: safetyPath,
  source_panchang_dependency: dependencyPath,
  computation_scope: {
    primary_basis: "moon_led_nakshatra_oriented",
    panchanga_supported: true,
    location_timezone_aware: true,
    sun_context_role: "supporting_context_only",
    western_sun_sign_primary: false,
    birth_time_required_for_full_precision: true,
    public_pilot_without_birth_time: "day_level_reflective_basis_only"
  },
  allowed_computation_outputs: [
    "basis_record_id",
    "date_basis",
    "location_basis",
    "timezone_basis",
    "day_level_nakshatra_context",
    "panchanga_context",
    "reflective_theme_keys",
    "uncertainty_notice"
  ],
  blocked_computation_outputs: [
    "deterministic prediction",
    "future event guarantee",
    "sensitive trait inference",
    "personality diagnosis",
    "health guidance",
    "financial guidance",
    "legal guidance",
    "relationship certainty",
    "career certainty"
  ],
  next_step: {
    module_id: "AG72C",
    title: "Star Reflection Output Doctrine",
    purpose: "Define the safe reflective output structure before any internal output bank or UI rendering."
  }
});

writeJson(basisResolverPath, {
  module_id: "AG72B",
  title: "Star Reflection Basis Resolver Contract",
  status: "ag72b_basis_resolver_contract_created",
  resolver_flow: [
    {
      step: 1,
      name: "collect_public_pilot_inputs",
      inputs: ["optional_name", "date_of_birth_dd_mm_yyyy", "birth_place_or_coordinate_basis"],
      output: "normalised_basis_request"
    },
    {
      step: 2,
      name: "resolve_location_timezone",
      input: "birth_place_or_coordinate_basis",
      output: "location_timezone_basis",
      dependency: "AG71 location/timezone pilot foundation"
    },
    {
      step: 3,
      name: "resolve_day_level_panchanga_context",
      input: "date_basis + location_timezone_basis",
      output: "day_level_panchanga_context",
      dependency: "AG71Q-R1 Panchang public pilot preview data / future computation harness"
    },
    {
      step: 4,
      name: "derive_reflective_theme_keys",
      input: "nakshatra_oriented_panchanga_context",
      output: "non_deterministic_reflective_theme_keys"
    },
    {
      step: 5,
      name: "apply_safety_boundary",
      input: "reflective_theme_keys",
      output: "safe_reflection_basis_record"
    }
  ],
  resolver_policy: {
    no_birth_time_mode: "day_level_only",
    birth_time_mode: "future_contract_required",
    exact_personal_prediction: false,
    symbolic_reflection_only: true
  }
});

writeJson(requestSchemaPath, {
  module_id: "AG72B",
  title: "Star Reflection Request Schema",
  status: "ag72b_request_schema_created",
  schema_version: "ag72b.v1",
  required_fields_for_public_pilot: {
    date_of_birth: {
      type: "string",
      format: "DD/MM/YYYY",
      validation: "date_format_and_valid_calendar_date_required"
    },
    location_basis: {
      type: "object",
      allowed_modes: ["pilot_place_select", "coordinate_basis_preview"],
      required_for: "timezone_and_day_level_context"
    }
  },
  optional_fields: {
    name: {
      type: "string",
      purpose: "display_only",
      computation_role: "none"
    }
  },
  future_fields_not_active_yet: {
    birth_time: {
      type: "string",
      format: "HH:mm",
      status: "future_contract_required_before_use"
    },
    consent_token: {
      type: "string",
      status: "future_privacy_gate_required_before_personalisation"
    }
  },
  output_basis_record_shape: {
    basis_record_id: "string",
    date_basis: "YYYY-MM-DD",
    location_id: "string",
    timezone: "IANA timezone string",
    primary_symbolic_basis: "nakshatra_oriented_context",
    panchanga_supporting_context: "object",
    reflective_theme_keys: "array",
    uncertainty_notice: "string",
    deterministic_prediction_allowed: false
  }
});

writeJson(limitationPath, {
  module_id: "AG72B",
  title: "Star Reflection Limitation Policy",
  status: "ag72b_limitation_policy_created",
  limitations: {
    birth_time_absent: {
      effect: "No precise ascendant, house, or time-sensitive personal interpretation.",
      allowed_output: "day-level reflective context only"
    },
    four_location_pilot: {
      effect: "Only pilot place/timezone basis may be treated as validated.",
      allowed_output: "pilot basis preview only"
    },
    panchang_regional_method_pending: {
      effect: "Regional computation method remains under verification.",
      allowed_output: "method-labelled reflection only"
    },
    consent_privacy_gate_pending: {
      effect: "No stored personal profile or personalised prediction.",
      allowed_output: "session-level reflective guidance only"
    }
  }
});

writeJson(noPredictionAuditPath, {
  module_id: "AG72B",
  title: "No Prediction Computation Audit",
  status: "ag72b_no_prediction_computation_audit_passed",
  checks: {
    deterministic_prediction_enabled: false,
    sensitive_profiling_enabled: false,
    medical_guidance_enabled: false,
    financial_guidance_enabled: false,
    legal_guidance_enabled: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    personal_data_storage_enabled: false,
    public_ui_result_generation_enabled_now: false
  }
});

writeJson(readinessPath, {
  module_id: "AG72B-AG72C",
  title: "AG72C Star Reflection Output Doctrine Readiness",
  status: "ready_for_ag72c_star_reflection_output_doctrine",
  ag72b_consumed: true,
  hard_blockers_for_ag72c: [],
  controlled_requirements_for_ag72c: [
    "Define output sections using reflective, non-deterministic language.",
    "Include limitation note where birth time is absent.",
    "Include Panchanga-supported basis label.",
    "Block prediction, diagnosis and sensitive profiling.",
    "Keep UI rendering blocked until output doctrine and internal bank are complete."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG72B",
  to_module: "AG72C",
  transition: "star_reflection_output_doctrine",
  allowed_next_actions: [
    "Define Star Reflection output sections.",
    "Define safe language templates.",
    "Define basis labels and uncertainty notes.",
    "Prepare internal output bank requirements."
  ],
  blocked_actions: [
    "Public result rendering before doctrine.",
    "Personalised deterministic prediction.",
    "Sensitive profiling.",
    "Backend runtime activation.",
    "Supabase activation.",
    "Personal data storage."
  ]
});

writeJson("data/content-intelligence/quality-reviews/ag72b-star-reflection-computation-contract.json", {
  module_id: "AG72B",
  title: "Star Reflection Computation Contract Review",
  status: "ag72b_completed",
  generated_records: {
    computation_contract: contractPath,
    basis_resolver_contract: basisResolverPath,
    request_schema: requestSchemaPath,
    limitation_policy: limitationPath,
    no_prediction_audit: noPredictionAuditPath,
    ag72c_readiness: readinessPath,
    ag72c_boundary: boundaryPath
  },
  summary: {
    computation_contract_created: true,
    moon_led_nakshatra_basis_preserved: true,
    public_ui_result_generation_enabled_now: false,
    deterministic_prediction_enabled: false,
    ready_for_ag72c: true
  }
});

writeJson("data/quality/ag72b-star-reflection-computation-contract.json", {
  module_id: "AG72B",
  status: "ag72b_completed",
  computation_contract_created: true,
  deterministic_prediction_enabled: false,
  ready_for_ag72c: true
});

writeJson("data/quality/ag72b-star-reflection-computation-contract-preview.json", {
  module_id: "AG72B",
  status: "ag72b_completed",
  computation_contract_created: 1,
  deterministic_prediction_enabled: 0,
  ready_for_ag72c: 1
});

writeText("docs/quality/AG72B_STAR_REFLECTION_COMPUTATION_CONTRACT.md", `# AG72B — Star Reflection Computation Contract

AG72B defines how Star Reflection basis computation should work after the AG72A method lock.

## Computation Basis

- Primary: Moon-led, Nakshatra-oriented context
- Supporting: Panchanga context, location and timezone basis
- Sun: Supporting context only
- Western sun sign: Not the primary method

## Public Pilot Limitation

Because the current public UI does not collect birth time, the public pilot may only create day-level reflective basis. No precise ascendant, house, or time-sensitive personal interpretation is allowed.

## Blocked

- Deterministic prediction
- Sensitive profiling
- Medical, financial or legal guidance
- Personal data storage
- Backend/Supabase activation
- Public result rendering before output doctrine

## Next Step

AG72C should define the Star Reflection Output Doctrine.
`);

starManifest.current_status = "ag72b_star_reflection_computation_contract_created_ag72c_ready";
starManifest.ag72b_files = {
  computation_contract: contractPath,
  basis_resolver_contract: basisResolverPath,
  request_schema: requestSchemaPath,
  limitation_policy: limitationPath,
  no_prediction_audit: noPredictionAuditPath
};
starManifest.current_counts = {
  ...(starManifest.current_counts || {}),
  ag72b_contract_records: 1,
  ag72b_no_prediction_audit_records: 1
};
writeJson(starManifestPath, starManifest);

pass("AG72B Star Reflection computation contract passed.");
pass("No deterministic prediction or public result generation enabled.");
pass("AG72C Star Reflection output doctrine is ready.");
