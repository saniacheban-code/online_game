(function(){
 'use strict';
 const profiles=[{name:'Спокойный',accuracy:.65,min:18,max:28,lead:0},{name:'Обычный',accuracy:.78,min:12,max:20,lead:1},{name:'Сильный',accuracy:.88,min:8,max:14,lead:1}];
 Arena.renderCoach=function(root,selector,q,control){if(!control||!root?.querySelector)return;const parent=root.querySelector(selector);if(!parent)return;let panel=root.querySelector('#soloCoach');if(!panel){panel=(root.ownerDocument||root).createElement('aside');panel.id='soloCoach';panel.className='solo-coach';panel.setAttribute('aria-label','Объяснение и учебный пример');parent.appendChild(panel)}panel.innerHTML=control.lesson(q||control.preview)};
 Arena.createOpponent=function({grade,kind,profile:profileIndex=0,lesson}){
  const profile={...profiles[Math.max(0,Math.min(2,profileIndex))]};let counts=[0,0],wait=0,delay=profile.min+Math.random()*(profile.max-profile.min);
  const control={profile,kind,record(i){counts[i===1?1:0]++},counts:()=>[...counts],reset(){counts=[0,0];wait=0;delay=profile.min+Math.random()*(profile.max-profile.min)},lesson:q=>Arena.taskHelp?.render(q,lesson(q,kind,grade))||lesson(q,kind,grade),tick(dt,isReady,act,free=false){if(!isReady||(!free&&counts[1]>=counts[0]+profile.lead))return;wait+=Math.min(1,Math.max(0,dt));if(wait>=delay){wait=0;delay=profile.min+Math.random()*(profile.max-profile.min);act(Math.random()<profile.accuracy)}},moveDelay:()=>profile.min,time(level){return (+grade<=2?[150,180,210]:[120,150,180])[Math.max(0,Math.min(2,(level||1)-1))]}};
  control.render=(root,selector,q)=>Arena.renderCoach(root,selector,q,control);return control;
 };
 Arena.withStudyExamples=function(source){source.studyExample=()=>'';return source};
})();
