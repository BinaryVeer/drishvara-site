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

const ag70y = readJson("data/content-intelligence/quality-reviews/ag70y-location-selection-resolver-test.json");
const panchangManifest = readJson("data/knowledge-base/panchang-festival/production/production-bank-manifest.json");
const generatedWord = readJson("generated/word-of-day.json");

if (ag70y.status !== "ag70y_location_selection_resolver_test_completed") {
  throw new Error("AG70Y must be complete before AG70Z.");
}
if (ag70y.summary?.ready_for_ag70z !== true) {
  throw new Error("AG70Y readiness for AG70Z is missing.");
}
if (generatedWord.dynamic_rotation_active !== false || generatedWord.ai_generation_active !== false || generatedWord.source_expansion_active !== false) {
  throw new Error("generated/word-of-day.json must remain inactive.");
}

const outputs = {
  closure: "data/knowledge-base/location-intelligence/production/ag70z-location-intelligence-foundation-closure.json",
  pilotRule: "data/knowledge-base/location-intelligence/production/ag70z-pilot-first-scaling-rule.json",
  pilotCandidateSet: "data/knowledge-base/location-intelligence/production/ag70z-four-location-pilot-candidate-set.json",
  activationGate: "data/knowledge-base/location-intelligence/production/ag70z-location-activation-gate.json",
  scaleGate: "data/knowledge-base/location-intelligence/production/ag70z-bulk-scale-gate.json",
  remainingBlockers: "data/knowledge-base/location-intelligence/production/ag70z-remaining-blockers-register.json",
  noPublicOutputAudit: "data/knowledge-base/location-intelligence/production/ag70z-no-public-output-audit.json",
  panchangManifest: "data/knowledge-base/panchang-festival/production/production-bank-manifest.json",
  review: "data/content-intelligence/quality-reviews/ag70z-location-intelligence-foundation-closure.json",
  readiness: "data/content-intelligence/quality-registry/ag70z-ag71a-verified-four-location-pilot-activation-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag70z-to-ag71a-verified-four-location-pilot-activation-boundary.json",
  quality: "data/quality/ag70z-location-intelligence-foundation-closure.json",
  preview: "data/quality/ag70z-location-intelligence-foundation-closure-preview.json",
  doc: "docs/quality/AG70Z_LOCATION_INTELLIGENCE_FOUNDATION_CLOSURE.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short=8 HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short=8 origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const pilotCandidates = [
  {
    pilot_location_id: "ag71a_pilot_01_itanagar",
    display_label: "Itanagar-Arunachal Pradesh-India",
    short_label: "Itanagar",
    location_role: "arunachal_state_capital_case",
    country_name: "India",
    state_or_region_name: "Arunachal Pradesh",
    latitude_decimal: 27.0844,
    longitude_decimal: 93.6053,
    timezone: "Asia/Kolkata",
    verification_required_before_activation: true,
    activation_status_now: "not_activated"
  },
  {
    pilot_location_id: "ag71a_pilot_02_new_delhi",
    display_label: "New Delhi-Delhi-India",
    short_label: "New Delhi",
    location_role: "india_national_capital_case",
    country_name: "India",
    state_or_region_name: "Delhi",
    latitude_decimal: 28.6139,
    longitude_decimal: 77.2090,
    timezone: "Asia/Kolkata",
    verification_required_before_activation: true,
    activation_status_now: "not_activated"
  },
  {
    pilot_location_id: "ag71a_pilot_03_ranchi",
    display_label: "Ranchi-Jharkhand-India",
    short_label: "Ranchi",
    location_role: "major_indian_city_case",
    country_name: "India",
    state_or_region_name: "Jharkhand",
    latitude_decimal: 23.3441,
    longitude_decimal: 85.3096,
    timezone: "Asia/Kolkata",
    verification_required_before_activation: true,
    activation_status_now: "not_activated"
  },
  {
    pilot_location_id: "ag71a_pilot_04_tokyo",
    display_label: "Tokyo-Japan",
    short_label: "Tokyo",
    location_role: "global_capital_case",
    country_name: "Japan",
    state_or_region_name: null,
    latitude_decimal: 35.6762,
    longitude_decimal: 139.6503,
    timezone: "Asia/Tokyo",
    verification_required_before_activation: true,
    activation_status_now: "not_activated"
  }
];

const closure = {
  module_id: "AG70Z",
  title: "Location Intelligence Foundation Closure",
  status: "location_intelligence_foundation_closed_pilot_first_scaling_rule_recorded",
  purpose: "Close AG70T–AG70Y location foundation before verified pilot activation.",
  closed_stage_range: ["AG70T", "AG70U", "AG70V", "AG70W", "AG70X", "AG70Y"],
  foundation_outputs_confirmed: {
    shared_location_registry_created: true,
    named_location_selection_supported: true,
    coordinate_first_input_supported: true,
    india_admin_import_bank_created: true,
    india_city_capital_coordinate_bank_created: true,
    global_capital_city_coordinate_bank_created: true,
    resolver_test_completed: true,
    panchang_input_mapping_tested: true,
    star_reflection_input_mapping_tested: true
  },
  closure_decision: "foundation_ready_for_verified_four_location_pilot_not_full_scale_activation",
  full_scale_activation_allowed_now: false,
  public_output_allowed_now: false
};

const pilotRule = {
  module_id: "AG70Z",
  title: "Pilot-first Scaling Rule",
  status: "pilot_first_scaling_rule_locked",
  governing_rule: "No full-scale public/location-bank activation before the verified 4-location pilot passes end-to-end validation.",
  required_sequence: [
    "AG71A — Verified 4-Location Pilot Activation",
    "AG71B — Pilot Runtime Validation",
    "AG71C — Pilot Approval Closure",
    "AG71D — Scale Location Banks"
  ],
  pilot_success_required_before_bulk_scale: true,
  bulk_scale_allowed_after_pilot_success: true,
  bulk_scale_mode_after_success: "batchwise_using_same_validation_gates",
  public_output_allowed_now: false
};

const pilotCandidateSet = {
  module_id: "AG70Z",
  title: "Four-location Pilot Candidate Set",
  status: "four_location_pilot_candidate_set_created_not_activated",
  pilot_record_count: pilotCandidates.length,
  selection_reason: "Mixed sample covering Arunachal state capital, India national capital, major Indian city and global capital.",
  activation_allowed_now: false,
  records: pilotCandidates
};

const activationGate = {
  module_id: "AG70Z",
  title: "Location Activation Gate",
  status: "location_activation_gate_created",
  required_before_ag71a_activation: [
    "coordinate value present",
    "timezone present",
    "source/review status recorded",
    "freshness or latest-official-release status recorded",
    "pilot approval flag created",
    "computation approval limited to pilot scope",
    "public dropdown exposure limited to pilot scope"
  ],
  activation_scope_allowed_next: "four_location_pilot_only",
  full_bank_activation_allowed_next: false,
  public_output_allowed_now: false
};

const scaleGate = {
  module_id: "AG70Z",
  title: "Bulk Scale Gate",
  status: "bulk_scale_gate_created_blocked_until_pilot_success",
  scale_targets_after_pilot_success: [
    "all India State/UT capitals",
    "major Indian cities",
    "Indian districts",
    "Indian blocks",
    "global national capitals",
    "major world cities"
  ],
  prerequisites_before_scale: [
    "AG71A pilot activation completed",
    "AG71B runtime validation completed",
    "AG71C pilot approval closure completed",
    "no critical resolver/computation/display errors",
    "source verification gate preserved",
    "4-month refresh cadence preserved"
  ],
  scale_allowed_now: false,
  public_output_allowed_now: false
};

const remainingBlockers = {
  module_id: "AG70Z",
  title: "Remaining Blockers Register",
  status: "remaining_blockers_register_created",
  blockers_before_public_or_full_scale_activation: [
    {
      blocker_id: "source_verification_full_banks_pending",
      description: "Full source verification for India admin, India city/capital and global city/capital banks is pending.",
      blocks_full_scale_activation: true
    },
    {
      blocker_id: "candidate_coordinates_not_approved",
      description: "Candidate coordinates/timezones are not computation-approved except future pilot records after AG71A.",
      blocks_full_scale_activation: true
    },
    {
      blocker_id: "public_dropdown_not_activated",
      description: "Public dropdown remains blocked until pilot activation and validation stages.",
      blocks_full_scale_activation: true
    },
    {
      blocker_id: "runtime_computation_not_activated",
      description: "Panchang and Star Reflection runtime computation remain blocked until pilot runtime validation.",
      blocks_full_scale_activation: true
    },
    {
      blocker_id: "bulk_scale_requires_pilot_success",
      description: "Bulk location-bank scale is allowed only after the 4-location pilot passes.",
      blocks_full_scale_activation: true
    }
  ],
  public_output_allowed_now: false
};

const noPublicOutputAudit = {
  module_id: "AG70Z",
  title: "No Public Output Audit",
  status: "no_public_output_audit_passed",
  public_panchang_output_allowed_now: false,
  public_star_reflection_output_allowed_now: false,
  public_location_dropdown_activation_performed: false,
  panchang_recomputation_performed_now: false,
  star_reflection_computation_performed_now: false,
  generated_word_json_modified: false,
  ui_display_changed: false,
  backend_runtime_activated: false,
  supabase_activation_performed: false,
  full_scale_location_activation_performed: false
};

const updatedPanchangManifest = {
  ...panchangManifest,
  status: "production_bank_manifest_created_location_intelligence_foundation_closure",
  current_status: "location_intelligence_foundation_closed_pilot_first_rule_recorded",
  ag70z_files: {
    closure: outputs.closure,
    pilot_rule: outputs.pilotRule,
    pilot_candidate_set: outputs.pilotCandidateSet,
    activation_gate: outputs.activationGate,
    scale_gate: outputs.scaleGate,
    remaining_blockers: outputs.remainingBlockers,
    no_public_output_audit: outputs.noPublicOutputAudit
  },
  current_counts: {
    ...(panchangManifest.current_counts || {}),
    location_foundation_closure_records: 1,
    pilot_first_scaling_rule_records: 1,
    four_location_pilot_candidate_records: pilotCandidates.length,
    full_scale_activation_records_now: 0,
    resolver_computation_executed_records: 0,
    public_panchang_outputs: 0,
    word_output_records: 0
  },
  next_required_stage: "AG71A — Verified 4-Location Pilot Activation"
};

const review = {
  module_id: "AG70Z",
  title: "Location Intelligence Foundation Closure",
  status: "ag70z_location_intelligence_foundation_closure_completed",
  current_git_context: git,
  consumed_previous_stage: {
    ag70y_review: "data/content-intelligence/quality-reviews/ag70y-location-selection-resolver-test.json"
  },
  generated_records: outputs,
  summary: {
    foundation_closed: true,
    pilot_first_scaling_rule_locked: true,
    four_location_pilot_candidate_set_created: true,
    activation_gate_created: true,
    bulk_scale_gate_created: true,
    remaining_blockers_register_created: true,
    pilot_candidate_count: pilotCandidates.length,
    full_scale_activation_allowed_now: false,
    public_dropdown_activation_performed_now: false,
    panchang_computation_executed_now: false,
    star_reflection_computation_executed_now: false,
    generated_word_json_modified: false,
    ui_display_changed: false,
    backend_runtime_activated: false,
    supabase_activation_performed: false,
    ready_for_ag71a: true
  }
};

const readiness = {
  module_id: "AG70Z",
  title: "AG71A Verified 4-Location Pilot Activation Readiness Record",
  status: "ready_for_ag71a_verified_four_location_pilot_activation",
  ready_for_ag71a: true,
  next_stage: "AG71A — Verified 4-Location Pilot Activation",
  pilot_locations: pilotCandidates.map((x) => x.display_label),
  reason: "Location foundation is closed and pilot-first scaling rule is locked. AG71A may activate only the 4-location verified pilot, not full banks."
};

const boundary = {
  module_id: "AG70Z",
  title: "AG70Z to AG71A Verified 4-Location Pilot Activation Boundary",
  status: "ag71a_boundary_defined",
  current_stage_completed: true,
  next_stage_not_auto_started: true,
  allowed_next_scope_after_user_confirmation: [
    "Create verified 4-location pilot activation records.",
    "Mark only the 4 pilot locations as pilot-approved if their coordinate/timezone/source review gates pass.",
    "Prepare pilot-only dropdown exposure flag.",
    "Prepare pilot-only Panchang/Star Reflection runtime permission records."
  ],
  blocked_scope_without_explicit_approval: [
    "full location-bank activation",
    "all India State/UT capitals activation",
    "all districts activation",
    "all blocks activation",
    "all global capitals activation",
    "all major world cities activation",
    "public full dropdown activation",
    "unrestricted Panchang runtime computation",
    "unrestricted Star Reflection runtime computation",
    "generated/word-of-day.json replacement",
    "homepage UI change",
    "Supabase/database writes",
    "backend/Auth activation"
  ]
};

const quality = {
  module_id: "AG70Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG70Z",
  status: review.status,
  pilot_candidate_count: pilotCandidates.length,
  pilot_first_scaling_rule_locked: 1,
  full_scale_activation_allowed_now: 0,
  public_output_allowed_now: 0,
  ready_for_ag71a: 1
};

const doc = `# AG70Z — Location Intelligence Foundation Closure

AG70Z closes the AG70T–AG70Y location intelligence foundation.

## Closed foundation

- Shared Location Intelligence Registry.
- Named-location selection.
- Coordinate-first input.
- India administrative import bank.
- India cities/capitals coordinate candidate bank.
- Global capitals/major-cities coordinate candidate bank.
- Location resolver test.
- Panchang and Star Reflection input mapping test.

## Locked rule

No full-scale public/location-bank activation before the 4-location pilot passes.

## Pilot candidates

1. Itanagar-Arunachal Pradesh-India
2. New Delhi-Delhi-India
3. Ranchi-Jharkhand-India
4. Tokyo-Japan

## Next

AG71A — Verified 4-Location Pilot Activation.

## Boundary

No public dropdown, no Panchang runtime, no Star Reflection runtime, no UI/backend/Supabase activation in AG70Z.
`;

writeJson(outputs.closure, closure);
writeJson(outputs.pilotRule, pilotRule);
writeJson(outputs.pilotCandidateSet, pilotCandidateSet);
writeJson(outputs.activationGate, activationGate);
writeJson(outputs.scaleGate, scaleGate);
writeJson(outputs.remainingBlockers, remainingBlockers);
writeJson(outputs.noPublicOutputAudit, noPublicOutputAudit);
writeJson(outputs.panchangManifest, updatedPanchangManifest);
writeJson(outputs.review, review);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.quality, quality);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG70Z location intelligence foundation closure generated.");
console.log("✅ Pilot-first scaling rule locked.");
console.log("✅ 4-location pilot candidate set created.");
console.log("✅ Full-scale activation remains blocked until pilot success.");
