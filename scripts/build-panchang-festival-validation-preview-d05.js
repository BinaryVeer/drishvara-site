import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => {
  fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + "\n", "utf8");
};

const sourceRegistry = readJson("data/knowledge/sanatan/panchang-festival-source-registry-d05.json");
const observanceRegistry = readJson("data/knowledge/sanatan/festival-observance-registry-d05.json");

const items = (observanceRegistry.items || []).map((item) => {
  const issues = [];

  if (!item.id) issues.push("missing id");
  if (!item.name_en) issues.push("missing English name");
  if (!item.name_hi) issues.push("missing Hindi name");
  if (!item.category) issues.push("missing category");
  if (item.date_rule_status !== "not_configured") issues.push("date rule unexpectedly configured");
  if (item.requires_source_cross_check !== true) issues.push("source cross-check not required");
  if (!sourceRegistry.review_status_values.includes(item.review_status)) issues.push("invalid review status");

  return {
    id: item.id,
    preview_only: true,
    live_output_enabled: false,
    name_en: item.name_en,
    name_hi: item.name_hi,
    category: item.category,
    date_rule_status: item.date_rule_status,
    requires_lunar_validation: item.requires_lunar_validation,
    requires_source_cross_check: item.requires_source_cross_check,
    review_status: item.review_status,
    validation_result: issues.length === 0 ? "valid_scaffold" : "needs_fix",
    validation_issues: issues
  };
});

const output = {
  version: "2026.05.03-d05",
  module: "knowledge.panchang_festival_validation_preview",
  status: "preview_not_live",
  public_dynamic_output_enabled: false,
  external_api_fetch_enabled: false,
  live_panchang_calculation_enabled: false,
  live_festival_date_assignment_enabled: false,
  generated_from: [
    "data/knowledge/sanatan/panchang-festival-source-registry-d05.json",
    "data/knowledge/sanatan/festival-observance-registry-d05.json"
  ],
  items
};

writeJson("data/knowledge/sanatan/panchang-festival-validation-preview-d05.json", output);

console.log(`D05 Panchang/Festival validation preview built. Preview items: ${items.length}`);
