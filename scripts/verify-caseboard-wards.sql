-- Transactional acceptance: no test edits survive.
begin;
do $$ declare s jsonb; orig jsonb; rev integer; zones jsonb; archive_before jsonb; archive_after jsonb; begin
 select snapshot,revision into orig,rev from public.board_saves where board_id='black-tower';
 select snapshot into archive_before from public.adventure_archive where id='main';
 s:=jsonb_set(orig,'{zones,0,width}','900');
 if not public.valid_board_snapshot(s) then raise exception 'valid ward rejected';end if;
 if public.valid_board_snapshot(jsonb_set(s,'{zones,0,width}','10')) or public.valid_board_snapshot(jsonb_set(s,'{zones,0,x}','-1')) or public.valid_board_snapshot(jsonb_set(s,'{zones,0,tone}','"red"')) or public.valid_board_snapshot(jsonb_set(s,'{zones}','null')) then raise exception 'invalid ward accepted';end if;
 update public.board_saves set snapshot=s where board_id='black-tower' and revision=rev;
 select snapshot->'zones' into zones from public.board_saves where board_id='black-tower';
 if zones<>s->'zones' then raise exception 'resize lost';end if;
 -- Cached pre-ward clients omit the property; the trigger preserves existing wards.
 update public.board_saves set snapshot=s-'zones' where board_id='black-tower';
 select snapshot into s from public.board_saves where board_id='black-tower';
 if s->'zones'<>zones then raise exception 'old client erased wards';end if;
 select snapshot into archive_after from public.adventure_archive where id='main';
 if (archive_before->'parts')-'board'<>(archive_after->'parts')-'board' then raise exception 'other archive parts changed';end if;
 if archive_after#>'{parts,board,snapshot,zones}'<>zones then raise exception 'archive dropped wards';end if;
 if s-'zones'<>orig-'zones' then raise exception 'cards or edges changed';end if;
 update public.board_saves set snapshot=jsonb_set(s,'{zones}','[]') where board_id='black-tower';
 if (select snapshot->'zones' from public.board_saves where board_id='black-tower')<>'[]'::jsonb then raise exception 'intentional empty wards not saved';end if;
end $$;
rollback;
