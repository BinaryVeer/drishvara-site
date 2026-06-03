import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG62A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/daily-context.json",
  "data/content-intelligence/quality-reviews/ag61-first-visit-intro-video-foundation.json",
  "scripts/generate-ag62a-first-light-working-data-foundation.mjs",
  "scripts/validate-ag62a-first-light-working-data-foundation.mjs",
  "data/content-intelligence/quality-reviews/ag62a-first-light-working-data-foundation.json",
  "data/initial-working-data/first-light/ag62a-first-light-initial-working-data.json",
  "data/initial-working-data/first-light/ag62a-first-light-source-registry.json",
  "data/methodology/first-light/ag62a-first-light-candidate-signal-schema.json",
  "data/methodology/first-light/ag62a-first-light-ai-scoring-methodology.json",
  "data/methodology/first-light/ag62a-first-light-ai-routing-token-budget-policy.json",
  "data/feedback/first-light/ag62a-first-light-user-feedback-schema.json",
  "data/feedback/first-light/ag62a-first-light-admin-review-absorption-schema.json",
  "generated/first-light-working-data.json",
  "data/content-intelligence/quality-registry/ag62a-ag62b-first-light-ui-wiring-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag62a-to-ag62b-first-light-ui-wiring-boundary.json",
  "data/content-intelligence/backend-architecture/ag62a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag62a-no-v02-expansion-audit.json",
  "data/quality/ag62a-first-light-working-data-foundation.json",
  "data/quality/ag62a-first-light-working-data-foundation-preview.json",
  "docs/quality/AG62A_FIRST_LIGHT_WORKING_DATA_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag62a"]) fail("Missing generate:ag62a script.");
if (!pkg.scripts?.["validate:ag62a"]) fail("Missing validate:ag62a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag62a")) fail("validate:project must include validate:ag62a.");

const initial = readJson("data/initial-working-data/first-light/ag62a-first-light-initial-working-data.json");
const registry = readJson("data/initial-working-data/first-light/ag62a-first-light-source-registry.json");
const scoring = readJson("data/methodology/first-light/ag62a-first-light-ai-scoring-methodology.json");
const routing = readJson("data/methodology/first-light/ag62a-first-light-ai-routing-token-budget-policy.json");
const feedback = readJson("data/feedback/first-light/ag62a-first-light-user-feedback-schema.json");
const admin = readJson("data/feedback/first-light/ag62a-first-light-admin-review-absorption-schema.json");
const generated = readJson("generated/first-light-working-data.json");
const review = readJson("data/content-intelligence/quality-reviews/ag62a-first-light-working-data-foundation.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag62a-ag62b-first-light-ui-wiring-readiness-record.json");
const preview = readJson("data/quality/ag62a-first-light-working-data-foundation-preview.json");

if (initial.status !== "initial_working_data_created_not_publicly_wired") fail("Initial working data status mismatch.");
if (initial.selection_rule.default_total !== 10) fail("Default total must be 10.");
if (initial.selection_rule.india_general !== 5) fail("India general must be 5.");
if (initial.selection_rule.northeast_watch !== 1) fail("Northeast Watch must be 1.");
if (initial.selection_rule.international_world !== 4) fail("World must be 4.");
if (!Array.isArray(initial.selection_slots) || initial.selection_slots.length !== 10) fail("Selection slots must be 10.");

if (registry.live_fetching_enabled !== false) fail("Live fetching must be false.");
if (registry.scraping_enabled !== false) fail("Scraping must be false.");
if (registry.external_api_enabled !== false) fail("External API must be false.");

if (scoring.ai_runtime_active !== false) fail("AI runtime must not be active.");
if (!String(scoring.scoring_formula).includes("final_score")) fail("Scoring formula missing.");
if (routing.token_budget_per_daily_cycle.user_triggered_ai_allowed !== false) fail("User-triggered AI must be false.");
if (feedback.user_feedback_allowed_now !== false) fail("User feedback must not be active.");
if (admin.automatic_absorption_allowed !== false) fail("Automatic absorption must be false.");

if (generated.status !== "initial_working_data_ready_not_publicly_wired") fail("Generated working data status mismatch.");
if (generated.public_ui_ready !== false) fail("Generated data must not be public UI ready.");
if (generated.source_collection_active !== false) fail("Source collection must not be active.");
if (generated.ai_selection_active !== false) fail("AI selection must not be active.");
if (!Array.isArray(generated.firstLight.items) || generated.firstLight.items.length !== 10) fail("Generated First Light slots must be 10.");

if (review.status !== "ag62a_first_light_working_data_foundation_completed") fail("Review status mismatch.");
if (review.summary.initial_working_data_created !== true) fail("Initial working summary missing.");
if (review.summary.source_registry_created !== true) fail("Source registry summary missing.");
if (review.summary.ai_scoring_methodology_created !== true) fail("AI scoring summary missing.");
if (review.summary.feedback_schema_created !== true) fail("Feedback summary missing.");
if (review.summary.admin_review_absorption_schema_created !== true) fail("Admin absorption summary missing.");
if (review.summary.ui_wired_now !== false) fail("UI wiring must be false in AG62A.");
if (review.summary.live_fetching_enabled !== false) fail("Live fetching must be false.");
if (review.summary.ai_runtime_active !== false) fail("AI runtime must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag62b !== true) fail("AG62B readiness missing.");

if (readiness.ready_for_ag62b !== true) fail("AG62B readiness must be true.");
if (preview.ready_for_ag62b !== 1) fail("Preview AG62B readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag62a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag62a-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG62A First Light Working Data Foundation is present.");
pass("Initial working data, source registry and 10 selection slots are valid.");
pass("AI scoring methodology and token routing policy are present but not active.");
pass("Feedback and admin absorption schemas are present.");
pass("No UI wiring, live fetch, runtime AI, backend or V02 action is recorded.");
pass("AG62B First Light UI Wiring readiness is valid.");
