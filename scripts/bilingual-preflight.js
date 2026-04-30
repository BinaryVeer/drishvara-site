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

console.log("Drishvara bilingual content preflight");
console.log("");

check(exists("docs/native-bilingual-content-plan.md"), "Native bilingual content plan exists", failures);
check(exists("data/i18n/content-schema.json"), "Bilingual content schema exists", failures);
check(exists("assets/js/site-language.js"), "Native site language controller exists", failures);
check(exists("article.html"), "Article reader exists", failures);
check(exists("data/article-index.json"), "Article index exists", failures);
check(exists("data/homepage-ui.json"), "Homepage UI data exists", failures);

const languageJs = read("assets/js/site-language.js");
check(languageJs.includes("drishvara_site_language"), "Language controller persists selected language", failures);
check(languageJs.includes("हिन्दी") || languageJs.includes("हिंदी"), "Language controller supports Hindi label", failures);
check(!languageJs.includes("translate.google.com"), "Language controller avoids Google Translate redirect", failures);

const schema = readJson("data/i18n/content-schema.json");
check(Boolean(schema.languages?.en), "Schema defines English", failures);
check(Boolean(schema.languages?.hi), "Schema defines Hindi", failures);
check(Boolean(schema.draft_packet_fields?.title_hi), "Schema defines title_hi", failures);
check(Boolean(schema.draft_packet_fields?.summary_hi), "Schema defines summary_hi", failures);
check(Boolean(schema.draft_packet_fields?.article_html_hi), "Schema defines article_html_hi", failures);

const indexData = readJson("data/article-index.json");
const homepageUi = readJson("data/homepage-ui.json");

check(Array.isArray(indexData.publishedItems), "Article index has publishedItems", failures);
check(Array.isArray(indexData.publicLatest), "Article index has publicLatest", failures);
check(Array.isArray(homepageUi.featuredReads), "Homepage UI has featuredReads", failures);

const samplePublished = Array.isArray(indexData.publicLatest) ? indexData.publicLatest.slice(0, 5) : [];
const hasAnyHindiMetadata = samplePublished.some((item) => item.title_hi || item.summary_hi);

check(
  hasAnyHindiMetadata,
  "No publicLatest items have Hindi title/summary metadata yet",
  failures,
  true
);

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
