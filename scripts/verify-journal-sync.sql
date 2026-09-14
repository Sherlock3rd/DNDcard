-- Disposable identities and map records; all writes roll back.
begin;
do $test$
declare
 a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();result jsonb;affected integer;
 snapshot jsonb:='{"version":1,"journalId":"gandalf-adventures","places":[{"id":"town","name":"测试地点","x":null,"y":null,"pieceId":null,"note":""}],"entries":[{"id":"test-entry","arc":"测试","title":"第一章","day":"日期待记","body":"我记下这一日。","quote":"","source":"原始团录","image":"","people":[],"placeIds":["town"]}]}';
begin
 insert into auth.users(id,aud,role,email,created_at,updated_at) values
 (a,'authenticated','authenticated',a::text||'@example.invalid',now(),now()),
 (b,'authenticated','authenticated',b::text||'@example.invalid',now(),now());
 perform set_config('request.jwt.claim.sub',a::text,true);set local role authenticated;
 result:=public.save_journal('gandalf-adventures',0,snapshot);
 if result->>'status'<>'saved' or result#>>'{row,revision}'<>'1' then raise exception 'Create failed';end if;
 if (select m.snapshot from public.journal_saves m where user_id=a)<>snapshot then raise exception 'Read-back mismatch';end if;
 result:=public.save_journal('gandalf-adventures',1,snapshot);
 if result#>>'{row,revision}'<>'2' then raise exception 'Update failed';end if;
 if (select count(*) from public.journal_save_history where user_id=a)<>1 then raise exception 'History missing';end if;
 result:=public.save_journal('gandalf-adventures',1,snapshot);
 if result->>'status'<>'conflict' then raise exception 'Conflict missing';end if;
 begin
  perform public.save_journal('gandalf-adventures',2,jsonb_set(snapshot,'{places,0,x}','99999'));
  raise exception 'Invalid coordinates accepted';
 exception when check_violation then null;end;
 begin
  perform public.save_journal('gandalf-adventures',2,'{}');raise exception 'Incomplete snapshot accepted';
 exception when check_violation then null;end;
 begin
  perform public.save_journal('gandalf-adventures',2,jsonb_set(snapshot,'{entries}',(snapshot->'entries')||(snapshot->'entries')));raise exception 'Duplicate entry accepted';
 exception when check_violation then null;end;
 perform set_config('request.jwt.claim.sub',b::text,true);
 if (select count(*) from public.journal_saves where user_id=a)<>0 then raise exception 'RLS read leak';end if;
 if (select count(*) from public.journal_save_history where user_id=a)<>0 then raise exception 'RLS history leak';end if;
 update public.journal_saves set snapshot=journal_saves.snapshot where user_id=a;get diagnostics affected=row_count;
 if affected<>0 then raise exception 'RLS write leak';end if;
 begin
  insert into public.journal_saves(user_id,journal_id,snapshot) values(a,'gandalf-adventures',snapshot);raise exception 'Foreign insert allowed';
 exception when insufficient_privilege then null;end;
 result:=public.save_journal('gandalf-adventures',0,snapshot);
 if result#>>'{row,user_id}'<>b::text then raise exception 'Second account identity mismatch';end if;
 result:=public.save_journal('gandalf-adventures',1,'{"version":1,"journalId":"gandalf-adventures","places":[],"entries":[]}');
 if result#>'{row,snapshot,entries}'<>'[]'::jsonb then raise exception 'Empty journal not saved';end if;
 set local role anon;
 begin perform * from public.journal_saves;raise exception 'Anonymous read allowed';exception when insufficient_privilege then null;end;
 begin perform public.save_journal('gandalf-adventures',0,snapshot);raise exception 'Anonymous write allowed';exception when insufficient_privilege then null;end;
end;$test$;
rollback;
select 'PASS: journal save/read-back, revision, history, conflict, validation, empty journal, two-user RLS, anonymous denial; rolled back' as result;
