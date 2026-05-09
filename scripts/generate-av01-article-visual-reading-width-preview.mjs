import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "av01-article-visual-reading-width-standardisation-patch.json");
const applyPath = path.join(root, "data", "quality", "av01-article-visual-reading-width-apply-result.json");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const previewPath = path.join(root, "data", "quality", "av01-article-visual-reading-width-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const registry = readJson(registryPath);
const apply = readJson(applyPath);
const sample = fs.existsSync(sampleRegistryPath) ? readJson(sampleRegistryPath) : { entries: [] };
const markers = registry.required_markers;

const sampleStatus = (sample.entries || []).map((entry) => {
  const html = readText(entry.article_path);
  return {
    article_path: entry.article_path,
    av01_style_present: html.includes(markers.av01_style_marker),
    av01_checked_present: html.includes(markers.av01_cleanup_marker),
    av01_visual_marker_count: (html.match(new RegExp(markers.av01_visual_marker, "g")) || []).length,
    ar02c_block_count: (html.match(new RegExp(markers.ar02c_block_marker, "g")) || []).length,
    ar02c_reference_link_count: (html.match(new RegExp(markers.ar02c_reference_link_marker, "g")) || []).length,
    ar02c_image_credit_present: html.includes(markers.ar02c_image_credit_marker),
    expected_urls_present: entry.references.every((ref) => html.includes(ref.url))
  };
});

const routerHtml = fs.existsSync(path.join(root, "article.html")) ? readText("article.html") : "";

const preview = {
  preview_id: "AV01_ARTICLE_VISUAL_READING_WIDTH_PREVIEW",
  module_id: "AV01",
  status: "preview_after_article_visual_reading_width_standardisation",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    article_file_count: apply.summary.article_file_count,
    modified_file_count: apply.summary.modified_file_count,
    total_logo_like_images_replaced: apply.summary.total_logo_like_images_replaced
  },
  sample_status: sampleStatus,
  summary: {
    fallback_assets_exist: Object.values(registry.category_fallback_assets).every((rel) => fs.existsSync(path.join(root, rel))),
    all_article_pages_have_av01_style: apply.summary.article_files_with_av01_style === apply.summary.article_file_count,
    all_article_pages_have_av01_checked_marker: apply.summary.article_files_with_av01_checked_marker === apply.summary.article_file_count,
    router_style_present: routerHtml.includes(markers.av01_style_marker),
    router_script_present: routerHtml.includes(markers.av01_router_script_marker),
    broad_width_rule_present: routerHtml.includes("--drishvara-article-outer-max: 1240px") || apply.summary.reading_width_outer_px === 1240,
    justified_paragraph_rule_present: routerHtml.includes("text-align: justify") || apply.summary.paragraph_alignment === "justify",
    ar02c_sample_references_preserved: sampleStatus.every((row) => row.ar02c_block_count === 1 && row.ar02c_reference_link_count === 2 && row.expected_urls_present),
    ar02c_sample_image_credit_preserved: sampleStatus.every((row) => row.ar02c_image_credit_present),
    article_minimum_word_rule_changed: false,
    article_text_mutation_performed: false,
    article_word_count_reduction_performed: false,
    reference_url_change_performed: false,
    new_reference_insertion_performed: false,
    external_fetch_performed: false,
    backend_activation_performed: false,
    api_route_created: false,
    supabase_enabled: false,
    auth_enabled: false,
    real_login_enabled: false,
    real_signup_enabled: false,
    user_account_collection_enabled: false,
    frontend_deployment_performed: false,
    file_deletion_performed: false,
    file_move_performed: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.writeFileSync(previewPath, JSON.stringify(preview, null, 2) + "\n");

console.log(`Created ${path.relative(root, previewPath)}.`);
console.log(`Fallback assets exist: ${preview.summary.fallback_assets_exist}`);
console.log(`All article pages have AV01 style: ${preview.summary.all_article_pages_have_av01_style}`);
console.log(`Router style/script present: ${preview.summary.router_style_present}/${preview.summary.router_script_present}`);
console.log(`AR02C sample references preserved: ${preview.summary.ar02c_sample_references_preserved}`);
console.log(`Justified paragraph rule present: ${preview.summary.justified_paragraph_rule_present}`);
