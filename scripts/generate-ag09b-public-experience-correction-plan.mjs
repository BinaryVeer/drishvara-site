import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag09aReview: "data/content-intelligence/quality-reviews/ag09a-live-readiness-public-experience-audit.json",
  ag09aAudit: "data/content-intelligence/audit-records/ag09a-live-readiness-public-experience-audit-report.json",
  ag09aGapRegister: "data/content-intelligence/quality-registry/ag09a-public-experience-gap-register.json",
  ag09aReadiness: "data/content-intelligence/quality-registry/ag09a-public-experience-readiness.json",
  ag08kApply: "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  ag08zClosure: "data/content-intelligence/closure-records/ag08z-repeatable-article-upgrade-cycle-closure.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag09b-public-experience-correction-plan.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag09b-public-experience-correction-plan.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag09b-correction-plan-readiness.json");
const applyBoundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag09b-to-ag09c-controlled-correction-apply-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/public-experience-correction-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag09b-public-experience-correction-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag09b-public-experience-correction-plan.json");
const previewPath = path.join(root, "data/quality/ag09b-public-experience-correction-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG09B_PUBLIC_EXPERIENCE_CORRECTION_PLAN.md");

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

function slugFromArticlePath(articlePath) {
  return path.basename(articlePath || "").replace(/\.html$/i, "");
}

function correctionForGap(gap, articlePath, articleTitle) {
  const base = {
    source_gap_id: gap.gap_id,
    source_area: gap.area,
    source_name: gap.name,
    source_severity: gap.severity,
    source_status: gap.status,
    evidence: gap.evidence,
    correction_status: "planned_not_executed",
    approval_required_before_apply: true
  };

  if (gap.area === "metadata") {
    return {
      ...base,
      correction_id: "AG09B-CORRECTION-METADATA",
      correction_type: "article_head_metadata_correction",
      target_files_if_later_approved: [articlePath],
      planned_actions: [
        "Review existing article <title> and meta description.",
        "If canonical link is missing, add canonical URL for the selected article.",
        "Ensure description is concise, public-facing and aligned with article subject.",
        "Do not change article body prose during metadata-only correction."
      ],
      future_apply_scope: "selected_article_head_only",
      mutation_allowed_in_ag09b: false
    };
  }

  if (gap.area === "social_preview") {
    return {
      ...base,
      correction_id: "AG09B-CORRECTION-SOCIAL-PREVIEW",
      correction_type: "open_graph_twitter_metadata_correction",
      target_files_if_later_approved: [articlePath],
      planned_actions: [
        "Add or complete og:title and og:description if missing.",
        "Add or complete og:image using the approved AG08K hero visual or a future approved social-preview image.",
        "Add twitter:card metadata if missing.",
        "Keep image source and credit aligned with AG08K-A/AG08K records."
      ],
      future_apply_scope: "selected_article_head_only",
      mutation_allowed_in_ag09b: false
    };
  }

  if (gap.area === "homepage_listing") {
    return {
      ...base,
      correction_id: "AG09B-CORRECTION-LISTING",
      correction_type: "homepage_or_featured_listing_discoverability_correction",
      target_files_if_later_approved: ["index.html", "articles.html", "featured-reads.html"],
      planned_actions: [
        `Ensure the upgraded article slug "${slugFromArticlePath(articlePath)}" is discoverable from the relevant public listing/card surface.`,
        "Confirm title/category/card date/card excerpt are consistent with the upgraded article.",
        "Use existing listing/card patterns instead of introducing a new layout system.",
        "Do not change article body during listing-only correction."
      ],
      future_apply_scope: "listing_surface_only",
      mutation_allowed_in_ag09b: false
    };
  }

  if (gap.area === "layout_mobile") {
    return {
      ...base,
      correction_id: "AG09B-CORRECTION-LAYOUT-MOBILE",
      correction_type: "visual_layout_mobile_safety_correction",
      target_files_if_later_approved: [articlePath],
      planned_actions: [
        "Review the AG08K hero figure block for responsive width behavior.",
        "Add inline-safe or class-based responsive attributes only if required later.",
        "Do not change global CSS unless separately approved.",
        "Preserve justified body text and article shape."
      ],
      future_apply_scope: "selected_article_visual_block_only",
      mutation_allowed_in_ag09b: false
    };
  }

  if (gap.area === "reference_display") {
    return {
      ...base,
      correction_id: "AG09B-CORRECTION-REFERENCE-DISPLAY",
      correction_type: "reference_credit_display_correction",
      target_files_if_later_approved: [articlePath],
      planned_actions: [
        "Check visible reference block order and hidden legacy placeholders.",
        "Ensure final approved references and image credit are not visually confusing.",
        "Preserve AG03/AG05/AG08 governance markers.",
        "Do not change reference URLs unless a later correction stage explicitly approves it."
      ],
      future_apply_scope: "selected_article_reference_and_credit_display_only",
      mutation_allowed_in_ag09b: false
    };
  }

  return {
    ...base,
    correction_id: `AG09B-CORRECTION-${String(gap.area || "GENERAL").toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
    correction_type: "general_public_experience_correction",
    target_files_if_later_approved: [articlePath],
    planned_actions: [
      "Review the source gap evidence.",
      "Create the narrowest possible correction in a future apply stage.",
      "Preserve AG08 article, reference, visual and layout governance.",
      "Do not perform mutation in AG09B."
    ],
    future_apply_scope: "narrow_correction_only",
    mutation_allowed_in_ag09b: false
  };
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG09B input ${name}: ${relativePath}`);
  }
}

const ag09aReview = readJson(inputs.ag09aReview);
const ag09aAudit = readJson(inputs.ag09aAudit);
const ag09aGaps = readJson(inputs.ag09aGapRegister);
const ag09aReadiness = readJson(inputs.ag09aReadiness);
const ag08kApply = readJson(inputs.ag08kApply);
const ag08zClosure = readJson(inputs.ag08zClosure);

if (ag09aReview.status !== "live_readiness_audit_completed") {
  throw new Error("AG09B requires AG09A audit to be completed.");
}

if (ag09aAudit.status !== "live_readiness_audit_completed") {
  throw new Error("AG09B requires AG09A audit report to be completed.");
}

if (ag08zClosure.status !== "repeatable_article_upgrade_cycle_closed") {
  throw new Error("AG09B requires AG08Z to remain closed.");
}

const selectedArticlePath = ag08kApply.selected_article_path;
if (!exists(selectedArticlePath)) {
  throw new Error(`AG09B selected article missing: ${selectedArticlePath}`);
}

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag08kApply.post_insertion_hash) {
  throw new Error("AG09B selected article hash must match AG08K post-insertion hash.");
}

const gaps = Array.isArray(ag09aGaps.gaps) ? ag09aGaps.gaps : [];
const articleTitle =
  ag09aAudit.article_title ||
  (articleHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "").replace(/<[^>]+>/g, "").trim();

const correctionItems = gaps.map((gap) => correctionForGap(gap, selectedArticlePath, articleTitle));

const noMutationControls = {
  correction_plan_only: true,
  source_gap_count: gaps.length,
  correction_item_count: correctionItems.length,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag09b: false,
  selected_article_file_write_performed_in_ag09b: false,
  homepage_mutation_performed_in_ag09b: false,
  css_mutation_performed_in_ag09b: false,
  js_mutation_performed_in_ag09b: false,
  reference_insertion_performed_in_ag09b: false,
  reference_url_change_performed_in_ag09b: false,
  visual_generation_performed_in_ag09b: false,
  image_asset_creation_performed_in_ag09b: false,
  image_insertion_performed_in_ag09b: false,
  live_url_fetch_performed_in_ag09b: false,
  production_jsonl_append_performed_in_ag09b: false,
  database_write_performed_in_ag09b: false,
  supabase_write_performed_in_ag09b: false,
  backend_auth_supabase_activation_performed_in_ag09b: false,
  public_publishing_performed_in_ag09b: false,
  publishing_approval_performed_in_ag09b: false
};

const plan = {
  module_id: "AG09B",
  title: "Public Experience Correction Plan",
  status: "correction_plan_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09b: articleHash,
  source_audit: inputs.ag09aAudit,
  source_gap_register: inputs.ag09aGapRegister,
  source_gap_count: gaps.length,
  correction_item_count: correctionItems.length,
  correction_items: correctionItems,
  correction_strategy: {
    principle: "Plan the narrowest possible corrections for AG09A public-experience gaps without starting a new article pipeline.",
    execution_mode: "future_controlled_apply_only",
    sequencing: [
      "metadata/social-preview corrections first if required",
      "listing/card discoverability correction if required",
      "layout/mobile correction only if static evidence requires it",
      "post-correction public-experience audit after any future apply"
    ]
  },
  ...noMutationControls
};

const applyBoundary = {
  module_id: "AG09B",
  title: "AG09B to AG09C Controlled Public Experience Correction Apply Boundary",
  status: "future_apply_boundary_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09b: articleHash,
  next_stage_id: "AG09C",
  next_stage_title: "Controlled Public Experience Correction Apply",
  explicit_approval_required: true,
  ag09c_preconditions: [
    "User explicitly approves AG09C.",
    "AG09B correction plan is validated.",
    "Exact correction items are approved.",
    "Fresh backup is created for every file that will be mutated.",
    "No correction expands beyond AG09A gap scope unless separately approved.",
    "No publishing approval is granted merely because static files change.",
    "validate:project passes after apply."
  ],
  allowed_future_apply_scope: [
    "selected article head metadata correction if required",
    "selected article social-preview metadata correction if required",
    "homepage/listing/card discoverability correction if required",
    "minimal visual block/layout safety correction if required",
    "post-correction audit prep"
  ],
  blocked_future_apply_scope: [
    "new article rewrite",
    "new article selection",
    "multi-article mutation",
    "new visual generation",
    "new image insertion",
    "reference URL changes unless separately approved",
    "global CSS/JS mutation unless separately approved",
    "database/Supabase/backend/Auth activation",
    "publishing approval"
  ],
  ...noMutationControls
};

const readinessChecks = [
  {
    check_id: "AG09B-CHECK-001",
    name: "ag09a_audit_consumed",
    status: ag09aAudit.status === "live_readiness_audit_completed" ? "passed" : "failed",
    evidence: ag09aAudit.status
  },
  {
    check_id: "AG09B-CHECK-002",
    name: "ag09a_gap_count_carried",
    status: ag09aGaps.gap_count === gaps.length ? "passed" : "failed",
    evidence: { recorded: ag09aGaps.gap_count, actual: gaps.length }
  },
  {
    check_id: "AG09B-CHECK-003",
    name: "correction_items_match_gaps",
    status: correctionItems.length === gaps.length ? "passed" : "failed",
    evidence: { gaps: gaps.length, corrections: correctionItems.length }
  },
  {
    check_id: "AG09B-CHECK-004",
    name: "selected_article_hash_unchanged",
    status: articleHash === ag08kApply.post_insertion_hash ? "passed" : "failed",
    evidence: articleHash
  },
  {
    check_id: "AG09B-CHECK-005",
    name: "future_apply_boundary_created",
    status: applyBoundary.next_stage_id === "AG09C" && applyBoundary.explicit_approval_required === true ? "passed" : "failed",
    evidence: applyBoundary.next_stage_id
  },
  {
    check_id: "AG09B-CHECK-006",
    name: "no_mutation_performed",
    status:
      noMutationControls.article_mutation_performed_in_ag09b === false &&
      noMutationControls.homepage_mutation_performed_in_ag09b === false &&
      noMutationControls.css_mutation_performed_in_ag09b === false
        ? "passed"
        : "failed",
    evidence: "mutation=false"
  }
];

const readinessPassed = readinessChecks.every((check) => check.status === "passed");

const readiness = {
  module_id: "AG09B",
  title: "Correction Plan Readiness",
  status: readinessPassed ? "correction_plan_ready_pending_explicit_ag09c" : "correction_plan_review_required",
  selected_article_path: selectedArticlePath,
  source_gap_count: gaps.length,
  correction_item_count: correctionItems.length,
  readiness_checks: readinessChecks,
  readiness_passed: readinessPassed,
  publish_ready: false,
  publish_readiness: "blocked_pending_controlled_correction_apply_and_audit",
  ag09c_handoff: applyBoundary,
  ...noMutationControls
};

const schema = {
  module_id: "AG09B",
  title: "Public Experience Correction Plan Schema",
  status: "schema_correction_plan_only",
  correction_plan_allowed_in_ag09b: true,
  correction_item_mapping_allowed_in_ag09b: true,
  ag09c_apply_boundary_allowed_in_ag09b: true,
  selected_article_read_allowed_in_ag09b: true,
  article_mutation_allowed_in_ag09b: false,
  selected_article_file_write_allowed_in_ag09b: false,
  homepage_mutation_allowed_in_ag09b: false,
  css_js_mutation_allowed_in_ag09b: false,
  reference_insertion_allowed_in_ag09b: false,
  reference_url_change_allowed_in_ag09b: false,
  visual_generation_allowed_in_ag09b: false,
  image_asset_creation_allowed_in_ag09b: false,
  image_insertion_allowed_in_ag09b: false,
  live_url_fetch_allowed_in_ag09b: false,
  production_jsonl_append_allowed_in_ag09b: false,
  database_write_allowed_in_ag09b: false,
  supabase_write_allowed_in_ag09b: false,
  backend_auth_supabase_activation_allowed_in_ag09b: false,
  publishing_allowed_in_ag09b: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09b: articleHash,
  source_gap_count: gaps.length,
  correction_item_count: correctionItems.length,
  correction_plan_status: plan.status,
  readiness_status: readiness.status,
  publish_readiness: readiness.publish_readiness,
  next_stage_id: "AG09C",
  next_stage_title: "Controlled Public Experience Correction Apply",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG09B",
  title: "Public Experience Correction Plan",
  status: "correction_plan_created_not_executed",
  depends_on: ["AG09A", "AG08Z", "AG08K"],
  generated_from: inputs,
  summary,
  correction_plan_file: "data/content-intelligence/mutation-plans/ag09b-public-experience-correction-plan.json",
  readiness_file: "data/content-intelligence/quality-registry/ag09b-correction-plan-readiness.json",
  apply_boundary_file: "data/content-intelligence/mutation-plans/ag09b-to-ag09c-controlled-correction-apply-boundary.json",
  schema_file: "data/content-intelligence/schema/public-experience-correction-plan.schema.json",
  learning_file: "data/content-intelligence/learning/ag09b-public-experience-correction-plan-learning.json",
  closure_decision: {
    decision: "ag09b_correction_plan_created_pending_explicit_ag09c",
    proceed_to_ag09c_only_with_explicit_user_approval: true,
    publish_approval_granted: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG09B",
  title: "Public Experience Correction Plan Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "AG09B is a correction-planning stage, not another article-generation pipeline.",
    "Public-experience gaps should be mapped to the narrowest future correction scope.",
    "Metadata, social-preview and listing corrections should not reopen the article-upgrade cycle.",
    "Future AG09C must create fresh backups for any mutated file.",
    "Publishing approval remains separate from correction planning and static file mutation."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG09B",
  title: "Public Experience Correction Plan",
  status: "correction_plan_created_not_executed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag09b-public-experience-correction-plan.json",
    correction_plan: "data/content-intelligence/mutation-plans/ag09b-public-experience-correction-plan.json",
    readiness: "data/content-intelligence/quality-registry/ag09b-correction-plan-readiness.json",
    apply_boundary: "data/content-intelligence/mutation-plans/ag09b-to-ag09c-controlled-correction-apply-boundary.json",
    schema: "data/content-intelligence/schema/public-experience-correction-plan.schema.json",
    learning: "data/content-intelligence/learning/ag09b-public-experience-correction-plan-learning.json",
    preview: "data/quality/ag09b-public-experience-correction-plan-preview.json",
    document: "docs/quality/AG09B_PUBLIC_EXPERIENCE_CORRECTION_PLAN.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG09B",
  preview_only: true,
  status: "correction_plan_created_not_executed",
  summary,
  correction_items: correctionItems.map((item) => ({
    correction_id: item.correction_id,
    source_gap_id: item.source_gap_id,
    source_area: item.source_area,
    correction_type: item.correction_type,
    future_apply_scope: item.future_apply_scope,
    correction_status: item.correction_status
  })),
  ag09c_handoff: applyBoundary,
  ...noMutationControls
};

const doc = `# AG09B — Public Experience Correction Plan

## Purpose

AG09B converts AG09A public-experience gaps into a controlled future correction plan.

AG09B is planning-only. It does not mutate the article, homepage, CSS, JavaScript, reference blocks, visual assets or publishing state.

## Source

- Source audit: AG09A
- Selected article: \`${selectedArticlePath}\`
- Source gap count: \`${gaps.length}\`
- Correction item count: \`${correctionItems.length}\`

## Correction Strategy

Corrections are planned only for the AG09A gaps. AG09B does not reopen the AG08 article-upgrade pipeline.

## Future Apply Boundary

AG09C may apply only explicitly approved corrections, with fresh backups for every mutated file.

## Exclusions

No article mutation, homepage mutation, CSS/JS mutation, reference insertion, reference URL change, visual generation, image insertion, live URL fetch, JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing approval is performed in AG09B.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(readinessPath, readiness);
writeJson(applyBoundaryPath, applyBoundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG09B attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG09B public experience correction plan artifacts generated.");
console.log(`✅ Source gaps mapped: ${gaps.length}`);
console.log(`✅ Correction items planned: ${correctionItems.length}`);
console.log("✅ No article/homepage/CSS/JS mutation, live fetch, backend activation or publishing performed.");
console.log("✅ AG09C handoff created with explicit approval required.");
