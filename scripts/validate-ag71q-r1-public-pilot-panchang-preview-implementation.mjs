import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG71Q-R1 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "index.html",
  "generated/panchang-pilot-preview-data.json",
  "data/knowledge-base/panchang-festival/production/ag71q-r1-public-pilot-panchang-preview-implementation-record.json",
  "data/knowledge-base/panchang-festival/production/ag71q-r1-public-pilot-panchang-preview-validation-report.json",
  "data/knowledge-base/panchang-festival/production/ag71q-r1-no-production-release-audit.json",
  "data/content-intelligence/quality-registry/ag71q-r1-ag71r-panchang-public-pilot-qa-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag71q-r1-to-ag71r-panchang-public-pilot-qa-boundary.json",
  "data/content-intelligence/quality-reviews/ag71q-r1-public-pilot-panchang-preview-implementation.json",
  "data/quality/ag71q-r1-public-pilot-panchang-preview-implementation.json",
  "data/quality/ag71q-r1-public-pilot-panchang-preview-implementation-preview.json",
  "docs/quality/AG71Q_R1_PUBLIC_PILOT_PANCHANG_PREVIEW_IMPLEMENTATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const index = fs.readFileSync(full("index.html"), "utf8");

for (const marker of [
  "AG71Q_R1_PUBLIC_PILOT_PANCHANG_PREVIEW_STYLE_START",
  "AG71Q_R1_PUBLIC_PILOT_PANCHANG_PREVIEW_CONTROLLER_START",
  "generated/panchang-pilot-preview-data.json",
  "window.drishvaraAg71qR1PreviewPanchang",
  "data-drishvara-ag71q-r1-panchang-preview-active"
]) {
  if (!index.includes(marker)) fail(`index.html missing AG71Q-R1 marker: ${marker}`);
}

for (const forbidden of [
  "Krishna Paksha",
  "Krishna Ashtami",
  "Shatabhisha",
  "Vishkambha",
  "Balava",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
  "Ashwini",
  "Krittika",
  "Rohini"
]) {
  if (index.includes(forbidden)) fail(`index.html must not embed exact Panchang literal value: ${forbidden}`);
}

for (const requiredSchemaReference of [
  "preview_tithi",
  "preview_nakshatra",
  "preview_yoga",
  "preview_karana",
  "preview_paksha"
]) {
  if (!index.includes(requiredSchemaReference)) fail(`index.html missing required pilot JSON schema reference: ${requiredSchemaReference}`);
}

if (!index.includes('data-ag71e-preview-button="panchang"')) fail("Existing Preview Panchang button target is missing.");
if (!index.includes('data-drishvara-ag60i-panchang-preview-safe="true"')) fail("Existing Panchang mini-table target is missing.");
if (!index.includes("upcoming-observance-title")) fail("Upcoming Observance target must remain present.");

const pilot = readJson("generated/panchang-pilot-preview-data.json");
if (pilot.status !== "ag71q_r1_public_pilot_preview_data_created") fail("Pilot preview data status mismatch.");
if (pilot.scope.record_count !== 28) fail("Pilot preview data record_count must be 28.");
if (!Array.isArray(pilot.records) || pilot.records.length !== 28) fail("Pilot preview data records must contain 28 records.");

const locations = new Map();
for (const record of pilot.records) {
  locations.set(record.preview_location_id, (locations.get(record.preview_location_id) || 0) + 1);
  for (const field of ["preview_tithi", "preview_nakshatra", "preview_yoga", "preview_karana", "preview_paksha", "preview_vara"]) {
    if (!record[field]) fail(`${record.preview_record_id} missing ${field}`);
  }
}

for (const [locationId, count] of locations.entries()) {
  if (count !== 7) fail(`${locationId} must have 7 pilot preview records.`);
}

const implementation = readJson("data/knowledge-base/panchang-festival/production/ag71q-r1-public-pilot-panchang-preview-implementation-record.json");
if (implementation.status !== "ag71q_r1_public_pilot_preview_implementation_applied") fail("Implementation record status mismatch.");
if (implementation.implementation_summary.exact_values_embedded_in_index_html !== false) fail("Implementation record must state exact values are not embedded in index.");
if (implementation.implementation_summary.exact_values_served_from_pilot_json !== true) fail("Implementation record must state exact values are served from pilot JSON.");

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
if (manifest.current_counts.ag71q_r1_pilot_preview_records !== 28) fail("Manifest must record 28 AG71Q-R1 pilot preview records.");
if (manifest.current_counts.ag71q_r1_validation_issue_count !== 0) fail("Manifest must record zero AG71Q-R1 issues.");

pass("AG71Q-R1 public pilot Panchang preview implementation is valid.");
pass("Exact values are externalized to generated/panchang-pilot-preview-data.json.");
pass("index.html contains controller only, not the exact Panchang bank.");
