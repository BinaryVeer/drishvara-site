import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07zReview: "data/content-intelligence/quality-reviews/ag07z-repeatable-production-readiness-closure.json",
  ag07zClosure: "data/content-intelligence/closure-registry/ag07z-controlled-chain-closure.json",
  ag07zNextCycle: "data/content-intelligence/run-registry/ag07z-next-cycle-recommendations.json",
  ag07zSchema: "data/content-intelligence/schema/repeatable-production-readiness-closure.schema.json",
  ag07zLearning: "data/content-intelligence/learning/ag07z-repeatable-production-readiness-learning.json",
  ag06fQueue: "data/quality/ag06f-long-form-production-queue.json",
  ag06eStandard: "data/quality/ag06e-long-form-article-standard.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08a-repeatable-article-upgrade-cycle-planning.json");
const roadmapPath = path.join(root, "data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json");
const selectionCriteriaPath = path.join(root, "data/content-intelligence/selection-registry/ag08a-next-article-selection-criteria.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/repeatable-article-upgrade-cycle-planning.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08a-repeatable-article-upgrade-cycle-planning-learning.json");
const registryPath = path.join(root, "data/quality/ag08a-repeatable-article-upgrade-cycle-planning.json");
const previewPath = path.join(root, "data/quality/ag08a-repeatable-article-upgrade-cycle-planning-preview.json");
const docPath = path.join(root, "docs/quality/AG08A_REPEATABLE_ARTICLE_UPGRADE_CYCLE_PLANNING.md");

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
    throw new Error(`Missing required AG08A input ${name}: ${relativePath}`);
  }
}

const ag07zReview = readJson(inputs.ag07zReview);
const ag07zClosure = readJson(inputs.ag07zClosure);
const ag07zNextCycle = readJson(inputs.ag07zNextCycle);
const ag07zSchema = readJson(inputs.ag07zSchema);
const ag07zLearning = readJson(inputs.ag07zLearning);
const ag06fQueue = readJson(inputs.ag06fQueue);
const ag06eStandard = readJson(inputs.ag06eStandard);

const queueEntries =
  asArray(ag06fQueue.queue_entries)
    .concat(asArray(ag06fQueue.production_queue))
    .concat(asArray(ag06fQueue.queue))
    .filter(Boolean);

const ag07Closed =
  ag07zReview.status === "ag07_repeatable_production_readiness_closed" &&
  ag07zReview.closure_decision?.ag07_chain_closed === true &&
  ag07zReview.closure_decision?.production_readiness === "repeatable_chain_closed_one_article_audited";

const planningOnlyControls = {
  planning_governance_only: true,
  repeatable_cycle_planning_created: true,
  roadmap_created: true,
  selection_criteria_created: true,
  next_stage_handoff_created: true,
  future_stage_map_created: true,
  batch_decision_recorded: true,
  evidence_consumed_only: true,
  next_cycle_started: false,
  next_article_selected: false,
  candidate_packet_created: false,
  production_packet_created: false,
  article_inference_generated: false,
  score_calculation_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  new_article_mutation_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
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
  live_url_fetch_performed: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
  caption_alt_credit_population_performed: false,
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

const stageMap = [
  {
    stage_id: "AG08A",
    title: "Repeatable Article Upgrade Cycle Planning",
    purpose: "Convert AG07 pilot closure into a repeatable operating model.",
    allowed: ["roadmap", "selection criteria", "future stage map", "blocked action doctrine"],
    blocked: ["article mutation", "reference insertion", "visual generation", "JSONL/database/Supabase/backend/publishing activation"],
    status_after_ag08a: "created_in_this_stage"
  },
  {
    stage_id: "AG08B",
    title: "Next Article Selection",
    purpose: "Select exactly one next article using AG08A criteria.",
    allowed: ["read-only article inventory review", "single target recommendation", "selection evidence"],
    blocked: ["article mutation", "reference insertion", "visual generation", "publishing"],
    status_after_ag08a: "planned_not_started"
  },
  {
    stage_id: "AG08C",
    title: "Article Upgrade Candidate Packet",
    purpose: "Create one candidate upgrade packet for the selected article.",
    allowed: ["candidate packet", "section plan", "reference/visual need flags"],
    blocked: ["public article mutation", "production JSONL append", "database write"],
    status_after_ag08a: "planned_not_started"
  },
  {
    stage_id: "AG08D",
    title: "Inference, Reference and Visual Readiness Review",
    purpose: "Review article inference, reference needs, visual/data needs and quality risks before scoring/apply.",
    allowed: ["readiness review", "gap matrix", "inference preview if separately approved"],
    blocked: ["URL insertion", "image insertion", "article mutation"],
    status_after_ag08a: "planned_not_started"
  },
  {
    stage_id: "AG08E",
    title: "Dry-Run Scoring and Improvement Plan",
    purpose: "Calculate dry-run quality/visitor-value scores and plan improvements.",
    allowed: ["dry-run scoring", "improvement plan"],
    blocked: ["publish-ready approval", "article mutation", "production packet write"],
    status_after_ag08a: "planned_not_started"
  },
  {
    stage_id: "AG08F",
    title: "Approval and Controlled Apply Plan",
    purpose: "Create the approval, backup, rollback and one-article apply checklist.",
    allowed: ["approval checklist", "backup plan", "rollback plan"],
    blocked: ["actual apply", "publishing", "runtime activation"],
    status_after_ag08a: "planned_not_started"
  },
  {
    stage_id: "AG08G",
    title: "One-Article Controlled Apply",
    purpose: "Apply the approved upgrade to one static article only.",
    allowed: ["one target article mutation", "pre-apply backup"],
    blocked: ["multi-article mutation", "database/Supabase/backend/Auth activation"],
    status_after_ag08a: "planned_not_started_requires_explicit_approval"
  },
  {
    stage_id: "AG08H",
    title: "Post-Apply Audit",
    purpose: "Audit marker scope, backup integrity, rollback readiness and forbidden-system guards.",
    allowed: ["audit", "hash/marker checks", "rollback readiness record"],
    blocked: ["new mutation", "publishing", "runtime activation"],
    status_after_ag08a: "planned_not_started"
  },
  {
    stage_id: "AG08Z",
    title: "Cycle Closure",
    purpose: "Close the AG08 article-upgrade cycle and record learnings.",
    allowed: ["closure", "learning", "next-cycle recommendation"],
    blocked: ["new mutation", "publishing", "runtime activation"],
    status_after_ag08a: "planned_not_started"
  }
];

const selectionCriteria = {
  module_id: "AG08A",
  title: "Next Article Selection Criteria",
  status: "selection_criteria_created_not_applied",
  selection_not_performed_in_ag08a: true,
  recommended_selection_mode: "single_article_only",
  batch_mode_recommendation: "defer_batch_until_at_least_two_more_single_article_cycles_pass",
  target_count_for_next_cycle: 1,
  eligible_article_principles: [
    "Existing static public article only.",
    "Article should be within the AG06F long-form upgrade queue or current governed public article inventory.",
    "Article should be safe to back up and mutate as one static file.",
    "Article should not require backend, Auth, Supabase, API or database activation.",
    "Article should benefit from reader-value improvement, clearer structure, stronger inference or long-form upgrade."
  ],
  priority_dimensions: [
    {
      dimension_id: "SEL-001",
      name: "visitor_value_potential",
      weight: 25,
      description: "Potential to help readers with practical insight, clarity or evergreen relevance."
    },
    {
      dimension_id: "SEL-002",
      name: "current_quality_gap",
      weight: 20,
      description: "Article has shortness, vague structure, weak explanatory value or lack of depth."
    },
    {
      dimension_id: "SEL-003",
      name: "category_importance",
      weight: 15,
      description: "Article belongs to a strategically important Drishvara theme."
    },
    {
      dimension_id: "SEL-004",
      name: "static_apply_safety",
      weight: 20,
      description: "Article file structure is suitable for controlled static apply and rollback."
    },
    {
      dimension_id: "SEL-005",
      name: "reference_visual_readiness",
      weight: 10,
      description: "Article can later support verified references and credited visual/data enrichment."
    },
    {
      dimension_id: "SEL-006",
      name: "repeatability_learning_value",
      weight: 10,
      description: "Article can test whether AG07 doctrine generalizes beyond the pilot article."
    }
  ],
  exclusion_rules: [
    "Do not select more than one article in AG08B unless a separate batch boundary is approved.",
    "Do not select an article requiring dynamic backend, Auth, Supabase, admin, subscriber or payment activation.",
    "Do not select an article only because it is easy; select based on quality and visitor-value priority.",
    "Do not select an article for reference insertion unless reference verification is separately approved.",
    "Do not select an article for visual insertion unless image credit, alt text and caption gates are separately approved."
  ],
  required_selection_output_for_ag08b: {
    one_target_article_path: true,
    selection_scorecard: true,
    reason_for_selection: true,
    blocked_actions_restated: true,
    ag08c_handoff_created: true
  },
  ...planningOnlyControls
};

const roadmap = {
  module_id: "AG08A",
  title: "Repeatable Article Upgrade Roadmap",
  status: "roadmap_created_not_started",
  generated_from: inputs,
  ag07z_closure_consumed: ag07Closed,
  operating_model: {
    name: "single_article_repeatable_upgrade_cycle",
    default_mode: "one_article_at_a_time",
    batch_mode_status: "deferred",
    reason_for_single_article_mode: "AG07 proved one controlled apply; repeatability should be tested on two to three more single articles before batch controls are introduced."
  },
  stage_map: stageMap,
  compulsory_gates: [
    "Explicit approval before every stage that creates artifacts.",
    "Exact target article path before any apply stage.",
    "Backup before mutation.",
    "One article only unless batch mode is separately approved.",
    "Post-apply audit before closure.",
    "Reference insertion requires verified URL approval.",
    "Visual insertion requires credit, alt text and caption approval.",
    "Static file change is not publishing approval.",
    "Backend/Auth/Supabase/API/database/JSONL activation requires separate explicit approval."
  ],
  evidence_to_reuse_from_ag07: [
    "AG07Z repeatable doctrine",
    "AG07Q audit model",
    "AG07P backup-first apply model",
    "AG07O controlled mutation plan",
    "AG07N production-packet candidate pattern",
    "AG07I scoring boundary and AG07K inference preview concept"
  ],
  next_stage_handoff: {
    next_stage_id: "AG08B",
    next_stage_title: "Next Article Selection",
    explicit_approval_required: true,
    allowed_scope: "select one next article using AG08A selection criteria only",
    blocked_scope: "article mutation, reference insertion, visual generation, JSONL/database/Supabase/backend/Auth/publishing activation"
  },
  ...planningOnlyControls
};

const schema = {
  schema_id: "drishvara/ag08a/repeatable-article-upgrade-cycle-planning.schema.json",
  module_id: "AG08A",
  title: "Repeatable Article Upgrade Cycle Planning Schema",
  status: "schema_planning_only",
  description: "Schema for planning a repeatable article-upgrade cycle after AG07Z closure without starting selection, mutation, publishing or runtime activation.",
  required_top_level_fields: [
    "roadmap",
    "selection_criteria",
    "stage_map",
    "summary",
    "planning_only_controls"
  ],
  planning_allowed_in_ag08a: true,
  roadmap_creation_allowed_in_ag08a: true,
  selection_criteria_creation_allowed_in_ag08a: true,
  future_stage_map_allowed_in_ag08a: true,
  next_stage_handoff_allowed_in_ag08a: true,
  next_article_selection_allowed_in_ag08a: false,
  article_mutation_allowed_in_ag08a: false,
  file_edit_allowed_in_ag08a: false,
  reference_insertion_allowed_in_ag08a: false,
  reference_url_population_allowed_in_ag08a: false,
  visual_generation_allowed_in_ag08a: false,
  production_jsonl_append_allowed_in_ag08a: false,
  database_write_allowed_in_ag08a: false,
  supabase_write_allowed_in_ag08a: false,
  backend_auth_supabase_allowed_in_ag08a: false,
  publishing_allowed_in_ag08a: false,
  ...planningOnlyControls
};

const summary = {
  ag07z_closure_consumed: ag07Closed,
  ag08a_planning_created: true,
  repeatable_roadmap_created: true,
  selection_criteria_created: true,
  future_stage_map_created: true,
  single_article_mode_recommended: true,
  batch_mode_deferred: true,
  next_stage_id: "AG08B",
  next_stage_title: "Next Article Selection",
  next_stage_requires_explicit_approval: true,
  next_article_selected: false,
  article_mutation_performed: false,
  reference_insertion_performed: false,
  visual_generation_performed: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  publishing_performed: false,
  production_readiness_after_ag08a: "repeatable_cycle_planned_not_started",
  publish_readiness_after_ag08a: "blocked"
};

const learning = {
  module_id: "AG08A",
  title: "Repeatable Article Upgrade Cycle Planning Learning",
  status: "learning_record_only",
  planning_governance_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07z: asArray(ag07zLearning.ag07z_learning_points),
  ag08a_learning_points: [
    "AG07 should now be treated as a successful pilot, not repeated blindly under new names.",
    "AG08A converts the pilot into a repeatable operating model.",
    "Single-article mode should continue until repeatability is proven across more than one article.",
    "The next stage should select one article only; selection is not performed in AG08A.",
    "Batch mode requires a separate design for per-article backup, per-article audit and rollback matrix."
  ],
  carried_forward_doctrine: [
    "One article at a time by default.",
    "Backup before mutation.",
    "Audit after mutation.",
    "Static file change is not publishing approval.",
    "Reference and visual enrichment require separate gates.",
    "No backend/Auth/Supabase/API/database/JSONL activation without separate approval."
  ],
  ...planningOnlyControls
};

const review = {
  module_id: "AG08A",
  title: "Repeatable Article Upgrade Cycle Planning",
  status: "repeatable_article_upgrade_cycle_planning_created",
  governance_only: true,
  planning_governance_only: true,
  depends_on: ["AG07Z", "AG07Q", "AG07P", "AG06Z"],
  generated_from: inputs,
  summary,
  ag07z_closure_snapshot: {
    ag07z_status: ag07zReview.status,
    ag07_chain_closed: ag07zReview.closure_decision?.ag07_chain_closed,
    production_readiness: ag07zReview.closure_decision?.production_readiness,
    publish_readiness: ag07zReview.closure_decision?.publish_readiness,
    next_cycle_requires_explicit_approval: ag07zReview.closure_decision?.next_cycle_requires_explicit_approval,
    next_cycle_activation_status: ag07zNextCycle.activation_status
  },
  roadmap_file: "data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json",
  selection_criteria_file: "data/content-intelligence/selection-registry/ag08a-next-article-selection-criteria.json",
  schema_file: "data/content-intelligence/schema/repeatable-article-upgrade-cycle-planning.schema.json",
  learning_file: "data/content-intelligence/learning/ag08a-repeatable-article-upgrade-cycle-planning-learning.json",
  closure_decision: {
    decision: "ag08a_planning_closed_ready_for_ag08b_selection",
    repeatable_cycle_planning_created: true,
    proceed_to_ag08b_only_with_explicit_user_approval: true,
    ag08b_scope: "select exactly one next target article using AG08A criteria",
    next_article_selected: false,
    article_mutation_performed: false,
    file_edit_performed: false,
    reference_insertion_performed: false,
    visual_generation_performed: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
    public_publishing_performed: false,
    backend_auth_supabase_activation_performed: false,
    production_readiness: "repeatable_cycle_planned_not_started",
    publish_readiness: "blocked"
  },
  ...planningOnlyControls
};

const registry = {
  module_id: "AG08A",
  title: "Repeatable Article Upgrade Cycle Planning",
  governance_only: true,
  depends_on: ["AG07Z"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08a-repeatable-article-upgrade-cycle-planning.json",
    roadmap: "data/content-intelligence/run-registry/ag08a-repeatable-article-upgrade-roadmap.json",
    selection_criteria: "data/content-intelligence/selection-registry/ag08a-next-article-selection-criteria.json",
    schema: "data/content-intelligence/schema/repeatable-article-upgrade-cycle-planning.schema.json",
    learning: "data/content-intelligence/learning/ag08a-repeatable-article-upgrade-cycle-planning-learning.json",
    preview: "data/quality/ag08a-repeatable-article-upgrade-cycle-planning-preview.json",
    document: "docs/quality/AG08A_REPEATABLE_ARTICLE_UPGRADE_CYCLE_PLANNING.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG08B",
    title: "Next Article Selection",
    explicit_approval_required: true,
    allowed_scope: "select one next article only",
    blocked_scope: "mutation, references, visuals, JSONL/database/Supabase/backend/Auth/publishing activation"
  },
  ...planningOnlyControls
};

const preview = {
  module_id: "AG08A",
  preview_only: true,
  planning_governance_only: true,
  summary,
  roadmap_snapshot: {
    operating_model: roadmap.operating_model,
    stage_count: stageMap.length,
    next_stage_id: roadmap.next_stage_handoff.next_stage_id,
    next_stage_title: roadmap.next_stage_handoff.next_stage_title
  },
  selection_snapshot: {
    recommended_selection_mode: selectionCriteria.recommended_selection_mode,
    target_count_for_next_cycle: selectionCriteria.target_count_for_next_cycle,
    priority_dimension_count: selectionCriteria.priority_dimensions.length,
    selection_not_performed_in_ag08a: selectionCriteria.selection_not_performed_in_ag08a
  },
  ...planningOnlyControls
};

const doc = `# AG08A — Repeatable Article Upgrade Cycle Planning

## Purpose

AG08A converts the successful AG07 one-article pilot into a repeatable article-upgrade operating model.

AG08A is planning/governance only. It does not select the next article, mutate any article, insert references, generate visuals, append JSONL records, write to database/Supabase, publish content, or activate backend/Auth/Supabase/API functionality.

## Input Closure Consumed

AG08A consumes AG07Z, where the AG07 controlled article-upgrade chain was closed after AG07Q audit.

## Recommended Operating Model

Default mode: one article at a time.

Batch mode remains deferred until at least two to three additional single-article cycles pass safely.

## Future Stage Map

The proposed future stage map is:

- AG08B — Next Article Selection
- AG08C — Article Upgrade Candidate Packet
- AG08D — Inference, Reference and Visual Readiness Review
- AG08E — Dry-Run Scoring and Improvement Plan
- AG08F — Approval and Controlled Apply Plan
- AG08G — One-Article Controlled Apply
- AG08H — Post-Apply Audit
- AG08Z — Cycle Closure

## Selection Criteria

The next article should be selected using:

- visitor-value potential;
- current quality gap;
- category importance;
- static apply safety;
- reference/visual readiness;
- repeatability learning value.

AG08A does not select the article. Selection is deferred to AG08B.

## Compulsory Gates

Future cycles must preserve:

1. Explicit approval before each stage.
2. Exact target article path before apply.
3. Backup before mutation.
4. One article only unless batch mode is separately approved.
5. Audit after mutation.
6. Reference insertion only after verified URL approval.
7. Visual insertion only with credit, alt text and caption.
8. Static file change is not publishing approval.
9. Backend/Auth/Supabase/API/database/JSONL activation requires separate explicit approval.

## Explicit Exclusions

AG08A does not:

- select the next article;
- mutate article files;
- edit files;
- insert references;
- populate reference URLs;
- generate visuals;
- insert images;
- append production JSONL records;
- write to database or Supabase;
- approve publish readiness;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Next Stage

AG08B — Next Article Selection — is identified as next only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(roadmapPath, roadmap);
writeJson(selectionCriteriaPath, selectionCriteria);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG08A repeatable article upgrade cycle planning artifacts generated.");
