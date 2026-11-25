const assert=require('assert');require('../games/siege/model.js');const {Battle,segment}=global.SiegeModel;
assert.strictEqual(segment(-100,0,100,0,{x:0,y:0,w:10,h:10},0),.475);
assert.strictEqual(segment(-100,50,100,50,{x:0,y:0,w:10,h:10},0),null);
function wait(b,seconds=4,dt=1/60){for(let t=0;t<seconds-1e-6;t+=dt)b.step(dt)}
for(const zone of [0,1,2]){const a=new Battle(),b=new Battle();for(let n=0;n<8;n++){const before=a.percentage(0);a.launch(0,zone,true);b.launch(1,zone,true);wait(a);wait(b);assert(a.percentage(0)>=before);assert(Math.abs(a.percentage(0)-b.percentage(1))<1e-7,'mirror fairness');assert(a.forts.flatMap(f=>f.parts).every(p=>p.hp>=0&&p.hp<=p.max))}assert(a.percentage(0)>70);assert.equal(a.percentage(1),0)}
const miss=new Battle();for(let n=0;n<8;n++){miss.launch(n%2,n%3,false);wait(miss)}assert.equal(miss.percentage(0)+miss.percentage(1),0);assert.equal(miss.result(),null);
const a=new Battle(),b=new Battle();a.launch(0,0,true);b.launch(0,0,true);wait(a,4,1/30);wait(b,4,1/120);assert.equal(a.remaining(1),b.remaining(1));assert.equal(a.result(),0);
const collapse=new Battle(),f=collapse.forts[1];collapse.reduce(f,f.parts[0],999,1);collapse.reduce(f,f.parts[1],999,1);collapse.supports(f,1);assert(f.parts[3].dead&&f.parts[8].dead&&f.parts[9].dead);assert(f.parts[8].falling);wait(collapse);assert(f.parts[8].angle!==0);collapse.reset();assert.equal(collapse.remaining(0),collapse.remaining(1));assert.equal(collapse.shots.length,0);
console.log('Siege physics: three aim zones, progressive damage, mirrored fairness, misses, support collapse, debris, frame independence, reset and result passed.');
