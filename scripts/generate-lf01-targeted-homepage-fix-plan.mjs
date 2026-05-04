import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "lf01-targeted-homepage-asset-link-fix-patch.json");
const lf00PreviewPath = path.join(root, "data", "quality", "lf00-homepage-asset-link-findings-preview.json");
const outPath = path.join(root, "data", "quality", "lf01-targeted-homepage-fix-plan-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function cleanRef(ref) {
  return String(ref || "").split("#")[0].split("?")[0].replace(/^\.\//, "").replace(/^\//, "");
}

function basenameOf(ref) {
  return path.basename(cleanRef(ref));
}

function isExcluded(relPath, excludedMarkers) {
  const normalized = relPath.replaceAll(path.sep, "/");
  const lower = normalized.toLowerCase();
  return excludedMarkers.some((marker) => lower.includes(marker.toLowerCase()));
}

function walk(dir, excludedMarkers, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll(path.sep, "/");

    if (isExcluded(rel, excludedMarkers)) continue;

    if (entry.isDirectory()) {
      walk(full, excludedMarkers, files);
    } else {
      files.push(rel);
    }
  }
  return files;
}

const registry = readJson(registryPath);
const lf00 = readJson(lf00PreviewPath);

const allFiles = walk(root, registry.excluded_candidate_path_markers);

function findCandidates(ref) {
  const base = basenameOf(ref);
  if (!base) return [];
  return allFiles.filter((rel) => path.basename(rel) === base && rel !== cleanRef(ref));
}

function buildPlan(finding, findingType) {
  const candidates = findCandidates(finding.reference);
  const safeCandidateCount = candidates.length;
  const canApply = safeCandidateCount === 1;

  return {
    finding_id: finding.finding_id,
    finding_type: findingType,
    original_reference: finding.reference,
    finding_class: finding.finding_class,
    severity: finding.severity,
    recommended_action_from_lf00: finding.recommended_action,
    safe_candidate_count: safeCandidateCount,
    safe_candidates: candidates,
    planned_replacement: canApply ? candidates[0] : null,
    apply_allowed: canApply,
    skip_reason: canApply ? null : (safeCandidateCount === 0 ? "no_safe_candidate_found" : "multiple_safe_candidates_found"),
    mutation_scope: canApply ? "index_html_reference_replacement_only" : "none"
  };
}

const assetPlans = (lf00.asset_findings || []).map((finding) => buildPlan(finding, "asset"));
const linkPlans = (lf00.link_findings || []).map((finding) => buildPlan(finding, "link"));
const planned = [...assetPlans, ...linkPlans];

const output = {
  preview_id: "LF01_TARGETED_HOMEPAGE_FIX_PLAN_PREVIEW",
  module_id: "LF01",
  status: "preview_only_targeted_fix_plan",
  preview_only: true,
  source_findings: {
    lf00_asset_finding_count: lf00.summary?.asset_finding_count ?? 0,
    lf00_link_finding_count: lf00.summary?.link_finding_count ?? 0,
    lf00_total_finding_count: lf00.summary?.total_finding_count ?? 0
  },
  planned_reference_fixes: planned,
  summary: {
    planned_finding_count: planned.length,
    planned_asset_fix_count: assetPlans.length,
    planned_link_fix_count: linkPlans.length,
    auto_applicable_count: planned.filter((p) => p.apply_allowed).length,
    unresolved_count: planned.filter((p) => !p.apply_allowed).length,
    mutation_scope: "index.html only, reference strings only",
    file_deletion_enabled: false,
    file_move_enabled: false,
    backend_activation_enabled: false,
    api_route_enabled: false,
    supabase_enabled: false,
    auth_enabled: false,
    frontend_deployment_enabled: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${planned.length} planned finding reviews.`);
console.log(`Auto-applicable safe reference fixes: ${output.summary.auto_applicable_count}`);
console.log(`Unresolved findings requiring manual review: ${output.summary.unresolved_count}`);
