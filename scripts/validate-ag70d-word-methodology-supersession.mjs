import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70D validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70d-word-methodology-supersession.mjs",
  "scripts/validate-ag70d-word-methodology-supersession.mjs",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-word-of-the-day-methodology-v2.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-legacy-methodology-supersession-map.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-selection-flow-v2.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-primary-lexical-selection-rules.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-sacred-fallback-selection-rules.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-duplicate-control-and-history-rules.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-subscriber-archive-access-model.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-old-methodology-preservation-audit.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-no-output-ui-runtime-mutation-audit.json",
  "data/content-intelligence/quality-reviews/ag70d-word-methodology-supersession.json",
  "data/content-intelligence/quality-registry/ag70d-ag70e-word-production-knowledge-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70d-to-ag70e-word-production-knowledge-bank-boundary.json",
  "data/quality/ag70d-word-methodology-supersession.json",
  "data/quality/ag70d-word-methodology-supersession-preview.json",
  "docs/quality/AG70D_WORD_METHODOLOGY_SUPERSESSION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70d"]) fail("Missing generate:ag70d script.");
if (!pkg.scripts?.["validate:ag70d"]) fail("Missing validate:ag70d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70d")) {
  fail("validate:project must include validate:ag70d.");
}

const methodology = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-word-of-the-day-methodology-v2.json");
if (methodology.status !== "word_methodology_v2_supersession_defined_not_runtime_active") fail("Methodology v2 status mismatch.");
if (methodology.active_methodology_version !== "word_of_day_method_v2_panchang_context_sanskrit_lexical_engine") fail("Active methodology version mismatch.");
if (methodology.runtime_selector_active_now !== false) fail("Runtime selector must be inactive.");
if (methodology.public_word_generation_allowed_now !== false) fail("Public word generation must be false.");
for (const dep of ["panchang_context_connector", "lexical_engine_manifest", "morphology_schema", "etymology_schema", "semantics_schema", "fallback_schema"]) {
  if (!methodology.dependencies?.[dep]) fail(`Methodology dependency missing: ${dep}`);
}
for (const rule of ["No AI-invented Sanskrit word.", "No unsupported etymology.", "No mantra creation or alteration."]) {
  if (!methodology.hard_rules.includes(rule)) fail(`Hard rule missing: ${rule}`);
}

const supersession = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-legacy-methodology-supersession-map.json");
if (supersession.status !== "legacy_word_methodology_supersession_mapped_no_deletion") fail("Legacy supersession status mismatch.");
if (!Array.isArray(supersession.deleted_now) || supersession.deleted_now.length !== 0) fail("AG70D must not delete old methodology files.");
for (const p of [
  "data/methodology/word-of-day/ag63a-word-of-the-day-methodology.json",
  "data/methodology/word-of-day/ag63a-word-selection-rotation-policy.json",
  "data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json"
]) {
  if (!exists(p)) fail(`Legacy file must be preserved: ${p}`);
}

const flow = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-selection-flow-v2.json");
if (flow.status !== "word_selection_flow_v2_defined_not_runtime_active") fail("Selection flow status mismatch.");
const flowNames = flow.flow.map((x) => x.name);
for (const name of ["panchang_day_context", "context_interpretation", "morphology_engine", "etymology_engine", "semantics_engine", "primary_or_fallback_selection", "duplicate_control", "datewise_result_saving"]) {
  if (!flowNames.includes(name)) fail(`Selection flow step missing: ${name}`);
}

const primary = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-primary-lexical-selection-rules.json");
if (primary.status !== "primary_lexical_selection_rules_defined_not_runtime_active") fail("Primary rules status mismatch.");
if (primary.primary_selection_allowed_now !== false) fail("Primary selection must be inactive.");
for (const gate of ["approved_lexical_record_exists", "morphology_status_established_or_review_approved", "semantics_status_supported", "duplicate_control_passed"]) {
  if (!primary.required_gates.includes(gate)) fail(`Primary gate missing: ${gate}`);
}
if (primary.etymology_handling.not_established !== "Do not fabricate. Route to fallback bank or semantic-only path only if separately approved.") {
  fail("not_established etymology handling mismatch.");
}

const fallback = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-sacred-fallback-selection-rules.json");
if (fallback.status !== "sacred_fallback_selection_rules_defined_not_runtime_active") fail("Fallback rules status mismatch.");
for (const bank of ["vishnu_sahasranama_bank", "shiva_sahasranama_bank", "vedic_term_bank", "puranic_name_theme_bank"]) {
  if (!fallback.approved_fallback_bank_classes.includes(bank)) fail(`Fallback bank class missing: ${bank}`);
}

const duplicate = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-duplicate-control-and-history-rules.json");
if (duplicate.status !== "duplicate_control_and_history_rules_defined_not_runtime_active") fail("Duplicate/history rules status mismatch.");
if (duplicate.duplicate_control_active_now !== false) fail("Duplicate control runtime must be inactive.");
for (const field of ["date_key", "panchang_context_id", "selection_path", "duplicate_check_status", "published_status"]) {
  if (!duplicate.daily_result_required_fields.includes(field)) fail(`Daily result field missing: ${field}`);
}

const archive = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-subscriber-archive-access-model.json");
if (archive.status !== "subscriber_archive_access_model_defined_not_runtime_active") fail("Subscriber archive status mismatch.");
if (archive.subscriber_archive_active_now !== false) fail("Subscriber archive must be inactive.");

const audit = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-no-output-ui-runtime-mutation-audit.json");
if (audit.status !== "no_output_ui_runtime_mutation_audit_passed") fail("No-output audit status mismatch.");
for (const key of ["generated_word_json_modified", "ui_display_changed", "runtime_selector_active_now", "public_word_generation_allowed_now", "supabase_activation_performed", "backend_runtime_activated", "old_methodology_deleted_now"]) {
  if (audit[key] !== false) fail(`${key} must be false.`);
}

const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
if (wordManifest.status !== "production_bank_manifest_created_word_methodology_v2_superseded") fail("Word manifest status mismatch.");
if (wordManifest.active_methodology_version !== "word_of_day_method_v2_panchang_context_sanskrit_lexical_engine") fail("Word manifest active methodology mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag70d-word-methodology-supersession.json");
if (review.status !== "ag70d_word_methodology_supersession_completed") fail("Review status mismatch.");

for (const key of [
  "word_methodology_v2_created",
  "old_rotation_method_superseded",
  "legacy_supersession_map_created",
  "selection_flow_v2_defined",
  "primary_lexical_selection_rules_defined",
  "fallback_selection_rules_defined",
  "duplicate_history_rules_defined",
  "subscriber_archive_model_defined",
  "word_manifest_updated_with_methodology_v2",
  "ready_for_ag70e"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "old_methodology_files_deleted_now",
  "actual_lexical_records_created_now",
  "actual_fallback_records_created_now",
  "daily_word_records_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "runtime_selector_active_now",
  "public_word_generation_allowed_now",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const next = readJson("data/content-intelligence/quality-registry/ag70d-ag70e-word-production-knowledge-bank-readiness-record.json");
if (next.ready_for_ag70e !== true) fail("AG70E readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70d-to-ag70e-word-production-knowledge-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocker of [
  "generated/word-of-day.json replacement",
  "homepage UI change",
  "runtime selector activation",
  "AI-fabricated Sanskrit or meaning records",
  "unsupported etymology",
  "public Word output"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) {
    fail(`Boundary blocker missing: ${blocker}`);
  }
}

pass("AG70D Word methodology supersession is valid.");
pass("Methodology v2 is defined and old rotation method is superseded as legacy/reference.");
pass("Selection flow, primary rules, fallback rules, duplicate/history rules and subscriber archive model are valid.");
pass("No old methodology deletion, output mutation, UI change, runtime activation or backend activation is recorded.");
