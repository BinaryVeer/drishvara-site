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

console.log("Drishvara D02 Word of the Day bank preflight");
console.log("");

const bankFile = "data/knowledge/daily-guidance/word-of-day-bank-d02.json";
const policyFile = "data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json";
const docFile = "docs/knowledge/word-of-day-curated-rotation-bank-d02.md";
const d01File = "data/knowledge/daily-guidance/daily-guidance-engine-governance-d01.json";
const runtimeFile = "assets/js/drishvara-language-runtime.js";
const dailyContextFile = "data/daily-context.json";

for (const file of [bankFile, policyFile, docFile, d01File, runtimeFile, dailyContextFile]) {
  check(exists(file), `${file} exists`);
}

const bank = json(bankFile);
const policy = json(policyFile);
const d01 = json(d01File);
const runtime = read(runtimeFile);
const doc = read(docFile);
const dailyContext = json(dailyContextFile);

check(bank.status === "curated_bank_scaffold", "D02 word bank is scaffolded");
check(bank.public_dynamic_output_enabled === false, "Public dynamic Word of the Day remains disabled");
check(bank.runtime_language_change_enabled === false, "Language runtime remains untouched");
check(bank.external_api_fetch_enabled === false, "External API fetch remains disabled");
check(bank.supabase_enabled === false, "Supabase remains disabled");
check(bank.auth_enabled === false, "Auth remains disabled");
check(bank.payment_enabled === false, "Payment remains disabled");
check(bank.premium_guidance_enabled === false, "Premium guidance remains disabled");
check(bank.admin_actions_enabled === false, "Admin actions remain disabled");

check(bank.brand.en === "Drishvara", "English brand is Drishvara");
check(bank.brand.hi === "द्रिश्वारा", "Hindi brand is द्रिश्वारा");

check(Array.isArray(bank.items), "Word bank has items array");
check(bank.items.length >= 10, "Word bank has at least ten seed entries");

const ids = new Set();
for (const item of bank.items) {
  check(Boolean(item.id), "Word item has id");
  check(!ids.has(item.id), `Word item id is unique: ${item.id}`);
  ids.add(item.id);
  check(Boolean(item.word_en), `Word item has English word: ${item.id}`);
  check(Boolean(item.word_hi), `Word item has Hindi word: ${item.id}`);
  check(Boolean(item.word_sanskrit), `Word item has Sanskrit/Indic term: ${item.id}`);
  check(Boolean(item.meaning_en), `Word item has English meaning: ${item.id}`);
  check(Boolean(item.meaning_hi), `Word item has Hindi meaning: ${item.id}`);
  check(Boolean(item.theme), `Word item has theme: ${item.id}`);
  check(["draft", "needs_review", "approved", "rejected"].includes(item.review_status), `Word item has valid review status: ${item.id}`);
}

check(bank.items.some((item) => item.review_status === "approved"), "Word bank has approved entries");
check(bank.items.some((item) => item.word_hi === "मनन"), "Word bank includes मनन");
check(bank.items.some((item) => item.word_sanskrit === "मननम्"), "Word bank includes मननम्");

check(policy.status === "policy_scaffold", "Rotation policy scaffold exists");
check(policy.public_rotation_enabled === false, "Public rotation remains disabled");
check(policy.blocked_behaviour.includes("external API word fetch"), "External API word fetch blocked");
check(policy.blocked_behaviour.includes("unreviewed AI word generation"), "Unreviewed AI word generation blocked");
check(policy.future_daily_record_fields.includes("word_id"), "Future daily record requires word_id");
check(policy.future_daily_record_fields.includes("source_basis"), "Future daily record requires source_basis");
check(policy.review_status_values.includes("approved"), "Approved review status exists");

check(d01.status === "governance_only", "D01 governance remains in place");
check(d01.modules.word_of_the_day.status === "static_public_scaffold", "D01 keeps Word of the Day static public scaffold");

check(doc.includes("does not"), "Doc includes non-goals");
check(doc.includes("does not make the public Word of the Day dynamic"), "Doc states dynamic output is not enabled");

check(runtime.includes("2026.05.02-h05"), "H05/H05B runtime remains stable");
check(!runtime.includes("fetch("), "Runtime does not fetch external APIs");
check(!runtime.includes("createClient("), "Runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Runtime does not expose service role");

check(JSON.stringify(dailyContext).toLowerCase().includes("word"), "Daily context still contains Word of the Day scaffold/data");

console.log("");
console.log("D02 Word of the Day bank summary:");
console.log(`- Seed word entries: ${bank.items.length}`);
console.log("- Public dynamic rotation: disabled");
console.log("- External API fetch: disabled");
console.log("- Runtime language logic: unchanged");
console.log("- Supabase/Auth/payment/premium/admin: disabled");

if (failures.length) {
  console.log("");
  console.log("D02 Word of the Day bank preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("D02 Word of the Day bank preflight passed.");
