import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG60A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "data/content-intelligence/quality-reviews/ag59z-v01-go-live-closure.json",
  "data/content-intelligence/quality-reviews/ag59c-r1-live-runtime-rendered-copy-stabilisation.json",
  "data/content-intelligence/quality-reviews/ag27-supabase-auth-backend-decision-checkpoint.json",

  "data/content-intelligence/quality-reviews/ag60a-phase-01-live-module-inventory-source-map.json",
  "data/content-intelligence/phase-01-modules/ag60a-source-consumption-record.json",
  "data/content-intelligence/phase-01-modules/ag60a-live-module-inventory-record.json",
  "data/content-intelligence/phase-01-modules/ag60a-frontend-backend-source-map-record.json",
  "data/content-intelligence/phase-01-modules/ag60a-methodology-verification-gate-record.json",
  "data/content-intelligence/phase-01-modules/ag60a-duplicate-placeholder-object-map-record.json",
  "data/content-intelligence/quality-registry/ag60a-ag60b-generation-fetch-logic-verification-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag60a-to-ag60b-generation-fetch-logic-verification-boundary.json",
  "data/content-intelligence/backend-architecture/ag60a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60a-no-v02-expansion-audit.json",
  "data/quality/ag60a-phase-01-live-module-inventory-source-map.json",
  "data/quality/ag60a-phase-01-live-module-inventory-source-map-preview.json",
  "docs/quality/AG60A_PHASE_01_LIVE_MODULE_INVENTORY_SOURCE_MAP.md",
  "scripts/generate-ag60a-phase-01-live-module-inventory-source-map.mjs",
  "scripts/validate-ag60a-phase-01-live-module-inventory-source-map.mjs"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag60a"]) fail("Missing generate:ag60a script.");
if (!pkg.scripts?.["validate:ag60a"]) fail("Missing validate:ag60a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag60a")) fail("validate:project must include validate:ag60a.");

const ag59z = readJson("data/content-intelligence/quality-reviews/ag59z-v01-go-live-closure.json");
if (ag59z.status !== "v01_go_live_closed") fail("AG59Z must be closed.");

const review = readJson("data/content-intelligence/quality-reviews/ag60a-phase-01-live-module-inventory-source-map.json");
const inventory = readJson("data/content-intelligence/phase-01-modules/ag60a-live-module-inventory-record.json");
const map = readJson("data/content-intelligence/phase-01-modules/ag60a-frontend-backend-source-map-record.json");
const methodology = readJson("data/content-intelligence/phase-01-modules/ag60a-methodology-verification-gate-record.json");
const duplicate = readJson("data/content-intelligence/phase-01-modules/ag60a-duplicate-placeholder-object-map-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag60a-ag60b-generation-fetch-logic-verification-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag60a-to-ag60b-generation-fetch-logic-verification-boundary.json");
const preview = readJson("data/quality/ag60a-phase-01-live-module-inventory-source-map-preview.json");

if (review.status !== "phase_01_live_module_inventory_source_map_recorded") fail("AG60A review status mismatch.");
if (review.summary.module_count < 10) fail("Module inventory count too low.");
if (review.summary.methodology_gates_identified < 4) fail("Methodology gates missing.");
if (review.summary.frontend_backend_source_map_recorded !== true) fail("Frontend/backend map not recorded.");
if (review.summary.ready_for_ag60b !== true) fail("AG60B readiness missing.");

const requiredModules = [
  "first_light",
  "featured_reads",
  "indexed_reads",
  "today_reading_guide",
  "sports_desk",
  "word_of_day",
  "vedic_guidance",
  "panchang_festival",
  "upcoming_observance",
  "browse_by_date"
];

const ids = inventory.modules.map((m) => m.module_id);
for (const id of requiredModules) {
  if (!ids.includes(id)) fail(`Missing module inventory item: ${id}`);
}

if (!methodology.gates.some((g) => g.module === "Word of the Day" && g.gate.includes("Nityanand"))) fail("Word of the Day Nityanand Mishra methodology gate missing.");
if (!methodology.gates.some((g) => g.module.includes("Panchang"))) fail("Panchang methodology gate missing.");
if (duplicate.object_count < 3) fail("Duplicate/placeholder object map too small.");
if (!map.backend_status_from_ag27_ag59z.includes("deferred")) fail("Backend deferral interpretation missing.");
if (readiness.ready_for_ag60b !== true) fail("AG60B readiness must be true.");
if (boundary.status !== "ag60b_generation_fetch_logic_verification_boundary_created") fail("AG60B boundary mismatch.");

for (const f of [
  "data/content-intelligence/backend-architecture/ag60a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag60a-no-v02-expansion-audit.json"
]) {
  const audit = readJson(f);
  if (audit.audit_passed !== true) fail(`${f} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${f} failed checks must be zero.`);
}

if (preview.ready_for_ag60b !== 1) fail("Preview AG60B readiness missing.");
if (preview.backend_runtime_activated !== 0) fail("Preview backend runtime must be zero.");

pass("AG60A Phase-01 Live Module Inventory and Source Map is present.");
pass("Required Phase-01 modules are inventoried.");
pass("Frontend/backend source map is recorded.");
pass("Nityanand Mishra / Panchang / Vedic methodology gates are recorded.");
pass("Duplicate and placeholder objects are identified.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG60B Generation / Fetch Logic Verification readiness is valid.");
