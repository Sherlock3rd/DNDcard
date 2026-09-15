-- A revocable, 256-bit owner link authorizes only this adventure's three saves.
-- Provision its SHA-256 digest separately; never commit the actual link or key.
create table adventure_private.owner_links (
 id text primary key check(id='main'),
 key_hash bytea not null check(octet_length(key_hash)=32),
 owner_id uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 revoked_at timestamptz
);
alter table adventure_private.owner_links enable row level security;
revoke all on adventure_private.owner_links from public,anon,authenticated;

create function adventure_private.owner_link_access(p_key text,p_part text,p_expected_revision integer,p_snapshot jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare owner_id uuid; saved jsonb; result_status text := 'saved';
begin
 -- This capability is deliberately independent of an email session. No caller-supplied identity.
 if p_key is null or p_key !~ '^[a-f0-9]{64}$' then raise exception 'Owner link is invalid' using errcode='42501'; end if;
 select l.owner_id into owner_id from adventure_private.owner_links l
 where l.id='main' and l.revoked_at is null and l.key_hash=sha256(convert_to(p_key,'UTF8'));
 if owner_id is null then raise exception 'Owner link is invalid' using errcode='42501'; end if;
 if p_part is null then return jsonb_build_object('status','ready'); end if;
 if p_part not in ('character','map','journal') or p_expected_revision is null or p_expected_revision<1
 then raise exception 'Invalid save target or revision' using errcode='22023'; end if;
 if p_snapshot is null or jsonb_typeof(p_snapshot)<>'object' or octet_length(p_snapshot::text)>2097152
 then raise exception 'Invalid snapshot' using errcode='22023'; end if;
 if p_part='character' then
  if not ((p_snapshot->>'format'='dndcard-snapshot' and p_snapshot->>'scope'='full' and p_snapshot->>'version'='1'
   and jsonb_typeof(p_snapshot#>'{payload,manager}')='object' and jsonb_typeof(p_snapshot#>'{payload,state}')='object') is true)
  then raise exception 'Invalid character snapshot' using errcode='22023'; end if;
  update public.character_saves s set snapshot=p_snapshot
   where s.user_id=owner_id and s.character_id='gandalf' and s.revision=p_expected_revision
   returning jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved;
  if saved is null then result_status:='conflict';select jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved
   from public.character_saves s where s.user_id=owner_id and s.character_id='gandalf';end if;
 elsif p_part='map' then
  update public.map_saves s set snapshot=p_snapshot
   where s.user_id=owner_id and s.map_id='faerun-3.5' and s.revision=p_expected_revision
   returning jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved;
  if saved is null then result_status:='conflict';select jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved
   from public.map_saves s where s.user_id=owner_id and s.map_id='faerun-3.5';end if;
 else
  update public.journal_saves s set snapshot=p_snapshot
   where s.user_id=owner_id and s.journal_id='gandalf-adventures' and s.revision=p_expected_revision
   returning jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved;
  if saved is null then result_status:='conflict';select jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved
   from public.journal_saves s where s.user_id=owner_id and s.journal_id='gandalf-adventures';end if;
 end if;
 return jsonb_build_object('status',result_status,'row',saved);
end;$$;
revoke all on function adventure_private.owner_link_access(text,text,integer,jsonb) from public,anon,authenticated;
-- Only this key-checking function is exposed through the invoker wrapper.
grant usage on schema adventure_private to anon,authenticated;
grant execute on function adventure_private.owner_link_access(text,text,integer,jsonb) to anon,authenticated;
create function public.access_adventure(p_key text,p_part text default null,p_expected_revision integer default null,p_snapshot jsonb default null)
returns jsonb language sql security invoker set search_path='' as $$
 select adventure_private.owner_link_access(p_key,p_part,p_expected_revision,p_snapshot);
$$;
revoke all on function public.access_adventure(text,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.access_adventure(text,text,integer,jsonb) to anon,authenticated;
