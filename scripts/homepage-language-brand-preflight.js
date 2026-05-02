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

console.log("Drishvara homepage language brand H02 preflight");
console.log("");

const files = [
  "assets/js/homepage-language-runtime-hotfix.js",
  "data/ui/hotfix/homepage-language-runtime-h01.json",
  "data/ui/hotfix/homepage-language-brand-h02.json",
  "docs/ui/homepage-language-brand-hotfix-h02.md",
  "scripts/homepage-language-brand-preflight.js",
  "index.html"
];

for (const file of files) check(exists(file), `${file} exists`);

const runtime = read("assets/js/homepage-language-runtime-hotfix.js");
const registry = json("data/ui/hotfix/homepage-language-brand-h02.json");
const indexHtml = read("index.html");

check(registry.status === "runtime_hotfix_enabled", "H02 registry marks runtime hotfix enabled");
check(registry.brand_canonicalization_enabled === true, "Brand canonicalization enabled");
check(registry.canonical_brand.en === "Drishvara", "English brand is Drishvara");
check(registry.canonical_brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");
check(registry.canonical_brand.blocked_hi_forms.includes("दृशर"), "Incorrect Hindi brand form is blocked");
check(registry.english_reset_stabilization_enabled === true, "English reset stabilization enabled");
check(registry.daily_module_dynamic_engine_enabled === false, "Daily dynamic engine remains disabled");
check(registry.supabase_enabled === false, "Supabase remains disabled");
check(registry.auth_enabled === false, "Auth remains disabled");
check(registry.payment_enabled === false, "Payment remains disabled");
check(registry.premium_guidance_enabled === false, "Premium guidance remains disabled");

check(indexHtml.includes("assets/js/homepage-language-runtime-hotfix.js"), "index.html still loads homepage runtime hotfix");
check(runtime.includes("2026.05.02-h02"), "Runtime version updated to H02");
check(runtime.includes('const BRAND_HI = "द्रिश्वारा"'), "Runtime uses canonical Hindi brand");
check(runtime.includes("BAD_BRAND_HI"), "Runtime blocks bad Hindi brand forms");
check(runtime.includes("canonicalizeBrand"), "Runtime includes brand canonicalizer");
check(runtime.includes("additionalHiToEn"), "Runtime includes Hindi-to-English reset helpers");
check(runtime.includes("MutationObserver"), "Runtime observes dynamic text changes");
check(runtime.includes("drishvara:language-change"), "Runtime listens for language change event");
check(runtime.includes("static_scaffold_audited"), "Runtime keeps daily modules scaffold-audited");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase client");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

console.log("");
console.log("Homepage language brand H02 summary:");
console.log("- Brand Hindi canonical: द्रिश्वारा");
console.log("- Bad brand form blocked: दृशर");
console.log("- Homepage EN/HI reset stabilization: enabled");
console.log("- Vedic/Panchang engine: still scaffold/static");

if (failures.length) {
  console.log("");
  console.log("Homepage language brand H02 preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Homepage language brand H02 preflight passed.");
