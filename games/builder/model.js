(function(g){
 'use strict';
 class Round{
  constructor(){this.reset()}
  reset(){this.time=0;this.remaining=150;this.phase='ready';this.players=[0,1].map(()=>({floors:[],good:0,errors:0,fallen:false,fallAt:0,offset:0}));this.events=[]}
  start(){this.reset();this.phase='play'}
  place(player,correct){const p=this.players[player];if(this.phase!=='play'||!p||p.fallen)return false;if(correct)p.good++;else{p.errors++;p.offset+=((p.errors%2)?1:-.4)*(player?-1:1)*8}p.floors.push({good:correct,x:p.offset,angle:correct?0:((p.errors%2)?1:-1)*(.045+p.errors*.009),at:this.time,id:p.floors.length});this.events.push({type:correct?'floor':'crooked',player});if(p.errors===6){p.fallen=true;p.fallAt=this.time;this.events.push({type:'collapse',player})}if(this.players.every(p=>p.fallen))this.phase='finished';return true}
  tick(dt){if(this.phase!=='play')return;dt=Math.max(0,Number.isFinite(dt)?dt:0);const elapsed=Math.min(this.remaining,dt);this.time+=elapsed;this.remaining=Math.max(0,this.remaining-elapsed);if(this.remaining<1e-8){this.remaining=0;this.phase='finished'}}
  pause(){if(this.phase==='play')this.phase='paused';else if(this.phase==='paused')this.phase='play'}
  result(){const [a,b]=this.players;if(a.fallen&&b.fallen)return null;if(a.fallen!==b.fallen)return a.fallen?1:0;if(a.good!==b.good)return a.good>b.good?0:1;if(a.errors!==b.errors)return a.errors<b.errors?0:1;return null}
 }
 g.BuilderModel={Round,DURATION:150,MAX_ERRORS:6};
})(globalThis);
