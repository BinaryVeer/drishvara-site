import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/knowledge/sources/source-registry.json",
  "data/knowledge/sanatan/panchang-methods.json",
  "data/knowledge/sanatan/panchang-engine-schema.json",
  "data/knowledge/sanatan/festival-rules.json",
  "data/knowledge/sanatan/vedic-guidance-taxonomy.json",
  "data/knowledge/numerology/numerology-rules.json",
  "data/knowledge/palmistry/palmistry-rules.json",
  "data/knowledge/updates/update-log.json",
  "data/knowledge/updates/monthly-update-schedule.json",
  "data/knowledge/submissions/user-submission-schema.json",
  "data/knowledge/submissions/intake-routing.json",
  "data/knowledge/submissions/feedback-schema.json",
  "data/knowledge/palmistry/palm-image-policy.json",
  "data/knowledge/subscribers/daily-guidance-schema.json",
  "data/knowledge/subscribers/daily-guidance-methods.json",
  "data/knowledge/subscribers/sample-subscriber-context.json",
  "data/knowledge/sanatan/mantra-policy.json",
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function check(condition, label, failures, warning = false) {
  if (condition) {
    console.log(`✅ ${label}`);
  } else if (warning) {
    console.log(`⚠️ ${label}`);
  } else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

const failures = [];

console.log("Drishvara Knowledge Vault preflight");
console.log("");

for (const file of requiredFiles) {
  check(fs.existsSync(path.join(root, file)), `${file} exists`, failures);
}

const sourceRegistry = readJson("data/knowledge/sources/source-registry.json");
const panchangMethods = readJson("data/knowledge/sanatan/panchang-methods.json");
const panchangEngineSchema = readJson("data/knowledge/sanatan/panchang-engine-schema.json");
const festivalRules = readJson("data/knowledge/sanatan/festival-rules.json");
const guidanceTaxonomy = readJson("data/knowledge/sanatan/vedic-guidance-taxonomy.json");
const numerologyRules = readJson("data/knowledge/numerology/numerology-rules.json");
const palmistryRules = readJson("data/knowledge/palmistry/palmistry-rules.json");
const updateLog = readJson("data/knowledge/updates/update-log.json");
const monthlySchedule = readJson("data/knowledge/updates/monthly-update-schedule.json");
const userSubmissionSchema = readJson("data/knowledge/submissions/user-submission-schema.json");
const intakeRouting = readJson("data/knowledge/submissions/intake-routing.json");
const feedbackSchema = readJson("data/knowledge/submissions/feedback-schema.json");
const palmImagePolicy = readJson("data/knowledge/palmistry/palm-image-policy.json");
const subscriberGuidance = readJson("data/knowledge/subscribers/daily-guidance-schema.json");
const subscriberGuidanceMethods = readJson("data/knowledge/subscribers/daily-guidance-methods.json");
const sampleSubscriberContext = readJson("data/knowledge/subscribers/sample-subscriber-context.json");

const mantraPolicy = readJson("data/knowledge/sanatan/mantra-policy.json");



check(sourceRegistry.database_name === "Drishvara Sanatan Knowledge Vault", "Source registry has database name", failures);
check(Array.isArray(sourceRegistry.sources), "Source registry has sources array", failures);
check(sourceRegistry.sources.length >= 4, "Source registry has seed source records", failures);
check(sourceRegistry.public_output_rule?.includes("No Panchang"), "Source registry has public output rule", failures);

check(panchangMethods.public_output_enabled === false, "Panchang public output is disabled at scaffold stage", failures);

check(panchangEngineSchema.public_output_enabled === false, "Panchang engine schema public output is disabled", failures);
check(panchangEngineSchema.restricted_until_method_review?.includes("tithi"), "Panchang engine schema restricts tithi until review", failures);
check(panchangEngineSchema.restricted_until_method_review?.includes("nakshatra"), "Panchang engine schema restricts nakshatra until review", failures);

check(Array.isArray(panchangMethods.calculation_fields), "Panchang methods define calculation fields", failures);
check(panchangMethods.required_context?.location?.includes("latitude"), "Panchang requires location latitude", failures);
check(panchangMethods.required_context?.astronomical_basis?.includes("sunrise"), "Panchang requires sunrise basis", failures);

check(festivalRules.public_output_enabled === false, "Festival public output is disabled at scaffold stage", failures);
check(Array.isArray(festivalRules.festival_rules), "Festival rules array exists", failures);
check(festivalRules.rule_requirements?.includes("region"), "Festival rules require region", failures);
check(festivalRules.rule_requirements?.includes("panchang_dependency"), "Festival rules require Panchang dependency", failures);

check(guidanceTaxonomy.public_output_enabled === false, "Vedic guidance public output is disabled at scaffold stage", failures);
check(Array.isArray(guidanceTaxonomy.guidance_categories), "Vedic guidance categories exist", failures);
check(guidanceTaxonomy.output_guardrails?.some((item) => item.includes("generic AI-generated")), "Vedic guidance blocks generic AI output", failures);
check(guidanceTaxonomy.output_guardrails?.some((item) => item.includes("mantra")), "Vedic guidance has mantra guardrail", failures);

check(numerologyRules.public_output_enabled === false, "Numerology public output is disabled at scaffold stage", failures);
check(numerologyRules.supported_future_calculations?.includes("life_path_number"), "Numerology supports life path scaffold", failures);
check(Array.isArray(numerologyRules.rules), "Numerology rules array exists", failures);

check(palmistryRules.public_output_enabled === false, "Palmistry public output is disabled at scaffold stage", failures);
check(palmistryRules.privacy_rule?.includes("explicit consent"), "Palmistry has privacy/consent rule", failures);
check(palmistryRules.knowledge_categories?.major_lines?.includes("life_line"), "Palmistry includes major lines scaffold", failures);

check(updateLog.current_database_version === "2026.04", "Knowledge update log has current database version", failures);
check(Array.isArray(updateLog.updates), "Knowledge update log has updates array", failures);
check(updateLog.next_scheduled_review === "2026-05", "Knowledge update log has next review month", failures);

check(monthlySchedule.schedule_rule?.day_of_month === 10, "Monthly update is scheduled for 10th", failures);
check(monthlySchedule.schedule_rule?.timezone === "Asia/Kolkata", "Monthly update uses India timezone", failures);
check(monthlySchedule.required_monthly_actions?.includes("Review pending user submissions"), "Monthly update includes user submission review", failures);

check(userSubmissionSchema.public_collection_enabled === false, "User submissions are disabled until backend intake is implemented", failures);

check(intakeRouting.backend_storage_enabled === false, "Submission intake routing keeps backend storage disabled", failures);
check(intakeRouting.routes?.palm_image?.target === "disabled_until_private_storage_and_consent", "Palm image intake remains disabled", failures);
check(intakeRouting.routes?.feedback?.monthly_review_day === 10, "Feedback intake aligns with monthly review day", failures);

check(userSubmissionSchema.submission_types?.includes("palmistry_question"), "User submission schema includes palmistry questions", failures);
check(userSubmissionSchema.fields?.consent_to_process === "required_boolean", "User submission requires consent to process", failures);

check(feedbackSchema.public_collection_enabled === false, "Feedback collection is disabled until backend intake is implemented", failures);
check(feedbackSchema.feedback_types?.includes("knowledge_correction"), "Feedback schema supports knowledge correction", failures);
check(feedbackSchema.monthly_review_day === 10, "Feedback review aligns with monthly update day", failures);

check(palmImagePolicy.public_upload_enabled === false, "Palm image upload is disabled until consent/storage are implemented", failures);
check(palmImagePolicy.required_before_enabling_upload?.includes("private storage bucket"), "Palm image policy requires private storage bucket", failures);
check(palmImagePolicy.required_before_enabling_upload?.includes("explicit image consent checkbox"), "Palm image policy requires explicit consent", failures);
check(palmImagePolicy.interpretation_limits?.some((item) => item.includes("No medical diagnosis")), "Palm image policy blocks medical diagnosis", failures);

check(subscriberGuidance.login_required === true, "Subscriber daily guidance requires login", failures);
check(subscriberGuidance.subscription_required === true, "Subscriber daily guidance requires subscription", failures);
check(subscriberGuidance.public_output_enabled === false, "Subscriber guidance is not public homepage output", failures);
check(Boolean(subscriberGuidance.daily_output_fields?.lucky_number), "Subscriber guidance includes lucky number schema", failures);
check(Boolean(subscriberGuidance.daily_output_fields?.lucky_color), "Subscriber guidance includes lucky color schema", failures);
check(Boolean(subscriberGuidance.daily_output_fields?.mantra), "Subscriber guidance includes mantra schema", failures);
check(Boolean(subscriberGuidance.daily_output_fields?.what_to_do), "Subscriber guidance includes what-to-do schema", failures);
check(Boolean(subscriberGuidance.daily_output_fields?.what_not_to_do), "Subscriber guidance includes what-not-to-do schema", failures);
check(subscriberGuidance.guardrails?.some((item) => item.includes("guaranteed success")), "Subscriber guidance blocks guaranteed outcome claims", failures);

check(subscriberGuidanceMethods.public_output_enabled === false, "Subscriber guidance methods block public output", failures);
check(subscriberGuidanceMethods.subscriber_output_enabled === false, "Subscriber guidance methods disabled at scaffold stage", failures);
check(subscriberGuidanceMethods.guidance_components?.some((item) => item.id === "lucky_number"), "Subscriber guidance methods include lucky number", failures);
check(subscriberGuidanceMethods.guidance_components?.some((item) => item.id === "lucky_color"), "Subscriber guidance methods include lucky color", failures);
check(subscriberGuidanceMethods.guidance_components?.some((item) => item.id === "mantra"), "Subscriber guidance methods include mantra", failures);
check(subscriberGuidanceMethods.guidance_components?.some((item) => item.id === "what_to_do"), "Subscriber guidance methods include what-to-do", failures);
check(subscriberGuidanceMethods.guidance_components?.some((item) => item.id === "what_not_to_do"), "Subscriber guidance methods include what-not-to-do", failures);
check(sampleSubscriberContext.consent_to_generate_personal_guidance === true, "Sample subscriber context has consent", failures);


check(mantraPolicy.public_output_enabled === false, "Mantra output is disabled until reviewed", failures);
check(mantraPolicy.required_before_showing_mantra?.includes("exact Devanagari text"), "Mantra policy requires exact Devanagari text", failures);
check(mantraPolicy.guardrails?.some((item) => item.includes("Do not invent mantra text")), "Mantra policy blocks invented mantra text", failures);



const anyPublicEnabled = [
  panchangMethods,
  festivalRules,
  guidanceTaxonomy,
  numerologyRules,
  palmistryRules
].some((item) => item.public_output_enabled === true);

check(!anyPublicEnabled, "No premium knowledge module is publicly enabled before calculation/review", failures);

console.log("");
console.log("Knowledge Vault summary:");
console.log(`- Source records: ${sourceRegistry.sources.length}`);
console.log(`- Panchang fields: ${panchangMethods.calculation_fields.length}`);
console.log(`- Guidance categories: ${guidanceTaxonomy.guidance_categories.length}`);
console.log(`- Numerology scaffold calculations: ${numerologyRules.supported_future_calculations.length}`);
console.log(`- Palmistry major lines: ${palmistryRules.knowledge_categories.major_lines.length}`);
console.log(`- Current DB version: ${updateLog.current_database_version}`);
console.log(`- Next review: ${updateLog.next_scheduled_review}`);

if (failures.length) {
  console.log("");
  console.log("Knowledge preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Knowledge Vault preflight passed.");
