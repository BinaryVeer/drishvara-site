import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const readJson = (value) =>
  JSON.parse(fs.readFileSync(path.join(root, value), "utf8"));

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, stable(value[key])])
    );
  }
  return value;
}

function hash(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(stable(value)))
    .digest("hex");
}

function normalizeAlias(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

export function buildSup01RuntimePayloads() {
  const locations = readJson(
    "data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json"
  );
  const daily = readJson(
    "data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json"
  );
  const rules = readJson(
    "data/knowledge-base/panchang-festival/production/ag74p-festival-rule-source-approval-register.json"
  );

  const releaseId = locations.release_id;
  if (daily.release_id !== releaseId || rules.release_id !== releaseId) {
    throw new Error("AG74P source release IDs do not match.");
  }

  const aliasMap = new Map();
  for (const record of locations.records) {
    const values = [
      record.canonical_place_id,
      record.selector_value,
      record.display_label,
      ...(record.search_labels || [])
    ];
    for (const sourceLabel of values) {
      const aliasNormalized = normalizeAlias(sourceLabel);
      if (!aliasNormalized) continue;
      const key = `${aliasNormalized}::${record.canonical_place_id}`;
      const payload = {
        source_label: sourceLabel,
        alias_normalized: aliasNormalized,
        canonical_place_id: record.canonical_place_id,
        selector_value: record.selector_value,
        display_label: record.display_label,
        timezone: record.timezone,
        latitude: record.latitude,
        longitude: record.longitude,
        approval_basis: record.approval_basis
      };
      aliasMap.set(key, {
        id: `sup01_alias_${hash(payload).slice(0, 24)}`,
        release_id: releaseId,
        alias_normalized: aliasNormalized,
        canonical_place_id: record.canonical_place_id,
        selector_value: record.selector_value,
        display_label: record.display_label,
        timezone: record.timezone,
        latitude: record.latitude,
        longitude: record.longitude,
        payload,
        content_hash: hash(payload)
      });
    }
  }

  const policies = [
    ...daily.local_calculation_policies.map((policy) => {
      const payload = {
        ...policy,
        request_mode: "named_location"
      };
      return {
        id: policy.policy_id,
        release_id: releaseId,
        request_mode: "named_location",
        canonical_place_id: policy.canonical_place_id,
        supported_start: policy.supported_start,
        supported_end: policy.supported_end,
        validated_iana_timezone_required: true,
        output_mode: policy.output_mode,
        payload,
        content_hash: hash(payload)
      };
    }),
    (() => {
      const policy = daily.coordinate_calculation_policy;
      const payload = {
        ...policy,
        request_mode: "coordinates"
      };
      return {
        id: policy.policy_id,
        release_id: releaseId,
        request_mode: "coordinates",
        canonical_place_id: null,
        supported_start: policy.supported_start,
        supported_end: policy.supported_end,
        validated_iana_timezone_required:
          policy.validated_iana_timezone_required === true,
        output_mode: policy.output_mode,
        payload,
        content_hash: hash(payload)
      };
    })()
  ];

  const festivalRules = rules.records.map((record) => ({
    id: `sup01_${record.rule_id}`,
    release_id: releaseId,
    rule_id: record.rule_id,
    observance_key: record.observance_key,
    approval_status: record.source_review_status,
    scope_limitation: record.scope_limitation,
    payload: record,
    content_hash: hash(record)
  }));

  const runtimePayload = {
    runtime_release_id: "sup01_panchang_runtime_v1",
    release_id: releaseId,
    status: "staged",
    engine_package: "astronomy-engine",
    engine_package_version: "2.1.19",
    astronomical_profile_id: "drishvara_astronomical_engine_v1",
    ayanamsha_profile_id: "drishvara_lahiri_linear_tt_v1",
    no_input_persistence: true,
    public_ui_cutover_active: false,
    source_counts: {
      approved_locations: locations.record_count,
      approved_daily_records: daily.approved_daily_record_count,
      approved_festival_rules: rules.approved_rule_count,
      normalized_aliases: aliasMap.size,
      calculation_policies: policies.length
    }
  };

  return {
    module_id: "SUP01",
    status: "sup01_runtime_payloads_prepared_live_write_pending",
    release_id: releaseId,
    aliases: [...aliasMap.values()].sort((a, b) =>
      `${a.alias_normalized}:${a.canonical_place_id}`.localeCompare(
        `${b.alias_normalized}:${b.canonical_place_id}`
      )
    ),
    calculation_policies: policies,
    festival_rules: festivalRules,
    runtime_releases: [
      {
        ...runtimePayload,
        payload: runtimePayload,
        content_hash: hash(runtimePayload)
      }
    ]
  };
}

function main() {
  const outputArg = process.argv.find((item) => item.startsWith("--output="));
  const result = buildSup01RuntimePayloads();
  const serialized = JSON.stringify(result, null, 2) + "\n";
  if (outputArg) {
    const outputPath = path.resolve(root, outputArg.slice("--output=".length));
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, serialized);
    console.log(`✅ SUP01 runtime payloads written to ${outputPath}`);
  } else {
    process.stdout.write(serialized);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
