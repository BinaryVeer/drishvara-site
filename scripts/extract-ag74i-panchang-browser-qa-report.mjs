import fs from "node:fs";

const dumpPath = process.argv[2];
const outPath = process.argv[3];

if (!dumpPath || !outPath) {
  console.error("Usage: node extract-ag74i-panchang-browser-qa-report.mjs <dump> <out>");
  process.exit(1);
}

const html = fs.readFileSync(dumpPath, "utf8");
const match = html.match(/<pre id="ag74i-browser-qa-result">([\s\S]*?)<\/pre>/i);

if (!match) {
  console.error("❌ AG74I browser QA result node not found in Chrome dump.");
  process.exit(1);
}

const decoded = match[1]
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&amp;/g, "&");

let report;
try {
  report = JSON.parse(decoded);
} catch (error) {
  console.error("❌ AG74I browser QA JSON could not be parsed.");
  console.error(decoded);
  process.exit(1);
}

fs.mkdirSync(new URL("../data/quality/", import.meta.url), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");

if (report.status !== "passed" || report.failure_count !== 0) {
  console.error("❌ AG74I browser interaction QA failed.");
  for (const failure of report.failures || []) console.error("- " + failure);
  process.exit(1);
}

console.log("✅ AG74I browser interaction QA passed.");
console.log("✅ " + report.check_count + " browser checks completed.");
