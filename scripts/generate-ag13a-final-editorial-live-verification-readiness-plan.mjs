import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag12zReview: "data/content-intelligence/quality-reviews/ag12z-object-rich-production-readiness-closure.json",
  ag12zClosure: "data/content-intelligence/closure-records/ag12z-object-rich-production-readiness-closure.json",
  ag12zState: "data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json",
  ag12zReadiness: "data/content-intelligence/quality-registry/ag12z-production-readiness-final-record.json",
  ag12zBoundary: "data/content-intelligence/mutation-plans/ag12z-to-ag13a-final-editorial-live-verification-boundary.json",
  ag12cApply: "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag13a-final-editorial-live-verification-readiness-plan.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag13a-final-editorial-live-verification-readiness-plan.json");
const checklistPath = path.join(root, "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-checklist-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag13a-to-ag13b-final-editorial-live-verification-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/final-editorial-live-verification-readiness-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag13a-final-editorial-live-verification-readiness-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag13a-final-editorial-live-verification-readiness-plan.json");
const previewPath = path.join(root, "data/quality/ag13a-final-editorial-live-verification-readiness-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG13A_FINAL_EDITORIAL_LIVE_VERIFICATION_READINESS_PLAN.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG13A input ${name}: ${relativePath}`);
}

const ag12zReview = readJson(inputs.ag12zReview);
const ag12zClosure = readJson(inputs.ag12zClosure);
const ag12zState = readJson(inputs.ag12zState);
const ag12zReadiness = readJson(inputs.ag12zReadiness);
const ag12zBoundary = readJson(inputs.ag12zBoundary);
const ag12cApply = readJson(inputs.ag12cApply);

if (ag12zReview.status !== "object_rich_article_production_readiness_closed_ready_for_final_editorial_live_verification") {
  throw new Error("AG13A requires AG12Z review closure.");
}
if (ag12zReadiness.ready_for_ag13a !== true) {
  throw new Error("AG13A requires AG12Z readiness for AG13A.");
}
if (ag12zBoundary.next_stage_id !== "AG13A" || ag12zBoundary.explicit_approval_required !== true) {
  throw new Error("AG13A requires AG12Z to AG13A explicit boundary.");
}

const selectedArticlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);
if (!exists(backupPath)) throw new Error(`Rollback backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

if (articleHash !== ag12cApply.post_refinement_hash) {
  throw new Error("AG13A requires article hash to remain AG12C post-refinement hash.");
}
if (backupHash !== ag12cApply.pre_refinement_hash) {
  throw new Error("AG13A requires backup hash to remain AG12C pre-refinement hash.");
}

const stageControls = {
  final_editorial_live_verification_readiness_plan_only: true,
  final_editorial_plan_created_in_ag13a: true,
  live_verification_checklist_created_in_ag13a: true,
  rollback_evidence_carried_forward_in_ag13a: true,
  ag13b_boundary_created_in_ag13a: true,
  selected_article_read_performed: true,

  article_mutation_performed_in_ag13a: false,
  selected_article_file_write_performed_in_ag13a: false,
  object_generation_performed_in_ag13a: false,
  object_insertion_performed_in_ag13a: false,
  object_removal_performed_in_ag13a: false,
  image_generation_performed_in_ag13a: false,
  data_fetch_performed_in_ag13a: false,
  reference_url_change_performed_in_ag13a: false,
  homepage_mutation_performed_in_ag13a: false,
  css_file_mutation_performed_in_ag13a: false,
  js_file_mutation_performed_in_ag13a: false,
  production_jsonl_append_performed_in_ag13a: false,
  database_write_performed_in_ag13a: false,
  supabase_write_performed_in_ag13a: false,
  backend_auth_supabase_activation_performed_in_ag13a: false,
  public_publishing_operation_performed_in_ag13a: false
};

const verificationChecklist = {
  module_id: "AG13A",
  title: "Final Editorial and Live Verification Checklist Record",
  status: "final_editorial_live_verification_checklist_created",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13a: articleHash,
  rollback_backup_path: backupPath,
  rollback_backup_hash: backupHash,
  desktop_preview_checks: [
    "Open selected article locally or in deployment preview.",
    "Confirm article title, hero section and first-screen reading flow are acceptable.",
    "Confirm four primary visible objects do not overcrowd reading flow.",
    "Confirm collapsed pilot objects expand/collapse normally.",
    "Confirm captions, credits, source notes and accessibility text remain visible/usable.",
    "Confirm no broken image/SVG paths are visible.",
    "Confirm footer/navigation still render normally."
  ],
  mobile_preview_checks: [
    "Open selected article in mobile viewport.",
    "Confirm no horizontal overflow beyond table/container expectation.",
    "Confirm SVG/image objects scale within screen width.",
    "Confirm collapsed details blocks are tappable and readable.",
    "Confirm table overflow remains scrollable.",
    "Confirm caption and credit text remains readable.",
    "Confirm no homepage/language-toggle regression is visible from article navigation."
  ],
  editorial_checks: [
    "Confirm article remains editorially coherent after layout refinement.",
    "Confirm object sequence supports reading rather than distracting.",
    "Confirm no invented data, fake map claim or unsupported statistic is introduced.",
    "Confirm references/citations already present remain unchanged.",
    "Confirm the article can be treated as refined pilot article, not automatic production template."
  ],
  governance_checks: [
    "Confirm publishing is still blocked.",
    "Confirm backend/Auth/Supabase activation is still blocked.",
    "Confirm rollback backup path is available.",
    "Confirm final live verification evidence should be recorded before publish-preparation."
  ],
  ...stageControls
};

const plan = {
  module_id: "AG13A",
  title: "Final Editorial and Live Verification Readiness Plan",
  status: "final_editorial_live_verification_readiness_plan_created_no_mutation",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13a: articleHash,
  ag12z_state_consumed: {
    primary_visible_object_count: ag12zState.primary_visible_object_count,
    collapsed_pilot_object_count: ag12zState.collapsed_pilot_object_count,
    rollback_ready: ag12zState.rollback_ready,
    captions_credits_accessibility_preserved: ag12zState.captions_credits_accessibility_preserved
  },
  readiness_decision: {
    ready_for_final_editorial_live_verification_audit: true,
    publish_ready: false,
    publish_approval_required: true,
    live_verification_required_before_publish_preparation: true,
    recommended_next_stage: "AG13B"
  },
  verification_mode: {
    static_artifact_validation_complete: true,
    manual_visual_preview_required: true,
    desktop_preview_required: true,
    mobile_preview_required: true,
    deployment_preview_or_local_preview_allowed: true
  },
  ...stageControls
};

const readiness = {
  module_id: "AG13A",
  title: "Final Editorial and Live Verification Readiness Record",
  status: "ready_for_ag13b_final_editorial_live_verification_audit",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13a: articleHash,
  ready_for_ag13b: true,
  ag13b_explicit_approval_required: true,
  publish_ready: false,
  publish_approval_required: true,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  reason_publish_blocked: "AG13A is planning only. Final editorial/live verification audit must be performed before any publish-preparation decision.",
  ...stageControls
};

const boundary = {
  module_id: "AG13A",
  title: "AG13A to AG13B Final Editorial and Live Verification Audit Boundary",
  status: "ag13b_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13a: articleHash,
  next_stage_id: "AG13B",
  next_stage_title: "Final Editorial and Live Verification Audit",
  explicit_approval_required: true,
  ag13b_allowed_scope: [
    "Audit final editorial/live verification readiness.",
    "Record desktop and mobile preview observations.",
    "Confirm refined object treatment remains usable.",
    "Confirm rollback evidence remains available.",
    "Prepare publish-preparation boundary only if audit passes."
  ],
  ag13b_blocked_scope: [
    "No article mutation.",
    "No object generation.",
    "No object insertion.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG13A",
  title: "Final Editorial and Live Verification Readiness Plan Schema",
  status: "schema_final_editorial_live_verification_readiness_plan_only",
  final_editorial_plan_allowed_in_ag13a: true,
  live_verification_checklist_allowed_in_ag13a: true,
  readiness_record_allowed_in_ag13a: true,
  ag13b_boundary_allowed_in_ag13a: true,

  article_mutation_allowed_in_ag13a: false,
  object_generation_allowed_in_ag13a: false,
  object_insertion_allowed_in_ag13a: false,
  object_removal_allowed_in_ag13a: false,
  css_js_mutation_allowed_in_ag13a: false,
  data_fetch_allowed_in_ag13a: false,
  reference_url_change_allowed_in_ag13a: false,
  production_jsonl_append_allowed_in_ag13a: false,
  database_write_allowed_in_ag13a: false,
  supabase_write_allowed_in_ag13a: false,
  backend_auth_supabase_activation_allowed_in_ag13a: false,
  public_publishing_operation_allowed_in_ag13a: false,
  ...stageControls
};

const review = {
  module_id: "AG13A",
  title: "Final Editorial and Live Verification Readiness Plan",
  status: "final_editorial_live_verification_readiness_plan_created_no_mutation",
  depends_on: ["AG12Z"],
  generated_from: inputs,
  plan_file: "data/content-intelligence/mutation-plans/ag13a-final-editorial-live-verification-readiness-plan.json",
  checklist_file: "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-checklist-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag13a-to-ag13b-final-editorial-live-verification-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/final-editorial-live-verification-readiness-plan.schema.json",
  summary: {
    selected_article_path: selectedArticlePath,
    article_hash_at_ag13a: articleHash,
    ready_for_ag13b: true,
    publish_ready: false,
    next_stage_id: "AG13B",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG13A",
  title: "Final Editorial and Live Verification Readiness Plan Learning",
  status: "learning_record_only",
  learning_points: [
    "Production-readiness closure should be followed by final editorial/live verification, not direct publishing.",
    "Manual desktop and mobile observation is still necessary after automated object/layout validation.",
    "Publish approval remains a separate explicit decision.",
    "Rollback evidence must remain available until final publish decision.",
    "The next stage should audit the final view and decide whether publish-preparation can be considered."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG13A",
  title: "Final Editorial and Live Verification Readiness Plan",
  status: "final_editorial_live_verification_readiness_plan_created_no_mutation",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag13a-final-editorial-live-verification-readiness-plan.json",
    plan: "data/content-intelligence/mutation-plans/ag13a-final-editorial-live-verification-readiness-plan.json",
    checklist: "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-checklist-record.json",
    readiness: "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag13a-to-ag13b-final-editorial-live-verification-audit-boundary.json",
    schema: "data/content-intelligence/schema/final-editorial-live-verification-readiness-plan.schema.json",
    learning: "data/content-intelligence/learning/ag13a-final-editorial-live-verification-readiness-plan-learning.json",
    preview: "data/quality/ag13a-final-editorial-live-verification-readiness-plan-preview.json",
    document: "docs/quality/AG13A_FINAL_EDITORIAL_LIVE_VERIFICATION_READINESS_PLAN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG13A",
  preview_only: true,
  status: "final_editorial_live_verification_readiness_plan_created_no_mutation",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13a: articleHash,
  ready_for_ag13b: true,
  publish_ready: false,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG13A — Final Editorial and Live Verification Readiness Plan

## Purpose

AG13A prepares the final editorial and live verification readiness plan after AG12 production-readiness closure.

AG13A is planning only. It does not mutate articles, generate objects, insert objects, remove objects, change CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Readiness Position

The refined article is ready for final editorial/live verification audit, but it is not publish-approved.

## Verification Scope

AG13B should verify:

- Desktop preview
- Mobile preview
- Object treatment
- Captions, credits and accessibility/source text
- Collapsed object usability
- Rollback evidence
- Publish-preparation readiness

## Publishing Boundary

Publishing remains blocked. Backend, Auth, database and Supabase activation remain blocked.

## Next Stage

AG13B — Final Editorial and Live Verification Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(checklistPath, verificationChecklist);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG13A final editorial and live verification readiness plan artifacts generated.");
console.log("✅ Desktop, mobile, editorial and governance verification checklist created.");
console.log("✅ Article hash remains AG12C/AG12D/AG12Z post-refinement hash.");
console.log("✅ Ready for AG13B final editorial/live verification audit.");
console.log("✅ Publishing, backend and Supabase activation remain blocked.");
console.log("✅ No article mutation, object generation/insertion/removal, CSS/JS mutation, backend activation or publishing performed.");
console.log("✅ AG13B final editorial and live verification audit boundary created with explicit approval required.");
