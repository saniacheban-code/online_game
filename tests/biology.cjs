const fs=require('fs'),vm=require('vm'),assert=require('assert');let seed=197307;const math=Object.create(Math);math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const c={Math:math};vm.createContext(c);for(const f of ['core/registry.js','core/teaching.js','content/biology/generator.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);const subject=c.Arena.getSubject('biology'),parse=s=>Number(s.replaceAll('−','-').replace(',','.')),round=n=>Math.round((n+Number.EPSILON)*100)/100;
let tasks=0,examples=0,pairTasks=0;const skills=new Set();
function audit(q){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(q.correctIndex>=0&&q.correctIndex<4);assert(!/undefined|NaN|Infinity/.test(q.prompt));const a=q.audit;assert(a);let value;
 switch(a.kind){
 case 'fact':case 'theory-number':assert.equal(q.choices[q.correctIndex],a.expected);return;
 case 'pairs':{const map=Object.fromEntries(a.truth),truth=a.pairs.map(([term,property])=>map[term]===property);assert.equal(truth.filter(Boolean).length,a.findFalse?3:1);assert.equal(truth[0],!a.findFalse);assert.equal(q.choices[q.correctIndex],a.expected);pairTasks++;return}
 case 'magnification':value=a.inverse===0?a.factor:a.inverse===1?a.actual:a.actual*a.factor/1000;break;
 case 'population':value=a.start+a.b-a.d+a.incoming-a.outgoing;break;
 case 'energy':value=a.base*(a.p/100)**a.steps;break;
 case 'efficiency':value=a.p;break;
 case 'pulse':value=a.count/a.seconds*60*a.time;break;
 case 'ventilation':value=a.target?a.volume:a.volume*a.frequency;break;
 case 'dna':value=a.target?50-a.p:a.p;break;
 case 'dna-bonds':value=a.at*2+a.gc*3;break;
 case 'mitosis-count':value=a.start*2**a.cycles;break;
 case 'chromosomes':value=a.diploid/(a.target===0?2:1);break;
 case 'monohybrid':{let good=0;for(const x of a.parents[0])for(const y of a.parents[1]){const genotype=[x,y].sort().join('');if(a.target==='A_'?genotype.includes('A'):genotype===a.target)good++}value=good/4*100;break}
 case 'dihybrid':{let good=0;const gametes=['AB','Ab','aB','ab'];for(const x of gametes)for(const y of gametes){const dominantA=x[0]==='A'||y[0]==='A',dominantB=x[1]==='B'||y[1]==='B';const match={aabb:!dominantA&&!dominantB,A_B_:dominantA&&dominantB,A_bb:dominantA&&!dominantB,aaB_:!dominantA&&dominantB};if(match[a.target])good++}value=good/16*100;break}
 case 'hardy':value=2*a.q*(1-a.q)*100;break;
 case 'density':value=a.count/a.area*(a.target?100:1);break;
 default:throw Error('Missing audit '+a.kind);
 }assert.equal(parse(q.choices[q.correctIndex]),round(value),JSON.stringify(q));assert.equal(q.value??round(value),round(value));
}
for(const [grade,topics]of Object.entries(subject.topics)){
 for(let q=1;q<=4;q++)assert(topics.some(t=>!t.mixed&&t.quarter===q));
 for(const topic of topics)for(const game of ['planes','fighters','towers','cyber','maze','race','forest','runner'])for(const mode of ['two','solo']){
  const next=subject.createSession({grade:+grade,topicIndex:topic.index,game,mode,difficulty:1});
  for(let k=0;k<24;k++){const player=k%2,q=next(player,k%3);audit(q);tasks++;skills.add(q.skill);assert.equal(q.subjectId,'biology');assert.equal(q.metadata.grade,+grade);assert(q.t>0);assert(q.level>=1&&q.level<=3);
   if(+grade===7)assert(!['dna','dnaBonds','magnification','monohybrid','dihybrid','hardy'].includes(q.skill));if(+grade<10)assert(!['dihybrid','hardy'].includes(q.skill));if(+grade<11)assert(!['hardy','dnaTheory'].includes(q.skill));
   if(topic.mixed){const actual=topics.find(t=>t.id===q.metadata.topicId);assert(actual&&!actual.mixed);if(topic.quarter)assert.equal(actual.quarter,topic.quarter)}else assert.equal(q.metadata.topicId,topic.id);
   if(mode==='solo'){const h=next.solo.lesson(q);assert(h.includes(q.rawQuestion));assert(!/Помощник по (химии|физике)/.test(h));if(q.biologyHelp.example){audit(q.biologyHelp.example);assert.notEqual(q.biologyHelp.example.prompt,q.rawQuestion);examples++}}
   if(mode==='two'&&game==='towers')for(const a of q.choices)assert(/^[−\d,]+$/.test(a));next.answer(player,k%9!==8);
  }
 }
}
const selected=subject.topics[9].find(t=>t.id==='biology-9-genetics'),s=subject.createSession({grade:9,topicIndex:selected.index,game:'fighters',mode:'solo'});assert.equal(s(0).level,1);for(let i=0;i<2;i++)s.answer(0,true);assert.equal(s(0).level,2);for(let i=0;i<2;i++)s.answer(0,true);assert.equal(s(0).level,3);s.answer(0,false);assert.equal(s(0).level,2);assert.equal(s(1).level,1);s.reset();assert.equal(s(0).level,1);
const runner=subject.createSession({grade:9,topicIndex:selected.index,game:'runner',mode:'two'});for(let lane=0;lane<3;lane++){assert.equal(runner(0,lane).level,lane+1);assert.equal(runner(0,lane).points,lane+1)}
// Fixed scientific examples checked from the generated wording, independently of audit fields.
for(const [grade,id,pattern,expected]of [[9,'genetics',/Скрещивание Aa × Aa.*генотипа aa/,25],[10,'genetics',/Скрещивание AaBb × AaBb.*класса aabb/,6.25],[11,'hardy',/Частота a равна 0,2/,32]]){
 const topic=subject.topics[grade].find(t=>t.id==='biology-'+grade+'-'+id),next=subject.createSession({grade,topicIndex:topic.index,game:'runner',mode:'two'});let found=false;for(let i=0;i<2000;i++){const q=next(0,grade===9?0:2);if(pattern.test(q.prompt)){assert.equal(parse(q.choices[q.correctIndex]),expected);found=true;break}}assert(found,'Fixture not exercised: '+id)
}
const catalog={subjectId:'biology',name:'Биология',grades:Object.fromEntries(Object.entries(subject.topics).map(([g,items])=>[g,items.map(({modelKeys,...t})=>({...t,templates:modelKeys}))])),seniorTrack:'ЕМН',sources:'sources.json'};fs.writeFileSync('content/biology/topics.json',JSON.stringify(catalog,null,2)+'\n');console.log(`Biology: ${tasks} tasks, ${examples} analogous examples, ${pairTasks} comparison tasks, ${skills.size} models; scientific fixtures, grade boundaries, coach sync, adaptive levels and lanes passed.`);
