-- Journal text, scene references and location bindings are isolated from map and character saves.
create function public.valid_journal_snapshot(s jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare p jsonb;e jsonb;ref text;ids text[]:='{}';entry_ids text[]:='{}';
begin
 if not ((jsonb_typeof(s)='object' and s->'version'='1'::jsonb and s->>'journalId'='gandalf-adventures'
  and jsonb_typeof(s->'entries')='array' and jsonb_typeof(s->'places')='array' and octet_length(s::text)<=2097152) is true) then return false;end if;
 if jsonb_array_length(s->'entries')>1000 or jsonb_array_length(s->'places')>1000 then return false;end if;
 for p in select value from jsonb_array_elements(s->'places') loop
  if not ((jsonb_typeof(p)='object' and jsonb_typeof(p->'id')='string' and length(p->>'id') between 1 and 100
   and jsonb_typeof(p->'name')='string' and length(trim(p->>'name')) between 1 and 100
   and jsonb_typeof(p->'note')='string' and length(p->>'note')<=1000
   and (p->'pieceId'='null'::jsonb or jsonb_typeof(p->'pieceId')='string' and length(p->>'pieceId') between 1 and 100)
   and ((p->'x'='null'::jsonb and p->'y'='null'::jsonb) or (jsonb_typeof(p->'x')='number' and jsonb_typeof(p->'y')='number' and (p->>'x')::numeric between 0 and 4763 and (p->>'y')::numeric between 0 and 3185))) is true) then return false;end if;
  if p->>'id'=any(ids) then return false;end if;ids:=array_append(ids,p->>'id');
 end loop;
 for e in select value from jsonb_array_elements(s->'entries') loop
  if not ((jsonb_typeof(e)='object' and jsonb_typeof(e->'id')='string' and length(e->>'id') between 1 and 100
   and jsonb_typeof(e->'arc')='string' and length(trim(e->>'arc')) between 1 and 100
   and jsonb_typeof(e->'title')='string' and length(trim(e->>'title')) between 1 and 100
   and jsonb_typeof(e->'day')='string' and length(trim(e->>'day')) between 1 and 100
   and jsonb_typeof(e->'body')='string' and length(trim(e->>'body')) between 1 and 30000
   and jsonb_typeof(e->'source')='string' and length(e->>'source')<=40000
   and jsonb_typeof(e->'quote')='string' and length(e->>'quote')<=500
   and jsonb_typeof(e->'image')='string' and length(e->>'image')<=500
   and ((e->>'image')='' or (e->>'image')~'^https://[^[:space:]]+$' or ((e->>'image')~'^assets/images/[a-zA-Z0-9_./-]+$' and position('..' in e->>'image')=0))
   and jsonb_typeof(e->'people')='array' and jsonb_typeof(e->'placeIds')='array') is true) then return false;end if;
  if e->>'id'=any(entry_ids) then return false;end if;entry_ids:=array_append(entry_ids,e->>'id');
  if jsonb_array_length(e->'people')>100 then return false;end if;
  for p in select value from jsonb_array_elements(e->'people') loop
   if not ((jsonb_typeof(p)='string' and length(trim(p#>>'{}')) between 1 and 100) is true) then return false;end if;
  end loop;
  for p in select value from jsonb_array_elements(e->'placeIds') loop
   if not ((jsonb_typeof(p)='string' and (p#>>'{}')=any(ids)) is true) then return false;end if;
  end loop;
 end loop;
 return true;
exception when others then return false;
end;$$;
revoke all on function public.valid_journal_snapshot(jsonb) from public,anon;
grant execute on function public.valid_journal_snapshot(jsonb) to authenticated;
create table public.journal_saves (
 user_id uuid not null references auth.users(id) on delete cascade,
 journal_id text not null check(journal_id='gandalf-adventures'),
 snapshot jsonb not null check(public.valid_journal_snapshot(snapshot)),
 revision integer not null default 1 check(revision>0),
 updated_at timestamptz not null default now(),
 primary key(user_id,journal_id)
);
create table public.journal_save_history (
 user_id uuid not null references auth.users(id) on delete cascade,
 journal_id text not null,
 revision integer not null,
 snapshot jsonb not null,
 saved_at timestamptz not null,
 primary key(user_id,journal_id,revision)
);
alter table public.journal_saves enable row level security;
alter table public.journal_save_history enable row level security;
revoke all on public.journal_saves,public.journal_save_history from anon,authenticated;
grant select,insert,update on public.journal_saves to authenticated;
grant select,insert on public.journal_save_history to authenticated;
create policy journal_select on public.journal_saves for select to authenticated using((select auth.uid())=user_id);
create policy journal_insert on public.journal_saves for insert to authenticated with check((select auth.uid())=user_id);
create policy journal_update on public.journal_saves for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy journal_history_select on public.journal_save_history for select to authenticated using((select auth.uid())=user_id);
create policy journal_history_insert on public.journal_save_history for insert to authenticated with check((select auth.uid())=user_id);
create function public.version_journal_save() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='UPDATE' then
  if new.user_id<>old.user_id or new.journal_id<>old.journal_id then raise exception 'Journal identity cannot change'; end if;
  insert into public.journal_save_history values(old.user_id,old.journal_id,old.revision,old.snapshot,old.updated_at);
  new.revision:=old.revision+1;
 else new.revision:=1;
 end if;
 new.updated_at:=clock_timestamp();return new;
end;
$$;
revoke all on function public.version_journal_save() from public,anon,authenticated;
create trigger journal_save_version before insert or update on public.journal_saves for each row execute function public.version_journal_save();
create function public.save_journal(p_journal_id text,p_expected_revision integer,p_snapshot jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare saved public.journal_saves;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_expected_revision is null or p_expected_revision<0 then raise exception 'Invalid revision'; end if;
 if p_expected_revision=0 then
  insert into public.journal_saves(user_id,journal_id,snapshot) values(auth.uid(),p_journal_id,p_snapshot)
   on conflict(user_id,journal_id) do nothing returning * into saved;
 else
  update public.journal_saves set snapshot=p_snapshot where user_id=auth.uid() and journal_id=p_journal_id and revision=p_expected_revision returning * into saved;
 end if;
 if saved.user_id is not null then return jsonb_build_object('status','saved','row',to_jsonb(saved)); end if;
 select * into saved from public.journal_saves where user_id=auth.uid() and journal_id=p_journal_id;
 return jsonb_build_object('status','conflict','row',case when saved.user_id is null then null else to_jsonb(saved) end);
end;
$$;
revoke all on function public.save_journal(text,integer,jsonb) from public,anon;
grant execute on function public.save_journal(text,integer,jsonb) to authenticated;
