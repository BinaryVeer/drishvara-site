import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const json = (file) => JSON.parse(read(file));

const failures = [];
function check(condition, label) {
  if (condition) console.log(`✅ ${label}`);
  else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

console.log("Drishvara bilingual content preflight");
console.log("");

const required = [
  "docs/native-bilingual-content-plan.md",
  "data/i18n/content-schema.json",
  "data/i18n/hindi-metadata-overrides.json",
  "data/i18n/hindi-article-body.json",
  "scripts/hindi-body-preflight.js",
  "scripts/apply-bilingual-metadata.js",
  "assets/js/site-language.js",
  "assets/js/drishvara-language-runtime.js",
  "article.html",
  "data/article-index.json",
  "data/homepage-ui.json"
];

for (const file of required) check(exists(file), `${file} exists`);

const controller = read("assets/js/site-language.js");
const runtime = read("assets/js/drishvara-language-runtime.js");

check(controller.includes("drishvara_language") || controller.includes("drishvara_site_language"), "Language controller persists selected language");
check(controller.includes("हिन्दी") || controller.includes("हिंदी"), "Language controller supports Hindi label");
check(!controller.includes("translate.google.com"), "Language controller avoids Google Translate redirect");
check(controller.includes("drishvara:language-change"), "Language controller emits language change event");
check(controller.includes("DrishvaraSiteLanguage") || runtime.includes("DrishvaraLanguageRuntime"), "Language controller exposes bilingual helper API");

check(runtime.includes("खेल डेस्क"), "Homepage sports UI has Hindi copy");
check(runtime.includes("पंचांग और पर्व दृश्य") || runtime.includes("स्थान-आधारित पंचांग"), "Homepage Panchang UI has Hindi copy");
check(runtime.includes("चयनित पठन") || runtime.includes("पठन सतह"), "Homepage reading surface has Hindi copy");

const schema = json("data/i18n/content-schema.json");
check(Boolean(schema.languages?.en), "Schema defines English");
check(Boolean(schema.languages?.hi), "Schema defines Hindi");
check(Boolean(schema.draft_packet_fields?.title_hi), "Schema defines title_hi");
check(Boolean(schema.draft_packet_fields?.summary_hi), "Schema defines summary_hi");
check(Boolean(schema.draft_packet_fields?.article_html_hi), "Schema defines article_html_hi");

const indexData = json("data/article-index.json");
const homepageUi = json("data/homepage-ui.json");

check(Array.isArray(indexData.publishedItems), "Article index has publishedItems");
check(Array.isArray(indexData.publicLatest), "Article index has publicLatest");
check(Array.isArray(homepageUi.featuredReads), "Homepage UI has featuredReads");

const articleReader = read("article.html");
const insights = exists("insights.html") ? read("insights.html") : "";
const indexHtml = exists("index.html") ? read("index.html") : "";

check(indexHtml.includes("title_hi") || runtime.includes("title_hi") || indexHtml.includes("featuredReads"), "Homepage supports bilingual title rendering");
check(indexHtml.includes("summary_hi") || runtime.includes("summary_hi") || indexHtml.includes("featuredReads"), "Homepage supports bilingual summary rendering");
check(insights.includes("title_hi") || insights.includes("summary_hi") || insights.includes("article-index"), "Insights supports bilingual title/summary rendering");
check(articleReader.includes("title_hi") || articleReader.includes("summary_hi"), "Article reader can resolve bilingual index metadata");
check(articleReader.includes("article_html_hi") || articleReader.includes("hindi-article-body"), "Article reader supports Hindi body fallback");

const overrides = json("data/i18n/hindi-metadata-overrides.json");
check(Array.isArray(overrides.items), "Hindi metadata overrides has items array");
check(overrides.items.length >= 4, "Hindi metadata overrides has enough seed entries");

const samplePublished = Array.isArray(indexData.publicLatest) ? indexData.publicLatest.slice(0, 5) : [];
const hasAnyHindiMetadata = samplePublished.some((item) => item.title_hi || item.summary_hi);
check(hasAnyHindiMetadata, "PublicLatest has Hindi title/summary metadata");

console.log("");
console.log("Current bilingual readiness:");
console.log(`- Public latest items checked: ${samplePublished.length}`);
console.log(`- Hindi metadata present now: ${hasAnyHindiMetadata ? "yes" : "no"}`);
console.log("- Article body translation: planned for later batch");

if (failures.length) {
  console.log("");
  console.log("Bilingual preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Bilingual content preflight passed.");
