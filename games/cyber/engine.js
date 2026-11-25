const isSolo=Arena.mode==='solo';
let soloControl=null,soloPrivate=false;
function soloCall(fn){soloPrivate=true;try{return fn()}finally{soloPrivate=false}}
function soloHelp(q){soloControl?.render(document,".pn",q)}
const $=s=>document.querySelector(s),T=25,NM=['Neon Striker','Crimson Tank'];
let taskGenerator=null,courseLabel='',onExit=()=>{},starting=false,runToken=0,animationFrame=0;
const timeouts=new Set();
function later(fn,ms){const token=runToken,id=setTimeout(()=>{timeouts.delete(id);if(token===runToken)fn()},ms);timeouts.add(id);return id}
function clearPending(){runToken++;for(const id of timeouts)clearTimeout(id);timeouts.clear();if(P)P.forEach(p=>clearInterval(p.tm))}
const fm=s=>s;
let P,over=true;
const RB = (isSolo?(`<p>Вы играете против компьютера. Справа — правило и учебный пример. Нажмите «ГОТОВ».</p><div class="rdy"><button class="go rb" data-r="0">ВЫ · ГОТОВ</button><button class="go rb r2" data-r="1">КОМПЬЮТЕР · ГОТОВ</button></div>`):(`<p>Оба игрока одновременно нажимают свою кнопку «ГОТОВ» — бой начнётся, когда готовы оба.</p><div class="rdy"><button class="go rb" data-r="0">ИГРОК 1 · ГОТОВ</button><button class="go rb r2" data-r="1">ИГРОК 2 · ГОТОВ</button></div>`));
const ov=h=>{const o=$('#ov');o.innerHTML=h;o.hidden=false};
function splash(a,b,cb){const s=$('#sp');s.innerHTML=a+'<small>'+b+'</small>';s.hidden=false;s.style.animation='none';s.offsetWidth;s.style.animation='';later(()=>{s.hidden=true;cb()},1300)}
function setHP(i){const h=Math.max(P[i].hp,0);$('#b'+i).style.width=$('#g'+i).style.width=h+'%';$('#v'+i).textContent=h}
function start(){
 if(!taskGenerator)return;clearPending();taskGenerator.reset?.();starting=false;
 P=[0,1].map(()=>({hp:100,ok:0,bad:0,st:0,best:0,lock:true,asked:0}));over=false;$('#ov').hidden=true;
 [0,1].forEach(i=>{$('#f'+i).className='fi';setHP(i);$('#s'+i).textContent=0;$('#m'+i).textContent='';$('#o'+i).innerHTML='';$('#ex'+i).innerHTML='';$('#pr'+i).textContent=''});
 splash('РАУНД 1','FIGHT!',()=>{ask(0);ask(1)})}
function ask(i){if(isSolo){
 if(over||!taskGenerator)return;const p=P[i],task=taskGenerator(i);
 p.source=task;if(i===0)soloHelp(task);p.q=['x',task.q,task.o[task.ci]];p.o=[...task.o];p.lock=false;p.limit=Math.max(20,task.t||T);
 $('#m'+i).textContent='';$('#pr'+i).textContent='Задание '+(++p.asked);$('#ex'+i).className='ex long';$('#ex'+i).innerHTML=task.q;
 const keys=i?'7890':'1234';
 $('#o'+i).innerHTML=p.o.map((o,j)=>`<button class="opt" data-i="${i}" data-j="${j}"><em>${keys[j]}</em><span>${o}</span></button>`).join('');
 p.left=p.limit;tick(i);clearInterval(p.tm);
 p.tm=setInterval(()=>{if(i===1)soloControl?.tick(.1,!over&&!p.lock,ok=>soloCall(()=>pick(1,ok?p.source.ci:(p.source.ci+1)%4)));if(p.lock)return;p.left=Math.max(0,p.left-.1);tick(i);if(p.left<=0)pick(i,-1)},100);
}else{
 if(over||!taskGenerator)return;const p=P[i],task=taskGenerator(i);
 p.q=['x',task.q,task.o[task.ci]];p.o=[...task.o];p.lock=false;p.limit=Math.max(20,task.t||T);
 $('#m'+i).textContent='';$('#pr'+i).textContent='Задание '+(++p.asked);$('#ex'+i).className='ex long';$('#ex'+i).innerHTML=task.q;
 const keys=i?'7890':'1234';
 $('#o'+i).innerHTML=p.o.map((o,j)=>`<button class="opt" data-i="${i}" data-j="${j}"><em>${keys[j]}</em><span>${o}</span></button>`).join('');
 p.left=p.limit;tick(i);clearInterval(p.tm);
 p.tm=setInterval(()=>{p.left=Math.max(0,p.left-.1);tick(i);if(p.left<=0)pick(i,-1)},100);
}}
function tick(i){const p=P[i];$('#tn'+i).textContent=Math.ceil(p.left);$('#tf'+i).style.width=p.left/p.limit*100+'%';$('#h'+i).classList.toggle('low',p.left<=5)}
function pick(i,j){if(isSolo){if(i===1&&!soloPrivate)return;
 const p=P[i];if(over||p.lock)return;p.lock=true;clearInterval(p.tm);
 const ok=j>=0&&p.o[j]===p.q[2],m=$('#m'+i);taskGenerator.answer?.(i,ok);
 document.querySelectorAll('#o'+i+' .opt').forEach((b,k)=>{b.disabled=true;if(p.o[k]===p.q[2])b.classList.add('ok');else if(k===j)b.classList.add('bad')});
 if(ok){p.ok++;p.st++;p.best=Math.max(p.best,p.st);$('#s'+i).textContent=p.st;$('#f'+i).classList.toggle('hot',p.st>=3);m.className='m ok';m.textContent=p.st>=3?'СЕРИЯ ×'+p.st+'!':'ВЕРНО!';strike(i,p.limit-p.left<=5);later(()=>ask(i),1100)}
 else{p.bad++;p.st=0;$('#f'+i).classList.remove('hot');$('#s'+i).textContent=0;m.className='m bad';m.textContent=j<0?'ВРЕМЯ ВЫШЛО!':'ПРОМАХ!';later(()=>ask(i),1500)}}else{
 const p=P[i];if(over||p.lock)return;p.lock=true;clearInterval(p.tm);
 const ok=j>=0&&p.o[j]===p.q[2],m=$('#m'+i);taskGenerator.answer?.(i,ok);
 document.querySelectorAll('#o'+i+' .opt').forEach((b,k)=>{b.disabled=true;if(p.o[k]===p.q[2])b.classList.add('ok');else if(k===j)b.classList.add('bad')});
 if(ok){p.ok++;p.st++;p.best=Math.max(p.best,p.st);$('#s'+i).textContent=p.st;$('#f'+i).classList.toggle('hot',p.st>=3);m.className='m ok';m.textContent=p.st>=3?'СЕРИЯ ×'+p.st+'!':'ВЕРНО!';strike(i,p.limit-p.left<=5);later(()=>ask(i),1100)}
 else{p.bad++;p.st=0;$('#f'+i).classList.remove('hot');$('#s'+i).textContent=0;m.className='m bad';m.textContent=j<0?'ВРЕМЯ ВЫШЛО!':'ПРОМАХ!';later(()=>ask(i),1500)}}}
function rel(el,fy=.35){const a=$('#arena').getBoundingClientRect(),r=el.getBoundingClientRect();return[r.left-a.left+r.width/2,r.top-a.top+r.height*fy,r,a]}
function mk(c,css,txt){const e=document.createElement('span');e.className=c;if(css)e.style.cssText=css;if(txt)e.textContent=txt;$('#cam').appendChild(e);later(()=>e.remove(),1200);return e}
function zoom(x,y,c,ms){const k=$('#cam');k.style.transformOrigin=x+'px '+y+'px';k.classList.add(c);later(()=>k.classList.remove(c),ms)}
function trail(i){const A=$('#f'+i),img=A.querySelector('img');[50,110,170,230].forEach(t=>later(()=>{const[,,r,a]=rel(A);const g=img.cloneNode();g.className='ghost';g.style.cssText=`position:absolute;left:${r.left-a.left}px;top:${r.top-a.top}px;height:${r.height}px;scale:${i?1:'-1 1'};filter:hue-rotate(${i?-20:30}deg) blur(1px)`;$('#cam').appendChild(g);later(()=>g.remove(),500)},t))}
function impact(i,d,dmg,crit,full){
 if(over)return;const D=$('#f'+d),[x,y,r]=rel(D),col=i?'#ff2a3d':'#19f0ff',ar=$('#arena');
 D.classList.remove('hit','kb');D.offsetWidth;D.classList.add('hit','kb');later(()=>D.classList.remove('hit','kb'),800);
 burst(x,y,col,full?(crit?50:28):8);
 if(!full){mk('flash',`left:${x}px;top:${y}px`);return}
 P[d].hp=Math.max(0,P[d].hp-dmg);setHP(d);
 mk('slash s'+i,`left:${x-r.width*.9}px;top:${y-r.height*.1}px`);
 mk('ring',`left:${x}px;top:${y}px;border-color:${col}`);
 mk('pop'+(crit?' c':''),`left:${x-30}px`,(crit?'КРИТ −':'−')+dmg);
 mk('word',`left:${x-50}px;top:${y-r.height*.3}px;color:${crit?'#ffe066':'#fff'}`,(crit?['КРИТ!','БАХ!!','ВЖЖЖ!']:['БАМ!','ХРАСЬ!','ЩЁЛК!','ТРЕСК!'])[Math.random()*(crit?3:4)|0]);
 ar.classList.remove('sk','fl');ar.offsetWidth;ar.classList.add('sk','fl');
 if(P[d].hp<=0){over=true;P.forEach(p=>clearInterval(p.tm));D.classList.add('ko');burst(x,y,'#fff',70);zoom(x,y,'zz',900);later(()=>splash('K.O.!','',()=>end(i)),800)}
 else if(crit){zoom(x,y,'zz',320);const k=$('#cam'),s=$('#spd');k.classList.add('gl');later(()=>k.classList.remove('gl'),140);s.style.setProperty('--x',x+'px');s.style.setProperty('--y',y+'px');s.classList.remove('on');s.offsetWidth;s.classList.add('on')}
 else zoom(x,y,'zm',140)}
function strike(i,crit){
 const d=1-i,A=$('#f'+i),dmg=crit?15:10,[ax,ay,ar]=rel(A),[dx]=rel($('#f'+d));
 if(crit||Math.random()<.5){
  A.classList.add('atk');trail(i);burst(ax,rel(A,.97)[1],'#9ab',12);later(()=>A.classList.remove('atk'),800);
  later(()=>impact(i,d,dmg,crit,true),270)
 }else{
  A.classList.add('cast');later(()=>A.classList.remove('cast'),600);
  if(i==0){later(()=>{const e=mk('wave',`left:${ax+ar.width*.3}px;top:${ay}px`);e.offsetWidth;e.style.left=(dx-ar.width*.2)+'px';later(()=>e.remove(),380)},150);later(()=>impact(i,d,dmg,false,true),500)}
  else for(let k=0;k<6;k++)later(()=>{const sx=ax-ar.width*.35;mk('flash',`left:${sx}px;top:${ay}px`);const e=mk('bul',`left:${sx}px;top:${ay+(k%3-1)*10}px`);e.offsetWidth;e.style.left=(dx+ar.width*.2)+'px';later(()=>e.remove(),220);later(()=>impact(i,d,dmg,false,k==5),200)},100+k*75)
 }}
function end(w){if(isSolo){
 const c=i=>{const p=P[i],n=p.ok+p.bad;return`<div class="rc${i?' r':''}${i==w?' w':''}" style="color:${i?'#f5c04a':'#19f0ff'}"><h3>${i==w?'🏆 ':''}${i?'Компьютер':'Вы'} · ${NM[i]}</h3><div style="color:#e8f4ff"><span>Верных</span><b class="ok">${p.ok}</b></div><div style="color:#e8f4ff"><span>Неверных</span><b class="no">${p.bad}</b></div><div style="color:#e8f4ff"><span>Точность</span><b>${n?Math.round(p.ok/n*100):0}%</b></div><div style="color:#e8f4ff"><span>Лучшая серия</span><b>${p.best}</b></div><div style="color:#e8f4ff"><span>Осталось HP</span><b>${Math.max(0,p.hp)}</b></div></div>`};
 ov(`<h1><span>ПОБЕДА</span></h1><p class="hd" style="font-size:22px;color:${w?'#f5c04a':'#19f0ff'}">${w?'Компьютер':'Вы'} · ${NM[w]}</p><div class="res">${c(0)}${c(1)}</div>${RB}<button class="go menu exit-game">← Сменить тему</button>`)}else{
 const c=i=>{const p=P[i],n=p.ok+p.bad;return`<div class="rc${i?' r':''}${i==w?' w':''}" style="color:${i?'#f5c04a':'#19f0ff'}"><h3>${i==w?'🏆 ':''}Игрок ${i+1} · ${NM[i]}</h3><div style="color:#e8f4ff"><span>Верных</span><b class="ok">${p.ok}</b></div><div style="color:#e8f4ff"><span>Неверных</span><b class="no">${p.bad}</b></div><div style="color:#e8f4ff"><span>Точность</span><b>${n?Math.round(p.ok/n*100):0}%</b></div><div style="color:#e8f4ff"><span>Лучшая серия</span><b>${p.best}</b></div><div style="color:#e8f4ff"><span>Осталось HP</span><b>${Math.max(0,p.hp)}</b></div></div>`};
 ov(`<h1><span>ПОБЕДА</span></h1><p class="hd" style="font-size:22px;color:${w?'#f5c04a':'#19f0ff'}">Игрок ${w+1} · ${NM[w]}</p><div class="res">${c(0)}${c(1)}</div>${RB}<button class="go menu exit-game">← Сменить тему</button>`)}}
if(isSolo){document.addEventListener('pointerdown',e=>{
 if(e.target.closest('#leave,.exit-game')){e.preventDefault();leave();return}
 const b=e.target.closest('.opt');if(b){e.preventDefault();if(!b.disabled)pick(+b.dataset.i,+b.dataset.j);return}
 const r=e.target.closest('.rb');if(r&&!starting&&taskGenerator){r.classList.add('on');r.dataset.on=1;r.textContent='✔ ИГРОК '+(+r.dataset.r+1)+' ГОТОВ';if(document.querySelectorAll('.rb[data-on]').length>=1){starting=true;document.querySelectorAll('.rb').forEach(b=>b.disabled=true);later(start,350)}}
},{passive:false});}else{document.addEventListener('pointerdown',e=>{
 if(e.target.closest('#leave,.exit-game')){e.preventDefault();leave();return}
 const b=e.target.closest('.opt');if(b){e.preventDefault();if(!b.disabled)pick(+b.dataset.i,+b.dataset.j);return}
 const r=e.target.closest('.rb');if(r&&!starting&&taskGenerator){r.classList.add('on');r.dataset.on=1;r.textContent='✔ ИГРОК '+(+r.dataset.r+1)+' ГОТОВ';if(document.querySelectorAll('.rb[data-on]').length==2){starting=true;document.querySelectorAll('.rb').forEach(b=>b.disabled=true);later(start,350)}}
},{passive:false});}
document.addEventListener('contextmenu',e=>e.preventDefault());
const fs=$('#fs');
fs.addEventListener('pointerdown',()=>{try{document.documentElement.requestFullscreen()}catch(_){}try{navigator.wakeLock.request('screen').catch(()=>{})}catch(_){}});
document.addEventListener('fullscreenchange',()=>fs.hidden=!!document.fullscreenElement);
addEventListener('keydown',e=>{if(over||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;if('12347890'.includes(e.key))e.preventDefault();let j='1234'.indexOf(e.key);if(j>=0)return pick(0,j);j='7890'.indexOf(e.key);if(j>=0)pick(1,j)});
function city(el,o){const H=200,R=Math.random,pal=['y','y','y','w','c','m'],cl={y:'#ffd34d',c:'#19f0ff',m:'#ff2bd6',w:'#fff4d6'};let x=0,rc='',ex='',win={y:'',c:'',m:'',w:''};
 while(x<1000){const w=o.w0+R()*(o.w1-o.w0),h=o.min+R()*(o.max-o.min),y=H-h,r=R();
  rc+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${o.base}"/><rect x="${x}" y="${y}" width="2" height="${h}" fill="${o.edge}" opacity=".6"/><rect x="${x}" y="${y}" width="${w}" height="1.5" fill="${o.edge}" opacity=".5"/>`;
  if(r<.25)ex+=`<rect x="${x+w*.3}" y="${y-12}" width="${w*.4}" height="12" fill="${o.base}"/>`;
  else if(r<.5)ex+=`<path d="M${x+w/2} ${y}V${y-34}" stroke="${o.edge}" stroke-width="1.5"/><circle cx="${x+w/2}" cy="${y-34}" r="2.5" fill="#ff2a3d" class="bk"/>`;
  else if(r<.62)ex+=`<rect x="${x+4}" y="${y-18}" width="${w-8}" height="13" fill="${R()<.5?'#ff2bd6':'#19f0ff'}" opacity=".85" class="bk"/>`;
  else if(r<.7)ex+=`<rect x="${x+w-8}" y="${y+10}" width="4" height="${Math.min(h-20,50)}" fill="${R()<.5?'#19f0ff':'#ff2bd6'}" class="bk"/>`;
  for(let cx=x+6;cx<x+w-8;cx+=9)for(let cy=y+8;cy<H-4;cy+=12)if(R()<o.dens)win[pal[R()*6|0]]+=`M${cx} ${cy}h4v6h-4z`;
  x+=w+(R()<.3?5:1)}
 el.innerHTML=`<svg viewBox="0 0 1000 ${H}" preserveAspectRatio="xMidYMax slice">${rc}${ex}${Object.keys(win).map(k=>`<path d="${win[k]}" fill="${cl[k]}"/>`).join('')}</svg>`}
city($('#far'),{min:110,max:190,w0:50,w1:90,base:'#150b36',edge:'#ff2bd6',dens:.14});
city($('#mid'),{min:70,max:150,w0:40,w1:80,base:'#0d0a2a',edge:'#19f0ff',dens:.25});
city($('#near'),{min:30,max:105,w0:45,w1:100,base:'#06081a',edge:'#ff2bd6',dens:.32});
const cv=$('#cv'),cx=cv.getContext('2d');
let W,H,rain=[],sp=[];
function rs(){const r=$('#arena').getBoundingClientRect();W=cv.width=r.width;H=cv.height=r.height;rain=Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H,l:8+Math.random()*14,v:9+Math.random()*8}))}
function burst(x,y,c,n){for(let k=0;k<n;k++){const a=Math.random()*6.28,s=2+Math.random()*7;sp.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-3,life:30+Math.random()*20,m:50,c})}}
(function loop(){cx.clearRect(0,0,W,H);cx.strokeStyle='rgba(160,220,255,.3)';cx.lineWidth=1;cx.beginPath();
 for(const r of rain){cx.moveTo(r.x,r.y);cx.lineTo(r.x-r.l*.25,r.y+r.l);r.y+=r.v;r.x-=r.v*.25;if(r.y>H){r.y=-20;r.x=Math.random()*W+40}}cx.stroke();
 sp=sp.filter(p=>p.life>0);for(const p of sp){p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.life--;cx.globalAlpha=p.life/p.m;cx.fillStyle=p.c;cx.fillRect(p.x,p.y,4,4)}cx.globalAlpha=1;animationFrame=requestAnimationFrame(loop)})();
addEventListener('resize',rs);
rs();
function leave(){clearPending();over=true;starting=false;cancelAnimationFrame(animationFrame);try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch{}onExit()}
function welcome(){if(isSolo){
 ov(`<h1>КИБЕР<span>ДУЭЛЬ</span></h1><p class="hd" id="selected-course"></p><p>Вы решаете свои задания, компьютер отвечает автоматически. На вашем месте справа — правило и учебный пример. Верный ответ — удар по сопернику; ответ за первые 5 секунд — критический удар. Ошибка — пауза и новый вопрос. Побеждает тот, кто первым обнулит здоровье соперника.</p><p><b style="color:#19f0ff">Вы</b>: клавиши 1–4 · Компьютером управляет программа. Пользуйтесь экранными кнопками или клавишами 1–4.</p>${RB}<button class="go menu exit-game">← К темам</button>`);
 $('#selected-course').textContent=courseLabel;
}else{
 ov(`<h1>КИБЕР<span>ДУЭЛЬ</span></h1><p class="hd" id="selected-course"></p><p>У каждого свой вопрос и варианты ответа. Верный ответ — удар по сопернику; ответ за первые 5 секунд — критический удар. Ошибка — пауза и новый вопрос. Побеждает тот, кто первым обнулит здоровье соперника.</p><p><b style="color:#19f0ff">Игрок 1</b>: клавиши 1–4 · <b style="color:#f5c04a">Игрок 2</b>: клавиши 7, 8, 9, 0. Можно одновременно касаться вариантов на своей половине экрана.</p>${RB}<button class="go menu exit-game">← К темам</button>`);
 $('#selected-course').textContent=courseLabel;
}}
window.configureArena=(next,label,exit)=>{clearPending();over=true;starting=false;taskGenerator=next;courseLabel=label;onExit=exit;$('#course').textContent=label;welcome();rs()};
ov('<p>Подключение генератора заданий…</p>');
const soloOriginalConfigure=window.configureArena;
if(isSolo){window.configureArena=(next,label,exit)=>{soloControl=next.solo;soloOriginalConfigure(next,label,exit);soloHelp(soloControl?.preview)};}