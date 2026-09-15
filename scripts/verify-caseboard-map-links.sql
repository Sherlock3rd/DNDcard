-- All acceptance mutations roll back, including history and archive publication.
begin;
do $$ declare orig jsonb; s jsonb; bad jsonb; other_before jsonb; begin
 select snapshot into strict orig from public.board_saves where board_id='black-tower' for update;
 select (snapshot->'parts')-'board' into other_before from public.adventure_archive where id='main';
 s:=jsonb_set(orig,'{nodes,1,mapPieceId}','"test-piece"');
 if not public.valid_board_snapshot(s) then raise exception 'Valid map link rejected';end if;
 foreach bad in array array['1'::jsonb,'[]'::jsonb,'{}'::jsonb,'""'::jsonb,'" "'::jsonb] loop
  if public.valid_board_snapshot(jsonb_set(s,'{nodes,1,mapPieceId}',bad)) then raise exception 'Invalid map link accepted';end if;
 end loop;
 update public.board_saves set snapshot=s where board_id='black-tower';
 if (select snapshot from public.board_saves where board_id='black-tower')<>s then raise exception 'Readback mismatch';end if;
 update public.board_saves set snapshot=s#-'{nodes,1,mapPieceId}' where board_id='black-tower';
 if (select snapshot#>'{nodes,1,mapPieceId}' from public.board_saves where board_id='black-tower')<>'"test-piece"'::jsonb then raise exception 'Old client erased map link';end if;
 update public.board_saves set snapshot=jsonb_set(s,'{nodes,1,mapPieceId}','null') where board_id='black-tower';
 select snapshot into s from public.board_saves where board_id='black-tower';
 if s#>'{nodes,1,mapPieceId}'<>'null'::jsonb then raise exception 'Explicit unlink lost';end if;
 if (s#-'{nodes,1,mapPieceId}')<>(orig#-'{nodes,1,mapPieceId}') then raise exception 'Other fields changed';end if;
 if (select (snapshot->'parts')-'board' from public.adventure_archive where id='main') is distinct from other_before then raise exception 'Other parts changed';end if;
 if (select snapshot#>'{parts,board,snapshot}' from public.adventure_archive where id='main')<>s then raise exception 'Published archive mismatch';end if;
end;$$;
rollback;
