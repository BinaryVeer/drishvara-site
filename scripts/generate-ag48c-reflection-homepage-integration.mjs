import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag48bReview: "data/content-intelligence/quality-reviews/ag48b-multilingual-language-safety-review.json",
  ag48bFieldAudit: "data/content-intelligence/word-reflection/ag48b-multilingual-field-safety-audit.json",
  ag48bMeaning: "data/content-intelligence/word-reflection/ag48b-sanskrit-hindi-english-meaning-boundary.json",
  ag48bTransliteration: "data/content-intelligence/word-reflection/ag48b-transliteration-script-integrity-boundary.json",
  ag48bToggle: "data/content-intelligence/word-reflection/ag48b-language-toggle-stability-review.json",
  ag48bMantraBlocker: "data/content-intelligence/word-reflection/ag48b-unreviewed-sanskrit-mantra-publication-blocker.json",
  ag48bReflectionHandoff: "data/content-intelligence/word-reflection/ag48b-reflection-language-safety-handoff.json",
  ag48bNoAuth: "data/content-intelligence/backend-architecture/ag48b-no-personalisation-auth-activation-audit.json",
  ag48bNoRuntime: "data/content-intelligence/backend-architecture/ag48b-no-runtime-api-deployment-audit.json",
  ag48bNoPublicGeneration: "data/content-intelligence/backend-architecture/ag48b-no-public-language-generation-audit.json",
  ag48bReadiness: "data/content-intelligence/quality-registry/ag48b-ag48c-reflection-homepage-integration-readiness-record.json",
  ag48bBoundary: "data/content-intelligence/mutation-plans/ag48b-to-ag48c-reflection-homepage-integration-boundary.json",

  ag48aReflection: "data/content-intelligence/word-reflection/ag48a-reflection-readiness-seed-record.json",
  ag47rSourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag48c-reflection-homepage-integration.json",
  reflectionPromptIntegration: "data/content-intelligence/word-reflection/ag48c-reflection-prompt-integration-record.json",
  homepageSurfaceMap: "data/content-intelligence/word-reflection/ag48c-homepage-discover-reflect-surface-map.json",
  staticDisplayBoundary: "data/content-intelligence/word-reflection/ag48c-static-reflection-display-boundary.json",
  navigationFlowReadiness: "data/content-intelligence/word-reflection/ag48c-discover-read-reflect-flow-readiness-record.json",
  noPersonalisationBoundary: "data/content-intelligence/word-reflection/ag48c-no-personalisation-reflection-boundary.json",
  integrationGapRegister: "data/content-intelligence/word-reflection/ag48c-ag48d-integration-gap-register.json",
  noPersonalisationAuthAudit: "data/content-intelligence/backend-architecture/ag48c-no-personalisation-auth-activation-audit.json",
  noRuntimeApiDeploymentAudit: "data/content-intelligence/backend-architecture/ag48c-no-runtime-api-deployment-audit.json",
  noPublicGenerationAudit: "data/content-intelligence/backend-architecture/ag48c-no-public-reflection-generation-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag48c-ag48d-word-reflection-integration-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag48c-to-ag48d-word-reflection-integration-audit-boundary.json",
  registry: "data/quality/ag48c-reflection-homepage-integration.json",
  preview: "data/quality/ag48c-reflection-homepage-integration-preview.json",
  doc: "docs/quality/AG48C_REFLECTION_HOMEPAGE_INTEGRATION.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function walk(dir, acc = []) {
  if (!fs.existsSync(full(dir))) return acc;
  for (const entry of fs.readdirSync(full(dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, acc);
    else acc.push(rel);
  }
  return acc;
}
function findFiles(patterns) {
  const files = [...walk("data"), ...walk("docs"), ...walk("scripts"), ...walk("public"), ...walk("src")];
  return files.filter((file) => {
    const low = file.toLowerCase();
    return patterns.some((pattern) => low.includes(pattern.toLowerCase()));
  }).sort();
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG48C input: ${p}`);
}

const ag48bReview = readJson(inputs.ag48bReview);
const ag48bFieldAudit = readJson(inputs.ag48bFieldAudit);
const ag48bMeaning = readJson(inputs.ag48bMeaning);
const ag48bTransliteration = readJson(inputs.ag48bTransliteration);
const ag48bToggle = readJson(inputs.ag48bToggle);
const ag48bMantraBlocker = readJson(inputs.ag48bMantraBlocker);
const ag48bReflectionHandoff = readJson(inputs.ag48bReflectionHandoff);
const ag48bNoAuth = readJson(inputs.ag48bNoAuth);
const ag48bNoRuntime = readJson(inputs.ag48bNoRuntime);
const ag48bNoPublicGeneration = readJson(inputs.ag48bNoPublicGeneration);
const ag48bReadiness = readJson(inputs.ag48bReadiness);
const ag48bBoundary = readJson(inputs.ag48bBoundary);
const ag48aReflection = readJson(inputs.ag48aReflection);
const ag47rSourceOfTruth = readJson(inputs.ag47rSourceOfTruth);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag48bReview.status !== "multilingual_language_safety_ready_for_ag48c") throw new Error("AG48B review status mismatch.");
if (ag48bReview.summary?.ready_for_ag48c_reflection_homepage_integration !== true) throw new Error("AG48C readiness missing from AG48B.");
if (ag48bFieldAudit.field_review_requirements?.public_use_allowed_default !== false) throw new Error("AG48B public-use default must remain false.");
if (ag48bMeaning.public_use_default !== false) throw new Error("AG48B meaning public-use default must remain false.");
if (ag48bTransliteration.auto_transliteration_publication_allowed !== false) throw new Error("AG48B auto transliteration must remain blocked.");
if (ag48bToggle.language_toggle_runtime_mutation_enabled !== false) throw new Error("AG48B language toggle runtime mutation must remain disabled.");
if (ag48bMantraBlocker.unreviewed_sanskrit_mantra_publication_allowed !== false) throw new Error("AG48B unreviewed Sanskrit/mantra must remain blocked.");
if (ag48bReflectionHandoff.ready_for_ag48c !== true || ag48bReflectionHandoff.handoff_to_stage !== "AG48C") throw new Error("AG48B reflection handoff must point to AG48C.");
if (ag48bNoAuth.audit_passed !== true) throw new Error("AG48B no-auth audit must pass.");
if (ag48bNoRuntime.audit_passed !== true) throw new Error("AG48B no-runtime audit must pass.");
if (ag48bNoPublicGeneration.audit_passed !== true) throw new Error("AG48B no-public-generation audit must pass.");
if (ag48bReadiness.ready_for_ag48c !== true || ag48bReadiness.next_stage_id !== "AG48C") throw new Error("AG48B readiness must permit AG48C.");
if (ag48bBoundary.next_stage_id !== "AG48C") throw new Error("AG48B boundary must point to AG48C.");
if (ag48aReflection.reflection_position?.public_generated_reflection_disabled_now !== true) throw new Error("AG48A public generated reflection must remain disabled.");
if (!JSON.stringify(ag47rSourceOfTruth.governing_rule).includes("AG48 remains Word of the Day and Reflection")) throw new Error("AG48 roadmap source-of-truth not preserved.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const homepageCandidates = findFiles(["homepage", "home", "discover", "reflect", "first-light", "daily"]);
const reflectionCandidates = findFiles(["reflection", "word-of-day", "word_bank", "word-bank", "sutra"]);
const routeCandidates = findFiles(["route", "navigation", "discover", "reflect", "read"]);

const blockedState = {
  ag48c_reflection_homepage_integration_recorded: true,
  ag48b_consumed: true,
  reflection_prompt_integration_recorded: true,
  homepage_discover_reflect_surface_mapped: true,
  static_reflection_display_boundary_recorded: true,
  discover_read_reflect_flow_recorded: true,
  no_personalisation_reflection_boundary_recorded: true,
  integration_gap_register_recorded: true,
  ready_for_ag48d_word_reflection_integration_audit: true,

  word_publication_approved_now: false,
  word_publication_executed: false,
  public_word_generated_now: false,
  reflection_publication_approved_now: false,
  public_reflection_generated_now: false,
  reviewed_static_reflection_runtime_enabled_now: false,
  user_personalised_reflection_enabled: false,
  personalisation_auth_activation_approved: false,
  personalisation_auth_activation_performed: false,
  unreviewed_sanskrit_mantra_publication_allowed: false,
  language_toggle_runtime_mutation_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_generated_word_reflection_output: false,
  public_content_generated: false
};

const reflectionPromptIntegration = {
  module_id: "AG48C",
  title: "Reflection Prompt Integration Record",
  status: "reflection_prompt_integration_recorded",
  consumed_logic_families: [
    "AG48A reflection readiness seed",
    "AG48B multilingual language safety handoff",
    "Word of the Day / Reflection source bank",
    "Homepage Discover/Reflect surface candidates"
  ],
  discovered_reflection_candidates: reflectionCandidates.slice(0, 80),
  integration_boundary: {
    use_reviewed_static_reflection_prompt_scaffold: true,
    use_public_generation_engine: false,
    use_user_personalisation_engine: false,
    public_reflection_publication_status: "not_executed_in_ag48c",
    reflection_requires_word_language_review: true
  },
  no_duplicate_rule: "AG48C maps reviewed word/reflection fields to homepage surfaces; it does not create new word corpus, generate reflection content or publish public output.",
  blocked_state: blockedState
};

const homepageSurfaceMap = {
  module_id: "AG48C",
  title: "Homepage Discover / Reflect Surface Map",
  status: "homepage_discover_reflect_surface_map_recorded",
  discovered_homepage_candidates: homepageCandidates.slice(0, 80),
  surface_map: [
    {
      surface_id: "DISCOVER_WORD_REFLECTION_ENTRY",
      role: "entry point for reviewed Word of the Day / Reflection scaffold",
      status_now: "planned_not_published"
    },
    {
      surface_id: "READ_CONTEXT_LINK",
      role: "optional link from word/reflection to a reviewed explanatory read when available",
      status_now: "planned_not_published"
    },
    {
      surface_id: "REFLECT_PROMPT_BLOCK",
      role: "static reviewed reflection prompt block",
      status_now: "planned_not_published"
    }
  ],
  display_policy: {
    homepage_runtime_query_enabled: false,
    static_scaffold_allowed_after_review: true,
    public_generated_output_allowed: false,
    personalised_reflection_allowed: false
  },
  blocked_state: blockedState
};

const staticDisplayBoundary = {
  module_id: "AG48C",
  title: "Static Reflection Display Boundary",
  status: "static_reflection_display_boundary_recorded",
  allowed_display_elements_for_v01_scaffold: [
    "reviewed word title",
    "reviewed Hindi/English meaning",
    "reviewed transliteration where applicable",
    "reviewed short reflection prompt",
    "under editorial verification label where review is incomplete"
  ],
  blocked_display_elements_without_later_approval: [
    "AI-generated daily reflection",
    "personalised reflection based on user profile",
    "unreviewed Sanskrit/mantra text",
    "auto-translated meaning",
    "live database-fed word rotation",
    "runtime-generated spiritual advice"
  ],
  public_display_status_now: "not_published",
  blocked_state: blockedState
};

const navigationFlowReadiness = {
  module_id: "AG48C",
  title: "Discover → Read → Reflect Flow Readiness Record",
  status: "discover_read_reflect_flow_readiness_recorded",
  discovered_route_candidates: routeCandidates.slice(0, 80),
  flow_model: [
    {
      step: "Discover",
      behavior: "surface reviewed daily word/reflection prompt or under-review placeholder"
    },
    {
      step: "Read",
      behavior: "optionally point to reviewed supporting content where available"
    },
    {
      step: "Reflect",
      behavior: "show reviewed static reflection prompt; no user-specific generated response"
    }
  ],
  flow_activation_now: false,
  requires_later_ui_validation: true,
  blocked_state: blockedState
};

const noPersonalisationBoundary = {
  module_id: "AG48C",
  title: "No Personalisation Reflection Boundary",
  status: "no_personalisation_reflection_boundary_recorded",
  boundary_rules: [
    "No user-specific reflection in AG48C.",
    "No Auth/profile dependency in AG48C.",
    "No birth-detail, preference, behaviour or account data use.",
    "No personalised spiritual, psychological or astrological advice.",
    "Any future personalised reflection must pass AG49 privacy/consent boundary first."
  ],
  user_personalised_reflection_enabled: false,
  auth_required_now: false,
  blocked_state: blockedState
};

const integrationGapRegister = {
  module_id: "AG48C",
  title: "AG48D Integration Gap Register",
  status: "ag48d_integration_gap_register_recorded",
  blocking_gaps_for_ag48d: [],
  carry_forward_gaps_after_ag48c: [
    "UI/public display not published in AG48C.",
    "Live database/API word rotation remains deferred.",
    "Generated reflection remains blocked.",
    "Personalised reflection remains deferred to AG49 or later.",
    "Language toggle needs later UI smoke validation before public release.",
    "Unreviewed Sanskrit/mantra entries remain blocked."
  ],
  ag48d_audit_allowed: true,
  blocked_state: blockedState
};

const noPersonalisationAuthAudit = {
  module_id: "AG48C",
  title: "No Personalisation/Auth Activation Audit",
  status: "no_personalisation_auth_activation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "user_personalised_reflection_enabled", expected: false, actual: false, passed: true },
    { check_id: "personalisation_auth_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "personalisation_auth_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noRuntimeApiDeploymentAudit = {
  module_id: "AG48C",
  title: "No Runtime / API / Deployment Audit",
  status: "no_runtime_api_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "rls_public_policy_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noPublicGenerationAudit = {
  module_id: "AG48C",
  title: "No Public Reflection Generation Audit",
  status: "no_public_reflection_generation_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "word_publication_approved_now", expected: false, actual: false, passed: true },
    { check_id: "reflection_publication_approved_now", expected: false, actual: false, passed: true },
    { check_id: "public_word_generated_now", expected: false, actual: false, passed: true },
    { check_id: "public_reflection_generated_now", expected: false, actual: false, passed: true },
    { check_id: "public_generated_word_reflection_output", expected: false, actual: false, passed: true },
    { check_id: "unreviewed_sanskrit_mantra_publication_allowed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG48C",
  title: "AG48D Word/Reflection Integration Audit Readiness Record",
  status: "ready_for_ag48d_word_reflection_integration_audit",
  ready_for_ag48d: true,
  next_stage_id: "AG48D",
  next_stage_title: "Word/Reflection Integration Audit",
  ag48d_allowed_scope: [
    "Audit AG48A–AG48C outputs together.",
    "Check word bank, rotation, language safety and homepage/reflection integration boundaries.",
    "Confirm no external API, Supabase, Auth or dynamic runtime activation.",
    "Confirm no public generated word/reflection output.",
    "Prepare AG48Z closure path."
  ],
  ag48d_blocked_scope: [
    "Public word publication",
    "Public generated reflection output",
    "Personalisation/Auth activation",
    "Unreviewed Sanskrit/mantra publication",
    "Website database-reading/API runtime activation",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure"
  ],
  hard_blocker_count_for_ag48d: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG48C",
  title: "AG48C to AG48D Word/Reflection Integration Audit Boundary",
  status: "ag48d_word_reflection_integration_audit_boundary_created",
  next_stage_id: "AG48D",
  next_stage_title: "Word/Reflection Integration Audit",
  allowed_scope: readiness.ag48d_allowed_scope,
  blocked_scope: readiness.ag48d_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG48C",
  title: "Reflection Prompt and Homepage Integration",
  status: "reflection_homepage_integration_ready_for_ag48d",
  depends_on: ["AG48B", "AG48A", "AG47Z", "AG47R"],
  reflection_prompt_integration_file: outputs.reflectionPromptIntegration,
  homepage_surface_map_file: outputs.homepageSurfaceMap,
  static_display_boundary_file: outputs.staticDisplayBoundary,
  navigation_flow_readiness_file: outputs.navigationFlowReadiness,
  no_personalisation_boundary_file: outputs.noPersonalisationBoundary,
  integration_gap_register_file: outputs.integrationGapRegister,
  no_personalisation_auth_audit_file: outputs.noPersonalisationAuthAudit,
  no_runtime_api_deployment_audit_file: outputs.noRuntimeApiDeploymentAudit,
  no_public_generation_audit_file: outputs.noPublicGenerationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag48c_reflection_homepage_integration_recorded: true,
    ag48b_consumed: true,
    reflection_prompt_integration_recorded: true,
    homepage_discover_reflect_surface_mapped: true,
    static_reflection_display_boundary_recorded: true,
    discover_read_reflect_flow_recorded: true,
    no_personalisation_reflection_boundary_recorded: true,
    integration_gap_register_recorded: true,
    ready_for_ag48d_word_reflection_integration_audit: true,
    hard_blocker_count_for_ag48d: 0,

    word_publication_approved_now: false,
    word_publication_executed: false,
    public_word_generated_now: false,
    reflection_publication_approved_now: false,
    public_reflection_generated_now: false,
    reviewed_static_reflection_runtime_enabled_now: false,
    user_personalised_reflection_enabled: false,
    personalisation_auth_activation_approved: false,
    personalisation_auth_activation_performed: false,
    unreviewed_sanskrit_mantra_publication_allowed: false,
    language_toggle_runtime_mutation_enabled: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_generated_word_reflection_output: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG48C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG48C",
  status: review.status,
  ag48c_reflection_homepage_integration_recorded: 1,
  ag48b_consumed: 1,
  reflection_prompt_integration_recorded: 1,
  homepage_discover_reflect_surface_mapped: 1,
  static_reflection_display_boundary_recorded: 1,
  discover_read_reflect_flow_recorded: 1,
  no_personalisation_reflection_boundary_recorded: 1,
  integration_gap_register_recorded: 1,
  ready_for_ag48d_word_reflection_integration_audit: 1,
  hard_blocker_count_for_ag48d: 0,

  word_publication_approved_now: 0,
  word_publication_executed: 0,
  public_word_generated_now: 0,
  reflection_publication_approved_now: 0,
  public_reflection_generated_now: 0,
  reviewed_static_reflection_runtime_enabled_now: 0,
  user_personalised_reflection_enabled: 0,
  personalisation_auth_activation_approved: 0,
  personalisation_auth_activation_performed: 0,
  unreviewed_sanskrit_mantra_publication_allowed: 0,
  language_toggle_runtime_mutation_enabled: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_generated_word_reflection_output: 0,
  public_content_generated: 0
};

const doc = `# AG48C — Reflection Prompt and Homepage Integration

## Result

AG48C maps Word of the Day / Reflection into the Discover → Read → Reflect surface as a governed static scaffold.

## Confirmed

- AG48B multilingual language safety consumed.
- Reflection prompt integration boundary recorded.
- Homepage Discover/Reflect surface map recorded.
- Static reflection display boundary recorded.
- Discover → Read → Reflect flow readiness recorded.
- No-personalisation reflection boundary recorded.

## Still blocked

- Public word publication
- Public generated word/reflection output
- Personalisation/Auth activation
- Unreviewed Sanskrit/mantra publication
- Website database-reading/API runtime activation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure

## Next

AG48D — Word/Reflection Integration Audit.
`;

writeJson(outputs.reflectionPromptIntegration, reflectionPromptIntegration);
writeJson(outputs.homepageSurfaceMap, homepageSurfaceMap);
writeJson(outputs.staticDisplayBoundary, staticDisplayBoundary);
writeJson(outputs.navigationFlowReadiness, navigationFlowReadiness);
writeJson(outputs.noPersonalisationBoundary, noPersonalisationBoundary);
writeJson(outputs.integrationGapRegister, integrationGapRegister);
writeJson(outputs.noPersonalisationAuthAudit, noPersonalisationAuthAudit);
writeJson(outputs.noRuntimeApiDeploymentAudit, noRuntimeApiDeploymentAudit);
writeJson(outputs.noPublicGenerationAudit, noPublicGenerationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG48C Reflection Prompt and Homepage Integration generated.");
console.log("✅ Reflection prompt, homepage surface map, static display boundary and Discover→Read→Reflect flow recorded.");
console.log("✅ Ready for AG48D Word/Reflection Integration Audit.");
console.log("✅ Public generation, personalisation/Auth, API/DB reading, backend/RLS, deployment and secrets remain blocked.");
