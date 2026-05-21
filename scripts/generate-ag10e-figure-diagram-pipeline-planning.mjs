import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10dReview: "data/content-intelligence/quality-reviews/ag10d-infographic-pipeline-planning.json",
  ag10dPlan: "data/content-intelligence/mutation-plans/ag10d-infographic-pipeline-planning.json",
  ag10dTemplateDoctrine: "data/content-intelligence/object-registry/ag10d-reusable-infographic-template-render-instance-doctrine.json",
  ag10dVisualDoctrine: "data/content-intelligence/object-registry/ag10d-infographic-theme-credit-mobile-doctrine.json",
  ag10dReadiness: "data/content-intelligence/quality-registry/ag10d-infographic-pipeline-readiness.json",
  ag10dBoundary: "data/content-intelligence/mutation-plans/ag10d-to-ag10e-figure-diagram-pipeline-planning-boundary.json",
  ag10bNormalizedTaxonomy: "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  ag10bEligibility: "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  ag10aThemeLayout: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ag10aOwnership: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10e-figure-diagram-pipeline-planning.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag10e-figure-diagram-pipeline-planning.json");
const familyRegistryPath = path.join(root, "data/content-intelligence/object-registry/ag10e-figure-diagram-family-structure-registry.json");
const nodeEdgeSchemaPath = path.join(root, "data/content-intelligence/object-registry/ag10e-figure-diagram-node-edge-schema.json");
const templateDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10e-reusable-figure-diagram-template-render-instance-doctrine.json");
const visualDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10e-figure-diagram-theme-credit-mobile-doctrine.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10e-figure-diagram-pipeline-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10e-to-ag10f-table-structured-object-pipeline-planning-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/figure-diagram-pipeline-planning.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10e-figure-diagram-pipeline-planning-learning.json");
const registryPath = path.join(root, "data/quality/ag10e-figure-diagram-pipeline-planning.json");
const previewPath = path.join(root, "data/quality/ag10e-figure-diagram-pipeline-planning-preview.json");
const docPath = path.join(root, "docs/quality/AG10E_FIGURE_DIAGRAM_PIPELINE_PLANNING.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG10E input ${name}: ${relativePath}`);
}

const ag10dReview = readJson(inputs.ag10dReview);
const ag10dPlan = readJson(inputs.ag10dPlan);
const ag10dTemplateDoctrine = readJson(inputs.ag10dTemplateDoctrine);
const ag10dVisualDoctrine = readJson(inputs.ag10dVisualDoctrine);
const ag10dReadiness = readJson(inputs.ag10dReadiness);
const ag10dBoundary = readJson(inputs.ag10dBoundary);
const ag10bNormalizedTaxonomy = readJson(inputs.ag10bNormalizedTaxonomy);
const ag10bEligibility = readJson(inputs.ag10bEligibility);
const ag10aThemeLayout = readJson(inputs.ag10aThemeLayout);
const ag10aOwnership = readJson(inputs.ag10aOwnership);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag10dReview.status !== "infographic_pipeline_planning_created_not_executed") {
  throw new Error("AG10E requires AG10D review.");
}

if (ag10dReadiness.ready_for_ag10e !== true) {
  throw new Error("AG10E requires AG10D readiness.");
}

if (ag10dBoundary.next_stage_id !== "AG10E" || ag10dBoundary.explicit_approval_required !== true) {
  throw new Error("AG10E requires AG10D to AG10E explicit boundary.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG10E selected article hash must match AG09C post-correction hash.");
}

const noMutationControls = {
  figure_diagram_pipeline_planning_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag10e: false,
  selected_article_file_write_performed_in_ag10e: false,
  homepage_mutation_performed_in_ag10e: false,
  css_mutation_performed_in_ag10e: false,
  js_mutation_performed_in_ag10e: false,
  reference_insertion_performed_in_ag10e: false,
  reference_url_change_performed_in_ag10e: false,
  data_fetch_performed_in_ag10e: false,
  dataset_creation_performed_in_ag10e: false,
  figure_generation_performed_in_ag10e: false,
  diagram_generation_performed_in_ag10e: false,
  figure_render_performed_in_ag10e: false,
  diagram_render_performed_in_ag10e: false,
  figure_template_creation_performed_in_ag10e: false,
  diagram_template_creation_performed_in_ag10e: false,
  rendered_figure_diagram_creation_performed_in_ag10e: false,
  svg_asset_creation_performed_in_ag10e: false,
  image_asset_creation_performed_in_ag10e: false,
  object_insertion_performed_in_ag10e: false,
  visual_generation_performed_in_ag10e: false,
  image_generation_performed_in_ag10e: false,
  chart_generation_performed_in_ag10e: false,
  infographic_generation_performed_in_ag10e: false,
  table_generation_performed_in_ag10e: false,
  map_generation_performed_in_ag10e: false,
  live_url_fetch_performed_in_ag10e: false,
  deployment_trigger_performed_in_ag10e: false,
  production_jsonl_append_performed_in_ag10e: false,
  database_write_performed_in_ag10e: false,
  supabase_write_performed_in_ag10e: false,
  backend_auth_supabase_activation_performed_in_ag10e: false,
  rollback_execution_performed_in_ag10e: false,
  public_publishing_operation_performed_in_ag10e: false
};

const figureObjects = ag10bNormalizedTaxonomy.normalized_objects.filter(
  (item) => item.family === "figures_diagrams"
);

const figureDiagramFamilies = [
  {
    family_id: "AG10E-FIG-CONCEPT",
    family_name: "Concept and Framework Diagrams",
    figure_diagram_types: ["concept_diagram", "framework_diagram", "simplified_model_diagram", "explanatory_diagram"],
    best_for: ["abstract concept explanation", "reader mental model", "framework summary", "structured interpretation"],
    minimum_structure_blocks: ["title", "core_concept", "nodes", "relationships", "caption", "credit"],
    avoid_when: ["concept is too vague", "diagram repeats prose without added clarity", "too many labels for mobile"]
  },
  {
    family_id: "AG10E-FIG-SYSTEM",
    family_name: "System and Architecture Diagrams",
    figure_diagram_types: ["architecture_diagram", "system_diagram", "schematic_figure"],
    best_for: ["platform architecture", "process architecture", "component relationship", "technical or institutional system"],
    minimum_structure_blocks: ["title", "components", "interfaces_or_links", "flow_direction", "caption", "credit"],
    avoid_when: ["system relationship is not verified", "diagram requires technical precision not available", "too many layers"]
  },
  {
    family_id: "AG10E-FIG-GOVERNANCE",
    family_name: "Governance, Hierarchy and Org Diagrams",
    figure_diagram_types: ["governance_flow_diagram", "hierarchy_org_diagram"],
    best_for: ["institutional hierarchy", "governance chain", "authority flow", "approval path"],
    minimum_structure_blocks: ["title", "levels", "roles_or_entities", "relationship_labels", "caption", "credit"],
    avoid_when: ["roles are not confirmed", "hierarchy may change frequently", "sensitive internal structure not approved"]
  },
  {
    family_id: "AG10E-FIG-FLOW",
    family_name: "Process, Decision and Logic Diagrams",
    figure_diagram_types: ["decision_flow", "logic_tree", "process_figure", "swimlane_flow"],
    best_for: ["decision logic", "workflow route", "cross-actor process", "conditional steps"],
    minimum_structure_blocks: ["title", "nodes_or_steps", "edges", "decision_points", "caption", "credit"],
    avoid_when: ["logic is speculative", "too many branches", "flow becomes unreadable on mobile"]
  },
  {
    family_id: "AG10E-FIG-RELATIONSHIP",
    family_name: "Relationship and Network Diagrams",
    figure_diagram_types: ["network_diagram", "venn_diagram"],
    best_for: ["relationship mapping", "overlap explanation", "stakeholder network", "concept intersection"],
    minimum_structure_blocks: ["title", "entities_or_sets", "relationships_or_intersections", "caption", "credit"],
    avoid_when: ["relationships are unverified", "overlap is subjective without explanation", "network density is high"]
  },
  {
    family_id: "AG10E-FIG-MATRIX",
    family_name: "Matrix and Quadrant Figures",
    figure_diagram_types: ["matrix_diagram", "quadrant_figure"],
    best_for: ["classification", "priority mapping", "risk/opportunity framing", "two-axis positioning"],
    minimum_structure_blocks: ["title", "x_axis", "y_axis", "items_or_positions", "interpretation_note", "caption", "credit"],
    avoid_when: ["axis logic is weak", "positions are not evidence-backed", "too many points"]
  },
  {
    family_id: "AG10E-FIG-ANNOTATED",
    family_name: "Annotated Figures",
    figure_diagram_types: ["annotated_figure"],
    best_for: ["explain parts of a visual", "highlight key features", "reader guidance"],
    minimum_structure_blocks: ["title", "base_visual_reference", "annotations", "caption", "credit"],
    avoid_when: ["base visual rights unclear", "annotations clutter the visual", "mobile labels are unreadable"]
  }
];

const familyRegistry = {
  module_id: "AG10E",
  title: "Figure and Diagram Family Structure Registry",
  status: "figure_diagram_family_structure_registry_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10e: articleHash,
  source_figure_diagram_object_count: figureObjects.length,
  figure_diagram_families: figureDiagramFamilies,
  universal_figure_diagram_schema: {
    required_metadata: [
      "figure_diagram_type",
      "article_id",
      "object_template_id",
      "source_or_logic_record",
      "rights_controller",
      "credit_display",
      "caption",
      "alt_text",
      "mobile_fallback_text",
      "layout_zone",
      "theme_variant",
      "reuse_eligibility_status"
    ],
    required_structure_fields: [
      "title",
      "core_message",
      "nodes_or_components",
      "relationships_or_edges",
      "visual_structure",
      "source_or_logic_note",
      "editorial_purpose"
    ],
    optional_structure_fields: [
      "swimlanes",
      "levels",
      "axis_labels",
      "decision_points",
      "annotations",
      "icons",
      "legend",
      "grouping",
      "sequence_order",
      "fallback_summary"
    ]
  },
  no_figure_generation_in_ag10e: true,
  no_diagram_generation_in_ag10e: true,
  no_rendering_in_ag10e: true,
  ...noMutationControls
};

const nodeEdgeSchema = {
  module_id: "AG10E",
  title: "Figure and Diagram Node Edge Schema",
  status: "figure_diagram_node_edge_schema_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10e: articleHash,
  schema_components: [
    {
      component_type: "node",
      required_fields: ["node_id", "label", "node_type", "short_description"],
      optional_fields: ["level", "group", "icon_role", "source_note"]
    },
    {
      component_type: "edge",
      required_fields: ["edge_id", "from_node_id", "to_node_id", "relationship_type", "direction"],
      optional_fields: ["edge_label", "condition", "weight_or_priority", "source_note"]
    },
    {
      component_type: "swimlane",
      required_fields: ["lane_id", "lane_label", "assigned_nodes"],
      optional_fields: ["actor_role", "stage_group", "responsibility_note"]
    },
    {
      component_type: "axis",
      required_fields: ["axis_id", "axis_label", "axis_meaning"],
      optional_fields: ["scale_min", "scale_max", "quadrant_labels"]
    },
    {
      component_type: "annotation",
      required_fields: ["annotation_id", "target_id", "annotation_text"],
      optional_fields: ["annotation_type", "priority", "source_note"]
    },
    {
      component_type: "legend",
      required_fields: ["legend_id", "legend_items"],
      optional_fields: ["color_role_mapping", "symbol_mapping"]
    },
    {
      component_type: "fallback_summary",
      required_fields: ["summary_text", "main_insight"],
      optional_fields: ["mobile_version_note", "accessibility_note"]
    }
  ],
  validation_rules: [
    "Every node must have a short readable label.",
    "Every edge must have direction or relationship logic.",
    "Decision flows must identify decision points separately from action nodes.",
    "Hierarchy diagrams must not imply authority where the relation is only functional.",
    "Logic trees must avoid unsupported causality.",
    "Mobile fallback summary is mandatory for dense diagrams.",
    "Caption and credit must be present before future rendering."
  ],
  ...noMutationControls
};

const templateDoctrine = {
  module_id: "AG10E",
  title: "Reusable Figure Diagram Template and Rendered Instance Doctrine",
  status: "reusable_figure_diagram_template_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10e: articleHash,
  pipeline_model: [
    "figure_diagram_template",
    "node_edge_content_binding",
    "rendered_figure_diagram_instance",
    "article_placement",
    "post_insertion_layout_audit",
    "reuse_log"
  ],
  distinction: {
    figure_diagram_template: "Reusable Drishvara-owned/controlled structure such as framework, architecture, hierarchy, flow, logic tree or matrix layout.",
    node_edge_content_binding: "Article-specific nodes, edges, labels, relationships, levels, axes or annotations mapped into the template.",
    rendered_figure_diagram_instance: "Specific output produced from one template and one content/logic binding.",
    article_placement: "Controlled insertion zone and layout behavior in the article."
  },
  figure_diagram_template_fields: [
    "figure_diagram_template_id",
    "figure_diagram_family",
    "figure_diagram_type",
    "theme_variant",
    "layout_rule",
    "mobile_rule",
    "caption_rule",
    "credit_rule",
    "node_edge_schema_required",
    "created_by",
    "rights_controller",
    "ownership_status",
    "reuse_allowed",
    "version",
    "template_hash"
  ],
  rendered_figure_diagram_fields: [
    "rendered_figure_diagram_id",
    "figure_diagram_template_id",
    "article_id",
    "node_edge_binding_id",
    "source_record_ids",
    "asset_path",
    "caption",
    "credit",
    "alt_text",
    "mobile_fallback_text",
    "approval_status",
    "reuse_status",
    "rendered_hash"
  ],
  reuse_rules: [
    {
      reuse_type: "template_reuse",
      rule: "Allowed widely after template is approved and versioned."
    },
    {
      reuse_type: "rendered_figure_diagram_reuse",
      rule: "Allowed only when logic, relationships, context, source/credit and article relevance remain valid."
    }
  ],
  no_template_creation_in_ag10e: true,
  no_rendered_figure_diagram_creation_in_ag10e: true,
  ...noMutationControls
};

const visualDoctrine = {
  module_id: "AG10E",
  title: "Figure Diagram Theme, Credit, Mobile and Cost Doctrine",
  status: "figure_diagram_theme_credit_mobile_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10e: articleHash,
  theme_source_status: ag10aThemeLayout.status,
  ownership_source_status: ag10aOwnership.status,
  infographic_template_source_status: ag10dTemplateDoctrine.status,
  figure_diagram_theme_rules: [
    "Figures and diagrams must inherit Drishvara article theme and editorial tone.",
    "Use clean node spacing, controlled line weights and readable labels.",
    "Avoid dense technical diagrams unless article purpose requires them.",
    "Relationship direction must be visually clear.",
    "Every figure/diagram requires caption, credit, alt text and mobile fallback text."
  ],
  credit_rules: [
    {
      condition: "internally created figure",
      credit: "Figure: Drishvara."
    },
    {
      condition: "internally created diagram",
      credit: "Diagram: Drishvara."
    },
    {
      condition: "external source logic or data used",
      credit: "Source: [source]. Figure/diagram: Drishvara."
    },
    {
      condition: "derived interpretation used",
      credit: "Source: [source]. Interpretation and diagram: Drishvara."
    }
  ],
  mobile_rules: [
    "No horizontal overflow.",
    "Dense diagrams should become stacked mobile panels or include a fallback summary.",
    "Labels must remain readable at 360px to 430px mobile width.",
    "Legends and annotations must not overlap nodes or edges.",
    "Complex swimlane and architecture diagrams require simplified mobile representation."
  ],
  placement_rules: [
    "Central placement is preferred for figures and diagrams.",
    "Controlled wrap may be used only for small concept diagrams.",
    "Figures/diagrams must not deform article shape.",
    "Tables, figures and diagrams should align centrally in vertical reading flow.",
    "Figure placement must not interrupt paragraph continuity without editorial purpose."
  ],
  cost_rules: [
    "Prefer reusable SVG/HTML diagram templates before external generation.",
    "Generate/render only after node-edge schema and layout feasibility pass.",
    "Avoid creating diagrams where a simple callout, table or infographic is sufficient.",
    "Record template reuse before creating a new diagram template."
  ],
  accessibility_rules: [
    "Alt text must summarize the core relationship or structure.",
    "Fallback text must describe node/edge logic for screen readers.",
    "Color must not be the only carrier of relationship meaning.",
    "Line direction and labels must be understandable without relying only on color."
  ],
  ...noMutationControls
};

const plan = {
  module_id: "AG10E",
  title: "Figure and Diagram Pipeline Planning",
  status: "figure_diagram_pipeline_planning_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10e: articleHash,
  generated_from: inputs,
  family_registry_file: "data/content-intelligence/object-registry/ag10e-figure-diagram-family-structure-registry.json",
  node_edge_schema_file: "data/content-intelligence/object-registry/ag10e-figure-diagram-node-edge-schema.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10e-reusable-figure-diagram-template-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10e-figure-diagram-theme-credit-mobile-doctrine.json",
  carried_forward: {
    ag10d_plan_status: ag10dPlan.status,
    ag10d_visual_doctrine_status: ag10dVisualDoctrine.status,
    ag10b_eligibility_status: ag10bEligibility.status
  },
  stage_principle: "AG10E plans figure and diagram governance only. No figure/diagram generation, rendering, SVG/image creation or insertion is performed.",
  ...noMutationControls
};

const readiness = {
  module_id: "AG10E",
  title: "Figure and Diagram Pipeline Readiness",
  status: "figure_diagram_pipeline_planning_ready_pending_explicit_ag10f",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10e: articleHash,
  figure_diagram_family_registry_created: true,
  node_edge_schema_created: true,
  reusable_template_render_instance_doctrine_created: true,
  theme_credit_mobile_cost_doctrine_created: true,
  ready_for_ag10f: true,
  figure_generation_ready: false,
  diagram_generation_ready: false,
  figure_render_ready: false,
  diagram_render_ready: false,
  svg_asset_creation_ready: false,
  object_insertion_ready: false,
  article_mutation_ready: false,
  backend_activation_ready: false,
  ...noMutationControls
};

const boundary = {
  module_id: "AG10E",
  title: "AG10E to AG10F Table and Structured Object Pipeline Planning Boundary",
  status: "ag10f_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10e: articleHash,
  next_stage_id: "AG10F",
  next_stage_title: "Table and Structured Object Pipeline Planning",
  explicit_approval_required: true,
  ag10f_allowed_scope: [
    "Define governed table and structured object pipeline.",
    "Classify data tables, comparison tables, risk matrices, glossary tables and KPI summary tables.",
    "Define row/column/cell schema.",
    "Define reusable table template and rendered-instance doctrine.",
    "Define theme, ownership, credit, mobile and accessibility rules.",
    "Define responsive wrapper and overflow rules."
  ],
  ag10f_blocked_scope: [
    "No table generation.",
    "No structured object creation.",
    "No data fetch.",
    "No object insertion.",
    "No article mutation.",
    "No CSS/JS mutation.",
    "No database/Supabase/backend/Auth activation.",
    "No publishing operation."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG10E",
  title: "Figure and Diagram Pipeline Planning Schema",
  status: "schema_figure_diagram_pipeline_planning_only",
  figure_diagram_family_registry_allowed_in_ag10e: true,
  node_edge_schema_allowed_in_ag10e: true,
  reusable_figure_diagram_template_doctrine_allowed_in_ag10e: true,
  figure_diagram_theme_credit_mobile_doctrine_allowed_in_ag10e: true,
  ag10f_boundary_allowed_in_ag10e: true,
  article_mutation_allowed_in_ag10e: false,
  homepage_mutation_allowed_in_ag10e: false,
  css_js_mutation_allowed_in_ag10e: false,
  data_fetch_allowed_in_ag10e: false,
  dataset_creation_allowed_in_ag10e: false,
  figure_generation_allowed_in_ag10e: false,
  diagram_generation_allowed_in_ag10e: false,
  figure_render_allowed_in_ag10e: false,
  diagram_render_allowed_in_ag10e: false,
  figure_template_creation_allowed_in_ag10e: false,
  diagram_template_creation_allowed_in_ag10e: false,
  rendered_figure_diagram_creation_allowed_in_ag10e: false,
  svg_asset_creation_allowed_in_ag10e: false,
  image_asset_creation_allowed_in_ag10e: false,
  object_insertion_allowed_in_ag10e: false,
  visual_generation_allowed_in_ag10e: false,
  image_generation_allowed_in_ag10e: false,
  chart_generation_allowed_in_ag10e: false,
  infographic_generation_allowed_in_ag10e: false,
  table_generation_allowed_in_ag10e: false,
  map_generation_allowed_in_ag10e: false,
  live_url_fetch_allowed_in_ag10e: false,
  deployment_trigger_allowed_in_ag10e: false,
  production_jsonl_append_allowed_in_ag10e: false,
  database_write_allowed_in_ag10e: false,
  supabase_write_allowed_in_ag10e: false,
  backend_auth_supabase_activation_allowed_in_ag10e: false,
  public_publishing_operation_allowed_in_ag10e: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10e: articleHash,
  source_figure_diagram_object_count: figureObjects.length,
  figure_diagram_family_count: figureDiagramFamilies.length,
  node_edge_schema_component_count: nodeEdgeSchema.schema_components.length,
  template_pipeline_steps: templateDoctrine.pipeline_model.length,
  next_stage_id: "AG10F",
  next_stage_title: "Table and Structured Object Pipeline Planning",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG10E",
  title: "Figure and Diagram Pipeline Planning",
  status: "figure_diagram_pipeline_planning_created_not_executed",
  depends_on: ["AG10D", "AG10C", "AG10B", "AG10A"],
  generated_from: inputs,
  summary,
  plan_file: "data/content-intelligence/mutation-plans/ag10e-figure-diagram-pipeline-planning.json",
  family_registry_file: "data/content-intelligence/object-registry/ag10e-figure-diagram-family-structure-registry.json",
  node_edge_schema_file: "data/content-intelligence/object-registry/ag10e-figure-diagram-node-edge-schema.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10e-reusable-figure-diagram-template-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10e-figure-diagram-theme-credit-mobile-doctrine.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10e-figure-diagram-pipeline-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10e-to-ag10f-table-structured-object-pipeline-planning-boundary.json",
  schema_file: "data/content-intelligence/schema/figure-diagram-pipeline-planning.schema.json",
  learning_file: "data/content-intelligence/learning/ag10e-figure-diagram-pipeline-planning-learning.json",
  closure_decision: {
    decision: "ag10e_figure_diagram_planning_created_pending_explicit_ag10f",
    proceed_to_ag10f_only_with_explicit_user_approval: true,
    figure_generation_performed: false,
    diagram_generation_performed: false,
    object_insertion_performed: false,
    article_mutation_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG10E",
  title: "Figure and Diagram Pipeline Planning Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Figures and diagrams require node/edge or structure governance before rendering.",
    "Reusable diagram templates must be separated from rendered figure/diagram instances.",
    "Governance, hierarchy and authority diagrams must avoid implying unverified relationships.",
    "Dense diagrams require mobile fallback summaries or stacked mobile representation.",
    "Figures and diagrams should be generated only when they add explanatory value beyond text, tables or infographics."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG10E",
  title: "Figure and Diagram Pipeline Planning",
  status: "figure_diagram_pipeline_planning_created_not_executed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10e-figure-diagram-pipeline-planning.json",
    plan: "data/content-intelligence/mutation-plans/ag10e-figure-diagram-pipeline-planning.json",
    family_registry: "data/content-intelligence/object-registry/ag10e-figure-diagram-family-structure-registry.json",
    node_edge_schema: "data/content-intelligence/object-registry/ag10e-figure-diagram-node-edge-schema.json",
    template_doctrine: "data/content-intelligence/object-registry/ag10e-reusable-figure-diagram-template-render-instance-doctrine.json",
    visual_doctrine: "data/content-intelligence/object-registry/ag10e-figure-diagram-theme-credit-mobile-doctrine.json",
    readiness: "data/content-intelligence/quality-registry/ag10e-figure-diagram-pipeline-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10e-to-ag10f-table-structured-object-pipeline-planning-boundary.json",
    schema: "data/content-intelligence/schema/figure-diagram-pipeline-planning.schema.json",
    learning: "data/content-intelligence/learning/ag10e-figure-diagram-pipeline-planning-learning.json",
    preview: "data/quality/ag10e-figure-diagram-pipeline-planning-preview.json",
    document: "docs/quality/AG10E_FIGURE_DIAGRAM_PIPELINE_PLANNING.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG10E",
  preview_only: true,
  status: "figure_diagram_pipeline_planning_created_not_executed",
  summary,
  figure_diagram_families_preview: figureDiagramFamilies,
  node_edge_schema_preview: nodeEdgeSchema.schema_components,
  template_pipeline_preview: templateDoctrine.pipeline_model,
  ag10f_handoff: boundary,
  ...noMutationControls
};

const doc = `# AG10E — Figure and Diagram Pipeline Planning

## Purpose

AG10E defines the governed figure and diagram pipeline for Drishvara.

It covers framework diagrams, architecture diagrams, governance-flow diagrams, system diagrams, hierarchy/org diagrams, logic trees, decision flows, matrix/quadrant figures, annotated figures, node/edge schema, reusable templates, rendered instances, theme rules, source/credit rules, mobile fallback rules and cost-control gates.

AG10E is planning-only. It does not generate figures or diagrams, render SVGs/images, create assets, insert objects, mutate articles, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Figure and Diagram Families

AG10E records governance scope for concept/framework, system/architecture, governance/hierarchy, process/flow, relationship/network, matrix/quadrant and annotated figure families.

## Node and Edge Schema

Figures and diagrams are planned through governed structure components such as nodes, edges, swimlanes, axes, annotations, legends and fallback summaries.

## Template and Rendered Instance Model

Reusable figure/diagram templates are separated from rendered figure/diagram instances.

Template reuse may be broad after approval. Rendered figure/diagram reuse is allowed only when logic, relationships, context, source/credit and article relevance remain valid.

## Credit Logic

Default patterns include:

- Figure: Drishvara.
- Diagram: Drishvara.
- Source: [source]. Figure/diagram: Drishvara.
- Source: [source]. Interpretation and diagram: Drishvara.

## Next Stage

AG10F — Table and Structured Object Pipeline Planning — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(familyRegistryPath, familyRegistry);
writeJson(nodeEdgeSchemaPath, nodeEdgeSchema);
writeJson(templateDoctrinePath, templateDoctrine);
writeJson(visualDoctrinePath, visualDoctrine);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG10E attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG10E figure and diagram pipeline planning artifacts generated.");
console.log(`✅ Figure/diagram objects carried forward: ${figureObjects.length}`);
console.log(`✅ Figure/diagram families recorded: ${figureDiagramFamilies.length}`);
console.log("✅ Node/edge schema, reusable template doctrine and theme/credit/mobile doctrine created.");
console.log("✅ No figure/diagram generation, asset creation, object insertion, article mutation, backend activation or publishing operation performed.");
console.log("✅ AG10F handoff created with explicit approval required.");
