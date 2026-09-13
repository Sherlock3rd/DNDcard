-- Applied through Supabase apply_migration; mirrored here for review and recovery.
create table public.character_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null check (length(character_id) between 1 and 100),
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'object' and
    snapshot->>'format' = 'dndcard-snapshot' and snapshot->>'scope' = 'full' and
    snapshot->>'version' = '1' and
    jsonb_typeof(snapshot#>'{payload,manager}') = 'object' and
    jsonb_typeof(snapshot#>'{payload,state}') = 'object' and
    octet_length(snapshot::text) <= 2097152
  ),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, character_id)
);
create table public.character_save_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null,
  revision integer not null,
  snapshot jsonb not null,
  saved_at timestamptz not null,
  primary key (user_id, character_id, revision)
);
alter table public.character_saves enable row level security;
alter table public.character_save_history enable row level security;
revoke all on public.character_saves, public.character_save_history from anon, authenticated;
grant select, insert, update on public.character_saves to authenticated;
grant select, insert on public.character_save_history to authenticated;
create policy saves_select on public.character_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy saves_insert on public.character_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy saves_update on public.character_saves for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy history_select on public.character_save_history for select to authenticated using ((select auth.uid()) = user_id);
create policy history_insert on public.character_save_history for insert to authenticated with check ((select auth.uid()) = user_id);
create function public.version_character_save() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.user_id <> old.user_id or new.character_id <> old.character_id then
      raise exception 'Save identity cannot change';
    end if;
    insert into public.character_save_history(user_id, character_id, revision, snapshot, saved_at)
      values(old.user_id, old.character_id, old.revision, old.snapshot, old.updated_at);
    new.revision := old.revision + 1;
  else
    new.revision := 1;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.version_character_save() from public, anon, authenticated;
create trigger character_save_version before insert or update on public.character_saves
  for each row execute function public.version_character_save();
create function public.save_character(p_character_id text, p_expected_revision integer, p_snapshot jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  saved public.character_saves;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_expected_revision is null or p_expected_revision < 0 then raise exception 'Invalid revision'; end if;
  if p_expected_revision = 0 then
    insert into public.character_saves(user_id, character_id, snapshot)
      values(auth.uid(), p_character_id, p_snapshot)
      on conflict (user_id, character_id) do nothing returning * into saved;
  else
    update public.character_saves set snapshot = p_snapshot
      where user_id = auth.uid() and character_id = p_character_id and revision = p_expected_revision
      returning * into saved;
  end if;
  if saved.user_id is not null then
    return jsonb_build_object('status', 'saved', 'row', to_jsonb(saved));
  end if;
  select * into saved from public.character_saves where user_id = auth.uid() and character_id = p_character_id;
  return jsonb_build_object('status', 'conflict', 'row', case when saved.user_id is null then null else to_jsonb(saved) end);
end;
$$;
revoke all on function public.save_character(text, integer, jsonb) from public, anon;
grant execute on function public.save_character(text, integer, jsonb) to authenticated;
