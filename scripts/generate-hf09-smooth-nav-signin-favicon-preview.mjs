import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf09-smooth-nav-signin-favicon-patch.json");
const applyPath = path.join(root, "data", "quality", "hf09-smooth-nav-signin-favicon-apply-result.json");
const outPath = path.join(root, "data", "quality", "hf09-smooth-nav-signin-favicon-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(rel) {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function countLiteralBackslashNOutsideProtected(html) {
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
  "login.html",
  "articles/world/ai-future-warfare-2026.html"
].filter((rel) => fs.existsSync(path.join(root, rel)));

const sampleStatus = sampleFiles.map((rel) => {
  const html = readText(rel);
  const isNested = rel.startsWith("articles/");
  const expectedLoginHref = isNested ? "../../login.html" : "login.html";
  const expectedFaviconHref = isNested ? "../../assets/drishvara-favicon.svg" : "assets/drishvara-favicon.svg";

  return {
    file: rel,
    hf09_flicker_guard_present: rel === "login.html" ? true : html.includes(markers.hf09_flicker_guard_marker),
    hf09_static_login_marker_present: rel === "login.html" ? html.includes(markers.hf09_static_login_marker) : true,
    hf09_favicon_link_present: html.includes(markers.hf09_favicon_marker) && html.includes(expectedFaviconHref),
    signin_join_href_correct: rel === "login.html" ? true : html.includes(`href="${expectedLoginHref}"`) && html.includes("Sign in / Join"),
    hf07_header_present: rel === "login.html" ? true : html.includes(markers.hf07_header_marker),
    hf07_nav_present: rel === "login.html" ? true : html.includes(markers.hf07_nav_marker),
    timezone_present: rel === "login.html" ? true : html.includes(markers.hf07_timezone_marker),
    language_toggle_present: rel === "login.html" ? true : html.includes(markers.hf07_language_toggle_marker) && html.includes(markers.hf07_lang_en_marker) && html.includes(markers.hf07_lang_hi_marker),
    literal_backslash_n_outside_script_style_count: countLiteralBackslashNOutsideProtected(html),
    auth_not_active_text_present: rel === "login.html" ? html.includes("No credentials are collected") && html.includes("Access not active") : true
  };
});

const output = {
  preview_id: "HF09_SMOOTH_NAV_SIGNIN_FAVICON_PREVIEW",
  module_id: "HF09",
  status: "preview_after_targeted_static_frontend_smooth_nav_signin_favicon_patch",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    scanned_html_file_count: apply.scanned_html_file_count,
    modified_file_count: apply.summary?.modified_file_count ?? null,
    login_page_created: apply.summary?.login_page_created ?? null,
    favicon_created: apply.summary?.favicon_created ?? null,
    favicon_link_file_count: apply.summary?.favicon_link_file_count ?? null,
    flicker_guard_file_count: apply.summary?.flicker_guard_file_count ?? null
  },
  sample_status: sampleStatus,
  summary: {
    sample_file_count: sampleStatus.length,
    favicon_svg_exists: fs.existsSync(path.join(root, "assets", "drishvara-favicon.svg")),
    login_page_exists: fs.existsSync(path.join(root, "login.html")),
    all_samples_have_favicon_link: sampleStatus.every((x) => x.hf09_favicon_link_present),
    all_non_login_samples_have_flicker_guard: sampleStatus.every((x) => x.hf09_flicker_guard_present),
    all_non_login_samples_have_correct_signin_href: sampleStatus.every((x) => x.signin_join_href_correct),
    login_page_static_marker_present: sampleStatus.find((x) => x.file === "login.html")?.hf09_static_login_marker_present === true,
    login_page_auth_not_active_text_present: sampleStatus.find((x) => x.file === "login.html")?.auth_not_active_text_present === true,
    all_non_login_samples_preserve_hf07_header_nav: sampleStatus.every((x) => x.hf07_header_present && x.hf07_nav_present),
    all_non_login_samples_preserve_timezone: sampleStatus.every((x) => x.timezone_present),
    all_non_login_samples_preserve_language_toggle: sampleStatus.every((x) => x.language_toggle_present),
    literal_backslash_n_removed_outside_script_style: sampleStatus.every((x) => x.literal_backslash_n_outside_script_style_count === 0),
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
console.log(`Favicon SVG exists: ${output.summary.favicon_svg_exists}`);
console.log(`Login page exists: ${output.summary.login_page_exists}`);
console.log(`All samples have favicon link: ${output.summary.all_samples_have_favicon_link}`);
console.log(`Correct Sign in / Join hrefs: ${output.summary.all_non_login_samples_have_correct_signin_href}`);
console.log(`Literal backslash-n removed outside script/style: ${output.summary.literal_backslash_n_removed_outside_script_style}`);
