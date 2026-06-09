import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) { console.error(`❌ AG70Z validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag70z-location-intelligence-foundation-closure.mjs",
  "scripts/validate-ag70z-location-intelligence-foundation-closure.mjs",
  "data/knowledge-base/location-intelligence/production/ag70z-location-intelligence-foundation-closure.json",
  "data/knowledge-base/location-intelligence/production/ag70z-pilot-first-scaling-rule.json",
  "data/knowledge-base/location-intelligence/production/ag70z-four-location-pilot-candidate-set.json",
  "data/knowledge-base/location-intelligence/production/ag70z-location-activation-gate.json",
  "data/knowledge-base/location-intelligence/production/ag70z-bulk-scale-gate.json",
  "data/knowledge-base/location-intelligence/production/ag70z-remaining-blockers-register.json",
  "data/knowledge-base/location-intelligence/production/ag70z-no-public-output-audit.json",
  "data/knowledge-base/location-intelligence/production/ag70z-coordinate-first-ui-requirement.json",
  "data/content-intelligence/quality-reviews/ag70z-location-intelligence-foundation-closure.json",
  "data/content-intelligence/quality-registry/ag70z-ag71a-verified-four-location-pilot-activation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag70z-to-ag71a-verified-four-location-pilot-activation-boundary.json",
  "data/quality/ag70z-location-intelligence-foundation-closure.json",
  "data/quality/ag70z-location-intelligence-foundation-closure-preview.json",
  "docs/quality/AG70Z_LOCATION_INTELLIGENCE_FOUNDATION_CLOSURE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag70z"]) fail("Missing generate:ag70z script.");
if (!pkg.scripts?.["validate:ag70z"]) fail("Missing validate:ag70z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag70z")) fail("validate:project must include validate:ag70z.");

const closure = readJson("data/knowledge-base/location-intelligence/production/ag70z-location-intelligence-foundation-closure.json");
if (closure.status !== "location_intelligence_foundation_closed_pilot_first_scaling_rule_recorded") fail("Closure status mismatch.");
if (closure.closure_decision !== "foundation_ready_for_verified_four_location_pilot_not_full_scale_activation") fail("Closure decision mismatch.");
if (closure.full_scale_activation_allowed_now !== false) fail("Full-scale activation must be false.");
if (closure.public_output_allowed_now !== false) fail("Public output must be false.");

const rule = readJson("data/knowledge-base/location-intelligence/production/ag70z-pilot-first-scaling-rule.json");
if (rule.status !== "pilot_first_scaling_rule_locked") fail("Pilot rule status mismatch.");
if (rule.pilot_success_required_before_bulk_scale !== true) fail("Pilot success must be required.");
if (rule.bulk_scale_allowed_after_pilot_success !== true) fail("Bulk scale after pilot success must be allowed.");
if (rule.public_output_allowed_now !== false) fail("Pilot rule public output must be false.");

const pilot = readJson("data/knowledge-base/location-intelligence/production/ag70z-four-location-pilot-candidate-set.json");
if (pilot.status !== "four_location_pilot_candidate_set_created_not_activated") fail("Pilot candidate status mismatch.");
if (pilot.pilot_record_count !== 4) fail("Pilot record count must be 4.");
for (const label of ["Itanagar-Arunachal Pradesh-India", "New Delhi-Delhi-India", "Ranchi-Jharkhand-India", "Tokyo-Japan"]) {
  if (!pilot.records.some((x) => x.display_label === label)) fail(`Pilot location missing: ${label}`);
}
if (pilot.activation_allowed_now !== false) fail("Pilot activation must be false in AG70Z.");

const activation = readJson("data/knowledge-base/location-intelligence/production/ag70z-location-activation-gate.json");
if (activation.status !== "location_activation_gate_created") fail("Activation gate status mismatch.");
if (activation.activation_scope_allowed_next !== "four_location_pilot_only") fail("Activation next scope must be four-location pilot only.");
if (activation.full_bank_activation_allowed_next !== false) fail("Full bank activation must be false.");
if (activation.public_output_allowed_now !== false) fail("Activation public output must be false.");

const scale = readJson("data/knowledge-base/location-intelligence/production/ag70z-bulk-scale-gate.json");
if (scale.status !== "bulk_scale_gate_created_blocked_until_pilot_success") fail("Bulk scale gate status mismatch.");
if (scale.scale_allowed_now !== false) fail("Scale allowed now must be false.");
for (const prerequisite of ["AG71A pilot activation completed", "AG71B runtime validation completed", "AG71C pilot approval closure completed"]) {
  if (!scale.prerequisites_before_scale.includes(prerequisite)) fail(`Scale prerequisite missing: ${prerequisite}`);
}

const blockers = readJson("data/knowledge-base/location-intelligence/production/ag70z-remaining-blockers-register.json");
if (blockers.status !== "remaining_blockers_register_created") fail("Blockers status mismatch.");
if (blockers.blockers_before_public_or_full_scale_activation.length < 5) fail("At least 5 blockers expected.");

const uiRequirement = readJson("data/knowledge-base/location-intelligence/production/ag70z-coordinate-first-ui-requirement.json");
if (uiRequirement.status !== "coordinate_first_ui_requirement_locked") fail("Coordinate-first UI requirement status mismatch.");
if (!uiRequirement.panchang_ui_modes_required.includes("select_location_from_dropdown")) fail("Panchang dropdown UI mode missing.");
if (!uiRequirement.panchang_ui_modes_required.includes("enter_coordinates")) fail("Panchang coordinate UI mode missing.");
if (!uiRequirement.star_reflection_ui_modes_required.includes("select_birth_place_from_dropdown")) fail("Star Reflection birth-place UI mode missing.");
if (!uiRequirement.star_reflection_ui_modes_required.includes("enter_birth_coordinates")) fail("Star Reflection coordinate UI mode missing.");
if (uiRequirement.public_ui_activation_allowed_now !== false) fail("Coordinate-first UI activation must be false.");
if (uiRequirement.public_output_allowed_now !== false) fail("Coordinate-first UI public output must be false.");

const noPublic = readJson("data/knowledge-base/location-intelligence/production/ag70z-no-public-output-audit.json");
if (noPublic.status !== "no_public_output_audit_passed") fail("No-public audit status mismatch.");
for (const key of [
  "public_panchang_output_allowed_now",
  "public_star_reflection_output_allowed_now",
  "public_location_dropdown_activation_performed",
  "panchang_recomputation_performed_now",
  "star_reflection_computation_performed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed",
  "full_scale_location_activation_performed"
]) {
  if (noPublic[key] !== false) fail(`${key} must be false.`);
}

const manifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const allowedPanchangManifestStatuses = [
  "production_bank_manifest_created_location_intelligence_foundation_closure",
  "production_bank_manifest_created_verified_four_location_pilot_activation",
  "production_bank_manifest_created_pilot_runtime_validation"
];
if (!allowedPanchangManifestStatuses.includes(manifest.status)) fail("Panchang manifest status mismatch.");
if (manifest.current_counts.location_foundation_closure_records !== 1) fail("Closure count must be 1.");
if (manifest.current_counts.pilot_first_scaling_rule_records !== 1) fail("Pilot rule count must be 1.");
if (manifest.current_counts.four_location_pilot_candidate_records !== 4) fail("Pilot candidate count must be 4.");
if (manifest.current_counts.coordinate_first_ui_requirement_records !== 1) fail("Coordinate-first UI requirement count must be 1.");
if (manifest.current_counts.full_scale_activation_records_now !== 0) fail("Full-scale activation count must be zero.");
if (manifest.current_counts.public_panchang_outputs !== 0) fail("Public Panchang outputs must be zero.");

const review = readJson("data/content-intelligence/quality-reviews/ag70z-location-intelligence-foundation-closure.json");
if (review.status !== "ag70z_location_intelligence_foundation_closure_completed") fail("Review status mismatch.");
for (const key of [
  "foundation_closed",
  "pilot_first_scaling_rule_locked",
  "four_location_pilot_candidate_set_created",
  "activation_gate_created",
  "bulk_scale_gate_created",
  "remaining_blockers_register_created",
  "ready_for_ag71a",
  "coordinate_first_ui_requirement_locked"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true.`);
}
for (const key of [
  "full_scale_activation_allowed_now",
  "public_dropdown_activation_performed_now",
  "panchang_computation_executed_now",
  "star_reflection_computation_executed_now",
  "generated_word_json_modified",
  "ui_display_changed",
  "backend_runtime_activated",
  "supabase_activation_performed"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false.`);
}

const readiness = readJson("data/content-intelligence/quality-registry/ag70z-ag71a-verified-four-location-pilot-activation-readiness-record.json");
if (readiness.ready_for_ag71a !== true) fail("AG71A readiness must be true.");
if (readiness.pilot_locations.length !== 4) fail("AG71A pilot location count must be 4.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag70z-to-ag71a-verified-four-location-pilot-activation-boundary.json");
if (boundary.next_stage_not_auto_started !== true) fail("AG71A boundary must not auto-start.");
for (const blocker of [
  "full location-bank activation",
  "public full dropdown activation",
  "unrestricted Panchang runtime computation",
  "unrestricted Star Reflection runtime computation",
  "Supabase/database writes",
  "backend/Auth activation"
]) {
  if (!boundary.blocked_scope_without_explicit_approval.includes(blocker)) fail(`Boundary blocker missing: ${blocker}`);
}

pass("AG70Z location intelligence foundation closure is valid.");
pass("Pilot-first scaling rule is locked.");
pass("AG71A can proceed as verified 4-location pilot only.");
