import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf00-homepage-page-navigation-dropdown-reference-image-credit-fix-plan.json");
const lv01PreviewPath = path.join(root, "data", "quality", "lv01-manual-live-verification-result-preview.json");
const outPath = path.join(root, "data", "quality", "hf00-homepage-correction-plan-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);
const lv01 = readJson(lv01PreviewPath);

const manualFindings = lv01.manual_findings || [];

const findingAreas = {};
const severityCounts = {};

for (const finding of manualFindings) {
  findingAreas[finding.area] = (findingAreas[finding.area] || 0) + 1;
  severityCounts[finding.severity] = (severityCounts[finding.severity] || 0) + 1;
}

const correctionPlan = registry.correction_areas.map((area) => {
  const relatedFindings = manualFindings.filter((finding) => {
    if (area === "common_navigation") return finding.area === "navigation";
    if (area === "dropdown_interaction") return finding.area === "dropdown_interaction";
    if (area === "signup_login_placeholder") return finding.area === "auth_placeholder";
    if (area === "article_reference_links" || area === "verified_reference_link_integrity") return finding.area === "article_references";
    if (area === "image_credit_attribution") return finding.area === "image_credits";
    return false;
  });

  return {
    correction_area: area,
    related_finding_count: relatedFindings.length,
    related_finding_ids: relatedFindings.map((finding) => finding.finding_id),
    planned_only: true,
    mutation_enabled: false,
    hf01_required: relatedFindings.length > 0 || ["verified_reference_link_integrity", "article_display_metadata", "post_fix_validation"].includes(area)
  };
});

const output = {
  preview_id: "HF00_HOMEPAGE_CORRECTION_PLAN_PREVIEW",
  module_id: "HF00",
  status: "preview_only_frontend_correction_plan_no_mutation",
  preview_only: true,
  lv01_evidence: {
    lv01_preview_present: true,
    lv01_manual_result: lv01.manual_result?.overall_status ?? null,
    lv01_clean_live_confidence: lv01.summary?.clean_live_confidence ?? null,
    lv01_finding_count: manualFindings.length,
    lv01_finding_areas: findingAreas,
    lv01_severity_counts: severityCounts
  },
  correction_plan: {
    correction_areas: correctionPlan,
    common_navigation_required: registry.common_navigation_required,
    dropdown_fix_focus: registry.dropdown_fix_focus,
    signup_login_placeholder_boundary: registry.signup_login_placeholder_boundary,
    verified_reference_link_rules: registry.verified_reference_link_rules,
    reference_display_requirements: registry.reference_display_requirements,
    image_credit_rules: registry.image_credit_rules,
    image_credit_display_requirements: registry.image_credit_display_requirements,
    potential_hf01_allowed_targets: registry.potential_hf01_allowed_targets,
    hf01_prohibited_targets: registry.hf01_prohibited_targets,
    post_fix_validation_sequence: registry.post_fix_validation_sequence
  },
  summary: {
    correction_area_count: registry.correction_areas.length,
    manual_finding_count: manualFindings.length,
    hf01_required_area_count: correctionPlan.filter((item) => item.hf01_required).length,
    verified_reference_rule_count: registry.verified_reference_link_rules.length,
    image_credit_rule_count: registry.image_credit_rules.length,
    mutation_performed_count: 0,
    activation_performed_count: 0,
    homepage_mutation_enabled: false,
    page_mutation_enabled: false,
    backend_activation_enabled: false,
    api_route_enabled: false,
    supabase_enabled: false,
    auth_enabled: false,
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

console.log(`Created ${path.relative(root, outPath)} with ${registry.correction_areas.length} correction areas.`);
console.log(`LV01 manual findings carried into HF00: ${manualFindings.length}`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
