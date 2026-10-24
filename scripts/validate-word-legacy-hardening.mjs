import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

// Real PostgreSQL, isolated synthetic tables only. No database URL or credential input.
const image = "postgres@sha256:eee6c6e1b0894fa4fe0075eb054af9fd1cf39a35321c2d4110626cfe506411fb";
const name = "drishvara-word-hardening-" + process.pid + "-" + Date.now();
const migration = fs.readFileSync("supabase/migrations/20261024000000_word_legacy_privilege_hardening.sql", "utf8");
const targets = ["word_corpus", "word_of_day_rotation_rules"];
const unsafe = ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER", "MAINTAIN"];
const docker = (...args) => execFileSync("docker", ["--context", "desktop-linux", ...args], {
  encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 60000, maxBuffer: 8e6
});
let container = null, checks = 0;
function query(sql, role = null) {
  return execFileSync("docker", ["--context", "desktop-linux", "exec", "-i", container,
    "psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-U", "word_owner", "-d", "word_security_qa"], {
    input: "\\set VERBOSITY verbose\n" + (role ? "set role " + role + ";\n" : "") + sql,
    encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 15000, maxBuffer: 8e6
  }).trim();
}
const json = sql => JSON.parse(query(sql));
function denied(sql, role, pattern = /42501|permission denied/) { assert.throws(() => query(sql, role), pattern); }
function check(label, run) { run(); checks++; console.log("PASS real PostgreSQL hardening: " + label); }
const policySnapshot = () => json("select coalesce(jsonb_agg(to_jsonb(p) order by p.tablename,p.policyname),'[]'::jsonb) from pg_catalog.pg_policies p where schemaname='public';");
const aclSnapshot = () => json("select jsonb_agg(jsonb_build_object('table',c.relname,'acl',c.relacl::text,'owner',c.relowner,'rls',c.relrowsecurity,'force',c.relforcerowsecurity,'column',a.attname,'column_acl',a.attacl::text) order by c.relname,a.attnum) from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace join pg_catalog.pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped where n.nspname='public' and c.relname in ('word_corpus','word_of_day_rotation_rules');");
const serverRights = () => json("select jsonb_agg(jsonb_build_object('table',c.relname,'privilege',p,'allowed',has_table_privilege('service_role',c.oid,p)) order by c.relname,p) from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) as privileges(p) where n.nspname='public' and c.relname in ('word_corpus','word_of_day_rotation_rules');");
const assignmentSnapshot = () => json("select jsonb_build_object('controls',(select to_jsonb(c) from drishvara_word_private.controls c),'tables',(select jsonb_agg(jsonb_build_object('name',c.relname,'acl',c.relacl::text,'rls',c.relrowsecurity) order by c.relname) from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='drishvara_word_private' and c.relkind='r'),'rpcs',(select jsonb_agg(jsonb_build_object('name',p.proname,'acl',p.proacl::text,'definition',pg_catalog.pg_get_functiondef(p.oid)) order by p.proname) from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'word_assignment_%'));");

try {
  docker("image", "inspect", image);
  container = docker("run", "--detach", "--pull=never", "--name", name,
    "--label", "drishvara.word.hardening.qa=disposable", "--network", "none", "--read-only",
    "--cap-drop=ALL", "--security-opt", "no-new-privileges", "--user", "postgres", "--memory", "512m", "--cpus", "1",
    "--tmpfs", "/tmp", "--tmpfs", "/var/run/postgresql:rw,mode=1777", "--tmpfs", "/var/lib/postgresql/data:rw,mode=1777",
    "-e", "PGDATA=/var/lib/postgresql/data/pgdata", "-e", "POSTGRES_USER=word_owner", "-e", "POSTGRES_DB=word_security_qa",
    "-e", "POSTGRES_HOST_AUTH_METHOD=trust", image).trim();
  assert.match(container, /^[a-f0-9]{64}$/);
  let ready = false;
  for (let n = 0; n < 200; n++) {
    try {
      // The image's temporary initialization server can answer pg_isready before restart.
      if (docker("exec", container, "cat", "/proc/1/comm").trim() === "postgres" && query("select 1;") === "1") {
        ready = true; break;
      }
    } catch { /* Wait for the final server, not the initialization socket. */ }
    await delay(100);
  }
  assert(ready, "isolated PostgreSQL became ready");
  check("container has no network, ports, persistent volumes or privileges", () => {
    const info = JSON.parse(docker("inspect", container))[0];
    assert.equal(info.HostConfig.NetworkMode, "none"); assert.equal(info.HostConfig.Privileged, false);
    assert.equal(info.HostConfig.ReadonlyRootfs, true); assert.equal(info.Config.User, "postgres");
    assert(info.HostConfig.CapDrop.includes("ALL")); assert(info.HostConfig.SecurityOpt.includes("no-new-privileges"));
    assert.equal(Object.keys(info.HostConfig.PortBindings ?? {}).length, 0);
    assert(info.Mounts.every(mount => mount.Type === "tmpfs"));
  });
  const version = query("select version();"); console.log("Isolated server: " + version);
  assert(query("show server_version;").startsWith("17."));
  query(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    grant usage on schema public to anon,authenticated,service_role;
    create table public.word_corpus(word_id text primary key,private_note text,"quoted-column" text);
    create table public.word_of_day_rotation_rules(rule_id text primary key,word_id text references public.word_corpus(word_id),private_note text);
    insert into public.word_corpus values('synthetic-only-word','synthetic-private-note','synthetic');
    insert into public.word_of_day_rotation_rules values('synthetic-only-rule','synthetic-only-word','synthetic-private-note');
    alter table public.word_corpus enable row level security;
    alter table public.word_of_day_rotation_rules enable row level security;
    grant all on public.word_corpus,public.word_of_day_rotation_rules to anon,authenticated,service_role;
    grant insert,update,references on public.word_corpus,public.word_of_day_rotation_rules to public;
    grant update(private_note),insert(private_note),references(private_note) on public.word_corpus,public.word_of_day_rotation_rules to anon,authenticated,public;
    create table public.drishvara_panchang_locations(id text primary key,payload text);
    insert into public.drishvara_panchang_locations values('synthetic-panchang','synthetic-unrelated');
    grant all on public.drishvara_panchang_locations to anon,authenticated,service_role;
    create schema synthetic_client;
    grant usage,create on schema synthetic_client to anon,authenticated;
    create function public.synthetic_word_trigger() returns trigger language plpgsql as $$begin return new;end$$;`);
  query(fs.readFileSync("supabase/migrations/20261023_word_assignment_preparation.sql", "utf8"));
  const assignment = assignmentSnapshot();
  check("RLS default deny is independent of unsafe preexisting grants", () => {
    assert.equal(query("select count(*) from public.word_corpus;", "anon"), "0");
    assert.equal(query("select has_table_privilege('anon','public.word_corpus','TRUNCATE');"), "t");
    query("begin;set local role anon;truncate public.word_of_day_rotation_rules;rollback;");
    query("begin;set local role anon;create table synthetic_client.synthetic_fk_probe(word_id text references public.word_corpus(word_id));rollback;");
    assert.equal(query("select count(*) from public.word_of_day_rotation_rules;"), "1");
  });
  // Permissive synthetic policies prove that subsequent denials come from ACLs, not RLS.
  for (const table of targets) query(`create policy synthetic_permissive on public.${table} for all to public using(true) with check(true);`);
  const policies = policySnapshot(), server = serverRights();
  const ownerId = query("select oid from pg_catalog.pg_roles where rolname='word_owner';");
  const unrelated = query("select row_to_json(t)::text||':'||(select relacl::text from pg_catalog.pg_class where oid='public.drishvara_panchang_locations'::regclass) from public.drishvara_panchang_locations t;");
  const rows = targets.map(table => query(`select jsonb_agg(to_jsonb(t)) from public.${table} t;`));
  check("migration compiles and applies only in the isolated database", () => query(migration));
  check("policies, RLS flags, owners and content are preserved", () => {
    assert.deepEqual(policySnapshot(), policies);
    assert(aclSnapshot().every(row => row.rls === true && row.force === false));
    assert(aclSnapshot().every(row => String(row.owner) === ownerId));
    assert.deepEqual(targets.map(table => query(`select jsonb_agg(to_jsonb(t)) from public.${table} t;`)), rows);
  });
  for (const role of ["anon", "authenticated"]) {
    check(role + " has no effective unsafe table or column privileges", () => {
      assert.equal(query(`select has_schema_privilege('${role}','synthetic_client','CREATE');`), "t");
      for (const table of targets) {
        for (const privilege of unsafe) assert.equal(query(`select has_table_privilege('${role}','public.${table}','${privilege}');`), "f");
        assert.equal(query(`select bool_or(has_column_privilege('${role}',a.attrelid,a.attnum,p)) from pg_catalog.pg_attribute a cross join unnest(array['INSERT','UPDATE','REFERENCES']) as privileges(p) where a.attrelid='public.${table}'::regclass and a.attnum>0 and not a.attisdropped;`), "f");
        assert.equal(query(`select count(*) from public.${table};`, role), "1");
      }
    });
    for (const [label, sql] of [
      ["INSERT", "insert into public.word_corpus(word_id) values('synthetic-browser-write');"],
      ["UPDATE", "update public.word_corpus set private_note='synthetic-browser-write';"],
      ["DELETE", "delete from public.word_of_day_rotation_rules;"],
      ["TRUNCATE", "truncate public.word_of_day_rotation_rules;"],
      ["TRIGGER", "create trigger synthetic_unauthorized before insert on public.word_corpus for each row execute function public.synthetic_word_trigger();"],
      ["REFERENCES", "create table synthetic_client.synthetic_unauthorized_fk(word_id text references public.word_corpus(word_id));"],
      ["MAINTAIN", "lock table public.word_corpus in access exclusive mode;"]
    ]) check(role + " actual " + label + " attempt is denied", () => denied("begin;" + sql + "rollback;", role));
  }
  check("PUBLIC table/column write grants are removed without granting new reads", () => {
    assert.equal(query("select count(*) from pg_catalog.pg_class c cross join lateral pg_catalog.aclexplode(c.relacl) a where c.oid in ('public.word_corpus'::regclass,'public.word_of_day_rotation_rules'::regclass) and a.grantee=0 and a.privilege_type<>'SELECT';"), "0");
    assert.equal(query("select count(*) from pg_catalog.pg_attribute c cross join lateral pg_catalog.aclexplode(c.attacl) a where c.attrelid in ('public.word_corpus'::regclass,'public.word_of_day_rotation_rules'::regclass) and a.grantee=0 and a.privilege_type<>'SELECT';"), "0");
  });
  check("service-role privileges and real CRUD remain intact", () => {
    assert.deepEqual(serverRights(), server);
    query("begin;insert into public.word_corpus(word_id) values('synthetic-server-write');update public.word_corpus set private_note='synthetic-server-write';delete from public.word_of_day_rotation_rules;rollback;", "service_role");
    assert.deepEqual(targets.map(table => query(`select jsonb_agg(to_jsonb(t)) from public.${table} t;`)), rows);
  });
  check("unrelated Panchang table and grants remain byte-identical", () => {
    assert.equal(query("select row_to_json(t)::text||':'||(select relacl::text from pg_catalog.pg_class where oid='public.drishvara_panchang_locations'::regclass) from public.drishvara_panchang_locations t;"), unrelated);
  });
  check("prepared assignment tables, six RPCs and disabled controls coexist unchanged", () => {
    assert.equal(assignment.tables.length, 9); assert.equal(assignment.rpcs.length, 6);
    assert.equal(assignment.controls.persistence_enabled, false); assert.equal(assignment.controls.publication_enabled, false);
    assert.deepEqual(assignmentSnapshot(), assignment);
  });
  check("second application is idempotent", () => {
    const before = aclSnapshot(); query(migration); assert.deepEqual(aclSnapshot(), before); assert.deepEqual(policySnapshot(), policies);
  });
  check("inherited unsafe grants fail closed and roll back the whole migration", () => {
    query("grant insert on public.word_corpus to public;create role synthetic_inherited_writer nologin;grant update on public.word_of_day_rotation_rules to synthetic_inherited_writer;grant synthetic_inherited_writer to anon;");
    const before = aclSnapshot();
    denied(migration, null, /word_hardening_remaining_privilege/); assert.deepEqual(aclSnapshot(), before);
    query("revoke synthetic_inherited_writer from anon;drop owned by synthetic_inherited_writer;drop role synthetic_inherited_writer;"); query(migration);
  });
  check("inherited column-only writes also fail closed", () => {
    query("create role synthetic_column_writer nologin;grant update(private_note) on public.word_corpus to synthetic_column_writer;grant synthetic_column_writer to authenticated;");
    const before = aclSnapshot(); denied(migration, null, /word_hardening_remaining_column_privilege/); assert.deepEqual(aclSnapshot(), before);
    query("revoke synthetic_column_writer from authenticated;drop owned by synthetic_column_writer;drop role synthetic_column_writer;"); query(migration);
  });
  check("server access inherited only through PUBLIC cannot be silently removed", () => {
    query("revoke insert on public.word_corpus from service_role;grant insert on public.word_corpus to public;");
    const before = aclSnapshot(); denied(migration, null, /word_hardening_server_access_changed/); assert.deepEqual(aclSnapshot(), before);
    query("grant insert on public.word_corpus to service_role;"); query(migration);
  });
  check("server column-only access is independently preserved or the transaction rejects", () => {
    query("revoke update on public.word_corpus from service_role;grant update(private_note) on public.word_corpus to public;");
    const before = aclSnapshot(); denied(migration, null, /word_hardening_server_access_changed/); assert.deepEqual(aclSnapshot(), before);
    query("grant update on public.word_corpus to service_role;"); query(migration);
  });
  check("missing target aborts and rolls back revokes on the other table", () => {
    query("grant update on public.word_corpus to anon;alter table public.word_of_day_rotation_rules rename to synthetic_missing_rotation;");
    const before = aclSnapshot(); denied(migration, null, /word_hardening_missing_table/); assert.deepEqual(aclSnapshot(), before);
  });
  console.log("Word legacy hardening: " + checks + " real PostgreSQL checks passed; synthetic isolated schema only, not hosted migration certification.");
} finally {
  if (container) { docker("rm", "--force", container); console.log("Removed only disposable container " + name + " and its tmpfs test data."); }
}
