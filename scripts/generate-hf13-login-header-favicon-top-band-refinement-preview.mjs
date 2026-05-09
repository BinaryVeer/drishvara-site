import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf13-login-header-favicon-top-band-refinement-patch.json");
const applyPath = path.join(root, "data", "quality", "hf13-login-header-favicon-top-band-refinement-apply-result.json");
const outPath = path.join(root, "data", "quality", "hf13-login-header-favicon-top-band-refinement-preview.json");

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
  "login.html",
  "submissions.html",
  "contact.html",
  "articles/world/ai-future-warfare-2026.html"
].filter((rel) => fs.existsSync(path.join(root, rel)));

const sampleStatus = sampleFiles.map((rel) => {
  const html = readText(rel);
  const isLogin = rel === "login.html";
  return {
    file: rel,
    hf13_login_header_present: isLogin ? html.includes(markers.hf13_login_header_marker) : true,
    hf13_top_band_present: html.includes(markers.hf13_top_band_marker),
    hf13_favicon_present: html.includes(markers.hf13_favicon_marker) && html.includes("/favicon.ico?v=hf13"),
    hf12_select_style_present: html.includes(markers.hf12_select_style_marker),
    hf12_select_script_present: html.includes(markers.hf12_select_script_marker),
    hf09_login_static_present: isLogin ? html.includes(markers.hf09_static_login_marker) : true,
    hf07_header_nav_present: isLogin ? true : html.includes(markers.hf07_header_marker) && html.includes(markers.hf07_nav_marker)
  };
});

const output = {
  preview_id: "HF13_LOGIN_HEADER_FAVICON_TOP_BAND_REFINEMENT_PREVIEW",
  module_id: "HF13",
  status: "preview_after_targeted_static_visual_refinement_after_hf12",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    modified_file_count: apply.summary?.modified_file_count ?? null,
    login_modified: apply.summary?.login_modified ?? null,
    dropdown_logic_changed: apply.summary?.dropdown_logic_changed ?? null
  },
  sample_status: sampleStatus,
  summary: {
    favicon_ico_exists: fs.existsSync(path.join(root, "favicon.ico")),
    favicon_svg_exists: fs.existsSync(path.join(root, "favicon.svg")),
    apple_touch_icon_exists: fs.existsSync(path.join(root, "apple-touch-icon.png")),
    asset_favicon_exists: fs.existsSync(path.join(root, "assets", "drishvara-favicon.svg")),
    all_samples_have_hf13_favicon: sampleStatus.every((x) => x.hf13_favicon_present),
    all_samples_have_top_band_neutralisation: sampleStatus.every((x) => x.hf13_top_band_present),
    login_header_visibility_present: sampleStatus.find((x) => x.file === "login.html")?.hf13_login_header_present === true,
    all_samples_preserve_hf12_safe_select: sampleStatus.every((x) => x.hf12_select_style_present && x.hf12_select_script_present),
    login_page_remains_static: sampleStatus.find((x) => x.file === "login.html")?.hf09_login_static_present === true,
    all_non_login_samples_preserve_hf07_header_nav: sampleStatus.every((x) => x.hf07_header_nav_present),
    dropdown_logic_changed: false,
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
console.log(`Login header visibility present: ${output.summary.login_header_visibility_present}`);
console.log(`All samples preserve HF12 safe select: ${output.summary.all_samples_preserve_hf12_safe_select}`);
console.log(`All samples have HF13 favicon: ${output.summary.all_samples_have_hf13_favicon}`);
