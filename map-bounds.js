(function(root){
  function axis(position,mapSize,viewSize){if(mapSize<=viewSize)return(viewSize-mapSize)/2;return Math.max(viewSize-mapSize,Math.min(0,position))}
  function target(x,y,scale,width,height){return{x:axis(x,4763*scale,width),y:axis(y,3185*scale,height)}}
  function rubber(position,limit){const d=position-limit;return limit+Math.sign(d)*100*(1-Math.exp(-Math.abs(d)/220))}
  function resisted(x,y,scale,width,height){const b=target(x,y,scale,width,height);return{x:rubber(x,b.x),y:rubber(y,b.y)}}
  const api={target,resisted};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MapBounds=api;
})(typeof window==='undefined'?globalThis:window);
