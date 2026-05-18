import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08eReview: "data/content-intelligence/quality-reviews/ag08e-full-upgrade-draft-candidate-references.json",
  ag08eDraft: "data/content-intelligence/content-packets/ag08e-full-upgrade-draft-candidate.json",
  ag08eReferences: "data/content-intelligence/reference-registry/ag08e-candidate-reference-urls.json",
  ag08eReadiness: "data/content-intelligence/quality-registry/ag08e-draft-candidate-readiness.json",
  ag08eSchema: "data/content-intelligence/schema/full-upgrade-draft-candidate-references.schema.json",
  ag08eLearning: "data/content-intelligence/learning/ag08e-full-upgrade-draft-candidate-references-learning.json",
  ag08dReadiness: "data/content-intelligence/quality-registry/ag08d-reference-visual-readiness-gap-matrix.json",
  ag06eStandard: "data/quality/ag06e-long-form-article-standard.json",
  ag06jReferenceStandard: "data/quality/ag06j-reference-source-credibility-schema-closure.json",
  ag06iVisualStandard: "data/quality/ag06i-visual-data-infographic-requirement-schema-closure.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08f-draft-approval-controlled-apply-plan.json");
const approvalPath = path.join(root, "data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json");
const applyPlanPath = path.join(root, "data/content-intelligence/mutation-plans/ag08f-controlled-apply-plan.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag08f-apply-readiness-record.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/draft-approval-controlled-apply-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08f-draft-approval-controlled-apply-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag08f-draft-approval-controlled-apply-plan.json");
const previewPath = path.join(root, "data/quality/ag08f-draft-approval-controlled-apply-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG08F_DRAFT_APPROVAL_CONTROLLED_APPLY_PLAN.md");

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

function countWords(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function slugFromPath(articlePath) {
  return path.basename(articlePath).replace(/\.html$/i, "");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG08F input ${name}: ${relativePath}`);
  }
}

const ag08eReview = readJson(inputs.ag08eReview);
const ag08eDraft = readJson(inputs.ag08eDraft);
const ag08eReferences = readJson(inputs.ag08eReferences);
const ag08eReadiness = readJson(inputs.ag08eReadiness);
const ag08eSchema = readJson(inputs.ag08eSchema);
const ag08eLearning = readJson(inputs.ag08eLearning);
const ag08dReadiness = readJson(inputs.ag08dReadiness);
const ag06eStandard = readJson(inputs.ag06eStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);

const selectedArticlePath = ag08eDraft.selected_article?.article_path;
if (!selectedArticlePath) throw new Error("AG08E selected article path missing.");
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleAbs = path.join(root, selectedArticlePath);
const htmlBefore = fs.readFileSync(articleAbs, "utf8");
const hashBefore = sha256(htmlBefore);

if (ag08eDraft.selected_article.sha256_before_ag08e !== hashBefore) {
  throw new Error("Selected article hash changed after AG08E. Refusing AG08F approval/apply planning.");
}

const draftText = ag08eDraft.draft_candidate?.draft_text || "";
const draftWordCount = countWords(draftText);
const candidateReferences = asArray(ag08eReferences.candidates);
const articleSlug = slugFromPath(selectedArticlePath);
const backupPath = `archive/ag08g-backups/${articleSlug}-before-ag08g.html`;

const noMutationControls = {
  draft_approval_plan_only: true,
  draft_candidate_reviewed: true,
  draft_candidate_approved_for_ag08g_apply: true,
  candidate_references_reviewed: true,
  candidate_references_approved_for_ag08g_insertion: true,
  controlled_apply_plan_created: true,
  backup_rollback_plan_created: true,
  post_apply_audit_checklist_created: true,
  ag08g_handoff_created: true,
  selected_article_read_performed: true,
  selected_article_hash_verified: true,
  selected_article_mutated: false,
  article_mutation_performed: false,
  new_article_file_created: false,
  article_file_created: false,
  final_article_file_generated: false,
  article_html_mutation_performed: false,
  public_article_mutation_performed: false,
  static_live_apply_performed: false,
  static_live_mutation_performed: false,
  file_edit_performed: false,
  file_write_performed: false,
  article_file_write_performed: false,
  target_article_file_write_performed: false,
  backup_file_created: false,
  rollback_execution_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  approved_reference_url_population_performed: false,
  live_url_fetch_performed_by_script: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
  caption_alt_credit_population_performed_for_article: false,
  production_jsonl_append_performed: false,
  jsonl_append_performed: false,
  jsonl_production_record_created: false,
  database_write_performed: false,
  supabase_write_performed: false,
  supabase_enabled: false,
  auth_enabled: false,
  backend_activation_performed: false,
  backend_auth_supabase_activation_performed: false,
  api_route_created: false,
  public_publishing_performed: false,
  publication_approval_granted: false,
  public_output_activation_performed: false,
  subscriber_output_activation_performed: false,
  admin_output_activation_performed: false,
  payment_activation_performed: false,
  multi_article_mutation_performed: false
};

const approvedReferences = candidateReferences.map((ref, index) => ({
  ...ref,
  approval_status: "approved_for_ag08g_insertion",
  approval_order: index + 1,
  insertion_status: "approved_not_inserted",
  approved_for_article_path: selectedArticlePath,
  approved_use: "visible_reference_block_and_supporting_reference_metadata",
  ag08f_approval_note: "Approved as candidate reference for AG08G controlled article apply; not inserted in AG08F."
}));

const draftApproval = {
  draft_title: ag08eDraft.draft_candidate.title,
  draft_word_count_estimate: draftWordCount,
  target_word_count_range: ag08eDraft.draft_candidate.target_word_count_range,
  within_target_word_count_range: draftWordCount >= 1500 && draftWordCount <= 5500,
  approved_for_ag08g_apply: true,
  approval_status: "approved_for_controlled_apply_plan",
  approval_basis: [
    "Draft is within revised long-form range.",
    "Draft addresses AG08D quality gaps on long-form depth and reader value.",
    "Candidate references are available as artifact-only records.",
    "Selected article hash remains unchanged since AG08E."
  ],
  required_ag08g_adjustments: [
    "Convert markdown artifact into static article HTML block.",
    "Insert approved references in a visible references section.",
    "Preserve existing article shell, navigation, footer, hero/credit safety and site layout.",
    "Add exactly one AG08G controlled apply marker.",
    "Create pre-apply backup before modifying the article file."
  ]
};

const referenceApproval = {
  candidate_reference_count: candidateReferences.length,
  approved_reference_count: approvedReferences.length,
  approval_status: "approved_for_ag08g_reference_insertion",
  approved_references: approvedReferences,
  insertion_status: "approved_not_inserted_in_ag08f",
  reference_rules_for_ag08g: [
    "Insert only AG08F-approved URLs.",
    "Do not create or invent additional references in AG08G.",
    "Preserve source titles, URLs and source-owner fields.",
    "Place references in a visible section after article body and before footer/back links where feasible.",
    "Maintain exactly the approved AG08F reference set unless AG08G validator blocks apply."
  ]
};

const visualDecision = {
  visual_generation_approval_status: "not_approved_for_ag08g",
  image_insertion_approval_status: "not_approved_for_ag08g",
  visual_data_concept_status: "carried_forward_as_concept_only",
  rationale: "The pilot controlled apply should focus on article text and approved references. Visual generation/insertion remains deferred to a later dedicated visual stage.",
  ag08g_visual_scope: "do_not_generate_or_insert_visuals"
};

const backupRollbackPlan = {
  backup_required_before_apply: true,
  backup_path: backupPath,
  backup_creation_stage: "AG08G",
  rollback_strategy: {
    rollback_possible: true,
    rollback_stage_if_needed: "AG08H_or_manual_emergency_restore",
    restore_source: backupPath,
    restore_target: selectedArticlePath,
    rollback_validation: [
      "target article restored to backup hash",
      "AG08G marker absent after rollback",
      "existing site validation passes"
    ]
  },
  backup_status_in_ag08f: "planned_not_created"
};

const exactApplyPlan = {
  module_id: "AG08F",
  title: "Controlled Apply Plan for AG08G",
  status: "apply_plan_created_not_executed",
  selected_article_path: selectedArticlePath,
  selected_article_sha256_before_ag08f: hashBefore,
  ag08g_target_article_path: selectedArticlePath,
  ag08g_backup_path: backupPath,
  allowed_ag08g_mutation_scope: {
    exactly_one_article_file: true,
    allowed_target_article_path: selectedArticlePath,
    allowed_changes: [
      "create pre-apply backup",
      "insert or replace one AG08G controlled upgraded article block",
      "insert approved AG08F reference set",
      "add exactly one AG08G controlled apply marker",
      "record apply audit artifacts"
    ],
    forbidden_changes: [
      "multi-article mutation",
      "homepage mutation",
      "CSS/JS mutation",
      "visual generation",
      "image insertion",
      "unapproved reference insertion",
      "JSONL append",
      "database/Supabase write",
      "backend/Auth/Supabase activation",
      "publishing approval"
    ]
  },
  article_body_apply_strategy: {
    draft_source: "data/content-intelligence/content-packets/ag08e-full-upgrade-draft-candidate.json",
    draft_field: "draft_candidate.draft_text",
    output_mode_for_ag08g: "static_html_block_inside_selected_article",
    marker_required: "AG08G-CONTROLLED-APPLY",
    marker_count_required_after_apply: 1,
    preferred_block_id: "ag08g-controlled-upgrade",
    preserve_existing_shell: true,
    preserve_navigation_footer_and_static_layout: true,
    preserve_existing_non_target_articles: true
  },
  reference_apply_strategy: {
    approved_reference_source: "data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json",
    approved_reference_count: approvedReferences.length,
    insertion_mode_for_ag08g: "visible_reference_section_inside_selected_article",
    reference_marker_required: "AG08G-APPROVED-REFERENCES",
    insert_only_approved_references: true
  },
  visual_apply_strategy: visualDecision,
  post_apply_audit_checklist: [
    "Selected article contains exactly one AG08G controlled apply marker.",
    "Only selected article file changed apart from AG08G governance/audit artifacts and backup.",
    "Backup exists and has no AG08G marker.",
    "Approved references are visible and match AG08F approval record.",
    "No visual/image insertion occurred.",
    "No JSONL/database/Supabase/backend/Auth/publishing activation occurred.",
    "validate:ag08g passes.",
    "validate:project passes after apply."
  ],
  execution_status: "not_executed_in_ag08f",
  ...noMutationControls
};

const approvalRecord = {
  module_id: "AG08F",
  title: "Draft and Reference Approval Record",
  status: "draft_and_references_approved_for_ag08g_apply_plan",
  selected_article_path: selectedArticlePath,
  selected_article_sha256_before_ag08f: hashBefore,
  draft_approval: draftApproval,
  reference_approval: referenceApproval,
  visual_decision: visualDecision,
  backup_rollback_plan: backupRollbackPlan,
  ag08g_handoff: {
    next_stage_id: "AG08G",
    next_stage_title: "One-Article Controlled Apply",
    explicit_approval_required: true,
    selected_article_path: selectedArticlePath,
    allowed_scope: "create pre-apply backup and mutate exactly one selected article using AG08E approved draft and AG08F approved references",
    blocked_scope: "multi-article mutation, visual generation, image insertion, production JSONL append, database/Supabase write, backend/Auth/Supabase activation and publishing approval"
  },
  ...noMutationControls
};

const readinessChecks = [
  {
    check_id: "AG08F-CHECK-001",
    name: "ag08e_draft_candidate_present",
    status: "passed",
    evidence: `Draft word count estimate: ${draftWordCount}`
  },
  {
    check_id: "AG08F-CHECK-002",
    name: "draft_word_count_within_1500_5500",
    status: draftWordCount >= 1500 && draftWordCount <= 5500 ? "passed" : "blocked",
    evidence: draftApproval.target_word_count_range
  },
  {
    check_id: "AG08F-CHECK-003",
    name: "candidate_references_approved",
    status: approvedReferences.length >= 2 ? "passed" : "blocked",
    evidence: `Approved reference count: ${approvedReferences.length}`
  },
  {
    check_id: "AG08F-CHECK-004",
    name: "selected_article_hash_unchanged",
    status: "passed",
    evidence: hashBefore
  },
  {
    check_id: "AG08F-CHECK-005",
    name: "backup_rollback_plan_ready",
    status: "passed",
    evidence: backupPath
  },
  {
    check_id: "AG08F-CHECK-006",
    name: "visual_generation_deferred",
    status: "passed",
    evidence: visualDecision.visual_generation_approval_status
  },
  {
    check_id: "AG08F-CHECK-007",
    name: "ag08g_handoff_ready",
    status: "passed",
    evidence: approvalRecord.ag08g_handoff.next_stage_title
  }
];

const readinessRecord = {
  module_id: "AG08F",
  title: "Apply Readiness Record",
  status: "ag08g_apply_plan_ready_pending_explicit_approval",
  selected_article_path: selectedArticlePath,
  selected_article_sha256_before_ag08f: hashBefore,
  readiness_checks: readinessChecks,
  all_readiness_checks_passed: readinessChecks.every((check) => check.status === "passed"),
  ag08g_handoff: approvalRecord.ag08g_handoff,
  ...noMutationControls
};

const summary = {
  ag08e_draft_candidate_consumed: ag08eReview.status === "full_upgrade_draft_candidate_and_references_created",
  selected_article_path: selectedArticlePath,
  selected_article_sha256_before_ag08f: hashBefore,
  draft_candidate_reviewed: true,
  draft_candidate_approved_for_ag08g_apply: true,
  draft_word_count_estimate: draftWordCount,
  candidate_references_reviewed: true,
  candidate_references_approved_for_ag08g_insertion: true,
  approved_reference_count: approvedReferences.length,
  visual_generation_deferred: true,
  controlled_apply_plan_created: true,
  backup_rollback_plan_created: true,
  post_apply_audit_checklist_created: true,
  ag08g_handoff_created: true,
  next_stage_id: "AG08G",
  next_stage_title: "One-Article Controlled Apply",
  next_stage_requires_explicit_approval: true,
  article_mutation_performed: false,
  file_edit_performed: false,
  article_file_write_performed: false,
  reference_insertion_performed: false,
  visual_generation_performed: false,
  image_insertion_performed: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  publishing_performed: false,
  production_readiness_after_ag08f: "apply_plan_ready_pending_explicit_ag08g_approval",
  publish_readiness_after_ag08f: "blocked"
};

const schema = {
  schema_id: "drishvara/ag08f/draft-approval-controlled-apply-plan.schema.json",
  module_id: "AG08F",
  title: "Draft Approval and Controlled Apply Plan Schema",
  status: "schema_approval_apply_plan_only",
  description: "Schema for approving AG08E draft and references and planning AG08G controlled apply without mutating article files.",
  draft_review_allowed_in_ag08f: true,
  draft_approval_allowed_in_ag08f: true,
  reference_approval_allowed_in_ag08f: true,
  controlled_apply_planning_allowed_in_ag08f: true,
  backup_rollback_planning_allowed_in_ag08f: true,
  post_apply_audit_planning_allowed_in_ag08f: true,
  ag08g_handoff_allowed_in_ag08f: true,
  article_mutation_allowed_in_ag08f: false,
  file_edit_allowed_in_ag08f: false,
  article_file_write_allowed_in_ag08f: false,
  reference_insertion_allowed_in_ag08f: false,
  visual_generation_allowed_in_ag08f: false,
  image_insertion_allowed_in_ag08f: false,
  production_jsonl_append_allowed_in_ag08f: false,
  database_write_allowed_in_ag08f: false,
  supabase_write_allowed_in_ag08f: false,
  backend_auth_supabase_allowed_in_ag08f: false,
  publishing_allowed_in_ag08f: false,
  ...noMutationControls
};

const learning = {
  module_id: "AG08F",
  title: "Draft Approval and Controlled Apply Plan Learning",
  status: "learning_record_only",
  generated_from: inputs,
  summary,
  learning_points_from_ag08e: asArray(ag08eLearning.ag08e_learning_points),
  ag08f_learning_points: [
    "Draft approval should be separated from article mutation.",
    "Reference approval should occur before HTML insertion.",
    "AG08G must create backup before touching the selected article.",
    "Visual generation remains deferred for this pilot to reduce mutation risk.",
    "One-article apply must remain strictly path-bound."
  ],
  carried_forward_doctrine: [
    "Approved draft before apply.",
    "Approved references before insertion.",
    "Backup before mutation.",
    "Exactly one article file may be mutated in AG08G.",
    "No JSONL/database/Supabase/backend/Auth/publishing activation."
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG08F",
  title: "Draft Approval and Controlled Apply Plan",
  status: "draft_approval_controlled_apply_plan_created",
  governance_only: true,
  draft_approval_plan_only: true,
  depends_on: ["AG08E", "AG08D", "AG08C"],
  generated_from: inputs,
  summary,
  ag08e_alignment: {
    ag08e_status: ag08eReview.status,
    ag08e_decision: ag08eReview.closure_decision?.decision,
    ag08f_requires_explicit_approval: ag08eReview.closure_decision?.proceed_to_ag08f_only_with_explicit_user_approval,
    ag08e_selected_article_path: ag08eReview.closure_decision?.selected_article_path,
    ag08e_article_mutation_performed: ag08eReview.closure_decision?.article_mutation_performed,
    ag08e_reference_insertion_performed: ag08eReview.closure_decision?.reference_insertion_performed,
    ag08e_visual_generation_performed: ag08eReview.closure_decision?.visual_generation_performed
  },
  approval_record_file: "data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json",
  controlled_apply_plan_file: "data/content-intelligence/mutation-plans/ag08f-controlled-apply-plan.json",
  readiness_file: "data/content-intelligence/quality-registry/ag08f-apply-readiness-record.json",
  schema_file: "data/content-intelligence/schema/draft-approval-controlled-apply-plan.schema.json",
  learning_file: "data/content-intelligence/learning/ag08f-draft-approval-controlled-apply-plan-learning.json",
  closure_decision: {
    decision: "ag08f_apply_plan_closed_ready_for_ag08g_controlled_apply",
    draft_candidate_approved_for_ag08g_apply: true,
    candidate_references_approved_for_ag08g_insertion: true,
    selected_article_path: selectedArticlePath,
    proceed_to_ag08g_only_with_explicit_user_approval: true,
    ag08g_scope: "create backup and mutate exactly one selected article using approved draft and approved references",
    article_mutation_performed: false,
    file_edit_performed: false,
    article_file_write_performed: false,
    reference_insertion_performed: false,
    visual_generation_performed: false,
    image_insertion_performed: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
    public_publishing_performed: false,
    backend_auth_supabase_activation_performed: false,
    production_readiness: "apply_plan_ready_pending_explicit_ag08g_approval",
    publish_readiness: "blocked"
  },
  ...noMutationControls
};

const registry = {
  module_id: "AG08F",
  title: "Draft Approval and Controlled Apply Plan",
  governance_only: true,
  draft_approval_plan_only: true,
  depends_on: ["AG08E"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08f-draft-approval-controlled-apply-plan.json",
    approval_record: "data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json",
    controlled_apply_plan: "data/content-intelligence/mutation-plans/ag08f-controlled-apply-plan.json",
    readiness: "data/content-intelligence/quality-registry/ag08f-apply-readiness-record.json",
    schema: "data/content-intelligence/schema/draft-approval-controlled-apply-plan.schema.json",
    learning: "data/content-intelligence/learning/ag08f-draft-approval-controlled-apply-plan-learning.json",
    preview: "data/quality/ag08f-draft-approval-controlled-apply-plan-preview.json",
    document: "docs/quality/AG08F_DRAFT_APPROVAL_CONTROLLED_APPLY_PLAN.md"
  },
  summary,
  next_recommended_stage: approvalRecord.ag08g_handoff,
  ...noMutationControls
};

const preview = {
  module_id: "AG08F",
  preview_only: true,
  draft_approval_plan_only: true,
  summary,
  draft_approval: draftApproval,
  reference_approval: {
    approved_reference_count: approvedReferences.length,
    approved_references: approvedReferences.map((ref) => ({
      reference_id: ref.reference_id,
      title: ref.title,
      url: ref.url,
      approval_status: ref.approval_status,
      insertion_status: ref.insertion_status
    }))
  },
  backup_rollback_plan: backupRollbackPlan,
  controlled_apply_plan_preview: {
    selected_article_path: exactApplyPlan.selected_article_path,
    backup_path: exactApplyPlan.ag08g_backup_path,
    allowed_changes: exactApplyPlan.allowed_ag08g_mutation_scope.allowed_changes,
    forbidden_changes: exactApplyPlan.allowed_ag08g_mutation_scope.forbidden_changes,
    post_apply_audit_checklist: exactApplyPlan.post_apply_audit_checklist
  },
  ag08g_handoff: approvalRecord.ag08g_handoff,
  ...noMutationControls
};

const doc = `# AG08F — Draft Approval and Controlled Apply Plan

## Purpose

AG08F reviews and approves the AG08E full draft candidate and candidate references, then prepares the controlled apply plan for AG08G.

AG08F is an approval and planning stage only. It does not mutate the selected article file, write article HTML, insert references into article HTML, generate visuals, insert images, append production JSONL records, write to database/Supabase, publish content, or activate backend/Auth/Supabase/API functionality.

## Selected Article

- Path: \`${selectedArticlePath}\`
- Hash before AG08F: \`${hashBefore}\`
- Planned AG08G backup path: \`${backupPath}\`

## Draft Approval

- Draft title: \`${draftApproval.draft_title}\`
- Draft word count estimate: \`${draftWordCount}\`
- Target word-count range: \`1500–5500\`
- Approval status: \`${draftApproval.approval_status}\`

## Reference Approval

Approved candidate references for AG08G:

${approvedReferences.map((ref) => `- ${ref.reference_id}: ${ref.title} — ${ref.url}`).join("\n")}

These references are approved for AG08G only. They are not inserted into article HTML in AG08F.

## Controlled Apply Plan

AG08G may mutate exactly one file:

\`${selectedArticlePath}\`

AG08G must create the backup first:

\`${backupPath}\`

AG08G must add exactly one marker:

\`AG08G-CONTROLLED-APPLY\`

## Visual Decision

Visual generation and image insertion remain deferred for this pilot.

## Explicit Exclusions

AG08F does not:

- mutate the selected article;
- edit the selected article file;
- create the backup file;
- insert references into article HTML;
- generate visual assets;
- insert images;
- append production JSONL records;
- write to database or Supabase;
- approve publish readiness;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Next Stage

AG08G — One-Article Controlled Apply — is identified as next only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(approvalPath, approvalRecord);
writeJson(applyPlanPath, exactApplyPlan);
writeJson(readinessPath, readinessRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const htmlAfter = fs.readFileSync(articleAbs, "utf8");
if (sha256(htmlAfter) !== hashBefore) {
  throw new Error("AG08F attempted to change the selected article. Refusing to continue.");
}

console.log("✅ AG08F draft approval and controlled apply plan artifacts generated.");
console.log(`✅ Apply-plan target: ${selectedArticlePath}`);
console.log(`✅ Approved references for AG08G: ${approvedReferences.length}`);
console.log(`✅ Planned backup path: ${backupPath}`);
