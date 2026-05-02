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

console.log("Drishvara unified language runtime H04 preflight");
console.log("");

const registry = json("data/ui/hotfix/unified-language-runtime-reset-h04.json");
const runtime = read("assets/js/drishvara-language-runtime.js");

check(registry.status === "runtime_hotfix_enabled", "H04 registry enabled");
check(registry.new_runtime === "assets/js/drishvara-language-runtime.js", "New runtime recorded");
check(registry.single_language_key === "drishvara_language", "Single language key recorded");
check(registry.canonical_brand.hi === "द्रिश्वारा", "Canonical Hindi brand recorded");
check(registry.supabase_enabled === false, "Supabase remains disabled");
check(registry.auth_enabled === false, "Auth remains disabled");
check(registry.payment_enabled === false, "Payment remains disabled");
check(registry.premium_guidance_enabled === false, "Premium remains disabled");
check(registry.external_api_fetch_enabled === false, "External API fetch remains disabled");

check(exists("assets/js/drishvara-language-runtime.js"), "Unified runtime exists");
check(!exists("assets/js/homepage-language-runtime-hotfix.js"), "Old homepage runtime removed");
check(!exists("assets/js/language-state-guard.js"), "Old cross-page guard removed");

check(runtime.includes("2026.05.02-h04"), "Runtime version is H04");
check(runtime.includes('const LANG_KEY = "drishvara_language"'), "Runtime uses single language key");
check(runtime.includes('const BRAND_HI = "द्रिश्वारा"'), "Runtime locks Hindi brand");
check(runtime.includes("BAD_BRANDS"), "Runtime blocks bad brand forms");
check(runtime.includes("reverseDictionary"), "Runtime supports English reset");
check(runtime.includes("MutationObserver"), "Runtime handles dynamic rendering");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase client");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

for (const html of ["index.html", "about.html", "submissions.html", "dashboard.html", "contact.html", "insights.html", "login.html", "article.html"]) {
  if (!exists(html)) continue;
  const source = read(html);
  check(source.includes("assets/js/drishvara-language-runtime.js"), `${html} loads unified runtime`);
  check(!source.includes("assets/js/homepage-language-runtime-hotfix.js"), `${html} does not load old H01/H02 runtime`);
  check(!source.includes("assets/js/language-state-guard.js"), `${html} does not load old H03 runtime`);
}

console.log("");
console.log("Unified language runtime H04 summary:");
console.log("- One runtime: assets/js/drishvara-language-runtime.js");
console.log("- One language key: drishvara_language");
console.log("- Brand Hindi: द्रिश्वारा");
console.log("- Old H01/H02/H03 runtime files removed");
console.log("- Auth/Supabase/payment/premium/admin remain disabled");

if (failures.length) {
  console.log("");
  console.log("Unified language runtime H04 preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Unified language runtime H04 preflight passed.");
