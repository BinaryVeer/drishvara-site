import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => {
  fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + "\n", "utf8");
};

const stages = [
  {
    stage: "D01",
    title: "Daily Guidance & Panchang engine governance",
    files: [
      "data/knowledge/daily-guidance/daily-guidance-engine-governance-d01.json",
      "data/knowledge/sanatan/panchang-source-policy-d01.json",
      "data/knowledge/sanatan/mantra-selection-policy-d01.json"
    ],
    expected_status_any: ["governance_only", "source_policy_scaffold", "policy_scaffold"]
  },
  {
    stage: "D02",
    title: "Word of the Day curated rotation bank",
    files: [
      "data/knowledge/daily-guidance/word-of-day-bank-d02.json",
      "data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json"
    ],
    expected_status_any: ["curated_bank_scaffold", "policy_scaffold"]
  },
  {
    stage: "D03",
    title: "Daily Guidance rule schema",
    files: [
      "data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json",
      "data/knowledge/daily-guidance/daily-guidance-rule-examples-d03.json"
    ],
    expected_status_any: ["schema_only", "example_rules_only_not_live"]
  },
  {
    stage: "D04",
    title: "Daily Guidance rule validation and selection preview",
    files: [
      "data/knowledge/daily-guidance/daily-guidance-rule-validation-policy-d04.json",
      "data/knowledge/daily-guidance/daily-guidance-selection-preview-d04.json"
    ],
    expected_status_any: ["validation_policy_only", "preview_not_live"]
  },
  {
    stage: "D05",
    title: "Panchang/Festival source registry and validation preview",
    files: [
      "data/knowledge/sanatan/panchang-festival-source-registry-d05.json",
      "data/knowledge/sanatan/festival-observance-registry-d05.json",
      "data/knowledge/sanatan/panchang-festival-validation-preview-d05.json"
    ],
    expected_status_any: ["source_registry_only", "registry_scaffold_not_live", "preview_not_live"]
  },
  {
    stage: "D06",
    title: "Mantra source registry and review preview",
    files: [
      "data/knowledge/sanatan/mantra-source-registry-d06.json",
      "data/knowledge/sanatan/mantra-candidate-registry-d06.json",
      "data/knowledge/sanatan/mantra-review-preview-d06.json"
    ],
    expected_status_any: ["source_registry_only", "candidate_registry_not_live", "preview_not_live"]
  },
  {
    stage: "D07",
    title: "Subscriber guidance personalization schema",
    files: [
      "data/knowledge/subscribers/subscriber-guidance-personalization-schema-d07.json",
      "data/knowledge/subscribers/personalization-input-policy-d07.json",
      "data/knowledge/subscribers/subscriber-guidance-personalization-preview-d07.json"
    ],
    expected_status_any: ["schema_scaffold_only", "policy_scaffold_only", "preview_not_live"]
  },
  {
    stage: "D08",
    title: "Subscriber entitlement and privacy gate preview",
    files: [
      "data/knowledge/subscribers/subscriber-entitlement-privacy-gate-d08.json",
      "data/knowledge/subscribers/subscriber-entitlement-privacy-gate-preview-d08.json"
    ],
    expected_status_any: ["gate_schema_preview_only", "preview_not_live"]
  },
  {
    stage: "D09",
    title: "Subscriber dashboard readiness matrix",
    files: [
      "data/knowledge/subscribers/subscriber-dashboard-readiness-matrix-d09.json",
      "data/knowledge/subscribers/subscriber-dashboard-readiness-preview-d09.json"
    ],
    expected_status_any: ["readiness_matrix_only", "preview_not_live"]
  }
];

const liveKeys = [
  "public_dynamic_output_enabled",
  "daily_guidance_live_enabled",
  "panchang_live_enabled",
  "festival_live_enabled",
  "mantra_live_enabled",
  "subscriber_guidance_live_enabled",
  "premium_guidance_enabled",
  "dashboard_live_data_enabled",
  "auth_enabled",
  "supabase_enabled",
  "payment_enabled",
  "subscription_gate_live_enabled",
  "entitlement_check_live_enabled",
  "external_api_fetch_enabled",
  "runtime_language_change_enabled",
  "admin_actions_enabled",
  "panchang_calculation_enabled",
  "festival_date_calculation_enabled",
  "mantra_generation_enabled",
  "mantra_selection_live_enabled",
  "personalized_output_enabled",
  "public_personalized_output_enabled"
];

function fileExists(file) {
  return fs.existsSync(path.join(root, file));
}

function inspectFile(file, expectedStatuses) {
  if (!fileExists(file)) {
    return {
      file,
      exists: false,
      status: null,
      status_ok: false,
      live_flags_ok: false,
      live_flags_true: []
    };
  }

  const data = readJson(file);
  const liveFlagsTrue = liveKeys.filter((key) => data[key] === true);

  return {
    file,
    exists: true,
    status: data.status || null,
    status_ok: expectedStatuses.includes(data.status),
    live_flags_ok: liveFlagsTrue.length === 0,
    live_flags_true: liveFlagsTrue
  };
}

const items = stages.map((stage) => {
  const fileChecks = stage.files.map((file) => inspectFile(file, stage.expected_status_any));
  const allFilesExist = fileChecks.every((item) => item.exists);
  const allStatusesOk = fileChecks.every((item) => item.status_ok);
  const allLiveFlagsOk = fileChecks.every((item) => item.live_flags_ok);

  return {
    stage: stage.stage,
    title: stage.title,
    readiness_status: allFilesExist && allStatusesOk && allLiveFlagsOk ? "governance_ready_not_live" : "needs_fix",
    activation_status: "not_live",
    files_checked: fileChecks,
    all_files_exist: allFilesExist,
    all_statuses_ok: allStatusesOk,
    all_live_flags_disabled: allLiveFlagsOk
  };
});

const summary = {
  total_stages: items.length,
  governance_ready_count: items.filter((item) => item.readiness_status === "governance_ready_not_live").length,
  needs_fix_count: items.filter((item) => item.readiness_status === "needs_fix").length,
  live_activation_allowed: false,
  public_dynamic_output_allowed: false,
  subscriber_guidance_allowed: false,
  premium_guidance_allowed: false
};

const output = {
  version: "2026.05.03-d10",
  module: "knowledge.governance_consolidated_status_report",
  status: "report_ready_not_live",
  public_dynamic_output_enabled: false,
  subscriber_guidance_live_enabled: false,
  premium_guidance_enabled: false,
  auth_enabled: false,
  supabase_enabled: false,
  payment_enabled: false,
  generated_from: stages.flatMap((stage) => stage.files),
  summary,
  items,
  freeze_note: "D01-D09 knowledge governance stack is consolidated and remains non-live. Any activation requires a separate explicit activation stage."
};

writeJson("data/knowledge/reports/knowledge-governance-status-report-d10.json", output);

console.log(`D10 knowledge governance status report built. Stages: ${summary.total_stages}; Ready: ${summary.governance_ready_count}; Needs fix: ${summary.needs_fix_count}`);
