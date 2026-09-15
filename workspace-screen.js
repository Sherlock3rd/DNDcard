(()=>{
 'use strict';const kind=document.body.dataset.workspace;if(!kind)return;
 const button=document.querySelector('[data-fullscreen]'),root=document.documentElement;
 const status=document.createElement('span');status.className='screen-status';status.setAttribute('role','status');document.body.append(status);let timer;
 function announce(text){status.textContent=text;clearTimeout(timer);timer=setTimeout(()=>{status.textContent=''},4500)}
 function update(){const native=!!document.fullscreenElement,focus=document.body.classList.contains('focus-screen');button.textContent=native?'退出全屏':focus?'退出专注':'全屏';button.setAttribute('aria-pressed',String(native||focus));}
 button.onclick=async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.body.classList.contains('focus-screen'))document.body.classList.remove('focus-screen');else if(root.requestFullscreen){try{await root.requestFullscreen()}catch{document.body.classList.add('focus-screen');announce('浏览器未开放全屏，已铺满当前窗口。')}}else{document.body.classList.add('focus-screen');announce('已铺满当前窗口。')}}catch{announce('全屏切换未完成，请重试。')}update();
 };
 document.addEventListener('fullscreenchange',update);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('focus-screen')){document.body.classList.remove('focus-screen');update()}});update();
 if(kind==='journal'){
  const page=document.querySelector('.picture-page'),scroll=document.createElement('div');scroll.className='picture-scroll';scroll.setAttribute('aria-label','插画与沿途记号');scroll.tabIndex=0;
  const contents=[...page.children].filter(el=>!el.matches('.running-head,.folio'));page.insertBefore(scroll,contents[0]);contents.forEach(el=>scroll.append(el));
  document.querySelector('.reading-scroll').tabIndex=0;document.querySelector('.reading-scroll').setAttribute('aria-label','日记正文');
 }else{
  const detail=document.querySelector('#details'),heading=document.createElement('div'),scroll=document.createElement('div');heading.className='map-panel-heading';scroll.className='map-panel-scroll';
  ['#closeDetails','#pointTitle','#pointType','.actions'].forEach(selector=>heading.append(detail.querySelector(selector)));[...detail.children].forEach(el=>scroll.append(el));detail.append(heading,scroll);
  // Panels share the same small canvas; opening one must not bury another panel's controls.
  const panels=[...document.querySelectorAll('#tray,#details,#journalPlacesPanel')];
  const closeButtons={tray:'#close',details:'#closeDetails',journalPlacesPanel:'#closeJournalPlaces'};
  const watcher=new MutationObserver(records=>{const opened=records.filter(r=>r.oldValue!==null&&!r.target.hidden).at(-1)?.target;if(opened)for(const p of panels)if(p!==opened&&!p.hidden)p.querySelector(closeButtons[p.id]).click()});
  panels.forEach(p=>watcher.observe(p,{attributes:true,attributeFilter:['hidden'],attributeOldValue:true}));
 }
})();
