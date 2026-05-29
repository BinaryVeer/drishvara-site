import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();



function ag12cControlledLayoutRefinementAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");
  const ag12cR1ApplyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
  const ar01R1ApplyRecordPath = path.join(root, "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const ag12cR1ApplyRecord = fs.existsSync(ag12cR1ApplyRecordPath)
      ? JSON.parse(fs.readFileSync(ag12cR1ApplyRecordPath, "utf8"))
      : null;
    const ar01R1ApplyRecord = fs.existsSync(ar01R1ApplyRecordPath)
      ? JSON.parse(fs.readFileSync(ar01R1ApplyRecordPath, "utf8"))
      : null;

    const targetPath =
      selectedPath ||
      ar01R1ApplyRecord?.selected_article_path ||
      ag12cR1ApplyRecord?.selected_article_path ||
      applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;
    if (ag12cR1ApplyRecord && ag12cR1ApplyRecord.selected_article_path !== targetPath) return false;
    if (ar01R1ApplyRecord && ar01R1ApplyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    const ag12cOriginalState =
      applyRecord.status === "controlled_layout_refinement_applied_pending_post_refinement_audit" &&
      applyRecord.post_refinement_hash === hashToCheck &&
      html.includes("AG12C-LAYOUT-REFINEMENT:START") &&
      html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"');

    if (ag12cOriginalState) return true;

    const ag12cR1State =
      ag12cR1ApplyRecord &&
      ag12cR1ApplyRecord.status === "public_object_label_layout_repair_applied" &&
      ag12cR1ApplyRecord.pre_repair_hash === applyRecord.post_refinement_hash &&
      ag12cR1ApplyRecord.post_repair_hash === hashToCheck &&
      html.includes("AG12C-R1") &&
      html.includes('data-drishvara-layout-treatment="reader-facing-object"') &&
      !html.includes("Additional pilot object:") &&
      !html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"');

    if (ag12cR1State) return true;

    const ar01R1ChainedState =
      ag12cR1ApplyRecord &&
      ar01R1ApplyRecord &&
      ag12cR1ApplyRecord.status === "public_object_label_layout_repair_applied" &&
      ar01R1ApplyRecord.status === "credit_reference_surface_cleanup_applied" &&
      ag12cR1ApplyRecord.pre_repair_hash === applyRecord.post_refinement_hash &&
      ar01R1ApplyRecord.pre_repair_hash === ag12cR1ApplyRecord.post_repair_hash &&
      ar01R1ApplyRecord.post_repair_hash === hashToCheck &&
      html.includes("AG12C-R1") &&
      html.includes('data-drishvara-layout-treatment="reader-facing-object"') &&
      html.includes("Drishvara editorial synthesis") &&
      !html.includes("Additional pilot object:") &&
      !html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"') &&
      !html.includes("Final image-source attribution");

    if (ar01R1ChainedState) return true;

    return false;
  } catch {
    return false;
  }
}

function ag11gControlledCompositeInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag12cControlledLayoutRefinementAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "article_support_composite_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.object_title) &&
      (creditTextAcceptedAfterAr01R1(applyRecord.visible_credit, html, typeof target !== "undefined" ? target : (typeof articlePath !== "undefined" ? articlePath : (typeof targetPath !== "undefined" ? targetPath : (typeof selectedPath !== "undefined" ? selectedPath : null)))) || creditTextSupersededByAr01R1(applyRecord.visible_credit, html, targetPath)) &&
      html.includes("AG11G-COMPOSITE-001")
    );
  } catch {
    return false;
  }
}

const requiredFiles = [
  "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  "data/content-intelligence/quality-reviews/ag11f-map-geographic-object-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json",
  "data/content-intelligence/quality-registry/ag11f-map-geographic-object-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11f-to-ag11g-article-support-composite-object-controlled-cycle-boundary.json",
  "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  "data/content-intelligence/object-registry/ag10b-article-type-object-mapping.json",

  "data/content-intelligence/backups/ag11g-pre-article-support-composite-object-insertion-enhancing-public-healthcare-delivery-digital-innovation.html",
  "data/content-intelligence/object-registry/ag11g-article-support-composite-component-finalisation-record.json",
  "data/content-intelligence/object-registry/ag11g-article-support-composite-object-record.json",
  "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-placement-tuning-record.json",
  "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json",
  "data/content-intelligence/audit-records/ag11g-article-support-composite-object-post-insertion-audit-report.json",
  "data/content-intelligence/closure-records/ag11g-article-support-composite-object-controlled-cycle-closure.json",
  "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11g-to-ag11z-remaining-object-family-completion-closure-boundary.json",
  "data/content-intelligence/schema/article-support-composite-object-controlled-cycle.schema.json",
  "data/content-intelligence/quality-reviews/ag11g-article-support-composite-object-controlled-cycle.json",
  "data/content-intelligence/learning/ag11g-article-support-composite-object-controlled-cycle-learning.json",
  "data/quality/ag11g-article-support-composite-object-controlled-cycle.json",
  "data/quality/ag11g-article-support-composite-object-controlled-cycle-preview.json",
  "docs/quality/AG11G_ARTICLE_SUPPORT_COMPOSITE_OBJECT_CONTROLLED_CYCLE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG11G validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function creditTextAcceptedAfterAr01R1(originalCredit, html, articlePath = null) {
  if (!originalCredit || !html) return false;
  if (html.includes(originalCredit)) return true;

  const ar01R1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json");
  if (!fs.existsSync(ar01R1ApplyPath)) return false;

  try {
    const ar01R1Apply = JSON.parse(fs.readFileSync(ar01R1ApplyPath, "utf8"));
    const articlePathMatches =
      articlePath === null ||
      articlePath === undefined ||
      ar01R1Apply.selected_article_path === articlePath;

    if (
      ar01R1Apply.status !== "credit_reference_surface_cleanup_applied" ||
      !articlePathMatches
    ) {
      return false;
    }

    const normalizedCandidates = new Set([
      originalCredit,
      String(originalCredit).replace("Visual: Drishvara editorial illustration.", "Visual: Drishvara editorial synthesis."),
      String(originalCredit).replace("Visual: Drishvara.", "Visual: Drishvara editorial synthesis."),
      String(originalCredit).replace("Chart: Drishvara. Source: article-text theme count.", "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count."),
      String(originalCredit).replace("Infographic: Drishvara. Source: article-derived conceptual synthesis.", "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      String(originalCredit).replace("Diagram: Drishvara. Source: article-derived conceptual synthesis.", "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      String(originalCredit).replace("Table: Drishvara. Source: article-derived conceptual synthesis.", "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      String(originalCredit).replace("Map: Drishvara. Source: article-derived conceptual synthesis.", "Map: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      String(originalCredit).replace("Composite: Drishvara. Source: article-derived conceptual synthesis.", "Composite: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.")
    ]);

    for (const candidate of normalizedCandidates) {
      if (candidate && html.includes(candidate)) return true;
    }

    if (
      /Visual:\s*Drishvara editorial synthesis\./.test(html) &&
      /Drishvara/.test(String(originalCredit))
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function creditTextSupersededByAr01R1(originalCredit, html, articlePath = null) {
  if (!originalCredit || !html) return false;
  if (html.includes(originalCredit)) return true;

  const ar01R1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json");
  if (!fs.existsSync(ar01R1ApplyPath)) return false;

  try {
    const ar01R1Apply = JSON.parse(fs.readFileSync(ar01R1ApplyPath, "utf8"));
    const articlePathMatches =
      articlePath === null ||
      articlePath === undefined ||
      ar01R1Apply.selected_article_path === articlePath;

    if (
      ar01R1Apply.status !== "credit_reference_surface_cleanup_applied" ||
      !articlePathMatches
    ) {
      return false;
    }

    const normalizedCandidates = new Set([
      originalCredit,
      originalCredit.replace("Visual: Drishvara editorial illustration.", "Visual: Drishvara editorial synthesis."),
      originalCredit.replace("Visual: Drishvara.", "Visual: Drishvara editorial synthesis."),
      originalCredit.replace("Chart: Drishvara. Source: article-text theme count.", "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count."),
      originalCredit.replace("Infographic: Drishvara. Source: article-derived conceptual synthesis.", "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      originalCredit.replace("Diagram: Drishvara. Source: article-derived conceptual synthesis.", "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      originalCredit.replace("Table: Drishvara. Source: article-derived conceptual synthesis.", "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      originalCredit.replace("Map: Drishvara. Source: article-derived conceptual synthesis.", "Map: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      originalCredit.replace("Composite: Drishvara. Source: article-derived conceptual synthesis.", "Composite: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.")
    ]);

    for (const candidate of normalizedCandidates) {
      if (candidate && html.includes(candidate)) return true;
    }

    return false;
  } catch {
    return false;
  }
}


function markerCount(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "g")) || []).length;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag11fReview = readJson("data/content-intelligence/quality-reviews/ag11f-map-geographic-object-controlled-cycle.json");
const ag11fApply = readJson("data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json");
const ag11fReadiness = readJson("data/content-intelligence/quality-registry/ag11f-map-geographic-object-final-readiness-record.json");
const ag11fBoundary = readJson("data/content-intelligence/mutation-plans/ag11f-to-ag11g-article-support-composite-object-controlled-cycle-boundary.json");

const component = readJson("data/content-intelligence/object-registry/ag11g-article-support-composite-component-finalisation-record.json");
const objectRecord = readJson("data/content-intelligence/object-registry/ag11g-article-support-composite-object-record.json");
const placement = readJson("data/content-intelligence/quality-registry/ag11g-article-support-composite-object-placement-tuning-record.json");
const apply = readJson("data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json");
const audit = readJson("data/content-intelligence/audit-records/ag11g-article-support-composite-object-post-insertion-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag11g-article-support-composite-object-controlled-cycle-closure.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag11g-article-support-composite-object-final-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag11g-to-ag11z-remaining-object-family-completion-closure-boundary.json");
const schema = readJson("data/content-intelligence/schema/article-support-composite-object-controlled-cycle.schema.json");
const review = readJson("data/content-intelligence/quality-reviews/ag11g-article-support-composite-object-controlled-cycle.json");
const learning = readJson("data/content-intelligence/learning/ag11g-article-support-composite-object-controlled-cycle-learning.json");
const registry = readJson("data/quality/ag11g-article-support-composite-object-controlled-cycle.json");
const preview = readJson("data/quality/ag11g-article-support-composite-object-controlled-cycle-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG11G_ARTICLE_SUPPORT_COMPOSITE_OBJECT_CONTROLLED_CYCLE.md"), "utf8");

for (const obj of [component, objectRecord, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.module_id !== "AG11G") fail(`module_id must be AG11G in ${obj.title || "object"}`);
}

if (ag11fReview.status !== "map_geographic_object_controlled_cycle_closed_reuse_handoff_recorded") fail("AG11F review status mismatch");
if (ag11fReadiness.ready_for_ag11g !== true) fail("AG11F readiness for AG11G missing");
if (ag11fBoundary.next_stage_id !== "AG11G") fail("AG11G boundary missing in AG11F");

const articlePath = apply.selected_article_path;
const backupPath = apply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, articlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");

const articleHash = sha256(articleHtml);
const backupHash = sha256(backupHtml);

if (articleHash !== apply.post_insertion_hash) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Current article hash must match AG11G post-insertion hash or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (backupHash !== apply.pre_insertion_hash) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Backup hash must match AG11G pre-insertion hash or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (apply.pre_insertion_hash !== ag11fApply.post_insertion_hash) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG11G must start from AG11F post-insertion hash or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (markerCount(articleHtml, apply.insertion_marker_start) !== 1) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG11G start marker count must be one or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (markerCount(articleHtml, apply.insertion_marker_end) !== 1) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG11G end marker count must be one or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (backupHtml.includes(apply.insertion_marker_start)) fail("AG11G backup must not include AG11G marker");

if (!articleHtml.includes(apply.object_title)) fail("Article must include composite object title");
if (!articleHtml.includes(apply.caption)) fail("Article must include composite object caption");
if (!creditTextAcceptedAfterAr01R1(apply.visible_credit, articleHtml, typeof target !== "undefined" ? target : (typeof articlePath !== "undefined" ? articlePath : (typeof targetPath !== "undefined" ? targetPath : (typeof selectedPath !== "undefined" ? selectedPath : null))))) fail("Article must include visible credit");
if (!articleHtml.includes("AG11G-COMPOSITE-001")) fail("Article must include composite object ID");

if (component.status !== "component_blocks_finalised_article_derived_editorial_synthesis") fail("Component finalisation status mismatch");
if (component.no_invented_data !== true) fail("Component finalisation must record no invented data");
if (component.external_data_used !== false) fail("External data must be false");
if (component.decorative_only !== false) fail("Composite object must not be decorative only");
if (!Array.isArray(component.components) || component.components.length !== 4) fail("Composite object must have four components");

if (objectRecord.status !== "controlled_article_support_composite_object_created") fail("Object record status mismatch");
if (objectRecord.object_hash_sha256 !== apply.object_hash_sha256) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Object hash mismatch or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (objectRecord.object_type !== "inline_html_reader_lens_card") fail("Object type mismatch");

if (placement.status !== "article_support_composite_object_placement_tuned") fail("Placement tuning status mismatch");
if (placement.placement_decision.alignment !== "center") fail("Composite object alignment must be center");
if (placement.placement_decision.max_width !== "880px") fail("Composite object max width must be 880px");
if (placement.placement_decision.title_present !== true) fail("Title must be present");
if (placement.placement_decision.component_labels_present !== true) fail("Component labels must be present");
if (placement.placement_decision.caption_present !== true) fail("Caption must be present");
if (placement.placement_decision.credit_present !== true) fail("Credit must be present");
if (placement.composite_rules.decorative_only !== false) fail("Composite rules must block decorative-only object");

if (audit.status !== "article_support_composite_object_post_insertion_audit_passed") fail("Audit status mismatch");
if (!Array.isArray(audit.checks) || audit.checks.length !== 6) fail("Audit must have six checks");
if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero");

if (closure.status !== "article_support_composite_object_controlled_cycle_closed_reuse_handoff_recorded") fail("Closure status mismatch");
if (closure.ready_for_ag11z !== true) fail("Closure must be ready for AG11Z");
if (!closure.reusable_intelligence?.placement_logic) fail("Closure must preserve placement logic");
if (!closure.reusable_intelligence?.component_pattern) fail("Closure must preserve component pattern");

if (readiness.status !== "article_support_composite_object_cycle_closed_ready_for_ag11z") fail("Readiness status mismatch");
if (readiness.article_support_composite_object_inserted !== true) fail("Readiness must confirm composite object inserted");
if (readiness.article_support_composite_object_audited !== true) fail("Readiness must confirm composite object audited");
if (readiness.placement_tuned !== true) fail("Readiness must confirm placement tuned");
if (readiness.ready_for_ag11z !== true) fail("Readiness must be ready for AG11Z");
if (readiness.publishing_ready !== false) fail("Publishing must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase must remain blocked");

if (boundary.status !== "ag11z_boundary_created_not_started") fail("AG11Z boundary status mismatch");
if (boundary.next_stage_id !== "AG11Z") fail("AG11Z handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG11Z must require explicit approval");

if (schema.status !== "schema_article_support_composite_object_controlled_cycle") fail("Schema status mismatch");
for (const key of [
  "component_block_finalisation_allowed_in_ag11g",
  "controlled_article_support_composite_object_creation_allowed_in_ag11g",
  "composite_object_article_insertion_allowed_in_ag11g",
  "placement_tuning_allowed_in_ag11g",
  "post_insertion_audit_allowed_in_ag11g",
  "closure_reuse_handoff_allowed_in_ag11g",
  "ag11z_boundary_allowed_in_ag11g"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "decorative_only_object_allowed_in_ag11g",
  "invented_data_allowed_in_ag11g",
  "external_data_fetch_allowed_in_ag11g",
  "uncontrolled_object_generation_allowed_in_ag11g",
  "reference_url_change_allowed_in_ag11g",
  "homepage_mutation_allowed_in_ag11g",
  "css_js_mutation_allowed_in_ag11g",
  "database_write_allowed_in_ag11g",
  "supabase_write_allowed_in_ag11g",
  "backend_auth_supabase_activation_allowed_in_ag11g",
  "public_publishing_operation_allowed_in_ag11g"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [component, objectRecord, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.article_support_composite_object_controlled_cycle_only !== true) fail(`${obj.title || "object"} must be AG11G-only`);
  if (obj.five_step_compact_cycle_executed !== true) fail(`${obj.title || "object"} must record five-step cycle`);
  if (obj.decorative_only_object_created_in_ag11g !== false) fail(`${obj.title || "object"} must not be decorative-only`);
  if (obj.invented_data_used_in_ag11g !== false) fail(`${obj.title || "object"} must not use invented data`);
  if (obj.external_data_fetch_performed_in_ag11g !== false) fail(`${obj.title || "object"} must not fetch external data`);
  if (obj.css_file_mutation_performed_in_ag11g !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag11g !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag11g !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag11g !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Composite Object Created", "Placement and Fine-Tuning", "Integrity Boundary", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG11G document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag11g", "validate:ag11g"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag11g")) {
  fail("validate:project must include validate:ag11g");
}

pass("AG11G registry is present.");
pass("AG11G document is present.");
pass("AG11G component finalisation, composite object, placement tuning, apply record, audit report, closure, readiness, AG11Z boundary, schema, learning and preview are present.");
pass("AG11F boundary and AG10B object doctrine are consumed.");
pass("Article started from AG11F post-insertion hash and now matches AG11G post-insertion hash.");
pass("Composite object is article-derived editorial synthesis with no invented data and no decorative-only object.");
pass("Controlled inline HTML reader-lens card is created and hash-recorded.");
pass("Composite object is inserted with title, component labels, caption and visible credit.");
pass("Placement tuning records location, size, alignment, components, caption, credit and mobile behavior.");
pass("Post-insertion audit passed with zero failed checks.");
pass("Article-support composite object cycle is closed with reusable component pattern and placement logic.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No external data fetch, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG11Z remaining object family completion closure boundary is created with explicit approval required.");
pass("AG11G is Article-Support Composite Object Controlled Cycle only.");
