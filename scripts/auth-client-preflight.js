import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function readJson(file) {
  return JSON.parse(read(file));
}

function check(condition, label, failures) {
  if (condition) {
    console.log(`✅ ${label}`);
  } else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

const failures = [];

console.log("Drishvara Auth client scaffold preflight");
console.log("");

const loginPath = "login.html";
const clientPath = "assets/js/auth-client.js";
const registryPath = "data/backend/activation/supabase-auth-stage-02b.json";
const planPath = "docs/activation/supabase-auth-client-scaffold-plan.md";
const stage02aPath = "data/backend/activation/supabase-auth-stage-02a.json";

check(exists(loginPath), "Login page exists", failures);
check(exists(clientPath), "Auth client scaffold exists", failures);
check(exists(registryPath), "Stage 02B registry exists", failures);
check(exists(planPath), "Auth client scaffold plan exists", failures);
check(exists(stage02aPath), "Stage 02A registry exists", failures);

const login = read(loginPath);
const client = read(clientPath);
const registry = readJson(registryPath);
const stage02a = readJson(stage02aPath);

check(login.includes("Auth integration pending"), "Login page shows pending Auth state", failures);
check(login.includes('meta name="robots" content="noindex, nofollow"'), "Login page is noindex while scaffold", failures);
check(login.includes("auth-client.js"), "Login page loads auth-client scaffold", failures);
check(login.includes("data-auth-nav-submissions"), "Login page has Hindi-aware nav hooks", failures);
check(login.includes("data-auth-title"), "Login page has translatable title hook", failures);
check(login.includes("data-auth-footer"), "Login page has translatable footer hook", failures);
check(login.includes("disabled"), "Login page has disabled inputs/buttons", failures);
check(login.includes("Send magic link / OTP"), "Login page shows future OTP/magic-link language", failures);

check(client.includes("LIVE_AUTH_ENABLED = false"), "Auth client keeps live Auth disabled", failures);
check(client.includes("SUPABASE_CLIENT_ENABLED = false"), "Auth client keeps Supabase client disabled", failures);
check(client.includes("SESSION_DETECTION_ENABLED = false"), "Auth client keeps session detection disabled", failures);
check(client.includes("DASHBOARD_GATE_ENABLED = false"), "Auth client keeps dashboard gate disabled", failures);
check(client.includes("PREMIUM_GUIDANCE_ENABLED = false"), "Auth client keeps premium guidance disabled", failures);
check(client.includes("window.DrishvaraAuth"), "Auth client exposes scaffold state", failures);
check(client.includes("प्रस्तुतियाँ"), "Auth client includes Hindi submissions copy", failures);
check(client.includes("दृश्वरा लॉगिन"), "Auth client includes Hindi login title", failures);
check(client.includes("प्रमाणीकरण एकीकरण लंबित"), "Auth client includes Hindi pending Auth copy", failures);
check(client.includes("drishvara:languagechange"), "Auth client responds to language changes", failures);

check(!client.includes("createClient("), "Auth client does not instantiate Supabase", failures);
check(!client.includes("@supabase"), "Auth client does not import Supabase package", failures);
check(!client.includes("signInWithOtp"), "Auth client does not call signInWithOtp", failures);
check(!client.includes("getSession"), "Auth client does not call getSession", failures);
check(!client.includes("supabase.auth"), "Auth client does not call supabase.auth", failures);
check(!client.includes("SERVICE_ROLE"), "Auth client does not expose SERVICE_ROLE", failures);
check(!client.includes("SUPABASE_SERVICE"), "Auth client does not expose SUPABASE_SERVICE", failures);
check(!client.includes("service_role"), "Auth client does not expose service_role", failures);

check(registry.status === "scaffold_only", "Stage 02B registry is scaffold-only", failures);
check(registry.live_auth_enabled === false, "Stage 02B keeps live Auth disabled", failures);
check(registry.supabase_client_enabled === false, "Stage 02B keeps Supabase client disabled", failures);
check(registry.session_detection_enabled === false, "Stage 02B keeps session detection disabled", failures);
check(registry.dashboard_gate_enabled === false, "Stage 02B keeps dashboard gate disabled", failures);
check(registry.blocked_in_this_stage.includes("supabase_create_client"), "Stage 02B blocks Supabase create client", failures);
check(registry.blocked_in_this_stage.includes("live_magic_link"), "Stage 02B blocks live magic link", failures);
check(registry.blocked_in_this_stage.includes("session_detection"), "Stage 02B blocks session detection", failures);
check(registry.blocked_in_this_stage.includes("subscriber_guidance_display"), "Stage 02B blocks subscriber guidance display", failures);

check(stage02a.live_auth_enabled === false, "Stage 02A still keeps live Auth disabled", failures);

console.log("");
console.log("Auth client scaffold summary:");
console.log("- Login page: scaffolded");
console.log("- Supabase client: not instantiated");
console.log("- Live Auth: disabled");
console.log("- Session detection: disabled");
console.log("- Premium guidance/dashboard data: blocked");

if (failures.length) {
  console.log("");
  console.log("Auth client scaffold preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Auth client scaffold preflight passed.");
