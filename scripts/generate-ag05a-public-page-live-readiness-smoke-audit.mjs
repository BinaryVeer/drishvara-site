import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag05a-public-page-live-readiness-smoke-audit.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function rel(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    const rp = rel(p);
    if (
      rp.startsWith("node_modules/") ||
      rp.startsWith(".git/") ||
      rp.startsWith("archive/") ||
      rp.startsWith("review-bundles/") ||
      rp.startsWith("review/archive/") ||
      rp.startsWith("published/") ||
      rp.startsWith("content/outputs/") ||
      rp.startsWith("drishvara_phase01_scaffold/") ||
      rp.includes(".backup") ||
      /backup-/i.test(rp)
    ) {
      continue;
    }
    if (entry.isDirectory()) {
      results.push(...listHtmlFiles(p));
    } else if (entry.isFile() && p.toLowerCase().endsWith(".html")) {
      results.push(p);
    }
  }
  return results;
}

function countMatches(text, regex) {
  return (String(text || "").match(regex) || []).length;
}

function hasFaviconSignal(html) {
  return /rel=["'][^"']*(icon|shortcut icon|apple-touch-icon)[^"']*["']/i.test(html) ||
    /favicon|apple-touch|site-icon/i.test(html);
}

function hasLogoSignal(html) {
  return /logo|brand|drishvara|site-logo|navbar-brand/i.test(html);
}

function hasNavigationSignal(html) {
  return /<nav\b|navbar|menu|hamburger|site-header|main-nav|header-nav|data-nav|aria-label=["'][^"']*navigation/i.test(html);
}

function hasHomeReturnSignal(html) {
  return /href=["']\/?["']|href=["']\.\/["']|href=["']index\.html["']|Home|होम|मुख्य/i.test(html);
}

function hasJoinSigninSignal(html) {
  // Detect actual sign-in/join UI or route links, not ordinary article text.
  return /href=["'][^"']*(signin|sign-in|login|join|register|signup|sign-up)[^"']*["']/i.test(html) ||
    /class=["'][^"']*(signin|login|join|signup|register)[^"']*["']/i.test(html) ||
    /id=["'][^"']*(signin|login|join|signup|register)[^"']*["']/i.test(html) ||
    /data-[^=]+=["'][^"']*(signin|login|join|signup|register)[^"']*["']/i.test(html);
}

function hasBackendAuthSignal(html) {
  // Detect active backend/Auth/API code signals, not normal article prose.
  return /createClient\s*\(/i.test(html) ||
    /from\s+["'][^"']*supabase[^"']*["']/i.test(html) ||
    /supabase\.auth\./i.test(html) ||
    /auth\.(signIn|signUp|signOut|getUser|getSession)\s*\(/i.test(html) ||
    /fetch\(\s*["']\/api\//i.test(html) ||
    /axios\.(get|post|put|delete)\(\s*["']\/api\//i.test(html) ||
    /NEXT_PUBLIC_SUPABASE|VITE_SUPABASE|SUPABASE_URL|SUPABASE_ANON_KEY|service_role|anon_key/i.test(html);
}

function ag03ReferenceLinkCount(html) {
  return countMatches(html, /data-drishvara-ag03c[^=\s>"]*reference-link=["']true["']/g);
}

function imageCreditSignal(html) {
  return /data-drishvara-ag02-image-credit=["']true["']|image\s*(credit|source|attribution)|photo\s*(credit|source|attribution)|visual\s*(credit|source|attribution)|source\s*:/i.test(html);
}

function primaryImageSignal(html) {
  return /data-drishvara-ag02-hero-visual=["']true["']|<img\b[^>]*src=["'][^"']+["']/i.test(html);
}

function readingWidthSignal(html) {
  return /max-width\s*:\s*([0-9.]+)\s*(px|rem|ch|%)|text-align\s*:\s*justify|article-content|article-body|reading|prose|content-width/i.test(html);
}

const config = readJson(configPath);
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure));
const ag04z = readJson(path.join(root, config.input_files.ag04z_closure));

const htmlFiles = listHtmlFiles(root).sort();
const htmlResults = htmlFiles.map((file) => {
  const html = fs.readFileSync(file, "utf8");
  const rp = rel(file);
  return {
    file_path: rp,
    is_homepage_candidate: config.expected.homepage_candidates.includes(rp),
    is_article_page: rp.startsWith("articles/"),
    is_signin_or_join_candidate: hasJoinSigninSignal(html) || /(signin|sign-in|login|join|register|signup|sign-up)/i.test(rp),
    favicon_signal_present: hasFaviconSignal(html),
    logo_signal_present: hasLogoSignal(html),
    navigation_signal_present: hasNavigationSignal(html),
    home_return_signal_present: hasHomeReturnSignal(html),
    join_signin_signal_present: hasJoinSigninSignal(html),
    backend_or_auth_signal_present: hasBackendAuthSignal(html),
    ag03_reference_link_count: ag03ReferenceLinkCount(html),
    primary_image_signal_present: primaryImageSignal(html),
    image_credit_signal_present: imageCreditSignal(html),
    reading_width_signal_present: readingWidthSignal(html)
  };
});

const homepageResults = htmlResults.filter((row) => row.is_homepage_candidate);
const articleResults = htmlResults.filter((row) => row.is_article_page);
const signinJoinResults = htmlResults.filter((row) => row.is_signin_or_join_candidate);
const backendAuthSignals = htmlResults.filter((row) => row.backend_or_auth_signal_present);

const issueQueue = [];

if (homepageResults.length === 0) {
  issueQueue.push({ issue_type: "homepage_missing", file_path: "index.html", severity: "high" });
}

if (!homepageResults.some((row) => row.favicon_signal_present)) {
  issueQueue.push({ issue_type: "favicon_signal_missing", file_path: "index.html", severity: "medium" });
}

if (!homepageResults.some((row) => row.navigation_signal_present)) {
  issueQueue.push({ issue_type: "navigation_signal_missing", file_path: "index.html", severity: "medium" });
}

for (const row of signinJoinResults) {
  if (!row.navigation_signal_present || !row.home_return_signal_present) {
    issueQueue.push({
      issue_type: "signin_join_navigation_needs_manual_review",
      file_path: row.file_path,
      severity: "medium",
      navigation_signal_present: row.navigation_signal_present,
      home_return_signal_present: row.home_return_signal_present
    });
  }
}

if (articleResults.length < config.expected.minimum_article_pages) {
  issueQueue.push({
    issue_type: "article_count_below_expected",
    severity: "high",
    observed_article_pages: articleResults.length,
    expected_article_pages: config.expected.minimum_article_pages
  });
}

for (const row of backendAuthSignals) {
  issueQueue.push({
    issue_type: "backend_or_auth_activation_signal_found",
    file_path: row.file_path,
    severity: "review",
    note: "Static scan found backend/Auth/Supabase/API-like string. This may be placeholder code, but requires manual review."
  });
}

if (
  ag03z.summary?.ag03_reference_scaling_closed !== true ||
  ag04z.summary?.ag04_visual_credit_width_governance_closed !== true
) {
  issueQueue.push({
    issue_type: "ag03_or_ag04_closure_drift",
    severity: "high"
  });
}

issueQueue.push({
  issue_type: "manual_live_review_required",
  severity: "normal",
  note: "AG05A is a static audit. Manual/live review is still required for visual rendering, clickability, favicon display, and sign-in/join navigation behaviour."
});

const issueCounts = {};
for (const issueType of config.issue_types) {
  issueCounts[issueType] = issueQueue.filter((row) => row.issue_type === issueType).length;
}

const audit = {
  audit_id: "AG05A_PUBLIC_PAGE_LIVE_READINESS_SMOKE_AUDIT",
  module_id: "AG05A",
  status: "public_page_live_readiness_smoke_audit_completed",
  generated_at: new Date().toISOString(),

  mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
  favicon_mutation_performed: false,
  navigation_mutation_performed: false,
  reference_url_change_performed: false,
  external_fetch_performed_by_script: false,
  live_url_fetch_performed: false,
  backend_activation_performed: false,
  api_route_created: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  frontend_deployment_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,

  source_context: {
    ag03z_closed: ag03z.summary?.ag03_reference_scaling_closed === true,
    ag03z_article_count: ag03z.summary?.completed_article_count_from_ag03d_b6,
    ag03z_reference_count: ag03z.summary?.live_ag03_reference_link_count,
    ag04z_closed: ag04z.summary?.ag04_visual_credit_width_governance_closed === true,
    ag04z_article_count: ag04z.summary?.article_count
  },

  summary: {
    scanned_html_file_count: htmlResults.length,
    homepage_detected: homepageResults.length > 0,
    homepage_count: homepageResults.length,
    article_page_count_from_static_scan: articleResults.length,
    article_count_from_ag03z: ag03z.summary?.completed_article_count_from_ag03d_b6,
    article_count_from_ag04z: ag04z.summary?.article_count,
    ag03_reference_link_count_from_ag03z: ag03z.summary?.live_ag03_reference_link_count,
    ag04_visual_credit_width_closed: ag04z.summary?.ag04_visual_credit_width_governance_closed === true,
    ag03_reference_scaling_closed: ag03z.summary?.ag03_reference_scaling_closed === true,
    homepage_favicon_signal_present: homepageResults.some((row) => row.favicon_signal_present),
    homepage_logo_signal_present: homepageResults.some((row) => row.logo_signal_present),
    homepage_navigation_signal_present: homepageResults.some((row) => row.navigation_signal_present),
    signin_join_candidate_count: signinJoinResults.length,
    signin_join_candidates_with_navigation: signinJoinResults.filter((row) => row.navigation_signal_present).length,
    signin_join_candidates_with_home_return: signinJoinResults.filter((row) => row.home_return_signal_present).length,
    article_pages_with_ag03_reference_links: articleResults.filter((row) => row.ag03_reference_link_count > 0).length,
    article_pages_with_primary_image_signal: articleResults.filter((row) => row.primary_image_signal_present).length,
    article_pages_with_image_credit_signal: articleResults.filter((row) => row.image_credit_signal_present).length,
    article_pages_with_reading_width_signal: articleResults.filter((row) => row.reading_width_signal_present).length,
    backend_or_auth_signal_file_count: backendAuthSignals.length,
    issue_queue_count: issueQueue.length,
    issue_type_counts: issueCounts,
    audit_only_no_mutation: true,
    ready_for_ag05b_manual_live_review_record: true
  },

  homepage_results: homepageResults,
  signin_join_results: signinJoinResults,
  article_result_sample: articleResults.slice(0, 20),
  backend_or_auth_signal_results: backendAuthSignals,
  issue_queue: issueQueue,
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG05A_PUBLIC_PAGE_LIVE_READINESS_SMOKE_PREVIEW",
  module_id: "AG05A",
  preview_only: true,
  status: "preview_public_page_live_readiness_smoke_audit",
  summary: audit.summary,
  issue_queue: issueQueue,
  mutation_performed: false,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.audit), audit);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.audit}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Scanned HTML files: ${audit.summary.scanned_html_file_count}`);
console.log(`Homepage detected: ${audit.summary.homepage_detected}`);
console.log(`Article pages from static scan: ${audit.summary.article_page_count_from_static_scan}`);
console.log(`AG03 closed: ${audit.summary.ag03_reference_scaling_closed}`);
console.log(`AG04 closed: ${audit.summary.ag04_visual_credit_width_closed}`);
console.log(`Homepage favicon signal: ${audit.summary.homepage_favicon_signal_present}`);
console.log(`Homepage navigation signal: ${audit.summary.homepage_navigation_signal_present}`);
console.log(`Sign-in/join candidates: ${audit.summary.signin_join_candidate_count}`);
console.log(`Backend/Auth signal files: ${audit.summary.backend_or_auth_signal_file_count}`);
console.log(`Issue queue count: ${audit.summary.issue_queue_count}`);
console.log("Mutation performed: false");
