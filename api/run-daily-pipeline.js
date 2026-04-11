export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const host = getBaseUrl(req);

  const steps = [
    { name: "generate_daily", path: "/api/generate-daily" },
    { name: "publish_all", path: "/api/publish-all" },
    { name: "update_insights", path: "/api/update-insights" },
    { name: "generate_daily_context", path: "/api/generate-daily-context" },
    { name: "generate_sports_context", path: "/api/generate-sports-context" }
  ];

  const results = [];

  for (const step of steps) {
    try {
      const response = await fetch(`${host}${step.path}`, {
        method: "GET",
        headers: {
          "x-internal-pipeline": "true"
        }
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = { ok: false, error: "Invalid JSON response" };
      }

      results.push({
        step: step.name,
        ok: response.ok && payload && payload.ok !== false,
        status: response.status,
        payload
      });

      if (!response.ok || (payload && payload.ok === false)) {
        return res.status(500).json({
          ok: false,
          failed_step: step.name,
          results
        });
      }
    } catch (error) {
      results.push({
        step: step.name,
        ok: false,
        status: 500,
        payload: {
          ok: false,
          error: error.message || "Unknown error"
        }
      });

      return res.status(500).json({
        ok: false,
        failed_step: step.name,
        results
      });
    }
  }

  return res.status(200).json({
    ok: true,
    message: "Daily pipeline completed successfully",
    results
  });
}

function getBaseUrl(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}
