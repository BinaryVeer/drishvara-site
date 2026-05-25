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

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  "out",
  ".vercel",
  "coverage"
]);

const TEXT_EXTENSIONS = new Set([
  ".json",
  ".md",
  ".mjs",
  ".js",
  ".txt",
  ".yml",
  ".yaml"
]);

function toRepoPath(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function walk(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const repoPath = toRepoPath(fullPath);

    if (entry.isDirectory()) {
      walk(fullPath, output);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();

    if (!TEXT_EXTENSIONS.has(ext)) continue;
    if (repoPath.includes("generate-ag24b-topic-selection-scoring-engine-plan")) continue;
    if (repoPath.includes("validate-ag24b-topic-selection-scoring-engine-plan")) continue;
    if (repoPath.includes("ag24b-topic-selection-scoring-engine-plan")) continue;

    output.push(fullPath);
  }

  return output;
}

const sourceSpecs = [
  {
    consumed_stage: "AG24A",
    label: "Episodic Content Doctrine",
    hints: [
      "episodic content doctrine",
      "weekly episodes",
      "educational series",
      "burning topic series",
      "sunday flagship"
    ]
  },
  {
    consumed_stage: "AG23G",
    label: "First Light Topic Scoring Model",
    hints: [
      "topic scoring model",
      "public relevance",
      "freshness",
      "series potential",
      "risk"
    ]
  },
  {
    consumed_stage: "AG23F",
    label: "First Light Source and Verification Plan",
    hints: [
      "source",
      "verification",
      "first light",
      "unsupported",
      "reference"
    ]
  },
  {
    consumed_stage: "AG23Z",
    label: "Homepage Daily Surface and First Light Closure",
    hints: [
      "homepage daily surface",
      "first light closure",
      "closure",
      "no live mutation"
    ]
  }
];

const repoFiles = walk(root);

function findSourceRecord(spec) {
  let best = null;

  for (const filePath of repoFiles) {
    const repoPath = toRepoPath(filePath);
    const base = path.basename(filePath).toLowerCase();
    const text = safeRead(filePath).toLowerCase();

    let score = 0;

    if (base.includes(spec.consumed_stage.toLowerCase())) score += 12;
    if (text.includes(spec.consumed_stage.toLowerCase())) score += 7;

    for (const hint of spec.hints) {
      const h = hint.toLowerCase();
      if (base.includes(h)) score += 4;
      if (text.includes(h)) score += 2;
    }

    if (repoPath.startsWith("data/")) score += 5;
    if (repoPath.startsWith("docs/")) score += 5;
    if (repoPath.startsWith("scripts/")) score -= 4;

    if (!best || score > best.score) {
      best = {
        score,
        repoPath,
        evidence_terms_found: spec.hints.filter((hint) =>
          text.includes(hint.toLowerCase()) || base.includes(hint.toLowerCase())
        )
      };
    }
  }

  if (!best || best.score < 10) {
    return null;
  }

  return {
    consumed_stage: spec.consumed_stage,
    label: spec.label,
    source_path: best.repoPath,
    evidence_terms_found: best.evidence_terms_found,
    consumption_status: "consumed_as_source_of_truth"
  };
}

const consumed = sourceSpecs.map(findSourceRecord);
const missing = consumed
  .map((record, index) => (record ? null : sourceSpecs[index]))
  .filter(Boolean);

if (missing.length > 0) {
  console.error("❌ AG24B generation blocked. Missing required prior source records:");
  for (const item of missing) {
    console.error(`- ${item.consumed_stage}: ${item.label}`);
  }
  console.error("Do not proceed. Share the output and locate the missing prior records.");
  process.exit(1);
}

const now = new Date().toISOString();

const plan = {
  schema_version: "drishvara.ag24b.topic_selection_scoring_engine_plan.v1",
  stage: "AG24B",
  name: "Topic Selection and Scoring Engine Plan",
  status: "governed_plan_only_non_active",
  latest_confirmed_base_commit: "be402f0",
  created_at: now,
  created_by: "vikash vaibhav",
  purpose:
    "Define the non-active topic selection and scoring engine for Drishvara episodic knowledge production, consuming AG24A doctrine, AG23G scoring logic, AG23F source verification rules, and AG23Z homepage/First Light closure.",
  consumed_source_of_truth: consumed,
  execution_guards: {
    plan_only: true,
    non_active: true,
    no_publish: true,
    no_deploy: true,
    no_supabase: true,
    no_auth: true,
    no_backend_activation: true,
    no_database_write: true,
    no_public_visibility_change: true,
    no_public_index_mutation: true,
    no_article_generation: true,
    no_live_endpoint: true,
    no_secret_or_token_required: true
  },
  source_doctrine_consumption: {
    AG24A:
      "Uses the episodic doctrine to keep Tuesday Learning, Friday World Lens/Burning Topic, and Sunday Deep Read as the primary rhythm.",
    AG23G:
      "Extends the First Light topic scoring model into episodic candidate scoring without replacing the completed AG23G model.",
    AG23F:
      "Applies manual/curated source verification and blocks unsupported breaking-news claims.",
    AG23Z:
      "Preserves homepage daily surface closure boundaries and keeps AG24B non-mutating and non-publishing."
  },
  topic_intake_types: [
    {
      topic_type: "evergreen_educational_series",
      intended_lane: "Tuesday Learning Series",
      example_subjects: [
        "Vedic Mathematics",
        "genetics and mutations",
        "health diagnosis fundamentals",
        "engines and technology evolution",
        "AI for public systems"
      ],
      selection_note:
        "Promote only when the subject can be broken into teachable episodes and remains useful beyond current news cycles."
    },
    {
      topic_type: "burning_current_topic",
      intended_lane: "Friday World Lens / Burning Topic",
      example_subjects: [
        "AI regulation",
        "climate and water stress",
        "global conflict",
        "sports governance",
        "public health emergency"
      ],
      selection_note:
        "Promote only when credible sources are available and the topic can be handled with context, continuity and caution."
    },
    {
      topic_type: "public_systems_insight",
      intended_lane: "Featured Read / Public Programme Watch",
      example_subjects: [
        "water systems",
        "health infrastructure",
        "governance delivery",
        "education systems",
        "public infrastructure"
      ],
      selection_note:
        "Promote when the topic improves public understanding of systems, institutions and delivery mechanisms."
    },
    {
      topic_type: "reflective_cultural_topic",
      intended_lane: "Sunday Deep Read / Reflection-connected article",
      example_subjects: [
        "Indian knowledge systems",
        "media behaviour",
        "social meaning",
        "culture and personal reflection"
      ],
      selection_note:
        "Promote when the topic supports Drishvara's vision-reflection-insight identity without unsupported claims."
    },
    {
      topic_type: "first_light_promoted_signal",
      intended_lane: "Signal-to-episode bridge",
      example_subjects: [
        "Northeast signal",
        "national pulse",
        "world affairs signal",
        "technology signal",
        "sports and society signal"
      ],
      selection_note:
        "Promote only when the First Light signal score and source status justify conversion into a brief or episode candidate."
    }
  ],
  scoring_model: {
    score_style: "equal_positive_scores_with_negative_risk_adjustments",
    max_possible_positive_score: 35,
    min_possible_risk_adjustment: -10,
    criteria: [
      {
        id: "current_relevance",
        label: "Current relevance",
        score_range: { min: 0, max: 5 },
        scoring_question: "Is the topic active, important or timely now?",
        interpretation:
          "Higher score means the topic is currently visible, consequential or being actively discussed."
      },
      {
        id: "evergreen_value",
        label: "Evergreen value",
        score_range: { min: 0, max: 5 },
        scoring_question: "Will the topic remain useful beyond the current week?",
        interpretation:
          "Higher score means the topic can remain valuable even after the immediate event cycle ends."
      },
      {
        id: "audience_benefit",
        label: "Audience benefit",
        score_range: { min: 0, max: 5 },
        scoring_question: "Will the topic teach, clarify or help the reader think better?",
        interpretation:
          "Higher score means the topic offers clear educational, reflective or decision-support value."
      },
      {
        id: "reference_availability",
        label: "Reference availability",
        score_range: { min: 0, max: 5 },
        scoring_question: "Are credible, reachable and relevant sources available?",
        interpretation:
          "Higher score requires credible sources; unresolved sources keep the topic under editorial verification."
      },
      {
        id: "episode_depth_potential",
        label: "Episode depth potential",
        score_range: { min: 0, max: 5 },
        scoring_question: "Can the topic sustain at least 8 to 12 meaningful episodes?",
        interpretation:
          "Higher score means the topic has enough conceptual depth, subtopics and continuity for a series."
      },
      {
        id: "visual_object_potential",
        label: "Visual/object potential",
        score_range: { min: 0, max: 5 },
        scoring_question: "Can diagrams, tables, infographics, timelines or examples improve the topic?",
        interpretation:
          "Higher score means the topic can support object-rich reading without damaging article layout."
      },
      {
        id: "drishvara_brand_fit",
        label: "Drishvara brand fit",
        score_range: { min: 0, max: 5 },
        scoring_question: "Does the topic fit Vision, Reflection and Insight?",
        interpretation:
          "Higher score means the topic strengthens Drishvara's identity rather than becoming generic content."
      },
      {
        id: "sensitivity_risk",
        label: "Sensitivity risk",
        score_range: { min: -5, max: 0 },
        scoring_question: "Does the topic involve high factual, political, social, legal, health or spiritual sensitivity?",
        interpretation:
          "More negative score means greater risk and stronger editorial caution is required."
      },
      {
        id: "repetition_risk",
        label: "Repetition risk",
        score_range: { min: -5, max: 0 },
        scoring_question: "Is the topic overused, repetitive or too similar to recent content?",
        interpretation:
          "More negative score means the topic should be delayed, reframed or merged with another series."
      }
    ],
    total_score_formula:
      "total_score = sum(positive criteria) + sensitivity_risk + repetition_risk",
    decision_thresholds: [
      {
        decision: "strong_series_candidate",
        min_total_score: 25,
        action:
          "Promote to AG24C 12-week episode calendar planning, subject to source gate and editorial review."
      },
      {
        decision: "topic_bank",
        min_total_score: 18,
        max_total_score: 24,
        action:
          "Keep in governed topic bank for later use, improvement, source completion or better timing."
      },
      {
        decision: "do_not_use_now",
        max_total_score: 17,
        action:
          "Do not generate article or episode now; archive rationale and reconsider only if conditions change."
      }
    ]
  },
  source_reference_gates: {
    target_verified_references_per_promoted_topic: 2,
    allowed_pending_status: "under_editorial_verification",
    blocked_conditions: [
      "No credible source path exists.",
      "Only broken, parked, spam-like or unreachable links are available.",
      "Topic depends on unsupported breaking-news claims.",
      "Topic requires real-time public claims that cannot be verified manually.",
      "Topic risks false scriptural, cultural, medical, legal or political attribution."
    ],
    reference_quality_requirements: [
      "Relevant to the topic and not merely keyword-matched.",
      "Reachable and responsive at the time of review.",
      "Not spam, parked, misleading or unrelated.",
      "Prefer primary, official, academic, institutional or reputable editorial sources where possible.",
      "Record unresolved links as under editorial verification instead of pretending verification is complete."
    ]
  },
  first_light_bridge: {
    purpose:
      "Use First Light signals as curated inputs into episodic topic selection, not as a random news feed.",
    signal_score_24_or_more:
      "Eligible for article or episode brief review if reference and risk gates pass.",
    signal_score_18_to_23:
      "Keep as First Light-only or topic bank item unless additional depth or references emerge.",
    signal_score_below_18:
      "Archive or ignore unless the editor manually overrides with documented rationale.",
    required_fields_when_promoted: [
      "signal_category",
      "signal_headline",
      "why_it_matters",
      "source_status",
      "topic_score",
      "series_connection",
      "risk_flags",
      "editorial_note"
    ]
  },
  candidate_record_schema_plan: {
    topic_id: "Stable slug or deterministic id for candidate tracking.",
    title: "Working title of candidate topic.",
    topic_type: "One of the approved topic intake types.",
    intended_lane: "Tuesday Learning, Friday World Lens, Sunday Deep Read or Featured Read.",
    source_origin: "Manual editor, First Light signal, featured read gap, public systems insight or evergreen bank.",
    short_context: "Brief explanation of why the topic exists.",
    scores: "Object containing all AG24B scoring criteria.",
    total_score: "Calculated total after risk adjustments.",
    decision: "strong_series_candidate, topic_bank or do_not_use_now.",
    reference_status: "verified, partially_verified, under_editorial_verification or blocked.",
    suggested_reference_pack: "Two-source target when available.",
    series_depth_note: "Evidence that the topic can sustain 8 to 12 episodes if promoted.",
    visual_object_note: "Likely diagrams, tables, infographics, timelines or examples.",
    risk_flags: "Sensitivity, repetition, unsupported claim or source concerns.",
    homepage_bridge: "Whether it can surface in Discover, Read or Reflect movement.",
    next_stage_candidate: "AG24C only when selected as a strong candidate.",
    public_visibility: "Always false at AG24B.",
    publish_approved: "Always false at AG24B."
  },
  workflow_plan: [
    {
      step: 1,
      name: "candidate_intake",
      output: "Candidate topic record created from manual input, First Light signal or content gap."
    },
    {
      step: 2,
      name: "source_gate",
      output: "Reference availability and verification status checked before scoring is trusted."
    },
    {
      step: 3,
      name: "risk_screen",
      output: "Sensitivity and repetition risks recorded before promotion."
    },
    {
      step: 4,
      name: "score_candidate",
      output: "All AG24B criteria scored with reason notes."
    },
    {
      step: 5,
      name: "threshold_decision",
      output: "Candidate becomes strong series candidate, topic bank item or do-not-use-now item."
    },
    {
      step: 6,
      name: "series_projection",
      output: "For strong candidates, outline possible 8 to 12 episode depth."
    },
    {
      step: 7,
      name: "handoff_to_ag24c",
      output: "Only strong candidates move to 12-week episode calendar planning."
    }
  ],
  review_controls: {
    manual_editorial_review_required: true,
    generated_content_blocked: true,
    publication_blocked: true,
    public_surface_blocked: true,
    backend_activation_blocked: true,
    cost_optimization_note:
      "AG24B should score and bank topics before expensive article/image generation or API-backed workflows are used."
  },
  next_stage_boundary: {
    next_stage: "AG24C",
    next_stage_name: "12-Week Episode Calendar Plan",
    allowed_handoff:
      "Only scored topic candidates and planning rules may be handed off. No article generation, publication, backend activation or public mutation is allowed from AG24B."
  }
};

const md = `# AG24B — Topic Selection and Scoring Engine Plan

**Status:** Governed plan only; non-active  
**Base commit:** be402f0  
**Created by:** vikash vaibhav  
**Created at:** ${now}

## Purpose

AG24B defines the topic selection and scoring engine for Drishvara's episodic knowledge system. It consumes AG24A, AG23G, AG23F and AG23Z as source-of-truth inputs and does not repeat or replace them.

## Consumed Source-of-Truth Records

| Stage | Record | Source Path | Consumption |
|---|---|---|---|
${consumed
  .map(
    (item) =>
      `| ${item.consumed_stage} | ${item.label} | \`${item.source_path}\` | ${item.consumption_status} |`
  )
  .join("\n")}

## Non-Activation Guard

AG24B is planning-only. It does not publish, deploy, activate Supabase/Auth/backend, mutate public indexes, generate articles, create live endpoints, or require secrets/tokens.

## Scoring Criteria

| Criterion | Range | Purpose |
|---|---:|---|
${plan.scoring_model.criteria
  .map(
    (item) =>
      `| ${item.label} | ${item.score_range.min} to ${item.score_range.max} | ${item.scoring_question} |`
  )
  .join("\n")}

## Decision Thresholds

| Decision | Score | Action |
|---|---:|---|
| Strong series candidate | 25+ | Promote to AG24C calendar planning if source and risk gates pass. |
| Topic bank | 18–24 | Retain for later improvement or timing. |
| Do not use now | Below 18 | Do not generate or publish. |

## First Light Bridge

First Light signals can enter the AG24B topic engine only as curated editorial inputs. Signals scoring 24+ may be considered for article or episode brief review if reference and risk gates pass. Signals scoring 18–23 remain First Light-only or topic-bank candidates. Signals below 18 are archived or ignored unless manually justified.

## Reference Gate

A promoted topic should target two verified references where possible. Broken, spam-like, parked, unreachable, irrelevant or unsupported links must not be treated as verified. Pending topics must be marked under editorial verification.

## AG24C Boundary

AG24B may hand off only scored candidates and planning rules to AG24C. Article generation, public publishing, deployment, backend activation and public visibility changes remain blocked.
`;

fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
fs.mkdirSync(path.dirname(OUTPUT_MD), { recursive: true });

fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(plan, null, 2)}\n`);
fs.writeFileSync(OUTPUT_MD, md);

console.log("✅ AG24B generated:");
console.log(`- ${toRepoPath(OUTPUT_JSON)}`);
console.log(`- ${toRepoPath(OUTPUT_MD)}`);
console.log("Consumed prior records:");
for (const item of consumed) {
  console.log(`- ${item.consumed_stage}: ${item.source_path}`);
}
