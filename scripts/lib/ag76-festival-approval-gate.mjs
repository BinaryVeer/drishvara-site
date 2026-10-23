import {
  ag76DateKey, ag76Failure, ag76Id, ag76NoActivation, ag76Object,
  ag76Require, ag76Text
} from "./ag76-festival-astronomy-adapter.mjs";

export const AG76_APPROVAL_GATE_VERSION = "1.0.0";
export const AG76_RULE_KEYS = [
  "event_id", "rule_id", "rule_version", "calendar_basis", "applicability",
  "candidate_selectors", "precedence_policy", "exception_branches", "parent_child_sequence",
  "public_window_policy", "ritual_window_policies", "parana_conclusion_policy",
  "evidence_refs", "source_evidence", "governance", "metadata",
  "public_output_allowed", "runtime_activation"
];
export const AG76_R3_CONTRACT_VERSION = "ag76.r3.v1";

const REVIEW_STATES = ["draft", "source_review_pending", "rule_review_pending",
  "approved", "withheld", "deprecated"];
const WINDOW_STATES = ["approved", "withheld", "withheld_pending_source_review",
  "withheld_pending_rule_review", "not_separately_governed"];
const PURPOSES = ["event_definition", "canonical_name", "date_rule", "timing_rule",
  "ritual_rule", "legal_status", "jurisdiction_status", "official_observance", "translation"];
const TRADITIONS = ["hindu", "christian", "islamic", "sikh", "buddhist", "jain",
  "jewish", "secular", "civil", "international"];
const APPLICABILITY_KEYS = ["countries", "regions", "traditions", "sampradayas"];

function enumValue(value, choices, label) {
  ag76Require(typeof value === "string" && choices.includes(value),
    "unknown_governance_state", "Unknown " + label + ".");
}

function array(value, label) {
  ag76Require(Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype &&
    value.length <= 256, "invalid_array",
    label + " must be a bounded array.");
  for (const key of Reflect.ownKeys(value)) {
    if (key === "length") continue;
    const property = Object.getOwnPropertyDescriptor(value, key);
    ag76Require(typeof key === "string" && /^(0|[1-9][0-9]*)$/.test(key) &&
      Number(key) < value.length && property && "value" in property,
    "invalid_data", label + " must contain data entries only.");
  }
  ag76Require(Object.keys(value).length === value.length, "invalid_array", "Sparse arrays are unsupported.");
  return value;
}

function scope(value, label, variant = false) {
  ag76Object(value, variant ? ["variant_id", ...APPLICABILITY_KEYS] :
    [...APPLICABILITY_KEYS, "variant_policy", "variants"], label);
  if (variant) ag76Id(value.variant_id, "variant_id");
  for (const key of APPLICABILITY_KEYS) {
    const values = array(value[key], label + "." + key);
    ag76Require(values.length > 0 && new Set(values).size === values.length,
      "invalid_applicability", "Applicability lists must be non-empty and unique.");
    for (const item of values) {
      ag76Text(item, key);
      ag76Require(item === "*" || (key === "countries" ? /^[A-Z]{2}$/.test(item) :
        /^[a-z][a-z0-9_]*$/.test(item)), "invalid_applicability", "Invalid " + key + " value.");
      if (key === "traditions" && item !== "*") {
        ag76Require(TRADITIONS.includes(item), "invalid_applicability", "Unsupported tradition.");
      }
    }
    ag76Require(!values.includes("*") || values.length === 1,
      "invalid_applicability", "A wildcard must be the only scope entry.");
  }
}

function windowPolicy(policy, ritual = false) {
  ag76Object(policy, ritual ? ["ritual_window_id", "approval_status"] :
    ["mode", "approval_status"], ritual ? "ritual policy" : "public window policy");
  if (ritual) ag76Id(policy.ritual_window_id, "ritual_window_id");
  else ag76Require(policy.mode === "withheld", "unsupported_public_window_policy",
    "R1 supports withheld public-window policies only.");
  enumValue(policy.approval_status, WINDOW_STATES, "window approval state");
}

export function validateAg76GovernanceContract(rule) {
  ag76Object(rule, [...AG76_RULE_KEYS, "contract_version"], "rule");
  if (Object.hasOwn(rule, "contract_version")) ag76Require(
    rule.contract_version === AG76_R3_CONTRACT_VERSION,
    "unsupported_contract_version", "Unknown AG76 contract version.");
  ag76NoActivation(rule);
  ag76Id(rule.event_id, "event_id");
  ag76Id(rule.rule_id, "rule_id");
  ag76Require(typeof rule.rule_version === "string" &&
    /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/.test(rule.rule_version),
  "invalid_rule_version", "rule_version must be a numeric major.minor.patch version.");
  if (rule.metadata !== undefined) {
    ag76Object(rule.metadata, ["synthetic_fixture", "label"], "metadata");
    if (rule.metadata.synthetic_fixture !== undefined) ag76Require(
      typeof rule.metadata.synthetic_fixture === "boolean", "invalid_metadata", "Invalid synthetic marker.");
    if (rule.metadata.label !== undefined) ag76Text(rule.metadata.label, "metadata.label");
  }
  scope(rule.applicability, "applicability");
  const policy = rule.applicability.variant_policy;
  ag76Require(["none", "explicit_required"].includes(policy),
    "unsupported_variant_policy", "Unsupported variant policy.");
  const variants = array(rule.applicability.variants, "variants");
  for (const variant of variants) scope(variant, "variant", true);
  ag76Require(new Set(variants.map(item => item.variant_id)).size === variants.length,
    "ambiguous_variant_selection", "Variant identifiers must be unique.");
  ag76Require(policy === "none" ? variants.length === 0 : variants.length > 0,
    "ambiguous_variant_selection", "Variant policy and definitions disagree.");

  if (rule.governance !== undefined) {
    ag76Object(rule.governance, ["rule_review_status"], "governance");
    enumValue(rule.governance.rule_review_status, REVIEW_STATES, "rule review state");
  }
  const evidence = rule.source_evidence === undefined ? [] : array(rule.source_evidence, "source_evidence");
  for (const entry of evidence) {
    ag76Object(entry, ["purpose", "source_body", "source_type", "source_reference",
      "source_url_or_identifier", "source_validity", "review_status",
      "reviewed_by_or_process", "review_date"], "source evidence");
    ag76Require(PURPOSES.includes(entry.purpose), "invalid_evidence_purpose",
      "Evidence requires an AG74Q-R1 purpose.");
    ag76Text(entry.source_reference, "source_reference");
    ag76Require(/^[A-Za-z0-9][A-Za-z0-9._:/#?=&%+@-]{1,255}$/.test(entry.source_reference),
      "invalid_source_reference", "A stable source reference is required.");
    enumValue(entry.review_status, REVIEW_STATES, "source evidence review state");
    for (const key of ["source_body", "source_type", "source_url_or_identifier",
      "reviewed_by_or_process"]) {
      if (entry[key] !== undefined && entry[key] !== null) ag76Text(entry[key], key);
    }
    ag76Require(entry.source_validity === undefined || entry.source_validity === null,
      "unsupported_source_validity", "Structured source-validity policies are not implemented in R1.");
    if (entry.review_date !== undefined && entry.review_date !== null) ag76DateKey(entry.review_date);
    if (entry.review_status === "approved") {
      ag76Text(entry.reviewed_by_or_process, "reviewed_by_or_process");
      ag76DateKey(entry.review_date);
    }
  }
  ag76Require(new Set(evidence.map(item => item.purpose + ":" + item.source_reference)).size === evidence.length,
    "duplicate_source_evidence", "Duplicate purpose/reference evidence entries.");
  if (rule.evidence_refs !== undefined) {
    for (const reference of array(rule.evidence_refs, "evidence_refs")) {
      ag76Require(typeof reference === "string", "noncanonical_evidence_reference",
        "evidence_refs may contain canonical reference strings, never review states.");
      ag76Require(evidence.some(entry => entry.source_reference === reference),
        "unresolved_evidence_reference", "Evidence reference has no canonical source_evidence entry.");
    }
    ag76Require(new Set(rule.evidence_refs).size === rule.evidence_refs.length,
      "duplicate_evidence_reference", "Duplicate evidence reference.");
  }
  if (rule.public_window_policy !== undefined) windowPolicy(rule.public_window_policy);
  const rituals = rule.ritual_window_policies === undefined ? [] :
    array(rule.ritual_window_policies, "ritual_window_policies");
  for (const ritual of rituals) windowPolicy(ritual, true);
  ag76Require(new Set(rituals.map(item => item.ritual_window_id)).size === rituals.length,
    "duplicate_ritual_policy", "Ritual policies must have unique identifiers.");
  if (rule.parana_conclusion_policy !== undefined) {
    const conclusion = rule.parana_conclusion_policy;
    ag76Object(conclusion, ["applicability", "approval_status", "type"], "conclusion policy");
    ag76Require(["applicable", "not_applicable", "tradition_specific", "rule_dependent"]
      .includes(conclusion.applicability), "invalid_conclusion_applicability",
    "Conclusion applicability must remain explicit.");
    enumValue(conclusion.approval_status, WINDOW_STATES, "conclusion approval state");
    if (conclusion.type !== undefined) ag76Require(
      ["parana", "conclusion", "vrat_conclusion", "observance_conclusion"].includes(conclusion.type),
      "invalid_conclusion_type", "Unknown conclusion type.");
  }
  return { evidence, rituals };
}

export function resolveAg76Applicability(applicability, context) {
  ag76Object(context, ["country_code", "region", "tradition", "sampradaya", "variant_id"],
    "approval context");
  for (const [key, value] of Object.entries(context)) ag76Text(value, key);
  if (context.country_code !== undefined) ag76Require(/^[A-Z]{2}$/.test(context.country_code),
    "invalid_applicability_context", "Country context must be an uppercase two-letter code.");
  if (context.tradition !== undefined) ag76Require(TRADITIONS.includes(context.tradition),
    "invalid_applicability_context", "Unknown tradition context.");
  for (const key of ["region", "sampradaya", "variant_id"]) {
    if (context[key] !== undefined) ag76Id(context[key], key);
  }
  const check = definition => {
    const fields = { countries: "country_code", regions: "region",
      traditions: "tradition", sampradayas: "sampradaya" };
    for (const [key, field] of Object.entries(fields)) {
      if (definition[key].includes("*")) continue;
      ag76Require(context[field] !== undefined, "applicability_context_required",
        "The rule requires " + field + ".", { field });
      ag76Require(definition[key].includes(context[field]), "inapplicable_rule",
        "The supplied " + field + " is outside the rule scope.", { field });
    }
  };
  check(applicability);
  let selected = null;
  if (applicability.variant_policy === "explicit_required") {
    const matches = applicability.variants.filter(item => item.variant_id === context.variant_id);
    ag76Require(matches.length === 1, "ambiguous_variant_selection",
      "An explicit matching regional/sampradaya variant is required.");
    check(matches[0]);
    selected = matches[0].variant_id;
  } else {
    ag76Require(context.variant_id === undefined, "unexpected_variant_selection",
      "This rule declares no variants.");
  }
  return { status: "supported", selected_variant: selected };
}

export function evaluateAg76ApprovalGate(input) {
  try {
    ag76Object(input, ["rule", "context", "evaluation"], "approval gate input");
    const { rule, context = {}, evaluation = null } = input;
    const { evidence, rituals } = validateAg76GovernanceContract(rule);
    const applicability = resolveAg76Applicability(rule.applicability, context);
    if (evaluation !== null) {
      ag76Object(evaluation, ["event_id", "rule_id", "rule_version", "error_code"], "evaluation identity");
      ag76Require(evaluation.event_id === rule.event_id && evaluation.rule_id === rule.rule_id &&
        evaluation.rule_version === rule.rule_version, "evaluation_identity_mismatch",
      "Evaluation identity does not match the rule.");
      ag76Require(evaluation.error_code === null || typeof evaluation.error_code === "string",
        "invalid_evaluation_state", "Invalid evaluation error code.");
    }
    const reasons = [{ code: rule.contract_version === AG76_R3_CONTRACT_VERSION ?
      "ag76_r3_internal_only" : "ag76_r1_internal_only",
    message: rule.contract_version === AG76_R3_CONTRACT_VERSION ?
      "AG76 R3 cannot publish results." : "AG76 R1 cannot publish results." }];
    const approved = purpose => evidence.some(entry =>
      entry.purpose === purpose && entry.review_status === "approved");
    const required = ["event_definition", "canonical_name", "date_rule"];
    const evidenceApproved = required.every(approved) && evidence.length > 0 &&
      evidence.every(entry => entry.review_status === "approved");
    if (!evidenceApproved) reasons.push({ code: evidence.length ?
      "source_evidence_not_approved" : "missing_source_evidence",
    missing_approved_purposes: required.filter(purpose => !approved(purpose)) });
    const ruleApproved = rule.governance?.rule_review_status === "approved";
    if (!ruleApproved) reasons.push({ code: "rule_not_approved" });
    const publicApproved = rule.public_window_policy?.approval_status === "approved" &&
      approved("timing_rule");
    if (!publicApproved) reasons.push({ code: "primary_public_window_not_approved" });
    const ritualChecks = rituals.map(policy => ({
      ritual_window_id: policy.ritual_window_id,
      approved: policy.approval_status === "approved" && approved("ritual_rule")
    }));
    if (ritualChecks.some(policy => !policy.approved)) reasons.push({ code: "ritual_window_not_approved" });
    const conclusion = rule.parana_conclusion_policy;
    const conclusionApproved = conclusion?.applicability === "not_applicable" ||
      conclusion?.approval_status === "approved" && approved("ritual_rule");
    if (!conclusionApproved) reasons.push({ code: "parana_or_conclusion_not_approved" });
    if (evaluation?.error_code) reasons.push({ code: "evaluation_failed", error_code: evaluation.error_code });
    return {
      status: "ag76_internal_only_public_output_blocked",
      approval_gate_version: AG76_APPROVAL_GATE_VERSION,
      checks: {
        rule: { status: ruleApproved ? "approved" : "not_approved" },
        evidence: { status: evidenceApproved ? "approved" : "not_approved",
          required_purposes: required, total_count: evidence.length },
        applicability,
        public_window: { status: publicApproved ? "approved" : "not_approved" },
        ritual_windows: ritualChecks,
        parana_conclusion: { applicability: conclusion?.applicability ?? null,
          independently_approved: Boolean(conclusionApproved) }
      },
      fail_closed_reasons: reasons,
      source_evidence_approved: evidenceApproved && ruleApproved,
      primary_public_window_approved: publicApproved,
      ritual_window_output_allowed: false,
      public_output_allowed: false, runtime_activation: false, error_code: null
    };
  } catch (error) { return ag76Failure(error); }
}

export { array as ag76Array };
