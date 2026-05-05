import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf03-targeted-homepage-header-interaction-stabilization-patch.json");
const applyPath = path.join(root, "data", "quality", "hf03-homepage-header-interaction-stabilization-apply-result.json");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "data", "quality", "hf03-homepage-header-interaction-stabilization-preview.json");

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

const output = {
  preview_id: "HF03_HOMEPAGE_HEADER_INTERACTION_STABILIZATION_PREVIEW",
  module_id: "HF03",
  status: "preview_after_limited_index_html_homepage_stabilization",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    modified_file_count: apply.summary?.modified_file_count ?? null,
    modified_files: apply.modified_files || [],
    changes: apply.changes || []
  },
  static_scan: {
    index_exists: html.length > 0,
    nav_count: countMatches(html, /<nav\b[\s\S]*?<\/nav>/gi),
    select_count: countMatches(html, /<select\b/gi),
    hf03_style_marker_present: html.includes(markers.hf03_style_marker),
    hf03_script_marker_present: html.includes(markers.hf03_script_marker),
    hf01_dropdown_guard_present: html.includes(markers.hf01_dropdown_guard_marker),
    auth_placeholder_present: html.includes(markers.auth_placeholder_marker),
    required_nav_labels_present: registry.required_nav_labels.every((label) => html.includes(label)),
    required_nav_label_status: registry.required_nav_labels.map((label) => ({
      label,
      present: html.includes(label)
    })),
    has_homepage_stabilized_class_reference: html.includes("drishvara-hf03-homepage-stabilized"),
    has_decorative_pointer_safety: html.includes("pointer-events: none") && html.includes("hero-orbit"),
    has_select_stabilization: html.includes("data-drishvara-hf03-select-stabilized"),
    has_auth_placeholder_guard: html.includes("data-drishvara-hf03-auth-placeholder-guard")
  },
  summary: {
    index_only_patch: (apply.modified_files || []).every((file) => file === "index.html"),
    style_marker_present: html.includes(markers.hf03_style_marker),
    script_marker_present: html.includes(markers.hf03_script_marker),
    required_nav_labels_present: registry.required_nav_labels.every((label) => html.includes(label)),
    dropdown_guard_preserved: html.includes(markers.hf01_dropdown_guard_marker),
    auth_placeholder_preserved: html.includes(markers.auth_placeholder_marker),
    homepage_stabilization_present: html.includes("drishvara-hf03-homepage-stabilized"),
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
console.log(`Index-only patch: ${output.summary.index_only_patch}`);
console.log(`HF03 style marker present: ${output.summary.style_marker_present}`);
console.log(`HF03 script marker present: ${output.summary.script_marker_present}`);
console.log(`Required nav labels present: ${output.summary.required_nav_labels_present}`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
