import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  ag21dReview: "data/content-intelligence/quality-reviews/ag21d-controlled-static-apply-execution-readiness-audit.json",
  ag21dAudit: "data/content-intelligence/audit-records/ag21d-controlled-static-apply-execution-readiness-audit-report.json",
  ag21dDecision: "data/content-intelligence/go-live/ag21d-controlled-static-apply-execution-confirmation-decision-record.json",
  ag21dBoundary: "data/content-intelligence/mutation-plans/ag21d-to-ag21e-controlled-static-apply-execution-confirmation-boundary.json",
  approvalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag21z-simplified-closure-after-ag21e-revert.json",
  closure: "data/content-intelligence/closure-records/ag21z-simplified-closure-after-ag21e-revert.json",
  boundary: "data/content-intelligence/mutation-plans/ag21z-to-ag22a-first-controlled-static-apply-decision-gate-boundary.json",
  registry: "data/quality/ag21z-simplified-closure-after-ag21e-revert.json",
  preview: "data/quality/ag21z-simplified-closure-after-ag21e-revert-preview.json",
  doc: "docs/quality/AG21Z_SIMPLIFIED_CLOSURE_AFTER_AG21E_REVERT.md"
};

function exists(p) {
  return fs.existsSync(path.join(root, p));
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), text);
}

for (const p of Object.values(files)) {
  if (!exists(p)) throw new Error(`Missing required input: ${p}`);
}

const ag21eReview = "data/content-intelligence/quality-reviews/ag21e-controlled-static-apply-execution-confirmation.json";
if (exists(ag21eReview)) {
  throw new Error("AG21E still exists. Revert AG21E before running AG21Z simplified closure.");
}

const ag21dReview = readJson(files.ag21dReview);
const ag21dAudit = readJson(files.ag21dAudit);
const ag21dDecision = readJson(files.ag21dDecision);
const ag21dBoundary = readJson(files.ag21dBoundary);
const approvalPhrase = readJson(files.approvalPhrase);
const supabaseReminder = readJson(files.supabaseReminder);

const phrase = "Proceed with first controlled static apply";

if (ag21dReview.status !== "controlled_static_apply_execution_readiness_audit_passed_ready_for_ag21e_execution_confirmation") {
  throw new Error("AG21D is not in expected ready state.");
}
if (ag21dAudit.failed_checks.length !== 0) {
  throw new Error("AG21D audit has failed checks.");
}
if (ag21dDecision.decision.proceed_to_controlled_static_apply_execution_confirmation !== true) {
  throw new Error("AG21D decision is not available.");
}
if (approvalPhrase.exact_phrase_required_later !== phrase) {
  throw new Error("Approval phrase mismatch.");
}

const blockedState = {
  explicit_approval_phrase_executed: false,
  github_token_created: false,
  github_write_performed: false,
  article_mutated: false,
  public_visibility_switched: false,
  public_index_mutated: false,
  deployment_triggered: false,
  live_smoke_test_performed: false,
  rollback_executed: false,
  article_published: false,
  supabase_auth_backend_activated: false
};

const closure = {
  module_id: "AG21Z",
  title: "Simplified Closure After AG21E Revert",
  status: "ag21_closed_after_ag21e_revert_ready_for_ag22a_decision_gate",
  reason_for_closure: "AG21E was introduced as an additional conservative confirmation layer beyond the agreed path and has been reverted.",
  accepted_last_stage: "AG21D",
  reverted_stage: "AG21E",
  superseded_boundary: files.ag21dBoundary,
  superseded_next_stage_from_ag21d: ag21dBoundary.next_stage_id,
  corrected_next_stage: "AG22A",
  corrected_next_stage_title: "First Controlled Static Apply Decision Gate",
  required_future_approval_phrase: phrase,
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  blocked_state: blockedState,
  final_decision: {
    ag21_closed: true,
    proceed_to_ag22a_first_controlled_static_apply_decision_gate: true,
    proceed_to_ag21e: false,
    proceed_to_ag21f: false,
    execute_real_apply_now: false
  }
};

const boundary = {
  module_id: "AG21Z",
  title: "AG21Z to AG22A First Controlled Static Apply Decision Gate Boundary",
  status: "ag22a_boundary_created_not_started",
  next_stage_id: "AG22A",
  next_stage_title: "First Controlled Static Apply Decision Gate",
  purpose: "Move from planning/readiness to a single controlled decision gate for first static apply.",
  required_future_approval_phrase: phrase,
  allowed_scope: [
    "Decide whether to proceed with first controlled static apply.",
    "Restate candidate, surfaces, GitHub write, deployment, smoke-test and rollback preconditions.",
    "Keep Supabase/Auth/backend deferred."
  ],
  blocked_scope: [
    "No GitHub token creation.",
    "No GitHub write.",
    "No article mutation.",
    "No public visibility switch.",
    "No deployment.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ]
};

const review = {
  module_id: "AG21Z",
  title: "AG21Z Simplified Closure After AG21E Revert",
  status: closure.status,
  closure_file: outputs.closure,
  next_boundary_file: outputs.boundary,
  summary: {
    ag21e_reverted: true,
    ag21_closed: true,
    accepted_last_stage: "AG21D",
    next_stage: "AG22A",
    real_apply_done: false,
    supabase_auth_backend_deferred: true
  }
};

const registry = {
  module_id: "AG21Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG21Z",
  preview_only: true,
  status: review.status,
  message: "AG21E reverted; AG21 closed from AG21D; next is AG22A decision gate.",
  blocked_state: blockedState
};

const doc = `# AG21Z — Simplified Closure After AG21E Revert

AG21E was reverted because it was an additional conservative confirmation layer beyond the agreed path.

The accepted last stage is AG21D.

AG21 is now closed without real execution.

No approval phrase was executed. No GitHub token was created. No GitHub write, article mutation, public visibility switch, public index mutation, deployment, live smoke-test, rollback, publishing, or Supabase/Auth/backend activation was performed.

## Next Stage

AG22A — First Controlled Static Apply Decision Gate.

This will be the single decision point before any real controlled static apply.
`;

writeJson(outputs.review, review);
writeJson(outputs.closure, closure);
writeJson(outputs.boundary, boundary);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG21Z simplified closure generated.");
console.log("✅ AG21E revert acknowledged.");
console.log("✅ AG21 closed from AG21D.");
console.log("✅ AG22A decision gate boundary created.");
