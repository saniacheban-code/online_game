(function(global){
 'use strict';
 const subjects=new Map(),games=new Map();
 const assert=(condition,message)=>{if(!condition)throw new Error(message)};
 function registerSubject(subject){assert(subject&&/^[a-z][a-z0-9-]*$/.test(subject.id),'Некорректный код предмета');assert(!subjects.has(subject.id),'Предмет уже подключён: '+subject.id);assert(subject.name&&subject.topics&&typeof subject.createSession==='function','Неполное описание предмета');subjects.set(subject.id,Object.freeze(subject));return subject}
 function registerGame(game){assert(game&&/^[a-z][a-z0-9-]*$/.test(game.id),'Некорректный код игры');assert(!games.has(game.id),'Игра уже подключена: '+game.id);assert(game.title&&game.directory&&game.modes?.length,'Неполное описание игры');games.set(game.id,Object.freeze(game));return game}
 function taskSession(source,context){assert(typeof source==='function','Генератор заданий не подключён');let serial=0;
  const next=(player=0,lane=0)=>{const raw=source(player,lane),prompt=raw?.prompt??raw?.q,choices=raw?.choices??raw?.o,correctIndex=raw?.correctIndex??raw?.ci;
   assert(typeof prompt==='string'&&prompt.length,'Задание без вопроса');assert(Array.isArray(choices)&&choices.length>=2&&choices.every(x=>typeof x==='string'),'Задание без вариантов');assert(Number.isInteger(correctIndex)&&correctIndex>=0&&correctIndex<choices.length,'Ответ задания не найден');
   const seconds=raw.seconds??raw.t??60;assert(Number.isFinite(seconds)&&seconds>0,'Некорректное время задания');
   return {...raw,id:raw.id||context.subjectId+'-'+(++serial),subjectId:context.subjectId,metadata:{...context,...raw.metadata},type:raw.type||'choice',prompt,choices,correctIndex,seconds,q:prompt,o:choices,ci:correctIndex,t:seconds};
  };
  next.answer=(player,ok)=>source.answer?.(player,!!ok);next.reset=()=>{serial=0;source.reset?.()};next.state=player=>source.state?.(player);next.solo=source.solo;next.context=Object.freeze({...context});return next;
 }
 global.Arena={registerSubject,registerGame,taskSession,getSubject:id=>subjects.get(id),getGame:id=>games.get(id),listSubjects:()=>[...subjects.values()],listGames:()=>[...games.values()]};
})(globalThis);
