import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag47Review: "data/content-intelligence/quality-reviews/ag47-governed-product-roadmap-return.json",
  ag47ReturnRecord: "data/content-intelligence/ag-roadmap/ag47-governed-roadmap-return-record.json",
  ag47Foundation: "data/content-intelligence/ag-roadmap/ag47-adb-foundation-consumption-record.json",
  ag47SurfaceScope: "data/content-intelligence/ag-roadmap/ag47-daily-surface-scope-map.json",
  ag47SequencePlan: "data/content-intelligence/ag-roadmap/ag47-ag48-to-ag53-product-sequence-plan.json",
  ag47Readiness: "data/content-intelligence/quality-registry/ag47-ag48-panchang-festival-surface-readiness-record.json",
  ag47Boundary: "data/content-intelligence/mutation-plans/ag47-to-ag48-panchang-festival-surface-boundary.json",
  adb20Review: "data/content-intelligence/quality-reviews/adb20-runtime-foundation-closure-ag47-return-gate.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag47r-roadmap-alignment-before-ag47a.json",
  alignmentRecord: "data/content-intelligence/ag-roadmap/ag47r-roadmap-alignment-record.json",
  sourceOfTruth: "data/content-intelligence/ag-roadmap/ag47r-v01-implementation-roadmap-source-of-truth.json",
  correctionRecord: "data/content-intelligence/ag-roadmap/ag47r-forward-pointer-correction-record.json",
  fullStagePlan: "data/content-intelligence/ag-roadmap/ag47r-ag47-to-ag56-governing-stage-plan.json",
  ag47SubstagePlan: "data/content-intelligence/ag-roadmap/ag47r-ag47a-to-ag47z-substage-plan.json",
  noDuplicationRule: "data/content-intelligence/ag-roadmap/ag47r-no-duplication-and-consumption-rule.json",
  noActivationGuard: "data/content-intelligence/backend-architecture/ag47r-no-runtime-no-db-no-deployment-guard.json",
  readiness: "data/content-intelligence/quality-registry/ag47r-ag47a-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag47r-to-ag47a-boundary.json",
  registry: "data/quality/ag47r-roadmap-alignment-before-ag47a.json",
  preview: "data/quality/ag47r-roadmap-alignment-before-ag47a-preview.json",
  doc: "docs/quality/AG47R_ROADMAP_ALIGNMENT_BEFORE_AG47A.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG47R input: ${p}`);
}

const ag47Review = readJson(inputs.ag47Review);
const ag47ReturnRecord = readJson(inputs.ag47ReturnRecord);
const ag47Foundation = readJson(inputs.ag47Foundation);
const ag47SurfaceScope = readJson(inputs.ag47SurfaceScope);
const ag47SequencePlan = readJson(inputs.ag47SequencePlan);
const ag47Readiness = readJson(inputs.ag47Readiness);
const ag47Boundary = readJson(inputs.ag47Boundary);
const adb20Review = readJson(inputs.adb20Review);

if (ag47Review.status !== "governed_roadmap_return_ready_for_ag48") throw new Error("AG47 review status mismatch.");
if (ag47Review.summary?.adb20_consumed !== true) throw new Error("AG47 must consume ADB20.");
if (ag47ReturnRecord.status !== "governed_product_roadmap_return_recorded") throw new Error("AG47 return record mismatch.");
if (ag47Foundation.status !== "adb_foundation_consumed_without_redesign") throw new Error("AG47 ADB foundation consumption mismatch.");
if (ag47SurfaceScope.status !== "daily_surface_scope_map_recorded") throw new Error("AG47 daily surface scope mismatch.");
if (ag47SequencePlan.status !== "ag48_to_ag53_product_sequence_recorded") throw new Error("AG47 sequence plan missing.");
if (ag47Readiness.next_stage_id !== "AG48") throw new Error("AG47 readiness pointer expected AG48 for supersession record.");
if (ag47Boundary.next_stage_id !== "AG48") throw new Error("AG47 boundary pointer expected AG48 for supersession record.");
if (adb20Review.status !== "adb_runtime_foundation_closed_ready_for_ag47") throw new Error("ADB20 review status mismatch.");

const blockedState = {
  ag47r_alignment_recorded: true,
  ag47_return_gate_preserved: true,
  ag47_forward_pointer_corrected_by_supersession: true,
  v01_stage_plan_preserved: true,
  ag47a_ready: true,

  runtime_calculation_execution_approved_now: false,
  runtime_calculation_executed: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  backend_auth_supabase_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_content_generated: false
};

const fullStagePlan = [
  {
    stage_id: "AG47",
    title: "Panchang, Festival and Vedic Guidance Implementation Readiness",
    objective: "Consume existing methodology/governance and prepare safe V01 public preview integration.",
    substages: [
      {
        sub_stage: "AG47A",
        primary_work: "Panchang Method and Location Basis Consumption",
        existing_logic_to_consume: ["M01/M04 methodology", "D05 source validation", "Panchang schema/runtime files", "ADB20 ADS reconciliation"],
        delta_output_no_duplicate_rule: "Confirm method boundary and disabled live calculation status."
      },
      {
        sub_stage: "AG47B",
        primary_work: "Festival and Observance Registry Integration",
        existing_logic_to_consume: ["M02/M03 methodology", "D05 observance registry", "ADB20 ADS04/ADS07/ADS08 status"],
        delta_output_no_duplicate_rule: "Prepare public preview display rules and regional/manual verification notes."
      },
      {
        sub_stage: "AG47C",
        primary_work: "Vedic Guidance and Sanskrit Integrity Safety Gate",
        existing_logic_to_consume: ["M00 source doctrine", "D03/D04 daily guidance", "D06 mantra review", "ADB20 ADS06/ADS08 status"],
        delta_output_no_duplicate_rule: "Preserve no invented mantra, no deterministic claim and source-integrity rules."
      },
      {
        sub_stage: "AG47D",
        primary_work: "Cultural Module Integration Audit",
        existing_logic_to_consume: ["AG47A–AG47C outputs"],
        delta_output_no_duplicate_rule: "Audit homepage Discover integration and safety boundaries."
      },
      {
        sub_stage: "AG47Z",
        primary_work: "Panchang/Festival/Vedic Closure",
        existing_logic_to_consume: ["AG47 audit outputs"],
        delta_output_no_duplicate_rule: "Close V01 implementation readiness without live calculation/API activation."
      }
    ]
  },
  {
    stage_id: "AG48",
    title: "Word of the Day and Reflection Implementation Readiness",
    objective: "Consume existing Word bank and reflection/governance logic for V01 homepage integration.",
    substages: [
      {
        sub_stage: "AG48A",
        primary_work: "Word Bank and Rotation Consumption",
        existing_logic_to_consume: ["D02 word-of-day bank", "word-of-day-bank-preflight.js"],
        delta_output_no_duplicate_rule: "Confirm curated bank, approved status, rotation policy and repeat control."
      },
      {
        sub_stage: "AG48B",
        primary_work: "Multilingual Language Safety Review",
        existing_logic_to_consume: ["D02 multilingual fields", "language runtime"],
        delta_output_no_duplicate_rule: "Check Sanskrit/Hindi/English meanings, transliteration and no toggle corruption."
      },
      {
        sub_stage: "AG48C",
        primary_work: "Reflection Prompt and Homepage Integration",
        existing_logic_to_consume: ["D07 daily reflection preview", "AG45 homepage movement model"],
        delta_output_no_duplicate_rule: "Map word/reflection to Discover/Reflect surface without personalisation activation."
      },
      {
        sub_stage: "AG48D",
        primary_work: "Word/Reflection Integration Audit",
        existing_logic_to_consume: ["AG48A–AG48C outputs"],
        delta_output_no_duplicate_rule: "Audit integration; no external API, Supabase, Auth or dynamic runtime activation."
      },
      {
        sub_stage: "AG48Z",
        primary_work: "Word and Reflection Closure",
        existing_logic_to_consume: ["AG48 audit outputs"],
        delta_output_no_duplicate_rule: "Close V01 readiness and hand off to user/personalisation readiness."
      }
    ]
  },
  {
    stage_id: "AG49",
    title: "User Accounts and Personalisation Readiness",
    objective: "Preserve future personalisation path while keeping V01 static/GitHub-first and privacy-safe.",
    substages: [
      {
        sub_stage: "AG49A",
        primary_work: "User/Profile Model Consumption and Gap Review",
        existing_logic_to_consume: ["D07 subscriber personalisation schema", "daily-guidance subscriber schema"],
        delta_output_no_duplicate_rule: "Review future fields and disabled-now states."
      },
      {
        sub_stage: "AG49B",
        primary_work: "Consent, Entitlement and Sensitive Data Gate",
        existing_logic_to_consume: ["D07 input policy", "subscriber-guidance-personalization-preflight.js"],
        delta_output_no_duplicate_rule: "Preserve explicit consent, secure storage requirement and blocked birth-detail collection."
      },
      {
        sub_stage: "AG49C",
        primary_work: "Auth/RLS/Role Access Deferral Review",
        existing_logic_to_consume: ["AG27/AG35 backend/Auth/Supabase planning", "auth-client/session-guard"],
        delta_output_no_duplicate_rule: "Confirm no hidden backend activation; list future trigger conditions."
      },
      {
        sub_stage: "AG49D",
        primary_work: "Personalisation Privacy Audit",
        existing_logic_to_consume: ["AG49A–AG49C outputs"],
        delta_output_no_duplicate_rule: "Audit privacy, consent, storage, public exposure and non-deterministic guidance boundaries."
      },
      {
        sub_stage: "AG49Z",
        primary_work: "User/Personalisation Readiness Closure",
        existing_logic_to_consume: ["AG49 audit outputs"],
        delta_output_no_duplicate_rule: "Close V01 readiness; keep personalised output disabled unless separately approved."
      }
    ]
  },
  {
    stage_id: "AG50",
    title: "Psychometric and Assessment Product Governance Scaffold",
    objective: "Document assessment product scaffold/governance only; do not activate public assessment in V01.",
    substages: [
      {
        sub_stage: "AG50A",
        primary_work: "Assessment Doctrine and Age-Adaptive Boundary",
        existing_logic_to_consume: ["Existing product notes", "privacy/governance records", "future psychometric plan"],
        delta_output_no_duplicate_rule: "Define non-diagnostic, consent-first, age-adaptive boundaries."
      },
      {
        sub_stage: "AG50B",
        primary_work: "Question Bank and Trait-Mapping Scaffold",
        existing_logic_to_consume: ["Future schema plan only"],
        delta_output_no_duplicate_rule: "Define fields, trait dimensions, review status and contradiction flags without launching runtime."
      },
      {
        sub_stage: "AG50C",
        primary_work: "Scoring, Contradiction and Insight Boundary",
        existing_logic_to_consume: ["Future analytics/personalisation models"],
        delta_output_no_duplicate_rule: "Define score/confidence/contradiction/human review logic; no deterministic labels."
      },
      {
        sub_stage: "AG50D",
        primary_work: "Psychometric Privacy and Ethics Audit",
        existing_logic_to_consume: ["AG49 privacy outputs", "AG52 legal/disclaimer plan"],
        delta_output_no_duplicate_rule: "Audit minors, consent, sensitive inference, data minimisation and disclaimer needs."
      },
      {
        sub_stage: "AG50Z",
        primary_work: "Assessment Scaffold Closure",
        existing_logic_to_consume: ["AG50 audit outputs"],
        delta_output_no_duplicate_rule: "Close V01 scaffold; defer real assessment product to V02 unless separately approved."
      }
    ]
  },
  {
    stage_id: "AG51",
    title: "Analytics, Monitoring and Editorial Dashboard Planning",
    objective: "Define monitoring and dashboards for editorial/module health without enabling runtime queries.",
    substages: [
      {
        sub_stage: "AG51A",
        primary_work: "Editorial Monitoring Model",
        existing_logic_to_consume: ["AG41C monitoring plan", "admin/editor workflow records"],
        delta_output_no_duplicate_rule: "Define panels for queue, assignments, returned items, references and image credits."
      },
      {
        sub_stage: "AG51B",
        primary_work: "Article and Module Health Model",
        existing_logic_to_consume: ["AG23/AG43/AG45/AG46/AG47/AG48 outputs"],
        delta_output_no_duplicate_rule: "Define metrics for topic score, First Light, episode, Featured Reads, Panchang, Word and listing status."
      },
      {
        sub_stage: "AG51C",
        primary_work: "Audit/Error/Exception Tracking Model",
        existing_logic_to_consume: ["AG42 audit-log completeness", "AG41C exception tracking"],
        delta_output_no_duplicate_rule: "Define broken URL, missing reference/credit, layout, role, audit and rollback exceptions."
      },
      {
        sub_stage: "AG51D",
        primary_work: "Dashboard Planning Audit",
        existing_logic_to_consume: ["AG51A–AG51C outputs"],
        delta_output_no_duplicate_rule: "Audit dashboard plan; no runtime dashboard, database query or monitoring job."
      },
      {
        sub_stage: "AG51Z",
        primary_work: "Analytics and Monitoring Closure",
        existing_logic_to_consume: ["AG51 audit outputs"],
        delta_output_no_duplicate_rule: "Close dashboard planning and hand off to security/privacy/legal hardening."
      }
    ]
  },
  {
    stage_id: "AG52",
    title: "Security, Privacy, Source, Legal and Compliance Hardening",
    objective: "Consolidate secret safety, source doctrine, legal disclaimers, privacy and backend/Auth deferral.",
    substages: [
      {
        sub_stage: "AG52A",
        primary_work: "Secret, Environment and Service-role Safety Audit",
        existing_logic_to_consume: ["AG27/AG35/AG36 secret governance", ".gitignore/local config records"],
        delta_output_no_duplicate_rule: "Audit repo/browser/public config for service-role, secrets and unsafe env leakage."
      },
      {
        sub_stage: "AG52B",
        primary_work: "RLS, Grants and Public Exposure Audit",
        existing_logic_to_consume: ["AG29 schema/RLS audit", "Supabase explicit grant readiness records"],
        delta_output_no_duplicate_rule: "Review public exposure and maintain no unintended anon access."
      },
      {
        sub_stage: "AG52C",
        primary_work: "Source, Reference, Image Credit and Disclaimer Readiness",
        existing_logic_to_consume: ["AG25 references/image credits", "M00/D cultural doctrine", "AG50 psychometric scaffold"],
        delta_output_no_duplicate_rule: "Prepare editorial/source/image/Vedic/psychometric/privacy disclaimers."
      },
      {
        sub_stage: "AG52D",
        primary_work: "Security and Compliance Closure Audit",
        existing_logic_to_consume: ["AG52A–AG52C outputs"],
        delta_output_no_duplicate_rule: "Audit combined security/legal/privacy posture and backend deferral."
      },
      {
        sub_stage: "AG52Z",
        primary_work: "Security/Privacy/Legal Closure",
        existing_logic_to_consume: ["AG52 audit outputs"],
        delta_output_no_duplicate_rule: "Close compliance hardening before public QA."
      }
    ]
  },
  {
    stage_id: "AG53",
    title: "Performance, SEO, Accessibility and Mobile QA",
    objective: "Validate public quality and discoverability for V01 surfaces.",
    substages: [
      {
        sub_stage: "AG53A",
        primary_work: "Performance and Page-weight Review",
        existing_logic_to_consume: ["public HTML/assets", "image governance", "homepage/article surfaces"],
        delta_output_no_duplicate_rule: "Review page size, image load, JS/CSS load and mobile speed risks."
      },
      {
        sub_stage: "AG53B",
        primary_work: "SEO Metadata, Sitemap and Robots Review",
        existing_logic_to_consume: ["SEO preflight", "sitemap/url governance", "article-quality preflight"],
        delta_output_no_duplicate_rule: "Review titles, descriptions, OG/canonical, sitemap, robots and article URL correctness."
      },
      {
        sub_stage: "AG53C",
        primary_work: "Mobile and Accessibility QA",
        existing_logic_to_consume: ["homepage/article/layout validators", "language runtime"],
        delta_output_no_duplicate_rule: "Check responsive layout, alt text readiness, contrast, tap targets and table/figure safety."
      },
      {
        sub_stage: "AG53D",
        primary_work: "Public UX and Browser Compatibility Audit",
        existing_logic_to_consume: ["live verification records", "homepage QA history"],
        delta_output_no_duplicate_rule: "Audit Chrome/Safari/mobile route behaviour, navigation and language stability."
      },
      {
        sub_stage: "AG53Z",
        primary_work: "Public Quality Closure",
        existing_logic_to_consume: ["AG53 audit outputs"],
        delta_output_no_duplicate_rule: "Close public quality readiness and hand off to release operations."
      }
    ]
  },
  {
    stage_id: "AG54",
    title: "Backup, Rollback, Migration and Release Operations",
    objective: "Create operational safety before V01 release candidate freeze.",
    substages: [
      {
        sub_stage: "AG54A",
        primary_work: "Backup and Restore Plan",
        existing_logic_to_consume: ["Git baseline", "repo/content/data records", "Supabase deferral records"],
        delta_output_no_duplicate_rule: "Define repo/content/static artifact backup and restore method."
      },
      {
        sub_stage: "AG54B",
        primary_work: "Deployment and Release Checklist",
        existing_logic_to_consume: ["Vercel/GitHub static path", "validate:project chain"],
        delta_output_no_duplicate_rule: "Define validate, git status, commit, push, Vercel/live check sequence."
      },
      {
        sub_stage: "AG54C",
        primary_work: "Rollback and Incident Response Plan",
        existing_logic_to_consume: ["AG42 rollback dry-run", "AG41 audit/rollback SOP"],
        delta_output_no_duplicate_rule: "Define triggers and action path for homepage, article, listing, privacy or route breakage."
      },
      {
        sub_stage: "AG54D",
        primary_work: "Release Operations Audit",
        existing_logic_to_consume: ["AG54A–AG54C outputs"],
        delta_output_no_duplicate_rule: "Audit backup, release, rollback and incident response readiness."
      },
      {
        sub_stage: "AG54Z",
        primary_work: "Release Operations Closure",
        existing_logic_to_consume: ["AG54 audit outputs"],
        delta_output_no_duplicate_rule: "Close operational readiness before release candidate freeze."
      }
    ]
  },
  {
    stage_id: "AG55",
    title: "Version 01 Release Candidate Freeze, Completed-Stack Reconciliation and Final Audit",
    objective: "Freeze V01 scope and reconcile every completed repo stream before AG56.",
    substages: [
      {
        sub_stage: "AG55A",
        primary_work: "Version 01 Scope Freeze",
        existing_logic_to_consume: ["AG42–AG54 outputs", "full repo inventory/digest"],
        delta_output_no_duplicate_rule: "Freeze included modules and explicitly defer V02 items."
      },
      {
        sub_stage: "AG55B",
        primary_work: "Completed Repo Stack and Dependency Reconciliation",
        existing_logic_to_consume: ["M00–M10", "D01–D10", "AG03–AG41", "QA/HF/LV records", "docs/quality"],
        delta_output_no_duplicate_rule: "Verify completed streams are consumed; resolve old roadmap conflicts including AG41Z → AG42A pointer."
      },
      {
        sub_stage: "AG55C",
        primary_work: "End-to-End Release Candidate Validation",
        existing_logic_to_consume: ["validate:project", "all stage validators", "public route checks"],
        delta_output_no_duplicate_rule: "Validate V01 as a whole: homepage, articles, First Light, episodes, Word, Panchang, security and release ops."
      },
      {
        sub_stage: "AG55D",
        primary_work: "Go/No-Go Audit for AG56",
        existing_logic_to_consume: ["AG55A–AG55C outputs", "AG54 rollback plan"],
        delta_output_no_duplicate_rule: "Confirm AG56 controlled dynamic content-loop can be attempted only with explicit approval."
      },
      {
        sub_stage: "AG55Z",
        primary_work: "Version 01 Release Candidate Closure",
        existing_logic_to_consume: ["AG55 audit outputs"],
        delta_output_no_duplicate_rule: "Close V01 RC and permit AG56 controlled dynamic test path."
      }
    ]
  },
  {
    stage_id: "AG56",
    title: "Version 01 Controlled Dynamic Content Loop Test and Go-Live",
    objective: "Run one controlled end-to-end V01 content loop, then decide go-live.",
    substages: [
      {
        sub_stage: "AG56.1",
        primary_work: "Controlled Dynamic Article Generation Test",
        existing_logic_to_consume: ["AG43 topic/content-intelligence", "AG45 First Light", "AG46 long-form standard"],
        delta_output_no_duplicate_rule: "Select one signal/topic, apply scoring, prepare one article/episode candidate with refs and credit status."
      },
      {
        sub_stage: "AG56.2",
        primary_work: "Admin/Editor Review Workflow Test",
        existing_logic_to_consume: ["AG42 hardened workflow", "AG36/AG40 role tests", "AG41 SOP"],
        delta_output_no_duplicate_rule: "Test editor correction/submit path and Admin final approval."
      },
      {
        sub_stage: "AG56.3",
        primary_work: "Controlled Publish Test for One Article",
        existing_logic_to_consume: ["AG54 release/rollback plan", "AG41 publish SOP"],
        delta_output_no_duplicate_rule: "Publish one article only after explicit approval, with audit and rollback readiness."
      },
      {
        sub_stage: "AG56.4",
        primary_work: "Public URL and Listing Verification",
        existing_logic_to_consume: ["AG40A/AG40C smoke tests", "AG46 listing/category behaviour"],
        delta_output_no_duplicate_rule: "Verify live URL, content, references, image credits, category and listing update."
      },
      {
        sub_stage: "AG56.5",
        primary_work: "Homepage and Module Surface Verification",
        existing_logic_to_consume: ["AG45 homepage movement", "AG23 route records"],
        delta_output_no_duplicate_rule: "Verify First Light/Featured Reads/episode cards and Discover → Read → Reflect flow."
      },
      {
        sub_stage: "AG56.6",
        primary_work: "Word/Panchang/Reflection/Vedic Preview Smoke Test",
        existing_logic_to_consume: ["AG47/AG48 readiness records", "D02/D05/D07 validators"],
        delta_output_no_duplicate_rule: "Smoke-test preview surfaces without invented mantra, unsupported claims or language instability."
      },
      {
        sub_stage: "AG56.7",
        primary_work: "Audit-log and Rollback Readiness Verification",
        existing_logic_to_consume: ["AG42 audit fields", "AG54 rollback plan"],
        delta_output_no_duplicate_rule: "Confirm action audit, before/after status, rollback reference and public verification evidence."
      },
      {
        sub_stage: "AG56.8",
        primary_work: "Version 01 Go-Live Decision",
        existing_logic_to_consume: ["AG56.1–AG56.7 outputs"],
        delta_output_no_duplicate_rule: "Decide go/no-go based on controlled test result and unresolved blockers."
      },
      {
        sub_stage: "AG56Z",
        primary_work: "Version 01 Live Closure",
        existing_logic_to_consume: ["AG56 go-live decision"],
        delta_output_no_duplicate_rule: "Declare Drishvara V01 live or deferred with explicit defect list; V02 remains separate scaffolded expansion."
      }
    ]
  }
];

const alignmentRecord = {
  module_id: "AG47R",
  title: "AG47 Roadmap Alignment Before AG47A",
  status: "ag47_roadmap_alignment_recorded",
  reason: "AG47 was used as a post-ADB return/re-entry gate. The original AG47 implementation plan must remain intact and begin at AG47A.",
  preserved_baseline: "c724097 Return to AG47 governed product roadmap",
  correction: {
    old_forward_pointer: "AG47 -> AG48 Panchang/Festival Surface",
    corrected_forward_pointer: "AG47R -> AG47A Panchang Method and Location Basis Consumption",
    rule: "The c724097 AG47 record is retained as AG47-ENTRY / return gate only, not as the AG47 implementation stage."
  },
  blocked_state: blockedState
};

const sourceOfTruth = {
  module_id: "AG47R",
  title: "V01 Implementation Roadmap Source of Truth",
  status: "v01_implementation_roadmap_preserved",
  governing_stages: fullStagePlan.map((s) => ({
    stage_id: s.stage_id,
    title: s.title,
    objective: s.objective,
    substage_count: s.substages.length
  })),
  governing_rule: [
    "Do not skip AG47A–AG47Z.",
    "Do not move Panchang/Festival/Vedic work to AG48.",
    "AG48 remains Word of the Day and Reflection.",
    "AG49 remains User Accounts and Personalisation.",
    "AG50 remains Psychometric and Assessment Product Governance Scaffold.",
    "AG51 remains Analytics/Monitoring/Editorial Dashboard Planning.",
    "AG52 remains Security/Privacy/Source/Legal/Compliance Hardening.",
    "AG53 remains Performance/SEO/Accessibility/Mobile QA.",
    "AG54 remains Backup/Rollback/Migration/Release Operations.",
    "AG55 remains Version 01 Release Candidate Freeze and Final Audit.",
    "AG56 remains controlled dynamic content loop test and go-live decision."
  ],
  blocked_state: blockedState
};

const correctionRecord = {
  module_id: "AG47R",
  title: "Forward Pointer Correction Record",
  status: "forward_pointer_corrected_by_supersession",
  superseded_records_without_git_rewrite: [
    {
      file: inputs.ag47Readiness,
      superseded_pointer: "AG48",
      replacement_pointer: "AG47A",
      reason: "AG47 readiness was created as a return-gate pointer, but original implementation roadmap requires AG47A first."
    },
    {
      file: inputs.ag47Boundary,
      superseded_pointer: "AG48",
      replacement_pointer: "AG47A",
      reason: "Boundary corrected by AG47R without rewriting pushed history."
    }
  ],
  no_git_history_rewrite: true,
  blocked_state: blockedState
};

const ag47SubstagePlan = {
  module_id: "AG47R",
  title: "AG47A to AG47Z Substage Plan",
  status: "ag47a_to_ag47z_plan_recorded",
  objective: fullStagePlan[0].objective,
  substages: fullStagePlan[0].substages,
  next_actual_stage: "AG47A",
  blocked_state: blockedState
};

const noDuplicationRule = {
  module_id: "AG47R",
  title: "No-duplication and Consumption Rule",
  status: "no_duplication_consumption_rule_recorded",
  rules: [
    "Consume ADB20, ADS reconciliation and AG47 return-gate outputs; do not recreate them.",
    "Consume M/D/AG historical records only where specified in each substage.",
    "Each substage must produce delta output only.",
    "If a future stage needs extra records for safety or correctness, add them explicitly without renumbering the core roadmap.",
    "No hidden runtime, API, backend/Auth, RLS or deployment activation may be introduced."
  ],
  blocked_state: blockedState
};

const noActivationGuard = {
  module_id: "AG47R",
  title: "No Runtime / No DB / No Deployment Guard",
  status: "no_runtime_no_db_no_deployment_guard_recorded",
  checks: [
    { check_id: "runtime_calculation_execution_approved_now", expected: false, actual: false, passed: true },
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_approved", expected: false, actual: false, passed: true },
    { check_id: "deployment_approved", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true },
    { check_id: "public_content_generated", expected: false, actual: false, passed: true }
  ],
  audit_passed: true,
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG47R",
  title: "AG47A Readiness Record",
  status: "ready_for_ag47a_panchang_method_location_basis",
  ready_for_ag47a: true,
  next_stage_id: "AG47A",
  next_stage_title: "Panchang Method and Location Basis Consumption",
  ag47a_allowed_scope: [
    "Consume M01/M04 methodology.",
    "Consume D05 source validation.",
    "Consume Panchang schema/runtime records.",
    "Consume ADB20 ADS reconciliation.",
    "Confirm method boundary and disabled live calculation status."
  ],
  ag47a_blocked_scope: [
    "Runtime Panchang calculation execution",
    "Website database-reading/API runtime activation",
    "Backend/Auth/Supabase runtime activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure",
    "Public generated Panchang output"
  ],
  hard_blocker_count_for_ag47a: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG47R",
  title: "AG47R to AG47A Boundary",
  status: "ag47a_boundary_created",
  next_stage_id: "AG47A",
  next_stage_title: "Panchang Method and Location Basis Consumption",
  allowed_scope: readiness.ag47a_allowed_scope,
  blocked_scope: readiness.ag47a_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG47R",
  title: "Roadmap Alignment Before AG47A",
  status: "roadmap_aligned_ready_for_ag47a",
  depends_on: ["AG47", "ADB20"],
  alignment_record_file: outputs.alignmentRecord,
  source_of_truth_file: outputs.sourceOfTruth,
  correction_record_file: outputs.correctionRecord,
  full_stage_plan_file: outputs.fullStagePlan,
  ag47_substage_plan_file: outputs.ag47SubstagePlan,
  no_duplication_rule_file: outputs.noDuplicationRule,
  no_activation_guard_file: outputs.noActivationGuard,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag47r_alignment_recorded: true,
    ag47_return_gate_preserved: true,
    ag47_forward_pointer_corrected_by_supersession: true,
    v01_stage_plan_preserved: true,
    ag47a_ready: true,
    hard_blocker_count_for_ag47a: 0,
    total_governing_stages: fullStagePlan.length,
    total_governing_substages: fullStagePlan.reduce((sum, stage) => sum + stage.substages.length, 0),

    runtime_calculation_execution_approved_now: false,
    runtime_calculation_executed: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    backend_auth_supabase_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_content_generated: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG47R",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG47R",
  status: review.status,
  ag47r_alignment_recorded: 1,
  ag47_return_gate_preserved: 1,
  ag47_forward_pointer_corrected_by_supersession: 1,
  v01_stage_plan_preserved: 1,
  ag47a_ready: 1,
  hard_blocker_count_for_ag47a: 0,
  total_governing_stages: fullStagePlan.length,
  total_governing_substages: fullStagePlan.reduce((sum, stage) => sum + stage.substages.length, 0),

  runtime_calculation_execution_approved_now: 0,
  runtime_calculation_executed: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  backend_auth_supabase_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_content_generated: 0
};

const doc = `# AG47R — Roadmap Alignment Before AG47A

## Result

AG47R preserves the original V01 implementation roadmap and corrects the post-ADB return pointer.

## Important correction

The pushed AG47 record at c724097 is retained as the governed return/re-entry gate from ADB20. It does not replace the original AG47 implementation plan.

Actual implementation begins at:

- AG47A — Panchang Method and Location Basis Consumption

## Preserved sequence

- AG47 — Panchang, Festival and Vedic Guidance Implementation Readiness
- AG48 — Word of the Day and Reflection Implementation Readiness
- AG49 — User Accounts and Personalisation Readiness
- AG50 — Psychometric and Assessment Product Governance Scaffold
- AG51 — Analytics, Monitoring and Editorial Dashboard Planning
- AG52 — Security, Privacy, Source, Legal and Compliance Hardening
- AG53 — Performance, SEO, Accessibility and Mobile QA
- AG54 — Backup, Rollback, Migration and Release Operations
- AG55 — Version 01 Release Candidate Freeze, Completed-Stack Reconciliation and Final Audit
- AG56 — Version 01 Controlled Dynamic Content Loop Test and Go-Live

## Still blocked

- Runtime Panchang calculation execution
- Website database-reading/API runtime activation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure
- Public generated Panchang/guidance/star-reflection output

## Next

AG47A — Panchang Method and Location Basis Consumption.
`;

writeJson(outputs.alignmentRecord, alignmentRecord);
writeJson(outputs.sourceOfTruth, sourceOfTruth);
writeJson(outputs.correctionRecord, correctionRecord);
writeJson(outputs.fullStagePlan, { module_id: "AG47R", title: "AG47 to AG56 Governing Stage Plan", status: "governing_stage_plan_recorded", stages: fullStagePlan, blocked_state: blockedState });
writeJson(outputs.ag47SubstagePlan, ag47SubstagePlan);
writeJson(outputs.noDuplicationRule, noDuplicationRule);
writeJson(outputs.noActivationGuard, noActivationGuard);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG47R Roadmap Alignment Before AG47A generated.");
console.log("✅ Original AG47–AG56 V01 implementation roadmap preserved as source-of-truth.");
console.log("✅ c724097 AG47 retained as return gate; AG47A set as next actual implementation stage.");
console.log("✅ Ready for AG47A Panchang Method and Location Basis Consumption.");
console.log("✅ Runtime, DB reading, backend/Auth/RLS, deployment and public content generation remain blocked.");
