const fs=require('fs'),vm=require('vm'),assert=require('assert'),{spawnSync}=require('child_process');let seed=197337;const math=Object.create(Math);math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const c={Math:math};vm.createContext(c);for(const f of ['core/registry.js','core/teaching.js','content/informatics/generator.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);const subject=c.Arena.getSubject('informatics'),parse=s=>Number(s.replaceAll('−','-').replace(',','.')),round=n=>Math.round((n+Number.EPSILON)*100)/100;
let tasks=0,examples=0,pairTasks=0;const skills=new Set(),fixtures=new Map();
function audit(q){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(q.correctIndex>=0&&q.correctIndex<4);assert(!/undefined|NaN|Infinity/.test(q.prompt));const a=q.audit;assert(a);let value;
 switch(a.kind){
 case 'fact':case 'theory-number':assert.equal(q.choices[q.correctIndex],a.expected);return;
 case 'pairs':{const map=Object.fromEntries(a.truth),truth=a.pairs.map(([term,property])=>map[term]===property);assert.equal(truth.filter(Boolean).length,a.findFalse?3:1);assert.equal(truth[0],!a.findFalse);assert.equal(q.choices[q.correctIndex],a.expected);pairTasks++;return}
 case 'python':case 'sql':case 'graph':{const fixture={...a,expected:parse(q.choices[q.correctIndex])};const key=JSON.stringify(a);if(fixtures.has(key))assert.equal(fixtures.get(key).expected,fixture.expected);fixtures.set(key,fixture);assert(Number.isFinite(fixture.expected));return}
 case 'bit-pattern':value=a.target?[...a.bits].filter(x=>x==='1').length:a.bits.length;break;
 case 'fixed-code':value=a.symbols.length*(a.target?1:2);break;
 case 'pixels':value=a.target?a.h:a.w*a.h;break;
 case 'robot-turns':value=(a.start+a.n*a.angle)%360;break;
 case 'robot-distance':value=(a.steps-a.back)*a.length;break;
 case 'multiply':value=a.a*a.b;break;
 case 'file-size':value=a.n*a.bytesPerChar*(a.target?8:1);break;
 case 'transfer':value=a.target?a.speed:a.size*8/a.speed;break;
 case 'game-position':value=a.x+(a.frames-a.back)*a.dx;break;
 case 'base-conversion':value=parseInt(a.digits,a.base);break;
 case 'boolean':{const A=!!a.a,B=!!a.b,C=!!a.d;value=Number(a.expr==='A OR B'?A||B:a.expr==='A AND B'?A&&B:a.expr==='NOT A AND B'?!A&&B:(A||B)&&!C);break}
 case 'power-two':value=2**a.n;break;
 case 'image-volume':value=a.w*a.h*a.depth/8;break;
 case 'table-formula':value=a.l===1?a.a+a.b:a.l===2?a.a+a.b*a.d:(a.a+a.b)*a.d;break;
 case 'table-stats':value=a.target===0?a.values.reduce((x,y)=>x+y,0):a.target===1?Math.min(...a.values):a.target===2?Math.max(...a.values):a.values.reduce((x,y)=>x+y,0)/a.values.length;break;
 case 'filter-count':value=a.values.filter(x=>x>=a.low&&(!a.between||x<=a.high)).length;break;
 case 'neuron':{const sum=a.w1*a.x+a.w2*a.y+a.bias;value=a.target?Number(sum>=a.threshold):sum;break}
 case 'accuracy':value=a.correct/a.total*100;break;
 case 'sensor':value=a.values.filter(x=>a.greater?x>a.threshold:x>=a.threshold).length;break;
 case 'storage':value=Math.floor(a.free/a.size);break;
 case 'alphabet-volume':value=a.target===0?Math.log2(a.alphabet):a.target===1?a.length*Math.log2(a.alphabet):a.length;break;
 case 'configuration-cost':{const total=a.prices[0]+a.prices[1]+a.prices[2]*a.quantity;value=a.l===3?a.budget-total:total;break}
 default:throw Error('Missing audit '+a.kind);
 }assert.equal(parse(q.choices[q.correctIndex]),round(value),JSON.stringify(q));assert.equal(q.value??round(value),round(value));
}
for(const [grade,topics]of Object.entries(subject.topics)){
 for(let quarter=1;quarter<=4;quarter++)assert(topics.some(t=>!t.mixed&&t.quarter===quarter));
 for(const topic of topics)for(const game of ['planes','fighters','towers','cyber','maze','race','forest','runner'])for(const mode of ['two','solo']){
  const next=subject.createSession({grade:+grade,topicIndex:topic.index,game,mode,difficulty:1});
  for(let k=0;k<24;k++){const player=k%2,q=next(player,k%3);audit(q);tasks++;skills.add(q.skill);assert.equal(q.subjectId,'informatics');assert.equal(q.metadata.grade,+grade);assert(q.t>0);assert(q.level>=1&&q.level<=3);
   if(+grade===5)assert(!['linear','branch','fileRead','forLoop','whileLoop','arrayIndex','sqlQuery','binaryConversion','boolean','alphabetVolume'].includes(q.skill));if(+grade===6)assert(!['branch','fileRead','forLoop','whileLoop','arrayIndex','sqlQuery','binaryConversion','boolean'].includes(q.skill));if(+grade===7)assert(!['forLoop','whileLoop','loopControl','arrayIndex','sqlQuery','binaryConversion','boolean'].includes(q.skill));if(+grade<9)assert(!['arrayIndex','arraySearch','matrix','sorting','gamePosition'].includes(q.skill));if(+grade<10)assert(!['functionCall','stringLength','binaryConversion','boolean','truthRows','sqlQuery','graph'].includes(q.skill));if(+grade<11)assert(!['neuron','accuracy','sensor'].includes(q.skill));
   if(topic.mixed){const actual=topics.find(t=>t.id===q.metadata.topicId);assert(actual&&!actual.mixed);if(topic.quarter)assert.equal(actual.quarter,topic.quarter)}else assert.equal(q.metadata.topicId,topic.id);
   if(mode==='solo'){const h=next.solo.lesson(q);assert(h.includes(q.rawQuestion));assert(!/Помощник по (географии|биологии|химии|физике)/.test(h));if(q.informaticsHelp.example){audit(q.informaticsHelp.example);assert.notEqual(q.informaticsHelp.example.prompt,q.rawQuestion);examples++}}
   if(mode==='two'&&game==='towers')for(const a of q.choices)assert(/^[−\d,]+$/.test(a));next.answer(player,k%9!==8);
  }
 }
}
const selected=subject.topics[6].find(t=>t.id==='informatics-6-linear'),source=subject.createSession({grade:6,topicIndex:selected.index,game:'fighters',mode:'solo'});assert.equal(source(0).level,1);source.answer(0,true);source.answer(0,true);assert.equal(source(0).level,2);source.answer(0,true);source.answer(0,true);assert.equal(source(0).level,3);source.answer(0,false);assert.equal(source(0).level,2);assert.equal(source(1).level,1);source.reset();assert.equal(source(0).level,1);
const runner=subject.createSession({grade:6,topicIndex:selected.index,game:'runner',mode:'two'});for(let lane=0;lane<3;lane++){const q=runner(0,lane);assert.equal(q.level,lane+1);assert.equal(q.points,lane+1)}
const child=spawnSync('python3',['-I','tests/check-informatics.py'],{input:JSON.stringify([...fixtures.values()]),encoding:'utf8',maxBuffer:2e6});assert.equal(child.status,0,child.stderr||child.error?.message);const execution=JSON.parse(child.stdout);assert(execution.python>500);assert(execution.sql>20);assert(execution.graph>20);
const catalog={subjectId:'informatics',name:'Информатика',grades:Object.fromEntries(Object.entries(subject.topics).map(([g,items])=>[g,items.map(({modelKeys,...t})=>({...t,templates:modelKeys}))])),seniorTrack:'ЕМН',sources:'sources.json'};fs.writeFileSync('content/informatics/topics.json',JSON.stringify(catalog,null,2)+'\n');console.log(`Informatics: ${tasks} tasks, ${examples} analogous examples, ${pairTasks} comparison tasks, ${skills.size} models; independent executions ${JSON.stringify(execution)}; grade boundaries, coach sync and adaptive levels passed.`);
fs.writeFileSync('docs/informatics-execution.json',JSON.stringify({tasks,examples,pairTasks,models:skills.size,execution},null,2)+'\n');
