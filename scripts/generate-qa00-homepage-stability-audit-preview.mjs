import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "qa00-first-page-homepage-stability-audit-checklist.json");
const outPath = path.join(root, "data", "quality", "qa00-homepage-stability-audit-preview.json");
const indexPath = path.join(root, "index.html");

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

function isDynamicOrPlaceholderRef(ref) {
  const value = String(ref || "").trim();

  if (!value) return true;

  // Ignore JS/template placeholders and runtime variables captured by simple HTML regex scans.
  if (value.includes("${") || value.includes("}") || value.includes("(") || value.includes(")")) return true;

  // Ignore bare JS variable names such as imagePath, fallbackPath, item, href, src.
  // Real local paths normally contain / or . or start with ./ or ../.
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)) return true;

  return false;
}

function isLocalRef(ref) {
  return ref &&
    !isDynamicOrPlaceholderRef(ref) &&
    !ref.startsWith("http://") &&
    !ref.startsWith("https://") &&
    !ref.startsWith("//") &&
    !ref.startsWith("#") &&
    !ref.startsWith("mailto:") &&
    !ref.startsWith("tel:");
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
const indexExists = fs.existsSync(indexPath);
const html = indexExists ? fs.readFileSync(indexPath, "utf8") : "";

const stylesheetRefs = extractAttrs(html, "link", "href").filter((ref) => ref.endsWith(".css") || ref.includes(".css?"));
const scriptRefs = extractAttrs(html, "script", "src");
const imageRefs = [
  ...extractAttrs(html, "img", "src"),
  ...Array.from(html.matchAll(/url\(["']?([^"')]+)["']?\)/gi)).map((m) => m[1])
];

const anchorRefs = extractAttrs(html, "a", "href");

const localStylesheets = stylesheetRefs.filter(isLocalRef).map((ref) => ({ ref, status: localStatus(ref) }));
const localScripts = scriptRefs.filter(isLocalRef).map((ref) => ({ ref, status: localStatus(ref) }));
const localImages = imageRefs.filter(isLocalRef).map((ref) => ({ ref, status: localStatus(ref) }));
const localAnchors = anchorRefs.filter(isLocalRef).map((ref) => ({ ref, status: ref.startsWith("#") ? "anchor_only" : localStatus(ref) }));

const metaDescriptionPresent = /<meta[^>]+name=["']description["'][^>]*>/i.test(html);
const viewportPresent = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
const titlePresent = /<title>[^<]+<\/title>/i.test(html);
const ogTitlePresent = /<meta[^>]+property=["']og:title["'][^>]*>/i.test(html);
const ogImagePresent = /<meta[^>]+property=["']og:image["'][^>]*>/i.test(html);

const missingAssets = [
  ...localStylesheets.filter((x) => x.status === "missing").map((x) => x.ref),
  ...localScripts.filter((x) => x.status === "missing").map((x) => x.ref),
  ...localImages.filter((x) => x.status === "missing").map((x) => x.ref)
];

function inferStatus(item) {
  if (item.item_key === "homepage_file_present") return indexExists ? "pass" : "fail";
  if (item.item_key === "title_tag_present") return titlePresent ? "pass" : "warning";
  if (item.item_key === "meta_description_present") return metaDescriptionPresent ? "pass" : "warning";
  if (item.item_key === "viewport_meta_present") return viewportPresent ? "pass" : "warning";
  if (item.item_key === "og_title_present") return ogTitlePresent ? "pass" : "warning";
  if (item.item_key === "og_image_present") return ogImagePresent ? "pass" : "warning";
  if (item.item_key === "local_stylesheets_resolve") return localStylesheets.some((x) => x.status === "missing") ? "fail" : "pass";
  if (item.item_key === "local_scripts_resolve") return localScripts.some((x) => x.status === "missing") ? "fail" : "pass";
  if (item.item_key === "local_images_resolve") return localImages.some((x) => x.status === "missing") ? "warning" : "pass";
  return "not_checked";
}

const auditItems = registry.audit_items.map((item) => ({
  ...item,
  status: inferStatus(item),
  mutation_performed: false
}));

const statusCounts = {};
const areaCounts = {};
for (const item of auditItems) {
  statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
  areaCounts[item.area] = (areaCounts[item.area] || 0) + 1;
}

const output = {
  preview_id: "QA00_HOMEPAGE_STABILITY_AUDIT_PREVIEW",
  module_id: "QA00",
  status: "preview_only_homepage_stability_audit_no_mutation",
  preview_only: true,
  static_scan: {
    index_exists: indexExists,
    title_present: titlePresent,
    meta_description_present: metaDescriptionPresent,
    viewport_meta_present: viewportPresent,
    og_title_present: ogTitlePresent,
    og_image_present: ogImagePresent,
    stylesheet_refs: localStylesheets,
    script_refs: localScripts,
    image_refs: localImages,
    anchor_refs: localAnchors,
    missing_local_asset_count: missingAssets.length,
    missing_local_assets: missingAssets
  },
  audit_items: auditItems,
  summary: {
    audit_item_count: auditItems.length,
    status_counts: statusCounts,
    area_counts: areaCounts,
    mutation_performed_count: 0,
    inferred_static_pass_count: statusCounts.pass || 0,
    inferred_static_warning_count: statusCounts.warning || 0,
    inferred_static_fail_count: statusCounts.fail || 0,
    manual_check_remaining_count: statusCounts.not_checked || 0,
    homepage_mutation_enabled: false,
    asset_mutation_enabled: false,
    backend_activation_enabled: false,
    api_route_enabled: false,
    supabase_enabled: false,
    auth_enabled: false,
    public_dynamic_output_enabled: false,
    subscriber_output_enabled: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${auditItems.length} homepage audit items. No mutation.`);
console.log(`Static scan: ${missingAssets.length} missing local asset reference(s).`);
