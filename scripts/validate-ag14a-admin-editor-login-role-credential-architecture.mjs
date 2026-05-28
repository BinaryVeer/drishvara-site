import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag13z-final-live-verification-admin-review-handoff-closure.json",
  "data/content-intelligence/closure-records/ag13z-final-live-verification-admin-review-handoff-closure.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  "data/admin-review/index/admin-review-queue-index.json",
  "data/content-intelligence/quality-registry/ag13z-admin-review-handoff-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag13z-to-ag14a-admin-review-queue-architecture-boundary.json",

  "data/content-intelligence/quality-reviews/ag14a-admin-editor-login-role-credential-architecture.json",
  "data/content-intelligence/admin-architecture/ag14a-admin-editor-review-publishing-control-architecture.json",
  "data/content-intelligence/admin-architecture/ag14a-bootstrap-credential-first-login-doctrine.json",
  "data/content-intelligence/admin-architecture/ag14a-admin-editor-role-rights-matrix.json",
  "data/content-intelligence/admin-architecture/ag14a-admin-editor-workflow-state-model.json",
  "data/content-intelligence/quality-registry/ag14a-admin-editor-architecture-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14a-to-ag14b-admin-editor-login-ui-scaffold-boundary.json",
  "data/content-intelligence/schema/admin-editor-login-role-credential-architecture.schema.json",
  "data/content-intelligence/learning/ag14a-admin-editor-login-role-credential-architecture-learning.json",
  "data/quality/ag14a-admin-editor-login-role-credential-architecture.json",
  "data/quality/ag14a-admin-editor-login-role-credential-architecture-preview.json",
  "docs/quality/AG14A_ADMIN_EDITOR_LOGIN_ROLE_CREDENTIAL_ARCHITECTURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG14A validation failed: ${message}`);
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

function ag13zCandidateHashMatchesCurrentOrAg12cR1(candidate, currentHash) {
  if (candidate?.article_hash === currentHash) return true;

  const ag12cR1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
  if (!fs.existsSync(ag12cR1ApplyPath)) return false;

  try {
    const ag12cR1Apply = JSON.parse(fs.readFileSync(ag12cR1ApplyPath, "utf8"));
    return (
      ag12cR1Apply.status === "public_object_label_layout_repair_applied" &&
      ag12cR1Apply.selected_article_path === candidate?.selected_article_path &&
      ag12cR1Apply.pre_repair_hash === candidate?.article_hash &&
      ag12cR1Apply.post_repair_hash === currentHash
    );
  } catch {
    return false;
  }
}


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag13zReview = readJson("data/content-intelligence/quality-reviews/ag13z-final-live-verification-admin-review-handoff-closure.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");
const ag13zReadiness = readJson("data/content-intelligence/quality-registry/ag13z-admin-review-handoff-readiness-record.json");
const ag13zBoundary = readJson("data/content-intelligence/mutation-plans/ag13z-to-ag14a-admin-review-queue-architecture-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14a-admin-editor-login-role-credential-architecture.json");
const architecture = readJson("data/content-intelligence/admin-architecture/ag14a-admin-editor-review-publishing-control-architecture.json");
const credentialDoctrine = readJson("data/content-intelligence/admin-architecture/ag14a-bootstrap-credential-first-login-doctrine.json");
const roleRights = readJson("data/content-intelligence/admin-architecture/ag14a-admin-editor-role-rights-matrix.json");
const workflow = readJson("data/content-intelligence/admin-architecture/ag14a-admin-editor-workflow-state-model.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14a-admin-editor-architecture-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14a-to-ag14b-admin-editor-login-ui-scaffold-boundary.json");
const schema = readJson("data/content-intelligence/schema/admin-editor-login-role-credential-architecture.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14a-admin-editor-login-role-credential-architecture-learning.json");
const registry = readJson("data/quality/ag14a-admin-editor-login-role-credential-architecture.json");
const preview = readJson("data/quality/ag14a-admin-editor-login-role-credential-architecture-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG14A_ADMIN_EDITOR_LOGIN_ROLE_CREDENTIAL_ARCHITECTURE.md"), "utf8");

for (const obj of [review, architecture, credentialDoctrine, roleRights, workflow, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14A") fail(`module_id must be AG14A in ${obj.title || "object"}`);
}

if (ag13zReview.status !== "final_live_verification_closed_admin_review_handoff_created") fail("AG13Z review status mismatch");
if (ag13zReadiness.ready_for_ag14a !== true) fail("AG13Z readiness for AG14A missing");
if (ag13zBoundary.next_stage_id !== "AG14A") fail("AG14A boundary missing in AG13Z");
if (ag13zCandidate.status !== "ready_for_admin_review") fail("AG13Z candidate must be ready for admin review");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (!ag13zCandidateHashMatchesCurrentOrAg12cR1(ag13zCandidate, articleHash)) fail("Article hash must match AG13Z candidate hash or AG12C-R1 repaired article state");

if (review.status !== "admin_editor_login_role_credential_architecture_defined") fail("Review status mismatch");
if (architecture.status !== "admin_editor_login_role_credential_architecture_defined") fail("Architecture status mismatch");
if (credentialDoctrine.status !== "bootstrap_credential_doctrine_defined_no_credentials_created") fail("Credential doctrine status mismatch");
if (roleRights.status !== "admin_editor_role_rights_defined") fail("Role rights status mismatch");
if (workflow.status !== "admin_editor_workflow_state_model_defined") fail("Workflow status mismatch");
if (readiness.status !== "ready_for_ag14b_admin_editor_login_ui_scaffold") fail("Readiness status mismatch");

if (!Array.isArray(credentialDoctrine.bootstrap_identity_placeholders) || credentialDoctrine.bootstrap_identity_placeholders.length !== 2) {
  fail("Bootstrap identity placeholders must include Admin and Editor");
}
for (const record of credentialDoctrine.bootstrap_identity_placeholders) {
  if (record.first_login_password_reset_required !== true) fail(`${record.role} must require first-login password reset`);
  if (record.real_credential_storage !== "environment_secret_or_server_side_auth_provider_only") fail(`${record.role} credential storage must be secure/outside repo`);
}

if (!Array.isArray(roleRights.roles) || roleRights.roles.length !== 2) fail("Role rights must define Admin and Editor");
const admin = roleRights.roles.find((role) => role.role === "admin");
const editor = roleRights.roles.find((role) => role.role === "editor");
if (!admin || !editor) fail("Admin and Editor roles must both exist");
if (!admin.allowed_rights.includes("Publish article.")) fail("Admin must have publish right");
if (!editor.allowed_rights.includes("Create new manual article.")) fail("Editor must have manual article creation right");
if (!editor.allowed_rights.includes("Edit returned article.")) fail("Editor must have correction right");
if (!editor.blocked_rights.includes("Cannot publish.")) fail("Editor must be blocked from publishing");

for (const action of ["archive", "return_for_correction", "publish", "publish_and_close"]) {
  if (!roleRights.admin_actions.includes(action)) fail(`Missing admin action: ${action}`);
}
for (const action of ["create_manual_article", "save_draft", "edit_returned_article", "preview", "submit_to_admin", "resubmit_to_admin"]) {
  if (!roleRights.editor_actions.includes(action)) fail(`Missing editor action: ${action}`);
}

if (!workflow.entry_routes.some((route) => route.route === "editor_manual_article")) fail("Manual editor article route missing");
if (!workflow.entry_routes.some((route) => route.route === "returned_for_correction")) fail("Returned-for-correction route missing");
if (!workflow.visibility_states.some((state) => state.state === "archived" && state.public_visibility === false)) fail("Archived visibility state missing");
if (!workflow.visibility_states.some((state) => state.state === "published" && state.public_visibility === true)) fail("Published visibility state missing");

if (architecture.planned_routes.admin_login_route !== "/admin.html") fail("Admin login route mismatch");
if (architecture.planned_routes.editor_manual_create_route !== "/editor-create.html") fail("Editor create route mismatch");
if (architecture.preferred_implementation_path.includes("Supabase/Auth activation later") !== true) fail("Preferred implementation path must defer Supabase/Auth");

if (readiness.ready_for_ag14b !== true) fail("AG14B readiness missing");
if (readiness.real_auth_ready !== false) fail("Real auth must not be ready in AG14A");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag14b_boundary_created_not_started") fail("AG14B boundary status mismatch");
if (boundary.next_stage_id !== "AG14B") fail("AG14B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14B explicit approval missing");

if (schema.status !== "schema_admin_editor_login_role_credential_architecture_only") fail("Schema status mismatch");

for (const key of [
  "architecture_allowed_in_ag14a",
  "credential_doctrine_allowed_in_ag14a",
  "role_rights_matrix_allowed_in_ag14a",
  "workflow_state_model_allowed_in_ag14a",
  "ag14b_boundary_allowed_in_ag14a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "login_page_creation_allowed_in_ag14a",
  "real_credential_creation_allowed_in_ag14a",
  "hardcoded_password_allowed_in_ag14a",
  "password_hash_commit_allowed_in_ag14a",
  "auth_activation_allowed_in_ag14a",
  "backend_activation_allowed_in_ag14a",
  "supabase_activation_allowed_in_ag14a",
  "article_mutation_allowed_in_ag14a",
  "public_visibility_switch_allowed_in_ag14a",
  "public_publishing_operation_allowed_in_ag14a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, architecture, credentialDoctrine, roleRights, workflow, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.admin_editor_login_role_credential_architecture_only !== true) fail(`${obj.title || "object"} must be AG14A architecture only`);
  if (obj.login_page_created_in_ag14a !== false) fail(`${obj.title || "object"} must not create login page`);
  if (obj.credential_created_in_public_code_in_ag14a !== false) fail(`${obj.title || "object"} must not create public credential`);
  if (obj.hardcoded_password_created_in_ag14a !== false) fail(`${obj.title || "object"} must not hardcode password`);
  if (obj.auth_activation_performed_in_ag14a !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.backend_activation_performed_in_ag14a !== false) fail(`${obj.title || "object"} must not activate backend`);
  if (obj.supabase_activation_performed_in_ag14a !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.article_mutation_performed_in_ag14a !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.public_publishing_operation_performed_in_ag14a !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Admin Role", "Editor Role", "Bootstrap Credential Doctrine", "Planned Routes", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14A document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14a", "validate:ag14a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14a")) {
  fail("validate:project must include validate:ag14a");
}

pass("AG14A registry is present.");
pass("AG14A document is present.");
pass("AG14A architecture, credential doctrine, role-rights matrix, workflow model, readiness, AG14B boundary, schema, learning and preview are present.");
pass("AG13Z admin handoff and seeded Admin Review candidate are consumed.");
pass("Admin and Editor roles are defined.");
pass("Bootstrap credential doctrine requires first-login reset and blocks public-code credentials.");
pass("Editor manual creation and correction rights are included; Editor publishing is blocked.");
pass("Admin actions are included: Archive, Return for correction, Publish, Publish and close.");
pass("Login/UI pages are not created in AG14A.");
pass("Auth/backend/Supabase activation, public visibility switch and publishing remain blocked.");
pass("AG14B Admin/Editor Login UI Scaffold boundary is created with explicit approval required.");
pass("AG14A is Admin + Editor Login, Role and Credential Architecture only.");
