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

console.log("Drishvara D06 Mantra Source Registry & Review Preview preflight");
console.log("");

const sourceFile = "data/knowledge/sanatan/mantra-source-registry-d06.json";
const candidateFile = "data/knowledge/sanatan/mantra-candidate-registry-d06.json";
const previewFile = "data/knowledge/sanatan/mantra-review-preview-d06.json";
const docFile = "docs/knowledge/mantra-source-review-preview-d06.md";
const builderFile = "scripts/build-mantra-review-preview-d06.js";
const d01MantraPolicyFile = "data/knowledge/sanatan/mantra-selection-policy-d01.json";
const d05SourceFile = "data/knowledge/sanatan/panchang-festival-source-registry-d05.json";
const runtimeFile = "assets/js/drishvara-language-runtime.js";
const dailyContextFile = "data/daily-context.json";

for (const file of [sourceFile, candidateFile, previewFile, docFile, builderFile, d01MantraPolicyFile, d05SourceFile, runtimeFile, dailyContextFile]) {
  check(exists(file), `${file} exists`);
}

const source = json(sourceFile);
const candidates = json(candidateFile);
const preview = json(previewFile);
const d01Mantra = json(d01MantraPolicyFile);
const d05Source = json(d05SourceFile);
const doc = read(docFile);
const builder = read(builderFile);
const runtime = read(runtimeFile);

check(source.status === "source_registry_only", "D06 source registry only");
check(source.public_dynamic_mantra_enabled === false, "Public dynamic mantra output remains disabled");
check(source.mantra_generation_enabled === false, "Mantra generation remains disabled");
check(source.mantra_selection_live_enabled === false, "Live mantra selection remains disabled");
check(source.external_api_fetch_enabled === false, "External API fetch remains disabled");
check(source.runtime_language_change_enabled === false, "Language runtime remains untouched");
check(source.supabase_enabled === false, "Supabase remains disabled");
check(source.auth_enabled === false, "Auth remains disabled");
check(source.payment_enabled === false, "Payment remains disabled");
check(source.premium_guidance_enabled === false, "Premium guidance remains disabled");
check(source.admin_actions_enabled === false, "Admin actions remain disabled");

check(source.brand.en === "Drishvara", "English brand is Drishvara");
check(source.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");

check(Array.isArray(source.approved_source_categories), "Approved source categories exist");
check(source.approved_source_categories.length >= 3, "Enough approved source categories listed");
check(source.blocked_source_categories.includes("AI-generated new mantras"), "AI-generated new mantras blocked");
check(source.blocked_source_categories.includes("guaranteed remedy or prediction claim"), "Guaranteed remedy claims blocked");
check(source.required_future_record_fields.includes("sanskrit_text"), "Future record requires Sanskrit text");
check(source.required_future_record_fields.includes("source_basis"), "Future record requires source_basis");
check(source.review_status_values.includes("approved"), "Approved review status exists");

check(candidates.status === "candidate_registry_not_live", "Candidate registry is not live");
check(candidates.public_dynamic_mantra_enabled === false, "Candidate registry does not enable public dynamic mantra");
check(Array.isArray(candidates.items), "Candidate items array exists");
check(candidates.items.length >= 5, "At least five mantra candidates exist");

for (const item of candidates.items) {
  const label = item.mantra_id || "unknown-mantra";
  check(Boolean(item.mantra_id), `Candidate has mantra_id: ${label}`);
  check(Boolean(item.deity_or_theme), `Candidate has deity/theme: ${label}`);
  check(Boolean(item.sanskrit_text), `Candidate has Sanskrit text: ${label}`);
  check(Boolean(item.transliteration), `Candidate has transliteration: ${label}`);
  check(Boolean(item.meaning_en), `Candidate has English meaning: ${label}`);
  check(Boolean(item.meaning_hi), `Candidate has Hindi meaning: ${label}`);
  check(Boolean(item.usage_context), `Candidate has usage context: ${label}`);
  check(Boolean(item.source_basis), `Candidate has source basis: ${label}`);
  check(source.review_status_values.includes(item.review_status), `Candidate review status valid: ${label}`);
  check(item.review_status !== "approved" || (item.reviewed_by && item.reviewed_at), `Approved candidate has reviewer details if approved: ${label}`);
}

check(preview.status === "preview_not_live", "Review preview is not live");
check(preview.public_dynamic_mantra_enabled === false, "Preview does not enable public dynamic mantra");
check(preview.external_api_fetch_enabled === false, "Preview does not enable external API fetch");
check(preview.live_mantra_selection_enabled === false, "Preview does not enable live mantra selection");
check(Array.isArray(preview.items), "Preview items array exists");
check(preview.items.length >= 5, "Preview has at least five validation items");

for (const item of preview.items) {
  const label = item.mantra_id || "unknown-preview";
  check(item.preview_only === true, `Preview item marked preview-only: ${label}`);
  check(item.live_output_enabled === false, `Preview item live output disabled: ${label}`);
  check(item.public_dynamic_mantra_enabled === false, `Preview item public dynamic mantra disabled: ${label}`);
  check(item.validation_result === "valid_review_candidate", `Preview item validates as review candidate: ${label}`);
  check(Array.isArray(item.validation_issues), `Preview item has validation issues array: ${label}`);
}

check(d01Mantra.public_dynamic_mantra_enabled === false, "D01 mantra policy keeps public dynamic mantra disabled");
check(d01Mantra.rules.some((rule) => rule.includes("Do not generate new mantras automatically")), "D01 mantra policy blocks automatic mantra generation");
check(d05Source.public_dynamic_output_enabled === false, "D05 public Panchang/Festival dynamic output remains disabled");

check(builder.includes("preview_only: true"), "Builder marks preview-only");
check(builder.includes("live_output_enabled: false"), "Builder disables live output");
check(!builder.includes("fetch("), "Builder does not fetch external APIs");
check(!builder.includes("createClient("), "Builder does not instantiate Supabase");
check(!builder.includes("supabase.auth"), "Builder does not call Supabase auth");
check(!builder.includes("SERVICE_ROLE"), "Builder does not expose service role");

check(doc.includes("does not"), "Doc includes non-goals");
check(doc.includes("does not generate mantras"), "Doc blocks mantra generation");
check(doc.includes("does not write into public daily context"), "Doc protects daily context output");

check(runtime.includes("2026.05.02-h05"), "H05/H05B runtime remains stable");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

console.log("");
console.log("D06 Mantra review preview summary:");
console.log(`- Candidate mantras: ${candidates.items.length}`);
console.log(`- Review preview items: ${preview.items.length}`);
console.log("- Public dynamic mantra output: disabled");
console.log("- External API fetch: disabled");
console.log("- Daily context mutation: blocked");
console.log("- Supabase/Auth/payment/premium/admin: disabled");

if (failures.length) {
  console.log("");
  console.log("D06 Mantra Source Registry & Review Preview preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("D06 Mantra Source Registry & Review Preview preflight passed.");
