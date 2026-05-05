import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf05-targeted-header-dropdown-behavior-correction-patch.json");
const applyPath = path.join(root, "data", "quality", "hf05-targeted-header-dropdown-behavior-correction-apply-result.json");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "data", "quality", "hf05-targeted-header-dropdown-behavior-correction-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length;
}

const registry = readJson(registryPath);
const apply = readJson(applyPath);
const html = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : "";
const markers = registry.required_markers;

const unsafeGuardScriptCount = countMatches(html, /<script\b[^>]*data-drishvara-hf01-dropdown-guard[\s\S]*?<\/script>/gi);

const output = {
  preview_id: "HF05_TARGETED_HEADER_DROPDOWN_BEHAVIOR_CORRECTION_PREVIEW",
  module_id: "HF05",
  status: "preview_after_limited_static_frontend_header_dropdown_correction",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    modified_file_count: apply.summary?.modified_file_count ?? null,
    index_modified: apply.summary?.index_modified ?? null,
    homepage_header_rebuilt: apply.summary?.homepage_header_rebuilt ?? null,
    language_toggle_restored: apply.summary?.language_toggle_restored ?? null,
    timezone_select_restored: apply.summary?.timezone_select_restored ?? null
  },
  static_scan: {
    index_exists: html.length > 0,
    hf05_header_present: html.includes(markers.hf05_header_marker),
    hf05_nav_present: html.includes(markers.hf05_nav_marker),
    hf05_timezone_present: html.includes(markers.hf05_timezone_marker),
    hf05_language_toggle_present: html.includes(markers.hf05_language_toggle_marker),
    hf05_native_dropdown_safety_present: html.includes(markers.hf05_native_dropdown_safety_marker),
    hf05_script_present: html.includes(markers.hf05_script_marker),
    hf01_passive_dropdown_marker_present: html.includes(markers.hf01_dropdown_guard_marker),
    auth_placeholder_present: html.includes(markers.auth_placeholder_marker),
    required_nav_labels_present: registry.required_nav_labels.every((label) => html.includes(label)),
    required_nav_label_status: registry.required_nav_labels.map((label) => ({
      label,
      present: html.includes(label)
    })),
    unsafe_hf01_dropdown_guard_script_count_in_index: unsafeGuardScriptCount,
    stop_propagation_count_in_index: countMatches(html, /stopPropagation\s*\(/g),
    prevent_default_count_in_index: countMatches(html, /preventDefault\s*\(/g),
    en_button_present: html.includes('data-drishvara-hf05-lang-choice="en"'),
    hindi_button_present: html.includes('data-drishvara-hf05-lang-choice="hi"')
  },
  summary: {
    index_exists: html.length > 0,
    hf05_header_complete: html.includes(markers.hf05_header_marker) &&
      html.includes(markers.hf05_nav_marker) &&
      html.includes(markers.hf05_timezone_marker) &&
      html.includes(markers.hf05_language_toggle_marker),
    hf05_script_present: html.includes(markers.hf05_script_marker),
    native_dropdown_safety_present: html.includes(markers.hf05_native_dropdown_safety_marker),
    unsafe_hf01_dropdown_guard_script_removed_from_index: unsafeGuardScriptCount === 0,
    required_nav_labels_present: registry.required_nav_labels.every((label) => html.includes(label)),
    language_toggle_visible_markers_present: html.includes('data-drishvara-hf05-lang-choice="en"') &&
      html.includes('data-drishvara-hf05-lang-choice="hi"'),
    timezone_select_present: html.includes(markers.hf05_timezone_marker),
    auth_placeholder_preserved: html.includes(markers.auth_placeholder_marker),
    backend_activation_performed: false,
    api_route_created: false,
    supabase_enabled: false,
    auth_enabled: false,
    real_login_enabled: false,
    real_signup_enabled: false,
    user_account_collection_enabled: false,
    frontend_deployment_performed: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)}.`);
console.log(`HF05 header complete: ${output.summary.hf05_header_complete}`);
console.log(`Language toggle markers present: ${output.summary.language_toggle_visible_markers_present}`);
console.log(`Timezone select present: ${output.summary.timezone_select_present}`);
console.log(`Unsafe dropdown guard script removed from index: ${output.summary.unsafe_hf01_dropdown_guard_script_removed_from_index}`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
