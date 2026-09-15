// Runs in GitHub Actions with its short-lived, repository-scoped GITHUB_TOKEN.
const {validateArchive}=require('../archive-core');
const validators={character:require('../cloud-sync-core').validate,map:require('../map-save-core').validate,journal:require('../journal-core').validate,board:require('../caseboard-core').validate};
const fs=require('node:fs'),vm=require('node:vm');
const scope={window:{}};vm.runInNewContext(fs.readFileSync('cloud-config.js','utf8'),scope);const config=scope.window.DND_CLOUD_CONFIG;
const path='/repos/Sherlock3rd/DNDcard/contents/data/save/latest.json';
async function sync({fetcher=fetch,token=process.env.GITHUB_TOKEN}={}){
 if(!token)throw Error('GitHub Actions token is missing');
 const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
 async function request(url,options={}){const r=await fetcher(url,{...options,signal:AbortSignal.timeout(20000)});return {status:r.status,ok:r.ok,data:await r.json()}}
 for(let attempt=0;attempt<4;attempt++){
  // Re-read both sides after conflicts; never retry a captured stale snapshot.
  const source=await request(config.url+'/rest/v1/adventure_archive?id=eq.main&select=snapshot',{headers:{apikey:config.publishableKey,'Cache-Control':'no-cache'}});
  if(!source.ok)throw Error('Archive read failed: '+source.status);
  const archive=validateArchive(source.data[0]?.snapshot,validators);
  const remote=await request('https://api.github.com'+path+'?ref=main',{headers});if(!remote.ok&&remote.status!==404)throw Error('Git read failed: '+remote.status);
  if(remote.ok){const previous=validateArchive(JSON.parse(Buffer.from(remote.data.content,'base64').toString('utf8')),validators);if(previous.revision>archive.revision)throw Error('Refusing to replace a newer Git archive');if(previous.revision===archive.revision){if(!require('../archive-core').equal(previous,archive))throw Error('Equal revisions have different contents');return {status:'unchanged',revision:archive.revision}}}
  const text=JSON.stringify(archive,null,2)+'\n',content=Buffer.from(text).toString('base64');
  const saved=await request('https://api.github.com'+path,{method:'PUT',headers,body:JSON.stringify({message:'Save adventure archive v'+archive.revision,branch:'main',content,...(remote.ok?{sha:remote.data.sha}:{})})});
  if([409,422].includes(saved.status))continue;if(!saved.ok)throw Error('Git save failed: '+saved.status);
  const check=await request('https://api.github.com'+path+'?ref='+saved.data.commit.sha,{headers});
  if(!check.ok||Buffer.from(check.data.content,'base64').toString('utf8')!==text)throw Error('Git read-back mismatch');
  return {status:'saved',revision:archive.revision,commit:saved.data.commit.sha};
 }
 throw Error('Git remained busy after four attempts');
}
if(require.main===module)sync().then(r=>console.log(JSON.stringify(r))).catch(e=>{console.error(e.message);process.exitCode=1});
module.exports={sync};
