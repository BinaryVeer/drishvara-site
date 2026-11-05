-- Derived queues reuse immutable versions/decisions/tasks. No copy, approval, grant or publication is seeded.
begin;
create function drishvara_editorial_private.workflow_stage(p_state jsonb,p_publisher_decision text) returns text
language sql immutable set search_path=pg_catalog as $$
 select case
  when (p_state->>'pending_revision_tasks')::integer>0 then 'corrections'
  when p_publisher_decision='reject' then 'rejected'
  when p_publisher_decision='revise' then 'corrections'
  when exists(select 1 from jsonb_array_elements_text(p_state->'required_scopes') s
    where s<>'publisher_acceptance' and not(p_state->'approved_scopes' ? s)) then 'review'
  when p_state->'reviews_complete' is distinct from 'true'::jsonb then 'acceptance'
  else 'publishing' end;
$$;

create function drishvara_editorial_private.require_editorial_handoff() returns trigger
language plpgsql set search_path=pg_catalog as $$
declare state jsonb;
begin
 if new.scope='publisher_acceptance' and new.decision='approve' then
  perform 1 from drishvara_editorial_private.candidates where id=new.candidate_id for update;
  state:=drishvara_editorial_private.review_state(new.candidate_id,new.version_id);
  if state is null or (state->>'pending_revision_tasks')::integer>0 or
   exists(select 1 from jsonb_array_elements_text(state->'required_scopes') s
    where s<>'publisher_acceptance' and not(state->'approved_scopes' ? s)) then
   raise exception 'editorial_review_handoff_pending'; end if;
 end if;
 return new;
end;
$$;
create trigger publisher_acceptance_after_editorial before insert on drishvara_editorial_private.decisions
 for each row execute function drishvara_editorial_private.require_editorial_handoff();

create function public.editorial_workflow_queue(p_view text,p_kind text,p_desk text,p_after uuid default null) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare actor uuid:=auth.uid(); result jsonb;
begin
 if actor is null or not exists(select 1 from public.profiles where id=actor and is_active=true)
  or not exists(select 1 from drishvara_editorial_private.candidates c where drishvara_editorial_private.can_read(actor,c.id))
   and not exists(select 1 from drishvara_editorial_private.effective_capability(actor,'article','intake'))
   and not exists(select 1 from drishvara_editorial_private.effective_capability(actor,'word','intake')) then
  raise exception 'editorial_access_denied'; end if;
 if p_view is null or p_view not in ('review','acceptance','publishing','delivery','live','all') or
  p_kind is null or p_kind not in ('word','article','all') or p_desk is null or
  p_desk not in ('all','world_affairs','media_society','public_programmes','sports','spirituality') or
  (p_kind='word' and p_desk<>'all') then raise exception 'invalid_workflow_query'; end if;
 with base as materialized (
  select c.id,c.kind,c.external_id,v.id version_id,v.content_hash,v.title,
   case when c.kind='article' then v.payload->>'desk' end desk,
   drishvara_editorial_private.review_state(c.id,v.id) review_state,
   (select d.decision from drishvara_editorial_private.decisions d
    join public.profiles p on p.id=d.actor_id and p.is_active=true
    join lateral drishvara_editorial_private.effective_capability(d.actor_id,c.kind,d.scope) g
      on g.authorization_ref=d.authorization_ref and g.qualification_ref is not distinct from d.qualification_ref
    where d.candidate_id=c.id and d.version_id=v.id and d.scope='publisher_acceptance'
     and d.sequence=(select max(last_d.sequence) from drishvara_editorial_private.decisions last_d
       where last_d.candidate_id=c.id and last_d.version_id=v.id and last_d.scope='publisher_acceptance')
     and ((drishvara_editorial_private.is_administrator(d.actor_id) and d.assignment_authorization_ref=
       (select authorization_ref from drishvara_editorial_private.administrators where subject_id=d.actor_id)) or
       exists(select 1 from drishvara_editorial_private.assignments a where a.candidate_id=c.id and a.subject_id=d.actor_id
        and a.authorization_ref=d.assignment_authorization_ref and a.revoked_at is null and a.expires_at>now()))
     and (d.admin_exception is null or drishvara_editorial_private.is_administrator(d.actor_id))
    order by d.sequence desc limit 1) publisher_decision,
   (select jsonb_build_object('version_id',r.version_id,'content_hash',r.content_hash,'title',dv.title,'desk',dv.payload->>'desk','result',d.result)
    from drishvara_editorial_private.release_requests r join drishvara_editorial_private.deliveries d on d.release_request_id=r.id
    join drishvara_editorial_private.versions dv on dv.id=r.version_id
    where r.candidate_id=c.id and d.status='complete' and d.result->>'status'='article_committed'
    order by r.created_at desc,r.id desc limit 1) article_delivery,
   (select jsonb_build_object('version_id',r.version_id,'content_hash',r.content_hash,'result',d.result)
    from drishvara_editorial_private.release_requests r join drishvara_editorial_private.deliveries d on d.release_request_id=r.id
    where r.candidate_id=c.id and r.version_id=v.id and d.status='complete' and d.result->>'status'='eligible_for_daily_selection'
    order by r.created_at desc,r.id desc limit 1) word_delivery,
   (select jsonb_build_object('date_key',dc.date_key,'timezone',dc.timezone,'version_id',record->'editorial_binding'->>'version_id',
      'content_hash',record->'editorial_binding'->>'content_hash','publication_event_id',dc.last_event_id,
      'content',record->'reviewed_publication_copy'->'content',
      'title',(select pv.title from drishvara_editorial_private.versions pv where pv.id::text=record->'editorial_binding'->>'version_id'))
    from drishvara_word_private.date_claims dc join drishvara_word_private.assignment_snapshots s on s.proposal_id=dc.proposal_id
    join drishvara_word_private.events e on e.event_id=dc.last_event_id
    cross join lateral (select case when dc.state='correction' then e.payload->'corrected_record_snapshot'
      else s.snapshot->'approved_record_snapshot' end record) w
    where dc.state in ('publication','correction') and record->'editorial_binding'->>'candidate_id'=c.id::text
     and record->>'output_candidate_id'='editorial-word:'||c.id::text
    order by dc.date_key desc,dc.assignment_id limit 1) word_publication
  from drishvara_editorial_private.candidates c join drishvara_editorial_private.versions v on v.id=c.current_version_id
  where (p_after is null or c.id>p_after) and (p_kind='all' or c.kind=p_kind)
   and (p_desk='all' or p_view='live' or c.kind='article' and v.payload->>'desk'=p_desk) and drishvara_editorial_private.can_read(actor,c.id)
 ), reviewed as (
  select b.*,drishvara_editorial_private.workflow_stage(review_state,publisher_decision) review_stage,
   coalesce((select jsonb_agg(s order by s) from jsonb_array_elements_text(review_state->'required_scopes') s
    where s<>'publisher_acceptance' and not(review_state->'approved_scopes' ? s)
     and drishvara_editorial_private.has_capability(actor,b.kind,s)),'[]'::jsonb) pending_scopes from base b
 ), staged as (
  select b.*,case when review_stage='publishing' and kind='word' and word_delivery->>'version_id'=version_id::text
    and word_delivery->>'content_hash'=content_hash and word_delivery->'result'->>'reference'='editorial-word:'||id::text||'@'||version_id::text then 'daily_queue'
   when review_stage='publishing' and kind='article' and article_delivery->>'version_id'=version_id::text
    and article_delivery->>'content_hash'=content_hash then 'delivery' else review_stage end stage from reviewed b
 ), page as (
  select * from staged where p_view='all' or p_view='review' and
    (stage='review' and jsonb_array_length(pending_scopes)>0 or stage='corrections' and drishvara_editorial_private.can_revise(actor,id))
   or p_view='acceptance' and stage='acceptance' and drishvara_editorial_private.has_capability(actor,kind,'publisher_acceptance')
   or p_view='publishing' and stage='publishing' and drishvara_editorial_private.has_capability(actor,kind,'release')
   or p_view='delivery' and stage in ('delivery','daily_queue') and
    (drishvara_editorial_private.has_capability(actor,kind,'release') or drishvara_editorial_private.has_capability(actor,kind,'publisher_acceptance'))
   or p_view='live' and (article_delivery is not null and (p_desk='all' or article_delivery->>'desk'=p_desk)
    or p_desk='all' and word_publication is not null)
  order by id limit 11
 )
 select jsonb_build_object('ok',true,'items',coalesce((select jsonb_agg(to_jsonb(q) order by id) from (select * from page order by id limit 10)q),'[]'::jsonb),
  'next_cursor',case when (select count(*) from page)>10 then (select id from page order by id offset 9 limit 1) end,
  'public_output_allowed',false,'runtime_activation',false) into result;
 return result;
end;
$$;
revoke all on function drishvara_editorial_private.workflow_stage(jsonb,text),drishvara_editorial_private.require_editorial_handoff()
 from public,anon,authenticated,service_role;
revoke all on function public.editorial_workflow_queue(text,text,text,uuid) from public,anon,service_role;
grant execute on function public.editorial_workflow_queue(text,text,text,uuid) to authenticated;
commit;
