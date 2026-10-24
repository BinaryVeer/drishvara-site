import { timingSafeEqual } from "node:crypto";
import { runWordServerWorkflow, readWordServerPublication } from "../../../scripts/lib/ag70e-word-server-workflow.mjs";

// Dormant until separately approved deployment, DB controls and server configuration.
// No CORS write path, browser approvals, request-supplied dates or content records.
const enabled = Deno.env.get("WORD_WORKFLOW_ENABLED") === "true";
const base = Deno.env.get("SUPABASE_URL") ?? "";
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const methods = new Set(["word_assignment_read_workflow", "word_assignment_read_history", "word_assignment_read_command",
  "word_assignment_commit", "word_assignment_check_authorization", "word_assignment_release_snapshot"]);
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
async function rpc(name: string, parameters: unknown) {
  if (!methods.has(name)) return { error: { message: "method_not_allowed" } };
  const url = new URL(base);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw Error("invalid_server_endpoint");
  const response = await fetch(`${url.origin}/rest/v1/rpc/${name}`, { method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(parameters), signal: AbortSignal.timeout(10000), redirect: "error" });
  return response.ok ? { data: await response.json() } : { error: { message: "word_server_rpc_unavailable" } };
}
Deno.serve(async (request: Request) => {
  if (!enabled || !base || !key) return json({ status: "withheld", reason: "word_server_not_activated" }, 503);
  const supplied = new TextEncoder().encode(request.headers.get("authorization") ?? "");
  const expected = new TextEncoder().encode(`Bearer ${key}`);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return json({ error: "forbidden" }, 403);
  const timestamp = new Date().toISOString();
  try {
    // The authenticated caller may export the read-only envelope, never raw registry/history.
    if (request.method === "GET") return json(await readWordServerPublication({ rpc, timestamp }));
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const reader = request.body?.getReader();
    let size = 0; const chunks: Uint8Array[] = [];
    if (!reader) return json({ error: "invalid_command" }, 422);
    while (true) {
      const part = await reader.read(); if (part.done) break;
      size += part.value.length;
      if (size > 1024) { await reader.cancel(); return json({ error: "request_too_large" }, 413); }
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(k => !["operation", "scheduled"].includes(k)) ||
      !["reserve", "authorize", "record_publication"].includes(body.operation) || (body.scheduled !== undefined && typeof body.scheduled !== "boolean")) return json({ error: "invalid_command" }, 422);
    const result = await runWordServerWorkflow({ rpc, timestamp, operation: body.operation, scheduled: body.scheduled === true, enabled });
    // Assignment snapshots contain internal review details, not a public response contract.
    return json({ status: result.status, reason: result.reason ?? null, date_key: result.date_key ?? null,
      public_output_allowed: false, runtime_activation: false, alerts: result.alerts ?? [] });
  } catch { return json({ status: "withheld", reason: "word_server_operation_unavailable" }, 503); }
});
