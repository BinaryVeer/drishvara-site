const STREAMS = [
  "spirituality",
  "sports",
  "world_affairs",
  "media_society",
  "public_programmes"
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const SPECIAL_DAY_CONFIG = {
  Tuesday: {
    edition_type: "special_tuesday",
    edition_name: "Deep Structures Edition",
    default_width: "medium",
    default_depth: "deep",
    default_closing_style: "open_analytical"
  },
  Friday: {
    edition_type: "special_friday",
    edition_name: "Culture, Mind & Meaning Edition",
    default_width: "medium",
    default_depth: "deep",
    default_closing_style: "open_reflective"
  },
  Sunday: {
    edition_type: "special_sunday",
    edition_name: "Long Horizon Edition",
    default_width: "broad",
    default_depth: "flagship",
    default_closing_style: "open_reflective"
  }
};

const STREAM_SPECIAL_RULES = {
  spirituality: {
    Tuesday: {
      theme_family: "inner_discipline_modern_life",
      traffic_goal: "quality_retention",
      topic_shape: "practice_psychology_meaning",
      must_include: ["one analogy", "lived relevance", "reflective close"]
    },
    Friday: {
      theme_family: "sacred_analogies_and_modern_conflict",
      traffic_goal: "quality_authority",
      topic_shape: "analogy_reflection_inner_conflict",
      must_include: ["strong analogy", "moral tension", "open reflective close"]
    },
    Sunday: {
      theme_family: "civilizational_wisdom",
      traffic_goal: "authority_building",
      topic_shape: "history_present_future",
      must_include: ["historical reference", "civilizational framing", "open reflective close"]
    },
    default: {
      theme_family: "everyday_spiritual_depth",
      traffic_goal: "quality_traffic",
      topic_shape: "practical_reflective",
      must_include: ["clarity", "relevance"]
    }
  },

  sports: {
    Tuesday: {
      theme_family: "systems_behind_performance",
      traffic_goal: "smart_explainer",
      topic_shape: "performance_design_system",
      must_include: ["performance logic", "evidence or pattern", "open analytical close"]
    },
    Friday: {
      theme_family: "meaning_of_competition",
      traffic_goal: "retention_value",
      topic_shape: "identity_pressure_resilience",
      must_include: ["psychological layer", "analogy", "open reflective close"]
    },
    Sunday: {
      theme_family: "history_legacy_change_in_sport",
      traffic_goal: "quality_authority",
      topic_shape: "history_present_future",
      must_include: ["historical fact", "structural insight", "open reflective close"]
    },
    default: {
      theme_family: "smart_sports_analysis",
      traffic_goal: "quality_traffic",
      topic_shape: "explainer_plus_implication",
      must_include: ["clarity", "specificity"]
    }
  },

  world_affairs: {
    Tuesday: {
      theme_family: "strategic_structures",
      traffic_goal: "authority_building",
      topic_shape: "system_power_alignment",
      must_include: ["structural analysis", "evidence", "open analytical close"]
    },
    Friday: {
      theme_family: "narratives_identity_power",
      traffic_goal: "quality_retention",
      topic_shape: "story_power_identity",
      must_include: ["narrative lens", "historical echo", "open reflective close"]
    },
    Sunday: {
      theme_family: "historical_world_order",
      traffic_goal: "quality_authority",
      topic_shape: "history_present_future",
      must_include: ["historical comparison", "strategic implication", "open reflective close"]
    },
    default: {
      theme_family: "geopolitical_signal_reading",
      traffic_goal: "quality_traffic",
      topic_shape: "event_plus_structure",
      must_include: ["clarity", "strategic implication"]
    }
  },

  media_society: {
    Tuesday: {
      theme_family: "systems_of_attention",
      traffic_goal: "smart_explainer",
      topic_shape: "platform_design_public_perception",
      must_include: ["system view", "evidence", "open analytical close"]
    },
    Friday: {
      theme_family: "culture_and_perception",
      traffic_goal: "retention_value",
      topic_shape: "identity_story_public_emotion",
      must_include: ["analogy", "social insight", "open reflective close"]
    },
    Sunday: {
      theme_family: "media_history_and_democracy",
      traffic_goal: "authority_building",
      topic_shape: "history_present_future",
      must_include: ["historical frame", "institutional consequence", "open reflective close"]
    },
    default: {
      theme_family: "media_public_reason",
      traffic_goal: "quality_traffic",
      topic_shape: "issue_plus_societal_implication",
      must_include: ["clarity", "social relevance"]
    }
  },

  public_programmes: {
    Tuesday: {
      theme_family: "delivery_architecture",
      traffic_goal: "smart_explainer",
      topic_shape: "system_design_execution_gap",
      must_include: ["implementation logic", "evidence", "open analytical close"]
    },
    Friday: {
      theme_family: "human_consequence_of_policy",
      traffic_goal: "retention_value",
      topic_shape: "citizen_experience_dignity_trust",
      must_include: ["human layer", "one analogy", "open reflective close"]
    },
    Sunday: {
      theme_family: "state_society_welfare_history",
      traffic_goal: "quality_authority",
      topic_shape: "history_present_future",
      must_include: ["historical lesson", "institutional comparison", "open reflective close"]
    },
    default: {
      theme_family: "public_systems_explainer",
      traffic_goal: "quality_traffic",
      topic_shape: "policy_plus_delivery",
      must_include: ["clarity", "practical consequence"]
    }
  }
};

export function buildEditorialPlan({
  date = null,
  horizonMonths = 12
} = {}) {
  const targetDate = date ? new Date(date) : new Date();
  const dayName = DAY_NAMES[targetDate.getUTCDay()];
  const isoDate = targetDate.toISOString().slice(0, 10);

  const specialConfig = SPECIAL_DAY_CONFIG[dayName] || null;
  const editionType = specialConfig ? specialConfig.edition_type : "regular";
  const editionName = specialConfig ? specialConfig.edition_name : "Standard Daily Edition";

  const streamPlans = {};

  for (const stream of STREAMS) {
    const streamRule =
      STREAM_SPECIAL_RULES[stream][dayName] ||
      STREAM_SPECIAL_RULES[stream].default;

    streamPlans[stream] = {
      stream,
      edition_type: editionType,
      edition_name: editionName,
      width: specialConfig?.default_width || "medium",
      depth: specialConfig?.default_depth || "standard",
      closing_style: specialConfig?.default_closing_style || "standard_close",
      theme_family: streamRule.theme_family,
      traffic_goal: streamRule.traffic_goal,
      topic_shape: streamRule.topic_shape,
      must_include: streamRule.must_include,
      pacing_hint: getPacingHint({ dayName, horizonMonths }),
      episode_intent: getEpisodeIntent({ dayName, horizonMonths }),
      writing_mode: getWritingMode({ dayName }),
      special_day: Boolean(specialConfig)
    };
  }

  return {
    date: isoDate,
    day_name: dayName,
    edition_type: editionType,
    edition_name: editionName,
    planning_horizon_months: horizonMonths,
    objective: specialConfig
      ? "Prioritize stronger editorial distinctiveness, quality traffic, and deeper reader retention."
      : "Publish a strong, category-aligned daily article with quality traffic potential.",
    stream_plans: streamPlans
  };
}

function getPacingHint({ dayName, horizonMonths }) {
  if (dayName === "Sunday") {
    return horizonMonths >= 12
      ? "flagship_arc_progression"
      : "slow_deepening_series";
  }

  if (dayName === "Tuesday") {
    return "systematic_explainer_progression";
  }

  if (dayName === "Friday") {
    return "reflective_series_progression";
  }

  return "standard_rotation";
}

function getEpisodeIntent({ dayName, horizonMonths }) {
  if (dayName === "Sunday" && horizonMonths >= 12) {
    return "advance_long_form_editorial_identity";
  }

  if (dayName === "Tuesday") {
    return "build_authority_through_structured_explanation";
  }

  if (dayName === "Friday") {
    return "increase_retention_through_reflective_depth";
  }

  return "maintain_consistent_quality";
}

function getWritingMode({ dayName }) {
  if (dayName === "Sunday") return "historical_evidence_reflective";
  if (dayName === "Friday") return "analogy_reflective";
  if (dayName === "Tuesday") return "structural_explainer";
  return "standard_editorial";
}

export function buildPlannerPromptBlock(plan, streamKey) {
  const streamPlan = plan?.stream_plans?.[streamKey];
  if (!streamPlan) return "";

  return [
    `Editorial plan date: ${plan.date}`,
    `Day: ${plan.day_name}`,
    `Edition type: ${plan.edition_type}`,
    `Edition name: ${plan.edition_name}`,
    `Stream: ${streamKey}`,
    `Topic width: ${streamPlan.width}`,
    `Depth: ${streamPlan.depth}`,
    `Traffic goal: ${streamPlan.traffic_goal}`,
    `Topic shape: ${streamPlan.topic_shape}`,
    `Theme family: ${streamPlan.theme_family}`,
    `Writing mode: ${streamPlan.writing_mode}`,
    `Pacing hint: ${streamPlan.pacing_hint}`,
    `Episode intent: ${streamPlan.episode_intent}`,
    `Closing style: ${streamPlan.closing_style}`,
    `Must include: ${streamPlan.must_include.join(", ")}`
  ].join("\n");
}