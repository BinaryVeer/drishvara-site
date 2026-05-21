import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10fReview: "data/content-intelligence/quality-reviews/ag10f-table-structured-object-pipeline-planning.json",
  ag10fPlan: "data/content-intelligence/mutation-plans/ag10f-table-structured-object-pipeline-planning.json",
  ag10fReadiness: "data/content-intelligence/quality-registry/ag10f-table-structured-object-pipeline-readiness.json",
  ag10fBoundary: "data/content-intelligence/mutation-plans/ag10f-to-ag10g-map-geographic-object-pipeline-planning-boundary.json",
  ag10bNormalizedTaxonomy: "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  ag10bScoring: "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  ag10bEligibility: "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  ag10aThemeLayout: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ag10aOwnership: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  ag10cDataDoctrine: "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10g-map-geographic-object-pipeline-planning.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag10g-map-geographic-object-pipeline-planning.json");
const familyRegistryPath = path.join(root, "data/content-intelligence/object-registry/ag10g-map-geographic-object-family-registry.json");
const geoSchemaPath = path.join(root, "data/content-intelligence/object-registry/ag10g-geo-data-location-schema.json");
const templateDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10g-reusable-map-template-render-instance-doctrine.json");
const visualDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10g-map-theme-credit-mobile-doctrine.json");
const inclusionGatePath = path.join(root, "data/content-intelligence/quality-registry/ag10g-new-aspect-inclusion-gate.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10g-map-geographic-object-pipeline-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10g-to-ag10h-generated-image-editorial-visual-pipeline-planning-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/map-geographic-object-pipeline-planning.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10g-map-geographic-object-pipeline-planning-learning.json");
const registryPath = path.join(root, "data/quality/ag10g-map-geographic-object-pipeline-planning.json");
const previewPath = path.join(root, "data/quality/ag10g-map-geographic-object-pipeline-planning-preview.json");
const docPath = path.join(root, "docs/quality/AG10G_MAP_GEOGRAPHIC_OBJECT_PIPELINE_PLANNING.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG10G input ${name}: ${relativePath}`);
}

const ag10fReview = readJson(inputs.ag10fReview);
const ag10fPlan = readJson(inputs.ag10fPlan);
const ag10fReadiness = readJson(inputs.ag10fReadiness);
const ag10fBoundary = readJson(inputs.ag10fBoundary);
const ag10bNormalizedTaxonomy = readJson(inputs.ag10bNormalizedTaxonomy);
const ag10bScoring = readJson(inputs.ag10bScoring);
const ag10bEligibility = readJson(inputs.ag10bEligibility);
const ag10aThemeLayout = readJson(inputs.ag10aThemeLayout);
const ag10aOwnership = readJson(inputs.ag10aOwnership);
const ag10cDataDoctrine = readJson(inputs.ag10cDataDoctrine);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag10fReview.status !== "table_structured_object_pipeline_planning_created_not_executed") {
  throw new Error("AG10G requires AG10F review.");
}
if (ag10fReadiness.ready_for_ag10g !== true) {
  throw new Error("AG10G requires AG10F readiness.");
}
if (ag10fBoundary.next_stage_id !== "AG10G" || ag10fBoundary.explicit_approval_required !== true) {
  throw new Error("AG10G requires AG10F to AG10G explicit boundary.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG10G selected article hash must match AG09C post-correction hash.");
}

const noMutationControls = {
  map_geographic_object_pipeline_planning_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag10g: false,
  selected_article_file_write_performed_in_ag10g: false,
  homepage_mutation_performed_in_ag10g: false,
  css_mutation_performed_in_ag10g: false,
  js_mutation_performed_in_ag10g: false,
  reference_insertion_performed_in_ag10g: false,
  reference_url_change_performed_in_ag10g: false,
  data_fetch_performed_in_ag10g: false,
  dataset_creation_performed_in_ag10g: false,
  geo_dataset_creation_performed_in_ag10g: false,
  map_generation_performed_in_ag10g: false,
  geographic_object_render_performed_in_ag10g: false,
  map_template_creation_performed_in_ag10g: false,
  rendered_map_creation_performed_in_ag10g: false,
  svg_asset_creation_performed_in_ag10g: false,
  image_asset_creation_performed_in_ag10g: false,
  object_insertion_performed_in_ag10g: false,
  visual_generation_performed_in_ag10g: false,
  image_generation_performed_in_ag10g: false,
  chart_generation_performed_in_ag10g: false,
  infographic_generation_performed_in_ag10g: false,
  table_generation_performed_in_ag10g: false,
  figure_generation_performed_in_ag10g: false,
  diagram_generation_performed_in_ag10g: false,
  live_url_fetch_performed_in_ag10g: false,
  deployment_trigger_performed_in_ag10g: false,
  production_jsonl_append_performed_in_ag10g: false,
  database_write_performed_in_ag10g: false,
  supabase_write_performed_in_ag10g: false,
  backend_auth_supabase_activation_performed_in_ag10g: false,
  rollback_execution_performed_in_ag10g: false,
  public_publishing_operation_performed_in_ag10g: false
};

const mapObjects = ag10bNormalizedTaxonomy.normalized_objects.filter(
  (item) => item.family === "maps_geographic_objects"
);

const inclusionGate = {
  module_id: "AG10G",
  title: "New Aspect Inclusion Gate",
  status: "new_aspect_inclusion_gate_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10g: articleHash,
  purpose: "Before any new aspect, object family, visual type, data layer, map type or article feature is added to Drishvara, it must pass these five governance questions.",
  gate_questions: [
    {
      gate_id: "VISITOR-VALUE",
      question: "Will this improve what a visitor sees?",
      required_answer_for_inclusion: "yes_or_yes_with_conditions",
      failure_action: "Do not include unless visitor-facing value is established."
    },
    {
      gate_id: "TRUST-VALUE",
      question: "Will this make articles more trustworthy?",
      required_answer_for_inclusion: "yes_or_yes_with_conditions",
      failure_action: "Do not include unless trust, evidence, source, credit or clarity improves."
    },
    {
      gate_id: "MEMORY-VALUE",
      question: "Will this make Drishvara memorable?",
      required_answer_for_inclusion: "yes_or_yes_with_conditions",
      failure_action: "Do not include unless it strengthens brand recall or reading experience."
    },
    {
      gate_id: "COST-VALUE",
      question: "Will this reduce future cost?",
      required_answer_for_inclusion: "yes_or_yes_with_conditions",
      failure_action: "Do not include unless it supports reuse, templates, automation or reduced repeated generation."
    },
    {
      gate_id: "INTELLIGENCE-VALUE",
      question: "Will this create reusable intelligence?",
      required_answer_for_inclusion: "yes_or_yes_with_conditions",
      failure_action: "Do not include unless it contributes reusable data, templates, logic, inference or governance memory."
    }
  ],
  pass_rule: "A new aspect may be included only if all five gate questions are answered yes or yes_with_conditions, with the condition recorded.",
  reject_rule: "Any no answer blocks inclusion until the aspect is redesigned.",
  applies_to_future_stages: [
    "new object family",
    "new visual type",
    "new data layer",
    "new chart/map/table/figure/infographic template",
    "new article feature",
    "new automated generation step",
    "new database/backend activation proposal"
  ],
  ag10g_gate_assessment: {
    map_geographic_object_pipeline_planning: {
      visitor_value: "yes",
      trust_value: "yes_with_conditions",
      memory_value: "yes",
      cost_value: "yes_with_conditions",
      intelligence_value: "yes",
      inclusion_decision: "allowed_for_planning_only",
      condition_notes: [
        "Trust value depends on verified geo-source, licence and boundary notes before any future rendering.",
        "Cost value depends on reusable map templates and avoiding expensive external generation unless necessary."
      ]
    }
  },
  ...noMutationControls
};

const mapFamilies = [
  {
    family_id: "AG10G-MAP-BASE",
    family_name: "Geographic and Regional Focus Maps",
    map_types: ["geographic_map", "regional_focus_map"],
    best_for: ["location context", "regional identity", "policy geography", "area explanation"],
    minimum_geo_inputs: ["region_name", "geo_scope", "source_or_boundary_note", "caption", "credit"],
    avoid_when: ["boundary source is unclear", "region is politically sensitive without source", "map adds no reader value"]
  },
  {
    family_id: "AG10G-MAP-DISTRIBUTION",
    family_name: "Bubble and Heat Maps",
    map_types: ["bubble_map", "heat_map", "location_insight_visual"],
    best_for: ["density", "concentration", "regional variation", "indicator intensity"],
    minimum_geo_inputs: ["location", "value", "unit", "geo_scope", "source_note"],
    avoid_when: ["values are unverified", "scale is misleading", "mobile labels become unreadable"]
  },
  {
    family_id: "AG10G-MAP-THEMATIC",
    family_name: "Choropleth and Thematic Maps",
    map_types: ["choropleth_thematic_map"],
    best_for: ["state/district/category comparison", "indicator distribution", "policy coverage"],
    minimum_geo_inputs: ["region_id_or_name", "value", "classification_rule", "source_note", "legend_rule"],
    avoid_when: ["classification distorts meaning", "boundary file rights unclear", "data is stale"]
  },
  {
    family_id: "AG10G-MAP-SERVICE",
    family_name: "Service-Area and Coverage Maps",
    map_types: ["service_area_map"],
    best_for: ["scheme coverage", "service geography", "locality mapping", "infrastructure reach"],
    minimum_geo_inputs: ["service_area_name", "coverage_type", "location_reference", "source_note"],
    avoid_when: ["service area is not verified", "precise location is sensitive", "map may imply official boundary incorrectly"]
  },
  {
    family_id: "AG10G-MAP-FLOW",
    family_name: "Route and Flow Maps",
    map_types: ["route_or_flow_map"],
    best_for: ["movement", "supply path", "connectivity", "migration or transport flow"],
    minimum_geo_inputs: ["origin", "destination", "flow_direction", "flow_value_or_description", "source_note"],
    avoid_when: ["route is speculative", "flow is not source-backed", "visual becomes cluttered"]
  },
  {
    family_id: "AG10G-MAP-CHART-HYBRID",
    family_name: "Geo Chart and Scatter Map Hybrids",
    map_types: ["geo_chart", "scatter_map", "geographic_bubble_chart", "heatmap_chart"],
    best_for: ["map-supported data visualization", "location-value plotting", "spatial BI object"],
    minimum_geo_inputs: ["location_or_coordinate", "value", "unit", "source_note", "mobile_fallback_text"],
    avoid_when: ["better suited as non-map chart", "coordinate precision is weak", "interactive rendering would be required but unavailable"]
  }
];

const familyRegistry = {
  module_id: "AG10G",
  title: "Map and Geographic Object Family Registry",
  status: "map_geographic_object_family_registry_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10g: articleHash,
  source_map_object_count: mapObjects.length,
  map_families: mapFamilies,
  universal_map_schema: {
    required_metadata: [
      "map_type",
      "article_id",
      "object_template_id",
      "geo_source_or_logic_record",
      "map_source_or_boundary_source",
      "licence_or_usage_note",
      "rights_controller",
      "credit_display",
      "caption",
      "alt_text",
      "mobile_fallback_text",
      "layout_zone",
      "theme_variant",
      "reuse_eligibility_status"
    ],
    required_geo_fields: [
      "geo_scope",
      "location_or_region_name",
      "value_or_context",
      "source_note",
      "boundary_note",
      "editorial_purpose",
      "responsive_strategy"
    ],
    optional_geo_fields: [
      "latitude",
      "longitude",
      "region_id",
      "district",
      "state",
      "country",
      "classification_rule",
      "legend_rule",
      "scale_note",
      "coordinate_precision",
      "sensitivity_note",
      "fallback_summary"
    ]
  },
  no_map_generation_in_ag10g: true,
  no_geographic_object_rendering_in_ag10g: true,
  ...noMutationControls
};

const geoSchema = {
  module_id: "AG10G",
  title: "Geo Data and Location Schema",
  status: "geo_data_location_schema_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10g: articleHash,
  schema_components: [
    {
      component_type: "geo_source",
      required_fields: ["geo_source_id", "source_name", "source_reference", "licence_or_usage_note"],
      optional_fields: ["access_date", "publisher", "version", "boundary_source_note"]
    },
    {
      component_type: "location_record",
      required_fields: ["location_id", "location_name", "geo_scope"],
      optional_fields: ["latitude", "longitude", "region_id", "district", "state", "country", "coordinate_precision"]
    },
    {
      component_type: "region_boundary_record",
      required_fields: ["region_id", "region_name", "boundary_source", "boundary_usage_status"],
      optional_fields: ["simplification_level", "validity_period", "sensitivity_note"]
    },
    {
      component_type: "map_metric",
      required_fields: ["metric_id", "metric_label", "value", "unit", "source_note"],
      optional_fields: ["period", "classification_band", "confidence_note", "derived_metric_id"]
    },
    {
      component_type: "legend",
      required_fields: ["legend_id", "legend_items", "classification_rule"],
      optional_fields: ["color_role_mapping", "thresholds", "scale_note"]
    },
    {
      component_type: "mobile_fallback",
      required_fields: ["fallback_summary", "main_geo_insight"],
      optional_fields: ["top_locations", "regional_pattern_note", "accessibility_note"]
    },
    {
      component_type: "reuse_record",
      required_fields: ["reuse_status", "freshness_status", "context_validity_note"],
      optional_fields: ["expiry_date", "reuse_restriction", "prior_article_ids"]
    }
  ],
  validation_rules: [
    "Every map must have a geo source or boundary source note.",
    "Every location must have a declared geo scope.",
    "Coordinate precision must be recorded when latitude/longitude is used.",
    "Sensitive or precise locations must be reviewed before future rendering.",
    "Map must not imply official boundaries unless source supports it.",
    "Mobile fallback summary is mandatory for all map objects.",
    "Map source, licence and credit must be recorded before any future rendering.",
    "Map must pass the New Aspect Inclusion Gate before future generation or insertion."
  ],
  ...noMutationControls
};

const templateDoctrine = {
  module_id: "AG10G",
  title: "Reusable Map Template and Rendered Instance Doctrine",
  status: "reusable_map_template_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10g: articleHash,
  pipeline_model: [
    "map_template",
    "geo_data_binding",
    "rendered_map_instance",
    "article_placement",
    "post_insertion_layout_audit",
    "reuse_log"
  ],
  distinction: {
    map_template: "Reusable Drishvara-owned/controlled map or geo-object layout such as regional focus map, bubble map, heat map, service-area map or flow map.",
    geo_data_binding: "Article-specific locations, boundaries, values, classifications, legends and source notes mapped into the template.",
    rendered_map_instance: "Specific output produced from one template and one geo-data binding.",
    article_placement: "Controlled insertion zone, responsive behavior and fallback text in the article."
  },
  map_template_fields: [
    "map_template_id",
    "map_family",
    "map_type",
    "theme_variant",
    "layout_rule",
    "mobile_rule",
    "caption_rule",
    "credit_rule",
    "geo_schema_required",
    "created_by",
    "rights_controller",
    "ownership_status",
    "reuse_allowed",
    "version",
    "template_hash"
  ],
  rendered_map_fields: [
    "rendered_map_id",
    "map_template_id",
    "article_id",
    "geo_data_binding_id",
    "geo_source_record_ids",
    "boundary_source_record_ids",
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
      rule: "Allowed widely after template is approved, versioned and map-source/licence requirements are clear."
    },
    {
      reuse_type: "rendered_map_reuse",
      rule: "Allowed only when data, boundaries, context, freshness, source/credit and article relevance remain valid."
    }
  ],
  no_template_creation_in_ag10g: true,
  no_rendered_map_creation_in_ag10g: true,
  ...noMutationControls
};

const visualDoctrine = {
  module_id: "AG10G",
  title: "Map Theme, Credit, Mobile and Cost Doctrine",
  status: "map_theme_credit_mobile_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10g: articleHash,
  theme_source_status: ag10aThemeLayout.status,
  ownership_source_status: ag10aOwnership.status,
  data_doctrine_source_status: ag10cDataDoctrine.status,
  map_theme_rules: [
    "Maps must inherit Drishvara article theme and editorial tone.",
    "Avoid stock-map appearance unless required by source/licence.",
    "Use restrained geographic color roles compatible with Drishvara article pages.",
    "Legends and labels must remain readable.",
    "Every map requires caption, credit, alt text and mobile fallback text."
  ],
  credit_rules: [
    {
      condition: "internally prepared map structure with Drishvara logic",
      credit: "Map: Drishvara."
    },
    {
      condition: "external boundary/source map used",
      credit: "Map source: [source]. Map visualisation: Drishvara."
    },
    {
      condition: "external data used on Drishvara map template",
      credit: "Data source: [source]. Map visualisation: Drishvara."
    },
    {
      condition: "mixed geographic and data sources used",
      credit: "Sources: [source list]. Map visualisation: Drishvara."
    }
  ],
  mobile_rules: [
    "No uncontrolled horizontal overflow.",
    "Maps must scale within article column.",
    "Dense labels require simplified mobile version or fallback text.",
    "Legend must remain readable at mobile width.",
    "Map should not rely only on hover/interactivity for core meaning."
  ],
  placement_rules: [
    "Central placement is preferred for maps.",
    "Maps must not deform article shape.",
    "Map placement must follow explanatory context.",
    "Maps should not interrupt paragraph continuity without editorial reason.",
    "Map captions and source notes must remain visible."
  ],
  cost_rules: [
    "Prefer reusable SVG/HTML/static map templates before external generation.",
    "Do not create a map where a table, chart or sentence explains geography sufficiently.",
    "Avoid paid map APIs unless future value and reuse justify the cost.",
    "Record template reuse and source/licence availability before creating a new map template."
  ],
  accessibility_rules: [
    "Alt text must describe the main geographic insight.",
    "Fallback summary must explain the map pattern in text.",
    "Color must not be the only carrier of meaning.",
    "Legend and classification must be understandable without visual-only cues."
  ],
  ...noMutationControls
};

const plan = {
  module_id: "AG10G",
  title: "Map and Geographic Object Pipeline Planning",
  status: "map_geographic_object_pipeline_planning_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10g: articleHash,
  generated_from: inputs,
  new_aspect_inclusion_gate_file: "data/content-intelligence/quality-registry/ag10g-new-aspect-inclusion-gate.json",
  family_registry_file: "data/content-intelligence/object-registry/ag10g-map-geographic-object-family-registry.json",
  geo_schema_file: "data/content-intelligence/object-registry/ag10g-geo-data-location-schema.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10g-reusable-map-template-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10g-map-theme-credit-mobile-doctrine.json",
  carried_forward: {
    ag10f_plan_status: ag10fPlan.status,
    ag10b_scoring_status: ag10bScoring.status,
    ag10b_eligibility_status: ag10bEligibility.status,
    ag10c_data_doctrine_status: ag10cDataDoctrine.status
  },
  stage_principle: "AG10G plans map and geographic-object governance only. No map generation, data fetch, rendering, asset creation or insertion is performed.",
  ...noMutationControls
};

const readiness = {
  module_id: "AG10G",
  title: "Map and Geographic Object Pipeline Readiness",
  status: "map_geographic_object_pipeline_planning_ready_pending_explicit_ag10h",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10g: articleHash,
  new_aspect_inclusion_gate_created: true,
  map_family_registry_created: true,
  geo_data_location_schema_created: true,
  reusable_template_render_instance_doctrine_created: true,
  theme_credit_mobile_cost_doctrine_created: true,
  ready_for_ag10h: true,
  map_generation_ready: false,
  geographic_object_render_ready: false,
  geo_dataset_creation_ready: false,
  data_fetch_ready: false,
  object_insertion_ready: false,
  article_mutation_ready: false,
  backend_activation_ready: false,
  ...noMutationControls
};

const boundary = {
  module_id: "AG10G",
  title: "AG10G to AG10H Generated Image and Editorial Visual Pipeline Planning Boundary",
  status: "ag10h_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10g: articleHash,
  next_stage_id: "AG10H",
  next_stage_title: "Generated Image and Editorial Visual Pipeline Planning",
  explicit_approval_required: true,
  ag10h_allowed_scope: [
    "Define governed generated image and editorial visual pipeline.",
    "Classify hero images, section images, conceptual illustrations, annotated images and quote-image hybrids.",
    "Define prompt/concept/source/rights schema.",
    "Define reusable image concept and rendered visual instance doctrine.",
    "Define theme, ownership, credit, mobile and accessibility rules.",
    "Apply the New Aspect Inclusion Gate before adding image-generation features."
  ],
  ag10h_blocked_scope: [
    "No image generation.",
    "No external image API call.",
    "No image asset creation.",
    "No object insertion.",
    "No article mutation.",
    "No CSS/JS mutation.",
    "No database/Supabase/backend/Auth activation.",
    "No publishing operation."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG10G",
  title: "Map and Geographic Object Pipeline Planning Schema",
  status: "schema_map_geographic_object_pipeline_planning_only",
  new_aspect_inclusion_gate_allowed_in_ag10g: true,
  map_family_registry_allowed_in_ag10g: true,
  geo_data_location_schema_allowed_in_ag10g: true,
  reusable_map_template_doctrine_allowed_in_ag10g: true,
  map_theme_credit_mobile_doctrine_allowed_in_ag10g: true,
  ag10h_boundary_allowed_in_ag10g: true,
  article_mutation_allowed_in_ag10g: false,
  homepage_mutation_allowed_in_ag10g: false,
  css_js_mutation_allowed_in_ag10g: false,
  data_fetch_allowed_in_ag10g: false,
  dataset_creation_allowed_in_ag10g: false,
  geo_dataset_creation_allowed_in_ag10g: false,
  map_generation_allowed_in_ag10g: false,
  geographic_object_render_allowed_in_ag10g: false,
  map_template_creation_allowed_in_ag10g: false,
  rendered_map_creation_allowed_in_ag10g: false,
  svg_asset_creation_allowed_in_ag10g: false,
  image_asset_creation_allowed_in_ag10g: false,
  object_insertion_allowed_in_ag10g: false,
  visual_generation_allowed_in_ag10g: false,
  image_generation_allowed_in_ag10g: false,
  chart_generation_allowed_in_ag10g: false,
  infographic_generation_allowed_in_ag10g: false,
  table_generation_allowed_in_ag10g: false,
  figure_generation_allowed_in_ag10g: false,
  diagram_generation_allowed_in_ag10g: false,
  live_url_fetch_allowed_in_ag10g: false,
  deployment_trigger_allowed_in_ag10g: false,
  production_jsonl_append_allowed_in_ag10g: false,
  database_write_allowed_in_ag10g: false,
  supabase_write_allowed_in_ag10g: false,
  backend_auth_supabase_activation_allowed_in_ag10g: false,
  public_publishing_operation_allowed_in_ag10g: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10g: articleHash,
  source_map_object_count: mapObjects.length,
  map_family_count: mapFamilies.length,
  geo_schema_component_count: geoSchema.schema_components.length,
  inclusion_gate_question_count: inclusionGate.gate_questions.length,
  template_pipeline_steps: templateDoctrine.pipeline_model.length,
  next_stage_id: "AG10H",
  next_stage_title: "Generated Image and Editorial Visual Pipeline Planning",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG10G",
  title: "Map and Geographic Object Pipeline Planning",
  status: "map_geographic_object_pipeline_planning_created_not_executed",
  depends_on: ["AG10F", "AG10E", "AG10D", "AG10C", "AG10B", "AG10A"],
  generated_from: inputs,
  summary,
  inclusion_gate_file: "data/content-intelligence/quality-registry/ag10g-new-aspect-inclusion-gate.json",
  plan_file: "data/content-intelligence/mutation-plans/ag10g-map-geographic-object-pipeline-planning.json",
  family_registry_file: "data/content-intelligence/object-registry/ag10g-map-geographic-object-family-registry.json",
  geo_schema_file: "data/content-intelligence/object-registry/ag10g-geo-data-location-schema.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10g-reusable-map-template-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10g-map-theme-credit-mobile-doctrine.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10g-map-geographic-object-pipeline-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10g-to-ag10h-generated-image-editorial-visual-pipeline-planning-boundary.json",
  schema_file: "data/content-intelligence/schema/map-geographic-object-pipeline-planning.schema.json",
  learning_file: "data/content-intelligence/learning/ag10g-map-geographic-object-pipeline-planning-learning.json",
  closure_decision: {
    decision: "ag10g_map_geographic_object_planning_created_pending_explicit_ag10h",
    proceed_to_ag10h_only_with_explicit_user_approval: true,
    map_generation_performed: false,
    geographic_object_render_performed: false,
    object_insertion_performed: false,
    article_mutation_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG10G",
  title: "Map and Geographic Object Pipeline Planning Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "All future new aspects must pass the five-question inclusion gate before inclusion.",
    "Maps require source, licence, boundary and coordinate governance before rendering.",
    "Map templates must be separated from rendered map instances.",
    "Rendered map reuse is allowed only when geo-data, boundary source, context and freshness remain valid.",
    "Map objects should be generated only when they improve visitor experience, trust, memorability, cost efficiency and reusable intelligence."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG10G",
  title: "Map and Geographic Object Pipeline Planning",
  status: "map_geographic_object_pipeline_planning_created_not_executed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10g-map-geographic-object-pipeline-planning.json",
    plan: "data/content-intelligence/mutation-plans/ag10g-map-geographic-object-pipeline-planning.json",
    inclusion_gate: "data/content-intelligence/quality-registry/ag10g-new-aspect-inclusion-gate.json",
    family_registry: "data/content-intelligence/object-registry/ag10g-map-geographic-object-family-registry.json",
    geo_schema: "data/content-intelligence/object-registry/ag10g-geo-data-location-schema.json",
    template_doctrine: "data/content-intelligence/object-registry/ag10g-reusable-map-template-render-instance-doctrine.json",
    visual_doctrine: "data/content-intelligence/object-registry/ag10g-map-theme-credit-mobile-doctrine.json",
    readiness: "data/content-intelligence/quality-registry/ag10g-map-geographic-object-pipeline-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10g-to-ag10h-generated-image-editorial-visual-pipeline-planning-boundary.json",
    schema: "data/content-intelligence/schema/map-geographic-object-pipeline-planning.schema.json",
    learning: "data/content-intelligence/learning/ag10g-map-geographic-object-pipeline-planning-learning.json",
    preview: "data/quality/ag10g-map-geographic-object-pipeline-planning-preview.json",
    document: "docs/quality/AG10G_MAP_GEOGRAPHIC_OBJECT_PIPELINE_PLANNING.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG10G",
  preview_only: true,
  status: "map_geographic_object_pipeline_planning_created_not_executed",
  summary,
  inclusion_gate_preview: inclusionGate.gate_questions,
  map_families_preview: mapFamilies,
  geo_schema_preview: geoSchema.schema_components,
  template_pipeline_preview: templateDoctrine.pipeline_model,
  ag10h_handoff: boundary,
  ...noMutationControls
};

const doc = `# AG10G — Map and Geographic Object Pipeline Planning

## Purpose

AG10G defines the governed map and geographic-object pipeline for Drishvara.

It covers geographic maps, regional focus maps, bubble maps, heat maps, location insight visuals, choropleth/thematic maps, service-area maps, route/flow maps, geo-data schema, coordinate/location rules, map source/licence/credit rules, mobile fallback rules, reusable map-template doctrine and cost-control gates.

AG10G is planning-only. It does not generate maps, fetch data, create geo datasets, render geographic objects, create assets, insert objects, mutate articles, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## New Aspect Inclusion Gate

Before including any new aspect, Drishvara must ask:

1. Will this improve what a visitor sees?
2. Will this make articles more trustworthy?
3. Will this make Drishvara memorable?
4. Will this reduce future cost?
5. Will this create reusable intelligence?

A new aspect may proceed only when all five checks are answered yes or yes_with_conditions, with conditions recorded.

## Map Families

AG10G records governance scope for geographic/regional maps, bubble/heat maps, thematic maps, service-area maps, route/flow maps and geo-chart hybrids.

## Geo Data Schema

Maps are planned through governed geo-source, location, boundary, metric, legend, mobile fallback and reuse records.

## Template and Rendered Instance Model

Reusable map templates are separated from rendered map instances.

Template reuse may be broad after approval. Rendered map reuse is allowed only when data, boundaries, context, freshness, source/credit and article relevance remain valid.

## Credit Logic

Default patterns include:

- Map: Drishvara.
- Map source: [source]. Map visualisation: Drishvara.
- Data source: [source]. Map visualisation: Drishvara.
- Sources: [source list]. Map visualisation: Drishvara.

## Next Stage

AG10H — Generated Image and Editorial Visual Pipeline Planning — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(inclusionGatePath, inclusionGate);
writeJson(familyRegistryPath, familyRegistry);
writeJson(geoSchemaPath, geoSchema);
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
  throw new Error("AG10G attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG10G map and geographic object pipeline planning artifacts generated.");
console.log(`✅ Map/geographic objects carried forward: ${mapObjects.length}`);
console.log(`✅ Map families recorded: ${mapFamilies.length}`);
console.log("✅ New Aspect Inclusion Gate recorded with five mandatory questions.");
console.log("✅ Geo schema, reusable map-template doctrine and theme/credit/mobile doctrine created.");
console.log("✅ No map generation, data fetch, object insertion, article mutation, backend activation or publishing operation performed.");
console.log("✅ AG10H handoff created with explicit approval required.");
