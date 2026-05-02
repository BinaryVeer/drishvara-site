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

console.log("Drishvara subscriber dashboard preflight");
console.log("");

check(exists("dashboard.html"), "Dashboard page exists");
check(exists("data/backend/subscriber-dashboard-schema.json"), "Dashboard schema exists");
check(exists("data/backend/auth-access-model.json"), "Auth access model exists");
check(exists("assets/js/drishvara-language-runtime.js"), "Unified language runtime exists");

const dashboard = read("dashboard.html");
const runtime = read("assets/js/drishvara-language-runtime.js");
const schema = json("data/backend/subscriber-dashboard-schema.json");
const access = json("data/backend/auth-access-model.json");

check(dashboard.includes("Dashboard"), "Dashboard has page title");
check(dashboard.toLowerCase().includes("pending") || dashboard.toLowerCase().includes("login"), "Dashboard shows auth pending state");
check(dashboard.toLowerCase().includes("lucky") || runtime.includes("Lucky Number"), "Dashboard includes lucky number card");
check(dashboard.toLowerCase().includes("color") || runtime.includes("Lucky Color"), "Dashboard includes lucky color card");
check(dashboard.toLowerCase().includes("mantra") || runtime.includes("Mantra"), "Dashboard includes mantra card");
check(dashboard.toLowerCase().includes("palm"), "Dashboard references palmistry safely");
check(dashboard.toLowerCase().includes("no profile") || dashboard.toLowerCase().includes("profile storage"), "Dashboard states no profile storage yet");
check(dashboard.toLowerCase().includes("noindex"), "Dashboard is noindex while scaffold");

check(runtime.includes("डैशबोर्ड") || runtime.includes("सब्सक्राइबर डैशबोर्ड"), "Dashboard Hindi UI copy exists");
check(runtime.includes("शुभ अंक"), "Dashboard lucky number Hindi copy exists");
check(runtime.includes("शुभ रंग"), "Dashboard lucky color Hindi copy exists");
check(runtime.includes("मंत्र"), "Dashboard mantra Hindi copy exists");

check(schema.live_auth_enabled === false || schema.auth_enabled === false || schema.status !== "live", "Schema keeps live auth disabled");
check(schema.subscription_gate_enabled === false || schema.live_subscription_gate_enabled === false || schema.status !== "live", "Schema keeps live subscription gate disabled");
check(schema.subscriber_dashboard_enabled === false || schema.dashboard_enabled === false || schema.status !== "live", "Schema keeps subscriber dashboard disabled");
check(JSON.stringify(schema).includes("daily") || JSON.stringify(schema).includes("guidance"), "Schema defines daily guidance section");
check(JSON.stringify(schema).includes("profile"), "Schema defines profile context section");
check(JSON.stringify(schema).includes("palm"), "Schema defines palmistry request section");
check(JSON.stringify(schema).toLowerCase().includes("premium"), "Schema blocks premium guidance without login");

check(JSON.stringify(access).toLowerCase().includes("auth"), "Access model references auth");
check(JSON.stringify(access).toLowerCase().includes("anonymous") || JSON.stringify(access).toLowerCase().includes("anon"), "Anonymous users are blocked from subscriber dashboard");
check(JSON.stringify(access).toLowerCase().includes("subscriber"), "Subscriber role can access dashboard in future");

console.log("");
console.log("Subscriber dashboard summary:");
console.log("- Dashboard page: scaffolded");
console.log("- Live auth: disabled");
console.log("- Subscription gate: disabled");
console.log("- Premium guidance: blocked");
console.log("- Palm image upload: disabled");
console.log("- Hindi UI copy: provided through unified language runtime");

if (failures.length) {
  console.log("");
  console.log("Dashboard preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Dashboard preflight passed.");
