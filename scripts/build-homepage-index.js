import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const outputPath = path.join(root, "data", "article-index.json");
const homepageUiPath = path.join(root, "data", "homepage-ui.json");

const ARTICLE_DIR = path.join(root, "articles");
const GENERATED_DIR = path.join(root, "generated");

function exists(p) {
  return fs.existsSync(p);
}

function readTextSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function readJsonSafe(p) {
  try {
    return JSON.parse(readTextSafe(p));
  } catch {
    return null;
  }
}

function walk(dir) {
  if (!exists(dir)) return [];

  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (["node_modules", ".git", "archive"].includes(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }

  return out;
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function firstParagraphFromHtml(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const source = bodyMatch?.[1] || html;
  const match = source.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return "";
  return stripHtml(match[1]);
}

function htmlMeta(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const imageMatch =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<img[^>]+src=["']([^"']+)["']/i);

  return {
    title: stripHtml(h1Match?.[1] || titleMatch?.[1] || ""),
    summary: stripHtml(descMatch?.[1] || firstParagraphFromHtml(html) || ""),
    image: imageMatch?.[1] || ""
  };
}

function unslugify(slug) {
  return String(slug || "")
    .replace(/\.html$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizeTag(value) {
  const raw = String(value || "").trim();
  const map = {
    media: "Media & Society",
    policy: "Public Programmes",
    spiritual: "Spirituality",
    sports: "Sports",
    world: "World Affairs",
    daily: "Daily Candidate",
    drafts: "Draft",
    "daily-context": "Daily Context"
  };

  return map[raw] || unslugify(raw || "Drishvara");
}

function normalizeDate(value, fallbackMs) {
  const raw = value || "";
  const parsed = raw ? new Date(raw) : new Date(fallbackMs);
  if (Number.isNaN(parsed.getTime())) return new Date(fallbackMs).toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function findStringByKeys(obj, keys) {
  if (!obj || typeof obj !== "object") return "";

  for (const key of keys) {
    if (typeof obj[key] === "string" && obj[key].trim()) {
      return obj[key].trim();
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const found = findStringByKeys(value, keys);
      if (found) return found;
    }
  }

  return "";
}

function makeArticleItemFromHtml(file) {
  const html = readTextSafe(file);
  const meta = htmlMeta(html);
  const stat = fs.statSync(file);

  const relPath = path.relative(root, file).split(path.sep).join("/");
  const relFromArticles = path.relative(ARTICLE_DIR, file).split(path.sep);
  const section = relFromArticles[0] || "articles";
  const filename = path.basename(file);
  const slug = filename.replace(/\.html$/i, "");

  const title = meta.title || unslugify(slug);
  const summary = meta.summary || "A Drishvara article prepared for the daily reading surface.";

  return {
    title,
    tag: normalizeTag(section),
    summary,
    folder: slug,
    source: "articles",
    sourcePath: relPath,
    path: relPath,
    url: `article.html?path=${encodeURIComponent(relPath)}`,
    directUrl: relPath,
    date: normalizeDate("", stat.mtimeMs),
    image: meta.image
  };
}

function makeGeneratedJsonItem(file) {
  const json = readJsonSafe(file);
  if (!json) return null;

  const stat = fs.statSync(file);
  const relPath = path.relative(root, file).split(path.sep).join("/");
  const relParts = path.relative(GENERATED_DIR, file).split(path.sep);
  const section = relParts[0] || "generated";
  const filename = path.basename(file);
  const slug = filename.replace(/\.(json|md|html)$/i, "");

  const title =
    findStringByKeys(json, ["title", "headline", "articleTitle", "name"]) ||
    unslugify(slug);

  const summary =
    findStringByKeys(json, ["summary", "description", "dek", "excerpt", "intro"]) ||
    "A generated Drishvara draft or candidate from the content pipeline.";

  const date =
    findStringByKeys(json, ["date", "publishedAt", "createdAt", "updatedAt"]) ||
    slug.match(/\d{4}-\d{2}-\d{2}/)?.[0] ||
    "";

  return {
    title,
    tag: normalizeTag(section),
    summary,
    folder: slug,
    source: "generated",
    sourcePath: relPath,
    path: relPath,
    url: `article.html?path=${encodeURIComponent(relPath)}`,
    directUrl: relPath,
    date: normalizeDate(date, stat.mtimeMs),
    image: findStringByKeys(json, ["image", "imageUrl", "coverImage", "thumbnail"])
  };
}

function buildIndex() {
  const items = [];

  for (const file of walk(ARTICLE_DIR)) {
    if (file.endsWith(".html")) {
      items.push(makeArticleItemFromHtml(file));
    }
  }

  for (const file of walk(GENERATED_DIR)) {
    if (file.endsWith(".json")) {
      const item = makeGeneratedJsonItem(file);
      if (item) items.push(item);
    }
  }

  const sorted = items
    .filter((item) => item && item.title)
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.title.localeCompare(b.title);
    });

  const publishedItems = sorted.filter((item) => item.source === "articles");
  const publicLatest = publishedItems.slice(0, 8);

  const byDate = {};
  const publicByDate = {};
  const topics = {};
  const publicTopics = {};

  for (const item of sorted) {
    byDate[item.date] ||= [];
    byDate[item.date].push({
      title: item.title,
      tag: item.tag,
      folder: item.folder,
      url: item.url,
      path: item.path,
      source: item.source
    });

    topics[item.tag] ||= 0;
    topics[item.tag] += 1;
  }

  for (const item of publishedItems) {
    publicByDate[item.date] ||= [];
    publicByDate[item.date].push({
      title: item.title,
      tag: item.tag,
      folder: item.folder,
      url: item.url,
      path: item.path,
      source: item.source
    });

    publicTopics[item.tag] ||= 0;
    publicTopics[item.tag] += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    total: sorted.length,
    publicTotal: publishedItems.length,
    latest: sorted.slice(0, 8),
    publicLatest,
    items: sorted,
    publishedItems,
    byDate,
    publicByDate,
    topics,
    publicTopics
  };
}

function updateHomepageUi(indexData) {
  if (!exists(homepageUiPath)) return;

  const ui = readJsonSafe(homepageUiPath) || {};
  const latest = indexData.latest || [];
  const publicLatest = indexData.publicLatest || [];
  const publishedItems = indexData.publishedItems || [];
  const source = publicLatest.length ? publicLatest : publishedItems.length ? publishedItems.slice(0, 4) : latest;

  if (source.length) {
    ui.featuredReads = source.slice(0, 4).map((item) => ({
      title: item.title,
      tag: item.tag,
      summary: item.summary,
      folder: item.folder,
      url: item.url,
      sourcePath: item.sourcePath,
      date: item.date
    }));

    ui.readingGuide = {
      ...(ui.readingGuide || {}),
      title: "Today’s Reading Guide",
      intro: "A short guided path through the latest indexed Drishvara reads.",
      items: source.slice(0, 3).map((item, index) => {
        const lead = ["Start with", "Then move to", "End with"][index] || "Read";
        return `${lead} “${item.title}”.`;
      })
    };

    ui.openDay = {
      ...(ui.openDay || {}),
      title: "Open a Day in Drishvara",
      subtitle: `Explore ${indexData.total} indexed reads by date and theme.`
    };
  }

  fs.writeFileSync(homepageUiPath, JSON.stringify(ui, null, 2) + "\n", "utf8");
}

const indexData = buildIndex();

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(indexData, null, 2) + "\n", "utf8");
updateHomepageUi(indexData);

console.log(`Article index written: ${path.relative(root, outputPath)}`);
console.log(`Indexed articles: ${indexData.total}`);
if (indexData.latest.length) {
  console.log("Latest:");
  for (const item of indexData.latest.slice(0, 8)) {
    console.log(`- ${item.date} | ${item.tag} | ${item.title}`);
  }
}
