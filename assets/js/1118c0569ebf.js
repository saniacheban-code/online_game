
// Вписывание всей видимой сцены. Управление игрой и её состояние не изменяются.
(()=>{
 const root=document.documentElement,bar=document.getElementById('arenaDisplayBar'),stage=document.getElementById('arenaFitStage');if(!bar||!stage)return;
 const full=bar.querySelector('.arena-fullscreen'),button=document.createElement('button');button.type='button';button.className='arena-fit-button';button.id='arenaFitToggle';button.setAttribute('aria-label','Вместить все элементы в экран');bar.insertBefore(button,full);
 let enabled=true,scheduled=false,fitting=false,lastScale=1;
 try{const parentValue=window.parent.__arenaFitEnabled;enabled=typeof parentValue==='boolean'?parentValue:localStorage.getItem('arena.display.fit')!=='0'}catch(e){}
 const shown=el=>{if(!el||el.hidden)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).display!=='none'};
 const setScale=(scale,w,h)=>{
  lastScale=scale;stage.dataset.fitScale=String(scale);stage.style.width=(w/scale)+'px';stage.style.height=(h/scale)+'px';stage.style.transform=`scale(${scale})`;
  stage.style.setProperty('--arena-available-h',(h/scale)+'px');
  const head=stage.querySelector('.cyber-nav')||stage.querySelector(':scope>.nav')||stage.querySelector(':scope>.top')||stage.querySelector(':scope>header');
  if(head)root.style.setProperty('--arena-head-h',Math.ceil(head.getBoundingClientRect().height/scale)+'px');
 };
 const bounds=scale=>{
  const modals=[...stage.querySelectorAll('.modal,.shade,.modal-overlay,#ov')].filter(shown),modal=modals.at(-1);
  if(modal){
   const card=modal.querySelector('#sheet,.sheet,.card,.modal-card');
   if(card){const style=getComputedStyle(modal),r=card.getBoundingClientRect();return{width:Math.max(card.scrollWidth,r.width/scale)+(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0),height:Math.max(card.scrollHeight,r.height/scale)+(parseFloat(style.paddingTop)||0)+(parseFloat(style.paddingBottom)||0)}}
   const rects=[...modal.children].filter(shown).map(el=>el.getBoundingClientRect());
   if(rects.length)return{width:Math.max(modal.clientWidth,(Math.max(...rects.map(r=>r.right))-Math.min(...rects.map(r=>r.left)))/scale),height:Math.max(modal.clientHeight,(Math.max(...rects.map(r=>r.bottom))-Math.min(...rects.map(r=>r.top)))/scale+24)};
  }
  const r=stage.getBoundingClientRect(),visible=[...stage.children].filter(el=>el.tagName!=='SCRIPT'&&shown(el)),rects=visible.map(el=>el.getBoundingClientRect());
  return{width:Math.max(stage.scrollWidth,...rects.map(x=>(x.right-r.left)/scale),1),height:Math.max(stage.scrollHeight,...rects.map(x=>(x.bottom-r.top)/scale),1)};
 };
 function fit(){
  scheduled=false;if(fitting)return;fitting=true;
  try{
   root.dataset.arenaFit=enabled?'on':'off';button.setAttribute('aria-pressed',String(enabled));button.textContent=enabled?'Вместить: вкл':'Вместить: выкл';button.title=enabled?'Весь интерфейс на экране без прокрутки. Нажмите, чтобы вернуть крупный режим с прокруткой.':'Нажмите, чтобы разместить весь интерфейс на одном экране';
   if(enabled&&document.body.dataset.comfort==='on'){setScale(1,window.innerWidth,Math.max(160,window.innerHeight-bar.getBoundingClientRect().height));stage.dataset.fitPercent='100';return}
   if(!enabled){stage.style.width='';stage.style.height='';stage.style.transform='';stage.style.removeProperty('--arena-available-h');stage.dataset.fitScale='1';lastScale=1;return}
   if((window.scrollX||window.scrollY)&&window.scrollTo)window.scrollTo(0,0);
   const w=Math.max(1,root.clientWidth||window.innerWidth),barH=shown(bar)?bar.getBoundingClientRect().height:0,h=Math.max(1,(window.visualViewport?.height||window.innerHeight)-barH);
   root.style.setProperty('--arena-bar-h',Math.ceil(barH)+'px');
   if([...document.querySelectorAll('iframe')].some(shown)){setScale(1,w,h);return}
   let scale=1;for(let n=0;n<14;n++){
    setScale(scale,w,h);const size=bounds(scale),ratio=Math.min(1,w/(size.width*scale),h/(size.height*scale));
    if(ratio>=.998)break;scale=Math.max(.08,scale*ratio*.994);
   }
   // Найти наибольший читаемый масштаб после изменения количества колонок.
   let lower=scale,upper=1;
   for(let n=0;n<8&&upper-lower>.001;n++){
    const mid=(lower+upper)/2;setScale(mid,w,h);const size=bounds(mid);
    if(size.width*mid<=w+.5&&size.height*mid<=h+.5)lower=mid;else upper=mid;
   }
   scale=lower;setScale(scale,w,h);
   stage.dataset.fitPercent=String(Math.round(scale*100));
  }finally{fitting=false}
 }
 function schedule(){if(scheduled)return;scheduled=true;window.requestAnimationFrame(fit)}
 function toggle(value,save=false){enabled=!!value;if(save){try{localStorage.setItem('arena.display.fit',enabled?'1':'0')}catch(e){}try{window.parent.__arenaFitEnabled=enabled;if(window.parent!==window)window.parent.postMessage({type:'arena-display-fit',value:enabled},'*')}catch(e){}}schedule()}
 button.addEventListener('click',()=>toggle(!enabled,true));window.addEventListener('resize',schedule);window.addEventListener('orientationchange',schedule);document.addEventListener('fullscreenchange',schedule);if(window.visualViewport)window.visualViewport.addEventListener('resize',schedule);
 window.addEventListener('message',e=>{if(e.data?.type!=='arena-display-fit'||typeof e.data.value!=='boolean')return;const trusted=e.source===window.parent||[...document.querySelectorAll('iframe')].some(f=>f.contentWindow===e.source);if(trusted)toggle(e.data.value)});
 if(typeof ResizeObserver==='function'){const ro=new ResizeObserver(schedule);ro.observe(bar);ro.observe(document.body)}
 if(typeof MutationObserver==='function'){
  const watched='.modal,.shade,.modal-overlay,#ov,#hub,#hubBody,#sheet,#card,#setup,#game,.question,.q,.ex,.math-question,.problem,.question-copy,.claim,.feedback,.status,.status-msg,.task,.answer-options,.math-gate';
  new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'?(r.attributeName==='hidden'||r.target.matches?.(watched)):r.target.matches?.(watched)||[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('button,input,select')||n.querySelector('button,input,select')))))schedule()}).observe(stage,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
 }
 document.addEventListener('load',e=>{if(e.target?.tagName==='IMG')schedule()},true);document.fonts?.ready.then(schedule);schedule();
})();

