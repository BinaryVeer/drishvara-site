import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => {
  fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + "\n", "utf8");
};

const sourceRegistry = readJson("data/knowledge/sanatan/mantra-source-registry-d06.json");
const candidateRegistry = readJson("data/knowledge/sanatan/mantra-candidate-registry-d06.json");

const items = (candidateRegistry.items || []).map((item) => {
  const issues = [];

  for (const field of sourceRegistry.required_future_record_fields) {
    if (["reviewed_by", "reviewed_at"].includes(field) && item.review_status !== "approved") continue;
    if (!Object.prototype.hasOwnProperty.call(item, field)) issues.push(`missing ${field}`);
    else if (typeof item[field] === "string" && !item[field].trim() && !["reviewed_by", "reviewed_at"].includes(field)) issues.push(`empty ${field}`);
  }

  if (!sourceRegistry.review_status_values.includes(item.review_status)) {
    issues.push("invalid review status");
  }

  if (item.review_status === "approved" && (!item.reviewed_by || !item.reviewed_at)) {
    issues.push("approved item missing reviewer details");
  }

  const remedyRiskText = `${item.usage_context || ""} ${item.meaning_en || ""} ${item.meaning_hi || ""}`.toLowerCase();
  const unsafeGuaranteePatterns = [
    "guaranteed remedy",
    "remedy guaranteed",
    "guaranteed result",
    "guaranteed outcome",
    "will definitely cure",
    "sure cure"
  ];

  if (unsafeGuaranteePatterns.some((pattern) => remedyRiskText.includes(pattern))) {
    issues.push("contains guaranteed remedy language");
  }

  return {
    mantra_id: item.mantra_id,
    preview_only: true,
    live_output_enabled: false,
    public_dynamic_mantra_enabled: false,
    deity_or_theme: item.deity_or_theme,
    sanskrit_text: item.sanskrit_text,
    transliteration: item.transliteration,
    meaning_en: item.meaning_en,
    meaning_hi: item.meaning_hi,
    usage_context: item.usage_context,
    day_or_observance_context: item.day_or_observance_context,
    source_basis: item.source_basis,
    review_status: item.review_status,
    validation_result: issues.length === 0 ? "valid_review_candidate" : "needs_fix",
    validation_issues: issues
  };
});

const output = {
  version: "2026.05.03-d06",
  module: "knowledge.mantra_review_preview",
  status: "preview_not_live",
  public_dynamic_mantra_enabled: false,
  external_api_fetch_enabled: false,
  live_mantra_selection_enabled: false,
  generated_from: [
    "data/knowledge/sanatan/mantra-source-registry-d06.json",
    "data/knowledge/sanatan/mantra-candidate-registry-d06.json"
  ],
  items
};

writeJson("data/knowledge/sanatan/mantra-review-preview-d06.json", output);

console.log(`D06 Mantra review preview built. Preview items: ${items.length}`);
