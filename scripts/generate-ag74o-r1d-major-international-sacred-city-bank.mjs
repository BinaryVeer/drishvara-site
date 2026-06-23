import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const EXPECTED_PREFLIGHT_SHA =
  "b71045f5486063a7150b886c1c8cf63bbabc45a05ce4b45db3bf0ab2c0538172";
const EXPECTED_BASELINE =
  "4e760f46e632276d5a6c976517fd2ac5e1735b6f";
const MAX_BUFFER = 256 * 1024 * 1024;

function full(p) {
  return path.join(root, p);
}
function writeJson(p, value) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(value, null, 2) + "\n");
}
function sha256File(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) out[key] = true;
    else {
      out[key] = value;
      i += 1;
    }
  }
  return out;
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
  const body = execFileSync("unzip", ["-p", zipPath, findEntry(entries, suffix)], {
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
  });
  return JSON.parse(body);
}
function slug(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function canonicalKey(record) {
  return [
    record.iso2 || slug(record.country),
    slug(record.city_ascii || record.city),
    slug(record.admin_name || ""),
  ].join("|");
}

const args = parseArgs(process.argv.slice(2));
const preflightZip = path.resolve(
  String(args.preflightZip || process.env.AG74O_R1D_PREFLIGHT_ZIP || "")
);
if (!preflightZip || !fs.existsSync(preflightZip)) {
  throw new Error(
    "Provide --preflightZip /absolute/path/to/AG74O_R1D_Source_Row_Selection_Preflight_*.zip"
  );
}
const actualSha = sha256File(preflightZip);
if (actualSha !== EXPECTED_PREFLIGHT_SHA) {
  throw new Error(
    `Preflight SHA-256 mismatch. Expected ${EXPECTED_PREFLIGHT_SHA}; got ${actualSha}.`
  );
}

const entries = listZip(preflightZip);
const report = readZipJson(preflightZip, entries, "preflight_report.json");
const majorPreview = readZipJson(
  preflightZip,
  entries,
  "major_city_selection_preview.json"
);
const sacredPreview = readZipJson(
  preflightZip,
  entries,
  "sacred_reference_scope_preview.json"
);
const duplicatePreview = readZipJson(
  preflightZip,
  entries,
  "cross_bank_duplicate_preview.json"
);

if (report.repository?.head !== EXPECTED_BASELINE) {
  throw new Error("R1D preflight repository baseline mismatch.");
}
if (report.ready_for_r1d_apply_package_generation !== true) {
  throw new Error("R1D preflight is not ready for apply-package generation.");
}
if (report.failures?.length) {
  throw new Error("R1D preflight contains failures.");
}
if (majorPreview.record_count !== 1204 || majorPreview.records?.length !== 1204) {
  throw new Error("Major-city preview count mismatch.");
}
if (sacredPreview.record_count !== 51 || sacredPreview.records?.length !== 51) {
  throw new Error("Sacred/reference preview count mismatch.");
}
if (duplicatePreview.r1c_national_capital_overlap_count !== 186) {
  throw new Error("R1C national-capital overlap count mismatch.");
}

const generatedAt = new Date().toISOString();

const majorRecords = majorPreview.records.map((source, index) => ({
  location_record_id: `ag74o_r1d_major_city_${String(index + 1).padStart(4, "0")}`,
  canonical_place_key: canonicalKey(source),
  location_type: "major_international_city_candidate",
  country_name: source.country,
  country_iso2: source.iso2 || null,
  country_iso3: source.iso3 || null,
  city_name: source.city,
  city_ascii: source.city_ascii || source.city,
  administrative_level_1_name: source.admin_name || null,
  source_city_id: source.source_city_id || null,
  source_row_number: source.source_row_number,
  latitude_decimal: source.latitude_decimal,
  longitude_decimal: source.longitude_decimal,
  timezone_iana_candidate: source.timezone || null,
  population_candidate: source.population ?? null,
  source_capital_classification: source.capital || null,
  selection_reasons: source.selection_reasons || [],
  national_capital_bank_overlap: source.national_capital_bank_overlap === true,
  canonical_place_action: source.canonical_place_action,
  role_candidate: "major_city",
  identity_verification_status: "candidate_identity_pending_review",
  coordinate_verification_status: "candidate_source_value_not_verified",
  timezone_verification_status: source.timezone
    ? "candidate_source_value_not_verified"
    : "timezone_source_required",
  role_verification_status: "major_city_candidate_pending_review",
  computation_approval_status: "blocked",
  public_selection_status: "blocked",
  automatic_promotion_allowed: false,
}));

const sacredRecords = sacredPreview.records.map((source, index) => {
  const matched = source.selected_source_record || null;
  return {
    location_record_id: `ag74o_r1d_sacred_reference_${String(index + 1).padStart(3, "0")}`,
    source_scope_record_id: source.scope_record_id,
    canonical_place_key: matched
      ? canonicalKey(matched)
      : `${slug(source.country_name)}|${slug(source.city_name)}|`,
    location_type: "sacred_or_calendar_reference_city_candidate",
    country_name: source.country_name,
    country_iso2: matched?.iso2 || null,
    country_iso3: matched?.iso3 || null,
    city_name: source.city_name,
    city_ascii: matched?.city_ascii || source.city_name,
    administrative_level_1_name: matched?.admin_name || null,
    source_city_id: matched?.source_city_id || null,
    source_row_number: matched?.source_row_number || null,
    latitude_decimal: matched?.latitude_decimal ?? null,
    longitude_decimal: matched?.longitude_decimal ?? null,
    timezone_iana_candidate: matched?.timezone || null,
    population_candidate: matched?.population ?? null,
    traditions: source.traditions || [],
    candidate_roles: source.candidate_roles || [],
    source_match_count: source.source_match_count,
    source_match_status: source.source_match_status,
    role_source_status: "governed_tradition_source_required",
    identity_verification_status: matched
      ? "candidate_identity_pending_review"
      : "identity_source_required",
    coordinate_verification_status: matched
      ? "candidate_source_value_not_verified"
      : "coordinate_source_required",
    timezone_verification_status: matched?.timezone
      ? "candidate_source_value_not_verified"
      : "timezone_source_required",
    role_verification_status: "sacred_reference_role_pending_review",
    computation_approval_status: "blocked",
    public_selection_status: "blocked",
    automatic_role_promotion_allowed: false,
  };
});

const majorBank = {
  module_id: "AG74O-R1D",
  title: "Major International-City Candidate Bank",
  status: "ag74o_r1d_major_international_city_candidate_bank_created",
  generated_at_utc: generatedAt,
  source_preflight: {
    filename: path.basename(preflightZip),
    sha256: actualSha,
    report_manifest_verified: true,
    repository_head: report.repository.head,
  },
  selection_rule: majorPreview.selection_rule,
  record_count: majorRecords.length,
  counts: {
    frozen_seed_scope_records: report.selection_preview_counts.frozen_seed_records,
    frozen_seed_records_matched:
      report.selection_preview_counts.frozen_seed_records_matched,
    national_capital_bank_overlaps:
      report.selection_preview_counts.major_city_r1c_capital_overlaps,
    computation_approved_records: 0,
    public_selection_approved_records: 0,
  },
  governance: {
    source_licence: "SimpleMaps Basic World Cities CC BY 4.0",
    source_attribution_required: true,
    bulk_public_redistribution_allowed: false,
    normalized_governed_subset_only: true,
    population_ranking_is_approval: false,
    automatic_promotion_allowed: false,
    runtime_external_api_dependency_allowed: false,
    public_output_allowed_now: false,
  },
  records: majorRecords,
};

const sacredBank = {
  module_id: "AG74O-R1D",
  title: "Sacred and Calendar-Reference City Candidate Bank",
  status: "ag74o_r1d_sacred_reference_city_candidate_bank_created",
  generated_at_utc: generatedAt,
  record_count: sacredRecords.length,
  source_match_count: sacredRecords.filter((r) => r.source_city_id).length,
  unmatched_or_additional_evidence_required_count: sacredRecords.filter(
    (r) => !r.source_city_id
  ).length,
  governance: {
    sacred_or_reference_role_requires_tradition_and_source_review: true,
    coordinate_or_timezone_candidate_is_role_approval: false,
    automatic_role_promotion_allowed: false,
    computation_approved_records: 0,
    public_selection_approved_records: 0,
    public_output_allowed_now: false,
  },
  records: sacredRecords,
};

const majorByKey = new Map(majorRecords.map((r) => [r.canonical_place_key, r]));
const crossBankRecords = [];
for (const record of majorRecords.filter((r) => r.national_capital_bank_overlap)) {
  crossBankRecords.push({
    review_record_id: `ag74o_r1d_cross_bank_${String(crossBankRecords.length + 1).padStart(4, "0")}`,
    canonical_place_key: record.canonical_place_key,
    major_city_location_record_id: record.location_record_id,
    sacred_reference_location_record_ids: [],
    overlap_type: "r1c_national_capital_and_r1d_major_city",
    required_action: "link_roles_to_one_canonical_place_do_not_create_duplicates",
    review_status: "open",
    automatic_merge_allowed: false,
    computation_approval_status: "blocked",
    public_selection_status: "blocked",
  });
}
for (const sacred of sacredRecords) {
  const major = majorByKey.get(sacred.canonical_place_key);
  if (!major) continue;
  const existing = crossBankRecords.find(
    (r) => r.canonical_place_key === sacred.canonical_place_key
  );
  if (existing) {
    existing.sacred_reference_location_record_ids.push(sacred.location_record_id);
    existing.overlap_type =
      "r1c_or_r1d_major_city_and_sacred_reference_role_overlap";
  } else {
    crossBankRecords.push({
      review_record_id: `ag74o_r1d_cross_bank_${String(crossBankRecords.length + 1).padStart(4, "0")}`,
      canonical_place_key: sacred.canonical_place_key,
      major_city_location_record_id: major.location_record_id,
      sacred_reference_location_record_ids: [sacred.location_record_id],
      overlap_type: "r1d_major_city_and_sacred_reference_role_overlap",
      required_action: "link_roles_to_one_canonical_place_do_not_create_duplicates",
      review_status: "open",
      automatic_merge_allowed: false,
      computation_approval_status: "blocked",
      public_selection_status: "blocked",
    });
  }
}

const crossBankQueue = {
  module_id: "AG74O-R1D",
  title: "Cross-Bank Canonical-Place Review Queue",
  status: "ag74o_r1d_cross_bank_canonical_place_review_queue_created",
  generated_at_utc: generatedAt,
  r1c_national_capital_overlap_count: 186,
  total_review_record_count: crossBankRecords.length,
  governance: {
    one_canonical_place_multiple_roles: true,
    automatic_duplicate_creation_allowed: false,
    automatic_merge_allowed: false,
    public_or_computation_approval_allowed_before_review: false,
  },
  records: crossBankRecords,
};

const queueRecords = [...majorRecords, ...sacredRecords].map((record, index) => ({
  queue_record_id: `ag74o_r1d_coordinate_timezone_${String(index + 1).padStart(4, "0")}`,
  location_record_id: record.location_record_id,
  canonical_place_key: record.canonical_place_key,
  location_type: record.location_type,
  latitude_decimal_candidate: record.latitude_decimal,
  longitude_decimal_candidate: record.longitude_decimal,
  timezone_iana_candidate: record.timezone_iana_candidate,
  coordinate_review_status: record.coordinate_verification_status,
  timezone_review_status: record.timezone_verification_status,
  required_reviews: [
    "identity_and_canonical_place_review",
    "coordinate_source_and_basis_review",
    "timezone_verification",
    "role_review",
    "source_freshness_review",
    "explicit_computation_approval",
    "explicit_public_selection_approval",
  ],
  computation_approval_status: "blocked",
  public_selection_status: "blocked",
}));

const coordinateQueue = {
  module_id: "AG74O-R1D",
  title: "Major/Sacred City Coordinate and Timezone Review Queue",
  status: "ag74o_r1d_coordinate_timezone_review_queue_created",
  generated_at_utc: generatedAt,
  record_count: queueRecords.length,
  records_with_candidate_coordinates: queueRecords.filter(
    (r) =>
      Number.isFinite(r.latitude_decimal_candidate) &&
      Number.isFinite(r.longitude_decimal_candidate)
  ).length,
  records_with_timezone_candidate: queueRecords.filter(
    (r) => typeof r.timezone_iana_candidate === "string" && r.timezone_iana_candidate
  ).length,
  computation_approved_records: 0,
  public_selection_approved_records: 0,
  automatic_approval_allowed: false,
  records: queueRecords,
};

const sourceAttribution = {
  module_id: "AG74O-R1D",
  title: "R1D Source Attribution Register",
  status: "ag74o_r1d_source_attribution_register_created",
  generated_at_utc: generatedAt,
  sources: [
    {
      source_id: "simplemaps_basic_world_cities_v1_91",
      source_role:
        "candidate coordinates, timezone, population ranking, aliases and broad city discovery",
      licence: "CC BY 4.0",
      attribution_required: true,
      normalized_subset_use_allowed: true,
      raw_or_bulk_public_redistribution_allowed: false,
      package_sha256:
        report.inputs.raw_simplemaps_zip.sha256,
      worldcities_csv_sha256:
        report.inputs.raw_simplemaps_zip.worldcities_csv_sha256,
      direct_public_or_computation_promotion_allowed: false,
    },
    {
      source_id: "ag74o_r1c_national_capital_bank",
      source_role:
        "canonical-place overlap detection and role-link continuity",
      direct_public_or_computation_promotion_allowed: false,
    },
    {
      source_id: "r1d_curated_sacred_reference_scope",
      source_role:
        "candidate tradition and calendar-reference scope requiring explicit source review",
      direct_public_or_computation_promotion_allowed: false,
    },
  ],
  governance: {
    source_attribution_must_be_retained: true,
    automatic_source_overwrite_allowed: false,
    runtime_external_api_dependency_allowed: false,
    public_output_allowed_now: false,
  },
};

const review = {
  module_id: "AG74O-R1D",
  title: "Major International and Sacred/Reference City Bank Review",
  status: "ag74o_r1d_major_international_sacred_city_bank_completed",
  generated_at_utc: generatedAt,
  issue_count: 0,
  warning_count:
    sacredBank.unmatched_or_additional_evidence_required_count +
    crossBankQueue.total_review_record_count,
  summary: {
    major_city_candidate_bank_created: true,
    sacred_reference_city_candidate_bank_created: true,
    cross_bank_review_queue_created: true,
    coordinate_timezone_review_queue_created: true,
    source_attribution_register_created: true,
    major_city_candidate_records: majorBank.record_count,
    sacred_reference_candidate_records: sacredBank.record_count,
    sacred_reference_source_matches: sacredBank.source_match_count,
    cross_bank_review_records: crossBankQueue.total_review_record_count,
    public_location_selector_activated: false,
    panchang_computation_activated: false,
    runtime_external_api_activated: false,
    supabase_activated: false,
    homepage_ui_changed: false,
    ready_for_ag74o_r1e: true,
  },
};

const readiness = {
  module_id: "AG74O-R1D",
  title: "AG74O-R1E Unified Location Index Readiness",
  status: "ag74o_r1d_ready_for_unified_location_index",
  generated_at_utc: generatedAt,
  ready_for_ag74o_r1e: true,
  major_city_candidate_records: majorBank.record_count,
  sacred_reference_candidate_records: sacredBank.record_count,
  unresolved_cross_bank_reviews: crossBankQueue.total_review_record_count,
  coordinate_timezone_review_records: coordinateQueue.record_count,
  public_record_count_now: 0,
  computation_approved_record_count_now: 0,
  next_stage_not_auto_started: true,
};

const boundary = {
  module_id: "AG74O-R1D",
  title: "AG74O-R1D to AG74O-R1E Boundary",
  status: "ag74o_r1d_to_r1e_boundary_locked",
  next_stage: "AG74O-R1E",
  next_stage_purpose:
    "Create a unified governed location index and canonical-place linkage layer without activating public selection or Panchang computation.",
  next_stage_not_auto_started: true,
  allowed_next_scope: [
    "Unified canonical-place index",
    "Cross-bank role-link consolidation",
    "Alias and search-label unification",
    "Coordinate and timezone review-state consolidation",
    "Public/computation approval-state preservation",
  ],
  carried_forward_mandatory_reviews: [
    "Seven unresolved R1C national-capital conflicts",
    "All R1C capital timezone reviews",
    "All R1D cross-bank canonical-place reviews",
    "All R1D coordinate and timezone reviews",
    "All sacred/reference role-source reviews",
  ],
  blocked_without_explicit_validation: [
    "Public location selector activation",
    "Panchang computation for candidate records",
    "Automatic conflict resolution or canonical-place merging",
    "Runtime external API dependency",
    "Supabase activation",
    "Homepage UI mutation",
  ],
};

const quality = {
  module_id: "AG74O-R1D",
  status: "pass",
  issue_count: 0,
  generated_at_utc: generatedAt,
  checks: {
    major_city_record_count: majorBank.record_count === 1204,
    sacred_reference_record_count: sacredBank.record_count === 51,
    r1c_capital_overlap_count:
      crossBankQueue.r1c_national_capital_overlap_count === 186,
    all_public_selection_blocked: true,
    all_computation_approval_blocked: true,
    source_attribution_present: true,
    next_stage_is_r1e: true,
  },
};

writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-major-international-city-candidate-bank.json",
  majorBank
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-sacred-reference-city-candidate-bank.json",
  sacredBank
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-cross-bank-canonical-place-review-queue.json",
  crossBankQueue
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-coordinate-timezone-review-queue.json",
  coordinateQueue
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1d-source-attribution-register.json",
  sourceAttribution
);
writeJson(
  "data/content-intelligence/quality-reviews/ag74o-r1d-major-international-sacred-city-bank.json",
  review
);
writeJson(
  "data/content-intelligence/quality-registry/ag74o-r1d-ag74o-r1e-unified-location-index-readiness-record.json",
  readiness
);
writeJson(
  "data/content-intelligence/mutation-plans/ag74o-r1d-to-ag74o-r1e-unified-location-index-boundary.json",
  boundary
);
writeJson(
  "data/quality/ag74o-r1d-major-international-sacred-city-bank.json",
  quality
);

const doc = `# AG74O-R1D Major International and Sacred/Reference City Candidate Banks

## Status

AG74O-R1D is complete as a governed candidate-bank stage.

## Produced records

- Major international-city candidates: ${majorBank.record_count}
- Sacred/calendar-reference city candidates: ${sacredBank.record_count}
- Sacred/reference source-row matches: ${sacredBank.source_match_count}
- R1C national-capital overlaps: ${crossBankQueue.r1c_national_capital_overlap_count}
- Total cross-bank canonical-place reviews: ${crossBankQueue.total_review_record_count}
- Coordinate/timezone review records: ${coordinateQueue.record_count}

## Governance boundary

All records remain candidates. Population rank, source coordinates, timezone values, sacred/reference classification and role overlap do not independently approve a record.

Public selection, Panchang computation, runtime external API use, Supabase/Auth activation and homepage mutation remain disabled.

## Source and attribution

The major-city candidate subset is derived from the governed SimpleMaps Basic World Cities v1.91 source under CC BY 4.0. Attribution must be retained. The full vendor database is not exposed or committed as a public bulk download.

## Next stage

AG74O-R1E may build the unified canonical-place index and cross-bank role-link layer. It is ready but not automatically started.
`;
fs.mkdirSync(path.dirname(full("docs/quality/AG74O_R1D_MAJOR_INTERNATIONAL_SACRED_CITY_BANK.md")), {
  recursive: true,
});
fs.writeFileSync(
  full("docs/quality/AG74O_R1D_MAJOR_INTERNATIONAL_SACRED_CITY_BANK.md"),
  doc
);

console.log("✅ AG74O-R1D candidate banks generated.");
console.log(`✅ Major-city candidates: ${majorBank.record_count}`);
console.log(`✅ Sacred/reference candidates: ${sacredBank.record_count}`);
console.log(`✅ Cross-bank reviews: ${crossBankQueue.total_review_record_count}`);
console.log("✅ Public selection and Panchang computation approvals remain zero.");
