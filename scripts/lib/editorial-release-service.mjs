import { canonicalJson, candidateRef, canonicalPublicationDate, validApprovedRecord } from "./ag70d-word-selection-engine.mjs";
import { reviewedWordCopy } from "./ag70e-word-publication-pipeline.mjs";
import { executeEditorialCommand, validateEditorialCommand } from "./editorial-workspace-service.mjs";

const internal = value => ({ ...value, public_output_allowed: false, runtime_activation: false });
const required = { article: ["editorial", "rights", "factual", "safety", "media", "publisher_acceptance"],
  word: ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"] };

export function assessEditorialRelease(opened, { enabled = false } = {}) {
  const expected = required[opened?.candidate?.kind], state = opened?.review_state;
  const validState = expected && Array.isArray(state?.required_scopes) && Array.isArray(state.approved_scopes) &&
    canonicalJson([...state.required_scopes].sort()) === canonicalJson([...expected].sort()) &&
    state.approved_scopes.every(s => expected.includes(s)) && new Set(state.approved_scopes).size === state.approved_scopes.length;
  const missing = validState ? expected.filter(s => !state.approved_scopes.includes(s)) : [];
  const blockers = [];
  if (!validState) blockers.push("review_state_unavailable");
  else if (missing.length || state.reviews_complete !== true) blockers.push("editorial_reviews_pending");
  if (opened?.review_permissions?.can_request_release !== true) blockers.push("release_scope_denied");
  const requestAllowed = blockers.length === 0;
  if (!enabled) blockers.push("delivery_not_activated");
  return internal({ ok: true, request_allowed: requestAllowed, delivery_enabled: enabled === true,
    status: requestAllowed ? enabled ? "ready_for_controlled_delivery" : "ready_for_handoff" : "blocked",
    missing_scopes: missing, blockers });
}

// Registration is an existing AG70E authority, never a replacement approved bank.
export async function deliverReviewedWord({ job, rpc, timestamp, revalidate }) {
  const date = canonicalPublicationDate(timestamp);
  if (!date || !job.word_record_ref) throw Error("approved_word_registration_pending");
  const response = await rpc("editorial_registered_word", { p_ref: job.word_record_ref });
  const record = response?.data, copy = record?.reviewed_publication_copy;
  if (response?.error || !record) throw Error("word_workflow_unavailable");
  if (candidateRef(record) !== job.word_record_ref || !validApprovedRecord(record) || !reviewedWordCopy(copy) ||
      ["revoked", "withdrawn", "superseded"].some(k => record[k] === true) ||
      canonicalJson(copy.content) !== canonicalJson(job.version.payload.content)) throw Error("approved_word_copy_mismatch");
  for (const d of job.decisions) {
    const ref = "editorial-decision:" + d.id;
    if (!record.approval_record_refs.includes(ref) ||
        (d.scope !== "publisher_acceptance" && d.scope !== "iast" && !copy.reviews.some(r => r.kind === d.scope && r.approval_ref === ref)) ||
        (d.scope === "iast" && copy.iast_approval_ref !== ref)) throw Error("word_approval_registration_mismatch");
  }
  await revalidate();
  return { status: "eligible_for_daily_selection", reference: job.word_record_ref };
}

export async function requestControlledRelease({ command, session, rpc, workerRpc, articlePublisher, authorizationRef = null, enabled = false, timestamp = new Date().toISOString() }) {
  const error = validateEditorialCommand(command);
  if (error || command.action !== "request_release") return internal({ ok: false, code: error || "invalid_release_command" });
  const opened = await executeEditorialCommand({ action: "open", candidate_id: command.candidate_id }, rpc);
  if (opened.version?.id !== command.version_id || opened.version?.content_hash !== command.content_hash)
    return internal({ ok: false, code: "stale_editorial_version" });
  const readiness = assessEditorialRelease(opened, { enabled });
  if (!readiness.request_allowed) return internal({ ok: false, code: readiness.blockers[0], readiness });
  const queued = await executeEditorialCommand(command, rpc);
  if (!queued.ok || !enabled) return internal({ ...queued, status: queued.ok ? "queued_delivery_disabled" : queued.status, readiness });
  if (typeof workerRpc !== "function" || !session?.actor_id) return internal({ ...queued, status: "queued_worker_unavailable" });
  let job;
  const worker = async (operation, fields = {}) => {
    const r = await workerRpc("editorial_release_worker", { p_command: { operation, actor_id: session.actor_id,
      command_id: command.command_id, release_request_id: queued.release_request_id, authorization_ref: authorizationRef, ...fields } });
    if (!r || r.ok !== true || r.public_output_allowed !== false || r.runtime_activation !== false) throw Error("release_worker_unavailable");
    return r;
  };
  try {
    job = await worker("claim");
    if (job.status !== "claimed") return internal({ ...queued, status: job.status, delivery: job.result ?? null });
    if (job.candidate_id !== command.candidate_id || job.version_id !== command.version_id || job.content_hash !== command.content_hash ||
        !["word", "article"].includes(job.kind)) throw Error("release_authority_changed");
    const revalidate = async () => { const r = await worker("check", { claim_id: job.claim_id }); if (r.status !== "valid") throw Error("release_authority_changed"); };
    const delivery = job.kind === "word" ? await deliverReviewedWord({ job, rpc: (name, args) => workerRpc(name, args).then(data => ({ data })), timestamp, revalidate }) :
      typeof articlePublisher === "function" ? await articlePublisher({ job, timestamp, revalidate }) : (() => { throw Error("article_publisher_unavailable"); })();
    await revalidate();
    const receipt = await worker("complete", { claim_id: job.claim_id, result: delivery });
    return internal({ ...queued, status: receipt.status, delivery: receipt.result });
  } catch (failure) {
    const known = new Set(["approved_word_registration_pending", "word_workflow_unavailable", "approved_word_copy_mismatch", "word_approval_registration_mismatch",
      "release_authority_changed", "article_publisher_unavailable", "article_copy_incomplete", "article_media_contract_pending", "article_sources_pending", "article_destination_conflict", "article_branch_advanced"]);
    const code = known.has(failure.message) ? failure.message : "release_delivery_unavailable";
    if (job?.claim_id) { try { await worker("fail", { claim_id: job.claim_id, result: { code } }); } catch { /* Leave the lease for controlled recovery, never report success. */ } }
    return internal({ ...queued, status: "delivery_pending", code });
  }
}
