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

const words = [
  {
    english: "Discernment",
    hindi: "विवेक",
    sanskrit: "विवेकः",
    meaning: "The capacity to distinguish what is lasting, useful, and true from what is noisy, shallow, or temporary.",
    reflection_hi: "विवेक वह शक्ति है जिससे मनुष्य शोर और सार के बीच अंतर कर पाता है।"
  },
  {
    english: "Continuity",
    hindi: "निरंतरता",
    sanskrit: "सातत्य",
    meaning: "The discipline of preserving a meaningful thread across days, decisions, and duties.",
    reflection_hi: "निरंतरता छोटे कार्यों को दीर्घकालीन दिशा में बदलती है।"
  },
  {
    english: "Stewardship",
    hindi: "संरक्षण-भाव",
    sanskrit: "पालनम्",
    meaning: "The responsibility to care for what has been entrusted to us.",
    reflection_hi: "संरक्षण-भाव अधिकार से अधिक उत्तरदायित्व को महत्व देता है।"
  },
  {
    english: "Clarity",
    hindi: "स्पष्टता",
    sanskrit: "स्पष्टता",
    meaning: "A clean view of what matters and what can wait.",
    reflection_hi: "स्पष्टता निर्णय को सरल और कर्म को स्थिर बनाती है।"
  }
];

const index = Math.abs(date.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0)) % words.length;
const word = words[index];

const context = {
  version: "2026.04.30-b18e",
  module: "daily_context",
  date,
  public_output_enabled: true,
  word_of_the_day: word,
  first_light: {
    title: "First Light",
    subtitle: "A calm opening signal for today’s reading surface.",
    signals: [
      {
        label: "Read with attention",
        text: "Begin with one serious read before scanning the rest of the day."
      },
      {
        label: "Preserve useful insight",
        text: "Save one idea that may remain useful beyond today."
      },
      {
        label: "Return with reflection",
        text: "Close the session by asking what changed in your understanding."
      }
    ]
  },
  vedic_guidance_status: {
    enabled: false,
    reason: "Premium Vedic and Panchang guidance remains disabled until reviewed calculation methods and Knowledge Vault rules are approved."
  },
  panchang_status: {
    enabled: false,
    reason: "Panchang public display is blocked until calculation methods are reviewed."
  },
  audit: {
    generated_at: new Date().toISOString(),
    generated_by: "scripts/build-daily-context.js"
  }
};

writeJson("data/daily-context.json", context);
writeJson(`generated/daily-context/${date}-daily-context.json`, context);

console.log("Daily context generated:");
console.log(`- data/daily-context.json`);
console.log(`- generated/daily-context/${date}-daily-context.json`);
console.log(`- Word: ${word.english} / ${word.hindi}`);
