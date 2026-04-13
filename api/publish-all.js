import { createClient } from "@supabase/supabase-js";
function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

const CATEGORY_META = {
  spirituality: {
    label: "Spirituality",
    folder: "spiritual",
    fallback_image: "/assets/featured/fallback/spirituality-default.jpg"
  },
  sports: {
    label: "Sports",
    folder: "sports",
    fallback_image: "/assets/featured/fallback/sports-default.jpg"
  },
  world_affairs: {
    label: "World Affairs",
    folder: "world",
    fallback_image: "/assets/featured/fallback/world-default.jpg"
  },
  media_society: {
    label: "Media & Society",
    folder: "media",
    fallback_image: "/assets/featured/fallback/media-default.jpg"
  },
  public_programmes: {
    label: "Public Programmes",
    folder: "policy",
    fallback_image: "/assets/featured/fallback/policy-default.jpg"
  }
};

const PUBLISH_CATEGORIES = [
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
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH,
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    SUPABASE_SERVICE_ROLE_KEY
  } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO || !GITHUB_BRANCH) {
    return res.status(500).json({
      ok: false,
      error: "Missing required GitHub environment variables"
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const results = [];

  const supabaseKey = SUPABASE_SECRET_KEY || SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !supabaseKey) {
    return res.status(500).json({
      ok: false,
      error: "Missing required Supabase environment variables"
    });
  }

  const supabase = createClient(SUPABASE_URL, supabaseKey);

  let publicationRunId = null;

  const { data: runRow, error: runError } = await supabase
    .from("publication_runs")
    .insert({
      run_date: today,
      run_type: "publish_all",
      status: "started",
      inputs_json: {}
    })
    .select("id")
    .single();

  if (runError) {
    return res.status(500).json({
      ok: false,
      error: `Failed to create publication run: ${runError.message}`
    });
  }

  publicationRunId = runRow.id;

  try {
    for (const categoryKey of PUBLISH_CATEGORIES) {
      const categoryMeta = CATEGORY_META[categoryKey];
      const draftPath = `generated/drafts/${today}-${categoryKey}.json`;

      try {
        const draftText = await getGitHubFileContent({
          token: GITHUB_TOKEN,
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: draftPath,
          branch: GITHUB_BRANCH
        });

        const draftJson = JSON.parse(draftText);
        const draftPacket = draftJson?.draft_packet;

        if (!draftPacket) {
          results.push({
            category: categoryKey,
            ok: false,
            source: draftPath,
            error: "draft_packet missing"
          });
          continue;
        }

        const articlePath = buildArticlePath(categoryKey, draftPacket.slug);
        const articleHtml = await buildArticlePage({
          draftPacket,
          categoryMeta,
          today
        });

        await upsertGitHubFile({
          token: GITHUB_TOKEN,
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          branch: GITHUB_BRANCH,
          path: articlePath,
          message: `Publish ${categoryKey} article for ${today}`,
          contentString: articleHtml
        });

        const articleTitle =
          draftPacket?.title ||
          `${CATEGORY_META[categoryKey]?.label || categoryKey} - ${today}`;

        const articleSlug =
          draftPacket?.slug ||
          toSlug(articleTitle);

        const publishPayload = {
          latest_publication_run_id: publicationRunId,
          title: articleTitle,
          slug: articleSlug,
          status: "published",
          published_at: new Date().toISOString(),
          public_article_path: articlePath,
          article_html: articleHtml || null,
          metadata: {
            last_publish_source: draftPath || null
          }
        };

        const { data: existingArticle } = await supabase
          .from("articles")
          .select("id")
          .eq("article_date", today)
          .eq("category_key", categoryKey)
          .maybeSingle();

        let articleId = existingArticle?.id || null;

        if (existingArticle?.id) {
          const { error: updateArticleError } = await supabase
            .from("articles")
            .update(publishPayload)
            .eq("id", existingArticle.id);

          if (updateArticleError) {
            throw new Error(`Article update failed: ${updateArticleError.message}`);
          }
        } else {
          const { data: insertedArticle, error: insertArticleError } = await supabase
            .from("articles")
            .insert({
              article_date: today,
              category_key: categoryKey,
              stream_key: categoryKey,
              access_tier: "free",
              source_policy_version: "v1",
              ...publishPayload
            })
            .select("id")
            .single();

          if (insertArticleError) {
            throw new Error(`Article insert failed: ${insertArticleError.message}`);
          }

          articleId = insertedArticle.id;
        }

        const referenceLinksRaw = normalizeReferenceLinks(draftPacket.reference_links);
        const officialLinkRaw = safeText(draftPacket.official_link);
        const supportingLinkRaw = safeText(draftPacket.supporting_link);

        const referenceLinks = await filterReachableUrls(referenceLinksRaw);
        const officialLink = await resolveReachableUrl(
          isLikelyValidUrl(officialLinkRaw) ? officialLinkRaw : ""
        );
        const supportingLink = await resolveReachableUrl(
          isLikelyValidUrl(supportingLinkRaw) ? supportingLinkRaw : ""
        );

        const { error: deleteRefsError } = await supabase
          .from("article_references")
          .delete()
          .eq("article_id", articleId);

        if (deleteRefsError) {
          throw new Error(`Reference cleanup failed: ${deleteRefsError.message}`);
        }

        const referenceRows = [];

        referenceLinks.forEach((url, idx) => {
           
          referenceRows.push({
            article_id: articleId,
            reference_role: "reference_link",
            source_tier: "tier_3_pending",
            source_locator: url,
            is_reachable: true,
            notes: `reference_link_${idx + 1}`,
            metadata: {}
          });



        });

        if (officialLink) {
          referenceRows.push({
            article_id: articleId,
            reference_role: "official_link",
            source_tier: "tier_1_candidate",
            source_locator: officialLink,
            is_reachable: true,
            notes: "official_link",
            metadata: {}
          });
        }

        if (supportingLink) {
          referenceRows.push({
            article_id: articleId,
            reference_role: "supporting_link",
            source_tier: "tier_2_or_3_pending",
            source_locator: supportingLink,
            is_reachable: true,
            notes: "supporting_link",
            metadata: {}
          });
        }

        if (referenceRows.length) {
          const { error: insertRefsError } = await supabase
            .from("article_references")
            .insert(referenceRows);

          if (insertRefsError) {
            throw new Error(`Reference insert failed: ${insertRefsError.message}`);
          }
        }

        results.push({
          category: categoryKey,
          ok: true,
          source: draftPath,
          published_to: articlePath
        });
      } catch (error) {
        results.push({
          category: categoryKey,
          ok: false,
          source: draftPath,
          error: error.message || "Unknown error"
        });
      }
    }

    const successCount = results.filter((x) => x.ok).length;

    await supabase
      .from("publication_runs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        outputs_json: {
          results,
          success_count: successCount
        }
      })
      .eq("id", publicationRunId);

    return res.status(200).json({
      ok: true,
      date: today,
      success_count: successCount,
      total_categories: PUBLISH_CATEGORIES.length,
      results
    });
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

    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown error",
      results
    });
  }
}

function buildArticlePath(categoryKey, slug) {
  const folder = CATEGORY_META[categoryKey]?.folder || "articles";
  const safeSlug = sanitizeSlug(slug || `${categoryKey}-article`);
  return `articles/${folder}/${safeSlug}.html`;
}

async function buildArticlePage({ draftPacket, categoryMeta, today }) {
  const title = safeText(draftPacket.title, `${categoryMeta.label} Insight`);
  const subtitle = safeText(draftPacket.subtitle);
  const summary = safeText(
    draftPacket.summary,
    "A daily editorial selection from Drishvara."
  );

  const image = safeText(draftPacket.image_path || draftPacket.image);
  const imageCredit = safeText(draftPacket.image_credit);
  const imageSourceUrlRaw = safeText(draftPacket.image_source_url);
  const imageSourceUrl = isLikelyValidUrl(imageSourceUrlRaw) ? imageSourceUrlRaw : "";
  const imageAlt = safeText(draftPacket.image_alt, title);
  const imageMode = safeText(draftPacket.image_mode);

  const articleHtml = safeText(draftPacket.article_html);

  const referenceLinksRaw = normalizeReferenceLinks(draftPacket.reference_links);
  const officialLinkRaw = safeText(draftPacket.official_link);
  const supportingLinkRaw = safeText(draftPacket.supporting_link);

  const referenceLinks = await filterReachableUrls(referenceLinksRaw);
  const officialLink = await resolveReachableUrl(
    isLikelyValidUrl(officialLinkRaw) ? officialLinkRaw : ""
  );
  const supportingLink = await resolveReachableUrl(
    isLikelyValidUrl(supportingLinkRaw) ? supportingLinkRaw : ""
  );

  const categoryLabel = safeText(draftPacket.meta_label, categoryMeta.label);
  const publishedDate = formatDisplayDate(today);

  const hasImage = Boolean(image);
  const imageUrl = hasImage ? buildImageUrl(image) : "";
  const fallbackImageUrl = buildFallbackImageUrl(categoryMeta);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | Drishvara</title>
  <meta name="description" content="${escapeAttribute(summary)}" />
  <link rel="icon" type="image/png" href="/assets/logo/logo.png" />
  <style>
    :root {
      --bg-1: #08142d;
      --bg-2: #12254a;
      --surface: rgba(255, 255, 255, 0.04);
      --surface-strong: rgba(255, 255, 255, 0.06);
      --border: rgba(255, 255, 255, 0.08);
      --text-main: #f5f1e8;
      --text-soft: #d7deea;
      --text-muted: #9aa8bc;
      --gold: #c9a24a;
      --gold-soft: rgba(201, 162, 74, 0.16);
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
    }

    body {
      font-family: "Georgia", "Times New Roman", serif;
      color: var(--text-main);
      background:
        radial-gradient(circle at 50% 10%, rgba(201, 162, 74, 0.08), transparent 18%),
        linear-gradient(135deg, var(--bg-1), var(--bg-2));
      overflow-x: hidden;
    }

    a {
      color: var(--gold);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .page {
      width: 100%;
      max-width: 980px;
      margin: 0 auto;
      padding: 28px 20px 72px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 28px;
      font-family: Arial, Helvetica, sans-serif;
      flex-wrap: wrap;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-main);
    }

    .brand img {
      width: 38px;
      height: auto;
      display: block;
    }

    .brand-name {
      font-size: 1.12rem;
      letter-spacing: 0.2px;
    }

    .topbar-nav {
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
    }

    .topbar-nav a {
      color: var(--text-soft);
      font-size: 0.96rem;
      font-family: Arial, Helvetica, sans-serif;
    }

    .topbar-nav a:hover {
      color: var(--gold);
      text-decoration: none;
    }

    .article-shell {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 28px 26px;
      backdrop-filter: blur(6px);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 16px;
      font-family: Arial, Helvetica, sans-serif;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .category-pill {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 999px;
      background: var(--gold-soft);
      border: 1px solid rgba(201, 162, 74, 0.18);
      color: var(--gold);
      font-size: 0.82rem;
      font-weight: 600;
    }

    h1 {
      margin: 0 0 12px;
      font-size: clamp(2rem, 4vw, 3rem);
      line-height: 1.08;
      color: var(--text-main);
    }

    .subtitle {
      margin: 0 0 18px;
      font-size: 1.08rem;
      line-height: 1.75;
      color: var(--text-soft);
    }

    .summary-box {
      margin: 0 0 22px;
      padding: 16px 18px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      line-height: 1.8;
      font-size: 0.98rem;
    }

    .hero-media-wrap {
      margin-bottom: 24px;
    }

    .hero-image-tag {
      width: 100%;
      height: 280px;
      object-fit: cover;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.06);
      display: block;
      background: linear-gradient(135deg, rgba(201,162,74,0.14), rgba(255,255,255,0.03));
    }

    .hero-image-tag.used-fallback {
      background: linear-gradient(135deg, rgba(201,162,74,0.14), rgba(255,255,255,0.03));
    }

    .media-credit {
      margin-top: 10px;
      color: var(--text-muted);
      font-size: 0.84rem;
      line-height: 1.6;
      font-family: Arial, Helvetica, sans-serif;
    }

    .media-credit a {
      color: var(--gold);
    }

    .media-credit .mode {
      display: inline-block;
      margin-left: 8px;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      color: var(--text-soft);
      font-size: 0.76rem;
    }

    .article-body {
      color: var(--text-main);
      font-size: 1.02rem;
      line-height: 1.95;
    }

    .article-body p {
      margin: 0 0 18px;
    }

    .resource-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .resource-section h2 {
      margin: 0 0 14px;
      font-size: 1.2rem;
      color: var(--text-main);
    }

    .resource-links {
      display: grid;
      gap: 10px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 0.95rem;
    }

    .resource-links a {
      color: var(--gold);
      word-break: break-word;
    }

    .footer-note {
      margin-top: 28px;
      color: var(--text-muted);
      font-size: 0.9rem;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.7;
    }

    @media (max-width: 720px) {
      .page {
        padding: 20px 16px 48px;
      }

      .article-shell {
        padding: 22px 18px;
      }

      .hero-image-tag {
        height: 200px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="topbar">
      <div class="brand">
        <img src="/assets/logo/logo.png" alt="Drishvara logo" />
        <div class="brand-name">Drishvara</div>
      </div>

      <div class="topbar-nav">
        <a href="/index.html">Home</a>
        <a href="/about.html">About</a>
        <a href="/insights.html">Insights</a>
        <a href="/contact.html">Contact</a>
      </div>
    </div>

    <article class="article-shell">
      <div class="meta-row">
        <span class="category-pill">${escapeHtml(categoryLabel)}</span>
        <span>${escapeHtml(publishedDate)}</span>
      </div>

      <h1>${escapeHtml(title)}</h1>
      ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ""}
      ${summary ? `<div class="summary-box">${escapeHtml(summary)}</div>` : ""}

      <div class="hero-media-wrap">
        ${
          hasImage
            ? `<img
                 class="hero-image-tag"
                 src="${escapeAttribute(imageUrl)}"
                 alt="${escapeAttribute(imageAlt)}"
                 loading="eager"
                 referrerpolicy="no-referrer"
                 onerror="this.onerror=null; this.src='${escapeAttribute(fallbackImageUrl)}'; this.classList.add('used-fallback');"
               />`
            : `<img
                 class="hero-image-tag used-fallback"
                 src="${escapeAttribute(fallbackImageUrl)}"
                 alt="${escapeAttribute(imageAlt || "Fallback article image")}"
                 loading="eager"
               />`
        }

        ${
          hasImage || imageCredit || imageSourceUrl || imageMode
            ? `<div class="media-credit">
                ${imageCredit ? `Image credit: ${escapeHtml(imageCredit)}` : `Image`}
                ${imageSourceUrl ? ` · <a href="${escapeAttribute(imageSourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>` : ""}
                ${imageMode ? `<span class="mode">${escapeHtml(imageMode)}</span>` : ""}
              </div>`
            : ""
        }
      </div>

      <div class="article-body">
        ${articleHtml}
      </div>

      ${
        referenceLinks.length || officialLink || supportingLink
          ? `<section class="resource-section">
              <h2>References & Further Reading</h2>
              <div class="resource-links">
                ${referenceLinks.map((link, idx) => `
                  <a href="${escapeAttribute(link)}" target="_blank" rel="noopener noreferrer">
                    Reference ${idx + 1}
                  </a>
                `).join("")}
                ${officialLink ? `
                  <a href="${escapeAttribute(officialLink)}" target="_blank" rel="noopener noreferrer">
                    Official Page
                  </a>
                ` : ""}
                ${supportingLink ? `
                  <a href="${escapeAttribute(supportingLink)}" target="_blank" rel="noopener noreferrer">
                    Supporting Source
                  </a>
                ` : ""}
              </div>
            </section>`
          : ""
      }

      <div class="footer-note">
        Published as part of Drishvara’s daily editorial cycle.
      </div>
    </article>
  </div>
</body>
</html>`;
}

function buildImageUrl(imagePath) {
  const raw = safeText(imagePath);
  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  return raw.startsWith("/") ? raw : `/${raw}`;
}

function buildFallbackImageUrl(categoryMeta) {
  return categoryMeta?.fallback_image || "/assets/featured/fallback/default.jpg";
}

async function filterReachableUrls(urls) {
  if (!Array.isArray(urls) || !urls.length) return [];

  const checks = await Promise.all(
    urls.map(async (url) => {
      const reachable = await isReachableUrl(url);
      return reachable ? url : null;
    })
  );

  return checks.filter(Boolean).slice(0, 2);
}

async function resolveReachableUrl(url) {
  if (!url) return "";
  const reachable = await isReachableUrl(url);
  return reachable ? url : "";
}

async function isReachableUrl(url) {
  if (!isLikelyValidUrl(url)) return false;

  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      redirect: "follow"
    });

    if (headResponse.ok) return true;

    const getResponse = await fetch(url, {
      method: "GET",
      redirect: "follow"
    });

    return getResponse.ok;
  } catch {
    return false;
  }
}

function formatDisplayDate(dateText) {
  try {
    const date = new Date(`${dateText}T00:00:00Z`);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch {
    return dateText;
  }
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
    throw new Error(`GitHub content missing for ${path}`);
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
  contentString
}) {
  const existing = await getGitHubFile({
    token,
    owner,
    repo,
    path,
    branch
  });

  const content = Buffer.from(contentString, "utf8").toString("base64");

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
