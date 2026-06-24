import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const full=(p)=>path.join(root,p);
const read=(p)=>fs.readFileSync(full(p),"utf8");
const json=(p)=>JSON.parse(read(p));
const exists=(p)=>fs.existsSync(full(p));
function fail(message){console.error(`❌ AG74O-R3 validation failed: ${message}`);process.exit(1);}
function pass(message){console.log(`✅ ${message}`);}

const required=[
  "package.json",
  "index.html",
  "assets/js/ag74o-panchang-public-controller.js",
  "scripts/validate-ag74o-panchang-public-ui-static.mjs",
  "scripts/ag74o-panchang-browser-qa.html",
  "scripts/run-ag74o-panchang-browser-qa.sh",
  "data/knowledge-base/panchang-festival/production/ag74o-panchang-public-runtime-contract.json",
  "scripts/generate-ag74o-r3-governed-calendar-activation.mjs",
  "scripts/validate-ag74o-r3-governed-calendar-activation.mjs",
  "data/knowledge-base/panchang-festival/production/ag74o-r3-calendar-activation-projection.json",
  "data/knowledge-base/panchang-festival/production/ag74o-r3-daily-record-approval-resolver-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74o-r3-annual-book-reference-boundary-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74o-r3-request-commit-flow-contract.json",
  "data/knowledge-base/panchang-festival/production/ag74o-r3-festival-observance-activation-projection.json",
  "data/knowledge-base/panchang-festival/production/ag74o-r3-calendar-activation-state-contract.json",
  "data/content-intelligence/quality-reviews/ag74o-r3-governed-calendar-activation.json",
  "data/content-intelligence/quality-registry/ag74o-r3-governed-calendar-activation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag74o-r3-governed-calendar-activation-boundary.json",
  "data/quality/ag74o-r3-governed-calendar-activation.json",
  "docs/quality/AG74O_R3_GOVERNED_CALENDAR_ACTIVATION.md"
];
for(const p of required)if(!exists(p))fail(`Missing required file: ${p}`);

const pkg=json("package.json");
if(pkg.scripts?.["generate:ag74o-r3"]!=="node scripts/generate-ag74o-r3-governed-calendar-activation.mjs")fail("generate:ag74o-r3 script mismatch.");
if(pkg.scripts?.["validate:ag74o-r3"]!=="node scripts/validate-ag74o-r3-governed-calendar-activation.mjs")fail("validate:ag74o-r3 script mismatch.");
if(!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag74o-r2 && npm run validate:ag74o-r3"))fail("validate:project must run R3 after R2.");

const index=read("index.html");
const controller=read("assets/js/ag74o-panchang-public-controller.js");
const runtime=json("data/knowledge-base/panchang-festival/production/ag74o-panchang-public-runtime-contract.json");
const calendar=json("data/knowledge-base/panchang-festival/production/ag74o-r3-calendar-activation-projection.json");
const daily=json("data/knowledge-base/panchang-festival/production/ag74o-r3-daily-record-approval-resolver-contract.json");
const book=json("data/knowledge-base/panchang-festival/production/ag74o-r3-annual-book-reference-boundary-contract.json");
const request=json("data/knowledge-base/panchang-festival/production/ag74o-r3-request-commit-flow-contract.json");
const festival=json("data/knowledge-base/panchang-festival/production/ag74o-r3-festival-observance-activation-projection.json");
const states=json("data/knowledge-base/panchang-festival/production/ag74o-r3-calendar-activation-state-contract.json");
const review=json("data/content-intelligence/quality-reviews/ag74o-r3-governed-calendar-activation.json");
const readiness=json("data/content-intelligence/quality-registry/ag74o-r3-governed-calendar-activation-readiness-record.json");
const boundary=json("data/content-intelligence/mutation-plans/ag74o-r3-governed-calendar-activation-boundary.json");
const quality=json("data/quality/ag74o-r3-governed-calendar-activation.json");

for(const marker of ['id="panchang-calculate"','id="panchang-request-status"','data-ag74o-r3-request-commit="true"','AG74O_R3_CALENDAR_ACTIVATION_STYLE_START'])if(!index.includes(marker))fail(`R3 index marker missing: ${marker}`);
if((index.match(/id=["']panchang-calculate["']/g)||[]).length!==1)fail("Calculate Panchang control must occur exactly once.");
if((index.match(/id=["']panchang-request-status["']/g)||[]).length!==1)fail("Request status must occur exactly once.");
for(const marker of ["CALENDAR_ACTIVATION_PATH","FESTIVAL_ACTIVATION_PATH","markRequestPending","settleCommittedRequest","resolveActivatedCalendarRecord","renderActivatedCalendarRecord",'target.closest("#panchang-calculate")',"computeDay(approvedRequest)","drishvaraAg74oActivationState"])if(!controller.includes(marker))fail(`R3 controller marker missing: ${marker}`);
const block=controller.slice(controller.indexOf('  window.addEventListener("change"'),controller.indexOf('  function boot() {'));
if((block.match(/applySelection\(/g)||[]).length!==1)fail("Only the explicit Calculate Panchang action may commit within input handlers.");
if(!block.includes('target.closest("#panchang-calculate")'))fail("Calculate Panchang click handler missing.");
const boot=controller.match(/function boot\(\) \{([\s\S]*?)\n  \}/)?.[1]||"";
if(!boot||boot.includes("applySelection("))fail("Boot must not commit a Panchang request.");

if(calendar.approved_daily_record_count!==0||calendar.records.length!==0||calendar.public_runtime_activation_allowed_now!==false)fail("Daily activation projection must remain empty and blocked.");
if(festival.approved_observance_count!==0||festival.records.length!==0||festival.public_runtime_activation_allowed_now!==false)fail("Festival activation projection must remain empty and blocked.");
if(festival.primary_begins_ends_source!=="primary_public_window"||festival.astronomical_condition_window_is_not_public_begins_ends!==true||festival.ritual_windows_never_overwrite_primary_public_window!==true)fail("Festival timing-window separation mismatch.");
if(daily.current_approved_daily_record_count!==0||daily.local_engine_may_run_without_calendar_activation_record!==false)fail("Daily resolver zero-approval boundary mismatch.");
if(book.page_count!==4||book.canonical_slot_count!==12||book.page_slot_counts.some((v)=>v!==3)||book.actual_month_instance_count!==13||book.independent_of_daily_location_approval!==true||book.reference_book_is_not_daily_public_activation!==true)fail("Annual-book reference boundary mismatch.");
if(request.calculate_control_id!=="panchang-calculate"||request.input_change_behaviour!=="mark_pending_without_replacing_last_committed_result"||request.calculate_button_required!==true||request.page_boot_commits_request!==false)fail("Explicit request-commit contract mismatch.");
if(states.public_runtime_activation_allowed_now!==false||states.approved_location_count!==0||states.approved_daily_record_count!==0||states.approved_observance_count!==0||states.automatic_input_commit_allowed!==false)fail("Activation-state boundary mismatch.");
if(runtime.status!=="ag74o_r2_governed_selector_calculation_gate_active_runtime_approval_blocked")fail("R2 runtime status must remain intact.");
if(runtime.runtime?.click_required_for_request!==true||runtime.runtime?.automatic_calculation_on_input_change!==false||runtime.runtime?.pending_input_preserves_last_committed_result!==true)fail("R3 runtime request-flow contract mismatch.");
if(runtime.r3_calendar_activation?.public_runtime_activation_allowed_now!==false||runtime.r3_calendar_activation?.approved_daily_record_count!==0||runtime.r3_calendar_activation?.approved_observance_count!==0)fail("R3 runtime activation counts mismatch.");
if(review.issue_count!==0||review.summary?.diagnosis_major_findings_corrected!==3||review.summary?.public_calendar_output_activated!==false||review.summary?.public_festival_output_activated!==false)fail("R3 quality review mismatch.");
if(readiness.activation_architecture_implemented!==true||readiness.ready_for_public_calendar_population!==false||readiness.next_stage_not_auto_started!==true)fail("R3 readiness mismatch.");
if(boundary.next_stage!==null||boundary.next_stage_requires_explicit_definition!==true||boundary.next_stage_not_auto_started!==true)fail("R3 boundary mismatch.");
if(quality.status!=="pass"||quality.issue_count!==0||!Object.values(quality.checks).every(Boolean))fail("R3 quality record mismatch.");

pass("AG74O-R3 governed calendar activation layer is valid.");
pass("Explicit Calculate Panchang request commitment is active.");
pass("Pending input changes preserve the last committed daily result.");
pass("The four-page Varanasi annual reference book remains independent.");
pass("Approved daily and festival activation projections remain empty.");
pass("Public calendar activation remains blocked.");
