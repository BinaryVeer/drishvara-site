import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "implementation", "i02-feature-flag-environment-boundary-plan.json");
const outPath = path.join(root, "data", "implementation", "i02-feature-flag-environment-boundary-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

const featureFlags = registry.required_future_flags.map((flag) => ({
  flag_key: flag.flag_key,
  family: flag.family,
  default_value: false,
  current_i02_value: false,
  allowed_values: [false, true],
  runtime_exposure: "blocked_in_i02",
  public_output_allowed: false,
  subscriber_output_allowed: false,
  approval_gate: flag.approval_gate,
  rollback_behavior: "force_false",
  audit_note: "Planning-only flag; no runtime evaluator exists in I02."
}));

const familyCounts = {};
for (const flag of featureFlags) {
  familyCounts[flag.family] = (familyCounts[flag.family] || 0) + 1;
}

const output = {
  preview_id: "I02_FEATURE_FLAG_ENVIRONMENT_BOUNDARY_PREVIEW",
  module_id: "I02",
  status: "preview_only_no_runtime_flags_or_env_files",
  preview_only: true,
  feature_flags: featureFlags,
  environment_variable_categories: registry.environment_variable_categories,
  environment_boundary_rules: registry.environment_boundary_rules,
  protected_environment_file_names: registry.protected_environment_file_names,
  future_keys_not_created: {
    supabase: registry.future_supabase_environment_keys_not_created,
    auth: registry.future_auth_environment_keys_not_created,
    payment: registry.future_payment_environment_keys_not_created,
    api: registry.future_api_environment_keys_not_created
  },
  future_flag_evaluation_inputs: registry.future_flag_evaluation_inputs,
  future_safe_mode_forces_off: registry.future_safe_mode_forces_off,
  summary: {
    feature_flag_count: featureFlags.length,
    family_counts: familyCounts,
    flags_true_count: 0,
    flags_false_count: featureFlags.length,
    env_files_created_count: 0,
    secrets_created_count: 0,
    secrets_read_count: 0,
    runtime_evaluator_created: false,
    public_output_enabled: false,
    subscriber_output_enabled: false,
    supabase_enabled: false,
    auth_enabled: false,
    payment_enabled: false,
    ml_enabled: false,
    embedding_enabled: false,
    external_api_fetch_enabled: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${featureFlags.length} future feature flags, all false.`);
