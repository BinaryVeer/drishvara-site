import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "data", "methodology", "m01-panchang-calculation-methodology.json");
const docPath = path.join(process.cwd(), "docs", "methodology", "M01_PANCHANG_CALCULATION_METHODOLOGY_SPECIFICATION.md");

function fail(message) {
  console.error(`❌ M01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

if (!fs.existsSync(registryPath)) {
  fail(`Missing M01 registry: ${registryPath}`);
}

if (!fs.existsSync(docPath)) {
  fail(`Missing M01 document: ${docPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "M01") {
  fail("module_id must be M01");
}

if (!Array.isArray(registry.depends_on) || !registry.depends_on.includes("M00")) {
  fail("M01 must depend on M00");
}

const disabledFlags = [
  "runtime_enabled",
  "subscriber_output_enabled",
  "public_panchang_enabled",
  "external_api_fetch_enabled",
  "auth_enabled",
  "payment_enabled",
  "supabase_enabled",
  "calculation_engine_enabled"
];

for (const flag of disabledFlags) {
  if (registry[flag] !== false) {
    fail(`${flag} must remain false in M01`);
  }
}

const requiredElements = ["tithi", "vara", "nakshatra", "yoga", "karana"];
const foundElements = (registry.panchang_elements ?? []).map((x) => x.key);

for (const element of requiredElements) {
  if (!foundElements.includes(element)) {
    fail(`Missing Panchang element specification: ${element}`);
  }
}

for (const element of registry.panchang_elements ?? []) {
  if (element.runtime_implemented !== false) {
    fail(`${element.key} must not be runtime implemented in M01`);
  }

  if (!element.basis) {
    fail(`${element.key} missing calculation basis`);
  }

  if (!element.conceptual_formula) {
    fail(`${element.key} missing conceptual formula`);
  }
}

const requiredInputs = [
  "gregorian_date",
  "location_name",
  "latitude",
  "longitude",
  "timezone",
  "calculation_date_range",
  "sunrise_basis",
  "ephemeris_basis",
  "ayanamsha_basis_if_sidereal"
];

for (const input of requiredInputs) {
  if (!registry.required_inputs.includes(input)) {
    fail(`Missing required input: ${input}`);
  }
}

if (registry.time_location_doctrine?.sunrise_finalization_deferred_to !== "M04") {
  fail("Sunrise finalization must be deferred to M04");
}

if (registry.ayanamsha_doctrine?.silent_ayanamsha_use_allowed !== false) {
  fail("Silent ayanamsha use must not be allowed");
}

const futureSections = [
  "date",
  "location",
  "sunrise",
  "panchang_elements",
  "calculation_basis",
  "review_status",
  "public_output_allowed"
];

for (const section of futureSections) {
  if (!registry.future_internal_output_contract_required_sections.includes(section)) {
    fail(`Missing future output contract section: ${section}`);
  }
}

const requiredTraceFields = [
  "input_date",
  "input_location",
  "timezone",
  "sunrise_basis",
  "ephemeris_source",
  "ayanamsha_source",
  "solar_longitude",
  "lunar_longitude",
  "sidereal_conversion_basis",
  "interpolation_or_root_finding_method",
  "element_transition_times",
  "skipped_repeated_flags",
  "source_registry_reference",
  "software_library_version",
  "calculation_timestamp",
  "reviewer_status"
];

for (const field of requiredTraceFields) {
  if (!registry.trace_requirements.includes(field)) {
    fail(`Missing trace requirement: ${field}`);
  }
}

const requiredExcluded = [
  "live_panchang_calculation",
  "public_panchang_page",
  "subscriber_panchang_output",
  "festival_recommendation",
  "vrat_recommendation",
  "fasting_day_decision",
  "auth",
  "supabase",
  "subscription",
  "payment",
  "external_api_fetch",
  "server_endpoint",
  "frontend_dashboard_card"
];

for (const exclusion of requiredExcluded) {
  if (!registry.scope.excluded.includes(exclusion)) {
    fail(`Missing explicit M01 exclusion: ${exclusion}`);
  }
}


const requiredTraditions = [
  "drik_ganitham_thirukanitha",
  "siddhanta_jyotisha",
  "surya_siddhanta"
];

const foundTraditions = (registry.calculation_traditions ?? []).map((x) => x.key);

for (const tradition of requiredTraditions) {
  if (!foundTraditions.includes(tradition)) {
    fail(`Missing calculation tradition anchor: ${tradition}`);
  }
}

for (const tradition of registry.calculation_traditions ?? []) {
  if (tradition.runtime_enabled !== false) {
    fail(`${tradition.key} must not be runtime enabled in M01`);
  }
}

const surya = (registry.calculation_traditions ?? []).find((x) => x.key === "surya_siddhanta");
if (!surya || surya.direct_algorithm_use_enabled !== false) {
  fail("Surya Siddhanta must be a named classical reference, not a direct enabled backend in M01");
}

if (registry.calculation_basis_disclosure_rules?.mixed_basis_allowed_without_disclosure !== false) {
  fail("Mixed calculation basis must not be allowed without disclosure");
}

if (registry.calculation_basis_disclosure_rules?.public_claims_allowed_in_m01 !== false) {
  fail("Public calculation-basis claims must not be allowed in M01");
}

const requiredDocPhrases = [
  "Tithi",
  "Vara",
  "Nakshatra",
  "Yoga",
  "Karana",
  "Ayanamsha Doctrine",
  "Ephemeris Doctrine",
  "Interval and Boundary Handling",
  "Skipped and Repeated Element Doctrine",
  "M01 does not implement",
  "Drik Ganitham",
  "Thirukanitha",
  "Siddhanta Jyotisha",
  "Surya Siddhanta",
  "Non-Mixing Rule"
];

for (const phrase of requiredDocPhrases) {
  if (!docText.includes(phrase)) {
    fail(`M01 document missing section/phrase: ${phrase}`);
  }
}

pass("M01 methodology registry is present.");
pass("M01 methodology document is present.");
pass("M01 depends on M00.");
pass("Runtime/auth/payment/Supabase/API/subscriber/public Panchang flags are disabled.");
pass("All five Panchang elements are specified.");
pass("Date, location, timezone, sunrise, ephemeris, and ayanamsha requirements are declared.");
pass("Interval, skipped/repeated, trace, and validation doctrines are declared.");
pass("Drik/Thirukanitha, Siddhanta Jyotisha, and Surya Siddhanta anchors are declared without runtime activation.");
pass("M01 is methodology-only and safe to commit.");
