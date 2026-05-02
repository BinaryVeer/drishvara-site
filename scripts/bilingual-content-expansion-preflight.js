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

console.log("Drishvara H06 bilingual content expansion preflight");
console.log("");

const registryFile = "data/i18n/static-page-copy-h06.json";
const docFile = "docs/i18n/bilingual-content-expansion-h06.md";
const runtimeFile = "assets/js/drishvara-language-runtime.js";
const sidecarFile = "data/i18n/hindi-article-body.json";

check(exists(registryFile), `${registryFile} exists`);
check(exists(docFile), `${docFile} exists`);
check(exists(runtimeFile), `${runtimeFile} exists`);
check(exists(sidecarFile), `${sidecarFile} exists`);

const registry = json(registryFile);
const runtime = read(runtimeFile);
const sidecar = json(sidecarFile);

check(registry.status === "content_registry_only", "H06 is content-registry-only");
check(registry.runtime_logic_change_enabled === false, "H06 does not alter runtime logic");
check(registry.external_api_fetch_enabled === false, "H06 blocks external API fetch");
check(registry.supabase_enabled === false, "H06 keeps Supabase disabled");
check(registry.auth_enabled === false, "H06 keeps Auth disabled");
check(registry.payment_enabled === false, "H06 keeps payment disabled");
check(registry.premium_guidance_enabled === false, "H06 keeps premium guidance disabled");
check(registry.admin_actions_enabled === false, "H06 keeps admin actions disabled");

check(registry.brand.en === "Drishvara", "English brand is Drishvara");
check(registry.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");

for (const page of ["about", "contact", "submissions", "dashboard", "article_reader"]) {
  check(Boolean(registry.pages?.[page]), `${page} copy registry exists`);
  check(Array.isArray(registry.pages?.[page]?.items), `${page} has copy items`);
  check(registry.pages?.[page]?.items?.length > 0, `${page} has at least one Hindi copy item`);
}

const allItems = Object.values(registry.pages).flatMap((page) => page.items || []);
check(allItems.every((item) => item.en && item.hi), "Every H06 copy item has English and Hindi");
check(allItems.some((item) => item.hi.includes("द्रिश्वारा")), "H06 copy uses canonical Hindi brand");
check(!JSON.stringify(registry).includes("दृशर"), "H06 copy does not use wrong Hindi brand form");

check(sidecar.status === "scaffold_only", "Hindi article body sidecar remains scaffold-only");
check(sidecar.article_body_translation_enabled === false, "Hindi article body translation remains disabled");
check(Array.isArray(sidecar.items), "Hindi article body sidecar has items array");

check(runtime.includes("2026.05.02-h05"), "H05 runtime remains current stable runtime");
check(runtime.includes("द्रिश्वारा"), "Runtime still contains canonical Hindi brand");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

for (const page of ["about.html", "contact.html", "submissions.html", "dashboard.html", "article.html"]) {
  check(exists(page), `${page} exists`);
}

console.log("");
console.log("H06 bilingual content expansion summary:");
console.log(`- Copy items registered: ${allItems.length}`);
console.log("- Runtime logic: unchanged");
console.log("- Hindi article body: sidecar scaffold only");
console.log("- Supabase/Auth/payment/premium/admin: disabled");

if (failures.length) {
  console.log("");
  console.log("H06 bilingual content expansion preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("H06 bilingual content expansion preflight passed.");
