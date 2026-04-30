import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const SITE_URL = "https://www.drishvara.com";

function readJson(file, fallback = {}) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return fallback;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content, "utf8");
}

function writeJson(file, data) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cleanUrl(url) {
  return url.replace(/([^:]\/)\/+/g, "$1");
}

const articleIndex = readJson("data/article-index.json", {});
const publicItems = Array.isArray(articleIndex.publishedItems)
  ? articleIndex.publishedItems
  : [];

const corePages = [
  { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "daily" },
  { loc: `${SITE_URL}/insights.html`, priority: "0.9", changefreq: "daily" },
  { loc: `${SITE_URL}/about.html`, priority: "0.7", changefreq: "monthly" },
  { loc: `${SITE_URL}/contact.html`, priority: "0.6", changefreq: "monthly" },
  { loc: `${SITE_URL}/submissions.html`, priority: "0.6", changefreq: "monthly" }
];

const articlePages = publicItems
  .filter((item) => item.source === "articles")
  .map((item) => ({
    loc: cleanUrl(`${SITE_URL}/${item.path || item.sourcePath || ""}`),
    priority: "0.8",
    changefreq: "weekly",
    lastmod: item.date || new Date().toISOString().slice(0, 10)
  }))
  .filter((item) => item.loc && !item.loc.endsWith("/"));

const urls = [...corePages, ...articlePages];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((item) => `  <url>
    <loc>${xmlEscape(item.loc)}</loc>
    ${item.lastmod ? `<lastmod>${xmlEscape(item.lastmod)}</lastmod>` : ""}
    <changefreq>${xmlEscape(item.changefreq)}</changefreq>
    <priority>${xmlEscape(item.priority)}</priority>
  </url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const metadata = {
  version: "2026.04.30-b19",
  site_name: "Drishvara",
  site_url: SITE_URL,
  default_title: "Drishvara · Civilizational Intelligence, Daily Reads and Reflective Guidance",
  default_description: "Drishvara is a founder-led insight platform for daily reads, civilizational reflection, bilingual articles, sports context, and guarded premium knowledge systems.",
  default_image: `${SITE_URL}/assets/logo/logo.png`,
  language: "en-IN",
  alternate_language: "hi-IN",
  robots: "index, follow",
  public_pages: corePages.length,
  public_articles: articlePages.length,
  generated_at: new Date().toISOString()
};

write("robots.txt", robots);
write("sitemap.xml", sitemap);
writeJson("data/seo/site-metadata.json", metadata);

console.log("SEO files generated:");
console.log("- robots.txt");
console.log("- sitemap.xml");
console.log("- data/seo/site-metadata.json");
console.log(`- URLs in sitemap: ${urls.length}`);
console.log(`- Public article URLs: ${articlePages.length}`);
