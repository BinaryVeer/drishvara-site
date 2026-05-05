import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "lv03-post-hf03-manual-live-recheck.json");
const hq01PreviewPath = path.join(root, "data", "quality", "hq01-post-hf03-static-qa-refresh-preview.json");
const outPath = path.join(root, "data", "quality", "lv03-post-hf03-manual-live-recheck-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);
const hq01 = readJson(hq01PreviewPath);

const pendingCount = registry.manual_live_recheck_items.filter(
  (item) => item.result_status === "pending_manual_observation"
).length;

const areaCounts = {};
for (const item of registry.manual_live_recheck_items) {
  areaCounts[item.area] = (areaCounts[item.area] || 0) + 1;
}

const output = {
  preview_id: "LV03_POST_HF03_MANUAL_LIVE_RECHECK_PREVIEW",
  module_id: "LV03",
  status: "preview_only_manual_live_recheck_checklist_pending_observation",
  preview_only: true,
  hq01_evidence: {
    hq01_preview_present: true,
    hf03_markers_present: hq01.summary?.hf03_markers_present ?? null,
    required_nav_labels_present: hq01.summary?.required_nav_labels_present ?? null,
    dropdown_guard_preserved: hq01.summary?.dropdown_guard_preserved ?? null,
    qa_static_missing_assets_zero: hq01.summary?.qa_static_missing_assets_zero ?? null,
    qa_static_missing_links_zero: hq01.summary?.qa_static_missing_links_zero ?? null,
    backend_activation_enabled: hq01.summary?.backend_activation_enabled ?? null,
    auth_enabled: hq01.summary?.auth_enabled ?? null
  },
  manual_live_recheck_items: registry.manual_live_recheck_items,
  result_reporting_format: registry.result_reporting_format,
  summary: {
    check_count: registry.manual_live_recheck_items.length,
    pending_manual_observation_count: pendingCount,
    area_counts: areaCounts,
    live_result_recorded: false,
    clean_live_confidence: null,
    mutation_performed_count: 0,
    activation_performed_count: 0,
    backend_activation_enabled: false,
    api_route_enabled: false,
    supabase_enabled: false,
    auth_enabled: false,
    real_login_enabled: false,
    real_signup_enabled: false,
    user_account_collection_enabled: false,
    public_dynamic_output_enabled: false,
    subscriber_output_enabled: false,
    frontend_deployment_enabled: false,
    backend_deployment_enabled: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  conditional_next_stages: {
    if_pass: registry.pass_next_stage,
    if_warning_or_fail: registry.fail_next_stage
  }
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)}.`);
console.log(`Manual live recheck items: ${output.summary.check_count}`);
console.log(`Pending manual observations: ${output.summary.pending_manual_observation_count}`);
console.log(`If pass: ${registry.pass_next_stage.module_id}`);
console.log(`If warning/fail: ${registry.fail_next_stage.module_id}`);
