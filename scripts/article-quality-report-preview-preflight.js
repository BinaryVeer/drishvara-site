import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

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

console.log("Drishvara article quality report preview preflight");
console.log("");

const files = {
  plan: "docs/content/article-quality-report-preview-plan.md",
  quality: "data/content/quality/article-quality-report-preview.json",
  report: "data/content/reports/article-quality-report-preview.json",
  builder: "scripts/build-article-quality-report-preview.js",
  c01: "data/content/quality/public-read-link-image-integrity.json",
  c02: "data/content/quality/editorial-selection-featured-read-governance.json",
  c03: "data/content/quality/featured-read-override-selection-memory.json",
  c04: "data/content/quality/featured-read-scoring-rotation-preview.json",
  c05: "data/content/quality/image-registry-source-governance.json",
  c06: "data/content/quality/article-url-slug-sitemap-governance.json",
  c07: "data/content/quality/article-quality-metadata-review.json",
  articleIndex: "data/article-index.json",
  homepageUi: "data/homepage-ui.json"
};

Object.values(files).forEach((file) => check(exists(file), `${file} exists`, failures));

const quality = readJson(files.quality);
const c01 = readJson(files.c01);
const c02 = readJson(files.c02);
const c03 = readJson(files.c03);
const c04 = readJson(files.c04);
const c05 = readJson(files.c05);
const c06 = readJson(files.c06);
const c07 = readJson(files.c07);
const plan = read(files.plan);
const builder = read(files.builder);

check(quality.status === "preflight_only", "C08 quality registry is preflight-only", failures);
check(quality.report_generation_enabled === true, "C08 allows read-only report generation", failures);
check(quality.report_is_read_only === true, "C08 report is read-only", failures);
check(quality.article_mutation_enabled === false, "C08 blocks article mutation", failures);
check(quality.homepage_mutation_enabled === false, "C08 blocks homepage mutation", failures);
check(quality.review_queue_write_enabled === false, "C08 blocks review queue write", failures);
check(quality.admin_review_enabled === false, "C08 keeps admin review disabled", failures);
check(quality.external_api_fetch_enabled === false, "C08 blocks external API fetch", failures);
check(quality.live_supabase_read_enabled === false, "C08 blocks live Supabase reads", failures);

check(quality.blocked_in_this_stage.includes("article_content_mutation"), "C08 blocks article content mutation", failures);
check(quality.blocked_in_this_stage.includes("homepage_mutation"), "C08 blocks homepage mutation explicitly", failures);
check(quality.blocked_in_this_stage.includes("review_queue_write"), "C08 blocks review queue write explicitly", failures);
check(quality.blocked_in_this_stage.includes("external_api_fetch"), "C08 blocks external API fetch explicitly", failures);
check(quality.blocked_in_this_stage.includes("live_supabase_article_read"), "C08 blocks live Supabase article read", failures);

check(c01.status === "preflight_only", "C01 remains preflight-only", failures);
check(c02.status === "preflight_only", "C02 remains preflight-only", failures);
check(c03.status === "preflight_only", "C03 remains preflight-only", failures);
check(c04.status === "preflight_only", "C04 remains preflight-only", failures);
check(c05.status === "preflight_only", "C05 remains preflight-only", failures);
check(c06.status === "preflight_only", "C06 remains preflight-only", failures);
check(c07.status === "preflight_only", "C07 remains preflight-only", failures);

check(plan.includes("read-only article quality report preview"), "Plan defines read-only quality report", failures);
check(plan.includes("does not mutate article content"), "Plan blocks article mutation", failures);
check(plan.includes("does not mutate article content, homepage featured reads, sitemap, review queues, or editorial metadata"), "Plan blocks content and queue mutation", failures);

check(builder.includes("data/article-index.json"), "Builder reads article index", failures);
check(builder.includes("data/homepage-ui.json"), "Builder reads homepage UI", failures);
check(builder.includes("data/content/reports/article-quality-report-preview.json"), "Builder writes report path", failures);
check(builder.includes("read_only: true"), "Builder marks report read-only", failures);
check(builder.includes("article_mutation_enabled: false"), "Builder keeps article mutation disabled", failures);
check(builder.includes("homepage_mutation_enabled: false"), "Builder keeps homepage mutation disabled", failures);
check(!builder.includes("fetch("), "Builder does not fetch external APIs", failures);
check(!builder.includes("createClient("), "Builder does not instantiate Supabase client", failures);
check(!builder.includes("supabase.auth"), "Builder does not call Supabase auth", failures);

const run = spawnSync("node", ["scripts/build-article-quality-report-preview.js"], {
  cwd: root,
  stdio: "pipe",
  encoding: "utf8"
});

check(run.status === 0, "Report builder runs successfully", failures);

const report = readJson(files.report);
const articleIndex = readJson(files.articleIndex);
const homepageUi = readJson(files.homepageUi);

const publicLatest = Array.isArray(articleIndex.publicLatest) ? articleIndex.publicLatest : [];
const publishedItems = Array.isArray(articleIndex.publishedItems) ? articleIndex.publishedItems : [];
const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];

check(report.status === "generated", "Report status is generated", failures);
check(report.read_only === true, "Report is marked read-only", failures);
check(report.guardrails.article_mutation_enabled === false, "Report guardrail blocks article mutation", failures);
check(report.guardrails.homepage_mutation_enabled === false, "Report guardrail blocks homepage mutation", failures);
check(report.guardrails.review_queue_write_enabled === false, "Report guardrail blocks review queue write", failures);
check(report.guardrails.external_api_fetch_enabled === false, "Report guardrail blocks external API fetch", failures);
check(report.guardrails.live_supabase_read_enabled === false, "Report guardrail blocks live Supabase read", failures);

check(report.summary.published_items === publishedItems.length, "Report records published item count", failures);
check(report.summary.public_latest_items === publicLatest.length, "Report records public latest count", failures);
check(report.summary.featured_reads === featuredReads.length, "Report records featured read count", failures);
check(report.summary.checked_items >= 8, "Report checks at least eight items", failures);
check(report.summary.items_with_title >= 8, "Report confirms titles for checked items", failures);
check(report.summary.items_with_summary >= 8, "Report confirms summaries for checked items", failures);
check(report.summary.items_with_path_or_url >= 8, "Report confirms paths/URLs for checked items", failures);
check(report.summary.items_with_safe_url >= 8, "Report confirms safe URLs for checked items", failures);
check(report.summary.items_with_image >= 8, "Report confirms images for checked items", failures);
check(report.summary.items_with_hindi_metadata >= 8, "Report confirms Hindi metadata for checked items", failures);
check(report.summary.pipeline_only_items === 0, "Report confirms no pipeline-only checked items", failures);

check(Array.isArray(report.featured_read_checks), "Report has featured read checks array", failures);
check(Array.isArray(report.public_latest_checks), "Report has public latest checks array", failures);
check(report.featured_read_checks.length >= 4, "Report checks at least four featured reads", failures);
check(report.public_latest_checks.length >= 4, "Report checks at least four public latest reads", failures);

for (const file of [
  "assets/js/site-language.js",
  "assets/js/seo-runtime.js",
  "assets/js/sports-context.js",
  "assets/js/submission-client.js",
  "assets/js/auth-client.js",
  "assets/js/session-guard.js"
]) {
  if (!exists(file)) continue;
  const js = read(file);
  check(!js.includes("SERVICE_ROLE"), `${file} does not expose SERVICE_ROLE`, failures);
  check(!js.includes("SUPABASE_SERVICE"), `${file} does not expose SUPABASE_SERVICE`, failures);
  check(!js.includes("SUPABASE_SECRET"), `${file} does not expose SUPABASE_SECRET`, failures);
}

console.log("");
console.log("Article quality report preview summary:");
console.log(`- Published items: ${report.summary.published_items}`);
console.log(`- Public latest items: ${report.summary.public_latest_items}`);
console.log(`- Featured reads: ${report.summary.featured_reads}`);
console.log(`- Checked items: ${report.summary.checked_items}`);
console.log(`- Hindi-ready checked items: ${report.summary.items_with_hindi_metadata}`);
console.log(`- Pipeline-only checked items: ${report.summary.pipeline_only_items}`);
console.log("- Report mode: read-only");
console.log("- Article/homepage mutation: blocked");

if (failures.length) {
  console.log("");
  console.log("Article quality report preview preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Article quality report preview preflight passed.");
