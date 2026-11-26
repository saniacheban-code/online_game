(function(g){'use strict';
 const DISTANCE=400;
 const athlete=()=>({distance:0,speed:0,good:0,errors:0,combo:0,lock:0,stumble:0,flash:0,goodFlash:false});
 function create(mode='two'){return{mode,phase:'ready',remaining:mode==='solo'?240:180,elapsed:0,players:Array.from({length:mode==='solo'?1:2},athlete),winner:null}}
 function answer(s,i,ok){const p=s.players[i];if(s.phase!=='play'||!p||p.lock>0)return false;p.lock=ok?.85:1.5;p.flash=1.2;p.goodFlash=ok;if(ok){p.good++;p.combo++;p.speed=Math.min(9,p.speed+2.4+(p.combo>=3?.5:0));p.stumble=0}else{p.errors++;p.combo=0;p.speed*=.4;p.stumble=1.5}return true}
 const travel=(v,dt)=>{const moving=Math.min(dt,v/.025);return v*moving-.0125*moving*moving};
 function tick(s,dt){if(s.phase!=='play'||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,s.remaining);const arrivals=[];
  for(let i=0;i<s.players.length;i++){const p=s.players[i],v=p.speed,decay=.025,end=Math.max(0,v-decay*dt),distance=travel(v,dt);if(p.distance+distance>=DISTANCE){const left=DISTANCE-p.distance,t=v>0?(v-Math.sqrt(Math.max(0,v*v-2*decay*left)))/decay:dt;arrivals.push({i,t})}}
  const first=arrivals.length?Math.min(...arrivals.map(x=>x.t)):null;if(first!==null)dt=Math.min(dt,first);
  for(const p of s.players){const end=Math.max(0,p.speed-.025*dt);p.distance=Math.min(DISTANCE,p.distance+travel(p.speed,dt));p.speed=end;p.lock=Math.max(0,p.lock-dt);p.stumble=Math.max(0,p.stumble-dt);p.flash=Math.max(0,p.flash-dt)}
  s.remaining=Math.max(0,s.remaining-dt);s.elapsed+=dt;
  if(first!==null){const finishers=arrivals.filter(x=>Math.abs(x.t-first)<.001);finishers.forEach(x=>s.players[x.i].distance=DISTANCE);s.winner=finishers.length>1?'draw':finishers[0].i;s.phase='finished'}
  else if(s.remaining<=0){s.phase='finished';if(s.mode==='solo')s.winner='timeout';else{const d=s.players[0].distance-s.players[1].distance;s.winner=Math.abs(d)<.001?'draw':d>0?0:1}}
 }
 function claim(q,truth,random=Math.random){const options=q.choices||q.o,ci=q.correctIndex??q.ci,good=options[ci],wrong=options.filter((x,i)=>i!==ci&&String(x)!==String(good));truth=!!truth||!wrong.length;return{html:truth?good:wrong[Math.floor(random()*wrong.length)],truth}}
 const api={DISTANCE,create,answer,tick,claim};if(typeof module==='object'&&module.exports)module.exports=api;else g.SprintModel=api;
})(globalThis);
