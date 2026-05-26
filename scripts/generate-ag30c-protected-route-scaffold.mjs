import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag30bReview: "data/content-intelligence/quality-reviews/ag30b-editor-login-ui-scaffold.json",
  ag30bScaffold: "data/content-intelligence/backend-architecture/ag30b-editor-login-ui-scaffold.json",
  ag30bInterfaceModel: "data/content-intelligence/backend-architecture/ag30b-editor-login-interface-model.json",
  ag30bRoutePreview: "data/content-intelligence/backend-architecture/ag30b-editor-login-route-preview.json",
  ag30bAssignedOnlyUiModel: "data/content-intelligence/backend-architecture/ag30b-editor-assigned-only-ui-model.json",
  ag30bNonAuthBehaviourModel: "data/content-intelligence/backend-architecture/ag30b-non-auth-ui-behaviour-model.json",
  ag30bReadiness: "data/content-intelligence/quality-registry/ag30b-protected-route-scaffold-readiness-record.json",
  ag30bBoundary: "data/content-intelligence/mutation-plans/ag30b-to-ag30c-protected-route-scaffold-boundary.json",

  ag30aScaffold: "data/content-intelligence/backend-architecture/ag30a-admin-login-ui-scaffold.json",
  ag30aInterfaceModel: "data/content-intelligence/backend-architecture/ag30a-admin-login-interface-model.json",
  ag30aRoutePreview: "data/content-intelligence/backend-architecture/ag30a-admin-login-route-preview.json",

  ag29zClosure: "data/content-intelligence/backend-architecture/ag29z-schema-rls-closure.json",
  ag29zHandoff: "data/content-intelligence/backend-architecture/ag29z-ag30-login-route-scaffold-handoff-plan.json",
  ag29zActivationBlocker: "data/content-intelligence/backend-architecture/ag29z-activation-blocker-carry-forward.json",

  ag29bRoleScope: "data/content-intelligence/backend-architecture/ag29b-role-scope-policy-register.json",
  ag29aStateFieldModel: "data/content-intelligence/backend-architecture/ag29a-state-field-model.json",
  ag28AuthSessionModel: "data/content-intelligence/backend-architecture/ag28-auth-session-architecture-model.json",
  ag28ApiRouteTaxonomy: "data/content-intelligence/backend-architecture/ag28-api-route-taxonomy.json",

  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag30c-protected-route-scaffold.json",
  scaffold: "data/content-intelligence/backend-architecture/ag30c-protected-route-scaffold.json",
  protectedRouteMap: "data/content-intelligence/backend-architecture/ag30c-protected-route-map.json",
  guardPlaceholderModel: "data/content-intelligence/backend-architecture/ag30c-route-guard-placeholder-model.json",
  routeSurfaceRegister: "data/content-intelligence/backend-architecture/ag30c-route-surface-scaffold-register.json",
  nonAuthRouteAudit: "data/content-intelligence/backend-architecture/ag30c-non-auth-route-audit-register.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag30c-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag30c-protected-route-scaffold-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag30c-login-ui-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag30c-to-ag30d-login-ui-audit-boundary.json",
  registry: "data/quality/ag30c-protected-route-scaffold.json",
  preview: "data/quality/ag30c-protected-route-scaffold-preview.json",
  doc: "docs/quality/AG30C_PROTECTED_ROUTE_SCAFFOLD.md",
  adminIndex: "admin/index.html",
  adminReview: "admin/review.html",
  editorIndex: "editor/index.html",
  editorWorkspace: "editor/workspace.html"
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
  if (!exists(p)) throw new Error(`Missing AG30C input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, readJson(file)])
);

if (records.ag30bReview.status !== "editor_login_ui_scaffold_created_ready_for_ag30c") throw new Error("AG30B review status mismatch.");
if (records.ag30bScaffold.status !== "editor_login_ui_scaffold_created_ready_for_ag30c") throw new Error("AG30B scaffold status mismatch.");
if (records.ag30bReadiness.ready_for_ag30c !== true) throw new Error("AG30B readiness does not permit AG30C.");
if (records.ag30bReadiness.allowed_ag30c_mode !== "non_active_protected_route_scaffold_only") throw new Error("AG30C mode mismatch.");
if (records.ag30bBoundary.next_stage_id !== "AG30C") throw new Error("AG30B boundary does not point to AG30C.");

for (const flag of [
  "auth_activation_approved_now",
  "real_editor_login_approved_now",
  "session_runtime_approved_now",
  "credential_processing_approved_now",
  "assignment_query_approved_now",
  "editor_workspace_runtime_approved_now",
  "backend_connection_approved_now",
  "supabase_connection_approved_now",
  "server_route_creation_approved_now",
  "api_route_creation_approved_now",
  "secret_creation_approved_now",
  "env_var_write_approved_now",
  "deployment_approved_now",
  "public_mutation_approved_now"
]) {
  if (records.ag30bScaffold.scaffold_decision?.[flag] !== false) {
    throw new Error(`AG30B must keep ${flag} false.`);
  }
}

if (records.ag30aScaffold.status !== "admin_login_ui_scaffold_created_ready_for_ag30b") throw new Error("AG30A scaffold status mismatch.");
if (records.ag29zClosure.status !== "schema_rls_closure_created_ready_for_ag30") throw new Error("AG29Z closure status mismatch.");
if (records.ag29zHandoff.ag30_ready !== true) throw new Error("AG30 handoff readiness missing.");
if (records.ag29zHandoff.ag30_activation_allowed !== false) throw new Error("AG30 activation must remain false.");
for (const [key, value] of Object.entries(records.ag29zActivationBlocker.blocked_activation_items || {})) {
  if (value !== false) throw new Error(`AG29Z activation blocker must remain false: ${key}`);
}
if (records.ag28AuthSessionModel.auth_enabled_now !== false) throw new Error("AG28 Auth must remain disabled.");
if (records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority !== true) throw new Error("Admin final clearance missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) throw new Error("Editor assigned-only rule missing.");
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) throw new Error("Editor no-publish rule missing.");

const editorRole = records.ag29bRoleScope.role_scopes.find((item) => item.role_code === "editor");
if (!editorRole) throw new Error("Editor role scope missing.");
if (!editorRole.forbidden_future_actions.includes("global_browse")) throw new Error("Editor global browse block missing.");
if (!editorRole.forbidden_future_actions.includes("self_assign")) throw new Error("Editor self-assign block missing.");
if (!editorRole.forbidden_future_actions.includes("publish")) throw new Error("Editor publish block missing.");

const blockedState = {
  protected_route_scaffold_created: true,
  protected_route_map_created: true,
  route_guard_placeholder_model_created: true,
  route_surface_scaffold_register_created: true,
  non_auth_route_audit_created: true,
  admin_index_page_created: true,
  admin_review_page_created: true,
  editor_index_page_created: true,
  editor_workspace_page_created: true,
  runtime_backend_created: false,
  supabase_project_created: false,
  supabase_connected: false,
  sql_generated: false,
  migration_generated: false,
  database_table_created: false,
  database_constraint_created: false,
  database_index_created: false,
  rls_policy_created: false,
  rls_policy_applied: false,
  auth_enabled: false,
  real_admin_login_created: false,
  real_editor_login_created: false,
  session_runtime_created: false,
  credential_processing_created: false,
  route_guard_runtime_created: false,
  admin_review_runtime_created: false,
  editor_workspace_runtime_created: false,
  editor_assignment_runtime_created: false,
  secrets_created: false,
  env_vars_written: false,
  service_role_key_created: false,
  service_role_key_exposed: false,
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
  supabase_auth_backend_activated: false
};

const protectedRoutes = [
  {
    route_id: "admin_home",
    route_path: "/admin/",
    static_file: outputs.adminIndex,
    intended_role: "admin",
    future_guard: "admin_role_required",
    runtime_guard_created_now: false
  },
  {
    route_id: "admin_review",
    route_path: "/admin/review",
    static_file: outputs.adminReview,
    intended_role: "admin",
    future_guard: "admin_role_required_final_clearance",
    runtime_guard_created_now: false
  },
  {
    route_id: "editor_home",
    route_path: "/editor/",
    static_file: outputs.editorIndex,
    intended_role: "editor",
    future_guard: "editor_role_required_assigned_only",
    runtime_guard_created_now: false
  },
  {
    route_id: "editor_workspace",
    route_path: "/editor/workspace",
    static_file: outputs.editorWorkspace,
    intended_role: "editor",
    future_guard: "editor_role_required_assigned_item_only",
    runtime_guard_created_now: false
  }
];

const protectedRouteMap = {
  module_id: "AG30C",
  title: "Protected Route Map",
  status: "protected_route_map_created_no_runtime_guard",
  protected_route_count: protectedRoutes.length,
  protected_routes: protectedRoutes,
  login_routes_consumed: [
    "admin/login.html",
    "editor/login.html"
  ],
  runtime_route_guard_created: false,
  auth_enabled: false,
  session_runtime_created: false,
  blocked_state: blockedState
};

const guardPlaceholderModel = {
  module_id: "AG30C",
  title: "Route Guard Placeholder Model",
  status: "route_guard_placeholder_model_created_no_real_auth",
  future_guard_rules: [
    {
      guard_id: "admin_only_guard",
      applies_to: ["/admin/", "/admin/review"],
      future_requirement: "Valid Admin session with Admin role.",
      created_now: false
    },
    {
      guard_id: "editor_only_guard",
      applies_to: ["/editor/", "/editor/workspace"],
      future_requirement: "Valid Editor session with assigned-item scope.",
      created_now: false
    },
    {
      guard_id: "editor_assigned_item_guard",
      applies_to: ["/editor/workspace"],
      future_requirement: "Editor can access only Admin-assigned articles.",
      created_now: false
    },
    {
      guard_id: "admin_final_clearance_guard",
      applies_to: ["/admin/review"],
      future_requirement: "Admin remains final clearance authority.",
      created_now: false
    }
  ],
  forbidden_now: [
    "No Auth check.",
    "No session cookie check.",
    "No token validation.",
    "No route middleware.",
    "No API call.",
    "No backend request.",
    "No credential handling.",
    "No assignment query."
  ],
  route_guard_runtime_created: false,
  auth_activation_allowed: false,
  blocked_state: blockedState
};

const routeSurfaceRegister = {
  module_id: "AG30C",
  title: "Route Surface Scaffold Register",
  status: "route_surface_scaffold_register_created_no_runtime",
  surfaces: [
    {
      surface_id: "admin_home_surface",
      file: outputs.adminIndex,
      purpose: "Non-active Admin area placeholder.",
      runtime_created_now: false
    },
    {
      surface_id: "admin_review_surface",
      file: outputs.adminReview,
      purpose: "Non-active Admin review placeholder.",
      runtime_created_now: false
    },
    {
      surface_id: "editor_home_surface",
      file: outputs.editorIndex,
      purpose: "Non-active Editor area placeholder.",
      runtime_created_now: false
    },
    {
      surface_id: "editor_workspace_surface",
      file: outputs.editorWorkspace,
      purpose: "Non-active Editor workspace placeholder.",
      runtime_created_now: false
    }
  ],
  admin_final_clearance_notice_required: true,
  editor_assigned_only_notice_required: true,
  editor_no_publish_notice_required: true,
  runtime_surfaces_created: false,
  blocked_state: blockedState
};

const nonAuthRouteAudit = {
  module_id: "AG30C",
  title: "Non-Auth Route Audit Register",
  status: "non_auth_route_audit_passed",
  checks: [
    {
      check_id: "static_pages_only",
      passed: true,
      evidence: "AG30C creates static placeholder pages only."
    },
    {
      check_id: "no_auth_runtime",
      passed: true,
      evidence: "No Auth activation or session runtime is created."
    },
    {
      check_id: "no_backend_requests",
      passed: true,
      evidence: "Pages do not call fetch/XHR/API/backend services."
    },
    {
      check_id: "no_browser_storage",
      passed: true,
      evidence: "Pages do not use localStorage/sessionStorage for auth."
    },
    {
      check_id: "admin_editor_rules_visible",
      passed: true,
      evidence: "Admin final clearance and Editor assigned-only/no-publish rules are visible in scaffold records."
    },
    {
      check_id: "no_deployment_or_public_mutation",
      passed: true,
      evidence: "No deployment, publishing or public mutation is performed."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG30C",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag30d",
  future_consumption: {
    AG30D:
      "AG30D should audit Admin/Editor login and route scaffold pages as visible UI-only surfaces with no real Auth activation.",
    AG30Z:
      "AG30Z should close AG30A-AG30D as non-active login/route scaffold planning.",
    AG31:
      "AG31 queue/state planning should consume AG30C protected route map, AG30B Editor assigned-only UI model and AG29A state fields.",
    AG35_and_later:
      "Real protected routes require explicit approval, Auth activation, RLS review, secret placement review and tested Admin/Editor accounts."
  },
  blocked_state: blockedState
};

function routePage(title, eyebrow, body, notices) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Non-active Route Scaffold</title>
  <meta name="robots" content="noindex,nofollow" />
  <style>
    :root {
      --bg: #f8fafc;
      --panel: #ffffff;
      --text: #17324d;
      --muted: #64748b;
      --accent: #1f7a8c;
      --border: #dbeafe;
      --warn: #92400e;
      --warn-bg: #fffbeb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background: linear-gradient(135deg, #f8fafc 0%, #eef7fb 100%);
      display: grid;
      place-items: center;
      padding: 24px;
    }
    main {
      width: min(920px, 100%);
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
      padding: 30px;
    }
    .eyebrow {
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 900;
      margin-bottom: 12px;
    }
    h1 {
      font-size: clamp(30px, 5vw, 48px);
      line-height: 1.04;
      margin: 0 0 14px;
    }
    p {
      color: var(--muted);
      line-height: 1.6;
      margin: 0 0 16px;
    }
    .notice {
      border: 1px solid #fcd34d;
      background: var(--warn-bg);
      color: var(--warn);
      border-radius: 18px;
      padding: 14px 16px;
      margin-top: 14px;
      font-weight: 800;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 12px;
      margin-top: 20px;
    }
    .tile {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 18px;
      padding: 14px;
      color: #334155;
      font-weight: 750;
    }
  </style>
</head>
<body>
  <main>
    <div class="eyebrow">${eyebrow}</div>
    <h1>${title}</h1>
    <p>${body}</p>
    <div class="notice">Non-active protected route scaffold only. Access control is not active.</div>
    <section class="grid" aria-label="Route governance">
      ${notices.map((notice) => `<div class="tile">${notice}</div>`).join("\n      ")}
    </section>
  </main>
</body>
</html>
`;
}

const pages = {
  [outputs.adminIndex]: routePage(
    "Admin Area",
    "AG30C Admin route",
    "This placeholder represents the future Admin area. It is visible as static UI only and does not check credentials, create a session or call backend services.",
    ["Admin final clearance authority", "No real route guard", "No session runtime", "No backend request"]
  ),
  [outputs.adminReview]: routePage(
    "Admin Review",
    "AG30C Admin review route",
    "This placeholder represents the future Admin review area for returned, archived, approved and publish-review workflows. It is UI-only.",
    ["Admin final clearance required", "No publish action active", "No audit runtime", "No backend request"]
  ),
  [outputs.editorIndex]: routePage(
    "Editor Area",
    "AG30C Editor route",
    "This placeholder represents the future Editor area. Editor access remains limited to Admin-assigned work only after future activation.",
    ["Assigned items only", "No global browse", "No self-assignment", "No publishing"]
  ),
  [outputs.editorWorkspace]: routePage(
    "Editor Workspace",
    "AG30C Editor workspace route",
    "This placeholder represents the future Editor workspace. It does not query assignments, save edits or submit work.",
    ["Assigned item required later", "No assignment query now", "Submit back to Admin later", "No publishing"]
  )
};

const scaffold = {
  module_id: "AG30C",
  title: "Protected Route Scaffold",
  status: "protected_route_scaffold_created_ready_for_ag30d",
  purpose:
    "Create a non-active protected route scaffold for Admin and Editor surfaces, including /admin, /editor, /admin/review and /editor/workspace, without real Auth, route guard runtime, sessions, backend requests, Supabase connection, secrets, deployment or public mutation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  consumed_source_summary: {
    ag30b_status: records.ag30bScaffold.status,
    ag30a_status: records.ag30aScaffold.status,
    ag29z_status: records.ag29zClosure.status,
    admin_final_clearance_preserved: records.ag26zRoleGovernance.role_rules?.admin_final_clearance_authority === true,
    editor_assigned_only_preserved: records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items === true,
    editor_no_publish_preserved: records.ag26zRoleGovernance.role_rules?.editor_cannot_publish === true
  },
  scaffold_decision: {
    non_active_protected_route_scaffold_created: true,
    protected_route_map_created: true,
    route_guard_placeholder_model_created: true,
    route_surface_scaffold_register_created: true,
    non_auth_route_audit_created: true,
    admin_index_page_created: true,
    admin_review_page_created: true,
    editor_index_page_created: true,
    editor_workspace_page_created: true,
    proceed_to_ag30d_login_ui_audit: true,
    auth_activation_approved_now: false,
    route_guard_runtime_approved_now: false,
    session_runtime_approved_now: false,
    credential_processing_approved_now: false,
    assignment_query_approved_now: false,
    backend_connection_approved_now: false,
    supabase_connection_approved_now: false,
    server_route_creation_approved_now: false,
    api_route_creation_approved_now: false,
    secret_creation_approved_now: false,
    env_var_write_approved_now: false,
    deployment_approved_now: false,
    public_mutation_approved_now: false
  },
  route_files_created: [
    outputs.adminIndex,
    outputs.adminReview,
    outputs.editorIndex,
    outputs.editorWorkspace
  ],
  protected_route_map_file: outputs.protectedRouteMap,
  guard_placeholder_model_file: outputs.guardPlaceholderModel,
  route_surface_register_file: outputs.routeSurfaceRegister,
  non_auth_route_audit_file: outputs.nonAuthRouteAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  auth_activation_allowed_in_ag30c: false,
  route_guard_runtime_allowed_in_ag30c: false,
  session_runtime_allowed_in_ag30c: false,
  credential_processing_allowed_in_ag30c: false,
  assignment_query_allowed_in_ag30c: false,
  backend_connection_allowed_in_ag30c: false,
  supabase_connection_allowed_in_ag30c: false,
  sql_generation_allowed_in_ag30c: false,
  migration_generation_allowed_in_ag30c: false,
  database_creation_allowed_in_ag30c: false,
  rls_policy_application_allowed_in_ag30c: false,
  secret_creation_allowed_in_ag30c: false,
  env_var_write_allowed_in_ag30c: false,
  server_route_creation_allowed_in_ag30c: false,
  api_route_creation_allowed_in_ag30c: false,
  deployment_allowed_in_ag30c: false,
  public_mutation_allowed_in_ag30c: false,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG30C",
  title: "Protected Route Scaffold Blocker Register",
  status: "protected_route_scaffold_operations_blocked_pending_ag30d",
  blocked_items: [
    "No real Auth activation.",
    "No real Admin login.",
    "No real Editor login.",
    "No credential processing.",
    "No credential storage.",
    "No session runtime.",
    "No route guard runtime.",
    "No assignment query.",
    "No Admin review runtime.",
    "No Editor workspace runtime.",
    "No Supabase project creation.",
    "No Supabase connection.",
    "No SQL generation.",
    "No migration generation.",
    "No database table creation.",
    "No RLS policy creation or application.",
    "No secrets creation.",
    "No environment variable write.",
    "No server/API route runtime.",
    "No queue runtime.",
    "No audit runtime.",
    "No dynamic publish runtime.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No deployment trigger.",
    "No publishing.",
    "No public mutation."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG30C",
  title: "Login UI Audit Readiness Record",
  status: "ready_for_ag30d_login_ui_audit",
  ready_for_ag30d: true,
  next_stage_id: "AG30D",
  next_stage_title: "Login UI Audit",
  allowed_ag30d_mode: "non_active_login_ui_audit_only",
  protected_route_scaffold_created: true,
  route_surface_scaffold_register_created: true,
  non_auth_route_audit_passed: true,
  real_execution_allowed_now: false,
  auth_activation_allowed_now: false,
  backend_activation_allowed_now: false,
  supabase_auth_backend_activation_allowed_now: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG30C",
  title: "AG30C to AG30D Login UI Audit Boundary",
  status: "ag30d_boundary_created_non_active_login_ui_audit_only",
  next_stage_id: "AG30D",
  next_stage_title: "Login UI Audit",
  allowed_scope: [
    "Audit Admin login UI scaffold.",
    "Audit Editor login UI scaffold.",
    "Audit Admin/Editor protected route scaffold pages.",
    "Confirm pages are visible as UI-only.",
    "Confirm no real Auth activation, sessions, backend requests or route guard runtime.",
    "Keep credentials, server/API runtime, secrets, deployment and public mutation blocked."
  ],
  blocked_scope: blocker.blocked_items,
  backend_planning_selected: true,
  backend_activation_deferred: true,
  supabase_auth_backend_deferred: true,
  explicit_approval_required_before_real_activation: true
};

const review = {
  module_id: "AG30C",
  title: "Protected Route Scaffold",
  status: "protected_route_scaffold_created_ready_for_ag30d",
  depends_on: ["AG30B", "AG30A", "AG29Z", "AG29B", "AG28", "AG26Z"],
  generated_from: inputs,
  scaffold_file: outputs.scaffold,
  protected_route_map_file: outputs.protectedRouteMap,
  guard_placeholder_model_file: outputs.guardPlaceholderModel,
  route_surface_register_file: outputs.routeSurfaceRegister,
  non_auth_route_audit_file: outputs.nonAuthRouteAudit,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  route_files_created: scaffold.route_files_created,
  summary: {
    protected_route_scaffold_created: true,
    non_active_route_scaffold_only: true,
    protected_route_map_created: true,
    route_guard_placeholder_model_created: true,
    route_surface_scaffold_register_created: true,
    non_auth_route_audit_created: true,
    admin_index_page_created: true,
    admin_review_page_created: true,
    editor_index_page_created: true,
    editor_workspace_page_created: true,
    ready_for_ag30d: true,
    auth_activation_allowed_now: false,
    route_guard_runtime_allowed_now: false,
    session_runtime_allowed_now: false,
    credential_processing_allowed_now: false,
    assignment_query_allowed_now: false,
    backend_connection_allowed_now: false,
    supabase_connection_allowed_now: false,
    sql_generation_allowed_now: false,
    migration_generation_allowed_now: false,
    database_creation_allowed_now: false,
    rls_policy_application_allowed_now: false,
    secret_creation_allowed_now: false,
    env_var_write_allowed_now: false,
    server_route_creation_allowed_now: false,
    api_route_creation_allowed_now: false,
    deployment_done: false,
    public_mutation_done: false,
    real_execution_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG30C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG30C",
  preview_only: true,
  status: review.status,
  message: "AG30C Protected Route Scaffold created. Next: AG30D Login UI Audit.",
  protected_route_scaffold_created: 1,
  protected_route_map_created: 1,
  route_guard_placeholder_model_created: 1,
  route_surface_scaffold_register_created: 1,
  non_auth_route_audit_created: 1,
  static_route_pages_created: 4,
  auth_enabled: 0,
  route_guard_runtime_created: 0,
  session_runtime_created: 0,
  credential_processing_enabled: 0,
  assignment_query_created: 0,
  backend_connection_enabled: 0,
  supabase_connection_enabled: 0,
  sql_generated: 0,
  migrations_generated: 0,
  database_objects_created: 0,
  rls_policies_applied: 0,
  secrets_created: 0,
  env_vars_written: 0,
  server_routes_created: 0,
  api_routes_created: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  blocked_state: blockedState
};

const doc = `# AG30C — Protected Route Scaffold

## Purpose

AG30C creates a non-active protected route scaffold for Admin and Editor surfaces.

## Static Scaffold Pages Created

- \`admin/index.html\`
- \`admin/review.html\`
- \`editor/index.html\`
- \`editor/workspace.html\`

## Created Planning Records

- Protected route map.
- Route guard placeholder model.
- Route surface scaffold register.
- Non-auth route audit register.
- Future consumption plan for AG30D.

## Important Boundary

The scaffold is UI-only.

No real Auth, route guard runtime, session runtime, credential processing, assignment query, backend request, Supabase connection, SQL, database, RLS policy, secret, environment variable, server/API runtime, deployment, publishing or public mutation is created.

## Governance Preserved

Admin remains final clearance authority. Editor remains assigned-only and cannot publish.

## Next Stage

AG30D — Login UI Audit — non-active audit only.
`;

for (const [file, content] of Object.entries(pages)) {
  writeText(file, content);
}

writeJson(outputs.review, review);
writeJson(outputs.scaffold, scaffold);
writeJson(outputs.protectedRouteMap, protectedRouteMap);
writeJson(outputs.guardPlaceholderModel, guardPlaceholderModel);
writeJson(outputs.routeSurfaceRegister, routeSurfaceRegister);
writeJson(outputs.nonAuthRouteAudit, nonAuthRouteAudit);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG30C Protected Route Scaffold generated.");
console.log("✅ Non-active admin/editor protected route pages created.");
console.log("✅ Protected route map, guard placeholder model and route surface register created.");
console.log("✅ No real Auth, route guard runtime, sessions, credentials, assignment query, backend/Supabase connection, secrets, deployment or public mutation performed.");
console.log("✅ AG30D Login UI Audit boundary created.");
