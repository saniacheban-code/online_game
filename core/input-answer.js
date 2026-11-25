(function(global){
 'use strict';
 const plain=html=>String(html).replace(/<span class="fr"><i>(.*?)<\/i><b>(.*?)<\/b><\/span>/g,(_,a,b)=>a+'/'+b).replace(/<sup>(.*?)<\/sup>/g,'^($1)').replace(/<sub>(.*?)<\/sub>/g,'_$1').replace(/<[^>]*>/g,'').replace(/&minus;/g,'−').replace(/&nbsp;|&#160;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').trim();
 function value(text){const s=plain(text).replace(/[−–]/g,'-').replace(/,/g,'.').trim();if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)){const n=Number(s);return Number.isFinite(n)?n:null}let m=s.match(/^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)$/);if(m){const n=Number(m[1])/Number(m[2]);return Number(m[2])!==0&&Number.isFinite(n)?n:null}m=s.match(/^([+-]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);if(m&&+m[4]!==0)return(m[1]==='-'?-1:1)*(+m[2]+m[3]/m[4]);return null}
 function prepare(task){const choices=task.choices||task.o,index=task.correctIndex??task.ci,answer=plain(choices[index]),numeric=value(answer),prompt=task.prompt||task.q;
  if(numeric!==null)return{task,prompt,expected:numeric,numbered:false};
  return{task,prompt:prompt+'<p class="siege-number-hint">Введите номер выбранного ответа.</p><ol class="siege-statements">'+choices.map(s=>'<li>'+s+'</li>').join('')+'</ol>',expected:index+1,numbered:true};
 }
 function check(text,expected){const n=value(text);return{valid:n!==null,correct:n!==null&&Math.abs(n-expected)<=1e-8*Math.max(1,Math.abs(expected))}}
 global.Arena.inputAnswer={plain,value,prepare,check};
})(globalThis);
