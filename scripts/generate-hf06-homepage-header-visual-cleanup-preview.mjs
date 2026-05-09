import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf06-homepage-header-visual-cleanup-patch.json");
const applyPath = path.join(root, "data", "quality", "hf06-homepage-header-visual-cleanup-apply-result.json");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "data", "quality", "hf06-homepage-header-visual-cleanup-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);
const apply = readJson(applyPath);
const html = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : "";
const markers = registry.required_markers;

const output = {
  preview_id: "HF06_HOMEPAGE_HEADER_VISUAL_CLEANUP_PREVIEW",
  module_id: "HF06",
  status: "preview_after_limited_index_html_visual_cleanup",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    modified_files: apply.modified_files || [],
    modified_file_count: apply.summary?.modified_file_count ?? null
  },
  static_scan: {
    index_exists: html.length > 0,
    hf06_style_marker_present: html.includes(markers.hf06_style_marker),
    hf06_script_marker_present: html.includes(markers.hf06_script_marker),
    hf05_header_present: html.includes(markers.hf05_header_marker),
    hf05_nav_present: html.includes(markers.hf05_nav_marker),
    hf05_timezone_present: html.includes(markers.hf05_timezone_marker),
    hf05_language_toggle_present: html.includes(markers.hf05_language_toggle_marker),
    auth_placeholder_present: html.includes(markers.auth_placeholder_marker),
    required_nav_labels_present: registry.required_nav_labels.every((label) => html.includes(label)),
    dark_header_override_present: html.includes("linear-gradient(135deg, rgba(10, 24, 52"),
    duplicate_nav_guard_present: html.includes("data-drishvara-hf06-duplicate-nav")
  },
  summary: {
    index_only_patch: (apply.modified_files || []).every((file) => file === "index.html"),
    hf06_visual_cleanup_present: html.includes(markers.hf06_style_marker) && html.includes(markers.hf06_script_marker),
    hf05_functional_markers_preserved:
      html.includes(markers.hf05_header_marker) &&
      html.includes(markers.hf05_timezone_marker) &&
      html.includes(markers.hf05_language_toggle_marker),
    required_nav_labels_present: registry.required_nav_labels.every((label) => html.includes(label)),
    dark_theme_header_override_present: html.includes("linear-gradient(135deg, rgba(10, 24, 52"),
    duplicate_nav_guard_present: html.includes("data-drishvara-hf06-duplicate-nav"),
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
console.log(`HF06 visual cleanup present: ${output.summary.hf06_visual_cleanup_present}`);
console.log(`HF05 functional markers preserved: ${output.summary.hf05_functional_markers_preserved}`);
console.log(`Duplicate nav guard present: ${output.summary.duplicate_nav_guard_present}`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
