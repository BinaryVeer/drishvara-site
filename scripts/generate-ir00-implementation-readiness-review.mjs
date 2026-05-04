import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "implementation", "ir00-implementation-readiness-review-go-no-go-gate.json");
const outPath = path.join(root, "data", "implementation", "ir00-implementation-readiness-review-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);

const evidenceStatus = {};
for (const relPath of registry.evidence_sources) {
  evidenceStatus[relPath] = fs.existsSync(path.join(root, relPath)) ? "present" : "missing";
}

const reviewAreas = registry.review_areas.map((area) => ({
  ...area,
  activated: false,
  activation_allowed: false,
  design_only_allowed: String(area.go_no_go || "").includes("design") || String(area.go_no_go || "").includes("reference"),
  next_action: String(area.go_no_go || "").includes("no_go")
    ? "resolve_blockers_before_activation_review"
    : "may_inform_future_design_only_module"
}));

const goNoGoCounts = {};
const readinessCounts = {};
for (const area of reviewAreas) {
  goNoGoCounts[area.go_no_go] = (goNoGoCounts[area.go_no_go] || 0) + 1;
  readinessCounts[area.readiness_status] = (readinessCounts[area.readiness_status] || 0) + 1;
}

const missingEvidence = Object.entries(evidenceStatus).filter(([, status]) => status !== "present").map(([relPath]) => relPath);

const output = {
  preview_id: "IR00_IMPLEMENTATION_READINESS_REVIEW_PREVIEW",
  module_id: "IR00",
  status: "preview_only_go_no_go_review_no_activation",
  preview_only: true,
  review_areas: reviewAreas,
  summary: {
    review_area_count: reviewAreas.length,
    go_no_go_counts: goNoGoCounts,
    readiness_counts: readinessCounts,
    evidence_source_count: registry.evidence_sources.length,
    missing_evidence_count: missingEvidence.length,
    missing_evidence,
    activation_allowed_count: 0,
    activated_count: 0,
    runtime_activation_allowed: false,
    backend_activation_allowed: false,
    supabase_activation_allowed: false,
    auth_activation_allowed: false,
    public_output_activation_allowed: false,
    subscriber_output_activation_allowed: false,
    ml_embedding_activation_allowed: false,
    design_only_allowed: true
  },
  default_decision: registry.default_decision,
  critical_activation_blockers: registry.critical_activation_blockers,
  allowed_next_design_only_work: registry.allowed_next_design_only_work,
  prohibited_activation_actions: registry.prohibited_activation_actions,
  evidence_sources: evidenceStatus,
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${reviewAreas.length} readiness review areas and activation no-go.`);
