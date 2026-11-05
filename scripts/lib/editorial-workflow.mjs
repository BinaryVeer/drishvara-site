import { snapshotHash } from "./ag70d-word-selection-engine.mjs";

export const EDITORIAL_DESKS = { world_affairs: "World Affairs", media_society: "Media & Society", public_programmes: "Public Programmes", sports: "Sports", spirituality: "Spirituality" };
const scopes = { article: ["editorial", "rights", "factual", "safety", "media", "publisher_acceptance"],
  word: ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"] };
const uuid = v => typeof v === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const hash = v => typeof v === "string" && /^sha256:[a-f0-9]{64}$/.test(v);
const internal = value => ({ ...value, public_output_allowed: false, runtime_activation: false });
export function validWorkflowQuery(q) {
  return q && !Array.isArray(q) && Object.keys(q).sort().join(",") === "after_id,desk,kind,view" &&
    ["review", "acceptance", "publishing", "delivery", "live", "all"].includes(q.view) && ["word", "article", "all"].includes(q.kind) &&
    (q.desk === "all" || Object.hasOwn(EDITORIAL_DESKS, q.desk)) && !(q.kind === "word" && q.desk !== "all") &&
    (q.after_id === null || uuid(q.after_id));
}
export function editorialStage(item) {
  const state = item?.review_state, expected = scopes[item?.kind];
  if (!expected || !Array.isArray(state?.required_scopes) || !Array.isArray(state.approved_scopes) ||
      JSON.stringify([...state.required_scopes].sort()) !== JSON.stringify([...expected].sort()) ||
      state.approved_scopes.some(s => !expected.includes(s)) || new Set(state.approved_scopes).size !== state.approved_scopes.length ||
      typeof state.reviews_complete !== "boolean" || !Number.isInteger(state.pending_revision_tasks) || state.pending_revision_tasks < 0) return "blocked";
  if (state.pending_revision_tasks > 0) return "corrections";
  if (item.publisher_decision === "reject") return "rejected";
  if (item.publisher_decision === "revise") return "corrections";
  if (expected.some(s => s !== "publisher_acceptance" && !state.approved_scopes.includes(s))) return "review";
  if (!state.approved_scopes.includes("publisher_acceptance") || !state.reviews_complete) return "acceptance";
  const d = item.kind === "article" ? item.article_delivery : item.word_delivery;
  if (d && d.version_id === item.version_id && d.content_hash === item.content_hash) {
    if (item.kind === "article" && d.result?.status === "article_committed") return "delivery";
    if (item.kind === "word" && d.result?.status === "eligible_for_daily_selection" && d.result.reference === "editorial-word:" + item.id + "@" + item.version_id) return "daily_queue";
  }
  return "publishing";
}
async function publicText(fetcher, path, limit) {
  const r = await fetcher("https://www.drishvara.com/" + path, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(3000),
    headers: { Accept: path.endsWith(".json") ? "application/json" : "text/html" } });
  if (!r.ok || Number(r.headers.get("content-length")) > limit ||
      !(path.endsWith(".json") ? /application\/json/i : /text\/html/i).test(r.headers.get("content-type") || "")) throw Error();
  const reader = r.body.getReader(), chunks = []; let bytes = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.length; if (bytes > limit) throw Error(); chunks.push(value); }
  } finally { await reader.cancel().catch(() => {}); }
  return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
}
export async function articlePublicationProof(item, fetcher = fetch) {
  const d = item.article_delivery;
  if (item.kind !== "article" || !uuid(item.id) || !uuid(d?.version_id) || !hash(d.content_hash) || d.result?.status !== "article_committed" ||
      !/^[a-f0-9]{40}$/.test(d.result.reference || "")) return null;
  const folder = { world_affairs: "world", media_society: "media", public_programmes: "policy", sports: "sports", spirituality: "spiritual" }[d.desk];
  const path = "articles/" + folder + "/editorial-" + item.id + ".html";
  if (!folder || d.result.path !== path) return null;
  try {
    const receipt = JSON.parse(await publicText(fetcher, "data/editorial-release-receipts/" + item.id + ".json", 16000));
    const binding = { candidate_id: item.id, version_id: d.version_id, content_hash: d.content_hash };
    if (receipt.candidate_id !== item.id || receipt.version_id !== d.version_id || receipt.content_hash !== d.content_hash ||
        receipt.article_path !== path || receipt.binding_hash !== snapshotHash(binding) || !hash(receipt.article_hash)) return null;
    if (snapshotHash(await publicText(fetcher, path, 1000000)) !== receipt.article_hash) return null;
    return { kind: "article", version_id: d.version_id, content_hash: d.content_hash, title: d.title, desk: d.desk,
      status: "live_verified", public_url: "https://www.drishvara.com/article.html?path=" + encodeURIComponent(path) };
  } catch { return null; }
}
function wordPublication(item) {
  const p = item.word_publication;
  if (item.kind !== "word" || !uuid(p?.version_id) || !hash(p.content_hash) || p.timezone !== "Asia/Kolkata" ||
      typeof p.publication_event_id !== "string" || !p.publication_event_id || !/^\d{4}-\d{2}-\d{2}$/.test(p.date_key || "") ||
      Number.isNaN(Date.parse(p.date_key)) || new Date(p.date_key).toISOString().slice(0, 10) !== p.date_key) return null;
  const keys = ["sanskrit", "iast", "hindi", "english", "meaning_en", "meaning_hi"];
  if (!p.content || keys.some(k => !(typeof p.content[k] === "string" && p.content[k].length <= 6000 || k === "iast" && p.content[k] === null))) return null;
  return { kind: "word", version_id: p.version_id, content_hash: p.content_hash, date_key: p.date_key, timezone: p.timezone, title: p.title,
    content: Object.fromEntries(keys.map(k => [k, p.content[k]])), status: "published_history" };
}
export async function editorialWorkflowQueue({ query, rpc, fetcher = fetch }) {
  if (!validWorkflowQuery(query)) return internal({ ok: false, code: "invalid_workflow_query" });
  const data = await rpc("editorial_workflow_queue", { p_view: query.view, p_kind: query.kind, p_desk: query.desk, p_after: query.after_id });
  if (data?.ok !== true || data.public_output_allowed !== false || data.runtime_activation !== false || !Array.isArray(data.items) ||
      data.items.length > 10 || !(data.next_cursor === null || uuid(data.next_cursor))) throw Error("workflow_state_unavailable");
  const items = await Promise.all(data.items.map(async item => {
    if (!uuid(item.id) || !uuid(item.version_id) || !hash(item.content_hash) || !scopes[item.kind]) throw Error("workflow_state_unavailable");
    const stage = editorialStage(item);
    if (stage === "blocked" || stage !== item.stage) throw Error("workflow_state_unavailable");
    const publication = item.kind === "article" ? await articlePublicationProof(item, fetcher) : wordPublication(item);
    const current = publication?.version_id === item.version_id && publication?.content_hash === item.content_hash;
    return { id: item.id, kind: item.kind, external_id: item.external_id, title: item.title, version_id: item.version_id, content_hash: item.content_hash,
      desk: item.desk, review_state: item.review_state, pending_scopes: Array.isArray(item.pending_scopes) ? item.pending_scopes : [],
      workflow: { stage: current && ["publishing", "delivery", "daily_queue"].includes(stage) ? "live" : stage, publication,
        delivery_pending: item.kind === "article" && !!item.article_delivery && !publication } };
  }));
  return internal({ ok: true, items: items.filter(i => query.view === "all" || query.view === "live" ? query.view === "all" || !!i.workflow.publication :
    query.view === "review" ? ["review", "corrections"].includes(i.workflow.stage) : query.view === "delivery" ? ["delivery", "daily_queue"].includes(i.workflow.stage) : i.workflow.stage === query.view), next_cursor: data.next_cursor });
}
