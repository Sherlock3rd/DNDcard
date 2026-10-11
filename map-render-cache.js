(function(root){
 'use strict';
 const DB_NAME='dndcard-map-render-cache',STORE='renders',DB_VERSION=1,FORMAT='map-render-v1',MAX_ENTRIES=96;
 function stableInput(core,sites,markers){return JSON.stringify([FORMAT,core?.sourceSha256||'',sites||{},markers||{}])}
 async function signature(core,sites,markers){const input=stableInput(core,sites,markers);if(root.crypto?.subtle&&root.TextEncoder){const bytes=await root.crypto.subtle.digest('SHA-256',new root.TextEncoder().encode(input));return [...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('')}let hash=2166136261;for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619)}return (hash>>>0).toString(16)}
 function overviewKey(sig){return `${FORMAT}:${sig}:overview`}
 function tileKey(sig,job){return `${FORMAT}:${sig}:tile:${job.key}`}
 const api={DB_NAME,STORE,DB_VERSION,FORMAT,MAX_ENTRIES,stableInput,signature,overviewKey,tileKey};
 if(typeof module!=='undefined')module.exports=api;root.MapRenderCache=api;
})(typeof self!=='undefined'?self:globalThis);
