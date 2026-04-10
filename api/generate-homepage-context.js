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

  const homepageContext = {
    date: today,
    generated_at: new Date().toISOString(),
    live_score: {
      show: true,
      sport: "Cricket",
      tournament: "IPL",
      match: "MI vs CSK",
      score: "MI 148/4 (16.2)",
      status: "LIVE",
      link: ""
    },
    word_of_the_day: {
      english: "Reflection",
      hindi: "मनन",
      sanskrit: "मननम्",
      meaning: "sustained inward consideration"
    },
    vedic_guidance: {
      hindi_title: "आज का वैदिक संकेत",
      weekday_hindi: "शुक्रवार",
      weekday_english: "Friday",
      suggested_colour_hindi: "हल्का पीला / स्वर्णाभ",
      suggested_colour_english: "light yellow / golden",
      food_hindi: "सात्त्विक, हल्का और संयमित",
      food_english: "satvik, light, and balanced",
      mantra_hindi: "ॐ श्रीं महालक्ष्म्यै नमः",
      mantra_english: "Om Shreem Mahalakshmyai Namah",
      short_note_hindi: "आज का दिन संतुलन, विनम्रता और विचारपूर्ण अभिव्यक्ति की ओर उन्मुख है।",
      short_note_english: "The day leans toward steadiness, grace, and thoughtful expression."
    },
    panchang: {
      place: "Itanagar",
      sunrise: "06:13 AM",
      sunset: "06:54 PM",
      moonrise: "02:19 AM",
      moonset: "11:49 AM",
      tithi: "Ashtami → Navami",
      nakshatra: "Purva Ashadha → Uttara Ashadha",
      yoga: "Shiva → Siddha",
      paksha: "Krishna Paksha"
    },
    festivals: [
      {
        title: "Kalashtami",
        subtitle: "Today",
        note: "Example observance entry with future bilingual support."
      },
      {
        title: "Varuthini Ekadashi",
        subtitle: "Upcoming",
        note: "Festival sequencing can later come from the panchang layer."
      }
    ]
  };

  try {
    const path = `generated/homepage/${today}-homepage-context.json`;

    await upsertGitHubFile({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      path,
      message: `Generate homepage context for ${today}`,
      contentObject: homepageContext
    });

    return res.status(200).json({
      ok: true,
      date: today,
      written_to: path
    });
  } catch (error) {
    console.error("generate-homepage-context failed:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown error"
    });
  }
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
