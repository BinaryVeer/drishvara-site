import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copySnapshot, snapshotHash, selectDailyWord, WORD_CONTRACT } from "./lib/ag70d-word-selection-engine.mjs";
import { executeWordAssignment } from "./lib/ag70d-word-assignment-store.mjs";
import { createSyntheticWordStore } from "./lib/ag70d-word-assignment-test-adapter.mjs";
import { createWordPostgresAdapter } from "./lib/ag70e-word-postgres-adapter.mjs";
import { projectPublishedWord, planDailyWordRun } from "./lib/ag70e-word-publication-pipeline.mjs";
import { syntheticSelection, syntheticPublication, syntheticApproval, syntheticIdentityRef } from "./lib/ag70e-word-test-fixtures.mjs";
import { runWordServerWorkflow, readWordServerPublication } from "./lib/ag70e-word-server-workflow.mjs";

const baseline = "1aaf29764604285f42108a131122e495ac3f8b71";
const read = p => fs.readFileSync(p, "utf8");
const json = p => JSON.parse(read(p));
const frozen = p => JSON.parse(execFileSync("git", ["show", baseline + ":" + p], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
const dossierPath = "data/content-intelligence/quality-reviews/f3b2-word-activities-evidence-dossier.json";
const configPath = "data/knowledge-base/word-of-day/production/methodology/ag70d-word-release-configuration.json";
const config = json(configPath), dossier = json(dossierPath), prep = dossier.consolidated_production_preparation;
let checks = 0;
async function check(name, run) { await run(); checks++; console.log("PASS " + name); }
await check("all original dossier text, captures, Activities and qualification fields remain unchanged", () => {
  const preserved = copySnapshot(dossier); delete preserved.consolidated_production_preparation; assert.deepEqual(preserved, frozen(dossierPath));
});
await check("exact three historical pilot identities and draft references", () => {
  assert.deepEqual(prep.candidate_records.map(r => [r.word_id,r.draft_id]), [["reflection","ag69f_review_draft_001"],["discernment","ag69f_review_draft_004"],["patience","ag69f_review_draft_005"]]);
});
await check("proposed compact outputs use AG70E fields, never approved-bank entries", () => {
  const contract = json("data/knowledge-base/word-of-day/production/knowledge-bank/word-output-record-contract.json");
  for (const r of prep.candidate_records) {
    assert(contract.required_fields.every(k => Object.hasOwn(r.proposed_output,k)));
    const original = dossier.words.find(w => w.word_id===r.word_id).original_copy;
    for (const k of ["english","hindi","sanskrit"]) assert.equal(r.proposed_output[k],original[k]);
    assert.equal(r.proposed_output.meaning_hi,null); assert.equal(r.proposed_output.iast_review_status,"pending");
  }
});
await check("no original-edition authentication, human signoff, derivation or publication inferred", () => {
  assert.equal(prep.authorized_human_reviewer_id,null); assert.equal(prep.formal_approval_record_ref,null);
  for (const r of prep.candidate_records) {
    assert.equal(r.production_approved,false); assert.equal(r.approved_for_selector,false); assert.equal(r.public_output_allowed,false);
    assert.equal(r.public_use_permission,"not_allowed"); assert.equal(r.production_readiness,"not_ready");
    assert(r.required_reviews.every(v => v.review_status==="pending" && v.reviewer_id===null && v.approval_ref===null));
    assert.equal(r.ai_assisted_assessment.etymology_status,"unverified_no_derivation_claim");
  }
  assert.equal(prep.source_rechecks.length,5); assert(prep.source_rechecks.every(s => s.original_edition_authenticated===false));
});
await check("the three pending pilots remain rejected by the executable approval gates", () => {
  for (const r of prep.candidate_records) {
    const i=syntheticSelection(1); Object.assign(i.bank.records[0],{production_approved:r.production_approved,approved_for_daily_output:r.approved_for_selector,public_use_permission:r.public_use_permission});
    assert.equal(selectDailyWord(i).reason,"approved_bank_empty");
  }
});
await check("real AG70D context/ranking refs and all release/scheduler approvals remain unset", () => {
  const p=json(config.policy_path);
  assert.equal(p.publication_model.canonical_context_basis_ref,null); assert.equal(p.approved_precedence_rule_ref,null);
  for(const section of [config.context,config.precedence,config.publication]){assert.equal(section.review_status,"pending");assert.equal(section.approval_ref,null);}
  assert.deepEqual(config.precedence.candidate_order,[]); assert.equal(config.context.location_basis_ref,null);
  assert.equal(config.runtime_activation,false);assert.equal(config.public_output_allowed,false);
  assert.equal(config.persistence.enabled,false);assert.equal(config.scheduler.enabled,false);assert.equal(config.scheduler.automatic_publication,false);
});
await check("existing output contract is extended additively; original requirements preserved", () => {
  const p="data/knowledge-base/word-of-day/production/knowledge-bank/word-output-record-contract.json", current=json(p);
  delete current.governed_publication_contract;assert.deepEqual(current,frozen(p));
});
await check("checked-in public envelope is withheld and legacy preview is unchanged", () => {
  const data=json("generated/word-of-day-publication.json");assert.equal(data.status,"withheld");assert.equal(data.assignment,null);assert.equal(data.public_output_allowed,false);
  assert.deepEqual(json("generated/word-of-day.json"),frozen("generated/word-of-day.json"));
});
const fixture=await syntheticPublication();
await check("explicitly approved synthetic publication projects one immutable assignment", () => {
  assert.equal(fixture.output.status,"published");assert.equal(fixture.output.assignment.approved_record_version,"v1");
  assert.equal(fixture.output.assignment.reviewed_copy.content.english,"Synthetic word 1");
});
await check("release approval remains independent of assignment and publication history", () => {
  assert.equal(projectPublishedWord({...fixture,date_key:"2026-10-23",release:config.publication}).reason,"release_approval_pending");
  assert.equal(projectPublishedWord({...fixture,date_key:"2026-10-23",release:{...fixture.release,approved_publication_event_refs:[]}}).reason,"publication_release_mismatch");
});
await check("missing history, nonpublished dates and invalid dates are withheld", () => {
  assert.equal(projectPublishedWord({history:null,date_key:"2026-10-23",release:fixture.release}).reason,"history_unavailable");
  assert.equal(projectPublishedWord({...fixture,date_key:"2026-10-24"}).reason,"approved_publication_unavailable");
  assert.equal(projectPublishedWord({...fixture,date_key:"2026-02-30"}).reason,"invalid_canonical_date");
});
function frontend() {
  const nodes=new Map(["f2-word-state","f2-word-description","f2-word-note"].map(k=>[k,{textContent:"",innerHTML:""}]));
  const timers=new Map();let sequence=0;
  const window={crypto:webcrypto,DrishvaraV2Shell:{escapeHtml:v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")},
    setTimeout(fn,ms){timers.set(++sequence,{fn,ms});return sequence;},clearTimeout(id){timers.delete(id);}};
  vm.runInNewContext(read("assets/js/drishvara-v2-homepage.js"),{window,document:{getElementById:id=>nodes.get(id)},Intl,Date,URL,Map,Set,TextEncoder,Uint8Array});
  return {api:window.DrishvaraV2Homepage,nodes,timers,window};
}
const now=new Date("2026-10-23T10:00:00.000Z");
await check("compact homepage card renders approved English/Hindi/Sanskrit and keeps IAST nonvisual", async () => {
  const f=frontend();assert.equal(await f.api.renderWordPublication(fixture.output,now),true);
  const value=f.nodes.get("f2-word-state").innerHTML;
  assert(value.includes('lang="sa"'));assert(value.includes('lang="en"'));assert(value.includes('lang="hi"'));
  assert(!value.includes('lang="sa-Latn"'));assert(!value.includes(fixture.output.assignment.reviewed_copy.content.iast));
  assert(f.nodes.get("f2-word-note").innerHTML.includes("Synthetic source"));assert(f.nodes.get("f2-word-note").innerHTML.includes("2026-10-23"));
});
for (const mutate of [d=>{d.status="assigned";},d=>{d.public_output_allowed=false;},d=>{d.timezone="UTC";},d=>{d.date_key="2026-10-22";},
  d=>{d.assignment.withdrawn=true;},d=>{d.assignment.reviewed_copy.reviews[0].review_status="pending";},
  d=>{d.assignment.reviewed_copy.content.english="unreviewed change";},d=>{d.assignment.reviewed_copy.iast_review_status="pending";},
  d=>{d.assignment.reviewed_copy.content.sources[0].url="javascript:alert(1)";}]) await check("homepage rejects invalid state/date/approval/hash/IAST/source", async () => {
  const f=frontend(),d=copySnapshot(fixture.output);mutate(d);assert.equal(await f.api.renderWordPublication(d,now),false);assert.equal(f.nodes.get("f2-word-state").textContent,"Under verification");
});
await check("absent WebCrypto cannot bypass content-integrity checks", async () => {
  const f=frontend();const data=copySnapshot(fixture.output);f.window.crypto=null;
  assert.equal(await f.api.approvedWordPublication(data,now),null);
});
await check("missing copy version, future publication and invalid date cannot become approved display", async () => {
  for(const mutate of [d=>{delete d.assignment.reviewed_copy.version;},d=>{d.assignment.publication_timestamp="2026-10-24T01:00:00.000Z";},d=>{d.date_key=null;}]){
    const f=frontend(),data=copySnapshot(fixture.output);mutate(data);assert.equal(await f.api.approvedWordPublication(data,now),null);
  }
});
await check("approved synthetic markup-like copy is escaped, never interpreted as HTML", async () => {
  const f=frontend(),data=copySnapshot(fixture.output),content=data.assignment.reviewed_copy.content;
  content.english='<script>synthetic</script>';data.assignment.copy_content_hash=snapshotHash(content);
  for(const review of data.assignment.reviewed_copy.reviews)review.content_hash=data.assignment.copy_content_hash;
  assert.equal(await f.api.renderWordPublication(data,now),true);assert(!f.nodes.get("f2-word-state").innerHTML.includes('<script>'));
});
await check("IST midnight expiry is one shot and does not select or publish", async () => {
  const f=frontend();await f.api.renderWordPublication(fixture.output,new Date("2026-10-23T18:29:59.000Z"));
  assert.equal(f.timers.size,1);assert.equal([...f.timers.values()][0].ms,1000);
  await [...f.timers.values()][0].fn();await new Promise(resolve=>setImmediate(resolve));assert.equal(f.nodes.get("f2-word-state").textContent,"Under verification");
});
await check("canonical dry-run identity is date-scoped and does not activate scheduling", () => {
  const input=syntheticSelection();const plan=planDailyWordRun({timestamp:"2026-10-23T10:00:00.000Z",selection_input:input,configuration:config});
  assert.equal(plan.status,"dry_run");assert.equal(plan.selection.status,"proposal");assert.equal(plan.public_output_allowed,false);
  assert.equal(plan.idempotency_key,planDailyWordRun({timestamp:"2026-10-23T11:00:00.000Z",selection_input:input,configuration:config}).idempotency_key);
  assert.equal(planDailyWordRun({timestamp:"2026-10-23T18:30:00.000Z",selection_input:input,configuration:config}).reason,"canonical_context_date_mismatch");
});
await check("attempted scheduler activation is rejected; approved low-bank alert is local only", () => {
  const c=copySnapshot(config);c.scheduler.enabled=true;
  assert.equal(planDailyWordRun({timestamp:"2026-10-23T10:00:00.000Z",selection_input:syntheticSelection(),configuration:c}).reason,"scheduled_execution_not_authorized");
  c.scheduler.enabled=false;c.scheduler.low_bank_threshold=5;c.scheduler.threshold_approval_ref="synthetic-alert-approval";
  const plan=planDailyWordRun({timestamp:"2026-10-23T10:00:00.000Z",selection_input:syntheticSelection(),configuration:c});assert(plan.alerts.some(a=>a.reason==="low_unused_bank"));
});
for(const count of [365,730,1825,3650]) await check("no hard-coded bank cap at "+count,()=>{
  const input=syntheticSelection(count);assert.equal(selectDailyWord(input).status,"proposal");
});
await check("long approved Sanskrit compounds are not clipped or truncated by the contract", async () => {
  const f=await syntheticPublication("2026-10-23",true),ui=frontend();assert(f.output.assignment.reviewed_copy.content.sanskrit.length>500);
  assert.equal(await ui.api.renderWordPublication(f.output,now),true);assert(ui.nodes.get("f2-word-state").innerHTML.includes(f.output.assignment.reviewed_copy.content.sanskrit));
});
await check("PostgreSQL adapter is disabled by default and refuses a production mode", async () => {
  for(const adapter of [createWordPostgresAdapter(),createWordPostgresAdapter({mode:"production",rpc:()=>{throw Error("must not call");}})])await assert.rejects(()=>adapter.readHistory(),/not_activated/);
});
await check("server adapter exercises one transaction RPC, CAS and idempotent receipt against a mock", async () => {
  const store=createSyntheticWordStore(syntheticIdentityRef),calls=[];
  const rpc=async(name,args)=>{calls.push(name);if(name==="word_assignment_read_history")return{data:await store.readHistory()};if(name==="word_assignment_read_command")return{data:await store.readCommand(args.p_key)};if(name==="word_assignment_commit")return{data:await store.compareAndAppend(args.p_request)};throw Error("unknown RPC");};
  const adapter=createWordPostgresAdapter({rpc,mode:"isolated_local_validation"});
  const authorization={...syntheticApproval,trust_boundary:"server_only",actor_ref:"synthetic-server",capabilities:["reserve"]};
  const command={contract_version:WORD_CONTRACT,operation:"reserve",idempotency_key:"synthetic-sql-reserve",timestamp:"2026-10-23T01:00:00.000Z"};
  const args={adapter,authorization,command,selection_input:syntheticSelection()};
  assert.equal((await executeWordAssignment(args)).status,"committed");assert.equal((await executeWordAssignment(args)).status,"idempotent_replay");
  assert.equal(calls.filter(n=>n==="word_assignment_commit").length,1);assert.equal((await store.readHistory()).revision,2);
});
await check("database permission/outage errors become withholding, never partial browser writes", async () => {
  const adapter=createWordPostgresAdapter({rpc:async()=>({error:{message:"synthetic permission denied"}}),mode:"isolated_local_validation"});
  await assert.rejects(()=>adapter.readHistory(),/database_operation_failed/);
});
await check("prepared SQL declares disabled controls, uniqueness, row locks, RLS and append-only enforcement", () => {
  const sql=read("supabase/migrations/20261023_word_assignment_preparation.sql");
  for(const required of ["persistence_enabled boolean not null default false","publication_enabled boolean not null default false","word_one_active_date","primary key(kind,value)","for update","word_history_is_append_only","before truncate","enable row level security","word_reference_unapproved","word_actor_not_authorized","word_decision_target_mismatch","word_idempotency_conflict","word_publication_not_activated","is distinct from","exception when unique_violation"])assert(sql.includes(required),required);
  assert(!/grant\s+(insert|update|delete|all)\s/i.test(sql));assert(sql.includes("from public, anon, authenticated, service_role"));
  assert(sql.includes("to service_role"));assert(!/insert into .*versioned_references/i.test(sql));
});
await check("all existing AG70E record containers remain empty and byte-identical",()=>{
  const manifest=json("data/knowledge-base/word-of-day/production/knowledge-bank/ag70e-word-production-knowledge-bank-foundation-manifest.json");
  for(const p of Object.values(manifest.banks)){const data=json(p);if(Object.hasOwn(data,"records")){assert.deepEqual(data.records,[]);assert.deepEqual(data,frozen(p));}}
});
await check("consolidated review remains three pending words, with no invented publisher or linguistic approvals",()=>{
  const review=prep.final_release_review;
  assert.equal(review.qualified_for_production_count,0);assert.equal(review.approved_for_production_count,0);
  assert.equal(review.human_approval_records_supplied,false);assert.equal(review.public_output_allowed,false);
  assert.deepEqual(review.evidence_assessment.map(r=>r.word_id),["reflection","discernment","patience"]);
  for(const r of review.evidence_assessment){assert.equal(r.review_status,"pending");assert.equal(r.reviewer_id,null);assert.equal(r.approval_ref,null);assert.equal(r.etymology_disposition,"captured_for_review_not_established");}
  for(const r of review.publication_copy_proposals){assert.equal(r.public_use_permission,"not_allowed");assert.equal(r.approval_ref,null);assert.equal(r.review_status,"pending");}
  assert(review.source_rights_assessment.every(r=>r.reuse_permission==="pending" && r.approval_ref===null));
  assert.equal(review.etymology_policy_decision.permitted_omission_now,false);
  assert.equal(config.publisher_decisions.publisher_id,null);assert.equal(config.publisher_decisions.signature_or_decision_record_ref,null);
  assert(Object.values(config.publisher_decisions.operations).every(v=>v===null));
});
await check("pending copy omits optional unreviewed IAST without waiving mandatory qualification",()=>{
  const review=prep.final_release_review;
  assert.equal(review.publication_copy_proposals.length,3);
  const historicalIast={reflection:"mananam",discernment:"viveka\u1e25",patience:"dhairyam"};
  for(const r of review.publication_copy_proposals){
    assert.equal(r.version,"publisher-review-v2");assert.equal(r.iast,null);
    assert(r.english && r.hindi && r.sanskrit && r.meaning_en && r.meaning_hi);
    assert.equal(review.evidence_assessment.find(e=>e.word_id===r.word_id)?.proposed_iast,historicalIast[r.word_id]);
    assert.equal(r.approval_ref,null);assert.equal(r.public_use_permission,"not_allowed");
  }
  assert.equal(review.etymology_policy_decision.permitted_omission_now,false);
  assert.equal(review.qualified_for_production_count,0);assert.equal(review.approved_for_production_count,0);
});
const activationReview=prep.final_release_review.publication_activation_review;
await check("primary evidence capture pins the inspected edition without claiming expert approval",()=>{
  assert.equal(activationReview.record_role,"non_executable_evidence_and_deployment_observation");
  assert.equal(activationReview.baseline,"3fe48298f42684440b07f7476c0bd6c6adc91575");
  assert.equal(activationReview.observed_on,"2026-10-24");
  const source=activationReview.source_edition;
  assert.equal(source.publication_year,1899);assert.equal(source.original_scan_inspected_count,3);
  assert.equal(source.source_reference_id,"src_cologne_digital_sanskrit_dictionaries");
  assert.equal(source.data_revision,"e4742e12cde786b1a2d10e0507808620a4f2c8eb");
  assert.equal(source.data_sha256,"e4641dc4384de459408368a9b34b2a13c90a19b0ecd4671f92c055b7578d0129");
  assert.equal(source.data_url,`https://raw.githubusercontent.com/sanskrit-lexicon/csl-orig/${source.data_revision}/v02/mw/mw.txt`);
  assert.equal(activationReview.human_linguistic_signoff,null);
});
await check("three primary entry identities and printed locators resolve only to the historical pilots",()=>{
  const expected={reflection:["ag69f_review_draft_001","manana",["156763"],783,3],discernment:["ag69f_review_draft_004","viveka",["200139","200140","200141"],987,3],patience:["ag69f_review_draft_005","DErya",["102069"],520,2]};
  const records=activationReview.individual_release_review;
  assert.deepEqual(records.map(r=>r.word_id),Object.keys(expected));
  for(const r of records){const s=r.sanskrit_source,[draft,key,ids,page,column]=expected[r.word_id];
    assert.equal(r.draft_id,draft);assert.equal(s.headword_slp1,key);assert.deepEqual(s.record_ids,ids);
    assert.equal(s.printed_page,page);assert.equal(s.printed_column,column);
    const u=new URL(s.lookup_url);assert.equal(u.hostname,"www.sanskrit-lexicon.uni-koeln.de");assert.equal(u.searchParams.get("key"),key);
    assert.equal(s.digital_entry_inspected,true);assert.equal(s.original_scan_inspected,true);assert.match(s.scan_sha256,/^[a-f0-9]{64}$/);
    assert.equal(new URL(s.scan_url).hostname,u.hostname);assert.equal(s.review_status,"pending");
    assert(prep.final_release_review.publication_copy_proposals.some(p=>p.word_id===r.word_id&&p.version===r.copy_proposal_version));
  }
});
await check("Hindi access evidence preserves page labels independently of query indexes",()=>{
  const expected={reflection:["3779","3780"],discernment:["4539","4534"],patience:["2482","2483"]};
  for(const r of activationReview.individual_release_review){const s=r.hindi_source;
    assert.equal(s.source_reference_id,"src_hindi_shabdasagara_dsal");
    assert.equal(s.headword,dossier.words.find(w=>w.word_id===r.word_id).original_copy.hindi);
    assert.deepEqual([s.entry_page_label,s.page_query_parameter],expected[r.word_id]);
    const u=new URL(s.url);assert.equal(u.hostname,"dsal.uchicago.edu");assert.equal(u.searchParams.get("qs"),s.headword);
    assert.equal(s.http_status,200);assert.equal(s.access_status,"inspected_direct_https");assert.equal(s.original_scan_inspected,false);assert.equal(s.review_status,"pending");
  }
});
await check("source inspection and observed licences cannot authorize a pilot or its public copy",()=>{
  const rights=activationReview.source_use_review;
  assert.equal(rights.observed_data_license,"CC BY-SA 4.0");assert.equal(rights.rights_review_status,"pending");
  assert.equal(rights.attribution_review_status,"pending");assert.equal(rights.exact_use_rights_approval_ref,null);assert.equal(rights.quoted_dictionary_text,null);
  assert.equal(rights.reuse_permission,"not_allowed_pending_exact_use_review");
  assert.equal(activationReview.qualified_word_count,0);assert.equal(activationReview.production_approved_word_count,0);
  assert.equal(activationReview.runtime_activation,false);assert.equal(activationReview.public_output_allowed,false);
  for(const r of activationReview.individual_release_review){
    assert.equal(r.canonical_identity_approval_ref,null);assert.equal(r.etymology_status,"unverified");
    assert.equal(r.production_readiness,"not_ready");assert.equal(r.production_approved,false);assert.equal(r.public_use_permission,"not_allowed");
    assert(Object.values(r.remaining_approval_refs).every(v=>v===null));
  }
});
await check("registered standing policy matches the genuine publisher record without activating content",()=>{
  const p=activationReview.publisher_policy_registration,source=config.publisher_policy;
  assert.equal(p.record_ref,source.record_ref);assert.equal(p.approval_ref,source.approval_ref);assert.equal(p.version,source.version);
  assert.equal(p.payload_hash,snapshotHash(source));assert.equal(p.kind,"approval");assert.equal(p.status,"registered_and_read_back");
  assert.equal(p.project_ref,"pajlabwwszmhjhabxprf");assert.equal(p.candidate_records_registered,0);assert.equal(p.publication_events,0);
  for(const k of["persistence_enabled","publication_enabled","scheduler_enabled","server_activation_authorized_by_registration"])assert.equal(p[k],false);
});
await check("trusted server is disabled by default and pending real release config cannot write",async()=>{
  const rpc=async()=>({data:{configuration:config}});
  assert.equal((await runWordServerWorkflow({timestamp:"2026-10-24T00:00:00.000Z",rpc})).reason,"word_server_not_activated");
  assert.equal((await runWordServerWorkflow({timestamp:"2026-10-24T00:00:00.000Z",rpc,enabled:true})).reason,"server_release_approval_pending");
  assert.equal((await readWordServerPublication({rpc:async()=>({error:{message:"synthetic unapproved"}}),timestamp:"2026-10-24T00:00:00.000Z"})).status,"withheld");
});
await check("Edge handler refuses browser writes, caller dates, oversized bodies and secret disclosure",async()=>{
  const previous=globalThis.Deno,oldFetch=globalThis.fetch;let handler,calls=0;
  const key="synthetic-test-only-not-a-real-key";
  globalThis.Deno={env:{get:k=>({WORD_WORKFLOW_ENABLED:"true",SUPABASE_URL:"https://synthetic.invalid",SUPABASE_SERVICE_ROLE_KEY:key})[k]},serve:h=>{handler=h;}};
  globalThis.fetch=async()=>{calls++;return new Response("{}",{status:503});};
  try {
    await import(new URL("../supabase/functions/word-publication/index.ts?qa="+Date.now(),import.meta.url));
    for(const auth of [null,"Bearer synthetic-browser-token"]) {
      for(const operation of ["reserve","run_daily"]) {
        const r=await handler(new Request("https://synthetic.invalid",{method:"POST",headers:auth?{Authorization:auth}:{},body:JSON.stringify({operation})}));assert.equal(r.status,403);
      }
    }
    assert.equal(calls,0);
    const headers={Authorization:"Bearer "+key};
    assert.equal((await handler(new Request("https://synthetic.invalid",{method:"POST",headers,body:JSON.stringify({operation:"reserve",date_key:"2026-10-24"})}))).status,422);
    assert.equal((await handler(new Request("https://synthetic.invalid",{method:"POST",headers,body:JSON.stringify({operation:"run_daily",standing:true})}))).status,422);
    assert.equal((await handler(new Request("https://synthetic.invalid",{method:"POST",headers,body:"x".repeat(1025)}))).status,413);
    const r=await handler(new Request("https://synthetic.invalid",{headers})),body=await r.text();
    assert.equal(JSON.parse(body).status,"withheld");assert(!body.includes(key));assert.equal(r.headers.get("cache-control"),"no-store");
  } finally { if(previous===undefined)delete globalThis.Deno;else globalThis.Deno=previous;globalThis.fetch=oldFetch; }
});
console.log(`Consolidated Word pipeline validation passed: ${checks} checks. These use synthetic/mocked fixtures; real PostgreSQL execution is reported separately by validate-word-postgres.mjs. No production activation is claimed.`);
