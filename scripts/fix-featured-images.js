import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const articleIndexPath = path.join(root, "data", "article-index.json");
const homepageUiPath = path.join(root, "data", "homepage-ui.json");

const THEME_FALLBACK_IMAGES = {
  "Public Programmes": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  "Media & Society": "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
  "World Affairs": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
  "Spirituality": "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=80",
  "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80"
};

function themeFallbackImage(tag) {
  return THEME_FALLBACK_IMAGES[String(tag || "").trim()] || "";
}


function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function normalizeImagePath(src, sourcePath = "") {
  const raw = String(src || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) return raw;
  if (raw.startsWith("/")) return raw.slice(1);

  const sourceParts = String(sourcePath || "").split("/");
  sourceParts.pop();

  const parts = [...sourceParts, ...raw.split("/")];
  const out = [];

  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      out.pop();
      continue;
    }
    out.push(part);
  }

  return out.join("/");
}

function isUsableImage(src) {
  const low = String(src || "").toLowerCase();
  if (!low) return false;
  if (low.includes("logo")) return false;
  if (low.includes("favicon")) return false;
  if (low.includes("/icon")) return false;
  if (low.includes("data:image")) return false;
  return true;
}

function extractFeaturedImageFromHtml(articlePath) {
  const file = path.join(root, articlePath);
  if (!fs.existsSync(file)) return "";

  const html = fs.readFileSync(file, "utf8");
  const matches = [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)];

  for (const match of matches) {
    const normalized = normalizeImagePath(match[1], articlePath);
    if (isUsableImage(normalized)) return normalized;
  }

  return "";
}

function enrichItem(item) {
  if (!item || item.source !== "articles") return item;

  const articlePath = item.path || item.sourcePath || item.directUrl || "";
  const extracted = extractFeaturedImageFromHtml(articlePath);
  const existing = isUsableImage(item.image) ? item.image : "";

  return {
    ...item,
    image: extracted || existing || themeFallbackImage(item.tag) || ""
  };
}

function archiveMap(items) {
  const byDate = {};

  for (const item of items) {
    byDate[item.date] ||= [];
    byDate[item.date].push({
      title: item.title,
      tag: item.tag,
      folder: item.folder,
      url: item.url,
      path: item.path,
      source: item.source
    });
  }

  return byDate;
}

const indexData = readJson(articleIndexPath);
const homepageUi = readJson(homepageUiPath);

const items = Array.isArray(indexData.items) ? indexData.items.map(enrichItem) : [];
const publishedItems = items.filter((item) => item.source === "articles");
const publicLatest = publishedItems.slice(0, 8);

indexData.items = items;
indexData.publishedItems = publishedItems;
indexData.publicLatest = publicLatest;
indexData.publicTotal = publishedItems.length;
indexData.byDate = archiveMap(items);
indexData.publicByDate = archiveMap(publishedItems);

homepageUi.featuredReads = publicLatest.slice(0, 4).map((item) => ({
  title: item.title,
  tag: item.tag,
  summary: item.summary,
  folder: item.folder,
  url: item.url,
  sourcePath: item.sourcePath,
  date: item.date,
  image: item.image || ""
}));

writeJson(articleIndexPath, indexData);
writeJson(homepageUiPath, homepageUi);

console.log("Featured read images refreshed:");
for (const item of homepageUi.featuredReads || []) {
  console.log(`- ${item.tag}: ${item.image || "NO IMAGE"} | ${item.title}`);
}
