/* Build data regions only. Raster assets are produced with imagegen. */
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const g=JSON.parse(fs.readFileSync(path.join(root,'data/map-geography.json'))),dir=path.join(root,'data/map-regions-v1');fs.mkdirSync(dir,{recursive:true});
const bounds=ring=>ring.reduce((a,p)=>[Math.min(a[0],p[0]),Math.min(a[1],p[1]),Math.max(a[2],p[0]),Math.max(a[3],p[1])],[Infinity,Infinity,-Infinity,-Infinity]);
function simplify(points,tolerance){if(points.length<8)return points;const keep=new Set([0,points.length-1]),stack=[[0,points.length-1]];while(stack.length){const [a,b]=stack.pop(),p=points[a],q=points[b],dx=q[0]-p[0],dy=q[1]-p[1],len=dx*dx+dy*dy;let max=tolerance*tolerance,index=-1;for(let i=a+1;i<b;i++){const r=points[i],t=len?Math.max(0,Math.min(1,((r[0]-p[0])*dx+(r[1]-p[1])*dy)/len)):0,dist=(r[0]-p[0]-t*dx)**2+(r[1]-p[1]-t*dy)**2;if(dist>max){max=dist;index=i}}if(index>=0){keep.add(index);stack.push([a,index],[index,b])}}const result=[...keep].sort((a,b)=>a-b).map(i=>points[i]);return result.length>=3?result:points}
const core={width:g.width,height:g.height,sourceSha256:g.sourceSha256,land:g.land,water:g.water,overview:{}};
for(const key of ['forest','mountain','desert','roads'])core.overview[key]=g[key].map(p=>simplify(p,key==='roads'?2:6));
core.overviewTerrain=g.terrain.filter((_,i)=>i%5===0);
fs.writeFileSync(path.join(dir,'core.json'),JSON.stringify(core));
const shapes=[];for(const key of ['forest','mountain','desert','roads'])g[key].forEach((points,i)=>shapes.push({id:key+i,kind:key,bounds:bounds(points),points}));
let total=0;
for(let row=0;row<Math.ceil(g.height/512);row++)for(let col=0;col<Math.ceil(g.width/512);col++){const x=col*512,y=row*512,data={shapes:shapes.filter(s=>s.bounds[0]<x+512&&s.bounds[2]>=x&&s.bounds[1]<y+512&&s.bounds[3]>=y).map(({bounds,...s})=>s),terrain:g.terrain.filter(t=>t[1]>=x-100&&t[1]<x+612&&t[2]>=y-100&&t[2]<y+612)};const text=JSON.stringify(data);total+=Buffer.byteLength(text);fs.writeFileSync(path.join(dir,`${col}-${row}.json`),text)}
console.log(JSON.stringify({coreBytes:fs.statSync(path.join(dir,'core.json')).size,regionCount:70,allRegionBytes:total}));
