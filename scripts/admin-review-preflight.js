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

console.log("Drishvara admin review panel preflight");
console.log("");

const pagePath = "admin.html";
const schemaPath = "data/backend/admin/admin-review-schema.json";
const planPath = "docs/admin-review-panel-plan.md";
const accessModelPath = "data/backend/auth-access-model.json";
const schemaRegistryPath = "data/backend/supabase-schema-registry.json";

check(fs.existsSync(path.join(root, pagePath)), "Admin page exists", failures);
check(fs.existsSync(path.join(root, schemaPath)), "Admin review schema exists", failures);
check(fs.existsSync(path.join(root, planPath)), "Admin review plan exists", failures);
check(fs.existsSync(path.join(root, accessModelPath)), "Auth access model exists", failures);
check(fs.existsSync(path.join(root, schemaRegistryPath)), "Supabase schema registry exists", failures);

const html = read(pagePath);
const schema = readJson(schemaPath);
const accessModel = readJson(accessModelPath);
const registry = readJson(schemaRegistryPath);

check(html.includes("Admin Review Panel"), "Admin page has title", failures);
check(html.includes("Admin auth/actions disabled"), "Admin page shows disabled status", failures);
check(html.includes('meta name="robots" content="noindex, nofollow"'), "Admin page is noindex", failures);
check(html.includes("User Submissions"), "Admin page includes user submissions queue", failures);
check(html.includes("Feedback"), "Admin page includes feedback queue", failures);
check(html.includes("Palmistry Requests"), "Admin page includes palmistry queue", failures);
check(html.includes("Hindi Article Drafts"), "Admin page includes Hindi drafts queue", failures);
check(html.includes("Knowledge Vault Monthly Updates"), "Admin page includes Knowledge Vault queue", failures);
check(html.includes("Subscriber Guidance Review"), "Admin page includes subscriber guidance queue", failures);
check(html.includes("Subscription Review"), "Admin page includes subscription queue", failures);
check(!html.includes("createClient("), "Admin page does not instantiate Supabase", failures);
check(!html.includes(".insert("), "Admin page does not perform inserts", failures);
check(!html.includes(".update("), "Admin page does not perform updates", failures);
check(!html.includes(".delete("), "Admin page does not perform deletes", failures);

check(schema.live_admin_enabled === false, "Schema keeps live admin disabled", failures);
check(schema.admin_backend_write_enabled === false, "Schema keeps admin backend write disabled", failures);
check(schema.admin_role_required === true, "Schema requires admin role in future", failures);
check(schema.review_queues?.some((item) => item.id === "user_submissions"), "Schema includes user submissions queue", failures);
check(schema.review_queues?.some((item) => item.id === "feedback_submissions"), "Schema includes feedback queue", failures);
check(schema.review_queues?.some((item) => item.id === "palmistry_requests"), "Schema includes palmistry queue", failures);
check(schema.review_queues?.some((item) => item.id === "hindi_body_drafts"), "Schema includes Hindi drafts queue", failures);
check(schema.review_queues?.some((item) => item.id === "knowledge_updates"), "Schema includes knowledge updates queue", failures);
check(schema.review_queues?.some((item) => item.id === "subscriber_guidance"), "Schema includes subscriber guidance queue", failures);
check(schema.review_queues?.some((item) => item.id === "subscriptions"), "Schema includes subscription queue", failures);
check(schema.review_queues?.every((item) => item.enabled_now === false), "All admin queues are disabled now", failures);
check(schema.guardrails?.some((item) => item.includes("Do not expose service role keys")), "Schema blocks service role exposure", failures);
check(schema.guardrails?.some((item) => item.includes("auditable")), "Schema requires auditable review actions", failures);

check(accessModel.roles?.admin_reviewer?.allowed?.includes("review_submissions"), "Access model defines admin reviewer submission review", failures);
check(registry.security?.service_role_required_for_admin_review === true, "Schema registry requires service role for admin review", failures);

console.log("");
console.log("Admin review summary:");
console.log("- Admin page: scaffolded");
console.log("- Live admin auth: disabled");
console.log("- Backend write: disabled");
console.log("- Review queues: scaffolded");
console.log("- Service role exposure: blocked");

if (failures.length) {
  console.log("");
  console.log("Admin review preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Admin review panel preflight passed.");
