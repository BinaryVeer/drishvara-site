import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag09gReview: "data/content-intelligence/quality-reviews/ag09g-controlled-live-verification-deployment-observation-audit.json",
  ag09gAudit: "data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json",
  ag09gReadiness: "data/content-intelligence/quality-registry/ag09g-live-public-readiness-observation.json",
  ag09gBoundary: "data/content-intelligence/mutation-plans/ag09g-to-ag09h-final-editorial-publish-approval-boundary.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag09gm-manual-mobile-layout-observation-note.json");
const notePath = path.join(root, "data/content-intelligence/audit-records/ag09gm-manual-mobile-layout-observation-note.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag09gm-mobile-layout-manual-review-readiness.json");
const nextBoundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag09gm-to-ag09h-final-editorial-decision-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/manual-mobile-layout-observation-note.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag09gm-manual-mobile-layout-observation-note-learning.json");
const registryPath = path.join(root, "data/quality/ag09gm-manual-mobile-layout-observation-note.json");
const previewPath = path.join(root, "data/quality/ag09gm-manual-mobile-layout-observation-note-preview.json");
const docPath = path.join(root, "docs/quality/AG09G_M_MANUAL_MOBILE_LAYOUT_OBSERVATION_NOTE.md");

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
    throw new Error(`Missing required AG09G-M input ${name}: ${relativePath}`);
  }
}

const ag09gReview = readJson(inputs.ag09gReview);
const ag09gAudit = readJson(inputs.ag09gAudit);
const ag09gReadiness = readJson(inputs.ag09gReadiness);
const ag09gBoundary = readJson(inputs.ag09gBoundary);
const ag09cApply = readJson(inputs.ag09cApply);

const allowedAg09gStatuses = [
  "controlled_live_verification_completed_with_review_required",
  "controlled_live_verification_passed_not_publish_approved"
];

if (!allowedAg09gStatuses.includes(ag09gReview.status)) {
  throw new Error("AG09G-M requires AG09G live verification audit to exist.");
}

if (!allowedAg09gStatuses.includes(ag09gAudit.status)) {
  throw new Error("AG09G-M requires AG09G live verification audit report.");
}

if (ag09gBoundary.next_stage_id !== "AG09H" || ag09gBoundary.explicit_approval_required !== true) {
  throw new Error("AG09G-M requires AG09G to AG09H explicit boundary.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) {
  throw new Error(`Selected article missing: ${selectedArticlePath}`);
}

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG09G-M selected article hash must match AG09C post-correction hash.");
}

const mobileObservation = (ag09gAudit.observations || []).find((item) => item.area === "mobile_layout");
if (!mobileObservation) {
  throw new Error("AG09G-M requires AG09G mobile_layout observation.");
}

const unresolvedManualReview =
  mobileObservation.status === "manual_review_required" ||
  mobileObservation.manual_mobile_review_required === true;

const noMutationControls = {
  manual_mobile_layout_observation_note_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag09gm: false,
  selected_article_file_write_performed_in_ag09gm: false,
  homepage_mutation_performed_in_ag09gm: false,
  css_mutation_performed_in_ag09gm: false,
  js_mutation_performed_in_ag09gm: false,
  reference_insertion_performed_in_ag09gm: false,
  reference_url_change_performed_in_ag09gm: false,
  visual_generation_performed_in_ag09gm: false,
  image_asset_creation_performed_in_ag09gm: false,
  image_insertion_performed_in_ag09gm: false,
  live_url_fetch_performed_in_ag09gm: false,
  deployment_trigger_performed_in_ag09gm: false,
  production_jsonl_append_performed_in_ag09gm: false,
  database_write_performed_in_ag09gm: false,
  supabase_write_performed_in_ag09gm: false,
  backend_auth_supabase_activation_performed_in_ag09gm: false,
  public_publishing_performed_in_ag09gm: false,
  publishing_approval_granted_in_ag09gm: false,
  rollback_execution_performed_in_ag09gm: false
};

const manualChecklist = [
  {
    item_id: "AG09GM-MOBILE-001",
    viewport: "mobile_portrait",
    suggested_width: "360px to 430px",
    check: "Open live article on mobile portrait view and confirm no horizontal scrolling or overflow.",
    status: "pending_manual_confirmation"
  },
  {
    item_id: "AG09GM-MOBILE-002",
    viewport: "mobile_portrait",
    suggested_width: "360px to 430px",
    check: "Confirm hero SVG scales within article width and does not deform the reading column.",
    status: "pending_manual_confirmation"
  },
  {
    item_id: "AG09GM-MOBILE-003",
    viewport: "mobile_portrait",
    suggested_width: "360px to 430px",
    check: "Confirm title, body text and paragraphs remain readable and justified/visually balanced.",
    status: "pending_manual_confirmation"
  },
  {
    item_id: "AG09GM-MOBILE-004",
    viewport: "mobile_portrait",
    suggested_width: "360px to 430px",
    check: "Confirm caption and image credit are visible, not clipped and not overlapping body text.",
    status: "pending_manual_confirmation"
  },
  {
    item_id: "AG09GM-MOBILE-005",
    viewport: "mobile_portrait",
    suggested_width: "360px to 430px",
    check: "Confirm reference section remains readable and does not show confusing hidden placeholders.",
    status: "pending_manual_confirmation"
  },
  {
    item_id: "AG09GM-MOBILE-006",
    viewport: "mobile_landscape",
    suggested_width: "640px to 932px",
    check: "Check landscape view for article width, hero visual and homepage listing behavior.",
    status: "pending_manual_confirmation"
  },
  {
    item_id: "AG09GM-MOBILE-007",
    viewport: "homepage_mobile",
    suggested_width: "360px to 430px",
    check: "Confirm homepage listing/card link to the article is visible and does not deform homepage layout.",
    status: "pending_manual_confirmation"
  }
];

const manualObservationNote = {
  module_id: "AG09G-M",
  title: "Manual Mobile Layout Observation Note",
  status: unresolvedManualReview
    ? "manual_mobile_layout_review_note_created_pending_human_confirmation"
    : "manual_mobile_layout_review_note_created_no_manual_gap",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09gm: articleHash,
  live_article_url: ag09gAudit.live_article_url,
  live_home_url: ag09gAudit.live_home_url,
  source_mobile_observation: mobileObservation,
  manual_review_required: unresolvedManualReview,
  manual_checklist: manualChecklist,
  manual_review_evidence_required_before_final_approval: [
    "Mobile browser or responsive devtools screenshot/visual confirmation.",
    "Confirmation that no horizontal scrolling occurs.",
    "Confirmation that hero image/caption/credit do not deform article shape.",
    "Confirmation that homepage listing/card remains readable.",
    "Confirmation that references remain visible and not confusing."
  ],
  final_editorial_publish_decision_allowed_after_ag09gm: false,
  reason_final_decision_blocked: unresolvedManualReview
    ? "Manual mobile layout review remains pending."
    : "Final editorial approval still requires explicit AG09H decision.",
  ...noMutationControls
};

const readiness = {
  module_id: "AG09G-M",
  title: "Mobile Layout Manual Review Readiness",
  status: unresolvedManualReview
    ? "manual_mobile_layout_confirmation_pending"
    : "manual_mobile_layout_gap_not_present",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09gm: articleHash,
  ag09h_ready_for_final_approval: false,
  ag09h_ready_for_hold_decision: true,
  publish_ready: false,
  publish_approval_granted: false,
  publish_readiness: "blocked_pending_manual_mobile_layout_confirmation_and_explicit_ag09h_decision",
  backend_activation_ready: false,
  database_activation_ready: false,
  supabase_activation_ready: false,
  ...noMutationControls
};

const nextBoundary = {
  module_id: "AG09G-M",
  title: "AG09G-M to AG09H Final Editorial Decision Boundary",
  status: "final_editorial_decision_boundary_created_with_mobile_review_pending",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09gm: articleHash,
  next_stage_id: "AG09H",
  next_stage_title: "Final Editorial Publish Approval or Hold Decision",
  explicit_approval_required: true,
  ag09h_allowed_scope: [
    "Record hold decision if manual mobile review is not yet completed.",
    "Record final approval only after explicit human confirmation that mobile layout is acceptable.",
    "Carry forward AG09G live evidence and AG09G-M mobile checklist."
  ],
  ag09h_blocked_scope_until_mobile_confirmation: [
    "No final publish approval.",
    "No public publishing label.",
    "No backend/Auth/Supabase/database activation.",
    "No file mutation unless a separate correction stage is approved."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG09G-M",
  title: "Manual Mobile Layout Observation Note Schema",
  status: "schema_manual_mobile_observation_note_only",
  manual_mobile_layout_note_allowed_in_ag09gm: true,
  manual_checklist_allowed_in_ag09gm: true,
  ag09h_boundary_allowed_in_ag09gm: true,
  article_mutation_allowed_in_ag09gm: false,
  homepage_mutation_allowed_in_ag09gm: false,
  css_js_mutation_allowed_in_ag09gm: false,
  reference_insertion_allowed_in_ag09gm: false,
  reference_url_change_allowed_in_ag09gm: false,
  visual_generation_allowed_in_ag09gm: false,
  image_asset_creation_allowed_in_ag09gm: false,
  image_insertion_allowed_in_ag09gm: false,
  live_url_fetch_allowed_in_ag09gm: false,
  deployment_trigger_allowed_in_ag09gm: false,
  production_jsonl_append_allowed_in_ag09gm: false,
  database_write_allowed_in_ag09gm: false,
  supabase_write_allowed_in_ag09gm: false,
  backend_auth_supabase_activation_allowed_in_ag09gm: false,
  publishing_allowed_in_ag09gm: false,
  publishing_approval_allowed_in_ag09gm: false,
  rollback_execution_allowed_in_ag09gm: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09gm: articleHash,
  manual_mobile_review_required: unresolvedManualReview,
  manual_checklist_item_count: manualChecklist.length,
  publish_readiness: readiness.publish_readiness,
  ag09h_ready_for_final_approval: readiness.ag09h_ready_for_final_approval,
  ag09h_ready_for_hold_decision: readiness.ag09h_ready_for_hold_decision,
  next_stage_id: "AG09H",
  next_stage_title: "Final Editorial Publish Approval or Hold Decision",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG09G-M",
  title: "Manual Mobile Layout Observation Note",
  status: manualObservationNote.status,
  depends_on: ["AG09G", "AG09F", "AG09E"],
  generated_from: inputs,
  summary,
  note_file: "data/content-intelligence/audit-records/ag09gm-manual-mobile-layout-observation-note.json",
  readiness_file: "data/content-intelligence/quality-registry/ag09gm-mobile-layout-manual-review-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag09gm-to-ag09h-final-editorial-decision-boundary.json",
  schema_file: "data/content-intelligence/schema/manual-mobile-layout-observation-note.schema.json",
  learning_file: "data/content-intelligence/learning/ag09gm-manual-mobile-layout-observation-note-learning.json",
  closure_decision: {
    decision: "ag09gm_manual_mobile_layout_note_created_pending_human_confirmation",
    proceed_to_ag09h_only_with_explicit_user_approval: true,
    final_publish_approval_allowed_now: false,
    publish_approval_granted: false,
    public_publishing_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG09G-M",
  title: "Manual Mobile Layout Observation Note Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "HTML fetch cannot conclusively verify mobile viewport layout.",
    "Manual mobile review should be separated from final editorial publish approval.",
    "Mobile layout review should check article shape, visual scaling, caption/credit readability and homepage listing behavior.",
    "Final publish approval must remain blocked until the manual review is confirmed or the article is intentionally held."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG09G-M",
  title: "Manual Mobile Layout Observation Note",
  status: manualObservationNote.status,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag09gm-manual-mobile-layout-observation-note.json",
    note: "data/content-intelligence/audit-records/ag09gm-manual-mobile-layout-observation-note.json",
    readiness: "data/content-intelligence/quality-registry/ag09gm-mobile-layout-manual-review-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag09gm-to-ag09h-final-editorial-decision-boundary.json",
    schema: "data/content-intelligence/schema/manual-mobile-layout-observation-note.schema.json",
    learning: "data/content-intelligence/learning/ag09gm-manual-mobile-layout-observation-note-learning.json",
    preview: "data/quality/ag09gm-manual-mobile-layout-observation-note-preview.json",
    document: "docs/quality/AG09G_M_MANUAL_MOBILE_LAYOUT_OBSERVATION_NOTE.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG09G-M",
  preview_only: true,
  status: manualObservationNote.status,
  summary,
  manual_checklist: manualChecklist,
  ag09h_handoff: nextBoundary,
  ...noMutationControls
};

const doc = `# AG09G-M — Manual Mobile Layout Observation Note

## Purpose

AG09G-M records the remaining manual mobile layout review requirement from AG09G.

AG09G-M is observation-note only. It does not mutate files, fetch live URLs, trigger deployment, activate backend/Auth/Supabase/database systems, approve publishing or publish anything.

## Source Finding

AG09G passed 6 of 7 live observations. The remaining item is mobile layout, which requires manual viewport review.

## Manual Review Checklist

The checklist covers mobile portrait, mobile landscape, hero SVG scaling, article width, caption/credit visibility, references and homepage listing/card behavior.

## Publish Boundary

Final publish approval remains blocked until manual mobile layout confirmation is recorded or a hold decision is explicitly taken.

## Next Stage

AG09H — Final Editorial Publish Approval or Hold Decision — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(notePath, manualObservationNote);
writeJson(readinessPath, readiness);
writeJson(nextBoundaryPath, nextBoundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG09G-M attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG09G-M manual mobile layout observation note artifacts generated.");
console.log(`✅ Manual mobile review required: ${unresolvedManualReview}`);
console.log(`✅ Manual checklist items: ${manualChecklist.length}`);
console.log("✅ Final publish approval remains blocked.");
console.log("✅ No mutation, live fetch, deployment trigger, backend activation or publishing performed.");
console.log("✅ AG09H handoff created with explicit approval required.");
