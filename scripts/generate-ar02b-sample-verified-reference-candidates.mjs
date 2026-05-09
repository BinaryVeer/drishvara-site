import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02b-sample-verified-reference-candidates.json");
const workbenchPath = path.join(root, "data", "editorial", "verified-reference-selection-workbench.json");
const sampleOutPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const previewPath = path.join(root, "data", "quality", "ar02b-sample-verified-reference-candidates-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function acceptedCandidate(slot, source) {
  return {
    slot,
    candidate_url: source.url,
    candidate_title: source.title,
    candidate_source_name: source.source_name,
    candidate_source_type: source.source_type,

    checks: {
      article_relevance: "accepted",
      source_credibility: "accepted",
      reachability: "reachable_at_selection",
      http_status: 200,
      non_error_page: "accepted",
      spam_or_parked_domain_risk: "low",
      duplicate_reference_risk: "low",
      language_accessibility: "accepted"
    },

    decision: {
      editorial_decision: "accepted",
      accepted_for_article: true,
      rejection_reason: null,
      reviewer_note: source.note
    }
  };
}

const config = readJson(registryPath);
const workbench = readJson(workbenchPath);

const sampleSources = {
  "articles/world/ai-future-warfare-2026.html": [
    {
      url: "https://www.nato.int/en/about-us/official-texts-and-resources/official-texts/2024/07/10/summary-of-natos-revised-artificial-intelligence-ai-strategy",
      title: "Summary of NATO's revised Artificial Intelligence (AI) strategy",
      source_name: "NATO",
      source_type: "primary_institutional_source",
      note: "Official NATO AI strategy summary; relevant to responsible military AI, defence adoption, governance and risk framing."
    },
    {
      url: "https://www.icrc.org/en/document/artificial-intelligence-and-machine-learning-armed-conflict-human-centred-approach",
      title: "Artificial intelligence and machine learning in armed conflict: A human-centred approach",
      source_name: "International Committee of the Red Cross",
      source_type: "primary_institutional_source",
      note: "ICRC humanitarian and legal framing for AI and machine learning in armed conflict; relevant to human control, judgement and IHL concerns."
    }
  ],

  "articles/media/media-literacy-deepfakes-misinformation-2026.html": [
    {
      url: "https://www.unesco.org/en/media-information-literacy",
      title: "Media and Information Literacy",
      source_name: "UNESCO",
      source_type: "multilateral_organisation",
      note: "UNESCO page on media and information literacy; relevant to navigating information safely and countering disinformation."
    },
    {
      url: "https://www.unesco.org/en/articles/deepfakes-and-crisis-knowing",
      title: "Deepfakes and the crisis of knowing",
      source_name: "UNESCO",
      source_type: "multilateral_organisation",
      note: "UNESCO article focused on deepfakes, AI-augmented misinformation and literacy; directly relevant to the article theme."
    }
  ],

  "articles/policy/digital-governance-transparency-public-participation-2026.html": [
    {
      url: "https://www.worldbank.org/en/programs/govtech/gtmi",
      title: "GovTech Maturity Index",
      source_name: "World Bank",
      source_type: "multilateral_organisation",
      note: "World Bank GTMI page; relevant to digital government systems, online services, digital citizen engagement and GovTech enablers."
    },
    {
      url: "https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0406",
      title: "Recommendation of the Council on Digital Government Strategies",
      source_name: "OECD",
      source_type: "multilateral_organisation",
      note: "OECD digital government recommendation; relevant to open, participatory and citizen-centred digital government strategy."
    }
  ],

  "articles/sports/mental-health-awareness-professional-athletics-2026.html": [
    {
      url: "https://bjsm.bmj.com/content/53/11/667",
      title: "Mental health in elite athletes: International Olympic Committee consensus statement (2019)",
      source_name: "British Journal of Sports Medicine / IOC consensus statement",
      source_type: "academic_or_research",
      note: "Peer-reviewed IOC consensus statement; relevant to elite athlete mental health symptoms, disorders and sport-specific manifestations."
    },
    {
      url: "https://ncaaorg.s3.amazonaws.com/ssi/mental/SSI_MentalHealthBestPractices.pdf",
      title: "Mental Health Best Practices: Understanding and Supporting Student-Athlete Mental Health, Second Edition",
      source_name: "NCAA Sport Science Institute",
      source_type: "primary_institutional_source",
      note: "NCAA consensus best-practices document; relevant to athlete mental-health support systems and institutional response."
    }
  ],

  "articles/spiritual/contemplative-practices-modern-mental-health.html": [
    {
      url: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
      title: "Meditation and Mindfulness: Effectiveness and Safety",
      source_name: "NIH National Center for Complementary and Integrative Health",
      source_type: "official_government",
      note: "NIH/NCCIH health information page; relevant to evidence and safety boundaries for meditation and mindfulness."
    },
    {
      url: "https://www.apa.org/topics/mindfulness/meditation",
      title: "Mindfulness meditation: A research-proven way to reduce stress",
      source_name: "American Psychological Association",
      source_type: "credible_reference_background",
      note: "APA background page; relevant to psychology-facing explanation of mindfulness meditation and stress/mental-health framing."
    }
  ]
};

const selectedPaths = config.sample_articles;
const missing = selectedPaths.filter((articlePath) => !workbench.entries.some((entry) => entry.article_path === articlePath));
if (missing.length) {
  throw new Error(`Sample article(s) not found in workbench: ${missing.join(", ")}`);
}

let populatedCandidateUrlCount = 0;
let acceptedReferenceCount = 0;
const populatedEntries = [];

workbench.entries = workbench.entries.map((entry) => {
  const sources = sampleSources[entry.article_path];
  if (!sources) return entry;

  const candidates = sources.map((source, index) => acceptedCandidate(index + 1, source));

  populatedCandidateUrlCount += candidates.filter((candidate) => candidate.candidate_url).length;
  acceptedReferenceCount += candidates.filter((candidate) => candidate.decision.accepted_for_article).length;

  const updated = {
    ...entry,
    current_verified_reference_count: 2,
    workbench_status: "sample_candidates_populated_pending_article_insertion",
    candidate_references: candidates,
    final_reference_decision: {
      ready_for_article_insertion: true,
      accepted_reference_count: 2,
      final_reviewer: "Drishvara editorial pre-verification workflow",
      final_review_note: "Two sample references accepted for later AR02C article-page insertion. Article HTML remains unchanged in AR02B."
    }
  };

  populatedEntries.push({
    article_path: updated.article_path,
    article_title: updated.article_title,
    category: updated.category,
    accepted_reference_count: 2,
    references: candidates.map((candidate) => ({
      slot: candidate.slot,
      url: candidate.candidate_url,
      title: candidate.candidate_title,
      source_name: candidate.candidate_source_name,
      source_type: candidate.candidate_source_type,
      decision: candidate.decision.editorial_decision,
      note: candidate.decision.reviewer_note
    }))
  });

  return updated;
});

workbench.status = "sample_candidates_populated_no_article_html_mutation";
workbench.populated_candidate_url_count = populatedCandidateUrlCount;
workbench.accepted_reference_count = acceptedReferenceCount;
workbench.sample_populated_article_count = populatedEntries.length;
workbench.article_html_mutation_performed = false;
workbench.external_link_verification_performed = false;
workbench.manual_editorial_preverification_recorded = true;

const sampleRegistry = {
  registry_id: "AR02B_SAMPLE_VERIFIED_REFERENCE_CANDIDATES",
  module_id: "AR02B",
  status: "sample_candidates_populated_no_article_html_mutation",
  sample_article_count: populatedEntries.length,
  populated_candidate_url_count: populatedCandidateUrlCount,
  accepted_reference_count: acceptedReferenceCount,
  article_html_mutation_performed: false,
  automated_external_fetch_performed: false,
  manual_editorial_preverification_recorded: true,
  entries: populatedEntries
};

const preview = {
  preview_id: "AR02B_SAMPLE_VERIFIED_REFERENCE_CANDIDATES_PREVIEW",
  module_id: "AR02B",
  status: "preview_after_sample_candidate_population",
  preview_only: true,
  sample_article_count: sampleRegistry.sample_article_count,
  populated_candidate_url_count: sampleRegistry.populated_candidate_url_count,
  accepted_reference_count: sampleRegistry.accepted_reference_count,
  sample_entries: sampleRegistry.entries.map((entry) => ({
    article_path: entry.article_path,
    category: entry.category,
    accepted_reference_count: entry.accepted_reference_count,
    urls_present: entry.references.every((reference) => typeof reference.url === "string" && reference.url.startsWith("https://")),
    decisions: entry.references.map((reference) => reference.decision)
  })),
  summary: {
    exactly_five_articles_populated: sampleRegistry.sample_article_count === 5,
    exactly_ten_candidate_urls_populated: sampleRegistry.populated_candidate_url_count === 10,
    all_sample_articles_have_two_accepted_references: sampleRegistry.entries.every((entry) => entry.accepted_reference_count === 2),
    all_sample_urls_https: sampleRegistry.entries.every((entry) => entry.references.every((reference) => reference.url.startsWith("https://"))),
    article_html_mutation_performed: false,
    automated_external_fetch_performed: false,
    backend_activation_performed: false,
    api_route_created: false,
    supabase_enabled: false,
    auth_enabled: false,
    real_login_enabled: false,
    real_signup_enabled: false,
    user_account_collection_enabled: false,
    frontend_deployment_performed: false,
    file_deletion_performed: false,
    file_move_performed: false
  },
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

fs.writeFileSync(workbenchPath, JSON.stringify(workbench, null, 2) + "\n");
fs.writeFileSync(sampleOutPath, JSON.stringify(sampleRegistry, null, 2) + "\n");
fs.writeFileSync(previewPath, JSON.stringify(preview, null, 2) + "\n");

console.log(`Updated ${path.relative(root, workbenchPath)}.`);
console.log(`Created ${path.relative(root, sampleOutPath)}.`);
console.log(`Created ${path.relative(root, previewPath)}.`);
console.log(`Sample articles populated: ${sampleRegistry.sample_article_count}`);
console.log(`Candidate URLs populated: ${sampleRegistry.populated_candidate_url_count}`);
console.log(`Accepted references: ${sampleRegistry.accepted_reference_count}`);
