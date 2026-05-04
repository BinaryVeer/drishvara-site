import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "lr00-live-readiness-review-before-runtime-backend-activation.json");
const qa00PreviewPath = path.join(root, "data", "quality", "qa00-homepage-stability-audit-preview.json");
const qa01PreviewPath = path.join(root, "data", "quality", "qa01-build-asset-seo-link-smoke-preview.json");
const outPath = path.join(root, "data", "quality", "lr00-live-readiness-review-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);
const qa00 = readJson(qa00PreviewPath);
const qa01 = readJson(qa01PreviewPath);

const missingAssetCount = qa01?.summary?.missing_local_asset_count ?? 0;
const missingLinkCount = qa01?.summary?.missing_local_link_count ?? 0;
const qa01WarningCount = qa01?.summary?.warning_count ?? 0;
const qa01FailCount = qa01?.summary?.fail_count ?? 0;
const manualRemaining = qa01?.summary?.manual_check_remaining_count ?? 0;

let liveReviewDecision = "conditional_go_for_manual_live_review";
let liveReadinessSummary = "Manual live review can proceed, but activation remains no-go.";

if (missingAssetCount > 0 || missingLinkCount > 0) {
  liveReviewDecision = "no_go_until_findings_reviewed";
  liveReadinessSummary = "Missing asset/link findings must be reviewed before clean live confidence.";
}

if (qa01FailCount > 0) {
  liveReviewDecision = "go_for_fix_patch_only";
  liveReadinessSummary = "Static smoke scan has fail-level findings; prepare a targeted fix/review patch before clean live confidence.";
}

const reviewItems = registry.review_items.map((item) => {
  let status = item.status;

  if (item.item_key === "qa01_missing_assets_reviewed") {
    status = missingAssetCount > 0 ? "warning" : "pass";
  }
  if (item.item_key === "qa01_missing_links_reviewed") {
    status = missingLinkCount > 0 ? "warning" : "pass";
  }
  if (item.item_key === "backend_activation_boundary_confirmed") {
    status = "pass";
  }
  if (item.item_key === "supabase_auth_api_boundary_confirmed") {
    status = "pass";
  }
  if (item.item_key === "frontend_deployment_not_triggered_by_lr00") {
    status = "pass";
  }

  return {
    ...item,
    status,
    mutation_performed: false,
    activation_performed: false
  };
});

const statusCounts = {};
const areaCounts = {};
for (const item of reviewItems) {
  statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
  areaCounts[item.area] = (areaCounts[item.area] || 0) + 1;
}

const output = {
  preview_id: "LR00_LIVE_READINESS_REVIEW_PREVIEW",
  module_id: "LR00",
  status: "preview_only_live_readiness_review_no_activation",
  preview_only: true,
  qa_evidence: {
    qa00_preview_present: true,
    qa01_preview_present: true,
    qa00_audit_item_count: qa00?.summary?.audit_item_count ?? null,
    qa01_smoke_item_count: qa01?.summary?.smoke_item_count ?? null,
    qa01_missing_local_asset_count: missingAssetCount,
    qa01_missing_local_link_count: missingLinkCount,
    qa01_warning_count: qa01WarningCount,
    qa01_fail_count: qa01FailCount,
    qa01_manual_check_remaining_count: manualRemaining
  },
  review_items: reviewItems,
  summary: {
    review_item_count: reviewItems.length,
    status_counts: statusCounts,
    area_counts: areaCounts,
    mutation_performed_count: 0,
    activation_performed_count: 0,
    missing_asset_count: missingAssetCount,
    missing_link_count: missingLinkCount,
    manual_check_remaining_count: manualRemaining,
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
    live_readiness_decision: liveReviewDecision,
    live_readiness_summary: liveReadinessSummary,
    runtime_activation: "no_go_for_activation",
    backend_activation: "no_go_for_activation",
    supabase_activation: "no_go_for_activation",
    auth_activation: "no_go_for_activation",
    api_activation: "no_go_for_activation",
    public_dynamic_output_activation: "no_go_for_activation",
    subscriber_output_activation: "no_go_for_activation",
    manual_live_review_allowed: liveReviewDecision === "conditional_go_for_manual_live_review",
    fix_or_findings_review_recommended: missingAssetCount > 0 || missingLinkCount > 0 || qa01FailCount > 0
  },
  manual_live_review_checklist: registry.manual_live_review_checklist,
  finding_treatment: registry.finding_treatment,
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${reviewItems.length} live-readiness review items. No activation.`);
console.log(`LR00 decision: ${liveReviewDecision}`);
console.log(`Missing local asset references: ${missingAssetCount}`);
console.log(`Missing local page links: ${missingLinkCount}`);
