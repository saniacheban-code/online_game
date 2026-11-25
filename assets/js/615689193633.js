
// Общие настройки экрана. Не меняют задания, очки, таймеры или правила.
(()=>{
 const root=document.documentElement,bar=document.getElementById('arenaDisplayBar');if(!bar)return;
 bar.addEventListener('keydown',e=>e.stopPropagation());
 const picker=bar.querySelector('select'),full=bar.querySelector('button'),notice=bar.querySelector('[aria-live]');
 let mode='auto';
 try{mode=window.parent.__arenaDisplayMode||localStorage.getItem('arena.display.mode')||'auto'}catch(e){}
 if(!['auto','large','xl'].includes(mode))mode='auto';
 const measure=()=>{
  const height=bar.hidden?0:bar.getBoundingClientRect().height;
  root.style.setProperty('--arena-bar-h',Math.ceil(height)+'px');
  const head=document.querySelector('.cyber-nav')||document.querySelector('.arena-fit-stage>.nav')||document.querySelector('.arena-fit-stage>.top')||document.querySelector('.arena-fit-stage>header');
  if(head)root.style.setProperty('--arena-head-h',Math.ceil(head.getBoundingClientRect().height/(parseFloat(document.getElementById('arenaFitStage')?.dataset.fitScale)||1))+'px');
 };
 const apply=(value,save=false)=>{
  mode=value;picker.value=mode;root.dataset.arenaText=mode;
  root.style.setProperty('--arena-scale',mode==='xl'?'1.45':mode==='large'?'1.22':'1');
  if(save&&window.parent!==window){try{window.parent.postMessage({type:'arena-display-mode',value:mode},'*')}catch(e){}}
  if(save){try{localStorage.setItem('arena.display.mode',mode)}catch(e){}try{window.parent.__arenaDisplayMode=mode}catch(e){}}
  measure();window.dispatchEvent(new Event('resize'));
  if(notice)notice.textContent='Размер текста: '+picker.selectedOptions[0].textContent;
 };
 window.addEventListener('message',e=>{if(!e.data||e.data.type!=='arena-display-mode'||!['auto','large','xl'].includes(e.data.value))return;const trusted=e.source===window.parent||[...document.querySelectorAll('iframe')].some(f=>f.contentWindow===e.source);if(trusted)apply(e.data.value,false)});
 picker.addEventListener('change',()=>apply(picker.value,true));
 const fullscreenDocument=()=>{try{return window.top?.document||document}catch(e){return document}};
 full.addEventListener('click',async()=>{
  try{const host=fullscreenDocument();if(document.fullscreenElement)await document.exitFullscreen();else if(host.fullscreenElement)await host.exitFullscreen();else if(host.documentElement.requestFullscreen)await host.documentElement.requestFullscreen();else if(notice)notice.textContent='Используйте полноэкранный режим браузера'}catch(e){if(notice)notice.textContent='Полноэкранный режим доступен через меню браузера'}fullLabel();
 });
 const fullLabel=()=>{full.textContent=(document.fullscreenElement||fullscreenDocument().fullscreenElement)?'Свернуть экран':'На весь экран';full.setAttribute('aria-label',full.textContent);measure()};
 document.addEventListener('fullscreenchange',fullLabel);window.addEventListener('resize',()=>{measure();fullLabel()});window.addEventListener('orientationchange',measure);
 if(window.visualViewport)window.visualViewport.addEventListener('resize',measure);
 if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(measure);observer.observe(bar);const head=document.querySelector('.cyber-nav')||document.querySelector('.arena-fit-stage>.nav')||document.querySelector('.arena-fit-stage>.top')||document.querySelector('.arena-fit-stage>header');if(head)observer.observe(head)}
 apply(mode);fullLabel();
})();

