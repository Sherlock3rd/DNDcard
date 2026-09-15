-- Run within BEGIN/ROLLBACK, after the migration. No fixture survives.
insert into adventure_private.owner_links(id,key_hash,owner_id)
values('main',sha256(convert_to(repeat('a',64),'UTF8')),'25825073-befc-49ef-abda-33d8e73b084e')
on conflict(id) do update set key_hash=excluded.key_hash,revoked_at=null;
set local role anon;
do $$ declare before_all jsonb; after_all jsonb; part text; snap jsonb; rev integer; result jsonb; begin
 begin perform public.access_adventure(null);raise exception 'null key accepted';exception when insufficient_privilege then null;end;
 begin perform public.access_adventure(repeat('b',64));raise exception 'wrong key accepted';exception when insufficient_privilege then null;end;
 begin perform 1 from adventure_private.owner_links;raise exception 'key table readable';exception when insufficient_privilege then null;end;
 begin update public.map_saves set snapshot=snapshot;raise exception 'direct write allowed';exception when insufficient_privilege then null;end;
 begin perform adventure_private.refresh_archive();raise exception 'refresh accessible';exception when insufficient_privilege then null;end;
 if public.access_adventure(repeat('a',64))->>'status'<>'ready' then raise exception 'key check failed';end if;
 begin perform public.access_adventure(repeat('a',64),'other',1,'{}');raise exception 'unknown target allowed';exception when invalid_parameter_value then null;end;
 foreach part in array array['character','map','journal'] loop
  select snapshot into before_all from public.adventure_archive;
  snap:=before_all#>array['parts',part,'snapshot'];rev:=(before_all#>>array['parts',part,'revision'])::integer;
  result:=public.access_adventure(repeat('a',64),part,rev,snap);
  if result->>'status'<>'saved' or (result#>>'{row,revision}')::integer<>rev+1 then raise exception 'save failed %',part;end if;
  if result->'row' ? 'user_id' then raise exception 'identity leaked';end if;
  select snapshot into after_all from public.adventure_archive;
  if after_all#>array['parts',part,'snapshot']<>snap or (after_all->'parts')-part<>(before_all->'parts')-part then raise exception 'other module changed';end if;
  result:=public.access_adventure(repeat('a',64),part,rev,snap);
  if result->>'status'<>'conflict' then raise exception 'stale overwrite accepted';end if;
  if (select snapshot from public.adventure_archive)<>after_all then raise exception 'conflict changed data';end if;
  begin perform public.access_adventure(repeat('a',64),part,rev+1,'{}');raise exception 'bad snapshot accepted';exception when check_violation or invalid_parameter_value then null;end;
 end loop;
end $$;
reset role;
do $$ begin
 if not exists(select 1 from public.character_save_history h join public.character_saves s on h.user_id=s.user_id and h.revision=s.revision-1) then raise exception 'history missing';end if;
end $$;
update adventure_private.owner_links set revoked_at=now();
set local role anon;
do $$ begin
 begin perform public.access_adventure(repeat('a',64));raise exception 'revoked key accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
select 'PASS: anonymous denial, valid capability, three saves, CAS conflicts, complete archive, history, invalid payloads, revocation' as result;
