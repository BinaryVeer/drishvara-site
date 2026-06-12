import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function records(data) {
  if (Array.isArray(data)) return data;
  for (const key of ["records", "active_records", "results", "samples"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}
function fail(message) {
  console.error("❌ AG74G validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }

const required = [
  "generated/panchang-active-static-result-data.json",
  "data/knowledge-base/panchang-festival/production/ag74g-panchang-active-data-wiring-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74g-panchang-active-data-adapter-map.json",
  "data/knowledge-base/panchang-festival/production/ag74g-panchang-runtime-data-source-marker.json",
  "data/content-intelligence/mutation-plans/ag74g-to-ag74h-panchang-active-ui-qa-boundary.json",
  "data/content-intelligence/quality-registry/ag74g-ag74h-panchang-active-ui-qa-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag74g-panchang-active-data-wiring.json",
  "data/quality/ag74g-panchang-active-data-wiring.json",
  "data/quality/ag74g-panchang-active-data-wiring-preview.json",
  "docs/quality/AG74G_PANCHANG_ACTIVE_DATA_WIRING.md",
  "generated/panchang-static-engine-results.json",
  "data/content-intelligence/quality-registry/ag74f-ag74g-panchang-active-data-wiring-readiness-record.json"
];

for (const file of required) {
  if (!exists(file)) fail("Missing required file: " + file);
}

const activeData = readJson("generated/panchang-active-static-result-data.json");
const activeRecords = records(activeData);
if (activeData.status !== 'ag74g_active_static_result_data_ready') fail('Active data status mismatch.');
if (activeRecords.length < 12) fail('Active data record count must be at least 12.');

for (const field of ["preview_location_label", "preview_timezone", "preview_date", "preview_tithi", "preview_nakshatra", "preview_yoga", "preview_karana", "calculation_status"]) {
  if (!activeRecords.every((record) => field in record)) fail('Active data record missing field: ' + field);
}

const contract = readJson("data/knowledge-base/panchang-festival/production/ag74g-panchang-active-data-wiring-contract.json");
if (contract.status !== 'ag74g_active_data_wiring_contract_locked_ag74h_ready') fail('Wiring contract status mismatch.');
if (contract.runtime_policy.backend_runtime_activated !== false) fail('Backend runtime was activated.');
if (contract.runtime_policy.supabase_activation_performed !== false) fail('Supabase was activated.');
if (contract.runtime_policy.personal_data_storage_enabled !== false) fail('Personal data storage was enabled.');
if (contract.runtime_policy.live_ephemeris_api_dependency_enabled !== false) fail('Live ephemeris API dependency was enabled.');

const indexHtml = read('index.html');
if (!indexHtml.includes("generated/panchang-active-static-result-data.json")) fail("index.html missing active Panchang data source.");
if (!indexHtml.includes('AG74G_PANCHANG_ACTIVE_DATA_WIRING_START')) fail('index.html missing AG74G wiring marker.');

const readiness = readJson("data/content-intelligence/quality-registry/ag74g-ag74h-panchang-active-ui-qa-readiness-record.json");
if (readiness.status !== 'ready_for_ag74h_panchang_active_ui_qa') fail('AG74H readiness status mismatch.');
if (readiness.readiness_checks.backend_runtime_activated !== false) fail('Backend runtime readiness flag changed.');

const quality = readJson("data/quality/ag74g-panchang-active-data-wiring.json");
if (quality.status !== 'ag74g_completed') fail('AG74G quality status mismatch.');
if (quality.issue_count !== 0) fail('AG74G issue count must be zero.');

pass("AG74G Panchang active data wiring is valid.");
pass("AG74H Panchang active UI QA is ready.");
pass("No backend, Supabase, storage, live API dependency or production authority claim is enabled.");
