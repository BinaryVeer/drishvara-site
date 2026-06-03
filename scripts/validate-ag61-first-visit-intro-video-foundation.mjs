import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function fail(message) { console.error(`❌ AG61 validation failed: ${message}`); process.exit(1); }
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "package.json",
  "index.html",
  "data/content-intelligence/quality-reviews/ag60j-live-surface-final-review.json",
  "scripts/generate-ag61-first-visit-intro-video-foundation.mjs",
  "scripts/validate-ag61-first-visit-intro-video-foundation.mjs",
  "data/content-intelligence/quality-reviews/ag61-first-visit-intro-video-foundation.json",
  "data/content-intelligence/phase-01-modules/ag61-first-visit-intro-video-asset-audit.json",
  "data/initial-working-data/intro-video/ag61-first-visit-intro-video-initial-working-data.json",
  "data/methodology/intro-video/ag61-first-visit-intro-video-methodology.json",
  "data/feedback/intro-video/ag61-intro-video-feedback-ready-schema.json",
  "data/feedback/intro-video/ag61-intro-video-admin-review-absorption-schema.json",
  "data/content-intelligence/phase-01-modules/ag61-first-visit-intro-video-implementation-plan.json",
  "data/monetization/intro-video/ag61-paid-preview-admin-operated-space-policy.json",
  "data/content-intelligence/quality-registry/ag61-ag62-first-light-working-data-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag61-to-ag62-first-light-working-data-boundary.json",
  "data/content-intelligence/backend-architecture/ag61-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag61-no-v02-expansion-audit.json",
  "data/quality/ag61-first-visit-intro-video-foundation.json",
  "data/quality/ag61-first-visit-intro-video-foundation-preview.json",
  "docs/quality/AG61_FIRST_VISIT_INTRO_VIDEO_FOUNDATION.md"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const pkg = readJson("package.json");
if (!pkg.scripts?.["generate:ag61"]) fail("Missing generate:ag61 script.");
if (!pkg.scripts?.["validate:ag61"]) fail("Missing validate:ag61 script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag61")) fail("validate:project must include validate:ag61.");

const indexHtml = read("index.html");

for (const forbidden of [
  "intro-video-modal",
  "first-visit-intro-modal",
  "drishvara:intro-video:seen",
  "<video"
]) {
  if (indexHtml.includes(forbidden)) fail(`Intro modal/video runtime must not be activated in AG61: ${forbidden}`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag61-first-visit-intro-video-foundation.json");
const assetAudit = readJson("data/content-intelligence/phase-01-modules/ag61-first-visit-intro-video-asset-audit.json");
const initialData = readJson("data/initial-working-data/intro-video/ag61-first-visit-intro-video-initial-working-data.json");
const methodology = readJson("data/methodology/intro-video/ag61-first-visit-intro-video-methodology.json");
const feedbackSchema = readJson("data/feedback/intro-video/ag61-intro-video-feedback-ready-schema.json");
const adminSchema = readJson("data/feedback/intro-video/ag61-intro-video-admin-review-absorption-schema.json");
const implementationPlan = readJson("data/content-intelligence/phase-01-modules/ag61-first-visit-intro-video-implementation-plan.json");
const paidPreview = readJson("data/monetization/intro-video/ag61-paid-preview-admin-operated-space-policy.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag61-ag62-first-light-working-data-readiness-record.json");
const preview = readJson("data/quality/ag61-first-visit-intro-video-foundation-preview.json");

if (review.status !== "ag61_first_visit_intro_video_foundation_completed") fail("Review status mismatch.");
if (review.summary.intro_video_foundation_created !== true) fail("Foundation summary missing.");
if (review.summary.modal_ui_activated !== false) fail("Modal UI must not activate.");
if (review.summary.popup_runtime_activated !== false) fail("Popup runtime must not activate.");
if (review.summary.backend_runtime_activated !== false) fail("Backend runtime must remain false.");
if (review.summary.v02_expansion_started !== false) fail("V02 expansion must remain false.");
if (review.summary.ready_for_ag62 !== true) fail("AG62 readiness missing.");
if (review.summary.paid_preview_admin_operated_space_planned !== true) fail("Paid preview planning summary missing.");
if (review.summary.paid_preview_public_ui_activated !== false) fail("Paid preview public UI must remain inactive.");

if (assetAudit.popup_activated !== false) fail("Popup activation must be false.");
if (initialData.activation_status !== "not_activated") fail("Initial data activation status mismatch.");
if (!Array.isArray(methodology.quality_gates_before_activation) || methodology.quality_gates_before_activation.length < 8) fail("Quality gates incomplete.");
if (feedbackSchema.user_feedback_allowed_now !== false) fail("User feedback must not be active now.");
if (!adminSchema.absorption_rule.includes("Only admin-approved feedback")) fail("Admin absorption rule missing.");
if (implementationPlan.status !== "implementation_planned_no_ui_activation") fail("Implementation plan status mismatch.");
if (paidPreview.status !== "paid_preview_space_planned_not_publicly_active") fail("Paid preview policy status mismatch.");
if (paidPreview.operating_model.admin_operated !== true) fail("Paid preview must be admin-operated.");
if (paidPreview.operating_model.automatic_publication_allowed !== false) fail("Paid preview automatic publication must remain false.");
if (paidPreview.operating_model.sponsor_or_paid_label_required !== true) fail("Paid/sponsor label requirement missing.");
if (readiness.ready_for_ag62 !== true) fail("AG62 readiness must be true.");
if (preview.modal_ui_activated !== 0) fail("Preview modal activation must be zero.");

for (const auditPath of [
  "data/content-intelligence/backend-architecture/ag61-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag61-no-v02-expansion-audit.json"
]) {
  const audit = readJson(auditPath);
  if (audit.audit_passed !== true) fail(`${auditPath} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${auditPath} failed_checks must be empty.`);
}

pass("AG61 First Visit Intro Video Modal Foundation is present.");
pass("Initial working data, methodology, feedback, admin absorption and paid preview policy schemas are present.");
pass("No modal UI, popup runtime or video embed is activated.");
pass("No backend/runtime/service-role/V02 action is recorded.");
pass("AG62 First Light readiness is valid.");
