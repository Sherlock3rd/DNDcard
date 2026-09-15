-- Reversible acceptance: all writes and history entries roll back.
begin;
do $$ declare orig jsonb; s jsonb; bad jsonb; other_before jsonb; other_after jsonb; begin
 select snapshot into strict orig from public.board_saves where board_id='black-tower' for update;
 select (snapshot->'parts')-'board' into other_before from public.adventure_archive where id='main';
 s:=jsonb_set(orig,'{nodes,1,level}','12');
 if not public.valid_board_snapshot(s) then raise exception 'Valid level rejected';end if;
 foreach bad in array array['0'::jsonb,'21'::jsonb,'1.5'::jsonb,'"5"'::jsonb,'"?"'::jsonb,'{}'::jsonb] loop
  if public.valid_board_snapshot(jsonb_set(s,'{nodes,1,level}',bad)) then raise exception 'Invalid level accepted';end if;
 end loop;
 update public.board_saves set snapshot=s where board_id='black-tower';
 if (select snapshot from public.board_saves where board_id='black-tower')<>s then raise exception 'Level readback mismatch';end if;
 update public.board_saves set snapshot=s#-'{nodes,1,level}' where board_id='black-tower';
 if (select snapshot#>'{nodes,1,level}' from public.board_saves where board_id='black-tower')<>'12'::jsonb then raise exception 'Old client erased level';end if;
 update public.board_saves set snapshot=jsonb_set(s,'{nodes,1,level}','null') where board_id='black-tower';
 select snapshot into s from public.board_saves where board_id='black-tower';
 if s#>'{nodes,1,level}'<>'null'::jsonb then raise exception 'Explicit unknown lost';end if;
 if (s#-'{nodes,1,level}')<>(orig#-'{nodes,1,level}') then raise exception 'Other board fields changed';end if;
 select (snapshot->'parts')-'board' into other_after from public.adventure_archive where id='main';
 if other_before is distinct from other_after then raise exception 'Other modules changed';end if;
 if (select snapshot#>'{parts,board,snapshot}' from public.adventure_archive where id='main')<>s then raise exception 'Archive lost level';end if;
end;$$;
rollback;
