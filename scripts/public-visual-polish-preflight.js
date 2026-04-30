import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.existsSync(path.join(root, file))
    ? fs.readFileSync(path.join(root, file), "utf8")
    : "";
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
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

console.log("Drishvara public visual polish preflight");
console.log("");

const cssPath = "assets/css/public-preview-polish.css";
const checklistPath = "docs/public-preview-visual-polish-checklist.md";

check(exists(cssPath), "Public preview polish CSS exists", failures);
check(exists(checklistPath), "Visual polish checklist exists", failures);

const css = read(cssPath);
const index = read("index.html");
const timezoneJs = read("assets/js/timezone-context.js");
const sportsJs = read("assets/js/sports-context.js");

const pages = [
  "index.html",
  "insights.html",
  "article.html",
  "submissions.html",
  "dashboard.html",
  "admin.html",
  "about.html",
  "contact.html"
];

for (const page of pages) {
  check(read(page).includes("public-preview-polish.css"), `${page} loads public preview polish CSS`, failures);
}

check(index.includes("nav-timezone-slot"), "Homepage has compact timezone nav slot", failures);
check(index.includes("assets/js/timezone-context.js"), "Homepage loads timezone script", failures);
check(!index.includes("date-basis-section"), "Large timezone body section is absent", failures);

check(timezoneJs.includes("nav-timezone-select"), "Timezone controller renders compact dropdown", failures);
check(!timezoneJs.includes("position: fixed"), "Timezone controller is not floating/fixed", failures);
check(!timezoneJs.includes("document.body.appendChild"), "Timezone controller does not append floating body card", failures);

check(css.includes(".nav-timezone-select"), "Polish CSS styles timezone dropdown", failures);
check(css.includes(".drishvara-sports-live-pill"), "Polish CSS styles sports live object", failures);
check(css.includes("@media (max-width: 900px)"), "Polish CSS includes mobile handling", failures);
check(css.includes("position: static !important"), "Sports object becomes page-flow on smaller screens", failures);

check(sportsJs.includes("drishvara-sports-live-pill"), "Sports object renderer remains available", failures);
check(sportsJs.includes("sports-live-inline-slot"), "Sports live object uses inline slot", failures);
check(!sportsJs.includes("position: fixed"), "Sports context does not use fixed positioning", failures);
check(!sportsJs.includes("document.body.appendChild"), "Sports context does not append floating body card", failures);
check(css.includes("Sports Live card must stay in page flow"), "Polish CSS documents sports page-flow rule", failures);
check(read("submissions.html").includes("Backend intake: disabled"), "Submissions disabled status remains visible", failures);
check(read("dashboard.html").includes("Login/subscription integration pending"), "Dashboard scaffold status remains visible", failures);
check(read("admin.html").includes("Admin auth/actions disabled"), "Admin disabled status remains visible", failures);

check(!css.includes("display: none"), "Polish CSS does not hide major elements globally", failures);
check(!css.includes("visibility: hidden"), "Polish CSS does not hide major elements globally", failures);

console.log("");
console.log("Visual polish summary:");
console.log("- Compact nav timezone control: retained");
console.log("- Large timezone section: absent");
console.log("- Sports object: less intrusive");
console.log("- Scaffold states: still visible");
console.log("- Mobile wrapping: covered");

if (failures.length) {
  console.log("");
  console.log("Public visual polish preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Public visual polish preflight passed.");
