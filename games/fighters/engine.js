const isSolo=Arena.mode==='solo';
window.configureArena=(generator,label,onExit,context)=>{const R=Arena.randomInt,pick=Arena.pick;
const engine=(function(ROOT,TOP,hooks){
const $=s=>ROOT.querySelector(s),$$=s=>ROOT.querySelectorAll(s);
const AS={"f0": "../../assets/images/c617630c9e0e5ae6036a.webp", "hp0": "../../assets/images/475b13e0bcd1b60295d2.webp", "f1": "../../assets/images/1cc054875160109e5e0a.webp", "hp1": "../../assets/images/b2ad76ad00741d867da5.webp", "f2": "../../assets/images/cfab3a84f3bfe8dd559a.webp", "hp2": "../../assets/images/80767fe9c1a26fe4f5c0.webp", "f3": "../../assets/images/aa939f767c3df3c8800d.webp", "hp3": "../../assets/images/54c3f86902c6610a6887.webp", "f4": "../../assets/images/56b87c6151e9b92100b0.webp", "hp4": "../../assets/images/73a58a01caaf7527f39c.webp", "f5": "../../assets/images/32c7b6097abd7e234b99.webp", "hp5": "../../assets/images/524769a59592b7ab1a8a.webp", "ic0": "../../assets/images/3d053cf6fefa4b8ad43b.webp", "ic1": "../../assets/images/c497800d7b62282cfb79.webp", "ic2": "../../assets/images/1c4aa9e077e8965d601a.webp", "ic4": "../../assets/images/4890be07a42bef7f7a2b.webp", "ic5": "../../assets/images/16f6e7538bf131a6086b.webp", "ic6": "../../assets/images/6a80b84d1f7e9dd14eeb.webp", "medal": "../../assets/images/0ebb710f33b454062644.webp", "spR": "../../assets/images/9fc859540980b8efb0e7.webp", "spW": "../../assets/images/ef416a41c51a171a6f12.webp", "bg": "../../assets/images/1f5950d75f69b33c7f1a.jpg"},AI={};
for(const k in AS){AI[k]=new Image();AI[k].src=AS[k]}
let AC,mute=false;
function au(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(AC.state=='suspended')AC.resume();return AC}
function tone(f,d,type='sine',v=.15,t0=0,f2){const a=au();if(!a||mute)return;const t=a.currentTime+t0,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,v,f0,f1){const a=au();if(!a||mute)return;const t=a.currentTime,n=a.sampleRate*d|0,b=a.createBuffer(1,n,a.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+d);const g=a.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t)}
const SFX={count:n=>n?tone(520,.12,'square',.08):(tone(880,.35,'square',.09),tone(1320,.35,'triangle',.06)),q:()=>tone(700,.06,'sine',.04),tick:c=>tone(900+(5-c)*120,.07,'square',.06),
 good:s=>{tone(660,.12,'triangle',.14);tone(990,.2,'triangle',.14,.09);if(s>1)tone(1320,.25,'triangle',.12,.2)},whoosh:()=>noise(.45,.3,300,4000),bad:()=>tone(320,.35,'sawtooth',.12,0,90),
 boom:()=>{noise(.8,.55,1400,60);tone(110,.5,'sine',.4,0,35)},crash:()=>{noise(1.4,.5,900,40);tone(70,1,'sawtooth',.15,0,25)},win:()=>[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.25,'triangle',.14,i*.13))};
Object.assign(SFX,{punch:()=>{noise(.15,.5,900,100);tone(160,.12,'sine',.4,0,50)},kick:()=>{noise(.25,.45,2500,200);tone(120,.2,'sine',.35,0,40)},
 fire:()=>{tone(300,.3,'sawtooth',.09,0,900);setTimeout(()=>{noise(.6,.5,1600,80);tone(100,.4,'sine',.4,0,40)},300)},
 ground:()=>{noise(1,.6,500,40);tone(60,.8,'sine',.5,0,30)},charge:()=>tone(200,.9,'sawtooth',.1,0,1400),
 super:()=>{noise(1.3,.7,1800,50);tone(90,.9,'sine',.5,0,30);tone(1568,.5,'triangle',.1,.05)},ko:()=>tone(420,.9,'sawtooth',.12,0,60),
 star:()=>noise(.25,.3,5000,900),miss:()=>{noise(.25,.2,1500,300);tone(250,.25,'triangle',.08,0,120)}});
const W=960,H=540,FY=478,FH=300,KEYS=[['1','2','3','4'],['7','8','9','0']];
const M=(n,k,c,i,r)=>({n,k,c,i,r});
const MOVES=[
 [M('Сэйкен!',0,'#ffb03b','ic0','255,170,60'),M('Вихревой кик!',6,'#ffe066','ic2','255,230,120'),M('Хадо-шар!',2,'#4cc9f0','ic1','90,200,255'),M('Огненный подъём!',5,'#ff7a3d','ic5','255,110,40'),M('МЕТЕОРНЫЙ ШТОРМ!',4,'#d08cff','ic6','200,130,255')],
 [M('Джеб!',0,'#6ea8ff','ic0','120,170,255'),M('Лоу-кик!',1,'#ffe066','ic2','255,230,120'),M('Град хуков!',7,'#ff6b6b','ic0','255,100,100'),M('Ракета с неба!',8,'#4cc9f0','ic2','90,200,255'),M('СИНЯЯ МОЛНИЯ!',4,'#7aa8ff','ic4','110,150,255')],
 [M('Левый хук!',0,'#ff5a5a','ic0','255,90,90'),M('Апперкот!',5,'#ffb03b','ic0','255,180,60'),M('Таран!',9,'#d0d0d0','ic5','230,230,230'),M('Сокрушитель!',3,'#ff8a3d','ic5','255,140,60'),M('НОКАУТ!',4,'#ff3b3b','ic6','255,60,60')],
 [M('Быстрый выпад!',0,'#b48cff','ic2','180,140,255'),M('Сюрикэны!',11,'#9be564','ic1','150,230,100'),M('Теневой вихрь!',6,'#c77dff','ic4','200,120,255'),M('Прыжок тени!',8,'#8a7cff','ic2','140,120,255'),M('ТЕНЕВОЙ КЛОН!',4,'#a45cff','ic4','160,90,255')],
 [M('Ладонь ци!',10,'#5ad1b5','ic1','90,220,180'),M('Тысяча ног!',7,'#ffe066','ic2','255,230,120'),M('Шар ци!',2,'#4cc9f0','ic1','90,200,255'),M('Небесный кик!',8,'#7fffd4','ic2','120,255,210'),M('ДРАКОН ВЕТРА!',4,'#5ad1b5','ic4','90,220,180')],
 [M('Удар локтем!',0,'#ffcf3b','ic0','255,210,60'),M('Таран!',9,'#d0d0d0','ic5','230,230,230'),M('Бросок!',5,'#ff8a3d','ic5','255,140,60'),M('Сокрушающий пресс!',3,'#ff5a3d','ic5','255,90,60'),M('СУПЕРПРЫЖОК!',4,'#ffd23f','ic6','255,210,60')]];
const KD=[[.55,.18,50,0],[.7,.3,80,0],[.95,.55,100,0],[1.1,.6,90,70],[1.6,.9,240,150],[.85,.3,70,130],[.9,.4,110,0],[.95,.55,60,0],[.95,.45,100,40],[.9,.4,130,0],[.85,.35,120,0],[.9,.5,70,0]];
const ATK=KD.map(([dur,ti,kb,lift])=>({dur,ti,kb,lift})),KS=['punch','kick','fire','ground','super','punch','kick','punch','kick','ground','fire','kick'];
let sel={g:null,t:null,f:[0,3]},P=[],run=false,over=false,last=0,raf=0,tok=0,gen,T=0,shake=0,slow=0,flash=0,cx,FX=[],PT=[],POP=[];
$('#pf0').src=AS.f0;
$('#pf1').src=AS.f3;
$('#gr').innerHTML=Object.keys(TOP).map(g=>`<button class="opt" data-g="${g}">${g} класс</button>`).join('');
$('#gr').onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;sel.g=b.dataset.g;sel.t=null;$$('#gr .opt').forEach(x=>x.classList.toggle('sel',x===b));
 $('#tw').hidden=false;$('#go').disabled=true;$('#tp').innerHTML=TOP[sel.g].map((t,i)=>`<button class="opt" data-t="${i}">${t[0]}</button>`).join('')};
$('#tp').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;sel.t=+b.dataset.t;$$('#tp .opt').forEach(x=>x.classList.toggle('sel',x===b));$('#go').disabled=false};
function fpick(){if(isSolo){$('#fp').innerHTML=[0,1].map(i=>`<div class="fp p${i+1}"><b>${i?'Компьютер':'Вы'}</b>${[0,1,2,3,4,5].map(k=>`<button class="fb p${i+1}${sel.f[i]==k?' sel':''}" data-p="${i}" data-k="${k}"><img src="${AS['f'+k]}" alt=""></button>`).join('')}<span class="mvl">${MOVES[sel.f[i]].map(m=>m.n.replace('!','')).join(' → ')}</span></div>`).join('')}else{$('#fp').innerHTML=[0,1].map(i=>`<div class="fp p${i+1}"><b>Игрок ${i+1}</b>${[0,1,2,3,4,5].map(k=>`<button class="fb p${i+1}${sel.f[i]==k?' sel':''}" data-p="${i}" data-k="${k}"><img src="${AS['f'+k]}" alt=""></button>`).join('')}<span class="mvl">${MOVES[sel.f[i]].map(m=>m.n.replace('!','')).join(' → ')}</span></div>`).join('')}}
fpick();
$('#fp').onclick=e=>{const b=e.target.closest('[data-p]');if(!b)return;sel.f[+b.dataset.p]=+b.dataset.k;fpick();$('#pf'+b.dataset.p).src=AS['f'+b.dataset.k]};
$('#go').onclick=start;
$('#fback').onclick=()=>hooks.exit();
const hudP = (isSolo?(i=>`<div class="pl p${i+1}"><div><b>${i?'Компьютер':'Вы'}</b><div class="cb">${MOVES[sel.f[i]].map(m=>`<img src="${AS[m.i]}" title="${m.n}" alt="">`).join('')}</div></div><img class="hpb" src="${AS.hp5}" alt=""></div>`):(i=>`<div class="pl p${i+1}"><div><b>Игрок ${i+1}</b><div class="cb">${MOVES[sel.f[i]].map(m=>`<img src="${AS[m.i]}" title="${m.n}" alt="">`).join('')}</div></div><img class="hpb" src="${AS.hp5}" alt=""></div>`));
function mount(){$('#game').innerHTML=`<div class="hud">${hudP(0)}<div class="mid">${sel.g} класс · ${TOP[sel.g][sel.t][3] || 'год'}${TOP[sel.g][sel.t][3]?' четв.':''}<br><button id="snd">${mute?'🔇':'🔊'}</button> <button id="menu">Выйти</button></div>${hudP(1)}</div>
<div class="stage"><canvas width="${W}" height="${H}"></canvas></div>
<div class="panels">${[0,1].map(i=>`<section class="panel p${i+1}"><div class="q">Приготовьтесь…</div><div class="tb"><i></i></div><div class="ans">${[0,1,2,3].map(j=>`<button data-i="${i}" data-j="${j}" disabled><em>${KEYS[i][j]}</em><span></span></button>`).join('')}</div></section>`).join('')}</div>`}
function tint(im,col){if(!im.width)return im;const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c}
function mkP(i){const pn=$$('.panel')[i],im=AI['f'+sel.f[i]];
 return{i,fi:sel.f[i],hist:[],cf:0,hp:5,ok:0,err:0,streak:0,state:'wait',face:i?-1:1,x:i?W*.73:W*.27,a:null,m:-1,hurt:-1,kbm:0,lift:0,ko:false,won:false,alt:0,pa:0,q:null,tl:0,im,white:tint(im,'#fff'),aura:tint(im,'#b06cff'),pan:pn,
 qel:pn.querySelector('.q'),tbw:pn.querySelector('.tb'),tb:pn.querySelector('.tb i'),btns:[...pn.querySelectorAll('.ans button')],hpI:$$('.hpb')[i],cbI:[...$$('.cb')[i].children]}}
function start(){if(isSolo){gen=Arena.nativeSession(generator);au();mount();cancelAnimationFrame(raf);over=false;run=false;FX=[];PT=[];POP=[];shake=slow=flash=hs=0;zm=zt=1;zf={x:W/2,y:FY-150};cx=$('.stage canvas').getContext('2d');P=[0,1].map(mkP);
 $('#setup').hidden=true;$('#game').hidden=false;const my=++tok;
 (function cd(n){if(my!=tok)return;if(n<0){$('#ov').hidden=true;run=true;P.forEach(ask);return}$('#ov').hidden=false;$('#ov').innerHTML=`<div class="big">${n||'БОЙ!'}</div>`;SFX.count(n);setTimeout(()=>cd(n-1),n?800:600)})(3);
 last=performance.now();raf=requestAnimationFrame(loop)}else{gen=Arena.nativeSession(generator);au();mount();cancelAnimationFrame(raf);over=false;run=false;FX=[];PT=[];POP=[];shake=slow=flash=hs=0;zm=zt=1;zf={x:W/2,y:FY-150};cx=$('.stage canvas').getContext('2d');P=[0,1].map(mkP);
 $('#setup').hidden=true;$('#game').hidden=false;const my=++tok;
 (function cd(n){if(my!=tok)return;if(n<0){$('#ov').hidden=true;run=true;P.forEach(ask);return}$('#ov').hidden=false;$('#ov').innerHTML=`<div class="big">${n||'БОЙ!'}</div>`;SFX.count(n);setTimeout(()=>cd(n-1),n?800:600)})(3);
 last=performance.now();raf=requestAnimationFrame(loop)}}
function exit(){tok++;run=false;cancelAnimationFrame(raf);$('#game').hidden=true;$('#ov').hidden=true;hooks.exit()}
function ask(p){if(isSolo){p.q=gen.next(p.i);if(p.i===0)Arena.renderCoach(ROOT,'.panels',p.q,gen.solo);p.tl=p.q.t;p.lc=99;p.state='ask';p.alt^=1;p.qel.className='q '+(p.alt?'new':'new2');p.qel.innerHTML=p.q.q;p.btns.forEach((b,j)=>{b.className=p.alt?'in':'in2';b.disabled=false;b.lastChild.innerHTML=p.q.o[j]});SFX.q()}else{p.q=gen.next(p.i);p.tl=p.q.t;p.lc=99;p.state='ask';p.alt^=1;p.qel.className='q '+(p.alt?'new':'new2');p.qel.innerHTML=p.q.q;p.btns.forEach((b,j)=>{b.className=p.alt?'in':'in2';b.disabled=false;b.lastChild.innerHTML=p.q.o[j]});SFX.q()}}
function hud(p){p.hpI.src=AS['hp'+Math.max(0,p.hp)];p.cbI.forEach((im,k)=>im.classList.toggle('on',p.streak>k))}
function pop(x,y,text,col,ic){POP.push({x,y,text,col,ic,t:0})}
function resolve(p,j){const ok=j===p.q.ci,o=P[1-p.i];gen.answer(p.i,ok);p.state='anim';p.btns.forEach((b,k)=>{b.disabled=true;if(k===p.q.ci)b.classList.add('ok');else if(k===j)b.classList.add('no')});
 p.pan.classList.remove('good','bad','good2','bad2');p.pan.classList.add((ok?'good':'bad')+((p.pa^=1)?'':'2'));
 if(ok){p.ok++;p.streak++;const m=o.hp==1?4:Math.min(p.streak,5)-1,mv=MOVES[sel.f[p.i]][m];p.a={m,mv,fi:p.fi,type:mv.k,t:0,hit:0,fb:0,ev:0};SFX.good(p.streak);if(mv.k==4)SFX.charge();if(p.streak>1)pop(p.x,FY-FH-78,'Серия ×'+p.streak,'#ffffff')}
 else{p.err++;p.streak=0;p.m=0;SFX.miss();pop(p.x,FY-FH-10,j<0?'Время вышло!':'Промах!','#9aa8b8')}hud(p)}
function answer(i,j){if(isSolo){if(i===1)return;const p=P[i];if(run&&p&&p.state=='ask')resolve(p,j)}else{const p=P[i];if(run&&p&&p.state=='ask')resolve(p,j)}}
function fin(p){if(over){p.state=p.ko?'ko':p.won?'win':'frozen';if(p.won&&!p.cf){p.cf=1;for(let i=0;i<70;i++)part({x:p.x+R(-40,40),y:FY-200,vx:R(-200,200),vy:-R(150,420),g:500,l:1.6+Math.random(),r:7,c:pick(['255,176,59','70,200,245','79,210,122','255,90,90','255,255,255']),rock:1})}}else ask(p)}
function end(w){if(isSolo){run=false;const st=P.map((p,i)=>`<div class="st p${i+1}"><b>${i?'Компьютер':'Вы'}</b><span>Верно: ${p.ok}</span><span>Ошибок: ${p.err}</span><span>Осталось сердец: ${Math.max(0,p.hp)}</span></div>`).join('');
 $('#ov').hidden=false;$('#ov').innerHTML=`<div class="card"><img class="md" src="${AS.medal}" alt=""><h2>${w.i===0?'Вы победили!':'Победил компьютер'}</h2><p>Он первым нанёс 5 ударов.</p><div class="sts">${st}</div><button id="again">Реванш</button><button class="alt" id="back">Сменить тему</button></div>`;
 $('#again').onclick=start;$('#back').onclick=exit}else{run=false;const st=P.map((p,i)=>`<div class="st p${i+1}"><b>Игрок ${i+1}</b><span>Верно: ${p.ok}</span><span>Ошибок: ${p.err}</span><span>Осталось сердец: ${Math.max(0,p.hp)}</span></div>`).join('');
 $('#ov').hidden=false;$('#ov').innerHTML=`<div class="card"><img class="md" src="${AS.medal}" alt=""><h2>Победил игрок ${w.i+1}!</h2><p>Он первым нанёс 5 ударов.</p><div class="sts">${st}</div><button id="again">Реванш</button><button class="alt" id="back">Сменить тему</button></div>`;
 $('#again').onclick=start;$('#back').onclick=exit}}
$('#game').addEventListener('click',e=>{if(e.target.id=='menu')return exit();if(e.target.id=='snd'){mute=!mute;e.target.textContent=mute?'🔇':'🔊';return}const b=e.target.closest('button[data-i]');if(b)answer(+b.dataset.i,+b.dataset.j)});
addEventListener('keydown',e=>{if($('#game').hidden)return;KEYS.forEach((k,i)=>{const j=k.indexOf(e.key);if(j>-1){e.preventDefault();answer(i,j)}})});
const ez=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3),sm=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x)};
let hs=0,zm=1,zt=1,zf={x:W/2,y:FY-150};
function part(o){const l=o.l||.6;PT.push({vx:0,vy:0,g:0,r:4,c:'255,255,255',...o,l,m:l})}
function dust(x,n,k=1){for(let i=0;i<n;i++)part({x:x+R(-30,30),y:FY+R(-4,6),vx:R(-90,90)*k,vy:-R(20,110),g:60,l:.5+Math.random()*.4,r:6+Math.random()*8,c:'210,195,170'})}
function spark(x,y,col,n,sp=300){for(let i=0;i<n;i++){const an=Math.random()*6.28,s=100+Math.random()*sp;part({x,y,vx:Math.cos(an)*s,vy:Math.sin(an)*s,g:400,l:.4+Math.random()*.4,c:col,r:3+Math.random()*3})}}
function impact(a,v,k){if(over)return;const S=ATK[k],mv=a.a.mv,x=v.x+v.face*35,y=FY-170;v.hp--;v.hurt=0;v.kbm=S.kb;v.lift=S.lift;v.ko=v.hp<=0;hud(v);SFX[KS[k]]();
 shake=[.3,.4,.5,.7,1,.45,.5,.4,.55,.6,.5,.35][k];hs=.04+S.kb/2600;zm=1.05+S.kb/2400;zf={x:v.x,y:FY-160};
 FX.push({k:'img',im:AI[[1,2,6,8,10,11].includes(k)?'spW':'spR'],x,y,t:0,d:.45,s:k==4?1.8:1.2,rot:Math.random()*.6});spark(x,y,mv.r,16);
 if(k==2||k==10)FX.push({k:'ring',x,y,t:0,d:.5,R:k==10?150:110,col:mv.r});
 if(k==8||k==9||k==3)dust(v.x,14,1.6);
 if(k==8)FX.push({k:'ring',x:v.x,y:FY-8,t:0,d:.5,R:170,col:mv.r});
 if(k==3||k==5)FX.push({k:'col',x:v.x,t:0,d:k==3?.6:.4,col:mv.r});
 if(k==3)for(let i=0;i<18;i++)part({x:v.x+R(-50,50),y:FY,vx:R(-140,140),vy:-R(280,600),g:1000,l:1,r:6+Math.random()*8,c:pick(['120,80,50','160,110,70','90,60,40']),rock:1});
 if(k==5)spark(v.x,FY-60,mv.r,14,200);
 if(k==7)for(let i=1;i<4;i++)FX.push({k:'img',im:AI.spR,x:x+R(-30,30),y:y+R(-60,60),t:-i*.07,d:.3,s:.9,rot:Math.random()*2});
 if(k==4){for(let i=0;i<3;i++)FX.push({k:'ring',x:v.x,y:FY-150,t:-i*.12,d:.7,R:170+i*50,col:mv.r});flash=1;slow=.7;
  if(a.fi==3)[-1,0,1].forEach(j=>FX.push({k:'clone',p:a,x:v.x+j*95,t:0,d:.6}));if(a.fi==5||a.fi==2){dust(v.x,24,2.4);shake=1.2}}
 pop(a.x,FY-FH-30,mv.n,mv.c,mv.i);
 if(v.ko){over=true;v.state='ko';a.won=true;SFX.ko();slow=1;P.forEach(o=>{if(o!==v&&o.state=='ask')o.state='frozen'});setTimeout(()=>end(a),2800)}}
function upd(rdt){let dt=rdt;if(slow>0){slow-=rdt;dt*=.35}if(hs>0){hs-=rdt;dt*=.03}T+=dt;shake=Math.max(0,shake-rdt*2);flash=Math.max(0,flash-rdt*2);
 const ch=P.find(p=>p.a&&p.a.type==4&&!p.a.hit);if(ch)zf={x:ch.x,y:FY-150};zt=ch?1.12:1;zm+=(zt-zm)*Math.min(1,rdt*7);
 P.forEach(p=>{const o=P[1-p.i];
  if(p.state=='ask'&&run){p.tl-=rdt;const cc=Math.ceil(p.tl);if(p.tl<5&&cc!=p.lc){p.lc=cc;SFX.tick(cc)}if(p.tl<=0){p.tl=0;resolve(p,-1)}p.tb.style.transform=`scaleX(${p.tl/p.q.t})`;p.tbw.classList.toggle('lo',p.tl<5)}
  if(p.a){const a=p.a,S=ATK[a.type],k=a.type;a.t+=dt;
   if(!a.ds&&[0,1,5,6,9].includes(k)&&a.t>.05){a.ds=1;dust(p.x,7)}
   if((k==2||k==10)&&!a.fb&&a.t>=.25){a.fb=1;FX.push({k:'ball',x:p.x+p.face*70,x1:o.x+o.face*20,y:FY-170,t:0,d:S.ti-.25,col:a.mv.r,big:k==10})}
   if(k==11&&!a.fb&&a.t>=.25){a.fb=1;[-1,0,1].forEach(j=>FX.push({k:'star',x:p.x+p.face*70,x1:o.x+o.face*25,y:FY-170+j*42,t:0,d:S.ti-.25,col:a.mv.r}));SFX.star()}
   if(k==7)[.14,.26,.38].forEach((tt,i)=>{if(a.ev<=i&&a.t>=tt){a.ev=i+1;FX.push({k:'img',im:AI.spR,x:o.x+o.face*35+R(-20,20),y:FY-170+R(-50,50),t:0,d:.25,s:.7,rot:Math.random()*3});SFX.punch();shake=Math.max(shake,.22)}});
   if(!a.hit&&a.t>=S.ti){a.hit=1;impact(p,o,k)}
   if(a.t>=S.dur){p.a=null;fin(p)}}
  if(p.m>=0){p.m+=dt;if(p.m>=.8){p.m=-1;fin(p)}}
  if(p.hurt>=0&&(!p.ko||p.hurt<2))p.hurt+=dt});
 FX.forEach(f=>f.t+=dt);FX=FX.filter(f=>f.t<f.d);POP.forEach(q=>q.t+=rdt);POP=POP.filter(q=>q.t<1.2);
 PT=PT.filter(o=>(o.l-=dt)>0);PT.forEach(o=>{o.vy+=o.g*dt;o.x+=o.vx*dt;o.y+=o.vy*dt})}
function pose(p){const o=P[1-p.i],b=Math.sin(T*4+p.i*1.7),D=Math.abs(o.x-p.x)-135,g=p.state=='ask'?1:.5;
 let dx=Math.sin(T*2+p.i)*3*g,dy=-(3+2*g)*b,rf=0,rh=0,sx=1,sy=1+b*.014*(1+g),fl=0,au=0;
 if(p.a){const a=p.a,S=ATK[a.type],u=a.t,k=a.type,ti=S.ti,wu=Math.min(.12,ti*.35),
  lg=u<wu?-.12*(u/wu):u<ti?ez((u-wu)/(ti-wu)):Math.max(0,1-sm((u-ti)/(S.dur-ti)));
  if(k==0){dx+=D*lg;rf=.16*lg;sx*=1+.06*Math.max(0,lg)}
  else if(k==1){dx+=D*.92*lg;rf=-.3*lg;dy-=35*Math.sin(Math.PI*Math.min(1,u/S.dur*1.5))}
  else if(k==2||k==11){const m=u<.25?u/.25:Math.max(0,1-(u-.25)/.7);dx-=30*m;sx*=1+.04*m;rf=u>.25&&u<.6?.12:-.08*m}
  else if(k==10){dx+=D*.7*lg;rf=.1*lg}
  else if(k==3){dx+=D*.55*lg;dy-=u<ti?190*Math.sin(Math.PI*u/ti):0;rf=.1*lg;if(u>=ti&&u<ti+.15)sy*=.85}
  else if(k==4){au=Math.min(1,u/.5);dx+=D*.7*(u<ti?Math.max(0,(u-.5)/(ti-.5)):lg);dy-=8*Math.abs(Math.sin(u*30))*au;rf=.1*au;if(u<.5){sy*=1-.05*au;dx-=14*au}}
  else if(k==5){dx+=D*.8*lg;dy-=u>ti?150*Math.sin(Math.PI*Math.min(1,(u-ti)/.45)):0;rf=u>ti?-.25:.12*lg}
  else if(k==6){const pr=Math.min(1,u/ti);dx+=D*.9*lg;sx*=Math.cos(pr*Math.PI*4);rf=-.2*lg;dy-=25*Math.sin(Math.PI*pr)}
  else if(k==7){dx+=D*.85*lg+(u>.1&&u<ti+.1?12*Math.sin(u*70):0);rf=.12*lg*(1+Math.sin(u*50)*.5)}
  else if(k==8){const pr=Math.min(1,u/ti);dx+=D*.95*sm(pr);dy-=u<ti?240*Math.sin(Math.PI*pr):0;rf=u<ti?.6*Math.sin(Math.PI*pr)+.2:.2*lg}
  else if(k==9){dx+=D*lg;sy*=1-.17*Math.max(0,lg);sx*=1+.1*Math.max(0,lg);rf=.35*lg}}
 if(p.m>=0){const u=p.m/.8,s=Math.sin(Math.PI*Math.min(1,u*1.2));dx+=D*.35*s;rf=.25*s+Math.sin(u*25)*.05*u}
 if(p.hurt>=0){const u=p.hurt,e=Math.min(1,u/.5),d=-p.face;
  if(p.ko){dx+=d*(p.kbm*e+30);dy+=-Math.sin(Math.PI*e)*(p.lift+60)+10*e;rh=-p.face*1.5*e}
  else if(e<1){const s=Math.sin(Math.PI*e);dx+=d*p.kbm*s;dy-=p.lift*s;rh=-p.face*.22*s;sx*=1-.1*s;sy*=1+.06*s}
  fl=Math.max(0,1-u/.16)}
 if(p.state=='win'||(p.won&&!p.a))dy-=Math.abs(Math.sin(T*6))*28;
 return{dx,dy,rot:rf*p.face+rh,sx,sy,fl,au}}
function drawF(c,p){const s=pose(p),h=FH,w=p.im.width/p.im.height*h,air=Math.min(1,Math.max(0,-s.dy/300));
 c.fillStyle=`rgba(0,0,0,${.4*(1-air*.6)})`;c.beginPath();c.ellipse(p.x+s.dx+(p.ko?-p.face*(p.hurt>0?60:0):0),FY+4,(p.ko?130:88)*(1-air*.4),14*(1-air*.3),0,0,6.3);c.fill();
 const mvg=p.a&&p.a.t<ATK[p.a.type].ti+.1&&![2,10,11].includes(p.a.type);if(mvg){p.hist.push(s);if(p.hist.length>5)p.hist.shift()}else if(p.hist.length)p.hist.shift();
 p.hist.forEach((g,k)=>{c.save();c.globalAlpha=.07*(k+1);c.translate(p.x+g.dx,FY+g.dy);c.rotate(g.rot);c.scale(p.face*g.sx,g.sy);c.drawImage(p.aura,-w/2,-h,w,h);c.restore()});
 c.save();c.translate(p.x+s.dx,FY+s.dy);c.rotate(s.rot);c.scale(p.face*s.sx,s.sy);
 if(s.au>0){c.globalAlpha=s.au*(.55+.3*Math.sin(T*22));c.drawImage(p.aura,-w*.57,-h*1.06,w*1.14,h*1.1);c.globalAlpha=1}
 c.drawImage(p.im,-w/2,-h,w,h);if(s.fl>0){c.globalAlpha=s.fl*.85;c.drawImage(p.white,-w/2,-h,w,h)}c.restore();
 if(p.m>=0){c.fillStyle='#ffe066';c.font='26px sans-serif';c.textAlign='center';for(let k=0;k<3;k++){const an=T*6+k*2.1;c.fillText('★',p.x+Math.cos(an)*34,FY-h-8+Math.sin(an)*9)}}}
function draw(){const c=cx,cv=$('.stage canvas'),r=cv.getBoundingClientRect(),vw=Math.max(1,Math.round(H*r.width/Math.max(1,r.height)));if(cv.width!==vw||cv.height!==H){cv.width=vw;cv.height=H}c.save();c.clearRect(0,0,vw,H);if(AI.bg.naturalWidth){const im=AI.bg,k=Math.max(vw/im.naturalWidth,H/im.naturalHeight);c.drawImage(im,(vw-im.naturalWidth*k)/2,(H-im.naturalHeight*k)/2,im.naturalWidth*k,im.naturalHeight*k)}const viewScale=Math.min(1,vw/W);c.translate((vw-W*viewScale)/2,H*.9-FY*viewScale);c.scale(viewScale,viewScale);if(shake>0)c.translate(R(-1,1)*shake*16,R(-1,1)*shake*12);
 c.translate(zf.x,zf.y);c.scale(zm,zm);c.translate(-zf.x,-zf.y);

 const dark=Math.max(0,...P.map(p=>p.a&&p.a.type==4?Math.min(1,p.a.t/.5)*(p.a.t<ATK[4].ti+.3?1:0):0));if(dark){c.fillStyle=`rgba(25,0,50,${dark*.55})`;c.fillRect(-60,-60,W+120,H+120)}
 [...P].sort((a,b)=>(a.a?1:0)-(b.a?1:0)).forEach(p=>drawF(c,p));
 FX.forEach(f=>{if(f.t<0)return;const u=f.t/f.d;
  if(f.k=='img'&&f.im.naturalWidth){const s=f.s*(.5+Math.min(1,f.t/.1)*.8),w=f.im.width*s,h=f.im.height*s;c.save();c.globalAlpha=1-u*u;c.translate(f.x,f.y);c.rotate(f.rot);c.drawImage(f.im,-w/2,-h/2,w,h);c.restore()}
  else if(f.k=='ring'){c.strokeStyle=`rgba(${f.col},${1-u})`;c.lineWidth=10*(1-u)+1;c.beginPath();c.ellipse(f.x,f.y,f.R*u,f.R*u*.45,0,0,6.3);c.stroke()}
  else if(f.k=='ball'){const x=f.x+(f.x1-f.x)*u,dir=f.x1>f.x?1:-1;for(let i=5;i>=0;i--){const bx=x-i*18*dir,r=(f.big?44:34)-i*4,g=c.createRadialGradient(bx,f.y,2,bx,f.y,r);g.addColorStop(0,`rgba(255,255,255,${.9-i*.14})`);g.addColorStop(.4,`rgba(${f.col},${.7-i*.1})`);g.addColorStop(1,`rgba(${f.col},0)`);c.fillStyle=g;c.beginPath();c.arc(bx,f.y,r,0,6.3);c.fill()}}
  else if(f.k=='star'){const x=f.x+(f.x1-f.x)*u;c.save();c.translate(x,f.y);c.rotate(f.t*30);c.fillStyle=`rgb(${f.col})`;c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();for(let i=0;i<8;i++){const r=i%2?7:22,an=i*Math.PI/4;c.lineTo(Math.cos(an)*r,Math.sin(an)*r)}c.closePath();c.fill();c.stroke();c.restore()}
  else if(f.k=='col'){const hh=260*Math.min(1,u*3),g=c.createLinearGradient(0,FY,0,FY-260);g.addColorStop(0,`rgba(${f.col||'255,160,40'},${.9*(1-u)})`);g.addColorStop(1,'rgba(255,80,20,0)');c.fillStyle=g;c.fillRect(f.x-60,FY-hh,120,hh)}
  else if(f.k=='clone'){const q=f.p,w=q.im.width/q.im.height*FH;c.save();c.globalAlpha=(1-u)*.8;c.translate(f.x,FY-u*20);c.scale(q.face,1);c.drawImage(q.aura,-w/2,-FH,w,FH);c.restore()}});
 PT.forEach(o=>{const k=o.l/o.m;c.fillStyle=`rgba(${o.c},${Math.min(1,k*1.4)*(o.c=='210,195,170'?.5:1)})`;if(o.rock)c.fillRect(o.x,o.y,o.r,o.r*.8);else{c.beginPath();c.arc(o.x,o.y,o.r*(o.c=='210,195,170'?.6+.8*(1-k):.4+.6*k),0,6.3);c.fill()}});
 POP.forEach(q=>{const u=q.t/1.2,sc=u<.12?.6+u/.12*.5:1.1-.1*Math.min(1,u*2);c.save();c.globalAlpha=Math.min(1,(1-u)*2.5);c.translate(q.x,q.y-u*40);c.scale(sc,sc);c.font='34px "Russo One",Impact,sans-serif';c.textAlign='center';c.lineWidth=7;c.strokeStyle='#120c2a';c.strokeText(q.text,0,0);c.fillStyle=q.col;c.fillText(q.text,0,0);
  if(q.ic&&AI[q.ic].naturalWidth){const tw=c.measureText(q.text).width;c.drawImage(AI[q.ic],-tw/2-48,-34,42,42)}c.restore()});
 if(dark){const g=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.9);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(10,0,30,${dark*.7})`);c.fillStyle=g;c.fillRect(-60,-60,W+120,H+120)}
 if(flash>0){c.fillStyle=`rgba(255,255,255,${flash*.8})`;c.fillRect(-60,-60,W+120,H+120)}
 c.restore()}
function loop(ts){if(isSolo){const dt=Math.min(.05,(ts-last)/1000);last=ts;if(run&&!over&&gen?.solo)gen.solo.tick(dt,P[1]?.state==='ask',ok=>resolve(P[1],ok?P[1].q.ci:(P[1].q.ci+1)%4));upd(dt);draw();raf=requestAnimationFrame(loop)}else{const dt=Math.min(.05,(ts-last)/1000);last=ts;upd(dt);draw();raf=requestAnimationFrame(loop)}}
return{AS,open(g,t){sel.g=String(g);sel.t=t;$("#cls").hidden=true;$("#setup").hidden=false;$("#game").hidden=true;$("#go").disabled=false}}
})(document.getElementById('rootB'),context.topics,{exit:onExit});engine.open(context.grade,context.topicIndex);};
