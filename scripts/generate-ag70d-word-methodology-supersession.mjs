import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
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

const ag70c = readJson("data/content-intelligence/quality-reviews/ag70c-sanskrit-lexical-engine-data-model.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag70c-ag70d-word-methodology-supersession-readiness-record.json");
const panchangConnector = readJson("data/knowledge-base/panchang-festival/production/panchang-to-word-context-connector.json");
const lexicalManifest = readJson("data/knowledge-base/word-of-day/production/lexical-engine/lexical-engine-manifest.json");
const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70c.status !== "ag70c_sanskrit_lexical_engine_data_model_completed") {
  throw new Error("AG70C must be complete before AG70D.");
}
if (readiness.ready_for_ag70d !== true) {
  throw new Error("AG70D readiness missing.");
}
if (panchangConnector.status !== "panchang_to_word_context_connector_defined_not_runtime_active") {
  throw new Error("Panchang-to-Word connector missing.");
}
if (lexicalManifest.status !== "sanskrit_lexical_engine_manifest_created_no_runtime_activation") {
  throw new Error("Lexical engine manifest missing.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  methodologyV2: "data/knowledge-base/word-of-day/production/methodology/ag70d-word-of-the-day-methodology-v2.json",
  legacySupersessionMap: "data/knowledge-base/word-of-day/production/methodology/ag70d-legacy-methodology-supersession-map.json",
  selectionFlowV2: "data/knowledge-base/word-of-day/production/methodology/ag70d-selection-flow-v2.json",
  primaryLexicalRules: "data/knowledge-base/word-of-day/production/methodology/ag70d-primary-lexical-selection-rules.json",
  fallbackRules: "data/knowledge-base/word-of-day/production/methodology/ag70d-sacred-fallback-selection-rules.json",
  duplicateHistoryRules: "data/knowledge-base/word-of-day/production/methodology/ag70d-duplicate-control-and-history-rules.json",
  subscriberArchiveModel: "data/knowledge-base/word-of-day/production/methodology/ag70d-subscriber-archive-access-model.json",
  oldMethodologyPreservation: "data/knowledge-base/word-of-day/production/methodology/ag70d-old-methodology-preservation-audit.json",
  noOutputMutationAudit: "data/knowledge-base/word-of-day/production/methodology/ag70d-no-output-ui-runtime-mutation-audit.json",
  wordManifest: "data/knowledge-base/word-of-day/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70d-word-methodology-supersession.json",
  readiness: "data/content-intelligence/quality-registry/ag70d-ag70e-word-production-knowledge-bank-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70d-to-ag70e-word-production-knowledge-bank-boundary.json",
  quality: "data/quality/ag70d-word-methodology-supersession.json",
  preview: "data/quality/ag70d-word-methodology-supersession-preview.json",
  doc: "docs/quality/AG70D_WORD_METHODOLOGY_SUPERSESSION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const methodologyV2 = {
  module_id: "AG70D",
  title: "Word of the Day Methodology v2",
  status: "word_methodology_v2_supersession_defined_not_runtime_active",
  active_methodology_version: "word_of_day_method_v2_panchang_context_sanskrit_lexical_engine",
  supersedes_runtime_methodology_versions: [
    "word_of_day_method_v1",
    "ag63a_rotation_preview_method",
    "d02_static_preview_rotation_policy"
  ],
  runtime_selector_active_now: false,
  public_word_generation_allowed_now: false,
  generated_output_mutation_now: false,
  ui_mutation_now: false,
  purpose: "Replace the old rotation/preview method with a Panchang-context-driven Sanskrit lexical selection method.",
  method_summary: [
    "Panchang engine produces day context from Tithi, Nakshatra, Yoga, Karana, Paksha, Vara and festival/observance context.",
    "Context interpretation layer converts Panchang data into reviewable interpretive signals.",
    "Morphology engine identifies possible Sanskrit forms, roots, stems and valid forms from sourced lexical knowledge.",
    "Etymology engine provides sourced derivational/historical background where established.",
    "Semantics engine defines exact meaning, semantic range, usage boundary and reflective sense.",
    "Primary selection uses approved lexical records only.",
    "If etymology or derivation is not established, the method must not fabricate; it routes to approved sacred fallback banks where appropriate.",
    "Duplicate control checks date-wise published/suggested history before final output.",
    "The selected word is saved date-wise for public current-day display and future subscriber archive browsing."
  ],
  hard_rules: [
    "No AI-invented Sanskrit word.",
    "No unsupported etymology.",
    "No mantra creation or alteration.",
    "No raw candidate to public output.",
    "No public output without approved source/public-use status.",
    "No repeated publication without duplicate-control decision.",
    "No generated/word-of-day.json replacement until output connector gate is approved."
  ],
  dependencies: {
    panchang_context_connector: "data/knowledge-base/panchang-festival/production/panchang-to-word-context-connector.json",
    lexical_engine_manifest: "data/knowledge-base/word-of-day/production/lexical-engine/lexical-engine-manifest.json",
    morphology_schema: "data/knowledge-base/word-of-day/production/lexical-engine/morphology-engine-schema.json",
    etymology_schema: "data/knowledge-base/word-of-day/production/lexical-engine/etymology-engine-schema.json",
    semantics_schema: "data/knowledge-base/word-of-day/production/lexical-engine/semantics-engine-schema.json",
    fallback_schema: "data/knowledge-base/word-of-day/production/lexical-engine/sacred-fallback-bank-schema.json",
    daily_history_schema: "data/knowledge-base/word-of-day/production/daily-word-history-schema.json",
    subscriber_archive_schema: "data/knowledge-base/word-of-day/production/subscriber-word-archive-schema.json"
  }
};

const legacySupersessionMap = {
  module_id: "AG70D",
  title: "Legacy Word Methodology Supersession Map",
  status: "legacy_word_methodology_supersession_mapped_no_deletion",
  reason_for_no_deletion_now: "Discovery showed old Word/D02/AG48/AG63/AG69 files remain referenced by validators, preflights, current UI fallback or AG69K source-of-truth records. AG70D supersedes them as active methodology without deleting them.",
  legacy_files_preserved_as_reference: [
    {
      path: "data/methodology/word-of-day/ag63a-word-of-the-day-methodology.json",
      previous_role: "initial Word methodology",
      new_status_after_ag70d: "legacy_reference_superseded_by_method_v2"
    },
    {
      path: "data/methodology/word-of-day/ag63a-word-selection-rotation-policy.json",
      previous_role: "date/theme/repeat rotation policy",
      new_status_after_ag70d: "legacy_reference_superseded_by_panchang_lexical_selection"
    },
    {
      path: "data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json",
      previous_role: "D02 preview rotation policy",
      new_status_after_ag70d: "legacy_preview_reference_not_active_production_method"
    },
    {
      path: "data/knowledge-base/word-of-day/ag69e-word-selection-context-doctrine.json",
      previous_role: "selection context doctrine not active",
      new_status_after_ag70d: "merged_conceptually_into_method_v2_context_layer"
    },
    {
      path: "data/knowledge-base/word-of-day/ag69k-optimized-end-to-end-word-workflow.json",
      previous_role: "source-of-truth optimized workflow",
      new_status_after_ag70d: "retained_source_of_truth_consumed_by_method_v2"
    }
  ],
  deleted_now: [],
  output_files_preserved: [
    "generated/word-of-day.json",
    "index.html existing AG63B Word card wiring"
  ]
};

const selectionFlowV2 = {
  module_id: "AG70D",
  title: "Word Selection Flow v2",
  status: "word_selection_flow_v2_defined_not_runtime_active",
  runtime_selection_active_now: false,
  flow: [
    {
      step: 1,
      name: "panchang_day_context",
      input: "date + location + Panchang calculation/observance context",
      output: "Tithi, Nakshatra, Yoga, Karana, Paksha, Vara, festival/observance/theme context",
      runtime_active_now: false
    },
    {
      step: 2,
      name: "context_interpretation",
      input: "reviewed Panchang context",
      output: "combined_interpretive_signal and context tags",
      runtime_active_now: false
    },
    {
      step: 3,
      name: "morphology_engine",
      input: "combined_interpretive_signal",
      output: "possible Sanskrit forms/roots/stems/valid forms from sourced lexical records",
      runtime_active_now: false
    },
    {
      step: 4,
      name: "etymology_engine",
      input: "morphology candidate",
      output: "established / partially_established / not_established derivational status",
      runtime_active_now: false
    },
    {
      step: 5,
      name: "semantics_engine",
      input: "morphology + etymology candidate",
      output: "meaning, semantic range, usage boundary, reflective sense",
      runtime_active_now: false
    },
    {
      step: 6,
      name: "primary_or_fallback_selection",
      input: "approved lexical candidate or fallback candidate",
      output: "selected word candidate",
      runtime_active_now: false
    },
    {
      step: 7,
      name: "duplicate_control",
      input: "selected word candidate + daily history",
      output: "final eligible word or replacement candidate",
      runtime_active_now: false
    },
    {
      step: 8,
      name: "datewise_result_saving",
      input: "final eligible word",
      output: "daily word history record and subscriber archive candidate",
      runtime_active_now: false
    }
  ]
};

const primaryLexicalRules = {
  module_id: "AG70D",
  title: "Primary Lexical Selection Rules",
  status: "primary_lexical_selection_rules_defined_not_runtime_active",
  primary_selection_allowed_now: false,
  required_gates: [
    "approved_lexical_record_exists",
    "morphology_status_established_or_review_approved",
    "semantics_status_supported",
    "source_reference_ids_present",
    "public_use_permission_approved_for_output",
    "context_signal_match_reviewed",
    "duplicate_control_passed"
  ],
  etymology_handling: {
    established: "May include sourced etymology/derivation note in user-facing explanation.",
    partially_established: "May use only bounded note after review; no strong derivation claim.",
    not_established: "Do not fabricate. Route to fallback bank or semantic-only path only if separately approved.",
    blocked: "Reject candidate."
  },
  blocked: [
    "candidate_record_without_approval",
    "unsupported_etymology_claim",
    "semantic_expansion_without_source",
    "panchang_context_not_reviewed",
    "duplicate_word_without_repeat_control_override"
  ]
};

const fallbackRules = {
  module_id: "AG70D",
  title: "Sacred Fallback Selection Rules",
  status: "sacred_fallback_selection_rules_defined_not_runtime_active",
  fallback_selection_allowed_now: false,
  fallback_trigger_conditions: [
    "primary_etymology_not_established",
    "primary_morphology_blocked",
    "primary_semantic_match_too_weak",
    "primary_candidate_duplicate_blocked",
    "no_primary_candidate_available_for_context_signal"
  ],
  approved_fallback_bank_classes: [
    "vishnu_sahasranama_bank",
    "shiva_sahasranama_bank",
    "vedic_term_bank",
    "puranic_name_theme_bank",
    "approved_sanskrit_lexical_bank"
  ],
  fallback_required_gates: [
    "fallback_record_approved",
    "source_reference_ids_present",
    "meaning_supported",
    "public_use_permission_approved_for_output",
    "semantic_theme_match",
    "duplicate_control_passed"
  ],
  fallback_public_explanation_rule: "Explain the word/name from approved source and meaning support only. Do not invent etymology or scriptural interpretation."
};

const duplicateHistoryRules = {
  module_id: "AG70D",
  title: "Duplicate Control and Daily History Rules",
  status: "duplicate_control_and_history_rules_defined_not_runtime_active",
  duplicate_control_active_now: false,
  history_saving_active_now: false,
  history_schema: "data/knowledge-base/word-of-day/production/daily-word-history-schema.json",
  subscriber_archive_schema: "data/knowledge-base/word-of-day/production/subscriber-word-archive-schema.json",
  duplicate_check_order: [
    "exact selected_word_id",
    "sanskrit_form",
    "fallback_bank_record_id if applicable",
    "theme/repeat_control_tags within repeat window"
  ],
  replacement_rule: "If selected word was already published within the repeat-control window, select the next eligible approved candidate. If all candidates are repeated, choose least-recent eligible word and mark repeat_pressure=true.",
  daily_result_required_fields: [
    "date_key",
    "panchang_context_id",
    "selection_path",
    "selected_word_id",
    "sanskrit_form",
    "hindi_form",
    "english_gloss",
    "meaning_en",
    "meaning_hi",
    "source_bank_used",
    "etymology_status",
    "morphology_status",
    "semantic_status",
    "duplicate_check_status",
    "published_status"
  ]
};

const subscriberArchiveModel = {
  module_id: "AG70D",
  title: "Subscriber Archive Access Model",
  status: "subscriber_archive_access_model_defined_not_runtime_active",
  subscriber_archive_active_now: false,
  public_access_rule: "General users see only the current day's Word of the Day after publication gate.",
  subscriber_access_rule: "Subscribers may browse/search historical suggested/published Word records after access/backend/subscription layer is approved.",
  browse_dimensions: [
    "date_key",
    "word",
    "theme",
    "panchang_context",
    "selection_path",
    "source_bank_used"
  ],
  backend_dependency: "Deferred. No Supabase/Auth/subscription runtime activation in AG70D."
};

const oldMethodologyPreservation = {
  module_id: "AG70D",
  title: "Old Methodology Preservation Audit",
  status: "old_methodology_preserved_as_legacy_reference",
  preserved_not_deleted: true,
  reason: "Old files remain referenced by validators/preflights/current UI/source-of-truth records. They are superseded by AG70D but retained until a future validator/UI replacement stage.",
  preserved_paths: legacySupersessionMap.legacy_files_preserved_as_reference.map((item) => item.path)
};

const noOutputMutationAudit = {
  module_id: "AG70D",
  title: "No Output / UI / Runtime Mutation Audit",
  status: "no_output_ui_runtime_mutation_audit_passed",
  generated_word_json_modified: false,
  ui_display_changed: false,
  runtime_selector_active_now: false,
  public_word_generation_allowed_now: false,
  supabase_activation_performed: false,
  backend_runtime_activated: false,
  old_methodology_deleted_now: false
};

const updatedWordManifest = {
  ...wordManifest,
  status: "production_bank_manifest_created_word_methodology_v2_superseded",
  current_status: "word_methodology_v2_defined_no_runtime_activation",
  active_methodology_version: methodologyV2.active_methodology_version,
  methodology_v2_files: {
    methodology_v2: outputs.methodologyV2,
    legacy_supersession_map: outputs.legacySupersessionMap,
    selection_flow_v2: outputs.selectionFlowV2,
    primary_lexical_rules: outputs.primaryLexicalRules,
    fallback_rules: outputs.fallbackRules,
    duplicate_history_rules: outputs.duplicateHistoryRules,
    subscriber_archive_model: outputs.subscriberArchiveModel
  },
  current_counts: {
    ...(wordManifest.current_counts || {}),
    methodology_v2_records: 1,
    production_word_records: 0,
    generated_daily_word_records: 0
  },
  next_required_stage: "AG70E — Word Production Knowledge Bank Foundation"
};

const review = {
  module_id: "AG70D",
  title: "Word of the Day Methodology Supersession",
  status: "ag70d_word_methodology_supersession_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70c_review: "data/content-intelligence/quality-reviews/ag70c-sanskrit-lexical-engine-data-model.json",
    panchang_connector: "data/knowledge-base/panchang-festival/production/panchang-to-word-context-connector.json",
    lexical_engine_manifest: "data/knowledge-base/word-of-day/production/lexical-engine/lexical-engine-manifest.json"
  },
  generated_records: outputs,
  summary: {
    word_methodology_v2_created: true,
    old_rotation_method_superseded: true,
    old_methodology_files_deleted_now: false,
    legacy_supersession_map_created: true,
    selection_flow_v2_defined: true,
    primary_lexical_selection_rules_defined: true,
    fallback_selection_rules_defined: true,
    duplicate_history_rules_defined: true,
    subscriber_archive_model_defined: true,
    word_manifest_updated_with_methodology_v2: true,
    actual_lexical_records_created_now: false,
    actual_fallback_records_created_now: false,
    daily_word_records_created_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    runtime_selector_active_now: false,
    public_word_generation_allowed_now: false,
    supabase_activation_performed: false,
    backend_runtime_activated: false,
    ready_for_ag70e: true
  }
};

const nextReadiness = {
  module_id: "AG70D",
  title: "AG70E Word Production Knowledge Bank Foundation Readiness Record",
  status: "ready_for_ag70e_word_production_knowledge_bank_foundation",
  ready_for_ag70e: true,
  next_stage: "AG70E — Word Production Knowledge Bank Foundation",
  reason: "Word methodology v2 now defines the Panchang-context and Sanskrit lexical-engine selection path. The next stage can create actual production knowledge-bank records according to the new method."
};

const boundary = {
  module_id: "AG70D",
  title: "AG70D to AG70E Word Production Knowledge Bank Foundation Boundary",
  status: "ag70e_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create first production knowledge-bank structure/records required by Methodology v2.",
    "Create context interpretation records only with source/review status.",
    "Create lexical/fallback candidate records only where evidence/source fields are present.",
    "Keep public output blocked until approved output gate."
  ],
  blocked_scope_without_explicit_approval: [
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "runtime selector activation",
    "Supabase/database writes",
    "backend/Auth activation",
    "AI-fabricated Sanskrit or meaning records",
    "unsupported etymology",
    "public Word output"
  ]
};

const quality = {
  module_id: "AG70D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70D",
  status: review.status,
  word_methodology_v2_created: 1,
  old_rotation_method_superseded: 1,
  old_methodology_files_deleted_now: 0,
  selection_flow_v2_defined: 1,
  fallback_selection_rules_defined: 1,
  duplicate_history_rules_defined: 1,
  subscriber_archive_model_defined: 1,
  actual_lexical_records_created_now: 0,
  generated_word_json_modified: 0,
  ui_display_changed: 0,
  runtime_selector_active_now: 0,
  ready_for_ag70e: 1
};

const doc = `# AG70D — Word of the Day Methodology Supersession

AG70D supersedes the earlier Word rotation/preview method with Word of the Day Methodology v2.

## New active method

Panchang context → contextual interpretation → Morphology Engine → Etymology Engine → Semantics Engine → primary lexical selection or sacred fallback → duplicate check → date-wise saved Word output → subscriber archive later.

## Superseded

The old AG63/D02 rotation-preview method is no longer the intended production methodology. It remains preserved as legacy/reference because discovery showed validator, preflight, UI, and source-of-truth dependencies.

## Not changed

- No generated/word-of-day.json replacement.
- No homepage UI change.
- No runtime selector activation.
- No Supabase/backend activation.
- No actual Sanskrit lexical records.
- No public Word output.
`;

writeJson(outputs.methodologyV2, methodologyV2);
writeJson(outputs.legacySupersessionMap, legacySupersessionMap);
writeJson(outputs.selectionFlowV2, selectionFlowV2);
writeJson(outputs.primaryLexicalRules, primaryLexicalRules);
writeJson(outputs.fallbackRules, fallbackRules);
writeJson(outputs.duplicateHistoryRules, duplicateHistoryRules);
writeJson(outputs.subscriberArchiveModel, subscriberArchiveModel);
writeJson(outputs.oldMethodologyPreservation, oldMethodologyPreservation);
writeJson(outputs.noOutputMutationAudit, noOutputMutationAudit);
writeJson(outputs.wordManifest, updatedWordManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, nextReadiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70D Word methodology supersession generated.");
console.log("✅ Methodology v2 defined and old rotation method superseded as legacy/reference.");
console.log("✅ No output/UI/runtime/backend mutation performed.");
