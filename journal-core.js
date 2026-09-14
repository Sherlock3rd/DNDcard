(function(root){
 'use strict';
 const prefix='dndcard-journal-v1:',copy=v=>JSON.parse(JSON.stringify(v));
 function validate(s){
  if(!s||s.version!==1||s.journalId!=='gandalf-adventures'||!Array.isArray(s.entries)||!Array.isArray(s.places)||s.entries.length>1000||s.places.length>1000)throw Error('日志格式无效，原始内容已保留');
  const text=(v,n,empty=false)=>typeof v==='string'&&v.length<=n&&(empty||v.trim().length>0),ids=new Set();
  const image=v=>text(v,500,true)&&(!v||/^assets\/images\/[a-zA-Z0-9_./-]+$/.test(v)&&!v.includes('..')||/^https:\/\/[^\s]+$/.test(v));
  for(const p of s.places){if(!p||!text(p.id,100)||ids.has(p.id)||!text(p.name,100)||!text(p.note,1000,true)||!(p.pieceId===null||text(p.pieceId,100))||!((p.x===null&&p.y===null)||(Number.isFinite(p.x)&&p.x>=0&&p.x<=4763&&Number.isFinite(p.y)&&p.y>=0&&p.y<=3185)))throw Error('日志地点无效');ids.add(p.id)}
  const entries=new Set();
  for(const e of s.entries){if(!e||!text(e.id,100)||entries.has(e.id)||!text(e.arc,100)||!text(e.title,100)||!text(e.day,100)||!text(e.body,30000)||!text(e.source,40000,true)||!text(e.quote,500,true)||!image(e.image)||!Array.isArray(e.placeIds)||!e.placeIds.every(id=>ids.has(id))||!Array.isArray(e.people)||e.people.length>100||!e.people.every(p=>text(p,100)))throw Error('日志章节无效');entries.add(e.id)}
  if(JSON.stringify(s).length>1500000)throw Error('日志过大，请先下载备份');
  // Postgres JSONB changes object-key order; canonicalize before comparing save acknowledgements.
  return {version:1,journalId:'gandalf-adventures',places:s.places.map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,pieceId:p.pieceId,note:p.note})),entries:s.entries.map(e=>({id:e.id,arc:e.arc,title:e.title,day:e.day,body:e.body,source:e.source,quote:e.quote,image:e.image,people:[...e.people],placeIds:[...e.placeIds]}))};
 }
 const equal=(a,b)=>JSON.stringify(validate(a))===JSON.stringify(validate(b));
 const initial=()=>validate(root.JOURNAL_SEED);
 const fresh=(snapshot=initial())=>({version:1,snapshot:validate(snapshot),revision:0,dirty:false,edited:false,conflict:null});
  class Store{
    constructor({storage,remote,apply=()=>{},notify=()=>{},canApply=()=>true}){
      Object.assign(this,{storage,remote,apply,notify,canApply});this.user=null;this.epoch=0;this.queue=Promise.resolve();this.status='local';this.error=null;this.key=prefix+'guest';this.entry=this.readEntry(this.key)||fresh();
      this.apply(copy(this.entry.snapshot));this.report('local');
    }
    readEntry(key){
      const raw=this.storage.getItem(key);this.raw=raw;if(raw===null)return null;
      const e=JSON.parse(raw);validate(e.snapshot);
      if(e.version!==1||!Number.isInteger(e.revision)||e.revision<0||typeof e.dirty!=='boolean'||typeof e.edited!=='boolean')throw Error('日志缓存损坏，原始内容已保留');
      if(e.conflict?.row)this.checkRow(e.conflict.row);
      return e;
    }
    checkRow(row){if(!row||!Number.isInteger(row.revision)||row.revision<1)throw Error('服务器日志版本无效');validate(row.snapshot);return row}
    report(status,error=null){this.status=status;this.error=error;this.notify(this)}
    persist(){
      if(this.storage.getItem(this.key)!==this.raw)throw Error('另一标签页已更新日志，请先下载当前副本，再刷新读取');
      const raw=JSON.stringify(this.entry);if(raw!==this.raw)this.storage.setItem(this.key,raw);this.raw=raw;
    }
    save(snapshot){
      this.entry.snapshot=validate(snapshot);this.entry.edited=true;this.entry.dirty=true;
      try{this.persist();this.report(this.entry.conflict?'conflict':this.user?'pending':'local');return true}
      catch(e){this.report('storage-error',e.message);return false}
    }
    async setUser(id){
      if(id===this.user)return this.sync();
      // Never carry the previous account's map into another account.
      this.persist();const guest=this.user===null?copy(this.entry):null;
      this.epoch++;this.user=id;this.key=prefix+(id?'account:'+id:'guest');
      this.entry=this.readEntry(this.key)||fresh();
      if(id&&this.raw===null&&guest?.edited){this.entry.snapshot=guest.snapshot;this.entry.edited=true;this.entry.dirty=true}
      this.persist();this.apply(copy(this.entry.snapshot));this.report(id?'connecting':'local');return this.sync();
    }
    sync(){const task=this.queue.then(()=>this.run());this.queue=task.catch(()=>{});return task}
    async run(){
      if(!this.user)return;
      const user=this.user,epoch=this.epoch,live=()=>this.user===user&&this.epoch===epoch;
      try{
        try{this.persist()}catch(e){this.report('storage-error',e.message);return}if(this.entry.conflict){this.report('conflict');return}
        this.report('syncing');
        const row=await this.remote.load(user);if(!live())return;if(row)this.checkRow(row);
        if((row?.revision||0)!==this.entry.revision){
          // A response can be lost after the server committed a write.
          if(row&&equal(row.snapshot,this.entry.snapshot)){this.entry.revision=row.revision;this.entry.dirty=false;this.persist()}
          else if(this.entry.dirty){this.conflict(row);return}
          else if(row){
            if(!this.canApply()){this.report('editing');return}
            this.entry.snapshot=validate(row.snapshot);this.entry.revision=row.revision;this.persist();this.apply(copy(this.entry.snapshot));
          }else{throw Error('云端记录已变化，已保留本机日志，请检查账号')}
        }
        if(this.entry.dirty){
          const sent=copy(this.entry.snapshot),revision=this.entry.revision;
          const result=await this.remote.save(user,revision,sent);if(!live())return;
          if(result.status==='conflict'){this.conflict(result.row);return}
          if(result.status!=='saved')throw Error('服务器未确认保存');
          this.checkRow(result.row);if(!equal(result.row.snapshot,sent))throw Error('服务器回读内容不一致');
          this.entry.revision=result.row.revision;this.entry.dirty=!equal(sent,this.entry.snapshot);this.persist();
        }
        this.report(this.entry.dirty?'pending':this.entry.revision?'synced':'empty');
      }catch(e){if(live())this.report('error',e.message)}
    }
    conflict(row){if(row)this.checkRow(row);this.entry.conflict={row};this.persist();this.report('conflict')}
    async resolve(useLocal){
      const conflict=this.entry.conflict;if(!conflict)return;if(!this.canApply())throw Error('请先完成当前编辑');
      this.storage.setItem(prefix+'backup:'+Date.now()+':'+Math.random().toString(36).slice(2),JSON.stringify({owner:this.user,local:this.entry.snapshot,remote:conflict.row}));
      if(!useLocal){if(!conflict.row)throw Error('云端没有可读取的版本');this.entry.snapshot=validate(conflict.row.snapshot);this.entry.dirty=false}
      else this.entry.dirty=true;
      this.entry.revision=conflict.row?.revision||0;this.entry.conflict=null;this.persist();this.apply(copy(this.entry.snapshot));return this.sync();
    }
  }
 const api={Store,validate,equal,initial,prefix};if(typeof module==='object'&&module.exports)module.exports=api;else root.JOURNAL_CORE=api;
})(typeof window==='undefined'?globalThis:window);
