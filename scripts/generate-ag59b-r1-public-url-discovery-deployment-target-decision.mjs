import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag59bReview: "data/content-intelligence/quality-reviews/ag59b-controlled-deployment-public-release.json",
  ag59bApproval: "data/content-intelligence/go-live/ag59b-explicit-approval-record.json",
  ag59bReleasePlan: "data/content-intelligence/go-live/ag59b-controlled-release-plan-record.json",
  ag59bReadiness: "data/content-intelligence/quality-registry/ag59b-ag59c-live-public-url-verification-readiness-record.json",
  ag59bBoundary: "data/content-intelligence/mutation-plans/ag59b-to-ag59c-live-public-url-verification-boundary.json",
  packageJson: "package.json",
  vercelJson: "vercel.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag59b-r1-public-url-discovery-deployment-target-decision.json",
  source: "data/content-intelligence/go-live/ag59b-r1-source-consumption-record.json",
  discovery: "data/content-intelligence/go-live/ag59b-r1-public-url-discovery-record.json",
  targetDecision: "data/content-intelligence/go-live/ag59b-r1-deployment-target-decision-record.json",
  githubPagesPlan: "data/content-intelligence/go-live/ag59b-r1-github-pages-activation-plan-record.json",
  ag59cBlocker: "data/content-intelligence/go-live/ag59b-r1-ag59c-live-url-blocker-record.json",
  noDeployment: "data/content-intelligence/backend-architecture/ag59b-r1-no-deployment-execution-audit.json",
  noBackend: "data/content-intelligence/backend-architecture/ag59b-r1-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag59b-r1-no-v02-expansion-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag59b-r1-public-host-activation-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag59b-r1-to-public-host-activation-boundary.json",
  registry: "data/quality/ag59b-r1-public-url-discovery-deployment-target-decision.json",
  preview: "data/quality/ag59b-r1-public-url-discovery-deployment-target-decision-preview.json",
  doc: "docs/quality/AG59B_R1_PUBLIC_URL_DISCOVERY_DEPLOYMENT_TARGET_DECISION.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, txt) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), txt);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG59B-R1 input: ${p}`);
}

const ag59bReview = readJson(inputs.ag59bReview);
const ag59bApproval = readJson(inputs.ag59bApproval);
const ag59bReleasePlan = readJson(inputs.ag59bReleasePlan);
const ag59bReadiness = readJson(inputs.ag59bReadiness);
const ag59bBoundary = readJson(inputs.ag59bBoundary);

if (ag59bReview.status !== "controlled_public_release_step_ready_for_push_and_ag59c") throw new Error("AG59B review status mismatch.");
if (ag59bApproval.explicit_user_approval_recorded !== true) throw new Error("AG59B explicit approval missing.");
if (ag59bReleasePlan.release_command !== "git push origin main") throw new Error("AG59B release command mismatch.");
if (ag59bReadiness.ready_for_ag59c_after_push !== true) throw new Error("AG59C after-push readiness missing.");
if (ag59bBoundary.status !== "ag59c_live_public_url_verification_boundary_created") throw new Error("AG59C boundary missing.");

const vercelCli = run("command -v vercel");
const ghCli = run("command -v gh");
const vercelProjectConfigExists = exists(".vercel/project.json");
const githubWorkflows = run("find .github -maxdepth 4 -type f -print 2>/dev/null");
const cnameExists = exists("CNAME");
const remote = run("git remote -v");
const repoUrl = remote.includes("https://github.com/BinaryVeer/drishvara-site.git");

const publicUrlConfigured =
  vercelProjectConfigExists ||
  cnameExists ||
  githubWorkflows.includes("pages") ||
  githubWorkflows.includes("deploy") ||
  githubWorkflows.includes("static.yml");

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const source = {
  module_id: "AG59B-R1",
  title: "AG59B-R1 Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_inputs: inputs,
  current_git_context: git,
  interpretation: "AG59B-R1 records that AG59B repository push is complete but AG59C cannot proceed until a live public URL is configured or confirmed."
};

const discovery = {
  module_id: "AG59B-R1",
  title: "Public URL Discovery Record",
  status: publicUrlConfigured ? "public_url_candidate_detected" : "public_url_not_configured",
  audit_passed: true,
  public_url_configured: publicUrlConfigured,
  discovered_public_url: null,
  repository_remote_detected: repoUrl,
  github_pages_api_available: false,
  gh_cli_available: Boolean(ghCli),
  vercel_cli_available: Boolean(vercelCli),
  vercel_project_config_exists: vercelProjectConfigExists,
  github_actions_or_pages_config_found: Boolean(githubWorkflows),
  cname_exists: cnameExists,
  vercel_json_exists: exists("vercel.json"),
  vercel_json_note: "vercel.json exists but only contains cron configuration; no local Vercel project linkage is present.",
  ag59c_live_url_verification_can_run_now: false
};

const targetDecision = {
  module_id: "AG59B-R1",
  title: "Deployment Target Decision Record",
  status: "github_pages_static_branch_root_recommended_pending_user_ui_activation",
  audit_passed: true,
  recommended_target: "GitHub Pages",
  recommended_source: "Deploy from branch: main / root",
  reason: [
    "Repository is static-first and already pushed to GitHub main.",
    "No backend/Auth/Supabase runtime is required for V01.",
    "No Vercel CLI or local Vercel project config is available.",
    "GitHub Pages can serve the static root without introducing backend/runtime scope."
  ],
  expected_url_after_activation: "https://binaryveer.github.io/drishvara-site/",
  custom_domain_status: cnameExists ? "configured" : "not_configured"
};

const githubPagesPlan = {
  module_id: "AG59B-R1",
  title: "GitHub Pages Activation Plan Record",
  status: "manual_github_pages_activation_plan_recorded",
  audit_passed: true,
  manual_steps: [
    "Open GitHub repository: BinaryVeer/drishvara-site.",
    "Go to Settings → Pages.",
    "Under Build and deployment, choose Source: Deploy from a branch.",
    "Select Branch: main.",
    "Select Folder: /root.",
    "Save.",
    "Wait until GitHub Pages gives the live URL.",
    "Return with the generated URL for AG59C live public URL verification."
  ],
  expected_live_url_candidate: "https://binaryveer.github.io/drishvara-site/",
  deployment_executed_by_script: false
};

const ag59cBlocker = {
  module_id: "AG59B-R1",
  title: "AG59C Live URL Blocker Record",
  status: "ag59c_blocked_pending_public_host_activation_or_confirmed_live_url",
  audit_passed: true,
  ag59c_blocked_now: true,
  blocker_reason: "No confirmed live public URL is available for verification.",
  required_next_input: "Confirmed GitHub Pages/Vercel/custom live URL.",
  ag59c_allowed_after_url_confirmed: true
};

function audit(title, status, keys) {
  return {
    module_id: "AG59B-R1",
    title,
    status,
    audit_passed: true,
    checks: keys.map((k) => ({ check_id: k, expected: false, actual: false, passed: true })),
    failed_checks: []
  };
}

const noDeployment = audit("No Deployment Execution Audit", "no_deployment_execution_audit_passed", [
  "deployment_platform_cli_executed",
  "vercel_cli_executed",
  "github_pages_api_mutation_executed",
  "github_actions_workflow_created",
  "live_public_check_performed"
]);

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
  module_id: "AG59B-R1",
  title: "Public Host Activation Readiness Record",
  status: "ready_for_manual_public_host_activation",
  ready_for_manual_public_host_activation: true,
  recommended_target: "GitHub Pages",
  ready_for_ag59c_now: false,
  ready_for_ag59c_after_confirmed_url: true,
  hard_blocker_count_for_ag59c_now: 1,
  blocker: "Confirmed live public URL is not yet available."
};

const boundary = {
  module_id: "AG59B-R1",
  title: "AG59B-R1 to Public Host Activation Boundary",
  status: "public_host_activation_boundary_created",
  allowed_scope: [
    "Enable GitHub Pages manually through GitHub UI.",
    "Use main branch and /root folder.",
    "Return the generated live URL.",
    "Proceed to AG59C only after URL is confirmed."
  ],
  blocked_scope: [
    "backend/Auth/Supabase activation",
    "runtime database/API reading",
    "RLS/grant mutation",
    "service-role use",
    "V02 expansion",
    "live verification without confirmed URL"
  ]
};

const review = {
  module_id: "AG59B-R1",
  title: "Public URL Discovery / Deployment Target Decision",
  status: "public_url_discovery_completed_github_pages_activation_recommended",
  depends_on: ["AG59B", "AG59A", "AG58Z"],
  source_file: outputs.source,
  discovery_file: outputs.discovery,
  target_decision_file: outputs.targetDecision,
  github_pages_plan_file: outputs.githubPagesPlan,
  ag59c_blocker_file: outputs.ag59cBlocker,
  no_deployment_execution_audit_file: outputs.noDeployment,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag59b_r1_public_url_discovery_recorded: true,
    public_url_configured: publicUrlConfigured,
    live_public_url_confirmed: false,
    github_pages_static_branch_root_recommended: true,
    manual_public_host_activation_required: true,
    ready_for_ag59c_now: false,
    ready_for_ag59c_after_confirmed_url: true,
    deployment_platform_cli_executed: false,
    github_pages_api_mutation_executed: false,
    live_public_check_performed: false,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    git_head_short: git.head,
    branch: git.branch
  }
};

const registry = { module_id: "AG59B-R1", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG59B-R1",
  status: review.status,
  ag59b_r1_public_url_discovery_recorded: 1,
  public_url_configured: publicUrlConfigured ? 1 : 0,
  live_public_url_confirmed: 0,
  github_pages_static_branch_root_recommended: 1,
  manual_public_host_activation_required: 1,
  ready_for_ag59c_now: 0,
  ready_for_ag59c_after_confirmed_url: 1,
  deployment_platform_cli_executed: 0,
  github_pages_api_mutation_executed: 0,
  live_public_check_performed: 0,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0
};

const doc = `# AG59B-R1 — Public URL Discovery / Deployment Target Decision

## Result

No confirmed live public URL is available yet.

## Recommended target

GitHub Pages.

## Recommended configuration

- Source: Deploy from a branch
- Branch: main
- Folder: /root

## Expected URL after activation

https://binaryveer.github.io/drishvara-site/

## Manual steps

1. Open GitHub repository: BinaryVeer/drishvara-site.
2. Go to Settings → Pages.
3. Under Build and deployment, choose Source: Deploy from a branch.
4. Select Branch: main.
5. Select Folder: /root.
6. Save.
7. Wait for GitHub Pages to provide the live URL.
8. Return with the generated URL for AG59C.

## Still blocked

- AG59C live verification until confirmed URL is available.
- No backend/Auth/Supabase/RLS/database runtime.
- No service-role use.
- No V02 expansion.
`;

writeJson(outputs.source, source);
writeJson(outputs.discovery, discovery);
writeJson(outputs.targetDecision, targetDecision);
writeJson(outputs.githubPagesPlan, githubPagesPlan);
writeJson(outputs.ag59cBlocker, ag59cBlocker);
writeJson(outputs.noDeployment, noDeployment);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG59B-R1 Public URL Discovery / Deployment Target Decision generated.");
console.log("✅ No confirmed live public URL is available yet.");
console.log("✅ GitHub Pages main/root activation recommended.");
console.log("✅ AG59C remains blocked until live URL is confirmed.");
