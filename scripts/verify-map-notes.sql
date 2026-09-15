-- Execute with BEGIN / ROLLBACK. Never leave verification text in player saves.
set local role authenticated;
select set_config('request.jwt.claim.sub','25825073-befc-49ef-abda-33d8e73b084e',true);
do $$ declare s jsonb; r integer; answer jsonb; old_parts jsonb; begin
 select snapshot,revision into s,r from public.map_saves where map_id='faerun-3.5';
 select snapshot->'parts' into old_parts from public.adventure_archive;
 s:=jsonb_set(s,'{pieces,0,notes}',to_jsonb(E'第一行\n第二行'::text));
 answer:=public.save_map('faerun-3.5',r,s);
 if answer->>'status'<>'saved' or answer#>>'{row,snapshot,pieces,0,notes}'<>E'第一行\n第二行' then raise exception 'notes did not roundtrip';end if;
 r:=(answer#>>'{row,revision}')::integer;
 answer:=public.save_map('faerun-3.5',r,s#-'{pieces,0,notes}');
 if answer#>>'{row,snapshot,pieces,0,notes}'<>E'第一行\n第二行' then raise exception 'old client erased notes';end if;
 r:=(answer#>>'{row,revision}')::integer;
 s:=jsonb_set(s,'{pieces,0,notes}','""');answer:=public.save_map('faerun-3.5',r,s);
 if answer#>>'{row,snapshot,pieces,0,notes}'<>'' then raise exception 'explicit clear failed';end if;
 r:=(answer#>>'{row,revision}')::integer;
 begin perform public.save_map('faerun-3.5',r,jsonb_set(s,'{pieces,0,notes}',to_jsonb(repeat('x',4001))));raise exception 'oversize accepted';exception when check_violation then null;end;
 begin perform public.save_map('faerun-3.5',r,jsonb_set(s,'{pieces,0,notes}','null'));raise exception 'invalid type accepted';exception when check_violation then null;end;
 if (select (snapshot->'parts')-'map' from public.adventure_archive)<>old_parts-'map' then raise exception 'other parts modified';end if;
 if (select snapshot#>>'{parts,map,snapshot,pieces,0,notes}' from public.adventure_archive)<>'' then raise exception 'archive missing notes';end if;
end $$;
reset role;
select 'PASS: multiline notes, old client preservation, explicit clear, validation, full archive, isolated parts' as result;
