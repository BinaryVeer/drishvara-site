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
  console.error(`❌ AG71R validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const indexPath = "index.html";
const pilotPath = "generated/panchang-pilot-preview-data.json";
const qRecordPath = "data/knowledge-base/panchang-festival/production/ag71q-r1-public-pilot-panchang-preview-implementation-record.json";
const qValidationPath = "data/knowledge-base/panchang-festival/production/ag71q-r1-public-pilot-panchang-preview-validation-report.json";
const qAuditPath = "data/knowledge-base/panchang-festival/production/ag71q-r1-no-production-release-audit.json";
const manifestPath = "data/knowledge-base/panchang-festival/production/production-bank-manifest.json";

for (const file of [indexPath, pilotPath, qRecordPath, qValidationPath, qAuditPath, manifestPath]) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const index = fs.readFileSync(full(indexPath), "utf8");
const pilot = readJson(pilotPath);
const qRecord = readJson(qRecordPath);
const qValidation = readJson(qValidationPath);
const qAudit = readJson(qAuditPath);
const manifest = readJson(manifestPath);

if (qRecord.status !== "ag71q_r1_public_pilot_preview_implementation_applied") fail("AG71Q-R1 implementation record status mismatch.");
if (qValidation.status !== "ag71q_r1_public_pilot_preview_validation_passed") fail("AG71Q-R1 validation report status mismatch.");
if (qValidation.issue_count !== 0) fail("AG71Q-R1 validation issue count must be zero.");
if (pilot.status !== "ag71q_r1_public_pilot_preview_data_created") fail("Pilot data status mismatch.");
if (!Array.isArray(pilot.records) || pilot.records.length !== 28) fail("Pilot data must contain 28 records.");

for (const marker of [
  "AG71Q_R1_PUBLIC_PILOT_PANCHANG_PREVIEW_STYLE_START",
  "AG71Q_R1_PUBLIC_PILOT_PANCHANG_PREVIEW_CONTROLLER_START",
  "generated/panchang-pilot-preview-data.json",
  "window.drishvaraAg71qR1PreviewPanchang",
  'data-ag71e-preview-button="panchang"',
  'data-drishvara-ag60i-panchang-preview-safe="true"',
  "upcoming-observance-title",
  "upcoming-observance-name",
  "upcoming-observance-note"
]) {
  if (!index.includes(marker)) fail(`index.html missing required marker: ${marker}`);
}

for (const forbidden of [
  "Krishna Paksha",
  "Krishna Ashtami",
  "Shatabhisha",
  "Vishkambha",
  "Balava",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
  "Ashwini",
  "Krittika",
  "Rohini"
]) {
  if (index.includes(forbidden)) fail(`index.html contains exact Panchang literal and must not: ${forbidden}`);
}

const expectedLocations = [
  "loc_in_ar_itanagar_capital_complex_001",
  "loc_in_dl_new_delhi_capital_001",
  "loc_in_jh_ranchi_city_001",
  "loc_jp_tokyo_capital_001"
];

const locationCounts = {};
const dateKeys = new Set();

for (const record of pilot.records) {
  locationCounts[record.preview_location_id] = (locationCounts[record.preview_location_id] || 0) + 1;
  dateKeys.add(record.preview_date);

  for (const field of [
    "preview_record_id",
    "preview_location_id",
    "preview_location_label",
    "preview_date",
    "preview_timezone",
    "preview_tithi",
    "preview_nakshatra",
    "preview_yoga",
    "preview_karana",
    "preview_paksha",
    "preview_vara"
  ]) {
    if (!record[field]) fail(`${record.preview_record_id || "unknown"} missing required field: ${field}`);
  }

  for (const blocked of [
    "public_output_allowed",
    "ui_output_allowed",
    "exact_value_publication_allowed",
    "generated_public_file_replacement_allowed",
    "index_html_wiring_allowed"
  ]) {
    if (record[blocked] !== false) fail(`${record.preview_record_id} must keep ${blocked}=false in source governance.`);
  }
}

for (const locationId of expectedLocations) {
  if (locationCounts[locationId] !== 7) {
    fail(`${locationId} must have exactly 7 pilot records; found ${locationCounts[locationId] || 0}`);
  }
}

if (dateKeys.size !== 7) fail(`Pilot preview must have 7 date keys; found ${dateKeys.size}`);

for (const [key, value] of Object.entries(qAudit.checks || {})) {
  if (key.includes("performed") || key.includes("activated") || key.includes("replaced")) {
    if (value !== false) fail(`AG71Q-R1 audit check must remain false: ${key}`);
  }
}

const qaRecordPath = "data/knowledge-base/panchang-festival/production/ag71r-panchang-public-pilot-qa-closure.json";
const browserChecklistPath = "data/knowledge-base/panchang-festival/production/ag71r-browser-manual-qa-checklist.json";
const noExpansionAuditPath = "data/knowledge-base/panchang-festival/production/ag71r-no-expansion-audit.json";
const transitionPath = "data/content-intelligence/quality-registry/ag71r-ag72a-star-reflection-method-lock-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag71r-to-ag72a-star-reflection-method-lock-boundary.json";

writeJson(qaRecordPath, {
  module_id: "AG71R",
  title: "Panchang Public Pilot QA & Closure",
  status: "ag71r_panchang_public_pilot_qa_static_closure_passed",
  source_ag71q_r1_record: qRecordPath,
  source_pilot_data: pilotPath,
  qa_summary: {
    static_qa_passed: true,
    pilot_preview_data_record_count: pilot.records.length,
    pilot_location_count: expectedLocations.length,
    pilot_date_count: dateKeys.size,
    exact_values_externalized_to_json: true,
    exact_values_not_embedded_in_index_html: true,
    existing_panchang_mini_table_reused: true,
    preview_button_target_present: true,
    upcoming_observance_preserved: true,
    browser_manual_qa_required_before_public_confidence: true
  },
  panchang_pilot_status: {
    pilot_preview_implementation_complete: true,
    production_release_complete: false,
    full_location_bank_scale_up_complete: false,
    backend_runtime_active: false,
    supabase_active: false
  },
  next_asset: {
    module_id: "AG72A",
    title: "Star Reflection Method Lock",
    purpose: "Lock Star Reflection basis after Panchang pilot preview foundation is complete."
  }
});

writeJson(browserChecklistPath, {
  module_id: "AG71R",
  title: "Browser Manual QA Checklist",
  status: "manual_browser_qa_pending_user_confirmation",
  checklist: [
    {
      item: "Click Preview Panchang for Itanagar",
      expected: "Existing mini-table updates with pilot-labelled values and no duplicate output panel."
    },
    {
      item: "Click Preview Panchang for New Delhi",
      expected: "Existing mini-table updates and location basis changes."
    },
    {
      item: "Click Preview Panchang for Ranchi",
      expected: "Existing mini-table updates and wrapping remains inside card."
    },
    {
      item: "Click Preview Panchang for Tokyo",
      expected: "Existing mini-table updates and timezone basis shows Asia/Tokyo."
    },
    {
      item: "Check Upcoming Observance",
      expected: "It remains separate and shows editorial-verification text, not overwritten as Panchang values."
    },
    {
      item: "Check mobile or narrow window",
      expected: "Mini-table rows wrap cleanly without text overflowing outside the card."
    }
  ],
  closure_note: "Static QA is passed. Browser manual QA should be confirmed by user screenshots before treating the visual pilot as fully accepted."
});

writeJson(noExpansionAuditPath, {
  module_id: "AG71R",
  title: "No Expansion Audit",
  status: "ag71r_no_expansion_audit_passed",
  checks: {
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    full_location_bank_scale_up_performed: false,
    production_panchang_release_performed: false,
    generated_public_working_data_replaced: false,
    observance_final_publication_performed: false
  }
});

writeJson(transitionPath, {
  module_id: "AG71R-AG72A",
  title: "AG72A Star Reflection Method Lock Readiness",
  status: "ready_for_ag72a_star_reflection_method_lock",
  ag71r_consumed: true,
  panchang_pilot_static_closure_passed: true,
  browser_manual_qa_pending: true,
  controlled_requirements_for_ag72a: [
    "Use Moon-led, Panchanga-supported, location-aware basis unless changed by explicit doctrine.",
    "Do not produce personalised deterministic predictions.",
    "Reuse Panchang pilot location/timezone foundations.",
    "Keep consent/privacy and reflective-output governance explicit."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG71R",
  to_module: "AG72A",
  transition: "star_reflection_method_lock",
  allowed_next_actions: [
    "Lock Star Reflection method basis.",
    "Map Star Reflection dependency on Panchang location/timezone method.",
    "Define non-predictive reflection constraints."
  ],
  blocked_actions: [
    "Personalised deterministic prediction.",
    "Sensitive profiling.",
    "Medical, legal, financial or decision-making claims.",
    "Backend runtime activation without approval.",
    "Supabase activation without approval."
  ]
});

writeJson("data/content-intelligence/quality-reviews/ag71r-panchang-public-pilot-qa-closure.json", {
  module_id: "AG71R",
  title: "Panchang Public Pilot QA & Closure Review",
  status: "ag71r_completed_static_qa_passed_browser_qa_pending",
  generated_records: {
    qa_closure: qaRecordPath,
    browser_manual_qa_checklist: browserChecklistPath,
    no_expansion_audit: noExpansionAuditPath,
    ag72a_readiness: transitionPath,
    ag72a_boundary: boundaryPath
  },
  summary: {
    panchang_pilot_static_qa_passed: true,
    browser_manual_qa_pending: true,
    ready_for_star_reflection_method_lock: true,
    production_release_complete: false
  }
});

writeJson("data/quality/ag71r-panchang-public-pilot-qa-closure.json", {
  module_id: "AG71R",
  status: "ag71r_completed_static_qa_passed_browser_qa_pending",
  static_qa_passed: true,
  browser_manual_qa_pending: true,
  ready_for_ag72a: true
});

writeJson("data/quality/ag71r-panchang-public-pilot-qa-closure-preview.json", {
  module_id: "AG71R",
  status: "ag71r_completed_static_qa_passed_browser_qa_pending",
  static_qa_passed: 1,
  browser_manual_qa_pending: 1,
  ready_for_ag72a: 1
});

writeText("docs/quality/AG71R_PANCHANG_PUBLIC_PILOT_QA_CLOSURE.md", `# AG71R — Panchang Public Pilot QA & Closure

AG71R performs static QA and closure review for the Panchang public pilot preview.

## Static QA Result

- Pilot records: ${pilot.records.length}
- Pilot locations: ${expectedLocations.length}
- Pilot dates: ${dateKeys.size}
- Exact values externalized to generated/panchang-pilot-preview-data.json
- Exact values not embedded in index.html
- Existing Panchang mini-table reused
- Upcoming Observance block preserved

## Manual Browser QA

Manual browser QA remains pending. The user should confirm the four pilot locations visually.

## Still Not Performed

- Backend runtime activation
- Supabase activation
- Full location-bank scale-up
- Production Panchang release
- Final observance publication

## Next Step

AG72A should lock the Star Reflection method basis.
`);

manifest.ag71r_files = {
  panchang_public_pilot_qa_closure: qaRecordPath,
  browser_manual_qa_checklist: browserChecklistPath,
  no_expansion_audit: noExpansionAuditPath
};

manifest.current_counts = {
  ...(manifest.current_counts || {}),
  ag71r_static_qa_issue_count: 0,
  ag71r_browser_manual_qa_pending: 1
};

manifest.current_status = "ag71r_panchang_public_pilot_static_qa_passed_browser_qa_pending_ag72a_ready";
writeJson(manifestPath, manifest);

pass("AG71R Panchang public pilot static QA passed.");
pass("Browser manual QA checklist created.");
pass("AG72A Star Reflection Method Lock is ready.");
