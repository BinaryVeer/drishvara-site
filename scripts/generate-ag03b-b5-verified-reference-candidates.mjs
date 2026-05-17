import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "ag03b-b5-verified-reference-candidate-population.json");

const CANDIDATE_REFS = [
  {
    "article_path": "articles/sports/evolution-sports-analytics-athlete-performance-strategy.html",
    "references": [
      {
        "slot": 1,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7661681/",
        "title": "Performance Analysis in Sport",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports sports-performance analysis, tactical insight and strategy-building through analytics."
      },
      {
        "slot": 2,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7859639/",
        "title": "Wearable Technology and Analytics as a Complementary Toolkit to Optimize Workload and to Reduce Injury Burden",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports athlete-performance strategy through wearable data, workload monitoring and injury-risk reduction."
      }
    ]
  },
  {
    "article_path": "articles/sports/evolution-sports-analytics-player-psychology.html",
    "references": [
      {
        "slot": 1,
        "url": "https://bjsm.bmj.com/content/53/11/667",
        "title": "Mental health in elite athletes: International Olympic Committee consensus statement",
        "publisher": "British Journal of Sports Medicine / IOC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports the relationship between elite athlete performance environments, mental health and player psychology."
      },
      {
        "slot": 2,
        "url": "https://bjsm.bmj.com/content/59/21/1459",
        "title": "International Olympic Committee consensus-driven mental health recommendations for athletes at sporting events",
        "publisher": "British Journal of Sports Medicine / IOC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports athlete psychology and event-related mental-health support in high-performance settings."
      }
    ]
  },
  {
    "article_path": "articles/sports/evolution-sports-analytics-transforming-strategies-performance.html",
    "references": [
      {
        "slot": 1,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7661681/",
        "title": "Performance Analysis in Sport",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports how performance analysis transforms team strategy and athlete-performance interpretation."
      },
      {
        "slot": 2,
        "url": "https://www.mdpi.com/2076-3417/13/23/12965",
        "title": "Technological Breakthroughs in Sport: Current Practice and Future Potential of Artificial Intelligence, Virtual Reality, Augmented Reality, and Modern Data Visualization in Performance Analysis",
        "publisher": "Applied Sciences / MDPI",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports technology-led transformation of sports strategy, coaching and performance analysis."
      }
    ]
  },
  {
    "article_path": "articles/sports/evolution-tactical-analytics-football-performance-fan-engagement.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.statsperform.com/resource/exploring-the-evolution-of-sport-data-from-performance-analysis-to-fan-engagement/",
        "title": "Exploring the Evolution of Sport Data: From Performance Analysis to Fan Engagement",
        "publisher": "Stats Perform",
        "source_type": "reputable_industry_source",
        "relevance_note": "Supports the football-data pathway from performance analysis to fan-facing engagement."
      },
      {
        "slot": 2,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11549348/",
        "title": "Forecasting extremes of football players' performance",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports football performance analytics and predictive modelling in tactical contexts."
      }
    ]
  },
  {
    "article_path": "articles/sports/legacy-transformation-historical-arc-global-sports-future.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.olympics.com/ioc/olympic-agenda-2020-plus-5",
        "title": "Olympic Agenda 2020+5",
        "publisher": "International Olympic Committee",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports the future-facing institutional transformation of global sport and the Olympic movement."
      },
      {
        "slot": 2,
        "url": "https://www.unesco.org/en/articles/sports-development",
        "title": "Sports for Development",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports sport as a force for development, peace and social transformation."
      }
    ]
  },
  {
    "article_path": "articles/sports/mental-health-initiatives-professional-sports-2026.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.olympics.com/ioc/news/ioc-announces-comprehensive-mental-health-support-for-athletes-at-milano-cortina-2026",
        "title": "IOC announces comprehensive mental health support for athletes at Milano Cortina 2026",
        "publisher": "International Olympic Committee",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports 2026-specific athlete mental-health initiatives in elite sport."
      },
      {
        "slot": 2,
        "url": "https://bjsm.bmj.com/content/59/21/1459",
        "title": "International Olympic Committee consensus-driven mental health recommendations for athletes at sporting events",
        "publisher": "British Journal of Sports Medicine / IOC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports evidence-based mental-health support programmes for athletes at major sporting events."
      }
    ]
  },
  {
    "article_path": "articles/sports/revolutionizing-athlete-recovery-ai-wearable-tech.html",
    "references": [
      {
        "slot": 1,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7859639/",
        "title": "Wearable Technology and Analytics as a Complementary Toolkit to Optimize Workload and to Reduce Injury Burden",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports wearable technology and analytics for recovery, workload and injury prevention."
      },
      {
        "slot": 2,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11151756/",
        "title": "Advanced biomechanical analytics: Wearable technologies for precision health monitoring in sports performance",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports advanced wearable monitoring and biomechanical analytics for athlete recovery and performance."
      }
    ]
  },
  {
    "article_path": "articles/sports/role-of-data-analytics-in-next-generation-athlete-performance.html",
    "references": [
      {
        "slot": 1,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7859639/",
        "title": "Wearable Technology and Analytics as a Complementary Toolkit to Optimize Workload and to Reduce Injury Burden",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports next-generation athlete performance monitoring through wearable and sensor-driven analytics."
      },
      {
        "slot": 2,
        "url": "https://www.mdpi.com/2076-3417/14/8/3361",
        "title": "Precision Sports Science: What Is Next for Data Analytics in Sports Performance?",
        "publisher": "Applied Sciences / MDPI",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports future-facing precision analytics for athlete performance improvement."
      }
    ]
  },
  {
    "article_path": "articles/world/from-multipolarity-to-new-world-orders.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.chathamhouse.org/2025/03/competing-visions-international-order/01-fracturing-us-led-liberal-international-order",
        "title": "Competing visions of international order",
        "publisher": "Chatham House",
        "source_type": "reputable_policy_think_tank",
        "relevance_note": "Supports the transition from a US-led liberal order toward contested visions of world order."
      },
      {
        "slot": 2,
        "url": "https://www.swp-berlin.org/publikation/multipolarities-the-world-order-visions-of-others",
        "title": "Multipolarities – The World-Order Visions of Others",
        "publisher": "German Institute for International and Security Affairs",
        "source_type": "reputable_policy_think_tank",
        "relevance_note": "Supports analysis of multipolarity and competing world-order visions."
      }
    ]
  },
  {
    "article_path": "articles/world/future-russia-west-relations-2026.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.chathamhouse.org/2025/07/understanding-russias-black-sea-strategy",
        "title": "Understanding Russia's Black Sea strategy",
        "publisher": "Chatham House",
        "source_type": "reputable_policy_think_tank",
        "relevance_note": "Supports long-term assessment of Russia's strategic posture and its implications for Europe and NATO."
      },
      {
        "slot": 2,
        "url": "https://www.nato-pa.int/document/2025-013-dsc-25-e-natos-future-russia-strategy-patterson-report",
        "title": "NATO's Future Russia Strategy",
        "publisher": "NATO Parliamentary Assembly",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports post-war Russia-West security framing and NATO's future Russia strategy."
      }
    ]
  },
  {
    "article_path": "articles/world/geopolitical-impact-china-belt-road-initiative-2026.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.cfr.org/articles/belt-and-road-tracker",
        "title": "Belt and Road Tracker",
        "publisher": "Council on Foreign Relations",
        "source_type": "reputable_policy_think_tank",
        "relevance_note": "Supports analysis of BRI's economic relationships, trade exposure and debt-linked influence."
      },
      {
        "slot": 2,
        "url": "https://openknowledge.worldbank.org/entities/publication/16252360-1cf1-546e-9978-9e57b5f32cec",
        "title": "The Belt and Road Initiative: Economic, Poverty and Environmental Impacts",
        "publisher": "World Bank",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports BRI's infrastructure, economic integration and development implications."
      }
    ]
  },
  {
    "article_path": "articles/world/geopolitical-implications-emerging-green-energy-alliances.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.iea.org/reports/global-critical-minerals-outlook-2025",
        "title": "Global Critical Minerals Outlook 2025",
        "publisher": "International Energy Agency",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports green-energy alliance geopolitics through critical minerals supply, demand and security."
      },
      {
        "slot": 2,
        "url": "https://www.irena.org/Publications/2023/Jul/Geopolitics-of-the-Energy-Transition-Critical-Materials",
        "title": "Geopolitics of the Energy Transition: Critical Materials",
        "publisher": "International Renewable Energy Agency",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports geopolitical implications of critical materials and renewable-energy transition alliances."
      }
    ]
  }
];

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

const config = readJson(registryPath);
const ag03a = readJson(path.join(root, config.input_files.ag03a_queue));
const ag03dB3 = readJson(path.join(root, config.input_files.ag03d_b4_audit));

if (ag03dB3.summary?.ready_for_ag03b_batch_5 !== true) {
  throw new Error("AG03D-B4 has not authorized AG03B Batch 5.");
}

const batch = (ag03a.batches || []).find((b) => b.batch_id === config.target_batch_id);
if (!batch) throw new Error(`Missing target batch: ${config.target_batch_id}`);

const queueByPath = new Map((ag03a.entries || []).map((entry) => [entry.article_path, entry]));
const candidatesByPath = new Map(CANDIDATE_REFS.map((entry) => [entry.article_path, entry]));

const entries = batch.article_paths.map((articlePath, index) => {
  const queueEntry = queueByPath.get(articlePath);
  if (!queueEntry) throw new Error(`Batch article missing from AG03A entries: ${articlePath}`);

  const candidateEntry = candidatesByPath.get(articlePath);
  if (!candidateEntry) throw new Error(`Missing AG03B-B5 candidates for: ${articlePath}`);

  const refs = candidateEntry.references.map((ref) => ({
    slot: ref.slot,
    url: ref.url,
    title: ref.title,
    publisher: ref.publisher,
    source_domain: domainOf(ref.url),
    source_type: ref.source_type,
    relevance_note: ref.relevance_note,
    credibility_note: "Source is official, institutional, multilateral, academic, research-based or public-interest oriented.",
    reachability_status: "manually_reachable_in_web_review",
    error_page_check: "no_error_page_observed_in_web_review",
    spam_or_parked_domain_check: "not_spam_not_parked",
    duplicate_within_article_check: "unique_within_article",
    verification_status: "verified_candidate_pending_article_insertion",
    article_insertion_status: "not_inserted_in_ag03b_b5"
  }));

  return {
    ag03b_b5_candidate_id: `AG03B_B5_REF_${String(index + 1).padStart(3, "0")}`,
    batch_id: config.target_batch_id,
    article_path: articlePath,
    category: queueEntry.category,
    title: queueEntry.title,
    current_public_verified_reference_count: queueEntry.current_public_verified_reference_count,
    required_verified_reference_count: queueEntry.required_verified_reference_count,
    candidate_reference_count: refs.length,
    candidate_population_status: "populated_for_review",
    article_insertion_status: "not_inserted_in_ag03b_b5",
    approved_for_article_insertion: false,
    references: refs
  };
});

const registry = {
  registry_id: "AG03B_B5_VERIFIED_REFERENCE_CANDIDATES",
  module_id: "AG03B-B5",
  status: "batch_05_verified_reference_candidates_populated_pending_review",
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
    ready_for_ag03c_b4_after_review: false
  },
  entries
};

const preview = {
  preview_id: "AG03B_B5_VERIFIED_REFERENCE_CANDIDATES_PREVIEW",
  module_id: "AG03B-B5",
  status: "preview_batch_05_reference_candidates_pending_review",
  preview_only: true,
  summary: registry.summary,
  entries: entries.map((entry) => ({
    article_path: entry.article_path,
    title: entry.title,
    candidate_reference_count: entry.candidate_reference_count,
    references: entry.references.map((ref) => ({
      slot: ref.slot,
      title: ref.title,
      publisher: ref.publisher,
      source_domain: ref.source_domain,
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
console.log("Ready for AG03C-B5 after review: false");
