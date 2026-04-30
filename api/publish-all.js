import { runPublishAll } from "../services/pipeline/publish-all-core.js";

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "y", "on"].includes(normalized);
}

function getParam(req, key) {
  if (req.method === "POST") return req.body?.[key];
  return req.query?.[key];
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const todayOverride = getParam(req, "date") || null;
    const dryRun = parseBoolean(getParam(req, "dryRun"), false);
    const requireApproved = parseBoolean(getParam(req, "requireApproved"), false);
    const confirm = String(getParam(req, "confirm") || "").trim();

    const strictConfirmation =
      String(process.env.PUBLISH_REQUIRE_CONFIRMATION || "").trim().toLowerCase() === "true";

    const configuredToken = String(process.env.PUBLISH_CONFIRMATION_TOKEN || "").trim();
    const acceptedConfirmValues = new Set(["publish", "publish-approved-drafts"]);

    if (configuredToken) acceptedConfirmValues.add(configuredToken);

    if (!dryRun && strictConfirmation && !acceptedConfirmValues.has(confirm)) {
      return res.status(400).json({
        ok: false,
        error: "Live publish requires confirmation",
        hint: "Use dryRun=true for validation, or pass confirm=publish-approved-drafts when strict confirmation is enabled."
      });
    }

    const result = await runPublishAll({
      githubToken: process.env.GITHUB_TOKEN,
      githubOwner: process.env.GITHUB_OWNER,
      githubRepo: process.env.GITHUB_REPO,
      githubBranch: process.env.GITHUB_BRANCH,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey:
        process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
      todayOverride,
      dryRun,
      requireApproved
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown error"
    });
  }
}
