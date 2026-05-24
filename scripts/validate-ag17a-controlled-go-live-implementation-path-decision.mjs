import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag16z-public-visibility-publish-control-closure.json",
  "data/content-intelligence/closure-records/ag16z-public-visibility-publish-control-closure.json",
  "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  "data/content-intelligence/quality-registry/ag16z-public-exposure-blocked-register.json",
  "data/content-intelligence/quality-registry/ag16z-next-path-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag16z-to-ag17a-controlled-go-live-implementation-path-decision-boundary.json",
  "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",

  "data/content-intelligence/quality-reviews/ag17a-controlled-go-live-implementation-path-decision.json",
  "data/content-intelligence/go-live/ag17a-go-live-option-comparison-record.json",
  "data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json",
  "data/content-intelligence/go-live/ag17a-supabase-auth-defer-reminder-record.json",
  "data/content-intelligence/quality-registry/ag17a-real-activation-blocker-register.json",
  "data/content-intelligence/quality-registry/ag17a-hybrid-static-go-live-planning-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag17a-to-ag17b-hybrid-static-go-live-implementation-plan-boundary.json",
  "data/content-intelligence/schema/controlled-go-live-implementation-path-decision.schema.json",
  "data/content-intelligence/learning/ag17a-controlled-go-live-implementation-path-decision-learning.json",
  "data/quality/ag17a-controlled-go-live-implementation-path-decision.json",
  "data/quality/ag17a-controlled-go-live-implementation-path-decision-preview.json",
  "docs/quality/AG17A_CONTROLLED_GO_LIVE_IMPLEMENTATION_PATH_DECISION.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG17A validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag16zReview = readJson("data/content-intelligence/quality-reviews/ag16z-public-visibility-publish-control-closure.json");
const ag16zClosure = readJson("data/content-intelligence/closure-records/ag16z-public-visibility-publish-control-closure.json");
const ag16zReadiness = readJson("data/content-intelligence/quality-registry/ag16z-next-path-readiness-record.json");
const ag16zBoundary = readJson("data/content-intelligence/mutation-plans/ag16z-to-ag17a-controlled-go-live-implementation-path-decision-boundary.json");
const ag13zCandidate = readJson("data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json");

const review = readJson("data/content-intelligence/quality-reviews/ag17a-controlled-go-live-implementation-path-decision.json");
const comparison = readJson("data/content-intelligence/go-live/ag17a-go-live-option-comparison-record.json");
const decision = readJson("data/content-intelligence/go-live/ag17a-hybrid-staged-path-decision-record.json");
const reminder = readJson("data/content-intelligence/go-live/ag17a-supabase-auth-defer-reminder-record.json");
const blockers = readJson("data/content-intelligence/quality-registry/ag17a-real-activation-blocker-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag17a-hybrid-static-go-live-planning-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag17a-to-ag17b-hybrid-static-go-live-implementation-plan-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-go-live-implementation-path-decision.schema.json");
const learning = readJson("data/content-intelligence/learning/ag17a-controlled-go-live-implementation-path-decision-learning.json");
const registry = readJson("data/quality/ag17a-controlled-go-live-implementation-path-decision.json");
const preview = readJson("data/quality/ag17a-controlled-go-live-implementation-path-decision-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG17A_CONTROLLED_GO_LIVE_IMPLEMENTATION_PATH_DECISION.md"), "utf8");

for (const obj of [review, comparison, decision, reminder, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG17A") fail(`module_id must be AG17A in ${obj.title || "object"}`);
}

if (ag16zReview.status !== "public_visibility_publish_control_chain_closed_future_public_exposure_blocked") fail("AG16Z review status mismatch");
if (ag16zClosure.final_decision.ag16_chain_closed !== true) fail("AG16 chain closure missing");
if (ag16zReadiness.ready_for_ag17a !== true) fail("AG16Z readiness for AG17A missing");
if (ag16zBoundary.next_stage_id !== "AG17A") fail("AG17A boundary missing in AG16Z");

const articlePath = ag13zCandidate.selected_article_path;
if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
const currentHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentHash !== ag13zCandidate.article_hash) fail("Seed candidate hash mismatch");

if (review.status !== "hybrid_staged_go_live_path_selected_real_activation_blocked") fail("Review status mismatch");
if (comparison.status !== "go_live_options_compared") fail("Option comparison status mismatch");
if (decision.status !== "hybrid_staged_go_live_path_selected") fail("Decision status mismatch");
if (reminder.status !== "supabase_auth_deferred_with_future_reminder_required") fail("Supabase reminder status mismatch");
if (blockers.status !== "real_activation_blockers_recorded") fail("Blocker register status mismatch");
if (readiness.status !== "ready_for_ag17b_hybrid_static_go_live_implementation_plan") fail("Readiness status mismatch");

if (comparison.recommended_option_id !== "option_3_hybrid_staged_path") fail("Recommended option must be hybrid staged path");
const selected = comparison.options.find((item) => item.option_id === "option_3_hybrid_staged_path");
if (!selected || selected.selected !== true || selected.suitable_now !== true) fail("Hybrid staged path must be selected and suitable now");

if (decision.selected_path !== "hybrid_staged_path") fail("Decision selected path must be hybrid_staged_path");
if (!decision.selected_sequence.some((item) => item.sequence_id === "stage_1" && item.title.includes("Static/GitHub-controlled"))) fail("Stage 1 static/GitHub missing");
if (!decision.selected_sequence.some((item) => item.sequence_id === "stage_2" && item.title.includes("Supabase/Auth/backend later"))) fail("Stage 2 Supabase/Auth later missing");
if (decision.selected_next_stage !== "AG17B") fail("Next stage must be AG17B");

if (!reminder.reminder_instruction.includes("static/GitHub-controlled go-live first")) fail("Reminder must mention static/GitHub first");
if (!reminder.reminder_instruction.includes("Supabase/Auth/backend later")) fail("Reminder must mention Supabase/Auth/backend later");
for (const item of ["No Supabase activation.", "No Auth activation.", "No database write path.", "No real credential creation."]) {
  if (!reminder.must_not_happen_before_reminder.includes(item)) fail(`Reminder blocked item missing: ${item}`);
}

if (!blockers.blockers_before_real_go_live_execution.some((item) => item.blocker.includes("No Supabase/Auth/backend activation approved"))) {
  fail("Supabase/Auth/backend activation blocker missing");
}
if (!blockers.blockers_before_real_go_live_execution.some((item) => item.blocker.includes("No publishing operation approved"))) {
  fail("Publishing blocker missing");
}

if (readiness.ready_for_ag17b !== true) fail("AG17B readiness missing");
if (readiness.selected_path !== "hybrid_staged_path") fail("Readiness selected path mismatch");
if (readiness.static_github_controlled_first !== true) fail("Static/GitHub first readiness missing");
if (readiness.supabase_auth_deferred !== true) fail("Supabase/Auth deferred readiness missing");
if (readiness.future_supabase_auth_reminder_required !== true) fail("Future reminder required missing");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");
if (readiness.real_auth_ready !== false) fail("Real Auth must remain blocked");
if (readiness.github_write_ready !== false) fail("GitHub write must remain blocked");
if (readiness.publish_ready !== false) fail("Publishing must remain blocked");

if (boundary.status !== "ag17b_boundary_created_not_started") fail("AG17B boundary status mismatch");
if (boundary.next_stage_id !== "AG17B") fail("AG17B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG17B explicit approval missing");
if (boundary.selected_path !== "hybrid_staged_path") fail("Boundary selected path mismatch");
if (boundary.supabase_auth_defer_reminder_required_in_ag17b !== true) fail("AG17B must carry Supabase reminder");

if (schema.status !== "schema_controlled_go_live_implementation_path_decision_only") fail("Schema status mismatch");

for (const key of [
  "option_comparison_allowed_in_ag17a",
  "hybrid_staged_path_decision_allowed_in_ag17a",
  "supabase_auth_defer_reminder_allowed_in_ag17a",
  "blocker_register_allowed_in_ag17a",
  "ag17b_boundary_allowed_in_ag17a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_generation_allowed_in_ag17a",
  "article_mutation_allowed_in_ag17a",
  "queue_mutation_allowed_in_ag17a",
  "active_admin_review_queue_record_creation_allowed_in_ag17a",
  "queue_index_mutation_allowed_in_ag17a",
  "admin_action_execution_allowed_in_ag17a",
  "editor_action_execution_allowed_in_ag17a",
  "auth_activation_allowed_in_ag17a",
  "backend_activation_allowed_in_ag17a",
  "supabase_activation_allowed_in_ag17a",
  "github_write_operation_allowed_in_ag17a",
  "public_visibility_switch_allowed_in_ag17a",
  "public_index_mutation_allowed_in_ag17a",
  "public_publishing_operation_allowed_in_ag17a",
  "deployment_trigger_allowed_in_ag17a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, comparison, decision, reminder, blockers, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.controlled_go_live_implementation_path_decision_only !== true) fail(`${obj.title || "object"} must be AG17A decision-only`);
  if (obj.article_generation_performed_in_ag17a !== false) fail(`${obj.title || "object"} must not generate articles`);
  if (obj.article_mutation_performed_in_ag17a !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.queue_mutation_performed_in_ag17a !== false) fail(`${obj.title || "object"} must not mutate queue`);
  if (obj.auth_activation_performed_in_ag17a !== false) fail(`${obj.title || "object"} must not activate Auth`);
  if (obj.supabase_activation_performed_in_ag17a !== false) fail(`${obj.title || "object"} must not activate Supabase`);
  if (obj.github_write_operation_performed_in_ag17a !== false) fail(`${obj.title || "object"} must not perform GitHub write`);
  if (obj.public_visibility_switch_performed_in_ag17a !== false) fail(`${obj.title || "object"} must not switch visibility`);
  if (obj.public_index_mutation_performed_in_ag17a !== false) fail(`${obj.title || "object"} must not mutate public index`);
  if (obj.public_publishing_operation_performed_in_ag17a !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Selected Path", "Supabase/Auth Reminder", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG17A document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag17a", "validate:ag17a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag17a")) {
  fail("validate:project must include validate:ag17a");
}

pass("AG17A registry is present.");
pass("AG17A document is present.");
pass("AG17A review, option comparison, hybrid decision, Supabase/Auth reminder, blocker register, readiness, AG17B boundary, schema, learning and preview are present.");
pass("AG16Z closure is consumed.");
pass("Hybrid staged path is selected.");
pass("Static/GitHub-controlled go-live first is recorded.");
pass("Supabase/Auth/backend is deferred and future reminder is required.");
pass("Real activation, credentials, GitHub write, visibility switch, public index mutation and publishing remain blocked.");
pass("AG17B Hybrid Static Go-live Implementation Plan boundary is created with explicit approval required.");
pass("AG17A is Controlled Go-live Implementation Path Decision only.");
