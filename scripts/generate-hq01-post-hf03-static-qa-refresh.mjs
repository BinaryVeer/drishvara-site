import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hq01-post-hf03-static-qa-refresh.json");
const hf03PreviewPath = path.join(root, "data", "quality", "hf03-homepage-header-interaction-stabilization-preview.json");
const hf03ApplyPath = path.join(root, "data", "quality", "hf03-homepage-header-interaction-stabilization-apply-result.json");
const qa00PreviewPath = path.join(root, "data", "quality", "qa00-homepage-stability-audit-preview.json");
const qa01PreviewPath = path.join(root, "data", "quality", "qa01-build-asset-seo-link-smoke-preview.json");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "data", "quality", "hq01-post-hf03-static-qa-refresh-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length;
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
const hf03Preview = readJson(hf03PreviewPath);
const hf03Apply = readJson(hf03ApplyPath);
const qa00 = readJson(qa00PreviewPath);
const qa01 = readJson(qa01PreviewPath);
const html = readText(indexPath);
const markers = registry.required_static_markers;
const gitStatus = getGitStatusShort();

const navLabelStatus = registry.required_nav_labels.map((label) => ({
  label,
  present: html.includes(label)
}));

const output = {
  preview_id: "HQ01_POST_HF03_STATIC_QA_REFRESH_PREVIEW",
  module_id: "HQ01",
  status: "preview_only_post_hf03_static_qa_refresh_no_mutation",
  preview_only: true,
  git_evidence: {
    head_short: getGitShortHead(),
    status_entry_count: gitStatus.length,
    untracked_entry_count: gitStatus.filter((line) => line.startsWith("??")).length,
    status_entries_preview: gitStatus.slice(0, 30)
  },
  hf03_evidence: {
    hf03_preview_present: true,
    hf03_apply_result_present: true,
    hf03_modified_file_count: hf03Apply.summary?.modified_file_count ?? null,
    hf03_modified_files: hf03Apply.modified_files || [],
    hf03_index_only_patch: hf03Preview.summary?.index_only_patch ?? null,
    hf03_style_marker_present: hf03Preview.summary?.style_marker_present ?? null,
    hf03_script_marker_present: hf03Preview.summary?.script_marker_present ?? null,
    hf03_required_nav_labels_present: hf03Preview.summary?.required_nav_labels_present ?? null,
    hf03_dropdown_guard_preserved: hf03Preview.summary?.dropdown_guard_preserved ?? null,
    hf03_auth_placeholder_preserved: hf03Preview.summary?.auth_placeholder_preserved ?? null
  },
  qa_evidence: {
    qa00_missing_local_asset_count: qa00?.static_scan?.missing_local_asset_count ?? null,
    qa01_missing_local_asset_count: qa01?.summary?.missing_local_asset_count ?? null,
    qa01_missing_local_link_count: qa01?.summary?.missing_local_link_count ?? null
  },
  static_scan: {
    index_exists: html.length > 0,
    nav_count: countMatches(html, /<nav\b[\s\S]*?<\/nav>/gi),
    select_count: countMatches(html, /<select\b/gi),
    hf03_style_marker_present: html.includes(markers.hf03_style_marker),
    hf03_script_marker_present: html.includes(markers.hf03_script_marker),
    hf03_homepage_class_reference_present: html.includes(markers.hf03_homepage_class_reference),
    hf01_dropdown_guard_present: html.includes(markers.hf01_dropdown_guard_marker),
    auth_placeholder_marker_present: html.includes(markers.auth_placeholder_marker),
    hf03_select_marker_reference_present: html.includes(markers.hf03_select_marker),
    hf03_auth_placeholder_guard_reference_present: html.includes(markers.hf03_auth_placeholder_guard),
    decorative_pointer_safety_present: html.includes("pointer-events: none") && html.includes("hero-orbit"),
    required_nav_label_status: navLabelStatus
  },
  summary: {
    index_exists: html.length > 0,
    hf03_markers_present: html.includes(markers.hf03_style_marker) && html.includes(markers.hf03_script_marker),
    required_nav_labels_present: navLabelStatus.every((item) => item.present),
    submissions_present: html.includes("Submissions"),
    dashboard_present: html.includes("Dashboard"),
    signin_join_placeholder_present: html.includes("Sign in / Join") && html.includes(markers.auth_placeholder_marker),
    dropdown_guard_preserved: html.includes(markers.hf01_dropdown_guard_marker),
    select_controls_present: countMatches(html, /<select\b/gi) > 0,
    homepage_stabilization_reference_present: html.includes(markers.hf03_homepage_class_reference),
    decorative_pointer_safety_present: html.includes("pointer-events: none") && html.includes("hero-orbit"),
    qa_static_missing_assets_zero: (qa00?.static_scan?.missing_local_asset_count ?? null) === 0 && (qa01?.summary?.missing_local_asset_count ?? null) === 0,
    qa_static_missing_links_zero: (qa01?.summary?.missing_local_link_count ?? null) === 0,
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
  manual_live_recheck_requirements: registry.manual_live_recheck_requirements,
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)}.`);
console.log(`HF03 markers present: ${output.summary.hf03_markers_present}`);
console.log(`Required nav labels present: ${output.summary.required_nav_labels_present}`);
console.log(`Dropdown guard preserved: ${output.summary.dropdown_guard_preserved}`);
console.log(`QA missing assets zero: ${output.summary.qa_static_missing_assets_zero}`);
console.log(`QA missing links zero: ${output.summary.qa_static_missing_links_zero}`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
