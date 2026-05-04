import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "qa01-build-asset-seo-link-smoke-test-plan.json");
const qa00PreviewPath = path.join(root, "data", "quality", "qa00-homepage-stability-audit-preview.json");
const outPath = path.join(root, "data", "quality", "qa01-build-asset-seo-link-smoke-preview.json");
const indexPath = path.join(root, "index.html");
const packagePath = path.join(root, "package.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function extractAttrs(html, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, "gi");
  const out = [];
  let match;
  while ((match = regex.exec(html)) !== null) out.push(match[1]);
  return out;
}

function extractMetaContent(html, attrName, attrValue) {
  const regex = new RegExp(`<meta[^>]*${attrName}=["']${attrValue}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta[^>]*content=["']([^"']*)["'][^>]*${attrName}=["']${attrValue}["'][^>]*>`, "i");
  const match = html.match(regex);
  return match ? (match[1] || match[2] || "") : "";
}

function isLocalRef(ref) {
  return ref && !ref.startsWith("http://") && !ref.startsWith("https://") && !ref.startsWith("//") && !ref.startsWith("#") && !ref.startsWith("mailto:") && !ref.startsWith("tel:");
}

function cleanRef(ref) {
  return ref.split("#")[0].split("?")[0].replace(/^\.\//, "");
}

function localStatus(ref) {
  const cleaned = cleanRef(ref);
  if (!cleaned) return "not_applicable";
  return fs.existsSync(path.join(root, cleaned)) ? "present" : "missing";
}

const registry = readJson(registryPath);
const qa00Preview = readJson(qa00PreviewPath);
const packageJson = readJson(packagePath);

const indexExists = fs.existsSync(indexPath);
const html = indexExists ? fs.readFileSync(indexPath, "utf8") : "";

const scripts = packageJson.scripts || {};
const hasValidateProject = Boolean(scripts["validate:project"]);
const hasValidateQa = Boolean(scripts["validate:qa"]);
const hasBuild = Boolean(scripts["build"]);

const stylesheetRefs = extractAttrs(html, "link", "href").filter((ref) => ref.includes(".css"));
const scriptRefs = extractAttrs(html, "script", "src");
const imageRefs = [
  ...extractAttrs(html, "img", "src"),
  ...Array.from(html.matchAll(/url\(["']?([^"')]+)["']?\)/gi)).map((m) => m[1])
];
const anchorRefs = extractAttrs(html, "a", "href");

const localStylesheets = stylesheetRefs.filter(isLocalRef).map((ref) => ({ ref, status: localStatus(ref) }));
const localScripts = scriptRefs.filter(isLocalRef).map((ref) => ({ ref, status: localStatus(ref) }));
const localImages = imageRefs.filter(isLocalRef).map((ref) => ({ ref, status: localStatus(ref) }));
const localPageLinks = anchorRefs.filter(isLocalRef).filter((ref) => !ref.startsWith("#")).map((ref) => ({ ref, status: localStatus(ref) }));
const anchorLinks = anchorRefs.filter((ref) => ref.startsWith("#")).map((ref) => ({ ref, status: "manual_anchor_check" }));
const externalLinks = anchorRefs.filter((ref) => ref.startsWith("http://") || ref.startsWith("https://")).map((ref) => ({ ref, status: "manual_external_check" }));

const missingStyles = localStylesheets.filter((x) => x.status === "missing").map((x) => x.ref);
const missingScripts = localScripts.filter((x) => x.status === "missing").map((x) => x.ref);
const missingImages = localImages.filter((x) => x.status === "missing").map((x) => x.ref);
const missingLocalLinks = localPageLinks.filter((x) => x.status === "missing").map((x) => x.ref);

const allMissingLocalAssets = [...missingStyles, ...missingScripts, ...missingImages];

const titlePresent = /<title>[^<]+<\/title>/i.test(html);
const metaDescriptionContent = extractMetaContent(html, "name", "description");
const viewportPresent = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
const ogTitleContent = extractMetaContent(html, "property", "og:title");
const ogDescriptionContent = extractMetaContent(html, "property", "og:description");
const ogImageContent = extractMetaContent(html, "property", "og:image");
const faviconRefs = extractAttrs(html, "link", "href").filter((ref) => /icon/i.test(ref));

const backupRefs = [...stylesheetRefs, ...scriptRefs, ...imageRefs, ...anchorRefs].filter((ref) => ref.includes("backup"));

function inferStatus(item) {
  switch (item.item_key) {
    case "package_json_present": return fs.existsSync(packagePath) ? "pass" : "fail";
    case "validate_project_script_present": return hasValidateProject ? "pass" : "fail";
    case "validate_qa_script_present": return hasValidateQa ? "pass" : "fail";
    case "build_script_reviewed": return hasBuild ? "pass" : "warning";
    case "no_env_required_for_homepage_static": return "pass";
    case "index_html_present": return indexExists ? "pass" : "fail";
    case "stylesheet_refs_resolve": return missingStyles.length ? "fail" : "pass";
    case "script_refs_resolve": return missingScripts.length ? "fail" : "pass";
    case "image_refs_reviewed": return missingImages.length ? "warning" : "pass";
    case "critical_asset_missing_reviewed": return allMissingLocalAssets.length ? "warning" : "pass";
    case "backup_refs_not_used_as_live_assets": return backupRefs.length ? "warning" : "pass";
    case "title_present": return titlePresent ? "pass" : "warning";
    case "meta_description_present": return metaDescriptionContent ? "pass" : "warning";
    case "viewport_present": return viewportPresent ? "pass" : "warning";
    case "og_title_present": return ogTitleContent ? "pass" : "warning";
    case "og_description_present": return ogDescriptionContent ? "pass" : "warning";
    case "og_image_present": return ogImageContent ? "pass" : "warning";
    case "favicon_reviewed": return faviconRefs.length ? "pass" : "warning";
    case "anchor_links_reviewed": return anchorLinks.length ? "not_checked" : "not_applicable";
    case "local_page_links_reviewed": return missingLocalLinks.length ? "warning" : "pass";
    case "external_links_reviewed": return externalLinks.length ? "not_checked" : "not_applicable";
    case "cta_links_reviewed": return "not_checked";
    case "language_scripts_resolve": {
      const langScripts = localScripts.filter((x) => x.ref.toLowerCase().includes("language"));
      return langScripts.some((x) => x.status === "missing") ? "fail" : (langScripts.length ? "pass" : "warning");
    }
    default: return "not_checked";
  }
}

const smokeItems = registry.smoke_items.map((item) => ({
  ...item,
  status: inferStatus(item),
  mutation_performed: false
}));

const statusCounts = {};
const areaCounts = {};
for (const item of smokeItems) {
  statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
  areaCounts[item.area] = (areaCounts[item.area] || 0) + 1;
}

const output = {
  preview_id: "QA01_BUILD_ASSET_SEO_LINK_SMOKE_PREVIEW",
  module_id: "QA01",
  status: "preview_only_build_asset_seo_link_smoke_no_mutation",
  preview_only: true,
  static_smoke_scan: {
    package_json_present: fs.existsSync(packagePath),
    package_scripts_present: Object.keys(scripts).sort(),
    build_script_present: hasBuild,
    validate_project_script_present: hasValidateProject,
    validate_qa_script_present: hasValidateQa,
    index_exists: indexExists,
    title_present: titlePresent,
    meta_description_present: Boolean(metaDescriptionContent),
    viewport_present: viewportPresent,
    og_title_present: Boolean(ogTitleContent),
    og_description_present: Boolean(ogDescriptionContent),
    og_image_present: Boolean(ogImageContent),
    favicon_refs: faviconRefs,
    stylesheet_refs: localStylesheets,
    script_refs: localScripts,
    image_refs: localImages,
    local_page_links: localPageLinks,
    anchor_links: anchorLinks,
    external_links: externalLinks,
    backup_refs: backupRefs,
    missing_local_asset_count: allMissingLocalAssets.length,
    missing_stylesheet_refs: missingStyles,
    missing_script_refs: missingScripts,
    missing_image_refs: missingImages,
    missing_local_link_count: missingLocalLinks.length,
    missing_local_links: missingLocalLinks,
    qa00_missing_local_asset_count: qa00Preview?.static_scan?.missing_local_asset_count ?? null
  },
  smoke_items: smokeItems,
  summary: {
    smoke_item_count: smokeItems.length,
    status_counts: statusCounts,
    area_counts: areaCounts,
    mutation_performed_count: 0,
    missing_local_asset_count: allMissingLocalAssets.length,
    missing_local_link_count: missingLocalLinks.length,
    manual_check_remaining_count: statusCounts.not_checked || 0,
    warning_count: statusCounts.warning || 0,
    fail_count: statusCounts.fail || 0,
    pass_count: statusCounts.pass || 0,
    homepage_mutation_enabled: false,
    asset_mutation_enabled: false,
    seo_metadata_mutation_enabled: false,
    language_runtime_mutation_enabled: false,
    backend_activation_enabled: false,
    api_route_enabled: false,
    supabase_enabled: false,
    auth_enabled: false,
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

console.log(`Created ${path.relative(root, outPath)} with ${smokeItems.length} smoke-test items. No mutation.`);
console.log(`Missing local asset references: ${allMissingLocalAssets.length}`);
console.log(`Missing local page links: ${missingLocalLinks.length}`);
