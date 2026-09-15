-- Acceptance only: all sample styles and version changes are rolled back.
begin;
do $$ declare orig jsonb; s jsonb; a jsonb; b jsonb; ns jsonb:='{"color":"#224466","border":"#abcdef","text":"#ffffff","shape":"rounded"}'; es jsonb:='{"color":"#123abc","width":6,"pattern":"dotted"}'; begin
 select snapshot into orig from public.board_saves where board_id='black-tower';
 select snapshot into a from public.adventure_archive where id='main';
 s:=jsonb_set(jsonb_set(orig,'{nodes,0,style}',ns),'{edges,0,style}',es);
 if not public.valid_board_snapshot(s) then raise exception 'valid styles rejected';end if;
 if public.valid_board_snapshot(jsonb_set(s,'{nodes,0,style,color}','"red"')) or public.valid_board_snapshot(jsonb_set(s,'{nodes,0,style,shape}','"circle"')) or public.valid_board_snapshot(jsonb_set(s,'{edges,0,style,width}','2.5')) or public.valid_board_snapshot(jsonb_set(s,'{edges,0,style,pattern}','"url(x)"')) or public.valid_board_style('{"toString":"x"}','node') or public.valid_board_style('null','node') then raise exception 'invalid style accepted';end if;
 update public.board_saves set snapshot=s where board_id='black-tower';
 select snapshot into s from public.board_saves where board_id='black-tower';
 if s#>'{nodes,0,style}'<>ns or s#>'{edges,0,style}'<>es then raise exception 'style save failed';end if;
 -- Simulate a cached old client that drops styles while editing text.
 s:=jsonb_set((s#-'{nodes,0,style}')#-'{edges,0,style}','{edges,0,note}','"冒险团成员"');
 update public.board_saves set snapshot=s where board_id='black-tower';
 select snapshot into s from public.board_saves where board_id='black-tower';
 if s#>'{nodes,0,style}'<>ns or s#>'{edges,0,style}'<>es then raise exception 'old client erased styles';end if;
 select snapshot into b from public.adventure_archive where id='main';
 if (a->'parts')-'board'<>(b->'parts')-'board' or b#>'{parts,board,snapshot}'<>s then raise exception 'archive publication mismatch';end if;
 s:=jsonb_set(s,'{nodes,0,style}','{"color":"#d5c39b","border":"#706349","text":"#322a1d","shape":"arched"}');
 update public.board_saves set snapshot=s where board_id='black-tower';
 if (select snapshot#>>'{nodes,0,style,color}' from public.board_saves where board_id='black-tower')<>'#d5c39b' then raise exception 'explicit reset failed';end if;
end $$;
rollback;
