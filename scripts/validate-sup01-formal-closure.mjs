import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (value) => path.join(root, value);
const readJson = (value) => JSON.parse(fs.readFileSync(full(value), "utf8"));
const fail = (message) => {
  console.error(`❌ SUP01 formal-closure validation failed: ${message}`);
  process.exit(1);
};
const sha = (value) =>
  crypto.createHash("sha256").update(fs.readFileSync(full(value))).digest("hex");

const evidenceSha = "8c1d633553f073c56d013b43474f16f201e248574b0f7be6871694791f9917de";
const foundationCommit = "624f55a5193ee32811ef563154872334bf570bb8";

const closure = readJson(
  "data/content-intelligence/quality-registry/sup01-runtime-formal-closure-record.json"
);
if (
  closure.status !== "sup01_live_execution_evidence_verified_and_formally_closed" ||
  closure.formal_closure?.status !== "closed" ||
  closure.foundation_commit !== foundationCommit ||
  closure.execution_evidence?.evidence_sha256 !== evidenceSha
) {
  fail("Formal closure record mismatch.");
}
if (
  closure.runtime?.runtime_release_status !== "active" ||
  closure.runtime?.edge_function !== "calculate-panchang" ||
  closure.runtime?.edge_function_version !== 4 ||
  closure.runtime?.public_ui_cutover_active !== false ||
  closure.runtime?.input_persistence_enabled !== false
) {
  fail("Closed runtime state mismatch.");
}

const boundary = readJson(
  "data/content-intelligence/mutation-plans/sup01-single-stage-execution-boundary.json"
);
if (
  boundary.status !== "sup01_live_execution_evidence_verified_and_formally_closed" ||
  boundary.live_execution_completed !== true ||
  boundary.runtime_release_active !== true ||
  boundary.public_ui_cutover_active !== false ||
  boundary.next_controlled_action?.startsWith("SUP02") !== true
) {
  fail("Execution boundary is not formally closed into SUP02.");
}

const readiness = readJson(
  "data/content-intelligence/quality-registry/sup01-runtime-readiness-record.json"
);
if (
  readiness.runtime?.status !== "active" ||
  readiness.runtime?.edge_function_version !== 4 ||
  readiness.runtime?.normalized_runtime_counts?.aliases !== 20 ||
  readiness.runtime?.normalized_runtime_counts?.calculation_policies !== 6 ||
  readiness.runtime?.normalized_runtime_counts?.festival_rules !== 7 ||
  readiness.runtime?.normalized_runtime_counts?.runtime_releases !== 1 ||
  readiness.formal_closure?.status !== "closed"
) {
  fail("Runtime readiness closure state mismatch.");
}

const review = readJson(
  "data/content-intelligence/quality-reviews/sup01-readiness-review.json"
);
if (
  review.findings?.excess_privileges_remediated !== true ||
  review.findings?.current_anon_authenticated_table_privileges?.join(",") !== "SELECT" ||
  review.findings?.public_ui_cutover_active !== false ||
  review.formal_closure_status !== "closed"
) {
  fail("Execution review mismatch.");
}

const parity = readJson("data/quality/sup01-runtime-parity-matrix.json");
if (
  parity.status !== "sup01_live_runtime_parity_passed_and_closed" ||
  parity.executed_results?.anonymous_invocation_before_activation?.passed !== 12 ||
  parity.executed_results?.anonymous_invocation_before_activation?.total !== 12 ||
  parity.executed_results?.local_to_live_parity?.passed !== 24 ||
  parity.executed_results?.local_to_live_parity?.total !== 24 ||
  parity.executed_results?.local_to_live_parity?.failed !== 0 ||
  parity.executed_results?.anonymous_invocation_after_activation?.passed !== 12 ||
  parity.executed_results?.anonymous_invocation_after_activation?.total !== 12 ||
  parity.evidence_sha256 !== evidenceSha
) {
  fail("Live parity record mismatch.");
}

const validation = readJson("data/quality/sup01-runtime-validation.json");
if (
  validation.status !== "sup01_live_execution_validation_passed_and_formally_closed" ||
  validation.foundation_commit !== foundationCommit ||
  validation.live_execution_evidence_sha256 !== evidenceSha ||
  Object.values(validation.checks || {}).some((value) => value !== true) ||
  validation.next_stage !== "SUP02"
) {
  fail("Live validation record mismatch.");
}

const ag74pHashes = {
  "index.html": "a88abb450a2e428041f277baa23f83e8e956a93f61d58c80c0239407b39e18e2",
  "assets/js/ag74o-panchang-public-controller.js": "1b7ad9360a9081da22e5d80daf4ffc954629742196773fd599514731b95b3f44",
  "data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json": "c907a82b2577e28acdedc6d173bc3bc1476a2a6e9203787c9bab49c94354ad93",
  "data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json": "4da533d3a887dc4d58a3fe1950a9fa71486621169612045d192851814c8b1a40",
  "data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json": "0b4f3a3c9a2680eafc117d1fd2e37a5ceace895b0e3a5608801903bb74d25ab5"
};
for (const [relative, expected] of Object.entries(ag74pHashes)) {
  if (sha(relative) !== expected) fail(`AG74P public asset changed: ${relative}`);
}

const packageJson = readJson("package.json");
if (
  packageJson.scripts?.["validate:sup01:closure"] !==
    "node scripts/validate-sup01-formal-closure.mjs" ||
  !packageJson.scripts?.["validate:project"]?.includes(
    "npm run validate:sup01:closure"
  )
) {
  fail("package.json closure-validation registration missing.");
}

for (const doc of [
  "docs/quality/SUP01_PANCHANG_RUNTIME_READINESS.md",
  "docs/quality/SUP01_PANCHANG_RUNTIME_FORMAL_CLOSURE.md"
]) {
  const content = fs.readFileSync(full(doc), "utf8");
  if (!content.includes(evidenceSha) || !content.includes("SUP02")) {
    fail(`Closure evidence or SUP02 boundary missing from ${doc}`);
  }
}

const governedFiles = [
  "data/content-intelligence/mutation-plans/sup01-single-stage-execution-boundary.json",
  "data/content-intelligence/quality-registry/sup01-runtime-readiness-record.json",
  "data/content-intelligence/quality-registry/sup01-runtime-formal-closure-record.json",
  "data/content-intelligence/quality-reviews/sup01-readiness-review.json",
  "data/quality/sup01-runtime-parity-matrix.json",
  "data/quality/sup01-runtime-validation.json",
  "docs/quality/SUP01_PANCHANG_RUNTIME_READINESS.md",
  "docs/quality/SUP01_PANCHANG_RUNTIME_FORMAL_CLOSURE.md",
  "scripts/validate-sup01-formal-closure.mjs"
];
const governedText = governedFiles
  .map((relative) => fs.readFileSync(full(relative), "utf8"))
  .join("\n");

const credentialPatterns = [
  new RegExp([
    "eyJ",
    "[A-Za-z0-9_-]+",
    "\\.",
    "[A-Za-z0-9_-]+",
    "\\.",
    "[A-Za-z0-9_-]+"
  ].join("")),
  new RegExp(["sb", "_secret_", "[A-Za-z0-9_-]+"].join("")),
  new RegExp(["postgres", "(?:ql)?", "://"].join(""))
];

if (credentialPatterns.some((pattern) => pattern.test(governedText))) {
  fail("Credential-shaped material found in SUP01 closure files.");
}

console.log("✅ SUP01 formal closure is valid.");
console.log("✅ Live migration, 20/6/7/1 runtime data, active function version 4 and 24/24 parity are recorded.");
console.log("✅ Pre/post activation anonymous invocation passed 12/12 and final readbacks are closed.");
console.log("✅ Public UI cutover remains false; SUP02 is the next governed stage.");
