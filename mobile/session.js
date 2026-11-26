(function(g){
 'use strict';
 const KEY='arena.mobile.auth';
 function create(stores){
  const read=(name,key)=>{try{return JSON.parse(stores[name]().getItem(key))}catch{return null}};
  const write=(name,key,value)=>{try{const store=stores[name]();if(value===null)store.removeItem(key);else store.setItem(key,JSON.stringify(value));return true}catch{return false}};
  // Only the server-issued session and public profile are retained, never credentials.
  function clean(value){
   if(!value||typeof value.token!=='string'||!/^[a-f0-9]{128}$/.test(value.token)||!value.user||typeof value.user.id!=='string'||typeof value.user.display!=='string')return null;
   const user={};for(const key of ['id','display','lastName','firstName','needsProfile','points','monthPoints','correct','grade'])if(Object.prototype.hasOwnProperty.call(value.user,key))user[key]=value.user[key];
   return{token:value.token,user,apiVersion:value.apiVersion};
  }
  function load(){
   const temporary=clean(read('session',KEY)),saved=clean(read('local',KEY)),auth=temporary||saved;
   return{auth,remember:!!auth&&!!saved&&auth.token===saved.token};
  }
  function save(value,remember){
   const auth=clean(value),persisted=write('local',KEY,auth&&remember?auth:null);
   write('session',KEY,auth);
   return!!auth&&!!remember&&persisted;
  }
  return{load,save};
 }
 const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else g.ArenaSessionStore=api;
})(globalThis);
