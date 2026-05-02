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

console.log("Drishvara unified language runtime H05 preflight");
console.log("");

const registryFile = "data/ui/hotfix/legacy-language-runtime-neutralization-h05.json";
const runtimeFile = "assets/js/drishvara-language-runtime.js";
const shimFile = "assets/js/site-language.js";

check(exists(registryFile), `${registryFile} exists`);
check(exists(runtimeFile), `${runtimeFile} exists`);
check(exists(shimFile), `${shimFile} exists`);

const registry = json(registryFile);
const runtime = read(runtimeFile);
const shim = read(shimFile);

check(registry.status === "runtime_hotfix_enabled", "H05 registry enabled");
check(registry.active_runtime === runtimeFile, "Unified runtime recorded as active");
check(registry.compatibility_shim === shimFile, "site-language shim recorded");
check(registry.single_language_key === "drishvara_language", "Single language key recorded");
check(registry.brand?.hi === "द्रिश्वारा", "Canonical Hindi brand recorded");
check(registry.supabase_enabled === false, "Supabase remains disabled");
check(registry.auth_enabled === false, "Auth remains disabled");
check(registry.payment_enabled === false, "Payment remains disabled");
check(registry.premium_guidance_enabled === false, "Premium remains disabled");
check(registry.external_api_fetch_enabled === false, "External API fetch remains disabled");

check(runtime.includes("2026.05.02-h05"), "Runtime version is H05");
check(runtime.includes('const LANG_KEY = "drishvara_language"'), "Runtime uses single language key");
check(runtime.includes('const BRAND_HI = "द्रिश्वारा"'), "Runtime locks Hindi brand");
check(runtime.includes("BAD_BRANDS"), "Runtime blocks bad brand forms");
check(runtime.includes("reverseDictionary"), "Runtime supports English reset");
check(runtime.includes("MutationObserver"), "Runtime handles dynamic rendering");
check(runtime.includes("pageshow"), "Runtime reapplies on browser return");
check(runtime.includes("visibilitychange"), "Runtime reapplies on tab visibility return");
check(runtime.includes("शुभ अंक"), "Runtime includes dashboard lucky number Hindi copy");
check(runtime.includes("शुभ रंग"), "Runtime includes dashboard lucky color Hindi copy");
check(runtime.includes("मंत्र"), "Runtime includes dashboard mantra Hindi copy");

check(shim.toLowerCase().includes("compatibility shim"), "site-language is documented as compatibility shim");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase client");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");
check(!shim.includes("createClient("), "Shim does not instantiate Supabase client");
check(!shim.includes("supabase.auth"), "Shim does not call Supabase auth");
check(!shim.includes("SERVICE_ROLE"), "Shim does not expose service role");

for (const html of ["index.html", "about.html", "submissions.html", "dashboard.html", "contact.html", "insights.html", "login.html", "article.html"]) {
  if (!exists(html)) continue;
  const source = read(html);
  check(source.includes("assets/js/drishvara-language-runtime.js"), `${html} loads unified runtime`);
  check(!source.includes("assets/js/homepage-language-runtime-hotfix.js"), `${html} does not load old homepage runtime`);
  check(!source.includes("assets/js/language-state-guard.js"), `${html} does not load old language guard`);
}

console.log("");
console.log("Unified language runtime H05 summary:");
console.log("- One runtime: assets/js/drishvara-language-runtime.js");
console.log("- One language key: drishvara_language");
console.log("- Brand Hindi: द्रिश्वारा");
console.log("- site-language.js: compatibility shim only");
console.log("- Auth/Supabase/payment/premium/admin remain disabled");

if (failures.length) {
  console.log("");
  console.log("Unified language runtime H05 preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Unified language runtime H05 preflight passed.");
