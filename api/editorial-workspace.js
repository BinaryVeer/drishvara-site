import { readFile } from "node:fs/promises";
import { executeEditorialCommand } from "../scripts/lib/editorial-workspace-service.mjs";

const assets = {
  "login.html": [new URL("../internal-scaffolds/editorial-workspace/login.html", import.meta.url), "text/html; charset=utf-8"],
  "app.html": [new URL("../internal-scaffolds/editorial-workspace/app.html", import.meta.url), "text/html; charset=utf-8"],
  "workspace.css": [new URL("../internal-scaffolds/editorial-workspace/workspace.css", import.meta.url), "text/css; charset=utf-8"],
  "workspace.js": [new URL("../internal-scaffolds/editorial-workspace/workspace.js", import.meta.url), "text/javascript; charset=utf-8"],
  "editorial-hero-ai.webp": [new URL("../internal-scaffolds/editorial-workspace/editorial-hero-ai.webp", import.meta.url), "image/webp"]
};
const publicAssets = new Set(["workspace.css", "workspace.js", "editorial-hero-ai.webp"]);
const safeCodes = new Set(["editorial_access_denied", "editorial_capability_required", "editorial_assignment_required", "editorial_intake_denied",
  "self_review_denied", "review_scope_denied", "release_scope_denied", "editorial_reviews_pending", "stale_editorial_version", "idempotency_conflict",
  "workspace_administrator_required", "active_confirmed_account_required", "verified_qualification_reference_required",
  "explicit_admin_self_review_required", "unexpected_admin_exception", "member_capability_required", "invalid_access_duration"]);

export function createEditorialWorkspaceHandler({ env = process.env, fetcher = fetch, loadAsset = name => readFile(assets[name][0]) } = {}) {
  return async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store, private");
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Content-Security-Policy", "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'");
    const json = (status, data) => res.status(status).json({ ...data, public_output_allowed: false, runtime_activation: false });
    if (env.EDITORIAL_WORKSPACE_ENABLED !== "true") return json(503, { ok: false, code: "editorial_workspace_disabled" });
    let origin, base;
    try {
      origin = new URL(env.EDITORIAL_WORKSPACE_ORIGIN);
      base = new URL(env.SUPABASE_URL);
      if (origin.origin !== env.EDITORIAL_WORKSPACE_ORIGIN || origin.username || origin.password ||
          !(origin.protocol === "https:" || origin.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)) ||
          base.protocol !== "https:" || base.username || base.password || !env.SUPABASE_ANON_KEY) throw new Error();
    } catch { return json(503, { ok: false, code: "editorial_configuration_unavailable" }); }
    const cookieName = origin.protocol === "https:" ? "__Host-drishvara_editorial" : "drishvara_editorial_local";
    const cookie = (token, age) => `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${origin.protocol === "https:" ? "; Secure" : ""}`;
    const serve = async name => { res.setHeader("Content-Type", assets[name][1]); return res.status(200).send(await loadAsset(name)); };
    const remote = async (path, options = {}, token = null) => {
      const response = await fetcher(new URL(path, base), {
        ...options, redirect: "error", signal: AbortSignal.timeout(10000), headers: {
          apikey: env.SUPABASE_ANON_KEY, "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {})
        }
      });
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(safeCodes.has(data?.message) ? data.message : "editorial_request_denied");
        throw error;
      }
      return data;
    };
    try {
      if (!["GET", "POST"].includes(req.method)) return json(405, { ok: false, code: "method_not_allowed" });
      const url = new URL(req.url, origin);
      if ([...url.searchParams.keys()].some(k => k !== "action" && k !== "asset") ||
          url.searchParams.getAll("action").length > 1 || url.searchParams.getAll("asset").length > 1) return json(400, { ok: false, code: "invalid_route" });
      const action = url.searchParams.get("action") ?? "page";
      const asset = url.searchParams.get("asset");
      if (req.method === "POST" && (req.headers.origin !== origin.origin || !/^application\/json(?:;|$)/i.test(req.headers["content-type"] ?? "")))
        return json(403, { ok: false, code: "same_origin_json_required" });
      let body;
      if (req.method === "POST") {
        if (Number(req.headers["content-length"] ?? 0) > 240000) return json(413, { ok: false, code: "request_too_large" });
        if (req.body === undefined) {
          const chunks = []; let bytes = 0;
          for await (const chunk of req) {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            bytes += buffer.length;
            if (bytes > 240000) return json(413, { ok: false, code: "request_too_large" });
            chunks.push(buffer);
          }
          body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
        } else body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        if (Buffer.byteLength(JSON.stringify(body)) > 240000) return json(413, { ok: false, code: "request_too_large" });
      }
      if (req.method === "GET" && asset) {
        if (!publicAssets.has(asset)) return json(404, { ok: false, code: "asset_not_found" });
        return await serve(asset);
      }
      if (action === "login" && req.method === "POST") {
        if (!body || Object.keys(body).sort().join(",") !== "email,password" || typeof body.email !== "string" ||
            body.email.length > 254 || typeof body.password !== "string" || body.password.length < 1 || body.password.length > 1024)
          return json(400, { ok: false, code: "invalid_login" });
        const session = await remote("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify(body) });
        const token = session.access_token;
        if (typeof token !== "string" || token.length > 3800 || !/^[a-zA-Z0-9_.-]+$/.test(token)) throw new Error("invalid_session");
        await remote("/auth/v1/user", {}, token);
        const access = await remote("/rest/v1/rpc/editorial_review_command", { method: "POST", body: JSON.stringify({ p_command: { action: "session" } }) }, token);
        if (access?.ok !== true || access.public_output_allowed !== false || access.runtime_activation !== false) throw new Error("editorial_access_denied");
        res.setHeader("Set-Cookie", cookie(token, Math.min(2700, Math.max(0, Number(session.expires_in) || 0))));
        return json(200, { ok: true });
      }
      const matches = String(req.headers.cookie ?? "").split(";").map(s => s.trim()).filter(s => s.startsWith(cookieName + "="));
      const token = matches.length === 1 ? matches[0].slice(cookieName.length + 1) : null;
      if (req.method === "POST" && action === "logout") {
        res.setHeader("Set-Cookie", cookie("", 0));
        if (token && token.length <= 3800 && /^[a-zA-Z0-9_.-]+$/.test(token)) {
          try { await remote("/auth/v1/logout?scope=local", { method: "POST" }, token); } catch { /* Local sign-out must work after expiry or revocation. */ }
        }
        return json(200, { ok: true });
      }
      if (!token || token.length > 3800 || !/^[a-zA-Z0-9_.-]+$/.test(token)) {
        if (req.method === "GET" && action === "page") return await serve("login.html");
        return json(401, { ok: false, code: "reviewer_session_required" });
      }
      await remote("/auth/v1/user", {}, token);
      const rpc = (name, args) => remote("/rest/v1/rpc/" + name, { method: "POST", body: JSON.stringify(args) }, token);
      const session = await executeEditorialCommand({ action: "session" }, rpc);
      if (!session.ok) return json(403, { ok: false, code: "editorial_access_denied" });
      if (req.method === "GET" && action === "page") return await serve("app.html");
      if (req.method === "GET" && action === "session") return json(200, session);
      if (req.method === "POST" && action === "command" && !asset) {
        const result = await executeEditorialCommand(body, rpc);
        return json(result.ok ? 200 : 400, result);
      }
      return json(404, { ok: false, code: "route_not_found" });
    } catch (error) {
      if (req.method === "GET" && new URL(req.url, origin).searchParams.size === 0) {
        res.setHeader("Set-Cookie", cookie("", 0));
        return await serve("login.html");
      }
      const code = safeCodes.has(error?.message) ? error.message : "editorial_request_denied";
      return json(403, { ok: false, code });
    }
  };
}
export default createEditorialWorkspaceHandler();
