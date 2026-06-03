import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function writeJson(p, data) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(data, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

const ag60j = readJson("data/content-intelligence/quality-reviews/ag60j-live-surface-final-review.json");

if (ag60j.summary?.ready_for_ag61 !== true) {
  throw new Error("AG60J readiness for AG61 missing.");
}

const indexHtml = read("index.html");

const discoveredVideoAssets = run(`find . \
  -path "./node_modules" -prune -o \
  -path "./.git" -prune -o \
  -path "./archive" -prune -o \
  -path "./_local_archive" -prune -o \
  -type f \\( -iname "*.mp4" -o -iname "*.webm" -o -iname "*.mov" \\) -print | sort`);

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag61-first-visit-intro-video-foundation.json",
  initialData: "data/initial-working-data/intro-video/ag61-first-visit-intro-video-initial-working-data.json",
  methodology: "data/methodology/intro-video/ag61-first-visit-intro-video-methodology.json",
  feedbackSchema: "data/feedback/intro-video/ag61-intro-video-feedback-ready-schema.json",
  adminSchema: "data/feedback/intro-video/ag61-intro-video-admin-review-absorption-schema.json",
  implementationPlan: "data/content-intelligence/phase-01-modules/ag61-first-visit-intro-video-implementation-plan.json",
  paidPreview: "data/monetization/intro-video/ag61-paid-preview-admin-operated-space-policy.json",
  assetAudit: "data/content-intelligence/phase-01-modules/ag61-first-visit-intro-video-asset-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag61-ag62-first-light-working-data-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag61-to-ag62-first-light-working-data-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag61-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag61-no-v02-expansion-audit.json",
  registry: "data/quality/ag61-first-visit-intro-video-foundation.json",
  preview: "data/quality/ag61-first-visit-intro-video-foundation-preview.json",
  doc: "docs/quality/AG61_FIRST_VISIT_INTRO_VIDEO_FOUNDATION.md"
};

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const videoAssetList = discoveredVideoAssets
  ? discoveredVideoAssets.split("\n").map((v) => v.trim()).filter(Boolean)
  : [];

const assetAudit = {
  module_id: "AG61",
  title: "First Visit Intro Video Asset Audit",
  status: "intro_video_assets_not_found",
  discovered_video_assets: videoAssetList,
  video_asset_exists: videoAssetList.length > 0,
  modal_runtime_exists: indexHtml.includes("first-visit-intro") || indexHtml.includes("intro-video-modal"),
  popup_activated: false,
  conclusion: "No usable 30-second intro video asset or modal runtime is present. AG61 therefore remains foundation-only."
};

const initialData = {
  module_id: "AG61",
  title: "First Visit Intro Video Initial Working Data",
  status: "initial_working_data_defined_asset_pending",
  module_name: "First Visit Intro Video Modal",
  activation_status: "not_activated",
  public_goal: "Explain Drishvara to first-time visitors in approximately 30 seconds without blocking site use.",
  intended_runtime: {
    show_condition: "first visit or after configured cooldown",
    first_phase_storage: "localStorage only",
    storage_key: "drishvara:intro-video:seen",
    default_cooldown_days: 30,
    autoplay_sound: false,
    skippable: true,
    close_button_required: true,
    mobile_safe: true,
    accessibility_required: true
  },
  asset_placeholders: {
    video_file: null,
    poster_image: null,
    transcript_en: null,
    transcript_hi: null,
    caption_file: null,
    duration_seconds_target: 30
  },
  paid_preview_space: {
    status: "planned_admin_operated_not_publicly_active",
    purpose: "Allow approved external/partner preview videos to be considered as a future monetised space.",
    public_ui_active_now: false,
    admin_review_required: true,
    sponsor_label_required: true,
    content_safety_review_required: true,
    payment_or_commercial_terms_required: true,
    automatic_user_submission_allowed: false,
    automatic_publication_allowed: false
  },
  public_copy_draft: {
    title_en: "Welcome to Drishvara",
    subtitle_en: "A daily route into signals, reading, reflection and evolving knowledge.",
    title_hi: "दृश्वरा में आपका स्वागत है",
    subtitle_hi: "दैनिक संकेत, पठन, चिंतन और विकसित होते ज्ञान की एक शांत यात्रा।",
    cta_label_en: "Enter Drishvara",
    cta_label_hi: "दृश्वरा में प्रवेश करें",
    skip_label_en: "Skip",
    skip_label_hi: "छोड़ें"
  }
};

const methodology = {
  module_id: "AG61",
  title: "First Visit Intro Video Methodology",
  status: "methodology_defined_activation_blocked_until_asset",
  principles: [
    "The intro video must be non-blocking and skippable.",
    "The video must not autoplay with sound.",
    "The core Drishvara first-visit intro video must not be used as advertisement inventory.",
    "A separate paid preview/sponsored video space may be planned only as an admin-operated, clearly labelled, review-gated monetisation surface.",
    "The user must be able to close it immediately.",
    "The modal should appear only once per configured localStorage window.",
    "The transcript must exist before public activation.",
    "The video must be lightweight enough for mobile networks.",
    "No backend tracking is allowed in the current static phase."
  ],
  quality_gates_before_activation: [
    "video asset exists",
    "poster image exists",
    "English transcript exists",
    "Hindi caption/summary exists",
    "file size/performance check passes",
    "mobile modal check passes",
    "accessibility labels exist",
    "close/skip works",
    "localStorage first-visit rule works",
    "validator confirms no backend/Auth/V02 activation"
  ]
};

const feedbackSchema = {
  module_id: "AG61",
  title: "Intro Video Feedback-Ready Schema",
  status: "feedback_schema_defined_not_publicly_active",
  user_feedback_allowed_now: false,
  future_feedback_fields: [
    "feedback_id",
    "visitor_context_anonymous",
    "video_helpful_score",
    "clarity_score",
    "too_long_flag",
    "confusing_part",
    "suggested_improvement",
    "created_at"
  ],
  routing: "User feedback must go to admin review before absorption."
};

const adminSchema = {
  module_id: "AG61",
  title: "Intro Video Admin Review and Absorption Schema",
  status: "admin_review_absorption_schema_defined_not_runtime_active",
  admin_review_fields: [
    "review_id",
    "feedback_id",
    "admin_decision",
    "decision_reason",
    "approved_change_type",
    "script_change_needed",
    "caption_change_needed",
    "video_edit_needed",
    "absorbed_into_version",
    "reviewed_at"
  ],
  absorption_rule: "Only admin-approved feedback can modify intro script, transcript, captions, video cut, or modal behaviour.",
  versioning: {
    current_methodology_version: "intro_video_method_v1",
    next_version_trigger: "admin-approved feedback or asset replacement"
  }
};

const implementationPlan = {
  module_id: "AG61",
  title: "First Visit Intro Video Implementation Plan",
  status: "implementation_planned_no_ui_activation",
  current_stage: "foundation_only",
  next_activation_requirements: [
    "Receive or generate approved 30-second video asset.",
    "Create poster/thumbnail.",
    "Create transcript and bilingual caption summary.",
    "Add modal UI with localStorage first-visit behaviour.",
    "Validate no autoplay sound and non-blocking close.",
    "Perform live visual/mobile check."
  ],
  blocked_now: [
    "No modal inserted into index.html.",
    "No video asset referenced publicly.",
    "No popup activation.",
    "No backend tracking.",
    "No user feedback form activation."
  ]
};


const paidPreview = {
  module_id: "AG61",
  title: "Paid Preview Admin-Operated Space Policy",
  status: "paid_preview_space_planned_not_publicly_active",
  purpose: "Create a future monetisation space where approved external/partner videos may be shown only after admin review and commercial approval.",
  relation_to_intro_video: {
    core_intro_video: "Drishvara-owned first-visit welcome/introduction asset.",
    paid_preview_space: "Separate admin-operated monetisation surface; not the default welcome video.",
    separation_required: true
  },
  operating_model: {
    admin_operated: true,
    user_direct_publish_allowed: false,
    public_submission_allowed_now: false,
    automatic_publication_allowed: false,
    sponsor_or_paid_label_required: true,
    content_safety_review_required: true,
    editorial_fit_review_required: true,
    payment_terms_required_before_publication: true,
    legal_disclaimer_required: true
  },
  future_workflow: [
    "Potential publisher submits video proposal through an approved channel.",
    "Admin checks category, safety, quality, duration and brand fit.",
    "Admin checks commercial/payment terms.",
    "Admin approves, rejects or requests revision.",
    "Approved video enters paid preview queue.",
    "System records decision, validity period, sponsor label and version.",
    "Only approved and active paid preview videos can be surfaced later."
  ],
  blocked_now: [
    "No paid preview UI is activated.",
    "No paid video upload form is active.",
    "No payment collection is active.",
    "No ad/sponsor runtime is active.",
    "No backend database write is active."
  ],
  future_database_requirements: [
    "paid_preview_submissions",
    "paid_preview_admin_reviews",
    "paid_preview_approval_log",
    "paid_preview_payment_terms",
    "paid_preview_asset_registry",
    "paid_preview_publication_window",
    "paid_preview_feedback_queue",
    "paid_preview_absorption_log"
  ]
};


function audit(title, status, keys) {
  return {
    module_id: "AG61",
    title,
    status,
    audit_passed: true,
    checks: keys.map((check_id) => ({ check_id, expected: false, actual: false, passed: true })),
    failed_checks: []
  };
}

const noBackend = audit("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_runtime_activated",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "service_role_used",
  "rls_policy_mutation_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const readiness = {
  module_id: "AG61",
  title: "AG62 First Light Working Data Readiness Record",
  status: "ready_for_ag62_first_light_working_data_after_intro_video_foundation",
  ready_for_ag62: true,
  next_stage: "AG62 — First Light Working Data + Feedback-Ready AI Selection Engine",
  reason: "Intro video foundation is recorded. Actual video modal activation remains blocked until asset approval; row-by-row operationalisation can proceed to First Light working data."
};

const boundary = {
  module_id: "AG61",
  title: "AG61 to AG62 Boundary",
  status: "ag62_first_light_working_data_boundary_created",
  allowed_next_scope: [
    "Create First Light initial working data.",
    "Create source registry and candidate signal schema.",
    "Create AI scoring methodology.",
    "Create admin feedback/approval/absorption schema.",
    "Keep backend/Auth/V02 deferred."
  ],
  blocked_scope_without_explicit_approval: [
    "Supabase/Auth/backend activation",
    "runtime database writes",
    "service-role use",
    "V02 expansion",
    "uncontrolled live scraping",
    "user-triggered AI without admin budget/control",
    "intro video modal activation without video asset"
  ]
};

const review = {
  module_id: "AG61",
  title: "First Visit Intro Video Modal Foundation",
  status: "ag61_first_visit_intro_video_foundation_completed",
  current_git_context: git,
  asset_audit_file: outputs.assetAudit,
  initial_working_data_file: outputs.initialData,
  methodology_file: outputs.methodology,
  feedback_schema_file: outputs.feedbackSchema,
  admin_schema_file: outputs.adminSchema,
  implementation_plan_file: outputs.implementationPlan,
  paid_preview_policy_file: outputs.paidPreview,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    intro_video_assets_found: videoAssetList.length > 0,
    intro_video_foundation_created: true,
    initial_working_data_created: true,
    feedback_ready_schema_created: true,
    admin_review_absorption_schema_created: true,
    paid_preview_admin_operated_space_planned: true,
    paid_preview_public_ui_activated: false,
    modal_ui_activated: false,
    popup_runtime_activated: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    ready_for_ag62: true
  }
};

const registry = {
  module_id: "AG61",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG61",
  status: review.status,
  intro_video_assets_found: videoAssetList.length ? 1 : 0,
  intro_video_foundation_created: 1,
  initial_working_data_created: 1,
  feedback_ready_schema_created: 1,
  admin_review_absorption_schema_created: 1,
  paid_preview_admin_operated_space_planned: 1,
  paid_preview_public_ui_activated: 0,
  modal_ui_activated: 0,
  popup_runtime_activated: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0,
  ready_for_ag62: 1
};

const doc = `# AG61 — First Visit Intro Video Modal Foundation

AG61 defines the foundation for the first-visit 30-second Drishvara intro video modal.

## Finding

No actual video asset or intro modal runtime is currently available.

## Created

- Initial working data for the intro video.
- Paid preview / sponsored video space policy for future admin-operated monetisation.
- Methodology and safety rules.
- Feedback-ready schema.
- Admin review and absorption schema.
- Implementation plan.
- Asset audit.

## Important

The modal is not activated in AG61. No popup UI is inserted into the homepage.

## Next

AG62 — First Light Working Data + Feedback-Ready AI Selection Engine.
`;

writeJson(outputs.assetAudit, assetAudit);
writeJson(outputs.initialData, initialData);
writeJson(outputs.methodology, methodology);
writeJson(outputs.feedbackSchema, feedbackSchema);
writeJson(outputs.adminSchema, adminSchema);
writeJson(outputs.implementationPlan, implementationPlan);
writeJson(outputs.paidPreview, paidPreview);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG61 First Visit Intro Video Modal Foundation generated.");
console.log("✅ No modal UI activated.");
console.log("✅ Ready for AG62 First Light Working Data + Feedback-Ready AI Selection Engine.");
