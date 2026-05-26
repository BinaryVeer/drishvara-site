import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag27bReview: "data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json",
  ag27bAudit: "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  ag27bOptionMatrix: "data/content-intelligence/backend-decision/ag27b-backend-option-decision-matrix.json",
  ag27bSupabaseDecision: "data/content-intelligence/backend-decision/ag27b-supabase-planning-decision-record.json",
  ag27bNonActivation: "data/content-intelligence/backend-decision/ag27b-non-activation-audit-register.json",
  ag27bReadiness: "data/content-intelligence/quality-registry/ag27b-supabase-auth-security-rls-plan-readiness-record.json",
  ag27bBoundary: "data/content-intelligence/mutation-plans/ag27b-to-ag27c-supabase-auth-security-rls-plan-boundary.json",

  ag27aAssessment: "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  ag27aSignalRegister: "data/content-intelligence/backend-decision/ag27a-backend-need-signal-register.json",
  ag27aMatrix: "data/content-intelligence/backend-decision/ag27a-static-vs-backend-readiness-matrix.json",

  ag26zClosure: "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  ag26zBackendCarryForward: "data/content-intelligence/admin-editor/ag26z-ag27-backend-deferral-carry-forward.json",

  ag27Checkpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",
  ag27DeferralRecord: "data/content-intelligence/backend-decision/ag27-backend-deferral-record.json",
  ag27Boundary: "data/content-intelligence/mutation-plans/ag27-to-ag28-conditional-backend-path-boundary.json",

  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json",
  ag24zClosure: "data/content-intelligence/episodes/ag24z-episodic-knowledge-engine-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag27c-supabase-auth-security-rls-plan.json",
  plan: "data/content-intelligence/backend-decision/ag27c-supabase-auth-security-rls-plan.json",
  tablePlan: "data/content-intelligence/backend-decision/ag27c-supabase-table-plan.json",
  roleAccessModel: "data/content-intelligence/backend-decision/ag27c-auth-role-access-model.json",
  rlsPolicyPlan: "data/content-intelligence/backend-decision/ag27c-rls-policy-plan.json",
  auditSecretPlan: "data/content-intelligence/backend-decision/ag27c-audit-secret-governance-plan.json",
  nonActivationAudit: "data/content-intelligence/backend-decision/ag27c-non-activation-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-decision/ag27c-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag27c-supabase-auth-security-rls-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag27c-conditional-security-rls-detail-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag27c-to-ag27d-conditional-security-rls-detail-boundary.json",
  registry: "data/quality/ag27c-supabase-auth-security-rls-plan.json",
  preview: "data/quality/ag27c-supabase-auth-security-rls-plan-preview.json",
  doc: "docs/quality/AG27C_SUPABASE_AUTH_SECURITY_RLS_PLAN.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG27C input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag27bReview.status !== "backend_decision_audit_created_ready_for_ag27c") throw new Error("AG27B review status mismatch.");
if (records.ag27bAudit.status !== "backend_decision_audit_created_ready_for_ag27c") throw new Error("AG27B audit status mismatch.");
if (records.ag27bReadiness.ready_for_ag27c !== true) throw new Error("AG27B readiness does not permit AG27C.");
if (records.ag27bBoundary.next_stage_id !== "AG27C") throw new Error("AG27B boundary does not point to AG27C.");
if (records.ag27bAudit.decision_audit?.backend_planning_approved_for_next_stage !== true) throw new Error("AG27B must approve non-active planning.");
if (records.ag27bAudit.decision_audit?.backend_activation_approved_now !== false) throw new Error("Backend activation must remain blocked.");
if (records.ag27bAudit.decision_audit?.database_creation_approved_now !== false) throw new Error("Database creation must remain blocked.");
if (records.ag27bAudit.decision_audit?.secrets_or_env_setup_approved_now !== false) throw new Error("Secrets/env setup must remain blocked.");
if (records.ag26zClosure.closure_decision?.ag26_detailed_chain_closed !== true) throw new Error("AG26Z chain must be closed.");
if (records.ag26zRoleGovernance.role_rules?.admin_assigns_work_to_editor !== true) throw new Error("Admin assignment rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zBackendCarryForward.backend_deferred !== true) throw new Error("AG26Z backend deferral missing.");
if (records.ag27Checkpoint.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") throw new Error("AG27 checkpoint status mismatch.");
if (records.ag27Checkpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("AG27 backend deferral missing.");
if (records.ag27Checkpoint.checkpoint_decision?.backend_activation_approved !== false) throw new Error("Backend activation must remain unapproved.");
if (records.ag27Boundary.explicit_approval_required !== true) throw new Error("AG27 explicit approval boundary missing.");
if (records.ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z status mismatch.");
if (records.ag24zClosure.status !== "episodic_knowledge_engine_closed_ready_for_ag25") throw new Error("AG24Z status mismatch.");

const blockedState = {
  supabase_auth_security_rls_plan_created: true,
  table_plan_created: true,
  role_access_model_created: true,
  rls_policy_plan_created: true,
  audit_secret_governance_plan_created: true,
  runtime_backend_created: false,
  supabase_project_created: false,
  supabase_connected: false,
  database_table_created: false,
  rls_policy_applied: false,
  auth_enabled: false,
  admin_login_created: false,
  editor_login_created: false,
  secrets_created: false,
  env_vars_written: false,
  server_route_created: false,
  api_route_created: false,
  queue_runtime_created: false,
  audit_runtime_created: false,
  article_state_runtime_created: false,
  dynamic_publish_runtime_created: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false,
  public_mutation_done: false,
  supabase_auth_backend_activated: false,
  ag28_allowed_now: false
};

const tableGroups = [
  {
    table_name: "users",
    purpose: "Store planned user identity linkage, display role, status and timestamps.",
    planned_columns: ["id", "email", "display_name", "role", "status", "created_at", "updated_at"],
    sensitive: true,
    create_now: false
  },
  {
    table_name: "roles",
    purpose: "Define Admin, Editor and future Subscriber roles.",
    planned_columns: ["id", "role_code", "role_label", "description", "is_active"],
    sensitive: false,
    create_now: false
  },
  {
    table_name: "articles",
    purpose: "Store future article records, slug, category, state, assigned editor and public status.",
    planned_columns: ["id", "slug", "title", "category", "article_state", "assigned_editor_id", "public_visibility", "publish_approved", "created_at", "updated_at"],
    sensitive: false,
    create_now: false
  },
  {
    table_name: "review_queue",
    purpose: "Store Admin-to-Editor assignment queue and return-to-Admin flow.",
    planned_columns: ["id", "article_id", "assigned_by_admin_id", "assigned_to_editor_id", "assignment_status", "assignment_note", "editor_return_note", "created_at", "updated_at"],
    sensitive: true,
    create_now: false
  },
  {
    table_name: "editor_decisions",
    purpose: "Record editor-side decisions and notes for assigned items.",
    planned_columns: ["id", "article_id", "editor_id", "decision", "decision_note", "created_at"],
    sensitive: true,
    create_now: false
  },
  {
    table_name: "admin_decisions",
    purpose: "Record Admin archive, return for correction, internal clearance, publish plan and publish-and-close plan decisions.",
    planned_columns: ["id", "article_id", "admin_id", "decision", "decision_note", "created_at"],
    sensitive: true,
    create_now: false
  },
  {
    table_name: "publish_logs",
    purpose: "Future publish audit trail with before/after hash, public surface and rollback pointer.",
    planned_columns: ["id", "article_id", "action", "before_hash", "after_hash", "rollback_ref", "created_by", "created_at"],
    sensitive: true,
    create_now: false
  },
  {
    table_name: "audit_logs",
    purpose: "System-wide audit trail for future Admin/Editor workflow actions.",
    planned_columns: ["id", "actor_id", "actor_role", "action", "target_type", "target_id", "metadata_json", "created_at"],
    sensitive: true,
    create_now: false
  },
  {
    table_name: "rollback_records",
    purpose: "Store planned rollback references for future controlled publishing.",
    planned_columns: ["id", "publish_log_id", "article_id", "rollback_path", "rollback_hash", "created_at"],
    sensitive: true,
    create_now: false
  },
  {
    table_name: "reference_evidence",
    purpose: "Store reference verification, source credibility and evidence-review status.",
    planned_columns: ["id", "article_id", "reference_url", "source_type", "credibility_status", "verification_status", "admin_note", "created_at"],
    sensitive: false,
    create_now: false
  },
  {
    table_name: "object_assets",
    purpose: "Store future image, graph, table, infographic, diagram and attribution metadata.",
    planned_columns: ["id", "article_id", "asset_type", "asset_source", "credit_text", "license_note", "verification_status", "created_at"],
    sensitive: false,
    create_now: false
  }
];

const tablePlan = {
  module_id: "AG27C",
  title: "Supabase Table Plan",
  status: "supabase_table_plan_created_no_database_creation",
  table_count: tableGroups.length,
  tables: tableGroups,
  sql_generated: false,
  migration_generated: false,
  database_creation_allowed: false,
  blocked_state: blockedState
};

const roleAccessModel = {
  module_id: "AG27C",
  title: "Auth Role Access Model",
  status: "auth_role_access_model_created_no_auth_activation",
  roles: [
    {
      role_code: "admin",
      purpose: "Assign work, review returned work, review evidence/delta, archive, return for correction and later approve controlled publish actions.",
      can_assign_to_editor: true,
      can_receive_editor_return: true,
      can_final_clear: true,
      can_publish_now: false
    },
    {
      role_code: "editor",
      purpose: "Open only Admin-assigned article workspaces, edit/prep assigned items and send back to Admin.",
      can_browse_all_articles: false,
      can_self_assign: false,
      can_create_independent_article: false,
      can_publish_now: false
    },
    {
      role_code: "subscriber",
      purpose: "Future reader/account features only; no Admin/Editor workflow rights.",
      can_edit_articles: false,
      can_publish_now: false
    },
    {
      role_code: "anonymous_public",
      purpose: "Read public static/dynamic pages only.",
      can_edit_articles: false,
      can_access_admin_editor: false
    }
  ],
  access_rules: [
    "Admin is final clearance authority.",
    "Editor can access only assigned queue items.",
    "Editor cannot browse global article inventory.",
    "Editor cannot self-assign.",
    "Editor cannot publish.",
    "Public users cannot access Admin/Editor workflow.",
    "Subscriber role, if added later, cannot inherit Admin/Editor rights by default."
  ],
  auth_activation_allowed: false,
  login_creation_allowed: false,
  blocked_state: blockedState
};

const rlsPolicyPlan = {
  module_id: "AG27C",
  title: "RLS Policy Plan",
  status: "rls_policy_plan_created_no_policy_application",
  policy_groups: [
    {
      policy_id: "admin_full_review_scope",
      table_scope: ["articles", "review_queue", "admin_decisions", "editor_decisions", "reference_evidence", "object_assets"],
      planned_rule: "Admin can read review records and take planned final-clearance actions.",
      apply_now: false
    },
    {
      policy_id: "editor_assigned_only_scope",
      table_scope: ["articles", "review_queue", "editor_decisions", "reference_evidence", "object_assets"],
      planned_rule: "Editor can read/update only records assigned to that editor through review_queue.",
      apply_now: false
    },
    {
      policy_id: "public_published_read_only_scope",
      table_scope: ["articles"],
      planned_rule: "Public can read only records with public_visibility=true and published state after future controlled activation.",
      apply_now: false
    },
    {
      policy_id: "audit_append_only_scope",
      table_scope: ["audit_logs", "publish_logs", "rollback_records"],
      planned_rule: "Audit and publish logs are append-only for controlled server-side actions.",
      apply_now: false
    },
    {
      policy_id: "subscriber_future_read_scope",
      table_scope: ["articles"],
      planned_rule: "Subscriber can access only future permitted subscriber surfaces; no Admin/Editor actions.",
      apply_now: false
    }
  ],
  rls_application_allowed: false,
  policy_sql_generated: false,
  blocked_state: blockedState
};

const auditSecretPlan = {
  module_id: "AG27C",
  title: "Audit and Secret Governance Plan",
  status: "audit_secret_governance_plan_created_no_secret_storage",
  audit_requirements: [
    "Every future assignment action must create an audit entry.",
    "Every future editor return must create an audit entry.",
    "Every future admin decision must create an audit entry.",
    "Every future publish/dynamic apply must record before hash, after hash and rollback reference.",
    "Every future public state change must be traceable to Admin final clearance."
  ],
  secret_governance_rules: [
    "No Supabase key in repository.",
    "No service role key in frontend.",
    "No environment variable is written in AG27C.",
    "Secret placement must be documented before activation.",
    "Service role access, if ever used, must remain server-side only.",
    "Local terminal outputs must not expose secrets."
  ],
  env_var_names_planned_only: [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY"
  ],
  secrets_created: false,
  env_vars_written: false,
  blocked_state: blockedState
};

const nonActivationAudit = {
  module_id: "AG27C",
  title: "Supabase/Auth Security and RLS Plan Non-Activation Audit",
  status: "supabase_auth_security_rls_non_activation_audit_passed",
  checks: [
    {
      check_id: "no_sql_generated",
      passed: true,
      evidence: "AG27C defines table plan only; no executable SQL or migration is generated."
    },
    {
      check_id: "no_rls_applied",
      passed: true,
      evidence: "RLS policies are planned but not applied."
    },
    {
      check_id: "no_supabase_project_created",
      passed: true,
      evidence: "No Supabase project creation or connection command exists."
    },
    {
      check_id: "no_auth_enabled",
      passed: true,
      evidence: "Auth is planned only and activation remains false."
    },
    {
      check_id: "no_secret_or_env_write",
      passed: true,
      evidence: "Secret governance is documented without storing secrets."
    },
    {
      check_id: "no_runtime_route",
      passed: true,
      evidence: "No API/server routes are created."
    },
    {
      check_id: "no_deployment_or_public_mutation",
      passed: true,
      evidence: "Deployment and public mutation remain blocked."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG27C",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag27d_and_ag27z",
  future_consumption: {
    AG27D:
      "Conditional Supabase/Auth security detail planning may consume AG27C tables, roles, RLS and secret-governance model if approved; still no activation.",
    AG27Z:
      "Backend Decision Closure should consume AG27A, AG27B and AG27C to close AG27 as non-active backend planning approved or backend deferred.",
    AG28:
      "AG28 Backend/Auth Architecture Blueprint may start only after AG27Z explicitly permits non-active backend architecture planning. AG28 still must not activate real backend unless later approved.",
    AG29_to_AG40:
      "Schema, login, queue and dynamic publishing stages remain future controlled stages, with real activation requiring explicit approval."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG27C",
  title: "Supabase/Auth Security and RLS Plan",
  status: "supabase_auth_security_rls_plan_created_ready_for_conditional_ag27d",
  purpose:
    "Plan non-active Supabase table shapes, Auth roles, RLS policy groups, audit requirements and secret governance for the future Admin/Editor workflow without creating a Supabase project, database, Auth, RLS policies, secrets, routes, deployment or public mutation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag27b_status: records.ag27bAudit.status,
    ag27b_selected_option: records.ag27bAudit.decision_audit?.selected_option_id,
    ag27a_status: records.ag27aAssessment.status,
    ag26z_status: records.ag26zClosure.status,
    ag27_checkpoint_status: records.ag27Checkpoint.status,
    ag27_backend_deferred: records.ag27Checkpoint.checkpoint_decision?.backend_deferred === true
  },
  planning_decision: {
    table_planning_created: true,
    role_access_planning_created: true,
    rls_policy_planning_created: true,
    audit_secret_governance_created: true,
    proceed_to_conditional_ag27d: true,
    backend_activation_approved_now: false,
    supabase_sandbox_activation_approved_now: false,
    auth_activation_approved_now: false,
    database_creation_approved_now: false,
    rls_policy_application_approved_now: false,
    secrets_or_env_setup_approved_now: false,
    ag28_allowed_now: false
  },
  table_plan_file: outputs.tablePlan,
  role_access_model_file: outputs.roleAccessModel,
  rls_policy_plan_file: outputs.rlsPolicyPlan,
  audit_secret_governance_plan_file: outputs.auditSecretPlan,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  backend_activation_allowed_in_ag27c: false,
  supabase_activation_allowed_in_ag27c: false,
  auth_activation_allowed_in_ag27c: false,
  database_creation_allowed_in_ag27c: false,
  table_creation_allowed_in_ag27c: false,
  rls_policy_application_allowed_in_ag27c: false,
  secret_creation_allowed_in_ag27c: false,
  env_var_write_allowed_in_ag27c: false,
  server_route_creation_allowed_in_ag27c: false,
  deployment_allowed_in_ag27c: false,
  public_mutation_allowed_in_ag27c: false,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG27C",
  title: "Supabase/Auth Security and RLS Plan Blocker Register",
  status: "supabase_auth_security_rls_plan_operations_blocked_pending_conditional_ag27d",
  blocked_items: [
    "No Supabase project creation.",
    "No Supabase connection.",
    "No SQL generation.",
    "No database table creation.",
    "No RLS policy application.",
    "No Auth activation.",
    "No Admin login creation.",
    "No Editor login creation.",
    "No secrets creation.",
    "No environment variable write.",
    "No server/API route creation.",
    "No queue runtime creation.",
    "No audit runtime creation.",
    "No article state runtime creation.",
    "No dynamic publish runtime creation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No public mutation.",
    "No AG28 start until AG27Z permits it."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG27C",
  title: "Conditional Security/RLS Detail Readiness Record",
  status: "ready_for_conditional_ag27d_security_rls_detail",
  ready_for_ag27d: true,
  next_stage_id: "AG27D",
  next_stage_title: "Supabase/Auth Security and RLS Detail Plan — Conditional Only",
  condition: "Proceed only as non-active planning; no backend/Auth/Supabase activation.",
  table_plan_created: true,
  role_access_model_created: true,
  rls_policy_plan_created: true,
  audit_secret_governance_plan_created: true,
  non_activation_audit_passed: true,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG27C",
  title: "AG27C to AG27D Conditional Security/RLS Detail Boundary",
  status: "conditional_ag27d_boundary_created_not_started",
  next_stage_id: "AG27D",
  next_stage_title: "Supabase/Auth Security and RLS Detail Plan — Conditional Only",
  allowed_scope: [
    "Consume AG27C non-active table plan.",
    "Consume AG27C role access model.",
    "Consume AG27C RLS policy plan.",
    "Consume AG27C audit and secret governance plan.",
    "Deepen security, access and RLS planning only.",
    "Keep Supabase/Auth/backend activation blocked.",
    "Keep SQL, migrations, secrets, env vars, live routes, deployment and public mutation blocked."
  ],
  blocked_scope: blocker.blocked_items,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_activation: true
};

const review = {
  module_id: "AG27C",
  title: "Supabase/Auth Security and RLS Plan",
  status: "supabase_auth_security_rls_plan_created_ready_for_conditional_ag27d",
  depends_on: ["AG27B", "AG27A", "AG26Z", "AG27", "AG25Z", "AG24Z"],
  generated_from: inputs,
  plan_file: outputs.plan,
  table_plan_file: outputs.tablePlan,
  role_access_model_file: outputs.roleAccessModel,
  rls_policy_plan_file: outputs.rlsPolicyPlan,
  audit_secret_governance_plan_file: outputs.auditSecretPlan,
  non_activation_audit_file: outputs.nonActivationAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    supabase_auth_security_rls_plan_created: true,
    table_plan_created: true,
    role_access_model_created: true,
    rls_policy_plan_created: true,
    audit_secret_governance_plan_created: true,
    proceed_to_conditional_ag27d: true,
    backend_activation_allowed_now: false,
    supabase_activation_allowed_now: false,
    auth_activation_allowed_now: false,
    database_creation_allowed_now: false,
    table_creation_allowed_now: false,
    rls_policy_application_allowed_now: false,
    secret_creation_allowed_now: false,
    env_var_write_allowed_now: false,
    server_route_creation_allowed_now: false,
    deployment_done: false,
    public_mutation_done: false,
    backend_activation_done: false,
    real_execution_done: false,
    ag28_allowed_now: false,
    ready_for_ag27d: true
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG27C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG27C",
  preview_only: true,
  status: review.status,
  message: "AG27C Supabase/Auth Security and RLS Plan created. Next: AG27D conditional security/RLS detail planning only.",
  table_plan_created: 1,
  role_access_model_created: 1,
  rls_policy_plan_created: 1,
  audit_secret_governance_plan_created: 1,
  backend_activation_allowed: 0,
  supabase_activation_allowed: 0,
  auth_activation_allowed: 0,
  database_objects_created: 0,
  rls_policies_applied: 0,
  secrets_created: 0,
  env_vars_written: 0,
  deployment_done: 0,
  public_items: 0,
  backend_objects: 0,
  ag28_allowed_now: 0,
  blocked_state: blockedState
};

const doc = `# AG27C — Supabase/Auth Security and RLS Plan

## Purpose

AG27C creates a non-active Supabase/Auth security and RLS planning record.

It plans:

- table shapes,
- Admin/Editor/Subscriber/Public roles,
- RLS policy groups,
- audit requirements,
- rollback requirements,
- secret-governance rules.

## Important Boundary

AG27C does not activate backend.

No Supabase project, database table, SQL migration, RLS policy, Auth setup, login, secret, environment variable, runtime API, deployment, publishing or public mutation is created.

## Role Rule Preserved

Admin assigns work to Editor. Editor works only on Admin-assigned items. Editor sends work back to Admin. Admin remains final clearance authority.

## Next Stage

AG27D — Supabase/Auth Security and RLS Detail Plan — conditional only, still non-active.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.tablePlan, tablePlan);
writeJson(outputs.roleAccessModel, roleAccessModel);
writeJson(outputs.rlsPolicyPlan, rlsPolicyPlan);
writeJson(outputs.auditSecretPlan, auditSecretPlan);
writeJson(outputs.nonActivationAudit, nonActivationAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG27C Supabase/Auth Security and RLS Plan generated.");
console.log(`✅ Planned tables: ${tableGroups.length}`);
console.log("✅ Role access, RLS policy, audit and secret-governance planning created.");
console.log("✅ No Supabase/Auth/backend activation, SQL, database, RLS application, secrets, deployment or public mutation performed.");
console.log("✅ Conditional AG27D Security/RLS Detail boundary created.");
