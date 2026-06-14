import fs from "node:fs";
import crypto from "node:crypto";

const fail = (message) => { console.error("❌ AG74O static validation failed: " + message); process.exit(1); };
const pass = (message) => console.log("✅ " + message);
const read = (path) => fs.readFileSync(path, "utf8");
const json = (path) => JSON.parse(read(path));

const required = [
  "index.html",
  "assets/vendor/astronomy-engine-2.1.19.min.js",
  "assets/vendor/astronomy-engine-2.1.19.LICENSE.txt",
  "assets/js/ag74o-panchang-public-controller.js",
  "scripts/ag74o-panchang-browser-qa.html",
  "scripts/run-ag74o-panchang-browser-qa.sh",
  "scripts/finalize-ag74o-panchang-public-ui-wiring.mjs",
  "data/knowledge-base/panchang-festival/production/ag74o-panchang-public-runtime-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74o-panchang-responsive-accessibility-contract.json",
  "data/content-intelligence/mutation-plans/ag74o-to-ag74p-panchang-scientific-comparison-closure-boundary.json"
];
for (const path of required) if (!fs.existsSync(path)) fail("Missing " + path);

const index = read("index.html");
const controller = read("assets/js/ag74o-panchang-public-controller.js");
const pkg = json("package.json");
const runtime = json("data/knowledge-base/panchang-festival/production/ag74o-panchang-public-runtime-contract.json");

for (const marker of [
  "AG74O_PANCHANG_PUBLIC_UI_STYLE_START",
  'data-ag74o-panchang-public-runtime="true"',
  "panchang-place-alias",
  "panchang-tithi-transition",
  "ag74o-book-status",
  "astronomy-engine-2.1.19.min.js",
  "ag74o-panchang-public-controller.js",
  'data-ag74i-panchang-public-surface="true"',
  'data-ag74i-varanasi-calendar-book="true"',
  'data-ag74o-place-selection="governed-dropdown-only"',
  'data-ag74o-compat-only="true"',
  "Use the governed dropdown",
  "No publicly approved matching record",
  'data-ag74o-daily-result-surface="true"'
]) if (!index.includes(marker)) fail("Index marker missing: " + marker);

for (const marker of [
  "drishvaraAg74oApplySelection",
  "SearchRiseSet",
  "EclipticGeoMoon",
  "SetDeltaTFunction",
  "requestToken",
  "AbortController",
  "final_observance_date_approved===true",
  "public_output_allowed===true",
  "data-ag74o-book-slot",
  "SUPPORTED_START",
  "SUPPORTED_END"
]) if (!controller.includes(marker)) fail("Controller marker missing: " + marker);

for (const forbidden of [
  "localStorage.setItem",
  "sessionStorage.setItem",
  "fetch(\"https",
  "fetch('https",
  "supabase",
  "service_role"
]) if (controller.includes(forbidden)) fail("Forbidden runtime dependency: " + forbidden);


const dailySurfaceTags =
  index.match(/<(?:section|div)\b[^>]*\bdata-ag74o-daily-result-surface="true"[^>]*>/gi) || [];
if (dailySurfaceTags.length !== 1) {
  fail(`Exactly one AG74O daily Panchang result surface element is required; observed ${dailySurfaceTags.length}`);
}

const governedDailyTables =
  index.match(/<div\s+class="mini-table"\s+data-drishvara-ag60i-panchang-preview-safe="true">/gi) || [];
if (governedDailyTables.length !== 1) {
  fail(`Exactly one governed daily Panchang table is required; observed ${governedDailyTables.length}`);
}
const dailyResultIds = ["panchang-calculation-source","panchang-method-basis","panchang-moonrise","panchang-moonset","panchang-sunrise","panchang-sunset","panchang-vara","panchang-tithi","panchang-tithi-transition","panchang-nakshatra","panchang-nakshatra-transition","panchang-yoga","panchang-yoga-transition","panchang-karana","panchang-karana-transition","panchang-paksha"];
for (const id of dailyResultIds) {
  const count = (index.match(new RegExp(`id=["']${id}["']`, "g")) || []).length;
  if (count !== 1) fail(`Daily Panchang result id ${id} must occur exactly once; observed ${count}`);
}
if (!/data-ag71e-preview-action-shell="panchang"[^>]*hidden[^>]*aria-hidden="true"[^>]*inert/.test(index)) fail("Legacy AG71E Panchang panel must remain hidden, aria-hidden and inert");

if (!index.includes("window.drishvaraAg74oPublicSurfaceActive === true) return")) fail("AG74I controller guard missing");
if ((index.match(/data-ag74i-book-page=\"[1-4]\"/g) || []).length !== 4) fail("Exactly four book pages required");
if (!/html,body\{[^}]*overflow-x:(?:hidden|clip)/.test(index)) fail("Global right-overflow guard missing");
if (!index.includes("container-type:inline-size") || !index.includes("@container panchang-card (max-width:700px)")) {
  fail("Panchang card container-aware responsive guard missing");
}
if (!/#panchang-festival-card\{[^}]*max-width:100%/.test(index)) fail("Panchang card containment rule missing");
if (!/font-family:Cambria/.test(index) || !/font-family:Arial/.test(index) || !/font-family:Georgia/.test(index)) fail("Typography doctrine markers missing");
if (!/data-ag71d-r4-location-options="panchang"[^>]*data-ag74o-compat-only="true"[^>]*hidden[^>]*aria-hidden="true"/.test(index)) fail("Legacy pilot quick-pick location buttons are not governed-hidden");
if (/Use the governed buttons/.test(index)) fail("Legacy quick-pick copy remains visible");

const vendor = fs.readFileSync("assets/vendor/astronomy-engine-2.1.19.min.js");
const source = fs.readFileSync("node_modules/astronomy-engine/astronomy.browser.min.js");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
if (hash(vendor) !== "f41139a87941ea017ab902b954c9389fa27ea72083d7fab4971756d7769d14e6") fail("Vendored browser bundle hash mismatch");
if (hash(vendor) !== hash(source)) fail("Vendored browser bundle differs from installed pinned package");
if (!read("assets/vendor/astronomy-engine-2.1.19.LICENSE.txt").includes("MIT License")) fail("Vendored licence notice missing");

if (pkg.dependencies?.["astronomy-engine"] !== "2.1.19") fail("Astronomy Engine dependency is not exact-pinned");
if (pkg.scripts?.["validate:ag74o:static"] !== "node scripts/validate-ag74o-panchang-public-ui-static.mjs") fail("Static script mismatch");
if (pkg.scripts?.["qa:ag74o:browser"] !== "bash scripts/run-ag74o-panchang-browser-qa.sh") fail("Browser QA script mismatch");
if (pkg.scripts?.["validate:ag74o"] !== "node scripts/validate-ag74o-panchang-public-ui-wiring.mjs") fail("Final validation script mismatch");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag74n && npm run validate:ag74o")) fail("validate:project ordering mismatch");

if (runtime.status !== "ag74o_public_runtime_active_with_festival_guard") fail("Runtime contract status mismatch");
if (runtime.external_api_used !== false || runtime.persistence_enabled !== false || runtime.backend_service_deployed !== false || runtime.supabase_activation_performed !== false) fail("Runtime boundary flags mismatch");
if (runtime.festival_guard?.condition_candidates_publicly_visible !== false || runtime.festival_guard?.approved_final_observance_required !== true) fail("Festival publication guard mismatch");

pass("AG74O static public runtime, one visible daily result surface, governed dropdown-only place selection, exact local vendor, responsive doctrine and festival guard are valid.");
