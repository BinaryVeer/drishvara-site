-- Prepared only: do not apply before hosted-history reconciliation and approval.
-- Existing legacy tables/roles and PostgreSQL 17+ are required. No data/RLS changes.
begin;
set local search_path = pg_catalog;
do $hardening$
declare
  target_name text;
  target_oid oid;
  column_names text;
  role_name text;
  privilege_name text;
  service_before jsonb;
  service_after jsonb;
  service_snapshot_sql constant text := $snapshot$
    select jsonb_object_agg(k,v) from (
      select 'table:'||p as k,has_table_privilege('service_role',$1,p) as v
      from unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) as privileges(p)
      union all
      select 'column:'||a.attnum||':'||p,has_column_privilege('service_role',$1,a.attnum,p)
      from pg_catalog.pg_attribute a cross join unnest(array['SELECT','INSERT','UPDATE','REFERENCES']) as privileges(p)
      where a.attrelid=$1 and a.attnum>0 and not a.attisdropped
    ) permissions
  $snapshot$;
begin
  if current_setting('server_version_num')::integer < 170000 then
    raise exception 'word_hardening_requires_postgres_17';
  end if;
  foreach role_name in array array['anon','authenticated','service_role'] loop
    if not exists(select 1 from pg_catalog.pg_roles where rolname=role_name) then
      raise exception 'word_hardening_missing_role: %',role_name;
    end if;
  end loop;
  foreach target_name in array array['word_corpus','word_of_day_rotation_rules'] loop
    target_oid := to_regclass(format('public.%I',target_name));
    if target_oid is null or not exists(select 1 from pg_catalog.pg_class where oid=target_oid and relkind in ('r','p')) then
      raise exception 'word_hardening_missing_table: %',target_name;
    end if;
    execute service_snapshot_sql into service_before using target_oid;

    execute format('revoke insert,update,delete,truncate,references,trigger,maintain on table public.%I from public,anon,authenticated restrict',target_name);
    -- Table-level REVOKE alone does not remove explicit column grants.
    select string_agg(format('%I',attname),',' order by attnum) into column_names
      from pg_catalog.pg_attribute where attrelid=target_oid and attnum>0 and not attisdropped;
    if column_names is not null then
      execute format('revoke insert (%s),update (%s),references (%s) on table public.%I from public,anon,authenticated restrict',
        column_names,column_names,column_names,target_name);
    end if;

    foreach role_name in array array['anon','authenticated'] loop
      foreach privilege_name in array array['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'] loop
        if has_table_privilege(role_name,target_oid,privilege_name) then
          raise exception 'word_hardening_remaining_privilege: %.% %',role_name,target_name,privilege_name;
        end if;
      end loop;
      if exists(select 1 from pg_catalog.pg_attribute a cross join unnest(array['INSERT','UPDATE','REFERENCES']) as privileges(p)
        where a.attrelid=target_oid and a.attnum>0 and not a.attisdropped and has_column_privilege(role_name,target_oid,a.attnum,p)) then
        raise exception 'word_hardening_remaining_column_privilege: %.%',role_name,target_name;
      end if;
    end loop;
    execute service_snapshot_sql into service_after using target_oid;
    if service_after is distinct from service_before then
      raise exception 'word_hardening_server_access_changed: %',target_name;
    end if;
  end loop;
end
$hardening$;
commit;
