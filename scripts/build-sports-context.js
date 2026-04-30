import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function arg(name, fallback = "") {
  const found = process.argv.find((item) => item.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

function writeJson(file, data) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime());
}

const date = arg("date", new Date().toISOString().slice(0, 10));

if (!isValidDate(date)) {
  throw new Error("Invalid --date. Use YYYY-MM-DD.");
}

const context = {
  version: "2026.04.30-b18f",
  module: "sports_context",
  date,
  public_output_enabled: true,
  live_api_enabled: false,
  live_update_mode: "curated_scaffold",
  right_top_live_update: {
    status: "scaffold",
    label: "Live Sports",
    label_hi: "लाइव खेल",
    title: "Today’s sports watch is being prepared",
    title_hi: "आज की खेल झलक तैयार की जा रही है",
    summary: "Major live events, tournament movement, and selected sports signals will appear here as the Sports Desk matures.",
    summary_hi: "स्पोर्ट्स डेस्क विकसित होने पर प्रमुख लाइव इवेंट, टूर्नामेंट गतिविधियाँ और चयनित खेल संकेत यहाँ दिखाई देंगे।",
    cta_label: "Open Sports Desk",
    cta_label_hi: "स्पोर्ट्स डेस्क खोलें",
    cta_url: "#sports-desk",
    last_updated: new Date().toISOString()
  },
  topRightLiveUpdate: {
    status: "scaffold",
    label: "Live Sports",
    label_hi: "लाइव खेल",
    title: "Today’s sports watch is being prepared",
    title_hi: "आज की खेल झलक तैयार की जा रही है",
    summary: "Major live events, tournament movement, and selected sports signals will appear here as the Sports Desk matures.",
    summary_hi: "स्पोर्ट्स डेस्क विकसित होने पर प्रमुख लाइव इवेंट, टूर्नामेंट गतिविधियाँ और चयनित खेल संकेत यहाँ दिखाई देंगे।",
    ctaLabel: "Open Sports Desk",
    ctaLabel_hi: "स्पोर्ट्स डेस्क खोलें",
    ctaUrl: "#sports-desk",
    lastUpdated: new Date().toISOString()
  },
  live_events: [
    {
      title: "Live event feed pending",
      title_hi: "लाइव इवेंट फ़ीड प्रतीक्षारत",
      sport: "Multi-sport",
      status: "scaffold",
      summary: "This slot is reserved for verified live fixtures, scores, and event movement.",
      summary_hi: "यह स्थान सत्यापित लाइव फ़िक्स्चर, स्कोर और इवेंट गतिविधियों के लिए सुरक्षित है।"
    }
  ],
  liveEvents: [
    {
      title: "Live event feed pending",
      title_hi: "लाइव इवेंट फ़ीड प्रतीक्षारत",
      sport: "Multi-sport",
      status: "scaffold",
      summary: "This slot is reserved for verified live fixtures, scores, and event movement.",
      summary_hi: "यह स्थान सत्यापित लाइव फ़िक्स्चर, स्कोर और इवेंट गतिविधियों के लिए सुरक्षित है।"
    }
  ],
  tournament_watch: [
    {
      title: "Tournament watchlist",
      title_hi: "टूर्नामेंट निगरानी सूची",
      sport: "Cricket / Football / Tennis / Multi-sport",
      status: "curated_pending",
      summary: "A curated tournament watch layer will track major Indian and global competitions.",
      summary_hi: "एक चयनित टूर्नामेंट निगरानी परत प्रमुख भारतीय और वैश्विक प्रतियोगिताओं को ट्रैक करेगी।"
    }
  ],
  tournamentWatch: [
    {
      title: "Tournament watchlist",
      title_hi: "टूर्नामेंट निगरानी सूची",
      sport: "Cricket / Football / Tennis / Multi-sport",
      status: "curated_pending",
      summary: "A curated tournament watch layer will track major Indian and global competitions.",
      summary_hi: "एक चयनित टूर्नामेंट निगरानी परत प्रमुख भारतीय और वैश्विक प्रतियोगिताओं को ट्रैक करेगी।"
    }
  ],
  major_updates: [
    {
      title: "Sports intelligence layer under preparation",
      title_hi: "खेल विश्लेषण परत तैयारी में है",
      status: "scaffold",
      summary: "This area will summarize important shifts, standings, selection signals, and tournament context.",
      summary_hi: "यह क्षेत्र प्रमुख बदलावों, स्थिति, चयन संकेतों और टूर्नामेंट संदर्भ का सार देगा।"
    }
  ],
  majorUpdates: [
    {
      title: "Sports intelligence layer under preparation",
      title_hi: "खेल विश्लेषण परत तैयारी में है",
      status: "scaffold",
      summary: "This area will summarize important shifts, standings, selection signals, and tournament context.",
      summary_hi: "यह क्षेत्र प्रमुख बदलावों, स्थिति, चयन संकेतों और टूर्नामेंट संदर्भ का सार देगा।"
    }
  ],
  featured_sports_article: {
    title: "Legacy and Transformation: The Historical Arc of Global Sports and Its Future Trajectories",
    title_hi: "विरासत और परिवर्तन: वैश्विक खेलों की ऐतिहासिक यात्रा और भविष्य",
    summary: "A reflective sports read from Drishvara’s published archive.",
    summary_hi: "दृश्वर के प्रकाशित संग्रह से एक चिंतनशील खेल लेख।",
    url: "article.html?path=articles%2Fsports%2Flegacy-transformation-historical-arc-global-sports-future.html",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    status: "published_archive"
  },
  featuredSportsArticle: {
    title: "Legacy and Transformation: The Historical Arc of Global Sports and Its Future Trajectories",
    title_hi: "विरासत और परिवर्तन: वैश्विक खेलों की ऐतिहासिक यात्रा और भविष्य",
    summary: "A reflective sports read from Drishvara’s published archive.",
    summary_hi: "दृश्वर के प्रकाशित संग्रह से एक चिंतनशील खेल लेख।",
    url: "article.html?path=articles%2Fsports%2Flegacy-transformation-historical-arc-global-sports-future.html",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    status: "published_archive"
  },
  guardrails: [
    "Do not present scaffold sports items as live verified scores.",
    "Live sports API is not yet enabled.",
    "Only verified or curated sports updates should be shown as live in future.",
    "Right-top live update object must clearly indicate scaffold/pending status until live source is connected."
  ],
  audit: {
    generated_at: new Date().toISOString(),
    generated_by: "scripts/build-sports-context.js"
  }
};

writeJson("data/sports-context.json", context);
writeJson(`generated/sports-context/${date}-sports-context.json`, context);

console.log("Sports context generated:");
console.log("- data/sports-context.json");
console.log(`- generated/sports-context/${date}-sports-context.json`);
console.log(`- Right-top live update: ${context.right_top_live_update.title}`);
