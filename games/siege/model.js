(function(global){
 'use strict';
 const AMMO=8,GROUND=430,WIDTH=1440,HEIGHT=540,GRAVITY=760,STEP=1/120;
 const MATERIAL={wood:{hp:85,factor:1.05,color:'#b98245'},stone:{hp:120,factor:.55,color:'#d9cda9'},glass:{hp:55,factor:1.5,color:'#8be3e2'},roof:{hp:75,factor:1,color:'#70beb5'},core:{hp:95,factor:.8,color:'#72d4fa'}};
 function fort(owner){const parts=[],add=(x,y,w,h,material,sprite,supports=[],needed=1)=>{const body={id:parts.length,owner,x:owner?x:-x,y,w,h,material,sprite,supports,needed,max:MATERIAL[material].hp,hp:MATERIAL[material].hp,dead:false,falling:false,angle:0,vx:0,vy:0,spin:0,hit:new Set()};parts.push(body);return body.id};
  const feet=[-64,0,64].map(x=>add(x,-37,26,74,'wood',4,[]));
  const beam=add(0,-85,174,22,'wood',5,feet,2);
  const left=add(-62,-135,28,78,'stone',6,[beam]);
  const right=add(62,-135,28,78,'stone',6,[beam]);
  add(0,-132,78,70,'glass',7,[beam]);
  const upper=add(0,-185,176,22,'wood',5,[left,right],1);
  add(0,-230,188,70,'roof',owner?9:8,[upper]);
  add(0,-218,48,52,'core',11,[upper]);
  return{owner,x:owner?1080:360,parts,total:parts.reduce((s,b)=>s+b.max,0),damage:0};
 }
 function segment(x0,y0,x1,y1,body,r=12){let low=0,high=1;for(const [start,end,min,max]of [[x0,x1,body.x-body.w/2-r,body.x+body.w/2+r],[y0,y1,body.y-body.h/2-r,body.y+body.h/2+r]]){const d=end-start;if(Math.abs(d)<1e-9){if(start<min||start>max)return null;continue}let a=(min-start)/d,b=(max-start)/d;if(a>b)[a,b]=[b,a];low=Math.max(low,a);high=Math.min(high,b);if(low>high)return null}return low>=0&&low<=1?low:null}
 class Battle{
  constructor(){this.reset()}
  reset(){this.forts=[fort(0),fort(1)];this.shots=[];this.particles=[];this.events=[];this.time=0;this.accumulator=0;this.serial=0;this.shake=0}
  remaining(owner){return this.forts[owner].parts.reduce((s,b)=>s+b.hp,0)}
  percentage(attacker){const target=this.forts[1-attacker];return 100*(target.total-this.remaining(1-attacker))/target.total}
  target(attacker,zone){const f=this.forts[1-attacker],alive=f.parts.filter(b=>!b.dead);let pool=alive.filter(b=>zone===0?b.y>-100:zone===1?b.y<=-100&&b.y>-195:b.y<=-195);if(!pool.length)pool=alive;if(!pool.length)return{x:f.x,y:GROUND-40};pool.sort((a,b)=>a.hp/a.max-b.hp/b.max||Math.abs(a.x)-Math.abs(b.x)||a.id-b.id);const b=pool[0];return{x:f.x+b.x,y:GROUND+b.y}}
  launch(attacker,zone,correct){const start={x:attacker?1295:145,y:GROUND-53},target=this.target(attacker,zone),duration=1.35;if(!correct){target.x=attacker?1010:430;target.y=GROUND+65}const shot={id:++this.serial,attacker,correct,zone,x:start.x,y:start.y,oldX:start.x,oldY:start.y,vx:(target.x-start.x)/duration,vy:(target.y-start.y-.5*GRAVITY*duration**2)/duration,t:0,duration,done:false,trail:[]};this.shots.push(shot);this.events.push({type:'launch',attacker,correct});return shot}
  burst(x,y,color,n=18){for(let i=0;i<n;i++){const angle=(i*2.399963+this.serial*.6),speed=30+(i%7)*19;this.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-65,age:0,life:.45+(i%5)*.13,size:2+(i%4),color})}if(this.particles.length>240)this.particles.splice(0,this.particles.length-240)}
  breakBody(f,b,direction){if(b.dead)return;b.hp=0;b.dead=true;b.falling=true;b.vx=direction*(12+(b.id%4)*7);b.vy=-16;b.spin=direction*(.35+(b.id%3)*.2);this.burst(f.x+b.x,GROUND+b.y,MATERIAL[b.material].color,13);this.events.push({type:'break',owner:f.owner,body:b.id})}
  reduce(f,b,amount,direction){if(b.dead||amount<=0)return;const before=b.hp;b.hp=Math.max(0,b.hp-Math.round(amount));if(b.hp===0)this.breakBody(f,b,direction);else if(before!==b.hp)this.burst(f.x+b.x,GROUND+b.y,MATERIAL[b.material].color,4)}
  supports(f,direction){let changed=true;while(changed){changed=false;for(const b of f.parts){if(b.dead||!b.supports.length)continue;const n=b.supports.filter(id=>!f.parts[id].dead).length;if(n<b.needed){this.breakBody(f,b,direction);changed=true}}}}
  impact(shot,body,x,y){const f=this.forts[1-shot.attacker],direction=shot.attacker?-1:1;const before=this.remaining(f.owner);this.reduce(f,body,58*MATERIAL[body.material].factor,direction);for(const b of f.parts){if(b===body||b.dead)continue;const distance=Math.hypot(f.x+b.x-x,GROUND+b.y-y);if(distance<88)this.reduce(f,b,24*(1-distance/88)*MATERIAL[b.material].factor,direction)}this.supports(f,direction);this.shake=.2;this.burst(x,y,'#ffdf88',26);this.events.push({type:'impact',attacker:shot.attacker,x,y,damage:before-this.remaining(f.owner)})}
  tick(dt){this.time+=dt;this.shake=Math.max(0,this.shake-dt);
   for(const s of this.shots){if(s.done)continue;const x0=s.x,y0=s.y;s.oldX=x0;s.oldY=y0;s.vy+=GRAVITY*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.t+=dt;if(s.trail.length===0||s.t-s.trail.at(-1).t>.04)s.trail.push({x:s.x,y:s.y,t:s.t});if(s.trail.length>13)s.trail.shift();
    if(s.correct){const f=this.forts[1-s.attacker];let found=null;for(const b of f.parts){if(b.dead)continue;const hit=segment(x0-f.x,y0-GROUND,s.x-f.x,s.y-GROUND,b);if(hit!==null&&(!found||hit<found.hit))found={b,hit}}if(found){s.done=true;this.impact(s,found.b,x0+(s.x-x0)*found.hit,y0+(s.y-y0)*found.hit)}}
    if(!s.done&&(s.y>GROUND+45||s.t>2.4||s.x<0||s.x>WIDTH)){s.done=true;this.burst(s.x,Math.min(s.y,GROUND+10),s.correct?'#ceb482':'#79b4ae',8);this.events.push({type:'miss',attacker:s.attacker})}
   }
   this.shots=this.shots.filter(s=>!s.done);
   for(const f of this.forts){const direction=f.owner===0?-1:1;for(const b of f.parts){if(!b.falling)continue;const bottom=b.y+b.h/2;b.vy+=GRAVITY*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.angle+=b.spin*dt;
     for(const other of f.parts){if(other.dead||b.hit.has(other.id)||Math.abs(b.x-other.x)>(b.w+other.w)*.45)continue;const top=other.y-other.h/2;if(b.vy>0&&bottom<=top+4&&b.y+b.h/2>=top){b.hit.add(other.id);this.reduce(f,other,Math.min(48,Math.abs(b.vy)*.13),direction);b.vy*=-.12}}
     if(b.y+b.h/2>=0){b.y=-b.h/2;b.vy*=-.17;b.vx*=.5;b.spin*=.65;if(Math.abs(b.vy)<8){b.vy=0;b.falling=false}}}
    this.supports(f,direction);f.damage=f.total-this.remaining(f.owner);
   }
   for(const p of this.particles){p.age+=dt;p.vy+=GRAVITY*.4*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}this.particles=this.particles.filter(p=>p.age<p.life);
  }
  step(dt){this.accumulator+=Math.max(0,Math.min(.25,dt));while(this.accumulator+1e-10>=STEP){this.tick(STEP);this.accumulator-=STEP}}
  busy(attacker){return this.shots.some(s=>s.attacker===attacker)}
  moving(){return this.shots.length>0||this.forts.some(f=>f.parts.some(b=>b.falling&&Math.abs(b.vy)>8))}
  result(){const a=this.percentage(0),b=this.percentage(1);return Math.abs(a-b)<1e-7?null:a>b?0:1}
 }
 global.SiegeModel={Battle,AMMO,GROUND,WIDTH,HEIGHT,MATERIAL,segment};
})(globalThis);
