export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const {
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH
  } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO || !GITHUB_BRANCH) {
    return res.status(500).json({
      ok: false,
      error: "Missing required GitHub environment variables"
    });
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const dayIndex = now.getUTCDay();

  const payload = {
    date: today,
    generated_at: new Date().toISOString(),
    live_score: getLiveScore(dayIndex),
    sports_desk: getSportsDesk(dayIndex)
  };

  try {
    const path = `generated/sports-context/${today}-sports-context.json`;

    await upsertGitHubFile({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      path,
      message: `Generate sports context for ${today}`,
      contentObject: payload
    });

    return res.status(200).json({
      ok: true,
      date: today,
      written_to: path
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown error"
    });
  }
}

function getLiveScore(dayIndex) {
  const variants = [
    {
      show: true,
      sport: "Cricket",
      tournament: "IPL",
      match: "MI vs CSK",
      score: "MI 148/4 (16.2)",
      status: "LIVE",
      link: ""
    },
    {
      show: false,
      sport: "",
      tournament: "",
      match: "",
      score: "",
      status: "",
      link: ""
    },
    {
      show: true,
      sport: "Football",
      tournament: "Premier League",
      match: "Arsenal vs Liverpool",
      score: "ARS 1–0 LIV (67')",
      status: "LIVE",
      link: ""
    },
    {
      show: false,
      sport: "",
      tournament: "",
      match: "",
      score: "",
      status: "",
      link: ""
    },
    {
      show: true,
      sport: "Cricket",
      tournament: "IPL",
      match: "RCB vs KKR",
      score: "RCB 92/2 (10.1)",
      status: "LIVE",
      link: ""
    },
    {
      show: false,
      sport: "",
      tournament: "",
      match: "",
      score: "",
      status: "",
      link: ""
    },
    {
      show: true,
      sport: "Tennis",
      tournament: "ATP",
      match: "Quarterfinal Live",
      score: "Set 2 · 4-3",
      status: "LIVE",
      link: ""
    }
  ];

  return variants[dayIndex % variants.length];
}

function getSportsDesk(dayIndex) {
  const variants = [
    [
      {
        category: "Cricket",
        title: "IPL table movement and live match watch",
        meta: "Track score movement, next fixtures, and major India-view interest."
      },
      {
        category: "Football",
        title: "League and marquee fixture watch",
        meta: "Key result lines and one-match significance summary."
      },
      {
        category: "Other Sports",
        title: "Chess, tennis, badminton, hockey, Olympics watch",
        meta: "Selected compact highlights across major competitions."
      }
    ],
    [
      {
        category: "Cricket",
        title: "No major live match, but standings remain active",
        meta: "Use desk space for rankings, recent results, and next fixture."
      },
      {
        category: "Football",
        title: "European matchday summary placeholder",
        meta: "Daily football summary with one featured result."
      },
      {
        category: "Other Sports",
        title: "Mixed sports update placeholder",
        meta: "Rotating attention across tennis, badminton, chess, and hockey."
      }
    ]
  ];

  return variants[dayIndex % variants.length];
}

async function upsertGitHubFile({
  token,
  owner,
  repo,
  branch,
  path,
  message,
  contentObject
}) {
  const existing = await getGitHubFile({
    token,
    owner,
    repo,
    path,
    branch
  });

  const content = Buffer.from(
    JSON.stringify(contentObject, null, 2),
    "utf8"
  ).toString("base64");

  const body = {
    message,
    content,
    branch
  };

  if (existing?.sha) {
    body.sha = existing.sha;
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponentPath(path)}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GitHub upsert failed for ${path}: ${response.status} ${errText}`);
  }

  return response.json();
}

async function getGitHubFile({ token, owner, repo, path, branch }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponentPath(path)}?ref=${encodeURIComponent(branch)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GitHub get file failed for ${path}: ${response.status} ${errText}`);
  }

  return response.json();
}

function encodeURIComponentPath(path) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}
