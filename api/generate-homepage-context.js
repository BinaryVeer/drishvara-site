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

  const wordOfTheDay = getWordOfTheDay(dayIndex);
  const vedicGuidance = getVedicGuidance(dayIndex);
  const panchang = getPanchangPlaceholder(dayIndex);
  const festivals = getFestivalPlaceholders(dayIndex);
  const liveScore = getLiveScorePlaceholder(dayIndex);

  const homepageContext = {
    date: today,
    generated_at: new Date().toISOString(),
    live_score: liveScore,
    word_of_the_day: wordOfTheDay,
    vedic_guidance: vedicGuidance,
    panchang: panchang,
    festivals: festivals
  };

  try {
    const path = `generated/homepage/${today}-homepage-context.json`;

    await upsertGitHubFile({
      token: GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      path,
      message: `Generate homepage context v2 for ${today}`,
      contentObject: homepageContext
    });

    return res.status(200).json({
      ok: true,
      date: today,
      written_to: path,
      context_preview: {
        live_score: homepageContext.live_score,
        word_of_the_day: homepageContext.word_of_the_day,
        vedic_guidance: homepageContext.vedic_guidance
      }
    });
  } catch (error) {
    console.error("generate-homepage-context v2 failed:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown error"
    });
  }
}

function getWordOfTheDay(dayIndex) {
  const words = [
    {
      english: "Discipline",
      hindi: "अनुशासन",
      sanskrit: "अनुशासनम्",
      meaning: "ordered self-guidance in thought and action"
    },
    {
      english: "Reflection",
      hindi: "मनन",
      sanskrit: "मननम्",
      meaning: "sustained inward consideration"
    },
    {
      english: "Steadiness",
      hindi: "स्थिरता",
      sanskrit: "स्थैर्यम्",
      meaning: "balance that does not collapse under movement"
    },
    {
      english: "Clarity",
      hindi: "स्पष्टता",
      sanskrit: "स्पष्टता",
      meaning: "the ability to see without confusion"
    },
    {
      english: "Restraint",
      hindi: "संयम",
      sanskrit: "संयमः",
      meaning: "strength expressed through measured control"
    },
    {
      english: "Devotion",
      hindi: "भक्ति",
      sanskrit: "भक्तिः",
      meaning: "directed feeling joined with steadiness and reverence"
    },
    {
      english: "Attention",
      hindi: "एकाग्रता",
      sanskrit: "एकाग्रता",
      meaning: "gathered awareness free from needless scattering"
    }
  ];

  return words[dayIndex % words.length];
}

function getVedicGuidance(dayIndex) {
  const guidance = [
    {
      hindi_title: "आज का वैदिक संकेत",
      weekday_hindi: "रविवार",
      weekday_english: "Sunday",
      suggested_colour_hindi: "केसरिया / स्वर्ण",
      suggested_colour_english: "saffron / gold",
      food_hindi: "हल्का, ऊर्जावान और सात्त्विक",
      food_english: "light, energizing, and satvik",
      mantra_hindi: "ॐ सूर्याय नमः",
      mantra_english: "Om Suryaya Namah",
      short_note_hindi: "आत्मविश्वास, तेज और संकल्प को संतुलित रखने का दिन।",
      short_note_english: "A day for balanced confidence, radiance, and steadied resolve."
    },
    {
      hindi_title: "आज का वैदिक संकेत",
      weekday_hindi: "सोमवार",
      weekday_english: "Monday",
      suggested_colour_hindi: "सफेद / चंद्रिका",
      suggested_colour_english: "white / moonlike tones",
      food_hindi: "शांत, शीतल और सरल भोजन",
      food_english: "calm, cooling, and simple food",
      mantra_hindi: "ॐ सोमाय नमः",
      mantra_english: "Om Somaya Namah",
      short_note_hindi: "मन, भाव और ग्रहणशीलता को संतुलित रखने का दिन।",
      short_note_english: "A day to steady the mind, emotions, and inner receptivity."
    },
    {
      hindi_title: "आज का वैदिक संकेत",
      weekday_hindi: "मंगलवार",
      weekday_english: "Tuesday",
      suggested_colour_hindi: "लाल / गेरुआ",
      suggested_colour_english: "red / rust",
      food_hindi: "ऊर्जावान पर संयमित भोजन",
      food_english: "energizing but restrained food",
      mantra_hindi: "ॐ अङ्गारकाय नमः",
      mantra_english: "Om Angarakaya Namah",
      short_note_hindi: "ऊर्जा को प्रतिक्रिया नहीं, दिशा में बदलने का दिन।",
      short_note_english: "A day to convert force into direction rather than reaction."
    },
    {
      hindi_title: "आज का वैदिक संकेत",
      weekday_hindi: "बुधवार",
      weekday_english: "Wednesday",
      suggested_colour_hindi: "हरा",
      suggested_colour_english: "green",
      food_hindi: "हल्का, स्वच्छ और संतुलित",
      food_english: "light, clean, and balanced",
      mantra_hindi: "ॐ बुधाय नमः",
      mantra_english: "Om Budhaya Namah",
      short_note_hindi: "विचार, संवाद और सूक्ष्म समझ को निखारने का दिन।",
      short_note_english: "A day to refine thinking, communication, and subtle understanding."
    },
    {
      hindi_title: "आज का वैदिक संकेत",
      weekday_hindi: "गुरुवार",
      weekday_english: "Thursday",
      suggested_colour_hindi: "पीला / हल्का स्वर्ण",
      suggested_colour_english: "yellow / soft gold",
      food_hindi: "पोषक, सात्त्विक और गरिमामय",
      food_english: "nourishing, satvik, and dignified",
      mantra_hindi: "ॐ बृहस्पतये नमः",
      mantra_english: "Om Brihaspataye Namah",
      short_note_hindi: "ज्ञान, संयम और परिपक्व निर्णय की ओर उन्मुख दिन।",
      short_note_english: "A day inclined toward wisdom, restraint, and mature judgment."
    },
    {
      hindi_title: "आज का वैदिक संकेत",
      weekday_hindi: "शुक्रवार",
      weekday_english: "Friday",
      suggested_colour_hindi: "हल्का पीला / स्वर्णाभ",
      suggested_colour_english: "light yellow / golden",
      food_hindi: "सात्त्विक, हल्का और संयमित",
      food_english: "satvik, light, and balanced",
      mantra_hindi: "ॐ श्रीं महालक्ष्म्यै नमः",
      mantra_english: "Om Shreem Mahalakshmyai Namah",
      short_note_hindi: "सौम्यता, संतुलन और विचारपूर्ण अभिव्यक्ति का दिन।",
      short_note_english: "A day oriented toward steadiness, grace, and thoughtful expression."
    },
    {
      hindi_title: "आज का वैदिक संकेत",
      weekday_hindi: "शनिवार",
      weekday_english: "Saturday",
      suggested_colour_hindi: "नीला / श्याम",
      suggested_colour_english: "deep blue / dark tones",
      food_hindi: "सरल, स्थिर और मिताहार",
      food_english: "simple, steady, and moderate food",
      mantra_hindi: "ॐ शनैश्चराय नमः",
      mantra_english: "Om Shanaishcharaya Namah",
      short_note_hindi: "धीरे, धैर्य से और उत्तरदायित्वपूर्वक चलने का दिन।",
      short_note_english: "A day for patience, steadiness, and responsible movement."
    }
  ];

  return guidance[dayIndex % guidance.length];
}

function getPanchangPlaceholder(dayIndex) {
  const places = ["Itanagar", "Delhi", "Mumbai", "Kolkata", "Guwahati"];
  const tithis = [
    "Pratipada → Dwitiya",
    "Dwitiya → Tritiya",
    "Tritiya → Chaturthi",
    "Panchami → Shashthi",
    "Saptami → Ashtami",
    "Ashtami → Navami",
    "Dashami → Ekadashi"
  ];
  const nakshatras = [
    "Ashwini → Bharani",
    "Rohini → Mrigashira",
    "Punarvasu → Pushya",
    "Magha → Purva Phalguni",
    "Hasta → Chitra",
    "Purva Ashadha → Uttara Ashadha",
    "Shravana → Dhanishta"
  ];
  const yogas = [
    "Shubha → Siddha",
    "Saubhagya → Shobhana",
    "Dhriti → Shula",
    "Sukarma → Dhruva",
    "Vyaghata → Harshana",
    "Shiva → Siddha",
    "Siddhi → Vyatipata"
  ];
  const pakshas = [
    "Shukla Paksha",
    "Krishna Paksha",
    "Shukla Paksha",
    "Krishna Paksha",
    "Shukla Paksha",
    "Krishna Paksha",
    "Shukla Paksha"
  ];

  return {
    place: places[dayIndex % places.length],
    sunrise: "06:13 AM",
    sunset: "06:54 PM",
    moonrise: "02:19 AM",
    moonset: "11:49 AM",
    tithi: tithis[dayIndex % tithis.length],
    nakshatra: nakshatras[dayIndex % nakshatras.length],
    yoga: yogas[dayIndex % yogas.length],
    paksha: pakshas[dayIndex % pakshas.length]
  };
}

function getFestivalPlaceholders(dayIndex) {
  const festivalSets = [
    [
      {
        title: "Kalashtami",
        subtitle: "Today",
        note: "A placeholder observance entry until festival logic is sourced dynamically."
      },
      {
        title: "Ekadashi",
        subtitle: "Upcoming",
        note: "Festival sequencing can later come from the panchang layer."
      }
    ],
    [
      {
        title: "Pradosh Vrat",
        subtitle: "Today",
        note: "A day associated with evening observance and inward restraint."
      },
      {
        title: "Purnima",
        subtitle: "Upcoming",
        note: "Future observance listing placeholder."
      }
    ],
    [
      {
        title: "Sankashti Chaturthi",
        subtitle: "Today",
        note: "Placeholder observance entry for future structured calendar support."
      },
      {
        title: "Amavasya",
        subtitle: "Upcoming",
        note: "Future observance listing placeholder."
      }
    ]
  ];

  return festivalSets[dayIndex % festivalSets.length];
}

function getLiveScorePlaceholder(dayIndex) {
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
