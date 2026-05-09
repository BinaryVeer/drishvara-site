import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf12-select-freeze-elimination-favicon-ico-patch.json");
const applyPath = path.join(root, "data", "quality", "hf12-select-freeze-elimination-favicon-ico-apply-result.json");
const outPath = path.join(root, "data", "quality", "hf12-select-freeze-elimination-favicon-ico-preview.json");

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
    hf12_select_style_present: html.includes(markers.hf12_select_style_marker),
    hf12_select_script_present: html.includes(markers.hf12_select_script_marker),
    hf12_favicon_links_present: html.includes(markers.hf12_favicon_marker) && html.includes("/favicon.ico?v=hf12"),
    hf07_header_present: isLogin ? true : html.includes(markers.hf07_header_marker),
    hf07_nav_present: isLogin ? true : html.includes(markers.hf07_nav_marker),
    login_page_static_marker_present: isLogin ? html.includes(markers.hf09_static_login_marker) : true
  };
});

const output = {
  preview_id: "HF12_SELECT_FREEZE_ELIMINATION_FAVICON_ICO_PREVIEW",
  module_id: "HF12",
  status: "preview_after_targeted_static_select_freeze_elimination_favicon_ico_patch",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    scanned_html_file_count: apply.scanned_html_file_count,
    modified_file_count: apply.summary?.modified_file_count ?? null,
    select_style_file_count: apply.summary?.select_style_file_count ?? null,
    select_script_file_count: apply.summary?.select_script_file_count ?? null,
    favicon_link_file_count: apply.summary?.favicon_link_file_count ?? null
  },
  sample_status: sampleStatus,
  summary: {
    sample_file_count: sampleStatus.length,
    favicon_ico_exists: fs.existsSync(path.join(root, "favicon.ico")),
    favicon_svg_exists: fs.existsSync(path.join(root, "favicon.svg")),
    apple_touch_icon_exists: fs.existsSync(path.join(root, "apple-touch-icon.png")),
    all_samples_have_hf12_select_style: sampleStatus.every((x) => x.hf12_select_style_present),
    all_samples_have_hf12_select_script: sampleStatus.every((x) => x.hf12_select_script_present),
    all_samples_have_hf12_favicon_links: sampleStatus.every((x) => x.hf12_favicon_links_present),
    all_non_login_samples_preserve_hf07_header_nav: sampleStatus.every((x) => x.hf07_header_present && x.hf07_nav_present),
    login_page_remains_static: sampleStatus.find((x) => x.file === "login.html")?.login_page_static_marker_present === true,
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
console.log(`favicon.ico exists: ${output.summary.favicon_ico_exists}`);
console.log(`All samples have safe select script: ${output.summary.all_samples_have_hf12_select_script}`);
console.log(`All samples have HF12 favicon links: ${output.summary.all_samples_have_hf12_favicon_links}`);
