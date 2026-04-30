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

console.log("Drishvara Sports Desk preflight");
console.log("");

check(fs.existsSync(path.join(root, "scripts/build-sports-context.js")), "Sports context builder exists", failures);
check(fs.existsSync(path.join(root, "assets/js/sports-context.js")), "Sports frontend hydrator exists", failures);

const run = spawnSync("node", ["scripts/build-sports-context.js", "--date=2026-05-10"], {
  cwd: root,
  encoding: "utf8"
});

check(run.status === 0, "Sports context builder sample run succeeds", failures);
check(fs.existsSync(path.join(root, "data/sports-context.json")), "data/sports-context.json exists", failures);
check(fs.existsSync(path.join(root, "generated/sports-context/2026-05-10-sports-context.json")), "Generated sports context exists", failures);

const context = readJson("data/sports-context.json");
const hydrator = read("assets/js/sports-context.js");

check(context.public_output_enabled === true, "Sports context is public-safe", failures);
check(context.live_api_enabled === false, "Live sports API remains disabled at scaffold stage", failures);
check(Boolean(context.right_top_live_update), "Right-top live sports update object exists", failures);
check(Boolean(context.right_top_live_update?.title), "Right-top live sports update has title", failures);
check(Boolean(context.right_top_live_update?.title_hi), "Right-top live sports update has Hindi title", failures);
check(Array.isArray(context.live_events), "Live events array exists", failures);
check(Array.isArray(context.tournament_watch), "Tournament watch array exists", failures);
check(Array.isArray(context.major_updates), "Major updates array exists", failures);
check(Boolean(context.featured_sports_article?.url), "Featured sports article has URL", failures);
check(context.guardrails?.some((item) => item.includes("scaffold sports items")), "Sports guardrails block fake live scores", failures);

check(hydrator.includes("drishvara-sports-live-pill"), "Hydrator supports right-top live sports pill", failures);
check(hydrator.includes("data-sports-live-update"), "Hydrator supports live sports update target", failures);

console.log("");
console.log("Sports Desk summary:");
console.log("- Live API: disabled");
console.log("- Right-top live update: scaffolded");
console.log("- Sports Desk data feed: ready");
console.log("- Fake live scores: blocked by guardrails");

if (failures.length) {
  console.log("");
  console.log("Sports Desk preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Sports Desk preflight passed.");
