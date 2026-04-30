import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function json(file) {
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

console.log("Drishvara publish pipeline local check");
console.log("");

const corePath = "services/pipeline/publish-all-core.js";
const core = read(corePath);
const indexData = json("data/article-index.json");
const homepageUi = json("data/homepage-ui.json");

check(core.includes("ARTICLE_INDEX_PATH"), "publish core knows data/article-index.json", failures);
check(core.includes("HOMEPAGE_UI_PATH"), "publish core knows data/homepage-ui.json", failures);
check(core.includes("refreshPublicDiscoveryData"), "publish core refreshes public discovery data", failures);
check(core.includes("publishedItems.push(makePublishedIndexItem"), "publish core tracks successful published articles", failures);
check(core.includes("public_discovery_refresh"), "publish core reports public discovery refresh", failures);
check(core.includes("assertPublicIndexSafe"), "publish core validates public index safety", failures);

check(Array.isArray(indexData.items), "article-index has items", failures);
check(Array.isArray(indexData.publishedItems), "article-index has publishedItems", failures);
check(Array.isArray(indexData.publicLatest), "article-index has publicLatest", failures);
check((indexData.publicTotal || 0) > 0, "article-index has publicTotal > 0", failures);
check(indexData.publicLatest.every((item) => item.source === "articles"), "publicLatest contains only published article source", failures);

const blockedTags = new Set(["Draft", "Plans", "Signals", "Daily Candidate", "Daily Context", "Sports Context", "Homepage"]);
const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];
check(featuredReads.length > 0, "homepage-ui has featuredReads", failures);
check(featuredReads.every((item) => !blockedTags.has(item.tag)), "homepage featuredReads excludes pipeline-only tags", failures);

console.log("");
console.log("Summary:");
console.log(`- Indexed items: ${indexData.total}`);
console.log(`- Published public items: ${indexData.publicTotal}`);
console.log(`- publicLatest: ${indexData.publicLatest.length}`);
console.log(`- homepage featuredReads: ${featuredReads.length}`);

if (failures.length) {
  console.log("");
  console.log("Publish local check failed:");
  for (const failure of failures) {
    console.log(`- ${failure}`);
  }
  process.exit(1);
}

console.log("");
console.log("Publish local check passed.");
