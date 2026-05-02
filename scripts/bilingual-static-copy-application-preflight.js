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

console.log("Drishvara H07 bilingual static copy application preflight");
console.log("");

const h06File = "data/i18n/static-page-copy-h06.json";
const h07File = "data/i18n/apply-static-page-copy-h07.json";
const runtimeFile = "assets/js/drishvara-language-runtime.js";
const docFile = "docs/i18n/apply-bilingual-static-page-copy-h07.md";
const applyScriptFile = "scripts/apply-bilingual-static-page-copy.js";

for (const file of [h06File, h07File, runtimeFile, docFile, applyScriptFile]) {
  check(exists(file), `${file} exists`);
}

const h06 = json(h06File);
const h07 = json(h07File);
const runtime = read(runtimeFile);
const doc = read(docFile);

check(h07.status === "applied_to_unified_runtime_dictionary", "H07 registry marks dictionary application");
check(h07.runtime_logic_change_enabled === false, "H07 does not alter runtime logic");
check(h07.dictionary_expansion_enabled === true, "H07 enables dictionary expansion only");
check(h07.external_api_fetch_enabled === false, "H07 blocks external API fetch");
check(h07.supabase_enabled === false, "H07 keeps Supabase disabled");
check(h07.auth_enabled === false, "H07 keeps Auth disabled");
check(h07.payment_enabled === false, "H07 keeps payment disabled");
check(h07.premium_guidance_enabled === false, "H07 keeps premium guidance disabled");
check(h07.admin_actions_enabled === false, "H07 keeps admin actions disabled");
check(h07.article_body_auto_translation_enabled === false, "H07 blocks article body auto-translation");

check(h07.brand.en === "Drishvara", "English brand is Drishvara");
check(h07.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");
check(
  runtime.includes('const BRAND_HI = "द्रिश्वारा"') &&
    !runtime.includes('"Drishvara": "दृशर"') &&
    !runtime.includes('"Drishvara": "द्रिश्वर"') &&
    !runtime.includes('"Drishvara": "द्रिष्वरा"'),
  "Runtime does not use wrong Hindi brand as canonical translation"
);

const pages = ["about", "contact", "submissions", "dashboard", "article_reader"];
for (const page of pages) {
  check(Boolean(h06.pages?.[page]), `${page} exists in H06 registry`);
}

const items = Object.values(h06.pages || {}).flatMap((page) => page.items || []);
check(items.length >= 20, "H06 has sufficient approved static copy items");
check(items.every((item) => item.en && item.hi), "Every H06 item has English and Hindi");

for (const item of items) {
  check(runtime.includes(JSON.stringify(item.en).slice(1, -1)) || runtime.includes(item.en), `Runtime includes English copy: ${item.key}`);
  check(runtime.includes(item.hi), `Runtime includes Hindi copy: ${item.key}`);
}

check(runtime.includes("2026.05.02-h05"), "H05/H05B runtime baseline remains current");
check(runtime.includes("const dictionary = {"), "Runtime dictionary exists");
check(runtime.includes("reverseDictionary"), "Runtime still supports English reset");
check(runtime.includes("MutationObserver"), "Runtime still handles dynamic rendering");
check(runtime.includes("findLanguageToggleTarget"), "Runtime keeps H05B click-target support");

check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase client");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

check(doc.includes("does not change the language toggle mechanism"), "Doc protects language toggle mechanism");
check(doc.includes("Hindi article bodies will be shown only when approved Hindi sidecar content exists"), "Doc protects article body policy");

console.log("");
console.log("H07 bilingual static copy application summary:");
console.log(`- Approved copy items checked: ${items.length}`);
console.log("- Runtime logic: unchanged");
console.log("- Runtime dictionary: expanded");
console.log("- Article body auto-translation: disabled");
console.log("- Supabase/Auth/payment/premium/admin: disabled");

if (failures.length) {
  console.log("");
  console.log("H07 bilingual static copy application preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("H07 bilingual static copy application preflight passed.");
