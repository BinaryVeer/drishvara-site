import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf10-header-paint-transition-refinement-patch.json");
const applyPath = path.join(root, "data", "quality", "hf10-header-paint-transition-refinement-apply-result.json");
const outPath = path.join(root, "data", "quality", "hf10-header-paint-transition-refinement-preview.json");

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
  "login.html",
  "articles/world/ai-future-warfare-2026.html"
].filter((rel) => fs.existsSync(path.join(root, rel)));

const sampleStatus = sampleFiles.map((rel) => {
  const html = readText(rel);
  const isLogin = rel === "login.html";

  return {
    file: rel,
    hf10_critical_paint_present: html.includes(markers.hf10_critical_paint_marker),
    hf10_theme_color_present: html.includes(markers.hf10_theme_color_marker),
    hf10_paint_ready_present: html.includes(markers.hf10_paint_ready_marker),
    hf09_favicon_present: html.includes(markers.hf09_favicon_marker),
    hf09_login_marker_present: isLogin ? html.includes(markers.hf09_static_login_marker) : true,
    hf07_header_present: isLogin ? true : html.includes(markers.hf07_header_marker),
    hf07_nav_present: isLogin ? true : html.includes(markers.hf07_nav_marker),
    timezone_present: isLogin ? true : html.includes(markers.hf07_timezone_marker),
    language_toggle_present: isLogin ? true : (
      html.includes(markers.hf07_language_toggle_marker) &&
      html.includes(markers.hf07_lang_en_marker) &&
      html.includes(markers.hf07_lang_hi_marker)
    ),
    critical_style_contains_dark_bg: html.includes("--drishvara-paint-bg: #071329"),
    critical_style_disables_transition: html.includes("transition: none !important") && html.includes("animation: none !important")
  };
});

const output = {
  preview_id: "HF10_HEADER_PAINT_TRANSITION_REFINEMENT_PREVIEW",
  module_id: "HF10",
  status: "preview_after_targeted_static_header_paint_transition_refinement",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    scanned_html_file_count: apply.scanned_html_file_count,
    modified_file_count: apply.summary?.modified_file_count ?? null,
    critical_paint_file_count: apply.summary?.critical_paint_file_count ?? null,
    theme_color_file_count: apply.summary?.theme_color_file_count ?? null,
    paint_ready_script_file_count: apply.summary?.paint_ready_script_file_count ?? null
  },
  sample_status: sampleStatus,
  summary: {
    sample_file_count: sampleStatus.length,
    all_samples_have_critical_paint: sampleStatus.every((x) => x.hf10_critical_paint_present),
    all_samples_have_theme_color: sampleStatus.every((x) => x.hf10_theme_color_present),
    all_samples_have_paint_ready_script: sampleStatus.every((x) => x.hf10_paint_ready_present),
    all_samples_preserve_favicon: sampleStatus.every((x) => x.hf09_favicon_present),
    login_page_remains_static: sampleStatus.find((x) => x.file === "login.html")?.hf09_login_marker_present === true,
    all_non_login_samples_preserve_hf07_header_nav: sampleStatus.every((x) => x.hf07_header_present && x.hf07_nav_present),
    all_non_login_samples_preserve_timezone: sampleStatus.every((x) => x.timezone_present),
    all_non_login_samples_preserve_language_toggle: sampleStatus.every((x) => x.language_toggle_present),
    critical_style_contains_dark_bg: sampleStatus.every((x) => x.critical_style_contains_dark_bg),
    critical_style_disables_transition: sampleStatus.every((x) => x.critical_style_disables_transition),
    backend_activation_performed: false,
    api_route_created: false,
    supabase_enabled: false,
    auth_enabled: false,
    real_login_enabled: false,
    real_signup_enabled: false,
    user_account_collection_enabled: false,
    credential_collection_enabled: false,
    frontend_deployment_performed: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)}.`);
console.log(`All samples have critical paint: ${output.summary.all_samples_have_critical_paint}`);
console.log(`All samples have theme-color: ${output.summary.all_samples_have_theme_color}`);
console.log(`Critical style disables transition: ${output.summary.critical_style_disables_transition}`);
