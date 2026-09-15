-- Update only explicitly requested portraits and known place associations.
-- Lock and patch the latest row, never replace it with a captured snapshot.
begin;
do $$ declare original jsonb; rebuilt jsonb:='[]'; n jsonb; previous jsonb; target text; raven text; iron text; party text; other_before jsonb; map_snapshot jsonb; begin
 select snapshot into strict original from public.board_saves where board_id='black-tower' for update;
 select snapshot into strict map_snapshot from public.map_saves where map_id='faerun-3.5' for share;
 select (snapshot->'parts')-'board' into other_before from public.adventure_archive where id='main';
 select p->>'id' into strict raven from jsonb_array_elements(map_snapshot->'pieces') p where p->>'name'='渡鸦镇';
 select p->>'id' into strict iron from jsonb_array_elements(map_snapshot->'pieces') p where p->>'name'='铁环镇';
 select p->>'id' into strict party from jsonb_array_elements(map_snapshot->'pieces') p where p->>'kind'='traveler';
 for n in select value from jsonb_array_elements(original->'nodes') loop
  previous:=n;target:=null;
  if n->>'portrait'='' and n->>'id'='7e4c656c-1f49-415b-b88c-11f666bcc9e6' then n:=jsonb_set(n,'{portrait}','"assets/images/caseboard-v2/blue-wizard.png"');end if;
  if n->>'portrait'='' and n->>'id'='1ae35a91-d16f-454a-8047-e1992033b047' then n:=jsonb_set(n,'{portrait}','"assets/images/caseboard-v2/yazan.png"');end if;
  if n->>'id' in ('gandalf','sairen','shire','zuo','mura','feiyi','aili') then target:=party;
  elsif n->>'id' in ('iron-village','chief','pazu','maruk','morris') then target:=iron;
  elsif n->>'id' in ('raven-town','raven-militia-priest','raven-militia-captain','raven-mayor','raven-secretary','raven-former-captain','raven-necromancer','raven-hyde-father','raven-hyde-grandson','raven-hyde-grandfather','raven-tavern-husband','raven-tavern-wife','raven-smith-apprentice','raven-merchant') then target:=raven;end if;
  if target is not null and not (n ? 'mapPieceId') then n:=jsonb_set(n,'{mapPieceId}',to_jsonb(target));end if;
  if (n-'portrait'-'mapPieceId')<>(previous-'portrait'-'mapPieceId') then raise exception 'Unrelated person data changed';end if;
  rebuilt:=rebuilt||jsonb_build_array(n);
 end loop;
 rebuilt:=jsonb_set(original,'{nodes}',rebuilt);
 if rebuilt<>original then update public.board_saves set snapshot=rebuilt,revision=revision+1,updated_at=now() where board_id='black-tower';end if;
 if (select snapshot from public.board_saves where board_id='black-tower')<>rebuilt then raise exception 'Readback mismatch';end if;
 if (select snapshot#>'{parts,board,snapshot}' from public.adventure_archive where id='main')<>rebuilt then raise exception 'Archive mismatch';end if;
 if (select (snapshot->'parts')-'board' from public.adventure_archive where id='main') is distinct from other_before then raise exception 'Other archive parts changed';end if;
end;$$;
commit;
select revision,jsonb_array_length(snapshot->'nodes') as nodes,
 (select count(*) from jsonb_array_elements(snapshot->'nodes') n where n->>'mapPieceId' is not null) as linked,
 (select count(*) from jsonb_array_elements(snapshot->'nodes') n where n->>'kind'='person' and n->>'portrait'='') as missing_portraits
from public.board_saves where board_id='black-tower';
