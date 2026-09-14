(function(){
  'use strict';
  const table=window.JournalAPI,core=window.JOURNAL_CORE,button=document.querySelector('#journalSaveStatus');
  if(!button||!table)return;
  const demo=false;
  if(demo){button.textContent='演示模式 · 不写入正式存档';button.disabled=true;return}
  let store,client,timer,authSequence=0,ready=false;
  const dialog=document.createElement('dialog');dialog.className='journal-sync-dialog';
  dialog.innerHTML=`<h2>日志存档</h2><p data-status role="status" aria-live="polite"></p><p data-error role="alert"></p>
    <p>每次修改立即保存到本机。登录书房账号后自动提交云端，断网期间保留待上传内容。</p>
    <p data-account></p><a class="map-return" href="./index.html#portal" data-login>返回书房登录账号</a>
    <section data-conflict hidden><p data-summary></p><p>两份日志会先保留备份，选择后作为后续同步版本。</p><button data-remote>使用云端版本</button><button data-local>保留本机版本</button></section>
    <div class="journal-sync-actions"><button data-retry>立即同步 / 重试</button><button data-download>下载当前日志</button><button data-backups>下载保留的副本</button><button data-close>关闭</button></div>`;
  document.body.append(dialog);const q=s=>dialog.querySelector(s);
  const text={local:'本机已保存 · 未登录云端',connecting:'本机已保存 · 正在连接云端',pending:'本机已保存 · 等待上传',syncing:'本机已保存 · 正在同步',synced:'云端已同步',empty:'账号暂无日志 · 编辑后自动上传',conflict:'本机已保存 · 存在版本冲突',editing:'本机已保存 · 完成编辑后读取云端',error:'本机已保存 · 云端未同步', 'storage-error':'本机保存失败 · 请勿关闭页面'};
  function update(s){
    button.textContent=text[s.status]||s.status;button.dataset.state=s.status;
    q('[data-status]').textContent=button.textContent+(s.entry.revision?' · 版本 '+s.entry.revision:'');q('[data-error]').textContent=s.error||'';
    q('[data-account]').textContent=s.user?'使用当前书房账号同步 · 私有日志':'尚未登录；本机编辑会保留';q('[data-login]').hidden=!!s.user;
    q('[data-conflict]').hidden=!s.entry.conflict;
    if(s.entry.conflict){const row=s.entry.conflict.row;q('[data-summary]').textContent=`本机 ${s.entry.snapshot.entries.length} 章；云端 ${row?.snapshot.entries.length||0} 章（版本 ${row?.revision||0}）。`;q('[data-remote]').disabled=!row}
    if(s.status==='pending'&&ready)schedule();
    if(s.status==='empty'&&store?.user){store.save(table.read());schedule()}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(()=>store?.sync(),1000)}
  function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  button.onclick=()=>dialog.showModal();q('[data-close]').onclick=()=>dialog.close();
  q('[data-download]').onclick=()=>download(table.read(),'adventure-journal.json');
  q('[data-backups]').onclick=()=>{try{const backups=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith(core.prefix+'backup:')){const item=JSON.parse(localStorage.getItem(key));if(item.owner===(store?.user||null))backups.push(item)}}download(backups,'journal-backups.json')}catch(e){q('[data-error]').textContent=e.message}};
  q('[data-retry]').onclick=()=>{if(!store){location.reload();return}try{store.persist();if(ready)store.sync();else connect()}catch(e){store.report('storage-error',e.message)}};
  for(const [selector,local] of [['[data-local]',true],['[data-remote]',false]])q(selector).onclick=()=>store?.resolve(local).catch(e=>{q('[data-error]').textContent=e.message});
  async function request(user,path,body){
    const {data,error}=await client.auth.getSession();if(error)throw error;
    if(data.session?.user.id!==user)throw Error('登录状态已变化，请重新登录');
    const config=window.DND_CLOUD_CONFIG;
    const response=await fetch(config.url+'/rest/v1/'+path,{method:body?'POST':'GET',headers:{apikey:config.publishableKey,Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
    const result=await response.json();if(!response.ok)throw Error(result.message||'服务器暂不可用');return result;
  }
  async function adopt(id){if(id!==store.user&&!table.canApply()){ready=false;store.report('editing');return}ready=true;await store.setUser(id)}
  async function connect(){
    try{
      const config=window.DND_CLOUD_CONFIG;
      if(!client){
        client=window.DND_SHARED_CLOUD_CLIENT||(window.DND_SHARED_CLOUD_CLIENT=window.DND_SUPABASE.createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false},global:{fetch:(url,options)=>fetch(url,{...options,signal:options?.signal||AbortSignal.timeout(15000)})}}));
        client.auth.onAuthStateChange((_event,session)=>{
          const sequence=++authSequence;
          setTimeout(async()=>{if(sequence!==authSequence)return;try{await adopt(session?.user.id||null)}catch(e){ready=false;store.report('storage-error',e.message)}},0);
        });
      }
      const sequence=++authSequence,{data,error}=await client.auth.getSession();if(sequence!==authSequence)return;if(error)throw error;
      await adopt(data.session?.user.id||null);
    }catch(e){ready=false;store?.report('error','账号连接失败：'+e.message)}
  }
  function start(){
    try{
      store=new core.Store({storage:localStorage,apply:table.apply,notify:update,canApply:table.canApply,remote:{async load(user){return (await request(user,'journal_saves?select=*&user_id=eq.'+encodeURIComponent(user)+'&journal_id=eq.gandalf-adventures'))[0]||null},save(user,revision,snapshot){return request(user,'rpc/save_journal',{p_journal_id:'gandalf-adventures',p_expected_revision:revision,p_snapshot:snapshot})}}});
      store.persist();table.ready?.();
      document.addEventListener('journal:change',e=>{try{store.save(e.detail);if(ready)schedule()}catch(error){store.report('storage-error',error.message)}});
      window.addEventListener('storage',e=>{if(e.key!==store.key)return;if(store.entry.dirty||!table.canApply()){store.report('storage-error','另一页面已修改日志，请先下载本页副本，再刷新');return}try{store.epoch++;store.entry=store.readEntry(store.key);table.apply(store.entry.snapshot);store.report(store.entry.dirty?'pending':store.user?'synced':'local')}catch(error){store.report('storage-error',error.message)}});
      window.addEventListener('beforeunload',e=>{if(store.status==='storage-error'){e.preventDefault();e.returnValue=''}});
      window.addEventListener('online',()=>ready?store.sync():connect());window.addEventListener('focus',()=>ready?store.sync():connect());
      document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ready)store.sync()});
      setInterval(()=>{if(!document.hidden&&navigator.onLine){if(ready)store.sync();else connect()}},15000);
      connect();
    }catch(e){button.textContent='日志存档读取失败 · 请勿编辑';q('[data-error]').textContent=e.message;table.block?.()}
  }
  start();
})();
