import { canonicalJson } from "./ag70d-word-selection-engine.mjs";
import { executeEditorialCommand, validateEditorialCommand } from "./editorial-workspace-service.mjs";
import { articleProductionBlockers } from "./editorial-article-qualification.mjs";

const internal = value => ({ ...value, public_output_allowed: false, runtime_activation: false });
const uuid = v => typeof v === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);

export function articleIntakeBatchError(commands) {
  try {
    if (!Array.isArray(commands) || commands.length < 1 || commands.length > 5 || Buffer.byteLength(JSON.stringify({ commands })) > 240000)
      return "invalid_article_intake_batch";
    const ids = new Set(), identities = new Set(), desks = new Set();
    for (const c of commands) {
      if (c?.action !== "intake" || c.kind !== "article" || c.expected_version_id !== null || validateEditorialCommand(c)) return "invalid_article_intake_batch";
      if (ids.has(c.command_id) || identities.has(c.external_id) || desks.has(c.payload.desk)) return "invalid_article_intake_batch";
      ids.add(c.command_id); identities.add(c.external_id); desks.add(c.payload.desk);
      const blockers = articleProductionBlockers(c.payload); if (blockers.length) return blockers[0];
    }
    return null;
  } catch { return "invalid_article_intake_batch"; }
}

// Only existing authenticated intake/open RPC commands are used. No approval, Git writer or release worker.
export async function submitPreparedArticles({ commands, session, rpc }) {
  if (session?.ok !== true || !Array.isArray(session.capabilities) || !session.capabilities.some(g => g?.kind === "article" && g.scope === "intake") || typeof rpc !== "function")
    return internal({ ok: false, code: "editorial_intake_denied", receipts: [] });
  const error = articleIntakeBatchError(commands);
  if (error) return internal({ ok: false, code: error, receipts: [] });
  const receipts = [];
  for (let index = 0; index < commands.length; index++) {
    const c = commands[index]; let receipt;
    try {
      receipt = await executeEditorialCommand(c, rpc);
      if (!receipt.ok || !uuid(receipt.candidate_id) || !uuid(receipt.version_id) || !/^sha256:[a-f0-9]{64}$/.test(receipt.content_hash || "")) throw Error();
      const opened = await executeEditorialCommand({ action: "open", candidate_id: receipt.candidate_id }, rpc);
      if (!opened.ok || opened.candidate?.kind !== "article" || opened.candidate.external_id !== c.external_id ||
          opened.version?.id !== receipt.version_id || opened.version.content_hash !== receipt.content_hash || opened.version.title !== c.title ||
          canonicalJson(opened.version.payload) !== canonicalJson(c.payload)) throw Error();
      receipts.push({ command_id: c.command_id, external_id: c.external_id, candidate_id: receipt.candidate_id,
        version_id: receipt.version_id, content_hash: receipt.content_hash });
    } catch {
      // Earlier intakes may already be committed. Retain command IDs for safe replay; never claim rollback.
      return internal({ ok: false, code: "article_intake_reconciliation_required", receipts, stopped_at: index,
        uncertain_command_id: c.command_id, observed_receipt: receipt?.ok === true && uuid(receipt.candidate_id) && uuid(receipt.version_id) &&
          /^sha256:[a-f0-9]{64}$/.test(receipt.content_hash || "") ? {
          candidate_id: receipt.candidate_id, version_id: receipt.version_id, content_hash: receipt.content_hash } : null });
    }
  }
  return internal({ ok: true, status: "private_intake_complete", receipts });
}
