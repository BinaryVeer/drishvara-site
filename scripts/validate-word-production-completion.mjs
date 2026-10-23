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
await check("existing homepage card renders approved synthetic English/Hindi/Sanskrit/IAST and references", async () => {
  const f=frontend();assert.equal(await f.api.renderWordPublication(fixture.output,now),true);
  assert(f.nodes.get("f2-word-state").innerHTML.includes('lang="sa"'));assert(f.nodes.get("f2-word-state").innerHTML.includes('lang="sa-Latn"'));
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
console.log(`Consolidated Word pipeline validation passed: ${checks} checks. SQL checks are structural; adapter, approvals and concurrency use isolated mocks. No PostgreSQL or production certification is claimed.`);
