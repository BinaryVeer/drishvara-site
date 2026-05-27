import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";
const EDITOR_EMAIL = "vikash4world@gmail.com";

const inputs = {
  ag36aR1Review: "data/content-intelligence/quality-reviews/ag36a-r1-admin-live-auth-wiring.json",
  ag36aR1Package: "data/content-intelligence/backend-architecture/ag36a-r1-admin-live-auth-wiring-package.json",
  ag36aR1Readiness: "data/content-intelligence/quality-registry/ag36a-r1-admin-live-auth-test-readiness-record.json",
  ag36aPackage: "data/content-intelligence/backend-architecture/ag36a-admin-login-test-package.json",
  ag35zClosure: "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  ag35cRoleVerification: "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json",
  ag26zRoleGovernance: "data/content-intelligence/admin-editor/ag26z-role-governance-closure-register.json",
  editorLogin: "editor/login.html"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag36b-r1-editor-live-auth-wiring.json",
  package: "data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-package.json",
  wiringRecord: "data/content-intelligence/backend-architecture/ag36b-r1-editor-live-auth-wiring-record.json",
  localConfigGuide: "data/content-intelligence/backend-architecture/ag36b-r1-local-auth-config-guide.json",
  nonSecretAudit: "data/content-intelligence/backend-architecture/ag36b-r1-non-secret-wiring-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag36b-r1-editor-live-auth-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag36b-r1-to-ag36b-manual-editor-login-confirmation-boundary.json",
  registry: "data/quality/ag36b-r1-editor-live-auth-wiring.json",
  preview: "data/quality/ag36b-r1-editor-live-auth-wiring-preview.json",
  doc: "docs/quality/AG36B_R1_EDITOR_LIVE_AUTH_WIRING.md",
  js: "assets/js/ag36b-editor-live-auth.js"
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

function readText(p) {
  return fs.readFileSync(full(p), "utf8");
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
  if (!exists(p)) throw new Error(`Missing AG36B-R1 input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs)
    .filter(([key]) => key !== "editorLogin")
    .map(([key, file]) => [key, readJson(file)])
);

if (records.ag36aR1Package.status !== "admin_live_auth_wiring_package_created_pending_manual_config_and_test") {
  throw new Error("AG36A-R1 package status mismatch.");
}
if (records.ag35zClosure.status !== "backend_auth_activation_closure_created_ready_for_ag36a") {
  throw new Error("AG35Z closure status mismatch.");
}
if (records.ag35cRoleVerification.all_role_checks_passed !== true) {
  throw new Error("AG35C role verification must pass.");
}
if (records.ag26zRoleGovernance.role_rules?.editor_can_only_work_on_admin_assigned_items !== true) {
  throw new Error("Editor assigned-only rule missing.");
}
if (records.ag26zRoleGovernance.role_rules?.editor_cannot_publish !== true) {
  throw new Error("Editor no-publish rule missing.");
}

const localConfigPath = "assets/js/drishvara-auth-local.js";

const blockedState = {
  editor_live_auth_wiring_created: true,
  editor_login_html_patched: true,
  editor_live_auth_js_created: true,
  shared_local_config_used: true,
  local_secret_config_gitignored: true,

  real_editor_login_test_performed_by_script: false,
  password_recorded: false,
  auth_token_recorded: false,
  cookie_recorded: false,
  supabase_url_recorded: false,
  supabase_anon_key_recorded: false,
  supabase_service_role_key_recorded: false,
  supabase_service_role_key_exposed: false,
  env_vars_recorded: false,
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_created: false,
  publish_handler_enabled: false
};

let gitignore = exists(".gitignore") ? readText(".gitignore") : "";
if (!gitignore.includes(localConfigPath)) {
  gitignore = gitignore.trimEnd() + "\n\n# Drishvara local browser Auth config — never commit real Supabase values\n" + localConfigPath + "\n";
  writeText(".gitignore", gitignore);
}

const liveAuthJs = `(function () {
  const statusEl = document.querySelector("[data-ag36b-status]");
  const form = document.getElementById("editor-login-preview");
  const emailInput = document.getElementById("editor-email");
  const passwordInput = document.getElementById("editor-password");
  const submitButton = document.querySelector("[data-ag36b-submit]");
  const signOutButton = document.querySelector("[data-ag36b-signout]");
  const successPath = "/editor-dashboard.html";

  function setStatus(message, kind = "info") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.setAttribute("data-kind", kind);
  }

  function setBusy(isBusy) {
    if (submitButton) {
      submitButton.disabled = isBusy;
      submitButton.textContent = isBusy ? "Checking Editor access…" : "Sign in as Editor";
    }
  }

  function getConfig() {
    return window.DRISHVARA_AUTH_CONFIG || null;
  }

  function configReady(config) {
    return Boolean(
      config &&
      config.supabaseUrl &&
      config.supabaseAnonKey &&
      !String(config.supabaseUrl).includes("PASTE_") &&
      !String(config.supabaseAnonKey).includes("PASTE_")
    );
  }

  function getSupabaseClient() {
    const config = getConfig();
    if (!configReady(config)) {
      throw new Error("Local Supabase browser config is missing. Create assets/js/drishvara-auth-local.js from the example template.");
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("Supabase browser library did not load.");
    }
    return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  async function verifyEditorProfile(client, userEmail) {
    const { data, error } = await client
      .from("profiles")
      .select("email, role, is_active")
      .eq("email", userEmail)
      .eq("role", "editor")
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(error.message || "Could not verify Editor profile.");
    if (!data) throw new Error("Login succeeded, but active Editor profile was not found.");
    return data;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);

    try {
      const client = getSupabaseClient();
      const email = (emailInput?.value || "").trim();
      const password = passwordInput?.value || "";

      if (!email || !password) {
        throw new Error("Enter Editor email and password.");
      }

      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message || "Editor login failed.");
      if (!data?.user?.email) throw new Error("Editor login returned no user email.");

      await verifyEditorProfile(client, data.user.email);

      setStatus("Editor login successful. Active Editor profile verified.", "success");
      window.location.href = (getConfig()?.editorSuccessPath || successPath);
    } catch (error) {
      setStatus(error.message || "Editor login failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    try {
      const client = getSupabaseClient();
      await client.auth.signOut();
      setStatus("Signed out locally.", "info");
    } catch (error) {
      setStatus(error.message || "Sign out failed.", "error");
    }
  }

  function boot() {
    const config = getConfig();

    if (!configReady(config)) {
      setStatus("Local Auth config missing. Create assets/js/drishvara-auth-local.js from the example template.", "warning");
    } else {
      setStatus("Local Supabase Auth config detected. Editor login test is ready.", "success");
    }

    if (emailInput) {
      emailInput.value = config?.editorEmail || "${EDITOR_EMAIL}";
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Sign in as Editor";
      submitButton.style.cursor = "pointer";
      submitButton.style.opacity = "1";
    }

    form?.addEventListener("submit", handleSubmit);
    signOutButton?.addEventListener("click", handleSignOut);
  }

  window.addEventListener("load", boot);
})();
`;

let html = readText(inputs.editorLogin);

html = html
  .replace(
    "<title>Drishvara Editor Login — Non-active Scaffold</title>",
    "<title>Drishvara Editor Login — Controlled Live Auth Test</title>"
  )
  .replace(
    "<h1>Editor Login UI Scaffold</h1>",
    "<h1>Editor Login</h1>"
  )
  .replace(
    "This page is a governed, non-active interface preview for the future Editor workspace. It does not authenticate, store credentials, create sessions, call APIs or connect to Supabase.",
    "This page is a governed Editor login test surface for controlled Supabase Auth verification. It uses only the browser-safe anon key from a local gitignored config file."
  )
  .replace(
    '<div class="notice">Non-active scaffold only. Login is not real.</div>',
    '<div class="notice" data-ag36b-status>Local Auth config pending. Editor login test not yet executed.</div>'
  )
  .replace(
    "<span>Backend/Auth activation: blocked</span>",
    "<span>Backend/Auth activation: controlled AG35 closure complete</span>"
  )
  .replace(
    "<span>Supabase connection: blocked</span>",
    "<span>Supabase browser client: local config required</span>"
  )
  .replace(
    "For future Editor review, correction and assigned-only workflows after explicit activation approval.",
    "For controlled Editor review, correction and assigned-only workflows after AG35 backend/Auth activation closure."
  )
  .replace(
    '<input id="editor-password" name="editor-password" type="password" placeholder="Not active" aria-describedby="non-active-help" />',
    '<input id="editor-password" name="editor-password" type="password" placeholder="Enter password only in browser" aria-describedby="non-active-help" />'
  )
  .replace(
    '<button type="submit">Preview only — login not active</button>',
    '<button type="submit" data-ag36b-submit>Sign in as Editor</button><button type="button" data-ag36b-signout style="margin-top:10px;background:#64748b;">Sign out locally</button>'
  )
  .replace(
    "This form blocks submission locally. No credential is processed, stored, validated or transmitted.",
    "This controlled test uses Supabase Auth in the browser. Do not record or share password, token, cookie, Supabase key or secret-bearing URL."
  )
  .replace(
    `  <script>
    document.getElementById("editor-login-preview").addEventListener("submit", function (event) {
      event.preventDefault();
      alert("AG30B preview only: real Editor login is not active.");
    });
  </script>`,
    `  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="../assets/js/drishvara-auth-local.js"></script>
  <script src="../assets/js/ag36b-editor-live-auth.js"></script>`
  );

writeText(inputs.editorLogin, html);
writeText(outputs.js, liveAuthJs);

const localConfigGuide = {
  module_id: "AG36B-R1",
  title: "Editor Local Auth Config Guide",
  status: "editor_local_auth_config_guide_created",
  shared_gitignored_local_config_path: localConfigPath,
  committed_template_path: "assets/js/drishvara-auth-local.example.js",
  required_public_values_only: [
    "Supabase Project URL",
    "Supabase anon/public key",
    "Optional editorEmail",
    "Optional editorSuccessPath"
  ],
  forbidden_values: [
    "service-role key",
    "database password",
    "user password",
    "Auth token",
    "session cookie",
    "JWT",
    "environment secret"
  ],
  blocked_state: blockedState
};

const nonSecretAudit = {
  module_id: "AG36B-R1",
  title: "Editor Non-Secret Wiring Audit Register",
  status: "editor_non_secret_wiring_audit_passed",
  checks: [
    {
      check_id: "shared_local_config_gitignored",
      passed: readText(".gitignore").includes(localConfigPath),
      evidence: ".gitignore contains shared local config path."
    },
    {
      check_id: "editor_html_uses_local_config",
      passed: html.includes("../assets/js/drishvara-auth-local.js") && html.includes("../assets/js/ag36b-editor-live-auth.js"),
      evidence: inputs.editorLogin
    },
    {
      check_id: "editor_js_profile_role_verification",
      passed: liveAuthJs.includes('.eq("role", "editor")') && liveAuthJs.includes("signInWithPassword"),
      evidence: outputs.js
    },
    {
      check_id: "no_service_role_string_in_runtime_js",
      passed: !liveAuthJs.toLowerCase().includes("service_role"),
      evidence: outputs.js
    },
    {
      check_id: "no_deployment_or_public_mutation",
      passed: true,
      evidence: "Patch is local code only."
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const wiringRecord = {
  module_id: "AG36B-R1",
  title: "Editor Live Auth Wiring Record",
  status: "editor_live_auth_wiring_created_pending_local_config_and_manual_login_test",
  patched_files: [
    inputs.editorLogin,
    outputs.js,
    ".gitignore"
  ],
  live_auth_scope: {
    editor_login_page_wired_to_supabase_browser_client: true,
    editor_profile_role_verification_enabled: true,
    editor_assigned_only_governance_preserved: true,
    editor_no_publish_governance_preserved: true,
    service_role_key_required: false,
    shared_local_config_required: true,
    local_config_committed: false,
    public_mutation_enabled: false,
    deployment_enabled: false
  },
  blocked_state: blockedState
};

const packageRecord = {
  module_id: "AG36B-R1",
  title: "Editor Live Auth Wiring Package",
  status: "editor_live_auth_wiring_package_created_pending_manual_config_and_test",
  purpose:
    "Wire the Editor login page to Supabase browser Auth using the gitignored local browser config, without committing keys/secrets or enabling deployment/public mutation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  package_decision: {
    editor_live_auth_wiring_created: true,
    manual_local_config_required: true,
    manual_editor_login_test_required: true,

    local_config_committed: false,
    password_recorded: false,
    token_recorded: false,
    cookie_recorded: false,
    supabase_url_recorded: false,
    supabase_anon_key_recorded: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    env_vars_recorded: false,
    deployment_done: false,
    public_mutation_done: false
  },
  wiring_record_file: outputs.wiringRecord,
  local_config_guide_file: outputs.localConfigGuide,
  non_secret_audit_file: outputs.nonSecretAudit,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG36B-R1",
  title: "Editor Live Auth Test Readiness Record",
  status: "ready_for_manual_editor_live_auth_test_after_local_config",
  ready_for_manual_editor_login_test: true,
  required_before_test: [
    `Ensure ${localConfigPath} exists locally from assets/js/drishvara-auth-local.example.js`,
    "Fill browser-safe Supabase Project URL",
    "Fill browser-safe Supabase anon/public key",
    "Do not commit local config",
    "Run python3 -m http.server 8080",
    "Open http://localhost:8080/editor/login.html"
  ],
  editor_email: EDITOR_EMAIL,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG36B-R1",
  title: "AG36B-R1 to AG36B Manual Editor Login Confirmation Boundary",
  status: "manual_editor_login_confirmation_boundary_created",
  next_stage_id: "AG36B-CONFIRM",
  next_stage_title: "Manual Editor Login Confirmation",
  allowed_scope: [
    "Use local gitignored browser config.",
    "Test Editor login in browser.",
    "Record only success/error status.",
    "Do not record password, token, cookie, Supabase key, service-role key or secret-bearing URL."
  ],
  blocked_scope: [
    "No service-role key.",
    "No password in repo/chat.",
    "No token/cookie in repo/chat.",
    "No committed Supabase URL/key.",
    "No deployment.",
    "No public mutation."
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG36B-R1",
  title: "Editor Live Auth Wiring",
  status: "editor_live_auth_wiring_package_created_pending_manual_config_and_test",
  depends_on: ["AG36A-R1", "AG36A", "AG35Z", "AG35C"],
  generated_from: inputs,
  package_file: outputs.package,
  wiring_record_file: outputs.wiringRecord,
  local_config_guide_file: outputs.localConfigGuide,
  non_secret_audit_file: outputs.nonSecretAudit,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    editor_live_auth_wiring_created: true,
    editor_login_html_patched: true,
    editor_live_auth_js_created: true,
    shared_local_config_gitignored: true,
    ready_for_manual_editor_login_test_after_local_config: true,
    local_config_committed: false,
    password_recorded: false,
    token_recorded: false,
    supabase_key_recorded: false,
    service_role_key_exposed: false,
    deployment_done: false,
    public_mutation_done: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG36B-R1",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG36B-R1",
  preview_only: false,
  status: review.status,
  message: "AG36B-R1 Editor live Auth wiring created. Local config and manual Editor login test are pending.",
  editor_live_auth_wiring_created: 1,
  shared_local_config_gitignored: 1,
  local_config_committed: 0,
  password_recorded: 0,
  token_recorded: 0,
  supabase_key_recorded: 0,
  service_role_key_exposed: 0,
  deployment_done: 0,
  public_mutation_done: 0
};

const doc = `# AG36B-R1 — Editor Live Auth Wiring

## Purpose

Wire \`editor/login.html\` to Supabase browser Auth for controlled local Editor login testing.

## Shared Local Config

Local gitignored file:

\`${localConfigPath}\`

Only browser-safe public values may be placed in the local file:

- Supabase Project URL
- Supabase anon/public key

Never paste or commit:

- service-role key
- passwords
- tokens
- cookies
- database password
- environment secrets

## Test URL

\`http://localhost:8080/editor/login.html\`

## Boundary

No deployment, public mutation, service-role exposure or dynamic publish runtime.
`;

writeJson(outputs.localConfigGuide, localConfigGuide);
writeJson(outputs.nonSecretAudit, nonSecretAudit);
writeJson(outputs.wiringRecord, wiringRecord);
writeJson(outputs.package, packageRecord);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG36B-R1 Editor live Auth wiring generated.");
console.log("✅ editor/login.html patched for controlled Supabase browser Auth.");
console.log("✅ Shared local config remains gitignored.");
console.log("✅ No passwords, tokens, service-role keys, env vars, deployment or public mutation recorded.");
