import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hq00-post-hf01-static-qa-refresh.json");
const hf01PreviewPath = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-preview.json");
const hf01ApplyPath = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-apply-result.json");
const outPath = path.join(root, "data", "quality", "hq00-post-hf01-static-qa-refresh-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
}

function collectArticleFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll(path.sep, "/");

    if (
      rel.includes("backup") ||
      rel.startsWith("archive/") ||
      rel.startsWith("node_modules/") ||
      rel.startsWith("drishvara_phase01_scaffold/")
    ) {
      continue;
    }

    if (entry.isDirectory()) collectArticleFiles(full, files);
    else if (rel.endsWith(".html") && rel !== "admin.html") files.push(rel);
  }
  return files;
}

function getGitShortHead() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim();
  } catch {
    return null;
  }
}

function getGitStatusShort() {
  try {
    return execSync("git status --short", { cwd: root }).toString().trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

const registry = readJson(registryPath);
const hf01Preview = readJson(hf01PreviewPath);
const hf01Apply = readJson(hf01ApplyPath);

const topLevelFiles = [
  "index.html",
  "about.html",
  "article.html",
  "contact.html",
  "dashboard.html",
  "insights.html",
  "login.html",
  "submissions.html"
];

const articleFiles = collectArticleFiles(path.join(root, "articles"));
const checkedFiles = [...topLevelFiles, ...articleFiles];

const markers = registry.required_static_markers;

const pageChecks = checkedFiles.map((file) => {
  const html = readText(file);
  return {
    file,
    exists: html.length > 0,
    has_home: html.includes(">Home<"),
    has_about: html.includes(">About<"),
    has_insights: html.includes(">Insights<"),
    has_submissions: html.includes(">Submissions<"),
    has_dashboard: html.includes(">Dashboard<"),
    has_contact: html.includes(">Contact<"),
    has_signin_join: html.includes("Sign in / Join"),
    has_auth_placeholder_marker: html.includes(markers.auth_placeholder_marker),
    has_dropdown_guard: html.includes(markers.dropdown_guard_marker)
  };
});

const articleChecks = ["article.html", ...articleFiles].map((file) => {
  const html = readText(file);
  return {
    file,
    exists: html.length > 0,
    has_reference_placeholder: html.includes(markers.reference_placeholder),
    has_image_credit_placeholder: html.includes(markers.image_credit_placeholder),
    has_trust_block_marker: html.includes(markers.trust_block_marker),
    contains_invented_link_label: html.includes("Link 1") || html.includes("Link 2")
  };
});

const gitStatus = getGitStatusShort();

const output = {
  preview_id: "HQ00_POST_HF01_STATIC_QA_REFRESH_PREVIEW",
  module_id: "HQ00",
  status: "preview_only_post_hf01_static_qa_refresh_no_mutation",
  preview_only: true,
  git_evidence: {
    head_short: getGitShortHead(),
    status_entry_count: gitStatus.length,
    untracked_entry_count: gitStatus.filter((line) => line.startsWith("??")).length,
    status_entries_preview: gitStatus.slice(0, 30)
  },
  hf01_evidence: {
    hf01_preview_present: true,
    hf01_apply_result_present: true,
    hf01_modified_file_count: hf01Apply.summary?.modified_file_count ?? null,
    hf01_navigation_corrected_file_count: hf01Apply.summary?.navigation_corrected_file_count ?? null,
    hf01_dropdown_guard_file_count: hf01Apply.summary?.dropdown_guard_file_count ?? null,
    hf01_trust_block_file_count: hf01Apply.summary?.trust_block_file_count ?? null,
    hf01_nav_all_have_submissions: hf01Preview.summary?.nav_all_have_submissions ?? null,
    hf01_articles_all_have_reference_block: hf01Preview.summary?.articles_all_have_reference_block ?? null,
    hf01_articles_all_have_image_credit_block: hf01Preview.summary?.articles_all_have_image_credit_block ?? null
  },
  static_scan: {
    checked_public_file_count: checkedFiles.length,
    checked_article_file_count: articleChecks.length,
    page_checks: pageChecks,
    article_checks: articleChecks
  },
  summary: {
    checked_public_file_count: checkedFiles.length,
    checked_article_file_count: articleChecks.length,
    all_pages_exist: pageChecks.every((x) => x.exists),
    all_pages_have_submissions: pageChecks.every((x) => x.has_submissions),
    all_pages_have_dashboard: pageChecks.every((x) => x.has_dashboard),
    all_pages_have_signin_join_placeholder: pageChecks.every((x) => x.has_signin_join && x.has_auth_placeholder_marker),
    all_pages_have_dropdown_guard: pageChecks.every((x) => x.has_dropdown_guard),
    all_article_pages_have_reference_placeholder: articleChecks.every((x) => x.has_reference_placeholder && x.has_trust_block_marker),
    all_article_pages_have_image_credit_placeholder: articleChecks.every((x) => x.has_image_credit_placeholder && x.has_trust_block_marker),
    invented_link_label_count: articleChecks.filter((x) => x.contains_invented_link_label).length,
    mutation_performed_count: 0,
    activation_performed_count: 0,
    backend_activation_enabled: false,
    api_route_enabled: false,
    supabase_enabled: false,
    auth_enabled: false,
    real_login_enabled: false,
    real_signup_enabled: false,
    user_account_collection_enabled: false,
    public_dynamic_output_enabled: false,
    subscriber_output_enabled: false,
    frontend_deployment_enabled: false,
    backend_deployment_enabled: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)}.`);
console.log(`Checked public files: ${output.summary.checked_public_file_count}`);
console.log(`Checked article files: ${output.summary.checked_article_file_count}`);
console.log(`All pages have Submissions: ${output.summary.all_pages_have_submissions}`);
console.log(`All pages have dropdown guard: ${output.summary.all_pages_have_dropdown_guard}`);
console.log(`All article pages have reference placeholder: ${output.summary.all_article_pages_have_reference_placeholder}`);
console.log(`All article pages have image credit placeholder: ${output.summary.all_article_pages_have_image_credit_placeholder}`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
