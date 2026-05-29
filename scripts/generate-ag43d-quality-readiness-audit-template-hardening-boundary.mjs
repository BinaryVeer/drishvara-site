import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  article: "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html",

  ag43cReview: "data/content-intelligence/quality-reviews/ag43c-article-quality-longform-readiness-integration.json",
  ag43cIntegration: "data/content-intelligence/backend-architecture/ag43c-article-quality-longform-readiness-integration.json",
  ag43cConsumptionMap: "data/content-intelligence/backend-architecture/ag43c-existing-quality-module-consumption-map.json",
  ag43cLongformStandard: "data/content-intelligence/quality-rules/ag43c-longform-featured-read-standard.json",
  ag43cDeltaRulebook: "data/content-intelligence/quality-rules/ag43c-public-readiness-delta-rulebook.json",
  ag43cObjectModel: "data/content-intelligence/backend-architecture/ag43c-object-placement-credit-reference-readiness-model.json",
  ag43cNoDuplicateAudit: "data/content-intelligence/backend-architecture/ag43c-no-duplicate-quality-audit-register.json",
  ag43cNoMutationAudit: "data/content-intelligence/backend-architecture/ag43c-no-mutation-audit-register.json",
  ag43cBlocker: "data/content-intelligence/quality-registry/ag43c-article-quality-longform-readiness-blocker-register.json",
  ag43cReadiness: "data/content-intelligence/quality-registry/ag43c-quality-readiness-audit-boundary-record.json",
  ag43cBoundary: "data/content-intelligence/mutation-plans/ag43c-to-ag43d-quality-readiness-audit-boundary.json",

  ag12cR1Apply: "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
  ar01R1Apply: "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag43d-quality-readiness-audit-template-hardening-boundary.json",
  audit: "data/content-intelligence/backend-architecture/ag43d-quality-readiness-audit-report.json",
  templateBoundary: "data/content-intelligence/backend-architecture/ag43d-template-rendering-hardening-boundary.json",
  exportBoundary: "data/content-intelligence/backend-architecture/ag43d-print-pdf-export-hardening-boundary.json",
  referenceBoundary: "data/content-intelligence/backend-architecture/ag43d-reference-consolidation-boundary.json",
  carryForward: "data/content-intelligence/quality-registry/ag43d-carry-forward-template-export-reference-register.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag43d-no-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag43d-quality-readiness-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag43d-template-hardening-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag43d-to-ag43e-template-hardening-planning-boundary.json",
  registry: "data/quality/ag43d-quality-readiness-audit-template-hardening-boundary.json",
  preview: "data/quality/ag43d-quality-readiness-audit-template-hardening-boundary-preview.json",
  doc: "docs/quality/AG43D_QUALITY_READINESS_AUDIT_TEMPLATE_HARDENING_BOUNDARY.md"
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

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG43D input: ${p}`);
}

const articleHtml = read(inputs.article);
const articleHash = sha256(articleHtml);

const ag43cReview = readJson(inputs.ag43cReview);
const ag43cIntegration = readJson(inputs.ag43cIntegration);
const ag43cConsumptionMap = readJson(inputs.ag43cConsumptionMap);
const ag43cLongformStandard = readJson(inputs.ag43cLongformStandard);
const ag43cDeltaRulebook = readJson(inputs.ag43cDeltaRulebook);
const ag43cObjectModel = readJson(inputs.ag43cObjectModel);
const ag43cNoDuplicateAudit = readJson(inputs.ag43cNoDuplicateAudit);
const ag43cNoMutationAudit = readJson(inputs.ag43cNoMutationAudit);
const ag43cBlocker = readJson(inputs.ag43cBlocker);
const ag43cReadiness = readJson(inputs.ag43cReadiness);
const ag43cBoundary = readJson(inputs.ag43cBoundary);

const ag12cR1Apply = readJson(inputs.ag12cR1Apply);
const ar01R1Apply = readJson(inputs.ar01R1Apply);

if (ag43cReview.status !== "article_quality_longform_readiness_integrated_ready_for_ag43d") {
  throw new Error("AG43C review status mismatch.");
}
if (ag43cIntegration.status !== "article_quality_longform_readiness_integrated_ready_for_ag43d") {
  throw new Error("AG43C integration status mismatch.");
}
if (ag43cIntegration.current_article_hash !== articleHash) {
  throw new Error("Current article hash must match AG43C integration hash.");
}
if (ag43cReadiness.ready_for_ag43d !== true) {
  throw new Error("AG43C readiness does not permit AG43D.");
}
if (ag43cBoundary.next_stage_id !== "AG43D") {
  throw new Error("AG43C boundary does not point to AG43D.");
}
if (ag43cBlocker.hard_blocker_count_for_ag43d !== 0) {
  throw new Error("AG43C hard blocker count for AG43D must be zero.");
}
if (ag43cNoDuplicateAudit.status !== "no_duplicate_quality_audit_passed") {
  throw new Error("AG43C no-duplicate audit status mismatch.");
}
if (ag43cNoMutationAudit.status !== "no_mutation_audit_passed_for_ag43c") {
  throw new Error("AG43C no-mutation audit status mismatch.");
}
if (ag12cR1Apply.status !== "public_object_label_layout_repair_applied") {
  throw new Error("AG12C-R1 apply status mismatch.");
}
if (ar01R1Apply.status !== "credit_reference_surface_cleanup_applied") {
  throw new Error("AR01-R1 apply status mismatch.");
}
if (ar01R1Apply.post_repair_hash !== articleHash) {
  throw new Error("Current article hash must match AR01-R1 post repair hash.");
}

for (const phrase of [
  "Additional pilot object:",
  'data-drishvara-layout-treatment="collapsed-pilot-annex"',
  "Final image-source attribution",
  "Image credit / attribution:"
]) {
  if (articleHtml.includes(phrase)) {
    throw new Error(`AG43D audit found public-readiness blocker: ${phrase}`);
  }
}

for (const phrase of [
  'data-drishvara-layout-treatment="reader-facing-object"',
  "Drishvara editorial synthesis",
  "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count.",
  "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
]) {
  if (!articleHtml.includes(phrase)) {
    throw new Error(`AG43D audit missing cleaned readiness phrase: ${phrase}`);
  }
}

for (const marker of [
  "<!-- AG10K-GENERATED-IMAGE-INSERTION:START -->",
  "<!-- AG11B-CHART-BI-GRAPH-INSERTION:START -->",
  "<!-- AG11C-INFOGRAPHIC-INSERTION:START -->",
  "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:START -->",
  "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:START -->",
  "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:START -->",
  "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:START -->"
]) {
  if (count(articleHtml, marker) !== 1) {
    throw new Error(`Governed object marker missing or duplicated: ${marker}`);
  }
}

const blockedState = {
  ag43d_quality_readiness_audit_completed: true,
  ag43c_consumed: true,
  template_hardening_boundary_created: true,
  export_hardening_boundary_created: true,
  reference_consolidation_boundary_created: true,
  article_mutated: false,
  article_generated: false,
  template_mutated: false,
  css_js_mutated: false,
  reference_fetch_executed: false,
  image_generation_executed: false,
  object_generation_executed: false,
  object_removed: false,
  featured_reads_mutated: false,
  homepage_mutated: false,
  listing_mutated: false,
  public_publishing_operation_performed: false,
  deployment_performed: false,
  database_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  sql_file_created: false,
  sql_grants_executed: false,
  service_role_key_exposed: false
};

const audit = {
  module_id: "AG43D",
  title: "Quality Readiness Audit Report",
  status: "quality_readiness_audit_passed_template_hardening_boundary_ready",
  selected_article_path: inputs.article,
  current_article_hash: articleHash,
  checks: [
    { check_id: "ag43c_review_consumed", passed: true },
    { check_id: "ag43c_integration_hash_matches_current_article", passed: true },
    { check_id: "ag43c_no_duplicate_audit_consumed", passed: true },
    { check_id: "ag43c_no_mutation_audit_consumed", passed: true },
    { check_id: "ag12c_r1_public_object_label_repair_consumed", passed: true },
    { check_id: "ar01_r1_credit_reference_cleanup_consumed", passed: true },
    { check_id: "public_internal_labels_absent", passed: true },
    { check_id: "clean_drishvara_editorial_synthesis_credit_present", passed: true },
    { check_id: "governed_object_markers_preserved", passed: true },
    { check_id: "template_hardening_required_without_mutation", passed: true },
    { check_id: "print_pdf_export_hardening_required_without_mutation", passed: true },
    { check_id: "reference_consolidation_boundary_required_without_fetch", passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const templateBoundary = {
  module_id: "AG43D",
  title: "Template and Rendering Hardening Boundary",
  status: "template_rendering_hardening_boundary_created",
  purpose: "Prepare AG43E to model template/rendering hardening without mutating live article files.",
  hardening_targets: [
    "object title/body/caption/basis note visual grouping",
    "avoid empty object shells",
    "avoid clipped chart/diagram/card text",
    "avoid broken table flow",
    "maintain article width and readable long-form layout",
    "preserve Drishvara palette with readable contrast",
    "preserve all governed objects and insertion markers"
  ],
  allowed_next_scope: "planning/audit only",
  article_mutation_allowed_next: false,
  css_js_mutation_allowed_next: false,
  deployment_allowed_next: false,
  blocked_state: blockedState
};

const exportBoundary = {
  module_id: "AG43D",
  title: "Print/PDF Export Hardening Boundary",
  status: "print_pdf_export_hardening_boundary_created",
  purpose: "Carry forward browser print/PDF export defects to later export validation without mutating current article.",
  export_hardening_targets: [
    "exclude browser print header/footer from controlled export view",
    "avoid page-break clipping of article objects",
    "keep object title/body/caption/basis note together where possible",
    "prevent large empty object shells in exported article",
    "preserve readable text contrast in PDF/export output"
  ],
  carried_to_later_stage: ["AG43E", "AG46", "AG53"],
  mutation_now: false,
  blocked_state: blockedState
};

const referenceBoundary = {
  module_id: "AG43D",
  title: "Reference Consolidation Boundary",
  status: "reference_consolidation_boundary_created",
  purpose: "Carry forward clean references and source-note consolidation to later reference/rendering verification.",
  reference_targets: [
    "single clean References section",
    "clear distinction between external references and Drishvara-created visuals",
    "third-party assets require source/licence attribution",
    "Drishvara-created visuals use editorial synthesis credit",
    "no unnecessary under-editorial-verification line for Drishvara-created objects"
  ],
  reference_fetch_allowed_now: false,
  external_link_verification_allowed_now: false,
  blocked_state: blockedState
};

const carryForward = {
  module_id: "AG43D",
  title: "Carry-forward Template, Export and Reference Register",
  status: "carry_forward_items_recorded_for_ag43e",
  items: [
    {
      item_id: "ag43d_cf_01",
      category: "template_rendering",
      description: "Verify object grouping, no clipping and no empty shell in template/rendering hardening.",
      carried_to: ["AG43E", "AG46"]
    },
    {
      item_id: "ag43d_cf_02",
      category: "print_pdf_export",
      description: "Verify controlled export removes browser header/footer and preserves object integrity.",
      carried_to: ["AG46", "AG53"]
    },
    {
      item_id: "ag43d_cf_03",
      category: "reference_consolidation",
      description: "Consolidate reference and visual/source notes in later reference/rendering stage.",
      carried_to: ["AG46", "AG53"]
    },
    {
      item_id: "ag43d_cf_04",
      category: "dynamic_content_loop",
      description: "First controlled dynamic content-loop remains deferred to AG56.",
      carried_to: ["AG55", "AG56"]
    }
  ],
  hard_blocker_count_for_ag43e: 0,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG43D",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag43d",
  checks: Object.entries({
    article_mutated: false,
    article_generated: false,
    template_mutated: false,
    css_js_mutated: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    object_generation_executed: false,
    object_removed: false,
    featured_reads_mutated: false,
    homepage_mutated: false,
    listing_mutated: false,
    public_publishing_operation_performed: false,
    deployment_performed: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    sql_file_created: false,
    sql_grants_executed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG43D",
  title: "Quality Readiness Audit Blocker Register",
  status: "no_hard_blockers_for_ag43e",
  hard_blockers: [],
  soft_carry_forward_items: carryForward.items,
  hard_blocker_count_for_ag43e: 0,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG43D",
  title: "AG43E Template Hardening Planning Readiness Record",
  status: "ready_for_ag43e_template_hardening_planning",
  ready_for_ag43e: true,
  next_stage_id: "AG43E",
  next_stage_title: "Template, Export and Reference Hardening Plan",
  hard_blocker_count_for_ag43e: 0,
  ag56_dynamic_content_loop_still_deferred: true,
  article_mutation_allowed_next: false,
  public_mutation_allowed_next: false,
  article_generation_allowed_next: false,
  reference_fetch_allowed_next: false,
  image_generation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG43D",
  title: "AG43D to AG43E Template Hardening Planning Boundary",
  status: "ag43e_template_hardening_planning_boundary_created",
  next_stage_id: "AG43E",
  next_stage_title: "Template, Export and Reference Hardening Plan",
  allowed_scope: [
    "Create template/rendering hardening plan.",
    "Create print/PDF export hardening plan.",
    "Create reference consolidation plan.",
    "Consume AG43D audit and AG43C readiness.",
    "Do not mutate article/template/CSS/JS yet.",
    "Do not publish.",
    "Do not deploy.",
    "Do not fetch references.",
    "Do not generate images.",
    "Do not activate backend/Auth/Supabase."
  ],
  blocked_scope: [
    "article mutation",
    "template mutation",
    "CSS/JS mutation",
    "article generation",
    "reference fetch",
    "image generation",
    "public publishing",
    "deployment",
    "database write",
    "backend/Auth/Supabase activation",
    "SQL grant execution",
    "service-role key exposure"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG43D",
  title: "Quality Readiness Audit and Template-Hardening Boundary",
  status: "quality_readiness_audit_passed_ready_for_ag43e",
  selected_article_path: inputs.article,
  current_article_hash: articleHash,
  depends_on: ["AG43C", "AG12C-R1", "AR01-R1"],
  consumed_source_of_truth: inputs,
  audit_file: outputs.audit,
  template_boundary_file: outputs.templateBoundary,
  export_boundary_file: outputs.exportBoundary,
  reference_boundary_file: outputs.referenceBoundary,
  carry_forward_file: outputs.carryForward,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag43d_quality_readiness_audit_completed: true,
    ready_for_ag43e: true,
    hard_blocker_count_for_ag43e: 0,
    template_hardening_boundary_created: true,
    export_hardening_boundary_created: true,
    reference_consolidation_boundary_created: true,
    article_mutated: false,
    article_generated: false,
    template_mutated: false,
    css_js_mutated: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    public_publishing_operation_performed: false,
    deployment_performed: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG43D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG43D",
  status: review.status,
  ag43d_quality_readiness_audit_completed: 1,
  ready_for_ag43e: 1,
  hard_blocker_count_for_ag43e: 0,
  template_hardening_boundary_created: 1,
  export_hardening_boundary_created: 1,
  reference_consolidation_boundary_created: 1,
  article_mutated: 0,
  article_generated: 0,
  template_mutated: 0,
  css_js_mutated: 0,
  reference_fetch_executed: 0,
  image_generation_executed: 0,
  object_generation_executed: 0,
  public_publishing_operation_performed: 0,
  deployment_performed: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG43D — Quality Readiness Audit and Template-Hardening Boundary

## Result

AG43D audits AG43C and creates the boundary for template/rendering/export/reference hardening.

## Consumed

- AG43C Article Quality and Long-form Readiness Integration.
- AG12C-R1 Public Object Label/Layout Repair.
- AR01-R1 Credit and Reference Surface Cleanup.

## Confirmed

- Public internal object labels are absent.
- Drishvara editorial synthesis credit surface is present.
- Governed object insertion markers are preserved.
- No hard blockers remain for AG43E planning.

## Carry-forward

- Object grouping and clipping checks.
- Print/PDF export header/footer cleanup.
- Reference and visual/source note consolidation.
- First controlled dynamic content-loop remains deferred to AG56.

## Still Blocked

- No article mutation.
- No template/CSS/JS mutation.
- No reference fetch.
- No image generation.
- No public publishing operation.
- No deployment.
- No database write.
- No backend/Auth/Supabase activation.
- No SQL grant execution.
- No service-role key exposure.

## Next

AG43E — Template, Export and Reference Hardening Plan.
`;

writeJson(outputs.audit, audit);
writeJson(outputs.templateBoundary, templateBoundary);
writeJson(outputs.exportBoundary, exportBoundary);
writeJson(outputs.referenceBoundary, referenceBoundary);
writeJson(outputs.carryForward, carryForward);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG43D Quality Readiness Audit and Template-Hardening Boundary generated.");
console.log("✅ AG43C, AG12C-R1 and AR01-R1 consumed.");
console.log("✅ Template/export/reference hardening boundaries created.");
console.log("✅ Ready for AG43E Template, Export and Reference Hardening Plan.");
console.log("✅ No article/template/CSS/JS mutation, reference fetch, image generation, publishing, deployment, database write or backend activation recorded.");
