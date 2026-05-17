import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "ag03b-b4-verified-reference-candidate-population.json");

const CANDIDATE_REFS = [
  {
    "article_path": "articles/spiritual/revival-ancient-meditation-modern-urban-life.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
        "title": "Meditation and Mindfulness: Effectiveness and Safety",
        "publisher": "National Center for Complementary and Integrative Health",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports the revival of meditation and mindfulness in contemporary health and urban-life settings."
      },
      {
        "slot": 2,
        "url": "https://www.apa.org/topics/mindfulness/meditation",
        "title": "Mindfulness meditation",
        "publisher": "American Psychological Association",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports the psychological understanding of mindfulness meditation and its modern relevance."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/role-of-contemplative-practices-in-modern-mental-health-care.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
        "title": "Meditation and Mindfulness: Effectiveness and Safety",
        "publisher": "National Center for Complementary and Integrative Health",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports evidence-informed discussion of meditation, anxiety, depression and safety considerations."
      },
      {
        "slot": 2,
        "url": "https://www.apa.org/topics/mindfulness",
        "title": "Mindfulness",
        "publisher": "American Psychological Association",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports mindfulness as awareness of internal states and surroundings, relevant to mental-health care."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/role-of-mindfulness-in-modern-spiritual-practice.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.apa.org/topics/mindfulness",
        "title": "Mindfulness",
        "publisher": "American Psychological Association",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports mindfulness as disciplined awareness relevant to modern spiritual practice."
      },
      {
        "slot": 2,
        "url": "https://www.nccih.nih.gov/health/tips/8-things-to-know-about-meditation-and-mindfulness",
        "title": "8 Things to Know About Meditation and Mindfulness",
        "publisher": "National Center for Complementary and Integrative Health",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports practical and safety-aware integration of mindfulness and meditation."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/role-of-mindfulness-in-modern-spiritual-practices.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
        "title": "Meditation and Mindfulness: Effectiveness and Safety",
        "publisher": "National Center for Complementary and Integrative Health",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports mindfulness and meditation as modern contemplative practices with evidence and safety considerations."
      },
      {
        "slot": 2,
        "url": "https://newsinhealth.nih.gov/2021/06/mindfulness-your-health",
        "title": "Mindfulness for Your Health",
        "publisher": "National Institutes of Health",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports the role of mindfulness in stress, sleep, pain and day-to-day well-being."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/spiritual-ecology-nurturing-nature-soul-connection.html",
    "references": [
      {
        "slot": 1,
        "url": "https://fore.yale.edu/Front-Page",
        "title": "Yale Forum on Religion and Ecology",
        "publisher": "Yale University",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports spiritual ecology through the academic field of religion, ecology and environmental ethics."
      },
      {
        "slot": 2,
        "url": "https://fore.yale.edu/files/Religion_and_Ecology-Oxford_Bibliography.pdf",
        "title": "Religion and Ecology",
        "publisher": "Oxford Bibliographies / Yale Forum on Religion and Ecology",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports spiritual or religious ecology as values and practices regarding nature and human responsibility."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/tracing-evolution-civilizational-wisdom-spirituality.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.unesco.org/en/silkroads",
        "title": "The UNESCO Silk Roads Programme",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports civilizational exchange, shared legacies and cultural enrichment across societies."
      },
      {
        "slot": 2,
        "url": "https://ich.unesco.org/en/sustainable-development-and-living-heritage",
        "title": "Sustainable development and living heritage",
        "publisher": "UNESCO Intangible Cultural Heritage",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports living heritage, traditional knowledge and cultural practices as sources of resilience and meaning."
      }
    ]
  },
  {
    "article_path": "articles/sports/data-analytics-athlete-performance.html",
    "references": [
      {
        "slot": 1,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7859639/",
        "title": "Wearable Technology and Analytics as a Complementary Toolkit to Optimize Workload and to Reduce Injury Burden",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports athlete-performance analytics through wearable monitoring and workload optimisation."
      },
      {
        "slot": 2,
        "url": "https://www.mdpi.com/2076-3417/14/8/3361",
        "title": "Precision Sports Science: What Is Next for Data Analytics in Sports Performance?",
        "publisher": "Applied Sciences / MDPI",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports sports performance analytics, data-driven monitoring and athlete optimisation."
      }
    ]
  },
  {
    "article_path": "articles/sports/evolution-athlete-mental-health-programs-professional-sports.html",
    "references": [
      {
        "slot": 1,
        "url": "https://bjsm.bmj.com/content/bjsports/53/11/667.full.pdf",
        "title": "Mental health in elite athletes: International Olympic Committee consensus statement",
        "publisher": "British Journal of Sports Medicine / IOC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports athlete mental-health programmes, elite-sport stressors and clinical recommendations."
      },
      {
        "slot": 2,
        "url": "https://www.ncaa.org/sports/2016/5/2/mental-health-best-practices.aspx",
        "title": "Mental Health Best Practices",
        "publisher": "NCAA Sport Science Institute",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports structured athlete mental-health support, policy and best-practice programme design."
      }
    ]
  },
  {
    "article_path": "articles/sports/evolution-athlete-recovery-innovations-peak-performance.html",
    "references": [
      {
        "slot": 1,
        "url": "https://bjsm.bmj.com/content/55/7/356",
        "title": "Sleep and the athlete: narrative review and 2021 expert consensus recommendations",
        "publisher": "British Journal of Sports Medicine",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports sleep as a recovery and performance factor for athletes."
      },
      {
        "slot": 2,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8072992/",
        "title": "The Sleep and Recovery Practices of Athletes",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports athlete recovery practices, fatigue management and performance preparation."
      }
    ]
  },
  {
    "article_path": "articles/sports/evolution-athlete-recovery-science-innovation.html",
    "references": [
      {
        "slot": 1,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8072992/",
        "title": "The Sleep and Recovery Practices of Athletes",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports recovery science through rest, sleep and athlete practice patterns."
      },
      {
        "slot": 2,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC9960533/",
        "title": "Sleep and Athletic Performance: Impacts on Physical Performance, Mental Performance, Injury Risk and Recovery",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports the relationship between sleep, recovery, injury risk and athletic performance."
      }
    ]
  },
  {
    "article_path": "articles/sports/evolution-athlete-recovery-science-technology-policy.html",
    "references": [
      {
        "slot": 1,
        "url": "https://bjsm.bmj.com/content/54/7/372",
        "title": "International Olympic Committee consensus statement: methods for recording and reporting of epidemiological data on injury and illness in sport 2020",
        "publisher": "British Journal of Sports Medicine / IOC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports standardised sport injury and illness surveillance, relevant to recovery policy and athlete health governance."
      },
      {
        "slot": 2,
        "url": "https://bjsm.bmj.com/content/57/11/695",
        "title": "Consensus statement on concussion in sport: the 6th International Conference on Concussion in Sport",
        "publisher": "British Journal of Sports Medicine",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports evolving recovery and return-to-sport protocols in sport policy and medicine."
      }
    ]
  },
  {
    "article_path": "articles/sports/evolution-of-sports-analytics-beyond-the-numbers.html",
    "references": [
      {
        "slot": 1,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7859639/",
        "title": "Wearable Technology and Analytics as a Complementary Toolkit to Optimize Workload and to Reduce Injury Burden",
        "publisher": "National Library of Medicine / PMC",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports analytics beyond raw numbers through workload, exertion and injury-risk monitoring."
      },
      {
        "slot": 2,
        "url": "https://www.acsm.org/education-resources/trending-topics-resources/acsm-fitness-trends/",
        "title": "ACSM Fitness Trends",
        "publisher": "American College of Sports Medicine",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports the broader trend of wearable technology and data-informed fitness/performance practice."
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
const ag03dB3 = readJson(path.join(root, config.input_files.ag03d_b3_audit));

if (ag03dB3.summary?.ready_for_ag03b_batch_4 !== true) {
  throw new Error("AG03D-B3 has not authorized AG03B Batch 4.");
}

const batch = (ag03a.batches || []).find((b) => b.batch_id === config.target_batch_id);
if (!batch) throw new Error(`Missing target batch: ${config.target_batch_id}`);

const queueByPath = new Map((ag03a.entries || []).map((entry) => [entry.article_path, entry]));
const candidatesByPath = new Map(CANDIDATE_REFS.map((entry) => [entry.article_path, entry]));

const entries = batch.article_paths.map((articlePath, index) => {
  const queueEntry = queueByPath.get(articlePath);
  if (!queueEntry) throw new Error(`Batch article missing from AG03A entries: ${articlePath}`);

  const candidateEntry = candidatesByPath.get(articlePath);
  if (!candidateEntry) throw new Error(`Missing AG03B-B4 candidates for: ${articlePath}`);

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
    article_insertion_status: "not_inserted_in_ag03b_b4"
  }));

  return {
    ag03b_b4_candidate_id: `AG03B_B4_REF_${String(index + 1).padStart(3, "0")}`,
    batch_id: config.target_batch_id,
    article_path: articlePath,
    category: queueEntry.category,
    title: queueEntry.title,
    current_public_verified_reference_count: queueEntry.current_public_verified_reference_count,
    required_verified_reference_count: queueEntry.required_verified_reference_count,
    candidate_reference_count: refs.length,
    candidate_population_status: "populated_for_review",
    article_insertion_status: "not_inserted_in_ag03b_b4",
    approved_for_article_insertion: false,
    references: refs
  };
});

const registry = {
  registry_id: "AG03B_B4_VERIFIED_REFERENCE_CANDIDATES",
  module_id: "AG03B-B4",
  status: "batch_04_verified_reference_candidates_populated_pending_review",
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
  preview_id: "AG03B_B4_VERIFIED_REFERENCE_CANDIDATES_PREVIEW",
  module_id: "AG03B-B4",
  status: "preview_batch_04_reference_candidates_pending_review",
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
console.log("Ready for AG03C-B4 after review: false");
