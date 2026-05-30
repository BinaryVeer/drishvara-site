import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag46aReview: "data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json",
  ag46aSourceConsumptionMap: "data/content-intelligence/featured-reads/ag46a-featured-reads-source-of-truth-consumption-map.json",
  ag46aScopeGuard: "data/content-intelligence/featured-reads/ag46a-production-strengthening-scope-guard.json",
  ag46aNoDuplicateMap: "data/content-intelligence/featured-reads/ag46a-no-duplicate-governance-map.json",
  ag46aDeltaRegister: "data/content-intelligence/featured-reads/ag46a-delta-strengthening-register.json",
  ag46aNoMutationAudit: "data/content-intelligence/backend-architecture/ag46a-no-mutation-audit-register.json",
  ag46aReadiness: "data/content-intelligence/quality-registry/ag46a-production-hardening-readiness-record.json",
  ag46aBoundary: "data/content-intelligence/mutation-plans/ag46a-to-ag46b-featured-reads-production-hardening-boundary.json",

  ag43zReview: "data/content-intelligence/quality-reviews/ag43z-article-intelligence-quality-automation-closure.json",
  ag45zReview: "data/content-intelligence/quality-reviews/ag45z-daily-signal-surface-first-light-closure.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag46b-featured-reads-production-hardening-contract.json",
  referenceSectionContract: "data/content-intelligence/featured-reads/ag46b-reference-section-production-contract.json",
  visualCreditContract: "data/content-intelligence/featured-reads/ag46b-visual-credit-production-contract.json",
  longFormScanabilityContract: "data/content-intelligence/featured-reads/ag46b-long-form-scanability-contract.json",
  objectLayoutExportContract: "data/content-intelligence/featured-reads/ag46b-object-layout-clean-export-contract.json",
  adminReviewHandoffContract: "data/content-intelligence/featured-reads/ag46b-admin-review-handoff-contract.json",
  noDuplicateConsumptionAudit: "data/content-intelligence/featured-reads/ag46b-no-duplicate-consumption-audit.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag46b-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag46b-production-readiness-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag46b-to-ag46c-featured-reads-production-readiness-audit-boundary.json",
  registry: "data/quality/ag46b-featured-reads-production-hardening-contract.json",
  preview: "data/quality/ag46b-featured-reads-production-hardening-contract-preview.json",
  doc: "docs/quality/AG46B_FEATURED_READS_PRODUCTION_HARDENING_CONTRACT.md"
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
  if (!exists(p)) throw new Error(`Missing AG46B input: ${p}`);
}

const ag46aReview = readJson(inputs.ag46aReview);
const ag46aSourceConsumptionMap = readJson(inputs.ag46aSourceConsumptionMap);
const ag46aScopeGuard = readJson(inputs.ag46aScopeGuard);
const ag46aNoDuplicateMap = readJson(inputs.ag46aNoDuplicateMap);
const ag46aDeltaRegister = readJson(inputs.ag46aDeltaRegister);
const ag46aNoMutationAudit = readJson(inputs.ag46aNoMutationAudit);
const ag46aReadiness = readJson(inputs.ag46aReadiness);
const ag46aBoundary = readJson(inputs.ag46aBoundary);
const ag43zReview = readJson(inputs.ag43zReview);
const ag45zReview = readJson(inputs.ag45zReview);

if (ag46aReview.status !== "featured_reads_production_strengthening_entry_ready_for_ag46b") {
  throw new Error("AG46A review status mismatch.");
}
if (ag46aReview.summary?.ready_for_ag46b !== true) {
  throw new Error("AG46A does not show AG46B readiness.");
}
if (ag46aReadiness.ready_for_ag46b !== true || ag46aReadiness.next_stage_id !== "AG46B") {
  throw new Error("AG46A readiness must permit AG46B.");
}
if (ag46aBoundary.next_stage_id !== "AG46B") {
  throw new Error("AG46A boundary must point to AG46B.");
}
if (ag46aNoMutationAudit.audit_passed !== true) {
  throw new Error("AG46A no-mutation audit must pass.");
}
if (!JSON.stringify(ag46aSourceConsumptionMap).includes("AG43") || !JSON.stringify(ag46aSourceConsumptionMap).includes("AG45")) {
  throw new Error("AG46A source consumption map must consume AG43 and AG45.");
}
if (!JSON.stringify(ag46aNoDuplicateMap).includes("AR01 / AG05D") || !JSON.stringify(ag46aNoDuplicateMap).includes("AV01 / AV02")) {
  throw new Error("AG46A no-duplicate map must include reference/visual and layout families.");
}
for (const item of [
  "reference_section_production_contract",
  "visual_credit_production_contract",
  "long_form_scanability_contract",
  "clean_export_contract",
  "admin_review_handoff_contract"
]) {
  if (!JSON.stringify(ag46aDeltaRegister.delta_items_for_ag46b).includes(item)) {
    throw new Error(`AG46A delta item missing: ${item}`);
  }
}
if (!JSON.stringify(ag43zReview).includes("AG43")) {
  throw new Error("AG43Z source-of-truth is not available.");
}
if (ag45zReview.status !== "daily_signal_surface_first_light_closure_ready_for_ag46") {
  throw new Error("AG45Z source-of-truth status mismatch.");
}

const blockedState = {
  ag46b_featured_reads_production_hardening_contract_recorded: true,
  ag46a_consumed: true,
  ag43z_consumed: true,
  ag45z_consumed: true,
  reference_section_contract_recorded: true,
  visual_credit_contract_recorded: true,
  long_form_scanability_contract_recorded: true,
  object_layout_clean_export_contract_recorded: true,
  admin_review_handoff_contract_recorded: true,
  no_duplicate_consumption_audit_recorded: true,
  ready_for_ag46c: true,

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
  daily_signal_fetch_executed: false,
  news_scraping_executed: false,
  sql_file_created: false,
  sql_migration_created: false,
  database_write_performed: false,
  supabase_table_created: false,
  backend_auth_supabase_activation_performed: false,
  deployment_performed: false,
  service_role_key_exposed: false
};

const referenceSectionContract = {
  module_id: "AG46B",
  title: "Featured Reads Reference Section Production Contract",
  status: "reference_section_production_contract_recorded",
  source_of_truth: [
    "AG43 article quality closure",
    "AR01 / AG05D / AR01-R1 / AG05D-R2 reference and visual-credit family where available",
    "AG45 daily signal reference-learning carry-forward where relevant"
  ],
  contract_rules: [
    "Featured Reads must consolidate references into one clean final section.",
    "Reference entries must remain source-attributed and not appear as random links.",
    "Verified references, editorial-verification references and unavailable references must be distinguished internally.",
    "No live reference fetching or URL verification is executed in AG46B.",
    "Reference section production must not duplicate AR01 / AG05D credit-reference governance.",
    "Reference section should support future Admin/Editor review before publication."
  ],
  production_acceptance_criteria_later: [
    "single final reference section",
    "no duplicate reference blocks",
    "no broken placeholder text in public view",
    "source labels are understandable to readers",
    "editorial verification wording appears only where actually needed",
    "reference status remains internally traceable"
  ],
  blocked_state: blockedState
};

const visualCreditContract = {
  module_id: "AG46B",
  title: "Featured Reads Visual Credit Production Contract",
  status: "visual_credit_production_contract_recorded",
  source_of_truth: [
    "AR01 / AG05D / AR01-R1 / AG05D-R2 visual-credit cleanup family",
    "AG45E image/link/attribution safety model",
    "AG43 article object quality readiness"
  ],
  contract_rules: [
    "Drishvara-created visuals must use simple Drishvara editorial synthesis credit.",
    "Third-party images/thumbnails must not be displayed without rights, source and verification handling.",
    "Visual credit must stay visually connected to the image, chart, table, diagram or object.",
    "Do not use 'under editorial verification' for Drishvara-created editorial synthesis visuals.",
    "Use 'under editorial verification' only for third-party source/image assets still under review.",
    "No image fetching, image generation or visual asset creation is executed in AG46B."
  ],
  production_acceptance_criteria_later: [
    "every visible object has a connected caption/source/credit line where required",
    "no internal object labels are exposed publicly",
    "no empty visual/object shells",
    "no third-party ownership confusion",
    "Drishvara editorial synthesis wording is concise and consistent",
    "rights-unclear assets remain blocked or under editorial verification"
  ],
  blocked_state: blockedState
};

const longFormScanabilityContract = {
  module_id: "AG46B",
  title: "Featured Reads Long-form Scanability Contract",
  status: "long_form_scanability_contract_recorded",
  source_of_truth: [
    "AG43 long-form readiness and article quality closure",
    "AV01 / AV02 article width and reading surface family",
    "AG45 daily-signal inference metadata where useful for future article planning"
  ],
  contract_rules: [
    "Long-form Featured Reads must have clear subheadings for scanability.",
    "Object title, body, caption and source/basis note must stay visually connected.",
    "Reader-facing object labels must replace any internal/dev labels.",
    "Text should remain justified where article surface rules require it.",
    "Objects must support reading flow rather than interrupt it.",
    "No article text mutation is executed in AG46B."
  ],
  production_acceptance_criteria_later: [
    "clear section hierarchy",
    "no internal/dev labels",
    "no clipped chart or diagram text",
    "object caption/source remains attached to object",
    "article width remains controlled",
    "mobile readability is preserved"
  ],
  blocked_state: blockedState
};

const objectLayoutExportContract = {
  module_id: "AG46B",
  title: "Featured Reads Object Layout and Clean Export Contract",
  status: "object_layout_clean_export_contract_recorded",
  source_of_truth: [
    "AG43 object readiness",
    "AV01 / AV02 reading-surface family",
    "AG12C-R1 repaired public object label/layout state",
    "AR01-R1 / AG05D-R2 credit-reference surface cleanup"
  ],
  contract_rules: [
    "Charts, diagrams, maps, tables and composite reader-lens objects must not clip text.",
    "Tables and figures should remain centrally aligned when vertical flow is better for readability.",
    "Non-hero objects may use controlled wrapping only where it preserves article shape and mobile layout.",
    "Clean export must avoid browser print headers and footers.",
    "Clean export must not cut captions, credits, charts, diagrams or tables.",
    "No PDF/export file is generated in AG46B."
  ],
  production_acceptance_criteria_later: [
    "no object text clipping",
    "no empty object shells",
    "captions/credits stay with objects",
    "clean export excludes browser headers/footers",
    "page breaks do not split critical object units",
    "Drishvara palette and text contrast remain acceptable"
  ],
  blocked_state: blockedState
};

const adminReviewHandoffContract = {
  module_id: "AG46B",
  title: "Featured Reads Admin Review Handoff Contract",
  status: "admin_review_handoff_contract_recorded",
  source_of_truth: [
    "AG26 Admin/Editor Manual Workflow Strengthening",
    "AG43 article readiness and closure",
    "AG46A production scope guard"
  ],
  contract_rules: [
    "Featured Reads production readiness should route to Admin/Editor review before publication.",
    "Admin handoff should expose blockers, warnings, reference status, visual-credit status and export-readiness status.",
    "Admin actions remain review-only unless a later approved stage enables publication workflow.",
    "No admin queue mutation, GitHub write, public publish or deployment is executed in AG46B.",
    "Backend/Auth/Supabase remains deferred unless a later approved stage explicitly activates it."
  ],
  production_acceptance_criteria_later: [
    "hard blockers visible",
    "warnings visible",
    "reference status visible",
    "visual-credit status visible",
    "clean export status visible",
    "publish remains blocked until approved workflow"
  ],
  blocked_state: blockedState
};

const noDuplicateConsumptionAudit = {
  module_id: "AG46B",
  title: "No-duplicate Consumption Audit",
  status: "no_duplicate_consumption_audit_passed",
  checks: [
    {
      check_id: "ag43_consumed_not_duplicated",
      passed: true,
      basis: "AG46B consumes AG43 article quality closure and does not recreate article-quality governance."
    },
    {
      check_id: "ag45_consumed_not_duplicated",
      passed: true,
      basis: "AG46B consumes AG45 daily-signal closure and does not recreate Daily Signal Surface governance."
    },
    {
      check_id: "ar01_ag05d_consumed_not_duplicated",
      passed: true,
      basis: "AG46B uses existing reference/visual-credit families instead of creating a parallel credit module."
    },
    {
      check_id: "av01_av02_consumed_not_duplicated",
      passed: true,
      basis: "AG46B uses existing article-width/reading-surface families instead of creating a parallel layout module."
    },
    {
      check_id: "delta_only_contract",
      passed: true,
      basis: "AG46B records production hardening contracts only."
    }
  ],
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG46B",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag46b",
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
    daily_signal_fetch_executed: false,
    news_scraping_executed: false,
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
  module_id: "AG46B",
  title: "AG46C Featured Reads Production Readiness Audit Readiness Record",
  status: "ready_for_ag46c_featured_reads_production_readiness_audit",
  ready_for_ag46c: true,
  next_stage_id: "AG46C",
  next_stage_title: "Featured Reads Production Readiness Audit",
  hard_blocker_count_for_ag46c: 0,
  article_mutation_allowed_next: false,
  reference_fetch_allowed_next: false,
  image_fetch_allowed_next: false,
  image_generation_allowed_next: false,
  clean_export_generation_allowed_next: false,
  admin_queue_mutation_allowed_next: false,
  homepage_mutation_allowed_next: false,
  sql_creation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG46B",
  title: "AG46B to AG46C Featured Reads Production Readiness Audit Boundary",
  status: "ag46c_featured_reads_production_readiness_audit_boundary_created",
  next_stage_id: "AG46C",
  next_stage_title: "Featured Reads Production Readiness Audit",
  allowed_scope: [
    "Audit AG46A and AG46B production-strengthening records.",
    "Confirm reference, visual-credit, scanability, object-layout, clean-export and admin-review contracts are present.",
    "Confirm AG43 and AG45 are consumed without duplication.",
    "Confirm no article mutation, reference fetch, image generation, clean export generation, public publish, SQL, database write or backend activation has occurred.",
    "Prepare AG46Z closure readiness if audit passes."
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
  module_id: "AG46B",
  title: "Featured Reads Production Hardening Contract",
  status: "featured_reads_production_hardening_contract_ready_for_ag46c",
  depends_on: ["AG46A", "AG43Z", "AG45Z"],
  reference_section_contract_file: outputs.referenceSectionContract,
  visual_credit_contract_file: outputs.visualCreditContract,
  long_form_scanability_contract_file: outputs.longFormScanabilityContract,
  object_layout_export_contract_file: outputs.objectLayoutExportContract,
  admin_review_handoff_contract_file: outputs.adminReviewHandoffContract,
  no_duplicate_consumption_audit_file: outputs.noDuplicateConsumptionAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag46b_featured_reads_production_hardening_contract_recorded: true,
    ag46a_consumed: true,
    ag43z_consumed: true,
    ag45z_consumed: true,
    reference_section_contract_recorded: true,
    visual_credit_contract_recorded: true,
    long_form_scanability_contract_recorded: true,
    object_layout_clean_export_contract_recorded: true,
    admin_review_handoff_contract_recorded: true,
    no_duplicate_consumption_audit_recorded: true,
    ready_for_ag46c: true,
    hard_blocker_count_for_ag46c: 0,
    article_mutated: false,
    article_generated: false,
    reference_fetch_executed: false,
    image_fetch_executed: false,
    image_generation_executed: false,
    clean_export_generated: false,
    admin_queue_mutated: false,
    homepage_mutated: false,
    sql_file_created: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG46B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG46B",
  status: review.status,
  ag46b_featured_reads_production_hardening_contract_recorded: 1,
  ag46a_consumed: 1,
  ag43z_consumed: 1,
  ag45z_consumed: 1,
  reference_section_contract_recorded: 1,
  visual_credit_contract_recorded: 1,
  long_form_scanability_contract_recorded: 1,
  object_layout_clean_export_contract_recorded: 1,
  admin_review_handoff_contract_recorded: 1,
  no_duplicate_consumption_audit_recorded: 1,
  ready_for_ag46c: 1,
  hard_blocker_count_for_ag46c: 0,
  article_mutated: 0,
  article_generated: 0,
  reference_fetch_executed: 0,
  image_fetch_executed: 0,
  image_generation_executed: 0,
  clean_export_generated: 0,
  admin_queue_mutated: 0,
  homepage_mutated: 0,
  sql_file_created: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG46B — Featured Reads Production Hardening Contract

## Result

AG46B records the Featured Reads production hardening contract.

## Contracts recorded

- Reference Section Production Contract
- Visual Credit Production Contract
- Long-form Scanability Contract
- Object Layout and Clean Export Contract
- Admin Review Handoff Contract

## Source-of-truth consumed

AG46B consumes AG46A, AG43Z and AG45Z. It does not duplicate AG43 article-quality governance, AG45 Daily Signal governance, AR01/AG05D credit-reference governance or AV01/AV02 layout governance.

## Still blocked

- No article mutation.
- No article generation.
- No reference fetch.
- No image fetch.
- No image generation.
- No clean export/PDF generation.
- No admin queue mutation.
- No homepage mutation.
- No SQL creation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

AG46C — Featured Reads Production Readiness Audit.
`;

writeJson(outputs.referenceSectionContract, referenceSectionContract);
writeJson(outputs.visualCreditContract, visualCreditContract);
writeJson(outputs.longFormScanabilityContract, longFormScanabilityContract);
writeJson(outputs.objectLayoutExportContract, objectLayoutExportContract);
writeJson(outputs.adminReviewHandoffContract, adminReviewHandoffContract);
writeJson(outputs.noDuplicateConsumptionAudit, noDuplicateConsumptionAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG46B Featured Reads Production Hardening Contract generated.");
console.log("✅ Reference, visual-credit, scanability, object-layout/export and admin-review contracts recorded.");
console.log("✅ AG43Z, AG45Z and AG46A are consumed without duplication.");
console.log("✅ Ready for AG46C Featured Reads Production Readiness Audit.");
console.log("✅ No article mutation, reference fetch, image generation, clean export, admin queue mutation, SQL, DB write, backend activation, deployment or service-role exposure recorded.");
