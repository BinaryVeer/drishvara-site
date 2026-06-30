import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (value) => path.join(root, value);
const exists = (value) => fs.existsSync(full(value));
const read = (value) => fs.readFileSync(full(value), "utf8");
const readJson = (value) => JSON.parse(read(value));
const sha256 = (value) =>
  crypto.createHash("sha256").update(fs.readFileSync(full(value))).digest("hex");

const fail = (message) => {
  console.error(`AG75C validation failed: ${message}`);
  process.exit(1);
};

const governedBaseline = "b1f5b8534446d2acc0caf70c4ed07fa296814f1a";
const candidateSha = "29386a5e0ff312e1a4074669ba536dd1d89982af34b0c4dce3b92ab6c009962e";

const paths = {
  bank: "data/methodology/star-reflection/ag75c-expanded-star-reflection-output-bank.json",
  schema: "data/methodology/star-reflection/ag75c-expanded-star-reflection-output-bank-schema.json",
  matrix: "data/methodology/star-reflection/ag75c-star-reflection-resolution-state-output-matrix.json",
  report: "data/methodology/star-reflection/ag75c-expanded-star-reflection-output-bank-validation-report.json",
  audit: "data/methodology/star-reflection/ag75c-no-storage-no-runtime-no-public-wiring-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag75c-ag75d-star-reflection-public-wiring-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag75c-to-ag75d-star-reflection-public-wiring-boundary.json",
  review: "data/content-intelligence/quality-reviews/ag75c-expanded-star-reflection-output-bank.json",
  quality: "data/quality/ag75c-expanded-star-reflection-output-bank.json",
  documentation: "docs/quality/AG75C_EXPANDED_STAR_REFLECTION_OUTPUT_BANK.md",
};

for (const value of Object.values(paths)) {
  if (!exists(value)) fail(`Missing required AG75C file: ${value}`);
}

const bank = readJson(paths.bank);
const schema = readJson(paths.schema);
const matrix = readJson(paths.matrix);
const report = readJson(paths.report);
const audit = readJson(paths.audit);
const readiness = readJson(paths.readiness);
const boundary = readJson(paths.boundary);
const review = readJson(paths.review);
const quality = readJson(paths.quality);

if (
  bank.module_id !== "AG75C" ||
  bank.status !== "ag75c_expanded_star_reflection_output_bank_created" ||
  bank.governed_repository_baseline !== governedBaseline ||
  bank.candidate_plan?.sha256 !== candidateSha ||
  bank.source_count !== 20 ||
  bank.record_count !== 39 ||
  bank.exact_window_record_count !== 27 ||
  bank.non_exact_record_count !== 12 ||
  bank.next_step?.module_id !== "AG75D" ||
  bank.public_rendering_enabled !== false ||
  bank.live_runtime_called_during_generation !== false ||
  bank.personal_input_embedded !== false
) fail("Bank identity, counts, handoff, or non-mutation boundary mismatch.");

const sourceRegister = bank.immutable_source_register || [];
if (sourceRegister.length !== 20) fail("Immutable source register must contain 20 files.");
const seenSources = new Set();
for (const item of sourceRegister) {
  if (seenSources.has(item.path)) fail(`Duplicate immutable source: ${item.path}`);
  seenSources.add(item.path);
  if (!exists(item.path)) fail(`Immutable source missing: ${item.path}`);
  if (sha256(item.path) !== item.sha256) fail(`Immutable source changed: ${item.path}`);
}

const requiredStates = [
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
];
if (JSON.stringify(bank.required_resolution_states) !== JSON.stringify(requiredStates)) {
  fail("Resolution-state coverage or order mismatch.");
}

const records = bank.records || [];
const ids = records.map((record) => record.record_id);
if (records.length !== 39 || new Set(ids).size !== 39) fail("Record IDs are not 39 unique values.");

const exact = records.filter((record) => record.resolution_state === "exact_window_resolved");
const nonExact = records.filter((record) => record.resolution_state !== "exact_window_resolved");
if (exact.length !== 27 || nonExact.length !== 12) fail("Exact/non-exact counts mismatch.");

const governedMap = readJson(
  "data/methodology/star-reflection/ag75b-star-reflection-basis-resolution-and-degradation-policy.json"
).nakshatra_index_map;

for (let index = 0; index < exact.length; index += 1) {
  const record = exact[index];
  const governed = governedMap[index];
  if (
    record.record_kind !== "exact_nakshatra_reflection" ||
    record.nakshatra_index !== index + 1 ||
    record.nakshatra_name !== governed?.name ||
    record.safety_flags?.exact_birth_nakshatra_claim_allowed !== true ||
    record.safety_flags?.ag75b_exact_window_proof_required !== true
  ) fail(`Exact record mismatch at index ${index + 1}.`);
}

const expectedNonExact = requiredStates.slice(1);
if (
  JSON.stringify(nonExact.map((record) => record.resolution_state)) !==
  JSON.stringify(expectedNonExact)
) fail("Non-exact state coverage or order mismatch.");

for (const record of nonExact) {
  if (
    record.record_kind !== "context_or_limitation" ||
    record.nakshatra_index !== null ||
    record.nakshatra_name !== null ||
    record.safety_flags?.exact_birth_nakshatra_claim_allowed !== false
  ) fail(`Non-exact identity boundary mismatch: ${record.record_id}`);
}

const requiredSections = ["basis", "theme", "self_inquiry", "practice", "limits"];
const allowedSlots = [
  "panchang_source",
  "release_id",
  "runtime_release_id",
  "civil_date",
  "location_label",
  "timezone",
  "nakshatra_index",
  "nakshatra_name",
  "resolution_status",
  "limitation_code",
];

for (const record of records) {
  if (
    typeof record.basis_label !== "string" ||
    typeof record.reflective_theme !== "string" ||
    typeof record.self_inquiry_prompt !== "string" ||
    typeof record.grounding_practice !== "string" ||
    typeof record.limitation_notice !== "string" ||
    !requiredSections.every(
      (section) =>
        typeof record.sections?.[section] === "string" &&
        record.sections[section].trim().length > 0
    ) ||
    JSON.stringify(record.runtime_metadata_slots) !== JSON.stringify(allowedSlots) ||
    record.safety_flags?.reflective !== true ||
    record.safety_flags?.symbolic !== true ||
    record.safety_flags?.non_deterministic !== true ||
    record.safety_flags?.non_fatalistic !== true ||
    record.safety_flags?.limitation_present !== true ||
    record.safety_flags?.personal_data_absent !== true ||
    record.safety_flags?.professional_advice_absent !== true
  ) fail(`Required output or safety field missing: ${record.record_id}`);
}

const blockedPatterns = [
  /\byou will definitely\b/i,
  /\byou are destined\b/i,
  /\byour future is\b/i,
  /\bthis proves that you are\b/i,
  /\byou must make this decision\b/i,
  /\bguaranteed (?:event|outcome|result)\b/i,
  /\bconfirms your (?:health|wealth|relationship) outcome\b/i,
];

const recordText = records.map((record) => [
  record.basis_label,
  record.reflective_theme,
  record.self_inquiry_prompt,
  record.grounding_practice,
  record.limitation_notice,
].join("\n")).join("\n");

if (blockedPatterns.some((pattern) => pattern.test(recordText))) {
  fail("Blocked deterministic or certainty language found.");
}

if (
  schema.status !== "ag75c_output_bank_schema_locked" ||
  schema.record_types?.exact_nakshatra_reflection?.required_count !== 27 ||
  schema.record_types?.context_or_limitation?.required_count !== 12 ||
  schema.public_rendering_enabled !== false
) fail("Output-bank schema mismatch.");

if (
  matrix.status !== "ag75c_resolution_state_output_matrix_created" ||
  matrix.required_state_count !== 13 ||
  matrix.matrix?.length !== 13 ||
  matrix.matrix?.reduce((sum, row) => sum + row.record_count, 0) !== 39
) fail("Resolution-state matrix mismatch.");

if (
  report.status !== "ag75c_output_bank_validation_passed" ||
  report.record_count !== 39 ||
  report.exact_window_record_count !== 27 ||
  report.non_exact_record_count !== 12 ||
  report.resolution_state_count !== 13 ||
  report.issue_count !== 0 ||
  Object.values(report.checks || {}).some((value) => value !== true)
) fail("Output-bank validation report mismatch.");

if (
  audit.status !== "ag75c_no_storage_no_runtime_no_public_wiring_audit_passed" ||
  Object.values(audit.checks || {}).some((value) => value !== false)
) fail("No-storage, runtime, or public-wiring audit mismatch.");

if (
  readiness.status !== "ready_for_ag75d_star_reflection_public_ui_and_runtime_wiring" ||
  readiness.record_count !== 39 ||
  readiness.exact_window_record_count !== 27 ||
  readiness.non_exact_record_count !== 12 ||
  readiness.resolution_state_count !== 13 ||
  readiness.hard_blockers?.length !== 0 ||
  readiness.next_stage !== "AG75D"
) fail("AG75D readiness mismatch.");

if (
  boundary.from_module !== "AG75C" ||
  boundary.to_module !== "AG75D" ||
  boundary.status !== "ag75c_to_ag75d_boundary_locked" ||
  boundary.mutation_class !==
    "controlled_public_ui_and_browser_runtime_wiring_no_backend_or_persistence_mutation"
) fail("AG75C-to-AG75D boundary mismatch.");

if (
  review.status !== "ag75c_completed" ||
  review.summary?.source_records_verified !== 20 ||
  review.summary?.output_record_count !== 39 ||
  review.summary?.ready_for_ag75d !== true ||
  review.summary?.public_ui_changed !== false ||
  review.summary?.public_javascript_changed !== false ||
  review.summary?.live_runtime_called !== false ||
  review.summary?.database_changed !== false ||
  review.summary?.edge_function_changed !== false ||
  review.summary?.runtime_flag_changed !== false ||
  review.summary?.personal_input_embedded !== false
) fail("AG75C quality review mismatch.");

if (
  quality.status !== "ag75c_expanded_star_reflection_output_bank_validation_passed" ||
  quality.governed_repository_baseline !== governedBaseline ||
  quality.candidate_plan_sha256 !== candidateSha ||
  quality.source_count !== 20 ||
  quality.target_count !== 11 ||
  quality.record_count !== 39 ||
  quality.next_stage !== "AG75D" ||
  Object.values(quality.checks || {}).some((value) => value !== true)
) fail("AG75C validation record mismatch.");

const ag75bBoundary = readJson(
  "data/content-intelligence/mutation-plans/ag75b-to-ag75c-star-reflection-expanded-output-bank-boundary.json"
);
if (
  ag75bBoundary.status !== "ag75b_to_ag75c_boundary_locked" ||
  ag75bBoundary.mutation_class !==
    "repository_output_bank_records_only_no_public_or_live_mutation"
) fail("AG75B handoff boundary changed.");

const packageJson = readJson("package.json");
if (
  packageJson.scripts?.["validate:ag75c"] !==
    "node scripts/validate-ag75c-expanded-star-reflection-output-bank.mjs" ||
  !packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag75c")
) fail("package.json AG75C registration missing.");

const documentation = read(paths.documentation);
for (const required of [
  governedBaseline,
  candidateSha,
  "39-record",
  "27 exact-window",
  "12 contextual",
  "AG75D",
  "No unresolved state is converted into a fabricated Panchang value",
]) {
  if (!documentation.includes(required)) fail(`Documentation missing: ${required}`);
}

const governedFiles = [
  ...Object.values(paths),
  "scripts/validate-ag75c-expanded-star-reflection-output-bank.mjs",
];
const governedText = governedFiles.map(read).join("\n");
const credentialPatterns = [
  new RegExp(["eyJ", "[A-Za-z0-9_-]+", "\\.", "[A-Za-z0-9_-]+", "\\.", "[A-Za-z0-9_-]+"].join("")),
  new RegExp(["sb", "_secret_", "[A-Za-z0-9_-]+"].join("")),
  new RegExp(["postgres", "(?:ql)?", "://"].join("")),
];
if (credentialPatterns.some((pattern) => pattern.test(governedText))) {
  fail("Credential-shaped material found in AG75C files.");
}

console.log("AG75C expanded Star Reflection output bank is valid.");
console.log("All 20 immutable AG75B/AG75A/AG72C/AG73C/AG73E source hashes match.");
console.log("The bank contains 27 exact-window and 12 non-exact records across all 13 states.");
console.log("Exact birth-Nakshatra language is confined to AG75B-proven exact-window records.");
console.log("No storage, runtime, database, deployment, public UI, or browser wiring mutation is enabled.");
console.log("AG75D is ready for controlled public UI and runtime wiring.");
