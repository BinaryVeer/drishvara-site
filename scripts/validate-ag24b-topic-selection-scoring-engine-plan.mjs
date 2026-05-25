#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const OUTPUT_JSON = path.join(
  root,
  "data/content-intelligence/episodes/ag24b-topic-selection-scoring-engine-plan.json"
);

const OUTPUT_MD = path.join(
  root,
  "docs/governance/ag24/ag24b-topic-selection-scoring-engine-plan.md"
);

const PACKAGE_JSON = path.join(root, "package.json");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    errors.push(`Missing file: ${path.relative(root, filePath)}`);
    return "";
  }
}

const jsonText = readText(OUTPUT_JSON);
const mdText = readText(OUTPUT_MD);

let plan = null;

try {
  plan = JSON.parse(jsonText);
} catch (error) {
  errors.push(`Invalid AG24B JSON: ${error.message}`);
}

if (plan) {
  assert(plan.stage === "AG24B", "stage must be AG24B.");
  assert(
    plan.name === "Topic Selection and Scoring Engine Plan",
    "name must be Topic Selection and Scoring Engine Plan."
  );
  assert(
    plan.status === "governed_plan_only_non_active",
    "status must remain governed_plan_only_non_active."
  );
  assert(
    plan.latest_confirmed_base_commit === "be402f0",
    "latest_confirmed_base_commit must be be402f0."
  );

  const consumedStages = new Set(
    (plan.consumed_source_of_truth || []).map((item) => item.consumed_stage)
  );

  for (const stage of ["AG24A", "AG23G", "AG23F", "AG23Z"]) {
    assert(consumedStages.has(stage), `Required consumed source missing: ${stage}.`);
  }

  for (const item of plan.consumed_source_of_truth || []) {
    assert(Boolean(item.source_path), `Consumed source ${item.consumed_stage} must include source_path.`);
    assert(
      item.consumption_status === "consumed_as_source_of_truth",
      `Consumed source ${item.consumed_stage} must be marked consumed_as_source_of_truth.`
    );
  }

  const guards = plan.execution_guards || {};
  for (const guard of [
    "plan_only",
    "non_active",
    "no_publish",
    "no_deploy",
    "no_supabase",
    "no_auth",
    "no_backend_activation",
    "no_database_write",
    "no_public_visibility_change",
    "no_public_index_mutation",
    "no_article_generation",
    "no_live_endpoint",
    "no_secret_or_token_required"
  ]) {
    assert(guards[guard] === true, `Execution guard must be true: ${guard}.`);
  }

  const criteria = plan.scoring_model?.criteria || [];
  const criterionIds = new Set(criteria.map((item) => item.id));

  for (const id of [
    "current_relevance",
    "evergreen_value",
    "audience_benefit",
    "reference_availability",
    "episode_depth_potential",
    "visual_object_potential",
    "drishvara_brand_fit",
    "sensitivity_risk",
    "repetition_risk"
  ]) {
    assert(criterionIds.has(id), `Missing scoring criterion: ${id}.`);
  }

  assert(criteria.length === 9, "AG24B must contain exactly 9 scoring criteria.");

  for (const item of criteria) {
    assert(item.score_range, `Criterion ${item.id} must include score_range.`);
    if (["sensitivity_risk", "repetition_risk"].includes(item.id)) {
      assert(item.score_range.min === -5, `${item.id} min score must be -5.`);
      assert(item.score_range.max === 0, `${item.id} max score must be 0.`);
    } else {
      assert(item.score_range.min === 0, `${item.id} min score must be 0.`);
      assert(item.score_range.max === 5, `${item.id} max score must be 5.`);
    }
  }

  const thresholds = plan.scoring_model?.decision_thresholds || [];
  assert(
    thresholds.some((item) => item.decision === "strong_series_candidate" && item.min_total_score === 25),
    "Decision threshold missing: strong_series_candidate must start at 25."
  );
  assert(
    thresholds.some(
      (item) =>
        item.decision === "topic_bank" &&
        item.min_total_score === 18 &&
        item.max_total_score === 24
    ),
    "Decision threshold missing: topic_bank must be 18–24."
  );
  assert(
    thresholds.some((item) => item.decision === "do_not_use_now" && item.max_total_score === 17),
    "Decision threshold missing: do_not_use_now must be below 18."
  );

  assert(
    plan.source_reference_gates?.target_verified_references_per_promoted_topic === 2,
    "Reference gate must target two verified references per promoted topic."
  );

  assert(
    plan.first_light_bridge?.signal_score_24_or_more,
    "First Light bridge must define handling for score 24+."
  );

  assert(
    plan.next_stage_boundary?.next_stage === "AG24C",
    "Next stage boundary must be AG24C."
  );

  assert(
    plan.review_controls?.generated_content_blocked === true,
    "Generated content must remain blocked at AG24B."
  );
  assert(
    plan.review_controls?.publication_blocked === true,
    "Publication must remain blocked at AG24B."
  );
  assert(
    plan.review_controls?.backend_activation_blocked === true,
    "Backend activation must remain blocked at AG24B."
  );
}

const combinedText = `${jsonText}\n${mdText}`;

const forbiddenPatterns = [
  {
    pattern: /createClient\s*\(/,
    reason: "Supabase client creation is not allowed in AG24B."
  },
  {
    pattern: /supabase\.from\s*\(/,
    reason: "Supabase table access is not allowed in AG24B."
  },
  {
    pattern: /publish_approved["']?\s*:\s*true/i,
    reason: "publish_approved must not be true in AG24B."
  },
  {
    pattern: /public_visibility["']?\s*:\s*true/i,
    reason: "public_visibility must not be true in AG24B."
  },
  {
    pattern: /deployment_enabled["']?\s*:\s*true/i,
    reason: "Deployment cannot be enabled in AG24B."
  },
  {
    pattern: /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ANON_KEY|GITHUB_TOKEN|VERCEL_TOKEN/,
    reason: "Secrets or token names must not be introduced in AG24B artifacts."
  }
];

for (const item of forbiddenPatterns) {
  assert(!item.pattern.test(combinedText), item.reason);
}

if (fs.existsSync(PACKAGE_JSON)) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf8"));
  assert(
    pkg.scripts?.["generate:ag24b"] ===
      "node scripts/generate-ag24b-topic-selection-scoring-engine-plan.mjs",
    "package.json must include generate:ag24b."
  );
  assert(
    pkg.scripts?.["validate:ag24b"] ===
      "node scripts/validate-ag24b-topic-selection-scoring-engine-plan.mjs",
    "package.json must include validate:ag24b."
  );
}

if (errors.length > 0) {
  console.error("❌ AG24B validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("✅ AG24B validation passed.");
console.log("- Required prior records consumed: AG24A, AG23G, AG23F, AG23Z");
console.log("- Scoring model, thresholds, source gates and AG24C boundary verified");
console.log("- No publish/deploy/Supabase/Auth/backend activation detected");
