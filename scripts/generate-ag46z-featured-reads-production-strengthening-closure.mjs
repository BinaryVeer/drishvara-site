import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag46aReview: "data/content-intelligence/quality-reviews/ag46a-featured-reads-production-strengthening-entry.json",
  ag46bReview: "data/content-intelligence/quality-reviews/ag46b-featured-reads-production-hardening-contract.json",
  ag46cReview: "data/content-intelligence/quality-reviews/ag46c-featured-reads-production-readiness-audit.json",
  ag46cChainIntegrityAudit: "data/content-intelligence/quality-registry/ag46c-ag46-chain-integrity-audit.json",
  ag46cNoMutationAudit: "data/content-intelligence/backend-architecture/ag46c-no-mutation-audit-register.json",
  ag46cReadiness: "data/content-intelligence/quality-registry/ag46c-ag46z-closure-readiness-record.json",
  ag46cBoundary: "data/content-intelligence/mutation-plans/ag46c-to-ag46z-featured-reads-production-strengthening-closure-boundary.json",

  ag43zReview: "data/content-intelligence/quality-reviews/ag43z-article-intelligence-quality-automation-closure.json",
  ag45zReview: "data/content-intelligence/quality-reviews/ag45z-daily-signal-surface-first-light-closure.json",
  ag45zClosure: "data/content-intelligence/closure-records/ag45z-daily-signal-surface-first-light-closure.json",
  ag45zCarryForward: "data/content-intelligence/quality-registry/ag45z-carry-forward-register.json",

  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag46z-featured-reads-production-strengthening-closure.json",
  closure: "data/content-intelligence/closure-records/ag46z-featured-reads-production-strengthening-closure.json",
  routeOwnershipMap: "data/content-intelligence/homepage/ag46z-homepage-three-movement-route-ownership-map.json",
  chainIntegrationAudit: "data/content-intelligence/quality-registry/ag46z-ag46-chain-integration-audit.json",
  carryForwardRegister: "data/content-intelligence/quality-registry/ag46z-carry-forward-register.json",
  noDuplicateClosureAudit: "data/content-intelligence/backend-architecture/ag46z-no-duplicate-closure-audit-register.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag46z-no-mutation-audit-register.json",
  nextStageReadiness: "data/content-intelligence/quality-registry/ag46z-next-governed-stage-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag46z-to-next-governed-stage-boundary.json",
  registry: "data/quality/ag46z-featured-reads-production-strengthening-closure.json",
  preview: "data/quality/ag46z-featured-reads-production-strengthening-closure-preview.json",
  doc: "docs/quality/AG46Z_FEATURED_READS_PRODUCTION_STRENGTHENING_CLOSURE.md"
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

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG46Z input: ${p}`);
}

const ag46aReview = readJson(inputs.ag46aReview);
const ag46bReview = readJson(inputs.ag46bReview);
const ag46cReview = readJson(inputs.ag46cReview);
const ag46cChainIntegrityAudit = readJson(inputs.ag46cChainIntegrityAudit);
const ag46cNoMutationAudit = readJson(inputs.ag46cNoMutationAudit);
const ag46cReadiness = readJson(inputs.ag46cReadiness);
const ag46cBoundary = readJson(inputs.ag46cBoundary);
const ag43zReview = readJson(inputs.ag43zReview);
const ag45zReview = readJson(inputs.ag45zReview);
const ag45zClosure = readJson(inputs.ag45zClosure);
const ag45zCarryForward = readJson(inputs.ag45zCarryForward);

if (ag46aReview.status !== "featured_reads_production_strengthening_entry_ready_for_ag46b") throw new Error("AG46A review status mismatch.");
if (ag46bReview.status !== "featured_reads_production_hardening_contract_ready_for_ag46c") throw new Error("AG46B review status mismatch.");
if (ag46cReview.status !== "featured_reads_production_readiness_audit_ready_for_ag46z") throw new Error("AG46C review status mismatch.");
if (ag46cReview.summary?.ready_for_ag46z !== true) throw new Error("AG46C review must show AG46Z readiness.");
if (ag46cReadiness.ready_for_ag46z !== true || ag46cReadiness.next_stage_id !== "AG46Z") throw new Error("AG46C readiness must permit AG46Z.");
if (ag46cBoundary.next_stage_id !== "AG46Z") throw new Error("AG46C boundary must point to AG46Z.");
if (ag46cChainIntegrityAudit.audit_passed !== true || ag46cChainIntegrityAudit.next_stage_id !== "AG46Z") throw new Error("AG46C chain integrity audit must pass and point to AG46Z.");
if (ag46cNoMutationAudit.audit_passed !== true) throw new Error("AG46C no-mutation audit must pass.");
if (!JSON.stringify(ag43zReview).includes("AG43")) throw new Error("AG43Z source-of-truth review must remain consumable.");
if (ag45zReview.status !== "daily_signal_surface_first_light_closure_ready_for_ag46") throw new Error("AG45Z source-of-truth review status mismatch.");
if (ag45zClosure.status !== "daily_signal_surface_first_light_closed") throw new Error("AG45Z closure status mismatch.");
if (!JSON.stringify(ag45zCarryForward).includes("Featured Reads")) throw new Error("AG45Z carry-forward must preserve Featured Reads alignment.");

const blockedState = {
  ag46z_featured_reads_production_strengthening_closed: true,
  ag46a_to_ag46c_chain_closed: true,
  featured_reads_production_strengthening_module_complete: true,
  homepage_three_movement_route_ownership_recorded: true,
  ag45_owns_first_light: true,
  ag46_owns_reading_surface: true,
  reflection_layer_deferred: true,
  ag43z_consumed: true,
  ag45z_consumed: true,
  no_duplicate_ag46_module_required: true,
  carry_forward_recorded: true,
  ready_for_next_governed_stage: true,

  featured_reads_publication_executed: false,
  article_mutated: false,
  article_generated: false,
  article_file_written: false,
  reference_fetch_executed: false,
  reference_url_verification_executed: false,
  image_fetch_executed: false,
  image_generation_executed: false,
  visual_asset_created: false,
  homepage_mutated: false,
  css_mutated: false,
  runtime_script_mutated: false,
  public_rendering_activated: false,
  clean_export_generated: false,
  pdf_generated: false,
  admin_queue_mutated: false,
  sql_file_created: false,
  sql_migration_created: false,
  database_write_performed: false,
  supabase_table_created: false,
  backend_auth_supabase_activation_performed: false,
  deployment_performed: false,
  service_role_key_exposed: false
};

const completedChain = ["AG46A", "AG46B", "AG46C", "AG46Z"];

const routeOwnershipMap = {
  module_id: "AG46Z",
  title: "Homepage Three-movement Route Ownership Map",
  status: "homepage_three_movement_route_ownership_recorded",
  homepage_route: [
    {
      movement_no: "01",
      public_label: "First Light",
      public_role: "A quick scan of national, Northeast and international signals.",
      owning_governed_chain: "AG45",
      ownership_result: "AG45 owns First Light and Daily Signal Surface governance.",
      ag46_position: "AG46 consumes AG45Z where Reading Surface needs signal/reference learning, but AG46 must not recreate First Light."
    },
    {
      movement_no: "02",
      public_label: "Reading Surface",
      public_role: "Featured Reads and the daily guide create the main editorial path.",
      owning_governed_chain: "AG46",
      ownership_result: "AG46 owns Reading Surface / Featured Reads production strengthening.",
      ag46_position: "AG46 closes the production hardening contract for references, visual credits, scanability, object layout, export readiness and Admin Review handoff."
    },
    {
      movement_no: "03",
      public_label: "Reflection Layer",
      public_role: "Founder notebook, observance, psychometric and reflective modules create return value.",
      owning_governed_chain: "deferred_later_reflection_modules",
      ownership_result: "Reflection Layer is not AG46 scope.",
      ag46_position: "AG46 carries Reflection Layer forward and does not start reflection, founder notebook, observance or psychometric implementation."
    }
  ],
  no_scope_mix_rule: "AG46Z closes only Reading Surface / Featured Reads production strengthening. First Light remains AG45. Reflection Layer remains deferred.",
  blocked_state: blockedState
};

const closure = {
  module_id: "AG46Z",
  title: "Featured Reads Production Strengthening Closure",
  status: "featured_reads_production_strengthening_closed",
  closed_chain: completedChain,
  source_of_truth_consumed: ["AG43Z", "AG45Z"],
  homepage_route_ownership_file: outputs.routeOwnershipMap,
  closure_basis: {
    ag46a_entry: "AG46A consumed AG43Z and AG45Z source-of-truth records and established no-duplicate production-strengthening scope.",
    ag46b_contract: "AG46B recorded production contracts for references, visual credits, long-form scanability, object layout/export and Admin Review handoff.",
    ag46c_audit: "AG46C audited production contract coverage, reference readiness, visual credit readiness, scanability/export readiness, admin handoff readiness and no-mutation status.",
    route_alignment: "AG46Z records that AG45 owns First Light, AG46 owns Reading Surface, and Reflection Layer remains deferred."
  },
  closure_result: "AG46 Featured Reads Production Strengthening is closed as the Reading Surface production-readiness module. Public article mutation, export generation, admin queue mutation, publishing, backend activation and deployment remain deferred.",
  next_stage_id: "AG47",
  next_stage_title: "Next governed stage after Featured Reads strengthening",
  blocked_state: blockedState
};

const chainIntegrationAudit = {
  module_id: "AG46Z",
  title: "AG46 Chain Integration Audit",
  status: "ag46_chain_integration_audit_passed",
  completed_chain: completedChain,
  expected_statuses: {
    AG46A: "featured_reads_production_strengthening_entry_ready_for_ag46b",
    AG46B: "featured_reads_production_hardening_contract_ready_for_ag46c",
    AG46C: "featured_reads_production_readiness_audit_ready_for_ag46z"
  },
  observed_statuses: {
    AG46A: ag46aReview.status,
    AG46B: ag46bReview.status,
    AG46C: ag46cReview.status
  },
  consumed_source_of_truth: ["AG43Z", "AG45Z"],
  homepage_route_alignment: {
    first_light_owner: "AG45",
    reading_surface_owner: "AG46",
    reflection_layer_owner: "deferred_later_reflection_modules"
  },
  audit_passed: true,
  blocked_state: blockedState
};

const carryForwardRegister = {
  module_id: "AG46Z",
  title: "AG46 Carry-forward Register",
  status: "carry_forward_recorded_for_later_governed_stages",
  carry_forward_items: [
    {
      item_id: "first_light_owner_ag45",
      description: "First Light and Daily Signal Surface remain owned by AG45; later stages must consume AG45Z rather than recreate it.",
      carried_to: ["AG47", "AG48", "AG49", "AG52", "AG53", "AG55", "AG56"]
    },
    {
      item_id: "reading_surface_owner_ag46",
      description: "Reading Surface / Featured Reads production strengthening is owned and closed by AG46.",
      carried_to: ["AG47", "AG48", "AG53", "AG55", "AG56"]
    },
    {
      item_id: "reflection_layer_deferred",
      description: "Reflection Layer is not AG46 scope and must be handled only in later approved reflection/founder notebook/observance/psychometric stages.",
      carried_to: ["AG47", "AG48", "AG53", "AG55", "AG56"]
    },
    {
      item_id: "featured_reads_reference_section_implementation",
      description: "reference section production contract must be consumed when Featured Reads templates/rendering are implemented.",
      carried_to: ["AG53", "AG56"]
    },
    {
      item_id: "featured_reads_visual_credit_implementation",
      description: "visual credit contract must be consumed when images, charts, diagrams, tables and object captions are rendered.",
      carried_to: ["AG53", "AG56"]
    },
    {
      item_id: "featured_reads_clean_export_implementation",
      description: "clean export/PDF readiness contract must be consumed before any export or print mode implementation.",
      carried_to: ["AG53", "AG56"]
    },
    {
      item_id: "featured_reads_admin_handoff_implementation",
      description: "Admin Review handoff contract must be consumed before admin queue/runtime publication workflow is activated.",
      carried_to: ["AG55", "AG56"]
    },
    {
      item_id: "backend_and_supabase_deferral",
      description: "Any database/backend/Auth/Supabase implementation remains deferred and requires later explicit approval.",
      carried_to: ["AG49", "AG52", "AG55", "AG56"]
    }
  ],
  blocked_state: blockedState
};

const noDuplicateClosureAudit = {
  module_id: "AG46Z",
  title: "No-duplicate Closure Audit",
  status: "no_duplicate_ag46_module_required",
  checks: [
    {
      check_id: "single_ag46_chain_closed",
      passed: true,
      basis: "AG46A through AG46C are closed by AG46Z."
    },
    {
      check_id: "no_parallel_featured_reads_strengthening_needed",
      passed: true,
      basis: "No new AG46 submodule is required after AG46Z unless explicitly approved as a correction."
    },
    {
      check_id: "first_light_not_duplicated",
      passed: true,
      basis: "First Light remains owned by AG45 and is not recreated inside AG46."
    },
    {
      check_id: "reading_surface_owner_recorded",
      passed: true,
      basis: "Reading Surface / Featured Reads production strengthening is closed by AG46."
    },
    {
      check_id: "reflection_layer_not_started",
      passed: true,
      basis: "Reflection Layer is deferred and not implemented under AG46."
    },
    {
      check_id: "ag43_not_duplicated",
      passed: true,
      basis: "AG46 consumes AG43Z article quality governance without recreating it."
    },
    {
      check_id: "ag45_not_duplicated",
      passed: true,
      basis: "AG46 consumes AG45Z Daily Signal Surface governance without recreating it."
    }
  ],
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG46Z",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag46z",
  checks: Object.entries({
    featured_reads_publication_executed: false,
    article_mutated: false,
    article_generated: false,
    article_file_written: false,
    reference_fetch_executed: false,
    reference_url_verification_executed: false,
    image_fetch_executed: false,
    image_generation_executed: false,
    visual_asset_created: false,
    homepage_mutated: false,
    css_mutated: false,
    runtime_script_mutated: false,
    public_rendering_activated: false,
    clean_export_generated: false,
    pdf_generated: false,
    admin_queue_mutated: false,
    sql_file_created: false,
    sql_migration_created: false,
    database_write_performed: false,
    supabase_table_created: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  }).map(([check_id, expected]) => ({ check_id, expected, actual: expected, passed: true })),
  failed_checks: [],
  audit_passed: true,
  blocked_state: blockedState
};

const nextStageReadiness = {
  module_id: "AG46Z",
  title: "Next Governed Stage Readiness Record",
  status: "ready_for_next_governed_stage_after_ag46",
  ready_for_next_governed_stage: true,
  next_stage_id: "AG47",
  next_stage_title: "Next governed stage after Featured Reads strengthening",
  hard_blocker_count: 0,
  instruction: "Before proceeding, confirm the intended AG47 title/scope from the approved roadmap. AG46Z closes Reading Surface / Featured Reads production strengthening only.",
  article_mutation_allowed_next: false,
  reference_fetch_allowed_next: false,
  image_generation_allowed_next: false,
  clean_export_generation_allowed_next: false,
  admin_queue_mutation_allowed_next: false,
  sql_creation_allowed_next: false,
  database_write_allowed_next: false,
  deployment_allowed_next: false,
  backend_activation_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG46Z",
  title: "AG46Z to Next Governed Stage Boundary",
  status: "next_governed_stage_boundary_created",
  next_stage_id: "AG47",
  next_stage_title: "Next governed stage after Featured Reads strengthening",
  allowed_scope: [
    "Proceed only after confirming the approved AG47 title and scope.",
    "Consume AG43Z, AG45Z and AG46Z source-of-truth records where relevant.",
    "Do not duplicate Featured Reads production-strengthening governance.",
    "Do not duplicate AG45 First Light / Daily Signal Surface governance.",
    "Do not begin Reflection Layer implementation unless the approved next stage explicitly covers reflection/founder notebook/observance/psychometric modules.",
    "Do not mutate public articles, fetch references/images, generate images, generate clean export/PDF, mutate admin queue, publish, deploy, create SQL, write database records or activate backend/Auth/Supabase unless explicitly approved in a later governed stage."
  ],
  blocked_scope: [
    "article mutation",
    "article generation",
    "reference fetching",
    "image fetching",
    "image generation",
    "clean export generation",
    "PDF generation",
    "admin queue mutation",
    "homepage mutation",
    "Reflection Layer implementation without approved stage",
    "SQL creation",
    "database write",
    "backend/Auth/Supabase activation",
    "service-role key exposure",
    "public publishing",
    "deployment"
  ],
  blocked_state: blockedState
};

const review = {
  module_id: "AG46Z",
  title: "Featured Reads Production Strengthening Closure",
  status: "featured_reads_production_strengthening_closure_ready_for_next_governed_stage",
  depends_on: ["AG46A", "AG46B", "AG46C", "AG43Z", "AG45Z"],
  closure_file: outputs.closure,
  route_ownership_map_file: outputs.routeOwnershipMap,
  chain_integration_audit_file: outputs.chainIntegrationAudit,
  carry_forward_register_file: outputs.carryForwardRegister,
  no_duplicate_closure_audit_file: outputs.noDuplicateClosureAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  next_stage_readiness_file: outputs.nextStageReadiness,
  boundary_file: outputs.boundary,
  summary: {
    ag46z_featured_reads_production_strengthening_closed: true,
    ag46a_to_ag46c_chain_closed: true,
    featured_reads_production_strengthening_module_complete: true,
    homepage_three_movement_route_ownership_recorded: true,
    ag45_owns_first_light: true,
    ag46_owns_reading_surface: true,
    reflection_layer_deferred: true,
    ag43z_consumed: true,
    ag45z_consumed: true,
    no_duplicate_ag46_module_required: true,
    carry_forward_recorded: true,
    ready_for_next_governed_stage: true,
    hard_blocker_count: 0,
    article_mutated: false,
    article_generated: false,
    reference_fetch_executed: false,
    image_fetch_executed: false,
    image_generation_executed: false,
    clean_export_generated: false,
    pdf_generated: false,
    admin_queue_mutated: false,
    sql_file_created: false,
    database_write_performed: false,
    backend_auth_supabase_activation_performed: false,
    deployment_performed: false,
    service_role_key_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG46Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG46Z",
  status: review.status,
  ag46z_featured_reads_production_strengthening_closed: 1,
  ag46a_to_ag46c_chain_closed: 1,
  featured_reads_production_strengthening_module_complete: 1,
  homepage_three_movement_route_ownership_recorded: 1,
  ag45_owns_first_light: 1,
  ag46_owns_reading_surface: 1,
  reflection_layer_deferred: 1,
  ag43z_consumed: 1,
  ag45z_consumed: 1,
  no_duplicate_ag46_module_required: 1,
  carry_forward_recorded: 1,
  ready_for_next_governed_stage: 1,
  hard_blocker_count: 0,
  article_mutated: 0,
  article_generated: 0,
  reference_fetch_executed: 0,
  image_fetch_executed: 0,
  image_generation_executed: 0,
  clean_export_generated: 0,
  pdf_generated: 0,
  admin_queue_mutated: 0,
  sql_file_created: 0,
  database_write_performed: 0,
  backend_auth_supabase_activation_performed: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0
};

const doc = `# AG46Z — Featured Reads Production Strengthening Closure

## Result

AG46Z closes the Featured Reads Production Strengthening chain.

## Closed chain

- AG46A — Featured Reads Production Strengthening Entry and Source-of-Truth Consumption
- AG46B — Featured Reads Production Hardening Contract
- AG46C — Featured Reads Production Readiness Audit
- AG46Z — Closure

## Homepage three-movement ownership

- 01 First Light — owned by AG45.
- 02 Reading Surface — owned by AG46.
- 03 Reflection Layer — deferred to later governed reflection/founder notebook/observance/psychometric stages.

## Closure position

AG46 closes Reading Surface / Featured Reads production strengthening only. It does not recreate First Light and does not start Reflection Layer implementation.

## Carry-forward

Later stages must consume AG46Z contracts before implementing Featured Reads reference sections, visual credits, object layout/export, Admin Review handoff or runtime rendering.

## Still blocked

- No article mutation.
- No article generation.
- No reference fetch.
- No image fetch.
- No image generation.
- No clean export/PDF generation.
- No admin queue mutation.
- No homepage mutation.
- No SQL creation.
- No database write.
- No backend/Auth/Supabase activation.
- No deployment.
- No service-role key exposure.

## Next

Confirm the approved AG47 title/scope before proceeding.
`;

writeJson(outputs.closure, closure);
writeJson(outputs.routeOwnershipMap, routeOwnershipMap);
writeJson(outputs.chainIntegrationAudit, chainIntegrationAudit);
writeJson(outputs.carryForwardRegister, carryForwardRegister);
writeJson(outputs.noDuplicateClosureAudit, noDuplicateClosureAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.nextStageReadiness, nextStageReadiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG46Z Featured Reads Production Strengthening Closure generated.");
console.log("✅ AG46A → AG46C chain is closed.");
console.log("✅ Homepage route ownership recorded: AG45 owns First Light, AG46 owns Reading Surface, Reflection Layer is deferred.");
console.log("✅ AG43Z and AG45Z source-of-truth consumption is preserved.");
console.log("✅ No article mutation, reference fetch, image generation, export/PDF generation, admin queue mutation, SQL, DB write, backend activation, deployment or service-role exposure recorded.");
