import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08hReview: "data/content-intelligence/quality-reviews/ag08h-post-apply-audit.json",
  ag08hAuditReport: "data/content-intelligence/audit-records/ag08h-post-apply-audit-report.json",
  ag08hRollback: "data/content-intelligence/quality-registry/ag08h-rollback-readiness-record.json",
  ag08gApplyRecord: "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  ag08fApproval: "data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json",
  ag06iVisualStandard: "data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json",
  ag06eLongFormStandard: "data/quality/ag06e-long-form-article-standard.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08i-visual-generation-image-insertion-plan.json");
const visualPlanPath = path.join(root, "data/content-intelligence/visual-registry/ag08i-visual-generation-image-insertion-plan.json");
const controlledPlanPath = path.join(root, "data/content-intelligence/mutation-plans/ag08i-controlled-visual-apply-plan.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag08i-visual-apply-planning-readiness.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/visual-generation-image-insertion-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08i-visual-generation-image-insertion-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag08i-visual-generation-image-insertion-plan.json");
const previewPath = path.join(root, "data/quality/ag08i-visual-generation-image-insertion-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG08I_VISUAL_GENERATION_IMAGE_INSERTION_PLAN.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG08I input ${name}: ${relativePath}`);
  }
}

const ag08hReview = readJson(inputs.ag08hReview);
const ag08hAudit = readJson(inputs.ag08hAuditReport);
const ag08hRollback = readJson(inputs.ag08hRollback);
const ag08gApply = readJson(inputs.ag08gApplyRecord);
const ag08fApproval = readJson(inputs.ag08fApproval);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const ag06eLongFormStandard = readJson(inputs.ag06eLongFormStandard);

const selectedArticlePath = ag08gApply.selected_article_path;
const backupPath = ag08gApply.backup_path;

if (!selectedArticlePath) throw new Error("AG08I selected article path missing from AG08G apply record.");
if (!exists(selectedArticlePath)) throw new Error(`AG08I selected article missing: ${selectedArticlePath}`);
if (!backupPath || !exists(backupPath)) throw new Error(`AG08I rollback backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (ag08hReview.status !== "post_apply_audit_passed") {
  throw new Error("AG08I requires AG08H post-apply audit to pass.");
}

if (ag08hAudit.status !== "post_apply_audit_passed") {
  throw new Error("AG08I requires AG08H audit report to pass.");
}

if (ag08hRollback.status !== "rollback_ready_not_executed") {
  throw new Error("AG08I requires rollback readiness from AG08H.");
}

if (articleHash !== ag08gApply.post_apply_hash) {
  throw new Error("AG08I selected article hash must match AG08G post-apply hash.");
}

const noMutationControls = {
  visual_generation_plan_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag08i: false,
  file_edit_performed_in_ag08i: false,
  selected_article_file_write_performed_in_ag08i: false,
  visual_generation_performed_in_ag08i: false,
  visual_asset_created_in_ag08i: false,
  image_insertion_performed_in_ag08i: false,
  image_file_write_performed_in_ag08i: false,
  css_mutation_performed_in_ag08i: false,
  js_mutation_performed_in_ag08i: false,
  reference_insertion_performed_in_ag08i: false,
  production_jsonl_append_performed_in_ag08i: false,
  database_write_performed_in_ag08i: false,
  supabase_write_performed_in_ag08i: false,
  backend_auth_supabase_activation_performed_in_ag08i: false,
  public_publishing_performed_in_ag08i: false,
  publishing_approval_performed_in_ag08i: false,
  rollback_execution_performed_in_ag08i: false
};

const visualRequirementPlan = {
  target_article_path: selectedArticlePath,
  target_article_hash_at_ag08i: articleHash,
  planning_status: "visual_plan_created_no_asset_generated",
  recommended_visual_type: "editorial_hero_illustration_with_optional_supporting_data_card",
  visual_intent: "Represent digital public healthcare delivery as a human-centred governance system rather than as a decorative technology image.",
  preferred_visual_direction: {
    primary_scene: "A balanced public-health service ecosystem showing a healthcare worker, digital records, telemedicine link, rural patient access and governance dashboard elements.",
    tone: "serious, policy-oriented, human-centred, clean and trustworthy",
    avoid: [
      "stock-photo-like hospital glamour",
      "unverified government logos",
      "medical diagnosis imagery",
      "overly futuristic AI robot imagery",
      "crowded infographic with unreadable text",
      "religious/political symbols unrelated to the article"
    ],
    design_language: "Drishvara editorial illustration; calm, credible, long-form reading support"
  },
  visual_components: [
    {
      component_id: "AG08I-VIS-001",
      component_type: "primary_hero_visual",
      required: true,
      planned_dimensions: {
        recommended_ratio: "16:9",
        minimum_width_px: 1200,
        mobile_safe_crop_required: true
      },
      planned_output_path: "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag08j-primary-hero.webp",
      alt_text_draft: "Illustration of digital public healthcare delivery connecting frontline care, records, telemedicine and governance dashboards.",
      caption_draft: "Digital innovation strengthens public healthcare when technology, frontline service and accountable governance operate together.",
      image_credit_required: true,
      credit_status: "to_be_populated_after_visual_source_or_generation_is_finalised"
    },
    {
      component_id: "AG08I-VIS-002",
      component_type: "supporting_data_or_process_card",
      required: false,
      planned_use: "Optional future visual explaining service-delivery flow from patient access to digital record, teleconsultation, follow-up and governance review.",
      insertion_status: "deferred"
    }
  ],
  source_rights_rules: {
    allowed_sources: [
      "original generated illustration with internal prompt/audit record",
      "properly licensed stock or open-license image with verifiable licence",
      "self-created infographic or editorial SVG with no third-party protected marks"
    ],
    disallowed_sources: [
      "copied news photos without licence",
      "uncredited government or institutional images",
      "images containing protected logos unless usage is clearly lawful and necessary",
      "AI-generated image without internal source/credit disclosure record",
      "medical patient image implying diagnosis or identity"
    ],
    credit_requirement: "Every visual must carry a visible image-credit/attribution block or generated-image disclosure, as applicable.",
    rights_status_before_apply: "must_be_approved_before_any_image_insertion"
  },
  placement_rules: {
    preferred_location: "inside selected article after title/intro area and before first major section, without disrupting AG08G references or legacy governance blocks",
    preserve_required_markers: [
      "AG08G-CONTROLLED-APPLY",
      "AG08G-APPROVED-REFERENCES",
      "AG08G-LEGACY-GOVERNANCE-PRESERVED",
      "data-drishvara-ag03c-b2-reference-block",
      "data-drishvara-ag05d-visible-reference-block"
    ],
    image_wrapper_id: "ag08j-article-visual-block",
    figure_required: true,
    figcaption_required: true,
    alt_text_required: true,
    visible_credit_required: true,
    lazy_loading_allowed: true,
    width_policy: "must not break long-form reading width or mobile layout"
  },
  mobile_layout_checks: [
    "image scales to container width",
    "no horizontal overflow at 360px viewport",
    "caption remains readable",
    "credit block remains visible but not visually dominant",
    "legacy reference blocks remain after article body/reference area",
    "no CLS-heavy layout jump from missing dimensions"
  ],
  fallback_rule: {
    fallback_required: true,
    fallback_option: "category-level policy fallback SVG if visual asset fails or is not approved",
    fallback_must_preserve_article_readability: true,
    fallback_credit_required: true
  }
};

const futureControlledApplyBoundary = {
  next_stage_id: "AG08J",
  next_stage_title: "Visual Candidate Generation / Asset Selection",
  explicit_approval_required: true,
  ag08j_allowed_scope: [
    "create visual candidate artifact only",
    "record prompt/source/licence/credit candidate",
    "record alt text and caption candidate",
    "record planned asset path",
    "do not mutate article HTML unless a later apply stage is explicitly approved"
  ],
  ag08j_blocked_scope: [
    "article mutation",
    "image insertion into selected article",
    "CSS/JS mutation",
    "production JSONL append",
    "database/Supabase write",
    "backend/Auth/Supabase activation",
    "publishing approval"
  ],
  future_apply_stage_recommendation: {
    recommended_stage_id: "AG08K",
    recommended_stage_title: "Controlled Visual Image Insertion Apply",
    preconditions: [
      "AG08J visual candidate generated or selected",
      "source/rights/credit approved",
      "alt text and caption approved",
      "backup path confirmed",
      "exact insertion point confirmed",
      "validate:project clean before apply"
    ],
    allowed_apply_scope_if_later_approved: [
      "create pre-apply backup if current article changed after AG08G backup",
      "insert one approved visual block into selected article",
      "preserve AG08G and legacy governance markers",
      "record apply audit artifacts"
    ]
  }
};

const backupRollbackRequirement = {
  rollback_ready_from_ag08h: true,
  existing_ag08g_backup_path: backupPath,
  ag08i_backup_created: false,
  future_visual_apply_backup_required: true,
  future_backup_rule: "AG08K or any visual insertion apply stage must create a fresh pre-visual-apply backup because the article already changed in AG08G.",
  rollback_execution_performed_in_ag08i: false
};

const readinessChecks = [
  {
    check_id: "AG08I-CHECK-001",
    name: "ag08h_audit_passed",
    status: ag08hReview.status === "post_apply_audit_passed" ? "passed" : "failed",
    evidence: ag08hReview.status
  },
  {
    check_id: "AG08I-CHECK-002",
    name: "selected_article_hash_matches_ag08g_post_apply",
    status: articleHash === ag08gApply.post_apply_hash ? "passed" : "failed",
    evidence: articleHash
  },
  {
    check_id: "AG08I-CHECK-003",
    name: "rollback_ready",
    status: ag08hRollback.status === "rollback_ready_not_executed" ? "passed" : "failed",
    evidence: ag08hRollback.status
  },
  {
    check_id: "AG08I-CHECK-004",
    name: "visual_standard_consumed",
    status: ag06iVisualStandard.module_id === "AG06I" ? "passed" : "failed",
    evidence: ag06iVisualStandard.title
  },
  {
    check_id: "AG08I-CHECK-005",
    name: "visual_plan_created_without_generation",
    status: "passed",
    evidence: "visual_generation_performed_in_ag08i=false"
  },
  {
    check_id: "AG08I-CHECK-006",
    name: "future_apply_boundary_created",
    status: futureControlledApplyBoundary.explicit_approval_required ? "passed" : "failed",
    evidence: futureControlledApplyBoundary.next_stage_id
  }
];

const allChecksPassed = readinessChecks.every((check) => check.status === "passed");

const readinessRecord = {
  module_id: "AG08I",
  title: "Visual Apply Planning Readiness",
  status: allChecksPassed ? "visual_plan_ready_pending_future_explicit_stage" : "visual_plan_review_required",
  selected_article_path: selectedArticlePath,
  readiness_checks: readinessChecks,
  all_readiness_checks_passed: allChecksPassed,
  ag08j_handoff: futureControlledApplyBoundary,
  ...noMutationControls
};

const controlledPlan = {
  module_id: "AG08I",
  title: "Controlled Visual Apply Plan Boundary",
  status: "future_visual_apply_boundary_created_not_executed",
  selected_article_path: selectedArticlePath,
  current_article_hash_at_ag08i: articleHash,
  visual_requirement_plan_file: "data/content-intelligence/visual-registry/ag08i-visual-generation-image-insertion-plan.json",
  future_controlled_apply_boundary: futureControlledApplyBoundary,
  backup_rollback_requirement: backupRollbackRequirement,
  forbidden_in_ag08i: [
    "visual generation",
    "image asset creation",
    "image insertion",
    "article mutation",
    "file edit",
    "CSS/JS mutation",
    "reference insertion",
    "production JSONL append",
    "database/Supabase write",
    "backend/Auth/Supabase activation",
    "publishing approval"
  ],
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag08i: articleHash,
  visual_plan_created: true,
  visual_type_defined: true,
  source_rights_rules_defined: true,
  image_credit_attribution_defined: true,
  alt_text_caption_defined: true,
  placement_rules_defined: true,
  mobile_layout_checks_defined: true,
  fallback_rule_defined: true,
  backup_rollback_requirement_defined: true,
  future_controlled_apply_boundary_defined: true,
  next_stage_id: "AG08J",
  next_stage_title: "Visual Candidate Generation / Asset Selection",
  next_stage_requires_explicit_approval: true,
  production_readiness_after_ag08i: "visual_plan_created_not_apply_ready",
  publish_readiness_after_ag08i: "blocked",
  ...noMutationControls
};

const schema = {
  module_id: "AG08I",
  title: "Visual Generation / Image Insertion Plan Schema",
  status: "schema_visual_plan_only",
  visual_type_definition_allowed_in_ag08i: true,
  source_rights_rule_definition_allowed_in_ag08i: true,
  image_credit_attribution_planning_allowed_in_ag08i: true,
  alt_text_caption_planning_allowed_in_ag08i: true,
  placement_planning_allowed_in_ag08i: true,
  mobile_layout_check_planning_allowed_in_ag08i: true,
  fallback_rule_planning_allowed_in_ag08i: true,
  backup_rollback_requirement_planning_allowed_in_ag08i: true,
  future_apply_boundary_planning_allowed_in_ag08i: true,
  visual_generation_allowed_in_ag08i: false,
  image_asset_creation_allowed_in_ag08i: false,
  image_insertion_allowed_in_ag08i: false,
  article_mutation_allowed_in_ag08i: false,
  file_edit_allowed_in_ag08i: false,
  css_js_mutation_allowed_in_ag08i: false,
  reference_insertion_allowed_in_ag08i: false,
  production_jsonl_append_allowed_in_ag08i: false,
  database_write_allowed_in_ag08i: false,
  supabase_write_allowed_in_ag08i: false,
  backend_auth_supabase_activation_allowed_in_ag08i: false,
  publishing_allowed_in_ag08i: false,
  ...noMutationControls
};

const review = {
  module_id: "AG08I",
  title: "Visual Generation / Image Insertion Plan",
  status: "visual_generation_image_insertion_plan_created",
  planning_only: true,
  depends_on: ["AG08H", "AG08G", "AG06I"],
  generated_from: inputs,
  summary,
  visual_plan_file: "data/content-intelligence/visual-registry/ag08i-visual-generation-image-insertion-plan.json",
  controlled_visual_apply_plan_file: "data/content-intelligence/mutation-plans/ag08i-controlled-visual-apply-plan.json",
  readiness_file: "data/content-intelligence/quality-registry/ag08i-visual-apply-planning-readiness.json",
  schema_file: "data/content-intelligence/schema/visual-generation-image-insertion-plan.schema.json",
  learning_file: "data/content-intelligence/learning/ag08i-visual-generation-image-insertion-plan-learning.json",
  closure_decision: {
    decision: "ag08i_visual_plan_created_pending_explicit_ag08j",
    proceed_to_ag08j_only_with_explicit_user_approval: true,
    selected_article_path: selectedArticlePath,
    visual_generation_performed_in_ag08i: false,
    image_insertion_performed_in_ag08i: false,
    article_mutation_performed_in_ag08i: false,
    file_edit_performed_in_ag08i: false,
    css_mutation_performed_in_ag08i: false,
    js_mutation_performed_in_ag08i: false,
    production_jsonl_append_performed_in_ag08i: false,
    database_write_performed_in_ag08i: false,
    supabase_write_performed_in_ag08i: false,
    backend_auth_supabase_activation_performed_in_ag08i: false,
    public_publishing_performed_in_ag08i: false,
    production_readiness: summary.production_readiness_after_ag08i,
    publish_readiness: summary.publish_readiness_after_ag08i
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG08I",
  title: "Visual Generation / Image Insertion Plan Learning",
  status: "learning_record_only",
  summary,
  ag08i_learning_points: [
    "Visual generation should be separated from text/reference article mutation.",
    "Image insertion needs a rights, credit, alt-text and layout plan before any asset is created.",
    "A fresh backup is needed before future visual insertion, even though AG08G backup exists.",
    "The first visual stage should produce candidate assets only; insertion should be a later controlled apply.",
    "Legacy governance/reference markers must be protected during any future visual insertion."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG08I",
  title: "Visual Generation / Image Insertion Plan",
  status: "visual_generation_image_insertion_plan_created",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08i-visual-generation-image-insertion-plan.json",
    visual_plan: "data/content-intelligence/visual-registry/ag08i-visual-generation-image-insertion-plan.json",
    controlled_visual_apply_plan: "data/content-intelligence/mutation-plans/ag08i-controlled-visual-apply-plan.json",
    readiness: "data/content-intelligence/quality-registry/ag08i-visual-apply-planning-readiness.json",
    schema: "data/content-intelligence/schema/visual-generation-image-insertion-plan.schema.json",
    learning: "data/content-intelligence/learning/ag08i-visual-generation-image-insertion-plan-learning.json",
    preview: "data/quality/ag08i-visual-generation-image-insertion-plan-preview.json",
    document: "docs/quality/AG08I_VISUAL_GENERATION_IMAGE_INSERTION_PLAN.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG08I",
  preview_only: true,
  planning_only: true,
  status: "visual_generation_image_insertion_plan_created",
  summary,
  visual_requirement_plan: {
    recommended_visual_type: visualRequirementPlan.recommended_visual_type,
    visual_intent: visualRequirementPlan.visual_intent,
    primary_component: visualRequirementPlan.visual_components[0],
    source_rights_rules: visualRequirementPlan.source_rights_rules,
    placement_rules: visualRequirementPlan.placement_rules,
    mobile_layout_checks: visualRequirementPlan.mobile_layout_checks,
    fallback_rule: visualRequirementPlan.fallback_rule
  },
  future_controlled_apply_boundary: futureControlledApplyBoundary,
  ...noMutationControls
};

const doc = `# AG08I — Visual Generation / Image Insertion Plan

## Purpose

AG08I defines the visual generation and image insertion plan for the AG08G-upgraded article.

AG08I is planning-only. It does not generate a visual, create an image file, insert an image, mutate the article, edit CSS/JS, append production JSONL records, write to database/Supabase, activate backend/Auth/Supabase, or approve publishing.

## Target Article

- Path: \`${selectedArticlePath}\`
- Article hash at AG08I: \`${articleHash}\`

## Planned Visual Type

\`${visualRequirementPlan.recommended_visual_type}\`

## Visual Intent

${visualRequirementPlan.visual_intent}

## Source and Rights Rules

Allowed visual sources:

${visualRequirementPlan.source_rights_rules.allowed_sources.map((item) => `- ${item}`).join("\n")}

Disallowed visual sources:

${visualRequirementPlan.source_rights_rules.disallowed_sources.map((item) => `- ${item}`).join("\n")}

## Required Metadata

- Alt text: required
- Caption: required
- Visible credit / attribution: required
- Source / rights record: required
- Mobile-safe layout: required
- Fallback rule: required

## Future Apply Boundary

AG08J may only generate or select a visual candidate if explicitly approved.

Actual image insertion should be deferred to a later controlled apply stage after candidate visual, source/rights, credit, alt text and placement are approved.

## Exclusions

AG08I performs no visual generation, no image insertion, no article mutation, no file edit, no CSS/JS mutation, no JSONL append, no database/Supabase write, no backend/Auth/Supabase activation and no publishing approval.
`;

writeJson(reviewPath, review);
writeJson(visualPlanPath, visualRequirementPlan);
writeJson(controlledPlanPath, controlledPlan);
writeJson(readinessPath, readinessRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG08I attempted to mutate the selected article. Refusing to continue.");
}

console.log("✅ AG08I visual generation / image insertion plan artifacts generated.");
console.log(`✅ Plan target: ${selectedArticlePath}`);
console.log("✅ No visual generation, image insertion, article mutation or file edit performed.");
console.log("✅ AG08J handoff created with explicit approval required.");
