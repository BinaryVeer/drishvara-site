import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07nReview: "data/content-intelligence/quality-reviews/ag07n-production-packet-candidate.json",
  ag07nCandidate: "data/content-intelligence/content-packets/ag07n-production-packet-candidate.json",
  ag07nReadiness: "data/content-intelligence/quality-registry/ag07n-production-packet-candidate-readiness.json",
  ag07nSchema: "data/content-intelligence/schema/production-packet-candidate.schema.json",
  ag07nLearning: "data/content-intelligence/learning/ag07n-production-packet-candidate-learning.json",
  ag07mImprovedPacket: "data/content-intelligence/content-packets/ag07m-improved-preview-packet.json",
  ag07lScoring: "data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json",
  ag07kInferenceRecord: "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07o-approval-controlled-single-article-mutation-plan.json");
const mutationPlanPath = path.join(root, "data", "content-intelligence", "mutation-plans", "ag07o-controlled-single-article-mutation-plan.json");
const approvalPlanPath = path.join(root, "data", "content-intelligence", "approval-registry", "ag07o-approval-plan-record.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "approval-controlled-single-article-mutation-plan.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07o-approval-controlled-single-article-mutation-plan-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07o-approval-controlled-single-article-mutation-plan.json");
const previewPath = path.join(root, "data", "quality", "ag07o-approval-controlled-single-article-mutation-plan-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07O_APPROVAL_CONTROLLED_SINGLE_ARTICLE_MUTATION_PLAN.md");

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

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG07O input ${name}: ${relativePath}`);
  }
}

const ag07nReview = readJson(inputs.ag07nReview);
const ag07nCandidate = readJson(inputs.ag07nCandidate);
const ag07nReadiness = readJson(inputs.ag07nReadiness);
const ag07nSchema = readJson(inputs.ag07nSchema);
const ag07nLearning = readJson(inputs.ag07nLearning);
const ag07mImprovedPacket = readJson(inputs.ag07mImprovedPacket);
const ag07lScoring = readJson(inputs.ag07lScoring);
const ag07kInferenceRecord = readJson(inputs.ag07kInferenceRecord);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);
const ag06kStoreManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const candidateId = ag07nCandidate.candidate_id || "ag07n-production-packet-candidate";
const planId = `ag07o-controlled-mutation-plan:${candidateId}`;
const approvalPlanId = `ag07o-approval-plan:${candidateId}`;

const targetArticleRequirements = {
  one_article_only: true,
  multiple_article_apply_allowed: false,
  target_article_path: "",
  target_category: "",
  target_article_selection_status: "pending_required_before_ag07p",
  target_article_path_required_before_ag07p: true,
  target_article_must_exist_before_apply: true,
  target_article_backup_required_before_apply: true,
  target_article_path_population_allowed_in_ag07o: false,
  target_article_file_read_performed: false,
  target_article_file_write_performed: false,
  file_edit_performed: false
};

const approvalChecklist = [
  {
    checkpoint_id: "AG07O-APP-001",
    checkpoint_name: "single_article_scope_lock",
    purpose: "Confirm that only one static article may be selected for future apply.",
    status: "defined_pending_future_approval",
    passed_in_ag07o: false,
    required_before_ag07p: true
  },
  {
    checkpoint_id: "AG07O-APP-002",
    checkpoint_name: "target_article_path_confirmation",
    purpose: "Confirm exact target article path before any future apply.",
    status: "defined_pending_future_approval",
    passed_in_ag07o: false,
    required_before_ag07p: true
  },
  {
    checkpoint_id: "AG07O-APP-003",
    checkpoint_name: "reference_candidate_approval",
    purpose: "Confirm two verified reference URLs and insertion positions before future apply.",
    status: "defined_pending_future_approval",
    passed_in_ag07o: false,
    required_before_ag07p: true
  },
  {
    checkpoint_id: "AG07O-APP-004",
    checkpoint_name: "visual_image_credit_approval",
    purpose: "Confirm visual/image, alt text, caption and credit before future apply.",
    status: "defined_pending_future_approval",
    passed_in_ag07o: false,
    required_before_ag07p: true
  },
  {
    checkpoint_id: "AG07O-APP-005",
    checkpoint_name: "backup_and_rollback_approval",
    purpose: "Confirm backup and rollback plan before future apply.",
    status: "defined_pending_future_approval",
    passed_in_ag07o: false,
    required_before_ag07p: true
  },
  {
    checkpoint_id: "AG07O-APP-006",
    checkpoint_name: "post_apply_audit_approval",
    purpose: "Confirm post-apply audit checklist before future apply.",
    status: "defined_pending_future_approval",
    passed_in_ag07o: false,
    required_before_ag07p: true
  },
  {
    checkpoint_id: "AG07O-APP-007",
    checkpoint_name: "human_explicit_apply_approval",
    purpose: "Require explicit user approval before AG07P can perform one-article apply.",
    status: "defined_pending_future_approval",
    passed_in_ag07o: false,
    required_before_ag07p: true
  }
];

const referenceInsertionPlan = {
  plan_only: true,
  reference_standard_source: "AG06J",
  minimum_reference_required: ag07nCandidate.reference_candidate_plan?.minimum_reference_required || 2,
  candidate_reference_slots_available: ag07nCandidate.reference_candidate_plan?.candidate_reference_slots_available || 0,
  source_quality_standard_present: Boolean(ag06jReferenceStandard),
  approved_reference_urls: [],
  candidate_reference_urls: [],
  rejected_reference_urls: [],
  reference_url_population_allowed_in_ag07o: false,
  reference_url_population_performed: false,
  approved_reference_url_population_performed: false,
  reference_insertion_allowed_in_ag07o: false,
  reference_insertion_performed: false,
  required_before_ag07p: [
    "two_approved_reference_urls",
    "source_credibility_status",
    "link_health_status",
    "reference_block_insertion_point",
    "rollback_safe_reference_block"
  ],
  insertion_plan_status: "defined_pending_reference_population_and_approval"
};

const visualImageCreditPlan = {
  plan_only: true,
  hero_visual_required: true,
  structured_visual_or_data_unit_recommended: true,
  image_credit_block_required: true,
  alt_text_required: true,
  caption_required: true,
  candidate_visual_asset_path: "",
  candidate_visual_asset_url: "",
  candidate_image_credit: "",
  candidate_alt_text: "",
  candidate_caption: "",
  visual_generation_allowed_in_ag07o: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_allowed_in_ag07o: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
  caption_alt_credit_population_performed: false,
  required_before_ag07p: [
    "approved_visual_or_confirmed_no_new_visual",
    "alt_text",
    "caption",
    "image_credit_or_attribution",
    "mobile_safe_visual_layout"
  ],
  visual_plan_status: "defined_pending_asset_selection_and_credit_population"
};

const backupRollbackPlan = {
  plan_only: true,
  backup_required_before_apply: true,
  backup_file_path_pattern: "archive/ag07p-backups/<article-slug>-before-ag07p.html",
  backup_file_created_in_ag07o: false,
  rollback_plan_required: true,
  rollback_method: "restore_article_from_pre_apply_backup",
  rollback_trigger_conditions: [
    "article_layout_break",
    "reference_block_invalid",
    "visual_or_credit_invalid",
    "mobile_rendering_failure",
    "post_apply_validation_failure"
  ],
  rollback_test_performed: false,
  file_copy_performed: false,
  file_move_performed: false,
  file_delete_performed: false,
  file_write_performed: false,
  rollback_plan_status: "defined_pending_backup_creation_in_ag07p"
};

const staticLiveMutationChecklist = [
  {
    item_id: "AG07O-MUT-001",
    item_name: "confirm_target_article_path",
    required_before_ag07p: true,
    passed_in_ag07o: false,
    apply_performed_in_ag07o: false
  },
  {
    item_id: "AG07O-MUT-002",
    item_name: "create_pre_apply_backup",
    required_before_ag07p: true,
    passed_in_ag07o: false,
    apply_performed_in_ag07o: false
  },
  {
    item_id: "AG07O-MUT-003",
    item_name: "replace_or_insert_article_body_from_approved_packet",
    required_before_ag07p: true,
    passed_in_ag07o: false,
    apply_performed_in_ag07o: false
  },
  {
    item_id: "AG07O-MUT-004",
    item_name: "insert_approved_reference_block",
    required_before_ag07p: true,
    passed_in_ag07o: false,
    apply_performed_in_ag07o: false
  },
  {
    item_id: "AG07O-MUT-005",
    item_name: "insert_or_confirm_visual_image_credit_block",
    required_before_ag07p: true,
    passed_in_ag07o: false,
    apply_performed_in_ag07o: false
  },
  {
    item_id: "AG07O-MUT-006",
    item_name: "update_metadata_if_approved",
    required_before_ag07p: true,
    passed_in_ag07o: false,
    apply_performed_in_ag07o: false
  },
  {
    item_id: "AG07O-MUT-007",
    item_name: "run_post_apply_validation",
    required_before_ag07q: true,
    passed_in_ag07o: false,
    apply_performed_in_ag07o: false
  }
];

const postApplyAuditChecklist = [
  {
    audit_id: "AG07O-AUD-001",
    audit_name: "article_file_exists_and_loads",
    required_after_ag07p: true,
    completed_in_ag07o: false
  },
  {
    audit_id: "AG07O-AUD-002",
    audit_name: "reference_block_has_two_approved_links",
    required_after_ag07p: true,
    completed_in_ag07o: false
  },
  {
    audit_id: "AG07O-AUD-003",
    audit_name: "image_credit_alt_caption_present",
    required_after_ag07p: true,
    completed_in_ag07o: false
  },
  {
    audit_id: "AG07O-AUD-004",
    audit_name: "mobile_layout_safe",
    required_after_ag07p: true,
    completed_in_ag07o: false
  },
  {
    audit_id: "AG07O-AUD-005",
    audit_name: "no_unapproved_backend_auth_supabase_activation",
    required_after_ag07p: true,
    completed_in_ag07o: false
  },
  {
    audit_id: "AG07O-AUD-006",
    audit_name: "rollback_possible_from_backup",
    required_after_ag07p: true,
    completed_in_ag07o: false
  }
];

const ag07pHandoff = {
  next_stage_id: "AG07P",
  next_stage_title: "One-Article Controlled Apply",
  explicit_approval_required: true,
  ag07p_allowed_scope_if_approved_later: "apply one approved candidate to one selected static article only",
  ag07p_preconditions: [
    "target_article_path_populated",
    "human_apply_approval_recorded",
    "pre_apply_backup_created",
    "two_approved_references_available",
    "visual_or_no-new-visual_decision_available",
    "image_credit_alt_caption_ready",
    "rollback_plan_ready",
    "post_apply_audit_checklist_ready"
  ],
  ag07p_still_blocked_without_explicit_approval: true
};

const noMutationControls = {
  approval_controlled_single_article_mutation_plan_only: true,
  approval_plan_created: true,
  mutation_plan_created: true,
  target_article_requirements_created: true,
  reference_insertion_plan_created: true,
  visual_image_credit_plan_created: true,
  backup_rollback_plan_created: true,
  static_live_mutation_checklist_created: true,
  post_apply_audit_checklist_created: true,
  ag07p_handoff_created: true,
  publish_ready_approval_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  human_apply_approval_performed: false,
  actual_public_mutation_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  static_live_apply_performed: false,
  static_live_mutation_performed: false,
  file_edit_performed: false,
  file_write_performed: false,
  article_file_write_performed: false,
  backup_file_created: false,
  rollback_execution_performed: false,
  production_jsonl_append_performed: false,
  jsonl_append_performed: false,
  jsonl_production_record_created: false,
  database_write_performed: false,
  supabase_write_performed: false,
  supabase_enabled: false,
  auth_enabled: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  approved_reference_url_population_performed: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
  caption_alt_credit_population_performed: false,
  production_packet_created: false,
  actual_production_packet_created: false,
  production_content_generated: false,
  article_prose_generated: false,
  narrative_text_generated: false,
  dry_run_score_recalculation_performed: false,
  actual_score_calculation_performed: false,
  production_score_record_created: false,
  scaffold_import_performed: false,
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false,
  backend_activation_performed: false,
  api_route_created: false,
  public_publishing_performed: false,
  publication_approval_granted: false
};

const controlledMutationPlan = {
  module_id: "AG07O",
  plan_id: planId,
  title: "Controlled Single-Article Mutation Plan",
  status: "controlled_single_article_mutation_plan_created",
  plan_only: true,
  candidate_id: candidateId,
  generated_from: inputs,
  source_candidate_snapshot: {
    candidate_id: candidateId,
    status: ag07nCandidate.status,
    candidate_only: ag07nCandidate.candidate_only,
    production_packet: ag07nCandidate.production_packet,
    publish_ready: ag07nCandidate.publish_ready,
    publication_allowed: ag07nCandidate.publication_allowed
  },
  target_article_requirements: targetArticleRequirements,
  reference_insertion_plan: referenceInsertionPlan,
  visual_image_credit_plan: visualImageCreditPlan,
  backup_rollback_plan: backupRollbackPlan,
  static_live_mutation_checklist: staticLiveMutationChecklist,
  post_apply_audit_checklist: postApplyAuditChecklist,
  ag07p_handoff: ag07pHandoff,
  mutation_plan_readiness: {
    plan_created: true,
    ready_for_ag07p_apply: false,
    reason: "Plan is defined, but target article path, human apply approval, reference URLs, visual/credit fields and backup creation remain pending."
  },
  ...noMutationControls
};

const approvalPlanRecord = {
  module_id: "AG07O",
  approval_plan_id: approvalPlanId,
  title: "Approval Plan Record",
  status: "approval_plan_created",
  plan_only: true,
  candidate_id: candidateId,
  approval_checklist: approvalChecklist,
  approval_state: {
    publish_ready_approval_status: "not_requested",
    human_apply_approval_status: "not_requested",
    approval_state_changed: false,
    publish_ready_set: false,
    approval_recorded_in_ag07o: false
  },
  approval_readiness: {
    checklist_created: true,
    ready_for_ag07p_apply_approval: false,
    reason: "Checklist is defined only; no human apply approval, publish-ready approval or approval-state transition is performed in AG07O."
  },
  ...noMutationControls
};

const summary = {
  ag07n_candidate_consumed: ag07nReview.status === "production_packet_candidate_created",
  ag07n_candidate_id: candidateId,
  approval_plan_created: true,
  mutation_plan_created: true,
  target_article_requirements_created: true,
  reference_insertion_plan_created: true,
  visual_image_credit_plan_created: true,
  backup_rollback_plan_created: true,
  static_live_mutation_checklist_created: true,
  post_apply_audit_checklist_created: true,
  approval_checklist_count: approvalChecklist.length,
  mutation_checklist_count: staticLiveMutationChecklist.length,
  audit_checklist_count: postApplyAuditChecklist.length,
  ag07p_handoff_created: true,
  publish_ready_approval_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  human_apply_approval_performed: false,
  actual_public_mutation_performed: false,
  file_edit_performed: false,
  article_file_write_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  visual_generation_performed: false,
  static_live_apply_performed: false,
  static_live_mutation_performed: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
  public_publishing_performed: false,
  backend_auth_supabase_activation_performed: false,
  production_readiness_after_ag07o: "plan_created_not_apply_ready",
  publish_readiness_after_ag07o: "blocked",
  next_stage_id: "AG07P",
  next_stage_title: "One-Article Controlled Apply"
};

const schema = {
  schema_id: "drishvara/ag07o/approval-controlled-single-article-mutation-plan.schema.json",
  module_id: "AG07O",
  title: "Approval + Controlled Single-Article Mutation Plan Schema",
  status: "schema_plan_only",
  description: "Schema for approval checklist and controlled single-article mutation plan. AG07O defines the plan only and does not apply mutations or perform writes.",
  required_top_level_fields: [
    "approval_plan_record",
    "controlled_mutation_plan",
    "summary",
    "mutation_controls"
  ],
  approval_plan_creation_allowed_in_ag07o: true,
  mutation_plan_creation_allowed_in_ag07o: true,
  target_article_requirements_creation_allowed_in_ag07o: true,
  reference_insertion_plan_creation_allowed_in_ag07o: true,
  visual_image_credit_plan_creation_allowed_in_ag07o: true,
  backup_rollback_plan_creation_allowed_in_ag07o: true,
  static_live_mutation_checklist_creation_allowed_in_ag07o: true,
  post_apply_audit_checklist_creation_allowed_in_ag07o: true,
  ag07p_handoff_creation_allowed_in_ag07o: true,
  human_apply_approval_allowed_in_ag07o: false,
  publish_ready_approval_allowed_in_ag07o: false,
  approval_state_change_allowed_in_ag07o: false,
  actual_public_mutation_allowed_in_ag07o: false,
  file_edit_allowed_in_ag07o: false,
  article_file_write_allowed_in_ag07o: false,
  backup_file_creation_allowed_in_ag07o: false,
  static_live_apply_allowed_in_ag07o: false,
  reference_url_population_allowed_in_ag07o: false,
  reference_insertion_allowed_in_ag07o: false,
  visual_generation_allowed_in_ag07o: false,
  image_insertion_allowed_in_ag07o: false,
  production_jsonl_append_allowed_in_ag07o: false,
  database_write_allowed_in_ag07o: false,
  supabase_write_allowed_in_ag07o: false,
  publishing_allowed_in_ag07o: false,
  backend_auth_supabase_allowed_in_ag07o: false,
  ...noMutationControls
};

const learning = {
  module_id: "AG07O",
  title: "Approval + Controlled Single-Article Mutation Plan Learning",
  status: "learning_record_only",
  approval_controlled_single_article_mutation_plan_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07n: asArray(ag07nLearning.ag07n_learning_points),
  ag07o_learning_points: [
    "A controlled mutation plan can be prepared without editing any public article file.",
    "Single-article scope, backup, rollback and post-apply audit must be defined before any apply stage.",
    "Approval checklist creation is not approval-state change.",
    "Reference insertion and visual/image-credit plans must remain inactive until a future apply stage is explicitly approved.",
    "AG07P must require explicit approval and a concrete target article path before any file write."
  ],
  carried_forward_doctrine: [
    "Plan is not apply.",
    "Approval checklist is not publish-ready approval.",
    "No file edit may occur in AG07O.",
    "No reference URL population or insertion may occur in AG07O.",
    "No visual generation, static-live mutation, JSONL/database/Supabase write or publishing may occur in AG07O."
  ],
  compressed_path_after_ag07o: [
    "AG07P — One-Article Controlled Apply",
    "AG07Q — Post-Mutation Audit",
    "AG07Z — Closure / Repeatable Production Readiness"
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG07O",
  title: "Approval + Controlled Single-Article Mutation Plan",
  status: "approval_controlled_single_article_mutation_plan_created",
  governance_only: true,
  approval_controlled_single_article_mutation_plan_only: true,
  depends_on: ["AG07N", "AG07M", "AG07L", "AG07K", "AG06J", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07n: {
    ag07n_status: ag07nReview.status,
    ag07n_decision: ag07nReview.closure_decision?.decision,
    ag07o_requires_explicit_approval: ag07nReview.closure_decision?.proceed_to_ag07o_only_with_explicit_user_approval,
    production_packet_candidate_record_created: ag07nReview.closure_decision?.production_packet_candidate_record_created,
    actual_production_packet_created_in_ag07n: ag07nReview.closure_decision?.actual_production_packet_created,
    public_article_mutation_performed_in_ag07n: ag07nReview.closure_decision?.public_article_mutation_performed,
    reference_url_population_performed_in_ag07n: ag07nReview.closure_decision?.reference_url_population_performed,
    visual_generation_performed_in_ag07n: ag07nReview.closure_decision?.visual_generation_performed,
    static_live_mutation_performed_in_ag07n: ag07nReview.closure_decision?.static_live_mutation_performed
  },
  mutation_plan_file: "data/content-intelligence/mutation-plans/ag07o-controlled-single-article-mutation-plan.json",
  approval_plan_file: "data/content-intelligence/approval-registry/ag07o-approval-plan-record.json",
  schema_file: "data/content-intelligence/schema/approval-controlled-single-article-mutation-plan.schema.json",
  learning_file: "data/content-intelligence/learning/ag07o-approval-controlled-single-article-mutation-plan-learning.json",
  foundation_alignment: {
    ag06j_reference_standard_consumed: true,
    jsonl_store_count: asArray(ag06kStoreManifest.stores).length,
    approval_register_count: asArray(ag06lApprovalRegister.approval_queue_entries).length,
    ag07n_blocking_items_carried_forward: asArray(ag07nReadiness.blocking_items_before_ag07p_apply)
  },
  closure_decision: {
    decision: "ag07o_approval_controlled_single_article_mutation_plan_closed",
    proceed_to_ag07p_only_with_explicit_user_approval: true,
    approval_plan_created: true,
    mutation_plan_created: true,
    target_article_requirements_created: true,
    reference_insertion_plan_created: true,
    visual_image_credit_plan_created: true,
    backup_rollback_plan_created: true,
    static_live_mutation_checklist_created: true,
    post_apply_audit_checklist_created: true,
    ag07p_handoff_created: true,
    publish_ready_approval_performed: false,
    approval_state_changed: false,
    publish_ready_set: false,
    human_apply_approval_performed: false,
    actual_public_mutation_performed: false,
    file_edit_performed: false,
    article_file_write_performed: false,
    reference_insertion_performed: false,
    reference_url_population_performed: false,
    visual_generation_performed: false,
    static_live_apply_performed: false,
    static_live_mutation_performed: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
    public_publishing_performed: false,
    backend_auth_supabase_activation_performed: false,
    production_readiness: "plan_created_not_apply_ready",
    publish_readiness: "blocked",
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    visual_generation_allowed: false,
    jsonl_production_append_allowed: false,
    database_write_allowed: false,
    supabase_write_allowed: false,
    publishing_allowed: false,
    backend_auth_supabase_allowed: false
  },
  ...noMutationControls
};

const registry = {
  module_id: "AG07O",
  title: "Approval + Controlled Single-Article Mutation Plan",
  governance_only: true,
  approval_controlled_single_article_mutation_plan_only: true,
  depends_on: ["AG07N"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07o-approval-controlled-single-article-mutation-plan.json",
    mutation_plan: "data/content-intelligence/mutation-plans/ag07o-controlled-single-article-mutation-plan.json",
    approval_plan: "data/content-intelligence/approval-registry/ag07o-approval-plan-record.json",
    schema: "data/content-intelligence/schema/approval-controlled-single-article-mutation-plan.schema.json",
    learning: "data/content-intelligence/learning/ag07o-approval-controlled-single-article-mutation-plan-learning.json",
    preview: "data/quality/ag07o-approval-controlled-single-article-mutation-plan-preview.json",
    document: "docs/quality/AG07O_APPROVAL_CONTROLLED_SINGLE_ARTICLE_MUTATION_PLAN.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07P",
    title: "One-Article Controlled Apply",
    allowed_scope: "apply one approved candidate to one selected static article only with explicit approval",
    blocked_until_approval: true
  },
  ...noMutationControls
};

const preview = {
  module_id: "AG07O",
  preview_only: true,
  approval_controlled_single_article_mutation_plan_only: true,
  summary,
  mutation_plan_snapshot: {
    plan_id: controlledMutationPlan.plan_id,
    status: controlledMutationPlan.status,
    plan_only: controlledMutationPlan.plan_only,
    target_article_selection_status: controlledMutationPlan.target_article_requirements.target_article_selection_status,
    ready_for_ag07p_apply: controlledMutationPlan.mutation_plan_readiness.ready_for_ag07p_apply
  },
  approval_plan_snapshot: {
    approval_plan_id: approvalPlanRecord.approval_plan_id,
    status: approvalPlanRecord.status,
    approval_checklist_count: approvalPlanRecord.approval_checklist.length,
    human_apply_approval_status: approvalPlanRecord.approval_state.human_apply_approval_status,
    publish_ready_approval_status: approvalPlanRecord.approval_state.publish_ready_approval_status
  },
  next_stage_id: "AG07P",
  next_stage_title: "One-Article Controlled Apply",
  ...noMutationControls
};

const doc = `# AG07O — Approval + Controlled Single-Article Mutation Plan

## Purpose

AG07O creates the approval checklist and controlled single-article mutation plan required before any future one-article apply.

This stage is plan-only. It does not perform actual public mutation, file edits, reference insertion, visual generation, static-live apply, production JSONL append, database/Supabase write, publishing, or backend/Auth/Supabase activation.

## Inputs

AG07O consumes:

- AG07N Production Packet Candidate.
- AG07M Improvement Pass.
- AG07L Revised Preview Packet + Dry-Run Scoring.
- AG07K Article Inference Preview Record Dry Run.
- AG06J reference/source credibility standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Plan Scope

AG07O creates:

- target article path requirements;
- approval checklist;
- reference insertion plan;
- visual/image-credit plan;
- backup and rollback plan;
- static-live mutation checklist;
- post-apply audit checklist;
- AG07P handoff.

## Approval Status

AG07O creates an approval plan but does not approve publishing or applying.

No publish-ready approval is performed.

No approval-state change is performed.

No human apply approval is recorded.

## Static-Live Status

AG07O does not edit static files.

AG07O does not select or mutate a live article.

AG07O does not insert references.

AG07O does not generate or insert visuals.

AG07O does not create backup files.

AG07O does not run rollback.

## Production Readiness Decision

AG07O does not make the packet production-ready.

Production readiness becomes plan_created_not_apply_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07O does not:

- perform actual public mutation;
- edit files;
- write article HTML;
- create backup files;
- execute rollback;
- insert references;
- populate reference URLs;
- generate visual assets or infographics;
- insert images;
- perform static-live apply;
- append production JSONL records;
- write to database or Supabase;
- approve publish-readiness;
- change approval state;
- set publish_ready=true;
- generate article prose;
- generate production content;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07O is acceptable only if:

- AG07N candidate is consumed;
- approval checklist is created;
- target article requirements are created;
- reference insertion plan is created;
- visual/image-credit plan is created;
- backup/rollback plan is created;
- static-live mutation checklist is created;
- post-apply audit checklist is created;
- AG07P handoff is created;
- no actual mutation or file edit is performed;
- no reference insertion or URL population is performed;
- no visual generation is performed;
- no static-live apply is performed;
- no production JSONL append, database/Supabase write, publishing or backend/Auth/Supabase activation is performed;
- AG07P One-Article Controlled Apply is identified as next only with explicit approval;
- package scripts for generate:ag07o and validate:ag07o are present;
- validate:project includes validate:ag07o.

## Next Stage

The next possible stage is AG07P — One-Article Controlled Apply.

AG07P must not start automatically. It requires explicit approval and a selected target article path.
`;

writeJson(reviewPath, review);
writeJson(mutationPlanPath, controlledMutationPlan);
writeJson(approvalPlanPath, approvalPlanRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07O approval and controlled single-article mutation plan artifacts generated.");
