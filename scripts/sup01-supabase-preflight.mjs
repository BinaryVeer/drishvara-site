import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "supabase/config.toml",
  "supabase/functions/calculate-panchang/deno.json",
  "supabase/functions/calculate-panchang/index.ts",
  "supabase/functions/_shared/http.ts",
  "supabase/functions/_shared/location-resolution.ts",
  "supabase/functions/_shared/panchang-runtime.ts",
  "supabase/migrations/20260625_sup01_panchang_runtime.sql"
];

const fail = (message) => {
  console.error(`❌ SUP01 Supabase preflight failed: ${message}`);
  process.exit(1);
};

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) fail(`Missing ${relative}`);
}

const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260625_sup01_panchang_runtime.sql"),
  "utf8"
);
for (const table of [
  "drishvara_panchang_location_aliases",
  "drishvara_panchang_calculation_policies",
  "drishvara_festival_rules",
  "drishvara_panchang_runtime_releases"
]) {
  if (!migration.includes(table)) fail(`Migration table missing: ${table}`);
}
for (const role of ["anon", "authenticated"]) {
  if (
    !migration.includes(
      "revoke all privileges on table public.drishvara_panchang_locations from anon, authenticated"
    )
  ) {
    fail(`Full privilege revocation missing for ${role}.`);
  }
}
if (!migration.includes("grant select on table")) {
  fail("Explicit SELECT grants are required after privilege revocation.");
}
if (/service_role|SUPABASE_SERVICE_ROLE_KEY\s*=|postgres(?:ql)?:\/\//.test(migration)) {
  fail("Migration must not contain credentials or connection strings.");
}

const config = fs.readFileSync(
  path.join(root, "supabase/config.toml"),
  "utf8"
);
if (!config.includes("[functions.calculate-panchang]")) {
  fail("calculate-panchang function configuration is missing.");
}

const jwtVerified = config.includes("verify_jwt = true");
const publicFunctionPrepared = config.includes("verify_jwt = false");

if (!jwtVerified && !publicFunctionPrepared) {
  fail("calculate-panchang JWT mode is not explicitly governed.");
}

if (publicFunctionPrepared) {
  const boundaryPath = path.join(
    root,
    "data/content-intelligence/mutation-plans/sup02-public-runtime-cutover-boundary.json"
  );
  if (!fs.existsSync(boundaryPath)) {
    fail("Public function mode requires the governed SUP02 cutover boundary.");
  }
  const boundary = JSON.parse(fs.readFileSync(boundaryPath, "utf8"));
  if (
    boundary.module_id !== "SUP02" ||
    boundary.status !==
      "sup02_public_runtime_cutover_readiness_prepared_local_apply_only" ||
    boundary.public_ui_cutover_active !== false ||
    boundary.live_function_deployment_performed !== false ||
    boundary.live_database_migration_applied !== false
  ) {
    fail("SUP02 public-function preparation boundary mismatch.");
  }
}

const deno = JSON.parse(
  fs.readFileSync(
    path.join(root, "supabase/functions/calculate-panchang/deno.json"),
    "utf8"
  )
);
if (deno.imports?.["astronomy-engine"] !== "npm:astronomy-engine@2.1.19") {
  fail("Astronomy Engine must remain pinned to 2.1.19.");
}

console.log("✅ SUP01 Supabase offline preflight passed.");
console.log("✅ Runtime function, normalized tables and full privilege hardening remain present.");
console.log(
  publicFunctionPrepared
    ? "✅ SUP02 public invocation mode is prepared under a non-activating governed boundary."
    : "✅ SUP01 gateway JWT verification remains configured."
);
console.log("✅ No network operation, migration, function deployment or live write was performed.");
