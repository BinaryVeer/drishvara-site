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
  console.error(`❌ AG75A validation failed: ${message}`);
  process.exit(1);
};

const governedBaseline = "01aca0107d8f84bafb5f4532aec164a9e1e599de";
const candidateSha = "88a8bc3fdcc068e2e06b7cf2bf71f0faf3782dc8f14a86cef415481eb4af39d1";

const paths = {
  scope:
    "data/methodology/star-reflection/" +
    "ag75a-star-reflection-expansion-scope-and-method-integration.json",
  dependency:
    "data/methodology/star-reflection/" +
    "ag75a-star-reflection-dependency-consumption-map.json",
  safety:
    "data/methodology/star-reflection/" +
    "ag75a-star-reflection-safety-and-non-prediction-boundary.json",
  readiness:
    "data/content-intelligence/quality-registry/" +
    "ag75a-ag75b-star-reflection-panchang-nakshatra-readiness-record.json",
  boundary:
    "data/content-intelligence/mutation-plans/" +
    "ag75a-to-ag75b-star-reflection-panchang-nakshatra-boundary.json",
  review:
    "data/content-intelligence/quality-reviews/" +
    "ag75a-star-reflection-scope-and-method-integration.json",
  quality:
    "data/quality/" +
    "ag75a-star-reflection-scope-and-method-integration.json",
  documentation:
    "docs/quality/" +
    "AG75A_STAR_REFLECTION_SCOPE_AND_METHOD_INTEGRATION.md",
};

for (const value of Object.values(paths)) {
  if (!exists(value)) {
    fail(`Missing required AG75A file: ${value}`);
  }
}

const scope = readJson(paths.scope);
const dependency = readJson(paths.dependency);
const safety = readJson(paths.safety);
const readiness = readJson(paths.readiness);
const boundary = readJson(paths.boundary);
const review = readJson(paths.review);
const quality = readJson(paths.quality);

if (
  scope.module_id !== "AG75A" ||
  scope.status !==
    "ag75a_star_reflection_scope_and_method_integration_locked" ||
  scope.governed_repository_baseline !== governedBaseline ||
  scope.candidate_plan?.sha256 !== candidateSha ||
  scope.source_count !== 32 ||
  scope.next_step?.module_id !== "AG75B"
) {
  fail("Scope identity, source count or AG75B handoff mismatch.");
}

if (
  scope.method_integration?.primary_orientation !==
    "Moon-led and Nakshatra-oriented reflection" ||
  scope.method_integration?.supporting_context !==
    "Panchanga-supported, location-aware and timezone-aware" ||
  JSON.stringify(scope.method_integration?.birth_time_modes) !==
    JSON.stringify([
      "exact_session_only",
      "unknown",
      "pending_or_invalid",
    ]) ||
  scope.method_integration?.output_nature !==
    "reflective_non_deterministic_symbolic_guidance"
) {
  fail("Integrated Star Reflection method mismatch.");
}

const sourceRegister = scope.immutable_source_register || [];
if (sourceRegister.length !== 32) {
  fail("Immutable source register must contain exactly 32 files.");
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

const manifest = readJson(
  "data/methodology/star-reflection/" +
  "star-reflection-method-manifest.json"
);
if (
  manifest.current_status !==
    "ag73e_star_reflection_active_result_qa_closed"
) {
  fail("Governed AG73E Star Reflection manifest state changed.");
}

const sup02 = readJson(
  "data/content-intelligence/quality-registry/" +
  "sup02-runtime-formal-closure-record.json"
);
if (
  sup02.formal_closure?.status !== "closed" ||
  sup02.formal_closure?.next_stage !== "AG75A" ||
  sup02.runtime_transition?.runtime_release_id !==
    "sup01_panchang_runtime_v1" ||
  sup02.runtime_transition?.release_id !==
    "ag74p_final_2026_06_24" ||
  sup02.runtime_transition?.public_ui_cutover_active_after !== true ||
  sup02.runtime_transition?.input_persistence_enabled_after !== false
) {
  fail("SUP02 runtime closure boundary mismatch.");
}

if (
  dependency.status !==
    "ag75a_dependency_consumption_map_created" ||
  dependency.dependency_layers?.panchang_runtime
    ?.ag75a_consumption_mode !==
    "contract_reference_only_no_runtime_invocation" ||
  dependency.ag75a_non_actions?.runtime_called !== false ||
  dependency.ag75a_non_actions?.database_mutated !== false ||
  dependency.ag75a_non_actions?.edge_function_deployed !== false ||
  dependency.ag75a_non_actions?.runtime_flag_changed !== false ||
  dependency.ag75a_non_actions?.public_ui_modified !== false ||
  dependency.ag75a_non_actions?.personal_input_persisted !== false ||
  dependency.next_stage !== "AG75B"
) {
  fail("Dependency-consumption or no-action boundary mismatch.");
}

if (
  safety.status !==
    "ag75a_star_reflection_safety_and_non_prediction_boundary_locked" ||
  Object.values(safety.prohibited_capabilities || {}).some(
    (value) => value !== false
  ) ||
  !Object.values(safety.privacy_boundary || {}).every(
    (value) => value === "session_only_not_stored"
  )
) {
  fail("Safety, non-prediction or privacy boundary mismatch.");
}

if (
  readiness.status !==
    "ready_for_ag75b_star_reflection_panchang_nakshatra_integration_contract" ||
  readiness.hard_blockers?.length !== 0 ||
  readiness.source_count !== 32 ||
  readiness.next_stage !== "AG75B"
) {
  fail("AG75B readiness mismatch.");
}

if (
  boundary.from_module !== "AG75A" ||
  boundary.to_module !== "AG75B" ||
  boundary.status !== "ag75a_to_ag75b_boundary_locked" ||
  boundary.mutation_class !==
    "repository_governance_records_only_no_public_or_live_mutation"
) {
  fail("AG75A-to-AG75B mutation boundary mismatch.");
}

if (
  review.status !== "ag75a_completed" ||
  review.summary?.source_records_verified !== 32 ||
  review.summary?.ready_for_ag75b !== true ||
  review.summary?.public_ui_changed !== false ||
  review.summary?.database_changed !== false ||
  review.summary?.edge_function_changed !== false ||
  review.summary?.runtime_flag_changed !== false ||
  review.summary?.personal_input_persistence_enabled !== false
) {
  fail("AG75A quality review mismatch.");
}

if (
  quality.status !==
    "ag75a_star_reflection_scope_and_method_integration_validation_passed" ||
  quality.governed_repository_baseline !== governedBaseline ||
  quality.candidate_plan_sha256 !== candidateSha ||
  quality.source_count !== 32 ||
  quality.target_count !== 9 ||
  quality.next_stage !== "AG75B" ||
  Object.values(quality.checks || {}).some(
    (value) => value !== true
  )
) {
  fail("AG75A validation record mismatch.");
}

const packageJson = readJson("package.json");
if (
  packageJson.scripts?.["validate:ag75a"] !==
    "node scripts/validate-ag75a-star-reflection-scope-and-method-integration.mjs" ||
  !packageJson.scripts?.["validate:project"]?.includes(
    "npm run validate:ag75a"
  )
) {
  fail("package.json AG75A registration missing.");
}

const documentation = read(paths.documentation);
for (const required of [
  governedBaseline,
  candidateSha,
  "AG75B",
  "Moon-led",
  "sup01_panchang_runtime_v1",
  "No Panchang or Nakshatra value may be fabricated",
]) {
  if (!documentation.includes(required)) {
    fail(`Documentation missing required text: ${required}`);
  }
}

const governedFiles = [
  ...Object.values(paths),
  "scripts/validate-ag75a-star-reflection-scope-and-method-integration.mjs",
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
  fail("Credential-shaped material found in AG75A files.");
}

console.log("✅ AG75A Star Reflection scope and method integration is valid.");
console.log("✅ All 32 immutable AG72/AG73/AG74P/SUP02 source hashes match.");
console.log("✅ Moon-led, Nakshatra-oriented and Panchanga-supported method is preserved.");
console.log("✅ No prediction, storage, database, deployment, runtime or UI mutation is enabled.");
console.log("✅ AG75B is ready for its governed integration-contract stage.");
