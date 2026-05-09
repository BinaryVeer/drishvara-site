import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf08-visible-nav-literal-newline-cleanup-patch.json");
const applyPath = path.join(root, "data", "quality", "hf08-visible-nav-literal-newline-cleanup-apply-result.json");
const outPath = path.join(root, "data", "quality", "hf08-visible-nav-literal-newline-cleanup-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(rel) {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function stripProtectedAndCountLiteralNewline(html) {
  html = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  return (html.match(/\\n/g) || []).length;
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
    hf08_style_present: html.includes(markers.hf08_style_marker),
    hf08_script_present: html.includes(markers.hf08_script_marker),
    hf07_header_present: html.includes(markers.hf07_header_marker),
    hf07_nav_present: html.includes(markers.hf07_nav_marker),
    hf07_dropdown_present: html.includes(markers.hf07_dropdown_marker),
    hf07_timezone_present: html.includes(markers.hf07_timezone_marker),
    hf07_language_toggle_present: html.includes(markers.hf07_language_toggle_marker),
    lang_en_present: html.includes(markers.hf07_lang_en_marker),
    lang_hi_present: html.includes(markers.hf07_lang_hi_marker),
    auth_placeholder_present: html.includes(markers.auth_placeholder_marker),
    required_nav_labels_present: registry.required_nav_labels.every((label) => html.includes(label)),
    literal_backslash_n_outside_script_style_count: stripProtectedAndCountLiteralNewline(html)
  };
});

const output = {
  preview_id: "HF08_VISIBLE_NAV_LITERAL_NEWLINE_CLEANUP_PREVIEW",
  module_id: "HF08",
  status: "preview_after_targeted_public_ui_visible_nav_literal_newline_cleanup",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    scanned_html_file_count: apply.scanned_html_file_count,
    modified_file_count: apply.summary?.modified_file_count ?? null,
    hf08_style_file_count: apply.summary?.hf08_style_file_count ?? null,
    hf08_script_file_count: apply.summary?.hf08_script_file_count ?? null
  },
  sample_status: sampleStatus,
  summary: {
    sample_file_count: sampleStatus.length,
    all_samples_have_hf08_style: sampleStatus.every((x) => x.hf08_style_present),
    all_samples_have_hf08_script: sampleStatus.every((x) => x.hf08_script_present),
    all_samples_have_hf07_header: sampleStatus.every((x) => x.hf07_header_present),
    all_samples_have_hf07_nav: sampleStatus.every((x) => x.hf07_nav_present),
    all_samples_have_hf07_dropdown_style: sampleStatus.every((x) => x.hf07_dropdown_present),
    all_samples_have_timezone: sampleStatus.every((x) => x.hf07_timezone_present),
    all_samples_have_language_toggle: sampleStatus.every((x) => x.hf07_language_toggle_present && x.lang_en_present && x.lang_hi_present),
    all_samples_have_auth_placeholder: sampleStatus.every((x) => x.auth_placeholder_present),
    all_samples_have_required_nav_labels: sampleStatus.every((x) => x.required_nav_labels_present),
    literal_backslash_n_removed_outside_script_style: sampleStatus.every((x) => x.literal_backslash_n_outside_script_style_count === 0),
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
console.log(`All samples have HF08 visible-nav style: ${output.summary.all_samples_have_hf08_style}`);
console.log(`All samples have HF07 nav marker: ${output.summary.all_samples_have_hf07_nav}`);
console.log(`Literal backslash-n removed outside script/style: ${output.summary.literal_backslash_n_removed_outside_script_style}`);
