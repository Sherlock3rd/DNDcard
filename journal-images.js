(()=>{
 'use strict';const cache=new Map();let sequence=0;
 const originals=new Set(['01-bequest','02-departure','03-recruitment','04-town','05-banner']);
 function source(path){const match=path.match(/^assets\/images\/journal\/([^/]+)\.png$/);return match&&originals.has(match[1])?path.replace(/\.png$/,'.webp'):path}
 function load(path,priority='low'){
  const src=source(path);if(cache.has(src))return cache.get(src);const image=new Image();image.decoding='async';image.fetchPriority=priority;
  const pending=new Promise((resolve,reject)=>{image.onload=async()=>{try{if(image.decode)await image.decode()}catch{}resolve(src)};image.onerror=()=>{cache.delete(src);reject(Error('插画暂未加载'))};image.src=src});cache.set(src,pending);return pending;
 }
 function show(path,title){
  const id=++sequence,img=document.querySelector('#chapterImage'),status=document.querySelector('#imageStatus');status.onclick=null;
  img.hidden=!path;img.removeAttribute('src');img.alt=title+' · 灰金色厚涂场景插画';status.hidden=!path;status.textContent='正在翻开这一页的插画…';img.closest('figure').setAttribute('aria-busy',String(!!path));
  if(!path)return;
  load(path,'high').then(src=>{if(id!==sequence)return;img.src=src;status.hidden=true;img.closest('figure').setAttribute('aria-busy','false')}).catch(()=>{if(id!==sequence)return;status.textContent='插画加载失败，点击重试';img.closest('figure').setAttribute('aria-busy','false');status.onclick=()=>show(path,title)});
 }
 function preload(entries,index){for(const i of [index+1,index-1])if(entries[i]?.image)load(entries[i].image).catch(()=>{})}
 window.JOURNAL_IMAGES={show,preload,source};
})();
