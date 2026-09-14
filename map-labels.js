/* Source labels stay independent of illustrations and are culled before DOM work. */
const labelLayer=document.createElement('div');labelLayer.id='mapLabels';labelLayer.setAttribute('aria-label','原图坐标文字层');viewport.append(labelLayer);
let reviewed=[],candidates=[],showOcr=true,labelEntries=[],labelNodes=new Map();
const normalText=t=>t.toUpperCase().replace(/[\s’'.,，！!]/g,'');
function rebuildLabels(){
 const sites=window.mapScenerySites||[],aliases=new Set(sites.flatMap(s=>[normalText(s.name),normalText(s.english||'')]));if(sites.some(s=>s.id==='baldurs-gate'))for(const a of ['BALDURS','GATE','博得之门','博得之门Q'])aliases.add(a);
 const used=[...sites.map(s=>({text:s.name,x:s.x,y:s.y+s.size*.31,height:20,site:true})),...reviewed.filter(r=>!aliases.has(normalText(r.text)))],known=new Set([...aliases,...reviewed.map(r=>normalText(r.text))]);
 if(showOcr)used.push(...candidates.filter(c=>c.confidence>=.78&&c.text.length>=2&&!known.has(normalText(c.text))&&!/^(THE|OF|AND|SEA|HILLS|FOREST|MOUNTAINS|RIVER|MARSH|BRIDGE|CASTLE|TOWER|ELDS|HEWOODOF|THETWIN|ATTLE|MHORNS|QREST|RDEEP|LOUDWAT|THEPLAIN GF|ORMYRTHE|ORAGON COAST|RESKA|FORES|IMBIYR)$/i.test(c.text)&&!(c.x>4260&&c.y>2420)&&!(c.x<420&&c.y>2830)&&!used.some(r=>Math.hypot(c.x-r.x,c.y-r.y)<Math.max(12,c.height*.75))).sort((a,b)=>b.confidence-a.confidence));
 labelEntries=used.map((item,i)=>({...item,key:String(i)}));for(const el of labelNodes.values())el.remove();labelNodes.clear();paintLabels();
}
function paintLabels(){
 const original=$('#referenceToggle').getAttribute('aria-pressed')==='true';labelLayer.hidden=original;if(original)return;
 const visible=new Set(),occupied=[];
 for(const item of labelEntries){const px=x+item.x*scale,py=y+item.y*scale;
  if(scale<(item.site?.15:item.confidence!==undefined?.5:.35)||px<-100||py<-40||px>viewport.clientWidth+100||py>viewport.clientHeight+40)continue;
  const font=Math.max(item.site?10:9,Math.min(22,item.height*.65*scale)),width=(item.width?item.width*scale:item.text.length*font*.7),box=[px-width/2-3,py-font/2-2,px+width/2+3,py+font/2+2];
  if(item.confidence!==undefined&&occupied.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]))continue;
  occupied.push(box);visible.add(item.key);let el=labelNodes.get(item.key);if(!el){el=document.createElement('span');el.textContent=item.text;el.className='cartography-label'+(item.site?' site-label':'');if(item.confidence!==undefined){el.dataset.ocr='true';el.setAttribute('aria-label',item.text+'（原图识别，待校对）')}labelNodes.set(item.key,el);labelLayer.append(el)}el.style.left=px+'px';el.style.top=py+'px';el.style.fontSize=font+'px';el.style.transform=`translate(-50%,-50%) rotate(${item.angle||0}deg)`;
 }
 for(const [key,el]of labelNodes)if(!visible.has(key)){el.remove();labelNodes.delete(key)}labelLayer.dataset.visibleLabels=visible.size;labelLayer.dataset.totalLabels=labelEntries.length;
}
window.paintMapLabels=paintLabels;window.refreshMapSiteLabels=rebuildLabels;
fetch('data/map-labels-reviewed.json').then(r=>r.json()).then(r=>{reviewed=r.labels;rebuildLabels();return fetch('data/map-labels-ocr.json')}).then(r=>r.json()).then(r=>{candidates=r.labels;rebuildLabels()}).catch(()=>{$('#hint').textContent='部分文字层未加载，可用原图对照查看'});
$('#ocrToggle').setAttribute('aria-pressed','true');$('#ocrToggle').textContent='原图识别地名 · 待校对';
$('#ocrToggle').onclick=()=>{showOcr=!showOcr;$('#ocrToggle').setAttribute('aria-pressed',String(showOcr));rebuildLabels()};
$('#referenceToggle').addEventListener('click',paintLabels);
