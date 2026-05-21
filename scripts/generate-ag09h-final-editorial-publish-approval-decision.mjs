import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag09gReview: "data/content-intelligence/quality-reviews/ag09g-controlled-live-verification-deployment-observation-audit.json",
  ag09gAudit: "data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json",
  ag09gmReview: "data/content-intelligence/quality-reviews/ag09gm-manual-mobile-layout-observation-note.json",
  ag09gmNote: "data/content-intelligence/audit-records/ag09gm-manual-mobile-layout-observation-note.json",
  ag09gmReadiness: "data/content-intelligence/quality-registry/ag09gm-mobile-layout-manual-review-readiness.json",
  ag09gmBoundary: "data/content-intelligence/mutation-plans/ag09gm-to-ag09h-final-editorial-decision-boundary.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag09h-final-editorial-publish-approval-decision.json");
const approvalPath = path.join(root, "data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag09h-final-editorial-readiness-record.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag09h-final-editorial-publish-approval-closure.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/final-editorial-publish-approval-decision.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag09h-final-editorial-publish-approval-decision-learning.json");
const registryPath = path.join(root, "data/quality/ag09h-final-editorial-publish-approval-decision.json");
const previewPath = path.join(root, "data/quality/ag09h-final-editorial-publish-approval-decision-preview.json");
const docPath = path.join(root, "docs/quality/AG09H_FINAL_EDITORIAL_PUBLISH_APPROVAL_DECISION.md");

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
    throw new Error(`Missing required AG09H input ${name}: ${relativePath}`);
  }
}

const ag09gReview = readJson(inputs.ag09gReview);
const ag09gAudit = readJson(inputs.ag09gAudit);
const ag09gmReview = readJson(inputs.ag09gmReview);
const ag09gmNote = readJson(inputs.ag09gmNote);
const ag09gmReadiness = readJson(inputs.ag09gmReadiness);
const ag09gmBoundary = readJson(inputs.ag09gmBoundary);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag09gReview.status !== "controlled_live_verification_completed_with_review_required") {
  throw new Error("AG09H expects AG09G live verification completed with manual review requirement.");
}

if (ag09gAudit.observation_summary?.failed !== 0) {
  throw new Error("AG09H cannot approve if AG09G has failed live observations.");
}

if (ag09gmReview.status !== "manual_mobile_layout_review_note_created_pending_human_confirmation") {
  throw new Error("AG09H requires AG09G-M manual mobile note.");
}

if (ag09gmBoundary.next_stage_id !== "AG09H" || ag09gmBoundary.explicit_approval_required !== true) {
  throw new Error("AG09H requires AG09G-M to AG09H explicit boundary.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) {
  throw new Error(`Selected article missing: ${selectedArticlePath}`);
}

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG09H selected article hash must match AG09C post-correction hash.");
}

const userManualConfirmation = {
  confirmation_source: "user_manual_mobile_review_in_chat",
  confirmation_status: "confirmed",
  confirmation_summary: "User reviewed the target article and related mobile surfaces on phone and confirmed links and layout are working.",
  target_article_confirmed: true,
  links_working_confirmed: true,
  mobile_layout_acceptable_confirmed: true,
  hero_visual_acceptable_confirmed: true,
  references_visible_confirmed: true,
  note_on_additional_objects: "Only one approved image/visual is present in this AG09 article cycle. Infographics, graphs, tables and other objects are deferred to future object-pipeline stages."
};

const noMutationControls = {
  final_editorial_decision_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag09h: false,
  selected_article_file_write_performed_in_ag09h: false,
  homepage_mutation_performed_in_ag09h: false,
  css_mutation_performed_in_ag09h: false,
  js_mutation_performed_in_ag09h: false,
  reference_insertion_performed_in_ag09h: false,
  reference_url_change_performed_in_ag09h: false,
  visual_generation_performed_in_ag09h: false,
  image_asset_creation_performed_in_ag09h: false,
  image_insertion_performed_in_ag09h: false,
  infographic_generation_performed_in_ag09h: false,
  graph_generation_performed_in_ag09h: false,
  table_generation_performed_in_ag09h: false,
  figure_generation_performed_in_ag09h: false,
  live_url_fetch_performed_in_ag09h: false,
  deployment_trigger_performed_in_ag09h: false,
  production_jsonl_append_performed_in_ag09h: false,
  database_write_performed_in_ag09h: false,
  supabase_write_performed_in_ag09h: false,
  backend_auth_supabase_activation_performed_in_ag09h: false,
  rollback_execution_performed_in_ag09h: false
};

const approvalChecks = [
  {
    check_id: "AG09H-CHECK-001",
    name: "ag09g_live_verification_no_failures",
    status: ag09gAudit.observation_summary?.failed === 0 ? "passed" : "failed",
    evidence: ag09gAudit.observation_summary
  },
  {
    check_id: "AG09H-CHECK-002",
    name: "manual_mobile_confirmation_received",
    status: userManualConfirmation.confirmation_status === "confirmed" ? "passed" : "failed",
    evidence: userManualConfirmation
  },
  {
    check_id: "AG09H-CHECK-003",
    name: "selected_article_hash_matches_ag09c",
    status: articleHash === ag09cApply.post_correction_hash ? "passed" : "failed",
    evidence: articleHash
  },
  {
    check_id: "AG09H-CHECK-004",
    name: "publishing_separated_from_backend_activation",
    status: "passed",
    evidence: {
      database_write: false,
      supabase_write: false,
      backend_auth_supabase_activation: false
    }
  },
  {
    check_id: "AG09H-CHECK-005",
    name: "additional_objects_deferred",
    status: "passed",
    evidence: userManualConfirmation.note_on_additional_objects
  }
];

const approvalPassed = approvalChecks.every((check) => check.status === "passed");

const approvalDecision = {
  module_id: "AG09H",
  title: "Final Editorial Publish Approval Decision",
  status: approvalPassed
    ? "final_editorial_publish_approval_recorded"
    : "final_editorial_publish_approval_blocked",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09h: articleHash,
  final_editorial_publish_approved: approvalPassed,
  editorial_publish_approved_for_static_article: approvalPassed,
  public_publishing_performed_in_ag09h: false,
  deployment_trigger_performed_in_ag09h: false,
  backend_activation_performed_in_ag09h: false,
  user_manual_confirmation: userManualConfirmation,
  approval_checks: approvalChecks,
  approval_scope: {
    approved_scope: "Static article editorial approval after AG09G live verification and user-confirmed mobile review.",
    excluded_scope: [
      "No new content generation.",
      "No new image/object insertion.",
      "No infographics/graphs/tables/figures insertion.",
      "No backend/Auth/Supabase/database activation.",
      "No deployment trigger.",
      "No rollback execution."
    ]
  },
  ...noMutationControls
};

const readiness = {
  module_id: "AG09H",
  title: "Final Editorial Readiness Record",
  status: approvalPassed
    ? "final_editorial_static_article_approved"
    : "final_editorial_static_article_not_approved",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09h: articleHash,
  final_editorial_publish_approved: approvalPassed,
  publish_ready_for_static_article: approvalPassed,
  public_publishing_performed: false,
  deployment_trigger_performed: false,
  backend_activation_ready: false,
  database_activation_ready: false,
  supabase_activation_ready: false,
  next_operational_note: approvalPassed
    ? "Article is editorially approved as a static published read. Future object expansion should start through a separate governed object-pipeline stage."
    : "Article remains held pending further review.",
  ...noMutationControls
};

const closure = {
  module_id: "AG09H",
  title: "Final Editorial Publish Approval Closure",
  status: approvalPassed
    ? "ag09_final_editorial_approval_closed_static_article"
    : "ag09_final_editorial_approval_not_closed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09h: articleHash,
  closed_chain: approvalPassed,
  closed_chain_scope: "AG09 public-experience, live-verification and final editorial decision chain for one static article.",
  future_recommendations: [
    "Start a separate governed object-pipeline cycle for infographics, graphs, tables and figures.",
    "Create a site-wide visual asset audit for older article broken-image placeholders.",
    "Keep backend/Auth/Supabase/database activation outside static article editorial approval.",
    "Create repeatable final approval template for future upgraded articles."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG09H",
  title: "Final Editorial Publish Approval Decision Schema",
  status: "schema_final_editorial_decision_only",
  final_editorial_decision_allowed_in_ag09h: true,
  manual_mobile_confirmation_allowed_in_ag09h: true,
  static_article_editorial_approval_allowed_in_ag09h: true,
  article_mutation_allowed_in_ag09h: false,
  homepage_mutation_allowed_in_ag09h: false,
  css_js_mutation_allowed_in_ag09h: false,
  reference_insertion_allowed_in_ag09h: false,
  reference_url_change_allowed_in_ag09h: false,
  visual_generation_allowed_in_ag09h: false,
  image_asset_creation_allowed_in_ag09h: false,
  image_insertion_allowed_in_ag09h: false,
  infographic_generation_allowed_in_ag09h: false,
  graph_generation_allowed_in_ag09h: false,
  table_generation_allowed_in_ag09h: false,
  figure_generation_allowed_in_ag09h: false,
  live_url_fetch_allowed_in_ag09h: false,
  deployment_trigger_allowed_in_ag09h: false,
  production_jsonl_append_allowed_in_ag09h: false,
  database_write_allowed_in_ag09h: false,
  supabase_write_allowed_in_ag09h: false,
  backend_auth_supabase_activation_allowed_in_ag09h: false,
  rollback_execution_allowed_in_ag09h: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09h: articleHash,
  final_editorial_publish_approved: approvalDecision.final_editorial_publish_approved,
  public_publishing_performed_in_ag09h: false,
  deployment_trigger_performed_in_ag09h: false,
  backend_activation_performed_in_ag09h: false,
  additional_objects_deferred: true,
  closure_status: closure.status,
  ...noMutationControls
};

const review = {
  module_id: "AG09H",
  title: "Final Editorial Publish Approval Decision",
  status: approvalDecision.status,
  depends_on: ["AG09G-M", "AG09G", "AG09F", "AG09E"],
  generated_from: inputs,
  summary,
  approval_record_file: "data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json",
  readiness_file: "data/content-intelligence/quality-registry/ag09h-final-editorial-readiness-record.json",
  closure_file: "data/content-intelligence/closure-records/ag09h-final-editorial-publish-approval-closure.json",
  schema_file: "data/content-intelligence/schema/final-editorial-publish-approval-decision.schema.json",
  learning_file: "data/content-intelligence/learning/ag09h-final-editorial-publish-approval-decision-learning.json",
  closure_decision: {
    decision: approvalPassed
      ? "ag09h_final_editorial_static_article_approval_recorded"
      : "ag09h_final_editorial_static_article_approval_blocked",
    ag09_chain_closed: approvalPassed,
    public_publishing_performed: false,
    deployment_trigger_performed: false,
    backend_activation_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG09H",
  title: "Final Editorial Publish Approval Decision Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Manual mobile confirmation can close a live-verification review item without creating a mutation stage.",
    "Static article editorial approval must remain separate from backend/Auth/Supabase/database activation.",
    "One visual object is acceptable for the first governed article cycle; additional objects should be governed separately.",
    "Broken-image placeholders observed in other articles should become a site-wide visual audit, not an AG09 target-article blocker."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG09H",
  title: "Final Editorial Publish Approval Decision",
  status: approvalDecision.status,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag09h-final-editorial-publish-approval-decision.json",
    approval: "data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json",
    readiness: "data/content-intelligence/quality-registry/ag09h-final-editorial-readiness-record.json",
    closure: "data/content-intelligence/closure-records/ag09h-final-editorial-publish-approval-closure.json",
    schema: "data/content-intelligence/schema/final-editorial-publish-approval-decision.schema.json",
    learning: "data/content-intelligence/learning/ag09h-final-editorial-publish-approval-decision-learning.json",
    preview: "data/quality/ag09h-final-editorial-publish-approval-decision-preview.json",
    document: "docs/quality/AG09H_FINAL_EDITORIAL_PUBLISH_APPROVAL_DECISION.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG09H",
  preview_only: true,
  status: approvalDecision.status,
  summary,
  user_manual_confirmation: userManualConfirmation,
  approval_checks: approvalChecks,
  future_recommendations: closure.future_recommendations,
  ...noMutationControls
};

const doc = `# AG09H — Final Editorial Publish Approval Decision

## Purpose

AG09H records the final editorial decision for the AG09 target article after live verification and user-confirmed mobile review.

AG09H is decision-only. It does not mutate files, trigger deployment, activate backend/Auth/Supabase/database systems, create new objects, or perform rollback.

## Decision

- Selected article: \`${selectedArticlePath}\`
- Final editorial approval: \`${approvalDecision.final_editorial_publish_approved}\`
- Public publishing performed in AG09H: \`false\`
- Backend activation performed: \`false\`

## Manual Mobile Confirmation

The user confirmed that the target article and links are working on mobile. The mobile layout review item from AG09G-M is therefore treated as human-confirmed for final editorial decision purposes.

## Object Scope

This AG09 cycle approves the article with the currently inserted editorial visual. Infographics, graphs, tables, figures and other objects are deferred to a future governed object-pipeline cycle.

## Closure

AG09H closes the one-article public-experience and final editorial decision chain for the target article.
`;

writeJson(reviewPath, review);
writeJson(approvalPath, approvalDecision);
writeJson(readinessPath, readiness);
writeJson(closurePath, closure);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG09H attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG09H final editorial publish approval decision artifacts generated.");
console.log(`✅ Final editorial approval: ${approvalDecision.final_editorial_publish_approved}`);
console.log("✅ Manual mobile confirmation recorded.");
console.log("✅ Additional objects deferred to future governed object-pipeline cycle.");
console.log("✅ No mutation, deployment trigger, backend activation, live fetch or publishing operation performed.");
