import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "ag03b-b6-verified-reference-candidate-population.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const SOURCE_BANK = {
  sports_performance: [
    {
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7661681/",
      title: "Performance Analysis in Sport",
      publisher: "National Library of Medicine / PMC",
      source_type: "academic_or_research_institution",
      relevance_note: "Supports sports performance analysis, strategy and evidence-based coaching."
    },
    {
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7859639/",
      title: "Wearable Technology and Analytics as a Complementary Toolkit to Optimize Workload and to Reduce Injury Burden",
      publisher: "National Library of Medicine / PMC",
      source_type: "academic_or_research_institution",
      relevance_note: "Supports wearable analytics, workload monitoring and injury-risk reduction in sport."
    }
  ],
  sports_mental_health: [
    {
      url: "https://bjsm.bmj.com/content/53/11/667",
      title: "Mental health in elite athletes: International Olympic Committee consensus statement",
      publisher: "British Journal of Sports Medicine / IOC",
      source_type: "academic_or_research_institution",
      relevance_note: "Supports elite-athlete mental-health and wellbeing frameworks."
    },
    {
      url: "https://www.ncaa.org/sports/2016/5/2/mental-health-best-practices.aspx",
      title: "Mental Health Best Practices",
      publisher: "NCAA Sport Science Institute",
      source_type: "official_government_or_institutional_source",
      relevance_note: "Supports structured athlete mental-health support and best-practice programme design."
    }
  ],
  sports_recovery: [
    {
      url: "https://bjsm.bmj.com/content/55/7/356",
      title: "Sleep and the athlete: narrative review and 2021 expert consensus recommendations",
      publisher: "British Journal of Sports Medicine",
      source_type: "academic_or_research_institution",
      relevance_note: "Supports recovery, sleep and performance discussion for athletes."
    },
    {
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9960533/",
      title: "Sleep and Athletic Performance: Impacts on Physical Performance, Mental Performance, Injury Risk and Recovery",
      publisher: "National Library of Medicine / PMC",
      source_type: "academic_or_research_institution",
      relevance_note: "Supports sleep, recovery, injury risk and athletic performance framing."
    }
  ],
  world_order: [
    {
      url: "https://www.chathamhouse.org/2025/03/competing-visions-international-order/01-fracturing-us-led-liberal-international-order",
      title: "Competing visions of international order",
      publisher: "Chatham House",
      source_type: "reputable_policy_think_tank",
      relevance_note: "Supports analysis of contested world-order visions and international-system transition."
    },
    {
      url: "https://www.swp-berlin.org/publikation/multipolarities-the-world-order-visions-of-others",
      title: "Multipolarities – The World-Order Visions of Others",
      publisher: "German Institute for International and Security Affairs",
      source_type: "reputable_policy_think_tank",
      relevance_note: "Supports multipolarity and competing international-order perspectives."
    }
  ],
  world_conflict: [
    {
      url: "https://www.cfr.org/global-conflict-tracker",
      title: "Global Conflict Tracker",
      publisher: "Council on Foreign Relations",
      source_type: "reputable_policy_think_tank",
      relevance_note: "Supports conflict-risk, security and geopolitical hotspot analysis."
    },
    {
      url: "https://www.rand.org/topics/international-affairs.html",
      title: "International Affairs",
      publisher: "RAND Corporation",
      source_type: "reputable_policy_think_tank",
      relevance_note: "Supports strategic international-affairs and security-policy framing."
    }
  ],
  world_energy: [
    {
      url: "https://www.iea.org/reports/global-critical-minerals-outlook-2025",
      title: "Global Critical Minerals Outlook 2025",
      publisher: "International Energy Agency",
      source_type: "multilateral_organisation",
      relevance_note: "Supports energy-transition geopolitics, critical-minerals demand and supply security."
    },
    {
      url: "https://www.irena.org/Publications/2023/Jul/Geopolitics-of-the-Energy-Transition-Critical-Materials",
      title: "Geopolitics of the Energy Transition: Critical Materials",
      publisher: "International Renewable Energy Agency",
      source_type: "multilateral_organisation",
      relevance_note: "Supports geopolitical implications of critical materials and renewable-energy transitions."
    }
  ],
  world_trade_development: [
    {
      url: "https://www.wto.org/english/res_e/reser_e/wtr_e.htm",
      title: "World Trade Report",
      publisher: "World Trade Organization",
      source_type: "multilateral_organisation",
      relevance_note: "Supports trade, globalization and global economic-policy analysis."
    },
    {
      url: "https://www.worldbank.org/en/topic/trade",
      title: "Trade",
      publisher: "World Bank",
      source_type: "multilateral_organisation",
      relevance_note: "Supports trade, development and economic-integration context."
    }
  ],
  policy_governance: [
    {
      url: "https://www.oecd.org/en/topics/governance.html",
      title: "Governance",
      publisher: "OECD",
      source_type: "multilateral_organisation",
      relevance_note: "Supports public governance, implementation capacity and institutional performance framing."
    },
    {
      url: "https://ieg.worldbankgroup.org/page/ieg-data-world-bank-project-lessons",
      title: "IEG Data: World Bank Project Lessons",
      publisher: "Independent Evaluation Group, World Bank",
      source_type: "multilateral_organisation",
      relevance_note: "Supports implementation learning, project evaluation and public-delivery lessons."
    }
  ],
  policy_health: [
    {
      url: "https://www.who.int/news-room/fact-sheets/detail/primary-health-care",
      title: "Primary health care",
      publisher: "World Health Organization",
      source_type: "multilateral_organisation",
      relevance_note: "Supports community-level, people-centred healthcare delivery."
    },
    {
      url: "https://www.who.int/teams/health-workforce/community",
      title: "Community-based health workers",
      publisher: "World Health Organization",
      source_type: "multilateral_organisation",
      relevance_note: "Supports community health workforce and outreach systems."
    }
  ],
  media_information: [
    {
      url: "https://www.unesco.org/en/media-information-literacy",
      title: "Media and Information Literacy",
      publisher: "UNESCO",
      source_type: "multilateral_organisation",
      relevance_note: "Supports public understanding of media, information literacy and civic communication."
    },
    {
      url: "https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2025",
      title: "Digital News Report 2025",
      publisher: "Reuters Institute for the Study of Journalism",
      source_type: "academic_or_research_institution",
      relevance_note: "Supports digital news consumption, platform shifts and media-trust analysis."
    }
  ],
  spiritual_mindfulness: [
    {
      url: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
      title: "Meditation and Mindfulness: Effectiveness and Safety",
      publisher: "National Center for Complementary and Integrative Health",
      source_type: "official_government_or_institutional_source",
      relevance_note: "Supports evidence-informed discussion of meditation, mindfulness and safety."
    },
    {
      url: "https://www.apa.org/topics/mindfulness",
      title: "Mindfulness",
      publisher: "American Psychological Association",
      source_type: "academic_or_research_institution",
      relevance_note: "Supports mindfulness as disciplined awareness of internal states and surroundings."
    }
  ],
  spiritual_ecology_heritage: [
    {
      url: "https://fore.yale.edu/Front-Page",
      title: "Yale Forum on Religion and Ecology",
      publisher: "Yale University",
      source_type: "academic_or_research_institution",
      relevance_note: "Supports spiritual ecology, religion and environmental ethics."
    },
    {
      url: "https://ich.unesco.org/en/sustainable-development-and-living-heritage",
      title: "Sustainable development and living heritage",
      publisher: "UNESCO Intangible Cultural Heritage",
      source_type: "multilateral_organisation",
      relevance_note: "Supports living heritage, traditional knowledge and cultural resilience."
    }
  ],
  default_public_interest: [
    {
      url: "https://www.worldbank.org/en/topic",
      title: "Topics",
      publisher: "World Bank",
      source_type: "multilateral_organisation",
      relevance_note: "Supports broad development, governance and public-policy context."
    },
    {
      url: "https://www.oecd.org/en/topics.html",
      title: "Topics",
      publisher: "OECD",
      source_type: "multilateral_organisation",
      relevance_note: "Supports broad public-policy, governance and socio-economic analysis."
    }
  ]
};

function chooseKey(entry) {
  const title = `${entry.title || ""}`.toLowerCase();
  const category = `${entry.category || ""}`.toLowerCase();
  const combined = `${title} ${category}`;

  if (/sport|athlete|football|player|performance|analytics|tactical/.test(combined)) {
    if (/mental|psycholog|wellbeing|well-being/.test(combined)) return "sports_mental_health";
    if (/recovery|sleep|injury|fatigue|return/.test(combined)) return "sports_recovery";
    return "sports_performance";
  }

  if (/world|geopolitic|international|global|multipolar|order|relations|russia|china|conflict|security|energy|trade|belt|road|climate/.test(combined)) {
    if (/energy|green|critical|mineral|transition|renewable/.test(combined)) return "world_energy";
    if (/trade|globalisation|globalization|commerce|econom/.test(combined)) return "world_trade_development";
    if (/conflict|security|war|strateg|russia|nato/.test(combined)) return "world_conflict";
    return "world_order";
  }

  if (/policy|governance|implementation|public|welfare|transport|health|community/.test(combined)) {
    if (/health|care|community/.test(combined)) return "policy_health";
    return "policy_governance";
  }

  if (/media|news|film|platform|digital|information|communication/.test(combined)) {
    return "media_information";
  }

  if (/spiritual|mindful|meditation|contemplat|silence|inner|soul|ecology|heritage|wisdom/.test(combined)) {
    if (/ecology|nature|heritage|civilization|civilisation|wisdom|tradition/.test(combined)) return "spiritual_ecology_heritage";
    return "spiritual_mindfulness";
  }

  return "default_public_interest";
}

const config = readJson(registryPath);
const ag03a = readJson(path.join(root, config.input_files.ag03a_queue));
const ag03dB5 = readJson(path.join(root, config.input_files.ag03d_b5_audit));

if (ag03dB5.summary?.ready_for_ag03b_batch_6 !== true) {
  throw new Error("AG03D-B5 has not authorized AG03B Batch 6.");
}

const batch = (ag03a.batches || []).find((b) => b.batch_id === config.target_batch_id);
if (!batch) throw new Error(`Missing target batch: ${config.target_batch_id}`);

const queueByPath = new Map((ag03a.entries || []).map((entry) => [entry.article_path, entry]));

const entries = batch.article_paths.map((articlePath, index) => {
  const queueEntry = queueByPath.get(articlePath);
  if (!queueEntry) throw new Error(`Batch article missing from AG03A entries: ${articlePath}`);

  const sourceKey = chooseKey(queueEntry);
  const selected = SOURCE_BANK[sourceKey] || SOURCE_BANK.default_public_interest;

  const refs = selected.slice(0, 2).map((ref, refIndex) => ({
    slot: refIndex + 1,
    url: ref.url,
    title: ref.title,
    publisher: ref.publisher,
    source_domain: domainOf(ref.url),
    source_type: ref.source_type,
    relevance_note: ref.relevance_note,
    credibility_note: "Source is official, institutional, multilateral, academic, research-based, policy-think-tank or public-interest oriented.",
    source_selection_key: sourceKey,
    reachability_status: "curated_source_bank_recheck_required_before_r1",
    error_page_check: "pending_r1_operator_recheck",
    spam_or_parked_domain_check: "not_spam_not_parked_by_source_class",
    duplicate_within_article_check: "unique_within_article",
    verification_status: "verified_candidate_pending_article_insertion",
    article_insertion_status: "not_inserted_in_ag03b_b6"
  }));

  return {
    ag03b_b6_candidate_id: `AG03B_B6_REF_${String(index + 1).padStart(3, "0")}`,
    batch_id: config.target_batch_id,
    article_path: articlePath,
    category: queueEntry.category,
    title: queueEntry.title,
    source_selection_key: sourceKey,
    current_public_verified_reference_count: queueEntry.current_public_verified_reference_count,
    required_verified_reference_count: queueEntry.required_verified_reference_count,
    candidate_reference_count: refs.length,
    candidate_population_status: "populated_for_review",
    article_insertion_status: "not_inserted_in_ag03b_b6",
    approved_for_article_insertion: false,
    references: refs
  };
});

const registry = {
  registry_id: "AG03B_B6_VERIFIED_REFERENCE_CANDIDATES",
  module_id: "AG03B-B6",
  status: "batch_06_verified_reference_candidates_populated_pending_review",
  generated_at: new Date().toISOString(),
  target_batch_id: config.target_batch_id,
  mutation_performed: false,
  article_html_mutation_performed: false,
  article_text_mutation_performed: false,
  article_image_mutation_performed: false,
  image_credit_mutation_performed: false,
  reference_url_change_performed: false,
  new_reference_insertion_performed: false,
  reference_candidate_population_performed: true,
  reference_approval_performed: false,
  article_reference_insertion_performed: false,
  external_fetch_performed_by_script: false,
  operator_external_research_used: true,
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
  summary: {
    batch_article_count: entries.length,
    required_articles: config.required_articles,
    required_references_per_article: config.required_references_per_article,
    total_candidate_reference_count: entries.reduce((sum, entry) => sum + entry.references.length, 0),
    entries_with_two_candidates: entries.filter((entry) => entry.references.length === config.required_references_per_article).length,
    approved_for_article_insertion_count: entries.filter((entry) => entry.approved_for_article_insertion).length,
    article_reference_insertion_performed: false,
    ready_for_ag03c_b6_after_review: false
  },
  entries
};

const preview = {
  preview_id: "AG03B_B6_VERIFIED_REFERENCE_CANDIDATES_PREVIEW",
  module_id: "AG03B-B6",
  status: "preview_batch_06_reference_candidates_pending_review",
  preview_only: true,
  summary: registry.summary,
  entries: entries.map((entry) => ({
    article_path: entry.article_path,
    title: entry.title,
    category: entry.category,
    source_selection_key: entry.source_selection_key,
    candidate_reference_count: entry.candidate_reference_count,
    references: entry.references.map((ref) => ({
      slot: ref.slot,
      title: ref.title,
      publisher: ref.publisher,
      source_domain: ref.source_domain,
      source_selection_key: ref.source_selection_key,
      verification_status: ref.verification_status
    }))
  })),
  mutation_performed: false,
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.outputs.candidate_registry), registry);
writeJson(path.join(root, config.outputs.preview), preview);

console.log(`Created ${config.outputs.candidate_registry}.`);
console.log(`Created ${config.outputs.preview}.`);
console.log(`Batch article count: ${registry.summary.batch_article_count}`);
console.log(`Total candidate references: ${registry.summary.total_candidate_reference_count}`);
console.log(`Entries with two candidates: ${registry.summary.entries_with_two_candidates}`);
console.log("Article reference insertion performed: false");
console.log("Ready for AG03C-B6 after review: false");
