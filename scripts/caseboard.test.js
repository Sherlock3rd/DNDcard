const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),core=require('../caseboard-core');
test('styles are explicit, safe, and independent of card identity or relationship notes',()=>{
 const s=seed(),before=JSON.parse(JSON.stringify(s));
 assert.deepEqual(JSON.parse(JSON.stringify(core.validate(s))),before);
 assert.deepEqual(core.style(undefined,'node'),core.defaults.node);
 for(const n of s.nodes)assert.deepEqual(core.style(n.style,'node'),core.defaults.node);
 const custom={color:'#123456',border:'#abcdef',text:'#ffffff',shape:'rounded'};
 s.nodes[0].style=custom;s.edges[0].style={color:'#1122aa',width:5,pattern:'dashed'};
 const checked=core.validate(s);checked.nodes[0].name='编辑后';checked.edges[0].note='冒险团成员';
 assert.deepEqual(core.validate(checked).nodes[0].style,custom);
 assert.deepEqual(core.validate(checked).edges[0].style,s.edges[0].style);
 for(const value of [null,[],{color:'red'},{color:'url(https://bad)'},{shape:'other'},{text:'#fff'},{unexpected:true},{toString:'x'}])assert.throws(()=>core.style(value,'node'));
 for(const value of [{width:0},{width:9},{width:2.5},{width:'3'},{pattern:'other'},{color:'#12345g'}])assert.throws(()=>core.style(value,'edge'));
});
function seed(){const w={};vm.runInNewContext(fs.readFileSync('caseboard-seed.js','utf8'),{window:w});return core.validate(w.CASEBOARD_SEED)}
test('Raven Town adds screenshot facts without changing existing records or making uncertain allies certain',()=>{
 const initial=JSON.parse(JSON.stringify(seed()));initial.nodes[0].style={shape:'square'};
 const {prepare}=require('./prepare-raven-town'),next=prepare(initial);
 for(const part of ['nodes','edges','zones'])assert.deepEqual(next[part].slice(0,initial[part].length),initial[part]);
 assert.equal(next.nodes.length-initial.nodes.length,14);assert.equal(next.edges.length-initial.edges.length,4);
 assert.equal(next.nodes.filter(n=>n.id.startsWith('raven-')&&n.kind==='person').length,13);
 assert.equal(next.nodes.find(n=>n.id==='raven-smith-apprentice').name,'？？？');
 assert.match(next.edges.find(e=>e.id==='raven-hyde--smith').note,/盟友？/);
 for(const n of next.nodes.filter(n=>n.id.startsWith('raven-')&&n.kind==='person'))assert(fs.existsSync(n.portrait));
 assert.equal(next.nodes.find(n=>n.id==='raven-hyde-grandfather').status,'死亡');
 assert.throws(()=>prepare(next),/already exists/);
 const bad=JSON.parse(JSON.stringify(next));bad.nodes.at(-1).x=Infinity;assert.throws(()=>core.validate(bad));
});
test('caseboard preserves existing cast, validates references and allows a blank portrait',()=>{const s=seed();assert.equal(s.nodes.length,13);assert.equal(s.edges.length,14);for(const n of s.nodes)if(n.portrait)assert(fs.existsSync(n.portrait));s.nodes.push({id:'new',kind:'person',name:'新证人',race:'',role:'',status:'',notes:'',appearance:'',portrait:'',x:500,y:500});core.validate(s);s.edges.push({id:'new-link',from:'new',to:'party',note:'目击者'});core.validate(s);s.nodes.pop();assert.throws(()=>core.validate(s));});
test('caseboard rejects duplicate connections, unsafe portraits, bad coordinates and oversized notes',()=>{for(const mutate of [s=>s.edges.push({...s.edges[0],id:'duplicate',from:s.edges[0].to,to:s.edges[0].from}),s=>s.nodes[0].portrait='javascript:alert(1)',s=>s.nodes[0].portrait='assets/images/../secret',s=>s.nodes[0].x=NaN,s=>s.nodes[0].notes='x'.repeat(4001)]){const s=seed();mutate(s);assert.throws(()=>core.validate(s))}});

test('wards validate bounds, preserve empty groups and upgrade legacy snapshots without touching cards',()=>{
 const s=seed();assert.equal(s.zones.length,2);const legacy=JSON.parse(JSON.stringify(s));delete legacy.zones;assert.deepEqual(core.validate(legacy).zones,[]);assert.deepEqual(core.validate(legacy).nodes,JSON.parse(JSON.stringify(s.nodes)));s.zones=[];assert.deepEqual(core.validate(s).zones,[]);
 for(const mutate of [s=>s.zones=null,s=>s.zones.push({...s.zones[0]}),s=>s.zones[0].width=NaN,s=>s.zones[0].height=199,s=>s.zones[0].width=Infinity,s=>s.zones[0].tone='red',s=>s.zones[0].name='']){const s=seed();mutate(s);assert.throws(()=>core.validate(s))}
});

test('unbounded finite coordinates preserve negative positions and distant zones',()=>{const s=seed();s.nodes[0].x=-1000000;s.nodes[0].y=1000000;s.zones[0].x=-2000000;s.zones[0].y=-2000000;s.zones[0].width=4000000;s.zones[0].height=4000000;assert.deepEqual(core.validate(s),s)});
