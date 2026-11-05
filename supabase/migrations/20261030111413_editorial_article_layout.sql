-- Private, declarative Article placement. This migration does not publish or seed content.
begin;
do $$
declare definition text;
begin
 definition:=pg_get_functiondef('drishvara_editorial_private.validate_image_uploads(jsonb)'::regprocedure);
 if position('jsonb_array_length(p_media)>1' in definition)=0 then raise exception 'editorial_image_definition_mismatch'; end if;
 execute replace(definition,'jsonb_array_length(p_media)>1','jsonb_array_length(p_media)>8');
end;
$$;

create function drishvara_editorial_private.layout_text(v jsonb,lim integer) returns boolean
language sql immutable set search_path=pg_catalog as $$
 select coalesce(jsonb_typeof(v)='string' and length(trim(v#>>'{}')) between 1 and lim,false);
$$;
create function drishvara_editorial_private.layout_keys(v jsonb,keys text[]) returns boolean
language plpgsql immutable set search_path=pg_catalog as $$
begin
 if jsonb_typeof(v) is distinct from 'object' then return false; end if;
 return v ?& keys and not exists(select 1 from jsonb_object_keys(v) k where not(k=any(keys)));
end;
$$;
create function drishvara_editorial_private.validate_article_layout(p jsonb) returns void
language plpgsql set search_path=pg_catalog as $$
declare l jsonb:=p->'layout'; o jsonb; s jsonb; row_data jsonb; m jsonb; ref jsonb;
 n integer; idx integer; pos integer; heroes integer:=0; ids text[]:='{}'; media_used integer[]:='{}'; headings integer[]:='{}'; keys text[];
begin
 if jsonb_typeof(p->'media') is distinct from 'array' then raise exception 'invalid_article_layout'; end if;
 if not(p ? 'layout') then
  if jsonb_array_length(p->'media')>1 then raise exception 'article_layout_required'; end if;
  return;
 end if;
 if not drishvara_editorial_private.layout_keys(l,array['contract_version','sections','objects']) or
  l->>'contract_version' is distinct from 'drishvara.article-layout.v1' or
  jsonb_typeof(l->'sections') is distinct from 'array' or jsonb_typeof(l->'objects') is distinct from 'array' or
  jsonb_typeof(p->'sources') is distinct from 'array' or jsonb_typeof(p->'body') is distinct from 'string' then raise exception 'invalid_article_layout'; end if;
 if jsonb_array_length(l->'sections')>40 or jsonb_array_length(l->'objects')>16 or jsonb_array_length(p->'media')>8 then raise exception 'invalid_article_layout'; end if;
 select count(*) into n from regexp_split_to_table(trim(p->>'body'),E'\n\\s*\n') t where length(trim(t))>0;
 for s in select value from jsonb_array_elements(l->'sections') loop
  if not drishvara_editorial_private.layout_keys(s,array['heading','before_paragraph']) or
   not drishvara_editorial_private.layout_text(s->'heading',180) or jsonb_typeof(s->'before_paragraph') is distinct from 'number' or
   s->>'before_paragraph' !~ '^[0-9]{1,6}$' then raise exception 'invalid_article_layout'; end if;
  pos:=(s->>'before_paragraph')::integer;
  if pos<1 or pos>n or pos=any(headings) then raise exception 'invalid_article_layout'; end if;
  headings:=array_append(headings,pos);
 end loop;
 for o in select value from jsonb_array_elements(l->'objects') loop
  keys:=array['id','type','after_paragraph','width','title','caption','source_refs'];
  case o->>'type'
   when 'image' then keys:=keys||array['media_index','visual_kind'];
   when 'table' then keys:=keys||array['columns','rows'];
   when 'takeaways' then keys:=keys||array['items'];
   when 'bar_chart' then keys:=keys||array['unit','labels','values'];
   else raise exception 'invalid_article_layout';
  end case;
  if not drishvara_editorial_private.layout_keys(o,keys) or o->>'id' !~ '^[a-z][a-z0-9-]{0,39}$' or
   jsonb_typeof(o->'id') is distinct from 'string' or o->>'id'=any(ids) or
   o->>'width' not in ('reading','wide') or jsonb_typeof(o->'width') is distinct from 'string' or
   not drishvara_editorial_private.layout_text(o->'title',180) or not drishvara_editorial_private.layout_text(o->'caption',1000) or
   jsonb_typeof(o->'after_paragraph') is distinct from 'number' or o->>'after_paragraph' !~ '^[0-9]{1,6}$' or
   jsonb_typeof(o->'source_refs') is distinct from 'array' then raise exception 'invalid_article_layout'; end if;
  ids:=array_append(ids,o->>'id'); pos:=(o->>'after_paragraph')::integer;
  if pos>n or jsonb_array_length(o->'source_refs') not between 1 and 50 or
   (select count(*)<>count(distinct v) from jsonb_array_elements(o->'source_refs') v) then raise exception 'invalid_article_layout'; end if;
  for ref in select value from jsonb_array_elements(o->'source_refs') loop
   if jsonb_typeof(ref) is distinct from 'number' or ref#>>'{}' !~ '^[0-9]{1,6}$' then raise exception 'invalid_article_layout'; end if;
   if (ref#>>'{}')::integer not between 1 and jsonb_array_length(p->'sources') then raise exception 'invalid_article_layout'; end if;
  end loop;
  if o->>'type'='image' then
   if jsonb_typeof(o->'media_index') is distinct from 'number' or o->>'media_index' !~ '^[0-7]$' or
    o->>'visual_kind' not in ('photograph','infographic','diagram','chart','map') or jsonb_typeof(o->'visual_kind') is distinct from 'string' then raise exception 'invalid_article_layout'; end if;
   idx:=(o->>'media_index')::integer;
   if idx>=jsonb_array_length(p->'media') or idx=any(media_used) then raise exception 'invalid_article_layout'; end if;
   media_used:=array_append(media_used,idx); m:=p->'media'->idx;
   if not drishvara_editorial_private.layout_text(m->'alt',2000) or not drishvara_editorial_private.layout_text(m->'attribution',2000) or
    not drishvara_editorial_private.layout_text(m->'source_url',2500) or m->>'source_url' !~ '^https://[^/@?#]+([/?#].*)?$' or
    not drishvara_editorial_private.layout_text(m->'url',2500) or not(m->>'url' ~ '^https://[^/@?#]+([/?#].*)?$' or
     m->>'url' ~ '^/assets/[a-zA-Z0-9_./-]+$' and position('..' in m->>'url')=0) then raise exception 'invalid_article_layout'; end if;
   if pos=0 then heroes:=heroes+1; end if;
   if heroes>1 then raise exception 'invalid_article_layout'; end if;
  else
   if pos=0 then raise exception 'invalid_article_layout'; end if;
   if o->>'type'='takeaways' then
    if jsonb_typeof(o->'items') is distinct from 'array' then raise exception 'invalid_article_layout'; end if;
    if jsonb_array_length(o->'items') not between 1 and 12 or exists(select 1 from jsonb_array_elements(o->'items') v where not drishvara_editorial_private.layout_text(v,500)) then raise exception 'invalid_article_layout'; end if;
   elsif o->>'type'='table' then
    if jsonb_typeof(o->'columns') is distinct from 'array' or jsonb_typeof(o->'rows') is distinct from 'array' then raise exception 'invalid_article_layout'; end if;
    if jsonb_array_length(o->'columns') not between 1 and 6 or jsonb_array_length(o->'rows') not between 1 and 30 or
     exists(select 1 from jsonb_array_elements(o->'columns') v where not drishvara_editorial_private.layout_text(v,100)) then raise exception 'invalid_article_layout'; end if;
    for row_data in select value from jsonb_array_elements(o->'rows') loop
     if jsonb_typeof(row_data) is distinct from 'array' then raise exception 'invalid_article_layout'; end if;
     if jsonb_array_length(row_data)<>jsonb_array_length(o->'columns') or exists(select 1 from jsonb_array_elements(row_data) v where not drishvara_editorial_private.layout_text(v,500)) then raise exception 'invalid_article_layout'; end if;
    end loop;
   else
    if not drishvara_editorial_private.layout_text(o->'unit',60) or jsonb_typeof(o->'labels') is distinct from 'array' or jsonb_typeof(o->'values') is distinct from 'array' then raise exception 'invalid_article_layout'; end if;
    if jsonb_array_length(o->'labels') not between 1 and 12 or jsonb_array_length(o->'labels')<>jsonb_array_length(o->'values') or
     exists(select 1 from jsonb_array_elements(o->'labels') v where not drishvara_editorial_private.layout_text(v,100)) or
     exists(select 1 from jsonb_array_elements(o->'values') v where jsonb_typeof(v)<>'number') then raise exception 'invalid_article_layout'; end if;
    if exists(select 1 from jsonb_array_elements_text(o->'values') v where v::numeric<0 or v::numeric>1000000000000) or
     not exists(select 1 from jsonb_array_elements_text(o->'values') v where v::numeric>0) then raise exception 'invalid_article_layout'; end if;
   end if;
  end if;
 end loop;
 if cardinality(media_used)<>jsonb_array_length(p->'media') then raise exception 'invalid_article_layout'; end if;
end;
$$;
create function drishvara_editorial_private.check_article_layout() returns trigger
language plpgsql set search_path=pg_catalog as $$
begin
 if exists(select 1 from drishvara_editorial_private.candidates c where c.id=new.candidate_id and c.kind='article') then
  perform drishvara_editorial_private.validate_article_layout(new.payload);
 end if;
 return new;
end;
$$;
create trigger validate_article_layout before insert on drishvara_editorial_private.versions
 for each row execute function drishvara_editorial_private.check_article_layout();
revoke all on function drishvara_editorial_private.layout_text(jsonb,integer),drishvara_editorial_private.layout_keys(jsonb,text[]),
 drishvara_editorial_private.validate_article_layout(jsonb),drishvara_editorial_private.check_article_layout() from public,anon,authenticated,service_role;
commit;
