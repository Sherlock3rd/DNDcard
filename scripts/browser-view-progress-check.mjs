import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..'),port=4179,debugPort=9334,base=`http://127.0.0.1:${port}`;
const chrome=process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile=await mkdtemp(path.join(os.tmpdir(),'dnd-view-progress-'));
const server=spawn(process.execPath,['scripts/serve.js'],{cwd:root,env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
const browser=spawn(chrome,['--headless=new','--disable-gpu',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check',`${base}/index.html#equipment`],{windowsHide:true,stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

class CDP{
 constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();this.events=[]}
 async open(){await new Promise((resolve,reject)=>{this.ws.onopen=resolve;this.ws.onerror=reject});this.ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.id){const pending=this.pending.get(message.id);this.pending.delete(message.id);message.error?pending.reject(Error(JSON.stringify(message.error))):pending.resolve(message.result)}else this.events.push(message)}}
 send(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}
}
async function endpoint(){for(let i=0;i<80;i++){try{return await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()}catch{await sleep(125)}}throw Error('Chrome CDP did not start')}
async function value(cdp,expression){const response=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);return response.result.value}
async function waitFor(cdp,expression,timeout=30000){const end=Date.now()+timeout;while(Date.now()<end){try{if(await value(cdp,expression))return}catch{}await sleep(100)}throw Error(`Timed out: ${expression}`)}
async function navigate(cdp,url,ready){await cdp.send('Page.navigate',{url});await waitFor(cdp,ready)}
const close=(a,b,tolerance=.01)=>Math.abs(a-b)<=tolerance;

let cdp;
try{
 const pages=await endpoint(),page=pages.find(item=>item.type==='page');cdp=new CDP(page.webSocketDebuggerUrl);await cdp.open();await cdp.send('Runtime.enable');await cdp.send('Page.enable');
 await waitFor(cdp,"document.querySelector('.tower-nav')&&document.body.dataset.route==='character'");
 await value(cdp,"document.documentElement.style.scrollBehavior='auto';scrollTo(0,document.querySelector('#equipment').offsetTop+80);document.querySelector('[data-tower-page=room]').click();true");
 await waitFor(cdp,"document.body.dataset.route==='portal'");
 const characterHref=await value(cdp,"document.querySelector('[data-tower-page=character]').getAttribute('href')");
 await value(cdp,"document.querySelector('[data-tower-page=character]').click();true");await waitFor(cdp,"location.hash==='#equipment'&&scrollY>100");
 const characterScroll=await value(cdp,'scrollY');

 await navigate(cdp,`${base}/map.html?showcase=1`,'window.MapTableView&&document.querySelector(".tower-nav")');
 const mapExpected=JSON.parse(await value(cdp,"MapTableView.apply({scale:1.35,x:-620,y:-410});JSON.stringify(MapTableView.read())"));
 await value(cdp,"document.querySelector('[data-tower-page=journal]').click();true");await waitFor(cdp,"location.pathname.endsWith('/journal.html')&&window.JournalAPI&&document.querySelector('.tower-nav')");
 await value(cdp,"document.querySelector('#next').click();document.querySelector('.reading-scroll').scrollTop=137;true");
 await value(cdp,"document.querySelector('[data-tower-page=map]').click();true");await waitFor(cdp,"location.pathname.endsWith('/map.html')&&window.MapTableView&&document.querySelector('.tower-nav')");
 await waitFor(cdp,`(()=>{const v=MapTableView.read();return Math.abs(v.scale-(${mapExpected.scale}))<.01&&Math.abs(v.x-(${mapExpected.x}))<.01&&Math.abs(v.y-(${mapExpected.y}))<.01})()`);
 const mapActual=JSON.parse(await value(cdp,'JSON.stringify(MapTableView.read())'));

 await value(cdp,"document.querySelector('[data-tower-page=board]').click();true");await waitFor(cdp,"location.pathname.endsWith('/caseboard.html')&&window.CaseboardView&&!document.querySelector('#boardViewport').inert");
 const boardExpected=JSON.parse(await value(cdp,"CaseboardView.apply({zoom:1.25,tx:-333,ty:-222});JSON.stringify(CaseboardView.read())"));
 await value(cdp,"document.querySelector('[data-tower-page=journal]').click();true");await waitFor(cdp,"location.pathname.endsWith('/journal.html')&&window.JournalAPI&&document.querySelector('.tower-nav')&&document.querySelector('.reading-scroll').scrollTop===137");
 const journal=JSON.parse(await value(cdp,'JSON.stringify({hash:location.hash,scroll:document.querySelector(".reading-scroll").scrollTop})'));
 await value(cdp,"document.querySelector('[data-tower-page=board]').click();true");await waitFor(cdp,"location.pathname.endsWith('/caseboard.html')&&window.CaseboardView&&!document.querySelector('#boardViewport').inert");
 await waitFor(cdp,`(()=>{const v=CaseboardView.read();return Math.abs(v.zoom-(${boardExpected.zoom}))<.01&&Math.abs(v.tx-(${boardExpected.tx}))<.01&&Math.abs(v.ty-(${boardExpected.ty}))<.01})()`);
 const boardActual=JSON.parse(await value(cdp,'JSON.stringify(CaseboardView.read())'));
 const writes=await value(cdp,"JSON.parse(sessionStorage.getItem('dndcard-tower-view-progress-v1')).version");
 const exceptions=cdp.events.filter(event=>event.method==='Runtime.exceptionThrown').map(event=>event.params.exceptionDetails.text);
 if(characterHref!=='./index.html#equipment'||characterScroll<100||journal.scroll!==137||!journal.hash||writes!==1||exceptions.length||!close(mapExpected.scale,mapActual.scale)||!close(mapExpected.x,mapActual.x)||!close(mapExpected.y,mapActual.y)||!close(boardExpected.zoom,boardActual.zoom)||!close(boardExpected.tx,boardActual.tx)||!close(boardExpected.ty,boardActual.ty))throw Error(JSON.stringify({characterHref,characterScroll,mapExpected,mapActual,journal,boardExpected,boardActual,writes,exceptions}));
 console.log(JSON.stringify({character:{href:characterHref,scroll:characterScroll},map:{expected:mapExpected,actual:mapActual},journal,board:{expected:boardExpected,actual:boardActual},exceptions},null,2));
}finally{
 cdp?.ws.close();browser.kill();server.kill();await sleep(250);await rm(profile,{recursive:true,force:true});
}
