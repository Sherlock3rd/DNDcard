// Links store stable piece IDs; names and coordinates always come from the map.
(()=>{
 'use strict';let map=null;
 const core=window.CASEBOARD_CORE;
 const api={
  pieces:()=>map?.pieces||[],
  ready:()=>!!map,
  find:id=>map?.pieces.find(p=>p.id===id),
  set:s=>{map=window.MAP_SAVE_CORE.validate(s);document.dispatchEvent(new Event('board:map-context'))},
  fill(select,id){select.replaceChildren(new Option('未关联地点',''));for(const p of api.pieces())select.append(new Option(p.name,p.id));if(id&&!api.find(id))select.append(new Option('原地点已移除',id));select.value=id||'';select.disabled=!map},
  preview:n=>{const p=core.personPreview(n);return (p.role||'职业：？')+' · 等级 '+(p.level??'？')+(p.status?'（'+p.status+'）':'')},
  location(n){const section=document.createElement('section');section.className='person-map-location';const h=document.createElement('h3');h.textContent='地图地点';section.append(h);const p=api.find(n.mapPieceId),line=document.createElement(p?'a':'p');line.textContent=p?p.name:n.mapPieceId?'原地点已移除，请重新关联':map?'尚未关联':'正在读取地图地点…';if(p)line.href='./map.html?piece='+encodeURIComponent(p.id);section.append(line);return section},
  sameName:(nodes,name)=>nodes.filter(n=>n.kind==='person'&&n.name.trim()===name.trim()&&!/^[?？\s]+$/.test(name))
 };
 window.BOARD_MAP_LINKS=api;
 document.addEventListener('archive:latest',e=>{if(e.detail.parts.map)api.set(e.detail.parts.map.snapshot)});
})();
