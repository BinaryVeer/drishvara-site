import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const sourceRoots = [
  "data/methodology",
  "data/review",
  "data/content",
  "data/implementation",
  "data/knowledge",
  "data/backend",
  "data/seo",
  "data/i18n"
];

const outPath = path.join(root, "data", "implementation", "i01-static-registry-loading-manifest-preview.json");

function sha256(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function familyFor(relPath) {
  if (relPath.startsWith("data/methodology/")) return "methodology_registries";
  if (relPath.startsWith("data/review/")) return "review_registries";
  if (relPath.startsWith("data/content/")) {
    if (relPath.includes("preview") || relPath.includes("matrix") || relPath.includes("handoff")) {
      return "content_preview_outputs";
    }
    return "content_governance_registries";
  }
  if (relPath.startsWith("data/implementation/")) return "implementation_planning_registries";
  if (relPath.startsWith("data/knowledge/")) return "knowledge_governance_registries";
  if (relPath.startsWith("data/backend/")) return "backend_planning_registries";
  if (relPath.startsWith("data/seo/")) return "seo_metadata";
  if (relPath.startsWith("data/i18n/")) return "i18n_data";
  return "unknown_static_data";
}

function walkJsonFiles(dirPath) {
  const results = [];
  if (!fs.existsSync(dirPath)) return results;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(fullPath);
    }
  }

  return results;
}

const candidates = [];

for (const sourceRoot of sourceRoots) {
  const absRoot = path.join(root, sourceRoot);
  const files = walkJsonFiles(absRoot);

  for (const filePath of files) {
    const relPath = path.relative(root, filePath);
    const raw = fs.readFileSync(filePath);

    candidates.push({
      relative_path: relPath,
      family: familyFor(relPath),
      size_bytes: raw.length,
      sha256: sha256(raw),
      load_policy: "read_only_static_candidate",
      mutation_allowed: false,
      runtime_load_enabled: false,
      public_output_allowed: false,
      sensitivity_note: relPath.includes("preview") || relPath.includes("dry-run") || relPath.includes("handoff")
        ? "internal_preview_or_handoff_data"
        : "static_governance_or_site_data",
      future_use_note: "May be considered for future read-only internal tooling only after separate approval."
    });
  }
}

const familyCounts = {};
for (const candidate of candidates) {
  familyCounts[candidate.family] = (familyCounts[candidate.family] || 0) + 1;
}

const output = {
  manifest_id: "I01_STATIC_REGISTRY_LOADING_MANIFEST_PREVIEW",
  module_id: "I01",
  status: "preview_only_static_registry_loading_manifest",
  preview_only: true,
  source_roots_scanned: sourceRoots,
  summary: {
    registry_candidate_count: candidates.length,
    family_counts: familyCounts,
    mutation_allowed_count: 0,
    runtime_load_enabled_count: 0,
    public_output_allowed_count: 0
  },
  registry_candidates: candidates,
  blocked_capabilities: [
    "runtime_loader",
    "api_route",
    "server_endpoint",
    "supabase",
    "auth",
    "payment",
    "rls",
    "admin_ui",
    "admin_route",
    "live_review_queue",
    "approval_workflow",
    "content_mutation",
    "homepage_mutation",
    "sitemap_mutation",
    "seo_metadata_mutation",
    "final_registry_write",
    "database_migration",
    "ml_ingestion",
    "embedding_generation",
    "model_training",
    "vector_database_write",
    "external_api_fetch",
    "public_output",
    "subscriber_output",
    "folder_restructure",
    "file_deletion",
    "gitignore_modification"
  ],
  next_recommended_stage: "I02 — Feature Flag and Environment Boundary Plan"
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${candidates.length} static registry candidates.`);
