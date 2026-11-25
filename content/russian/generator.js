(function(){
 'use strict';
 const bank=Arena.russianBank,topics=Arena.russianTopics;
 if(!bank||!topics)throw Error('Не загружен банк русского языка');
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),shuffle=a=>{a=[...a];for(let i=a.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 function make(key,variant,level,grade){
  const skill=bank[key],rows=skill.rows,index=variant%rows.length,row=rows[index],stem=r=>r.prompt+(rows.filter(x=>x.prompt===r.prompt).length>1?' Вариант ученика для редактирования: «'+r.wrong[0]+'».':'');let prompt,right,wrong,steps,rule=skill.rule,audit;
  if(skill.kind==='reading'){
   const q=row.questions[level-1];prompt='<div class="language-passage">'+esc(row.text)+'</div><br>'+esc(q.prompt);right=q.answer;wrong=q.wrong;steps=['Прочитайте текст и вопрос.',q.explanation,'Ответ: '+right+'.'];
   rule=level===1?'Тема охватывает весь текст. Не подменяйте её отдельной подробностью.':level===2?'Найдите в тексте слова, которые отвечают на вопрос. Отличайте прямо названное от того, чего автор не сообщал.':'Проверьте, следует ли вывод из текста. Учитывайте ограничения, условия, степень уверенности и смысловые связи.';
   audit={kind:'reading',key,index,question:level-1,expected:right};
  }else{
   const max=grade<=4?2:3,others=shuffle(rows.map((_,i)=>i).filter(i=>i!==index));let count=Math.min(max,level);
   // Long punctuation choices stay a single editorial exercise so the interface remains legible.
   if(skill.kind==='select'&&(row.prompt.length>95||[row.answer,...row.wrong].some(s=>s.length>45)))count=1;
   const indices=[index,...others.slice(0,count-1)],selected=indices.map(i=>rows[i]);
   if(count===1){prompt=esc(stem(row));right=row.answer;wrong=row.wrong;steps=[row.explanation,'Верный вариант: '+right+'.'];
    if(level===2)prompt+=' Проверьте смысл и форму каждого варианта.';
    if(level===3){const incorrect=row.wrong[variant%3];prompt+=' Ученик выбрал: «'+esc(incorrect)+'». Найдите исправление.';steps.unshift('Проверьте предложенный учеником вариант по правилу.');}
   }else{
    prompt=(count===2?'Выберите вариант, в котором верно выполнены ОБА пункта.':'Выберите вариант, в котором верно выполнены ВСЕ ТРИ пункта.')+'<br>'+selected.map((r,i)=>(i+1)+'. '+esc(stem(r))).join('<br>');
    right=selected.map((r,i)=>(i+1)+') '+r.answer).join('; ');
    wrong=[0,1,2].map(k=>selected.map((r,i)=>(i+1)+') '+(i===k%count?r.wrong[Math.floor(k/count)%3]:r.answer)).join('; '));
    steps=selected.map((r,i)=>(i+1)+'. '+r.explanation+' Верный вариант: '+r.answer+'.');
   }
   audit={kind:'language',key,indices,expected:right,count};
  }
  const plain=shuffle([right,...wrong]);if(plain.length!==4||new Set(plain).size!==4)throw Error('Неоднозначные варианты: '+key);
  return{prompt,choices:plain.map(esc),correctIndex:plain.indexOf(right),numeric:false,rule,formula:'',steps,audit};
 }
 for(const [key,s]of Object.entries(bank)){
  if(s.rows.length<2)throw Error('Мало примеров: '+key);
  for(const r of s.rows)for(const q of s.kind==='reading'?r.questions:[r])if(q.wrong.length!==3||new Set([q.answer,...q.wrong]).size!==4)throw Error('Ошибка вариантов: '+key);
 }
 function explain(task){if(!task?.q||!task.russianHelp)return '<div class="solo-coach-head">Помощник по русскому языку</div><p>Начните игру, чтобы увидеть правило и пример к своему вопросу.</p>';const h=task.russianHelp,e=h.example;return '<div class="solo-coach-head">Помощник · '+esc(task.topic)+'</div><h3>Сейчас решаем</h3><div class="solo-current">'+task.rawQuestion+'</div><h3>Правило</h3><div class="solo-rule">'+esc(h.rule)+'</div><h3>Аналогичный пример</h3><div class="solo-example">'+e.prompt+'</div><ol class="solo-steps">'+e.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><p class="solo-try">Примените тот же способ к своему заданию.</p>'}
 function createSession(options){const grade=+options.grade,selected=topics[grade]?.[options.topicIndex];if(!selected)throw Error('Тема русского языка не найдена');const mode=options.mode||'two',lanes=options.game==='runner',opponent=mode==='solo'?Arena.createOpponent({grade,kind:options.game,profile:options.difficulty,lesson:explain}):null,pool=selected.mixed?topics[grade].filter(t=>!t.mixed&&(!selected.quarter||t.quarter===selected.quarter)):[selected];let serial=0;
  const fresh=()=>({level:1,streak:0,correct:0,errors:0,recent:[],bags:new Map(),topicBag:[]});let states=[fresh(),fresh()];
  function source(player=0,lane=0){player=player===1?1:0;const s=states[player],level=lanes?Math.max(1,Math.min(3,lane+1)):s.level;if(!s.topicBag.length)s.topicBag=shuffle(pool);const topic=s.topicBag.pop(),bagKey=topic.id+':'+level;let bag=s.bags.get(bagKey);if(!bag?.length){bag=shuffle(topic.modelKeys.flatMap(key=>bank[key].rows.map((_,variant)=>({key,variant}))));s.bags.set(bagKey,bag)}let spec=bag.pop(),raw;
   for(let n=0;n<20;n++){raw=make(spec.key,spec.variant,level,grade);const signature=raw.prompt+'|'+raw.choices[raw.correctIndex];if(!s.recent.includes(signature))break;if(bag.length)spec=bag.pop()}
   s.recent.push(raw.prompt+'|'+raw.choices[raw.correctIndex]);if(s.recent.length>12)s.recent.shift();let example;
   for(let n=1;n<20;n++){const e=make(spec.key,spec.variant+n,level,grade);if(e.prompt!==raw.prompt){example=e;break}}
   if(!example)throw Error('Нет аналогичного примера: '+spec.key);
   const result={...raw,q:raw.prompt,rawQuestion:raw.prompt,o:raw.choices,ci:raw.correctIndex,skill:spec.key,topic:topic.title,level,streak:s.streak,uid:++serial,points:lanes?level:undefined,t:opponent?(player===1?3600:opponent.time(level)):(grade===2?[60,75,90]:[45,60,75])[level-1],russianHelp:{rule:raw.rule,formula:'',steps:raw.steps,example},metadata:{subjectId:'russian',topicId:topic.id,quarter:topic.quarter,grade,templateId:spec.key+':'+spec.variant}};
   if(options.game==='towers'&&mode==='two'){const statements=[...raw.choices],expected=String(raw.correctIndex+1);result.q=raw.prompt+'<br>Введите номер ответа.<br>'+statements.map((x,i)=>(i+1)+') '+x).join('<br>');result.rawQuestion=result.q;result.prompt=result.q;result.o=result.choices=['1','2','3','4'];result.ci=result.correctIndex=+expected-1;result.audit={kind:'theory-number',expected,source:raw.audit};}
   return result;
  }
  source.answer=(player,ok)=>{const s=states[player===1?1:0];opponent?.record(player,ok);if(ok){s.correct++;s.streak++;if(s.streak%2===0)s.level=Math.min(3,s.level+1)}else{s.errors++;s.streak=0;s.level=Math.max(1,s.level-1)}};
  source.reset=()=>{states=[fresh(),fresh()];serial=0;opponent?.reset()};source.state=p=>{const s=states[p===1?1:0];return{level:s.level,streak:s.streak,correct:s.correct,errors:s.errors}};source.solo=opponent;if(opponent)opponent.preview={topic:selected.title};return Arena.taskSession(source,{subjectId:'russian',grade,topicId:selected.id});
 }
 Arena.registerSubject({id:'russian',name:'Русский язык',topics,description:'2–11 классы, с русским языком обучения; 10–11 — ЕМН. Игровая практика основных языковых умений.',createSession,renderHelp:explain,bank});
})();
