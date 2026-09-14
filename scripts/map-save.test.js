const {test}=require('node:test'),assert=require('node:assert/strict');
const {Store,initial,prefix,validate}=require('../map-save-core.js');
const clone=v=>JSON.parse(JSON.stringify(v));
function storage(){const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),m}}
function server(){const rows=new Map();return {rows,offline:false,async load(u){if(this.offline)throw Error('offline');return clone(rows.get(u)||null)},async save(u,r,s){if(this.offline)throw Error('offline');const old=rows.get(u);if((old?.revision||0)!==r)return {status:'conflict',row:clone(old)};const row={revision:r+1,snapshot:clone(s)};rows.set(u,row);return {status:'saved',row:clone(row)}}}}
function setup(remote,local=storage(),opts={}){let shown;const store=new Store({storage:local,remote,apply:s=>shown=s,...opts});return {store,local,get shown(){return shown}}}
function named(s,name){const snap=clone(s.entry.snapshot);snap.pieces[0].name=name;return snap}
test('local immediate persistence, reload, empty map and unrelated character saves',()=>{
 const r=server(),a=setup(r);a.local.setItem('gandalf-5e-state','keep');a.store.save(named(a.store,'营地'));
 const b=setup(r,a.local);assert.equal(b.shown.pieces[0].name,'营地');assert.equal(a.local.getItem('gandalf-5e-state'),'keep');
 b.store.save({...initial(),pieces:[]});assert.equal(setup(r,a.local).shown.pieces.length,0);
});
test('signed-in edits upload, second device restores, offline reload retries',async()=>{
 const r=server(),a=setup(r);await a.store.setUser('A');assert.equal(r.rows.size,0);
 a.store.save(named(a.store,'云城'));await a.store.sync();assert.equal(a.store.status,'synced');assert.equal(r.rows.get('A').snapshot.pieces[0].name,'云城');
 const b=setup(r);await b.store.setUser('A');assert.equal(b.shown.pieces[0].name,'云城');
 r.offline=true;a.store.save(named(a.store,'断网编辑'));await a.store.sync();assert.equal(a.store.status,'error');
 const reload=setup(r,a.local);await reload.store.setUser('A');assert.equal(reload.shown.pieces[0].name,'断网编辑');r.offline=false;await reload.store.sync();assert.equal(r.rows.get('A').snapshot.pieces[0].name,'断网编辑');
});
test('conflicting devices keep both copies, require explicit resolution, preserve backup',async()=>{
 const r=server(),a=setup(r),b=setup(r);await a.store.setUser('A');a.store.save(named(a.store,'one'));await a.store.sync();await b.store.setUser('A');
 a.store.save(named(a.store,'remote'));await a.store.sync();b.store.save(named(b.store,'local'));await b.store.sync();assert.equal(b.store.status,'conflict');assert.equal(r.rows.get('A').snapshot.pieces[0].name,'remote');
 await b.store.resolve(true);assert.equal(r.rows.get('A').snapshot.pieces[0].name,'local');assert([...b.local.m.keys()].some(k=>k.startsWith(prefix+'backup:')));
});
test('guest changes do not silently replace existing server map',async()=>{
 const r=server();r.rows.set('A',{revision:1,snapshot:initial()});const a=setup(r);a.store.save(named(a.store,'guest'));await a.store.setUser('A');assert.equal(a.store.status,'conflict');assert.equal(a.shown.pieces[0].name,'guest');await a.store.resolve(false);assert.equal(a.shown.pieces[0].name,'当前位置');
});
test('account switching isolates queued edits, stale responses cannot change new account',async()=>{
 const r=server(),a=setup(r);await a.store.setUser('A');a.store.save(named(a.store,'A-only'));
 let finish;const save=r.save.bind(r);r.save=async(...args)=>{await new Promise(resolve=>finish=resolve);return save(...args)};
 const sync=a.store.sync();await new Promise(resolve=>setImmediate(resolve));
 const switching=a.store.setUser('B');assert.equal(a.store.entry.snapshot.pieces[0].name,'当前位置');finish();await sync;await switching;assert.equal(a.store.user,'B');assert.equal(a.store.entry.revision,0);assert.equal(r.rows.has('B'),false);
 r.save=save;await a.store.setUser('A');assert.equal(a.shown.pieces[0].name,'A-only');assert.equal(a.store.status,'synced');await a.store.setUser(null);assert.equal(a.shown.pieces[0].name,'当前位置');
});
test('edits during upload stay pending and are sent on next sync',async()=>{
 const r=server(),a=setup(r);await a.store.setUser('A');a.store.save(named(a.store,'first'));let finish;const save=r.save.bind(r);r.save=async(...args)=>{await new Promise(resolve=>finish=resolve);return save(...args)};
 const task=a.store.sync();await new Promise(resolve=>setImmediate(resolve));a.store.save(named(a.store,'second'));finish();await task;assert.equal(a.store.status,'pending');assert.equal(a.store.entry.snapshot.pieces[0].name,'second');r.save=save;await a.store.sync();assert.equal(r.rows.get('A').snapshot.pieces[0].name,'second');
});
test('lost acknowledgement is reconciled without a false conflict',async()=>{
 const r=server(),a=setup(r);await a.store.setUser('A');a.store.save(named(a.store,'committed'));const save=r.save.bind(r);r.save=async(...args)=>{await save(...args);throw Error('lost response')};await a.store.sync();assert.equal(a.store.status,'error');r.save=save;await a.store.sync();assert.equal(a.store.status,'synced');assert.equal(a.store.entry.revision,1);
});
test('do not replace map during interaction; pick up remote after it finishes',async()=>{
 let editing=false;const r=server(),a=setup(r,storage(),{canApply:()=>!editing});await a.store.setUser('A');editing=true;r.rows.set('A',{revision:1,snapshot:{...initial(),pieces:[]}});await a.store.sync();assert.equal(a.store.status,'editing');assert.equal(a.shown.pieces.length,1);editing=false;await a.store.sync();assert.equal(a.shown.pieces.length,0);
});
test('corrupt cache is untouched; invalid points rejected; quota and other-tab writes never claim saved',()=>{
 const r=server(),local=storage();local.setItem(prefix+'guest','bad');assert.throws(()=>setup(r,local));assert.equal(local.getItem(prefix+'guest'),'bad');
 const a=setup(r);a.local.setItem=()=>{throw Error('quota')};assert.equal(a.store.save(named(a.store,'unsaved')),false);assert.equal(a.store.status,'storage-error');assert.equal(a.store.entry.snapshot.pieces[0].name,'unsaved');
 const b=setup(r);b.local.setItem(prefix+'guest','external');assert.equal(b.store.save(named(b.store,'stale')),false);assert.equal(b.local.getItem(prefix+'guest'),'external');
 for(const patch of [{kind:'invalid'},{x:NaN},{y:9999},{name:''}]){const s=initial();Object.assign(s.pieces[0],patch);assert.throws(()=>validate(s))}
});
