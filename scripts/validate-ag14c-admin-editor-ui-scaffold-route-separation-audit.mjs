import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14b-admin-editor-login-ui-scaffold.json",
  "data/content-intelligence/apply-records/ag14b-admin-editor-login-ui-scaffold-apply.json",
  "data/content-intelligence/admin-architecture/ag14b-admin-editor-ui-page-inventory.json",
  "data/content-intelligence/admin-architecture/ag14b-static-readonly-queue-rendering-record.json",
  "data/content-intelligence/quality-registry/ag14b-admin-editor-ui-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14b-to-ag14c-admin-editor-ui-scaffold-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag14c-admin-editor-ui-scaffold-route-separation-audit.json",
  "data/content-intelligence/audit-records/ag14c-admin-editor-ui-scaffold-route-separation-audit-report.json",
  "data/content-intelligence/admin-architecture/ag14c-public-signin-internal-admin-route-separation-record.json",
  "data/content-intelligence/quality-registry/ag14c-route-separation-refinement-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14c-to-ag14d-public-signin-internal-admin-route-separation-apply-boundary.json",
  "data/content-intelligence/schema/admin-editor-ui-scaffold-route-separation-audit.schema.json",
  "data/content-intelligence/learning/ag14c-admin-editor-ui-scaffold-route-separation-audit-learning.json",
  "data/quality/ag14c-admin-editor-ui-scaffold-route-separation-audit.json",
  "data/quality/ag14c-admin-editor-ui-scaffold-route-separation-audit-preview.json",
  "docs/quality/AG14C_ADMIN_EDITOR_UI_SCAFFOLD_ROUTE_SEPARATION_AUDIT.md",
  "package.json"
];

const uiPages = ["admin.html", "admin-dashboard.html", "editor-dashboard.html", "editor-create.html", "editor-correction.html"];

function fail(message) {
  console.error(`❌ AG14C validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

for (const file of [...requiredFiles, ...uiPages]) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag14bReview = readJson("data/content-intelligence/quality-reviews/ag14b-admin-editor-login-ui-scaffold.json");
const ag14bReadiness = readJson("data/content-intelligence/quality-registry/ag14b-admin-editor-ui-scaffold-readiness-record.json");
const ag14bBoundary = readJson("data/content-intelligence/mutation-plans/ag14b-to-ag14c-admin-editor-ui-scaffold-audit-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14c-admin-editor-ui-scaffold-route-separation-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag14c-admin-editor-ui-scaffold-route-separation-audit-report.json");
const separation = readJson("data/content-intelligence/admin-architecture/ag14c-public-signin-internal-admin-route-separation-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14c-route-separation-refinement-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14c-to-ag14d-public-signin-internal-admin-route-separation-apply-boundary.json");
const schema = readJson("data/content-intelligence/schema/admin-editor-ui-scaffold-route-separation-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14c-admin-editor-ui-scaffold-route-separation-audit-learning.json");
const registry = readJson("data/quality/ag14c-admin-editor-ui-scaffold-route-separation-audit.json");
const preview = readJson("data/quality/ag14c-admin-editor-ui-scaffold-route-separation-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG14C_ADMIN_EDITOR_UI_SCAFFOLD_ROUTE_SEPARATION_AUDIT.md"), "utf8");

for (const obj of [review, audit, separation, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14C") fail(`module_id must be AG14C in ${obj.title || "object"}`);
}

if (ag14bReview.status !== "admin_editor_login_ui_scaffold_created_pending_audit") fail("AG14B review status mismatch");
if (ag14bReadiness.ready_for_ag14c !== true) fail("AG14B readiness missing");
if (ag14bBoundary.next_stage_id !== "AG14C") fail("AG14C boundary missing in AG14B");

for (const page of uiPages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  if (!html.includes('data-drishvara-admin-ui="ag14b-scaffold"')) fail(`${page} missing scaffold marker`);
  if (!html.includes('data-auth-mode="scaffold-only"')) fail(`${page} missing scaffold auth mode`);
  if (!html.includes('name="robots" content="noindex,nofollow"')) fail(`${page} must be noindex,nofollow`);
  if (/admin@drishvara\.internal|editor@drishvara\.internal|passwordHash|bcrypt|signInWithPassword|supabase|localStorage|sessionStorage|document\.cookie/i.test(html)) {
    fail(`${page} contains prohibited credential/auth signal`);
  }
}

if (review.status !== "ui_scaffold_audit_passed_route_separation_refinement_required") fail("Review status mismatch");
if (audit.status !== "ui_scaffold_audit_passed_route_separation_refinement_required") fail("Audit status mismatch");
if (separation.status !== "public_signin_internal_admin_route_separation_refinement_required") fail("Separation record status mismatch");
if (readiness.status !== "ready_for_ag14d_public_signin_internal_admin_route_separation_apply") fail("Readiness status mismatch");

if (!Array.isArray(audit.checks) || audit.checks.length !== 9) fail("AG14C must record nine audit checks");
if (audit.failed_checks.length !== 0) fail("AG14C failed checks must be zero");
if (audit.decision.ui_scaffold_integrity_passed !== true) fail("UI scaffold integrity must pass");
if (audit.decision.credential_safety_passed !== true) fail("Credential safety must pass");
if (audit.decision.route_separation_required !== true) fail("Route separation must be required");

if (separation.product_decision.public_signin_join_route !== "signin.html") fail("Public sign-in route must be signin.html");
if (separation.product_decision.internal_admin_route !== "admin.html") fail("Internal admin route must be admin.html");
if (!separation.required_ag14d_treatment.includes("Create or restore signin.html as public visitor/member Sign in / Join preview page.")) {
  fail("AG14D treatment must include creating/restoring signin.html");
}

if (readiness.ready_for_ag14d !== true) fail("AG14D readiness missing");
if (readiness.real_auth_ready !== false) fail("Real auth must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag14d_boundary_created_not_started") fail("AG14D boundary status mismatch");
if (boundary.next_stage_id !== "AG14D") fail("AG14D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14D explicit approval missing");

if (schema.status !== "schema_admin_editor_ui_scaffold_route_separation_audit_only") fail("Schema status mismatch");

for (const key of [
  "ui_scaffold_audit_allowed_in_ag14c",
  "route_separation_audit_allowed_in_ag14c",
  "product_positioning_decision_allowed_in_ag14c",
  "ag14d_boundary_allowed_in_ag14c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "page_mutation_allowed_in_ag14c",
  "login_page_creation_allowed_in_ag14c",
  "signin_page_creation_allowed_in_ag14c",
  "real_credential_creation_allowed_in_ag14c",
  "hardcoded_password_allowed_in_ag14c",
  "auth_activation_allowed_in_ag14c",
  "backend_activation_allowed_in_ag14c",
  "supabase_activation_allowed_in_ag14c",
  "public_publishing_operation_allowed_in_ag14c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, separation, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.admin_editor_ui_scaffold_route_separation_audit_only !== true) fail(`${obj.title || "object"} must be AG14C audit only`);
  if (obj.page_mutation_performed_in_ag14c !== false) fail(`${obj.title || "object"} must not mutate pages`);
  if (obj.signin_page_created_in_ag14c !== false) fail(`${obj.title || "object"} must not create signin page`);
  if (obj.real_credential_created_in_ag14c !== false) fail(`${obj.title || "object"} must not create credentials`);
  if (obj.auth_activation_performed_in_ag14c !== false) fail(`${obj.title || "object"} must not activate auth`);
  if (obj.public_publishing_operation_performed_in_ag14c !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Product Decision", "Audit Result", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14C document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14c", "validate:ag14c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14c")) {
  fail("validate:project must include validate:ag14c");
}

pass("AG14C registry is present.");
pass("AG14C document is present.");
pass("AG14C audit report, separation record, readiness, AG14D boundary, schema, learning and preview are present.");
pass("AG14B Admin/Editor UI scaffold is consumed.");
pass("Admin/Editor scaffold pages are safe, noindex/nofollow, and scaffold-only.");
pass("No credentials, hardcoded passwords, password hashes or active auth are present.");
pass("Product decision recorded: public Sign in / Join must be separated from internal Admin/Editor route.");
pass("AG14D route-separation apply boundary is created with explicit approval required.");
pass("Auth/backend/Supabase activation, page mutation and publishing remain blocked.");
pass("AG14C is Admin Editor UI Scaffold Route Separation Audit only.");
