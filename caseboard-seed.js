// Preserve the existing case wall's identities and known relationships.
(function(root){
 const nodes=[],edges=[];
 function node(id,name,kind,x,y,portrait='',race='',role='',status='',notes=''){nodes.push({id,name,kind,x,y,portrait:portrait?'assets/images/'+portrait:'',race,role,status,notes,appearance:''})}
 node('party','冒险团','group',500,565,'','七名同伴','共同冒险');
 node('gandalf','甘阿·道夫','person',220,220,'gandalf-bladesinger.png','人类','法师（剑咏）');
 node('sairen','赛伦','person',520,170,'relationship-sairen.png','人类','牧师');
 node('shire','夏尔-金歌','person',805,260,'relationship-shire-goldsong.png','人类','吟游诗人');
 node('zuo','左无峰','person',835,705,'relationship-zuo-wufeng.png','人类','拳师');
 node('mura','缪拉-青苔','person',600,950,'relationship-mura-moss.png','半精灵','德鲁伊');
 node('feiyi','费伊','person',300,935,'relationship-feiyi.png','变体人类-不朽者','魔器师');
 node('aili','艾黎','person',165,615,'relationship-aili.png','人类','边境行者');
 node('iron-village','铁环村','place',1270,590,'relationship-dwarf-village.png','','矮人聚落','矿坑事故');
 node('chief','艾德诺根','person',1160,220,'relationship-chief.png','矮人','铁环村村长');
 node('pazu','帕祖','person',1570,240,'relationship-pazu.png','','','已救援');
 node('maruk','马鲁克','person',1570,955,'relationship-maruk.png','矮人','','已故','被误认为叛徒 · 误杀');
 node('morris','墨里斯','person',1180,980,'relationship-morris.png','矮人','','已故','矿坑遇难者之一');
 function edge(from,to,note){edges.push({id:from+'--'+to,from,to,note})}
 for(const id of ['gandalf','sairen','shire','zuo','mura','feiyi','aili'])edge('party',id,'冒险团成员');
 edge('party','iron-village','与铁环村关联');edge('iron-village','chief','村庄领袖');edge('party','pazu','被冒险团救下');edge('party','maruk','被误认为叛徒 · 误杀');edge('iron-village','morris','矿坑遇难者之一');edge('iron-village','pazu','与铁环村关联');edge('iron-village','maruk','与铁环村关联');
 const zones=[{id:'ward-party',name:'冒险团',tone:'sage',x:40,y:55,width:910,height:1045},{id:'ward-village',name:'铁环村 · 矿坑线索',tone:'amber',x:1040,y:85,width:700,height:1035}];
 root.CASEBOARD_SEED={version:1,boardId:'black-tower',nodes,edges,zones};
})(typeof window==='undefined'?globalThis:window);
