import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag40zClosure: "data/content-intelligence/backend-architecture/ag40z-dynamic-stabilisation-closure.json",
  ag40zChain: "data/content-intelligence/backend-architecture/ag40z-live-smoke-test-chain-register.json",
  ag40zSummary: "data/content-intelligence/backend-architecture/ag40z-stabilisation-summary-record.json",
  ag40zSopReadiness: "data/content-intelligence/backend-architecture/ag40z-dynamic-publishing-sop-readiness-record.json",
  ag40zReadiness: "data/content-intelligence/quality-registry/ag40z-dynamic-publishing-sop-readiness-record.json",
  ag40zBoundary: "data/content-intelligence/mutation-plans/ag40z-to-ag41a-dynamic-publishing-sop-boundary.json",
  ag39zClosure: "data/content-intelligence/backend-architecture/ag39z-controlled-execution-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag41a-dynamic-publishing-sop.json",
  sop: "data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json",
  roleGateModel: "data/content-intelligence/backend-architecture/ag41a-role-gate-model.json",
  workflowSop: "data/content-intelligence/backend-architecture/ag41a-publishing-workflow-sop.json",
  auditRollbackSop: "data/content-intelligence/backend-architecture/ag41a-audit-rollback-sop.json",
  securitySop: "data/content-intelligence/backend-architecture/ag41a-security-and-grant-sop.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag41a-no-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag41a-dynamic-publishing-sop-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag41a-batch-dynamic-publishing-plan-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag41a-to-ag41b-batch-dynamic-publishing-plan-boundary.json",
  registry: "data/quality/ag41a-dynamic-publishing-sop.json",
  preview: "data/quality/ag41a-dynamic-publishing-sop-preview.json",
  doc: "docs/quality/AG41A_DYNAMIC_PUBLISHING_SOP.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG41A input: ${p}`);
}

const r = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (r.ag40zClosure.status !== "dynamic_stabilisation_closure_created_ready_for_ag41a_sop") throw new Error("AG40Z closure status mismatch.");
if (r.ag40zChain.closed_successfully !== true) throw new Error("AG40 chain must be closed successfully.");
if (r.ag40zSopReadiness.ready_for_ag41a !== true) throw new Error("AG40Z SOP readiness must be true.");
if (r.ag40zReadiness.ready_for_ag41a !== true) throw new Error("AG40Z readiness does not permit AG41A.");
if (r.ag40zBoundary.next_stage_id !== "AG41A") throw new Error("AG40Z boundary does not point to AG41A.");
if (r.ag39zClosure.status !== "controlled_execution_closure_created_ready_for_ag40a_live_article_url_test") throw new Error("AG39Z closure status mismatch.");

const blockedState = {
  dynamic_publishing_sop_created: true,
  role_gate_model_created: true,
  publishing_workflow_sop_created: true,
  audit_rollback_sop_created: true,
  security_grant_sop_created: true,
  batch_dynamic_publishing_plan_ready: true,

  login_form_submitted: false,
  credentials_used: false,
  session_created: false,
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
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  anon_access_granted: false,
  write_grants_executed: false,
  sql_file_created: false,
  sql_grants_executed: false
};

const roleGateModel = {
  module_id: "AG41A",
  title: "Dynamic Publishing Role and Gate Model",
  status: "role_gate_model_created",
  role_model: {
    admin: [
      "assign article to editor",
      "review editor-submitted article",
      "approve publish only after checklist completion",
      "trigger controlled publish only in approved future execution stage",
      "verify public URL and listing after publish",
      "initiate rollback if audit fails"
    ],
    editor: [
      "work only on assigned articles",
      "submit article for admin review",
      "cannot approve publish",
      "cannot trigger public mutation",
      "cannot deploy",
      "cannot access service-role keys"
    ]
  },
  mandatory_gates: [
    "target article confirmation",
    "editor submission gate",
    "admin review gate",
    "reference/image attribution check",
    "audit-log requirement",
    "rollback readiness",
    "public listing verification",
    "post-publish stabilisation check"
  ],
  blocked_state: blockedState
};

const workflowSop = {
  module_id: "AG41A",
  title: "Dynamic Publishing Workflow SOP",
  status: "publishing_workflow_sop_created",
  workflow_sequence: [
    {
      step_id: "01_draft_or_import",
      owner: "editor/admin",
      output: "draft article record",
      mutation_allowed_in_ag41a: false
    },
    {
      step_id: "02_editor_submit",
      owner: "editor",
      output: "editor submitted status",
      mutation_allowed_in_ag41a: false
    },
    {
      step_id: "03_admin_review",
      owner: "admin",
      output: "admin review decision",
      mutation_allowed_in_ag41a: false
    },
    {
      step_id: "04_publish_approval",
      owner: "admin",
      output: "publish approved decision",
      mutation_allowed_in_ag41a: false
    },
    {
      step_id: "05_controlled_publish_execution",
      owner: "admin/system",
      output: "future controlled publish only after explicit approval",
      mutation_allowed_in_ag41a: false
    },
    {
      step_id: "06_public_url_and_listing_verification",
      owner: "admin/system",
      output: "live verification record",
      mutation_allowed_in_ag41a: false
    }
  ],
  ag41a_position: "SOP only; no workflow mutation is executed.",
  blocked_state: blockedState
};

const auditRollbackSop = {
  module_id: "AG41A",
  title: "Audit and Rollback SOP",
  status: "audit_rollback_sop_created",
  audit_requirements: [
    "record actor id and actor role",
    "record before and after article status",
    "record before and after content hash where applicable",
    "record decision note for publish/return/rollback",
    "record public URL verification result",
    "record listing verification result"
  ],
  rollback_requirements: [
    "capture previous status before publish",
    "capture previous public artifact/path if applicable",
    "capture previous listing state if applicable",
    "define restore action",
    "verify restored public state after rollback",
    "create rollback audit note"
  ],
  ag41a_position: "SOP only; no audit-log write or rollback write is executed.",
  blocked_state: blockedState
};

const securitySop = {
  module_id: "AG41A",
  title: "Security and Grant SOP",
  status: "security_and_grant_sop_created",
  security_rules: [
    "RLS remains primary access-control boundary.",
    "No anon grants for Admin/Editor workflow tables.",
    "Authenticated read grants may be handled only through approved future SQL/grant stage.",
    "No service-role key in repo, browser, chat, public config or committed files.",
    "No deployment secret changes inside AG41A.",
    "Editor remains assigned-only and no-publish.",
    "Admin final approval remains mandatory."
  ],
  ag41a_position: "SOP only; no SQL file is created and no SQL grant is executed.",
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG41A",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag41a",
  checks: [
    { check_id: "sop_only", passed: true },
    { check_id: "no_public_mutation", passed: true },
    { check_id: "no_real_publish", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_audit_log_write", passed: true },
    { check_id: "no_rollback_write", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_sql_file_created", passed: true },
    { check_id: "no_sql_grant_execution", passed: true },
    { check_id: "no_service_role_key", passed: true },
    { check_id: "no_anon_grant", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const sop = {
  module_id: "AG41A",
  title: "Dynamic Publishing SOP",
  status: "dynamic_publishing_sop_created_ready_for_ag41b_batch_plan",
  purpose:
    "Create the governed Dynamic Publishing SOP after AG40 live smoke-test stabilisation closure, without enabling mutation, deployment, SQL execution or service-role key use.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  sop_decision: {
    dynamic_publishing_sop_created: true,
    role_gate_model_created: true,
    publishing_workflow_sop_created: true,
    audit_rollback_sop_created: true,
    security_grant_sop_created: true,
    proceed_to_ag41b_batch_dynamic_publishing_plan: true,

    real_publish_executed: false,
    database_write_done: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_enabled: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  role_gate_model_file: outputs.roleGateModel,
  workflow_sop_file: outputs.workflowSop,
  audit_rollback_sop_file: outputs.auditRollbackSop,
  security_sop_file: outputs.securitySop,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG41A",
  title: "Dynamic Publishing SOP Blocker Register",
  status: "dynamic_publishing_sop_blockers_preserved",
  blocked_items: [
    "No public mutation.",
    "No real publish.",
    "No queue-state write.",
    "No database write.",
    "No audit-log write.",
    "No rollback write.",
    "No deployment.",
    "No SQL file created.",
    "No SQL grant execution.",
    "No service-role key exposure.",
    "No anon grants."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG41A",
  title: "Batch Dynamic Publishing Plan Readiness Record",
  status: "ready_for_ag41b_batch_dynamic_publishing_plan",
  ready_for_ag41b: true,
  next_stage_id: "AG41B",
  next_stage_title: "Batch Dynamic Publishing Plan",
  dynamic_publishing_sop_created: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG41A",
  title: "AG41A to AG41B Batch Dynamic Publishing Plan Boundary",
  status: "ag41b_batch_dynamic_publishing_plan_boundary_created",
  next_stage_id: "AG41B",
  next_stage_title: "Batch Dynamic Publishing Plan",
  allowed_scope: [
    "Consume AG41A Dynamic Publishing SOP.",
    "Create batch dynamic publishing plan.",
    "Keep mutation, deployment, SQL execution and service-role key exposure blocked unless separately approved."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG41A",
  title: "Dynamic Publishing SOP",
  status: sop.status,
  depends_on: ["AG40Z", "AG40A", "AG40B", "AG40C", "AG40D"],
  generated_from: inputs,
  sop_file: outputs.sop,
  role_gate_model_file: outputs.roleGateModel,
  workflow_sop_file: outputs.workflowSop,
  audit_rollback_sop_file: outputs.auditRollbackSop,
  security_sop_file: outputs.securitySop,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    dynamic_publishing_sop_created: true,
    ready_for_ag41b: true,
    real_publish_executed: false,
    database_write_done: false,
    public_mutation_done: false,
    deployment_done: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG41A", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG41A",
  preview_only: false,
  status: review.status,
  dynamic_publishing_sop_created: 1,
  ready_for_ag41b: 1,
  real_publish_executed: 0,
  database_write_done: 0,
  public_mutation_done: 0,
  deployment_done: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_file_created: 0,
  sql_grants_executed: 0
};

const doc = `# AG41A — Dynamic Publishing SOP

## Result

AG41A Dynamic Publishing SOP is created.

## SOP Coverage

- Role and gate model.
- Dynamic publishing workflow.
- Audit and rollback procedure.
- Security and grant rules.
- No-mutation audit.

## Core Rule

Admin final approval remains mandatory. Editor remains assigned-only and cannot publish.

## Still Blocked

- No public mutation.
- No real publish.
- No database write.
- No audit-log write.
- No rollback write.
- No deployment.
- No SQL grant execution.
- No service-role key exposure.
- No anon grants.

## Next

AG41B — Batch Dynamic Publishing Plan.
`;

writeJson(outputs.roleGateModel, roleGateModel);
writeJson(outputs.workflowSop, workflowSop);
writeJson(outputs.auditRollbackSop, auditRollbackSop);
writeJson(outputs.securitySop, securitySop);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.sop, sop);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG41A Dynamic Publishing SOP generated.");
console.log("✅ Role gates, publishing workflow, audit/rollback and security SOP are present.");
console.log("✅ Ready for AG41B Batch Dynamic Publishing Plan.");
console.log("✅ No public mutation, real publish, database write, deployment, SQL grant execution or service-role key recorded.");
