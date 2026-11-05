import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { retrieveRelevantLessons } from "../../drishvara_phase01_scaffold/core/learning/retrieval/lessonRetriever.js";
import { retrieveTopicPlaybook } from "../../drishvara_phase01_scaffold/core/learning/playbooks/topicPlaybookRetriever.js";

export const LONG_FORM_PROFILE = "drishvara.long-form-review.v1";
export const LONG_FORM_STANDARD_PATH = "data/content-intelligence/quality-reviews/long-form-article-standard.json";
const root = new URL("../../", import.meta.url);
const scaffold = new URL("drishvara_phase01_scaffold/", root);
const read = path => readFileSync(new URL(path, root), "utf8");

export function longFormRequirements() {
  const standard = JSON.parse(readFileSync(new URL("../../data/content-intelligence/quality-reviews/long-form-article-standard.json", import.meta.url), "utf8"));
  const { minimum_words: min, maximum_words: max, ideal_band_words: target } = standard.article_length_standard;
  const references = standard.reference_standard;
  if (!Number.isInteger(min) || min < 1500 || !Number.isInteger(max) || max < min ||
      !Number.isInteger(references.minimum_verified_references) || references.minimum_verified_references < 2) throw Error("article_standard_unavailable");
  return { profile: LONG_FORM_PROFILE, standard_ref: LONG_FORM_STANDARD_PATH, min, max, target,
    reference_min: references.minimum_verified_references, reference_max: references.maximum_verified_references,
    primary_visual_required: standard.visual_and_data_standard.primary_visual_required,
    enrichment_types: standard.visual_and_data_standard.accepted_data_enrichment_units };
}

export const articleWordCount = text => typeof text === "string" ? text.trim().split(/\s+/u).filter(Boolean).length : 0;
export function articleLengthBlocker(body) {
  const { min, max } = longFormRequirements(), words = articleWordCount(body);
  return words < min || words > max ? "article_long_form_length_pending" : null;
}

export function longFormPlanningContext(candidate, desk) {
  const input = { topic: candidate.title, contentType: "article", audience: desk === "public_programmes" ? "government and implementation stakeholders" : "general readers" };
  const projectRoot = fileURLToPath(scaffold);
  return {
    story_guidance: read("drishvara_phase01_scaffold/core/agents/story-drafter/prompt.md"),
    visual_guidance: read("drishvara_phase01_scaffold/core/agents/visual-intelligence/prompt.md"),
    topic_playbook: retrieveTopicPlaybook({ projectRoot, ...input }),
    story_lessons: retrieveRelevantLessons({ projectRoot, stageName: "story-drafter", input }),
    visual_lessons: retrieveRelevantLessons({ projectRoot, stageName: "visual-intelligence", input })
  };
}

export function buildLongFormReviewPrompt({ today, categoryKey, categoryMeta, candidate, plannerBlock, requirements, planning }) {
  return `Write one full Drishvara long-form Article for ${categoryMeta.label}.
Date: ${today}. Desk: ${categoryKey}.
Selected topic, angle and summary: ${JSON.stringify(candidate)}
EDITORIAL PLANNER DIRECTIVE\n${plannerBlock}
EXISTING LONG-FORM STANDARD\n${JSON.stringify(requirements)}
EXISTING STORY AND VISUAL PLANNING GUIDANCE (planning input, not alternative output schemas)\n${JSON.stringify(planning)}
Preserve the planner's depth, width, theme, writing mode, special-edition and closing directives.
Write ${requirements.min}-${requirements.max} words of substantive Article prose; aim for ${requirements.target}. No padding or repeated conclusions.
The minimum is inclusive: exactly ${requirements.min} body words passes the length check. Do not count the title, source URLs, image credits or metadata towards that minimum. Length validation never grants review approval or publication permission.
Use coherent titled sections, context, explanation, original analysis and a useful reflective or practical conclusion. Do not fabricate quotations, statistics, events or sources.
Provide ${requirements.reference_min}-${requirements.reference_max} distinct, specific HTTPS reference pointers. These are unverified research proposals, not authenticated evidence. Never invent a URL to fill a quota.
Provide a narrative-aligned primary visual plan and at least one useful data-enrichment unit. Use a structured key-takeaways box when verified numerical data is unavailable; do not fabricate chart data.
No quality scores, human reviews, source clearance or publication approvals may be invented.
Return only a JSON object with title, slug, subtitle, summary, article_html, reference_links, official_link, supporting_link, image, image_credit, image_source_url, image_alt, image_prompt, generated_image_path,
topic_intent (string), reader_value_promise (string), long_form_outline (array of section titles),
visual_plan (array of objects with type, placement, purpose, prompt), and
data_enrichment ({"type":"structured_key_takeaways_box","heading":"Key takeaways","items":["substantive takeaway"]}).
article_html must contain only h2/h3 headings and p paragraphs, with strong/em/b/i/a/br inline elements. No scripts, inline images, tables, styles or event handlers.
Keep the data_enrichment box separate from article_html; the preparation step will preserve it as a placed object in the reviewed copy, outside the body word count.
Leave unavailable image paths and credits empty. Supply a story-aligned image_prompt for the existing visual workflow, not a claim that an image has already been generated.`;
}

// Mechanical completeness only. Source authentication, rights, scores and human decisions stay pending.
export function assessLongFormDraft({ generated, body, media }) {
  const standard = longFormRequirements(), blockers = [];
  const words = articleWordCount(body), length = articleLengthBlocker(body);
  if (length) blockers.push(length);
  const urls = [...new Set([...(Array.isArray(generated.reference_links) ? generated.reference_links : []), generated.official_link, generated.supporting_link].filter(Boolean))];
  const validUrl = value => { try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } };
  if (urls.length < standard.reference_min || urls.length > standard.reference_max || urls.some(u => !validUrl(u))) blockers.push("article_reference_evidence_pending");
  const text = v => typeof v === "string" && v.trim();
  if (!text(generated.topic_intent) || !text(generated.reader_value_promise) || !Array.isArray(generated.long_form_outline) ||
      generated.long_form_outline.length < 3 || generated.long_form_outline.some(v => !text(v))) blockers.push("article_outline_pending");
  if (!Array.isArray(generated.visual_plan) || !generated.visual_plan.length ||
      generated.visual_plan.some(v => !v || ["type", "placement", "purpose", "prompt"].some(k => !text(v[k])))) blockers.push("article_visual_plan_pending");
  const unit = generated.data_enrichment;
  if (unit?.type !== "structured_key_takeaways_box" || !text(unit.heading) || !Array.isArray(unit.items) ||
      unit.items.length < 3 || unit.items.length > 8 || unit.items.some(v => !text(v))) blockers.push("article_data_enrichment_pending");
  if (!media?.image_path || !text(media.image_alt) || !text(media.image_credit) || !validUrl(media.image_source_url)) blockers.push("article_primary_visual_pending");
  return { profile: standard.profile, standard_ref: standard.standard_ref, words, word_count_min: standard.min, word_count_max: standard.max,
    mechanical_checks_complete: blockers.length === 0, blockers, source_authentication: "pending", source_use: "pending",
    quality_review: "pending", visitor_value_review: "pending", editorial_review: "pending", public_output_allowed: false, runtime_activation: false };
}
