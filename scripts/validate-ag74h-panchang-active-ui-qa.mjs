import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) {
  console.error("❌ AG74H validation failed: " + message);
  process.exit(1);
}
function pass(message) { console.log("✅ " + message); }

const required = [
  "data/knowledge-base/panchang-festival/production/ag74h-panchang-active-ui-qa-checklist.json",
  "data/knowledge-base/panchang-festival/production/ag74h-panchang-active-browser-render-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74h-panchang-unsupported-input-ui-qa-contract.json",
  "data/quality/ag74h-panchang-active-ui-qa-evidence.json",
  "data/content-intelligence/mutation-plans/ag74h-to-ag74i-panchang-public-surface-stabilization-boundary.json",
  "data/content-intelligence/quality-registry/ag74h-ag74i-panchang-public-surface-stabilization-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag74h-panchang-active-ui-qa.json",
  "data/quality/ag74h-panchang-active-ui-qa.json",
  "data/quality/ag74h-panchang-active-ui-qa-preview.json",
  "docs/quality/AG74H_PANCHANG_ACTIVE_UI_QA.md",
  "generated/panchang-active-static-result-data.json",
  "data/content-intelligence/quality-registry/ag74g-ag74h-panchang-active-ui-qa-readiness-record.json"
];

for (const file of required) {
  if (!exists(file)) fail("Missing required file: " + file);
}

const ag74gReady = readJson("data/content-intelligence/quality-registry/ag74g-ag74h-panchang-active-ui-qa-readiness-record.json");
if (ag74gReady.status !== "ready_for_ag74h_panchang_active_ui_qa") fail("AG74G readiness status mismatch.");

const indexHtml = read("index.html");
if (!indexHtml.includes("generated/panchang-active-static-result-data.json")) fail("index.html missing active static data source.");
if (!indexHtml.includes("AG74G_PANCHANG_ACTIVE_DATA_WIRING_START")) fail("index.html missing AG74G marker.");

const qaEvidence = readJson("data/quality/ag74h-panchang-active-ui-qa-evidence.json");
if (qaEvidence.status !== "ag74h_active_ui_qa_evidence_clean") fail("AG74H QA evidence is not clean.");
if (qaEvidence.issue_count !== 0) fail('AG74H QA evidence has issues.');
if (qaEvidence.checks.backend_runtime_activated !== false) fail('Backend runtime was activated.');
if (qaEvidence.checks.supabase_activation_performed !== false) fail('Supabase was activated.');
if (qaEvidence.checks.personal_data_storage_enabled !== false) fail('Personal data storage was enabled.');

const contract = readJson("data/knowledge-base/panchang-festival/production/ag74h-panchang-active-browser-render-contract.json");
if (contract.status !== "ag74h_browser_render_contract_locked") fail("Browser render contract status mismatch.");
if (contract.ui_copy_policy.restore_preview_copy !== false) fail('Preview copy restoration must remain false.');
if (contract.ui_copy_policy.restore_locked_copy !== false) fail('Locked copy restoration must remain false.');

const unsupported = readJson("data/knowledge-base/panchang-festival/production/ag74h-panchang-unsupported-input-ui-qa-contract.json");
if (unsupported.blocked_runtime_actions.backend_runtime_activated !== false) fail('Unsupported route backend flag changed.');
if (unsupported.blocked_runtime_actions.live_ephemeris_api_dependency_enabled !== false) fail('Unsupported route live API flag changed.');

const readiness = readJson("data/content-intelligence/quality-registry/ag74h-ag74i-panchang-public-surface-stabilization-readiness-record.json");
if (readiness.status !== "ready_for_ag74i_panchang_public_surface_stabilization") fail("AG74I readiness status mismatch.");
if (readiness.readiness_checks.backend_runtime_activated !== false) fail('Backend readiness flag changed.');

const quality = readJson("data/quality/ag74h-panchang-active-ui-qa.json");
if (quality.status !== "ag74h_completed") fail("AG74H quality status mismatch.");
if (quality.issue_count !== 0) fail('AG74H issue count must be zero.');

pass("AG74H Panchang active UI QA is valid.");
pass("AG74I Panchang public surface stabilization is ready.");
pass("No backend, Supabase, storage, live API dependency or production authority claim is enabled.");
