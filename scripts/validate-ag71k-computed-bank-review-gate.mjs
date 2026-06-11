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
  console.error(`❌ AG71K validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

const validationPath = "data/knowledge-base/panchang-festival/production/ag71j-four-location-computed-bank-internal-validation.json";
const issuePath = "data/knowledge-base/panchang-festival/production/ag71j-computed-bank-validation-issue-report.json";
const noPublicPath = "data/knowledge-base/panchang-festival/production/ag71j-no-public-output-validation.json";
const bankPath = "data/knowledge-base/panchang-festival/production/ag71i-c-four-location-computed-panchang-bank-internal.json";
const manifestPath = "data/knowledge-base/panchang-festival/production/production-bank-manifest.json";

for (const file of [validationPath, issuePath, noPublicPath, bankPath, manifestPath]) {
  if (!exists(file)) fail(`Missing required source file: ${file}`);
}

const validation = readJson(validationPath);
const issueReport = readJson(issuePath);
const noPublic = readJson(noPublicPath);
const bank = readJson(bankPath);
const manifest = readJson(manifestPath);

if (validation.status !== "ag71j_four_location_computed_bank_internal_validation_passed") {
  fail("AG71J validation did not pass.");
}

if (issueReport.issue_count !== 0 || issueReport.status !== "no_issues_detected") {
  fail("AG71J issue report is not clean.");
}

if (bank.records.length !== 28 || bank.computed_record_count !== 28) {
  fail("AG71I-C bank must contain 28 computed records.");
}

for (const [key, value] of Object.entries(noPublic.checks || {})) {
  if (value !== false) fail(`No-public check must be false: ${key}`);
}

const gatePath = "data/knowledge-base/panchang-festival/production/ag71k-computed-bank-review-gate.json";
const noPublicGatePath = "data/knowledge-base/panchang-festival/production/ag71k-no-public-output-gate.json";
const previewContractReadinessPath = "data/content-intelligence/quality-registry/ag71k-ag71l-internal-exact-preview-contract-readiness-record.json";
const boundaryPath = "data/content-intelligence/mutation-plans/ag71k-to-ag71l-internal-exact-preview-contract-boundary.json";

writeJson(gatePath, {
  module_id: "AG71K",
  title: "Computed Bank Review Gate",
  status: "ag71k_computed_bank_review_gate_passed",
  source_validation: validationPath,
  source_issue_report: issuePath,
  source_computed_bank: bankPath,
  decision: {
    internal_computed_bank_accepted_for_next_contract: true,
    internal_exact_value_preview_contract_allowed_next: true,
    public_exact_value_output_allowed_now: false,
    ui_exact_value_wiring_allowed_now: false,
    backend_runtime_activation_allowed_now: false,
    supabase_activation_allowed_now: false,
    full_location_bank_scale_up_allowed_now: false
  },
  review_basis: {
    computed_record_count: 28,
    location_count: 4,
    date_count: 7,
    ag71j_issue_count: 0,
    no_public_output_validation_passed: true
  },
  next_step: {
    module_id: "AG71L",
    title: "Internal-only Exact Panchang Preview Contract",
    purpose: "Prepare a public-blocked internal exact-value preview contract. No public UI exact-value publication."
  }
});

writeJson(noPublicGatePath, {
  module_id: "AG71K",
  title: "No Public Output Gate",
  status: "ag71k_no_public_output_gate_passed",
  checks: {
    public_panchang_exact_value_output_allowed_now: false,
    public_ui_exact_value_wiring_allowed_now: false,
    generated_public_panchang_file_modified: false,
    index_html_exact_value_publication_performed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    full_location_bank_scale_up_performed: false
  }
});

writeJson(previewContractReadinessPath, {
  module_id: "AG71K-AG71L",
  title: "AG71L Internal Exact Preview Contract Readiness",
  status: "ready_for_ag71l_internal_exact_preview_contract",
  ag71k_consumed: true,
  hard_blockers_for_ag71l: [],
  controlled_requirements_for_ag71l: [
    "Exact values may be used only inside an internal/public-blocked preview contract.",
    "No public UI exact-value publication.",
    "No generated public Panchang data replacement.",
    "No backend or Supabase activation.",
    "Retain AG71J validation references."
  ]
});

writeJson(boundaryPath, {
  from_module: "AG71K",
  to_module: "AG71L",
  transition: "internal_exact_preview_contract",
  allowed_next_actions: [
    "Create internal-only exact Panchang preview contract.",
    "Map AG71I-C fields to preview contract fields.",
    "Keep exact values blocked from public UI.",
    "Record contract validation."
  ],
  blocked_actions: [
    "Public Panchang exact-value output.",
    "Live UI exact-value publication.",
    "Generated public Panchang file replacement.",
    "Backend runtime activation.",
    "Supabase activation.",
    "Full location-bank scale-up."
  ]
});

writeJson("data/content-intelligence/quality-reviews/ag71k-computed-bank-review-gate.json", {
  module_id: "AG71K",
  title: "Computed Bank Review Gate Review",
  status: "ag71k_completed",
  generated_records: {
    computed_bank_review_gate: gatePath,
    no_public_output_gate: noPublicGatePath,
    ag71l_readiness: previewContractReadinessPath,
    ag71l_boundary: boundaryPath
  },
  summary: {
    ag71j_validation_passed: true,
    computed_bank_accepted_for_internal_contract: true,
    ready_for_ag71l_internal_exact_preview_contract: true,
    public_exact_value_output_allowed_now: false,
    ui_exact_value_wiring_allowed_now: false
  }
});

writeJson("data/quality/ag71k-computed-bank-review-gate.json", {
  module_id: "AG71K",
  status: "ag71k_completed",
  computed_bank_review_gate_passed: true,
  public_output_allowed_now: false
});

writeJson("data/quality/ag71k-computed-bank-review-gate-preview.json", {
  module_id: "AG71K",
  status: "ag71k_completed",
  computed_bank_review_gate_passed: 1,
  ag71j_issue_count: 0,
  public_output_allowed_now: 0,
  ready_for_ag71l: 1
});

writeText("docs/quality/AG71K_COMPUTED_BANK_REVIEW_GATE.md",
`# AG71K — Computed Bank Review Gate

AG71K reviews the AG71J validation outcome and decides whether the AG71I-C internal computed bank can proceed to an internal-only exact preview contract.

## Decision

The computed bank is accepted for the next internal contract step because AG71J passed with zero issues.

## Still Blocked

- Public Panchang exact-value output
- Live UI exact-value publication
- Backend runtime activation
- Supabase activation
- Full location-bank scale-up

## Next Step

AG71L should create the internal-only exact Panchang preview contract.
`);

manifest.ag71k_files = {
  computed_bank_review_gate: gatePath,
  no_public_output_gate: noPublicGatePath
};

manifest.current_counts = {
  ...(manifest.current_counts || {}),
  ag71k_review_gate_records: 1,
  ag71k_no_public_output_gate_records: 1
};

manifest.current_status = "ag71k_computed_bank_review_gate_passed_ag71l_ready";
writeJson(manifestPath, manifest);

pass("AG71K computed bank review gate passed.");
pass("AG71L internal-only exact preview contract is ready.");
pass("Public/UI exact-value output remains blocked.");
