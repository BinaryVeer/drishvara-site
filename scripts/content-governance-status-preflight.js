import fs from "node:fs";
import path from "node:path";

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

console.log("Drishvara content governance status matrix preflight");
console.log("");

const files = {
  plan: "docs/content/content-governance-status-matrix-plan.md",
  registry: "data/content/quality/content-governance-status-matrix.json",
  report: "data/content/reports/content-governance-status-matrix.json",
  articleIndex: "data/article-index.json",
  homepageUi: "data/homepage-ui.json",
  sitemap: "sitemap.xml",
  seoMetadata: "data/seo/site-metadata.json",
  packageJson: "package.json"
};

Object.values(files).forEach((file) => check(exists(file), `${file} exists`, failures));

const plan = read(files.plan);
const registry = readJson(files.registry);
const report = readJson(files.report);
const articleIndex = readJson(files.articleIndex);
const homepageUi = readJson(files.homepageUi);
const packageJson = readJson(files.packageJson);

const stageConfigs = [
  {
    stage: "C01",
    registry: "data/content/quality/public-read-link-image-integrity.json",
    script: "scripts/public-read-integrity-preflight.js",
    npm: "content:public-read-integrity:preflight"
  },
  {
    stage: "C02",
    registry: "data/content/quality/editorial-selection-featured-read-governance.json",
    script: "scripts/editorial-selection-governance-preflight.js",
    npm: "content:editorial-selection:preflight"
  },
  {
    stage: "C03",
    registry: "data/content/quality/featured-read-override-selection-memory.json",
    script: "scripts/featured-read-override-memory-preflight.js",
    npm: "content:featured-override-memory:preflight"
  },
  {
    stage: "C04",
    registry: "data/content/quality/featured-read-scoring-rotation-preview.json",
    script: "scripts/featured-read-scoring-rotation-preflight.js",
    npm: "content:featured-scoring-rotation:preflight"
  },
  {
    stage: "C05",
    registry: "data/content/quality/image-registry-source-governance.json",
    script: "scripts/image-registry-governance-preflight.js",
    npm: "content:image-governance:preflight"
  },
  {
    stage: "C06",
    registry: "data/content/quality/article-url-slug-sitemap-governance.json",
    script: "scripts/article-url-sitemap-governance-preflight.js",
    npm: "content:url-sitemap-governance:preflight"
  },
  {
    stage: "C07",
    registry: "data/content/quality/article-quality-metadata-review.json",
    script: "scripts/article-quality-review-preflight.js",
    npm: "content:article-quality:preflight"
  },
  {
    stage: "C08",
    registry: "data/content/quality/article-quality-report-preview.json",
    script: "scripts/article-quality-report-preview-preflight.js",
    npm: "content:article-quality-report:preflight"
  }
];

check(registry.status === "preflight_only", "C09 registry is preflight-only", failures);
check(registry.consolidated_only === true, "C09 is consolidation-only", failures);
check(registry.live_mutation_enabled === false, "C09 keeps live mutation disabled", failures);
check(registry.external_api_fetch_enabled === false, "C09 blocks external API fetch", failures);
check(registry.live_supabase_article_read_enabled === false, "C09 blocks live Supabase article reads", failures);
check(registry.admin_review_enabled === false, "C09 keeps admin review disabled", failures);
check(registry.payment_enabled === false, "C09 keeps payment disabled", failures);
check(registry.premium_guidance_enabled === false, "C09 keeps premium guidance disabled", failures);

check(registry.blocked_in_this_stage.includes("article_content_mutation"), "C09 blocks article content mutation", failures);
check(registry.blocked_in_this_stage.includes("homepage_mutation"), "C09 blocks homepage mutation", failures);
check(registry.blocked_in_this_stage.includes("sitemap_mutation"), "C09 blocks sitemap mutation", failures);
check(registry.blocked_in_this_stage.includes("review_queue_write"), "C09 blocks review queue writes", failures);
check(registry.blocked_in_this_stage.includes("external_api_fetch"), "C09 blocks external API fetch explicitly", failures);
check(registry.blocked_in_this_stage.includes("live_supabase_article_read"), "C09 blocks live Supabase article read", failures);

check(plan.includes("C01 — Public read link and image integrity checker"), "Plan lists C01", failures);
check(plan.includes("C08 — Read-only article quality report preview"), "Plan lists C08", failures);
check(plan.includes("does not mutate articles"), "Plan blocks article mutation", failures);
check(plan.includes("does not mutate articles, homepage featured reads, sitemap, images, review queues"), "Plan blocks core content mutation", failures);

check(report.read_only === true, "Status matrix report is read-only", failures);
check(report.stage_count === 8, "Status matrix covers 8 stages", failures);
check(Array.isArray(report.stages), "Status matrix has stages array", failures);
check(report.stages.length === 8, "Status matrix stage array has 8 entries", failures);
check(report.summary.article_mutation_enabled === false, "Report blocks article mutation", failures);
check(report.summary.homepage_mutation_enabled === false, "Report blocks homepage mutation", failures);
check(report.summary.sitemap_mutation_enabled === false, "Report blocks sitemap mutation", failures);
check(report.summary.external_api_fetch_enabled === false, "Report blocks external API fetch", failures);
check(report.summary.live_supabase_article_read_enabled === false, "Report blocks Supabase article reads", failures);
check(report.summary.admin_review_enabled === false, "Report blocks admin review", failures);

for (const stage of stageConfigs) {
  check(exists(stage.registry), `${stage.stage} registry exists`, failures);
  check(exists(stage.script), `${stage.stage} preflight script exists`, failures);

  const stageRegistry = readJson(stage.registry);
  check(stageRegistry.status === "preflight_only", `${stage.stage} registry remains preflight-only`, failures);

  const matrixEntry = report.stages.find((item) => item.stage === stage.stage);
  check(Boolean(matrixEntry), `${stage.stage} appears in status matrix`, failures);
  check(matrixEntry?.registry === stage.registry, `${stage.stage} matrix registry path matches`, failures);
  check(matrixEntry?.mutation_enabled === false, `${stage.stage} matrix keeps mutation disabled`, failures);

  check(Boolean(packageJson.scripts?.[stage.npm]), `${stage.stage} npm preflight script exists`, failures);
}

check(Boolean(packageJson.scripts?.["content:preflight"]), "content:preflight exists", failures);
check(
  packageJson.scripts["content:preflight"].includes("content:governance-status:preflight"),
  "content:preflight includes C09 governance status preflight",
  failures
);

const publicLatest = Array.isArray(articleIndex.publicLatest) ? articleIndex.publicLatest : [];
const publishedItems = Array.isArray(articleIndex.publishedItems) ? articleIndex.publishedItems : [];
const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];

check(publishedItems.length > 0, "Article index has published items", failures);
check(publicLatest.length >= 4, "Article index has publicLatest sample", failures);
check(featuredReads.length >= 4, "Homepage has featured reads", failures);

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
console.log("Content governance status matrix summary:");
console.log(`- Covered stages: ${report.stage_count}`);
console.log(`- Published items: ${publishedItems.length}`);
console.log(`- Public latest: ${publicLatest.length}`);
console.log(`- Homepage featured reads: ${featuredReads.length}`);
console.log(`- Article mutation enabled: ${report.summary.article_mutation_enabled}`);
console.log(`- Homepage mutation enabled: ${report.summary.homepage_mutation_enabled}`);
console.log(`- External API fetch enabled: ${report.summary.external_api_fetch_enabled}`);
console.log(`- Live Supabase article read enabled: ${report.summary.live_supabase_article_read_enabled}`);
console.log("- C09 mode: consolidation-only");

if (failures.length) {
  console.log("");
  console.log("Content governance status matrix preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Content governance status matrix preflight passed.");
