'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
// Exercise the actual fitter. Menus must retain the saved preference without scaling or resetting scroll.
function fitHarness({menu=false,comfort=false,height=700,barHeight=82}={}){
 const callbacks=[],events={},style=()=>({setProperty(k,v){this[k]=v},removeProperty(k){delete this[k]}});
 const root={dataset:{},style:style(),clientWidth:390};
 const stage={dataset:{},style:style(),querySelector(){return null}};
 const button={setAttribute(k,v){this[k]=v},addEventListener(k,f){this[k]=f}};
 const bar={querySelector(){return{}},insertBefore(){},getBoundingClientRect(){return{height:barHeight}}};
 let scrollCalls=0;
 const win={parent:{},innerWidth:390,innerHeight:900,scrollX:0,scrollY:950,visualViewport:{height,addEventListener(){}},requestAnimationFrame:f=>callbacks.push(f),addEventListener(k,f){events[k]=f},scrollTo(){scrollCalls++}};
 const document={documentElement:root,body:{dataset:comfort?{comfort:'on'}:{},classList:{contains:()=>menu}},getElementById:id=>id==='arenaDisplayBar'?bar:id==='arenaFitStage'?stage:id==='hub'&&menu?{}:null,createElement:()=>button,addEventListener(){}};
 const context={document,window:win,localStorage:{getItem:()=>null,setItem(){}},getComputedStyle:()=>({display:'block'})};
 vm.runInNewContext(fs.readFileSync('assets/js/1118c0569ebf.js','utf8'),context);
 const flush=()=>{while(callbacks.length)callbacks.shift()()};flush();
 return{root,stage,button,win,flush,scrollCalls:()=>scrollCalls};
}
const menu=fitHarness({menu:true});
assert.equal(menu.button['aria-pressed'],'true');
assert.equal(menu.root.dataset.arenaMenu,'on');
assert.equal(menu.stage.style.height,'');assert.equal(menu.stage.style.transform,'');
assert.equal(menu.scrollCalls(),0);
menu.button.click();menu.flush();assert.equal(menu.button['aria-pressed'],'false');
menu.button.click();menu.flush();assert.equal(menu.stage.style.height,'');assert.equal(menu.scrollCalls(),0);
const game=fitHarness({comfort:true});
assert.equal(game.stage.style.height,'618px');
assert.equal(game.root.style['--arena-bar-h'],'82px');
game.win.visualViewport.height=350;game.button.click();game.flush();game.button.click();game.flush();
assert.equal(game.stage.style.height,'268px');assert.equal(game.scrollCalls(),0);
// A resize/focus event reveals an editable answer. Game animation and body focus do not scroll the page.
const events={},vpEvents={},timers=new Map();let seq=0,reveals=0;
const root={dataset:{},style:{setProperty(k,v){this[k]=v}}};
const field={disabled:false,matches:()=>true,scrollIntoView(options){assert.equal(options.block,'nearest');reveals++}};
const document={documentElement:root,body:{},activeElement:null,addEventListener(k,f){(events[k]??=[]).push(f)},getElementById(){return null}};
const window={innerHeight:700,parent:{},visualViewport:{height:700,addEventListener(k,f){(vpEvents[k]??=[]).push(f)}},addEventListener(){}};
const context={document,window,innerHeight:700,MutationObserver:class{observe(){}},setTimeout:f=>{timers.set(++seq,f);return seq},clearTimeout:id=>timers.delete(id)};
vm.runInNewContext(fs.readFileSync('mobile/game.js','utf8'),context);
const flush=()=>{for(const [id,f]of [...timers]){timers.delete(id);f()}};
flush();assert.equal(reveals,0);
document.activeElement=field;events.focusin.forEach(f=>f());flush();assert.equal(root.dataset.arenaEditing,'on');assert.equal(reveals,1);
window.visualViewport.height=320;vpEvents.resize.forEach(f=>f());flush();assert.equal(root.style['--mobile-vh'],'320px');assert.equal(reveals,2);
document.activeElement=null;events.focusout.forEach(f=>f());flush();flush();assert.equal(root.dataset.arenaEditing,'off');assert.equal(reveals,2);
assert(!fs.readFileSync('games/energy/engine.js','utf8').includes('inputmode="none"'));
console.log('Scroll regressions: fit-on menus, preference toggling, no scroll reset, wrapped toolbar, keyboard viewport and focused answer reveal passed.');
// Reuse the maze engine harness and drive its real key handler, including Enter submission.
const fixture=fs.readFileSync('tests/maze-two.cjs','utf8').split('sandbox.window.onload();')[0]
 .replace('window:{devicePixelRatio:1,addEventListener(){}}','window:{devicePixelRatio:1,addEventListener(k,f){captured[k]=f}}');
const realm={require,console,module:{exports:{}}};
vm.runInNewContext('const captured={};\n'+fixture+'\nmodule.exports={sandbox,run,get,captured};',realm);
const h=realm.module.exports;h.sandbox.window.onload();
h.sandbox.window.configureArena(()=>({q:'2 + 2',o:['3','4','5','6'],ci:1,t:45}),'Тест',()=>{});
h.run('startNewGame()');
h.run("selectDirection(1,['up','right','down','left'].find(d=>!mazes[1][0][0].walls[d]))");
let prevented=0;const target={tagName:'INPUT',id:'p1-answer-input'};
h.captured.keydown({key:'ArrowLeft',target,preventDefault(){prevented++}});
assert.equal(prevented,0,'arrow keys must edit the field, not move the player');
h.get('p1-answer-input').value='4';
h.captured.keydown({key:'Enter',target,preventDefault(){prevented++}});
assert.equal(prevented,1);assert.equal(h.run('players[1].solvedCount'),1,'Enter submits the typed answer');
for(const mode of ['two','solo'])assert(!/answer-input[^>]*\breadonly/.test(fs.readFileSync('games/maze/'+mode+'.html','utf8')));
console.log('Maze keyboard: editable fields in both modes, arrow editing and actual Enter answer accepted.');
