import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.existsSync(path.join(root, file))
    ? fs.readFileSync(path.join(root, file), "utf8")
    : "";
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

console.log("Drishvara placeholder connection/guard audit");
console.log("");

const files = [
  "index.html",
  "insights.html",
  "article.html",
  "submissions.html",
  "dashboard.html",
  "admin.html",
  "assets/js/daily-basis-guard.js",
  "assets/js/timezone-context.js",
  "assets/js/sports-context.js",
  "assets/js/submission-client.js",
  "data/daily-context.json",
  "data/sports-context.json",
  "data/knowledge/sanatan/panchang-engine-schema.json",
  "data/knowledge/subscribers/daily-guidance-schema.json",
  "data/backend/admin/admin-review-schema.json",
  "data/backend/submission-intake-policy.json",
  "data/backend/payments/subscription-plans.json"
];

const all = files.map((file) => `\n/* ${file} */\n${read(file)}`).join("\n");

check(read("index.html").includes("assets/js/daily-basis-guard.js"), "Homepage loads daily basis guard", failures);
check(read("assets/js/daily-basis-guard.js").includes("Asia/Kolkata"), "Daily basis guard defaults to IST", failures);
check(read("assets/js/daily-basis-guard.js").includes("panchangPublicOutputEnabled: false"), "Panchang public output remains blocked", failures);
check(read("assets/js/daily-basis-guard.js").includes("vedicGuidancePublicOutputEnabled: false"), "Vedic guidance public output remains blocked", failures);

check(read("data/daily-context.json").includes('"enabled": false'), "Daily context keeps Vedic/Panchang disabled", failures);
check(read("data/sports-context.json").includes('"live_api_enabled": false'), "Sports live API remains disabled", failures);
check(read("assets/js/sports-context.js").includes("Sports context hydration skipped") || read("assets/js/sports-context.js").includes("drishvara-sports-live-pill"), "Sports scaffold renderer exists safely", failures);

check(read("assets/js/submission-client.js").includes("BACKEND_SUBMISSION_ENABLED = false"), "Submission backend write disabled", failures);
check(read("assets/js/submission-client.js").includes("SUPABASE_INSERT_ENABLED = false"), "Submission Supabase insert disabled", failures);
check(read("assets/js/submission-client.js").includes("PALM_IMAGE_UPLOAD_ENABLED = false"), "Palm image upload disabled", failures);

check(read("dashboard.html").includes("Login/subscription integration pending"), "Dashboard premium area shows blocked state", failures);
check(read("dashboard.html").includes("Blocked"), "Dashboard premium cards remain blocked", failures);
check(read("admin.html").includes("Admin auth/actions disabled"), "Admin panel actions remain disabled", failures);
check(read("admin.html").includes('noindex, nofollow'), "Admin page remains noindex", failures);

check(!all.includes("href=\"#open-day-card\""), "No old #open-day-card dummy links remain", failures);
check(!all.includes("javascript:void"), "No javascript:void dummy links remain", failures);
check(!all.includes("href=\"#\""), "No empty hash href placeholders remain", failures);

check(!/Saturday|शनिवार/.test(read("index.html")) || read("assets/js/daily-basis-guard.js").includes("WEEKDAYS_EN"), "No unguarded hardcoded Saturday on homepage", failures);

check(!all.includes("SERVICE_ROLE"), "No SERVICE_ROLE string exposed", failures);
check(!all.includes("SUPABASE_SERVICE"), "No SUPABASE_SERVICE string exposed", failures);

console.log("");
console.log("Placeholder audit summary:");
console.log("- Vedic/Panchang/Festival: date-basis guarded and public output blocked");
console.log("- Sports: scaffolded, no live API claim");
console.log("- Submissions/Palm: backend and upload disabled");
console.log("- Dashboard/Admin: scaffolded and blocked");
console.log("- Dummy links: checked");

if (failures.length) {
  console.log("");
  console.log("Placeholder audit failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Placeholder connection/guard audit passed.");
