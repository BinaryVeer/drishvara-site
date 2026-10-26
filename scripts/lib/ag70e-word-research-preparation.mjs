import fs from "node:fs";
import path from "node:path";
import { DEFAULT_ROOT, PrivateLexicalStore, assertPrivateRoot, digest, approvedEngineBank } from "./ag70e-word-lexical-bank.mjs";
import { canonicalJson, snapshotHash, copySnapshot, validApprovedRecord } from "./ag70d-word-selection-engine.mjs";
import { reviewedWordCopy } from "./ag70e-word-publication-pipeline.mjs";
import { MEANING_COPY_VERSION, MEANING_REVIEW_KINDS, emptyMeaningDetails, meaningStructureErrors } from "./ag70e-word-meaning-contract.mjs";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const pending = kind => ({ kind, review_status: "pending", approval_ref: null, reviewer_id: null });
const sourceUrl = value => { try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } };

export function dictionaryResearchLeads(record) {
  const leads = new Map();
  for (const source of record.source_evidence) {
    for (const match of source.raw_markup.matchAll(/<ls(?:\s[^>]*)?>([\s\S]*?)<\/ls>/g)) {
      const citation = match[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (!citation) continue;
      const key = source.evidence_id + ":" + citation;
      leads.set(key, { dictionary_evidence_ref: source.evidence_id, recorded_citation: citation,
        status: "unverified_dictionary_citation", is_scriptural_authentication: false });
    }
  }
  return [...leads.values()].sort((a, b) => canonicalJson(a) < canonicalJson(b) ? -1 : canonicalJson(a) > canonicalJson(b) ? 1 : 0);
}

function researchCopy(content) {
  const copy = { contract_version: MEANING_COPY_VERSION, version: "meaning-research-draft-v1", content,
    iast_review_status: "pending", iast_approval_ref: null, reviews: [] };
  copy.reviews = MEANING_REVIEW_KINDS.map(kind => ({ ...pending(kind), content_hash: snapshotHash(content) }));
  return copy;
}

function validateSubmission(row, record) {
  if (Object.keys(row).some(key => !["lexical_bank_ref", "content", "source_access", "notes"].includes(key)) ||
      row.lexical_bank_ref?.version_hash !== record.version_hash || !row.content ||
      row.content.sanskrit !== record.devanagari || row.content.iast !== record.iast || !Array.isArray(row.source_access) ||
      !Array.isArray(row.content.sources) || row.content.sources.some(source => source.review_status !== "pending" || source.reuse_approval_ref !== null || !sourceUrl(source.url))) {
    throw Error("invalid_or_approval_bearing_research_submission");
  }
  const refs = new Set(row.content.sources.map(source => source.evidence_ref));
  const passages = row.content.meaning_details?.scriptural_references;
  if (!Array.isArray(passages) || passages.some(passage => !refs.has(passage.evidence_ref))) throw Error("unlinked_research_passage");
  for (const access of row.source_access) {
    if (Object.keys(access).some(key => !["evidence_ref", "url", "accessed_on", "status", "locator", "captured_excerpt", "limitation"].includes(key)) ||
        !refs.has(access.evidence_ref) || !sourceUrl(access.url) ||
        row.content.sources.find(source => source.evidence_ref === access.evidence_ref)?.url !== access.url ||
        !/^\d{4}-\d{2}-\d{2}$/.test(access.accessed_on) || !["page_inspected", "inaccessible"].includes(access.status) || !access.limitation ||
        (access.status === "inaccessible" && access.captured_excerpt !== null) ||
        (access.status === "page_inspected" && typeof access.captured_excerpt !== "string")) throw Error("invalid_source_access_record");
  }
  for (const passage of passages) {
    if (passage.original_text && !row.source_access.some(access => access.evidence_ref === passage.evidence_ref && access.status === "page_inspected" &&
        access.captured_excerpt.includes(passage.original_text))) throw Error("uninspected_passage_cannot_be_attested");
  }
}

export function buildFullBankResearch({ snapshot, bankCommit, curated, submissions = null, expectedCount = 10000 }) {
  if (snapshot.records.length !== expectedCount || new Set(snapshot.records.map(r => r.record_id)).size !== expectedCount ||
      curated.lexical_bank_commit !== bankCommit || !Array.isArray(curated.records)) throw Error("research_bank_identity_mismatch");
  const base = new Map(snapshot.records.map(record => [record.record_id, record]));
  const chosen = new Map();
  for (const row of curated.records) {
    const record = base.get(row.lexical_bank_ref?.record_id);
    const previous = copySnapshot(row); delete previous.record_hash;
    if (!record || chosen.has(record.record_id) || row.lexical_bank_ref.version_hash !== record.version_hash || snapshotHash(previous) !== row.record_hash ||
        row.minimum_publication_contract?.copy_content_hash !== snapshotHash(row.reviewed_publication_copy?.content) ||
        row.production_approved !== false || row.public_use_permission !== "not_allowed") throw Error("curated_draft_integrity_mismatch");
    chosen.set(record.record_id, row);
  }
  const imported = new Map();
  if (submissions) {
    if (submissions.contract_version !== "ag70e.word-research-submissions.v1" || submissions.lexical_bank_commit !== bankCommit ||
        submissions.public_output_allowed !== false || submissions.runtime_activation !== false || !Array.isArray(submissions.records)) throw Error("invalid_research_submissions");
    for (const row of submissions.records) {
      const record = base.get(row.lexical_bank_ref?.record_id);
      if (!record || imported.has(record.record_id)) throw Error("unknown_or_duplicate_research_identity");
      validateSubmission(row, record); imported.set(record.record_id, row);
    }
  }
  const catalog = new Map(snapshot.catalog.sources.map(source => [source.id, source]));
  const records = snapshot.records.map(record => {
    const old = chosen.get(record.record_id), submission = imported.get(record.record_id);
    const sources = record.source_evidence.map(e => {
      const source = catalog.get(e.source_id);
      return { evidence_ref: e.evidence_id, title: source.title, publisher: source.provider, url: source.url,
        attribution: `${source.author}, ${source.year}; ${source.provider}; entry ${e.entry_id}, ${e.page_column}. CC BY-SA 4.0; adaptation review pending.`,
        review_status: "pending", reuse_approval_ref: null, source_kind: "lexical_dictionary" };
    });
    const content = submission ? copySnapshot(submission.content) : {
      ...(old ? copySnapshot(old.reviewed_publication_copy.content) : {
        sanskrit: record.devanagari, iast: record.iast, english: null, hindi: null, meaning_en: null, meaning_hi: null,
        reflection_en: null, reflection_hi: null, sources }), meaning_details: emptyMeaningDetails()
    };
    if (!submission) content.sources = content.sources.map(source => ({ ...source, source_kind: "lexical_dictionary" }));
    const copy = researchCopy(content);
    const row = {
      research_candidate_id: record.record_id + "@meaning-research-v1", lexical_bank_ref: { record_id: record.record_id, version_hash: record.version_hash },
      original_curated_candidate_ref: old?.research_candidate_id ?? null,
      short_copy_status: old ? "source_linked_editorial_draft_not_approved" : "not_prepared",
      dictionary_evidence_refs: record.source_evidence.map(e => e.evidence_id), dictionary_citation_leads: dictionaryResearchLeads(record),
      reviewed_publication_copy: copy, copy_content_hash: snapshotHash(content), source_access: submission ? copySnapshot(submission.source_access) : [],
      research_notes: submission?.notes ?? [], research_status: submission ? "textual_and_essay_draft_pending_review" : "external_textual_research_pending",
      missing_requirements: [...meaningStructureErrors(content), "qualified_linguistic_and_bilingual_review_pending", "textual_authentication_review_pending",
        "philosophical_and_exact_copy_review_pending", "source_use_review_pending", "canonical_identity_and_release_authorization_pending"],
      etymology_status: "not_claimed", morphology_status: "pending", semantics_status: "pending", review_status: "pending", approval_record_refs: [],
      production_approved: false, approved_for_daily_output: false, public_use_permission: "not_allowed", runtime_activation: false, public_output_allowed: false
    };
    return { ...row, record_hash: snapshotHash(row) };
  });
  return { contract_version: "ag70e.word-full-bank-research.v1", lexical_bank_commit: bankCommit,
    curated_input_hash: snapshotHash(curated), submissions_input_hash: submissions ? snapshotHash(submissions) : null,
    records, manifest_hash: snapshotHash(records.map(r => [r.research_candidate_id, r.record_hash, r.copy_content_hash])),
    counts: {
      assessed: records.length, short_copy_drafts: chosen.size, imported_textual_research_drafts: imported.size,
      records_with_dictionary_citation_leads: records.filter(r => r.dictionary_citation_leads.length).length,
      dictionary_citation_leads: records.reduce((count, r) => count + r.dictionary_citation_leads.length, 0),
      source_page_inspections: records.reduce((count, r) => count + r.source_access.filter(a => a.status === "page_inspected").length, 0),
      essay_drafts: records.filter(r => r.reviewed_publication_copy.content.meaning_details?.philosophical_essay).length,
      complete_draft_structures: records.filter(r => meaningStructureErrors(r.reviewed_publication_copy.content).length === 0).length,
      authenticated_scriptural_reviews: 0, qualified_linguistic_reviews: 0, approved: 0, publishable: 0
    },
    research_boundary: "Coverage and dictionary citation extraction are not external verification. Missing research stays null; no mass-generated scripture or essays.",
    authority: "Private qualification sidecar, not a replacement bank. Only existing authoritative AG70E approved records may be exported.",
    runtime_activation: false, public_output_allowed: false, status: "NOT LIVE" };
}

export function inspectFullBankPipeline(pack, snapshot, authoritativeBank, evidenceMap = { records: [] }) {
  const bank = approvedEngineBank(snapshot, authoritativeBank, evidenceMap);
  let copyPasses = 0, eligibilityPasses = 0;
  for (const record of pack.records) {
    if (reviewedWordCopy(record.reviewed_publication_copy)) copyPasses++;
    if (validApprovedRecord(record)) eligibilityPasses++;
  }
  return { records_checked: pack.records.length, copy_approval_passes: copyPasses, eligibility_passes: eligibilityPasses,
    authoritative_export_count: bank.records.length, live_publications: 0, runtime_activation: false, public_output_allowed: false,
    note: "Rejection is expected for research drafts. Positive lifecycle checks use separate, explicitly synthetic fixtures." };
}

export function meaningResearchReviewMarkdown(pack) {
  const lines = ["# Word meaning research drafts", "", "NOT APPROVED FOR PUBLICATION. Page inspection is not scriptural authentication. All language, source-use, textual and editorial reviews remain pending."];
  for (const row of pack.records.filter(record => record.source_access.length || record.reviewed_publication_copy.content.meaning_details?.philosophical_essay)) {
    const c = row.reviewed_publication_copy.content, d = c.meaning_details;
    lines.push("", "## " + c.sanskrit + " (" + c.iast + ")", "", "Copy hash: " + row.copy_content_hash, "", c.meaning_en, c.meaning_hi,
      "", "### Extended meaning", "", d.explanation_en, d.explanation_hi, "", "Method: " + d.method_summary_en, d.method_summary_hi);
    for (const p of d.scriptural_references) lines.push("", "### " + p.work + " " + p.locator, "", "Relationship: " + p.relation,
      "Edition: " + (p.edition ?? "PENDING"), "", p.original_text, "", p.translation_en, p.translation_hi, "", p.scope_note_en, p.scope_note_hi);
    if (d.philosophical_essay) {
      lines.push("", "### Philosophical essay: original editorial draft", "", d.philosophical_essay.tradition_scope_en, d.philosophical_essay.tradition_scope_hi);
      for (const section of d.philosophical_essay.sections) lines.push("", "#### " + section.heading_en + " / " + section.heading_hi, "", section.body_en, "", section.body_hi);
    }
    if (!d.scriptural_references.length) lines.push("", "### Textual authentication", "", "No suitable exact passage has been verified for this word. This is an unresolved requirement, not evidence that no passage exists and not a waiver of the publication gate.");
    lines.push("", "### Research review observations (not approval)", "", ...row.research_notes.map(note => typeof note === "string" ? note : JSON.stringify(note, null, 2)),
      "", "### Sources", "", ...c.sources.map(source => `${source.title}: ${source.url}\n\n${source.attribution}`),
      "", "### Missing requirements", "", ...row.missing_requirements.map(reason => "- " + reason));
  }
  return lines.join("\n") + "\n";
}

export function prepareFullBankResearch({ curatedFile, submissionsFile = null, root = DEFAULT_ROOT }) {
  const store = new PrivateLexicalStore(root), loaded = store.load();
  const submissions = submissionsFile ? read(submissionsFile) : null;
  const pack = buildFullBankResearch({ snapshot: loaded.snapshot, bankCommit: loaded.current, curated: read(curatedFile), submissions });
  const authoritative = read("data/knowledge-base/word-of-day/production/knowledge-bank/approved-output-candidate-bank.json");
  const evidence = read("data/knowledge-base/word-of-day/production/knowledge-bank/lexical-source-evidence-map.json");
  const report = inspectFullBankPipeline(pack, loaded.snapshot, authoritative, evidence);
  const dir = assertPrivateRoot(path.join(root, "reviews", "content-qualification"));
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const save = (prefix, value) => {
    const bytes = canonicalJson(value) + "\n", sha256 = digest(bytes), file = path.join(dir, prefix + "-" + sha256 + ".json");
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isSymbolicLink() || fs.readFileSync(file, "utf8") !== bytes) throw Error("immutable_research_artifact_mismatch");
    } else fs.writeFileSync(file, bytes, { flag: "wx", mode: 0o600 });
    return { path: file, sha256 };
  };
  const receipt = save("full-10000-meaning-research", pack);
  const submissionReceipt = submissions ? save("meaning-research-submissions", submissions) : null;
  const pipeline = save("full-10000-pipeline-report", { package_sha256: receipt.sha256, ...report });
  const reviewText = meaningResearchReviewMarkdown(pack), reviewHash = digest(reviewText);
  const reviewFile = path.join(dir, "meaning-research-review-" + reviewHash + ".md");
  if (fs.existsSync(reviewFile)) {
    if (fs.lstatSync(reviewFile).isSymbolicLink() || fs.readFileSync(reviewFile, "utf8") !== reviewText) throw Error("immutable_research_review_mismatch");
  } else fs.writeFileSync(reviewFile, reviewText, { flag: "wx", mode: 0o600 });
  if (store.load().current !== loaded.current) throw Error("lexical_bank_changed_during_research");
  return { package: receipt, submissions: submissionReceipt, pipeline_report: pipeline, readable_review: { path: reviewFile, sha256: reviewHash }, counts: pack.counts, ...report, bank_unchanged: true, status: "NOT LIVE" };
}
