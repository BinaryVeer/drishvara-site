import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "lv01-manual-live-verification-result-record.json");
const lv00PreviewPath = path.join(root, "data", "quality", "lv00-manual-live-verification-preview.json");
const outPath = path.join(root, "data", "quality", "lv01-manual-live-verification-result-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson(registryPath);
const lv00 = readJson(lv00PreviewPath);

const severityCounts = {};
const areaCounts = {};

for (const finding of registry.manual_findings) {
  severityCounts[finding.severity] = (severityCounts[finding.severity] || 0) + 1;
  areaCounts[finding.area] = (areaCounts[finding.area] || 0) + 1;
}

const output = {
  preview_id: "LV01_MANUAL_LIVE_VERIFICATION_RESULT_PREVIEW",
  module_id: "LV01",
  status: "preview_only_manual_live_result_record_no_activation",
  preview_only: true,
  lv00_evidence: {
    lv00_preview_present: true,
    lv00_decision: lv00?.decision?.live_verification_decision ?? null,
    lv00_static_evidence_clean: lv00?.static_evidence?.static_evidence_clean ?? null,
    lv00_activation_allowed: lv00?.decision?.activation_allowed ?? null
  },
  manual_result: registry.manual_result,
  manual_findings: registry.manual_findings.map((finding) => ({
    ...finding,
    mutation_performed: false,
    activation_performed: false
  })),
  verified_reference_link_rules: registry.verified_reference_link_rules,
  image_credit_rules: registry.image_credit_rules,
  common_navigation_required: registry.common_navigation_required,
  dropdown_debug_focus: registry.dropdown_debug_focus,
  summary: {
    finding_count: registry.manual_findings.length,
    severity_counts: severityCounts,
    area_counts: areaCounts,
    verified_reference_rule_count: registry.verified_reference_link_rules.length,
    image_credit_rule_count: registry.image_credit_rules.length,
    mutation_performed_count: 0,
    activation_performed_count: 0,
    clean_live_confidence: false,
    backend_activation_allowed: false,
    supabase_activation_allowed: false,
    auth_activation_allowed: false,
    api_activation_allowed: false,
    deployment_allowed: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${registry.manual_findings.length} manual live findings.`);
console.log(`Manual live result: ${registry.manual_result.overall_status}`);
console.log(`Next recommended stage: ${registry.recommended_next_stage.module_id}`);
