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
  console.error(`❌ SUP02 readiness validation failed: ${message}`);
  process.exit(1);
};

const required = [
  "index.html",
  "assets/js/ag74o-panchang-public-controller.js",
  "assets/js/sup02-panchang-server-controller.js",
  "supabase/config.toml",
  "supabase/functions/calculate-panchang/index.ts",
  "supabase/functions/calculate-panchang/deno.json",
  "supabase/migrations/20260627_sup02_panchang_public_cutover_readiness.sql",
  "supabase/rollback/20260627_sup02_disable_public_cutover.sql",
  "scripts/sup01-supabase-preflight.mjs",
  "data/content-intelligence/mutation-plans/sup02-public-runtime-cutover-boundary.json",
  "data/content-intelligence/quality-registry/sup02-public-runtime-cutover-readiness-record.json",
  "data/quality/sup02-public-runtime-cutover-readiness-validation.json",
  "docs/quality/SUP02_PUBLIC_RUNTIME_CUTOVER_READINESS.md"
];
for (const relative of required) {
  if (!exists(relative)) fail(`Missing required file: ${relative}`);
}

const sup01Closure = json(
  "data/content-intelligence/quality-registry/sup01-runtime-formal-closure-record.json"
);
if (
  sup01Closure.status !==
    "sup01_live_execution_evidence_verified_and_formally_closed" ||
  sup01Closure.formal_closure?.status !== "closed" ||
  sup01Closure.formal_closure?.next_stage !== "SUP02"
) {
  fail("SUP01 formal closure handoff is not intact.");
}

if (
  sha("index.html") !==
    "a88abb450a2e428041f277baa23f83e8e956a93f61d58c80c0239407b39e18e2" ||
  sha("assets/js/ag74o-panchang-public-controller.js") !==
    "1b7ad9360a9081da22e5d80daf4ffc954629742196773fd599514731b95b3f44"
) {
  fail("AG74P public assets changed during non-activating SUP02 readiness.");
}

const index = read("index.html");
if (
  !index.includes("assets/vendor/astronomy-engine-2.1.19.min.js") ||
  !index.includes("assets/js/ag74o-panchang-public-controller.js") ||
  index.includes("assets/js/sup02-panchang-server-controller.js")
) {
  fail("Public index must remain on the AG74P runtime during readiness.");
}

const config = read("supabase/config.toml");
if (
  !config.includes("[functions.calculate-panchang]") ||
  !config.includes("verify_jwt = false") ||
  config.includes("verify_jwt = true")
) {
  fail("SUP02 public Edge Function invocation mode is not prepared.");
}

const functionSource = read("supabase/functions/calculate-panchang/index.ts");
for (const marker of [
  "drishvara_panchang_runtime_releases",
  "runtime_release_contract_mismatch",
  "runtimeRelease.public_ui_cutover_active",
  "sup02_governed_public_runtime_response",
  "sup02_governed_runtime_ready_cutover_inactive",
  "calculation_request_persisted: false",
  "location_input_persisted: false",
  "personal_data_persisted: false"
]) {
  if (!functionSource.includes(marker)) {
    fail(`Updated Edge Function marker missing: ${marker}`);
  }
}
if (
  functionSource.includes("public_ui_cutover_active: false,") ||
  functionSource.includes('next_cutover_stage: "SUP02"')
) {
  fail("Edge Function cutover status must be read dynamically.");
}

const controller = read("assets/js/sup02-panchang-server-controller.js");
for (const marker of [
  "drishvaraSup02PublicSurfaceActive",
  "supabase.co/functions/v1/calculate-panchang",
  "credentials: \"omit\"",
  "no browser-local astronomy",
  "primary_public_window",
  "ritual_windows",
  "public_ui_cutover_active !== true",
  "calculation_request_persisted !== false",
  "applySelection({ boot: true",
  "ag74n-varanasi-samvat-2083-annual-calendar.json",
  "ag74p-approved-location-projection.json"
]) {
  if (!controller.includes(marker)) {
    fail(`Server-only controller marker missing: ${marker}`);
  }
}
for (const forbidden of [
  "window.Astronomy",
  "SearchRiseSet",
  "SetDeltaTFunction",
  "localStorage.setItem",
  "sessionStorage.setItem",
  "SUPABASE_SERVICE_ROLE_KEY",
  "service_role",
  "Authorization",
  "apikey"
]) {
  if (controller.includes(forbidden)) {
    fail(`Forbidden public-controller dependency: ${forbidden}`);
  }
}

const migration = read(
  "supabase/migrations/20260627_sup02_panchang_public_cutover_readiness.sql"
);
for (const marker of [
  "sup02_public_cutover_requires_active_runtime",
  "sup02_runtime_public_read",
  "status = 'active'",
  "no_input_persistence = true",
  "revoke all privileges",
  "grant select"
]) {
  if (!migration.includes(marker)) {
    fail(`SUP02 migration marker missing: ${marker}`);
  }
}
if (
  /set\s+public_ui_cutover_active\s*=\s*true/i.test(migration) ||
  /update\s+public\.drishvara_panchang_runtime_releases/i.test(migration)
) {
  fail("Readiness migration must not activate or update the cutover flag.");
}

const rollback = read(
  "supabase/rollback/20260627_sup02_disable_public_cutover.sql"
);
if (
  !rollback.includes("set public_ui_cutover_active = false") ||
  /set\s+public_ui_cutover_active\s*=\s*true/i.test(rollback) ||
  !rollback.includes("sup01_panchang_runtime_v1")
) {
  fail("Guarded disable-cutover operation source mismatch.");
}

const boundary = json(
  "data/content-intelligence/mutation-plans/sup02-public-runtime-cutover-boundary.json"
);
if (
  boundary.status !==
    "sup02_public_runtime_cutover_readiness_prepared_local_apply_only" ||
  boundary.public_ui_cutover_active !== false ||
  boundary.public_client_wired_in_index !== false ||
  boundary.live_database_migration_applied !== false ||
  boundary.live_function_deployment_performed !== false ||
  boundary.commit_and_push_performed !== false
) {
  fail("SUP02 readiness boundary mismatch.");
}

const readiness = json(
  "data/content-intelligence/quality-registry/sup02-public-runtime-cutover-readiness-record.json"
);
if (
  readiness.status !==
    "sup02_server_runtime_cutover_code_ready_live_execution_pending" ||
  !Object.values(readiness.prepared_components || {}).every(Boolean) ||
  !Object.values(readiness.deliberately_not_performed || {}).every(Boolean)
) {
  fail("SUP02 readiness record mismatch.");
}

const quality = json(
  "data/quality/sup02-public-runtime-cutover-readiness-validation.json"
);
if (
  quality.status !== "local_apply_validation_pending" ||
  !Object.values(quality.checks || {}).every(Boolean)
) {
  fail("SUP02 quality record mismatch.");
}

const pkg = json("package.json");
if (
  pkg.scripts?.["validate:sup02"] !==
    "node scripts/validate-sup02-runtime-cutover-readiness.mjs" ||
  !pkg.scripts?.["validate:project"]?.includes("npm run validate:sup02")
) {
  fail("SUP02 validation registration missing.");
}

const credentialNeedles = [
  ["eyJ", ".", "."].join(""),
  ["sb", "_secret_"].join(""),
  ["postgres", "://"].join(""),
  ["postgresql", "://"].join("")
];
for (const relative of required) {
  const body = fs.readFileSync(full(relative));
  const text = body.toString("utf8");
  if (credentialNeedles.some((needle) => text.includes(needle))) {
    fail(`Credential-shaped material found in ${relative}`);
  }
}

console.log("✅ SUP02 runtime-cutover readiness is locally valid.");
console.log("✅ Server-only controller, dynamic cutover readback and public invocation mode are prepared.");
console.log("✅ AG74P public index and browser-local controller remain byte-identical and active during readiness.");
console.log("✅ No live migration, function deployment, cutover activation, commit or push was performed.");
