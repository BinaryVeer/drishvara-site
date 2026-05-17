import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "data", "quality", "ag06b-content-intelligence-schema.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

const config = readJson(configPath);
const ag06a = readJson(path.join(root, config.input_files.ag06a_audit));
const activeRegister = readJson(path.join(root, config.input_files.source_tree_active_register));
const ag05z = readJson(path.join(root, config.input_files.ag05z_closure));
const ag04z = readJson(path.join(root, config.input_files.ag04z_closure));
const ag03z = readJson(path.join(root, config.input_files.ag03z_closure));

if (ag06a.module_id !== "AG06A") throw new Error("AG06A audit missing/invalid.");
if (ag06a.summary?.next_stage_id !== "AG06B") throw new Error("AG06A must identify AG06B as next.");
if (activeRegister.register_id !== "SOURCE_TREE_ACTIVE_REGISTER") throw new Error("Source Tree Active Register missing/invalid.");
if (ag05z.summary?.ag05_public_page_live_readiness_smoke_governance_closed !== true) throw new Error("AG05Z must remain closed.");
if (ag04z.summary?.ag04_closure_preserved !== true && ag04z.summary?.ag04_visual_credit_width_governance_closed !== true) throw new Error("AG04Z must remain closed.");
if (ag03z.summary?.ag03_reference_scaling_closed !== true) throw new Error("AG03Z must remain closed.");

for (const folder of Object.values(config.content_intelligence_roots)) {
  fs.mkdirSync(path.join(root, folder), { recursive: true });
}

const baseSchemaMeta = {
  schema_version: "0.1.0",
  governance_module: "AG06B",
  status: "schema_definition_only",
  public_article_mutation_allowed: false,
  backend_activation_allowed: false,
  supabase_activation_allowed: false,
  auth_activation_allowed: false
};

const contentPacketSchema = {
  ...baseSchemaMeta,
  schema_id: "DRISHVARA_CONTENT_PACKET_SCHEMA",
  description: "Canonical schema for one future Drishvara article/content package.",
  required_sections: config.required_content_packet_sections,
  fields: {
    identity: {
      content_id: "string; stable unique ID",
      run_id: "string; generation run ID",
      source_layer: "enum: public_article | scaffold_output | generated_draft | manual_seed | future_pipeline",
      created_at: "ISO datetime",
      updated_at: "ISO datetime"
    },
    topic: {
      title: "string",
      category: "string",
      subcategory: "string|null",
      tags: "array<string>",
      topic_origin: "string",
      why_this_topic_matters: "string"
    },
    audience: {
      target_reader: "string",
      reading_level: "string",
      visitor_value_statement: "string"
    },
    intent: {
      article_intent: "enum: explain | compare | reflect | guide | analyze | synthesize",
      expected_reader_takeaway: "string",
      content_depth_target: "enum: short | standard | long_form | research_grade"
    },
    research: {
      research_brief: "object",
      source_candidates: "array<object>",
      rejected_sources: "array<object>",
      source_notes: "string"
    },
    references: {
      approved_references: "array<{url,title,source_type,credibility_class,availability_status,checked_at}>",
      reference_count: "number",
      insertion_status: "enum: pending | inserted | verified | failed"
    },
    drafts: {
      outline: "object|string",
      draft_v1: "string",
      draft_v2: "string|null",
      integrated_draft: "string|null",
      editorial_revision_notes: "array<string>"
    },
    final_article: {
      final_markdown_path: "string|null",
      final_html_path: "string|null",
      final_text: "string|null",
      word_count: "number",
      required_min_word_count: "number",
      required_max_word_count: "number"
    },
    visuals: {
      hero_visual_prompt: "string|null",
      visual_plan: "array<object>",
      infographic_plan: "array<object>",
      chart_or_table_plan: "array<object>",
      actual_visual_assets: "array<object>",
      image_credit: "string|null",
      attribution_status: "enum: pending | verified | not_required"
    },
    quality: {
      quality_score: "number|null",
      source_score: "number|null",
      visual_score: "number|null",
      originality_score: "number|null",
      factual_risk_level: "enum: low | medium | high | unknown",
      visitor_value_score: "number|null"
    },
    review: {
      human_review_status: "enum: not_started | pending | approved | rejected | needs_revision",
      reviewer_notes: "array<string>",
      approval_record_id: "string|null"
    },
    publishing: {
      publish_status: "enum: draft | review_queue | approved | publish_ready | published | archived | rejected",
      published_url: "string|null",
      public_article_path: "string|null",
      published_at: "ISO datetime|null"
    },
    learning: {
      learning_snapshot_path: "string|null",
      extracted_lessons: "array<object>",
      promoted_lessons: "array<object>"
    },
    reuse: {
      reuse_tags: "array<string>",
      embedding_eligible: "boolean",
      ml_training_eligible: "boolean",
      future_article_seed_eligible: "boolean"
    }
  }
};

const runRegistrySchema = {
  ...baseSchemaMeta,
  schema_id: "DRISHVARA_RUN_REGISTRY_SCHEMA",
  description: "Tracks generation runs and maps run artifacts to content packets.",
  fields: {
    run_id: "string",
    run_type: "enum: scaffold | public_generator | future_pipeline | manual",
    input_path: "string|null",
    output_folder: "string|null",
    artifact_paths: "array<string>",
    content_id: "string|null",
    run_status: "enum: complete | partial | failed | archived",
    generated_at: "ISO datetime|null",
    preservation_status: "enum: unregistered | registered | reviewed | imported"
  }
};

const referenceRegistrySchema = {
  ...baseSchemaMeta,
  schema_id: "DRISHVARA_REFERENCE_REGISTRY_SCHEMA",
  description: "Tracks source candidates, approved references, rejected references and link health.",
  fields: {
    reference_id: "string",
    content_id: "string",
    url: "string",
    title: "string|null",
    source_domain: "string|null",
    source_type: "enum: official | academic | news | institutional | book | dataset | other",
    credibility_class: "enum: high | medium | low | unknown",
    availability_status: "enum: pending | reachable | unreachable | redirected | rejected",
    reason_for_selection: "string|null",
    rejection_reason: "string|null",
    checked_at: "ISO datetime|null"
  }
};

const visualRegistrySchema = {
  ...baseSchemaMeta,
  schema_id: "DRISHVARA_VISUAL_REGISTRY_SCHEMA",
  description: "Tracks hero visuals, infographic ideas, diagrams, data boxes and actual assets.",
  fields: {
    visual_id: "string",
    content_id: "string",
    visual_type: "enum: hero | infographic | diagram | timeline | map | chart | table | data_box | quote_card",
    prompt: "string|null",
    asset_path: "string|null",
    public_src: "string|null",
    credit_text: "string|null",
    attribution_status: "enum: pending | verified | not_required",
    production_status: "enum: planned | generated | assigned | rejected | published"
  }
};

const qualityReviewSchema = {
  ...baseSchemaMeta,
  schema_id: "DRISHVARA_QUALITY_REVIEW_SCHEMA",
  description: "Stores content quality, factual risk, visual depth and visitor value scoring.",
  fields: {
    review_id: "string",
    content_id: "string",
    word_count: "number",
    long_form_compliance: "boolean",
    reference_compliance: "boolean",
    visual_compliance: "boolean",
    originality_score: "number|null",
    visitor_value_score: "number|null",
    factual_risk_level: "enum: low | medium | high | unknown",
    review_status: "enum: passed | failed | needs_revision | pending",
    issues: "array<object>"
  }
};

const publishQueueSchema = {
  ...baseSchemaMeta,
  schema_id: "DRISHVARA_PUBLISH_QUEUE_SCHEMA",
  description: "Controls draft to approval to publish-ready workflow.",
  fields: {
    queue_id: "string",
    content_id: "string",
    queue_status: "enum: draft | pending_review | approved | publish_ready | published | rejected | archived",
    required_checks: "array<string>",
    completed_checks: "array<string>",
    approval_required: "boolean",
    approved_by: "string|null",
    approved_at: "ISO datetime|null",
    publish_target_path: "string|null"
  }
};

const learningSnapshotSchema = {
  ...baseSchemaMeta,
  schema_id: "DRISHVARA_LEARNING_SNAPSHOT_SCHEMA",
  description: "Stores lessons extracted from generated outputs for future production intelligence.",
  fields: {
    learning_id: "string",
    content_id: "string",
    run_id: "string|null",
    lesson_type: "enum: writing | structure | visual | reference | quality | audience | failure",
    lesson_summary: "string",
    evidence_path: "string|null",
    promotion_status: "enum: candidate | validated | promoted | rejected"
  }
};

const schemas = [
  [config.schema_outputs.content_packet_schema, contentPacketSchema],
  [config.schema_outputs.run_registry_schema, runRegistrySchema],
  [config.schema_outputs.reference_registry_schema, referenceRegistrySchema],
  [config.schema_outputs.visual_registry_schema, visualRegistrySchema],
  [config.schema_outputs.quality_review_schema, qualityReviewSchema],
  [config.schema_outputs.publish_queue_schema, publishQueueSchema],
  [config.schema_outputs.learning_snapshot_schema, learningSnapshotSchema]
];

for (const [outPath, schema] of schemas) {
  writeJson(path.join(root, outPath), schema);
}

const manifest = {
  manifest_id: "AG06B_CONTENT_INTELLIGENCE_SCHEMA_MANIFEST",
  module_id: "AG06B",
  generated_at: new Date().toISOString(),
  schema_version: "0.1.0",
  source_context: {
    ag06a_summary: ag06a.summary,
    source_tree_register_status: activeRegister.status,
    ag05z_closed: true,
    ag04z_closed: true,
    ag03z_closed: true
  },
  content_intelligence_roots: config.content_intelligence_roots,
  schema_outputs: config.schema_outputs,
  required_content_packet_sections: config.required_content_packet_sections,
  summary: {
    schema_file_count: schemas.length,
    content_packet_required_section_count: config.required_content_packet_sections.length,
    public_article_mutation_performed: false,
    reference_url_change_performed: false,
    backend_auth_supabase_activation_performed: false,
    ready_for_ag06c_scaffold_output_preservation_register: true,
    next_stage_id: "AG06C"
  },
  next_recommended_stage: config.recommended_next_stage
};

const preview = {
  preview_id: "AG06B_CONTENT_INTELLIGENCE_SCHEMA_PREVIEW",
  module_id: "AG06B",
  preview_only: true,
  status: "content_intelligence_schema_defined",
  summary: manifest.summary,
  content_intelligence_roots: config.content_intelligence_roots,
  schema_outputs: config.schema_outputs,
  mutation_performed: false,
  next_recommended_stage: config.recommended_next_stage
};

writeJson(path.join(root, config.schema_outputs.manifest), manifest);
writeJson(path.join(root, config.schema_outputs.preview), preview);

console.log(`Created ${config.schema_outputs.manifest}.`);
for (const [outPath] of schemas) console.log(`Created ${outPath}.`);
console.log(`Created ${config.schema_outputs.preview}.`);
console.log(`Schema files: ${manifest.summary.schema_file_count}`);
console.log(`Required content packet sections: ${manifest.summary.content_packet_required_section_count}`);
console.log(`Next stage: ${manifest.summary.next_stage_id}`);
console.log("Mutation performed: false");
