const CATEGORY_META = {
  spirituality: {
    label: "Spirituality",
    folder: "spiritual"
  },
  sports: {
    label: "Sports",
    folder: "sports"
  },
  world_affairs: {
    label: "World Affairs",
    folder: "world"
  },
  media_society: {
    label: "Media & Society",
    folder: "media"
  },
  public_programmes: {
    label: "Public Programmes",
    folder: "policy"
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
    GITHUB_BRANCH
  } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO || !GITHUB_BRANCH) {
    return res.status(500).json({
      ok: false,
      error: "Missing required GitHub environment variables"
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const results = [];

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

    return res.status(200).json({
      ok: true,
      date: today,
      success_count: successCount,
      total_categories: PUBLISH_CATEGORIES.length,
      results
    });
  } catch (error) {
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
  <title>${escapeHtml(title)} | Drishvara
