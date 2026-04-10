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

  const today = new Date().toISOString().slice(0, 10);

  const mapping = [
    {
      draftKey: "spirituality",
      title: "Spiritual Thought",
      description:
        "Interpretations of classical ideas, lived philosophy, contemplative discipline, and the inner life — approached with seriousness rather than sentimentality."
    },
    {
      draftKey: "public_programmes",
      title: "Public Systems",
      description:
        "Governance, policy execution, infrastructure realities, institutional gaps, and the lived friction between design and implementation."
    },
    {
      draftKey: "world_affairs",
      title: "World Affairs",
      description:
        "International confrontation, strategic signalling, power shifts, diplomatic tension, and the deeper logic beneath headline events."
    },
    {
      draftKey: "media_society",
      title: "Media & Society",
      description:
        "Narratives, images, films, and the deeper structures that shape perception and attention."
    }
  ];

  try {
    const insightsPath = "insights.html";
    let insightsHtml = await getGitHubFileContent({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: insightsPath,
      branch: GITHUB_BRANCH
    });

    const articleMap = {};

    for (const item of mapping) {
      const draftPath = `generated/drafts/${today}-${item.draftKey}.json`;
      const draftText = await getGitHubFileContent({
        token: GITHUB_TOKEN,
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: draftPath,
        branch: GITHUB_BRANCH
      });

      const draft = JSON.parse(draftText);
      const slug = sanitizeSlug(draft?.draft_packet?.slug || "");
      if (!slug) {
        continue;
      }

      const folder = getFolderForDraftKey(item.draftKey);
      articleMap[item.title] = {
        link: `articles/${folder}/${slug}.html`,
        title: item.title,
        description: item.description
      };
    }

    insightsHtml = replaceCard(insightsHtml, articleMap["Spiritual Thought"]);
    insightsHtml = replaceCard(insightsHtml, articleMap["Public Systems"]);
    insightsHtml = replaceCard(insightsHtml, articleMap["World Affairs"]);
    insightsHtml = replaceCard(insightsHtml, articleMap["Media & Society"]);

    await upsertGitHubFile({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      path: insightsPath,
      message: `Auto-update insights page for ${today}`,
      rawContent: insightsHtml
    });

    return res.status(200).json({
      ok: true,
      updated: insightsPath,
      date: today,
      cards_updated: Object.keys(articleMap)
    });
  } catch (error) {
    console.error("update-insights failed:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown error"
    });
  }
}

function replaceCard(html, cardData) {
  if (!cardData) return html;

  const escapedTitle = escapeRegex(cardData.title);

  const pattern = new RegExp(
    `<div class="card">\\s*<h2>${escapedTitle}<\\/h2>[\\s\\S]*?<\\/div>\\s*<\\/div>?`,
    "m"
  );

  const replacement = `<div class="card">
          <h2>${cardData.title}</h2>
          <p>
            ${cardData.description}
          </p>
          <p><a href="${cardData.link}">Read first article →</a></p>
          <div class="status">First article live</div>
        </div>`;

  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }

  return html;
}

function getFolderForDraftKey(key) {
  const map = {
    spirituality: "spiritual",
    sports: "sports",
    world_affairs: "world",
    media_society: "media",
    public_programmes: "policy"
  };
  return map[key] || "policy";
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
  rawContent
}) {
  const existing = await getGitHubFileMeta({
    token,
    owner,
    repo,
    path,
    branch
  });

  const content = Buffer.from(rawContent, "utf8").toString("base64");

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
    throw new Error(`GitHub write failed for ${path}: ${response.status} ${errText}`);
  }

  return response.json();
}

async function getGitHubFileMeta({ token, owner, repo, path, branch }) {
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
    throw new Error(`GitHub meta read failed for ${path}: ${response.status} ${errText}`);
  }

  return response.json();
}

function sanitizeSlug(slug) {
  return String(slug)
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

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
