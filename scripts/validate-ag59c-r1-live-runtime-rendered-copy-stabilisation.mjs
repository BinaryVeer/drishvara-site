import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG59C-R1 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "data/content-intelligence/quality-reviews/ag59c-live-public-url-verification.json",
  "data/content-intelligence/quality-reviews/ag59c-r1-live-runtime-rendered-copy-stabilisation.json",
  "data/content-intelligence/go-live/ag59c-r1-source-consumption-record.json",
  "data/content-intelligence/go-live/ag59c-r1-runtime-rendered-copy-correction-record.json",
  "data/content-intelligence/go-live/ag59c-r1-live-evidence-record.json",
  "data/content-intelligence/backend-architecture/ag59c-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag59c-r1-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag59c-r1-ag59z-v01-go-live-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag59c-r1-to-ag59z-v01-go-live-closure-boundary.json",
  "data/quality/ag59c-r1-live-runtime-rendered-copy-stabilisation.json",
  "data/quality/ag59c-r1-live-runtime-rendered-copy-stabilisation-preview.json",
  "docs/quality/AG59C_R1_LIVE_RUNTIME_RENDERED_COPY_STABILISATION.md",
  "scripts/generate-ag59c-r1-live-runtime-rendered-copy-stabilisation.mjs",
  "scripts/validate-ag59c-r1-live-runtime-rendered-copy-stabilisation.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag59c-r1"]) fail("Missing generate:ag59c-r1 script.");
if (!pkg.scripts?.["validate:ag59c-r1"]) fail("Missing validate:ag59c-r1 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag59c-r1")) fail("validate:project must include validate:ag59c-r1.");

const review = readJson("data/content-intelligence/quality-reviews/ag59c-r1-live-runtime-rendered-copy-stabilisation.json");
const correction = readJson("data/content-intelligence/go-live/ag59c-r1-runtime-rendered-copy-correction-record.json");
const evidence = readJson("data/content-intelligence/go-live/ag59c-r1-live-evidence-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag59c-r1-ag59z-v01-go-live-closure-readiness-record.json");
const preview = readJson("data/quality/ag59c-r1-live-runtime-rendered-copy-stabilisation-preview.json");

if (review.status !== "live_runtime_rendered_copy_stabilisation_passed_ready_for_ag59z") fail("AG59C-R1 review status mismatch.");
if (review.summary.rendered_public_copy_stabilised !== true) fail("Rendered copy stabilisation missing.");
if (review.summary.live_runtime_syntax_ok !== true) fail("Live runtime syntax status missing.");
if (review.summary.key_live_assets_200 !== true) fail("Key live asset 200 status missing.");
if (review.summary.old_labels_cleared !== true) fail("Old labels not cleared.");
if (review.summary.corrected_labels_present !== true) fail("Corrected labels not present.");
if (review.summary.ready_for_ag59z !== true) fail("AG59Z readiness missing.");

if (correction.rendered_copy_stabiliser_present !== true) fail("DOM stabiliser not recorded.");
if (correction.generated_context_fallbacks_present !== true) fail("Generated context fallbacks not recorded.");
if (evidence.live_runtime_syntax_ok !== true) fail("Live runtime syntax evidence missing.");
if (!evidence.asset_results.every((r) => r.passed === true)) fail("One or more asset checks failed.");
if (!evidence.old_label_results.every((r) => r.passed === true)) fail("One or more old labels still present.");
if (!evidence.corrected_label_results.every((r) => r.passed === true)) fail("One or more corrected labels missing.");
if (readiness.ready_for_ag59z !== true) fail("AG59Z readiness must be true.");
if (preview.ready_for_ag59z !== 1) fail("Preview AG59Z readiness missing.");

for (const f of [
  "data/content-intelligence/backend-architecture/ag59c-r1-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag59c-r1-no-v02-expansion-audit.json"
]) {
  const audit = readJson(f);
  if (audit.audit_passed !== true) fail(`${f} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${f} failed checks must be zero.`);
}

pass("AG59C-R1 Live Runtime / Rendered Public Copy Stabilisation is present.");
pass("Rendered public copy stabilisation is valid.");
pass("Live runtime syntax and key live assets are valid.");
pass("Old labels are cleared and corrected labels are present.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG59Z V01 Go-Live Closure readiness is valid.");
