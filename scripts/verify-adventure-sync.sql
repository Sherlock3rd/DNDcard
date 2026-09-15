-- Append after the migration inside a transaction, then ROLLBACK. No player edits persist.
do $$ begin
 if (select snapshot#>>'{parts,character,revision}' from public.adventure_archive)<>(select revision::text from public.character_saves) then raise exception 'character revision mismatch'; end if;
 if (select snapshot#>'{parts,map,snapshot}' from public.adventure_archive)<>(select snapshot from public.map_saves) then raise exception 'map mismatch'; end if;
 if (select snapshot#>'{parts,journal,snapshot}' from public.adventure_archive)<>(select snapshot from public.journal_saves) then raise exception 'journal mismatch'; end if;
 if (select snapshot::text like '%user_id%' or snapshot::text like '%access_token%' from public.adventure_archive) then raise exception 'identity leak'; end if;
end $$;
set local role anon;
do $$ begin
 if (select count(*) from public.adventure_archive)<>1 then raise exception 'public read failed'; end if;
 begin update public.adventure_archive set revision=99;raise exception 'anonymous archive write allowed';exception when insufficient_privilege then null;end;
 begin perform adventure_private.refresh_archive();raise exception 'private function accessible';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ begin
 if (select count(*) from public.character_saves)<>0 then raise exception 'other account can read private original';end if;
end $$;
select set_config('request.jwt.claim.sub','25825073-befc-49ef-abda-33d8e73b084e',true);
do $$ declare old_revision bigint; m jsonb;j jsonb;begin
 select revision,snapshot#>'{parts,map}',snapshot#>'{parts,journal}' into old_revision,m,j from public.adventure_archive;
 update public.character_saves set snapshot=snapshot where character_id='gandalf';
 if (select revision from public.adventure_archive)<>old_revision+1 then raise exception 'trigger did not update full archive';end if;
 if (select snapshot#>'{parts,map}' from public.adventure_archive)<>m or (select snapshot#>'{parts,journal}' from public.adventure_archive)<>j then raise exception 'other module was changed';end if;
end $$;
reset role;
select 'PASS: public read, owner write, complete snapshot, original RLS, no cross-module overwrite' as result;
