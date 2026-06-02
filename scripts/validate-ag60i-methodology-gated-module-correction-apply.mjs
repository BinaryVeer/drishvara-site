import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG60I validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "assets/js/drishvara-language-runtime.js",
  "data/content-intelligence/quality-reviews/ag60h-methodology-gated-module-audit.json",
  "scripts/generate-ag60i-methodology-gated-module-correction-apply.mjs",
  "scripts/validate-ag60i-methodology-gated-module-correction-apply.mjs",
  "data/content-intelligence/quality-reviews/ag60i-methodology-gated-module-correction-apply.json",
  "data/content-intelligence/phase-01-modules/ag60i-methodology-gated-module-correction-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag60i-methodology-gated-module-final-status-record.json",
  "data/content-intelligence/quality-registry/ag60i-ag60j-live-surface-final-review-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60i-to-ag60j-live-surface-final-review-boundary.json",
  "data/content-intelligence/backend-architecture/ag60i-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60i-no-v02-expansion-audit.json",
  "data/quality/ag60i-methodology-gated-module-correction-apply.json",
  "data/quality/ag60i-methodology-gated-module-correction-apply-preview.json",
  "docs/quality/AG60I_METHODOLOGY_GATED_MODULE_CORRECTION_APPLY.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60i"]) fail("Missing generate:ag60i script.");
if (!pkg.scripts?.["validate:ag60i"]) fail("Missing validate:ag60i script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60i")) fail("validate:project must include validate:ag60i.");

const indexHtml = read("index.html");
const runtime = read("assets/js/drishvara-language-runtime.js");

for (const snippet of [
  "AG60I-METHODOLOGY-GATED-MODULE-CORRECTION",
  "AG60I-FUTURE-AD-PLACEHOLDER-REMOVED",
  "data-drishvara-ag60i-panchang-preview-safe",
  "data-drishvara-ag60i-star-input-disabled",
  "data-drishvara-ag60i-word-methodology-note",
  "Withheld until verified",
  "Reflection Method Under Review"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG60I public correction snippet: ${snippet}`);
}

for (const runtimeKey of [
  "Reflective preview only; weekday, colour, mantra and food logic require verified source methodology before activation.",
  "Preview status: exact Panchang output is withheld until source, regional method and location calculation are verified.",
  "Curated linguistic preview; Sanskrit/Hindi meaning, usage and source methodology remain under editorial verification.",
  "Reflection Method Under Review",
  "Withheld until verified"
]) {
  if (!runtime.includes(runtimeKey)) fail(`Missing AG60I language runtime key: ${runtimeKey}`);
}

for (const forbidden of [
  "06:13 AM",
  "06:54 PM",
  "02:19 AM",
  "11:49 AM",
  "Ashtami → Navami",
  "Purva Ashadha",
  "Shiva → Siddha",
  "Krishna Paksha",
  "ॐ शनैश्चराय नमः",
  "नीला / श्याम",
  "Reserved space for future ads"
]) {
  if (indexHtml.includes(forbidden)) fail(`Forbidden exact-looking/placeholder value remains: ${forbidden}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag60i-methodology-gated-module-correction-apply.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag60i-methodology-gated-module-correction-apply-record.json");
const finalStatus = readJson("data/content-intelligence/phase-01-modules/ag60i-methodology-gated-module-final-status-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60i-ag60j-live-surface-final-review-readiness-record.json");
const preview = readJson("data/quality/ag60i-methodology-gated-module-correction-apply-preview.json");

if (review.status !== "ag60i_methodology_gated_module_correction_applied") fail("Review status mismatch.");
if (review.summary.panchang_exact_unverified_values_suppressed !== true) fail("Panchang suppression summary missing.");
if (review.summary.star_reflection_inputs_disabled !== true) fail("Star Reflection disabled summary missing.");
if (review.summary.future_ad_placeholder_removed !== true) fail("Future ad placeholder removal summary missing.");
if (review.summary.language_runtime_keys_added !== true) fail("Language runtime summary missing.");
if (review.summary.stale_validators_updated_for_ag60i_copy !== true) fail("Stale validator summary missing.");
if (review.summary.ready_for_ag60j !== true) fail("AG60J readiness missing.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");

if (apply.audit_passed !== true) fail("Apply record must pass.");
if (finalStatus.modules.panchang_festival_view !== "visible_without_exact_unverified_values") fail("Final Panchang status mismatch.");
if (finalStatus.modules.star_reflection !== "visible_but_inputs_disabled") fail("Final Star status mismatch.");
if (finalStatus.modules.future_ad_placeholder !== "removed_from_public_ui") fail("Final ad placeholder status mismatch.");
if (readiness.ready_for_ag60j !== true) fail("AG60J readiness must be true.");
if (preview.ready_for_ag60j !== 1) fail("Preview AG60J readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag60i-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60i-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG60I Methodology-Gated Module Correction Apply is present.");
pass("Panchang exact-looking unverified values are suppressed.");
pass("Vedic, Word, Star, Psychometric and Sports public copy is corrected.");
pass("AG60I language runtime keys are present.");
pass("Future ad placeholder is removed from public UI.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60J Live Surface Final Review readiness is valid.");
