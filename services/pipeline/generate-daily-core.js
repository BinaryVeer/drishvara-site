import { createClient } from "@supabase/supabase-js";
import { buildEditorialPlan, buildPlannerPromptBlock } from "./editorial-planner.js";

const CATEGORY_META = {
  spirituality: {
    label: "Spirituality",
    folder: "spiritual",
    fallback_image: "assets/featured/fallback/spirituality-default.jpg"
  },
  sports: {
    label: "Sports",
    folder: "sports",
    fallback_image: "assets/featured/fallback/sports-default.jpg"
  },
  world_affairs: {
    label: "World Affairs",
    folder: "world",
    fallback_image: "assets/featured/fallback/world-default.jpg"
  },
  media_society: {
    label: "Media & Society",
    folder: "media",
    fallback_image: "assets/featured/fallback/media-default.jpg"
  },
  public_programmes: {
    label: "Public Programmes",
    folder: "policy",
    fallback_image: "assets/featured/fallback/policy-default.jpg"
  }
};

const GENERATION_CATEGORIES = [
  "spirituality",
  "sports",
  "world_affairs",
  "media_society",
  "public_programmes"
];

const COMMON_STOPWORDS = new Set([
  "the", "and", "with", "from", "into", "that", "this", "their", "through",
  "about", "modern", "public", "role", "impact", "lessons", "digital", "new",
  "today", "guide", "story", "stories", "article", "practice", "values"
]);

export async function runGenerateDaily({
  openaiApiKey,
  openaiModel,
  openaiImageModel,
  githubToken,
  githubOwner,
  githubRepo,
  githubBranch,
  supabaseUrl,
  supabaseKey,
  todayOverride
}) {
  if (!openaiApiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  if (!githubToken || !githubOwner || !githubRepo || !githubBranch) {
    throw new Error("Missing required GitHub environment variables");
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing required Supabase environment variables");
  }

  const model = openaiModel || "gpt-4.1-mini";
  const imageModel = openaiImageModel || "gpt-image-1";
  const today = todayOverride || new Date().toISOString().slice(0, 10);

  const supabase = createClient(supabaseUrl, supabaseKey);
  let publicationRunId = null;

  const editorialPlan = buildEditorialPlan({
    date: today,
    horizonMonths: 12
  });

  const { data: runRow, error: runError } = await supabase
    .from("publication_runs")
    .insert({
      run_date: today,
      run_type: "generate_daily",
      status: "started",
      inputs_json: {
        source: "container_core",
        edition_type: editorialPlan.edition_type,
        edition_name: editorialPlan.edition_name
      }
    })
    .select("id")
    .single();

  if (runError) {
    throw new Error(`Failed to create publication run: ${runError.message}`);
  }

  publicationRunId = runRow.id;

  try {
    const filesWritten = [];

    const planPath = `generated/plans/${today}-editorial-plan.json`;
    await upsertGitHubJsonFile({
      token: githubToken,
      owner: githubOwner,
      repo: githubRepo,
      branch: githubBranch,
      path: planPath,
      message: `Generate editorial plan for ${today}`,
      contentObject: editorialPlan
    });
    filesWritten.push(planPath);

    const candidateBundle = await generateCandidateBundle({
      apiKey: openaiApiKey,
      model,
      today,
      editorialPlan
    });

    const signalRail = buildSignalRail(today, candidateBundle, editorialPlan);

    const candidatesPath = `generated/daily/${today}-candidates.json`;
    await upsertGitHubJsonFile({
      token: githubToken,
      owner: githubOwner,
      repo: githubRepo,
      branch: githubBranch,
      path: candidatesPath,
      message: `Generate candidates for ${today}`,
      contentObject: candidateBundle
    });
    filesWritten.push(candidatesPath);

    const signalsPath = `generated/signals/${today}-signal-rail.json`;
    await upsertGitHubJsonFile({
      token: githubToken,
      owner: githubOwner,
      repo: githubRepo,
      branch: githubBranch,
      path: signalsPath,
      message: `Generate signal rail for ${today}`,
      contentObject: signalRail
    });
    filesWritten.push(signalsPath);

    for (const categoryKey of GENERATION_CATEGORIES) {
      const categoryMeta = CATEGORY_META[categoryKey];
      const selectedCandidate = pickCandidateForCategory(candidateBundle, categoryKey);

      const generated = await generateArticleDraft({
        apiKey: openaiApiKey,
        model,
        today,
        categoryKey,
        categoryMeta,
        candidate: selectedCandidate,
        editorialPlan
      });

      let draftPacket = await buildDraftPacket({
        token: githubToken,
        owner: githubOwner,
        repo: githubRepo,
        branch: githubBranch,
        today,
        categoryKey,
        categoryMeta,
        candidate: selectedCandidate,
        generated,
        editorialPlan
      });

      if (
        draftPacket.image_mode === "generated_thematic_pending" &&
        draftPacket.image_prompt
      ) {
        draftPacket = await finalizePendingAiImage({
          apiKey: openaiApiKey,
          imageModel,
          token: githubToken,
          owner: githubOwner,
          repo: githubRepo,
          branch: githubBranch,
          today,
          categoryKey,
          draftPacket
        });
      }

      const draftPath = `generated/drafts/${today}-${categoryKey}.json`;

      await upsertGitHubJsonFile({
        token: githubToken,
        owner: githubOwner,
        repo: githubRepo,
        branch: githubBranch,
        path: draftPath,
        message: `Generate ${categoryKey} draft for ${today}`,
        contentObject: {
          date: today,
          category: categoryKey,
          editorial_plan: editorialPlan.stream_plans[categoryKey] || null,
          draft_packet: draftPacket
        }
      });

      filesWritten.push(draftPath);

      const draftTitle =
        draftPacket?.title ||
        selectedCandidate?.title ||
        `${CATEGORY_META[categoryKey]?.label || categoryKey} - ${today}`;

      const draftSlug =
        draftPacket?.slug ||
        toSlug(draftTitle);

      const draftSummary =
        draftPacket?.summary ||
        draftPacket?.excerpt ||
        draftPacket?.dek ||
        selectedCandidate?.summary ||
        null;

      const { data: existingArticle } = await supabase
        .from("articles")
        .select("id")
        .eq("article_date", today)
        .eq("category_key", categoryKey)
        .maybeSingle();

      const articlePayload = {
        article_date: today,
        category_key: categoryKey,
        stream_key: categoryKey,
        latest_publication_run_id: publicationRunId,
        title: draftTitle,
        slug: draftSlug,
        subtitle: draftPacket?.subtitle || null,
        summary: draftSummary,
        status: "draft",
        access_tier: "free",
        source_policy_version: "v1",
        public_draft_json_path: draftPath,
        raw_draft_packet: draftPacket,
        metadata: {
          image_mode: draftPacket?.image_mode || null,
          source_file: draftPath,
          edition_type: editorialPlan.edition_type,
          edition_name: editorialPlan.edition_name,
          stream_plan: editorialPlan.stream_plans[categoryKey] || null
        }
      };

      if (existingArticle?.id) {
        const { error: updateArticleError } = await supabase
          .from("articles")
          .update(articlePayload)
          .eq("id", existingArticle.id);

        if (updateArticleError) {
          throw new Error(`Article update failed: ${updateArticleError.message}`);
        }
      } else {
        const { error: insertArticleError } = await supabase
          .from("articles")
          .insert(articlePayload);

        if (insertArticleError) {
          throw new Error(`Article insert failed: ${insertArticleError.message}`);
        }
      }
    }

    await supabase
      .from("publication_runs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        outputs_json: {
          files_written: filesWritten,
          edition_type: editorialPlan.edition_type,
          edition_name: editorialPlan.edition_name
        }
      })
      .eq("id", publicationRunId);

    return {
      ok: true,
      date: today,
      edition_type: editorialPlan.edition_type,
      edition_name: editorialPlan.edition_name,
      files_written: filesWritten
    };
  } catch (error) {
    if (publicationRunId) {
      await supabase
        .from("publication_runs")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          error_text: error.message || "Unknown error"
        })
        .eq("id", publicationRunId);
    }

    throw error;
  }
}

async function generateCandidateBundle({ apiKey, model, today, editorialPlan }) {
  const streamPlannerSummary = GENERATION_CATEGORIES.map((categoryKey) => {
    const plannerBlock = buildPlannerPromptBlock(editorialPlan, categoryKey);
    return `\n[${categoryKey}]\n${plannerBlock}`;
  }).join("\n");

  const prompt = `
You are preparing Drishvara's daily editorial shortlist for ${today}.

Return valid JSON only.

First follow the editorial planning instructions below very carefully.
These rules are not optional.

GLOBAL EDITORIAL PLAN
Date: ${editorialPlan.date}
Day: ${editorialPlan.day_name}
Edition type: ${editorialPlan.edition_type}
Edition name: ${editorialPlan.edition_name}
Objective: ${editorialPlan.objective}

STREAM PLANS
${streamPlannerSummary}

Create 8 to 12 candidate topics across these categories:
- spirituality
- sports
- world_affairs
- media_society
- public_programmes

Rules:
- Each candidate must be publication-worthy, serious, reflective, and suitable for a premium insight platform.
- Avoid gossip, celebrity fluff, listicles, and shallow trend commentary.
- Respect the topic width, depth, theme family, traffic goal, and topic shape for each stream.
- On special edition days, prefer stronger long-tail quality traffic, explanatory depth, historical framing, and more distinctive editorial value.
- Include at least one selected candidate per required category.
- Candidate titles should feel specific, publishable, and non-generic.
- Summaries should clearly signal why the topic matters.
- Do not generate cheap clickbait topics.

Return JSON in this shape:
{
  "date": "${today}",
  "edition_type": "${editorialPlan.edition_type}",
  "edition_name": "${editorialPlan.edition_name}",
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
  const normalized = rawCandidates.map(normalizeCandidate).filter(Boolean);
  const ensured = ensureCategoryCoverage(today, normalized);

  return {
    date: today,
    edition_type: editorialPlan.edition_type,
    edition_name: editorialPlan.edition_name,
    generated_at: new Date().toISOString(),
    candidates: ensured
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

function buildSignalRail(today, candidateBundle, editorialPlan) {
  const items = GENERATION_CATEGORIES.map((categoryKey) => {
    const candidate = pickCandidateForCategory(candidateBundle, categoryKey);
    return {
      category: CATEGORY_META[categoryKey].label,
      title: candidate.title,
      summary: candidate.summary,
      edition_type: editorialPlan.edition_type,
      theme_family: editorialPlan?.stream_plans?.[categoryKey]?.theme_family || null,
      status: "Selected"
    };
  });

  return {
    date: today,
    edition_type: editorialPlan.edition_type,
    edition_name: editorialPlan.edition_name,
    generated_at: new Date().toISOString(),
    items
  };
}

function normalizeReferenceLinks(input) {
  if (!Array.isArray(input)) return [];

  const seen = new Set();

  return input
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .filter(isLikelyValidUrl)
    .filter((url) => {
      const key = url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 2);
}

function isLikelyValidUrl(value) {
  const url = String(value || "").trim();
  if (!url) return false;
  if (!(url.startsWith("http://") || url.startsWith("https://"))) return false;

  try {
    const parsed = new URL(url);
    if (!parsed.hostname || !parsed.hostname.includes(".")) return false;

    const badHosts = ["example.com", "example.org", "example.net", "localhost"];
    if (badHosts.includes(parsed.hostname.toLowerCase())) return false;

    return true;
  } catch {
    return false;
  }
}

async function generateArticleDraft({
  apiKey,
  model,
  today,
  categoryKey,
  categoryMeta,
  candidate,
  editorialPlan
}) {
  const plannerBlock = buildPlannerPromptBlock(editorialPlan, categoryKey);

  const prompt = `
Write one polished Drishvara article for the category "${categoryMeta.label}".

EDITORIAL PLANNER DIRECTIVE
${plannerBlock}

Date: ${today}
Category key: ${categoryKey}
Selected topic title: ${candidate.title}
Selected angle: ${candidate.angle || ""}
Selected summary: ${candidate.summary}

Requirements:
- Tone: thoughtful, grounded, reflective, readable, non-hyperbolic
- Length: target 400 to 550 words
- Output must be valid JSON only
- Respect the planner's width, depth, traffic goal, topic shape, theme family, writing mode, and closing style
- On special edition days, the article should be distinctly stronger than a normal daily article
- Where suitable, use analogy, historical fact, evidence, or institutional framing in line with the planner
- Close in the planner-directed style, especially open reflective or open analytical when specified
- Provide:
  1. title
  2. slug
  3. subtitle
  4. summary
  5. image
  6. image_credit
  7. image_source_url
  8. image_alt
  9. image_prompt
  10. generated_image_path
  11. reference_links
  12. official_link
  13. supporting_link
  14. article_html

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
- image may be empty if no curated image path is available
- generated_image_path may be empty if no generated image exists
- image_prompt should describe a tasteful, editorial, non-cartoon, story-aligned visual that can be generated later if manual and sourced images are unavailable

Return JSON in this exact shape:
{
  "title": "",
  "slug": "",
  "subtitle": "",
  "summary": "",
  "image": "",
  "image_credit": "",
  "image_source_url": "",
  "image_alt": "",
  "image_prompt": "",
  "generated_image_path": "",
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
  repaired = repaired.replace(/:\s*true\\?"/g, ": true");
  repaired = repaired.replace(/:\s*false\\?"/g, ": false");
  repaired = repaired.replace(/,\s*([}\]])/g, "$1");

  return tryParseJson(repaired);
}

async function buildDraftPacket({
  token,
  owner,
  repo,
  branch,
  today,
  categoryKey,
  categoryMeta,
  candidate,
  generated,
  editorialPlan
}) {
  const slug = sanitizeSlug(
    generated?.slug ||
    generated?.title ||
    candidate.title ||
    `${categoryKey}-insight-${today}`
  );

  const streamPlan = editorialPlan?.stream_plans?.[categoryKey] || null;

  const baseDraftPacket = {
    date: today,
    meta_label: categoryMeta.label,
    title: safeText(generated?.title, candidate.title || `${categoryMeta.label} Insight`),
    slug,
    subtitle: safeText(
      generated?.subtitle,
      candidate.summary || "A daily editorial selection from Drishvara."
    ),
    summary: safeText(
      generated?.summary,
      candidate.summary || "A daily editorial selection from Drishvara."
    ),
    reference_links: normalizeReferenceLinks(generated?.reference_links),
    official_link: safeText(generated?.official_link),
    supporting_link: safeText(generated?.supporting_link),
    word_count_target: "400-550",
    article_html: normalizeArticleHtml(generated?.article_html, candidate, categoryMeta),
    generated_image_path: safeText(generated?.generated_image_path),
    generated_image_alt: safeText(generated?.image_alt),
    generated_image_credit: safeText(generated?.image_credit),
    generated_image_source_url: safeText(generated?.image_source_url),
    generated_image_prompt: safeText(generated?.image_prompt),
    generated_image_direct: safeText(generated?.image),
    edition_type: editorialPlan?.edition_type || "regular",
    edition_name: editorialPlan?.edition_name || "Standard Daily Edition",
    stream_plan: streamPlan
  };

  const imageInfo = await resolveArticleImage({
    token,
    owner,
    repo,
    branch,
    draftPacket: baseDraftPacket,
    categoryKey,
    today
  });

  return {
    ...baseDraftPacket,
    image: imageInfo.image_path,
    image_mode: imageInfo.image_mode,
    image_path: imageInfo.image_path,
    image_credit: imageInfo.image_credit,
    image_source_url: imageInfo.image_source_url,
    image_alt: imageInfo.image_alt,
    image_prompt: imageInfo.image_prompt || "",
    watermark_required: imageInfo.watermark_required
  };
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

async function resolveArticleImage({
  token,
  owner,
  repo,
  branch,
  draftPacket,
  categoryKey,
  today
}) {
  const slug = sanitizeSlug(draftPacket.slug || draftPacket.title || "");

  const exactManualPath = `assets/featured/${today}/${categoryKey}/${slug}-lead-1.jpg`;
  const categoryDayPath = `assets/featured/${today}/${categoryKey}/lead-1.jpg`;
  const fallbackPath = getDefaultImageForCategory(categoryKey);

  const exactManualExists = await githubFileExists({
    token,
    owner,
    repo,
    branch,
    path: exactManualPath
  });

  if (exactManualExists) {
    return {
      image_mode: "manual_asset_exact",
      image_path: exactManualPath,
      image_credit: "Drishvara Library",
      image_source_url: "",
      image_alt: buildDefaultAlt(categoryKey, draftPacket.title),
      image_prompt: "",
      watermark_required: true
    };
  }

  const categoryDayExists = await githubFileExists({
    token,
    owner,
    repo,
    branch,
    path: categoryDayPath
  });

  if (categoryDayExists) {
    return {
      image_mode: "manual_asset_category",
      image_path: categoryDayPath,
      image_credit: "Drishvara Library",
      image_source_url: "",
      image_alt: buildDefaultAlt(categoryKey, draftPacket.title),
      image_prompt: "",
      watermark_required: true
    };
  }

  const commonsImage = await findSourcedImageFromCommons({
    title: draftPacket.title,
    subtitle: draftPacket.subtitle,
    summary: draftPacket.summary,
    categoryKey
  });

  if (commonsImage) {
    return commonsImage;
  }

  const directCuratedImage = safeText(draftPacket.generated_image_direct);
  if (
    directCuratedImage &&
    (directCuratedImage.startsWith("http://") ||
      directCuratedImage.startsWith("https://") ||
      directCuratedImage.startsWith("assets/") ||
      directCuratedImage.startsWith("/assets/"))
  ) {
    return {
      image_mode: "source_curated",
      image_path: directCuratedImage,
      image_credit: safeText(draftPacket.generated_image_credit, "Source Provided"),
      image_source_url: safeText(draftPacket.generated_image_source_url),
      image_alt: safeText(
        draftPacket.generated_image_alt,
        buildDefaultAlt(categoryKey, draftPacket.title)
      ),
      image_prompt: "",
      watermark_required: false
    };
  }

  const generatedImagePath = safeText(draftPacket.generated_image_path);
  if (generatedImagePath) {
    return {
      image_mode: "generated_thematic",
      image_path: generatedImagePath,
      image_credit: safeText(draftPacket.generated_image_credit, "Drishvara AI"),
      image_source_url: "",
      image_alt: safeText(
        draftPacket.generated_image_alt,
        buildDefaultAlt(categoryKey, draftPacket.title)
      ),
      image_prompt: safeText(draftPacket.generated_image_prompt),
      watermark_required: true
    };
  }

  const aiImage = buildAIImagePlaceholder({
    draftPacket,
    categoryKey
  });

  if (aiImage) {
    return aiImage;
  }

  const fallbackExists = await githubFileExists({
    token,
    owner,
    repo,
    branch,
    path: fallbackPath
  });

  if (fallbackExists) {
    return {
      image_mode: "category_fallback",
      image_path: fallbackPath,
      image_credit: "Drishvara Fallback",
      image_source_url: "",
      image_alt: buildDefaultAlt(categoryKey, draftPacket.title),
      image_prompt: "",
      watermark_required: false
    };
  }

  return {
    image_mode: "no_image",
    image_path: "",
    image_credit: "",
    image_source_url: "",
    image_alt: buildDefaultAlt(categoryKey, draftPacket.title),
    image_prompt: "",
    watermark_required: false
  };
}

function buildAIImagePlaceholder({ draftPacket, categoryKey }) {
  const prompt = buildGeneratedImagePrompt({
    title: draftPacket.title,
    subtitle: draftPacket.subtitle,
    summary: draftPacket.summary,
    categoryKey
  });

  if (!prompt) return null;

  return {
    image_mode: "generated_thematic_pending",
    image_path: "",
    image_credit: "AI image pending generation",
    image_source_url: "",
    image_alt: `${CATEGORY_META[categoryKey]?.label || "Drishvara"} visual for ${draftPacket.title}`,
    image_prompt: prompt,
    watermark_required: true
  };
}

function buildGeneratedImagePrompt({ title, subtitle, summary, categoryKey }) {
  const styleHintMap = {
    spirituality: "calm contemplative editorial image, soft light, sacred stillness, non-denominational, elegant, realistic, premium magazine style",
    sports: "dynamic editorial sports image, disciplined athletic energy, premium sports magazine style, realistic, cinematic but not exaggerated",
    world_affairs: "serious geopolitical editorial image, maps, diplomacy, strategic atmosphere, realistic, premium global affairs magazine style",
    media_society: "thoughtful media and society editorial image, digital information atmosphere, public discourse, realistic, premium editorial style",
    public_programmes: "public systems editorial image, governance, community infrastructure, civic service, realistic, premium policy magazine style"
  };

  const styleHint = styleHintMap[categoryKey] || "premium editorial image, realistic, thoughtful, publication-ready";

  const safeTitle = safeText(title);
  const safeSubtitle = safeText(subtitle);
  const safeSummary = safeText(summary);

  if (!safeTitle && !safeSummary) return "";

  return [
    "Create a single high-quality horizontal editorial lead image for a serious digital publication.",
    `Story title: ${safeTitle}.`,
    safeSubtitle ? `Subtitle: ${safeSubtitle}.` : "",
    safeSummary ? `Story summary: ${safeSummary}.` : "",
    `Visual style: ${styleHint}.`,
    "No text overlay, no watermark inside the image, no collage, no cartoon style, no low-quality stock-photo look.",
    "Image should feel intelligent, restrained, story-aligned, and visually suitable for a premium homepage feature card and article hero image."
  ]
    .filter(Boolean)
    .join(" ");
}

async function finalizePendingAiImage({
  apiKey,
  imageModel,
  token,
  owner,
  repo,
  branch,
  today,
  categoryKey,
  draftPacket
}) {
  try {
    const result = await generateAiImageFromPrompt({
      apiKey,
      imageModel,
      prompt: draftPacket.image_prompt
    });

    const generatedPath = buildGeneratedImagePath({
      today,
      categoryKey,
      slug: draftPacket.slug
    });

    await saveGeneratedImageToGitHub({
      token,
      owner,
      repo,
      branch,
      path: generatedPath,
      base64Data: result.base64_data,
      message: `Save AI generated image for ${categoryKey} on ${today}`
    });

    return {
      ...draftPacket,
      image_mode: "generated_thematic",
      image: generatedPath,
      image_path: generatedPath,
      image_credit: "Drishvara AI",
      image_source_url: "",
      image_alt: draftPacket.image_alt || buildDefaultAlt(categoryKey, draftPacket.title),
      watermark_required: true
    };
  } catch (error) {
    console.error("AI image generation failed:", error);

    const fallbackPath = getDefaultImageForCategory(categoryKey);
    const fallbackExists = await githubFileExists({
      token,
      owner,
      repo,
      branch,
      path: fallbackPath
    });

    if (fallbackExists) {
      return {
        ...draftPacket,
        image_mode: "category_fallback",
        image: fallbackPath,
        image_path: fallbackPath,
        image_credit: "Drishvara Fallback",
        image_source_url: "",
        watermark_required: false
      };
    }

    return {
      ...draftPacket,
      image_mode: "no_image",
      image: "",
      image_path: "",
      image_credit: "",
      image_source_url: "",
      watermark_required: false
    };
  }
}

async function generateAiImageFromPrompt({
  apiKey,
  imageModel,
  prompt
}) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: imageModel || "gpt-image-1",
      prompt,
      size: "1536x1024",
      output_format: "png"
    })
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`OpenAI image request failed: ${response.status} ${rawText}`);
  }

  let payload;
  try {
    payload = JSON.parse(rawText);
  } catch {
    throw new Error(`OpenAI image API returned non-JSON response: ${rawText}`);
  }

  const first = Array.isArray(payload?.data) ? payload.data[0] : null;
  const base64Data =
    safeText(first?.b64_json) ||
    safeText(first?.base64_data);

  if (!base64Data) {
    throw new Error(`OpenAI image response missing base64 image data: ${rawText}`);
  }

  return {
    mime_type: "image/png",
    base64_data: base64Data
  };
}

function buildGeneratedImagePath({
  today,
  categoryKey,
  slug
}) {
  return `assets/generated/${today}/${categoryKey}/${sanitizeSlug(slug)}-ai-lead-1.png`;
}

async function saveGeneratedImageToGitHub({
  token,
  owner,
  repo,
  branch,
  path,
  base64Data,
  message
}) {
  const existing = await getGitHubFile({
    token,
    owner,
    repo,
    path,
    branch
  });

  const body = {
    message,
    content: base64Data,
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
    throw new Error(`GitHub image save failed for ${path}: ${response.status} ${errText}`);
  }

  return response.json();
}

async function findSourcedImageFromCommons({
  title,
  subtitle,
  summary,
  categoryKey
}) {
  const searchQuery = buildCommonsSearchQuery({
    title,
    subtitle,
    summary,
    categoryKey
  });

  if (!searchQuery) return null;

  const apiUrl = new URL("https://commons.wikimedia.org/w/api.php");
  apiUrl.search = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: searchQuery,
    gsrlimit: "6",
    gsrnamespace: "6",
    prop: "imageinfo|info",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "1600"
  }).toString();

  let payload;
  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!response.ok) return null;
    payload = await response.json();
  } catch {
    return null;
  }

  const pages = Object.values(payload?.query?.pages || {});
  if (!pages.length) return null;

  const candidates = pages
    .map((page) => normalizeCommonsCandidate(page, { title, subtitle, summary, categoryKey }))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return candidates[0] || null;
}

function buildCommonsSearchQuery({ title, subtitle, summary, categoryKey }) {
  const categoryHints = {
    spirituality: "meditation OR mindfulness OR temple OR prayer OR spiritual",
    sports: "sports OR athlete OR stadium OR match OR tournament",
    world_affairs: "diplomacy OR world map OR international relations OR geopolitics",
    media_society: "journalism OR media OR newsroom OR digital communication",
    public_programmes: "public health OR school OR governance OR infrastructure OR community"
  };

  const titleWords = extractSearchTerms(title, 4);
  const subtitleWords = extractSearchTerms(subtitle, 2);
  const summaryWords = extractSearchTerms(summary, 2);
  const hint = categoryHints[categoryKey] || "";

  const parts = [
    ...titleWords,
    ...subtitleWords,
    ...summaryWords,
    hint
  ].filter(Boolean);

  return parts.join(" ");
}

function extractSearchTerms(text, limit = 4) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => word.length > 3)
    .filter((word) => !COMMON_STOPWORDS.has(word))
    .slice(0, limit);
}

function normalizeCommonsCandidate(page, context) {
  const imageInfo = Array.isArray(page?.imageinfo) ? page.imageinfo[0] : null;
  if (!imageInfo) return null;

  const imageUrl = imageInfo.thumburl || imageInfo.url || "";
  if (!imageUrl) return null;

  const mime = String(imageInfo.mime || "").toLowerCase();
  if (!mime.startsWith("image/")) return null;

  const width = Number(imageInfo.thumbwidth || imageInfo.width || 0);
  if (width < 600) return null;

  const titleText = String(page?.title || "");
  const ext = imageInfo.extmetadata || {};

  const credit =
    stripHtml(safeText(ext?.Artist?.value)) ||
    stripHtml(safeText(ext?.Credit?.value)) ||
    "Wikimedia Commons";

  const score = scoreCommonsCandidate({
    pageTitle: titleText,
    context
  });

  if (score < 2) return null;

  return {
    image_mode: "source_curated",
    image_path: imageUrl,
    image_credit: credit,
    image_source_url: buildCommonsFilePageUrl(titleText),
    image_alt: buildCommonsAltText(context, titleText),
    image_prompt: "",
    watermark_required: false,
    score
  };
}

function scoreCommonsCandidate({ pageTitle, context }) {
  const haystack = `${pageTitle} ${context.title || ""} ${context.subtitle || ""} ${context.summary || ""}`.toLowerCase();

  let score = 0;
  for (const token of extractSearchTerms(context.title, 5)) {
    if (haystack.includes(token)) score += 2;
  }
  for (const token of extractSearchTerms(context.subtitle, 3)) {
    if (haystack.includes(token)) score += 1;
  }
  for (const token of extractSearchTerms(context.summary, 3)) {
    if (haystack.includes(token)) score += 1;
  }

  return score;
}

function buildCommonsFilePageUrl(fileTitle) {
  if (!fileTitle) return "";
  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(String(fileTitle).replace(/ /g, "_"))}`;
}

function buildCommonsAltText(context, fileTitle) {
  const label = CATEGORY_META[context.categoryKey]?.label || "Drishvara";
  const title = safeText(context.title, label);
  return `${label} image related to ${title}${fileTitle ? ` (${stripFilePrefix(fileTitle)})` : ""}`;
}

function stripFilePrefix(value) {
  return String(value || "").replace(/^File:/i, "");
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, "").trim();
}

async function githubFileExists({ token, owner, repo, branch, path }) {
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
    return false;
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GitHub existence check failed for ${path}: ${response.status} ${errText}`);
  }

  return true;
}

function buildDefaultAlt(categoryKey, title) {
  const label = CATEGORY_META[categoryKey]?.label || "Drishvara";
  const cleanTitle = safeText(title, `${label} article`);
  return `${label} visual for ${cleanTitle}`;
}

function getDefaultImageForCategory(categoryKey) {
  return CATEGORY_META[categoryKey]?.fallback_image || "assets/featured/fallback/default.jpg";
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

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
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

async function upsertGitHubJsonFile({
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