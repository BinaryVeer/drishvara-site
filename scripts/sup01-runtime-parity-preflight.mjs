import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (value) =>
  JSON.parse(fs.readFileSync(path.join(root, value), "utf8"));

const daily = readJson(
  "data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json"
);
const locations = readJson(
  "data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json"
);
const festivals = readJson(
  "data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json"
);
const matrix = readJson(
  "data/quality/sup01-runtime-parity-matrix.json"
);

const fail = (message) => {
  console.error(`❌ SUP01 parity preflight failed: ${message}`);
  process.exit(1);
};

if (daily.approved_daily_record_count !== 384 || daily.exact_records.length !== 384) {
  fail("The approved exact-record baseline must remain 384.");
}
if (new Set(daily.exact_records.map((item) => item.civil_date)).size !== 384) {
  fail("Approved daily dates must remain unique.");
}
if (locations.record_count !== 5 || locations.records.length !== 5) {
  fail("The approved named-location baseline must remain five.");
}
if (festivals.approved_observance_count !== 114 || festivals.records.length !== 114) {
  fail("The approved observance baseline must remain 114.");
}
if (matrix.public_cutover_allowed_now !== false || matrix.cutover_stage !== "SUP02") {
  fail("SUP01 must not activate public cutover.");
}
if (matrix.named_location_cases.length !== 5) {
  fail("All five approved named locations must be in the parity matrix.");
}
if (matrix.festival_window_assertions.length !== 4) {
  fail("All four festival window-separation assertions are required.");
}
if (!matrix.coordinate_cases.some((item) => item.expected === "governed_error")) {
  fail("Negative coordinate/timezone cases are required.");
}

console.log("✅ SUP01 parity preflight passed.");
console.log("✅ Baseline remains 5 locations, 384 daily records and 114 observances.");
console.log("✅ Public cutover remains prohibited until SUP02.");
