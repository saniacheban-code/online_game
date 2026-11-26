'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {create}=require('../mobile/session.js');
function storage(){const data=new Map();return{data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}}
const auth={token:'a'.repeat(128),apiVersion:4,user:{id:'pupil',display:'Иванов Иван',firstName:'Иван',lastName:'Иванов',grade:5,points:20,monthPoints:10},password:'not-to-save',proof:'not-to-save',salt:'not-to-save'};
const local=storage(),session=storage(),store=create({local:()=>local,session:()=>session});
assert.equal(store.load().auth,null);
assert.equal(store.save(auth,false),false);assert.equal(local.getItem('arena.mobile.auth'),null);assert.equal(store.load().auth.token,auth.token);
assert.equal(create({local:()=>local,session:storage}).load().auth,null,'unchecked login ends with the browser session');
assert.equal(store.save(auth,true),true);
const reopened=create({local:()=>local,session:storage});assert.equal(reopened.load().auth.token,auth.token);assert.equal(reopened.load().remember,true);
for(const sensitive of ['password','proof','salt','not-to-save'])assert(![...local.data.values(),...session.data.values()].join('').includes(sensitive));
store.save(auth,false);assert.equal(local.getItem('arena.mobile.auth'),null);assert.equal(store.load().auth.token,auth.token);
store.save(auth,true);store.save(null,false);assert.equal(store.load().auth,null);assert.equal(local.getItem('arena.mobile.auth'),null);assert.equal(session.getItem('arena.mobile.auth'),null);
local.setItem('arena.mobile.auth','{broken');assert.equal(store.load().auth,null);
local.setItem('arena.mobile.auth',JSON.stringify({token:'bad',user:auth.user}));assert.equal(store.load().auth,null);
const blocked=create({local:()=>{throw Error('Storage disabled')},session:()=>session});assert.equal(blocked.save(auth,true),false);assert.equal(blocked.load().auth.token,auth.token,'temporary session survives local storage failure');
const absent=create({local:()=>{throw Error('blocked')},session:()=>{throw Error('blocked')}});assert.equal(absent.load().auth,null);assert.equal(absent.save(auth,true),false);
// Drive the actual login/profile/logout handlers and simulate reopening the browser.
function app(local,session,{offline=false,expired=false}={}){
 const nodes=new Map(),calls=[];
 class El{
  constructor(){this.innerHTML='';this.textContent='';this.open=false;this.disabled=false;this.dataset={};this.firstElementChild={innerHTML:''};this.classList={add(){}}}
  set id(v){this._id=v;nodes.set('#'+v,this)}get id(){return this._id}
  querySelector(s){return get(s)}querySelectorAll(){return[]}
  addEventListener(){}prepend(){}appendChild(){}showModal(){this.open=true}close(){this.open=false}
  setAttribute(){}
 }
 const get=s=>{if(!nodes.has(s))nodes.set(s,new El());return nodes.get(s)};
 const document={body:new El(),querySelector:s=>s==='#mobileDialog'&&!nodes.has(s)?null:get(s),createElement:()=>new El(),addEventListener(){},baseURI:'https://school.github.io/arena/'};
 const env={document,localStorage:local,sessionStorage:session,navigator:{onLine:!offline},ARENA_MOBILE_CONFIG:{apiUrl:'https://script.google.com/macros/s/test/exec'},AbortController,TextEncoder,Uint8Array,ArrayBuffer,console,setTimeout,clearTimeout,setInterval(){},addEventListener(){},crypto:{subtle:{async importKey(){return{}},async deriveBits(){return new ArrayBuffer(32)}}},fetch:async(url,options)=>{const request=JSON.parse(options.body);calls.push(request);if(offline)throw Error('Offline');let result;if(request.action==='serverInfo')result={version:5,ready:true};else if(request.action==='challenge')result={salt:'test'};else if(request.action==='login')result=auth;else if(request.action==='me'&&expired)return{ok:true,json:async()=>({ok:false,code:'AUTH',error:'Сессия истекла. Войдите ещё раз.'})};else result=auth.user;return{ok:true,json:async()=>({ok:true,data:result})}}};
 env.window=env;vm.createContext(env);for(const file of ['mobile/session.js','mobile/account.js'])vm.runInContext(fs.readFileSync(file,'utf8'),env);
 async function login(remember){const f=get('#accountForm');f.elements={login:{value:'ivan_5'},password:{value:'secret123'},remember:{checked:remember}};f.reset=()=>{f.elements.password.value='';f.elements.remember.checked=false};await f.onsubmit({preventDefault(){},target:f})}
 return{env,get,calls,login};
}
(async()=>{
 const l=storage(),s=storage(),first=app(l,s);assert(first.get('#mobileDialog').open);
 assert(first.get('#mobileDialog').firstElementChild.innerHTML.includes('name="remember"'));
 await first.login(true);assert.equal(first.env.MobileArena.getUser().id,'pupil');assert(l.getItem('arena.mobile.auth'));
 const next=app(l,storage());await new Promise(setImmediate);assert.equal(next.env.MobileArena.getUser().id,'pupil');assert(!next.get('#mobileDialog').open,'remembered login does not reopen the login dialog');
 next.env.MobileArena.profile();next.get('[data-remember]').onchange({target:{checked:false}});assert.equal(l.getItem('arena.mobile.auth'),null);assert(next.env.MobileArena.getUser());
 next.get('[data-remember]').onchange({target:{checked:true}});assert(l.getItem('arena.mobile.auth'));
 const out=app(l,storage(),{offline:true});await new Promise(setImmediate);assert(out.env.MobileArena.getUser(),'network error must retain remembered login');out.env.MobileArena.profile();out.get('[data-logout]').onclick();assert.equal(out.env.MobileArena.getUser(),null);assert.equal(l.getItem('arena.mobile.auth'),null);
 const temp=app(l,storage());await temp.login(false);assert(temp.env.MobileArena.getUser());assert.equal(app(l,storage()).env.MobileArena.getUser(),null);
 store.save(auth,true);const expiredApp=app(local,storage(),{expired:true});await new Promise(setImmediate);assert.equal(expiredApp.env.MobileArena.getUser(),null);assert.equal(local.getItem('arena.mobile.auth'),null,'server expiry removes saved token');
 console.log('Remembered login: opt-in, reload/reopen, shared-device opt-out, password exclusion, offline retention/logout, storage failure, expiry and actual account handlers passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
