import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { copySnapshot, snapshotHash, validApprovedRecord, selectDailyWord } from "./lib/ag70d-word-selection-engine.mjs";
import { reviewedWordCopy } from "./lib/ag70e-word-publication-pipeline.mjs";
import { readPublicWord } from "./lib/ag70e-word-public-feed.mjs";
import { syntheticWord, syntheticSelection, syntheticPublication, withSyntheticMeaning } from "./lib/ag70e-word-test-fixtures.mjs";
import { meaningStructureErrors, MEANING_COPY_VERSION, MEANING_REVIEW_KINDS } from "./lib/ag70e-word-meaning-contract.mjs";
import { dictionaryResearchLeads, buildFullBankResearch, inspectFullBankPipeline, meaningResearchReviewMarkdown } from "./lib/ag70e-word-research-preparation.mjs";
import { PrivateLexicalStore, DEFAULT_ROOT, digest, approvedEngineBank } from "./lib/ag70e-word-lexical-bank.mjs";

// No real approvals are created. Every positive publication below is synthetic/in-memory.
let checks = 0;
async function check(name, run) { await run(); checks++; console.log("PASS " + name); }
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const sample = withSyntheticMeaning(syntheticWord(1));
await check("synthetic v2 structure, seven reviews and engine eligibility pass", () => {
  assert.deepEqual(meaningStructureErrors(sample.reviewed_publication_copy.content), []);
  assert(reviewedWordCopy(sample.reviewed_publication_copy)); assert(validApprovedRecord(sample));
});
await check("legacy v1 semantics and hashes remain unchanged", async () => {
  const fixture = await syntheticPublication(); assert.equal(fixture.output.status, "published");
  assert.equal(fixture.output.assignment.reviewed_copy.contract_version, "ag70e.word-copy.v1");
  assert.equal(fixture.output.assignment.copy_content_hash, snapshotHash(fixture.input.bank.records[0].reviewed_publication_copy.content));
});
for (const kind of MEANING_REVIEW_KINDS) await check("pending " + kind + " cannot approve expanded copy", () => {
  const record = copySnapshot(sample); record.reviewed_publication_copy.reviews.find(r => r.kind === kind).review_status = "pending";
  assert(!reviewedWordCopy(record.reviewed_publication_copy)); assert(!validApprovedRecord(record));
});
for (const kind of ["textual", "philosophical"]) await check(kind + " approval must be in the registered record references", () => {
  const record = copySnapshot(sample); record.approval_record_refs = record.approval_record_refs.filter(ref => ref !== "synthetic-" + kind + "-review");
  assert(!validApprovedRecord(record));
});
const malformed = [
  ["unknown copy key", c => { c.private_notes = "not public"; }],
  ["unknown details key", c => { c.meaning_details.force_approve = true; }],
  ["unknown contract", c => { c.meaning_details.contract_version = "unknown"; }],
  ["missing long explanation", c => { c.meaning_details.explanation_en = null; }],
  ["missing Hindi explanation", c => { c.meaning_details.explanation_hi = null; }],
  ["short methodology", c => { c.meaning_details.method_summary_en = "Dictionary checked."; }],
  ["long methodology", c => { c.meaning_details.method_summary_en = "This deliberately verbose methodology sentence contains more than eight separate words."; }],
  ["no scripture", c => { c.meaning_details.scriptural_references = []; }],
  ["null passage", c => { c.meaning_details.scriptural_references = [null]; }],
  ["missing edition", c => { c.meaning_details.scriptural_references[0].edition = null; }],
  ["dictionary is not scripture", c => { c.meaning_details.scriptural_references[0].evidence_ref = "synthetic-source"; }],
  ["unlinked passage", c => { c.meaning_details.scriptural_references[0].evidence_ref = "unknown"; }],
  ["unsupported relationship", c => { c.meaning_details.scriptural_references[0].relation = "proves_all_meanings"; }],
  ["surface form missing from quotation", c => { c.meaning_details.scriptural_references[0].matched_form = "not in passage"; }],
  ["duplicate passage", c => { c.meaning_details.scriptural_references.push(copySnapshot(c.meaning_details.scriptural_references[0])); }],
  ["no essay", c => { c.meaning_details.philosophical_essay = null; }],
  ["missing tradition scope", c => { c.meaning_details.philosophical_essay.tradition_scope_en = null; }],
  ["essay mislabelled as scripture", c => { c.meaning_details.philosophical_essay.kind = "authenticated_scripture"; }],
  ["unlinked essay claim", c => { c.meaning_details.philosophical_essay.sections[0].evidence_refs = ["unknown"]; }],
  ["unknown nested essay key", c => { c.meaning_details.philosophical_essay.sections[0].review_notes = "private"; }]
];
for (const [name, edit] of malformed) await check("reject " + name + " even with refreshed synthetic hashes", () => {
  const record = copySnapshot(sample), copy = record.reviewed_publication_copy;
  edit(copy.content); copy.reviews.forEach(r => { r.content_hash = snapshotHash(copy.content); });
  assert(meaningStructureErrors(copy.content).length > 0); assert(!reviewedWordCopy(copy)); assert(!validApprovedRecord(record));
});
await check("tampered essay invalidates exact-copy approval", () => {
  const record = copySnapshot(sample); record.reviewed_publication_copy.content.meaning_details.philosophical_essay.sections[0].body_en += " Unreviewed.";
  assert(!reviewedWordCopy(record.reviewed_publication_copy)); assert(!validApprovedRecord(record));
});
await check("malformed nested data fails without throwing", () => {
  for (const value of [null, [], {}, { sources: [null] }]) assert(meaningStructureErrors(value).length > 0);
  for (const value of [null, {}, { contract_version: MEANING_COPY_VERSION, content: null }]) assert.equal(reviewedWordCopy(value), false);
});

const date = "2026-10-25", timestamp = date + "T10:00:00.000Z";
const lifecycle = await syntheticPublication(date, false, withSyntheticMeaning);
const readSnapshot = async () => ({ history: lifecycle.history, release: lifecycle.release });
const publicOutput = await readPublicWord({ readSnapshot, timestamp, enabled: true });
await check("existing reservation/authorization/publication lifecycle carries synthetic v2 unchanged", () => {
  assert.equal(publicOutput.status, "published"); assert.equal(publicOutput.assignment.reviewed_copy.contract_version, MEANING_COPY_VERSION);
  assert.equal(publicOutput.assignment.reviewed_copy.reviews.length, 7);
  assert.deepEqual(publicOutput.assignment.reviewed_copy.content, lifecycle.input.bank.records[0].reviewed_publication_copy.content);
});
await check("read-only feed stays dormant independently of synthetic approvals", async () => {
  let calls = 0; const output = await readPublicWord({ timestamp, readSnapshot: () => { calls++; }, enabled: false });
  assert.equal(calls, 0); assert.equal(output.status, "withheld"); assert.equal(output.public_output_allowed, false);
});
await check("v1 relabelling cannot smuggle extended fields through public projection", async () => {
  const h = copySnapshot(lifecycle.history);
  const proposal = h.events.find(e => e.event_type === "selection_proposal");
  // The immutable proposal hash itself fails if a caller rewrites its contract.
  proposal.proposal.snapshot.approved_record_snapshot.reviewed_publication_copy.contract_version = "ag70e.word-copy.v1";
  assert.equal((await readPublicWord({ readSnapshot: async () => ({ history: h, release: lifecycle.release }), timestamp, enabled: true })).status, "withheld");
});
const escape = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const window = { crypto: webcrypto, DrishvaraV2Shell: { escapeHtml: escape } };
vm.runInNewContext(fs.readFileSync("assets/js/drishvara-v2-homepage.js", "utf8"), { window, document: {}, Intl, Date, URL, Map, Set, TextEncoder, Uint8Array });
await check("homepage accepts reviewed synthetic v2 without a second loader", async () => {
  assert(await window.DrishvaraV2Homepage.approvedWordPublication(publicOutput, new Date(timestamp)));
  const html = window.DrishvaraV2Homepage.wordMeaningMarkup(publicOutput.assignment.reviewed_copy.content);
  for (const heading of ["Meaning", "Scriptural references and context", "Philosophical perspective", "Sources and attribution"]) assert(html.includes(heading));
  assert(html.includes('Process: <a href="#f2-word-sources-section">Source and Context Review</a>'));
  assert(!html.includes('How this meaning was prepared'));
  assert(!html.includes(lifecycle.input.bank.records[0].reviewed_publication_copy.content.meaning_details.method_summary_en));
  assert(!html.includes(lifecycle.input.bank.records[0].reviewed_publication_copy.content.iast));
  assert(html.includes("Related concept, not an exact-word attestation."));
  assert(html.includes('aria-label="Word reading sections"'));
  for (const id of ['meaning', 'textual', 'essay', 'sources']) assert(html.includes('id="f2-word-' + id + '-section"'));
  assert(html.includes('data-word-language="en"')); assert(html.includes('data-word-language="hi"'));
  assert(html.includes('Original editorial interpretation')); assert(html.includes('<details class="f2-word-source"'));
  assert(html.includes('target="_blank" rel="noopener noreferrer"'));
});
await check("expanded content is text-escaped, never executable HTML", () => {
  const content = copySnapshot(sample.reviewed_publication_copy.content);
  content.meaning_details.philosophical_essay.sections[0].body_en = '<img src=x onerror="execute()">';
  const html = window.DrishvaraV2Homepage.wordMeaningMarkup(content); assert(!html.includes("<img")); assert(html.includes("&lt;img"));
});
await check("missing textual approval or tampered essay is withheld by homepage", async () => {
  for (const mutate of [o => { o.assignment.reviewed_copy.reviews.find(r => r.kind === "textual").review_status = "pending"; },
    o => { o.assignment.reviewed_copy.content.meaning_details.philosophical_essay.sections[0].body_en += " Changed"; }]) {
    const output = copySnapshot(publicOutput); mutate(output); assert.equal(await window.DrishvaraV2Homepage.approvedWordPublication(output, new Date(timestamp)), null);
  }
});

const [packageFile, curatedFile, submissionsFile] = process.argv.slice(2);
if (!packageFile || !curatedFile || !submissionsFile) throw Error("provide_private_full_bank_curated_and_submissions_paths");
const pack = read(packageFile), curated = read(curatedFile), submissions = read(submissionsFile);
const loaded = new PrivateLexicalStore(DEFAULT_ROOT).load(), before = loaded.current;
const exportRecord = copySnapshot(sample), local = loaded.snapshot.records[0], dictionaryRef = local.source_evidence[0].evidence_id;
exportRecord.lexical_bank_ref = { record_id: local.record_id, version_hash: local.version_hash };
exportRecord.source_evidence[0].evidence_ref = dictionaryRef;
exportRecord.reviewed_publication_copy.content.sources[0].evidence_ref = dictionaryRef;
exportRecord.reviewed_publication_copy.content.meaning_details.philosophical_essay.sections[0].evidence_refs = [dictionaryRef];
exportRecord.reviewed_publication_copy.reviews.forEach(review => { review.content_hash = snapshotHash(exportRecord.reviewed_publication_copy.content); });
exportRecord.approval_record_refs.push("synthetic-text-evidence-review", "synthetic-rights");
const passage = exportRecord.reviewed_publication_copy.content.meaning_details.scriptural_references[0];
const evidenceMap = { records: [{ evidence_id: "synthetic-scripture", linked_record_id: exportRecord.output_candidate_id,
  linked_record_type: "approved_output_candidate", source_class: "scriptural_text", review_status: "approved", public_use_permission: "approved_for_output",
  source_access_checked: true, reuse_note_checked: true, internal_textual_discipline_check: "review_approved", approval_ref: "synthetic-text-evidence-review",
  content_hash: snapshotHash(exportRecord.reviewed_publication_copy.content), url: exportRecord.reviewed_publication_copy.content.sources[1].url,
  reuse_approval_ref: "synthetic-rights", locator: passage.locator, work: passage.work, edition: passage.edition, passage_hash: snapshotHash(passage) }] };
await check("expanded export requires an independent existing-AG70E textual evidence record", () => {
  assert.equal(approvedEngineBank(loaded.snapshot, { records: [exportRecord] }).records.length, 0);
  const bank = approvedEngineBank(loaded.snapshot, { records: [exportRecord] }, evidenceMap);
  assert.equal(bank.records.length, 1); const input = syntheticSelection(1); input.bank = bank;
  assert.equal(selectDailyWord(input).status, "proposal");
});
for (const [field, value] of [["review_status", "pending"], ["content_hash", "wrong"], ["passage_hash", "wrong"],
  ["linked_record_id", "another-word"], ["reuse_approval_ref", "wrong"], ["edition", "different"], ["source_access_checked", false]]) {
  await check("expanded evidence export fails closed for " + field, () => {
    const map = copySnapshot(evidenceMap); map.records[0][field] = value;
    assert.equal(approvedEngineBank(loaded.snapshot, { records: [exportRecord] }, map).records.length, 0);
  });
}
await check("10,000 unique research identities match the unchanged bank and versions", () => {
  const byId = new Map(loaded.snapshot.records.map(r => [r.record_id, r]));
  assert.equal(pack.records.length, 10000); assert.equal(new Set(pack.records.map(r => r.lexical_bank_ref.record_id)).size, 10000);
  assert.equal(pack.lexical_bank_commit, loaded.current);
  for (const row of pack.records) assert.equal(row.lexical_bank_ref.version_hash, byId.get(row.lexical_bank_ref.record_id).version_hash);
});
await check("full-bank preparation is repeatable and hash-bound", () => {
  assert.equal(snapshotHash(buildFullBankResearch({ snapshot: loaded.snapshot, bankCommit: loaded.current, curated, submissions })), snapshotHash(pack));
  assert.equal(pack.manifest_hash, snapshotHash(pack.records.map(r => [r.research_candidate_id, r.record_hash, r.copy_content_hash])));
  assert.equal(digest(fs.readFileSync(packageFile)), packageFile.match(/-([a-f0-9]{64})\.json$/)[1]);
});
await check("all rows carry valid content and record integrity hashes", () => {
  for (const row of pack.records) { const original = copySnapshot(row); delete original.record_hash;
    assert.equal(snapshotHash(original), row.record_hash); assert.equal(snapshotHash(row.reviewed_publication_copy.content), row.copy_content_hash);
  }
});
await check("365 previous drafts remain traceable, not overwritten or promoted", () => {
  const ids = new Set(curated.records.map(r => r.research_candidate_id));
  assert.equal(pack.records.filter(r => ids.has(r.original_curated_candidate_ref)).length, 365);
  assert.equal(pack.counts.short_copy_drafts, 365); assert(curated.records.every(r => r.public_use_permission === "not_allowed"));
});
await check("dictionary citations stay unverified and reproduce actual source markup", () => {
  let leads = 0;
  for (let i = 0; i < pack.records.length; i++) {
    const row = pack.records[i], expected = dictionaryResearchLeads(loaded.snapshot.records[i]);
    assert.deepEqual(row.dictionary_citation_leads, expected); leads += expected.length;
    assert(row.dictionary_citation_leads.every(lead => lead.status === "unverified_dictionary_citation" && lead.is_scriptural_authentication === false));
  }
  assert.equal(leads, pack.counts.dictionary_citation_leads);
});
await check("page inspection is not print-edition authentication, translation or approval", () => {
  const inspections = submissions.records.reduce((count, row) => count + row.source_access.filter(a => a.status === "page_inspected").length, 0);
  assert(inspections > 0); assert.equal(pack.counts.source_page_inspections, inspections); assert.equal(pack.counts.authenticated_scriptural_reviews, 0);
  const rows = pack.records.filter(r => r.source_access.length);
  assert(rows.some(r => r.reviewed_publication_copy.content.meaning_details.scriptural_references.some(p => p.relation === "conceptual_parallel")));
  for (const row of rows) {
    if (row.reviewed_publication_copy.content.meaning_details.scriptural_references.some(p => p.edition === null)) {
      assert(row.missing_requirements.includes("incomplete_or_unlinked_scriptural_reference"));
    }
    assert.equal(row.morphology_status, "pending"); assert.equal(row.semantics_status, "pending"); assert.deepEqual(row.approval_record_refs, []);
  }
});
for (const submission of submissions.records) await check("real draft integrity and pending gates: " + submission.content.iast, () => {
  const row = pack.records.find(r => r.lexical_bank_ref.record_id === submission.lexical_bank_ref.record_id);
  assert(row); assert.deepEqual(row.reviewed_publication_copy.content, submission.content);
  assert.equal(row.production_approved, false); assert.equal(row.public_use_permission, "not_allowed");
  assert.equal(row.runtime_activation, false); assert.equal(row.public_output_allowed, false);
  assert(row.reviewed_publication_copy.reviews.every(r => r.review_status === "pending" && r.approval_ref === null && r.reviewer_id === null));
  const details = row.reviewed_publication_copy.content.meaning_details;
  if (!details.scriptural_references.length) assert(row.missing_requirements.includes("verified_scriptural_reference_required"));
  for (const passage of details.scriptural_references) assert(row.source_access.some(a => a.status === "page_inspected" && a.evidence_ref === passage.evidence_ref && a.captured_excerpt.includes(passage.original_text)));
});
await check("readable review includes essay-only drafts without inventing textual evidence", () => {
  const markdown = meaningResearchReviewMarkdown(pack);
  for (const row of pack.records.filter(r => r.reviewed_publication_copy.content.meaning_details.philosophical_essay)) {
    assert(markdown.includes("Copy hash: " + row.copy_content_hash));
    assert(markdown.includes(row.reviewed_publication_copy.content.meaning_details.philosophical_essay.sections[0].body_en));
  }
  if (submissions.records.some(r => !r.content.meaning_details.scriptural_references.length)) assert(markdown.includes("No suitable exact passage has been verified"));
});
await check("all 10,000 research records actually fail production copy/eligibility gates", () => {
  const bank = read("data/knowledge-base/word-of-day/production/knowledge-bank/approved-output-candidate-bank.json");
  const result = inspectFullBankPipeline(pack, loaded.snapshot, bank);
  assert.equal(result.records_checked, 10000); assert.equal(result.copy_approval_passes, 0); assert.equal(result.eligibility_passes, 0); assert.equal(result.authoritative_export_count, 0);
  assert(pack.records.every(r => r.reviewed_publication_copy.reviews.every(review => review.review_status === "pending" && review.approval_ref === null)));
  assert.equal(pack.counts.essay_drafts, submissions.records.filter(r => r.content.meaning_details.philosophical_essay).length);
  assert.equal(pack.counts.publishable, 0); assert.equal(bank.records.length, 0);
});
await check("real empty export cannot select a word even under isolated synthetic context", () => {
  const input = syntheticSelection(1); input.bank.records = [];
  const result = selectDailyWord(input); assert.equal(result.status, "withheld"); assert.equal(result.reason, "approved_bank_empty");
});
const firstSubmission = submissions.records.find(r => r.source_access.some(a => a.status === "page_inspected"));
assert(firstSubmission, "a genuinely inspected submission is required to test passage tampering");
const mini = { ...loaded.snapshot, records: [loaded.snapshot.records.find(r => r.record_id === firstSubmission.lexical_bank_ref.record_id)] };
const miniCurated = { ...curated, records: curated.records.filter(r => r.lexical_bank_ref.record_id === mini.records[0].record_id) };
const miniSubmissions = { ...submissions, records: [firstSubmission] };
assert.doesNotThrow(() => buildFullBankResearch({ snapshot: mini, bankCommit: before, curated: miniCurated, submissions: miniSubmissions, expectedCount: 1 }));
for (const [name, edit] of [
  ["unknown identity", s => { s.records[0].lexical_bank_ref.record_id = "not-in-bank"; }],
  ["stale word version", s => { s.records[0].lexical_bank_ref.version_hash = "stale"; }],
  ["duplicate identity", s => { s.records.push(copySnapshot(s.records[0])); }],
  ["forged approval flag", s => { s.records[0].production_approved = true; }],
  ["source approval fabricated", s => { s.records[0].content.sources[0].review_status = "approved"; }],
  ["uninspected quoted passage", s => { s.records[0].source_access[0].status = "inaccessible"; s.records[0].source_access[0].captured_excerpt = null; }]
]) await check("research import rejects " + name, () => {
  const input = copySnapshot(miniSubmissions); edit(input);
  assert.throws(() => buildFullBankResearch({ snapshot: mini, bankCommit: before, curated: miniCurated, submissions: input, expectedCount: 1 }));
});
await check("private corpus, approved bank and homepage activation remain unchanged", () => {
  assert.equal(new PrivateLexicalStore(DEFAULT_ROOT).load().current, before);
  assert.equal(read("generated/word-of-day-publication.json").status, "withheld");
  assert(fs.readFileSync("index.html", "utf8").includes('<meta name="drishvara-word-feed" content="" />'));
  assert.equal(pack.runtime_activation, false); assert.equal(pack.public_output_allowed, false);
});
console.log(JSON.stringify({ checks, failures: 0, assessed: 10000, real_scriptural_approvals: 0, real_published: 0, positive_lifecycle: "synthetic_only", status: "NOT LIVE" }));
