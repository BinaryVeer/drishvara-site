import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

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

console.log("Drishvara auth/access preflight");
console.log("");

const modelPath = "data/backend/auth-access-model.json";
const docPath = "docs/auth-subscription-access-model.md";
const liveChecklistPath = "docs/live-activation-checklist.md";
const schemaRegistryPath = "data/backend/supabase-schema-registry.json";

check(fs.existsSync(path.join(root, modelPath)), "Auth access model exists", failures);
check(fs.existsSync(path.join(root, docPath)), "Auth access model document exists", failures);
check(fs.existsSync(path.join(root, liveChecklistPath)), "Live activation checklist exists", failures);
check(fs.existsSync(path.join(root, schemaRegistryPath)), "Supabase schema registry exists", failures);

const model = readJson(modelPath);
const registry = readJson(schemaRegistryPath);
const checklist = read(liveChecklistPath);

check(model.live_auth_enabled === false, "Live auth remains disabled", failures);
check(model.live_subscription_gate_enabled === false, "Live subscription gate remains disabled", failures);

check(Boolean(model.roles?.anonymous), "Anonymous role is defined", failures);
check(Boolean(model.roles?.free_registered), "Free registered role is defined", failures);
check(Boolean(model.roles?.subscriber), "Subscriber role is defined", failures);
check(Boolean(model.roles?.admin_reviewer), "Admin reviewer role is defined", failures);

check(model.roles?.anonymous?.blocked?.includes("subscriber_dashboard"), "Anonymous users cannot access subscriber dashboard", failures);
check(model.roles?.free_registered?.blocked?.includes("daily_personal_guidance"), "Free users cannot access premium daily guidance", failures);
check(model.roles?.subscriber?.allowed?.includes("subscriber_dashboard"), "Subscriber can access subscriber dashboard", failures);

check(model.premium_modules?.daily_guidance?.requires_login === true, "Daily guidance requires login", failures);
check(model.premium_modules?.daily_guidance?.requires_active_subscription === true, "Daily guidance requires active subscription", failures);
check(model.premium_modules?.daily_guidance?.requires_user_consent === true, "Daily guidance requires user consent", failures);
check(model.premium_modules?.daily_guidance?.requires_approved_rules === true, "Daily guidance requires approved rules", failures);

check(model.premium_modules?.palmistry?.live_upload_enabled === false, "Palm image upload remains disabled", failures);
check(model.premium_modules?.palmistry?.requires_private_storage === true, "Palmistry requires private storage", failures);
check(model.premium_modules?.palmistry?.requires_explicit_image_consent === true, "Palmistry requires explicit image consent", failures);

check(model.premium_modules?.panchang_guidance?.requires_reviewed_calculation_method === true, "Panchang guidance requires reviewed method", failures);
check(model.premium_modules?.panchang_guidance?.public_output_allowed === false, "Panchang guidance is not public output", failures);

check(registry.security?.rls_required === true, "Schema registry requires RLS", failures);
check(checklist.includes("supabase db push"), "Live checklist mentions Supabase DB push", failures);
check(checklist.includes("private Supabase Storage bucket"), "Live checklist includes private palm storage", failures);
check(checklist.includes("Do not enable subscriber guidance"), "Live checklist blocks premature premium guidance", failures);

console.log("");
console.log("Auth/access summary:");
console.log("- Live auth: disabled");
console.log("- Live subscription gate: disabled");
console.log("- Subscriber dashboard: planned");
console.log("- Palm image upload: blocked");
console.log("- Premium guidance: blocked until approved rules");

if (failures.length) {
  console.log("");
  console.log("Auth/access preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Auth/access preflight passed.");
