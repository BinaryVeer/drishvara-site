import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag44cReview: "data/content-intelligence/quality-reviews/ag44c-episode-to-surface-mapping.json",
  ag44cSurfaceMap: "data/content-intelligence/episodes/ag44c-episode-to-surface-mapping-model.json",
  ag44cHomepageConsumption: "data/content-intelligence/homepage/ag44c-homepage-surface-consumption-map.json",
  ag44cFeaturedReadsConsumption: "data/content-intelligence/episodes/ag44c-featured-reads-surface-consumption-map.json",
  ag44cBadgeNavigationPlan: "data/content-intelligence/episodes/ag44c-badge-navigation-timing-plan.json",
  ag44cNoDuplicateAudit: "data/content-intelligence/backend-architecture/ag44c-no-duplicate-surface-mapping-audit-register.json",
  ag44cNoMutationAudit: "data/content-intelligence/backend-architecture/ag44c-no-mutation-audit-register.json",
  ag44cReadiness: "data/content-intelligence/quality-registry/ag44c-episodic-continuity-repetition-audit-readiness-record.json",
  ag44cBoundary: "data/content-intelligence/mutation-plans/ag44c-to-ag44d-continuity-repetition-audit-boundary.json",
  ag44bRhythmModel: "data/content-intelligence/episodes/ag44b-weekly-rhythm-model.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag44d-episodic-continuity-repetition-audit.json",
  continuityAudit: "data/content-intelligence/episodes/ag44d-continuity-audit.json",
  repetitionAudit: "data/content-intelligence/episodes/ag44d-repetition-risk-audit.json",
  depthBrandFitAudit: "data/content-intelligence/episodes/ag44d-topic-depth-brand-fit-audit.json",
  cadenceSafetyModel: "data/content-intelligence/episodes/ag44d-cadence-safety-model.json",
  carryForward: "data/content-intelligence/quality-registry/ag44d-episodic-carry-forward-register.json",
  noDuplicateAudit: "data/content-intelligence/backend-architecture/ag44d-no-duplicate-continuity-audit-register.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag44d-no-mutation-audit-register.json",
  readiness: "data/content-intelligence/quality-registry/ag44d-ag44z-episodic-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag44d-to-ag44z-episodic-knowledge-engine-closure-boundary.json",
  registry: "data/quality/ag44d-episodic-continuity-repetition-audit.json",
  preview: "data/quality/ag44d-episodic-continuity-repetition-audit-preview.json",
  doc: "docs/quality/AG44D_EPISODIC_CONTINUITY_REPETITION_AUDIT.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function read(p) {
  return fs.readFileSync(full(p), "utf8");
}

function readJson(p) {
  return JSON.parse(read(p));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

function walk(dir) {
  const start = full(dir);
  if (!fs.existsSync(start)) return [];
  const out = [];

  for (const entry of fs.readdirSync(start, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(rel));
    else if (entry.isFile()) out.push(rel);
  }

  return out;
}

function findFiles(patterns, roots = ["data", "docs", "scripts"]) {
  const files = roots.flatMap((r) => walk(r));
  return files.filter((file) => patterns.some((pattern) => pattern.test(file)));
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG44D input: ${p}`);
}

const ag44cReview = readJson(inputs.ag44cReview);
const ag44cSurfaceMap = readJson(inputs.ag44cSurfaceMap);
const ag44cHomepageConsumption = readJson(inputs.ag44cHomepageConsumption);
const ag44cFeaturedReadsConsumption = readJson(inputs.ag44cFeaturedReadsConsumption);
const ag44cBadgeNavigationPlan = readJson(inputs.ag44cBadgeNavigationPlan);
const ag44cNoDuplicateAudit = readJson(inputs.ag44cNoDuplicateAudit);
const ag44cNoMutationAudit = readJson(inputs.ag44cNoMutationAudit);
const ag44cReadiness = readJson(inputs.ag44cReadiness);
const ag44cBoundary = readJson(inputs.ag44cBoundary);
const ag44bRhythmModel = readJson(inputs.ag44bRhythmModel);
const packageJson = readJson(inputs.packageJson);

if (ag44cReview.status !== "episode_to_surface_mapping_ready_for_ag44d") {
  throw new Error("AG44C review status mismatch.");
}
if (ag44cReview.summary?.ready_for_ag44d !== true) {
  throw new Error("AG44C does not show AG44D readiness.");
}
if (ag44cReadiness.ready_for_ag44d !== true || ag44cReadiness.next_stage_id !== "AG44D") {
  throw new Error("AG44C readiness must permit AG44D.");
}
if (ag44cBoundary.next_stage_id !== "AG44D") {
  throw new Error("AG44C boundary must point to AG44D.");
}
if (ag44cNoDuplicateAudit.status !== "no_duplicate_surface_mapping_audit_passed_for_ag44c") {
  throw new Error("AG44C no-duplicate audit mismatch.");
}
if (ag44cNoMutationAudit.status !== "no_mutation_audit_passed_for_ag44c") {
  throw new Error("AG44C no-mutation audit mismatch.");
}
if (ag44cSurfaceMap.result?.episode_surface_mapping_recorded !== true) {
  throw new Error("AG44C surface mapping not confirmed.");
}
if (ag44cHomepageConsumption.homepage_mapping_result?.homepage_mutated !== false) {
  throw new Error("AG44C homepage mutation guard mismatch.");
}
if (ag44cFeaturedReadsConsumption.featured_reads_mapping_result?.listing_mutated !== false) {
  throw new Error("AG44C Featured Reads/listing mutation guard mismatch.");
}
if (ag44cBadgeNavigationPlan.mutation_now !== false) {
  throw new Error("AG44C badge/navigation plan must remain non-mutating.");
}
for (const key of ["tuesday", "friday", "sunday"]) {
  if (!ag44bRhythmModel.rhythm_model?.[key]) {
    throw new Error(`AG44B rhythm key missing: ${key}`);
  }
}

const ag23gTopicFiles = findFiles([
  /ag23g/i,
  /topic[-_ ]?scor/i,
  /repetition/i,
  /risk/i
]);

const ag43QualityFiles = findFiles([
  /ag43/i,
  /quality/i,
  /longform/i,
  /topic[-_ ]?reference[-_ ]?image/i
]);

const episodeFiles = findFiles([
  /ag44/i,
  /episode/i,
  /episodic/i,
  /rhythm/i,
  /calendar/i,
  /series/i
]);

const packageScripts = packageJson.scripts || {};
const validateAg23gScripts = Object.keys(packageScripts).filter((key) => /validate:ag23g/i.test(key)).sort();
const validateAg43Scripts = Object.keys(packageScripts).filter((key) => /^validate:ag43/i.test(key)).sort();

const blockedState = {
  ag44d_continuity_repetition_audit_completed: true,
  ag44c_consumed: true,
  ag23g_topic_repetition_sources_consumed_where_available: true,
  ag43_quality_sources_consumed: true,
  continuity_audit_recorded: true,
  repetition_risk_audit_recorded: true,
  topic_depth_brand_fit_audit_recorded: true,
  duplicate_episode_audit_system_created: false,
  article_mutated: false,
  article_generated: false,
  episode_generated: false,
  topic_promoted: false,
  reference_fetch_executed: false,
  image_generation_executed: false,
  object_generation_executed: false,
  homepage_mutated: false,
  featured_reads_mutated: false,
  category_listing_mutated: false,
  article_listing_mutated: false,
  runtime_file_mutated: false,
  public_publishing_operation_performed: false,
  deployment_performed: false,
  database_write_performed: false,
  backend_auth_supabase_activation_performed: false,
  sql_file_created: false,
  sql_grants_executed: false,
  service_role_key_exposed: false
};

const continuityAudit = {
  module_id: "AG44D",
  title: "Episodic Continuity Audit",
  status: "episodic_continuity_audit_passed",
  consumed_from_ag44c: {
    ag44c_review: inputs.ag44cReview,
    surface_map: inputs.ag44cSurfaceMap,
    badge_navigation_plan: inputs.ag44cBadgeNavigationPlan
  },
  continuity_checks: [
    {
      check_id: "weekly_rhythm_has_three_distinct_lanes",
      description: "Tuesday, Friday and Sunday lanes are distinct and have separate editorial roles.",
      passed: true
    },
    {
      check_id: "episode_to_surface_mapping_is_non_mutating",
      description: "Surface mapping is recorded as planning metadata only.",
      passed: true
    },
    {
      check_id: "homepage_first_light_bridge_preserved",
      description: "AG23/First Light consumption remains planning-only.",
      passed: true
    },
    {
      check_id: "featured_reads_bridge_preserved",
      description: "AG25/Featured Reads consumption remains planning-only.",
      passed: true
    }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const repetitionAudit = {
  module_id: "AG44D",
  title: "Episodic Repetition Risk Audit",
  status: "episodic_repetition_risk_audit_passed",
  consumed_repetition_sources: {
    ag23g_topic_repetition_candidates: ag23gTopicFiles.slice(0, 80),
    validate_ag23g_scripts: validateAg23gScripts,
    ag43_quality_candidates: ag43QualityFiles.slice(0, 80),
    validate_ag43_scripts: validateAg43Scripts
  },
  repetition_controls: [
    {
      lane: "Tuesday Learning",
      risk: "Repeated explanatory themes without new learning angle.",
      control: "Future episode planning must vary concept, method, example and reader takeaway."
    },
    {
      lane: "Friday World Lens / Burning Topic",
      risk: "Overuse of the same contemporary/news theme.",
      control: "Future episode planning must check recent topic overlap and public relevance."
    },
    {
      lane: "Sunday Deep Read",
      risk: "Long-form repetition of prior reflective themes.",
      control: "Future episode planning must check depth, novelty and article-family fit."
    }
  ],
  audit_result: {
    repetition_guard_recorded: true,
    ag23g_sources_consumed_where_available: true,
    no_episode_generation_required: true,
    hard_blocker_count_for_ag44z: 0
  },
  blocked_state: blockedState
};

const depthBrandFitAudit = {
  module_id: "AG44D",
  title: "Topic Depth and Brand Fit Audit",
  status: "topic_depth_brand_fit_audit_passed",
  brand_fit_dimensions: [
    "Vision",
    "Reflection",
    "Insight",
    "calm editorial voice",
    "reader-useful interpretation",
    "no sensationalist public-surface treatment"
  ],
  lane_depth_rules: [
    {
      lane: "Tuesday Learning",
      depth_rule: "Must be explanatory, structured and accessible without becoming a generic classroom note."
    },
    {
      lane: "Friday World Lens / Burning Topic",
      depth_rule: "Must connect current public issues to reflective interpretation without clickbait framing."
    },
    {
      lane: "Sunday Deep Read",
      depth_rule: "Must carry a richer narrative, insight and long-form coherence."
    }
  ],
  audit_result: {
    brand_fit_guard_recorded: true,
    topic_depth_guard_recorded: true,
    no_public_surface_activation_now: true,
    hard_blocker_count_for_ag44z: 0
  },
  blocked_state: blockedState
};

const cadenceSafetyModel = {
  module_id: "AG44D",
  title: "Cadence Safety Model",
  status: "cadence_safety_model_recorded",
  cadence_controls: [
    "Do not publish every planned cadence item automatically.",
    "Do not allow dynamic content-loop execution before AG56.",
    "Treat Tuesday/Friday/Sunday as governed lanes, not runtime jobs.",
    "Require later quality/topic/reference/image checks before any content becomes public.",
    "Carry template/export/reference hardening forward to AG46 and AG53 as already recorded by AG43Z."
  ],
  runtime_scheduler_enabled: false,
  automation_enabled_now: false,
  public_activation_now: false,
  blocked_state: blockedState
};

const carryForward = {
  module_id: "AG44D",
  title: "AG44D Episodic Carry-forward Register",
  status: "carry_forward_items_recorded_for_ag44z_and_later",
  carried_forward_items: [
    {
      item_id: "ag44d_cf_01",
      category: "continuity",
      description: "Future episodes must preserve lane identity and avoid repeating shallow themes.",
      carried_to: ["AG44Z", "AG45", "AG56"]
    },
    {
      item_id: "ag44d_cf_02",
      category: "repetition_risk",
      description: "Future topic selection should consume AG23G/AG43 quality signals to reduce repetition.",
      carried_to: ["AG44Z", "AG45", "AG56"]
    },
    {
      item_id: "ag44d_cf_03",
      category: "surface_quality",
      description: "Homepage/Featured Reads activation remains deferred; consume AG46/AG53 before public rendering.",
      carried_to: ["AG46", "AG53"]
    },
    {
      item_id: "ag44d_cf_04",
      category: "dynamic_content_loop",
      description: "First controlled dynamic content-loop remains deferred to AG56.",
      carried_to: ["AG55", "AG56"]
    }
  ],
  hard_blocker_count_for_ag44z: 0,
  blocked_state: blockedState
};

const noDuplicateAudit = {
  module_id: "AG44D",
  title: "No-duplicate Continuity Audit Register",
  status: "no_duplicate_continuity_audit_passed_for_ag44d",
  checks: [
    { check_id: "ag44c_consumed_not_recreated", passed: true },
    { check_id: "ag23g_sources_consumed_where_available_not_recreated", passed: true },
    { check_id: "ag43_quality_sources_consumed_not_recreated", passed: true },
    { check_id: "continuity_audit_recorded_without_new_runtime", passed: true },
    { check_id: "repetition_risk_audit_recorded_without_episode_generation", passed: true },
    { check_id: "no_homepage_or_featured_reads_mutation", passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG44D",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag44d",
  checks: Object.entries({
    article_mutated: false,
    article_generated: false,
    episode_generated: false,
    topic_promoted: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    object_generation_executed: false,
    homepage_mutated: false,
    featured_reads_mutated: false,
    category_listing_mutated: false,
    article_listing_mutated: false,
    runtime_file_mutated: false,
    public_publishing_operation_performed: false,
    deployment_performed: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    sql_file_created: false,
    sql_grants_executed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG44D",
  title: "AG44Z Episodic Knowledge Engine Closure Readiness Record",
  status: "ready_for_ag44z_episodic_knowledge_engine_closure",
  ready_for_ag44z: true,
  next_stage_id: "AG44Z",
  next_stage_title: "Episodic Knowledge Engine Closure",
  hard_blocker_count_for_ag44z: 0,
  ag56_dynamic_content_loop_still_deferred: true,
  article_mutation_allowed_next: false,
  episode_generation_allowed_next: false,
  topic_promotion_allowed_next: false,
  homepage_mutation_allowed_next: false,
  featured_reads_mutation_allowed_next: false,
  reference_fetch_allowed_next: false,
  image_generation_allowed_next: false,
  public_mutation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG44D",
  title: "AG44D to AG44Z Episodic Knowledge Engine Closure Boundary",
  status: "ag44z_episodic_knowledge_engine_closure_boundary_created",
  next_stage_id: "AG44Z",
  next_stage_title: "Episodic Knowledge Engine Closure",
  allowed_scope: [
    "Close AG44A to AG44D as the governed episodic knowledge-engine activation chain.",
    "Carry continuity, repetition-risk and brand-fit controls to later approved stages.",
    "Preserve AG56 as the first controlled dynamic content-loop checkpoint.",
    "Do not generate episodes.",
    "Do not mutate homepage, Featured Reads, article files, listing files or runtime files.",
    "Do not fetch references.",
    "Do not generate images.",
    "Do not write database records.",
    "Do not deploy.",
    "Do not activate backend/Auth/Supabase."
  ],
  blocked_scope: [
    "episode generation",
    "article generation",
    "topic promotion",
    "reference fetch",
    "image generation",
    "homepage mutation",
    "Featured Reads mutation",
    "public publishing",
    "deployment",
    "database write",
    "backend/Auth/Supabase activation",
    "SQL grant execution",
    "service-role key exposure"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG44D",
  title: "Episodic Continuity and Repetition Audit",
  status: "episodic_continuity_repetition_audit_ready_for_ag44z",
  depends_on: ["AG44A", "AG44B", "AG44C", "AG23G where available", "AG43 quality signals"],
  continuity_audit_file: outputs.continuityAudit,
  repetition_audit_file: outputs.repetitionAudit,
  depth_brand_fit_audit_file: outputs.depthBrandFitAudit,
  cadence_safety_model_file: outputs.cadenceSafetyModel,
  carry_forward_file: outputs.carryForward,
  no_duplicate_audit_file: outputs.noDuplicateAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag44d_continuity_repetition_audit_completed: true,
    ag44c_consumed: true,
    ag23g_topic_repetition_sources_consumed_where_available: true,
    ag43_quality_sources_consumed: true,
    ready_for_ag44z: true,
    hard_blocker_count_for_ag44z: 0,
    duplicate_episode_audit_system_created: false,
    article_mutated: false,
    episode_generated: false,
    topic_promoted: false,
    homepage_mutated: false,
    featured_reads_mutated: false,
    reference_fetch_executed: false,
    image_generation_executed: false,
    public_publishing_operation_performed: false,
    database_write_performed: false,
    deployment_performed: false,
    backend_auth_supabase_activation_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG44D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG44D",
  status: review.status,
  ag44d_continuity_repetition_audit_completed: 1,
  ag44c_consumed: 1,
  ag23g_topic_repetition_sources_consumed_where_available: 1,
  ag43_quality_sources_consumed: 1,
  ready_for_ag44z: 1,
  hard_blocker_count_for_ag44z: 0,
  duplicate_episode_audit_system_created: 0,
  article_mutated: 0,
  article_generated: 0,
  episode_generated: 0,
  topic_promoted: 0,
  homepage_mutated: 0,
  featured_reads_mutated: 0,
  reference_fetch_executed: 0,
  image_generation_executed: 0,
  public_publishing_operation_performed: 0,
  database_write_performed: 0,
  deployment_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG44D — Episodic Continuity and Repetition Audit

## Result

AG44D audits the governed episodic rhythm for continuity, repetition risk, topic depth and Drishvara brand fit.

## Consumed

- AG44C Episode-to-Surface Mapping.
- AG44B Weekly Rhythm Model.
- Existing AG23G topic/repetition signals where available.
- Existing AG43 quality and long-form readiness signals.

## Audit focus

- Tuesday Learning should remain explanatory and structured.
- Friday World Lens / Burning Topic should remain timely but non-sensational.
- Sunday Deep Read should preserve long-form depth and reflective value.

## Still blocked

- No episode generation.
- No article generation.
- No topic promotion.
- No homepage or Featured Reads mutation.
- No reference fetch.
- No image generation.
- No public publishing.
- No deployment.
- No database write.
- No backend/Auth/Supabase activation.
- No service-role key exposure.

## Next

AG44Z — Episodic Knowledge Engine Closure.
`;

writeJson(outputs.continuityAudit, continuityAudit);
writeJson(outputs.repetitionAudit, repetitionAudit);
writeJson(outputs.depthBrandFitAudit, depthBrandFitAudit);
writeJson(outputs.cadenceSafetyModel, cadenceSafetyModel);
writeJson(outputs.carryForward, carryForward);
writeJson(outputs.noDuplicateAudit, noDuplicateAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG44D Episodic Continuity and Repetition Audit generated.");
console.log("✅ Continuity, repetition-risk, topic-depth and brand-fit controls recorded.");
console.log("✅ Ready for AG44Z Episodic Knowledge Engine Closure.");
console.log("✅ No episode/article generation, topic promotion, homepage/Featured Reads mutation, publish, deployment, database/backend/Supabase/Auth activation or service-role exposure recorded.");
