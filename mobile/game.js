// Keep a focused answer reachable after keyboard and orientation viewport changes.
(function(){
 'use strict';
 const root=document.documentElement;
 const editable=el=>el?.matches?.('input:not([type=button]):not([type=submit]),textarea,[contenteditable=true]');
 let pending;
 function reveal(){const el=document.activeElement;if(editable(el)&&!el.disabled)el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'})}
 function update(){
  root.style.setProperty('--mobile-vh',(window.visualViewport?.height||innerHeight)+'px');
  root.dataset.arenaEditing=editable(document.activeElement)?'on':'off';
  clearTimeout(pending);pending=setTimeout(reveal,120);
 }
 window.visualViewport?.addEventListener('resize',update);
 window.addEventListener('resize',update);
 document.addEventListener('focusin',update);
 document.addEventListener('focusout',()=>setTimeout(update,0));
 update();
})();
(function(){const bar=document.getElementById('arenaDisplayBar');if(!bar||window.parent===window)return;const b=document.createElement('button');b.type='button';b.className='mobile-rating-button';b.textContent='★ Рейтинг';b.addEventListener('click',()=>{try{window.parent.MobileArena?.leaderboard()}catch{}});bar.appendChild(b)})();
