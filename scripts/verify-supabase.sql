-- Integration assertions run against the deployed schema and always roll back.
begin;
do $test$
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  result jsonb;
  snapshot jsonb := '{"format":"dndcard-snapshot","version":1,"scope":"full","payload":{"manager":{},"state":{}}}';
  affected integer;
begin
  insert into auth.users(id, aud, role, email, created_at, updated_at)
    values(user_a, 'authenticated', 'authenticated', user_a::text || '@example.invalid', now(), now()),
          (user_b, 'authenticated', 'authenticated', user_b::text || '@example.invalid', now(), now());
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  set local role authenticated;
  result := public.save_character('__deployment_test__', 0, snapshot);
  if result->>'status' <> 'saved' or result#>>'{row,revision}' <> '1' then raise exception 'First save failed'; end if;
  result := public.save_character('__deployment_test__', 1, snapshot);
  if result#>>'{row,revision}' <> '2' then raise exception 'Revision increment failed'; end if;
  if (select count(*) from public.character_save_history where character_id='__deployment_test__') <> 1 then raise exception 'History failed'; end if;
  result := public.save_character('__deployment_test__', 1, snapshot);
  if result->>'status' <> 'conflict' then raise exception 'Conflict protection failed'; end if;
  begin
    perform public.save_character('__invalid_test__', 0, '{"format":"dndcard-snapshot","scope":"full","version":1}');
    raise exception 'Partial snapshot incorrectly accepted';
  exception when check_violation then null;
  end;
  perform set_config('request.jwt.claim.sub', user_b::text, true);
  if (select count(*) from public.character_saves where user_id=user_a) <> 0 then raise exception 'Other account save exposed'; end if;
  if (select count(*) from public.character_save_history where user_id=user_a) <> 0 then raise exception 'Other account history exposed'; end if;
  update public.character_saves set snapshot=character_saves.snapshot where user_id=user_a;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Other account save modified'; end if;
  begin
    insert into public.character_saves(user_id, character_id, snapshot) values(user_a, '__foreign_test__', snapshot);
    raise exception 'Foreign owner insert allowed';
  exception when insufficient_privilege then null;
  end;
  result := public.save_character('__deployment_test__', 0, snapshot);
  if result->>'status' <> 'saved' or result#>>'{row,user_id}' <> user_b::text then raise exception 'Second account isolated save failed'; end if;
  begin
    update public.character_saves set user_id=user_a where user_id=user_b;
    raise exception 'Owner change allowed';
  exception when others then
    if sqlerrm = 'Owner change allowed' then raise; end if;
  end;
  set local role anon;
  begin
    perform * from public.character_saves;
    raise exception 'Anonymous read allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.save_character('__deployment_test__', 0, snapshot);
    raise exception 'Anonymous RPC allowed';
  exception when insufficient_privilege then null;
  end;
end;
$test$;
rollback;
select 'PASS: save, revision, history, conflict, validation, two-user RLS and anonymous denial; transaction rolled back' as result;
