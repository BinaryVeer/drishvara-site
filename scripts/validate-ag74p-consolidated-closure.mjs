import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const full=(p)=>path.join(root,p);
const read=(p)=>fs.readFileSync(full(p),"utf8");
const json=(p)=>JSON.parse(read(p));
const exists=(p)=>fs.existsSync(full(p));
const fail=(m)=>{console.error(`❌ AG74P validation failed: ${m}`);process.exit(1);};
const pass=(m)=>console.log(`✅ ${m}`);

const required=[
"package.json","index.html","assets/js/ag74o-panchang-public-controller.js",
"scripts/validate-ag74o-panchang-public-ui-static.mjs","scripts/ag74o-panchang-browser-qa.html","scripts/run-ag74o-panchang-browser-qa.sh",
"scripts/generate-ag74p-consolidated-closure.mjs","scripts/validate-ag74p-consolidated-closure.mjs","scripts/ag74p-external-comparison.mjs",
"scripts/ag74p-supabase-preflight.mjs","scripts/ag74p-supabase-write.mjs","scripts/ag74p-live-readback-validation.mjs","scripts/ag74p-rollback.mjs",
"data/knowledge-base/location-intelligence/production/ag74p-location-qualification-register.json",
"data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json",
"data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json",
"data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json",
"data/knowledge-base/panchang-festival/production/ag74p-festival-rule-source-approval-register.json",
"data/knowledge-base/panchang-festival/production/ag74p-external-comparison-register.json",
"data/knowledge-base/panchang-festival/production/ag74p-public-runtime-contract.json",
"data/methodology/star-reflection/ag74p-star-reflection-final-regression-closure.json",
"data/content-intelligence/quality-reviews/ag74p-consolidated-closure-review.json",
"data/content-intelligence/quality-registry/ag74p-two-asset-final-closure-record.json",
"data/content-intelligence/mutation-plans/ag74p-single-patch-execution-boundary.json",
"data/quality/ag74p-consolidated-closure-validation.json",
"docs/quality/AG74P_CONSOLIDATED_FINAL_CLOSURE.md",
"supabase/migrations/20260624_ag74p_panchang_festival_star_reflection.sql",
"data/content-intelligence/quality-registry/ag74o-ag74p-panchang-scientific-comparison-closure-readiness-record.json",
"data/content-intelligence/mutation-plans/ag74o-to-ag74p-panchang-scientific-comparison-closure-boundary.json"
];
for(const p of required)if(!exists(p))fail(`Missing required file: ${p}`);

const pkg=json("package.json"),index=read("index.html"),controller=read("assets/js/ag74o-panchang-public-controller.js");
const qualification=json(required[13]),locations=json(required[14]),daily=json(required[15]),festivals=json(required[16]),rules=json(required[17]),comparison=json(required[18]),runtime=json(required[19]),star=json(required[20]),review=json(required[21]),closure=json(required[22]),boundary=json(required[23]),quality=json(required[24]),priorReadiness=json(required[27]),priorBoundary=json(required[28]);
if(pkg.scripts?.["generate:ag74p"]!=="node scripts/generate-ag74p-consolidated-closure.mjs")fail("generate:ag74p script mismatch.");
if(pkg.scripts?.["validate:ag74p"]!=="node scripts/validate-ag74p-consolidated-closure.mjs")fail("validate:ag74p script mismatch.");
if(!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag74o-r2 && npm run validate:ag74o-r3 && npm run validate:ag74p"))fail("validate:project must run AG74P after R3.");

if(qualification.evaluated_record_count!==7946||qualification.records.length!==7946)fail("All 7,946 location source records must be evaluated.");
if(qualification.approved_named_canonical_place_count!==5||qualification.force_approval_of_unqualified_records_performed!==false)fail("Location qualification boundary mismatch.");
if(locations.record_count!==5||locations.records.length!==5||locations.worldwide_coordinate_policy?.enabled!==true||locations.worldwide_coordinate_policy?.manual_validated_iana_timezone_required!==true)fail("Approved location projection mismatch.");
for(const key of ["varanasi_in","itanagar_in","new_delhi_in","ranchi_in","tokyo_jp"])if(!locations.records.some((r)=>r.canonical_place_id===key&&r.public_selection_approved===true&&r.computation_approved===true))fail(`Approved named location missing: ${key}`);

if(daily.approved_daily_record_count!==384||daily.exact_records.length!==384||daily.local_calculation_policies.length!==5||daily.coordinate_calculation_policy?.local_calculation_approved!==true||daily.public_runtime_activation_allowed_now!==true)fail("Approved daily projection mismatch.");
if(new Set(daily.exact_records.map((r)=>r.civil_date)).size!==384)fail("Daily projection contains duplicate dates.");
if(!daily.exact_records.every((r)=>r.daily_record_approved===true&&r.public_output_allowed===true&&r.output_mode==="approved_precomputed_record"))fail("Daily record approvals incomplete.");

if(rules.rule_count!==7||rules.approved_rule_count!==7||rules.source_reviewed_rule_count!==7)fail("Festival rule approval count mismatch.");
if(rules.primary_begins_ends_source!=="primary_public_window"||rules.astronomical_condition_window_is_not_automatically_public_begins_ends!==true||rules.ritual_windows_never_overwrite_primary_public_window!==true)fail("Festival timing doctrine mismatch.");
if(festivals.approved_observance_count!==114||festivals.records.length!==114||festivals.public_runtime_activation_allowed_now!==true)fail("Festival projection count mismatch.");
if(!festivals.records.every((r)=>r.final_observance_date_approved===true&&r.public_output_allowed===true&&r.astronomical_condition_window&&r.observance_window&&r.primary_public_window&&Array.isArray(r.ritual_windows)))fail("Festival approval/window separation incomplete.");
if(!festivals.records.every((r)=>r.primary_public_window.start_local&&r.primary_public_window.end_local&&r.rule_basis&&r.location_basis))fail("Festival public window or provenance missing.");

if(comparison.status!=="ag74p_external_comparison_passed"||comparison.failed_count!==0||comparison.passed_count!==comparison.comparison_count||comparison.comparison_count<6||!comparison.records.every((r)=>r.status==="pass"))fail("External comparison register mismatch.");
if(runtime.status!=="ag74p_static_public_runtime_approved_supabase_mirror_write_gated"||runtime.runtime?.approved_named_location_count!==5||runtime.runtime?.worldwide_coordinate_calculation_enabled!==true||runtime.approvals?.approved_exact_daily_records!==384||runtime.approvals?.approved_festival_observances!==114)fail("AG74P public runtime contract mismatch.");
if(star.formal_closure_ready!==true||star.regression_checks?.personal_data_storage_enabled!==false||star.regression_checks?.reflective_non_deterministic_output_retained!==true)fail("Star Reflection final regression closure mismatch.");
if(review.issue_count!==0||review.summary?.all_location_source_records_evaluated!==7946||review.summary?.supabase_write_performed_now!==false||review.summary?.live_activation_performed_now!==false)fail("Closure review mismatch.");
if(closure.no_additional_ag_numbered_patch_required!==true||closure.panchang_festival_view?.code_and_data_closure!==true||closure.star_reflection?.final_regression_closure!==true)fail("Two-asset closure record mismatch.");
if(boundary.additional_ag_numbered_patch_allowed!==false||boundary.next_stage!==null||boundary.force_approval_of_unqualified_named_locations_performed!==false)fail("Single-patch boundary mismatch.");
if(quality.status!=="pass"||quality.issue_count!==0||!Object.values(quality.checks).every(Boolean))fail("AG74P quality validation mismatch.");
if(priorReadiness.status!=="ready_for_ag74p_panchang_scientific_comparison_and_final_closure")fail("Historical AG74O→AG74P readiness record must remain immutable.");
for(const key of["backend_service_deployed","supabase_activation_performed","external_ephemeris_api_enabled","input_persistence_enabled","unreviewed_festival_candidates_publicly_displayed"])if(priorReadiness.readiness_checks?.[key]!==false)fail(`Historical readiness forbidden flag changed: ${key}`);
if(priorBoundary.from_module!=="AG74O"||priorBoundary.to_module!=="AG74P")fail("Historical AG74O→AG74P boundary must remain immutable.");

for(const marker of ['data-ag74p-live-release="true"',"AG74P_FINAL_PUBLIC_RELEASE_STYLE_START",'id="panchang-calculate"','data-ag74o-r3-request-commit="true"'])if(!index.includes(marker))fail(`Index marker missing: ${marker}`);
for(const marker of ["ag74p-approved-location-projection.json","ag74p-approved-daily-calendar-projection.json","ag74p-approved-festival-observance-projection.json","renderApprovedLocationSelector","locationRecordByValue","ag74p_worldwide_coordinate_local_calculation",'target.closest("#panchang-calculate")',"computeDay(approvedRequest)","worldwideCoordinatePolicyEnabled"])if(!controller.includes(marker))fail(`Controller marker missing: ${marker}`);
const boot=controller.match(/function boot\(\) \{([\s\S]*?)\n  \}/)?.[1]||"";
if(!boot||boot.includes("applySelection("))fail("Boot must not auto-calculate.");
const handlers=controller.slice(controller.indexOf('  window.addEventListener("change"'),controller.indexOf('  function boot() {'));
if((handlers.match(/applySelection\(/g)||[]).length!==1||!handlers.includes('target.closest("#panchang-calculate")'))fail("Only Calculate Panchang may commit input.");

const migration=read("supabase/migrations/20260624_ag74p_panchang_festival_star_reflection.sql");
for(const table of["drishvara_panchang_locations","drishvara_panchang_daily_records","drishvara_festival_observances","drishvara_star_reflection_releases","drishvara_release_manifests"])if(!migration.includes(table))fail(`Supabase table missing: ${table}`);
if(/service_role|SUPABASE_SERVICE_ROLE_KEY\s*=/.test(migration))fail("Migration must not contain service-role credentials.");

pass("AG74P consolidated final closure is locally valid.");
pass("All 7,946 location source records were evaluated; five named locations and worldwide coordinates are approved.");
pass("All 384 Varanasi annual daily records and all 114 generic monthly observances are approved.");
pass("Festival condition, observance, primary public and ritual windows remain separated.");
pass("Star Reflection final regression and privacy closure passed.");
pass("Supabase migration/write/readback/rollback tooling is ready; no live write occurred during generation.");
