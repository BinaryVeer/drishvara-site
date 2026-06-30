import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (value) => path.join(root, value);
const read = (value) => fs.readFileSync(full(value), "utf8");
const readJson = (value) => JSON.parse(read(value));
const sha = (value) =>
  crypto
    .createHash("sha256")
    .update(fs.readFileSync(full(value)))
    .digest("hex");
const fail = (message) => {
  console.error(`❌ SUP02 formal-closure validation failed: ${message}`);
  process.exit(1);
};

const evidenceSha = "6c2bf09fb7c84cbc4cd1b07b1eb5bc140c81d54a9c0b1d0e379b9e7d6f253cfc";
const governedBaseline = "26d90247c0d57fc36c8afec5187474c5ae572c9e";

const closurePath =
  "data/content-intelligence/quality-registry/" +
  "sup02-runtime-formal-closure-record.json";
const validationPath =
  "data/quality/sup02-runtime-formal-closure-validation.json";
const documentationPath =
  "docs/quality/SUP02_PANCHANG_RUNTIME_FORMAL_CLOSURE.md";

const closure = readJson(closurePath);
const validation = readJson(validationPath);

if (
  closure.stage !== "SUP02" ||
  closure.status !==
    "sup02_public_runtime_activation_verified_and_formally_closed" ||
  closure.governed_repository_baseline !== governedBaseline ||
  closure.formal_closure?.status !== "closed" ||
  closure.formal_closure?.next_stage !== "AG75A" ||
  closure.formal_closure?.supabase_functional_sequence_complete !==
    true ||
  closure.formal_closure?.supabase_functional_stage_count !== 2
) {
  fail("Formal closure identity or AG75A handoff mismatch.");
}

if (
  closure.activation_evidence?.evidence_sha256 !== evidenceSha ||
  closure.activation_evidence?.final_status !==
    "SUP02_FINAL_PUBLIC_RUNTIME_ACTIVATION_VERIFIED" ||
  closure.activation_evidence?.operation_boundary !==
    "activation_only_no_deploy_no_repo_mutation_no_auto_rollback"
) {
  fail("Activation evidence boundary mismatch.");
}

const runtime = closure.runtime_transition;
if (
  runtime?.runtime_release_id !== "sup01_panchang_runtime_v1" ||
  runtime?.release_id !== "ag74p_final_2026_06_24" ||
  runtime?.status_before !== "active" ||
  runtime?.status_after !== "active" ||
  runtime?.active_runtime_rows_before !== 1 ||
  runtime?.active_runtime_rows_after !== 1 ||
  runtime?.public_ui_cutover_active_before !== false ||
  runtime?.public_ui_cutover_active_after !== true ||
  runtime?.input_persistence_enabled_before !== false ||
  runtime?.input_persistence_enabled_after !== false ||
  runtime?.anonymous_public_ui_cutover_active_after !== true ||
  runtime?.anonymous_input_persistence_enabled_after !== false
) {
  fail("Closed runtime transition mismatch.");
}

const verification = closure.public_verification;
if (
  verification?.status !==
    "sup02_active_function_verification_passed" ||
  verification?.passed_cases !== 12 ||
  verification?.total_cases !== 12 ||
  verification?.failed_cases !== 0 ||
  verification?.authentication_headers_sent !== false ||
  verification?.cors_http_status !== 200 ||
  verification?.cors_access_control_allow_origin !== "*" ||
  verification?.varanasi_and_banaras_available !== true ||
  verification?.named_places_and_worldwide_coordinates_governed !==
    true ||
  verification?.four_page_varanasi_annual_book_preserved !== true
) {
  fail("Public runtime verification mismatch.");
}

if (
  Object.values(closure.activation_non_actions || {}).some(
    (value) => value !== false
  )
) {
  fail("Activation non-action boundary mismatch.");
}

if (
  closure.governance_boundary?.runtime_is_primary_public_calculation_path !==
    true ||
  closure.governance_boundary?.public_inputs_are_not_persisted !== true ||
  closure.governance_boundary?.repository_json_role !==
    "audited_snapshots_fixtures_and_recovery_exports_only" ||
  closure.governance_boundary?.no_additional_panchang_patch_stage !== true ||
  closure.governance_boundary?.next_work_must_not_reactivate_sup01_or_sup02 !==
    true
) {
  fail("Post-SUP02 governance boundary mismatch.");
}

for (const [relative, expected] of Object.entries(
  closure.immutable_repository_hashes || {}
)) {
  if (!fs.existsSync(full(relative))) {
    fail(`Immutable governed file is missing: ${relative}`);
  }
  if (sha(relative) !== expected) {
    fail(`Immutable governed file changed: ${relative}`);
  }
}

if (
  validation.status !==
    "sup02_public_runtime_formal_closure_validation_passed" ||
  validation.governed_repository_baseline !== governedBaseline ||
  validation.activation_evidence_sha256 !== evidenceSha ||
  validation.next_stage !== "AG75A" ||
  Object.values(validation.checks || {}).some(
    (value) => value !== true
  )
) {
  fail("Formal closure validation record mismatch.");
}

const sup01Closure = readJson(
  "data/content-intelligence/quality-registry/" +
  "sup01-runtime-formal-closure-record.json"
);
if (
  sup01Closure.formal_closure?.status !== "closed" ||
  sup01Closure.formal_closure?.next_stage !== "SUP02"
) {
  fail("Historical SUP01 closure handoff is not preserved.");
}

const packageJson = readJson("package.json");
if (
  packageJson.scripts?.["validate:sup02:closure"] !==
    "node scripts/validate-sup02-formal-closure.mjs" ||
  !packageJson.scripts?.["validate:project"]?.includes(
    "npm run validate:sup02:closure"
  )
) {
  fail("package.json SUP02 closure registration missing.");
}

const documentation = read(documentationPath);
if (
  !documentation.includes(evidenceSha) ||
  !documentation.includes(governedBaseline) ||
  !documentation.includes("AG75A") ||
  !documentation.includes("12/12")
) {
  fail("Formal closure documentation is incomplete.");
}

const governedFiles = [
  closurePath,
  validationPath,
  documentationPath,
  "scripts/validate-sup02-formal-closure.mjs",
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
  fail("Credential-shaped material found in SUP02 closure files.");
}

console.log("✅ SUP02 public runtime activation is formally closed.");
console.log("✅ Runtime cutover is active with one active release and zero input persistence.");
console.log("✅ Anonymous function verification passed 12/12 with browser CORS.");
console.log("✅ Historical SUP01 and SUP02 governance records remain immutable.");
console.log("✅ AG75A is the next controlled stage.");
