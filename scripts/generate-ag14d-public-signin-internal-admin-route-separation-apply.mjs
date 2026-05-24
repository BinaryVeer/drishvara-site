import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag14cReview: "data/content-intelligence/quality-reviews/ag14c-admin-editor-ui-scaffold-route-separation-audit.json",
  ag14cAudit: "data/content-intelligence/audit-records/ag14c-admin-editor-ui-scaffold-route-separation-audit-report.json",
  ag14cSeparation: "data/content-intelligence/admin-architecture/ag14c-public-signin-internal-admin-route-separation-record.json",
  ag14cReadiness: "data/content-intelligence/quality-registry/ag14c-route-separation-refinement-readiness-record.json",
  ag14cBoundary: "data/content-intelligence/mutation-plans/ag14c-to-ag14d-public-signin-internal-admin-route-separation-apply-boundary.json",
  ag14bInventory: "data/content-intelligence/admin-architecture/ag14b-admin-editor-ui-page-inventory.json"
};

const backupDirRel = "data/content-intelligence/backups/ag14d-public-signin-internal-admin-route-separation";
const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag14d-public-signin-internal-admin-route-separation-apply.json");
const applyPath = path.join(root, "data/content-intelligence/apply-records/ag14d-public-signin-internal-admin-route-separation-apply.json");
const routeRecordPath = path.join(root, "data/content-intelligence/admin-architecture/ag14d-public-signin-internal-admin-route-separation-record.json");
const backupRecordPath = path.join(root, "data/content-intelligence/quality-registry/ag14d-route-separation-backup-readiness-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag14d-route-separation-apply-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag14d-to-ag14e-admin-editor-decision-workflow-model-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/public-signin-internal-admin-route-separation-apply.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag14d-public-signin-internal-admin-route-separation-apply-learning.json");
const registryPath = path.join(root, "data/quality/ag14d-public-signin-internal-admin-route-separation-apply.json");
const previewPath = path.join(root, "data/quality/ag14d-public-signin-internal-admin-route-separation-apply-preview.json");
const docPath = path.join(root, "docs/quality/AG14D_PUBLIC_SIGNIN_INTERNAL_ADMIN_ROUTE_SEPARATION_APPLY.md");

const internalPages = new Set([
  "admin.html",
  "admin-dashboard.html",
  "editor-dashboard.html",
  "editor-create.html",
  "editor-correction.html"
]);

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function backupFile(relativePath, label) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) return null;
  const text = fs.readFileSync(full, "utf8");
  const backupRel = path.join(backupDirRel, `${relativePath.replaceAll("/", "__")}-before-${label}.bak`);
  const backupFull = path.join(root, backupRel);
  ensureDir(backupFull);
  fs.writeFileSync(backupFull, text);
  return {
    file: relativePath,
    backup_file: backupRel,
    pre_hash: sha256(text)
  };
}

function rootHtmlFiles() {
  return fs.readdirSync(root)
    .filter((name) => name.endsWith(".html"))
    .filter((name) => fs.statSync(path.join(root, name)).isFile());
}

function hasInternalAdminHref(html) {
  return /href=(["'])\/?(?:admin|admin-dashboard|editor-dashboard|editor-create|editor-correction)\.html\1/i.test(html);
}

function replacePublicAdminLinks(html) {
  return html
    .replace(/href=(["'])\/?admin\.html\1/gi, "href=$1signin.html$1")
    .replace(/href=(["'])\/?admin-dashboard\.html\1/gi, "href=$1signin.html$1")
    .replace(/href=(["'])\/?editor-dashboard\.html\1/gi, "href=$1signin.html$1")
    .replace(/href=(["'])\/?editor-create\.html\1/gi, "href=$1signin.html$1")
    .replace(/href=(["'])\/?editor-correction\.html\1/gi, "href=$1signin.html$1");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG14D input ${name}: ${relativePath}`);
}

const ag14cReview = readJson(inputs.ag14cReview);
const ag14cAudit = readJson(inputs.ag14cAudit);
const ag14cSeparation = readJson(inputs.ag14cSeparation);
const ag14cReadiness = readJson(inputs.ag14cReadiness);
const ag14cBoundary = readJson(inputs.ag14cBoundary);
const ag14bInventory = readJson(inputs.ag14bInventory);

if (ag14cReview.status !== "ui_scaffold_audit_passed_route_separation_refinement_required") {
  throw new Error("AG14D requires AG14C route-separation audit.");
}
if (ag14cAudit.failed_checks.length !== 0) {
  throw new Error("AG14D requires AG14C failed checks to be zero.");
}
if (ag14cReadiness.ready_for_ag14d !== true) {
  throw new Error("AG14D requires AG14C readiness.");
}
if (ag14cBoundary.next_stage_id !== "AG14D" || ag14cBoundary.explicit_approval_required !== true) {
  throw new Error("AG14D requires AG14C to AG14D explicit boundary.");
}

const stageControls = {
  public_signin_internal_admin_route_separation_apply_only: true,
  signin_page_created_or_restored_in_ag14d: true,
  public_nav_route_separation_applied_in_ag14d: true,
  internal_admin_route_preserved_in_ag14d: true,
  backups_created_in_ag14d: true,
  ag14e_boundary_created_in_ag14d: true,

  real_credential_created_in_ag14d: false,
  hardcoded_password_created_in_ag14d: false,
  password_hash_created_in_repo_in_ag14d: false,
  auth_activation_performed_in_ag14d: false,
  backend_activation_performed_in_ag14d: false,
  supabase_activation_performed_in_ag14d: false,
  database_write_performed_in_ag14d: false,
  article_mutation_performed_in_ag14d: false,
  public_visibility_switch_performed_in_ag14d: false,
  public_publishing_operation_performed_in_ag14d: false,
  deployment_trigger_performed_in_ag14d: false
};

const backups = [];

const signinBackup = backupFile("signin.html", "ag14d");
if (signinBackup) backups.push(signinBackup);

const signinHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Sign in / Join | Drishvara</title>
  <style>
    :root{--navy:#0b1726;--gold:#d9b96e;--gold2:#f0d58b;--muted:#9fb0c3;--line:rgba(217,185,110,.28);--card:rgba(255,255,255,.06)}
    *{box-sizing:border-box}
    body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at 20% 0%,#18304d 0,#0b1726 38%,#050b12 100%);color:#f8fbff;min-height:100vh}
    a{color:inherit;text-decoration:none}
    .shell{max-width:1120px;margin:0 auto;padding:28px 20px 54px}
    .topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:34px}
    .brand{display:flex;align-items:center;gap:12px}
    .brand-mark{width:38px;height:38px;border:1px solid var(--line);border-radius:50%;display:grid;place-items:center;color:var(--gold2);box-shadow:0 0 28px rgba(217,185,110,.25)}
    .brand-title{font-weight:850;letter-spacing:.04em}
    .nav{display:flex;gap:12px;flex-wrap:wrap;color:#dce7f2;font-size:14px}
    .nav a{opacity:.86}
    .hero{padding:38px;border-radius:30px;background:linear-gradient(135deg,rgba(217,185,110,.12),rgba(255,255,255,.035));border:1px solid var(--line);margin-bottom:20px}
    h1{font-size:clamp(34px,5vw,58px);line-height:1.02;margin:0 0 14px}
    h2{font-size:23px;margin:0 0 12px}
    p{color:#cbd6e2;line-height:1.65;margin:0 0 12px}
    .small{font-size:13px;color:var(--muted)}
    .badge{border:1px solid var(--line);background:rgba(217,185,110,.09);color:var(--gold2);padding:7px 11px;border-radius:999px;font-size:12px;font-weight:750;display:inline-flex;margin-bottom:16px}
    .grid{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}
    .card{border:1px solid var(--line);background:linear-gradient(180deg,var(--card),rgba(255,255,255,.028));border-radius:24px;padding:22px;box-shadow:0 20px 65px rgba(0,0,0,.22)}
    .form-row{display:grid;gap:8px;margin-bottom:14px}
    label{font-size:13px;font-weight:760;color:#eaf2fb}
    input,select{width:100%;border:1px solid rgba(159,176,195,.35);background:rgba(4,10,17,.55);color:#fff;border-radius:14px;padding:12px 13px;outline:none}
    .btn,button{border:1px solid var(--line);background:linear-gradient(135deg,rgba(217,185,110,.22),rgba(217,185,110,.08));color:#fff;border-radius:14px;padding:11px 14px;font-weight:780;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px}
    button[disabled]{opacity:.55;cursor:not-allowed}
    .actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
    .notice{border:1px dashed rgba(240,213,139,.45);background:rgba(240,213,139,.08);border-radius:18px;padding:14px;color:#f5e7bf}
    @media(max-width:860px){.grid{grid-template-columns:1fr}.topbar{align-items:flex-start;flex-direction:column}}
  </style>
</head>
<body data-drishvara-public-signin="ag14d-public-scaffold" data-auth-mode="public-preview-only" data-real-auth="not-active">
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="index.html" aria-label="Drishvara home">
        <span class="brand-mark">D</span>
        <span>
          <span class="brand-title">Drishvara</span><br>
          <span class="small">Vision. Reflection. Insight.</span>
        </span>
      </a>
      <nav class="nav" aria-label="Primary navigation">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="insights.html">Insights</a>
        <a href="submissions.html">Submissions</a>
        <a href="dashboard.html">Dashboard</a>
        <a href="contact.html">Contact</a>
      </nav>
    </header>

    <section class="hero">
      <span class="badge">Public access preview</span>
      <h1>Sign in / Join Drishvara</h1>
      <p>Member access is being prepared for future personalised readings, saved insights, submissions and guided experiences. This page is visitor-facing and separate from internal publishing operations.</p>
    </section>

    <section class="grid">
      <div class="card">
        <h2>Join the upcoming experience</h2>
        <p>Drishvara will open member features progressively. For now, this public page preserves the product pathway without collecting credentials or personal data.</p>
        <div class="form-row">
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="Member sign-in is not active yet" autocomplete="off">
        </div>
        <div class="form-row">
          <label for="interest">Area of interest</label>
          <select id="interest">
            <option>Daily reflections</option>
            <option>Featured reads</option>
            <option>Submissions</option>
            <option>Future personalised guidance</option>
          </select>
        </div>
        <div class="actions">
          <button type="button" disabled data-public-auth-action="pending">Join waitlist soon</button>
          <a class="btn" href="index.html">Return home</a>
        </div>
        <p class="small">No password, login credential or user account is created on this static preview page.</p>
      </div>

      <div class="card">
        <h2>What this page is for</h2>
        <p class="notice">This is the public Sign in / Join route for future members and visitors.</p>
        <p>It keeps the product journey clean while internal editorial and publishing controls remain separate.</p>
        <h2>Future features</h2>
        <p>Saved reads, guided submissions, personalised dashboards, member preferences and notification controls may be added only after secure authentication is activated.</p>
      </div>
    </section>
  </main>
</body>
</html>
`;

writeText(path.join(root, "signin.html"), signinHtml);

const mutatedPublicFiles = [];
for (const file of rootHtmlFiles()) {
  if (internalPages.has(file) || file === "signin.html") continue;
  const html = readText(file);
  if (!hasInternalAdminHref(html)) continue;
  const backup = backupFile(file, "ag14d");
  if (backup) backups.push(backup);
  const updated = replacePublicAdminLinks(html);
  if (updated !== html) {
    writeText(path.join(root, file), updated);
    mutatedPublicFiles.push({
      file,
      pre_hash: sha256(html),
      post_hash: sha256(updated),
      replacement: "internal Admin/Editor href changed to signin.html"
    });
  }
}

const signinHash = sha256(readText("signin.html"));
const adminHtml = readText("admin.html");
const adminHash = sha256(adminHtml);

const publicHtmlScan = rootHtmlFiles()
  .filter((file) => !internalPages.has(file))
  .map((file) => {
    const html = readText(file);
    return {
      file,
      references_internal_admin_href: hasInternalAdminHref(html),
      references_signin_href: /href=(["'])\/?signin\.html\1/i.test(html),
      has_public_signin_marker: html.includes('data-drishvara-public-signin="ag14d-public-scaffold"')
    };
  });

const remainingPublicAdminHref = publicHtmlScan.some((scan) => scan.references_internal_admin_href);

if (remainingPublicAdminHref) {
  throw new Error("AG14D detected remaining public HTML href to internal Admin/Editor route after apply.");
}
if (!adminHtml.includes('data-drishvara-admin-ui="ag14b-scaffold"')) {
  throw new Error("AG14D requires admin.html to remain Admin/Editor scaffold.");
}
if (!adminHtml.includes('name="robots" content="noindex,nofollow"')) {
  throw new Error("AG14D requires admin.html to remain noindex/nofollow.");
}

const routeRecord = {
  module_id: "AG14D",
  title: "Public Sign-in and Internal Admin Route Separation Record",
  status: "public_signin_internal_admin_route_separation_applied",
  public_signin_route: "signin.html",
  internal_admin_route: "admin.html",
  created_or_restored_public_signin: true,
  signin_hash: signinHash,
  admin_hash_preserved_after_apply: adminHash,
  public_navigation_updates: mutatedPublicFiles,
  public_html_scan_after_apply: publicHtmlScan,
  route_separation_valid: !remainingPublicAdminHref,
  product_positioning: {
    public_signin_join: "Visitor/member-facing access preview.",
    internal_admin_editor: "Back-office editorial and publishing control scaffold.",
    public_nav_should_target: "signin.html",
    internal_admin_should_not_be_public_nav_target: true
  },
  ...stageControls
};

const backupRecord = {
  module_id: "AG14D",
  title: "Route Separation Backup Readiness Record",
  status: "route_separation_backup_ready",
  backup_directory: backupDirRel,
  backups,
  backup_count: backups.length,
  rollback_ready: true,
  ...stageControls
};

const applyRecord = {
  module_id: "AG14D",
  title: "Public Sign-in Internal Admin Route Separation Apply Record",
  status: "public_signin_internal_admin_route_separation_applied_pending_audit",
  created_files: ["signin.html"],
  mutated_public_files: mutatedPublicFiles,
  preserved_internal_files: Array.from(internalPages),
  signin_hash: signinHash,
  admin_hash: adminHash,
  route_separation_valid: true,
  ...stageControls
};

const readiness = {
  module_id: "AG14D",
  title: "Route Separation Apply Readiness Record",
  status: "ready_for_ag14e_admin_editor_decision_workflow_model",
  ready_for_ag14e: true,
  ag14e_explicit_approval_required: true,
  signin_created: true,
  public_nav_separated: true,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  publish_ready: false,
  reason: "AG14D applies route separation only. Next stage should define Admin/Editor decision workflow model without activating real auth.",
  ...stageControls
};

const boundary = {
  module_id: "AG14D",
  title: "AG14D to AG14E Admin Editor Decision Workflow Model Boundary",
  status: "ag14e_boundary_created_not_started",
  next_stage_id: "AG14E",
  next_stage_title: "Admin Editor Decision and Submission Workflow Model",
  explicit_approval_required: true,
  ag14e_allowed_scope: [
    "Define Admin decision workflow model.",
    "Define Editor manual creation and correction submission workflow.",
    "Define archive, return, publish and publish-close state transitions.",
    "Define audit-trail and versioning records.",
    "Keep real auth/backend/Supabase blocked."
  ],
  ag14e_blocked_scope: [
    "No real credential creation.",
    "No hardcoded passwords.",
    "No Auth/backend/Supabase activation.",
    "No article publishing.",
    "No public visibility switch for article candidates."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG14D",
  title: "Public Sign-in Internal Admin Route Separation Apply Schema",
  status: "schema_public_signin_internal_admin_route_separation_apply",
  signin_page_creation_allowed_in_ag14d: true,
  public_navigation_link_update_allowed_in_ag14d: true,
  admin_route_preservation_allowed_in_ag14d: true,
  backup_record_allowed_in_ag14d: true,
  ag14e_boundary_allowed_in_ag14d: true,

  real_credential_creation_allowed_in_ag14d: false,
  hardcoded_password_allowed_in_ag14d: false,
  password_hash_commit_allowed_in_ag14d: false,
  auth_activation_allowed_in_ag14d: false,
  backend_activation_allowed_in_ag14d: false,
  supabase_activation_allowed_in_ag14d: false,
  article_mutation_allowed_in_ag14d: false,
  public_visibility_switch_allowed_in_ag14d: false,
  public_publishing_operation_allowed_in_ag14d: false,
  ...stageControls
};

const review = {
  module_id: "AG14D",
  title: "Public Sign-in and Internal Admin Route Separation Apply",
  status: "public_signin_internal_admin_route_separation_applied_pending_audit",
  depends_on: ["AG14C"],
  generated_from: inputs,
  apply_record_file: "data/content-intelligence/apply-records/ag14d-public-signin-internal-admin-route-separation-apply.json",
  route_record_file: "data/content-intelligence/admin-architecture/ag14d-public-signin-internal-admin-route-separation-record.json",
  backup_record_file: "data/content-intelligence/quality-registry/ag14d-route-separation-backup-readiness-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag14d-route-separation-apply-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag14d-to-ag14e-admin-editor-decision-workflow-model-boundary.json",
  schema_file: "data/content-intelligence/schema/public-signin-internal-admin-route-separation-apply.schema.json",
  summary: {
    signin_created: true,
    public_route: "signin.html",
    internal_admin_route: "admin.html",
    mutated_public_file_count: mutatedPublicFiles.length,
    route_separation_valid: true,
    ready_for_ag14e: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG14D",
  title: "Public Sign-in Internal Admin Route Separation Apply Learning",
  status: "learning_record_only",
  learning_points: [
    "Public Sign in / Join should remain a visitor/member-facing product route.",
    "Internal Admin/Editor routes should not be linked from normal public navigation.",
    "A scaffold public sign-in page can exist before real authentication, provided it collects no credentials.",
    "Route separation should precede Admin/Editor workflow action modelling.",
    "Real authentication must remain outside public repository code."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG14D",
  title: "Public Sign-in and Internal Admin Route Separation Apply",
  status: "public_signin_internal_admin_route_separation_applied_pending_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag14d-public-signin-internal-admin-route-separation-apply.json",
    apply_record: "data/content-intelligence/apply-records/ag14d-public-signin-internal-admin-route-separation-apply.json",
    route_record: "data/content-intelligence/admin-architecture/ag14d-public-signin-internal-admin-route-separation-record.json",
    backup_record: "data/content-intelligence/quality-registry/ag14d-route-separation-backup-readiness-record.json",
    readiness: "data/content-intelligence/quality-registry/ag14d-route-separation-apply-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag14d-to-ag14e-admin-editor-decision-workflow-model-boundary.json",
    schema: "data/content-intelligence/schema/public-signin-internal-admin-route-separation-apply.schema.json",
    learning: "data/content-intelligence/learning/ag14d-public-signin-internal-admin-route-separation-apply-learning.json",
    preview: "data/quality/ag14d-public-signin-internal-admin-route-separation-apply-preview.json",
    document: "docs/quality/AG14D_PUBLIC_SIGNIN_INTERNAL_ADMIN_ROUTE_SEPARATION_APPLY.md",
    created_page: "signin.html"
  },
  ...stageControls
};

const preview = {
  module_id: "AG14D",
  preview_only: true,
  status: "public_signin_internal_admin_route_separation_applied_pending_audit",
  public_route: "signin.html",
  internal_admin_route: "admin.html",
  mutated_public_file_count: mutatedPublicFiles.length,
  route_separation_valid: true,
  real_auth_active: false,
  publish_ready: false,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG14D — Public Sign-in and Internal Admin Route Separation Apply

## Purpose

AG14D applies the product route-separation decision.

## Applied Decision

- Public visitor/member route: /signin.html
- Internal Admin/Editor route: /admin.html

## Created / Updated

- Created or restored signin.html as the public Sign in / Join preview page.
- Preserved admin.html as the internal Admin/Editor scaffold.
- Updated public HTML navigation links away from internal Admin/Editor routes where detected.

## Scope Boundary

AG14D does not create real credentials, hardcoded passwords, password hashes, Auth/backend/Supabase activation, article publishing or public visibility switching.

## Next Stage

AG14E — Admin Editor Decision and Submission Workflow Model — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(applyPath, applyRecord);
writeJson(routeRecordPath, routeRecord);
writeJson(backupRecordPath, backupRecord);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG14D public Sign-in / internal Admin route separation applied.");
console.log("✅ Public route created/restored: signin.html");
console.log("✅ Internal Admin/Editor route preserved: admin.html");
console.log(`✅ Public navigation files updated: ${mutatedPublicFiles.length}`);
console.log("✅ No real credentials, hardcoded passwords, Auth/backend/Supabase activation or publishing performed.");
console.log("✅ AG14E Admin/Editor Decision Workflow Model boundary created with explicit approval required.");
