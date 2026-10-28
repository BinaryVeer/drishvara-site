-- Prepared only. Exact production application and operational activation require separate authorization.
begin;
create table drishvara_editorial_private.delivery_controls (
  singleton boolean primary key default true check(singleton),
  enabled boolean not null default false,
  word_enabled boolean not null default false,
  article_enabled boolean not null default false,
  authorization_ref text,
  word_record_refs jsonb not null default '{}'::jsonb check(jsonb_typeof(word_record_refs)='object'),
  check(not enabled or coalesce(length(trim(authorization_ref)),0)>0)
);
insert into drishvara_editorial_private.delivery_controls(singleton) values(true);
create table drishvara_editorial_private.deliveries (
  release_request_id uuid primary key references drishvara_editorial_private.release_requests,
  actor_id uuid not null references auth.users,
  command_id uuid not null,
  authorization_ref text not null,
  decision_refs jsonb not null,
  claim_id uuid not null,
  lease_until timestamptz not null,
  status text not null check(status in ('processing','complete','failed')),
  result jsonb
);
create table drishvara_editorial_private.delivery_events (
  id uuid primary key default gen_random_uuid(),
  release_request_id uuid not null references drishvara_editorial_private.release_requests,
  actor_id uuid not null references auth.users,
  claim_id uuid not null,
  operation text not null check(operation in ('claim','complete','fail')),
  detail jsonb not null,
  created_at timestamptz not null default clock_timestamp()
);
alter table drishvara_editorial_private.delivery_controls enable row level security;
alter table drishvara_editorial_private.deliveries enable row level security;
alter table drishvara_editorial_private.delivery_events enable row level security;
revoke all on drishvara_editorial_private.delivery_controls,drishvara_editorial_private.deliveries,drishvara_editorial_private.delivery_events from public,anon,authenticated,service_role;
create trigger immutable_delivery_events before update or delete or truncate on drishvara_editorial_private.delivery_events
  for each statement execute function drishvara_editorial_private.immutable_record();

create function public.editorial_delivery_readiness(p_candidate_id uuid,p_authorization_ref text) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare actor uuid:=auth.uid(); c drishvara_editorial_private.candidates%rowtype; cfg drishvara_editorial_private.delivery_controls%rowtype;
begin
 select * into c from drishvara_editorial_private.candidates where id=p_candidate_id;
 if not found or actor is null or not exists(select 1 from public.profiles where id=actor and is_active=true)
  or not drishvara_editorial_private.can_read(actor,c.id) or not drishvara_editorial_private.has_capability(actor,c.kind,'release')
  or (not drishvara_editorial_private.is_administrator(actor) and not exists(select 1 from drishvara_editorial_private.assignments
   where candidate_id=c.id and subject_id=actor and revoked_at is null and expires_at>now())) then raise exception 'release_scope_denied'; end if;
 select * into cfg from drishvara_editorial_private.delivery_controls where singleton;
 return jsonb_build_object('ok',true,'delivery_enabled',coalesce(cfg.enabled and cfg.authorization_ref=p_authorization_ref
  and case c.kind when 'word' then cfg.word_enabled when 'article' then cfg.article_enabled else false end,false),
  'public_output_allowed',false,'runtime_activation',false);
end;
$$;
revoke all on function public.editorial_delivery_readiness(uuid,text) from public,anon,service_role;
grant execute on function public.editorial_delivery_readiness(uuid,text) to authenticated;

-- Service-only worker; browser-supplied flags, content and approval snapshots are never accepted.
create function public.editorial_release_worker(p_command jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare
 op text:=p_command->>'operation'; actor uuid; v_command_id uuid; release_id uuid; keys text[];
 cfg drishvara_editorial_private.delivery_controls%rowtype;
 r drishvara_editorial_private.release_requests%rowtype;
 c drishvara_editorial_private.candidates%rowtype;
 v drishvara_editorial_private.versions%rowtype;
 saved drishvara_editorial_private.commands%rowtype;
 job drishvara_editorial_private.deliveries%rowtype;
 state jsonb; result jsonb; claim uuid;
begin
 keys:=array['operation','actor_id','command_id','release_request_id','authorization_ref']||
  case op when 'claim' then '{}'::text[] when 'check' then array['claim_id']
    when 'complete' then array['claim_id','result'] when 'fail' then array['claim_id','result'] else null end;
 if keys is null or jsonb_typeof(p_command) is distinct from 'object' or not(p_command ?& keys)
  or exists(select 1 from jsonb_object_keys(p_command) k where not(k=any(keys)))
  or exists(select 1 from unnest(array['operation','actor_id','command_id','release_request_id','authorization_ref']) k
   where jsonb_typeof(p_command->k) is distinct from 'string') then raise exception 'invalid_release_worker_command'; end if;
 actor:=(p_command->>'actor_id')::uuid; v_command_id:=(p_command->>'command_id')::uuid; release_id:=(p_command->>'release_request_id')::uuid;
 select * into saved from drishvara_editorial_private.commands x where x.actor_id=actor and x.command_id=v_command_id;
 if not found or saved.request->>'action' is distinct from 'request_release'
   or saved.receipt->>'release_request_id' is distinct from release_id::text then raise exception 'release_command_unavailable'; end if;
 select * into r from drishvara_editorial_private.release_requests where id=release_id;
 if not found then raise exception 'release_command_unavailable'; end if;
 select * into c from drishvara_editorial_private.candidates where id=r.candidate_id for update;
 select * into v from drishvara_editorial_private.versions where id=c.current_version_id;
 if saved.request->>'candidate_id' is distinct from c.id::text or saved.request->>'version_id' is distinct from v.id::text
  or saved.request->>'content_hash' is distinct from v.content_hash or r.version_id<>v.id or r.content_hash<>v.content_hash then raise exception 'stale_editorial_version'; end if;
 if not exists(select 1 from public.profiles where id=actor and is_active=true)
  or not drishvara_editorial_private.has_capability(actor,c.kind,'release') or not drishvara_editorial_private.can_read(actor,c.id)
  or (not drishvara_editorial_private.is_administrator(actor) and not exists(select 1 from drishvara_editorial_private.assignments
   where candidate_id=c.id and subject_id=actor and revoked_at is null and expires_at>now())) then raise exception 'release_scope_denied'; end if;
 select * into job from drishvara_editorial_private.deliveries where release_request_id=release_id for update;
 if op='fail' then
  if job.claim_id is distinct from (p_command->>'claim_id')::uuid or job.actor_id is distinct from actor or job.command_id is distinct from v_command_id
   or job.status is distinct from 'processing' or jsonb_typeof(p_command->'result') is distinct from 'object'
   or jsonb_typeof(p_command->'result'->'code') is distinct from 'string'
   or length(p_command->'result'->>'code') not between 1 and 100
   or exists(select 1 from jsonb_object_keys(p_command->'result') k where k<>'code') then raise exception 'invalid_release_claim'; end if;
  update drishvara_editorial_private.deliveries set status='failed',result=p_command->'result' where release_request_id=release_id;
  insert into drishvara_editorial_private.delivery_events(release_request_id,actor_id,claim_id,operation,detail)
   values(release_id,actor,job.claim_id,op,p_command->'result');
  return jsonb_build_object('ok',true,'status','failed','public_output_allowed',false,'runtime_activation',false);
 end if;
 select * into cfg from drishvara_editorial_private.delivery_controls where singleton;
 if cfg.enabled is distinct from true or cfg.authorization_ref is distinct from p_command->>'authorization_ref'
  or (c.kind='word' and not cfg.word_enabled) or (c.kind='article' and not cfg.article_enabled) then raise exception 'delivery_not_activated'; end if;
 state:=drishvara_editorial_private.review_state(c.id,v.id);
 if state->'reviews_complete' is distinct from 'true'::jsonb then raise exception 'editorial_reviews_pending'; end if;
 if op='claim' then
  if job.status='complete' then return jsonb_build_object('ok',true,'status','delivery_completed','result',job.result,'public_output_allowed',false,'runtime_activation',false); end if;
  if job.status='processing' and job.lease_until>clock_timestamp() then
   return jsonb_build_object('ok',true,'status','delivery_in_progress','public_output_allowed',false,'runtime_activation',false); end if;
  claim:=gen_random_uuid();
  insert into drishvara_editorial_private.deliveries values(release_id,actor,v_command_id,cfg.authorization_ref,state->'decision_refs',claim,clock_timestamp()+interval '2 minutes','processing',null)
   on conflict(release_request_id) do update set actor_id=excluded.actor_id,command_id=excluded.command_id,authorization_ref=excluded.authorization_ref,
    decision_refs=excluded.decision_refs,claim_id=excluded.claim_id,lease_until=excluded.lease_until,status='processing',result=null;
  insert into drishvara_editorial_private.delivery_events(release_request_id,actor_id,claim_id,operation,detail)
   values(release_id,actor,claim,op,jsonb_build_object('version_id',v.id,'content_hash',v.content_hash,'decision_refs',state->'decision_refs','authorization_ref',cfg.authorization_ref));
  return jsonb_build_object('ok',true,'status','claimed','claim_id',claim,'candidate_id',c.id,'version_id',v.id,'content_hash',v.content_hash,
   'kind',c.kind,'version',to_jsonb(v),'word_record_ref',cfg.word_record_refs->>c.id::text,
   'decisions',(select jsonb_agg(to_jsonb(d) order by d.scope) from drishvara_editorial_private.decisions d where state->'decision_refs' ? d.id::text),
   'public_output_allowed',false,'runtime_activation',false);
 end if;
 if job.status is distinct from 'processing' or job.claim_id is distinct from (p_command->>'claim_id')::uuid
  or job.actor_id is distinct from actor or job.command_id is distinct from v_command_id or job.lease_until<=clock_timestamp()
  or job.authorization_ref<>cfg.authorization_ref or job.decision_refs<>state->'decision_refs' then raise exception 'invalid_release_claim'; end if;
 if op='check' then return jsonb_build_object('ok',true,'status','valid','public_output_allowed',false,'runtime_activation',false); end if;
 result:=p_command->'result';
 if jsonb_typeof(result) is distinct from 'object' or jsonb_typeof(result->'reference') is distinct from 'string'
  or length(result->>'reference') not between 1 and 500 or
  (c.kind='word' and (result->>'status' is distinct from 'eligible_for_daily_selection'
    or result->>'reference' is distinct from cfg.word_record_refs->>c.id::text
    or not(result ?& array['status','reference']) or exists(select 1 from jsonb_object_keys(result) k where k<>all(array['status','reference'])))) or
  (c.kind='article' and (result->>'status' is distinct from 'article_committed' or result->>'reference' !~ '^[a-f0-9]{40}$'
    or result->>'path' is distinct from 'articles/'||case v.payload->>'desk' when 'world_affairs' then 'world' when 'media_society' then 'media' when 'public_programmes' then 'policy' when 'sports' then 'sports' when 'spirituality' then 'spiritual' end||'/editorial-'||c.id::text||'.html'
    or not(result ?& array['status','reference','path']) or exists(select 1 from jsonb_object_keys(result) k where k<>all(array['status','reference','path'])))) then raise exception 'invalid_delivery_receipt'; end if;
 update drishvara_editorial_private.deliveries set status='complete',result=p_command->'result' where release_request_id=release_id;
 insert into drishvara_editorial_private.delivery_events(release_request_id,actor_id,claim_id,operation,detail) values(release_id,actor,job.claim_id,op,result);
 return jsonb_build_object('ok',true,'status','delivery_completed','result',result,'public_output_allowed',false,'runtime_activation',false);
end;
$$;
revoke all on function public.editorial_release_worker(jsonb) from public,anon,authenticated;
grant execute on function public.editorial_release_worker(jsonb) to service_role;
commit;
