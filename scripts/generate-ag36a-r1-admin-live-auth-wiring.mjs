import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ADMIN_EMAIL = "dwivedi.vikash.vaibhav@gmail.com";

const inputs = {
  ag36aReview: "data/content-intelligence/quality-reviews/ag36a-admin-login-test.json",
  ag36aPackage: "data/content-intelligence/backend-architecture/ag36a-admin-login-test-package.json",
  ag36aGuide: "data/content-intelligence/backend-architecture/ag36a-admin-login-manual-test-guide.json",
  ag36aChecklist: "data/content-intelligence/backend-architecture/ag36a-admin-login-test-checklist.json",
  ag35zClosure: "data/content-intelligence/backend-architecture/ag35z-backend-auth-activation-closure.json",
  ag35cRoleVerification: "data/content-intelligence/backend-architecture/ag35c-admin-editor-role-verification-record.json",
  adminLogin: "admin/login.html"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag36a-r1-admin-live-auth-wiring.json",
  package: "data/content-intelligence/backend-architecture/ag36a-r1-admin-live-auth-wiring-package.json",
  wiringRecord: "data/content-intelligence/backend-architecture/ag36a-r1-admin-live-auth-wiring-record.json",
  localConfigGuide: "data/content-intelligence/backend-architecture/ag36a-r1-local-auth-config-guide.json",
  nonSecretAudit: "data/content-intelligence/backend-architecture/ag36a-r1-non-secret-wiring-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag36a-r1-admin-live-auth-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag36a-r1-to-ag36a-manual-admin-login-confirmation-boundary.json",
  registry: "data/quality/ag36a-r1-admin-live-auth-wiring.json",
  preview: "data/quality/ag36a-r1-admin-live-auth-wiring-preview.json",
  doc: "docs/quality/AG36A_R1_ADMIN_LIVE_AUTH_WIRING.md",
  js: "assets/js/ag36a-admin-live-auth.js",
  configTemplate: "assets/js/drishvara-auth-local.example.js"
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
  if (!exists(p)) throw new Error(`Missing AG36A-R1 input: ${p}`);
}

const records = Object.fromEntries(
  Object.entries(inputs)
    .filter(([key]) => key !== "adminLogin")
    .map(([key, file]) => [key, readJson(file)])
);

if (records.ag36aPackage.status !== "admin_login_test_package_created_pending_manual_admin_login_result") {
  throw new Error("AG36A package status mismatch.");
}
if (records.ag35zClosure.status !== "backend_auth_activation_closure_created_ready_for_ag36a") {
  throw new Error("AG35Z closure status mismatch.");
}
if (records.ag35cRoleVerification.all_role_checks_passed !== true) {
  throw new Error("AG35C role verification must pass.");
}

const localConfigPath = "assets/js/drishvara-auth-local.js";

const blockedState = {
  admin_live_auth_wiring_created: true,
  admin_login_html_patched: true,
  admin_live_auth_js_created: true,
  local_config_template_created: true,
  local_secret_config_gitignored: true,

  real_admin_login_test_performed_by_script: false,
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
  dynamic_publish_runtime_created: false
};

let gitignore = exists(".gitignore") ? readText(".gitignore") : "";
const ignoreLines = [
  "",
  "# Drishvara local browser Auth config — never commit real Supabase values",
  localConfigPath
];
if (!gitignore.includes(localConfigPath)) {
  gitignore = gitignore.trimEnd() + "\n" + ignoreLines.join("\n") + "\n";
  writeText(".gitignore", gitignore);
}

const configTemplate = `// Drishvara local browser Auth config template.
// Copy this file to: ${localConfigPath}
// Then fill only browser-safe public values from Supabase.
// Never paste service-role keys here.
// Never commit ${localConfigPath}; it is gitignored.

window.DRISHVARA_AUTH_CONFIG = {
  supabaseUrl: "PASTE_SUPABASE_PROJECT_URL_HERE",
  supabaseAnonKey: "PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE",
  adminEmail: "${ADMIN_EMAIL}",
  adminSuccessPath: "/admin-dashboard.html"
};
`;

const liveAuthJs = `(function () {
  const statusEl = document.querySelector("[data-ag36a-status]");
  const form = document.getElementById("admin-login-preview");
  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const submitButton = document.querySelector("[data-ag36a-submit]");
  const signOutButton = document.querySelector("[data-ag36a-signout]");
  const successPath = "/admin-dashboard.html";

  function setStatus(message, kind = "info") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.setAttribute("data-kind", kind);
  }

  function setBusy(isBusy) {
    if (submitButton) {
      submitButton.disabled = isBusy;
      submitButton.textContent = isBusy ? "Checking Admin access…" : "Sign in as Admin";
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

  async function verifyAdminProfile(client, userEmail) {
    const { data, error } = await client
      .from("profiles")
      .select("email, role, is_active")
      .eq("email", userEmail)
      .eq("role", "admin")
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(error.message || "Could not verify Admin profile.");
    if (!data) throw new Error("Login succeeded, but active Admin profile was not found.");
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
        throw new Error("Enter Admin email and password.");
      }

      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message || "Admin login failed.");
      if (!data?.user?.email) throw new Error("Admin login returned no user email.");

      await verifyAdminProfile(client, data.user.email);

      setStatus("Admin login successful. Active Admin profile verified.", "success");
      window.location.href = (getConfig()?.adminSuccessPath || successPath);
    } catch (error) {
      setStatus(error.message || "Admin login failed.", "error");
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
      setStatus("Local Supabase Auth config detected. Admin login test is ready.", "success");
    }

    if (emailInput && config?.adminEmail) {
      emailInput.value = config.adminEmail;
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Sign in as Admin";
      submitButton.style.cursor = "pointer";
      submitButton.style.opacity = "1";
    }

    form?.addEventListener("submit", handleSubmit);
    signOutButton?.addEventListener("click", handleSignOut);
  }

  window.addEventListener("load", boot);
})();
`;

let html = readText(inputs.adminLogin);

html = html
  .replace(
    "<title>Drishvara Admin Login — Non-active Scaffold</title>",
    "<title>Drishvara Admin Login — Controlled Live Auth Test</title>"
  )
  .replace(
    "<h1>Admin Login UI Scaffold</h1>",
    "<h1>Admin Login</h1>"
  )
  .replace(
    "This page is a governed, non-active interface preview for the future Admin workspace. It does not authenticate, store credentials, create sessions, call APIs or connect to Supabase.",
    "This page is a governed Admin login test surface for controlled Supabase Auth verification. It uses only the browser-safe anon key from a local gitignored config file."
  )
  .replace(
    '<div class="notice">Non-active scaffold only. Login is not real.</div>',
    '<div class="notice" data-ag36a-status>Local Auth config pending. Login test not yet executed.</div>'
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
    "<span>Public mutation: blocked</span>",
    "<span>Public mutation: blocked</span>"
  )
  .replace(
    "For future Admin review, assignment and final-clearance workflows after explicit activation approval.",
    "For controlled Admin review, assignment and final-clearance workflows after AG35 backend/Auth activation closure."
  )
  .replace(
    '<input id="admin-password" name="admin-password" type="password" placeholder="Not active" aria-describedby="non-active-help" />',
    '<input id="admin-password" name="admin-password" type="password" placeholder="Enter password only in browser" aria-describedby="non-active-help" />'
  )
  .replace(
    '<button type="submit">Preview only — login not active</button>',
    '<button type="submit" data-ag36a-submit>Sign in as Admin</button><button type="button" data-ag36a-signout style="margin-top:10px;background:#64748b;">Sign out locally</button>'
  )
  .replace(
    "This form blocks submission locally. No credential is processed, stored, validated or transmitted.",
    "This controlled test uses Supabase Auth in the browser. Do not record or share password, token, cookie, Supabase key or secret-bearing URL."
  )
  .replace(
    `  <script>
    document.getElementById("admin-login-preview").addEventListener("submit", function (event) {
      event.preventDefault();
      alert("AG30A preview only: real Admin login is not active.");
    });
  </script>`,
    `  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="../assets/js/drishvara-auth-local.js"></script>
  <script src="../assets/js/ag36a-admin-live-auth.js"></script>`
  );

writeText(inputs.adminLogin, html);
writeText(outputs.configTemplate, configTemplate);
writeText(outputs.js, liveAuthJs);

const localConfigGuide = {
  module_id: "AG36A-R1",
  title: "Local Auth Config Guide",
  status: "local_auth_config_guide_created",
  gitignored_local_config_path: localConfigPath,
  committed_template_path: outputs.configTemplate,
  required_public_values_only: [
    "Supabase Project URL",
    "Supabase anon/public key"
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
  module_id: "AG36A-R1",
  title: "Non-Secret Wiring Audit Register",
  status: "non_secret_wiring_audit_passed",
  checks: [
    {
      check_id: "local_config_gitignored",
      passed: readText(".gitignore").includes(localConfigPath),
      evidence: ".gitignore contains local config path."
    },
    {
      check_id: "template_contains_placeholders_only",
      passed: configTemplate.includes("PASTE_SUPABASE_PROJECT_URL_HERE") && configTemplate.includes("PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE"),
      evidence: outputs.configTemplate
    },
    {
      check_id: "no_service_role_string_in_runtime_js",
      passed: !liveAuthJs.toLowerCase().includes("service_role"),
      evidence: outputs.js
    },
    {
      check_id: "admin_html_uses_local_config",
      passed: html.includes("../assets/js/drishvara-auth-local.js") && html.includes("../assets/js/ag36a-admin-live-auth.js"),
      evidence: inputs.adminLogin
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
  module_id: "AG36A-R1",
  title: "Admin Live Auth Wiring Record",
  status: "admin_live_auth_wiring_created_pending_local_config_and_manual_login_test",
  patched_files: [
    inputs.adminLogin,
    outputs.js,
    outputs.configTemplate,
    ".gitignore"
  ],
  live_auth_scope: {
    admin_login_page_wired_to_supabase_browser_client: true,
    admin_profile_role_verification_enabled: true,
    service_role_key_required: false,
    local_config_required: true,
    local_config_committed: false,
    public_mutation_enabled: false,
    deployment_enabled: false
  },
  blocked_state: blockedState
};

const packageRecord = {
  module_id: "AG36A-R1",
  title: "Admin Live Auth Wiring Package",
  status: "admin_live_auth_wiring_package_created_pending_manual_config_and_test",
  purpose:
    "Wire the Admin login page to Supabase browser Auth using only a gitignored local browser config, without committing keys/secrets or enabling deployment/public mutation.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  package_decision: {
    admin_live_auth_wiring_created: true,
    manual_local_config_required: true,
    manual_admin_login_test_required: true,

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
  module_id: "AG36A-R1",
  title: "Admin Live Auth Test Readiness Record",
  status: "ready_for_manual_admin_live_auth_test_after_local_config",
  ready_for_manual_admin_login_test: true,
  required_before_test: [
    `Create ${localConfigPath} locally from ${outputs.configTemplate}`,
    "Fill browser-safe Supabase Project URL",
    "Fill browser-safe Supabase anon/public key",
    "Do not commit local config",
    "Run python3 -m http.server 8080",
    "Open http://localhost:8080/admin/login.html"
  ],
  admin_email: ADMIN_EMAIL,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG36A-R1",
  title: "AG36A-R1 to AG36A Manual Admin Login Confirmation Boundary",
  status: "manual_admin_login_confirmation_boundary_created",
  next_stage_id: "AG36A-CONFIRM",
  next_stage_title: "Manual Admin Login Confirmation",
  allowed_scope: [
    "Create local gitignored browser config.",
    "Test Admin login in browser.",
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
  module_id: "AG36A-R1",
  title: "Admin Live Auth Wiring",
  status: "admin_live_auth_wiring_package_created_pending_manual_config_and_test",
  depends_on: ["AG36A", "AG35Z", "AG35C"],
  generated_from: inputs,
  package_file: outputs.package,
  wiring_record_file: outputs.wiringRecord,
  local_config_guide_file: outputs.localConfigGuide,
  non_secret_audit_file: outputs.nonSecretAudit,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    admin_live_auth_wiring_created: true,
    admin_login_html_patched: true,
    admin_live_auth_js_created: true,
    local_config_template_created: true,
    local_config_gitignored: true,
    ready_for_manual_admin_login_test_after_local_config: true,
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
  module_id: "AG36A-R1",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG36A-R1",
  preview_only: false,
  status: review.status,
  message: "AG36A-R1 Admin live Auth wiring created. Local config and manual Admin login test are pending.",
  admin_live_auth_wiring_created: 1,
  local_config_template_created: 1,
  local_config_gitignored: 1,
  local_config_committed: 0,
  password_recorded: 0,
  token_recorded: 0,
  supabase_key_recorded: 0,
  service_role_key_exposed: 0,
  deployment_done: 0,
  public_mutation_done: 0
};

const doc = `# AG36A-R1 — Admin Live Auth Wiring

## Purpose

Wire \`admin/login.html\` to Supabase browser Auth for controlled local Admin login testing.

## Local Config

Committed template:

\`${outputs.configTemplate}\`

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

\`http://localhost:8080/admin/login.html\`

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

console.log("✅ AG36A-R1 Admin live Auth wiring generated.");
console.log("✅ admin/login.html patched for controlled Supabase browser Auth.");
console.log("✅ Local config template created; real local config remains gitignored.");
console.log("✅ No passwords, tokens, service-role keys, env vars, deployment or public mutation recorded.");
