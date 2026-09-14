const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),key='dndcard-map-v1:guest';
function open(raw,search=''){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'map.html'),'utf8'),{runScripts:'outside-only',url:'https://example.test/map.html'+search}),w=dom.window,q=s=>w.document.querySelector(s);
 if(raw)w.localStorage.setItem(key,raw);w.localStorage.setItem('gandalf-5e-state','untouched');
 w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};w.matchMedia=()=>({matches:false});
 Object.defineProperties(q('#viewport'),{clientWidth:{value:1200},clientHeight:{value:700}});
 w.HTMLElement.prototype.setPointerCapture=()=>{};w.HTMLElement.prototype.hasPointerCapture=()=>false;
 w.DND_CLOUD_CONFIG={url:'https://example.test',publishableKey:'test'};w.DND_SUPABASE={createClient:()=>({auth:{onAuthStateChange:()=>{},getSession:async()=>({data:{session:null}})}})};
 for(const f of ['map-bounds.js','map-camera-preview.js','map-save-core.js','map-save.js'])w.eval(fs.readFileSync(path.join(root,f),'utf8'));
 const pointer=(el,type,x=600,y=350)=>{const event=new w.Event(type,{bubbles:true});Object.assign(event,{button:0,pointerId:1,clientX:x,clientY:y});el.dispatchEvent(event)};
 return {dom,w,q,pointer,raw:()=>w.localStorage.getItem(key),snapshot:()=>JSON.parse(w.localStorage.getItem(key)).snapshot,place(x=650,y=350){q('#choices button').click();pointer(q('#viewport'),'pointerdown',x,y);pointer(q('#viewport'),'pointerup',x,y)},close:()=>w.close()};
}
test('actual placement, name edit, info move and drag all persist immediately; refresh restores centered traveler',()=>{
 const a=open();try{
  a.place();assert.equal(a.snapshot().pieces.length,2);a.q('.piece[data-kind=castle]').click();a.q('#edit').click();a.q('#pointName').value='我的哨站';a.q('#saveName').click();assert.equal(a.snapshot().pieces[1].name,'我的哨站');
  const old=a.snapshot().pieces[1].x;a.q('#move').click();a.pointer(a.q('#viewport'),'pointerdown',750,380);a.pointer(a.q('#viewport'),'pointerup',750,380);assert.notEqual(a.snapshot().pieces[1].x,old);
  a.q('#moveMode').click();const traveler=a.q('.piece[data-kind=traveler]'),before=a.snapshot().pieces[0].x;
  a.pointer(traveler,'pointerdown',600,350);a.pointer(traveler,'pointermove',800,450);a.pointer(traveler,'pointerup',800,450);assert.notEqual(a.snapshot().pieces[0].x,before);
  const restored=open(a.raw());try{assert.deepEqual(restored.snapshot(),a.snapshot());assert.equal(restored.q('.piece[data-kind=traveler]').style.left,'600px');assert.equal(restored.q('.piece[data-kind=traveler]').style.top,'350px');assert.equal(restored.w.localStorage.getItem('gandalf-5e-state'),'untouched')}finally{restored.close()}
 }finally{a.close()}
});
test('cancelled rename/move/delete/drag do not change saved map, confirmed deletion survives reload',()=>{
 const a=open();try{a.place();const original=a.raw();const p=a.q('.piece[data-kind=castle]');p.click();a.q('#edit').click();a.q('#pointName').value='cancel';a.q('#cancelEdit').click();assert.equal(a.raw(),original);
  a.q('#move').click();a.q('#cancel').click();a.q('#delete').click();a.q('#keep').click();assert.equal(a.raw(),original);
  a.q('#moveMode').click();a.pointer(p,'pointerdown',600,350);a.pointer(p,'pointermove',700,420);a.pointer(p,'pointercancel',700,420);assert.equal(a.raw(),original);
  a.q('#moveMode').click();p.click();a.q('#delete').click();a.q('#remove').click();assert.equal(a.snapshot().pieces.length,1);
  a.q('.piece').click();a.q('#delete').click();a.q('#remove').click();const b=open(a.raw());try{assert.equal(b.w.document.querySelectorAll('.piece').length,0)}finally{b.close()}
 }finally{a.close()}
});
test('showcase never reads or writes official storage; malformed saves block editing and preserve source',()=>{
 const a=open();const raw=a.raw();a.close();const b=open(raw,'?showcase=1');try{b.place();assert.equal(b.raw(),raw);assert.match(b.q('#mapSaveStatus').textContent,/演示模式/)}finally{b.close()}
 const c=open('not-json');try{assert.equal(c.raw(),'not-json');assert.equal(c.q('#viewport').inert,true);assert.match(c.q('#mapSaveStatus').textContent,/读取失败/)}finally{c.close()}
});
