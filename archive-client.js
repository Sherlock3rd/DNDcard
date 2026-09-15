(()=>{
 'use strict';
 const config=window.DND_CLOUD_CONFIG,core=window.ARCHIVE_CORE;
 if(!config||!core||new URLSearchParams(location.search).has('showcase'))return;
 const stores=new Map(),names={character:'角色与装备',map:'地图',journal:'日志'},validators={character:window.DND_CLOUD_CORE?.validate,map:window.MAP_SAVE_CORE?.validate,journal:window.JOURNAL_CORE?.validate};
 let client,user=null,latest=null,gitRevision=0,lastGitCheck=0,gitError=false,fetching=null,timer,started=false;
 const dialog=document.createElement('dialog');dialog.className='archive-dialog';dialog.id='adventureSaveDialog';
 dialog.innerHTML='<h2>冒险档案</h2><p>当前邮箱的一份完整档案 · 角色、装备、地图与日志</p><p data-summary role="status"></p><p data-git></p><p data-error role="alert"></p><div data-parts></div><form data-auth><label>主人邮箱<input name="email" type="email" autocomplete="email" required></label><label>密码<input name="password" type="password" autocomplete="current-password" required></label><button type="submit">登录并同步</button><p>查看无需登录；新设备首次编辑后，登录现有邮箱即可回传。此处不创建新账号。</p></form><p data-identity></p><div class="archive-actions"><button data-refresh>立即检查同步</button><button data-download>下载完整档案</button><button data-backup>下载本页恢复副本</button><button data-logout hidden>退出本机登录</button><button data-close>关闭</button></div><p>Git 自动备份按约五分钟一批运行，排队时可能延后。地图、日志、角色修改先保存到云端，网页关闭后仍会回传 Git。</p><a href="https://github.com/Sherlock3rd/DNDcard/blob/main/data/save/latest.json" target="_blank" rel="noopener">查看 Git 基础存档与历史 ↗</a>';
 document.body.append(dialog);const q=s=>dialog.querySelector(s);
 const label={loading:'读取最新档案',syncing:'正在同步',synced:'已同步',pending:'等待上传',local:'本机已保存 · 登录后上传',error:'离线或同步未完成',editing:'完成编辑后读取最新',conflict:'版本冲突 · 副本已保留','storage-error':'本机存储冲突 · 请保留副本'};
 function update(){
  const list=[...stores.values()],bad=list.find(s=>['error','storage-error','conflict'].includes(s.status)),pending=list.some(s=>s.entry?.dirty),loading=list.some(s=>!s.ready);
  const text=bad?label[bad.status]:loading?'读取最新冒险档案…':pending?(user?'本机已保存 · 正在同步':'本机已保存 · 登录后同步'):user?'冒险档案已同步':'最新冒险档案 · 未登录';
  document.querySelectorAll('[data-cloud-status],#mapSaveStatus,#journalSaveStatus,[data-archive-status]').forEach(el=>{el.textContent=text;el.dataset.state=bad?.status||'ready'});
  q('[data-summary]').textContent=text+(latest?' · 档案版本 '+latest.revision:'');q('[data-error]').textContent=bad?.error||'';
  q('[data-git]').textContent=gitRevision?(gitRevision>=(latest?.revision||0)?'Git 基础存档已更新 · 版本 '+gitRevision:'Git 已备份至版本 '+gitRevision+' · 新修改等待下一批回传'):gitError?'Git 状态暂未读取成功 · 云端存档仍保留':'正在检查 Git 基础存档';
  q('[data-auth]').hidden=!!user;q('[data-identity]').textContent=user?'已登录：'+user.email:'';q('[data-logout]').hidden=!user;
  q('[data-parts]').replaceChildren();for(const s of list){const row=document.createElement('section'),p=document.createElement('p');p.textContent=names[s.name]+'：'+label[s.status]+(s.entry?' · v'+s.entry.revision:'');row.append(p);if(s.entry?.conflict)for(const [caption,local] of [['读取云端最新',false],['保留本页修改',true]]){const b=document.createElement('button');b.textContent=caption;b.onclick=()=>s.resolve(local);row.append(b)}q('[data-parts]').append(row)}
 }
 async function json(url,options={}){const r=await fetch(url,{cache:'no-store',...options,signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('请求暂不可用（'+r.status+'）');return r.json()}
 async function getGit(){try{return await json(config.archiveGitApiUrl,{headers:{Accept:'application/vnd.github.raw+json'}})}catch{return json(config.archiveGitUrl+'?t='+Math.floor(Date.now()/300000))}}
 async function getLatest(){
  if(fetching)return fetching;
  fetching=(async()=>{
   let a;try{const rows=await json(config.url+'/rest/v1/adventure_archive?id=eq.main&select=snapshot',{headers:{apikey:config.publishableKey}});a=rows[0]?.snapshot}
   catch(e){try{a=await getGit()}catch{a=await json('./data/save/latest.json?revision='+Date.now())}}
   a=core.validateArchive(a,validators);if(latest&&a.revision<latest.revision)return latest;latest=a;update();return a;
  })().finally(()=>{fetching=null});return fetching;
 }
 async function checkGit(){if(Date.now()-lastGitCheck<300000)return;lastGitCheck=Date.now();try{const a=core.validateArchive(await getGit());gitRevision=a.revision;gitError=false}catch{gitError=true}update()}
 async function savePart(name,revision,snapshot){
  const {data,error}=await client.auth.getSession();if(error)throw error;if(data.session?.user.id!==config.ownerId)throw Error('请使用当前主人的邮箱登录');
  const ids={character:['character_id','gandalf'],map:['map_id','faerun-3.5'],journal:['journal_id','gandalf-adventures']},[key,id]=ids[name];
  const result=await json(config.url+'/rest/v1/rpc/save_'+name,{method:'POST',headers:{apikey:config.publishableKey,Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},body:JSON.stringify({['p_'+key]:id,p_expected_revision:revision,p_snapshot:snapshot})});
  // The database trigger publishes a complete snapshot in the same transaction.
  if(result.status==='saved')latest=null;return result;
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(syncAll,1000)}
 async function syncAll(){await Promise.all([...stores.values()].map(s=>s.sync()));try{await getLatest()}catch{}checkGit()}
 function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 function open(){update();if(!dialog.open)dialog.showModal()}
 q('[data-close]').onclick=()=>dialog.close();q('[data-refresh]').onclick=syncAll;
 q('[data-download]').onclick=async()=>{try{const a=structuredClone(await getLatest());for(const s of stores.values())if(s.entry?.dirty){q('[data-error]').textContent='本页还有未上传修改，请先同步或下载本页恢复副本。';return}download(a,'adventure-latest.json')}catch(e){q('[data-error]').textContent=e.message}};
 q('[data-backup]').onclick=()=>{const backups=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('dndcard-archive-backup:'))backups.push(JSON.parse(localStorage.getItem(k)))}download({format:'adventure-recovery',parts:Object.fromEntries([...stores].map(([k,s])=>[k,s.entry])),backups},'adventure-recovery.json')};
 q('[data-auth]').onsubmit=async e=>{e.preventDefault();const button=q('[data-auth] button');button.disabled=true;try{const {error}=await client.auth.signInWithPassword({email:q('[name=email]').value.trim(),password:q('[name=password]').value});if(error)throw error}catch(e){q('[data-error]').textContent=e.message}finally{q('[name=password]').value='';button.disabled=false}};
 q('[data-logout]').onclick=async()=>{await client.auth.signOut({scope:'local'})};dialog.addEventListener('close',()=>{q('[name=password]').value='' });
 document.addEventListener('click',e=>{if(e.target.closest('[data-open-cloud],[data-open-git-sync],#mapSaveStatus,#journalSaveStatus,[data-open-archive]')){e.preventDefault();open()}},true);
 window.addEventListener('beforeunload',e=>{if([...stores.values()].some(s=>s.status==='storage-error')){e.preventDefault();e.returnValue=''}});
 function register(name,adapter){
  const s=new core.PartStore({name,storage:localStorage,validate:validators[name],...adapter,load:async()=>(await getLatest()).parts[name],save:(revision,snapshot)=>savePart(name,revision,snapshot),notify:s=>{update();if(s.ready)adapter.ready?.();if(s.status==='pending')schedule()}});stores.set(name,s);
  const event=name==='character'?'dndcard:local-save':name+':'+(name==='map'?'save':'change');(name==='character'?window:document).addEventListener(event,e=>{try{s.capture(e.detail||adapter.read());schedule()}catch(error){s.report('storage-error',error.message)}});
  return s;
 }
 if(window.MapTable){register('map',{read:MapTable.read,apply:MapTable.apply,canApply:MapTable.canApply,ready:()=>{document.querySelector('#viewport').inert=false}})}
 if(window.JournalAPI){register('journal',{read:JournalAPI.read,apply:JournalAPI.apply,canApply:JournalAPI.canApply,ready:JournalAPI.ready})}
 if(typeof managerState!=='undefined'&&typeof state!=='undefined'){
  document.body.dataset.archiveLoading='true';
  const apply=s=>{const old=window.DND_ITEM_DATA.snapshot(managerState,state,'full');localStorage.setItem('dndcard-cloud-restore-journal',JSON.stringify(old));try{localStorage.setItem('gandalf-5e-manager',JSON.stringify(s.payload.manager));localStorage.setItem('gandalf-5e-state',JSON.stringify(s.payload.state))}catch(e){localStorage.setItem('gandalf-5e-manager',JSON.stringify(old.payload.manager));localStorage.setItem('gandalf-5e-state',JSON.stringify(old.payload.state));throw e}managerState=structuredClone(s.payload.manager);state=structuredClone(s.payload.state);localStorage.removeItem('dndcard-cloud-restore-journal');syncCharacterSheet();renderSpellManager();renderInventoryManager();renderFeatManager();renderPortalRoute()};
  register('character',{read:()=>DND_ITEM_DATA.snapshot(managerState,state,'full'),apply,canApply:()=>![...document.querySelectorAll('dialog[open]')].some(el=>el!==dialog&&el.id!=='settingsDialog'),ready:()=>{document.body.dataset.archiveLoading='false'}});
 }
 window.ADVENTURE_ARCHIVE={open,getLatest,stores};
 // Do not let early default UI edits run before the first validated snapshot arrives.
 document.addEventListener('click',e=>{if(document.body.dataset.archiveLoading==='true'&&e.target.closest('#characterApp button')){e.preventDefault();e.stopImmediatePropagation()}},true);
 window.addEventListener('storage',e=>{for(const s of stores.values())if(e.key===s.key)try{s.external()}catch(error){s.report('storage-error',error.message)}});
 window.addEventListener('online',syncAll);window.addEventListener('focus',()=>{if(started)syncAll()});document.addEventListener('visibilitychange',()=>{if(started&&!document.hidden)syncAll()});setInterval(()=>{if(started&&!document.hidden&&navigator.onLine)syncAll()},15000);
 async function auth(next){user=next?.id===config.ownerId?next:null;for(const s of stores.values())s.authorized=!!user;if(next&&!user)q('[data-error]').textContent='此账号不是档案主人；只保留本机修改。';update();if(started)await syncAll()}
 (async()=>{try{client=window.DND_SHARED_CLOUD_CLIENT||(window.DND_SHARED_CLOUD_CLIENT=window.DND_SUPABASE.createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));client.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>auth(session?.user),0)});const {data,error}=await client.auth.getSession();if(error)throw error;await auth(data.session?.user)}catch(e){q('[data-error]').textContent='账号连接暂不可用，仍可读取公开存档'}started=true;await syncAll()})();
})();
