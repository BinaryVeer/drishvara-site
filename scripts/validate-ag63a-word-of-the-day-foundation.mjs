import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG63A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/knowledge/daily-guidance/word-of-day-bank-d02.json",
  "data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json",
  "data/content-intelligence/quality-reviews/ag62z-first-light-working-data-closure.json",
  "scripts/generate-ag63a-word-of-the-day-foundation.mjs",
  "scripts/validate-ag63a-word-of-the-day-foundation.mjs",
  "data/content-intelligence/quality-reviews/ag63a-word-of-the-day-foundation.json",
  "data/content-intelligence/phase-01-modules/ag63a-word-of-the-day-source-consumption-record.json",
  "data/initial-working-data/word-of-day/ag63a-word-of-the-day-initial-working-data.json",
  "data/initial-working-data/word-of-day/ag63a-word-bank-approved-preview.json",
  "data/methodology/word-of-day/ag63a-word-of-the-day-methodology.json",
  "data/methodology/word-of-day/ag63a-word-selection-rotation-policy.json",
  "data/methodology/word-of-day/ag63a-word-ai-token-policy.json",
  "data/feedback/word-of-day/ag63a-word-of-the-day-user-feedback-schema.json",
  "data/feedback/word-of-day/ag63a-word-of-the-day-admin-review-absorption-schema.json",
  "generated/word-of-day.json",
  "data/content-intelligence/quality-registry/ag63a-ag63b-word-of-the-day-ui-wiring-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag63a-to-ag63b-word-of-the-day-ui-wiring-boundary.json",
  "data/content-intelligence/backend-architecture/ag63a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag63a-no-v02-expansion-audit.json",
  "data/quality/ag63a-word-of-the-day-foundation.json",
  "data/quality/ag63a-word-of-the-day-foundation-preview.json",
  "docs/quality/AG63A_WORD_OF_THE_DAY_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag63a"]) fail("Missing generate:ag63a script.");
if (!pkg.scripts?.["validate:ag63a"]) fail("Missing validate:ag63a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag63a")) fail("validate:project must include validate:ag63a.");

const bank = readJson("data/initial-working-data/word-of-day/ag63a-word-bank-approved-preview.json");
const initial = readJson("data/initial-working-data/word-of-day/ag63a-word-of-the-day-initial-working-data.json");
const methodology = readJson("data/methodology/word-of-day/ag63a-word-of-the-day-methodology.json");
const aiPolicy = readJson("data/methodology/word-of-day/ag63a-word-ai-token-policy.json");
const feedback = readJson("data/feedback/word-of-day/ag63a-word-of-the-day-user-feedback-schema.json");
const admin = readJson("data/feedback/word-of-day/ag63a-word-of-the-day-admin-review-absorption-schema.json");
const generated = readJson("generated/word-of-day.json");
const review = readJson("data/content-intelligence/quality-reviews/ag63a-word-of-the-day-foundation.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag63a-ag63b-word-of-the-day-ui-wiring-readiness-record.json");
const preview = readJson("data/quality/ag63a-word-of-the-day-foundation-preview.json");

if (!Array.isArray(bank.items) || bank.items.length < 5) fail("Approved preview word bank must contain at least 5 items.");
if (bank.items.some((item) => item.review_status !== "approved")) fail("Approved preview bank must contain only approved items.");
if (initial.status !== "initial_working_data_created_not_publicly_wired") fail("Initial working data status mismatch.");
if (initial.public_ui_activation_status !== "not_wired_in_ag63a") fail("Public UI must not be wired in AG63A.");

if (methodology.status !== "methodology_created_not_runtime_active") fail("Methodology status mismatch.");
if (!methodology.principles.some((rule) => rule.includes("Do not invent Sanskrit"))) fail("Sanskrit invention guardrail missing.");
if (aiPolicy.ai_runtime_active !== false) fail("AI runtime must be false.");
if (aiPolicy.user_triggered_ai_allowed !== false) fail("User-triggered AI must be false.");
if (feedback.user_feedback_allowed_now !== false) fail("User feedback must not be active.");
if (admin.automatic_absorption_allowed !== false) fail("Automatic absorption must be false.");

if (generated.status !== "initial_word_of_day_ready_not_publicly_wired") fail("Generated word status mismatch.");
if (generated.public_ui_ready !== false) fail("Generated word must not be public UI ready in AG63A.");
if (generated.dynamic_rotation_active !== false) fail("Dynamic rotation must be false.");
if (generated.ai_generation_active !== false) fail("AI generation must be false.");
if (!generated.word?.english || !generated.word?.hindi || !generated.word?.sanskrit || !generated.word?.meaning) {
  fail("Generated word must contain english/hindi/sanskrit/meaning fields.");
}
if (generated.word.classical_claim_made !== false) fail("Classical claim must be false.");
if (generated.word.scriptural_claim_made !== false) fail("Scriptural claim must be false.");

if (review.status !== "ag63a_word_of_the_day_foundation_completed") fail("Review status mismatch.");
if (review.summary.source_records_consumed !== true) fail("Source consumption summary missing.");
if (review.summary.initial_working_data_created !== true) fail("Initial working summary missing.");
if (review.summary.methodology_created !== true) fail("Methodology summary missing.");
if (review.summary.feedback_schema_created !== true) fail("Feedback summary missing.");
if (review.summary.admin_review_absorption_schema_created !== true) fail("Admin schema summary missing.");
if (review.summary.generated_word_of_day_created !== true) fail("Generated word summary missing.");
if (review.summary.ui_wired_now !== false) fail("UI wiring must be false in AG63A.");
if (review.summary.dynamic_rotation_active !== false) fail("Dynamic rotation must be false.");
if (review.summary.ai_generation_active !== false) fail("AI generation must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag63b !== true) fail("AG63B readiness missing.");

if (readiness.ready_for_ag63b !== true) fail("AG63B readiness must be true.");
if (preview.ready_for_ag63b !== 1) fail("Preview AG63B readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag63a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag63a-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG63A Word of the Day Foundation is present.");
pass("D02 approved word bank is consumed into initial working data.");
pass("Word methodology, AI policy, feedback and admin absorption schemas are present.");
pass("generated/word-of-day.json is created but not publicly wired.");
pass("No dynamic rotation, runtime AI, backend or V02 action is recorded.");
pass("AG63B Word of the Day UI Wiring readiness is valid.");
