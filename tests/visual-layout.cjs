const fs=require('fs'),vm=require('vm'),assert=require('assert');
// Reuse the established game harnesses; exercise real rendering with loaded images.
function harness(file,marker){let code=fs.readFileSync(file,'utf8').split(marker)[0];const outer={require,console,module:{exports:{}}};vm.createContext(outer);return{outer,code,run(extra){vm.runInContext(code+'\n'+extra,outer);return outer.module.exports}}}
const f=harness('tests/forest-two.cjs','sandbox.window.configureArena');const forest=f.run(`sandbox.window.configureArena(task,'Проверка',()=>{});run('start()');module.exports={run,get,sandbox};`);
for(const [w,h]of [[180,90],[320,180],[640,284],[900,300],[480,700]])for(let scene=0;scene<6;scene++){const p=forest.run(`forestProjection(${scene},${w},${h})`);assert(p.x>=-1e-6&&p.y>=-1e-6);assert(p.x+p.width<=w+1e-6&&p.y+p.height<=h+1e-6);assert(Math.abs(p.width/p.height-p.frame[2]/p.frame[3])<1e-8)}
for(let scene=0;scene<4;scene++)for(const [x,y,w,h]of forest.run(`FOREST_BOARDS[${scene}]`)){assert(x-w/2>0&&x+w/2<1);assert(y+h/2<.5);assert(w>.17&&h>.12)}
// CSS boxes report scrollHeight at least as large as clientHeight. This must not
// force every short answer down to the minimum font size.
forest.run('players[0].scene=0;ask(0)');for(let j=0;j<3;j++){const el=forest.get('#answer0-'+j);el.clientWidth=130;el.scrollWidth=130;el.clientHeight=40;el.scrollHeight=40}forest.run('fitSignText(0)');assert(parseFloat(forest.get('#answer0-0').style.fontSize)>25,'short numbers retain a large font');
const fraction='<span class="fr"><i>3</i><b>8</b></span>';const source=()=>({q:'Выберите дробь',o:[fraction,'1','2','3'],ci:0,t:30});forest.sandbox.window.configureArena(source,'Дроби',()=>{});forest.run('start()');assert.equal(forest.run('players[0].signNumbered'),false);assert([0,1,2].some(j=>forest.get('#answer0-'+j).innerHTML===fraction));
const long=()=>({q:'Выберите описание.',o:['Очень длинное первое описание выбранного явления','Второе подробное описание исследуемого явления','Третье длинное описание рассматриваемого явления','Четвёртое подробное описание исследуемого явления'],ci:0,t:60});forest.sandbox.window.configureArena(long,'Теория',()=>{});forest.run('start()');assert(forest.run('players[0].signNumbered'));assert(forest.get('#question0').innerHTML.includes('forest-reference'));for(let j=0;j<3;j++)assert.equal(forest.get('#answer0-'+j).innerHTML,String(j+1));assert(!fs.readFileSync('games/forest/engine.js','utf8').includes('scene.after(dock)'));
const p=harness('tests/planes-two.cjs',' c.window.configureArena');p.code=p.code.replace('Image:class{}',"Image:class{constructor(){this.naturalWidth=this.width=1448;this.height=1086}}");const planes=p.run(`c.window.configureArena(generator,'Проверка',()=>{},{grade:6,topicIndex:0,topics});advance(5000);module.exports={run,c};`);const player=planes.run('nativeTestEngine.test.players()[0]');for(const [width,height]of [[640,280],[960,540],[300,220],[1500,300]]){player.cv.getBoundingClientRect=()=>({width,height});planes.run('nativeTestEngine.test.loop(5100)');assert(Math.abs(player.view.width/440-width/height)<.005);assert(Math.abs(340/2+player.view.extra-player.view.width/2)<1e-7)}
console.log('Visual regressions: full-width undistorted flight canvases with loaded artwork, all forest frames/aspects, aligned board hit regions, large numbers, fractions and long-answer references passed.');

// A fit-to-screen transform changes boundingClientRect, while absolute button
// coordinates and canvas drawing remain in the scene's local CSS pixels.
for(const scale of [.45,.67,1,1.25]){
 const scene=forest.get('#scene0');scene.clientWidth=768;scene.clientHeight=341;
 scene.getBoundingClientRect=()=>({width:768*scale,height:341*scale,left:0,top:0});
 forest.run('players[0].scene=0;players[0].pathCoords=FOREST_BOARDS[0];fitSignText(0)');
 for(let j=0;j<3;j++){
  const b=forest.get('#players').children.filter(x=>x.dataset.player==='0'&&x.dataset.choice!==undefined)[j];
  const [x,y,w,h]=forest.run('FOREST_BOARDS[0]['+j+']');
  assert(Math.abs(parseFloat(b.style.left)-(x-w/2)*768)<1e-6);
  assert(Math.abs(parseFloat(b.style.top)-(y-h/2)*341)<1e-6);
 }
}
console.log('Forest board coordinates preserve alignment under fit transforms at four scale factors.');
