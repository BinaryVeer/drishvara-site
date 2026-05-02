import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const json = (file) => JSON.parse(read(file));

const failures = [];
function check(condition, label) {
  if (condition) console.log(`✅ ${label}`);
  else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

console.log("Drishvara H08 Hindi article body sidecar governance preflight");
console.log("");

const sidecarFile = "data/i18n/hindi-article-body.json";
const policyFile = "data/i18n/hindi-article-body-policy-h08.json";
const queueFile = "data/i18n/hindi-article-body-review-queue-h08.json";
const docFile = "docs/i18n/hindi-article-body-sidecar-governance-h08.md";
const articleReaderFile = "article.html";
const runtimeFile = "assets/js/drishvara-language-runtime.js";

for (const file of [sidecarFile, policyFile, queueFile, docFile, articleReaderFile, runtimeFile]) {
  check(exists(file), `${file} exists`);
}

const sidecar = json(sidecarFile);
const policy = json(policyFile);
const queue = json(queueFile);
const doc = read(docFile);
const articleReader = read(articleReaderFile);
const runtime = read(runtimeFile);

check(sidecar.module === "bilingual.hindi_article_body_sidecar", "Sidecar module recorded");
check(sidecar.article_body_translation_enabled === false, "Sidecar does not enable body translation globally");
check(sidecar.auto_translation_enabled === false, "Sidecar blocks auto-translation");
check(sidecar.runtime_dom_body_translation_enabled === false, "Sidecar blocks runtime DOM body translation");
check(sidecar.approval_required === true, "Sidecar requires approval");
check(Array.isArray(sidecar.items), "Sidecar has items array");

check(policy.status === "governance_and_preflight_only", "H08 policy is governance-only");
check(policy.article_body_auto_translation_enabled === false, "Policy blocks article body auto-translation");
check(policy.runtime_dom_body_translation_enabled === false, "Policy blocks runtime DOM body translation");
check(policy.approved_sidecar_display_only === true, "Policy allows only approved sidecar display");
check(policy.external_api_fetch_enabled === false, "Policy blocks external API fetch");
check(policy.supabase_enabled === false, "Policy keeps Supabase disabled");
check(policy.auth_enabled === false, "Policy keeps Auth disabled");
check(policy.payment_enabled === false, "Policy keeps payment disabled");
check(policy.premium_guidance_enabled === false, "Policy keeps premium guidance disabled");
check(policy.admin_actions_enabled === false, "Policy keeps admin actions disabled");

check(policy.brand.en === "Drishvara", "English brand is Drishvara");
check(policy.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");

for (const field of ["path", "title_hi", "summary_hi", "article_html_hi", "review_status", "approved_by", "approved_at", "source_basis"]) {
  check(policy.required_item_fields.includes(field), `Required field listed: ${field}`);
}

for (const status of ["draft", "needs_review", "approved", "rejected"]) {
  check(policy.allowed_review_status.includes(status), `Allowed review status listed: ${status}`);
}

check(queue.status === "queue_scaffold", "Review queue is scaffolded");
check(Array.isArray(queue.items), "Review queue has items array");
check(Array.isArray(queue.selection_priority), "Review queue has selection priorities");
check(queue.selection_priority.length >= 3, "Review queue has enough priority rules");

for (const item of sidecar.items) {
  const label = item.path || item.id || "unknown item";
  check(Boolean(item.path), `Sidecar item has path: ${label}`);
  check(Boolean(item.article_html_hi), `Sidecar item has Hindi body: ${label}`);
  check(policy.allowed_review_status.includes(item.review_status), `Sidecar item has valid review status: ${label}`);
  if (item.review_status === "approved") {
    check(Boolean(item.approved_by), `Approved item has approver: ${label}`);
    check(Boolean(item.approved_at), `Approved item has approved_at: ${label}`);
  }
}

check(articleReader.includes("article_html_hi") || articleReader.includes("hindi-article-body"), "Article reader references Hindi body fallback");
check(articleReader.includes("title_hi") || articleReader.includes("summary_hi"), "Article reader references Hindi metadata");
check(runtime.includes("2026.05.02-h05"), "H05/H05B runtime baseline remains stable");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

check(doc.includes("Hindi article bodies must be displayed only when approved Hindi sidecar content exists"), "Doc states approved-sidecar-only rule");
check(doc.includes("does not"), "Doc includes non-goals");

console.log("");
console.log("H08 Hindi article body sidecar governance summary:");
console.log(`- Existing Hindi body sidecar items: ${sidecar.items.length}`);
console.log("- Auto-translation: disabled");
console.log("- Runtime DOM body translation: disabled");
console.log("- Approved sidecar display only: enabled");
console.log("- Supabase/Auth/payment/premium/admin: disabled");

if (failures.length) {
  console.log("");
  console.log("H08 Hindi article body sidecar governance preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("H08 Hindi article body sidecar governance preflight passed.");
