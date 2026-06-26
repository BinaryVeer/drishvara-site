import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { buildSup01RuntimePayloads } from "./sup01-build-runtime-payloads.mjs";

const root = process.cwd();
const full = (value) => path.join(root, value);
const exists = (value) => fs.existsSync(full(value));
const read = (value) => fs.readFileSync(full(value), "utf8");
const json = (value) => JSON.parse(read(value));
const fail = (message) => {
  console.error(`❌ SUP01 validation failed: ${message}`);
  process.exit(1);
};
const sha = (value) =>
  crypto.createHash("sha256").update(fs.readFileSync(full(value))).digest("hex");

const ag74pIndexBaseline = "a88abb450a2e428041f277baa23f83e8e956a93f61d58c80c0239407b39e18e2";
const immutable = {
  "assets/js/ag74o-panchang-public-controller.js":
    "1b7ad9360a9081da22e5d80daf4ffc954629742196773fd599514731b95b3f44",
  "data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json":
    "c907a82b2577e28acdedc6d173bc3bc1476a2a6e9203787c9bab49c94354ad93",
  "data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json":
    "4da533d3a887dc4d58a3fe1950a9fa71486621169612045d192851814c8b1a40",
  "data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json":
    "0b4f3a3c9a2680eafc117d1fd2e37a5ceace895b0e3a5608801903bb74d25ab5"
};
for (const [relative, expected] of Object.entries(immutable)) {
  if (sha(relative) !== expected) fail(`AG74P immutable source changed: ${relative}`);
}

const finalBoundaryPath =
  "data/content-intelligence/mutation-plans/sup02-public-runtime-final-cutover-boundary.json";
const finalBoundary = exists(finalBoundaryPath) ? json(finalBoundaryPath) : null;
const sup02CutoverPrepared =
  finalBoundary?.module_id === "SUP02" &&
  finalBoundary?.local_public_index_switch_prepared === true;

if (!sup02CutoverPrepared) {
  if (sha("index.html") !== ag74pIndexBaseline) {
    fail("AG74P public index changed outside a governed SUP02 cutover boundary.");
  }
} else {
  if (
    finalBoundary.ag74p_index_baseline_sha256 !== ag74pIndexBaseline ||
    finalBoundary.server_controller_sha256 !==
      "e12d8a0969e06971e8c0bcdc870299a3622cd49d4e909f824aafc0c10977011a"
  ) {
    fail("SUP02 cutover baseline provenance mismatch.");
  }
  const index = read("index.html");
  if (
    !index.includes("assets/js/sup02-panchang-server-controller.js") ||
    index.includes('src="assets/js/ag74o-panchang-public-controller.js"') ||
    index.includes('src="assets/vendor/astronomy-engine-2.1.19.min.js"')
  ) {
    fail("SUP02 server-only public index wiring mismatch.");
  }
}

const closure = json(
  "data/content-intelligence/quality-registry/ag74p-two-asset-final-closure-record.json"
);
if (
  closure.status !==
    "ag74p_single_patch_final_execution_evidence_verified_and_formally_closed" ||
  closure.formal_closure?.status !== "closed"
) {
  fail("AG74P formal closure must remain immutable.");
}

const packageJson = json("package.json");
for (const script of [
  "build:sup01:runtime-payloads",
  "preflight:sup01:supabase",
  "preflight:sup01:parity",
  "validate:sup01"
]) {
  if (!packageJson.scripts?.[script]) fail(`package.json script missing: ${script}`);
}
if (!packageJson.scripts["validate:project"].includes("npm run validate:sup01")) {
  fail("validate:project must include SUP01.");
}

const payloads = buildSup01RuntimePayloads();
if (payloads.release_id !== "ag74p_final_2026_06_24") fail("Release ID mismatch.");
if (payloads.calculation_policies.length !== 6) fail("Six calculation policies are required.");
if (payloads.festival_rules.length !== 7) fail("Seven approved festival rules are required.");
if (payloads.runtime_releases.length !== 1) fail("One runtime release is required.");
if (payloads.aliases.length < 5) fail("Normalized alias projection is incomplete.");
if (
  new Set(
    payloads.aliases.map(
      (item) => `${item.alias_normalized}:${item.canonical_place_id}`
    )
  ).size !== payloads.aliases.length
) {
  fail("Normalized aliases contain duplicates.");
}

const boundary = json(
  "data/content-intelligence/mutation-plans/sup01-single-stage-execution-boundary.json"
);
if (
  boundary.public_ui_cutover_allowed !== false ||
  boundary.database_write_allowed_during_local_apply !== false ||
  boundary.additional_ag_numbered_panchang_patch_required !== false
) {
  fail("Historical SUP01 mutation boundary mismatch.");
}

const governedText = [
  "supabase/config.toml",
  "supabase/functions/calculate-panchang/deno.json",
  "supabase/functions/calculate-panchang/index.ts",
  "supabase/functions/_shared/http.ts",
  "supabase/functions/_shared/location-resolution.ts",
  "supabase/functions/_shared/panchang-runtime.ts",
  "supabase/migrations/20260625_sup01_panchang_runtime.sql"
].map(read).join("\n");

const credentialPatterns = [
  new RegExp(["eyJ", "[A-Za-z0-9_-]+", "\\.", "[A-Za-z0-9_-]+", "\\.", "[A-Za-z0-9_-]+"].join("")),
  new RegExp(["sb", "_secret_", "[A-Za-z0-9_-]+"].join("")),
  new RegExp(["postgres", "(?:ql)?", "://"].join(""))
];
if (credentialPatterns.some((pattern) => pattern.test(governedText))) {
  fail("Credential-shaped material found in SUP01 source files.");
}

console.log("✅ SUP01 runtime foundation source remains locally valid.");
console.log("✅ AG74P controller and approved 5/384/114 projections remain byte-identical.");
console.log(
  sup02CutoverPrepared
    ? "✅ The AG74P index transition is governed exclusively by the prepared SUP02 server-runtime cutover."
    : "✅ The AG74P public index remains on its historical baseline."
);
console.log("✅ Runtime tables, privilege hardening and calculate-panchang source remain governed.");
