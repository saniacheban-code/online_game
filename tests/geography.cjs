const fs=require('fs'),vm=require('vm'),assert=require('assert');let seed=197327;const math=Object.create(Math);math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const c={Math:math};vm.createContext(c);for(const f of ['core/registry.js','core/teaching.js','content/geography/generator.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);const subject=c.Arena.getSubject('geography'),parse=s=>Number(s.replaceAll('−','-').replace(',','.')),round=n=>Math.round((n+Number.EPSILON)*100)/100;
let tasks=0,examples=0,pairTasks=0;const skills=new Set();
function audit(q){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(q.correctIndex>=0&&q.correctIndex<4);assert(!/undefined|NaN|Infinity/.test(q.prompt));const a=q.audit;assert(a);let value;
 switch(a.kind){
 case 'fact':case 'theory-number':assert.equal(q.choices[q.correctIndex],a.expected);return;
 case 'pairs':{const map=Object.fromEntries(a.truth),truth=a.pairs.map(([term,property])=>map[term]===property);assert.equal(truth.filter(Boolean).length,a.findFalse?3:1);assert.equal(truth[0],!a.findFalse);assert.equal(q.choices[q.correctIndex],a.expected);pairTasks++;return}
 case 'scale':value=a.target===0?a.cm*a.denominator/1e5:a.target===1?a.cm:a.denominator;break;
 case 'temperature':value=a.target?Math.max(...a.values)-Math.min(...a.values):a.values.reduce((x,y)=>x+y,0)/a.values.length;break;
 case 'altitude':value=a.initial-a.rise/100*a.gradient;break;
 case 'precipitation':{const total=a.values.reduce((x,y)=>x+y,0);value=a.target?a.values[0]/total*100:total;break}
 case 'humidity':value=a.target?a.max*a.p/100:a.p;break;
 case 'salinity':value=a.target?a.salinity:a.water*a.salinity;break;
 case 'river-flow':value=a.target?a.speed:a.width*a.depth*a.speed;break;
 case 'river-slope':value=(a.source-a.mouth)/(a.target?a.length:1);break;
 case 'density':value=a.target?a.area*a.density:a.density;break;
 case 'demography':value=a.target===0?a.birth-a.death:a.target===1?a.population*a.birth/1000:a.population*(a.birth-a.death)/1000;break;
 case 'migration':value=a.arrived+(a.target?a.left:-a.left);break;
 case 'urbanization':value=a.target?a.total*a.p/100:a.p;break;
 case 'resources':value=a.target?a.production:a.reserves/a.production;break;
 case 'share':value=a.target?a.total*a.p/100:a.p;break;
 case 'growth':value=a.target?a.after/a.before*100:(a.after-a.before)/a.before*100;break;
 case 'per-capita':value=a.gdp*1e9/(a.people*1e6);break;
 case 'trade':value=a.exports+(a.target?a.imports:-a.imports);break;
 case 'environment':value=a.target?a.current:(a.baseline-a.current)/a.baseline*100;break;
 case 'balance':value=a.before+a.birth-a.death+a.arrived-a.left;break;
 case 'chart':value=a.target===0?a.values.reduce((x,y)=>x+y,0):a.target===1?a.values.reduce((x,y)=>x+y,0)/a.values.length:Math.max(...a.values)-Math.min(...a.values);break;
 default:throw Error('Missing audit '+a.kind);
 }assert.equal(parse(q.choices[q.correctIndex]),round(value),JSON.stringify(q));assert.equal(q.value??round(value),round(value));
}
for(const [grade,topics]of Object.entries(subject.topics)){
 for(let quarter=1;quarter<=4;quarter++)assert(topics.some(t=>!t.mixed&&t.quarter===quarter));
 for(const topic of topics)for(const game of ['planes','fighters','towers','cyber','maze','race','forest','runner'])for(const mode of ['two','solo']){
  const next=subject.createSession({grade:+grade,topicIndex:topic.index,game,mode,difficulty:1});
  for(let k=0;k<24;k++){const player=k%2,q=next(player,k%3);audit(q);tasks++;skills.add(q.skill);assert.equal(q.subjectId,'geography');assert.equal(q.metadata.grade,+grade);assert(q.t>0);assert(q.level>=1&&q.level<=3);
   if(+grade===7)assert(!['demographyCalc','density','urbanization','migration','perCapita','tradeCalc','gis','indicators'].includes(q.skill));if(+grade<9)assert(!['perCapita','tradeCalc','kzRelief','kzWaters'].includes(q.skill));if(+grade<10)assert(!['gis','quality','geoecology'].includes(q.skill));
   if(topic.mixed){const actual=topics.find(t=>t.id===q.metadata.topicId);assert(actual&&!actual.mixed);if(topic.quarter)assert.equal(actual.quarter,topic.quarter)}else assert.equal(q.metadata.topicId,topic.id);
   if(mode==='solo'){const h=next.solo.lesson(q);assert(h.includes(q.rawQuestion));assert(!/Помощник по (биологии|химии|физике)/.test(h));if(q.geographyHelp.example){audit(q.geographyHelp.example);assert.notEqual(q.geographyHelp.example.prompt,q.rawQuestion);examples++}}
   if(mode==='two'&&game==='towers')for(const a of q.choices)assert(/^[−\d,]+$/.test(a));next.answer(player,k%9!==8);
  }
 }
}
const topic=subject.topics[8].find(t=>t.id==='geography-8-flow'),s=subject.createSession({grade:8,topicIndex:topic.index,game:'fighters',mode:'solo'});assert.equal(s(0).level,1);for(let i=0;i<2;i++)s.answer(0,true);assert.equal(s(0).level,2);for(let i=0;i<2;i++)s.answer(0,true);assert.equal(s(0).level,3);s.answer(0,false);assert.equal(s(0).level,2);assert.equal(s(1).level,1);s.reset();assert.equal(s(0).level,1);
const runner=subject.createSession({grade:8,topicIndex:topic.index,game:'runner',mode:'two'});for(let lane=0;lane<3;lane++){const q=runner(0,lane);assert.equal(q.level,lane+1);assert.equal(q.points,lane+1)}
// Verify important unit conversions and sign conventions from visible wording.
for(const [grade,id,pattern,expected]of [[7,'map',/Масштаб карты 1:100000\. Между точками на карте 5 см/,5],[9,'indicators',/ВВП 40 млрд денежных единиц за год, население 4 млн/,10000]]){
 const t=subject.topics[grade].find(t=>t.id==='geography-'+grade+'-'+id),next=subject.createSession({grade,topicIndex:t.index,game:'runner',mode:'two'});let found=false;for(let i=0;i<6000;i++){const q=next(0,0);if(pattern.test(q.prompt)){assert.equal(parse(q.choices[q.correctIndex]),expected);found=true;break}}assert(found,'Fixture not exercised: '+id)
}
const migrationTopic=subject.topics[8].find(t=>t.id==='geography-8-urban'),migration=subject.createSession({grade:8,topicIndex:migrationTopic.index,game:'runner',mode:'two'});let negativeChecked=false;for(let i=0;i<1000;i++){const q=migration(0,0),m=q.prompt.match(/прибыло (\d+) человек, выбыло (\d+).*сальдо/);if(m&&+m[2]>+m[1]){assert.equal(parse(q.choices[q.correctIndex]),+m[1]-+m[2]);negativeChecked=true;break}}assert(negativeChecked,'Negative migration fixture missing');
const catalog={subjectId:'geography',name:'География',grades:Object.fromEntries(Object.entries(subject.topics).map(([g,items])=>[g,items.map(({modelKeys,...t})=>({...t,templates:modelKeys}))])),seniorTrack:'ЕМН',sources:'sources.json'};fs.writeFileSync('content/geography/topics.json',JSON.stringify(catalog,null,2)+'\n');console.log(`Geography: ${tasks} tasks, ${examples} analogous examples, ${pairTasks} comparison tasks, ${skills.size} models; unit/sign fixtures, grade boundaries, coach sync, adaptive levels and lanes passed.`);
