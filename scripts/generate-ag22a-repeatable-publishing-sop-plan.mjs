import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag21zReview: "data/content-intelligence/quality-reviews/ag21z-simplified-closure-after-ag21e-revert.json",
  ag21zClosure: "data/content-intelligence/closure-records/ag21z-simplified-closure-after-ag21e-revert.json",
  ag21zBoundary: "data/content-intelligence/mutation-plans/ag21z-to-ag22a-first-controlled-static-apply-decision-gate-boundary.json",
  approvalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  supabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag22a-repeatable-publishing-sop-plan.json",
  sopPlan: "data/content-intelligence/go-live/ag22a-repeatable-publishing-sop-plan.json",
  routeMap: "data/content-intelligence/go-live/ag22a-source-to-static-publish-route-map.json",
  batchScope: "data/content-intelligence/go-live/ag22a-batch-publishing-dry-run-scope.json",
  blocker: "data/content-intelligence/quality-registry/ag22a-repeatable-publishing-sop-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag22a-repeatable-publishing-sop-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag22a-to-ag22b-repeatable-publishing-sop-audit-boundary.json",
  schema: "data/content-intelligence/schema/repeatable-publishing-sop-plan.schema.json",
  learning: "data/content-intelligence/learning/ag22a-repeatable-publishing-sop-plan-learning.json",
  registry: "data/quality/ag22a-repeatable-publishing-sop-plan.json",
  preview: "data/quality/ag22a-repeatable-publishing-sop-plan-preview.json",
  doc: "docs/quality/AG22A_REPEATABLE_PUBLISHING_SOP_PLAN.md"
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

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing required AG22A input: ${p}`);
}

if (exists("data/content-intelligence/quality-reviews/ag21e-controlled-static-apply-execution-confirmation.json")) {
  throw new Error("AG21E still exists. AG22A requires AG21E to remain reverted.");
}

const ag21zReview = readJson(inputs.ag21zReview);
const ag21zClosure = readJson(inputs.ag21zClosure);
const ag21zBoundary = readJson(inputs.ag21zBoundary);
const approvalPhrase = readJson(inputs.approvalPhrase);
const supabaseReminder = readJson(inputs.supabaseReminder);

const phrase = "Proceed with first controlled static apply";

if (ag21zReview.status !== "ag21_closed_after_ag21e_revert_ready_for_ag22a_decision_gate") {
  throw new Error("AG21Z review is not ready for AG22A.");
}
if (ag21zClosure.final_decision.proceed_to_ag22a_first_controlled_static_apply_decision_gate !== true) {
  throw new Error("AG21Z closure does not hand off to AG22A.");
}
if (ag21zBoundary.next_stage_id !== "AG22A") {
  throw new Error("AG21Z boundary does not point to AG22A.");
}
if (approvalPhrase.exact_phrase_required_later !== phrase) {
  throw new Error("Approval phrase mismatch.");
}

const blockedState = {
  approval_phrase_executed: false,
  article_generated: false,
  article_mutated: false,
  queue_mutated: false,
  github_token_created: false,
  github_write_performed: false,
  public_visibility_switched: false,
  public_index_mutated: false,
  deployment_triggered: false,
  live_smoke_test_performed: false,
  rollback_executed: false,
  article_published: false,
  supabase_auth_backend_activated: false
};

const routeMap = {
  module_id: "AG22A",
  title: "Source to Static Publish Route Map",
  status: "route_map_created_no_execution",
  source_types: [
    {
      source_type: "generated_article",
      description: "Article produced by governed generation pipeline and moved into review/publishing workflow."
    },
    {
      source_type: "manual_article",
      description: "Article drafted or corrected manually and then passed through same static publishing workflow."
    },
    {
      source_type: "future_batch_article",
      description: "Multiple articles prepared for dry-run batch publishing without live publication."
    }
  ],
  repeatable_route: [
    "Source intake",
    "Content and metadata check",
    "Reference/image-credit check",
    "Static article file preparation",
    "Public surface delta preparation",
    "GitHub write readiness",
    "Deployment readiness",
    "Live smoke-test readiness",
    "Rollback readiness",
    "Closure and learning record"
  ],
  blocked_state: blockedState
};

const batchScope = {
  module_id: "AG22A",
  title: "Batch Publishing Dry-run Scope",
  status: "batch_dry_run_scope_defined_no_execution",
  purpose: "Prepare AG22C scope for dry-running multiple future articles without publishing.",
  planned_dry_run_inputs: [
    "One generated article candidate",
    "One manually edited article candidate",
    "One backlog/future-series article candidate"
  ],
  dry_run_outputs_expected_later: [
    "Proposed static article paths",
    "Proposed public surface deltas",
    "Proposed batch index update",
    "Proposed deployment checklist",
    "Proposed rollback checklist"
  ],
  blocked_state: blockedState
};

const sopPlan = {
  module_id: "AG22A",
  title: "Repeatable Publishing SOP Plan",
  status: "repeatable_publishing_sop_plan_created_pending_audit",
  alignment_note: "AG21Z boundary used the earlier title 'First Controlled Static Apply Decision Gate'. AG22A now aligns it to the agreed AG22 series: Repeatable Publishing SOP Plan.",
  selected_path: "hybrid_staged_static_first",
  supabase_auth_backend_deferred: true,
  supabase_reminder: supabaseReminder.reminder,
  required_future_approval_phrase: phrase,
  sop_objective: "Define a repeatable, auditable, static-first publishing workflow for generated/manual articles without executing publication in AG22A.",
  sop_steps: [
    {
      step: 1,
      name: "Article Intake",
      work: "Accept generated/manual/batch candidate article into controlled review path.",
      execute_now: false
    },
    {
      step: 2,
      name: "Content Readiness",
      work: "Check title, category, summary, references, image credit, metadata and article body completeness.",
      execute_now: false
    },
    {
      step: 3,
      name: "Static File Preparation",
      work: "Prepare intended static article path and file delta.",
      execute_now: false
    },
    {
      step: 4,
      name: "Public Surface Delta",
      work: "Prepare intended Featured Reads/category/homepage/sitemap/feed/search updates.",
      execute_now: false
    },
    {
      step: 5,
      name: "GitHub Write Readiness",
      work: "Confirm token handling and write preconditions without creating token or writing.",
      execute_now: false
    },
    {
      step: 6,
      name: "Deployment and Smoke-test Readiness",
      work: "Prepare deployment, article URL check, layout check, references check and rollback checklist.",
      execute_now: false
    },
    {
      step: 7,
      name: "Closure",
      work: "Record result, blockers and learning after dry-run or controlled apply.",
      execute_now: false
    }
  ],
  related_records: {
    route_map: outputs.routeMap,
    batch_scope: outputs.batchScope
  },
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG22A",
  title: "Repeatable Publishing SOP Blocker Register",
  status: "repeatable_publishing_sop_operations_blocked_pending_ag22b_audit",
  blocked_items: [
    "No article generation.",
    "No article mutation.",
    "No queue mutation.",
    "No GitHub token creation.",
    "No GitHub write.",
    "No public visibility switch.",
    "No public index mutation.",
    "No deployment trigger.",
    "No live smoke-test.",
    "No rollback execution.",
    "No publishing.",
    "No Supabase/Auth/backend activation."
  ],
  allowed_now: [
    "Review AG22A SOP plan.",
    "Proceed to AG22B SOP Audit."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG22A",
  title: "Repeatable Publishing SOP Audit Readiness Record",
  status: "ready_for_ag22b_repeatable_publishing_sop_audit",
  ready_for_ag22b: true,
  next_stage_id: "AG22B",
  next_stage_title: "SOP Audit",
  sop_plan_created: true,
  route_map_created: true,
  batch_dry_run_scope_created: true,
  supabase_auth_backend_deferred: true,
  required_future_approval_phrase: phrase,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG22A",
  title: "AG22A to AG22B Repeatable Publishing SOP Audit Boundary",
  status: "ag22b_boundary_created_not_started",
  next_stage_id: "AG22B",
  next_stage_title: "SOP Audit",
  allowed_scope: [
    "Audit repeatable publishing SOP.",
    "Audit generated/manual/batch route map.",
    "Audit batch dry-run scope.",
    "Confirm no real publishing action is enabled.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  blocked_scope: blocker.blocked_items,
  supabase_auth_backend_deferred: true
};

const schema = {
  module_id: "AG22A",
  title: "Repeatable Publishing SOP Plan Schema",
  status: "schema_repeatable_publishing_sop_plan_only",
  sop_plan_allowed: true,
  route_map_allowed: true,
  batch_scope_allowed: true,
  ag22b_boundary_allowed: true,
  real_execution_allowed: false,
  github_write_allowed: false,
  publishing_allowed: false,
  supabase_auth_backend_activation_allowed: false
};

const review = {
  module_id: "AG22A",
  title: "Repeatable Publishing SOP Plan",
  status: "repeatable_publishing_sop_plan_created_pending_audit",
  depends_on: ["AG21Z"],
  generated_from: inputs,
  sop_plan_file: outputs.sopPlan,
  route_map_file: outputs.routeMap,
  batch_scope_file: outputs.batchScope,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  next_boundary_file: outputs.boundary,
  summary: {
    ag22_series_started: true,
    agreed_series_alignment_done: true,
    ready_for_ag22b: true,
    real_execution_done: false,
    supabase_auth_backend_deferred: true
  },
  blocked_state: blockedState
};

const learning = {
  module_id: "AG22A",
  title: "Repeatable Publishing SOP Plan Learning",
  status: "learning_record_only",
  learning_points: [
    "AG22A starts the agreed repeatable publishing workflow series.",
    "The older AG21Z boundary title is aligned into the agreed AG22A SOP plan.",
    "Generated/manual/batch article paths are brought under one repeatable static-first SOP.",
    "No publishing or mutation is performed in AG22A."
  ],
  blocked_state: blockedState
};

const registry = {
  module_id: "AG22A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG22A",
  preview_only: true,
  status: review.status,
  message: "AG22A repeatable publishing SOP plan created. Next: AG22B SOP Audit.",
  blocked_state: blockedState
};

const doc = `# AG22A — Repeatable Publishing SOP Plan

## Purpose

AG22A starts the agreed repeatable static publishing workflow.

It defines the path from generated/manual article to static publishing workflow, but does not publish anything.

## SOP Route

1. Article intake.
2. Content and metadata check.
3. Reference and image-credit check.
4. Static article file preparation.
5. Public surface delta preparation.
6. GitHub write readiness.
7. Deployment and smoke-test readiness.
8. Rollback readiness.
9. Closure and learning record.

## Batch Dry-run Preparation

AG22A also prepares the later AG22C scope for dry-running multiple future articles without publishing.

## Current Blocked State

No article mutation, queue mutation, GitHub token, GitHub write, public visibility switch, public index mutation, deployment, live smoke-test, rollback, publishing, or Supabase/Auth/backend activation is performed.

## Next Stage

AG22B — SOP Audit.
`;

writeJson(outputs.review, review);
writeJson(outputs.sopPlan, sopPlan);
writeJson(outputs.routeMap, routeMap);
writeJson(outputs.batchScope, batchScope);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.schema, schema);
writeJson(outputs.learning, learning);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG22A Repeatable Publishing SOP Plan generated.");
console.log("✅ Route map and batch dry-run scope created.");
console.log("✅ No mutation, GitHub write, deployment or publishing performed.");
console.log("✅ AG22B SOP Audit boundary created.");
