// Structure checks, not evidence authentication or an approval authority.
export const MEANING_COPY_VERSION = "ag70e.word-copy.v2";
export const MEANING_VERSION = "ag70e.word-meaning.v1";
export const BASE_COPY_KEYS = ["english", "hindi", "sanskrit", "iast", "meaning_en", "meaning_hi", "reflection_en", "reflection_hi", "sources"];
export const BASE_REVIEW_KINDS = ["linguistic", "editorial", "rights", "context", "safety"];
export const MEANING_SOURCE_KEYS = ["evidence_ref", "title", "publisher", "url", "attribution", "reuse_approval_ref", "review_status", "source_kind"];
export const MEANING_REVIEW_KINDS = [...BASE_REVIEW_KINDS, "textual", "philosophical"];
const text = value => typeof value === "string" && value.trim().length > 0 && value.length <= 30000;
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const exact = (value, keys) => object(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const list = value => Array.isArray(value) && value.length > 0 && value.length <= 24;
const unique = values => new Set(values).size === values.length;
export const copyReviewKinds = copy => copy?.contract_version === MEANING_COPY_VERSION ? MEANING_REVIEW_KINDS : BASE_REVIEW_KINDS;

export function meaningStructureErrors(content) {
  try {
  const errors = [];
  if (!exact(content, [...BASE_COPY_KEYS, "meaning_details"])) return ["unknown_or_missing_copy_fields"];
  const details = content.meaning_details;
  const keys = ["contract_version", "explanation_en", "explanation_hi", "method_summary_en", "method_summary_hi", "scriptural_references", "philosophical_essay"];
  if (!exact(details, keys) || details.contract_version !== MEANING_VERSION) return ["invalid_meaning_contract"];
  for (const key of ["explanation_en", "explanation_hi", "method_summary_en", "method_summary_hi"]) {
    if (!text(details[key])) errors.push("missing_" + key);
  }
  const words = typeof details.method_summary_en === "string" ? details.method_summary_en.trim().split(/\s+/).length : 0;
  if (words < 7 || words > 8) errors.push("method_summary_requires_7_or_8_words");
  const refs = new Set(Array.isArray(content.sources) ? content.sources.map(source => source?.evidence_ref) : []);
  if (!list(content.sources) || !unique(content.sources.map(source => source?.evidence_ref)) || content.sources.some(source =>
    !exact(source, MEANING_SOURCE_KEYS) || !["lexical_dictionary", "scriptural_text", "commentary", "secondary_scholarship"].includes(source.source_kind))) errors.push("invalid_meaning_sources");
  const passages = details.scriptural_references;
  if (!list(passages)) errors.push("verified_scriptural_reference_required");
  else {
    const passageKeys = ["evidence_ref", "work", "locator", "edition", "original_text", "original_language", "matched_form", "relation", "translation_en", "translation_hi", "scope_note_en", "scope_note_hi"];
    if (!unique(passages.map(p => p?.evidence_ref))) errors.push("duplicate_passage_reference");
    for (const passage of passages) {
      if (!exact(passage, passageKeys) || !passageKeys.filter(key => key !== "relation").every(key => text(passage[key])) ||
          !["direct_word_attestation", "conceptual_parallel"].includes(passage.relation) || !refs.has(passage.evidence_ref) ||
          content.sources.find(source => source.evidence_ref === passage.evidence_ref)?.source_kind !== "scriptural_text" ||
          !passage.original_text.includes(passage.matched_form)) errors.push("incomplete_or_unlinked_scriptural_reference");
    }
  }
  const essay = details.philosophical_essay;
  if (!exact(essay, ["kind", "tradition_scope_en", "tradition_scope_hi", "sections"]) || essay.kind !== "original_editorial_interpretation" ||
      !text(essay.tradition_scope_en) || !text(essay.tradition_scope_hi) || !list(essay.sections)) errors.push("philosophical_essay_required");
  else for (const section of essay.sections) {
    if (!exact(section, ["heading_en", "heading_hi", "body_en", "body_hi", "evidence_refs"]) ||
        !["heading_en", "heading_hi", "body_en", "body_hi"].every(key => text(section[key])) ||
        !list(section.evidence_refs) || !unique(section.evidence_refs) || !section.evidence_refs.every(ref => text(ref) && refs.has(ref))) errors.push("incomplete_or_unlinked_essay_section");
  }
  return [...new Set(errors)];
  } catch { return ["invalid_meaning_structure"]; }
}

export function reviewedMeaningDetails(copy, hash) {
  try {
    return copy?.contract_version === MEANING_COPY_VERSION && meaningStructureErrors(copy.content).length === 0 &&
      Array.isArray(copy.reviews) && MEANING_REVIEW_KINDS.every(kind => copy.reviews.filter(review =>
        review.kind === kind && review.review_status === "approved" && text(review.approval_ref) && review.content_hash === hash).length === 1);
  } catch { return false; }
}

export function emptyMeaningDetails() {
  return { contract_version: MEANING_VERSION, explanation_en: null, explanation_hi: null,
    method_summary_en: "Dictionary sense selected; explanation written in plain language.", method_summary_hi: null,
    scriptural_references: [], philosophical_essay: null };
}
