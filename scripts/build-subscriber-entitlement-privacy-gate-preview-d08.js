import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => {
  fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + "\n", "utf8");
};

const gateSchema = readJson("data/knowledge/subscribers/subscriber-entitlement-privacy-gate-d08.json");

const scenarios = [
  {
    scenario_id: "anonymous-user",
    authenticated_session: false,
    subscriber_profile_exists: false,
    explicit_consent_active: false,
    subscription_entitlement_active: false,
    privacy_safe_inputs_available: false,
    approved_guidance_rules_available: false
  },
  {
    scenario_id: "logged-in-no-subscription",
    authenticated_session: true,
    subscriber_profile_exists: true,
    explicit_consent_active: true,
    subscription_entitlement_active: false,
    privacy_safe_inputs_available: true,
    approved_guidance_rules_available: true
  },
  {
    scenario_id: "future-valid-subscriber-preview",
    authenticated_session: true,
    subscriber_profile_exists: true,
    explicit_consent_active: true,
    subscription_entitlement_active: true,
    privacy_safe_inputs_available: true,
    approved_guidance_rules_available: true
  }
];

function evaluateScenario(scenario) {
  const gates = gateSchema.future_gate_sequence.map((gate) => {
    const passed = Boolean(scenario[gate.gate]);
    return {
      gate: gate.gate,
      required: gate.required,
      enabled_now: gate.enabled_now,
      passed,
      failure_state: passed ? null : gate.failure_state
    };
  });

  const firstBlocked = gates.find((gate) => gate.required && !gate.passed);

  return {
    scenario_id: scenario.scenario_id,
    preview_only: true,
    live_output_enabled: false,
    auth_enabled: false,
    supabase_enabled: false,
    payment_enabled: false,
    premium_guidance_enabled: false,
    subscriber_guidance_live_enabled: false,
    gate_result: firstBlocked ? "blocked" : "would_pass_in_future_after_activation",
    first_blocking_gate: firstBlocked?.gate || null,
    failure_state: firstBlocked?.failure_state || null,
    gates
  };
}

const output = {
  version: "2026.05.03-d08",
  module: "knowledge.subscriber_entitlement_privacy_gate_preview",
  status: "preview_not_live",
  auth_enabled: false,
  supabase_enabled: false,
  payment_enabled: false,
  subscription_gate_live_enabled: false,
  entitlement_check_live_enabled: false,
  subscriber_guidance_live_enabled: false,
  premium_guidance_enabled: false,
  generated_from: [
    "data/knowledge/subscribers/subscriber-entitlement-privacy-gate-d08.json"
  ],
  items: scenarios.map(evaluateScenario)
};

writeJson("data/knowledge/subscribers/subscriber-entitlement-privacy-gate-preview-d08.json", output);

console.log(`D08 entitlement/privacy gate preview built. Preview scenarios: ${output.items.length}`);
