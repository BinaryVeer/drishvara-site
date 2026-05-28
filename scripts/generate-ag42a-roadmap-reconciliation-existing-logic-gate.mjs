import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag41zClosure: "data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-closure.json",
  ag41zChain: "data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-chain-register.json",
  ag41zSummary: "data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-summary-record.json",
  ag41zDecisionReadiness: "data/content-intelligence/backend-architecture/ag41z-first-controlled-batch-decision-readiness-record.json",
  ag41zReadiness: "data/content-intelligence/quality-registry/ag41z-first-controlled-batch-decision-readiness-record.json",
  ag41zBoundary: "data/content-intelligence/mutation-plans/ag41z-to-ag42a-first-controlled-batch-decision-boundary.json",

  ag06bValidator: "scripts/validate-ag06b-content-intelligence-schema.mjs",
  ag23gValidator: "scripts/validate-ag23g-first-light-topic-scoring-model.mjs",
  ag23gFields: "data/content-intelligence/homepage/ag23g-topic-score-fields.json",
  ag23gThresholds: "data/content-intelligence/homepage/ag23g-topic-score-thresholds.json",
  articleQualityPreflight: "scripts/article-quality-review-preflight.js",
  wordOfDayPreflight: "scripts/word-of-day-bank-preflight.js",
  panchangPreflight: "scripts/panchang-festival-source-validation-preflight.js",
  subscriberPreflight: "scripts/subscriber-guidance-personalization-preflight.js",
  ag27aValidator: "scripts/validate-ag27a-backend-need-assessment.mjs",
  ag40zClosure: "data/content-intelligence/backend-architecture/ag40z-dynamic-stabilisation-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag42a-roadmap-reconciliation-existing-logic-gate.json",
  gate: "data/content-intelligence/backend-architecture/ag42a-roadmap-reconciliation-existing-logic-gate.json",
  consumptionRegister: "data/content-intelligence/backend-architecture/ag42a-existing-logic-consumption-register.json",
  supersessionRecord: "data/content-intelligence/backend-architecture/ag42a-ag41z-boundary-supersession-record.json",
  noDuplicateRulebook: "data/content-intelligence/backend-architecture/ag42a-no-duplicate-audit-rulebook.json",
  hardeningEntryPlan: "data/content-intelligence/backend-architecture/ag42a-delta-hardening-entry-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag42a-roadmap-reconciliation-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag42a-workflow-defect-review-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag42a-to-ag42b-workflow-defect-review-boundary.json",
  registry: "data/quality/ag42a-roadmap-reconciliation-existing-logic-gate.json",
  preview: "data/quality/ag42a-roadmap-reconciliation-existing-logic-gate-preview.json",
  doc: "docs/quality/AG42A_ROADMAP_RECONCILIATION_EXISTING_LOGIC_GATE.md"
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
  if (!exists(p)) throw new Error(`Missing AG42A input: ${p}`);
}

const ag41zClosure = readJson(inputs.ag41zClosure);
const ag41zChain = readJson(inputs.ag41zChain);
const ag41zDecisionReadiness = readJson(inputs.ag41zDecisionReadiness);
const ag41zReadiness = readJson(inputs.ag41zReadiness);
const ag41zBoundary = readJson(inputs.ag41zBoundary);
const ag40zClosure = readJson(inputs.ag40zClosure);

if (ag41zClosure.status !== "dynamic_publishing_closure_created_ready_for_ag42a_first_controlled_batch_decision") {
  throw new Error("AG41Z closure status mismatch.");
}
if (ag41zChain.closed_successfully !== true) throw new Error("AG41Z chain must be closed.");
if (ag41zDecisionReadiness.ready_for_ag42a !== true) throw new Error("AG41Z decision readiness must permit AG42A.");
if (ag41zReadiness.ready_for_ag42a !== true) throw new Error("AG41Z quality readiness must permit AG42A.");
if (ag41zBoundary.next_stage_id !== "AG42A") throw new Error("AG41Z boundary must point to AG42A.");
if (ag40zClosure.status !== "dynamic_stabilisation_closure_created_ready_for_ag41a_sop") {
  throw new Error("AG40Z closure status mismatch.");
}

const ag06b = read(inputs.ag06bValidator);
const ag23g = read(inputs.ag23gValidator);
const ag23gFields = readJson(inputs.ag23gFields);
const ag23gThresholds = readJson(inputs.ag23gThresholds);
const articleQuality = read(inputs.articleQualityPreflight);
const wordPreflight = read(inputs.wordOfDayPreflight);
const panchangPreflight = read(inputs.panchangPreflight);
const subscriberPreflight = read(inputs.subscriberPreflight);
const ag27a = read(inputs.ag27aValidator);

if (!ag06b.includes("reference registry") && !ag06b.includes("reference_registry")) throw new Error("AG06B reference/content intelligence signal missing.");
if (!ag23g.includes("threshold") || !ag23g.includes("blocked")) throw new Error("AG23G topic scoring threshold/blocker logic missing.");
if (!ag23gFields.fields && !Array.isArray(ag23gFields)) throw new Error("AG23G score fields not readable.");
if (!ag23gThresholds.thresholds && !Array.isArray(ag23gThresholds)) throw new Error("AG23G thresholds not readable.");
if (!articleQuality.includes("quality_score")) throw new Error("Article quality score check missing.");
if (!articleQuality.includes("source_reference_status")) throw new Error("Article source/reference status check missing.");
if (!wordPreflight.includes("public dynamic output") && !wordPreflight.includes("public_dynamic_output")) throw new Error("Word of Day dynamic-output guard missing.");
if (!panchangPreflight.includes("panchang") && !panchangPreflight.includes("Panchang")) throw new Error("Panchang guard missing.");
if (!subscriberPreflight.includes("Subscriber guidance remains disabled")) throw new Error("Subscriber guidance disabled guard missing.");
if (!ag27a.includes("backend_activation_should_start_now") || !ag27a.includes("must not start")) throw new Error("AG27A backend deferral guard missing.");

const blockedState = {
  roadmap_reconciliation_created: true,
  existing_logic_consumption_gate_created: true,
  ag41z_first_controlled_batch_boundary_acknowledged: true,
  first_controlled_dynamic_content_loop_deferred_to_ag56: true,
  no_duplicate_audit_rulebook_created: true,
  workflow_defect_review_ready: true,

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
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_enabled: false,
  dashboard_runtime_enabled: false,
  dashboard_data_query_executed: false,
  monitoring_job_created: false,
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

const consumptionRegister = {
  module_id: "AG42A",
  title: "Existing Logic Consumption Register",
  status: "existing_logic_consumption_register_created",
  principle: "AG42-AG56 must consume existing repo logic and add only delta/cross-module/release-readiness checks.",
  consumed_logic: [
    {
      stream: "AG06B Content Intelligence Schema",
      source_files: [inputs.ag06bValidator],
      consumed_for: ["AG43", "AG46", "AG55"],
      do_not_duplicate: [
        "content packet schema",
        "reference registry",
        "visual registry",
        "quality review schema",
        "publish queue schema"
      ],
      delta_needed_later: [
        "cross-module release integration",
        "Version 01 final inventory reconciliation"
      ]
    },
    {
      stream: "AG23G First Light Topic Scoring",
      source_files: [inputs.ag23gValidator, inputs.ag23gFields, inputs.ag23gThresholds],
      consumed_for: ["AG43", "AG44", "AG45", "AG56"],
      do_not_duplicate: [
        "topic score fields",
        "threshold bands",
        "sensitivity/repetition risk logic"
      ],
      delta_needed_later: [
        "connect topic scoring to V01 controlled content loop",
        "homepage signal-to-read-surface mapping"
      ]
    },
    {
      stream: "Article Quality Review Preflight",
      source_files: [inputs.articleQualityPreflight],
      consumed_for: ["AG43", "AG46", "AG55", "AG56"],
      do_not_duplicate: [
        "quality_score",
        "source_reference_status",
        "image approval status",
        "safe URL checks",
        "Featured Reads metadata checks"
      ],
      delta_needed_later: [
        "long-form V01 article readiness package",
        "controlled article candidate final checklist"
      ]
    },
    {
      stream: "D02 Word of the Day",
      source_files: [inputs.wordOfDayPreflight],
      consumed_for: ["AG48", "AG55", "AG56"],
      do_not_duplicate: [
        "word bank",
        "rotation policy",
        "multilingual word fields",
        "runtime/Supabase/Auth disabled guards"
      ],
      delta_needed_later: [
        "homepage Discover/Reflect integration",
        "AG56 smoke-test visibility"
      ]
    },
    {
      stream: "D05 Panchang/Festival Source Validation",
      source_files: [inputs.panchangPreflight],
      consumed_for: ["AG47", "AG55", "AG56"],
      do_not_duplicate: [
        "source registry",
        "observance registry",
        "validation preview",
        "live calculation/API/Supabase disabled guards"
      ],
      delta_needed_later: [
        "V01 public preview boundary",
        "homepage Discover integration"
      ]
    },
    {
      stream: "D07 Subscriber Guidance and Personalization",
      source_files: [inputs.subscriberPreflight],
      consumed_for: ["AG49", "AG50", "AG52", "AG55"],
      do_not_duplicate: [
        "scaffold-only subscriber schema",
        "consent control",
        "synthetic preview-only rule",
        "birth context/profile storage disabled guard"
      ],
      delta_needed_later: [
        "V01 personalisation deferral register",
        "psychometric scaffold privacy boundary"
      ]
    },
    {
      stream: "AG27A Backend Need Assessment",
      source_files: [inputs.ag27aValidator],
      consumed_for: ["AG49", "AG52", "AG55", "AG56"],
      do_not_duplicate: [
        "backend future-need signal",
        "static/GitHub path sufficient for current stage",
        "backend/Supabase/Auth/secrets/database/deployment blocked guards"
      ],
      delta_needed_later: [
        "release-stage reminder",
        "explicit approval gate before any backend activation"
      ]
    },
    {
      stream: "AG40-AG41 Dynamic Publishing Planning",
      source_files: [inputs.ag40zClosure, inputs.ag41zClosure],
      consumed_for: ["AG42", "AG55", "AG56"],
      do_not_duplicate: [
        "live smoke chain",
        "dynamic publishing SOP",
        "batch plan",
        "monitoring dashboard plan",
        "dynamic SOP audit"
      ],
      delta_needed_later: [
        "workflow hardening",
        "defect review",
        "roadmap supersession from first batch decision to AG56 controlled content loop"
      ]
    }
  ],
  blocked_state: blockedState
};

const supersessionRecord = {
  module_id: "AG42A",
  title: "AG41Z Boundary Supersession Record",
  status: "ag41z_first_controlled_batch_boundary_superseded_by_ag42_hardening_plan",
  original_ag41z_next_boundary: {
    next_stage_id: ag41zBoundary.next_stage_id,
    original_intent: "First Controlled Batch Decision Checkpoint",
    original_readiness_file: inputs.ag41zReadiness
  },
  corrected_roadmap_position: {
    AG42: "Dynamic Publishing Stabilisation and Hardening",
    AG43: "Article Intelligence, Topic Engine and Content-Intelligence Integration",
    AG44: "Episodic Knowledge Engine Activation",
    AG45: "Homepage Daily Surface and First Light Activation",
    AG46: "Featured Reads and Long-form Production Strengthening",
    AG47: "Panchang, Festival and Vedic Guidance Implementation Readiness",
    AG48: "Word of the Day and Reflection Implementation Readiness",
    AG49: "User Accounts and Personalisation Readiness",
    AG50: "Psychometric and Assessment Product Governance Scaffold",
    AG51: "Analytics, Monitoring and Editorial Dashboard Planning",
    AG52: "Security, Privacy, Source, Legal and Compliance Hardening",
    AG53: "Performance, SEO, Accessibility and Mobile QA",
    AG54: "Backup, Rollback, Migration and Release Operations",
    AG55: "Version 01 Release Candidate Freeze, Completed-Stack Reconciliation and Final Audit",
    AG56: "Version 01 Controlled Dynamic Content Loop Test and Go-Live"
  },
  supersession_decision: {
    first_controlled_batch_decision_not_executed_now: true,
    first_controlled_dynamic_content_loop_deferred_to_ag56: true,
    ag42_reframed_as_stabilisation_and_hardening: true,
    ag42a_records_reconciliation_only: true,
    ag41z_files_not_mutated_by_this_supersession: true
  },
  blocked_state: blockedState
};

const noDuplicateRulebook = {
  module_id: "AG42A",
  title: "No-duplicate Audit Rulebook",
  status: "no_duplicate_audit_rulebook_created",
  rules: [
    "Do not recreate topic scoring already present in AG23G; consume and integrate it.",
    "Do not recreate content-intelligence schema already present in AG06B; consume and reconcile it.",
    "Do not recreate article quality preflight; add only V01 long-form and controlled-loop delta checks.",
    "Do not recreate Word of the Day bank; validate integration and visibility only.",
    "Do not recreate Panchang/festival source validation; validate public-preview boundary and homepage integration only.",
    "Do not activate subscriber personalisation; consume D07 scaffold and preserve consent/privacy gates.",
    "Do not reopen backend activation; consume AG27A and preserve explicit approval gate.",
    "Do not move controlled dynamic live test before AG56.",
    "AG42-AG55 must be integration/hardening/audit/freeze stages only."
  ],
  blocked_state: blockedState
};

const hardeningEntryPlan = {
  module_id: "AG42A",
  title: "Delta Hardening Entry Plan",
  status: "delta_hardening_entry_plan_created_ready_for_ag42b",
  ag42_sequence: [
    {
      stage_id: "AG42A",
      title: "Roadmap Reconciliation and Existing-Logic Consumption Gate",
      purpose: "Reconcile old AG41Z first-batch boundary and consume existing repo logic.",
      mutation_allowed: false
    },
    {
      stage_id: "AG42B",
      title: "Workflow Defect Review",
      purpose: "Review Admin/Editor/publish route defects and workflow hardening gaps.",
      mutation_allowed: false
    },
    {
      stage_id: "AG42C",
      title: "Failed Publish and Rollback Dry-run",
      purpose: "Simulate failed publish and rollback behaviour without writes.",
      mutation_allowed: false
    },
    {
      stage_id: "AG42D",
      title: "Admin/Editor Permission and Audit-log Stress Review",
      purpose: "Stress role boundaries and audit completeness.",
      mutation_allowed: false
    },
    {
      stage_id: "AG42Z",
      title: "Dynamic Workflow Hardening Closure",
      purpose: "Close dynamic publishing hardening and prepare AG43.",
      mutation_allowed: false
    }
  ],
  next_stage_id: "AG42B",
  blocked_state: blockedState
};

const gate = {
  module_id: "AG42A",
  title: "Roadmap Reconciliation and Existing-Logic Consumption Gate",
  status: "roadmap_reconciliation_existing_logic_gate_created_ready_for_ag42b",
  purpose:
    "Reconcile the AG41Z first-controlled-batch boundary with the revised AG42-AG56 roadmap, consume existing repo logic, and prevent duplicate audits before dynamic workflow hardening.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  gate_decision: {
    roadmap_reconciliation_created: true,
    ag41z_first_controlled_batch_boundary_acknowledged: true,
    first_controlled_dynamic_content_loop_deferred_to_ag56: true,
    existing_logic_consumption_gate_created: true,
    no_duplicate_audit_rulebook_created: true,
    proceed_to_ag42b_workflow_defect_review: true,

    first_controlled_batch_execution_approved_now: false,
    first_controlled_batch_executed: false,
    batch_execution_authorized_now: false,
    batch_publish_executed: false,
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
  consumption_register_file: outputs.consumptionRegister,
  supersession_record_file: outputs.supersessionRecord,
  no_duplicate_rulebook_file: outputs.noDuplicateRulebook,
  hardening_entry_plan_file: outputs.hardeningEntryPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG42A",
  title: "Roadmap Reconciliation Blocker Register",
  status: "roadmap_reconciliation_blockers_preserved",
  blocked_items: [
    "No first controlled batch execution.",
    "No candidate selected for execution.",
    "No batch execution.",
    "No public mutation.",
    "No real publish.",
    "No queue-state write.",
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
  module_id: "AG42A",
  title: "Workflow Defect Review Readiness Record",
  status: "ready_for_ag42b_workflow_defect_review",
  ready_for_ag42b: true,
  next_stage_id: "AG42B",
  next_stage_title: "Workflow Defect Review",
  ag42a_reconciliation_complete: true,
  first_controlled_dynamic_content_loop_deferred_to_ag56: true,
  existing_logic_consumption_required_for_ag42_to_ag56: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG42A",
  title: "AG42A to AG42B Workflow Defect Review Boundary",
  status: "ag42b_workflow_defect_review_boundary_created",
  next_stage_id: "AG42B",
  next_stage_title: "Workflow Defect Review",
  allowed_scope: [
    "Consume AG42A reconciliation gate.",
    "Review Admin/Editor/publish workflow defects.",
    "Review hardening gaps only.",
    "Do not execute first controlled batch.",
    "Do not generate or publish article.",
    "Do not mutate database or public surface.",
    "Do not deploy.",
    "Do not execute SQL.",
    "Do not expose service-role key."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG42A",
  title: "Roadmap Reconciliation and Existing-Logic Consumption Gate",
  status: gate.status,
  depends_on: ["AG41Z", "AG40Z", "AG06B", "AG23G", "D02", "D05", "D07", "AG27A"],
  generated_from: inputs,
  gate_file: outputs.gate,
  consumption_register_file: outputs.consumptionRegister,
  supersession_record_file: outputs.supersessionRecord,
  no_duplicate_rulebook_file: outputs.noDuplicateRulebook,
  hardening_entry_plan_file: outputs.hardeningEntryPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    roadmap_reconciliation_created: true,
    ready_for_ag42b: true,
    first_controlled_dynamic_content_loop_deferred_to_ag56: true,
    existing_logic_consumption_gate_created: true,
    first_controlled_batch_executed: false,
    batch_execution_authorized_now: false,
    candidate_selected_for_execution: false,
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

const registry = { module_id: "AG42A", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG42A",
  preview_only: false,
  status: review.status,
  roadmap_reconciliation_created: 1,
  ready_for_ag42b: 1,
  first_controlled_dynamic_content_loop_deferred_to_ag56: 1,
  existing_logic_consumption_gate_created: 1,
  first_controlled_batch_executed: 0,
  batch_execution_authorized_now: 0,
  candidate_selected_for_execution: 0,
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

const doc = `# AG42A — Roadmap Reconciliation and Existing-Logic Consumption Gate

## Result

AG42A creates the roadmap reconciliation gate.

## Key Decision

The older AG41Z boundary pointing to a First Controlled Batch Decision is acknowledged, but the controlled dynamic content-loop test is deferred to AG56.

## Corrected AG42 Position

AG42 is now Dynamic Publishing Stabilisation and Hardening.

## Existing Logic to Consume

- AG06B Content Intelligence Schema.
- AG23G First Light Topic Scoring.
- Article Quality Review Preflight.
- D02 Word of the Day.
- D05 Panchang/Festival Source Validation.
- D07 Subscriber Guidance and Personalisation Scaffold.
- AG27A Backend Need Assessment.
- AG40/AG41 Dynamic Publishing Planning.

## Rule

Do not duplicate existing validators. Add only delta, cross-module, hardening and release-readiness checks.

## Still Blocked

- No first controlled batch execution.
- No candidate selected for execution.
- No batch execution.
- No public mutation.
- No real publish.
- No database write.
- No audit-log write.
- No rollback write.
- No deployment.
- No backend/Auth/Supabase activation.
- No SQL grant execution.
- No service-role key exposure.
- No anon grants.

## Next

AG42B — Workflow Defect Review.
`;

writeJson(outputs.consumptionRegister, consumptionRegister);
writeJson(outputs.supersessionRecord, supersessionRecord);
writeJson(outputs.noDuplicateRulebook, noDuplicateRulebook);
writeJson(outputs.hardeningEntryPlan, hardeningEntryPlan);
writeJson(outputs.gate, gate);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG42A Roadmap Reconciliation and Existing-Logic Consumption Gate generated.");
console.log("✅ AG41Z first-controlled-batch boundary acknowledged and superseded by AG42 hardening roadmap.");
console.log("✅ First controlled dynamic content-loop test deferred to AG56.");
console.log("✅ Existing repo logic consumption register and no-duplicate audit rulebook created.");
console.log("✅ Ready for AG42B Workflow Defect Review.");
console.log("✅ No first controlled batch execution, public mutation, real publish, database write, deployment, SQL grant execution or service-role key recorded.");
