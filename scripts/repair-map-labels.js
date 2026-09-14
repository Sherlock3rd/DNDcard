// Names checked against the supplied original in the northern Baldur / inland view.
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const file=path.join(root,'data/map-labels-reviewed.json'),d=JSON.parse(fs.readFileSync(file)),ocr=JSON.parse(fs.readFileSync(path.join(root,'data/map-labels-ocr.json'))).labels;
const names=['失落之峰','石桥','西康布','德林毕尔河','迷雾森林','蜥蜴沼泽','巨魔咆哮森林','黑路','洛克镇','孤寂荒原','远星湖','毒蛇山脉','剑漠地区','龙之井','失魂山','远海沼泽','抵达河','黑暗堡','巨龙森林','山边镇','河岸森林','图恩沼泽'];
for(const text of names){const a=ocr.find(a=>a.text===text);if(!a)throw Error(text);if(!d.labels.some(l=>l.text===text))d.labels.push({text,x:a.x,y:a.y,height:Math.min(a.height,24),angle:a.angle||0,source:'Original map, visual check 2026-09-14'})}
for(const [text,x,y,height]of [['死亡之地',1165,1103,20],['巨魔之爪',1184,1048,20],['喧水城',1170,593,18],['风暴角山脉',1835,901,24],['至高荒原',1137,796,26],['白骨战场',1582,801,20],['艾弗瑞斯卡',1571,710.5,17],['邪术师之墓',1074.5,981,18],['赫鲁斯瓦',1534,988,20],['卡姆欧普',1518.25,960.5,20],['阿斯布莱温',1542.5,1115,18],['波斯库',1778,1121,18],['至高森林',1170,450,28],['失落之地',1372,479,22]])if(!d.labels.some(l=>l.text===text))d.labels.push({text,x,y,height,source:'Original map, visual check 2026-09-14'});
d.scope='Original-map labels checked around Baldur and the northern / inland view; other regions still include separately identified OCR candidates.';
fs.writeFileSync(file,JSON.stringify(d,null,2)+'\n');console.log(d.labels.length,'reviewed labels');
const mf=path.join(root,'data/map-source-markers.json'),m=JSON.parse(fs.readFileSync(mf));
m.landmarks=[['dragonspear-source','龙矛城堡',375,794,9,80],['darkhold-source','黑暗堡',1009,877,9,80],['warlocks-crypt-source','邪术师之墓',276,922,7,75],['well-of-dragons-source','龙之井',1060,765,7,78]].map(([id,name,sx,sy,sprite,size])=>({id,name,x:Math.round((sx+876.4526977539062)/(5648.76025390625/4763)),y:Math.round((sy+242.603271484375)/(3777.304443359375/3185)),sprite,size,source:'Original-map symbol manually digitised from browser original-map overlay; schematic background, no event date inferred.'}));
fs.writeFileSync(mf,JSON.stringify(m,null,2)+'\n');
