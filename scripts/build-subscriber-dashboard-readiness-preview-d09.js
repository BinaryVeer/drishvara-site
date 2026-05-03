import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => {
  fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + "\n", "utf8");
};

const matrix = readJson("data/knowledge/subscribers/subscriber-dashboard-readiness-matrix-d09.json");
const gatePreview = readJson("data/knowledge/subscribers/subscriber-entitlement-privacy-gate-preview-d08.json");

const gateScenarios = gatePreview.items || [];
const cards = matrix.dashboard_cards || [];

const items = gateScenarios.map((scenario) => {
  const passedGates = new Set((scenario.gates || []).filter((gate) => gate.passed).map((gate) => gate.gate));

  const cardReadiness = cards.map((card) => {
    const missingGates = (card.required_gates || []).filter((gate) => !passedGates.has(gate));
    const readiness = card.enabled_now
      ? "unexpected_enabled"
      : missingGates.length
        ? "blocked_by_gate"
        : "preview_ready_future_activation_only";

    return {
      card_id: card.card_id,
      title: card.title,
      enabled_now: false,
      live_data_enabled: false,
      future_source: card.future_source,
      current_state: card.current_state,
      required_gates: card.required_gates,
      missing_gates: missingGates,
      readiness
    };
  });

  return {
    scenario_id: scenario.scenario_id,
    preview_only: true,
    dashboard_live_data_enabled: false,
    subscriber_guidance_live_enabled: false,
    premium_guidance_enabled: false,
    auth_enabled: false,
    supabase_enabled: false,
    payment_enabled: false,
    source_gate_result: scenario.gate_result,
    first_blocking_gate: scenario.first_blocking_gate,
    cards: cardReadiness
  };
});

const output = {
  version: "2026.05.03-d09",
  module: "knowledge.subscriber_dashboard_readiness_preview",
  status: "preview_not_live",
  dashboard_live_data_enabled: false,
  subscriber_guidance_live_enabled: false,
  premium_guidance_enabled: false,
  auth_enabled: false,
  supabase_enabled: false,
  payment_enabled: false,
  generated_from: [
    "data/knowledge/subscribers/subscriber-dashboard-readiness-matrix-d09.json",
    "data/knowledge/subscribers/subscriber-entitlement-privacy-gate-preview-d08.json"
  ],
  items
};

writeJson("data/knowledge/subscribers/subscriber-dashboard-readiness-preview-d09.json", output);

console.log(`D09 subscriber dashboard readiness preview built. Scenarios: ${items.length}; Cards per scenario: ${cards.length}`);
