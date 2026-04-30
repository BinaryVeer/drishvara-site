import fs from "node:fs";
import path from "node:path";

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

const failures = [];

console.log("Drishvara Supabase apply decision preflight");
console.log("");

const decisionSheet = "docs/activation/supabase-apply-decision-sheet.md";
const stepOrder = "docs/activation/supabase-sql-editor-step-order.md";
const registryPath = "data/backend/activation/supabase-activation-stage-01c.json";
const migrationPath = "supabase/migrations/20260430_b20a_subscriber_backend_schema.sql";
const validationPath = "supabase/validation/01_post_migration_validation.sql";
const stage01a = "data/backend/activation/supabase-activation-stage-01.json";
const stage01b = "data/backend/activation/supabase-activation-stage-01b.json";

check(exists(decisionSheet), "Apply decision sheet exists", failures);
check(exists(stepOrder), "SQL Editor step order exists", failures);
check(exists(registryPath), "Stage 01C registry exists", failures);
check(exists(migrationPath), "Migration file exists", failures);
check(exists(validationPath), "Validation SQL exists", failures);
check(exists(stage01a), "Stage 01A registry exists", failures);
check(exists(stage01b), "Stage 01B registry exists", failures);

const decision = read(decisionSheet);
const steps = read(stepOrder);
const registry = readJson(registryPath);
const reg01a = readJson(stage01a);
const reg01b = readJson(stage01b);

check(registry.status === "decision_pack_only", "Stage 01C is decision-pack-only", failures);
check(registry.live_apply_enabled === false, "Stage 01C live apply remains disabled", failures);
check(registry.guardrails?.some((item) => item.includes("does not apply")), "Registry says this stage does not apply migration", failures);
check(registry.guardrails?.some((item) => item.includes("manual explicit decision")), "Registry requires manual explicit decision", failures);

check(decision.includes("Go Criteria"), "Decision sheet has Go Criteria", failures);
check(decision.includes("No-Go Criteria"), "Decision sheet has No-Go Criteria", failures);
check(decision.includes("Decision: Pending"), "Decision sheet records pending decision", failures);
check(decision.includes("Do not apply if"), "Decision sheet includes no-apply guard", failures);
check(decision.includes("Service role key is not stored in repository"), "Decision sheet protects service role key", failures);

check(steps.includes("Step 0"), "Step order starts with local verification", failures);
check(steps.includes("Step 2"), "Step order includes migration apply step", failures);
check(steps.includes("Step 3"), "Step order includes validation SQL step", failures);
check(steps.includes("Step 5"), "Step order includes stop after database validation", failures);
check(steps.includes("Do not enable Auth yet"), "Step order blocks Auth activation", failures);
check(steps.includes("supabase/validation/01_post_migration_validation.sql"), "Step order references validation SQL", failures);

check(reg01a.live_apply_enabled === false, "Stage 01A still has live apply disabled", failures);
check(reg01b.live_apply_enabled === false, "Stage 01B still has live apply disabled", failures);

const publicJsFiles = [
  "assets/js/submission-client.js",
  "assets/js/site-language.js",
  "assets/js/timezone-context.js",
  "assets/js/sports-context.js",
  "assets/js/seo-runtime.js"
];

for (const file of publicJsFiles) {
  if (!exists(file)) continue;
  const js = read(file);
  check(!js.includes("SERVICE_ROLE"), `${file} does not expose SERVICE_ROLE`, failures);
  check(!js.includes("SUPABASE_SERVICE"), `${file} does not expose SUPABASE_SERVICE`, failures);
  check(!js.includes("service_role"), `${file} does not expose service_role`, failures);
}

console.log("");
console.log("Supabase apply decision summary:");
console.log("- Decision sheet: ready");
console.log("- SQL Editor step order: ready");
console.log("- Live apply: disabled in repo");
console.log("- Migration apply: manual explicit action only");
console.log("- Auth/payment/premium: blocked after database validation");

if (failures.length) {
  console.log("");
  console.log("Supabase apply decision preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Supabase apply decision preflight passed.");
