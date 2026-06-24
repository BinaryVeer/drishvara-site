import fs from "node:fs";
import crypto from "node:crypto";
const fail=(m)=>{console.error("❌ AG74P static validation failed: "+m);process.exit(1);};
const pass=(m)=>console.log("✅ "+m);
const read=(p)=>fs.readFileSync(p,"utf8");
const json=(p)=>JSON.parse(read(p));
const required=[
"index.html","package.json","assets/vendor/astronomy-engine-2.1.19.min.js","assets/vendor/astronomy-engine-2.1.19.LICENSE.txt",
"assets/js/ag74o-panchang-public-controller.js","scripts/ag74o-panchang-browser-qa.html","scripts/run-ag74o-panchang-browser-qa.sh",
"data/knowledge-base/location-intelligence/production/ag74o-r2-browser-approved-location-projection.json",
"data/knowledge-base/panchang-festival/production/ag74o-r3-calendar-activation-projection.json",
"data/knowledge-base/panchang-festival/production/ag74o-r3-festival-observance-activation-projection.json",
"data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json",
"data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json",
"data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json",
"data/knowledge-base/panchang-festival/production/ag74p-public-runtime-contract.json"];
for(const p of required)if(!fs.existsSync(p))fail("Missing "+p);
const index=read("index.html"),controller=read("assets/js/ag74o-panchang-public-controller.js"),pkg=json("package.json");
const r2=json(required[7]),r3d=json(required[8]),r3f=json(required[9]),locations=json(required[10]),daily=json(required[11]),festivals=json(required[12]),runtime=json(required[13]);

// AG74O-R2 and AG74O-R3 historical controls remain present for regression validation.
for(const marker of["AG74O_PANCHANG_PUBLIC_UI_STYLE_START",'data-ag74o-r2-approved-option-count="0"','data-ag74o-r2-ui-state-only="true"','id="panchang-location-provenance"','id="panchang-calculate"','id="panchang-request-status"','data-ag74o-r3-request-commit="true"',"AG74O_R3_CALENDAR_ACTIVATION_STYLE_START",'data-ag74p-live-release="true"',"AG74P_FINAL_PUBLIC_RELEASE_STYLE_START"])if(!index.includes(marker))fail("Index marker missing: "+marker);
for(const marker of["drishvaraAg74oApplySelection","SearchRiseSet","SetDeltaTFunction","requestToken","AbortController","CALENDAR_ACTIVATION_PATH","FESTIVAL_ACTIVATION_PATH","markRequestPending","resolveActivatedCalendarRecord","renderActivatedCalendarRecord",'target.closest("#panchang-calculate")',"computeDay(approvedRequest)","ag74p-approved-location-projection.json","renderApprovedLocationSelector","worldwideCoordinatePolicyEnabled"])if(!controller.includes(marker))fail("Controller marker missing: "+marker);
for(const forbidden of["localStorage.setItem","sessionStorage.setItem",'fetch("https',"fetch('https","SUPABASE_SERVICE_ROLE_KEY","service_role","var LOCATION_MAP = {","var ALIASES = {"])if(controller.includes(forbidden))fail("Forbidden browser dependency: "+forbidden);
const boot=controller.match(/function boot\(\) \{([\s\S]*?)\n  \}/)?.[1]||"";if(!boot||boot.includes("applySelection("))fail("Boot must not auto-commit or calculate.");
const block=controller.slice(controller.indexOf('  window.addEventListener("change"'),controller.indexOf('  function boot() {'));if((block.match(/applySelection\(/g)||[]).length!==1||!block.includes('target.closest("#panchang-calculate")'))fail("Input handlers must preserve explicit commitment.");
if((index.match(/id=["']panchang-calculate["']/g)||[]).length!==1)fail("Exactly one Calculate Panchang button required.");
if((index.match(/data-ag74i-book-page="[1-4]"/g)||[]).length!==4)fail("Exactly four annual-book pages required.");
if(!/data-ag71e-preview-action-shell="panchang"[^>]*hidden[^>]*aria-hidden="true"[^>]*inert/.test(index))fail("Legacy AG71E panel must remain hidden and inert.");
const vendor=fs.readFileSync("assets/vendor/astronomy-engine-2.1.19.min.js"),source=fs.readFileSync("node_modules/astronomy-engine/astronomy.browser.min.js"),hash=(v)=>crypto.createHash("sha256").update(v).digest("hex");
if(hash(vendor)!=="f41139a87941ea017ab902b954c9389fa27ea72083d7fab4971756d7769d14e6"||hash(vendor)!==hash(source))fail("Pinned Astronomy Engine bundle mismatch.");
if(pkg.dependencies?.["astronomy-engine"]!=="2.1.19")fail("Astronomy Engine dependency must remain exact-pinned.");
if(pkg.scripts?.["validate:ag74o-r2"]!=="node scripts/validate-ag74o-r2-selector-calculation-correction.mjs"||pkg.scripts?.["validate:ag74o-r3"]!=="node scripts/validate-ag74o-r3-governed-calendar-activation.mjs"||pkg.scripts?.["validate:ag74p"]!=="node scripts/validate-ag74p-consolidated-closure.mjs")fail("AG74O/AG74P validation wiring mismatch.");
if(r2.record_count!==0||r3d.approved_daily_record_count!==0||r3f.approved_observance_count!==0)fail("Historical R2/R3 zero-approval records must remain unchanged.");
if(locations.record_count!==5||daily.approved_daily_record_count!==384||festivals.approved_observance_count!==114)fail("AG74P approved projection counts mismatch.");
if(runtime.runtime?.automatic_calculation_on_boot!==false||runtime.runtime?.explicit_calculate_button_required!==true||runtime.runtime?.worldwide_coordinate_calculation_enabled!==true||runtime.runtime?.runtime_external_api_dependency!==false||runtime.runtime?.input_persistence!==false)fail("AG74P runtime boundary mismatch.");
pass("AG74O-R2 and AG74O-R3 regression controls remain intact.");
pass("AG74P five-location, worldwide-coordinate, 384-day and 114-observance runtime is statically valid.");
