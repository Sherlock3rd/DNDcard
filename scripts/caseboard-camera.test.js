const test=require('node:test'),assert=require('node:assert/strict'),camera=require('../caseboard-camera.js');

test('wheel zoom keeps the world point below the cursor fixed',()=>{
 const start={zoom:.5,tx:80,ty:-20},point={x:240,y:160},world={x:(point.x-start.tx)/start.zoom,y:(point.y-start.ty)/start.zoom};
 const next=camera.zoomAt(start,.8,point.x,point.y);
 assert.equal((point.x-next.tx)/next.zoom,world.x);assert.equal((point.y-next.ty)/next.zoom,world.y);
});

test('mobile pinch zooms around its midpoint and pans with two fingers',()=>{
 const start={zoom:.5,tx:40,ty:30},a={x:100,y:100},b={x:300,y:100},pinch=camera.beginPinch(start,a,b);
 const next=camera.updatePinch(pinch,{x:80,y:150},{x:400,y:150});
 assert.equal(next.zoom,.8);assert.equal(next.tx,-16);assert.equal(next.ty,38);
 assert.equal((240-next.tx)/next.zoom,pinch.worldX);assert.equal((150-next.ty)/next.zoom,pinch.worldY);
});

test('pinch zoom stays inside the established caseboard limits',()=>{
 const pinch=camera.beginPinch({zoom:1,tx:0,ty:0},{x:0,y:0},{x:100,y:0});
 assert.equal(camera.updatePinch(pinch,{x:0,y:0},{x:1000,y:0}).zoom,2);
 assert.equal(camera.updatePinch(pinch,{x:0,y:0},{x:1,y:0}).zoom,.01);
});
