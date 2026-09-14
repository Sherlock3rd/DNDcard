const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
test('release picker offers 3 per category, one traveler, placement and details work',()=>{
 const dom=new JSDOM(fs.readFileSync(path.join(root,'map.html'),'utf8'),{runScripts:'outside-only',url:'http://localhost/map.html'}),w=dom.window,q=s=>w.document.querySelector(s);w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};w.matchMedia=()=>({matches:false});
 Object.defineProperties(q('#viewport'),{clientWidth:{value:1200},clientHeight:{value:700}});q('#viewport').setPointerCapture=()=>{};q('#viewport').hasPointerCapture=()=>false;
 try{for(const file of ['map-bounds.js','map-camera-preview.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 assert.equal(q('.piece').dataset.kind,'traveler');assert.equal(q('.piece').style.left,'600px');assert.equal(q('.piece').style.top,'350px');
 const names=['城堡','村镇','资源','事件','特殊'];let placements=0;
 for(const name of names){[...q('#categories').children].find(b=>b.textContent===name).click();const choices=[...q('#choices').children];assert.equal(choices.length,name==='特殊'?1:3);
 for(const choice of choices){const src=choice.querySelector('img').getAttribute('src'),png=fs.readFileSync(path.join(root,src));assert.equal(png[25],6,'RGBA asset');if(name==='特殊')continue;choice.click();for(const type of ['pointerdown','pointerup']){const event=new w.Event(type,{bubbles:true});Object.assign(event,{button:0,pointerId:1,clientX:600,clientY:350});q('#viewport').dispatchEvent(event)}placements++;const piece=[...w.document.querySelectorAll('.piece')].at(-1);assert.equal(piece.querySelector('img').getAttribute('src'),src);piece.click();assert.equal(q('#details').hidden,false);assert.equal(q('#detailArt').getAttribute('src'),src);q('#closeDetails').click();assert.equal(q('#details').hidden,true)}
 }assert.equal(placements,12);assert.equal(w.document.querySelectorAll('.piece').length,13);assert(q('.map-return').getAttribute('href').includes('index.html'));assert(q('footer').textContent.includes('刷新后重置'));
 }finally{w.close()}
});
