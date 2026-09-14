-- Disposable identities and map records; all writes roll back.
begin;
do $test$
declare
 a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();result jsonb;affected integer;
 snapshot jsonb:='{"version":1,"mapId":"faerun-3.5","pieces":[{"id":"current-position","kind":"traveler","name":"当前位置","x":1047,"y":1178}]}';
begin
 insert into auth.users(id,aud,role,email,created_at,updated_at) values
 (a,'authenticated','authenticated',a::text||'@example.invalid',now(),now()),
 (b,'authenticated','authenticated',b::text||'@example.invalid',now(),now());
 perform set_config('request.jwt.claim.sub',a::text,true);set local role authenticated;
 result:=public.save_map('faerun-3.5',0,snapshot);
 if result->>'status'<>'saved' or result#>>'{row,revision}'<>'1' then raise exception 'Create failed';end if;
 if (select m.snapshot from public.map_saves m where user_id=a)<>snapshot then raise exception 'Read-back mismatch';end if;
 result:=public.save_map('faerun-3.5',1,snapshot);
 if result#>>'{row,revision}'<>'2' then raise exception 'Update failed';end if;
 if (select count(*) from public.map_save_history where user_id=a)<>1 then raise exception 'History missing';end if;
 result:=public.save_map('faerun-3.5',1,snapshot);
 if result->>'status'<>'conflict' then raise exception 'Conflict missing';end if;
 begin
  perform public.save_map('faerun-3.5',2,'{"version":1,"mapId":"faerun-3.5","pieces":[{"id":"bad","kind":"mine","name":"bad","x":99999,"y":1}]}');
  raise exception 'Invalid coordinates accepted';
 exception when check_violation then null;end;
 begin
  perform public.save_map('faerun-3.5',2,'{}');raise exception 'Incomplete snapshot accepted';
 exception when check_violation then null;end;
 begin
  perform public.save_map('faerun-3.5',2,jsonb_set(snapshot,'{pieces}',(snapshot->'pieces')||(snapshot->'pieces')));raise exception 'Duplicate traveler accepted';
 exception when check_violation then null;end;
 perform set_config('request.jwt.claim.sub',b::text,true);
 if (select count(*) from public.map_saves where user_id=a)<>0 then raise exception 'RLS read leak';end if;
 if (select count(*) from public.map_save_history where user_id=a)<>0 then raise exception 'RLS history leak';end if;
 update public.map_saves set snapshot=map_saves.snapshot where user_id=a;get diagnostics affected=row_count;
 if affected<>0 then raise exception 'RLS write leak';end if;
 begin
  insert into public.map_saves(user_id,map_id,snapshot) values(a,'faerun-3.5',snapshot);raise exception 'Foreign insert allowed';
 exception when insufficient_privilege then null;end;
 result:=public.save_map('faerun-3.5',0,snapshot);
 if result#>>'{row,user_id}'<>b::text then raise exception 'Second account identity mismatch';end if;
 result:=public.save_map('faerun-3.5',1,'{"version":1,"mapId":"faerun-3.5","pieces":[]}');
 if result#>'{row,snapshot,pieces}'<>'[]'::jsonb then raise exception 'Empty map not saved';end if;
 set local role anon;
 begin perform * from public.map_saves;raise exception 'Anonymous read allowed';exception when insufficient_privilege then null;end;
 begin perform public.save_map('faerun-3.5',0,snapshot);raise exception 'Anonymous write allowed';exception when insufficient_privilege then null;end;
end;$test$;
rollback;
select 'PASS: map save/read-back, revision, history, conflict, validation, empty map, two-user RLS, anonymous denial; rolled back' as result;
