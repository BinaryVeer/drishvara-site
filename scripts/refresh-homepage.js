import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function rel(p) {
  return path.relative(root, p).split(path.sep).join("/");
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function readJson(file) {
  return JSON.parse(readText(file));
}

function exists(file) {
  return fs.existsSync(file);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

function check(condition, label, failures) {
  if (condition) {
    console.log(`✅ ${label}`);
  } else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

console.log("Drishvara homepage refresh started.");
console.log("");

console.log("Step 1: Rebuilding article index...");
run("node", ["scripts/build-homepage-index.js"]);

console.log("");
console.log("Step 2: Running homepage readiness checks...");

const failures = [];

const indexHtmlPath = path.join(root, "index.html");
const homepageUiPath = path.join(root, "data", "homepage-ui.json");
const articleIndexPath = path.join(root, "data", "article-index.json");
const packagePath = path.join(root, "package.json");

check(exists(indexHtmlPath), "index.html exists", failures);
check(exists(homepageUiPath), "data/homepage-ui.json exists", failures);
check(exists(articleIndexPath), "data/article-index.json exists", failures);
check(exists(packagePath), "package.json exists", failures);

let indexHtml = "";
let homepageUi = {};
let articleIndex = {};
let pkg = {};

try {
  indexHtml = readText(indexHtmlPath);
} catch {
  failures.push("Unable to read index.html");
}

try {
  homepageUi = readJson(homepageUiPath);
} catch {
  failures.push("Unable to parse data/homepage-ui.json");
}

try {
  articleIndex = readJson(articleIndexPath);
} catch {
  failures.push("Unable to parse data/article-index.json");
}

try {
  pkg = readJson(packagePath);
} catch {
  failures.push("Unable to parse package.json");
}

check(indexHtml.includes("article-index-card"), "Homepage has Indexed Reads card", failures);
check(indexHtml.includes("loadArticleIndex();"), "Homepage calls loadArticleIndex()", failures);
check(indexHtml.includes("batch03-integrated-flow"), "Homepage has Batch 03 integrated flow", failures);
check(indexHtml.includes("first-light-card"), "Homepage has First Light card", failures);
check(indexHtml.includes("founder-notebook-card"), "Homepage has Founder Notebook card", failures);
check(indexHtml.includes("psychometric-card"), "Homepage has Psychometric card", failures);

check(Boolean(homepageUi.dailyFlow), "homepage-ui has dailyFlow", failures);
check(Boolean(homepageUi.continuityStrip), "homepage-ui has continuityStrip", failures);
check(Array.isArray(homepageUi.featuredReads), "homepage-ui has featuredReads array", failures);
check(Boolean(homepageUi.readingGuide), "homepage-ui has readingGuide", failures);

check(typeof articleIndex.total === "number", "article-index has total count", failures);
check(Array.isArray(articleIndex.latest), "article-index has latest array", failures);
check(Array.isArray(articleIndex.items), "article-index has items array", failures);
check(Boolean(articleIndex.byDate), "article-index has byDate archive map", failures);

check(Boolean(pkg.scripts?.["build:article-index"]), "package.json has build:article-index script", failures);
check(Boolean(pkg.scripts?.["refresh:homepage"]), "package.json has refresh:homepage script", failures);

console.log("");
console.log("Homepage readiness summary:");
console.log(`- Article index: ${articleIndex.total ?? 0} reads`);
console.log(`- Latest reads shown: ${Array.isArray(articleIndex.latest) ? articleIndex.latest.length : 0}`);
console.log(`- Homepage UI featured reads: ${Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads.length : 0}`);
console.log(`- Article index file: ${rel(articleIndexPath)}`);

if (failures.length) {
  console.log("");
  console.log("Refresh completed with readiness issues:");
  for (const failure of failures) {
    console.log(`- ${failure}`);
  }
  process.exit(1);
}

console.log("");
console.log("Drishvara homepage refresh completed successfully.");
