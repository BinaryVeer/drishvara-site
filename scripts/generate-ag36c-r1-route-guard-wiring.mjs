import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag36c-r1-route-guard-wiring.json",
  package: "data/content-intelligence/backend-architecture/ag36c-r1-route-guard-wiring-package.json",
  guardRecord: "data/content-intelligence/backend-architecture/ag36c-r1-admin-editor-route-guard-record.json",
  blocker: "data/content-intelligence/quality-registry/ag36c-r1-route-guard-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag36c-r1-role-restriction-manual-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag36c-r1-to-ag36c-manual-role-restriction-test-boundary.json",
  registry: "data/quality/ag36c-r1-route-guard-wiring.json",
  preview: "data/quality/ag36c-r1-route-guard-wiring-preview.json",
  doc: "docs/quality/AG36C_R1_ROUTE_GUARD_WIRING.md"
};

function full(p) { return path.join(root, p); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

const blockedState = {
  route_guard_wiring_created: true,
  admin_dashboard_guarded: true,
  editor_dashboard_guarded: true,
  password_recorded: false,
  token_recorded: false,
  cookie_recorded: false,
  supabase_key_recorded: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  deployment_done: false,
  public_mutation_done: false,
  dynamic_publish_runtime_created: false,
  publish_action_executed: false
};

const packageRecord = {
  module_id: "AG36C-R1",
  title: "Route Guard Wiring Package",
  status: "route_guard_wiring_created_ready_for_manual_role_restriction_test",
  purpose: "Guard Admin and Editor dashboard routes with local Supabase Auth profile-role verification.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  guarded_routes: [
    { route: "admin-dashboard.html", required_role: "admin" },
    { route: "editor-dashboard.html", required_role: "editor" }
  ],
  blocked_state: blockedState
};

const guardRecord = {
  module_id: "AG36C-R1",
  title: "Admin Editor Route Guard Record",
  status: "admin_editor_route_guard_wired",
  guard_file: "assets/js/ag36c-route-guard.js",
  local_config_file: "assets/js/drishvara-auth-local.js",
  local_config_committed: false,
  service_role_key_required: false,
  manual_tests_required: [
    "While logged in as Editor, admin-dashboard.html should be blocked.",
    "While logged in as Admin, admin-dashboard.html should open.",
    "While logged in as Admin, editor-dashboard.html should be blocked unless Admin is also mapped as editor.",
    "While logged in as Editor, editor-dashboard.html should open."
  ],
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG36C-R1",
  title: "Route Guard Blocker Register",
  status: "route_guard_wired_runtime_mutation_blocked",
  blocked_items: [
    "No password in repo/chat.",
    "No token/cookie in repo/chat.",
    "No Supabase key in repo/chat.",
    "No service-role key exposure.",
    "No deployment.",
    "No public mutation.",
    "No publish action execution."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG36C-R1",
  title: "Role Restriction Manual Test Readiness Record",
  status: "ready_for_manual_role_restriction_test",
  ready_for_manual_role_restriction_test: true,
  next_stage_id: "AG36C-CONFIRM",
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG36C-R1",
  title: "AG36C-R1 to Manual Role Restriction Test Boundary",
  status: "manual_role_restriction_test_boundary_created",
  next_stage_id: "AG36C-CONFIRM",
  allowed_scope: [
    "Test Editor cannot access Admin dashboard.",
    "Test Admin can access Admin dashboard.",
    "Record only visible result/error.",
    "Do not record password, token, cookie, Supabase key or service-role key."
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG36C-R1",
  title: "Route Guard Wiring",
  status: "route_guard_wiring_created_ready_for_manual_role_restriction_test",
  package_file: outputs.package,
  guard_record_file: outputs.guardRecord,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    route_guard_wiring_created: true,
    admin_dashboard_guarded: true,
    editor_dashboard_guarded: true,
    ready_for_manual_role_restriction_test: true,
    password_recorded: false,
    token_recorded: false,
    supabase_key_recorded: false,
    service_role_key_exposed: false,
    deployment_done: false,
    public_mutation_done: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG36C-R1", title: review.title, status: review.status, generated_artifacts: outputs };
const preview = {
  module_id: "AG36C-R1",
  status: review.status,
  route_guard_wiring_created: 1,
  admin_dashboard_guarded: 1,
  editor_dashboard_guarded: 1,
  service_role_key_exposed: 0,
  deployment_done: 0,
  public_mutation_done: 0
};

const doc = `# AG36C-R1 — Route Guard Wiring

Admin and Editor dashboard routes are wired to local Supabase Auth profile-role verification.

## Manual Tests

- Editor opening admin-dashboard.html should be blocked.
- Admin opening admin-dashboard.html should be allowed.
- Editor opening editor-dashboard.html should be allowed.

## Boundary

No passwords, tokens, cookies, Supabase keys, service-role keys, deployment, public mutation or publish actions are recorded.
`;

writeJson(outputs.package, packageRecord);
writeJson(outputs.guardRecord, guardRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG36C-R1 route guard wiring records generated.");
