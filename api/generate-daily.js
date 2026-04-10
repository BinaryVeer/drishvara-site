export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const {
    OPENAI_API_KEY,
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH,
    OPENAI_MODEL
  } = process.env;

  if (
    !OPENAI_API_KEY ||
    !GITHUB_TOKEN ||
    !GITHUB_OWNER ||
    !GITHUB_REPO ||
    !GITHUB_BRANCH
  ) {
    return res.status(500).json({
      ok: false,
      error: "Missing required environment variables"
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  const categories = [
    {
      key: "spirituality",
      label: "Spirituality"
    },
    {
      key: "sports",
      label: "Sports"
    },
    {
      key: "world_affairs",
      label: "World Affairs"
    },
    {
      key: "media_society",
      label: "Media & Society"
    },
    {
      key: "public_programmes",
      label: "Public Programmes"
    }
  ];

  try {
    const allOutputs = [];

    for (const category of categories) {
      const result = await generateCategoryBundle({
        apiKey: OPENAI_API_KEY,
        model: OPENAI_MODEL || "gpt-4.1-mini",
        today,
        category
      });

      allOutputs.push(result);
    }

    const candidateAggregate = {
      date: today,
      generated_at: new Date().toISOString(),
      categories: allOutputs.map((item) => ({
        category: item.category,
        display_label: item.display_label,
        candidates: item.candidates
      }))
    };

    const signalRail = buildSignalRail(today, allOutputs);

    const writtenFiles = [];

    writtenFiles.push(
      await upsertGitHubFile({
        token: GITHUB_TOKEN,
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        branch: GITHUB_BRANCH,
        path: `generated/daily/${today}-candidates.json`,
        message: `Generate daily candidates for ${today}`,
        contentObject: candidateAggregate
      })
    );

    writtenFiles.push(
      await upsertGitHubFile({
        token: GITHUB_TOKEN,
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        branch: GITHUB_BRANCH,
        path: `generated/signals/${today}-signal-rail.json`,
        message: `Generate signal rail for ${today}`,
        contentObject: signalRail
      })
    );

    for (const item of allOutputs) {
      writtenFiles.push(
        await upsertGitHubFile({
          token: GITHUB_TOKEN,
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          branch: GITHUB_BRANCH,
          path: `generated/drafts/${today}-${item.category}.json`,
          message: `Generate draft bundle for ${item.category} on ${today}`,
          contentObject: item
        })
      );
    }

    return res.status(200).json({
      ok: true,
      date: today,
      files_written: writtenFiles.map((f) => f.path)
    });
  } catch (error) {
    console.error("generate-daily failed:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown error"
    });
  }
}

async function generateCategoryBundle({ apiKey, model, today, category }) {
  const prompt = `
You are generating a Drishvara editorial planning bundle.

Category:
${category.label}

Date:
${today}

Return ONLY valid JSON. No markdown. No explanation.

Output JSON format:
{
  "category": "${category.key}",
  "display_label": "${category.label}",
  "date": "${today}",
  "candidates": [
    {
      "candidate_id": "string",
      "title": "string",
      "summary": "string",
      "angle_hint": "string",
      "buzz_score": 0,
      "intent_score": 0,
      "relevance_score": 0,
      "fit_score": 0,
      "depth_score": 0,
      "final_score": 0,
      "status": "selected | developing | watching | archived"
    }
  ],
  "selected_topic": {
    "candidate_id": "string",
    "title": "string",
    "summary": "string",
    "why_selected": "string"
  },
  "draft_packet": {
    "title": "string",
    "subtitle": "string",
    "meta_label": "${category.label}",
    "slug": "string",
    "angle": "string",
    "why_now": "string",
    "core_question": "string",
    "outline": [
      "string",
      "string",
      "string"
    ],
    "opening_paragraph": "string",
    "closing_line": "string"
  }
}

Rules:
1. Generate between 8 and 10 candidates.
2. Scores must be realistic and varied.
3. Exactly one candidate must have status "selected".
4. Keep the style serious, reflective, non-clickbait, and aligned with Drishvara.
5. Do not invent fake breaking facts. Topics can be framed as editorial candidates rather than hard claims.
6. Make summaries concise.
7. The draft_packet should be strong enough to become a future article.
8. For media category, reference narrative/perception style thinking where relevant.
9. For public_programmes category, emphasize implementation and delivery.
10. For spirituality category, emphasize contemplative depth.
`;

  const responseJson = await callOpenAI({
    apiKey,
    model,
    instructions:
      "You generate structured editorial planning JSON for a serious publishing platform. Output only strict JSON.",
    input: prompt
  });

  const text = extractResponseText(responseJson);
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Failed to parse OpenAI JSON for ${category.key}. Raw output: ${text?.slice(0, 1000)}`
    );
  }

  validateBundle(parsed, category);

  return parsed;
}

async function callOpenAI({ apiKey, model, instructions, input }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      instructions,
      input,
      max_output_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errText}`);
  }

  return response.json();
}

function extractResponseText(payload) {
  if (!payload || !Array.isArray(payload.output)) {
    throw new Error("OpenAI response missing output array");
  }

  let collected = "";

  for (const item of payload.output) {
    if (!item || item.type !== "message" || !Array.isArray(item.content)) {
      continue;
    }

    for (const contentItem of item.content) {
      if (contentItem?.type === "output_text" && typeof contentItem.text === "string") {
        collected += contentItem.text;
      }
    }
  }

  if (!collected.trim()) {
    throw new Error("No text content found in OpenAI response");
  }

  return collected.trim();
}

function validateBundle(bundle, category) {
  if (!bundle || typeof bundle !== "object") {
    throw new Error(`Bundle for ${category.key} is not an object`);
  }

  if (bundle.category !== category.key) {
    throw new Error(`Bundle category mismatch for ${category.key}`);
  }

  if (!Array.isArray(bundle.candidates) || bundle.candidates.length < 8) {
    throw new Error(`Bundle for ${category.key} has insufficient candidates`);
  }

  const selectedCount = bundle.candidates.filter((c) => c.status === "selected").length;
  if (selectedCount !== 1) {
    throw new Error(`Bundle for ${category.key} must have exactly one selected candidate`);
  }

  if (!bundle.selected_topic || !bundle.selected_topic.title) {
    throw new Error(`Bundle for ${category.key} missing selected_topic`);
  }

  if (!bundle.draft_packet || !bundle.draft_packet.slug) {
    throw new Error(`Bundle for ${category.key} missing draft_packet`);
  }
}

function buildSignalRail(today, outputs) {
  const items = [];

  for (const output of outputs) {
    for (const candidate of output.candidates) {
      if (["selected", "developing", "watching"].includes(candidate.status)) {
        items.push({
          category: output.display_label,
          title: candidate.title,
          summary: candidate.summary,
          status: capitalize(candidate.status),
          url:
            candidate.status === "selected"
              ? `/generated/drafts/${today}-${output.category}.json`
              : ""
        });
      }
    }
  }

  items.sort((a, b) => {
    const rank = { Selected: 3, Developing: 2, Watching: 1 };
    return (rank[b.status] || 0) - (rank[a.status] || 0);
  });

  return {
    date: today,
    generated_at: new Date().toISOString(),
    items: items.slice(0, 15)
  };
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponentPath(
    path
  )}`;

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

  return { path };
}

async function getGitHubFile({ token, owner, repo, path, branch }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponentPath(
    path
  )}?ref=${encodeURIComponent(branch)}`;

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
