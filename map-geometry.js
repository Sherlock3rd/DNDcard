(function(root){
 function bounds(ring){return ring.reduce((b,p)=>[Math.min(b[0],p[0]),Math.min(b[1],p[1]),Math.max(b[2],p[0]),Math.max(b[3],p[1])],[Infinity,Infinity,-Infinity,-Infinity])}
 function clipRing(ring,box){let out=ring;for(const [axis,edge,sign]of [[0,box[0],1],[0,box[2],-1],[1,box[1],1],[1,box[3],-1]]){const input=out;out=[];if(!input.length)break;let a=input[input.length-1];for(const b of input){const ai=(a[axis]-edge)*sign>=0,bi=(b[axis]-edge)*sign>=0;if(ai!==bi){const t=(edge-a[axis])/(b[axis]-a[axis]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}if(bi)out.push(b);a=b}}return out}
 function index(rings){return rings.map(points=>({points,box:bounds(points)}))}
 function visible(rings,box){return rings.filter(r=>r.box[0]<=box[2]&&r.box[2]>=box[0]&&r.box[1]<=box[3]&&r.box[3]>=box[1]).map(r=>clipRing(r.points,box)).filter(r=>r.length>=3)}
 const api={bounds,clipRing,index,visible};if(typeof module!=='undefined')module.exports=api;root.MapGeometry=api;
})(typeof self!=='undefined'?self:globalThis);
