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

console.log("Drishvara subscriber dashboard preflight");
console.log("");

const dashboardPath = "dashboard.html";
const schemaPath = "data/backend/subscriber-dashboard-schema.json";
const accessModelPath = "data/backend/auth-access-model.json";

check(fs.existsSync(path.join(root, dashboardPath)), "Dashboard page exists", failures);
check(fs.existsSync(path.join(root, schemaPath)), "Dashboard schema exists", failures);
check(fs.existsSync(path.join(root, accessModelPath)), "Auth access model exists", failures);

const html = read(dashboardPath);
const schema = readJson(schemaPath);
const accessModel = readJson(accessModelPath);

check(html.includes("Subscriber Dashboard"), "Dashboard has page title", failures);
check(html.includes("Login/subscription integration pending"), "Dashboard shows auth pending state", failures);
check(html.includes("Lucky Number"), "Dashboard includes lucky number card", failures);
check(html.includes("Lucky Color"), "Dashboard includes lucky color card", failures);
check(html.includes("Mantra"), "Dashboard includes mantra card", failures);
check(html.includes("Palm Image Upload") || html.includes("Palmistry request"), "Dashboard references palmistry safely", failures);
check(html.includes("No personal profile details are stored"), "Dashboard states no profile storage yet", failures);
check(html.includes('meta name="robots" content="noindex, nofollow"'), "Dashboard is noindex while scaffold", failures);

const languageJs = read("assets/js/site-language.js");
check(languageJs.includes("सब्सक्राइबर डैशबोर्ड"), "Dashboard Hindi UI copy exists", failures);
check(languageJs.includes("शुभ अंक"), "Dashboard lucky number Hindi copy exists", failures);
check(languageJs.includes("शुभ रंग"), "Dashboard lucky color Hindi copy exists", failures);
check(languageJs.includes("मंत्र"), "Dashboard mantra Hindi copy exists", failures);

check(schema.live_auth_enabled === false, "Schema keeps live auth disabled", failures);
check(schema.live_subscription_gate_enabled === false, "Schema keeps live subscription gate disabled", failures);
check(schema.subscriber_dashboard_enabled === false, "Schema keeps subscriber dashboard disabled", failures);
check(schema.sections?.some((item) => item.id === "daily_guidance"), "Schema defines daily guidance section", failures);
check(schema.sections?.some((item) => item.id === "profile_context"), "Schema defines profile context section", failures);
check(schema.sections?.some((item) => item.id === "palmistry_requests"), "Schema defines palmistry request section", failures);
check(schema.guardrails?.some((item) => item.includes("Do not show premium daily guidance without login")), "Schema blocks premium guidance without login", failures);

check(accessModel.live_auth_enabled === false, "Access model keeps live auth disabled", failures);
check(accessModel.roles?.anonymous?.blocked?.includes("subscriber_dashboard"), "Anonymous users are blocked from subscriber dashboard", failures);
check(accessModel.roles?.subscriber?.allowed?.includes("subscriber_dashboard"), "Subscriber role can access dashboard in future", failures);

console.log("");
console.log("Subscriber dashboard summary:");
console.log("- Dashboard page: scaffolded");
console.log("- Live auth: disabled");
console.log("- Subscription gate: disabled");
console.log("- Premium guidance: blocked");
console.log("- Palm image upload: disabled");

if (failures.length) {
  console.log("");
  console.log("Dashboard preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Subscriber dashboard preflight passed.");
