(function(root){
  const LEVELS=[.25,.5,1,2,4,8],PIXELS=512;
  function level(scale,dpr=1){return LEVELS.find(v=>v>=scale*Math.min(dpr,2))||8}
  function visible(x,y,scale,width,height,lod){const size=PIXELS/lod,loX=Math.max(0,-x/scale),loY=Math.max(0,-y/scale),hiX=Math.min(4763,(width-x)/scale),hiY=Math.min(3185,(height-y)/scale),jobs=[];if(hiX<=loX||hiY<=loY)return jobs;for(let row=Math.floor(loY/size);row<=Math.floor((hiY-.001)/size);row++)for(let col=Math.floor(loX/size);col<=Math.floor((hiX-.001)/size);col++)jobs.push({col,row,lod,size});const cx=(loX+hiX)/2,cy=(loY+hiY)/2;return jobs.sort((a,b)=>Math.hypot((a.col+.5)*size-cx,(a.row+.5)*size-cy)-Math.hypot((b.col+.5)*size-cx,(b.row+.5)*size-cy))}
  function key(job,roads,sites){return `${job.lod}:${job.col}:${job.row}:${+roads}:${+sites}`}
  const api={LEVELS,PIXELS,level,visible,key};if(typeof module!=='undefined')module.exports=api;root.MapLOD=api;
})(typeof self!=='undefined'?self:globalThis);
