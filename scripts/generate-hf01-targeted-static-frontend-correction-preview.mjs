import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-patch.json");
const applyPath = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-apply-result.json");
const outPath = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function read(file) {
  return fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), "utf8") : "";
}

function collectArticleFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll(path.sep, "/");
    if (rel.includes("backup") || rel.includes("node_modules")) continue;
    if (entry.isDirectory()) collectArticleFiles(full, files);
    else if (rel.endsWith(".html")) files.push(rel);
  }
  return files;
}

const registry = readJson(registryPath);
const apply = readJson(applyPath);

const topLevelFiles = ["index.html", "about.html", "article.html", "contact.html", "dashboard.html", "insights.html", "login.html", "submissions.html"];
const articleFiles = collectArticleFiles(path.join(root, "articles"));

const navChecks = topLevelFiles.concat(articleFiles).map((file) => {
  const html = read(file);
  return {
    file,
    has_home: html.includes(">Home<"),
    has_about: html.includes(">About<"),
    has_insights: html.includes(">Insights<"),
    has_submissions: html.includes(">Submissions<"),
    has_dashboard: html.includes(">Dashboard<"),
    has_contact: html.includes(">Contact<"),
    has_signin_join: html.includes("Sign in / Join"),
    has_auth_placeholder: html.includes("data-drishvara-auth-placeholder")
  };
});

const articleTrustChecks = ["article.html"].concat(articleFiles).map((file) => {
  const html = read(file);
  return {
    file,
    has_reference_block: html.includes("References are under editorial verification"),
    has_image_credit_block: html.includes("Image credit: under review"),
    has_trust_block_marker: html.includes("data-drishvara-hf01-trust-block")
  };
});

const dropdownGuardChecks = topLevelFiles.concat(articleFiles).map((file) => {
  const html = read(file);
  return {
    file,
    has_dropdown_guard: html.includes("data-drishvara-hf01-dropdown-guard")
  };
});

const output = {
  preview_id: "HF01_TARGETED_STATIC_FRONTEND_CORRECTION_PREVIEW",
  module_id: "HF01",
  status: "preview_after_limited_static_frontend_correction",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    modified_file_count: apply.summary?.modified_file_count ?? null,
    navigation_corrected_file_count: apply.summary?.navigation_corrected_file_count ?? null,
    dropdown_guard_file_count: apply.summary?.dropdown_guard_file_count ?? null,
    trust_block_file_count: apply.summary?.trust_block_file_count ?? null
  },
  nav_checks: navChecks,
  article_trust_checks: articleTrustChecks,
  dropdown_guard_checks: dropdownGuardChecks,
  summary: {
    nav_check_count: navChecks.length,
    nav_all_have_submissions: navChecks.every((x) => x.has_submissions),
    nav_all_have_dashboard: navChecks.every((x) => x.has_dashboard),
    nav_all_have_signin_join: navChecks.every((x) => x.has_signin_join && x.has_auth_placeholder),
    article_trust_check_count: articleTrustChecks.length,
    articles_all_have_reference_block: articleTrustChecks.every((x) => x.has_reference_block && x.has_trust_block_marker),
    articles_all_have_image_credit_block: articleTrustChecks.every((x) => x.has_image_credit_block && x.has_trust_block_marker),
    dropdown_guard_check_count: dropdownGuardChecks.length,
    dropdown_guard_present_all_checked_files: dropdownGuardChecks.every((x) => x.has_dropdown_guard),
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
console.log(`Navigation checks: ${output.summary.nav_check_count}`);
console.log(`Article trust checks: ${output.summary.article_trust_check_count}`);
console.log(`All nav have Submissions: ${output.summary.nav_all_have_submissions}`);
console.log(`All article pages have reference block: ${output.summary.articles_all_have_reference_block}`);
console.log(`All article pages have image credit block: ${output.summary.articles_all_have_image_credit_block}`);
