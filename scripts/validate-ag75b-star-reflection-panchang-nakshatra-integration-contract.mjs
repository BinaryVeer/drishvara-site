import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (value) => path.join(root, value);
const exists = (value) => fs.existsSync(full(value));
const read = (value) => fs.readFileSync(full(value), "utf8");
const readJson = (value) => JSON.parse(read(value));
const sha256 = (value) =>
  crypto
    .createHash("sha256")
    .update(fs.readFileSync(full(value)))
    .digest("hex");

const fail = (message) => {
  console.error(`❌ AG75B validation failed: ${message}`);
  process.exit(1);
};

const governedBaseline = "34a633891b5ad9d72b841474342b6f0b14f2f53a";
const candidateSha = "e67a31b2a36424dd5a74dccb218269e81cee353c1ab38c0b2affa45c607e4df7";

const paths = {
  integration:
    "data/methodology/star-reflection/" +
    "ag75b-star-reflection-panchang-nakshatra-integration-contract.json",
  request:
    "data/methodology/star-reflection/" +
    "ag75b-star-reflection-runtime-request-mapping-contract.json",
  response:
    "data/methodology/star-reflection/" +
    "ag75b-star-reflection-runtime-response-consumption-contract.json",
  resolution:
    "data/methodology/star-reflection/" +
    "ag75b-star-reflection-basis-resolution-and-degradation-policy.json",
  audit:
    "data/methodology/star-reflection/" +
    "ag75b-star-reflection-no-storage-and-runtime-non-mutation-audit.json",
  readiness:
    "data/content-intelligence/quality-registry/" +
    "ag75b-ag75c-star-reflection-expanded-output-bank-readiness-record.json",
  boundary:
    "data/content-intelligence/mutation-plans/" +
    "ag75b-to-ag75c-star-reflection-expanded-output-bank-boundary.json",
  review:
    "data/content-intelligence/quality-reviews/" +
    "ag75b-star-reflection-panchang-nakshatra-integration-contract.json",
  quality:
    "data/quality/" +
    "ag75b-star-reflection-panchang-nakshatra-integration-contract.json",
  documentation:
    "docs/quality/" +
    "AG75B_STAR_REFLECTION_PANCHANG_NAKSHATRA_INTEGRATION_CONTRACT.md",
};

for (const value of Object.values(paths)) {
  if (!exists(value)) {
    fail(`Missing required AG75B file: ${value}`);
  }
}

const integration = readJson(paths.integration);
const request = readJson(paths.request);
const response = readJson(paths.response);
const resolution = readJson(paths.resolution);
const audit = readJson(paths.audit);
const readiness = readJson(paths.readiness);
const boundary = readJson(paths.boundary);
const review = readJson(paths.review);
const quality = readJson(paths.quality);

if (
  integration.module_id !== "AG75B" ||
  integration.status !==
    "ag75b_panchang_nakshatra_integration_contract_locked" ||
  integration.governed_repository_baseline !== governedBaseline ||
  integration.candidate_contract?.sha256 !== candidateSha ||
  integration.source_count !== 18 ||
  integration.next_step?.module_id !== "AG75C"
) {
  fail("Integration identity, source count or AG75C handoff mismatch.");
}

const sourceRegister = integration.immutable_source_register || [];
if (sourceRegister.length !== 18) {
  fail("Immutable source register must contain exactly 18 files.");
}

const seen = new Set();
for (const item of sourceRegister) {
  if (seen.has(item.path)) {
    fail(`Duplicate immutable source: ${item.path}`);
  }
  seen.add(item.path);

  if (!exists(item.path)) {
    fail(`Immutable source missing: ${item.path}`);
  }
  if (sha256(item.path) !== item.sha256) {
    fail(`Immutable source changed: ${item.path}`);
  }
}

if (
  JSON.stringify(
    integration.precision_mode_reconciliation?.ag73b_input_modes
  ) !== JSON.stringify([
    "exact_session_only",
    "unknown",
    "pending",
    "invalid",
  ]) ||
  JSON.stringify(
    integration.precision_mode_reconciliation?.existing_public_result_modes
  ) !== JSON.stringify([
    "exact_session_only",
    "unknown",
    "pending_or_invalid",
  ]) ||
  integration.method_boundary
    ?.sunrise_nakshatra_is_not_automatically_birth_nakshatra !== true ||
  integration.method_boundary?.missing_value_invention_allowed !== false
) {
  fail("Precision-mode or method boundary mismatch.");
}

if (
  request.status !==
    "ag75b_runtime_request_mapping_contract_locked" ||
  request.runtime_method !== "POST" ||
  request.maximum_body_bytes !== 16384 ||
  request.civil_date_mapping?.supported_start !== "1900-01-01" ||
  request.civil_date_mapping?.supported_end !== "2100-12-31" ||
  request.precision_mode_request_eligibility?.exact_session_only
    ?.birth_time_sent_to_runtime !== false ||
  request.precision_mode_request_eligibility?.unknown
    ?.birth_time_sent_to_runtime !== false ||
  request.precision_mode_request_eligibility?.pending
    ?.runtime_request_eligible !== false ||
  request.precision_mode_request_eligibility?.invalid
    ?.runtime_request_eligible !== false ||
  request.authentication_boundary?.browser_service_role_key_allowed !== false ||
  request.authentication_boundary?.browser_secret_allowed !== false ||
  Object.values(request.persistence_boundary || {}).some(
    (value) => value !== false
  ) ||
  request.ag75b_runtime_called !== false
) {
  fail("Runtime request mapping or privacy boundary mismatch.");
}

if (
  response.status !==
    "ag75b_runtime_response_consumption_contract_locked" ||
  response.accepted_response_status !==
    "sup02_governed_public_runtime_response" ||
  response.required_release_state?.release_id !==
    "ag74p_final_2026_06_24" ||
  response.required_release_state?.runtime_release_id !==
    "sup01_panchang_runtime_v1" ||
  response.required_release_state?.no_input_persistence !== true ||
  response.required_release_state?.public_ui_cutover_active !== true ||
  Object.values(response.required_privacy_state || {}).some(
    (value) => value !== false
  ) ||
  JSON.stringify(response.accepted_panchang_sources) !==
    JSON.stringify([
      "approved_precomputed_record",
      "approved_server_calculation",
    ]) ||
  !response.mandatory_available_result_fields?.includes(
    "panchang.result.elements.nakshatra.index"
  ) ||
  !response.optional_available_result_fields?.includes(
    "panchang.result.transitions.nakshatra.next"
  ) ||
  response.observances_consumed_by_star_reflection !== false
) {
  fail("Runtime response-consumption contract mismatch.");
}

const map = resolution.nakshatra_index_map || [];
if (
  resolution.status !==
    "ag75b_basis_resolution_and_degradation_policy_locked" ||
  map.length !== 27 ||
  map.some((item, index) =>
    item.index !== index + 1 ||
    typeof item.name !== "string" ||
    item.name.length === 0
  ) ||
  resolution.index_validation?.silent_wrap_allowed !== false ||
  resolution.index_validation?.invented_name_allowed !== false ||
  resolution.time_representation?.birth_input_precision !== "minute" ||
  resolution.time_representation
    ?.implicit_timezone_offset_choice_allowed !== false ||
  resolution.transition_semantics
    ?.previous_boundary_inclusive_for_new_segment !== true ||
  resolution.transition_semantics
    ?.next_boundary_exclusive_for_current_segment !== true ||
  resolution.unknown_resolution
    ?.exact_birth_star_claim_allowed !== false ||
  resolution.pending_resolution?.runtime_request_allowed !== false ||
  resolution.invalid_resolution?.runtime_request_allowed !== false
) {
  fail("Basis-resolution, index or degradation policy mismatch.");
}

for (const requiredState of [
  "runtime_unavailable",
  "runtime_error",
  "runtime_contract_mismatch",
  "missing_transition_metadata",
  "invalid_nakshatra_index",
  "unresolved_ambiguous_local_time",
  "unresolved_nonexistent_local_time",
  "exact_transition_minute_ambiguous",
  "exact_outside_single_transition_window",
]) {
  if (!resolution.runtime_degradation_states?.includes(requiredState)) {
    fail(`Missing degradation state: ${requiredState}`);
  }
}

if (
  audit.status !==
    "ag75b_no_storage_and_runtime_non_mutation_audit_passed" ||
  Object.values(audit.checks || {}).some((value) => value !== false)
) {
  fail("No-storage or runtime non-mutation audit mismatch.");
}

if (
  readiness.status !==
    "ready_for_ag75c_expanded_star_reflection_output_bank" ||
  readiness.hard_blockers?.length !== 0 ||
  readiness.source_count !== 18 ||
  readiness.next_stage !== "AG75C"
) {
  fail("AG75C readiness mismatch.");
}

for (const requiredState of [
  "exact_window_resolved",
  "unknown_day_context",
  "pending_input",
  "invalid_input",
  "runtime_unavailable",
  "runtime_error",
  "runtime_contract_mismatch",
  "missing_transition_metadata",
  "invalid_nakshatra_index",
  "unresolved_ambiguous_local_time",
  "unresolved_nonexistent_local_time",
  "exact_transition_minute_ambiguous",
  "exact_outside_single_transition_window",
]) {
  if (!readiness.required_ag75c_resolution_states?.includes(requiredState)) {
    fail(`AG75C readiness missing state: ${requiredState}`);
  }
}

if (
  boundary.from_module !== "AG75B" ||
  boundary.to_module !== "AG75C" ||
  boundary.status !== "ag75b_to_ag75c_boundary_locked" ||
  boundary.mutation_class !==
    "repository_output_bank_records_only_no_public_or_live_mutation"
) {
  fail("AG75B-to-AG75C mutation boundary mismatch.");
}

if (
  review.status !== "ag75b_completed" ||
  review.summary?.source_records_verified !== 18 ||
  review.summary?.ready_for_ag75c !== true ||
  review.summary?.live_runtime_called !== false ||
  review.summary?.public_ui_changed !== false ||
  review.summary?.output_bank_expanded !== false ||
  review.summary?.database_changed !== false ||
  review.summary?.edge_function_changed !== false ||
  review.summary?.runtime_flag_changed !== false
) {
  fail("AG75B quality review mismatch.");
}

if (
  quality.status !==
    "ag75b_panchang_nakshatra_integration_validation_passed" ||
  quality.governed_repository_baseline !== governedBaseline ||
  quality.candidate_contract_sha256 !== candidateSha ||
  quality.source_count !== 18 ||
  quality.target_count !== 11 ||
  quality.next_stage !== "AG75C" ||
  Object.values(quality.checks || {}).some(
    (value) => value !== true
  )
) {
  fail("AG75B validation record mismatch.");
}

const ag75aBoundary = readJson(
  "data/content-intelligence/mutation-plans/" +
  "ag75a-to-ag75b-star-reflection-panchang-nakshatra-boundary.json"
);
if (
  ag75aBoundary.status !== "ag75a_to_ag75b_boundary_locked" ||
  ag75aBoundary.mutation_class !==
    "repository_governance_records_only_no_public_or_live_mutation"
) {
  fail("AG75A handoff boundary changed.");
}

const sup02 = readJson(
  "data/content-intelligence/quality-registry/" +
  "sup02-runtime-formal-closure-record.json"
);
if (
  sup02.formal_closure?.status !== "closed" ||
  sup02.runtime_transition?.runtime_release_id !==
    "sup01_panchang_runtime_v1" ||
  sup02.runtime_transition?.release_id !==
    "ag74p_final_2026_06_24" ||
  sup02.runtime_transition?.public_ui_cutover_active_after !== true ||
  sup02.runtime_transition?.input_persistence_enabled_after !== false
) {
  fail("SUP02 runtime closure boundary mismatch.");
}

const packageJson = readJson("package.json");
if (
  packageJson.scripts?.["validate:ag75b"] !==
    "node scripts/validate-ag75b-star-reflection-panchang-nakshatra-integration-contract.mjs" ||
  !packageJson.scripts?.["validate:project"]?.includes(
    "npm run validate:ag75b"
  )
) {
  fail("package.json AG75B registration missing.");
}

const documentation = read(paths.documentation);
for (const required of [
  governedBaseline,
  candidateSha,
  "AG75C",
  "HH:MM",
  "exact_transition_minute_ambiguous",
  "exact_outside_single_transition_window",
  "No unresolved state may be converted into a fabricated Panchang",
]) {
  if (!documentation.includes(required)) {
    fail(`Documentation missing required text: ${required}`);
  }
}

const governedFiles = [
  ...Object.values(paths),
  "scripts/validate-ag75b-star-reflection-panchang-nakshatra-integration-contract.mjs",
];
const governedText = governedFiles.map(read).join("\n");

const credentialPatterns = [
  new RegExp(
    [
      "eyJ",
      "[A-Za-z0-9_-]+",
      "\\.",
      "[A-Za-z0-9_-]+",
      "\\.",
      "[A-Za-z0-9_-]+",
    ].join("")
  ),
  new RegExp(["sb", "_secret_", "[A-Za-z0-9_-]+"].join("")),
  new RegExp(["postgres", "(?:ql)?", "://"].join("")),
];

if (
  credentialPatterns.some((pattern) => pattern.test(governedText))
) {
  fail("Credential-shaped material found in AG75B files.");
}

console.log("✅ AG75B Panchang and Nakshatra integration contract is valid.");
console.log("✅ All 18 immutable AG75A/AG73/AG74P/SUP02/runtime source hashes match.");
console.log("✅ Birth time remains session-only and is not sent to the Panchang runtime.");
console.log("✅ Minute-precision transition ambiguity and missing legacy transition data are handled safely.");
console.log("✅ No storage, prediction, database, deployment, runtime, UI or output-bank mutation is enabled.");
console.log("✅ AG75C is ready for the governed expanded-output-bank stage.");
