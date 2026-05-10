import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "ag03b-batch-01-verified-reference-candidate-population.json");

const CANDIDATE_REFS = [
  {
    "article_path": "articles/media/algorithmic-bias-content-curation-fair-representation.html",
    "references": [
      {
        "slot": 1,
        "url": "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act",
        "title": "The Digital Services Act",
        "publisher": "European Commission",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports discussion of platform accountability, online safety and content-governance obligations."
      },
      {
        "slot": 2,
        "url": "https://algorithmic-transparency.ec.europa.eu/index_en",
        "title": "European Centre for Algorithmic Transparency",
        "publisher": "European Commission",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Directly supports algorithmic transparency, recommender-system accountability and fairness concerns."
      }
    ]
  },
  {
    "article_path": "articles/media/ethics-ai-generated-content-journalism-public-discourse.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
        "title": "Recommendation on the Ethics of Artificial Intelligence",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports ethical principles for AI systems affecting communication, society and public discourse."
      },
      {
        "slot": 2,
        "url": "https://reutersinstitute.politics.ox.ac.uk/ai-journalism-future-news",
        "title": "AI and the Future of News",
        "publisher": "Reuters Institute for the Study of Journalism",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports journalism-specific discussion of generative AI and public attitudes toward AI in news."
      }
    ]
  },
  {
    "article_path": "articles/media/ethics-ai-generated-content-journalism-society.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
        "title": "Recommendation on the Ethics of Artificial Intelligence",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports broad ethical framing of AI-generated content and societal impact."
      },
      {
        "slot": 2,
        "url": "https://www.nist.gov/itl/ai-risk-management-framework",
        "title": "AI Risk Management Framework",
        "publisher": "National Institute of Standards and Technology",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports risk-management framing for trustworthy, fair and accountable AI systems."
      }
    ]
  },
  {
    "article_path": "articles/media/ethics-ai-generated-content-journalism.html",
    "references": [
      {
        "slot": 1,
        "url": "https://reutersinstitute.politics.ox.ac.uk/ai-journalism-future-news",
        "title": "AI and the Future of News",
        "publisher": "Reuters Institute for the Study of Journalism",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports journalism-specific concerns about generative AI adoption and trust."
      },
      {
        "slot": 2,
        "url": "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
        "title": "Recommendation on the Ethics of Artificial Intelligence",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports ethical principles relevant to AI-generated media and human oversight."
      }
    ]
  },
  {
    "article_path": "articles/media/ethics-ai-generated-news-speed-accuracy.html",
    "references": [
      {
        "slot": 1,
        "url": "https://reutersinstitute.politics.ox.ac.uk/ai-journalism-future-news",
        "title": "AI and the Future of News",
        "publisher": "Reuters Institute for the Study of Journalism",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports the specific question of AI use in news production and journalism workflows."
      },
      {
        "slot": 2,
        "url": "https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2025",
        "title": "Digital News Report 2025",
        "publisher": "Reuters Institute for the Study of Journalism",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports public trust, digital news consumption and credibility issues."
      }
    ]
  },
  {
    "article_path": "articles/media/impact-ai-generated-content-news-credibility-public-trust.html",
    "references": [
      {
        "slot": 1,
        "url": "https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2025",
        "title": "Digital News Report 2025",
        "publisher": "Reuters Institute for the Study of Journalism",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports discussion of public trust, news credibility and digital news behaviour."
      },
      {
        "slot": 2,
        "url": "https://www.nist.gov/itl/ai-risk-management-framework",
        "title": "AI Risk Management Framework",
        "publisher": "National Institute of Standards and Technology",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports discussion of trustworthiness, transparency, accountability and AI risk."
      }
    ]
  },
  {
    "article_path": "articles/media/impact-algorithmic-content-curation-public-discourse-democracy.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.unesco.org/en/internet-trust/guidelines",
        "title": "Guidelines for the Governance of Digital Platforms",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports platform governance, access to information, misinformation and democratic discourse."
      },
      {
        "slot": 2,
        "url": "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act",
        "title": "The Digital Services Act",
        "publisher": "European Commission",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports accountability and systemic-risk framing for large online platforms."
      }
    ]
  },
  {
    "article_path": "articles/media/impact-algorithmic-curation-public-discourse-democracy.html",
    "references": [
      {
        "slot": 1,
        "url": "https://algorithmic-transparency.ec.europa.eu/index_en",
        "title": "European Centre for Algorithmic Transparency",
        "publisher": "European Commission",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports algorithmic transparency and democratic oversight of recommender systems."
      },
      {
        "slot": 2,
        "url": "https://www.unesco.org/en/internet-trust/guidelines",
        "title": "Guidelines for the Governance of Digital Platforms",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports multi-stakeholder governance of platforms affecting public discourse."
      }
    ]
  },
  {
    "article_path": "articles/media/media-role-shaping-democracy-historical-institutional-consequences.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.coe.int/en/web/freedom-expression/public-service-media",
        "title": "Public Service Media",
        "publisher": "Council of Europe",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports the democratic role of media, freedom of expression and social cohesion."
      },
      {
        "slot": 2,
        "url": "https://www.coe.int/en/web/freedom-expression/digest-council-of-europe-standards-on-public-service-media",
        "title": "Council of Europe Standards on Public Service Media",
        "publisher": "Council of Europe",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports institutional standards for media pluralism, governance and democratic media systems."
      }
    ]
  },
  {
    "article_path": "articles/media/role-public-media-combating-misinformation-digital-age.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.ebu.ch/topics/news-journalism-and-trust",
        "title": "News, Journalism and Trust",
        "publisher": "European Broadcasting Union",
        "source_type": "reputable_policy_think_tank",
        "relevance_note": "Supports the role of public service media and reliable journalism against disinformation."
      },
      {
        "slot": 2,
        "url": "https://www.unesco.org/en/internet-trust/guidelines",
        "title": "Guidelines for the Governance of Digital Platforms",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports misinformation governance and freedom-of-expression safeguards on digital platforms."
      }
    ]
  },
  {
    "article_path": "articles/media/role-public-media-countering-disinformation-digital-age.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.ebu.ch/publications/trust-in-media",
        "title": "Trust in Media",
        "publisher": "European Broadcasting Union",
        "source_type": "reputable_policy_think_tank",
        "relevance_note": "Supports trust in public service media in an environment of information overload and disinformation."
      },
      {
        "slot": 2,
        "url": "https://www.coe.int/en/web/freedom-expression/public-service-media",
        "title": "Public Service Media",
        "publisher": "Council of Europe",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports democratic and institutional role of public service media."
      }
    ]
  },
  {
    "article_path": "articles/media/role-public-media-countering-misinformation.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.ebu.ch/topics/news-journalism-and-trust",
        "title": "News, Journalism and Trust",
        "publisher": "European Broadcasting Union",
        "source_type": "reputable_policy_think_tank",
        "relevance_note": "Supports the public-service journalism role in countering misinformation."
      },
      {
        "slot": 2,
        "url": "https://www.pewresearch.org/journalism/fact-sheet/social-media-and-news-fact-sheet/",
        "title": "Social Media and News Fact Sheet",
        "publisher": "Pew Research Center",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports context on social media as a news environment and audience behaviour."
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
const ar02b = readJson(path.join(root, config.input_files.ar02b_sample_registry));

const batch = (ag03a.batches || []).find((b) => b.batch_id === config.target_batch_id);
if (!batch) throw new Error(`Missing target batch: ${config.target_batch_id}`);

const queueByPath = new Map((ag03a.entries || []).map((entry) => [entry.article_path, entry]));
const samplePaths = new Set((ar02b.entries || []).map((entry) => entry.article_path));
const candidatesByPath = new Map(CANDIDATE_REFS.map((entry) => [entry.article_path, entry]));

const entries = batch.article_paths.map((articlePath, index) => {
  const queueEntry = queueByPath.get(articlePath);
  if (!queueEntry) throw new Error(`Batch article missing from AG03A entries: ${articlePath}`);

  const candidateEntry = candidatesByPath.get(articlePath);
  if (!candidateEntry) throw new Error(`Missing AG03B candidates for: ${articlePath}`);

  const refs = candidateEntry.references.map((ref) => ({
    slot: ref.slot,
    url: ref.url,
    title: ref.title,
    publisher: ref.publisher,
    source_domain: domainOf(ref.url),
    source_type: ref.source_type,
    relevance_note: ref.relevance_note,
    credibility_note: "Source is official, institutional, multilateral, research-based or public-interest oriented.",
    reachability_status: "manually_reachable_in_web_review",
    error_page_check: "no_error_page_observed_in_web_review",
    spam_or_parked_domain_check: "not_spam_not_parked",
    duplicate_within_article_check: "unique_within_article",
    verification_status: "verified_candidate_pending_article_insertion",
    article_insertion_status: "not_inserted_in_ag03b"
  }));

  return {
    ag03b_candidate_id: `AG03B_BATCH01_REF_${String(index + 1).padStart(3, "0")}`,
    batch_id: config.target_batch_id,
    article_path: articlePath,
    category: queueEntry.category,
    title: queueEntry.title,
    ar02b_sample_article: samplePaths.has(articlePath),
    current_public_verified_reference_count: queueEntry.current_public_verified_reference_count,
    required_verified_reference_count: queueEntry.required_verified_reference_count,
    candidate_reference_count: refs.length,
    candidate_population_status: "populated_for_review",
    article_insertion_status: "not_inserted_in_ag03b",
    approved_for_article_insertion: false,
    references: refs
  };
});

const registry = {
  registry_id: "AG03B_BATCH_01_VERIFIED_REFERENCE_CANDIDATES",
  module_id: "AG03B",
  status: "batch_01_verified_reference_candidates_populated_pending_review",
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
    sample_article_count: entries.filter((entry) => entry.ar02b_sample_article).length,
    approved_for_article_insertion_count: entries.filter((entry) => entry.approved_for_article_insertion).length,
    article_reference_insertion_performed: false,
    ready_for_ag03c_after_review: false
  },
  entries
};

const preview = {
  preview_id: "AG03B_BATCH_01_VERIFIED_REFERENCE_CANDIDATES_PREVIEW",
  module_id: "AG03B",
  status: "preview_batch_01_reference_candidates_pending_review",
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
console.log("Ready for AG03C after review: false");
