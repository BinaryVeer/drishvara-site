import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { execFileSync, execFile } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { syntheticWord, withSyntheticMeaning, syntheticSelection } from "./lib/ag70e-word-test-fixtures.mjs";
import { snapshotHash, validApprovedRecord, selectDailyWord, selectionAuthorityHashes } from "./lib/ag70d-word-selection-engine.mjs";
import { reviewedWordCopy } from "./lib/ag70e-word-publication-pipeline.mjs";
import { runWordDailyPublication } from "./lib/ag70e-word-server-workflow.mjs";
import { syntheticReviewImage } from "./lib/editorial-review-test-fixtures.mjs";

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
const actorSql = (actor, command, method = "editorial_review_command") => `begin; set local role authenticated; select set_config('request.jwt.claim.sub','${actor}',true); select public.${method}(${literal(command)}); commit;`;
const invoke = (actor, command) => JSON.parse(query(actorSql(actor, command)).split("\n").at(-1));
const invokeConcurrent = (actor, command, method = "editorial_review_command") => new Promise((resolve, reject) => {
  const child = execFile("docker", ["--context", "desktop-linux", "exec", "-i", container, "psql", "-XqAt", "-v", "ON_ERROR_STOP=1", "-U", "review_owner", "-d", "review_qa"], { encoding: "utf8", timeout: 20000 }, (error, stdout, stderr) => {
    if (error) reject(new Error(stderr)); else resolve(JSON.parse(stdout.trim().split("\n").at(-1)));
  });
  child.stdin.end(actorSql(actor, command, method));
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
  const decisionsBeforeSubject = query("select count(*) from drishvara_editorial_private.decisions");
  check("subject-review migration seeds no decisions or specialist credentials", () => {
    query(fs.readFileSync("supabase/migrations/20261029033849_editorial_admin_subject_reviews.sql", "utf8"));
    assert.equal(query("select count(*) from drishvara_editorial_private.decisions"), decisionsBeforeSubject);
    assert.equal(query(`select count(*) from drishvara_editorial_private.capabilities where subject_id='${owner}'`), "0");
  });
  query(`update drishvara_editorial_private.administrators set revoked_at=null where subject_id='${owner}'`);
  const adminWord = invoke(owner, { ...wordIntake, command_id: randomUUID(), external_id: "synthetic-subject-review-word" });
  const subject = { policy_ref: "drishvara-editorial-admin-subject-review@1", acknowledged: true, reason: "Synthetic publisher-authorized personal subject review; no credential claimed." };
  const subjectDecision = { ...base, command_id: randomUUID(), candidate_id: adminWord.candidate_id, version_id: adminWord.version_id, content_hash: adminWord.content_hash,
    scope: "linguistic", admin_exception: exception };
  check("Admin session exposes four subject responsibilities without a qualification reference", () => {
    const s = invoke(owner, { action: "session" }); assert.equal(s.subject_review_policy_ref, subject.policy_ref);
    for (const scope of ["linguistic", "iast", "textual", "philosophical"]) assert(s.capabilities.some(g => g.kind === "word" && g.scope === scope && g.qualification_ref === null));
    assert.deepEqual(invoke(owner, { action: "open", candidate_id: adminWord.candidate_id }).review_permissions.subject_review_exception_scopes, ["iast", "linguistic", "philosophical", "textual"]);
  });
  for (const scope of ["linguistic", "iast", "textual", "philosophical"]) check("Admin " + scope + " decision cannot omit explicit subject acknowledgment", () =>
    assert.throws(() => invoke(owner, { ...subjectDecision, scope, command_id: randomUUID() }), /explicit_admin_subject_review_required/));
  check("malformed, unacknowledged and unknown subject policies fail in SQL", () => {
    for (const e of [null, {}, { ...subject, acknowledged: false }, { ...subject, policy_ref: exception.policy_ref }, { ...subject, reason: " " }, { ...subject, qualification_verified: true }])
      assert.throws(() => invoke(owner, { ...subjectDecision, command_id: randomUUID(), subject_review_exception: e }), /explicit_admin_subject_review_required|null_editorial_field/);
  });
  check("subject acknowledgment cannot replace independent self-review consent", () => {
    const { admin_exception, ...withoutSelf } = subjectDecision;
    assert.throws(() => invoke(owner, { ...withoutSelf, subject_review_exception: subject }), /explicit_admin_self_review_required/);
  });
  const savedSubject = { ...subjectDecision, subject_review_exception: subject };
  check("Admin subject review binds actual actor, scope, exact copy and both policy reasons", () => {
    invoke(owner, savedSubject);
    const d = JSON.parse(query(`select row_to_json(d) from drishvara_editorial_private.decisions d where candidate_id='${adminWord.candidate_id}'`));
    assert.equal(d.actor_id, owner); assert.equal(d.scope, "linguistic"); assert.equal(d.content_hash, adminWord.content_hash); assert.equal(d.qualification_ref, null);
    assert.deepEqual(d.subject_review_exception, subject); assert.deepEqual(d.admin_exception, exception);
    assert.deepEqual(invoke(owner, { action: "open", candidate_id: adminWord.candidate_id }).review_state.approved_scopes, ["linguistic"]);
  });
  check("subject decision retry is idempotent and changed acknowledgment cannot overwrite it", () => {
    const before = query("select count(*) from drishvara_editorial_private.decisions"); invoke(owner, savedSubject);
    assert.equal(query("select count(*) from drishvara_editorial_private.decisions"), before);
    assert.throws(() => invoke(owner, { ...savedSubject, subject_review_exception: { ...subject, reason: "Synthetic changed review rationale." } }), /idempotency_conflict/);
  });
  check("Admin can record all four subjects but cannot release with other reviews pending", () => {
    for (const scope of ["iast", "textual", "philosophical"]) invoke(owner, { ...savedSubject, scope, command_id: randomUUID() });
    const s = invoke(owner, { action: "open", candidate_id: adminWord.candidate_id }).review_state;
    assert.equal(s.approved_scopes.length, 4); assert.equal(s.reviews_complete, false);
    assert.throws(() => invoke(owner, { ...wordRequest, candidate_id: adminWord.candidate_id, version_id: adminWord.version_id, content_hash: adminWord.content_hash, command_id: randomUUID() }), /editorial_reviews_pending/);
  });
  check("non-Admin cannot use subject exception and ordinary specialist grants remain guarded", () => {
    assert.throws(() => invoke(reviewer, { ...base, command_id: randomUUID(), candidate_id: deliveryWord.candidate_id, version_id: deliveryWord.version_id, content_hash: deliveryWord.content_hash, scope: "linguistic", subject_review_exception: subject }), /unexpected_subject_review_exception/);
    assert.throws(() => invoke(owner, { ...access, command_id: randomUUID(), kind: "word", scope: "linguistic" }), /verified_qualification_reference_required/);
  });
  check("subject exception is not accepted for unrelated Article or non-specialist scopes", () => {
    assert.throws(() => invoke(owner, { ...ownedDecision, command_id: randomUUID(), admin_exception: exception, subject_review_exception: subject }), /unexpected_subject_review_exception/);
  });
  check("revoked Admin immediately loses subject capabilities and effective approvals", () => {
    query(`update drishvara_editorial_private.administrators set revoked_at=now() where subject_id='${owner}'`);
    assert.equal(query(`select drishvara_editorial_private.review_state('${adminWord.candidate_id}','${adminWord.version_id}')->'approved_scopes'`), "[]");
    assert.throws(() => invoke(owner, { ...savedSubject, command_id: randomUUID() }), /editorial_capability_required/);
    query(`update drishvara_editorial_private.administrators set revoked_at=null where subject_id='${owner}'`);
  });
  check("subject-review audit is immutable and new copies require fresh decisions", () => {
    assert.throws(() => query("update drishvara_editorial_private.decisions set subject_review_exception=null"), /immutable_editorial_history/);
    const next = invoke(owner, { ...wordIntake, command_id: randomUUID(), external_id: "synthetic-subject-review-word", expected_version_id: adminWord.version_id });
    assert.deepEqual(invoke(owner, { action: "open", candidate_id: adminWord.candidate_id }).review_state.approved_scopes, []);
    assert.throws(() => invoke(owner, { ...savedSubject, command_id: randomUUID() }), /stale_editorial_version/); assert.notEqual(next.version_id, adminWord.version_id);
  });
  check("subject-review helper and private tables retain default-deny grants and Panchang", () => {
    assert.throws(() => query(`set role authenticated;select drishvara_editorial_private.admin_subject_scopes('${owner}','word');`), /permission denied/);
    assert.equal(query("select count(*) from information_schema.role_table_grants where table_schema='drishvara_editorial_private' and grantee in ('PUBLIC','anon','authenticated','service_role')"), "0");
    assert.equal(query("select value from public.synthetic_panchang where id='preserved'"), "unchanged");
  });
  check("Word registration migration applies without approving or activating any content", () => {
    for (const file of ["20261023_word_assignment_preparation.sql", "20261024010000_word_standing_policy_preparation.sql", "20261025000000_word_claim_conditional_etymology.sql", "20261025010000_word_meaning_copy_contract.sql", "20261029050519_editorial_word_registration.sql"])
      query(fs.readFileSync("supabase/migrations/" + file, "utf8"));
    assert.equal(query("select count(*) from drishvara_word_private.versioned_references"), "0");
    assert.equal(query("select persistence_enabled or publication_enabled from drishvara_word_private.controls"), "f");
  });
  const registrationInvoke = (actor, command) => JSON.parse(query(actorSql(actor, command).replace("public.editorial_review_command(", "public.editorial_word_registration(")).split("\n").at(-1));
  const registeredContent = withSyntheticMeaning(syntheticWord(9)).reviewed_publication_copy.content;
  const registerCopy = invoke(owner, { ...wordIntake, command_id: randomUUID(), external_id: "synthetic-register-word", payload: { ...wordIntake.payload, content: registeredContent } });
  const metadata = { canonical_lexical_identity_id: "synthetic:lexeme", lemma_id: "synthetic:lemma", equivalence_group_id: "synthetic:group", context_signal_id: "synthetic:context", no_etymological_claim: true };
  const preparation = { action: "prepare", command_id: randomUUID(), candidate_id: registerCopy.candidate_id, version_id: registerCopy.version_id, content_hash: registerCopy.content_hash,
    metadata, note: "Synthetic publisher-reviewed identity mapping only." };
  check("registration requires actual Admin rather than profile or caller authority", () => {
    assert.throws(() => registrationInvoke(reviewer, preparation), /workspace_administrator_required/);
    assert.throws(() => registrationInvoke(owner, { ...preparation, approved: true }), /invalid_word_registration/);
    assert.throws(() => query(`set role service_role;select public.editorial_word_registration(${literal(preparation)});`), /permission denied/);
    assert.throws(() => query(`set role anon;select public.editorial_word_registration(${literal(preparation)});`), /permission denied/);
  });
  check("registration cannot promote an unreviewed Word", () => assert.throws(() => registrationInvoke(owner, preparation), /editorial_reviews_pending/));
  check("registration readiness is authenticated and cannot read another account's unassigned Word", () => {
    assert.equal(JSON.parse(query(`begin;set local role authenticated;select set_config('request.jwt.claim.sub','${owner}',true);select public.editorial_word_registration_state('${registerCopy.candidate_id}');commit;`).split("\n").at(-1)).registered, false);
    assert.throws(() => query(`begin;set local role authenticated;select set_config('request.jwt.claim.sub','${other}',true);select public.editorial_word_registration_state('${registerCopy.candidate_id}');commit;`), /release_scope_denied/);
  });
  for (const scope of ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"])
    invoke(owner, { ...savedSubject, command_id: randomUUID(), candidate_id: registerCopy.candidate_id, version_id: registerCopy.version_id, content_hash: registerCopy.content_hash,
      scope, evidence_refs: ["synthetic-source", "synthetic-scripture", "synthetic-rights"], ...( ["linguistic", "iast", "textual", "philosophical"].includes(scope) ? { subject_review_exception: subject } : { subject_review_exception: undefined }) });
  let prepared;
  check("database constructs copy approvals from actual scoped decisions only", () => {
    prepared = registrationInvoke(owner, preparation);
    assert(validApprovedRecord(prepared.record)); assert(reviewedWordCopy(prepared.record.reviewed_publication_copy));
    assert.equal(prepared.record_hash, snapshotHash(prepared.record));
    assert.deepEqual(prepared.record.reviewed_publication_copy.content, registeredContent);
    assert.equal(prepared.record.reviewed_publication_copy.reviews.length, 7);
    assert.equal(query("select count(*) from drishvara_word_private.versioned_references"), "0");
  });
  const registration = { ...preparation, action: "register", expected_record_hash: prepared.record_hash };
  check("missing registered minimum policy rolls back every source and approval insert", () => {
    assert.throws(() => registrationInvoke(owner, registration), /word_registration_copy_unapproved/);
    assert.equal(query("select count(*) from drishvara_word_private.versioned_references"), "0");
  });
  const minimumPolicy = JSON.parse(fs.readFileSync("data/knowledge-base/word-of-day/production/methodology/ag70d-word-release-configuration.json", "utf8")).minimum_publication_contract_amendment;
  query(`insert into drishvara_word_private.versioned_references(ref_id,kind,version,payload,review_status,reviewer_id,approval_ref) values('drishvara-word-minimum-policy@2','approval','2',${literal(minimumPolicy)},'approved','synthetic-publisher','synthetic-policy-registration');`);
  check("wrong prepared hash cannot change registered content", () => assert.throws(() => registrationInvoke(owner, { ...registration, expected_record_hash: "wrong" }), /word_registration_changed/));
  check("actual scoped approvals register one immutable record without daily activation", () => {
    const r = registrationInvoke(owner, registration); assert.equal(r.status, "approved_bank_registered"); assert.equal(r.public_output_allowed, false);
    assert.equal(query("select count(*) from drishvara_word_private.versioned_references where kind='candidate'"), "1");
    assert.equal(query("select persistence_enabled or publication_enabled from drishvara_word_private.controls"), "f");
    assert.equal(query(`select word_record_refs->>'${registerCopy.candidate_id}' from drishvara_editorial_private.delivery_controls`), r.candidate_ref);
  });
  check("registration retry preserves one immutable administration event", () => {
    const count = query("select count(*) from drishvara_editorial_private.administration_events where action='register_word'"); registrationInvoke(owner, registration);
    assert.equal(query("select count(*) from drishvara_editorial_private.administration_events where action='register_word'"), count);
    assert.throws(() => registrationInvoke(owner, { ...registration, note: "Synthetic changed immutable decision basis." }), /idempotency_conflict/);
  });
  const parallelRegistrations = await Promise.all([invokeConcurrent(owner, registration, "editorial_word_registration"), invokeConcurrent(owner, registration, "editorial_word_registration")]);
  check("concurrent registration retries preserve the same record and one audit event", () => {
    assert.deepEqual(parallelRegistrations[0], parallelRegistrations[1]);
    assert.equal(query(`select count(*) from drishvara_editorial_private.administration_events where id='${registration.command_id}'`), "1");
  });
  for (const scenario of ["pending_source", "missing_rights_clearance"]) {
    const content = structuredClone(registeredContent); if (scenario === "pending_source") content.sources[0].review_status = "pending";
    const copy = invoke(owner, { ...wordIntake, command_id: randomUUID(), external_id: "synthetic-registration-" + scenario, payload: { ...wordIntake.payload, content } });
    for (const scope of ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical", "publisher_acceptance"])
      invoke(owner, { ...savedSubject, command_id: randomUUID(), candidate_id: copy.candidate_id, version_id: copy.version_id, content_hash: copy.content_hash,
        scope, evidence_refs: scenario === "missing_rights_clearance" ? ["synthetic-source", "synthetic-scripture"] : ["synthetic-source", "synthetic-scripture", "synthetic-rights"],
        subject_review_exception: ["linguistic", "iast", "textual", "philosophical"].includes(scope) ? subject : undefined });
    check("completed review flags do not bypass " + scenario, () => {
      const before = query("select count(*) from drishvara_word_private.versioned_references");
      assert.throws(() => registrationInvoke(owner, { ...preparation, command_id: randomUUID(), candidate_id: copy.candidate_id, version_id: copy.version_id, content_hash: copy.content_hash }), /word_registration_sources_pending/);
      assert.equal(query("select count(*) from drishvara_word_private.versioned_references"), before);
    });
  }
  const candidateRef = prepared.record.output_candidate_id + "@" + prepared.record.approved_record_version;
  check("service-only registered read validates bank eligibility without activating a workflow", () => {
    const r = JSON.parse(query(`set role service_role;select public.editorial_registered_word('${candidateRef}');`)); assert.equal(snapshotHash(r), prepared.record_hash);
    assert.throws(() => query(`set role authenticated;select public.editorial_registered_word('${candidateRef}');`), /permission denied/);
  });
  const timestamp = new Date().toISOString(), date = query("select to_char(now() at time zone 'Asia/Kolkata','YYYY-MM-DD')");
  const dailyInput = syntheticSelection(1, date), record = prepared.record;
  dailyInput.bank.records = [record]; dailyInput.context.eligible_candidate_refs = [candidateRef]; dailyInput.precedence.candidate_order = [candidateRef];
  dailyInput.identity_map.links = [{ candidate_ref: candidateRef, canonical_lexical_identity_id: record.canonical_lexical_identity_id,
    lemma_id: record.lemma_id, equivalence_group_id: record.equivalence_group_id, representative_candidate_ref: candidateRef,
    review_status: "approved", approval_ref: "synthetic-operational-approval" }];
  const releaseConfig = JSON.parse(fs.readFileSync("data/knowledge-base/word-of-day/production/methodology/ag70d-word-release-configuration.json", "utf8"));
  const dailyPolicy = releaseConfig.publisher_policy;
  releaseConfig.runtime_activation = true; releaseConfig.public_output_allowed = true;
  releaseConfig.persistence.enabled = true; releaseConfig.persistence.server_authorization_ref = "synthetic-registration-server";
  releaseConfig.publication = { review_status: "approved", approval_ref: "synthetic-operational-approval", public_output_allowed: true, runtime_activation: true };
  releaseConfig.standing_authorization = { enabled: true, policy_ref: dailyPolicy.record_ref, production_approval_ref: "synthetic-operational-approval" };
  const deployment = { version: "synthetic-registration-v1", configuration: releaseConfig, policy: dailyInput.policy,
    authorization_ref: "synthetic-registration-server", context_refs: { [date]: dailyInput.context.basis_ref }, precedence_ref: dailyInput.precedence.rule_ref,
    exclusions_ref: "synthetic-registration-exclusions", candidate_refs: [candidateRef] };
  const put = (ref, kind, payload) => query(`insert into drishvara_word_private.versioned_references(ref_id,kind,version,payload,review_status,reviewer_id,approval_ref)
    values('${ref}','${kind}','${payload.version ?? "1"}',${literal(payload)},'approved','synthetic-publisher','${payload.approval_ref ?? "synthetic-operational-approval"}');`);
  for (const [ref, kind, payload] of [[dailyPolicy.record_ref, "approval", dailyPolicy], ["synthetic-operational-approval", "approval", { synthetic_only: true }],
    [dailyInput.context.basis_ref, "context", dailyInput.context], [dailyInput.precedence.rule_ref, "precedence", dailyInput.precedence],
    [dailyInput.identity_map.snapshot_ref, "identity", dailyInput.identity_map], ["synthetic-registration-exclusions", "exclusions", dailyInput.exclusions],
    ["synthetic-registration-server", "authorization", { actor_ref: "synthetic-server", capabilities: ["selection_proposal", "reservation", "authorized_assignment", "publication"] }],
    ["synthetic-registration-deployment", "deployment", deployment]]) put(ref, kind, payload);
  check("daily context and identity use the existing engine's exact authority hashes", () => {
    const hashes = selectionAuthorityHashes(dailyInput);
    assert.equal(query(`select payload_hash from drishvara_word_private.versioned_references where ref_id='${dailyInput.context.basis_ref}'`), hashes.context_content_hash);
    assert.equal(query(`select payload_hash from drishvara_word_private.versioned_references where ref_id='${dailyInput.identity_map.snapshot_ref}'`), hashes.identity_content_hash);
  });
  query(`update drishvara_word_private.controls set persistence_enabled=true,publication_enabled=true,identity_snapshot_ref='${dailyInput.identity_map.snapshot_ref}',deployment_approval_ref='synthetic-registration-deployment'`);
  const dailyRpc = async (method, parameters) => {
    const argumentsSql = Object.values(parameters).map(v => typeof v === "string" ? "'" + v.replaceAll("'", "''") + "'" : literal(v)).join(",");
    try { return { data: JSON.parse(query(`set role service_role;select coalesce(to_jsonb(public.${method}(${argumentsSql})),'null'::jsonb);`)) }; }
    catch (error) { if (process.env.WORD_REGISTRATION_QA_DEBUG === "1") console.error("Synthetic daily RPC " + method + ": " + error.message); return { error: { message: "synthetic-local-database-rejection" } }; }
  };
  const run = await runWordDailyPublication({ rpc: dailyRpc, timestamp, enabled: true });
  check("registered synthetic copy passes the real unchanged AG70E daily publication lifecycle", () => {
    assert.equal(run.status, "completed", JSON.stringify(run));
    const output = JSON.parse(query(`set role service_role;select public.word_assignment_release_snapshot('${date}');`));
    assert.equal(output.history.events.at(-1).event_type, "publication");
    assert.equal(output.release.public_output_allowed, true);
  });
  const eventsAfterPublication = query("select count(*) from drishvara_word_private.events");
  const replay = await runWordDailyPublication({ rpc: dailyRpc, timestamp, enabled: true });
  check("real daily replay is idempotent with no second publication", () => {
    assert.equal(replay.status, "completed"); assert.equal(query("select count(*) from drishvara_word_private.events"), eventsAfterPublication);
  });
  check("role revocation invalidates the registered record and linked source authorities", () => {
    query(`update drishvara_editorial_private.administrators set revoked_at=now() where subject_id='${owner}'`);
    assert.throws(() => query(`select public.editorial_registered_word('${candidateRef}');`), /word_editorial_approval_changed/);
    assert.throws(() => query("select drishvara_word_private.require_reference('synthetic-source','source');"), /word_editorial_approval_changed/);
    query(`update drishvara_editorial_private.administrators set revoked_at=null where subject_id='${owner}'`);
  });
  check("a later revision decision invalidates the registered copy without altering history", () => {
    invoke(owner, { ...savedSubject, command_id: randomUUID(), candidate_id: registerCopy.candidate_id, version_id: registerCopy.version_id, content_hash: registerCopy.content_hash,
      scope: "linguistic", decision: "revise", subject_review_exception: subject });
    assert.throws(() => query(`select public.editorial_registered_word('${candidateRef}');`), /word_editorial_approval_changed/);
    assert.equal(query("select count(*) from drishvara_word_private.versioned_references where kind='candidate'"), "1");
    assert.equal(query("select count(*) from drishvara_word_private.events"), eventsAfterPublication);
    assert.throws(() => query(`select public.word_assignment_release_snapshot('${date}');`), /word_editorial_approval_changed/);
  });
  check("registration leaves all existing Panchang data and client grants untouched", () => {
    assert.equal(query("select value from public.synthetic_panchang where id='preserved'"), "unchanged");
    assert.equal(query("select count(*) from information_schema.role_table_grants where table_schema in ('drishvara_editorial_private','drishvara_word_private') and grantee in ('PUBLIC','anon','authenticated','service_role')"), "0");
  });
  const decisionCount = query("select count(*) from drishvara_editorial_private.decisions");
  check("consolidated migration preserves decisions and grants without approving content", () => {
    query(fs.readFileSync("supabase/migrations/20261029053348_editorial_consolidated_review.sql", "utf8"));
    assert.equal(query("select count(*) from drishvara_editorial_private.decisions"), decisionCount);
  });
  const consolidated = invoke(owner, { ...create, command_id: randomUUID(), external_id: "synthetic-consolidated-review" });
  const batch = { action: "review_batch", command_id: randomUUID(), candidate_id: consolidated.candidate_id,
    version_id: consolidated.version_id, content_hash: consolidated.content_hash, scopes: ["editorial", "safety"],
    decision: "approve", note: "Synthetic single checklist review", evidence_refs: ["synthetic-copy-evidence"], admin_exception: exception };
  let grouped;
  check("one checklist atomically records its actual actor and selected aspects", () => {
    grouped = invoke(owner, batch); assert.equal(grouped.decision_ids.length, 2);
    assert.deepEqual(grouped.review_state.approved_scopes, ["editorial", "safety"]); assert.equal(grouped.public_output_allowed, false);
    assert.equal(query(`select count(*) from drishvara_editorial_private.decisions where candidate_id='${consolidated.candidate_id}' and actor_id='${owner}' and content_hash='${consolidated.content_hash}'`), "2");
  });
  check("checklist replay is idempotent and cannot mutate evidence", () => {
    assert.deepEqual(invoke(owner, batch), grouped);
    assert.throws(() => invoke(owner, { ...batch, evidence_refs: ["changed"] }), /idempotency_conflict/);
  });
  const concurrentBatch = { ...batch, command_id: randomUUID(), scopes: ["rights", "factual"] };
  const concurrentBatches = await Promise.all([invokeConcurrent(owner, concurrentBatch), invokeConcurrent(owner, concurrentBatch)]);
  check("concurrent checklist retries produce one set of decisions", () => {
    assert.deepEqual(concurrentBatches[0], concurrentBatches[1]);
    assert.equal(query(`select count(*) from drishvara_editorial_private.decisions where candidate_id='${consolidated.candidate_id}'`), "4");
  });
  check("empty, duplicate, malformed and publisher-acceptance checklists are rejected in SQL", () => {
    for (const scopes of [[], ["editorial", "editorial"], [null], ["publisher_acceptance"]])
      assert.throws(() => invoke(owner, { ...batch, command_id: randomUUID(), scopes }), /invalid_review_checklist/);
  });
  check("a later unauthorized checklist aspect rolls back earlier decisions", () => {
    const before = query("select count(*) from drishvara_editorial_private.decisions");
    assert.throws(() => invoke(owner, { ...batch, command_id: randomUUID(), scopes: ["editorial", "zz_unknown"] }), /invalid_editorial_decision/);
    assert.equal(query("select count(*) from drishvara_editorial_private.decisions"), before);
  });
  check("forged fields and missing evidence cannot bypass batch checks", () => {
    assert.throws(() => invoke(owner, { ...batch, command_id: randomUUID(), actor_id: reviewer }), /invalid_review_checklist/);
    assert.throws(() => invoke(owner, { ...batch, command_id: randomUUID(), evidence_refs: [] }), /invalid_editorial_decision/);
  });
  check("checklist retains self-review and distinct Admin subject acknowledgments", () => {
    const { admin_exception, ...withoutSelf } = batch;
    assert.throws(() => invoke(owner, { ...withoutSelf, command_id: randomUUID() }), /explicit_admin_self_review_required/);
    const wordBatch = { ...batch, command_id: randomUUID(), candidate_id: adminWord.candidate_id, version_id: adminWord.version_id, content_hash: adminWord.content_hash, scopes: ["linguistic", "iast"] };
    // Use the actual current version from the earlier immutable revision fixture.
    const current = invoke(owner, { action: "open", candidate_id: adminWord.candidate_id });
    Object.assign(wordBatch, { version_id: current.version.id, content_hash: current.version.content_hash });
    assert.throws(() => invoke(owner, wordBatch), /explicit_admin_subject_review_required/);
    const result = invoke(owner, { ...wordBatch, subject_review_exception: subject }); assert.equal(result.decision_ids.length, 2);
  });
  check("missing assignments and revoked roles still block consolidated review", () => {
    assert.throws(() => invoke(other, { ...batch, command_id: randomUUID() }), /editorial_assignment_required/);
    query(`update drishvara_editorial_private.administrators set revoked_at=now() where subject_id='${owner}'`);
    assert.throws(() => invoke(owner, { ...batch, command_id: randomUUID() }), /editorial_assignment_required|editorial_capability_required/);
    query(`update drishvara_editorial_private.administrators set revoked_at=null where subject_id='${owner}'`);
  });
  const fullWord = invoke(owner, { ...wordIntake, command_id: randomUUID(), external_id: "synthetic-full-checklist" });
  check("one Word checklist records all eight human aspects but not publisher acceptance", () => {
    const result = invoke(owner, { ...batch, command_id: randomUUID(), candidate_id: fullWord.candidate_id, version_id: fullWord.version_id,
      content_hash: fullWord.content_hash, scopes: ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical"], subject_review_exception: subject });
    assert.equal(result.decision_ids.length, 8); assert.equal(result.review_state.reviews_complete, false);
    assert(!result.review_state.approved_scopes.includes("publisher_acceptance"));
    assert.throws(() => invoke(owner, { ...release, command_id: randomUUID(), candidate_id: fullWord.candidate_id, version_id: fullWord.version_id, content_hash: fullWord.content_hash }), /editorial_reviews_pending/);
  });
  assign(reviewer, consolidated.candidate_id);
  const correction = { ...create, command_id: randomUUID(), external_id: "synthetic-consolidated-review", expected_version_id: consolidated.version_id,
    payload: { ...create.payload, body: "Synthetic corrected complete article" } };
  let corrected;
  check("assigned reviewer or publisher can correct an existing copy without new-intake authority", () => {
    assert.equal(invoke(reviewer, { action: "open", candidate_id: consolidated.candidate_id }).can_edit, true);
    corrected = invoke(reviewer, correction); assert.notEqual(corrected.content_hash, consolidated.content_hash);
    assert.deepEqual(invoke(reviewer, { action: "open", candidate_id: consolidated.candidate_id }).review_state.approved_scopes, []);
  });
  check("correction preserves old decisions but cannot create new candidates or self-approve", () => {
    assert.equal(query(`select count(*) from drishvara_editorial_private.decisions where candidate_id='${consolidated.candidate_id}'`), "4");
    assert.throws(() => invoke(reviewer, { ...correction, command_id: randomUUID(), external_id: "unassigned-new", expected_version_id: null }), /editorial_intake_denied/);
    const { admin_exception, ...independent } = batch;
    assert.throws(() => invoke(reviewer, { ...independent, command_id: randomUUID(), version_id: corrected.version_id, content_hash: corrected.content_hash, scopes: ["editorial"] }), /self_review_denied/);
  });
  check("stale copy and unassigned corrections cannot reuse an approval", () => {
    assert.throws(() => invoke(owner, { ...batch, command_id: randomUUID() }), /stale_editorial_version/);
    assert.throws(() => invoke(other, { ...correction, command_id: randomUUID(), expected_version_id: corrected.version_id }), /editorial_intake_denied/);
  });
  const publisherOnly = randomUUID();
  query(`insert into auth.users(id,email,email_confirmed_at) values('${publisherOnly}','synthetic-publisher-only@example.invalid',now());
    insert into public.profiles values('${publisherOnly}','subscriber',true);`);
  grant(publisherOnly, "article", "release"); assign(publisherOnly, consolidated.candidate_id);
  check("publisher-only access permits correction but does not grant review or intake privileges", () => {
    const opened = invoke(publisherOnly, { action: "open", candidate_id: consolidated.candidate_id }); assert.equal(opened.can_edit, true);
    const result = invoke(publisherOnly, { ...correction, command_id: randomUUID(), expected_version_id: corrected.version_id, title: "Synthetic publisher revision" });
    assert.equal(result.status, "pending_review");
    assert.deepEqual(invoke(publisherOnly, { action: "open", candidate_id: consolidated.candidate_id }).review_state.approved_scopes, []);
    assert.throws(() => invoke(publisherOnly, { ...create, command_id: randomUUID(), external_id: "publisher-new-intake" }), /editorial_intake_denied/);
    assert.throws(() => invoke(publisherOnly, { ...batch, command_id: randomUUID(), version_id: result.version_id, content_hash: result.content_hash }), /self_review_denied/);
  });
  const raster = syntheticReviewImage();
  check("private PNG upload is accepted only as a pending immutable Article copy", () => {
    const result = invoke(owner, { ...create, command_id: randomUUID(), external_id: "synthetic-image-copy", payload: { ...create.payload, media: [raster] } });
    assert.equal(result.status, "pending_review"); assert.equal(result.runtime_activation, false);
    assert.equal(invoke(owner, { action: "open", candidate_id: result.candidate_id }).version.payload.media[0].upload_png, raster.upload_png);
  });
  check("direct RPC rejects forged image destinations, malformed PNG, aspect and size", () => {
    for (const m of [{ ...raster, url: "/index.html" }, { ...raster, upload_png: "AAAA" }, syntheticReviewImage(320, 320), { ...raster, upload_png: "A".repeat(150000) }])
      assert.throws(() => invoke(owner, { ...create, command_id: randomUUID(), external_id: "bad-image", payload: { ...create.payload, media: [m] } }), /invalid_editorial_image/);
  });
  check("private legacy implementation is not a browser-accessible bypass", () => {
    assert.throws(() => query(`set role authenticated;select drishvara_editorial_private.review_command_v1('{"action":"list"}');`), /permission denied/);
    assert.throws(() => query(`set role anon;select public.editorial_review_command('{"action":"review_batch"}');`), /permission denied/);
    assert.equal(query("select count(*) from information_schema.role_table_grants where table_schema in ('drishvara_editorial_private','drishvara_word_private') and grantee in ('PUBLIC','anon','authenticated','service_role')"), "0");
    assert.equal(query("select value from public.synthetic_panchang where id='preserved'"), "unchanged");
  });
  console.log(`Editorial review: ${checks} real PostgreSQL security/transaction checks passed. Only synthetic records were used.`);
} finally {
  if (container) { docker("rm", "--force", "--volumes", container); assert.equal(docker("ps", "-aq", "--filter", "name=^/" + name + "$"), ""); console.log("Disposable editorial container and tmpfs test data removed."); }
}
