import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..'),port=4178,debugPort=9333,base=`http://127.0.0.1:${port}`;
const chrome=process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile=await mkdtemp(path.join(os.tmpdir(),'dnd-browser-check-'));
const server=spawn(process.execPath,['scripts/serve.js'],{cwd:root,env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
const browser=spawn(chrome,['--headless=new','--disable-gpu',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check',`${base}/map.html?showcase=1`],{windowsHide:true,stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

class CDP{
 constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();this.events=[]}
 async open(){await new Promise((resolve,reject)=>{this.ws.onopen=resolve;this.ws.onerror=reject});this.ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.id){const pending=this.pending.get(message.id);this.pending.delete(message.id);message.error?pending.reject(Error(JSON.stringify(message.error))):pending.resolve(message.result)}else this.events.push(message)}}
 send(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}
}

async function endpoint(){for(let i=0;i<80;i++){try{return await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()}catch{await sleep(125)}}throw Error('Chrome CDP did not start')}
async function waitFor(cdp,expression,timeout=30000){const end=Date.now()+timeout;while(Date.now()<end){const result=await cdp.send('Runtime.evaluate',{expression,returnByValue:true});if(result.result.value)return result.result.value;await sleep(150)}throw Error(`Timed out: ${expression}`)}
async function value(cdp,expression){return (await cdp.send('Runtime.evaluate',{expression,returnByValue:true})).result.value}

let cdp;
try{
 const pages=await endpoint(),page=pages.find(item=>item.type==='page');cdp=new CDP(page.webSocketDebuggerUrl);await cdp.open();await cdp.send('Runtime.enable');await cdp.send('Page.enable');
 const mapReady="document.querySelector('#geography')?.dataset.readyTiles && document.querySelector('#geography').dataset.readyTiles===document.querySelector('#geography').dataset.visibleTiles";
 await waitFor(cdp,mapReady,45000);const first=JSON.parse(await value(cdp,"JSON.stringify(document.querySelector('#geography').dataset)"));await sleep(1500);
 await cdp.send('Page.reload',{ignoreCache:false});await waitFor(cdp,mapReady,30000);const second=JSON.parse(await value(cdp,"JSON.stringify(document.querySelector('#geography').dataset)"));
 await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await cdp.send('Page.navigate',{url:`${base}/caseboard.html?showcase=1`});await waitFor(cdp,"!document.querySelector('#boardViewport')?.inert && document.querySelector('#boardWorld')?.style.transform",20000);
 await cdp.send('Runtime.evaluate',{expression:"window.__boardWrites=0;document.addEventListener('board:change',()=>window.__boardWrites++)"});
 const before=JSON.parse(await value(cdp,"JSON.stringify({transform:document.querySelector('#boardWorld').style.transform,rect:(()=>{const r=document.querySelector('#boardViewport').getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height}})()})")),rect=before.rect,cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-70,y:cy},{x:cx+70,y:cy}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-120,y:cy+25},{x:cx+130,y:cy+25}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(300);
 const after=JSON.parse(await value(cdp,"JSON.stringify({transform:document.querySelector('#boardWorld').style.transform,writes:window.__boardWrites,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,hint:document.querySelector('#boardHint').textContent})")),exceptions=cdp.events.filter(event=>event.method==='Runtime.exceptionThrown').map(event=>event.params.exceptionDetails.text);
 if(first.overviewCache!=='miss'||second.overviewCache!=='hit'||second.lastPersistentCache!=='hit')throw Error(`Persistent cache did not hit after reload: ${JSON.stringify({first,second})}`);
 if(before.transform===after.transform||after.writes!==0||after.scrollWidth!==after.clientWidth||exceptions.length)throw Error(`Mobile pinch verification failed: ${JSON.stringify({before,after,exceptions})}`);
 console.log(JSON.stringify({map:{first,second},caseboard:{before,after},exceptions},null,2));
}finally{
 cdp?.ws.close();browser.kill();server.kill();await sleep(250);await rm(profile,{recursive:true,force:true});
}
