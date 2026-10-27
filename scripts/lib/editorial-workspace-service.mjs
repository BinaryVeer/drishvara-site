import { meaningStructureErrors, MEANING_COPY_VERSION } from "./ag70e-word-meaning-contract.mjs";
import { canonicalJson } from "./ag70d-word-selection-engine.mjs";

export const EDITORIAL_CONTRACT = "drishvara.editorial-review.v1";
export const ARTICLE_DESKS = Object.freeze(["world_affairs", "media_society", "public_programmes", "sports", "spirituality"]);
const object = v => v && typeof v === "object" && !Array.isArray(v);
const exact = (v, keys) => object(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const text = (v, max = 2000) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const uuid = v => typeof v === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const hash = v => typeof v === "string" && /^sha256:[a-f0-9]{64}$/.test(v);
const scopes = ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "factual", "media", "publisher_acceptance"];

export function validateEditorialCommand(command) {
  try {
    const serialized = canonicalJson(command);
    if (Buffer.byteLength(serialized) > 240000) return "request_too_large";
    if (!object(command)) return "invalid_command";
    const shapes = {
      session: ["action"], list: ["action"], open: ["action", "candidate_id"],
      intake: ["action", "command_id", "kind", "external_id", "expected_version_id", "title", "payload"],
      decision: ["action", "command_id", "candidate_id", "version_id", "content_hash", "scope", "decision", "note", "evidence_refs"],
      request_release: ["action", "command_id", "candidate_id", "version_id", "content_hash"]
    };
    if (!exact(command, shapes[command.action] ?? [])) return "unknown_or_missing_command_fields";
    if (command.action === "session" || command.action === "list") return null;
    if (command.action === "open") return uuid(command.candidate_id) ? null : "invalid_candidate_id";
    if (!uuid(command.command_id)) return "invalid_command_id";
    if (command.action === "intake") {
      if (!["word", "article"].includes(command.kind) || !text(command.external_id, 200) || !text(command.title, 400) ||
          !(command.expected_version_id === null || uuid(command.expected_version_id))) return "invalid_intake_identity";
      const p = command.payload;
      if (command.kind === "word") {
        if (!exact(p, ["contract_version", "content", "research_refs"]) || p.contract_version !== MEANING_COPY_VERSION ||
            meaningStructureErrors(p.content).length || !Array.isArray(p.research_refs) || p.research_refs.length > 50 ||
            p.research_refs.some(r => !text(r, 500))) return "invalid_word_research_copy";
      } else if (!exact(p, ["desk", "body", "sources", "media", "research_refs"]) || !ARTICLE_DESKS.includes(p.desk) ||
          !text(p.body, 150000) || !Array.isArray(p.sources) || p.sources.length > 50 ||
          !Array.isArray(p.media) || p.media.length > 20 || !Array.isArray(p.research_refs) || p.research_refs.length > 50 ||
          p.research_refs.some(r => !text(r, 500))) return "invalid_article_research_copy";
      return null;
    }
    if (!uuid(command.candidate_id) || !uuid(command.version_id) || !hash(command.content_hash)) return "invalid_version_binding";
    if (command.action === "decision" && (!scopes.includes(command.scope) || !["approve", "revise", "reject"].includes(command.decision) ||
        !text(command.note, 6000) || !Array.isArray(command.evidence_refs) || command.evidence_refs.length > 50 ||
        command.evidence_refs.some(r => !text(r, 500)) || new Set(command.evidence_refs).size !== command.evidence_refs.length ||
        (command.decision === "approve" && command.evidence_refs.length === 0))) return "invalid_review_decision";
    return null;
  } catch { return "invalid_json_command"; }
}

// The database derives the actor from auth.uid(); caller-supplied actor/role/approval flags are rejected.
export async function executeEditorialCommand(command, rpc) {
  const error = validateEditorialCommand(command);
  if (error) return { ok: false, code: error, public_output_allowed: false, runtime_activation: false };
  const result = await rpc("editorial_review_command", { p_command: command });
  if (!object(result) || typeof result.ok !== "boolean" || result.public_output_allowed !== false || result.runtime_activation !== false)
    throw new Error("invalid_editorial_receipt");
  return result;
}
