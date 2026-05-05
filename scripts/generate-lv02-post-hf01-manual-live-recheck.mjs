import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "lv02-post-hf01-manual-live-recheck.json");
const hq00PreviewPath = path.join(root, "data", "quality", "hq00-post-hf01-static-qa-refresh-preview.json");
const outPath = path.join(root, "data", "quality", "lv02-post-hf01-manual-live-recheck-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);
const hq00 = readJson(hq00PreviewPath);

const severityCounts = {};
const areaCounts = {};

for (const finding of registry.manual_findings) {
  severityCounts[finding.severity] = (severityCounts[finding.severity] || 0) + 1;
  areaCounts[finding.area] = (areaCounts[finding.area] || 0) + 1;
}

const output = {
  preview_id: "LV02_POST_HF01_MANUAL_LIVE_RECHECK_PREVIEW",
  module_id: "LV02",
  status: "preview_only_manual_live_recheck_result_no_mutation",
  preview_only: true,
  hq00_evidence: {
    hq00_preview_present: true,
    all_pages_have_submissions: hq00.summary?.all_pages_have_submissions ?? null,
    all_pages_have_dropdown_guard: hq00.summary?.all_pages_have_dropdown_guard ?? null,
    all_article_pages_have_reference_placeholder: hq00.summary?.all_article_pages_have_reference_placeholder ?? null,
    all_article_pages_have_image_credit_placeholder: hq00.summary?.all_article_pages_have_image_credit_placeholder ?? null
  },
  manual_result: registry.manual_result,
  manual_findings: registry.manual_findings.map((finding) => ({
    ...finding,
    mutation_performed: false,
    activation_performed: false
  })),
  static_pass_items_from_hq00: registry.static_pass_items_from_hq00,
  next_fix_focus: registry.next_fix_focus,
  summary: {
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
    frontend_deployment_enabled: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${registry.manual_findings.length} manual findings.`);
console.log(`Manual result: ${registry.manual_result.overall_status}`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
