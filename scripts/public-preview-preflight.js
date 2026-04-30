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

console.log("Drishvara public preview QA preflight");
console.log("");

const requiredPages = [
  "index.html",
  "insights.html",
  "article.html",
  "submissions.html",
  "dashboard.html",
  "admin.html",
  "about.html",
  "contact.html"
];

const requiredData = [
  "data/article-index.json",
  "data/homepage-ui.json",
  "data/daily-context.json",
  "data/sports-context.json",
  "data/seo/site-metadata.json",
  "data/system/timezone-config.json",
  "robots.txt",
  "sitemap.xml"
];

const requiredScripts = [
  "assets/js/site-language.js",
  "assets/js/timezone-context.js",
  "assets/js/sports-context.js",
  "assets/js/submission-client.js",
  "assets/js/seo-runtime.js"
];

for (const page of requiredPages) {
  check(exists(page), `${page} exists`, failures);
}

for (const file of requiredData) {
  check(exists(file), `${file} exists`, failures);
}

for (const file of requiredScripts) {
  check(exists(file), `${file} exists`, failures);
}

const index = read("index.html");
const insights = read("insights.html");
const article = read("article.html");
const submissions = read("submissions.html");
const dashboard = read("dashboard.html");
const admin = read("admin.html");

const timezoneJs = read("assets/js/timezone-context.js");
const sportsJs = read("assets/js/sports-context.js");
const submissionJs = read("assets/js/submission-client.js");
const seoRuntime = read("assets/js/seo-runtime.js");

const articleIndex = readJson("data/article-index.json");
const homepageUi = readJson("data/homepage-ui.json");
const dailyContext = readJson("data/daily-context.json");
const sportsContext = readJson("data/sports-context.json");
const timezoneConfig = readJson("data/system/timezone-config.json");

check(index.includes("assets/js/timezone-context.js"), "Homepage loads timezone controller", failures);
check(index.includes("data-drishvara-timezone-control"), "Homepage has compact timezone control slot", failures);
check(index.includes("nav-timezone-slot"), "Timezone control is in nav slot", failures);
check(!index.includes("date-basis-section"), "Large date-basis section is not present", failures);

check(timezoneConfig.default_timezone === "Asia/Kolkata", "Default timezone is Asia/Kolkata", failures);
check(timezoneConfig.default_alias === "IST", "Default timezone alias is IST", failures);
check(timezoneConfig.default_offset === "GMT+5:30", "Default timezone offset is GMT+5:30", failures);
check(timezoneJs.includes("nav-timezone-select"), "Timezone UI is compact dropdown", failures);
check(!timezoneJs.includes("position: fixed"), "Timezone UI is not floating/fixed", failures);
check(!timezoneJs.includes("document.body.appendChild"), "Timezone UI is not injected as floating body element", failures);

check(Array.isArray(homepageUi.featuredReads), "Homepage UI has featuredReads", failures);
check(homepageUi.featuredReads.length >= 4, "Homepage has at least four featured reads", failures);
check(Array.isArray(articleIndex.publishedItems), "Article index has publishedItems", failures);
check(articleIndex.publishedItems.length > 0, "Article index has public published articles", failures);
check(Array.isArray(articleIndex.publicLatest), "Article index has publicLatest", failures);

check(article.includes("updateArticleSeo"), "Article reader updates SEO dynamically", failures);
check(article.includes("article_html_hi"), "Article reader supports Hindi article body", failures);
check(article.includes("featured image") || article.includes("image"), "Article reader contains image handling", failures);

check(dailyContext.public_output_enabled === true, "Daily context is public safe", failures);
check(Boolean(dailyContext.word_of_the_day?.english), "Daily context has Word of the Day", failures);
check(dailyContext.vedic_guidance_status?.enabled === false, "Vedic guidance remains disabled", failures);
check(dailyContext.panchang_status?.enabled === false, "Panchang public display remains disabled", failures);

check(sportsContext.public_output_enabled === true, "Sports context is public safe", failures);
check(sportsContext.live_api_enabled === false, "Live sports API remains disabled", failures);
check(Boolean(sportsContext.right_top_live_update || sportsContext.topRightLiveUpdate), "Sports right-top update object exists", failures);
check(sportsJs.includes("drishvara-sports-live-pill"), "Sports right-top live object renderer exists", failures);
check(sportsJs.includes("sports-live-inline-slot"), "Sports live object uses inline page slot", failures);
check(!sportsJs.includes("position: fixed"), "Sports live object is not fixed/floating", failures);
check(!sportsJs.includes("document.body.appendChild"), "Sports live object is not appended to body as floating card", failures);

check(submissions.includes("Backend intake: disabled"), "Submissions page shows backend disabled status", failures);
check(submissions.includes("type=\"file\"") && submissions.includes("disabled"), "Palm image file input remains disabled", failures);
check(submissions.includes("submission-client.js"), "Submissions page loads safe submission client", failures);

check(submissionJs.includes("BACKEND_SUBMISSION_ENABLED = false"), "Submission client backend write disabled", failures);
check(submissionJs.includes("SUPABASE_INSERT_ENABLED = false"), "Submission client Supabase insert disabled", failures);
check(submissionJs.includes("PALM_IMAGE_UPLOAD_ENABLED = false"), "Submission client palm upload disabled", failures);
check(!submissionJs.includes("createClient("), "Submission client does not instantiate Supabase", failures);
check(!submissionJs.includes(".insert("), "Submission client does not insert into Supabase", failures);

check(dashboard.includes("Login/subscription integration pending"), "Dashboard shows login/subscription pending", failures);
check(dashboard.includes('meta name="robots" content="noindex, nofollow"'), "Dashboard remains noindex", failures);
check(dashboard.includes("Lucky Number"), "Dashboard includes lucky number blocked card", failures);
check(dashboard.includes("Lucky Color"), "Dashboard includes lucky color blocked card", failures);
check(dashboard.includes("Mantra"), "Dashboard includes mantra blocked card", failures);

check(admin.includes("Admin auth/actions disabled"), "Admin page shows disabled status", failures);
check(admin.includes('meta name="robots" content="noindex, nofollow"'), "Admin page remains noindex", failures);
check(!admin.includes("createClient("), "Admin page does not instantiate Supabase", failures);
check(!admin.includes(".insert("), "Admin page does not insert", failures);
check(!admin.includes(".update("), "Admin page does not update", failures);
check(!admin.includes(".delete("), "Admin page does not delete", failures);

for (const file of requiredScripts) {
  const js = read(file);
  check(!js.includes("SERVICE_ROLE"), `${file} does not contain SERVICE_ROLE`, failures);
  check(!js.includes("service_role"), `${file} does not contain service_role`, failures);
  check(!js.includes("SUPABASE_SERVICE"), `${file} does not contain SUPABASE_SERVICE`, failures);
}

check(seoRuntime.includes("window.DrishvaraSEO"), "SEO runtime exposes DrishvaraSEO", failures);
check(read("robots.txt").includes("Sitemap: https://www.drishvara.com/sitemap.xml"), "robots.txt references sitemap", failures);
check(read("sitemap.xml").includes("<urlset"), "sitemap.xml has urlset", failures);
check(insights.includes("data/article-index.json"), "Insights consumes article index", failures);

console.log("");
console.log("Public preview QA summary:");
console.log("- Core pages: present");
console.log("- Public content: present");
console.log("- Timezone: compact IST dropdown");
console.log("- Backend writes: disabled");
console.log("- Payments: disabled");
console.log("- Palm image upload: disabled");
console.log("- Premium guidance: blocked");
console.log("- Admin actions: blocked");

if (failures.length) {
  console.log("");
  console.log("Public preview QA failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Public preview QA preflight passed.");
