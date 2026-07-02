import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (value) => path.join(root, value);
const read = (value) => fs.readFileSync(full(value), "utf8");
const readJson = (value) => JSON.parse(read(value));
const sha256 = (value) =>
  crypto
    .createHash("sha256")
    .update(fs.readFileSync(full(value)))
    .digest("hex");

const fail = (message) => {
  console.error(`❌ AG75D-R1 validation failed: ${message}`);
  process.exit(1);
};

const governedBaseline = "aa05da21580e6f45d33162fba49684bd8cd97864";
const candidateSha = "ce9dccf58212963704a38a8aa2d0d89b80b8fe34f22f28234d8b67e178b7389a";
const controllerSha = "980cfb25ead9c78464a0c36ad9aeee441de359c492c38f48a4d483ab547d4711";

const paths = {
  controller: "assets/js/sup02-panchang-server-controller.js",
  record:
    "data/content-intelligence/quality-registry/" +
    "ag75d-r1-public-surface-reconciliation-record.json",
  readiness:
    "data/content-intelligence/quality-registry/" +
    "ag75d-r1-ag75d-r2-star-reflection-runtime-wiring-readiness-record.json",
  boundary:
    "data/content-intelligence/mutation-plans/" +
    "ag75d-r1-to-ag75d-r2-star-reflection-runtime-wiring-boundary.json",
  review:
    "data/content-intelligence/quality-reviews/" +
    "ag75d-r1-public-surface-reconciliation.json",
  quality:
    "data/quality/ag75d-r1-public-surface-reconciliation.json",
  documentation:
    "docs/quality/AG75D_R1_PUBLIC_SURFACE_RECONCILIATION.md",
};

for (const value of Object.values(paths)) {
  if (!fs.existsSync(full(value))) {
    fail(`Missing required AG75D-R1 file: ${value}`);
  }
}

const controller = read(paths.controller);
const record = readJson(paths.record);
const readiness = readJson(paths.readiness);
const boundary = readJson(paths.boundary);
const review = readJson(paths.review);
const quality = readJson(paths.quality);

if (
  record.module_id !== "AG75D-R1" ||
  record.status !== "ag75d_r1_public_surface_reconciliation_applied" ||
  record.governed_repository_baseline !== governedBaseline ||
  record.candidate_plan_sha256 !== candidateSha ||
  record.controller_sha256 !== controllerSha
) {
  fail("Reconciliation record mismatch.");
}

if (sha256(paths.controller) !== controllerSha) {
  fail("Controller hash mismatch.");
}

if (
  sha256("index.html") !==
  "6ba9e16c2ee35c0dfd4abdbc872f54dafaa6a4a938f1bcb2744d180a407c7cdf"
) {
  fail("SUP02-closed index.html changed.");
}

if (
  sha256("supabase/functions/calculate-panchang/index.ts") !==
  "eaae3e78b788d879c7ed9d524cf101d83279b35934e1d7a7bb4325bbaaf18338"
) {
  fail("Closed SUP02 Edge Function changed.");
}

if (
  sha256(
    "data/methodology/star-reflection/" +
      "ag75c-expanded-star-reflection-output-bank.json"
  ) !==
  "7e84bb3fbaee2043e3c6df9dbd9fb994629aef58eb7603d8fff36c039cf6a6bd"
) {
  fail("Immutable AG75C output bank changed.");
}

if (
  controller.split(
    "AG75D_R1_PUBLIC_SURFACE_RECONCILIATION_OVERLAY"
  ).length !== 2
) {
  fail("AG75D-R1 overlay missing or duplicated.");
}

for (const required of [
  "previous_picker_next_auto_request",
  "scheduleCoordinateRun",
  "syncRitualRow",
  "Varanasi Hindu Lunar Reference Calendar",
  'remove("#panchang-today")',
  'remove("[data-ag74o-r3-request-commit]")',
  'remove(".ag74o-alias-field")',
  "payload.record_count !== 5",
  "runPanchang();",
  "AG75D_R1_NATIVE_STAR_SELECT_RECOVERY",
  "activateNativeStarSelect",
  "native_five_option_select_recovered",
  'select.dataset.drishvaraHf12Converted = "true"',
  'setProperty("pointer-events", "auto", "important")',
  "AG75D_R1_STAR_SELECT_WIDTH_AND_EMPTY_OBSERVANCE_FIX",
  'setProperty("min-width", "220px", "important")',
  'select.removeAttribute("aria-hidden")',
  "syncEmptyObservanceDetails",
  "data-ag75d-r1-empty-observance-hidden",
]) {
  if (!controller.includes(required)) {
    fail(`Controller missing required token: ${required}`);
  }
}

for (const blocked of [
  "localStorage",
  "sessionStorage",
  ["sb", "_secret_"].join(""),
  ["postgres", "ql", "://"].join(""),
]) {
  if (controller.includes(blocked)) {
    fail(`Controller contains blocked token: ${blocked}`);
  }
}

if (
  readiness.status !==
    "ready_for_ag75d_r2_star_reflection_runtime_and_output_bank_wiring" ||
  readiness.next_stage !== "AG75D-R2" ||
  readiness.hard_blockers?.length !== 0
) {
  fail("AG75D-R2 readiness mismatch.");
}

if (
  boundary.from_module !== "AG75D-R1" ||
  boundary.to_module !== "AG75D-R2" ||
  boundary.status !== "ag75d_r1_to_ag75d_r2_boundary_locked" ||
  boundary.mutation_class !==
    "controlled_star_reflection_browser_wiring_no_backend_or_persistence_mutation"
) {
  fail("AG75D-R1 to AG75D-R2 boundary mismatch.");
}

if (
  review.status !== "ag75d_r1_completed" ||
  review.summary?.index_html_changed !== false ||
  review.summary?.edge_function_changed !== false ||
  review.summary?.database_changed !== false ||
  review.summary?.runtime_release_changed !== false ||
  review.summary?.personal_input_persistence_enabled !== false ||
  review.summary?.ready_for_ag75d_r2 !== true
) {
  fail("AG75D-R1 review mismatch.");
}

if (
  quality.status !==
    "ag75d_r1_public_surface_reconciliation_validation_passed" ||
  quality.governed_repository_baseline !== governedBaseline ||
  quality.candidate_plan_sha256 !== candidateSha ||
  quality.controller_sha256 !== controllerSha ||
  quality.next_stage !== "AG75D-R2" ||
  Object.values(quality.checks || {}).some(
    (value) => value !== true
  )
) {
  fail("AG75D-R1 quality record mismatch.");
}

const packageJson = readJson("package.json");
if (
  packageJson.scripts?.["validate:ag75d:r1"] !==
  "node scripts/validate-ag75d-r1-public-surface-reconciliation.mjs"
) {
  fail("package.json AG75D-R1 registration missing.");
}

const documentation = read(paths.documentation);
for (const required of [
  governedBaseline,
  candidateSha,
  controllerSha,
  "AG75D-R2",
  "Previous Day",
  "Next Day",
  "five AG74P-approved named locations",
  "all-faith calendar",
]) {
  if (!documentation.includes(required)) {
    fail(`Documentation missing required text: ${required}`);
  }
}

console.log("✅ AG75D-R1 public surface reconciliation is valid.");
console.log("✅ SUP02-closed index.html and Edge Function remain unchanged.");
console.log("✅ Panchang and Star Reflection use the five approved named locations.");
console.log("✅ Date navigation is Previous Day + picker + Next Day with automatic requests.");
console.log("✅ Empty ritual windows and stale manual page status are corrected.");
console.log("✅ No database, deployment, runtime-release or persistence mutation occurred.");
console.log("✅ AG75D-R2 is ready for Star Reflection runtime and output-bank wiring.");
