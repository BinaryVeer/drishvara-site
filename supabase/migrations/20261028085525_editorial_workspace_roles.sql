-- Local preparation only. No account, qualification, content approval or publication switch is seeded.
begin;
create table drishvara_editorial_private.administrators (
  subject_id uuid primary key references auth.users(id),
  authorization_ref text not null check(length(trim(authorization_ref))>0),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create table drishvara_editorial_private.administration_events (
  id uuid primary key,
  actor_id uuid not null references auth.users(id),
  subject_id uuid not null references auth.users(id),
  action text not null,
  request jsonb not null,
  created_at timestamptz not null default clock_timestamp()
);
alter table drishvara_editorial_private.administrators enable row level security;
alter table drishvara_editorial_private.administration_events enable row level security;
revoke all on all tables in schema drishvara_editorial_private from public,anon,authenticated,service_role;
create trigger immutable_administration_events before update or delete or truncate on drishvara_editorial_private.administration_events
  for each statement execute function drishvara_editorial_private.immutable_record();
alter table drishvara_editorial_private.decisions add column admin_exception jsonb;
alter table drishvara_editorial_private.decisions add column assignment_authorization_ref text;

create function drishvara_editorial_private.is_administrator(p_actor uuid) returns boolean
language sql stable set search_path=pg_catalog as $$
 select exists(select 1 from drishvara_editorial_private.administrators a join public.profiles p on p.id=a.subject_id
 where a.subject_id=p_actor and p.is_active=true and p.role='admin' and a.revoked_at is null and a.expires_at>now());
$$;
create function drishvara_editorial_private.effective_capability(p_actor uuid,p_kind text,p_scope text)
returns table(authorization_ref text,qualification_ref text)
language sql stable set search_path=pg_catalog as $$
 select q.authorization_ref,q.qualification_ref from (
 select c.authorization_ref,c.qualification_ref,0 priority from drishvara_editorial_private.capabilities c
 where c.subject_id=p_actor and c.kind=p_kind and c.scope=p_scope and c.revoked_at is null and c.expires_at>now()
 union all
 select a.authorization_ref,null::text,1 from drishvara_editorial_private.administrators a
 where a.subject_id=p_actor and drishvara_editorial_private.is_administrator(p_actor)
 and p_kind in ('word','article') and p_scope=any(array['intake','release']||drishvara_editorial_private.scopes(p_kind))
 and p_scope not in ('linguistic','iast','textual','philosophical')
 ) q order by priority limit 1;
$$;
create or replace function drishvara_editorial_private.has_capability(p_actor uuid,p_kind text,p_scope text) returns boolean
language sql stable set search_path=pg_catalog as $$
 select exists(select 1 from drishvara_editorial_private.effective_capability(p_actor,p_kind,p_scope));
$$;
create or replace function drishvara_editorial_private.can_read(p_actor uuid,p_candidate uuid) returns boolean
language sql stable set search_path=pg_catalog as $$
 select exists(select 1 from drishvara_editorial_private.candidates c where c.id=p_candidate and
 (drishvara_editorial_private.is_administrator(p_actor) or
 (exists(select 1 from drishvara_editorial_private.capabilities g where g.subject_id=p_actor and g.kind=c.kind and g.revoked_at is null and g.expires_at>now())
 and (c.created_by=p_actor or exists(select 1 from drishvara_editorial_private.assignments a where a.candidate_id=c.id
 and a.subject_id=p_actor and a.revoked_at is null and a.expires_at>now())))));
$$;
create or replace function drishvara_editorial_private.review_state(p_candidate uuid,p_version uuid) returns jsonb
language sql stable set search_path=pg_catalog as $$
 with latest as (
 select distinct on(d.scope) d.* from drishvara_editorial_private.decisions d
 where d.candidate_id=p_candidate and d.version_id=p_version order by d.scope,d.sequence desc
 ), valid as (
 select d.* from latest d join public.profiles p on p.id=d.actor_id and p.is_active=true
 join drishvara_editorial_private.candidates c on c.id=d.candidate_id
 join lateral drishvara_editorial_private.effective_capability(d.actor_id,c.kind,d.scope) g
 on g.authorization_ref=d.authorization_ref and g.qualification_ref is not distinct from d.qualification_ref
 where d.decision='approve' and
 ((drishvara_editorial_private.is_administrator(d.actor_id) and d.assignment_authorization_ref=(select authorization_ref from drishvara_editorial_private.administrators where subject_id=d.actor_id))
 or exists(select 1 from drishvara_editorial_private.assignments a
 where a.candidate_id=c.id and a.subject_id=d.actor_id and a.authorization_ref=d.assignment_authorization_ref and a.revoked_at is null and a.expires_at>now()))
 and (d.admin_exception is null or (drishvara_editorial_private.is_administrator(d.actor_id)
 and d.admin_exception->>'policy_ref'='drishvara-editorial-admin-self-review@1'))
 )
 select jsonb_build_object('required_scopes',to_jsonb(drishvara_editorial_private.scopes(c.kind)),
 'approved_scopes',coalesce((select jsonb_agg(scope order by scope) from valid),'[]'::jsonb),
 'decision_refs',coalesce((select jsonb_agg(id order by scope) from valid),'[]'::jsonb),
 'reviews_complete',not exists(select 1 from unnest(drishvara_editorial_private.scopes(c.kind)) s where not exists(select 1 from valid v where v.scope=s)))
 from drishvara_editorial_private.candidates c where c.id=p_candidate;
$$;

create function drishvara_editorial_private.administration_command(p_command jsonb) returns jsonb
language plpgsql set search_path=pg_catalog as $$
declare
 actor uuid:=auth.uid(); action text:=p_command->>'action'; target uuid; v_command_id uuid;
 keys text[]; expiry timestamptz; days integer; receipt jsonb; previous drishvara_editorial_private.commands%rowtype;
begin
 if not drishvara_editorial_private.is_administrator(actor) then raise exception using errcode='42501',message='workspace_administrator_required'; end if;
 keys:=case action when 'people' then array['action'] when 'lookup_person' then array['action','email']
 when 'set_capability' then array['action','command_id','email','kind','scope','operation','access_days','qualification_ref','qualification_verified','note']
 when 'set_assignment' then array['action','command_id','email','candidate_id','operation','access_days','note'] end;
 if keys is null or jsonb_typeof(p_command)<>'object' or not(p_command ?& keys)
 or exists(select 1 from jsonb_object_keys(p_command) k where not(k=any(keys))) then raise exception 'invalid_administration_command'; end if;
 if action='people' then
  return jsonb_build_object('ok',true,'audit_events',coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at desc) from
   (select * from drishvara_editorial_private.administration_events order by created_at desc limit 100) e),'[]'::jsonb),
   'people',coalesce((select jsonb_agg(person order by person->>'email') from (
   select jsonb_build_object('id',u.id,'email',u.email,'active',p.is_active,'capabilities',
    coalesce((select jsonb_agg(to_jsonb(g) order by g.kind,g.scope) from drishvara_editorial_private.capabilities g where g.subject_id=u.id),'[]'::jsonb)) person
   from auth.users u join public.profiles p on p.id=u.id where exists(select 1 from drishvara_editorial_private.capabilities g where g.subject_id=u.id)
  ) q),'[]'::jsonb));
 end if;
 if jsonb_typeof(p_command->'email')<>'string' or length(p_command->>'email') not between 3 and 254 then raise exception 'invalid_member_email'; end if;
 select case when count(*)=1 then min(u.id::text)::uuid end into target from auth.users u join public.profiles p on p.id=u.id
 where lower(u.email)=lower(trim(p_command->>'email')) and p.is_active=true and u.email_confirmed_at is not null;
 if target is null then raise exception 'active_confirmed_account_required'; end if;
 if action='lookup_person' then
  return jsonb_build_object('ok',true,'person',jsonb_build_object('id',target,'email',lower(trim(p_command->>'email')),
   'capabilities',coalesce((select jsonb_agg(to_jsonb(g) order by g.kind,g.scope) from drishvara_editorial_private.capabilities g where g.subject_id=target),'[]'::jsonb),
   'assignments',coalesce((select jsonb_agg(to_jsonb(a)) from drishvara_editorial_private.assignments a where a.subject_id=target),'[]'::jsonb)));
 end if;
 if jsonb_typeof(p_command->'command_id')<>'string' or jsonb_typeof(p_command->'note')<>'string'
 or length(trim(p_command->>'note')) not between 10 and 6000
 or jsonb_typeof(p_command->'operation')<>'string' or p_command->>'operation' not in ('grant','revoke')
 or jsonb_typeof(p_command->'access_days')<>'number' or (p_command->>'access_days') !~ '^[0-9]+$' then raise exception 'invalid_administration_fields'; end if;
 v_command_id:=(p_command->>'command_id')::uuid; days:=(p_command->>'access_days')::integer;
 if v_command_id is null or days not between 1 and 90 then raise exception 'invalid_access_duration'; end if;
 -- Serialize all delegated access changes so grants/revocations cannot race one another.
 perform pg_advisory_xact_lock(hashtextextended('editorial-access-administration',0));
 if not drishvara_editorial_private.is_administrator(actor) then raise exception 'workspace_administrator_required'; end if;
 select * into previous from drishvara_editorial_private.commands where actor_id=actor and command_id=v_command_id;
 if found then
  if previous.request<>p_command then raise exception 'idempotency_conflict'; end if;
  return previous.receipt;
 end if;
 select least(now()+make_interval(days=>days),expires_at) into expiry from drishvara_editorial_private.administrators where subject_id=actor;
 if action='set_capability' then
  if jsonb_typeof(p_command->'kind')<>'string' or p_command->>'kind' not in ('word','article')
   or jsonb_typeof(p_command->'scope')<>'string'
   or not(p_command->>'scope'=any(array['intake','release']||drishvara_editorial_private.scopes(p_command->>'kind')))
   or jsonb_typeof(p_command->'qualification_verified')<>'boolean'
   or not(p_command->'qualification_ref'='null'::jsonb or jsonb_typeof(p_command->'qualification_ref')='string') then raise exception 'invalid_capability_scope'; end if;
  if p_command->>'operation'='grant' then
   if p_command->>'scope' in ('linguistic','iast','textual','philosophical') and
    (p_command->>'qualification_verified'<>'true' or length(trim(coalesce(p_command->>'qualification_ref',''))) not between 1 and 500) then raise exception 'verified_qualification_reference_required'; end if;
   insert into drishvara_editorial_private.capabilities(subject_id,kind,scope,authorization_ref,qualification_ref,expires_at)
   values(target,p_command->>'kind',p_command->>'scope','editorial-admin-grant:'||v_command_id, p_command->>'qualification_ref',expiry)
   on conflict(subject_id,kind,scope) do update set authorization_ref=excluded.authorization_ref,
    qualification_ref=excluded.qualification_ref,expires_at=excluded.expires_at,revoked_at=null;
  else
   update drishvara_editorial_private.capabilities set revoked_at=clock_timestamp()
   where subject_id=target and kind=p_command->>'kind' and scope=p_command->>'scope';
  end if;
 else
  if jsonb_typeof(p_command->'candidate_id')<>'string' then raise exception 'invalid_candidate_id'; end if;
  if not exists(select 1 from drishvara_editorial_private.candidates where id=(p_command->>'candidate_id')::uuid) then raise exception 'invalid_candidate_id'; end if;
  if p_command->>'operation'='grant' then
   if not exists(select 1 from drishvara_editorial_private.capabilities g join drishvara_editorial_private.candidates c on c.kind=g.kind
    where c.id=(p_command->>'candidate_id')::uuid and g.subject_id=target and g.revoked_at is null and g.expires_at>now())
    and not drishvara_editorial_private.is_administrator(target) then raise exception 'member_capability_required'; end if;
   insert into drishvara_editorial_private.assignments(candidate_id,subject_id,authorization_ref,expires_at)
   values((p_command->>'candidate_id')::uuid,target,'editorial-admin-assignment:'||v_command_id,expiry)
   on conflict(candidate_id,subject_id) do update set authorization_ref=excluded.authorization_ref,expires_at=excluded.expires_at,revoked_at=null;
  else
   update drishvara_editorial_private.assignments set revoked_at=clock_timestamp()
   where candidate_id=(p_command->>'candidate_id')::uuid and subject_id=target;
  end if;
 end if;
 insert into drishvara_editorial_private.administration_events(id,actor_id,subject_id,action,request)
 values(v_command_id,actor,target,action,p_command);
 receipt:=jsonb_build_object('ok',true,'event_id',v_command_id,'subject_id',target,'expires_at',expiry,'public_output_allowed',false,'runtime_activation',false);
 insert into drishvara_editorial_private.commands values(actor,v_command_id,p_command,receipt);
 return receipt;
end;
$$;

create or replace function public.editorial_review_command(p_command jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare
 actor uuid:=auth.uid(); action text:=p_command->>'action'; keys text[]; v_command_id uuid;
 c drishvara_editorial_private.candidates%rowtype; v drishvara_editorial_private.versions%rowtype;
 grant_row drishvara_editorial_private.capabilities%rowtype;
 saved drishvara_editorial_private.commands%rowtype;
 receipt jsonb; state jsonb; record_id uuid; request_hash text;
 administrator boolean:=drishvara_editorial_private.is_administrator(actor); contributor boolean; assignment_ref text;
begin
 if actor is null or not exists(select 1 from public.profiles where id=actor and is_active=true) then
   raise exception using errcode='42501', message='editorial_access_denied';
 end if;
 if action in ('people','lookup_person','set_capability','set_assignment') then
   return drishvara_editorial_private.administration_command(p_command)||jsonb_build_object('public_output_allowed',false,'runtime_activation',false);
 end if;
 if not administrator and not exists(select 1 from drishvara_editorial_private.capabilities where subject_id=actor and revoked_at is null and expires_at>now()) then
   raise exception using errcode='42501', message='editorial_capability_required';
 end if;
 keys:=case action when 'session' then array['action'] when 'list' then array['action'] when 'open' then array['action','candidate_id']
 when 'intake' then array['action','command_id','kind','external_id','expected_version_id','title','payload']
 when 'decision' then array['action','command_id','candidate_id','version_id','content_hash','scope','decision','note','evidence_refs']
 when 'request_release' then array['action','command_id','candidate_id','version_id','content_hash'] end;
 if action='decision' and p_command ? 'admin_exception' then keys:=keys||array['admin_exception']; end if;
 if keys is null or jsonb_typeof(p_command) is distinct from 'object' or octet_length(p_command::text)>240000 or not(p_command ?& keys) then
   raise exception 'invalid_editorial_command';
 end if;
 if exists(select 1 from jsonb_object_keys(p_command) k where not(k=any(keys))) then raise exception 'unknown_editorial_field'; end if;
 if exists(select 1 from jsonb_each(p_command) e where e.value='null'::jsonb and e.key<>'expected_version_id') then raise exception 'null_editorial_field'; end if;
 if exists(select 1 from jsonb_each(p_command) e where e.key not in ('payload','evidence_refs','admin_exception') and not(e.key='expected_version_id' and e.value='null'::jsonb)
   and jsonb_typeof(e.value)<>'string') then raise exception 'invalid_editorial_field_type'; end if;
 if action='session' then
   receipt:=jsonb_build_object('ok',true,'actor_id',actor,'is_administrator',administrator,
    'self_review_policy_ref','drishvara-editorial-admin-self-review@1','publisher_delivery_enabled',false,
    'capabilities',coalesce((select jsonb_agg(jsonb_build_object('kind',k,'scope',s,'qualification_ref',e.qualification_ref) order by k,s)
    from unnest(array['word','article']) k cross join lateral unnest(array['intake','release']||drishvara_editorial_private.scopes(k)) s
    cross join lateral drishvara_editorial_private.effective_capability(actor,k,s) e),'[]'::jsonb));
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
   contributor:=actor=c.created_by or exists(select 1 from drishvara_editorial_private.versions where candidate_id=c.id and created_by=actor);
   receipt:=jsonb_build_object('ok',true,'candidate',to_jsonb(c),'version',to_jsonb(v),'review_state',drishvara_editorial_private.review_state(c.id,v.id),
     'can_edit',drishvara_editorial_private.has_capability(actor,c.kind,'intake'),
     'review_permissions',jsonb_build_object('can_review',administrator or (not contributor and exists(select 1 from drishvara_editorial_private.assignments where candidate_id=c.id and subject_id=actor and revoked_at is null and expires_at>now())),
      'self_review_exception_required',contributor and administrator,
      'can_request_release',drishvara_editorial_private.has_capability(actor,c.kind,'release') and (administrator or exists(select 1 from drishvara_editorial_private.assignments where candidate_id=c.id and subject_id=actor and revoked_at is null and expires_at>now()))),
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
     if not administrator and not exists(select 1 from drishvara_editorial_private.assignments where candidate_id=c.id and subject_id=actor and revoked_at is null and expires_at>now()) then
       raise exception using errcode='42501',message='editorial_assignment_required'; end if;
     if action='decision' then
       contributor:=actor=c.created_by or exists(select 1 from drishvara_editorial_private.versions where candidate_id=c.id and created_by=actor);
       if contributor then
         if not administrator then raise exception using errcode='42501',message='self_review_denied'; end if;
         if jsonb_typeof(p_command->'admin_exception') is distinct from 'object'
          or not(p_command->'admin_exception' ?& array['policy_ref','reason','acknowledged'])
          or exists(select 1 from jsonb_object_keys(p_command->'admin_exception') k where k<>all(array['policy_ref','reason','acknowledged']))
          or p_command->'admin_exception'->>'policy_ref' is distinct from 'drishvara-editorial-admin-self-review@1'
          or p_command->'admin_exception'->'acknowledged' is distinct from 'true'::jsonb
          or jsonb_typeof(p_command->'admin_exception'->'reason') is distinct from 'string'
          or length(trim(p_command->'admin_exception'->>'reason')) not between 12 and 6000 then
           raise exception 'explicit_admin_self_review_required'; end if;
       elsif p_command ? 'admin_exception' then raise exception 'unexpected_admin_exception'; end if;
       if not(p_command->>'scope'=any(drishvara_editorial_private.scopes(c.kind))) or not(p_command->>'decision'=any(array['approve','revise','reject']))
         or length(trim(p_command->>'note')) not between 1 and 6000 or jsonb_typeof(p_command->'evidence_refs')<>'array'
         or jsonb_array_length(p_command->'evidence_refs')>50
         or (select count(*)<>count(distinct e) from jsonb_array_elements(p_command->'evidence_refs') e)
         or exists(select 1 from jsonb_array_elements(p_command->'evidence_refs') e where jsonb_typeof(e)<>'string' or length(trim(e#>>'{}')) not between 1 and 500)
         or (p_command->>'decision'='approve' and jsonb_array_length(p_command->'evidence_refs')=0) then raise exception 'invalid_editorial_decision'; end if;
       select e.authorization_ref,e.qualification_ref into grant_row.authorization_ref,grant_row.qualification_ref
       from drishvara_editorial_private.effective_capability(actor,c.kind,p_command->>'scope') e;
       if not found then raise exception using errcode='42501',message='review_scope_denied'; end if;
       if administrator then select authorization_ref into assignment_ref from drishvara_editorial_private.administrators where subject_id=actor;
       else select authorization_ref into assignment_ref from drishvara_editorial_private.assignments where candidate_id=c.id and subject_id=actor; end if;
       insert into drishvara_editorial_private.decisions(candidate_id,version_id,content_hash,actor_id,scope,decision,note,evidence_refs,authorization_ref,qualification_ref,admin_exception,assignment_authorization_ref)
         values(c.id,v.id,v.content_hash,actor,p_command->>'scope',p_command->>'decision',p_command->>'note',p_command->'evidence_refs',grant_row.authorization_ref,grant_row.qualification_ref,p_command->'admin_exception',assignment_ref) returning id into record_id;
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
