import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG63B validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "generated/word-of-day.json",
  "data/content-intelligence/quality-reviews/ag63a-word-of-the-day-foundation.json",
  "data/content-intelligence/quality-reviews/ag62z-r1-first-light-three-lane-transition-correction.json",
  "scripts/generate-ag63b-word-of-the-day-ui-wiring.mjs",
  "scripts/validate-ag63b-word-of-the-day-ui-wiring.mjs",
  "data/content-intelligence/quality-reviews/ag63b-word-of-the-day-ui-wiring.json",
  "data/content-intelligence/phase-01-modules/ag63b-word-of-the-day-ui-wiring-apply-record.json",
  "data/content-intelligence/phase-01-modules/ag63b-word-of-the-day-ui-data-contract-record.json",
  "data/content-intelligence/quality-registry/ag63b-ag63z-word-of-the-day-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag63b-to-ag63z-word-of-the-day-closure-boundary.json",
  "data/content-intelligence/backend-architecture/ag63b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag63b-no-v02-expansion-audit.json",
  "data/quality/ag63b-word-of-the-day-ui-wiring.json",
  "data/quality/ag63b-word-of-the-day-ui-wiring-preview.json",
  "docs/quality/AG63B_WORD_OF_THE_DAY_UI_WIRING.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag63b"]) fail("Missing generate:ag63b script.");
if (!pkg.scripts?.["validate:ag63b"]) fail("Missing validate:ag63b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag63b")) fail("validate:project must include validate:ag63b.");

const indexHtml = read("index.html");
const wordData = readJson("generated/word-of-day.json");

for (const snippet of [
  "data-drishvara-ag63b-word-of-day-ui-wiring",
  "generated/word-of-day.json",
  "drishvaraAg63bLoadWordOfTheDay",
  "data-drishvara-ag63b-word-methodology-note",
  "data-drishvara-ag63b-word-of-day-wired"
]) {
  if (!indexHtml.includes(snippet)) fail(`Missing AG63B UI wiring snippet: ${snippet}`);
}

for (const id of [
  'id="word-english"',
  'id="word-hindi"',
  'id="word-sanskrit"',
  'id="word-meaning"'
]) {
  if (!indexHtml.includes(id)) fail(`Missing Word UI target: ${id}`);
}

if (wordData.status !== "initial_word_of_day_ready_not_publicly_wired") fail("Generated word status mismatch.");
if (wordData.public_ui_ready !== false) fail("Generated word public_ui_ready must remain false.");
if (wordData.dynamic_rotation_active !== false) fail("Dynamic rotation must be false.");
if (wordData.ai_generation_active !== false) fail("AI generation must be false.");
if (!wordData.word?.english || !wordData.word?.hindi || !wordData.word?.sanskrit || !wordData.word?.meaning) {
  fail("Generated word must contain english/hindi/sanskrit/meaning.");
}
if (wordData.word.classical_claim_made !== false) fail("Classical claim must remain false.");
if (wordData.word.scriptural_claim_made !== false) fail("Scriptural claim must remain false.");

const review = readJson("data/content-intelligence/quality-reviews/ag63b-word-of-the-day-ui-wiring.json");
const apply = readJson("data/content-intelligence/phase-01-modules/ag63b-word-of-the-day-ui-wiring-apply-record.json");
const contract = readJson("data/content-intelligence/phase-01-modules/ag63b-word-of-the-day-ui-data-contract-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag63b-ag63z-word-of-the-day-closure-readiness-record.json");
const preview = readJson("data/quality/ag63b-word-of-the-day-ui-wiring-preview.json");

if (review.status !== "ag63b_word_of_the_day_ui_wiring_completed") fail("Review status mismatch.");
if (review.summary.ui_wiring_applied !== true) fail("UI wiring summary missing.");
if (review.summary.generated_word_source_connected !== true) fail("Generated word source summary missing.");
if (review.summary.dynamic_rotation_active !== false) fail("Dynamic rotation summary must be false.");
if (review.summary.ai_generation_active !== false) fail("AI generation summary must be false.");
if (review.summary.runtime_ai_active !== false) fail("Runtime AI summary must be false.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must be false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must be false.");
if (review.summary.ready_for_ag63z !== true) fail("AG63Z readiness missing.");

if (apply.behaviour.fetches_generated_word_data !== true) fail("Apply fetch behaviour missing.");
if (apply.behaviour.dynamic_rotation_active !== false) fail("Apply dynamic rotation must be false.");
if (contract.current_word.english !== wordData.word.english) fail("Contract current word mismatch.");
if (readiness.ready_for_ag63z !== true) fail("AG63Z readiness must be true.");
if (preview.ready_for_ag63z !== 1) fail("Preview AG63Z readiness missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag63b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag63b-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG63B Word of the Day UI Wiring is present.");
pass("Homepage Word card is wired to generated/word-of-day.json.");
pass("Generated Word of the Day data contains English/Hindi/Sanskrit/Meaning.");
pass("No dynamic rotation, runtime AI, backend or V02 action is recorded.");
pass("AG63Z Word of the Day Closure readiness is valid.");
