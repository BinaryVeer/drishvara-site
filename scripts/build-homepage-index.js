import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const outputPath = path.join(root, "data", "article-index.json");
const homepageUiPath = path.join(root, "data", "homepage-ui.json");

const SOURCE_DIRS = ["generated", "articles"];
const JSON_FILES = [
  "article.json",
  "published.json",
  "metadata.json",
  "meta.json",
  "content.json",
  "draft.json",
  "candidate.json",
  "summary.json"
];

const HTML_FILES = ["index.html", "article.html"];

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

function findArticleDirs(baseDir) {
  const files = walk(baseDir);
  const dirs = new Set();

  for (const file of files) {
    const base = path.basename(file);
    if (JSON_FILES.includes(base) || HTML_FILES.includes(base)) {
      dirs.add(path.dirname(file));
    }
  }

  return [...dirs];
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

function firstParagraphFromHtml(html) {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return "";
  return stripHtml(match[1]).trim();
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlMeta(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<img[^>]+src=["']([^"']+)["']/i);

  return {
    title: stripHtml(h1Match?.[1] || titleMatch?.[1] || ""),
    summary: stripHtml(descMatch?.[1] || firstParagraphFromHtml(html) || ""),
    image: imageMatch?.[1] || ""
  };
}

function unslugify(slug) {
  return String(slug || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizeDate(value, fallbackMs) {
  const raw = value || "";
  const parsed = raw ? new Date(raw) : new Date(fallbackMs);
  if (Number.isNaN(parsed.getTime())) return new Date(fallbackMs).toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function getFolderUrl(dir, htmlPath, source, folder) {
  if (htmlPath) {
    const rel = path.relative(root, htmlPath).split(path.sep).join("/");
    if (rel.endsWith("/index.html")) return rel.replace(/index\.html$/, "");
    return rel;
  }

  return `article.html?folder=${encodeURIComponent(folder)}&source=${encodeURIComponent(source)}`;
}

function pickJsonMetadata(dir) {
  for (const file of JSON_FILES) {
    const p = path.join(dir, file);
    if (exists(p)) {
      const json = readJsonSafe(p);
      if (json) return json;
    }
  }
  return null;
}

function pickHtmlMetadata(dir) {
  for (const file of HTML_FILES) {
    const p = path.join(dir, file);
    if (exists(p)) {
      return {
        path: p,
        ...htmlMeta(readTextSafe(p))
      };
    }
  }
  return {
    path: "",
    title: "",
    summary: "",
    image: ""
  };
}

function buildItem(dir, source) {
  const json = pickJsonMetadata(dir);
  const html = pickHtmlMetadata(dir);
  const stat = fs.statSync(dir);

  const relDir = path.relative(root, dir).split(path.sep).join("/");
  const folder = path.basename(dir);

  const title =
    findStringByKeys(json, ["title", "headline", "articleTitle", "name"]) ||
    html.title ||
    unslugify(folder);

  const summary =
    findStringByKeys(json, ["summary", "description", "dek", "excerpt", "intro"]) ||
    html.summary ||
    "A Drishvara article prepared for the daily reading surface.";

  const tag =
    findStringByKeys(json, ["tag", "category", "theme", "section"]) ||
    source;

  const date =
    normalizeDate(
      findStringByKeys(json, ["date", "publishedAt", "createdAt", "updatedAt"]),
      stat.mtimeMs
    );

  const image =
    findStringByKeys(json, ["image", "imageUrl", "coverImage", "thumbnail"]) ||
    html.image ||
    "";

  return {
    title,
    tag,
    summary,
    folder,
    source,
    sourcePath: relDir,
    url: getFolderUrl(dir, html.path, source, folder),
    date,
    image
  };
}

function uniqueByPath(items) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = item.sourcePath;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function buildIndex() {
  const items = [];

  for (const source of SOURCE_DIRS) {
    const baseDir = path.join(root, source);
    if (!exists(baseDir)) continue;

    const dirs = findArticleDirs(baseDir);
    for (const dir of dirs) {
      const item = buildItem(dir, source);
      if (item.title) items.push(item);
    }
  }

  const sorted = uniqueByPath(items).sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.title.localeCompare(b.title);
  });

  const byDate = {};
  const topics = {};

  for (const item of sorted) {
    byDate[item.date] ||= [];
    byDate[item.date].push({
      title: item.title,
      tag: item.tag,
      folder: item.folder,
      url: item.url
    });

    topics[item.tag] ||= 0;
    topics[item.tag] += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    total: sorted.length,
    latest: sorted.slice(0, 6),
    items: sorted,
    byDate,
    topics
  };
}

function updateHomepageUi(indexData) {
  if (!exists(homepageUiPath)) return;

  const ui = readJsonSafe(homepageUiPath) || {};
  const latest = indexData.latest || [];

  if (latest.length) {
    ui.featuredReads = latest.slice(0, 4).map((item) => ({
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
      items: latest.slice(0, 3).map((item, index) => {
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
  for (const item of indexData.latest.slice(0, 5)) {
    console.log(`- ${item.date} | ${item.tag} | ${item.title}`);
  }
}
