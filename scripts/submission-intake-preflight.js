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

console.log("Drishvara backend-safe submission intake preflight");
console.log("");

const policyPath = "data/backend/submission-intake-policy.json";
const mapPath = "data/backend/mappings/submission-supabase-map.json";
const clientPath = "assets/js/submission-client.js";
const pagePath = "submissions.html";
const schemaRegistryPath = "data/backend/supabase-schema-registry.json";

check(fs.existsSync(path.join(root, policyPath)), "Submission intake policy exists", failures);
check(fs.existsSync(path.join(root, mapPath)), "Submission Supabase map exists", failures);
check(fs.existsSync(path.join(root, clientPath)), "Submission frontend client exists", failures);
check(fs.existsSync(path.join(root, pagePath)), "Submission page exists", failures);
check(fs.existsSync(path.join(root, schemaRegistryPath)), "Supabase schema registry exists", failures);

const policy = readJson(policyPath);
const mapping = readJson(mapPath);
const client = read(clientPath);
const page = read(pagePath);
const registry = readJson(schemaRegistryPath);

check(policy.live_backend_write_enabled === false, "Live backend write remains disabled", failures);
check(policy.anonymous_backend_write_enabled === false, "Anonymous backend write remains disabled", failures);
check(policy.supabase_insert_enabled === false, "Supabase insert remains disabled", failures);
check(policy.storage_mode === "local_prepare_only", "Storage mode is local prepare only", failures);
check(policy.blocked_current_actions?.includes("palm_image_upload"), "Palm image upload is blocked", failures);
check(policy.required_before_live_enablement?.includes("RLS tested with authenticated test user"), "Policy requires RLS test before live", failures);

check(mapping.live_insert_enabled === false, "Mapping is not live insert enabled", failures);
check(Boolean(mapping.routes?.user_submissions), "Mapping includes user_submissions route", failures);
check(Boolean(mapping.routes?.feedback_submissions), "Mapping includes feedback_submissions route", failures);
check(Boolean(mapping.routes?.palmistry_requests), "Mapping includes palmistry_requests route", failures);
check(mapping.routes?.palmistry_requests?.blocked_fields_until_later?.includes("image_storage_path"), "Palm image storage path is blocked in mapping", failures);

check(client.includes("BACKEND_SUBMISSION_ENABLED = false"), "Client keeps backend submission disabled", failures);
check(client.includes("SUPABASE_INSERT_ENABLED = false"), "Client keeps Supabase insert disabled", failures);
check(client.includes("PALM_IMAGE_UPLOAD_ENABLED = false"), "Client keeps palm image upload disabled", failures);
check(client.includes("window.DrishvaraSubmissionIntake"), "Client exposes safe intake helper", failures);
check(!client.includes("createClient("), "Client does not instantiate Supabase", failures);
check(!client.includes(".insert("), "Client does not perform Supabase insert", failures);

check(page.includes("submission-client.js"), "Submission page loads safe client", failures);
check(page.includes("submissionBackendStatus"), "Submission page shows backend status", failures);
check(page.includes("Backend intake: disabled"), "Submission page states backend intake disabled", failures);
check(page.includes("type=\"file\"") && page.includes("disabled"), "Palm file input remains disabled in page", failures);

check(registry.security?.anonymous_public_insert_enabled === false, "Schema registry blocks anonymous public insert", failures);

console.log("");
console.log("Submission intake summary:");
console.log("- Backend write: disabled");
console.log("- Supabase insert: disabled");
console.log("- Anonymous write: disabled");
console.log("- Palm image upload: disabled");
console.log("- Current mode: local packet preparation only");

if (failures.length) {
  console.log("");
  console.log("Submission intake preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Backend-safe submission intake preflight passed.");
