import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const draftsDir = path.join(root, "generated", "hindi-drafts");
const sidecarPath = path.join(root, "data", "i18n", "article-body-hi.json");

function arg(name, fallback = "") {
  const found = process.argv.find((item) => item.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

function readJsonAbs(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJsonAbs(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function hasDevanagari(value) {
  return /[\u0900-\u097F]/.test(String(value || ""));
}

function isApprovedDraft(draft) {
  return (
    draft &&
    draft.status === "approved" &&
    draft.review_status === "approved" &&
    draft.path &&
    draft.title_hi &&
    draft.summary_hi &&
    draft.article_html_hi &&
    hasDevanagari(draft.title_hi) &&
    hasDevanagari(draft.summary_hi) &&
    hasDevanagari(draft.article_html_hi) &&
    String(draft.article_html_hi).includes("<p>")
  );
}

const dryRun = arg("dryRun", "false").toLowerCase() === "true";

const sidecar = readJsonAbs(sidecarPath);
const existing = Array.isArray(sidecar.items) ? sidecar.items : [];

const draftFiles = fs.existsSync(draftsDir)
  ? fs.readdirSync(draftsDir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => path.join(draftsDir, name))
  : [];

const approvedDrafts = draftFiles
  .map((file) => ({ file, draft: readJsonAbs(file) }))
  .filter(({ draft }) => isApprovedDraft(draft));

const outputMap = new Map();

for (const item of existing) {
  const key = item.path || item.sourcePath || item.article_path;
  if (key) outputMap.set(key, item);
}

for (const { file, draft } of approvedDrafts) {
  outputMap.set(draft.path, {
    path: draft.path,
    sourcePath: draft.sourcePath || draft.path,
    status: "approved",
    language: "hi",
    title_hi: draft.title_hi,
    summary_hi: draft.summary_hi,
    meta_hi: draft.meta_hi || "दृश्वर लेख",
    article_html_hi: draft.article_html_hi,
    published_from_draft: path.relative(root, file),
    published_at: new Date().toISOString(),
    reviewed_by: draft.review?.reviewer || "",
    review_note: draft.review?.note || ""
  });
}

const nextSidecar = {
  ...sidecar,
  items: Array.from(outputMap.values())
};

console.log("Hindi body publish scan:");
console.log(`- Draft files: ${draftFiles.length}`);
console.log(`- Approved drafts: ${approvedDrafts.length}`);
console.log(`- Existing sidecar items: ${existing.length}`);
console.log(`- Output sidecar items: ${nextSidecar.items.length}`);
console.log(`- Dry run: ${dryRun ? "yes" : "no"}`);

for (const { file, draft } of approvedDrafts) {
  console.log(`- ${path.relative(root, file)} → ${draft.path}`);
}

if (!dryRun) {
  writeJsonAbs(sidecarPath, nextSidecar);
  console.log("Updated data/i18n/article-body-hi.json");
}
