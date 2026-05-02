import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const json = (file) => JSON.parse(read(file));

const failures = [];
function check(condition, label) {
  if (condition) console.log(`✅ ${label}`);
  else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

console.log("Drishvara homepage language runtime H01 preflight");
console.log("");

const files = [
  "assets/js/homepage-language-runtime-hotfix.js",
  "docs/ui/homepage-language-runtime-hotfix-h01.md",
  "data/ui/hotfix/homepage-language-runtime-h01.json",
  "scripts/homepage-language-runtime-preflight.js",
  "index.html",
  "assets/js/site-language.js",
  "data/backend/activation/supabase-auth-stage-02f.json"
];

for (const file of files) check(exists(file), `${file} exists`);

const hotfix = read("assets/js/homepage-language-runtime-hotfix.js");
const indexHtml = read("index.html");
const registry = json("data/ui/hotfix/homepage-language-runtime-h01.json");
const stage02f = json("data/backend/activation/supabase-auth-stage-02f.json");

check(registry.status === "runtime_hotfix_enabled", "H01 registry marks runtime hotfix enabled", failures);
check(registry.homepage_language_runtime_enabled === true, "Homepage language runtime is enabled", failures);
check(registry.daily_module_dynamic_engine_enabled === false, "Daily dynamic engine remains disabled", failures);
check(registry.vedic_guidance_rule_engine_enabled === false, "Vedic guidance rule engine remains disabled", failures);
check(registry.panchang_festival_rule_engine_enabled === false, "Panchang/festival rule engine remains disabled", failures);
check(registry.external_api_fetch_enabled === false, "External API fetch remains disabled", failures);
check(registry.supabase_enabled === false, "Supabase remains disabled for H01", failures);
check(registry.auth_enabled === false, "Auth remains disabled for H01", failures);
check(registry.premium_guidance_enabled === false, "Premium guidance remains disabled", failures);

check(stage02f.status === "runbook_only", "Stage 02F remains runbook-only", failures);
check(stage02f.frontend_supabase_client_enabled === false, "Stage 02F keeps frontend Supabase client disabled", failures);
check(stage02f.known_parallel_ui_hotfix_needed.includes("homepage_language_toggle_runtime"), "Stage 02F recorded H01 need", failures);

check(indexHtml.includes("assets/js/homepage-language-runtime-hotfix.js"), "index.html loads H01 runtime script", failures);

check(hotfix.includes("MutationObserver"), "Runtime observes dynamic homepage sections", failures);
check(hotfix.includes("drishvara:language-change"), "Runtime listens for language change events", failures);
check(hotfix.includes("localStorage"), "Runtime syncs language storage", failures);
check(hotfix.includes("Today’s Vedic Guidance"), "Runtime includes Vedic guidance translation coverage", failures);
check(hotfix.includes("Location-based Panchang"), "Runtime includes Panchang translation coverage", failures);
check(hotfix.includes("Word of the Day"), "Runtime includes Word of the Day translation coverage", failures);
check(hotfix.includes("Featured Reads"), "Runtime includes Featured Reads translation coverage", failures);
check(hotfix.includes("static_scaffold_audited"), "Runtime marks daily modules as audited scaffold", failures);
check(!hotfix.includes("fetch("), "Runtime does not fetch external APIs", failures);
check(!hotfix.includes("createClient("), "Runtime does not instantiate Supabase client", failures);
check(!hotfix.includes("supabase.auth"), "Runtime does not call Supabase auth", failures);
check(!hotfix.includes("SERVICE_ROLE"), "Runtime does not expose service role text", failures);

for (const file of [
  "assets/js/auth-client.js",
  "assets/js/session-guard.js",
  "assets/js/submission-client.js",
  "assets/js/site-language.js",
  "assets/js/timezone-context.js",
  "assets/js/sports-context.js",
  "assets/js/seo-runtime.js"
]) {
  if (!exists(file)) continue;
  const source = read(file);
  check(!source.includes("SERVICE_ROLE"), `${file} does not expose SERVICE_ROLE`, failures);
  check(!source.includes("SUPABASE_SERVICE"), `${file} does not expose SUPABASE_SERVICE`, failures);
}

console.log("");
console.log("Homepage language runtime H01 summary:");
console.log("- Homepage language runtime: enabled");
console.log("- Daily Vedic/Panchang engine: still scaffold/static");
console.log("- External API fetch: disabled");
console.log("- Supabase/Auth/payment/premium/admin: disabled");

if (failures.length) {
  console.log("");
  console.log("Homepage language runtime H01 preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Homepage language runtime H01 preflight passed.");
