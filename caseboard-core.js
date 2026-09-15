(function(root){
 'use strict';const copy=v=>JSON.parse(JSON.stringify(v));

 const defaults={node:{color:'#d5c39b',border:'#706349',text:'#322a1d',shape:'arched'},edge:{color:'#b07965',width:3,pattern:'solid'}};
 function style(value,kind){
  if(value===undefined)return copy(defaults[kind]);
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!Object.hasOwn(defaults[kind],k)))throw Error('样式格式无效');
  const s={...defaults[kind],...value};
  for(const k of kind==='node'?['color','border','text']:['color'])if(typeof s[k]!=='string'||!/^#[0-9a-fA-F]{6}$/.test(s[k]))throw Error('颜色必须是六位十六进制色值');
  if(kind==='node'&&!['arched','square','rounded'].includes(s.shape)||kind==='edge'&&(!Number.isInteger(s.width)||s.width<1||s.width>8||!['solid','dashed','dotted'].includes(s.pattern)))throw Error('样式选项无效');
  return s;
 }
 function validate(s){
  if(!s||s.version!==1||s.boardId!=='black-tower'||!Array.isArray(s.nodes)||!Array.isArray(s.edges)||s.nodes.length>500||s.edges.length>2000||JSON.stringify(s).length>1500000)throw Error('案件板存档无效');
  const text=(v,max,empty=true)=>typeof v==='string'&&v.length<=max&&(empty||v.trim().length>0),ids=new Set(),edgeIds=new Set(),pairs=new Set();
  const nodes=s.nodes.map(n=>{if(!n||!text(n.id,100,false)||ids.has(n.id)||!text(n.name,100,false)||!['person','group','place'].includes(n.kind)||!text(n.race,100)||!text(n.role,100)||!text(n.status,100)||!text(n.notes,4000)||!text(n.appearance,2000)||!text(n.portrait,500)||!Number.isFinite(n.x)||!Number.isFinite(n.y)||n.portrait&&!/^assets\/images\/[a-zA-Z0-9_./-]+$/.test(n.portrait)||n.portrait.includes('..'))throw Error('人物资料或位置无效');ids.add(n.id);return {id:n.id,kind:n.kind,name:n.name,race:n.race,role:n.role,status:n.status,notes:n.notes,appearance:n.appearance,portrait:n.portrait,x:n.x,y:n.y,...(n.style===undefined?{}:{style:style(n.style,'node')})}});
  const edges=s.edges.map(e=>{const pair=[e.from,e.to].sort().join('|');if(!e||!text(e.id,100,false)||edgeIds.has(e.id)||!ids.has(e.from)||!ids.has(e.to)||e.from===e.to||pairs.has(pair)||!text(e.note,2000))throw Error('连线无效或重复');edgeIds.add(e.id);pairs.add(pair);return {id:e.id,from:e.from,to:e.to,note:e.note,...(e.style===undefined?{}:{style:style(e.style,'edge')})}});
  if(s.zones!==undefined&&(!Array.isArray(s.zones)||s.zones.length>40))throw Error('结界分组无效');
  const zoneIds=new Set(),zones=(s.zones||[]).map(z=>{if(!z||!text(z.id,100,false)||zoneIds.has(z.id)||!text(z.name,100,false)||!['sage','amber','lilac'].includes(z.tone)||!['x','y','width','height'].every(k=>Number.isFinite(z[k]))||z.width<240||z.height<200||!Number.isFinite(z.x+z.width)||!Number.isFinite(z.y+z.height))throw Error('结界范围无效（最小 240 × 200）');zoneIds.add(z.id);return {id:z.id,name:z.name,tone:z.tone,x:z.x,y:z.y,width:z.width,height:z.height}});
  return {version:1,boardId:'black-tower',nodes,edges,zones};
 }
 const api={validate,style,defaults:copy(defaults),initial:()=>validate(root.CASEBOARD_SEED),copy};if(typeof module==='object'&&module.exports)module.exports=api;else root.CASEBOARD_CORE=api;
})(typeof window==='undefined'?globalThis:window);
