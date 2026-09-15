(()=>{
 'use strict';
 // Consume the fragment before any app/vendor code; it never enters an HTTP URL or save export.
 const storageKey='dndcard-owner-link-v1';let key='',error='';
 const match=location.hash.match(/^#owner=([a-f0-9]{64})$/);
 try{key=match?match[1]:localStorage.getItem(storageKey)||'';if(match)localStorage.setItem(storageKey,key)}catch{error='专属入口暂无法保存在此浏览器，请保留原链接。'}
 if(match)history.replaceState(null,'',location.pathname+location.search);
 if(!/^[a-f0-9]{64}$/.test(key))key='';
 window.ADVENTURE_OWNER=Object.freeze({getKey:()=>key,error,forget:()=>{localStorage.removeItem(storageKey);key=''}});
})();
