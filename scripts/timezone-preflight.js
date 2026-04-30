import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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

console.log("Drishvara timezone/date-basis preflight");
console.log("");

check(fs.existsSync(path.join(root, "data/system/timezone-config.json")), "Timezone config exists", failures);
check(fs.existsSync(path.join(root, "assets/js/timezone-context.js")), "Timezone browser controller exists", failures);

const config = readJson("data/system/timezone-config.json");
const timezoneJs = read("assets/js/timezone-context.js");
const dailyBuilder = read("scripts/build-daily-context.js");
const sportsBuilder = read("scripts/build-sports-context.js");
const indexHtml = read("index.html");

check(config.default_timezone === "Asia/Kolkata", "Default timezone is Asia/Kolkata", failures);
check(config.default_alias === "IST", "Default alias is IST", failures);
check(config.default_offset === "GMT+5:30", "Default offset is GMT+5:30", failures);
check(config.supported_timezones?.some((zone) => zone.timezone === "Asia/Kolkata"), "Supported zones include Asia/Kolkata", failures);
check(config.guardrails?.some((item) => item.includes("not UTC")), "Config blocks UTC date as default", failures);

check(timezoneJs.includes("drishvara_timezone"), "Browser timezone preference is persisted", failures);
check(timezoneJs.includes("Asia/Kolkata"), "Browser controller defaults to Asia/Kolkata", failures);
check(timezoneJs.includes("drishvara:timezonechange"), "Browser controller emits timezone change event", failures);

check(dailyBuilder.includes("todayInTimezone"), "Daily context builder uses timezone date helper", failures);
check(dailyBuilder.includes('arg("timezone", "Asia/Kolkata")'), "Daily context builder defaults timezone to IST", failures);
check(dailyBuilder.includes("timezone_basis"), "Daily context output includes timezone basis", failures);

check(sportsBuilder.includes("todayInTimezone"), "Sports context builder uses timezone date helper", failures);
check(sportsBuilder.includes('arg("timezone", "Asia/Kolkata")'), "Sports context builder defaults timezone to IST", failures);
check(sportsBuilder.includes("timezone_basis"), "Sports context output includes timezone basis", failures);

check(indexHtml.includes("assets/js/timezone-context.js"), "Homepage loads timezone controller", failures);
check(indexHtml.includes("data-drishvara-timezone-control"), "Homepage has compact timezone slot", failures);
check(indexHtml.includes("nav-timezone-slot"), "Timezone control uses compact nav slot", failures);
check(!indexHtml.includes("date-basis-section"), "Large date-basis homepage section is removed", failures);
check(timezoneJs.includes("nav-timezone-select"), "Timezone control renders compact dropdown", failures);
check(timezoneJs.includes("Today’s Vedic Guidance"), "Timezone event covers Today’s Vedic Guidance", failures);
check(timezoneJs.includes("Panchang & Festival View"), "Timezone event covers Panchang & Festival View", failures);
check(timezoneJs.includes("Word of the Day"), "Timezone event covers Word of the Day", failures);
check(!timezoneJs.includes("position: fixed"), "Timezone control is not floating/fixed", failures);
check(!timezoneJs.includes("document.body.appendChild"), "Timezone control is not appended as floating body element", failures);

const dailyRun = spawnSync("node", ["scripts/build-daily-context.js", "--date=2026-04-30", "--timezone=Asia/Kolkata"], {
  cwd: root,
  encoding: "utf8"
});

check(dailyRun.status === 0, "Daily context builds with explicit IST date", failures);

const daily = readJson("data/daily-context.json");
check(daily.date === "2026-04-30", "Daily context preserves selected IST date", failures);
check(daily.timezone_basis?.timezone === "Asia/Kolkata", "Daily context records Asia/Kolkata basis", failures);
check(daily.timezone_basis?.default_alias === "IST", "Daily context records IST alias", failures);

const sportsRun = spawnSync("node", ["scripts/build-sports-context.js", "--date=2026-04-30", "--timezone=Asia/Kolkata"], {
  cwd: root,
  encoding: "utf8"
});

check(sportsRun.status === 0, "Sports context builds with explicit IST date", failures);

const sports = readJson("data/sports-context.json");
check(sports.date === "2026-04-30", "Sports context preserves selected IST date", failures);
check(sports.timezone_basis?.timezone === "Asia/Kolkata", "Sports context records Asia/Kolkata basis", failures);

console.log("");
console.log("Timezone/date-basis summary:");
console.log("- Default: Asia/Kolkata · IST · GMT+5:30");
console.log("- User-selectable timezone scaffold: available on homepage");
console.log("- Daily context: timezone-aware");
console.log("- Sports context: timezone-aware");
console.log("- Panchang/Vedic public output: still disabled until reviewed methods");

if (failures.length) {
  console.log("");
  console.log("Timezone preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Timezone/date-basis preflight passed.");
