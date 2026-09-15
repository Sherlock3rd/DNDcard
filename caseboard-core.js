(function(root){
 'use strict';const copy=v=>JSON.parse(JSON.stringify(v));
 function validate(s){
  if(!s||s.version!==1||s.boardId!=='black-tower'||!Array.isArray(s.nodes)||!Array.isArray(s.edges)||s.nodes.length>500||s.edges.length>2000||JSON.stringify(s).length>1500000)throw Error('案件板存档无效');
  const text=(v,max,empty=true)=>typeof v==='string'&&v.length<=max&&(empty||v.trim().length>0),ids=new Set(),edgeIds=new Set(),pairs=new Set();
  const nodes=s.nodes.map(n=>{if(!n||!text(n.id,100,false)||ids.has(n.id)||!text(n.name,100,false)||!['person','group','place'].includes(n.kind)||!text(n.race,100)||!text(n.role,100)||!text(n.status,100)||!text(n.notes,4000)||!text(n.appearance,2000)||!text(n.portrait,500)||!Number.isFinite(n.x)||!Number.isFinite(n.y)||n.x<100||n.x>1700||n.y<110||n.y>1090||n.portrait&&!/^assets\/images\/[a-zA-Z0-9_./-]+$/.test(n.portrait)||n.portrait.includes('..'))throw Error('人物资料或位置无效');ids.add(n.id);return {id:n.id,kind:n.kind,name:n.name,race:n.race,role:n.role,status:n.status,notes:n.notes,appearance:n.appearance,portrait:n.portrait,x:n.x,y:n.y}});
  const edges=s.edges.map(e=>{const pair=[e.from,e.to].sort().join('|');if(!e||!text(e.id,100,false)||edgeIds.has(e.id)||!ids.has(e.from)||!ids.has(e.to)||e.from===e.to||pairs.has(pair)||!text(e.note,2000))throw Error('连线无效或重复');edgeIds.add(e.id);pairs.add(pair);return {id:e.id,from:e.from,to:e.to,note:e.note}});
  return {version:1,boardId:'black-tower',nodes,edges};
 }
 const api={validate,initial:()=>validate(root.CASEBOARD_SEED),copy};if(typeof module==='object'&&module.exports)module.exports=api;else root.CASEBOARD_CORE=api;
})(typeof window==='undefined'?globalThis:window);
