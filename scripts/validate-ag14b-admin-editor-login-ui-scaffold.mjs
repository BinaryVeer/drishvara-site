import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14a-admin-editor-login-role-credential-architecture.json",
  "data/content-intelligence/admin-architecture/ag14a-admin-editor-review-publishing-control-architecture.json",
  "data/content-intelligence/admin-architecture/ag14a-bootstrap-credential-first-login-doctrine.json",
  "data/content-intelligence/admin-architecture/ag14a-admin-editor-role-rights-matrix.json",
  "data/content-intelligence/admin-architecture/ag14a-admin-editor-workflow-state-model.json",
  "data/content-intelligence/quality-registry/ag14a-admin-editor-architecture-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14a-to-ag14b-admin-editor-login-ui-scaffold-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  "data/admin-review/index/admin-review-queue-index.json",

  "admin.html",
  "admin-dashboard.html",
  "editor-dashboard.html",
  "editor-create.html",
  "editor-correction.html",

  "data/content-intelligence/quality-reviews/ag14b-admin-editor-login-ui-scaffold.json",
  "data/content-intelligence/apply-records/ag14b-admin-editor-login-ui-scaffold-apply.json",
  "data/content-intelligence/admin-architecture/ag14b-admin-editor-ui-page-inventory.json",
  "data/content-intelligence/admin-architecture/ag14b-static-readonly-queue-rendering-record.json",
  "data/content-intelligence/quality-registry/ag14b-admin-editor-ui-scaffold-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14b-to-ag14c-admin-editor-ui-scaffold-audit-boundary.json",
  "data/content-intelligence/schema/admin-editor-login-ui-scaffold.schema.json",
  "data/content-intelligence/learning/ag14b-admin-editor-login-ui-scaffold-learning.json",
  "data/quality/ag14b-admin-editor-login-ui-scaffold.json",
  "data/quality/ag14b-admin-editor-login-ui-scaffold-preview.json",
  "docs/quality/AG14B_ADMIN_EDITOR_LOGIN_UI_SCAFFOLD.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG14B validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag14aReview = readJson("data/content-intelligence/quality-reviews/ag14a-admin-editor-login-role-credential-architecture.json");
const ag14aReadiness = readJson("data/content-intelligence/quality-registry/ag14a-admin-editor-architecture-readiness-record.json");
const ag14aBoundary = readJson("data/content-intelligence/mutation-plans/ag14a-to-ag14b-admin-editor-login-ui-scaffold-boundary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14b-admin-editor-login-ui-scaffold.json");
const apply = readJson("data/content-intelligence/apply-records/ag14b-admin-editor-login-ui-scaffold-apply.json");
const inventory = readJson("data/content-intelligence/admin-architecture/ag14b-admin-editor-ui-page-inventory.json");
const queueRendering = readJson("data/content-intelligence/admin-architecture/ag14b-static-readonly-queue-rendering-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14b-admin-editor-ui-scaffold-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14b-to-ag14c-admin-editor-ui-scaffold-audit-boundary.json");
const schema = readJson("data/content-intelligence/schema/admin-editor-login-ui-scaffold.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14b-admin-editor-login-ui-scaffold-learning.json");
const registry = readJson("data/quality/ag14b-admin-editor-login-ui-scaffold.json");
const preview = readJson("data/quality/ag14b-admin-editor-login-ui-scaffold-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG14B_ADMIN_EDITOR_LOGIN_UI_SCAFFOLD.md"), "utf8");

for (const obj of [review, apply, inventory, queueRendering, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14B") fail(`module_id must be AG14B in ${obj.title || "object"}`);
}

if (ag14aReview.status !== "admin_editor_login_role_credential_architecture_defined") fail("AG14A review status mismatch");
if (ag14aReadiness.ready_for_ag14b !== true) fail("AG14A readiness for AG14B missing");
if (ag14aBoundary.next_stage_id !== "AG14B") fail("AG14B boundary missing in AG14A");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (articleHash !== ag13zCandidate.article_hash) fail("Article hash must match AG13Z candidate hash");

if (review.status !== "admin_editor_login_ui_scaffold_created_pending_audit") fail("Review status mismatch");
if (apply.status !== "admin_editor_login_ui_scaffold_created_pending_audit") fail("Apply status mismatch");
if (inventory.status !== "admin_editor_ui_pages_created_scaffold_only") fail("Inventory status mismatch");
if (queueRendering.status !== "static_readonly_queue_rendering_scaffold_created") fail("Queue rendering status mismatch");
if (readiness.status !== "ready_for_ag14c_admin_editor_ui_scaffold_audit") fail("Readiness status mismatch");

const pages = ["admin.html", "admin-dashboard.html", "editor-dashboard.html", "editor-create.html", "editor-correction.html"];

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  if (!html.includes('data-drishvara-admin-ui="ag14b-scaffold"')) fail(`${page} missing AG14B scaffold marker`);
  if (!html.includes('data-auth-mode="scaffold-only"')) fail(`${page} missing scaffold auth mode`);
  if (!html.includes('name="robots" content="noindex,nofollow"')) fail(`${page} must be noindex,nofollow`);
  if (html.includes("admin@drishvara.internal")) fail(`${page} must not include bootstrap admin identifier`);
  if (html.includes("editor@drishvara.internal")) fail(`${page} must not include bootstrap editor identifier`);
  if (html.includes("localStorage") || html.includes("sessionStorage") || html.includes("document.cookie")) fail(`${page} must not store auth state client-side`);
  if (/method\s*=\s*["']post["']/i.test(html)) fail(`${page} must not include POST form`);
  if (/passwordHash|hashPassword|bcrypt|supabase|createUser|signInWithPassword/i.test(html)) fail(`${page} must not contain auth implementation code`);
}

const adminDashboard = fs.readFileSync(path.join(root, "admin-dashboard.html"), "utf8");
if (!adminDashboard.includes("Archive")) fail("Admin dashboard must show Archive action");
if (!adminDashboard.includes("Return for correction")) fail("Admin dashboard must show Return for correction action");
if (!adminDashboard.includes("Publish and close")) fail("Admin dashboard must show Publish and close action");
if (!adminDashboard.includes("disabled data-admin-action")) fail("Admin action buttons must be disabled scaffold actions");

const editorCreate = fs.readFileSync(path.join(root, "editor-create.html"), "utf8");
if (!editorCreate.includes("Submit to Admin")) fail("Editor create page must show Submit to Admin");
if (!editorCreate.includes("disabled data-editor-action")) fail("Editor create actions must be disabled scaffold actions");

const editorCorrection = fs.readFileSync(path.join(root, "editor-correction.html"), "utf8");
if (!editorCorrection.includes("Resubmit to Admin")) fail("Editor correction page must show Resubmit to Admin");

if (!Array.isArray(inventory.pages) || inventory.pages.length !== 5) fail("Inventory must record five created pages");
for (const pageRecord of inventory.pages) {
  if (pageRecord.noindex !== true) fail(`${pageRecord.path} inventory must record noindex`);
  if (pageRecord.scaffold_marker_present !== true) fail(`${pageRecord.path} inventory must record scaffold marker`);
  if (pageRecord.real_auth_active !== false) fail(`${pageRecord.path} inventory must record real auth false`);
}

if (queueRendering.rendered_candidate_count !== 1) fail("Queue rendering must include one seeded candidate");
if (queueRendering.action_buttons_present_but_disabled !== true) fail("Queue action buttons must be disabled");
if (queueRendering.action_execution_available !== false) fail("Queue action execution must be unavailable");

if (readiness.ready_for_ag14c !== true) fail("AG14C readiness missing");
if (readiness.real_auth_ready !== false) fail("Real auth must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag14c_boundary_created_not_started") fail("AG14C boundary status mismatch");
if (boundary.next_stage_id !== "AG14C") fail("AG14C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14C explicit approval missing");

if (schema.status !== "schema_admin_editor_login_ui_scaffold") fail("Schema status mismatch");

for (const key of [
  "login_ui_scaffold_allowed_in_ag14b",
  "admin_dashboard_scaffold_allowed_in_ag14b",
  "editor_dashboard_scaffold_allowed_in_ag14b",
  "editor_create_scaffold_allowed_in_ag14b",
  "editor_correction_scaffold_allowed_in_ag14b",
  "readonly_queue_rendering_allowed_in_ag14b",
  "ag14c_boundary_allowed_in_ag14b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "real_login_allowed_in_ag14b",
  "real_credential_creation_allowed_in_ag14b",
  "hardcoded_password_allowed_in_ag14b",
  "password_hash_commit_allowed_in_ag14b",
  "auth_activation_allowed_in_ag14b",
  "backend_activation_allowed_in_ag14b",
  "supabase_activation_allowed_in_ag14b",
  "article_mutation_allowed_in_ag14b",
  "public_visibility_switch_allowed_in_ag14b",
  "public_publishing_operation_allowed_in_ag14b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, apply, inventory, queueRendering, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.admin_editor_login_ui_scaffold_only !== true) fail(`${obj.title || "object"} must be AG14B UI scaffold only`);
  if (obj.real_login_created_in_ag14b !== false) fail(`${obj.title || "object"} must not create real login`);
  if (obj.real_credential_created_in_ag14b !== false) fail(`${obj.title || "object"} must not create real credential`);
  if (obj.hardcoded_password_created_in_ag14b !== false) fail(`${obj.title || "object"} must not hardcode password`);
  if (obj.auth_activation_performed_in_ag14b !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.backend_activation_performed_in_ag14b !== false) fail(`${obj.title || "object"} must not activate backend`);
  if (obj.supabase_activation_performed_in_ag14b !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.public_publishing_operation_performed_in_ag14b !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Created Pages", "Scope", "Admin Scaffold", "Editor Scaffold", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14B document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14b", "validate:ag14b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14b")) {
  fail("validate:project must include validate:ag14b");
}

pass("AG14B registry is present.");
pass("AG14B document is present.");
pass("AG14B review, apply record, page inventory, queue rendering, readiness, AG14C boundary, schema, learning and preview are present.");
pass("AG14A architecture and AG13Z Admin Review candidate are consumed.");
pass("Admin and Editor UI scaffold pages are created.");
pass("Admin dashboard includes read-only queue and disabled Admin action buttons.");
pass("Editor dashboard, manual creation and correction scaffold pages are created.");
pass("No real credentials, hardcoded passwords, password hashes or active auth are present.");
pass("Auth/backend/Supabase activation, public visibility switch and publishing remain blocked.");
pass("AG14C Admin Editor UI Scaffold Audit boundary is created with explicit approval required.");
pass("AG14B is Admin and Editor Login UI Scaffold only.");
