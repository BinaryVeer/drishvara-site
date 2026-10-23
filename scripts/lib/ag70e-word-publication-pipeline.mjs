import {
  WORD_SCOPE, WORD_TIMEZONE, approved, nonempty, validCivilDate, validTimestamp, validApprovedRecord,
  canonicalPublicationDate, dateScopeKey, inspectWordHistory, selectDailyWord, copySnapshot, snapshotHash
} from "./ag70d-word-selection-engine.mjs";

export const PUBLIC_WORD = "ag70e.word-publication.v1";
const reviewKinds = ["linguistic", "editorial", "rights", "context", "safety"];
const textFields = ["english", "hindi", "sanskrit", "meaning_en", "meaning_hi", "reflection_en", "reflection_hi"];

export function safeSourceUrl(value) {
  try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; }
}

export function reviewedWordCopy(copy) {
  if (copy?.contract_version !== "ag70e.word-copy.v1" || !nonempty(copy.version) || !copy.content ||
      !textFields.every(k => nonempty(copy.content[k])) || !Array.isArray(copy.reviews)) return false;
  const contentHash = snapshotHash(copy.content);
  if (reviewKinds.some(kind => copy.reviews.filter(r => r.kind === kind && approved(r) && r.content_hash === contentHash).length !== 1)) return false;
  if (copy.content.iast !== null && (!nonempty(copy.content.iast) || copy.iast_review_status !== "approved" || !nonempty(copy.iast_approval_ref))) return false;
  return Array.isArray(copy.content.sources) && copy.content.sources.length > 0 && copy.content.sources.every(s =>
    ["evidence_ref", "title", "publisher", "attribution", "reuse_approval_ref"].every(k => nonempty(s[k])) &&
    s.review_status === "approved" && safeSourceUrl(s.url));
}

// No writer: a separate explicit release decision is required even for historical publications.
export function projectPublishedWord({ history, date_key, release }) {
  const base = { contract_version: PUBLIC_WORD, publication_scope: WORD_SCOPE, timezone: WORD_TIMEZONE, date_key,
    public_output_allowed: false, runtime_activation: false, assignment: null };
  const withhold = reason => ({ ...base, status: "withheld", reason });
  try {
    if (!validCivilDate(date_key)) return withhold("invalid_canonical_date");
    if (!approved(release) || release.public_output_allowed !== true || release.runtime_activation !== true ||
        !Array.isArray(release.approved_publication_event_refs)) return withhold("release_approval_pending");
    const checked = inspectWordHistory(history);
    if (!checked.ok) return withhold(checked.reason);
    const a = checked.assignments.get(checked.dates.get(dateScopeKey(date_key)));
    if (!a || !["publication", "correction"].includes(a.state)) return withhold("approved_publication_unavailable");
    const event = history.events.find(e => e.event_id === a.last_event_id);
    if (!event || !release.approved_publication_event_refs.includes(event.event_id)) return withhold("publication_release_mismatch");
    const record = a.state === "correction" ? event.corrected_record_snapshot : a.proposal.snapshot.approved_record_snapshot;
    if (!validApprovedRecord(record) || ["withdrawn", "revoked", "superseded"].some(k => record[k] === true) ||
        !reviewedWordCopy(record.reviewed_publication_copy)) return withhold("publication_copy_unapproved");
    const copy = record.reviewed_publication_copy;
    if (copy.content.sources.some(s => !record.source_evidence.some(e => e.evidence_ref === s.evidence_ref && e.review_status === "approved"))) return withhold("publication_evidence_mismatch");
    return { ...base, status: "published", public_output_allowed: true, runtime_activation: true,
      assignment: {
        assignment_id: a.proposal.assignment_id, proposal_id: a.proposal.proposal_id,
        canonical_lexical_identity_id: record.canonical_lexical_identity_id, approved_record_version: record.approved_record_version,
        publication_event_id: event.event_id, publication_timestamp: event.timestamp, release_approval_ref: release.approval_ref,
        selection_trace_ref: snapshotHash(a.proposal.snapshot.trace), copy_content_hash: snapshotHash(copy.content),
        reviewed_copy: copySnapshot(copy), withdrawn: false, superseded: false
      } };
  } catch { return withhold("invalid_publication_contract"); }
}

// Dry-run planning only; deliberately no scheduler, timer, write call or automatic publication.
export function planDailyWordRun({ timestamp, selection_input, configuration }) {
  const date = canonicalPublicationDate(timestamp);
  const withheld = reason => ({ status: "withheld", reason, date_key: date, dry_run: true, public_output_allowed: false, runtime_activation: false });
  if (!date || !validTimestamp(timestamp)) return withheld("invalid_timestamp");
  if (configuration?.contract_version !== "ag70e.word-release.v1" || configuration.timezone !== WORD_TIMEZONE ||
      configuration.publication_scope !== WORD_SCOPE || configuration.scheduler?.enabled !== false ||
      configuration.scheduler.automatic_publication !== false) return withheld("scheduled_execution_not_authorized");
  if (selection_input?.date_key !== date || selection_input?.context?.date_key !== date) return withheld("canonical_context_date_mismatch");
  const selection = selectDailyWord(selection_input);
  const available = selection.trace?.filter(t => t.decision === "eligible").length ?? 0;
  const alerts = selection.status === "withheld" ? [{ severity: "warning", reason: selection.reason }] : [];
  const threshold = configuration.scheduler.low_bank_threshold;
  if (Number.isSafeInteger(threshold) && threshold >= 0 && nonempty(configuration.scheduler.threshold_approval_ref) && available <= threshold) alerts.push({ severity: "warning", reason: "low_unused_bank", remaining: available });
  return { status: "dry_run", date_key: date, dry_run: true, selection,
    idempotency_key: "word-daily:" + snapshotHash([WORD_SCOPE, date, WORD_TIMEZONE]),
    recovery: "Reread the winning date claim and retry the same command key; never regenerate an existing assignment.",
    alerts, public_output_allowed: false, runtime_activation: false };
}
