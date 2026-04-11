const CATEGORY_META = {
  spirituality: {
    label: "Spirituality",
    folder: "spiritual",
    image: "assets/featured/spirituality-default.jpg"
  },
  sports: {
    label: "Sports",
    folder: "sports",
    image: "assets/featured/sports-default.jpg"
  },
  world_affairs: {
    label: "World Affairs",
    folder: "world",
    image: "assets/featured/world-default.jpg"
  },
  media_society: {
    label: "Media & Society",
    folder: "media",
    image: "assets/featured/media-default.jpg"
  },
  public_programmes: {
    label: "Public Programmes",
    folder: "policy",
    image: "assets/featured/policy-default.jpg"
  }
};

const GENERATION_CATEGORIES = [
  "spirituality",
  "sports",
  "world_affairs",
  "media_society",
  "public_programmes"
];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const {
    OPENAI_API_KEY,
    OPENAI_MODEL,
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH
  } = process.env;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      ok: false,
      error: "Missing OPENAI_API_KEY"
    });
  }

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO || !GITHUB_BRANCH) {
    return res.status(500).json({
      ok: false,
      error: "Missing required GitHub environment variables"
    });
  }

  // Safer default while stabilizing. You can override in Vercel.
  const model = OPENAI_MODEL || "gpt-4.1-mini";
  const today = new Date().toISOString().slice(0, 10);

  try {
    const candidateBundle = await generateCandidateBundle({
      apiKey: OPENAI_API_KEY,
      model,
      today
    });

    const signalRail = buildSignalRail(today, candidateBundle);
    const filesWritten = [];

    const candidatesPath = `generated/daily/${today}-candidates.json`;
    await upsertGitHubFile({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      path: candidatesPath,
      message: `Generate candidates for ${today}`,
      contentObject: candidateBundle
    });
    filesWritten.push(candidatesPath);

    const signalsPath = `generated/signals/${today}-signal-rail.json`;
    await upsertGitHubFile({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      path: signalsPath,
      message: `Generate signal rail for ${today}`,
      contentObject: signalRail
    });
    filesWritten.push(signalsPath);

    for (const categoryKey of GENERATION_CATEGORIES) {
      const categoryMeta = CATEGORY_META[categoryKey];
      const selectedCandidate = pickCandidateForCategory(candidateBundle, categoryKey);

      const generated = await generateArticleDraft({
        apiKey: OPENAI_API_KEY,
        model,
        today,
        categoryKey,
        categoryMeta,
        candidate: selectedCandidate
      });

      const draftPacket = buildDraftPacket({
        today,
        categoryKey,
        categoryMeta,
        candidate: selectedCandidate,
        generated
      });

      const draftPath = `generated/drafts/${today}-${categoryKey}.json`;
      await upsertGitHubFile({
        token: GITHUB_TOKEN,
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        branch: GITHUB_BRANCH,
        path: draftPath,
        message: `Generate ${categoryKey} draft for ${today}`,
        contentObject: {
          date: today,
          category: categoryKey,
          draft_packet: draftPacket
        }
      });

      filesWritten.push(draftPath);
    }

    return res.status(200).json({
      ok: true,
      date: today,
      files_written: filesWritten
    });
  } catch (error) {
    console.error("generate-daily failed:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown error"
    });
  }
}

async function generateCandidateBundle({ apiKey, model, today }) {
  const prompt = `
You are preparing Drishvara's daily editorial shortlist for ${today}.

Return valid JSON only.

Create 8 to 12 candidate topics across these categories:
- spirituality
- sports
- world_affairs
- media_society
- public_programmes

Rules:
- Each candidate must be publication-worthy, serious, and reflective.
- Avoid gossip, trivia, celebrity fluff, and hype.
- Sports may include performance, tournament psychology, analytics, recovery, structure, or major event significance.
- Public Programmes should focus on governance, delivery, public systems, digital systems, literacy, health, education, implementation, or civic design.
- Topics should be broad enough to write a 400-550 word article on.
- Include at least one selected candidate per required category.

Return JSON in this shape:
{
  "date": "${today}",
  "candidates": [
    {
      "category": "spirituality",
      "title": "",
      "angle": "",
      "summary": "",
      "selected": true
    }
  ]
}
`;

  const parsed = await callOpenAIForJson({
    apiKey,
    model,
    prompt
  });

  const rawCandidates = Array.isArray(parsed?.candidates) ? parsed.candidates : [];
  const normalized = rawCandidates
    .map(normalizeCandidate)
    .filter(Boolean);

  const ensured = ensureCategoryCoverage(today, normalized);

  return {
    date: today,
    generated_at: new Date().toISOString(),
    candidates: ensured
  };
}

async function generateArticleDraft({
  apiKey,
  model,
  today,
  categoryKey,
  categoryMeta,
  candidate
}) {
  const prompt = `
Write one polished Drishvara article for the category "${categoryMeta.label}".

Date: ${today}
Category key: ${categoryKey}
Selected topic title: ${candidate.title}
Selected angle: ${candidate.angle || ""}
Selected summary: ${candidate.summary}

Requirements:
- Tone: thoughtful, grounded, reflective, readable, non-hyperbolic
- Length: target 400 to 550 words
- Output must be valid JSON only
- Provide:
  1. title
  2. slug
  3. subtitle
  4. summary
  5. image
  6. reference_links
  7. official_link
  8. supporting_link
  9. article_html

Rules:
- article_html must contain clean HTML paragraphs only
- no markdown
- no bullet lists
- no tables
- no fabricated sources
- use concise, strong subtext rather than exaggerated claims
- subtitle should be short and publication-ready
- summary should work as a card description
- slug must be URL-safe
- reference_links should contain up to 2 factual external links if truly relevant, otherwise return empty strings
- official_link should only be used if there is a clear official page
- supporting_link should only be used if there is a useful secondary factual source

Return JSON in this exact shape:
{
  "title": "",
  "slug": "",
  "subtitle": "",
  "summary": "",
  "image": "",
  "reference_links": ["", ""],
  "official_link": "",
  "supporting_link": "",
  "article_html": "<p>...</p><p>...</p>"
}
`;

  return callOpenAIForJson({
    apiKey,
    model,
    prompt
  });
}

async function callOpenAIForJson({ apiKey, model, prompt }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: prompt,
      temperature: 0.4,
      text: {
        format: {
          type: "json_object"
        }
      }
    })
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status} ${rawText}`);
  }

  let payload;
  try {
    payload = JSON.parse(rawText);
  } catch {
    throw new Error(`OpenAI returned non-JSON API response: ${rawText}`);
  }

  const outputText = extractResponseText(payload);
  if (!outputText) {
    throw new Error(`OpenAI response text not found in payload: ${rawText}`);
  }

  const parsed = tryParseJson(outputText);
  if (parsed) return parsed;

  const repaired = tryRepairCommonJsonIssue(outputText);
  if (repaired) return repaired;

  const extracted = extractJsonBlock(outputText);
  const reparsed = extracted ? tryParseJson(extracted) : null;
  if (reparsed) return reparsed;

  throw new Error(`Model output was not valid JSON: ${outputText}`);
}

function extractResponseText(payload) {
  if (!payload || !Array.isArray(payload.output)) return "";

  for (const item of payload.output) {
    if (item?.type !== "message" || !Array.isArray(item.content)) continue;

    for (const contentItem of item.content) {
      if (contentItem?.type === "output_text" && typeof contentItem.text === "string") {
        return contentItem.text.trim();
      }
    }
  }

  return "";
}

function tryRepairCommonJsonIssue(text) {
  if (!text) return null;

  let repaired = String(text);

  // Fix common accidental pattern: true" or false"
  repaired = repaired.replace(/:\s*true\\?"/g, ': true');
  repaired = repaired.replace(/:\s*false\\?"/g, ': false');

  // Remove stray trailing commas before } or ]
  repaired = repaired.replace(/,\s*([}\]])/g, "$1");

  return tryParseJson(repaired);
}

function buildDraftPacket({ today, categoryKey, categoryMeta, candidate, generated }) {
  return {
    date: today,
    meta_label: categoryMeta.label,
    title: safeText(generated?.title, candidate.title || `${categoryMeta.label} Insight`),
    slug: sanitizeSlug(
      generated?.slug ||
      generated?.title ||
      candidate.title ||
      `${categoryKey}-insight-${today}`
    ),
    subtitle: safeText(
      generated?.subtitle,
      candidate.summary || "A daily editorial selection from Drishvara."
    ),
    summary: safeText(
      generated?.summary,
      candidate.summary || "A daily editorial selection from Drishvara."
    ),
    image: safeText(generated?.image, getDefaultImageForCategory(categoryKey)),
    reference_links: normalizeReferenceLinks(generated?.reference_links),
    official_link: safeText(generated?.official_link),
    supporting_link: safeText(generated?.supporting_link),
    word_count_target: "400-550",
    article_html: normalizeArticleHtml(generated?.article_html, candidate, categoryMeta)
  };
}

function buildSignalRail(today, candidateBundle) {
  const items = GENERATION_CATEGORIES.map((categoryKey) => {
    const candidate = pickCandidateForCategory(candidateBundle, categoryKey);
    return {
      category: CATEGORY_META[categoryKey].label,
      title: candidate.title,
      summary: candidate.summary,
      status: "Selected"
    };
  });

  return {
    date: today,
    generated_at: new Date().toISOString(),
    items
  };
}

function normalizeCandidate(item) {
  const category = safeText(item?.category).toLowerCase();
  if (!CATEGORY_META[category]) return null;

  const title = safeText(item?.title);
  const angle = safeText(item?.angle);
  const summary = safeText(item?.summary);

  if (!title || !summary) return null;

  return {
    category,
    title,
    angle,
    summary,
    selected: Boolean(item?.selected)
  };
}

function ensureCategoryCoverage(today, candidates) {
  const output = [...candidates];

  for (const categoryKey of GENERATION_CATEGORIES) {
    const exists = output.some((x) => x.category === categoryKey);
    if (!exists) {
      output.push(getFallbackCandidate(today, categoryKey));
    }
  }

  for (const categoryKey of GENERATION_CATEGORIES) {
    const categoryItems = output.filter((x) => x.category === categoryKey);
    const alreadySelected = categoryItems.find((x) => x.selected);

    if (!alreadySelected && categoryItems.length) {
      categoryItems[0].selected = true;
    }
  }

  return output.slice(0, 12);
}

function getFallbackCandidate(today, categoryKey) {
  const fallbackMap = {
    spirituality: {
      title: "Contemplative Silence in a Distracted Age",
      angle: "inner clarity through deliberate quiet",
      summary: "A reflective reading of silence as a discipline rather than an absence."
    },
    sports: {
      title: "How Analytics Reshape Athletic Performance",
      angle: "measurement, recovery, and decision quality in modern sport",
      summary: "A grounded sports essay on performance intelligence and competitive preparation."
    },
    world_affairs: {
      title: "Reading Power Competition Beyond Headlines",
      angle: "signal, posture, and restraint in global politics",
      summary: "A slower geopolitical reading of escalation, leverage, and strategic signalling."
    },
    media_society: {
      title: "How Algorithms Shape Public Attention",
      angle: "content visibility, bias, and mediated perception",
      summary: "A reading of how content systems quietly structure what societies notice."
    },
    public_programmes: {
      title: "Why Delivery Architecture Matters in Public Systems",
      angle: "implementation design over announcement language",
      summary: "A public systems article on how execution reveals state capacity more than launch rhetoric."
    }
  };

  return {
    category: categoryKey,
    title: fallbackMap[categoryKey].title,
    angle: fallbackMap[categoryKey].angle,
    summary: fallbackMap[categoryKey].summary,
    selected: true,
    fallback: true,
    date_hint: today
  };
}

function pickCandidateForCategory(candidateBundle, categoryKey) {
  const candidates = Array.isArray(candidateBundle?.candidates)
    ? candidateBundle.candidates.filter((x) => x.category === categoryKey)
    : [];

  return (
    candidates.find((x) => x.selected) ||
    candidates[0] ||
    getFallbackCandidate(candidateBundle?.date || "", categoryKey)
  );
}

function normalizeReferenceLinks(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .slice(0, 2);
}

function normalizeArticleHtml(articleHtml, candidate, categoryMeta) {
  const html = safeText(articleHtml);
  if (html && html.includes("<p>")) {
    return html;
  }

  const fallbackParagraphs = [
    `<p>${escapeHtml(candidate.title)} is a useful entry point into the broader concerns that shape ${escapeHtml(categoryMeta.label.toLowerCase())} in contemporary life.</p>`,
    `<p>${escapeHtml(candidate.summary || "The issue invites slower reflection, careful reading, and attention to what lies beneath the first visible layer.")}</p>`,
    `<p>Drishvara's editorial approach favors signal over noise, depth over immediacy, and interpretation over spectacle. That makes this topic suitable not merely as information, but as a lens through which larger patterns can be seen.</p>`,
    `<p>In that spirit, the real value lies not only in the topic itself, but in the habits of reading it encourages: patience, context, proportion, and the refusal to mistake movement for meaning.</p>`
  ];

  return fallbackParagraphs.join("");
}

function getDefaultImageForCategory(categoryKey) {
  const map = {
    spirituality: "assets/featured/spirituality-default.jpg",
    sports: "assets/featured/sports-default.jpg",
    world_affairs: "assets/featured/world-default.jpg",
    media_society: "assets/featured/media-default.jpg",
    public_programmes: "assets/featured/policy-default.jpg"
  };

  return map[categoryKey] || "assets/featured/default.jpg";
}

function safeText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function sanitizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJsonBlock(text) {
  const trimmed = String(text || "").trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  return trimmed.slice(firstBrace, lastBrace + 1);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
