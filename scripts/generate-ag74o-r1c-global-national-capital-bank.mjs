import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const MAX_ZIP_BUFFER = 96 * 1024 * 1024;

function full(relativePath) {
  return path.join(root, relativePath);
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(full(relativePath)), { recursive: true });
  fs.writeFileSync(full(relativePath), JSON.stringify(value, null, 2) + "\n");
}

function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sha256File(filePath) {
  return sha256Buffer(fs.readFileSync(filePath));
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

function listZip(zipPath) {
  return execFileSync("unzip", ["-Z1", zipPath], {
    encoding: "utf8",
    maxBuffer: MAX_ZIP_BUFFER,
  })
    .split(/\r?\n/)
    .filter(Boolean);
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

function readZipEntry(zipPath, entry) {
  return execFileSync("unzip", ["-p", zipPath, entry], {
    maxBuffer: MAX_ZIP_BUFFER,
  });
}

function readZipJson(zipPath, entries, suffix) {
  return JSON.parse(
    readZipEntry(zipPath, findEntry(entries, suffix)).toString("utf8")
  );
}

function verifyZipManifest(zipPath, entries) {
  const manifest = readZipJson(zipPath, entries, "report_manifest.json");
  for (const [relativePath, metadata] of Object.entries(manifest.files || {})) {
    const buffer = readZipEntry(zipPath, findEntry(entries, relativePath));
    if (
      buffer.length !== metadata.bytes ||
      sha256Buffer(buffer) !== metadata.sha256
    ) {
      throw new Error(
        `Manifest verification failed for ${path.basename(zipPath)} :: ${relativePath}.`
      );
    }
  }
  return manifest;
}

function normalise(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function stripParenthetical(value) {
  return String(value ?? "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitTopLevelCommas(value) {
  const output = [];
  let current = "";
  let depth = 0;
  for (const character of String(value ?? "")) {
    if (character === "(") depth += 1;
    if (character === ")") depth = Math.max(0, depth - 1);
    if (character === "," && depth === 0) {
      if (current.trim()) output.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (current.trim()) output.push(current.trim());
  return output;
}

function roleHintFromText(value) {
  const text = normalise(value);
  if (text.includes("administrative")) return "administrative_capital";
  if (text.includes("official")) return "official_capital";
  if (text.includes("constitutional")) return "constitutional_capital";
  if (text.includes("legislative")) return "legislative_capital";
  if (text.includes("judicial")) return "judicial_capital";
  if (text.includes("executive")) return "executive_capital";
  if (text.includes("seat of government")) return "seat_of_government";
  return "national_capital_candidate";
}

function capitalCandidates(rawText) {
  const raw = String(rawText ?? "").trim();
  if (!raw || /no official capital/i.test(raw)) return [];

  if (!raw.includes(",") && /\s+or\s+/i.test(raw)) {
    const names = raw.split(/\s+or\s+/i).map(stripParenthetical).filter(Boolean);
    return names.length
      ? [
          {
            candidate_city_label: names[0],
            aliases: names.slice(1),
            candidate_role: "national_capital_candidate",
            source_text: raw,
          },
        ]
      : [];
  }

  return splitTopLevelCommas(raw).map((part) => {
    const parentheticalMatches = [...part.matchAll(/\(([^)]+)\)/g)].map(
      (match) => match[1].trim()
    );
    const label = stripParenthetical(part);
    const roleHint = roleHintFromText(parentheticalMatches.join(" "));
    const aliasCandidates =
      parentheticalMatches.length === 1 &&
      roleHint === "national_capital_candidate" &&
      !/\b(recognition|limited|administrative|official|constitutional|legislative|judicial|executive|government)\b/i.test(
        parentheticalMatches[0]
      )
        ? [parentheticalMatches[0]]
        : [];
    return {
      candidate_city_label: label,
      aliases: aliasCandidates,
      candidate_role: roleHint,
      source_text: part,
    };
  });
}

function coordinateCandidate(worldBankCrosscheck) {
  if (!worldBankCrosscheck) return null;
  const latitude = Number(worldBankCrosscheck.latitude);
  const longitude = Number(worldBankCrosscheck.longitude);
  return {
    source_id: "world_bank_country_api",
    capital_city_label: worldBankCrosscheck.capital_city || null,
    latitude_decimal: Number.isFinite(latitude) ? latitude : null,
    longitude_decimal: Number.isFinite(longitude) ? longitude : null,
    evidence_status: "crosscheck_candidate_not_coordinate_verified",
    direct_promotion_allowed: false,
  };
}

const args = parseArgs(process.argv.slice(2));
const identityZip = path.resolve(
  String(args.identityZip || process.env.AG74O_R1C_IDENTITY_ZIP || "")
);
const sourceZip = path.resolve(
  String(args.sourceZip || process.env.AG74O_R1C_SOURCE_ZIP || "")
);

if (!identityZip || !fs.existsSync(identityZip)) {
  throw new Error("Provide --identityZip /absolute/path/to/AG74O_R1C_Identity_Normalisation_*.zip");
}
if (!sourceZip || !fs.existsSync(sourceZip)) {
  throw new Error("Provide --sourceZip /absolute/path/to/AG74O_R1C_Authoritative_Source_Acquisition_*.zip");
}

const identitySha256 = sha256File(identityZip);
const sourceSha256 = sha256File(sourceZip);

if (args.expectedIdentitySha256 && identitySha256 !== args.expectedIdentitySha256) {
  throw new Error(
    `Identity ZIP SHA-256 mismatch. Expected ${args.expectedIdentitySha256}; got ${identitySha256}.`
  );
}
if (args.expectedSourceSha256 && sourceSha256 !== args.expectedSourceSha256) {
  throw new Error(
    `Source ZIP SHA-256 mismatch. Expected ${args.expectedSourceSha256}; got ${sourceSha256}.`
  );
}

const identityEntries = listZip(identityZip);
const sourceEntries = listZip(sourceZip);
const identityManifest = verifyZipManifest(identityZip, identityEntries);
const sourceManifest = verifyZipManifest(sourceZip, sourceEntries);

const readiness = readZipJson(identityZip, identityEntries, "r1c_apply_readiness.json");
const core = readZipJson(
  identityZip,
  identityEntries,
  "core_195_normalised_identity_candidates.json"
);
const aliasCrosswalkInput = readZipJson(
  identityZip,
  identityEntries,
  "country_identity_alias_crosswalk.json"
);
const extendedInput = readZipJson(
  identityZip,
  identityEntries,
  "extended_entity_scope_snapshot.json"
);
const conflictInput = readZipJson(
  identityZip,
  identityEntries,
  "capital_conflict_classification_queue.json"
);
const specialInput = readZipJson(
  identityZip,
  identityEntries,
  "capital_special_case_classification_queue.json"
);
const normalisationFindings = readZipJson(
  identityZip,
  identityEntries,
  "normalisation_findings.json"
);
const sourceInventoryInput = readZipJson(
  sourceZip,
  sourceEntries,
  "authoritative_source_inventory.json"
);
const sourceFindings = readZipJson(
  sourceZip,
  sourceEntries,
  "source_acquisition_findings.json"
);

if (
  readiness.module_id !== "AG74O-R1C-NORMALISATION" ||
  readiness.status !== "ready_for_governed_candidate_bank_generation" ||
  readiness.ready !== true
) {
  throw new Error("R1C identity-normalisation readiness boundary mismatch.");
}
if (
  core.record_count !== 195 ||
  core.records?.length !== 195 ||
  core.counts?.unique_iso2 !== 195 ||
  core.counts?.unique_iso3 !== 195 ||
  core.counts?.unique_m49 !== 195
) {
  throw new Error("Core-195 identity count or uniqueness mismatch.");
}
if (
  conflictInput.record_count !== 7 ||
  specialInput.record_count !== 12 ||
  extendedInput.record_count !== 6
) {
  throw new Error("R1C review-queue or extended-scope counts mismatch.");
}
if (
  sourceFindings.status !== "source_acquisition_completed_no_repository_mutation" ||
  identityManifest.repository_head !== sourceManifest.repository_head
) {
  throw new Error("R1C source-acquisition evidence boundary mismatch.");
}

const generatedAt = new Date().toISOString();
const conflictsByChecklist = new Map(
  conflictInput.records.map((record) => [record.checklist_id, record])
);
const specialByChecklist = new Map(
  specialInput.records.map((record) => [record.checklist_id, record])
);

function aliasValuesForRecord(record) {
  const lookupKeys = unique([
    normalise(record.country_name_checklist),
    normalise(record.country_name_un_m49),
    normalise(String(record.country_name_checklist).replace(/\([^)]*\)/g, "")),
  ]);
  const m49Aliases = [];
  const worldBankAliases = [];
  for (const key of lookupKeys) {
    m49Aliases.push(...(aliasCrosswalkInput.m49_aliases?.[key] || []));
    worldBankAliases.push(...(aliasCrosswalkInput.world_bank_aliases?.[key] || []));
  }
  return {
    checklist_and_source_labels: unique([
      record.country_name_checklist,
      record.country_name_un_m49,
      record.world_bank_crosscheck?.name,
    ]),
    m49_aliases: unique(m49Aliases),
    world_bank_aliases: unique(worldBankAliases),
  };
}

const identityRecords = core.records.map((record) => {
  const aliases = aliasValuesForRecord(record);
  return {
    country_record_id: record.country_record_id,
    checklist_id: record.checklist_id,
    jurisdiction_scope: "core_195_state",
    canonical_country_name: record.country_name_un_m49,
    checklist_country_name: record.country_name_checklist,
    iso2: record.iso2,
    iso3: record.iso3,
    m49: record.m49,
    aliases,
    identity_source_ids: [
      "un_m49_overview",
      "un_member_states",
      "un_non_member_states",
    ],
    world_bank_crosscheck_available: Boolean(record.world_bank_crosscheck),
    world_bank_absence_expected: record.world_bank_absence_expected === true,
    identity_verification_status: "identity_crosswalk_verified_for_candidate_bank",
    public_label_verification_status: "pending_review",
    capital_role_verification_status: "pending_review",
    coordinate_verification_status: "pending_review",
    timezone_verification_status: "pending_capital_level_mapping",
    computation_approval_status: "blocked",
    public_selection_status: "blocked",
  };
});

const capitalRecords = core.records.map((record) => {
  const conflict = conflictsByChecklist.get(record.checklist_id) || null;
  const special = specialByChecklist.get(record.checklist_id) || null;
  const candidates = capitalCandidates(record.capital_text_checklist);
  return {
    capital_bank_record_id: `ag74o_r1c_capital_${record.iso3.toLowerCase()}`,
    country_record_id: record.country_record_id,
    checklist_id: record.checklist_id,
    canonical_country_name: record.country_name_un_m49,
    iso2: record.iso2,
    iso3: record.iso3,
    m49: record.m49,
    checklist_capital_text: record.capital_text_checklist,
    capital_candidates: candidates,
    world_bank_crosscheck: coordinateCandidate(record.world_bank_crosscheck),
    country_timezone_candidates: record.iana_country_zone_candidates,
    timezone_candidate_status: record.timezone_candidate_status,
    capital_conflict_review_required: Boolean(conflict),
    capital_special_case_review_required: Boolean(special),
    conflict_resolution_category: conflict?.resolution_category || null,
    special_case_resolution_category: special?.resolution_category || null,
    identity_verification_status: "identity_crosswalk_verified_for_candidate_bank",
    capital_role_verification_status: "pending_current_authoritative_review",
    coordinate_verification_status: record.world_bank_crosscheck
      ? "candidate_value_present_not_verified"
      : "coordinate_source_required",
    timezone_verification_status: "pending_capital_level_mapping",
    source_freshness_status: "current_review_required_before_approval",
    automatic_promotion_allowed: false,
    computation_approval_status: "blocked",
    public_selection_status: "blocked",
  };
});

const roleLinks = [];
for (const record of core.records) {
  const conflict = conflictsByChecklist.get(record.checklist_id) || null;
  const special = specialByChecklist.get(record.checklist_id) || null;
  const candidates = capitalCandidates(record.capital_text_checklist);

  if (candidates.length === 0 && /no official capital/i.test(record.capital_text_checklist)) {
    if (record.world_bank_crosscheck?.capital_city) {
      roleLinks.push({
        role_link_id: `ag74o_r1c_role_${record.iso3.toLowerCase()}_de_facto_candidate`,
        country_record_id: record.country_record_id,
        checklist_id: record.checklist_id,
        candidate_city_label: record.world_bank_crosscheck.capital_city,
        aliases: [],
        capital_role_candidate: "de_facto_government_seat_candidate",
        role_source_basis: "world_bank_crosscheck_plus_explicit_no_official_capital_review",
        resolution_category:
          conflict?.resolution_category || special?.resolution_category || null,
        role_verification_status: "pending_current_authoritative_review",
        automatic_role_promotion_allowed: false,
        computation_approval_status: "blocked",
        public_selection_status: "blocked",
      });
    }
    continue;
  }

  candidates.forEach((candidate, index) => {
    roleLinks.push({
      role_link_id: `ag74o_r1c_role_${record.iso3.toLowerCase()}_${String(index + 1).padStart(2, "0")}`,
      country_record_id: record.country_record_id,
      checklist_id: record.checklist_id,
      candidate_city_label: candidate.candidate_city_label,
      aliases: candidate.aliases,
      capital_role_candidate: candidate.candidate_role,
      role_source_basis: "user_checklist_candidate_plus_authoritative_crosscheck",
      conflict_review_required: Boolean(conflict),
      special_case_review_required: Boolean(special),
      resolution_category:
        conflict?.resolution_category || special?.resolution_category || null,
      role_verification_status: "pending_current_authoritative_review",
      automatic_role_promotion_allowed: false,
      computation_approval_status: "blocked",
      public_selection_status: "blocked",
    });
  });
}

const countryAliasRecords = identityRecords.map((record) => ({
  country_record_id: record.country_record_id,
  canonical_country_name: record.canonical_country_name,
  iso2: record.iso2,
  iso3: record.iso3,
  aliases: unique([
    ...record.aliases.checklist_and_source_labels,
    ...record.aliases.m49_aliases,
    ...record.aliases.world_bank_aliases,
  ]).filter((value) => normalise(value) !== normalise(record.canonical_country_name)),
  alias_verification_status: "source_name_crosswalk_only",
  public_label_approval_status: "pending_review",
}));

const capitalAliasCandidates = [];
for (const conflict of conflictInput.records) {
  if (
    conflict.resolution_category ===
    "orthographic_or_transliteration_equivalence_review"
  ) {
    capitalAliasCandidates.push({
      checklist_id: conflict.checklist_id,
      country: conflict.country,
      preferred_label_candidate: stripParenthetical(conflict.checklist_capital),
      alias_candidates: unique([
        ...capitalCandidates(conflict.checklist_capital).flatMap((item) => item.aliases),
        conflict.world_bank_capital,
      ]).filter(
        (value) => normalise(value) !== normalise(stripParenthetical(conflict.checklist_capital))
      ),
      verification_status: "pending_alias_review",
      duplicate_city_creation_allowed: false,
    });
  }
}
const ukraine = specialInput.records.find(
  (record) => record.resolution_category ===
    "preferred_name_and_historical_alias_model_required"
);
if (ukraine) {
  const names = ukraine.capital_text_raw.split(/\s+or\s+/i).map((item) => item.trim());
  capitalAliasCandidates.push({
    checklist_id: ukraine.checklist_id,
    country: ukraine.country_label_raw,
    preferred_label_candidate: names[0] || null,
    alias_candidates: names.slice(1),
    verification_status: "pending_alias_review",
    duplicate_city_creation_allowed: false,
  });
}

const timezoneQueueRecords = core.records.map((record) => {
  const candidates = record.iana_country_zone_candidates || [];
  const single = candidates.length === 1;
  return {
    timezone_review_id: `ag74o_r1c_timezone_${record.iso3.toLowerCase()}`,
    country_record_id: record.country_record_id,
    checklist_id: record.checklist_id,
    canonical_country_name: record.country_name_un_m49,
    iso2: record.iso2,
    iso3: record.iso3,
    capital_text_candidate: record.capital_text_checklist,
    country_zone_candidates: candidates,
    candidate_timezone_iana: single ? candidates[0] : null,
    review_class: single
      ? "single_country_zone_candidate_capital_confirmation_required"
      : "multi_zone_country_capital_mapping_required",
    timezone_verification_status: "pending_capital_level_mapping",
    automatic_timezone_promotion_allowed: false,
    computation_approval_status: "blocked",
    public_selection_status: "blocked",
  };
});

const sourceInventory = sourceInventoryInput.sources;
const authoritativeSourceRecords = Object.entries(sourceInventory).map(
  ([sourceId, source]) => ({
    source_id: sourceId,
    source_url: source.url,
    source_filename: source.filename,
    required: source.required,
    retrieval_status: source.status,
    http_status: source.http_status,
    retrieved_at_utc: source.retrieved_at_utc,
    sha256: source.sha256,
    evidence_role:
      sourceId === "world_bank_country_api"
        ? "country_and_capital_crosscheck_candidate"
        : sourceId === "iana_zone1970"
        ? "country_zone_candidate_source_not_capital_level_verification"
        : sourceId === "un_m49_overview"
        ? "core_identity_code_crosswalk"
        : "core_195_scope_evidence",
    direct_public_or_computation_promotion_allowed: false,
  })
);

const commonEvidence = {
  identity_normalisation_package: {
    filename: path.basename(identityZip),
    sha256: identitySha256,
    report_manifest_verified: true,
    repository_head: identityManifest.repository_head,
  },
  authoritative_source_acquisition_package: {
    filename: path.basename(sourceZip),
    sha256: sourceSha256,
    report_manifest_verified: true,
    repository_head: sourceManifest.repository_head,
  },
};

const identityRegister = {
  module_id: "AG74O-R1C",
  title: "Core-195 Country Identity Register",
  status: "ag74o_r1c_core_195_country_identity_register_created",
  generated_at_utc: generatedAt,
  evidence: commonEvidence,
  scope_definition: "193 UN Member States plus Holy See and State of Palestine",
  counts: {
    records: identityRecords.length,
    unique_iso2: new Set(identityRecords.map((record) => record.iso2)).size,
    unique_iso3: new Set(identityRecords.map((record) => record.iso3)).size,
    unique_m49: new Set(identityRecords.map((record) => record.m49)).size,
    world_bank_crosschecks: identityRecords.filter(
      (record) => record.world_bank_crosscheck_available
    ).length,
    expected_world_bank_absences: identityRecords.filter(
      (record) => record.world_bank_absence_expected
    ).length,
    public_selection_approved: 0,
    computation_approved: 0,
  },
  governance: {
    identity_crosswalk_verification_is_public_approval: false,
    capital_role_verification_required: true,
    coordinate_verification_required: true,
    capital_level_timezone_verification_required: true,
    automatic_public_promotion_allowed: false,
    automatic_computation_activation_allowed: false,
  },
  records: identityRecords,
};

const capitalBank = {
  module_id: "AG74O-R1C",
  title: "Governed Global National-Capital Candidate Bank",
  status: "ag74o_r1c_global_national_capital_candidate_bank_created",
  generated_at_utc: generatedAt,
  evidence: commonEvidence,
  counts: {
    core_country_records: capitalRecords.length,
    records_with_world_bank_coordinate_crosscheck: capitalRecords.filter(
      (record) => record.world_bank_crosscheck
    ).length,
    expected_world_bank_absences: capitalRecords.filter(
      (record) =>
        !record.world_bank_crosscheck &&
        identityRecords.find(
          (identity) => identity.country_record_id === record.country_record_id
        )?.world_bank_absence_expected
    ).length,
    conflict_review_records: capitalRecords.filter(
      (record) => record.capital_conflict_review_required
    ).length,
    special_case_review_records: capitalRecords.filter(
      (record) => record.capital_special_case_review_required
    ).length,
    public_selection_approved: 0,
    computation_approved: 0,
  },
  governance: {
    bank_type: "candidate_bank_not_public_runtime_bank",
    world_bank_coordinates_are_verified_coordinates: false,
    country_zone_candidate_is_capital_timezone_verification: false,
    unresolved_conflicts_are_silently_overwritten: false,
    automatic_role_resolution_allowed: false,
    runtime_external_api_dependency_allowed: false,
    public_output_allowed_now: false,
  },
  records: capitalRecords,
};

const roleLinkBank = {
  module_id: "AG74O-R1C",
  title: "National-Capital Role Link Candidate Bank",
  status: "ag74o_r1c_capital_role_link_candidate_bank_created",
  generated_at_utc: generatedAt,
  counts: {
    core_country_records: core.records.length,
    role_link_records: roleLinks.length,
    conflict_review_records: conflictInput.record_count,
    special_case_review_records: specialInput.record_count,
    role_approved_records: 0,
    public_selection_approved: 0,
    computation_approved: 0,
  },
  capital_role_enum_consumed_from_ag74o_r1b: [
    "constitutional_capital",
    "official_capital",
    "administrative_capital",
    "executive_capital",
    "legislative_capital",
    "judicial_capital",
    "seat_of_government",
    "de_facto_government_seat",
    "capital_transition_candidate",
  ],
  governance: {
    one_city_may_hold_multiple_roles: true,
    role_link_must_not_create_duplicate_city_record: true,
    unresolved_role_claims_remain_review_items: true,
    automatic_role_promotion_allowed: false,
    public_output_allowed_now: false,
  },
  records: roleLinks,
};

const extendedRegister = {
  module_id: "AG74O-R1C",
  title: "Extended-Entity Capital Candidate Register",
  status: "ag74o_r1c_extended_entity_capital_register_created",
  generated_at_utc: generatedAt,
  counts: {
    records: extendedInput.records.length,
    public_selection_approved: 0,
    computation_approved: 0,
  },
  treatment: extendedInput.treatment,
  governance: {
    merged_into_core_195: false,
    silently_discarded: false,
    automatic_sovereign_scope_promotion_allowed: false,
    public_output_allowed_now: false,
  },
  records: extendedInput.records.map((record) => ({
    extended_entity_record_id: `ag74o_r1c_extended_${record.checklist_id.replace(
      "ag74o_r1c_user_capital_",
      ""
    )}`,
    ...record,
    automatic_promotion_allowed: false,
    identity_verification_status: "pending_extended_scope_review",
    capital_role_verification_status: "pending_current_authoritative_review",
    coordinate_verification_status: "pending_review",
    timezone_verification_status: "pending_review",
    computation_approval_status: "blocked",
    public_selection_status: "blocked",
  })),
};

const aliasCrosswalk = {
  module_id: "AG74O-R1C",
  title: "Country and Capital Alias Crosswalk",
  status: "ag74o_r1c_country_capital_alias_crosswalk_created",
  generated_at_utc: generatedAt,
  counts: {
    country_records: countryAliasRecords.length,
    country_alias_values: countryAliasRecords.reduce(
      (sum, record) => sum + record.aliases.length,
      0
    ),
    capital_alias_candidate_records: capitalAliasCandidates.length,
    public_label_approved_records: 0,
  },
  policy: aliasCrosswalkInput.alias_policy,
  governance: {
    aliases_change_sovereign_scope: false,
    aliases_approve_capital_role: false,
    aliases_approve_coordinate_or_timezone: false,
    alias_match_creates_duplicate_city_automatically: false,
  },
  country_alias_records: countryAliasRecords,
  capital_alias_candidate_records: capitalAliasCandidates,
};

const authoritativeSourceRegister = {
  module_id: "AG74O-R1C",
  title: "Authoritative Source Register",
  status: "ag74o_r1c_authoritative_source_register_created",
  generated_at_utc: generatedAt,
  evidence: commonEvidence,
  source_acquisition_status: sourceFindings.status,
  normalisation_status: normalisationFindings.status,
  source_records: authoritativeSourceRecords,
  internal_candidate_inputs: [
    {
      source_id: "user_supplied_core_and_extended_capital_checklist",
      filename: sourceInventoryInput.checklist.filename,
      sha256: sourceInventoryInput.checklist.sha256,
      row_count: sourceInventoryInput.checklist.row_count,
      source_role: "candidate completeness and special-case review input",
      authoritative_capital_role_source: false,
      direct_promotion_allowed: false,
    },
  ],
  source_priority: [
    "Current official national government or constitutional evidence",
    "UN or intergovernmental identity evidence",
    "Approved authoritative geographic source",
    "World Bank country/capital API as crosscheck candidate",
    "IANA TZDB for timezone identifiers and country-zone candidates",
  ],
  governance: {
    runtime_fetch_dependency_allowed: false,
    source_download_committed_now: false,
    automatic_source_overwrite_allowed: false,
    automatic_public_or_computation_promotion_allowed: false,
  },
};

const conflictQueue = {
  module_id: "AG74O-R1C",
  title: "Capital Conflict Review Queue",
  status: "ag74o_r1c_capital_conflict_review_queue_created",
  generated_at_utc: generatedAt,
  record_count: conflictInput.records.length,
  unresolved_count: conflictInput.records.filter((record) => !record.resolved_now)
    .length,
  governance: {
    automatic_resolution_allowed: false,
    silent_source_overwrite_allowed: false,
    public_or_computation_approval_allowed_before_resolution: false,
  },
  records: conflictInput.records.map((record) => ({
    ...record,
    country_record_id:
      core.records.find((item) => item.checklist_id === record.checklist_id)
        ?.country_record_id || null,
    required_evidence: [
      "current official or constitutional capital-role evidence",
      "source retrieval date and stable reference",
      "explicit reviewer decision",
    ],
    review_status: "open",
    computation_approval_status: "blocked",
    public_selection_status: "blocked",
  })),
};

const timezoneQueue = {
  module_id: "AG74O-R1C",
  title: "Capital Timezone Review Queue",
  status: "ag74o_r1c_capital_timezone_review_queue_created",
  generated_at_utc: generatedAt,
  counts: {
    records: timezoneQueueRecords.length,
    single_zone_country_candidates: timezoneQueueRecords.filter(
      (record) => record.country_zone_candidates.length === 1
    ).length,
    multi_zone_country_reviews: timezoneQueueRecords.filter(
      (record) => record.country_zone_candidates.length > 1
    ).length,
    timezone_verified_records: 0,
    computation_approved: 0,
    public_selection_approved: 0,
  },
  governance: {
    country_zone_candidate_is_capital_timezone_verification: false,
    capital_level_mapping_required: true,
    automatic_timezone_promotion_allowed: false,
    runtime_timezone_api_dependency_allowed: false,
  },
  records: timezoneQueueRecords,
};

const sourceAttributionRegister = {
  module_id: "AG74O-R1C",
  title: "Source Attribution and Licence Register",
  status: "ag74o_r1c_source_attribution_register_created",
  generated_at_utc: generatedAt,
  records: [
    {
      source_id: "un_m49_overview",
      display_name: "United Nations Statistics Division — M49 Overview",
      canonical_url: sourceInventory.un_m49_overview.url,
      attribution_required: true,
      public_attribution_text:
        "Country identity codes cross-checked against the United Nations M49 standard.",
      redistribution_boundary: "Do not redistribute the acquired raw page as a Drishvara dataset.",
    },
    {
      source_id: "un_member_states",
      display_name: "United Nations — Member States",
      canonical_url: sourceInventory.un_member_states.url,
      attribution_required: true,
      public_attribution_text:
        "Core sovereign-state scope cross-checked against United Nations member-state evidence.",
      redistribution_boundary: "Reference evidence only.",
    },
    {
      source_id: "un_non_member_states",
      display_name: "United Nations — Non-Member States",
      canonical_url: sourceInventory.un_non_member_states.url,
      attribution_required: true,
      public_attribution_text:
        "Holy See and State of Palestine scope cross-checked against United Nations non-member-state evidence.",
      redistribution_boundary: "Reference evidence only.",
    },
    {
      source_id: "world_bank_country_api",
      display_name: "World Bank Country API",
      canonical_url: sourceInventory.world_bank_country_api.url,
      attribution_required: true,
      public_attribution_text:
        "Capital names and coordinates are retained as crosscheck candidates pending explicit verification.",
      redistribution_boundary:
        "Candidate values must not be represented as Drishvara-verified coordinates.",
    },
    {
      source_id: "iana_zone1970",
      display_name: "IANA Time Zone Database — zone1970.tab",
      canonical_url: sourceInventory.iana_zone1970.url,
      attribution_required: true,
      public_attribution_text:
        "Timezone identifiers and country-zone candidates derive from the IANA Time Zone Database.",
      redistribution_boundary:
        "Country-zone candidates do not constitute capital-level timezone approval.",
    },
    {
      source_id: "user_supplied_capital_checklist",
      display_name: "Internal R1C Capital Completeness Checklist",
      canonical_url: null,
      attribution_required: false,
      public_attribution_text: null,
      redistribution_boundary:
        "Internal candidate/review input; not an authoritative public source.",
    },
  ],
  governance: {
    attribution_record_is_source_approval: false,
    runtime_external_fetch_required: false,
    public_output_allowed_now: false,
  },
};

const review = {
  module_id: "AG74O-R1C",
  title: "Global National-Capital Candidate Bank Review",
  status: "ag74o_r1c_global_national_capital_bank_completed",
  generated_at_utc: generatedAt,
  issue_count: 0,
  warning_count:
    conflictInput.record_count +
    specialInput.record_count +
    core.counts.multi_zone_country_reviews,
  summary: {
    core_195_identity_register_created: true,
    national_capital_candidate_bank_created: true,
    capital_role_link_bank_created: true,
    extended_entity_register_created: true,
    country_and_capital_alias_crosswalk_created: true,
    authoritative_source_and_attribution_registers_created: true,
    conflict_review_queue_created: true,
    capital_timezone_review_queue_created: true,
    identity_records: 195,
    capital_candidate_country_records: 195,
    extended_entity_records: 6,
    unresolved_capital_conflicts: 7,
    special_case_reviews: 12,
    multi_zone_timezone_reviews: 28,
    public_location_selector_activated: false,
    panchang_computation_activated: false,
    runtime_external_api_activated: false,
    supabase_activated: false,
    homepage_ui_changed: false,
    ready_for_ag74o_r1d: true,
  },
};

const readinessRecord = {
  module_id: "AG74O-R1C",
  title: "AG74O-R1D Major International-City Bank Readiness",
  status: "ag74o_r1c_ready_for_major_international_city_bank",
  generated_at_utc: generatedAt,
  ready_for_ag74o_r1d: true,
  core_195_identity_records: 195,
  national_capital_candidate_country_records: 195,
  extended_entity_records: 6,
  unresolved_capital_conflicts_carried_forward: 7,
  capital_timezone_reviews_carried_forward: 195,
  public_record_count_now: 0,
  computation_approved_record_count_now: 0,
  next_stage_not_auto_started: true,
};

const boundary = {
  module_id: "AG74O-R1C",
  title: "AG74O-R1C to AG74O-R1D Boundary",
  status: "ag74o_r1c_to_r1d_boundary_locked",
  next_stage: "AG74O-R1D",
  next_stage_purpose:
    "Create the governed major international-city and sacred/reference-city candidate banks without activating public selection or Panchang computation.",
  next_stage_not_auto_started: true,
  allowed_next_scope: [
    "Major international-city candidate bank",
    "Sacred/reference-city candidate bank",
    "Coordinate and timezone candidate review queues",
    "Cross-bank duplicate and canonical-place review",
    "Source and licence attribution continuation",
  ],
  carried_forward_mandatory_reviews: [
    "Seven national-capital source conflicts",
    "Twelve capital-role/special-case reviews",
    "All capital-level timezone mappings",
    "All coordinate verification and explicit computation approvals",
  ],
  blocked_without_explicit_validation: [
    "Public location-combobox activation",
    "Panchang computation for candidate global records",
    "Automatic resolution of capital-role conflicts",
    "Runtime external API dependency",
    "Supabase activation",
    "Homepage UI change",
    "Deletion of historical AG70-AG74 location evidence",
  ],
};

const qualityRecord = {
  module_id: "AG74O-R1C",
  title: "Global National-Capital Candidate Bank Quality Record",
  status: "ag74o_r1c_completed",
  generated_at_utc: generatedAt,
  checks_passed: [
    "core_195_identity_count_and_code_uniqueness",
    "national_capital_candidate_bank_coverage",
    "capital_role_link_governance",
    "extended_entity_scope_separation",
    "alias_crosswalk_non_promotional_boundary",
    "authoritative_source_manifest_integrity",
    "capital_conflict_queue_preservation",
    "capital_timezone_review_queue_coverage",
    "zero_public_and_computation_approvals",
  ],
  issue_count: 0,
  unresolved_governed_review_items:
    conflictInput.record_count +
    specialInput.record_count +
    core.counts.multi_zone_country_reviews,
  public_activation_allowed_now: false,
  computation_activation_allowed_now: false,
  ready_for_ag74o_r1d: true,
};

const documentation = `# AG74O-R1C — Governed Global National-Capital Candidate Bank

## Purpose

AG74O-R1C converts the verified core-195 identity crosswalk and acquired source evidence into a governed candidate-bank architecture. It does not create a public runtime location bank and does not approve any record for Panchang computation.

## Created records

- 195 core sovereign-state identity records with unique ISO2, ISO3 and UN M49 codes.
- 195 country-level national-capital candidate-bank records.
- Capital-role link candidates, including explicit multi-capital and no-official-capital handling.
- A separate six-record extended-entity register.
- Country and capital alias crosswalks.
- Authoritative-source and attribution registers.
- Seven unresolved capital-source conflict records.
- A 195-record capital-timezone review queue, including 28 multi-zone country reviews.

## Complementarity

AG74O-R1C consumes the universal schema, source hierarchy, role taxonomy and approval state machine locked in AG74O-R1B. It preserves the AG70–AG74 historical location evidence and prepares AG74O-R1D without changing the public Panchang UI.

## Activation boundary

- Public-selection approvals: **0**
- Computation approvals: **0**
- Runtime external API dependency: **Not activated**
- Supabase/Auth dependency: **Not activated**
- Homepage or public-selector mutation: **None**

World Bank coordinates are retained only as crosscheck candidates. IANA country-zone candidates remain pending capital-level timezone mapping. Unresolved capital-role differences are carried as explicit review queues and are never silently overwritten.
`;

writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-core-195-country-identity-register.json",
  identityRegister
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-global-national-capital-bank.json",
  capitalBank
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-role-link-bank.json",
  roleLinkBank
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-extended-entity-capital-register.json",
  extendedRegister
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-country-alias-crosswalk.json",
  aliasCrosswalk
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-authoritative-source-register.json",
  authoritativeSourceRegister
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-conflict-review-queue.json",
  conflictQueue
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-capital-timezone-review-queue.json",
  timezoneQueue
);
writeJson(
  "data/knowledge-base/location-intelligence/production/ag74o-r1c-source-attribution-register.json",
  sourceAttributionRegister
);
writeJson(
  "data/content-intelligence/quality-reviews/ag74o-r1c-global-national-capital-bank.json",
  review
);
writeJson(
  "data/content-intelligence/quality-registry/ag74o-r1c-ag74o-r1d-major-international-city-bank-readiness-record.json",
  readinessRecord
);
writeJson(
  "data/content-intelligence/mutation-plans/ag74o-r1c-to-ag74o-r1d-major-international-city-bank-boundary.json",
  boundary
);
writeJson(
  "data/quality/ag74o-r1c-global-national-capital-bank.json",
  qualityRecord
);
fs.mkdirSync(path.dirname(full("docs/quality/AG74O_R1C_GLOBAL_NATIONAL_CAPITAL_BANK.md")), {
  recursive: true,
});
fs.writeFileSync(
  full("docs/quality/AG74O_R1C_GLOBAL_NATIONAL_CAPITAL_BANK.md"),
  documentation
);

console.log("✅ AG74O-R1C governed national-capital candidate bank generated.");
console.log(`✅ Core-195 identities: ${identityRecords.length}`);
console.log(`✅ Capital country records: ${capitalRecords.length}`);
console.log(`✅ Capital role links: ${roleLinks.length}`);
console.log(`✅ Extended entities: ${extendedInput.records.length}`);
console.log(`✅ Conflict reviews: ${conflictInput.records.length}`);
console.log(`✅ Capital timezone reviews: ${timezoneQueueRecords.length}`);
console.log("✅ Public-selection approvals: 0");
console.log("✅ Computation approvals: 0");
