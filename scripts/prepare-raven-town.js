// Add only new screenshot records. A stable-ID collision requires review.
const core=require('../caseboard-core');
function prepare(snapshot,addition=require('../data/caseboard-raven-town.json')){
 const result=core.copy(snapshot);
 for(const part of ['nodes','edges','zones']){
  result[part]||=[];
  for(const raw of addition[part]){
   if(result[part].some(x=>x.id===raw.id))throw Error('Record already exists: '+raw.id);
   result[part].push(part==='nodes'?{kind:'person',race:'',status:'',notes:'',appearance:'',portrait:require('../caseboard-portraits')[raw.id]?.path||'',...raw}:core.copy(raw));
  }
 }
 core.validate(result);
 return result;
}
module.exports={prepare};
