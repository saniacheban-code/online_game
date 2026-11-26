'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ids=['math','physics','chemistry','biology','geography','informatics','natural-science','russian','english','kazakhstan-history','world-history','kazakh','world-around','literacy','literary-reading','music-primary','visual-art','handicraft'];
const primary=new Set(['world-around','literacy','literary-reading','music-primary','visual-art','handicraft']);
const language=new Set(['russian','english','kazakhstan-history','world-history','kazakh']);
let seed=1302026;const math=Object.create(Math);math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const report={release:'Mobile 1.3',seed:1302026,subjects:[],mathTemplates:0,checks:[],limitations:['Проверены все доступные игровые темы и функции генерации математических тем и уровней; случайные числовые параметры проверяются на воспроизводимой выборке, а не на бесконечном множестве значений.','Автоматическая проверка структуры и вычислений не равнозначна независимой предметной экспертизе каждого исторического или языкового утверждения.','Доступные темы — авторский игровой отбор. Он не объявляется полным КТП и не заменяет лабораторные, творческие или устные задания.']};
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
for(const id of ids){
 const c={console,Math:math};vm.createContext(c);
 const extra=primary.has(id)?['core/primary-content.js','content/'+id+'/data.js']:language.has(id)?['content/'+id+'/bank-data.js','content/'+id+'/topics-data.js']:id==='natural-science'?['content/natural-science/facts-data.js']:[];
 for(const f of ['core/registry.js','core/teaching.js','core/task-help.js','core/input-answer.js','core/typed-answer.js',...extra])vm.runInContext(fs.readFileSync(f,'utf8'),c);
 let code=fs.readFileSync('content/'+id+'/generator.js','utf8');
 if(id==='math')code=code.replace("Arena.registerSubject({\n id:'math'","Arena.auditMath={TOP,taskTemplates,skillFor};Arena.registerSubject({\n id:'math'");
 vm.runInContext(code,c);const A=c.Arena,subject=A.getSubject(id),templates=new Set(),summary={id,name:subject.name,grades:Object.keys(subject.topics).map(Number),topics:0,questions:0,worked:0,guided:0,parallelExamples:0,ruleExamples:0,currentExamples:0};
 function verify(q,grade,topic){
  if(q.parts?.length){for(const p of q.parts)verify({...p,subjectId:id,skill:p.skill||q.skill,metadata:{...q.metadata,grade}},grade,topic);return}
  const choices=q.o||q.choices,index=q.ci??q.correctIndex;
  assert(choices?.length>=2&&new Set(choices).size===choices.length,id+' duplicate choices');assert(Number.isInteger(index)&&index>=0&&index<choices.length,id+' invalid answer index');
  const n=A.inputAnswer.value(choices[index]);if(n!==null)for(let i=0;i<choices.length;i++)if(i!==index){const wrong=A.inputAnswer.value(choices[i]);assert(wrong===null||Math.abs(wrong-n)>1e-10*Math.max(1e-12,Math.abs(n)),id+' equivalent correct/wrong choices: '+q.q)}
  const prepared=A.typedAnswer.prepare(q);assert(A.typedAnswer.check(prepared.expected,prepared).correct,id+' rejects own typed answer');
  const d=A.taskHelp.describe(q),html=A.taskHelp.render(q);assert(d.rule.length>=15,id+' missing rule: '+q.q);assert(d.steps.length>=1,id+' missing reasoning');assert(!d.steps.every(s=>/^Ответ|^Верный ответ|^Подходит:/.test(s)),id+' answer-only tutor: '+q.q);assert(!html.includes('undefined')&&!html.includes('NaN'),id+' invalid rendered tutor');
  if(id==='math'){assert(A.mathStudyGuide(q),id+' missing study guide: '+q.skill);if(grade===1&&q.skill==='shape')assert(!/призм|пирамид|многогран/.test(d.rule),'age-inappropriate shape rule');}
  if(d.example){assert(d.exampleSteps.length>=1,id+' empty example');if(d.exampleKind==='parallel'){assert(A.taskHelp.matching(q,d.example),id+' mismatched example');summary.parallelExamples++}else summary.ruleExamples++}else summary.currentExamples++;
  summary[d.kind==='worked'?'worked':'guided']++;summary.questions++;templates.add(q.metadata?.templateId||q.hintTrace?.id||q.skill||topic.id);
 }
 for(const[g,topics]of Object.entries(subject.topics))for(const topic of topics){summary.topics++;const s=subject.createSession({grade:+g,topicIndex:topic.index,mode:'solo',game:'runner'});for(let repeat=0;repeat<8;repeat++)for(let lane=0;lane<3;lane++)verify(s(0,lane),+g,topic)}
 if(id==='math'){const seen=new Set();for(const[g,topics]of Object.entries(A.auditMath.TOP))for(const topic of topics){if(topic[2]==='Повторение')continue;for(let level=1;level<=3;level++)for(const fn of A.auditMath.taskTemplates(g,topic,level))for(let i=0;i<4;i++){const q=fn();q.skill=A.auditMath.skillFor(topic);q.subjectId='math';q.metadata={grade:+g};verify(q,+g,{id:topic[0]});seen.add(q.hintTrace?.id)}}report.mathTemplates=seen.size;assert(seen.size>800,'math template coverage regressed')}
 summary.templateBranchesObserved=templates.size;report.subjects.push(summary);
}
report.questions=report.subjects.reduce((n,s)=>n+s.questions,0);report.topics=report.subjects.reduce((n,s)=>n+s.topics,0);report.checks=['Все 18 предметов, доступные классы, четверти и тематические разделы, включая повторение.','Существование правила, объяснения и примера или явно обозначенного разбора текущего вопроса.','Числовая эквивалентность вариантов ответа, приём правильного ввода, отсутствие пустых ответов и ошибок разметки.','Различение плана решения и вычисленного разбора; отсутствие неподтверждённых пошаговых объяснений.','Полные предметные проверки расчётов, чтения, соответствий, Python/SQL/графов и игровых адаптеров выполняются npm test.'];
fs.mkdirSync('docs',{recursive:true});fs.writeFileSync('docs/learning-audit.json',JSON.stringify(report,null,2)+'\n');
let md='# Проверка учебного помощника Mobile 1.3\n\nПроверено '+report.questions+' заданий; '+report.topics+' доступных тематических записей. Математика: наблюдалось '+report.mathTemplates+' идентификаторов шаблонов.\n\n| Предмет | Темы | Проверенные задания | Вычисленный/предметный разбор | План по правилу |\n|---|---:|---:|---:|---:|\n';for(const s of report.subjects)md+='| '+s.name+' | '+s.topics+' | '+s.questions+' | '+s.worked+' | '+s.guided+' |\n';md+='\n'+report.checks.map(x=>'- '+x).join('\n')+'\n\n## Границы проверки\n\n'+report.limitations.map(x=>'- '+x).join('\n')+'\n';fs.writeFileSync('docs/learning-audit.md',md);console.log('Learning audit:',report.questions,'questions,',report.topics,'topic/review entries,',report.mathTemplates,'math templates,',report.subjects.length,'subjects.');
