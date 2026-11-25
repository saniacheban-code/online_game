const fs=require('fs'),vm=require('vm'),assert=require('assert');
// Reproducible sampling plus independent checks against element masses and reaction stoichiometry.
let seed=973731;const math=Object.create(Math);math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const c={Math:math};vm.createContext(c);for(const f of ['core/registry.js','core/teaching.js','content/chemistry/generator.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const subject=c.Arena.getSubject('chemistry'),masses={H:1,C:12,N:14,O:16,Na:23,Mg:24,Al:27,Si:28,P:31,S:32,Cl:35.5,K:39,Ca:40,Fe:56,Cu:64,Zn:65},round=n=>Math.round((n+Number.EPSILON)*100)/100,parse=s=>Number(s.replaceAll('−','-').replace(',','.'));
const oxidation={'H₂SO₄':6,'SO₂':4,'HNO₃':5,'NH₃':-3,'KMnO₄':7,'Fe₂O₃':3};
let checked=0,examples=0;const kinds=new Set(),skills=new Set();
function audit(q){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(q.correctIndex>=0&&q.correctIndex<4);assert(!/undefined|NaN|Infinity/.test(q.prompt));const a=q.audit;assert(a);kinds.add(a.kind);let expected;
 switch(a.kind){
 case 'concept':assert.equal(q.choices[q.correctIndex],a.expected);return;
 case 'theory-number':assert.equal(q.choices[q.correctIndex],a.expected);return;
 case 'atom':expected=[a.z,a.a-a.z,a.z-a.charge][a.target];break;
 case 'mr':expected=Object.entries(a.composition).reduce((s,[e,n])=>s+masses[e]*n,0)*a.mult;break;
 case 'missing-index':expected=(a.total-a.other)/a.ar;break;
 case 'count':expected=(a.element?a.composition[a.element]:Object.values(a.composition).reduce((s,n)=>s+n,0))*a.k;break;
 case 'fraction':expected=a.part/a.total*100;break;
 case 'conservation':expected=a.complex?a.a+a.b-a.c:a.b;break;
 case 'multiply':expected=a.a*a.b;break;
 case 'divide':expected=a.a/a.b;break;
 case 'coefficient':expected=a.i<0?a.coeff.reduce((s,n)=>s+n,0):a.coeff[a.i];break;
 case 'stoich':expected=a.n/a.a*a.b*a.m;break;
 case 'solution':expected=a.target===1?a.total*a.w/100:a.w*a.total/(a.total+a.added);break;
 case 'rate-factor':expected=a.a**a.power*a.b;break;
 case 'equilibrium':expected=a.hi**2/(a.h*a.i);break;
 case 'isotope':expected=(a.a*a.p+a.b*(100-a.p))/100;break;
 case 'ph':expected=a.base?14-a.p:a.p;break;
 case 'organic':expected=2*a.n+[2,0,-2][a.type]+(a.level===3?12*a.n:0);break;
 case 'oxidation':expected=oxidation[a.formula];break;
 case 'impurity':expected=a.total*(100-a.p)/100/100*44;break;
 case 'limiting':expected=Math.min(a.h,2*a.o);break;
 case 'subtract-one':expected=a.n-1;break;
 default:throw Error('Missing independent audit: '+a.kind);
 }assert.equal(parse(q.choices[q.correctIndex]),round(expected),JSON.stringify(q));assert.equal(round(q.value??expected),round(expected));
}
const games=['planes','fighters','towers','cyber','maze','race','forest','runner'];
for(const [grade,topics]of Object.entries(subject.topics)){
 assert(topics.filter(t=>!t.mixed).length>=12);for(let quarter=1;quarter<=4;quarter++)assert(topics.some(t=>t.quarter===quarter&&!t.mixed));
 for(const topic of topics)for(const game of games)for(const mode of ['two','solo']){
  const source=subject.createSession({grade:+grade,topicIndex:topic.index,game,mode,difficulty:1});
  for(let k=0;k<24;k++){const player=k%2,q=source(player,k%3);assert.equal(q.subjectId,'chemistry');assert.equal(q.metadata.grade,+grade);assert(q.t>0);assert(q.level>=1&&q.level<=3);audit(q);checked++;skills.add(q.skill);if(topic.mixed){const actual=topics.find(t=>t.id===q.metadata.topicId);assert(actual&&!actual.mixed);if(topic.quarter)assert.equal(actual.quarter,topic.quarter)}else assert.equal(q.metadata.topicId,topic.id);
   if(mode==='solo'){const h=source.solo.lesson(q);assert(h.includes(q.rawQuestion));assert(h.includes(q.chemistryHelp.rule.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));if(q.chemistryHelp.example){const e=q.chemistryHelp.example;assert.notEqual(e.prompt,q.rawQuestion);audit(e);examples++}}
   if(game==='towers'&&mode==='two')for(const answer of q.choices)assert(/^[−\d,]+$/.test(answer));
   if(grade==='7')assert(!['atom','mole','gas','stoich','fraction','ph','equilibrium','rateFactor'].includes(q.skill),'Grade 7 cannot include later calculation methods');
   source.answer(player,k%9!==8);
  }
 }
}
const source=subject.createSession({grade:8,topicIndex:4,game:'fighters',mode:'solo'});assert.equal(source(0).level,1);source.answer(0,true);source.answer(0,true);assert.equal(source(0).level,2);source.answer(0,true);source.answer(0,true);assert.equal(source(0).level,3);source.answer(0,false);assert.equal(source(0).level,2);assert.equal(source(1).level,1);source.reset();assert.equal(source(0).level,1);
const runner=subject.createSession({grade:8,topicIndex:4,game:'runner',mode:'two'});for(let lane=0;lane<3;lane++){const q=runner(0,lane);assert.equal(q.level,lane+1);assert.equal(q.points,lane+1)}
// Known-answer fixtures exercise source text as well as numeric metadata.
for(const [grade,id,regex,answer]of [[7,'atom',/Z = 8, A = 16.*нейтронов/,8],[8,'equations',/H₂ \+ O₂ → H₂O.*сумму/,5],[11,'ph',/\[H⁺\] = 10⁻³/,3]]){
 const topic=subject.topics[grade].find(t=>t.id.endsWith('-'+id)),s=subject.createSession({grade,topicIndex:topic.index,game:'runner',mode:'two'});let found=false;for(let i=0;i<3000;i++){const q=s(0,1);if(regex.test(q.prompt)){assert.equal(parse(q.choices[q.correctIndex]),answer);found=true;break}}assert(found,'Fixture never exercised '+id);
}
const catalog={subjectId:'chemistry',name:'Химия',grades:Object.fromEntries(Object.entries(subject.topics).map(([g,items])=>[g,items.map(({modelKeys,...topic})=>({...topic,templates:modelKeys}))])),track:'10–11 классы — ЕМН',source:'sources.json'};fs.writeFileSync('content/chemistry/topics.json',JSON.stringify(catalog,null,2)+'\n');
console.log(`Chemistry: ${checked} tasks, ${examples} worked examples, ${skills.size} models, ${kinds.size} audit types; grade boundaries, numeric answers, tutor sync, adaptive levels and lanes passed.`);
