-- Publisher-authorized Admin subject reviews. No credentials, decisions, grants or publication are seeded.
begin;
alter table drishvara_editorial_private.decisions add column subject_review_exception jsonb;

create or replace function drishvara_editorial_private.effective_capability(p_actor uuid,p_kind text,p_scope text)
returns table(authorization_ref text,qualification_ref text)
language sql stable set search_path=pg_catalog as $$
 select q.authorization_ref,q.qualification_ref from (
 select c.authorization_ref,c.qualification_ref,0 priority from drishvara_editorial_private.capabilities c
 where c.subject_id=p_actor and c.kind=p_kind and c.scope=p_scope and c.revoked_at is null and c.expires_at>now()
 union all
 select a.authorization_ref,null::text,1 from drishvara_editorial_private.administrators a
 where a.subject_id=p_actor and drishvara_editorial_private.is_administrator(p_actor)
 and p_kind in ('word','article') and p_scope=any(array['intake','release']||drishvara_editorial_private.scopes(p_kind))
 ) q order by priority limit 1;
$$;

create function drishvara_editorial_private.admin_subject_scopes(p_actor uuid,p_kind text) returns text[]
language sql stable set search_path=pg_catalog as $$
 select coalesce(array_agg(s order by s),'{}'::text[]) from unnest(array['linguistic','iast','textual','philosophical']) s
 join lateral drishvara_editorial_private.effective_capability(p_actor,p_kind,s) g on true
 where p_kind='word' and drishvara_editorial_private.is_administrator(p_actor) and g.qualification_ref is null;
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
 and (not(d.scope=any(drishvara_editorial_private.admin_subject_scopes(d.actor_id,c.kind))) or
 (d.subject_review_exception->>'policy_ref'='drishvara-editorial-admin-subject-review@1'
 and d.subject_review_exception->'acknowledged'='true'::jsonb
 and length(trim(d.subject_review_exception->>'reason')) between 12 and 6000))
 )
 select jsonb_build_object('required_scopes',to_jsonb(drishvara_editorial_private.scopes(c.kind)),
 'approved_scopes',coalesce((select jsonb_agg(scope order by scope) from valid),'[]'::jsonb),
 'decision_refs',coalesce((select jsonb_agg(id order by scope) from valid),'[]'::jsonb),
 'reviews_complete',not exists(select 1 from unnest(drishvara_editorial_private.scopes(c.kind)) s where not exists(select 1 from valid v where v.scope=s)))
 from drishvara_editorial_private.candidates c where c.id=p_candidate;
$$;

-- Patch only the installed roles contract; refuse unexpected provider definitions.
do $$
declare definition text; old_text text; new_text text; replacements jsonb;
begin
 definition:=pg_get_functiondef('public.editorial_review_command(jsonb)'::regprocedure);
 replacements:=jsonb_build_array(
 jsonb_build_array('if action=''decision'' and p_command ? ''admin_exception'' then keys:=keys||array[''admin_exception'']; end if;',
 'if action=''decision'' and p_command ? ''admin_exception'' then keys:=keys||array[''admin_exception'']; end if;
 if action=''decision'' and p_command ? ''subject_review_exception'' then keys:=keys||array[''subject_review_exception'']; end if;'),
 jsonb_build_array('e.key not in (''payload'',''evidence_refs'',''admin_exception'')','e.key not in (''payload'',''evidence_refs'',''admin_exception'',''subject_review_exception'')'),
 jsonb_build_array('''self_review_policy_ref'',''drishvara-editorial-admin-self-review@1'',''publisher_delivery_enabled'',false,',
 '''self_review_policy_ref'',''drishvara-editorial-admin-self-review@1'',''subject_review_policy_ref'',''drishvara-editorial-admin-subject-review@1'',''publisher_delivery_enabled'',false,'),
 jsonb_build_array('''self_review_exception_required'',contributor and administrator,',
 '''self_review_exception_required'',contributor and administrator,
 ''subject_review_exception_scopes'',to_jsonb(drishvara_editorial_private.admin_subject_scopes(actor,c.kind)),'),
 jsonb_build_array('if not found then raise exception using errcode=''42501'',message=''review_scope_denied''; end if;',
 'if not found then raise exception using errcode=''42501'',message=''review_scope_denied''; end if;
 if p_command->>''scope''=any(drishvara_editorial_private.admin_subject_scopes(actor,c.kind)) then
   if jsonb_typeof(p_command->''subject_review_exception'') is distinct from ''object''
    or not(p_command->''subject_review_exception'' ?& array[''policy_ref'',''reason'',''acknowledged''])
    or exists(select 1 from jsonb_object_keys(p_command->''subject_review_exception'') k where k<>all(array[''policy_ref'',''reason'',''acknowledged'']))
    or p_command->''subject_review_exception''->>''policy_ref'' is distinct from ''drishvara-editorial-admin-subject-review@1''
    or p_command->''subject_review_exception''->''acknowledged'' is distinct from ''true''::jsonb
    or jsonb_typeof(p_command->''subject_review_exception''->''reason'') is distinct from ''string''
    or length(trim(p_command->''subject_review_exception''->>''reason'')) not between 12 and 6000 then
     raise exception ''explicit_admin_subject_review_required''; end if;
 elsif p_command ? ''subject_review_exception'' then raise exception ''unexpected_subject_review_exception''; end if;'),
 jsonb_build_array('qualification_ref,admin_exception,assignment_authorization_ref)', 'qualification_ref,admin_exception,assignment_authorization_ref,subject_review_exception)'),
 jsonb_build_array('p_command->''admin_exception'',assignment_ref) returning id', 'p_command->''admin_exception'',assignment_ref,p_command->''subject_review_exception'') returning id')
 );
 for old_text,new_text in select r->>0,r->>1 from jsonb_array_elements(replacements) r loop
   if (length(definition)-length(replace(definition,old_text,'')))/length(old_text)<>1 then
     raise exception 'editorial_subject_review_definition_mismatch'; end if;
   definition:=replace(definition,old_text,new_text);
 end loop;
 execute definition;
end;
$$;
revoke all on function drishvara_editorial_private.admin_subject_scopes(uuid,text) from public,anon,authenticated,service_role;
commit;
