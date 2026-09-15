-- Optional explicit styles. Missing styles retain the shared frontend default.
create or replace function public.valid_board_style(s jsonb,kind text) returns boolean
language plpgsql immutable set search_path='' as $$
declare k text; allowed text[];
begin
 if jsonb_typeof(s) is distinct from 'object' or kind not in ('node','edge') or kind is null then return false;end if;
 allowed:=case when kind='node' then array['color','border','text','shape'] else array['color','width','pattern'] end;
 for k in select jsonb_object_keys(s) loop
  if not (k=any(allowed)) then return false;end if;
  if k in ('color','border','text') and not ((jsonb_typeof(s->k)='string' and s->>k ~ '^#[0-9a-fA-F]{6}$') is true) then return false;end if;
 end loop;
 if kind='node' and s ? 'shape' and not ((jsonb_typeof(s->'shape')='string' and s->>'shape' in ('arched','square','rounded')) is true) then return false;end if;
 if kind='edge' then
  if s ? 'pattern' and not ((jsonb_typeof(s->'pattern')='string' and s->>'pattern' in ('solid','dashed','dotted')) is true) then return false;end if;
  if s ? 'width' and not ((jsonb_typeof(s->'width')='number' and (s->>'width')::numeric between 1 and 8 and (s->>'width')::numeric=trunc((s->>'width')::numeric)) is true) then return false;end if;
 end if;
 return true;
exception when others then return false;end;$$;
revoke all on function public.valid_board_style(jsonb,text) from public;
grant execute on function public.valid_board_style(jsonb,text) to anon,authenticated,service_role;

create or replace function public.valid_board_snapshot(s jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare z jsonb; zone_ids text[]:='{}'; n jsonb; e jsonb; f text; ids text[]:='{}'; edge_ids text[]:='{}'; pairs text[]:='{}'; pair text;
begin
 if not ((jsonb_typeof(s)='object' and s->>'version'='1' and s->>'boardId'='black-tower' and jsonb_typeof(s->'nodes')='array' and jsonb_typeof(s->'edges')='array' and octet_length(s::text)<=2097152) is true) then return false;end if;
 if jsonb_array_length(s->'nodes')>500 or jsonb_array_length(s->'edges')>2000 then return false;end if;
 for n in select value from jsonb_array_elements(s->'nodes') loop
  if not ((jsonb_typeof(n)='object' and jsonb_typeof(n->'id')='string' and length(n->>'id') between 1 and 100 and jsonb_typeof(n->'name')='string' and length(trim(n->>'name')) between 1 and 100 and n->>'kind' in ('person','group','place') and jsonb_typeof(n->'x')='number' and (n->>'x')::numeric between 100 and 1700 and jsonb_typeof(n->'y')='number' and (n->>'y')::numeric between 110 and 1090) is true) then return false;end if;
  foreach f in array array['race','role','status','notes','appearance','portrait'] loop
   if not ((jsonb_typeof(n->f)='string' and length(n->>f)<=case f when 'notes' then 4000 when 'appearance' then 2000 when 'portrait' then 500 else 100 end) is true) then return false;end if;
  end loop;
  if n->>'portrait'<>'' and (n->>'portrait' !~ '^assets/images/[a-zA-Z0-9_./-]+$' or position('..' in n->>'portrait')>0) then return false;end if;
  if n ? 'style' and not public.valid_board_style(n->'style','node') then return false;end if;
  if n->>'id'=any(ids) then return false;end if;ids:=array_append(ids,n->>'id');
 end loop;
 for e in select value from jsonb_array_elements(s->'edges') loop
  if not ((jsonb_typeof(e)='object' and jsonb_typeof(e->'id')='string' and length(e->>'id') between 1 and 100 and jsonb_typeof(e->'from')='string' and e->>'from'=any(ids) and jsonb_typeof(e->'to')='string' and e->>'to'=any(ids) and e->>'from'<>e->>'to' and jsonb_typeof(e->'note')='string' and length(e->>'note')<=2000) is true) then return false;end if;
  if e ? 'style' and not public.valid_board_style(e->'style','edge') then return false;end if;
  pair:=least(e->>'from',e->>'to')||'|'||greatest(e->>'from',e->>'to');
  if e->>'id'=any(edge_ids) or pair=any(pairs) then return false;end if;edge_ids:=array_append(edge_ids,e->>'id');pairs:=array_append(pairs,pair);
 end loop;
 if s ? 'zones' then
  if jsonb_typeof(s->'zones')<>'array' or jsonb_array_length(s->'zones')>40 then return false;end if;
  for z in select value from jsonb_array_elements(s->'zones') loop
   if not ((jsonb_typeof(z)='object' and jsonb_typeof(z->'id')='string' and length(trim(z->>'id')) between 1 and 100 and jsonb_typeof(z->'name')='string' and length(trim(z->>'name')) between 1 and 100 and z->>'tone' in ('sage','amber','lilac') and jsonb_typeof(z->'x')='number' and jsonb_typeof(z->'y')='number' and jsonb_typeof(z->'width')='number' and jsonb_typeof(z->'height')='number' and (z->>'x')::numeric>=0 and (z->>'y')::numeric>=0 and (z->>'width')::numeric>=240 and (z->>'height')::numeric>=200 and (z->>'x')::numeric+(z->>'width')::numeric<=1800 and (z->>'y')::numeric+(z->>'height')::numeric<=1200) is true) then return false;end if;
   if z->>'id'=any(zone_ids) then return false;end if;zone_ids:=array_append(zone_ids,z->>'id');
  end loop;
 end if;
return true;
exception when others then return false;end;$$;


-- Older clients strip unknown fields: preserve style by stable ID when absent.
-- Explicit defaults from the new editor remain an intentional reset.
create function adventure_private.keep_board_styles() returns trigger
language plpgsql set search_path='' as $$
declare part text; rebuilt jsonb;
begin
 foreach part in array array['nodes','edges'] loop
  if jsonb_typeof(new.snapshot->part)='array' then
   select coalesce(jsonb_agg(case when not (incoming.value ? 'style') and previous.value ? 'style' then jsonb_set(incoming.value,'{style}',previous.value->'style') else incoming.value end order by incoming.ordinality),'[]'::jsonb)
   into rebuilt from jsonb_array_elements(new.snapshot->part) with ordinality incoming(value,ordinality)
   left join lateral (select value from jsonb_array_elements(old.snapshot->part) where value->>'id'=incoming.value->>'id' limit 1) previous on true;
   new.snapshot:=jsonb_set(new.snapshot,array[part],rebuilt);
  end if;
 end loop;
 return new;
end;$$;
revoke all on function adventure_private.keep_board_styles() from public,anon,authenticated;
create trigger board_keep_styles before update on public.board_saves for each row execute function adventure_private.keep_board_styles();
