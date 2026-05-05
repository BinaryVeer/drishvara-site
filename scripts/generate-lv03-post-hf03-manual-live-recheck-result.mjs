import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "lv03-post-hf03-manual-live-recheck-result.json");
const hq01PreviewPath = path.join(root, "data", "quality", "hq01-post-hf03-static-qa-refresh-preview.json");
const outPath = path.join(root, "data", "quality", "lv03-post-hf03-manual-live-recheck-result-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);
const hq01 = readJson(hq01PreviewPath);

const severityCounts = {};
const areaCounts = {};

for (const finding of registry.manual_findings) {
  severityCounts[finding.severity] = (severityCounts[finding.severity] || 0) + 1;
  areaCounts[finding.area] = (areaCounts[finding.area] || 0) + 1;
}

const output = {
  preview_id: "LV03_POST_HF03_MANUAL_LIVE_RECHECK_RESULT_PREVIEW",
  module_id: "LV03_RESULT",
  status: "preview_only_manual_live_recheck_failed_no_mutation",
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
  manual_result: registry.manual_result,
  manual_findings: registry.manual_findings.map((finding) => ({
    ...finding,
    mutation_performed: false,
    activation_performed: false
  })),
  static_context_from_hq01: registry.static_context_from_hq01,
  next_fix_focus: registry.next_fix_focus,
  summary: {
    overall: registry.manual_result.overall,
    finding_count: registry.manual_findings.length,
    severity_counts: severityCounts,
    area_counts: areaCounts,
    clean_live_confidence: false,
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
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)}.`);
console.log(`Manual live result: ${registry.manual_result.overall}`);
console.log(`Failed areas: header_menu_alignment, timezone_dropdown, dropdown_freeze, language_toggle`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
