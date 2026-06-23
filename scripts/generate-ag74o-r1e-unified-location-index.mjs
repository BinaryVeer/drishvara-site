import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const EXPECTED_DIAGNOSIS_SHA =
  "a69665904b1fee4f29c2416f0e4fde2e05cf28ce9f1436bf6cc584cdff778d21";
const EXPECTED_BASELINE =
  "31c0fbabfe70adb0061fdaa065e67ed7d89c41fc";
const MAX_BUFFER = 512 * 1024 * 1024;

function full(relativePath) {
  return path.join(root, relativePath);
}
function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(full(relativePath), "utf8"));
}
function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(full(relativePath)), { recursive: true });
  fs.writeFileSync(full(relativePath), JSON.stringify(value, null, 2) + "\n");
}
function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}
function sha256Text(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}
function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}
function listZip(zipPath) {
  return execFileSync("unzip", ["-Z1", zipPath], {
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
  }).split(/\r?\n/).filter(Boolean);
}
function findEntry(entries, suffix) {
  const matches = entries.filter(
    (entry) => entry === suffix || entry.endsWith(`/${suffix}`)
  );
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one ZIP entry ending with ${suffix}; found ${matches.length}.`
    );
  }
  return matches[0];
}
function readZipJson(zipPath, entries, suffix) {
  const body = execFileSync(
    "unzip",
    ["-p", zipPath, findEntry(entries, suffix)],
    { encoding: "utf8", maxBuffer: MAX_BUFFER }
  );
  return JSON.parse(body);
}
function normalise(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
if (normalise("Nukuʻalofa") !== "nuku alofa") {
  throw new Error("Unicode normalisation parity guard failed.");
}

function slug(value) {
  return normalise(value).replace(/ /g, "-");
}
function uniqueSorted(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))]
    .map(String)
    .sort((a, b) => a.localeCompare(b));
}
function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}
function ensureBlocked(record, idField) {
  const id = record[idField] || "unknown";
  if (
    record.computation_approval_status !== "blocked" ||
    record.public_selection_status !== "blocked"
  ) {
    throw new Error(`Activation boundary mismatch for ${id}.`);
  }
}

const args = parseArgs(process.argv.slice(2));
const diagnosisZip = path.resolve(
  String(args.diagnosisZip || process.env.AG74O_R1E_DIAGNOSIS_ZIP || "")
);
if (!diagnosisZip || !fs.existsSync(diagnosisZip)) {
  throw new Error(
    "Provide --diagnosisZip /absolute/path/to/AG74O_R1E_Unified_Location_Index_Diagnosis_*.zip"
  );
}
const diagnosisSha = sha256File(diagnosisZip);
if (diagnosisSha !== EXPECTED_DIAGNOSIS_SHA) {
  throw new Error(
    `Diagnosis SHA-256 mismatch. Expected ${EXPECTED_DIAGNOSIS_SHA}; got ${diagnosisSha}.`
  );
}

const entries = listZip(diagnosisZip);
const diagnosis = readZipJson(diagnosisZip, entries, "diagnosis_report.json");
const sourceInventory = readZipJson(
  diagnosisZip,
  entries,
  "source_record_inventory_preview.json"
);
const canonicalPreview = readZipJson(
  diagnosisZip,
  entries,
  "cross_bank_canonical_review_preview.json"
);
const aliasDiagnosis = readZipJson(
  diagnosisZip,
  entries,
  "alias_search_label_diagnosis.json"
);
const coordinateDiagnosis = readZipJson(
  diagnosisZip,
  entries,
  "coordinate_timezone_state_diagnosis.json"
);
const approvalDiagnosis = readZipJson(
  diagnosisZip,
  entries,
  "approval_state_preservation_check.json"
);

if (diagnosis.repository?.head !== EXPECTED_BASELINE) {
  throw new Error("R1E diagnosis repository baseline mismatch.");
}
if (diagnosis.ready_for_r1e_apply_package_planning !== true) {
  throw new Error("R1E diagnosis is not ready for apply-package planning.");
}
if (diagnosis.failures?.length) {
  throw new Error("R1E diagnosis contains failures.");
}
if (sourceInventory.record_count !== 7946 || sourceInventory.records?.length !== 7946) {
  throw new Error("R1E source-record inventory count mismatch.");
}
if (
  canonicalPreview.cross_bank_group_count !== 243 ||
  canonicalPreview.same_stage_group_count !== 949 ||
  canonicalPreview.india_external_group_count !== 56
) {
  throw new Error("R1E canonical-review preview count mismatch.");
}
if (
  aliasDiagnosis.summary?.search_label_value_count !== 6704 ||
  aliasDiagnosis.summary?.ambiguous_normalised_search_label_count !== 24
) {
  throw new Error("R1E alias/search diagnosis count mismatch.");
}
if (approvalDiagnosis.violation_count !== 0) {
  throw new Error("R1E approval-state diagnosis contains violations.");
}

const inputPaths = [
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-coordinate-enrichment-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-universal-location-coordinate-role-schema.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1b-computation-approval-state-machine.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-core-195-country-identity-register.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-global-national-capital-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-role-link-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-country-alias-crosswalk.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-conflict-review-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-timezone-review-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-major-international-city-candidate-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-sacred-reference-city-candidate-bank.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-cross-bank-canonical-place-review-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-coordinate-timezone-review-queue.json",
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-source-attribution-register.json",
  "data/content-intelligence/quality-registry/ag74o-r1d-ag74o-r1e-unified-location-index-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag74o-r1d-to-ag74o-r1e-unified-location-index-boundary.json",
];
for (const relativePath of inputPaths) {
  if (!fs.existsSync(full(relativePath))) {
    throw new Error(`Missing required R1E input: ${relativePath}`);
  }
}

const r1cAliasCrosswalk = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-country-alias-crosswalk.json"
);
const r1cConflictQueue = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-conflict-review-queue.json"
);
const r1dCrossBankQueue = readJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-cross-bank-canonical-place-review-queue.json"
);

if (ensureArray(r1cConflictQueue.records).length !== 7) {
  throw new Error("R1C conflict queue count mismatch.");
}
if (ensureArray(r1dCrossBankQueue.records).length !== 196) {
  throw new Error("R1D cross-bank queue count mismatch.");
}

const generatedAt = new Date().toISOString();
const sourceRecords = [...sourceInventory.records].sort((a, b) => {
  const left = `${a.source_stage}|${a.source_record_id}`;
  const right = `${b.source_stage}|${b.source_record_id}`;
  return left.localeCompare(right);
});

for (const record of sourceRecords) {
  ensureBlocked(record, "source_record_id");
  if (record.automatic_merge_allowed !== false) {
    throw new Error(`Automatic merge boundary mismatch for ${record.source_record_id}.`);
  }
}

const groups = new Map();
for (const record of sourceRecords) {
  const key = String(record.comparison_join_key || "");
  if (!key || key.endsWith("|")) continue;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(record);
}
const sortedGroupKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b));
if (sortedGroupKeys.length !== 6483) {
  throw new Error(
    `Comparison-bucket count mismatch. Expected 6483; got ${sortedGroupKeys.length}.`
  );
}

const bucketIdByKey = new Map();
const canonicalLinkRecords = sortedGroupKeys.map((key, index) => {
  const members = groups.get(key);
  const bucketId = `ag74o_r1e_candidate_bucket_${String(index + 1).padStart(5, "0")}`;
  bucketIdByKey.set(key, bucketId);
  const sourceStages = uniqueSorted(members.map((member) => member.source_stage));
  const memberRecordIds = uniqueSorted(
    members.map((member) => member.source_record_id)
  );
  const roles = uniqueSorted(members.flatMap((member) => ensureArray(member.roles)));
  const aliases = uniqueSorted(
    members.flatMap((member) => [
      member.city_or_place_label,
      ...ensureArray(member.aliases),
    ])
  );
  const crossBank = sourceStages.length > 1;
  return {
    candidate_bucket_id: bucketId,
    comparison_join_key: key,
    member_count: members.length,
    source_stage_count: sourceStages.length,
    source_stages: sourceStages,
    member_record_ids: memberRecordIds,
    member_record_types: uniqueSorted(
      members.map((member) => member.source_record_type)
    ),
    candidate_roles: roles,
    candidate_labels: aliases,
    cross_bank_review_required: crossBank,
    same_stage_hierarchy_or_duplicate_review_required:
      !crossBank && members.length > 1,
    canonical_place_approval_status: "not_approved",
    linkage_status:
      members.length === 1
        ? "single_source_candidate_not_canonical_approved"
        : "manual_canonical_place_review_required",
    automatic_merge_allowed: false,
    computation_approval_status: "blocked",
    public_selection_status: "blocked",
  };
});

const unifiedRecords = sourceRecords.map((source, index) => {
  const joinKey = String(source.comparison_join_key || "");
  return {
    unified_index_record_id: `ag74o_r1e_index_${String(index + 1).padStart(5, "0")}`,
    source_stage: source.source_stage,
    source_record_id: source.source_record_id,
    source_record_type: source.source_record_type,
    country_iso2: source.country_iso2 || null,
    country_name: source.country_name || null,
    city_or_place_label: source.city_or_place_label || null,
    administrative_level_1_name:
      source.administrative_level_1_name || null,
    administrative_level_2_name:
      source.administrative_level_2_name || null,
    source_canonical_place_key:
      source.existing_canonical_place_key || null,
    comparison_join_key: joinKey || null,
    candidate_bucket_id: bucketIdByKey.get(joinKey) || null,
    aliases: uniqueSorted(ensureArray(source.aliases)),
    candidate_roles: uniqueSorted(ensureArray(source.roles)),
    coordinate_review_state: source.coordinate_state || "unspecified",
    timezone_review_state: source.timezone_state || "unspecified",
    canonical_place_approval_status: "not_approved",
    alias_resolution_status: "candidate_only",
    computation_approval_status: "blocked",
    public_selection_status: "blocked",
    automatic_merge_allowed: false,
    automatic_alias_resolution_allowed: false,
  };
});

const searchMap = new Map();
function addSearchLabel(label, target) {
  const normalisedLabel = normalise(label);
  if (!normalisedLabel) return;
  if (!searchMap.has(normalisedLabel)) {
    searchMap.set(normalisedLabel, {
      normalised_label: normalisedLabel,
      display_variants: new Set(),
      target_keys: new Set(),
      source_record_ids: new Set(),
      target_types: new Set(),
    });
  }
  const entry = searchMap.get(normalisedLabel);
  entry.display_variants.add(String(label));
  entry.target_keys.add(target.target_key);
  if (target.source_record_id) entry.source_record_ids.add(target.source_record_id);
  entry.target_types.add(target.target_type);
}

for (const source of sourceRecords) {
  const labels = [
    source.city_or_place_label,
    ...ensureArray(source.aliases),
  ];
  for (const label of labels) {
    addSearchLabel(label, {
      target_key: source.comparison_join_key || source.source_record_id,
      source_record_id: source.source_record_id,
      target_type: "location_candidate",
    });
  }
}

const countryAliasRecords = ensureArray(r1cAliasCrosswalk.country_alias_records);
for (const record of countryAliasRecords) {
  const labels = [
    record.canonical_country_name,
    ...ensureArray(record.aliases),
  ];
  for (const label of labels) {
    addSearchLabel(label, {
      target_key: `COUNTRY|${record.iso2}`,
      source_record_id: record.country_record_id,
      target_type: "country_identity_candidate",
    });
  }
}

const ambiguousDiagnosisMap = new Map(
  ensureArray(aliasDiagnosis.ambiguous_labels).map((record) => [
    record.normalised_label,
    record,
  ])
);

const aliasSearchRecords = [...searchMap.values()]
  .map((entry, index) => {
    const ambiguity = ambiguousDiagnosisMap.get(entry.normalised_label) || null;
    return {
      search_label_record_id: `ag74o_r1e_search_label_${String(index + 1).padStart(5, "0")}`,
      normalised_label: entry.normalised_label,
      display_variants: uniqueSorted([...entry.display_variants]),
      target_keys: uniqueSorted([...entry.target_keys]),
      source_record_ids: uniqueSorted([...entry.source_record_ids]),
      target_types: uniqueSorted([...entry.target_types]),
      candidate_target_count: entry.target_keys.size,
      ambiguous_label_review_required: Boolean(ambiguity),
      ambiguity_resolution_status: ambiguity
        ? "manual_disambiguation_or_context_rule_required"
        : "no_cross_target_ambiguity_detected",
      automatic_public_resolution_allowed: false,
      public_selection_status: "blocked",
      computation_approval_status: "blocked",
    };
  })
  .sort((a, b) => a.normalised_label.localeCompare(b.normalised_label))
  .map((record, index) => ({
    ...record,
    search_label_record_id: `ag74o_r1e_search_label_${String(index + 1).padStart(5, "0")}`,
  }));

if (aliasSearchRecords.length !== 6704) {
  throw new Error(
    `Unified alias/search-label count mismatch. Expected 6704; got ${aliasSearchRecords.length}.`
  );
}
const ambiguousAliasCount = aliasSearchRecords.filter(
  (record) => record.ambiguous_label_review_required
).length;
if (ambiguousAliasCount !== 24) {
  throw new Error(
    `Ambiguous search-label count mismatch. Expected 24; got ${ambiguousAliasCount}.`
  );
}

const coordinateStateRecords = unifiedRecords.map((record, index) => ({
  review_state_record_id: `ag74o_r1e_coordinate_timezone_${String(index + 1).padStart(5, "0")}`,
  unified_index_record_id: record.unified_index_record_id,
  source_stage: record.source_stage,
  source_record_id: record.source_record_id,
  candidate_bucket_id: record.candidate_bucket_id,
  coordinate_review_state: record.coordinate_review_state,
  timezone_review_state: record.timezone_review_state,
  inherited_review_sources: uniqueSorted([
    record.source_stage === "AG74O-R1A"
      ? "AG74O-R1B India coordinate-enrichment queue"
      : null,
    record.source_stage === "AG74O-R1C"
      ? "AG74O-R1C capital timezone-review queue"
      : null,
    record.source_stage.startsWith("AG74O-R1D")
      ? "AG74O-R1D coordinate/timezone review queue"
      : null,
  ]),
  automatic_coordinate_approval_allowed: false,
  automatic_timezone_approval_allowed: false,
  computation_approval_status: "blocked",
  public_selection_status: "blocked",
}));

const reviewRecords = [];
function addReview(type, sourceId, payload) {
  reviewRecords.push({
    unified_review_record_id: `ag74o_r1e_review_${String(reviewRecords.length + 1).padStart(5, "0")}`,
    review_type: type,
    source_review_id: sourceId || null,
    payload,
    review_status: "open",
    automatic_resolution_allowed: false,
    computation_approval_status: "blocked",
    public_selection_status: "blocked",
  });
}

for (const record of ensureArray(canonicalPreview.cross_bank_groups)) {
  addReview(
    "cross_bank_canonical_place_comparison",
    record.comparison_join_key,
    record
  );
}
for (const record of ensureArray(canonicalPreview.same_stage_groups)) {
  addReview(
    "same_stage_hierarchy_or_duplicate_comparison",
    record.comparison_join_key,
    record
  );
}
for (const record of ensureArray(aliasDiagnosis.ambiguous_labels)) {
  addReview(
    "ambiguous_normalised_search_label",
    record.normalised_label,
    record
  );
}
for (const record of ensureArray(r1dCrossBankQueue.records)) {
  addReview(
    "r1d_cross_bank_review_carry_forward",
    record.review_record_id,
    record
  );
}
for (const record of ensureArray(r1cConflictQueue.records)) {
  addReview(
    "r1c_capital_conflict_carry_forward",
    record.checklist_id || record.country_record_id,
    record
  );
}

const reviewTypeCounts = reviewRecords.reduce((acc, record) => {
  acc[record.review_type] = (acc[record.review_type] || 0) + 1;
  return acc;
}, {});
if (
  reviewRecords.length !== 1419 ||
  reviewTypeCounts.cross_bank_canonical_place_comparison !== 243 ||
  reviewTypeCounts.same_stage_hierarchy_or_duplicate_comparison !== 949 ||
  reviewTypeCounts.ambiguous_normalised_search_label !== 24 ||
  reviewTypeCounts.r1d_cross_bank_review_carry_forward !== 196 ||
  reviewTypeCounts.r1c_capital_conflict_carry_forward !== 7
) {
  throw new Error(
    `Unified unresolved-review queue mismatch: ${JSON.stringify(reviewTypeCounts)}`
  );
}

const approvalRecords = unifiedRecords.map((record, index) => ({
  approval_state_record_id: `ag74o_r1e_approval_${String(index + 1).padStart(5, "0")}`,
  unified_index_record_id: record.unified_index_record_id,
  source_stage: record.source_stage,
  source_record_id: record.source_record_id,
  canonical_place_approval_status: "not_approved",
  identity_or_role_review_status: "candidate_or_review_state_preserved",
  coordinate_approval_status: "not_approved",
  timezone_approval_status: "not_approved",
  computation_approval_status: "blocked",
  public_selection_status: "blocked",
  automatic_approval_allowed: false,
}));

const sourceAttributionRecords = inputPaths.map((relativePath) => ({
  repository_path: relativePath,
  sha256: sha256File(full(relativePath)),
  continuity_status: "source_lineage_preserved",
  automatic_overwrite_allowed: false,
}));
sourceAttributionRecords.push({
  repository_path: null,
  external_evidence_filename: path.basename(diagnosisZip),
  sha256: diagnosisSha,
  continuity_status: "verified_non_mutating_r1e_diagnosis",
  automatic_overwrite_allowed: false,
});

const unifiedIndex = {
  module_id: "AG74O-R1E",
  title: "Unified Governed Location Index",
  status: "ag74o_r1e_unified_location_index_created_candidate_only",
  generated_at_utc: generatedAt,
  diagnosis_evidence: {
    filename: path.basename(diagnosisZip),
    sha256: diagnosisSha,
    report_manifest_verified: true,
    repository_head: diagnosis.repository.head,
  },
  record_count: unifiedRecords.length,
  source_inventory_counts: diagnosis.inventory,
  governance: {
    index_is_public_runtime_selector: false,
    index_record_is_canonical_place_approval: false,
    automatic_canonical_merge_allowed: false,
    automatic_alias_resolution_allowed: false,
    runtime_external_api_dependency_allowed: false,
    public_output_allowed_now: false,
  },
  records: unifiedRecords,
};

const canonicalLinkBank = {
  module_id: "AG74O-R1E",
  title: "Canonical-Place Candidate Link Bank",
  status: "ag74o_r1e_canonical_place_candidate_link_bank_created",
  generated_at_utc: generatedAt,
  record_count: canonicalLinkRecords.length,
  cross_bank_review_group_count: 243,
  same_stage_review_group_count: 949,
  india_external_review_group_count: 56,
  governance: {
    candidate_bucket_is_approved_canonical_place: false,
    automatic_merge_allowed: false,
    hierarchy_collapse_allowed_without_review: false,
    public_output_allowed_now: false,
  },
  records: canonicalLinkRecords,
};

const aliasSearchIndex = {
  module_id: "AG74O-R1E",
  title: "Unified Alias and Search-Label Candidate Index",
  status: "ag74o_r1e_unified_alias_search_index_created",
  generated_at_utc: generatedAt,
  record_count: aliasSearchRecords.length,
  ambiguous_label_review_count: ambiguousAliasCount,
  country_alias_record_count: countryAliasRecords.length,
  country_alias_value_count: r1cAliasCrosswalk.counts?.country_alias_values,
  capital_alias_candidate_record_count:
    r1cAliasCrosswalk.counts?.capital_alias_candidate_records,
  governance: {
    alias_match_is_canonical_identity_approval: false,
    automatic_public_resolution_allowed: false,
    context_free_ambiguous_resolution_allowed: false,
    public_output_allowed_now: false,
  },
  records: aliasSearchRecords,
};

const coordinateRegister = {
  module_id: "AG74O-R1E",
  title: "Unified Coordinate and Timezone Review-State Register",
  status: "ag74o_r1e_coordinate_timezone_review_state_register_created",
  generated_at_utc: generatedAt,
  record_count: coordinateStateRecords.length,
  coordinate_state_counts: coordinateDiagnosis.coordinate_state_counts,
  timezone_state_counts: coordinateDiagnosis.timezone_state_counts,
  inherited_queue_counts: {
    r1b_india_coordinate_queue_records:
      coordinateDiagnosis.r1b_india_queue_record_count,
    r1c_capital_timezone_review_records:
      coordinateDiagnosis.r1c_capital_timezone_review_count,
    r1d_coordinate_timezone_review_records:
      coordinateDiagnosis.r1d_coordinate_timezone_review_count,
  },
  governance: {
    candidate_coordinate_is_verified_coordinate: false,
    candidate_timezone_is_verified_timezone: false,
    automatic_coordinate_approval_allowed: false,
    automatic_timezone_approval_allowed: false,
    public_output_allowed_now: false,
  },
  records: coordinateStateRecords,
};

const unresolvedQueue = {
  module_id: "AG74O-R1E",
  title: "Unified Unresolved Canonical and Search Review Queue",
  status: "ag74o_r1e_unresolved_canonical_review_queue_created",
  generated_at_utc: generatedAt,
  record_count: reviewRecords.length,
  review_type_counts: reviewTypeCounts,
  governance: {
    automatic_resolution_allowed: false,
    silent_source_overwrite_allowed: false,
    public_or_computation_approval_allowed_before_resolution: false,
  },
  records: reviewRecords,
};

const sourceAttribution = {
  module_id: "AG74O-R1E",
  title: "Source Attribution Continuity Register",
  status: "ag74o_r1e_source_attribution_continuity_register_created",
  generated_at_utc: generatedAt,
  record_count: sourceAttributionRecords.length,
  governance: {
    source_lineage_must_be_retained: true,
    licensed_source_attribution_must_be_retained: true,
    automatic_source_overwrite_allowed: false,
    runtime_external_api_dependency_allowed: false,
    public_output_allowed_now: false,
  },
  records: sourceAttributionRecords,
};

const approvalRegister = {
  module_id: "AG74O-R1E",
  title: "Approval-State Preservation Register",
  status: "ag74o_r1e_approval_state_preservation_register_created",
  generated_at_utc: generatedAt,
  record_count: approvalRecords.length,
  public_selection_approved_count: 0,
  computation_approved_count: 0,
  canonical_place_approved_count: 0,
  coordinate_approved_count: 0,
  timezone_approved_count: 0,
  governance: {
    automatic_approval_allowed: false,
    public_selector_activation_allowed: false,
    panchang_computation_activation_allowed: false,
  },
  records: approvalRecords,
};

const review = {
  module_id: "AG74O-R1E",
  title: "Unified Location Index Review",
  status: "ag74o_r1e_unified_location_index_completed",
  generated_at_utc: generatedAt,
  issue_count: 0,
  warning_count: reviewRecords.length,
  summary: {
    unified_index_records: unifiedRecords.length,
    candidate_link_buckets: canonicalLinkRecords.length,
    alias_search_records: aliasSearchRecords.length,
    ambiguous_alias_reviews: ambiguousAliasCount,
    coordinate_timezone_state_records: coordinateStateRecords.length,
    unresolved_review_records: reviewRecords.length,
    public_location_selector_activated: false,
    panchang_computation_activated: false,
    runtime_external_api_activated: false,
    supabase_activated: false,
    homepage_ui_changed: false,
    ready_for_ag74o_r2_planning: true,
  },
};

const readiness = {
  module_id: "AG74O-R1E",
  title: "AG74O-R2 Selector and Calculation Correction Readiness",
  status: "ag74o_r1e_ready_for_selector_calculation_correction_planning",
  generated_at_utc: generatedAt,
  ready_for_ag74o_r2_planning: true,
  ready_for_public_runtime_activation: false,
  unified_index_records: unifiedRecords.length,
  candidate_link_buckets: canonicalLinkRecords.length,
  alias_search_records: aliasSearchRecords.length,
  unresolved_review_records: reviewRecords.length,
  public_record_count_now: 0,
  computation_approved_record_count_now: 0,
  next_stage_not_auto_started: true,
};

const boundary = {
  module_id: "AG74O-R1E",
  title: "AG74O-R1E to AG74O-R2 Boundary",
  status: "ag74o_r1e_to_r2_boundary_locked",
  next_stage: "AG74O-R2",
  next_stage_purpose:
    "Correct the selector and calculation path so it consumes the unified governed index, resolves only explicitly approved records, and returns governed unavailable or calculation-pending states otherwise.",
  next_stage_not_auto_started: true,
  allowed_next_scope: [
    "Selector query and result contract correction",
    "Exact governed-record resolution",
    "Approval-aware calculation resolver",
    "Unavailable and calculation-pending state handling",
    "Location, coordinate and timezone provenance display",
    "No default Varanasi/today fabrication",
  ],
  carried_forward_mandatory_reviews: [
    "All seven unresolved R1C national-capital conflicts",
    "All 195 R1C capital timezone reviews",
    "All 196 R1D cross-bank reviews",
    "All 1,255 R1D coordinate/timezone reviews",
    "All 1,419 R1E unresolved canonical/search reviews",
    "All sacred/reference role-source reviews",
  ],
  blocked_without_explicit_validation: [
    "Public selector activation for candidate-only records",
    "Panchang computation for unapproved records",
    "Automatic canonical-place merging",
    "Automatic ambiguous-alias resolution",
    "Runtime external API dependency",
    "Supabase activation",
    "Homepage UI mutation outside the approved R2 correction boundary",
  ],
};

const quality = {
  module_id: "AG74O-R1E",
  status: "pass",
  issue_count: 0,
  generated_at_utc: generatedAt,
  checks: {
    unified_index_record_count: unifiedRecords.length === 7946,
    candidate_link_bucket_count: canonicalLinkRecords.length === 6483,
    alias_search_record_count: aliasSearchRecords.length === 6704,
    ambiguous_alias_review_count: ambiguousAliasCount === 24,
    coordinate_timezone_state_record_count:
      coordinateStateRecords.length === 7946,
    unresolved_review_record_count: reviewRecords.length === 1419,
    approval_state_record_count: approvalRecords.length === 7946,
    public_selection_approved_count_zero: true,
    computation_approved_count_zero: true,
    next_stage_is_r2: true,
  },
};

writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-unified-location-index.json",
  unifiedIndex
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-canonical-place-link-bank.json",
  canonicalLinkBank
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-unified-alias-search-index.json",
  aliasSearchIndex
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-coordinate-timezone-review-state-register.json",
  coordinateRegister
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-unresolved-canonical-review-queue.json",
  unresolvedQueue
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-source-attribution-continuity-register.json",
  sourceAttribution
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1e-approval-state-preservation-register.json",
  approvalRegister
);
writeJson(
  "data/content-intelligence/quality-reviews/ag74o-r1e-unified-location-index.json",
  review
);
writeJson(
  "data/content-intelligence/quality-registry/ag74o-r1e-ag74o-r2-selector-calculation-readiness-record.json",
  readiness
);
writeJson(
  "data/content-intelligence/mutation-plans/ag74o-r1e-to-ag74o-r2-selector-calculation-boundary.json",
  boundary
);
writeJson(
  "data/quality/ag74o-r1e-unified-location-index.json",
  quality
);

const doc = `# AG74O-R1E Unified Governed Location Index

## Status

AG74O-R1E is complete as a candidate-only unification and linkage stage.

## Produced records

- Unified source-role index records: ${unifiedRecords.length}
- Canonical-place candidate link buckets: ${canonicalLinkRecords.length}
- Unified alias/search-label records: ${aliasSearchRecords.length}
- Ambiguous search-label reviews: ${ambiguousAliasCount}
- Coordinate/timezone review-state records: ${coordinateStateRecords.length}
- Unresolved canonical/search review records: ${reviewRecords.length}
- Approval-state preservation records: ${approvalRecords.length}

## Canonical-place boundary

A comparison bucket is not an approved canonical place. Same-name administrative units, city roles, national capitals, major cities and sacred/reference roles remain separate until a governed review explicitly links them.

## Activation boundary

Public selection, Panchang computation, automatic canonical merging, automatic ambiguous-alias resolution, runtime external APIs, Supabase activation and homepage mutation remain disabled.

## Next stage

AG74O-R2 may correct the selector and calculation path to consume this governed index. It must resolve only explicitly approved records and otherwise show governed unavailable or calculation-pending states. R2 is ready for planning but is not automatically started.
`;
fs.mkdirSync(
  path.dirname(full("docs/quality/AG74O_R1E_UNIFIED_LOCATION_INDEX.md")),
  { recursive: true }
);
fs.writeFileSync(
  full("docs/quality/AG74O_R1E_UNIFIED_LOCATION_INDEX.md"),
  doc
);

console.log("✅ AG74O-R1E unified governed location index generated.");
console.log(`✅ Unified index records: ${unifiedRecords.length}`);
console.log(`✅ Candidate link buckets: ${canonicalLinkRecords.length}`);
console.log(`✅ Alias/search-label records: ${aliasSearchRecords.length}`);
console.log(`✅ Unresolved review records: ${reviewRecords.length}`);
console.log("✅ Public selection and Panchang computation approvals remain zero.");
