import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const VALID_STATUSES = new Set(["approved", "hold", "needs_revision", "rejected", "pending"]);

function arg(name, fallback = "") {
  const found = process.argv.find((item) => item.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

function usage() {
  console.log(`
Review Hindi article body draft

Usage:
  node scripts/review-hindi-body.js --draft=generated/hindi-drafts/example.json --status=approved --reviewer=vikash --note="Approved"
  node scripts/review-hindi-body.js --draft=generated/hindi-drafts/example.json --status=needs_revision --note="Improve tone"

Statuses:
  approved | hold | needs_revision | rejected | pending
`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + "\n", "utf8");
}

function hasDevanagari(value) {
  return /[\u0900-\u097F]/.test(String(value || ""));
}

const draftFile = arg("draft");
const status = arg("status");
const reviewer = arg("reviewer", "operator");
const note = arg("note", "");

if (!draftFile || !status || !VALID_STATUSES.has(status)) {
  usage();
  throw new Error("Missing --draft or invalid --status.");
}

const draft = readJson(draftFile);
const now = new Date().toISOString();

if (status === "approved") {
  if (!draft.title_hi || !hasDevanagari(draft.title_hi)) {
    throw new Error("Cannot approve: title_hi is missing or not Devanagari.");
  }

  if (!draft.summary_hi || !hasDevanagari(draft.summary_hi)) {
    throw new Error("Cannot approve: summary_hi is missing or not Devanagari.");
  }

  if (!draft.article_html_hi || !hasDevanagari(draft.article_html_hi) || !draft.article_html_hi.includes("<p>")) {
    throw new Error("Cannot approve: article_html_hi is missing, not Devanagari, or lacks paragraph HTML.");
  }
}

draft.status = status;
draft.review_status = status;
draft.updated_at = now;
draft.review = {
  status,
  reviewer,
  reviewed_at: now,
  note
};

draft.publish = {
  eligible: status === "approved",
  reason: status === "approved"
    ? "Approved for publishing into data/i18n/article-body-hi.json."
    : `Not publishable while status is ${status}.`
};

writeJson(draftFile, draft);

console.log("Reviewed Hindi draft:");
console.log(draftFile);
console.log("Status:", status);
console.log("Reviewer:", reviewer);
console.log("Publish eligible:", draft.publish.eligible ? "yes" : "no");
