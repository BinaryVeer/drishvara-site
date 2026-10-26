import { WORD_SCOPE, WORD_TIMEZONE, canonicalPublicationDate, copySnapshot, validTimestamp } from "./ag70d-word-selection-engine.mjs";
import { PUBLIC_WORD, projectPublishedWord } from "./ag70e-word-publication-pipeline.mjs";
import { BASE_COPY_KEYS, MEANING_COPY_VERSION, MEANING_SOURCE_KEYS, copyReviewKinds } from "./ag70e-word-meaning-contract.mjs";

const sourceKeys = ["evidence_ref", "title", "publisher", "url", "attribution", "reuse_approval_ref", "review_status"];
const assignmentKeys = ["assignment_id", "proposal_id", "canonical_lexical_identity_id", "approved_record_version",
  "publication_event_id", "publication_timestamp", "release_approval_ref", "selection_trace_ref", "copy_content_hash", "withdrawn", "superseded"];
const pick = (value, keys) => Object.fromEntries(keys.map(key => [key, value[key]]));
const withheld = (date, reason) => ({ contract_version: PUBLIC_WORD, publication_scope: WORD_SCOPE, timezone: WORD_TIMEZONE,
  date_key: date, status: "withheld", reason, public_output_allowed: false, runtime_activation: false, assignment: null });

export async function readPublicWord({ readSnapshot, timestamp, enabled = false }) {
  const date = canonicalPublicationDate(timestamp);
  if (enabled !== true) return withheld(date, "public_feed_not_activated");
  if (!date || typeof readSnapshot !== "function") return withheld(date, "public_feed_unavailable");
  try {
    const snapshot = await readSnapshot(date);
    const output = projectPublishedWord({ history: snapshot?.history, release: snapshot?.release, date_key: date });
    if (output.status !== "published") return withheld(date, "approved_publication_unavailable");
    const assignment = output.assignment, copy = assignment.reviewed_copy, content = copy.content;
    if (!validTimestamp(assignment.publication_timestamp) || assignment.publication_timestamp > timestamp) {
      return withheld(date, "approved_publication_unavailable");
    }
    // Unknown hash-bound fields cannot be stripped and relabelled as approved copy.
    const contentKeys = copy.contract_version === MEANING_COPY_VERSION ? [...BASE_COPY_KEYS, "meaning_details"] : BASE_COPY_KEYS;
    const allowedSourceKeys = copy.contract_version === MEANING_COPY_VERSION ? MEANING_SOURCE_KEYS : sourceKeys;
    if (Object.keys(content).some(key => !contentKeys.includes(key)) ||
        content.sources.some(source => Object.keys(source).some(key => !allowedSourceKeys.includes(key)))) {
      return withheld(date, "public_copy_contract_unavailable");
    }
    const publicCopy = {
      contract_version: copy.contract_version, version: copy.version, content: copySnapshot(content),
      iast_review_status: content.iast === null ? null : copy.iast_review_status,
      iast_approval_ref: content.iast === null ? null : copy.iast_approval_ref,
      reviews: copyReviewKinds(copy).map(kind => pick(copy.reviews.find(review => review.kind === kind &&
        review.review_status === "approved" && review.content_hash === assignment.copy_content_hash),
        ["kind", "review_status", "approval_ref", "content_hash"]))
    };
    return { ...withheld(date, null), status: "published", public_output_allowed: true, runtime_activation: true,
      assignment: { ...pick(assignment, assignmentKeys), reviewed_copy: publicCopy } };
  } catch { return withheld(date, "public_feed_unavailable"); }
}

/** @param {{readSnapshot?: (date: string) => Promise<unknown>, enabled?: boolean, allowedOrigin?: string | null, now?: () => string}} [options] */
export function createWordPublicFeedHandler({ readSnapshot, enabled = false, allowedOrigin = null,
  now = () => new Date().toISOString() } = {}) {
  let inFlight = 0;
  let validOrigin = allowedOrigin === null;
  if (typeof allowedOrigin === "string") {
    try { const url = new URL(allowedOrigin); validOrigin = url.protocol === "https:" && url.origin === allowedOrigin; } catch { /* Fail closed. */ }
  }
  return async request => {
    const headers = { "Content-Type": "application/json; charset=utf-8", "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store", Vary: "Origin" };
    const respond = (body, status) => new Response(request.method === "HEAD" ? null : JSON.stringify(body), { status, headers });
    if (!["GET", "HEAD"].includes(request.method)) {
      headers.Allow = "GET, HEAD";
      return respond({ error: "method_not_allowed" }, 405);
    }
    const origin = request.headers.get("origin");
    if (!validOrigin || origin !== null && origin !== allowedOrigin) return respond({ error: "origin_not_allowed" }, 403);
    if (origin !== null) headers["Access-Control-Allow-Origin"] = allowedOrigin;
    if (new URL(request.url).search !== "") return respond({ error: "query_not_allowed" }, 400);
    let reading = false;
    try {
      const timestamp = now();
      // Bound this isolate's database fan-out; distributed gateway limits remain separate.
      if (enabled === true && inFlight >= 4) {
        headers["Retry-After"] = "15";
        return respond(withheld(canonicalPublicationDate(timestamp), "public_feed_busy"), 429);
      }
      if (enabled === true) { inFlight++; reading = true; }
      let output = await readPublicWord({ readSnapshot, timestamp, enabled });
      const currentDate = canonicalPublicationDate(now());
      // A request straddling IST midnight must not deliver the previous day's word.
      if (!currentDate || currentDate !== output.date_key) output = withheld(currentDate, "canonical_date_rolled_over");
      const unavailable = ["public_feed_not_activated", "public_feed_unavailable", "canonical_date_rolled_over"].includes(output.reason);
      return respond(output, unavailable ? 503 : 200);
    } catch { return respond(withheld(null, "public_feed_unavailable"), 503); }
    finally { if (reading) inFlight--; }
  };
}
