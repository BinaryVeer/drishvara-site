import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG63Z validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/word-of-day.json",
  "data/content-intelligence/quality-reviews/ag63a-word-of-the-day-foundation.json",
  "data/content-intelligence/quality-reviews/ag63b-word-of-the-day-ui-wiring.json",
  "scripts/generate-ag63z-word-of-the-day-closure.mjs",
  "scripts/validate-ag63z-word-of-the-day-closure.mjs",
  "data/content-intelligence/quality-reviews/ag63z-word-of-the-day-closure.json",
  "data/content-intelligence/closure-records/ag63z-word-of-the-day-working-data-and-ui-wiring-closure.json",
  "data/content-intelligence/phase-01-modules/ag63z-word-of-the-day-final-status-record.json",
  "data/content-intelligence/phase-01-modules/ag63z-word-of-the-day-live-verification-evidence-record.json",
  "data/content-intelligence/quality-registry/ag63z-ag64-panchang-festival-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag63z-to-ag64-panchang-festival-boundary.json",
  "data/content-intelligence/backend-architecture/ag63z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag63z-no-v02-expansion-audit.json",
  "data/quality/ag63z-word-of-the-day-closure.json",
  "data/quality/ag63z-word-of-the-day-closure-preview.json",
  "docs/quality/AG63Z_WORD_OF_THE_DAY_CLOSURE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag63z"]) fail("Missing generate:ag63z script.");
if (!pkg.scripts?.["validate:ag63z"]) fail("Missing validate:ag63z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag63z")) fail("validate:project must include validate:ag63z.");

const indexHtml = read("index.html");
for (const snippet of [
  "data-drishvara-ag63b-word-of-day-ui-wiring",
  "generated/word-of-day.json",
  "drishvaraAg63bLoadWordOfTheDay"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing Word UI closure snippet: ${snippet}`);
}

const generated = readJson("generated/word-of-day.json");
const word = generated.word || {};
if (!word.english || !word.hindi || !word.sanskrit || !word.meaning) fail("Generated word fields missing.");
if (generated.dynamic_rotation_active !== false) fail("Dynamic rotation must be false.");
if (generated.ai_generation_active !== false) fail("AI generation must be false.");
if (word.classical_claim_made !== false) fail("Classical claim must be false.");
if (word.scriptural_claim_made !== false) fail("Scriptural claim must be false.");

const review = readJson("data/content-intelligence/quality-reviews/ag63z-word-of-the-day-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag63z-word-of-the-day-working-data-and-ui-wiring-closure.json");
const finalStatus = readJson("data/content-intelligence/phase-01-modules/ag63z-word-of-the-day-final-status-record.json");
const liveEvidence = readJson("data/content-intelligence/phase-01-modules/ag63z-word-of-the-day-live-verification-evidence-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag63z-ag64-panchang-festival-readiness-record.json");
const preview = readJson("data/quality/ag63z-word-of-the-day-closure-preview.json");

if (review.status !== "ag63z_word_of_the_day_closure_completed") fail("Review status mismatch.");
if (review.summary.ag63a_foundation_completed !== true) fail("AG63A closure summary missing.");
if (review.summary.ag63b_ui_wiring_completed !== true) fail("AG63B closure summary missing.");
if (review.summary.word_of_the_day_row_closed_at_working_data_level !== true) fail("Word row closure summary missing.");
if (review.summary.generated_word_source_connected !== true) fail("Generated word source summary missing.");
if (review.summary.dynamic_rotation_active !== false) fail("Dynamic rotation must be false.");
if (review.summary.ai_generation_active !== false) fail("AI generation must be false.");
if (review.summary.runtime_ai_active !== false) fail("Runtime AI must be false.");
if (review.summary.classical_claim_made !== false) fail("Classical claim summary must be false.");
if (review.summary.scriptural_claim_made !== false) fail("Scriptural claim summary must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag64 !== true) fail("AG64 readiness missing.");

if (closure.status !== "ag63z_word_of_the_day_working_data_and_ui_wiring_closed") fail("Closure status mismatch.");
if (finalStatus.word_of_the_day.ui_wired_to_generated_data !== true) fail("Final status UI wiring missing.");
if (liveEvidence.evidence_from_operator_terminal.live_generated_word_json_accessible !== true) fail("Live JSON evidence missing.");
if (liveEvidence.evidence_from_operator_terminal.english !== word.english) fail("Live evidence word mismatch.");
if (readiness.ready_for_ag64 !== true) fail("AG64 readiness must be true.");
if (preview.ready_for_ag64 !== 1) fail("Preview AG64 readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag63z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag63z-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG63Z Word of the Day Closure is present.");
pass("AG63A foundation and AG63B UI wiring are closed.");
pass("Generated Word of the Day is connected and live evidence is recorded.");
pass("No dynamic rotation, runtime AI, classical/scriptural claim, backend or V02 action is recorded.");
pass("AG64 Panchang & Festival readiness is valid.");
