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
  console.error(`❌ AG72A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const ag71rClosurePath = "data/knowledge-base/panchang-festival/production/ag71r-panchang-public-pilot-qa-closure.json";
const panchangPilotPath = "generated/panchang-pilot-preview-data.json";
const indexPath = "index.html";
const starManifestPath = "data/methodology/star-reflection/star-reflection-method-manifest.json";

for (const file of [ag71rClosurePath, panchangPilotPath, indexPath]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const ag71r = readJson(ag71rClosurePath);
const panchangPilot = readJson(panchangPilotPath);
const indexHtml = fs.readFileSync(full(indexPath), "utf8");

if (ag71r.status !== "ag71r_panchang_public_pilot_qa_static_closure_passed") {
  fail("AG71R Panchang pilot static closure has not passed.");
}

if (panchangPilot.status !== "ag71q_r1_public_pilot_preview_data_created") {
  fail("AG71Q-R1 Panchang pilot data is not ready.");
}

if (!Array.isArray(panchangPilot.records) || panchangPilot.records.length !== 28) {
  fail("Panchang pilot data must contain 28 records.");
}

for (const marker of [
  "Star Reflection",
  "star-reflection-name",
  "star-reflection-dob",
  "star-birth-place-select"
]) {
  if (!indexHtml.includes(marker)) fail(`index.html missing Star Reflection marker: ${marker}`);
}

const methodLockPath = "data/methodology/star-reflection/ag72a-star-reflection-method-lock.json";
const inputBasisPath = "data/methodology/star-reflection/ag72a-star-reflection-input-basis-map.json";
const safetyBoundaryPath = "data/methodology/star-reflection/ag72a-star-reflection-safety-boundary.json";
const dependencyPath = "data/methodology/star-reflection/ag72a-panchang-dependency-consumption-record.json";
const readinessPath = "data/content-intelligence/quality-registry/ag72a-ag72b-star-reflection-computation-contract-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag72a-to-ag72b-star-reflection-computation-contract-boundary.json";

writeJson(methodLockPath, {
  module_id: "AG72A",
  title: "Star Reflection Method Lock",
  status: "ag72a_star_reflection_method_locked",
  method_basis: {
    primary_basis: "moon_led_nakshatra_oriented",
    supporting_basis: [
      "panchanga_supported",
      "location_timezone_aware",
      "date_sensitive",
      "non_deterministic_reflective_guidance"
    ],
    sun_basis_role: "supporting_context_only_not_primary_method",
    star_meaning: "nakshatra_lunar_mansion_context_not_generic_star_sign",
    default_public_pilot_depth: "day_level_reflection_until_birth_time_and_consent_contract_are_added"
  },
  methodology_decision: {
    use_moon_or_sun: "moon_primary_sun_supporting",
    use_stars: "yes_as_nakshatra_context_not_western_star_sign_primary",
    requires_panchang_foundation: true,
    consumes_panchang_location_timezone_foundation: true,
    deterministic_prediction_allowed: false,
    personalised_assessment_allowed: false,
    medical_financial_legal_decision_guidance_allowed: false
  },
  dependencies: {
    panchang_pilot_closure: ag71rClosurePath,
    panchang_pilot_preview_data: panchangPilotPath
  },
  next_step: {
    module_id: "AG72B",
    title: "Star Reflection Computation Contract",
    purpose: "Define the computation contract for deriving non-deterministic Star Reflection basis from user input and Panchang/location foundations."
  }
});

writeJson(inputBasisPath, {
  module_id: "AG72A",
  title: "Star Reflection Input Basis Map",
  status: "ag72a_input_basis_map_created",
  current_ui_inputs: {
    name: {
      element_id: "star-reflection-name",
      role: "optional_display_basis_only",
      computation_role: "none"
    },
    date_of_birth: {
      element_id: "star-reflection-dob",
      expected_format: "DD/MM/YYYY",
      role: "date_basis",
      limitation: "without birth time, only day-level reflection may be produced"
    },
    birth_place_select: {
      element_id: "star-birth-place-select",
      role: "location_timezone_basis",
      source: "four_location_pilot_location_registry"
    },
    birth_coordinates: {
      element_ids: [
        "star-birth-latitude",
        "star-birth-longitude",
        "star-birth-timezone",
        "star-birth-coordinate-label"
      ],
      role: "future_coordinate_basis",
      current_status: "accepted_for_basis_preview_only"
    }
  },
  method_mapping: {
    moon_position_context: "primary",
    nakshatra_context: "primary_reflective_symbolic_basis",
    panchanga_context: "supporting",
    sun_position_context: "secondary_supporting_context",
    western_sun_sign_context: "not_primary_method"
  }
});

writeJson(safetyBoundaryPath, {
  module_id: "AG72A",
  title: "Star Reflection Safety Boundary",
  status: "ag72a_safety_boundary_locked",
  allowed_output_style: [
    "reflective_prompt",
    "symbolic_context",
    "non_deterministic_guidance",
    "general introspective framing"
  ],
  blocked_output_style: [
    "deterministic prediction",
    "guaranteed future event",
    "medical guidance",
    "financial guidance",
    "legal guidance",
    "sensitive profiling",
    "personality diagnosis",
    "relationship certainty claim",
    "career certainty claim"
  ],
  consent_privacy_boundary: {
    personalised_interpretation_requires_consent_gate: true,
    storage_of_personal_birth_data_without_explicit_policy: false,
    public_ui_must_show_reflective_not_predictive_language: true
  }
});

writeJson(dependencyPath, {
  module_id: "AG72A",
  title: "Panchang Dependency Consumption Record",
  status: "ag72a_panchang_dependency_consumed",
  consumed_modules: [
    "AG71Q-R1",
    "AG71R"
  ],
  consumed_assets: {
    panchang_pilot_data_file: panchangPilotPath,
    panchang_static_closure_record: ag71rClosurePath
  },
  dependency_summary: {
    panchang_pilot_records_available: panchangPilot.records.length,
    location_timezone_foundation_available: true,
    exact_panchang_values_available_for_method_basis: true,
    star_reflection_personal_output_still_locked: true
  }
});

writeJson(readinessPath, {
  module_id: "AG72A-AG72B",
  title: "AG72B Star Reflection Computation Contract Readiness",
  status: "ready_for_ag72b_star_reflection_computation_contract",
  ag72a_consumed: true,
  hard_blockers_for_ag72b: [],
  controlled_requirements_for_ag72b: [
    "Use Moon-led/Nakshatra-oriented basis.",
    "Use Panchang and location/timezone foundation only as method basis.",
    "Keep output non-deterministic and reflective.",
    "Do not activate personalised prediction.",
    "Do not store personal data without explicit consent/privacy gate.",
    "Do not activate backend or Supabase."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG72A",
  to_module: "AG72B",
  transition: "star_reflection_computation_contract",
  allowed_next_actions: [
    "Define Star Reflection basis computation contract.",
    "Map DOB and location to Panchang-supported reflective basis.",
    "Define birth-time limitation handling.",
    "Keep public output reflective and non-predictive."
  ],
  blocked_actions: [
    "Deterministic personal prediction.",
    "Sensitive profiling.",
    "Medical, legal, financial or decision guidance.",
    "Backend runtime activation without approval.",
    "Supabase activation without approval."
  ]
});

writeJson("data/content-intelligence/quality-reviews/ag72a-star-reflection-method-lock.json", {
  module_id: "AG72A",
  title: "Star Reflection Method Lock Review",
  status: "ag72a_completed",
  generated_records: {
    method_lock: methodLockPath,
    input_basis_map: inputBasisPath,
    safety_boundary: safetyBoundaryPath,
    panchang_dependency_consumption: dependencyPath,
    ag72b_readiness: readinessPath,
    ag72b_boundary: boundaryPath
  },
  summary: {
    moon_led_nakshatra_method_locked: true,
    sun_sign_not_primary: true,
    panchang_dependency_consumed: true,
    personalised_output_still_locked: true,
    ready_for_ag72b: true
  }
});

writeJson("data/quality/ag72a-star-reflection-method-lock.json", {
  module_id: "AG72A",
  status: "ag72a_completed",
  method_locked: true,
  primary_basis: "moon_led_nakshatra_oriented",
  ready_for_ag72b: true
});

writeJson("data/quality/ag72a-star-reflection-method-lock-preview.json", {
  module_id: "AG72A",
  status: "ag72a_completed",
  method_locked: 1,
  moon_led_basis: 1,
  sun_primary_basis: 0,
  ready_for_ag72b: 1
});

writeText("docs/quality/AG72A_STAR_REFLECTION_METHOD_LOCK.md", `# AG72A — Star Reflection Method Lock

AG72A locks the Star Reflection methodology.

## Decision

Star Reflection will use a Moon-led, Nakshatra-oriented, Panchanga-supported and location-aware basis.

The Sun is not the primary method. Solar context may be used only as supporting context. Here, “star” means Nakshatra or lunar mansion context, not generic Western sun-sign astrology.

## Current Limitation

The present public UI has name, DOB and location basis. It does not yet collect birth time. Therefore, until a birth-time and consent/privacy contract is added, public-pilot output must remain day-level and reflective.

## Output Boundary

Allowed:

- Reflective prompt
- Symbolic context
- Non-deterministic guidance
- General introspective framing

Blocked:

- Deterministic prediction
- Sensitive profiling
- Medical, legal or financial guidance
- Personality diagnosis
- Guaranteed future event claim

## Next Step

AG72B should define the Star Reflection computation contract.
`);

let starManifest = {};
if (exists(starManifestPath)) {
  starManifest = readJson(starManifestPath);
}

starManifest.module_id = "STAR_REFLECTION_METHOD_MANIFEST";
starManifest.current_status = "ag72a_star_reflection_method_locked_ag72b_ready";
starManifest.ag72a_files = {
  method_lock: methodLockPath,
  input_basis_map: inputBasisPath,
  safety_boundary: safetyBoundaryPath,
  panchang_dependency_consumption: dependencyPath
};
starManifest.current_counts = {
  ...(starManifest.current_counts || {}),
  ag72a_method_lock_records: 1,
  ag72a_safety_boundary_records: 1
};
writeJson(starManifestPath, starManifest);

pass("AG72A Star Reflection method lock passed.");
pass("Moon-led/Nakshatra-oriented method is locked.");
pass("AG72B Star Reflection computation contract is ready.");
