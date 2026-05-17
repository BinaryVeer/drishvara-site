import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "ag03b-b3-verified-reference-candidate-population.json");

const CANDIDATE_REFS = [
  {
    "article_path": "articles/policy/reimagining-urban-public-transport-sustainability-accessibility-challenges.html",
    "references": [
      {
        "slot": 1,
        "url": "https://unhabitat.org/topic/mobility-and-transport",
        "title": "Mobility and Transport",
        "publisher": "UN-Habitat",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports the role of accessible and sustainable public transport in urban mobility systems."
      },
      {
        "slot": 2,
        "url": "https://www.worldbank.org/ext/en/topic/transport",
        "title": "Transport",
        "publisher": "World Bank",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports safe, sustainable and inclusive transport systems connecting people to services and opportunity."
      }
    ]
  },
  {
    "article_path": "articles/policy/reimagining-urban-public-transport-sustainable-models.html",
    "references": [
      {
        "slot": 1,
        "url": "https://unhabitat.org/planning-and-design-for-sustainable-urban-mobility-global-report-on-human-settlements-2013",
        "title": "Planning and Design for Sustainable Urban Mobility",
        "publisher": "UN-Habitat",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports sustainable urban mobility planning and public transport-oriented urban development."
      },
      {
        "slot": 2,
        "url": "https://www.worldbank.org/en/results/2024/03/13/promoting-livable-cities-by-investing-in-urban-mobility",
        "title": "Promoting Livable Cities by Investing in Urban Mobility",
        "publisher": "World Bank",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports mass transit and public transport investments as part of livable and sustainable urban models."
      }
    ]
  },
  {
    "article_path": "articles/policy/scaling-community-healthcare-outreach.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.who.int/teams/health-workforce/community",
        "title": "Community-based health workers",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports community health worker programmes as a mechanism for extending healthcare outreach."
      },
      {
        "slot": 2,
        "url": "https://www.who.int/news-room/fact-sheets/detail/primary-health-care",
        "title": "Primary health care",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports community-level, people-centred healthcare delivery close to everyday environments."
      }
    ]
  },
  {
    "article_path": "articles/policy/welfare-state-evolution-historical-lessons-institutional-comparisons.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.ilo.org/sites/default/files/2024-09/WSPR_2024_EN_WEB_1.pdf",
        "title": "World Social Protection Report 2024–26",
        "publisher": "International Labour Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports comparative social protection and welfare-state evolution across institutional contexts."
      },
      {
        "slot": 2,
        "url": "https://www.oecd.org/en/data/datasets/social-expenditure-database-socx.html",
        "title": "Social Expenditure Database",
        "publisher": "OECD",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports cross-country welfare-state comparison through social expenditure data."
      }
    ]
  },
  {
    "article_path": "articles/policy/when-implementation-tells-the-real-story.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.oecd.org/en/topics/governance.html",
        "title": "Governance",
        "publisher": "OECD",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports policy implementation, public-sector delivery and governance-capacity framing."
      },
      {
        "slot": 2,
        "url": "https://ieg.worldbankgroup.org/page/ieg-data-world-bank-project-lessons",
        "title": "IEG Data: World Bank Project Lessons",
        "publisher": "Independent Evaluation Group, World Bank",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports implementation learning through project completion, evaluation and lesson records."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/contemplating-impermanence-path-spiritual-liberation.html",
    "references": [
      {
        "slot": 1,
        "url": "https://plato.stanford.edu/archives/spr2022/entries/abhidharma/",
        "title": "Abhidharma",
        "publisher": "Stanford Encyclopedia of Philosophy",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports impermanence as a foundational Buddhist analysis of experience."
      },
      {
        "slot": 2,
        "url": "https://www.britannica.com/topic/anicca",
        "title": "Anicca",
        "publisher": "Encyclopaedia Britannica",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports the doctrine of impermanence and its relation to Buddhist spiritual insight."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/contemplative-silence-rediscovering-inner-clarity.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
        "title": "Meditation and Mindfulness: Effectiveness and Safety",
        "publisher": "National Center for Complementary and Integrative Health",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports meditation and mindfulness as contemplative practices affecting calmness, attention and well-being."
      },
      {
        "slot": 2,
        "url": "https://www.apa.org/topics/mindfulness",
        "title": "Mindfulness",
        "publisher": "American Psychological Association",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports mindfulness as awareness of internal states and surroundings."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/how-attention-becomes-worship.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
        "title": "Meditation and Mindfulness: Effectiveness and Safety",
        "publisher": "National Center for Complementary and Integrative Health",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports meditation as training of attention and awareness."
      },
      {
        "slot": 2,
        "url": "https://www.apa.org/topics/mindfulness/meditation",
        "title": "Mindfulness meditation",
        "publisher": "American Psychological Association",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports focused awareness and mindfulness practice as a disciplined mode of attention."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/integrating-mindfulness-daily-routines-spiritual-growth.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.nccih.nih.gov/health/tips/8-things-to-know-about-meditation-and-mindfulness",
        "title": "8 Things to Know About Meditation and Mindfulness",
        "publisher": "National Center for Complementary and Integrative Health",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports practical and safety-aware integration of meditation and mindfulness."
      },
      {
        "slot": 2,
        "url": "https://newsinhealth.nih.gov/2021/06/mindfulness-your-health",
        "title": "Mindfulness for Your Health",
        "publisher": "National Institutes of Health",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports everyday mindfulness practices and potential health and well-being benefits."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/resurgence-ancient-meditation-modern-mental-health.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.apa.org/topics/mindfulness/meditation",
        "title": "Mindfulness meditation",
        "publisher": "American Psychological Association",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports modern mental-health relevance of mindfulness meditation."
      },
      {
        "slot": 2,
        "url": "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
        "title": "Meditation and Mindfulness: Effectiveness and Safety",
        "publisher": "National Center for Complementary and Integrative Health",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports evidence-informed discussion of meditation, anxiety, depression and safety considerations."
      }
    ]
  },
  {
    "article_path": "articles/spiritual/resurgence-contemplative-practices-modern-urban-life.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.apa.org/topics/mindfulness",
        "title": "Mindfulness",
        "publisher": "American Psychological Association",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports mindfulness as a practical awareness discipline relevant to modern life."
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
    "article_path": "articles/spiritual/resurgence-mindfulness-modern-spiritual-practice.html",
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
        "url": "https://www.apa.org/topics/mindfulness/meditation",
        "title": "Mindfulness meditation",
        "publisher": "American Psychological Association",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports contemporary psychology-based understanding of mindfulness meditation."
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
const ag03dB2 = readJson(path.join(root, config.input_files.ag03d_b2_audit));

if (ag03dB2.summary?.ready_for_ag03b_batch_3 !== true) {
  throw new Error("AG03D-B2 has not authorized AG03B Batch 3.");
}

const batch = (ag03a.batches || []).find((b) => b.batch_id === config.target_batch_id);
if (!batch) throw new Error(`Missing target batch: ${config.target_batch_id}`);

const queueByPath = new Map((ag03a.entries || []).map((entry) => [entry.article_path, entry]));
const candidatesByPath = new Map(CANDIDATE_REFS.map((entry) => [entry.article_path, entry]));

const entries = batch.article_paths.map((articlePath, index) => {
  const queueEntry = queueByPath.get(articlePath);
  if (!queueEntry) throw new Error(`Batch article missing from AG03A entries: ${articlePath}`);

  const candidateEntry = candidatesByPath.get(articlePath);
  if (!candidateEntry) throw new Error(`Missing AG03B-B3 candidates for: ${articlePath}`);

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
    article_insertion_status: "not_inserted_in_ag03b_b3"
  }));

  return {
    ag03b_b3_candidate_id: `AG03B_B3_REF_${String(index + 1).padStart(3, "0")}`,
    batch_id: config.target_batch_id,
    article_path: articlePath,
    category: queueEntry.category,
    title: queueEntry.title,
    current_public_verified_reference_count: queueEntry.current_public_verified_reference_count,
    required_verified_reference_count: queueEntry.required_verified_reference_count,
    candidate_reference_count: refs.length,
    candidate_population_status: "populated_for_review",
    article_insertion_status: "not_inserted_in_ag03b_b3",
    approved_for_article_insertion: false,
    references: refs
  };
});

const registry = {
  registry_id: "AG03B_B3_VERIFIED_REFERENCE_CANDIDATES",
  module_id: "AG03B-B3",
  status: "batch_03_verified_reference_candidates_populated_pending_review",
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
    ready_for_ag03c_b3_after_review: false
  },
  entries
};

const preview = {
  preview_id: "AG03B_B3_VERIFIED_REFERENCE_CANDIDATES_PREVIEW",
  module_id: "AG03B-B3",
  status: "preview_batch_03_reference_candidates_pending_review",
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
console.log("Ready for AG03C-B3 after review: false");
