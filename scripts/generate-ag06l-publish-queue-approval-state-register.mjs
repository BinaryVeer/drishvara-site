import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag06hR1Review: "data/content-intelligence/quality-reviews/content-intelligence-foundation-alignment-review.json",
  ag06eStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06fUpgradeQueue: "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  ag06gDryRunReview: "data/content-intelligence/quality-reviews/long-form-content-packet-upgrade-dry-run-review.json",
  ag06hBatchPlanning: "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
  ag06iClosure: "data/content-intelligence/quality-reviews/visual-data-infographic-requirement-schema-closure.json",
  ag06jClosure: "data/content-intelligence/quality-reviews/reference-source-credibility-schema-closure.json",
  ag06kGovernance: "data/content-intelligence/quality-reviews/jsonl-first-content-intelligence-store-governance.json",
  ag06kStoreStandard: "data/content-intelligence/learning/jsonl-first-content-intelligence-store-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json"
};

const registryPath = path.join(root, "data", "quality", "ag06l-publish-queue-approval-state-register.json");
const previewPath = path.join(root, "data", "quality", "ag06l-publish-queue-approval-state-register-preview.json");
const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "publish-queue-approval-state-register.json");
const registerPath = path.join(root, "data", "content-intelligence", "publish-queue", "publish-queue-approval-state-register.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "publish-queue-approval-state.schema.json");
const docPath = path.join(root, "docs", "quality", "AG06L_PUBLISH_QUEUE_APPROVAL_STATE_REGISTER.md");

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

const falseGuards = {
  mutation_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
  reference_url_change_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  verified_reference_population_performed: false,
  candidate_reference_population_performed: false,
  external_fetch_performed_by_script: false,
  live_url_fetch_performed: false,
  link_health_fetch_performed: false,
  backend_activation_performed: false,
  api_route_created: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  frontend_deployment_performed: false,
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false,
  scaffold_import_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,
  public_article_archive_performed: false,
  public_article_delete_performed: false,
  public_publishing_performed: false,
  content_packet_generation_performed: false,
  content_packet_created: false,
  article_rewrite_performed: false,
  visual_asset_generation_performed: false,
  infographic_generation_performed: false,
  quality_scoring_performed: false,
  visitor_value_scoring_performed: false,
  jsonl_file_created: false,
  jsonl_production_record_created: false,
  jsonl_append_performed: false,
  jsonl_import_performed: false,
  database_write_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  publish_queue_transition_performed: false,
  publication_approval_granted: false
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG06L input ${name}: ${relativePath}`);
  }
}

const ag06hR1 = readJson(inputs.ag06hR1Review);
const ag06e = readJson(inputs.ag06eStandard);
const ag06f = readJson(inputs.ag06fUpgradeQueue);
const ag06g = readJson(inputs.ag06gDryRunReview);
const ag06h = readJson(inputs.ag06hBatchPlanning);
const ag06i = readJson(inputs.ag06iClosure);
const ag06j = readJson(inputs.ag06jClosure);
const ag06k = readJson(inputs.ag06kGovernance);
const ag06kStandard = readJson(inputs.ag06kStoreStandard);
const ag06kManifest = readJson(inputs.ag06kStoreManifest);

const queueEntries = asArray(
  ag06f.article_upgrade_queue ||
  ag06f.queue_entries ||
  ag06f.entries ||
  ag06f.long_form_upgrade_queue ||
  ag06f.upgrade_queue ||
  ag06f.items
);

if (queueEntries.length < 1) {
  throw new Error("AG06F queue entries could not be found. Expected queue_entries or equivalent array.");
}

const stateModel = [
  {
    state_id: "queued_for_upgrade_review",
    label: "Queued for Upgrade Review",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "content_packet_planning_only",
    label: "Content Packet Planning Only",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "content_packet_generation_awaiting_explicit_approval",
    label: "Content Packet Generation Awaiting Explicit Approval",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "content_packet_drafted_in_future_stage",
    label: "Content Packet Drafted in Future Stage",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "reference_review_pending",
    label: "Reference Review Pending",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "visual_review_pending",
    label: "Visual Review Pending",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "quality_review_pending",
    label: "Quality Review Pending",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "visitor_value_review_pending",
    label: "Visitor-Value Review Pending",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "editorial_review_pending",
    label: "Editorial Review Pending",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "approval_required",
    label: "Approval Required",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "approved_for_publish_readiness_review",
    label: "Approved for Publish-Readiness Review",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "publish_ready_locked_in_future_stage",
    label: "Publish Ready Locked in Future Stage",
    publish_ready: true,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "published_in_later_approved_stage",
    label: "Published in Later Approved Stage",
    publish_ready: true,
    terminal: true,
    public_mutation_allowed: "separate_public_upgrade_patch_required"
  },
  {
    state_id: "revision_required",
    label: "Revision Required",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "rejected",
    label: "Rejected",
    publish_ready: false,
    terminal: true,
    public_mutation_allowed: false
  },
  {
    state_id: "paused",
    label: "Paused",
    publish_ready: false,
    terminal: false,
    public_mutation_allowed: false
  },
  {
    state_id: "archived_by_explicit_approval_only",
    label: "Archived by Explicit Approval Only",
    publish_ready: false,
    terminal: true,
    public_mutation_allowed: false
  }
];

const approvalCheckpoints = [
  {
    checkpoint_id: "content_packet_generation_permission",
    label: "Content Packet Generation Permission",
    required_before_state: "content_packet_drafted_in_future_stage",
    approval_required: true,
    current_status: "blocked_pending_explicit_approval"
  },
  {
    checkpoint_id: "reference_approval",
    label: "Reference Approval",
    required_before_state: "approved_for_publish_readiness_review",
    approval_required: true,
    current_status: "pending_future_review"
  },
  {
    checkpoint_id: "visual_data_approval",
    label: "Visual / Data Approval",
    required_before_state: "approved_for_publish_readiness_review",
    approval_required: true,
    current_status: "pending_future_review"
  },
  {
    checkpoint_id: "quality_score_approval",
    label: "Quality Score Approval",
    required_before_state: "approved_for_publish_readiness_review",
    approval_required: true,
    current_status: "pending_future_review"
  },
  {
    checkpoint_id: "visitor_value_score_approval",
    label: "Visitor-Value Score Approval",
    required_before_state: "approved_for_publish_readiness_review",
    approval_required: true,
    current_status: "pending_future_review"
  },
  {
    checkpoint_id: "editorial_approval",
    label: "Editorial Approval",
    required_before_state: "publish_ready_locked_in_future_stage",
    approval_required: true,
    current_status: "pending_future_review"
  },
  {
    checkpoint_id: "final_publish_approval",
    label: "Final Publish Approval",
    required_before_state: "published_in_later_approved_stage",
    approval_required: true,
    current_status: "blocked_pending_explicit_approval"
  }
];

const approvalRoles = [
  {
    role_id: "content_operator",
    label: "Content Operator",
    role_type: "future_process_role_not_auth_role",
    can_approve_publication: false
  },
  {
    role_id: "reference_reviewer",
    label: "Reference Reviewer",
    role_type: "future_process_role_not_auth_role",
    can_approve_publication: false
  },
  {
    role_id: "visual_reviewer",
    label: "Visual Reviewer",
    role_type: "future_process_role_not_auth_role",
    can_approve_publication: false
  },
  {
    role_id: "quality_reviewer",
    label: "Quality Reviewer",
    role_type: "future_process_role_not_auth_role",
    can_approve_publication: false
  },
  {
    role_id: "editorial_reviewer",
    label: "Editorial Reviewer",
    role_type: "future_process_role_not_auth_role",
    can_approve_publication: false
  },
  {
    role_id: "founder_or_authorized_publisher",
    label: "Founder / Authorized Publisher",
    role_type: "future_process_role_not_auth_role",
    can_approve_publication: "only_in_later_stage_with_explicit_approval"
  }
];

const transitionRules = [
  {
    from_state: "queued_for_upgrade_review",
    to_state: "content_packet_planning_only",
    allowed_in_ag06l: false,
    future_gate_required: "AG06H planning already records planning-only status"
  },
  {
    from_state: "content_packet_planning_only",
    to_state: "content_packet_generation_awaiting_explicit_approval",
    allowed_in_ag06l: false,
    future_gate_required: "AG07 or separately approved content packet generation stage"
  },
  {
    from_state: "content_packet_generation_awaiting_explicit_approval",
    to_state: "content_packet_drafted_in_future_stage",
    allowed_in_ag06l: false,
    future_gate_required: "explicit user approval plus generator safeguards"
  },
  {
    from_state: "content_packet_drafted_in_future_stage",
    to_state: "reference_review_pending",
    allowed_in_ag06l: false,
    future_gate_required: "reference candidate records and review workflow"
  },
  {
    from_state: "reference_review_pending",
    to_state: "visual_review_pending",
    allowed_in_ag06l: false,
    future_gate_required: "approved reference minimum and rejected-source trail"
  },
  {
    from_state: "visual_review_pending",
    to_state: "quality_review_pending",
    allowed_in_ag06l: false,
    future_gate_required: "visual/data requirements and rights-credit readiness"
  },
  {
    from_state: "quality_review_pending",
    to_state: "visitor_value_review_pending",
    allowed_in_ag06l: false,
    future_gate_required: "quality score threshold"
  },
  {
    from_state: "visitor_value_review_pending",
    to_state: "editorial_review_pending",
    allowed_in_ag06l: false,
    future_gate_required: "visitor-value score threshold"
  },
  {
    from_state: "editorial_review_pending",
    to_state: "approved_for_publish_readiness_review",
    allowed_in_ag06l: false,
    future_gate_required: "editorial approval"
  },
  {
    from_state: "approved_for_publish_readiness_review",
    to_state: "publish_ready_locked_in_future_stage",
    allowed_in_ag06l: false,
    future_gate_required: "all publish-readiness gates pass"
  },
  {
    from_state: "publish_ready_locked_in_future_stage",
    to_state: "published_in_later_approved_stage",
    allowed_in_ag06l: false,
    future_gate_required: "separate approved public upgrade/publish patch"
  }
];

const publishReadinessGateGroups = [
  {
    group_id: "long_form_content_standard",
    source_stage: "AG06E",
    gates: [
      "word_count_1500_2200",
      "article_structure_complete",
      "reader_value_promise_present",
      "quality_score_threshold_met",
      "visitor_value_score_threshold_met"
    ]
  },
  {
    group_id: "reference_source_credibility",
    source_stage: "AG06J",
    gates: [
      "minimum_approved_reference_count_met",
      "source_type_recorded_for_each_reference",
      "credibility_tier_recorded_for_each_reference",
      "link_health_review_pending_or_passed",
      "approved_and_rejected_source_trail_recorded"
    ]
  },
  {
    group_id: "visual_data_infographic",
    source_stage: "AG06I",
    gates: [
      "primary_hero_visual_planned",
      "primary_hero_visual_credit_or_attribution_planned",
      "primary_hero_visual_alt_text_planned",
      "at_least_one_structured_visual_or_data_unit_planned",
      "mobile_safe_layout_expectation_recorded"
    ]
  },
  {
    group_id: "jsonl_store_auditability",
    source_stage: "AG06K",
    gates: [
      "stable_record_id_required",
      "schema_version_required",
      "source_trace_required",
      "mutation_controls_required",
      "audit_trace_required"
    ]
  },
  {
    group_id: "public_mutation_and_publish_control",
    source_stage: "AG06L",
    gates: [
      "no_public_article_mutation_in_ag06l",
      "no_reference_insertion_in_ag06l",
      "no_content_packet_generation_in_ag06l",
      "no_jsonl_append_in_ag06l",
      "no_publishing_in_ag06l",
      "no_backend_auth_supabase_activation_in_ag06l"
    ]
  }
];

function makeApprovalQueueEntry(entry, index) {
  return {
    approval_queue_id: `ag06l_publish_approval_${String(index + 1).padStart(3, "0")}`,
    source_queue_id: entry.queue_id || entry.source_queue_id || `ag06f_public_upgrade_${String(index + 1).padStart(3, "0")}`,
    source_article_path: entry.source_article_path,
    category: entry.category,
    detected_title: entry.detected_title,
    source_word_count_estimate: entry.source_word_count_estimate,
    upgrade_priority: entry.upgrade_priority,
    current_state: "queued_for_upgrade_review",
    approval_state: "not_approved",
    publish_ready: false,
    publication_allowed: false,
    article_mutation_allowed: false,
    reference_insertion_allowed: false,
    content_packet_generation_allowed: false,
    jsonl_append_allowed: false,
    required_approval_checkpoints: approvalCheckpoints.map((checkpoint) => ({
      checkpoint_id: checkpoint.checkpoint_id,
      required: true,
      current_status: checkpoint.current_status,
      passed: false,
      approval_record_created: false
    })),
    required_gate_groups: publishReadinessGateGroups.map((group) => ({
      group_id: group.group_id,
      source_stage: group.source_stage,
      gate_count: group.gates.length,
      current_status: "not_evaluated_in_ag06l",
      passed: false
    })),
    allowed_next_state_in_ag06l: null,
    blocked_transitions_in_ag06l: transitionRules.map((rule) => ({
      from_state: rule.from_state,
      to_state: rule.to_state,
      allowed_in_ag06l: rule.allowed_in_ag06l,
      future_gate_required: rule.future_gate_required
    })),
    mutation_controls: {
      public_article_mutation_performed: false,
      reference_insertion_performed: false,
      content_packet_generation_performed: false,
      jsonl_append_performed: false,
      scaffold_import_performed: false,
      public_publishing_performed: false,
      backend_activation_performed: false,
      supabase_enabled: false,
      auth_enabled: false
    },
    notes: "AG06L creates approval-state governance only. It does not change state, generate packets, insert references, mutate articles, append JSONL records, or publish."
  };
}

const approvalQueueEntries = queueEntries.map(makeApprovalQueueEntry);

const summary = {
  source_queue_entry_count_from_ag06f: ag06f.summary?.queue_entry_count ?? queueEntries.length,
  approval_queue_entry_count: approvalQueueEntries.length,
  state_count: stateModel.length,
  approval_checkpoint_count: approvalCheckpoints.length,
  approval_role_count: approvalRoles.length,
  transition_rule_count: transitionRules.length,
  publish_readiness_gate_group_count: publishReadinessGateGroups.length,
  queue_approval_schema_only: true,
  approval_state_changed: false,
  publish_ready_set: false,
  publication_approval_granted: false,
  public_article_mutation_allowed: false,
  reference_insertion_allowed: false,
  content_packet_generation_allowed: false,
  jsonl_append_allowed: false,
  database_write_allowed: false,
  backend_auth_supabase_allowed: false,
  public_publishing_allowed: false,
  next_stage_id: "AG06Z"
};

const approvalRegister = {
  module_id: "AG06L",
  title: "Publish Queue and Approval State Register",
  register_type: "approval_state_register_only",
  status: "queue_approval_schema_only",
  governance_only: true,
  depends_on: ["AG06H-R1", "AG06E", "AG06F", "AG06G", "AG06H", "AG06I", "AG06J", "AG06K"],
  generated_from: inputs,
  summary,
  state_model: stateModel,
  approval_checkpoints: approvalCheckpoints,
  approval_roles: approvalRoles,
  transition_rules: transitionRules,
  publish_readiness_gate_groups: publishReadinessGateGroups,
  approval_queue_entries: approvalQueueEntries,
  ...falseGuards
};

const schema = {
  schema_id: "drishvara/ag06l/publish-queue-approval-state.schema.json",
  module_id: "AG06L",
  title: "Publish Queue and Approval State Schema",
  status: "schema_only",
  description: "Schema for future publish queue state, approval checkpoints, role labels, transition rules and publish-readiness gates. This schema does not authorize publishing or public mutation.",
  required_top_level_fields: [
    "approval_queue_id",
    "source_queue_id",
    "source_article_path",
    "current_state",
    "approval_state",
    "publish_ready",
    "required_approval_checkpoints",
    "required_gate_groups",
    "mutation_controls"
  ],
  allowed_states: stateModel.map((state) => state.state_id),
  allowed_approval_states: [
    "not_approved",
    "pending_review",
    "revision_required",
    "approved_for_next_stage",
    "approved_for_publish_readiness_review",
    "publish_ready_locked_in_future_stage",
    "rejected",
    "paused"
  ],
  approval_checkpoints: approvalCheckpoints.map((checkpoint) => checkpoint.checkpoint_id),
  approval_role_ids: approvalRoles.map((role) => role.role_id),
  publish_readiness_gate_groups: publishReadinessGateGroups.map((group) => group.group_id),
  transition_rules: transitionRules,
  future_activation_rules: [
    "No queue item can become publish_ready without all required gate groups passing.",
    "No queue item can be published without a later explicit public upgrade/publish patch.",
    "No current public article HTML can be mutated through AG06L.",
    "No reference URL insertion can occur through AG06L.",
    "No JSONL append can occur through AG06L.",
    "No backend/Auth/Supabase activation can occur through AG06L."
  ],
  publish_queue_transition_allowed_in_ag06l: false,
  publication_allowed_in_ag06l: false,
  public_mutation_allowed_in_ag06l: false,
  ...falseGuards
};

const review = {
  module_id: "AG06L",
  title: "Publish Queue and Approval State Register Review",
  status: "queue_approval_schema_only",
  governance_only: true,
  depends_on: ["AG06K"],
  generated_from: inputs,
  summary,
  alignment_with_ag06h_r1: {
    corrected_remaining_path_contains_ag06l: Array.isArray(ag06hR1.corrected_remaining_path)
      ? ag06hR1.corrected_remaining_path.some((x) => x.next_stage === "AG06L")
      : false,
    ag07_blocked_until_ag06z: ag06hR1.summary?.ag07_blocked_until_ag06z
  },
  alignment_with_ag06e: {
    long_form_word_count_min: ag06e.summary?.word_count_min,
    long_form_word_count_max: ag06e.summary?.word_count_max,
    verified_reference_min: ag06e.summary?.verified_reference_min,
    verified_reference_max: ag06e.summary?.verified_reference_max,
    quality_score_min_publish_ready: ag06e.summary?.quality_score_min_publish_ready,
    visitor_value_score_min_publish_ready: ag06e.summary?.visitor_value_score_min_publish_ready
  },
  alignment_with_ag06g_ag06h: {
    ag06g_content_packet_generation_allowed: ag06g.review_decision?.content_packet_generation_allowed,
    ag06g_article_mutation_allowed: ag06g.review_decision?.article_mutation_allowed,
    ag06h_planning_entry_count: ag06h.summary?.planning_entry_count,
    ag06h_content_packet_generation_performed: ag06h.summary?.content_packet_generation_performed
  },
  alignment_with_ag06i_ag06j_ag06k: {
    ag06i_visual_generation_allowed: ag06i.closure_decision?.visual_asset_generation_allowed,
    ag06j_reference_insertion_allowed: ag06j.closure_decision?.reference_insertion_allowed,
    ag06k_jsonl_append_allowed: ag06k.closure_decision?.jsonl_append_allowed,
    ag06k_manifest_store_count: ag06kManifest.stores?.length,
    ag06k_record_family_count: ag06kStandard.record_families?.length
  },
  register_file: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
  schema_file: "data/content-intelligence/schema/publish-queue-approval-state.schema.json",
  closure_decision: {
    decision: "publish_queue_approval_state_register_closed_for_foundation",
    proceed_to_ag06z_content_intelligence_foundation_closure: true,
    approval_state_change_allowed: false,
    publish_ready_lock_allowed: false,
    publishing_allowed: false,
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    content_packet_generation_allowed: false,
    jsonl_append_allowed: false,
    scaffold_import_allowed: false,
    backend_auth_supabase_allowed: false
  },
  ...falseGuards
};

const registry = {
  module_id: "AG06L",
  title: "Publish Queue and Approval State Register",
  governance_only: true,
  queue_approval_schema_only: true,
  depends_on: ["AG06K"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/publish-queue-approval-state-register.json",
    approval_register: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json",
    schema: "data/content-intelligence/schema/publish-queue-approval-state.schema.json",
    preview: "data/quality/ag06l-publish-queue-approval-state-register-preview.json",
    document: "docs/quality/AG06L_PUBLISH_QUEUE_APPROVAL_STATE_REGISTER.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG06Z",
    title: "Content Intelligence Foundation Closure",
    allowed_scope: "closure audit only",
    blocked_scope: "public mutation, publishing, backend/Auth/Supabase activation"
  },
  ...falseGuards
};

const preview = {
  module_id: "AG06L",
  preview_only: true,
  summary,
  state_model_preview: stateModel.map((state) => ({
    state_id: state.state_id,
    publish_ready: state.publish_ready,
    public_mutation_allowed: state.public_mutation_allowed
  })),
  approval_checkpoints_preview: approvalCheckpoints.map((checkpoint) => ({
    checkpoint_id: checkpoint.checkpoint_id,
    current_status: checkpoint.current_status
  })),
  first_approval_queue_entries: approvalQueueEntries.slice(0, 5).map((entry) => ({
    approval_queue_id: entry.approval_queue_id,
    source_article_path: entry.source_article_path,
    current_state: entry.current_state,
    approval_state: entry.approval_state,
    publish_ready: entry.publish_ready,
    publication_allowed: entry.publication_allowed
  })),
  no_mutation_summary: {
    approval_state_changed: false,
    publish_ready_set: false,
    publication_approval_granted: false,
    public_article_mutation_performed: false,
    reference_insertion_performed: false,
    content_packet_generation_performed: false,
    jsonl_append_performed: false,
    scaffold_import_performed: false,
    public_publishing_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false
  },
  next_stage_id: "AG06Z"
};

const doc = `# AG06L — Publish Queue and Approval State Register

## Purpose

AG06L closes the publish queue and approval-state governance layer for future Drishvara long-form production.

This stage defines approval states, queue states, transition rules, approval checkpoints, role labels and publish-readiness gate groups. It also maps the existing AG06F long-form upgrade queue into an approval-state register while keeping every entry not approved, not publish-ready and not eligible for public mutation.

AG06L does not publish content, mutate public articles, insert references, generate content packets, append JSONL records, import scaffold outputs, write to any database, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG06L consumes:

- AG06H-R1 Content Intelligence Foundation Alignment Review.
- AG06E Long-Form Article Standard.
- AG06F Long-Form Production Queue.
- AG06G Dry-Run Review.
- AG06H Batch 01 Content Packet Upgrade Planning.
- AG06I Visual/Data/Infographic Requirement Schema Closure.
- AG06J Reference and Source Credibility Schema Closure.
- AG06K JSONL-first Content Intelligence Store Governance.

## Queue Logic

Each AG06F queue entry is represented in AG06L as an approval-state register entry.

Every register entry remains:

- approval_state=not_approved;
- publish_ready=false;
- publication_allowed=false;
- article_mutation_allowed=false;
- reference_insertion_allowed=false;
- content_packet_generation_allowed=false;
- jsonl_append_allowed=false.

## Approval State Model

AG06L defines future states including:

- queued_for_upgrade_review;
- content_packet_planning_only;
- content_packet_generation_awaiting_explicit_approval;
- content_packet_drafted_in_future_stage;
- reference_review_pending;
- visual_review_pending;
- quality_review_pending;
- visitor_value_review_pending;
- editorial_review_pending;
- approval_required;
- approved_for_publish_readiness_review;
- publish_ready_locked_in_future_stage;
- published_in_later_approved_stage;
- revision_required;
- rejected;
- paused;
- archived_by_explicit_approval_only.

## Approval Checkpoints

AG06L defines future approval checkpoints:

- content packet generation permission;
- reference approval;
- visual/data approval;
- quality score approval;
- visitor-value score approval;
- editorial approval;
- final publish approval.

All checkpoints remain pending, blocked or not evaluated in AG06L.

## Publish-Readiness Gate Groups

AG06L groups future publish-readiness gates from:

- AG06E long-form content standard;
- AG06J reference/source credibility;
- AG06I visual/data/infographic requirement;
- AG06K JSONL auditability;
- AG06L public mutation and publish controls.

## Explicit Exclusions

AG06L does not:

- change approval state;
- set publish_ready=true;
- grant publication approval;
- publish content;
- mutate current public article HTML;
- insert, populate or change reference URLs;
- modify CSS or JavaScript;
- create or append production JSONL records;
- write to any database;
- copy, move, delete, import or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- generate visual assets or infographics;
- assign final quality or visitor-value scores;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06L is acceptable only if:

- AG06H-R1, AG06E, AG06F, AG06G, AG06H, AG06I, AG06J and AG06K inputs are present;
- approval register count matches AG06F queue count;
- every approval register entry remains not approved and not publish-ready;
- state model is defined;
- approval checkpoints are defined;
- transition rules are defined;
- approval role labels are defined as future process roles only, not Auth roles;
- publish-readiness gate groups are defined;
- package scripts for generate:ag06l and validate:ag06l are present;
- validate:project includes validate:ag06l;
- no approval-state change, publish-ready lock, publishing, public article mutation, reference insertion, content packet generation, JSONL append, scaffold import, database write, backend/Auth/Supabase activation or public output is performed.

## Next Stage

The next stage is AG06Z — Content Intelligence Foundation Closure.
`;

writeJson(registerPath, approvalRegister);
writeJson(schemaPath, schema);
writeJson(reviewPath, review);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG06L publish queue and approval state register artifacts generated.");
