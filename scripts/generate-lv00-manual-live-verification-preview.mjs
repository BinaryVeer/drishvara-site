import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "lv00-manual-live-verification-after-homepage-findings-fix.json");
const qa00PreviewPath = path.join(root, "data", "quality", "qa00-homepage-stability-audit-preview.json");
const qa01PreviewPath = path.join(root, "data", "quality", "qa01-build-asset-seo-link-smoke-preview.json");
const lr00PreviewPath = path.join(root, "data", "quality", "lr00-live-readiness-review-preview.json");
const lf00PreviewPath = path.join(root, "data", "quality", "lf00-homepage-asset-link-findings-preview.json");
const lf01ApplyPath = path.join(root, "data", "quality", "lf01-targeted-homepage-fix-apply-result.json");
const outPath = path.join(root, "data", "quality", "lv00-manual-live-verification-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);
const qa00 = readJson(qa00PreviewPath);
const qa01 = readJson(qa01PreviewPath);
const lr00 = readJson(lr00PreviewPath);
const lf00 = readJson(lf00PreviewPath);
const lf01 = readJson(lf01ApplyPath);

const qa00MissingAssets = qa00?.static_scan?.missing_local_asset_count ?? null;
const qa01MissingAssets = qa01?.summary?.missing_local_asset_count ?? null;
const qa01MissingLinks = qa01?.summary?.missing_local_link_count ?? null;
const lf00AssetFindings = lf00?.summary?.asset_finding_count ?? null;
const lf00LinkFindings = lf00?.summary?.link_finding_count ?? null;
const lf01AppliedFixes = lf01?.summary?.applied_fix_count ?? null;
const lf01ModifiedFiles = lf01?.summary?.modified_file_count ?? null;

const staticEvidenceClean =
  qa00MissingAssets === 0 &&
  qa01MissingAssets === 0 &&
  qa01MissingLinks === 0 &&
  lf00AssetFindings === 0 &&
  lf00LinkFindings === 0 &&
  lf01AppliedFixes === 0 &&
  lf01ModifiedFiles === 0;

const verificationItems = registry.verification_items.map((item) => ({
  ...item,
  mutation_performed: false,
  activation_performed: false
}));

const statusCounts = {};
const areaCounts = {};
for (const item of verificationItems) {
  statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
  areaCounts[item.area] = (areaCounts[item.area] || 0) + 1;
}

const decision = staticEvidenceClean
  ? "clean_static_ready_for_manual_live_check"
  : "no_go_until_manual_issue_fixed";

const output = {
  preview_id: "LV00_MANUAL_LIVE_VERIFICATION_PREVIEW",
  module_id: "LV00",
  status: "preview_only_manual_live_verification_no_activation",
  preview_only: true,
  static_evidence: {
    qa00_missing_local_asset_count: qa00MissingAssets,
    qa01_missing_local_asset_count: qa01MissingAssets,
    qa01_missing_local_link_count: qa01MissingLinks,
    lr00_decision: lr00?.decision?.live_readiness_decision ?? null,
    lf00_asset_finding_count: lf00AssetFindings,
    lf00_link_finding_count: lf00LinkFindings,
    lf01_applied_fix_count: lf01AppliedFixes,
    lf01_modified_file_count: lf01ModifiedFiles,
    static_evidence_clean: staticEvidenceClean
  },
  verification_items: verificationItems,
  summary: {
    verification_item_count: verificationItems.length,
    status_counts: statusCounts,
    area_counts: areaCounts,
    manual_check_required_count: statusCounts.manual_check_required || 0,
    mutation_performed_count: 0,
    activation_performed_count: 0,
    homepage_mutation_enabled: false,
    asset_mutation_enabled: false,
    backend_activation_enabled: false,
    api_route_enabled: false,
    supabase_enabled: false,
    auth_enabled: false,
    public_dynamic_output_enabled: false,
    subscriber_output_enabled: false,
    frontend_deployment_enabled: false,
    backend_deployment_enabled: false
  },
  decision: {
    live_verification_decision: decision,
    manual_live_browser_check_required: true,
    clean_static_ready: staticEvidenceClean,
    activation_allowed: false,
    runtime_activation: "no_go_for_activation",
    backend_activation: "no_go_for_activation",
    supabase_activation: "no_go_for_activation",
    auth_activation: "no_go_for_activation",
    api_activation: "no_go_for_activation",
    public_dynamic_output_activation: "no_go_for_activation",
    subscriber_output_activation: "no_go_for_activation"
  },
  manual_browser_check_sequence: registry.manual_browser_check_sequence,
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${verificationItems.length} manual verification items.`);
console.log(`LV00 decision: ${decision}`);
console.log(`Static evidence clean: ${staticEvidenceClean}`);
