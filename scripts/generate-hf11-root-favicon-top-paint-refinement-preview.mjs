import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf11-root-favicon-top-paint-refinement-patch.json");
const applyPath = path.join(root, "data", "quality", "hf11-root-favicon-top-paint-refinement-apply-result.json");
const outPath = path.join(root, "data", "quality", "hf11-root-favicon-top-paint-refinement-preview.json");

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
    hf11_favicon_present: html.includes(markers.hf11_favicon_marker) && html.includes('href="/favicon.svg"'),
    hf11_top_paint_present: html.includes(markers.hf11_top_paint_marker),
    hf10_critical_paint_present: html.includes(markers.hf10_critical_paint_marker),
    hf09_favicon_present: html.includes(markers.hf09_favicon_marker),
    hf09_login_marker_present: isLogin ? html.includes(markers.hf09_static_login_marker) : true,
    hf07_header_present: isLogin ? true : html.includes(markers.hf07_header_marker),
    hf07_nav_present: isLogin ? true : html.includes(markers.hf07_nav_marker),
    top_paint_contains_band_refinement: html.includes("body::before") && html.includes("height: 132px")
  };
});

const output = {
  preview_id: "HF11_ROOT_FAVICON_TOP_PAINT_REFINEMENT_PREVIEW",
  module_id: "HF11",
  status: "preview_after_targeted_static_root_favicon_top_paint_refinement",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    scanned_html_file_count: apply.scanned_html_file_count,
    modified_file_count: apply.summary?.modified_file_count ?? null,
    root_favicon_created: apply.summary?.root_favicon_created ?? null,
    root_favicon_link_file_count: apply.summary?.root_favicon_link_file_count ?? null,
    top_paint_refinement_file_count: apply.summary?.top_paint_refinement_file_count ?? null
  },
  sample_status: sampleStatus,
  summary: {
    sample_file_count: sampleStatus.length,
    root_favicon_exists: fs.existsSync(path.join(root, "favicon.svg")),
    asset_favicon_exists: fs.existsSync(path.join(root, "assets", "drishvara-favicon.svg")),
    all_samples_have_hf11_favicon: sampleStatus.every((x) => x.hf11_favicon_present),
    all_samples_have_hf11_top_paint: sampleStatus.every((x) => x.hf11_top_paint_present),
    all_samples_preserve_hf10_critical_paint: sampleStatus.every((x) => x.hf10_critical_paint_present),
    all_samples_preserve_hf09_favicon: sampleStatus.every((x) => x.hf09_favicon_present),
    login_page_remains_static: sampleStatus.find((x) => x.file === "login.html")?.hf09_login_marker_present === true,
    all_non_login_samples_preserve_hf07_header_nav: sampleStatus.every((x) => x.hf07_header_present && x.hf07_nav_present),
    all_samples_have_top_band_refinement: sampleStatus.every((x) => x.top_paint_contains_band_refinement),
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
console.log(`Root favicon exists: ${output.summary.root_favicon_exists}`);
console.log(`All samples have HF11 favicon: ${output.summary.all_samples_have_hf11_favicon}`);
console.log(`All samples have top paint refinement: ${output.summary.all_samples_have_hf11_top_paint}`);
