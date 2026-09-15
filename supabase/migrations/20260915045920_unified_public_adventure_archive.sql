-- Only the existing owner's game data is published. Auth tables and histories stay private.
do $$ begin
 if (select count(*) from auth.users)<>1 or not exists(select 1 from auth.users where id='25825073-befc-49ef-abda-33d8e73b084e') then raise exception 'Owner identity changed; recheck before migration'; end if;
end $$;
create schema if not exists adventure_private;
revoke all on schema adventure_private from public,anon,authenticated;
create table public.adventure_archive (
 id text primary key check(id='main'),
 revision bigint not null check(revision>0),
 updated_at timestamptz not null,
 snapshot jsonb not null
);
alter table public.adventure_archive enable row level security;
grant select on public.adventure_archive to anon,authenticated;
revoke insert,update,delete on public.adventure_archive from anon,authenticated;
create policy "Published adventure is readable" on public.adventure_archive for select to anon,authenticated using(id='main');

create function adventure_private.refresh_archive() returns void
language plpgsql security definer set search_path='' as $$
declare owner_id uuid := '25825073-befc-49ef-abda-33d8e73b084e'; parts jsonb; old_row public.adventure_archive; next_revision bigint; stamp timestamptz;
begin
 perform pg_advisory_xact_lock(7315091501);
 select jsonb_build_object(
  'character',(select jsonb_build_object('revision',revision,'updatedAt',updated_at,'snapshot',snapshot) from public.character_saves where user_id=owner_id and character_id='gandalf'),
  'map',(select jsonb_build_object('revision',revision,'updatedAt',updated_at,'snapshot',snapshot) from public.map_saves where user_id=owner_id and map_id='faerun-3.5'),
  'journal',(select jsonb_build_object('revision',revision,'updatedAt',updated_at,'snapshot',snapshot) from public.journal_saves where user_id=owner_id and journal_id='gandalf-adventures')
 ) into parts;
 if parts->'character'='null'::jsonb or parts->'map'='null'::jsonb or parts->'journal'='null'::jsonb then
  raise exception 'Incomplete owner archive; refusing to publish defaults';
 end if;
 select * into old_row from public.adventure_archive where id='main';
 if old_row.snapshot->'parts'=parts then return; end if;
 next_revision:=coalesce(old_row.revision,0)+1;stamp:=clock_timestamp();
 insert into public.adventure_archive values('main',next_revision,stamp,jsonb_build_object(
 'format','dndcard-adventure','version',1,'revision',next_revision,'updatedAt',stamp,'parts',parts,
 'assets',jsonb_build_object('repository','Sherlock3rd/DNDcard','base','./','note','Published portraits, relationship network, maps and illustrations remain versioned repository assets.')))
 on conflict(id) do update set revision=excluded.revision,updated_at=excluded.updated_at,snapshot=excluded.snapshot;
end $$;
revoke all on function adventure_private.refresh_archive() from public,anon,authenticated;
create function adventure_private.archive_after_save() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.user_id='25825073-befc-49ef-abda-33d8e73b084e'::uuid then perform adventure_private.refresh_archive(); end if;
 return new;
end $$;
revoke all on function adventure_private.archive_after_save() from public,anon,authenticated;
create trigger publish_character_archive after insert or update on public.character_saves for each row execute function adventure_private.archive_after_save();
create trigger publish_map_archive after insert or update on public.map_saves for each row execute function adventure_private.archive_after_save();
create trigger publish_journal_archive after insert or update on public.journal_saves for each row execute function adventure_private.archive_after_save();
create policy "Only archive owner" on public.character_saves as restrictive for all to authenticated using(user_id='25825073-befc-49ef-abda-33d8e73b084e'::uuid) with check(user_id='25825073-befc-49ef-abda-33d8e73b084e'::uuid);
create policy "Only archive owner" on public.map_saves as restrictive for all to authenticated using(user_id='25825073-befc-49ef-abda-33d8e73b084e'::uuid) with check(user_id='25825073-befc-49ef-abda-33d8e73b084e'::uuid);
create policy "Only archive owner" on public.journal_saves as restrictive for all to authenticated using(user_id='25825073-befc-49ef-abda-33d8e73b084e'::uuid) with check(user_id='25825073-befc-49ef-abda-33d8e73b084e'::uuid);
select adventure_private.refresh_archive();
