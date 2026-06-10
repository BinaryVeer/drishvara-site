import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG71I-A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag71i-a-computation-engine-extraction-plan.json",
  "data/content-intelligence/quality-reviews/ag71i-a-computation-engine-extraction-plan.json",
  "data/quality/ag71i-a-computation-engine-extraction-plan.json",
  "data/quality/ag71i-a-computation-engine-extraction-plan-preview.json",
  "docs/quality/AG71I_A_COMPUTATION_ENGINE_EXTRACTION_PLAN.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const plan = readJson("data/knowledge-base/panchang-festival/production/ag71i-a-computation-engine-extraction-plan.json");

if (plan.status !== "ag71i_a_engine_extraction_plan_created") fail("Plan status mismatch.");
if (plan.diagnostic_finding.ag70k_has_reusable_formula_logic !== true) fail("AG70K reusable logic finding missing.");
if (plan.diagnostic_finding.ag70k_hardcoded_timezone_offset_detected !== true) fail("Timezone risk must be recorded.");
if (plan.diagnostic_finding.ag71h_request_record_count !== 28) fail("AG71H request count must be 28.");

for (const key of [
  "engine_file_created",
  "four_location_computation_executed",
  "computed_records_written",
  "ui_exact_values_wired",
  "public_output_activated",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (plan.not_performed_in_this_step[key] !== false) fail(`${key} must remain false.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag71i-a-computation-engine-extraction-plan.json");
if (review.status !== "ag71i_a_completed") fail("Review status mismatch.");
if (review.summary.ready_for_ag71i_b_engine_creation !== true) fail("AG71I-B readiness missing.");

pass("AG71I-A computation engine extraction plan is valid.");
pass("No computation/public/backend/Supabase/UI exact-value activation performed.");
