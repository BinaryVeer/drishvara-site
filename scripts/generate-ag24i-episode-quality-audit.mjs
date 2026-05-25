import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag24aDoctrine: "data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json",
  ag24bPlan: "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json",
  ag24cCalendarPlan: "data/content-intelligence/episodes/ag24c-12-week-episode-calendar-plan.json",
  ag24dStructurePlan: "data/content-intelligence/episodes/ag24d-educational-series-structure-plan.json",
  ag24eStructurePlan: "data/content-intelligence/episodes/ag24e-burning-topic-series-structure-plan.json",
  ag24fMetadataSchema: "data/content-intelligence/episodes/ag24f-episode-metadata-schema.json",
  ag24fLifecycleRegistry: "data/content-intelligence/episodes/ag24f-episode-lifecycle-status-registry.json",
  ag24gScaffold: "data/content-intelligence/episodes/ag24g-episode-index-navigation-scaffold.json",
  ag24gIndexStructure: "data/content-intelligence/episodes/ag24g-non-active-episode-index-structure.json",
  ag24hReview: "data/content-intelligence/quality-reviews/ag24h-episode-production-conveyor.json",
  ag24hConveyor: "data/content-intelligence/episodes/ag24h-episode-production-conveyor.json",
  ag24hStageRegistry: "data/content-intelligence/episodes/ag24h-production-stage-registry.json",
  ag24hTopicToBriefModel: "data/content-intelligence/episodes/ag24h-topic-to-brief-conveyor-model.json",
  ag24hEditorialHandoffModel: "data/content-intelligence/episodes/ag24h-editorial-review-handoff-model.json",
  ag24hConsumptionPlan: "data/content-intelligence/episodes/ag24h-future-consumption-plan.json",
  ag24hReadiness: "data/content-intelligence/quality-registry/ag24h-episode-quality-audit-readiness-record.json",
  ag24hBoundary: "data/content-intelligence/mutation-plans/ag24h-to-ag24i-episode-quality-audit-boundary.json",
  ag23gScoringModel: "data/content-intelligence/homepage/ag23g-first-light-topic-scoring-model.json",
  ag23fVerificationPlan: "data/content-intelligence/homepage/ag23f-first-light-source-verification-plan.json",
  ag23zClosure: "data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag24i-episode-quality-audit.json",
  auditPlan: "data/content-intelligence/episodes/ag24i-episode-quality-audit-plan.json",
  checklistRegistry: "data/content-intelligence/episodes/ag24i-quality-checklist-registry.json",
  sourceRiskAuditModel: "data/content-intelligence/episodes/ag24i-source-risk-audit-model.json",
  nonPublicControlAuditModel: "data/content-intelligence/episodes/ag24i-non-public-control-audit-model.json",
  consumptionPlan: "data/content-intelligence/episodes/ag24i-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag24i-episode-quality-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag24i-episodic-knowledge-engine-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag24i-to-ag24z-episodic-knowledge-engine-closure-boundary.json",
  registry: "data/quality/ag24i-episode-quality-audit.json",
  preview: "data/quality/ag24i-episode-quality-audit-preview.json",
  doc: "docs/quality/AG24I_EPISODE_QUALITY_AUDIT.md"
};

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG24I input: ${p}`);
}

const ag24aDoctrine = readJson(inputs.ag24aDoctrine);
const ag24bPlan = readJson(inputs.ag24bPlan);
const ag24cCalendarPlan = readJson(inputs.ag24cCalendarPlan);
const ag24dStructurePlan = readJson(inputs.ag24dStructurePlan);
const ag24eStructurePlan = readJson(inputs.ag24eStructurePlan);
const ag24fMetadataSchema = readJson(inputs.ag24fMetadataSchema);
const ag24fLifecycleRegistry = readJson(inputs.ag24fLifecycleRegistry);
const ag24gScaffold = readJson(inputs.ag24gScaffold);
const ag24gIndexStructure = readJson(inputs.ag24gIndexStructure);
const ag24hReview = readJson(inputs.ag24hReview);
const ag24hConveyor = readJson(inputs.ag24hConveyor);
const ag24hStageRegistry = readJson(inputs.ag24hStageRegistry);
const ag24hTopicToBriefModel = readJson(inputs.ag24hTopicToBriefModel);
const ag24hEditorialHandoffModel = readJson(inputs.ag24hEditorialHandoffModel);
const ag24hConsumptionPlan = readJson(inputs.ag24hConsumptionPlan);
const ag24hReadiness = readJson(inputs.ag24hReadiness);
const ag24hBoundary = readJson(inputs.ag24hBoundary);
const ag23gScoringModel = readJson(inputs.ag23gScoringModel);
const ag23fVerificationPlan = readJson(inputs.ag23fVerificationPlan);
const ag23zClosure = readJson(inputs.ag23zClosure);
const supabaseReminder = readJson(inputs.supabaseReminder);

if (ag24aDoctrine.status !== "episodic_content_doctrine_created_ready_for_ag24b") throw new Error("AG24A doctrine status mismatch.");
if (ag24bPlan.stage !== "AG24B") throw new Error("AG24B plan stage mismatch.");
if (ag24bPlan.status !== "governed_plan_only_non_active") throw new Error("AG24B plan must remain non-active.");
if (ag24cCalendarPlan.calendar_scope.total_reserved_slots !== 36) throw new Error("AG24C calendar must contain 36 reserved slots.");
if (ag24dStructurePlan.status !== "educational_series_structure_plan_created_ready_for_ag24e") throw new Error("AG24D structure status mismatch.");
if (ag24eStructurePlan.status !== "burning_topic_series_structure_plan_created_ready_for_ag24f") throw new Error("AG24E structure status mismatch.");
if (ag24fMetadataSchema.status !== "episode_metadata_schema_created_ready_for_ag24g") throw new Error("AG24F metadata schema status mismatch.");
if (ag24gScaffold.status !== "episode_index_navigation_scaffold_created_ready_for_ag24h") throw new Error("AG24G scaffold status mismatch.");
if (ag24gIndexStructure.total_index_entries !== 36) throw new Error("AG24G index must contain 36 entries.");
if (ag24hReview.status !== "episode_production_conveyor_created_ready_for_ag24i") throw new Error("AG24H review status mismatch.");
if (ag24hConveyor.status !== "episode_production_conveyor_created_ready_for_ag24i") throw new Error("AG24H conveyor status mismatch.");
if (ag24hStageRegistry.stage_count !== 8) throw new Error("AG24H stage registry must contain 8 stages.");
if (ag24hReadiness.ready_for_ag24i !== true) throw new Error("AG24H readiness does not permit AG24I.");
if (ag24hBoundary.next_stage_id !== "AG24I") throw new Error("AG24H boundary does not point to AG24I.");
if (ag23gScoringModel.status !== "first_light_topic_scoring_model_created_ready_for_ag23h") throw new Error("AG23G scoring model status mismatch.");
if (ag23fVerificationPlan.status !== "first_light_source_verification_plan_created_ready_for_ag23g") throw new Error("AG23F verification plan status mismatch.");
if (ag23zClosure.closure_decision?.ag23_closed !== true) throw new Error("AG23Z closure not confirmed.");

const blockedState = {
  quality_audit_runtime_enabled: false,
  episode_quality_execution_done: false,
  topic_selected: false,
  brief_generated: false,
  draft_generated: false,
  article_generated: false,
  episode_file_created: false,
  article_file_created: false,
  public_index_mutated: false,
  homepage_mutated: false,
  data_written_to_runtime: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  supabase_auth_backend_activated: false
};

const checklistItems = [
  {
    check_id: "metadata_completeness",
    check_group: "metadata",
    purpose: "Verify that future episode records carry required AG24F identity, series, source, risk, navigation and production-control fields.",
    status: "defined_not_executed"
  },
  {
    check_id: "calendar_slot_integrity",
    check_group: "calendar",
    purpose: "Verify that every future episode maps to a valid AG24C reserved slot and AG24G index entry.",
    status: "defined_not_executed"
  },
  {
    check_id: "topic_score_gate",
    check_group: "topic_scoring",
    purpose: "Verify AG24B strong_series_candidate decision and score 25+ before topic use.",
    status: "defined_not_executed"
  },
  {
    check_id: "source_reference_gate",
    check_group: "source",
    purpose: "Verify two-reference target, source status, reachable links and under-editorial-verification handling.",
    status: "defined_not_executed"
  },
  {
    check_id: "unsupported_claim_block",
    check_group: "source",
    purpose: "Block unsupported breaking-news, medical, legal, political, spiritual or scriptural claims.",
    status: "defined_not_executed"
  },
  {
    check_id: "risk_safety_gate",
    check_group: "risk",
    purpose: "Verify sensitivity, repetition and category-specific caution fields.",
    status: "defined_not_executed"
  },
  {
    check_id: "lane_structure_fit",
    check_group: "structure",
    purpose: "Verify Tuesday Learning, Friday World Lens and Sunday Deep Read lane fit.",
    status: "defined_not_executed"
  },
  {
    check_id: "navigation_coherence",
    check_group: "navigation",
    purpose: "Verify previous/next episode fields and non-public navigation state.",
    status: "defined_not_executed"
  },
  {
    check_id: "visual_object_readiness",
    check_group: "layout",
    purpose: "Verify object-rich readiness without breaking article readability or mobile layout.",
    status: "defined_not_executed"
  },
  {
    check_id: "non_public_control",
    check_group: "publication_safety",
    purpose: "Verify public_visibility=false, publish_approved=false and article_generation_allowed=false until later approval.",
    status: "defined_not_executed"
  },
  {
    check_id: "production_conveyor_gate",
    check_group: "production",
    purpose: "Verify AG24H conveyor stages remain gated and no queue mutation occurs without later activation.",
    status: "defined_not_executed"
  },
  {
    check_id: "backend_supabase_defer_gate",
    check_group: "backend_safety",
    purpose: "Verify Supabase/Auth/backend remains deferred under the hybrid staged path.",
    status: "defined_not_executed"
  }
];

const checklistRegistry = {
  module_id: "AG24I",
  title: "Quality Checklist Registry",
  status: "quality_checklist_registry_created_no_runtime_audit",
  check_count: checklistItems.length,
  checklist_items: checklistItems,
  runtime_execution_allowed: false,
  blocked_state: blockedState
};

const sourceRiskAuditModel = {
  module_id: "AG24I",
  title: "Source and Risk Audit Model",
  status: "source_risk_audit_model_created_no_runtime_audit",
  source_audit_rules: {
    target_verified_references_per_episode: 2,
    source_verification_stage: "AG23F",
    fake_links_blocked: true,
    broken_links_blocked: true,
    parked_or_spam_links_blocked: true,
    under_editorial_verification_allowed_as_status_only: true
  },
  risk_audit_rules: {
    sensitivity_risk_required: true,
    repetition_risk_required: true,
    breaking_news_caution_required: true,
    health_legal_political_spiritual_caution_required_where_applicable: true,
    unsupported_claims_blocked: true
  },
  blocked_state: blockedState
};

const nonPublicControlAuditModel = {
  module_id: "AG24I",
  title: "Non-public Control Audit Model",
  status: "non_public_control_audit_model_created_no_public_mutation",
  required_false_flags: [
    "public_visibility",
    "publish_approved",
    "article_generation_allowed",
    "backend_required",
    "supabase_required"
  ],
  forbidden_operations: [
    "episode_file_created",
    "article_file_created",
    "public_index_mutated",
    "homepage_mutated",
    "github_write_performed",
    "deployment_triggered",
    "published",
    "supabase_auth_backend_activated"
  ],
  public_mutation_allowed: false,
  runtime_write_allowed: false,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG24I",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag24z_and_dynamic_site",
  future_consumption: {
    AG24Z: "Episodic Knowledge Engine Closure should consume AG24I audit plan and confirm AG24A-AG24I closure as a non-active governed knowledge-engine foundation.",
    future_dynamic_site: "Later backend/Admin/Editor stages should convert AG24I audit checks into runtime/admin quality gates only after explicit activation approval."
  },
  blocked_state: blockedState
};

const auditPlan = {
  module_id: "AG24I",
  title: "Episode Quality Audit",
  status: "episode_quality_audit_created_ready_for_ag24z",
  purpose: "Define the non-runtime quality audit model for future Drishvara episodes, covering metadata, source, risk, navigation, layout, production and non-public controls without executing audits or enabling publication.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: [
    inputs.ag24aDoctrine,
    inputs.ag24bPlan,
    inputs.ag24cCalendarPlan,
    inputs.ag24dStructurePlan,
    inputs.ag24eStructurePlan,
    inputs.ag24fMetadataSchema,
    inputs.ag24fLifecycleRegistry,
    inputs.ag24gScaffold,
    inputs.ag24gIndexStructure,
    inputs.ag24hReview,
    inputs.ag24hConveyor,
    inputs.ag24hStageRegistry,
    inputs.ag24hTopicToBriefModel,
    inputs.ag24hEditorialHandoffModel,
    inputs.ag24hConsumptionPlan,
    inputs.ag24hReadiness,
    inputs.ag24hBoundary,
    inputs.ag23gScoringModel,
    inputs.ag23fVerificationPlan,
    inputs.ag23zClosure
  ],
  consumed_source_summary: {
    ag24a_status: ag24aDoctrine.status,
    ag24b_status: ag24bPlan.status,
    ag24c_reserved_slots: ag24cCalendarPlan.calendar_scope.total_reserved_slots,
    ag24d_status: ag24dStructurePlan.status,
    ag24e_status: ag24eStructurePlan.status,
    ag24f_status: ag24fMetadataSchema.status,
    ag24g_status: ag24gScaffold.status,
    ag24h_status: ag24hConveyor.status,
    ag24h_ready_for_ag24i: ag24hReadiness.ready_for_ag24i === true,
    ag23g_status: ag23gScoringModel.status,
    ag23f_status: ag23fVerificationPlan.status,
    ag23z_closed: ag23zClosure.closure_decision?.ag23_closed === true
  },
  audit_scope: {
    audit_type: "non_runtime_quality_audit_plan",
    checklist_count: checklistItems.length,
    audit_execution_status: "blocked",
    public_mutation_status: "blocked",
    generation_status: "blocked",
    next_stage: "AG24Z"
  },
  checklist_registry_file: outputs.checklistRegistry,
  source_risk_audit_model_file: outputs.sourceRiskAuditModel,
  non_public_control_audit_model_file: outputs.nonPublicControlAuditModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  quality_audit_runtime_enabled: false,
  audit_execution_allowed_in_ag24i: false,
  article_generation_allowed_in_ag24i: false,
  publication_allowed_in_ag24i: false,
  public_visibility_default: false,
  publish_approved_default: false,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder || "Supabase/Auth/backend remains deferred and must not be activated without explicit approval.",
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG24I",
  title: "Episode Quality Audit Blocker Register",
  status: "episode_quality_audit_operations_blocked_pending_ag24z",
  blocked_items: [
    "No quality audit runtime activation.",
    "No episode quality execution.",
    "No topic selection.",
    "No brief generation.",
    "No draft generation.",
    "No article generation.",
    "No episode file creation.",
    "No article file creation.",
    "No public index mutation.",
    "No homepage mutation.",
    "No runtime data write.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG24I",
  title: "Episodic Knowledge Engine Closure Readiness Record",
  status: "ready_for_ag24z_episodic_knowledge_engine_closure",
  ready_for_ag24z: true,
  next_stage_id: "AG24Z",
  next_stage_title: "Episodic Knowledge Engine Closure",
  episode_quality_audit_created: true,
  checklist_registry_created: true,
  source_risk_audit_model_created: true,
  non_public_control_audit_model_created: true,
  future_consumption_plan_created: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG24I",
  title: "AG24I to AG24Z Episodic Knowledge Engine Closure Boundary",
  status: "ag24z_boundary_created_not_started",
  next_stage_id: "AG24Z",
  next_stage_title: "Episodic Knowledge Engine Closure",
  allowed_scope: [
    "Consume AG24A through AG24I records.",
    "Close the episodic knowledge engine planning chain.",
    "Confirm non-active, non-publishing, no-backend state.",
    "Prepare later AG25 Featured Reads Production Strengthening handoff."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const review = {
  module_id: "AG24I",
  title: "Episode Quality Audit",
  status: "episode_quality_audit_created_ready_for_ag24z",
  depends_on: ["AG24A", "AG24B", "AG24C", "AG24D", "AG24E", "AG24F", "AG24G", "AG24H", "AG23G", "AG23F", "AG23Z"],
  generated_from: inputs,
  audit_plan_file: outputs.auditPlan,
  checklist_registry_file: outputs.checklistRegistry,
  source_risk_audit_model_file: outputs.sourceRiskAuditModel,
  non_public_control_audit_model_file: outputs.nonPublicControlAuditModel,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    episode_quality_audit_created: true,
    checklist_registry_created: true,
    checklist_count: checklistItems.length,
    source_risk_audit_model_created: true,
    non_public_control_audit_model_created: true,
    runtime_audit_enabled: false,
    audit_execution_done: false,
    topic_selection_done: false,
    brief_generated: false,
    draft_generated: false,
    episode_generation_done: false,
    article_generation_done: false,
    ready_for_ag24z: true,
    prior_ag_records_consumed: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG24I",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG24I",
  preview_only: true,
  status: review.status,
  message: "AG24I episode quality audit created. Next: AG24Z Episodic Knowledge Engine Closure.",
  checklist_count: checklistItems.length,
  runtime_audit_enabled: 0,
  audit_executions: 0,
  selected_topics: 0,
  generated_briefs: 0,
  generated_drafts: 0,
  generated_episodes: 0,
  generated_articles: 0,
  public_items: 0,
  backend_objects: 0,
  blocked_state: blockedState
};

const doc = `# AG24I — Episode Quality Audit

## Purpose

AG24I defines the non-runtime quality audit plan for Drishvara's episodic knowledge engine.

## Consumed Source-of-Truth

- AG24A episodic content doctrine.
- AG24B topic selection and scoring engine plan.
- AG24C 12-week episode calendar plan.
- AG24D educational series structure plan.
- AG24E burning topic series structure plan.
- AG24F episode metadata schema.
- AG24G episode index and navigation scaffold.
- AG24H episode production conveyor.
- AG23G First Light topic scoring model.
- AG23F source verification plan.
- AG23Z Homepage Daily Surface and First Light closure.

## Audit Domains

- Metadata completeness.
- Calendar slot integrity.
- Topic scoring gate.
- Source and reference gate.
- Unsupported claim block.
- Risk and safety gate.
- Lane structure fit.
- Navigation coherence.
- Visual/object readiness.
- Non-public control.
- Production conveyor gate.
- Backend/Supabase defer gate.

## Runtime Boundary

AG24I does not execute audits, select topics, generate briefs, generate drafts, generate articles, create files, write to GitHub, deploy, publish, or activate Supabase/Auth/backend.

## Next Stage

AG24Z — Episodic Knowledge Engine Closure.
`;

writeJson(outputs.review, review);
writeJson(outputs.auditPlan, auditPlan);
writeJson(outputs.checklistRegistry, checklistRegistry);
writeJson(outputs.sourceRiskAuditModel, sourceRiskAuditModel);
writeJson(outputs.nonPublicControlAuditModel, nonPublicControlAuditModel);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG24I Episode Quality Audit generated.");
console.log("✅ Checklist registry, source/risk audit model and non-public control audit model created.");
console.log("✅ Prior AG24A/AG24B/AG24C/AG24D/AG24E/AG24F/AG24G/AG24H/AG23G/AG23F/AG23Z records consumed.");
console.log("✅ No runtime audit, topic selection, generation, GitHub write, deployment or publishing performed.");
console.log("✅ AG24Z Episodic Knowledge Engine Closure boundary created.");
