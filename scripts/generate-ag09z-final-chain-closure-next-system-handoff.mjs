import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag09hReview: "data/content-intelligence/quality-reviews/ag09h-final-editorial-publish-approval-decision.json",
  ag09hApproval: "data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json",
  ag09hReadiness: "data/content-intelligence/quality-registry/ag09h-final-editorial-readiness-record.json",
  ag09hClosure: "data/content-intelligence/closure-records/ag09h-final-editorial-publish-approval-closure.json",
  ag09gAudit: "data/content-intelligence/audit-records/ag09g-controlled-live-verification-deployment-observation-audit-report.json",
  ag09gmNote: "data/content-intelligence/audit-records/ag09gm-manual-mobile-layout-observation-note.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag09z-final-chain-closure-next-system-handoff.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag09z-final-chain-closure-next-system-handoff.json");
const finalReadinessPath = path.join(root, "data/content-intelligence/quality-registry/ag09z-final-public-experience-chain-readiness.json");
const handoffPath = path.join(root, "data/content-intelligence/mutation-plans/ag09z-to-ag10a-governed-object-pipeline-planning-handoff.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/final-chain-closure-next-system-handoff.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag09z-final-chain-closure-next-system-handoff-learning.json");
const registryPath = path.join(root, "data/quality/ag09z-final-chain-closure-next-system-handoff.json");
const previewPath = path.join(root, "data/quality/ag09z-final-chain-closure-next-system-handoff-preview.json");
const docPath = path.join(root, "docs/quality/AG09Z_FINAL_CHAIN_CLOSURE_NEXT_SYSTEM_HANDOFF.md");

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
    throw new Error(`Missing required AG09Z input ${name}: ${relativePath}`);
  }
}

const ag09hReview = readJson(inputs.ag09hReview);
const ag09hApproval = readJson(inputs.ag09hApproval);
const ag09hReadiness = readJson(inputs.ag09hReadiness);
const ag09hClosure = readJson(inputs.ag09hClosure);
const ag09gAudit = readJson(inputs.ag09gAudit);
const ag09gmNote = readJson(inputs.ag09gmNote);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag09hReview.status !== "final_editorial_publish_approval_recorded") {
  throw new Error("AG09Z requires AG09H review approval record.");
}

if (ag09hApproval.final_editorial_publish_approved !== true) {
  throw new Error("AG09Z requires AG09H final editorial approval.");
}

if (ag09hReadiness.status !== "final_editorial_static_article_approved") {
  throw new Error("AG09Z requires AG09H final editorial readiness.");
}

if (ag09hClosure.status !== "ag09_final_editorial_approval_closed_static_article") {
  throw new Error("AG09Z requires AG09H closure.");
}

if (ag09gAudit.observation_summary?.failed !== 0) {
  throw new Error("AG09Z cannot close if AG09G has failed observations.");
}

if (ag09gmNote.user_manual_confirmation?.confirmation_status === "failed") {
  throw new Error("AG09Z cannot close if manual mobile confirmation failed.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) {
  throw new Error(`Selected article missing: ${selectedArticlePath}`);
}

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG09Z selected article hash must match AG09C post-correction hash.");
}

const noMutationControls = {
  final_chain_closure_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag09z: false,
  selected_article_file_write_performed_in_ag09z: false,
  homepage_mutation_performed_in_ag09z: false,
  css_mutation_performed_in_ag09z: false,
  js_mutation_performed_in_ag09z: false,
  reference_insertion_performed_in_ag09z: false,
  reference_url_change_performed_in_ag09z: false,
  visual_generation_performed_in_ag09z: false,
  image_asset_creation_performed_in_ag09z: false,
  image_insertion_performed_in_ag09z: false,
  infographic_generation_performed_in_ag09z: false,
  graph_generation_performed_in_ag09z: false,
  table_generation_performed_in_ag09z: false,
  figure_generation_performed_in_ag09z: false,
  map_generation_performed_in_ag09z: false,
  diagram_generation_performed_in_ag09z: false,
  live_url_fetch_performed_in_ag09z: false,
  deployment_trigger_performed_in_ag09z: false,
  production_jsonl_append_performed_in_ag09z: false,
  database_write_performed_in_ag09z: false,
  supabase_write_performed_in_ag09z: false,
  backend_auth_supabase_activation_performed_in_ag09z: false,
  rollback_execution_performed_in_ag09z: false,
  public_publishing_operation_performed_in_ag09z: false
};

const closureChecks = [
  {
    check_id: "AG09Z-CHECK-001",
    name: "ag09h_final_editorial_approval_recorded",
    status: ag09hApproval.final_editorial_publish_approved === true ? "passed" : "failed",
    evidence: ag09hApproval.status
  },
  {
    check_id: "AG09Z-CHECK-002",
    name: "ag09h_chain_closed",
    status: ag09hClosure.closed_chain === true ? "passed" : "failed",
    evidence: ag09hClosure.status
  },
  {
    check_id: "AG09Z-CHECK-003",
    name: "selected_article_hash_stable",
    status: articleHash === ag09cApply.post_correction_hash ? "passed" : "failed",
    evidence: articleHash
  },
  {
    check_id: "AG09Z-CHECK-004",
    name: "live_verification_no_failed_items",
    status: ag09gAudit.observation_summary?.failed === 0 ? "passed" : "failed",
    evidence: ag09gAudit.observation_summary
  },
  {
    check_id: "AG09Z-CHECK-005",
    name: "additional_objects_deferred",
    status: "passed",
    evidence: "Infographics, graphs, tables, figures, maps and diagrams are deferred to AG10A governed object-pipeline planning."
  },
  {
    check_id: "AG09Z-CHECK-006",
    name: "forbidden_systems_not_activated",
    status:
      ag09hApproval.deployment_trigger_performed_in_ag09h === false &&
      ag09hApproval.backend_activation_performed_in_ag09h === false &&
      ag09hApproval.public_publishing_performed_in_ag09h === false
        ? "passed"
        : "failed",
    evidence: {
      deployment_trigger: ag09hApproval.deployment_trigger_performed_in_ag09h,
      backend_activation: ag09hApproval.backend_activation_performed_in_ag09h,
      publishing_operation: ag09hApproval.public_publishing_performed_in_ag09h
    }
  }
];

const closurePassed = closureChecks.every((check) => check.status === "passed");

const finalClosure = {
  module_id: "AG09Z",
  title: "Final AG09 Chain Closure and Next-System Handoff",
  status: closurePassed
    ? "ag09_chain_closed_next_system_handoff_created"
    : "ag09_chain_closure_review_required",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09z: articleHash,
  closed_chain_scope: "One upgraded static article: public-experience correction, live verification, mobile confirmation and final editorial decision.",
  ag09_chain_closed: closurePassed,
  final_editorial_static_article_approved: ag09hApproval.final_editorial_publish_approved === true,
  public_publishing_operation_performed: false,
  deployment_trigger_performed: false,
  backend_activation_performed: false,
  closure_checks: closureChecks,
  carried_forward_evidence: {
    ag09h_approval_status: ag09hApproval.status,
    ag09h_readiness_status: ag09hReadiness.status,
    ag09h_closure_status: ag09hClosure.status,
    ag09g_live_observation_status: ag09gAudit.status,
    ag09g_observation_summary: ag09gAudit.observation_summary,
    target_article_post_correction_hash: ag09cApply.post_correction_hash
  },
  ...noMutationControls
};

const finalReadiness = {
  module_id: "AG09Z",
  title: "Final Public Experience Chain Readiness",
  status: closurePassed
    ? "one_article_public_experience_chain_closed"
    : "one_article_public_experience_chain_review_required",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09z: articleHash,
  editorially_approved_static_article: closurePassed,
  ready_for_future_object_pipeline: closurePassed,
  ready_for_backend_activation: false,
  ready_for_supabase_activation: false,
  ready_for_database_activation: false,
  public_publishing_operation_performed: false,
  next_system: "AG10A — Governed Object Pipeline Planning",
  ...noMutationControls
};

const ag10aHandoff = {
  module_id: "AG09Z",
  title: "AG09Z to AG10A Governed Object Pipeline Planning Handoff",
  status: "ag10a_handoff_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09z: articleHash,
  next_stage_id: "AG10A",
  next_stage_title: "Governed Object Pipeline Planning",
  explicit_approval_required: true,
  ag10a_purpose: "Create a governed, cost-aware object pipeline for non-text article assets and site-wide visual integrity.",
  ag10a_scope_candidates: [
    {
      object_type: "infographic",
      purpose: "Explain article logic, policy flow, concept architecture or reader lens visually.",
      placement_rule: "Controlled insertion only after article-shape, wrap and mobile-width checks."
    },
    {
      object_type: "graph_or_chart",
      purpose: "Represent quantitative data only where validated data source exists.",
      placement_rule: "Centrally aligned in reading column; no mobile overflow."
    },
    {
      object_type: "table",
      purpose: "Show structured comparison, timeline, references or datasets.",
      placement_rule: "Responsive table wrapper required; central alignment for vertical reading flow."
    },
    {
      object_type: "figure_or_diagram",
      purpose: "Show systems, stages, frameworks or causal relationships.",
      placement_rule: "Controlled width; caption and attribution mandatory."
    },
    {
      object_type: "map",
      purpose: "Use only where location-based explanation adds value.",
      placement_rule: "Source/rights and mobile behavior must be approved first."
    },
    {
      object_type: "broken_image_placeholder_audit",
      purpose: "Detect older pages where image placeholders or missing visuals appear.",
      placement_rule: "Site-wide audit first; correction plan later."
    }
  ],
  cost_control_doctrine: [
    "Do not use external image generation unless internal SVG/template solution is insufficient.",
    "Prefer reusable internal object templates.",
    "Separate object candidate planning from object generation.",
    "Generate or insert only after approval and source/rights/attribution checks.",
    "Do not re-run full article pipeline merely to add objects."
  ],
  blocked_scope_in_ag09z: [
    "No object generation.",
    "No article mutation.",
    "No image insertion.",
    "No infographic/table/graph/figure/map insertion.",
    "No CSS/JS mutation.",
    "No backend/Auth/Supabase/database activation.",
    "No deployment trigger."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG09Z",
  title: "Final Chain Closure and Next-System Handoff Schema",
  status: "schema_final_chain_closure_only",
  final_chain_closure_allowed_in_ag09z: true,
  ag10a_handoff_allowed_in_ag09z: true,
  final_readiness_record_allowed_in_ag09z: true,
  article_mutation_allowed_in_ag09z: false,
  homepage_mutation_allowed_in_ag09z: false,
  css_js_mutation_allowed_in_ag09z: false,
  reference_insertion_allowed_in_ag09z: false,
  reference_url_change_allowed_in_ag09z: false,
  visual_generation_allowed_in_ag09z: false,
  image_asset_creation_allowed_in_ag09z: false,
  image_insertion_allowed_in_ag09z: false,
  infographic_generation_allowed_in_ag09z: false,
  graph_generation_allowed_in_ag09z: false,
  table_generation_allowed_in_ag09z: false,
  figure_generation_allowed_in_ag09z: false,
  map_generation_allowed_in_ag09z: false,
  diagram_generation_allowed_in_ag09z: false,
  live_url_fetch_allowed_in_ag09z: false,
  deployment_trigger_allowed_in_ag09z: false,
  production_jsonl_append_allowed_in_ag09z: false,
  database_write_allowed_in_ag09z: false,
  supabase_write_allowed_in_ag09z: false,
  backend_auth_supabase_activation_allowed_in_ag09z: false,
  rollback_execution_allowed_in_ag09z: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag09z: articleHash,
  ag09_chain_closed: finalClosure.ag09_chain_closed,
  editorially_approved_static_article: finalReadiness.editorially_approved_static_article,
  public_publishing_operation_performed: false,
  deployment_trigger_performed: false,
  backend_activation_performed: false,
  next_stage_id: "AG10A",
  next_stage_title: "Governed Object Pipeline Planning",
  additional_objects_deferred_to_ag10a: true,
  ...noMutationControls
};

const review = {
  module_id: "AG09Z",
  title: "Final AG09 Chain Closure and Next-System Handoff",
  status: finalClosure.status,
  depends_on: ["AG09H", "AG09G-M", "AG09G", "AG09F", "AG09E"],
  generated_from: inputs,
  summary,
  closure_file: "data/content-intelligence/closure-records/ag09z-final-chain-closure-next-system-handoff.json",
  final_readiness_file: "data/content-intelligence/quality-registry/ag09z-final-public-experience-chain-readiness.json",
  ag10a_handoff_file: "data/content-intelligence/mutation-plans/ag09z-to-ag10a-governed-object-pipeline-planning-handoff.json",
  schema_file: "data/content-intelligence/schema/final-chain-closure-next-system-handoff.schema.json",
  learning_file: "data/content-intelligence/learning/ag09z-final-chain-closure-next-system-handoff-learning.json",
  closure_decision: {
    decision: closurePassed
      ? "ag09z_chain_closed_ag10a_handoff_ready"
      : "ag09z_chain_closure_review_required",
    proceed_to_ag10a_only_with_explicit_user_approval: true,
    public_publishing_operation_performed: false,
    deployment_trigger_performed: false,
    backend_activation_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG09Z",
  title: "Final AG09 Chain Closure and Next-System Handoff Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "One-article public-experience closure is complete only after editorial approval and mobile confirmation are recorded.",
    "Final editorial approval is not the same as backend/Auth/Supabase activation.",
    "Object expansion should be handled as a separate governed pipeline, not appended casually to a closed article chain.",
    "Broken image placeholders observed elsewhere should become site-wide visual integrity audit scope under AG10A."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG09Z",
  title: "Final AG09 Chain Closure and Next-System Handoff",
  status: finalClosure.status,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag09z-final-chain-closure-next-system-handoff.json",
    closure: "data/content-intelligence/closure-records/ag09z-final-chain-closure-next-system-handoff.json",
    final_readiness: "data/content-intelligence/quality-registry/ag09z-final-public-experience-chain-readiness.json",
    ag10a_handoff: "data/content-intelligence/mutation-plans/ag09z-to-ag10a-governed-object-pipeline-planning-handoff.json",
    schema: "data/content-intelligence/schema/final-chain-closure-next-system-handoff.schema.json",
    learning: "data/content-intelligence/learning/ag09z-final-chain-closure-next-system-handoff-learning.json",
    preview: "data/quality/ag09z-final-chain-closure-next-system-handoff-preview.json",
    document: "docs/quality/AG09Z_FINAL_CHAIN_CLOSURE_NEXT_SYSTEM_HANDOFF.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG09Z",
  preview_only: true,
  status: finalClosure.status,
  summary,
  closure_checks: closureChecks,
  ag10a_handoff: ag10aHandoff,
  ...noMutationControls
};

const doc = `# AG09Z — Final AG09 Chain Closure and Next-System Handoff

## Purpose

AG09Z closes the AG09 public-experience and final editorial decision chain for the selected static article.

AG09Z is closure-only. It does not mutate files, insert objects, trigger deployment, fetch live URLs, activate backend/Auth/Supabase/database systems, execute rollback or perform any publishing operation.

## Closed Article

- Selected article: \`${selectedArticlePath}\`
- Article hash: \`${articleHash}\`
- Editorial approval: \`${finalReadiness.editorially_approved_static_article}\`

## Closure Result

AG09 closes the one-article public-experience, live-verification, mobile-confirmation and final editorial approval chain.

## Next-System Handoff

AG10A — Governed Object Pipeline Planning — is the next recommended stage.

AG10A should separately plan infographics, graphs, tables, figures, maps, diagrams and site-wide broken-image placeholder audit with cost-control and layout-preservation rules.

## Boundaries

No article mutation, image/object generation, image/object insertion, CSS/JS mutation, backend/Auth/Supabase/database activation, deployment trigger, rollback execution or publishing operation is performed in AG09Z.
`;

writeJson(reviewPath, review);
writeJson(closurePath, finalClosure);
writeJson(finalReadinessPath, finalReadiness);
writeJson(handoffPath, ag10aHandoff);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG09Z attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG09Z final chain closure and next-system handoff artifacts generated.");
console.log(`✅ AG09 chain closed: ${finalClosure.ag09_chain_closed}`);
console.log("✅ AG10A governed object pipeline planning handoff created.");
console.log("✅ No mutation, object generation, deployment trigger, backend activation or publishing operation performed.");
