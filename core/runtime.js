(function(global){
 'use strict';
 const mode=document.body.dataset.playMode==='solo'?'solo':'two';
 global.Arena={mode,randomInt:(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick:items=>items[Math.floor(Math.random()*items.length)],
  nativeSession:next=>({next,answer:(i,ok)=>next.answer?.(i,ok),reset:()=>next.reset?.(),state:i=>next.state?.(i),solo:next.solo}),
  renderCoach(root,selector,q,control){control?.render(root,selector,q)}
 };
})(globalThis);
