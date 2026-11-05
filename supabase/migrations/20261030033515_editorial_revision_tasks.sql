-- Saved correction instructions and immutable resolution links. No approvals or publication switches.
begin;
create table drishvara_editorial_private.revision_tasks (
 id uuid primary key default gen_random_uuid(),
 candidate_id uuid not null references drishvara_editorial_private.candidates(id),
 version_id uuid not null,
 content_hash text not null check(content_hash ~ '^sha256:[a-f0-9]{64}$'),
 requested_by uuid not null references auth.users(id),
 instructions text not null check(length(trim(instructions)) between 12 and 6000),
 evidence_refs jsonb not null check(jsonb_typeof(evidence_refs)='array'),
 created_at timestamptz not null default clock_timestamp(),
 foreign key(candidate_id,version_id) references drishvara_editorial_private.versions(candidate_id,id)
);
create index revision_tasks_candidate on drishvara_editorial_private.revision_tasks(candidate_id,created_at desc,id);
create table drishvara_editorial_private.revision_task_events (
 id uuid primary key default gen_random_uuid(),
 task_id uuid not null unique references drishvara_editorial_private.revision_tasks(id),
 actor_id uuid not null references auth.users(id),
 kind text not null check(kind in ('submitted','cancelled')),
 result_version_id uuid references drishvara_editorial_private.versions(id),
 comparison_acknowledged boolean not null default false,
 note text not null check(length(trim(note)) between 12 and 6000),
 created_at timestamptz not null default clock_timestamp(),
 check((kind='submitted' and result_version_id is not null and comparison_acknowledged) or
       (kind='cancelled' and result_version_id is null and not comparison_acknowledged))
);
alter table drishvara_editorial_private.revision_tasks enable row level security;
alter table drishvara_editorial_private.revision_task_events enable row level security;
create trigger immutable_revision_tasks before update or delete or truncate on drishvara_editorial_private.revision_tasks
 for each statement execute function drishvara_editorial_private.immutable_record();
create trigger immutable_revision_task_events before update or delete or truncate on drishvara_editorial_private.revision_task_events
 for each statement execute function drishvara_editorial_private.immutable_record();

create function drishvara_editorial_private.open_revision_count(p_candidate uuid) returns integer
language sql stable set search_path=pg_catalog as $$
 select count(*)::integer from drishvara_editorial_private.revision_tasks t
 where t.candidate_id=p_candidate and not exists(select 1 from drishvara_editorial_private.revision_task_events e where e.task_id=t.id);
$$;

-- Preserve the installed review semantics; unresolved correction requests add an independent veto.
do $$
declare definition text;
begin
 definition:=pg_get_functiondef('drishvara_editorial_private.review_state(uuid,uuid)'::regprocedure);
 if md5(definition)<>'efc2d20a3934478396b0656a79b80f42' then raise exception 'editorial_review_definition_mismatch'; end if;
 execute replace(definition,'FUNCTION drishvara_editorial_private.review_state(',
  'FUNCTION drishvara_editorial_private.review_state_before_revisions(');
end;
$$;
create or replace function drishvara_editorial_private.review_state(p_candidate uuid,p_version uuid) returns jsonb
language sql stable set search_path=pg_catalog as $$
 select s||jsonb_build_object('pending_revision_tasks',n,'reviews_complete',coalesce((s->>'reviews_complete')::boolean,false) and n=0)
 from (select drishvara_editorial_private.review_state_before_revisions(p_candidate,p_version) s,
  drishvara_editorial_private.open_revision_count(p_candidate) n) q;
$$;

create function public.editorial_revision_command(p_command jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare actor uuid:=auth.uid(); action text:=p_command->>'action'; keys text[]; cmd uuid;
 c drishvara_editorial_private.candidates%rowtype; v drishvara_editorial_private.versions%rowtype;
 t drishvara_editorial_private.revision_tasks%rowtype; saved drishvara_editorial_private.commands%rowtype;
 result jsonb; task_id uuid;
begin
 if actor is null or not exists(select 1 from public.profiles where id=actor and is_active=true) then raise exception 'editorial_access_denied'; end if;
 keys:=case action
  when 'list_revisions' then array['action','candidate_id']
  when 'request_revision' then array['action','command_id','candidate_id','version_id','content_hash','instructions','evidence_refs']
  when 'submit_revision' then array['action','command_id','candidate_id','task_id','version_id','content_hash','kind','title','payload','comparison_acknowledged']
  when 'cancel_revision' then array['action','command_id','candidate_id','task_id','version_id','content_hash','note'] end;
 if keys is null or jsonb_typeof(p_command) is distinct from 'object' or octet_length(p_command::text)>240000 or not(p_command ?& keys) or
  exists(select 1 from jsonb_object_keys(p_command) k where not(k=any(keys))) or
  exists(select 1 from jsonb_each(p_command) e where e.value='null'::jsonb or
    (e.key<>all(array['payload','evidence_refs','comparison_acknowledged']) and jsonb_typeof(e.value)<>'string')) then raise exception 'invalid_revision_request'; end if;
 -- Reuse the full existing account/capability/assignment gate, including revoked-account behavior.
 perform public.editorial_review_command(jsonb_build_object('action','open','candidate_id',p_command->>'candidate_id'));
 if action='list_revisions' then
  result:=jsonb_build_object('ok',true,'tasks',coalesce((select jsonb_agg(row_data order by (row_data->>'status' in ('open','stale')) desc,row_data->>'created_at' desc,row_data->>'id') from (
   select to_jsonb(t1)||jsonb_build_object('status',case when e.kind is not null then e.kind
     when t1.version_id is distinct from c1.current_version_id then 'stale' else 'open' end,
     'resolution',to_jsonb(e),'can_cancel',e.id is null and (t1.requested_by=actor or drishvara_editorial_private.is_administrator(actor))) row_data
   from drishvara_editorial_private.revision_tasks t1 join drishvara_editorial_private.candidates c1 on c1.id=t1.candidate_id
   left join drishvara_editorial_private.revision_task_events e on e.task_id=t1.id
   where t1.candidate_id=(p_command->>'candidate_id')::uuid order by (e.id is null) desc,t1.created_at desc,t1.id limit 250) q),'[]'::jsonb));
  return result||jsonb_build_object('public_output_allowed',false,'runtime_activation',false);
 end if;
 perform pg_advisory_xact_lock(hashtextextended('editorial-access-administration',0));
 if not drishvara_editorial_private.can_revise(actor,(p_command->>'candidate_id')::uuid) then raise exception 'editorial_intake_denied'; end if;
 cmd:=(p_command->>'command_id')::uuid;
 if cmd is null then raise exception 'invalid_revision_request'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||cmd::text,0));
 select * into saved from drishvara_editorial_private.commands where actor_id=actor and command_id=cmd;
 if found then
  if saved.request<>p_command then raise exception 'idempotency_conflict'; end if;
  return saved.receipt;
 end if;
 select * into c from drishvara_editorial_private.candidates where id=(p_command->>'candidate_id')::uuid for update;
 select * into v from drishvara_editorial_private.versions where id=c.current_version_id;
 if action='request_revision' then
  if v.id is distinct from (p_command->>'version_id')::uuid or v.content_hash is distinct from p_command->>'content_hash' then raise exception 'stale_editorial_version'; end if;
  if length(trim(p_command->>'instructions')) not between 12 and 6000 or jsonb_typeof(p_command->'evidence_refs') is distinct from 'array' then raise exception 'invalid_revision_request'; end if;
  if jsonb_array_length(p_command->'evidence_refs')>50 or
   exists(select 1 from jsonb_array_elements(p_command->'evidence_refs') r where jsonb_typeof(r)<>'string' or length(trim(r#>>'{}')) not between 1 and 500) or
   (select count(*)<>count(distinct r) from jsonb_array_elements(p_command->'evidence_refs') r) then raise exception 'invalid_revision_request'; end if;
  if drishvara_editorial_private.open_revision_count(c.id)>=20 then raise exception 'revision_task_limit'; end if;
  insert into drishvara_editorial_private.revision_tasks(candidate_id,version_id,content_hash,requested_by,instructions,evidence_refs)
   values(c.id,v.id,v.content_hash,actor,p_command->>'instructions',p_command->'evidence_refs') returning * into t;
  result:=jsonb_build_object('ok',true,'task',to_jsonb(t)||jsonb_build_object('status','open','can_cancel',true));
 else
  select * into t from drishvara_editorial_private.revision_tasks where id=(p_command->>'task_id')::uuid and candidate_id=c.id for update;
  if not found then raise exception 'revision_task_unavailable'; end if;
  if t.version_id is distinct from (p_command->>'version_id')::uuid or t.content_hash is distinct from p_command->>'content_hash' then raise exception 'stale_editorial_version'; end if;
  if exists(select 1 from drishvara_editorial_private.revision_task_events e where e.task_id=t.id) then raise exception 'revision_task_closed'; end if;
  if action='cancel_revision' then
   if t.requested_by<>actor and not drishvara_editorial_private.is_administrator(actor) then raise exception 'revision_cancel_denied'; end if;
   if length(trim(p_command->>'note')) not between 12 and 6000 then raise exception 'invalid_revision_request'; end if;
   insert into drishvara_editorial_private.revision_task_events(task_id,actor_id,kind,note) values(t.id,actor,'cancelled',p_command->>'note');
   result:=jsonb_build_object('ok',true,'task_id',t.id,'status','cancelled');
  else
   if c.current_version_id is distinct from t.version_id then raise exception 'stale_editorial_version'; end if;
   if p_command->>'kind' is distinct from c.kind or p_command->'comparison_acknowledged' is distinct from 'true'::jsonb or
     jsonb_typeof(p_command->'payload') is distinct from 'object' then raise exception 'revision_comparison_required'; end if;
   if v.title=p_command->>'title' and v.payload=p_command->'payload' then raise exception 'revision_unchanged'; end if;
   -- Existing intake owns validation, exact-copy hashing and fresh pending-review versions.
   result:=public.editorial_review_command(jsonb_build_object('action','intake','command_id',gen_random_uuid(),'kind',c.kind,
     'external_id',c.external_id,'expected_version_id',v.id,'title',p_command->>'title','payload',p_command->'payload'));
   insert into drishvara_editorial_private.revision_task_events(task_id,actor_id,kind,result_version_id,comparison_acknowledged,note)
     values(t.id,actor,'submitted',(result->>'version_id')::uuid,true,'Human acknowledged the displayed before/after comparison; fresh copy reviews remain required.');
   result:=result||jsonb_build_object('task_id',t.id);
  end if;
 end if;
 result:=result||jsonb_build_object('public_output_allowed',false,'runtime_activation',false);
 insert into drishvara_editorial_private.commands values(actor,cmd,p_command,result);
 return result;
exception when invalid_text_representation then raise exception 'invalid_revision_request';
end;
$$;
revoke all on drishvara_editorial_private.revision_tasks,drishvara_editorial_private.revision_task_events from public,anon,authenticated,service_role;
revoke all on function drishvara_editorial_private.open_revision_count(uuid),
 drishvara_editorial_private.review_state_before_revisions(uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.editorial_revision_command(jsonb) from public,anon,service_role;
grant execute on function public.editorial_revision_command(jsonb) to authenticated;
commit;
