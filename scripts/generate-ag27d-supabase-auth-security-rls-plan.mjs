import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag27cReview: "data/content-intelligence/quality-reviews/ag27c-supabase-auth-architecture-plan.json",
  ag27cPlan: "data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json",
  ag27cRoleAuthModel: "data/content-intelligence/backend-decision/ag27c-role-auth-architecture-model.json",
  ag27cTableBlueprint: "data/content-intelligence/backend-decision/ag27c-supabase-table-architecture-blueprint.json",
  ag27cWorkflowArchitecture: "data/content-intelligence/backend-decision/ag27c-admin-editor-workflow-architecture.json",
  ag27cPublishStateArchitecture: "data/content-intelligence/backend-decision/ag27c-publishing-state-architecture.json",
  ag27cSecretEnvironmentPlan: "data/content-intelligence/backend-decision/ag27c-secret-environment-governance-plan.json",
  ag27cReadiness: "data/content-intelligence/quality-registry/ag27c-supabase-auth-security-rls-plan-readiness-record.json",
  ag27cBoundary: "data/content-intelligence/mutation-plans/ag27c-to-ag27d-supabase-auth-security-rls-plan-boundary.json",

  ag27bAudit: "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  ag27aAssessment: "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  existingAg27Checkpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  ag26zClosure: "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  ag26aRoutingModel: "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  ag26bPublishControl: "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag27d-supabase-auth-security-rls-plan.json",
  plan: "data/content-intelligence/backend-decision/ag27d-supabase-auth-security-rls-plan.json",
  roleAccessMatrix: "data/content-intelligence/backend-decision/ag27d-role-access-security-matrix.json",
  rlsBlueprint: "data/content-intelligence/backend-decision/ag27d-table-rls-policy-blueprint.json",
  workflowSecurityModel: "data/content-intelligence/backend-decision/ag27d-workflow-security-guard-model.json",
  secretSafetyModel: "data/content-intelligence/backend-decision/ag27d-secret-and-service-role-safety-model.json",
  activationStagePlan: "data/content-intelligence/backend-decision/ag27d-controlled-activation-stage-placement-plan.json",
  consumptionPlan: "data/content-intelligence/backend-decision/ag27d-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag27d-supabase-auth-security-rls-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag27d-backend-decision-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag27d-to-ag27z-backend-decision-closure-boundary.json",
  registry: "data/quality/ag27d-supabase-auth-security-rls-plan.json",
  preview: "data/quality/ag27d-supabase-auth-security-rls-plan-preview.json",
  doc: "docs/quality/AG27D_SUPABASE_AUTH_SECURITY_RLS_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG27D input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag27cReview.status !== "supabase_auth_architecture_plan_created_ready_for_ag27d") throw new Error("AG27C review status mismatch.");
if (records.ag27cPlan.status !== "supabase_auth_architecture_plan_created_ready_for_ag27d") throw new Error("AG27C plan status mismatch.");
if (records.ag27cReadiness.ready_for_ag27d !== true) throw new Error("AG27C readiness does not permit AG27D.");
if (records.ag27cBoundary.next_stage_id !== "AG27D") throw new Error("AG27C boundary does not point to AG27D.");
if (records.ag27cPlan.backend_activation_allowed_in_ag27c !== false) throw new Error("Backend must remain blocked from AG27C.");
if (records.ag27cPlan.auth_activation_allowed_in_ag27c !== false) throw new Error("Auth must remain blocked from AG27C.");
if (records.ag27cPlan.supabase_project_creation_allowed_in_ag27c !== false) throw new Error("Supabase project creation must remain blocked from AG27C.");
if (records.existingAg27Checkpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Existing AG27 backend deferral must remain true.");
if (records.ag26zClosure.status !== "manual_admin_editor_workflow_closed_existing_ag27_backend_deferred") throw new Error("AG26Z closure status mismatch.");
if (records.ag26aRoutingModel.role_routing_rules?.admin_final_publish_authority !== true) throw new Error("Admin final publish authority missing.");
if (records.ag26aRoutingModel.role_routing_rules?.editor_publish_authority !== false) throw new Error("Editor publish authority must remain false.");
if (records.ag26bPublishControl.final_publish_authority !== "admin_only") throw new Error("Admin-only publish control missing.");

const blockedState = {
  supabase_auth_security_rls_plan_created: true,
  controlled_activation_stage_placement_created: true,
  backend_activation_approved: false,
  backend_enabled: false,
  auth_enabled: false,
  supabase_enabled: false,
  supabase_project_created: false,
  database_created: false,
  migration_created: false,
  table_created: false,
  rls_policy_created: false,
  rls_policy_applied: false,
  secret_created: false,
  service_role_key_created: false,
  admin_login_created: false,
  editor_login_created: false,
  runtime_queue_created: false,
  runtime_write_enabled: false,
  dynamic_publishing_enabled: false,
  article_file_mutated: false,
  github_token_created: false,
  github_write_performed: false,
  deployment_triggered: false,
  published: false
};

const roleAccessRows = [
  {
    role_id: "admin",
    can_read_all_review_queue: true,
    can_assign_to_editor: true,
    can_publish_future_runtime: true,
    can_manage_roles_future: true,
    can_use_service_role_key: false,
    notes: "Admin is final reviewer and final publish authority, but service role access must remain server-only."
  },
  {
    role_id: "editor",
    can_create_new_candidate: true,
    can_edit_own_candidate: true,
    can_edit_admin_assigned_content: true,
    can_publish_future_runtime: false,
    can_read_unassigned_system_content: false,
    notes: "Editor cannot publish and cannot pick system-generated content unless assigned by Admin."
  },
  {
    role_id: "system",
    can_create_generated_candidate_future: true,
    can_publish_without_admin: false,
    can_route_to_admin_first: true,
    can_bypass_admin_review: false,
    notes: "System-generated content must always land in Admin review first."
  },
  {
    role_id: "public_reader",
    can_read_published_content: true,
    can_read_drafts: false,
    can_read_review_queue: false,
    can_read_audit_logs: false,
    notes: "Public role must only see published content."
  },
  {
    role_id: "subscriber_future",
    can_read_published_content: true,
    can_read_personalized_content_future: true,
    can_read_admin_editor_workflow: false,
    can_mutate_content: false,
    notes: "Future subscriber access must be isolated from editorial workflow."
  },
  {
    role_id: "auditor_future",
    can_read_audit_logs_future: true,
    can_mutate_content: false,
    can_publish: false,
    notes: "Optional future read-only governance role."
  }
];

const roleAccessMatrix = {
  module_id: "AG27D",
  title: "Role Access Security Matrix",
  status: "role_access_security_matrix_created_no_auth_activation",
  role_access_rows: roleAccessRows,
  admin_final_publish_authority: true,
  editor_publish_authority: false,
  auth_activation_allowed_now: false,
  blocked_state: blockedState
};

const rlsRows = [
  {
    table_group_id: "identity_access",
    planned_tables: ["profiles", "roles", "user_roles", "role_permissions", "session_audit_events"],
    rls_strategy: "Users can read own profile; Admin can read/manage role mappings through controlled server path; public cannot read role mappings.",
    policy_apply_now: false
  },
  {
    table_group_id: "content_core",
    planned_tables: ["articles", "article_versions", "article_sections", "article_metadata", "article_status_history"],
    rls_strategy: "Public reads only published articles; Admin reads all; Editor reads own candidates and Admin-assigned records only.",
    policy_apply_now: false
  },
  {
    table_group_id: "admin_editor_workflow",
    planned_tables: ["review_queue", "editor_assignments", "admin_decisions", "editor_returns", "workflow_comments"],
    rls_strategy: "Admin reads/writes workflow records; Editor reads assigned items and creates return/comment records; system inserts candidates but cannot publish.",
    policy_apply_now: false
  },
  {
    table_group_id: "references_attribution_objects",
    planned_tables: ["article_references", "reference_verification_status", "article_assets", "asset_attributions", "object_requirements", "object_generation_requests"],
    rls_strategy: "Admin has review authority; Editor can edit objects/references for own or assigned content; public sees only published-safe records.",
    policy_apply_now: false
  },
  {
    table_group_id: "publishing_audit",
    planned_tables: ["publish_records", "publish_snapshots", "rollback_records", "audit_logs", "governance_events"],
    rls_strategy: "Admin creates publish records; public has no audit-log access; audit records are append-only through server-controlled paths.",
    policy_apply_now: false
  },
  {
    table_group_id: "future_reader_personalization",
    planned_tables: ["subscriber_profiles", "reader_preferences", "saved_items", "entitlements", "notification_preferences"],
    rls_strategy: "Subscribers can read/write own preference records only; no access to editorial workflow.",
    policy_apply_now: false
  }
];

const rlsBlueprint = {
  module_id: "AG27D",
  title: "Table RLS Policy Blueprint",
  status: "table_rls_policy_blueprint_created_no_policy_apply",
  rls_rows: rlsRows,
  rls_policy_creation_allowed_now: false,
  rls_policy_apply_allowed_now: false,
  migration_creation_allowed_now: false,
  blocked_state: blockedState
};

const workflowSecurityModel = {
  module_id: "AG27D",
  title: "Workflow Security Guard Model",
  status: "workflow_security_guard_model_created_no_runtime_queue",
  workflow_security_rules: [
    {
      rule_id: "system_generated_to_admin_first",
      rule: "System-generated content must be visible to Admin first and must not directly reach Editor/public publishing.",
      enforce_later_with_rls: true,
      active_now: false
    },
    {
      rule_id: "editor_assignment_required_for_system_content",
      rule: "Editor can edit system-generated/existing content only after Admin assignment.",
      enforce_later_with_rls: true,
      active_now: false
    },
    {
      rule_id: "editor_new_candidate_to_admin_review",
      rule: "Editor independent new article candidates must go to Admin review before publishing.",
      enforce_later_with_rls: true,
      active_now: false
    },
    {
      rule_id: "admin_only_publish",
      rule: "Only Admin can approve/push final publish in future runtime.",
      enforce_later_with_rls: true,
      active_now: false
    },
    {
      rule_id: "public_published_only",
      rule: "Public readers can read only published-safe content.",
      enforce_later_with_rls: true,
      active_now: false
    },
    {
      rule_id: "audit_append_only",
      rule: "Audit logs and publish records must be append-only or server-controlled.",
      enforce_later_with_rls: true,
      active_now: false
    }
  ],
  runtime_queue_allowed_now: false,
  runtime_write_allowed_now: false,
  blocked_state: blockedState
};

const secretSafetyModel = {
  module_id: "AG27D",
  title: "Secret and Service Role Safety Model",
  status: "secret_service_role_safety_model_created_no_secrets",
  secret_safety_rules: [
    "No Supabase key is created in AG27D.",
    "No key is stored in repository.",
    "Service role key must never be exposed to browser/client code.",
    "Service role usage must be server-only and action-scoped.",
    "Anon key must rely on RLS; anon key is not a substitute for access control.",
    "Environment variables must be configured only during approved activation stage.",
    "Any future activation must include secret-leak scan before commit/push.",
    "Rollback plan must exist before any real Auth/backend activation."
  ],
  service_role_allowed_in_client: false,
  secret_creation_allowed_now: false,
  blocked_state: blockedState
};

const activationStagePlan = {
  module_id: "AG27D",
  title: "Controlled Activation Stage Placement Plan",
  status: "controlled_activation_stage_placement_created_no_activation",
  activation_position_decision: {
    activation_not_in_ag27d: true,
    activation_not_in_ag27z: true,
    recommended_future_activation_window: "after_AG28_architecture_and_AG29_schema_rls_security_closure_with_explicit_apply_approval",
    activation_should_begin_as: "controlled_sandbox_activation_not_live_public_dynamic_publish",
    live_public_dynamic_publishing_after: "separate_post_activation_admin_publish_audit"
  },
  recommended_sequence: [
    {
      stage: "AG28",
      role: "Backend/Auth Architecture Blueprint",
      activation_allowed: false,
      purpose: "Convert AG27C/AG27D planning into detailed backend architecture records."
    },
    {
      stage: "AG29",
      role: "Schema/RLS/Security Model and controlled activation audit/apply decision",
      activation_allowed: "only_if_explicitly_approved_then_sandbox_first",
      purpose: "Prepare schema/RLS/security and decide whether controlled sandbox activation can begin."
    },
    {
      stage: "AG30",
      role: "Admin/Editor Login UI and Route Scaffold",
      activation_allowed: "only_after_security_and_secret_controls_pass",
      purpose: "Connect or scaffold login UI depending on AG29 result."
    },
    {
      stage: "AG31_plus",
      role: "Backend Queue and Article State Integration",
      activation_allowed: "only_after_auth_and_rls_are_validated",
      purpose: "Integrate queue/state/publish workflow only after role security is proven."
    }
  ],
  minimum_activation_preconditions: [
    "Explicit user approval for controlled activation.",
    "No secrets in repo.",
    "Supabase project selected/created outside repo.",
    "Environment variable plan approved.",
    "Schema and RLS migration reviewed.",
    "Admin and Editor test accounts planned securely.",
    "Rollback and disable plan prepared.",
    "No dynamic public publishing until Admin publish audit passes."
  ],
  activation_allowed_now: false,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG27D",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag27z_and_activation_later",
  future_consumption: {
    AG27Z: "Backend Decision Closure should consume AG27C and AG27D and close AG27 as backend planning approved but runtime activation still deferred.",
    AG28: "Backend/Auth Architecture Blueprint should consume AG27D RLS/security and activation-stage placement plan.",
    AG29: "Schema/RLS/Security Model and controlled activation audit should consume AG27D activation-stage placement and decide whether sandbox activation can start.",
    AG30: "Login UI and route scaffold should not become real Auth unless AG29 explicitly approves controlled activation.",
    AG31_plus: "Backend queue and article state integration should only proceed after Auth/RLS/security controls are validated."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG27D",
  title: "Supabase/Auth Security and RLS Plan",
  status: "supabase_auth_security_rls_plan_created_ready_for_ag27z",
  purpose:
    "Prepare a planning-only security and RLS model for future Supabase/Auth activation, including role access, table-level RLS strategy, workflow security guards, secret safety and controlled activation-stage placement without activating Supabase/Auth/backend.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag27c_status: records.ag27cPlan.status,
    planning_only: records.ag27cReview.summary?.planning_only === true,
    existing_backend_deferred: records.existingAg27Checkpoint.checkpoint_decision?.backend_deferred === true,
    admin_final_publish_authority: records.ag26aRoutingModel.role_routing_rules?.admin_final_publish_authority === true,
    editor_publish_authority_blocked: records.ag26aRoutingModel.role_routing_rules?.editor_publish_authority === false
  },
  security_scope: {
    stage_type: "planning_only_supabase_auth_security_rls",
    role_access_rows: roleAccessRows.length,
    rls_table_groups: rlsRows.length,
    workflow_security_rules: workflowSecurityModel.workflow_security_rules.length,
    activation_stage_placement_created: true,
    backend_status: "deferred",
    auth_status: "deferred",
    supabase_status: "deferred",
    next_stage: "AG27Z"
  },
  role_access_matrix_file: outputs.roleAccessMatrix,
  rls_blueprint_file: outputs.rlsBlueprint,
  workflow_security_model_file: outputs.workflowSecurityModel,
  secret_safety_model_file: outputs.secretSafetyModel,
  activation_stage_plan_file: outputs.activationStagePlan,
  future_consumption_plan_file: outputs.consumptionPlan,
  backend_activation_allowed_in_ag27d: false,
  auth_activation_allowed_in_ag27d: false,
  supabase_project_creation_allowed_in_ag27d: false,
  table_creation_allowed_in_ag27d: false,
  migration_creation_allowed_in_ag27d: false,
  rls_policy_creation_allowed_in_ag27d: false,
  rls_policy_apply_allowed_in_ag27d: false,
  secret_creation_allowed_in_ag27d: false,
  runtime_queue_creation_allowed_in_ag27d: false,
  dynamic_publishing_allowed_in_ag27d: false,
  deployment_allowed_in_ag27d: false,
  publication_allowed_in_ag27d: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG27D",
  title: "Supabase/Auth Security and RLS Plan Blocker Register",
  status: "supabase_auth_security_rls_plan_runtime_operations_blocked_pending_ag27z",
  blocked_items: [
    "No backend activation.",
    "No Auth activation.",
    "No Supabase activation.",
    "No Supabase project creation.",
    "No database creation.",
    "No table creation.",
    "No migration creation.",
    "No RLS policy creation.",
    "No RLS policy apply.",
    "No secret creation.",
    "No service role key creation.",
    "No Admin login creation.",
    "No Editor login creation.",
    "No runtime queue creation.",
    "No runtime write path.",
    "No dynamic publishing.",
    "No article mutation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG27D",
  title: "Backend Decision Closure Readiness Record",
  status: "ready_for_ag27z_backend_decision_closure",
  ready_for_ag27z: true,
  next_stage_id: "AG27Z",
  next_stage_title: "Backend Decision Closure",
  security_rls_plan_created: true,
  role_access_matrix_created: true,
  rls_blueprint_created: true,
  workflow_security_model_created: true,
  secret_safety_model_created: true,
  controlled_activation_stage_placement_created: true,
  backend_activation_allowed_now: false,
  auth_activation_allowed_now: false,
  supabase_activation_allowed_now: false,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG27D",
  title: "AG27D to AG27Z Backend Decision Closure Boundary",
  status: "ag27z_boundary_created_not_started",
  next_stage_id: "AG27Z",
  next_stage_title: "Backend Decision Closure",
  allowed_scope: [
    "Consume AG27A Backend Need Assessment.",
    "Consume AG27B Backend Decision Audit.",
    "Consume AG27C Supabase/Auth Architecture Plan.",
    "Consume AG27D Supabase/Auth Security and RLS Plan.",
    "Close AG27 as backend planning approved but runtime activation deferred.",
    "Carry controlled activation stage placement forward to AG28/AG29.",
    "Do not activate Supabase/Auth/backend or create database/tables/policies/secrets."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true,
  controlled_activation_should_be_considered_later: true
};

const review = {
  module_id: "AG27D",
  title: "Supabase/Auth Security and RLS Plan",
  status: "supabase_auth_security_rls_plan_created_ready_for_ag27z",
  depends_on: ["AG27C", "AG27B", "AG27A", "AG27_EXISTING", "AG26Z", "AG26A", "AG26B"],
  generated_from: inputs,
  plan_file: outputs.plan,
  role_access_matrix_file: outputs.roleAccessMatrix,
  rls_blueprint_file: outputs.rlsBlueprint,
  workflow_security_model_file: outputs.workflowSecurityModel,
  secret_safety_model_file: outputs.secretSafetyModel,
  activation_stage_plan_file: outputs.activationStagePlan,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    supabase_auth_security_rls_plan_created: true,
    planning_only: true,
    controlled_activation_stage_placement_created: true,
    ready_for_ag27z: true,
    role_access_rows: roleAccessRows.length,
    rls_table_groups: rlsRows.length,
    workflow_security_rules: workflowSecurityModel.workflow_security_rules.length,
    backend_activation_approved_now: false,
    auth_activation_approved_now: false,
    supabase_project_created: false,
    database_created: false,
    table_created: false,
    migration_created: false,
    rls_policy_created: false,
    rls_policy_applied: false,
    secret_created: false,
    runtime_queue_created: false,
    runtime_write_enabled: false,
    dynamic_publishing_enabled: false,
    deployment_done: false,
    publishing_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG27D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG27D",
  preview_only: true,
  status: review.status,
  message: "AG27D Supabase/Auth Security and RLS Plan created as planning-only. Activation placement is carried to future controlled activation stage; next: AG27Z Backend Decision Closure.",
  planning_only: true,
  controlled_activation_stage_placement_created: true,
  ready_for_ag27z: true,
  role_access_rows: roleAccessRows.length,
  rls_table_groups: rlsRows.length,
  backend_activation_approved_now: 0,
  auth_enabled: 0,
  supabase_enabled: 0,
  database_objects: 0,
  table_objects: 0,
  migration_objects: 0,
  rls_policy_objects: 0,
  secret_objects: 0,
  runtime_queues: 0,
  deployments: 0,
  published_items: 0,
  blocked_state: blockedState
};

const doc = `# AG27D — Supabase/Auth Security and RLS Plan

## Purpose

AG27D prepares a planning-only Supabase/Auth security and RLS model for Drishvara.

It defines role access rules, table-level RLS strategy, Admin/Editor workflow security guards, secret/service-role safety, and a controlled activation-stage placement plan.

## Security Principles

- Admin remains final publish authority.
- Editor cannot publish.
- System-generated content must go to Admin first.
- Editor can edit system/existing content only after Admin assignment.
- Public readers can only read published content.
- Subscriber access remains isolated from Admin/Editor workflow.
- Service role key must never be exposed to client/browser code.
- No secret is created or committed in AG27D.

## Controlled Activation Placement

Activation is not done in AG27D or AG27Z.

The recommended future path is:

1. AG28 — Backend/Auth Architecture Blueprint.
2. AG29 — Schema/RLS/Security Model and controlled activation audit/apply decision.
3. AG30 — Login UI and route scaffold only after security controls pass.
4. AG31+ — Queue/state integration only after Auth/RLS validation.

## Non-Activation Boundary

AG27D does not create Supabase project, Auth, database, tables, migrations, RLS policies, secrets, runtime queues, GitHub writes, deployment or publishing.

## Next Stage

AG27Z — Backend Decision Closure.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.roleAccessMatrix, roleAccessMatrix);
writeJson(outputs.rlsBlueprint, rlsBlueprint);
writeJson(outputs.workflowSecurityModel, workflowSecurityModel);
writeJson(outputs.secretSafetyModel, secretSafetyModel);
writeJson(outputs.activationStagePlan, activationStagePlan);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG27D Supabase/Auth Security and RLS Plan generated.");
console.log("✅ Role access matrix, RLS blueprint and workflow security guards created.");
console.log("✅ Secret/service-role safety model created with no secrets.");
console.log("✅ Controlled activation stage placement created for later stage.");
console.log("✅ No Supabase/Auth/backend/database/RLS/secret/runtime activation performed.");
console.log("✅ AG27Z Backend Decision Closure boundary created.");
