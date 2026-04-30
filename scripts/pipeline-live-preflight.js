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

const args = new Set(process.argv.slice(2));
const requireApproved = args.has("--require-approved");
const latestDrafts = args.has("--latest-drafts");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function readJson(file) {
  return JSON.parse(read(file));
}

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  const out = {};

  if (!fs.existsSync(envPath)) return out;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    value = value.replace(/^["']|["']$/g, "");

    if (key) out[key] = value;
  }

  return out;
}

function envValue(env, key) {
  return process.env[key] || env[key] || "";
}

function check(condition, label, failures, warningsOnly = false) {
  if (condition) {
    console.log(`✅ ${label}`);
  } else if (warningsOnly) {
    console.log(`⚠️ ${label}`);
  } else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

function getDraftApprovalState(draftJson) {
  const candidates = [
    draftJson?.review_status,
    draftJson?.approval_status,
    draftJson?.status,
    draftJson?.operator_review?.status,
    draftJson?.review?.status,
    draftJson?.draft_packet?.review_status,
    draftJson?.draft_packet?.approval_status,
    draftJson?.draft_packet?.status
  ]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);

  const approvedValues = new Set([
    "approved",
    "accepted",
    "ready",
    "ready_to_publish",
    "publish_ready",
    "approved_for_publish",
    "published"
  ]);

  const rejectedValues = new Set([
    "rejected",
    "declined",
    "blocked",
    "do_not_publish",
    "hold",
    "held",
    "on_hold",
    "needs_revision",
    "revise"
  ]);

  return {
    approved: candidates.some((value) => approvedValues.has(value)),
    rejected: candidates.some((value) => rejectedValues.has(value)),
    status: candidates[0] || "unknown"
  };
}

function findLatestDraftDate() {
  const dir = path.join(root, "generated", "drafts");
  if (!fs.existsSync(dir)) return "";

  const dates = fs.readdirSync(dir)
    .map((name) => name.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1])
    .filter(Boolean)
    .sort();

  return dates.at(-1) || "";
}

const failures = [];
const envLocal = loadEnvLocal();

const selectedDateArg = process.argv.find((arg) => arg.startsWith("--date="));
const selectedDate = selectedDateArg
  ? selectedDateArg.split("=", 2)[1]
  : latestDrafts
    ? findLatestDraftDate()
    : new Date().toISOString().slice(0, 10);

console.log("Drishvara live pipeline preflight");
console.log("");
console.log(`Date checked: ${selectedDate || "not available"}`);
console.log(`Require approved drafts: ${requireApproved ? "yes" : "no"}`);
console.log("");

check(exists("api/publish-all.js"), "api/publish-all.js exists", failures);
check(exists("services/pipeline/publish-all-core.js"), "publish-all-core.js exists", failures);
check(exists("scripts/publish-local-check.js"), "publish-local-check.js exists", failures);
check(exists("data/article-index.json"), "data/article-index.json exists", failures);
check(exists("data/homepage-ui.json"), "data/homepage-ui.json exists", failures);

const publishApi = read("api/publish-all.js");
const core = read("services/pipeline/publish-all-core.js");

check(publishApi.includes("dryRun"), "publish API supports dryRun", failures);
check(publishApi.includes("requireApproved"), "publish API supports requireApproved", failures);
check(publishApi.includes("PUBLISH_REQUIRE_CONFIRMATION"), "publish API supports strict confirmation env", failures);
check(core.includes("dryRun = false"), "publish core supports dryRun option", failures);
check(core.includes("requireApproved = false"), "publish core supports requireApproved option", failures);
check(core.includes("getDraftApprovalState"), "publish core checks draft approval state", failures);
check(core.includes("would_publish_to"), "publish core reports would_publish_to in dry-run", failures);
check(core.includes("refreshPublicDiscoveryData"), "publish core refreshes public discovery after live publish", failures);

check(Boolean(envValue(envLocal, "GITHUB_TOKEN")), "GITHUB_TOKEN configured", failures, true);
check(Boolean(envValue(envLocal, "GITHUB_OWNER")), "GITHUB_OWNER configured", failures, true);
check(Boolean(envValue(envLocal, "GITHUB_REPO")), "GITHUB_REPO configured", failures, true);
check(Boolean(envValue(envLocal, "GITHUB_BRANCH")), "GITHUB_BRANCH configured", failures, true);
check(Boolean(envValue(envLocal, "SUPABASE_URL")), "SUPABASE_URL configured", failures, true);
check(Boolean(envValue(envLocal, "SUPABASE_SECRET_KEY") || envValue(envLocal, "SUPABASE_SERVICE_ROLE_KEY")), "Supabase service key configured", failures, true);

const indexData = readJson("data/article-index.json");
check(Array.isArray(indexData.publicLatest), "article index has publicLatest", failures);
check((indexData.publicTotal || 0) > 0, "article index has publicTotal > 0", failures);
check(indexData.publicLatest.every((item) => item.source === "articles"), "publicLatest contains only published articles", failures);

if (!selectedDate) {
  failures.push("No generated draft date found");
  console.log("❌ No generated draft date found");
} else {
  console.log("");
  console.log("Draft checks:");

  for (const category of CATEGORIES) {
    const draftPath = `generated/drafts/${selectedDate}-${category}.json`;

    if (!exists(draftPath)) {
      console.log(`❌ ${draftPath} missing`);
      failures.push(`${draftPath} missing`);
      continue;
    }

    const draftJson = readJson(draftPath);
    const draftPacket = draftJson?.draft_packet;
    const approval = getDraftApprovalState(draftJson);

    check(Boolean(draftPacket), `${draftPath} has draft_packet`, failures);
    check(Boolean(draftPacket?.title), `${draftPath} has title`, failures);
    check(Boolean(draftPacket?.slug), `${draftPath} has slug`, failures);
    check(Boolean(draftPacket?.article_html), `${draftPath} has article_html`, failures);

    if (approval.rejected) {
      console.log(`❌ ${draftPath} is marked rejected/blocked`);
      failures.push(`${draftPath} is rejected`);
    } else if (requireApproved && !approval.approved) {
      console.log(`❌ ${draftPath} is not approved; status=${approval.status}`);
      failures.push(`${draftPath} is not approved`);
    } else {
      console.log(`✅ ${draftPath} approval status: ${approval.status}`);
    }
  }
}

console.log("");
console.log("Suggested dry-run endpoint after deployment:");
console.log(`/api/publish-all?date=${selectedDate}&dryRun=true&requireApproved=${requireApproved ? "true" : "false"}`);

console.log("");
console.log("Suggested live endpoint only after approval:");
console.log(`/api/publish-all?date=${selectedDate}&requireApproved=true&confirm=publish-approved-drafts`);

if (failures.length) {
  console.log("");
  console.log("Preflight failed:");
  for (const failure of failures) {
    console.log(`- ${failure}`);
  }
  process.exit(1);
}

console.log("");
console.log("Live pipeline preflight passed.");
