import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}
function walk(dir, out = []) {
  const abs = full(dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
function discover(keywords, limit = 80) {
  const files = walk("data").concat(walk("docs"), walk("scripts"))
    .filter((p) => /\.(json|md|mjs|js|html)$/i.test(p));
  const lowerKeywords = keywords.map((x) => x.toLowerCase());
  return files
    .filter((p) => lowerKeywords.some((k) => p.toLowerCase().includes(k)))
    .sort()
    .slice(0, limit);
}

const ag69kReview = readJson("data/content-intelligence/quality-reviews/ag69k-word-asset-logic-alignment-end-to-end-path-optimization.json");
const ag69kWorkflow = readJson("data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag69kReview.status !== "ag69k_word_asset_logic_alignment_end_to_end_path_optimization_completed") {
  throw new Error("AG69K source-of-truth checkpoint is required before AG70A.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive while production banks are being created.");
}

const outputs = {
  registry: "data/knowledge-base/production-data-bank-registry/ag70a-module-production-data-bank-registry.json",
  connectorMap: "data/knowledge-base/production-data-bank-registry/ag70a-methodology-to-databank-connector-map.json",
  lifecycle: "data/knowledge-base/production-data-bank-registry/ag70a-common-production-bank-lifecycle.json",
  schemaContract: "data/knowledge-base/production-data-bank-registry/ag70a-production-record-schema-contract.json",
  targetPlan: "data/knowledge-base/production-data-bank-registry/ag70a-production-bank-target-plan.json",
  validationPlan: "data/knowledge-base/production-data-bank-registry/ag70a-production-bank-validation-plan.json",
  review: "data/content-intelligence/quality-reviews/ag70a-module-production-data-bank-registry.json",
  readiness: "data/content-intelligence/quality-registry/ag70a-ag70b-word-production-data-bank-batch-01-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70a-to-ag70b-word-production-data-bank-batch-01-boundary.json",
  quality: "data/quality/ag70a-module-production-data-bank-registry.json",
  preview: "data/quality/ag70a-module-production-data-bank-registry-preview.json",
  doc: "docs/quality/AG70A_MODULE_PRODUCTION_DATA_BANK_REGISTRY.md"
};

const modules = [
  {
    module_id: "word_of_day",
    title: "Word of the Day",
    slug: "word-of-day",
    production_path: "data/knowledge-base/word-of-day/production",
    methodology_keywords: ["word-of-day", "word_of_day", "word-reflection", "ag69k", "ag63a"],
    minimum_target: 108,
    next_stage: "AG70B — Word of the Day Production Data Bank Batch 01",
    required_record_fields: [
      "word_id", "english", "hindi", "sanskrit", "meaning_en", "meaning_hi",
      "source_reference_ids", "evidence_status", "claim_level", "review_status",
      "public_use_permission", "approved_for_selector", "theme_tags", "repeat_control_tags"
    ],
    output_target: "generated/word-of-day.json",
    ui_surface: "existing homepage Word of the Day card"
  },
  {
    module_id: "today_vedic_guidance",
    title: "Today's Vedic Guidance",
    slug: "vedic-guidance",
    production_path: "data/knowledge-base/vedic-guidance/production",
    methodology_keywords: ["vedic-guidance", "daily-guidance", "mantra", "sutra", "ad06"],
    minimum_target: 108,
    next_stage: "Future AG70 series — Vedic Guidance Production Bank Batch 01",
    required_record_fields: [
      "guidance_id", "theme", "title", "guidance_text_en", "guidance_text_hi",
      "source_reference_ids", "claim_level", "review_status", "public_use_permission",
      "mantra_alteration_blocked", "approved_for_output"
    ],
    output_target: "to_be_confirmed_in_module_connector",
    ui_surface: "Today's Vedic Guidance surface"
  },
  {
    module_id: "panchang_festival_view",
    title: "Panchang & Festival View",
    slug: "panchang-festival",
    production_path: "data/knowledge-base/panchang-festival/production",
    methodology_keywords: ["panchang", "festival", "observance", "ag64", "ag47z"],
    minimum_target: 1,
    target_note: "Minimum target means one complete yearly rule/observance bank, not one record.",
    next_stage: "Future AG70 series — Panchang/Festival Production Rule Bank",
    required_record_fields: [
      "observance_id", "name_en", "name_hi", "observance_type", "rule_basis",
      "regional_variation", "source_reference_ids", "astronomical_calculation_status",
      "editorial_note", "review_status", "public_use_permission"
    ],
    output_target: "to_be_confirmed_in_module_connector",
    ui_surface: "Panchang/Festival surface"
  },
  {
    module_id: "upcoming_observance",
    title: "Upcoming Observance",
    slug: "upcoming-observance",
    production_path: "data/knowledge-base/upcoming-observance/production",
    methodology_keywords: ["upcoming", "observance", "festival", "calendar"],
    minimum_target: 1,
    target_note: "Minimum target means one complete rolling observance calendar bank.",
    next_stage: "Future AG70 series — Upcoming Observance Bank",
    required_record_fields: [
      "observance_id", "display_date_rule", "name_en", "name_hi", "summary_en",
      "summary_hi", "source_reference_ids", "regional_variation", "review_status",
      "public_use_permission", "approved_for_output"
    ],
    output_target: "to_be_confirmed_in_module_connector",
    ui_surface: "Upcoming Observance surface"
  },
  {
    module_id: "first_light_daily_signals",
    title: "First Light / Daily Signals",
    slug: "first-light",
    production_path: "data/knowledge-base/first-light/production",
    methodology_keywords: ["first-light", "daily-surface", "homepage", "ag23", "ag24"],
    minimum_target: 90,
    next_stage: "Future AG70 series — First Light Signal Bank",
    required_record_fields: [
      "signal_id", "signal_type", "title", "summary", "source_reference_ids",
      "selection_tags", "review_status", "public_use_permission", "approved_for_output"
    ],
    output_target: "to_be_confirmed_in_module_connector",
    ui_surface: "Homepage First Light / daily surface"
  },
  {
    module_id: "sports_desk",
    title: "Sports Desk",
    slug: "sports-desk",
    production_path: "data/knowledge-base/sports-desk/production",
    methodology_keywords: ["sports", "sports-desk", "archive", "ag68"],
    minimum_target: 1,
    target_note: "Minimum target means one structured source/event/archive bank, not one record.",
    next_stage: "Future AG70 series — Sports Archive Data Bank",
    required_record_fields: [
      "sports_record_id", "sport", "event_name", "date_key", "source_reference_ids",
      "context_note", "archive_status", "review_status", "public_use_permission",
      "approved_for_output"
    ],
    output_target: "to_be_confirmed_in_module_connector",
    ui_surface: "Sports Desk surface"
  },
  {
    module_id: "star_reflection",
    title: "Star Reflection",
    slug: "star-reflection",
    production_path: "data/knowledge-base/star-reflection/production",
    methodology_keywords: ["star-reflection", "reflection", "ag66", "ad06"],
    minimum_target: 108,
    next_stage: "Future AG70 series — Star Reflection Prompt Bank",
    required_record_fields: [
      "reflection_id", "theme", "prompt_en", "prompt_hi", "consent_safe_status",
      "deterministic_claim_blocked", "source_reference_ids", "review_status",
      "public_use_permission", "approved_for_output"
    ],
    output_target: "to_be_confirmed_in_module_connector",
    ui_surface: "Star Reflection surface"
  },
  {
    module_id: "psychometric_assessment",
    title: "Psychometric Assessment",
    slug: "psychometric-assessment",
    production_path: "data/knowledge-base/psychometric-assessment/production",
    methodology_keywords: ["psychometric", "assessment", "model", "question", "score"],
    minimum_target: 1,
    target_note: "Minimum target means one validated assessment model/question/scoring bank.",
    next_stage: "Future AG70 series — Psychometric Assessment Bank",
    required_record_fields: [
      "item_id", "construct", "question_text", "response_scale", "scoring_rule",
      "interpretation_boundary", "validation_status", "privacy_status",
      "review_status", "approved_for_assessment"
    ],
    output_target: "to_be_confirmed_in_module_connector",
    ui_surface: "Assessment surface"
  }
];

const lifecycle = {
  module_id: "AG70A",
  title: "Common Production Bank Lifecycle",
  status: "common_production_bank_lifecycle_defined",
  lifecycle: [
    {
      stage: "candidate",
      meaning: "Record exists in the module bank but is not yet trusted for public-facing output.",
      output_eligible: false
    },
    {
      stage: "reviewed",
      meaning: "Record has passed source/form/content review but is not yet approved for output.",
      output_eligible: false
    },
    {
      stage: "approved",
      meaning: "Record has passed source, safety, language, reuse and public-use checks.",
      output_eligible: true
    },
    {
      stage: "output_eligible",
      meaning: "Approved record can be consumed by the module methodology/selector after the module connector gate passes.",
      output_eligible: true
    }
  ],
  blocked_flow: [
    "raw_to_output",
    "ai_generated_to_output",
    "candidate_to_public",
    "reviewed_to_public_without_approval",
    "unsupported_source_claim_to_public"
  ]
};

const registryEntries = modules.map((mod) => {
  const methodology_sources = discover(mod.methodology_keywords, 60);
  const productionManifest = `${mod.production_path}/production-bank-manifest.json`;

  const manifest = {
    module_id: mod.module_id,
    title: `${mod.title} Production Bank Manifest`,
    status: "production_bank_manifest_created_empty_bank",
    production_path: mod.production_path,
    candidate_bank_path: `${mod.production_path}/candidate-bank.json`,
    reviewed_bank_path: `${mod.production_path}/reviewed-bank.json`,
    approved_bank_path: `${mod.production_path}/approved-bank.json`,
    source_map_path: `${mod.production_path}/source-map.json`,
    validator_config_path: `${mod.production_path}/validator-config.json`,
    minimum_production_target: mod.minimum_target,
    target_note: mod.target_note || null,
    current_counts: {
      candidate_records: 0,
      reviewed_records: 0,
      approved_records: 0,
      output_eligible_records: 0
    },
    methodology_sources_discovered: methodology_sources,
    required_record_fields: mod.required_record_fields,
    current_status: "structure_created_bank_not_filled",
    next_required_stage: mod.next_stage
  };

  writeJson(productionManifest, manifest);

  return {
    module_id: mod.module_id,
    title: mod.title,
    slug: mod.slug,
    production_bank_status: "structure_created_bank_not_filled",
    production_path: mod.production_path,
    production_manifest_path: productionManifest,
    candidate_bank_path: manifest.candidate_bank_path,
    reviewed_bank_path: manifest.reviewed_bank_path,
    approved_bank_path: manifest.approved_bank_path,
    source_map_path: manifest.source_map_path,
    validator_config_path: manifest.validator_config_path,
    methodology_sources_discovered: methodology_sources,
    methodology_source_count: methodology_sources.length,
    output_target: mod.output_target,
    ui_surface: mod.ui_surface,
    minimum_production_target: mod.minimum_target,
    target_note: mod.target_note || null,
    current_counts: manifest.current_counts,
    next_required_stage: mod.next_stage
  };
});

const registry = {
  module_id: "AG70A",
  title: "Module Production Data Bank Registry",
  status: "module_production_data_bank_registry_created",
  purpose: "Establish production data-bank source-of-truth paths for every Drishvara asset before content generation or UI consumption.",
  storage_mode_now: "github_static_json_first",
  supabase_mode_now: "deferred_not_active",
  public_output_mode_now: "unchanged",
  generated_output_mutation_now: false,
  ui_mutation_now: false,
  module_count: registryEntries.length,
  modules: registryEntries
};

const connectorMap = {
  module_id: "AG70A",
  title: "Methodology to Databank Connector Map",
  status: "methodology_to_databank_connector_map_created",
  connector_rule: "Each methodology may consume only its own approved production bank after validator success.",
  connectors: registryEntries.map((entry) => ({
    module_id: entry.module_id,
    methodology_sources: entry.methodology_sources_discovered,
    production_manifest_path: entry.production_manifest_path,
    production_approved_bank_path: entry.approved_bank_path,
    output_target: entry.output_target,
    ui_surface: entry.ui_surface,
    connector_status: "registered_not_runtime_active",
    runtime_consumption_allowed_now: false,
    next_required_stage: entry.next_required_stage
  }))
};

const schemaContract = {
  module_id: "AG70A",
  title: "Production Record Schema Contract",
  status: "production_record_schema_contract_created",
  common_required_fields: [
    "record_id",
    "module_id",
    "record_type",
    "source_reference_ids",
    "evidence_status",
    "review_status",
    "public_use_permission",
    "created_stage",
    "last_reviewed_stage"
  ],
  common_allowed_review_status: ["candidate", "reviewed", "approved", "blocked"],
  common_allowed_public_use_permission: ["not_allowed", "allowed_after_review", "approved_for_output"],
  module_specific_required_fields: Object.fromEntries(modules.map((mod) => [mod.module_id, mod.required_record_fields]))
};

const targetPlan = {
  module_id: "AG70A",
  title: "Production Bank Target Plan",
  status: "production_bank_target_plan_created",
  targets: modules.map((mod) => ({
    module_id: mod.module_id,
    minimum_production_target: mod.minimum_target,
    target_note: mod.target_note || null,
    first_fill_stage: mod.module_id === "word_of_day" ? "AG70B" : "future_AG70_series",
    current_approved_count: 0,
    target_met_now: false
  }))
};

const validationPlan = {
  module_id: "AG70A",
  title: "Production Bank Validation Plan",
  status: "production_bank_validation_plan_created",
  validator_strategy: [
    "Validate production manifest exists for every module.",
    "Validate candidate/reviewed/approved lifecycle paths exist in registry.",
    "Validate module-specific required fields are declared.",
    "Validate no module claims output eligibility before approved records exist.",
    "Validate generated output and UI remain unchanged during registry creation."
  ],
  first_operational_validator_next: "AG70B Word production bank validator"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const review = {
  module_id: "AG70A",
  title: "Module Production Data Bank Registry",
  status: "ag70a_module_production_data_bank_registry_completed",
  current_git_context: git,
  consumed_source_of_truth: {
    ag69k_review: "data/content-intelligence/quality-reviews/ag69k-word-asset-logic-alignment-end-to-end-path-optimization.json",
    ag69k_workflow: "data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json"
  },
  generated_records: outputs,
  summary: {
    module_registry_created: true,
    methodology_to_databank_connector_map_created: true,
    common_lifecycle_defined: true,
    schema_contract_created: true,
    target_plan_created: true,
    validation_plan_created: true,
    production_manifest_created_for_all_modules: true,
    module_count: registryEntries.length,
    github_static_json_storage_selected: true,
    supabase_activation_performed: false,
    production_content_records_created_now: false,
    word_production_bank_filled_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    runtime_selector_active_now: false,
    backend_runtime_activated: false,
    database_runtime_activated: false,
    ready_for_ag70b: true
  }
};

const readiness = {
  module_id: "AG70A",
  title: "AG70B Word Production Data Bank Batch 01 Readiness Record",
  status: "ready_for_ag70b_word_production_data_bank_batch_01",
  ready_for_ag70b: true,
  next_stage: "AG70B — Word of the Day Production Data Bank Batch 01",
  reason: "Production data-bank registry and Word production-bank path are created. AG70B can begin filling real sourced Word records."
};

const boundary = {
  module_id: "AG70A",
  title: "AG70A to AG70B Word Production Data Bank Batch 01 Boundary",
  status: "ag70b_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create Word of the Day production candidate/reviewed/approved bank Batch 01.",
    "Use sourced records only.",
    "Store production records under data/knowledge-base/word-of-day/production/.",
    "Validate required Word fields and public-use gates."
  ],
  blocked_scope_without_explicit_approval: [
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime selector activation",
    "Supabase/database writes",
    "backend/Auth activation",
    "AI-fabricated Sanskrit or meaning records",
    "unsupported etymology or scriptural claim"
  ]
};

const quality = {
  module_id: "AG70A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70A",
  status: review.status,
  module_count: registryEntries.length,
  production_manifest_created_for_all_modules: 1,
  methodology_to_databank_connector_map_created: 1,
  production_content_records_created_now: 0,
  word_production_bank_filled_now: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  supabase_activation_performed: 0,
  ready_for_ag70b: 1
};

const doc = `# AG70A — Module Production Data Bank Registry

AG70A establishes the production data-bank registry for Drishvara assets.

## Purpose

Each asset now has a declared production bank path, lifecycle, schema contract, target and connector mapping.

## Storage mode

GitHub static JSON first. Supabase remains deferred.

## Modules registered

${registryEntries.map((entry) => `- ${entry.title}: \`${entry.production_path}\``).join("\n")}

## What AG70A does

- Creates production bank manifests for all registered assets.
- Creates the methodology-to-databank connector map.
- Defines common candidate → reviewed → approved → output-eligible lifecycle.
- Defines module-level schema requirements.
- Defines production targets.
- Prepares AG70B for Word of the Day production bank filling.

## What AG70A does not do

- Does not create fabricated content.
- Does not fill production records.
- Does not change generated output.
- Does not change UI.
- Does not activate Supabase/backend/runtime.
`;

writeJson(outputs.registry, registry);
writeJson(outputs.connectorMap, connectorMap);
writeJson(outputs.lifecycle, lifecycle);
writeJson(outputs.schemaContract, schemaContract);
writeJson(outputs.targetPlan, targetPlan);
writeJson(outputs.validationPlan, validationPlan);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70A module production data-bank registry generated.");
console.log("✅ Production bank manifests created for all modules.");
console.log("✅ No production content, generated output, UI, Supabase or backend mutation performed.");
