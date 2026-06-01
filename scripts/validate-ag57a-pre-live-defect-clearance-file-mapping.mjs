import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG57A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag56z-version-01-live-closure.json",
  "data/content-intelligence/content-loop/ag56z-pre-live-defect-list-record.json",
  "data/content-intelligence/quality-registry/ag56z-pre-live-defect-clearance-readiness-record.json",

  "data/content-intelligence/quality-reviews/ag57a-pre-live-defect-clearance-file-mapping.json",
  "data/content-intelligence/pre-live/ag57a-source-consumption-record.json",
  "data/content-intelligence/pre-live/ag57a-defect-file-mapping-record.json",
  "data/content-intelligence/pre-live/ag57a-to-ag57b-correction-target-plan.json",
  "data/content-intelligence/quality-registry/ag57a-ag57b-public-ui-content-correction-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag57a-to-ag57b-public-ui-content-correction-boundary.json",
  "data/quality/ag57a-pre-live-defect-clearance-file-mapping.json",
  "data/quality/ag57a-pre-live-defect-clearance-file-mapping-preview.json",
  "docs/quality/AG57A_PRE_LIVE_DEFECT_CLEARANCE_FILE_MAPPING.md",
  "scripts/generate-ag57a-pre-live-defect-clearance-file-mapping.mjs",
  "scripts/validate-ag57a-pre-live-defect-clearance-file-mapping.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag56z = readJson("data/content-intelligence/quality-reviews/ag56z-version-01-live-closure.json");
const ag56zDefects = readJson("data/content-intelligence/content-loop/ag56z-pre-live-defect-list-record.json");
const ag56zReady = readJson("data/content-intelligence/quality-registry/ag56z-pre-live-defect-clearance-readiness-record.json");

if (ag56z.status !== "version_01_live_closure_completed_conditionally") fail("AG56Z status mismatch.");
if (ag56zDefects.open_watch_item_count !== 5) fail("AG56Z defect count must be 5.");
if (ag56zReady.ready_for_pre_live_defect_clearance !== true) fail("AG56Z pre-live clearance readiness missing.");

const review = readJson("data/content-intelligence/quality-reviews/ag57a-pre-live-defect-clearance-file-mapping.json");
const fileMap = readJson("data/content-intelligence/pre-live/ag57a-defect-file-mapping-record.json");
const plan = readJson("data/content-intelligence/pre-live/ag57a-to-ag57b-correction-target-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag57a-ag57b-public-ui-content-correction-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag57a-to-ag57b-public-ui-content-correction-boundary.json");
const preview = readJson("data/quality/ag57a-pre-live-defect-clearance-file-mapping-preview.json");
const pkg = readJson("package.json");

if (review.status !== "pre_live_defect_clearance_file_mapping_ready_for_ag57b") fail("AG57A review status mismatch.");
if (review.summary.mapped_defect_count !== 5) fail("AG57A must map 5 defects.");
if (review.summary.ready_for_ag57b_public_ui_content_correction_patch !== true) fail("AG57B readiness missing.");
if (review.summary.ag57b_must_apply_actual_changes !== true) fail("AG57B actual-change requirement missing.");

if (fileMap.audit_passed !== true) fail("File map audit must pass.");
if (fileMap.defect_count !== 5) fail("File map defect count must be 5.");
if (fileMap.mapped_defects.length !== 5) fail("There must be five mapped defects.");

for (const defectId of [
  "public_copy_internal_ui_step_3_integration",
  "daily_signal_selection_rule_visibility",
  "discover_read_reflect_public_alignment",
  "sports_desk_loading_placeholders",
  "word_panchang_reflection_vedic_safety"
]) {
  if (!JSON.stringify(fileMap.mapped_defects).includes(defectId)) fail(`Missing mapped defect: ${defectId}`);
}

if (plan.status !== "ag57b_public_ui_content_correction_plan_recorded") fail("Correction plan status mismatch.");
if (plan.ag57b_must_apply_actual_changes !== true) fail("AG57B must be actual corrections.");
if (!plan.hard_boundary.includes("AG57B must not be another audit-only stage.")) fail("AG57B audit-only blocker missing.");

if (readiness.ready_for_ag57b !== true) fail("AG57B readiness must be true.");
if (readiness.next_stage_id !== "AG57B") fail("Readiness must point to AG57B.");
if (boundary.status !== "ag57b_public_ui_content_correction_boundary_created") fail("AG57B boundary mismatch.");

if (preview.ready_for_ag57b_public_ui_content_correction_patch !== 1) fail("Preview AG57B readiness missing.");

if (!pkg.scripts?.["generate:ag57a"]) fail("Missing package script: generate:ag57a");
if (!pkg.scripts?.["validate:ag57a"]) fail("Missing package script: validate:ag57a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag57a")) fail("validate:project must include validate:ag57a.");

pass("AG57A Pre-Live Defect Clearance File Mapping is present.");
pass("AG56Z pre-live defects are consumed.");
pass("Five defects are mapped.");
pass("AG57B correction target plan is valid.");
pass("AG57B is explicitly required to apply actual UI/content changes.");
pass("AG57B readiness is valid.");
