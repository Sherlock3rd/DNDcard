CREATE OR REPLACE FUNCTION public.valid_map_snapshot(s jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare p jsonb; ids text[] := '{}'; travelers integer := 0;
begin
  if not ((jsonb_typeof(s)='object' and s->>'version'='1' and s->>'mapId'='faerun-3.5'
    and jsonb_typeof(s->'pieces')='array' and octet_length(s::text)<=1048576) is true) then return false; end if;
  if jsonb_array_length(s->'pieces')>2000 then return false; end if;
  for p in select value from jsonb_array_elements(s->'pieces') loop
    if not ((jsonb_typeof(p)='object' and jsonb_typeof(p->'id')='string' and length(p->>'id') between 1 and 100
      and jsonb_typeof(p->'name')='string' and length(trim(p->>'name')) between 1 and 60
      and p->>'kind' in ('castle','watchtower','fortress','village','windmill','port','mine','lumber','crystal','event','battle','treasure','traveler')
      and jsonb_typeof(p->'x')='number' and (p->>'x')::numeric between 0 and 4763
      and jsonb_typeof(p->'y')='number' and (p->>'y')::numeric between 0 and 3185) is true) then return false; end if;
    if p ? 'notes' and not ((jsonb_typeof(p->'notes')='string' and length(p->>'notes')<=4000) is true) then return false; end if;
    if p->>'id'=any(ids) then return false; end if;
    ids:=array_append(ids,p->>'id');
    if p->>'kind'='traveler' then travelers:=travelers+1; end if;
  end loop;
  return travelers<=1;
exception when others then return false;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.version_map_save()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
 if tg_op='UPDATE' then
  if new.user_id<>old.user_id or new.map_id<>old.map_id then raise exception 'Map identity cannot change'; end if;
  -- Older open pages omit notes. Preserve them by stable piece ID; explicit empty text clears them.
 if jsonb_typeof(new.snapshot->'pieces')='array' then
  new.snapshot:=jsonb_set(new.snapshot,'{pieces}',coalesce((
   select jsonb_agg(case when not (p ? 'notes') and old_piece ? 'notes'
    then p||jsonb_build_object('notes',old_piece->'notes') else p end order by ord)
   from jsonb_array_elements(new.snapshot->'pieces') with ordinality n(p,ord)
   left join lateral (select v as old_piece from jsonb_array_elements(old.snapshot->'pieces') v where v->>'id'=p->>'id' limit 1) o on true
  ),'[]'::jsonb));
 end if;
 insert into public.map_save_history values(old.user_id,old.map_id,old.revision,old.snapshot,old.updated_at);
  new.revision:=old.revision+1;
 else new.revision:=1;
 end if;
 new.updated_at:=clock_timestamp();return new;
end;
$function$
;
