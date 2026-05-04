import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "lf00-homepage-asset-link-findings-review-fix-plan.json");
const qa01PreviewPath = path.join(root, "data", "quality", "qa01-build-asset-seo-link-smoke-preview.json");
const lr00PreviewPath = path.join(root, "data", "quality", "lr00-live-readiness-review-preview.json");
const outPath = path.join(root, "data", "quality", "lf00-homepage-asset-link-findings-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function classifyAsset(ref) {
  const value = String(ref).toLowerCase();

  if (value.includes("language") || value.includes("lang")) return "language_runtime_candidate";
  if (value.endsWith(".css") || value.includes(".css")) return "stylesheet_candidate";
  if (value.endsWith(".js") || value.includes(".js")) return "script_candidate";
  if (value.includes("logo")) return "logo_candidate";
  if (value.includes("hero") || value.includes("orbit") || value.includes("planet")) return "hero_visual_candidate";
  if (value.includes("favicon") || value.includes("og") || value.includes("open-graph")) return "favicon_or_og_candidate";
  if (value.match(/\.(png|jpg|jpeg|webp|svg|gif)$/)) return "image_candidate";
  return "unknown_asset_candidate";
}

function classifyLink(ref) {
  const value = String(ref).toLowerCase();

  if (value.includes("article") || value.includes("articles")) return "article_link_candidate";
  if (value.includes("footer")) return "footer_link_candidate";
  if (value.includes("contact") || value.includes("start") || value.includes("subscribe") || value.includes("read")) return "cta_candidate";
  if (value.includes("about") || value.includes("home") || value.includes("vision")) return "primary_navigation_candidate";
  if (value.endsWith(".html") || value.includes("/")) return "internal_page_candidate";
  return "unknown_link_candidate";
}

function recommendedAssetAction(ref, findingClass) {
  if (findingClass === "stylesheet_candidate" || findingClass === "script_candidate" || findingClass === "language_runtime_candidate") {
    return "correct_path";
  }
  if (findingClass === "hero_visual_candidate" || findingClass === "logo_candidate") {
    return "restore_missing_file";
  }
  if (findingClass === "favicon_or_og_candidate" || findingClass === "image_candidate") {
    return "replace_with_existing_asset";
  }
  return "verify_reference";
}

function recommendedLinkAction(ref, findingClass) {
  if (findingClass === "article_link_candidate" || findingClass === "internal_page_candidate") {
    return "create_target_page_later";
  }
  if (findingClass === "cta_candidate" || findingClass === "primary_navigation_candidate") {
    return "correct_path";
  }
  return "verify_reference";
}

function severityForAsset(findingClass) {
  if (["stylesheet_candidate", "script_candidate", "language_runtime_candidate", "hero_visual_candidate", "logo_candidate"].includes(findingClass)) {
    return "blocker_candidate";
  }
  if (findingClass === "favicon_or_og_candidate") return "warning";
  return "warning";
}

function severityForLink(findingClass) {
  if (["primary_navigation_candidate", "cta_candidate"].includes(findingClass)) return "blocker_candidate";
  return "warning";
}

const registry = readJson(registryPath);
const qa01 = readJson(qa01PreviewPath);
const lr00 = readJson(lr00PreviewPath);

const scan = qa01.static_smoke_scan || {};
const missingAssets = [
  ...(scan.missing_stylesheet_refs || []).map((ref) => ({ ref, asset_ref_type: "stylesheet" })),
  ...(scan.missing_script_refs || []).map((ref) => ({ ref, asset_ref_type: "script" })),
  ...(scan.missing_image_refs || []).map((ref) => ({ ref, asset_ref_type: "image" }))
];

const missingLinks = (scan.missing_local_links || []).map((ref) => ({ ref, link_ref_type: "local_page" }));

const assetFindings = missingAssets.map((item, index) => {
  const findingClass = classifyAsset(item.ref);
  return {
    finding_id: `LF00-ASSET-${String(index + 1).padStart(3, "0")}`,
    reference: item.ref,
    reference_type: item.asset_ref_type,
    finding_class: findingClass,
    severity: severityForAsset(findingClass),
    likely_user_visible_impact: severityForAsset(findingClass) === "blocker_candidate"
      ? "May affect first-page visual/runtime behavior if actually used by homepage."
      : "May affect SEO/visual polish if actually used by homepage.",
    recommended_action: recommendedAssetAction(item.ref, findingClass),
    manual_review_required: true,
    auto_fix_performed: false,
    mutation_performed: false
  };
});

const linkFindings = missingLinks.map((item, index) => {
  const findingClass = classifyLink(item.ref);
  return {
    finding_id: `LF00-LINK-${String(index + 1).padStart(3, "0")}`,
    reference: item.ref,
    reference_type: item.link_ref_type,
    finding_class: findingClass,
    severity: severityForLink(findingClass),
    likely_user_visible_impact: severityForLink(findingClass) === "blocker_candidate"
      ? "May affect first-page navigation or CTA trust if visible."
      : "May affect deeper navigation if visible.",
    recommended_action: recommendedLinkAction(item.ref, findingClass),
    manual_review_required: true,
    auto_fix_performed: false,
    mutation_performed: false
  };
});

const blockerCandidateCount = [...assetFindings, ...linkFindings].filter((x) => x.severity === "blocker_candidate").length;
const warningCount = [...assetFindings, ...linkFindings].filter((x) => x.severity === "warning").length;

let decision = "go_for_manual_review_first";
let summaryText = "Manual review is required before clean live confidence.";
if (blockerCandidateCount > 0) {
  decision = "go_for_targeted_fix_patch";
  summaryText = "Prepare a targeted fix patch for blocker-candidate asset/link findings after reviewing exact references.";
}
if (assetFindings.length === 0 && linkFindings.length === 0) {
  decision = "acceptable_for_live_observation_with_warnings";
  summaryText = "No missing asset/link findings were found by QA01.";
}

const output = {
  preview_id: "LF00_HOMEPAGE_ASSET_LINK_FINDINGS_PREVIEW",
  module_id: "LF00",
  status: "preview_only_findings_review_fix_plan_no_mutation",
  preview_only: true,
  qa_evidence: {
    qa01_preview_present: true,
    lr00_preview_present: true,
    qa01_missing_local_asset_count: qa01?.summary?.missing_local_asset_count ?? null,
    qa01_missing_local_link_count: qa01?.summary?.missing_local_link_count ?? null,
    lr00_decision: lr00?.decision?.live_readiness_decision ?? null
  },
  asset_findings: assetFindings,
  link_findings: linkFindings,
  summary: {
    asset_finding_count: assetFindings.length,
    link_finding_count: linkFindings.length,
    total_finding_count: assetFindings.length + linkFindings.length,
    blocker_candidate_count: blockerCandidateCount,
    warning_count: warningCount,
    manual_review_required_count: assetFindings.length + linkFindings.length,
    auto_fix_performed_count: 0,
    mutation_performed_count: 0,
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
    findings_review_decision: decision,
    findings_review_summary: summaryText,
    clean_live_confidence: assetFindings.length + linkFindings.length === 0 ? "possible_after_manual_live_review" : "not_yet",
    targeted_fix_patch_recommended: assetFindings.length + linkFindings.length > 0,
    activation_allowed: false
  },
  manual_review_checklist: registry.manual_review_checklist,
  future_fix_patch_allowed_actions: registry.future_fix_patch_allowed_actions,
  future_fix_patch_prohibited_actions: registry.future_fix_patch_prohibited_actions,
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${assetFindings.length} asset findings and ${linkFindings.length} link findings. No mutation.`);
console.log(`Decision: ${decision}`);
console.log(`Blocker candidates: ${blockerCandidateCount}`);
