import express from "express";
import { runPublishAll } from "./publish-all-core.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "drishvara-pipeline" });
});

app.post("/jobs/publish-all", async (req, res) => {
  try {
    const result = await runPublishAll({
      githubToken: process.env.GITHUB_TOKEN,
      githubOwner: process.env.GITHUB_OWNER,
      githubRepo: process.env.GITHUB_REPO,
      githubBranch: process.env.GITHUB_BRANCH,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
      todayOverride: req.body?.date || null
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || "Unknown error"
    });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Pipeline server listening on ${port}`);
});