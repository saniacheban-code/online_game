'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ids=['math','physics','chemistry','biology','geography','informatics','natural-science','russian','english','kazakhstan-history','world-history','kazakh','world-around','literacy','literary-reading','music-primary','visual-art','handicraft'];
let themes=0,flows=0;
for(const id of ids){
 const c={console};vm.createContext(c);
 const extra=['world-around','literacy','literary-reading','music-primary','visual-art','handicraft'].includes(id)?['core/primary-content.js','content/'+id+'/data.js']:['russian','english','kazakhstan-history','world-history','kazakh'].includes(id)?['content/'+id+'/bank-data.js','content/'+id+'/topics-data.js']:id==='natural-science'?['content/natural-science/facts-data.js']:[];
 for(const file of ['core/registry.js','core/teaching.js','core/task-help.js','core/games.js',...extra,'content/'+id+'/generator.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
 const A=c.Arena,subject=A.getSubject(id);
 function verify(grade,topic,game,mode){
  const source=subject.createSession({grade,topicIndex:topic.index,mode,game});
  const wrapped=A.attachGameHelp(source,subject,game,grade);assert.equal(wrapped,source);
  const q=wrapped(0,game==='runner'?1:0),html=wrapped.studyLesson(q);
  assert(html.includes('пример')||html.includes('Пример'),id+' '+topic.title+' example');
  const rules=[...html.matchAll(/class="solo-rule">([\s\S]*?)<\/div>/g)];
  assert(rules.length&&rules.every(m=>m[1].replace(/<[^>]*>/g,'').trim().length>5),id+' '+grade+' '+topic.title+' '+game+' '+mode+' missing rule');
  if(!q.parts)assert(html.includes(q.rawQuestion||q.q),id+' current question');
  assert.equal(q.subjectId,id);flows++;
 }
 // Every topic in both modes, with the three task representations that differ by game.
 for(const [g,topics]of Object.entries(subject.topics))for(const topic of topics){themes++;for(const mode of ['solo','two'])for(const game of ['planes','towers','runner'])verify(+g,topic,game,mode)}
 // Every registered game also uses each subject's actual lower/upper-grade task factory.
 const grades=Object.keys(subject.topics).map(Number);
 for(const grade of [grades[0],grades.at(-1)])for(const game of A.listGames())for(const mode of ['solo','two'])verify(grade,subject.topics[grade][0],game.id,mode);
}
console.log('Mobile help content:',themes,'topics,',flows,'actual task/helper flows; all 18 subjects and all 18 games in both modes have current-question rules and examples.');
