const isSolo=Arena.mode==='solo';
window.configureArena=(generator,label,onExit,context)=>{const R=Arena.randomInt,pick=Arena.pick;
const engine=(function(ROOT,TOP,hooks){
const $=s=>ROOT.querySelector(s),$$=s=>ROOT.querySelectorAll(s);
const W=340,H=440,BASE=64,K=2,KEYS=[['1','2','3','4'],['7','8','9','0']];
const AS={atlas:'../../assets/images/flight-kit-v2.png',bg1:'../../assets/images/flight-valley-v2.png'};
const AI={};for(const k in AS){AI[k]=new Image();AI[k].src=AS[k]}
const FLIGHT_FRAMES={jet:[81,9,342,256],heli:[559,9,342,256],rock1:[1070,9,260,256],rock2:[163,273,169,270],crack:[546,280,361,244],bar1:[1014,288,379,255],bar2:[128,554,237,243],turret:[643,544,159,255],pylon:[1117,543,172,266],base:[17,839,452,230],cloud:[540,837,369,227],boom:[1093,857,211,172],cave:[1014,288,379,255]};
function sprite(c,key,x,y,w,h){const f=FLIGHT_FRAMES[key];if(!AI.atlas.naturalWidth||!f)return;c.drawImage(AI.atlas,...f,x,y,w,h)}
let sel={g:null,t:null},P=[],run=false,over=false,last=0,raf=0,tok=0,gen;
$('#gr').innerHTML=Object.keys(TOP).map(g=>`<button class="opt" data-g="${g}">${g} класс</button>`).join('');
$('#gr').onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;sel={g:b.dataset.g,t:null};$$('#gr .opt').forEach(x=>x.classList.toggle('sel',x===b));
 $('#tw').hidden=false;$('#go').disabled=true;$('#tp').innerHTML=TOP[sel.g].map((t,i)=>`<button class="opt" data-t="${i}">${t[0]}</button>`).join('')};
$('#tp').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;sel.t=+b.dataset.t;$$('#tp .opt').forEach(x=>x.classList.toggle('sel',x===b));$('#go').disabled=false};
$('#go').onclick=start;
const hudP = (isSolo?(i=>`<div class="pl p${i+1}"><b>${i?'Компьютер':'Вы'}</b><span class="hp">${'<u></u>'.repeat(5)}</span><span class="pips" title="Верных ответов до базы">${'<s></s>'.repeat(5)}</span></div>`):(i=>`<div class="pl p${i+1}"><b>Игрок ${i+1}</b><span class="hp">${'<u></u>'.repeat(5)}</span><span class="pips" title="Верных ответов до базы">${'<s></s>'.repeat(5)}</span></div>`));
function mount(){$('#game').innerHTML=`<div class="hud">${hudP(0)}<div class="mid">${sel.g} класс · ${TOP[sel.g][sel.t][3] || 'год'}${TOP[sel.g][sel.t][3]?' четв.':''}<br><button id="snd">${mute?'🔇':'🔊'}</button> <button id="menu">Выйти</button></div>${hudP(1)}</div>
<div class="field">${[0,1].map(i=>`<div class="lane p${i+1}"><canvas width="${W*K}" height="${H*K}"></canvas><div class="toast"></div></div>`).join('')}</div>
<div class="panels">${[0,1].map(i=>`<section class="panel p${i+1}"><div class="q">Приготовьтесь…</div><div class="tb"><i></i></div><div class="ans">${[0,1,2,3].map(j=>`<button data-i="${i}" data-j="${j}" disabled><em>${KEYS[i][j]}</em><span></span></button>`).join('')}</div></section>`).join('')}</div>`}
function mkP(i){const cv=$$('.lane canvas')[i],cx=cv.getContext('2d'),pn=$$('.panel')[i];cx.setTransform(K,0,0,K,0,0);
 return{i,cv,view:{extra:0,width:W},pan:pn,boost:0,slow:0,flash:0,bt:9,streak:0,hist:[],amp:90,alt:0,pa:0,hp:5,prog:0,dp:0,ok:0,err:0,state:'wait',scroll:i*80,shake:0,parts:[],ob:null,q:null,tl:0,at:0,ct:0,cx,
 toast:$$('.toast')[i],qel:pn.querySelector('.q'),tbw:pn.querySelector('.tb'),tb:pn.querySelector('.tb i'),btns:[...pn.querySelectorAll('.ans button')],hpE:[...$$('.hp')[i].children],pipE:[...$$('.pips')[i].children]}}
function start(){if(isSolo){au();gen=Arena.nativeSession(generator);mount();cancelAnimationFrame(raf);over=false;run=false;P=[0,1].map(mkP);
 $('#setup').hidden=true;$('#game').hidden=false;const my=++tok;
 (function cd(n){if(my!=tok)return;if(!n){SFX.count(0);$('#ov').hidden=true;run=true;P.forEach(p=>ask(p));return}SFX.count(n);$('#ov').hidden=false;$('#ov').innerHTML=`<div class="big">${n}</div>`;setTimeout(()=>cd(n-1),800)})(3);
 last=performance.now();raf=requestAnimationFrame(loop)}else{au();gen=Arena.nativeSession(generator);mount();cancelAnimationFrame(raf);over=false;run=false;P=[0,1].map(mkP);
 $('#setup').hidden=true;$('#game').hidden=false;const my=++tok;
 (function cd(n){if(my!=tok)return;if(!n){SFX.count(0);$('#ov').hidden=true;run=true;P.forEach(p=>ask(p));return}SFX.count(n);$('#ov').hidden=false;$('#ov').innerHTML=`<div class="big">${n}</div>`;setTimeout(()=>cd(n-1),800)})(3);
 last=performance.now();raf=requestAnimationFrame(loop)}}
function exit(){tok++;run=false;cancelAnimationFrame(raf);$('#game').hidden=true;$('#ov').hidden=true;hooks.exit()}
function ask(p){if(isSolo){p.q=gen.next(p.i);if(p.i===0)Arena.renderCoach(ROOT,'.panels',p.q,gen.solo);p.tl=p.q.t;p.lc=99;SFX.q();p.state='ask';p.ob={t:pick(p.prog>=3?['bar1','bar2','turret','pylon']:['crack','rock1','rock2','rock1','rock2'])};p.alt^=1;p.qel.className='q '+(p.alt?'new':'new2');p.qel.innerHTML=p.q.q;p.btns.forEach((b,j)=>{b.className=p.alt?'in':'in2';b.disabled=false;b.lastChild.innerHTML=p.q.o[j]})}else{p.q=gen.next(p.i);p.tl=p.q.t;p.lc=99;SFX.q();p.state='ask';p.ob={t:pick(p.prog>=3?['bar1','bar2','turret','pylon']:['crack','rock1','rock2','rock1','rock2'])};p.alt^=1;p.qel.className='q '+(p.alt?'new':'new2');p.qel.innerHTML=p.q.q;p.btns.forEach((b,j)=>{b.className=p.alt?'in':'in2';b.disabled=false;b.lastChild.innerHTML=p.q.o[j]})}}
function hud(p){p.hpE.forEach((u,k)=>u.className=k<p.hp?'':'x');p.pipE.forEach((s,k)=>s.className=k<p.prog?'on':'')}
function toast(p,t){p.toast.textContent=t;p.toast.classList.add('on');clearTimeout(p.tt);p.tt=setTimeout(()=>p.toast.classList.remove('on'),1300)}
function resolve(p,j){const ok=j===p.q.ci;gen.answer(p.i,ok);p.oy0=oy(p);p.state='anim';p.at=0;p.ex=0;p.wh=0;p.tc=Math.max(.2,(py(p)-p.oy0)/900);p.T=p.tc+(ok?.5:.8);p.btns.forEach((b,k)=>{b.disabled=true;if(k===p.q.ci)b.classList.add('ok');else if(k===j)b.classList.add('no')});
 p.res=ok?'dodge':'hit';p.side=Math.random()<.5?-1:1;p.amp=p.ob?OBW[p.ob.t]/2+50:90;p.pan.classList.remove('good','bad','good2','bad2');p.pan.classList.add((ok?'good':'bad')+((p.pa^=1)?'':'2'));
 if(ok){p.ok++;p.prog++;p.streak++;p.boost=1;SFX.good(p.streak);if(p.prog>=5){p.won=true;toast(p,'Посадка на базе!');over=true;P.forEach(o=>{if(o!==p&&o.state=='ask')o.state='frozen'});setTimeout(()=>{confetti(p);SFX.win()},800);setTimeout(()=>end(p),2600)}else toast(p,p.streak>1?`Серия ×${p.streak}! Форсаж`:'Манёвр! Препятствие позади')}
 else{p.err++;p.streak=0;SFX.bad();toast(p,j<0?'Время вышло!':'Столкновение!')}hud(p)}
function answer(i,j){if(isSolo){if(i===1)return;const p=P[i];if(run&&p&&p.state=='ask')resolve(p,j)}else{const p=P[i];if(run&&p&&p.state=='ask')resolve(p,j)}}
function end(w){if(isSolo){run=false;const st=P.map((p,i)=>`<div class="st p${i+1}"><b>${i?'Компьютер':'Вы'}</b><span>Верно: ${p.ok}</span><span>Ошибок: ${p.err}</span><span>HP: ${p.hp} из 5</span></div>`).join('');
 $('#ov').hidden=false;$('#ov').innerHTML=`<div class="card"><h2>${w?`${w.i===0?'Вы победили!':'Победил компьютер'}`:'Ничья'}</h2><p>${w?'Он первым долетел до базы.':'Оба самолёта потеряны.'}</p><div class="sts">${st}</div><button id="again">Играть ещё раз</button><button class="alt" id="back">Сменить тему</button></div>`;
 $('#again').onclick=start;$('#back').onclick=exit}else{run=false;const st=P.map((p,i)=>`<div class="st p${i+1}"><b>Игрок ${i+1}</b><span>Верно: ${p.ok}</span><span>Ошибок: ${p.err}</span><span>HP: ${p.hp} из 5</span></div>`).join('');
 $('#ov').hidden=false;$('#ov').innerHTML=`<div class="card"><h2>${w?`Победил игрок ${w.i+1}!`:'Ничья'}</h2><p>${w?'Он первым долетел до базы.':'Оба самолёта потеряны.'}</p><div class="sts">${st}</div><button id="again">Играть ещё раз</button><button class="alt" id="back">Сменить тему</button></div>`;
 $('#again').onclick=start;$('#back').onclick=exit}}
$('#game').addEventListener('click',e=>{if(e.target.id=='menu')return exit();if(e.target.id=='snd'){mute=!mute;e.target.textContent=mute?'🔇':'🔊';return}const b=e.target.closest('button[data-i]');if(b)answer(+b.dataset.i,+b.dataset.j)});
addEventListener('keydown',e=>{if($('#game').hidden)return;KEYS.forEach((k,i)=>{const j=k.indexOf(e.key);if(j>-1){e.preventDefault();answer(i,j)}})});
let AC,mute=false;
function au(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(AC.state=='suspended')AC.resume();return AC}
function tone(f,d,type='sine',v=.15,t0=0,f2){const a=au();if(!a||mute)return;const t=a.currentTime+t0,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,v,f0,f1){const a=au();if(!a||mute)return;const t=a.currentTime,n=a.sampleRate*d|0,b=a.createBuffer(1,n,a.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+d);const g=a.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t)}
const SFX={count:n=>n?tone(520,.12,'square',.08):(tone(880,.35,'square',.09),tone(1320,.35,'triangle',.06)),q:()=>tone(700,.06,'sine',.04),tick:c=>tone(900+(5-c)*120,.07,'square',.06),
 good:s=>{tone(660,.12,'triangle',.14);tone(990,.2,'triangle',.14,.09);if(s>1)tone(1320,.25,'triangle',.12,.2)},whoosh:()=>noise(.45,.3,300,4000),bad:()=>tone(320,.35,'sawtooth',.12,0,90),
 boom:()=>{noise(.8,.55,1400,60);tone(110,.5,'sine',.4,0,35)},crash:()=>{noise(1.4,.5,900,40);tone(70,1,'sawtooth',.15,0,25)},win:()=>[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.25,'triangle',.14,i*.13))};
const OBW={crack:104,cave:104,rock1:72,rock2:72,bar1:104,bar2:104,turret:76,pylon:104};
const py=p=>H-70-p.dp*(H-70-BASE-60)/5;
function oy(p){if(!p.ob)return -99;if(p.state=='ask'||p.state=='frozen')return -30+(py(p)+20)*Math.pow(1-p.tl/p.q.t,1.5);
 if(p.res=='dodge')return p.oy0+900*p.at;return p.oy0+(py(p)-p.oy0)*Math.min(1,p.at/p.tc)}
function pose(p){const t=performance.now()/1000;let ox=Math.sin(t*1.7+p.i*2)*5,rot=Math.sin(t*1.3+p.i)*.03,sc=1,al=1;
 if(p.state=='anim'&&p.res=='dodge'){const ta=Math.max(.15,p.tc-.15),t=p.at,f=t<ta?Math.sin(t/ta*1.5708):t<p.tc+.2?1:Math.max(0,1-(t-p.tc-.2)/.3);ox+=p.side*p.amp*f;rot+=p.side*.4*f}
 if(p.state=='anim'&&p.res=='hit'&&p.at>p.tc)rot+=Math.sin(p.at*40)*.12;
 if(p.shake)ox+=Math.sin(t*70)*p.shake*14;
 if(p.state=='crashed'){rot=p.ct*4;sc=Math.max(.4,1-p.ct*.25);al=Math.max(0,1-p.ct/2.5)}
 if(p.dp>5)sc*=Math.max(.7,1-(p.dp-5)*.25);
 return{x:W/2+ox,y:py(p)+(p.won?0:Math.sin(t*2.2+p.i)*3),rot,sc,al}}
function fx(p,o){const l=o.l||.6;p.parts.push({vx:0,vy:0,g:0,r:3,c:'255,255,255',a:.4,top:0,...o,l,m:l})}
function boom(p){for(let i=0;i<40;i++){const a=Math.random()*6.28,s=40+Math.random()*200;fx(p,{x:W/2,y:py(p),vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:140,l:.6+Math.random()*.7,r:3+Math.random()*6,c:pick(['255,170,40','255,90,30','240,240,240','70,70,70','150,100,60']),a:.9,top:1})}}
function confetti(p){for(let i=0;i<90;i++)fx(p,{x:W/2+R(-30,30),y:py(p),vx:R(-170,170),vy:-R(120,340),g:260,l:1.6+Math.random()*1.2,r:4,sq:1,top:1,a:1,c:pick(['255,176,59','70,200,245','79,210,122','255,90,90','255,255,255'])})}
function upd(p,dt){if(isSolo){p.boost=Math.max(0,p.boost-dt*1.1);p.slow=Math.max(0,p.slow-dt);p.flash=Math.max(0,p.flash-dt*2.2);p.shake=Math.max(0,p.shake-dt);p.bt+=dt;
 p.spd=(p.state=='crashed'?30:170)*(1+p.boost*1.3)*(p.slow>0?.35:1);p.scroll+=dt*p.spd;p.dp+=((p.won?5.9:p.prog)-p.dp)*Math.min(1,dt*3);
 if(p.state=='ask'&&run){p.tl-=dt;const cc=Math.ceil(p.tl);if(p.tl<5&&cc!=p.lc){p.lc=cc;SFX.tick(cc)}if(p.tl<=0){p.tl=0;resolve(p,-1)}}
 else if(p.state=='anim'){p.at+=dt;if(p.res=='dodge'&&!p.wh&&p.at>=p.tc-.05){p.wh=1;SFX.whoosh()}
  if(p.res=='hit'&&!p.ex&&p.at>=p.tc){p.ex=1;p.ob=null;boom(p);SFX.boom();p.hp--;p.shake=.6;p.flash=1;p.slow=.8;p.bt=0;hud(p);p.hpE[p.hp].classList.add('brk');
   if(p.hp<=0){p.state='crashed';p.ct=0;SFX.crash();toast(p,'Самолёт потерян');if(!over){over=true;const survivor=P.find(o=>o!==p&&o.state!=='crashed');setTimeout(()=>end(survivor||null),2400)}}}
  if(p.state=='anim'&&p.at>=p.T){if(p.won)p.state='done';else if(over)p.state='frozen';else ask(p)}}
 const q=pose(p),v=p.spd;
 if(p.state!='crashed'&&p.state!='wait'){
  if(p.i)fx(p,{x:q.x+R(-3,3),y:q.y+52,vy:v*.8,l:.45,r:2.5,a:.25});else[-9,9].forEach(s=>fx(p,{x:q.x+s,y:q.y+46,vy:v*.9,l:.5+p.boost*.3,r:3,a:.35}));
  if(p.boost>.25||(p.state=='anim'&&p.res=='dodge'))[-30,30].forEach(s=>fx(p,{x:q.x+s,y:q.y+6,vy:v,l:.4,r:2,a:.5}));
  if(p.hp<=2)fx(p,{x:q.x+R(-8,8),y:q.y+R(-6,10),vx:R(-10,10),vy:v*.6,l:.9,r:7,c:p.hp<2?'255,120,30':'50,50,50',a:.55})}
 if(p.state=='crashed'){p.ct+=dt;if(Math.random()<.5)fx(p,{x:q.x+R(-12,12),y:q.y,vx:R(-15,15),vy:-R(20,50),l:1.3,r:8,c:'60,60,60',a:.6})}
 p.parts=p.parts.filter(o=>(o.l-=dt)>0);p.parts.forEach(o=>{o.vy+=o.g*dt;o.x+=o.vx*dt;o.y+=o.vy*dt});
 if(p.q&&p.state=='ask'){p.tb.style.transform=`scaleX(${p.tl/p.q.t})`;p.tbw.classList.toggle('lo',p.tl<5)}}else{p.boost=Math.max(0,p.boost-dt*1.1);p.slow=Math.max(0,p.slow-dt);p.flash=Math.max(0,p.flash-dt*2.2);p.shake=Math.max(0,p.shake-dt);p.bt+=dt;
 p.spd=(p.state=='crashed'?30:170)*(1+p.boost*1.3)*(p.slow>0?.35:1);p.scroll+=dt*p.spd;p.dp+=((p.won?5.9:p.prog)-p.dp)*Math.min(1,dt*3);
 if(p.state=='ask'&&run){p.tl-=dt;const cc=Math.ceil(p.tl);if(p.tl<5&&cc!=p.lc){p.lc=cc;SFX.tick(cc)}if(p.tl<=0){p.tl=0;resolve(p,-1)}}
 else if(p.state=='anim'){p.at+=dt;if(p.res=='dodge'&&!p.wh&&p.at>=p.tc-.05){p.wh=1;SFX.whoosh()}
  if(p.res=='hit'&&!p.ex&&p.at>=p.tc){p.ex=1;p.ob=null;boom(p);SFX.boom();p.hp--;p.shake=.6;p.flash=1;p.slow=.8;p.bt=0;hud(p);p.hpE[p.hp].classList.add('brk');
   if(p.hp<=0){p.state='crashed';p.ct=0;SFX.crash();toast(p,'Самолёт потерян');if(P.every(o=>o.state=='crashed')&&!over){over=true;setTimeout(()=>end(null),2400)}}}
  if(p.state=='anim'&&p.at>=p.T){if(p.won)p.state='done';else if(over)p.state='frozen';else ask(p)}}
 const q=pose(p),v=p.spd;
 if(p.state!='crashed'&&p.state!='wait'){
  if(p.i)fx(p,{x:q.x+R(-3,3),y:q.y+52,vy:v*.8,l:.45,r:2.5,a:.25});else[-9,9].forEach(s=>fx(p,{x:q.x+s,y:q.y+46,vy:v*.9,l:.5+p.boost*.3,r:3,a:.35}));
  if(p.boost>.25||(p.state=='anim'&&p.res=='dodge'))[-30,30].forEach(s=>fx(p,{x:q.x+s,y:q.y+6,vy:v,l:.4,r:2,a:.5}));
  if(p.hp<=2)fx(p,{x:q.x+R(-8,8),y:q.y+R(-6,10),vx:R(-10,10),vy:v*.6,l:.9,r:7,c:p.hp<2?'255,120,30':'50,50,50',a:.55})}
 if(p.state=='crashed'){p.ct+=dt;if(Math.random()<.5)fx(p,{x:q.x+R(-12,12),y:q.y,vx:R(-15,15),vy:-R(20,50),l:1.3,r:8,c:'60,60,60',a:.6})}
 p.parts=p.parts.filter(o=>(o.l-=dt)>0);p.parts.forEach(o=>{o.vy+=o.g*dt;o.x+=o.vx*dt;o.y+=o.vy*dt});
 if(p.q&&p.state=='ask'){p.tb.style.transform=`scaleX(${p.tl/p.q.t})`;p.tbw.classList.toggle('lo',p.tl<5)}}}
const hs=(a,b)=>{const x=Math.sin(a*12.9898+b*78.233)*43758.5453;return x-Math.floor(x)};
function resizeView(p){const rect=p.cv.getBoundingClientRect?.()||{width:W*K,height:H*K},w=Math.max(1,rect.width),h=Math.max(1,rect.height),dpr=Math.min(2,window.devicePixelRatio||1),bw=Math.round(w*dpr),bh=Math.round(h*dpr);if(p.cv.width!==bw||p.cv.height!==bh){p.cv.width=bw;p.cv.height=bh}const scale=bh/H;p.cx.setTransform(scale,0,0,scale,(bw-W*scale)/2,0);p.view={width:bw/scale,extra:(bw/scale-W)/2};}
function ground(c,p){const width=p.view.width,x=-p.view.extra,im=AI.bg1;c.fillStyle='#71b6ad';c.fillRect(x,0,width,H);if(im.naturalWidth){const th=width*im.height/im.width,off=p.scroll*.23,fr=((off%th)+th)%th,base=Math.floor(off/th);for(let k=-1;k<Math.ceil(H/th)+1;k++){const y=fr+k*th;c.save();if((k-base)&1){c.translate(0,y+th);c.scale(1,-1);c.drawImage(im,x,0,width,th+1)}else c.drawImage(im,x,y,width,th+1);c.restore()}}const shade=c.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#173d5420');shade.addColorStop(1,'#fff8de0a');c.fillStyle=shade;c.fillRect(x,0,width,H)}
function base(c){c.fillStyle='#163c4c99';c.fillRect(W/2-122,4,244,54);sprite(c,'base',W/2-58,5,116,52);c.fillStyle='#fff5d2';c.font='bold 12px Arial,sans-serif';c.textAlign='center';c.fillText('БАЗА',W/2-88,35);c.fillText('БАЗА',W/2+88,35)}
function obs(c,p,y){const t=p.ob.t,frame=FLIGHT_FRAMES[t];if(!AI.atlas.naturalWidth||!frame)return;const f=Math.max(0,Math.min(1,(y+80)/(py(p)+70))),w=OBW[t]*(.8+.3*f),h=frame[3]/frame[2]*w;
 c.save();c.translate(W/2,y);if(t[0]=='r')c.rotate(y*.012);c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=10;c.shadowOffsetY=12;sprite(c,t,-w/2,-h/2,w,h);c.restore();
 if(p.state=='ask'&&p.tl<6){const a=.5+.5*Math.sin(performance.now()/90),yy=y-h/2-18;c.globalAlpha=.4+a*.6;c.fillStyle='#ff3b3b';c.beginPath();c.moveTo(W/2,yy-12);c.lineTo(W/2+13,yy+10);c.lineTo(W/2-13,yy+10);c.fill();c.fillStyle='#fff';c.font='bold 14px sans-serif';c.textAlign='center';c.fillText('!',W/2,yy+8);c.globalAlpha=1}}
function parts(c,p,top){p.parts.forEach(o=>{if(!!o.top!=!!top)return;const k=o.l/o.m;c.fillStyle=`rgba(${o.c},${o.a*k})`;if(o.sq)c.fillRect(o.x,o.y,o.r*1.6,o.r);else{c.beginPath();c.arc(o.x,o.y,o.r*(top?1:.4+.6*k),0,6.3);c.fill()}})}
function plane(c,p,q,al){const key=p.i?'heli':'jet',frame=FLIGHT_FRAMES[key],h=100;if(!AI.atlas.naturalWidth)return;const w=frame[2]/frame[3]*h;c.save();c.globalAlpha=al;c.translate(q.x,q.y);c.rotate(q.rot);c.scale(q.sc,q.sc);
 if(!p.i&&al>.5){const L=14+p.boost*24+Math.random()*6;[-9,9].forEach(s=>{c.fillStyle='rgba(255,150,40,.85)';c.beginPath();c.ellipse(s,46+L/2,4,L/2,0,0,6.3);c.fill();c.fillStyle='rgba(255,255,220,.9)';c.beginPath();c.ellipse(s,46+L/4,2,L/4,0,0,6.3);c.fill()})}
 if(al>.5){c.shadowColor='rgba(0,0,0,.4)';c.shadowBlur=10;c.shadowOffsetY=12}sprite(c,key,-w/2,-h/2,w,h);c.restore()}
function draw(p){resizeView(p);const c=p.cx,q=pose(p);c.save();c.clearRect(-p.view.extra,0,p.view.width,H);if(p.shake)c.translate(R(-1,1)*p.shake*14,R(-1,1)*p.shake*14);
 c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';ground(c,p);base(c);if(p.ob){const y=oy(p);if(y>-90)obs(c,p,y)}
 c.imageSmoothingEnabled=true;parts(c,p,0);
 if(p.state=='anim'&&p.res=='dodge'){p.hist.push(q);if(p.hist.length>6)p.hist.shift();p.hist.forEach((g,k)=>plane(c,p,g,.07*(k+1)))}else p.hist.length=0;
 plane(c,p,q,q.al);parts(c,p,1);c.imageSmoothingEnabled=true;
 if(p.bt<.8&&AI.atlas.naturalWidth){const size=(.6+Math.min(1,p.bt/.25))*105;c.globalAlpha=1-Math.max(0,(p.bt-.25)/.55);sprite(c,'boom',q.x-size/2,q.y-size/2,size,size);c.globalAlpha=1}
 if(p.boost>.1){c.strokeStyle=`rgba(255,255,255,${p.boost*.5})`;c.lineWidth=2;for(let i=0;i<16;i++){const x=-p.view.extra+hs(i,3)*p.view.width,y=((p.scroll*2.2+i*97)%(H+120))-60;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+40+p.boost*90);c.stroke()}}
 c.globalAlpha=.22;for(let j=0;j<3;j++){const v=p.scroll*1.7+j*190,cy=v%(H+120)-60,cx=-p.view.extra+hs(j,Math.floor(v/(H+120)))*p.view.width;sprite(c,'cloud',cx-65,cy-30,130,70)}c.globalAlpha=1;
 if(p.state=='ask'&&p.tl<6){const a=.5+.5*Math.sin(performance.now()/90),g=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.75);g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(1,`rgba(255,0,0,${.1+a*.25})`);c.fillStyle=g;c.fillRect(0,0,W,H)}
 if(p.flash>0){c.fillStyle=`rgba(255,40,40,${p.flash*.4})`;c.fillRect(0,0,W,H)}
 c.restore()}
function loop(ts){if(isSolo){const dt=Math.min(.05,(ts-last)/1000);last=ts;if(run&&!over&&gen?.solo)gen.solo.tick(dt,P[1]?.state==='ask',ok=>resolve(P[1],ok?P[1].q.ci:(P[1].q.ci+1)%4));P.forEach(p=>{upd(p,dt);draw(p)});raf=requestAnimationFrame(loop)}else{const dt=Math.min(.05,(ts-last)/1000);last=ts;P.forEach(p=>{upd(p,dt);draw(p)});raf=requestAnimationFrame(loop)}}
return{AS,open(g,t){sel.g=String(g);sel.t=t;start()}}
})(document.getElementById('rootA'),context.topics,{exit:onExit});engine.open(context.grade,context.topicIndex);};
