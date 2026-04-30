import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

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

console.log("Drishvara SEO preflight");
console.log("");

check(fs.existsSync(path.join(root, "robots.txt")), "robots.txt exists", failures);
check(fs.existsSync(path.join(root, "sitemap.xml")), "sitemap.xml exists", failures);
check(fs.existsSync(path.join(root, "data/seo/site-metadata.json")), "site SEO metadata exists", failures);
check(fs.existsSync(path.join(root, "assets/js/seo-runtime.js")), "SEO runtime exists", failures);

const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const metadata = readJson("data/seo/site-metadata.json");
const seoRuntime = read("assets/js/seo-runtime.js");

check(robots.includes("Sitemap: https://www.drishvara.com/sitemap.xml"), "robots.txt points to sitemap", failures);
check(sitemap.includes("<urlset"), "sitemap has urlset", failures);
check(sitemap.includes("https://www.drishvara.com/"), "sitemap includes homepage", failures);
check(sitemap.includes("/articles/"), "sitemap includes article URLs", failures);
check(metadata.site_name === "Drishvara", "SEO metadata has site name", failures);
check(metadata.public_articles > 0, "SEO metadata counts public articles", failures);

for (const page of ["index.html", "insights.html", "about.html", "contact.html", "submissions.html", "article.html"]) {
  const html = read(page);
  check(html.includes('<link rel="canonical"'), `${page} has canonical link`, failures);
  check(html.includes('property="og:title"'), `${page} has Open Graph title`, failures);
  check(html.includes('name="twitter:card"'), `${page} has Twitter card`, failures);
}

check(seoRuntime.includes("window.DrishvaraSEO"), "SEO runtime exposes DrishvaraSEO helper", failures);
check(seoRuntime.includes("setPageMeta"), "SEO runtime can set page meta", failures);

const articleHtml = read("article.html");
check(articleHtml.includes("updateArticleSeo"), "Article reader updates SEO dynamically", failures);
check(articleHtml.includes('type: "article"'), "Article reader uses article OG type dynamically", failures);

console.log("");
console.log("SEO summary:");
console.log(`- Public articles in metadata: ${metadata.public_articles}`);
console.log("- robots.txt: ready");
console.log("- sitemap.xml: ready");
console.log("- core page meta: ready");
console.log("- article reader runtime SEO: ready");

if (failures.length) {
  console.log("");
  console.log("SEO preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("SEO preflight passed.");
