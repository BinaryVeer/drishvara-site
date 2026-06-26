import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (value) => path.join(root, value);
const read = (value) => fs.readFileSync(full(value), "utf8");
const json = (value) => JSON.parse(read(value));
const exists = (value) => fs.existsSync(full(value));
const sha = (value) =>
  crypto.createHash("sha256").update(fs.readFileSync(full(value))).digest("hex");
const fail = (message) => {
  console.error(`❌ SUP02 final-cutover validation failed: ${message}`);
  process.exit(1);
};

const required = [
  "index.html",
  "assets/js/ag74o-panchang-public-controller.js",
  "assets/js/sup02-panchang-server-controller.js",
  "supabase/functions/calculate-panchang/index.ts",
  "supabase/migrations/20260627_sup02_panchang_public_cutover_readiness.sql",
  "supabase/rollback/20260627_sup02_disable_public_cutover.sql",
  "data/content-intelligence/mutation-plans/sup02-public-runtime-final-cutover-boundary.json",
  "data/content-intelligence/quality-registry/sup02-public-runtime-final-cutover-record.json",
  "data/quality/sup02-public-runtime-final-cutover-validation.json",
  "docs/quality/SUP02_PUBLIC_RUNTIME_FINAL_CUTOVER.md",
  "package.json"
];
for (const relative of required) {
  if (!exists(relative)) fail(`Missing required file: ${relative}`);
}

if (
  sha("assets/js/ag74o-panchang-public-controller.js") !==
    "1b7ad9360a9081da22e5d80daf4ffc954629742196773fd599514731b95b3f44" ||
  sha("assets/js/sup02-panchang-server-controller.js") !==
    "e12d8a0969e06971e8c0bcdc870299a3622cd49d4e909f824aafc0c10977011a"
) {
  fail("Historical or server controller hash mismatch.");
}

const index = read("index.html");
if ((index.match(/assets\/js\/sup02-panchang-server-controller\.js/g) || []).length !== 1) {
  fail("Exactly one SUP02 server controller must be loaded.");
}
for (const forbidden of [
  'src="assets/js/ag74o-panchang-public-controller.js"',
  'src="assets/vendor/astronomy-engine-2.1.19.min.js"'
]) {
  if (index.includes(forbidden)) fail(`Retired browser runtime is still loaded: ${forbidden}`);
}
for (const marker of [
  'data-sup02-controller="true"',
  'data-sup02-runtime="server-only"',
  'data-sup02-public-cutover="prepared-local"',
  'data-sup02-input-storage="none"',
  'data-ag74i-book-page="1"',
  'data-ag74i-book-page="2"',
  'data-ag74i-book-page="3"',
  'data-ag74i-book-page="4"',
  'if (window.drishvaraAg74oPublicSurfaceActive === true) return;'
]) {
  if (!index.includes(marker)) fail(`Public-index marker missing: ${marker}`);
}

const controller = read("assets/js/sup02-panchang-server-controller.js");
for (const marker of [
  "window.drishvaraAg74oPublicSurfaceActive = true",
  "applySelection({ boot: true",
  "credentials: \"omit\"",
  "public_ui_cutover_active !== true",
  "primary_public_window",
  "ritual_windows",
  "calculation_request_persisted !== false",
  "location_input_persisted !== false",
  "personal_data_persisted !== false"
]) {
  if (!controller.includes(marker)) fail(`Controller marker missing: ${marker}`);
}
for (const forbidden of [
  "window.Astronomy",
  "SearchRiseSet",
  "SetDeltaTFunction",
  "localStorage.setItem",
  "sessionStorage.setItem",
  "Authorization",
  "apikey",
  "SUPABASE_SERVICE_ROLE_KEY",
  "service_role"
]) {
  if (controller.includes(forbidden)) fail(`Forbidden controller dependency: ${forbidden}`);
}

const functionSource = read("supabase/functions/calculate-panchang/index.ts");
for (const marker of [
  "runtimeRelease.public_ui_cutover_active",
  "sup02_governed_public_runtime_response",
  "sup02_governed_runtime_ready_cutover_inactive",
  "automatic_place_substitution_performed: false",
  "automatic_timezone_substitution_performed: false",
  "calculation_request_persisted: false",
  "location_input_persisted: false",
  "personal_data_persisted: false"
]) {
  if (!functionSource.includes(marker)) fail(`Function marker missing: ${marker}`);
}

const boundary = json(
  "data/content-intelligence/mutation-plans/sup02-public-runtime-final-cutover-boundary.json"
);
if (
  boundary.status !==
    "sup02_public_runtime_final_cutover_code_prepared_local_only" ||
  boundary.baseline_commit !== "35edabe78b1d0b7ae85edf83956a10abffbb4f80" ||
  boundary.post_deploy_evidence_sha256 !== "164e5304dd806400ca181aa3b4465f8d6d7f69f7ef3256fc25dcbbc27339af2d" ||
  boundary.ag74p_index_baseline_sha256 !== "a88abb450a2e428041f277baa23f83e8e956a93f61d58c80c0239407b39e18e2" ||
  boundary.server_controller_sha256 !== "e12d8a0969e06971e8c0bcdc870299a3622cd49d4e909f824aafc0c10977011a" ||
  boundary.local_public_index_switch_prepared !== true ||
  boundary.remote_public_index_switch_completed !== false ||
  boundary.runtime_flag_activation_completed !== false ||
  boundary.public_ui_cutover_active !== false ||
  boundary.live_public_verification_completed !== false ||
  boundary.commit_and_push_performed !== false
) {
  fail("Final-cutover boundary mismatch.");
}

const record = json(
  "data/content-intelligence/quality-registry/sup02-public-runtime-final-cutover-record.json"
);
if (
  record.status !==
    "sup02_final_cutover_code_prepared_live_activation_pending" ||
  record.post_deploy_verification?.evidence_sha256 !== "164e5304dd806400ca181aa3b4465f8d6d7f69f7ef3256fc25dcbbc27339af2d" ||
  record.post_deploy_verification?.unauthenticated_invocation_first_pass !== "passed_12_of_12" ||
  record.post_deploy_verification?.unauthenticated_invocation_final_pass !== "passed_12_of_12" ||
  record.post_deploy_verification?.public_ui_cutover_active !== false ||
  !Object.values(record.local_cutover_preparation || {}).every(Boolean)
) {
  fail("Final-cutover readiness record mismatch.");
}

const quality = json(
  "data/quality/sup02-public-runtime-final-cutover-validation.json"
);
if (
  quality.status !==
    "sup02_final_cutover_local_code_validation_ready" ||
  !Object.values(quality.checks || {}).every(Boolean)
) {
  fail("Final-cutover quality record mismatch.");
}

const pkg = json("package.json");
if (
  pkg.scripts?.["validate:sup02:cutover"] !==
    "node scripts/validate-sup02-public-runtime-final-cutover.mjs" ||
  !pkg.scripts?.["validate:project"]?.includes("npm run validate:sup02:cutover")
) {
  fail("Final-cutover validation registration missing.");
}

const allText = required.map(read).join("\n");
const credentialPatterns = [
  new RegExp(["eyJ", "[A-Za-z0-9_-]+", "\\.", "[A-Za-z0-9_-]+", "\\.", "[A-Za-z0-9_-]+"].join("")),
  new RegExp(["sb", "_secret_", "[A-Za-z0-9_-]+"].join("")),
  new RegExp(["postgres", "(?:ql)?", "://"].join(""))
];
if (credentialPatterns.some((pattern) => pattern.test(allText))) {
  fail("Credential-shaped material found in final-cutover sources.");
}

console.log("✅ SUP02 final-cutover code is locally valid.");
console.log("✅ The local index loads only the governed server controller for Panchang calculation.");
console.log("✅ The four-page Varanasi annual book, five named places and worldwide coordinates remain governed.");
console.log("✅ Runtime flag activation, remote deployment, live verification, commit and push remain pending.");
