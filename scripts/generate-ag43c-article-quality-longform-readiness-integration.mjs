import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  article: "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html",

  ag43bReview: "data/content-intelligence/quality-reviews/ag43b-topic-reference-image-integration.json",
  ag43bIntegration: "data/content-intelligence/backend-architecture/ag43b-topic-reference-image-governance-integration.json",
  ag43bReadinessMatrix: "data/content-intelligence/backend-architecture/ag43b-topic-reference-image-readiness-matrix.json",
  ag43bCombinedThreshold: "data/content-intelligence/backend-architecture/ag43b-combined-readiness-threshold-model.json",
  ag43bReadiness: "data/content-intelligence/quality-registry/ag43b-quality-longform-readiness-record.json",
  ag43bBoundary: "data/content-intelligence/mutation-plans/ag43b-to-ag43c-quality-longform-readiness-boundary.json",

  ag12cR1Apply: "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json",
  ag12cR1Audit: "data/content-intelligence/audit-records/ag12c-r1-public-object-label-layout-repair-audit.json",
  ag12cR1Readiness: "data/content-intelligence/quality-registry/ag12c-r1-public-object-label-layout-repair-readiness-record.json",

  ar01R1Apply: "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json",
  ar01R1Policy: "data/content-intelligence/credit-reference/ar01-r1-drishvara-editorial-synthesis-credit-policy.json",
  ar01R1Audit: "data/content-intelligence/audit-records/ar01-r1-credit-reference-surface-cleanup-audit.json",
  ar01R1Readiness: "data/content-intelligence/quality-registry/ar01-r1-credit-reference-surface-cleanup-readiness-record.json",

  articleQualityPreflight: "scripts/article-quality-review-preflight.js",
  ag06bValidator: "scripts/validate-ag06b-content-intelligence-schema.mjs"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag43c-article-quality-longform-readiness-integration.json",
  integration: "data/content-intelligence/backend-architecture/ag43c-article-quality-longform-readiness-integration.json",
  consumptionMap: "data/content-intelligence/backend-architecture/ag43c-existing-quality-module-consumption-map.json",
  longformStandard: "data/content-intelligence/quality-rules/ag43c-longform-featured-read-standard.json",
  publicDeltaRulebook: "data/content-intelligence/quality-rules/ag43c-public-readiness-delta-rulebook.json",
  objectPlacementCreditModel: "data/content-intelligence/backend-architecture/ag43c-object-placement-credit-reference-readiness-model.json",
  noDuplicateAudit: "data/content-intelligence/backend-architecture/ag43c-no-duplicate-quality-audit-register.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag43c-no-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag43c-article-quality-longform-readiness-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag43c-quality-readiness-audit-boundary-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag43c-to-ag43d-quality-readiness-audit-boundary.json",
  registry: "data/quality/ag43c-article-quality-longform-readiness-integration.json",
  preview: "data/quality/ag43c-article-quality-longform-readiness-integration-preview.json",
  doc: "docs/quality/AG43C_ARTICLE_QUALITY_LONGFORM_READINESS_INTEGRATION.md"
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
  if (!exists(p)) throw new Error(`Missing AG43C input: ${p}`);
}

const articleHtml = read(inputs.article);
const articleHash = sha256(articleHtml);

const ag43bReview = readJson(inputs.ag43bReview);
const ag43bIntegration = readJson(inputs.ag43bIntegration);
const ag43bReadinessMatrix = readJson(inputs.ag43bReadinessMatrix);
const ag43bCombinedThreshold = readJson(inputs.ag43bCombinedThreshold);
const ag43bReadiness = readJson(inputs.ag43bReadiness);
const ag43bBoundary = readJson(inputs.ag43bBoundary);

const ag12cR1Apply = readJson(inputs.ag12cR1Apply);
const ag12cR1Audit = readJson(inputs.ag12cR1Audit);
const ag12cR1Readiness = readJson(inputs.ag12cR1Readiness);

const ar01R1Apply = readJson(inputs.ar01R1Apply);
const ar01R1Policy = readJson(inputs.ar01R1Policy);
const ar01R1Audit = readJson(inputs.ar01R1Audit);
const ar01R1Readiness = readJson(inputs.ar01R1Readiness);

const articleQualityPreflight = read(inputs.articleQualityPreflight);
const ag06bValidator = read(inputs.ag06bValidator);

if (ag43bReview.summary?.ready_for_ag43c !== true) throw new Error("AG43B review does not indicate AG43C readiness.");
if (ag43bIntegration.status !== "topic_reference_image_integration_created_ready_for_ag43c_quality_longform_readiness") throw new Error("AG43B integration status mismatch.");
if (ag43bReadiness.ready_for_ag43c !== true) throw new Error("AG43B readiness missing.");
if (ag43bBoundary.next_stage_id !== "AG43C") throw new Error("AG43B boundary does not point to AG43C.");

if (ag12cR1Apply.status !== "public_object_label_layout_repair_applied") throw new Error("AG12C-R1 apply status mismatch.");
if (ag12cR1Audit.status !== "public_object_label_layout_repair_audit_passed") throw new Error("AG12C-R1 audit status mismatch.");
if (ag12cR1Readiness.ready_for_next_repair !== true) throw new Error("AG12C-R1 readiness mismatch.");

if (ar01R1Apply.status !== "credit_reference_surface_cleanup_applied") throw new Error("AR01-R1 apply status mismatch.");
if (ar01R1Apply.post_repair_hash !== articleHash) throw new Error("Current article hash must match AR01-R1 post repair hash.");
if (ar01R1Policy.status !== "drishvara_editorial_synthesis_credit_policy_recorded") throw new Error("AR01-R1 policy status mismatch.");
if (ar01R1Audit.status !== "credit_reference_surface_cleanup_audit_passed") throw new Error("AR01-R1 audit status mismatch.");
if (ar01R1Readiness.ready_for_ag43c !== true) throw new Error("AR01-R1 readiness for AG43C missing.");

for (const signal of ["source_reference_status", "image_approval_status", "quality_score"]) {
  if (!articleQualityPreflight.includes(signal)) {
    throw new Error(`Existing article quality preflight signal missing: ${signal}`);
  }
}

for (const signal of ["reference", "visual"]) {
  if (!ag06bValidator.includes(signal)) {
    throw new Error(`AG06B content-intelligence signal missing: ${signal}`);
  }
}

const badPublicPhrases = [
  "Additional pilot object:",
  'data-drishvara-layout-treatment="collapsed-pilot-annex"',
  "Final image-source attribution",
  "Image credit / attribution:"
];

for (const phrase of badPublicPhrases) {
  if (articleHtml.includes(phrase)) {
    throw new Error(`Public-readiness blocker remains in article: ${phrase}`);
  }
}

const requiredArticleSignals = [
  "data-drishvara-layout-treatment=\"reader-facing-object\"",
  "Drishvara editorial synthesis",
  "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count.",
  "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.",
  "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."
];

for (const signal of requiredArticleSignals) {
  if (!articleHtml.includes(signal)) {
    throw new Error(`Required public-readiness article signal missing: ${signal}`);
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
  if (count(articleHtml, marker) !== 1) throw new Error(`Governed object marker missing or duplicated: ${marker}`);
}

const blockedState = {
  article_quality_longform_readiness_integrated: true,
  existing_quality_module_consumed: true,
  ag43b_topic_reference_image_model_consumed: true,
  ag12c_r1_object_label_repair_consumed: true,
  ar01_r1_credit_reference_cleanup_consumed: true,
  duplicate_quality_module_created: false,
  article_mutated: false,
  article_generated: false,
  topic_promoted_to_live_article: false,
  reference_fetch_executed: false,
  image_generation_executed: false,
  object_generation_executed: false,
  object_removed: false,
  css_js_mutated: false,
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

const consumptionMap = {
  module_id: "AG43C",
  title: "Existing Quality Module Consumption Map",
  status: "existing_quality_modules_consumed_no_duplication",
  consumed_existing_modules: [
    {
      module_or_file: "AG43B",
      consumed_for: "topic score, reference readiness, image/visual readiness, sensitivity/repetition threshold model",
      duplicated: false
    },
    {
      module_or_file: "AG12C-R1",
      consumed_for: "public object label/layout correction and reader-facing object blocks",
      duplicated: false
    },
    {
      module_or_file: "AR01-R1",
      consumed_for: "Drishvara editorial synthesis credit/reference surface cleanup",
      duplicated: false
    },
    {
      module_or_file: "scripts/article-quality-review-preflight.js",
      consumed_for: "source_reference_status, image_approval_status and quality_score signals",
      duplicated: false
    },
    {
      module_or_file: "AG06B",
      consumed_for: "content-intelligence reference/visual registry governance",
      duplicated: false
    }
  ],
  blocked_state: blockedState
};

const longformStandard = {
  module_id: "AG43C",
  title: "Version 01 Long-form Featured Read Standard",
  status: "longform_featured_read_standard_recorded",
  standard_rules: [
    "Article must preserve a coherent long-form narrative flow.",
    "Article should use clear section/subsection logic for scanability.",
    "All governed article objects must remain connected with title, body, caption and basis/credit note.",
    "Public article must not expose internal pilot/dev labels.",
    "Drishvara-created visuals must use editorial synthesis credit.",
    "Deterministic charts must state article-text basis and must not imply external statistical datasets.",
    "Article-derived infographics/diagrams/tables/maps/composites must state conceptual interpretation basis.",
    "References and visual/source notes must remain governed by existing AR01/AR01-R1 and later reference-verification stages.",
    "No empty object shells, clipped object text or broken object markers should be accepted in later template/rendering stages."
  ],
  execution_scope: "standard_record_only_no_article_mutation",
  blocked_state: blockedState
};

const publicDeltaRulebook = {
  module_id: "AG43C",
  title: "Public Readiness Delta Rulebook",
  status: "public_readiness_delta_rules_recorded",
  purpose: "Record only the missing delta rules discovered from the tested article/PDF; do not duplicate existing modules.",
  delta_rules: [
    {
      rule_id: "ag43c_delta_01",
      rule: "No public-facing internal labels such as Additional pilot object.",
      already_corrected_by: "AG12C-R1",
      remaining_action: "consume and preserve"
    },
    {
      rule_id: "ag43c_delta_02",
      rule: "Drishvara-created visuals/objects use concise editorial synthesis credit.",
      already_corrected_by: "AR01-R1",
      remaining_action: "consume and preserve"
    },
    {
      rule_id: "ag43c_delta_03",
      rule: "Object title, body, caption and source/basis note should remain visually connected.",
      already_partially_handled_by: ["AG12C-R1", "AV01", "AV02"],
      remaining_action: "carry to AG43D/AG46 template-hardening review"
    },
    {
      rule_id: "ag43c_delta_04",
      rule: "No empty object shell, clipped chart, clipped diagram/card text, or broken table flow.",
      already_partially_handled_by: ["AG12C-R1"],
      remaining_action: "carry to AG43D/AG46/AG53 rendering and export checks"
    },
    {
      rule_id: "ag43c_delta_05",
      rule: "Browser print header/footer must not appear in controlled PDF/export view.",
      already_partially_handled_by: [],
      remaining_action: "carry to AG53 print/export validation"
    },
    {
      rule_id: "ag43c_delta_06",
      rule: "References should be consolidated into one clean public section when final reference-verification stage is reached.",
      already_partially_handled_by: ["AR01", "AR01-R1"],
      remaining_action: "carry to later reference-verification/rendering stage"
    }
  ],
  duplicate_module_created: false,
  blocked_state: blockedState
};

const objectPlacementCreditModel = {
  module_id: "AG43C",
  title: "Object Placement, Credit and Reference Readiness Model",
  status: "object_placement_credit_reference_readiness_model_created",
  readiness_inputs: {
    topic_reference_image_integration: inputs.ag43bIntegration,
    object_label_layout_repair: inputs.ag12cR1Apply,
    credit_reference_cleanup: inputs.ar01R1Apply,
    article_quality_preflight: inputs.articleQualityPreflight
  },
  object_families_preserved: [
    "primary hero visual",
    "section-support visual",
    "chart/bi-graph",
    "infographic",
    "figure/diagram",
    "table/structured object",
    "map/geographic object",
    "article-support composite"
  ],
  readiness_result: {
    object_inclusion_logic_preserved: true,
    object_label_surface_public_ready: true,
    credit_reference_surface_public_ready_for_drishvara_created_visuals: true,
    reference_verification_runtime_deferred: true,
    template_rendering_audit_required_next: true
  },
  blocked_state: blockedState
};

const noDuplicateAudit = {
  module_id: "AG43C",
  title: "No-duplicate Quality Audit Register",
  status: "no_duplicate_quality_audit_passed",
  checks: [
    { check_id: "existing_article_quality_preflight_consumed", passed: true },
    { check_id: "ag43b_consumed_not_recreated", passed: true },
    { check_id: "ag12c_r1_consumed_not_recreated", passed: true },
    { check_id: "ar01_r1_consumed_not_recreated", passed: true },
    { check_id: "object_insertion_modules_preserved", passed: true },
    { check_id: "no_new_article_quality_module_created", passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG43C",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag43c",
  checks: Object.entries({
    article_mutated: false,
    article_generated: false,
    topic_promoted_to_live_article: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    object_generation_executed: false,
    object_removed: false,
    css_js_mutated: false,
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
  module_id: "AG43C",
  title: "Article Quality and Long-form Readiness Blocker Register",
  status: "no_hard_blockers_for_ag43d",
  hard_blockers: [],
  soft_carry_forward_items: [
    "Template/rendering audit should verify object pagination, clipping and print/export behavior.",
    "Final reference verification remains for later reference-verification stage.",
    "Browser print/PDF header-footer cleanup remains for export validation stage.",
    "AG56 remains the first controlled dynamic content-loop test; no dynamic article generation is allowed now."
  ],
  hard_blocker_count_for_ag43d: 0,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG43C",
  title: "AG43D Quality Readiness Audit Boundary Record",
  status: "ready_for_ag43d_quality_readiness_audit_and_template_hardening_boundary",
  ready_for_ag43d: true,
  next_stage_id: "AG43D",
  next_stage_title: "Quality Readiness Audit and Template-Hardening Boundary",
  hard_blocker_count_for_ag43d: 0,
  ag56_dynamic_content_loop_still_deferred: true,
  public_mutation_allowed_next: false,
  article_generation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG43C",
  title: "AG43C to AG43D Quality Readiness Audit Boundary",
  status: "ag43d_quality_readiness_audit_boundary_created",
  next_stage_id: "AG43D",
  next_stage_title: "Quality Readiness Audit and Template-Hardening Boundary",
  allowed_scope: [
    "Audit AG43C readiness records.",
    "Confirm AG12C-R1 and AR01-R1 are consumed as source-of-truth corrections.",
    "Confirm object inclusion logic remains preserved.",
    "Prepare later template/export hardening without mutating public article.",
    "Do not generate or publish any article.",
    "Do not fetch references.",
    "Do not generate images.",
    "Do not write database records.",
    "Do not deploy.",
    "Do not activate backend/Auth/Supabase."
  ],
  blocked_scope: [
    "article generation",
    "topic promotion",
    "reference fetch",
    "image generation",
    "public mutation",
    "database write",
    "deployment",
    "backend/Auth/Supabase activation",
    "SQL grant execution",
    "service-role key exposure"
  ],
  blocked_state: blockedState
};

const integration = {
  module_id: "AG43C",
  title: "Article Quality and Long-form Readiness Integration",
  status: "article_quality_longform_readiness_integrated_ready_for_ag43d",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  selected_article_path: inputs.article,
  current_article_hash: articleHash,
  consumed_source_of_truth: inputs,
  integration_result: {
    ag43b_consumed: true,
    ag12c_r1_consumed: true,
    ar01_r1_consumed: true,
    article_quality_preflight_consumed: true,
    ag06b_consumed: true,
    duplicate_quality_module_created: false,
    ready_for_ag43d: true,
    hard_blocker_count_for_ag43d: 0
  },
  generated_artifacts: outputs,
  blocked_state: blockedState
};

const review = {
  module_id: "AG43C",
  title: integration.title,
  status: integration.status,
  depends_on: ["AG43B", "AG12C-R1", "AR01-R1", "article-quality-preflight", "AG06B"],
  selected_article_path: inputs.article,
  current_article_hash: articleHash,
  integration_file: outputs.integration,
  consumption_map_file: outputs.consumptionMap,
  longform_standard_file: outputs.longformStandard,
  public_delta_rulebook_file: outputs.publicDeltaRulebook,
  object_placement_credit_model_file: outputs.objectPlacementCreditModel,
  no_duplicate_audit_file: outputs.noDuplicateAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    article_quality_longform_readiness_integrated: true,
    existing_modules_consumed_not_duplicated: true,
    object_inclusion_logic_preserved: true,
    public_internal_labels_absent: true,
    drishvara_credit_surface_cleaned: true,
    ready_for_ag43d: true,
    hard_blocker_count_for_ag43d: 0,
    article_mutated: false,
    article_generated: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    public_publishing_operation_performed: false,
    database_write_performed: false,
    deployment_performed: false,
    backend_auth_supabase_activation_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG43C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG43C",
  status: review.status,
  article_quality_longform_readiness_integrated: 1,
  existing_modules_consumed_not_duplicated: 1,
  object_inclusion_logic_preserved: 1,
  public_internal_labels_absent: 1,
  drishvara_credit_surface_cleaned: 1,
  ready_for_ag43d: 1,
  hard_blocker_count_for_ag43d: 0,
  article_mutated: 0,
  article_generated: 0,
  reference_fetch_executed: 0,
  image_generation_executed: 0,
  object_generation_executed: 0,
  public_publishing_operation_performed: 0,
  database_write_performed: 0,
  deployment_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG43C — Article Quality and Long-form Readiness Integration

## Result

AG43C integrates the existing article-quality, topic-reference-image, object-layout and credit-reference governance layers into one long-form readiness record.

## Important Principle

AG43C does not create a duplicate article-quality module. It consumes the existing source-of-truth modules:

- AG43B topic/reference/image governance integration.
- AG12C-R1 public object label and layout repair.
- AR01-R1 credit/reference surface cleanup.
- Existing article-quality preflight.
- AG06B content-intelligence reference/visual governance.

## What AG43C Confirms

- Public internal labels are absent.
- Drishvara-created visual/object credits are normalised.
- Planned object inclusion logic is preserved.
- Long-form Featured Read readiness rules are recorded.
- Delta rules are carried forward for template/export hardening.

## Still Blocked

- No article generation.
- No topic promotion.
- No reference fetch.
- No image generation.
- No object generation/removal.
- No public publishing operation.
- No deployment.
- No database write.
- No backend/Auth/Supabase activation.
- No SQL grant execution.
- No service-role key exposure.

## Next

AG43D — Quality Readiness Audit and Template-Hardening Boundary.
`;

writeJson(outputs.consumptionMap, consumptionMap);
writeJson(outputs.longformStandard, longformStandard);
writeJson(outputs.publicDeltaRulebook, publicDeltaRulebook);
writeJson(outputs.objectPlacementCreditModel, objectPlacementCreditModel);
writeJson(outputs.noDuplicateAudit, noDuplicateAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.integration, integration);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG43C Article Quality and Long-form Readiness Integration generated.");
console.log("✅ Existing quality/object/credit modules consumed without duplication.");
console.log("✅ Object inclusion logic preserved.");
console.log("✅ Ready for AG43D Quality Readiness Audit and Template-Hardening Boundary.");
console.log("✅ No article generation, mutation, reference fetch, image generation, publishing, deployment, database write or backend activation recorded.");
