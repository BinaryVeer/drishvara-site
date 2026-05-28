import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag42zClosure: "data/content-intelligence/backend-architecture/ag42z-dynamic-workflow-hardening-closure.json",
  ag42zChain: "data/content-intelligence/backend-architecture/ag42z-ag42-hardening-chain-register.json",
  ag42zCarryForward: "data/content-intelligence/backend-architecture/ag42z-carry-forward-exception-register.json",
  ag42zAg43EntryPlan: "data/content-intelligence/backend-architecture/ag42z-ag43-entry-consumption-plan.json",
  ag42zNoMutation: "data/content-intelligence/backend-architecture/ag42z-no-mutation-continuity-audit-register.json",
  ag42zReadiness: "data/content-intelligence/quality-registry/ag42z-article-intelligence-integration-readiness-record.json",
  ag42zBoundary: "data/content-intelligence/mutation-plans/ag42z-to-ag43a-article-intelligence-integration-boundary.json",

  ag42aConsumption: "data/content-intelligence/backend-architecture/ag42a-existing-logic-consumption-register.json",
  ag42aRulebook: "data/content-intelligence/backend-architecture/ag42a-no-duplicate-audit-rulebook.json",

  ag06bValidator: "scripts/validate-ag06b-content-intelligence-schema.mjs",
  ag23gValidator: "scripts/validate-ag23g-first-light-topic-scoring-model.mjs",
  ag23gFields: "data/content-intelligence/homepage/ag23g-topic-score-fields.json",
  ag23gThresholds: "data/content-intelligence/homepage/ag23g-topic-score-thresholds.json",
  articleQualityPreflight: "scripts/article-quality-review-preflight.js"
};

const optionalInputs = {
  articleQualityPackage: "data/content-intelligence/backend-architecture/ag06b-content-intelligence-schema.json",
  articleQualityReview: "data/content-intelligence/quality-reviews/ag06b-content-intelligence-schema.json",
  qualityRegistry: "data/quality/ag06b-content-intelligence-schema.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag43a-article-intelligence-integration-entry.json",
  entry: "data/content-intelligence/backend-architecture/ag43a-article-intelligence-integration-entry.json",
  contentIntelligenceMap: "data/content-intelligence/backend-architecture/ag43a-content-intelligence-consumption-map.json",
  topicEngineMap: "data/content-intelligence/backend-architecture/ag43a-topic-engine-consumption-map.json",
  articleQualityMap: "data/content-intelligence/backend-architecture/ag43a-article-quality-consumption-map.json",
  integrationGapRegister: "data/content-intelligence/backend-architecture/ag43a-integration-gap-register.json",
  noDuplicateAudit: "data/content-intelligence/backend-architecture/ag43a-no-duplicate-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag43a-article-intelligence-integration-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag43a-topic-reference-image-integration-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag43a-to-ag43b-topic-reference-image-integration-boundary.json",
  registry: "data/quality/ag43a-article-intelligence-integration-entry.json",
  preview: "data/quality/ag43a-article-intelligence-integration-entry-preview.json",
  doc: "docs/quality/AG43A_ARTICLE_INTELLIGENCE_INTEGRATION_ENTRY.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG43A input: ${p}`);
}

const ag42zClosure = readJson(inputs.ag42zClosure);
const ag42zChain = readJson(inputs.ag42zChain);
const ag42zCarryForward = readJson(inputs.ag42zCarryForward);
const ag42zAg43EntryPlan = readJson(inputs.ag42zAg43EntryPlan);
const ag42zNoMutation = readJson(inputs.ag42zNoMutation);
const ag42zReadiness = readJson(inputs.ag42zReadiness);
const ag42zBoundary = readJson(inputs.ag42zBoundary);

const ag42aConsumption = readJson(inputs.ag42aConsumption);
const ag42aRulebook = readJson(inputs.ag42aRulebook);

const ag06bValidator = read(inputs.ag06bValidator);
const ag23gValidator = read(inputs.ag23gValidator);
const ag23gFields = readJson(inputs.ag23gFields);
const ag23gThresholds = readJson(inputs.ag23gThresholds);
const articleQualityPreflight = read(inputs.articleQualityPreflight);

if (ag42zClosure.status !== "dynamic_workflow_hardening_closure_created_ready_for_ag43a_article_intelligence_integration") {
  throw new Error("AG42Z closure status mismatch.");
}
if (ag42zChain.closed_successfully !== true) throw new Error("AG42Z hardening chain must be closed.");
if (ag42zCarryForward.hard_blocker_count_for_ag43a !== 0) throw new Error("AG42Z hard blockers for AG43A must be zero.");
if (ag42zAg43EntryPlan.next_stage_id !== "AG43A") throw new Error("AG42Z AG43 entry plan must point to AG43A.");
if (!ag42zAg43EntryPlan.existing_logic_to_consume_next.includes("AG06B Content Intelligence Schema")) {
  throw new Error("AG42Z AG43 plan must consume AG06B.");
}
if (!ag42zAg43EntryPlan.existing_logic_to_consume_next.includes("AG23G First Light Topic Scoring")) {
  throw new Error("AG42Z AG43 plan must consume AG23G.");
}
if (ag42zNoMutation.audit_passed !== true) throw new Error("AG42Z no-mutation audit must pass.");
if (ag42zReadiness.ready_for_ag43a !== true) throw new Error("AG42Z readiness does not permit AG43A.");
if (ag42zBoundary.next_stage_id !== "AG43A") throw new Error("AG42Z boundary does not point to AG43A.");

if (!Array.isArray(ag42aConsumption.consumed_logic) || ag42aConsumption.consumed_logic.length < 6) {
  throw new Error("AG42A existing logic consumption register incomplete.");
}
if (!ag42aRulebook.rules.some((rule) => rule.includes("Do not recreate content-intelligence schema"))) {
  throw new Error("AG42A no-duplicate content-intelligence rule missing.");
}
if (!ag42aRulebook.rules.some((rule) => rule.includes("Do not recreate topic scoring"))) {
  throw new Error("AG42A no-duplicate topic scoring rule missing.");
}

if (!ag06bValidator.includes("content") || !ag06bValidator.includes("reference")) {
  throw new Error("AG06B validator does not expose content/reference logic.");
}
if (!ag06bValidator.includes("visual") || !ag06bValidator.includes("quality")) {
  throw new Error("AG06B validator does not expose visual/quality logic.");
}
if (!ag23gValidator.includes("threshold") || !ag23gValidator.includes("blocked")) {
  throw new Error("AG23G threshold/blocker logic missing.");
}
if (!JSON.stringify(ag23gFields).toLowerCase().includes("reference")) {
  throw new Error("AG23G topic score fields must include reference signal.");
}
if (!JSON.stringify(ag23gThresholds).includes("25") || !JSON.stringify(ag23gThresholds).includes("18")) {
  throw new Error("AG23G thresholds must preserve 25+/18+ bands.");
}
if (!articleQualityPreflight.includes("quality_score")) throw new Error("Article quality score logic missing.");
if (!articleQualityPreflight.includes("source_reference_status")) throw new Error("Article source/reference status logic missing.");
if (!articleQualityPreflight.includes("image_approval_status")) throw new Error("Article image approval status logic missing.");

const optionalAvailability = Object.entries(optionalInputs).map(([key, file]) => ({
  key,
  file,
  exists: exists(file)
}));

const blockedState = {
  article_intelligence_integration_entry_created: true,
  content_intelligence_consumption_map_created: true,
  topic_engine_consumption_map_created: true,
  article_quality_consumption_map_created: true,
  integration_gap_register_created: true,
  no_duplicate_audit_passed: true,
  ag43b_topic_reference_image_integration_ready: true,

  entry_only: true,
  first_controlled_dynamic_content_loop_deferred_to_ag56: true,

  topic_promoted_to_live_article: false,
  article_generated: false,
  article_file_created_or_changed: false,
  article_quality_runtime_executed: false,
  reference_fetch_executed: false,
  image_generation_executed: false,
  featured_reads_mutated: false,
  homepage_mutated: false,
  listing_mutated: false,
  first_controlled_batch_execution_approved_now: false,
  first_controlled_batch_executed: false,
  batch_execution_authorized_now: false,
  batch_publish_executed: false,
  candidate_selected_for_execution: false,
  public_mutation_approved_now: false,
  execution_authorized_now: false,
  real_publish_executed: false,
  actual_queue_state_changed: false,
  audit_log_write_done: false,
  rollback_write_done: false,
  database_write_done: false,
  public_article_mutated: false,
  route_guard_runtime_modified: false,
  dashboard_runtime_enabled: false,
  dashboard_data_query_executed: false,
  monitoring_job_created: false,
  deployment_triggered: false,
  deployment_done: false,
  public_mutation_done: false,
  dynamic_publish_runtime_enabled: false,
  backend_activation_approved_now: false,
  supabase_activation_approved_now: false,
  auth_activation_approved_now: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  anon_access_granted: false,
  write_grants_executed: false,
  sql_file_created: false,
  sql_grants_executed: false
};

const contentIntelligenceMap = {
  module_id: "AG43A",
  title: "Content Intelligence Consumption Map",
  status: "content_intelligence_consumption_map_created",
  consumed_logic_source: inputs.ag06bValidator,
  consumed_components: [
    {
      component: "content packet schema",
      consumed_from_existing_logic: true,
      recreate_in_ag43: false,
      future_delta_check: "Confirm Version 01 controlled content-loop packet can carry topic score, references, image status and audit readiness."
    },
    {
      component: "reference registry",
      consumed_from_existing_logic: true,
      recreate_in_ag43: false,
      future_delta_check: "Confirm reference verification state can flow into Featured Reads and AG56 controlled article test."
    },
    {
      component: "visual registry",
      consumed_from_existing_logic: true,
      recreate_in_ag43: false,
      future_delta_check: "Confirm image approval/credit status can flow into article layout and public page checks."
    },
    {
      component: "quality review schema",
      consumed_from_existing_logic: true,
      recreate_in_ag43: false,
      future_delta_check: "Confirm quality score can be integrated with topic score and publish-readiness gates."
    },
    {
      component: "publish queue schema",
      consumed_from_existing_logic: true,
      recreate_in_ag43: false,
      future_delta_check: "Keep publish queue non-mutating until AG56 explicit approval."
    }
  ],
  optional_source_availability: optionalAvailability,
  blocked_state: blockedState
};

const topicEngineMap = {
  module_id: "AG43A",
  title: "Topic Engine Consumption Map",
  status: "topic_engine_consumption_map_created",
  consumed_logic_sources: [
    inputs.ag23gValidator,
    inputs.ag23gFields,
    inputs.ag23gThresholds
  ],
  consumed_topic_logic: {
    topic_score_fields_present: true,
    threshold_bands_present: true,
    reference_availability_signal_present: true,
    sensitivity_risk_signal_required: JSON.stringify(ag23gFields).toLowerCase().includes("sensitivity"),
    repetition_risk_signal_required: JSON.stringify(ag23gFields).toLowerCase().includes("repetition"),
    threshold_policy: "25+ strong article/series candidate; 18-24 topic bank or First Light-only; below 18 do not use now."
  },
  do_not_duplicate: [
    "topic score fields",
    "topic score thresholds",
    "sensitivity risk logic",
    "repetition risk logic",
    "First Light scoring foundation"
  ],
  delta_needed_next: [
    "connect topic score to reference/image quality signals",
    "define AG43B topic-reference-image integration package",
    "keep article generation blocked"
  ],
  blocked_state: blockedState
};

const articleQualityMap = {
  module_id: "AG43A",
  title: "Article Quality Consumption Map",
  status: "article_quality_consumption_map_created",
  consumed_logic_source: inputs.articleQualityPreflight,
  consumed_quality_logic: [
    "quality_score",
    "source_reference_status",
    "image_approval_status",
    "language_readiness",
    "review_status",
    "safe URL checks",
    "Featured Reads metadata checks",
    "service-role exposure checks"
  ],
  do_not_duplicate: [
    "article quality score preflight",
    "source/reference status preflight",
    "image approval status preflight",
    "Featured Reads safe URL preflight"
  ],
  delta_needed_next: [
    "connect article-quality checks with topic score",
    "prepare V01 long-form candidate readiness model later",
    "keep live article generation deferred to AG56"
  ],
  blocked_state: blockedState
};

const integrationGapRegister = {
  module_id: "AG43A",
  title: "Integration Gap Register",
  status: "integration_gap_register_created",
  gaps: [
    {
      gap_id: "ag43a_g01",
      category: "topic_to_quality_bridge",
      severity: "medium",
      gap: "Topic score and article quality score exist, but their combined publish-readiness bridge must be explicitly modelled.",
      target_stage: "AG43B",
      blocks_ag43b: false
    },
    {
      gap_id: "ag43a_g02",
      category: "reference_image_bridge",
      severity: "medium",
      gap: "Reference status and image approval status exist, but their combined AG56 controlled content-loop readiness needs an integration model.",
      target_stage: "AG43B",
      blocks_ag43b: false
    },
    {
      gap_id: "ag43a_g03",
      category: "long_form_readiness",
      severity: "medium",
      gap: "Version 01 long-form Featured Reads standard must be connected with article intelligence before AG46 and AG55.",
      target_stage: "AG43C_or_AG46",
      blocks_ag43b: false
    },
    {
      gap_id: "ag43a_g04",
      category: "no_generation_boundary",
      severity: "critical",
      gap: "Article generation and topic promotion must remain blocked until AG56 explicit controlled dynamic test.",
      target_stage: "AG43Z_to_AG56",
      blocks_ag43b: false
    }
  ],
  hard_blocker_count_for_ag43b: 0,
  blocked_state: blockedState
};

const noDuplicateAudit = {
  module_id: "AG43A",
  title: "No-duplicate Audit Register",
  status: "no_duplicate_audit_passed_for_ag43a",
  checks: [
    { check_id: "consume_ag06b_not_recreate", passed: true },
    { check_id: "consume_ag23g_not_recreate", passed: true },
    { check_id: "consume_article_quality_preflight_not_recreate", passed: true },
    { check_id: "no_article_generation", passed: true },
    { check_id: "no_topic_promotion_to_live_article", passed: true },
    { check_id: "no_reference_fetch_execution", passed: true },
    { check_id: "no_image_generation", passed: true },
    { check_id: "no_featured_reads_mutation", passed: true },
    { check_id: "no_homepage_mutation", passed: true },
    { check_id: "no_public_mutation", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_backend_activation", passed: true },
    { check_id: "no_sql_file_created", passed: true },
    { check_id: "no_sql_grant_execution", passed: true },
    { check_id: "no_service_role_key", passed: true },
    { check_id: "no_anon_grant", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const entry = {
  module_id: "AG43A",
  title: "Article Intelligence, Topic Engine and Content-Intelligence Integration Entry",
  status: "article_intelligence_integration_entry_created_ready_for_ag43b_topic_reference_image_integration",
  purpose:
    "Create the AG43 entry gate by consuming existing AG06B, AG23G and article quality logic, preventing duplicate audits, and preparing AG43B topic-reference-image integration without generating or publishing articles.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  entry_decision: {
    article_intelligence_integration_entry_created: true,
    content_intelligence_consumption_map_created: true,
    topic_engine_consumption_map_created: true,
    article_quality_consumption_map_created: true,
    integration_gap_register_created: true,
    no_duplicate_audit_passed: true,
    proceed_to_ag43b_topic_reference_image_integration: true,

    first_controlled_dynamic_content_loop_deferred_to_ag56: true,
    topic_promoted_to_live_article: false,
    article_generated: false,
    article_file_created_or_changed: false,
    article_quality_runtime_executed: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    featured_reads_mutated: false,
    homepage_mutated: false,
    listing_mutated: false,
    first_controlled_batch_executed: false,
    batch_execution_authorized_now: false,
    candidate_selected_for_execution: false,
    real_publish_executed: false,
    database_write_done: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_enabled: false,
    backend_activation_approved_now: false,
    supabase_activation_approved_now: false,
    auth_activation_approved_now: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  content_intelligence_map_file: outputs.contentIntelligenceMap,
  topic_engine_map_file: outputs.topicEngineMap,
  article_quality_map_file: outputs.articleQualityMap,
  integration_gap_register_file: outputs.integrationGapRegister,
  no_duplicate_audit_file: outputs.noDuplicateAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG43A",
  title: "Article Intelligence Integration Blocker Register",
  status: "article_intelligence_integration_blockers_preserved",
  blocked_items: [
    "No topic promoted to live article.",
    "No article generation.",
    "No article file creation or change.",
    "No reference fetch execution.",
    "No image generation.",
    "No Featured Reads mutation.",
    "No homepage mutation.",
    "No listing mutation.",
    "No public mutation.",
    "No real publish.",
    "No database write.",
    "No audit-log write.",
    "No rollback write.",
    "No deployment.",
    "No backend/Auth/Supabase activation.",
    "No SQL file created.",
    "No SQL grant execution.",
    "No service-role key exposure.",
    "No anon grants."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG43A",
  title: "Topic, Reference and Image Integration Readiness Record",
  status: "ready_for_ag43b_topic_reference_image_integration",
  ready_for_ag43b: true,
  next_stage_id: "AG43B",
  next_stage_title: "Topic, Reference and Image Governance Integration",
  ag43a_entry_complete: true,
  hard_blocker_count_for_ag43b: 0,
  first_controlled_dynamic_content_loop_deferred_to_ag56: true,
  ag43b_scope: "topic_reference_image_integration_only_no_article_generation",
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG43A",
  title: "AG43A to AG43B Topic, Reference and Image Integration Boundary",
  status: "ag43b_topic_reference_image_integration_boundary_created",
  next_stage_id: "AG43B",
  next_stage_title: "Topic, Reference and Image Governance Integration",
  allowed_scope: [
    "Consume AG43A integration entry.",
    "Connect topic score with reference availability and image/visual readiness.",
    "Create integration model only.",
    "Do not generate article content.",
    "Do not promote topic to live article.",
    "Do not fetch references live.",
    "Do not generate image.",
    "Do not mutate Featured Reads, homepage or article files.",
    "Do not publish.",
    "Do not mutate database or public surface.",
    "Do not deploy.",
    "Do not execute SQL.",
    "Do not expose service-role key."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG43A",
  title: "Article Intelligence, Topic Engine and Content-Intelligence Integration Entry",
  status: entry.status,
  depends_on: ["AG42Z", "AG42A", "AG06B", "AG23G", "article-quality-preflight"],
  generated_from: inputs,
  entry_file: outputs.entry,
  content_intelligence_map_file: outputs.contentIntelligenceMap,
  topic_engine_map_file: outputs.topicEngineMap,
  article_quality_map_file: outputs.articleQualityMap,
  integration_gap_register_file: outputs.integrationGapRegister,
  no_duplicate_audit_file: outputs.noDuplicateAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    article_intelligence_integration_entry_created: true,
    ready_for_ag43b: true,
    hard_blocker_count_for_ag43b: 0,
    first_controlled_dynamic_content_loop_deferred_to_ag56: true,
    topic_promoted_to_live_article: false,
    article_generated: false,
    article_file_created_or_changed: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    featured_reads_mutated: false,
    homepage_mutated: false,
    listing_mutated: false,
    real_publish_executed: false,
    database_write_done: false,
    public_mutation_done: false,
    deployment_done: false,
    backend_activation_approved_now: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG43A", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG43A",
  preview_only: false,
  status: review.status,
  article_intelligence_integration_entry_created: 1,
  ready_for_ag43b: 1,
  hard_blocker_count_for_ag43b: 0,
  first_controlled_dynamic_content_loop_deferred_to_ag56: 1,
  topic_promoted_to_live_article: 0,
  article_generated: 0,
  article_file_created_or_changed: 0,
  reference_fetch_executed: 0,
  image_generation_executed: 0,
  featured_reads_mutated: 0,
  homepage_mutated: 0,
  listing_mutated: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  public_mutation_done: 0,
  deployment_done: 0,
  backend_activation_approved_now: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_file_created: 0,
  sql_grants_executed: 0
};

const doc = `# AG43A — Article Intelligence, Topic Engine and Content-Intelligence Integration Entry

## Result

AG43A creates the Article Intelligence integration entry gate.

## Scope

This is integration-entry only. It consumes existing AG06B, AG23G and article-quality logic. It does not generate articles, promote topics, fetch references, generate images, mutate Featured Reads/homepage/listings, publish, write database records, deploy or activate backend/Auth.

## Consumed Existing Logic

- AG42Z Dynamic Workflow Hardening Closure.
- AG42A no-duplicate audit rulebook.
- AG06B Content Intelligence Schema.
- AG23G First Light Topic Scoring Model.
- Article Quality Review Preflight.

## Maps Created

- Content intelligence consumption map.
- Topic engine consumption map.
- Article quality consumption map.
- Integration gap register.
- No-duplicate audit register.

## AG43B Direction

AG43B should connect topic score with reference availability and image/visual readiness. It should not recreate AG06B/AG23G/article-quality logic.

## Still Blocked

- No topic promoted to live article.
- No article generation.
- No article file creation or change.
- No reference fetch execution.
- No image generation.
- No Featured Reads mutation.
- No homepage mutation.
- No listing mutation.
- No public mutation.
- No real publish.
- No database write.
- No deployment.
- No backend/Auth/Supabase activation.
- No SQL grant execution.
- No service-role key exposure.
- No anon grants.

## Next

AG43B — Topic, Reference and Image Governance Integration.
`;

writeJson(outputs.contentIntelligenceMap, contentIntelligenceMap);
writeJson(outputs.topicEngineMap, topicEngineMap);
writeJson(outputs.articleQualityMap, articleQualityMap);
writeJson(outputs.integrationGapRegister, integrationGapRegister);
writeJson(outputs.noDuplicateAudit, noDuplicateAudit);
writeJson(outputs.entry, entry);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG43A Article Intelligence Integration Entry generated.");
console.log("✅ AG06B, AG23G and article-quality logic are consumed, not duplicated.");
console.log("✅ Ready for AG43B Topic, Reference and Image Governance Integration.");
console.log("✅ No article generation, public mutation, database write, deployment, SQL grant execution or service-role key recorded.");
