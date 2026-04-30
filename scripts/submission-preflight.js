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

console.log("Drishvara submission scaffold preflight");
console.log("");

check(fs.existsSync(path.join(root, "submissions.html")), "Submission page exists", failures);
check(fs.existsSync(path.join(root, "data/knowledge/submissions/intake-routing.json")), "Submission intake routing exists", failures);
check(fs.existsSync(path.join(root, "data/knowledge/submissions/user-submission-schema.json")), "User submission schema exists", failures);
check(fs.existsSync(path.join(root, "data/knowledge/submissions/feedback-schema.json")), "Feedback schema exists", failures);
check(fs.existsSync(path.join(root, "data/knowledge/palmistry/palm-image-policy.json")), "Palm image policy exists", failures);

const html = read("submissions.html");
const routing = readJson("data/knowledge/submissions/intake-routing.json");
const palmPolicy = readJson("data/knowledge/palmistry/palm-image-policy.json");

check(html.includes("Submit to Drishvara"), "Submission page has title", failures);
check(html.includes("Palm Image Upload"), "Submission page mentions palm image upload", failures);
check(html.includes("type=\"file\"") && html.includes("disabled"), "Palm file input is disabled", failures);
check(html.includes("consent"), "Submission page includes consent", failures);
check(html.includes("not_stored_backend_not_enabled"), "Submission page clearly marks backend storage as disabled", failures);
check(routing.public_collection_enabled === false, "Routing keeps public collection disabled", failures);
check(routing.backend_storage_enabled === false, "Routing keeps backend storage disabled", failures);
check(routing.routes?.palm_image?.target === "disabled_until_private_storage_and_consent", "Palm image route is disabled until consent/storage", failures);
check(palmPolicy.public_upload_enabled === false, "Palm image upload remains disabled by policy", failures);

console.log("");
console.log("Submission scaffold summary:");
console.log("- Backend storage: disabled");
console.log("- Palm image upload: disabled");
console.log("- Monthly review day: 10");
console.log("- Form mode: local preparation only");

if (failures.length) {
  console.log("");
  console.log("Submission preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Submission scaffold preflight passed.");
