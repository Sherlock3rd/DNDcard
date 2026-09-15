(()=>{
 'use strict';const q=s=>document.querySelector(s),core=window.JOURNAL_CORE;
 let book=core.initial(),index=0,draft=null,linkPlaceId=null,pieceList=[],chosenPieceId='',linkRequest=0;document.body.dataset.journalLoading='true';
 const kinds={castle:'城堡',watchtower:'哨塔',fortress:'要塞',village:'村镇',windmill:'风车',port:'港口',mine:'矿井',lumber:'伐木场',crystal:'资源点',event:'事件',battle:'战场',treasure:'宝藏',traveler:'当前位置'};
 function renderPlaces(){
  q('#chapterPlaces').replaceChildren();for(const id of book.entries[index]?.placeIds||[]){
   const place=book.places.find(p=>p.id===id),row=document.createElement('div'),a=document.createElement('a'),small=document.createElement('small'),button=document.createElement('button');row.className='place-note';a.href='./map.html?journalPlace='+encodeURIComponent(id);a.textContent=place.name;a.title=place.note;
   const bound=pieceList.find(p=>p.id===place.pieceId);small.textContent=place.pieceId?(bound?'已关联：'+bound.name:'已关联地图棋子'):place.x===null?'待落点 ↗':'地图 ↗';a.append(small);
   button.type='button';button.className='link-place';button.dataset.linkPlace=id;button.textContent=place.pieceId?'更换关联':'关联棋子';button.setAttribute('aria-label',button.textContent+'：'+place.name);button.onclick=()=>openPlaceLink(id);row.append(a,button);q('#chapterPlaces').append(row);
  }
 }
 async function loadPieces(){
  if(!window.ADVENTURE_ARCHIVE||!window.MAP_SAVE_CORE)throw Error('地图存档尚未连接，请稍后重试。');
  const archive=await ADVENTURE_ARCHIVE.getLatest(),remote=archive.parts.map;let map=MAP_SAVE_CORE.validate(remote.snapshot);
  // Include this device's newer map edits without registering a second map writer.
  try{const cached=JSON.parse(localStorage.getItem('dndcard-archive-v1:map'));if(cached&&Number.isSafeInteger(cached.revision)&&!cached.conflict&&(cached.revision>=remote.revision||cached.dirty))map=MAP_SAVE_CORE.validate(cached.snapshot)}catch{}
  return map.pieces;
 }
 function renderPieceOptions(){
  const query=q('#pieceSearch').value.trim().toLocaleLowerCase(),select=q('#existingPiece');select.replaceChildren();
  for(const p of pieceList.filter(p=>(p.name+' '+(kinds[p.kind]||'')).toLocaleLowerCase().includes(query)))select.append(new Option(p.name+' · '+(kinds[p.kind]||'地图棋子'),p.id));
  select.value=chosenPieceId;q('#linkPieceSubmit').disabled=!pieceList.some(p=>p.id===chosenPieceId);q('#pieceSearchResult').textContent=select.options.length?'找到 '+select.options.length+' 个棋子':'没有找到棋子，请换个名称搜索。';
  const chosen=pieceList.find(p=>p.id===chosenPieceId);q('#selectedPieceName').textContent=chosen?'将关联到：'+chosen.name:'请选择一个已有棋子';
 }
 async function refreshPieces(){
  const request=++linkRequest;q('#linkPieceSubmit').disabled=true;q('#pieceLinkError').textContent='';q('#pieceSearchResult').textContent='正在读取已有地图棋子…';
  try{const list=await loadPieces();if(request!==linkRequest||!q('#placeLinkDialog').open)return;pieceList=list;renderPieceOptions();renderPlaces();const place=book.places.find(p=>p.id===linkPlaceId);if(place?.pieceId&&!pieceList.some(p=>p.id===place.pieceId))q('#pieceLinkError').textContent='原来关联的棋子已不存在，请重新选择。'}catch(e){if(request===linkRequest&&q('#placeLinkDialog').open){q('#pieceLinkError').textContent=e.message;q('#pieceSearchResult').textContent='读取未完成，请点击刷新棋子。'}}
 }
 function openPlaceLink(id){
  if(document.body.dataset.journalLoading==='true')return;const place=book.places.find(p=>p.id===id);if(!place)return;linkPlaceId=id;chosenPieceId=place.pieceId||'';
  q('#linkPlaceName').textContent=place.name;q('#linkPlaceNote').textContent=place.note;q('#pieceSearch').value='';q('#existingPiece').replaceChildren();q('#selectedPieceName').textContent='';q('#unlinkPiece').hidden=!place.pieceId;
  const count=book.entries.filter(e=>e.placeIds.includes(id)).length;q('#linkPlaceScope').textContent='日记保留这个称呼；引用它的 '+count+' 篇记录会共用此关联。不同称呼可以关联同一个棋子。';q('#placeLinkDialog').showModal();refreshPieces();
 }
 function commitPlaceLink(piece){
  const next=structuredClone(book),place=next.places.find(p=>p.id===linkPlaceId);if(!place)throw Error('这个日记地点已不存在。');
  const last=piece||pieceList.find(p=>p.id===place.pieceId);place.pieceId=piece?.id||null;if(last){place.x=last.x;place.y=last.y}core.validate(next);book=next;
  document.dispatchEvent(new CustomEvent('journal:change',{detail:structuredClone(book)}));q('#placeLinkDialog').close();renderPlaces();
 }
 q('#pieceSearch').oninput=renderPieceOptions;q('#existingPiece').onchange=e=>{chosenPieceId=e.target.value;renderPieceOptions()};q('#refreshPieces').onclick=refreshPieces;
 q('#placeLinkForm').onsubmit=async e=>{e.preventDefault();const id=linkPlaceId,selected=chosenPieceId,request=++linkRequest;q('#linkPieceSubmit').disabled=true;q('#pieceLinkError').textContent='';
  try{const list=await loadPieces();if(request!==linkRequest||id!==linkPlaceId||!q('#placeLinkDialog').open)return;pieceList=list;const piece=list.find(p=>p.id===selected);if(!piece)throw Error('这个棋子已被移除，请刷新后重新选择。');commitPlaceLink(piece)}catch(error){if(request===linkRequest&&q('#placeLinkDialog').open){q('#pieceLinkError').textContent=error.message;renderPieceOptions()}}
 };
 q('#unlinkPiece').onclick=()=>commitPlaceLink(null);q('#placeLinkDialog').querySelectorAll('[data-close-place-link]').forEach(b=>b.onclick=()=>q('#placeLinkDialog').close());q('#placeLinkDialog').addEventListener('close',()=>{linkPlaceId=null;linkRequest++});
 function render(){
  const fromHash=decodeURIComponent(location.hash.slice(1)),matched=book.entries.findIndex(e=>e.id===fromHash);if(matched>=0)index=matched;index=Math.max(0,Math.min(index,book.entries.length-1));
  const entry=book.entries[index];q('#editEntry').disabled=!entry;if(!entry){q('#chapterTitle').textContent='尚未落笔';q('#chapterBody').replaceChildren();q('#chapterPlaces').replaceChildren();q('#chapterPeople').textContent='';q('#sourceText').textContent='';q('#chapterImage').hidden=true;q('#chapterImage').removeAttribute('src');q('#chapterQuote').textContent='把今天记下来。';q('#entryList').replaceChildren();q('#pageProgress').textContent='0 / 0';q('#dayLabel').textContent='日期待记';q('#chapterNumber').textContent='';q('#imageCaption').textContent='';q('#previous').disabled=true;q('#next').disabled=true;return}
  q('#arcTitle').textContent=entry.arc;q('#dayLabel').textContent=entry.day;q('#chapterNumber').textContent='第 '+String(index+1).padStart(2,'0')+' 章';q('#chapterTitle').textContent=entry.title;
  q('#chapterBody').replaceChildren();for(const paragraph of entry.body.split(/\n+/)){const p=document.createElement('p');p.textContent=paragraph;q('#chapterBody').append(p)}
  if(window.JOURNAL_IMAGES){JOURNAL_IMAGES.show(entry.image,entry.title);JOURNAL_IMAGES.preload(book.entries,index)}else{const img=q('#chapterImage');img.hidden=!entry.image;if(entry.image){img.src=entry.image;img.alt=entry.title+' · 灰金色厚涂场景插画'}else img.removeAttribute('src')}
  q('#imageCaption').textContent=entry.image?'旅途片影 · '+entry.title:'此页的插画待添';q('#chapterQuote').textContent=entry.quote||'把今天记下来。';q('#sourceText').textContent=entry.source||'这一页尚未夹入原始团录。';
  renderPlaces();
  q('#chapterPeople').textContent='同页人物 · '+entry.people.join('、');q('#leftFolio').textContent=String(index*2+1).padStart(2,'0');q('#rightFolio').textContent=String(index*2+2).padStart(2,'0');q('#pageProgress').textContent=(index+1)+' / '+book.entries.length;q('#previous').disabled=index===0;q('#next').disabled=index===book.entries.length-1;
  q('#entryList').replaceChildren();book.entries.forEach((e,i)=>{const b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0')+' · '+e.title;b.setAttribute('aria-current',String(i===index));const small=document.createElement('small');small.textContent=e.day;b.append(small);b.onclick=()=>{navigate(i);contents(false)};q('#entryList').append(b)});
  document.title=entry.title+' · 冒险日志';
 }
 function navigate(i){if(i<0||i>=book.entries.length)return;index=i;history.replaceState(null,'','#'+encodeURIComponent(book.entries[i].id));render();q('.reading-scroll').scrollTop=0;q('.source-note').open=false}
 function contents(open){q('#contents').hidden=!open;q('#contentsToggle').setAttribute('aria-expanded',String(open))}
 function edit(isNew){draft=isNew?{id:crypto.randomUUID(),arc:book.entries[index]?.arc||'行旅手记',title:'',day:'日期待记',body:'',quote:'',source:'',people:[],placeIds:[],image:''}:structuredClone(book.entries[index]);
  q('#editorTitle').textContent=isNew?'续写一页':'补记这一页';q('#entryTitle').value=draft.title;q('#entryDay').value=draft.day;q('#entryBody').value=draft.body;q('#entrySource').value=draft.source;q('#entryImage').value=draft.image;
  q('#entryPlace').replaceChildren(new Option('不关联地点',''));for(const p of book.places)q('#entryPlace').append(new Option(p.name,p.id));q('#entryPlace').value=draft.placeIds[0]||'';q('#editorError').textContent='';q('#entryEditor').showModal();q('#entryTitle').focus();
 }
 q('#previous').onclick=()=>navigate(index-1);q('#next').onclick=()=>navigate(index+1);q('#contentsToggle').onclick=()=>contents(q('#contents').hidden);q('#closeContents').onclick=()=>contents(false);q('#editEntry').onclick=()=>edit(false);q('#newEntry').onclick=()=>edit(true);
 q('#entryForm').onsubmit=e=>{e.preventDefault();if(!draft)return;try{const updated={...draft,title:q('#entryTitle').value.trim(),day:q('#entryDay').value.trim(),body:q('#entryBody').value.trim(),source:q('#entrySource').value,image:q('#entryImage').value.trim()};const place=q('#entryPlace').value;
   // Keep multi-place links unless the first-place selector was changed.
   updated.placeIds=place===(draft.placeIds[0]||'')?draft.placeIds:place?[place]:[];const next=structuredClone(book),at=next.entries.findIndex(x=>x.id===updated.id);if(at<0)next.entries.push(updated);else next.entries[at]=updated;core.validate(next);book=next;
   document.dispatchEvent(new CustomEvent('journal:change',{detail:structuredClone(book)}));q('#entryEditor').close();navigate(next.entries.findIndex(x=>x.id===updated.id));
  }catch(error){q('#editorError').textContent=error.message}};
 q('#entryEditor').querySelectorAll('[data-cancel-edit]').forEach(b=>b.onclick=()=>q('#entryEditor').close());q('#entryEditor').addEventListener('close',()=>{draft=null});
 window.addEventListener('hashchange',()=>render());document.addEventListener('keydown',e=>{if(q('#entryEditor').open||q('#placeLinkDialog').open||e.target.matches('input,textarea,select'))return;if(e.key==='ArrowRight')navigate(index+1);if(e.key==='ArrowLeft')navigate(index-1);if(e.key==='Escape')contents(false)});
 let loadedPieceNames=false;
 window.JournalAPI={read:()=>structuredClone(book),apply:s=>{book=core.validate(s);render()},canApply:()=>!q('#entryEditor').open&&!q('#placeLinkDialog').open,ready:()=>{document.body.dataset.journalLoading='false';if(!loadedPieceNames&&window.ADVENTURE_ARCHIVE){loadedPieceNames=true;loadPieces().then(list=>{pieceList=list;renderPlaces()}).catch(()=>{loadedPieceNames=false})}},block:()=>{q('#editEntry').disabled=true;q('#newEntry').disabled=true}};render();
})();
