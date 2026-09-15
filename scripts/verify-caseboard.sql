-- Everything below is rolled back, including the temporary test capability digest.
begin;
update adventure_private.owner_links set key_hash=sha256(convert_to(repeat('a',64),'UTF8')),revoked_at=null where id='main';
set local role anon;
do $$ declare before_all jsonb; after_all jsonb; s jsonb; rev integer; r jsonb; begin
 begin perform public.access_adventure(repeat('b',64),'board',1,'{}');raise exception 'wrong key accepted';exception when insufficient_privilege then null;end;
 begin update public.board_saves set snapshot=snapshot;raise exception 'anonymous direct write accepted';exception when insufficient_privilege then null;end;
 begin perform 1 from public.board_save_history;raise exception 'history publicly readable';exception when insufficient_privilege then null;end;
 select snapshot into before_all from public.adventure_archive where id='main';s:=before_all#>'{parts,board,snapshot}';rev:=(before_all#>>'{parts,board,revision}')::integer;
 s:=jsonb_set(s,'{nodes,0,x}',to_jsonb(520));s:=jsonb_set(s,'{edges,0,note}',to_jsonb('测试关系备注'::text));
 r:=public.access_adventure(repeat('a',64),'board',rev,s);
 if r->>'status'<>'saved' or r#>'{row,snapshot}'<>s then raise exception 'board save failed';end if;
 select snapshot into after_all from public.adventure_archive where id='main';
 if (after_all->'parts')-'board'<>(before_all->'parts')-'board' then raise exception 'other parts changed';end if;
 if after_all#>'{parts,board,snapshot}'<>s then raise exception 'archive missing board';end if;
 r:=public.access_adventure(repeat('a',64),'board',rev,s);if r->>'status'<>'conflict' then raise exception 'stale write accepted';end if;
 begin perform public.access_adventure(repeat('a',64),'board',rev+1,jsonb_set(s,'{edges,0,to}',to_jsonb('missing-node'::text)));raise exception 'dangling edge accepted';exception when check_violation then null;end;
 begin perform public.access_adventure(repeat('a',64),'board',rev+1,jsonb_set(s,'{nodes,0,portrait}',to_jsonb('javascript:alert(1)'::text)));raise exception 'unsafe portrait accepted';exception when check_violation then null;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub',owner_id::text,true) from adventure_private.owner_links where id='main';
set local role authenticated;
do $$ declare s jsonb; rev integer; r jsonb; begin
 select snapshot,revision into s,rev from public.board_saves where board_id='black-tower';
 r:=public.save_board('black-tower',rev,s);if r->>'status'<>'saved' then raise exception 'email owner cannot save';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
set local role authenticated;
do $$ begin if exists(select 1 from public.board_saves) then raise exception 'other user can read private board table';end if;end $$;
reset role;
rollback;
