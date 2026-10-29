import { canonicalJson, snapshotHash, validApprovedRecord } from "./ag70d-word-selection-engine.mjs";
import { reviewedWordCopy } from "./ag70e-word-publication-pipeline.mjs";

const internal = fields => ({ ...fields, public_output_allowed: false, runtime_activation: false });
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const exact = (value, keys) => object(value) && canonicalJson(Object.keys(value).sort()) === canonicalJson([...keys].sort());
const uuid = value => typeof value === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const fields = ["canonical_lexical_identity_id", "lemma_id", "equivalence_group_id", "context_signal_id"];

export function validateWordRegistration(command) {
  try {
    if (!exact(command, ["action", "command_id", "candidate_id", "version_id", "content_hash", "metadata", "note"]) ||
        command.action !== "register_word" || ![command.command_id, command.candidate_id, command.version_id].every(uuid) ||
        !/^sha256:[a-f0-9]{64}$/.test(command.content_hash)) return "invalid_word_registration";
    if (!exact(command.metadata, [...fields, "no_etymological_claim"]) || command.metadata.no_etymological_claim !== true ||
        fields.some(field => typeof command.metadata[field] !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._:@/-]{0,199}$/.test(command.metadata[field])) ||
        typeof command.note !== "string" || command.note.trim().length < 12 || command.note.length > 6000) return "word_registration_metadata_pending";
    return null;
  } catch { return "invalid_word_registration"; }
}

// Decisions and copy are resolved by the authenticated database, never accepted in the request.
export async function registerReviewedWord({ command, session, rpc }) {
  const error = validateWordRegistration(command);
  if (error) return internal({ ok: false, code: error });
  if (session?.is_administrator !== true) return internal({ ok: false, code: "workspace_administrator_required" });
  const request = { ...command, action: "prepare" };
  const prepared = await rpc("editorial_word_registration", { p_command: request });
  if (prepared?.ok !== true) return internal({ ok: false, code: prepared?.code || "word_registration_unavailable" });
  const record = prepared.record;
  if (prepared.public_output_allowed !== false || prepared.runtime_activation !== false ||
      !validApprovedRecord(record) || !reviewedWordCopy(record?.reviewed_publication_copy) ||
      prepared.record_hash !== snapshotHash(record)) return internal({ ok: false, code: "word_registration_copy_unapproved" });
  const receipt = await rpc("editorial_word_registration", { p_command: { ...request, action: "register", expected_record_hash: prepared.record_hash } });
  if (receipt?.ok !== true || receipt.public_output_allowed !== false || receipt.runtime_activation !== false ||
      receipt.status !== "approved_bank_registered" || receipt.record_hash !== prepared.record_hash)
    return internal({ ok: false, code: receipt?.code || "word_registration_unavailable" });
  return internal({ ok: true, status: receipt.status, candidate_ref: receipt.candidate_ref, record_hash: receipt.record_hash });
}
