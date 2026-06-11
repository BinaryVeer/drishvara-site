import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function fail(message) {
  console.error(`❌ AG71P validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const adapterContractPath = "data/knowledge-base/panchang-festival/production/ag71o-public-blocked-ui-preview-adapter-contract.json";
const adapterLookupPath = "data/knowledge-base/panchang-festival/production/ag71o-public-blocked-ui-preview-adapter-lookup.json";
const adapterValidationPath = "data/knowledge-base/panchang-festival/production/ag71o-ui-preview-adapter-validation-report.json";
const manifestPath = "data/knowledge-base/panchang-festival/production/production-bank-manifest.json";

for (const file of [adapterContractPath, adapterLookupPath, adapterValidationPath, manifestPath, "index.html"]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const adapterContract = readJson(adapterContractPath);
const adapterLookup = readJson(adapterLookupPath);
const adapterValidation = readJson(adapterValidationPath);
const manifest = readJson(manifestPath);
const indexHtml = fs.readFileSync(full("index.html"), "utf8");

if (adapterContract.status !== "ag71o_public_blocked_ui_preview_adapter_contract_created") fail("AG71O adapter contract status mismatch.");
if (adapterLookup.status !== "ag71o_adapter_lookup_created") fail("AG71O adapter lookup status mismatch.");
if (adapterValidation.status !== "ag71o_adapter_validation_passed") fail("AG71O adapter validation has not passed.");
if (adapterLookup.records.length !== 28 || adapterLookup.adapter_record_count !== 28) fail("AG71O adapter lookup must contain 28 records.");

const requiredUiMarkers = [
  "Panchang & Festival View",
  "panchang-place-select"
];

for (const marker of requiredUiMarkers) {
  if (!indexHtml.includes(marker)) fail(`index.html missing Panchang UI marker: ${marker}`);
}

const wiringTargets = [
  {
    ui_area: "panchang_location_selector",
    current_marker: "panchang-place-select",
    adapter_input: "selected_location_id",
    status: "existing_target_confirmed"
  },
  {
    ui_area: "panchang_preview_action",
    current_marker: "Preview Panchang",
    adapter_input: "selected_date_key",
    status: indexHtml.includes("Preview Panchang") ? "existing_target_confirmed" : "label_contract_required"
  },
  {
    ui_area: "panchang_output_panel",
    current_marker: "Panchang & Festival View",
    adapter_output: "internal_preview_record_id",
    status: "existing_panel_contract_required"
  },
  {
    ui_area: "upcoming_observance_panel",
    current_marker: "Upcoming Observance",
    adapter_output: "observance_context_future_gate",
    status: indexHtml.includes("Upcoming Observance") ? "existing_target_confirmed" : "future_target_required"
  }
];

const contractPath = "data/knowledge-base/panchang-festival/production/ag71p-panchang-ui-preview-wiring-contract.json";
const targetMapPath = "data/knowledge-base/panchang-festival/production/ag71p-panchang-ui-preview-target-map.json";
const noPublicAuditPath = "data/knowledge-base/panchang-festival/production/ag71p-no-public-output-wiring-contract-audit.json";
const readinessPath = "data/content-intelligence/quality-registry/ag71p-ag71q-panchang-ui-preview-implementation-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag71p-to-ag71q-panchang-ui-preview-implementation-boundary.json";

writeJson(contractPath, {
  module_id: "AG71P",
  title: "Panchang UI Preview Wiring Contract",
  status: "ag71p_panchang_ui_preview_wiring_contract_created",
  source_adapter_contract: adapterContractPath,
  source_adapter_lookup: adapterLookupPath,
  source_index_file: "index.html",
  purpose: "Define controlled wiring between existing Panchang UI selection and AG71O public-blocked adapter records.",
  contract_scope: {
    adapter_record_count: adapterLookup.records.length,
    pilot_location_count: 4,
    pilot_date_count: 7,
    index_html_modified_now: false,
    exact_values_rendered_now: false,
    public_output_allowed_now: false
  },
  wiring_rules: {
    selected_location_must_resolve_to_ag71o_adapter_key: true,
    selected_date_must_remain_within_pilot_date_bank: true,
    output_may_reference_internal_preview_record_id: true,
    exact_value_rendering_requires_next_implementation_gate: true,
    pilot_label_required: true,
    verification_label_required: true,
    no_backend_or_supabase: true,
    no_full_location_bank_scale_up: true
  },
  blocked_now: [
    "index.html exact-value mutation",
    "public exact Panchang value rendering",
    "generated public Panchang working-data replacement",
    "backend runtime activation",
    "Supabase activation",
    "full location-bank scale-up"
  ],
  next_step: {
    module_id: "AG71Q",
    title: "Panchang UI Preview Implementation",
    purpose: "Implement controlled, pilot-labelled UI preview using AG71O adapter and AG71M preview bank, while preserving public-blocking language."
  }
});

writeJson(targetMapPath, {
  module_id: "AG71P",
  title: "Panchang UI Preview Target Map",
  status: "ag71p_panchang_ui_preview_target_map_created",
  source_index_file: "index.html",
  wiring_targets: wiringTargets,
  implementation_notes: [
    "Use existing Panchang output area; do not create duplicate floating panels.",
    "Selected location must map through AG71O adapter lookup.",
    "Exact values must be labelled as pilot/internal verification preview if rendered in AG71Q.",
    "Upcoming Observance must not be overwritten by Panchang preview status text.",
    "Typography and wrapping must be handled in the final UI QA gate."
  ]
});

writeJson(noPublicAuditPath, {
  module_id: "AG71P",
  title: "No Public Output Wiring Contract Audit",
  status: "ag71p_no_public_output_wiring_contract_audit_passed",
  checks: {
    index_html_modified_now: false,
    exact_values_rendered_now: false,
    generated_public_panchang_file_modified: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    full_location_bank_scale_up_performed: false
  }
});

writeJson(readinessPath, {
  module_id: "AG71P-AG71Q",
  title: "AG71Q Panchang UI Preview Implementation Readiness",
  status: "ready_for_ag71q_panchang_ui_preview_implementation",
  ag71p_consumed: true,
  hard_blockers_for_ag71q: [],
  controlled_requirements_for_ag71q: [
    "Implement only four-location pilot preview.",
    "Use existing Panchang panel; avoid duplicate output areas.",
    "Keep pilot and verification labelling visible.",
    "Preserve upcoming observance section.",
    "No backend or Supabase activation.",
    "No full location-bank scale-up."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG71P",
  to_module: "AG71Q",
  transition: "panchang_ui_preview_implementation",
  allowed_next_actions: [
    "Modify index.html for controlled pilot preview wiring.",
    "Resolve selected pilot location/date through AG71O adapter.",
    "Render pilot-labelled exact preview values in existing Panchang panel.",
    "Keep upcoming observance separate."
  ],
  blocked_actions: [
    "Unlabelled public exact-value publication.",
    "Backend runtime activation.",
    "Supabase activation.",
    "Full location-bank scale-up.",
    "Replacing generated public Panchang working-data as a production source."
  ]
});

writeJson("data/content-intelligence/quality-reviews/ag71p-panchang-ui-preview-wiring-contract.json", {
  module_id: "AG71P",
  title: "Panchang UI Preview Wiring Contract Review",
  status: "ag71p_completed",
  generated_records: {
    wiring_contract: contractPath,
    target_map: targetMapPath,
    no_public_output_audit: noPublicAuditPath,
    ag71q_readiness: readinessPath,
    ag71q_boundary: boundaryPath
  },
  summary: {
    contract_created: true,
    target_map_created: true,
    index_html_modified_now: false,
    exact_values_rendered_now: false,
    ready_for_ag71q: true
  }
});

writeJson("data/quality/ag71p-panchang-ui-preview-wiring-contract.json", {
  module_id: "AG71P",
  status: "ag71p_completed",
  contract_created: true,
  public_output_allowed_now: false
});

writeJson("data/quality/ag71p-panchang-ui-preview-wiring-contract-preview.json", {
  module_id: "AG71P",
  status: "ag71p_completed",
  contract_created: 1,
  index_html_modified_now: 0,
  exact_values_rendered_now: 0,
  ready_for_ag71q: 1
});

writeText("docs/quality/AG71P_PANCHANG_UI_PREVIEW_WIRING_CONTRACT.md",
`# AG71P — Panchang UI Preview Wiring Contract

AG71P defines the controlled wiring contract for connecting the existing Panchang UI to AG71O adapter records.

## What Was Done

- Confirmed existing Panchang UI targets.
- Created the UI preview wiring contract.
- Created the target map for AG71Q implementation.
- Kept index.html unchanged.

## Still Blocked

- Unlabelled public exact-value publication
- Backend runtime activation
- Supabase activation
- Full location-bank scale-up
- Production replacement of public Panchang generated data

## Next Step

AG71Q should implement controlled pilot-labelled UI preview wiring in index.html.
`);

manifest.ag71p_files = {
  panchang_ui_preview_wiring_contract: contractPath,
  panchang_ui_preview_target_map: targetMapPath,
  no_public_output_wiring_contract_audit: noPublicAuditPath
};

manifest.current_counts = {
  ...(manifest.current_counts || {}),
  ag71p_wiring_contract_records: 1,
  ag71p_target_map_records: 1
};

manifest.current_status = "ag71p_panchang_ui_preview_wiring_contract_created_ag71q_ready";
writeJson(manifestPath, manifest);

pass("AG71P Panchang UI preview wiring contract is valid.");
pass("AG71Q implementation is ready.");
pass("index.html remains unchanged in AG71P.");
