(()=>{
 'use strict';const q=s=>document.querySelector(s),core=window.JOURNAL_CORE;
 let book=core.initial(),index=0,draft=null;document.body.dataset.journalLoading='true';
 function render(){
  const fromHash=decodeURIComponent(location.hash.slice(1)),matched=book.entries.findIndex(e=>e.id===fromHash);if(matched>=0)index=matched;index=Math.max(0,Math.min(index,book.entries.length-1));
  const entry=book.entries[index];q('#editEntry').disabled=!entry;if(!entry){q('#chapterTitle').textContent='尚未落笔';q('#chapterBody').replaceChildren();q('#chapterPlaces').replaceChildren();q('#chapterPeople').textContent='';q('#sourceText').textContent='';q('#chapterImage').hidden=true;q('#chapterImage').removeAttribute('src');q('#chapterQuote').textContent='把今天记下来。';q('#entryList').replaceChildren();q('#pageProgress').textContent='0 / 0';q('#dayLabel').textContent='日期待记';q('#chapterNumber').textContent='';q('#imageCaption').textContent='';q('#previous').disabled=true;q('#next').disabled=true;return}
  q('#arcTitle').textContent=entry.arc;q('#dayLabel').textContent=entry.day;q('#chapterNumber').textContent='第 '+String(index+1).padStart(2,'0')+' 章';q('#chapterTitle').textContent=entry.title;
  q('#chapterBody').replaceChildren();for(const paragraph of entry.body.split(/\n+/)){const p=document.createElement('p');p.textContent=paragraph;q('#chapterBody').append(p)}
  const img=q('#chapterImage');img.hidden=!entry.image;if(entry.image){img.src=entry.image;img.alt=entry.title+' · 灰金色厚涂场景插画'}else img.removeAttribute('src');
  q('#imageCaption').textContent=entry.image?'旅途片影 · '+entry.title:'此页的插画待添';q('#chapterQuote').textContent=entry.quote||'把今天记下来。';q('#sourceText').textContent=entry.source||'这一页尚未夹入原始团录。';
  q('#chapterPlaces').replaceChildren();for(const id of entry.placeIds){const place=book.places.find(p=>p.id===id),a=document.createElement('a');a.href='./map.html?journalPlace='+encodeURIComponent(id);a.textContent=place.name;const small=document.createElement('small');small.textContent=place.x===null?'待落点 ↗':'地图 ↗';a.append(small);a.title=place.note;q('#chapterPlaces').append(a)}
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
 window.addEventListener('hashchange',()=>render());document.addEventListener('keydown',e=>{if(q('#entryEditor').open||e.target.matches('input,textarea,select'))return;if(e.key==='ArrowRight')navigate(index+1);if(e.key==='ArrowLeft')navigate(index-1);if(e.key==='Escape')contents(false)});
 window.JournalAPI={read:()=>structuredClone(book),apply:s=>{book=core.validate(s);render()},canApply:()=>!q('#entryEditor').open,ready:()=>{document.body.dataset.journalLoading='false'},block:()=>{q('#editEntry').disabled=true;q('#newEntry').disabled=true}};render();
})();
