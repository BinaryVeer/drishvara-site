-- LOCAL PREPARATION ONLY. No users, qualifications, approval records or publication switches are seeded.
-- Uses existing auth.users/profiles. Does not alter legacy articles, Word assignments or Panchang.
begin;
create schema drishvara_editorial_private;
revoke all on schema drishvara_editorial_private from public, anon, authenticated, service_role;

create table drishvara_editorial_private.capabilities (
  subject_id uuid not null references auth.users(id),
  kind text not null check (kind in ('word','article')),
  scope text not null check (scope in ('intake','release','linguistic','iast','rights','editorial','context','safety','textual','philosophical','factual','media','publisher_acceptance')),
  authorization_ref text not null check (length(trim(authorization_ref)) > 0),
  qualification_ref text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  primary key(subject_id,kind,scope),
  check (scope not in ('linguistic','iast','textual','philosophical') or length(trim(qualification_ref)) > 0 and qualification_ref is not null)
);
create table drishvara_editorial_private.candidates (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('word','article')),
  external_id text not null check (length(external_id) between 1 and 200),
  created_by uuid not null references auth.users(id),
  current_version_id uuid,
  unique(kind,external_id)
);
create table drishvara_editorial_private.versions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references drishvara_editorial_private.candidates(id),
  title text not null check(length(title) between 1 and 400),
  payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=240000),
  content_hash text not null check(content_hash ~ '^sha256:[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default clock_timestamp(),
  unique(candidate_id,id)
);
alter table drishvara_editorial_private.candidates add foreign key(id,current_version_id)
  references drishvara_editorial_private.versions(candidate_id,id);
create table drishvara_editorial_private.assignments (
  candidate_id uuid not null references drishvara_editorial_private.candidates(id),
  subject_id uuid not null references auth.users(id),
  authorization_ref text not null check(length(trim(authorization_ref))>0),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  primary key(candidate_id,subject_id)
);
create table drishvara_editorial_private.decisions (
  sequence bigint generated always as identity primary key,
  id uuid not null unique default gen_random_uuid(),
  candidate_id uuid not null,
  version_id uuid not null,
  content_hash text not null,
  actor_id uuid not null references auth.users(id),
  scope text not null,
  decision text not null check(decision in ('approve','revise','reject')),
  note text not null check(length(trim(note)) between 1 and 6000),
  evidence_refs jsonb not null check(jsonb_typeof(evidence_refs)='array'),
  authorization_ref text not null,
  qualification_ref text,
  created_at timestamptz not null default clock_timestamp(),
  foreign key(candidate_id,version_id) references drishvara_editorial_private.versions(candidate_id,id)
);
create table drishvara_editorial_private.release_requests (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null,
  version_id uuid not null,
  content_hash text not null,
  actor_id uuid not null references auth.users(id),
  decision_refs jsonb not null,
  created_at timestamptz not null default clock_timestamp(),
  -- A handoff request is not an approved Word-bank export or a published article.
  status text not null default 'pending_existing_publisher_validation' check(status='pending_existing_publisher_validation'),
  unique(candidate_id,version_id),
  foreign key(candidate_id,version_id) references drishvara_editorial_private.versions(candidate_id,id)
);
create table drishvara_editorial_private.commands (
  actor_id uuid not null references auth.users(id),
  command_id uuid not null,
  request jsonb not null,
  receipt jsonb not null,
  primary key(actor_id,command_id)
);
alter table drishvara_editorial_private.capabilities enable row level security;
alter table drishvara_editorial_private.candidates enable row level security;
alter table drishvara_editorial_private.versions enable row level security;
alter table drishvara_editorial_private.assignments enable row level security;
alter table drishvara_editorial_private.decisions enable row level security;
alter table drishvara_editorial_private.release_requests enable row level security;
alter table drishvara_editorial_private.commands enable row level security;
revoke all on all tables in schema drishvara_editorial_private from public, anon, authenticated, service_role;
revoke all on all sequences in schema drishvara_editorial_private from public, anon, authenticated, service_role;

create function drishvara_editorial_private.immutable_record() returns trigger
language plpgsql set search_path=pg_catalog as $$begin raise exception 'immutable_editorial_history'; end$$;
create trigger immutable_versions before update or delete or truncate on drishvara_editorial_private.versions
  for each statement execute function drishvara_editorial_private.immutable_record();
create trigger immutable_decisions before update or delete or truncate on drishvara_editorial_private.decisions
  for each statement execute function drishvara_editorial_private.immutable_record();
create trigger immutable_release_requests before update or delete or truncate on drishvara_editorial_private.release_requests
  for each statement execute function drishvara_editorial_private.immutable_record();
create trigger immutable_commands before update or delete or truncate on drishvara_editorial_private.commands
  for each statement execute function drishvara_editorial_private.immutable_record();

create function drishvara_editorial_private.scopes(p_kind text) returns text[]
language sql immutable set search_path=pg_catalog as $$
 select case p_kind when 'word' then array['linguistic','iast','rights','editorial','context','safety','textual','philosophical','publisher_acceptance']
 when 'article' then array['editorial','rights','factual','safety','media','publisher_acceptance'] end;
$$;
create function drishvara_editorial_private.has_capability(p_actor uuid,p_kind text,p_scope text) returns boolean
language sql stable set search_path=pg_catalog as $$
 select exists(select 1 from drishvara_editorial_private.capabilities c where c.subject_id=p_actor and c.kind=p_kind and c.scope=p_scope
 and c.revoked_at is null and c.expires_at>now());
$$;
create function drishvara_editorial_private.can_read(p_actor uuid,p_candidate uuid) returns boolean
language sql stable set search_path=pg_catalog as $$
 select exists(select 1 from drishvara_editorial_private.candidates c where c.id=p_candidate
 and exists(select 1 from drishvara_editorial_private.capabilities g where g.subject_id=p_actor and g.kind=c.kind and g.revoked_at is null and g.expires_at>now())
 and (c.created_by=p_actor or exists(select 1 from drishvara_editorial_private.assignments a where a.candidate_id=c.id and a.subject_id=p_actor and a.revoked_at is null and a.expires_at>now())));
$$;
create function drishvara_editorial_private.review_state(p_candidate uuid,p_version uuid) returns jsonb
language sql stable set search_path=pg_catalog as $$
 with latest as (
   select distinct on(d.scope) d.* from drishvara_editorial_private.decisions d where d.candidate_id=p_candidate and d.version_id=p_version order by d.scope,d.sequence desc
 ), valid as (
   select d.* from latest d join public.profiles p on p.id=d.actor_id and p.is_active=true and p.role in ('admin','editor')
   join drishvara_editorial_private.capabilities g on g.subject_id=d.actor_id and g.kind=(select kind from drishvara_editorial_private.candidates where id=p_candidate)
     and g.scope=d.scope and g.authorization_ref=d.authorization_ref and g.qualification_ref is not distinct from d.qualification_ref and g.revoked_at is null and g.expires_at>now()
   join drishvara_editorial_private.assignments a on a.candidate_id=p_candidate and a.subject_id=d.actor_id and a.revoked_at is null and a.expires_at>now()
   where d.decision='approve'
 )
 select jsonb_build_object('required_scopes',to_jsonb(drishvara_editorial_private.scopes(c.kind)),
 'approved_scopes',coalesce((select jsonb_agg(scope order by scope) from valid),'[]'::jsonb),
 'decision_refs',coalesce((select jsonb_agg(id order by scope) from valid),'[]'::jsonb),
 'reviews_complete',not exists(select 1 from unnest(drishvara_editorial_private.scopes(c.kind)) s where not exists(select 1 from valid v where v.scope=s)))
 from drishvara_editorial_private.candidates c where c.id=p_candidate;
$$;

create function public.editorial_review_command(p_command jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare
 actor uuid:=auth.uid(); action text:=p_command->>'action'; keys text[]; v_command_id uuid;
 c drishvara_editorial_private.candidates%rowtype; v drishvara_editorial_private.versions%rowtype;
 grant_row drishvara_editorial_private.capabilities%rowtype;
 saved drishvara_editorial_private.commands%rowtype;
 receipt jsonb; state jsonb; record_id uuid; request_hash text;
begin
 if actor is null or not exists(select 1 from public.profiles where id=actor and is_active=true and role in ('admin','editor')) then
   raise exception using errcode='42501', message='editorial_access_denied';
 end if;
 if not exists(select 1 from drishvara_editorial_private.capabilities where subject_id=actor and revoked_at is null and expires_at>now()) then
   raise exception using errcode='42501', message='editorial_capability_required';
 end if;
 keys:=case action when 'session' then array['action'] when 'list' then array['action'] when 'open' then array['action','candidate_id']
 when 'intake' then array['action','command_id','kind','external_id','expected_version_id','title','payload']
 when 'decision' then array['action','command_id','candidate_id','version_id','content_hash','scope','decision','note','evidence_refs']
 when 'request_release' then array['action','command_id','candidate_id','version_id','content_hash'] end;
 if keys is null or jsonb_typeof(p_command) is distinct from 'object' or octet_length(p_command::text)>240000 or not(p_command ?& keys) then
   raise exception 'invalid_editorial_command';
 end if;
 if exists(select 1 from jsonb_object_keys(p_command) k where not(k=any(keys))) then raise exception 'unknown_editorial_field'; end if;
 if exists(select 1 from jsonb_each(p_command) e where e.value='null'::jsonb and e.key<>'expected_version_id') then raise exception 'null_editorial_field'; end if;
 if exists(select 1 from jsonb_each(p_command) e where e.key not in ('payload','evidence_refs') and not(e.key='expected_version_id' and e.value='null'::jsonb)
   and jsonb_typeof(e.value)<>'string') then raise exception 'invalid_editorial_field_type'; end if;
 if action='session' then
   receipt:=jsonb_build_object('ok',true,'actor_id',actor,'capabilities',(select jsonb_agg(jsonb_build_object('kind',kind,'scope',scope,'qualification_ref',qualification_ref))
    from drishvara_editorial_private.capabilities where subject_id=actor and revoked_at is null and expires_at>now()));
 elsif action='list' then
   receipt:=jsonb_build_object('ok',true,'items',coalesce((select jsonb_agg(item order by item->>'title') from (
    select jsonb_build_object('id',c1.id,'kind',c1.kind,'external_id',c1.external_id,'version_id',v1.id,'title',v1.title,'content_hash',v1.content_hash,
      'review_state',drishvara_editorial_private.review_state(c1.id,v1.id)) item
    from drishvara_editorial_private.candidates c1 join drishvara_editorial_private.versions v1 on v1.id=c1.current_version_id
    where drishvara_editorial_private.can_read(actor,c1.id)) q),'[]'::jsonb));
 elsif action='open' then
   if not drishvara_editorial_private.can_read(actor,(p_command->>'candidate_id')::uuid) then raise exception using errcode='42501',message='editorial_assignment_required'; end if;
   select * into c from drishvara_editorial_private.candidates where id=(p_command->>'candidate_id')::uuid;
   select * into v from drishvara_editorial_private.versions where id=c.current_version_id;
   receipt:=jsonb_build_object('ok',true,'candidate',to_jsonb(c),'version',to_jsonb(v),'review_state',drishvara_editorial_private.review_state(c.id,v.id),
     'decisions',coalesce((select jsonb_agg(to_jsonb(d) order by d.sequence) from drishvara_editorial_private.decisions d where d.candidate_id=c.id),'[]'::jsonb),
     'release_requests',coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at) from drishvara_editorial_private.release_requests r where r.candidate_id=c.id),'[]'::jsonb));
 else
   v_command_id:=(p_command->>'command_id')::uuid;
   if v_command_id is null then raise exception 'missing_command_id'; end if;
   perform pg_advisory_xact_lock(hashtextextended(actor::text||v_command_id::text,0));
   select * into saved from drishvara_editorial_private.commands where actor_id=actor and command_id=v_command_id;
   if found then
     if saved.request<>p_command then raise exception 'idempotency_conflict'; end if;
     return saved.receipt;
   end if;
   if action='intake' then
     if not drishvara_editorial_private.has_capability(actor,p_command->>'kind','intake') then raise exception using errcode='42501',message='editorial_intake_denied'; end if;
     if length(trim(p_command->>'external_id')) not between 1 and 200 or length(trim(p_command->>'title')) not between 1 and 400
       or jsonb_typeof(p_command->'payload')<>'object' then raise exception 'invalid_intake'; end if;
     if p_command->>'kind'='word' then
       if p_command->'payload'->>'contract_version' is distinct from 'ag70e.word-copy.v2' or jsonb_typeof(p_command->'payload'->'content') is distinct from 'object'
         or jsonb_typeof(p_command->'payload'->'research_refs') is distinct from 'array' then raise exception 'invalid_word_intake'; end if;
       if not(p_command->'payload' ?& array['contract_version','content','research_refs']) or
         exists(select 1 from jsonb_object_keys(p_command->'payload') k where k<>all(array['contract_version','content','research_refs'])) then raise exception 'unknown_word_intake_field'; end if;
     elsif p_command->>'kind'='article' then
       if coalesce(p_command->'payload'->>'desk','')<>all(array['world_affairs','media_society','public_programmes','sports','spirituality'])
         or jsonb_typeof(p_command->'payload'->'body') is distinct from 'string' or length(p_command->'payload'->>'body')=0 then raise exception 'invalid_article_intake'; end if;
     else raise exception 'invalid_content_kind'; end if;
     perform pg_advisory_xact_lock(hashtextextended((p_command->>'kind')||':'||(p_command->>'external_id'),0));
     select * into c from drishvara_editorial_private.candidates where kind=p_command->>'kind' and external_id=p_command->>'external_id' for update;
     if found then
       if not drishvara_editorial_private.can_read(actor,c.id) then raise exception using errcode='42501',message='editorial_assignment_required'; end if;
       if c.current_version_id is distinct from (p_command->>'expected_version_id')::uuid then raise exception 'stale_editorial_version'; end if;
     else
       if p_command->>'expected_version_id' is not null then raise exception 'stale_editorial_version'; end if;
       insert into drishvara_editorial_private.candidates(kind,external_id,created_by) values(p_command->>'kind',p_command->>'external_id',actor) returning * into c;
     end if;
     request_hash:='sha256:'||encode(sha256(convert_to(jsonb_build_object('title',p_command->>'title','payload',p_command->'payload')::text,'UTF8')),'hex');
     insert into drishvara_editorial_private.versions(candidate_id,title,payload,content_hash,created_by)
       values(c.id,p_command->>'title',p_command->'payload',request_hash,actor) returning * into v;
     update drishvara_editorial_private.candidates set current_version_id=v.id where id=c.id;
     receipt:=jsonb_build_object('ok',true,'candidate_id',c.id,'version_id',v.id,'content_hash',v.content_hash,'status','pending_review');
   else
     select * into c from drishvara_editorial_private.candidates where id=(p_command->>'candidate_id')::uuid for update;
     if not found or not drishvara_editorial_private.can_read(actor,c.id) then raise exception using errcode='42501',message='editorial_assignment_required'; end if;
     select * into v from drishvara_editorial_private.versions where id=c.current_version_id;
     if v.id is distinct from (p_command->>'version_id')::uuid or v.content_hash is distinct from p_command->>'content_hash' then raise exception 'stale_editorial_version'; end if;
     if not exists(select 1 from drishvara_editorial_private.assignments where candidate_id=c.id and subject_id=actor and revoked_at is null and expires_at>now()) then
       raise exception using errcode='42501',message='editorial_assignment_required'; end if;
     if action='decision' then
       if actor=c.created_by or exists(select 1 from drishvara_editorial_private.versions where candidate_id=c.id and created_by=actor) then
         raise exception using errcode='42501',message='self_review_denied'; end if;
       if not(p_command->>'scope'=any(drishvara_editorial_private.scopes(c.kind))) or not(p_command->>'decision'=any(array['approve','revise','reject']))
         or length(trim(p_command->>'note')) not between 1 and 6000 or jsonb_typeof(p_command->'evidence_refs')<>'array'
         or jsonb_array_length(p_command->'evidence_refs')>50
         or (select count(*)<>count(distinct e) from jsonb_array_elements(p_command->'evidence_refs') e)
         or exists(select 1 from jsonb_array_elements(p_command->'evidence_refs') e where jsonb_typeof(e)<>'string' or length(trim(e#>>'{}')) not between 1 and 500)
         or (p_command->>'decision'='approve' and jsonb_array_length(p_command->'evidence_refs')=0) then raise exception 'invalid_editorial_decision'; end if;
       select * into grant_row from drishvara_editorial_private.capabilities where subject_id=actor and kind=c.kind and scope=p_command->>'scope' and revoked_at is null and expires_at>now();
       if not found then raise exception using errcode='42501',message='review_scope_denied'; end if;
       insert into drishvara_editorial_private.decisions(candidate_id,version_id,content_hash,actor_id,scope,decision,note,evidence_refs,authorization_ref,qualification_ref)
         values(c.id,v.id,v.content_hash,actor,p_command->>'scope',p_command->>'decision',p_command->>'note',p_command->'evidence_refs',grant_row.authorization_ref,grant_row.qualification_ref) returning id into record_id;
       receipt:=jsonb_build_object('ok',true,'decision_id',record_id,'review_state',drishvara_editorial_private.review_state(c.id,v.id));
     elsif action='request_release' then
       if not drishvara_editorial_private.has_capability(actor,c.kind,'release') then raise exception using errcode='42501',message='release_scope_denied'; end if;
       state:=drishvara_editorial_private.review_state(c.id,v.id);
       if state->>'reviews_complete'<>'true' then raise exception 'editorial_reviews_pending'; end if;
       insert into drishvara_editorial_private.release_requests(candidate_id,version_id,content_hash,actor_id,decision_refs)
         values(c.id,v.id,v.content_hash,actor,state->'decision_refs') on conflict(candidate_id,version_id) do nothing;
       select id into record_id from drishvara_editorial_private.release_requests where candidate_id=c.id and version_id=v.id;
       receipt:=jsonb_build_object('ok',true,'release_request_id',record_id,'status','pending_existing_publisher_validation');
     end if;
   end if;
   receipt:=receipt||jsonb_build_object('public_output_allowed',false,'runtime_activation',false);
   insert into drishvara_editorial_private.commands values(actor,v_command_id,p_command,receipt);
 end if;
 return receipt||jsonb_build_object('public_output_allowed',false,'runtime_activation',false);
end;
$$;
revoke all on all functions in schema drishvara_editorial_private from public,anon,authenticated,service_role;
revoke all on function public.editorial_review_command(jsonb) from public,anon,service_role;
grant execute on function public.editorial_review_command(jsonb) to authenticated;
commit;
