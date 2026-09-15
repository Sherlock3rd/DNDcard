/* The UI only composites cached bitmaps. Geometry, decode and tile drawing live in a worker. */
(() => {
 const canvas=document.createElement('canvas');canvas.id='geography';canvas.setAttribute('aria-label','按视野加载的分层地图底纹');viewport.insertBefore(canvas,$('#mapFog'));
 const ctx=canvas.getContext('2d'),cache=new Map(),LIMIT=48;let overview=null,worker,raf=0,generation=0,signature='',previousLod=null,activeLod=null,retries=0;
 const started=performance.now();map.style.visibility='hidden';
 function fallback(){cancelAnimationFrame(raf);raf=0;worker?.terminate();worker=null;canvas.hidden=true;map.src=map.dataset.src;map.style.visibility='visible';$('#hint').textContent='地图分块加载失败，已恢复原图；刷新可重试'}
 try{if(!window.Worker||!window.OffscreenCanvas)throw Error('unsupported');worker=new Worker('map-geography-worker.js')}catch{fallback();return}
 function remember(key,tile){if(cache.has(key))cache.get(key).bitmap.close();cache.delete(key);cache.set(key,tile);while(cache.size>LIMIT){const key=cache.keys().next().value;cache.get(key).bitmap.close();cache.delete(key)}}
 function drawTile(t){const dpr=Math.min(devicePixelRatio||1,2),dx=Math.round((x+t.col*t.size*scale)*dpr)/dpr,dy=Math.round((y+t.row*t.size*scale)*dpr)/dpr,right=Math.round((x+(t.col+1)*t.size*scale)*dpr)/dpr,bottom=Math.round((y+(t.row+1)*t.size*scale)*dpr)/dpr;if(dx>viewport.clientWidth||dy>viewport.clientHeight||right<0||bottom<0)return;ctx.drawImage(t.bitmap,2,2,512,512,dx,dy,right-dx,bottom-dy)}
 function draw(){raf=0;const t=performance.now(),original=$('#referenceToggle').getAttribute('aria-pressed')==='true';canvas.hidden=original;map.style.visibility=original?'visible':'hidden';if(original){if(signature!=='original'){signature='original';worker.postMessage({type:'tiles',generation:++generation,jobs:[]})}return}
  const w=viewport.clientWidth,h=viewport.clientHeight,dpr=Math.min(devicePixelRatio||1,2),roads=$('#roadsToggle').getAttribute('aria-pressed')==='true',showSites=$('#sitesToggle').getAttribute('aria-pressed')==='true';let lod=MapLOD.level(scale,dpr);while(MapLOD.visible(x,y,scale,w,h,lod).length>32&&lod>.25)lod/=2;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  if(overview)ctx.drawImage(overview,x,y,4763*scale,3185*scale);
  if(activeLod!==lod){previousLod=activeLod;activeLod=lod}
  let hasPrevious=false;for(const tile of cache.values())if(tile.lod===previousLod&&tile.lod!==lod&&tile.roads===roads&&tile.showSites===showSites){drawTile(tile);hasPrevious=true}
  const jobs=MapLOD.visible(x,y,scale,w,h,lod).map(j=>({...j,roads,showSites,key:MapLOD.key(j,roads,showSites)}));let rendered=0;
  const complete=jobs.every(j=>cache.has(j.key));for(const j of jobs){const tile=cache.get(j.key);if(!tile)continue;cache.delete(j.key);cache.set(j.key,tile);if(complete||!hasPrevious)drawTile(tile);rendered++}
  const next=jobs.map(j=>j.key).sort().join('|');if(next!==signature){signature=next;worker.postMessage({type:'tiles',generation:++generation,jobs:jobs.filter(j=>!cache.has(j.key))})}
  Object.assign(canvas.dataset,{lod:String(lod),visibleTiles:String(jobs.length),readyTiles:String(rendered),cachedTiles:String(cache.size),cacheLimit:String(LIMIT),renderScale:scale.toFixed(5),worldSize:'4763x3185',renderMs:(performance.now()-t).toFixed(2)});
  if(rendered===jobs.length&&jobs.length&&!canvas.dataset.firstDetailMs)canvas.dataset.firstDetailMs=(performance.now()-started).toFixed(0);
 }
 function schedule(){if(worker&&!raf)raf=requestAnimationFrame(draw)}window.paintMapGeography=schedule;
 worker.onmessage=e=>{const m=e.data;if(m.type==='overview'){overview?.close();overview=m.bitmap;canvas.dataset.firstOverviewMs=(performance.now()-started).toFixed(0);canvas.dataset.sourceHash=m.sourceHash;canvas.dataset.siteCount=m.sites.length;window.mapScenerySites=m.sites;window.refreshMapSiteLabels?.();const jump=$('#siteJump');for(const s of m.sites){const o=document.createElement('option');o.value=s.id;o.textContent=s.name;jump.append(o)}schedule()}else if(m.type==='tile'){remember(m.key,m);canvas.dataset.lastWorkerMs=m.ms.toFixed(1);canvas.dataset.regionCache=String(m.regions);schedule()}else if(m.type==='error'){fallback()}else if(m.type==='tile-error'&&retries++<3){setTimeout(()=>{signature='';schedule()},700*retries)}};
 worker.onerror=fallback;
 for(const id of ['roadsToggle','sitesToggle'])$('#'+id).onclick=()=>{const b=$('#'+id);b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));schedule();window.paintMapLabels?.()};
 $('#referenceToggle').addEventListener('click',schedule);
 $('#siteJump').onchange=e=>{const s=(window.mapScenerySites||[]).find(s=>s.id===e.target.value);if(!s)return;stopRebound();x=viewport.clientWidth/2-s.x*scale;y=viewport.clientHeight/2-s.y*scale;$('#mapContext,header small').textContent=s.name+'周边';clampView();paint();$('#layerMenu').open=false;e.target.value=''};
 window.addEventListener('pagehide',e=>{if(e.persisted)return;worker?.terminate();overview?.close();for(const t of cache.values())t.bitmap.close();cache.clear()},{once:true});schedule();
})();
