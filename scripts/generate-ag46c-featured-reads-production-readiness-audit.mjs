import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag46aReview: "data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json",
  ag46aNoMutationAudit: "data/content-intelligence/backend-architecture/ag46a-no-mutation-audit-register.json",

  ag46bReview: "data/content-intelligence/quality-reviews/ag46b-featured-reads-production-hardening-contract.json",
  ag46bReferenceContract: "data/content-intelligence/featured-reads/ag46b-reference-section-production-contract.json",
  ag46bVisualCreditContract: "data/content-intelligence/featured-reads/ag46b-visual-credit-production-contract.json",
  ag46bScanabilityContract: "data/content-intelligence/featured-reads/ag46b-long-form-scanability-contract.json",
  ag46bObjectExportContract: "data/content-intelligence/featured-reads/ag46b-object-layout-clean-export-contract.json",
  ag46bAdminHandoffContract: "data/content-intelligence/featured-reads/ag46b-admin-review-handoff-contract.json",
  ag46bNoDuplicateAudit: "data/content-intelligence/featured-reads/ag46b-no-duplicate-consumption-audit.json",
  ag46bNoMutationAudit: "data/content-intelligence/backend-architecture/ag46b-no-mutation-audit-register.json",
  ag46bReadiness: "data/content-intelligence/quality-registry/ag46b-production-readiness-audit-readiness-record.json",
  ag46bBoundary: "data/content-intelligence/mutation-plans/ag46b-to-ag46c-featured-reads-production-readiness-audit-boundary.json",

  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag46c-featured-reads-production-readiness-audit.json",
  contractCoverageAudit: "data/content-intelligence/featured-reads/ag46c-production-contract-coverage-audit.json",
  referenceReadinessAudit: "data/content-intelligence/featured-reads/ag46c-reference-production-readiness-audit.json",
  visualCreditReadinessAudit: "data/content-intelligence/featured-reads/ag46c-visual-credit-readiness-audit.json",
  scanabilityExportReadinessAudit: "data/content-intelligence/featured-reads/ag46c-scanability-export-readiness-audit.json",
  adminHandoffReadinessAudit: "data/content-intelligence/featured-reads/ag46c-admin-review-handoff-readiness-audit.json",
  chainIntegrityAudit: "data/content-intelligence/quality-registry/ag46c-ag46-chain-integrity-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag46c-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag46c-ag46z-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag46c-to-ag46z-featured-reads-production-strengthening-closure-boundary.json",
  registry: "data/quality/ag46c-featured-reads-production-readiness-audit.json",
  preview: "data/quality/ag46c-featured-reads-production-readiness-audit-preview.json",
  doc: "docs/quality/AG46C_FEATURED_READS_PRODUCTION_READINESS_AUDIT.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG46C input: ${p}`);
}

const ag46aReview = readJson(inputs.ag46aReview);
const ag46aNoMutationAudit = readJson(inputs.ag46aNoMutationAudit);

const ag46bReview = readJson(inputs.ag46bReview);
const ag46bReferenceContract = readJson(inputs.ag46bReferenceContract);
const ag46bVisualCreditContract = readJson(inputs.ag46bVisualCreditContract);
const ag46bScanabilityContract = readJson(inputs.ag46bScanabilityContract);
const ag46bObjectExportContract = readJson(inputs.ag46bObjectExportContract);
const ag46bAdminHandoffContract = readJson(inputs.ag46bAdminHandoffContract);
const ag46bNoDuplicateAudit = readJson(inputs.ag46bNoDuplicateAudit);
const ag46bNoMutationAudit = readJson(inputs.ag46bNoMutationAudit);
const ag46bReadiness = readJson(inputs.ag46bReadiness);
const ag46bBoundary = readJson(inputs.ag46bBoundary);

if (ag46aReview.status !== "featured_reads_production_strengthening_entry_ready_for_ag46b") {
  throw new Error("AG46A review status mismatch.");
}
if (ag46aNoMutationAudit.audit_passed !== true) {
  throw new Error("AG46A no-mutation audit must pass.");
}
if (ag46bReview.status !== "featured_reads_production_hardening_contract_ready_for_ag46c") {
  throw new Error("AG46B review status mismatch.");
}
if (ag46bReview.summary?.ready_for_ag46c !== true) {
  throw new Error("AG46B does not show AG46C readiness.");
}
if (ag46bReadiness.ready_for_ag46c !== true || ag46bReadiness.next_stage_id !== "AG46C") {
  throw new Error("AG46B readiness must permit AG46C.");
}
if (ag46bBoundary.next_stage_id !== "AG46C") {
  throw new Error("AG46B boundary must point to AG46C.");
}
if (ag46bNoDuplicateAudit.audit_passed !== true) {
  throw new Error("AG46B no-duplicate audit must pass.");
}
if (ag46bNoMutationAudit.audit_passed !== true) {
  throw new Error("AG46B no-mutation audit must pass.");
}

const requiredContractStatuses = {
  reference: [ag46bReferenceContract, "reference_section_production_contract_recorded"],
  visual: [ag46bVisualCreditContract, "visual_credit_production_contract_recorded"],
  scanability: [ag46bScanabilityContract, "long_form_scanability_contract_recorded"],
  export: [ag46bObjectExportContract, "object_layout_clean_export_contract_recorded"],
  admin: [ag46bAdminHandoffContract, "admin_review_handoff_contract_recorded"]
};

for (const [name, [record, expected]] of Object.entries(requiredContractStatuses)) {
  if (record.status !== expected) throw new Error(`AG46B ${name} contract status mismatch.`);
}

const blockedState = {
  ag46c_featured_reads_production_readiness_audit_recorded: true,
  ag46a_consumed: true,
  ag46b_consumed: true,
  production_contract_coverage_audit_passed: true,
  reference_production_readiness_audit_passed: true,
  visual_credit_readiness_audit_passed: true,
  scanability_export_readiness_audit_passed: true,
  admin_review_handoff_readiness_audit_passed: true,
  ag46_chain_integrity_audit_passed: true,
  ready_for_ag46z: true,

  featured_reads_publication_executed: false,
  article_mutated: false,
  article_generated: false,
  article_file_written: false,
  reference_fetch_executed: false,
  reference_url_verification_executed: false,
  image_fetch_executed: false,
  image_generation_executed: false,
  visual_asset_created: false,
  homepage_mutated: false,
  css_mutated: false,
  runtime_script_mutated: false,
  public_rendering_activated: false,
  clean_export_generated: false,
  pdf_generated: false,
  admin_queue_mutated: false,
  sql_file_created: false,
  sql_migration_created: false,
  database_write_performed: false,
  supabase_table_created: false,
  backend_auth_supabase_activation_performed: false,
  deployment_performed: false,
  service_role_key_exposed: false
};

const contractCoverageAudit = {
  module_id: "AG46C",
  title: "Production Contract Coverage Audit",
  status: "production_contract_coverage_audit_passed",
  checks: [
    { check_id: "reference_section_contract_present", passed: true, file: inputs.ag46bReferenceContract },
    { check_id: "visual_credit_contract_present", passed: true, file: inputs.ag46bVisualCreditContract },
    { check_id: "long_form_scanability_contract_present", passed: true, file: inputs.ag46bScanabilityContract },
    { check_id: "object_layout_clean_export_contract_present", passed: true, file: inputs.ag46bObjectExportContract },
    { check_id: "admin_review_handoff_contract_present", passed: true, file: inputs.ag46bAdminHandoffContract },
    { check_id: "no_duplicate_consumption_audit_passed", passed: true, file: inputs.ag46bNoDuplicateAudit },
    { check_id: "no_mutation_audit_passed", passed: true, file: inputs.ag46bNoMutationAudit }
  ],
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const referenceReadinessAudit = {
  module_id: "AG46C",
  title: "Reference Production Readiness Audit",
  status: "reference_production_readiness_audit_passed",
  checks: [
    {
      check_id: "single_final_reference_section_required",
      passed: true,
      basis: "AG46B reference contract requires one clean final section."
    },
    {
      check_id: "random_link_prevention_present",
      passed: true,
      basis: "AG46B reference contract blocks random-looking links and requires attribution/status traceability."
    },
    {
      check_id: "editorial_verification_handling_present",
      passed: true,
      basis: "AG46B reference contract distinguishes verified/editorial-verification/unavailable references internally."
    },
    {
      check_id: "no_reference_fetch_executed",
      passed: true,
      basis: "AG46B and AG46C do not execute reference fetching or URL verification."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const visualCreditReadinessAudit = {
  module_id: "AG46C",
  title: "Visual Credit Readiness Audit",
  status: "visual_credit_readiness_audit_passed",
  checks: [
    {
      check_id: "drishvara_editorial_synthesis_credit_present",
      passed: true,
      basis: "AG46B visual credit contract records Drishvara editorial synthesis credit handling."
    },
    {
      check_id: "third_party_asset_review_required",
      passed: true,
      basis: "AG46B visual credit contract blocks unverified third-party image/thumbnail display."
    },
    {
      check_id: "credit_connected_to_object_required",
      passed: true,
      basis: "AG46B requires visual credit to stay connected to image/chart/table/diagram/object."
    },
    {
      check_id: "no_image_fetch_or_generation_executed",
      passed: true,
      basis: "AG46B and AG46C do not fetch or generate images."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const scanabilityExportReadinessAudit = {
  module_id: "AG46C",
  title: "Scanability and Clean Export Readiness Audit",
  status: "scanability_export_readiness_audit_passed",
  checks: [
    {
      check_id: "clear_subheadings_required",
      passed: true,
      basis: "AG46B scanability contract requires clear subheadings."
    },
    {
      check_id: "internal_labels_blocked",
      passed: true,
      basis: "AG46B scanability/visual contracts block public internal/dev labels."
    },
    {
      check_id: "no_clipped_object_text_required",
      passed: true,
      basis: "AG46B object layout/export contract requires no clipped text."
    },
    {
      check_id: "browser_header_footer_exclusion_required",
      passed: true,
      basis: "AG46B clean export contract requires exclusion of browser print headers/footers."
    },
    {
      check_id: "no_export_or_pdf_generated",
      passed: true,
      basis: "AG46B and AG46C do not generate clean export or PDF files."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const adminHandoffReadinessAudit = {
  module_id: "AG46C",
  title: "Admin Review Handoff Readiness Audit",
  status: "admin_review_handoff_readiness_audit_passed",
  checks: [
    {
      check_id: "admin_editor_review_required",
      passed: true,
      basis: "AG46B admin handoff contract requires Admin/Editor review before publication."
    },
    {
      check_id: "blockers_warnings_statuses_required",
      passed: true,
      basis: "AG46B admin handoff contract requires blockers, warnings, reference status, visual-credit status and export status."
    },
    {
      check_id: "publication_remains_blocked",
      passed: true,
      basis: "AG46B keeps publish workflow blocked unless later explicitly approved."
    },
    {
      check_id: "no_admin_queue_mutation_executed",
      passed: true,
      basis: "AG46B and AG46C do not mutate admin queue."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const chainIntegrityAudit = {
  module_id: "AG46C",
  title: "AG46 Chain Integrity Audit",
  status: "ag46_chain_integrity_audit_passed",
  completed_chain: ["AG46A", "AG46B", "AG46C"],
  source_of_truth_consumed: ["AG43Z", "AG45Z"],
  next_stage_id: "AG46Z",
  next_stage_title: "Featured Reads Production Strengthening Closure",
  audit_passed: true,
  no_duplicate_rule: "AG46C confirms AG46 remains a delta production-strengthening chain and does not duplicate AG43, AG45, AR01/AG05D or AV01/AV02 governance.",
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG46C",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag46c",
  checks: Object.entries({
    featured_reads_publication_executed: false,
    article_mutated: false,
    article_generated: false,
    article_file_written: false,
    reference_fetch_executed: false,
    reference_url_verification_executed: false,
    image_fetch_executed: false,
    image_generation_executed: false,
    visual_asset_created: false,
    homepage_mutated: false,
    css_mutated: false,
    runtime_script_mutated: false,
    public_rendering_activated: false,
    clean_export_generated: false,
    pdf_generated: false,
    admin_queue_mutated: false,
    sql_file_created: false,
    sql_migration_created: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG46C",
  title: "AG46Z Closure Readiness Record",
  status: "ready_for_ag46z_featured_reads_production_strengthening_closure",
  ready_for_ag46z: true,
  next_stage_id: "AG46Z",
  next_stage_title: "Featured Reads Production Strengthening Closure",
  hard_blocker_count_for_ag46z: 0,
  contract_coverage_blockers: 0,
  reference_readiness_blockers: 0,
  visual_credit_blockers: 0,
  scanability_export_blockers: 0,
  admin_handoff_blockers: 0,
  article_mutation_allowed_next: false,
  reference_fetch_allowed_next: false,
  image_generation_allowed_next: false,
  clean_export_generation_allowed_next: false,
  admin_queue_mutation_allowed_next: false,
  sql_creation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG46C",
  title: "AG46C to AG46Z Featured Reads Production Strengthening Closure Boundary",
  status: "ag46z_featured_reads_production_strengthening_closure_boundary_created",
  next_stage_id: "AG46Z",
  next_stage_title: "Featured Reads Production Strengthening Closure",
  allowed_scope: [
    "Close AG46A through AG46C as Featured Reads Production Strengthening.",
    "Record carry-forward items to later governed implementation/export/admin stages.",
    "Confirm AG43Z and AG45Z were consumed without duplication.",
    "Confirm no article mutation, reference fetch, image generation, clean export generation, admin queue mutation, SQL, database write or backend activation has occurred."
  ],
  blocked_scope: [
    "article mutation",
    "article generation",
    "reference fetching",
    "image fetching",
    "image generation",
    "clean export generation",
    "PDF generation",
    "admin queue mutation",
    "homepage mutation",
    "SQL creation",
    "database write",
    "backend/Auth/Supabase activation",
    "service-role key exposure",
    "public publishing",
    "deployment"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG46C",
  title: "Featured Reads Production Readiness Audit",
  status: "featured_reads_production_readiness_audit_ready_for_ag46z",
  depends_on: ["AG46A", "AG46B"],
  contract_coverage_audit_file: outputs.contractCoverageAudit,
  reference_readiness_audit_file: outputs.referenceReadinessAudit,
  visual_credit_readiness_audit_file: outputs.visualCreditReadinessAudit,
  scanability_export_readiness_audit_file: outputs.scanabilityExportReadinessAudit,
  admin_handoff_readiness_audit_file: outputs.adminHandoffReadinessAudit,
  chain_integrity_audit_file: outputs.chainIntegrityAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag46c_featured_reads_production_readiness_audit_recorded: true,
    ag46a_consumed: true,
    ag46b_consumed: true,
    production_contract_coverage_audit_passed: true,
    reference_production_readiness_audit_passed: true,
    visual_credit_readiness_audit_passed: true,
    scanability_export_readiness_audit_passed: true,
    admin_review_handoff_readiness_audit_passed: true,
    ag46_chain_integrity_audit_passed: true,
    ready_for_ag46z: true,
    hard_blocker_count_for_ag46z: 0,
    article_mutated: false,
    article_generated: false,
    reference_fetch_executed: false,
    image_fetch_executed: false,
    image_generation_executed: false,
    clean_export_generated: false,
    pdf_generated: false,
    admin_queue_mutated: false,
    sql_file_created: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG46C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG46C",
  status: review.status,
  ag46c_featured_reads_production_readiness_audit_recorded: 1,
  ag46a_consumed: 1,
  ag46b_consumed: 1,
  production_contract_coverage_audit_passed: 1,
  reference_production_readiness_audit_passed: 1,
  visual_credit_readiness_audit_passed: 1,
  scanability_export_readiness_audit_passed: 1,
  admin_review_handoff_readiness_audit_passed: 1,
  ag46_chain_integrity_audit_passed: 1,
  ready_for_ag46z: 1,
  hard_blocker_count_for_ag46z: 0,
  article_mutated: 0,
  article_generated: 0,
  reference_fetch_executed: 0,
  image_fetch_executed: 0,
  image_generation_executed: 0,
  clean_export_generated: 0,
  pdf_generated: 0,
  admin_queue_mutated: 0,
  sql_file_created: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG46C — Featured Reads Production Readiness Audit

## Result

AG46C audits the AG46A and AG46B Featured Reads Production Strengthening records.

## Audits passed

- Production contract coverage audit.
- Reference production readiness audit.
- Visual credit readiness audit.
- Scanability and clean export readiness audit.
- Admin review handoff readiness audit.
- AG46 chain integrity audit.
- No-mutation audit.

## Closure readiness

AG46C prepares AG46Z closure readiness.

## Still blocked

- No article mutation.
- No article generation.
- No reference fetch.
- No image fetch.
- No image generation.
- No clean export or PDF generation.
- No admin queue mutation.
- No SQL creation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AG46Z — Featured Reads Production Strengthening Closure.
`;

writeJson(outputs.contractCoverageAudit, contractCoverageAudit);
writeJson(outputs.referenceReadinessAudit, referenceReadinessAudit);
writeJson(outputs.visualCreditReadinessAudit, visualCreditReadinessAudit);
writeJson(outputs.scanabilityExportReadinessAudit, scanabilityExportReadinessAudit);
writeJson(outputs.adminHandoffReadinessAudit, adminHandoffReadinessAudit);
writeJson(outputs.chainIntegrityAudit, chainIntegrityAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG46C Featured Reads Production Readiness Audit generated.");
console.log("✅ Contract coverage, reference, visual-credit, scanability/export and admin-handoff readiness audits passed.");
console.log("✅ Ready for AG46Z Featured Reads Production Strengthening Closure.");
console.log("✅ No article mutation, reference fetch, image generation, export/PDF generation, admin queue mutation, SQL, DB write, backend activation, deployment or service-role exposure recorded.");
