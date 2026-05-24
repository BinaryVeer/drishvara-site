import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag14c-admin-editor-ui-scaffold-route-separation-audit.json",
  "data/content-intelligence/audit-records/ag14c-admin-editor-ui-scaffold-route-separation-audit-report.json",
  "data/content-intelligence/admin-architecture/ag14c-public-signin-internal-admin-route-separation-record.json",
  "data/content-intelligence/quality-registry/ag14c-route-separation-refinement-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14c-to-ag14d-public-signin-internal-admin-route-separation-apply-boundary.json",

  "signin.html",
  "admin.html",
  "admin-dashboard.html",
  "editor-dashboard.html",
  "editor-create.html",
  "editor-correction.html",

  "data/content-intelligence/quality-reviews/ag14d-public-signin-internal-admin-route-separation-apply.json",
  "data/content-intelligence/apply-records/ag14d-public-signin-internal-admin-route-separation-apply.json",
  "data/content-intelligence/admin-architecture/ag14d-public-signin-internal-admin-route-separation-record.json",
  "data/content-intelligence/quality-registry/ag14d-route-separation-backup-readiness-record.json",
  "data/content-intelligence/quality-registry/ag14d-route-separation-apply-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag14d-to-ag14e-admin-editor-decision-workflow-model-boundary.json",
  "data/content-intelligence/schema/public-signin-internal-admin-route-separation-apply.schema.json",
  "data/content-intelligence/learning/ag14d-public-signin-internal-admin-route-separation-apply-learning.json",
  "data/quality/ag14d-public-signin-internal-admin-route-separation-apply.json",
  "data/quality/ag14d-public-signin-internal-admin-route-separation-apply-preview.json",
  "docs/quality/AG14D_PUBLIC_SIGNIN_INTERNAL_ADMIN_ROUTE_SEPARATION_APPLY.md",
  "package.json"
];

const internalPages = new Set([
  "admin.html",
  "admin-dashboard.html",
  "editor-dashboard.html",
  "editor-create.html",
  "editor-correction.html"
]);

function fail(message) {
  console.error(`❌ AG14D validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function rootHtmlFiles() {
  return fs.readdirSync(root)
    .filter((name) => name.endsWith(".html"))
    .filter((name) => fs.statSync(path.join(root, name)).isFile());
}

function hasInternalHref(html) {
  return /href=(["'])\/?(?:admin|admin-dashboard|editor-dashboard|editor-create|editor-correction)\.html\1/i.test(html);
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag14cReview = readJson("data/content-intelligence/quality-reviews/ag14c-admin-editor-ui-scaffold-route-separation-audit.json");
const ag14cAudit = readJson("data/content-intelligence/audit-records/ag14c-admin-editor-ui-scaffold-route-separation-audit-report.json");
const ag14cReadiness = readJson("data/content-intelligence/quality-registry/ag14c-route-separation-refinement-readiness-record.json");
const ag14cBoundary = readJson("data/content-intelligence/mutation-plans/ag14c-to-ag14d-public-signin-internal-admin-route-separation-apply-boundary.json");

const review = readJson("data/content-intelligence/quality-reviews/ag14d-public-signin-internal-admin-route-separation-apply.json");
const apply = readJson("data/content-intelligence/apply-records/ag14d-public-signin-internal-admin-route-separation-apply.json");
const routeRecord = readJson("data/content-intelligence/admin-architecture/ag14d-public-signin-internal-admin-route-separation-record.json");
const backupRecord = readJson("data/content-intelligence/quality-registry/ag14d-route-separation-backup-readiness-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag14d-route-separation-apply-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag14d-to-ag14e-admin-editor-decision-workflow-model-boundary.json");
const schema = readJson("data/content-intelligence/schema/public-signin-internal-admin-route-separation-apply.schema.json");
const learning = readJson("data/content-intelligence/learning/ag14d-public-signin-internal-admin-route-separation-apply-learning.json");
const registry = readJson("data/quality/ag14d-public-signin-internal-admin-route-separation-apply.json");
const preview = readJson("data/quality/ag14d-public-signin-internal-admin-route-separation-apply-preview.json");
const pkg = readJson("package.json");
const docText = readText("docs/quality/AG14D_PUBLIC_SIGNIN_INTERNAL_ADMIN_ROUTE_SEPARATION_APPLY.md");

for (const obj of [review, apply, routeRecord, backupRecord, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG14D") fail(`module_id must be AG14D in ${obj.title || "object"}`);
}

if (ag14cReview.status !== "ui_scaffold_audit_passed_route_separation_refinement_required") fail("AG14C review status mismatch");
if (ag14cAudit.failed_checks.length !== 0) fail("AG14C failed checks must be zero");
if (ag14cReadiness.ready_for_ag14d !== true) fail("AG14C readiness for AG14D missing");
if (ag14cBoundary.next_stage_id !== "AG14D") fail("AG14D boundary missing in AG14C");

const signinHtml = readText("signin.html");
const adminHtml = readText("admin.html");

if (!signinHtml.includes('data-drishvara-public-signin="ag14d-public-scaffold"')) fail("signin.html missing AG14D public sign-in marker");
if (!signinHtml.includes('data-auth-mode="public-preview-only"')) fail("signin.html must be public preview only");
if (signinHtml.includes('data-drishvara-admin-ui="ag14b-scaffold"')) fail("signin.html must not be Admin/Editor scaffold page");
if (/admin@drishvara\.internal|editor@drishvara\.internal|passwordHash|bcrypt|signInWithPassword|supabase|localStorage|sessionStorage|document\.cookie/i.test(signinHtml)) {
  fail("signin.html contains prohibited credential/auth signal");
}

if (!adminHtml.includes('data-drishvara-admin-ui="ag14b-scaffold"')) fail("admin.html must remain Admin/Editor scaffold");
if (!adminHtml.includes('name="robots" content="noindex,nofollow"')) fail("admin.html must remain noindex/nofollow");

for (const file of rootHtmlFiles()) {
  if (internalPages.has(file)) continue;
  const html = readText(file);
  if (hasInternalHref(html)) fail(`${file} still references internal Admin/Editor route through href`);
}

if (review.status !== "public_signin_internal_admin_route_separation_applied_pending_audit") fail("Review status mismatch");
if (apply.status !== "public_signin_internal_admin_route_separation_applied_pending_audit") fail("Apply status mismatch");
if (routeRecord.status !== "public_signin_internal_admin_route_separation_applied") fail("Route record status mismatch");
if (backupRecord.status !== "route_separation_backup_ready") fail("Backup record status mismatch");
if (readiness.status !== "ready_for_ag14e_admin_editor_decision_workflow_model") fail("Readiness status mismatch");

if (routeRecord.public_signin_route !== "signin.html") fail("Public sign-in route must be signin.html");
if (routeRecord.internal_admin_route !== "admin.html") fail("Internal admin route must be admin.html");
if (routeRecord.route_separation_valid !== true) fail("Route separation must be valid");
if (apply.route_separation_valid !== true) fail("Apply record must confirm route separation valid");

if (backupRecord.rollback_ready !== true) fail("Rollback readiness must be true");

if (readiness.ready_for_ag14e !== true) fail("AG14E readiness missing");
if (readiness.real_auth_ready !== false) fail("Real auth must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag14e_boundary_created_not_started") fail("AG14E boundary status mismatch");
if (boundary.next_stage_id !== "AG14E") fail("AG14E handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG14E explicit approval missing");

if (schema.status !== "schema_public_signin_internal_admin_route_separation_apply") fail("Schema status mismatch");

for (const key of [
  "signin_page_creation_allowed_in_ag14d",
  "public_navigation_link_update_allowed_in_ag14d",
  "admin_route_preservation_allowed_in_ag14d",
  "backup_record_allowed_in_ag14d",
  "ag14e_boundary_allowed_in_ag14d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "real_credential_creation_allowed_in_ag14d",
  "hardcoded_password_allowed_in_ag14d",
  "password_hash_commit_allowed_in_ag14d",
  "auth_activation_allowed_in_ag14d",
  "backend_activation_allowed_in_ag14d",
  "supabase_activation_allowed_in_ag14d",
  "article_mutation_allowed_in_ag14d",
  "public_visibility_switch_allowed_in_ag14d",
  "public_publishing_operation_allowed_in_ag14d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, apply, routeRecord, backupRecord, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.public_signin_internal_admin_route_separation_apply_only !== true) fail(`${obj.title || "object"} must be AG14D apply only`);
  if (obj.real_credential_created_in_ag14d !== false) fail(`${obj.title || "object"} must not create credentials`);
  if (obj.hardcoded_password_created_in_ag14d !== false) fail(`${obj.title || "object"} must not hardcode passwords`);
  if (obj.auth_activation_performed_in_ag14d !== false) fail(`${obj.title || "object"} must not activate auth`);
  if (obj.backend_activation_performed_in_ag14d !== false) fail(`${obj.title || "object"} must not activate backend`);
  if (obj.supabase_activation_performed_in_ag14d !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.article_mutation_performed_in_ag14d !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.public_publishing_operation_performed_in_ag14d !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Applied Decision", "Created / Updated", "Scope Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG14D document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag14d", "validate:ag14d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag14d")) {
  fail("validate:project must include validate:ag14d");
}

pass("AG14D registry is present.");
pass("AG14D document is present.");
pass("AG14D review, apply record, route record, backup record, readiness, AG14E boundary, schema, learning and preview are present.");
pass("AG14C route-separation audit is consumed.");
pass("signin.html is created/restored as public Sign in / Join preview route.");
pass("admin.html remains internal Admin/Editor scaffold and noindex/nofollow.");
pass("Public root HTML pages do not href internal Admin/Editor routes.");
pass("No real credentials, hardcoded passwords, password hashes or active auth are present.");
pass("Auth/backend/Supabase activation, article mutation, visibility switch and publishing remain blocked.");
pass("AG14E Admin Editor Decision Workflow Model boundary is created with explicit approval required.");
pass("AG14D is Public Sign-in and Internal Admin Route Separation Apply only.");
