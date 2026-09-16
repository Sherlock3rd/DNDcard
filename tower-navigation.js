(()=>{
 'use strict';
 const q=s=>document.querySelector(s),isIndex=!!q('#characterApp'),kind=isIndex?'index':q('#boardViewport')?'board':document.body.dataset.workspace==='journal'?'journal':'map';
 const icons={journal:'M4 3h13a3 3 0 0 1 3 3v15H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3M7 3v18M11 8h5M11 12h5',room:'M3 21V8l9-5 9 5v13M3 10h18M9 21v-8h6v8',board:'M3 4h18v15H3zM7 8h3v3H7zM15 7h3v3h-3zM12 14h4v2h-4M10 10l5-2M9 11l4 4',map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5m6-2v16m6-14v16',character:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-3a8 8 0 0 1 16 0v3',tools:'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6'};
 const icon=id=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${icons[id]}"/></svg>`;
 const chrome=document.createElement('div');chrome.className='tower-bar';chrome.setAttribute('role','banner');
 chrome.innerHTML='<a class="tower-wordmark" href="./index.html#portal">THE BLACK TOWER</a><nav class="tower-nav" aria-label="主要导航">'+[['room','书房',isIndex?'#portal':'./index.html#portal'],['journal','冒险日记','./journal.html'],['map','地图桌','./map.html'],['board','案件板','./caseboard.html'],['character','人物',isIndex?'#overview':'./index.html#overview']].map(([id,label,href])=>`<a href="${href}" data-tower-page="${id}" title="${label}">${icon(id)}<span>${label}</span></a>`).join('')+'</nav>';
 document.body.prepend(chrome);document.body.classList.add('tower-layout');
 const dock=document.createElement('aside');dock.className='tower-dock';dock.setAttribute('aria-label','当前页面操作');
 dock.innerHTML='<section id="towerToolsPanel" class="tower-tools-panel" aria-label="页面工具" hidden><div class="tower-tools-heading"><strong></strong><button type="button" aria-label="收起页面工具">×</button></div><div class="tower-tools-content"></div></section><div class="tower-dock-row"><div class="tower-primary-actions"></div><button id="towerToolsToggle" type="button" aria-expanded="false" aria-controls="towerToolsPanel">'+icon('tools')+'<span>工具</span></button></div>';
 document.body.append(dock);
 const panel=q('#towerToolsPanel'),content=q('.tower-tools-content'),primary=q('.tower-primary-actions'),toggle=q('#towerToolsToggle');
 const panes={};
 function pane(id){const p=document.createElement('div');p.dataset.toolsPage=id;content.append(p);panes[id]=p;return p}
 function move(selector,parent){const e=q(selector);if(e)parent.append(e);return e}
 function setOpen(open,focus=false){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(!open)panel.querySelectorAll('details[open]').forEach(d=>d.open=false);if(focus)toggle.focus()}
 toggle.onclick=()=>setOpen(panel.hidden);q('.tower-tools-heading button').onclick=()=>setOpen(false,true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){setOpen(false,true)}});
 document.addEventListener('pointerdown',e=>{if(!dock.contains(e.target)&&!panel.hidden)setOpen(false)});
 panel.addEventListener('click',e=>{if(e.target.closest('#contentsToggle,#newEntry,#journalSaveStatus,#boardNew,#boardNewZone,#boardConnect,#toggle,#journalPlacesToggle,#mapSaveStatus,[data-open-archive],[data-open-bookshelf],[data-open-journal]'))setOpen(false)});
 if(kind==='board'){
  move('#boardEdit',primary);move('#boardFit',primary);const p=pane('board'),old=q('.case-frame>header nav');old.querySelectorAll('a').forEach(a=>a.remove());while(old.firstChild)p.append(old.firstChild);move('[data-open-archive]',p);
 }else if(kind==='map'){
  move('#moveMode',primary);move('#wholeMap',primary);const p=pane('map'),old=q('main>header nav');old.querySelectorAll('a[href*="index.html"]').forEach(a=>a.remove());while(old.firstChild)p.append(old.firstChild);move('#mapSaveStatus',p);move('#mapContext',p);if(q('#journalSaveStatus'))q('#journalSaveStatus').hidden=true;
 }else if(kind==='journal'){
  move('#contentsToggle',primary);move('#newEntry',primary);const p=pane('journal');move('#journalSaveStatus',p);move('[data-fullscreen]',p);q('.journal-toolbar').hidden=true;
 }else{
  pane('room').innerHTML='<button type="button" data-open-bookshelf>书架与设置</button>';
  const p=pane('character');move('#saveState',p);move('#levelUpButton',primary);q('.character-home-button')?.remove();
 }
 document.querySelectorAll('.case-frame>header,main>header,#characterApp>.topbar').forEach(h=>h.hidden=true);
 function update(){const current=isIndex?(document.body.dataset.route==='character'?'character':'room'):kind;chrome.querySelectorAll('[data-tower-page]').forEach(a=>{if(a.dataset.towerPage===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});Object.entries(panes).forEach(([id,p])=>p.hidden=id!==current);if(isIndex)primary.hidden=current!=='character';q('.tower-tools-heading strong').textContent=({room:'书房',board:'案件板',map:'地图桌',character:'人物',journal:'日记'}[current])+'工具';setOpen(false)}
 update();if(isIndex)new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:['data-route']});
})();
