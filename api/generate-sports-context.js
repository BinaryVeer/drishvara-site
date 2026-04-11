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

  try {
    const sportsArticle = await getTodaySportsArticle({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      today
    });

    const liveEvents = getLiveEvents(dayIndex);
    const payload = {
      date: today,
      generated_at: new Date().toISOString(),
      header_live_score: getHeaderLiveScore(liveEvents),
      live_events: liveEvents,
      tournaments: getTournamentCards(dayIndex, sportsArticle),
      major_updates: getMajorSportsUpdates(dayIndex, sportsArticle),
      featured_sports_article: getFeaturedSportsArticle(sportsArticle)
    };

    const path = `generated/sports-context/${today}-sports-context.json`;

    await upsertGitHubFile({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      path,
      message: `Generate sports context v3 for ${today}`,
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

async function getTodaySportsArticle({ token, owner, repo, branch, today }) {
  const draftPath = `generated/drafts/${today}-sports.json`;

  try {
    const text = await getGitHubFileContent({
      token,
      owner,
      repo,
      path: draftPath,
      branch
    });

    const json = JSON.parse(text);
    const packet = json && json.draft_packet ? json.draft_packet : null;

    if (!packet || !packet.title || !packet.slug) {
      return null;
    }

    const slug = sanitizeSlug(packet.slug);

    return {
      title: packet.title,
      subtitle: packet.subtitle || "",
      slug,
      internal_article_link: `articles/sports/${slug}.html`,
      image: "assets/sports/article-placeholder.jpg",
      official_link: "",
      supporting_link: ""
    };
  } catch {
    return null;
  }
}

function getLiveEvents(dayIndex) {
  const variants = [
    [
      {
        sport: "Cricket",
        tournament: "IPL",
        match: "MI vs CSK",
        score: "MI 148/4 (16.2)",
        status: "LIVE",
        priority: 10,
        official_link: "",
        supporting_link: ""
      },
      {
        sport: "Football",
        tournament: "Premier League",
        match: "Arsenal vs Liverpool",
        score: "ARS 1–0 LIV (67')",
        status: "LIVE",
        priority: 8,
        official_link: "",
        supporting_link: ""
      },
      {
        sport: "Tennis",
        tournament: "ATP",
        match: "Quarterfinal Live",
        score: "Set 2 · 4-3",
        status: "LIVE",
        priority: 6,
        official_link: "",
        supporting_link: ""
      }
    ],
    [
      {
        sport: "Cricket",
        tournament: "IPL",
        match: "RCB vs KKR",
        score: "RCB 92/2 (10.1)",
        status: "LIVE",
        priority: 10,
        official_link: "",
        supporting_link: ""
      },
      {
        sport: "Chess",
        tournament: "Candidates",
        match: "Round 6 ongoing",
        score: "Boards active",
        status: "LIVE",
        priority: 7,
        official_link: "",
        supporting_link: ""
      }
    ],
    [
      {
        sport: "Football",
        tournament: "Champions League",
        match: "Quarterfinal Live",
        score: "1–1 (72')",
        status: "LIVE",
        priority: 9,
        official_link: "",
        supporting_link: ""
      },
      {
        sport: "Badminton",
        tournament: "BWF Tour",
        match: "Semifinal Live",
        score: "Game 2 · 14-12",
        status: "LIVE",
        priority: 6,
        official_link: "",
        supporting_link: ""
      }
    ],
    [],
    [
      {
        sport: "Cricket",
        tournament: "IPL",
        match: "SRH vs RR",
        score: "SRH 176/5 (19.0)",
        status: "LIVE",
        priority: 10,
        official_link: "",
        supporting_link: ""
      }
    ],
    [],
    [
      {
        sport: "Tennis",
        tournament: "ATP",
        match: "Final Live",
        score: "Set 3 · 3-2",
        status: "LIVE",
        priority: 8,
        official_link: "",
        supporting_link: ""
      },
      {
        sport: "Basketball",
        tournament: "NBA",
        match: "Playoff Live",
        score: "Q3 · 74-68",
        status: "LIVE",
        priority: 6,
        official_link: "",
        supporting_link: ""
      }
    ]
  ];

  return variants[dayIndex % variants.length];
}

function getHeaderLiveScore(liveEvents) {
  if (!Array.isArray(liveEvents) || liveEvents.length === 0) {
    return {
      show: false,
      sport: "",
      tournament: "",
      match: "",
      score: "",
      status: "",
      official_link: "",
      supporting_link: ""
    };
  }

  const sorted = [...liveEvents].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const top = sorted[0];

  return {
    show: true,
    sport: top.sport || "",
    tournament: top.tournament || "",
    match: top.match || "",
    score: top.score || "",
    status: top.status || "LIVE",
    official_link: top.official_link || "",
    supporting_link: top.supporting_link || ""
  };
}

function getTournamentCards(dayIndex, sportsArticle) {
  const sets = [
    [
      {
        title: "IPL 2026",
        status: "Live",
        key_note: "Top-four race tightening as net run rate begins to matter.",
        standings_snapshot: [
          "MI — 12 pts",
          "CSK — 10 pts",
          "RCB — 10 pts",
          "KKR — 8 pts"
        ],
        image: "assets/sports/ipl-placeholder.jpg",
        official_link: "",
        supporting_link: "",
        internal_article_link: sportsArticle?.internal_article_link || ""
      },
      {
        title: "Premier League",
        status: "Live",
        key_note: "Title race remains highly sensitive to direct head-to-head results.",
        standings_snapshot: [
          "Arsenal — 74 pts",
          "Liverpool — 73 pts",
          "Man City — 71 pts"
        ],
        image: "assets/sports/football-placeholder.jpg",
        official_link: "",
        supporting_link: "",
        internal_article_link: ""
      }
    ],
    [
      {
        title: "ATP Tour",
        status: "Quarterfinal Stage",
        key_note: "Momentum and recovery windows are shaping late-stage match outcomes.",
        standings_snapshot: [
          "QF 1 — Live",
          "QF 2 — Upcoming",
          "QF 3 — Completed"
        ],
        image: "assets/sports/tennis-placeholder.jpg",
        official_link: "",
        supporting_link: "",
        internal_article_link: sportsArticle?.internal_article_link || ""
      },
      {
        title: "Candidates Tournament",
        status: "Round in Progress",
        key_note: "Single-round swings are changing the leaderboard rapidly.",
        standings_snapshot: [
          "Leader — 4.5",
          "Second — 4.0",
          "Third — 3.5"
        ],
        image: "assets/sports/chess-placeholder.jpg",
        official_link: "",
        supporting_link: "",
        internal_article_link: ""
      }
    ]
  ];

  return sets[dayIndex % sets.length];
}

function getMajorSportsUpdates(dayIndex, sportsArticle) {
  const sets = [
    [
      {
        headline: "Data reshapes how athlete readiness is measured",
        summary: "Recovery load, movement tracking, and contextual performance metrics are changing preparation logic.",
        image: "assets/sports/article-placeholder.jpg",
        official_link: "",
        supporting_link: "",
        internal_article_link: sportsArticle?.internal_article_link || ""
      },
      {
        headline: "Title races reward composure more than noise",
        summary: "Late-stage tournament outcomes increasingly reflect steadiness under pressure rather than isolated brilliance.",
        image: "assets/sports/football-placeholder.jpg",
        official_link: "",
        supporting_link: "",
        internal_article_link: ""
      }
    ],
    [
      {
        headline: "Mental resilience remains central in elite sport",
        summary: "Across formats, performance decline is often linked less to technique than to cognitive overload and recovery quality.",
        image: "assets/sports/tennis-placeholder.jpg",
        official_link: "",
        supporting_link: "",
        internal_article_link: sportsArticle?.internal_article_link || ""
      },
      {
        headline: "Tournament structure influences perception of form",
        summary: "League tables and knockout brackets shape narrative differently, even when performance levels are similar.",
        image: "assets/sports/chess-placeholder.jpg",
        official_link: "",
        supporting_link: "",
        internal_article_link: ""
      }
    ]
  ];

  return sets[dayIndex % sets.length];
}

function getFeaturedSportsArticle(sportsArticle) {
  if (!sportsArticle) {
    return {
      show: false,
      title: "",
      summary: "",
      image: "",
      internal_article_link: "",
      official_link: "",
      supporting_link: ""
    };
  }

  return {
    show: true,
    title: sportsArticle.title,
    summary: sportsArticle.subtitle || "Today’s featured sports article from Drishvara.",
    image: sportsArticle.image || "assets/sports/article-placeholder.jpg",
    internal_article_link: sportsArticle.internal_article_link || "",
    official_link: sportsArticle.official_link || "",
    supporting_link: sportsArticle.supporting_link || ""
  };
}

async function getGitHubFileContent({ token, owner, repo, path, branch }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponentPath(path)}?ref=${encodeURIComponent(branch)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GitHub read failed for ${path}: ${response.status} ${errText}`);
  }

  const json = await response.json();
  if (!json.content) {
    throw new Error(`GitHub file content missing for ${path}`);
  }

  return Buffer.from(json.content, "base64").toString("utf8");
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

function sanitizeSlug(slug) {
  return String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function encodeURIComponentPath(path) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}
