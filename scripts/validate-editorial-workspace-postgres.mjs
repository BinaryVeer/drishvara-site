import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { execFileSync, execFile } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { syntheticWord, withSyntheticMeaning } from "./lib/ag70e-word-test-fixtures.mjs";

// Real disposable PostgreSQL; synthetic auth/profiles only. No URL, password or production credential input.
const image = "docker.io/library/postgres@sha256:eee6c6e1b0894fa4fe0075eb054af9fd1cf39a35321c2d4110626cfe506411fb";
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
  const owner = randomUUID(), member = randomUUID();
  const email = "synthetic-member@example.invalid";
  query(`alter table auth.users add column email text;alter table auth.users add column email_confirmed_at timestamptz;
    update auth.users set email=id::text||'@example.invalid',email_confirmed_at=now();
    insert into auth.users(id,email,email_confirmed_at) values('${owner}','synthetic-owner@example.invalid',now()),('${member}','${email}',now());
    insert into public.profiles values('${owner}','admin',true),('${member}','subscriber',true);`);
  check("additive roles migration applies without seeding an administrator", () => {
    query(fs.readFileSync("supabase/migrations/20261028085525_editorial_workspace_roles.sql", "utf8"));
    assert.equal(query("select count(*) from drishvara_editorial_private.administrators"), "0");
  });
  check("global admin profile alone cannot manage workspace access", () => assert.throws(() => invoke(reviewer, { action: "people" }), /workspace_administrator_required/));
  query(`insert into drishvara_editorial_private.administrators values('${owner}','synthetic-owner-authorization',now()+interval '2 days',null);`);
  check("designated Admin has workflow access but no invented specialist qualifications", () => {
    const s = invoke(owner, { action: "session" }); assert.equal(s.is_administrator, true); assert.equal(s.publisher_delivery_enabled, false);
    assert(s.capabilities.some(g => g.scope === "release")); assert(s.capabilities.some(g => g.scope === "publisher_acceptance"));
    assert(!s.capabilities.some(g => ["linguistic", "iast", "textual", "philosophical"].includes(g.scope)));
  });
  check("ordinary account cannot enumerate accounts or change permissions", () => {
    for (const action of ["people", "lookup_person", "set_capability", "set_assignment"]) assert.throws(() => invoke(other, { action }), /workspace_administrator_required/);
  });
  check("Admin exact-email lookup resolves an existing confirmed account", () => assert.equal(invoke(owner, { action: "lookup_person", email: email.toUpperCase() }).person.id, member));
  check("unknown and inactive accounts cannot be appointed", () => {
    assert.throws(() => invoke(owner, { action: "lookup_person", email: "missing@example.invalid" }), /active_confirmed_account_required/);
    assert.throws(() => invoke(owner, { action: "lookup_person", email: inactive + "@example.invalid" }), /active_confirmed_account_required/);
  });
  const access = { action: "set_capability", command_id: randomUUID(), email, kind: "article", scope: "editorial", operation: "grant", access_days: 30,
    qualification_ref: null, qualification_verified: false, note: "Synthetic authorized reviewer appointment." };
  check("Admin grants access with append-only authorization and capped expiry", () => {
    const r = invoke(owner, access); assert.equal(r.subject_id, member); assert.equal(r.public_output_allowed, false);
    assert.equal(query(`select expires_at<=(select expires_at from drishvara_editorial_private.administrators where subject_id='${owner}') from drishvara_editorial_private.capabilities where subject_id='${member}'`), "t");
  });
  check("grant retries are idempotent and changed retries are rejected", () => {
    const before = query("select count(*) from drishvara_editorial_private.administration_events");
    invoke(owner, access); assert.equal(query("select count(*) from drishvara_editorial_private.administration_events"), before);
    assert.throws(() => invoke(owner, { ...access, scope: "rights" }), /idempotency_conflict/);
  });
  check("workspace appointment does not promote the global profile role", () => {
    assert.equal(query(`select role from public.profiles where id='${member}'`), "subscriber");
    assert.equal(invoke(member, { action: "session" }).is_administrator, false);
  });
  check("client-supplied role, authority and unsupported scope cannot escalate", () => {
    assert.throws(() => invoke(owner, { ...access, command_id: randomUUID(), role: "admin" }), /invalid_administration_command/);
    assert.throws(() => invoke(owner, { ...access, command_id: randomUUID(), scope: "administrator" }), /invalid_capability_scope/);
    assert.throws(() => invoke(owner, { ...access, command_id: randomUUID(), kind: "article", scope: "iast" }), /invalid_capability_scope/);
  });
  check("specialist appointment needs both an evidence reference and attestation", () => {
    const c = { ...access, command_id: randomUUID(), kind: "word", scope: "linguistic" };
    assert.throws(() => invoke(owner, c), /verified_qualification_reference_required/);
    assert.throws(() => invoke(owner, { ...c, qualification_ref: "synthetic-qualified-reference" }), /verified_qualification_reference_required/);
    assert.throws(() => invoke(owner, { ...c, qualification_verified: true }), /verified_qualification_reference_required/);
  });
  check("duration bounds and nonempty rationale are enforced in SQL", () => {
    for (const access_days of [0, 91, 1.5, "30"]) assert.throws(() => invoke(owner, { ...access, command_id: randomUUID(), access_days }), /invalid_access_duration|invalid_administration_fields/);
    assert.throws(() => invoke(owner, { ...access, command_id: randomUUID(), note: " " }), /invalid_administration_fields/);
  });
  const owned = invoke(owner, { ...create, command_id: randomUUID(), external_id: "synthetic-admin-authored" });
  check("Admin can inspect all workspace candidates without synthetic assignments", () => assert(invoke(owner, { action: "list" }).items.length >= 3));
  check("non-assigned reviewer still cannot access the Admin copy", () => assert.throws(() => invoke(member, { action: "open", candidate_id: owned.candidate_id }), /editorial_assignment_required/));
  const assignment = { action: "set_assignment", command_id: randomUUID(), email, candidate_id: owned.candidate_id, operation: "grant", access_days: 1, note: "Synthetic candidate assignment only." };
  check("Admin can assign a candidate by confirmed email", () => {
    invoke(owner, assignment); assert.equal(invoke(member, { action: "open", candidate_id: owned.candidate_id }).review_permissions.can_review, true);
  });
  const ownedDecision = { ...base, command_id: randomUUID(), candidate_id: owned.candidate_id, version_id: owned.version_id, content_hash: owned.content_hash };
  check("designated Admin self-review is not implicit", () => assert.throws(() => invoke(owner, ownedDecision), /explicit_admin_self_review_required/));
  const exception = { policy_ref: "drishvara-editorial-admin-self-review@1", acknowledged: true, reason: "Synthetic explicit publisher-authorized self-review exception." };
  check("malformed, unacknowledged and unknown-version exceptions fail closed", () => {
    for (const admin_exception of [{}, { ...exception, acknowledged: false }, { ...exception, reason: " " }, { ...exception, policy_ref: "unknown" }, { ...exception, role: "admin" }])
      assert.throws(() => invoke(owner, { ...ownedDecision, command_id: randomUUID(), admin_exception }), /explicit_admin_self_review_required/);
  });
  check("explicit exception is bound to the exact actor, scope, copy and policy", () => {
    invoke(owner, { ...ownedDecision, admin_exception: exception });
    const r = JSON.parse(query(`select row_to_json(d) from drishvara_editorial_private.decisions d where candidate_id='${owned.candidate_id}' and actor_id='${owner}'`));
    assert.deepEqual(r.admin_exception, exception); assert.equal(r.content_hash, owned.content_hash); assert.equal(r.actor_id, owner);
    assert.equal(r.authorization_ref, "synthetic-owner-authorization");
  });
  check("ordinary contributor cannot use the Admin exception", () => assert.throws(() => invoke(author, { ...base, command_id: randomUUID(), version_id: revised.version_id, content_hash: revised.content_hash, admin_exception: exception }), /self_review_denied/));
  check("Admin exception does not establish missing linguistic qualifications", () => {
    const ownWord = invoke(owner, { ...wordIntake, command_id: randomUUID(), external_id: "synthetic-admin-word" });
    assert.throws(() => invoke(owner, { ...ownedDecision, command_id: randomUUID(), candidate_id: ownWord.candidate_id, version_id: ownWord.version_id, content_hash: ownWord.content_hash, scope: "linguistic", admin_exception: exception }), /review_scope_denied/);
  });
  check("assigned independent reviewer can act without a self-review exception", () => {
    invoke(member, { ...ownedDecision, command_id: randomUUID() });
    assert.throws(() => invoke(member, { ...ownedDecision, command_id: randomUUID(), admin_exception: exception }), /unexpected_admin_exception/);
  });
  check("revoking a capability invalidates approvals and removes access", () => {
    invoke(owner, { ...access, command_id: randomUUID(), operation: "revoke" });
    assert.throws(() => invoke(member, { action: "list" }), /editorial_capability_required/);
    assert.deepEqual(invoke(owner, { action: "open", candidate_id: owned.candidate_id }).review_state.approved_scopes, []);
  });
  check("revoking assignment hides otherwise permitted content", () => {
    invoke(owner, { ...access, command_id: randomUUID() }); invoke(owner, { ...assignment, command_id: randomUUID(), operation: "revoke" });
    assert.throws(() => invoke(member, { action: "open", candidate_id: owned.candidate_id }), /editorial_assignment_required/);
  });
  check("new assignment authorization cannot resurrect an older approval", () => {
    invoke(owner, { ...assignment, command_id: randomUUID() });
    invoke(member, { ...ownedDecision, command_id: randomUUID() });
    assert(invoke(owner, { action: "open", candidate_id: owned.candidate_id }).review_state.approved_scopes.includes("editorial"));
    invoke(owner, { ...assignment, command_id: randomUUID(), operation: "revoke" });
    invoke(owner, { ...assignment, command_id: randomUUID() });
    assert.deepEqual(invoke(owner, { action: "open", candidate_id: owned.candidate_id }).review_state.approved_scopes, []);
  });
  check("ambiguous duplicate email identities cannot be appointed", () => {
    const duplicate = randomUUID();
    query(`insert into auth.users(id,email,email_confirmed_at) values('${duplicate}','${email}',now());insert into public.profiles values('${duplicate}','subscriber',true);`);
    assert.throws(() => invoke(owner, { action: "lookup_person", email }), /active_confirmed_account_required/);
    query(`update auth.users set email='synthetic-duplicate-resolved@example.invalid' where id='${duplicate}'`);
  });
  check("acceptance and release still require every current review scope", () => assert.throws(() => invoke(owner, { ...release, command_id: randomUUID(), candidate_id: owned.candidate_id, version_id: owned.version_id, content_hash: owned.content_hash }), /editorial_reviews_pending/));
  check("access audit cannot be updated, deleted or truncated", () => {
    for (const sql of ["update drishvara_editorial_private.administration_events set action=action", "delete from drishvara_editorial_private.administration_events", "truncate drishvara_editorial_private.administration_events"]) assert.throws(() => query(sql), /immutable_editorial_history/);
  });
  check("new private tables and helper functions have no browser grants", () => {
    assert.equal(query("select count(*) from pg_tables where schemaname='drishvara_editorial_private' and rowsecurity"), "9");
    assert.equal(query("select count(*) from information_schema.role_table_grants where table_schema='drishvara_editorial_private' and grantee in ('PUBLIC','anon','authenticated','service_role')"), "0");
    assert.throws(() => query(`set role authenticated;select drishvara_editorial_private.administration_command('{"action":"people"}');`), /permission denied/);
  });
  check("explicit until-revoked Admin designation never creates unbounded staff grants", () => {
    query(`update drishvara_editorial_private.administrators set expires_at='infinity' where subject_id='${owner}'`);
    assert.equal(invoke(owner, { action: "session" }).is_administrator, true);
    invoke(owner, { ...access, command_id: randomUUID(), access_days: 90 });
    assert.equal(query(`select isfinite(expires_at) and expires_at<=now()+interval '90 days' from drishvara_editorial_private.capabilities where subject_id='${member}' and kind='article' and scope='editorial'`), "t");
  });
  check("expired or revoked Admin designation stops management immediately", () => {
    query(`update drishvara_editorial_private.administrators set revoked_at=now() where subject_id='${owner}'`);
    assert.throws(() => invoke(owner, { action: "people" }), /workspace_administrator_required/);
    assert.throws(() => invoke(owner, { action: "session" }), /editorial_capability_required/);
  });
  check("roles migration preserves existing Panchang sentinel", () => assert.equal(query("select value from public.synthetic_panchang where id='preserved'"), "unchanged"));
  check("delivery migration is additive and disabled without operational authorization", () => {
    query(fs.readFileSync("supabase/migrations/20261028141751_editorial_release_delivery.sql", "utf8"));
    assert.equal(query("select enabled or word_enabled or article_enabled or authorization_ref is not null from drishvara_editorial_private.delivery_controls"), "f");
    assert.equal(query("select count(*) from drishvara_editorial_private.deliveries"), "0");
  });
  check("only service-role may execute the delivery worker; direct table access remains denied", () => {
    for (const role of ["anon", "authenticated"]) assert.throws(() => query(`set role ${role};select public.editorial_release_worker('{}');`), /permission denied/);
    for (const role of ["anon", "authenticated", "service_role"]) assert.throws(() => query(`set role ${role};select * from drishvara_editorial_private.delivery_controls;`), /permission denied/);
    assert.equal(query("select count(*) from pg_tables where schemaname='drishvara_editorial_private' and rowsecurity"), "12");
  });
  const publishCopy = invoke(author, { ...create, command_id: randomUUID(), external_id: "synthetic-delivery-copy" });
  assign(reviewer, publishCopy.candidate_id);
  const publishReview = { ...base, candidate_id: publishCopy.candidate_id, version_id: publishCopy.version_id, content_hash: publishCopy.content_hash };
  const publishRequest = { action: "request_release", command_id: randomUUID(), candidate_id: publishCopy.candidate_id,
    version_id: publishCopy.version_id, content_hash: publishCopy.content_hash };
  check("delivery preparation cannot create a release before all current approvals", () => assert.throws(() => invoke(reviewer, publishRequest), /editorial_reviews_pending/));
  for (const scope of ["editorial", "rights", "factual", "safety", "media", "publisher_acceptance"]) invoke(reviewer, { ...publishReview, command_id: randomUUID(), scope });
  const publishedRequest = invoke(reviewer, publishRequest);
  const workerCommand = { operation: "claim", actor_id: reviewer, command_id: publishRequest.command_id,
    release_request_id: publishedRequest.release_request_id, authorization_ref: "synthetic-delivery-authorization" };
  const workerSql = command => `begin;set local role service_role;select public.editorial_release_worker(${literal(command)});commit;`;
  const worker = command => JSON.parse(query(workerSql(command)).split("\n").at(-1));
  const workerConcurrent = command => new Promise((resolve, reject) => {
    const child = execFile("docker", ["--context", "desktop-linux", "exec", "-i", container, "psql", "-XqAt", "-v", "ON_ERROR_STOP=1", "-U", "review_owner", "-d", "review_qa"],
      { encoding: "utf8", timeout: 20000 }, (error, stdout, stderr) => error ? reject(new Error(stderr)) : resolve(JSON.parse(stdout.trim().split("\n").at(-1))));
    child.stdin.end(workerSql(command));
  });
  check("a forged or missing authenticated request cannot bootstrap delivery", () => {
    assert.throws(() => worker({ ...workerCommand, command_id: randomUUID() }), /release_command_unavailable/);
    assert.throws(() => worker({ ...workerCommand, actor_id: author }), /release_command_unavailable/);
  });
  check("database activation independently blocks an enabled server caller", () => assert.throws(() => worker(workerCommand), /delivery_not_activated/));
  query("update drishvara_editorial_private.delivery_controls set enabled=true,article_enabled=true,authorization_ref='synthetic-delivery-authorization'");
  check("readiness checks actual database authorization, assignment and per-kind switches without writing", () => {
    const readiness = ref => JSON.parse(query(`begin;set local role authenticated;select set_config('request.jwt.claim.sub','${reviewer}',true);select public.editorial_delivery_readiness('${publishCopy.candidate_id}','${ref}');commit;`).split("\n").at(-1));
    assert.equal(readiness("synthetic-delivery-authorization").delivery_enabled, true);
    assert.equal(readiness("wrong-reference").delivery_enabled, false);
    query("update drishvara_editorial_private.delivery_controls set article_enabled=false");
    assert.equal(readiness("synthetic-delivery-authorization").delivery_enabled, false);
    query("update drishvara_editorial_private.delivery_controls set article_enabled=true");
    assert.equal(query("select count(*) from drishvara_editorial_private.deliveries"), "0");
    assert.throws(() => query(`set role anon;select public.editorial_delivery_readiness('${publishCopy.candidate_id}','synthetic-delivery-authorization');`), /permission denied/);
  });
  check("wrong operational reference and caller approval fields cannot activate delivery", () => {
    assert.throws(() => worker({ ...workerCommand, authorization_ref: "forged" }), /delivery_not_activated/);
    assert.throws(() => worker({ ...workerCommand, approved: true }), /invalid_release_worker_command/);
  });
  const concurrentClaims = await Promise.all([workerConcurrent(workerCommand), workerConcurrent(workerCommand)]);
  let deliveryClaim = concurrentClaims.find(r => r.status === "claimed");
  check("real concurrent claim transactions admit exactly one worker", () => {
    assert.deepEqual(concurrentClaims.map(r => r.status).sort(), ["claimed", "delivery_in_progress"]);
    assert.equal(query("select count(*) from drishvara_editorial_private.delivery_events where operation='claim'"), "1");
  });
  check("real claim captures current immutable copy and effective decision references", () => {
    assert.equal(deliveryClaim.status, "claimed");
    assert.equal(deliveryClaim.version_id, publishCopy.version_id); assert.equal(deliveryClaim.content_hash, publishCopy.content_hash);
    assert.equal(deliveryClaim.decisions.length, 6); assert.equal(deliveryClaim.public_output_allowed, false);
  });
  check("second live claim is in-progress rather than a second delivery", () => assert.equal(worker(workerCommand).status, "delivery_in_progress"));
  const checkClaim = { ...workerCommand, operation: "check", claim_id: deliveryClaim.claim_id };
  check("claim check requires actual lease identity and authenticated request binding", () => {
    assert.equal(worker(checkClaim).status, "valid");
    assert.throws(() => worker({ ...checkClaim, claim_id: randomUUID() }), /invalid_release_claim/);
    assert.throws(() => worker({ ...checkClaim, actor_id: other }), /release_command_unavailable/);
  });
  check("revoked review authority stops an already claimed delivery", () => {
    query(`update drishvara_editorial_private.capabilities set revoked_at=now() where subject_id='${reviewer}' and kind='article' and scope='rights'`);
    assert.throws(() => worker(checkClaim), /editorial_reviews_pending/);
    query(`update drishvara_editorial_private.capabilities set revoked_at=null where subject_id='${reviewer}' and kind='article' and scope='rights'`);
  });
  check("new decision sequence invalidates an earlier delivery claim", () => {
    invoke(reviewer, { ...publishReview, command_id: randomUUID(), scope: "rights" });
    assert.throws(() => worker(checkClaim), /invalid_release_claim/);
  });
  check("failed claim creates an immutable event and permits controlled recovery", () => {
    assert.equal(worker({ ...checkClaim, operation: "fail", result: { code: "synthetic-retry-required" } }).status, "failed");
    deliveryClaim = worker(workerCommand); assert.notEqual(deliveryClaim.claim_id, checkClaim.claim_id);
  });
  const activeClaim = () => ({ ...workerCommand, operation: "check", claim_id: deliveryClaim.claim_id });
  check("expired lease cannot be completed or checked", () => {
    query("update drishvara_editorial_private.deliveries set lease_until=clock_timestamp()-interval '1 second'");
    assert.throws(() => worker(activeClaim()), /invalid_release_claim/);
    deliveryClaim = worker(workerCommand);
  });
  check("forged completion fields and arbitrary public paths are rejected", () => {
    for (const result of [{ status: "published", reference: "x" }, { status: "article_committed", reference: "a".repeat(40), path: "index.html" },
      { status: "article_committed", reference: "a".repeat(40), path: "articles/world/editorial-" + publishCopy.candidate_id + ".html", approved: true }])
      assert.throws(() => worker({ ...activeClaim(), operation: "complete", result }), /invalid_delivery_receipt/);
  });
  check("operational disable immediately prevents completion", () => {
    query("update drishvara_editorial_private.delivery_controls set enabled=false"); assert.throws(() => worker(activeClaim()), /delivery_not_activated/);
    query("update drishvara_editorial_private.delivery_controls set enabled=true");
  });
  check("synthetic delivery receipt does not claim public output or deployed readiness", () => {
    const r = worker({ ...activeClaim(), operation: "complete", result: { status: "article_committed", reference: "a".repeat(40), path: "articles/world/editorial-" + publishCopy.candidate_id + ".html" } });
    assert.equal(r.status, "delivery_completed"); assert.equal(r.public_output_allowed, false); assert.equal(r.runtime_activation, false);
  });
  check("completed request is idempotent without another delivery event", () => {
    const before = query("select count(*) from drishvara_editorial_private.delivery_events");
    assert.equal(worker(workerCommand).status, "delivery_completed"); assert.equal(query("select count(*) from drishvara_editorial_private.delivery_events"), before);
  });
  check("inactive requester cannot reuse a completed receipt", () => {
    query(`update public.profiles set is_active=false where id='${reviewer}'`); assert.throws(() => worker(workerCommand), /release_scope_denied/);
    query(`update public.profiles set is_active=true where id='${reviewer}'`);
  });
  check("delivery history rejects UPDATE, DELETE and TRUNCATE", () => {
    for (const sql of ["update drishvara_editorial_private.delivery_events set detail=detail", "delete from drishvara_editorial_private.delivery_events", "truncate drishvara_editorial_private.delivery_events"])
      assert.throws(() => query(sql), /immutable_editorial_history/);
  });
  check("new copy invalidates the prior delivery request even after completion", () => {
    invoke(author, { ...create, command_id: randomUUID(), external_id: "synthetic-delivery-copy", expected_version_id: publishCopy.version_id, title: "Synthetic new copy" });
    assert.throws(() => worker(workerCommand), /stale_editorial_version/);
  });
  check("delivery leaves Panchang and all direct private-table grants unchanged", () => {
    assert.equal(query("select value from public.synthetic_panchang where id='preserved'"), "unchanged");
    assert.equal(query("select count(*) from information_schema.role_table_grants where table_schema='drishvara_editorial_private' and grantee in ('PUBLIC','anon','authenticated','service_role')"), "0");
  });
  const deliveryWord = invoke(author, { ...wordIntake, command_id: randomUUID(), external_id: "synthetic-delivery-word" });
  assign(reviewer, deliveryWord.candidate_id);
  for (const scope of ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"])
    invoke(reviewer, { ...base, command_id: randomUUID(), candidate_id: deliveryWord.candidate_id, version_id: deliveryWord.version_id, content_hash: deliveryWord.content_hash, scope });
  const wordRequest = { action: "request_release", command_id: randomUUID(), candidate_id: deliveryWord.candidate_id, version_id: deliveryWord.version_id, content_hash: deliveryWord.content_hash };
  const queuedWord = invoke(reviewer, wordRequest);
  const wordWorker = { ...workerCommand, command_id: wordRequest.command_id, release_request_id: queuedWord.release_request_id };
  check("Word delivery has an independent default-disabled operational switch", () => assert.throws(() => worker(wordWorker), /delivery_not_activated/));
  query(`update drishvara_editorial_private.delivery_controls set word_enabled=true,word_record_refs=jsonb_build_object('${deliveryWord.candidate_id}','synthetic-registered-word@v1')`);
  const claimedWord = worker(wordWorker);
  check("Word worker returns only the operator-registered AG70E reference", () => {
    assert.equal(claimedWord.kind, "word"); assert.equal(claimedWord.word_record_ref, "synthetic-registered-word@v1"); assert.equal(claimedWord.decisions.length, 9);
  });
  check("Word receipt cannot invent a different registered identity or publication event", () => {
    for (const result of [{ status: "eligible_for_daily_selection", reference: "different@v1" }, { status: "published", reference: "synthetic-registered-word@v1" }])
      assert.throws(() => worker({ ...wordWorker, operation: "complete", claim_id: claimedWord.claim_id, result }), /invalid_delivery_receipt/);
  });
  check("Word delivery can attest bank eligibility only, never assign a festival date or publish a word", () => {
    const r = worker({ ...wordWorker, operation: "complete", claim_id: claimedWord.claim_id, result: { status: "eligible_for_daily_selection", reference: "synthetic-registered-word@v1" } });
    assert.equal(r.result.status, "eligible_for_daily_selection"); assert.equal(r.public_output_allowed, false);
    assert.equal(query("select count(*) from pg_tables where schemaname='public' and tablename like 'word%'"), "0");
  });
  console.log(`Editorial review: ${checks} real PostgreSQL security/transaction checks passed. Only synthetic records were used.`);
} finally {
  if (container) { docker("rm", "--force", "--volumes", container); assert.equal(docker("ps", "-aq", "--filter", "name=^/" + name + "$"), ""); console.log("Disposable editorial container and tmpfs test data removed."); }
}
