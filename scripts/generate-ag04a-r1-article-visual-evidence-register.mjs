import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag04a-r1-article-visual-evidence-register.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function countAg03ReferenceLinks(html) {
  return (html.match(/data-drishvara-ag03c[^=\s>"]*reference-link=["']true["']/g) || []).length;
}

function textBetween(value, max = 220) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function attr(tag, name) {
  const re = new RegExp(`${name}=["']([^"']+)["']`, "i");
  const m = String(tag || "").match(re);
  return m ? m[1] : "";
}

function extractTitle(html) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return textBetween(h1[1].replace(/<[^>]+>/g, ""), 160);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return title ? textBetween(title[1].replace(/<[^>]+>/g, ""), 160) : "";
}

function extractImageTags(html) {
  const items = [];
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    items.push({
      tag,
      src: attr(tag, "src"),
      alt: attr(tag, "alt"),
      has_ag02_hero_marker: tag.includes('data-drishvara-ag02-hero-visual="true"'),
      has_ag02_credit_marker: tag.includes('data-drishvara-ag02-image-credit="true"')
    });
  }
  return items.filter((item) => item.src);
}

function isLikelyLogo(src) {
  return /logo|favicon|apple-touch|brand|seal|mark|emblem|icon/i.test(String(src || ""));
}

function isImageLike(src) {
  const s = String(src || "").toLowerCase();

  // Standard local/static images.
  if (/\.(png|jpe?g|webp|svg|gif|avif)(\?|#|$)/i.test(s)) return true;

  // Dynamic CDN image URLs often do not end with an extension.
  // Unsplash image URLs are valid article visuals even when served with query params.
  if (/^https?:\/\/images\.unsplash\.com\//i.test(s)) return true;
  if (/^https?:\/\/images\.pexels\.com\//i.test(s)) return true;
  if (/^https?:\/\/cdn\./i.test(s) && /image|photo|visual|media|asset|upload/.test(s)) return true;

  // Local routed/generated image paths may also be extensionless.
  if (/assets\/(article|articles|images|hero|visual|generated|media)/i.test(s)) return true;

  return false;
}

function creditEvidence(html) {
  const markerPresent = html.includes('data-drishvara-ag02-image-credit="true"');
  const patterns = [
    /image\s*(credit|source|attribution)[\s\S]{0,180}/i,
    /photo\s*(credit|source|attribution)[\s\S]{0,180}/i,
    /visual\s*(credit|source|attribution)[\s\S]{0,180}/i,
    /source\s*:[\s\S]{0,180}/i,
    /attribution[\s\S]{0,180}/i
  ];
  const snippets = [];
  for (const pattern of patterns) {
    const m = html.match(pattern);
    if (m) snippets.push(textBetween(m[0]));
  }
  return {
    marker_present: markerPresent,
    generic_credit_text_present: snippets.length > 0,
    snippets: [...new Set(snippets)].slice(0, 5),
    credit_or_source_present: markerPresent || snippets.length > 0
  };
}

function widthEvidence(html, ag04aRow) {
  const maxWidthMatches = [...html.matchAll(/max-width\s*:\s*([0-9.]+)\s*(px|rem|ch|%)/gi)].map((m) => `${m[1]}${m[2]}`);
  const justifyPresent = /text-align\s*:\s*justify|text-align-justify|\bjustify\b/i.test(html);

  return {
    html_max_width_signals: maxWidthMatches.slice(0, 10),
    html_justify_signal_present: justifyPresent,
    ag04a_html_broad_width_signal_present: ag04aRow.html_broad_width_signal_present === true,
    ag04a_html_justify_signal_present: ag04aRow.html_justify_signal_present === true,
    ag04a_global_css_broad_width_signal_present: ag04aRow.global_css_broad_width_signal_present === true,
    ag04a_global_css_justify_signal_present: ag04aRow.global_css_justify_signal_present === true,
    ag04a_reading_width_appears_aligned: ag04aRow.reading_width_appears_aligned === true
  };
}

const config = readJson(configPath);
const ag04a = readJson(path.join(root, config.input_files.ag04a_audit));
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure_audit));

if (ag03z.summary?.ag03_reference_scaling_closed !== true) {
  throw new Error("AG03Z closure must be true before AG04A-R1.");
}
if (ag04a.summary?.ag03_integrity_preserved !== true) {
  throw new Error("AG04A AG03 integrity must be preserved before AG04A-R1.");
}

const ag04aByPath = new Map((ag04a.article_results || []).map((row) => [row.article_path, row]));

const entries = (ag04a.article_results || []).map((ag04aRow, index) => {
  const articlePath = ag04aRow.article_path;
  const full = path.join(root, articlePath);
  if (!fs.existsSync(full)) throw new Error(`Missing article: ${articlePath}`);

  const html = fs.readFileSync(full, "utf8");
  const images = extractImageTags(html);
  const heroImage = images.find((img) => img.has_ag02_hero_marker) || images.find((img) => !isLikelyLogo(img.src)) || images[0] || null;
  const credit = creditEvidence(html);
  const width = widthEvidence(html, ag04aRow);
  const ag03ReferenceLinkCount = countAg03ReferenceLinks(html);

  const visualEvidenceGap =
    !heroImage ||
    !isImageLike(heroImage.src) ||
    isLikelyLogo(heroImage.src) ||
    ag04aRow.probable_logo_fallback_visual === true ||
    ag04aRow.has_usable_article_visual !== true;

  const creditEvidenceGap = credit.credit_or_source_present !== true || ag04aRow.has_image_credit_or_source !== true;
  const widthEvidenceGap = ag04aRow.reading_width_appears_aligned !== true;

  let manualReviewStatus = "manual_review_not_required_by_audit";
  if (visualEvidenceGap || creditEvidenceGap || widthEvidenceGap) {
    manualReviewStatus = "manual_review_required_due_to_visual_evidence_gap";
  }

  return {
    register_id: `AG04A_R1_VISUAL_EVIDENCE_${String(index + 1).padStart(3, "0")}`,
    article_path: articlePath,
    detected_title: extractTitle(html),
    category: ag04aRow.article_path.split("/")[1] || "",
    ag03_reference_link_count: ag03ReferenceLinkCount,
    ag03_integrity_status: ag03ReferenceLinkCount === config.expected.references_per_article ? "passed" : "failed",

    visual_evidence: {
      image_count: images.length,
      primary_image_src: heroImage ? heroImage.src : "",
      primary_image_alt: heroImage ? heroImage.alt : "",
      primary_image_has_ag02_hero_marker: heroImage ? heroImage.has_ag02_hero_marker : false,
      primary_image_is_logo_or_brand_like: heroImage ? isLikelyLogo(heroImage.src) : false,
      ag04a_has_usable_article_visual: ag04aRow.has_usable_article_visual === true,
      ag04a_probable_logo_fallback_visual: ag04aRow.probable_logo_fallback_visual === true,
      first_image_sources: images.slice(0, 6).map((img) => ({
        src: img.src,
        alt: img.alt,
        logo_or_brand_like: isLikelyLogo(img.src),
        has_ag02_hero_marker: img.has_ag02_hero_marker
      }))
    },

    image_credit_evidence: credit,

    reading_surface_evidence: width,

    review_flags: {
      visual_evidence_gap: visualEvidenceGap,
      credit_evidence_gap: creditEvidenceGap,
      reading_width_evidence_gap: widthEvidenceGap,
      ag03_reference_integrity_drift: ag03ReferenceLinkCount !== config.expected.references_per_article
    },

    manual_review_status: manualReviewStatus,
    manual_review_note: manualReviewStatus === "manual_review_not_required_by_audit"
      ? "Audit evidence indicates visual, credit, reading width and AG03 reference integrity are acceptable; optional human review may still be performed for live visual quality."
      : "Manual visual review required before any correction patch."
  };
});

const manualReviewQueue = entries.filter((entry) => entry.manual_review_status !== "manual_review_not_required_by_audit");

const register = {
  register_id: "AG04A_R1_ARTICLE_VISUAL_EVIDENCE_REGISTER",
  module_id: "AG04A-R1",
  status: "article_visual_evidence_register_created",
  generated_at: new Date().toISOString(),

  mutation_performed: false,
  article_html_mutation_performed: false,
  article_text_mutation_performed: false,
  article_image_mutation_performed: false,
  image_credit_mutation_performed: false,
  reference_url_change_performed: false,
  css_mutation_performed: false,
  external_fetch_performed_by_script: false,
  backend_activation_performed: false,
  api_route_created: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  frontend_deployment_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,

  source_context: {
    ag04a_summary: ag04a.summary,
    ag03z_closed: ag03z.summary.ag03_reference_scaling_closed === true
  },

  summary: {
    evidence_article_count: entries.length,
    expected_article_count: config.expected.article_count,
    live_ag03_reference_link_count: entries.reduce((sum, entry) => sum + entry.ag03_reference_link_count, 0),
    expected_ag03_reference_link_count: config.expected.ag03_reference_link_count,
    articles_with_exactly_two_ag03_links: entries.filter((entry) => entry.ag03_reference_link_count === config.expected.references_per_article).length,
    articles_with_primary_image_src: entries.filter((entry) => !!entry.visual_evidence.primary_image_src).length,
    articles_with_ag02_hero_marker_on_primary_image: entries.filter((entry) => entry.visual_evidence.primary_image_has_ag02_hero_marker).length,
    articles_with_logo_or_brand_like_primary_image: entries.filter((entry) => entry.visual_evidence.primary_image_is_logo_or_brand_like).length,
    articles_with_credit_or_source_evidence: entries.filter((entry) => entry.image_credit_evidence.credit_or_source_present).length,
    articles_with_reading_width_evidence_aligned: entries.filter((entry) => entry.reading_surface_evidence.ag04a_reading_width_appears_aligned).length,
    manual_review_queue_count: manualReviewQueue.length,
    ag03_integrity_preserved: entries.every((entry) => entry.ag03_reference_link_count === config.expected.references_per_article),
    audit_only_no_mutation: true,
    ready_for_ag04a_r2_manual_review_record: true
  },

  entries,
  manual_review_queue: manualReviewQueue,
  blocked_capabilities: [
    "article_html_mutation",
    "article_text_mutation",
    "article_image_mutation",
    "image_credit_mutation",
    "reference_url_change",
    "css_mutation",
    "external_fetch_by_script",
    "backend_activation",
    "supabase",
    "auth",
    "frontend_deployment",
    "file_deletion",
    "file_move"
  ],
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG04A_R1_ARTICLE_VISUAL_EVIDENCE_PREVIEW",
  module_id: "AG04A-R1",
  status: "preview_article_visual_evidence_register",
  preview_only: true,
  summary: register.summary,
  first_20_entries: entries.slice(0, 20).map((entry) => ({
    article_path: entry.article_path,
    detected_title: entry.detected_title,
    primary_image_src: entry.visual_evidence.primary_image_src,
    primary_image_is_logo_or_brand_like: entry.visual_evidence.primary_image_is_logo_or_brand_like,
    credit_or_source_present: entry.image_credit_evidence.credit_or_source_present,
    reading_width_aligned: entry.reading_surface_evidence.ag04a_reading_width_appears_aligned,
    ag03_reference_link_count: entry.ag03_reference_link_count,
    manual_review_status: entry.manual_review_status
  })),
  manual_review_queue_preview: manualReviewQueue.slice(0, 20).map((entry) => ({
    article_path: entry.article_path,
    review_flags: entry.review_flags,
    primary_image_src: entry.visual_evidence.primary_image_src,
    manual_review_status: entry.manual_review_status
  })),
  mutation_performed: false,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.evidence_register), register);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.evidence_register}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Evidence articles: ${register.summary.evidence_article_count}`);
console.log(`Live AG03 reference links: ${register.summary.live_ag03_reference_link_count}`);
console.log(`Articles with primary image src: ${register.summary.articles_with_primary_image_src}`);
console.log(`Logo/brand-like primary images: ${register.summary.articles_with_logo_or_brand_like_primary_image}`);
console.log(`Articles with credit/source evidence: ${register.summary.articles_with_credit_or_source_evidence}`);
console.log(`Articles with reading width aligned: ${register.summary.articles_with_reading_width_evidence_aligned}`);
console.log(`Manual review queue count: ${register.summary.manual_review_queue_count}`);
console.log(`AG03 integrity preserved: ${register.summary.ag03_integrity_preserved}`);
console.log("Mutation performed: false");
