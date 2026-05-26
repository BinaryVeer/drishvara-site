import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag27bReview: "data/content-intelligence/quality-reviews/ag27b-backend-decision-audit.json",
  ag27bAudit: "data/content-intelligence/backend-decision/ag27b-backend-decision-audit.json",
  ag27bDecisionMatrix: "data/content-intelligence/backend-decision/ag27b-backend-decision-matrix.json",
  ag27bOptionAudit: "data/content-intelligence/backend-decision/ag27b-backend-option-audit-register.json",
  ag27bPrerequisiteAudit: "data/content-intelligence/backend-decision/ag27b-backend-prerequisite-audit-register.json",
  ag27bConditionalGate: "data/content-intelligence/backend-decision/ag27b-conditional-ag27c-ag27d-gate-register.json",
  ag27bReadiness: "data/content-intelligence/quality-registry/ag27b-backend-decision-closure-readiness-record.json",
  ag27bBoundary: "data/content-intelligence/mutation-plans/ag27b-to-ag27z-backend-decision-closure-boundary.json",

  ag27aAssessment: "data/content-intelligence/backend-decision/ag27a-backend-need-assessment.json",
  ag27aRequirementMatrix: "data/content-intelligence/backend-decision/ag27a-backend-requirement-matrix.json",
  existingAg27Checkpoint: "data/content-intelligence/backend-decision/ag27-supabase-auth-backend-decision-checkpoint.json",

  ag26zClosure: "data/content-intelligence/admin-editor/ag26z-manual-admin-editor-workflow-closure.json",
  ag26zRoutingClosure: "data/content-intelligence/admin-editor/ag26z-admin-editor-routing-closure-register.json",
  ag26zNonRuntimeClosure: "data/content-intelligence/admin-editor/ag26z-non-runtime-closure-register.json",

  ag26aPlan: "data/content-intelligence/admin-editor/ag26a-editor-workspace-ux-plan.json",
  ag26aRoutingModel: "data/content-intelligence/admin-editor/ag26a-admin-editor-system-routing-model.json",
  ag26bPlan: "data/content-intelligence/admin-editor/ag26b-admin-workspace-ux-plan.json",
  ag26bPublishControl: "data/content-intelligence/admin-editor/ag26b-admin-final-publish-control-model.json",
  ag25zClosure: "data/content-intelligence/featured-reads/ag25z-featured-reads-production-readiness-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag27c-supabase-auth-architecture-plan.json",
  plan: "data/content-intelligence/backend-decision/ag27c-supabase-auth-architecture-plan.json",
  roleAuthModel: "data/content-intelligence/backend-decision/ag27c-role-auth-architecture-model.json",
  tableBlueprint: "data/content-intelligence/backend-decision/ag27c-supabase-table-architecture-blueprint.json",
  workflowArchitecture: "data/content-intelligence/backend-decision/ag27c-admin-editor-workflow-architecture.json",
  publishStateArchitecture: "data/content-intelligence/backend-decision/ag27c-publishing-state-architecture.json",
  secretEnvironmentPlan: "data/content-intelligence/backend-decision/ag27c-secret-environment-governance-plan.json",
  consumptionPlan: "data/content-intelligence/backend-decision/ag27c-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag27c-supabase-auth-architecture-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag27c-supabase-auth-security-rls-plan-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag27c-to-ag27d-supabase-auth-security-rls-plan-boundary.json",
  registry: "data/quality/ag27c-supabase-auth-architecture-plan.json",
  preview: "data/quality/ag27c-supabase-auth-architecture-plan-preview.json",
  doc: "docs/quality/AG27C_SUPABASE_AUTH_ARCHITECTURE_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG27C input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag27bReview.status !== "backend_decision_audit_created_ready_for_ag27z") throw new Error("AG27B review status mismatch.");
if (records.ag27bAudit.status !== "backend_decision_audit_created_ready_for_ag27z") throw new Error("AG27B audit status mismatch.");
if (records.ag27bAudit.audit_decision?.selected_decision !== "continue_static") throw new Error("AG27B selected decision mismatch.");
if (records.ag27bConditionalGate.status !== "ag27c_ag27d_gate_closed_pending_explicit_approval") throw new Error("AG27B conditional gate status mismatch.");
if (records.ag27aAssessment.status !== "backend_need_assessment_created_ready_for_ag27b") throw new Error("AG27A status mismatch.");
if (records.existingAg27Checkpoint.status !== "supabase_auth_backend_decision_checkpoint_created_backend_deferred") throw new Error("Existing AG27 checkpoint status mismatch.");
if (records.existingAg27Checkpoint.checkpoint_decision?.backend_deferred !== true) throw new Error("Backend must remain deferred.");
if (records.ag26zClosure.status !== "manual_admin_editor_workflow_closed_existing_ag27_backend_deferred") throw new Error("AG26Z closure status mismatch.");
if (records.ag26aRoutingModel.role_routing_rules?.admin_final_publish_authority !== true) throw new Error("Admin final publish authority missing.");
if (records.ag26aRoutingModel.role_routing_rules?.editor_publish_authority !== false) throw new Error("Editor publish authority must remain false.");
if (records.ag26bPublishControl.final_publish_authority !== "admin_only") throw new Error("Admin-only publish control missing.");
if (records.ag25zClosure.status !== "featured_reads_production_readiness_closed_ready_for_ag26a") throw new Error("AG25Z status mismatch.");

const explicitApprovalRecord = {
  approval_type: "planning_only",
  approval_scope: "Prepare Supabase/Auth architecture plan and subsequent Supabase/Auth security/RLS planning for future backend path.",
  backend_activation_approved: false,
  auth_activation_approved: false,
  supabase_project_creation_approved: false,
  database_creation_approved: false,
  secret_creation_approved: false,
  runtime_queue_creation_approved: false,
  dynamic_publishing_approved: false
};

const blockedState = {
  supabase_auth_architecture_plan_created: true,
  explicit_planning_approval_recorded: true,
  backend_activation_approved: false,
  backend_enabled: false,
  auth_enabled: false,
  supabase_enabled: false,
  supabase_project_created: false,
  database_created: false,
  migration_created: false,
  table_created: false,
  rls_policy_created: false,
  secret_created: false,
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

const roles = [
  {
    role_id: "admin",
    auth_actor: true,
    purpose: "Core reviewer, assignment authority, final publish authority and governance owner.",
    can_create_independent_article_candidate: true,
    can_review_system_content_first: true,
    can_assign_to_editor: true,
    can_publish_future_runtime: true,
    rls_scope_needed_later: true
  },
  {
    role_id: "editor",
    auth_actor: true,
    purpose: "Creates independent article candidates and edits Admin-assigned system/existing content.",
    can_create_independent_article_candidate: true,
    can_edit_admin_assigned_content: true,
    can_publish_future_runtime: false,
    rls_scope_needed_later: true
  },
  {
    role_id: "system",
    auth_actor: false,
    purpose: "Represents AI/system-generated content source and automation events.",
    can_publish_future_runtime: false,
    must_route_generated_content_to_admin: true,
    rls_scope_needed_later: true
  },
  {
    role_id: "public_reader",
    auth_actor: false,
    purpose: "Unauthenticated public reader of already-published content only.",
    can_view_published_content_only: true,
    can_view_drafts_or_queue: false,
    rls_scope_needed_later: true
  },
  {
    role_id: "subscriber_future",
    auth_actor: true,
    purpose: "Future reader account/personalization/subscriber role.",
    can_view_personalized_content_later: true,
    can_access_admin_editor_queue: false,
    rls_scope_needed_later: true
  },
  {
    role_id: "auditor_future",
    auth_actor: true,
    purpose: "Future read-only audit/review role if governance requires it.",
    can_view_audit_logs_later: true,
    can_modify_content: false,
    rls_scope_needed_later: true
  }
];

const roleAuthModel = {
  module_id: "AG27C",
  title: "Role and Auth Architecture Model",
  status: "role_auth_architecture_model_created_no_auth_activation",
  roles,
  auth_principles: [
    "Admin and Editor are distinct future Auth actors.",
    "Admin remains final publish authority.",
    "Editor cannot publish.",
    "System-generated content must route to Admin first.",
    "Editor edits system/existing content only after Admin assignment.",
    "Public readers should only see published content.",
    "Subscriber/personalization is future-only and must not expose Admin/Editor workflow."
  ],
  auth_activation_allowed_now: false,
  blocked_state: blockedState
};

const tableGroups = [
  {
    table_group_id: "identity_access",
    planned_tables: [
      "profiles",
      "roles",
      "user_roles",
      "role_permissions",
      "session_audit_events"
    ],
    purpose: "Map Supabase Auth users to Drishvara roles and permissions.",
    create_now: false
  },
  {
    table_group_id: "content_core",
    planned_tables: [
      "articles",
      "article_versions",
      "article_sections",
      "article_metadata",
      "article_status_history"
    ],
    purpose: "Represent article candidates, versions, sections and status transitions.",
    create_now: false
  },
  {
    table_group_id: "admin_editor_workflow",
    planned_tables: [
      "review_queue",
      "editor_assignments",
      "admin_decisions",
      "editor_returns",
      "workflow_comments"
    ],
    purpose: "Support Admin-first review, Editor assignment, Editor return and Admin final decision.",
    create_now: false
  },
  {
    table_group_id: "references_attribution_objects",
    planned_tables: [
      "article_references",
      "reference_verification_status",
      "article_assets",
      "asset_attributions",
      "object_requirements",
      "object_generation_requests"
    ],
    purpose: "Track sources, reference verification, images, credits, objects and generation requirements.",
    create_now: false
  },
  {
    table_group_id: "publishing_audit",
    planned_tables: [
      "publish_records",
      "publish_snapshots",
      "rollback_records",
      "audit_logs",
      "governance_events"
    ],
    purpose: "Track final Admin publish decisions, snapshots, rollback records and audit history.",
    create_now: false
  },
  {
    table_group_id: "future_reader_personalization",
    planned_tables: [
      "subscriber_profiles",
      "reader_preferences",
      "saved_items",
      "entitlements",
      "notification_preferences"
    ],
    purpose: "Future personalization/subscriber layer only after separate approval.",
    create_now: false
  }
];

const tableBlueprint = {
  module_id: "AG27C",
  title: "Supabase Table Architecture Blueprint",
  status: "supabase_table_architecture_blueprint_created_no_tables",
  table_groups: tableGroups,
  table_creation_allowed_now: false,
  migration_creation_allowed_now: false,
  schema_execution_allowed_now: false,
  blocked_state: blockedState
};

const workflowArchitecture = {
  module_id: "AG27C",
  title: "Admin/Editor Workflow Architecture",
  status: "admin_editor_workflow_architecture_created_no_runtime_queue",
  canonical_backend_flows: [
    {
      flow_id: "system_generated_to_admin",
      steps: [
        "System creates candidate record in future review queue.",
        "Candidate is visible to Admin first.",
        "Admin reviews and decides hold/reject/assign/publish candidate later."
      ],
      queue_runtime_created_now: false
    },
    {
      flow_id: "editor_new_candidate_to_admin",
      steps: [
        "Editor creates new article candidate.",
        "Candidate enters Admin review queue.",
        "Admin performs final review and future publish decision."
      ],
      queue_runtime_created_now: false
    },
    {
      flow_id: "admin_assigned_editor_edit",
      steps: [
        "Admin assigns system/existing content to Editor.",
        "Editor edits using permitted tools.",
        "Editor returns content to Admin.",
        "Admin performs final decision."
      ],
      queue_runtime_created_now: false
    }
  ],
  admin_first_system_review: true,
  admin_final_publish_authority: true,
  editor_publish_authority: false,
  runtime_queue_allowed_now: false,
  blocked_state: blockedState
};

const publishStateArchitecture = {
  module_id: "AG27C",
  title: "Publishing State Architecture",
  status: "publishing_state_architecture_created_no_dynamic_publish",
  planned_states: [
    "draft_candidate",
    "system_generated_pending_admin_review",
    "editor_created_pending_admin_review",
    "admin_under_review",
    "admin_assigned_to_editor",
    "under_editor_review",
    "editor_returned_to_admin",
    "admin_hold",
    "admin_rejected",
    "admin_publish_candidate",
    "published",
    "rollback_candidate",
    "archived"
  ],
  publish_rules: {
    admin_can_publish_later: true,
    editor_can_publish_later: false,
    system_can_publish_later_without_admin: false,
    public_can_view_only_published: true
  },
  dynamic_publishing_allowed_now: false,
  blocked_state: blockedState
};

const secretEnvironmentPlan = {
  module_id: "AG27C",
  title: "Secret and Environment Governance Plan",
  status: "secret_environment_governance_plan_created_no_secrets",
  future_environment_variables: [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      scope: "future_public_client_config",
      create_now: false
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      scope: "future_public_client_config_with_rls",
      create_now: false
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      scope: "future_server_only_secret_never_client_never_repo",
      create_now: false
    },
    {
      name: "SUPABASE_JWT_SECRET",
      scope: "future_server_security_reference_never_repo",
      create_now: false
    }
  ],
  secret_rules: [
    "No secret is created in AG27C.",
    "No secret is committed to repository.",
    "Service role key must never be exposed to browser code.",
    "Future secrets require separate activation approval and environment-only storage.",
    "Any future backend code must be validated for secret leakage before commit."
  ],
  secret_creation_allowed_now: false,
  blocked_state: blockedState
};

const consumptionPlan = {
  module_id: "AG27C",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag27d",
  future_consumption: {
    AG27D:
      "Supabase/Auth Security and RLS Plan should consume AG27C role model, table blueprint, workflow architecture, publish-state architecture and secret governance plan to define RLS/access rules without creating policies.",
    AG27Z:
      "Backend Decision Closure should record that AG27C and AG27D were planning-only and no backend activation occurred.",
    AG28:
      "Backend/Auth Architecture Blueprint remains blocked until explicit approval for moving beyond planning-only records."
  },
  blocked_state: blockedState
};

const plan = {
  module_id: "AG27C",
  title: "Supabase/Auth Architecture Plan",
  status: "supabase_auth_architecture_plan_created_ready_for_ag27d",
  purpose:
    "Prepare a planning-only Supabase/Auth architecture for all future Admin, Editor, system, public reader, subscriber, article queue, review, publishing, audit, object and personalization modules without activating Supabase/Auth/backend or creating tables, secrets, migrations or runtime queues.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  explicit_approval_record: explicitApprovalRecord,
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag27b_status: records.ag27bAudit.status,
    ag27b_selected_decision_before_approval: records.ag27bAudit.audit_decision?.selected_decision,
    ag27b_required_explicit_approval: records.ag27bConditionalGate.explicit_approval_required_before_ag27c_ag27d_or_ag28 === true,
    ag27c_planning_now_approved: true,
    existing_ag27_backend_deferred: records.existingAg27Checkpoint.checkpoint_decision?.backend_deferred === true,
    ag26z_status: records.ag26zClosure.status,
    admin_final_publish_authority: records.ag26aRoutingModel.role_routing_rules?.admin_final_publish_authority === true,
    editor_publish_authority_blocked: records.ag26aRoutingModel.role_routing_rules?.editor_publish_authority === false
  },
  architecture_scope: {
    stage_type: "planning_only_supabase_auth_architecture",
    role_count: roles.length,
    table_group_count: tableGroups.length,
    workflow_flow_count: workflowArchitecture.canonical_backend_flows.length,
    publish_state_count: publishStateArchitecture.planned_states.length,
    backend_status: "deferred",
    auth_status: "deferred",
    supabase_status: "deferred",
    next_stage: "AG27D"
  },
  role_auth_model_file: outputs.roleAuthModel,
  table_blueprint_file: outputs.tableBlueprint,
  workflow_architecture_file: outputs.workflowArchitecture,
  publish_state_architecture_file: outputs.publishStateArchitecture,
  secret_environment_plan_file: outputs.secretEnvironmentPlan,
  future_consumption_plan_file: outputs.consumptionPlan,
  backend_activation_allowed_in_ag27c: false,
  auth_activation_allowed_in_ag27c: false,
  supabase_project_creation_allowed_in_ag27c: false,
  table_creation_allowed_in_ag27c: false,
  migration_creation_allowed_in_ag27c: false,
  secret_creation_allowed_in_ag27c: false,
  runtime_queue_creation_allowed_in_ag27c: false,
  dynamic_publishing_allowed_in_ag27c: false,
  deployment_allowed_in_ag27c: false,
  publication_allowed_in_ag27c: false,
  supabase_auth_backend_deferred: true,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG27C",
  title: "Supabase/Auth Architecture Plan Blocker Register",
  status: "supabase_auth_architecture_plan_runtime_operations_blocked_pending_ag27d",
  blocked_items: [
    "No backend activation.",
    "No Auth activation.",
    "No Supabase activation.",
    "No Supabase project creation.",
    "No database creation.",
    "No table creation.",
    "No migration creation.",
    "No RLS policy creation.",
    "No secret creation.",
    "No Admin login creation.",
    "No Editor login creation.",
    "No runtime queue creation.",
    "No runtime write path.",
    "No dynamic publishing.",
    "No article mutation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No AG28 start without explicit approval."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG27C",
  title: "Supabase/Auth Security and RLS Plan Readiness Record",
  status: "ready_for_ag27d_supabase_auth_security_rls_plan",
  ready_for_ag27d: true,
  next_stage_id: "AG27D",
  next_stage_title: "Supabase/Auth Security and RLS Plan",
  supabase_auth_architecture_plan_created: true,
  role_auth_model_created: true,
  table_blueprint_created: true,
  workflow_architecture_created: true,
  publishing_state_architecture_created: true,
  secret_environment_plan_created: true,
  backend_activation_allowed_now: false,
  auth_activation_allowed_now: false,
  supabase_activation_allowed_now: false,
  real_execution_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG27C",
  title: "AG27C to AG27D Supabase/Auth Security and RLS Plan Boundary",
  status: "ag27d_boundary_created_not_started",
  next_stage_id: "AG27D",
  next_stage_title: "Supabase/Auth Security and RLS Plan",
  allowed_scope: [
    "Consume AG27C role/auth model.",
    "Consume AG27C table architecture blueprint.",
    "Consume AG27C Admin/Editor workflow architecture.",
    "Consume AG27C publishing state architecture.",
    "Consume AG27C secret/environment governance plan.",
    "Plan security, RLS and access rules only.",
    "Do not create policies, migrations, tables, secrets, Auth, backend, deployment or publishing."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_runtime_activation: true
};

const review = {
  module_id: "AG27C",
  title: "Supabase/Auth Architecture Plan",
  status: "supabase_auth_architecture_plan_created_ready_for_ag27d",
  depends_on: ["AG27B", "AG27A", "AG27_EXISTING", "AG26Z", "AG26A", "AG26B", "AG25Z"],
  generated_from: inputs,
  plan_file: outputs.plan,
  role_auth_model_file: outputs.roleAuthModel,
  table_blueprint_file: outputs.tableBlueprint,
  workflow_architecture_file: outputs.workflowArchitecture,
  publish_state_architecture_file: outputs.publishStateArchitecture,
  secret_environment_plan_file: outputs.secretEnvironmentPlan,
  future_consumption_plan_file: outputs.consumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    supabase_auth_architecture_plan_created: true,
    explicit_planning_approval_recorded: true,
    planning_only: true,
    ready_for_ag27d: true,
    role_count: roles.length,
    table_group_count: tableGroups.length,
    workflow_flow_count: workflowArchitecture.canonical_backend_flows.length,
    publish_state_count: publishStateArchitecture.planned_states.length,
    backend_activation_approved_now: false,
    auth_activation_approved_now: false,
    supabase_project_created: false,
    database_created: false,
    table_created: false,
    migration_created: false,
    rls_policy_created: false,
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
  module_id: "AG27C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG27C",
  preview_only: true,
  status: review.status,
  message: "AG27C Supabase/Auth Architecture Plan created as planning-only. Next: AG27D Supabase/Auth Security and RLS Plan.",
  planning_only: true,
  ready_for_ag27d: true,
  role_count: roles.length,
  table_group_count: tableGroups.length,
  workflow_flow_count: workflowArchitecture.canonical_backend_flows.length,
  backend_activation_approved_now: 0,
  auth_enabled: 0,
  supabase_enabled: 0,
  database_objects: 0,
  table_objects: 0,
  migration_objects: 0,
  secret_objects: 0,
  runtime_queues: 0,
  deployments: 0,
  published_items: 0,
  blocked_state: blockedState
};

const doc = `# AG27C — Supabase/Auth Architecture Plan

## Purpose

AG27C prepares a planning-only Supabase/Auth architecture for Drishvara.

It covers future Admin, Editor, system, public reader, subscriber, article queue, review workflow, publishing, audit, references, attribution, object-generation tracking and personalization modules.

## Planning Approval Scope

This stage records approval to prepare architecture and security planning only.

It does not approve backend activation, Auth activation, Supabase project creation, database creation, migration creation, secret creation, runtime queues, dynamic publishing, deployment or publishing.

## Architecture Coverage

- Role and Auth architecture model.
- Supabase table architecture blueprint.
- Admin/Editor workflow architecture.
- Publishing state architecture.
- Secret and environment governance plan.

## Preserved Governance

- Admin remains final publish authority.
- Editor cannot publish.
- System-generated content goes to Admin first.
- Editor edits system/existing content only after Admin assignment.
- Public readers only see published content.
- Subscriber/personalization remains future-only.

## Non-Activation Boundary

AG27C does not create Supabase project, Auth, database, tables, migrations, RLS policies, secrets, runtime queues, GitHub writes, deployment or publishing.

## Next Stage

AG27D — Supabase/Auth Security and RLS Plan.
`;

writeJson(outputs.review, review);
writeJson(outputs.plan, plan);
writeJson(outputs.roleAuthModel, roleAuthModel);
writeJson(outputs.tableBlueprint, tableBlueprint);
writeJson(outputs.workflowArchitecture, workflowArchitecture);
writeJson(outputs.publishStateArchitecture, publishStateArchitecture);
writeJson(outputs.secretEnvironmentPlan, secretEnvironmentPlan);
writeJson(outputs.consumptionPlan, consumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG27C Supabase/Auth Architecture Plan generated.");
console.log("✅ Planning-only approval recorded.");
console.log(`✅ Roles planned: ${roles.length}`);
console.log(`✅ Table groups planned: ${tableGroups.length}`);
console.log("✅ Admin/Editor workflow and publishing-state architecture planned.");
console.log("✅ No Supabase/Auth/backend/database/secret/runtime activation performed.");
console.log("✅ AG27D Supabase/Auth Security and RLS Plan boundary created.");
