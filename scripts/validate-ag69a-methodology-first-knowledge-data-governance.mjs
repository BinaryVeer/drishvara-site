import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG69A validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "scripts/generate-ag69a-methodology-first-knowledge-data-governance.mjs",
  "scripts/validate-ag69a-methodology-first-knowledge-data-governance.mjs",
  "data/content-intelligence/quality-reviews/ag69a-methodology-first-knowledge-data-governance.json",
  "data/content-intelligence/phase-01-modules/ag69a-methodology-first-knowledge-data-doctrine-record.json",
  "data/content-intelligence/phase-01-modules/ag69a-source-tier-and-claim-level-governance-record.json",
  "data/content-intelligence/phase-01-modules/ag69a-internal-textual-discipline-public-attribution-guard-record.json",
  "data/content-intelligence/phase-01-modules/ag69a-common-module-knowledge-data-architecture-record.json",
  "data/content-intelligence/phase-01-modules/ag69a-static-seed-to-supabase-migration-doctrine-record.json",
  "data/content-intelligence/phase-01-modules/ag69a-module-output-result-saving-doctrine-record.json",
  "data/content-intelligence/phase-01-modules/ag69a-module-wise-knowledge-bank-blueprint-record.json",
  "data/content-intelligence/phase-01-modules/ag69a-panchang-technical-background-source-handling-record.json",
  "data/knowledge-base/_governance/ag69a-knowledge-foundation-governance-index.json",
  "data/knowledge-base/_governance/ag69a-candidate-reviewed-approved-lifecycle.json",
  "data/knowledge-base/_governance/ag69a-common-knowledge-record-schema.json",
  "data/content-intelligence/quality-registry/ag69a-ag69b-word-of-the-day-knowledge-bank-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag69a-to-ag69b-word-of-the-day-knowledge-bank-boundary.json",
  "data/content-intelligence/backend-architecture/ag69a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69a-no-v02-expansion-audit.json",
  "data/quality/ag69a-methodology-first-knowledge-data-governance.json",
  "data/quality/ag69a-methodology-first-knowledge-data-governance-preview.json",
  "docs/quality/AG69A_METHODOLOGY_FIRST_KNOWLEDGE_DATA_GOVERNANCE.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag69a"]) fail("Missing generate:ag69a script.");
if (!pkg.scripts?.["validate:ag69a"]) fail("Missing validate:ag69a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag69a")) fail("validate:project must include validate:ag69a.");

const review = readJson("data/content-intelligence/quality-reviews/ag69a-methodology-first-knowledge-data-governance.json");
if (review.status !== "ag69a_methodology_first_knowledge_data_governance_completed") fail("Review status mismatch.");

for (const key of [
  "methodology_first_doctrine_recorded",
  "source_tier_governance_recorded",
  "claim_level_governance_recorded",
  "internal_textual_discipline_public_attribution_guard_recorded",
  "private_influence_public_attribution_blocked",
  "candidate_reviewed_approved_lifecycle_recorded",
  "common_knowledge_record_schema_recorded",
  "module_wise_blueprint_recorded",
  "static_to_supabase_migration_doctrine_recorded",
  "result_saving_doctrine_recorded",
  "panchang_technical_source_handling_recorded",
  "word_of_day_selected_as_first_proof_module",
  "ready_for_ag69b"
]) {
  if (review.summary[key] !== true) fail(`${key} must be true in review summary.`);
}

for (const key of [
  "supabase_migration_applied",
  "database_runtime_activated",
  "backend_runtime_activated",
  "service_role_used",
  "public_output_activated_from_candidate_data",
  "v02_expansion_started"
]) {
  if (review.summary[key] !== false) fail(`${key} must be false in review summary.`);
}

const doctrine = readJson("data/content-intelligence/phase-01-modules/ag69a-methodology-first-knowledge-data-doctrine-record.json");
if (!doctrine.pipeline.includes("methodology_first")) fail("Methodology-first pipeline missing.");
if (!doctrine.no_compromise_rules.some((x) => x.includes("No public naming"))) fail("Public naming block missing.");
if (!doctrine.no_compromise_rules.some((x) => x.includes("No database population"))) fail("Database population guard missing.");

const sourceGov = readJson("data/content-intelligence/phase-01-modules/ag69a-source-tier-and-claim-level-governance-record.json");
if (!Array.isArray(sourceGov.source_tiers) || sourceGov.source_tiers.length < 5) fail("Source tiers incomplete.");
if (!sourceGov.claim_levels.includes("mantra_text")) fail("Mantra claim level missing.");
if (!sourceGov.claim_levels.includes("astronomical_calculation")) fail("Astronomical calculation claim level missing.");
if (!sourceGov.blocked_sources.some((x) => x.includes("AI-invented"))) fail("AI-invented claim block missing.");

const internal = readJson("data/content-intelligence/phase-01-modules/ag69a-internal-textual-discipline-public-attribution-guard-record.json");
if (internal.public_attribution_allowed !== false) fail("Public attribution must be false.");
if (internal.private_influence_names_allowed_in_public_outputs !== false) fail("Private influence names must be blocked in public outputs.");
if (internal.private_influence_names_allowed_in_repo_records !== false) fail("Private influence names must be blocked in repo records.");

const lifecycle = readJson("data/knowledge-base/_governance/ag69a-candidate-reviewed-approved-lifecycle.json");
for (const stage of ["candidate", "source_checked", "reviewed", "approved", "method_tested", "output_tested", "public_safe"]) {
  if (!lifecycle.lifecycle_order.includes(stage)) fail(`Lifecycle stage missing: ${stage}`);
}

const schema = readJson("data/knowledge-base/_governance/ag69a-common-knowledge-record-schema.json");
for (const field of ["record_id", "module_id", "source_tier", "claim_level", "review_status", "public_use_allowed", "admin_only"]) {
  if (!schema.required_fields.includes(field)) fail(`Common schema field missing: ${field}`);
}
if (schema.public_gate.review_status_required !== "approved") fail("Public gate must require approved status.");

const architecture = readJson("data/content-intelligence/phase-01-modules/ag69a-common-module-knowledge-data-architecture-record.json");
for (const modulePath of [
  "data/knowledge-base/word-of-day/",
  "data/knowledge-base/vedic-guidance/",
  "data/knowledge-base/panchang-festival/",
  "data/knowledge-base/star-reflection/",
  "data/knowledge-base/sports-desk/",
  "data/knowledge-base/psychometric-assessment/"
]) {
  if (!architecture.static_repo_paths.includes(modulePath)) fail(`Static repo path missing: ${modulePath}`);
}

const staticToDb = readJson("data/content-intelligence/phase-01-modules/ag69a-static-seed-to-supabase-migration-doctrine-record.json");
if (staticToDb.supabase_activation_now !== false) fail("Supabase activation must be false.");
for (const blocked of ["supabase_migration_apply", "database_write", "service_role_use"]) {
  if (!staticToDb.blocked_now.includes(blocked)) fail(`Blocked static-to-db scope missing: ${blocked}`);
}

const blueprint = readJson("data/content-intelligence/phase-01-modules/ag69a-module-wise-knowledge-bank-blueprint-record.json");
for (const module of ["word_of_the_day", "vedic_guidance", "panchang_festival", "star_reflection", "sports_archive", "psychometric_assessment"]) {
  if (!blueprint.modules?.[module]) fail(`Module blueprint missing: ${module}`);
}
if (blueprint.modules.word_of_the_day.next_stage !== "AG69B") fail("Word of the Day must be next proof module.");
if (!blueprint.modules.vedic_guidance.strict_rules.some((x) => x.includes("No invented mantra"))) fail("Vedic mantra guard missing.");
if (!blueprint.modules.panchang_festival.strict_rules.some((x) => x.includes("No invented tithi"))) fail("Panchang tithi guard missing.");

const technical = readJson("data/content-intelligence/phase-01-modules/ag69a-panchang-technical-background-source-handling-record.json");
if (technical.direct_calculation_engine !== false) fail("Panchang technical source must not be direct calculation engine.");
if (technical.direct_public_claim_source !== false) fail("Panchang technical source must not be direct public claim source.");

const readiness = readJson("data/content-intelligence/quality-registry/ag69a-ag69b-word-of-the-day-knowledge-bank-readiness-record.json");
if (readiness.ready_for_ag69b !== true) fail("AG69B readiness must be true.");

const boundary = readJson("data/content-intelligence/mutation-plans/ag69a-to-ag69b-word-of-the-day-knowledge-bank-boundary.json");
if (!boundary.blocked_scope_without_explicit_approval.includes("Supabase migration apply")) fail("Supabase apply blocker missing.");
if (!boundary.blocked_scope_without_explicit_approval.includes("public use of candidate word records")) fail("Candidate public-use blocker missing.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag69a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag69a-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

const forbiddenNeedles = [
  "nityananda",
  "nityānanda",
  "misra",
  "miśra",
  "@nityananda"
];

const attributionScanFiles = required.filter((file) =>
  exists(file) &&
  !file.startsWith("scripts/")
);

const generatedPublicText = attributionScanFiles
  .map((file) => read(file).toLowerCase())
  .join("\n");

for (const needle of forbiddenNeedles) {
  if (generatedPublicText.includes(needle)) {
    fail(`Forbidden private attribution token found in generated governance files: ${needle}`);
  }
}

pass("AG69A methodology-first knowledge/data governance is present.");
pass("Source tiers, claim levels and lifecycle are defined.");
pass("Internal textual discipline is public-attribution guarded.");
pass("Module-wise knowledge-bank blueprint is recorded.");
pass("Static-to-Supabase migration doctrine is recorded without activation.");
pass("AG69B Word of the Day readiness is valid.");
pass("No private attribution token is present in generated governance files.");
pass("No backend/database/Supabase/Auth/service-role/V02 activation is recorded.");
