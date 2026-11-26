(function(g){
 'use strict';
 const trigger=document.getElementById('arenaHelpToggle');
 if(!trigger)return;
 const solo=document.body.dataset.playMode==='solo',lanes=document.body.dataset.gameId==='runner',turnBased=document.body.dataset.gameId==='expedition';
 const original=g.configureArena;
 if(typeof original!=='function')return;
 let current=new Map(),source=null,dialog=null,content=null,player=0,lane=lanes?1:0;
 const key=(p,l)=>p+':'+l;
 function render(){
  if(!dialog?.open)return;
  const q=current.get(key(player,lanes?lane:0));
  dialog.querySelectorAll('[data-help-player]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.helpPlayer===player)));
  dialog.querySelectorAll('[data-help-lane]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.helpLane===lane)));
  const title=(solo?'Ваше задание':'Игрок '+(player+1))+(lanes?' · Полоса +'+(lane+1):'');
  dialog.querySelector('#arenaHelpContext').textContent=title;
  if(!q){content.innerHTML='<p>Начните игру или откройте задание. Здесь появятся правило и пример именно для выбранного вопроса.</p>';content.dataset.question='';return}
  const explain=source?.studyLesson||source?.solo?.lesson;
  try{
   content.innerHTML=explain?explain(q):'<p>Объяснение не подключено. Вернитесь к выбору темы и откройте игру из обновлённого сборника.</p>';
   content.dataset.question=q.rawQuestion||q.prompt||q.q||'';
  }catch(e){content.textContent='Не удалось показать объяснение. Вернитесь к выбору темы и откройте игру заново.'}
 }
 function expanded(value){trigger.setAttribute('aria-expanded',String(value));document.getElementById('soloStudyExpand')?.setAttribute('aria-expanded',String(value))}
 function mount(){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.id='arenaHelpDialog';dialog.className='arena-help-dialog';
  dialog.setAttribute('aria-labelledby','arenaHelpTitle');dialog.setAttribute('aria-describedby','arenaHelpContext');
  dialog.innerHTML='<header class="arena-help-header"><h2 id="arenaHelpTitle">Объяснение и пример</h2><button type="button" data-help-close aria-label="Закрыть объяснение">Закрыть ✕</button></header><nav class="arena-help-options" aria-label="Выбор задания для объяснения">'+(!solo?'<div class="arena-help-tabs" role="group" aria-label="Игрок"><button type="button" data-help-player="0">Игрок 1</button><button type="button" data-help-player="1">Игрок 2</button></div>':'')+(lanes?'<div class="arena-help-tabs" role="group" aria-label="Полоса">'+[0,1,2].map(i=>'<button type="button" data-help-lane="'+i+'">Полоса +'+(i+1)+'</button>').join('')+'</div>':'')+'</nav><p id="arenaHelpContext" class="arena-help-context"></p><div id="arenaHelpContent" class="arena-help-content" tabindex="0" aria-label="Правило и учебный пример"></div>';
  document.body.appendChild(dialog);content=dialog.querySelector('#arenaHelpContent');
  dialog.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-help-close')){close();return}if(b.dataset.helpPlayer!==undefined){player=+b.dataset.helpPlayer;content.scrollTop=0}if(b.dataset.helpLane!==undefined){lane=+b.dataset.helpLane;content.scrollTop=0}render()});
  dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
  dialog.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close()}});
  dialog.addEventListener('close',()=>expanded(false));
 }
 function open(){mount();if(lanes){const selected=document.querySelector('.lane-hit.active[data-p="'+player+'"]'),value=Number(selected?.dataset.lane);if(Number.isInteger(value)&&value>=0&&value<=2)lane=value}if(!dialog.open)dialog.showModal();expanded(true);render()}
 function close(){if(!dialog?.open)return false;dialog.close();expanded(false);trigger.focus?.();return true}
 trigger.addEventListener('click',open);
 // Keep lane selection aligned with the lane the pupil selected in the runner.
 if(lanes)document.addEventListener('click',e=>{const b=e.target.closest?.('[data-lane]');if(!b||b.dataset.lane===undefined)return;const p=Number(b.dataset.p??0),l=Number(b.dataset.lane);if((!solo||p===0)&&l>=0&&l<=2){player=p;lane=l;render()}},true);
 g.configureArena=function(next,...args){
  close();source=next;current.clear();player=0;lane=lanes?1:0;
  const tracked=function(p=0,...rest){const q=next(p,...rest);if((!solo||p===0)&&q){const l=lanes?Number(rest[0]??0):0;current.set(key(p,l),q);if(turnBased)player=p;if(p===player&&l===(lanes?lane:0))render()}return q};
  Object.assign(tracked,next);
  tracked.answer=(...a)=>next.answer?.(...a);
  tracked.reset=(...a)=>{current.clear();render();return next.reset?.(...a)};
  return original.call(this,tracked,...args);
 };
 g.ArenaMobileHelp={open,close,refresh:render};
})(window);
