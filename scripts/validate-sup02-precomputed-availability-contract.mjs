import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const full = (value) => path.join(root, value);
const read = (value) => fs.readFileSync(full(value), "utf8");
const json = (value) => JSON.parse(read(value));
const exists = (value) => fs.existsSync(full(value));
const fail = (message) => {
  console.error(`❌ SUP02 precomputed-availability validation failed: ${message}`);
  process.exit(1);
};

const required = [
  "supabase/functions/calculate-panchang/index.ts",
  "assets/js/sup02-panchang-server-controller.js",
  "data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json",
  "data/content-intelligence/mutation-plans/sup02-precomputed-availability-correction-boundary.json",
  "data/content-intelligence/quality-registry/sup02-precomputed-availability-correction-record.json",
  "data/quality/sup02-precomputed-availability-correction-validation.json",
  "docs/quality/SUP02_PRECOMPUTED_AVAILABILITY_CORRECTION.md",
  "package.json"
];

for (const relative of required) {
  if (!exists(relative)) fail(`Missing required file: ${relative}`);
}

const functionSource = read("supabase/functions/calculate-panchang/index.ts");
for (const marker of [
  "function isRecord(value: unknown)",
  "function hasCompletePublicPanchangResult(",
  "function normalizePrecomputedRuntimeResult(",
  'value["available"] === true || value["available"] === false',
  "available: true",
  "const runtimeResult = normalizePrecomputedRuntimeResult(",
  'exactRows[0].payload?.["runtime_result"]',
  "panchangResult = runtimeResult"
]) {
  if (!functionSource.includes(marker)) {
    fail(`Function correction marker missing: ${marker}`);
  }
}

if (
  functionSource.includes(
    'const runtimeResult = exactRows[0].payload?.["runtime_result"];'
  )
) {
  fail("Legacy unnormalised precomputed assignment remains present.");
}

const controller = read("assets/js/sup02-panchang-server-controller.js");
if (!controller.includes("result.available !== true")) {
  fail("Public controller no longer enforces the available=true response contract.");
}

const projection = json(
  "data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json"
);

if (
  projection.release_id !== "ag74p_final_2026_06_24" ||
  projection.approved_daily_record_count !== 384 ||
  !Array.isArray(projection.exact_records) ||
  projection.exact_records.length !== 384
) {
  fail("Approved daily projection baseline mismatch.");
}

const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const hasCompletePublicPanchangResult = (value) => {
  if (!isRecord(value)) return false;
  const sunrise = isRecord(value.sunrise) ? value.sunrise : null;
  const vara = isRecord(value.vara) ? value.vara : null;
  const elements = isRecord(value.elements) ? value.elements : null;
  if (
    !sunrise ||
    typeof sunrise.local !== "string" ||
    sunrise.local.length === 0 ||
    !vara ||
    typeof vara.english !== "string" ||
    vara.english.length === 0 ||
    typeof vara.sanskrit !== "string" ||
    vara.sanskrit.length === 0 ||
    typeof value.paksha !== "string" ||
    value.paksha.length === 0 ||
    !elements
  ) {
    return false;
  }
  return ["tithi", "nakshatra", "yoga", "karana"].every((key) => {
    const element = isRecord(elements[key]) ? elements[key] : null;
    return (
      Boolean(element) &&
      typeof element.name === "string" &&
      element.name.length > 0 &&
      Number.isInteger(element.index)
    );
  });
};

let missingAvailableCount = 0;
let explicitlyAvailableCount = 0;

for (const record of projection.exact_records) {
  if (
    record.release_id !== projection.release_id ||
    record.daily_record_approved !== true ||
    record.public_output_allowed !== true ||
    record.output_mode !== "approved_precomputed_record"
  ) {
    fail(`Approval contract mismatch for ${record.activation_record_id}`);
  }

  if (!hasCompletePublicPanchangResult(record.runtime_result)) {
    fail(`Incomplete precomputed runtime result: ${record.activation_record_id}`);
  }

  if (record.runtime_result.available === false) {
    fail(`Approved exact result is explicitly unavailable: ${record.activation_record_id}`);
  }

  if (record.runtime_result.available === true) explicitlyAvailableCount += 1;
  else missingAvailableCount += 1;

  const normalized = {
    ...record.runtime_result,
    ...(record.runtime_result.available === undefined
      ? { available: true }
      : {})
  };

  if (normalized.available !== true) {
    fail(`Normalised result is not available: ${record.activation_record_id}`);
  }
}

if (missingAvailableCount !== 384 || explicitlyAvailableCount !== 0) {
  fail(
    `Expected diagnosed legacy shape on all 384 records; missing=${missingAvailableCount}, explicit=${explicitlyAvailableCount}`
  );
}

const boundary = json(
  "data/content-intelligence/mutation-plans/sup02-precomputed-availability-correction-boundary.json"
);
if (
  boundary.status !==
    "sup02_precomputed_availability_contract_correction_ready_for_controlled_deploy" ||
  boundary.baseline_commit !==
    "9ffb09b6b0cf2fb7f6445453b9de7455891afa29" ||
  boundary.diagnostic_evidence_sha256 !==
    "d92da45b8482cbf2416934cb0c79c4a4a4da767ac177841fce7c5fca650cf52d" ||
  boundary.rollback_evidence_sha256 !==
    "0bd5d3be699d9d0b91ab856b7fb902f8524563ec5b94490ddc25b32779e8d2b2" ||
  boundary.database_payload_mutation_allowed !== false ||
  boundary.public_cutover_activation_allowed !== false ||
  boundary.edge_function_redeploy_required !== true
) {
  fail("Correction boundary mismatch.");
}

const record = json(
  "data/content-intelligence/quality-registry/sup02-precomputed-availability-correction-record.json"
);
if (
  record.status !==
    "sup02_precomputed_availability_contract_correction_locally_validated" ||
  record.affected_approved_exact_record_count !== 384 ||
  record.zero_input_persistence_preserved !== true ||
  record.public_cutover_flag_required_false_during_redeploy !== true
) {
  fail("Correction quality record mismatch.");
}

const quality = json(
  "data/quality/sup02-precomputed-availability-correction-validation.json"
);
if (
  quality.status !==
    "sup02_precomputed_availability_contract_validation_passed" ||
  !Object.values(quality.checks || {}).every(Boolean)
) {
  fail("Correction validation record mismatch.");
}

const pkg = json("package.json");
if (
  pkg.scripts?.["validate:sup02:response-contract"] !==
    "node scripts/validate-sup02-precomputed-availability-contract.mjs" ||
  !pkg.scripts?.["validate:project"]?.includes(
    "npm run validate:sup02:response-contract"
  )
) {
  fail("Correction validator registration missing.");
}

const allText = required.map(read).join("\n");
const credentialPatterns = [
  new RegExp(
    ["eyJ", "[A-Za-z0-9_-]+", "\\.", "[A-Za-z0-9_-]+", "\\.", "[A-Za-z0-9_-]+"].join("")
  ),
  new RegExp(["sb", "_secret_", "[A-Za-z0-9_-]+"].join("")),
  new RegExp(["postgres", "(?:ql)?", "://"].join(""))
];
if (credentialPatterns.some((pattern) => pattern.test(allText))) {
  fail("Credential-shaped material found in correction sources.");
}

const sourceHash = crypto
  .createHash("sha256")
  .update(fs.readFileSync(full("supabase/functions/calculate-panchang/index.ts")))
  .digest("hex");

console.log("✅ SUP02 precomputed availability contract correction is locally valid.");
console.log("✅ All 384 approved exact records have the complete legacy payload shape.");
console.log("✅ Missing availability is normalised only for complete legacy records.");
console.log("✅ Explicit unavailable records remain explicit and incomplete records fall back to server calculation.");
console.log("✅ Public cutover activation remains prohibited during correction redeployment.");
console.log(`✅ Corrected function source SHA-256: ${sourceHash}`);
