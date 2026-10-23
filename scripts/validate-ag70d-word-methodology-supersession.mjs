import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70D validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70d-word-methodology-supersession.mjs",
  "scripts/validate-ag70d-word-methodology-supersession.mjs",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-word-of-the-day-methodology-v2.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-legacy-methodology-supersession-map.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-selection-flow-v2.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-primary-lexical-selection-rules.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-sacred-fallback-selection-rules.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-duplicate-control-and-history-rules.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-subscriber-archive-access-model.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-old-methodology-preservation-audit.json",
  "data/knowledge-base/word-of-day/production/methodology/ag70d-no-output-ui-runtime-mutation-audit.json",
  "data/content-intelligence/quality-reviews/ag70d-word-methodology-supersession.json",
  "data/content-intelligence/quality-registry/ag70d-ag70e-word-production-knowledge-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70d-to-ag70e-word-production-knowledge-bank-boundary.json",
  "data/quality/ag70d-word-methodology-supersession.json",
  "data/quality/ag70d-word-methodology-supersession-preview.json",
  "docs/quality/AG70D_WORD_METHODOLOGY_SUPERSESSION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70d"]) fail("Missing generate:ag70d script.");
if (!pkg.scripts?.["validate:ag70d"]) fail("Missing validate:ag70d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70d")) {
  fail("validate:project must include validate:ag70d.");
}

const methodology = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-word-of-the-day-methodology-v2.json");
if (methodology.status !== "word_methodology_v2_supersession_defined_not_runtime_active") fail("Methodology v2 status mismatch.");
if (methodology.active_methodology_version !== "word_of_day_method_v2_panchang_context_sanskrit_lexical_engine") fail("Active methodology version mismatch.");
if (methodology.runtime_selector_active_now !== false) fail("Runtime selector must be inactive.");
if (methodology.public_word_generation_allowed_now !== false) fail("Public word generation must be false.");
for (const dep of ["panchang_context_connector", "lexical_engine_manifest", "morphology_schema", "etymology_schema", "semantics_schema", "fallback_schema"]) {
  if (!methodology.dependencies?.[dep]) fail(`Methodology dependency missing: ${dep}`);
}
for (const rule of ["No AI-invented Sanskrit word.", "No unsupported etymology.", "No mantra creation or alteration."]) {
  if (!methodology.hard_rules.includes(rule)) fail(`Hard rule missing: ${rule}`);
}

const supersession = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-legacy-methodology-supersession-map.json");
if (supersession.status !== "legacy_word_methodology_supersession_mapped_no_deletion") fail("Legacy supersession status mismatch.");
if (!Array.isArray(supersession.deleted_now) || supersession.deleted_now.length !== 0) fail("AG70D must not delete old methodology files.");
for (const p of [
  "data/methodology/word-of-day/ag63a-word-of-the-day-methodology.json",
  "data/methodology/word-of-day/ag63a-word-selection-rotation-policy.json",
  "data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json"
]) {
  if (!exists(p)) fail(`Legacy file must be preserved: ${p}`);
}

const flow = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-selection-flow-v2.json");
if (flow.status !== "word_selection_flow_v2_defined_not_runtime_active") fail("Selection flow status mismatch.");
const flowNames = flow.flow.map((x) => x.name);
for (const name of ["panchang_day_context", "context_interpretation", "morphology_engine", "etymology_engine", "semantics_engine", "primary_or_fallback_selection", "duplicate_control", "datewise_result_saving"]) {
  if (!flowNames.includes(name)) fail(`Selection flow step missing: ${name}`);
}

const primary = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-primary-lexical-selection-rules.json");
if (primary.status !== "primary_lexical_selection_rules_defined_not_runtime_active") fail("Primary rules status mismatch.");
if (primary.primary_selection_allowed_now !== false) fail("Primary selection must be inactive.");
for (const gate of ["approved_lexical_record_exists", "morphology_status_established_or_review_approved", "semantics_status_supported", "duplicate_control_passed"]) {
  if (!primary.required_gates.includes(gate)) fail(`Primary gate missing: ${gate}`);
}
if (primary.etymology_handling.not_established !== "Do not fabricate. Route to fallback bank or semantic-only path only if separately approved.") {
  fail("not_established etymology handling mismatch.");
}

const fallback = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-sacred-fallback-selection-rules.json");
if (fallback.status !== "sacred_fallback_selection_rules_defined_not_runtime_active") fail("Fallback rules status mismatch.");
for (const bank of ["vishnu_sahasranama_bank", "shiva_sahasranama_bank", "vedic_term_bank", "puranic_name_theme_bank"]) {
  if (!fallback.approved_fallback_bank_classes.includes(bank)) fail(`Fallback bank class missing: ${bank}`);
}

const duplicate = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-duplicate-control-and-history-rules.json");
if (duplicate.status !== "duplicate_control_and_history_rules_defined_not_runtime_active") fail("Duplicate/history rules status mismatch.");
if (duplicate.duplicate_control_active_now !== false) fail("Duplicate control runtime must be inactive.");
for (const field of ["date_key", "panchang_context_id", "selection_path", "duplicate_check_status", "published_status"]) {
  if (!duplicate.daily_result_required_fields.includes(field)) fail(`Daily result field missing: ${field}`);
}

const policyPath = "data/knowledge-base/word-of-day/production/methodology/ag70d-duplicate-control-and-history-rules.json";
const amendmentBaseline = "78773a9919a53adca89204745cbdfc1b85517486";
const frozen = p => JSON.parse(execFileSync("git", ["show", amendmentBaseline + ":" + p], { encoding: "utf8" }));
assert.equal(duplicate.policy_version, "ag70d.word-selection.v2.1");
assert.equal(methodology.daily_selection_policy_version, duplicate.policy_version);
assert.equal(flow.daily_selection_policy_version, duplicate.policy_version);
assert.equal(methodology.daily_selection_policy_path, policyPath);
assert.equal(flow.daily_selection_policy_path, policyPath);
assert.equal(duplicate.policy_amendment.baseline, amendmentBaseline);
assert.equal(duplicate.policy_amendment.stage, "F3B-5");
assert.equal(duplicate.legacy_replacement_rule, frozen(policyPath).replacement_rule);
assert.equal(duplicate.legacy_rule_status, "least_recent_automatic_reuse_superseded_repeat_window_retained_only_as_additional_exclusion");
assert.equal(duplicate.publication_model.scope, "global_public_word");
assert.equal(duplicate.publication_model.timezone, "Asia/Kolkata");
assert.equal(methodology.publication_scope, duplicate.publication_model.scope);
assert.equal(methodology.publication_timezone, duplicate.publication_model.timezone);
assert.equal(duplicate.publication_model.day_boundary, "civil_midnight_not_panchang_sunrise");
assert.equal(duplicate.publication_model.one_lexical_identity_per_canonical_date, true);
assert.equal(duplicate.publication_model.same_identity_for_all_user_locations, true);
assert.equal(duplicate.publication_model.user_timezone_or_location_may_change_identity, false);
assert.deepEqual(duplicate.publication_model.representations_share_identity, ["Sanskrit", "Hindi", "English"]);
assert.deepEqual(duplicate.publication_model.assignment_key_fields, ["publication_scope", "date_key", "timezone"]);
assert.equal(duplicate.publication_model.canonical_context_basis_ref, null);
assert.equal(duplicate.approved_precedence_rule_ref, null);
assert.equal(duplicate.eligible_pool_rules.primary_approval_gates_path, "data/knowledge-base/word-of-day/production/methodology/ag70d-primary-lexical-selection-rules.json");
for (const key of ["withdrawn_revoked_or_superseded_records_excluded", "reviewed_identity_links_required", "reviewed_semantic_equivalence_links_required", "unresolved_duplicates_excluded_not_auto_merged", "context_must_be_canonical_not_user_specific", "active_reservations_and_assignments_block_duplicate_allocation", "unused_first", "semantic_equivalence_requires_human_review"]) assert.equal(duplicate.eligible_pool_rules[key], true);
assert.equal(duplicate.eligible_pool_rules.history_scope, "complete_governed_history_across_all_years");
assert.equal(duplicate.eligible_pool_rules.annual_reset_allowed, false);
assert.equal(duplicate.eligible_pool_rules.repeat_window_expiry_restores_used_identity, false);
assert.deepEqual(duplicate.selection_precedence, [
  "resolve_and_validate_canonical_ist_date_and_scope",
  "require_complete_governed_history_then_replay_existing_immutable_assignment_if_present",
  "require_policy_context_and_precedence_approval_references",
  "exclude_unapproved_withdrawn_revoked_superseded_out_of_scope_or_editorially_excluded_records",
  "exclude_unresolved_identity_or_semantic_equivalence_and_active_reservation_conflicts",
  "retain_never_before_published_canonical_identities_and_reviewed_equivalence_groups",
  "apply_compatible_repeat_window_exclusions_without_restoring_used_identities",
  "apply_existing_approved_relevance_quality_editorial_precedence_and_tie_rules_within_unused_pool",
  "atomically_reserve_date_and_identity_then_record_version_bound_assignment",
  "publish_only_after_separate_publication_gates_and_append_a_publication_event"
]);
assert.equal(duplicate.exhaustion_policy.initial_action, "withhold");
for (const key of ["automatic_reuse_allowed", "fabricated_fallback_allowed", "old_assignment_may_be_relabelled_as_new"]) assert.equal(duplicate.exhaustion_policy[key], false);
assert.equal(duplicate.exhaustion_policy.authorized_reuse_policy_ref, null);
assert.equal(duplicate.exhaustion_policy.reuse_requires_separate_explicit_authorization, true);
assert.equal(duplicate.exhaustion_policy.never_reuse_while_eligible_unused_remains, true);
assert.deepEqual(duplicate.exhaustion_policy.withheld_reason_codes, ["approved_bank_empty", "eligible_bank_empty", "no_unused_eligible_identity", "history_unavailable", "history_incomplete", "selection_rule_unavailable", "canonical_context_unavailable", "precedence_unresolved", "assignment_in_progress", "history_revision_conflict", "history_persistence_unavailable", "invalid_canonical_date"]);
const history = duplicate.history_contract;
assert.equal(history.base_schema_path, duplicate.history_schema);
assert.deepEqual(history.states, ["draft_reservation", "approved_assignment", "published", "corrective_publication", "cancelled_reservation", "withheld"]);
for (const key of ["existing_ag70e_bank_structures_unchanged", "unique_date_key_and_identity_reservation_required", "complete_history_and_compare_and_swap_revision_required", "atomic_single_writer_or_equivalent_required", "historical_replay_is_not_current_publication_permission", "approval_rechecked_before_publication", "published_records_immutable", "corrections_append_only"]) assert.equal(history[key], true);
assert.equal(history.history_writer_implemented, false);
assert.equal(history.idempotent_replay, "return_existing_assignment_snapshot_without_new_assignment_or_publication");
assert.deepEqual(history.additional_required_fields, ["timezone", "publication_scope", "canonical_lexical_identity_id", "approved_record_version", "approved_record_snapshot", "source_evidence_refs", "approval_record_refs", "selection_policy_version", "canonical_context_basis_ref", "context_snapshot_ref", "bank_snapshot_ref", "history_snapshot_ref", "eligibility_and_exclusion_trace", "assignment_timestamp", "publication_timestamp", "event_id", "event_type", "parent_event_refs", "supersession_refs", "correction_refs"]);
assert.deepEqual(duplicate.scale_contract.approved_word_checkpoints, [365, 730, 1825, 3650]);
assert.equal(duplicate.scale_contract.old_history_regeneration_required, false);
assert.equal(duplicate.scale_contract.new_approved_words_future_unassigned_dates_only, true);
assert.equal(duplicate.scale_contract.bulk_import_or_synthetic_population_authorized, false);

// Only selection/date/history clauses may differ from the accepted pre-amendment owners.
const oldMethodology = frozen("data/knowledge-base/word-of-day/production/methodology/ag70d-word-of-the-day-methodology-v2.json");
const preservedMethodology = structuredClone(methodology);
for (const key of ["daily_selection_policy_version", "daily_selection_policy_path", "publication_scope", "publication_timezone"]) delete preservedMethodology[key];
preservedMethodology.method_summary = [...oldMethodology.method_summary];
assert.deepEqual(preservedMethodology, oldMethodology);
assert.deepEqual(methodology.method_summary.slice(0, 7), oldMethodology.method_summary.slice(0, 7));
const oldFlow = frozen("data/knowledge-base/word-of-day/production/methodology/ag70d-selection-flow-v2.json");
const preservedFlow = structuredClone(flow);
delete preservedFlow.daily_selection_policy_version;
delete preservedFlow.daily_selection_policy_path;
for (const i of [0, 5, 6, 7]) {
  preservedFlow.flow[i].input = oldFlow.flow[i].input;
  preservedFlow.flow[i].output = oldFlow.flow[i].output;
}
assert.deepEqual(preservedFlow, oldFlow);
assert.deepEqual(readJson(history.base_schema_path), frozen(history.base_schema_path));
pass("F3B-5 canonical IST scope, unused-first precedence, exhaustion and immutable history contract are valid; no runtime activation.");

const archive = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-subscriber-archive-access-model.json");
if (archive.status !== "subscriber_archive_access_model_defined_not_runtime_active") fail("Subscriber archive status mismatch.");
if (archive.subscriber_archive_active_now !== false) fail("Subscriber archive must be inactive.");

const audit = readJson("data/knowledge-base/word-of-day/production/methodology/ag70d-no-output-ui-runtime-mutation-audit.json");
if (audit.status !== "no_output_ui_runtime_mutation_audit_passed") fail("No-output audit status mismatch.");
for (const key of ["generated_word_json_modified", "ui_display_changed", "runtime_selector_active_now", "public_word_generation_allowed_now", "supabase_activation_performed", "backend_runtime_activated", "old_methodology_deleted_now"]) {
  if (audit[key] !== false) fail(`${key} must be false.`);
}

const wordManifest = readJson("data/knowledge-base/word-of-day/production/production-bank-manifest.json");
const allowedWordManifestStatuses = [
  "production_bank_manifest_created_word_methodology_v2_superseded",
  "production_bank_manifest_created_word_production_knowledge_bank_foundation",
  "production_bank_manifest_created_sanskrit_lexical_source_reference_bank",
  "production_bank_manifest_created_sacred_fallback_source_bank"
];
if (!allowedWordManifestStatuses.includes(wordManifest.status)) fail("Word manifest status mismatch.");
if (wordManifest.active_methodology_version !== "word_of_day_method_v2_panchang_context_sanskrit_lexical_engine") fail("Word manifest active methodology mismatch.");

const review = readJson("data/content-intelligence/quality-reviews/ag70d-word-methodology-supersession.json");
if (review.status !== "ag70d_word_methodology_supersession_completed") fail("Review status mismatch.");

for (const key of [
  "word_methodology_v2_created",
  "old_rotation_method_superseded",
  "legacy_supersession_map_created",
  "selection_flow_v2_defined",
  "primary_lexical_selection_rules_defined",
  "fallback_selection_rules_defined",
  "duplicate_history_rules_defined",
  "subscriber_archive_model_defined",
  "word_manifest_updated_with_methodology_v2",
  "ready_for_ag70e"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}

for (const key of [
  "old_methodology_files_deleted_now",
  "actual_lexical_records_created_now",
  "actual_fallback_records_created_now",
  "daily_word_records_created_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "runtime_selector_active_now",
  "public_word_generation_allowed_now",
  "supabase_activation_performed",
  "backend_runtime_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const next = readJson("data/content-intelligence/quality-registry/ag70d-ag70e-word-production-knowledge-bank-readiness-record.json");
if (next.ready_for_ag70e !== true) fail("AG70E readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70d-to-ag70e-word-production-knowledge-bank-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("Next stage must not auto-start.");
for (const blocker of [
  "generated/word-of-day.json replacement",
  "homepage UI change",
  "runtime selector activation",
  "AI-fabricated Sanskrit or meaning records",
  "unsupported etymology",
  "public Word output"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) {
    fail(`Boundary blocker missing: ${blocker}`);
  }
}

pass("AG70D Word methodology supersession is valid.");
pass("Methodology v2 is defined and old rotation method is superseded as legacy/reference.");
pass("Selection flow, primary rules, fallback rules, duplicate/history rules and subscriber archive model are valid.");
pass("No old methodology deletion, output mutation, UI change, runtime activation or backend activation is recorded.");
await import("./validate-ag70d-word-selection-policy-fixtures.mjs");
