import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function readJson(file) {
  return JSON.parse(read(file));
}

function check(condition, label, failures) {
  if (condition) {
    console.log(`✅ ${label}`);
  } else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

const failures = [];

console.log("Drishvara payment/subscription preflight");
console.log("");

const plansPath = "data/backend/payments/subscription-plans.json";
const providerPath = "data/backend/payments/payment-provider-options.json";
const lifecyclePath = "data/backend/payments/subscription-lifecycle.json";
const docPath = "docs/payment-subscription-plan.md";
const accessModelPath = "data/backend/auth-access-model.json";
const schemaRegistryPath = "data/backend/supabase-schema-registry.json";

check(fs.existsSync(path.join(root, plansPath)), "Subscription plans registry exists", failures);
check(fs.existsSync(path.join(root, providerPath)), "Payment provider options registry exists", failures);
check(fs.existsSync(path.join(root, lifecyclePath)), "Subscription lifecycle registry exists", failures);
check(fs.existsSync(path.join(root, docPath)), "Payment/subscription plan document exists", failures);
check(fs.existsSync(path.join(root, accessModelPath)), "Auth access model exists", failures);
check(fs.existsSync(path.join(root, schemaRegistryPath)), "Supabase schema registry exists", failures);

const plans = readJson(plansPath);
const providers = readJson(providerPath);
const lifecycle = readJson(lifecyclePath);
const accessModel = readJson(accessModelPath);
const registry = readJson(schemaRegistryPath);
const doc = read(docPath);

check(plans.live_payment_enabled === false, "Live payment remains disabled", failures);
check(Array.isArray(plans.plans), "Plans array exists", failures);
check(plans.plans.some((plan) => plan.plan_code === "free"), "Free plan exists", failures);
check(plans.plans.some((plan) => plan.plan_code === "premium_monthly"), "Premium monthly plan exists", failures);
check(plans.plans.some((plan) => plan.plan_code === "premium_yearly"), "Premium yearly plan exists", failures);
check(plans.guardrails?.some((item) => item.includes("Do not activate paid plans")), "Plans block premature paid activation", failures);
check(plans.guardrails?.some((item) => item.includes("guaranteed prediction")), "Plans block guaranteed prediction claim", failures);

check(providers.live_provider_selected === false, "No live payment provider selected yet", failures);
check(providers.provider_categories?.some((item) => item.id === "india_payment_gateway"), "India payment gateway category exists", failures);
check(providers.provider_categories?.some((item) => item.id === "manual_subscription"), "Manual subscription category exists", failures);
check(providers.guardrails?.some((item) => item.includes("Do not store card details")), "Provider guardrail blocks card storage", failures);
check(providers.guardrails?.some((item) => item.includes("secret keys")), "Provider guardrail blocks frontend secret exposure", failures);

check(lifecycle.live_webhook_enabled === false, "Live webhook remains disabled", failures);
check(lifecycle.subscription_statuses?.includes("active"), "Lifecycle includes active status", failures);
check(lifecycle.subscription_statuses?.includes("past_due"), "Lifecycle includes past_due status", failures);
check(lifecycle.status_access_rules?.active?.subscriber_dashboard === true, "Active subscriber can access dashboard in future", failures);
check(lifecycle.status_access_rules?.free?.premium_guidance === false, "Free user cannot access premium guidance", failures);
check(Boolean(lifecycle.webhook_event_map?.checkout_completed), "Webhook map includes checkout completed", failures);
check(Boolean(lifecycle.webhook_event_map?.payment_failed), "Webhook map includes payment failed", failures);
check(lifecycle.guardrails?.some((item) => item.includes("signature verification")), "Lifecycle requires webhook signature verification", failures);

check(accessModel.live_subscription_gate_enabled === false, "Access model keeps live subscription gate disabled", failures);
check(registry.tables?.includes("subscriptions"), "Supabase registry includes subscriptions table", failures);
check(doc.includes("Do not store card details"), "Plan document includes card storage guardrail", failures);
check(doc.includes("Deferred Live Actions"), "Plan document lists deferred live actions", failures);

console.log("");
console.log("Payment/subscription summary:");
console.log("- Live payment: disabled");
console.log("- Provider selected: no");
console.log("- Plans: free, premium monthly, premium yearly, founder circle");
console.log("- Webhooks: mapped but disabled");
console.log("- Premium guidance: still requires approved Knowledge Vault rules");

if (failures.length) {
  console.log("");
  console.log("Payment preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Payment/subscription preflight passed.");
