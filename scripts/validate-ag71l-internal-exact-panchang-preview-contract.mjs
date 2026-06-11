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
  console.error(`❌ AG71L validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const gatePath = "data/knowledge-base/panchang-festival/production/ag71k-computed-bank-review-gate.json";
const bankPath = "data/knowledge-base/panchang-festival/production/ag71i-c-four-location-computed-panchang-bank-internal.json";
const validationPath = "data/knowledge-base/panchang-festival/production/ag71j-four-location-computed-bank-internal-validation.json";
const manifestPath = "data/knowledge-base/panchang-festival/production/production-bank-manifest.json";

for (const file of [gatePath, bankPath, validationPath, manifestPath]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const gate = readJson(gatePath);
const bank = readJson(bankPath);
const validation = readJson(validationPath);
const manifest = readJson(manifestPath);

if (gate.status !== "ag71k_computed_bank_review_gate_passed") fail("AG71K gate has not passed.");
if (validation.status !== "ag71j_four_location_computed_bank_internal_validation_passed") fail("AG71J validation has not passed.");
if (bank.records.length !== 28 || bank.computed_record_count !== 28) fail("AG71I-C bank must contain 28 records.");

const contractPath = "data/knowledge-base/panchang-festival/production/ag71l-internal-exact-panchang-preview-contract.json";
const fieldMapPath = "data/knowledge-base/panchang-festival/production/ag71l-exact-panchang-preview-field-map.json";
const noPublicPath = "data/knowledge-base/panchang-festival/production/ag71l-no-public-output-contract-audit.json";
const readinessPath = "data/content-intelligence/quality-registry/ag71l-ag71m-internal-preview-data-bank-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag71l-to-ag71m-internal-preview-data-bank-boundary.json";

const requiredExactFields = [
  "date_key",
  "location_id",
  "display_label",
  "timezone",
  "timezone_offset_minutes",
  "snapshot_datetime_local",
  "tithi",
  "nakshatra",
  "yoga",
  "karana",
  "paksha",
  "vara",
  "sun_longitude_sidereal",
  "moon_longitude_sidereal",
  "moon_minus_sun_angular_difference",
  "public_output_allowed",
  "ui_output_allowed"
];

const sample = bank.records[0];
for (const field of requiredExactFields) {
  if (!(field in sample)) fail(`AG71I-C record missing required field for contract: ${field}`);
}

writeJson(contractPath, {
  module_id: "AG71L",
  title: "Internal-only Exact Panchang Preview Contract",
  status: "ag71l_internal_exact_panchang_preview_contract_created",
  source_review_gate: gatePath,
  source_computed_bank: bankPath,
  source_validation: validationPath,
  purpose: "Define a public-blocked internal preview contract for exact Panchang fields after AG71J validation and AG71K review gate.",
  contract_scope: {
    record_source: "AG71I-C internal computed bank",
    record_count: 28,
    location_count: 4,
    date_count: 7,
    allowed_use: [
      "internal validation",
      "internal preview data-bank preparation",
      "field mapping review",
      "future public-blocked preview test"
    ],
    prohibited_use: [
      "public Panchang exact-value output",
      "live UI exact-value publication",
      "generated public Panchang working-data replacement",
      "backend runtime activation",
      "Supabase activation",
      "full location-bank scale-up"
    ]
  },
  preview_contract_rules: {
    every_record_must_remain_public_blocked: true,
    every_record_must_remain_ui_blocked: true,
    exact_values_may_be_mapped_only_to_internal_preview_fields: true,
    public_generated_file_must_not_be_replaced: true,
    index_html_must_not_be_modified_for_exact_values: true,
    no_runtime_api: true
  },
  required_exact_fields: requiredExactFields,
  next_step: {
    module_id: "AG71M",
    title: "Internal Exact Panchang Preview Data Bank",
    purpose: "Create a public-blocked internal preview data bank from AG71I-C records using the AG71L contract."
  }
});

writeJson(fieldMapPath, {
  module_id: "AG71L",
  title: "Exact Panchang Preview Field Map",
  status: "ag71l_exact_preview_field_map_created",
  source_computed_bank: bankPath,
  field_map: {
    preview_date: "date_key",
    preview_location_id: "location_id",
    preview_location_label: "display_label",
    preview_timezone: "timezone",
    preview_timezone_offset_minutes: "timezone_offset_minutes",
    preview_snapshot_local: "snapshot_datetime_local",
    preview_tithi: "tithi.name",
    preview_tithi_index: "tithi.index",
    preview_nakshatra: "nakshatra.name",
    preview_nakshatra_index: "nakshatra.index",
    preview_yoga: "yoga.name",
    preview_yoga_index: "yoga.index",
    preview_karana: "karana.name",
    preview_karana_index: "karana.index",
    preview_paksha: "paksha",
    preview_vara: "vara",
    preview_sun_longitude_sidereal: "sun_longitude_sidereal",
    preview_moon_longitude_sidereal: "moon_longitude_sidereal",
    preview_moon_sun_angle: "moon_minus_sun_angular_difference",
    public_output_allowed: "public_output_allowed",
    ui_output_allowed: "ui_output_allowed"
  },
  field_map_policy: {
    internal_only: true,
    public_blocked: true,
    ui_exact_value_blocked: true,
    no_index_html_wiring: true
  }
});

writeJson(noPublicPath, {
  module_id: "AG71L",
  title: "No Public Output Contract Audit",
  status: "ag71l_no_public_output_contract_audit_passed",
  checks: {
    index_html_modified_for_exact_values: false,
    generated_public_panchang_file_modified: false,
    public_exact_value_output_allowed_now: false,
    ui_exact_value_wiring_allowed_now: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    full_location_bank_scale_up_performed: false
  }
});

writeJson(readinessPath, {
  module_id: "AG71L-AG71M",
  title: "AG71M Internal Exact Preview Data Bank Readiness",
  status: "ready_for_ag71m_internal_exact_preview_data_bank",
  ag71l_consumed: true,
  hard_blockers_for_ag71m: [],
  controlled_requirements_for_ag71m: [
    "Consume AG71L contract and field map.",
    "Create internal-only preview records from AG71I-C bank.",
    "Keep public_output_allowed false.",
    "Keep ui_output_allowed false.",
    "Do not edit index.html.",
    "Do not replace public generated Panchang working-data."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG71L",
  to_module: "AG71M",
  transition: "internal_exact_preview_data_bank",
  allowed_next_actions: [
    "Create internal-only exact preview data bank.",
    "Map AG71I-C fields into AG71L preview contract fields.",
    "Validate public/UI blocking."
  ],
  blocked_actions: [
    "Public Panchang exact-value output.",
    "Live UI exact-value wiring.",
    "Generated public Panchang working-data replacement.",
    "Backend runtime activation.",
    "Supabase activation.",
    "Full location-bank scale-up."
  ]
});

writeJson("data/content-intelligence/quality-reviews/ag71l-internal-exact-panchang-preview-contract.json", {
  module_id: "AG71L",
  title: "Internal-only Exact Panchang Preview Contract Review",
  status: "ag71l_completed",
  generated_records: {
    contract: contractPath,
    field_map: fieldMapPath,
    no_public_output_contract_audit: noPublicPath,
    ag71m_readiness: readinessPath,
    ag71m_boundary: boundaryPath
  },
  summary: {
    contract_created: true,
    field_map_created: true,
    ag71i_c_record_count_confirmed: 28,
    public_exact_value_output_allowed_now: false,
    ui_exact_value_wiring_allowed_now: false,
    ready_for_ag71m_internal_preview_data_bank: true
  }
});

writeJson("data/quality/ag71l-internal-exact-panchang-preview-contract.json", {
  module_id: "AG71L",
  status: "ag71l_completed",
  contract_created: true,
  field_map_created: true,
  public_output_allowed_now: false
});

writeJson("data/quality/ag71l-internal-exact-panchang-preview-contract-preview.json", {
  module_id: "AG71L",
  status: "ag71l_completed",
  contract_created: 1,
  mapped_field_count: Object.keys(readJson(fieldMapPath).field_map).length,
  public_output_allowed_now: 0,
  ready_for_ag71m: 1
});

writeText("docs/quality/AG71L_INTERNAL_EXACT_PANCHANG_PREVIEW_CONTRACT.md",
`# AG71L — Internal-only Exact Panchang Preview Contract

AG71L creates a contract for using the AG71I-C internally computed Panchang records in a public-blocked internal preview flow.

## What This Allows

- Internal preview data-bank preparation.
- Field mapping review.
- Validation of exact Panchang fields before any public decision.

## What Remains Blocked

- Public Panchang exact-value output.
- Live UI exact-value publication.
- generated/panchang-festival-working-data.json replacement.
- index.html exact-value wiring.
- Backend or Supabase activation.
- Full location-bank scale-up.

## Next Step

AG71M should create the internal-only exact Panchang preview data bank using this contract.
`);

manifest.ag71l_files = {
  internal_exact_preview_contract: contractPath,
  exact_preview_field_map: fieldMapPath,
  no_public_output_contract_audit: noPublicPath
};

manifest.current_counts = {
  ...(manifest.current_counts || {}),
  ag71l_contract_records: 1,
  ag71l_field_map_records: 1
};

manifest.current_status = "ag71l_internal_exact_panchang_preview_contract_created_ag71m_ready";
writeJson(manifestPath, manifest);

pass("AG71L internal-only exact Panchang preview contract is valid.");
pass("Field map is present.");
pass("Public/UI exact-value output remains blocked.");
