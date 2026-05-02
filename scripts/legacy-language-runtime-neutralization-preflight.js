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

console.log("Drishvara H05 legacy language runtime neutralization preflight");
console.log("");

const registry = json("data/ui/hotfix/legacy-language-runtime-neutralization-h05.json");
const runtime = read("assets/js/drishvara-language-runtime.js");
const shim = read("assets/js/site-language.js");

check(registry.status === "runtime_hotfix_enabled", "H05 registry enabled");
check(registry.active_runtime === "assets/js/drishvara-language-runtime.js", "Unified runtime is active");
check(registry.compatibility_shim === "assets/js/site-language.js", "site-language.js is compatibility shim");
check(registry.single_language_key === "drishvara_language", "Single language key recorded");
check(registry.brand.hi === "द्रिश्वारा", "Canonical Hindi brand recorded");
check(registry.brand.blocked.includes("दृशर"), "Wrong brand form दृशर blocked");
check(registry.supabase_enabled === false, "Supabase remains disabled");
check(registry.auth_enabled === false, "Auth remains disabled");
check(registry.payment_enabled === false, "Payment remains disabled");
check(registry.premium_guidance_enabled === false, "Premium remains disabled");
check(registry.external_api_fetch_enabled === false, "External API fetch remains disabled");

check(exists("assets/js/drishvara-language-runtime.js"), "Unified runtime exists");
check(exists("assets/js/site-language.js"), "site-language shim exists");
check(!exists("assets/js/homepage-language-runtime-hotfix.js"), "Old homepage runtime file removed");
check(!exists("assets/js/language-state-guard.js"), "Old cross-page guard file removed");

check(runtime.includes("2026.05.02-h05"), "Unified runtime is H05");
check(runtime.includes('const BRAND_HI = "द्रिश्वारा"'), "Runtime uses correct Hindi brand");
check(runtime.includes("BAD_BRANDS"), "Runtime blocks bad brand forms");
check(runtime.includes("event.stopImmediatePropagation()"), "Runtime stops competing toggle handlers");
check(runtime.includes("pageshow"), "Runtime reapplies on browser return");
check(runtime.includes("visibilitychange"), "Runtime reapplies on tab visibility return");
check(runtime.includes("ALIAS_KEYS"), "Runtime normalizes old language keys");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase client");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

check(shim.includes("2026.05.02-h05-shim"), "site-language is H05 shim");
check(shim.includes("compatibility"), "site-language is documented as shim");
check(!shim.includes("createClient("), "site-language shim does not instantiate Supabase");
check(!shim.includes("supabase.auth"), "site-language shim does not call Supabase auth");
check(!shim.includes("SERVICE_ROLE"), "site-language shim does not expose service role");

for (const old of [
  "scripts/homepage-language-runtime-preflight.js",
  "scripts/homepage-language-brand-preflight.js",
  "scripts/homepage-cross-page-language-guard-preflight.js"
]) {
  check(!exists(old), `${old} removed`);
}

for (const html of ["index.html", "about.html", "submissions.html", "dashboard.html", "contact.html", "insights.html", "login.html", "article.html"]) {
  if (!exists(html)) continue;
  const source = read(html);
  check(source.includes("assets/js/drishvara-language-runtime.js"), `${html} loads unified runtime`);
  check(!source.includes("assets/js/homepage-language-runtime-hotfix.js"), `${html} does not load old homepage runtime`);
  check(!source.includes("assets/js/language-state-guard.js"), `${html} does not load old language guard`);
}

console.log("");
console.log("H05 language runtime summary:");
console.log("- One translator: assets/js/drishvara-language-runtime.js");
console.log("- site-language.js: compatibility shim only");
console.log("- Hindi brand: द्रिश्वारा");
console.log("- Bad brand forms blocked");
console.log("- Auth/Supabase/payment/premium/admin remain disabled");

if (failures.length) {
  console.log("");
  console.log("H05 legacy language runtime neutralization preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("H05 legacy language runtime neutralization preflight passed.");
