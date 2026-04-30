import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function arg(name, fallback = "") {
  const found = process.argv.find((item) => item.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime());
}

function validateTimezone(timezone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function localWeekday(date, timezone) {
  const d = new Date(`${date}T12:00:00Z`);
  const weekdayEn = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long"
  }).format(d);

  const mapHi = {
    Sunday: "रविवार",
    Monday: "सोमवार",
    Tuesday: "मंगलवार",
    Wednesday: "बुधवार",
    Thursday: "गुरुवार",
    Friday: "शुक्रवार",
    Saturday: "शनिवार"
  };

  return {
    value_en: weekdayEn,
    value_hi: mapHi[weekdayEn] || weekdayEn,
    status: "calendar_weekday_only",
    note: "Vara here is a safe civil-calendar weekday scaffold, not a complete Panchang calculation."
  };
}

function usage() {
  console.log(`
Drishvara Panchang Engine Scaffold

Usage:
  node scripts/panchang-engine.js --date=2026-05-10 --place=Itanagar --lat=27.0844 --lon=93.6053 --timezone=Asia/Kolkata
  node scripts/panchang-engine.js --date=2026-05-10 --place=Itanagar --lat=27.0844 --lon=93.6053 --timezone=Asia/Kolkata --out=generated/sanatan/panchang/2026-05-10-itanagar.json

Important:
  This scaffold does not calculate final public Panchang fields.
  Tithi, Nakshatra, Yoga, Karana, sunrise/sunset, moonrise/moonset, and planetary positions remain null until reviewed calculation methods are added.
`);
}

const date = arg("date");
const place = arg("place", "Unspecified");
const timezone = arg("timezone", "Asia/Kolkata");
const lat = Number(arg("lat", "NaN"));
const lon = Number(arg("lon", "NaN"));
const out = arg("out", "");

if (!date || process.argv.includes("--help")) {
  usage();
  if (!date) process.exit(1);
}

assert(isValidDate(date), "Invalid --date. Use YYYY-MM-DD.");
assert(Number.isFinite(lat) && lat >= -90 && lat <= 90, "Invalid --lat. Use number between -90 and 90.");
assert(Number.isFinite(lon) && lon >= -180 && lon <= 180, "Invalid --lon. Use number between -180 and 180.");
assert(validateTimezone(timezone), "Invalid --timezone. Use a valid IANA timezone.");

const now = new Date().toISOString();

const result = {
  version: "2026.04.30-b18b",
  module: "sanatan.panchang.engine_output",
  public_output_enabled: false,
  calculation_status: "scaffold_only",
  review_status: "under_review",
  input: {
    date,
    place_name: place,
    latitude: lat,
    longitude: lon,
    timezone
  },
  method: {
    panchang_method_id: "panchang_method_seed_v1",
    method_review_status: "under_review",
    approved_for_public_use: false,
    source_ids: ["src_panchang_classical_methods_seed"],
    note: "Full Panchang computation is intentionally disabled until method review is completed."
  },
  audit: {
    generated_at: now,
    generated_by: "scripts/panchang-engine.js",
    database_version: "2026.04",
    engine_stage: "scaffold",
    public_display_allowed: false
  },
  safe_calendar_fields: {
    vara: localWeekday(date, timezone)
  },
  panchang_fields: {
    tithi: null,
    paksha: null,
    masa: null,
    nakshatra: null,
    yoga: null,
    karana: null,
    sunrise: null,
    sunset: null,
    moonrise: null,
    moonset: null,
    sun_rashi: null,
    moon_rashi: null,
    ayanamsha_method: null
  },
  guardrails: [
    "Do not publish this scaffold output as final Panchang.",
    "Null Panchang fields must not be filled by guesswork.",
    "Public output requires reviewed calculation method and source registry approval."
  ]
};

const json = JSON.stringify(result, null, 2) + "\n";

if (out) {
  const outPath = path.join(root, out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, json, "utf8");
  console.log(`Wrote ${out}`);
} else {
  process.stdout.write(json);
}
