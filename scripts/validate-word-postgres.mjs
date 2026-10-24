import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { canonicalJson, snapshotHash, inspectWordHistory, selectionAuthorityHashes, selectDailyWord } from "./lib/ag70d-word-selection-engine.mjs";
import { executeWordAssignment } from "./lib/ag70d-word-assignment-store.mjs";
import { createSyntheticWordStore } from "./lib/ag70d-word-assignment-test-adapter.mjs";
import { createWordPostgresAdapter } from "./lib/ag70e-word-postgres-adapter.mjs";
import { syntheticSelection, syntheticApproval, syntheticIdentityRef } from "./lib/ag70e-word-test-fixtures.mjs";
import { projectPublishedWord } from "./lib/ag70e-word-publication-pipeline.mjs";
import { runWordServerWorkflow, readWordServerPublication } from "./lib/ag70e-word-server-workflow.mjs";

// Real PostgreSQL, synthetic content/approvals. No URL, credentials, port or volume input.
const image = "postgres:17-alpine", name = "drishvara-word-qa-" + process.pid + "-" + Date.now();
const docker = (...args) => execFileSync("docker", ["--context","desktop-linux",...args], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], maxBuffer: 16e6 });
let created = false, checks = 0;
const literal = value => "'" + value.replaceAll("'", "''") + "'";
const j = value => literal(canonicalJson(value)) + "::jsonb";
function query(sql, role = null) {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", ["--context","desktop-linux","exec", "-i", name, "psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-U", "word_owner", "-d", "word_qa"], { stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    child.stdout.on("data", d => { out += d; }); child.stderr.on("data", d => { err += d; });
    child.on("error", reject); child.on("close", code => code === 0 ? resolve(out.trim()) : reject(new Error(err.trim())));
    child.stdin.end("\\set VERBOSITY verbose\n" + (role ? "set role " + role + ";\n" : "") + sql);
  });
}
const value = async (sql, role) => JSON.parse(await query(sql, role));
async function check(label, run) { await run(); checks++; console.log("PASS PostgreSQL " + label); }
async function denied(sql, role, pattern = /42501|permission denied/) { await assert.rejects(() => query(sql, role), pattern); }
async function register(ref, kind, payload) {
  await query(`insert into drishvara_word_private.versioned_references(ref_id,kind,version,payload,review_status,reviewer_id,approval_ref)
    values(${literal(ref)},${literal(kind)},'synthetic-v1',${j(payload)},'approved','synthetic-reviewer','synthetic-only-approval');`);
}
const actor = { ...syntheticApproval, trust_boundary: "server_only", actor_ref: "synthetic-server", capabilities: ["reserve", "authorize", "record_publication", "correct", "withdraw", "supersede", "cancel_reservation"], simulation_only: true };
const types = ["selection_proposal", "reservation", "authorized_assignment", "publication", "correction", "withdrawal", "supersession", "cancelled_reservation"];
async function registerInput(input, deployment = { test_only: true }) {
  const hashes = selectionAuthorityHashes(input);
  for (const [ref, kind, payload] of [
    [input.context.basis_ref, "context", { ...input.context, eligible_candidate_refs: [...input.context.eligible_candidate_refs].sort() }],
    [input.precedence.rule_ref, "precedence", input.precedence],
    [input.identity_map.snapshot_ref, "identity", { ...input.identity_map, links: [...input.identity_map.links].sort((a,b) => canonicalJson(a).localeCompare(canonicalJson(b), "en")) }],
    ["synthetic-exclusions", "exclusions", input.exclusions],
    ["synthetic-deployment", "deployment", deployment],
    [actor.approval_ref, "authorization", { actor_ref: actor.actor_ref, capabilities: types }],
    ["synthetic-source", "source", { test_only: true }],
    ["synthetic-approval", "approval", { test_only: true }],
    ...input.bank.records.map(r => [r.output_candidate_id + "@" + r.approved_record_version, "candidate", r])
  ]) {
    const exists = await query(`select count(*) from drishvara_word_private.versioned_references where ref_id=${literal(ref)};`);
    if (exists === "0") await register(ref,kind,payload);
  }
  assert.equal(await query(`select payload_hash from drishvara_word_private.versioned_references where ref_id=${literal(input.context.basis_ref)};`), hashes.context_content_hash);
  await query(`update drishvara_word_private.controls set persistence_enabled=true, identity_snapshot_ref=${literal(syntheticIdentityRef)},deployment_approval_ref='synthetic-deployment';`);
}
const rpc = async (method, params) => {
  const args = Object.values(params).map(v => typeof v === "string" ? literal(v) : j(v)).join(",");
  try { return { data: await value(`select coalesce(to_jsonb(public.${method}(${args})),'null'::jsonb);`, "service_role") }; }
  catch (error) { if(process.env.WORD_QA_DEBUG==="1") console.error("Synthetic local RPC: "+error.message); return { error: { message: "isolated_postgres_rejected" } }; }
};
const commit = request => value(`select public.word_assignment_commit(${j(request)});`, "service_role");
const history = () => value("select public.word_assignment_read_history();", "service_role");
async function resetDatabase() {
  await query("drop function if exists public.word_assignment_commit(jsonb), public.word_assignment_read_history(), public.word_assignment_read_command(text), public.word_assignment_check_authorization(text,text,text), public.word_assignment_read_workflow(text), public.word_assignment_release_snapshot(text); drop schema drishvara_word_private cascade;");
  await query(fs.readFileSync("supabase/migrations/20261023_word_assignment_preparation.sql","utf8"));
}
async function capture(input, operation, extra = {}) {
  const store = createSyntheticWordStore(syntheticIdentityRef);
  const h = input.history;
  // Reuse the real coordinator to form events; capture its CAS request without writes.
  let request;
  const adapter = { ...store, readHistory: async () => h, readCommand: async () => null,
    compareAndAppend: async r => { request = r; return { status: "committed", public_output_allowed: false }; } };
  const result = await executeWordAssignment({ adapter, authorization: actor, selection_input: input,
    command: { contract_version: input.contract_version, operation, idempotency_key: "synthetic-" + operation + "-" + h.revision,
      timestamp: input.created_at, ...extra } });
  assert.equal(result.status,"committed", JSON.stringify(result));
  return request;
}
async function transition(input, operation, extra = {}) {
  input.history = await history(); input.expected_history_ref = input.history.snapshot_ref;
  const inspected = inspectWordHistory(input.history); assert(inspected.ok);
  const a = [...inspected.assignments.values()].find(a => a.proposal.snapshot.date_key === input.date_key);
  const decisionRef = "synthetic-decision-" + input.history.revision;
  const decision = { proposal_id: a.proposal.proposal_id, event_type: { authorize:"authorized_assignment", record_publication:"publication", correct:"correction", supersede:"supersession", withdraw:"withdrawal", cancel_reservation:"cancelled_reservation" }[operation], ...extra.decision_payload };
  await register(decisionRef, "decision", decision);
  const request = await capture(input, operation, { assignment_id: a.proposal.assignment_id, proposal_id: a.proposal.proposal_id,
    expected_last_event_id: a.last_event_id, decision: { ...syntheticApproval, approval_ref: decisionRef }, ...extra.command });
  return { request, result: await commit(request) };
}

try {
  docker("image", "inspect", image);
  docker("run", "--detach", "--pull=never", "--name", name, "--label", "drishvara.word.qa=disposable",
    "--network", "none", "--read-only", "--cap-drop=ALL", "--security-opt", "no-new-privileges", "--user", "postgres",
    "--memory", "512m", "--cpus", "1", "--tmpfs", "/tmp", "--tmpfs", "/var/run/postgresql:rw,mode=1777",
    "--tmpfs", "/var/lib/postgresql/data:rw,mode=1777", "-e", "PGDATA=/var/lib/postgresql/data/pgdata",
    "-e", "POSTGRES_USER=word_owner", "-e", "POSTGRES_DB=word_qa", "-e", "POSTGRES_HOST_AUTH_METHOD=trust", image);
  created = true;
  for (let n=0;n<80;n++) {
    try {
      // Ignore initdb's temporary server; wait for the entrypoint's final postgres process.
      assert.equal(docker("exec",name,"cat","/proc/1/comm").trim(),"postgres");
      docker("exec",name,"pg_isready","-U","word_owner","-d","word_qa"); break;
    } catch { if(n===79) throw Error("isolated_postgres_unavailable"); await delay(250); }
  }
  console.log("PostgreSQL runtime: " + await query("select version();"));
  console.log("Image: " + JSON.parse(docker("image","inspect",image))[0].RepoDigests[0]);
  await check("container has no network, ports, bind mounts or privileged mode", async () => {
    const c=JSON.parse(docker("inspect",name))[0]; assert.equal(c.HostConfig.NetworkMode,"none"); assert.equal(c.HostConfig.Privileged,false);
    assert.deepEqual(c.HostConfig.PortBindings,{}); assert.equal(c.Mounts.filter(m=>m.Type==="bind"||m.Type==="volume").length,0);
  });
  await query("create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;");
  await check("migration compiles and applies to isolated database", async () => { await query(fs.readFileSync("supabase/migrations/20261023_word_assignment_preparation.sql","utf8")); });
  await check("disabled controls withhold history and reject writes", async () => {
    assert.equal((await history()).available,false); await denied("select public.word_assignment_commit('{}'::jsonb);","service_role",/word_persistence_not_activated/);
  });
  await check("all nine tables have RLS enabled", async () => { assert.equal(await query("select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='drishvara_word_private' and c.relkind='r' and c.relrowsecurity;"),"9"); });
  for(const role of ["anon","authenticated","service_role"]) await check(role+" cannot directly read/write private tables", async()=>{
    assert.equal(await query(`select has_schema_privilege('${role}','drishvara_word_private','USAGE');`),"f");
    for(const sql of ["select * from drishvara_word_private.events;","insert into drishvara_word_private.controls(singleton) values(false);","update drishvara_word_private.controls set persistence_enabled=true;","delete from drishvara_word_private.events;"]) await denied(sql,role);
    assert.equal(await query(`select has_function_privilege('${role}','public.word_assignment_commit(jsonb)','EXECUTE');`),role==="service_role"?"t":"f");
    if(role!=="service_role") await denied("select public.word_assignment_commit('{}'::jsonb);",role);
    for(const [signature,args] of [["word_assignment_check_authorization(text,text,text)","'synthetic','synthetic','reserve'"],["word_assignment_read_workflow(text)","'2026-10-23'"],["word_assignment_release_snapshot(text)","'2026-10-23'"]]) {
      assert.equal(await query(`select has_function_privilege('${role}','public.${signature}','EXECUTE');`),role==="service_role"?"t":"f");
      if(role!=="service_role") await denied(`select public.${signature.split('(')[0]}(${args});`,role);
    }
  });
  await check("real RLS denies browser roles even under an accidental temporary table grant",async()=>{
    await query("grant usage on schema drishvara_word_private to anon; grant select,insert on drishvara_word_private.versioned_references to anon;");
    try { assert.equal(await query("select count(*) from drishvara_word_private.versioned_references;","anon"),"0");
      await denied("insert into drishvara_word_private.versioned_references(ref_id,kind,version,payload,review_status) values('synthetic-forbidden','source','v1','{}','pending');","anon",/42501|row-level security/);
    } finally { await query("revoke all on schema drishvara_word_private from anon; revoke all on drishvara_word_private.versioned_references from anon;"); }
  });
  for(const sample of [{text:"मननम् विवेकः धैर्यम्",n:9007199254740991}, {a:"\b\n\t\r\f\\\"",nested:[null,true,false,-10]}, {"2":"two","10":"ten",a:"x"}, {text:"𐀀\u2028\u2029",n:0}]) await check("PostgreSQL/Node canonical hash parity "+checks,async()=>{
    assert.equal(await query(`select drishvara_word_private.content_hash(${j(sample)});`),snapshotHash(sample));
  });
  await check("unsupported fractional and out-of-range numbers fail closed",async()=>{
    await denied("select drishvara_word_private.content_hash('{\"n\":0.5}');",null,/unsupported_snapshot_number/);
    await denied("select drishvara_word_private.content_hash('{\"n\":9007199254740992}');",null,/unsupported_snapshot_number/);
  });
  const input=syntheticSelection(); await registerInput(input);
  const request=await capture(input,"reserve");
  await check("adapter reserves via real database transaction and validates readback",async()=>{
    const adapter=createWordPostgresAdapter({rpc,mode:"isolated_local_validation"});
    assert.equal((await adapter.compareAndAppend(request)).status,"committed"); assert.equal((await adapter.readHistory()).revision,2);
    assert(inspectWordHistory(await history()).ok);
  });
  await check("same command retry returns the original idempotent receipt",async()=>{ assert.equal((await commit(request)).status,"idempotent_replay"); assert.equal((await history()).revision,2); });
  await check("idempotency key reuse with a different request is rejected",async()=>{ await denied(`select public.word_assignment_commit(${j({...request,request_hash:snapshotHash("different")})});`,"service_role",/word_idempotency_conflict/); });
  await check("single-date unique index rejects a duplicate active date",async()=>{
    await denied("insert into drishvara_word_private.date_claims select 'synthetic-duplicate',publication_scope,date_key,timezone,proposal_id,last_event_id,publication_event_id,state from drishvara_word_private.date_claims limit 1;",null,/23505|unique/);
  });
  await check("authorized assignment requires a registered decision",async()=>{ assert.equal((await transition(input,"authorize")).result.status,"committed"); });
  await check("publication remains independently disabled",async()=>{ await assert.rejects(()=>transition(input,"record_publication"),/word_publication_not_activated/); assert.equal((await history()).revision,3); });
  await query("update drishvara_word_private.controls set publication_enabled=true;");
  await check("synthetic publication appends without rewriting reservation",async()=>{
    // Reuse the pending decision from the preceding rejected transaction.
    input.history=await history(); input.expected_history_ref=input.history.snapshot_ref;
    const a=[...inspectWordHistory(input.history).assignments.values()][0];
    const pub=await capture(input,"record_publication",{assignment_id:a.proposal.assignment_id,proposal_id:a.proposal.proposal_id,expected_last_event_id:a.last_event_id,
      decision:{...syntheticApproval,approval_ref:"synthetic-decision-3"}});
    assert.equal((await commit(pub)).status,"committed"); assert.equal((await history()).revision,4);
  });
  await check("correction requires its own registered candidate and context, and appends",async()=>{
    const corrected=structuredClone(input.bank.records[0]); corrected.approved_record_version="synthetic-v2";
    await register(corrected.output_candidate_id+"@"+corrected.approved_record_version,"candidate",corrected);
    const context={...input.context,eligible_candidate_refs:[corrected.output_candidate_id+"@"+corrected.approved_record_version]};
    await register("synthetic-corrected-context","context",context);
    const h=await history();
    const result=await transition(input,"correct",{command:{corrected_record_snapshot:corrected,corrects_event_id:h.events.at(-1).event_id},
      decision_payload:{corrected_record_hash:snapshotHash(corrected),corrected_context_ref:"synthetic-corrected-context",corrected_context_hash:snapshotHash(context)}});
    assert.equal(result.result.status,"committed"); const next=await history();assert.equal(next.revision,5); assert.deepEqual(next.events.slice(0,4),h.events);assert(inspectWordHistory(next).ok);
  });
  await check("supersession retains used identity and withholds the public projection",async()=>{
    assert.equal((await transition(input,"supersede",{command:{supersession_ref:"synthetic-supersession-review"}})).result.status,"committed");
    const h=await history();assert(inspectWordHistory(h).ok);
    assert.equal(projectPublishedWord({history:h,date_key:input.date_key,release:{...syntheticApproval,public_output_allowed:true,runtime_activation:true,approved_publication_event_refs:h.events.map(e=>e.event_id)}}).status,"withheld");
    assert.equal(await query("select count(*) from drishvara_word_private.identity_claims;"),"3");
  });
  await check("append-only UPDATE DELETE TRUNCATE triggers execute on every immutable table",async()=>{
    for(const table of ["versioned_references","reference_revocations","assignment_snapshots","events","command_receipts"]) {
      if(table==="reference_revocations") await query("insert into drishvara_word_private.reference_revocations values('synthetic-source','synthetic-revoke','test only',now());");
      const col={versioned_references:"version",reference_revocations:"reason",assignment_snapshots:"assignment_id",events:"assignment_id",command_receipts:"request_hash"}[table];
      for(const sql of [`update drishvara_word_private.${table} set ${col}=${col};`,`delete from drishvara_word_private.${table};`,`truncate drishvara_word_private.${table} cascade;`]) await denied(sql,null,/word_history_is_append_only/);
    }
  });
  await resetDatabase(); const fresh=syntheticSelection(); await registerInput(fresh);
  const reservation=await capture(fresh,"reserve");
  await check("failure in second event rolls back snapshots, events, receipt and head",async()=>{
    const bad=structuredClone(reservation);bad.events[1].authorization_ref="synthetic-missing-authorization";
    await denied(`select public.word_assignment_commit(${j(bad)});`,"service_role",/word_reference_unapproved/);
    assert.equal((await history()).revision,0);
    for(const table of ["assignment_snapshots","events","command_receipts","identity_claims","date_claims"]) assert.equal(await query(`select count(*) from drishvara_word_private.${table};`),"0");
  });
  await check("explicit transaction rollback leaves the same command retryable",async()=>{
    await query(`begin; set local role service_role; select public.word_assignment_commit(${j(reservation)}); rollback;`);
    assert.equal((await history()).revision,0); assert.equal(await query("select count(*) from drishvara_word_private.command_receipts;"),"0");
  });
  await check("backend termination rolls back an uncommitted assignment and permits recovery",async()=>{
    const pending=query(`set application_name='synthetic-word-crash'; begin; set local role service_role; select public.word_assignment_commit(${j(reservation)}); select pg_sleep(20); commit;`);
    const failure=assert.rejects(()=>pending,/terminat|closed|connection|57P01/i);
    let pid;
    for(let n=0;n<60;n++) { pid=await query("select pid from pg_stat_activity where application_name='synthetic-word-crash' and wait_event='PgSleep';");if(pid)break;await delay(25); }
    assert(/^\d+$/.test(pid),"transaction reached its uncommitted sleep");
    assert.equal(await query(`select pg_terminate_backend(${pid});`),"t"); await failure;
    assert.equal((await history()).revision,0);
  });
  await check("concurrent same-key retries commit once and recover original receipt",async()=>{
    const results=await Promise.all([commit(reservation),commit(reservation)]);
    assert.deepEqual(results.map(r=>r.status).sort(),["committed","idempotent_replay"]);
    assert.equal((await history()).revision,2);assert.equal(await query("select count(*) from drishvara_word_private.command_receipts;"),"1");
    assert.equal((await commit(reservation)).status,"idempotent_replay");
  });
  await resetDatabase(); const race=syntheticSelection();await registerInput(race);
  const r1=await capture(race,"reserve"),r2=await capture(race,"reserve",{idempotency_key:"synthetic-competing-reservation"});
  await check("concurrent distinct commands for one canonical date have one winner",async()=>{
    const results=await Promise.all([commit(r1),commit(r2)]);assert.deepEqual(results.map(r=>r.status).sort(),["committed","conflict"]);
    assert.equal((await history()).revision,2); assert.equal(await query("select count(*) from drishvara_word_private.date_claims;"),"1");
  });
  await check("withdrawal appends history and does not release the canonical date",async()=>{
    assert.equal((await transition(race,"authorize")).result.status,"committed");
    assert.equal((await transition(race,"withdraw")).result.status,"committed");
    assert(inspectWordHistory(await history()).ok);assert.equal(await query("select state from drishvara_word_private.date_claims;"),"withdrawal");
  });
  await resetDatabase();const dayA=syntheticSelection(1,"2026-10-24"),dayB=syntheticSelection(1,"2026-10-25");
  dayA.created_at=dayB.created_at="2026-10-23T01:00:00.000Z";
  dayB.context.basis_ref=dayB.policy.publication_model.canonical_context_basis_ref="synthetic-second-date-context";
  await registerInput(dayA);await registerInput(dayB);
  await check("two dates cannot concurrently reserve one lexical identity",async()=>{
    const a=await capture(dayA,"reserve",{idempotency_key:"synthetic-date-A"}),b=await capture(dayB,"reserve",{idempotency_key:"synthetic-date-B"});
    const results=await Promise.all([commit(a),commit(b)]);assert.deepEqual(results.map(r=>r.status).sort(),["committed","conflict"]);
    const loser=results[0].status==="conflict"?dayA:dayB;loser.history=await history();loser.expected_history_ref=loser.history.snapshot_ref;
    assert.equal(selectDailyWord(loser).status,"withheld");assert.equal(await query("select count(*) from drishvara_word_private.identity_claims;"),"3");
  });
  await resetDatabase();const cancellation=syntheticSelection();await registerInput(cancellation);
  await commit(await capture(cancellation,"reserve"));
  await check("cancelled unauthorized reservation releases claims without deleting history",async()=>{
    assert.equal((await transition(cancellation,"cancel_reservation")).result.status,"committed");
    assert.equal(await query("select count(*) from drishvara_word_private.identity_claims;"),"0");
    assert.equal((await history()).revision,3);assert(inspectWordHistory(await history()).ok);
  });
  await resetDatabase(); const revoked=syntheticSelection(); await registerInput(revoked);
  await query("insert into drishvara_word_private.reference_revocations values('synthetic-source','synthetic-revoke','test only',now());");
  await check("revoked registered source cannot enter even a reservation",async()=>{
    const req=await capture(revoked,"reserve");await denied(`select public.word_assignment_commit(${j(req)});`,"service_role",/word_reference_unapproved/);
    assert.equal((await history()).revision,0);
  });
  await resetDatabase(); const serverInput=syntheticSelection();
  const configuration=JSON.parse(fs.readFileSync("data/knowledge-base/word-of-day/production/methodology/ag70d-word-release-configuration.json"));
  configuration.persistence={enabled:true,server_authorization_ref:actor.approval_ref};configuration.runtime_activation=true;
  const deployment={test_only:true,version:"synthetic-v1",configuration,policy:serverInput.policy,authorization_ref:actor.approval_ref,
    context_refs:{[serverInput.date_key]:serverInput.context.basis_ref},precedence_ref:serverInput.precedence.rule_ref,
    exclusions_ref:"synthetic-exclusions",candidate_refs:serverInput.bank.records.map(r=>r.output_candidate_id+"@"+r.approved_record_version),
    decision_refs:{[serverInput.date_key]:{}},publication_release_ref:"synthetic-feed-release"};
  await registerInput(serverInput,deployment);
  const run=opts=>runWordServerWorkflow({rpc,timestamp:serverInput.created_at,enabled:true,...opts});
  let deploymentVersion=1;
  async function redeploy() {
    const ref="synthetic-deployment-"+(++deploymentVersion);await register(ref,"deployment",deployment);
    await query(`update drishvara_word_private.controls set deployment_approval_ref=${literal(ref)};`);
  }
  await check("trusted worker defaults off without touching a database",async()=>{
    assert.equal((await runWordServerWorkflow({timestamp:serverInput.created_at,rpc:()=>{throw Error("unexpected call");}})).reason,"word_server_not_activated");
  });
  await check("trusted worker refuses unapproved scheduling",async()=>{assert.equal((await run({scheduled:true})).reason,"scheduling_not_authorized");assert.equal((await history()).revision,0);});
  await check("trusted worker concurrently reserves from registered DB inputs only",async()=>{
    const results=await Promise.all([run({operation:"reserve"}),run({operation:"reserve"})]);
    assert(results.some(r=>r.status==="committed"),JSON.stringify(results));assert(results.every(r=>["committed","idempotent_replay","replay"].includes(r.status)),JSON.stringify(results));
    assert.equal((await history()).revision,2);assert.equal((await run({operation:"reserve"})).status,"replay");
  });
  configuration.scheduler={...configuration.scheduler,enabled:true,local_time:"06:00",approval_ref:"synthetic-schedule-only"};await redeploy();
  await check("prepared scheduler refuses invocation before the reviewed IST time",async()=>{
    assert.equal((await run({scheduled:true})).reason,"before_approved_schedule_time");assert.equal((await history()).revision,2);
  });
  await check("prepared scheduled reservation after IST time only replays the frozen assignment",async()=>{
    assert.equal((await run({scheduled:true,timestamp:"2026-10-23T01:00:00.000Z"})).status,"replay");assert.equal((await history()).revision,2);
  });
  await check("worker waits for an actual registered authorization decision",async()=>{
    assert.equal((await run({operation:"authorize"})).reason,"assignment_approval_unavailable");
    const a=[...inspectWordHistory(await history()).assignments.values()][0];
    await register("synthetic-server-authorize","decision",{proposal_id:a.proposal.proposal_id,event_type:"authorized_assignment"});
    deployment.decision_refs[serverInput.date_key].authorize="synthetic-server-authorize";await redeploy();
    assert.equal((await run({operation:"authorize"})).status,"committed");
  });
  await check("worker publication requires separate registered decision and release controls",async()=>{
    assert.equal((await run({operation:"record_publication"})).reason,"publication_release_approval_pending");
    const a=[...inspectWordHistory(await history()).assignments.values()][0];
    await register("synthetic-server-publish","decision",{proposal_id:a.proposal.proposal_id,event_type:"publication"});
    deployment.decision_refs[serverInput.date_key].record_publication="synthetic-server-publish";
    configuration.publication={...syntheticApproval,public_output_allowed:true,runtime_activation:true};await redeploy();
    assert.equal((await run({operation:"record_publication"})).status,"withheld");
    await query("update drishvara_word_private.controls set publication_enabled=true;");
    assert.equal((await run({operation:"record_publication"})).status,"committed");
    assert.equal((await run({operation:"record_publication"})).status,"replay");
  });
  await check("trusted exporter withholds until a separately registered event release exists",async()=>{
    assert.equal((await readWordServerPublication({rpc,timestamp:serverInput.created_at})).status,"withheld");
    const h=await history();await register("synthetic-feed-release","deployment",{...syntheticApproval,public_output_allowed:true,runtime_activation:true,approved_publication_event_refs:[h.events.at(-1).event_id]});
    const output=await readWordServerPublication({rpc,timestamp:serverInput.created_at});assert.equal(output.status,"published");
    assert.equal(output.assignment.reviewed_copy.content.english,"Synthetic word 1");
    assert.equal((await readWordServerPublication({rpc,timestamp:"2026-10-23T18:30:00.000Z"})).status,"withheld");
  });
  await check("trusted exporter rechecks revoked evidence rather than trusting history flags",async()=>{
    await query("insert into drishvara_word_private.reference_revocations values('synthetic-source','synthetic-revoke','test only',now());");
    assert.equal((await readWordServerPublication({rpc,timestamp:serverInput.created_at})).status,"withheld");
  });
  console.log(`Real PostgreSQL checks passed: ${checks}. Synthetic records only; no production certification or publication.`);
} finally {
  if(created) { docker("rm","--force",name); assert.equal(docker("ps","-a","--filter","name=^/"+name+"$","--format","{{.Names}}").trim(),""); console.log("Disposable PostgreSQL container and tmpfs test data removed."); }
}
