import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag40aPackage: "data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json",
  ag40aResult: "data/content-intelligence/backend-architecture/ag40a-live-article-url-result-record.json",
  ag40aApproval: "data/content-intelligence/backend-architecture/ag40a-live-url-operator-approval-record.json",
  ag40aNoMutation: "data/content-intelligence/backend-architecture/ag40a-no-mutation-audit-register.json",
  ag40aReadiness: "data/content-intelligence/quality-registry/ag40a-admin-editor-workflow-test-readiness-record.json",
  ag40aBoundary: "data/content-intelligence/mutation-plans/ag40a-to-ag40b-admin-editor-workflow-test-boundary.json",
  ag39zClosure: "data/content-intelligence/backend-architecture/ag39z-controlled-execution-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag40b-admin-editor-workflow-test.json",
  package: "data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json",
  routeResult: "data/content-intelligence/backend-architecture/ag40b-admin-editor-route-result-record.json",
  workflowSurfaceResult: "data/content-intelligence/backend-architecture/ag40b-workflow-surface-result-record.json",
  operatorApprovalRecord: "data/content-intelligence/backend-architecture/ag40b-operator-approval-record.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag40b-no-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag40b-admin-editor-workflow-test-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag40b-public-listing-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag40b-to-ag40c-public-listing-test-boundary.json",
  registry: "data/quality/ag40b-admin-editor-workflow-test.json",
  preview: "data/quality/ag40b-admin-editor-workflow-test-preview.json",
  doc: "docs/quality/AG40B_ADMIN_EDITOR_WORKFLOW_TEST.md"
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
function normBase(url) {
  return String(url || "").replace(/\/+$/, "");
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG40B input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag40aPackage.status !== "live_article_url_test_created_ready_for_ag40b") {
  throw new Error("AG40A package status mismatch.");
}
if (records.ag40aResult.live_url_test_passed !== true) {
  throw new Error("AG40A live URL test must pass before AG40B.");
}
if (records.ag40aReadiness.ready_for_ag40b !== true) {
  throw new Error("AG40A readiness does not permit AG40B.");
}
if (records.ag40aBoundary.next_stage_id !== "AG40B") {
  throw new Error("AG40A boundary does not point to AG40B.");
}
if (records.ag40aNoMutation.audit_passed !== true) {
  throw new Error("AG40A no-mutation audit must pass.");
}
if (records.ag39zClosure.status !== "controlled_execution_closure_created_ready_for_ag40a_live_article_url_test") {
  throw new Error("AG39Z closure status mismatch.");
}

const baseUrl = normBase(process.env.AG40B_SITE_BASE_URL || "https://drishvara.com");

const routeCandidates = [
  {
    route_id: "admin_login",
    expected_surface: "admin_login",
    urls: [`${baseUrl}/admin/login.html`, `${baseUrl}/admin-login.html`]
  },
  {
    route_id: "editor_login",
    expected_surface: "editor_login",
    urls: [`${baseUrl}/editor/login.html`, `${baseUrl}/editor-login.html`]
  },
  {
    route_id: "admin_dashboard",
    expected_surface: "admin_dashboard_or_guarded_route",
    urls: [`${baseUrl}/admin-dashboard.html`, `${baseUrl}/admin/dashboard.html`]
  },
  {
    route_id: "editor_dashboard",
    expected_surface: "editor_dashboard_or_guarded_route",
    urls: [`${baseUrl}/editor-dashboard.html`, `${baseUrl}/editor/dashboard.html`]
  }
];

async function probe(url) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "user-agent": "Drishvara-AG40B-ReadOnly-Workflow-Test/1.0" }
    });
    const text = await response.text();
    return {
      url,
      final_url: response.url,
      http_status: response.status,
      response_ok: response.ok,
      content_type: response.headers.get("content-type") || "",
      elapsed_ms: Date.now() - started,
      page_title: (text.match(/<title[^>]*>(.*?)<\/title>/is)?.[1] || null)?.replace(/\s+/g, " ").trim() || null,
      has_html: /<html[\s>]/i.test(text) || /<!doctype html/i.test(text),
      has_drishvara_signal: /drishvara/i.test(text),
      has_admin_signal: /admin/i.test(text),
      has_editor_signal: /editor/i.test(text),
      has_login_signal: /login|sign in|signin|email|password/i.test(text),
      has_dashboard_signal: /dashboard|workspace|review|article|workflow/i.test(text),
      sample_sha256: crypto.createHash("sha256").update(text.slice(0, 5000)).digest("hex"),
      error_message: null
    };
  } catch (err) {
    return {
      url,
      final_url: url,
      http_status: 0,
      response_ok: false,
      content_type: "",
      elapsed_ms: Date.now() - started,
      page_title: null,
      has_html: false,
      has_drishvara_signal: false,
      has_admin_signal: false,
      has_editor_signal: false,
      has_login_signal: false,
      has_dashboard_signal: false,
      sample_sha256: null,
      error_message: err?.message || String(err)
    };
  }
}

const routeResults = [];
for (const candidate of routeCandidates) {
  const attempts = [];
  for (const url of candidate.urls) {
    const result = await probe(url);
    attempts.push(result);
    if (result.response_ok && result.http_status >= 200 && result.http_status < 400 && result.has_html) break;
  }
  const selected = attempts.find((item) => item.response_ok && item.http_status >= 200 && item.http_status < 400 && item.has_html) || attempts[0];
  routeResults.push({
    route_id: candidate.route_id,
    expected_surface: candidate.expected_surface,
    selected_url: selected.url,
    route_available: Boolean(selected.response_ok && selected.http_status >= 200 && selected.http_status < 400 && selected.has_html),
    attempts
  });
}

const adminLogin = routeResults.find((r) => r.route_id === "admin_login");
const editorLogin = routeResults.find((r) => r.route_id === "editor_login");
const adminDashboard = routeResults.find((r) => r.route_id === "admin_dashboard");
const editorDashboard = routeResults.find((r) => r.route_id === "editor_dashboard");

const loginSurfacesPassed =
  adminLogin?.route_available === true &&
  editorLogin?.route_available === true;

const dashboardSurfacesAvailable =
  adminDashboard?.route_available === true &&
  editorDashboard?.route_available === true;

const workflowSurfacePassed = loginSurfacesPassed && dashboardSurfacesAvailable;

const blockedState = {
  admin_editor_workflow_test_executed: true,
  admin_login_route_available: adminLogin?.route_available === true,
  editor_login_route_available: editorLogin?.route_available === true,
  admin_dashboard_route_available: adminDashboard?.route_available === true,
  editor_dashboard_route_available: editorDashboard?.route_available === true,
  workflow_surface_test_passed: workflowSurfacePassed,

  public_listing_test_executed: false,
  explicit_operator_approval_recorded_for_ag40b: true,
  login_form_submitted: false,
  credentials_used: false,
  session_created: false,
  public_mutation_approved_now: false,
  execution_authorized_now: false,
  real_apply_approved_now: false,
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

const operatorApprovalRecord = {
  module_id: "AG40B",
  title: "Admin/Editor Workflow Test Operator Approval Record",
  status: "operator_approval_recorded_for_read_only_admin_editor_workflow_test",
  approval_scope: "AG40B read-only Admin/Editor route and workflow-surface GET test only",
  approved_by: "vikash vaibhav",
  approval_recorded_in_chat: true,
  not_approved: [
    "login submission",
    "credential use",
    "session creation",
    "public mutation",
    "real publish",
    "database write",
    "audit-log write",
    "rollback write",
    "deployment",
    "SQL grant execution",
    "service-role key use"
  ],
  blocked_state: blockedState
};

const routeResult = {
  module_id: "AG40B",
  title: "Admin/Editor Route Result Record",
  status: workflowSurfacePassed ? "admin_editor_routes_available" : "admin_editor_routes_incomplete",
  base_url: baseUrl,
  route_results: routeResults,
  login_surfaces_passed: loginSurfacesPassed,
  dashboard_surfaces_available: dashboardSurfacesAvailable,
  workflow_surface_test_passed: workflowSurfacePassed,
  read_only_get_requests_only: true,
  blocked_state: blockedState
};

const workflowSurfaceResult = {
  module_id: "AG40B",
  title: "Workflow Surface Result Record",
  status: workflowSurfacePassed ? "workflow_surfaces_available_no_login_submitted" : "workflow_surfaces_incomplete",
  checked_surfaces: [
    "admin_login",
    "editor_login",
    "admin_dashboard_or_guarded_route",
    "editor_dashboard_or_guarded_route"
  ],
  workflow_checks: [
    { check_id: "admin_login_available", passed: adminLogin?.route_available === true },
    { check_id: "editor_login_available", passed: editorLogin?.route_available === true },
    { check_id: "admin_dashboard_or_guarded_route_available", passed: adminDashboard?.route_available === true },
    { check_id: "editor_dashboard_or_guarded_route_available", passed: editorDashboard?.route_available === true },
    { check_id: "no_login_form_submitted", passed: true },
    { check_id: "no_credentials_used", passed: true },
    { check_id: "no_session_created", passed: true }
  ],
  workflow_surface_test_passed: workflowSurfacePassed,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG40B",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag40b",
  checks: [
    { check_id: "read_only_get_requests_only", passed: true },
    { check_id: "no_login_submit", passed: true },
    { check_id: "no_credentials_used", passed: true },
    { check_id: "no_session_created", passed: true },
    { check_id: "no_public_mutation", passed: true },
    { check_id: "no_real_publish", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_sql_execution", passed: true },
    { check_id: "no_service_role_key", passed: true },
    { check_id: "no_anon_grant", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const packageRecord = {
  module_id: "AG40B",
  title: "Admin/Editor Workflow Test Package",
  status: workflowSurfacePassed
    ? "admin_editor_workflow_test_created_ready_for_ag40c"
    : "admin_editor_workflow_test_created_routes_incomplete",
  purpose:
    "Execute read-only Admin/Editor login/dashboard/workflow-surface checks after AG40A live URL test, without submitting login credentials or mutating any state.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  test_decision: {
    admin_editor_workflow_test_executed: true,
    admin_editor_workflow_test_passed: workflowSurfacePassed,
    proceed_to_ag40c_public_listing_test: workflowSurfacePassed,

    login_form_submitted: false,
    credentials_used: false,
    session_created: false,
    public_mutation_approved_now: false,
    execution_authorized_now: false,
    real_publish_executed: false,
    database_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_grants_executed: false
  },
  operator_approval_record_file: outputs.operatorApprovalRecord,
  route_result_file: outputs.routeResult,
  workflow_surface_result_file: outputs.workflowSurfaceResult,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG40B",
  title: "Admin/Editor Workflow Test Blocker Register",
  status: "admin_editor_workflow_test_blockers_preserved",
  blocked_items: [
    "No login form submission.",
    "No credentials used.",
    "No session created.",
    "No public mutation.",
    "No real publish.",
    "No database write.",
    "No audit-log write.",
    "No rollback write.",
    "No deployment.",
    "No SQL grant execution.",
    "No service-role key exposure.",
    "No anon grants."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG40B",
  title: "Public Listing Test Readiness Record",
  status: workflowSurfacePassed ? "ready_for_ag40c_public_listing_test" : "blocked_pending_admin_editor_route_fix",
  ready_for_ag40c: workflowSurfacePassed,
  next_stage_id: "AG40C",
  next_stage_title: "Public Listing Test",
  admin_editor_workflow_test_passed: workflowSurfacePassed,
  explicit_operator_approval_required_for_ag40c: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG40B",
  title: "AG40B to AG40C Public Listing Test Boundary",
  status: workflowSurfacePassed
    ? "ag40c_public_listing_test_boundary_created"
    : "ag40c_boundary_blocked_pending_route_fix",
  next_stage_id: "AG40C",
  next_stage_title: "Public Listing Test",
  allowed_scope: [
    "Consume AG40B Admin/Editor workflow route results.",
    "Test public listing only after explicit approval.",
    "Keep public mutation, database write, deployment and service-role key use blocked unless separately approved."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG40B",
  title: "Admin/Editor Workflow Test",
  status: packageRecord.status,
  depends_on: ["AG40A", "AG39Z"],
  generated_from: inputs,
  package_file: outputs.package,
  operator_approval_record_file: outputs.operatorApprovalRecord,
  route_result_file: outputs.routeResult,
  workflow_surface_result_file: outputs.workflowSurfaceResult,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    admin_editor_workflow_test_executed: true,
    admin_editor_workflow_test_passed: workflowSurfacePassed,
    ready_for_ag40c: workflowSurfacePassed,

    login_form_submitted: false,
    credentials_used: false,
    session_created: false,
    public_mutation_approved_now: false,
    real_publish_executed: false,
    database_write_done: false,
    public_mutation_done: false,
    deployment_done: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG40B", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG40B",
  preview_only: false,
  status: review.status,
  admin_editor_workflow_test_executed: 1,
  admin_editor_workflow_test_passed: workflowSurfacePassed ? 1 : 0,
  ready_for_ag40c: workflowSurfacePassed ? 1 : 0,
  admin_login_route_available: adminLogin?.route_available ? 1 : 0,
  editor_login_route_available: editorLogin?.route_available ? 1 : 0,
  admin_dashboard_route_available: adminDashboard?.route_available ? 1 : 0,
  editor_dashboard_route_available: editorDashboard?.route_available ? 1 : 0,
  login_form_submitted: 0,
  credentials_used: 0,
  session_created: 0,
  public_mutation_done: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  deployment_done: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_grants_executed: 0
};

const doc = `# AG40B — Admin/Editor Workflow Test

## Result

AG40B executed a read-only Admin/Editor workflow surface test.

## Checked Surfaces

- Admin login route.
- Editor login route.
- Admin dashboard or guarded route.
- Editor dashboard or guarded route.

## Passed

${workflowSurfacePassed ? "Yes" : "No"}

## Scope

This stage performed read-only GET requests only.

## Still Blocked

- No login form submission.
- No credentials used.
- No session created.
- No public mutation.
- No real publish.
- No database write.
- No deployment.
- No SQL grant execution.
- No service-role key exposure.
- No anon grants.

## Next

${workflowSurfacePassed ? "AG40C — Public Listing Test." : "Fix or confirm Admin/Editor live route paths before AG40C."}
`;

writeJson(outputs.operatorApprovalRecord, operatorApprovalRecord);
writeJson(outputs.routeResult, routeResult);
writeJson(outputs.workflowSurfaceResult, workflowSurfaceResult);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.package, packageRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

if (!workflowSurfacePassed) {
  console.error("❌ AG40B Admin/Editor workflow test failed.");
  for (const item of routeResults) {
    console.error(`${item.route_id}: ${item.route_available ? "OK" : "FAILED"} — ${item.selected_url}`);
  }
  process.exit(1);
}

console.log("✅ AG40B Admin/Editor Workflow Test generated.");
console.log("✅ Admin/Editor workflow surfaces responded in read-only mode.");
console.log("✅ Ready for AG40C Public Listing Test.");
console.log("✅ No login submission, credentials, session, public mutation, database write, deployment, SQL grant execution or service-role key recorded.");
