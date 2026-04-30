import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const sidecarPath = path.join(root, "data", "i18n", "article-body-hi.json");
const articleReaderPath = path.join(root, "article.html");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function readJson(file) {
  return JSON.parse(read(file));
}

function check(condition, label, failures, warning = false) {
  if (condition) {
    console.log(`✅ ${label}`);
  } else if (warning) {
    console.log(`⚠️ ${label}`);
  } else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

const failures = [];

console.log("Drishvara Hindi article body preflight");
console.log("");

check(fs.existsSync(sidecarPath), "Hindi article body sidecar exists", failures);
check(fs.existsSync(articleReaderPath), "Article reader exists", failures);

const sidecar = readJson(sidecarPath);
const articleReader = read(articleReaderPath);

check(sidecar.version === "1.0.0", "Hindi sidecar has version", failures);
check(Array.isArray(sidecar.items), "Hindi sidecar has items array", failures);
check(articleReader.includes("findHindiBodyForPath"), "Article reader can look up Hindi body sidecar", failures);
check(articleReader.includes("article_html_hi"), "Article reader supports article_html_hi", failures);
check(
  articleReader.includes("hindiBody?.article_html_hi ||") &&
    (articleReader.includes("article.bodyHtml") || articleReader.includes("applyReaderHeroImage")),
  "Article reader falls back to English body",
  failures
);

const approvedItems = sidecar.items.filter((item) => item.status === "approved" && item.article_html_hi);

check(
  approvedItems.length >= 4,
  "At least four approved Hindi article bodies are available",
  failures
);

for (const item of approvedItems) {
  check(Boolean(item.path || item.sourcePath || item.article_path), "Approved Hindi body has article path", failures);
  check(Boolean(item.title_hi), "Approved Hindi body has Hindi title", failures);
  check(Boolean(item.summary_hi), "Approved Hindi body has Hindi summary", failures);
  check(Boolean(item.article_html_hi), "Approved Hindi body has Hindi article HTML", failures);
  check(String(item.article_html_hi || "").includes("<p>"), "Approved Hindi body contains paragraph HTML", failures);
}


const requiredFeaturedPaths = [
  "articles/policy/advancing-digital-literacy-public-education-2026.html",
  "articles/media/algorithmic-bias-content-curation-fair-representation.html",
  "articles/world/ai-future-warfare-2026.html",
  "articles/spiritual/contemplating-impermanence-path-spiritual-liberation.html"
];

const approvedPathSet = new Set(
  approvedItems.map((item) => item.path || item.sourcePath || item.article_path)
);

const missingFeatured = requiredFeaturedPaths.filter((path) => !approvedPathSet.has(path));

check(
  missingFeatured.length === 0,
  "Featured Hindi body paths are covered",
  failures
);

if (missingFeatured.length) {
  console.log("Missing featured Hindi bodies:");
  for (const path of missingFeatured) console.log(`- ${path}`);
}

console.log("");
console.log("Hindi body readiness:");
console.log(`- Sidecar items: ${sidecar.items.length}`);
console.log(`- Approved Hindi bodies: ${approvedItems.length}`);
console.log("- Empty sidecar is acceptable at B16A scaffold stage.");

if (failures.length) {
  console.log("");
  console.log("Hindi body preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Hindi article body preflight passed.");
