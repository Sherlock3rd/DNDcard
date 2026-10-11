const test=require('node:test'),assert=require('node:assert/strict'),cache=require('../map-render-cache.js');

test('persistent map render keys reuse identical inputs and include every visual source',async()=>{
 const core={sourceSha256:'terrain-a'},sites={sites:[{id:'one',x:1}]},markers={markers:[{x:2}],landmarks:[]};
 const a=await cache.signature(core,sites,markers),b=await cache.signature(core,sites,markers);
 assert.equal(a,b);assert.equal(cache.overviewKey(a),cache.overviewKey(b));
 assert.equal(cache.tileKey(a,{key:'1:2:3:1:1'}),cache.tileKey(b,{key:'1:2:3:1:1'}));
 assert.notEqual(a,await cache.signature(core,{sites:[{id:'one',x:9}]},markers));
 assert.notEqual(a,await cache.signature(core,sites,{markers:[{x:3}],landmarks:[]}));
 assert.match(cache.tileKey(a,{key:'x'}),/^map-render-v1:/);assert.equal(cache.MAX_ENTRIES,96);
});
