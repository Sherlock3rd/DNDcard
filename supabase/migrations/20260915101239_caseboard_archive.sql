-- Editable caseboard is a fourth, independently versioned adventure part.
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
insert into public.board_saves(user_id,board_id,snapshot) select owner_id,'black-tower',$seed${"version":1,"boardId":"black-tower","nodes":[{"id":"party","kind":"group","name":"冒险团","race":"七名同伴","role":"共同冒险","status":"","notes":"","appearance":"","portrait":"","x":500,"y":565},{"id":"gandalf","kind":"person","name":"甘阿·道夫","race":"人类","role":"法师（剑咏）","status":"","notes":"","appearance":"","portrait":"assets/images/gandalf-bladesinger.png","x":220,"y":220},{"id":"sairen","kind":"person","name":"赛伦","race":"人类","role":"牧师","status":"","notes":"","appearance":"","portrait":"assets/images/relationship-sairen.png","x":520,"y":170},{"id":"shire","kind":"person","name":"夏尔-金歌","race":"人类","role":"吟游诗人","status":"","notes":"","appearance":"","portrait":"assets/images/relationship-shire-goldsong.png","x":805,"y":260},{"id":"zuo","kind":"person","name":"左无峰","race":"人类","role":"拳师","status":"","notes":"","appearance":"","portrait":"assets/images/relationship-zuo-wufeng.png","x":835,"y":705},{"id":"mura","kind":"person","name":"缪拉-青苔","race":"半精灵","role":"德鲁伊","status":"","notes":"","appearance":"","portrait":"assets/images/relationship-mura-moss.png","x":600,"y":950},{"id":"feiyi","kind":"person","name":"费伊","race":"变体人类-不朽者","role":"魔器师","status":"","notes":"","appearance":"","portrait":"assets/images/relationship-feiyi.png","x":300,"y":935},{"id":"aili","kind":"person","name":"艾黎","race":"人类","role":"边境行者","status":"","notes":"","appearance":"","portrait":"assets/images/relationship-aili.png","x":165,"y":615},{"id":"iron-village","kind":"place","name":"铁环村","race":"","role":"矮人聚落","status":"矿坑事故","notes":"","appearance":"","portrait":"assets/images/relationship-dwarf-village.png","x":1270,"y":590},{"id":"chief","kind":"person","name":"艾德诺根","race":"矮人","role":"铁环村村长","status":"","notes":"","appearance":"","portrait":"assets/images/relationship-chief.png","x":1160,"y":220},{"id":"pazu","kind":"person","name":"帕祖","race":"","role":"","status":"已救援","notes":"","appearance":"","portrait":"assets/images/relationship-pazu.png","x":1570,"y":240},{"id":"maruk","kind":"person","name":"马鲁克","race":"矮人","role":"","status":"已故","notes":"被误认为叛徒 · 误杀","appearance":"","portrait":"assets/images/relationship-maruk.png","x":1570,"y":955},{"id":"morris","kind":"person","name":"墨里斯","race":"矮人","role":"","status":"已故","notes":"矿坑遇难者之一","appearance":"","portrait":"assets/images/relationship-morris.png","x":1180,"y":980}],"edges":[{"id":"party--gandalf","from":"party","to":"gandalf","note":"冒险团成员"},{"id":"party--sairen","from":"party","to":"sairen","note":"冒险团成员"},{"id":"party--shire","from":"party","to":"shire","note":"冒险团成员"},{"id":"party--zuo","from":"party","to":"zuo","note":"冒险团成员"},{"id":"party--mura","from":"party","to":"mura","note":"冒险团成员"},{"id":"party--feiyi","from":"party","to":"feiyi","note":"冒险团成员"},{"id":"party--aili","from":"party","to":"aili","note":"冒险团成员"},{"id":"party--iron-village","from":"party","to":"iron-village","note":"与铁环村关联"},{"id":"iron-village--chief","from":"iron-village","to":"chief","note":"村庄领袖"},{"id":"party--pazu","from":"party","to":"pazu","note":"被冒险团救下"},{"id":"party--maruk","from":"party","to":"maruk","note":"被误认为叛徒 · 误杀"},{"id":"iron-village--morris","from":"iron-village","to":"morris","note":"矿坑遇难者之一"},{"id":"iron-village--pazu","from":"iron-village","to":"pazu","note":"与铁环村关联"},{"id":"iron-village--maruk","from":"iron-village","to":"maruk","note":"与铁环村关联"}]}$seed$::jsonb from adventure_private.owner_links where id='main';
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
create or replace function adventure_private.owner_link_access(p_key text,p_part text,p_expected_revision integer,p_snapshot jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare owner_id uuid; saved jsonb; result_status text := 'saved';
begin
 -- This capability is deliberately independent of an email session. No caller-supplied identity.
 if p_key is null or p_key !~ '^[a-f0-9]{64}$' then raise exception 'Owner link is invalid' using errcode='42501'; end if;
 select l.owner_id into owner_id from adventure_private.owner_links l
 where l.id='main' and l.revoked_at is null and l.key_hash=sha256(convert_to(p_key,'UTF8'));
 if owner_id is null then raise exception 'Owner link is invalid' using errcode='42501'; end if;
 if p_part is null then return jsonb_build_object('status','ready'); end if;
 if p_part not in ('character','map','journal','board') or p_expected_revision is null or p_expected_revision<1
 then raise exception 'Invalid save target or revision' using errcode='22023'; end if;
 if p_snapshot is null or jsonb_typeof(p_snapshot)<>'object' or octet_length(p_snapshot::text)>2097152
 then raise exception 'Invalid snapshot' using errcode='22023'; end if;
 if p_part='character' then
  if not ((p_snapshot->>'format'='dndcard-snapshot' and p_snapshot->>'scope'='full' and p_snapshot->>'version'='1'
   and jsonb_typeof(p_snapshot#>'{payload,manager}')='object' and jsonb_typeof(p_snapshot#>'{payload,state}')='object') is true)
  then raise exception 'Invalid character snapshot' using errcode='22023'; end if;
  update public.character_saves s set snapshot=p_snapshot
   where s.user_id=owner_id and s.character_id='gandalf' and s.revision=p_expected_revision
   returning jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved;
  if saved is null then result_status:='conflict';select jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved
   from public.character_saves s where s.user_id=owner_id and s.character_id='gandalf';end if;
 elsif p_part='map' then
  update public.map_saves s set snapshot=p_snapshot
   where s.user_id=owner_id and s.map_id='faerun-3.5' and s.revision=p_expected_revision
   returning jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved;
  if saved is null then result_status:='conflict';select jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved
   from public.map_saves s where s.user_id=owner_id and s.map_id='faerun-3.5';end if;
 elsif p_part='board' then
  update public.board_saves s set snapshot=p_snapshot where s.user_id=owner_id and s.board_id='black-tower' and s.revision=p_expected_revision
   returning jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved;
  if saved is null then result_status:='conflict';select jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved from public.board_saves s where s.user_id=owner_id and s.board_id='black-tower';end if;
 else
  update public.journal_saves s set snapshot=p_snapshot
   where s.user_id=owner_id and s.journal_id='gandalf-adventures' and s.revision=p_expected_revision
   returning jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved;
  if saved is null then result_status:='conflict';select jsonb_build_object('snapshot',s.snapshot,'revision',s.revision,'updated_at',s.updated_at) into saved
   from public.journal_saves s where s.user_id=owner_id and s.journal_id='gandalf-adventures';end if;
 end if;
 return jsonb_build_object('status',result_status,'row',saved);
end;$$;
create or replace function adventure_private.refresh_archive() returns void
language plpgsql security definer set search_path='' as $$
declare owner_id uuid := '25825073-befc-49ef-abda-33d8e73b084e'; parts jsonb; old_row public.adventure_archive; next_revision bigint; stamp timestamptz;
begin
 perform pg_advisory_xact_lock(7315091501);
 select jsonb_build_object(
  'board',(select jsonb_build_object('revision',revision,'updatedAt',updated_at,'snapshot',snapshot) from public.board_saves where user_id=owner_id and board_id='black-tower'),
  'character',(select jsonb_build_object('revision',revision,'updatedAt',updated_at,'snapshot',snapshot) from public.character_saves where user_id=owner_id and character_id='gandalf'),
  'map',(select jsonb_build_object('revision',revision,'updatedAt',updated_at,'snapshot',snapshot) from public.map_saves where user_id=owner_id and map_id='faerun-3.5'),
  'journal',(select jsonb_build_object('revision',revision,'updatedAt',updated_at,'snapshot',snapshot) from public.journal_saves where user_id=owner_id and journal_id='gandalf-adventures')
 ) into parts;
 if parts->'board'='null'::jsonb or parts->'character'='null'::jsonb or parts->'map'='null'::jsonb or parts->'journal'='null'::jsonb then
  raise exception 'Incomplete owner archive; refusing to publish defaults';
 end if;
 select * into old_row from public.adventure_archive where id='main';
 if old_row.snapshot->'parts'=parts then return; end if;
 next_revision:=coalesce(old_row.revision,0)+1;stamp:=clock_timestamp();
 insert into public.adventure_archive values('main',next_revision,stamp,jsonb_build_object(
 'format','dndcard-adventure','version',1,'revision',next_revision,'updatedAt',stamp,'parts',parts,
 'assets',jsonb_build_object('repository','Sherlock3rd/DNDcard','base','./','note','Published portraits, relationship network, maps and illustrations remain versioned repository assets.')))
 on conflict(id) do update set revision=excluded.revision,updated_at=excluded.updated_at,snapshot=excluded.snapshot;
end $$;
create trigger publish_board_archive after insert or update on public.board_saves for each row execute function adventure_private.archive_after_save();
select adventure_private.refresh_archive();
