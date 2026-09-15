const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{JSDOM}=require('jsdom');
const copy=v=>JSON.parse(JSON.stringify(v)),seed=JSON.parse(fs.readFileSync('data/save/latest.json','utf8'));
const boardScope={};vm.runInNewContext(fs.readFileSync('caseboard-seed.js','utf8'),{window:boardScope});seed.parts.board={revision:1,updatedAt:seed.updatedAt,snapshot:copy(boardScope.CASEBOARD_SEED)};
const wait=async fn=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,5))}throw Error('Timed out')};
function assertAllCardsFramed(a){const [x,y,z]=a.q('#boardWorld').style.transform.match(/-?[\d.]+(?:e[+-]?\d+)?/gi).map(Number);assert([x,y,z].every(Number.isFinite));for(const n of a.w.CaseboardAPI.read().nodes){assert((n.x-78)*z+x>=-1);assert((n.x+78)*z+x<=a.viewSize.width+1);assert((n.y-117)*z+y>=-1);assert((n.y+117)*z+y<=a.viewSize.height+1)}}
function page(file,server,options={}){
 const html=fs.readFileSync(file,'utf8'),dom=new JSDOM(html,{url:'https://example.test/'+file+(options.fragment||''),runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,ctx=dom.getInternalVMContext();let callback,session=null;const calls=[];let authCalls=0;
 if(options.storedKey)w.localStorage.setItem("dndcard-owner-link-v1",options.storedKey);
 Object.assign(w,{structuredClone:copy,TextEncoder,AbortSignal});w.scrollTo=()=>{};w.IntersectionObserver=class{observe(){}};w.matchMedia=()=>({matches:false});w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};
 w.DND_SUPABASE={createClient:()=>({auth:{onAuthStateChange(cb){callback=cb},getSession:async()=>{authCalls++;return {data:{session}}},async signInWithPassword(){session={user:{id:'owner',email:'owner@example.test'},access_token:'test-only'};callback('SIGNED_IN',session);return {}},async signOut(){session=null;callback('SIGNED_OUT',null);return {}}}})};
 w.fetch=async(url,o={})=>{if(url.includes('/rpc/')){const b=JSON.parse(o.body),cap=url.endsWith('/access_adventure');if(cap){assert.equal(o.headers.Authorization,undefined);assert(!url.includes(b.p_key));if(options.revoked||b.p_key!=='a'.repeat(64))return {ok:false,status:403};if(!b.p_part)return {ok:true,json:async()=>({status:'ready'})}}else assert.equal(o.headers.Authorization,'Bearer test-only');const name=cap?b.p_part:url.split('save_')[1],p=server.parts[name];calls.push(name);if(b.p_expected_revision!==p.revision)return {ok:true,json:async()=>({status:'conflict',row:{...p,updated_at:p.updatedAt}})};p.snapshot=copy(b.p_snapshot);p.revision++;server.revision++;return {ok:true,json:async()=>({status:'saved',row:{revision:p.revision,snapshot:p.snapshot,updated_at:p.updatedAt}})}}return {ok:true,json:async()=>url.includes('/adventure_archive')?[{snapshot:copy(server)}]:copy(server)}};
 const viewSize=options.viewSize||{width:1200,height:700};if(file==='map.html'||file==='caseboard.html'){Object.defineProperties(w.document.querySelector(file==='map.html'?'#viewport':'#boardViewport'),{clientWidth:{get:()=>viewSize.width},clientHeight:{get:()=>viewSize.height}});w.HTMLElement.prototype.setPointerCapture=()=>{};w.HTMLElement.prototype.hasPointerCapture=()=>false;w.HTMLElement.prototype.releasePointerCapture=()=>{}}
 const skip=['assets/vendor/','map-geography.js','map-labels.js','map-lod.js','journal-images.js'];for(const [,raw] of html.matchAll(/<script src="(?:\.\/)?([^"?]+)[^"]*"/g)){if(skip.some(x=>raw.startsWith(x)))continue;vm.runInContext(fs.readFileSync(raw,'utf8'),ctx,{filename:raw});if(raw==='cloud-config.js')w.DND_CLOUD_CONFIG={...w.DND_CLOUD_CONFIG,ownerId:'owner'}}
 return {w,ctx,dom,calls,viewSize,get authCalls(){return authCalls},q:s=>w.document.querySelector(s),async ready(){await wait(()=>w.ADVENTURE_ARCHIVE&&[...w.ADVENTURE_ARCHIVE.stores.values()].every(s=>s.ready))},async login(){w.ADVENTURE_ARCHIVE.open();w.document.querySelector('[name=email]').value='owner@example.test';w.document.querySelector('[name=password]').value='not-real';w.document.querySelector('[data-auth]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await wait(()=>[...w.ADVENTURE_ARCHIVE.stores.values()].every(s=>s.authorized))}};
}
test('real character page restores current account automatically and uploads only character changes',async()=>{const server=copy(seed),mapBefore=copy(server.parts.map),a=page('index.html',server);try{await a.ready();assert.equal(vm.runInContext('managerState.level',a.ctx),server.parts.character.snapshot.payload.manager.level);assert.equal(a.calls.length,0);await a.login();vm.runInContext('state.hp=3;saveState()',a.ctx);await a.w.ADVENTURE_ARCHIVE.stores.get('character').sync();assert.equal(server.parts.character.snapshot.payload.state.hp,3);assert.deepEqual(server.parts.map,mapBefore);assert.deepEqual(a.calls,['character']);assert.equal(a.q('#cloudSignUp'),null)}finally{a.w.close()}});

test('caseboard editing saves blank-portrait people, drags and annotated edges across devices without changing other parts',async()=>{
 const server=copy(seed),before=copy(server.parts),a=page('caseboard.html',server,{storedKey:'a'.repeat(64)});const pointer=(target,type,x,y)=>{const e=new a.w.Event(type,{bubbles:true});Object.assign(e,{button:0,pointerId:1,clientX:x,clientY:y});target.dispatchEvent(e)};
 try{await a.ready();const store=a.w.ADVENTURE_ARCHIVE.stores.get('board');assert.equal(a.q('#boardViewport').inert,false);assert.equal(a.w.CaseboardAPI.read().nodes.length,13);const first=a.q('.case-node'),old=copy(a.w.CaseboardAPI.read());pointer(first,'pointerdown',200,200);pointer(first,'pointermove',300,300);pointer(first,'pointerup',300,300);assert.deepEqual(copy(a.w.CaseboardAPI.read()),old);
  a.q('#boardEdit').click();a.q('#boardNew').click();a.q('#boardName').value='取消的人物';a.q('[data-close-person]').click();assert.equal(a.calls.length,0);a.q('#boardNew').click();a.q('#boardName').value='未绘肖像的证人';a.q('#boardNotes').value='<b>不执行</b>';a.q('#boardPersonForm').dispatchEvent(new a.w.Event('submit',{cancelable:true}));await store.sync();const created=server.parts.board.snapshot.nodes.find(n=>n.name==='未绘肖像的证人');assert.equal(created.portrait,'');assert(a.q('.empty-portrait'));assert.equal(a.q('#boardDetailBody b'),null);
  const card=a.q('[data-id="'+created.id+'"]');pointer(card,'pointerdown',600,350);pointer(card,'pointermove',650,390);pointer(card,'pointerup',650,390);await store.sync();assert.notEqual(server.parts.board.snapshot.nodes.find(n=>n.id===created.id).x,created.x);const moved=copy(a.w.CaseboardAPI.read());pointer(card,'pointerdown',650,390);pointer(card,'pointermove',750,490);pointer(card,'pointercancel',750,490);assert.deepEqual(copy(a.w.CaseboardAPI.read()),moved);
  a.q('#boardConnect').click();a.q('[data-id="party"]').click();card.click();assert(a.q('#boardEdgeDialog').open);a.q('#boardEdgeNote').value='在矿坑见过冒险团';a.q('#boardEdgeForm').dispatchEvent(new a.w.Event('submit',{cancelable:true}));await store.sync();const edge=server.parts.board.snapshot.edges.find(e=>e.from===created.id||e.to===created.id);assert.equal(edge.note,'在矿坑见过冒险团');const b=page('caseboard.html',server);try{await b.ready();assert.equal(b.w.CaseboardAPI.read().nodes.find(n=>n.id===created.id).portrait,'');assert(b.w.CaseboardAPI.read().edges.some(e=>e.note===edge.note))}finally{b.w.close()}
  a.q('#boardModify').click();a.q('#boardEdgeNote').value='取消的修改';a.q('#boardCancelEdge').click();assert.equal(a.w.CaseboardAPI.read().edges.find(e=>e.id===edge.id).note,edge.note);a.q('#boardRemove').click();a.q('#boardKeep').click();assert(a.w.CaseboardAPI.read().edges.some(e=>e.id===edge.id));a.q('#boardRemove').click();a.q('#boardConfirmDelete').click();await store.sync();assert(!server.parts.board.snapshot.edges.some(e=>e.id===edge.id));
  for(const part of ['character','map','journal'])assert.deepEqual(server.parts[part],before[part]);assert(a.calls.every(c=>c==='board'));
 }finally{a.w.close()}
});
test('journal edits sync and another device opens the same text without import',async()=>{const server=copy(seed),a=page('journal.html',server);try{await a.ready();await a.login();a.q('[data-close]').click();a.q('#editEntry').click();a.q('#entryBody').value='我把今日的经历记了下来。';a.q('#entryForm').dispatchEvent(new a.w.Event('submit',{bubbles:true,cancelable:true}));await a.w.ADVENTURE_ARCHIVE.stores.get('journal').sync();assert.equal(server.parts.journal.snapshot.entries[0].body,'我把今日的经历记了下来。');const b=page('journal.html',server);try{await b.ready();assert(b.q('#chapterBody').textContent.includes('今日的经历'))}finally{b.w.close()}}finally{a.w.close()}});
test('map and journal adapters coexist, restore actual pieces, and preserve each other',async()=>{const server=copy(seed),a=page('map.html',server);try{await a.ready();assert.equal(a.q('#viewport').inert,false);assert.equal(a.w.MapTable.read().pieces.length,server.parts.map.snapshot.pieces.length);await a.login();const prior=copy(server.parts.journal);vm.runInContext("pieces[0].name='测试棋子';saveMap()",a.ctx);await a.w.ADVENTURE_ARCHIVE.stores.get('map').sync();assert.equal(server.parts.map.snapshot.pieces[0].name,'测试棋子');assert.deepEqual(server.parts.journal,prior)}finally{a.w.close()}});

test('owner link automatically enables all three modules without an email session and survives new visits',async()=>{
 const server=copy(seed),key='a'.repeat(64);
 for(const [file,part,edit] of [['index.html','character','state.hp=4;saveState()'],['map.html','map',"pieces[0].name='免登录棋子';saveMap()"],['journal.html','journal',null]]){
  const a=page(file,server,{fragment:'#owner='+key});try{
   await a.ready();assert.equal(a.authCalls,0);assert.equal(a.w.location.hash,'');assert.equal(a.w.localStorage.getItem('dndcard-owner-link-v1'),key);
   assert.equal(a.q('[data-auth]').hidden,true);assert(a.q('[data-summary]').textContent.includes('自动同步已开启'));
   const before=copy(server.parts);if(edit)vm.runInContext(edit,a.ctx);else {a.q('#editEntry').click();a.q('#entryBody').value='免登录自动记录今日旅程。';a.q('#entryForm').dispatchEvent(new a.w.Event('submit',{bubbles:true,cancelable:true}))}
   await a.w.ADVENTURE_ARCHIVE.stores.get(part).sync();assert.deepEqual(a.calls,[part]);for(const other of Object.keys(before))if(other!==part)assert.deepEqual(server.parts[other],before[other]);
   assert(!JSON.stringify(server).includes(key));
   const b=page(file,server,{storedKey:key});try{await b.ready();assert.equal(b.authCalls,0);assert([...b.w.ADVENTURE_ARCHIVE.stores.values()].every(s=>s.authorized));assert.equal(b.w.ADVENTURE_ARCHIVE.stores.get(part).entry.revision,server.parts[part].revision)}finally{b.w.close()}
  }finally{a.w.close()}
 }
});

test('revoked owner link retains local edits and public visitors cannot upload',async()=>{
 for(const options of [{fragment:'#owner='+'a'.repeat(64),revoked:true},{}]){
  const server=copy(seed),a=page('map.html',server,options);try{await a.ready();assert([...a.w.ADVENTURE_ARCHIVE.stores.values()].every(s=>!s.authorized));
   vm.runInContext("pieces[0].name='离线修改';saveMap()",a.ctx);await a.w.ADVENTURE_ARCHIVE.stores.get('map').sync();assert.equal(a.calls.length,0);assert(a.w.ADVENTURE_ARCHIVE.stores.get('map').entry.dirty);assert.deepEqual(server,seed);
   if(options.revoked)assert(a.q('[data-error]').textContent.includes('失效'));
  }finally{a.w.close()}
 }
});

test('journal aliases bind to one existing piece without renaming or duplicating it, then sync to another device',async()=>{
 const server=copy(seed),mapBefore=copy(server.parts.map),a=page('journal.html',server,{storedKey:'a'.repeat(64)}),target=server.parts.map.snapshot.pieces.find(p=>p.kind!=='traveler');
 try{await a.ready();const original=copy(server.parts.journal.snapshot),first=original.entries[0].placeIds[0];
  a.q('[data-link-place="'+first+'"]').click();await wait(()=>a.q('#existingPiece').options.length>0);
  a.q('#pieceSearch').value=target.name;a.q('#pieceSearch').dispatchEvent(new a.w.Event('input'));assert.equal(a.q('#existingPiece').options.length,1);
  a.q('#existingPiece').value=target.id;a.q('#existingPiece').dispatchEvent(new a.w.Event('change'));a.q('#placeLinkForm').dispatchEvent(new a.w.Event('submit',{cancelable:true}));await wait(()=>!a.q('#placeLinkDialog').open);await a.w.ADVENTURE_ARCHIVE.stores.get('journal').sync();
  const bound=server.parts.journal.snapshot.places.find(p=>p.id===first);assert.equal(bound.pieceId,target.id);assert.equal(bound.name,original.places.find(p=>p.id===first).name);assert.equal(bound.x,target.x);assert.deepEqual(server.parts.map,mapBefore);assert.deepEqual(server.parts.journal.snapshot.entries,original.entries);
  a.q('#next').click();const second=original.entries[1].placeIds.find(id=>id!==first);a.q('[data-link-place="'+second+'"]').click();await wait(()=>a.q('#existingPiece').options.length>0);a.q('#existingPiece').value=target.id;a.q('#existingPiece').dispatchEvent(new a.w.Event('change'));a.q('#placeLinkForm').dispatchEvent(new a.w.Event('submit',{cancelable:true}));await wait(()=>!a.q('#placeLinkDialog').open);await a.w.ADVENTURE_ARCHIVE.stores.get('journal').sync();
  const previouslyBound=original.places.filter(p=>p.id!==first&&p.id!==second&&p.pieceId===target.id).length;
  assert.equal(server.parts.journal.snapshot.places.filter(p=>p.pieceId===target.id).length,previouslyBound+2);
  const b=page('journal.html',server);try{await b.ready();await wait(()=>b.q('#chapterPlaces').textContent.includes(target.name));assert.equal(b.w.JournalAPI.read().places.find(p=>p.id===first).pieceId,target.id)}finally{b.w.close()}
  a.q('[data-link-place="'+second+'"]').click();await wait(()=>a.q('#existingPiece').options.length>0);a.q('#unlinkPiece').click();await a.w.ADVENTURE_ARCHIVE.stores.get('journal').sync();assert.equal(server.parts.journal.snapshot.places.find(p=>p.id===second).pieceId,null);assert.equal(server.parts.journal.snapshot.places.find(p=>p.id===first).pieceId,target.id);assert.deepEqual(server.parts.map,mapBefore);
 }finally{a.w.close()}
});

test('selected piece shows linked journal adventure days and people without a location row; updates and unlink clear stale fields without writes',async()=>{
 const server=copy(seed),book=server.parts.journal.snapshot,target=server.parts.map.snapshot.pieces.find(p=>p.kind!=='traveler');
 book.places.forEach(p=>p.pieceId=null);const [first,second]=book.places;first.pieceId=second.pieceId=target.id;first.name='旧称甲';second.name='旧称乙';book.entries.forEach(e=>e.placeIds=[]);book.entries[0].placeIds=[first.id,second.id];book.entries[0].day='Day 3 · 抵镇';book.entries[0].people=['同行者 <b>甲</b>','工匠'];book.entries[1].placeIds=[first.id];book.entries[1].people=[];
 const a=page('map.html',server,{storedKey:'a'.repeat(64)});try{await a.ready();vm.runInContext('select(pieces.find(p=>p.id==='+JSON.stringify(target.id)+'))',a.ctx);const related=a.q('#pieceJournalEntries');assert.equal(related.querySelectorAll('article').length,2);assert(related.textContent.includes('Day 3 · 抵镇'));assert(!related.textContent.includes('旧称甲'));assert(![...related.querySelectorAll('dt')].some(e=>e.textContent==='地点'));assert(related.textContent.includes('同行者 <b>甲</b>'));assert.equal(related.querySelector('b'),null);assert(related.textContent.includes('未记录'));assert(!a.q('#details').textContent.includes('时间：待补充'));const card=related.firstElementChild.nextElementSibling;vm.runInContext('paint();paint()',a.ctx);assert.equal(related.firstElementChild.nextElementSibling,card);
  book.entries[0].day='Day 4 · 清晨';book.entries[0].people=['新来者'];server.parts.journal.revision++;server.revision++;await a.w.ADVENTURE_ARCHIVE.stores.get('journal').sync();assert(related.textContent.includes('Day 4 · 清晨'));assert(related.textContent.includes('新来者'));assert(!related.textContent.includes('同行者'));
  first.pieceId=second.pieceId=null;server.parts.journal.revision++;server.revision++;await a.w.ADVENTURE_ARCHIVE.stores.get('journal').sync();assert.equal(related.querySelectorAll('article').length,0);assert(related.textContent.includes('尚未关联'));assert.equal(a.calls.length,0);
 }finally{a.w.close()}
});

test('cancel and a piece removed while choosing cannot write a journal association',async()=>{
 const server=copy(seed),a=page('journal.html',server,{storedKey:'a'.repeat(64)});try{await a.ready();const before=copy(a.w.JournalAPI.read());a.q('[data-link-place]').click();await wait(()=>a.q('#existingPiece').options.length>0);a.q('[data-close-place-link]').click();assert.deepEqual(copy(a.w.JournalAPI.read()),before);assert.equal(a.calls.length,0);
  a.q('[data-link-place]').click();await wait(()=>a.q('#existingPiece').options.length>0);const target=server.parts.map.snapshot.pieces[0];a.q('#existingPiece').value=target.id;a.q('#existingPiece').dispatchEvent(new a.w.Event('change'));server.parts.map.snapshot.pieces=server.parts.map.snapshot.pieces.filter(p=>p.id!==target.id);server.parts.map.revision++;server.revision++;
  a.q('#placeLinkForm').dispatchEvent(new a.w.Event('submit',{cancelable:true}));await wait(()=>a.q('#pieceLinkError').textContent.includes('移除'));assert.equal(a.q('#placeLinkDialog').open,true);assert.deepEqual(copy(a.w.JournalAPI.read()),before);assert.equal(a.calls.length,0);
 }finally{a.w.close()}
});

test('piece notes preview as text, cancel is read-only, save/clear survive cloud and movement',async()=>{
 const server=copy(seed),a=page('map.html',server,{storedKey:'a'.repeat(64)});try{await a.ready();const before=copy(server.parts.journal),original=copy(a.w.MapTable.read());
  vm.runInContext('select(pieces[1])',a.ctx);a.q('#edit').click();a.q('#pointNotes').value='取消这段';a.q('#cancelEdit').click();assert.deepEqual(copy(a.w.MapTable.read()),original);assert.equal(a.calls.length,0);
  a.q('#edit').click();const note='家家户户都是工匠。\n工会出售矿石和工具。\n<img src=x onerror=alert(1)>';a.q('#pointNotes').value=note;a.q('#saveName').click();await a.w.ADVENTURE_ARCHIVE.stores.get('map').sync();assert.equal(a.q('#pointNotesPreview').textContent,note);assert.equal(a.q('#pointNotesPreview img'),null);assert.equal(server.parts.map.snapshot.pieces[1].notes,note);assert.deepEqual(server.parts.journal,before);
  const b=page('map.html',server,{storedKey:'a'.repeat(64)});try{await b.ready();vm.runInContext('select(pieces[1]);pieces[1].x+=1;saveMap()',b.ctx);assert.equal(b.q('#pointNotesPreview').textContent,note);await b.w.ADVENTURE_ARCHIVE.stores.get('map').sync();assert.equal(server.parts.map.snapshot.pieces[1].notes,note);b.q('#edit').click();b.q('#pointNotes').value='';b.q('#saveName').click();await b.w.ADVENTURE_ARCHIVE.stores.get('map').sync();assert.equal(server.parts.map.snapshot.pieces[1].notes,'')}finally{b.w.close()}
  const bad=copy(original);bad.pieces[0].notes='x'.repeat(4001);assert.throws(()=>a.w.MAP_SAVE_CORE.validate(bad));bad.pieces[0].notes=7;assert.throws(()=>a.w.MAP_SAVE_CORE.validate(bad));
 }finally{a.w.close()}
});

test('viewport resize preserves map center and scale without writes; panels and focus mode retain controls',async()=>{
 const server=copy(seed),a=page('map.html',server);try{await a.ready();const before=copy(a.w.MapTable.read()),camera=vm.runInContext('({cx:(viewport.clientWidth/2-x)/scale,cy:(viewport.clientHeight/2-y)/scale,scale})',a.ctx);
  a.viewSize.width=1500;a.viewSize.height=900;a.w.dispatchEvent(new a.w.Event('resize'));const after=vm.runInContext('({cx:(viewport.clientWidth/2-x)/scale,cy:(viewport.clientHeight/2-y)/scale,scale})',a.ctx);assert.equal(camera.scale,after.scale);assert(Math.abs(camera.cx-after.cx)<.001);assert(Math.abs(camera.cy-after.cy)<.001);
  a.q('#journalPlacesToggle').click();a.q('#positionJournalPlace').click();a.q('#toggle').click();await wait(()=>a.q('#journalPlacesPanel').hidden);assert.equal(a.q('#cancelJournalPlace').hidden,true);assert.equal(a.q('#tray').hidden,false);
  vm.runInContext('select(pieces[0])',a.ctx);await wait(()=>a.q('#tray').hidden);assert(a.q('.map-panel-heading .actions'));assert(a.q('.map-panel-scroll #pointNotesPreview'));
  a.q('[data-fullscreen]').click();await wait(()=>a.w.document.body.classList.contains('focus-screen'));a.q('[data-fullscreen]').click();await wait(()=>!a.w.document.body.classList.contains('focus-screen'));assert.deepEqual(copy(a.w.MapTable.read()),before);assert.equal(a.calls.length,0);
 }finally{a.w.close()}
});

test('ward creation, all-corner resizing, cancellation and deletion sync independently from enclosed cards',async()=>{
 const server=copy(seed);server.parts.board.snapshot.zones=copy(boardScope.CASEBOARD_SEED.zones);const before=copy(server.parts),a=page('caseboard.html',server,{storedKey:'a'.repeat(64)});
 const pointer=(target,type,x,y)=>{const e=new a.w.Event(type,{bubbles:true});Object.assign(e,{button:0,pointerId:2,clientX:x,clientY:y});target.dispatchEvent(e)};
 try{await a.ready();const store=a.w.ADVENTURE_ARCHIVE.stores.get('board'),snapshot=()=>copy(a.w.CaseboardAPI.read());const original=snapshot();let title=a.q('.ward-title');pointer(title,'pointerdown',200,200);pointer(title,'pointermove',240,220);pointer(title,'pointerup',240,220);assert.deepEqual(snapshot(),original);
 a.q('#boardEdit').click();a.q('#boardNewZone').click();a.q('#boardZoneName').value='不会保存';a.q('#boardZoneCancel').click();assert.deepEqual(snapshot(),original);
 a.q('#boardNewZone').click();a.q('#boardZoneName').value='<新线索>';a.q('#boardZoneTone').value='lilac';a.q('#boardZoneForm').dispatchEvent(new a.w.Event('submit',{cancelable:true}));await store.sync();let z=server.parts.board.snapshot.zones.find(z=>z.name==='<新线索>');assert(z);assert.equal(a.q('.ward-title new'),null);const id=z.id,selector='[data-zone="'+id+'"]';
 title=a.q(selector+' .ward-title');pointer(title,'pointerdown',500,300);pointer(title,'pointermove',530,320);assert.equal(snapshot().zones.find(z=>z.id===id).x,z.x,'unfinished drag is not part of the save');pointer(title,'pointerup',530,320);await store.sync();assert.notEqual(server.parts.board.snapshot.zones.find(z=>z.id===id).x,z.x);
 for(const corner of ['nw','ne','sw','se']){const handle=a.q(selector+' [data-corner="'+corner+'"]'),old=snapshot();pointer(handle,'pointerdown',500,300);pointer(handle,'pointermove',520,310);pointer(handle,'pointercancel',520,310);assert.deepEqual(snapshot(),old);pointer(handle,'pointerdown',500,300);pointer(handle,'pointermove',corner.includes('w')?490:510,corner.includes('n')?290:310);pointer(handle,'pointerup',510,310);await store.sync();assert.notDeepEqual(snapshot().zones.find(z=>z.id===id),old.zones.find(z=>z.id===id))}
 const handle=a.q(selector+' [data-corner="se"]');pointer(handle,'pointerdown',500,300);pointer(handle,'pointermove',5000,5000);pointer(handle,'pointerup',5000,5000);await store.sync();z=snapshot().zones.find(z=>z.id===id);assert(z.x+z.width>3600);assert(z.y+z.height>1600);
 await new Promise(r=>setTimeout(r,1));a.q(selector+' .ward-title').click();a.q('#boardModify').click();a.q('#boardZoneWidth').value='239';a.q('#boardZoneForm').dispatchEvent(new a.w.Event('submit',{cancelable:true}));assert(a.q('#boardZoneDialog').open);a.q('#boardZoneCancel').click();assert.equal(snapshot().zones.find(z=>z.id===id).width,z.width);
 const b=page('caseboard.html',server);try{await b.ready();assert.deepEqual(copy(b.w.CaseboardAPI.read().zones),snapshot().zones)}finally{b.w.close()}
 a.q('#boardRemove').click();a.q('#boardKeep').click();assert(snapshot().zones.some(z=>z.id===id));a.q('#boardRemove').click();a.q('#boardConfirmDelete').click();await store.sync();assert(!server.parts.board.snapshot.zones.some(z=>z.id===id));assert.deepEqual(server.parts.board.snapshot.nodes,before.board.snapshot.nodes);assert.deepEqual(server.parts.board.snapshot.edges,before.board.snapshot.edges);for(const part of ['character','map','journal'])assert.deepEqual(server.parts[part],before[part]);
 }finally{a.w.close()}
});

test('Raven Town regions frame actual groups without saving and portraits use original screenshot viewports',async()=>{
 const server=copy(seed);server.parts.board.snapshot=require('./prepare-raven-town').prepare(server.parts.board.snapshot);const a=page('caseboard.html',server);
 try{await a.ready();const before=copy(a.w.CaseboardAPI.read()),region=a.q('#boardRegion');
  assert(a.q('#boardThreads').getAttribute('viewBox').split(' ').map(Number).every(Number.isFinite));assert.notEqual(a.q('#boardThreads').getAttribute('viewBox'),'0 0 3600 1600');
  region.value='ward-raven-hyde';region.dispatchEvent(new a.w.Event('change'));assert.equal(a.calls.length,0);assert.deepEqual(copy(a.w.CaseboardAPI.read()),before);
  const portrait=a.q('[data-id="raven-mayor"] svg');assert.equal(portrait.getAttribute('viewBox'),'389 92 60 60');assert.equal(portrait.querySelector('image').getAttribute('href'),'assets/images/raven-town-reference-1.png');
  a.q('[data-id="raven-mayor"]').click();assert.equal(a.q('#boardDetailBody svg').getAttribute('aria-label'),'拜里斯·波特');
  a.viewSize.width=390;a.viewSize.height=680;a.w.dispatchEvent(new a.w.Event('resize'));region.value='ward-raven-smith';region.dispatchEvent(new a.w.Event('change'));assert.equal(a.calls.length,0);
 }finally{a.w.close()}
});

test('caseboard explicit styles survive editing, cancellation, reset, sync and another device',async()=>{
 const server=copy(seed),a=page('caseboard.html',server,{storedKey:'a'.repeat(64)});
 const submit=id=>a.q(id).dispatchEvent(new a.w.Event('submit',{bubbles:true,cancelable:true}));
 try{
  await a.ready();const store=a.w.ADVENTURE_ARCHIVE.stores.get('board'),original=copy(a.w.CaseboardAPI.read());a.q('#boardEdit').click();
  a.q('.case-node').click();a.q('#boardStyle').click();a.q('#boardStyle-color').value='#123456';a.q('#boardStyle-color').dispatchEvent(new a.w.Event('input'));a.q('[data-close-style]').click();assert.deepEqual(copy(a.w.CaseboardAPI.read()),original);assert.equal(a.calls.length,0);
  a.q('#boardStyle').click();a.q('#boardStyle-color').value='#123456';a.q('#boardStyle-border').value='#abc123';a.q('#boardStyle-text').value='#ffffff';a.q('#boardStyle-shape').value='rounded';submit('#boardStyleForm');await store.sync();
  const nodeStyle=copy(a.w.CaseboardAPI.read().nodes[0].style);assert.equal(nodeStyle.color,'#123456');assert.equal(a.q('.case-node').style.getPropertyValue('--card-fill'),'#123456');
  a.q('#boardModify').click();a.q('#boardName').value='只修改文字';submit('#boardPersonForm');await store.sync();assert.deepEqual(copy(a.w.CaseboardAPI.read().nodes[0].style),nodeStyle);
  a.q('#boardCloseDetails').click();a.q('.case-seal').click();a.q('#boardStyle').click();a.q('#boardStyle-color').value='#00aabb';a.q('#boardStyle-width').value='6';a.q('#boardStyle-pattern').value='dotted';submit('#boardStyleForm');await store.sync();
  const edgeStyle=copy(a.w.CaseboardAPI.read().edges[0].style);a.q('#boardModify').click();a.q('#boardEdgeNote').value='冒险团成员';submit('#boardEdgeForm');await store.sync();assert.deepEqual(copy(a.w.CaseboardAPI.read().edges[0].style),edgeStyle);assert(!a.q('.case-seal').classList.contains('membership'));assert.equal(a.q('.case-thread').getAttribute('stroke-dasharray'),'1 7');
  const b=page('caseboard.html',server);try{await b.ready();assert.deepEqual(copy(b.w.CaseboardAPI.read().nodes[0].style),nodeStyle);assert.deepEqual(copy(b.w.CaseboardAPI.read().edges[0].style),edgeStyle)}finally{b.w.close()}
  a.q('#boardStyle').click();a.q('#boardStyleReset').click();a.q('[data-close-style]').click();assert.deepEqual(copy(a.w.CaseboardAPI.read().edges[0].style),edgeStyle);
  a.q('#boardStyle').click();a.q('#boardStyleReset').click();submit('#boardStyleForm');await store.sync();assert.deepEqual(copy(server.parts.board.snapshot.edges[0].style),copy(a.w.CASEBOARD_CORE.defaults.edge));
  for(const part of ['character','map','journal'])assert.deepEqual(server.parts[part],seed.parts[part]);
 }finally{a.w.close()}
});

test('dragging text pans without native selection, and distant negative coordinates reload in the initial overview',async()=>{
 const server=copy(seed),a=page('caseboard.html',server,{storedKey:'a'.repeat(64)});
 const pointer=(target,type,x,y)=>{const e=new a.w.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{button:0,pointerId:1,clientX:x,clientY:y});target.dispatchEvent(e);return e};
 try{await a.ready();const original=copy(a.w.CaseboardAPI.read()),card=a.q('.case-node'),label=card.querySelector('strong'),view=a.q('#boardViewport'),transform=a.q('#boardWorld').style.transform;
  for(const type of ['selectstart','dragstart','drop']){const e=new a.w.Event(type,{bubbles:true,cancelable:true});label.dispatchEvent(e);assert(e.defaultPrevented)}
  assert(pointer(label,'pointerdown',200,200).defaultPrevented);pointer(view,'pointermove',360,250);pointer(view,'pointerup',360,250);assert.notEqual(a.q('#boardWorld').style.transform,transform);assert.deepEqual(copy(a.w.CaseboardAPI.read()),original);assert.equal(a.calls.length,0);
  a.q('#boardEdit').click();pointer(card,'pointerdown',200,200);pointer(view,'pointermove',-20000,-20000);pointer(view,'pointercancel',-20000,-20000);assert.deepEqual(copy(a.w.CaseboardAPI.read()),original);
  pointer(card,'pointerdown',200,200);pointer(view,'pointermove',-20000,-20000);pointer(view,'pointerup',-20000,-20000);await a.w.ADVENTURE_ARCHIVE.stores.get('board').sync();assert(server.parts.board.snapshot.nodes[0].x < -10000);assert(server.parts.board.snapshot.nodes[0].y < -10000);
  const b=page('caseboard.html',server);try{await b.ready();assertAllCardsFramed(b);assert.deepEqual(copy(b.w.CaseboardAPI.read()),server.parts.board.snapshot);assert.equal(b.calls.length,0);assert.equal(b.q('.board-inscription'),null)}finally{b.w.close()}
  a.q('#boardFit').click();assertAllCardsFramed(a);
 }finally{a.w.close()}
});
test('empty caseboard has a finite usable initial camera',async()=>{const server=copy(seed);server.parts.board.snapshot.nodes=[];server.parts.board.snapshot.edges=[];server.parts.board.snapshot.zones=[];const a=page('caseboard.html',server);try{await a.ready();assertAllCardsFramed(a);assert(a.q('#boardThreads').getAttribute('viewBox').split(' ').map(Number).every(Number.isFinite))}finally{a.w.close()}});

test('person level selection persists numbers and explicit unknown across devices; cancel and styles remain intact',async()=>{
 const server=copy(seed),n=server.parts.board.snapshot.nodes[1];n.role='牧师 · Lv.5';n.status='死亡';n.style={color:'#123456'};const a=page('caseboard.html',server,{storedKey:'a'.repeat(64)});
 const submit=()=>a.q('#boardPersonForm').dispatchEvent(new a.w.Event('submit',{cancelable:true}));
 try{await a.ready();const card=()=>a.q('[data-id="'+n.id+'"]'),before=copy(a.w.CaseboardAPI.read());assert.equal(card().querySelector('.node-role').textContent,'牧师');assert.equal(card().querySelector('.node-level').textContent,'等级 5（已故）');assert.equal(a.calls.length,0);
  a.q('#boardEdit').click();card().click();a.q('#boardModify').click();assert.equal(a.q('#boardLevel').value,'5');assert.equal(a.q('#boardRole').value,'牧师');a.q('#boardLevel').value='12';a.q('[data-close-person]').click();assert.deepEqual(copy(a.w.CaseboardAPI.read()),before);
  a.q('#boardModify').click();a.q('#boardLevel').value='12';submit();await a.w.ADVENTURE_ARCHIVE.stores.get('board').sync();assert.equal(server.parts.board.snapshot.nodes[1].level,12);assert.equal(server.parts.board.snapshot.nodes[1].role,'牧师');assert.deepEqual(server.parts.board.snapshot.nodes[1].style,before.nodes[1].style);assert.equal(card().querySelector('.node-level').textContent,'等级 12（已故）');
  a.q('#boardModify').click();a.q('#boardLevel').value='?';a.q('#boardStatus').value='未知';submit();await a.w.ADVENTURE_ARCHIVE.stores.get('board').sync();assert.equal(server.parts.board.snapshot.nodes[1].level,null);
  const b=page('caseboard.html',server);try{await b.ready();assert.equal(b.q('[data-id="'+n.id+'"] .node-level').textContent,'等级 ？（未知）');assert.equal(b.w.CaseboardAPI.read().nodes[1].level,null)}finally{b.w.close()}
  for(const part of ['character','map','journal'])assert.deepEqual(server.parts[part],seed.parts[part]);
 }finally{a.w.close()}
});
