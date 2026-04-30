import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
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

console.log("Drishvara daily basis guard preflight");
console.log("");

const guardPath = "assets/js/daily-basis-guard.js";

check(fs.existsSync(path.join(root, guardPath)), "Daily basis guard script exists", failures);

const guard = read(guardPath);
const index = read("index.html");

check(index.includes("assets/js/daily-basis-guard.js"), "Homepage loads daily basis guard", failures);
check(index.indexOf("timezone-context.js") < index.indexOf("daily-basis-guard.js"), "Daily basis guard loads after timezone context", failures);

check(guard.includes('DEFAULT_TZ = "Asia/Kolkata"'), "Daily basis guard defaults to Asia/Kolkata", failures);
check(guard.includes("drishvara:timezonechange"), "Daily basis guard listens to timezone changes", failures);
check(guard.includes("Today’s") || guard.includes("today’s"), "Daily basis guard covers Today’s sections", failures);
check(guard.includes("Panchang"), "Daily basis guard covers Panchang sections", failures);
check(/festival/i.test(guard), "Daily basis guard covers Festival sections", failures);
check(guard.includes("panchangPublicOutputEnabled: false"), "Panchang output remains disabled", failures);
check(guard.includes("vedicGuidancePublicOutputEnabled: false"), "Vedic guidance output remains disabled", failures);

console.log("");
console.log("Daily basis guard summary:");
console.log("- Default date basis: Asia/Kolkata / IST");
console.log("- Stale weekday placeholders: guarded");
console.log("- Panchang/Vedic interpretation: still disabled until reviewed method");

if (failures.length) {
  console.log("");
  console.log("Daily basis guard preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Daily basis guard preflight passed.");
