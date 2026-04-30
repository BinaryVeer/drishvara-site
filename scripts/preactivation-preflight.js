import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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

function runNpm(script, failures) {
  const result = spawnSync("npm", ["run", script], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe"
  });

  check(result.status === 0, `npm run ${script} passes`, failures);

  if (result.status !== 0) {
    console.log(result.stdout || "");
    console.log(result.stderr || "");
  }
}

const failures = [];

console.log("Drishvara pre-activation audit");
console.log("");

const requiredDocs = [
  "docs/drishvara-system-inventory.md",
  "docs/final-activation-checklist.md",
  "docs/pre-activation-freeze-note.md",
  "docs/live-activation-checklist.md",
  "docs/supabase-backend-plan.md",
  "docs/auth-subscription-access-model.md",
  "docs/payment-subscription-plan.md",
  "docs/admin-review-panel-plan.md"
];

const requiredFiles = [
  "data/backend/activation/pre-activation-status-matrix.json",
  "data/backend/supabase-schema-registry.json",
  "data/backend/auth-access-model.json",
  "data/backend/subscriber-dashboard-schema.json",
  "data/backend/submission-intake-policy.json",
  "data/backend/mappings/submission-supabase-map.json",
  "data/backend/payments/subscription-plans.json",
  "data/backend/payments/subscription-lifecycle.json",
  "data/backend/payments/payment-provider-options.json",
  "data/backend/admin/admin-review-schema.json",
  "data/knowledge/sources/source-registry.json",
  "data/knowledge/sanatan/panchang-engine-schema.json",
  "data/knowledge/subscribers/daily-guidance-schema.json",
  "supabase/migrations/20260430_b20a_subscriber_backend_schema.sql",
  "robots.txt",
  "sitemap.xml",
  "data/system/timezone-config.json"
];

for (const file of requiredDocs) {
  check(exists(file), `${file} exists`, failures);
}

for (const file of requiredFiles) {
  check(exists(file), `${file} exists`, failures);
}

const matrix = readJson("data/backend/activation/pre-activation-status-matrix.json");
const accessModel = readJson("data/backend/auth-access-model.json");
const plans = readJson("data/backend/payments/subscription-plans.json");
const subscriberSchema = readJson("data/backend/subscriber-dashboard-schema.json");
const adminSchema = readJson("data/backend/admin/admin-review-schema.json");
const submissionPolicy = readJson("data/backend/submission-intake-policy.json");
const panchangSchema = readJson("data/knowledge/sanatan/panchang-engine-schema.json");
const guidanceSchema = readJson("data/knowledge/subscribers/daily-guidance-schema.json");
const palmPolicy = readJson("data/knowledge/palmistry/palm-image-policy.json");

check(matrix.status === "freeze_point", "Pre-activation matrix marks freeze point", failures);
check(matrix.blocked_until_final_activation?.some((item) => item.item === "Supabase database migration"), "Supabase migration is blocked until final activation", failures);
check(matrix.blocked_until_final_activation?.some((item) => item.item === "Payment provider"), "Payment provider is blocked until final activation", failures);
check(matrix.blocked_until_final_activation?.some((item) => item.item === "Palm image upload"), "Palm image upload is blocked until final activation", failures);
check(matrix.blocked_until_final_activation?.some((item) => item.item === "Public Panchang/Vedic guidance"), "Public Panchang/Vedic guidance is blocked", failures);
check(matrix.non_negotiable_guards?.some((item) => item.includes("service role key")), "Matrix blocks service role exposure", failures);

check(accessModel.live_auth_enabled === false, "Live auth remains disabled", failures);
check(accessModel.live_subscription_gate_enabled === false, "Live subscription gate remains disabled", failures);
check(plans.live_payment_enabled === false, "Live payment remains disabled", failures);
check(subscriberSchema.subscriber_dashboard_enabled === false, "Subscriber dashboard remains scaffold-disabled", failures);
check(adminSchema.live_admin_enabled === false, "Live admin remains disabled", failures);
check(adminSchema.admin_backend_write_enabled === false, "Admin backend write remains disabled", failures);
check(submissionPolicy.live_backend_write_enabled === false, "Submission backend write remains disabled", failures);
check(submissionPolicy.supabase_insert_enabled === false, "Submission Supabase insert remains disabled", failures);
check(panchangSchema.public_output_enabled === false, "Panchang public output remains disabled", failures);
check(guidanceSchema.public_output_enabled === false, "Subscriber guidance public output remains disabled", failures);
check(palmPolicy.public_upload_enabled === false, "Palm image public upload remains disabled", failures);

const migration = read("supabase/migrations/20260430_b20a_subscriber_backend_schema.sql");
check(migration.includes("enable row level security"), "Supabase migration includes RLS", failures);
check(migration.includes("auth.users"), "Supabase migration references auth.users", failures);

const publicJsFiles = [
  "assets/js/submission-client.js",
  "assets/js/sports-context.js",
  "assets/js/seo-runtime.js",
  "assets/js/site-language.js"
];

for (const file of publicJsFiles) {
  if (!exists(file)) continue;
  const js = read(file);
  check(!js.includes("SERVICE_ROLE"), `${file} does not contain SERVICE_ROLE`, failures);
  check(!js.includes("service_role"), `${file} does not contain service_role`, failures);
  check(!js.includes("SUPABASE_SERVICE"), `${file} does not contain SUPABASE_SERVICE`, failures);
}

const submissionClient = read("assets/js/submission-client.js");
check(submissionClient.includes("BACKEND_SUBMISSION_ENABLED = false"), "Submission client backend write disabled", failures);
check(submissionClient.includes("SUPABASE_INSERT_ENABLED = false"), "Submission client Supabase insert disabled", failures);
check(submissionClient.includes("PALM_IMAGE_UPLOAD_ENABLED = false"), "Submission client palm upload disabled", failures);

console.log("");
console.log("Running key preflights...");
runNpm("publish:local-check", failures);
runNpm("bilingual:preflight", failures);
runNpm("hindi-body:preflight", failures);
runNpm("knowledge:preflight", failures);
runNpm("panchang:preflight", failures);
runNpm("subscriber-guidance:preflight", failures);
runNpm("submission-intake:preflight", failures);
runNpm("supabase:schema:preflight", failures);
runNpm("auth-access:preflight", failures);
runNpm("dashboard:preflight", failures);
runNpm("payment:preflight", failures);
runNpm("admin-review:preflight", failures);
runNpm("seo:preflight", failures);
runNpm("timezone:preflight", failures);

console.log("");
console.log("Pre-activation summary:");
console.log("- Public site: ready for controlled public preview");
console.log("- Supabase/Auth/Payment: scaffolded, not live");
console.log("- Panchang/Vedic premium output: blocked");
console.log("- Palm image upload: blocked");
console.log("- Admin actions: blocked");
console.log("- Subscriber guidance: blocked until auth/subscription/approved rules");
console.log("- Final activation checklist: required before live services");

if (failures.length) {
  console.log("");
  console.log("Pre-activation audit failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Pre-activation audit passed.");
