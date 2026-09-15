const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{JSDOM}=require('jsdom');
const copy=v=>JSON.parse(JSON.stringify(v)),seed=JSON.parse(fs.readFileSync('data/save/latest.json','utf8'));
const wait=async fn=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,5))}throw Error('Timed out')};
function page(file,server,options={}){
 const html=fs.readFileSync(file,'utf8'),dom=new JSDOM(html,{url:'https://example.test/'+file+(options.fragment||''),runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,ctx=dom.getInternalVMContext();let callback,session=null;const calls=[];let authCalls=0;
 if(options.storedKey)w.localStorage.setItem("dndcard-owner-link-v1",options.storedKey);
 Object.assign(w,{structuredClone:copy,TextEncoder,AbortSignal});w.scrollTo=()=>{};w.IntersectionObserver=class{observe(){}};w.matchMedia=()=>({matches:false});w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};
 w.DND_SUPABASE={createClient:()=>({auth:{onAuthStateChange(cb){callback=cb},getSession:async()=>{authCalls++;return {data:{session}}},async signInWithPassword(){session={user:{id:'owner',email:'owner@example.test'},access_token:'test-only'};callback('SIGNED_IN',session);return {}},async signOut(){session=null;callback('SIGNED_OUT',null);return {}}}})};
 w.fetch=async(url,o={})=>{if(url.includes('/rpc/')){const b=JSON.parse(o.body),cap=url.endsWith('/access_adventure');if(cap){assert.equal(o.headers.Authorization,undefined);assert(!url.includes(b.p_key));if(options.revoked||b.p_key!=='a'.repeat(64))return {ok:false,status:403};if(!b.p_part)return {ok:true,json:async()=>({status:'ready'})}}else assert.equal(o.headers.Authorization,'Bearer test-only');const name=cap?b.p_part:url.split('save_')[1],p=server.parts[name];calls.push(name);if(b.p_expected_revision!==p.revision)return {ok:true,json:async()=>({status:'conflict',row:{...p,updated_at:p.updatedAt}})};p.snapshot=copy(b.p_snapshot);p.revision++;server.revision++;return {ok:true,json:async()=>({status:'saved',row:{revision:p.revision,snapshot:p.snapshot,updated_at:p.updatedAt}})}}return {ok:true,json:async()=>url.includes('/adventure_archive')?[{snapshot:copy(server)}]:copy(server)}};
 const viewSize=options.viewSize||{width:1200,height:700};if(file==='map.html'){Object.defineProperties(w.document.querySelector('#viewport'),{clientWidth:{get:()=>viewSize.width},clientHeight:{get:()=>viewSize.height}});w.HTMLElement.prototype.setPointerCapture=()=>{};w.HTMLElement.prototype.hasPointerCapture=()=>false}
 const skip=['assets/vendor/','map-geography.js','map-labels.js','map-lod.js','journal-images.js'];for(const [,raw] of html.matchAll(/<script src="(?:\.\/)?([^"?]+)[^"]*"/g)){if(skip.some(x=>raw.startsWith(x)))continue;vm.runInContext(fs.readFileSync(raw,'utf8'),ctx,{filename:raw});if(raw==='cloud-config.js')w.DND_CLOUD_CONFIG={...w.DND_CLOUD_CONFIG,ownerId:'owner'}}
 return {w,ctx,dom,calls,viewSize,get authCalls(){return authCalls},q:s=>w.document.querySelector(s),async ready(){await wait(()=>w.ADVENTURE_ARCHIVE&&[...w.ADVENTURE_ARCHIVE.stores.values()].every(s=>s.ready))},async login(){w.ADVENTURE_ARCHIVE.open();w.document.querySelector('[name=email]').value='owner@example.test';w.document.querySelector('[name=password]').value='not-real';w.document.querySelector('[data-auth]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await wait(()=>[...w.ADVENTURE_ARCHIVE.stores.values()].every(s=>s.authorized))}};
}
test('real character page restores current account automatically and uploads only character changes',async()=>{const server=copy(seed),mapBefore=copy(server.parts.map),a=page('index.html',server);try{await a.ready();assert.equal(vm.runInContext('managerState.level',a.ctx),server.parts.character.snapshot.payload.manager.level);assert.equal(a.calls.length,0);await a.login();vm.runInContext('state.hp=3;saveState()',a.ctx);await a.w.ADVENTURE_ARCHIVE.stores.get('character').sync();assert.equal(server.parts.character.snapshot.payload.state.hp,3);assert.deepEqual(server.parts.map,mapBefore);assert.deepEqual(a.calls,['character']);assert.equal(a.q('#cloudSignUp'),null)}finally{a.w.close()}});
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

test('selected piece shows linked journal time, location aliases and people; updates and unlink clear stale fields without writes',async()=>{
 const server=copy(seed),book=server.parts.journal.snapshot,target=server.parts.map.snapshot.pieces.find(p=>p.kind!=='traveler');
 book.places.forEach(p=>p.pieceId=null);const [first,second]=book.places;first.pieceId=second.pieceId=target.id;first.name='旧称甲';second.name='旧称乙';book.entries.forEach(e=>e.placeIds=[]);book.entries[0].placeIds=[first.id,second.id];book.entries[0].day='到镇的黄昏';book.entries[0].people=['同行者 <b>甲</b>','工匠'];book.entries[1].placeIds=[first.id];book.entries[1].people=[];
 const a=page('map.html',server,{storedKey:'a'.repeat(64)});try{await a.ready();vm.runInContext('select(pieces.find(p=>p.id==='+JSON.stringify(target.id)+'))',a.ctx);const related=a.q('#pieceJournalEntries');assert.equal(related.querySelectorAll('article').length,2);assert(related.textContent.includes('到镇的黄昏'));assert(related.textContent.includes('旧称甲（地图棋子：'+target.name+'）'));assert(related.textContent.includes('旧称乙'));assert(related.textContent.includes('同行者 <b>甲</b>'));assert.equal(related.querySelector('b'),null);assert(related.textContent.includes('未记录'));assert(!a.q('#details').textContent.includes('时间：待补充'));const card=related.firstElementChild.nextElementSibling;vm.runInContext('paint();paint()',a.ctx);assert.equal(related.firstElementChild.nextElementSibling,card);
  book.entries[0].day='翌日清晨';book.entries[0].people=['新来者'];server.parts.journal.revision++;server.revision++;await a.w.ADVENTURE_ARCHIVE.stores.get('journal').sync();assert(related.textContent.includes('翌日清晨'));assert(related.textContent.includes('新来者'));assert(!related.textContent.includes('同行者'));
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
