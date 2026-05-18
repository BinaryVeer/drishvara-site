import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08iReview: "data/content-intelligence/quality-reviews/ag08i-visual-generation-image-insertion-plan.json",
  ag08iVisualPlan: "data/content-intelligence/visual-registry/ag08i-visual-generation-image-insertion-plan.json",
  ag08iControlledPlan: "data/content-intelligence/mutation-plans/ag08i-controlled-visual-apply-plan.json",
  ag08iReadiness: "data/content-intelligence/quality-registry/ag08i-visual-apply-planning-readiness.json",
  ag08hReview: "data/content-intelligence/quality-reviews/ag08h-post-apply-audit.json",
  ag08gApplyRecord: "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08j-visual-candidate-generation-asset-selection.json");
const candidatePath = path.join(root, "data/content-intelligence/visual-registry/ag08j-visual-candidate-record.json");
const layoutDoctrinePath = path.join(root, "data/content-intelligence/visual-registry/ag08j-article-object-placement-doctrine.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag08j-visual-candidate-readiness.json");
const applyBoundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag08j-to-ag08k-controlled-visual-insertion-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/visual-candidate-generation-asset-selection.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08j-visual-candidate-generation-asset-selection-learning.json");
const registryPath = path.join(root, "data/quality/ag08j-visual-candidate-generation-asset-selection.json");
const previewPath = path.join(root, "data/quality/ag08j-visual-candidate-generation-asset-selection-preview.json");
const docPath = path.join(root, "docs/quality/AG08J_VISUAL_CANDIDATE_GENERATION_ASSET_SELECTION.md");

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
    throw new Error(`Missing required AG08J input ${name}: ${relativePath}`);
  }
}

const ag08iReview = readJson(inputs.ag08iReview);
const ag08iVisualPlan = readJson(inputs.ag08iVisualPlan);
const ag08iControlledPlan = readJson(inputs.ag08iControlledPlan);
const ag08iReadiness = readJson(inputs.ag08iReadiness);
const ag08hReview = readJson(inputs.ag08hReview);
const ag08gApply = readJson(inputs.ag08gApplyRecord);

if (ag08iReview.status !== "visual_generation_image_insertion_plan_created") {
  throw new Error("AG08J requires AG08I plan to be created.");
}

if (ag08iReadiness.status !== "visual_plan_ready_pending_future_explicit_stage") {
  throw new Error("AG08J requires AG08I readiness to pass.");
}

if (ag08hReview.status !== "post_apply_audit_passed") {
  throw new Error("AG08J requires AG08H audit to pass.");
}

const selectedArticlePath = ag08gApply.selected_article_path;

if (!selectedArticlePath || !exists(selectedArticlePath)) {
  throw new Error(`AG08J selected article missing: ${selectedArticlePath}`);
}

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag08gApply.post_apply_hash) {
  throw new Error("AG08J selected article hash must match AG08G post-apply hash.");
}

const noMutationControls = {
  visual_candidate_stage_only: true,
  candidate_record_created: true,
  actual_visual_generation_performed_in_ag08j: false,
  image_asset_created_in_ag08j: false,
  image_file_write_performed_in_ag08j: false,
  image_insertion_performed_in_ag08j: false,
  article_mutation_performed_in_ag08j: false,
  file_edit_performed_in_ag08j: false,
  selected_article_file_write_performed_in_ag08j: false,
  css_mutation_performed_in_ag08j: false,
  js_mutation_performed_in_ag08j: false,
  reference_insertion_performed_in_ag08j: false,
  production_jsonl_append_performed_in_ag08j: false,
  database_write_performed_in_ag08j: false,
  supabase_write_performed_in_ag08j: false,
  backend_auth_supabase_activation_performed_in_ag08j: false,
  public_publishing_performed_in_ag08j: false,
  publishing_approval_performed_in_ag08j: false,
  rollback_execution_performed_in_ag08j: false
};

const layoutDoctrine = {
  module_id: "AG08J",
  title: "Article Object Placement Doctrine",
  status: "layout_doctrine_created",
  selected_article_path: selectedArticlePath,
  doctrine_basis: "Approved visual/object placement must preserve article shape, justified text, reading width and mobile readability.",
  global_article_layout_rules: {
    preserve_article_shape: true,
    main_text_must_remain_justified: true,
    object_must_not_deform_reading_column: true,
    object_must_not_break_mobile_layout: true,
    object_must_not_disturb_references_or_legacy_governance_blocks: true,
    object_must_not_create_horizontal_overflow: true
  },
  object_type_rules: {
    hero_image: {
      preferred_location: "near/top of article after heading/intro as already planned",
      alignment: "centered within article reading column",
      text_wrap: "not_required",
      width_behavior: "full readable column width, mobile-safe",
      notes: "Hero image may remain top-positioned; it must not disturb title, introduction, AG08G references or legacy governance blocks."
    },
    infographic: {
      preferred_location: "after relevant section paragraph, before next major section",
      alignment: "centered",
      text_wrap: "allowed_only_if_readability_is_preserved",
      width_behavior: "contained within reading column",
      notes: "Infographic should support the argument, not dominate the article."
    },
    graph_or_chart: {
      preferred_location: "near the paragraph interpreting the data",
      alignment: "centered",
      text_wrap: "not_preferred_for_dense_charts",
      width_behavior: "responsive, readable labels, no overflow",
      notes: "Charts must include caption, source note and accessible alt text."
    },
    table: {
      preferred_location: "after the explanatory paragraph introducing the data",
      alignment: "centered within vertical reading flow",
      text_wrap: "not_allowed",
      width_behavior: "responsive table wrapper required in future apply",
      notes: "Tables with data must remain centrally aligned and must not compress body text."
    },
    figure_or_diagram: {
      preferred_location: "near concept explanation",
      alignment: "centered",
      text_wrap: "allowed only around object boundary if visually stable",
      width_behavior: "bounded figure block",
      notes: "Conceptual figures should preserve vertical flow and not split critical paragraphs."
    },
    map: {
      preferred_location: "only where geographic explanation is necessary",
      alignment: "centered",
      text_wrap: "not_preferred",
      width_behavior: "responsive, captioned, source credited",
      notes: "Maps require stronger source/rights and accuracy review."
    }
  },
  future_validation_requirements: [
    "Hero/image/figure/table must remain within article reading column.",
    "Main article text remains justified after insertion.",
    "No object overlaps references, footer or legacy governance blocks.",
    "No horizontal overflow at mobile width.",
    "Tables use responsive wrapper and are centrally aligned.",
    "Graphs/figures include source/caption/alt text.",
    "Text wrapping is allowed only where it preserves readability and object boundary integrity."
  ],
  ...noMutationControls
};

const candidateRecord = {
  module_id: "AG08J",
  title: "Visual Candidate Record",
  status: "visual_candidate_record_created_no_asset_generated",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag08j: articleHash,
  source_plan_consumed_from_ag08i: {
    recommended_visual_type: ag08iVisualPlan.recommended_visual_type,
    visual_intent: ag08iVisualPlan.visual_intent,
    primary_planned_output_path: ag08iVisualPlan.visual_components?.[0]?.planned_output_path || null
  },
  candidate_visuals: [
    {
      candidate_id: "AG08J-CANDIDATE-001",
      candidate_status: "candidate_prompt_ready_no_asset_generated",
      candidate_type: "primary_hero_visual",
      recommended_for_first_visual_apply: true,
      planned_asset_path: "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag08j-primary-hero.webp",
      planned_fallback_path: "assets/articles/policy/policy-fallback.svg",
      prompt_brief: "Create a clean editorial illustration showing digital public healthcare delivery as a human-centred system: frontline healthcare worker, patient access, digital health record, telemedicine connection, and governance dashboard signals. Keep the tone serious, trustworthy, policy-oriented and non-promotional. Avoid logos, political symbols, identifiable patient imagery, diagnosis imagery and futuristic robot clichés.",
      negative_prompt_guidance: [
        "no real government logos",
        "no political symbols",
        "no identifiable patient face",
        "no diagnosis/procedure scene",
        "no crowded unreadable text",
        "no AI robot dominance"
      ],
      source_rights_status: "pending_generation_or_source_selection",
      licence_status: "pending",
      credit_status: "pending_final_source_or_generation_record",
      visible_credit_draft: "Image: Drishvara editorial visual / generated or sourced visual pending final attribution.",
      alt_text_draft: ag08iVisualPlan.visual_components?.[0]?.alt_text_draft || "Illustration of digital public healthcare delivery connecting frontline care, records, telemedicine and governance dashboards.",
      caption_draft: ag08iVisualPlan.visual_components?.[0]?.caption_draft || "Digital innovation strengthens public healthcare when technology, frontline service and accountable governance operate together.",
      placement_recommendation: {
        placement_type: "hero_image_near_top",
        planned_wrapper_id: "ag08k-article-hero-visual-block",
        alignment: "centered",
        text_wrap: "not_required",
        preserve_article_shape: true,
        preserve_justified_text: true,
        preserve_legacy_governance_blocks: true,
        mobile_safe_required: true
      },
      generation_performed: false,
      asset_created: false,
      inserted_into_article: false
    },
    {
      candidate_id: "AG08J-CANDIDATE-002",
      candidate_status: "optional_future_candidate_not_generated",
      candidate_type: "process_figure",
      recommended_for_first_visual_apply: false,
      planned_asset_path: null,
      prompt_brief: "Optional future figure showing public healthcare digital service flow from patient access to digital record, teleconsultation, follow-up and governance review.",
      placement_recommendation: {
        placement_type: "centered_inline_figure",
        alignment: "centered",
        text_wrap: "allowed_only_if_readability_is_preserved",
        preserve_article_shape: true,
        preserve_justified_text: true,
        mobile_safe_required: true
      },
      generation_performed: false,
      asset_created: false,
      inserted_into_article: false
    },
    {
      candidate_id: "AG08J-CANDIDATE-003",
      candidate_status: "optional_future_candidate_not_generated",
      candidate_type: "data_table_or_graph",
      recommended_for_first_visual_apply: false,
      planned_asset_path: null,
      prompt_brief: "Optional future table/graph only if verified data is available; must be centrally aligned and source-labelled.",
      placement_recommendation: {
        placement_type: "centered_data_block",
        alignment: "centered",
        text_wrap: "not_allowed_for_tables",
        preserve_article_shape: true,
        preserve_justified_text: true,
        responsive_wrapper_required: true,
        mobile_safe_required: true
      },
      generation_performed: false,
      asset_created: false,
      inserted_into_article: false
    }
  ],
  selected_candidate_for_future_apply: "AG08J-CANDIDATE-001",
  selection_reason: "A single top hero visual is the safest first visual apply because it can support the article without disturbing body text, tables, references or legacy governance blocks.",
  ...noMutationControls
};

const applyBoundary = {
  module_id: "AG08J",
  title: "AG08J to AG08K Controlled Visual Insertion Boundary",
  status: "future_apply_boundary_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag08j: articleHash,
  approved_candidate_for_future_apply: "AG08J-CANDIDATE-001",
  next_stage_id: "AG08K",
  next_stage_title: "Controlled Visual Image Insertion Apply",
  explicit_approval_required: true,
  ag08k_preconditions: [
    "User explicitly approves AG08K.",
    "Candidate visual source/generation is approved.",
    "Rights/credit/attribution are approved.",
    "Alt text and caption are approved.",
    "Fresh pre-visual-apply backup is created.",
    "Exact insertion point is confirmed.",
    "Layout doctrine is enforced.",
    "validate:project is clean before apply."
  ],
  ag08k_allowed_scope_if_later_approved: [
    "create fresh backup of selected article",
    "insert exactly one approved hero visual block",
    "preserve AG08G controlled apply marker",
    "preserve AG08G approved references marker",
    "preserve AG08G legacy governance preservation marker",
    "preserve AG03/AG05 reference governance evidence",
    "record post-apply audit prep"
  ],
  ag08k_blocked_scope: [
    "multi-article mutation",
    "homepage mutation",
    "CSS/JS mutation unless separately approved",
    "unapproved visual asset insertion",
    "reference URL changes",
    "production JSONL append",
    "database/Supabase write",
    "backend/Auth/Supabase activation",
    "publishing approval"
  ],
  layout_doctrine_file: "data/content-intelligence/visual-registry/ag08j-article-object-placement-doctrine.json",
  ...noMutationControls
};

const readinessChecks = [
  {
    check_id: "AG08J-CHECK-001",
    name: "ag08i_plan_consumed",
    status: "passed",
    evidence: ag08iReview.status
  },
  {
    check_id: "AG08J-CHECK-002",
    name: "article_hash_matches_ag08g_post_apply",
    status: articleHash === ag08gApply.post_apply_hash ? "passed" : "failed",
    evidence: articleHash
  },
  {
    check_id: "AG08J-CHECK-003",
    name: "visual_candidate_record_created",
    status: candidateRecord.candidate_visuals.length >= 1 ? "passed" : "failed",
    evidence: candidateRecord.candidate_visuals.length
  },
  {
    check_id: "AG08J-CHECK-004",
    name: "layout_doctrine_created",
    status: layoutDoctrine.global_article_layout_rules.preserve_article_shape === true ? "passed" : "failed",
    evidence: "preserve_article_shape"
  },
  {
    check_id: "AG08J-CHECK-005",
    name: "no_asset_generation_or_insertion",
    status:
      candidateRecord.actual_visual_generation_performed_in_ag08j === false &&
      candidateRecord.image_asset_created_in_ag08j === false &&
      candidateRecord.image_insertion_performed_in_ag08j === false
        ? "passed"
        : "failed",
    evidence: "generation=false insertion=false"
  },
  {
    check_id: "AG08J-CHECK-006",
    name: "ag08k_boundary_created",
    status: applyBoundary.explicit_approval_required === true ? "passed" : "failed",
    evidence: applyBoundary.next_stage_id
  }
];

const allChecksPassed = readinessChecks.every((check) => check.status === "passed");

const readinessRecord = {
  module_id: "AG08J",
  title: "Visual Candidate Readiness",
  status: allChecksPassed ? "visual_candidate_ready_pending_explicit_ag08k" : "visual_candidate_review_required",
  selected_article_path: selectedArticlePath,
  readiness_checks: readinessChecks,
  all_readiness_checks_passed: allChecksPassed,
  ag08k_handoff: applyBoundary,
  ...noMutationControls
};

const schema = {
  module_id: "AG08J",
  title: "Visual Candidate Generation / Asset Selection Schema",
  status: "schema_visual_candidate_only",
  visual_candidate_record_allowed_in_ag08j: true,
  prompt_brief_record_allowed_in_ag08j: true,
  source_rights_credit_record_allowed_in_ag08j: true,
  alt_caption_record_allowed_in_ag08j: true,
  layout_doctrine_record_allowed_in_ag08j: true,
  ag08k_apply_boundary_record_allowed_in_ag08j: true,
  actual_visual_generation_allowed_in_ag08j: false,
  image_asset_creation_allowed_in_ag08j: false,
  image_file_write_allowed_in_ag08j: false,
  image_insertion_allowed_in_ag08j: false,
  article_mutation_allowed_in_ag08j: false,
  file_edit_allowed_in_ag08j: false,
  css_js_mutation_allowed_in_ag08j: false,
  reference_insertion_allowed_in_ag08j: false,
  production_jsonl_append_allowed_in_ag08j: false,
  database_write_allowed_in_ag08j: false,
  supabase_write_allowed_in_ag08j: false,
  backend_auth_supabase_activation_allowed_in_ag08j: false,
  publishing_allowed_in_ag08j: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag08j: articleHash,
  visual_candidate_record_created: true,
  layout_doctrine_created: true,
  selected_candidate_for_future_apply: candidateRecord.selected_candidate_for_future_apply,
  ag08k_boundary_created: true,
  next_stage_id: "AG08K",
  next_stage_title: "Controlled Visual Image Insertion Apply",
  next_stage_requires_explicit_approval: true,
  production_readiness_after_ag08j: "visual_candidate_record_created_not_inserted",
  publish_readiness_after_ag08j: "blocked",
  ...noMutationControls
};

const review = {
  module_id: "AG08J",
  title: "Visual Candidate Generation / Asset Selection",
  status: "visual_candidate_record_created_not_inserted",
  candidate_only: true,
  depends_on: ["AG08I", "AG08H", "AG08G"],
  generated_from: inputs,
  summary,
  visual_candidate_file: "data/content-intelligence/visual-registry/ag08j-visual-candidate-record.json",
  layout_doctrine_file: "data/content-intelligence/visual-registry/ag08j-article-object-placement-doctrine.json",
  readiness_file: "data/content-intelligence/quality-registry/ag08j-visual-candidate-readiness.json",
  apply_boundary_file: "data/content-intelligence/mutation-plans/ag08j-to-ag08k-controlled-visual-insertion-boundary.json",
  schema_file: "data/content-intelligence/schema/visual-candidate-generation-asset-selection.schema.json",
  learning_file: "data/content-intelligence/learning/ag08j-visual-candidate-generation-asset-selection-learning.json",
  closure_decision: {
    decision: "ag08j_visual_candidate_record_created_pending_explicit_ag08k",
    proceed_to_ag08k_only_with_explicit_user_approval: true,
    selected_article_path: selectedArticlePath,
    actual_visual_generation_performed_in_ag08j: false,
    image_asset_created_in_ag08j: false,
    image_insertion_performed_in_ag08j: false,
    article_mutation_performed_in_ag08j: false,
    file_edit_performed_in_ag08j: false,
    css_mutation_performed_in_ag08j: false,
    js_mutation_performed_in_ag08j: false,
    production_jsonl_append_performed_in_ag08j: false,
    database_write_performed_in_ag08j: false,
    supabase_write_performed_in_ag08j: false,
    backend_auth_supabase_activation_performed_in_ag08j: false,
    public_publishing_performed_in_ag08j: false,
    production_readiness: summary.production_readiness_after_ag08j,
    publish_readiness: summary.publish_readiness_after_ag08j
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG08J",
  title: "Visual Candidate Generation / Asset Selection Learning",
  status: "learning_record_only",
  summary,
  ag08j_learning_points: [
    "Visual candidates must be recorded before any asset is created or inserted.",
    "Hero images are safer as first visual insertion than inline tables/graphs because they do not require text wrapping.",
    "Tables, graphs and figures need stricter layout validation than top hero images.",
    "Text wrapping should be allowed only for suitable non-table figure objects and only when readability is preserved.",
    "Article shape and justified text must be treated as validation conditions, not design preferences."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG08J",
  title: "Visual Candidate Generation / Asset Selection",
  status: "visual_candidate_record_created_not_inserted",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08j-visual-candidate-generation-asset-selection.json",
    candidate_record: "data/content-intelligence/visual-registry/ag08j-visual-candidate-record.json",
    layout_doctrine: "data/content-intelligence/visual-registry/ag08j-article-object-placement-doctrine.json",
    readiness: "data/content-intelligence/quality-registry/ag08j-visual-candidate-readiness.json",
    apply_boundary: "data/content-intelligence/mutation-plans/ag08j-to-ag08k-controlled-visual-insertion-boundary.json",
    schema: "data/content-intelligence/schema/visual-candidate-generation-asset-selection.schema.json",
    learning: "data/content-intelligence/learning/ag08j-visual-candidate-generation-asset-selection-learning.json",
    preview: "data/quality/ag08j-visual-candidate-generation-asset-selection-preview.json",
    document: "docs/quality/AG08J_VISUAL_CANDIDATE_GENERATION_ASSET_SELECTION.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG08J",
  preview_only: true,
  candidate_only: true,
  status: "visual_candidate_record_created_not_inserted",
  summary,
  selected_candidate: candidateRecord.candidate_visuals.find((item) => item.candidate_id === candidateRecord.selected_candidate_for_future_apply),
  layout_doctrine_summary: {
    preserve_article_shape: layoutDoctrine.global_article_layout_rules.preserve_article_shape,
    main_text_must_remain_justified: layoutDoctrine.global_article_layout_rules.main_text_must_remain_justified,
    table_alignment: layoutDoctrine.object_type_rules.table.alignment,
    graph_alignment: layoutDoctrine.object_type_rules.graph_or_chart.alignment,
    infographic_text_wrap: layoutDoctrine.object_type_rules.infographic.text_wrap
  },
  ag08k_handoff: applyBoundary,
  ...noMutationControls
};

const doc = `# AG08J — Visual Candidate Generation / Asset Selection

## Purpose

AG08J records candidate visual specifications and article-object placement doctrine for the AG08G-upgraded article.

AG08J does not generate an image, create an asset file, insert an image, mutate the article, edit CSS/JS, append JSONL records, write to database/Supabase, activate backend/Auth/Supabase or approve publishing.

## Target Article

- Path: \`${selectedArticlePath}\`
- Article hash at AG08J: \`${articleHash}\`

## Selected Candidate for Future Apply

- Candidate: \`${candidateRecord.selected_candidate_for_future_apply}\`
- Type: \`primary_hero_visual\`
- Planned path: \`${candidateRecord.candidate_visuals[0].planned_asset_path}\`

## Placement Doctrine

Approved visual/object placement must preserve article shape and readability.

- Main article text must remain justified.
- Hero image may remain near/top of the article.
- Infographics, graphs, figures and diagrams should remain within the reading column.
- Tables and data figures must be centrally aligned and responsive.
- Text wrapping is permitted only where it preserves readability and does not deform the article boundary.
- No object may disturb AG08G references, legacy governance blocks, footer links or mobile layout.

## Future Apply Boundary

AG08K may insert exactly one approved visual block only after explicit approval, fresh backup, final source/credit approval, alt/caption approval and layout validation.

## Exclusions

AG08J performs no visual generation, no asset creation, no image insertion, no article mutation, no file edit, no CSS/JS mutation, no reference insertion, no JSONL append, no database/Supabase write, no backend/Auth/Supabase activation and no publishing approval.
`;

writeJson(reviewPath, review);
writeJson(candidatePath, candidateRecord);
writeJson(layoutDoctrinePath, layoutDoctrine);
writeJson(readinessPath, readinessRecord);
writeJson(applyBoundaryPath, applyBoundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG08J attempted to mutate the selected article. Refusing to continue.");
}

console.log("✅ AG08J visual candidate generation / asset selection artifacts generated.");
console.log(`✅ Candidate target: ${selectedArticlePath}`);
console.log("✅ Layout doctrine recorded for image, infographic, graph, table and figure placement.");
console.log("✅ No visual generation, image asset creation, image insertion, article mutation or file edit performed.");
console.log("✅ AG08K handoff created with explicit approval required.");
