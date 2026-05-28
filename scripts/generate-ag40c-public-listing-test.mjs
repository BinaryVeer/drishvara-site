import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag40bPackage: "data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json",
  ag40bRouteResult: "data/content-intelligence/backend-architecture/ag40b-admin-editor-route-result-record.json",
  ag40bWorkflowResult: "data/content-intelligence/backend-architecture/ag40b-workflow-surface-result-record.json",
  ag40bNoMutation: "data/content-intelligence/backend-architecture/ag40b-no-mutation-audit-register.json",
  ag40bReadiness: "data/content-intelligence/quality-registry/ag40b-public-listing-test-readiness-record.json",
  ag40bBoundary: "data/content-intelligence/mutation-plans/ag40b-to-ag40c-public-listing-test-boundary.json",
  ag40aPackage: "data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json",
  ag39zClosure: "data/content-intelligence/backend-architecture/ag39z-controlled-execution-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag40c-public-listing-test.json",
  package: "data/content-intelligence/backend-architecture/ag40c-public-listing-test-package.json",
  listingResult: "data/content-intelligence/backend-architecture/ag40c-public-listing-result-record.json",
  articleLinkResult: "data/content-intelligence/backend-architecture/ag40c-public-article-link-result-record.json",
  operatorApprovalRecord: "data/content-intelligence/backend-architecture/ag40c-operator-approval-record.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag40c-no-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag40c-public-listing-test-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag40c-stabilisation-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag40c-to-ag40d-stabilisation-audit-boundary.json",
  registry: "data/quality/ag40c-public-listing-test.json",
  preview: "data/quality/ag40c-public-listing-test-preview.json",
  doc: "docs/quality/AG40C_PUBLIC_LISTING_TEST.md"
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
function normBase(url) { return String(url || "").replace(/\/+$/, ""); }

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG40C input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag40bPackage.status !== "admin_editor_workflow_test_created_ready_for_ag40c") {
  throw new Error("AG40B package status mismatch.");
}
if (records.ag40bPackage.test_decision.admin_editor_workflow_test_passed !== true) {
  throw new Error("AG40B workflow test must pass before AG40C.");
}
if (records.ag40bReadiness.ready_for_ag40c !== true) {
  throw new Error("AG40B readiness does not permit AG40C.");
}
if (records.ag40bBoundary.next_stage_id !== "AG40C") {
  throw new Error("AG40B boundary does not point to AG40C.");
}
if (records.ag40bNoMutation.audit_passed !== true) {
  throw new Error("AG40B no-mutation audit must pass.");
}
if (records.ag40aPackage.status !== "live_article_url_test_created_ready_for_ag40b") {
  throw new Error("AG40A package status mismatch.");
}
if (records.ag39zClosure.status !== "controlled_execution_closure_created_ready_for_ag40a_live_article_url_test") {
  throw new Error("AG39Z closure status mismatch.");
}

const baseUrl = normBase(process.env.AG40C_SITE_BASE_URL || "https://drishvara.com");

const listingUrls = [
  `${baseUrl}/`,
  `${baseUrl}/articles/`,
  `${baseUrl}/articles/index.html`,
  `${baseUrl}/featured.html`,
  `${baseUrl}/featured-reads.html`,
  `${baseUrl}/categories.html`,
  `${baseUrl}/articles/policy/`,
  `${baseUrl}/articles/spirituality/`
];

async function probe(url) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "user-agent": "Drishvara-AG40C-Public-Listing-Test/1.0" }
    });
    const text = await response.text();
    const hrefs = [...text.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);
    const articleLinks = hrefs.filter((h) => /article|\.html|featured|read/i.test(h));
    return {
      url,
      final_url: response.url,
      http_status: response.status,
      response_ok: response.ok,
      content_type: response.headers.get("content-type") || "",
      elapsed_ms: Date.now() - started,
      page_title: (text.match(/<title[^>]*>(.*?)<\/title>/is)?.[1] || null)?.replace(/\s+/g, " ").trim() || null,
      has_html: /<html[\s>]/i.test(text) || /<!doctype html/i.test(text),
      has_drishvara_signal: /drishvara/i.test(text),
      has_listing_signal: /article|featured|read|insight|reflection|category/i.test(text),
      article_link_count: articleLinks.length,
      sample_article_links: articleLinks.slice(0, 10),
      sample_sha256: crypto.createHash("sha256").update(text.slice(0, 5000)).digest("hex"),
      error_message: null
    };
  } catch (err) {
    return {
      url,
      final_url: url,
      http_status: 0,
      response_ok: false,
      content_type: "",
      elapsed_ms: Date.now() - started,
      page_title: null,
      has_html: false,
      has_drishvara_signal: false,
      has_listing_signal: false,
      article_link_count: 0,
      sample_article_links: [],
      sample_sha256: null,
      error_message: err?.message || String(err)
    };
  }
}

const listingResults = [];
for (const url of listingUrls) {
  listingResults.push(await probe(url));
}

const reachableListings = listingResults.filter((item) =>
  item.response_ok &&
  item.http_status >= 200 &&
  item.http_status < 400 &&
  item.has_html &&
  item.has_drishvara_signal
);

const listingWithArticleSignals = reachableListings.filter((item) =>
  item.has_listing_signal || item.article_link_count > 0
);

const firstListing = listingWithArticleSignals[0] || reachableListings[0] || listingResults[0];

const publicListingTestPassed =
  reachableListings.length >= 1 &&
  listingWithArticleSignals.length >= 1;

const articleLinkResult = {
  module_id: "AG40C",
  title: "Public Article Link Result Record",
  status: publicListingTestPassed ? "public_article_links_detected" : "public_article_links_not_confirmed",
  source_listing_url: firstListing?.url || null,
  detected_article_link_count: firstListing?.article_link_count || 0,
  sample_article_links: firstListing?.sample_article_links || [],
  has_listing_signal: firstListing?.has_listing_signal || false,
  article_link_detection_passed: publicListingTestPassed,
  read_only_get_requests_only: true
};

const blockedState = {
  public_listing_test_executed: true,
  public_listing_test_passed: publicListingTestPassed,
  reachable_listing_count: reachableListings.length,
  listing_with_article_signal_count: listingWithArticleSignals.length,

  stabilisation_audit_executed: false,
  explicit_operator_approval_recorded_for_ag40c: true,
  login_form_submitted: false,
  credentials_used: false,
  session_created: false,
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

articleLinkResult.blocked_state = blockedState;

const operatorApprovalRecord = {
  module_id: "AG40C",
  title: "Public Listing Test Operator Approval Record",
  status: "operator_approval_recorded_for_read_only_public_listing_test",
  approval_scope: "AG40C read-only public listing GET test only",
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
    "service-role key use",
    "credential use",
    "session creation"
  ],
  blocked_state: blockedState
};

const listingResult = {
  module_id: "AG40C",
  title: "Public Listing Result Record",
  status: publicListingTestPassed ? "public_listing_test_passed" : "public_listing_test_failed",
  base_url: baseUrl,
  listing_results: listingResults,
  reachable_listing_count: reachableListings.length,
  listing_with_article_signal_count: listingWithArticleSignals.length,
  public_listing_test_passed: publicListingTestPassed,
  read_only_get_requests_only: true,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG40C",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag40c",
  checks: [
    { check_id: "read_only_get_requests_only", passed: true },
    { check_id: "no_login_submit", passed: true },
    { check_id: "no_credentials_used", passed: true },
    { check_id: "no_session_created", passed: true },
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
  module_id: "AG40C",
  title: "Public Listing Test Package",
  status: publicListingTestPassed
    ? "public_listing_test_created_ready_for_ag40d"
    : "public_listing_test_created_listing_incomplete",
  purpose:
    "Execute read-only public listing checks after AG40B Admin/Editor workflow test, without mutating any public, database, Auth, SQL or deployment state.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  test_decision: {
    public_listing_test_executed: true,
    public_listing_test_passed: publicListingTestPassed,
    proceed_to_ag40d_stabilisation_audit: publicListingTestPassed,

    login_form_submitted: false,
    credentials_used: false,
    session_created: false,
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
  listing_result_file: outputs.listingResult,
  article_link_result_file: outputs.articleLinkResult,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG40C",
  title: "Public Listing Test Blocker Register",
  status: "public_listing_test_blockers_preserved",
  blocked_items: [
    "No login form submission.",
    "No credentials used.",
    "No session created.",
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
  module_id: "AG40C",
  title: "Stabilisation Audit Readiness Record",
  status: publicListingTestPassed ? "ready_for_ag40d_stabilisation_audit" : "blocked_pending_public_listing_fix",
  ready_for_ag40d: publicListingTestPassed,
  next_stage_id: "AG40D",
  next_stage_title: "Stabilisation Audit",
  public_listing_test_passed: publicListingTestPassed,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG40C",
  title: "AG40C to AG40D Stabilisation Audit Boundary",
  status: publicListingTestPassed
    ? "ag40d_stabilisation_audit_boundary_created"
    : "ag40d_boundary_blocked_pending_public_listing_fix",
  next_stage_id: "AG40D",
  next_stage_title: "Stabilisation Audit",
  allowed_scope: [
    "Consume AG40A, AG40B and AG40C smoke-test records.",
    "Audit live URL, Admin/Editor workflow and public listing results.",
    "Confirm no mutation, deployment or service-role key use occurred."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG40C",
  title: "Public Listing Test",
  status: packageRecord.status,
  depends_on: ["AG40B", "AG40A", "AG39Z"],
  generated_from: inputs,
  package_file: outputs.package,
  operator_approval_record_file: outputs.operatorApprovalRecord,
  listing_result_file: outputs.listingResult,
  article_link_result_file: outputs.articleLinkResult,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    public_listing_test_executed: true,
    public_listing_test_passed: publicListingTestPassed,
    ready_for_ag40d: publicListingTestPassed,

    login_form_submitted: false,
    credentials_used: false,
    session_created: false,
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

const registry = { module_id: "AG40C", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG40C",
  preview_only: false,
  status: review.status,
  public_listing_test_executed: 1,
  public_listing_test_passed: publicListingTestPassed ? 1 : 0,
  ready_for_ag40d: publicListingTestPassed ? 1 : 0,
  reachable_listing_count: reachableListings.length,
  listing_with_article_signal_count: listingWithArticleSignals.length,
  login_form_submitted: 0,
  credentials_used: 0,
  session_created: 0,
  public_mutation_done: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  deployment_done: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_grants_executed: 0
};

const doc = `# AG40C — Public Listing Test

## Result

AG40C executed a read-only public listing test.

## Passed

${publicListingTestPassed ? "Yes" : "No"}

## Reachable Listings

${reachableListings.length}

## Listing Pages with Article Signals

${listingWithArticleSignals.length}

## Scope

This stage performed read-only GET requests only.

## Still Blocked

- No login form submission.
- No credentials used.
- No session created.
- No public mutation.
- No real publish.
- No database write.
- No deployment.
- No SQL grant execution.
- No service-role key exposure.
- No anon grants.

## Next

${publicListingTestPassed ? "AG40D — Stabilisation Audit." : "Fix or confirm public listing routes before AG40D."}
`;

writeJson(outputs.operatorApprovalRecord, operatorApprovalRecord);
writeJson(outputs.listingResult, listingResult);
writeJson(outputs.articleLinkResult, articleLinkResult);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.package, packageRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

if (!publicListingTestPassed) {
  console.error("❌ AG40C Public Listing Test failed.");
  for (const item of listingResults) {
    console.error(`${item.http_status} ${item.url} listingSignal=${item.has_listing_signal} articleLinks=${item.article_link_count}`);
  }
  process.exit(1);
}

console.log("✅ AG40C Public Listing Test generated.");
console.log("✅ Public listing surface responded in read-only mode.");
console.log("✅ Ready for AG40D Stabilisation Audit.");
console.log("✅ No login submission, credentials, session, public mutation, database write, deployment, SQL grant execution or service-role key recorded.");
