import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf02-homepage-header-layout-interaction-stabilization-fix-plan.json");
const lv02PreviewPath = path.join(root, "data", "quality", "lv02-post-hf01-manual-live-recheck-preview.json");
const hq00PreviewPath = path.join(root, "data", "quality", "hq00-post-hf01-static-qa-refresh-preview.json");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "data", "quality", "hf02-homepage-header-layout-interaction-stabilization-plan-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length;
}

const registry = readJson(registryPath);
const lv02 = readJson(lv02PreviewPath);
const hq00 = readJson(hq00PreviewPath);
const indexHtml = readText(indexPath);

const navCount = countMatches(indexHtml, /<nav\b[\s\S]*?<\/nav>/gi);
const selectCount = countMatches(indexHtml, /<select\b/gi);
const dropdownGuardCount = countMatches(indexHtml, /data-drishvara-hf01-dropdown-guard/g);
const authPlaceholderCount = countMatches(indexHtml, /data-drishvara-auth-placeholder/g);
const languageMarkerCount =
  countMatches(indexHtml, /data-lang|language|Hindi|English|हिंदी|EN/g);

const correctionPlan = registry.correction_areas.map((area) => {
  let relatedFindingIds = [];

  if (area === "homepage_header_layout") {
    relatedFindingIds = ["LV02-FINDING-002"];
  } else if (area === "navigation_alignment") {
    relatedFindingIds = ["LV02-FINDING-002", "LV02-FINDING-004"];
  } else if (area === "timezone_dropdown_placement") {
    relatedFindingIds = ["LV02-FINDING-003"];
  } else if (area === "homepage_interaction_sticking") {
    relatedFindingIds = ["LV02-FINDING-001"];
  } else if (area === "overlay_z_index_pointer_events") {
    relatedFindingIds = ["LV02-FINDING-001", "LV02-FINDING-002"];
  } else if (area === "language_toggle_protection") {
    relatedFindingIds = ["LV02-FINDING-001"];
  } else if (area === "hero_header_separation") {
    relatedFindingIds = ["LV02-FINDING-001", "LV02-FINDING-002"];
  }

  return {
    correction_area: area,
    planned_only: true,
    mutation_enabled: false,
    related_finding_ids: relatedFindingIds,
    hf03_required: true
  };
});

const output = {
  preview_id: "HF02_HOMEPAGE_HEADER_LAYOUT_INTERACTION_STABILIZATION_PLAN_PREVIEW",
  module_id: "HF02",
  status: "preview_only_homepage_header_interaction_plan_no_mutation",
  preview_only: true,
  lv02_evidence: {
    lv02_preview_present: true,
    lv02_manual_result: lv02.manual_result?.overall_status ?? null,
    lv02_clean_live_confidence: lv02.summary?.clean_live_confidence ?? null,
    lv02_finding_count: lv02.summary?.finding_count ?? null,
    lv02_area_counts: lv02.summary?.area_counts ?? null
  },
  hq00_evidence: {
    hq00_preview_present: true,
    all_pages_have_submissions: hq00.summary?.all_pages_have_submissions ?? null,
    all_pages_have_dropdown_guard: hq00.summary?.all_pages_have_dropdown_guard ?? null,
    all_article_pages_have_reference_placeholder: hq00.summary?.all_article_pages_have_reference_placeholder ?? null,
    all_article_pages_have_image_credit_placeholder: hq00.summary?.all_article_pages_have_image_credit_placeholder ?? null
  },
  static_scan: {
    index_exists: indexHtml.length > 0,
    index_nav_count: navCount,
    index_select_count: selectCount,
    dropdown_guard_marker_count: dropdownGuardCount,
    auth_placeholder_marker_count: authPlaceholderCount,
    language_related_marker_count: languageMarkerCount,
    has_required_nav_labels: registry.required_nav_labels.every((label) => indexHtml.includes(label))
  },
  correction_plan: {
    correction_areas: correctionPlan,
    planned_header_zones: registry.planned_header_zones,
    interaction_debug_focus: registry.interaction_debug_focus,
    language_toggle_protection_rules: registry.language_toggle_protection_rules,
    potential_next_patch_allowed_targets: registry.potential_next_patch_allowed_targets,
    next_patch_prohibited_targets: registry.next_patch_prohibited_targets,
    post_fix_validation_sequence: registry.post_fix_validation_sequence
  },
  summary: {
    correction_area_count: registry.correction_areas.length,
    planned_header_zone_count: registry.planned_header_zones.length,
    interaction_debug_focus_count: registry.interaction_debug_focus.length,
    language_toggle_protection_rule_count: registry.language_toggle_protection_rules.length,
    hf03_required: true,
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
console.log(`Correction areas planned: ${output.summary.correction_area_count}`);
console.log(`Index nav count: ${output.static_scan.index_nav_count}`);
console.log(`Index select count: ${output.static_scan.index_select_count}`);
console.log(`HF03 required: ${output.summary.hf03_required}`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
