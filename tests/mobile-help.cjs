'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function harness(mode,game){
 const nodes=new Map(),events={};let configured;
 class El{
  constructor(){this.dataset={};this.events={};this.attrs={};this.open=false;this.scrollTop=0;this.innerHTML='';this.textContent=''}
  set id(v){this._id=v;nodes.set(v,this)}get id(){return this._id}
  setAttribute(k,v){this.attrs[k]=v}hasAttribute(k){return k in this.attrs}
  addEventListener(k,f){this.events[k]=f}focus(){this.focused=true}
  querySelector(s){return get(s.replace(/^#/,''))}
  querySelectorAll(s){return (s.includes('player')?[0,1]:[0,1,2]).map(i=>{const b=get(s+i);b.dataset[s.includes('player')?'helpPlayer':'helpLane']=String(i);return b})}
  showModal(){this.open=true}close(){this.open=false;this.events.close?.()}
 }
 const get=id=>{if(!nodes.has(id))nodes.set(id,new El());return nodes.get(id)};
 const body={dataset:{playMode:mode,gameId:game},appendChild(el){el.parentNode=this}};
 const document={body,getElementById:get,createElement:()=>new El(),querySelector:()=>null,addEventListener(k,f){events[k]=f}};
 const window={configureArena(next){configured=next}};
 vm.runInNewContext(fs.readFileSync('mobile/help.js','utf8'),{document,window,Map,Number,Object});
 return{get,events,window,body,configure:next=>window.configureArena(next),source:()=>configured};
}
let count=0;
for(const dir of fs.readdirSync('games'))for(const mode of ['solo','two']){
 const path='games/'+dir+'/'+mode+'.html';if(!fs.existsSync(path))continue;
 const html=fs.readFileSync(path,'utf8');assert.equal((html.match(/id="arenaHelpToggle"/g)||[]).length,1,path);
 assert(html.indexOf('id="arenaHelpToggle"')<html.indexOf('id="arenaFitStage"'),path+' help must be outside fitted game');
 assert(html.includes('mobile/help.css'));assert(html.includes('mobile/help.js'));assert(html.indexOf('engine.js')<html.indexOf('mobile/help.js'));
 const h=harness(mode,dir);let n=0,resets=0,answers=0;
 const source=(p=0,l=0)=>({q:'Вопрос '+(++n)+' игрок '+p+' полоса '+l,o:['1','2','3','4'],ci:0});
 source.studyLesson=q=>'<h3>Правило</h3><p>'+q.q+'</p><h3>Аналогичный пример</h3><p>Пример к '+q.q+'</p>';
 source.answer=()=>answers++;source.reset=()=>resets++;
 h.configure(source);const tracked=h.source();
 for(const p of mode==='solo'?[0]:[0,1])for(const l of dir==='runner'?[0,1,2]:[0])tracked(p,l);
 h.get('arenaHelpToggle').events.click();const d=h.get('arenaHelpDialog'),c=h.get('arenaHelpContent');
 assert(d.open);assert.equal(d.parentNode,h.body,'dialog must bypass transformed/clipped game');assert(c.innerHTML.includes('Аналогичный пример'));if(dir==='expedition'&&mode==='two')assert(c.innerHTML.includes('игрок 1'),'turn-based help follows the current player');
 const before=c.innerHTML;tracked(0,dir==='runner'?1:0);assert.notEqual(c.innerHTML,before,'open explanation follows new question');
 if(mode==='two'){const b={dataset:{helpPlayer:'1'},hasAttribute:()=>false};d.events.click({target:{closest:()=>b},stopPropagation(){}});assert(c.innerHTML.includes('игрок 1'))}
 if(dir==='runner'){const b={dataset:{helpLane:'2'},hasAttribute:()=>false};d.events.click({target:{closest:()=>b},stopPropagation(){}});assert(c.innerHTML.includes('полоса 2'))}
 const beforeRecords=answers;assert(h.window.ArenaMobileHelp.close());assert(!d.open);assert.equal(h.get('arenaHelpToggle').attrs['aria-expanded'],'false');assert.equal(answers,beforeRecords,'looking at help never records an answer');
 tracked.answer(0,true);assert.equal(answers,1);tracked.reset();assert.equal(resets,1);
 h.window.ArenaMobileHelp.open();assert(c.innerHTML.includes('Начните игру'));assert.equal(n,mode==='solo'?(dir==='runner'?4:2):(dir==='runner'?7:3),'opening help must not draw extra questions');
 assert(d.events.cancel&&d.events.keydown);let stopped=false;d.events.keydown({key:'Escape',stopPropagation(){stopped=true},preventDefault(){}});assert(stopped);assert(!d.open);
 count++;
}
assert.equal(count,36);
console.log('Mobile help UI:',count,'real game pages: permanent toolbar button, unclipped scrolling dialog, player/lane switching, current question replacement, reset, close/ESC, unchanged answer/reset forwarding and no extra tasks passed.');
