import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const planPath = path.join(root, "data", "quality", "lf01-targeted-homepage-fix-plan-preview.json");
const registryPath = path.join(root, "data", "quality", "lf01-targeted-homepage-asset-link-fix-patch.json");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "data", "quality", "lf01-targeted-homepage-fix-apply-result.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);
const plan = readJson(planPath);

if (!fs.existsSync(indexPath)) {
  throw new Error("index.html is required for LF01 apply step");
}

let html = fs.readFileSync(indexPath, "utf8");
const originalHtml = html;

const applied = [];
const unresolved = [];

for (const item of plan.planned_reference_fixes || []) {
  if (!item.apply_allowed || !item.planned_replacement) {
    unresolved.push({
      finding_id: item.finding_id,
      original_reference: item.original_reference,
      reason: item.skip_reason || "not_apply_allowed"
    });
    continue;
  }

  if (!html.includes(item.original_reference)) {
    unresolved.push({
      finding_id: item.finding_id,
      original_reference: item.original_reference,
      reason: "original_reference_not_found_in_index_html"
    });
    continue;
  }

  html = html.split(item.original_reference).join(item.planned_replacement);

  applied.push({
    finding_id: item.finding_id,
    finding_type: item.finding_type,
    original_reference: item.original_reference,
    replacement_reference: item.planned_replacement,
    modified_file: "index.html",
    mutation_type: "string_reference_replacement_only"
  });
}

if (html !== originalHtml) {
  fs.writeFileSync(indexPath, html);
}

const output = {
  apply_id: "LF01_TARGETED_HOMEPAGE_FIX_APPLY_RESULT",
  module_id: "LF01",
  status: "limited_homepage_reference_fix_apply_result",
  applied: true,
  modified_files: html !== originalHtml ? ["index.html"] : [],
  applied_reference_fixes: applied,
  unresolved_findings: unresolved,
  summary: {
    planned_finding_count: (plan.planned_reference_fixes || []).length,
    applied_fix_count: applied.length,
    unresolved_finding_count: unresolved.length,
    modified_file_count: html !== originalHtml ? 1 : 0,
    mutation_scope: html !== originalHtml ? "index.html reference strings only" : "no_mutation_required_or_safe",
    file_deletion_performed: false,
    file_move_performed: false,
    new_page_created: false,
    new_asset_created: false,
    backend_activation_performed: false,
    api_route_created: false,
    supabase_enabled: false,
    auth_enabled: false,
    frontend_deployment_performed: false
  },
  blocked_capabilities: registry.blocked_capabilities
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)}.`);
console.log(`Applied safe reference fixes: ${applied.length}`);
console.log(`Unresolved findings: ${unresolved.length}`);
console.log(`Modified files: ${output.modified_files.join(", ") || "none"}`);
