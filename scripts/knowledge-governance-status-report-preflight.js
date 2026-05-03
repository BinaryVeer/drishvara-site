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

console.log("Drishvara D10 Knowledge Governance Consolidated Status Report preflight");
console.log("");

const policyFile = "data/knowledge/reports/knowledge-governance-status-policy-d10.json";
const reportFile = "data/knowledge/reports/knowledge-governance-status-report-d10.json";
const docFile = "docs/knowledge/knowledge-governance-status-report-d10.md";
const builderFile = "scripts/build-knowledge-governance-status-report-d10.js";
const runtimeFile = "assets/js/drishvara-language-runtime.js";
const authClientFile = "assets/js/auth-client.js";
const sessionGuardFile = "assets/js/session-guard.js";
const dailyContextFile = "data/daily-context.json";

const requiredFiles = [
  policyFile,
  reportFile,
  docFile,
  builderFile,
  runtimeFile,
  authClientFile,
  sessionGuardFile,
  dailyContextFile,
  "data/knowledge/daily-guidance/daily-guidance-engine-governance-d01.json",
  "data/knowledge/daily-guidance/word-of-day-bank-d02.json",
  "data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json",
  "data/knowledge/daily-guidance/daily-guidance-selection-preview-d04.json",
  "data/knowledge/sanatan/panchang-festival-source-registry-d05.json",
  "data/knowledge/sanatan/mantra-source-registry-d06.json",
  "data/knowledge/subscribers/subscriber-guidance-personalization-schema-d07.json",
  "data/knowledge/subscribers/subscriber-entitlement-privacy-gate-d08.json",
  "data/knowledge/subscribers/subscriber-dashboard-readiness-matrix-d09.json"
];

for (const file of requiredFiles) check(exists(file), `${file} exists`);

const policy = json(policyFile);
const report = json(reportFile);
const doc = read(docFile);
const builder = read(builderFile);
const runtime = read(runtimeFile);
const authClient = read(authClientFile);
const sessionGuard = read(sessionGuardFile);

check(policy.status === "consolidated_status_policy_only", "D10 policy is status-policy-only");
check(policy.public_dynamic_output_enabled === false, "Public dynamic output remains disabled");
check(policy.daily_guidance_live_enabled === false, "Daily guidance live output remains disabled");
check(policy.panchang_live_enabled === false, "Panchang live output remains disabled");
check(policy.festival_live_enabled === false, "Festival live output remains disabled");
check(policy.mantra_live_enabled === false, "Mantra live output remains disabled");
check(policy.subscriber_guidance_live_enabled === false, "Subscriber guidance remains disabled");
check(policy.premium_guidance_enabled === false, "Premium guidance remains disabled");
check(policy.dashboard_live_data_enabled === false, "Dashboard live data remains disabled");
check(policy.auth_enabled === false, "Auth remains disabled");
check(policy.supabase_enabled === false, "Supabase remains disabled");
check(policy.payment_enabled === false, "Payment remains disabled");
check(policy.subscription_gate_live_enabled === false, "Subscription gate remains disabled");
check(policy.entitlement_check_live_enabled === false, "Entitlement check remains disabled");
check(policy.external_api_fetch_enabled === false, "External API fetch remains disabled");
check(policy.runtime_language_change_enabled === false, "Language runtime remains untouched");
check(policy.admin_actions_enabled === false, "Admin actions remain disabled");

check(policy.brand.en === "Drishvara", "English brand is Drishvara");
check(policy.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");
check(Array.isArray(policy.covered_stages), "Covered stages array exists");
check(policy.covered_stages.length === 9, "D10 policy covers D01-D09");
check(policy.next_stage_gate.runtime_activation_allowed === false, "Runtime activation blocked by D10 policy");

check(report.status === "report_ready_not_live", "D10 report is ready and not live");
check(report.public_dynamic_output_enabled === false, "Report keeps public dynamic output disabled");
check(report.subscriber_guidance_live_enabled === false, "Report keeps subscriber guidance disabled");
check(report.premium_guidance_enabled === false, "Report keeps premium guidance disabled");
check(report.auth_enabled === false, "Report keeps Auth disabled");
check(report.supabase_enabled === false, "Report keeps Supabase disabled");
check(report.payment_enabled === false, "Report keeps payment disabled");

check(report.summary.total_stages === 9, "Report covers nine knowledge stages");
check(report.summary.governance_ready_count === 9, "All D01-D09 stages are governance-ready");
check(report.summary.needs_fix_count === 0, "No D01-D09 stage needs fix");
check(report.summary.live_activation_allowed === false, "Live activation remains blocked");
check(report.summary.public_dynamic_output_allowed === false, "Public dynamic output remains blocked");
check(report.summary.subscriber_guidance_allowed === false, "Subscriber guidance remains blocked");
check(report.summary.premium_guidance_allowed === false, "Premium guidance remains blocked");

check(Array.isArray(report.items), "Report items array exists");
check(report.items.length === 9, "Report has D01-D09 items");

for (const stage of ["D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09"]) {
  const item = report.items.find((entry) => entry.stage === stage);
  check(Boolean(item), `Report includes ${stage}`);
  if (item) {
    check(item.readiness_status === "governance_ready_not_live", `${stage} governance-ready but not live`);
    check(item.activation_status === "not_live", `${stage} activation status is not live`);
    check(item.all_files_exist === true, `${stage} files exist`);
    check(item.all_statuses_ok === true, `${stage} statuses are ok`);
    check(item.all_live_flags_disabled === true, `${stage} live flags are disabled`);
  }
}

check(builder.includes("live_activation_allowed: false"), "Builder blocks live activation");
check(builder.includes("public_dynamic_output_allowed: false"), "Builder blocks public dynamic output");
check(builder.includes("subscriber_guidance_allowed: false"), "Builder blocks subscriber guidance");
check(builder.includes("premium_guidance_allowed: false"), "Builder blocks premium guidance");
check(!builder.includes("fetch("), "Builder does not fetch external APIs");
check(!builder.includes("createClient("), "Builder does not instantiate Supabase");
check(!builder.includes("supabase.auth"), "Builder does not call Supabase auth");
check(!builder.includes("SERVICE_ROLE"), "Builder does not expose service role");

check(doc.includes("reporting and freeze stage only"), "Doc states reporting/freeze only");
check(doc.includes("does not"), "Doc includes non-goals");
check(doc.includes("separate explicit activation stage"), "Doc requires separate activation stage");

check(runtime.includes("2026.05.02-h05"), "H05/H05B runtime remains stable");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

check(!authClient.includes("createClient("), "Auth client still does not instantiate Supabase");
check(!authClient.includes("supabase.auth"), "Auth client still does not call Supabase auth");
check(!authClient.includes("SERVICE_ROLE"), "Auth client does not expose service role");
check(!sessionGuard.includes("createClient("), "Session guard still does not instantiate Supabase");
check(!sessionGuard.includes("supabase.auth"), "Session guard still does not call Supabase auth");
check(!sessionGuard.includes("SERVICE_ROLE"), "Session guard does not expose service role");

console.log("");
console.log("D10 Knowledge Governance report summary:");
console.log(`- Stages covered: ${report.summary.total_stages}`);
console.log(`- Governance-ready: ${report.summary.governance_ready_count}`);
console.log(`- Needs fix: ${report.summary.needs_fix_count}`);
console.log("- Live activation: blocked");
console.log("- Subscriber/premium guidance: blocked");

if (failures.length) {
  console.log("");
  console.log("D10 Knowledge Governance Consolidated Status Report preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("D10 Knowledge Governance Consolidated Status Report preflight passed.");
