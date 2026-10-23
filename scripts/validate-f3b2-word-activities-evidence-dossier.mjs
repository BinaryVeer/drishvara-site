import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const baseline = "ae04816f0630b350640e6cc2080b6dd97d301c9a";
const dossierPath = "data/content-intelligence/quality-reviews/f3b2-word-activities-evidence-dossier.json";
const validatorPath = "scripts/validate-f3b2-word-activities-evidence-dossier.mjs";
const manifestPath = "data/knowledge-base/word-of-day/production/production-bank-manifest.json";
const wordBase = "data/knowledge-base/word-of-day/";
const knowledgeBase = wordBase + "production/knowledge-bank/";
const activityBase = "data/knowledge/daily-guidance/";
const json = p => JSON.parse(fs.readFileSync(p, "utf8"));
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const sorted = items => [...items].sort();
const fields = ["english", "hindi", "sanskrit", "meaning_en", "meaning_hi", "theme", "usage_context"];
const pick = (record, keys) => Object.fromEntries(keys.map(key => [key, record[key]]));
const governingFiles = {
  methodology: wordBase + "production/methodology/ag70d-word-of-the-day-methodology-v2.json",
  supersession: wordBase + "production/methodology/ag70d-legacy-methodology-supersession-map.json",
  primary_rules: wordBase + "production/methodology/ag70d-primary-lexical-selection-rules.json",
  foundation_manifest: knowledgeBase + "ag70e-word-production-knowledge-bank-foundation-manifest.json",
  evidence_contract: knowledgeBase + "lexical-source-evidence-map.json",
  manual_review_contract: wordBase + "ag69h-manual-verification-fields-contract.json",
  output_contract: knowledgeBase + "word-output-record-contract.json",
  historical_capture_queue: wordBase + "ag69f-word-source-evidence-capture-queue.json",
  historical_word_drafts: wordBase + "ag69f-reviewed-record-draft-no-approval.json",
  historical_source_catalog: wordBase + "ag69d-source-reference-bank-metadata.json",
  current_source_catalog: knowledgeBase + "sanskrit-lexical-source-reference-bank.json",
  activity_templates: activityBase + "daily-guidance-rule-examples-d03.json",
  activity_previews: activityBase + "daily-guidance-selection-preview-d04.json",
  activity_policy: activityBase + "daily-guidance-rule-validation-policy-d04.json"
};
const sources = Object.fromEntries(Object.entries(governingFiles).map(([key, p]) => [key, json(p)]));
const drafts = sources.historical_word_drafts.draft_records;
const queues = sources.historical_capture_queue.queue_items;
const legacyWords = json(activityBase + "word-of-day-bank-d02.json").items;
const previewWords = json("data/initial-working-data/word-of-day/ag63a-word-bank-approved-preview.json").items;
const pilot = {
  reflection: ["ag69f_review_draft_001", "ag69f_evidence_001", "मनन", "manana", "mananam"],
  discernment: ["ag69f_review_draft_004", "ag69f_evidence_004", "विवेक", "viveka", "vivekaḥ"],
  patience: ["ag69f_review_draft_005", "ag69f_evidence_005", "धैर्य", "dhairya", "dhairyam"]
};
const activityIds = ["weekday-saturday-steadiness", "word-theme-reflection", "fallback-neutral-daily-guidance"];
const citationFields = ["dictionary_title", "author_or_editor", "edition_or_publication_year", "publisher",
  "headword_as_published", "entry_locator", "entry_or_scan_url", "access_date", "evidence_language",
  "supported_sense", "citation_or_bounded_evidence_note", "citation_reuse_restrictions"];
const authenticatedFields = ["normalized_headword", "recorded_form_iast", "lookup_form_iast",
  "dictionary_meaning_en", "dictionary_meaning_hi", "morphology", "etymology", "contextual_attestation"];
const slotFields = ["slot_id", "linked_record_id", "draft_id", "legacy_word_id", "source_reference_id",
  "source_category", "field_checked", "language_to_verify"];
const pendingState = {
  template_only: true,
  evidence_id: null,
  linked_record_type: "candidate_evidence_draft",
  source_class: "lexical_dictionary",
  source_evidence_attached: false,
  source_access_checked: false,
  reuse_note_checked: false,
  word_form_found_status: "needs_manual_review",
  meaning_supported_status: "needs_manual_review",
  transliteration_supported_status: "needs_manual_review",
  claim_level_supported: "label_only",
  internal_textual_discipline_check: "pending",
  review_status: "evidence_pending",
  review_status_after_evidence: "evidence_pending",
  public_use_permission: "not_allowed",
  public_use_permission_after_review: "not_allowed",
  public_output_allowed: false
};

function closed(record) {
  assert.equal(record.production_readiness, "not_ready");
  assert.equal(record.production_approved, false);
  assert.equal(record.approved_for_selector, false);
  assert.equal(record.public_output_allowed, false);
  assert.equal(record.public_use_permission, "not_allowed");
}

function validateDossier(d) {
  assert.equal(d.schema_version, "f3b2.review.v1");
  assert.equal(d.baseline, baseline);
  assert.equal(d.status, "research_review_preparation_not_publication");
  assert.equal(d.artifact_role, "review_dossier_not_content_bank_or_selection_methodology");
  for (const key of ["runtime_activation", "public_output_allowed", "production_approved",
    "selector_activation_allowed", "external_word_level_verification_performed"]) assert.equal(d[key], false, key);
  assert.equal(d.public_use_permission, "not_allowed");
  assert.deepEqual(d.governing_files, governingFiles);
  assert.equal(d.word_record_count, 3);
  assert.equal(d.activity_record_count, 3);
  assert.equal(d.words.length, 3);
  assert.deepEqual(sorted(d.words.map(w => w.word_id)), sorted(Object.keys(pilot)));
  assert.equal(d.activities.length, 3);
  assert.deepEqual(sorted(d.activities.map(a => a.rule_id)), sorted(activityIds));
  assert.equal(d.evidence_boundaries.length, 7);
  assert.equal(d.word_qualification_gaps.length, 7);
  assert.equal(d.activity_publication_conditions.length, 6);

  const template = d.pending_evidence_template;
  assert.deepEqual(sorted(Object.keys(template)), sorted([...Object.keys(pendingState), "reviewer_note", "citation_capture", "capture_requirements"]));
  assert.deepEqual(pick(template, Object.keys(pendingState)), pendingState);
  assert.equal(typeof template.reviewer_note, "string");
  assert.equal(template.capture_requirements.length, 7);
  assert.deepEqual(sorted(Object.keys(template.citation_capture)), sorted(citationFields));
  assert(Object.values(template.citation_capture).every(v => v === null), "No entry-level citation is authenticated in F3B-2");

  const slotIds = new Set();
  for (const word of d.words) {
    const [draftId, queueId, lookup, lookupIast, formIast] = pilot[word.word_id];
    const draft = drafts.find(r => r.draft_id === draftId);
    const queue = queues.find(r => r.queue_id === queueId);
    const legacy = legacyWords.find(r => r.id === word.word_id);
    const preview = previewWords.find(r => r.word_id === word.word_id);
    assert.equal(draft.legacy_word_id, word.word_id);
    assert.equal(queue.legacy_word_id, word.word_id);
    assert.equal(word.draft_id, draftId);
    assert.equal(word.capture_queue_id, queueId);
    assert.deepEqual(word.original_copy, pick(draft, fields));
    assert.deepEqual(word.original_copy, pick({ ...legacy, english: legacy.word_en, hindi: legacy.word_hi, sanskrit: legacy.word_sanskrit }, fields));
    assert.deepEqual(word.original_copy, pick(preview, fields));
    assert.equal(word.original_source_basis, preview.source_basis);
    assert.equal(word.original_transliteration, null);
    assert.equal(word.historical_source_pointer_set_id, "ag69f_pilot_source_families");
    assert.deepEqual(d.historical_source_pointer_sets[word.historical_source_pointer_set_id], queue.candidate_source_families);
    const pointers = Object.values(queue.candidate_source_families).flat();
    for (const id of pointers) {
      assert(sources.historical_source_catalog.source_references.some(s => s.source_reference_id === id));
      assert(sources.current_source_catalog.records.some(s => s.source_reference_id === id));
    }
    const proposed = word.proposed_lexical_fields;
    assert.deepEqual(sorted(Object.keys(proposed)), sorted(["language", "script", "recorded_inflected_form",
      "lookup_form", "lookup_form_iast", "recorded_form_iast", "status", "normalization_note"]));
    assert.equal(proposed.language, "Sanskrit");
    assert.equal(proposed.script, "Devanagari");
    assert.equal(proposed.recorded_inflected_form, draft.sanskrit);
    assert.equal(proposed.lookup_form, lookup);
    assert.equal(proposed.lookup_form_iast, lookupIast);
    assert.equal(proposed.recorded_form_iast, formIast);
    assert.equal(proposed.status, "proposed_unreviewed");
    assert.equal(typeof proposed.normalization_note, "string");
    assert.deepEqual(sorted(Object.keys(word.authenticated_lexical_fields)), sorted(authenticatedFields));
    assert(Object.values(word.authenticated_lexical_fields).every(v => v === null));
    assert.equal(word.pending_evidence_slots.length, 2);
    assert.deepEqual(sorted(word.pending_evidence_slots.map(s => s.field_checked)), ["hindi", "sanskrit"]);
    for (const slot of word.pending_evidence_slots) {
      assert.deepEqual(sorted(Object.keys(slot)), sorted(slotFields));
      assert(!slotIds.has(slot.slot_id));
      slotIds.add(slot.slot_id);
      assert.equal(slot.slot_id, `f3b2-${word.word_id}-${slot.field_checked}`);
      assert.equal(slot.linked_record_id, draftId);
      assert.equal(slot.draft_id, draftId);
      assert.equal(slot.legacy_word_id, word.word_id);
      const isSanskrit = slot.field_checked === "sanskrit";
      assert.equal(slot.source_reference_id, isSanskrit ? "src_cologne_digital_sanskrit_dictionaries" : "src_hindi_shabdasagara_dsal");
      assert.equal(slot.language_to_verify, isSanskrit ? "Sanskrit" : "Hindi");
      const historicalSource = sources.historical_source_catalog.source_references.find(s => s.source_reference_id === slot.source_reference_id);
      assert.equal(slot.source_category, historicalSource.source_category);
      // Contract fields are checked on a pending view, never inserted into the production map.
      const pending = { ...template, ...slot };
      for (const field of [...sources.evidence_contract.required_fields, ...sources.manual_review_contract.required_fields]) {
        assert(Object.hasOwn(pending, field), `Pending field missing: ${field}`);
      }
      for (const [field, allowed] of Object.entries(sources.manual_review_contract.allowed_status_values)) {
        assert(allowed.includes(pending[field]), `Invalid pending review value: ${field}`);
      }
    }
    assert.equal(word.research_review_eligible, true);
    assert.equal(word.review_status, "evidence_pending");
    for (const field of ["language_review_status", "internal_textual_discipline_check", "morphology_review_status",
      "etymology_review_status", "contextual_usage_review_status", "safety_review_status", "editorial_review_status"]) assert.equal(word[field], "pending");
    closed(word);
  }
  assert.equal(slotIds.size, 6);

  for (const activity of d.activities) {
    const original = sources.activity_templates.items.find(r => r.rule_id === activity.rule_id);
    const preview = sources.activity_previews.items.find(r => r.selected_rule_id === activity.rule_id);
    assert.deepEqual(activity.original_template, original);
    assert.equal(activity.historical_selection.preview_id, preview.preview_id);
    assert.deepEqual(activity.historical_selection.input_context, preview.input_context);
    assert.equal(activity.historical_selection.selection_reason, preview.selection_reason);
    assert.equal(activity.historical_selection.priority_position, sources.activity_policy.selection_priority.indexOf(preview.selection_reason) + 1);
    assert.equal(typeof activity.historical_selection.dependency_note, "string");
    const review = activity.editorial_review;
    assert.equal(review.calendar_derived_fact, false);
    assert.equal(review.traditional_or_astrological_authority_established, false);
    for (const field of ["language_review_status", "safety_review_status", "editorial_review_status"]) assert.equal(review[field], "pending");
    assert.equal(typeof review.english_hindi_consistency, "string");
    assert(review.safety_notes.length > 0);
    assert.equal(review.rewrite_needed_before_publication, true);
    assert.equal(typeof review.rewrite_scope, "string");
    assert.equal(review.recommendation, activity.rule_id === "weekday-saturday-steadiness" ? "rewrite_only_with_authorization" : "retain_for_review");
    assert.deepEqual(review.source_reference_ids, []);
    assert.equal(review.independent_evidence_status, "pending");
    assert.deepEqual(activity.unapproved_editorial_proposals, []);
    assert.equal(activity.review_status, "needs_review");
    closed(activity);
  }
}

let checks = 0;
function check(name, run) {
  run();
  checks++;
  console.log("PASS " + name);
}
const dossier = json(dossierPath);
check("three exact historical word mappings, original copy and six pending slots", () => validateDossier(dossier));
for (const id of Object.keys(pilot)) check(id + " preserved and unreviewed", () => {
  const word = dossier.words.find(w => w.word_id === id);
  assert.equal(word.production_approved, false);
  assert.equal(word.pending_evidence_slots.length, 2);
});
for (const id of activityIds) check(id + " matches original template and D04 selection", () => {
  const activity = dossier.activities.find(a => a.rule_id === id);
  assert.deepEqual(activity.original_template, sources.activity_templates.items.find(r => r.rule_id === id));
  assert.equal(activity.public_output_allowed, false);
});

function rejects(name, mutate) {
  check("reject " + name, () => {
    const changed = structuredClone(dossier);
    mutate(changed);
    assert.throws(() => validateDossier(changed), { name: "AssertionError" });
  });
}
rejects("missing word", d => d.words.pop());
rejects("duplicate identity", d => { d.words[1] = structuredClone(d.words[0]); });
rejects("wrong historical draft", d => { d.words[0].draft_id = "ag69f_review_draft_004"; });
rejects("altered Sanskrit", d => { d.words[0].original_copy.sanskrit = "मनन"; });
rejects("altered Hindi meaning", d => { d.words[1].original_copy.meaning_hi = "changed"; });
rejects("unreviewed IAST labelled reviewed", d => { d.words[1].proposed_lexical_fields.status = "reviewed"; });
rejects("proposed IAST copied into authenticated field", d => { d.words[1].authenticated_lexical_fields.recorded_form_iast = "vivekaḥ"; });
rejects("editorial definition labelled dictionary meaning", d => { d.words[0].authenticated_lexical_fields.dictionary_meaning_en = d.words[0].original_copy.meaning_en; });
rejects("homepage masquerading as entry evidence", d => { d.pending_evidence_template.citation_capture.entry_or_scan_url = "https://www.sanskrit-lexicon.uni-koeln.de/"; });
rejects("invented entry locator", d => { d.pending_evidence_template.citation_capture.entry_locator = "unverified page"; });
rejects("invented access date", d => { d.pending_evidence_template.citation_capture.access_date = d.prepared_on; });
rejects("false evidence authentication", d => { d.pending_evidence_template.source_access_checked = true; });
rejects("pending slot replaced with asserted evidence", d => { d.words[0].pending_evidence_slots[0].review_status = "approved"; });
rejects("invalid source reference", d => { d.words[0].pending_evidence_slots[0].source_reference_id = "invented_source"; });
rejects("word production approval", d => { d.words[0].production_approved = true; });
rejects("word public permission", d => { d.words[0].public_use_permission = "approved_for_public_output"; });
rejects("selector activation", d => { d.selector_activation_allowed = true; });
rejects("missing activity", d => d.activities.pop());
rejects("rewritten historical activity", d => { d.activities[0].original_template.output_fields.guidance_text_en = "rewritten"; });
rejects("activity public output", d => { d.activities[2].public_output_allowed = true; });
rejects("activity safety review fabricated", d => { d.activities[0].editorial_review.safety_review_status = "approved"; });

check("AG70D runtime, supersession and generation gates preserved", () => {
  assert.equal(sources.methodology.runtime_selector_active_now, false);
  assert.equal(sources.methodology.public_word_generation_allowed_now, false);
  assert.equal(sources.primary_rules.primary_selection_allowed_now, false);
  assert.equal(sources.methodology.active_methodology_version, "word_of_day_method_v2_panchang_context_sanskrit_lexical_engine");
  assert(sources.supersession.legacy_files_preserved_as_reference.some(r => r.new_status_after_ag70d === "legacy_preview_reference_not_active_production_method"));
});
check("AG70E production content/evidence banks remain empty", () => {
  for (const p of Object.values(sources.foundation_manifest.banks)) {
    if (Object.hasOwn(json(p), "records")) assert.deepEqual(json(p).records, []);
  }
  assert.equal(sources.foundation_manifest.runtime_active_now, false);
  assert.equal(sources.foundation_manifest.public_output_allowed_now, false);
  assert.equal(sources.foundation_manifest.production_record_creation_now, false);
  assert.equal(sources.output_contract.output_generated_now, false);
});
check("D04 and generated Word/Colour/Mantra publication gates remain closed", () => {
  assert.equal(sources.activity_policy.selection_preview_live_enabled, false);
  assert.equal(sources.activity_previews.public_dynamic_output_enabled, false);
  assert(sources.activity_previews.items.every(p => p.preview_only === true && p.live_output_enabled === false));
  assert.equal(json("generated/word-of-day.json").public_ui_ready, false);
  const guidance = json("generated/vedic-guidance-working-data.json");
  assert.equal(guidance.public_ui_ready, false);
  assert.equal(guidance.mantra_publication_allowed, false);
});
check("manifest change only annotates legacy layout and points to real v2 containers", () => {
  const current = json(manifestPath);
  const old = JSON.parse(git("show", baseline + ":" + manifestPath));
  const annotation = current.legacy_layout_resolution;
  delete current.legacy_layout_resolution;
  assert.deepEqual(current, old);
  assert.equal(annotation.status, "unimplemented_legacy_layout_not_active_v2_container_paths");
  assert.equal(annotation.authoritative_v2_manifest_path, governingFiles.foundation_manifest);
  for (const key of annotation.legacy_path_fields) assert.equal(fs.existsSync(old[key]), false);
  for (const p of Object.values(sources.foundation_manifest.banks)) assert(fs.existsSync(p));
});
check("baseline and tracked scope preserve homepage, historical sources and protected owners", () => {
  assert.equal(git("rev-parse", "HEAD").trim(), baseline);
  assert.equal(git("rev-parse", "origin/main").trim(), baseline);
  assert.equal(git("diff", "--cached", "--name-only").trim(), "");
  const tracked = git("diff", "--name-only", baseline, "--").trim().split("\n").filter(Boolean);
  assert.deepEqual(tracked, [manifestPath]);
  const expectedStatus = [" M " + manifestPath, "?? " + dossierPath, "?? " + validatorPath, "?? prototypes/"];
  const status = git("status", "--short", "--untracked-files=normal").trimEnd().split("\n");
  assert.deepEqual(sorted(status), sorted(expectedStatus));
});
console.log(`F3B-2 validation passed: ${checks} checks. Research preparation only; no lexical authentication or public output.`);
