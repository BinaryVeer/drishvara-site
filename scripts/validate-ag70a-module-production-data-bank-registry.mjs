import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70a-module-production-data-bank-registry.mjs",
  "scripts/validate-ag70a-module-production-data-bank-registry.mjs",
  "data/knowledge-base/production-data-bank-registry/ag70a-module-production-data-bank-registry.json",
  "data/knowledge-base/production-data-bank-registry/ag70a-methodology-to-databank-connector-map.json",
  "data/knowledge-base/production-data-bank-registry/ag70a-common-production-bank-lifecycle.json",
  "data/knowledge-base/production-data-bank-registry/ag70a-production-record-schema-contract.json",
  "data/knowledge-base/production-data-bank-registry/ag70a-production-bank-target-plan.json",
  "data/knowledge-base/production-data-bank-registry/ag70a-production-bank-validation-plan.json",
  "data/content-intelligence/quality-reviews/ag70a-module-production-data-bank-registry.json",
  "data/content-intelligence/quality-registry/ag70a-ag70b-word-production-data-bank-batch-01-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70a-to-ag70b-word-production-data-bank-batch-01-boundary.json",
  "data/quality/ag70a-module-production-data-bank-registry.json",
  "data/quality/ag70a-module-production-data-bank-registry-preview.json",
  "docs/quality/AG70A_MODULE_PRODUCTION_DATA_BANK_REGISTRY.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70a"]) fail("Missing generate:ag70a script.");
if (!pkg.scripts?.["validate:ag70a"]) fail("Missing validate:ag70a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70a")) {
  fail("validate:project must include validate:ag70a.");
}

const registry = readJson("data/knowledge-base/production-data-bank-registry/ag70a-module-production-data-bank-registry.json");
if (registry.status !== "module_production_data_bank_registry_created") fail("Registry status mismatch.");
if (registry.storage_mode_now !== "github_static_json_first") fail("Storage mode must be GitHub static JSON first.");
if (registry.supabase_mode_now !== "deferred_not_active") fail("Supabase must remain deferred.");
if (registry.module_count !== 8) fail("Registry must include 8 modules.");

for (const entry of registry.modules) {
  if (!entry.production_path || !entry.production_manifest_path) fail(`Missing production path for ${entry.module_id}.`);
  if (!exists(entry.production_manifest_path)) fail(`Missing production manifest for ${entry.module_id}.`);
  if (entry.current_counts.candidate_records !== 0) fail(`${entry.module_id} candidate count must be 0 in AG70A.`);
  if (entry.current_counts.approved_records !== 0) fail(`${entry.module_id} approved count must be 0 in AG70A.`);
}

const word = registry.modules.find((entry) => entry.module_id === "word_of_day");
if (!word) fail("word_of_day registry entry missing.");
if (word.minimum_production_target !== 108) fail("Word target must be 108.");
if (word.production_path !== "data/knowledge-base/word-of-day/production") fail("Word production path mismatch.");

const connector = readJson("data/knowledge-base/production-data-bank-registry/ag70a-methodology-to-databank-connector-map.json");
if (connector.status !== "methodology_to_databank_connector_map_created") fail("Connector map status mismatch.");
if (connector.connectors.length !== 8) fail("Connector map must include 8 connectors.");
for (const c of connector.connectors) {
  if (c.runtime_consumption_allowed_now !== false) fail(`${c.module_id} runtime consumption must be false.`);
}

const lifecycle = readJson("data/knowledge-base/production-data-bank-registry/ag70a-common-production-bank-lifecycle.json");
if (lifecycle.status !== "common_production_bank_lifecycle_defined") fail("Lifecycle status mismatch.");
for (const stage of ["candidate", "reviewed", "approved", "output_eligible"]) {
  if (!lifecycle.lifecycle.some((item) => item.stage === stage)) fail(`Lifecycle stage missing: ${stage}`);
}

const schema = readJson("data/knowledge-base/production-data-bank-registry/ag70a-production-record-schema-contract.json");
if (schema.status !== "production_record_schema_contract_created") fail("Schema contract status mismatch.");
for (const field of ["record_id", "module_id", "source_reference_ids", "review_status", "public_use_permission"]) {
  if (!schema.common_required_fields.includes(field)) fail(`Common schema field missing: ${field}`);
}
for (const field of ["word_id", "english", "hindi", "sanskrit", "meaning_en", "meaning_hi", "source_reference_ids"]) {
  if (!schema.module_specific_required_fields.word_of_day.includes(field)) fail(`Word schema field missing: ${field}`);
}

const targets = readJson("data/knowledge-base/production-data-bank-registry/ag70a-production-bank-target-plan.json");
if (targets.status !== "production_bank_target_plan_created") fail("Target plan status mismatch.");
if (targets.targets.length !== 8) fail("Target plan must include 8 targets.");
if (!targets.targets.some((t) => t.module_id === "word_of_day" && t.minimum_production_target === 108)) {
  fail("Word target plan missing 108 target.");
}

const review = readJson("data/content-intelligence/quality-reviews/ag70a-module-production-data-bank-registry.json");
if (review.status !== "ag70a_module_production_data_bank_registry_completed") fail("Review status mismatch.");

for (const key of [
  "module_registry_created",
  "methodology_to_databank_connector_map_created",
  "common_lifecycle_defined",
  "schema_contract_created",
  "target_plan_created",
  "validation_plan_created",
  "production_manifest_created_for_all_modules",
  "github_static_json_storage_selected",
  "ready_for_ag70b"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "supabase_activation_performed",
  "production_content_records_created_now",
  "word_production_bank_filled_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "runtime_selector_active_now",
  "backend_runtime_activated",
  "database_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70a-ag70b-word-production-data-bank-batch-01-readiness-record.json");
if (readiness.ready_for_ag70b !== true) fail("AG70B readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70a-to-ag70b-word-production-data-bank-batch-01-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocker of [
  "generated/word-of-day.json replacement",
  "homepage UI change",
  "runtime selector activation",
  "Supabase/database writes",
  "AI-fabricated Sanskrit or meaning records"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) {
    fail(`Boundary blocker missing: ${blocker}`);
  }
}

pass("AG70A production data-bank registry is valid.");
pass("All 8 module production bank manifests exist.");
pass("Methodology-to-databank connector map is valid.");
pass("Common lifecycle, schema contract, targets and validation plan are valid.");
pass("No production content, UI, output, Supabase or backend activation is recorded.");
