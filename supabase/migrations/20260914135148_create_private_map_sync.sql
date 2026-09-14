-- Private map records are independent of character snapshots.
create function public.valid_map_snapshot(s jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
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
    if p->>'id'=any(ids) then return false; end if;
    ids:=array_append(ids,p->>'id');
    if p->>'kind'='traveler' then travelers:=travelers+1; end if;
  end loop;
  return travelers<=1;
exception when others then return false;
end;
$$;
revoke all on function public.valid_map_snapshot(jsonb) from public,anon;
grant execute on function public.valid_map_snapshot(jsonb) to authenticated;
create table public.map_saves (
 user_id uuid not null references auth.users(id) on delete cascade,
 map_id text not null check(map_id='faerun-3.5'),
 snapshot jsonb not null check(public.valid_map_snapshot(snapshot)),
 revision integer not null default 1 check(revision>0),
 updated_at timestamptz not null default now(),
 primary key(user_id,map_id)
);
create table public.map_save_history (
 user_id uuid not null references auth.users(id) on delete cascade,
 map_id text not null,
 revision integer not null,
 snapshot jsonb not null,
 saved_at timestamptz not null,
 primary key(user_id,map_id,revision)
);
alter table public.map_saves enable row level security;
alter table public.map_save_history enable row level security;
revoke all on public.map_saves,public.map_save_history from anon,authenticated;
grant select,insert,update on public.map_saves to authenticated;
grant select,insert on public.map_save_history to authenticated;
create policy map_select on public.map_saves for select to authenticated using((select auth.uid())=user_id);
create policy map_insert on public.map_saves for insert to authenticated with check((select auth.uid())=user_id);
create policy map_update on public.map_saves for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy map_history_select on public.map_save_history for select to authenticated using((select auth.uid())=user_id);
create policy map_history_insert on public.map_save_history for insert to authenticated with check((select auth.uid())=user_id);
create function public.version_map_save() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='UPDATE' then
  if new.user_id<>old.user_id or new.map_id<>old.map_id then raise exception 'Map identity cannot change'; end if;
  insert into public.map_save_history values(old.user_id,old.map_id,old.revision,old.snapshot,old.updated_at);
  new.revision:=old.revision+1;
 else new.revision:=1;
 end if;
 new.updated_at:=clock_timestamp();return new;
end;
$$;
revoke all on function public.version_map_save() from public,anon,authenticated;
create trigger map_save_version before insert or update on public.map_saves for each row execute function public.version_map_save();
create function public.save_map(p_map_id text,p_expected_revision integer,p_snapshot jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare saved public.map_saves;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_expected_revision is null or p_expected_revision<0 then raise exception 'Invalid revision'; end if;
 if p_expected_revision=0 then
  insert into public.map_saves(user_id,map_id,snapshot) values(auth.uid(),p_map_id,p_snapshot)
   on conflict(user_id,map_id) do nothing returning * into saved;
 else
  update public.map_saves set snapshot=p_snapshot where user_id=auth.uid() and map_id=p_map_id and revision=p_expected_revision returning * into saved;
 end if;
 if saved.user_id is not null then return jsonb_build_object('status','saved','row',to_jsonb(saved)); end if;
 select * into saved from public.map_saves where user_id=auth.uid() and map_id=p_map_id;
 return jsonb_build_object('status','conflict','row',case when saved.user_id is null then null else to_jsonb(saved) end);
end;
$$;
revoke all on function public.save_map(text,integer,jsonb) from public,anon;
grant execute on function public.save_map(text,integer,jsonb) to authenticated;
