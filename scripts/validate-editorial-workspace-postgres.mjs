import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { execFileSync, execFile } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { syntheticWord, withSyntheticMeaning } from "./lib/ag70e-word-test-fixtures.mjs";

// Real disposable PostgreSQL; synthetic auth/profiles only. No URL, password or production credential input.
const image = "postgres@sha256:eee6c6e1b0894fa4fe0075eb054af9fd1cf39a35321c2d4110626cfe506411fb";
const name = "drishvara-editorial-qa-" + process.pid + "-" + Date.now();
const docker = (...args) => execFileSync("docker", ["--context", "desktop-linux", ...args], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 60000, maxBuffer: 8e6 }).trim();
let container = null, checks = 0;
const literal = v => "'" + JSON.stringify(v).replaceAll("'", "''") + "'::jsonb";
function query(sql) {
  try { return execFileSync("docker", ["--context", "desktop-linux", "exec", "-i", container, "psql", "-XqAt", "-v", "ON_ERROR_STOP=1", "-U", "review_owner", "-d", "review_qa"], { input: sql, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 20000, maxBuffer: 8e6 }).trim(); }
  catch (error) { throw new Error(String(error.stderr || error.message)); }
}
const actorSql = (actor, command) => `begin; set local role authenticated; select set_config('request.jwt.claim.sub','${actor}',true); select public.editorial_review_command(${literal(command)}); commit;`;
const invoke = (actor, command) => JSON.parse(query(actorSql(actor, command)).split("\n").at(-1));
const invokeConcurrent = (actor, command) => new Promise((resolve, reject) => {
  const child = execFile("docker", ["--context", "desktop-linux", "exec", "-i", container, "psql", "-XqAt", "-v", "ON_ERROR_STOP=1", "-U", "review_owner", "-d", "review_qa"], { encoding: "utf8", timeout: 20000 }, (error, stdout, stderr) => {
    if (error) reject(new Error(stderr)); else resolve(JSON.parse(stdout.trim().split("\n").at(-1)));
  });
  child.stdin.end(actorSql(actor, command));
});
function check(label, run) { run(); checks++; console.log("PASS real PostgreSQL: " + label); }
const author = randomUUID(), reviewer = randomUUID(), other = randomUUID(), inactive = randomUUID();
const create = { action: "intake", command_id: randomUUID(), kind: "article", external_id: "synthetic-article", expected_version_id: null, title: "Synthetic editorial test",
  payload: { desk: "world_affairs", body: "Synthetic article only", sources: [], media: [], research_refs: [] } };
const grant = (who, kind, scope, qualification = null) => query(`insert into drishvara_editorial_private.capabilities(subject_id,kind,scope,authorization_ref,qualification_ref,expires_at) values('${who}','${kind}','${scope}','synthetic-authorization-${scope}',${qualification ? "'" + qualification + "'" : "null"},now()+interval '1 day');`);
const assign = (who, candidate) => query(`insert into drishvara_editorial_private.assignments values('${candidate}','${who}','synthetic-assignment',now()+interval '1 day',null);`);
try {
  docker("image", "inspect", image);
  container = docker("run", "--detach", "--pull=never", "--name", name, "--label", "drishvara.editorial.qa=disposable", "--network", "none", "--read-only", "--cap-drop=ALL", "--security-opt", "no-new-privileges", "--user", "postgres", "--memory", "512m", "--cpus", "1", "--tmpfs", "/tmp", "--tmpfs", "/var/run/postgresql:rw,mode=1777", "--tmpfs", "/var/lib/postgresql/data:rw,mode=1777", "-e", "PGDATA=/var/lib/postgresql/data/pgdata", "-e", "POSTGRES_USER=review_owner", "-e", "POSTGRES_DB=review_qa", "-e", "POSTGRES_HOST_AUTH_METHOD=trust", image);
  let ready = false;
  for (let n = 0; n < 200; n++) { try { if (docker("exec", container, "cat", "/proc/1/comm") === "postgres" && query("select 1") === "1") { ready = true; break; } } catch {} await delay(100); }
  assert(ready, "disposable database ready");
  check("isolated PostgreSQL 17 with no ports, network or persistent volumes", () => {
    assert(query("show server_version").startsWith("17.")); const info = JSON.parse(docker("inspect", container))[0];
    assert.equal(info.HostConfig.NetworkMode, "none"); assert.equal(info.HostConfig.Privileged, false); assert.equal(info.HostConfig.ReadonlyRootfs, true);
    assert.equal(Object.keys(info.HostConfig.PortBindings ?? {}).length, 0); assert(info.Mounts.every(m => m.Type === "tmpfs"));
  });
  query(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
    create schema auth;create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth,public to authenticated;grant execute on function auth.uid() to authenticated;
    create table public.profiles(id uuid primary key references auth.users,role text,is_active boolean);
    insert into auth.users values('${author}'),('${reviewer}'),('${other}'),('${inactive}');
    insert into public.profiles values('${author}','editor',true),('${reviewer}','admin',true),('${other}','editor',true),('${inactive}','admin',false);
    create table public.synthetic_panchang(id text primary key,value text);insert into public.synthetic_panchang values('preserved','unchanged');`);
  check("migration applies only in isolated synthetic database", () => query(fs.readFileSync("supabase/migrations/20261027000000_editorial_review_preparation.sql", "utf8")));
  check("no reviewer qualifications, grants, approvals or drafts seeded", () => assert.equal(query("select count(*) from drishvara_editorial_private.capabilities"), "0"));
  check("ordinary active account does not imply reviewer authority", () => assert.throws(() => invoke(other, { action: "list" }), /editorial_capability_required/));
  check("anonymous cannot execute review RPC", () => assert.throws(() => query("set role anon;select public.editorial_review_command('{\"action\":\"list\"}');"), /permission denied/));
  check("service-role cannot impersonate reviewer through RPC", () => assert.throws(() => query("set role service_role;select public.editorial_review_command('{\"action\":\"list\"}');"), /permission denied/));
  grant(author, "article", "intake"); grant(reviewer, "article", "editorial"); grant(other, "article", "editorial"); grant(inactive, "article", "editorial");
  check("inactive profile rejected despite capability", () => assert.throws(() => invoke(inactive, { action: "list" }), /editorial_access_denied/));
  check("qualified linguistic grant cannot omit qualification reference", () => assert.throws(() => grant(reviewer, "word", "linguistic"), /check constraint/));
  let first;
  check("authenticated intake creates immutable pending version", () => { first = invoke(author, create); assert(first.ok); assert.equal(first.status, "pending_review"); assert.equal(first.public_output_allowed, false); });
  check("idempotent intake retry returns exact receipt", () => assert.deepEqual(invoke(author, create), first));
  check("same command ID cannot carry changed content", () => assert.throws(() => invoke(author, { ...create, title: "different" }), /idempotency_conflict/));
  check("unassigned reviewer sees no draft rows", () => assert.deepEqual(invoke(other, { action: "list" }).items, []));
  check("unassigned cannot open known UUID", () => assert.throws(() => invoke(other, { action: "open", candidate_id: first.candidate_id }), /editorial_assignment_required/));
  assign(reviewer, first.candidate_id);
  const base = { action: "decision", command_id: randomUUID(), candidate_id: first.candidate_id, version_id: first.version_id, content_hash: first.content_hash,
    scope: "editorial", decision: "approve", note: "Synthetic independent review", evidence_refs: ["synthetic-evidence"] };
  check("forged actor field rejected by database, not just HTTP", () => assert.throws(() => invoke(reviewer, { ...base, actor_id: author }), /unknown_editorial_field/));
  check("unknown actions fail closed", () => assert.throws(() => invoke(reviewer, { action: "publish" }), /invalid_editorial_command/));
  check("unknown scope cannot be approved", () => assert.throws(() => invoke(reviewer, { ...base, scope: "admin_override" }), /invalid_editorial_decision/));
  check("null note cannot bypass decision validation", () => assert.throws(() => invoke(reviewer, { ...base, note: null }), /null_editorial_field/));
  check("numeric fields cannot bypass exact string contracts", () => assert.throws(() => invoke(reviewer, { ...base, note: 12 }), /invalid_editorial_field_type/));
  check("wrong version hash cannot be reviewed", () => assert.throws(() => invoke(reviewer, { ...base, content_hash: "sha256:" + "0".repeat(64) }), /stale_editorial_version/));
  check("approval needs a recorded evidence basis", () => assert.throws(() => invoke(reviewer, { ...base, evidence_refs: [] }), /invalid_editorial_decision/));
  check("ungranted review scope rejected", () => assert.throws(() => invoke(reviewer, { ...base, scope: "rights" }), /review_scope_denied/));
  let review;
  check("assigned scoped decision binds actual actor and immutable hash", () => {
    review = invoke(reviewer, base); assert(review.ok); const row = JSON.parse(query("select row_to_json(d) from drishvara_editorial_private.decisions d"));
    assert.equal(row.actor_id, reviewer); assert.equal(row.content_hash, first.content_hash); assert.equal(row.authorization_ref, "synthetic-authorization-editorial");
  });
  check("decision replay does not create duplicate history", () => { assert.deepEqual(invoke(reviewer, base), review); assert.equal(query("select count(*) from drishvara_editorial_private.decisions"), "1"); });
  const parallel = { ...base, command_id: randomUUID() };
  const parallelReceipts = await Promise.all([invokeConcurrent(reviewer, parallel), invokeConcurrent(reviewer, parallel)]);
  check("real concurrent retries serialize into one decision", () => { assert.deepEqual(parallelReceipts[0], parallelReceipts[1]); assert.equal(query("select count(*) from drishvara_editorial_private.decisions"), "2"); });
  assign(author, first.candidate_id); grant(author, "article", "editorial"); grant(reviewer, "article", "release");
  check("author cannot self-approve even with capability and assignment", () => assert.throws(() => invoke(author, { ...base, command_id: randomUUID() }), /self_review_denied/));
  const release = { action: "request_release", command_id: randomUUID(), candidate_id: first.candidate_id, version_id: first.version_id, content_hash: first.content_hash };
  check("release blocked while any independent scope remains pending", () => assert.throws(() => invoke(reviewer, release), /editorial_reviews_pending/));
  for (const scope of ["rights", "factual", "safety", "media", "publisher_acceptance"]) { grant(reviewer, "article", scope); invoke(reviewer, { ...base, command_id: randomUUID(), scope }); }
  check("all required decisions permit handoff only, never publication", () => { const r = invoke(reviewer, release); assert.equal(r.status, "pending_existing_publisher_validation"); assert.equal(r.public_output_allowed, false); assert.equal(r.runtime_activation, false); });
  check("repeated release is one durable outbox record", () => { invoke(reviewer, { ...release, command_id: randomUUID() }); assert.equal(query("select count(*) from drishvara_editorial_private.release_requests"), "1"); });
  check("revoked qualification/capability invalidates effective approval", () => {
    query(`update drishvara_editorial_private.capabilities set revoked_at=now() where subject_id='${reviewer}' and kind='article' and scope='rights';`);
    assert.equal(invoke(reviewer, { action: "open", candidate_id: first.candidate_id }).review_state.reviews_complete, false);
    assert.throws(() => invoke(reviewer, { ...release, command_id: randomUUID() }), /editorial_reviews_pending/);
    query(`update drishvara_editorial_private.capabilities set revoked_at=null where subject_id='${reviewer}' and kind='article' and scope='rights';`);
  });
  let revised;
  check("copy edit appends version and invalidates all prior approvals", () => {
    revised = invoke(author, { ...create, command_id: randomUUID(), expected_version_id: first.version_id, payload: { ...create.payload, body: "Synthetic revised copy" } });
    assert.notEqual(revised.version_id, first.version_id); const current = invoke(reviewer, { action: "open", candidate_id: first.candidate_id });
    assert.deepEqual(current.review_state.approved_scopes, []); assert.equal(current.decisions.length, 7); assert.equal(current.release_requests.length, 1);
  });
  check("stale review cannot follow old version after edit", () => assert.throws(() => invoke(reviewer, { ...base, command_id: randomUUID() }), /stale_editorial_version/));
  check("stale outbox version cannot be requested after edit", () => assert.throws(() => invoke(reviewer, { ...release, command_id: randomUUID() }), /stale_editorial_version/));
  check("concurrent stale revisions cannot overwrite newer data", () => assert.throws(() => invoke(author, { ...create, command_id: randomUUID(), expected_version_id: first.version_id }), /stale_editorial_version/));
  check("rejection is appended, never overwrites prior approval", () => {
    const b = { ...base, version_id: revised.version_id, content_hash: revised.content_hash };
    invoke(reviewer, { ...b, command_id: randomUUID() }); invoke(reviewer, { ...b, command_id: randomUUID(), decision: "reject" });
    assert.deepEqual(invoke(reviewer, { action: "open", candidate_id: first.candidate_id }).review_state.approved_scopes, []);
  });
  for (const table of ["versions", "decisions", "release_requests", "commands"]) check("append-only " + table + " resists owner UPDATE/DELETE/TRUNCATE", () => {
    for (const sql of [`update drishvara_editorial_private.${table} set ` + (table === "versions" ? "title=title" : table === "decisions" ? "note=note" : table === "commands" ? "receipt=receipt" : "status=status"), `delete from drishvara_editorial_private.${table}`, `truncate drishvara_editorial_private.${table} cascade`]) assert.throws(() => query(sql), /immutable_editorial_history/);
  });
  check("authenticated clients cannot grant permissions or write private tables", () => {
    for (const table of ["capabilities", "assignments", "versions", "decisions"]) assert.throws(() => query(`set role authenticated;select * from drishvara_editorial_private.${table}`), /permission denied/);
  });
  check("all private tables retain RLS and deny public/client table grants", () => {
    assert.equal(query("select count(*) from pg_tables where schemaname='drishvara_editorial_private' and rowsecurity"), "7");
    assert.equal(query("select count(*) from information_schema.role_table_grants where table_schema='drishvara_editorial_private' and grantee in ('PUBLIC','anon','authenticated','service_role')"), "0");
  });
  check("bad intake rolls back candidate/version and command receipt", () => {
    const before = query("select count(*) from drishvara_editorial_private.versions");
    assert.throws(() => invoke(author, { ...create, command_id: randomUUID(), external_id: "synthetic-bad", payload: { body: "bad missing desk" } }), /invalid_article_intake/);
    assert.equal(query("select count(*) from drishvara_editorial_private.versions"), before);
  });
  grant(author, "word", "intake");
  const syntheticCopy = withSyntheticMeaning(syntheticWord(1)).reviewed_publication_copy.content;
  syntheticCopy.sources.forEach(s => { s.review_status = "pending"; s.reuse_approval_ref = null; });
  const wordIntake = { ...create, command_id: randomUUID(), kind: "word", external_id: "synthetic-word-only", payload: { contract_version: "ag70e.word-copy.v2", content: syntheticCopy, research_refs: ["synthetic-meaning-fixture"] } };
  const word = invoke(author, wordIntake); assign(reviewer, word.candidate_id);
  check("Word intake preserves pending source-use states without approval import", () => {
    grant(reviewer, "word", "release"); const opened = invoke(reviewer, { action: "open", candidate_id: word.candidate_id });
    assert(opened.version.payload.content.sources.every(s => s.review_status === "pending" && s.reuse_approval_ref === null));
    assert.equal(opened.review_state.required_scopes.length, 9); assert.equal(opened.review_state.reviews_complete, false);
  });
  check("approval-bearing Word envelope cannot bypass direct RPC intake", () => assert.throws(() => invoke(author, { ...wordIntake, command_id: randomUUID(), external_id: "synthetic-fake-approval", payload: { ...wordIntake.payload, reviews: [{ review_status: "approved" }] } }), /unknown_word_intake_field/));
  for (const scope of ["linguistic", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"]) {
    grant(reviewer, "word", scope, ["linguistic", "textual", "philosophical"].includes(scope) ? "synthetic-qualified-human-reference" : null);
    invoke(reviewer, { ...base, command_id: randomUUID(), candidate_id: word.candidate_id, version_id: word.version_id, content_hash: word.content_hash, scope });
  }
  const wordRelease = { ...release, command_id: randomUUID(), candidate_id: word.candidate_id, version_id: word.version_id, content_hash: word.content_hash };
  check("IAST review is independently required despite eight other approvals", () => assert.throws(() => invoke(reviewer, wordRelease), /editorial_reviews_pending/));
  grant(reviewer, "word", "iast", "synthetic-iast-qualified-reference");
  invoke(reviewer, { ...base, command_id: randomUUID(), candidate_id: word.candidate_id, version_id: word.version_id, content_hash: word.content_hash, scope: "iast" });
  check("Word reviews permit only pending handoff, not bank or publication writes", () => { const r = invoke(reviewer, wordRelease); assert.equal(r.status, "pending_existing_publisher_validation"); assert.equal(r.public_output_allowed, false); assert.equal(query("select count(*) from pg_tables where schemaname='public' and tablename like 'word%'"), "0"); });
  check("revoked assignment prevents further access and decisions", () => {
    query(`update drishvara_editorial_private.assignments set revoked_at=now() where candidate_id='${word.candidate_id}' and subject_id='${reviewer}';`);
    assert.throws(() => invoke(reviewer, { action: "open", candidate_id: word.candidate_id }), /editorial_assignment_required/);
  });
  check("existing Panchang sentinel is unchanged", () => assert.equal(query("select value from public.synthetic_panchang where id='preserved'"), "unchanged"));
  console.log(`Editorial review: ${checks} real PostgreSQL security/transaction checks passed. Only synthetic records were used.`);
} finally {
  if (container) { docker("rm", "--force", "--volumes", container); assert.equal(docker("ps", "-aq", "--filter", "name=^/" + name + "$"), ""); console.log("Disposable editorial container and tmpfs test data removed."); }
}
