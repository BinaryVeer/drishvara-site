import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();

function full(p) {
  return path.join(root, p);
}

function writeJson(p, value) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(value, null, 2) + "\n");
}

function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sha256File(file) {
  return sha256Buffer(fs.readFileSync(file));
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = value;
      index += 1;
    }
  }
  return parsed;
}

const MAX_ZIP_BUFFER = 512 * 1024 * 1024;

function listZip(zipPath) {
  return execFileSync("unzip", ["-Z1", zipPath], {
    encoding: "utf8",
    maxBuffer: MAX_ZIP_BUFFER,
  })
    .split(/\r?\n/)
    .filter(Boolean);
}

function readZipEntry(zipPath, entry) {
  return execFileSync("unzip", ["-p", zipPath, entry], {
    maxBuffer: MAX_ZIP_BUFFER,
  });
}

function findEntry(entries, suffix) {
  const matches = entries.filter((entry) => entry.endsWith(`/${suffix}`) || entry === suffix);
  if (matches.length !== 1) {
    throw new Error(`Expected one ZIP entry for ${suffix}; found ${matches.length}.`);
  }
  return matches[0];
}

function readZipJson(zipPath, entries, suffix) {
  return JSON.parse(readZipEntry(zipPath, findEntry(entries, suffix)).toString("utf8"));
}

function normaliseSearch(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function codeFor(record) {
  if (record.location_type === "state_or_union_territory") return record.state_lgd_code;
  if (record.location_type === "district") return record.district_lgd_code;
  if (record.location_type === "development_block") return record.block_lgd_code;
  if (record.location_type === "urban_local_body") return record.local_body_lgd_code;
  return null;
}

function baseLabel(record) {
  if (record.location_type === "state_or_union_territory") {
    return `${record.official_name} — State/UT — India`;
  }
  if (record.location_type === "district") {
    return `${record.official_name} District — ${record.state_name} — India`;
  }
  if (record.location_type === "development_block") {
    return `${record.official_name} Block — ${record.district_name} District — ${record.state_name} — India`;
  }
  if (record.location_type === "urban_local_body") {
    return `${record.official_name} — ${record.local_body_type || "Urban Local Body"} — ${record.state_name} — India`;
  }
  throw new Error(`Unsupported location type: ${record.location_type}`);
}

const args = parseArgs(process.argv.slice(2));
const sourceZip = path.resolve(
  String(args.sourceZip || process.env.AG74O_R1A_SOURCE_ZIP || "")
);

if (!sourceZip || !fs.existsSync(sourceZip)) {
  throw new Error(
    "Provide --sourceZip /absolute/path/to/AG74O_R1A_Combined_Provisional_LGD_*.zip"
  );
}

const sourcePackageSha256 = sha256File(sourceZip);
if (args.expectedSha256 && sourcePackageSha256 !== args.expectedSha256) {
  throw new Error(
    `Source package SHA-256 mismatch. Expected ${args.expectedSha256}; got ${sourcePackageSha256}.`
  );
}

const entries = listZip(sourceZip);
const reportManifest = readZipJson(sourceZip, entries, "report_manifest.json");

for (const [relativePath, metadata] of Object.entries(reportManifest.files || {})) {
  const entry = findEntry(entries, relativePath);
  const buffer = readZipEntry(sourceZip, entry);
  const actualSha = sha256Buffer(buffer);
  if (actualSha !== metadata.sha256 || buffer.length !== metadata.bytes) {
    throw new Error(`Source report-manifest verification failed for ${relativePath}.`);
  }
}

const sourceBank = readZipJson(
  sourceZip,
  entries,
  "combined_provisional_location_bank.json"
);
const sourceCoverage = readZipJson(sourceZip, entries, "coverage_matrix.json");
const sourceArchives = readZipJson(
  sourceZip,
  entries,
  "source_archive_inventory.json"
);
const sourceWorkbooks = readZipJson(
  sourceZip,
  entries,
  "source_workbook_inventory.json"
);
const sourceDuplicates = readZipJson(
  sourceZip,
  entries,
  "duplicate_and_conflict_report.json"
);
const sourceAudit = readZipJson(sourceZip, entries, "normalisation_audit.json");

if (sourceBank.record_count !== 6493 || sourceBank.records.length !== 6493) {
  throw new Error("The reviewed source package must contain exactly 6,493 records.");
}

const expectedTypeCounts = {
  state_or_union_territory: 36,
  district: 784,
  development_block: 2631,
  urban_local_body: 3042,
};

const initialTypeCounts = {};
for (const record of sourceBank.records) {
  initialTypeCounts[record.location_type] =
    (initialTypeCounts[record.location_type] || 0) + 1;
}

for (const [type, count] of Object.entries(expectedTypeCounts)) {
  if (initialTypeCounts[type] !== count) {
    throw new Error(`Unexpected ${type} count: ${initialTypeCounts[type]}; expected ${count}.`);
  }
}

const preliminary = sourceBank.records.map((record) => {
  const lgdCode = String(codeFor(record) || "").trim();
  if (!lgdCode) {
    throw new Error(`Missing LGD code for ${record.canonical_location_id}.`);
  }

  const stateName =
    record.location_type === "state_or_union_territory"
      ? record.official_name
      : record.state_name || null;
  const stateCode =
    record.location_type === "state_or_union_territory"
      ? record.state_lgd_code
      : record.state_lgd_code || null;
  const districtName =
    record.location_type === "district"
      ? record.official_name
      : record.district_name || null;
  const districtCode =
    record.location_type === "district"
      ? record.district_lgd_code
      : record.district_lgd_code || null;

  const publicCandidateLabel = baseLabel(record);
  const aliases = [...new Set(record.aliases || [])]
    .map((alias) => String(alias).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return {
    location_record_id: record.canonical_location_id,
    entity_key: `${record.location_type}:${lgdCode}`,
    location_type: record.location_type,
    country_code: "IN",
    country_name: "India",
    official_name: record.official_name,
    local_name: record.local_name || null,
    aliases,
    state_or_ut_name: stateName,
    state_or_ut_lgd_code: stateCode,
    district_name: districtName,
    district_lgd_code: districtCode,
    subdistrict_name: null,
    subdistrict_lgd_code: null,
    development_block_name:
      record.location_type === "development_block" ? record.official_name : null,
    development_block_lgd_code:
      record.location_type === "development_block" ? record.block_lgd_code : null,
    urban_local_body_name:
      record.location_type === "urban_local_body" ? record.official_name : null,
    urban_local_body_lgd_code:
      record.location_type === "urban_local_body" ? record.local_body_lgd_code : null,
    urban_local_body_type:
      record.location_type === "urban_local_body"
        ? record.local_body_type || "Urban Local Body"
        : null,
    public_candidate_label: publicCandidateLabel,
    public_label_status: "provisional_pending_live_hierarchy_validation",
    internal_search_label: publicCandidateLabel,
    internal_search_key: normaliseSearch(publicCandidateLabel),
    timezone: "Asia/Kolkata",
    latitude_decimal: null,
    longitude_decimal: null,
    administrative_source_status:
      "official_manual_lgd_export_pending_live_api_revalidation",
    coordinate_source_status: "coordinate_pending",
    parent_hierarchy_status: record.parent_hierarchy_status || null,
    review_status: "provisional_manual_export_pending_live_api_revalidation",
    internal_search_index_allowed_now: true,
    computation_allowed_now: false,
    public_selection_allowed_now: false,
    source_provenance: {
      source_archives: record.source_archives || [],
      source_files: record.source_files || [],
      source_rows: record.source_rows || [],
      source_sha256: record.source_sha256 || [],
      duplicate_source_record_count: record.duplicate_source_record_count || 1,
      deduplication_status: record.deduplication_status,
    },
  };
});

const labelGroups = new Map();
for (const record of preliminary) {
  const key = record.internal_search_key;
  if (!labelGroups.has(key)) labelGroups.set(key, []);
  labelGroups.get(key).push(record);
}

let publicCandidateLabelCollisionGroupCount = 0;
let publicCandidateLabelCollisionRecordCount = 0;

for (const group of labelGroups.values()) {
  if (group.length <= 1) continue;
  publicCandidateLabelCollisionGroupCount += 1;
  publicCandidateLabelCollisionRecordCount += group.length;

  for (const record of group) {
    const lgdCode = record.entity_key.split(":").at(-1);
    record.internal_search_label = `${record.public_candidate_label} — LGD ${lgdCode}`;
    record.internal_search_key = normaliseSearch(record.internal_search_label);
    record.public_label_status =
      "provisional_collision_requires_live_district_or_hierarchy_disambiguation";
  }
}

const internalSearchKeys = new Set();
const recordIds = new Set();
const entityKeys = new Set();

for (const record of preliminary) {
  if (recordIds.has(record.location_record_id)) {
    throw new Error(`Duplicate location_record_id: ${record.location_record_id}`);
  }
  if (entityKeys.has(record.entity_key)) {
    throw new Error(`Duplicate entity_key: ${record.entity_key}`);
  }
  if (internalSearchKeys.has(record.internal_search_key)) {
    throw new Error(`Internal search label remains ambiguous: ${record.internal_search_label}`);
  }
  recordIds.add(record.location_record_id);
  entityKeys.add(record.entity_key);
  internalSearchKeys.add(record.internal_search_key);
}

preliminary.sort((a, b) => {
  const typeOrder = {
    state_or_union_territory: 1,
    district: 2,
    development_block: 3,
    urban_local_body: 4,
  };
  return (
    typeOrder[a.location_type] - typeOrder[b.location_type] ||
    a.state_or_ut_name.localeCompare(b.state_or_ut_name) ||
    String(a.district_name || "").localeCompare(String(b.district_name || "")) ||
    a.official_name.localeCompare(b.official_name) ||
    a.entity_key.localeCompare(b.entity_key)
  );
});

const generatedAt = new Date().toISOString();

const bank = {
  module_id: "AG74O-R1A",
  title: "Provisional India Location Bank",
  status: "ag74o_r1a_provisional_india_location_bank_generated",
  generated_at_utc: generatedAt,
  source_package: {
    filename: path.basename(sourceZip),
    sha256: sourcePackageSha256,
    report_manifest_verified: true,
  },
  governance: {
    source_mode: "official_manual_lgd_exports_pending_live_api_revalidation",
    raw_source_archives_committed_to_repository: false,
    normalized_snapshot_committed_to_repository: true,
    deduplication_key: "location_type_and_lgd_code",
    name_only_merge_allowed: false,
    runtime_external_fetch_required: false,
    live_napix_revalidation_pending: true,
    coordinate_enrichment_pending: true,
    subdistrict_import_pending: true,
  },
  counts: {
    total_record_count: preliminary.length,
    state_or_union_territory_count: expectedTypeCounts.state_or_union_territory,
    district_count: expectedTypeCounts.district,
    subdistrict_count: 0,
    development_block_count: expectedTypeCounts.development_block,
    urban_local_body_count: expectedTypeCounts.urban_local_body,
    approved_computation_record_count: 0,
    public_selection_record_count: 0,
    internal_search_record_count: preliminary.length,
    coordinate_pending_record_count: preliminary.length,
    public_candidate_label_collision_group_count:
      publicCandidateLabelCollisionGroupCount,
    public_candidate_label_collision_record_count:
      publicCandidateLabelCollisionRecordCount,
    internal_search_label_collision_count_after_disambiguation: 0,
  },
  completeness: {
    state_and_union_territory_identity_complete_for_snapshot: true,
    district_identity_complete_for_snapshot: true,
    subdistrict_identity_complete_for_snapshot: false,
    development_block_identity_complete_for_snapshot: false,
    urban_local_body_identity_complete_for_snapshot: false,
    coordinate_coverage_complete: false,
    public_activation_complete: false,
  },
  records: preliminary,
};

const schema = {
  module_id: "AG74O-R1A",
  title: "Provisional India Location Schema",
  status: "ag74o_r1a_provisional_india_location_schema_locked",
  required_record_fields: [
    "location_record_id",
    "entity_key",
    "location_type",
    "country_code",
    "country_name",
    "official_name",
    "aliases",
    "state_or_ut_name",
    "state_or_ut_lgd_code",
    "public_candidate_label",
    "public_label_status",
    "internal_search_label",
    "internal_search_key",
    "timezone",
    "latitude_decimal",
    "longitude_decimal",
    "administrative_source_status",
    "coordinate_source_status",
    "review_status",
    "internal_search_index_allowed_now",
    "computation_allowed_now",
    "public_selection_allowed_now",
    "source_provenance",
  ],
  supported_location_types: [
    "state_or_union_territory",
    "district",
    "subdistrict",
    "development_block",
    "urban_local_body",
  ],
  identity_rule: "Canonical identity is entity type plus official LGD code.",
  duplicate_rule: "Different LGD codes must never be merged only because their names match.",
  label_rule:
    "Public candidate labels are provisional. Internal labels append LGD code only when hierarchy is currently insufficient to disambiguate.",
  activation_rule:
    "A record requires verified active identity, verified hierarchy, approved coordinates and IANA timezone before public selection or Panchang computation.",
  timezone_rule:
    "India records use Asia/Kolkata unless a governed exception is introduced.",
  runtime_external_api_dependency_allowed: false,
  public_output_allowed_now: false,
};

const sourceManifest = {
  module_id: "AG74O-R1A",
  title: "Provisional India Location Source Manifest",
  status: "ag74o_r1a_source_snapshot_verified",
  generated_at_utc: generatedAt,
  normalized_source_package: {
    filename: path.basename(sourceZip),
    sha256: sourcePackageSha256,
    report_manifest_verified: true,
  },
  source_archives: sourceArchives,
  source_workbook_count: sourceWorkbooks.length,
  unclassified_source_count: sourceAudit.unclassified_source_count,
  source_normalisation_status: sourceAudit.status,
  source_counts: sourceCoverage.counts,
  conflict_counts: sourceAudit.conflict_counts,
  raw_source_archives_committed_to_repository: false,
  normalized_snapshot_committed_to_repository: true,
  live_napix_refresh_credentials_pending: true,
  public_output_allowed_now: false,
};

const reconciliationPolicy = {
  module_id: "AG74O-R1A",
  title: "Live NAPIX Reconciliation Policy",
  status: "ag74o_r1a_live_api_reconciliation_policy_locked",
  reconciliation_key: "location_type_and_lgd_code",
  rules: [
    "Preserve manual-export source provenance.",
    "Match live records by entity type and LGD code.",
    "Validate official name, local name, hierarchy, active status and timestamps.",
    "Replace provisional attributes only after live-source validation.",
    "Add live API codes absent from the provisional snapshot as new records.",
    "Mark stale or invalidated records superseded or retired; do not silently delete audit history.",
    "Never merge different LGD codes only because their names are identical.",
    "Resolve urban-local-body district and exact type from live API before public activation.",
    "Import sub-districts through the separate official API when access is approved.",
    "Keep coordinate approval separate from administrative identity approval.",
  ],
  automatic_public_promotion_allowed: false,
  automatic_computation_activation_allowed: false,
  public_output_allowed_now: false,
};

const review = {
  module_id: "AG74O-R1A",
  title: "Provisional India Location Bank Review",
  status: "ag74o_r1a_provisional_india_location_bank_completed",
  generated_at_utc: generatedAt,
  issue_count: 0,
  warning_count: 5,
  summary: {
    source_package_verified: true,
    official_manual_exports_loaded: true,
    state_identity_snapshot_complete: true,
    district_identity_snapshot_complete: true,
    partial_block_snapshot_loaded: true,
    partial_urban_local_body_snapshot_loaded: true,
    internal_search_labels_disambiguated: true,
    live_napix_revalidation_pending: true,
    subdistrict_import_pending: true,
    coordinate_enrichment_pending: true,
    public_selection_activated: false,
    panchang_computation_activated: false,
    ui_changed: false,
    backend_runtime_activated: false,
    supabase_activated: false,
    ready_for_ag74o_r1b: true,
  },
};

const readiness = {
  module_id: "AG74O-R1A",
  title: "AG74O-R1B Coordinate Enrichment Readiness",
  status: "ag74o_r1a_ready_for_coordinate_enrichment_architecture",
  ready_for_ag74o_r1b: true,
  available_internal_record_count: preliminary.length,
  public_record_count: 0,
  coordinate_pending_record_count: preliminary.length,
  blockers_for_final_location_activation: [
    "Live NAPIX revalidation",
    "Official sub-district import",
    "Remaining development-block import",
    "Remaining urban-local-body import",
    "Coordinate enrichment and provenance approval",
    "Public search-label hierarchy validation",
  ],
  next_stage_not_auto_started: true,
};

const boundary = {
  module_id: "AG74O-R1A",
  title: "AG74O-R1A to AG74O-R1B Boundary",
  status: "ag74o_r1a_boundary_locked",
  next_stage: "AG74O-R1B",
  next_stage_purpose:
    "Coordinate enrichment architecture, capital/reference-location roles and computation-approval queue.",
  next_stage_not_auto_started: true,
  allowed_next_scope: [
    "Coordinate-source hierarchy",
    "Headquarters and centroid review queue",
    "Capital, major-city and sacred-reference roles",
    "Timezone verification",
    "Computation-approval schema",
  ],
  blocked_without_explicit_validation: [
    "Public location-combobox activation",
    "Panchang computation for coordinate-pending records",
    "Runtime external API dependency",
    "Supabase activation",
    "Homepage UI change",
    "Deletion of historical AG70-AG74 location evidence",
  ],
};

const quality = {
  module_id: "AG74O-R1A",
  title: "Provisional India Location Bank Quality Record",
  status: "ag74o_r1a_completed",
  generated_at_utc: generatedAt,
  issue_count: 0,
  warning_count: 5,
  record_count: preliminary.length,
  state_or_union_territory_count: expectedTypeCounts.state_or_union_territory,
  district_count: expectedTypeCounts.district,
  subdistrict_count: 0,
  development_block_count: expectedTypeCounts.development_block,
  urban_local_body_count: expectedTypeCounts.urban_local_body,
  source_workbook_count: sourceWorkbooks.length,
  source_conflict_count: Object.values(sourceAudit.conflict_counts).reduce(
    (sum, count) => sum + count,
    0
  ),
  public_candidate_label_collision_group_count:
    publicCandidateLabelCollisionGroupCount,
  internal_search_label_collision_count: 0,
  computation_allowed_record_count: 0,
  public_selection_allowed_record_count: 0,
  browser_or_ui_change_performed: false,
  runtime_backend_activated: false,
  external_runtime_api_required: false,
  ready_for_ag74o_r1b: true,
};

const doc = `# AG74O-R1A — Provisional India Location Bank

AG74O-R1A imports the reviewed manual LGD export snapshot into a governed internal bank.

## Current snapshot

- 36 States and Union Territories
- 784 districts
- 0 sub-districts
- 2,631 development blocks
- 3,042 urban local bodies
- 6,493 internal searchable records
- 0 publicly selectable records
- 0 computation-approved records

## Governance

The source archives remain external evidence. The repository stores the normalized snapshot and source hashes. Identity is keyed by entity type plus LGD code. Name-only merging is prohibited.

The snapshot is suitable for internal schema and search-index development. It is not a complete live national hierarchy and is not a public Panchang location bank.

## Public-label boundary

District and urban-body names can legitimately coincide. Public candidate labels therefore remain provisional. When the present hierarchy cannot disambiguate two records, the internal search label appends the LGD code. Live API district mapping must replace that temporary internal disambiguation before public activation.

## Remaining gates

- live NAPIX revalidation;
- official sub-district import;
- remaining block and urban-local-body coverage;
- coordinate and provenance enrichment;
- public-label validation;
- computation approval.

No homepage UI, runtime backend, Supabase configuration or public calculation is changed by this stage.
`;

writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-bank.json",
  bank
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-schema.json",
  schema
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-source-manifest.json",
  sourceManifest
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1a-provisional-india-location-reconciliation-policy.json",
  reconciliationPolicy
);
writeJson(
  "data/content-intelligence/quality-reviews/ag74o-r1a-provisional-india-location-bank.json",
  review
);
writeJson(
  "data/content-intelligence/quality-registry/ag74o-r1a-ag74o-r1b-coordinate-enrichment-readiness-record.json",
  readiness
);
writeJson(
  "data/content-intelligence/mutation-plans/ag74o-r1a-to-ag74o-r1b-coordinate-enrichment-boundary.json",
  boundary
);
writeJson(
  "data/quality/ag74o-r1a-provisional-india-location-bank.json",
  quality
);
fs.mkdirSync(full("docs/quality"), { recursive: true });
fs.writeFileSync(full("docs/quality/AG74O_R1A_PROVISIONAL_INDIA_LOCATION_BANK.md"), doc);

console.log("✅ AG74O-R1A provisional India location bank generated.");
console.log(`✅ Records: ${preliminary.length}`);
console.log(`✅ Public/computation activation: 0`);
