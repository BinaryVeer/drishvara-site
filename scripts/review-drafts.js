import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const CATEGORIES = [
  "spirituality",
  "sports",
  "world_affairs",
  "media_society",
  "public_programmes"
];

const VALID_STATUSES = new Set([
  "approved",
  "rejected",
  "hold",
  "needs_revision"
]);

function parseArgs(argv) {
  const out = {
    latest: false,
    dryRun: false,
    category: "all",
    status: "",
    date: "",
    reviewer: "operator",
    note: ""
  };

  for (const arg of argv) {
    if (arg === "--latest") out.latest = true;
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg.startsWith("--category=")) out.category = arg.split("=", 2)[1];
    else if (arg.startsWith("--status=")) out.status = arg.split("=", 2)[1];
    else if (arg.startsWith("--date=")) out.date = arg.split("=", 2)[1];
    else if (arg.startsWith("--reviewer=")) out.reviewer = arg.split("=", 2)[1];
    else if (arg.startsWith("--note=")) out.note = arg.split("=", 2)[1];
  }

  return out;
}

function usage() {
  console.log(`
Drishvara draft review tool

Usage:
  node scripts/review-drafts.js --latest --category=all --status=approved --reviewer=vikash --note="Approved for publishing"
  node scripts/review-drafts.js --date=2026-04-19 --category=spirituality --status=hold --note="Needs revision"
  node scripts/review-drafts.js --latest --category=all --status=approved --dry-run

Required:
  --status=approved | rejected | hold | needs_revision

Optional:
  --latest                 Use latest generated/drafts date
  --date=YYYY-MM-DD        Use specific date
  --category=all           Review all publish categories
  --category=spirituality  Review one category
  --reviewer=name          Reviewer/operator name
  --note=text              Review note
  --dry-run                Show intended changes without writing files
`);
}

function latestDraftDate() {
  const dir = path.join(root, "generated", "drafts");
  if (!fs.existsSync(dir)) return "";

  const dates = fs.readdirSync(dir)
    .map((name) => name.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1])
    .filter(Boolean)
    .sort();

  return dates.at(-1) || "";
}

function reviewLabel(status) {
  if (status === "approved") return "approved_for_publish";
  if (status === "rejected") return "rejected";
  if (status === "hold") return "hold";
  if (status === "needs_revision") return "needs_revision";
  return status;
}

function targetCategories(category) {
  if (!category || category === "all") return CATEGORIES;

  if (!CATEGORIES.includes(category)) {
    throw new Error(`Unknown category "${category}". Use one of: ${CATEGORIES.join(", ")} or all.`);
  }

  return [category];
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function applyReview(data, { status, reviewer, note }) {
  const now = new Date().toISOString();
  const approvalStatus = reviewLabel(status);

  data.review_status = status;
  data.approval_status = approvalStatus;
  data.status = status === "approved" ? "approved" : status;

  data.operator_review = {
    ...(data.operator_review || {}),
    status,
    approval_status: approvalStatus,
    reviewed_at: now,
    reviewer,
    note,
    source: "scripts/review-drafts.js"
  };

  data.review = {
    ...(data.review || {}),
    status,
    approval_status: approvalStatus,
    reviewed_at: now,
    reviewer,
    note
  };

  if (data.draft_packet && typeof data.draft_packet === "object") {
    data.draft_packet.review_status = status;
    data.draft_packet.approval_status = approvalStatus;
    data.draft_packet.status = status === "approved" ? "approved" : status;
    data.draft_packet.reviewed_at = now;
    data.draft_packet.reviewed_by = reviewer;
    data.draft_packet.review_note = note;
  }

  return data;
}

const args = parseArgs(process.argv.slice(2));

if (!args.status || !VALID_STATUSES.has(args.status)) {
  usage();
  throw new Error("Missing or invalid --status.");
}

const date = args.date || (args.latest ? latestDraftDate() : "");

if (!date) {
  usage();
  throw new Error("Provide --date=YYYY-MM-DD or --latest.");
}

const categories = targetCategories(args.category);
const changed = [];

console.log("Drishvara draft review update");
console.log(`Date: ${date}`);
console.log(`Categories: ${categories.join(", ")}`);
console.log(`Status: ${args.status}`);
console.log(`Reviewer: ${args.reviewer}`);
console.log(`Dry run: ${args.dryRun ? "yes" : "no"}`);
console.log("");

for (const category of categories) {
  const rel = `generated/drafts/${date}-${category}.json`;
  const file = path.join(root, rel);

  if (!fs.existsSync(file)) {
    console.log(`❌ Missing: ${rel}`);
    continue;
  }

  const data = readJson(file);

  if (!data?.draft_packet) {
    console.log(`❌ draft_packet missing: ${rel}`);
    continue;
  }

  const before = {
    review_status: data.review_status || data.draft_packet.review_status || "unknown",
    approval_status: data.approval_status || data.draft_packet.approval_status || "unknown"
  };

  const updated = applyReview(data, {
    status: args.status,
    reviewer: args.reviewer,
    note: args.note
  });

  const after = {
    review_status: updated.review_status,
    approval_status: updated.approval_status
  };

  console.log(`✅ ${rel}`);
  console.log(`   title: ${updated.draft_packet.title || "Untitled"}`);
  console.log(`   review_status: ${before.review_status} → ${after.review_status}`);
  console.log(`   approval_status: ${before.approval_status} → ${after.approval_status}`);

  if (!args.dryRun) {
    writeJson(file, updated);
  }

  changed.push(rel);
}

console.log("");
console.log(args.dryRun ? "Dry run complete. No files changed." : "Review metadata updated.");
console.log(`Files processed: ${changed.length}`);
