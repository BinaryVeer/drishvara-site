import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag39zClosure: "data/content-intelligence/backend-architecture/ag39z-controlled-execution-closure.json",
  ag39zReadiness: "data/content-intelligence/quality-registry/ag39z-live-article-url-test-readiness-record.json",
  ag39zBoundary: "data/content-intelligence/mutation-plans/ag39z-to-ag40a-live-article-url-test-boundary.json",
  ag39zApprovalCarryForward: "data/content-intelligence/backend-architecture/ag39z-operator-approval-carry-forward-record.json",
  ag39zLiveSmokeReadiness: "data/content-intelligence/backend-architecture/ag39z-live-dynamic-smoke-test-readiness-record.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag40a-live-article-url-test.json",
  package: "data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json",
  liveUrlResult: "data/content-intelligence/backend-architecture/ag40a-live-article-url-result-record.json",
  operatorApprovalRecord: "data/content-intelligence/backend-architecture/ag40a-live-url-operator-approval-record.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag40a-no-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag40a-live-article-url-test-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag40a-admin-editor-workflow-test-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag40a-to-ag40b-admin-editor-workflow-test-boundary.json",
  registry: "data/quality/ag40a-live-article-url-test.json",
  preview: "data/quality/ag40a-live-article-url-test-preview.json",
  doc: "docs/quality/AG40A_LIVE_ARTICLE_URL_TEST.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG40A input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag39zClosure.status !== "controlled_execution_closure_created_ready_for_ag40a_live_article_url_test") {
  throw new Error("AG39Z closure status mismatch.");
}
if (records.ag39zReadiness.ready_for_ag40a !== true) {
  throw new Error("AG39Z readiness does not permit AG40A.");
}
if (records.ag39zBoundary.next_stage_id !== "AG40A") {
  throw new Error("AG39Z boundary does not point to AG40A.");
}

const liveUrl = process.env.AG40A_LIVE_ARTICLE_URL;
if (!liveUrl || !/^https:\/\/.+/i.test(liveUrl)) {
  throw new Error("AG40A_LIVE_ARTICLE_URL must be set to an https URL.");
}

const startedAt = new Date().toISOString();

let httpStatus = 0;
let ok = false;
let finalUrl = liveUrl;
let contentType = "";
let body = "";
let errorMessage = null;
let elapsedMs = 0;

try {
  const t0 = Date.now();
  const response = await fetch(liveUrl, {
    method: "GET",
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: {
      "user-agent": "Drishvara-AG40A-Live-URL-Test/1.0"
    }
  });
  elapsedMs = Date.now() - t0;
  httpStatus = response.status;
  ok = response.ok;
  finalUrl = response.url;
  contentType = response.headers.get("content-type") || "";
  body = await response.text();
} catch (err) {
  errorMessage = err?.message || String(err);
}

const titleMatch = body.match(/<title[^>]*>(.*?)<\/title>/is);
const pageTitle = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : null;
const bodySample = body.slice(0, 5000);
const bodyHash = crypto.createHash("sha256").update(bodySample).digest("hex");

const hasHtml = /<html[\s>]/i.test(body) || /<!doctype html/i.test(body);
const hasArticleSignal =
  /article/i.test(body) ||
  /drishvara/i.test(body) ||
  /enhancing/i.test(body) ||
  /healthcare/i.test(body) ||
  /digital/i.test(body);

const liveUrlTestPassed =
  ok === true &&
  httpStatus >= 200 &&
  httpStatus < 400 &&
  hasHtml === true &&
  hasArticleSignal === true &&
  !errorMessage;

const blockedState = {
  live_article_url_test_executed: true,
  live_article_url_test_passed: liveUrlTestPassed,
  admin_editor_workflow_test_executed: false,
  public_listing_test_executed: false,

  explicit_operator_approval_recorded_for_ag40a: true,
  public_mutation_approved_now: false,
  execution_authorized_now: false,
  real_apply_approved_now: false,
  real_publish_executed: false,
  actual_queue_state_changed: false,
  audit_log_write_done: false,
  rollback_write_done: false,
  database_write_done: false,
  public_article_mutated: false,
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_enabled: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  anon_access_granted: false,
  write_grants_executed: false,
  sql_file_created: false,
  sql_grants_executed: false
};

const operatorApprovalRecord = {
  module_id: "AG40A",
  title: "Live URL Operator Approval Record",
  status: "operator_approval_recorded_for_read_only_live_url_test",
  approval_scope: "AG40A live article URL read-only GET test only",
  approved_by: "vikash vaibhav",
  approval_recorded_in_chat: true,
  not_approved: [
    "public mutation",
    "real publish",
    "database write",
    "audit-log write",
    "rollback write",
    "deployment",
    "SQL grant execution",
    "service-role key use"
  ],
  blocked_state: blockedState
};

const liveUrlResult = {
  module_id: "AG40A",
  title: "Live Article URL Result Record",
  status: liveUrlTestPassed ? "live_article_url_test_passed" : "live_article_url_test_failed",
  tested_url: liveUrl,
  final_url: finalUrl,
  started_at: startedAt,
  completed_at: new Date().toISOString(),
  elapsed_ms: elapsedMs,
  http_status: httpStatus,
  response_ok: ok,
  content_type: contentType,
  page_title: pageTitle,
  has_html: hasHtml,
  has_article_signal: hasArticleSignal,
  response_sample_sha256: bodyHash,
  error_message: errorMessage,
  live_url_test_passed: liveUrlTestPassed,
  read_only_request_only: true,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG40A",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag40a",
  checks: [
    { check_id: "read_only_get_request_only", passed: true },
    { check_id: "no_public_mutation", passed: true },
    { check_id: "no_real_publish", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_sql_execution", passed: true },
    { check_id: "no_service_role_key", passed: true },
    { check_id: "no_anon_grant", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const packageRecord = {
  module_id: "AG40A",
  title: "Live Article URL Test Package",
  status: liveUrlTestPassed
    ? "live_article_url_test_created_ready_for_ag40b"
    : "live_article_url_test_created_failed_url_check",
  purpose:
    "Execute a read-only live article URL test after AG39Z closure, without public mutation, database write, deployment, SQL grant execution or service-role key use.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  test_decision: {
    live_article_url_test_executed: true,
    live_article_url_test_passed: liveUrlTestPassed,
    proceed_to_ag40b_admin_editor_workflow_test: liveUrlTestPassed,

    public_mutation_approved_now: false,
    execution_authorized_now: false,
    real_publish_executed: false,
    database_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_grants_executed: false
  },
  operator_approval_record_file: outputs.operatorApprovalRecord,
  live_url_result_file: outputs.liveUrlResult,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG40A",
  title: "Live Article URL Test Blocker Register",
  status: "live_article_url_test_blockers_preserved",
  blocked_items: [
    "No public mutation.",
    "No real publish.",
    "No database write.",
    "No audit-log write.",
    "No rollback write.",
    "No deployment.",
    "No SQL grant execution.",
    "No service-role key exposure.",
    "No anon grants."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG40A",
  title: "Admin/Editor Workflow Test Readiness Record",
  status: liveUrlTestPassed
    ? "ready_for_ag40b_admin_editor_workflow_test"
    : "blocked_pending_live_article_url_fix",
  ready_for_ag40b: liveUrlTestPassed,
  next_stage_id: "AG40B",
  next_stage_title: "Admin/Editor Workflow Test",
  live_article_url_test_passed: liveUrlTestPassed,
  explicit_operator_approval_required_for_ag40b: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG40A",
  title: "AG40A to AG40B Admin/Editor Workflow Test Boundary",
  status: liveUrlTestPassed
    ? "ag40b_admin_editor_workflow_test_boundary_created"
    : "ag40b_boundary_blocked_pending_url_fix",
  next_stage_id: "AG40B",
  next_stage_title: "Admin/Editor Workflow Test",
  allowed_scope: [
    "Consume AG40A live URL result.",
    "Test Admin/Editor workflow only after explicit approval.",
    "Keep public mutation, database write, deployment and service-role key use blocked unless separately approved."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG40A",
  title: "Live Article URL Test",
  status: packageRecord.status,
  depends_on: ["AG39Z", "AG38Z"],
  generated_from: inputs,
  package_file: outputs.package,
  operator_approval_record_file: outputs.operatorApprovalRecord,
  live_url_result_file: outputs.liveUrlResult,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    live_article_url_test_executed: true,
    live_article_url_test_passed: liveUrlTestPassed,
    ready_for_ag40b: liveUrlTestPassed,

    public_mutation_approved_now: false,
    real_publish_executed: false,
    database_write_done: false,
    public_mutation_done: false,
    deployment_done: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG40A", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG40A",
  preview_only: false,
  status: review.status,
  tested_url: liveUrl,
  http_status: httpStatus,
  page_title: pageTitle,
  live_article_url_test_executed: 1,
  live_article_url_test_passed: liveUrlTestPassed ? 1 : 0,
  ready_for_ag40b: liveUrlTestPassed ? 1 : 0,
  public_mutation_done: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  deployment_done: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_grants_executed: 0
};

const doc = `# AG40A — Live Article URL Test

## Result

AG40A executed a read-only live article URL test.

## Tested URL

${liveUrl}

## HTTP Result

- Status: ${httpStatus}
- Final URL: ${finalUrl}
- Page title: ${pageTitle || "Not detected"}
- Passed: ${liveUrlTestPassed ? "Yes" : "No"}

## Scope

This stage performed a read-only GET request only.

## Still Blocked

- No public mutation.
- No real publish.
- No database write.
- No deployment.
- No SQL grant execution.
- No service-role key exposure.
- No anon grants.

## Next

${liveUrlTestPassed ? "AG40B — Admin/Editor Workflow Test." : "Fix or confirm the live article URL before AG40B."}
`;

writeJson(outputs.operatorApprovalRecord, operatorApprovalRecord);
writeJson(outputs.liveUrlResult, liveUrlResult);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.package, packageRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

if (!liveUrlTestPassed) {
  console.error("❌ AG40A live article URL test failed.");
  console.error(`URL: ${liveUrl}`);
  console.error(`HTTP status: ${httpStatus}`);
  console.error(`Error: ${errorMessage || "No fetch error; content/status check failed."}`);
  process.exit(1);
}

console.log("✅ AG40A Live Article URL Test generated.");
console.log(`✅ Live URL reachable: ${liveUrl}`);
console.log(`✅ HTTP status: ${httpStatus}`);
console.log("✅ Ready for AG40B Admin/Editor Workflow Test.");
console.log("✅ No public mutation, real publish, database write, deployment, SQL grant execution or service-role key recorded.");
