import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf07-unified-responsive-header-dropdown-system-patch.json");
const applyPath = path.join(root, "data", "quality", "hf07-unified-responsive-header-dropdown-system-apply-result.json");
const outPath = path.join(root, "data", "quality", "hf07-unified-responsive-header-dropdown-system-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(rel) {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

const registry = readJson(registryPath);
const apply = readJson(applyPath);
const markers = registry.required_markers;

const sampleFiles = [
  "index.html",
  "about.html",
  "submissions.html",
  "contact.html",
  "articles/world/ai-future-warfare-2026.html"
].filter((rel) => fs.existsSync(path.join(root, rel)));

const sampleStatus = sampleFiles.map((rel) => {
  const html = readText(rel);
  return {
    file: rel,
    hf07_header_present: html.includes(markers.hf07_header_marker),
    hf07_nav_present: html.includes(markers.hf07_nav_marker),
    hf07_dropdown_present: html.includes(markers.hf07_dropdown_marker),
    hf07_script_present: html.includes(markers.hf07_script_marker),
    hf07_timezone_present: html.includes(markers.hf07_timezone_marker),
    hf07_language_toggle_present: html.includes(markers.hf07_language_toggle_marker),
    lang_en_present: html.includes(markers.hf07_lang_en_marker),
    lang_hi_present: html.includes(markers.hf07_lang_hi_marker),
    auth_placeholder_present: html.includes(markers.auth_placeholder_marker),
    required_nav_labels_present: registry.required_nav_labels.every((label) => html.includes(label)),
    nested_links_correct: rel.startsWith("articles/") ? html.includes('../../index.html') && html.includes('../../submissions.html') : true
  };
});

const output = {
  preview_id: "HF07_UNIFIED_RESPONSIVE_HEADER_DROPDOWN_SYSTEM_PREVIEW",
  module_id: "HF07",
  status: "preview_after_unified_static_frontend_header_dropdown_system_patch",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    scanned_html_file_count: apply.scanned_html_file_count,
    modified_file_count: apply.summary?.modified_file_count ?? null,
    unified_header_applied_file_count: apply.summary?.unified_header_applied_file_count ?? null,
    responsive_dropdown_style_file_count: apply.summary?.responsive_dropdown_style_file_count ?? null
  },
  sample_status: sampleStatus,
  summary: {
    sample_file_count: sampleStatus.length,
    all_samples_have_hf07_header: sampleStatus.every((x) => x.hf07_header_present),
    all_samples_have_hf07_nav: sampleStatus.every((x) => x.hf07_nav_present),
    all_samples_have_responsive_dropdown_style: sampleStatus.every((x) => x.hf07_dropdown_present),
    all_samples_have_hf07_script: sampleStatus.every((x) => x.hf07_script_present),
    all_samples_have_timezone: sampleStatus.every((x) => x.hf07_timezone_present),
    all_samples_have_language_toggle: sampleStatus.every((x) => x.hf07_language_toggle_present && x.lang_en_present && x.lang_hi_present),
    all_samples_have_auth_placeholder: sampleStatus.every((x) => x.auth_placeholder_present),
    all_samples_have_required_nav_labels: sampleStatus.every((x) => x.required_nav_labels_present),
    nested_article_links_correct: sampleStatus.filter((x) => x.file.startsWith("articles/")).every((x) => x.nested_links_correct),
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
console.log(`All samples have HF07 header: ${output.summary.all_samples_have_hf07_header}`);
console.log(`All samples have responsive dropdown style: ${output.summary.all_samples_have_responsive_dropdown_style}`);
console.log(`All samples have language toggle: ${output.summary.all_samples_have_language_toggle}`);
console.log(`Nested article links correct: ${output.summary.nested_article_links_correct}`);
