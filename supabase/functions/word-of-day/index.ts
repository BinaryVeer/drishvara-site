import { createWordPublicFeedHandler } from "../../../scripts/lib/ag70e-word-public-feed.mjs";

// Undeployed. Independent read-only activation; never shares the worker's command handler.
const base = Deno.env.get("SUPABASE_URL") ?? "";
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const enabled = Deno.env.get("WORD_PUBLIC_FEED_ENABLED") === "true" && Boolean(base && key);
const allowedOrigin = Deno.env.get("WORD_PUBLIC_FEED_ALLOWED_ORIGIN") ?? null;

async function readSnapshot(date: string) {
  const url = new URL(base);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw Error("public_feed_unavailable");
  }
  const response = await fetch(`${url.origin}/rest/v1/rpc/word_assignment_release_snapshot`, {
    method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_date: date }), signal: AbortSignal.timeout(10000), redirect: "error"
  });
  if (!response.ok) throw Error("public_feed_unavailable");
  return response.json();
}

Deno.serve(createWordPublicFeedHandler({ readSnapshot, enabled, allowedOrigin }));
