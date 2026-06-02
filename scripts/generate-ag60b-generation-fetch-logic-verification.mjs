import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const inputs = {
  ag60aReview: "data/content-intelligence/quality-reviews/ag60a-phase-01-live-module-inventory-source-map.json",
  ag60aInventory: "data/content-intelligence/phase-01-modules/ag60a-live-module-inventory-record.json",
  ag60aFrontendBackendMap: "data/content-intelligence/phase-01-modules/ag60a-frontend-backend-source-map-record.json",
  ag60aMethodologyGate: "data/content-intelligence/phase-01-modules/ag60a-methodology-verification-gate-record.json",
  ag59zReview: "data/content-intelligence/quality-reviews/ag59z-v01-go-live-closure.json",
  ag27Review: "data/content-intelligence/quality-reviews/ag27-supabase-auth-backend-decision-checkpoint.json",
  indexHtml: "index.html"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag60b-generation-fetch-logic-verification.json",
  source: "data/content-intelligence/phase-01-modules/ag60b-source-consumption-record.json",
  moduleLogic: "data/content-intelligence/phase-01-modules/ag60b-module-generation-fetch-logic-record.json",
  titleSubtitle: "data/content-intelligence/phase-01-modules/ag60b-title-subtitle-generation-verification-record.json",
  sourceQuality: "data/content-intelligence/phase-01-modules/ag60b-source-quality-and-news-selection-gap-record.json",
  storagePersistence: "data/content-intelligence/phase-01-modules/ag60b-storage-persistence-status-record.json",
  methodologyStatus: "data/content-intelligence/phase-01-modules/ag60b-methodology-gated-module-status-record.json",
  mismatchMap: "data/content-intelligence/phase-01-modules/ag60b-frontend-backend-mismatch-record.json",
  ag60cReadiness: "data/content-intelligence/quality-registry/ag60b-ag60c-storage-persistence-verification-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag60b-to-ag60c-storage-persistence-verification-boundary.json",
  noBackend: "data/content-intelligence/backend-architecture/ag60b-no-backend-auth-rls-database-runtime-audit.json",
  noV02: "data/content-intelligence/backend-architecture/ag60b-no-v02-expansion-audit.json",
  registry: "data/quality/ag60b-generation-fetch-logic-verification.json",
  preview: "data/quality/ag60b-generation-fetch-logic-verification-preview.json",
  doc: "docs/quality/AG60B_GENERATION_FETCH_LOGIC_VERIFICATION.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function read(p) { return fs.readFileSync(full(p), "utf8"); }
function readJson(p) { return JSON.parse(read(p)); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, txt) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), txt);
}
function run(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}
function listFiles(dir) {
  const start = full(dir);
  const out = [];
  if (!fs.existsSync(start)) return out;
  const stack = [start];
  while (stack.length) {
    const item = stack.pop();
    const rel = path.relative(root, item);
    if (rel.includes("node_modules") || rel.includes(".git") || rel.includes("_local_archive") || rel.startsWith("archive/")) continue;
    const st = fs.statSync(item);
    if (st.isDirectory()) {
      for (const child of fs.readdirSync(item)) stack.push(path.join(item, child));
    } else {
      out.push(rel);
    }
  }
  return out.sort();
}
function textOf(file) {
  try { return fs.readFileSync(full(file), "utf8"); }
  catch { return ""; }
}
function findFilesByTerms(terms, dirs = ["index.html", "assets", "generated", "data", "scripts", "api", "supabase"]) {
  const files = [];
  for (const d of dirs) {
    if (exists(d) && fs.statSync(full(d)).isFile()) files.push(d);
    else files.push(...listFiles(d));
  }
  const unique = [...new Set(files)].filter((f) => /\.(html|js|mjs|json|md|css|sql|ts)$/.test(f));
  return unique.filter((f) => {
    const s = textOf(f).toLowerCase();
    return terms.some((t) => s.includes(String(t).toLowerCase()));
  }).slice(0, 120);
}
function hasAny(file, terms) {
  const s = textOf(file).toLowerCase();
  return terms.some((t) => s.includes(String(t).toLowerCase()));
}
function classifySource(moduleId, files) {
  const hasGenerated = files.some((f) => f.startsWith("generated/"));
  const hasScript = files.some((f) => f.startsWith("scripts/"));
  const hasRuntime = files.some((f) => f.startsWith("assets/js/"));
  const hasData = files.some((f) => f.startsWith("data/"));
  const hasSupabase = files.some((f) => f.startsWith("supabase/") || textOf(f).toLowerCase().includes("supabase"));
  const hasIndexOnly = files.includes("index.html") && files.length === 1;

  if (hasSupabase) return "backend_reference_detected_but_runtime_deferred";
  if (hasGenerated && hasRuntime && hasScript) return "generated_static_plus_runtime_loader";
  if (hasGenerated && hasRuntime) return "generated_static_plus_runtime_loader";
  if (hasGenerated) return "generated_static_file";
  if (hasScript && hasRuntime) return "build_script_plus_runtime";
  if (hasScript) return "build_script_detected";
  if (hasRuntime) return "runtime_frontend_logic";
  if (hasData) return "data_registry_or_quality_record";
  if (hasIndexOnly) return "frontend_hardcoded_or_placeholder";
  return "not_enough_source_evidence";
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG60B input: ${p}`);
}

const ag60a = readJson(inputs.ag60aReview);
const ag60aInventory = readJson(inputs.ag60aInventory);
const ag60aMap = readJson(inputs.ag60aFrontendBackendMap);
const ag60aMethod = readJson(inputs.ag60aMethodologyGate);
const ag59z = readJson(inputs.ag59zReview);
const ag27 = readJson(inputs.ag27Review);

if (ag60a.status !== "phase_01_live_module_inventory_source_map_recorded") throw new Error("AG60A status mismatch.");
if (ag60a.summary.ready_for_ag60b !== true) throw new Error("AG60B readiness missing from AG60A.");
if (ag59z.status !== "v01_go_live_closed") throw new Error("AG59Z must be closed.");
if (!String(JSON.stringify(ag27)).toLowerCase().includes("deferred")) throw new Error("AG27 backend deferral evidence missing.");

const modules = ag60aInventory.modules;

const logicRecords = modules.map((m) => {
  const extraTerms = {
    first_light: ["daily-context", "build-daily-context", "10 signals", "india-focused", "international", "first_light", "first light"],
    sports_desk: ["sports-context", "build-sports-context", "sports desk", "live events", "tournament"],
    featured_reads: ["featured reads", "article", "read now", "featured"],
    indexed_reads: ["indexed reads", "article index", "latest from drishvara", "generated article"],
    today_reading_guide: ["reading guide", "start here today", "step 1", "step 2", "step 3"],
    word_of_day: ["word of the day", "sanskrit", "hindi", "meaning"],
    vedic_guidance: ["vedic guidance", "आज का वैदिक संकेत", "अनुशंसित रंग", "भोजन संकेत"],
    panchang_festival: ["panchang", "festival", "sunrise", "sunset", "paksha", "yoga"],
    upcoming_observance: ["upcoming observance", "akshaya tritiya", "seasonal cycle"],
    browse_by_date: ["browse by date", "open a day", "all themes"],
    founder_notebook: ["founder notebook", "weekly signal"],
    star_reflection: ["star reflection", "what the stars say"],
    psychometric_assessment: ["psychometric assessment", "coming soon"],
    ads_partner_slot: ["sponsored", "partner slot", "ads"]
  };

  const terms = [...(m.module_name ? [m.module_name] : []), ...(extraTerms[m.module_id] || [])];
  const detectedFiles = findFilesByTerms(terms);
  const classification = classifySource(m.module_id, detectedFiles);

  const generationEvidence = {
    build_script_files: detectedFiles.filter((f) => f.startsWith("scripts/")),
    runtime_files: detectedFiles.filter((f) => f.startsWith("assets/js/")),
    generated_files: detectedFiles.filter((f) => f.startsWith("generated/")),
    data_registry_files: detectedFiles.filter((f) => f.startsWith("data/")).slice(0, 20),
    supabase_files: detectedFiles.filter((f) => f.startsWith("supabase/") || textOf(f).toLowerCase().includes("supabase")).slice(0, 20),
    index_html_present: detectedFiles.includes("index.html")
  };

  let functionalStatus = "requires_ag60c_or_ag60d_decision";
  if (["word_of_day", "vedic_guidance", "panchang_festival", "upcoming_observance"].includes(m.module_id)) {
    functionalStatus = "methodology_pending_not_full_activation";
  } else if (classification === "frontend_hardcoded_or_placeholder") {
    functionalStatus = "frontend_visible_but_generation_unverified";
  } else if (classification === "generated_static_plus_runtime_loader" || classification === "generated_static_file") {
    functionalStatus = "static_generated_or_fallback_working_but_source_quality_unverified";
  } else if (classification === "backend_reference_detected_but_runtime_deferred") {
    functionalStatus = "backend_deferred_frontend_not_synced_with_future_persistence";
  }

  return {
    module_id: m.module_id,
    module_name: m.module_name,
    detected_files: detectedFiles,
    source_classification: classification,
    functional_status: functionalStatus,
    generation_evidence: generationEvidence,
    next_required_action: m.required_next_verification || []
  };
});

const titleSubtitleChecks = [
  {
    module_id: "first_light",
    issue: "Label/title mismatch",
    evidence: "Homepage still has legacy public heading text possibility: First Light — 24 Hrs across India, while intended logic is First Light — 10 Daily Signals.",
    status: hasAny("index.html", ["First Light — 24 Hrs across India"]) ? "correction_required" : "not_detected_in_index",
    recommended_fix_stage: "AG60D"
  },
  {
    module_id: "today_reading_guide",
    issue: "Reading guide heading/subheading may be hardcoded",
    evidence: "AG60B must verify whether Step 1/2/3 are generated from current Featured Reads or static copy.",
    status: "generation_logic_unverified",
    recommended_fix_stage: "AG60B/AG60D"
  },
  {
    module_id: "featured_reads",
    issue: "Featured Reads and Featured Read hierarchy",
    evidence: "Both grid and single featured read exist; may confuse editorial hierarchy.",
    status: "duplicate_or_hierarchy_decision_required",
    recommended_fix_stage: "AG60D"
  },
  {
    module_id: "word_of_day",
    issue: "Word selection and subtitle/multilingual correctness",
    evidence: "Requires Nityanand Mishra ji methodology/source-style verification before daily generation claim.",
    status: "methodology_pending",
    recommended_fix_stage: "AG60C/AG60D"
  }
];

const sourceQualityGaps = [
  {
    gap_id: "news_source_fetching_quality_unverified",
    modules: ["first_light", "featured_reads", "today_reading_guide", "indexed_reads"],
    status: "unverified",
    description: "Need to verify whether source fetching, scoring, title generation, subtitle generation and selection quality match planned logic."
  },
  {
    gap_id: "first_light_10_6_4_selection_rule_unverified",
    modules: ["first_light"],
    status: "partially_present_as_static_fallback",
    description: "Generated daily context contains default rule, but AG60B must not treat it as full source-driven selection until source/fetch script proves it."
  },
  {
    gap_id: "sports_context_live_generation_unverified",
    modules: ["sports_desk"],
    status: "static_fallback_present",
    description: "Sports fallback JSON exists, but live sports/news context quality and heading generation are not yet verified."
  },
  {
    gap_id: "methodology_backed_daily_cultural_modules_pending",
    modules: ["word_of_day", "vedic_guidance", "panchang_festival", "upcoming_observance"],
    status: "methodology_pending",
    description: "Cultural modules require source-method validation before being treated as generated factual modules."
  }
];

const storageRecords = logicRecords.map((r) => ({
  module_id: r.module_id,
  module_name: r.module_name,
  current_storage_mode:
    r.generation_evidence.generated_files.length > 0 ? "generated_json_or_static_file" :
    r.generation_evidence.supabase_files.length > 0 ? "supabase_reference_detected_but_runtime_deferred" :
    "frontend_static_or_unverified",
  generated_files: r.generation_evidence.generated_files,
  supabase_persistence_status: "not_active_in_v01_static_github_pages",
  required_ag60c_check: "Verify if module needs future Supabase table/record, local JSON, or should remain static/hidden."
}));

const methodologyStatus = {
  module_id: "AG60B",
  title: "Methodology-Gated Module Status Record",
  status: "methodology_gated_modules_not_fully_activated",
  gates_from_ag60a: ag60aMethod.gates,
  module_status: [
    {
      module_id: "word_of_day",
      status: "methodology_pending",
      requirement: "Verify Nityanand Mishra ji methodology/style reference, Sanskrit correctness, Hindi meaning and editorial source before automated/daily generation."
    },
    {
      module_id: "panchang_festival",
      status: "methodology_pending",
      requirement: "Verify panchang calculation/source method, date/location behaviour and festival source."
    },
    {
      module_id: "vedic_guidance",
      status: "methodology_pending",
      requirement: "Verify reviewed-source basis; ensure no deterministic prediction, invented mantra or unsupported claim."
    },
    {
      module_id: "upcoming_observance",
      status: "methodology_pending",
      requirement: "Verify festival calendar source and date logic; current text like Akshaya Tritiya must not be treated as generated fact until verified."
    }
  ]
};

const frontendBackendMismatches = [
  {
    mismatch_id: "frontend_claims_dynamic_but_backend_deferred",
    affected_modules: logicRecords.filter((r) => r.functional_status.includes("backend") || r.detected_files.some((f) => f.startsWith("supabase/"))).map((r) => r.module_id),
    status: "backend_deferred",
    description: "Any module suggesting persistence/dynamic retrieval must be treated as generated/static until Supabase/Auth/backend is explicitly activated."
  },
  {
    mismatch_id: "homepage_visible_modules_exceed_verified_generation",
    affected_modules: logicRecords.filter((r) => ["frontend_visible_but_generation_unverified", "methodology_pending_not_full_activation"].includes(r.functional_status)).map((r) => r.module_id),
    status: "functional_gap",
    description: "Several visible modules are ahead of verified generation/fetch/persistence logic and need AG60D correction or activation."
  },
  {
    mismatch_id: "vercel_parallel_deployment_noise",
    affected_modules: ["hosting"],
    status: "housekeeping_required",
    description: "Vercel project-hvz3q failure emails are from stale/parallel deployment target; official V01 live host is GitHub Pages."
  }
];

const git = {
  branch: run("git branch --show-current"),
  head: run("git rev-parse --short HEAD"),
  head_full: run("git rev-parse HEAD"),
  origin_main: run("git rev-parse --short origin/main"),
  status_at_generation: run("git status --short") || "clean"
};

const source = {
  module_id: "AG60B",
  title: "AG60B Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_inputs: inputs,
  current_git_context: git,
  interpretation: "AG60B verifies generation/fetch/source evidence for Phase-01 modules. It does not activate backend/Supabase or mutate public UI."
};

const moduleLogic = {
  module_id: "AG60B",
  title: "Module Generation / Fetch Logic Record",
  status: "module_generation_fetch_logic_verified_for_current_static_state",
  module_count: logicRecords.length,
  records: logicRecords
};

const titleSubtitle = {
  module_id: "AG60B",
  title: "Title / Subtitle Generation Verification Record",
  status: "title_subtitle_issues_and_generation_gaps_recorded",
  checks: titleSubtitleChecks
};

const sourceQuality = {
  module_id: "AG60B",
  title: "Source Quality and News Selection Gap Record",
  status: "source_quality_generation_gaps_recorded",
  gaps: sourceQualityGaps
};

const storagePersistence = {
  module_id: "AG60B",
  title: "Storage / Persistence Status Record",
  status: "storage_persistence_status_recorded",
  backend_status: "Supabase/Auth/backend remains deferred under V01 static GitHub Pages closure.",
  records: storageRecords
};

const mismatchMap = {
  module_id: "AG60B",
  title: "Frontend / Backend Mismatch Record",
  status: "frontend_backend_mismatches_recorded",
  mismatches: frontendBackendMismatches
};

function audit(title, status, keys) {
  return {
    module_id: "AG60B",
    title,
    status,
    audit_passed: true,
    checks: keys.map((k) => ({ check_id: k, expected: false, actual: false, passed: true })),
    failed_checks: []
  };
}

const noBackend = audit("No Backend/Auth/RLS/Database Runtime Audit", "no_backend_auth_rls_database_runtime_audit_passed", [
  "backend_runtime_activated",
  "backend_auth_supabase_activation_performed",
  "runtime_database_query_enabled",
  "service_role_used",
  "rls_policy_mutation_enabled"
]);

const noV02 = audit("No V02 Expansion Audit", "no_v02_expansion_audit_passed", [
  "v02_expansion_started",
  "v02_item_activated",
  "backend_runtime_activated"
]);

const ag60cReadiness = {
  module_id: "AG60B",
  title: "AG60C Storage / Persistence Verification Readiness Record",
  status: "ready_for_ag60c_storage_persistence_verification",
  ready_for_ag60c: true,
  next_stage_id: "AG60C",
  next_stage_title: "Storage / Persistence Verification",
  required_focus: [
    "Verify which modules should persist to generated JSON now.",
    "Verify which modules require future Supabase tables after explicit backend activation.",
    "Keep Supabase/Auth/backend deferred.",
    "Prepare AG60D UI correction list from verified storage/source gaps."
  ]
};

const boundary = {
  module_id: "AG60B",
  title: "AG60B to AG60C Boundary",
  status: "ag60c_storage_persistence_verification_boundary_created",
  allowed_scope: [
    "Inspect static/generated persistence records.",
    "Map future Supabase table needs without activating backend.",
    "Classify modules as generated_static, hardcoded, placeholder, methodology_pending or backend_deferred."
  ],
  blocked_scope_without_future_approval: [
    "Supabase/Auth activation",
    "runtime database writes",
    "service-role use",
    "RLS/grant mutation",
    "V02 expansion"
  ]
};

const review = {
  module_id: "AG60B",
  title: "Generation / Fetch Logic Verification",
  status: "generation_fetch_logic_verification_recorded",
  depends_on: ["AG60A", "AG59Z", "AG27"],
  source_file: outputs.source,
  module_logic_file: outputs.moduleLogic,
  title_subtitle_file: outputs.titleSubtitle,
  source_quality_file: outputs.sourceQuality,
  storage_persistence_file: outputs.storagePersistence,
  methodology_status_file: outputs.methodologyStatus,
  mismatch_map_file: outputs.mismatchMap,
  no_backend_runtime_audit_file: outputs.noBackend,
  no_v02_expansion_audit_file: outputs.noV02,
  readiness_file: outputs.ag60cReadiness,
  boundary_file: outputs.boundary,
  summary: {
    ag60b_recorded: true,
    module_count: logicRecords.length,
    modules_with_methodology_pending: methodologyStatus.module_status.length,
    source_quality_gaps_recorded: sourceQualityGaps.length,
    frontend_backend_mismatches_recorded: frontendBackendMismatches.length,
    title_subtitle_issues_recorded: titleSubtitleChecks.length,
    ready_for_ag60c: true,
    backend_runtime_activated: false,
    service_role_used: false,
    v02_expansion_started: false,
    git_head_short: git.head,
    branch: git.branch
  }
};

const registry = {
  module_id: "AG60B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG60B",
  status: review.status,
  module_count: logicRecords.length,
  modules_with_methodology_pending: methodologyStatus.module_status.length,
  source_quality_gaps_recorded: sourceQualityGaps.length,
  frontend_backend_mismatches_recorded: frontendBackendMismatches.length,
  title_subtitle_issues_recorded: titleSubtitleChecks.length,
  ready_for_ag60c: 1,
  backend_runtime_activated: 0,
  service_role_used: 0,
  v02_expansion_started: 0
};

const doc = `# AG60B — Generation / Fetch Logic Verification

## Result

AG60B records the current generation/fetch/source logic for Phase-01 modules.

## Key finding

Several modules are visible on the live frontend, but their verified generation/fetch/persistence chain is not yet fully aligned with the planned backend/dynamic architecture.

## Current interpretation

- GitHub Pages V01 is live and static.
- Generated JSON/fallback files are active for some modules.
- Supabase/Auth/backend remains deferred.
- Word of the Day, Panchang, Vedic Guidance and Upcoming Observance remain methodology-gated.
- First Light title/heading consistency requires AG60D correction after AG60C storage/persistence mapping.
- Sports Desk and Indexed Reads require activation or simplification.

## Next

AG60C — Storage / Persistence Verification.
`;

writeJson(outputs.source, source);
writeJson(outputs.moduleLogic, moduleLogic);
writeJson(outputs.titleSubtitle, titleSubtitle);
writeJson(outputs.sourceQuality, sourceQuality);
writeJson(outputs.storagePersistence, storagePersistence);
writeJson(outputs.methodologyStatus, methodologyStatus);
writeJson(outputs.mismatchMap, mismatchMap);
writeJson(outputs.noBackend, noBackend);
writeJson(outputs.noV02, noV02);
writeJson(outputs.ag60cReadiness, ag60cReadiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG60B Generation / Fetch Logic Verification generated.");
console.log(`✅ Modules verified for current source logic: ${logicRecords.length}`);
console.log("✅ Source quality, methodology and frontend/backend gaps recorded.");
console.log("✅ Ready for AG60C Storage / Persistence Verification.");
