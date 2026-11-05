import { buildCandidateLessons } from "../../drishvara_phase01_scaffold/core/learning/extractor/learningExtractor.js";
import { editorialStage } from "./editorial-workflow.mjs";
import { snapshotHash } from "./ag70d-word-selection-engine.mjs";

// Read-only proposals for the existing lesson system. No model call, bank write or promotion.
export function reviewedCorrectionFeedback(opened, tasks) {
  if (!opened?.candidate || !opened.version || editorialStage({ kind: opened.candidate.kind, review_state: opened.review_state }) !== "publishing" ||
      !Array.isArray(opened.review_state.decision_refs) || !opened.review_state.decision_refs.length || !Array.isArray(tasks)) throw Error("reviewed_feedback_pending");
  const resolved = tasks.filter(t => t.candidate_id === opened.candidate.id && t.status === "submitted" &&
    t.resolution?.kind === "submitted" && t.resolution.comparison_acknowledged === true && t.resolution.result_version_id === opened.version.id &&
    typeof t.instructions === "string" && t.instructions.trim().length >= 12 && t.instructions.length <= 6000);
  if (!resolved.length) throw Error("reviewed_feedback_pending");
  const rawInput = { topic: opened.version.title, contentType: opened.candidate.kind, audience: "general readers" };
  const candidates = buildCandidateLessons({ rawInput, finalStatus: "reviewed_feedback_candidate", revisionHistory: resolved.map(t => ({
    returnToStage: opened.candidate.kind === "article" ? "story-drafter" : "word-research",
    issues: [t.instructions], revisionActions: ["Use the accepted correction as a review consideration; never as source evidence or approval authority."] })) });
  return { ok: true, contract_version: "drishvara.editorial-feedback.v1", candidate_id: opened.candidate.id,
    feedback_id: snapshotHash({ candidate_id: opened.candidate.id, version_id: opened.version.id, content_hash: opened.version.content_hash,
      decisions: [...opened.review_state.decision_refs].sort(), tasks: resolved.map(t => t.id).sort() }),
    version_id: opened.version.id, content_hash: opened.version.content_hash,
    review_decision_refs: opened.review_state.decision_refs, correction_task_refs: resolved.map(t => t.id),
    candidate_lessons: candidates.map(l => ({ ...l, status: "candidate" })),
    promotion_allowed: false, automatic_copy_changes_allowed: false, public_output_allowed: false, runtime_activation: false };
}
