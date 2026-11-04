const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{JSDOM}=require('jsdom');
const copy=v=>JSON.parse(JSON.stringify(v));
const seed=JSON.parse(fs.readFileSync('data/save/latest.json','utf8'));
const flush=async()=>{for(let i=0;i<80;i++)await Promise.resolve()};
function fixture(){
 const dom=new JSDOM('<button id="journalSaveStatus"></button>',{url:'https://example.test/journal.html',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 let now=1800000000000,seq=0,offline=false;const timers=new Map(),requests=[],server=copy(seed);let view=copy(server.parts.journal.snapshot);
 w.Date.now=()=>now;w.setTimeout=(fn,delay=0)=>{const id=++seq;timers.set(id,{fn,at:now+delay});return id};w.clearTimeout=id=>timers.delete(id);
 w.setInterval=(fn,delay)=>{const id=++seq;timers.set(id,{fn,at:now+delay,interval:delay});return id};w.clearInterval=w.clearTimeout;
 Object.assign(w,{structuredClone:copy,AbortSignal,ARCHIVE_CORE:require('../archive-core'),JOURNAL_CORE:{validate:copy},DND_CLOUD_CONFIG:{url:'https://cloud.test',ownerId:'owner',publishableKey:'public',archiveGitApiUrl:'https://git.test/archive',archiveGitUrl:'https://git.test/raw'},ADVENTURE_OWNER:{getKey:()=> 'test-only'},JournalAPI:{read:()=>view,apply:x=>view=x,canApply:()=>true}});
 w.DND_SUPABASE={createClient:()=>({auth:{onAuthStateChange(){}}})};
 w.fetch=async(url,o={})=>{
  requests.push({url,at:now,body:o.body?JSON.parse(o.body):null});if(offline&&url.startsWith('https://cloud.test'))throw Error('offline');
  let result;if(url.includes('/rpc/')){const b=JSON.parse(o.body);if(!b.p_part)result={status:'ready'};else{const p=server.parts[b.p_part];if(p.revision!==b.p_expected_revision)result={status:'conflict',row:{...copy(p),updated_at:p.updatedAt}};else{p.revision++;server.revision++;p.snapshot=copy(b.p_snapshot);result={status:'saved',row:{...copy(p),updated_at:p.updatedAt}}}}}
  else if(url.includes('select=revision'))result=[{revision:server.revision}];else if(url.includes('select=snapshot'))result=[{snapshot:copy(server)}];else result=copy(server);
  return {ok:true,status:200,json:async()=>result};
 };
 vm.runInContext(fs.readFileSync('archive-client.js','utf8'),dom.getInternalVMContext());
 async function advance(ms){const end=now+ms;for(let i=0;i<2000;i++){await flush();const next=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;const [id,t]=next;now=t.at;timers.delete(id);if(t.interval)timers.set(id,{...t,at:now+t.interval});t.fn()}now=end;await flush()}
 return {w,server,requests,advance,close:()=>w.close(),setOffline:v=>offline=v,edit(text){view.entries[0].body=text;w.document.dispatchEvent(new w.CustomEvent('journal:change',{detail:copy(view)}))},get store(){return w.ADVENTURE_ARCHIVE.stores.get('journal')}};
}
test('one hour idle makes zero additional requests; focus and visibility share one version check',async()=>{
 const f=fixture();try{await flush();assert(f.store.ready);const before=f.requests.length;await f.advance(3600000);assert.equal(f.requests.length,before);
 f.w.dispatchEvent(new f.w.Event('focus'));f.w.document.dispatchEvent(new f.w.Event('visibilitychange'));await flush();
 assert.equal(f.requests.filter(r=>r.url.includes('select=snapshot')).length,1);assert.equal(f.requests.filter(r=>r.url.includes('select=revision')).length,1);
 const after=f.requests.length;await f.advance(3600000);assert.equal(f.requests.length,after);
 }finally{f.close()}
});
test('edit burst uploads once, keeps local durability, no post-save or idle full download',async()=>{
 const f=fixture();try{await flush();f.edit('one');f.edit('two');f.edit('three');assert(f.store.entry.dirty);assert.match(f.w.localStorage.getItem(f.store.key),/three/);await f.advance(1000);
 assert.equal(f.requests.filter(r=>r.body?.p_part).length,1);assert.equal(f.server.parts.journal.snapshot.entries[0].body,'three');assert(!f.store.entry.dirty);const n=f.requests.length;await f.advance(3600000);assert.equal(f.requests.length,n);
 assert.equal(f.requests.filter(r=>r.url.includes('select=snapshot')).length,1);
 }finally{f.close()}
});
test('offline uploads back off, retain draft and recover once service returns',async()=>{
 const f=fixture();try{await flush();f.setOffline(true);f.edit('offline draft');await f.advance(1000);const n=f.requests.length;
 for(let i=0;i<20;i++)f.w.dispatchEvent(new f.w.Event('focus'));await f.advance(14000);assert.equal(f.requests.length,n);await f.advance(1000);assert.equal(f.requests.length,n+1);
 await f.advance(29000);assert.equal(f.requests.length,n+1);f.setOffline(false);await f.advance(1000);assert(!f.store.entry.dirty);assert.equal(f.server.parts.journal.snapshot.entries[0].body,'offline draft');
 }finally{f.close()}
});
test('new remote revision downloads once; dirty stale save retains both conflict copies',async()=>{
 const f=fixture();try{await flush();f.server.parts.journal.revision++;f.server.revision++;f.server.parts.journal.snapshot.entries[0].body='other device';f.edit('local edit');await f.advance(1000);
 assert.equal(f.store.status,'conflict');assert.equal(f.store.entry.snapshot.entries[0].body,'local edit');assert.equal(f.store.entry.conflict.snapshot.entries[0].body,'other device');
 const n=f.requests.length;await f.advance(3600000);assert.equal(f.requests.length,n);await f.store.resolve(false);assert.equal(f.store.entry.snapshot.entries[0].body,'other device');assert(!f.store.entry.dirty);
 assert.equal(f.requests.filter(r=>r.url.includes('select=snapshot')).length,2);
 }finally{f.close()}
});
