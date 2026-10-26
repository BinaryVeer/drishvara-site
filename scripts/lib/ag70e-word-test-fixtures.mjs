// Test-only synthetic records. Never imported by a public page or written to AG70E.
import fs from "node:fs";
import { WORD_CONTRACT, WORD_SCOPE, WORD_TIMEZONE, candidateRef, snapshotHash } from "./ag70d-word-selection-engine.mjs";
import { createSyntheticWordStore } from "./ag70d-word-assignment-test-adapter.mjs";
import { executeWordAssignment } from "./ag70d-word-assignment-store.mjs";
import { projectPublishedWord } from "./ag70e-word-publication-pipeline.mjs";
import { MEANING_COPY_VERSION, MEANING_VERSION, MEANING_REVIEW_KINDS } from "./ag70e-word-meaning-contract.mjs";

export const syntheticApproval = { review_status: "approved", approval_ref: "synthetic-review-only" };
export const syntheticIdentityRef = "synthetic-word-map-v1";
export function syntheticWord(n, long = false) {
  const content = { english: "Synthetic word " + n, hindi: "परीक्षण", sanskrit: long ? "संस्कृत".repeat(100) : "परीक्षणम्",
    iast: "synthetic-IAST", meaning_en: "Synthetic reviewed meaning.", meaning_hi: "केवल परीक्षण।",
    reflection_en: "Synthetic editorial reflection.", reflection_hi: "केवल परीक्षण के लिए।",
    sources: [{ evidence_ref: "synthetic-source", title: "Synthetic source", publisher: "Test fixture, not lexical evidence",
      url: "https://example.invalid/synthetic-word", attribution: "Fictional isolated fixture", reuse_approval_ref: "synthetic-rights", review_status: "approved" }] };
  return { output_candidate_id: "synthetic-candidate-" + n, selected_word_id: "synthetic-word-" + n, approved_record_version: "v1",
    canonical_lexical_identity_id: "synthetic-lexeme-" + n, lemma_id: "synthetic-lemma-" + n, equivalence_group_id: "synthetic-group-" + n,
    selection_path: "primary_lexical", context_signal_id: "synthetic-signal", production_approved: true, approved_for_daily_output: true,
    review_status: "approved", public_use_permission: "approved_for_output", morphology_status: "review_approved", semantics_status: "supported", etymology_status: "established",
    approval_record_refs: ["synthetic-approval"], source_evidence: [{ evidence_ref: "synthetic-source", review_status: "approved" }],
    reviewed_publication_copy: { contract_version: "ag70e.word-copy.v1", version: "synthetic-copy-v1", content,
      iast_review_status: "approved", iast_approval_ref: "synthetic-iast",
      reviews: ["linguistic", "editorial", "rights", "context", "safety"].map(kind => ({ ...syntheticApproval, kind, content_hash: snapshotHash(content) })) } };
}
export function syntheticSelection(count = 3, date = "2026-10-23", long = false) {
  const records = Array.from({ length: count }, (_, i) => syntheticWord(i + 1, long));
  const policy = JSON.parse(fs.readFileSync("data/knowledge-base/word-of-day/production/methodology/ag70d-duplicate-control-and-history-rules.json"));
  policy.publication_model.canonical_context_basis_ref = "synthetic-canonical-context";
  policy.approved_precedence_rule_ref = "synthetic-precedence";
  const history = { contract_version: WORD_CONTRACT, available: true, complete: true, revision: 0,
    events: [], snapshot_ref: snapshotHash([]), identity_snapshot_ref: syntheticIdentityRef };
  return { contract_version: WORD_CONTRACT, date_key: date, timezone: WORD_TIMEZONE, publication_scope: WORD_SCOPE, created_at: date + "T00:00:00.000Z", policy,
    context: { ...syntheticApproval, version: "v1", basis_ref: policy.publication_model.canonical_context_basis_ref, snapshot_ref: "synthetic-context", date_key: date, eligible_candidate_refs: records.map(candidateRef) },
    precedence: { ...syntheticApproval, version: "v1", rule_ref: policy.approved_precedence_rule_ref, operator: "approved_explicit_candidate_order", candidate_order: records.map(candidateRef) },
    identity_map: { ...syntheticApproval, version: "v1", snapshot_ref: syntheticIdentityRef,
      links: records.map(r => ({ ...syntheticApproval, candidate_ref: candidateRef(r), canonical_lexical_identity_id: r.canonical_lexical_identity_id,
        lemma_id: r.lemma_id, equivalence_group_id: r.equivalence_group_id, representative_candidate_ref: candidateRef(r) })) },
    exclusions: { ...syntheticApproval, entries: [] }, bank: { version: "v1", snapshot_ref: "synthetic-bank", records }, history, expected_history_ref: history.snapshot_ref };
}
export function withSyntheticMeaning(record) {
  const copy = record.reviewed_publication_copy;
  copy.contract_version = MEANING_COPY_VERSION;
  copy.version = "synthetic-meaning-copy-v2";
  copy.content.sources[0].source_kind = "lexical_dictionary";
  copy.content.sources.push({ ...copy.content.sources[0], evidence_ref: "synthetic-scripture", source_kind: "scriptural_text" });
  record.source_evidence.push({ evidence_ref: "synthetic-scripture", review_status: "approved" });
  copy.content.meaning_details = {
    contract_version: MEANING_VERSION,
    explanation_en: "Fictional explanation for isolated pipeline verification only.", explanation_hi: "केवल पृथक परीक्षण के लिए काल्पनिक व्याख्या।",
    method_summary_en: "Synthetic source selected; explanation written for testing only.", method_summary_hi: "केवल परीक्षण की काल्पनिक विधि।",
    scriptural_references: [{ evidence_ref: "synthetic-scripture", work: "Fictional test text", locator: "synthetic section 1", edition: "Fictional edition",
      original_text: "काल्पनिक परीक्षण", original_language: "sa", matched_form: "परीक्षण", relation: "conceptual_parallel",
      translation_en: "Fictional test translation.", translation_hi: "काल्पनिक परीक्षण अनुवाद।",
      scope_note_en: "Not real scripture, attestation or verified translation.", scope_note_hi: "यह वास्तविक शास्त्रीय प्रमाण नहीं है।" }],
    philosophical_essay: { kind: "original_editorial_interpretation", tradition_scope_en: "Fictional perspective, not a real tradition.", tradition_scope_hi: "काल्पनिक परीक्षण दृष्टि।",
      sections: [{ heading_en: "Synthetic essay", heading_hi: "परीक्षण निबंध", body_en: "This is synthetic long-form text used only to exercise the existing publication path.",
        body_hi: "यह पाठ केवल प्रकाशन पथ के पृथक परीक्षण के लिए है।", evidence_refs: ["synthetic-source"] }] }
  };
  copy.reviews = MEANING_REVIEW_KINDS.map(kind => ({ kind, review_status: "approved", approval_ref: "synthetic-" + kind + "-review", content_hash: snapshotHash(copy.content) }));
  record.approval_record_refs.push("synthetic-textual-review", "synthetic-philosophical-review");
  return record;
}
export async function syntheticPublication(date = "2026-10-23", long = false, transform = null) {
  const input = syntheticSelection(3, date, long), store = createSyntheticWordStore(syntheticIdentityRef);
  if (transform) input.bank.records.forEach(transform);
  const authorization = { ...syntheticApproval, trust_boundary: "server_only", actor_ref: "synthetic-server", capabilities: ["reserve", "authorize", "record_publication"], simulation_only: true };
  let previous;
  for (const operation of ["reserve", "authorize", "record_publication"]) {
    input.history = await store.readHistory(); input.expected_history_ref = input.history.snapshot_ref;
    const command = { contract_version: WORD_CONTRACT, operation, idempotency_key: "synthetic-" + operation, timestamp: date + "T01:00:00.000Z" };
    if (previous) Object.assign(command, { assignment_id: previous.assignment.assignment_id, proposal_id: previous.assignment.proposal_id,
      expected_last_event_id: input.history.events.at(-1).event_id, decision: syntheticApproval });
    previous = await executeWordAssignment({ adapter: store, authorization, command, selection_input: input });
    if (previous.status !== "committed") throw new Error("Synthetic lifecycle failed: " + JSON.stringify(previous));
  }
  const history = await store.readHistory();
  const release = { ...syntheticApproval, public_output_allowed: true, runtime_activation: true, approved_publication_event_refs: [history.events.at(-1).event_id] };
  return { input, store, history, release, output: projectPublishedWord({ history, date_key: date, release }) };
}
