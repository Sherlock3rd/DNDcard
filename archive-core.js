(function(root){
 'use strict';
 const copy=v=>JSON.parse(JSON.stringify(v));
 const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
 const equal=(a,b)=>JSON.stringify(stable(a?.format==='dndcard-snapshot'?a.payload:a))===JSON.stringify(stable(b?.format==='dndcard-snapshot'?b.payload:b));
 function validateArchive(a,validators){
  if(!a||a.format!=='dndcard-adventure'||a.version!==1||!Number.isSafeInteger(a.revision)||a.revision<1||!Number.isFinite(Date.parse(a.updatedAt)))throw Error('完整存档格式无效');
  for(const name of ['character','map','journal']){const p=a.parts?.[name];if(!p||!Number.isSafeInteger(p.revision)||p.revision<1||!Number.isFinite(Date.parse(p.updatedAt)))throw Error('存档缺少 '+name);if(validators?.[name])validators[name](p.snapshot)}
  return copy(a);
 }
 class PartStore{
  constructor({name,storage,validate,read,apply,load,save,canApply=()=>true,notify=()=>{}}){
   Object.assign(this,{name,storage,validate,read,apply,load,remoteSave:save,canApply,notify});this.key='dndcard-archive-v1:'+name;this.raw=storage.getItem(this.key);this.entry=this.raw?JSON.parse(this.raw):null;
   if(this.entry){validate(this.entry.snapshot);if(!Number.isSafeInteger(this.entry.revision)||this.entry.revision<1||typeof this.entry.dirty!=='boolean')throw Error('本机档案缓存损坏，已停止覆盖')}
   this.authorized=false;this.ready=false;this.queue=Promise.resolve();this.status='loading';this.error='';
  }
  report(s,error=''){this.status=s;this.error=error;this.notify(this)}
  backup(value,reason){try{this.storage.setItem('dndcard-archive-backup:'+this.name+':'+Date.now()+':'+Math.random().toString(36).slice(2),JSON.stringify({reason,createdAt:new Date().toISOString(),value}))}catch(e){e.archiveStorage=true;throw e}}
  persist(){try{if(this.storage.getItem(this.key)!==this.raw)throw Error('另一页面已保存，请保留本页副本后重新读取');const raw=JSON.stringify(this.entry);this.storage.setItem(this.key,raw);this.raw=raw}catch(e){e.archiveStorage=true;throw e}}
  capture(snapshot){
   if(!this.ready||!this.entry)throw Error('最新存档尚未读取');const checked=this.validate(snapshot);if(equal(checked,this.entry.snapshot))return;
   const next={...this.entry,snapshot:checked,dirty:true};
   try{if(this.storage.getItem(this.key)!==this.raw){this.backup(next,'concurrent-tab-edit');throw Error('另一页面已更新，同页修改已保留副本，请刷新核对')}this.entry=next;this.persist();this.report(this.authorized?'pending':'local')}
   catch(e){this.report('storage-error',e.message);throw e}
  }
  sync(){const task=this.queue.then(()=>this.run());this.queue=task.catch(()=>{});return task}
  async run(){
   try{
    this.report('syncing');const row=await this.load();this.validate(row.snapshot);if(!Number.isSafeInteger(row.revision)||row.revision<1)throw Error('服务器部分版本无效');
    if(!this.entry){if(!this.canApply()){this.report('editing');return}this.backup(this.read(),'before-unified-migration');this.entry={revision:row.revision,updatedAt:row.updatedAt,snapshot:this.validate(row.snapshot),dirty:false};this.persist();this.apply(copy(this.entry.snapshot));this.ready=true}
    else if(!this.ready){if(!this.canApply()){this.report('editing');return}this.apply(copy(this.entry.snapshot));this.ready=true}
    if(row.revision<this.entry.revision){this.report('error','读取到较旧的备份，已保留本机较新版本');return}
    if(this.entry.conflict){this.report('conflict');return}
    if(this.entry.revision!==row.revision){
     if(equal(row.snapshot,this.entry.snapshot)){this.entry={...this.entry,revision:row.revision,updatedAt:row.updatedAt,dirty:false};this.persist()}
     else if(this.entry.dirty){this.backup(this.entry,'local-conflict');this.backup(row,'server-conflict');this.entry.conflict=row;this.persist();this.report('conflict');return}
     else{if(!this.canApply()){this.report('editing');return}this.entry={revision:row.revision,updatedAt:row.updatedAt,snapshot:this.validate(row.snapshot),dirty:false};this.persist();this.apply(copy(this.entry.snapshot))}
    }
    if(this.entry.dirty&&this.authorized){
     const sent=copy(this.entry.snapshot),base=this.entry.revision;const result=await this.remoteSave(base,sent);
     if(result.status==='conflict'){this.entry.conflict={...result.row,updatedAt:result.row?.updated_at};this.backup(this.entry,'server-conflict');this.persist();this.report('conflict');return}
     if(result.status!=='saved'||!result.row||!equal(this.validate(result.row.snapshot),sent)||result.row.revision<=base)throw Error('服务器未确认本次保存');
     this.entry.revision=result.row.revision;this.entry.updatedAt=result.row.updated_at;this.entry.dirty=!equal(this.entry.snapshot,sent);this.persist();
    }
    this.report(this.entry.dirty?(this.authorized?'pending':'local'):'synced');
   }catch(e){
    if(!e.archiveStorage&&!this.ready&&this.entry&&this.canApply()){this.apply(copy(this.entry.snapshot));this.ready=true}
    this.report(e.archiveStorage?'storage-error':'error',e.message);
   }
  }
  async resolve(local){
   if(!this.entry?.conflict||!this.canApply())return;
   const row=await this.load();if(row.revision!==this.entry.conflict.revision){this.entry.conflict=row;this.persist();this.report('conflict','云端再次更新，请重新核对');return}
   this.backup(this.entry,'before-resolution');this.entry={revision:row.revision,updatedAt:row.updatedAt,snapshot:local?this.entry.snapshot:this.validate(row.snapshot),dirty:local};this.persist();this.apply(copy(this.entry.snapshot));return this.sync();
  }
  external(){
   if(this.entry?.dirty||!this.canApply()){this.report('storage-error','另一页面已更新，请下载本页副本后刷新');return}
   const raw=this.storage.getItem(this.key);if(!raw)return;const entry=JSON.parse(raw);this.validate(entry.snapshot);this.raw=raw;this.entry=entry;this.apply(copy(entry.snapshot));this.report(entry.dirty?'pending':'synced');
  }
 }
 const api={PartStore,equal,validateArchive};if(typeof module==='object'&&module.exports)module.exports=api;else root.ARCHIVE_CORE=api;
})(typeof window==='undefined'?globalThis:window);
