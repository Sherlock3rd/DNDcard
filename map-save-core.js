(function(root){
  'use strict';
  const prefix='dndcard-map-v1:', mapId='faerun-3.5';
  const kinds=['castle','watchtower','fortress','village','windmill','port','mine','lumber','crystal','event','battle','treasure','traveler'];
  const copy=v=>JSON.parse(JSON.stringify(v));
  function validate(s){
    if(!s||s.version!==1||s.mapId!==mapId||!Array.isArray(s.pieces)||s.pieces.length>2000)throw Error('地图存档格式无效，原存档已保留');
    const ids=new Set();let travelers=0;
    for(const p of s.pieces){
      if(!p||typeof p.id!=='string'||!p.id.length||p.id.length>100||ids.has(p.id)||!kinds.includes(p.kind)||typeof p.name!=='string'||!p.name.trim()||p.name.length>60||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>4763||p.y<0||p.y>3185)throw Error('地图棋子数据无效，原存档已保留');
      if(p.notes!==undefined&&(typeof p.notes!=='string'||p.notes.length>4000))throw Error('棋子备注不能超过4000字');
      ids.add(p.id);if(p.kind==='traveler'&&++travelers>1)throw Error('当前位置棋子重复，原存档已保留');
    }
    return {version:1,mapId,pieces:s.pieces.map(p=>({id:p.id,kind:p.kind,name:p.name,...(p.notes!==undefined?{notes:p.notes}:{}),x:p.x,y:p.y}))};
  }
  const equal=(a,b)=>JSON.stringify(validate(a))===JSON.stringify(validate(b));
  const initial=()=>({version:1,mapId,pieces:[{id:'current-position',kind:'traveler',name:'当前位置',x:1047,y:1178}]});
  const fresh=(snapshot=initial())=>({version:1,snapshot:validate(snapshot),revision:0,dirty:false,edited:false,conflict:null});
  class Store{
    constructor({storage,remote,apply=()=>{},notify=()=>{},canApply=()=>true}){
      Object.assign(this,{storage,remote,apply,notify,canApply});this.user=null;this.epoch=0;this.queue=Promise.resolve();this.status='local';this.error=null;this.key=prefix+'guest';this.entry=this.readEntry(this.key)||fresh();
      this.apply(copy(this.entry.snapshot));this.report('local');
    }
    readEntry(key){
      const raw=this.storage.getItem(key);this.raw=raw;if(raw===null)return null;
      const e=JSON.parse(raw);validate(e.snapshot);
      if(e.version!==1||!Number.isInteger(e.revision)||e.revision<0||typeof e.dirty!=='boolean'||typeof e.edited!=='boolean')throw Error('地图缓存损坏，原始内容已保留');
      if(e.conflict?.row)this.checkRow(e.conflict.row);
      return e;
    }
    checkRow(row){if(!row||!Number.isInteger(row.revision)||row.revision<1)throw Error('服务器地图版本无效');validate(row.snapshot);return row}
    report(status,error=null){this.status=status;this.error=error;this.notify(this)}
    persist(){
      if(this.storage.getItem(this.key)!==this.raw)throw Error('另一标签页已更新地图，请先下载当前副本，再刷新读取');
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
          }else{throw Error('云端记录已变化，已保留本机地图，请检查账号')}
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
  const api={Store,validate,equal,initial,prefix,kinds};if(typeof module==='object'&&module.exports)module.exports=api;else root.MAP_SAVE_CORE=api;
})(typeof window==='undefined'?globalThis:window);
