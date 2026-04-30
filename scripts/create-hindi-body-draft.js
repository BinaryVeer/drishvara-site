import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function arg(name, fallback = "") {
  const found = process.argv.find((item) => item.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeJson(file, data) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function slugFromPath(value) {
  return String(value || "")
    .split("/")
    .pop()
    .replace(/\.html$/i, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function usage() {
  console.log(`
Create Hindi article body draft

Usage:
  node scripts/create-hindi-body-draft.js --path=articles/policy/example.html
  node scripts/create-hindi-body-draft.js --path=articles/policy/example.html --reviewer=vikash --force=true

Creates:
  generated/hindi-drafts/<slug>.json
`);
}

const articlePath = arg("path");
const reviewer = arg("reviewer", "operator");
const force = arg("force", "false").toLowerCase() === "true";

if (!articlePath) {
  usage();
  throw new Error("Missing --path.");
}

const indexData = readJson("data/article-index.json");
const sidecar = readJson("data/i18n/article-body-hi.json");

const indexItems = Array.isArray(indexData.items) ? indexData.items : [];
const sidecarItems = Array.isArray(sidecar.items) ? sidecar.items : [];

const indexItem = indexItems.find((item) =>
  item.path === articlePath ||
  item.sourcePath === articlePath ||
  item.directUrl === articlePath
);

if (!indexItem) {
  throw new Error(`Article path not found in article index: ${articlePath}`);
}

const existingHindi = sidecarItems.find((item) =>
  item.path === articlePath ||
  item.sourcePath === articlePath ||
  item.article_path === articlePath
);

const slug = slugFromPath(articlePath);
const outFile = `generated/hindi-drafts/${slug}.json`;

if (fs.existsSync(path.join(root, outFile)) && !force) {
  throw new Error(`${outFile} already exists. Use --force=true to overwrite.`);
}

const now = new Date().toISOString();

const draft = {
  version: "1.0.0",
  type: "hindi_article_body_draft",
  path: articlePath,
  sourcePath: articlePath,
  status: "draft",
  review_status: "pending",
  language: "hi",
  source_language: "en",
  created_at: now,
  updated_at: now,
  created_by: reviewer,
  title_en: indexItem.title || "",
  summary_en: indexItem.summary || "",
  tag: indexItem.tag || "",
  image: indexItem.image || "",
  title_hi: existingHindi?.title_hi || indexItem.title_hi || "",
  summary_hi: existingHindi?.summary_hi || indexItem.summary_hi || "",
  meta_hi: existingHindi?.meta_hi || `${indexItem.tag || "Drishvara"} · प्रकाशित लेख`,
  article_html_hi: existingHindi?.article_html_hi || "",
  review: {
    status: "pending",
    reviewer: "",
    reviewed_at: "",
    note: ""
  },
  publish: {
    eligible: false,
    reason: "Draft must be reviewed and approved before publishing to Hindi sidecar."
  }
};

writeJson(outFile, draft);

console.log("Created Hindi body draft:");
console.log(outFile);
console.log("");
console.log("Title EN:", draft.title_en);
console.log("Title HI:", draft.title_hi || "(empty)");
console.log("Status:", draft.status);
