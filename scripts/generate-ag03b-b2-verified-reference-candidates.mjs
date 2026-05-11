import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "ag03b-b2-verified-reference-candidate-population.json");

const CANDIDATE_REFS = [
  {
    "article_path": "articles/media/role-public-media-upholding-democratic-values-digital-age.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.coe.int/en/web/freedom-expression/public-service-media",
        "title": "Public Service Media",
        "publisher": "Council of Europe",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports the democratic, pluralistic and freedom-of-expression role of public service media."
      },
      {
        "slot": 2,
        "url": "https://digital-strategy.ec.europa.eu/en/policies/democracy-digital",
        "title": "Defending democratic values in the digital age",
        "publisher": "European Commission",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports digital-age democracy, media pluralism, societal resilience and information-space integrity."
      }
    ]
  },
  {
    "article_path": "articles/media/social-media-political-polarization-2026.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.pewresearch.org/internet/2024/06/12/how-americans-navigate-politics-on-tiktok-x-facebook-and-instagram/",
        "title": "How Americans Navigate Politics on TikTok, X, Facebook and Instagram",
        "publisher": "Pew Research Center",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports analysis of how social platforms shape political exposure and participation."
      },
      {
        "slot": 2,
        "url": "https://www.pewresearch.org/topic/politics-policy/political-parties-polarization/political-polarization/",
        "title": "Political Polarization",
        "publisher": "Pew Research Center",
        "source_type": "academic_or_research_institution",
        "relevance_note": "Supports the broader theme of polarization and democratic public mood."
      }
    ]
  },
  {
    "article_path": "articles/media/what-narratives-make-visible.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.unesco.org/en/internet-trust/guidelines",
        "title": "Guidelines for the Governance of Digital Platforms",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports discussion of platform governance, visibility, information integrity and public narratives."
      },
      {
        "slot": 2,
        "url": "https://www.coe.int/en/web/freedom-expression/public-service-media",
        "title": "Public Service Media",
        "publisher": "Council of Europe",
        "source_type": "official_government_or_institutional_source",
        "relevance_note": "Supports media's role in making public-interest issues visible within democratic discourse."
      }
    ]
  },
  {
    "article_path": "articles/policy/advancing-digital-literacy-public-education-2026.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.unesco.org/gem-report/en/publication/tecnologia-en-la-educacion-una-herramienta-nuestra-medida-2024",
        "title": "2024 Technology in education: A tool on our terms!",
        "publisher": "UNESCO Global Education Monitoring Report",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports responsible, equitable and learner-centred use of technology in education."
      },
      {
        "slot": 2,
        "url": "https://www.unesco.org/en/digital-education",
        "title": "AI and technologies in education",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports digital learning policy, digital competency and critical-thinking dimensions of public education."
      }
    ]
  },
  {
    "article_path": "articles/policy/digital-literacy-initiatives-bridging-urban-rural-divide.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.unesco.org/en/digital-education",
        "title": "AI and technologies in education",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports digital learning policy in disadvantaged settings and digital competency building."
      },
      {
        "slot": 2,
        "url": "https://www.unesco.org/sites/default/files/medias/fichiers/2024/10/GEM%202024%20-%20Accessibility%20and%20effective%20use%20of%20digital%20technology%20in%20education%20-%20web_1.pdf",
        "title": "Accessibility and effective use of digital technology in education",
        "publisher": "UNESCO",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports the urban-rural digital divide theme through accessibility and equitable use of technology in education."
      }
    ]
  },
  {
    "article_path": "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.who.int/publications/i/item/9789240020924",
        "title": "Global strategy on digital health 2020-2025",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports the use of digital health strategies to strengthen access, quality and health-system performance."
      },
      {
        "slot": 2,
        "url": "https://www.worldbank.org/en/topic/health/publication/digital-in-health-unlocking-the-value-for-everyone",
        "title": "Digital-in-Health: Unlocking the Value for Everyone",
        "publisher": "World Bank",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports digital innovation as a health-system strengthening and service-delivery enabler."
      }
    ]
  },
  {
    "article_path": "articles/policy/innovations-public-health-infrastructure-future-pandemics.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.who.int/initiatives/preparedness-and-resilience-for-emerging-threats",
        "title": "Preparedness and Resilience for Emerging Threats",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports preparedness infrastructure for emerging infectious threats and future pandemics."
      },
      {
        "slot": 2,
        "url": "https://www.who.int/teams/primary-health-care/health-systems-resilience",
        "title": "Health Systems Resilience",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports resilient infrastructure and systems capable of preparing, responding and recovering from public-health threats."
      }
    ]
  },
  {
    "article_path": "articles/policy/innovations-public-health-infrastructure-pandemic-recovery.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.oecd.org/en/topics/health-system-resilience.html",
        "title": "Health system resilience",
        "publisher": "OECD",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports post-pandemic recovery through resilience, adaptation and shock-prepared health systems."
      },
      {
        "slot": 2,
        "url": "https://www.who.int/teams/primary-health-care/health-systems-resilience",
        "title": "Health Systems Resilience",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports recovery-oriented system strengthening while maintaining essential health services."
      }
    ]
  },
  {
    "article_path": "articles/policy/innovations-public-health-infrastructure-pandemic-response.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.who.int/teams/primary-health-care/health-systems-resilience",
        "title": "Health Systems Resilience",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports public-health infrastructure for preparedness, response and recovery."
      },
      {
        "slot": 2,
        "url": "https://www.oecd.org/en/publications/strengthening-health-systems-during-a-pandemic-the-role-of-development-finance_f762bf1c-en.html",
        "title": "Strengthening health systems during a pandemic",
        "publisher": "OECD",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports pandemic response through health-system investment and development finance."
      }
    ]
  },
  {
    "article_path": "articles/policy/innovations-public-health-infrastructure-post-pandemic-recovery.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.oecd.org/en/publications/ready-for-the-next-crisis-investing-in-health-system-resilience_1e53cf80-en.html",
        "title": "Ready for the Next Crisis? Investing in Health System Resilience",
        "publisher": "OECD",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports investment priorities for post-pandemic health-system resilience."
      },
      {
        "slot": 2,
        "url": "https://www.who.int/teams/primary-health-care/health-systems-resilience",
        "title": "Health Systems Resilience",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports recovery and continuity of essential services after public-health shocks."
      }
    ]
  },
  {
    "article_path": "articles/policy/innovations-public-health-infrastructure-preparing-future-pandemics.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.who.int/initiatives/preparedness-and-resilience-for-emerging-threats",
        "title": "Preparedness and Resilience for Emerging Threats",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports future-pandemic preparedness through systems and capacities adaptable to emerging threats."
      },
      {
        "slot": 2,
        "url": "https://www.who.int/news/item/05-02-2025-the-changing-face-of-pandemic-risk--how-we-need-to-adapt--protect-and-connect",
        "title": "The changing face of pandemic risk",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports the need to adapt, protect and connect for changing pandemic-risk scenarios."
      }
    ]
  },
  {
    "article_path": "articles/policy/reimagining-public-healthcare-delivery-through-digital-infrastructure.html",
    "references": [
      {
        "slot": 1,
        "url": "https://www.who.int/publications/i/item/9789240020924",
        "title": "Global strategy on digital health 2020-2025",
        "publisher": "World Health Organization",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports digital infrastructure as a foundation for equitable and effective healthcare delivery."
      },
      {
        "slot": 2,
        "url": "https://www.worldbank.org/en/topic/health/publication/digital-in-health-unlocking-the-value-for-everyone",
        "title": "Digital-in-Health: Unlocking the Value for Everyone",
        "publisher": "World Bank",
        "source_type": "multilateral_organisation",
        "relevance_note": "Supports reimagining healthcare delivery through digital systems, data and health-system transformation."
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
const ag03d = readJson(path.join(root, config.input_files.ag03d_audit));

if (ag03d.summary?.ready_for_ag03b_batch_2 !== true) {
  throw new Error("AG03D has not authorized AG03B Batch 2.");
}

const batch = (ag03a.batches || []).find((b) => b.batch_id === config.target_batch_id);
if (!batch) throw new Error(`Missing target batch: ${config.target_batch_id}`);

const queueByPath = new Map((ag03a.entries || []).map((entry) => [entry.article_path, entry]));
const candidatesByPath = new Map(CANDIDATE_REFS.map((entry) => [entry.article_path, entry]));

const entries = batch.article_paths.map((articlePath, index) => {
  const queueEntry = queueByPath.get(articlePath);
  if (!queueEntry) throw new Error(`Batch article missing from AG03A entries: ${articlePath}`);

  const candidateEntry = candidatesByPath.get(articlePath);
  if (!candidateEntry) throw new Error(`Missing AG03B-B2 candidates for: ${articlePath}`);

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
    article_insertion_status: "not_inserted_in_ag03b_b2"
  }));

  return {
    ag03b_b2_candidate_id: `AG03B_B2_REF_${String(index + 1).padStart(3, "0")}`,
    batch_id: config.target_batch_id,
    article_path: articlePath,
    category: queueEntry.category,
    title: queueEntry.title,
    current_public_verified_reference_count: queueEntry.current_public_verified_reference_count,
    required_verified_reference_count: queueEntry.required_verified_reference_count,
    candidate_reference_count: refs.length,
    candidate_population_status: "populated_for_review",
    article_insertion_status: "not_inserted_in_ag03b_b2",
    approved_for_article_insertion: false,
    references: refs
  };
});

const registry = {
  registry_id: "AG03B_B2_VERIFIED_REFERENCE_CANDIDATES",
  module_id: "AG03B-B2",
  status: "batch_02_verified_reference_candidates_populated_pending_review",
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
    ready_for_ag03c_b2_after_review: false
  },
  entries
};

const preview = {
  preview_id: "AG03B_B2_VERIFIED_REFERENCE_CANDIDATES_PREVIEW",
  module_id: "AG03B-B2",
  status: "preview_batch_02_reference_candidates_pending_review",
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
console.log("Ready for AG03C-B2 after review: false");
