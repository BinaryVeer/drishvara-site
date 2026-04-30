import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const overridePath = path.join(root, "data", "i18n", "hindi-metadata-overrides.json");
const articleIndexPath = path.join(root, "data", "article-index.json");
const homepageUiPath = path.join(root, "data", "homepage-ui.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function buildOverrideMap(overrides) {
  const map = new Map();

  for (const item of overrides.items || []) {
    if (item.match_title) {
      map.set(normalize(item.match_title), item);
    }
  }

  return map;
}

function enrichItem(item, overrideMap) {
  if (!item || typeof item !== "object") return item;

  const match = overrideMap.get(normalize(item.title));

  if (!match) return item;

  return {
    ...item,
    title_hi: item.title_hi || match.title_hi || "",
    summary_hi: item.summary_hi || match.summary_hi || ""
  };
}

function enrichList(list, overrideMap) {
  return Array.isArray(list) ? list.map((item) => enrichItem(item, overrideMap)) : list;
}

function enrichArchiveMap(map, overrideMap) {
  if (!map || typeof map !== "object") return map;

  const out = {};

  for (const [date, items] of Object.entries(map)) {
    out[date] = enrichList(items, overrideMap);
  }

  return out;
}

const overrides = readJson(overridePath);
const overrideMap = buildOverrideMap(overrides);

const articleIndex = readJson(articleIndexPath);
const homepageUi = readJson(homepageUiPath);

articleIndex.latest = enrichList(articleIndex.latest, overrideMap);
articleIndex.publicLatest = enrichList(articleIndex.publicLatest, overrideMap);
articleIndex.items = enrichList(articleIndex.items, overrideMap);
articleIndex.publishedItems = enrichList(articleIndex.publishedItems, overrideMap);
articleIndex.byDate = enrichArchiveMap(articleIndex.byDate, overrideMap);
articleIndex.publicByDate = enrichArchiveMap(articleIndex.publicByDate, overrideMap);

homepageUi.featuredReads = enrichList(homepageUi.featuredReads, overrideMap);

if (homepageUi.readingGuide?.items && Array.isArray(articleIndex.publicLatest)) {
  const hindiReady = articleIndex.publicLatest
    .filter((item) => item.title_hi)
    .slice(0, 3);

  if (hindiReady.length) {
    homepageUi.readingGuide.items_hi = hindiReady.map((item, index) => {
      const lead = ["पहले पढ़ें", "फिर आगे बढ़ें", "अंत में पढ़ें"][index] || "पढ़ें";
      return `${lead} “${item.title_hi}”.`;
    });
  }
}

writeJson(articleIndexPath, articleIndex);
writeJson(homepageUiPath, homepageUi);

const enriched = (articleIndex.publicLatest || []).filter((item) => item.title_hi || item.summary_hi);

console.log("Applied bilingual metadata overrides.");
console.log(`- Override entries: ${overrideMap.size}`);
console.log(`- publicLatest Hindi-ready items: ${enriched.length}`);

for (const item of enriched.slice(0, 8)) {
  console.log(`- ${item.tag}: ${item.title_hi}`);
}
