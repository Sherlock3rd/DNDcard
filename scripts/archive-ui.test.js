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
 if(file==='map.html'){Object.defineProperties(w.document.querySelector('#viewport'),{clientWidth:{value:1200},clientHeight:{value:700}});w.HTMLElement.prototype.setPointerCapture=()=>{};w.HTMLElement.prototype.hasPointerCapture=()=>false}
 const skip=['assets/vendor/','map-geography.js','map-labels.js','map-lod.js','journal-images.js'];for(const [,raw] of html.matchAll(/<script src="(?:\.\/)?([^"?]+)[^"]*"/g)){if(skip.some(x=>raw.startsWith(x)))continue;vm.runInContext(fs.readFileSync(raw,'utf8'),ctx,{filename:raw});if(raw==='cloud-config.js')w.DND_CLOUD_CONFIG={...w.DND_CLOUD_CONFIG,ownerId:'owner'}}
 return {w,ctx,dom,calls,get authCalls(){return authCalls},q:s=>w.document.querySelector(s),async ready(){await wait(()=>w.ADVENTURE_ARCHIVE&&[...w.ADVENTURE_ARCHIVE.stores.values()].every(s=>s.ready))},async login(){w.ADVENTURE_ARCHIVE.open();w.document.querySelector('[name=email]').value='owner@example.test';w.document.querySelector('[name=password]').value='not-real';w.document.querySelector('[data-auth]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await wait(()=>[...w.ADVENTURE_ARCHIVE.stores.values()].every(s=>s.authorized))}};
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
