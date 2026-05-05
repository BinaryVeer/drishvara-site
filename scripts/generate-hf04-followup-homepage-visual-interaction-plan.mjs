import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf04-followup-homepage-visual-interaction-correction-plan.json");
const lv03ResultPath = path.join(root, "data", "quality", "lv03-post-hf03-manual-live-recheck-result-preview.json");
const hq01PreviewPath = path.join(root, "data", "quality", "hq01-post-hf03-static-qa-refresh-preview.json");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "data", "quality", "hf04-followup-homepage-visual-interaction-correction-plan-preview.json");

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
const lv03 = readJson(lv03ResultPath);
const hq01 = readJson(hq01PreviewPath);
const indexHtml = readText(indexPath);

const output = {
  preview_id: "HF04_FOLLOWUP_HOMEPAGE_VISUAL_INTERACTION_CORRECTION_PLAN_PREVIEW",
  module_id: "HF04",
  status: "preview_only_followup_homepage_visual_interaction_plan_no_mutation",
  preview_only: true,
  lv03_result_evidence: {
    lv03_result_preview_present: true,
    overall: lv03.summary?.overall ?? null,
    clean_live_confidence: lv03.summary?.clean_live_confidence ?? null,
    severity_counts: lv03.summary?.severity_counts ?? null,
    failed_areas: registry.lv03_failed_areas
  },
  hq01_static_evidence: {
    hq01_preview_present: true,
    hf03_markers_present: hq01.summary?.hf03_markers_present ?? null,
    required_nav_labels_present: hq01.summary?.required_nav_labels_present ?? null,
    dropdown_guard_preserved: hq01.summary?.dropdown_guard_preserved ?? null,
    qa_static_missing_assets_zero: hq01.summary?.qa_static_missing_assets_zero ?? null,
    qa_static_missing_links_zero: hq01.summary?.qa_static_missing_links_zero ?? null
  },
  static_scan: {
    index_exists: indexHtml.length > 0,
    nav_count: countMatches(indexHtml, /<nav\b[\s\S]*?<\/nav>/gi),
    select_count: countMatches(indexHtml, /<select\b/gi),
    hf03_header_stabilizer_count: countMatches(indexHtml, /data-drishvara-hf03-header-stabilizer/g),
    hf03_interaction_stabilizer_count: countMatches(indexHtml, /data-drishvara-hf03-interaction-stabilizer/g),
    language_toggle_related_count: countMatches(indexHtml, /language-toggle|lang-toggle|data-language-toggle|data-drishvara-language-toggle|Hindi|हिंदी|EN/g),
    stop_propagation_count: countMatches(indexHtml, /stopPropagation\s*\(/g),
    prevent_default_count: countMatches(indexHtml, /preventDefault\s*\(/g)
  },
  correction_plan: {
    correction_areas: registry.correction_areas.map((area) => ({
      correction_area: area,
      planned_only: true,
      mutation_enabled: false,
      hf05_required: true
    })),
    header_target_structure: registry.header_target_structure,
    dropdown_debug_targets: registry.dropdown_debug_targets,
    language_toggle_required_behavior: registry.language_toggle_required_behavior,
    potential_next_patch_allowed_targets: registry.potential_next_patch_allowed_targets,
    next_patch_prohibited_targets: registry.next_patch_prohibited_targets
  },
  summary: {
    overall_live_result_basis: lv03.summary?.overall ?? null,
    live_failed_area_count: registry.lv03_failed_areas.length,
    correction_area_count: registry.correction_areas.length,
    header_target_structure_count: registry.header_target_structure.length,
    dropdown_debug_target_count: registry.dropdown_debug_targets.length,
    language_toggle_rule_count: registry.language_toggle_required_behavior.length,
    hf05_required: true,
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
console.log(`LV03 result basis: ${output.summary.overall_live_result_basis}`);
console.log(`Correction areas planned: ${output.summary.correction_area_count}`);
console.log(`HF05 required: ${output.summary.hf05_required}`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
