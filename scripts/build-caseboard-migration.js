// Build once from the current, verified archive SQL and the preserved wall seed.
const fs=require('node:fs'),vm=require('node:vm');const root={};vm.runInNewContext(fs.readFileSync('caseboard-seed.js','utf8'),{window:root});const seed=require('../caseboard-core').validate(root.CASEBOARD_SEED);
const migrationDir='supabase/migrations/',files=fs.readdirSync(migrationDir),ownerFile=files.find(f=>f.includes('owner_link')),archiveFile=files.find(f=>f.includes('unified'));
let owner=fs.readFileSync(migrationDir+ownerFile,'utf8').match(/create function adventure_private\.owner_link_access[\s\S]*?end;\$\$;/)[0].replace('create function','create or replace function').replace("('character','map','journal')","('character','map','journal','board')");
owner=owner.replace(" else\n  update public.journal_saves", " else\n  update public.journal_saves"); // CRLF is normalized before inserting the new branch.
owner=owner.replace(/\r\n/g,'\n').replace(" else\n  update public.journal_saves",` elsif p_part='board' then
  update public.board_saves s set snapshot=p_snapshot where s.user_id=owner_id and s.board_id='black-tower' and s.revision=p_expected_revision
   returning jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved;
  if saved is null then result_status:='conflict';select jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved from public.board_saves s where s.user_id=owner_id and s.board_id='black-tower';end if;
 else
  update public.journal_saves`);
let archive=fs.readFileSync(migrationDir+archiveFile,'utf8').match(/create function adventure_private\.refresh_archive[\s\S]*?end \$\$;/)[0].replace('create function','create or replace function');
archive=archive.replace("  'character',", "  'board',(select jsonb_build_object('revision',revision,'updatedAt',updated_at,'snapshot',snapshot) from public.board_saves where user_id=owner_id and board_id='black-tower'),\n  'character',").replace("if parts->'character'", "if parts->'board'='null'::jsonb or parts->'character'");
if(!owner.includes("elsif p_part='board'"))throw Error('Owner branch not inserted');
const sql=`-- Editable caseboard is a fourth, independently versioned adventure part.
create function public.valid_board_snapshot(s jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare n jsonb; e jsonb; f text; ids text[]:='{}'; edge_ids text[]:='{}'; pairs text[]:='{}'; pair text;
begin
 if not ((jsonb_typeof(s)='object' and s->>'version'='1' and s->>'boardId'='black-tower' and jsonb_typeof(s->'nodes')='array' and jsonb_typeof(s->'edges')='array' and octet_length(s::text)<=2097152) is true) then return false;end if;
 if jsonb_array_length(s->'nodes')>500 or jsonb_array_length(s->'edges')>2000 then return false;end if;
 for n in select value from jsonb_array_elements(s->'nodes') loop
  if not ((jsonb_typeof(n)='object' and jsonb_typeof(n->'id')='string' and length(n->>'id') between 1 and 100 and jsonb_typeof(n->'name')='string' and length(trim(n->>'name')) between 1 and 100 and n->>'kind' in ('person','group','place') and jsonb_typeof(n->'x')='number' and (n->>'x')::numeric between 100 and 1700 and jsonb_typeof(n->'y')='number' and (n->>'y')::numeric between 110 and 1090) is true) then return false;end if;
  foreach f in array array['race','role','status','notes','appearance','portrait'] loop
   if not ((jsonb_typeof(n->f)='string' and length(n->>f)<=case f when 'notes' then 4000 when 'appearance' then 2000 when 'portrait' then 500 else 100 end) is true) then return false;end if;
  end loop;
  if n->>'portrait'<>'' and (n->>'portrait' !~ '^assets/images/[a-zA-Z0-9_./-]+$' or position('..' in n->>'portrait')>0) then return false;end if;
  if n->>'id'=any(ids) then return false;end if;ids:=array_append(ids,n->>'id');
 end loop;
 for e in select value from jsonb_array_elements(s->'edges') loop
  if not ((jsonb_typeof(e)='object' and jsonb_typeof(e->'id')='string' and length(e->>'id') between 1 and 100 and jsonb_typeof(e->'from')='string' and e->>'from'=any(ids) and jsonb_typeof(e->'to')='string' and e->>'to'=any(ids) and e->>'from'<>e->>'to' and jsonb_typeof(e->'note')='string' and length(e->>'note')<=2000) is true) then return false;end if;
  pair:=least(e->>'from',e->>'to')||'|'||greatest(e->>'from',e->>'to');
  if e->>'id'=any(edge_ids) or pair=any(pairs) then return false;end if;edge_ids:=array_append(edge_ids,e->>'id');pairs:=array_append(pairs,pair);
 end loop;return true;
exception when others then return false;end;$$;
create table public.board_saves(user_id uuid not null references auth.users(id),board_id text not null check(board_id='black-tower'),revision integer not null default 1 check(revision>0),snapshot jsonb not null check(public.valid_board_snapshot(snapshot)),updated_at timestamptz not null default now(),primary key(user_id,board_id));
create table public.board_save_history(user_id uuid not null,board_id text not null,revision integer not null,snapshot jsonb not null,updated_at timestamptz not null,primary key(user_id,board_id,revision));
alter table public.board_saves enable row level security;alter table public.board_save_history enable row level security;
revoke all on public.board_saves,public.board_save_history from public,anon,authenticated;
grant select,update on public.board_saves to authenticated;
create policy "Owner reads board" on public.board_saves for select to authenticated using(user_id=(select auth.uid()));
create policy "Owner updates board" on public.board_saves for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create function adventure_private.version_board_save() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' then
  if new.user_id<>old.user_id or new.board_id<>old.board_id then raise exception 'Board identity cannot change';end if;
  insert into public.board_save_history values(old.user_id,old.board_id,old.revision,old.snapshot,old.updated_at);new.revision:=old.revision+1;
 else new.revision:=1;end if;new.updated_at:=clock_timestamp();return new;
end;$$;
revoke all on function adventure_private.version_board_save() from public,anon,authenticated;
create trigger board_version before insert or update on public.board_saves for each row execute function adventure_private.version_board_save();
insert into public.board_saves(user_id,board_id,snapshot) select owner_id,'black-tower',$seed$${JSON.stringify(seed)}$seed$::jsonb from adventure_private.owner_links where id='main';
create function public.save_board(p_board_id text,p_expected_revision integer,p_snapshot jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare saved public.board_saves;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501';end if;
 if p_board_id<>'black-tower' or p_expected_revision is null or p_expected_revision<1 then raise exception 'Invalid target or revision' using errcode='22023';end if;
 update public.board_saves set snapshot=p_snapshot where user_id=auth.uid() and board_id=p_board_id and revision=p_expected_revision returning * into saved;
 if saved.user_id is not null then return jsonb_build_object('status','saved','row',to_jsonb(saved));end if;
 select * into saved from public.board_saves where user_id=auth.uid() and board_id=p_board_id;
 return jsonb_build_object('status','conflict','row',case when saved.user_id is null then null else to_jsonb(saved) end);
end;$$;
revoke all on function public.save_board(text,integer,jsonb) from public,anon,authenticated;grant execute on function public.save_board(text,integer,jsonb) to authenticated;
${owner}
${archive}
create trigger publish_board_archive after insert or update on public.board_saves for each row execute function adventure_private.archive_after_save();
select adventure_private.refresh_archive();
`;
fs.writeFileSync(migrationDir+files.find(f=>f.endsWith('_caseboard_archive.sql')),sql.replace(/\r\n/g,'\n'));
