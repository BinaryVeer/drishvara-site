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

console.log("Drishvara H03 cross-page language guard preflight");
console.log("");

const required = [
  "assets/js/language-state-guard.js",
  "docs/ui/cross-page-language-state-guard-h03.md",
  "data/ui/hotfix/cross-page-language-state-guard-h03.json",
  "assets/js/homepage-language-runtime-hotfix.js",
  "index.html",
  "about.html",
  "submissions.html"
];

for (const file of required) check(exists(file), `${file} exists`);

const guard = read("assets/js/language-state-guard.js");
const registry = json("data/ui/hotfix/cross-page-language-state-guard-h03.json");

check(registry.status === "runtime_hotfix_enabled", "H03 registry is enabled");
check(registry.cross_page_language_guard_enabled === true, "Cross-page language guard enabled");
check(registry.brand_lock_enabled === true, "Brand lock enabled");
check(registry.language_key_normalization_enabled === true, "Language key normalization enabled");
check(registry.canonical_brand.en === "Drishvara", "English brand canonicalized");
check(registry.canonical_brand.hi === "द्रिश्वारा", "Hindi brand canonicalized");
check(registry.canonical_brand.blocked_hi_forms.includes("दृशर"), "Wrong brand form blocked");
check(registry.daily_module_dynamic_engine_enabled === false, "Daily dynamic engine remains disabled");
check(registry.supabase_enabled === false, "Supabase remains disabled");
check(registry.auth_enabled === false, "Auth remains disabled");
check(registry.payment_enabled === false, "Payment remains disabled");
check(registry.premium_guidance_enabled === false, "Premium remains disabled");

check(guard.includes("2026.05.02-h03"), "Guard version is H03");
check(guard.includes('const BRAND_HI = "द्रिश्वारा"'), "Guard uses correct Hindi brand");
check(guard.includes("BAD_BRAND_HI"), "Guard blocks bad brand forms");
check(guard.includes("languageKeys"), "Guard normalizes language keys");
check(guard.includes("DrishvaraHomepageLanguageHotfix"), "Guard coordinates homepage runtime");
check(guard.includes("Submit to Drishvara"), "Guard covers submissions page");
check(guard.includes("About Drishvara"), "Guard covers about page");
check(!guard.includes("fetch("), "Guard does not fetch external APIs");
check(!guard.includes("createClient("), "Guard does not instantiate Supabase client");
check(!guard.includes("supabase.auth"), "Guard does not call Supabase auth");
check(!guard.includes("SERVICE_ROLE"), "Guard does not expose service role");

for (const html of ["index.html", "about.html", "submissions.html", "dashboard.html", "contact.html", "insights.html"]) {
  if (!exists(html)) continue;
  check(read(html).includes("assets/js/language-state-guard.js"), `${html} loads global language guard`);
}

console.log("");
console.log("H03 cross-page language guard summary:");
console.log("- Brand Hindi canonical: द्रिश्वारा");
console.log("- Cross-page language state: guarded");
console.log("- About/Submissions basic map: enabled");
console.log("- Auth/Supabase/payment/premium/admin: disabled");

if (failures.length) {
  console.log("");
  console.log("H03 cross-page language guard preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("H03 cross-page language guard preflight passed.");
