import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG60H validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/daily-context.json",
  "generated/sports-context.json",
  "data/content-intelligence/quality-reviews/ag60g-r2-remove-duplicate-hidden-surfaces.json",
  "scripts/generate-ag60h-methodology-gated-module-audit.mjs",
  "scripts/validate-ag60h-methodology-gated-module-audit.mjs",
  "data/content-intelligence/quality-reviews/ag60h-methodology-gated-module-audit.json",
  "data/content-intelligence/phase-01-modules/ag60h-methodology-gated-module-status-record.json",
  "data/content-intelligence/phase-01-modules/ag60h-methodology-gated-module-blocker-register.json",
  "data/content-intelligence/phase-01-modules/ag60h-source-methodology-basis-record.json",
  "data/content-intelligence/quality-registry/ag60h-ag60i-methodology-gated-module-correction-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60h-to-ag60i-methodology-gated-module-correction-boundary.json",
  "data/content-intelligence/backend-architecture/ag60h-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60h-no-v02-expansion-audit.json",
  "data/quality/ag60h-methodology-gated-module-audit.json",
  "data/quality/ag60h-methodology-gated-module-audit-preview.json",
  "docs/quality/AG60H_METHODOLOGY_GATED_MODULE_AUDIT.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60h"]) fail("Missing generate:ag60h script.");
if (!pkg.scripts?.["validate:ag60h"]) fail("Missing validate:ag60h script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60h")) fail("validate:project must include validate:ag60h.");

const indexHtml = read("index.html");
for (const term of [
  "Word of the Day",
  "Today’s Vedic Guidance",
  "Star Reflection",
  "Panchang & Festival View",
  "Upcoming Observance",
  "Psychometric Assessment",
  "Sports Desk"
]) {
  if (!indexHtml.includes(term)) fail(`Missing homepage module term: ${term}`);
}

const sports = readJson("generated/sports-context.json");
if (sports.status !== "prepared_surface") fail("Sports context must remain prepared_surface.");

const review = readJson("data/content-intelligence/quality-reviews/ag60h-methodology-gated-module-audit.json");
const moduleStatus = readJson("data/content-intelligence/phase-01-modules/ag60h-methodology-gated-module-status-record.json");
const blocker = readJson("data/content-intelligence/phase-01-modules/ag60h-methodology-gated-module-blocker-register.json");
const sourceBasis = readJson("data/content-intelligence/phase-01-modules/ag60h-source-methodology-basis-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60h-ag60i-methodology-gated-module-correction-readiness-record.json");
const preview = readJson("data/quality/ag60h-methodology-gated-module-audit-preview.json");

if (review.status !== "ag60h_methodology_gated_module_audit_completed") fail("Review status mismatch.");
if (review.summary.methodology_gated_modules_audited !== true) fail("Methodology audit summary missing.");
if (review.summary.ready_for_ag60i !== true) fail("AG60I readiness missing.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");

for (const key of [
  "word_of_the_day",
  "vedic_guidance",
  "panchang_festival_view",
  "upcoming_observance",
  "star_reflection",
  "psychometric_assessment",
  "sports_desk"
]) {
  if (!moduleStatus.modules?.[key]) fail(`Missing module status: ${key}`);
}

if (!Array.isArray(blocker.blockers) || blocker.blockers.length !== 6) fail("Expected six blockers.");
if (!Array.isArray(sourceBasis.unavailable_or_not_activated) || sourceBasis.unavailable_or_not_activated.length < 5) fail("Source basis unavailable list incomplete.");
if (readiness.ready_for_ag60i !== true) fail("AG60I readiness must be true.");
if (preview.ready_for_ag60i !== 1) fail("Preview AG60I readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag60h-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60h-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG60H Methodology-Gated Module Audit is present.");
pass("Word, Vedic, Panchang, Observance, Star, Psychometric and Sports statuses are recorded.");
pass("Six methodology-gated blockers are recorded.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60I Methodology-Gated Module Correction readiness is valid.");
