import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const contract = JSON.parse(read("data/methodology/jyotisha/wss-full-personal-jyotisha-contract-v1.json"));
const architecture = read("docs/wss-full-personalised-jyotisha-architecture-v1.md");
const astronomicalEngine = read("scripts/lib/ag74l-astronomical-engine.mjs");
const currentReflection = read("assets/js/sup02-panchang-server-controller.js");

function pass(label, predicate) {
  assert.ok(predicate, label);
  console.log("PASS WSS01 " + label);
}

pass("product and runtime readiness are explicit", contract.contract_id === "WSS01_FULL_PERSONALISED_JYOTISHA_V1" &&
  contract.runtime_state === "not_implemented_full_jyotisha");
pass("exactly eight new WSS work stages, outside the frozen Panchang AG patch chain",
  contract.sequence.length === 8 && contract.sequence.every((entry,index) =>
    entry.id === "WSS0" + (index + 1) && entry.production_activation === false));
pass("full user input specification", ["name", "birth_date", "birth_time", "birthplace", "reference_date", "privacy_consent"].every(
  field => contract.input_contract[field]));
pass("personal name never becomes astronomical input", contract.input_contract.name.never_astronomical_input &&
  contract.input_contract.name.required_for_birth_chart === false);
pass("historical timezones, DST and unknown time are guarded",
  contract.input_contract.birth_time.dst_fold_gap_check &&
  contract.input_contract.birth_time.unknown_supported &&
  contract.input_contract.birthplace.timezone_required.includes("historical_seconds"));
pass("explicit no-precision-no-Lagna rule", contract.acceptance.output_fidelity.includes("no_lagna_when_birth_time_unknown"));
pass("comprehensive birth, Varga, Dashā, timing, name and privacy output contracts", ["NAT01", "NAT02", "NAT03", "NAT04", "NAM01", "DAS01",
  "LIF01", "LIF02", "LIF03", "TRN01", "PRV01"].every(id=>contract.output_requirements.some(x=>x.id === id)));
pass("only Nāma Rāśi candidate, no chart/period/future claim ready",
  contract.output_requirements.every(x => x.status !== "ready" && x.status !== "production"));
pass("ephemeris licensing is an explicit deployment blocker",
  contract.license_gate.required_before_public_chart_computation &&
  contract.license_gate.status === "blocked_pending_licence_decision" &&
  contract.license_gate.options.length >= 3);
pass("calculated, traditional, editorial and unavailable outputs stay distinct",
  ["astronomical_computed_fact","classical_conditional_interpretation","modern_editorial_guidance",
  "name_syllable_tradition","unavailable_or_insufficient_precision"].every(
  item=>contract.governance.must_separate.includes(item)));
pass("subscriber storage always explicitly opt-in",contract.input_contract.privacy_consent.anonymous_no_saved_profile &&
  contract.input_contract.privacy_consent.save_birth_profile_opt_in_only &&
  contract.acceptance.privacy.includes("no_personal_logging"));
pass("independent golden references and method provenance mandated",contract.acceptance.golden_reference_required &&
  contract.acceptance.independent_reference_required &&
  contract.acceptance.output_fidelity.includes("each_interpretation_has_source_rule_ids"));
pass("licensing and traditional astronomical source links retained",contract.sources.length>=4 &&
  contract.sources.some(x=>x.kind==="ephemeris_software_and_licence") &&
  contract.sources.some(x=>x.kind==="traditional_hora_text"));
pass("architecture specifies no fabricated transit or birth chart", architecture.includes("Do not fabricate a planetary transit") &&
  architecture.includes("never silently assume sunrise/noon") &&
  architecture.includes("**Not complete:** Nāma Rāśi alone"));
pass("baseline continues to be only sunrise-based Sun/Moon model",
  astronomicalEngine.includes("sun_longitude_sidereal") &&
  astronomicalEngine.includes("moon_longitude_sidereal") &&
  astronomicalEngine.includes("drishvara_lahiri_linear_tt_v1") &&
  !astronomicalEngine.includes("jupiter_longitude_sidereal") &&
  currentReflection.includes("function resolveStarBasis(context, runtime)"));
pass("no new public chart activation in the WSS01 contract itself",
  contract.sequence.every(x=>x.production_activation===false) &&
  contract.explicit_not_yet_available.includes("full_birth_kundali"));

console.log("WSS01 contract verified; chart calculation is NOT activated by this stage.");
