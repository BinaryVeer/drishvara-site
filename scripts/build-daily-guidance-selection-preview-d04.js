import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => {
  fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + "\n", "utf8");
};

const schema = readJson("data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json");
const examples = readJson("data/knowledge/daily-guidance/daily-guidance-rule-examples-d03.json");
const wordBank = readJson("data/knowledge/daily-guidance/word-of-day-bank-d02.json");

const rules = examples.items || [];
const words = wordBank.items || [];

const previewInputs = [
  {
    preview_id: "preview-saturday-reflection",
    weekday: "Saturday",
    word_id: "reflection"
  },
  {
    preview_id: "preview-word-theme-reflection",
    weekday: "Tuesday",
    word_id: "reflection"
  },
  {
    preview_id: "preview-fallback-balance",
    weekday: "Thursday",
    word_id: "balance"
  }
];

function findWord(wordId) {
  return words.find((item) => item.id === wordId);
}

function selectRule(input) {
  const word = findWord(input.word_id);

  const weekdayRule = rules.find((rule) =>
    rule.rule_type === "day" &&
    rule.input_conditions?.weekday === input.weekday
  );

  if (weekdayRule) return { rule: weekdayRule, reason: "exact weekday match", word };

  const wordRule = rules.find((rule) =>
    rule.rule_type === "word_theme" &&
    word &&
    rule.input_conditions?.word_theme === word.theme
  );

  if (wordRule) return { rule: wordRule, reason: "word_theme match", word };

  const fallback = rules.find((rule) => rule.rule_type === "fallback");
  return { rule: fallback, reason: "fallback neutral guidance", word };
}

const items = previewInputs.map((input) => {
  const selected = selectRule(input);
  const rule = selected.rule;
  const word = selected.word;

  return {
    preview_id: input.preview_id,
    preview_only: true,
    live_output_enabled: false,
    input_context: {
      weekday: input.weekday,
      word_id: input.word_id,
      word_theme: word?.theme || null
    },
    selected_rule_id: rule?.rule_id || null,
    selection_reason: selected.reason,
    selected_word: word ? {
      id: word.id,
      word_en: word.word_en,
      word_hi: word.word_hi,
      word_sanskrit: word.word_sanskrit,
      theme: word.theme,
      review_status: word.review_status
    } : null,
    guidance_preview: rule ? {
      title_en: rule.output_fields.guidance_title_en,
      title_hi: rule.output_fields.guidance_title_hi,
      text_en: rule.output_fields.guidance_text_en,
      text_hi: rule.output_fields.guidance_text_hi,
      recommended_action_en: rule.output_fields.recommended_action_en,
      recommended_action_hi: rule.output_fields.recommended_action_hi,
      avoidance_note_en: rule.output_fields.avoidance_note_en,
      avoidance_note_hi: rule.output_fields.avoidance_note_hi,
      tone: rule.output_fields.tone,
      review_status: rule.output_fields.review_status,
      source_basis: rule.output_fields.source_basis
    } : null
  };
});

const output = {
  version: "2026.05.03-d04",
  module: "knowledge.daily_guidance_selection_preview",
  status: "preview_not_live",
  public_dynamic_output_enabled: false,
  selection_preview_live_enabled: false,
  generated_from: [
    "data/knowledge/daily-guidance/daily-guidance-rule-schema-d03.json",
    "data/knowledge/daily-guidance/daily-guidance-rule-examples-d03.json",
    "data/knowledge/daily-guidance/word-of-day-bank-d02.json"
  ],
  validation_basis: {
    allowed_rule_types: schema.allowed_rule_types,
    allowed_tones: schema.allowed_tones,
    review_status_values: schema.review_status_values
  },
  items
};

writeJson("data/knowledge/daily-guidance/daily-guidance-selection-preview-d04.json", output);

console.log(`D04 selection preview built. Preview items: ${items.length}`);
