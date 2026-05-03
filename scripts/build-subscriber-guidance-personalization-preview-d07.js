import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => {
  fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + "\n", "utf8");
};

const schema = readJson("data/knowledge/subscribers/subscriber-guidance-personalization-schema-d07.json");
const dailyRules = readJson("data/knowledge/daily-guidance/daily-guidance-rule-examples-d03.json");
const words = readJson("data/knowledge/daily-guidance/word-of-day-bank-d02.json");
const mantras = readJson("data/knowledge/sanatan/mantra-review-preview-d06.json");

const fallbackRule = (dailyRules.items || []).find((item) => item.rule_type === "fallback");
const word = (words.items || []).find((item) => item.id === "reflection") || (words.items || [])[0];
const mantra = (mantras.items || [])[0];

const previewItem = {
  preview_id: "subscriber-guidance-preview-synthetic-01",
  preview_only: true,
  live_output_enabled: false,
  subscriber_guidance_live_enabled: false,
  premium_guidance_enabled: false,
  auth_required_but_not_enabled: true,
  subscription_gate_required_but_not_enabled: true,
  input_context: {
    synthetic_profile: true,
    subscriber_id: "synthetic-preview-only",
    timezone: "Asia/Kolkata",
    preferred_language: "en",
    birth_context_used: false,
    profile_storage_used: false
  },
  output_preview: {
    daily_reflection_en: fallbackRule?.output_fields?.guidance_text_en || "Keep the day simple, clear and steady.",
    daily_reflection_hi: fallbackRule?.output_fields?.guidance_text_hi || "दिन को सरल, स्पष्ट और स्थिर रखें।",
    what_to_do_en: fallbackRule?.output_fields?.recommended_action_en || "Choose one meaningful task.",
    what_to_do_hi: fallbackRule?.output_fields?.recommended_action_hi || "एक सार्थक कार्य चुनें।",
    what_not_to_do_en: fallbackRule?.output_fields?.avoidance_note_en || "Avoid scattered attention.",
    what_not_to_do_hi: fallbackRule?.output_fields?.avoidance_note_hi || "बिखरे हुए ध्यान से बचें।",
    word_of_day: word ? {
      id: word.id,
      word_en: word.word_en,
      word_hi: word.word_hi,
      word_sanskrit: word.word_sanskrit,
      review_status: word.review_status
    } : null,
    mantra: mantra ? {
      mantra_id: mantra.mantra_id,
      sanskrit_text: mantra.sanskrit_text,
      review_status: mantra.review_status,
      live_output_enabled: false
    } : null
  },
  blocked_unlocks: [
    "premium guidance",
    "birth chart processing",
    "subscriber profile read",
    "Supabase query",
    "payment entitlement"
  ]
};

const output = {
  version: "2026.05.03-d07",
  module: "knowledge.subscriber_guidance_personalization_preview",
  status: "preview_not_live",
  subscriber_guidance_live_enabled: false,
  premium_guidance_enabled: false,
  personalized_output_enabled: false,
  supabase_enabled: false,
  auth_enabled: false,
  generated_from: [
    "data/knowledge/subscribers/subscriber-guidance-personalization-schema-d07.json",
    "data/knowledge/daily-guidance/daily-guidance-rule-examples-d03.json",
    "data/knowledge/daily-guidance/word-of-day-bank-d02.json",
    "data/knowledge/sanatan/mantra-review-preview-d06.json"
  ],
  schema_sections: schema.future_output_sections,
  items: [previewItem]
};

writeJson("data/knowledge/subscribers/subscriber-guidance-personalization-preview-d07.json", output);

console.log("D07 subscriber personalization preview built. Preview items: 1");
