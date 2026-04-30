import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();

function arg(name, fallback = "") {
  const found = process.argv.find((item) => item.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeJson(file, data) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime());
}

function usage() {
  console.log(`
Drishvara Subscriber Daily Guidance Scaffold

Usage:
  node scripts/subscriber-guidance-engine.js --date=2026-05-10 --context=data/knowledge/subscribers/sample-subscriber-context.json
  node scripts/subscriber-guidance-engine.js --date=2026-05-10 --context=data/knowledge/subscribers/sample-subscriber-context.json --out=generated/subscribers/daily-guidance/sample-2026-05-10.json

Important:
  This scaffold does not generate final lucky number, lucky color, mantra, or do/don't guidance.
  These outputs remain blocked until approved Knowledge Vault rules and authenticated subscriber flow are implemented.
`);
}

const date = arg("date");
const contextPath = arg("context", "data/knowledge/subscribers/sample-subscriber-context.json");
const out = arg("out", "");

if (!date || process.argv.includes("--help")) {
  usage();
  if (!date) process.exit(1);
}

assert(isValidDate(date), "Invalid --date. Use YYYY-MM-DD.");

const methods = readJson("data/knowledge/subscribers/daily-guidance-methods.json");
const context = readJson(contextPath);

assert(methods.public_output_enabled === false, "Subscriber guidance must not be public output.");
assert(methods.subscriber_output_enabled === false, "Subscriber guidance subscriber output must remain disabled at scaffold stage.");
assert(methods.login_required === true, "Subscriber guidance must require login.");
assert(methods.subscription_required === true, "Subscriber guidance must require subscription.");

assert(Boolean(context.subscriber_id), "Missing subscriber_id.");
assert(context.subscription_status === "active", "Sample context must have active subscription for scaffold validation.");
assert(context.consent_to_generate_personal_guidance === true, "Consent is required.");
assert(Boolean(context.current_location?.timezone), "Current location timezone is required.");
assert(Number.isFinite(Number(context.current_location?.latitude)), "Current latitude is required.");
assert(Number.isFinite(Number(context.current_location?.longitude)), "Current longitude is required.");

const panchangRun = spawnSync("node", [
  "scripts/panchang-engine.js",
  `--date=${date}`,
  `--place=${context.current_location.place_name || "Unspecified"}`,
  `--lat=${context.current_location.latitude}`,
  `--lon=${context.current_location.longitude}`,
  `--timezone=${context.current_location.timezone}`
], {
  cwd: root,
  encoding: "utf8"
});

assert(panchangRun.status === 0, "Panchang scaffold dependency failed.");

const panchang = JSON.parse(panchangRun.stdout);

const blockedReason = "Blocked until approved Knowledge Vault rules, reviewed Panchang method, login/subscription enforcement, and subscriber guidance approval are implemented.";

const result = {
  version: "2026.04.30-b18c",
  module: "subscribers.daily_guidance_output",
  public_output_enabled: false,
  subscriber_output_enabled: false,
  login_required: true,
  subscription_required: true,
  generation_status: "scaffold_only",
  review_status: "under_review",
  guidance_date: date,
  subscriber_context: {
    subscriber_id: context.subscriber_id,
    preferred_language: context.preferred_language || "hi",
    subscription_status: context.subscription_status,
    consent_to_generate_personal_guidance: context.consent_to_generate_personal_guidance,
    current_location: context.current_location
  },
  method: {
    database_version: "2026.04",
    guidance_method_version: methods.version,
    panchang_dependency_status: panchang.calculation_status,
    panchang_public_output_enabled: panchang.public_output_enabled,
    panchang_review_status: panchang.review_status
  },
  safe_context: {
    civil_weekday: panchang.safe_calendar_fields?.vara || null
  },
  daily_guidance: {
    lucky_number: {
      value: null,
      status: "blocked",
      reason: blockedReason
    },
    lucky_color: {
      value: null,
      status: "blocked",
      reason: blockedReason
    },
    mantra: {
      text_devanagari: null,
      text_transliteration: null,
      deity_or_context: null,
      status: "blocked",
      reason: "Blocked until exact reviewed mantra source and context are approved."
    },
    what_to_do: [],
    what_not_to_do: [],
    reflection_note: {
      value: null,
      status: "blocked",
      reason: blockedReason
    }
  },
  guardrails: methods.guardrails || [],
  audit: {
    generated_at: new Date().toISOString(),
    generated_by: "scripts/subscriber-guidance-engine.js",
    public_display_allowed: false,
    subscriber_display_allowed: false
  }
};

if (out) {
  writeJson(out, result);
  console.log(`Wrote ${out}`);
} else {
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}
