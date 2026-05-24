import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag14aReview: "data/content-intelligence/quality-reviews/ag14a-admin-editor-login-role-credential-architecture.json",
  ag14aArchitecture: "data/content-intelligence/admin-architecture/ag14a-admin-editor-review-publishing-control-architecture.json",
  ag14aCredentialDoctrine: "data/content-intelligence/admin-architecture/ag14a-bootstrap-credential-first-login-doctrine.json",
  ag14aRoleRights: "data/content-intelligence/admin-architecture/ag14a-admin-editor-role-rights-matrix.json",
  ag14aWorkflow: "data/content-intelligence/admin-architecture/ag14a-admin-editor-workflow-state-model.json",
  ag14aReadiness: "data/content-intelligence/quality-registry/ag14a-admin-editor-architecture-readiness-record.json",
  ag14aBoundary: "data/content-intelligence/mutation-plans/ag14a-to-ag14b-admin-editor-login-ui-scaffold-boundary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json"
};

const pagePaths = {
  adminLogin: "admin.html",
  adminDashboard: "admin-dashboard.html",
  editorDashboard: "editor-dashboard.html",
  editorCreate: "editor-create.html",
  editorCorrection: "editor-correction.html"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag14b-admin-editor-login-ui-scaffold.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag14b-admin-editor-login-ui-scaffold-apply.json");
const pageInventoryPath = path.join(root, "data/content-intelligence/admin-architecture/ag14b-admin-editor-ui-page-inventory.json");
const queueRenderingPath = path.join(root, "data/content-intelligence/admin-architecture/ag14b-static-readonly-queue-rendering-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag14b-admin-editor-ui-scaffold-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag14b-to-ag14c-admin-editor-ui-scaffold-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/admin-editor-login-ui-scaffold.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag14b-admin-editor-login-ui-scaffold-learning.json");
const registryPath = path.join(root, "data/quality/ag14b-admin-editor-login-ui-scaffold.json");
const previewPath = path.join(root, "data/quality/ag14b-admin-editor-login-ui-scaffold-preview.json");
const docPath = path.join(root, "docs/quality/AG14B_ADMIN_EDITOR_LOGIN_UI_SCAFFOLD.md");

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

function htmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG14B input ${name}: ${relativePath}`);
}

const ag14aReview = readJson(inputs.ag14aReview);
const ag14aArchitecture = readJson(inputs.ag14aArchitecture);
const ag14aCredentialDoctrine = readJson(inputs.ag14aCredentialDoctrine);
const ag14aRoleRights = readJson(inputs.ag14aRoleRights);
const ag14aWorkflow = readJson(inputs.ag14aWorkflow);
const ag14aReadiness = readJson(inputs.ag14aReadiness);
const ag14aBoundary = readJson(inputs.ag14aBoundary);
const ag13zCandidate = readJson(inputs.ag13zCandidate);
const ag13zQueueIndex = readJson(inputs.ag13zQueueIndex);

if (ag14aReview.status !== "admin_editor_login_role_credential_architecture_defined") {
  throw new Error("AG14B requires AG14A review.");
}
if (ag14aReadiness.ready_for_ag14b !== true) {
  throw new Error("AG14B requires AG14A readiness.");
}
if (ag14aBoundary.next_stage_id !== "AG14B" || ag14aBoundary.explicit_approval_required !== true) {
  throw new Error("AG14B requires AG14A to AG14B explicit boundary.");
}

const selectedArticlePath = ag13zCandidate.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG14B requires selected article hash to match AG13Z candidate hash.");
}

const stageControls = {
  admin_editor_login_ui_scaffold_only: true,
  login_ui_pages_created_in_ag14b: true,
  admin_dashboard_scaffold_created_in_ag14b: true,
  editor_dashboard_scaffold_created_in_ag14b: true,
  editor_manual_creation_scaffold_created_in_ag14b: true,
  editor_correction_scaffold_created_in_ag14b: true,
  static_readonly_admin_queue_scaffold_created_in_ag14b: true,
  selected_article_read_performed: true,

  real_login_created_in_ag14b: false,
  real_credential_created_in_ag14b: false,
  credential_created_in_public_code_in_ag14b: false,
  hardcoded_password_created_in_ag14b: false,
  password_hash_created_in_repo_in_ag14b: false,
  auth_activation_performed_in_ag14b: false,
  backend_activation_performed_in_ag14b: false,
  supabase_activation_performed_in_ag14b: false,
  database_write_performed_in_ag14b: false,
  article_mutation_performed_in_ag14b: false,
  public_visibility_switch_performed_in_ag14b: false,
  public_publishing_operation_performed_in_ag14b: false,
  deployment_trigger_performed_in_ag14b: false,
  css_file_mutation_performed_in_ag14b: false,
  js_file_mutation_performed_in_ag14b: false
};

const css = `
:root {
  --ink:#071421;
  --navy:#0b1726;
  --navy2:#101f33;
  --gold:#d9b96e;
  --gold2:#f0d58b;
  --muted:#9fb0c3;
  --line:rgba(217,185,110,.28);
  --card:rgba(255,255,255,.055);
  --card2:rgba(255,255,255,.085);
  --ok:#7adf9a;
  --warn:#f0d58b;
  --bad:#ff9d9d;
}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at 20% 0%,#18304d 0,#0b1726 38%,#050b12 100%);color:#f8fbff;min-height:100vh}
a{color:inherit;text-decoration:none}
.shell{max-width:1180px;margin:0 auto;padding:28px 20px 54px}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:30px}
.brand{display:flex;align-items:center;gap:12px}
.brand-mark{width:38px;height:38px;border:1px solid var(--line);border-radius:50%;display:grid;place-items:center;color:var(--gold2);box-shadow:0 0 28px rgba(217,185,110,.25)}
.brand-title{font-weight:850;letter-spacing:.04em}
.badge{border:1px solid var(--line);background:rgba(217,185,110,.09);color:var(--gold2);padding:7px 11px;border-radius:999px;font-size:12px;font-weight:750}
.grid{display:grid;gap:18px}
.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}
.card{border:1px solid var(--line);background:linear-gradient(180deg,var(--card),rgba(255,255,255,.028));border-radius:24px;padding:22px;box-shadow:0 20px 65px rgba(0,0,0,.22)}
.hero{padding:34px;border-radius:30px;background:linear-gradient(135deg,rgba(217,185,110,.12),rgba(255,255,255,.035));border:1px solid var(--line);margin-bottom:20px}
h1{font-size:clamp(30px,5vw,56px);line-height:1.02;margin:0 0 14px}
h2{font-size:24px;margin:0 0 12px}
h3{font-size:17px;margin:0 0 10px}
p{color:#cbd6e2;line-height:1.65;margin:0 0 12px}
.small{font-size:13px;color:var(--muted)}
.form-row{display:grid;gap:8px;margin-bottom:14px}
label{font-size:13px;font-weight:760;color:#eaf2fb}
input,select,textarea{width:100%;border:1px solid rgba(159,176,195,.35);background:rgba(4,10,17,.55);color:#fff;border-radius:14px;padding:12px 13px;outline:none}
textarea{min-height:180px;resize:vertical}
button,.btn{border:1px solid var(--line);background:linear-gradient(135deg,rgba(217,185,110,.22),rgba(217,185,110,.08));color:#fff;border-radius:14px;padding:11px 14px;font-weight:780;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px}
button[disabled],.btn.disabled{opacity:.55;cursor:not-allowed}
.btn.secondary{background:rgba(255,255,255,.045)}
.btn.warn{border-color:rgba(240,213,139,.4)}
.btn.danger{border-color:rgba(255,157,157,.4)}
.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.kpi{font-size:32px;font-weight:900;color:var(--gold2)}
.table{width:100%;border-collapse:collapse;overflow:hidden;border-radius:18px}
.table th,.table td{border-bottom:1px solid rgba(255,255,255,.09);padding:12px;text-align:left;vertical-align:top}
.table th{color:var(--gold2);font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.status{display:inline-flex;padding:5px 9px;border-radius:999px;background:rgba(122,223,154,.12);color:var(--ok);font-size:12px;font-weight:800}
.status.blocked{background:rgba(240,213,139,.12);color:var(--warn)}
.notice{border:1px dashed rgba(240,213,139,.45);background:rgba(240,213,139,.08);border-radius:18px;padding:14px;color:#f5e7bf}
.editor-area{min-height:420px}
.split{display:grid;grid-template-columns:280px minmax(0,1fr) 300px;gap:18px}
.navlist{display:grid;gap:8px}
.navlist a{padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:13px;color:#dfe8f2;background:rgba(255,255,255,.035)}
@media(max-width:900px){.grid.two,.grid.three,.split{grid-template-columns:1fr}.topbar{align-items:flex-start;flex-direction:column}}
`;

function page(title, pageType, body, script = "") {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${htmlEscape(title)} | Drishvara</title>
  <style>${css}</style>
</head>
<body data-drishvara-admin-ui="ag14b-scaffold" data-page-type="${htmlEscape(pageType)}" data-auth-mode="scaffold-only" data-real-auth="not-active">
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="index.html" aria-label="Drishvara home">
        <span class="brand-mark">D</span>
        <span>
          <span class="brand-title">Drishvara</span><br>
          <span class="small">Admin / Editor scaffold</span>
        </span>
      </a>
      <span class="badge">AG14B UI scaffold · real auth pending</span>
    </header>
    ${body}
  </main>
  ${script}
</body>
</html>
`;
}

const candidateTitle = htmlEscape(ag13zCandidate.title);
const candidateScore = ag13zCandidate.publish_readiness_score;
const candidateStatus = htmlEscape(ag13zCandidate.status);
const candidateUrl = htmlEscape(ag13zCandidate.live_preview_url);
const candidateCategory = htmlEscape(ag13zCandidate.category);

const adminLoginHtml = page(
  "Admin and Editor Access",
  "admin-login",
  `
<section class="hero">
  <span class="badge">Restricted workspace preview</span>
  <h1>Admin & Editor Access</h1>
  <p>This scaffold prepares the controlled Drishvara review workspace. Real authentication, credentials and password reset are not active in this static UI.</p>
</section>

<section class="grid two">
  <div class="card">
    <h2>Access panel</h2>
    <p class="notice">Bootstrap credentials must be issued outside public code. First login must force password reset after secure authentication is activated.</p>
    <div class="form-row">
      <label for="role">Role</label>
      <select id="role" aria-label="Select role">
        <option>Admin</option>
        <option>Editor</option>
      </select>
    </div>
    <div class="form-row">
      <label for="identifier">Login identifier</label>
      <input id="identifier" type="email" placeholder="Issued securely outside public code" autocomplete="off">
    </div>
    <div class="form-row">
      <label for="accessPhrase">Password</label>
      <input id="accessPhrase" type="password" placeholder="Not stored in this page" autocomplete="off">
    </div>
    <div class="actions">
      <button type="button" disabled data-auth-action="disabled-until-secure-auth">Access console</button>
      <a class="btn secondary" href="admin-dashboard.html">Preview Admin dashboard</a>
      <a class="btn secondary" href="editor-dashboard.html">Preview Editor dashboard</a>
    </div>
    <p class="small">No credential validation is performed here. This page is a visual scaffold only.</p>
  </div>

  <div class="card">
    <h2>Role boundaries</h2>
    <div class="grid">
      <div>
        <h3>Admin</h3>
        <p>Can review, archive, return for correction, publish, publish and close after secure workflow activation.</p>
      </div>
      <div>
        <h3>Editor</h3>
        <p>Can manually create articles, correct returned articles, preview, save draft and submit to Admin. Editor cannot publish.</p>
      </div>
      <div>
        <h3>Security doctrine</h3>
        <p>Real credentials, password reset and role enforcement require a secure server-side/auth layer. No password is committed to the repository.</p>
      </div>
    </div>
  </div>
</section>
`
);

const adminDashboardHtml = page(
  "Admin Review Queue",
  "admin-dashboard",
  `
<section class="hero">
  <span class="badge">Admin dashboard scaffold</span>
  <h1>Admin Review Queue</h1>
  <p>Review generated and editor-submitted articles before public visibility. Action buttons are intentionally disabled until secure action handling is activated.</p>
</section>

<section class="grid three">
  <div class="card"><p class="small">Pending candidates</p><div class="kpi" id="candidateCount">1</div></div>
  <div class="card"><p class="small">Readiness score</p><div class="kpi">${candidateScore}/100</div></div>
  <div class="card"><p class="small">Hard blockers</p><div class="kpi">0</div></div>
</section>

<section class="card" style="margin-top:18px">
  <h2>Seed candidate</h2>
  <table class="table" aria-label="Admin review queue">
    <thead>
      <tr>
        <th>Article</th>
        <th>Category</th>
        <th>Status</th>
        <th>Score</th>
        <th>Preview</th>
        <th>Admin actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${candidateTitle}</strong><br><span class="small">${htmlEscape(ag13zCandidate.article_id)}</span></td>
        <td>${candidateCategory}</td>
        <td><span class="status">${candidateStatus}</span><br><span class="small">Public visibility: false</span></td>
        <td><strong>${candidateScore}/100</strong><br><span class="small">Zero hard blockers</span></td>
        <td><a class="btn secondary" href="${candidateUrl}" target="_blank" rel="noopener">Open live preview</a></td>
        <td>
          <div class="actions">
            <button type="button" disabled data-admin-action="archive">Archive</button>
            <button type="button" disabled data-admin-action="return_for_correction">Return for correction</button>
            <button type="button" disabled data-admin-action="publish">Publish</button>
            <button type="button" disabled data-admin-action="publish_and_close">Publish and close</button>
          </div>
          <p class="small">Requires secure Admin action handler.</p>
        </td>
      </tr>
    </tbody>
  </table>
</section>

<section class="grid two" style="margin-top:18px">
  <div class="card">
    <h2>Admin decision rules</h2>
    <p>Archive keeps the record for intelligence and reuse. Return for correction opens Editor correction workspace. Publish makes public after secure workflow activation. Publish and close removes it from pending queue.</p>
  </div>
  <div class="card">
    <h2>Audit requirement</h2>
    <p>Every action must later record actor, role, timestamp, remarks, previous status, new status and article hash.</p>
  </div>
</section>
`
);

const editorDashboardHtml = page(
  "Editor Workspace",
  "editor-dashboard",
  `
<section class="hero">
  <span class="badge">Editor workspace scaffold</span>
  <h1>Editor Dashboard</h1>
  <p>Create manual articles, correct returned articles, preview content and submit to Admin. Editor publishing is blocked by design.</p>
</section>

<section class="grid three">
  <div class="card">
    <h2>Create</h2>
    <p>Start a manual article using Drishvara article fields, references, credits and preview structure.</p>
    <div class="actions"><a class="btn" href="editor-create.html">Create new article</a></div>
  </div>
  <div class="card">
    <h2>Corrections</h2>
    <p>Open returned articles with Admin remarks and submit corrected versions back to Admin.</p>
    <div class="actions"><a class="btn" href="editor-correction.html">Open correction workspace</a></div>
  </div>
  <div class="card">
    <h2>Submitted</h2>
    <p>Track editor-submitted articles awaiting Admin decision. This list will become dynamic after secure workflow activation.</p>
    <div class="actions"><button type="button" disabled>View submitted queue</button></div>
  </div>
</section>

<section class="card" style="margin-top:18px">
  <h2>Editor rights</h2>
  <table class="table">
    <thead><tr><th>Allowed</th><th>Blocked</th></tr></thead>
    <tbody>
      <tr>
        <td>Create manual article, save draft, edit returned article, preview, submit to Admin, resubmit to Admin.</td>
        <td>Publish, publish and close, approve public visibility, bypass Admin review.</td>
      </tr>
    </tbody>
  </table>
</section>
`
);

const editorCreateHtml = page(
  "Editor Manual Article Creation",
  "editor-create",
  `
<section class="hero">
  <span class="badge">Manual creation scaffold</span>
  <h1>Create Manual Article</h1>
  <p>This workspace lets an Editor draft original content and submit it to Admin after secure save/submit actions are activated.</p>
</section>

<section class="split">
  <aside class="card">
    <h2>Sections</h2>
    <nav class="navlist">
      <a href="#meta">Metadata</a>
      <a href="#body">Article body</a>
      <a href="#refs">References</a>
      <a href="#objects">Objects / visuals</a>
      <a href="#seo">SEO</a>
    </nav>
    <p class="small">Editor-created articles must still pass Admin review.</p>
  </aside>

  <section class="card">
    <h2 id="meta">Article metadata</h2>
    <div class="grid two">
      <div class="form-row"><label>Title</label><input placeholder="Enter article title"></div>
      <div class="form-row"><label>Category</label><select><option>Spirituality</option><option>Policy</option><option>World affairs</option><option>Media & society</option><option>Public programmes</option></select></div>
    </div>
    <div class="form-row"><label>Summary</label><textarea placeholder="Short editorial summary"></textarea></div>

    <h2 id="body">Article body</h2>
    <div class="form-row"><label>Main body</label><textarea class="editor-area" placeholder="Write article content manually"></textarea></div>

    <h2 id="refs">References</h2>
    <div class="grid two">
      <div class="form-row"><label>Reference 1</label><input placeholder="Verified reference URL"></div>
      <div class="form-row"><label>Reference 2</label><input placeholder="Verified reference URL"></div>
    </div>

    <h2 id="objects">Objects / visuals</h2>
    <div class="form-row"><label>Object notes</label><textarea placeholder="Chart, image, table, figure or other object requirement"></textarea></div>

    <h2 id="seo">SEO</h2>
    <div class="grid two">
      <div class="form-row"><label>SEO title</label><input placeholder="SEO title"></div>
      <div class="form-row"><label>SEO description</label><input placeholder="SEO description"></div>
    </div>

    <div class="actions">
      <button type="button" disabled data-editor-action="save_draft">Save draft</button>
      <button type="button" disabled data-editor-action="preview">Preview</button>
      <button type="button" disabled data-editor-action="submit_to_admin">Submit to Admin</button>
    </div>
  </section>

  <aside class="card">
    <h2>Readiness</h2>
    <p class="notice">Manual article creation is scaffold-only. Save and submit require secure workflow activation.</p>
    <p class="small">Required before Admin review: title, category, body, references, credits, preview check and no hard blockers.</p>
  </aside>
</section>
`
);

const editorCorrectionHtml = page(
  "Editor Correction Workspace",
  "editor-correction",
  `
<section class="hero">
  <span class="badge">Correction scaffold</span>
  <h1>Correction Workspace</h1>
  <p>Returned articles will open here with Admin remarks. Editor can manually revise and resubmit to Admin after secure workflow activation.</p>
</section>

<section class="split">
  <aside class="card">
    <h2>Admin remarks</h2>
    <p class="notice">No active correction task yet. This scaffold shows the planned correction workspace.</p>
    <p class="small">Future correction reasons: editorial issue, reference issue, object/layout issue, mobile issue, tone issue, publish-risk issue, other.</p>
  </aside>

  <section class="card">
    <h2>Returned article editor</h2>
    <div class="form-row"><label>Article title</label><input value="${candidateTitle}"></div>
    <div class="form-row"><label>Correction notes</label><textarea placeholder="Editor correction notes"></textarea></div>
    <div class="form-row"><label>Corrected body</label><textarea class="editor-area" placeholder="Returned article content will appear here for manual correction"></textarea></div>
    <div class="actions">
      <button type="button" disabled data-editor-action="save_revision">Save revision</button>
      <button type="button" disabled data-editor-action="preview_revision">Preview revision</button>
      <button type="button" disabled data-editor-action="resubmit_to_admin">Resubmit to Admin</button>
    </div>
  </section>

  <aside class="card">
    <h2>Versioning</h2>
    <p>v1 — pipeline/editor original</p>
    <p>v2 — editor correction</p>
    <p>v3 — further correction if returned again</p>
    <p class="small">All future correction actions must preserve article hash and audit trail.</p>
  </aside>
</section>
`
);

const pageFiles = [
  { path: pagePaths.adminLogin, html: adminLoginHtml, title: "Admin and Editor Access", type: "admin_login_scaffold" },
  { path: pagePaths.adminDashboard, html: adminDashboardHtml, title: "Admin Review Queue", type: "admin_dashboard_scaffold" },
  { path: pagePaths.editorDashboard, html: editorDashboardHtml, title: "Editor Workspace", type: "editor_dashboard_scaffold" },
  { path: pagePaths.editorCreate, html: editorCreateHtml, title: "Editor Manual Article Creation", type: "editor_manual_creation_scaffold" },
  { path: pagePaths.editorCorrection, html: editorCorrectionHtml, title: "Editor Correction Workspace", type: "editor_correction_scaffold" }
];

for (const file of pageFiles) {
  writeText(path.join(root, file.path), file.html);
}

const pageInventory = {
  module_id: "AG14B",
  title: "Admin Editor UI Page Inventory",
  status: "admin_editor_ui_pages_created_scaffold_only",
  pages: pageFiles.map((file) => ({
    path: file.path,
    title: file.title,
    type: file.type,
    hash: sha256(file.html),
    noindex: file.html.includes('name="robots" content="noindex,nofollow"'),
    scaffold_marker_present: file.html.includes('data-drishvara-admin-ui="ag14b-scaffold"'),
    real_auth_active: false
  })),
  ...stageControls
};

const queueRendering = {
  module_id: "AG14B",
  title: "Static Readonly Queue Rendering Record",
  status: "static_readonly_queue_rendering_scaffold_created",
  source_queue_index: inputs.ag13zQueueIndex,
  source_candidate: inputs.ag13zCandidate,
  rendered_candidate_count: ag13zQueueIndex.total_candidates,
  rendered_seed_candidate: {
    article_id: ag13zCandidate.article_id,
    title: ag13zCandidate.title,
    status: ag13zCandidate.status,
    publish_readiness_score: ag13zCandidate.publish_readiness_score,
    public_visibility: ag13zCandidate.public_visibility,
    publish_approved: ag13zCandidate.publish_approved
  },
  action_buttons_present_but_disabled: true,
  action_execution_available: false,
  ...stageControls
};

const applyRecord = {
  module_id: "AG14B",
  title: "Admin Editor Login UI Scaffold Apply Record",
  status: "admin_editor_login_ui_scaffold_created_pending_audit",
  created_files: pageFiles.map((file) => file.path),
  selected_article_path: selectedArticlePath,
  selected_article_hash_at_ag14b: articleHash,
  page_inventory_file: "data/content-intelligence/admin-architecture/ag14b-admin-editor-ui-page-inventory.json",
  queue_rendering_file: "data/content-intelligence/admin-architecture/ag14b-static-readonly-queue-rendering-record.json",
  ...stageControls
};

const readiness = {
  module_id: "AG14B",
  title: "Admin Editor UI Scaffold Readiness Record",
  status: "ready_for_ag14c_admin_editor_ui_scaffold_audit",
  created_page_count: pageFiles.length,
  ready_for_ag14c: true,
  ag14c_explicit_approval_required: true,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  publish_ready: false,
  reason_blocked: "AG14B creates static UI scaffold only. Real authentication, credential storage, action execution and publishing remain blocked.",
  ...stageControls
};

const boundary = {
  module_id: "AG14B",
  title: "AG14B to AG14C Admin Editor UI Scaffold Audit Boundary",
  status: "ag14c_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag14b: articleHash,
  next_stage_id: "AG14C",
  next_stage_title: "Admin Editor UI Scaffold Audit and Workflow Readiness",
  explicit_approval_required: true,
  ag14c_allowed_scope: [
    "Audit Admin and Editor UI scaffold pages.",
    "Confirm no credentials, hardcoded passwords or active auth are present.",
    "Confirm action buttons are disabled and scaffold-only.",
    "Confirm queue candidate renders as read-only.",
    "Confirm readiness for workflow/action model stage."
  ],
  ag14c_blocked_scope: [
    "No real credential creation.",
    "No Auth/backend/Supabase activation.",
    "No article mutation.",
    "No public visibility switch.",
    "No publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG14B",
  title: "Admin Editor Login UI Scaffold Schema",
  status: "schema_admin_editor_login_ui_scaffold",
  login_ui_scaffold_allowed_in_ag14b: true,
  admin_dashboard_scaffold_allowed_in_ag14b: true,
  editor_dashboard_scaffold_allowed_in_ag14b: true,
  editor_create_scaffold_allowed_in_ag14b: true,
  editor_correction_scaffold_allowed_in_ag14b: true,
  readonly_queue_rendering_allowed_in_ag14b: true,
  ag14c_boundary_allowed_in_ag14b: true,

  real_login_allowed_in_ag14b: false,
  real_credential_creation_allowed_in_ag14b: false,
  hardcoded_password_allowed_in_ag14b: false,
  password_hash_commit_allowed_in_ag14b: false,
  auth_activation_allowed_in_ag14b: false,
  backend_activation_allowed_in_ag14b: false,
  supabase_activation_allowed_in_ag14b: false,
  article_mutation_allowed_in_ag14b: false,
  public_visibility_switch_allowed_in_ag14b: false,
  public_publishing_operation_allowed_in_ag14b: false,
  ...stageControls
};

const review = {
  module_id: "AG14B",
  title: "Admin and Editor Login UI Scaffold",
  status: "admin_editor_login_ui_scaffold_created_pending_audit",
  depends_on: ["AG14A"],
  generated_from: inputs,
  apply_record_file: "data/content-intelligence/apply-records/ag14b-admin-editor-login-ui-scaffold-apply.json",
  page_inventory_file: "data/content-intelligence/admin-architecture/ag14b-admin-editor-ui-page-inventory.json",
  queue_rendering_file: "data/content-intelligence/admin-architecture/ag14b-static-readonly-queue-rendering-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag14b-admin-editor-ui-scaffold-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag14b-to-ag14c-admin-editor-ui-scaffold-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/admin-editor-login-ui-scaffold.schema.json",
  summary: {
    created_page_count: pageFiles.length,
    pages: Object.values(pagePaths),
    real_credentials_created: false,
    hardcoded_password_created: false,
    real_auth_active: false,
    ready_for_ag14c: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG14B",
  title: "Admin Editor Login UI Scaffold Learning",
  status: "learning_record_only",
  learning_points: [
    "Admin and Editor UI can be scaffolded before real authentication is activated.",
    "Scaffold pages must not contain real credentials, password hashes or action execution.",
    "Editor manual creation and correction workspaces should be separate from Admin dashboard.",
    "Admin dashboard should show queue and decisions, but action execution needs secure handler later.",
    "The next stage should audit all UI scaffold pages before workflow actions are modelled."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG14B",
  title: "Admin and Editor Login UI Scaffold",
  status: "admin_editor_login_ui_scaffold_created_pending_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag14b-admin-editor-login-ui-scaffold.json",
    apply_record: "data/content-intelligence/apply-records/ag14b-admin-editor-login-ui-scaffold-apply.json",
    page_inventory: "data/content-intelligence/admin-architecture/ag14b-admin-editor-ui-page-inventory.json",
    queue_rendering: "data/content-intelligence/admin-architecture/ag14b-static-readonly-queue-rendering-record.json",
    readiness: "data/content-intelligence/quality-registry/ag14b-admin-editor-ui-scaffold-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag14b-to-ag14c-admin-editor-ui-scaffold-audit-boundary.json",
    schema: "data/content-intelligence/schema/admin-editor-login-ui-scaffold.schema.json",
    learning: "data/content-intelligence/learning/ag14b-admin-editor-login-ui-scaffold-learning.json",
    preview: "data/quality/ag14b-admin-editor-login-ui-scaffold-preview.json",
    document: "docs/quality/AG14B_ADMIN_EDITOR_LOGIN_UI_SCAFFOLD.md",
    pages: Object.values(pagePaths)
  },
  ...stageControls
};

const preview = {
  module_id: "AG14B",
  preview_only: true,
  status: "admin_editor_login_ui_scaffold_created_pending_audit",
  created_pages: Object.values(pagePaths),
  admin_login_route: "/admin.html",
  real_auth_active: false,
  real_credentials_created: false,
  hardcoded_password_created: false,
  ready_for_ag14c: true,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG14B — Admin and Editor Login UI Scaffold

## Purpose

AG14B creates static visual scaffold pages for Admin and Editor workflows.

## Created Pages

- /admin.html
- /admin-dashboard.html
- /editor-dashboard.html
- /editor-create.html
- /editor-correction.html

## Scope

The pages are scaffold-only. They do not contain real credentials, hardcoded passwords, password hashes, active authentication, backend/Supabase activation, database writes, public visibility switching or publishing operations.

## Admin Scaffold

The Admin dashboard shows the seeded Admin Review candidate, publish-readiness score and disabled Admin action buttons.

## Editor Scaffold

The Editor dashboard includes manual article creation and correction workspace routes. Editor publishing remains blocked.

## Next Stage

AG14C — Admin Editor UI Scaffold Audit and Workflow Readiness — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(applyRecordPath, applyRecord);
writeJson(pageInventoryPath, pageInventory);
writeJson(queueRenderingPath, queueRendering);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG14B Admin and Editor Login UI Scaffold generated.");
console.log("✅ Created pages: admin.html, admin-dashboard.html, editor-dashboard.html, editor-create.html, editor-correction.html");
console.log("✅ Admin dashboard scaffold includes read-only queue and disabled action buttons.");
console.log("✅ Editor dashboard scaffold includes manual creation and correction workspace.");
console.log("✅ No real credentials, hardcoded passwords, Auth/backend/Supabase activation or publishing performed.");
console.log("✅ AG14C Admin Editor UI Scaffold Audit boundary created with explicit approval required.");
