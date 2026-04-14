import { runGenerateDaily } from "../services/pipeline/generate-daily-core.js";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const todayOverride =
      req.method === "POST" ? req.body?.date || null : req.query?.date || null;

    const result = await runGenerateDaily({
      openaiApiKey: process.env.OPENAI_API_KEY,
      openaiModel: process.env.OPENAI_MODEL,
      openaiImageModel: process.env.OPENAI_IMAGE_MODEL,
      githubToken: process.env.GITHUB_TOKEN,
      githubOwner: process.env.GITHUB_OWNER,
      githubRepo: process.env.GITHUB_REPO,
      githubBranch: process.env.GITHUB_BRANCH,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey:
        process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
      todayOverride
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown error"
    });
  }
}