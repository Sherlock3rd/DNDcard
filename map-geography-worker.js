/* Geography is rasterised off the UI thread, one visible tile at a time. */
importScripts('map-lod.js','map-geometry.js');
let core,land,water,landIndex,waterIndex,sites=[],sourceMarkers=[],sourceLandmarks=[],atlas,overviewPaths={},queue=[],generation=0,running=false;
const regions=new Map(),MAX_REGIONS=18;
function path(rings,rounded=false){const p=new Path2D();for(const ring of rings){if(!ring.length)continue;if(!rounded){p.moveTo(...ring[0]);for(let i=1;i<ring.length;i++)p.lineTo(...ring[i])}else{for(let i=0;i<ring.length;i++){const a=ring[(i+ring.length-1)%ring.length],b=ring[i],c=ring[(i+1)%ring.length],ab=Math.hypot(a[0]-b[0],a[1]-b[1]),bc=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(2,ab/3,bc/3),u=ab?r/ab:0,v=bc?r/bc:0,entry=[b[0]+(a[0]-b[0])*u,b[1]+(a[1]-b[1])*u],exit=[b[0]+(c[0]-b[0])*v,b[1]+(c[1]-b[1])*v];if(!i)p.moveTo(...entry);else p.lineTo(...entry);p.quadraticCurveTo(...b,...exit)}}p.closePath()}return p}
async function json(url){const r=await fetch(url);if(!r.ok)throw new Error(url);return r.json()}
const ready=Promise.all([json('data/map-regions-v1/core.json'),json('data/map-sites.json'),json('data/map-source-markers.json')]).then(([g,s,m])=>{core=g;landIndex=MapGeometry.index(g.land);waterIndex=MapGeometry.index(g.water);sites=s.sites;sourceMarkers=m.markers;sourceLandmarks=m.landmarks||[];land=path(g.land,true);water=path(g.water,true);for(const k of ['forest','mountain','desert','roads'])overviewPaths[k]=path(g.overview[k]);const c=new OffscreenCanvas(1191,797),ctx=c.getContext('2d');ctx.scale(.25,.25);base(ctx);ctx.fillStyle='#c5d2d1';ctx.fill(water,'evenodd');const bitmap=c.transferToImageBitmap();postMessage({type:'overview',bitmap,sites,sourceHash:g.sourceSha256},[bitmap]);});
// Start the single ink atlas only when a visible detail tile actually needs it.
let atlasPromise;
function ink(){return atlasPromise??=(async()=>{const r=await fetch('assets/images/maps/map-underpaint-atlas-v1.png');if(!r.ok)throw new Error('atlas');atlas=await createImageBitmap(await r.blob());return atlas})()}
function base(ctx,surface=land){ctx.fillStyle='#cbd5d4';ctx.fillRect(0,0,4763,3185);ctx.fillStyle='#e6e3d3';ctx.fill(surface,'evenodd');ctx.strokeStyle='#859189';ctx.lineWidth=.7;ctx.stroke(surface)}
function motif(ctx,index,px,py,width,alpha){if(!atlas)return;const cw=atlas.width/4,ch=atlas.height/3,c=index===9?[cw,657,cw,367]:[(index%4)*cw,Math.floor(index/4)*ch,cw,ch],h=width*c[3]/c[2];ctx.globalAlpha=alpha;ctx.drawImage(atlas,...c,px-width/2,py-h*.7,width,h)}
async function region(col,row){const key=col+'-'+row;if(regions.has(key)){const v=regions.get(key);regions.delete(key);regions.set(key,v);return v}const value=await json('data/map-regions-v1/'+key+'.json');regions.set(key,value);while(regions.size>MAX_REGIONS)regions.delete(regions.keys().next().value);return value}
async function tile(job){const started=performance.now(),{lod,col,row,size,roads,showSites}=job,ox=col*size,oy=row*size,margin=100;const groups=[];
 // Bounded concurrency also prevents offscreen areas exhausting the connection pool.
 if(lod>.5)for(let ry=Math.max(0,Math.floor((oy-margin)/512));ry<=Math.min(6,Math.floor((oy+size+margin)/512));ry++)for(let cx=Math.max(0,Math.floor((ox-margin)/512));cx<=Math.min(9,Math.floor((ox+size+margin)/512));cx++)groups.push([cx,ry]);
 const data=[];for(let i=0;i<groups.length;i+=3){if(job.generation!==generation)return;data.push(...await Promise.all(groups.slice(i,i+3).map(([cx,ry])=>region(cx,ry))))}
 if(job.generation!==generation)return;
 if(lod>=.5)await ink();if(job.generation!==generation)return;
 const shapes=new Map(),terrain=new Map();for(const g of data){for(const s of g.shapes)shapes.set(s.id,s);for(const t of g.terrain)terrain.set(t[0]+':'+t[1]+':'+t[2],t)}
 const paths={};for(const kind of ['forest','mountain','desert','roads'])paths[kind]=lod<=.5?overviewPaths[kind]:path([...shapes.values()].filter(s=>s.kind===kind).map(s=>s.points));if(lod<=.5)for(const t of core.overviewTerrain)terrain.set(t[0]+':'+t[1]+':'+t[2],t);
 const box=[ox-16,oy-16,ox+size+16,oy+size+16],tileLand=path(MapGeometry.visible(landIndex,box),true),tileWater=path(MapGeometry.visible(waterIndex,box),true);const c=new OffscreenCanvas(516,516),ctx=c.getContext('2d');ctx.setTransform(lod,0,0,lod,2-ox*lod,2-oy*lod);ctx.save();ctx.beginPath();ctx.rect(0,0,4763,3185);ctx.clip();base(ctx,tileLand);
 if(atlas&&lod>=.5){ctx.save();ctx.clip(tileLand,'evenodd');ctx.globalCompositeOperation='multiply';for(const [kind,px,py,s,angle]of terrain.values()){if(px<ox-90||px>ox+size+90||py<oy-90||py>oy+size+90)continue;ctx.save();ctx.translate(px,py);ctx.rotate(angle||0);motif(ctx,kind==='mountain'?0:kind==='forest'?1:3,0,0,(kind==='forest'?51:kind==='mountain'?63:84)*s,kind==='forest'?.29:.4);ctx.restore()}ctx.restore()}
 ctx.fillStyle='#c5d2d1';ctx.fill(tileWater,'evenodd');
 if(showSites&&atlas&&lod>=.5){ctx.save();ctx.globalCompositeOperation='multiply';for(const s of [...sites,...sourceLandmarks]){if(s.x<ox-180||s.x>ox+size+180||s.y<oy-180||s.y>oy+size+180)continue;motif(ctx,s.sprite,s.x,s.y,s.size*1.04,.66)}ctx.restore()}
 if(roads){ctx.save();ctx.fillStyle='#8e8269';ctx.fill(paths.roads,'evenodd');ctx.restore()}
 if(showSites&&lod>=.5){ctx.save();ctx.strokeStyle='#766b55';ctx.fillStyle='#e6e3d3';ctx.lineWidth=.9;for(const m of sourceMarkers){if(m.x<ox-8||m.x>ox+size+8||m.y<oy-8||m.y>oy+size+8||sites.some(s=>Math.hypot(s.x-m.x,s.y-m.y)<12))continue;ctx.beginPath();ctx.arc(m.x,m.y,3.4,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(m.x,m.y,1.1,0,Math.PI*2);ctx.stroke()}ctx.restore()}
 // Fine paper grain is part of the tile, not a viewport effect or a new bitmap asset.
 ctx.globalAlpha=.055;ctx.fillStyle='#777562';const step=7;for(let yy=Math.floor(oy/step)*step;yy<oy+size;yy+=step)for(let xx=Math.floor(ox/step)*step;xx<ox+size;xx+=step){const n=Math.abs(Math.sin(xx*12.9898+yy*78.233)*43758.5453)%1;if(n>.68)ctx.fillRect(xx+n*4,yy+n*2,.45,.45)}ctx.globalAlpha=1;ctx.restore();
 const bitmap=c.transferToImageBitmap();postMessage({type:'tile',key:job.key,lod,col,row,size,roads,showSites,bitmap,generation:job.generation,ms:performance.now()-started,regions:regions.size},[bitmap]);
}
async function pump(){if(running)return;running=true;try{await ready;while(queue.length){const job=queue.shift();try{await tile(job)}catch(e){postMessage({type:'tile-error',key:job.key,message:String(e)})}await new Promise(resolve=>setTimeout(resolve,0))}}catch(e){postMessage({type:'error',message:String(e)})}finally{running=false}}
onmessage=e=>{if(e.data.type==='tiles'){generation=e.data.generation;queue=e.data.jobs.map(j=>({...j,generation}));pump()}};
ready.catch(e=>postMessage({type:'error',message:String(e)}));
