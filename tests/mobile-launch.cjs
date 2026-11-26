const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function main(){
 const nodes=new Map();let opened=0,pendingResolve=null,mode='ok',lastSignal;
 const el=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,innerHTML:'',textContent:'',events:{},value:'',addEventListener(name,fn){this.events[name]=fn},removeAttribute(name){delete this[name]},contentWindow:{configureArena(next,label,exit){assert(next(0).q);this.exit=exit;opened++}}});return nodes.get(id)};
 const mobile={getUser:()=>({grade:1}),flush(){},wrap:x=>x,beginRound:async(context,{signal})=>{lastSignal=signal;if(mode==='reject')throw Error('Network unavailable');if(mode==='wait')return new Promise(resolve=>pendingResolve=resolve);return{roundId:'test'}}};
 const c={console,Math,AbortController,URL,URLSearchParams,location:{search:''},Event:class{},window:{MobileArena:mobile,dispatchEvent(){}},document:{querySelector:el,baseURI:'https://teacher.github.io/arena/'}};
 vm.createContext(c);for(const f of ['core/registry.js','core/teaching.js','core/task-help.js','content/math/generator.js','core/catalog-art.js','core/games.js','core/game-pages.js','core/app.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
 const click=dataset=>el('#hubBody').events.click({target:{closest:()=>({dataset})}});
 for(const game of c.Arena.listGames())for(const m of ['solo','two']){
  el('#playMode').events.change({target:{value:m}});click({game:game.id});click({grade:'5'});click({quarter:'2'});
  const topic=el('#hubBody').innerHTML.match(/data-topic="(\d+)"/)[1];
  click({topic});assert(el('#appError').textContent.includes('8 секунд'));await tick();assert.equal(el('#gameHost').hidden,false);el('#gameFrame').onload();el('#gameFrame').contentWindow.exit();
  click({back:'0'});
 }
 assert.equal(opened,36);
 mode='wait';click({game:'towers'});click({grade:'5'});click({quarter:'2'});
 // Use a visible topic in the current quarter for the stale-launch check.
 const topic=el('#hubBody').innerHTML.match(/data-topic="(\d+)"/)[1];click({topic});const signal=lastSignal;
 click({back:'2'});assert.equal(signal.aborted,true);pendingResolve(null);await tick();assert.equal(el('#gameHost').hidden,true);
 mode='reject';click({quarter:'2'});click({topic});await tick();assert(el('#appError').textContent.includes('Network unavailable'));assert.equal(el('#gameHost').hidden,true);
 // Exercise the real bounded ranking preparation with a stalled network.
 const source=fs.readFileSync('mobile/account.js','utf8'),code=source.slice(source.indexOf(' async function beginRound('),source.indexOf('\n function wrap('));
 let timer,cleared=0;const messages=[];const a={auth:{user:{id:'local'}},configured:()=>true,AbortController,setTimeout(fn,ms){assert.equal(ms,8000);timer=fn;return 1},clearTimeout(){cleared++},message:x=>messages.push(x),requireServer:async()=>({version:3,ready:true}),needsProfile:()=>false,flush(){},Date,offset:0,api(action,data,useAuth,options){return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted')),{once:true}))}};
 vm.createContext(a);vm.runInContext(code,a);const pending=a.beginRound({game:'towers'});await tick();timer();assert.equal(await pending,null);assert(messages.at(-1).includes('8 секунд'));assert(cleared>0);
 console.log('Mobile launch: 36 authenticated routes, errors surfaced, stale navigation cancelled, stalled ranking falls back after 8 seconds.');
}
main().catch(e=>{console.error(e);process.exit(1)});
